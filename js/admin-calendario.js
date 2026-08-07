document.addEventListener("DOMContentLoaded", async () => {
  const cliente = window.STESIN_SUPABASE;
  const hero = document.querySelector(".admin-hero");
  if (!cliente || !hero || localStorage.getItem("rolUsuario") !== "admin") return;
  const { data: { user } = {} } = await cliente.auth.getUser();
  if (!user) return;

  const seccion = document.createElement("section");
  seccion.className = "admin-card";
  seccion.innerHTML = `<h2>Calendario administrable</h2><p>Publica jornadas para un ciclo específico o para todos los ciclos.</p><form class="resource-form"><label>Fecha<input name="fecha" type="date" required></label><label>Horario<input name="hora" placeholder="Ej.: 6:00 – 7:30" required></label><label>Ciclo<select name="ciclo"><option value="">Todos los ciclos</option><option>Ciclo I</option><option>Ciclo II</option><option>Ciclo III</option><option>Ciclo IV</option><option>Ciclo V</option><option>Ciclo VI</option><option>Ciclo VII</option><option>Ciclo VIII</option></select></label><label>Materia<input name="materia" placeholder="Ej.: Administración Eclesiástica" required minlength="3"></label><label class="wide">Detalle opcional<input name="detalle" placeholder="Ej.: Aula virtual / sesión especial"></label><button class="account-action" type="submit">Publicar jornada</button></form><div class="admin-state" hidden></div><div class="resource-list"><div class="admin-state">Cargando calendario…</div></div>`;
  hero.insertAdjacentElement("afterend", seccion);
  const formulario = seccion.querySelector("form"), mensaje = seccion.querySelector(".admin-state"), lista = seccion.querySelector(".resource-list");
  formulario.fecha.value = new Date().toISOString().slice(0, 10);
  const avisar = (texto, error = false) => { mensaje.hidden = false; mensaje.textContent = texto; mensaje.classList.toggle("error", error); };
  async function cargar() {
    const { data, error } = await cliente.from("eventos_calendario").select("id,fecha,hora,materia,detalle,ciclo,activo").order("fecha");
    if (error) { lista.innerHTML = '<div class="admin-state">Ejecuta el SQL actualizado para activar el calendario administrable.</div>'; return; }
    lista.innerHTML = (data || []).map(e => `<article class="resource-row"><div><h3>${e.materia}</h3><p>${e.fecha} · ${e.hora} · ${e.ciclo || "Todos los ciclos"}${e.detalle ? ` · ${e.detalle}` : ""}</p></div><button class="account-action danger" data-id="${e.id}" type="button">Retirar</button></article>`).join("") || '<div class="admin-state">No hay jornadas publicadas todavía.</div>';
  }
  formulario.addEventListener("submit", async event => {
    event.preventDefault(); const datos = new FormData(formulario);
    const registro = { fecha: datos.get("fecha"), hora: datos.get("hora").trim(), materia: datos.get("materia").trim(), detalle: datos.get("detalle").trim() || null, ciclo: datos.get("ciclo") || null, activo: true, creado_por: user.id };
    const { error } = await cliente.from("eventos_calendario").insert(registro);
    if (error) { avisar(error.message, true); return; }
    avisar("Jornada publicada."); formulario.reset(); formulario.fecha.value = new Date().toISOString().slice(0, 10); cargar();
  });
  lista.addEventListener("click", async event => {
    const boton = event.target.closest("button[data-id]"); if (!boton) return;
    const { error } = await cliente.from("eventos_calendario").update({ activo: false }).eq("id", boton.dataset.id);
    avisar(error ? error.message : "Jornada retirada.", Boolean(error)); if (!error) cargar();
  });
  cargar();
});
