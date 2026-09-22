document.addEventListener("DOMContentLoaded", () => {
    const perfiles = {
        "Oiser Ramos Núñez": { cargo: "Rector", pais: "Perú", materias: "Dirección institucional y acompañamiento académico" },
        "Eliderio Angulo Guerra": { cargo: "Docente", pais: "Perú", materias: "Consejería Pastoral" },
        "Aroldo Misael López Herrera": { cargo: "Docente", pais: "Guatemala", materias: "Psicopedagogía" },
        "Javier Edilberto Vásquez Vásquez": { cargo: "Director y docente", pais: "Perú", materias: "Homilética Bíblica II, Hermenéutica Bíblica II y Administración Eclesiástica" },
        "Frank Isaac Berrocal Aréstegui": { cargo: "Docente", pais: "Perú", materias: "Introducción a la Sociología" },
        "José Ángel Piza Nivela": { cargo: "Docente", pais: "Puerto Rico", materias: "Teología Bíblica III (Cristología)" }
    };
    const modal = document.createElement("dialog");
    modal.className = "contact-profile-dialog";
    modal.innerHTML = '<button class="contact-dialog-close" type="button" aria-label="Cerrar">×</button><img alt=""><div><span class="profile-role"></span><h2></h2><p class="profile-subjects"></p><p class="profile-country"></p><a target="_blank" rel="noopener">Escribir por WhatsApp →</a></div>';
    document.body.appendChild(modal);
    document.querySelectorAll(".contact-person").forEach((tarjeta) => {
        const nombre = tarjeta.querySelector("h2")?.textContent.trim();
        const perfil = perfiles[nombre];
        if (!perfil) return;
        const etiquetas = document.createElement("div");
        etiquetas.className = "contact-profile-tags";
        etiquetas.innerHTML = `<span>${perfil.cargo}</span><span>${perfil.pais}</span>`;
        tarjeta.querySelector("h2").insertAdjacentElement("afterend", etiquetas);
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "contact-profile-open";
        boton.textContent = "Ver presentación";
        boton.addEventListener("click", () => {
            const foto = tarjeta.querySelector("img"), whatsapp = tarjeta.querySelector('a[href*="wa.me"]');
            modal.querySelector("img").src = foto.src;
            modal.querySelector("img").alt = foto.alt;
            modal.querySelector("h2").textContent = nombre;
            modal.querySelector(".profile-role").textContent = perfil.cargo;
            modal.querySelector(".profile-subjects").textContent = perfil.materias;
            modal.querySelector(".profile-country").textContent = `País: ${perfil.pais}`;
            modal.querySelector("a").href = whatsapp.href;
            modal.showModal();
        });
        tarjeta.querySelector("a")?.insertAdjacentElement("beforebegin", boton);
    });
    modal.querySelector(".contact-dialog-close").addEventListener("click", () => modal.close());
    modal.addEventListener("click", (evento) => { if (evento.target === modal) modal.close(); });
});
