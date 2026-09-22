document.addEventListener("DOMContentLoaded", () => window.setTimeout(() => {
  const nombre = localStorage.getItem("subcicloSeleccionado") || "Materia";
  const ciclo = localStorage.getItem("cicloDeSubciclo") || "Ciclo académico";
  const docentes = {
    "Psicopedagogía": { nombre:"Aroldo Misael López Herrera", foto:"assets/equipo/aroldo-misael-lopez-herrera-actualizada.jpg", whatsapp:"https://wa.me/50241558772", horario:"Miércoles 30 · 6:00 – 7:30", descripcion:"Explora los principios del aprendizaje y su aplicación en la formación cristiana.", objetivos:["Reconocer principios esenciales de psicología y pedagogía.","Aplicar estrategias de enseñanza al contexto ministerial.","Valorar el modelo pedagógico de Jesús."] },
    "Homilética Bíblica II": { nombre:"Javier Edilberto Vásquez Vásquez", foto:"assets/equipo/javier-edilberto-vasquez-vasquez.jpeg", whatsapp:"https://wa.me/51956159720", horario:"Lunes · 6:00 – 7:30", descripcion:"Fortalece la preparación y comunicación de mensajes bíblicos claros y pertinentes.", objetivos:["Estructurar sermones con coherencia bíblica.","Desarrollar recursos de comunicación oral.","Aplicar principios homiléticos en la práctica ministerial."] },
    "Hermenéutica Bíblica II": { nombre:"Javier Edilberto Vásquez Vásquez", foto:"assets/equipo/javier-edilberto-vasquez-vasquez.jpeg", whatsapp:"https://wa.me/51956159720", horario:"Lunes · 7:30 – 9:00", descripcion:"Profundiza en la interpretación responsable del texto bíblico.", objetivos:["Aplicar métodos de interpretación bíblica.","Reconocer el contexto histórico y literario.","Comunicar conclusiones exegéticas con claridad."] },
    "Administración Eclesiástica": { nombre:"Javier Edilberto Vásquez Vásquez", foto:"assets/equipo/javier-edilberto-vasquez-vasquez.jpeg", whatsapp:"https://wa.me/51956159720", horario:"Según calendario académico", descripcion:"Desarrolla capacidades para organizar y administrar responsablemente una comunidad eclesial.", objetivos:["Comprender funciones administrativas de la iglesia.","Organizar recursos y equipos de trabajo.","Aplicar principios de liderazgo y planificación."] },
    "Introducción a la Sociología": { nombre:"Frank Isaac Berrocal Aréstegui", foto:"assets/equipo/frank-isaac-berrocal-arestegui.jpeg", whatsapp:"https://wa.me/51946554066", horario:"Según calendario académico", descripcion:"Introduce el análisis de la sociedad, la cultura y sus relaciones con la comunidad de fe.", objetivos:["Identificar conceptos sociológicos fundamentales.","Analizar fenómenos sociales contemporáneos.","Relacionar sociedad, cultura y acción ministerial."] },
    "Teología Bíblica III (Cristología)": { nombre:"José Ángel Piza Nivela", foto:"assets/equipo/jose-angel-piza-nivela-actualizada.jpg", whatsapp:"https://wa.me/19394962322", horario:"Según calendario académico", descripcion:"Estudia la persona y obra de Jesucristo desde el testimonio bíblico.", objetivos:["Reconocer fundamentos bíblicos de la Cristología.","Comprender la persona y obra de Cristo.","Relacionar la doctrina con la vida y el ministerio."] },
    "Consejería Pastoral": { nombre:"Eliderio Angulo Guerra", foto:"assets/equipo/eliderio-angulo-guerra.jpeg", whatsapp:"https://wa.me/51985124390", horario:"Según calendario académico", descripcion:"Ofrece fundamentos para acompañar a personas con sensibilidad bíblica y pastoral.", objetivos:["Comprender el propósito de la consejería pastoral.","Desarrollar escucha y acompañamiento responsable.","Reconocer límites éticos y situaciones que requieren derivación."] }
  };
  const perfil = docentes[nombre] || { nombre:"Equipo académico STESIN", foto:"stesin-app-icon-v2-192.png", whatsapp:"", horario:"Consulta el calendario", descripcion:"Consulta los contenidos y materiales oficiales disponibles para esta materia.", objetivos:["Comprender los fundamentos principales de la materia.","Relacionar los contenidos con la formación ministerial.","Aplicar lo aprendido mediante lecturas y actividades."] };
  const asignar = (id, texto) => { const nodo=document.getElementById(id); if(nodo) nodo.textContent=texto; };
  asignar("docenteMateria", perfil.nombre);
  asignar("resumenMateria", `${perfil.descripcion} ${ciclo}.`);
  asignar("descripcionMateria", perfil.descripcion);
  asignar("horarioMateria", perfil.horario);
  const foto=document.getElementById("fotoDocenteMateria"); if(foto){foto.src=perfil.foto;foto.alt=`${perfil.nombre}, docente de ${nombre}`;}
  const contacto=document.getElementById("contactarDocenteMateria"); if(contacto){ contacto.href=perfil.whatsapp ? `${perfil.whatsapp}?text=${encodeURIComponent(`Hola, soy estudiante de STESIN y tengo una consulta sobre ${nombre}.`)}` : "contacto.html"; if(perfil.whatsapp){contacto.target="_blank";contacto.rel="noopener";} }
  const silabo=document.getElementById("abrirSilaboMateria"); if(silabo) silabo.href=`silabos.html?buscar=${encodeURIComponent(nombre)}`;
  const objetivos=document.getElementById("objetivosMateria"); if(objetivos) objetivos.innerHTML=perfil.objetivos.map(objetivo=>`<li>${objetivo}</li>`).join("");
  const contenedor = document.querySelector(".materia-info");
  if (!contenedor) return;
  const acciones = document.createElement("section");
  acciones.className = "materia-acciones";
  acciones.innerHTML = `<a class="agenda-open" href="calendario.html">Ver próxima clase</a><a class="agenda-open" href="silabos.html?buscar=${encodeURIComponent(nombre)}">Consultar sílabo</a><a class="agenda-open" href="mensajes.html">Ver comunicados</a>`;
  contenedor.insertAdjacentElement("afterend", acciones);
}, 450));
