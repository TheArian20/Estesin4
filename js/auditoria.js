document.addEventListener("DOMContentLoaded", async () => {
  const c = window.STESIN_SUPABASE, lista = document.getElementById("listaAuditoria"); if (!c || !lista) return;
  const { data: { user } } = await c.auth.getUser(); const { data: p } = await c.from("perfiles").select("rol").eq("id", user?.id).single();
  if (p?.rol !== "admin") return location.replace("index.html");
  const { data, error } = await c.from("auditoria_acciones").select("tabla,accion,creado_en").order("creado_en", { ascending: false }).limit(100);
  lista.innerHTML = error ? '<p class="announcements-empty">Ejecuta el SQL actualizado para activar la auditoría.</p>' : (data || []).map(x => `<article class="resource-row"><div><h3>${x.accion} · ${x.tabla}</h3><p>${new Date(x.creado_en).toLocaleString('es-PE')}</p></div></article>`).join("") || '<p class="announcements-empty">Aún no hay acciones registradas.</p>';
});
