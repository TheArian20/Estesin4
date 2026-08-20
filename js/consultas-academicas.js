document.addEventListener("DOMContentLoaded", async () => {
  const cliente = window.STESIN_DATOS, destino = document.querySelector(".academic-grid") || document.querySelector("main");
  if (!cliente || !destino || document.getElementById("consultasAcademicas")) return;
  const { data: { user } = {} } = await cliente.auth.getUser();
  if (!user) return;
  const { data: perfil } = await cliente.from("perfiles").select("rol,ciclo_actual").eq("id", user.id).single();
  if (!perfil) return;
  const staff = ["admin", "docente"].includes(perfil.rol);
  const seccion = document.createElement("section");
  seccion.id = "consultasAcademicas";
  seccion.className = "academic-panel consultas-academicas";
  seccion.innerHTML = staff
    ? '<p class="eyebrow">CONSULTAS</p><h2>Consultas de estudiantes</h2><div class="academic-list"><p class="academic-empty">Cargando consultas…</p></div>'
    : '<p class="eyebrow">COMUNICACIÓN ACADÉMICA</p><h2>Consulta a tu docente</h2><p>Envía una consulta sobre una materia. El docente o administrador responderá desde STESIN.</p><form class="staff-form"><input name="materia" required minlength="3" placeholder="Materia, por ejemplo: Psicopedagogía"><textarea name="mensaje" required minlength="5" placeholder="Escribe tu consulta con claridad"></textarea><button class="account-action">Enviar consulta</button></form><div class="academic-list"><p class="academic-empty">Cargando tus consultas…</p></div>';
  destino.insertAdjacentElement("afterend", seccion);
  const lista = seccion.querySelector(".academic-list"), esc = (v = "") => String(v).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;",'"':"&quot;"}[c]));
  async function cargar() {
    let consulta = cliente.from("consultas_academicas").select("id,materia,mensaje,respuesta,estado,creado_en,respondido_en,estudiante_id").order("creado_en", { ascending:false }).limit(40);
    if (!staff) consulta = consulta.eq("estudiante_id", user.id);
    const { data, error } = await consulta;
    if (error) { lista.innerHTML = '<p class="academic-empty">Ejecuta el SQL de actualización para activar las consultas académicas.</p>'; return; }
    lista.innerHTML = (data || []).map(item => staff
      ? `<article class="academic-item"><h3>${esc(item.materia)}</h3><p>${esc(item.mensaje)}</p><span class="score">${esc(item.estado)}</span><form data-consulta="${item.id}"><textarea name="respuesta" required placeholder="Respuesta para el estudiante">${esc(item.respuesta || "")}</textarea><select name="estado"><option ${item.estado === "Respondida" ? "selected" : ""}>Respondida</option><option ${item.estado === "En proceso" ? "selected" : ""}>En proceso</option></select><button class="account-action">Guardar respuesta</button></form></article>`
      : `<article class="academic-item"><h3>${esc(item.materia)}</h3><p>${esc(item.mensaje)}</p><span class="score">${esc(item.estado)}</span>${item.respuesta ? `<p><strong>Respuesta:</strong> ${esc(item.respuesta)}</p>` : ""}</article>`
    ).join("") || '<p class="academic-empty">No hay consultas registradas.</p>';
    lista.querySelectorAll("form[data-consulta]").forEach(form => form.addEventListener("submit", async e => { e.preventDefault(); const { error: guardar } = await cliente.from("consultas_academicas").update({ respuesta: form.respuesta.value.trim(), estado: form.estado.value, respondido_por: user.id, respondido_en: new Date().toISOString() }).eq("id", form.dataset.consulta); if (guardar) return alert(guardar.message); cargar(); }));
  }
  seccion.querySelector("form")?.addEventListener("submit", async e => { e.preventDefault(); const form = e.currentTarget, { error } = await cliente.from("consultas_academicas").insert({ estudiante_id:user.id, ciclo:perfil.ciclo_actual || "Ciclo V", materia:form.materia.value.trim(), mensaje:form.mensaje.value.trim() }); if (error) return alert("No se pudo enviar: " + error.message); form.reset(); cargar(); });
  cargar();
});
