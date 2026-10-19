/* =========================================================
   ESCAPE DE BUENOS AIRES
   NIVEL 2 - LA LLANURA PAMPEANA
   VERSION CORREGIDA
========================================================= */


/* ================= ELEMENTOS ================= */

const personaje = document.getElementById("sarmiento");
const enemigo = document.getElementById("enemigo");
const enemigosContenedor = document.getElementById("enemigos");

const mundo = document.getElementById("mundo");
const escenario = document.querySelector(".escenario");

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

const botonPausa = document.getElementById("botonPausa");
const menuPausa = document.getElementById("menuPausa");
const continuarJuego = document.getElementById("continuarJuego");
const volverMenuPrincipal = document.getElementById("volverMenuPrincipal");
const pausaVolumen = document.getElementById("pausaVolumen");
const pausaValorVolumen = document.getElementById("pausaValorVolumen");
const pausaMusica = document.getElementById("pausaMusica");
const pausaSonido = document.getElementById("pausaSonido");
const pausaPantallaCompleta = document.getElementById("pausaPantallaCompleta");
const musicaNivel2 = document.getElementById("musicaNivel2");



/* ================= CONFIGURACION ================= */


const ANCHO_MUNDO = 12000;

const PISO = 90;



/* ================= JUGADOR ================= */


const ANCHO_JUGADOR = 120;


const VELOCIDAD_JUGADOR = 9;


const FUERZA_SALTO = 30;
const GRAVEDAD = 0.85;



let jugadorX = 220;

let jugadorY = PISO;


let velocidadY = 0;


let enSuelo = true;



let moverIzquierda = false;

let moverDerecha = false;



/* ================= ESTADO ================= */


let vidas = 3;

let puntos = 0;


let juegoActivo = true;
let juegoPausado = false;
let inicioPausa = 0;


let nivelCompletado = false;



let invulnerable = false;



/* ================= CAMARA ================= */


let camaraX = 0;



/* ================= TIEMPO ================= */


let tiempoInicio = Date.now();



/* ================= FEDERALES ================= */


const VELOCIDAD_ENEMIGO = 3;
const VELOCIDAD_ENEMIGO_MAX = 4.5;


const ANCHO_ENEMIGO = 120;


const INTERVALO_FEDERAL = 9000;



let federales = [];



/* ================= HIDRATACION ================= */


let hidratacion = 100;


const PERDIDA_HIDRATACION_POR_SEGUNDO = 0.8;


const RECUPERACION_AGUA = 30;



let ultimoTiempoHidratacion =
Date.now();



/* ================= PUNTOS ================= */


const PUNTOS_OBSTACULO = 100;

const PUNTOS_FEDERAL = 200;

const PUNTOS_AGUA = 50;



/* ================= OBJETOS ================= */


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

const cajas = [
    document.getElementById("caja1"),
    document.getElementById("caja2"),
    document.getElementById("caja3")
];

const aguas = [
    document.getElementById("aguaCaja1"),
    document.getElementById("aguaCaja2"),
    document.getElementById("aguaCaja3")
];

const posicionesCajas = [
    2500,
    7600,
    9900
];

// Todas las ubicaciones quedan dentro del mundo declarado (12.000 px).
const posicionesObstaculos = [
    1500, 3200, 5000, 7000, 8400, 9100, 10350, 10800
];

const posicionesAgua = [
    2500, 7600, 9900
];


/* ================= UTILIDADES ================= */


function limitar(valor,min,max){

return Math.max(
min,
Math.min(valor,max)
);

}



/* ================= INICIO OBJETOS ================= */


function inicializarObjetos(){

    personaje.style.left = jugadorX + "px";
    personaje.style.bottom = PISO + "px";

    obstaculos.forEach((o, i) => {

        if (!o) return;

        o.style.left = posicionesObstaculos[i] + "px";
        o.style.bottom = "65px";

    });

    cajas.forEach((caja, i) => {

        if (!caja) return;

        caja.style.left = posicionesCajas[i] + "px";
        caja.style.bottom = "90px";
        caja.style.display = "flex";

    });

    aguas.forEach((agua, i) => {

        if (!agua) return;

        agua.style.left = posicionesCajas[i] + "px";
        agua.style.bottom = "90px";
        agua.style.display = "none";

        agua.dataset.recolectada = "false";

    });

    enemigo.style.left = "1150px";
    enemigo.style.bottom = PISO + "px";

}


/* ================= JUGADOR ================= */


function actualizarJugador(){


if(!juegoActivo)
return;



if(moverDerecha){

jugadorX += VELOCIDAD_JUGADOR;

personaje.style.transform =
"scaleX(1)";

}



if(moverIzquierda){

jugadorX -= VELOCIDAD_JUGADOR;

personaje.style.transform =
"scaleX(-1)";

}




jugadorX =
limitar(
jugadorX,
0,
ANCHO_MUNDO-ANCHO_JUGADOR
);




velocidadY -= GRAVEDAD;


jugadorY += velocidadY;




if(jugadorY <= PISO){


jugadorY=PISO;

velocidadY=0;

enSuelo=true;


}



personaje.style.left =
jugadorX+"px";


personaje.style.bottom =
jugadorY+"px";


}




/* ================= SALTO ================= */


function saltar(){


if(!juegoActivo)
return;


if(!enSuelo)
return;



velocidadY =
FUERZA_SALTO;


enSuelo=false;



}




/* ================= COLISION ================= */


function hayColision(obj, ancho=120){

const x = parseFloat(obj.style.left||0);
const y = parseFloat(obj.style.bottom||0);

const w = obj.offsetWidth || ancho;
const h = obj.offsetHeight || 120;


// hitbox del jugador reducida
const jugadorIzq = jugadorX + 35;
const jugadorDer = jugadorX + 85;
const jugadorAbajo = jugadorY + 15;
const jugadorArriba = jugadorY + 100;


return (
jugadorDer > x &&
jugadorIzq < x+w &&
jugadorArriba > y &&
jugadorAbajo < y+h
);

}


/* ================= DAÑO ================= */


function recibirDanio(cantidad,origen){


if(!juegoActivo)
return;


if(invulnerable)
return;



vidas -= cantidad;


actualizarVidas();



invulnerable=true;



// empuje

if(origen==="obstaculo"){

jugadorX-=80;

}

else{

jugadorX-=120;

}



personaje.style.filter =
"brightness(2)";



setTimeout(()=>{


personaje.style.filter="";


invulnerable=false;


},1200);



if(vidas<=0){

gameOver();

}


}
/* =========================================================
   VIDAS
========================================================= */


function actualizarVidas(){


const corazones=[

document.getElementById("vida1"),
document.getElementById("vida2"),
document.getElementById("vida3")

];



corazones.forEach((c,i)=>{


if(i >= vidas){

c.classList.add("perdido");


}else{


c.classList.remove("perdido");


}


});


}




/* =========================================================
   OBSTACULOS
========================================================= */


function comprobarObstaculos(){


obstaculos.forEach(obstaculo=>{


if(!obstaculo)
return;



if(hayColision(obstaculo,175)){



if(obstaculo.dataset.golpeado==="true")
return;



obstaculo.dataset.golpeado="true";



recibirDanio(
1,
"obstaculo"
);



puntos += PUNTOS_OBSTACULO;


actualizarPuntos();



setTimeout(()=>{


obstaculo.dataset.golpeado="false";


},1500);



}



});



}




/* =========================================================
   AGUA
========================================================= */


function comprobarAgua(){


aguas.forEach(agua=>{


if(!agua)
return;



if(
agua.dataset.recolectada==="true"
)
return;

if(agua.style.display==="none")
return;

if(hayColision(agua,125)){



agua.dataset.recolectada="true";



hidratacion =
limitar(
hidratacion + RECUPERACION_AGUA,
0,
100
);



puntos += PUNTOS_AGUA;



actualizarPuntos();

actualizarHidratacion();



mostrarMensajeAgua();



agua.style.display="none";



}



});



}




/* =========================================================
   MENSAJE AGUA
========================================================= */


let timeoutMensaje;



function mostrarMensajeAgua(){


clearTimeout(timeoutMensaje);



mensajeAgua.classList.add(
"visible"
);



timeoutMensaje =
setTimeout(()=>{


mensajeAgua.classList.remove(
"visible"
);


},1500);



}




/* =========================================================
   HIDRATACION
========================================================= */


function actualizarHidratacion(){


hidratacion =
limitar(
hidratacion,
0,
100
);



barraHidratacion.style.width =
hidratacion+"%";



contadorHidratacion.textContent =
Math.ceil(hidratacion)+"%";



}





function actualizarPerdidaHidratacion(){


const ahora =
Date.now();



const diferencia =
(ahora - ultimoTiempoHidratacion)
/1000;



if(diferencia >= 1){



hidratacion -=
PERDIDA_HIDRATACION_POR_SEGUNDO *
diferencia;



ultimoTiempoHidratacion =
ahora;



actualizarHidratacion();



if(hidratacion<=0){


hidratacion=0;



// pierde una vida por deshidratacion

recibirDanio(
1,
"obstaculo"
);



hidratacion=50;


}



}



}





/* =========================================================
   PUNTOS
========================================================= */


function actualizarPuntos(){


contadorPuntos.textContent =

String(puntos)
.padStart(5,"0");


}

/* =========================================================
   FEDERAL INICIAL
========================================================= */


function crearFederalInicial(){


const federal={


elemento: enemigo,

x:1150,

velocidad:VELOCIDAD_ENEMIGO


};



federal.elemento.style.left =
federal.x+"px";


federal.elemento.style.bottom =
PISO+"px";



federales.push(federal);



}





/* =========================================================
   CREAR FEDERAL EXTRA
========================================================= */


function crearFederalExtra(){



if(federales.length >= 10)
return;





let x = jugadorX + 700 + Math.random()*700;




if(x > ANCHO_MUNDO-300){


x = ANCHO_MUNDO-500;


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



div.appendChild(img);



enemigosContenedor.appendChild(div);




const federal={


elemento:div,


x:x,


velocidad:

VELOCIDAD_ENEMIGO +

Math.random() *

(
VELOCIDAD_ENEMIGO_MAX -
VELOCIDAD_ENEMIGO
)



};



div.style.left =
x+"px";


div.style.bottom =
PISO+"px";



federales.push(federal);



}




/* =========================================================
   MOVIMIENTO FEDERALES
========================================================= */


function actualizarFederales(){



federales.forEach(federal=>{



if(!juegoActivo)
return;



// no persigue si está demasiado lejos

const distancia =

Math.abs(
federal.x - jugadorX
);



if(distancia > 1000){

return;

}





if(federal.x < jugadorX){


federal.x += federal.velocidad;


federal.elemento.style.transform =
"scaleX(1)";



}else{



federal.x -= federal.velocidad;


federal.elemento.style.transform =
"scaleX(-1)";



}




federal.x =

limitar(

federal.x,

0,

ANCHO_MUNDO-ANCHO_ENEMIGO

);




federal.elemento.style.left =
federal.x+"px";




if(
hayColision(
federal.elemento,
ANCHO_ENEMIGO
)
){



if(
federal.elemento.dataset.golpeado
==="true"
)
return;



federal.elemento.dataset.golpeado =
"true";



recibirDanio(
1,
"federal"
);



puntos += PUNTOS_FEDERAL;


actualizarPuntos();



setTimeout(()=>{


federal.elemento.dataset.golpeado =
"false";


},1500);



}



});



}






/* =========================================================
   GENERADOR DE FEDERALES
========================================================= */


let ultimoFederal =
Date.now();




function controlarAparicionFederales(){



const ahora =
Date.now();



if(
ahora - ultimoFederal >= INTERVALO_FEDERAL
){



crearFederalExtra();



ultimoFederal =
ahora;



}



}
/* =========================================================
   CAMARA
========================================================= */


function actualizarCamara(){


const anchoPantalla =
escenario.clientWidth;



const objetivo =

jugadorX -

anchoPantalla/2 +

ANCHO_JUGADOR/2;



camaraX =

limitar(

objetivo,

0,

ANCHO_MUNDO-anchoPantalla

);



mundo.style.transform =

`translateX(${-camaraX}px)`;


}





/* =========================================================
   TIEMPO
========================================================= */


function actualizarTiempo(){


if(!juegoActivo)
return;



const segundos =

Math.floor(

(Date.now()-tiempoInicio)
/1000

);



const minutos =

Math.floor(segundos/60);



const seg =

segundos%60;



contadorTiempo.textContent =

String(minutos)
.padStart(2,"0")

+

":"

+

String(seg)
.padStart(2,"0");



}

/* =========================================================
   CAJA CON AGUA OCULTA
========================================================= */

/* =========================================================
   CAJA CON AGUA OCULTA
========================================================= */

cajas.forEach((caja,i)=>{

    caja.addEventListener("click",()=>{


        const agua = aguas[i];


        agua.style.left = caja.offsetLeft+"px";
        agua.style.bottom="90px";


        caja.style.display="none";


        agua.classList.remove("escondida");
        agua.style.display="flex";


    });

});


/* =========================================================
   PULPERIA
========================================================= */


function comprobarPulperia(){


if(nivelCompletado)
return;



const distancia =

Math.abs(

jugadorX-11500

);



if(distancia < 180){


completarNivel();


}



}




function completarNivel(){



if(!juegoActivo)
return;



nivelCompletado=true;

juegoActivo=false;
if (musicaNivel2) musicaNivel2.pause();



transicionPulperia.classList.add(
"visible"
);



setTimeout(()=>{


window.location.href =

"nivel2parte2.html";



},3000);



}





/* =========================================================
   GAME OVER
========================================================= */


function gameOver(){


juegoActivo=false;
if (musicaNivel2) musicaNivel2.pause();



pantallaGameOver.classList.add(
"visible"
);



}





/* Preferencias compartidas y banda sonora del nivel 2. */
let preferenciasPausa = { volumen: 100, musica: true, sonido: true };
function leerPreferenciasPausa() {
    try {
        const guardadas = localStorage.getItem("configuracionEscapeChile");
        if (guardadas) preferenciasPausa = { ...preferenciasPausa, ...JSON.parse(guardadas) };
    } catch (error) { /* La partida sigue funcionando si el navegador bloquea el almacenamiento. */ }
    pausaVolumen.value = preferenciasPausa.volumen;
    pausaValorVolumen.textContent = `${preferenciasPausa.volumen}%`;
    pausaMusica.textContent = preferenciasPausa.musica ? "ACTIVADA" : "DESACTIVADA";
    pausaSonido.textContent = preferenciasPausa.sonido ? "ACTIVADOS" : "DESACTIVADOS";
    aplicarMusicaNivel2();
}
function guardarPreferenciasPausa() {
    try { localStorage.setItem("configuracionEscapeChile", JSON.stringify(preferenciasPausa)); }
    catch (error) { /* No bloquear el juego si el almacenamiento no está disponible. */ }
}
function aplicarMusicaNivel2() {
    if (!musicaNivel2) return;
    musicaNivel2.volume = Math.max(0, Math.min(100, Number(preferenciasPausa.volumen))) / 100;
    if (preferenciasPausa.musica && !juegoPausado && juegoActivo && !nivelCompletado) {
        musicaNivel2.play().catch(() => {});
    } else {
        musicaNivel2.pause();
    }
}
function intentarIniciarMusicaNivel2() {
    if (!preferenciasPausa || !preferenciasPausa.musica || juegoPausado) return;
    aplicarMusicaNivel2();
}
pausaVolumen?.addEventListener("input", () => {
    preferenciasPausa.volumen = Number(pausaVolumen.value);
    pausaValorVolumen.textContent = `${preferenciasPausa.volumen}%`;
    guardarPreferenciasPausa();
    aplicarMusicaNivel2();
});
pausaMusica?.addEventListener("click", () => {
    preferenciasPausa.musica = !preferenciasPausa.musica;
    pausaMusica.textContent = preferenciasPausa.musica ? "ACTIVADA" : "DESACTIVADA";
    guardarPreferenciasPausa();
    aplicarMusicaNivel2();
});
pausaSonido?.addEventListener("click", () => {
    preferenciasPausa.sonido = !preferenciasPausa.sonido;
    pausaSonido.textContent = preferenciasPausa.sonido ? "ACTIVADOS" : "DESACTIVADOS";
    guardarPreferenciasPausa();
});
pausaPantallaCompleta?.addEventListener("click", () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
});

/* =========================================================
   PAUSA
========================================================= */
function abrirPausa(){
    if(!juegoActivo || juegoPausado || nivelCompletado) return;
    juegoPausado = true;
    inicioPausa = Date.now();
    leerPreferenciasPausa();
    moverIzquierda = false;
    moverDerecha = false;
    if (musicaNivel2) musicaNivel2.pause();
    menuPausa.classList.add("mostrar");
    menuPausa.setAttribute("aria-hidden","false");
}

function cerrarPausa(){
    if(!juegoPausado) return;
    const ahora = Date.now();
    const duracionPausa = ahora - inicioPausa;
    tiempoInicio += duracionPausa;
    ultimoTiempoHidratacion += duracionPausa;
    ultimoFederal += duracionPausa;
    juegoPausado = false;
    menuPausa.classList.remove("mostrar");
    menuPausa.setAttribute("aria-hidden","true");
    aplicarMusicaNivel2();
}

botonPausa?.addEventListener("click", () => juegoPausado ? cerrarPausa() : abrirPausa());
continuarJuego?.addEventListener("click", cerrarPausa);
volverMenuPrincipal?.addEventListener("click", () => {
    if (musicaNivel2) musicaNivel2.pause();
    window.location.href = "../inicio/inicio.html#menu";
});

document.addEventListener("pointerdown", intentarIniciarMusicaNivel2, { passive: true });
document.addEventListener("keydown", intentarIniciarMusicaNivel2, { passive: true });

/* =========================================================
   TECLADO
========================================================= */


document.addEventListener(
"keydown",
e=>{

if(e.key === "Escape"){
    e.preventDefault();
    juegoPausado ? cerrarPausa() : abrirPausa();
    return;
}

if(juegoPausado) return;


if(
e.key==="ArrowRight" ||
e.key.toLowerCase()==="d"
){


moverDerecha=true;


}



if(
e.key==="ArrowLeft" ||
e.key.toLowerCase()==="a"
){


moverIzquierda=true;


}




if(
e.key===" " ||
e.key==="ArrowUp" ||
e.key.toLowerCase()==="w"
){


e.preventDefault();


saltar();


}



});






document.addEventListener(
"keyup",
e=>{



if(
e.key==="ArrowRight" ||
e.key.toLowerCase()==="d"
){


moverDerecha=false;


}



if(
e.key==="ArrowLeft" ||
e.key.toLowerCase()==="a"
){


moverIzquierda=false;


}



});







/* =========================================================
   BOTONES MOVIL
========================================================= */


const btnIzquierda =
document.getElementById("btnIzquierda");


const btnDerecha =
document.getElementById("btnDerecha");


const btnSaltar =
document.getElementById("btnSaltar");





function mantenerBoton(
boton,
inicio,
fin
){



if(!boton)
return;



boton.addEventListener(
"pointerdown",
e=>{


e.preventDefault();

inicio();


});



boton.addEventListener(
"pointerup",
e=>{


e.preventDefault();

fin();


});



boton.addEventListener(
"pointerleave",
fin
);



boton.addEventListener(
"pointercancel",
fin
);



}





mantenerBoton(

btnIzquierda,

()=>moverIzquierda=true,

()=>moverIzquierda=false

);




mantenerBoton(

btnDerecha,

()=>moverDerecha=true,

()=>moverDerecha=false

);





if(btnSaltar){


btnSaltar.addEventListener(
"pointerdown",
e=>{


e.preventDefault();

saltar();



});


}






/* =========================================================
   LOOP PRINCIPAL
========================================================= */


function gameLoop(){



if(juegoActivo && !juegoPausado){


actualizarJugador();


actualizarFederales();


comprobarObstaculos();


comprobarAgua();


actualizarPerdidaHidratacion();


controlarAparicionFederales();


actualizarCamara();


comprobarPulperia();


actualizarTiempo();


}



requestAnimationFrame(
gameLoop
);



}






/* =========================================================
   INICIO
========================================================= */


function iniciarNivel(){



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