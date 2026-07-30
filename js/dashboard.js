/* Lógica exclusiva del panel de inicio de STESIN. */
(() => {
    "use strict";

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);
    const leerJSON = (clave, predeterminado) => {
        try {
            const valor = localStorage.getItem(clave);
            return valor ? JSON.parse(valor) : predeterminado;
        } catch {
            return predeterminado;
        }
    };
    const limitar = (valor, minimo, maximo) => Math.min(Math.max(valor, minimo), maximo);

    if (localStorage.getItem("login") !== "true") {
        window.location.replace("login.html");
        return;
    }

    const estado = {
        usuario: localStorage.getItem("usuario") || "Estudiante",
        foto: localStorage.getItem("fotoPerfil") || "https://i.pravatar.cc/150?img=12",
        clases: leerJSON("clasesCompletadas", []),
        tareas: leerJSON("tareasEntregadas", []),
        progreso: limitar(Number(localStorage.getItem("progresoCurso")) || 0, 0, 100)
    };

    function escribir(selector, valor) {
        const elemento = $(selector);
        if (elemento) elemento.textContent = valor;
    }

    function animarContador(selector, destino, intervalo) {
        const elemento = $(selector);
        if (!elemento) return;
        let actual = 0;
        const paso = destino % 1 ? 0.1 : 1;
        const temporizador = window.setInterval(() => {
            actual = Math.min(actual + paso, destino);
            elemento.textContent = actual.toFixed(destino % 1 ? 1 : 0);
            if (actual === destino) window.clearInterval(temporizador);
        }, intervalo);
    }

    function actualizarFechaYSaludo() {
        const ahora = new Date();
        escribir("#fecha", ahora.toLocaleDateString("es-ES", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        }));

        const hora = ahora.getHours();
        const saludo = hora < 12 ? "☀️ Buenos días" : hora < 18 ? "🌤️ Buenas tardes" : "🌙 Buenas noches";
        escribir("#saludo", `${saludo}, ${estado.usuario}`);
    }

    function actualizarReloj() {
        escribir("#hora", new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
        }));
    }

    function actualizarProgreso() {
        const porcentaje = estado.progreso;
        ["#barraCurso", "#barraContinuar", "#barraBanner", "#barraPerfil"].forEach((selector) => {
            const barra = $(selector);
            if (barra) barra.style.width = `${porcentaje}%`;
        });
        escribir("#textoProgreso", `${porcentaje}% completado`);
        escribir("#textoBanner", `${porcentaje}% completado`);
        escribir("#porcentajeBanner", `${porcentaje}%`);
        escribir("#textoPerfil", `${porcentaje}% completado`);
    }

    function actualizarPerfil() {
        ["#fotoHeader", "#fotoPerfilDashboard"].forEach((selector) => {
            const imagen = $(selector);
            if (imagen) imagen.src = estado.foto;
        });
        escribir("#usuarioHeader", estado.usuario);
        escribir("#nombrePerfil", estado.usuario);
    }

    function actualizarLogros() {
        const logros = [
            ["#logroHTML", estado.progreso >= 25],
            ["#logroConstancia", estado.progreso >= 50],
            ["#logroProyecto", estado.progreso >= 100]
        ];
        logros.forEach(([selector, conseguido]) => {
            const logro = $(selector);
            if (logro) logro.classList.toggle("desbloqueado", conseguido);
        });
    }

    function mostrarAviso(mensaje) {
        const aviso = document.createElement("div");
        aviso.className = "toast mostrar";
        aviso.textContent = mensaje;
        document.body.appendChild(aviso);
        window.setTimeout(() => aviso.remove(), 3000);
    }

    function completarClase() {
        if (estado.progreso >= 100) {
            mostrarAviso("🏆 Ya completaste este curso.");
            return;
        }
        estado.progreso = limitar(estado.progreso + 10, 0, 100);
        localStorage.setItem("progresoCurso", estado.progreso);
        actualizarProgreso();
        actualizarPerfil();
        actualizarLogros();
        mostrarAviso(estado.progreso === 100 ? "🏆 ¡Ciclo completado!" : "🎉 Progreso actualizado.");
    }

    function configurarBuscador() {
        const buscador = $("#buscador");
        if (!buscador) return;
        buscador.addEventListener("input", () => {
            const consulta = buscador.value.toLowerCase().trim();
            $$(".curso").forEach((curso) => {
                curso.classList.toggle("oculto", !curso.dataset.curso.toLowerCase().includes(consulta));
            });
        });
    }

    function configurarNotificaciones() {
        const campana = $("#campana");
        const panel = $("#panelNotificaciones");
        const lista = $("#listaNotificaciones");
        const contador = $("#contadorNotificaciones");
        const resumen = $("#resumenNotificaciones");
        const marcarLeidas = $("#marcarLeidas");
        if (!campana || !panel || !lista || !contador) return;

        const clases = [
            { fecha: "2026-07-06T18:00:00", nombre: "Homilética Bíblica II", detalle: "Lunes 06 · 6:00 – 7:30" },
            { fecha: "2026-07-14T18:00:00", nombre: "Consejería Pastoral", detalle: "Martes 14 · 6:00 – 7:30" },
            { fecha: "2026-07-20T18:00:00", nombre: "Administración Eclesiástica", detalle: "Lunes 20 · 6:00 – 8:15" },
            { fecha: "2026-07-21T18:00:00", nombre: "Introducción a la Sociología", detalle: "Martes 21 · 7:30 – 9:00" },
            { fecha: "2026-07-29T18:00:00", nombre: "Psicopedagogía", detalle: "Miércoles 29 · 6:00 – 7:30" }
        ];
        const proxima = clases.find((clase) => new Date(clase.fecha) >= new Date());
        const notificaciones = [
            proxima
                ? { id: `clase-${proxima.fecha}`, icono: "📅", titulo: `Próxima clase: ${proxima.nombre}`, detalle: proxima.detalle, pagina: "calendario.html#horario-julio" }
                : { id: "horario-finalizado", icono: "🗓️", titulo: "Horario de julio finalizado", detalle: "Consulta el calendario para próximas programaciones.", pagina: "calendario.html" },
            { id: "material-psicopedagogia", icono: "📄", titulo: "Nuevo material de Psicopedagogía", detalle: "Hay 2 documentos disponibles para consulta.", pagina: "materia.html", materia: "Psicopedagogía", ciclo: "Ciclo V" },
            { id: "videos-ciclo-v", icono: "🎬", titulo: "Clases grabadas preparadas", detalle: "El espacio de videos del Ciclo V está listo para tus grabaciones.", pagina: "videos.html", cicloVideos: "Ciclo V" }
        ];
        const leidas = new Set(leerJSON("notificacionesLeidas", []));

        function renderizar() {
            const pendientes = notificaciones.filter((notificacion) => !leidas.has(notificacion.id));
            contador.textContent = pendientes.length;
            contador.hidden = pendientes.length === 0;
            if (resumen) resumen.textContent = pendientes.length ? `${pendientes.length} pendientes` : "Todo al día";
            lista.innerHTML = "";
            notificaciones.forEach((notificacion) => {
                const elemento = document.createElement("button");
                elemento.type = "button";
                elemento.className = `notificacion-dinamica${leidas.has(notificacion.id) ? " leida" : ""}`;
                elemento.innerHTML = `<span class="notificacion-icono">${notificacion.icono}</span><span><strong></strong><small></small></span>`;
                elemento.querySelector("strong").textContent = notificacion.titulo;
                elemento.querySelector("small").textContent = notificacion.detalle;
                elemento.addEventListener("click", () => {
                    leidas.add(notificacion.id);
                    localStorage.setItem("notificacionesLeidas", JSON.stringify([...leidas]));
                    if (notificacion.materia) {
                        localStorage.setItem("subcicloSeleccionado", notificacion.materia);
                        localStorage.setItem("cicloDeSubciclo", notificacion.ciclo || "Ciclo V");
                    }
                    if (notificacion.cicloVideos) localStorage.setItem("cicloVideosSeleccionado", notificacion.cicloVideos);
                    renderizar();
                    window.location.href = notificacion.pagina;
                });
                lista.appendChild(elemento);
            });
        }

        campana.addEventListener("click", (evento) => {
            evento.stopPropagation();
            panel.hidden = !panel.hidden;
        });
        marcarLeidas?.addEventListener("click", () => {
            notificaciones.forEach((notificacion) => leidas.add(notificacion.id));
            localStorage.setItem("notificacionesLeidas", JSON.stringify([...leidas]));
            renderizar();
        });
        document.addEventListener("click", (evento) => {
            if (!panel.contains(evento.target) && evento.target !== campana) panel.hidden = true;
        });
        renderizar();
    }

    function configurarInterfaz() {
        const perfil = $("#perfil");
        const menuPerfil = $("#menuPerfil");
        perfil?.addEventListener("click", (evento) => {
            evento.stopPropagation();
            menuPerfil?.classList.toggle("activo");
        });
        document.addEventListener("click", () => menuPerfil?.classList.remove("activo"));

        const botonModo = $("#modoOscuro");
        const aplicarModo = (oscuro) => {
            document.body.classList.toggle("dark", oscuro);
            if (botonModo) botonModo.textContent = oscuro ? "☀️" : "🌙";
        };
        aplicarModo(localStorage.getItem("modo") === "oscuro");
        botonModo?.addEventListener("click", () => {
            const oscuro = !document.body.classList.contains("dark");
            localStorage.setItem("modo", oscuro ? "oscuro" : "claro");
            aplicarModo(oscuro);
        });

        const menuMobile = $("#menuMobile");
        const sidebar = $(".sidebar");
        menuMobile?.addEventListener("click", (evento) => {
            evento.stopPropagation();
            sidebar?.classList.toggle("mostrar");
        });
        document.addEventListener("click", (evento) => {
            if (sidebar && menuMobile && !sidebar.contains(evento.target) && !menuMobile.contains(evento.target)) {
                sidebar.classList.remove("mostrar");
            }
        });
        $$(".sidebar a").forEach((enlace) => enlace.addEventListener("click", () => sidebar?.classList.remove("mostrar")));
    }

    function configurarCiclosInicio() {
        const ciclos = [
            ["Ciclo I", "Fundamentos y adaptación académica.", 100],
            ["Ciclo II", "Herramientas esenciales y pensamiento lógico.", 100],
            ["Ciclo III", "Desarrollo de competencias técnicas.", 75],
            ["Ciclo IV", "Aplicación práctica y proyectos guiados.", 50],
            ["Ciclo V", "Profundización y trabajo colaborativo.", 25],
            ["Ciclo VI", "Especialización y resolución de problemas.", 10],
            ["Ciclo VII", "Proyecto integrador y experiencia aplicada.", 0],
            ["Ciclo VIII", "Cierre académico y proyecto final.", 0]
        ];
        const contenedor = document.querySelector(".curso")?.parentElement;
        if (!contenedor) return;
        const tarjetas = [...contenedor.querySelectorAll(".curso")];
        tarjetas.forEach((tarjeta, indice) => {
            const [nombre, descripcion, progreso] = ciclos[indice];
            tarjeta.dataset.curso = nombre;
            tarjeta.querySelector("h3").textContent = nombre;
            tarjeta.querySelector("p").textContent = descripcion;
            const boton = tarjeta.querySelector(".btn-curso");
            if (boton) { boton.dataset.curso = nombre; boton.textContent = "Ver subciclos"; }
            const barra = tarjeta.querySelector(".progress > div");
            if (barra && indice > 0) barra.style.width = `${progreso}%`;
        });
        ciclos.slice(tarjetas.length).forEach(([nombre, descripcion, progreso]) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "card curso";
            tarjeta.dataset.curso = nombre;
            tarjeta.innerHTML = `<h3>${nombre}</h3><p>${descripcion}</p><div class="progress"><div style="width:${progreso}%"></div></div><br><button class="btn-curso" type="button" data-curso="${nombre}">Ver subciclos</button>`;
            contenedor.appendChild(tarjeta);
        });
    }

    function actualizarPanelAcademico() {
        const clases = [
            { fecha: "2026-07-06T18:00:00", nombre: "Homilética Bíblica II", detalle: "Lunes 06 · 6:00 – 7:30" },
            { fecha: "2026-07-14T18:00:00", nombre: "Consejería Pastoral", detalle: "Martes 14 · 6:00 – 7:30" },
            { fecha: "2026-07-20T18:00:00", nombre: "Administración Eclesiástica", detalle: "Lunes 20 · 6:00 – 8:15" },
            { fecha: "2026-07-21T18:00:00", nombre: "Introducción a la Sociología", detalle: "Martes 21 · 7:30 – 9:00" },
            { fecha: "2026-07-29T18:00:00", nombre: "Psicopedagogía", detalle: "Miércoles 29 · 6:00 – 7:30" }
        ];
        const ahora = new Date();
        const proxima = clases.find((clase) => new Date(clase.fecha) >= ahora) || clases.at(-1);
        escribir("#proximaClaseNombre", proxima.nombre);
        escribir("#proximaClaseDetalle", proxima.detalle);

        const materiales = [
            { nombre: "Introducción a la Sociología", detalle: "Sílabo y 2 sesiones disponibles", ciclo: "Ciclo V" },
            { nombre: "Consejería Pastoral", detalle: "Sílabo, lectura y preguntas disponibles", ciclo: "Ciclo V" },
            { nombre: "Hermenéutica Bíblica II", detalle: "Presentación disponible", ciclo: "Ciclo V" },
            { nombre: "Homilética Bíblica II", detalle: "Presentación disponible", ciclo: "Ciclo V" },
            { nombre: "Administración Eclesiástica", detalle: "Presentación disponible", ciclo: "Ciclo V" }
        ];
        const indice = new Date().getDate() % materiales.length;
        const material = materiales[indice];
        escribir("#materialDestacadoNombre", material.nombre);
        escribir("#materialDestacadoDetalle", material.detalle);
        const boton = $("#btnMaterialDestacado");
        if (boton) {
            boton.dataset.materia = material.nombre;
            boton.dataset.ciclo = material.ciclo;
        }
    }

    function configurarNavegacion() {
        const paginaActual = window.location.pathname.split("/").pop() || "index.html";
        $$(".sidebar a").forEach((enlace) => {
            const activa = enlace.getAttribute("href") === paginaActual;
            enlace.classList.toggle("active", activa);
            if (activa) enlace.setAttribute("aria-current", "page");
        });
        $$(".btn-curso").forEach((boton) => boton.addEventListener("click", () => {
            localStorage.setItem("cicloSeleccionado", boton.dataset.curso || "Ciclo I");
            window.location.href = "subciclos.html";
        }));
        $$(".btn-materia").forEach((boton) => boton.addEventListener("click", () => {
            localStorage.setItem("subcicloSeleccionado", boton.dataset.materia || "");
            localStorage.setItem("cicloDeSubciclo", boton.dataset.ciclo || "");
            window.location.href = "materia.html";
        }));
        $$(".btn-navegacion").forEach((boton) => boton.addEventListener("click", () => {
            if (boton.dataset.pagina) window.location.href = boton.dataset.pagina;
        }));
    }

    function configurarAnimaciones() {
        const elementos = $$(".reveal");
        if (!("IntersectionObserver" in window)) {
            elementos.forEach((elemento) => elemento.classList.add("visible"));
            return;
        }
        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) entrada.target.classList.add("visible");
            });
        }, { threshold: 0.15 });
        elementos.forEach((elemento) => observador.observe(elemento));
    }

    window.cerrarSesion = () => {
        localStorage.removeItem("login");
        localStorage.removeItem("usuario");
        window.location.replace("login.html");
    };

    actualizarFechaYSaludo();
    animarContador("#cursos", 8, 120);
    animarContador("#clases", estado.clases.length, 40);
    animarContador("#tareas", 0, 60);
    actualizarReloj();
    window.setInterval(actualizarReloj, 1000);
    actualizarProgreso();
    actualizarPerfil();
    actualizarLogros();
    configurarBuscador();
    configurarNotificaciones();
    configurarInterfaz();
    configurarCiclosInicio();
    actualizarPanelAcademico();
    configurarNavegacion();
    configurarAnimaciones();
    $(".btn-progreso")?.addEventListener("click", completarClase);

    const ocultarLoader = () => $("#loader")?.classList.add("ocultar");
    window.addEventListener("load", ocultarLoader, { once: true });
    window.setTimeout(ocultarLoader, 3000);
})();
