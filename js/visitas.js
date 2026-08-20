(function () {
  "use strict";
  const db = window.STESIN_DB;
  if (!db || location.protocol === "file:") return;

  const pagina = location.pathname.split("/").pop() || "index.html";
  const marcaSesion = `stesin-visita:${pagina}`;
  if (sessionStorage.getItem(marcaSesion)) return;

  let visitanteId = localStorage.getItem("stesin-visitante-id");
  if (!visitanteId) {
    visitanteId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("stesin-visitante-id", visitanteId);
  }

  let sesionId = sessionStorage.getItem("stesin-sesion-id");
  if (!sesionId) {
    sesionId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem("stesin-sesion-id", sesionId);
  }

  const dispositivo = matchMedia("(max-width: 720px)").matches ? "movil" : "escritorio";
  db.collection("visitas").add({
    visitante_id: visitanteId,
    sesion_id: sesionId,
    pagina,
    dispositivo,
    origen: document.referrer ? new URL(document.referrer).hostname.slice(0, 120) : "directo",
    creado_en: window.firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => sessionStorage.setItem(marcaSesion, "1")).catch(error => console.warn("No se pudo registrar la visita:", error.code));
})();
