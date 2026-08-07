/* Resumen del inicio basado en datos del servidor, no en avances locales editables. */
document.addEventListener("DOMContentLoaded", () => window.setTimeout(configurarInicioProfesional, 350));
async function configurarInicioProfesional() {
  const cliente = window.STESIN_SUPABASE; if (!cliente) return;
  const { data: { user } = {} } = await cliente.auth.getUser(); if (!user) return;
  const { data: perfil } = await cliente.from("perfiles").select("rol").eq("id", user.id).single(); if (!perfil) return;
  const $ = (selector) => document.querySelector(selector);
  const etiqueta = (selector, texto) => { const nodo = $(selector); if (nodo) nodo.textContent = texto; };
  const tarjeta = (id, titulo, detalle) => { const contenedor = $(id)?.closest(".stat-card"); if (!contenedor) return; contenedor.querySelector("p").textContent = titulo; const small = contenedor.querySelector("small"); if (small) small.textContent = detalle; };
  const banner = document.querySelector(".banner-info"), badge = banner?.querySelector(".badge"), titulo = banner?.querySelector("h2"), texto = banner?.querySelector(".curso-actual"), boton = banner?.querySelector("button");
  if (perfil.rol === "docente") { if (badge) badge.textContent = "Área docente"; if (titulo) titulo.textContent = "Gestiona tus materias asignadas"; if (texto) texto.textContent = "Consulta materiales, actividad registrada y asistencia."; if (boton) { boton.textContent = "Abrir panel docente"; boton.dataset.pagina = "docentes.html"; } }
  if (perfil.rol === "admin") { if (badge) badge.textContent = "Administración"; if (titulo) titulo.textContent = "Gestiona la experiencia académica"; if (texto) texto.textContent = "Cuentas, materias, avisos y recursos desde un único lugar."; if (boton) { boton.textContent = "Abrir administración"; boton.dataset.pagina = "administracion.html"; } }
  const [lecturas, recursos] = await Promise.all([cliente.from("progreso_lectura").select("recurso_id", { count: "exact", head: true }).eq("usuario_id", user.id), cliente.from("recursos_personalizados").select("id", { count: "exact", head: true })]);
  etiqueta("#cursos", perfil.rol === "estudiante" ? "8" : "STESIN"); etiqueta("#clases", lecturas.error ? "—" : String(lecturas.count || 0)); etiqueta("#tareas", recursos.error ? "—" : String(recursos.count || 0));
  tarjeta("#cursos", perfil.rol === "estudiante" ? "Ciclos disponibles" : "Portal académico", perfil.rol === "estudiante" ? "Ruta oficial de formación" : "Gestión centralizada"); tarjeta("#clases", "Recursos consultados", "Registro verificable de aperturas"); tarjeta("#tareas", "Recursos adicionales", "Publicados por administración");
}
