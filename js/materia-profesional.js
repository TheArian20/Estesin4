document.addEventListener("DOMContentLoaded", () => window.setTimeout(() => {
  const nombre = localStorage.getItem("subcicloSeleccionado") || "Materia";
  const ciclo = localStorage.getItem("cicloDeSubciclo") || "Ciclo académico";
  const docentes = {
    "Psicopedagogía": "Aroldo Misael López Herrera",
    "Homilética Bíblica II": "Javier Edilberto Vásquez Vásquez",
    "Hermenéutica Bíblica II": "Javier Edilberto Vásquez Vásquez",
    "Administración Eclesiástica": "Javier Edilberto Vásquez Vásquez",
    "Introducción a la Sociología": "Frank Isaac Berrocal Aréstegui",
    "Teología Bíblica III (Cristología)": "José Ángel Piza Nivela",
    "Consejería Pastoral": "Eliderio Angulo Guerra"
  };
  const contenedor = document.querySelector(".materia-info");
  if (!contenedor || document.getElementById("docenteMateria")) return;
  const tarjeta = document.createElement("article");
  tarjeta.className = "card";
  tarjeta.innerHTML = '<strong id="docenteMateria"></strong><p id="detalleDocenteMateria"></p>';
  tarjeta.querySelector("#docenteMateria").textContent = docentes[nombre] || "Equipo académico STESIN";
  tarjeta.querySelector("#detalleDocenteMateria").textContent = `${ciclo} · Docente asignado para la programación vigente`;
  contenedor.appendChild(tarjeta);
}, 450));
