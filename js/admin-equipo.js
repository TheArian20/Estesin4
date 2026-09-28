document.addEventListener("DOMContentLoaded", async () => {
  "use strict";
  const cliente = window.STESIN_DATOS;
  const hero = document.querySelector(".admin-hero");
  if (!cliente || !hero || localStorage.getItem("rolUsuario") !== "admin") return;
  const { data: { user } = {} } = await cliente.auth.getUser();
  if (!user) return;

  const equipoInicial = [
    { nombre:"Oiser Ramos Núñez", cargo:"Rector", pais:"Perú", materias:"Dirección institucional y acompañamiento académico", whatsapp:"51988598620", foto_url:"assets/equipo/oiser-ramos-nunez.jpg", orden:1 },
    { nombre:"Javier Edilberto Vásquez Vásquez", cargo:"Director y docente", pais:"Perú", materias:"Homilética Bíblica II, Hermenéutica Bíblica II y Administración Eclesiástica", whatsapp:"51956159720", foto_url:"assets/equipo/javier-edilberto-vasquez-vasquez.jpeg", orden:2 },
    { nombre:"Eliderio Angulo Guerra", cargo:"Docente", pais:"Perú", materias:"Consejería Pastoral", whatsapp:"51985124390", foto_url:"assets/equipo/eliderio-angulo-guerra.jpeg", orden:3 },
    { nombre:"Aroldo Misael López Herrera", cargo:"Docente", pais:"Guatemala", materias:"Psicopedagogía", whatsapp:"50241558772", foto_url:"assets/equipo/aroldo-misael-lopez-herrera-actualizada.jpg", orden:4 },
    { nombre:"Frank Isaac Berrocal Aréstegui", cargo:"Docente", pais:"Perú", materias:"Introducción a la Sociología", whatsapp:"51946554066", foto_url:"assets/equipo/frank-isaac-berrocal-arestegui.jpeg", orden:5 },
    { nombre:"José Ángel Piza Nivela", cargo:"Docente", pais:"Puerto Rico", materias:"Teología Bíblica III (Cristología)", whatsapp:"19394962322", foto_url:"assets/equipo/jose-angel-piza-nivela-actualizada.jpg", orden:6 }
  ];
  const escapar = (valor = "") => String(valor).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;",'"':"&quot;"}[c]));
  const seccion = document.createElement("section");
  seccion.className = "admin-card admin-team";
  seccion.id = "adminEquipo";
  seccion.innerHTML = `
    <h2>Equipo institucional</h2>
    <p>Actualiza las presentaciones y canales de contacto que ven los estudiantes.</p>
    <form class="resource-form" id="formEquipo">
      <input name="id" type="hidden">
      <label>Nombre completo<input name="nombre" required minlength="3"></label>
      <label>Cargo<input name="cargo" required placeholder="Ej.: Docente"></label>
      <label>País<input name="pais" required placeholder="Ej.: Perú"></label>
      <label>WhatsApp<input name="whatsapp" inputmode="numeric" required placeholder="51999999999"></label>
      <label class="wide">Materias o responsabilidades<input name="materias" required></label>
      <label class="wide">Ruta o enlace de la fotografía<input name="foto_url" required placeholder="assets/equipo/foto.jpg"></label>
      <label>Orden<input name="orden" type="number" min="1" value="1" required></label>
      <label class="admin-check"><input name="activo" type="checkbox" checked> Visible en Contacto</label>
      <div class="wide admin-inline-actions"><button class="account-action" type="submit">Guardar integrante</button><button class="account-action secondary" type="button" data-cancelar hidden>Cancelar edición</button></div>
    </form>
    <div class="admin-state" data-estado hidden></div>
    <div class="resource-list" data-lista><div class="admin-state">Cargando equipo…</div></div>`;
  const referencia = [...document.querySelectorAll(".admin-card")].find(x => x.querySelector("h2")?.textContent.includes("Usuarios registrados"));
  (referencia || document.querySelector("main")).insertAdjacentElement(referencia ? "beforebegin" : "beforeend", seccion);
  const formulario = seccion.querySelector("form"), lista = seccion.querySelector("[data-lista]"), estado = seccion.querySelector("[data-estado]"), cancelar = seccion.querySelector("[data-cancelar]");
  const avisar = (texto, error = false) => { estado.hidden = false; estado.textContent = texto; estado.classList.toggle("error", error); };
  const limpiar = () => { formulario.reset(); formulario.id.value = ""; formulario.orden.value = "1"; formulario.activo.checked = true; cancelar.hidden = true; formulario.querySelector("button[type=submit]").textContent = "Guardar integrante"; };
  async function cargar() {
    const { data, error } = await cliente.from("equipo_docente").select("*").order("orden");
    if (error) { lista.innerHTML = `<div class="admin-state error">${escapar(error.message)}</div>`; return; }
    if (!(data || []).length) {
      lista.innerHTML = '<div class="admin-state">Aún no hay integrantes guardados en Firebase. <button class="account-action" type="button" data-sembrar>Cargar equipo actual</button></div>';
      lista.querySelector("[data-sembrar]").addEventListener("click", sembrar);
      return;
    }
    lista.innerHTML = data.map(item => `<article class="resource-row admin-team-row"><div><h3>${escapar(item.nombre)}</h3><p>${escapar(item.cargo)} · ${escapar(item.pais)}</p><p>${escapar(item.materias)}</p><div class="account-meta"><span>${item.activo === false ? "Oculto" : "Visible"}</span><span>Orden ${Number(item.orden || 1)}</span></div></div><div class="admin-inline-actions"><button class="account-action secondary" type="button" data-editar="${item.id}">Editar</button><button class="account-action ${item.activo === false ? "" : "danger"}" type="button" data-estado-id="${item.id}" data-activo="${item.activo !== false}">${item.activo === false ? "Mostrar" : "Ocultar"}</button></div></article>`).join("");
    lista.querySelectorAll("[data-editar]").forEach(boton => boton.addEventListener("click", () => editar(data.find(x => x.id === boton.dataset.editar))));
    lista.querySelectorAll("[data-estado-id]").forEach(boton => boton.addEventListener("click", async () => {
      boton.disabled = true;
      const { error: fallo } = await cliente.from("equipo_docente").update({ activo: boton.dataset.activo !== "true" }).eq("id", boton.dataset.estadoId);
      avisar(fallo ? fallo.message : "Visibilidad actualizada.", Boolean(fallo));
      cargar();
    }));
  }
  function editar(item) {
    ["id","nombre","cargo","pais","materias","whatsapp","foto_url","orden"].forEach(campo => { formulario.elements[campo].value = item[campo] ?? ""; });
    formulario.activo.checked = item.activo !== false;
    cancelar.hidden = false;
    formulario.querySelector("button[type=submit]").textContent = "Guardar cambios";
    formulario.scrollIntoView({ behavior:"smooth", block:"center" });
  }
  async function sembrar() {
    const registros = equipoInicial.map(item => ({ ...item, activo:true, creado_por:user.id }));
    const { error } = await cliente.from("equipo_docente").insert(registros);
    avisar(error ? error.message : "Equipo actual cargado correctamente.", Boolean(error));
    if (!error) cargar();
  }
  formulario.addEventListener("submit", async evento => {
    evento.preventDefault();
    const datos = new FormData(formulario);
    const id = String(datos.get("id") || "");
    const registro = { nombre:String(datos.get("nombre")).trim(), cargo:String(datos.get("cargo")).trim(), pais:String(datos.get("pais")).trim(), materias:String(datos.get("materias")).trim(), whatsapp:String(datos.get("whatsapp")).replace(/\D/g, ""), foto_url:String(datos.get("foto_url")).trim(), orden:Number(datos.get("orden")), activo:formulario.activo.checked };
    const consulta = id ? cliente.from("equipo_docente").update(registro).eq("id", id) : cliente.from("equipo_docente").insert({ ...registro, creado_por:user.id });
    const { error } = await consulta;
    avisar(error ? error.message : (id ? "Integrante actualizado." : "Integrante agregado."), Boolean(error));
    if (!error) { limpiar(); cargar(); }
  });
  cancelar.addEventListener("click", limpiar);
  cargar();
});
