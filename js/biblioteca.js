document.addEventListener("DOMContentLoaded", async () => {
    const lista = document.getElementById("listaBiblioteca");
    if (!lista) return;
    const buscador = document.getElementById("buscarBiblioteca");
    const filtros = document.getElementById("filtrosBiblioteca");
    const categoria = document.getElementById("categoriaBiblioteca");
    const orden = document.getElementById("ordenBiblioteca");
    const contador = document.getElementById("contadorResultados");
    const total = document.getElementById("totalDocumentos");
    const vacio = document.getElementById("bibliotecaVacia");
    const cargarMas = document.getElementById("cargarMas");
    const bibliotecaDrive = document.body.dataset.bibliotecaDrive;
    let documentos = [];
    let filtro = "todos";
    let limite = 24;

    const normalizar = (texto = "") => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const tipoDocumento = (archivo = "") => {
        const extension = archivo.split(".").pop().toLowerCase();
        if (extension === "pdf") return "pdf";
        if (["doc", "docx"].includes(extension)) return "word";
        return "archivo";
    };
    const iconoDocumento = (tipo) => ({ pdf: "📄", word: "📝", archivo: "🗂️" }[tipo]);
    const categoriaDocumento = (documento) => {
        if (documento.categoria) return documento.categoria;
        const texto = normalizar(documento.nombre);
        if (/biblia|biblic|evangel|pentateuco|apostol|epistola|salmo|profeta|hermeneut|exegesis|genesis|apocalipsis|juan|mateo|marcos|lucas|hebreo/.test(texto)) return "Biblia";
        if (/teologia|doctrina|escatolog|cristolog|pneumatolog|soteriolog|dogmat/.test(texto)) return "Teología";
        if (/pastoral|minister|liderazgo|iglesia|mision|evangelismo|homilet|predic|consejer|discipulado/.test(texto)) return "Ministerio";
        if (/historia|patrist|reforma|filosof|sociolog|cultura/.test(texto)) return "Historia y sociedad";
        if (/gramatica|comunic|ingles|investigacion|monografia|pedagog|educacion|aprendizaje/.test(texto)) return "Formación";
        return "General";
    };

    function crearTarjeta(documento) {
        const tipo = tipoDocumento(documento.nombre);
        const enlace = document.createElement("a");
        enlace.className = "library-item";
        enlace.href = documento.enlaceDrive || bibliotecaDrive;
        enlace.target = "_blank";
        enlace.rel = "noopener";
        enlace.innerHTML = `<span class="library-file-icon">${iconoDocumento(tipo)}</span><span class="library-file-data"><strong></strong><small></small></span>`;
        enlace.querySelector("strong").textContent = documento.nombre;
        enlace.querySelector("small").textContent = `${documento.categoria} · ${tipo.toUpperCase()} · ${documento.enlaceDrive ? "Abrir documento" : "Abrir en Google Drive"}`;
        return enlace;
    }

    function renderizar() {
        const consulta = normalizar(buscador.value.trim());
        const filtrados = documentos.filter((documento) => {
            const coincideTexto = !consulta || normalizar(documento.nombre).includes(consulta);
            const coincideTipo = filtro === "todos" || tipoDocumento(documento.nombre) === filtro;
            const coincideCategoria = categoria.value === "todas" || documento.categoria === categoria.value;
            return coincideTexto && coincideTipo && coincideCategoria;
        }).sort((a, b) => orden.value === "recientes"
            ? new Date(b.creadoEn || 0) - new Date(a.creadoEn || 0)
            : a.nombre.localeCompare(b.nombre, "es"));
        const visibles = filtrados.slice(0, limite);
        lista.innerHTML = "";
        visibles.forEach((documento) => lista.appendChild(crearTarjeta(documento)));
        contador.textContent = `${filtrados.length} resultado${filtrados.length === 1 ? "" : "s"}`;
        vacio.hidden = filtrados.length !== 0;
        cargarMas.hidden = visibles.length >= filtrados.length;
    }

    async function cargarRecursosAdministrados() {
        const cliente = window.STESIN_SUPABASE;
        if (!cliente) return [];
        const { data, error } = await cliente.from("recursos_personalizados")
            .select("titulo, enlace, categoria, ciclo, tipo, creado_en")
            .order("creado_en", { ascending: false });
        if (error) return [];
        return (data || []).map((recurso) => ({
            nombre: recurso.titulo,
            enlaceDrive: recurso.enlace,
            categoria: recurso.categoria || "General",
            creadoEn: recurso.creado_en,
            origen: "administracion"
        }));
    }

    try {
        const enlacesDirectos = await window.BIBLIOTECA_ENLACES;
        const catalogoPrincipal = window.BIBLIOTECA_CATALOGO.map((documento, indice) => ({ ...documento, enlaceDrive: enlacesDirectos?.[indice] || "" }));
        const catalogoAdicional = Array.isArray(window.BIBLIOTECA_ADICIONALES) ? window.BIBLIOTECA_ADICIONALES : [];
        const recursosAdministrados = await cargarRecursosAdministrados();
        documentos = [...catalogoPrincipal, ...catalogoAdicional]
            .filter((documento) => documento.grupo !== "SILABOS")
            .map((documento) => ({ ...documento, categoria: categoriaDocumento(documento), creadoEn: documento.creadoEn || "" }))
            .concat(recursosAdministrados);
        if (!Array.isArray(documentos)) throw new Error("No se pudo cargar el catálogo");
        total.textContent = `${documentos.length} documentos disponibles`;
        renderizar();
    } catch {
        total.textContent = "Biblioteca en preparación";
        vacio.hidden = false;
        vacio.textContent = "El catálogo se está preparando. Vuelve a cargar la página en unos momentos.";
    }

    buscador.addEventListener("input", () => { limite = 24; renderizar(); });
    categoria.addEventListener("change", () => { limite = 24; renderizar(); });
    orden.addEventListener("change", renderizar);
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
