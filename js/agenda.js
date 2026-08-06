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
  const mes = document.getElementById("mesAgosto");
  if (mes) {
    const diasConClase = new Set(sesiones.map((s) => Number(s.fecha.slice(-2))));
    const inicioMes = new Date(2026, 7, 1);
    const espaciosIniciales = (inicioMes.getDay() + 6) % 7;
    const celdasUsadas = espaciosIniciales + 31;
    const espaciosFinales = (7 - (celdasUsadas % 7)) % 7;
    mes.innerHTML = `${Array.from({length: espaciosIniciales}, () => '<span class="month-empty" aria-hidden="true"></span>').join("")}${Array.from({length:31},(_,i)=>`<button type="button" class="${diasConClase.has(i+1)?'has-class':''}" data-dia="${String(i+1).padStart(2,'0')}" aria-label="${i+1} de agosto de 2026${diasConClase.has(i+1) ? ', con clases' : ''}">${i+1}</button>`).join("")}${Array.from({length: espaciosFinales}, () => '<span class="month-empty" aria-hidden="true"></span>').join("")}`;
    mes.addEventListener("click",(e)=>{const b=e.target.closest('[data-dia]');if(b&&diasConClase.has(Number(b.dataset.dia)))renderizar(`2026-08-${b.dataset.dia}`);});
  }
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
