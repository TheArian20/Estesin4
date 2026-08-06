document.addEventListener("DOMContentLoaded", async () => {
  const cliente = window.STESIN_SUPABASE;
  const estado = document.getElementById("perfilEstado"), recursos = document.getElementById("perfilRecursos"), mensaje = document.getElementById("perfilMensaje");
  if (!cliente || !estado || !recursos || !mensaje) return;
  const { data: { user } } = await cliente.auth.getUser();
  if (!user) return;
  const { data: perfil } = await cliente.from("perfiles").select("activo, rol").eq("id", user.id).single();
  estado.textContent = perfil?.activo ? "Activa" : "Sin acceso";
  const { count, error } = await cliente.from("recursos_personalizados").select("id", { count: "exact", head: true });
  recursos.textContent = error ? "Biblioteca" : String(count || 0);
  mensaje.textContent = perfil?.rol === "admin" ? "Estás usando una cuenta administradora. Puedes gestionar estudiantes, avisos y recursos." : "Tu cuenta está activa. Revisa los avisos y los materiales disponibles para tu ciclo.";
});
