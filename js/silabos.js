document.addEventListener("DOMContentLoaded", () => {
  const buscador = document.getElementById("buscarSilabo");
  const filtro = document.getElementById("filtrarSilabo");
  const tarjetas = [...document.querySelectorAll(".silabo-card")];
  const vacio = document.getElementById("sinSilabos");
  const conteo = document.getElementById("conteoSilabos");
  if (!buscador || !filtro || !tarjetas.length) return;

  const normalizar = (texto) => String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const actualizar = () => {
    const consulta = normalizar(buscador.value.trim());
    const ciclo = filtro.value;
    let visibles = 0;

    tarjetas.forEach((tarjeta) => {
      const coincideTexto = !consulta || normalizar(tarjeta.textContent).includes(consulta);
      const coincideCiclo = ciclo === "todos"
        || tarjeta.dataset.ciclo === ciclo
        || (ciclo === "sin-ciclo" && !tarjeta.dataset.ciclo);
      const mostrar = coincideTexto && coincideCiclo;
      tarjeta.hidden = !mostrar;
      if (mostrar) visibles += 1;
    });

    vacio.hidden = visibles !== 0;
    if (conteo) {
      conteo.textContent = consulta || ciclo !== "todos"
        ? `${visibles} ${visibles === 1 ? "resultado" : "resultados"}`
        : "5 sílabos verificados · 1 pendiente";
    }
  };

  buscador.addEventListener("input", actualizar);
  filtro.addEventListener("change", actualizar);
});
