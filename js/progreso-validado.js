document.addEventListener("DOMContentLoaded", async () => {
  const cliente = window.STESIN_SUPABASE;
  const perfil = document.querySelector(".profile-card");
  if (!cliente || !perfil) return;
  const { data: { user } = {} } = await cliente.auth.getUser();
  if (!user) return;
  const { data, error } = await cliente.from("progreso_materias")
    .select("materia,ciclo,actualizado_en").eq("usuario_id", user.id).eq("completado", true)
    .order("actualizado_en", { ascending: false });
  if (error) return;
  const bloque = document.createElement("section");
  bloque.className = "profile-card";
  bloque.innerHTML = `<p class="eyebrow">SEGUIMIENTO VALIDADO</p><h2>Materias confirmadas</h2><p>Este avance es registrado por administración o docentes autorizados.</p><div class="resource-list">${(data || []).length ? data.map(item => `<article class="resource-row"><div><h3>${item.materia}</h3><p>${item.ciclo}</p></div><span class="resource-tag">Validada</span></article>`).join("") : '<div class="admin-state">Aún no tienes materias validadas.</div>'}</div>`;
  perfil.insertAdjacentElement("afterend", bloque);
});
