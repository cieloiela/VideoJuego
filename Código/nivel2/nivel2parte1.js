
/* =========================================================
   ESCAPE DE BUENOS AIRES
   NIVEL 2 - PARTE 1
   LA LLANURA PAMPEANA
========================================================= */


/* =========================================================
   ELEMENTOS
========================================================= */

const personaje =
    document.getElementById("sarmiento");

const enemigo =
    document.getElementById("enemigo");

const enemigosContenedor =
    document.getElementById("enemigos");

const mundo =
    document.getElementById("mundo");

const escenario =
    document.querySelector(".escenario");

const negocio =
    document.getElementById("negocio");

const barraHidratacion =
    document.getElementById("barraHidratacion");

const contadorHidratacion =
    document.getElementById("contadorHidratacion");

const mensajeAgua =
    document.getElementById("mensajeAgua");

const contadorPuntos =
    document.getElementById("contadorPuntos");

const contadorTiempo =
    document.getElementById("contadorTiempo");

const pantallaGameOver =
    document.getElementById("pantallaGameOver");

const transicionPulperia =
    document.getElementById("transicionPulperia");


/* =========================================================
   CONFIGURACIÓN DEL NIVEL
========================================================= */

const ANCHO_MUNDO = 8000;

const PISO = 90;


/* =========================================================
   JUGADOR
========================================================= */

const ANCHO_JUGADOR = 120;

const VELOCIDAD_JUGADOR = 6;

const FUERZA_SALTO = 19;

const GRAVEDAD = 0.55;


/* =========================================================
   FEDERALES
========================================================= */

const ANCHO_ENEMIGO = 120;

/*
   Ahora son más rápidos.
*/

const VELOCIDAD_ENEMIGO = 2.4;

const VELOCIDAD_ENEMIGO_MAX = 3.2;


/*
   Solo aparece un Federal nuevo
   cada 10 segundos.
*/

const INTERVALO_FEDERAL = 10000;


/*
   IMPORTANTE:

   1 Federal inicial
   +
   4 Federales extra
   =
   MÁXIMO 5 EN TODO EL NIVEL.
*/

const MAX_FEDERALES_EXTRA = 4;


/* =========================================================
   HIDRATACIÓN
========================================================= */

let hidratacion = 100;


/*
   Más rápida que antes.

   Cada segundo pierde 1.1%.
*/

const PERDIDA_HIDRATACION_POR_SEGUNDO = 1.1;


/*
   Cada botella recupera 30%.
*/

const RECUPERACION_AGUA = 30;


/* =========================================================
   PUNTOS
========================================================= */

const PUNTOS_OBSTACULO = 100;

const PUNTOS_FEDERAL = 200;

const PUNTOS_AGUA = 50;


/* =========================================================
   ESTADO DEL JUEGO
========================================================= */

let vidas = 3;

let puntos = 0;

let juegoActivo = true;

let nivelCompletado = false;


/* =========================================================
   POSICIÓN DEL JUGADOR
========================================================= */

let jugadorX = 220;

let jugadorY = PISO;

let velocidadY = 0;

let enSuelo = true;


/* =========================================================
   MOVIMIENTO
========================================================= */

let moverIzquierda = false;

let moverDerecha = false;


/* =========================================================
   CÁMARA
========================================================= */

let camaraX = 0;


/* =========================================================
   TIEMPO
========================================================= */

let tiempoInicio = Date.now();


/* =========================================================
   FEDERALES
========================================================= */

let federales = [];


/* =========================================================
   OBSTÁCULOS
========================================================= */

const obstaculos = [

    document.getElementById("obstaculo1"),

    document.getElementById("obstaculo2"),

    document.getElementById("obstaculo3"),

    document.getElementById("obstaculo4"),

    document.getElementById("obstaculo5"),

    document.getElementById("obstaculo6"),

    document.getElementById("obstaculo7"),

    document.getElementById("obstaculo8")

];


/* =========================================================
   AGUA
========================================================= */

const aguas = [

    document.getElementById("agua1"),

    document.getElementById("agua2"),

    document.getElementById("agua3")

];


/* =========================================================
   POSICIONES
========================================================= */

const posicionesAgua = [

    1350,

    4100,

    6600

];


const posicionesObstaculos = [

    850,

    1750,

    2500,

    3200,

    4750,

    5450,

    6100,

    7100

];


/* =========================================================
   UTILIDADES
========================================================= */

function limitar(valor, minimo, maximo) {

    return Math.max(
        minimo,
        Math.min(valor, maximo)
    );

}


/* =========================================================
   POSICIONES INICIALES
========================================================= */

function inicializarObjetos() {

    personaje.style.left =
        jugadorX + "px";

    personaje.style.bottom =
        PISO + "px";


    aguas.forEach(
        (agua, indice) => {

            agua.style.left =
                posicionesAgua[indice] + "px";

            agua.style.bottom =
                "68px";

        }
    );


    obstaculos.forEach(
        (obstaculo, indice) => {

            obstaculo.style.left =
                posicionesObstaculos[indice] + "px";

            obstaculo.style.bottom =
                "65px";

        }
    );


    enemigo.style.left =
        "1150px";

    enemigo.style.bottom =
        PISO + "px";

}


/* =========================================================
   MOVIMIENTO DEL JUGADOR
========================================================= */

function actualizarJugador() {

    if (!juegoActivo) {
        return;
    }


    if (moverIzquierda) {

        jugadorX -=
            VELOCIDAD_JUGADOR;

    }


    if (moverDerecha) {

        jugadorX +=
            VELOCIDAD_JUGADOR;

    }


    jugadorX =
        limitar(
            jugadorX,
            0,
            ANCHO_MUNDO - ANCHO_JUGADOR
        );


    /*
       GRAVEDAD
    */

    velocidadY -=
        GRAVEDAD;


    jugadorY +=
        velocidadY;


    /*
       Piso
    */

    if (jugadorY <= PISO) {

        jugadorY = PISO;

        velocidadY = 0;

        enSuelo = true;

    }


    personaje.style.left =
        jugadorX + "px";

    personaje.style.bottom =
        jugadorY + "px";

}


/* =========================================================
   SALTO
========================================================= */

function saltar() {

    if (!juegoActivo) {
        return;
    }


    if (!enSuelo) {
        return;
    }


    velocidadY =
        FUERZA_SALTO;

    enSuelo = false;

}


/* =========================================================
   COLISIÓN
========================================================= */

function hayColision(elemento, ancho = 120) {

    const x =
        parseFloat(
            elemento.style.left || 0
        );


    const y =
        parseFloat(
            elemento.style.bottom || PISO
        );


    const anchoElemento =
        elemento.offsetWidth || ancho;


    const alturaElemento =
        elemento.offsetHeight || 120;


    const jugadorIzquierda =
        jugadorX + 25;

    const jugadorDerecha =
        jugadorX + ANCHO_JUGADOR - 25;


    const jugadorAbajo =
        jugadorY;

    const jugadorArriba =
        jugadorY + 140;


    const objetoIzquierda =
        x + 15;

    const objetoDerecha =
        x + anchoElemento - 15;


    const objetoAbajo =
        y;

    const objetoArriba =
        y + alturaElemento - 20;


    return (

        jugadorDerecha >
        objetoIzquierda &&

        jugadorIzquierda <
        objetoDerecha &&

        jugadorArriba >
        objetoAbajo &&

        jugadorAbajo <
        objetoArriba

    );

}


/* =========================================================
   DAÑO
========================================================= */

let invulnerable = false;


function recibirDanio(cantidad = 1) {

    if (!juegoActivo) {
        return;
    }


    if (invulnerable) {
        return;
    }


    vidas -= cantidad;


    actualizarVidas();


    invulnerable = true;


    personaje.style.filter =
        "brightness(2)";


    setTimeout(
        () => {

            personaje.style.filter =
                "";

            invulnerable = false;

        },
        1000
    );


    if (vidas <= 0) {

        gameOver();

    }

}


/* =========================================================
   VIDAS
========================================================= */

function actualizarVidas() {

    const corazones = [

        document.getElementById("vida1"),

        document.getElementById("vida2"),

        document.getElementById("vida3")

    ];


    corazones.forEach(
        (corazon, indice) => {

            if (indice >= vidas) {

                corazon.classList.add(
                    "perdido"
                );

            } else {

                corazon.classList.remove(
                    "perdido"
                );

            }

        }
    );

}


/* =========================================================
   OBSTÁCULOS
========================================================= */

function comprobarObstaculos() {

    obstaculos.forEach(
        (obstaculo) => {

            if (
                obstaculo.dataset.golpeado === "true"
            ) {
                return;
            }


            if (
                hayColision(
                    obstaculo,
                    175
                )
            ) {

                obstaculo.dataset.golpeado =
                    "true";


                /*
                   Los obstáculos quitan
                   media vida visualmente.

                   Se cuenta como 1 daño,
                   manteniendo las 3 vidas.
                */

                recibirDanio(1);


                puntos +=
                    PUNTOS_OBSTACULO;


                actualizarPuntos();


                setTimeout(
                    () => {

                        obstaculo.dataset.golpeado =
                            "false";

                    },
                    1300
                );

            }

        }
    );

}


/* =========================================================
   AGUA
========================================================= */

function comprobarAgua() {

    aguas.forEach(
        (agua) => {

            if (
                agua.dataset.recolectada === "true"
            ) {
                return;
            }


            if (
                hayColision(
                    agua,
                    125
                )
            ) {

                agua.dataset.recolectada =
                    "true";


                hidratacion =
                    limitar(
                        hidratacion +
                        RECUPERACION_AGUA,
                        0,
                        100
                    );


                puntos +=
                    PUNTOS_AGUA;


                actualizarPuntos();

                actualizarHidratacion();


                mostrarMensajeAgua();


                agua.style.display =
                    "none";


                /*
                   No vuelve durante
                   esta partida.
                */

            }

        }
    );

}


/* =========================================================
   MENSAJE AGUA
========================================================= */

let timeoutMensajeAgua;


function mostrarMensajeAgua() {

    clearTimeout(
        timeoutMensajeAgua
    );


    mensajeAgua.classList.add(
        "visible"
    );


    timeoutMensajeAgua =
        setTimeout(
            () => {

                mensajeAgua.classList.remove(
                    "visible"
                );

            },
            1500
        );

}


/* =========================================================
   HIDRATACIÓN
========================================================= */

let ultimoTiempoHidratacion =
    Date.now();


function actualizarHidratacion() {

    hidratacion =
        limitar(
            hidratacion,
            0,
            100
        );


    barraHidratacion.style.width =
        hidratacion + "%";


    contadorHidratacion.textContent =
        Math.ceil(hidratacion) + "%";


    const contenedor =
        barraHidratacion.parentElement;


    contenedor.classList.remove(
        "hidratacion-baja",
        "hidratacion-critica"
    );


    if (hidratacion <= 25) {

        contenedor.classList.add(
            "hidratacion-critica"
        );

    } else if (hidratacion <= 50) {

        contenedor.classList.add(
            "hidratacion-baja"
        );

    }

}


function actualizarPerdidaHidratacion() {

    const ahora =
        Date.now();


    const diferencia =
        ahora -
        ultimoTiempoHidratacion;


    if (diferencia >= 1000) {

        const segundos =
            diferencia / 1000;


        hidratacion -=
            PERDIDA_HIDRATACION_POR_SEGUNDO *
            segundos;


        ultimoTiempoHidratacion =
            ahora;


        actualizarHidratacion();


        if (hidratacion <= 0) {

            hidratacion = 100;

            recibirDanio(1);

            actualizarHidratacion();

        }

    }

}


/* =========================================================
   FEDERAL INICIAL
========================================================= */

function crearFederalInicial() {

    const federal = {

        elemento: enemigo,

        x: 1150,

        velocidad:
            VELOCIDAD_ENEMIGO

    };


    federal.elemento.style.left =
        federal.x + "px";


    federal.elemento.style.bottom =
        PISO + "px";


    federales.push(
        federal
    );

}


/* =========================================================
   CREAR FEDERALES EXTRA
========================================================= */

function crearFederalExtra() {

    /*
       Nunca superar los 5 totales.
    */

    if (
        federales.length >= 5
    ) {
        return;
    }


    /*
       Aparece bastante lejos
       del jugador.
    */

    const distanciaMinima =
        900;


    let x =
        jugadorX +
        distanciaMinima +
        Math.random() * 800;


    /*
       Si queda fuera del mapa,
       se coloca en una zona válida.
    */

    if (
        x >
        ANCHO_MUNDO - 300
    ) {

        x =
            ANCHO_MUNDO - 500;

    }


    const div =
        document.createElement("div");


    div.className =
        "enemigo";


    const img =
        document.createElement("img");


    img.src =
        "../img/federal.png";


    img.alt =
        "Federal";


    div.appendChild(
        img
    );


    enemigosContenedor.appendChild(
        div
    );


    const federal = {

        elemento: div,

        x: x,

        velocidad:
            VELOCIDAD_ENEMIGO +
            Math.random() *
            (
                VELOCIDAD_ENEMIGO_MAX -
                VELOCIDAD_ENEMIGO
            )

    };


    div.style.left =
        x + "px";


    div.style.bottom =
        PISO + "px";


    federales.push(
        federal
    );

}


/* =========================================================
   MOVIMIENTO FEDERALES
========================================================= */

function actualizarFederales() {

    federales.forEach(
        (federal) => {

            if (!juegoActivo) {
                return;
            }


            /*
               El Federal persigue
               al jugador.
            */

            if (
                federal.x <
                jugadorX
            ) {

                federal.x +=
                    federal.velocidad;

            } else {

                federal.x -=
                    federal.velocidad;

            }


            /*
               Limitar al mapa.
            */

            federal.x =
                limitar(
                    federal.x,
                    0,
                    ANCHO_MUNDO -
                    ANCHO_ENEMIGO
                );


            federal.elemento.style.left =
                federal.x + "px";


            federal.elemento.style.bottom =
                PISO + "px";


            /*
               Colisión.
            */

            if (
                hayColision(
                    federal.elemento,
                    ANCHO_ENEMIGO
                )
            ) {

                if (
                    federal.elemento.dataset.golpeado !==
                    "true"
                ) {

                    federal.elemento.dataset.golpeado =
                        "true";


                    recibirDanio(1);


                    puntos +=
                        PUNTOS_FEDERAL;


                    actualizarPuntos();


                    setTimeout(
                        () => {

                            federal.elemento.dataset.golpeado =
                                "false";

                        },
                        1300
                    );

                }

            }

        }
    );

}


/* =========================================================
   GENERADOR DE FEDERALES
========================================================= */

let ultimoFederal =
    Date.now();


function controlarAparicionFederales() {

    const ahora =
        Date.now();


    if (
        ahora -
        ultimoFederal >=
        INTERVALO_FEDERAL
    ) {

        if (
            federales.length <
            5
        ) {

            crearFederalExtra();

        }


        ultimoFederal =
            ahora;

    }

}


/* =========================================================
   CÁMARA
========================================================= */

function actualizarCamara() {

    const anchoPantalla =
        escenario.clientWidth;


    /*
       La cámara intenta mantener
       a Sarmiento en el centro.
    */

    const objetivo =
        jugadorX -
        anchoPantalla / 2 +
        ANCHO_JUGADOR / 2;


    camaraX =
        limitar(
            objetivo,
            0,
            ANCHO_MUNDO -
            anchoPantalla
        );


    mundo.style.transform =
        `translateX(${-camaraX}px)`;

}


/* =========================================================
   PUNTOS
========================================================= */

function actualizarPuntos() {

    contadorPuntos.textContent =
        String(puntos)
            .padStart(5, "0");

}


/* =========================================================
   TIEMPO
========================================================= */

function actualizarTiempo() {

    if (!juegoActivo) {
        return;
    }


    const segundos =
        Math.floor(
            (
                Date.now() -
                tiempoInicio
            ) / 1000
        );


    const minutos =
        Math.floor(
            segundos / 60
        );


    const segundosRestantes =
        segundos % 60;


    contadorTiempo.textContent =

        String(minutos)
            .padStart(2, "0")

        +

        ":" +

        String(segundosRestantes)
            .padStart(2, "0");

}


/* =========================================================
   PULPERÍA
========================================================= */

function comprobarPulperia() {

    if (nivelCompletado) {
        return;
    }


    /*
       Sarmiento tiene que acercarse
       bastante a la entrada.
    */

    const distancia =
        Math.abs(
            jugadorX -
            7500
        );


    if (
        distancia < 180
    ) {

        completarNivel();

    }

}


/* =========================================================
   COMPLETAR NIVEL
========================================================= */

function completarNivel() {

    if (!juegoActivo) {
        return;
    }


    nivelCompletado =
        true;

    juegoActivo =
        false;


    transicionPulperia.classList.add(
        "visible"
    );


    setTimeout(
        () => {

            window.location.href =
                "../nivel2parte2/nivel2parte2.html";

        },
        3000
    );

}


/* =========================================================
   GAME OVER
========================================================= */

function gameOver() {

    juegoActivo =
        false;


    pantallaGameOver.classList.add(
        "visible"
    );

}


/* =========================================================
   REINICIAR
========================================================= */

function reiniciarNivel() {

    window.location.reload();

}


/* =========================================================
   TECLADO
========================================================= */

document.addEventListener(
    "keydown",
    (evento) => {

        if (
            evento.key === "ArrowLeft" ||
            evento.key.toLowerCase() === "a"
        ) {

            moverIzquierda = true;

        }


        if (
            evento.key === "ArrowRight" ||
            evento.key.toLowerCase() === "d"
        ) {

            moverDerecha = true;

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
            evento.key === "ArrowLeft" ||
            evento.key.toLowerCase() === "a"
        ) {

            moverIzquierda = false;

        }


        if (
            evento.key === "ArrowRight" ||
            evento.key.toLowerCase() === "d"
        ) {

            moverDerecha = false;

        }

    }
);


/* =========================================================
   CONTROLES TÁCTILES
========================================================= */

const btnIzquierda =
    document.getElementById(
        "btnIzquierda"
    );

const btnDerecha =
    document.getElementById(
        "btnDerecha"
    );

const btnSaltar =
    document.getElementById(
        "btnSaltar"
    );


function mantenerBotonPresionado(
    boton,
    accionInicio,
    accionFin
) {

    boton.addEventListener(
        "pointerdown",
        (evento) => {

            evento.preventDefault();

            accionInicio();

        }
    );


    boton.addEventListener(
        "pointerup",
        (evento) => {

            evento.preventDefault();

            accionFin();

        }
    );


    boton.addEventListener(
        "pointerleave",
        () => {

            accionFin();

        }
    );


    boton.addEventListener(
        "pointercancel",
        () => {

            accionFin();

        }
    );

}


mantenerBotonPresionado(

    btnIzquierda,

    () => {
        moverIzquierda = true;
    },

    () => {
        moverIzquierda = false;
    }

);


mantenerBotonPresionado(

    btnDerecha,

    () => {
        moverDerecha = true;
    },

    () => {
        moverDerecha = false;
    }

);


btnSaltar.addEventListener(
    "pointerdown",
    (evento) => {

        evento.preventDefault();

        saltar();

    }
);


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop() {

    actualizarJugador();

    actualizarFederales();

    comprobarObstaculos();

    comprobarAgua();

    actualizarPerdidaHidratacion();

    controlarAparicionFederales();

    actualizarCamara();

    comprobarPulperia();

    actualizarTiempo();


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   INICIO
========================================================= */

function iniciarNivel() {

    inicializarObjetos();

    actualizarVidas();

    actualizarPuntos();

    actualizarHidratacion();

    crearFederalInicial();

    tiempoInicio =
        Date.now();

    ultimoTiempoHidratacion =
        Date.now();

    ultimoFederal =
        Date.now();


    gameLoop();

}


iniciarNivel();
