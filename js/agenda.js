document.addEventListener("DOMContentLoaded", () => {
  const sesiones = [
    ["2026-08-03", "Lunes 03", "6:00 – 7:30", "Homilética Bíblica II"],
    ["2026-08-03", "Lunes 03", "7:30 – 9:00", "Hermenéutica Bíblica II"],
    ["2026-08-10", "Lunes 10", "6:00 – 8:15", "Administración Eclesiástica"],
    ["2026-08-11", "Martes 11", "6:00 – 8:15", "Teología Bíblica III (Cristología)"],
    ["2026-08-11", "Martes 11", "8:15 – 9:45", "Introducción a la Sociología"],
    ["2026-08-17", "Lunes 17", "6:00 – 8:15", "Administración Eclesiástica"],
    ["2026-08-18", "Martes 18", "6:00 – 7:30", "Consejería Pastoral"],
    ["2026-08-18", "Martes 18", "7:30 – 9:45", "Teología Bíblica III (Cristología)"],
    ["2026-08-26", "Miércoles 26", "6:00 – 7:30", "Psicopedagogía"]
  ].map(([fecha, dia, hora, materia]) => ({ fecha, dia, hora, materia }));
  const select = document.getElementById("filtroAgenda"), chips = document.getElementById("agendaChips"), lista = document.getElementById("agendaLista");
  if (!select || !chips || !lista) return;
  const fechas = [...new Map(sesiones.map((s) => [s.fecha, s.dia])).entries()];
  chips.innerHTML = `<button class="agenda-chip active" data-fecha="todas" type="button">Todas</button>${fechas.map(([fecha, dia]) => `<button class="agenda-chip" data-fecha="${fecha}" type="button">${dia}</button>`).join("")}`;
  function renderizar(fecha = "todas") {
    select.value = fecha;
    chips.querySelectorAll("button").forEach((boton) => boton.classList.toggle("active", boton.dataset.fecha === fecha));
    const visibles = fecha === "todas" ? sesiones : sesiones.filter((s) => s.fecha === fecha);
    lista.innerHTML = visibles.map((s) => `<article class="agenda-card"><span>${s.dia}</span><strong>${s.materia}</strong><small>${s.hora}</small></article>`).join("");
  }
  select.addEventListener("change", () => renderizar(select.value));
  chips.addEventListener("click", (evento) => { const boton = evento.target.closest("[data-fecha]"); if (boton) renderizar(boton.dataset.fecha); });
  renderizar();
});
