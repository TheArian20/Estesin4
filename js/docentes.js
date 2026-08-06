document.addEventListener("DOMContentLoaded", async () => {
    const cliente = window.STESIN_SUPABASE;
    const host = document.getElementById("materiasDocente");
    const titulo = document.getElementById("tituloDocente");
    const resumen = document.getElementById("resumenDocente");
    if (!cliente || !host) return;

    const { data: { user } = {} } = await cliente.auth.getUser();
    if (!user) return;
    const { data: perfil } = await cliente.from("perfiles").select("rol,nombre").eq("id", user.id).single();
    if (!perfil || !["admin", "docente"].includes(perfil.rol)) { location.replace("index.html"); return; }

    let consulta = cliente.from("materias_docentes").select("ciclo,materia,docente_id").order("ciclo");
    if (perfil.rol === "docente") consulta = consulta.eq("docente_id", user.id);
    const [{ data: materias, error }, { count: actividad }] = await Promise.all([
        consulta,
        cliente.from("progreso_lectura").select("recurso_id", { count: "exact", head: true })
    ]);
    if (error) { host.innerHTML = '<p class="announcements-empty">Ejecuta el SQL actualizado para activar las asignaciones docentes.</p>'; return; }

    titulo.textContent = perfil.rol === "admin" ? "Coordinación académica" : `Bienvenido, ${perfil.nombre}`;
    resumen.textContent = materias?.length
        ? `${materias.length} materia(s) asignada(s) · ${actividad || 0} aperturas de recursos registradas en la plataforma.`
        : "Aún no hay materias asignadas. Administración podrá asignarlas cuando se creen las cuentas docentes.";
    host.innerHTML = (materias || []).map((materia) => `<article><span>${materia.ciclo}</span><h2>${materia.materia}</h2><p>Registra asistencia y revisa la actividad de los recursos de la plataforma.</p><a href="asistencia.html">Tomar asistencia →</a></article>`).join("") || '<p class="announcements-empty">Sin asignaciones por ahora.</p>';
});
