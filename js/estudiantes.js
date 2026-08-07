document.addEventListener("DOMContentLoaded", async () => {
  const c = window.STESIN_SUPABASE, selector = document.getElementById("selectorEstudiante"), ficha = document.getElementById("fichaEstudiante"), lista = document.getElementById("listaObservaciones");
  if (!c || !selector) return;
  const { data: { user } } = await c.auth.getUser();
  const { data: perfil } = await c.from("perfiles").select("rol").eq("id", user?.id).single();
  if (!['admin', 'docente'].includes(perfil?.rol)) return location.replace("index.html");
  const { data: estudiantes, error } = await c.from("perfiles").select("id,nombre,usuario").eq("rol", "estudiante").eq("activo", true).order("nombre");
  if (error) { selector.innerHTML = '<option>No se pudieron cargar estudiantes</option>'; return; }
  selector.innerHTML = '<option value="">Selecciona una cuenta</option>' + (estudiantes || []).map(e => `<option value="${e.id}">${e.nombre}</option>`).join("");
  async function cargar() {
    const id = selector.value; if (!id) return;
    const [asistencia, entregas, intentos, observaciones] = await Promise.all([
      c.from("asistencia").select("presente").eq("estudiante_id", id),
      c.from("entregas_tareas").select("estado,calificacion").eq("estudiante_id", id),
      c.from("intentos_evaluacion").select("puntaje,puntaje_maximo").eq("estudiante_id", id),
      c.from("observaciones_estudiantes").select("contenido,materia,creado_en").eq("estudiante_id", id).order("creado_en", { ascending: false })
    ]);
    const asistencias = asistencia.data || [], presentes = asistencias.filter(x => x.presente).length, actividades = entregas.data || [], pruebas = intentos.data || [];
    const promedio = pruebas.filter(x => x.puntaje_maximo > 0); const nota = promedio.length ? (promedio.reduce((s, x) => s + (x.puntaje / x.puntaje_maximo * 20), 0) / promedio.length).toFixed(1) : "Sin datos";
    ficha.innerHTML = [["Asistencia", asistencias.length ? `${presentes}/${asistencias.length}` : "Sin datos"], ["Tareas entregadas", actividades.length], ["Evaluaciones", pruebas.length], ["Promedio", nota === "Sin datos" ? nota : `${nota}/20`]].map(([t, v]) => `<article class="stats-section"><strong>${v}</strong><p>${t}</p></article>`).join("");
    lista.innerHTML = (observaciones.data || []).map(x => `<article class="resource-row"><div><h3>${x.materia || 'Seguimiento general'}</h3><p>${x.contenido}</p><small>${new Date(x.creado_en).toLocaleDateString('es-PE')}</small></div></article>`).join("") || '<p class="announcements-empty">No hay observaciones registradas.</p>';
  }
  selector.addEventListener("change", cargar);
  document.getElementById("formObservacion").addEventListener("submit", async e => { e.preventDefault(); if (!selector.value) return alert("Selecciona un estudiante."); const d = new FormData(e.currentTarget); const { error: guardar } = await c.from("observaciones_estudiantes").insert({ estudiante_id: selector.value, materia: d.get("materia").trim() || null, contenido: d.get("contenido").trim(), creado_por: user.id }); document.getElementById("estadoObservacion").textContent = guardar ? guardar.message : "Observación guardada."; if (!guardar) { e.currentTarget.reset(); cargar(); } });
});
