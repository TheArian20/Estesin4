document.addEventListener("DOMContentLoaded", async () => {
    const lista = document.getElementById("listaBiblioteca");
    if (!lista) return;
    const buscador = document.getElementById("buscarBiblioteca");
    const filtros = document.getElementById("filtrosBiblioteca");
    const categoria = document.getElementById("categoriaBiblioteca");
    const orden = document.getElementById("ordenBiblioteca");
    const ciclo = document.createElement("select");
    ciclo.id = "cicloBiblioteca";
    ciclo.innerHTML = '<option value="todos">Todos los ciclos</option><option>Ciclo I</option><option>Ciclo II</option><option>Ciclo III</option><option>Ciclo IV</option><option>Ciclo V</option><option>Ciclo VI</option><option>Ciclo VII</option><option>Ciclo VIII</option>';
    const etiquetaCiclo = document.createElement("label");
    etiquetaCiclo.textContent = "Ciclo";
    etiquetaCiclo.appendChild(ciclo);
    orden.closest("label").insertAdjacentElement("beforebegin", etiquetaCiclo);
    const contador = document.getElementById("contadorResultados");
    const total = document.getElementById("totalDocumentos");
    const vacio = document.getElementById("bibliotecaVacia");
    const cargarMas = document.getElementById("cargarMas");
    const bibliotecaDrive = document.body.dataset.bibliotecaDrive;
    let documentos = [];
    let filtro = "todos";
    let limite = 24;
    const favoritos = new Set(JSON.parse(localStorage.getItem("bibliotecaFavoritos") || "[]"));
    const busquedaInicial = new URLSearchParams(window.location.search).get("buscar");
    if (busquedaInicial) buscador.value = busquedaInicial;

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
        const id = documento.enlaceDrive || documento.nombre;
        const tarjeta = document.createElement("article");
        tarjeta.className = "library-item library-entry";
        const enlace = document.createElement("a");
        enlace.className = "library-open";
        enlace.href = documento.enlaceDrive || bibliotecaDrive;
        enlace.target = "_blank";
        enlace.rel = "noopener";
        enlace.innerHTML = `<span class="library-file-icon">${iconoDocumento(tipo)}</span><span class="library-file-data"><strong></strong><small></small></span>`;
        enlace.querySelector("strong").textContent = documento.nombre;
        enlace.querySelector("small").textContent = `${documento.categoria}${documento.materia ? ` · ${documento.materia}` : ""} · ${tipo.toUpperCase()} · ${documento.enlaceDrive ? "Abrir documento" : "Abrir en Google Drive"}`;
        const favorito = document.createElement("button");
        favorito.type = "button";
        favorito.className = `library-favorite${favoritos.has(id) ? " active" : ""}`;
        favorito.setAttribute("aria-label", "Guardar en favoritos");
        favorito.textContent = favoritos.has(id) ? "★" : "☆";
        favorito.addEventListener("click", () => { favoritos.has(id) ? favoritos.delete(id) : favoritos.add(id); localStorage.setItem("bibliotecaFavoritos", JSON.stringify([...favoritos])); renderizar(); });
        enlace.addEventListener("click", async () => {
            localStorage.setItem("ultimaLectura", documento.nombre);
            const cliente = window.STESIN_SUPABASE;
            const { data: { user } = {} } = await cliente?.auth.getUser?.() || {};
            if (user) await cliente.from("progreso_lectura").upsert({ usuario_id: user.id, recurso_id: id, recurso_nombre: documento.nombre, ciclo: documento.ciclo || null, leido_en: new Date().toISOString() });
        });
        tarjeta.append(enlace, favorito);
        return tarjeta;
    }

    function renderizar() {
        const consulta = normalizar(buscador.value.trim());
        const filtrados = documentos.filter((documento) => {
            const coincideTexto = !consulta || normalizar(documento.nombre).includes(consulta);
            const coincideTipo = filtro === "todos" || (filtro === "favoritos" ? favoritos.has(documento.enlaceDrive || documento.nombre) : tipoDocumento(documento.nombre) === filtro);
            const coincideCategoria = categoria.value === "todas" || documento.categoria === categoria.value;
            const coincideCiclo = ciclo.value === "todos" || documento.ciclo === ciclo.value;
            return coincideTexto && coincideTipo && coincideCategoria && coincideCiclo;
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

    function mostrarContinuidadDeLectura() {
        const hero = document.querySelector(".library-hero");
        if (!hero || document.getElementById("continuarLectura")) return;
        const ultimoNombre = localStorage.getItem("ultimaLectura");
        const ultimo = documentos.find((documento) => documento.nombre === ultimoNombre);
        const bloque = document.createElement("aside");
        bloque.id = "continuarLectura";
        bloque.className = "library-continue";
        if (ultimo) {
            bloque.innerHTML = '<span>CONTINÚA TU LECTURA</span><strong></strong><a target="_blank" rel="noopener">Abrir nuevamente</a>';
            bloque.querySelector("strong").textContent = ultimo.nombre;
            bloque.querySelector("a").href = ultimo.enlaceDrive || bibliotecaDrive;
        } else {
            bloque.innerHTML = '<span>ESPACIO PERSONAL</span><strong>Guarda tus recursos favoritos</strong><a href="#filtrosBiblioteca">Explorar la biblioteca</a>';
        }
        hero.appendChild(bloque);
    }

    async function cargarRecursosAdministrados() {
        const cliente = window.STESIN_SUPABASE;
        if (!cliente) return [];
        const { data, error } = await cliente.from("recursos_personalizados")
            .select("titulo, enlace, categoria, ciclo, materia, tipo, creado_en")
            .order("creado_en", { ascending: false });
        if (error) return [];
        return (data || []).map((recurso) => ({
            nombre: recurso.titulo,
            enlaceDrive: recurso.enlace,
            categoria: recurso.categoria || "General",
            materia: recurso.materia || "",
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
        mostrarContinuidadDeLectura();
    } catch {
        total.textContent = "Biblioteca en preparación";
        vacio.hidden = false;
        vacio.textContent = "El catálogo se está preparando. Vuelve a cargar la página en unos momentos.";
    }

    buscador.addEventListener("input", () => { limite = 24; renderizar(); });
    categoria.addEventListener("change", () => { limite = 24; renderizar(); });
    ciclo.addEventListener("change", () => { limite = 24; renderizar(); });
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
