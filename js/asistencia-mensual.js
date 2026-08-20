const iniciarResumenMensualAsistencia = async () => {
  const datos = window.STESIN_DATOS;
  const historial = document.querySelector("#listaAsistencia");
  if (!datos || !historial) return;
  const { data: { user } } = await datos.auth.getUser();
  if (!user) return;
  const { data: perfil } = await datos.from("perfiles").select("rol").eq("id", user.id).single();
  if (!['admin', 'docente'].includes(perfil?.rol)) return;

  const panel = document.createElement("section");
  panel.className = "attendance-hero";
  panel.style.marginBottom = "22px";
  panel.innerHTML = `<p class="eyebrow">RESUMEN MENSUAL</p><h2>Calculando asistencia…</h2><p>Revisando los registros del mes actual.</p>`;
  historial.closest("section").insertAdjacentElement("beforebegin", panel);

  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
  const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().slice(0, 10);
  const [{ data: registros, error }, { data: estudiantes }] = await Promise.all([
    datos.from("asistencia").select("estudiante_id,presente").gte("fecha", inicio).lte("fecha", fin),
    datos.from("perfiles").select("id,nombre").eq("rol", "estudiante")
  ]);
  if (error) { panel.remove(); return; }

  const filas = registros || [];
  const presentes = filas.filter((fila) => fila.presente).length;
  const ausencias = {};
  filas.filter((fila) => !fila.presente).forEach((fila) => {
    ausencias[fila.estudiante_id] = (ausencias[fila.estudiante_id] || 0) + 1;
  });
  const nombres = new Map((estudiantes || []).map((estudiante) => [estudiante.id, estudiante.nombre]));
  const alertas = Object.entries(ausencias).filter(([, cantidad]) => cantidad >= 3)
    .map(([id, cantidad]) => `${nombres.get(id) || "Estudiante"} (${cantidad})`);
  panel.querySelector("h2").textContent = filas.length
    ? `${Math.round((presentes * 100) / filas.length)}% de asistencia mensual`
    : "Sin registros este mes";
  panel.querySelector("p:last-child").textContent = alertas.length
    ? `Alerta: ${alertas.join(", ")} acumula 3 o más inasistencias.`
    : "No hay alertas de inasistencias repetidas este mes.";
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarResumenMensualAsistencia);
} else {
  iniciarResumenMensualAsistencia();
}
