// Mantiene visible la navegación pública aunque Firebase tarde en responder.
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar || localStorage.getItem("rolUsuario") === "admin" || sidebar.querySelector("[data-menu-respaldo]")) return;
  sidebar.querySelectorAll("a").forEach((enlace) => enlace.remove());
  const navegacion = document.createElement("div");
  navegacion.dataset.menuRespaldo = "true";
  navegacion.innerHTML = `
    <a href="index.html">Inicio</a><a href="cursos.html">Ciclos</a>
    <a href="calendario.html">Calendario</a><a href="malla-curricular.html">Malla curricular</a>
    <a href="biblioteca.html">Biblioteca</a><a href="silabos.html">Sílabos</a>
    <a href="alabanzas.html">Alabanzas</a><a href="mensajes.html">Comunicados</a>
    <a href="redes.html">Enlaces</a><a href="contacto.html">Contacto</a>
    <a href="instalar.html">Instalar STESIN</a><a href="login.html">Acceso administrativo</a>`;
  while (navegacion.firstChild) sidebar.appendChild(navegacion.firstChild);
});

// Carga Firebase de forma sincronica antes de iniciar los modulos del sitio.
document.write('<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"><\/script>');
document.write('<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js"><\/script>');
document.write('<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js"><\/script>');
document.write('<script src="js/firebase.js"><\/script>');
document.write('<script src="js/firebase-datos.js"><\/script>');
document.write('<script src="js/visitas.js"><\/script>');
