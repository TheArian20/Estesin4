document.addEventListener("DOMContentLoaded", async () => {
    const cliente = window.STESIN_SUPABASE;
    const lista = document.getElementById("listaProgreso");
    const resumen = document.getElementById("porcentajeProgreso");
    if (!cliente || !lista || !resumen) return;

    const { data: { user } = {} } = await cliente.auth.getUser();
    if (!user) return;

    const { data, error } = await cliente
        .from("progreso_lectura")
        .select("recurso_nombre,ciclo,leido_en")
        .eq("usuario_id", user.id)
        .order("leido_en", { ascending: false });

    if (error) {
        resumen.textContent = "Registro no disponible";
        lista.innerHTML = '<article class="attendance-row"><div><strong>Aún no se pudo cargar tu actividad.</strong><small>Intenta nuevamente en unos momentos.</small></div></article>';
        return;
    }

    const actividad = data || [];
    resumen.textContent = `${actividad.length} recurso${actividad.length === 1 ? "" : "s"} consultado${actividad.length === 1 ? "" : "s"}`;

    if (!actividad.length) {
        lista.innerHTML = '<article class="attendance-row"><div><strong>Aún no se registran documentos abiertos.</strong><small>Abre un recurso desde Biblioteca o desde una materia para que aparezca aquí.</small></div></article>';
        return;
    }

    lista.innerHTML = actividad.map((recurso) => {
        const fecha = new Date(recurso.leido_en).toLocaleString("es-PE", {
            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
        });
        return `<article class="attendance-row"><div><small>${recurso.ciclo || "Biblioteca"}</small><strong></strong><small>Abierto el ${fecha}</small></div><span class="present">Consultado</span></article>`;
    }).join("");

    actividad.forEach((recurso, indice) => {
        lista.querySelectorAll("strong")[indice].textContent = recurso.recurso_nombre || "Recurso académico";
    });
});
