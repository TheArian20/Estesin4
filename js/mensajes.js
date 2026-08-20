document.addEventListener("DOMContentLoaded", async () => {
  const cliente = window.STESIN_DATOS, panel = document.getElementById("panelRedaccion"), lista = document.getElementById("listaMensajes");
  if (!cliente || !lista) return;
  const { data: { user } } = await cliente.auth.getUser();
  if (!user) return;
  const { data: perfil } = await cliente.from("perfiles").select("rol").eq("id", user.id).single();
  const puedePublicar = ["admin", "docente"].includes(perfil?.rol);
  if (puedePublicar) panel.hidden = false;
  const escapar = (texto = "") => String(texto).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[c]));

  async function cargar() {
    const { data, error } = await cliente.from("mensajes_internos")
      .select("id,titulo,mensaje,ciclo,audiencia,activo,creado_por,creado_en")
      .order("creado_en", { ascending: false }).limit(30);
    if (error) { lista.innerHTML = '<p>Ejecuta el SQL actualizado para activar los comunicados.</p>'; return; }
    lista.innerHTML = (data || []).map(x => {
      const puedeGestionar = perfil?.rol === "admin" || x.creado_por === user.id;
      return `<article class="message"><h3>${escapar(x.titulo)}</h3><p>${escapar(x.mensaje)}</p><small>${escapar(x.ciclo || "Comunidad STESIN")} · ${new Date(x.creado_en).toLocaleDateString("es-PE")}${x.activo ? "" : " · Oculto"}</small>${puedeGestionar ? `<button class="account-action ${x.activo ? "danger" : ""}" data-mensaje="${x.id}" data-activo="${x.activo}">${x.activo ? "Ocultar" : "Publicar"}</button>` : ""}</article>`;
    }).join("") || "<p>No hay comunicados por ahora.</p>";
    lista.querySelectorAll("[data-mensaje]").forEach(boton => boton.addEventListener("click", async () => {
      const { error: cambiar } = await cliente.from("mensajes_internos").update({ activo: boton.dataset.activo !== "true" }).eq("id", boton.dataset.mensaje);
      if (cambiar) return alert(`No se pudo actualizar: ${cambiar.message}`);
      cargar();
    }));
  }

  document.getElementById("formMensaje")?.addEventListener("submit", async evento => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const { error } = await cliente.from("mensajes_internos").insert({ titulo: datos.get("titulo").trim(), mensaje: datos.get("mensaje").trim(), audiencia: datos.get("audiencia"), ciclo: datos.get("ciclo") || null, creado_por: user.id });
    document.getElementById("estadoMensaje").textContent = error ? error.message : "Comunicado publicado.";
    if (!error) { evento.currentTarget.reset(); cargar(); }
  });
  cargar();
});
