const CACHE = "stesin-v27";
const BASE = ["./", "index.html", "404.html", "login.html", "contacto.html", "biblioteca.html", "visor.html", "calendario.html", "silabos.html", "css/style.css", "css/login.css", "js/aulax.js", "js/dashboard.js", "js/biblioteca.js", "js/visor.js", "js/agenda.js", "js/silabos.js", "js/firebase-inicio.js", "js/firebase.js", "js/firebase-datos.js", "js/visitas.js", "biblioteca-catalogo.js", "biblioteca-enlaces.js", "biblioteca-adicionales.js", "assets/equipo/oiser-ramos-nunez.jpg", "assets/equipo/javier-edilberto-vasquez-vasquez.jpeg", "manifest.json", "stesin-app-icon-v2-192.png", "stesin-app-icon-v2-512.png", "stesin-app-maskable-v2-192.png", "stesin-app-maskable-v2-512.png"];

self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(BASE)).then(() => self.skipWaiting())));
self.addEventListener("activate", (event) => event.waitUntil(Promise.all([
  caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  self.clients.claim()
])));
self.addEventListener("message", (event) => { if (event.data?.tipo === "ACTUALIZAR") self.skipWaiting(); });
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("index.html"))));
});
