document.addEventListener("DOMContentLoaded", async () => {
  const cliente = window.STESIN_SUPABASE, form = document.getElementById("formAviso"), lista = document.getElementById("listaAvisosAdmin"), resultado = document.getElementById("resultadoAviso");
  if (!cliente || !form || !lista || localStorage.getItem("rolUsuario") !== "admin") return;
  const escapar = (texto = "") => String(texto).replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[c]));
  const mostrar = (texto, error = false) => { resultado.hidden = false; resultado.textContent = texto; resultado.classList.toggle("error", error); };
  async function cargar() {
    const { data, error } = await cliente.from("avisos").select("id,titulo,mensaje,activo,destacado,creado_en").order("creado_en", { ascending: false });
    if (error) { lista.innerHTML = '<div class="admin-state">Ejecuta el SQL actualizado para activar los avisos.</div>'; return; }
    lista.innerHTML = (data || []).map((aviso) => `<article class="resource-row"><div><h3>${escapar(aviso.titulo)}</h3><p>${escapar(aviso.mensaje)}</p><p>${aviso.activo ? "Visible" : "Oculto"}${aviso.destacado ? " · Destacado" : ""}</p></div><button class="account-action ${aviso.activo ? "danger" : ""}" type="button" data-aviso="${aviso.id}" data-activo="${aviso.activo}">${aviso.activo ? "Ocultar" : "Publicar"}</button></article>`).join("") || '<div class="admin-state">No hay avisos publicados.</div>';
    lista.querySelectorAll("[data-aviso]").forEach((boton) => boton.addEventListener("click", async () => { const { error } = await cliente.from("avisos").update({ activo: boton.dataset.activo !== "true" }).eq("id", boton.dataset.aviso); if (error) return alert(error.message); cargar(); }));
  }
  form.addEventListener("submit", async (evento) => { evento.preventDefault(); const titulo = document.getElementById("avisoTitulo").value.trim(), mensaje = document.getElementById("avisoMensaje").value.trim(), destacado = document.getElementById("avisoDestacado").checked; const { error } = await cliente.from("avisos").insert({ titulo, mensaje, destacado }); if (error) return mostrar("No se pudo publicar: " + error.message, true); form.reset(); mostrar("Aviso publicado. Ya aparece en Inicio."); cargar(); });
  cargar();
});
