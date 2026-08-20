document.addEventListener("DOMContentLoaded", async () => {
  const c = window.STESIN_DATOS, destino = document.getElementById("resumenAdministrativo");
  if (!c || !destino || localStorage.getItem("rolUsuario") !== "admin") return;
  const seccion = document.createElement("section"); seccion.className = "admin-card";
  seccion.innerHTML = '<h2>Progreso validado por materia</h2><p>Solo la administración puede marcar una materia como completada. El estudiante no puede modificar este registro.</p><form class="resource-form"><label class="wide">Estudiante<select name="estudiante" required></select></label><label>Ciclo<select name="ciclo"><option>Ciclo I</option><option>Ciclo II</option><option>Ciclo III</option><option>Ciclo IV</option><option selected>Ciclo V</option><option>Ciclo VI</option><option>Ciclo VII</option><option>Ciclo VIII</option></select></label><label>Materia<input name="materia" required minlength="3" placeholder="Ej.: Psicopedagogía"></label><button class="account-action">Marcar completada</button></form><div class="admin-state" hidden></div>';
  destino.insertAdjacentElement("afterend", seccion);
  const selector=seccion.querySelector("select[name=estudiante]"), form=seccion.querySelector("form"), estado=seccion.querySelector(".admin-state");
  const {data:personas,error}=await c.from("perfiles").select("id,nombre,ciclo_actual").eq("rol","estudiante").eq("activo",true).order("nombre");
  if(error){estado.hidden=false;estado.textContent="Ejecuta el SQL actualizado para administrar progreso.";return;}
  selector.innerHTML=(personas||[]).map(p=>`<option value="${p.id}" data-ciclo="${p.ciclo_actual}">${p.nombre} · ${p.ciclo_actual}</option>`).join("");
  selector.addEventListener("change",()=>{form.ciclo.value=selector.selectedOptions[0]?.dataset.ciclo||"Ciclo V"}); selector.dispatchEvent(new Event("change"));
  form.addEventListener("submit",async e=>{e.preventDefault();const d=new FormData(form),{error:guardar}=await c.from("progreso_materias").upsert({usuario_id:d.get("estudiante"),ciclo:d.get("ciclo"),materia:d.get("materia").trim(),completado:true,actualizado_en:new Date().toISOString()});estado.hidden=false;estado.textContent=guardar?guardar.message:"Materia marcada como completada.";estado.classList.toggle("error",Boolean(guardar));if(!guardar)form.materia.value="";});
});
