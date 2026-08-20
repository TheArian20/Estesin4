(function () {
  "use strict";
  const db = window.STESIN_DB, auth = window.STESIN_AUTH;
  const conflictos = { asistencia:["estudiante_id","fecha","materia"], progreso_lectura:["usuario_id","recurso_id"], progreso_materias:["usuario_id","ciclo","materia"], entregas_tareas:["tarea_id","estudiante_id"], intentos_evaluacion:["evaluacion_id","estudiante_id"] };

  const usuarioActual = () => auth.currentUser ? { uid:auth.currentUser.uid, id:auth.currentUser.uid, email:auth.currentUser.email } : null;
  const authLista = new Promise(resolver => {
    const cancelar = auth.onAuthStateChanged(() => { cancelar(); resolver(); }, () => resolver());
  });
  const errorLegible = e => ({ message:e?.message || "No se pudo completar la operacion en Firebase.", code:e?.code });
  const tablasAuditables = new Set(["perfiles","recursos_personalizados","eventos_calendario","avisos","asistencia","tareas_academicas","evaluaciones","mensajes_internos"]);
  async function auditar(tabla, accion) {
    const usuario = usuarioActual();
    if (!usuario || !tablasAuditables.has(tabla)) return;
    await db.collection("auditoria_acciones").add({ tabla, accion, usuario_id:usuario.id, creado_en:new Date().toISOString() });
  }
  function normalizar(v) {
    if (v && typeof v.toDate === "function") return v.toDate().toISOString();
    if (Array.isArray(v)) return v.map(normalizar);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k,x]) => [k,normalizar(x)]));
    return v;
  }

  class Consulta {
    constructor(tabla) { this.tabla=tabla; this.filtros=[]; this.ordenes=[]; this.maximo=null; this.modo="select"; this.valores=null; this.unico=false; this.opcionesSeleccion={}; this.opcionesEscritura={}; }
    select(_campos,opciones){this.opcionesSeleccion=opciones||{};return this} eq(c,v){this.filtros.push([c,"eq",v]);return this} neq(c,v){this.filtros.push([c,"neq",v]);return this}
    gte(c,v){this.filtros.push([c,"gte",v]);return this} lte(c,v){this.filtros.push([c,"lte",v]);return this} gt(c,v){this.filtros.push([c,"gt",v]);return this} lt(c,v){this.filtros.push([c,"lt",v]);return this}
    in(c,v){this.filtros.push([c,"in",v]);return this} is(c,v){return this.eq(c,v)} order(c,o){this.ordenes.push([c,o?.ascending!==false]);return this} limit(n){this.maximo=n;return this}
    single(){this.unico=true;return this} maybeSingle(){this.unico=true;return this} insert(v){this.modo="insert";this.valores=v;return this} upsert(v,o){this.modo="upsert";this.valores=v;this.opcionesEscritura=o||{};return this}
    update(v){this.modo="update";this.valores=v;return this} delete(){this.modo="delete";return this} then(ok,mal){return this.ejecutar().then(ok,mal)}
    coincide(f){return this.filtros.every(([c,o,e])=>{const a=f[c];return o==="eq"?a===e:o==="neq"?a!==e:o==="gte"?a>=e:o==="lte"?a<=e:o==="gt"?a>e:o==="lt"?a<e:o==="in"?e.includes(a):true})}
    async filas(){
      const s=await db.collection(this.tabla).get();
      let f=s.docs.map(d=>({id:d.id,...normalizar(d.data())})).filter(x=>this.coincide(x));
      if(this.tabla==="entregas_tareas"&&f.length){
        const tareas=await db.collection("tareas_academicas").get(),mapa=new Map(tareas.docs.map(d=>[d.id,{id:d.id,...normalizar(d.data())}]));
        f=f.map(x=>({...x,tareas_academicas:mapa.get(String(x.tarea_id))||x.tareas_academicas||null}));
      }
      if(this.tabla==="intentos_evaluacion"&&f.length){
        const evaluaciones=await db.collection("evaluaciones").get(),mapa=new Map(evaluaciones.docs.map(d=>[d.id,{id:d.id,...normalizar(d.data())}]));
        f=f.map(x=>({...x,evaluaciones:mapa.get(String(x.evaluacion_id))||x.evaluaciones||null}));
      }
      for(const[c,a]of[...this.ordenes].reverse())f.sort((x,y)=>x[c]===y[c]?0:x[c]==null?1:y[c]==null?-1:(x[c]>y[c]?1:-1)*(a?1:-1));
      if(this.maximo!=null)f=f.slice(0,this.maximo);return f
    }
    async ejecutar(){try{
      if(this.modo==="select"){const f=await this.filas(),count=f.length;return{data:this.opcionesSeleccion.head?null:(this.unico?(f[0]||null):f),error:null,count}}
      if(this.modo==="insert"){const entradas=Array.isArray(this.valores)?this.valores:[this.valores],creados=[];for(const entrada of entradas){const datos={...entrada};if(!datos.creado_en)datos.creado_en=new Date().toISOString();const ref=datos.id?db.collection(this.tabla).doc(String(datos.id)):db.collection(this.tabla).doc();delete datos.id;await ref.set(datos);creados.push({id:ref.id,...datos})}await auditar(this.tabla,"INSERT");return{data:Array.isArray(this.valores)?creados:creados[0],error:null}}
      if(this.modo==="upsert"){const entradas=Array.isArray(this.valores)?this.valores:[this.valores],indicadas=(this.opcionesEscritura.onConflict||"").split(",").filter(Boolean),claves=indicadas.length?indicadas:(conflictos[this.tabla]||["id"]);for(const entrada of entradas){const todas=await new Consulta(this.tabla).ejecutar(),encontrada=(todas.data||[]).find(f=>claves.every(k=>entrada[k]!=null&&f[k]===entrada[k])),ref=encontrada?db.collection(this.tabla).doc(encontrada.id):(entrada.id?db.collection(this.tabla).doc(String(entrada.id)):db.collection(this.tabla).doc()),datos={...entrada,actualizado_en:new Date().toISOString()};delete datos.id;await ref.set(datos,{merge:true})}await auditar(this.tabla,"UPSERT");return{data:this.valores,error:null}}
      const f=await this.filas(),lote=db.batch();f.forEach(x=>{const ref=db.collection(this.tabla).doc(x.id);this.modo==="delete"?lote.delete(ref):lote.update(ref,{...this.valores,actualizado_en:new Date().toISOString()})});await lote.commit();if(f.length)await auditar(this.tabla,this.modo==="delete"?"DELETE":"UPDATE");return{data:f,error:null}
    }catch(e){console.error(`Firebase (${this.tabla}):`,e);return{data:this.unico?null:[],error:errorLegible(e),count:0}}}
  }

  const cliente={
    from:t=>new Consulta(t),
    auth:{
      async getUser(){await authLista;return{data:{user:usuarioActual()},error:null}},
      async signOut(){try{await auth.signOut();return{error:null}}catch(e){return{error:errorLegible(e)}}},
      async updateUser(d){try{if(d.password)await auth.currentUser.updatePassword(d.password);return{data:{user:usuarioActual()},error:null}}catch(e){return{data:null,error:errorLegible(e)}}}
    },
    async rpc(nombre,p={}){
      if(nombre==="actualizar_mi_perfil"){const u=usuarioActual();if(!u)return{data:null,error:{message:"No hay una sesion activa."}};return new Consulta("perfiles").update({nombre:p.nuevo_nombre,carrera:p.nueva_carrera}).eq("id",u.id).ejecutar()}
      if(nombre==="resumen_rectorado"){const ts=["perfiles","recursos_personalizados","avisos","asistencia"],rs=await Promise.all(ts.map(t=>new Consulta(t).ejecutar()));return{data:{perfiles:rs[0].data.length,recursos:rs[1].data.length,avisos:rs[2].data.length,asistencias:rs[3].data.length},error:null}}
      if(nombre==="preguntas_para_evaluacion")return new Consulta("preguntas_evaluacion").eq("evaluacion_id",p.evaluacion_busqueda).order("orden").ejecutar();
      if(nombre==="enviar_evaluacion"){
        const u=usuarioActual();if(!u)return{data:null,error:{message:"No hay una sesion activa."}};
        const consulta=await new Consulta("preguntas_evaluacion").eq("evaluacion_id",p.evaluacion_busqueda).ejecutar();
        if(consulta.error)return consulta;
        const preguntas=consulta.data||[],puntajeMaximo=preguntas.reduce((s,x)=>s+Number(x.puntos||0),0),puntaje=preguntas.reduce((s,x)=>s+(Number(p.respuestas_enviadas?.[x.id])===Number(x.respuesta_correcta)?Number(x.puntos||0):0),0);
        const guardado=await new Consulta("intentos_evaluacion").upsert({evaluacion_id:p.evaluacion_busqueda,estudiante_id:u.id,respuestas:p.respuestas_enviadas,puntaje,puntaje_maximo:puntajeMaximo,enviado_en:new Date().toISOString()},{onConflict:"evaluacion_id,estudiante_id"}).ejecutar();
        return guardado.error?guardado:{data:[{puntaje,puntaje_maximo:puntajeMaximo}],error:null};
      }
      return{data:null,error:{message:`La funcion ${nombre} aun no esta disponible en Firebase.`}}
    },
    storage:{from(){return{async upload(){return{data:null,error:{message:"Usa un enlace de Google Drive para los archivos."}}}}}}
  };
  window.STESIN_DATOS=cliente;
  auth.onAuthStateChanged(async u=>{if(!window.STESIN_ES_ADMIN(u))return;const ref=db.collection("perfiles").doc(u.uid),actual=await ref.get(),previo=actual.data()||{};await ref.set({nombre:previo.nombre||"Administrador",correo:u.email,usuario:u.email,carrera:previo.carrera||"Administracion STESIN",rol:"admin",activo:true,creado_en:previo.creado_en||new Date().toISOString()},{merge:true})});
})();
