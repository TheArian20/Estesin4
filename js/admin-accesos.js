document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("rolUsuario") !== "admin") return;
  const hero = document.querySelector(".admin-hero");
  if (!hero || document.getElementById("accesosAdministrativos")) return;

  const seccion = document.createElement("section");
  seccion.id = "accesosAdministrativos";
  seccion.className = "admin-card admin-shortcuts";
  seccion.innerHTML = `
    <div class="section-heading">
      <div><p class="eyebrow">GESTIÓN CENTRAL</p><h2>Accesos rápidos</h2></div>
      <span>Cuenta administrativa activa</span>
    </div>
    <div class="admin-shortcut-grid">
      <a href="estudiantes.html"><span>01</span><strong>Estudiantes</strong><small>Fichas y seguimiento</small></a>
      <a href="calendario.html"><span>02</span><strong>Calendario</strong><small>Clases y actividades</small></a>
      <a href="biblioteca.html"><span>03</span><strong>Biblioteca</strong><small>Recursos publicados</small></a>
      <a href="mensajes.html"><span>04</span><strong>Comunicados</strong><small>Información institucional</small></a>
      <a href="estadisticas.html"><span>05</span><strong>Estadísticas</strong><small>Actividad académica</small></a>
      <a href="auditoria.html"><span>06</span><strong>Auditoría</strong><small>Historial administrativo</small></a>
    </div>`;
  hero.insertAdjacentElement("afterend", seccion);
});
