document.addEventListener("DOMContentLoaded", () => {
    const configurarLista = (idLista, etiqueta, selectorFila) => {
        const lista = document.getElementById(idLista);
        if (!lista || document.querySelector(`[data-tools-for="${idLista}"]`)) return;
        const herramientas = document.createElement("div");
        herramientas.className = "admin-list-tools";
        herramientas.dataset.toolsFor = idLista;
        herramientas.innerHTML = `<label><span>Buscar</span><input type="search" placeholder="${etiqueta}"></label><label><span>Ordenar</span><select><option value="original">Más recientes</option><option value="az">Nombre A–Z</option><option value="za">Nombre Z–A</option></select></label><strong aria-live="polite"></strong>`;
        lista.insertAdjacentElement("beforebegin", herramientas);
        const campo = herramientas.querySelector("input"), orden = herramientas.querySelector("select"), total = herramientas.querySelector("strong");
        let observador;
        const actualizar = () => {
            observador?.disconnect();
            const consulta = campo.value.trim().toLocaleLowerCase();
            const filas = [...lista.querySelectorAll(selectorFila)];
            filas.forEach((fila, indice) => { if (fila.dataset.ordenOriginal === undefined) fila.dataset.ordenOriginal = indice; });
            filas.sort((a, b) => orden.value === "original" ? Number(a.dataset.ordenOriginal) - Number(b.dataset.ordenOriginal) : (orden.value === "az" ? 1 : -1) * a.textContent.trim().localeCompare(b.textContent.trim(), "es"));
            filas.forEach((fila) => { fila.hidden = !fila.textContent.toLocaleLowerCase().includes(consulta); lista.appendChild(fila); });
            total.textContent = `${filas.filter((fila) => !fila.hidden).length} de ${filas.length}`;
            observador?.observe(lista, { childList: true });
        };
        campo.addEventListener("input", actualizar);
        orden.addEventListener("change", actualizar);
        observador = new MutationObserver(actualizar);
        observador.observe(lista, { childList: true });
        actualizar();
    };
    configurarLista("listaUsuarios", "Nombre, correo o función", ".account-row");
    configurarLista("listaRecursos", "Título, categoría o ciclo", ".resource-row");
    configurarLista("listaAvisosAdmin", "Título o contenido del aviso", ".resource-row, article");
});
