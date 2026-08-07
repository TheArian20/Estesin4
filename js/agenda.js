document.addEventListener("DOMContentLoaded", async () => {
  const sesionesBase = [
    ["2026-08-03", "6:00 – 7:30", "Homilética Bíblica II"], ["2026-08-03", "7:30 – 9:00", "Hermenéutica Bíblica II"],
    ["2026-08-10", "6:00 – 8:15", "Administración Eclesiástica"], ["2026-08-11", "6:00 – 8:15", "Teología Bíblica III (Cristología)"],
    ["2026-08-11", "8:15 – 9:45", "Introducción a la Sociología"], ["2026-08-17", "6:00 – 8:15", "Administración Eclesiástica"],
    ["2026-08-18", "6:00 – 7:30", "Consejería Pastoral"], ["2026-08-18", "7:30 – 9:45", "Teología Bíblica III (Cristología)"],
    ["2026-08-26", "6:00 – 7:30", "Psicopedagogía"]
  ];
  const select = document.getElementById("filtroAgenda"), chips = document.getElementById("agendaChips"), lista = document.getElementById("agendaLista"), mes = document.getElementById("mesAgosto");
  if (!select || !chips || !lista || !mes) return;
  const textoDia = (fecha) => new Date(`${fecha}T12:00:00`).toLocaleDateString("es-ES", { weekday: "long", day: "2-digit" }).replace(/^./, (letra) => letra.toUpperCase());
  let sesiones = sesionesBase.map(([fecha, hora, materia]) => ({ fecha, hora, materia, detalle: "" }));
  const cliente = window.STESIN_SUPABASE;
  if (cliente) {
    const { data } = await cliente.from("eventos_calendario").select("fecha,hora,materia,detalle").eq("activo", true).gte("fecha", "2026-08-01").lte("fecha", "2026-08-31");
    if (data?.length) sesiones = [...sesiones, ...data];
  }
  sesiones.sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`));
  const fechas = [...new Set(sesiones.map((sesion) => sesion.fecha))];
  select.innerHTML = '<option value="todas">Todas las jornadas</option>' + fechas.map((fecha) => `<option value="${fecha}">${textoDia(fecha)}</option>`).join("");
  chips.innerHTML = `<button class="agenda-chip active" data-fecha="todas" type="button">Todas</button>${fechas.map((fecha) => `<button class="agenda-chip" data-fecha="${fecha}" type="button">${textoDia(fecha)}</button>`).join("")}`;
  const diasConClase = new Set(sesiones.map((sesion) => Number(sesion.fecha.slice(-2))));
  const inicioMes = new Date(2026, 7, 1), espaciosIniciales = (inicioMes.getDay() + 6) % 7, celdasUsadas = espaciosIniciales + 31, espaciosFinales = (7 - (celdasUsadas % 7)) % 7;
  mes.innerHTML = `${Array.from({ length: espaciosIniciales }, () => '<span class="month-empty" aria-hidden="true"></span>').join("")}${Array.from({ length: 31 }, (_, indice) => { const dia = indice + 1; return `<button type="button" class="${diasConClase.has(dia) ? "has-class" : ""}" data-dia="${String(dia).padStart(2, "0")}" aria-label="${dia} de agosto de 2026${diasConClase.has(dia) ? ", con clases" : ""}">${dia}</button>`; }).join("")}${Array.from({ length: espaciosFinales }, () => '<span class="month-empty" aria-hidden="true"></span>').join("")}`;
  function renderizar(fecha = "todas") {
    select.value = fecha; chips.querySelectorAll("button").forEach((boton) => boton.classList.toggle("active", boton.dataset.fecha === fecha));
    const visibles = fecha === "todas" ? sesiones : sesiones.filter((sesion) => sesion.fecha === fecha);
    lista.innerHTML = visibles.map((sesion) => `<article class="agenda-card"><span>${textoDia(sesion.fecha)}</span><strong>${sesion.materia}</strong><small>${sesion.hora}${sesion.detalle ? ` · ${sesion.detalle}` : ""}</small><button type="button" class="agenda-open" data-materia="${sesion.materia}">Abrir materia</button></article>`).join("") || '<p class="announcements-empty">No hay clases para esta fecha.</p>';
  }
  mes.addEventListener("click", (evento) => { const boton = evento.target.closest("[data-dia]"); if (boton && diasConClase.has(Number(boton.dataset.dia))) renderizar(`2026-08-${boton.dataset.dia}`); });
  select.addEventListener("change", () => renderizar(select.value));
  chips.addEventListener("click", (evento) => { const boton = evento.target.closest("[data-fecha]"); if (boton) renderizar(boton.dataset.fecha); });
  lista.addEventListener("click", (evento) => { const boton = evento.target.closest(".agenda-open"); if (!boton) return; localStorage.setItem("subcicloSeleccionado", boton.dataset.materia || ""); localStorage.setItem("cicloDeSubciclo", "Ciclo V"); location.href = "materia.html"; });
  renderizar();
});
