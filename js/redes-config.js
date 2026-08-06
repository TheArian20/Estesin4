window.STESIN_REDES = [
  { id: "facebook", nombre: "Facebook", icono: "f", descripcion: "Noticias, actividades y comunicados de la comunidad STESIN.", enlace: "https://www.facebook.com/share/1DQufghAm2/" },
  { id: "youtube", nombre: "YouTube", icono: "▶", descripcion: "Transmisiones, enseñanzas y contenido audiovisual institucional.", enlace: "" },
  { id: "whatsapp", nombre: "WhatsApp", icono: "◔", descripcion: "Canal de contacto directo y avisos importantes para estudiantes.", enlace: "" }
];

document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("socialGrid");
  if (!contenedor) return;
  contenedor.innerHTML = window.STESIN_REDES.map((red) => `<article class="social-card ${red.id}"><span class="social-icon">${red.icono}</span><h2>${red.nombre}</h2><p>${red.descripcion}</p>${red.enlace ? `<a class="social-link" href="${red.enlace}" target="_blank" rel="noopener">Visitar ${red.nombre} ↗</a>` : '<span class="social-status">Enlace oficial pendiente</span>'}</article>`).join("");
});
