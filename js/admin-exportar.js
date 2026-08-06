document.addEventListener("DOMContentLoaded", async () => {
    const cliente = window.STESIN_SUPABASE;
    if (!cliente || localStorage.getItem("rolUsuario") !== "admin") return;
    const destino = document.getElementById("resumenAdministrativo");
    if (!destino || document.getElementById("respaldoAdministrativo")) return;

    const seccion = document.createElement("section");
    seccion.className = "admin-card";
    seccion.id = "respaldoAdministrativo";
    seccion.innerHTML = '<h2>Respaldo administrativo</h2><p>Descarga un archivo CSV para conservar una copia de las cuentas, asistencia o actividad registrada.</p><div class="admin-summary"><button class="account-action" data-exportar="usuarios">Usuarios</button><button class="account-action" data-exportar="asistencia">Asistencia</button><button class="account-action" data-exportar="actividad">Actividad</button></div><div class="admin-state" hidden></div>';
    destino.insertAdjacentElement("afterend", seccion);
    const estado = seccion.querySelector(".admin-state");
    const escaparCSV = (valor) => `"${String(valor ?? "").replaceAll('"', '""')}"`;
    const descargar = (nombre, columnas, filas) => {
        const contenido = [columnas, ...filas.map((fila) => columnas.map((columna) => escaparCSV(fila[columna])).join(","))].join("\n");
        const enlace = document.createElement("a");
        enlace.href = URL.createObjectURL(new Blob(["\ufeff" + contenido], { type: "text/csv;charset=utf-8" }));
        enlace.download = `${nombre}-${new Date().toISOString().slice(0, 10)}.csv`;
        enlace.click();
        URL.revokeObjectURL(enlace.href);
    };
    const fuentes = {
        usuarios: ["perfiles", "id,nombre,usuario,correo,carrera,rol,activo,creado_en", "usuarios"],
        asistencia: ["asistencia", "fecha,estudiante_id,presente,nota,registrado_en", "asistencia"],
        actividad: ["progreso_lectura", "usuario_id,recurso_nombre,ciclo,leido_en", "actividad-academica"]
    };
    seccion.querySelectorAll("[data-exportar]").forEach((boton) => boton.addEventListener("click", async () => {
        const [tabla, campos, nombre] = fuentes[boton.dataset.exportar];
        boton.disabled = true;
        estado.hidden = false;
        estado.textContent = "Preparando respaldo…";
        const { data, error } = await cliente.from(tabla).select(campos).limit(5000);
        boton.disabled = false;
        if (error) { estado.textContent = `No se pudo generar: ${error.message}`; estado.classList.add("error"); return; }
        descargar(nombre, campos.split(","), data || []);
        estado.classList.remove("error");
        estado.textContent = `${data?.length || 0} registros descargados.`;
    }));
});
