document.addEventListener("DOMContentLoaded", async () => {
  const cliente = window.STESIN_DATOS;
  if (!cliente || localStorage.getItem("rolUsuario") !== "admin") return;
  const csv = (filas) => "\ufeff" + filas.map(f => f.map(v => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const descargar = (nombre, filas) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv(filas)], { type:"text/csv;charset=utf-8" })); a.download = nombre; a.click(); URL.revokeObjectURL(a.href); };
  const observar = new MutationObserver(() => {
    document.querySelectorAll(".account-row").forEach(fila => {
      if (fila.querySelector("[data-reporte]")) return;
      const botonEstado = fila.querySelector(".account-action[data-id]");
      if (!botonEstado) return;
      const boton = document.createElement("button"); boton.type = "button"; boton.className = "account-action"; boton.dataset.reporte = botonEstado.dataset.id; boton.textContent = "Reporte CSV";
      boton.addEventListener("click", async () => {
        boton.disabled = true; boton.textContent = "Generando…";
        const id = boton.dataset.reporte;
        const [{data:persona},{data:asistencia},{data:tareas},{data:evaluaciones},{data:lecturas}] = await Promise.all([
          cliente.from("perfiles").select("nombre,usuario,ciclo_actual").eq("id", id).single(),
          cliente.from("asistencia").select("fecha,materia,presente").eq("estudiante_id", id),
          cliente.from("entregas_tareas").select("estado,calificacion,entregado_en,tareas_academicas(titulo,materia,ciclo)").eq("estudiante_id", id),
          cliente.from("intentos_evaluacion").select("puntaje,puntaje_maximo,enviado_en,evaluaciones(titulo,materia,ciclo)").eq("estudiante_id", id),
          cliente.from("progreso_lectura").select("recurso_nombre,ciclo,leido_en").eq("usuario_id", id)
        ]);
        const filas = [["Reporte STESIN", persona?.nombre || "Estudiante"], ["Usuario", persona?.usuario || ""], ["Ciclo", persona?.ciclo_actual || ""], [], ["Tipo","Fecha","Detalle","Estado / resultado"]];
        (asistencia || []).forEach(x => filas.push(["Asistencia",x.fecha,x.materia || "Clase",x.presente ? "Presente" : "Inasistencia"]));
        (tareas || []).forEach(x => filas.push(["Tarea",x.entregado_en,x.tareas_academicas?.titulo || "Actividad",`${x.estado}${x.calificacion != null ? ` · ${x.calificacion}/20` : ""}`]));
        (evaluaciones || []).forEach(x => filas.push(["Evaluación",x.enviado_en,x.evaluaciones?.titulo || "Evaluación",`${x.puntaje}/${x.puntaje_maximo}`]));
        (lecturas || []).forEach(x => filas.push(["Recurso",x.leido_en,x.recurso_nombre,x.ciclo || "Biblioteca"]));
        descargar(`reporte-${(persona?.usuario || "estudiante").replace(/[^a-z0-9.-]/gi,"-")}.csv`, filas);
        boton.disabled = false; boton.textContent = "Reporte CSV";
      });
      botonEstado.insertAdjacentElement("afterend", boton);
    });
  });
  observar.observe(document.body, { childList:true, subtree:true });
});
