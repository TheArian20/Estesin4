document.addEventListener("DOMContentLoaded", async () => {
  const base = [
    ["2026-08-03","6:00 – 7:30","Homilética Bíblica II"],["2026-08-03","7:30 – 9:00","Hermenéutica Bíblica II"],
    ["2026-08-10","6:00 – 8:15","Administración Eclesiástica"],["2026-08-11","6:00 – 8:15","Teología Bíblica III (Cristología)"],
    ["2026-08-11","8:15 – 9:45","Introducción a la Sociología"],["2026-08-17","6:00 – 8:15","Administración Eclesiástica"],
    ["2026-08-18","6:00 – 7:30","Consejería Pastoral"],["2026-08-18","7:30 – 9:45","Teología Bíblica III (Cristología)"],["2026-08-26","6:00 – 7:30","Psicopedagogía"]
  ];
  const select = document.getElementById("filtroAgenda"), chips = document.getElementById("agendaChips"), lista = document.getElementById("agendaLista"), grid = document.getElementById("mesAgosto");
  if (!select || !chips || !lista || !grid) return;
  const cliente = window.STESIN_DATOS, ymd = d => d.toISOString().slice(0,10), mesNombre = d => new Intl.DateTimeFormat("es-ES", { month:"long", year:"numeric" }).format(d).replace(/^./, c => c.toUpperCase()), diaTexto = f => new Date(`${f}T12:00:00`).toLocaleDateString("es-ES", {weekday:"long",day:"2-digit"}).replace(/^./,c=>c.toUpperCase());
  let ciclo = "Ciclo V", visible = new Date(2026,7,1), sesiones = base.map(([fecha,hora,materia]) => ({fecha,hora,materia,detalle:"",ciclo:"Ciclo V"}));
  if (cliente) {
    const { data: { user } = {} } = await cliente.auth.getUser();
    if (user) { const { data } = await cliente.from("perfiles").select("ciclo_actual").eq("id",user.id).single(); ciclo = data?.ciclo_actual || ciclo; }
    const { data } = await cliente.from("eventos_calendario").select("fecha,hora,materia,detalle,ciclo").eq("activo",true).order("fecha");
    (data || []).filter(e => !e.ciclo || e.ciclo === ciclo).forEach(e => { if (!sesiones.some(s => s.fecha===e.fecha && s.hora===e.hora && s.materia===e.materia)) sesiones.push(e); });
  }
  sesiones = sesiones.filter(s => s.ciclo === ciclo || !s.ciclo);
  document.querySelectorAll(".month-view h2,.schedule-intro h2").forEach(h => h.textContent = mesNombre(visible));
  document.querySelector(".schedule-wrap")?.toggleAttribute("hidden", ciclo !== "Ciclo V");
  function render(fecha="todas") {
    const inicio = new Date(visible.getFullYear(),visible.getMonth(),1), fin = new Date(visible.getFullYear(),visible.getMonth()+1,0), desde=ymd(inicio), hasta=ymd(fin);
    const delMes=sesiones.filter(s=>s.fecha>=desde&&s.fecha<=hasta).sort((a,b)=>`${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)), fechas=[...new Set(delMes.map(s=>s.fecha))];
    document.querySelectorAll(".month-view h2,.schedule-intro h2").forEach(h=>h.textContent=mesNombre(visible));
    select.innerHTML='<option value="todas">Todas las jornadas del mes</option>'+fechas.map(f=>`<option value="${f}">${diaTexto(f)}</option>`).join("");
    chips.innerHTML=`<button class="agenda-chip ${fecha==='todas'?'active':''}" data-fecha="todas" type="button">Todas</button>${fechas.map(f=>`<button class="agenda-chip ${fecha===f?'active':''}" data-fecha="${f}" type="button">${diaTexto(f)}</button>`).join("")}`;
    const vacios=(inicio.getDay()+6)%7, dias=fin.getDate(), conClase=new Set(fechas.map(f=>Number(f.slice(-2))));
    grid.innerHTML=`${Array.from({length:vacios},()=>'<span class="month-empty"></span>').join("")}${Array.from({length:dias},(_,i)=>{const d=i+1,f=`${visible.getFullYear()}-${String(visible.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;return `<button type="button" class="${conClase.has(d)?'has-class':''}" data-dia="${f}">${d}</button>`}).join("")}`;
    const items=fecha==='todas'?delMes:delMes.filter(s=>s.fecha===fecha);
    lista.innerHTML=items.map(s=>`<article class="agenda-card"><span>${diaTexto(s.fecha)}</span><strong>${s.materia}</strong><small>${s.hora}${s.detalle?` · ${s.detalle}`:''}</small><button type="button" class="agenda-open" data-materia="${s.materia}">Abrir materia</button></article>`).join("")||'<p class="announcements-empty">No hay clases programadas para tu ciclo este mes.</p>';
    select.value=fecha;
  }
  document.querySelector(".month-view .section-heading")?.insertAdjacentHTML("beforeend",'<span><button class="agenda-chip" id="mesAnterior" type="button">← Mes anterior</button> <button class="agenda-chip" id="mesSiguiente" type="button">Mes siguiente →</button></span>');
  document.addEventListener("click",event=>{if(event.target.id==='mesAnterior'){visible=new Date(visible.getFullYear(),visible.getMonth()-1,1);render()}if(event.target.id==='mesSiguiente'){visible=new Date(visible.getFullYear(),visible.getMonth()+1,1);render()}const fecha=event.target.closest('[data-fecha]')?.dataset.fecha||event.target.closest('[data-dia]')?.dataset.dia;if(fecha)render(fecha);const abrir=event.target.closest('.agenda-open');if(abrir){localStorage.setItem('subcicloSeleccionado',abrir.dataset.materia);localStorage.setItem('cicloDeSubciclo',ciclo);location.href='materia.html'}});
  select.addEventListener("change",()=>render(select.value)); render();
});
