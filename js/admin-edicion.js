document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const cliente = window.STESIN_DATOS;
  if (!cliente || localStorage.getItem("rolUsuario") !== "admin") return;
  const escapar = (valor = "") => String(valor).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;",'"':"&quot;"}[c]));
  const dialogo = document.createElement("dialog");
  dialogo.className = "admin-edit-dialog";
  dialogo.innerHTML = '<form method="dialog" class="admin-edit-shell"><div class="admin-edit-head"><div><span>EDICIÓN RÁPIDA</span><h2>Editar contenido</h2></div><button type="button" data-cerrar aria-label="Cerrar">×</button></div><div class="resource-form" data-campos></div><div class="admin-state" data-mensaje hidden></div><div class="admin-inline-actions"><button class="account-action" value="guardar">Guardar cambios</button><button class="account-action secondary" type="button" data-cerrar>Cancelar</button></div></form>';
  document.body.appendChild(dialogo);
  const campos = dialogo.querySelector("[data-campos]"), mensaje = dialogo.querySelector("[data-mensaje]");
  let actual = null;
  const configuraciones = {
    avisos: [
      ["titulo","Título","text"], ["mensaje","Mensaje","textarea"], ["audiencia","Audiencia","select",["todos","estudiantes","docentes","administradores"]], ["ciclo","Ciclo","text"], ["publicar_desde","Publicar desde","datetime-local"], ["publicar_hasta","Ocultar después de","datetime-local"], ["destacado","Destacado","checkbox"]
    ],
    recursos_personalizados: [["titulo","Título","text"],["enlace","Enlace de Google Drive","url"],["categoria","Categoría","text"],["ciclo","Ciclo","text"],["materia","Materia","text"],["destacado","Destacado","checkbox"]],
    eventos_calendario: [["fecha","Fecha","date"],["hora","Horario","text"],["materia","Materia","text"],["ciclo","Ciclo","text"],["detalle","Detalle","text"]]
  };
  const fechaLocal = valor => valor ? String(valor).slice(0, 16) : "";
  function control([nombre, etiqueta, tipo, opciones], valor) {
    if (tipo === "checkbox") return `<label class="admin-check"><input name="${nombre}" type="checkbox" ${valor ? "checked" : ""}> ${etiqueta}</label>`;
    if (tipo === "textarea") return `<label class="wide">${etiqueta}<textarea name="${nombre}" required>${escapar(valor)}</textarea></label>`;
    if (tipo === "select") return `<label>${etiqueta}<select name="${nombre}">${opciones.map(x => `<option value="${x}" ${x === valor ? "selected" : ""}>${x}</option>`).join("")}</select></label>`;
    const contenido = tipo === "datetime-local" ? fechaLocal(valor) : (valor ?? "");
    return `<label>${etiqueta}<input name="${nombre}" type="${tipo}" value="${escapar(contenido)}"></label>`;
  }
  async function abrir(tabla, id) {
    const { data, error } = await cliente.from(tabla).select("*").eq("id", id).single();
    if (error || !data) return window.STESIN_UI?.notificar?.(error?.message || "No se encontró el registro.", "error");
    actual = { tabla, id };
    campos.innerHTML = configuraciones[tabla].map(item => control(item, data[item[0]])).join("");
    mensaje.hidden = true;
    dialogo.showModal();
  }
  function agregarBotones() {
    const anadir = (boton, tabla, id) => {
      if (boton.closest(".admin-inline-actions")) return;
      const acciones = document.createElement("div");
      acciones.className = "admin-inline-actions";
      boton.insertAdjacentElement("beforebegin", acciones);
      acciones.appendChild(boton);
      const editar = document.createElement("button");
      editar.type = "button"; editar.className = "account-action secondary"; editar.dataset.editarRegistro = tabla; editar.dataset.id = id; editar.textContent = "Editar";
      acciones.insertAdjacentElement("afterbegin", editar);
    };
    document.querySelectorAll("#listaAvisosAdmin [data-aviso]").forEach(boton => {
      anadir(boton, "avisos", boton.dataset.aviso);
    });
    document.querySelectorAll("#listaRecursos [data-recurso]").forEach(boton => {
      anadir(boton, "recursos_personalizados", boton.dataset.recurso);
    });
    const calendario = [...document.querySelectorAll(".admin-card")].find(x => x.querySelector("h2")?.textContent.includes("Calendario administrable"));
    calendario?.querySelectorAll(".resource-list [data-id]").forEach(boton => {
      anadir(boton, "eventos_calendario", boton.dataset.id);
    });
  }
  document.addEventListener("click", evento => { const boton = evento.target.closest("[data-editar-registro]"); if (boton) abrir(boton.dataset.editarRegistro, boton.dataset.id); });
  dialogo.querySelectorAll("[data-cerrar]").forEach(boton => boton.addEventListener("click", () => dialogo.close()));
  dialogo.querySelector("form").addEventListener("submit", async evento => {
    evento.preventDefault();
    if (!actual) return;
    const formulario = evento.currentTarget, datos = new FormData(formulario), valores = {};
    configuraciones[actual.tabla].forEach(([nombre,,tipo]) => { valores[nombre] = tipo === "checkbox" ? formulario.elements[nombre].checked : (String(datos.get(nombre) || "").trim() || null); });
    const { error } = await cliente.from(actual.tabla).update(valores).eq("id", actual.id);
    mensaje.hidden = false; mensaje.classList.toggle("error", Boolean(error)); mensaje.textContent = error ? error.message : "Cambios guardados. Actualizando la vista…";
    if (!error) setTimeout(() => location.reload(), 550);
  });
  new MutationObserver(agregarBotones).observe(document.querySelector("main"), { childList:true, subtree:true });
  agregarBotones();
});
