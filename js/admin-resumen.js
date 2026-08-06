document.addEventListener("DOMContentLoaded", async () => {
    const destino = document.getElementById("resumenAdministrativo");
    const cliente = window.STESIN_SUPABASE;
    if (!destino || !cliente) return;

    const { data: { user } } = await cliente.auth.getUser();
    if (!user || localStorage.getItem("rolUsuario") !== "admin") return;

    const [perfiles, recursos, avisos, asistencias] = await Promise.all([
        cliente.from("perfiles").select("id,activo", { count: "exact" }),
        cliente.from("recursos_personalizados").select("id", { count: "exact" }),
        cliente.from("avisos").select("id,activo", { count: "exact" }),
        cliente.from("asistencia").select("id", { count: "exact" })
    ]);
    const estudiantes = perfiles.data || [];
    const avisosActivos = (avisos.data || []).filter((aviso) => aviso.activo).length;
    const datos = [
        ["Estudiantes activos", estudiantes.filter((perfil) => perfil.activo).length],
        ["Recursos publicados", recursos.count || 0],
        ["Avisos vigentes", avisosActivos],
        ["Asistencias registradas", asistencias.count || 0]
    ];
    destino.innerHTML = datos.map(([etiqueta, valor]) => `<article><strong>${valor}</strong><span>${etiqueta}</span></article>`).join("");
});
