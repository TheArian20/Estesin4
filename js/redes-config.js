window.STESIN_REDES = [
  { id: "facebook", nombre: "Facebook", icono: "f", descripcion: "Enlace externo compartido para consultar su contenido en Facebook.", enlace: "https://www.facebook.com/share/1DQufghAm2/" },
  { id: "youtube", nombre: "YouTube · Oiser Ramos Núñez", icono: "▶", descripcion: "Canal externo de videos y enseñanzas disponible en YouTube.", enlace: "https://youtube.com/@oiserramosnunez9178?si=ugXFNWDs3A26Zs1B" }
];

document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("socialGrid");
  if (!contenedor) return;
  contenedor.innerHTML = window.STESIN_REDES.map((red) => `<article class="social-card ${red.id}"><span class="social-icon">${red.icono}</span><h2>${red.nombre}</h2><p>${red.descripcion}</p><a class="social-link" href="${red.enlace}" target="_blank" rel="noopener">Abrir enlace ↗</a></article>`).join("");
});
