document.addEventListener("DOMContentLoaded", () => {
    const parametros = new URLSearchParams(location.search);
    const origen = parametros.get("src") || "";
    const nombre = parametros.get("nombre") || "Documento académico";
    const marco = document.getElementById("marcoDocumento");
    const original = document.getElementById("abrirOriginal");
    const cargando = document.getElementById("cargandoVisor");
    const titulo = document.getElementById("tituloVisor");
    const permitido = origen.startsWith("documentos/") || origen.startsWith("./documentos/") || /^https:\/\/drive\.google\.com\//.test(origen);
    titulo.textContent = nombre;
    document.title = `${nombre} | STESIN`;
    if (!permitido) {
        cargando.textContent = "No se pudo validar la dirección de este documento.";
        marco.hidden = true;
        original.hidden = true;
        return;
    }
    const idDrive = origen.match(/[?&]id=([^&]+)/)?.[1];
    const vista = idDrive ? `https://drive.google.com/file/d/${encodeURIComponent(idDrive)}/preview` : origen.replace(/\/view(?:\?.*)?$/, "/preview").replace(/\/edit(?:\?.*)?$/, "/preview");
    original.href = origen;
    marco.src = vista;
    marco.addEventListener("load", () => { cargando.hidden = true; });
    document.getElementById("compartirDocumento")?.addEventListener("click", async () => {
        const datos = { title: nombre, text: `Material académico STESIN: ${nombre}`, url: origen };
        if (navigator.share) {
            try { await navigator.share(datos); } catch {}
        } else {
            await navigator.clipboard?.writeText(origen);
            window.STESIN_UI?.notificar("Enlace copiado", "exito");
        }
    });
});
