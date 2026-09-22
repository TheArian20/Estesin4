document.addEventListener("DOMContentLoaded", async () => {
    const leer = (clave, defecto = []) => { try { return JSON.parse(localStorage.getItem(clave) || JSON.stringify(defecto)); } catch { return defecto; } };
    const clases = [
        ["2026-09-22T18:00:00","Consejería Pastoral","Hoy · 6:00 – 7:30"],
        ["2026-09-30T18:00:00","Psicopedagogía","Miércoles 30 · 6:00 – 7:30"]
    ];
    const proxima = clases.find(([fecha]) => new Date(fecha) >= new Date());
    const tarjetaClase = document.getElementById("hoyProximaClase");
    if (tarjetaClase) {
        tarjetaClase.querySelector("strong").textContent = proxima ? proxima[1] : "Sin clases próximas publicadas";
        tarjetaClase.querySelector("small").textContent = proxima ? proxima[2] : "Consultar calendario";
    }
    const historial = leer("bibliotecaHistorial");
    const ultimo = historial[0];
    const tarjetaLectura = document.getElementById("hoyLectura");
    if (tarjetaLectura && ultimo) {
        tarjetaLectura.querySelector("strong").textContent = ultimo.nombre;
        tarjetaLectura.href = ultimo.tipo === "pdf" ? `visor.html?src=${encodeURIComponent(ultimo.enlace)}&nombre=${encodeURIComponent(ultimo.nombre)}` : `biblioteca.html?buscar=${encodeURIComponent(ultimo.nombre)}`;
    }
    const favoritos = leer("bibliotecaFavoritos");
    const tarjetaFavoritos = document.getElementById("hoyFavoritos");
    if (tarjetaFavoritos) tarjetaFavoritos.querySelector("strong").textContent = `${favoritos.length} recurso${favoritos.length === 1 ? "" : "s"} guardado${favoritos.length === 1 ? "" : "s"}`;
    const cliente = window.STESIN_DATOS;
    const tarjetaAviso = document.getElementById("hoyAviso");
    if (cliente && tarjetaAviso) {
        const { data } = await cliente.from("avisos").select("titulo,mensaje").eq("activo", true).order("destacado", { ascending:false }).order("creado_en", { ascending:false }).limit(1);
        if (data?.[0]) {
            tarjetaAviso.querySelector("strong").textContent = data[0].titulo;
            tarjetaAviso.querySelector("small").textContent = data[0].mensaje;
        } else {
            tarjetaAviso.querySelector("strong").textContent = "No hay avisos pendientes";
            tarjetaAviso.querySelector("small").textContent = "Estás al día";
        }
    }
});
