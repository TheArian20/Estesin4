document.addEventListener("DOMContentLoaded", () => {
    const ciclo = localStorage.getItem("cicloVideosSeleccionado") || "Ciclo I";
    const numero = ciclo.match(/(I|II|III|IV|V|VI|VII|VIII)$/)?.[1] || "I";
    const materias = {
        I: ["Investigación Bibliográfica, La Monografía y Normas APA", "Lenguaje y Comunicación", "Gramática I", "Introducción General a la Biblia", "Introducción al Antiguo Testamento", "Introducción al Nuevo Testamento", "Introducción a la Teología", "Inglés I"],
        II: ["Pentateuco", "Evangelios Sinópticos", "Hechos de los Apóstoles", "Métodos de Estudio Bíblico", "Introducción a la Filosofía", "Teología de la Evangelización", "Gramática II", "Inglés II"],
        III: ["Libros Históricos", "Libros Poéticos", "Teología Bíblica I", "Iglecrecimiento", "Informática I", "Etiqueta Social", "Inglés III"],
        IV: ["Hermenéutica Bíblica I", "Homilética Bíblica I", "Libros Proféticos", "Psicopedagogía", "Misiología", "Teología Bíblica II", "Epístolas Universales", "Inglés IV"],
        V: ["Consejería Pastoral", "Administración Eclesiástica", "Teología Bíblica III (Cristología)", "Introducción a la Sociología", "Hermenéutica Bíblica II", "Homilética Bíblica II", "Psicopedagogía"],
        VI: ["Misión y Ministerio", "Pneumatología", "Teología Contemporánea", "Teología IV (Escatología)", "Teología Práctica", "Historia de la Iglesia I"],
        VII: ["Teología del Culto", "Historia de la Iglesia II", "Teología Ministerial I", "Profecía Bíblica", "Ética Pastoral Cristiana", "Epístolas Paulinas", "Psicología Pastoral"],
        VIII: ["Teología Ministerial II", "Asesoría de Tesis", "Desarrollo Personal y Discipulado", "Desarrollo Humano", "Inglés V", "Hebreo I", "Griego I", "Proyecto Tesina"]
    };
    const lista = document.getElementById("listaVideos");
    document.getElementById("tituloVideos").textContent = `Clases grabadas · ${ciclo}`;
    document.getElementById("subtituloVideos").textContent = `Subciclos de ${ciclo}`;
    document.getElementById("descripcionVideos").textContent = "Selecciona una materia para ver su clase grabada.";
    document.title = `Clases grabadas · ${ciclo} | STESIN`;

    (materias[numero] || []).forEach((materia, indice) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "card subcycle-card";
        tarjeta.innerHTML = `<span>SUBCICLO ${String(indice + 1).padStart(2, "0")}</span><h3></h3><p>Espacio de video preparado.</p><button type="button">Ver clase grabada</button>`;
        tarjeta.querySelector("h3").textContent = materia;
        tarjeta.querySelector("button").addEventListener("click", () => {
            localStorage.setItem("claseGrabadaSeleccionada", materia);
            window.location.href = "clase-grabada.html";
        });
        lista.appendChild(tarjeta);
    });
});
