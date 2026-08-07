const cargarEquipoStesin = () => {
  const contenedor = document.querySelector(".team-grid");
  const introduccion = document.querySelector(".team-hero p:last-child");
  if (!contenedor) return;

  if (introduccion) {
    introduccion.textContent = "Equipo docente activo para la programación académica vigente.";
  }

  const docentes = [
    ["R", "Oiser Ramos Nuñes", "Rector · Dirección institucional y acompañamiento académico"],
    ["01", "Aroldo Misael López Herrera", "Docente · Psicopedagogía"],
    ["02", "Javier Edilberto Vásquez Vásquez", "Docente · Homilética Bíblica II · Hermenéutica Bíblica II · Administración Eclesiástica"],
    ["03", "Frank Isaac Berrocal Aréstegui", "Docente · Introducción a la Sociología"],
    ["04", "José Ángel Piza Nivela", "Docente · Teología Bíblica III (Cristología)"],
    ["05", "Eliderio Angulo Guerra", "Docente · Consejería Pastoral"]
  ];

  contenedor.innerHTML = docentes.map(([numero, nombre, materias]) => `
    <article>
      <span>${numero}</span>
      <h2>${nombre}</h2>
      <p>${materias}</p>
    </article>`).join("");
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", cargarEquipoStesin);
} else {
  cargarEquipoStesin();
}
