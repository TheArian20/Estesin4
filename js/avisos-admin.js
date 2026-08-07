document.addEventListener("DOMContentLoaded", async () => {
  const cliente = window.STESIN_SUPABASE;
  const form = document.getElementById("formAviso"), lista = document.getElementById("listaAvisosAdmin"), resultado = document.getElementById("resultadoAviso");
  if (!cliente || !form || !lista || localStorage.getItem("rolUsuario") !== "admin") return;
  if (!document.getElementById("avisoAudiencia")) {
    const campos = [
      'Destinatarios<select id="avisoAudiencia"><option value="todos">Toda la comunidad</option><option value="estudiantes">Solo estudiantes</option><option value="docentes">Solo docentes</option><option value="administradores">Solo administración</option></select>',
      'Ciclo (opcional)<select id="avisoCiclo"><option value="">Todos los ciclos</option><option>Ciclo I</option><option>Ciclo II</option><option>Ciclo III</option><option>Ciclo IV</option><option>Ciclo V</option><option>Ciclo VI</option><option>Ciclo VII</option><option>Ciclo VIII</option></select>',
      'Publicar desde<input id="avisoDesde" type="datetime-local">',
      'Ocultar después de<input id="avisoHasta" type="datetime-local">'
    ];
    let referencia = form.querySelector("button");
    campos.forEach((contenido) => { const etiqueta = document.createElement("label"); etiqueta.innerHTML = contenido; referencia.insertAdjacentElement("beforebegin", etiqueta); referencia = etiqueta; });
  }
  const escapar = (texto = "") => String(texto).replace(/[&<>'"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#039;", '"':"&quot;" }[c]));
  const mostrar = (texto, error = false) => { resultado.hidden = false; resultado.textContent = texto; resultado.classList.toggle("error", error); };
  const fecha = (valor) => valor ? new Date(valor).toLocaleString("es-PE", { dateStyle:"medium", timeStyle:"short" }) : "Sin límite";
  async function cargar() {
    const { data, error } = await cliente.from("avisos").select("id,titulo,mensaje,activo,destacado,audiencia,ciclo,publicar_desde,publicar_hasta,creado_en").order("creado_en", { ascending:false });
    if (error) { lista.innerHTML = '<div class="admin-state">Ejecuta el SQL de actualización para activar la programación de avisos.</div>'; return; }
    lista.innerHTML = (data || []).map(a => `<article class="resource-row"><div><h3>${escapar(a.titulo)}</h3><p>${escapar(a.mensaje)}</p><p>${a.activo ? "Visible" : "Oculto"}${a.destacado ? " · Destacado" : ""} · ${escapar(a.audiencia || "todos")}</p><p>Desde: ${fecha(a.publicar_desde)} · Hasta: ${fecha(a.publicar_hasta)}</p></div><button class="account-action ${a.activo ? "danger" : ""}" type="button" data-aviso="${a.id}" data-activo="${a.activo}">${a.activo ? "Ocultar" : "Publicar"}</button></article>`).join("") || '<div class="admin-state">No hay avisos publicados.</div>';
    lista.querySelectorAll("[data-aviso]").forEach(boton => boton.addEventListener("click", async () => { const { error: cambio } = await cliente.from("avisos").update({ activo: boton.dataset.activo !== "true" }).eq("id", boton.dataset.aviso); if (cambio) return alert(cambio.message); cargar(); }));
  }
  form.addEventListener("submit", async evento => {
    evento.preventDefault();
    const titulo = document.getElementById("avisoTitulo").value.trim(), mensaje = document.getElementById("avisoMensaje").value.trim(), destacado = document.getElementById("avisoDestacado").checked, audiencia = document.getElementById("avisoAudiencia").value, ciclo = document.getElementById("avisoCiclo").value, desde = document.getElementById("avisoDesde").value, hasta = document.getElementById("avisoHasta").value;
    if (desde && hasta && new Date(hasta) <= new Date(desde)) return mostrar("La fecha de cierre debe ser posterior a la fecha de publicación.", true);
    const aviso = { titulo, mensaje, destacado, audiencia, ciclo: ciclo || null };
    if (desde) aviso.publicar_desde = desde;
    if (hasta) aviso.publicar_hasta = hasta;
    const { error } = await cliente.from("avisos").insert(aviso);
    if (error) return mostrar("No se pudo publicar: " + error.message, true);
    form.reset(); mostrar("Aviso programado para: " + (ciclo || audiencia) + "."); cargar();
  });
  cargar();
});
