document.addEventListener("DOMContentLoaded", async () => {
  const c = window.STESIN_SUPABASE; if (!c) return;
  const { data: { user } = {} } = await c.auth.getUser(); if (!user) return;
  const lista = document.getElementById("listaSolicitudes"), form = document.getElementById("formSolicitud"), tipo = form.tipo, fecha = document.getElementById("fechaJustificacion"), estado = document.getElementById("estadoSolicitud");
  const esc = v => String(v || "").replace(/[&<>'"]/g, x => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[x]));
  async function cargar() { const {data,error}=await c.from("solicitudes_institucionales").select("tipo,detalle,estado,creado_en,respuesta").eq("usuario_id",user.id).order("creado_en",{ascending:false}); lista.innerHTML=error?"<p>Ejecuta el SQL actualizado para activar solicitudes.</p>":(data||[]).map(x=>`<article><strong>${esc(x.tipo)}</strong><p>${esc(x.detalle)}</p><p><b>${esc(x.estado)}</b>${x.respuesta?` · ${esc(x.respuesta)}`:""}</p></article>`).join("")||"<p>Aún no tienes solicitudes.</p>"; }
  tipo.addEventListener("change",()=>{const visible=tipo.value==="Justificación de inasistencia";fecha.hidden=!visible;fecha.querySelector("input").required=visible});
  form.addEventListener("submit",async e=>{e.preventDefault();const d=new FormData(form);let detalle=d.get("detalle").trim();if(d.get("fecha"))detalle=`Fecha solicitada: ${d.get("fecha")}\n${detalle}`;const{error}=await c.from("solicitudes_institucionales").insert({usuario_id:user.id,tipo:d.get("tipo"),detalle});estado.textContent=error?error.message:"Solicitud enviada correctamente.";if(!error){form.reset();fecha.hidden=true;cargar()}});cargar();
});
