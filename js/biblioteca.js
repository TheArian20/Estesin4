document.addEventListener("DOMContentLoaded", async () => {
    const lista = document.getElementById("listaBiblioteca");
    if (!lista) return;
    const buscador = document.getElementById("buscarBiblioteca");
    const filtros = document.getElementById("filtrosBiblioteca");
    const contador = document.getElementById("contadorResultados");
    const total = document.getElementById("totalDocumentos");
    const vacio = document.getElementById("bibliotecaVacia");
    const cargarMas = document.getElementById("cargarMas");
    const bibliotecaDrive = document.body.dataset.bibliotecaDrive;
    let documentos = [];
    let filtro = "todos";
    let limite = 24;

    const normalizar = (texto) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const tipoDocumento = (archivo) => {
        const extension = archivo.split(".").pop().toLowerCase();
        if (extension === "pdf") return "pdf";
        if (["doc", "docx"].includes(extension)) return "word";
        return "archivo";
    };
    const iconoDocumento = (tipo) => ({ pdf: "📕", word: "📝", archivo: "🗂️" }[tipo]);

    function renderizar() {
        const consulta = normalizar(buscador.value.trim());
        const filtrados = documentos.filter((documento) => {
            const coincideTexto = !consulta || normalizar(documento.nombre).includes(consulta);
            const coincideTipo = filtro === "todos" || tipoDocumento(documento.nombre) === filtro;
            return coincideTexto && coincideTipo;
        });
        const visibles = filtrados.slice(0, limite);
        lista.innerHTML = "";
        visibles.forEach((documento) => {
            const tipo = tipoDocumento(documento.nombre);
            const enlace = document.createElement("a");
            enlace.className = "library-item";
            enlace.href = documento.enlaceDrive || bibliotecaDrive;
            enlace.target = "_blank";
            enlace.rel = "noopener";
            enlace.innerHTML = `<span class="library-file-icon">${iconoDocumento(tipo)}</span><span class="library-file-data"><strong></strong><small>${tipo.toUpperCase()} · ${documento.enlaceDrive ? "Abrir documento" : "Abrir en Google Drive"}</small></span>`;
            enlace.querySelector("strong").textContent = documento.nombre;
            lista.appendChild(enlace);
        });
        contador.textContent = `${filtrados.length} resultado${filtrados.length === 1 ? "" : "s"}`;
        vacio.hidden = filtrados.length !== 0;
        cargarMas.hidden = visibles.length >= filtrados.length;
    }

    try {
        const enlacesDirectos = await window.BIBLIOTECA_ENLACES;
        documentos = window.BIBLIOTECA_CATALOGO.map((documento, indice) => ({ ...documento, enlaceDrive: enlacesDirectos?.[indice] || "" })).filter((documento) => documento.grupo !== "SILABOS");
        if (!Array.isArray(documentos)) throw new Error("No se pudo cargar el catálogo");
        total.textContent = `${documentos.length} documentos disponibles`;
        renderizar();
    } catch {
        total.textContent = "Biblioteca en preparación";
        vacio.hidden = false;
        vacio.textContent = "El catálogo se está preparando. Vuelve a cargar la página en unos momentos.";
    }

    buscador.addEventListener("input", () => { limite = 24; renderizar(); });
    filtros.addEventListener("click", (evento) => {
        const boton = evento.target.closest("button[data-filtro]");
        if (!boton) return;
        filtro = boton.dataset.filtro;
        filtros.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === boton));
        limite = 24;
        renderizar();
    });
    cargarMas.addEventListener("click", () => { limite += 24; renderizar(); });
});
