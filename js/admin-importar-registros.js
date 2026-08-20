document.addEventListener("DOMContentLoaded", () => {
  const boton = document.getElementById("btnImportar");
  const archivo = document.getElementById("archivoCredenciales");
  const resultado = document.getElementById("resultadoImportacion");
  if (!boton || !archivo || !resultado) return;

  const tarjeta = archivo.closest("section");
  const titulo = tarjeta?.querySelector("h2");
  const explicacion = tarjeta?.querySelector("p");
  if (titulo) titulo.textContent = "Importar estudiantes como registros";
  if (explicacion) explicacion.textContent = "Importa nombres y usuarios para la gestion academica. No se crean cuentas ni contrasenas para estudiantes.";
  boton.textContent = "Importar registros del archivo";

  boton.addEventListener("click", async evento => {
    evento.preventDefault();
    evento.stopImmediatePropagation();
    const seleccionado = archivo.files[0];
    resultado.hidden = false;
    resultado.classList.remove("error");
    if (!seleccionado) {
      resultado.classList.add("error");
      resultado.textContent = "Selecciona primero el archivo CSV.";
      return;
    }
    const filas = (await seleccionado.text()).split(/\r?\n/).slice(1).filter(Boolean).map(fila => fila.split(",").map(valor => valor.trim()));
    const { data: perfiles, error } = await window.STESIN_DATOS.from("perfiles").select("usuario");
    if (error) {
      resultado.classList.add("error");
      resultado.textContent = error.message;
      return;
    }
    const existentes = new Set((perfiles || []).map(perfil => (perfil.usuario || "").toLowerCase()));
    const nuevos = filas.filter(([, usuario]) => usuario && !existentes.has(usuario.toLowerCase())).map(([nombre, usuario]) => ({
      nombre,
      usuario: usuario.toLowerCase(),
      correo: "",
      carrera: "STESIN",
      ciclo_actual: "Ciclo V",
      rol: "estudiante",
      activo: true
    }));
    if (!nuevos.length) {
      resultado.textContent = "No hay estudiantes nuevos para importar.";
      return;
    }
    boton.disabled = true;
    const respuesta = await window.STESIN_DATOS.from("perfiles").insert(nuevos);
    boton.disabled = false;
    resultado.classList.toggle("error", Boolean(respuesta.error));
    resultado.textContent = respuesta.error ? respuesta.error.message : `${nuevos.length} estudiantes importados como registros, sin credenciales de acceso.`;
    if (!respuesta.error) window.location.reload();
  }, true);
});
