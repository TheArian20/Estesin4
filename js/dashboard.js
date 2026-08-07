/* Lógica exclusiva del panel de inicio de STESIN. */
(async () => {
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

    const cliente = window.STESIN_SUPABASE;
    if (!cliente) {
        window.location.replace("login.html");
        return;
    }

    const { data: { user } } = await cliente.auth.getUser();
    if (!user) {
        window.location.replace("login.html");
        return;
    }
    const { data: perfil, error: errorPerfil } = await cliente.from("perfiles").select("nombre, correo, carrera, rol, activo, creado_en").eq("id", user.id).single();
    if (errorPerfil || !perfil?.activo) {
        await cliente.auth.signOut();
        window.location.replace("login.html?estado=inactivo");
        return;
    }
    localStorage.setItem("login", "true");
    localStorage.setItem("usuario", perfil.nombre);
    localStorage.setItem("correoUsuario", perfil.correo);
    localStorage.setItem("carreraUsuario", perfil.carrera);
    localStorage.setItem("rolUsuario", perfil.rol);

    const estado = {
        usuario: localStorage.getItem("usuario") || "Estudiante",
        foto: localStorage.getItem("fotoPerfil") || "stesin-icon.svg",
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
            { fecha: "2026-08-03T18:00:00", nombre: "Homil?tica B?blica II", detalle: "Lunes 03 ? 6:00 ? 7:30" },
            { fecha: "2026-08-10T18:00:00", nombre: "Administraci?n Eclesi?stica", detalle: "Lunes 10 ? 6:00 ? 8:15" },
            { fecha: "2026-08-11T18:00:00", nombre: "Teolog?a B?blica III (Cristolog?a)", detalle: "Martes 11 ? 6:00 ? 8:15" },
            { fecha: "2026-08-11T20:15:00", nombre: "Introducci?n a la Sociolog?a", detalle: "Martes 11 ? 8:15 ? 9:45" },
            { fecha: "2026-08-17T18:00:00", nombre: "Administraci?n Eclesi?stica", detalle: "Lunes 17 ? 6:00 ? 8:15" },
            { fecha: "2026-08-18T18:00:00", nombre: "Consejer?a Pastoral", detalle: "Martes 18 ? 6:00 ? 7:30" },
            { fecha: "2026-08-18T19:30:00", nombre: "Teolog?a B?blica III (Cristolog?a)", detalle: "Martes 18 ? 7:30 ? 9:45" },
            { fecha: "2026-08-26T18:00:00", nombre: "Psicopedagog?a", detalle: "Mi?rcoles 26 ? 6:00 ? 7:30" }
        ];
        const proxima = clases.find((clase) => new Date(clase.fecha) >= new Date());
        let notificaciones = [
            proxima
                ? { id: `clase-${proxima.fecha}`, icono: "📅", titulo: `Próxima clase: ${proxima.nombre}`, detalle: proxima.detalle, pagina: "calendario.html#horario-agosto" }
                : { id: "horario-finalizado", icono: "🗓️", titulo: "Horario de agosto finalizado", detalle: "Consulta el calendario para próximas programaciones.", pagina: "calendario.html" },
            { id: "material-psicopedagogia", icono: "📄", titulo: "Nuevo material de Psicopedagogía", detalle: "Hay 2 documentos disponibles para consulta.", pagina: "materia.html", materia: "Psicopedagogía", ciclo: "Ciclo V" }
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
        cliente.from("avisos").select("id,titulo,mensaje,creado_en").eq("activo", true).order("creado_en", { ascending: false }).limit(3).then(({ data, error }) => {
            if (error || !data?.length) return;
            const avisos = data.map((aviso) => ({ id: `aviso-${aviso.id}`, icono: "📌", titulo: aviso.titulo, detalle: aviso.mensaje, pagina: "index.html#tituloAvisos" }));
            notificaciones = [...avisos, ...notificaciones];
            renderizar();
        });
    }

    async function cargarAvisosInicio() {
        const contenedor = $("#listaAvisos");
        const estadoAvisos = $("#estadoAvisos");
        if (!contenedor || !estadoAvisos) return;
        const { data, error } = await cliente.from("avisos").select("id, titulo, mensaje, destacado, creado_en").eq("activo", true).order("destacado", { ascending: false }).order("creado_en", { ascending: false }).limit(4);
        if (error) {
            estadoAvisos.textContent = "Sin avisos";
            return;
        }
        estadoAvisos.textContent = data.length ? `${data.length} aviso${data.length === 1 ? "" : "s"}` : "Al día";
        contenedor.innerHTML = "";
        if (!data.length) { contenedor.innerHTML = '<p class="announcements-empty">No hay avisos nuevos por el momento.</p>'; return; }
        data.forEach((aviso) => {
            const articulo = document.createElement("article");
            articulo.className = `announcement${aviso.destacado ? " destacado" : ""}`;
            articulo.innerHTML = '<span class="announcement-icon">📌</span><div><h3></h3><p></p><small></small></div>';
            articulo.querySelector("h3").textContent = aviso.titulo;
            articulo.querySelector("p").textContent = aviso.mensaje;
            articulo.querySelector("small").textContent = new Date(aviso.creado_en).toLocaleDateString("es-ES", { day: "numeric", month: "long" });
            contenedor.appendChild(articulo);
        });
    }

    function actualizarEspacioEstudio() {
        const ultima = localStorage.getItem("ultimaLectura");
        const favoritos = leerJSON("bibliotecaFavoritos", []);
        const titulo = $("#ultimaLecturaInicio");
        const abrir = $("#abrirUltimaLectura");
        const contador = $("#favoritosInicio");
        if (titulo) titulo.textContent = ultima || "Aún no abriste un documento";
        if (abrir && ultima) {
            abrir.href = `biblioteca.html?buscar=${encodeURIComponent(ultima)}`;
            abrir.textContent = "Continuar leyendo";
        }
        if (contador) contador.textContent = `${favoritos.length} recurso${favoritos.length === 1 ? "" : "s"} guardado${favoritos.length === 1 ? "" : "s"}`;
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
            { fecha: "2026-08-03T18:00:00", nombre: "Homil?tica B?blica II", detalle: "Lunes 03 ? 6:00 ? 7:30" },
            { fecha: "2026-08-10T18:00:00", nombre: "Administraci?n Eclesi?stica", detalle: "Lunes 10 ? 6:00 ? 8:15" },
            { fecha: "2026-08-11T18:00:00", nombre: "Teolog?a B?blica III (Cristolog?a)", detalle: "Martes 11 ? 6:00 ? 8:15" },
            { fecha: "2026-08-11T20:15:00", nombre: "Introducci?n a la Sociolog?a", detalle: "Martes 11 ? 8:15 ? 9:45" },
            { fecha: "2026-08-17T18:00:00", nombre: "Administraci?n Eclesi?stica", detalle: "Lunes 17 ? 6:00 ? 8:15" },
            { fecha: "2026-08-18T18:00:00", nombre: "Consejer?a Pastoral", detalle: "Martes 18 ? 6:00 ? 7:30" },
            { fecha: "2026-08-18T19:30:00", nombre: "Teolog?a B?blica III (Cristolog?a)", detalle: "Martes 18 ? 7:30 ? 9:45" },
            { fecha: "2026-08-26T18:00:00", nombre: "Psicopedagog?a", detalle: "Mi?rcoles 26 ? 6:00 ? 7:30" }
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

    function agregarAccesoAdministracion() {
        if (localStorage.getItem("rolUsuario") !== "admin") return;
        const sidebar = $(".sidebar");
        if (!sidebar || sidebar.querySelector('a[href="administracion.html"]')) return;
        const enlace = document.createElement("a");
        enlace.href = "administracion.html";
        enlace.textContent = "Administración";
        const configuracion = sidebar.querySelector('a[href="configuracion.html"]');
        if (configuracion) configuracion.insertAdjacentElement("beforebegin", enlace);
        else sidebar.appendChild(enlace);
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

    window.cerrarSesion = async () => {
        await cliente.auth.signOut();
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
    actualizarEspacioEstudio();
    actualizarLogros();
    configurarBuscador();
    configurarNotificaciones();
    configurarInterfaz();
    configurarCiclosInicio();
    actualizarPanelAcademico();
    cargarAvisosInicio();
    configurarNavegacion();
    agregarAccesoAdministracion();
    configurarAnimaciones();
    $(".btn-progreso")?.addEventListener("click", completarClase);

    const ocultarLoader = () => $("#loader")?.classList.add("ocultar");
    window.addEventListener("load", ocultarLoader, { once: true });
    window.setTimeout(ocultarLoader, 3000);
})();
