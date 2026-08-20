document.addEventListener("DOMContentLoaded", async () => {
  if (localStorage.getItem("rolUsuario") !== "admin" || !window.STESIN_DB) return;
  const destino = document.getElementById("resumenAdministrativo");
  if (!destino) return;

  const tarjeta = document.createElement("section");
  tarjeta.className = "admin-card";
  tarjeta.innerHTML = '<h2>Visitas a la plataforma</h2><p>Estadísticas anónimas de los últimos 30 días.</p><div class="admin-dashboard" id="metricasVisitas"><article><strong>…</strong><span>Cargando visitas</span></article></div><div class="resource-list" id="paginasVisitadas"></div>';
  destino.insertAdjacentElement("afterend", tarjeta);

  try {
    const desde = new Date();
    desde.setDate(desde.getDate() - 30);
    const captura = await window.STESIN_DB.collection("visitas").where("creado_en", ">=", desde).get();
    const visitas = captura.docs.map(doc => doc.data());
    const hoy = new Date().toISOString().slice(0, 10);
    const visitantes = new Set(visitas.map(v => v.visitante_id)).size;
    const sesiones = new Set(visitas.map(v => v.sesion_id)).size;
    const visitasHoy = visitas.filter(v => v.creado_en?.toDate?.().toISOString().slice(0, 10) === hoy).length;
    document.getElementById("metricasVisitas").innerHTML = `
      <article><strong>${visitasHoy}</strong><span>Visitas hoy</span></article>
      <article><strong>${visitas.length}</strong><span>Vistas en 30 días</span></article>
      <article><strong>${visitantes}</strong><span>Visitantes aproximados</span></article>
      <article><strong>${sesiones}</strong><span>Sesiones</span></article>`;

    const nombresPaginas = {
      "index.html": "Página de inicio",
      "login.html": "Acceso administrativo",
      "administracion.html": "Panel de administración",
      "academico.html": "Aula académica",
      "biblioteca.html": "Biblioteca",
      "calendario.html": "Calendario académico",
      "cursos.html": "Ciclos académicos",
      "malla-curricular.html": "Malla curricular",
      "materia.html": "Recursos de materia",
      "contacto.html": "Contacto",
      "equipo.html": "Equipo STESIN",
      "alabanzas.html": "Alabanzas",
      "silabos.html": "Sílabos",
      "redes.html": "Enlaces y redes",
      "ayuda.html": "Centro de ayuda"
    };
    const tituloPagina = pagina => nombresPaginas[pagina] || pagina.replace(/\.html$/i, "").replaceAll("-", " ").replace(/^./, letra => letra.toUpperCase());
    const paginas = {};
    visitas.forEach(v => paginas[v.pagina] = (paginas[v.pagina] || 0) + 1);
    const populares = Object.entries(paginas).sort((a,b) => b[1] - a[1]).slice(0, 8);
    document.getElementById("paginasVisitadas").innerHTML = populares.length
      ? `<article class="visit-ranking"><h3>Páginas más consultadas</h3>${populares.map(([pagina,total], posicion) => `<div class="visit-rank-row"><span class="visit-position">${posicion + 1}</span><strong>${tituloPagina(pagina)}</strong><span class="visit-total">${total} ${total === 1 ? "visita" : "visitas"}</span></div>`).join("")}</article>`
      : '<div class="admin-state">Todavía no hay visitas registradas.</div>';
  } catch (error) {
    document.getElementById("metricasVisitas").innerHTML = '<div class="admin-state error">No se pudieron consultar las visitas. Publica las reglas actualizadas de Firestore.</div>';
  }
});
