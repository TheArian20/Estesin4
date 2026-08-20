window.STESIN_REDES = [
  { id: "facebook", nombre: "Facebook", icono: "f", descripcion: "Enlace externo compartido para consultar su contenido en Facebook.", enlace: "https://www.facebook.com/share/1DQufghAm2/" },
  { id: "youtube", nombre: "YouTube · Oiser Ramos Núñez", icono: "YT", descripcion: "Canal externo de videos y enseñanzas disponible en YouTube.", enlace: "https://youtube.com/@oiserramosnunez9178" },
  { id: "tiktok", nombre: "TikTok · Red Mundial de Ministerios", icono: "TT", descripcion: "Contenido breve, mensajes y publicaciones compartidas por esta comunidad ministerial.", enlace: "https://www.tiktok.com/@rm.minis..para.la" },
  { id: "instagram", nombre: "Instagram · Red Mundial de Ministerios", icono: "IG", descripcion: "Publicaciones, novedades y contenido visual de Red Mundial Ministerios PTLN.", enlace: "https://www.instagram.com/redmundialministeriosptln/" },
  { id: "youtube-red", nombre: "YouTube · Red Mundial MPTLN", icono: "YT", descripcion: "Canal de videos, mensajes y contenido audiovisual de Red Mundial MPTLN.", enlace: "https://youtube.com/@redmundialmptln" }
];

document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("socialGrid");
  if (!contenedor) return;
  contenedor.innerHTML = window.STESIN_REDES.map((red) => `<article class="social-card ${red.id}"><span class="social-icon" aria-hidden="true">${red.icono}</span><h2>${red.nombre}</h2><p>${red.descripcion}</p><a class="social-link" href="${red.enlace}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${red.nombre} en una pestaña nueva">Visitar canal <span aria-hidden="true">↗</span></a></article>`).join("");
});
