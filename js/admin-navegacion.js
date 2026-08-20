document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("rolUsuario") !== "admin") return;
  const hero = document.querySelector(".admin-hero");
  if (!hero || document.querySelector(".admin-section-nav")) return;

  hero.id = "resumenAdmin";
  const secciones = [...document.querySelectorAll(".admin-card")];
  const asignar = (texto, id) => {
    const seccion = secciones.find((item) => item.querySelector("h2")?.textContent.includes(texto));
    if (seccion) seccion.id = id;
    return Boolean(seccion);
  };
  asignar("Publicar aviso", "adminComunicados");
  asignar("Publicar recurso", "adminBiblioteca");
  asignar("Usuarios registrados", "adminCuenta");

  const navegacion = document.createElement("nav");
  navegacion.className = "admin-section-nav";
  navegacion.setAttribute("aria-label", "Secciones administrativas");
  navegacion.innerHTML = `
    <a href="#resumenAdmin">Resumen</a>
    <a href="#adminComunicados">Comunicados</a>
    <a href="#adminBiblioteca">Biblioteca</a>
    <a href="#adminCuenta">Cuenta</a>
    <a href="estadisticas.html">Estadísticas</a>`;
  hero.insertAdjacentElement("afterend", navegacion);
});
