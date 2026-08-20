document.addEventListener("DOMContentLoaded", async () => {
    const cliente = window.STESIN_DATOS;
    if (!cliente || localStorage.getItem("rolUsuario") !== "admin") return;
    const destino = document.getElementById("resumenAdministrativo");
    if (!destino || document.getElementById("gestionDocentes")) return;

    const seccion = document.createElement("section");
    seccion.className = "admin-card";
    seccion.id = "gestionDocentes";
    seccion.innerHTML = '<h2>Docentes y materias</h2><p>Convierte una cuenta existente en docente y asigna las materias que podrá gestionar.</p><form class="resource-form"><label class="wide">Cuenta<select name="docente" required></select></label><label>Ciclo<select name="ciclo" required><option>Ciclo I</option><option>Ciclo II</option><option>Ciclo III</option><option>Ciclo IV</option><option selected>Ciclo V</option><option>Ciclo VI</option><option>Ciclo VII</option><option>Ciclo VIII</option></select></label><label>Materia<input name="materia" required minlength="3" placeholder="Ej.: Teología Bíblica III"></label><button class="account-action" type="submit">Asignar materia</button><button class="account-action" type="button" data-rol>Convertir en docente</button></form><div class="admin-state" hidden></div><div class="resource-list"><div class="admin-state">Cargando docentes…</div></div>';
    destino.insertAdjacentElement("afterend", seccion);
    const selector = seccion.querySelector("select[name=docente]");
    const formulario = seccion.querySelector("form");
    const estado = seccion.querySelector(".admin-state");
    const lista = seccion.querySelector(".resource-list");
    let perfiles = [];
    const mensaje = (texto, error = false) => { estado.hidden = false; estado.textContent = texto; estado.classList.toggle("error", error); };

    async function cargar() {
        const [{ data: usuarios, error }, { data: asignaciones, error: errorAsignaciones }] = await Promise.all([
            cliente.from("perfiles").select("id,nombre,usuario,rol,activo").eq("activo", true).order("nombre"),
            cliente.from("materias_docentes").select("id,docente_id,ciclo,materia").order("ciclo")
        ]);
        if (error || errorAsignaciones) { lista.innerHTML = '<div class="admin-state">Ejecuta el SQL actualizado para habilitar la gestión docente.</div>'; return; }
        perfiles = usuarios || [];
        selector.innerHTML = perfiles.map((perfil) => `<option value="${perfil.id}">${perfil.nombre} · ${perfil.rol}</option>`).join("");
        const nombres = new Map(perfiles.map((perfil) => [perfil.id, perfil.nombre]));
        lista.innerHTML = (asignaciones || []).map((asignacion) => `<article class="resource-row"><div><h3>${asignacion.materia}</h3><p>${asignacion.ciclo} · ${nombres.get(asignacion.docente_id) || "Docente"}</p></div><button class="account-action danger" type="button" data-eliminar="${asignacion.id}">Quitar</button></article>`).join("") || '<div class="admin-state">Aún no hay materias asignadas.</div>';
        lista.querySelectorAll("[data-eliminar]").forEach((boton) => boton.addEventListener("click", async () => {
            await cliente.from("materias_docentes").delete().eq("id", boton.dataset.eliminar);
            cargar();
        }));
    }
    seccion.querySelector("[data-rol]").addEventListener("click", async () => {
        const perfil = perfiles.find((item) => item.id === selector.value);
        if (!perfil || perfil.rol === "admin") return mensaje("La cuenta administradora ya tiene acceso de gestión.");
        const { error } = await cliente.from("perfiles").update({ rol: "docente" }).eq("id", perfil.id);
        if (error) return mensaje(`No se pudo actualizar: ${error.message}`, true);
        mensaje(`${perfil.nombre} ahora es docente.`);
        cargar();
    });
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const datos = new FormData(formulario);
        const perfil = perfiles.find((item) => item.id === datos.get("docente"));
        if (!perfil || !["admin", "docente"].includes(perfil.rol)) return mensaje("Primero convierte esta cuenta en docente.", true);
        const { error } = await cliente.from("materias_docentes").insert({ docente_id: perfil.id, ciclo: datos.get("ciclo"), materia: datos.get("materia").trim() });
        if (error) return mensaje(`No se pudo asignar: ${error.message}`, true);
        formulario.reset();
        mensaje("Materia asignada correctamente.");
        cargar();
    });
    cargar();
});
