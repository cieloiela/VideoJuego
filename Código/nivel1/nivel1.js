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

const contadorPuntos =
    document.getElementById("contadorPuntos");

const contadorTiempo =
    document.getElementById("contadorTiempo");


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


/*
 * Distancia mínima que tendrá el Federal
 * durante el comienzo del nivel.
 */
const DISTANCIA_SEGURA_INICIAL = 350;


/*
 * Hasta esta posición el Federal no
 * perseguirá activamente a Sarmiento.
 */
const FIN_ZONA_SEGURA = 550;


/*
 * Posición inicial del Federal.
 *
 * Antes estaba en 850 y podía terminar
 * junto al primer pergamino.
 */
const POSICION_INICIAL_ENEMIGO = 1350;


/* =========================================================
   PUNTOS
========================================================= */

const PUNTOS_OBSTACULO = 100;

const PUNTOS_FEDERAL = 200;


/* =========================================================
   ESTADO
========================================================= */

let posicionJugador = 220;

let posicionEnemigo =
    POSICION_INICIAL_ENEMIGO;

let posicionVertical = PISO;

let velocidadVertical = 0;

let saltando = false;

let vidas = 3;

let pergaminosRecolectados = 0;

let juegoTerminado = false;


/*
 * NUEVO:
 * Permite pausar el juego sin finalizarlo.
 *
 * juegoTerminado = Game Over / Victoria
 * juegoPausado = Pergamino abierto
 */
let juegoPausado = false;


/* =========================================================
   PUNTAJE Y TIEMPO
========================================================= */

let puntos = 0;

let tiempoInicio = 0;

let tiempoFinal = 0;

let intervaloTiempo = null;


/* =========================================================
   ESTADO DEL JUGADOR
========================================================= */

let invulnerable = false;

let direccionJugador = 1;

let federalesExtra = [];


/* =========================================================
   OPTIMIZACIÓN
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


let obstaculosSuperados =
    new Set();


let federalesSuperados =
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
   PUNTAJE
========================================================= */

function actualizarPuntos() {

    contadorPuntos.textContent =
        String(puntos).padStart(5, "0");

}


function sumarPuntos(cantidad) {

    puntos += cantidad;

    actualizarPuntos();

}


/* =========================================================
   TIEMPO
========================================================= */

function actualizarTiempo() {

    if (juegoTerminado) return;

    /*
     * Mientras el pergamino está abierto,
     * el tiempo también queda pausado.
     */
    if (juegoPausado) return;

    const ahora = Date.now();

    const segundosTotales =
        Math.floor(
            (ahora - tiempoInicio) / 1000
        );

    const minutos =
        Math.floor(
            segundosTotales / 60
        );

    const segundos =
        segundosTotales % 60;

    contadorTiempo.textContent =
        String(minutos).padStart(2, "0") +
        ":" +
        String(segundos).padStart(2, "0");

}


function iniciarContadorTiempo() {

    tiempoInicio = Date.now();

    tiempoFinal = 0;

    actualizarTiempo();

    if (intervaloTiempo !== null) {

        clearInterval(
            intervaloTiempo
        );

    }

    intervaloTiempo =
        setInterval(
            actualizarTiempo,
            1000
        );

}


function detenerContadorTiempo() {

    if (intervaloTiempo !== null) {

        clearInterval(
            intervaloTiempo
        );

        intervaloTiempo = null;

    }

}


/* =========================================================
   TECLADO
========================================================= */

document.addEventListener(
    "keydown",
    (evento) => {

        /*
         * Si estamos leyendo un pergamino,
         * no se permite controlar al personaje.
         */
        if (
            juegoTerminado ||
            juegoPausado
        ) {

            evento.preventDefault();

            return;

        }


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

    if (!boton) return;


    boton.addEventListener(
        "pointerdown",
        (evento) => {

            evento.preventDefault();

            if (
                juegoTerminado ||
                juegoPausado
            ) return;

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


const botonSaltar =
    document.getElementById("btnSaltar");


if (botonSaltar) {

    botonSaltar.addEventListener(
        "pointerdown",
        (evento) => {

            evento.preventDefault();

            if (
                juegoTerminado ||
                juegoPausado
            ) return;

            saltar();

        }
    );

}


/* =========================================================
   SALTO
========================================================= */

function saltar() {

    if (
        !saltando &&
        !juegoTerminado &&
        !juegoPausado
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

    if (
        juegoTerminado ||
        juegoPausado
    ) return;


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


    if (imagen) {

        imagen.style.transform =
            direccionJugador === -1
                ? "scaleX(-1)"
                : "scaleX(1)";

    }

}


/* =========================================================
   ENEMIGO PRINCIPAL
========================================================= */

function actualizarEnemigo() {

    if (
        juegoTerminado ||
        juegoPausado
    ) return;


    /*
     * PROTECCIÓN INICIAL
     *
     * Mientras Sarmiento está en los primeros
     * 550px del mapa, el Federal no lo persigue.
     *
     * Así no se junta inmediatamente con
     * el primer pergamino.
     */
    if (
        posicionJugador <
        FIN_ZONA_SEGURA
    ) {

        /*
         * Mantener siempre una distancia
         * segura respecto de Sarmiento.
         */
        if (
            posicionEnemigo -
            posicionJugador <
            DISTANCIA_SEGURA_INICIAL
        ) {

            posicionEnemigo =
                posicionJugador +
                DISTANCIA_SEGURA_INICIAL;

        }

    } else {

        const distancia =
            posicionJugador -
            posicionEnemigo;


        if (
            Math.abs(distancia) >
            25
        ) {

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


    if (imagen) {

        imagen.style.transform =
            posicionJugador <
            posicionEnemigo
                ? "scaleX(-1)"
                : "scaleX(1)";

    }

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
========================================================= */

function actualizarObstaculos() {

    obstaculos.forEach(
        (obstaculo) => {

            if (!obstaculo.elemento) return;

            obstaculo.elemento.style.left =
                obstaculo.posicion + "px";

            obstaculo.elemento.style.bottom =
                PISO + "px";

        }
    );

}


/* =========================================================
   COLISIÓN CON OBSTÁCULOS
========================================================= */

function comprobarObstaculos() {

    if (
        juegoTerminado ||
        juegoPausado ||
        invulnerable
    ) return;


    obstaculos.forEach(
        (obstaculo, indice) => {

            if (
                obstaculosGolpeados.has(
                    indice
                )
            ) {

                return;

            }


            const distancia =
                Math.abs(
                    posicionJugador -
                    obstaculo.posicion
                );


            if (distancia < 90) {

                if (
                    posicionVertical <=
                    PISO + 80
                ) {

                    perderMediaVida(
                        indice
                    );

                }

            }

        }
    );

}


/* =========================================================
   PUNTOS POR SALTAR OBSTÁCULOS
========================================================= */

function comprobarObstaculosSuperados() {

    if (
        juegoTerminado ||
        juegoPausado
    ) return;


    obstaculos.forEach(
        (obstaculo, indice) => {

            if (
                obstaculosSuperados.has(
                    indice
                )
            ) {

                return;

            }


            const pasoObstaculo =
                posicionJugador >
                obstaculo.posicion + 70;


            const estaEnElAire =
                posicionVertical >
                PISO + 25;


            if (
                pasoObstaculo &&
                estaEnElAire
            ) {

                obstaculosSuperados.add(
                    indice
                );

                sumarPuntos(
                    PUNTOS_OBSTACULO
                );

            }

        }
    );

}


/* =========================================================
   PERDER MEDIA VIDA
========================================================= */

function perderMediaVida(
    indiceObstaculo
) {

    if (
        invulnerable ||
        juegoTerminado ||
        juegoPausado
    ) return;


    if (
        obstaculosGolpeados.has(
            indiceObstaculo
        )
    ) {

        return;

    }


    obstaculosGolpeados.add(
        indiceObstaculo
    );


    vidas -= 0.5;

    actualizarVidas();

    personaje.classList.add(
        "daño"
    );


    if (direccionJugador === 1) {

        posicionJugador -= 80;

    } else {

        posicionJugador += 80;

    }


    if (posicionJugador < 20) {

        posicionJugador = 20;

    }


    const limiteDerecho =
        ANCHO_MUNDO -
        ANCHO_PERSONAJE -
        30;


    if (
        posicionJugador >
        limiteDerecho
    ) {

        posicionJugador =
            limiteDerecho;

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
   COLISIÓN ENEMIGO PRINCIPAL
========================================================= */

function comprobarEnemigo() {

    if (
        juegoTerminado ||
        juegoPausado ||
        invulnerable
    ) return;


    /*
     * Protección adicional en el comienzo.
     */
    if (
        posicionJugador <
        FIN_ZONA_SEGURA
    ) {

        return;

    }


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
   PUNTOS POR SALTAR FEDERAL PRINCIPAL
========================================================= */

function comprobarFederalPrincipalSuperado() {

    if (
        juegoTerminado ||
        juegoPausado
    ) return;


    const estaEnElAire =
        posicionVertical >
        PISO + 25;


    const pasoFederal =
        posicionJugador >
        posicionEnemigo + 80;


    if (
        estaEnElAire &&
        pasoFederal &&
        !federalesSuperados.has(
            "principal"
        )
    ) {

        federalesSuperados.add(
            "principal"
        );

        sumarPuntos(
            PUNTOS_FEDERAL
        );

    }

}


/* =========================================================
   PERDER VIDA COMPLETA
========================================================= */

function perderVida() {

    if (
        invulnerable ||
        juegoTerminado ||
        juegoPausado
    ) return;


    vidas--;

    actualizarVidas();

    personaje.classList.add(
        "daño"
    );


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


    corazones.forEach(
        (corazon, indice) => {

            if (!corazon) return;

            const numeroVida =
                indice + 1;


            corazon.classList.remove(
                "vida-perdida"
            );


            if (
                vidas >= numeroVida
            ) {

                corazon.textContent =
                    "❤️";

            } else if (
                vidas ===
                numeroVida - 0.5
            ) {

                corazon.textContent =
                    "💔";

            } else {

                corazon.textContent =
                    "🖤";

                corazon.classList.add(
                    "vida-perdida"
                );

            }

        }
    );

}


function actualizarCorazon(
    elemento,
    activo
) {

    if (!elemento) return;


    if (activo) {

        elemento.textContent =
            "❤️";

        elemento.classList.remove(
            "vida-perdida"
        );

    } else {

        elemento.textContent =
            "🖤";

        elemento.classList.add(
            "vida-perdida"
        );

    }

}


/* =========================================================
   PERGAMINOS
========================================================= */

const posicionesPergaminos =
    Array.from(pergaminos).map(
        (pergamino) =>
            pergamino.offsetLeft
    );


function comprobarPergaminos() {

    if (
        juegoTerminado ||
        juegoPausado
    ) return;


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


/* =========================================================
   RECOGER PERGAMINO
========================================================= */

function recogerPergamino(
    pergamino
) {

    if (
        pergamino.style.display ===
        "none"
    ) return;


    /*
     * Ocultar inmediatamente el documento.
     */
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


    /*
     * ======================================
     * PAUSAR COMPLETAMENTE EL JUEGO
     * ======================================
     */

    juegoPausado = true;


    /*
     * Soltar todas las teclas.
     */
    teclas.izquierda = false;

    teclas.derecha = false;


    /*
     * Detener el movimiento vertical.
     */
    velocidadVertical = 0;

    saltando = false;


    personaje.classList.remove(
        "saltando"
    );


    /*
     * Mostrar documento.
     */
    overlayPergamino.classList.add(
        "mostrar"
    );

}


/* =========================================================
   CERRAR PERGAMINO
========================================================= */

const botonCerrarPergamino =
    document.getElementById(
        "cerrarPergamino"
    );


if (botonCerrarPergamino) {

    botonCerrarPergamino.addEventListener(
        "click",
        cerrarPergamino
    );

}


function cerrarPergamino() {

    overlayPergamino.classList.remove(
        "mostrar"
    );


    /*
     * Reanudar el juego.
     */
    juegoPausado = false;


    /*
     * Actualizar inmediatamente
     * la posición de la cámara.
     */
    actualizarCamara();

}


/* =========================================================
   FEDERALES EXTRA
========================================================= */

function crearFederal() {

    if (
        juegoTerminado ||
        juegoPausado
    ) return;


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


    const OFFSET_FEDERAL = 650;


    let posicionInicial;


    if (direccionJugador === 1) {

        posicionInicial =
            posicionJugador -
            OFFSET_FEDERAL;

    } else {

        posicionInicial =
            posicionJugador +
            OFFSET_FEDERAL;

    }


    posicionInicial =
        Math.max(
            50,
            Math.min(
                posicionInicial,
                ANCHO_MUNDO -
                ANCHO_ENEMIGO
            )
        );


    /*
     * Evitar que un Federal extra
     * aparezca demasiado cerca.
     */
    if (
        Math.abs(
            posicionInicial -
            posicionJugador
        ) < 300
    ) {

        if (
            posicionJugador <
            ANCHO_MUNDO / 2
        ) {

            posicionInicial =
                posicionJugador + 400;

        } else {

            posicionInicial =
                posicionJugador - 400;

        }

    }


    posicionInicial =
        Math.max(
            50,
            Math.min(
                posicionInicial,
                ANCHO_MUNDO -
                ANCHO_ENEMIGO
            )
        );


    nuevoFederal.style.left =
        posicionInicial + "px";


    nuevoFederal.style.bottom =
        PISO + "px";


    const imagen =
        nuevoFederal.querySelector(
            "img"
        );


    if (imagen) {

        if (
            posicionInicial <
            posicionJugador
        ) {

            imagen.style.transform =
                "scaleX(1)";

        } else {

            imagen.style.transform =
                "scaleX(-1)";

        }

    }


    const contenedor =
        document.getElementById(
            "enemigos"
        );


    if (contenedor) {

        contenedor.appendChild(
            nuevoFederal
        );

    }


    federalesExtra.push({

        elemento:
            nuevoFederal,

        posicion:
            posicionInicial,

        velocidad:
            VELOCIDAD_ENEMIGO,

        direccion:
            posicionInicial <
            posicionJugador
                ? 1
                : -1,

        superado:
            false

    });

}


/* =========================================================
   ACTUALIZAR FEDERALES EXTRA
========================================================= */

function actualizarFederalesExtra() {

    if (
        juegoTerminado ||
        juegoPausado
    ) return;


    federalesExtra.forEach(
        (federal) => {

            const diferencia =
                posicionJugador -
                federal.posicion;


            if (
                Math.abs(diferencia) >
                25
            ) {

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


            federal.elemento.style.left =
                federal.posicion + "px";


            federal.elemento.style.bottom =
                PISO + "px";


            const imagen =
                federal.elemento.querySelector(
                    "img"
                );


            if (imagen) {

                imagen.style.transform =
                    posicionJugador <
                    federal.posicion

                        ? "scaleX(-1)"

                        : "scaleX(1)";

            }

        }
    );

}


/* =========================================================
   PUNTOS POR SALTAR FEDERALES EXTRA
========================================================= */

function comprobarFederalesExtraSuperados() {

    if (
        juegoTerminado ||
        juegoPausado
    ) return;


    const estaEnElAire =
        posicionVertical >
        PISO + 25;


    federalesExtra.forEach(
        (federal, indice) => {

            if (
                federal.superado
            ) {

                return;

            }


            const pasoFederal =
                posicionJugador >
                federal.posicion + 80;


            if (
                estaEnElAire &&
                pasoFederal
            ) {

                federal.superado =
                    true;


                federalesSuperados.add(
                    indice
                );


                sumarPuntos(
                    PUNTOS_FEDERAL
                );

            }

        }
    );

}


/* =========================================================
   LIMPIAR FEDERALES EXTRA
========================================================= */

function limpiarFederales() {

    federalesExtra.forEach(
        (federal) => {

            if (
                federal.elemento
            ) {

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
        juegoPausado ||
        barreraSuperada
    ) return;


    const final =
        document.getElementById(
            "finalNivel"
        );


    if (!final) return;


    const posicionBarrera =
        final.offsetLeft;


    if (
        posicionJugador +
        ANCHO_PERSONAJE >=
        posicionBarrera
    ) {

        barreraSuperada = true;

        pasarBarrera();

    }

}


/* =========================================================
   INTERMISIÓN
========================================================= */

function pasarBarrera() {

    detenerContadorTiempo();


    tiempoFinal =
        Math.floor(
            (
                Date.now() -
                tiempoInicio
            ) / 1000
        );


    juegoTerminado = true;

    juegoPausado = false;


    teclas.izquierda = false;

    teclas.derecha = false;

    velocidadVertical = 0;

    saltando = false;


    if (
        intervaloFederales !==
        null
    ) {

        clearInterval(
            intervaloFederales
        );

        intervaloFederales =
            null;

    }


    limpiarFederales();


    intermisionNivel.classList.add(
        "mostrar"
    );


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

    juegoPausado = false;


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

    respuestaSeleccionada =
        false;


    const pregunta =
        preguntas[
            preguntaActual
        ];


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

    if (
        respuestaSeleccionada
    ) return;


    respuestaSeleccionada =
        true;


    const pregunta =
        preguntas[
            preguntaActual
        ];


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

const botonSiguiente =
    document.getElementById(
        "btnSiguiente"
    );


if (botonSiguiente) {

    botonSiguiente.addEventListener(
        "click",
        siguientePregunta
    );

}


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

    detenerContadorTiempo();


    tiempoFinal =
        Math.floor(
            (
                Date.now() -
                tiempoInicio
            ) / 1000
        );


    juegoTerminado = true;

    juegoPausado = false;


    teclas.izquierda = false;

    teclas.derecha = false;


    if (
        intervaloFederales !==
        null
    ) {

        clearInterval(
            intervaloFederales
        );

        intervaloFederales =
            null;

    }


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


    if (
        camaraX ===
        ultimaCamaraX
    ) {

        return;

    }


    ultimaCamaraX =
        camaraX;


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


    /*
     * IMPORTANTE:
     *
     * El loop sigue existiendo,
     * pero mientras juegoPausado sea true
     * NO actualiza personaje, enemigos
     * ni colisiones.
     */
    if (!juegoPausado) {

        actualizarJugador();

        actualizarEnemigo();

        actualizarFederalesExtra();

        comprobarEnemigo();

        comprobarObstaculos();

        comprobarObstaculosSuperados();

        comprobarFederalPrincipalSuperado();

        comprobarFederalesExtraSuperados();

        comprobarPergaminos();

        comprobarFinal();

        actualizarCamara();

    }


    animacionJuego =
        requestAnimationFrame(
            gameLoop
        );

}


/* =========================================================
   REINICIAR
========================================================= */

function reiniciarNivel() {

    detenerContadorTiempo();

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
 * Inicializar HUD
 */

puntos = 0;

actualizarPuntos();


contadorTiempo.textContent =
    "00:00";


/*
 * Inicializar vidas
 */

actualizarVidas();


/*
 * Posicionar obstáculos
 */

actualizarObstaculos();


/*
 * Iniciar contador
 */

iniciarContadorTiempo();


/*
 * Iniciar juego
 */

gameLoop();


/* =========================================================
   GENERACIÓN DE FEDERALES
========================================================= */

intervaloFederales =
    setInterval(
        () => {

            if (
                !juegoTerminado &&
                !juegoPausado
            ) {

                crearFederal();

            }

        },
        INTERVALO_FEDERAL
    );
