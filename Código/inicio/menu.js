
function entrarMenu(){

    const inicio = document.getElementById("inicio");

    inicio.classList.add("salida");

    setTimeout(() => {

        window.location.href = "#menu";

    }, 300);

}



/* ======================================
   CONFIGURACIÓN
====================================== */

let configuracionJuego = {

    resolucion: 100,
    volumen: 100,
    musica: true,
    sonido: true

};



/* Cargar configuración guardada */

function cargarConfiguracion(){

    const guardado =
        localStorage.getItem("configuracionEscapeChile");

    if(guardado){

        configuracionJuego = JSON.parse(guardado);

    }

    document.getElementById("resolucion").value =
        configuracionJuego.resolucion;

    document.getElementById("volumenGeneral").value =
        configuracionJuego.volumen;

    document.getElementById("valorVolumen").textContent =
        configuracionJuego.volumen + "%";


    document.getElementById("botonMusica").textContent =
        configuracionJuego.musica ? "ACTIVADA" : "DESACTIVADA";


    document.getElementById("botonSonido").textContent =
        configuracionJuego.sonido ? "ACTIVADOS" : "DESACTIVADOS";


    aplicarResolucion();

}



/* Guardar configuración */

function guardarConfiguracion(){

    localStorage.setItem(
        "configuracionEscapeChile",
        JSON.stringify(configuracionJuego)
    );

}



/* ======================================
   RESOLUCIÓN
====================================== */

function cambiarResolucion(){

    const valor =
        Number(document.getElementById("resolucion").value);

    configuracionJuego.resolucion = valor;

    aplicarResolucion();

    guardarConfiguracion();

}


function aplicarResolucion(){

    const escala =
        configuracionJuego.resolucion / 100;

    document.body.style.setProperty(
        "--escala-juego",
        escala
    );

}



/* ======================================
   VOLUMEN
====================================== */

function actualizarVolumen(){

    const valor =
        Number(document.getElementById("volumenGeneral").value);

    configuracionJuego.volumen = valor;

    document.getElementById("valorVolumen").textContent =
        valor + "%";

    guardarConfiguracion();

}



/* ======================================
   MÚSICA
====================================== */

function alternarMusica(){

    configuracionJuego.musica =
        !configuracionJuego.musica;

    const boton =
        document.getElementById("botonMusica");

    boton.textContent =
        configuracionJuego.musica
        ? "ACTIVADA"
        : "DESACTIVADA";

    guardarConfiguracion();

}



/* ======================================
   SONIDOS
====================================== */

function alternarSonido(){

    configuracionJuego.sonido =
        !configuracionJuego.sonido;

    const boton =
        document.getElementById("botonSonido");

    boton.textContent =
        configuracionJuego.sonido
        ? "ACTIVADOS"
        : "DESACTIVADOS";

    guardarConfiguracion();

}



/* ======================================
   PANTALLA COMPLETA
====================================== */

function pantallaCompleta(){

    if(!document.fullscreenElement){

        document.documentElement.requestFullscreen()
        .catch(() => {

            alert(
                "No se pudo activar la pantalla completa."
            );

        });

    }else{

        document.exitFullscreen();

    }

}



/* ======================================
   RESTABLECER
====================================== */

function restablecerConfiguracion(){

    configuracionJuego = {

        resolucion: 100,
        volumen: 100,
        musica: true,
        sonido: true

    };

    guardarConfiguracion();

    cargarConfiguracion();

}



/* ======================================
   INICIAR
====================================== */

cargarConfiguracion();