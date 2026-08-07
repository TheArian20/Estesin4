const prepararCuentaRector = async () => {
  const cliente = window.STESIN_SUPABASE;
  if (!cliente || document.getElementById("gestionRector")) return;
  const { data: { user } } = await cliente.auth.getUser();
  if (!user || localStorage.getItem("rolUsuario") !== "admin") return;

  const seccion = document.createElement("section");
  seccion.id = "gestionRector";
  seccion.className = "admin-card";
  seccion.innerHTML = `<h2>Cuenta de Rectorado</h2><p>Esta cuenta puede consultar el Equipo STESIN, pero no administrar usuarios, recursos ni configuraciones.</p>
    <form class="resource-form" id="formRector">
      <label class="wide">Nombre<input name="nombre" value="Oiser Ramos Nuñes" required></label>
      <label>Usuario<input name="usuario" value="oiser.ramos" pattern="[a-z0-9.]+" required></label>
      <label>Contraseña inicial<input name="password" type="password" minlength="8" required placeholder="Mínimo 8 caracteres"></label>
      <button class="account-action" type="submit">Crear cuenta de rector</button>
    </form><div class="admin-state" hidden></div>`;
  const destino = document.getElementById("archivoCredenciales")?.closest("section");
  destino?.insertAdjacentElement("beforebegin", seccion);
  const estado = seccion.querySelector(".admin-state");
  seccion.querySelector("form").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const usuario = datos.get("usuario").trim().toLowerCase();
    const registro = window.supabase.createClient(window.STESIN_SUPABASE_URL, window.STESIN_SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    const { data, error } = await registro.auth.signUp({
      email: `${usuario}@stestin-interno.com`,
      password: datos.get("password"),
      options: { data: { nombre: datos.get("nombre").trim(), carrera: "Rectorado STESIN", usuario } }
    });
    estado.hidden = false;
    if (error || !data.user) { estado.classList.add("error"); estado.textContent = `No se pudo crear la cuenta: ${error?.message || "verifica los datos"}.`; return; }
    const { error: errorRol } = await cliente.from("perfiles").update({ rol: "rector", carrera: "Rectorado STESIN" }).eq("id", data.user.id);
    if (errorRol) { estado.classList.add("error"); estado.textContent = `La cuenta fue creada, pero falta asignar el rol Rector. Ejecuta el SQL actualizado y vuelve a intentarlo: ${errorRol.message}`; return; }
    estado.classList.remove("error");
    estado.textContent = `Cuenta de rector creada para ${datos.get("nombre")} con el usuario ${usuario}.`;
    evento.currentTarget.reset();
  });
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", prepararCuentaRector);
else prepararCuentaRector();
