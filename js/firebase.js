// Configuracion publica de la aplicacion web de Firebase.
// La seguridad de los datos se aplica en firestore.rules.
window.STESIN_ADMIN_UID = "eeKKifjIAmXICHCQua6s2fmTVnl1";

window.STESIN_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAahmJG5WFqrBzdrv3QLiFeWGbRHkVbqsE",
  authDomain: "estesin.firebaseapp.com",
  projectId: "estesin",
  storageBucket: "estesin.firebasestorage.app",
  messagingSenderId: "209591798392",
  appId: "1:209591798392:web:b01dd2eb7c7ce2797fbb8d",
  measurementId: "G-XJYKVEPWSR"
};

if (!window.firebase) {
  throw new Error("No se pudo cargar Firebase.");
}

if (!window.firebase.apps.length) {
  window.firebase.initializeApp(window.STESIN_FIREBASE_CONFIG);
}

window.STESIN_FIREBASE = window.firebase.app();
window.STESIN_AUTH = window.firebase.auth();
window.STESIN_DB = window.firebase.firestore();

window.STESIN_ES_ADMIN = function (usuario) {
  return Boolean(usuario && usuario.uid === window.STESIN_ADMIN_UID);
};
