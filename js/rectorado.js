document.addEventListener("DOMContentLoaded", async () => {
  const cliente = window.STESIN_SUPABASE, host = document.getElementById("metricasRector");
  if (!cliente || !host) return;
  const { data: { user } } = await cliente.auth.getUser();
  if (!user) return;
  const { data: perfil } = await cliente.from("perfiles").select("rol").eq("id", user.id).single();
  if (!['admin', 'rector'].includes(perfil?.rol)) return location.replace("index.html");
  const { data, error } = await cliente.rpc("resumen_rectorado");
  if (error) { host.innerHTML = '<article><strong>—</strong><span>Ejecuta el SQL actualizado para activar este panel.</span></article>'; return; }
  const resumen = data || {};
  const metricas = [["Estudiantes activos", resumen.estudiantes_activos || 0], ["Docentes activos", resumen.docentes_activos || 0], ["Asistencia mensual", `${resumen.asistencia_mensual || 0}%`], ["Actividades pendientes", resumen.actividades_pendientes || 0]];
  host.innerHTML = metricas.map(([titulo, valor]) => `<article><strong>${valor}</strong><span>${titulo}</span></article>`).join("");
  document.getElementById("mensajeRector").textContent = `${resumen.comunicados_activos || 0} comunicados activos para la comunidad STESIN.`;
});
