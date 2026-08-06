document.addEventListener("DOMContentLoaded", async () => {
    const cliente = window.STESIN_SUPABASE;
    const lista = document.getElementById("listaAsistencia");
    const titulo = document.getElementById("asistenciaPorcentaje");
    const resumen = document.getElementById("asistenciaResumen");
    if (!cliente || !lista || !titulo || !resumen) return;

    const { data: { user } } = await cliente.auth.getUser();
    if (!user) return;
    const { data: perfil } = await cliente.from("perfiles").select("rol,activo").eq("id", user.id).single();
    if (!perfil?.activo || !["admin", "docente"].includes(perfil.rol)) {
        window.location.replace("index.html");
        return;
    }

    document.title = "Control de asistencia | STESIN";
    document.querySelector("header h1").textContent = "Control de asistencia";
    document.querySelector("header p").textContent = "Registra y consulta la asistencia de los estudiantes STESIN.";
    const fecha = document.createElement("input");
    fecha.type = "date";
    fecha.className = "attendance-date";
    fecha.value = new Date().toISOString().slice(0, 10);
    const exportar = document.createElement("button");
    exportar.type = "button";
    exportar.className = "account-action";
    exportar.textContent = "Descargar reporte CSV";
    titulo.textContent = "Asistencia por jornada";
    resumen.textContent = "Selecciona una fecha y registra la participación de cada estudiante.";
    resumen.insertAdjacentElement("afterend", fecha);
    fecha.insertAdjacentElement("afterend", exportar);
    let estudiantesActuales = [];
    let registrosActuales = new Map();

    async function cargar() {
        lista.innerHTML = '<p class="announcements-empty">Cargando estudiantes…</p>';
        const [{ data: estudiantes, error }, { data: registros }] = await Promise.all([
            cliente.from("perfiles").select("id,nombre,activo,rol").eq("rol", "estudiante").eq("activo", true).order("nombre"),
            cliente.from("asistencia").select("estudiante_id,presente,nota").eq("fecha", fecha.value)
        ]);
        if (error) {
            lista.innerHTML = '<p class="announcements-empty">Ejecuta el SQL actualizado para habilitar la asistencia para docentes.</p>';
            return;
        }
        const porEstudiante = new Map((registros || []).map((registro) => [registro.estudiante_id, registro]));
        estudiantesActuales = estudiantes || [];
        registrosActuales = porEstudiante;
        const total = (estudiantes || []).length;
        const presentes = [...porEstudiante.values()].filter((registro) => registro.presente).length;
        titulo.textContent = `${presentes} de ${total} presentes`;
        lista.innerHTML = (estudiantes || []).map((estudiante) => {
            const registro = porEstudiante.get(estudiante.id);
            const presente = registro?.presente === true;
            return `<article class="attendance-row"><div><strong>${estudiante.nombre}</strong><small>${registro ? (presente ? "Presente" : "Inasistencia") : "Sin registrar"}</small></div><button class="account-action ${presente ? "" : "danger"}" type="button" data-estudiante="${estudiante.id}" data-presente="${presente}">${presente ? "Marcar falta" : "Marcar presente"}</button></article>`;
        }).join("") || '<p class="announcements-empty">No hay estudiantes activos.</p>';
        lista.querySelectorAll("button[data-estudiante]").forEach((boton) => boton.addEventListener("click", async () => {
            const presente = boton.dataset.presente !== "true";
            boton.disabled = true;
            const { error: errorRegistro } = await cliente.from("asistencia").upsert({ estudiante_id: boton.dataset.estudiante, fecha: fecha.value, presente }, { onConflict: "estudiante_id,fecha" });
            if (errorRegistro) alert(`No se pudo guardar: ${errorRegistro.message}`);
            await cargar();
        }));
    }
    fecha.addEventListener("change", cargar);
    exportar.addEventListener("click", () => {
        const filas = [["Fecha", "Estudiante", "Estado"]].concat(estudiantesActuales.map((estudiante) => [fecha.value, estudiante.nombre, registrosActuales.get(estudiante.id)?.presente ? "Presente" : "Inasistencia"]));
        const csv = "\uFEFF" + filas.map((fila) => fila.map((valor) => `"${String(valor).replace(/"/g, '""')}"`).join(",")).join("\n");
        const enlace = document.createElement("a");
        enlace.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        enlace.download = `asistencia-${fecha.value}.csv`;
        enlace.click();
        URL.revokeObjectURL(enlace.href);
    });
    cargar();
});
