const AulaX = (() => {
    const fotoPredeterminada = "https://i.pravatar.cc/150?img=12";

    function leerJSON(clave, valorPredeterminado) {
        try {
            const valor = localStorage.getItem(clave);
            return valor ? JSON.parse(valor) : valorPredeterminado;
        } catch {
            return valorPredeterminado;
        }
    }

    function obtenerUsuario() {
        return localStorage.getItem("usuario") || "Estudiante";
    }

    function obtenerFoto() {
        return localStorage.getItem("fotoPerfil") || fotoPredeterminada;
    }

    function cerrarSesion() {
        localStorage.removeItem("login");
        localStorage.removeItem("usuario");
        window.location.replace("login.html");
    }

    function configurarModoOscuroGlobal() {
        const aplicarModo = (oscuro) => {
            document.body.classList.toggle("dark", oscuro);
            const boton = document.getElementById("modoOscuroGlobal");
            if (boton) {
                boton.textContent = oscuro ? "☀️" : "🌙";
                boton.setAttribute("aria-label", oscuro ? "Activar modo claro" : "Activar modo oscuro");
            }
        };

        aplicarModo(localStorage.getItem("modo") === "oscuro");
        if (document.getElementById("modoOscuro")) return;

        const encabezado = document.querySelector("header");
        if (!encabezado) return;
        const boton = document.createElement("button");
        boton.id = "modoOscuroGlobal";
        boton.className = "modo-global";
        boton.type = "button";
        encabezado.appendChild(boton);
        aplicarModo(document.body.classList.contains("dark"));
        boton.addEventListener("click", () => {
            const oscuro = !document.body.classList.contains("dark");
            localStorage.setItem("modo", oscuro ? "oscuro" : "claro");
            aplicarModo(oscuro);
        });
    }

    function mostrarAviso(mensaje) {
        let aviso = document.querySelector(".aulax-aviso");
        if (!aviso) {
            aviso = document.createElement("div");
            aviso.className = "aulax-aviso";
            aviso.setAttribute("role", "status");
            document.body.appendChild(aviso);
        }
        aviso.textContent = mensaje;
        aviso.classList.add("visible");
        window.clearTimeout(mostrarAviso.temporizador);
        mostrarAviso.temporizador = window.setTimeout(() => aviso.classList.remove("visible"), 3200);
    }

    function configurarMenuMovil() {
        const sidebar = document.querySelector(".sidebar");
        const main = document.querySelector(".main");
        if (!sidebar || !main) return;

        let boton = document.getElementById("menuMobile");
        if (!boton) {
            boton = document.createElement("button");
            boton.id = "menuMobile";
            boton.className = "menu-mobile";
            boton.type = "button";
            boton.setAttribute("aria-label", "Abrir menú");
            boton.textContent = "☰";
            main.prepend(boton);
        }
        boton.addEventListener("click", (evento) => {
            evento.stopPropagation();
            sidebar.classList.toggle("mostrar");
        });
        document.addEventListener("click", (evento) => {
            if (!sidebar.contains(evento.target) && !boton.contains(evento.target)) sidebar.classList.remove("mostrar");
        });
        sidebar.querySelectorAll("a").forEach((enlace) => enlace.addEventListener("click", () => sidebar.classList.remove("mostrar")));
    }

    function agregarEnlaceSilabos() {
        const sidebar = document.querySelector(".sidebar");
        if (!sidebar || sidebar.querySelector('a[href="silabos.html"]')) return;
        const enlace = document.createElement("a");
        enlace.href = "silabos.html";
        enlace.textContent = "📄 Sílabos";
        const calendario = sidebar.querySelector('a[href="calendario.html"]');
        if (calendario) calendario.insertAdjacentElement("afterend", enlace);
        else sidebar.appendChild(enlace);
    }

    function mejorarCalendario() {
        const calendario = document.querySelector(".calendar");
        if (!calendario) return;
        const eventos = {
            3: "Homilética Bíblica II · 6:00 – 7:30",
            10: "Administración Eclesiástica · 6:00 – 8:15",
            11: "Teología Bíblica III y Sociología · 6:00 – 9:45",
            17: "Administración Eclesiástica · 6:00 – 8:15",
            18: "Consejería Pastoral y Teología Bíblica III · 6:00 – 9:45",
            26: "Psicopedagogía · 6:00 – 7:30"
        };
        const detalle = document.createElement("div");
        detalle.className = "calendar-detail";
        detalle.textContent = "Selecciona un día para consultar su agenda.";
        calendario.insertAdjacentElement("afterend", detalle);
        calendario.querySelectorAll(".day").forEach((dia) => {
            const numero = Number(dia.textContent.trim());
            dia.tabIndex = 0;
            dia.setAttribute("role", "button");
            if (eventos[numero]) dia.classList.add("has-event");
            const seleccionar = () => {
                calendario.querySelectorAll(".day.selected").forEach((elemento) => elemento.classList.remove("selected"));
                dia.classList.add("selected");
                detalle.textContent = eventos[numero] || `No hay actividades programadas para el ${numero} de agosto.`;
            };
            dia.addEventListener("click", seleccionar);
            dia.addEventListener("keydown", (evento) => {
                if (evento.key === "Enter" || evento.key === " ") { evento.preventDefault(); seleccionar(); }
            });
        });
    }

    function configurarSubciclos() {
        document.querySelectorAll("[data-ciclo]").forEach((boton) => {
            boton.addEventListener("click", () => {
                localStorage.setItem("cicloSeleccionado", boton.dataset.ciclo);
                window.location.href = "subciclos.html";
            });
        });

        const titulo = document.getElementById("tituloCiclo");
        if (!titulo) return;
        const ciclo = localStorage.getItem("cicloSeleccionado") || "Ciclo I";
        const numero = ciclo.match(/(I|II|III|IV|V|VI|VII|VIII)$/)?.[1] || "I";
        const avances = { I: 100, II: 100, III: 75, IV: 50, V: 25, VI: 10, VII: 0, VIII: 0 };
        const cantidades = { I: 8, II: 8, III: 7, IV: 8, V: 7, VI: 6, VII: 7, VIII: 8 };
        const materias = {
            I: [
                ["Investigación Bibliográfica, La Monografía y Normas APA", 2], ["Lenguaje y Comunicación", 2], ["Gramática I", 2], ["Introducción General a la Biblia", 2],
                ["Introducción al Antiguo Testamento", 6], ["Introducción al Nuevo Testamento", 6], ["Introducción a la Teología", 2], ["Inglés I", 2]
            ],
            II: [
                ["Pentateuco", 4], ["Evangelios Sinópticos", 4], ["Hechos de los Apóstoles", 2], ["Métodos de Estudio Bíblico", 2],
                ["Introducción a la Filosofía", 1], ["Teología de la Evangelización", 2], ["Gramática II", 2], ["Inglés II", 2]
            ],
            III: [
                ["Libros Históricos", 4], ["Libros Poéticos", 4], ["Teología Bíblica I", 2], ["Iglecrecimiento", 2],
                ["Informática I", 1], ["Etiqueta Social", 2], ["Inglés III", 2]
            ],
            IV: [
                ["Hermenéutica Bíblica I", 4], ["Homilética Bíblica I", 4], ["Libros Proféticos", 5], ["Psicopedagogía", 2],
                ["Misiología", 2], ["Teología Bíblica II", 2], ["Epístolas Universales", 4], ["Inglés IV", 2]
            ],
            V: [
                ["Consejería Pastoral", 2], ["Administración Eclesiástica", 4], ["Teología Bíblica III (Cristología)", 5], ["Introducción a la Sociología", 2],
                ["Hermenéutica Bíblica II", 2], ["Homilética Bíblica II", 3], ["Psicopedagogía", 2]
            ],
            VI: [
                ["Misión y Ministerio", 2], ["Pneumatología", 4], ["Teología Contemporánea", 5], ["Teología IV (Escatología)", 2],
                ["Teología Práctica", 2], ["Historia de la Iglesia I", 3]
            ],
            VII: [
                ["Teología del Culto", 2], ["Historia de la Iglesia II", 4], ["Teología Ministerial I", 2], ["Profecía Bíblica", 2],
                ["Ética Pastoral Cristiana", 2], ["Epístolas Paulinas", 4], ["Psicología Pastoral", 3]
            ],
            VIII: [
                ["Teología Ministerial II", 4], ["Asesoría de Tesis", 4], ["Desarrollo Personal y Discipulado", 2], ["Desarrollo Humano", 2],
                ["Inglés V", 2], ["Hebreo I", 2], ["Griego I", 2], ["Proyecto Tesina", 4]
            ]
        };
        titulo.textContent = `Subciclos · ${ciclo}`;
        const nombre = document.getElementById("nombreCiclo");
        const numeroCiclo = document.getElementById("numeroCiclo");
        const progreso = document.getElementById("progresoCiclo");
        if (nombre) nombre.textContent = ciclo;
        if (numeroCiclo) numeroCiclo.textContent = String(["I", "II", "III", "IV", "V", "VI", "VII", "VIII"].indexOf(numero) + 1).padStart(2, "0");
        if (progreso) progreso.style.width = `${avances[numero]}%`;
        const cantidad = cantidades[numero];
        const textoCantidad = document.getElementById("cantidadSubciclos");
        if (textoCantidad) textoCantidad.textContent = `${cantidad} subciclos · seguimiento individual`;

        const lista = document.getElementById("listaSubciclos");
        if (!lista) return;
        lista.innerHTML = "";
        materias[numero].forEach(([materia, creditos], indice) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "card subcycle-card";
            tarjeta.innerHTML = `<span>SUBCICLO ${String(indice + 1).padStart(2, "0")}</span><h3></h3><p>${creditos} crédito${creditos === 1 ? "" : "s"}</p><button type="button">Abrir materia</button>`;
            tarjeta.querySelector("h3").textContent = materia;
            tarjeta.querySelector("button").addEventListener("click", () => {
                localStorage.setItem("subcicloSeleccionado", materia);
                localStorage.setItem("cicloDeSubciclo", ciclo);
                window.location.href = "materia.html";
            });
            lista.appendChild(tarjeta);
        });
    }

    function configurarMateria() {
        const nombre = localStorage.getItem("subcicloSeleccionado");
        const ciclo = localStorage.getItem("cicloDeSubciclo") || "Ciclo académico";
        if (!nombre) return;
        const titulo = document.getElementById("tituloMateria");
        const nombreMateria = document.getElementById("nombreMateria");
        const cicloMateria = document.getElementById("cicloMateria");
        if (titulo) titulo.textContent = nombre;
        if (nombreMateria) nombreMateria.textContent = nombre;
        if (cicloMateria) cicloMateria.textContent = ciclo;
        document.title = `${nombre} | STESIN`;

        const documentosPorMateria = {
            "Introducción a la Sociología": [
                ["SÍLABO - INTRODUCCIÓN A LA SOCIOLOGÍA.pdf", "Sílabo", "documentos/introduccion-sociologia"],
                ["INTRODUCCIÓN A LA SOCIOLOGÍA - SESIÓN 1 (STESIN).pptx", "Sesión 1", "documentos/introduccion-sociologia"],
                ["INTRODUCCIÓN A LA SOCIOLOGÍA - SESIÓN 2 (STESIN).pptx", "Sesión 2", "documentos/introduccion-sociologia"]
            ],
            "Introducción al Antiguo Testamento": [
                ["1. INTRODUCCION AL A.T.docx", "Documento", "documentos/introduccion-antiguo-testamento", "Introducción al Antiguo Testamento"]
            ],
            "Introducción al Nuevo Testamento": [
                ["2. Introduccion-al-Nuevo-Testamento.doc", "Documento", "documentos/introduccion-nuevo-testamento", "Introducción al Nuevo Testamento"]
            ],
            "Investigación Bibliográfica, La Monografía y Normas APA": [
                ["Citas_bibliograficas-APA-2015.pdf", "Guía", "documentos/investigacion-bibliografica-apa", "Citas bibliográficas APA 2015"],
                ["CONTRA CARATULA PARA LIBRO.docx", "Plantilla", "documentos/investigacion-bibliografica-apa", "Contra carátula para libro"],
                ["LA_MONOGRAFÍA_YPR_SETIEMBRE_2012.pdf", "Lectura", "documentos/investigacion-bibliografica-apa", "La monografía"],
                ["ORGANIGRAMA PARA LIBRROS.docx", "Plantilla", "documentos/investigacion-bibliografica-apa", "Organigrama para libros"],
                ["PASTOR OISER.cdr", "Recurso de diseño", "documentos/investigacion-bibliografica-apa", "Pastor Oiser"],
                ["PASTOR OISER_17.cdr", "Recurso de diseño", "documentos/investigacion-bibliografica-apa", "Pastor Oiser 17"],
                ["SILABO MONOGRAFIA -APA.docx", "Sílabo", "documentos/investigacion-bibliografica-apa", "Sílabo de Monografía y APA"],
                ["ORIENTACIONES_TRABAJAR_MONOGRAFÍA_YPR - copia.doc", "Guía", "documentos/investigacion-bibliografica-apa", "Orientaciones para trabajar la monografía"],
                ["CARATULA_1.jpg", "Carátula", "documentos/investigacion-bibliografica-apa", "Carátula del libro · Frente"],
                ["CARATULA_2.jpg", "Carátula", "documentos/investigacion-bibliografica-apa", "Carátula del libro · Reverso"]
            ],
            "Lenguaje y Comunicación": [
                ["1 curso Principios de la Comunicación MATERIAL Ymber ok.pdf", "Material", "documentos/lenguaje-comunicacion", "Principios de la Comunicación"],
                ["SILABO-SEMINARIO-Principios-comunicacion.docx", "Sílabo", "documentos/lenguaje-comunicacion", "Sílabo · Principios de Comunicación"],
                ["1 lengua y comunicación gramática.pdf", "Lectura", "documentos/lenguaje-comunicacion-gramatica", "Lengua y comunicación"],
                ["12 libro de lengua y comunicacion.pdf", "Libro", "documentos/lenguaje-comunicacion-gramatica", "Libro de Lengua y Comunicación"],
                ["TEMA 6.LENGUAJE Y COMUNICACIÓN.pdf", "Tema", "documentos/lenguaje-comunicacion-gramatica", "Tema 6 · Lenguaje y comunicación"],
                ["TEMA_1_EL_LENGUAJE_Y_LA_COMUNICACION.pdf", "Tema", "documentos/lenguaje-comunicacion-gramatica", "Tema 1 · El lenguaje y la comunicación"],
                ["CONTRA CARATULA PARA LIBRO.docx", "Material compartido", "documentos/material-tres-cursos", "Contra carátula para libro"],
                ["Cratula del Libro.docx", "Material compartido", "documentos/material-tres-cursos", "Carátula del libro"],
                ["Material para el estudiante tres cursos 1º año 2019.pdf", "Material compartido", "documentos/material-tres-cursos", "Material para el estudiante · 1.º año"],
                ["ORGANIGRAMA PARA LIBRROS.docx", "Material compartido", "documentos/material-tres-cursos", "Organigrama para libros"]
            ],
            "Gramática I": [
                ["SILABO DE INGLES Y GRAMATICA - FALTA.docx", "Sílabo", "documentos/silabos-ingles-gramatica", "Sílabo de Inglés y Gramática"],
                ["1 gramatica_raenueva lengua española ok.pdf", "Lectura", "documentos/lenguaje-comunicacion-gramatica", "Gramática de la lengua española"],
                ["1 lengua y comunicación gramática.pdf", "Lectura", "documentos/lenguaje-comunicacion-gramatica", "Lengua y comunicación"],
                ["Gramatica y comunicación.pdf", "Lectura", "documentos/lenguaje-comunicacion-gramatica", "Gramática y comunicación"],
                ["gramatica.pdf", "Lectura", "documentos/lenguaje-comunicacion-gramatica", "Gramática"],
                ["gramatica_texto.pdf", "Lectura", "documentos/lenguaje-comunicacion-gramatica", "Gramática · texto"],
                ["Material para el estudiante tres cursos 1º año 2019.pdf", "Material compartido", "documentos/material-tres-cursos", "Material para el estudiante · 1.º año"]
            ],
            "Introducción General a la Biblia": [
                ["INTRODUCCIÓN BIBLICA.pdf", "Lectura", "documentos/introduccion-general-biblia", "Introducción Bíblica"],
                ["INTRODUCCIÓN-GENERAL-A-LA-BIBLIA Ps. Freddy Joel.docx", "Documento", "documentos/introduccion-general-biblia", "Introducción General a la Biblia · Ps. Freddy Joel"],
                ["SÍLABO-IGAB Ps. Freddy Joel.docx", "Sílabo", "documentos/introduccion-general-biblia", "Sílabo · Introducción General a la Biblia"],
                ["CONTRA CARATULA PARA LIBRO.docx", "Material compartido", "documentos/material-tres-cursos", "Contra carátula para libro"],
                ["Cratula del Libro.docx", "Material compartido", "documentos/material-tres-cursos", "Carátula del libro"],
                ["Material para el estudiante tres cursos 1º año 2019.pdf", "Material compartido", "documentos/material-tres-cursos", "Material para el estudiante · 1.º año"],
                ["ORGANIGRAMA PARA LIBRROS.docx", "Material compartido", "documentos/material-tres-cursos", "Organigrama para libros"]
            ],
            "Inglés I": [
                ["SILABO DE INGLES Y GRAMATICA - FALTA.docx", "Sílabo", "documentos/silabos-ingles-gramatica", "Sílabo de Inglés y Gramática"]
            ],
            "Pentateuco": [
                ["1. Pentateuco.doc", "Documento", "documentos/pentateuco", "Pentateuco"],
                ["Garcia Lopez, Felix. el Pentateuco.pdf", "Lectura", "documentos/pentateuco", "El Pentateuco · García López"]
            ],
            "Evangelios Sinópticos": [
                ["2. Sinopticos.doc", "Documento", "documentos/evangelios-sinopticos", "Evangelios Sinópticos"],
                ["3. Pablo-Hoff-sinopticos.pdf", "Lectura", "documentos/evangelios-sinopticos", "Sinópticos · Pablo Hoff"]
            ],
            "Hechos de los Apóstoles": [
                ["4. hechos_de_los_apostoles.pdf", "Lectura", "documentos/hechos-apostoles", "Hechos de los Apóstoles"]
            ],
            "Métodos de Estudio Bíblico": [
                ["5. Rick Warren METODOS DE ESTUDIO BIBLICO PERSONAL (V. 2.0).pdf", "Guía", "documentos/metodos-estudio-biblico", "Métodos de Estudio Bíblico Personal · Rick Warren"],
                ["CONTRA CARATULA PARA LIBRO.docx", "Material compartido", "documentos/material-tres-cursos", "Contra carátula para libro"],
                ["Cratula del Libro.docx", "Material compartido", "documentos/material-tres-cursos", "Carátula del libro"],
                ["Material para el estudiante tres cursos 1º año 2019.pdf", "Material compartido", "documentos/material-tres-cursos", "Material para el estudiante · 1.º año"],
                ["ORGANIGRAMA PARA LIBRROS.docx", "Material compartido", "documentos/material-tres-cursos", "Organigrama para libros"]
            ],
            "Teología de la Evangelización": [
                ["6. La evangelizacion poderosa.pdf", "Lectura", "documentos/teologia-evangelizacion", "La evangelización poderosa"],
                ["EVANGELISMO 1.doc", "Documento", "documentos/teologia-evangelizacion", "Evangelismo 1"]
            ],
            "Libros Históricos": [
                ["1. Libros Históricos - Freddy Ramos.pdf", "Lectura", "documentos/libros-historicos", "Libros Históricos · Freddy Ramos"]
            ],
            "Libros Poéticos": [
                ["2. libros poeticos.pdf", "Lectura", "documentos/libros-poeticos", "Libros Poéticos"],
                ["Pablo Hoff - Libros poeticos.pdf", "Lectura", "documentos/libros-poeticos", "Libros Poéticos · Pablo Hoff"]
            ],
            "Teología Bíblica I": [
                ["3. TEOLOGIA BIBLICA Y SISTEMATICA.doc", "Documento", "documentos/teologia-biblica-i", "Teología Bíblica y Sistemática"],
                ["3. Teologia biblica.PDF", "Lectura", "documentos/teologia-biblica-i", "Teología Bíblica"]
            ],
            "Iglecrecimiento": [
                ["4. IGLECRECIMIENT_LIDER.pdf", "Lectura", "documentos/iglecrecimiento", "Iglecrecimiento y liderazgo"]
            ],
            "Hermenéutica Bíblica I": [
                ["1. hermeneùtica.doc", "Documento", "documentos/hermeneutica-biblica-i", "Hermenéutica Bíblica I"]
            ],
            "Homilética Bíblica I": [
                ["2. HOMILÉTICA 1.doc", "Documento", "documentos/homiletica-biblica-i", "Homilética Bíblica I"]
            ],
            "Libros Proféticos": [
                ["3.  LOS PROFETAS MENORES.pdf", "Lectura", "documentos/libros-profeticos", "Los Profetas Menores"]
            ],
            "Teología Bíblica II": [
                ["4. TEOLOGIA BIBLICA Y SISTEMATICA II.doc", "Documento", "documentos/teologia-biblica-ii", "Teología Bíblica y Sistemática II"]
            ],
            "Misiología": [
                ["5.  Misionologia.doc", "Documento", "documentos/misiologia", "Misiología"]
            ],
            "Epístolas Universales": [
                ["6. EPISTOLAS UNIVERSALES.pdf", "Lectura", "documentos/epistolas-universales", "Epístolas Universales"]
            ],
            "Hermenéutica Bíblica II": [
                ["HERMENUTICA BIBLICA.ppt", "Presentación", "documentos/hermeneutica-biblica-ii"],
                ["4. . Hermeneutica Recomendado.pdf", "Versión 2 · Lectura", "documentos/ciclo-v-version-2/hermeneutica-biblica-ii", "Hermenéutica recomendada"],
                ["4. HERMENEUTICA II.doc", "Versión 2 · Documento", "documentos/ciclo-v-version-2/hermeneutica-biblica-ii", "Hermenéutica II"]
            ],
            "Homilética Bíblica II": [
                ["HOMILETICA BIBLICA.ppt", "Presentación", "documentos/homiletica-biblica-ii"],
                ["5. Manual de Homilética II.pdf", "Versión 2 · Lectura", "documentos/ciclo-v-version-2/homiletica-biblica-ii", "Manual de Homilética II"],
                ["MANUAL DE HOMILETICAi II. RECOMENDADO.doc", "Versión 2 · Documento", "documentos/ciclo-v-version-2/homiletica-biblica-ii", "Manual de Homilética II · Recomendado"]
            ],
            "Administración Eclesiástica": [
                ["Administración Eclesiastica.ppt", "Presentación", "documentos/administracion-eclesiastica"],
                ["2, Sistema de Administración Recomendado.doc", "Versión 2 · Documento", "documentos/ciclo-v-version-2/administracion-eclesiastica", "Sistema de Administración · Recomendado"],
                ["2. ADMINISTRACIÓN ECLESIASTICA.pdf", "Versión 2 · Lectura", "documentos/ciclo-v-version-2/administracion-eclesiastica", "Administración Eclesiástica"]
            ],
            "Consejería Pastoral": [
                ["SILABUS DEL CURSO CONSEJERÍA PASTORAL.docx", "Sílabo", "documentos/consejeria-pastoral"],
                ["¿QUIEN NECESITA CONSEJERIA PASTORAL.pdf", "Lectura", "documentos/consejeria-pastoral"],
                ["CONSEJERIA PASTORAL - preguntas.docx", "Preguntas", "documentos/consejeria-pastoral"],
                ["1. CONSEJERÍA - Jaime Morales Recomendado.pdf", "Versión 2 · Lectura", "documentos/ciclo-v-version-2/consejeria-pastoral", "Consejería · Jaime Morales"],
                ["1. CONSEJERIA PASTORAL_1.doc", "Versión 2 · Documento", "documentos/ciclo-v-version-2/consejeria-pastoral", "Consejería Pastoral"]
            ],
            "Teología Bíblica III (Cristología)": [
                ["3. Berkhof - Teologia (Escatologia).doc", "Versión 2 · Documento", "documentos/ciclo-v-version-2/teologia-biblica-iii", "Teología · Berkhof (Escatología)"],
                ["3. cursopractico_teologia-fcolacueva I al V.pdf", "Versión 2 · Lectura", "documentos/ciclo-v-version-2/teologia-biblica-iii", "Curso práctico de Teología"]
            ],
            "Misión y Ministerio": [
                ["2.   Misionologia.doc", "Documento", "documentos/mision-ministerio", "Misión y Ministerio"]
            ],
            "Pneumatología": [
                ["1. Pneumatologia rECOMENDADO.doc", "Documento", "documentos/pneumatologia", "Pneumatología · Recomendado"],
                ["1. Pneumatologia.pdf", "Lectura", "documentos/pneumatologia", "Pneumatología"]
            ],
            "Teología Contemporánea": [
                ["3. Diccionario de Teología Contemporánea -B. Ramm.pdf", "Lectura", "documentos/teologia-contemporanea", "Diccionario de Teología Contemporánea · B. Ramm"],
                ["3. TEOLOGIA CONTEMPORANEA.pdf", "Lectura", "documentos/teologia-contemporanea", "Teología Contemporánea"]
            ],
            "Teología IV (Escatología)": [
                ["4.Berkhof - Teologia IV. (Escatologia).doc", "Documento", "documentos/teologia-iv-escatologia", "Teología IV · Escatología · Berkhof"]
            ],
            "Historia de la Iglesia I": [
                ["6. Historia de la Iglesia curso corto.doc", "Documento", "documentos/historia-iglesia-i", "Historia de la Iglesia · Curso corto"],
                ["6. Historia de la Iglesia1 Recomendado.pdf", "Lectura", "documentos/historia-iglesia-i", "Historia de la Iglesia I · Recomendado"]
            ],
            "Teología del Culto": [
                ["1. Teologia del culto.pdf", "Lectura", "documentos/teologia-culto", "Teología del Culto"],
                ["1. -TEOLOGIA DEL CULTO.pdf", "Lectura", "documentos/teologia-culto", "Teología del Culto · Material complementario"]
            ],
            "Historia de la Iglesia II": [
                ["2. Historia-de-La-Iglesia II.pdf", "Lectura", "documentos/historia-iglesia-ii", "Historia de la Iglesia II"]
            ],
            "Teología Ministerial I": [
                ["3. Teologia Ministerial I.pdf", "Lectura", "documentos/teologia-ministerial-i", "Teología Ministerial I"]
            ],
            "Profecía Bíblica": [
                ["4. Profecia Biblica.pdf", "Lectura", "documentos/profecia-biblica", "Profecía Bíblica"],
                ["4. SEPARATA - ESCATALOGIAprofesia.pdf", "Separata", "documentos/profecia-biblica", "Escatología y profecía"]
            ],
            "Ética Pastoral Cristiana": [
                ["5. etica_pastoral_ministerial.pdf", "Lectura", "documentos/etica-pastoral-cristiana", "Ética Pastoral Ministerial"],
                ["5-Etica-Pastoral Recomendada.pdf", "Lectura", "documentos/etica-pastoral-cristiana", "Ética Pastoral · Recomendado"]
            ],
            "Epístolas Paulinas": [
                ["6. epistolas paulinas.pdf", "Lectura", "documentos/epistolas-paulinas", "Epístolas Paulinas"],
                ["6_Epistolas_Paulinas.pdf", "Lectura", "documentos/epistolas-paulinas", "Epístolas Paulinas · Material complementario"]
            ],
            "Psicología Pastoral": [
                ["7. Psicologia pastoral de la iglesia.PDF", "Lectura", "documentos/psicologia-pastoral", "Psicología Pastoral de la Iglesia"]
            ],
            "Teología Ministerial II": [
                ["1.  Teologia Ministerial II Recomendad.pdf", "Lectura", "documentos/teologia-ministerial-ii", "Teología Ministerial II · Recomendado"]
            ],
            "Desarrollo Personal y Discipulado": [
                ["2. DISCIPULADO.doc", "Documento", "documentos/desarrollo-personal-discipulado", "Discipulado"],
                ["3. Discipulado Recomendado.pdf", "Lectura", "documentos/desarrollo-personal-discipulado", "Discipulado · Recomendado"]
            ],
            "Psicopedagogía": [
                ["Resumen_Pedagogia_de_Jesus-v4.pdf", "Resumen", "documentos/psicopedagogia", "Resumen: Pedagogía de Jesús"],
                ["Libro-La-Pedagogia-de-Jesus.pdf", "Libro", "documentos/psicopedagogia", "Libro: La Pedagogía de Jesús"]
            ]
        };
        const documentos = (documentosPorMateria[nombre] || []).filter(([, sesion]) => !/s[ií]labo|silabus/i.test(sesion));
        const contenedor = document.getElementById("documentosMateria");
        const lista = document.getElementById("listaDocumentos");
        if (!contenedor || !lista || !documentos.length) return;
        contenedor.querySelector(".icon").textContent = "📚";
        contenedor.querySelector("h2").textContent = "Material disponible";
        contenedor.querySelector("p").textContent = "Descarga los documentos y recursos de esta materia.";
        lista.innerHTML = "";
        documentos.forEach(([archivo, sesion, ruta, nombreVisible = archivo]) => {
            const enlace = document.createElement("a");
            enlace.className = "document-link";
            enlace.href = `${ruta}/${archivo}`;
            enlace.download = archivo;
            const formato = archivo.split(".").pop().toUpperCase();
            enlace.innerHTML = `<span class="file-icon">📄</span><span><strong></strong><small>${sesion} · ${formato}</small></span>`;
            enlace.querySelector("strong").textContent = nombreVisible;
            lista.appendChild(enlace);
        });
    }

    function inicializarInterfaz() {
        const paginaActual = window.location.pathname.split("/").pop() || "index.html";

        document.querySelector("header .profile")?.remove();

        document.querySelectorAll(".sidebar a").forEach((enlace) => {
            const activa = enlace.getAttribute("href") === paginaActual;
            enlace.classList.toggle("active", activa);
            if (activa) enlace.setAttribute("aria-current", "page");
        });

        document.querySelectorAll("#usuarioHeader").forEach((elemento) => {
            elemento.textContent = obtenerUsuario();
        });

        document.querySelectorAll("#fotoHeader").forEach((imagen) => {
            imagen.src = obtenerFoto();
        });

        document.querySelectorAll("[data-pagina]").forEach((boton) => {
            boton.addEventListener("click", () => {
                const pagina = boton.dataset.pagina;
                if (pagina) window.location.href = pagina;
            });
        });

        document.querySelectorAll("[data-cerrar-sesion]").forEach((boton) => {
            boton.addEventListener("click", cerrarSesion);
        });

        agregarEnlaceSilabos();
        configurarMenuMovil();
        configurarModoOscuroGlobal();
        mejorarCalendario();
        configurarSubciclos();
        configurarMateria();
    }

    const paginaActual = window.location.pathname.split("/").pop() || "index.html";
    const paginasPublicas = ["login.html", "registro.html"];
    if (!paginasPublicas.includes(paginaActual) && localStorage.getItem("login") !== "true") {
        window.location.replace("login.html");
    }

    document.addEventListener("DOMContentLoaded", inicializarInterfaz);

    return {
        obtenerClasesCompletadas: () => leerJSON("clasesCompletadas", []),
        guardarClasesCompletadas: (lista) => localStorage.setItem("clasesCompletadas", JSON.stringify(lista)),
        obtenerUsuario,
        obtenerFoto,
        cerrarSesion,
        leerJSON
    };
})();
