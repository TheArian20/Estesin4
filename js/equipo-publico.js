document.addEventListener("DOMContentLoaded", async () => {
  "use strict";
  const cliente = window.STESIN_DATOS;
  if (!cliente) return;
  const normalizar = texto => String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const { data, error } = await cliente.from("equipo_docente").select("*").order("orden");
  if (error || !(data || []).length) return;
  const tarjetas = [...document.querySelectorAll(".contact-person")];
  const contenedor = document.querySelector("#equipo-docente .contact-grid") || document.querySelector(".contact-additional");
  data.forEach(persona => {
    let tarjeta = tarjetas.find(item => normalizar(item.querySelector("h2")?.textContent) === normalizar(persona.nombre));
    if (!tarjeta && persona.activo !== false && contenedor) {
      tarjeta = document.createElement("article");
      tarjeta.className = "contact-person";
      tarjeta.innerHTML = '<img loading="lazy" width="900" height="1125"><span></span><h2></h2><p></p><a target="_blank" rel="noopener">Escribir por WhatsApp →</a>';
      contenedor.appendChild(tarjeta);
      tarjetas.push(tarjeta);
    }
    if (!tarjeta) return;
    tarjeta.hidden = persona.activo === false;
    if (persona.activo === false) return;
    const foto = tarjeta.querySelector("img"), titulo = tarjeta.querySelector("h2"), rotulo = tarjeta.querySelector(":scope > span"), descripcion = tarjeta.querySelector(":scope > p"), enlace = tarjeta.querySelector('a[href*="wa.me"]');
    tarjeta.dataset.cargo = persona.cargo || "Docente";
    tarjeta.dataset.pais = persona.pais || "";
    tarjeta.dataset.materias = persona.materias || "";
    if (foto && persona.foto_url) { foto.src = persona.foto_url; foto.alt = `${persona.nombre}, ${persona.cargo || "integrante de STESIN"}`; }
    if (titulo) titulo.textContent = persona.nombre;
    if (rotulo) rotulo.textContent = persona.materias || persona.cargo;
    if (descripcion) descripcion.textContent = `${persona.cargo || "Docente"}${persona.materias ? ` de ${persona.materias}` : ""}.`;
    if (enlace && persona.whatsapp) enlace.href = `https://wa.me/${String(persona.whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${persona.nombre}, soy estudiante de STESIN y tengo una consulta.`)}`;
  });
  document.dispatchEvent(new CustomEvent("stesin-equipo-actualizado"));
});
