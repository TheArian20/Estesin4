const cargarEquipoStesin = () => {
  const contenedor = document.querySelector(".team-grid");
  const introduccion = document.querySelector(".team-hero p:last-child");
  if (!contenedor) return;

  if (introduccion) {
    introduccion.textContent = "Equipo docente activo para la programación académica vigente.";
  }

  const docentes = [
    ["01", "Aroldo Misael López Herrera", "Psicopedagogía"],
    ["02", "Javier Edilberto Vásquez Vásquez", "Homilética Bíblica II · Hermenéutica Bíblica II · Administración Eclesiástica"],
    ["03", "Frank Isaac Berrocal Aréstegui", "Introducción a la Sociología"],
    ["04", "José Ángel Piza Nivela", "Teología Bíblica III (Cristología)"],
    ["05", "Eliderio Angulo Guerra", "Consejería Pastoral"]
  ];

  contenedor.innerHTML = docentes.map(([numero, nombre, materias]) => `
    <article>
      <span>${numero}</span>
      <h2>${nombre}</h2>
      <p><strong>Docente asignado</strong><br>${materias}</p>
    </article>`).join("");
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", cargarEquipoStesin);
} else {
  cargarEquipoStesin();
}
