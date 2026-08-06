document.addEventListener("DOMContentLoaded", async () => {
  const cliente = window.STESIN_SUPABASE;
  const estado = document.getElementById("perfilEstado"), recursos = document.getElementById("perfilRecursos"), mensaje = document.getElementById("perfilMensaje");
  const resumen = document.querySelector(".profile-summary-grid");
  if (resumen && !document.getElementById("perfilActividad")) {
    resumen.insertAdjacentHTML("beforeend", '<article><strong id="perfilActividad">—</strong><span>Recursos consultados</span></article><article><strong id="perfilAsistencia">—</strong><span>Asistencia registrada</span></article>');
  }
  const actividad = document.getElementById("perfilActividad"), asistencia = document.getElementById("perfilAsistencia");
  if (!cliente || !estado || !recursos || !mensaje) return;
  const { data: { user } } = await cliente.auth.getUser();
  if (!user) return;
  const { data: perfil } = await cliente.from("perfiles").select("activo, rol").eq("id", user.id).single();
  estado.textContent = perfil?.activo ? "Activa" : "Sin acceso";
  const { count, error } = await cliente.from("recursos_personalizados").select("id", { count: "exact", head: true });
  recursos.textContent = error ? "Biblioteca" : String(count || 0);
  const [{ count: lecturas, error: errorLecturas }, { data: asistencias, error: errorAsistencia }] = await Promise.all([
    cliente.from("progreso_lectura").select("recurso_id", { count: "exact", head: true }).eq("usuario_id", user.id),
    cliente.from("asistencia").select("presente").eq("estudiante_id", user.id)
  ]);
  actividad.textContent = errorLecturas ? "—" : String(lecturas || 0);
  if (errorAsistencia || !asistencias?.length) asistencia.textContent = "Sin datos";
  else asistencia.textContent = `${asistencias.filter((item) => item.presente).length}/${asistencias.length}`;
  mensaje.textContent = perfil?.rol === "admin" ? "Estás usando una cuenta administradora. Puedes gestionar estudiantes, avisos y recursos." : "Tu cuenta está activa. Revisa los avisos y los materiales disponibles para tu ciclo.";
});
