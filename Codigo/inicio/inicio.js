/* ======================================
   NAVEGACIÓN ENTRE PANTALLAS
   Todo ocurre en el mismo viewport.
====================================== */

const pantallas = [
    "inicio",
    "menu",
    "instrucciones",
    "configuracion",
    "creditos"
];

let pantallaActual = "inicio";
let navegando = false;

function mostrarPantalla(id, actualizarHash = true) {
    if (!pantallas.includes(id) || id === pantallaActual || navegando) return;

    const actual = document.getElementById(pantallaActual);
    const siguiente = document.getElementById(id);
    if (!actual || !siguiente) return;

    const indiceActual = pantallas.indexOf(pantallaActual);
    const indiceSiguiente = pantallas.indexOf(id);
    const direccion = indiceSiguiente > indiceActual ? 1 : -1;

    navegando = true;

    // La nueva pantalla entra desde el lado correspondiente.
    siguiente.classList.remove("desde-izquierda", "desde-derecha");
    siguiente.classList.add(direccion > 0 ? "desde-derecha" : "desde-izquierda");
    siguiente.classList.add("activa");

    // Forzamos un frame para que el navegador vea el estado inicial.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            siguiente.classList.remove("desde-izquierda", "desde-derecha");
            actual.classList.remove("activa");
        });
    });

    pantallaActual = id;

    if (actualizarHash && history.replaceState) {
        history.replaceState(null, "", "#" + id);
    }

    setTimeout(() => {
        navegando = false;
    }, 700);
}

function entrarMenu() {
    mostrarPantalla("menu");
    iniciarMusicaMenu();
}

/* Todos los botones/enlaces internos pasan por la navegación lateral. */
document.addEventListener("click", (evento) => {
    const enlace = evento.target.closest("a[href^='#']");
    if (!enlace) return;

    const id = enlace.getAttribute("href").substring(1);
    if (!pantallas.includes(id)) return;

    evento.preventDefault();
    mostrarPantalla(id);
});

/* El usuario tampoco puede desplazarse con rueda, touch, teclado o barra. */
window.addEventListener("wheel", (evento) => evento.preventDefault(), { passive: false });
window.addEventListener("touchmove", (evento) => {
    // En celular permitimos desplazamiento únicamente dentro de las
    // instrucciones/configuración cuando su contenido lo necesita.
    const zonaDesplazable = evento.target.closest(
        ".marco-instrucciones, .marco-configuracion"
    );

    if (window.innerWidth <= 768 && zonaDesplazable) return;

    evento.preventDefault();
}, { passive: false });
window.addEventListener("keydown", (evento) => {
    const teclasScroll = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", "Spacebar", " "];
    if (teclasScroll.includes(evento.key)) evento.preventDefault();
});

/* ======================================
   CONFIGURACIÓN
====================================== */

let configuracionJuego = {
    volumen: 100,
    musica: true,
    sonido: true
};

/* ======================================
   MÚSICA DEL MENÚ PRINCIPAL
====================================== */

const musicaMenu = document.getElementById("musicaMenu");
let musicaMenuIniciada = false;

function aplicarConfiguracionAudioMenu() {
    if (!musicaMenu) return;
    musicaMenu.volume = configuracionJuego.volumen / 100;

    if (configuracionJuego.musica) {
        if (musicaMenuIniciada) {
            musicaMenu.play().catch(() => {});
        }
    } else {
        musicaMenu.pause();
    }
}

function iniciarMusicaMenu() {
    if (!musicaMenu || musicaMenuIniciada) return;
    musicaMenuIniciada = true;
    aplicarConfiguracionAudioMenu();
}

function cargarConfiguracion() {
    const guardado = localStorage.getItem("configuracionEscapeChile");

    if (guardado) {
        try {
            configuracionJuego = JSON.parse(guardado);
        } catch (error) {
            configuracionJuego = {
                            volumen: 100,
                musica: true,
                sonido: true
            };
        }
    }

    document.getElementById("volumenGeneral").value = configuracionJuego.volumen;
    document.getElementById("valorVolumen").textContent = configuracionJuego.volumen + "%";
    document.getElementById("botonMusica").textContent = configuracionJuego.musica ? "ACTIVADA" : "DESACTIVADA";
    document.getElementById("botonSonido").textContent = configuracionJuego.sonido ? "ACTIVADOS" : "DESACTIVADOS";

    aplicarConfiguracionAudioMenu();
}


function guardarConfiguracion() {
    localStorage.setItem("configuracionEscapeChile", JSON.stringify(configuracionJuego));
}

function actualizarVolumen() {
    const valor = Number(document.getElementById("volumenGeneral").value);
    configuracionJuego.volumen = valor;
    document.getElementById("valorVolumen").textContent = valor + "%";
    guardarConfiguracion();
    aplicarConfiguracionAudioMenu();
}

function alternarMusica() {
    configuracionJuego.musica = !configuracionJuego.musica;
    document.getElementById("botonMusica").textContent = configuracionJuego.musica ? "ACTIVADA" : "DESACTIVADA";
    guardarConfiguracion();
    aplicarConfiguracionAudioMenu();
}

function alternarSonido() {
    configuracionJuego.sonido = !configuracionJuego.sonido;
    document.getElementById("botonSonido").textContent = configuracionJuego.sonido ? "ACTIVADOS" : "DESACTIVADOS";
    guardarConfiguracion();
}

function pantallaCompleta() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {
            alert("No se pudo activar la pantalla completa.");
        });
    } else {
        document.exitFullscreen();
    }
}

function restablecerConfiguracion() {
    configuracionJuego = {
            volumen: 100,
        musica: true,
        sonido: true
    };

    guardarConfiguracion();
    cargarConfiguracion();
}


/* ======================================
   CARGA DEL NIVEL 1
====================================== */

const consejosNivel1 = [
    "Explorá el escenario y prestá atención a los obstáculos.",
    "Recolectá los pergaminos para avanzar en la historia.",
    "Evitá a los soldados federales y cuidá tus vidas.",
    "Podés saltar con la flecha arriba o con W.",
    "Cuando aparezca un documento histórico, podés cerrarlo con ESPACIO.",
    "Observá bien el escenario: algunos obstáculos requieren que saltes.",
    "Si perdés todas tus vidas, tendrás que intentar el nivel nuevamente."
];

let indiceConsejo = 0;
let intervaloCarga = null;
let intervaloConsejos = null;
let cargaActiva = false;
let cargaTerminada = false;

function iniciarNivel1(evento) {
    if (evento) evento.preventDefault();
    if (cargaActiva) return;

    cargaActiva = true;
    cargaTerminada = false;
    indiceConsejo = 0;

    if (musicaMenu) musicaMenu.pause();

    const pantalla = document.getElementById("pantallaCarga");
    const progreso = document.getElementById("progresoCarga");
    const porcentaje = document.getElementById("porcentajeCarga");
    const textoConsejo = document.getElementById("textoConsejo");

    if (!pantalla || !progreso || !porcentaje || !textoConsejo) {
        window.location.href = "../nivel1/nivel1.html";
        return;
    }

    textoConsejo.textContent = consejosNivel1[indiceConsejo];
    progreso.style.width = "0%";
    porcentaje.textContent = "0%";
    pantalla.classList.add("mostrar");
    pantalla.setAttribute("aria-hidden", "false");

    let inicio = performance.now();
    const duracion = 4000;

    intervaloCarga = requestAnimationFrame(actualizarCarga);

    function actualizarCarga(ahora) {
        const avance = Math.min((ahora - inicio) / duracion, 1);
        const valor = Math.round(avance * 100);
        progreso.style.width = valor + "%";
        porcentaje.textContent = valor + "%";

        if (avance < 1) {
            intervaloCarga = requestAnimationFrame(actualizarCarga);
        } else {
            cargaTerminada = true;
            clearInterval(intervaloConsejos);
            intervaloConsejos = null;
            pantalla.classList.add("carga-lista");
            const indicacion = pantalla.querySelector(".iniciar-carga");
            if (indicacion) indicacion.textContent = "APRETÁ ESPACIO PARA COMENZAR EL JUEGO";
        }
    }

    intervaloConsejos = setInterval(() => {
        if (!cargaTerminada) cambiarConsejo();
    }, 2200);
}

function cambiarConsejo() {
    const textoConsejo = document.getElementById("textoConsejo");
    if (!textoConsejo || !cargaActiva || cargaTerminada) return;

    indiceConsejo = (indiceConsejo + 1) % consejosNivel1.length;
    textoConsejo.classList.remove("consejo-cambia");
    void textoConsejo.offsetWidth;
    textoConsejo.textContent = consejosNivel1[indiceConsejo];
    textoConsejo.classList.add("consejo-cambia");
}

document.addEventListener("keydown", (evento) => {
    if (!cargaActiva) return;

    if (evento.code === "Space" || evento.key === " ") {
        evento.preventDefault();
        cambiarConsejo();
    }
});

/* ======================================
   INICIAR
====================================== */

document.addEventListener("DOMContentLoaded", () => {
    cargarConfiguracion();

    const hash = window.location.hash.substring(1);
    const inicial = pantallas.includes(hash) ? hash : "inicio";

    document.querySelectorAll(".pantalla").forEach((pantalla) => {
        pantalla.classList.remove("activa", "desde-izquierda", "desde-derecha");
    });

    document.getElementById(inicial).classList.add("activa");
    pantallaActual = inicial;

    // Si entramos directamente en una pantalla que no es la de bienvenida
    // (por ejemplo al volver desde el nivel), la música puede arrancar sola
    // porque ya hubo una interacción previa del usuario en esta sesión.
    if (inicial !== "inicio") {
        iniciarMusicaMenu();
    }

    if (history.replaceState) {
        history.replaceState(null, "", "#" + inicial);
    }

    // Si volvemos desde un nivel, la entrada al menú se siente como
    // una continuación de la transición anterior, no como un corte.
    if (sessionStorage.getItem("escapeChileVolviendoMenu") === "1") {
        sessionStorage.removeItem("escapeChileVolviendoMenu");
        document.body.classList.add("entrada-desde-nivel");
        setTimeout(() => document.body.classList.remove("entrada-desde-nivel"), 900);
    }
});


/* ESPACIO controla la pantalla de carga: cambia consejos y, cuando termina, inicia el nivel. */
document.addEventListener("keydown", (evento) => {
    if (!cargaActiva || evento.code !== "Space") return;
    evento.preventDefault();
    evento.stopPropagation();

    if (cargaTerminada) {
        window.location.href = "../nivel1/nivel1.html";
    } else {
        cambiarConsejo();
    }
});
