document.addEventListener("DOMContentLoaded", async () => {
  const cliente = window.STESIN_DATOS;
  const $ = (selector) => document.querySelector(selector);
  const host = $("#materiasDocente");
  if (!cliente || !host) return;
  const { data: { user } = {} } = await cliente.auth.getUser();
  if (!user) return;
  const { data: perfil } = await cliente.from("perfiles").select("rol,nombre,activo").eq("id", user.id).single();
  if (!perfil || !["admin", "docente"].includes(perfil.rol)) { location.replace("index.html"); return; }
  const escapar = (valor = "") => String(valor).replace(/[&<>'"]/g, (caracter) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[caracter]);
  const cicloTexto = (ciclo) => String(ciclo || "Ciclo V").toLowerCase().startsWith("ciclo") ? ciclo : `Ciclo ${ciclo}`;
  let consulta = cliente.from("materias_docentes").select("ciclo,materia,docente_id").order("ciclo");
  if (perfil.rol === "docente") consulta = consulta.eq("docente_id", user.id);
  const [respuestaMaterias, respuestaActividad, respuestaAsistencia] = await Promise.all([consulta, cliente.from("progreso_lectura").select("recurso_nombre,leido_en", { count: "exact" }).order("leido_en", { ascending: false }).limit(5), cliente.from("asistencia").select("id", { count: "exact", head: true })]);
  const materias = respuestaMaterias.data || [], actividad = respuestaActividad.data || [];
  $("#tituloDocente").textContent = perfil.rol === "admin" ? "Coordinación académica STESIN" : `Bienvenido, ${perfil.nombre || "docente"}`;
  $("#estadoDocente").textContent = perfil.activo ? "Cuenta activa" : "Sin acceso";
  $("#resumenDocente").textContent = perfil.rol === "admin" ? "Revisa asignaciones, asistencia y actividad académica registrada en STESIN." : materias.length ? `Tienes ${materias.length} materia${materias.length === 1 ? "" : "s"} asignada${materias.length === 1 ? "" : "s"}.` : "Aún no tienes materias asignadas por administración.";
  $("#metricMaterias").textContent = String(materias.length); $("#metricActividad").textContent = respuestaActividad.error ? "—" : String(respuestaActividad.count || actividad.length); $("#metricAsistencia").textContent = respuestaAsistencia.error ? "—" : String(respuestaAsistencia.count || 0); $("#estadoMaterias").textContent = respuestaMaterias.error ? "Configuración pendiente" : `${materias.length} asignación${materias.length === 1 ? "" : "es"}`;
  if (respuestaMaterias.error) host.innerHTML = '<p class="announcements-empty">No se pudieron cargar las asignaciones desde Firebase.</p>';
  else if (!materias.length) host.innerHTML = '<p class="announcements-empty">No hay materias asignadas todavía. Un administrador puede agregarlas desde Administración.</p>';
  else { host.innerHTML = materias.map((item) => `<article class="teacher-subject"><span>${escapar(cicloTexto(item.ciclo))}</span><h3>${escapar(item.materia)}</h3><p>Accede a los recursos publicados de esta materia o abre el control de asistencia.</p><button type="button" class="btn-materia" data-materia="${escapar(item.materia)}" data-ciclo="${escapar(cicloTexto(item.ciclo))}">Ver recursos</button><a class="text-link" href="asistencia.html">Tomar asistencia →</a></article>`).join(""); host.querySelectorAll(".btn-materia").forEach((boton) => boton.addEventListener("click", () => { localStorage.setItem("subcicloSeleccionado", boton.dataset.materia || ""); localStorage.setItem("cicloDeSubciclo", boton.dataset.ciclo || "Ciclo V"); location.href = "materia.html"; })); }
  const lista = $("#actividadDocente");
  if (respuestaActividad.error) lista.innerHTML = '<li><strong>Actividad no disponible</strong><small>El rol actual no tiene permiso para consultar este registro.</small></li>';
  else if (!actividad.length) lista.innerHTML = '<li><strong>Aún no hay consultas registradas.</strong><small>Se mostrarán cuando se abra un recurso académico.</small></li>';
  else lista.innerHTML = actividad.map((item) => `<li><strong>${escapar(item.recurso_nombre || "Recurso académico")}</strong><small>${new Date(item.leido_en).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}</small></li>`).join("");
});
