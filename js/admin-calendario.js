document.addEventListener("DOMContentLoaded", async () => {
    const cliente = window.STESIN_SUPABASE;
    const hero = document.querySelector(".admin-hero");
    if (!cliente || !hero) return;
    const { data: { user } } = await cliente.auth.getUser();
    if (!user || localStorage.getItem("rolUsuario") !== "admin") return;

    const seccion = document.createElement("section");
    seccion.className = "admin-card";
    seccion.innerHTML = '<h2>Calendario administrable</h2><p>Publica nuevas jornadas o retira las que ya no estén vigentes. Los cambios aparecerán en la agenda.</p><form class="resource-form"><label>Fecha<input name="fecha" type="date" required></label><label>Horario<input name="hora" placeholder="Ej.: 6:00 – 7:30" required></label><label class="wide">Materia<input name="materia" placeholder="Ej.: Administración Eclesiástica" required minlength="3"></label><label class="wide">Detalle opcional<input name="detalle" placeholder="Ej.: Aula virtual / sesión especial"></label><button class="account-action" type="submit">Publicar jornada</button></form><div class="admin-state" hidden></div><div class="resource-list"><div class="admin-state">Cargando calendario…</div></div>';
    hero.insertAdjacentElement("afterend", seccion);
    const formulario = seccion.querySelector("form");
    const mensaje = seccion.querySelector(".admin-state");
    const lista = seccion.querySelector(".resource-list");
    formulario.fecha.value = new Date().toISOString().slice(0, 10);
    const mostrar = (texto, error = false) => { mensaje.hidden = false; mensaje.textContent = texto; mensaje.classList.toggle("error", error); };

    async function cargar() {
        const { data, error } = await cliente.from("eventos_calendario").select("id,fecha,hora,materia,detalle,activo").order("fecha", { ascending: true });
        if (error) { lista.innerHTML = '<div class="admin-state">Ejecuta el SQL actualizado para activar el calendario administrable.</div>'; return; }
        lista.innerHTML = "";
        (data || []).filter((evento) => evento.activo).forEach((evento) => {
            const fila = document.createElement("article");
            fila.className = "resource-row";
            const texto = document.createElement("div");
            const fecha = new Date(`${evento.fecha}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
            texto.innerHTML = `<h3></h3><p></p><p></p>`;
            texto.querySelector("h3").textContent = evento.materia;
            texto.querySelectorAll("p")[0].textContent = `${fecha} · ${evento.hora}`;
            texto.querySelectorAll("p")[1].textContent = evento.detalle || "Jornada publicada";
            const retirar = document.createElement("button");
            retirar.className = "account-action danger";
            retirar.type = "button";
            retirar.textContent = "Retirar";
            retirar.addEventListener("click", async () => { await cliente.from("eventos_calendario").update({ activo: false }).eq("id", evento.id); cargar(); });
            fila.append(texto, retirar);
            lista.appendChild(fila);
        });
        if (!lista.children.length) lista.innerHTML = '<div class="admin-state">Aún no has publicado jornadas manuales.</div>';
    }
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const datos = new FormData(formulario);
        const { error } = await cliente.from("eventos_calendario").insert({ fecha: datos.get("fecha"), hora: datos.get("hora").trim(), materia: datos.get("materia").trim(), detalle: datos.get("detalle").trim() || null, creado_por: user.id });
        if (error) { mostrar(`No se pudo publicar: ${error.message}`, true); return; }
        formulario.reset();
        formulario.fecha.value = new Date().toISOString().slice(0, 10);
        mostrar("Jornada publicada en el calendario.");
        cargar();
    });
    cargar();
});
