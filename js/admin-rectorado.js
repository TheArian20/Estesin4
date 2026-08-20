const prepararRegistroRector = async () => {
  const cliente = window.STESIN_DATOS;
  if (!cliente || document.getElementById("gestionRector") || localStorage.getItem("rolUsuario") !== "admin") return;

  const seccion = document.createElement("section");
  seccion.id = "gestionRector";
  seccion.className = "admin-card";
  seccion.innerHTML = `<h2>Registro de Rectorado</h2><p>Guarda la información institucional sin crear todavía una cuenta de acceso.</p>
    <form class="resource-form" id="formRector">
      <label class="wide">Nombre<input name="nombre" required></label>
      <label>Identificador<input name="usuario" pattern="[a-z0-9.]+" required placeholder="nombre.apellido"></label>
      <button class="account-action" type="submit">Guardar registro</button>
    </form><div class="admin-state" hidden></div>`;
  document.querySelector(".admin-hero")?.insertAdjacentElement("afterend", seccion);
  const estado = seccion.querySelector(".admin-state");
  seccion.querySelector("form").addEventListener("submit", async evento => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const respuesta = await cliente.from("perfiles").insert({
      nombre: datos.get("nombre").trim(),
      usuario: datos.get("usuario").trim().toLowerCase(),
      correo: "",
      carrera: "Rectorado STESIN",
      rol: "rector",
      activo: false
    });
    estado.hidden = false;
    estado.classList.toggle("error", Boolean(respuesta.error));
    estado.textContent = respuesta.error ? respuesta.error.message : "Registro guardado sin credenciales de acceso.";
    if (!respuesta.error) evento.currentTarget.reset();
  });
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", prepararRegistroRector);
else prepararRegistroRector();
