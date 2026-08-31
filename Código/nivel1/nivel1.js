
/* =========================================================
   ELEMENTOS
========================================================= */

const personaje =
    document.getElementById("sarmiento");

const enemigo =
    document.getElementById("enemigo");

const mundo =
    document.getElementById("mundo");

const escenario =
    document.querySelector(".escenario");


const pergaminos =
    document.querySelectorAll(".pergamino");


const overlayPergamino =
    document.getElementById("overlayPergamino");


const textoTitulo =
    document.getElementById("textoTitulo");


const textoDocumento =
    document.getElementById("textoDocumento");


const overlayQuiz =
    document.getElementById("overlayQuiz");


const overlayResultado =
    document.getElementById("overlayResultado");


const intermisionNivel =
    document.getElementById("intermisionNivel");


const pantallaVictoria =
    document.getElementById("pantallaVictoria");


const pantallaGameOver =
    document.getElementById("pantallaGameOver");


const contadorPergaminos =
    document.getElementById("contadorPergaminos");


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const ANCHO_MUNDO = 5000;

const PISO = 90;

const ANCHO_PERSONAJE = 120;

const ANCHO_ENEMIGO = 120;

const VELOCIDAD_JUGADOR = 6;

const GRAVEDAD = 0.55;

const FUERZA_SALTO = 19;

const VELOCIDAD_ENEMIGO = 1.35;

const VELOCIDAD_MAXIMA_ENEMIGO = 1.8;

const INTERVALO_FEDERAL = 7000;

const MAX_FEDERALES_EXTRA = 4;


/* =========================================================
   ESTADO
========================================================= */

let posicionJugador = 220;

let posicionEnemigo = 850;

let posicionVertical = PISO;

let velocidadVertical = 0;

let saltando = false;

let vidas = 3;

let pergaminosRecolectados = 0;

let juegoTerminado = false;


/* =========================================================
   PUNTAJE Y TIEMPO
========================================================= */

let puntos = 0;

let tiempoInicio = Date.now();

let tiempoFinal = 0;

let intervaloTiempo = null;


/* =========================================================
   ELEMENTOS DEL HUD
========================================================= */

const contadorPuntos =
    document.getElementById("contadorPuntos");

const contadorTiempo =
    document.getElementById("contadorTiempo");

let invulnerable = false;

let direccionJugador = 1;

let federalesExtra = [];


/* =========================================================
   OPTIMIZACIÓN
   NO CAMBIA LA LÓGICA DEL JUEGO
========================================================= */

let intervaloFederales = null;

let ultimaCamaraX = -1;


/* =========================================================
   OBSTÁCULOS
========================================================= */

let obstaculos = [

    {
        elemento:
            document.getElementById("obstaculo1"),

        posicion: 1050
    },

    {
        elemento:
            document.getElementById("obstaculo2"),

        posicion: 2050
    },

    {
        elemento:
            document.getElementById("obstaculo3"),

        posicion: 3250
    }

];


let obstaculosGolpeados =
    new Set();


/* =========================================================
   TECLAS
========================================================= */

const teclas = {

    izquierda: false,

    derecha: false

};


/* =========================================================
   QUIZ
========================================================= */

const preguntas = [

    {
        pregunta:
            "¿Qué ocurrió en Argentina durante 1852?",

        opciones: [

            "Buenos Aires y la Confederación Argentina estaban enfrentadas.",

            "Argentina dejó de tener conflictos políticos.",

            "Sarmiento comenzó su presidencia.",

            "Buenos Aires se convirtió en Chile."

        ],

        correcta: 0
    },


    {
        pregunta:
            "¿Cuál de estas actividades realizó Sarmiento?",

        opciones: [

            "Fue únicamente militar.",

            "Fue solamente comerciante.",

            "Fue escritor, educador y político.",

            "Fue únicamente presidente."

        ],

        correcta: 2
    },


    {
        pregunta:
            "¿Qué debe hacer Sarmiento para continuar su camino?",

        opciones: [

            "Quedarse en Buenos Aires.",

            "Avanzar por el territorio y superar obstáculos.",

            "Buscar a los federales.",

            "Abandonar el camino hacia Chile."

        ],

        correcta: 1
    }

];


let preguntaActual = 0;

let respuestasCorrectas = 0;

let respuestaSeleccionada = false;


/* =========================================================
   TECLADO
========================================================= */

document.addEventListener(
    "keydown",
    (evento) => {

        if (juegoTerminado) return;


        if (
            evento.key === "ArrowRight" ||
            evento.key.toLowerCase() === "d"
        ) {

            teclas.derecha = true;

            direccionJugador = 1;

        }


        if (
            evento.key === "ArrowLeft" ||
            evento.key.toLowerCase() === "a"
        ) {

            teclas.izquierda = true;

            direccionJugador = -1;

        }


        if (
            evento.key === "ArrowUp" ||
            evento.key === " " ||
            evento.key.toLowerCase() === "w"
        ) {

            evento.preventDefault();

            saltar();

        }

    }
);


document.addEventListener(
    "keyup",
    (evento) => {

        if (
            evento.key === "ArrowRight" ||
            evento.key.toLowerCase() === "d"
        ) {

            teclas.derecha = false;

        }


        if (
            evento.key === "ArrowLeft" ||
            evento.key.toLowerCase() === "a"
        ) {

            teclas.izquierda = false;

        }

    }
);


/* =========================================================
   BOTONES
========================================================= */

function configurarBotonMovimiento(
    boton,
    direccion
) {

    boton.addEventListener(
        "pointerdown",
        (evento) => {

            evento.preventDefault();

            teclas[direccion] = true;

            direccionJugador =
                direccion === "derecha"
                    ? 1
                    : -1;

        }
    );


    boton.addEventListener(
        "pointerup",
        () => {

            teclas[direccion] = false;

        }
    );


    boton.addEventListener(
        "pointerleave",
        () => {

            teclas[direccion] = false;

        }
    );


    boton.addEventListener(
        "pointercancel",
        () => {

            teclas[direccion] = false;

        }
    );

}


configurarBotonMovimiento(
    document.getElementById("btnIzquierda"),
    "izquierda"
);


configurarBotonMovimiento(
    document.getElementById("btnDerecha"),
    "derecha"
);


document
    .getElementById("btnSaltar")
    .addEventListener(
        "pointerdown",
        (evento) => {

            evento.preventDefault();

            saltar();

        }
    );


/* =========================================================
   SALTO
========================================================= */

function saltar() {

    if (
        !saltando &&
        !juegoTerminado
    ) {

        saltando = true;

        velocidadVertical =
            FUERZA_SALTO;

        personaje.classList.add(
            "saltando"
        );

    }

}


/* =========================================================
   JUGADOR
========================================================= */

function actualizarJugador() {

    if (juegoTerminado) return;


    if (teclas.derecha) {

        posicionJugador +=
            VELOCIDAD_JUGADOR;

        direccionJugador = 1;

    }


    if (teclas.izquierda) {

        posicionJugador -=
            VELOCIDAD_JUGADOR;

        direccionJugador = -1;

    }


    const limiteDerecho =
        ANCHO_MUNDO -
        ANCHO_PERSONAJE -
        30;


    if (posicionJugador < 20) {

        posicionJugador = 20;

    }


    if (posicionJugador > limiteDerecho) {

        posicionJugador =
            limiteDerecho;

    }


    /* GRAVEDAD */

    velocidadVertical -=
        GRAVEDAD;

    posicionVertical +=
        velocidadVertical;


    if (posicionVertical <= PISO) {

        posicionVertical = PISO;

        velocidadVertical = 0;

        saltando = false;

        personaje.classList.remove(
            "saltando"
        );

    }


    personaje.style.left =
        posicionJugador + "px";

    personaje.style.bottom =
        posicionVertical + "px";


    const imagen =
        personaje.querySelector("img");


    imagen.style.transform =
        direccionJugador === -1
            ? "scaleX(-1)"
            : "scaleX(1)";

}


/* =========================================================
   ENEMIGO PRINCIPAL
========================================================= */

function actualizarEnemigo() {

    if (juegoTerminado) return;


    const distancia =
        posicionJugador -
        posicionEnemigo;


    if (Math.abs(distancia) > 25) {

        const velocidad =
            Math.min(
                VELOCIDAD_MAXIMA_ENEMIGO,
                VELOCIDAD_ENEMIGO +
                Math.abs(distancia) *
                0.001
            );


        if (distancia > 0) {

            posicionEnemigo +=
                velocidad;

        } else {

            posicionEnemigo -=
                velocidad;

        }

    }


    if (posicionEnemigo < 0) {

        posicionEnemigo = 0;

    }


    if (
        posicionEnemigo >
        ANCHO_MUNDO -
        ANCHO_ENEMIGO
    ) {

        posicionEnemigo =
            ANCHO_MUNDO -
            ANCHO_ENEMIGO;

    }


    enemigo.style.left =
        posicionEnemigo + "px";

    enemigo.style.bottom =
        PISO + "px";


    const imagen =
        enemigo.querySelector("img");


    imagen.style.transform =
        posicionJugador <
        posicionEnemigo
            ? "scaleX(-1)"
            : "scaleX(1)";

}


/* =========================================================
   COLISIONES
========================================================= */

function hayColision(a, b) {

    const margen = 25;


    return (

        a.left + margen < b.right &&

        a.right - margen > b.left &&

        a.top + margen < b.bottom &&

        a.bottom - margen > b.top

    );

}


/* =========================================================
   OBSTÁCULOS
   OPTIMIZADO:
   se posicionan una sola vez.
========================================================= */

function actualizarObstaculos() {

    obstaculos.forEach((obstaculo) => {

        obstaculo.elemento.style.left =
            obstaculo.posicion + "px";

        obstaculo.elemento.style.bottom =
            PISO + "px";

    });

}


/* =========================================================
   COLISIÓN CON OBSTÁCULOS
========================================================= */

function comprobarObstaculos() {

    if (
        juegoTerminado ||
        invulnerable
    ) return;


    obstaculos.forEach((obstaculo, indice) => {

        if (
            obstaculosGolpeados.has(indice)
        ) {

            return;

        }


        const distancia =
            Math.abs(
                posicionJugador -
                obstaculo.posicion
            );


        if (distancia < 90) {


            if (posicionVertical <= PISO + 80) {

                perderMediaVida(indice);

            }

        }

    });

}


/* =========================================================
   PERDER MEDIA VIDA
========================================================= */

function perderMediaVida(indiceObstaculo) {

    if (
        invulnerable ||
        juegoTerminado
    ) return;


    if (
        obstaculosGolpeados.has(indiceObstaculo)
    ) {

        return;

    }


    obstaculosGolpeados.add(
        indiceObstaculo
    );


    vidas -= 0.5;

    actualizarVidas();

    personaje.classList.add("daño");


    if (direccionJugador === 1) {

        posicionJugador -= 80;

    } else {

        posicionJugador += 80;

    }


    if (posicionJugador < 20) {

        posicionJugador = 20;

    }


    if (
        posicionJugador >
        ANCHO_MUNDO -
        ANCHO_PERSONAJE -
        30
    ) {

        posicionJugador =
            ANCHO_MUNDO -
            ANCHO_PERSONAJE -
            30;

    }


    invulnerable = true;


    setTimeout(() => {

        personaje.classList.remove(
            "daño"
        );

    }, 500);


    setTimeout(() => {

        invulnerable = false;

        obstaculosGolpeados.delete(
            indiceObstaculo
        );

    }, 1000);


    if (vidas <= 0) {

        vidas = 0;

        terminarJuego();

    }

}


/* =========================================================
   COLISIÓN ENEMIGO
========================================================= */

function comprobarEnemigo() {

    if (
        juegoTerminado ||
        invulnerable
    ) return;


    const diferencia =
        Math.abs(
            posicionJugador -
            posicionEnemigo
        );


    if (diferencia < 80) {


        if (
            Math.abs(
                posicionVertical - PISO
            ) < 100
        ) {

            perderVida();

        }

    }

}


/* =========================================================
   PERDER VIDA COMPLETA
========================================================= */

function perderVida() {

    if (invulnerable) return;


    vidas--;

    actualizarVidas();

    personaje.classList.add("daño");


    if (
        posicionEnemigo <
        posicionJugador
    ) {

        posicionEnemigo =
            Math.max(
                0,
                posicionJugador - 500
            );

    } else {

        posicionEnemigo =
            Math.min(
                ANCHO_MUNDO - 120,
                posicionJugador + 500
            );

    }


    invulnerable = true;


    setTimeout(() => {

        personaje.classList.remove(
            "daño"
        );

    }, 600);


    setTimeout(() => {

        invulnerable = false;

    }, 1500);


    if (vidas <= 0) {

        vidas = 0;

        terminarJuego();

    }

}


/* =========================================================
   ACTUALIZAR VIDAS
========================================================= */

function actualizarVidas() {

    const corazones = [

        document.getElementById("vida1"),

        document.getElementById("vida2"),

        document.getElementById("vida3")

    ];


    corazones.forEach((corazon, indice) => {

        const numeroVida = indice + 1;

        corazon.classList.remove(
            "vida-perdida"
        );


        if (vidas >= numeroVida) {

            corazon.textContent = "❤️";

        } else if (
            vidas === numeroVida - 0.5
        ) {

            corazon.textContent = "💔";

        } else {

            corazon.textContent = "🖤";

            corazon.classList.add(
                "vida-perdida"
            );

        }

    });

}


function actualizarCorazon(
    elemento,
    activo
) {

    if (activo) {

        elemento.textContent = "❤️";

        elemento.classList.remove(
            "vida-perdida"
        );

    } else {

        elemento.textContent = "🖤";

        elemento.classList.add(
            "vida-perdida"
        );

    }

}


/* =========================================================
   PERGAMINOS
   OPTIMIZADO:
   guardamos sus posiciones una sola vez.
========================================================= */

const posicionesPergaminos =
    Array.from(pergaminos).map(
        (pergamino) => pergamino.offsetLeft
    );


function comprobarPergaminos() {

    if (juegoTerminado) return;


    pergaminos.forEach(
        (pergamino, indice) => {

            if (
                pergamino.style.display ===
                "none"
            ) return;


            const distancia =
                Math.abs(
                    posicionJugador -
                    posicionesPergaminos[indice]
                );


            if (distancia < 80) {

                recogerPergamino(
                    pergamino
                );

            }

        }
    );

}


function recogerPergamino(
    pergamino
) {

    if (
        pergamino.style.display ===
        "none"
    ) return;


    pergamino.style.display =
        "none";


    pergaminosRecolectados++;


    contadorPergaminos.textContent =
        "📜 " +
        pergaminosRecolectados +
        "/3";


    textoTitulo.textContent =
        pergamino.dataset.titulo;


    textoDocumento.textContent =
        pergamino.dataset.texto;


    overlayPergamino.classList.add(
        "mostrar"
    );


    teclas.izquierda = false;

    teclas.derecha = false;

}


/* =========================================================
   CERRAR PERGAMINO
========================================================= */

document
    .getElementById(
        "cerrarPergamino"
    )
    .addEventListener(
        "click",
        cerrarPergamino
    );


function cerrarPergamino() {

    overlayPergamino.classList.remove(
        "mostrar"
    );

}


/* =========================================================
   FEDERALES EXTRA
========================================================= */

/* =========================================================
   FEDERALES EXTRA
========================================================= */

function crearFederal() {

    if (juegoTerminado) return;

    if (
        federalesExtra.length >=
        MAX_FEDERALES_EXTRA
    ) {
        return;
    }


    const nuevoFederal =
        document.createElement("div");


    nuevoFederal.className =
        "federal";


    nuevoFederal.innerHTML = `
        <img
            src="../img/federal.png"
            alt="Federal"
        >
    `;


    /*
     * El Federal aparece DETRÁS de Sarmiento.
     *
     * Si Sarmiento va a la derecha:
     * Federal aparece a la izquierda (-1)
     *
     * Si Sarmiento va a la izquierda:
     * Federal aparece a la derecha (+1)
     */

    const OFFSET_FEDERAL = 650;


    let posicionInicial;


    if (direccionJugador === 1) {

        posicionInicial =
            posicionJugador - OFFSET_FEDERAL;

    } else {

        posicionInicial =
            posicionJugador + OFFSET_FEDERAL;

    }


    posicionInicial =
        Math.max(
            50,
            Math.min(
                posicionInicial,
                ANCHO_MUNDO - ANCHO_ENEMIGO
            )
        );


    nuevoFederal.style.left =
        posicionInicial + "px";


    nuevoFederal.style.bottom =
        PISO + "px";


    const imagen =
        nuevoFederal.querySelector("img");


    /*
     * IMPORTANTE:
     *
     * El Federal mira HACIA Sarmiento.
     *
     * Si está a la izquierda de Sarmiento
     * mira hacia la derecha.
     *
     * Si está a la derecha
     * mira hacia la izquierda.
     */

    if (posicionInicial < posicionJugador) {

        imagen.style.transform =
            "scaleX(1)";

    } else {

        imagen.style.transform =
            "scaleX(-1)";

    }


    document
        .getElementById("enemigos")
        .appendChild(nuevoFederal);


    federalesExtra.push({

        elemento: nuevoFederal,

        posicion: posicionInicial,

        velocidad:
            VELOCIDAD_ENEMIGO,

        direccion:
            posicionInicial < posicionJugador
                ? 1
                : -1

    });

}


/* =========================================================
   ACTUALIZAR FEDERALES EXTRA
   PERSIGUEN A SARMIENTO
========================================================= */

function actualizarFederalesExtra() {

    if (juegoTerminado) return;


    federalesExtra.forEach(
        (federal) => {


            /*
             * El Federal siempre calcula
             * hacia dónde está Sarmiento.
             */

            const diferencia =
                posicionJugador -
                federal.posicion;


            /*
             * Si Sarmiento está a la derecha:
             * dirección = +1
             *
             * Si está a la izquierda:
             * dirección = -1
             */

            if (Math.abs(diferencia) > 25) {

                if (diferencia > 0) {

                    federal.posicion +=
                        federal.velocidad;

                    federal.direccion = 1;

                } else {

                    federal.posicion -=
                        federal.velocidad;

                    federal.direccion = -1;

                }

            }


            /*
             * Límites del mapa
             */

            if (federal.posicion < 0) {

                federal.posicion = 0;

            }


            if (
                federal.posicion >
                ANCHO_MUNDO -
                ANCHO_ENEMIGO
            ) {

                federal.posicion =
                    ANCHO_MUNDO -
                    ANCHO_ENEMIGO;

            }


            /*
             * Actualizar posición
             */

            federal.elemento.style.left =
                federal.posicion + "px";


            federal.elemento.style.bottom =
                PISO + "px";


            /*
             * El sprite SIEMPRE mira hacia Sarmiento.
             */

            const imagen =
                federal.elemento.querySelector("img");


            imagen.style.transform =
                posicionJugador <
                federal.posicion

                    ? "scaleX(-1)"

                    : "scaleX(1)";

        }
    );

}

/* =========================================================
   LIMPIAR FEDERALES EXTRA
   NUEVO:
   elimina los elementos del DOM al terminar.
========================================================= */

function limpiarFederales() {

    federalesExtra.forEach(
        (federal) => {

            if (federal.elemento) {

                federal.elemento.remove();

            }

        }
    );


    federalesExtra.length = 0;

}


/* =========================================================
   FINAL
========================================================= */

let barreraSuperada = false;


function comprobarFinal() {

    if (
        juegoTerminado ||
        barreraSuperada
    ) return;


    const final =
        document.getElementById("finalNivel");


    const posicionBarrera =
        final.offsetLeft;


    if (
        posicionJugador + ANCHO_PERSONAJE >= posicionBarrera
    ) {

        barreraSuperada = true;

        pasarBarrera();

    }

}

/* =========================================================
   INTERMISIÓN DESPUÉS DE PASAR LA BARRERA
========================================================= */

function pasarBarrera() {


    /*
     * DETENER COMPLETAMENTE EL JUEGO
     */

    juegoTerminado = true;


    teclas.izquierda = false;

    teclas.derecha = false;

    velocidadVertical = 0;

    saltando = false;


    /*
     * =====================================================
     * OPTIMIZACIÓN PRINCIPAL DEL LAG
     *
     * Detenemos el intervalo que crea federales.
     * =====================================================
     */

    if (intervaloFederales !== null) {

        clearInterval(
            intervaloFederales
        );

        intervaloFederales = null;

    }


    /*
     * =====================================================
     * Eliminamos todos los federales extra
     * del DOM.
     * =====================================================
     */

    limpiarFederales();


    /*
     * Mostrar pantalla de intermisión
     */

    intermisionNivel.classList.add(
        "mostrar"
    );


    /*
     * Después de unos segundos,
     * abrir el multiple choice.
     */

    setTimeout(() => {

        intermisionNivel.classList.remove(
            "mostrar"
        );


        setTimeout(() => {

            abrirQuiz();

        }, 500);

    }, 3000);

}


/* =========================================================
   ABRIR QUIZ
========================================================= */

function abrirQuiz() {

    juegoTerminado = true;


    teclas.izquierda = false;

    teclas.derecha = false;


    velocidadVertical = 0;

    saltando = false;


    preguntaActual = 0;

    respuestasCorrectas = 0;


    mostrarPregunta();


    overlayQuiz.classList.add(
        "mostrar"
    );

}


/* =========================================================
   MOSTRAR PREGUNTA
========================================================= */

function mostrarPregunta() {

    respuestaSeleccionada = false;


    const pregunta =
        preguntas[preguntaActual];


    document.getElementById(
        "quizProgreso"
    ).textContent =
        "PREGUNTA " +
        (preguntaActual + 1) +
        " DE " +
        preguntas.length;


    document.getElementById(
        "quizPregunta"
    ).textContent =
        pregunta.pregunta;


    const contenedor =
        document.getElementById(
            "quizOpciones"
        );


    const feedback =
        document.getElementById(
            "quizFeedback"
        );


    const boton =
        document.getElementById(
            "btnSiguiente"
        );


    contenedor.innerHTML = "";

    feedback.textContent = "";

    feedback.className =
        "quiz-feedback";


    boton.style.display =
        "none";


    pregunta.opciones.forEach(
        (opcion, indice) => {

            const botonOpcion =
                document.createElement(
                    "button"
                );


            botonOpcion.className =
                "opcion-quiz";


            botonOpcion.textContent =
                String.fromCharCode(
                    65 + indice
                ) +
                ") " +
                opcion;


            botonOpcion.addEventListener(
                "click",
                () => {

                    responderPregunta(
                        indice,
                        botonOpcion
                    );

                }
            );


            contenedor.appendChild(
                botonOpcion
            );

        }
    );

}


/* =========================================================
   RESPONDER
========================================================= */

function responderPregunta(
    indice,
    botonElegido
) {

    if (respuestaSeleccionada) return;


    respuestaSeleccionada = true;


    const pregunta =
        preguntas[preguntaActual];


    const botones =
        document.querySelectorAll(
            ".opcion-quiz"
        );


    botones.forEach(
        (boton, posicion) => {

            boton.disabled = true;


            if (
                posicion ===
                pregunta.correcta
            ) {

                boton.classList.add(
                    "correcta"
                );

            }

        }
    );


    const feedback =
        document.getElementById(
            "quizFeedback"
        );


    if (
        indice ===
        pregunta.correcta
    ) {

        respuestasCorrectas++;


        botonElegido.classList.add(
            "correcta"
        );


        feedback.textContent =
            "✓ ¡Respuesta correcta!";


        feedback.classList.add(
            "feedback-correcto"
        );

    } else {

        botonElegido.classList.add(
            "incorrecta"
        );


        feedback.textContent =
            "✕ Respuesta incorrecta.";


        feedback.classList.add(
            "feedback-incorrecto"
        );

    }


    const botonSiguiente =
        document.getElementById(
            "btnSiguiente"
        );


    botonSiguiente.style.display =
        "block";

}


/* =========================================================
   SIGUIENTE
========================================================= */

document
    .getElementById(
        "btnSiguiente"
    )
    .addEventListener(
        "click",
        siguientePregunta
    );


function siguientePregunta() {

    preguntaActual++;


    if (
        preguntaActual <
        preguntas.length
    ) {

        mostrarPregunta();

    } else {

        mostrarResultado();

    }

}


/* =========================================================
   RESULTADO
========================================================= */

function mostrarResultado() {

    overlayQuiz.classList.remove(
        "mostrar"
    );


    const icono =
        document.getElementById(
            "resultadoIcono"
        );


    const titulo =
        document.getElementById(
            "resultadoTitulo"
        );


    const texto =
        document.getElementById(
            "resultadoTexto"
        );


    const puntaje =
        document.getElementById(
            "resultadoPuntaje"
        );


    const boton =
        document.getElementById(
            "btnResultado"
        );


    puntaje.textContent =
        respuestasCorrectas +
        " / " +
        preguntas.length;


    if (
        respuestasCorrectas >= 2
    ) {

        icono.textContent =
            "🏆";


        titulo.textContent =
            "¡APROBASTE!";


        texto.textContent =
            "Sarmiento puede continuar su camino hacia Chile.";


        boton.textContent =
            "CONTINUAR";


        boton.onclick =
            finalizarVictoria;


    } else {

        icono.textContent =
            "📜";


        titulo.textContent =
            "CASI LO LOGRÁS";


        texto.textContent =
            "Necesitás al menos 2 respuestas correctas para superar el desafío.";


        boton.textContent =
            "VOLVER A INTENTAR";


        boton.onclick =
            reintentarQuiz;

    }


    overlayResultado.classList.add(
        "mostrar"
    );

}


/* =========================================================
   REINTENTAR QUIZ
========================================================= */

function reintentarQuiz() {

    overlayResultado.classList.remove(
        "mostrar"
    );


    preguntaActual = 0;

    respuestasCorrectas = 0;


    mostrarPregunta();


    overlayQuiz.classList.add(
        "mostrar"
    );

}


/* =========================================================
   VICTORIA
========================================================= */

function finalizarVictoria() {

    overlayResultado.classList.remove(
        "mostrar"
    );


    pantallaVictoria.classList.add(
        "mostrar"
    );

}


/* =========================================================
   GAME OVER
========================================================= */

function terminarJuego() {

    juegoTerminado = true;


    teclas.izquierda = false;

    teclas.derecha = false;


    /*
     * También detenemos el generador
     * de federales en Game Over.
     */

    if (intervaloFederales !== null) {

        clearInterval(
            intervaloFederales
        );

        intervaloFederales = null;

    }


    /*
     * Eliminamos federales extra.
     */

    limpiarFederales();


    setTimeout(
        () => {

            pantallaGameOver.classList.add(
                "mostrar"
            );

        },
        400
    );

}


/* =========================================================
   CÁMARA
   OPTIMIZADA
========================================================= */

function actualizarCamara() {

    if (juegoTerminado) return;


    const anchoPantalla =
        escenario.clientWidth;


    let camaraX =
        posicionJugador -
        anchoPantalla * 0.42;


    const maxCamara =
        ANCHO_MUNDO -
        anchoPantalla;


    if (camaraX < 0) {

        camaraX = 0;

    }


    if (camaraX > maxCamara) {

        camaraX = maxCamara;

    }


    /*
     * OPTIMIZACIÓN:
     * si la cámara no cambió, no volvemos
     * a escribir el transform.
     */

    if (camaraX === ultimaCamaraX) {

        return;

    }


    ultimaCamaraX = camaraX;


    mundo.style.transform =
        "translate3d(-" +
        camaraX +
        "px, 0, 0)";

}


/* =========================================================
   GAME LOOP
========================================================= */

let animacionJuego;


function gameLoop() {

    if (juegoTerminado) {

        animacionJuego = null;

        return;

    }


    actualizarJugador();


    actualizarEnemigo();


    actualizarFederalesExtra();


    comprobarEnemigo();


    comprobarObstaculos();


    comprobarPergaminos();


    comprobarFinal();


    actualizarCamara();


    animacionJuego =
        requestAnimationFrame(
            gameLoop
        );

}


/* =========================================================
   REINICIAR
========================================================= */

function reiniciarNivel() {

    location.reload();

}


/* =========================================================
   INICIO
========================================================= */

personaje.style.left =
    posicionJugador + "px";


personaje.style.bottom =
    PISO + "px";


enemigo.style.left =
    posicionEnemigo + "px";


enemigo.style.bottom =
    PISO + "px";


/*
 * Los obstáculos no cambian de posición.
 * Se posicionan UNA SOLA VEZ.
 */

actualizarObstaculos();


/*
 * Iniciar juego.
 */

gameLoop();


/* =========================================================
   GENERACIÓN DE FEDERALES
========================================================= */

/*
 * Guardamos el intervalo para poder destruirlo
 * cuando se llegue a la barrera o Game Over.
 */

intervaloFederales = setInterval(
    () => {

        if (!juegoTerminado) {

            crearFederal();

        }

    },
    INTERVALO_FEDERAL
);

