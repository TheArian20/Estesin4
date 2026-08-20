document.addEventListener("DOMContentLoaded", async () => {
  const cliente = window.STESIN_DATOS;
  if (!cliente || localStorage.getItem("rolUsuario") !== "admin") return;
  const destino = document.getElementById("listaUsuarios");
  if (!destino || document.getElementById("ciclosEstudiantes")) return;
  const seccion = document.createElement("section");
  seccion.className = "admin-card"; seccion.id = "ciclosEstudiantes";
  seccion.innerHTML = '<h2>Ciclo actual de estudiantes</h2><p>Solo el administrador define qué actividades, evaluaciones y avisos ve cada estudiante.</p><div class="resource-list"><div class="admin-state">Cargando asignaciones…</div></div>';
  destino.closest("section").insertAdjacentElement("beforebegin", seccion);
  const lista = seccion.querySelector(".resource-list"), ciclos = ["Ciclo I","Ciclo II","Ciclo III","Ciclo IV","Ciclo V","Ciclo VI","Ciclo VII","Ciclo VIII"];
  const esc = (v = "") => String(v).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  async function cargar() {
    const { data, error } = await cliente.from("perfiles").select("id,nombre,usuario,ciclo_actual").eq("rol", "estudiante").order("nombre");
    if (error) { lista.innerHTML = '<div class="admin-state">Ejecuta el SQL actualizado para asignar ciclos a los estudiantes.</div>'; return; }
    lista.innerHTML = (data || []).map(p => `<article class="resource-row"><div><h3>${esc(p.nombre || "Estudiante")}</h3><p>${esc(p.usuario || "Sin usuario")}</p></div><label>Curso actual<select data-ciclo="${p.id}">${ciclos.map(c => `<option ${c === (p.ciclo_actual || "Ciclo V") ? "selected" : ""}>${c}</option>`).join("")}</select></label></article>`).join("") || '<div class="admin-state">No hay estudiantes registrados.</div>';
    lista.querySelectorAll("select[data-ciclo]").forEach(select => select.addEventListener("change", async () => { select.disabled = true; const { error: updateError } = await cliente.from("perfiles").update({ ciclo_actual: select.value }).eq("id", select.dataset.ciclo); select.disabled = false; if (updateError) alert("No se pudo actualizar el ciclo: " + updateError.message); }));
  }
  cargar();
});
