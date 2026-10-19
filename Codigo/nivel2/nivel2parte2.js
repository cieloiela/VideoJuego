'use strict';

/* Nivel 2, parte 2: travesía por la cordillera.
   La animación de Sarmiento reutiliza los mismos cuadros y ritmos del nivel 1. */
const mundo = document.getElementById('mundo');
const escenario = document.getElementById('escenario');
const personaje = document.getElementById('sarmiento');
const sprite = document.getElementById('sarmientoSprite');
const fondoMontanas = document.getElementById('fondoMontanas');
const fondoBosque = document.getElementById('fondoBosque');
const objetosContenedor = document.getElementById('objetos');
const enemigosContenedor = document.getElementById('enemigos');
const decoraciones = document.getElementById('decoraciones');
const elPuntos = document.getElementById('contadorPuntos');
const elTiempo = document.getElementById('contadorTiempo');
const elVidas = document.getElementById('vidas');
const barraProgreso = document.getElementById('barraProgreso');
const textoProgreso = document.getElementById('textoProgreso');
const botonPausa = document.getElementById('botonPausa');
const menuPausa = document.getElementById('menuPausa');
const pantallaIntro = document.getElementById('pantallaIntro');
const pantallaGameOver = document.getElementById('pantallaGameOver');
const pantallaVictoria = document.getElementById('pantallaVictoria');
const mensajeJuego = document.getElementById('mensajeJuego');
const pausaVolumen = document.getElementById('pausaVolumen');
const pausaValorVolumen = document.getElementById('pausaValorVolumen');
const pausaMusica = document.getElementById('pausaMusica');
const pausaSonido = document.getElementById('pausaSonido');
const pausaPantallaCompleta = document.getElementById('pausaPantallaCompleta');
const musicaNivel2 = document.getElementById('musicaNivel2');

const ANCHO_MUNDO = 10000;
const META_X = 9560;
const PISO = 80;
const ANCHO_JUGADOR = 136;
const VELOCIDAD_JUGADOR = 6.1;
const FUERZA_SALTO = 16.1;
const GRAVEDAD = 0.61;
const GAPS = [{ inicio: 3860, fin: 4015 }, { inicio: 6260, fin: 6475 }];
const PUENTE = { inicio: 6220, fin: 6820 };

let jugadorX = 170;
let jugadorY = PISO;
let velocidadY = 0;
let enSuelo = true;
let direccionJugador = 1;
let moverIzquierda = false;
let moverDerecha = false;
let vidas = 3;
let puntos = 0;
let camaraX = 0;
let juegoIniciado = false;
let juegoActivo = true;
let juegoPausado = false;
let juegoTerminado = false;
let invulnerableHasta = 0;
let tiempoTranscurrido = 0;
let ultimoFrame = 0;
let mensajeTimeout = 0;
let ultimaCaidaRegistrada = false;
let atrapado = false;
let progresoEscape = 0;
const pinosYaLiberados = new Set();

const framesSarmiento = {
  idle: ['idle_1.png','idle_2.png','idle_3.png','idle_4.png','idle_5.png'],
  transition: ['transition_1.png','transition_2.png','transition_3.png','transition_4.png','transition_5.png'],
  runRight: ['runA_1.png','runA_2.png','runA_3.png','runA_4.png','runA_5.png','runA_6.png','runA_7.png','runA_8.png'],
  runLeft: ['runB_1.png','runB_2.png','runB_3.png','runB_4.png','runB_5.png','runB_6.png','runB_7.png','runB_8.png'],
  settle: ['settle_1.png','settle_2.png','settle_3.png','settle_4.png','settle_5.png']
};
const DURACION_FRAME_SARMIENTO = { idle: 170, transition: 105, run: 82, settle: 105 };
const animacionSarmiento = { estado: 'idle', indice: 0, ultimoCambio: 0, anteriorMoviendose: false, inicializada: false };

const DEFINICION_OBSTACULOS = [
  { tipo: 'caja', archivo: 'caja_madera.png', x: 1060, puntos: 100, nombre: 'caja de madera' },
  { tipo: 'muro', archivo: 'muro_piedras.png', x: 1840, puntos: 100, nombre: 'muro de piedras' },
  { tipo: 'valla', archivo: 'valla_madera.png', x: 2740, puntos: 100, nombre: 'valla de madera' },
  { tipo: 'carreta', archivo: 'carreta_rota.png', x: 3350, puntos: 100, nombre: 'carreta rota' },
  { tipo: 'roca-nieve', archivo: 'roca_nieve.png', x: 4650, puntos: 100, nombre: 'roca cubierta de nieve' },
  { tipo: 'fogata', archivo: 'fogata.png', x: 5280, puntos: 100, nombre: 'fogata' },
  { tipo: 'troncos', archivo: 'troncos.png', x: 5730, puntos: 100, nombre: 'troncos caídos' },
  { tipo: 'valla', archivo: 'valla_rota.png', x: 7050, puntos: 100, nombre: 'valla rota' },
  { tipo: 'muro', archivo: 'muro_piedras.png', x: 8050, puntos: 100, nombre: 'muro de piedra' },
  { tipo: 'caja', archivo: 'caja_madera.png', x: 8660, puntos: 100, nombre: 'caja de madera' }
];
const DEFINICION_ENEMIGOS = [
  { tipo: 'soldado', x: 1510, frames: 7, archivo: 'soldado_run_', velocidad: 1.05 },
  { tipo: 'perseguidor', x: 3050, frames: 7, archivo: 'perseguidor_run_', velocidad: 1.25 },
  { tipo: 'soldado', x: 4930, frames: 7, archivo: 'soldado_run_', velocidad: 1.12 },
  { tipo: 'perro', x: 5500, frames: 5, archivo: 'perro_run_', velocidad: 1.5 },
  { tipo: 'perseguidor', x: 7480, frames: 7, archivo: 'perseguidor_run_', velocidad: 1.28 },
  { tipo: 'soldado', x: 8400, frames: 7, archivo: 'soldado_run_', velocidad: 1.22 }
];
const obstaculos = [];
const enemigos = [];

function urlAsset(nombre) { return `../img/cordillera/${nombre}`; }
function limitar(valor, minimo, maximo) { return Math.max(minimo, Math.min(valor, maximo)); }

function crearDecoraciones() {
  const posiciones = [500, 900, 1320, 2050, 2440, 3180, 3500, 4460, 5100, 5900, 6950, 7800, 8520, 9170];
  posiciones.forEach((x, i) => {
    const arbol = document.createElement('img');
    arbol.className = 'decor-arbol';
    arbol.src = urlAsset('pino_nieve.png');
    arbol.alt = '';
    arbol.draggable = false;
    arbol.style.left = `${x}px`;
    arbol.style.height = `${104 + (i % 4) * 15}px`;
    arbol.style.width = `${58 + (i % 3) * 12}px`;
    decoraciones.appendChild(arbol);
  });
}

function crearObstaculos() {
  DEFINICION_OBSTACULOS.forEach((dato, indice) => {
    const elemento = document.createElement('div');
    elemento.className = `obstaculo ${dato.tipo}`;
    elemento.style.left = `${dato.x}px`;
    elemento.dataset.indice = String(indice);
    const imagen = document.createElement('img');
    imagen.src = urlAsset(dato.archivo);
    imagen.alt = dato.nombre;
    imagen.draggable = false;
    elemento.appendChild(imagen);
    objetosContenedor.appendChild(elemento);
    obstaculos.push({ ...dato, elemento, golpeado: false, superado: false });
  });
}

function crearEnemigos() {
  DEFINICION_ENEMIGOS.forEach((dato, indice) => {
    const elemento = document.createElement('div');
    elemento.className = `enemigo ${dato.tipo === 'perro' ? 'perro' : ''}`;
    elemento.style.left = `${dato.x}px`;
    elemento.dataset.indice = String(indice);
    const imagen = document.createElement('img');
    imagen.src = urlAsset(`${dato.archivo}1.png`);
    imagen.alt = dato.tipo === 'perro' ? 'Perro perseguidor' : 'Soldado perseguidor';
    imagen.draggable = false;
    elemento.appendChild(imagen);
    enemigosContenedor.appendChild(elemento);
    enemigos.push({ ...dato, elemento, imagen, frame: 0, ultimoCambio: 0, golpeado: false, superado: false, activo: true });
  });
}

function inicializarMundo() {
  mundo.style.width = `${ANCHO_MUNDO}px`;
  document.getElementById('suelo').style.width = `${ANCHO_MUNDO}px`;
  fondoMontanas.style.width = `${ANCHO_MUNDO}px`;
  fondoBosque.style.width = `${ANCHO_MUNDO}px`;
  crearDecoraciones();
  crearObstaculos();
  crearEnemigos();
  personaje.style.left = `${jugadorX}px`;
  personaje.style.bottom = `${PISO}px`;
  mostrarFrameSarmiento(framesSarmiento.idle, 0);
  actualizarVidas();
  actualizarPuntos();
  actualizarProgreso();
}

function obtenerGrupoAnimacionSarmiento() {
  if (!enSuelo) return direccionJugador === -1 ? framesSarmiento.runLeft : framesSarmiento.runRight;
  if (animacionSarmiento.estado === 'transition') return framesSarmiento.transition;
  if (animacionSarmiento.estado === 'run') return direccionJugador === -1 ? framesSarmiento.runLeft : framesSarmiento.runRight;
  if (animacionSarmiento.estado === 'settle') return framesSarmiento.settle;
  return framesSarmiento.idle;
}

function mostrarFrameSarmiento(grupo, indice) {
  if (!sprite || !grupo || !grupo.length) return;
  const frame = grupo[Math.max(0, Math.min(indice, grupo.length - 1))];
  sprite.style.backgroundImage = `url("../img/sarmiento_anim/${frame}")`;
  sprite.style.backgroundPosition = 'center center';
  sprite.style.backgroundSize = '100% 100%';
  sprite.style.display = 'block';
  const carreraDireccional = animacionSarmiento.estado === 'run' || !enSuelo;
  sprite.style.transform = carreraDireccional ? 'none' : (direccionJugador === -1 ? 'scaleX(-1)' : 'scaleX(1)');
}

function cambiarEstadoAnimacionSarmiento(estado, ahora) {
  animacionSarmiento.estado = estado;
  animacionSarmiento.indice = 0;
  animacionSarmiento.ultimoCambio = ahora;
}

function actualizarAnimacionSarmiento(seEstaMoviendo) {
  const ahora = performance.now();
  if (!animacionSarmiento.inicializada) {
    animacionSarmiento.inicializada = true;
    animacionSarmiento.ultimoCambio = ahora;
    mostrarFrameSarmiento(framesSarmiento.idle, 0);
    return;
  }
  if (!enSuelo) {
    mostrarFrameSarmiento(direccionJugador === -1 ? framesSarmiento.runLeft : framesSarmiento.runRight, 3);
    return;
  }
  if (seEstaMoviendo && !animacionSarmiento.anteriorMoviendose) cambiarEstadoAnimacionSarmiento('transition', ahora);
  else if (!seEstaMoviendo && animacionSarmiento.anteriorMoviendose) cambiarEstadoAnimacionSarmiento('settle', ahora);
  animacionSarmiento.anteriorMoviendose = seEstaMoviendo;
  const grupo = obtenerGrupoAnimacionSarmiento();
  const duracion = animacionSarmiento.estado === 'run' ? DURACION_FRAME_SARMIENTO.run : (DURACION_FRAME_SARMIENTO[animacionSarmiento.estado] || DURACION_FRAME_SARMIENTO.idle);
  if (ahora - animacionSarmiento.ultimoCambio >= duracion) {
    animacionSarmiento.ultimoCambio = ahora;
    animacionSarmiento.indice++;
    if (animacionSarmiento.indice >= grupo.length) {
      if (animacionSarmiento.estado === 'transition') cambiarEstadoAnimacionSarmiento('run', ahora);
      else if (animacionSarmiento.estado === 'settle') cambiarEstadoAnimacionSarmiento('idle', ahora);
      else animacionSarmiento.indice = 0;
    }
  }
  mostrarFrameSarmiento(obtenerGrupoAnimacionSarmiento(), animacionSarmiento.indice);
}

function actualizarVidas() {
  [...elVidas.children].forEach((corazon, i) => {
    corazon.classList.toggle('perdido', i >= vidas);
  });
  elVidas.setAttribute('aria-label', `${vidas} de 3 vidas restantes`);
}
function actualizarPuntos() { elPuntos.textContent = String(puntos).padStart(5, '0'); }
function actualizarProgreso() {
  const porcentaje = limitar(Math.floor((jugadorX / META_X) * 100), 0, 100);
  barraProgreso.style.width = `${porcentaje}%`;
  textoProgreso.textContent = `TRAVESÍA ${porcentaje}%`;
}
function mostrarMensaje(texto) {
  mensajeJuego.textContent = texto;
  mensajeJuego.classList.add('visible');
  window.clearTimeout(mensajeTimeout);
  mensajeTimeout = window.setTimeout(() => mensajeJuego.classList.remove('visible'), 1500);
}
function sumarPuntos(cantidad) { puntos += cantidad; actualizarPuntos(); }

function estaEnBrecha(x) {
  const dentroPuente = x >= PUENTE.inicio && x <= PUENTE.fin;
  if (dentroPuente) return false;
  return GAPS.some((gap) => x >= gap.inicio && x <= gap.fin);
}
function saltar() {
  if (!juegoIniciado || !juegoActivo || juegoPausado || juegoTerminado || !enSuelo || atrapado) return;
  enSuelo = false;
  velocidadY = FUERZA_SALTO;
  personaje.classList.add('saltando');
}

function actualizarJugador(dt) {
  const anteriorX = jugadorX;
  if (!atrapado && moverDerecha && !moverIzquierda) { jugadorX += VELOCIDAD_JUGADOR * dt; direccionJugador = 1; }
  if (!atrapado && moverIzquierda && !moverDerecha) { jugadorX -= VELOCIDAD_JUGADOR * dt; direccionJugador = -1; }
  jugadorX = limitar(jugadorX, 0, ANCHO_MUNDO - ANCHO_JUGADOR);
  const centro = jugadorX + ANCHO_JUGADOR * 0.5;
  const enBrecha = estaEnBrecha(centro);
  if (enSuelo && enBrecha) { enSuelo = false; velocidadY = Math.min(velocidadY, -1.0); }
  if (!enSuelo) {
    const yAnterior = jugadorY;
    velocidadY -= GRAVEDAD * dt;
    jugadorY += velocidadY * dt;
    // Las cajas son plataformas: se puede aterrizar sobre ellas desde arriba.
    const pieAnterior = yAnterior + 6;
    const pieActual = jugadorY + 6;
    const cajaBajoJugador = obstaculos.find((obj) => obj.tipo === 'caja' &&
      jugadorX + 38 < obj.x + 78 && jugadorX + 108 > obj.x &&
      velocidadY < 0 && pieAnterior >= PISO + 82 && pieActual <= PISO + 82);
    if (cajaBajoJugador) {
      jugadorY = PISO + 82;
      velocidadY = 0;
      enSuelo = true;
      ultimaCaidaRegistrada = false;
    } else if (!enBrecha && jugadorY <= PISO) { jugadorY = PISO; velocidadY = 0; enSuelo = true; ultimaCaidaRegistrada = false; }
  } else {
    jugadorY = PISO;
    velocidadY = 0;
  }
  if (jugadorY < -30 && !ultimaCaidaRegistrada) {
    ultimaCaidaRegistrada = true;
    const brechaActual = GAPS.find((gap) => centro >= gap.inicio && centro <= gap.fin);
    recibirDanio('Caíste en una quebrada');
    if (juegoTerminado) return;
    jugadorX = brechaActual ? Math.max(0, brechaActual.inicio - 185) : Math.max(0, anteriorX - 150);
    jugadorY = PISO;
    velocidadY = 0;
    enSuelo = true;
    ultimaCaidaRegistrada = false;
    personaje.style.left = `${jugadorX}px`;
  }
  personaje.style.left = `${jugadorX}px`;
  personaje.style.bottom = `${Math.max(-30, jugadorY)}px`;
  personaje.classList.toggle('saltando', !enSuelo);
  actualizarAnimacionSarmiento(Math.abs(jugadorX - anteriorX) > 0.1);
}

function recibirDanio(motivo) {
  const ahora = performance.now();
  if (ahora < invulnerableHasta || juegoTerminado) return;
  vidas -= 1;
  invulnerableHasta = ahora + 1350;
  actualizarVidas();
  personaje.classList.add('daño');
  window.setTimeout(() => personaje.classList.remove('daño'), 720);
  mostrarMensaje(motivo || '¡Cuidado! Perdiste una vida');
  if (vidas <= 0) terminarJuego(false);
}

function intentarEscapar() {
  if (!atrapado || juegoPausado || juegoTerminado) return;
  progresoEscape++;
  mostrarMensaje(`¡Estás atrapado! Apretá ESPACIO repetidamente para escapar (${Math.min(100, Math.round(progresoEscape / 8 * 100))}%)`);
  if (progresoEscape >= 8) {
    atrapado = false;
    progresoEscape = 0;
    jugadorX = limitar(jugadorX + 150, 0, ANCHO_MUNDO - ANCHO_JUGADOR);
    personaje.style.left = `${jugadorX}px`;
    personaje.classList.remove('atrapado');
    mostrarMensaje('¡Lograste escapar!');
  }
}
function comprobarAtrapamiento() {
  if (atrapado || !enSuelo || juegoPausado || !juegoIniciado) return;
  const px1 = jugadorX + 35, px2 = jugadorX + 100;
  const pino = [...decoraciones.children].some((arbol) => {
    const x = Number.parseFloat(arbol.style.left) || 0;
    const w = Number.parseFloat(arbol.style.width) || 60;
    return !pinosYaLiberados.has(x) && px2 > x + 8 && px1 < x + w - 8;
  });
  const vallaRota = obstaculos.find((obj) => obj.archivo === 'valla_rota.png' &&
    px2 > obj.x + 5 && px1 < obj.x + 115);
  if (pino || vallaRota) {
    atrapado = true;
    progresoEscape = 0;
    personaje.classList.add('atrapado');
    mostrarMensaje('¡QUEDASTE ATRAPADO! Apretá ESPACIO repetidamente hasta escapar.');
  }
}

function actualizarObstaculos() {
  const jugadorIzq = jugadorX + 27;
  const jugadorDer = jugadorX + 102;
  const enAltura = jugadorY > PISO + 64;
  obstaculos.forEach((obj) => {
    const objIzq = obj.x + 7;
    const objDer = obj.x + (obj.tipo === 'muro' ? 135 : obj.tipo === 'carreta' || obj.tipo === 'troncos' ? 145 : 100);
    const colision = jugadorDer > objIzq && jugadorIzq < objDer;
    if (colision && !enAltura && !obj.golpeado && obj.tipo !== 'carreta' && obj.tipo !== 'caja') {
      obj.golpeado = true;
      obj.elemento.classList.add('aviso');
      recibirDanio(`¡Cuidado con ${obj.nombre}! Saltá antes de llegar.`);
    }
    if (!colision && !obj.superado && jugadorX > objDer) {
      obj.superado = true;
      if (!obj.golpeado) sumarPuntos(obj.puntos);
    }
  });
}

function actualizarEnemigos(dt, ahora) {
  enemigos.forEach((enemigo) => {
    // Los perseguidores permanecen en el mundo y siguen al jugador en ambos sentidos.
    // No se eliminan al quedar detrás: así no desaparecen al sobrepasarlos.
    if (!enemigo.activo) {
      // Tras el impacto, el enemigo vuelve a perseguir después de una breve pausa.
      if (ahora >= (enemigo.reapareceEn || 0)) {
        enemigo.activo = true;
        enemigo.golpeado = false;
        enemigo.x = limitar(jugadorX + (enemigo.tipo === 'perro' ? 300 : 390), 0, ANCHO_MUNDO - 90);
        enemigo.elemento.style.display = '';
      } else return;
    }
    const centroJugador = jugadorX + ANCHO_JUGADOR / 2;
    const centroEnemigo = enemigo.x + (enemigo.tipo === 'perro' ? 48 : 40);
    const distancia = centroJugador - centroEnemigo;
    const velocidad = enemigo.velocidad * dt;
    if (Math.abs(distancia) > 48 && Math.abs(distancia) < 1050) {
      enemigo.x += Math.sign(distancia) * Math.min(Math.abs(distancia) - 48, velocidad);
    }
    enemigo.x = limitar(enemigo.x, 0, ANCHO_MUNDO - 100);
    enemigo.elemento.style.left = `${enemigo.x}px`;
    enemigo.imagen.style.transform = enemigo.x > jugadorX ? 'scaleX(-1)' : 'scaleX(1)';
    if (ahora - enemigo.ultimoCambio > (enemigo.tipo === 'perro' ? 125 : 100)) {
      enemigo.ultimoCambio = ahora;
      enemigo.frame = (enemigo.frame + 1) % enemigo.frames;
      enemigo.imagen.src = urlAsset(`${enemigo.archivo}${enemigo.frame + 1}.png`);
    }
    const ancho = enemigo.tipo === 'perro' ? 100 : 78;
    const jugadorIzq = jugadorX + 30;
    const jugadorDer = jugadorX + 105;
    const enemigoIzq = enemigo.x + 8;
    const enemigoDer = enemigo.x + ancho;
    const choca = jugadorDer > enemigoIzq && jugadorIzq < enemigoDer;
    const aLaAltura = jugadorY < PISO + 54;
    if (choca && aLaAltura && !enemigo.golpeado) {
      enemigo.golpeado = true;
      recibirDanio(enemigo.tipo === 'perro' ? '¡El perro te alcanzó!' : '¡Un perseguidor te alcanzó! Saltá para esquivarlo.');
      enemigo.activo = false;
      enemigo.reapareceEn = ahora + 1700;
      enemigo.elemento.style.display = 'none';
    }
  });
}

function actualizarCamara() {
  const ancho = escenario.clientWidth;
  camaraX = limitar(jugadorX - ancho * 0.36, 0, ANCHO_MUNDO - ancho);
  mundo.style.transform = `translate3d(${-camaraX}px,0,0)`;
  fondoMontanas.style.transform = `translate3d(${camaraX * 0.52}px,0,0)`;
  fondoBosque.style.transform = `translate3d(${camaraX * 0.76}px,0,0)`;
}
function actualizarHUD(dt) {
  tiempoTranscurrido += dt * 16.6667;
  const total = Math.floor(tiempoTranscurrido / 1000);
  elTiempo.textContent = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  actualizarProgreso();
}
function terminarJuego(victoria) {
  if (juegoTerminado) return;
  juegoTerminado = true;
  juegoActivo = false;
  juegoPausado = false;
  if (musicaNivel2) musicaNivel2.pause();
  moverIzquierda = false;
  moverDerecha = false;
  if (victoria) {
    puntos += Math.max(0, Math.floor(500 - tiempoTranscurrido / 1000));
    actualizarPuntos();
    document.getElementById('puntajeFinal').textContent = String(puntos).padStart(5, '0');
    pantallaVictoria.classList.add('visible');
    pantallaVictoria.setAttribute('aria-hidden', 'false');
  } else {
    pantallaGameOver.classList.add('visible');
    pantallaGameOver.setAttribute('aria-hidden', 'false');
  }
}
function comprobarMeta() {
  if (jugadorX + ANCHO_JUGADOR * 0.7 >= META_X) terminarJuego(true);
}

let preferenciasPausa = { volumen: 100, musica: true, sonido: true };
function leerPreferenciasPausa() {
  try {
    const guardadas = localStorage.getItem('configuracionEscapeChile');
    if (guardadas) preferenciasPausa = { ...preferenciasPausa, ...JSON.parse(guardadas) };
  } catch (error) { /* La partida no depende del almacenamiento local. */ }
  pausaVolumen.value = preferenciasPausa.volumen;
  pausaValorVolumen.textContent = `${preferenciasPausa.volumen}%`;
  pausaMusica.textContent = preferenciasPausa.musica ? 'ACTIVADA' : 'DESACTIVADA';
  pausaSonido.textContent = preferenciasPausa.sonido ? 'ACTIVADOS' : 'DESACTIVADOS';
  aplicarMusicaNivel2();
}
function guardarPreferenciasPausa() {
  try { localStorage.setItem('configuracionEscapeChile', JSON.stringify(preferenciasPausa)); }
  catch (error) { /* No interrumpir el juego si el almacenamiento está bloqueado. */ }
}
function aplicarMusicaNivel2() {
  if (!musicaNivel2) return;
  musicaNivel2.volume = Math.max(0, Math.min(100, Number(preferenciasPausa.volumen))) / 100;
  if (preferenciasPausa.musica && juegoIniciado && !juegoPausado && !juegoTerminado) {
    musicaNivel2.play().catch(() => {});
  } else {
    musicaNivel2.pause();
  }
}
function intentarIniciarMusicaNivel2() {
  if (!juegoIniciado || juegoPausado || !preferenciasPausa.musica) return;
  aplicarMusicaNivel2();
}
pausaVolumen.addEventListener('input', () => {
  preferenciasPausa.volumen = Number(pausaVolumen.value);
  pausaValorVolumen.textContent = `${preferenciasPausa.volumen}%`;
  guardarPreferenciasPausa();
  aplicarMusicaNivel2();
});
pausaMusica.addEventListener('click', () => {
  preferenciasPausa.musica = !preferenciasPausa.musica;
  pausaMusica.textContent = preferenciasPausa.musica ? 'ACTIVADA' : 'DESACTIVADA';
  guardarPreferenciasPausa();
  aplicarMusicaNivel2();
});
pausaSonido.addEventListener('click', () => {
  preferenciasPausa.sonido = !preferenciasPausa.sonido;
  pausaSonido.textContent = preferenciasPausa.sonido ? 'ACTIVADOS' : 'DESACTIVADOS';
  guardarPreferenciasPausa();
});
pausaPantallaCompleta.addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
  else document.exitFullscreen?.().catch(() => {});
});

function abrirPausa() {
  if (!juegoIniciado || !juegoActivo || juegoTerminado || juegoPausado) return;
  juegoPausado = true;
  if (musicaNivel2) musicaNivel2.pause();
  leerPreferenciasPausa();
  moverIzquierda = false;
  moverDerecha = false;
  menuPausa.classList.add('visible');
  menuPausa.setAttribute('aria-hidden', 'false');
}
function cerrarPausa() {
  if (!juegoPausado) return;
  juegoPausado = false;
  menuPausa.classList.remove('visible');
  menuPausa.setAttribute('aria-hidden', 'true');
  ultimoFrame = 0;
  aplicarMusicaNivel2();
}
function volverMenu() { if (musicaNivel2) musicaNivel2.pause(); window.location.href = '../inicio/inicio.html#menu'; }
function reiniciarNivel() { window.location.reload(); }
function comenzarNivel() {
  if (juegoIniciado || juegoTerminado) return;
  juegoIniciado = true;
  aplicarMusicaNivel2();
  pantallaIntro.classList.remove('visible');
  pantallaIntro.setAttribute('aria-hidden', 'true');
  ultimoFrame = 0;
  mostrarMensaje('¡La travesía comienza!');
}

function gameLoop(timestamp) {
  if (!juegoActivo || juegoTerminado) return;
  if (!ultimoFrame) ultimoFrame = timestamp;
  const deltaMs = Math.min(timestamp - ultimoFrame, 42);
  ultimoFrame = timestamp;
  const dt = deltaMs / 16.6667;
  if (juegoIniciado && !juegoPausado) {
    actualizarJugador(dt);
    actualizarObstaculos();
    actualizarEnemigos(dt, timestamp);
    actualizarCamara();
    actualizarHUD(dt);
    comprobarMeta();
  }
  window.requestAnimationFrame(gameLoop);
}

function mantenerBoton(boton, alPulsar, alSoltar) {
  if (!boton) return;
  const liberar = (evento) => { if (evento) evento.preventDefault(); alSoltar(); };
  boton.addEventListener('pointerdown', (evento) => { evento.preventDefault(); if (boton.setPointerCapture) boton.setPointerCapture(evento.pointerId); alPulsar(); });
  boton.addEventListener('pointerup', liberar);
  boton.addEventListener('pointercancel', liberar);
  boton.addEventListener('lostpointercapture', alSoltar);
  boton.addEventListener('pointerleave', (evento) => { if (evento.buttons === 0) alSoltar(); });
}

mantenerBoton(document.getElementById('btnIzquierda'), () => { if (!juegoPausado) moverIzquierda = true; }, () => moverIzquierda = false);
mantenerBoton(document.getElementById('btnDerecha'), () => { if (!juegoPausado) moverDerecha = true; }, () => moverDerecha = false);
document.getElementById('btnSaltar').addEventListener('pointerdown', (evento) => { evento.preventDefault(); if (atrapado) intentarEscapar(); else saltar(); });
document.getElementById('btnComenzar').addEventListener('click', comenzarNivel);
botonPausa.addEventListener('click', () => juegoPausado ? cerrarPausa() : abrirPausa());
document.getElementById('continuarJuego').addEventListener('click', cerrarPausa);
document.getElementById('reiniciarPausa').addEventListener('click', reiniciarNivel);
document.getElementById('reintentar').addEventListener('click', reiniciarNivel);
document.getElementById('jugarDeNuevo').addEventListener('click', reiniciarNivel);
document.getElementById('volverMenuPrincipal').addEventListener('click', volverMenu);
document.getElementById('volverMenuGameOver').addEventListener('click', volverMenu);
document.getElementById('volverMenuVictoria').addEventListener('click', volverMenu);

document.addEventListener('pointerdown', intentarIniciarMusicaNivel2, { passive: true });
document.addEventListener('keydown', intentarIniciarMusicaNivel2, { passive: true });

document.addEventListener('keydown', (evento) => {
  const tecla = evento.key.toLowerCase();
  if (evento.key === 'Escape') {
    evento.preventDefault();
    if (juegoPausado) cerrarPausa(); else abrirPausa();
    return;
  }
  if (!juegoIniciado || juegoPausado || juegoTerminado) return;
  if (evento.key === 'ArrowRight' || tecla === 'd') { evento.preventDefault(); moverDerecha = true; }
  else if (evento.key === 'ArrowLeft' || tecla === 'a') { evento.preventDefault(); moverIzquierda = true; }
  else if (evento.key === ' ' || evento.key === 'ArrowUp' || tecla === 'w') { evento.preventDefault(); if (atrapado && evento.key === ' ') intentarEscapar(); else saltar(); }
});
document.addEventListener('keyup', (evento) => {
  const tecla = evento.key.toLowerCase();
  if (evento.key === 'ArrowRight' || tecla === 'd') moverDerecha = false;
  if (evento.key === 'ArrowLeft' || tecla === 'a') moverIzquierda = false;
});
window.addEventListener('blur', () => { moverIzquierda = false; moverDerecha = false; });
document.addEventListener('visibilitychange', () => { if (document.hidden) { moverIzquierda = false; moverDerecha = false; } });

leerPreferenciasPausa();
inicializarMundo();
window.requestAnimationFrame(gameLoop);
