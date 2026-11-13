'use strict';

/* Escape de Buenos Aires — Nivel 2, parte 1: La llanura pampeana.
   Sarmiento reutiliza los mismos cuadros del nivel 1 y de la cordillera.
   Los enemigos, props y efectos se extraen de la hoja de sprites del proyecto. */


// Guardar el último nivel visitado para permitir continuar desde el menú.
try { localStorage.setItem("escapeChileUltimoNivel", "nivel2"); } catch (e) {}

const $ = (id) => document.getElementById(id);
const mundo = $('mundo');
const escenario = $('escenario');
const fondoParallax = $('fondoParallax');
const personaje = $('sarmiento');
const spriteSarmiento = $('sarmientoSprite');
const destelloArma = $('destelloArma');
const contenedorPlataformas = $('plataformas');
const contenedorObstaculos = $('obstaculos');
const contenedorColeccionables = $('coleccionables');
const contenedorProyectiles = $('proyectiles');
const contenedorEfectos = $('efectos');
const contenedorEnemigos = $('enemigos');
const decoraciones = $('decoraciones');
const elPuntos = $('contadorPuntos');
const elTiempo = $('contadorTiempo');
const elVidas = $('vidas');
const elHidratacion = $('contadorHidratacion');
const barraHidratacion = $('barraHidratacion');
const mensajeJuego = $('mensajeJuego');
const menuPausa = $('menuPausa');
const botonPausa = $('botonPausa');
const pantallaGameOver = $('pantallaGameOver');
const transicionPulperia = $('transicionPulperia');
const musicaNivel2 = $('musicaNivel2');
const pausaVolumen = $('pausaVolumen');
const pausaValorVolumen = $('pausaValorVolumen');
const pausaMusica = $('pausaMusica');
const pausaSonido = $('pausaSonido');
const pausaPantallaCompleta = $('pausaPantallaCompleta');
const introNivel2 = $('introNivel2');
const cargaNivel2 = $('cargaNivel2');
const transicionNivel2 = $('transicionNivel2');
let nivel2Listo = false;


const ANCHO_MUNDO = 11200;
const META_X = 10820;
const ANCHO_JUGADOR = 152;
const ALTO_JUGADOR = 158;
const VELOCIDAD_JUGADOR = 5.25; // +25% respecto de la velocidad base anterior
const FUERZA_SALTO = 20.6; // mayor altura para superar carretas y obstáculos con margen
const GRAVEDAD = 0.75; // arco ligeramente más corto para recuperar el control antes
const VELOCIDAD_PIEDRITA = 12.8;
const ENFRIAMIENTO_DISPARO = 290;
const VIDAS_MAXIMAS = 3;

const framesSarmiento = {
  idle: ['idle_1.png','idle_2.png','idle_3.png','idle_4.png','idle_5.png'],
  transition: ['transition_1.png','transition_2.png','transition_3.png','transition_4.png','transition_5.png'],
  runRight: ['runA_1.png','runA_2.png','runA_3.png','runA_4.png','runA_5.png','runA_6.png','runA_7.png','runA_8.png'],
  runLeft: ['runB_1.png','runB_2.png','runB_3.png','runB_4.png','runB_5.png','runB_6.png','runB_7.png','runB_8.png'],
  settle: ['settle_1.png','settle_2.png','settle_3.png','settle_4.png','settle_5.png']
};
const DURACION_FRAME_SARMIENTO = { idle: 170, transition: 105, run: 82, settle: 105 };
const animacionSarmiento = { estado: 'idle', indice: 0, ultimoCambio: 0, anteriorMoviendose: false, inicializada: false, ultimaDireccion: 1 };

let jugadorX = 180;
let jugadorY = 0; // distancia vertical de los pies respecto del suelo
let velocidadY = 0;
let enSuelo = true;
let plataformaActual = null;
let direccionJugador = 1;
let moverIzquierda = false;
let moverDerecha = false;
let vidas = VIDAS_MAXIMAS;
let puntos = 0;
let hidratacion = 100;
let tiempoSeco = 0;
let tiempoTranscurrido = 0;
let camaraX = 0;
let juegoPausado = true; // permanece bloqueado hasta mostrar instrucciones y carga
let juegoTerminado = false;
let nivelCompletado = false;
let invulnerableHasta = 0;
let ultimoDisparo = -Infinity;
let ultimoFrame = 0;
let mensajeTimeout = 0;
let contadorMuertesEnemigo = 0;
const proyectiles = [];
const enemigos = [];
const obstaculos = [];
const monticulos = [];
const plataformasCaja = [];
const coleccionables = [];
const efectos = [];

const DEFINICION_MONTICULOS = [
  { x: 700, w: 156, h: 38, src: 'duna_chica.png', nombre: 'duna pequeña' },
  { x: 1970, w: 236, h: 84, src: 'duna_grande.png', nombre: 'médano grande' },
  { x: 3330, w: 160, h: 52, src: 'plataforma_arena_1.png', nombre: 'médano plano' },
  { x: 4250, w: 205, h: 61, src: 'duna_mediana.png', nombre: 'médano mediano' },
  { x: 5400, w: 190, h: 51, src: 'plataforma_arena_2.png', nombre: 'banco de arena' },
  { x: 6640, w: 325, h: 112, src: 'duna_grande.png', nombre: 'médano alto' },
  { x: 8080, w: 236, h: 82, src: 'duna_mediana.png', nombre: 'médano mediano' },
  { x: 9310, w: 278, h: 91, src: 'duna_grande.png', nombre: 'médano grande' }
];

const DEFINICION_OBSTACULOS = [
  { tipo: 'cart', src: 'carreta.png', x: 1440, w: 210, h: 122, nombre: 'carreta rota', plataforma: false },
  { tipo: 'caja', src: 'caja_madera.png', x: 2675, w: 82, h: 86, nombre: 'caja de madera', plataforma: true, plataformaH: 61 },
  { tipo: 'barril', src: 'barril.png', x: 3850, w: 68, h: 78, nombre: 'barril', plataforma: false },
  { tipo: 'valla', src: 'valla.png', x: 4850, w: 158, h: 88, nombre: 'valla de madera', plataforma: false },
  { tipo: 'ramas', src: 'ramas.png', x: 6150, w: 155, h: 79, nombre: 'ramas caídas', plataforma: false },
  { tipo: 'rocas', src: 'rocas_grandes.png', x: 7470, w: 95, h: 72, nombre: 'rocas', plataforma: false },
  { tipo: 'cart', src: 'carreta.png', x: 8760, w: 210, h: 122, nombre: 'carreta volcada', plataforma: false },
  { tipo: 'valla', src: 'valla.png', x: 10100, w: 158, h: 88, nombre: 'valla rota', plataforma: false }
];

const DEFINICION_ENEMIGOS = [
  { tipo: 'federal', x: 1110, frames: 7, archivo: 'enemigo_federal_', velocidad: 1.05, vida: 3 },
  { tipo: 'bandido', x: 2220, frames: 5, archivo: 'enemigo_bandido_', velocidad: 1.18, vida: 3 },
  { tipo: 'federal', x: 3190, frames: 7, archivo: 'enemigo_federal_', velocidad: 1.08, vida: 3 },
  { tipo: 'jinete', x: 4020, frames: 6, archivo: 'enemigo_jinete_', velocidad: 1.18, vida: 3 },
  { tipo: 'federal', x: 5100, frames: 7, archivo: 'enemigo_federal_', velocidad: 1.2, vida: 3 },
  { tipo: 'bandido', x: 5890, frames: 5, archivo: 'enemigo_bandido_', velocidad: 1.25, vida: 3 },
  { tipo: 'jinete', x: 7240, frames: 6, archivo: 'enemigo_jinete_', velocidad: 1.25, vida: 3 },
  { tipo: 'federal', x: 7900, frames: 7, archivo: 'enemigo_federal_', velocidad: 1.18, vida: 3 },
  { tipo: 'bandido', x: 9080, frames: 5, archivo: 'enemigo_bandido_', velocidad: 1.3, vida: 3 },
  { tipo: 'federal', x: 10000, frames: 7, archivo: 'enemigo_federal_', velocidad: 1.32, vida: 3 }
];

const DEFINICION_RECOLECTABLES = [
  { tipo: 'cantimplora', x: 560, y: 48, w: 43, h: 56, valor: 45 },
  { tipo: 'bolsa', x: 1810, y: 53, w: 49, h: 44, valor: 100 },
  { tipo: 'botiquin', x: 2690, y: 128, w: 48, h: 38, cura: 1, requiereAltura: true, alturaMinima: 48 },
  { tipo: 'cantimplora', x: 4100, y: 50, w: 43, h: 56, valor: 45 },
  { tipo: 'bolsa', x: 4950, y: 62, w: 49, h: 44, valor: 100 },
  { tipo: 'cantimplora', x: 5860, y: 50, w: 43, h: 56, valor: 45 },
  { tipo: 'botiquin', x: 6790, y: 145, w: 48, h: 38, cura: 1, requiereAltura: true, alturaMinima: 72 },
  { tipo: 'cantimplora', x: 7770, y: 53, w: 43, h: 56, valor: 45 },
  { tipo: 'bolsa', x: 8900, y: 48, w: 49, h: 44, valor: 100 },
  { tipo: 'cantimplora', x: 9900, y: 52, w: 43, h: 56, valor: 45 }
];

function obtenerSuelo() {
  const nivel = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ground-level')) || 94;
  const desfase = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ground-contact-offset')) || 16;
  // La textura de suelo tiene una franja de píxeles vacíos antes de la hierba;
  // este ajuste hace coincidir pies/obstáculos con la superficie visible, no con el borde de la caja CSS.
  return Math.max(0, nivel - desfase);
}
function asset(nombre) { return `../img/llanura/${nombre}`; }
function limitar(n, min, max) { return Math.max(min, Math.min(max, n)); }
function distanciaSolapada(a1, a2, b1, b2) { return a2 > b1 && a1 < b2; }

function crearImagen(src, alt = '') {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.draggable = false;
  img.decoding = 'async';
  return img;
}
function crearDecoraciones() {
  const datos = [
    { x: 330, src: 'arbusto.png', w: 54, h: 52 }, { x: 1050, src: 'cactus.png', w: 38, h: 72 },
    { x: 1850, src: 'ramas.png', w: 110, h: 54 }, { x: 2460, src: 'arbusto.png', w: 49, h: 50 },
    { x: 3520, src: 'cactus.png', w: 39, h: 68 }, { x: 4480, src: 'arbusto.png', w: 58, h: 50 },
    { x: 5210, src: 'ramas.png', w: 122, h: 56 }, { x: 6000, src: 'cactus.png', w: 44, h: 77 },
    { x: 7590, src: 'arbusto.png', w: 58, h: 54 }, { x: 8420, src: 'ramas.png', w: 112, h: 50 },
    { x: 9530, src: 'cactus.png', w: 40, h: 74 }, { x: 10620, src: 'arbusto.png', w: 56, h: 52 }
  ];
  datos.forEach((dato) => {
    const img = crearImagen(asset(dato.src));
    img.className = 'decoracion';
    img.style.left = `${dato.x}px`;
    img.style.width = `${dato.w}px`;
    img.style.height = `${dato.h}px`;
    decoraciones.appendChild(img);
  });
}
function crearMonticulos() {
  DEFINICION_MONTICULOS.forEach((dato) => {
    const elemento = document.createElement('div');
    elemento.className = 'monticulo';
    elemento.setAttribute('aria-label', dato.nombre);
    elemento.style.left = `${dato.x}px`;
    elemento.style.width = `${dato.w}px`;
    elemento.style.height = `${dato.h}px`;
    elemento.appendChild(crearImagen(asset(dato.src), dato.nombre));
    contenedorPlataformas.appendChild(elemento);
    monticulos.push({ ...dato, elemento });
  });
}
function crearObstaculos() {
  DEFINICION_OBSTACULOS.forEach((dato, indice) => {
    const elemento = document.createElement('div');
    elemento.className = `obstaculo ${dato.tipo}`;
    elemento.style.left = `${dato.x}px`;
    elemento.style.width = `${dato.w}px`;
    elemento.style.height = `${dato.h}px`;
    elemento.dataset.indice = String(indice);
    elemento.appendChild(crearImagen(asset(dato.src), dato.nombre));
    contenedorObstaculos.appendChild(elemento);
    const objeto = { ...dato, elemento, golpeadoHasta: 0, superado: false };
    obstaculos.push(objeto);
    if (dato.plataforma) plataformasCaja.push({ x: dato.x + 7, w: dato.w - 14, h: dato.plataformaH, obstaculo: objeto });
  });
}
function crearEnemigos() {
  DEFINICION_ENEMIGOS.forEach((dato, indice) => {
    const elemento = document.createElement('div');
    elemento.className = `enemigo ${dato.tipo}`;
    elemento.style.left = `${dato.x}px`;
    elemento.dataset.indice = String(indice);
    const imagen = crearImagen(asset(`${dato.archivo}1.png`), dato.tipo === 'jinete' ? 'Jinete perseguidor' : 'Soldado perseguidor');
    elemento.appendChild(imagen);
    const barra = document.createElement('div');
    barra.className = 'barra-vida-enemigo';
    barra.setAttribute('aria-label', 'Vida del enemigo: 3 golpes');
    const barraInterior = document.createElement('span');
    barra.appendChild(barraInterior);
    elemento.appendChild(barra);
    contenedorEnemigos.appendChild(elemento);
    enemigos.push({ ...dato, baseX: dato.x, x: dato.x, y: 0, elemento, imagen, barraInterior, frame: 0, ultimoCambio: 0, vida: 3, muerto: false, dirPatrulla: -1, ultimoContacto: 0 });
  });
}
function crearRecolectables() {
  DEFINICION_RECOLECTABLES.forEach((dato) => crearRecolectable(dato));
}
function crearRecolectable(dato) {
  const elemento = document.createElement('div');
  elemento.className = `recolectable ${dato.tipo} brillo`;
  elemento.style.left = `${dato.x}px`;
  elemento.style.bottom = `${obtenerSuelo() + dato.y}px`;
  elemento.style.width = `${dato.w}px`;
  elemento.style.height = `${dato.h}px`;
  elemento.appendChild(crearImagen(asset(`${dato.tipo === 'cantimplora' ? 'cantimplora' : dato.tipo}.png`), dato.tipo === 'botiquin' ? 'Botiquín' : dato.tipo === 'cantimplora' ? 'Cantimplora de agua' : 'Bolsa de provisiones'));
  contenedorColeccionables.appendChild(elemento);
  const objeto = { ...dato, elemento, baseY: dato.y, currentY: dato.y, creado: performance.now(), recogido: false };
  coleccionables.push(objeto);
  return objeto;
}
function inicializarMundo() {
  mundo.style.width = `${ANCHO_MUNDO}px`;
  $('suelo').style.width = `${ANCHO_MUNDO}px`;
  crearDecoraciones();
  crearMonticulos();
  crearObstaculos();
  crearEnemigos();
  crearRecolectables();
  personaje.style.left = `${jugadorX}px`;
  personaje.style.bottom = `${obtenerSuelo()}px`;
  mostrarFrameSarmiento(framesSarmiento.idle, 0);
  actualizarVidas();
  actualizarPuntos();
  actualizarHidratacion();
}

function obtenerGrupoAnimacionSarmiento() {
  if (!enSuelo) return direccionJugador < 0 ? framesSarmiento.runLeft : framesSarmiento.runRight;
  if (animacionSarmiento.estado === 'transition') return framesSarmiento.transition;
  if (animacionSarmiento.estado === 'run') return direccionJugador < 0 ? framesSarmiento.runLeft : framesSarmiento.runRight;
  if (animacionSarmiento.estado === 'settle') return framesSarmiento.settle;
  return framesSarmiento.idle;
}
function mostrarFrameSarmiento(grupo, indice) {
  if (!spriteSarmiento || !grupo?.length) return;
  const frame = grupo[Math.max(0, Math.min(indice, grupo.length - 1))];
  spriteSarmiento.style.backgroundImage = `url("../img/sarmiento_anim/${frame}")`;
  spriteSarmiento.style.backgroundPosition = 'center bottom';
  spriteSarmiento.style.backgroundSize = '100% 100%';
  spriteSarmiento.style.transform = 'none';
}
function cambiarEstadoAnimacion(estado, ahora) {
  animacionSarmiento.estado = estado;
  animacionSarmiento.indice = 0;
  animacionSarmiento.ultimoCambio = ahora;
}
function actualizarAnimacionSarmiento(seEstaMoviendo) {
  const ahora = performance.now();
  if (!animacionSarmiento.inicializada) {
    animacionSarmiento.inicializada = true;
    animacionSarmiento.ultimoCambio = ahora;
    animacionSarmiento.ultimaDireccion = direccionJugador;
    mostrarFrameSarmiento(framesSarmiento.idle, 0);
    return;
  }
  // Cuando cambia la dirección, reinicia inmediatamente el ciclo con la hoja
  // correcta (runA mira a la derecha y runB a la izquierda).
  const cambioDireccion = direccionJugador !== animacionSarmiento.ultimaDireccion;
  if (cambioDireccion) {
    animacionSarmiento.ultimaDireccion = direccionJugador;
    if (seEstaMoviendo || !enSuelo) {
      cambiarEstadoAnimacion('run', ahora);
      animacionSarmiento.anteriorMoviendose = true;
    }
  }
  if (!enSuelo) {
    const grupoAire = direccionJugador < 0 ? framesSarmiento.runLeft : framesSarmiento.runRight;
    mostrarFrameSarmiento(grupoAire, 3);
    animacionSarmiento.anteriorMoviendose = seEstaMoviendo;
    return;
  }
  if (!cambioDireccion) {
    if (seEstaMoviendo && !animacionSarmiento.anteriorMoviendose) cambiarEstadoAnimacion('transition', ahora);
    else if (!seEstaMoviendo && animacionSarmiento.anteriorMoviendose) cambiarEstadoAnimacion('settle', ahora);
  }
  animacionSarmiento.anteriorMoviendose = seEstaMoviendo;
  let grupo = obtenerGrupoAnimacionSarmiento();
  const duracion = animacionSarmiento.estado === 'run' ? DURACION_FRAME_SARMIENTO.run : (DURACION_FRAME_SARMIENTO[animacionSarmiento.estado] || DURACION_FRAME_SARMIENTO.idle);
  if (ahora - animacionSarmiento.ultimoCambio >= duracion) {
    animacionSarmiento.ultimoCambio = ahora;
    animacionSarmiento.indice += 1;
    if (animacionSarmiento.indice >= grupo.length) {
      if (animacionSarmiento.estado === 'transition') cambiarEstadoAnimacion('run', ahora);
      else if (animacionSarmiento.estado === 'settle') cambiarEstadoAnimacion('idle', ahora);
      else animacionSarmiento.indice = 0;
    }
  }
  grupo = obtenerGrupoAnimacionSarmiento();
  mostrarFrameSarmiento(grupo, animacionSarmiento.indice);
}

function superficieMonticuloEn(x) {
  let mejor = 0;
  let mejorMonticulo = null;
  let fraccion = 0.5;
  for (const m of monticulos) {
    const local = x - m.x;
    if (local < 0 || local > m.w) continue;
    const t = local / m.w;
    let perfil;
    if (t < 0.3) perfil = t / 0.3;
    else if (t > 0.7) perfil = (1 - t) / 0.3;
    else perfil = 1;
    const altura = Math.max(0, m.h * perfil);
    if (altura > mejor) { mejor = altura; mejorMonticulo = m; fraccion = t; }
  }
  return { altura: mejor, monticulo: mejorMonticulo, fraccion };
}
function superficieEnX(x) { return superficieMonticuloEn(x).altura; }
function plataformaBajoJugador(x) {
  return plataformasCaja.find((p) => x >= p.x && x <= p.x + p.w) || null;
}
function lanzarPiedrita() {
  if (juegoPausado || juegoTerminado || nivelCompletado || performance.now() - ultimoDisparo < ENFRIAMIENTO_DISPARO) return;
  ultimoDisparo = performance.now();
  const x = jugadorX + (direccionJugador > 0 ? ANCHO_JUGADOR - 8 : -22);
  const y = jugadorY + 79;
  const elemento = document.createElement('div');
  elemento.className = 'proyectil';
  elemento.style.left = `${x}px`;
  elemento.style.bottom = `${obtenerSuelo() + y}px`;
  const imagen = crearImagen(asset('piedrita.png'), 'Piedrita lanzada');
  elemento.appendChild(imagen);
  elemento.style.transform = direccionJugador < 0 ? 'scaleX(-1)' : 'none';
  contenedorProyectiles.appendChild(elemento);
  proyectiles.push({ elemento, x, y, vx: direccionJugador * VELOCIDAD_PIEDRITA, vy: 1.25, vidaMs: 0, eliminado: false });
  destelloArma.classList.remove('activo');
  void destelloArma.offsetWidth;
  destelloArma.classList.add('activo');
  mostrarMensaje('¡Piedrita lanzada! Cada enemigo aguanta tres impactos.');
}
function crearImpacto(x, y, rojo = false) {
  const elemento = document.createElement('div');
  elemento.className = 'efecto-impacto';
  elemento.style.left = `${x - 27}px`;
  elemento.style.bottom = `${obtenerSuelo() + Math.max(8, y - 24)}px`;
  elemento.appendChild(crearImagen(asset(rojo ? 'impacto_rojo.png' : 'impacto_chispa.png'), 'Impacto'));
  contenedorEfectos.appendChild(elemento);
  efectos.push({ elemento, creado: performance.now() });
}
function eliminarProyectil(proyectil) {
  proyectil.eliminado = true;
  proyectil.elemento.remove();
}
function derrotarEnemigo(enemigo) {
  enemigo.muerto = true;
  enemigo.elemento.classList.add('derrotado');
  sumarPuntos(enemigo.tipo === 'jinete' ? 350 : 250);
  crearImpacto(enemigo.x + (enemigo.tipo === 'jinete' ? 80 : 58), 66, true);
  mostrarMensaje('¡Enemigo derrotado! + puntos');
  contadorMuertesEnemigo += 1;
  // Si Sarmiento está herido, algunos enemigos dejan un botiquín al caer.
  if (vidas < VIDAS_MAXIMAS && (contadorMuertesEnemigo % 2 === 0 || vidas === 1)) {
    window.setTimeout(() => {
      if (!nivelCompletado && !juegoTerminado) crearRecolectable({ tipo: 'botiquin', x: enemigo.x + 20, y: 22, w: 48, h: 38, cura: 1, requiereAltura: false });
    }, 150);
  }
  window.setTimeout(() => enemigo.elemento.remove(), 370);
}
function actualizarProyectiles(dt, deltaMs) {
  for (const p of proyectiles) {
    if (p.eliminado) continue;
    p.vidaMs += deltaMs;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy -= 0.12 * dt;
    p.elemento.style.left = `${p.x}px`;
    p.elemento.style.bottom = `${obtenerSuelo() + p.y}px`;
    if (p.x < -60 || p.x > ANCHO_MUNDO + 60 || p.y < -5 || p.vidaMs > 1600) { eliminarProyectil(p); continue; }
    const objetivo = enemigos.find((e) => !e.muerto && distanciaSolapada(p.x, p.x + 27, e.x + 16, e.x + (e.tipo === 'jinete' ? 145 : 105)) && p.y + 13 > e.y + 18 && p.y < e.y + (e.tipo === 'jinete' ? 124 : 111));
    if (objetivo) {
      eliminarProyectil(p);
      objetivo.vida = Math.max(0, objetivo.vida - 1);
      objetivo.barraInterior.style.width = `${(objetivo.vida / 3) * 100}%`;
      objetivo.elemento.classList.remove('herido');
      void objetivo.elemento.offsetWidth;
      objetivo.elemento.classList.add('herido');
      crearImpacto(p.x, p.y, objetivo.vida === 0);
      if (objetivo.vida === 0) derrotarEnemigo(objetivo);
      else mostrarMensaje(`Impacto confirmado: enemigo ${objetivo.vida}/3 golpes restantes.`);
    }
  }
  for (let i = proyectiles.length - 1; i >= 0; i--) if (proyectiles[i].eliminado) proyectiles.splice(i, 1);
  for (let i = efectos.length - 1; i >= 0; i--) {
    if (performance.now() - efectos[i].creado > 320) { efectos[i].elemento.remove(); efectos.splice(i, 1); }
  }
}

function actualizarJugador(dt) {
  const anteriorX = jugadorX;
  const piesXAntes = jugadorX + ANCHO_JUGADOR * 0.52;
  const moviendo = (moverDerecha !== moverIzquierda);

  if (moverDerecha && !moverIzquierda) direccionJugador = 1;
  if (moverIzquierda && !moverDerecha) direccionJugador = -1;

  if (enSuelo && plataformaActual) {
    const nuevoX = jugadorX + (moverDerecha && !moverIzquierda ? VELOCIDAD_JUGADOR * dt : moverIzquierda && !moverDerecha ? -VELOCIDAD_JUGADOR * dt : 0);
    const nuevaPlataforma = plataformaBajoJugador(nuevoX + ANCHO_JUGADOR * 0.52);
    if (nuevaPlataforma && nuevaPlataforma === plataformaActual) {
      jugadorX = nuevoX;
      jugadorY = plataformaActual.h;
    } else {
      plataformaActual = null;
      enSuelo = false;
      velocidadY = 0;
      jugadorX = nuevoX;
    }
  } else {
    if (moverDerecha && !moverIzquierda) jugadorX += VELOCIDAD_JUGADOR * dt;
    if (moverIzquierda && !moverDerecha) jugadorX -= VELOCIDAD_JUGADOR * dt;
  }
  jugadorX = limitar(jugadorX, 0, ANCHO_MUNDO - ANCHO_JUGADOR);

  let centro = jugadorX + ANCHO_JUGADOR * 0.52;
  const supActual = superficieMonticuloEn(centro);
  // Sobre una pendiente se desliza si el usuario suelta las teclas.
  if (enSuelo && !plataformaActual && supActual.monticulo && (supActual.fraccion < 0.3 || supActual.fraccion > 0.7)) {
    const haciaAbajo = supActual.fraccion < 0.3 ? -1 : 1;
    if (!moviendo) jugadorX += haciaAbajo * 1.35 * dt;
    else if (direccionJugador === haciaAbajo) jugadorX += haciaAbajo * 0.85 * dt;
    jugadorX = limitar(jugadorX, 0, ANCHO_MUNDO - ANCHO_JUGADOR);
    centro = jugadorX + ANCHO_JUGADOR * 0.52;
  }

  const nuevaCaja = plataformaBajoJugador(centro);
  if (enSuelo && nuevaCaja && !plataformaActual && jugadorY <= nuevaCaja.h + 8 && Math.abs(jugadorY - nuevaCaja.h) < 8) {
    plataformaActual = nuevaCaja;
    jugadorY = nuevaCaja.h;
  }

  const superficie = superficieEnX(centro);
  if (enSuelo && !plataformaActual) {
    const deltaSuperficie = superficie - jugadorY;
    if (deltaSuperficie >= -2 && deltaSuperficie <= Math.max(12, VELOCIDAD_JUGADOR * dt * 2.5)) {
      jugadorY = superficie;
      velocidadY = 0;
    } else if (deltaSuperficie < -2 || deltaSuperficie > Math.max(12, VELOCIDAD_JUGADOR * dt * 2.5)) {
      enSuelo = false;
      velocidadY = 0;
    }
  }

  if (!enSuelo) {
    const yAnterior = jugadorY;
    velocidadY -= GRAVEDAD * dt;
    jugadorY += velocidadY * dt;
    const xCentro = jugadorX + ANCHO_JUGADOR * 0.52;
    const plataforma = plataformaBajoJugador(xCentro);
    if (velocidadY <= 0 && plataforma && yAnterior >= plataforma.h && jugadorY <= plataforma.h) {
      jugadorY = plataforma.h;
      velocidadY = 0;
      enSuelo = true;
      plataformaActual = plataforma;
    } else {
      const alturaDuna = superficieEnX(xCentro);
      if (velocidadY <= 0 && yAnterior >= alturaDuna && jugadorY <= alturaDuna) {
        jugadorY = alturaDuna;
        velocidadY = 0;
        enSuelo = true;
        plataformaActual = null;
      } else if (jugadorY <= 0) {
        jugadorY = 0;
        velocidadY = 0;
        enSuelo = true;
        plataformaActual = null;
      }
    }
  }

  // Al salir de una plataforma, o de la cima de una duna, se cae de forma natural.
  if (jugadorY < -24) {
    jugadorY = 0;
    velocidadY = 0;
    enSuelo = true;
    plataformaActual = null;
    recibirDanio('¡Caíste de la plataforma!');
  }

  personaje.style.left = `${jugadorX}px`;
  personaje.style.bottom = `${obtenerSuelo() + Math.max(0, jugadorY)}px`;
  personaje.classList.toggle('saltando', !enSuelo);
  actualizarAnimacionSarmiento(Math.abs(jugadorX - anteriorX) > 0.15);
}
function saltar() {
  if (juegoPausado || juegoTerminado || nivelCompletado || !enSuelo) return;
  enSuelo = false;
  plataformaActual = null;
  velocidadY = FUERZA_SALTO;
  animacionSarmiento.estado = 'run';
}

function actualizarEnemigos(dt, ahora) {
  enemigos.forEach((enemigo) => {
    if (enemigo.muerto) return;
    const anchoEnemigo = enemigo.tipo === 'jinete' ? 150 : 108;
    const centroEnemigo = enemigo.x + anchoEnemigo * 0.5;
    const centroJugador = jugadorX + ANCHO_JUGADOR * 0.5;
    const dx = centroJugador - centroEnemigo;
    if (Math.abs(dx) < 800) {
      if (Math.abs(dx) > 58) enemigo.x += Math.sign(dx) * enemigo.velocidad * dt;
    } else {
      enemigo.x += enemigo.dirPatrulla * enemigo.velocidad * 0.58 * dt;
      if (enemigo.x < enemigo.baseX - 68) enemigo.dirPatrulla = 1;
      if (enemigo.x > enemigo.baseX + 68) enemigo.dirPatrulla = -1;
    }
    enemigo.x = limitar(enemigo.x, 0, ANCHO_MUNDO - anchoEnemigo);
    enemigo.elemento.style.left = `${enemigo.x}px`;
    enemigo.elemento.style.bottom = `${obtenerSuelo()}px`;
    // Los sprites de la hoja miran hacia la izquierda; se espejan solo cuando van a la derecha.
    enemigo.elemento.style.transform = dx < 0 ? 'scaleX(-1)' : 'none'; // los sprites base miran a la derecha
    if (ahora - enemigo.ultimoCambio >= (enemigo.tipo === 'jinete' ? 130 : 105)) {
      enemigo.ultimoCambio = ahora;
      enemigo.frame = (enemigo.frame + 1) % enemigo.frames;
      enemigo.imagen.src = asset(`${enemigo.archivo}${enemigo.frame + 1}.png`);
    }
    const jugadorIzq = jugadorX + 31;
    const jugadorDer = jugadorX + ANCHO_JUGADOR - 23;
    const enemigoIzq = enemigo.x + (enemigo.tipo === 'jinete' ? 20 : 14);
    const enemigoDer = enemigo.x + (enemigo.tipo === 'jinete' ? 144 : 110);
    if (distanciaSolapada(jugadorIzq, jugadorDer, enemigoIzq, enemigoDer) && jugadorY < 32 && ahora - enemigo.ultimoContacto > 550) {
      enemigo.ultimoContacto = ahora;
      recibirDanio(enemigo.tipo === 'jinete' ? '¡El jinete te atropelló!' : '¡Un perseguidor te alcanzó! Saltá o defendete con Q.');
    }
  });
}

function actualizarObstaculos(ahora) {
  for (const obj of obstaculos) {
    const colisionX = distanciaSolapada(jugadorX + 36, jugadorX + ANCHO_JUGADOR - 28, obj.x + 8, obj.x + obj.w - 7);
    if (!colisionX) {
      if (!obj.superado && jugadorX > obj.x + obj.w) { obj.superado = true; sumarPuntos(25); }
      continue;
    }
    const sobreCaja = plataformaActual && plataformaActual.obstaculo === obj;
    const alturaPeligro = obj.h * (obj.tipo === 'cart' ? 0.72 : 0.62);
    if (!sobreCaja && jugadorY < alturaPeligro && ahora > obj.golpeadoHasta && !juegoTerminado && !nivelCompletado) {
      obj.golpeadoHasta = ahora + 700;
      const desdeDerecha = jugadorX > obj.x;
      jugadorX = limitar(jugadorX + (desdeDerecha ? 42 : -42), 0, ANCHO_MUNDO - ANCHO_JUGADOR);
      personaje.style.left = `${jugadorX}px`;
      recibirDanio(`¡Cuidado con ${obj.nombre}! Saltá para pasarlo.`);
    }
  }
}

function colisionRecolectable(item) {
  if (item.recogido) return false;
  const centroJugadorX = jugadorX + ANCHO_JUGADOR * 0.5;
  const centroJugadorY = jugadorY + ALTO_JUGADOR * 0.48;
  const centroItemX = item.x + item.w * 0.5;
  const centroItemY = item.currentY + item.h * 0.5;
  if (Math.abs(centroJugadorX - centroItemX) > ANCHO_JUGADOR * 0.5 + item.w * 0.5 - 10) return false;
  if (Math.abs(centroJugadorY - centroItemY) > ALTO_JUGADOR * 0.5 + item.h * 0.5 - 24) return false;
  if (item.requiereAltura) {
    const alturaActual = plataformaActual ? plataformaActual.h : superficieEnX(centroJugadorX);
    if (alturaActual < (item.alturaMinima || 45) || jugadorY < Math.max(24, (item.alturaMinima || 45) - 8)) return false;
  }
  return true;
}
function recoger(item) {
  if (item.recogido) return;
  item.recogido = true;
  item.elemento.classList.add('recogido');
  if (item.tipo === 'cantimplora') {
    hidratacion = Math.min(100, hidratacion + 42);
    sumarPuntos(item.valor || 45);
    actualizarHidratacion();
    mostrarMensaje('¡Agua recuperada! + hidratación');
  } else if (item.tipo === 'bolsa') {
    sumarPuntos(item.valor || 100);
    mostrarMensaje('¡Encontraste provisiones! +100 puntos');
  } else if (item.tipo === 'botiquin') {
    const anteriores = vidas;
    vidas = Math.min(VIDAS_MAXIMAS, vidas + (item.cura || 1));
    actualizarVidas();
    sumarPuntos(75);
    mostrarMensaje(vidas > anteriores ? '¡Botiquín recogido! Recuperaste una vida.' : 'Botiquín recogido: ya tenés todas las vidas. +75 puntos');
  }
  window.setTimeout(() => item.elemento.remove(), 260);
}
function actualizarRecolectables(dt, ahora) {
  for (const item of coleccionables) {
    if (item.recogido) continue;
    item.currentY = item.baseY + Math.sin((ahora - item.creado) / 235) * 7;
    item.elemento.style.left = `${item.x}px`;
    item.elemento.style.bottom = `${obtenerSuelo() + item.currentY}px`;
    if (colisionRecolectable(item)) recoger(item);
  }
  for (let i = coleccionables.length - 1; i >= 0; i--) {
    if (coleccionables[i].recogido && !coleccionables[i].elemento.isConnected) coleccionables.splice(i, 1);
  }
}

function recibirDanio(motivo) {
  const ahora = performance.now();
  if (ahora < invulnerableHasta || juegoTerminado || nivelCompletado) return;
  vidas = Math.max(0, vidas - 1);
  invulnerableHasta = ahora + 1250;
  actualizarVidas();
  personaje.classList.add('daño');
  window.setTimeout(() => personaje.classList.remove('daño'), 780);
  mostrarMensaje(motivo || '¡Perdiste una vida!');
  if (vidas <= 0) terminarJuego(false);
}
function actualizarVidas() {
  if (!elVidas) return;
  [...elVidas.children].forEach((corazon, i) => corazon.classList.toggle('perdido', i >= vidas));
  elVidas.setAttribute('aria-label', `${vidas} de ${VIDAS_MAXIMAS} vidas restantes`);
}
function actualizarPuntos() { if (elPuntos) elPuntos.textContent = String(puntos).padStart(5, '0'); }
function sumarPuntos(cantidad) { puntos += cantidad; actualizarPuntos(); }
function actualizarHidratacion() {
  hidratacion = limitar(hidratacion, 0, 100);
  if (elHidratacion) elHidratacion.textContent = `${Math.ceil(hidratacion)}%`;
  if (barraHidratacion) {
    barraHidratacion.style.width = `${hidratacion}%`;
    barraHidratacion.style.filter = hidratacion < 25 ? 'hue-rotate(115deg) saturate(1.3)' : '';
  }
}
function actualizarTiempo(dtMs) {
  tiempoTranscurrido += dtMs;
  const total = Math.floor(tiempoTranscurrido / 1000);
  elTiempo.textContent = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  hidratacion = Math.max(0, hidratacion - dtMs * 0.0006075); // 35 % más rápido: ~0,61 % por segundo
  actualizarHidratacion();
  if (hidratacion <= 0) {
    tiempoSeco += dtMs;
    if (tiempoSeco >= 8500) { tiempoSeco = 0; recibirDanio('La sed te está debilitando. Buscá una cantimplora.'); }
  } else tiempoSeco = 0;
}
function mostrarMensaje(texto) {
  if (!mensajeJuego) return;
  mensajeJuego.textContent = texto;
  mensajeJuego.classList.add('visible');
  window.clearTimeout(mensajeTimeout);
  mensajeTimeout = window.setTimeout(() => mensajeJuego.classList.remove('visible'), 1600);
}
function actualizarCamara() {
  const anchoVista = escenario.clientWidth || window.innerWidth;
  camaraX = limitar(jugadorX - anchoVista * 0.34, 0, ANCHO_MUNDO - anchoVista);
  mundo.style.transform = `translate3d(${-camaraX}px,0,0)`;
  fondoParallax.style.backgroundPositionX = `${-camaraX * 0.24}px`;
}
function comprobarMeta() {
  if (!nivelCompletado && jugadorX + ANCHO_JUGADOR * 0.72 >= META_X) terminarNivel();
}
function terminarNivel() {
  if (nivelCompletado || juegoTerminado) return;
  nivelCompletado = true;
  juegoPausado = false;
  moverIzquierda = false;
  moverDerecha = false;
  if (musicaNivel2) musicaNivel2.pause();
  sumarPuntos(Math.max(0, 500 - Math.floor(tiempoTranscurrido / 1000)));
  $('puntajeFinal').textContent = String(puntos).padStart(5, '0');
  transicionPulperia.classList.add('visible');
  transicionPulperia.setAttribute('aria-hidden', 'false');
}
function terminarJuego(victoria) {
  if (juegoTerminado || nivelCompletado) return;
  juegoTerminado = true;
  juegoPausado = false;
  moverIzquierda = false;
  moverDerecha = false;
  if (musicaNivel2) musicaNivel2.pause();
  if (!victoria) {
    pantallaGameOver.classList.add('visible');
    pantallaGameOver.setAttribute('aria-hidden', 'false');
  }
}

let preferenciasPausa = { volumen: 100, musica: true, sonido: true };
function leerPreferenciasPausa() {
  try {
    const guardadas = localStorage.getItem('configuracionEscapeChile');
    if (guardadas) preferenciasPausa = { ...preferenciasPausa, ...JSON.parse(guardadas) };
  } catch (error) { /* El nivel no depende del almacenamiento local. */ }
  preferenciasPausa.volumen = limitar(Number(preferenciasPausa.volumen) || 0, 0, 100);
  if (pausaVolumen) pausaVolumen.value = String(preferenciasPausa.volumen);
  if (pausaValorVolumen) pausaValorVolumen.textContent = `${preferenciasPausa.volumen}%`;
  if (pausaMusica) pausaMusica.textContent = preferenciasPausa.musica ? 'ACTIVADA' : 'DESACTIVADA';
  if (pausaSonido) pausaSonido.textContent = preferenciasPausa.sonido ? 'ACTIVADOS' : 'DESACTIVADOS';
  aplicarMusicaNivel2();
}
function guardarPreferenciasPausa() {
  try { localStorage.setItem('configuracionEscapeChile', JSON.stringify(preferenciasPausa)); }
  catch (error) { /* La partida sigue disponible si el navegador restringe el almacenamiento. */ }
}
function aplicarMusicaNivel2() {
  if (!musicaNivel2) return;
  musicaNivel2.volume = limitar(Number(preferenciasPausa.volumen) || 0, 0, 100) / 100;
  if (preferenciasPausa.musica && !juegoPausado && !juegoTerminado && !nivelCompletado) musicaNivel2.play().catch(() => {});
  else musicaNivel2.pause();
}
function abrirPausa() {
  if (juegoTerminado || nivelCompletado || juegoPausado) return;
  juegoPausado = true;
  moverIzquierda = false;
  moverDerecha = false;
  if (musicaNivel2) musicaNivel2.pause();
  leerPreferenciasPausa();
  menuPausa.classList.add('visible');
  menuPausa.setAttribute('aria-hidden', 'false');
}
function cerrarPausa() {
  if (!juegoPausado || juegoTerminado || nivelCompletado) return;
  juegoPausado = false;
  menuPausa.classList.remove('visible');
  menuPausa.setAttribute('aria-hidden', 'true');
  ultimoFrame = 0;
  aplicarMusicaNivel2();
}
function alternarPausa() {
  if (!nivel2Listo) return;
  if (juegoPausado) cerrarPausa(); else abrirPausa();
}
function volverMenu() {
  if (musicaNivel2) musicaNivel2.pause();
  window.location.href = '../inicio/inicio.html#menu';
}
function reiniciarNivel() { window.location.reload(); }
function continuarParte2() {
  if (musicaNivel2) musicaNivel2.pause();
  window.location.href = '../nivel4/nivel4.html';
}

pausaVolumen?.addEventListener('input', () => {
  preferenciasPausa.volumen = Number(pausaVolumen.value);
  if (pausaValorVolumen) pausaValorVolumen.textContent = `${preferenciasPausa.volumen}%`;
  guardarPreferenciasPausa();
  aplicarMusicaNivel2();
});
pausaMusica?.addEventListener('click', () => {
  preferenciasPausa.musica = !preferenciasPausa.musica;
  pausaMusica.textContent = preferenciasPausa.musica ? 'ACTIVADA' : 'DESACTIVADA';
  guardarPreferenciasPausa();
  aplicarMusicaNivel2();
});
pausaSonido?.addEventListener('click', () => {
  preferenciasPausa.sonido = !preferenciasPausa.sonido;
  pausaSonido.textContent = preferenciasPausa.sonido ? 'ACTIVADOS' : 'DESACTIVADOS';
  guardarPreferenciasPausa();
});
pausaPantallaCompleta?.addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
  else document.exitFullscreen?.().catch(() => {});
});
botonPausa.addEventListener('click', alternarPausa);
$('continuarJuego').addEventListener('click', cerrarPausa);
$('reiniciarNivel').addEventListener('click', reiniciarNivel);
$('volverMenuPrincipal').addEventListener('click', volverMenu);
$('reintentar').addEventListener('click', reiniciarNivel);
$('volverMenuGameOver').addEventListener('click', volverMenu);
$('continuarParte2').addEventListener('click', continuarParte2);
$('volverMenuVictoria').addEventListener('click', volverMenu);

function mantenerBoton(id, alPulsar, alSoltar) {
  const boton = $(id);
  if (!boton) return;
  const soltar = (evento) => { if (evento) evento.preventDefault(); alSoltar(); };
  boton.addEventListener('pointerdown', (evento) => {
    evento.preventDefault();
    try { boton.setPointerCapture(evento.pointerId); } catch (error) { /* Algunos dispositivos no exponen captura. */ }
    alPulsar();
  });
  boton.addEventListener('pointerup', soltar);
  boton.addEventListener('pointercancel', soltar);
  boton.addEventListener('lostpointercapture', alSoltar);
  boton.addEventListener('pointerleave', (evento) => { if (evento.buttons === 0) alSoltar(); });
}

mantenerBoton('btnIzquierda', () => { if (!juegoPausado) moverIzquierda = true; }, () => { moverIzquierda = false; });
mantenerBoton('btnDerecha', () => { if (!juegoPausado) moverDerecha = true; }, () => { moverDerecha = false; });
$('btnSaltar').addEventListener('pointerdown', (evento) => { evento.preventDefault(); saltar(); });
$('btnLanzar').addEventListener('pointerdown', (evento) => { evento.preventDefault(); lanzarPiedrita(); });

window.addEventListener('keydown', (evento) => {
  if (!nivel2Listo) { evento.preventDefault(); return; }
  const tecla = evento.key.toLowerCase();
  if (evento.key === 'Escape') {
    evento.preventDefault();
    alternarPausa();
    return;
  }
  if (juegoPausado || juegoTerminado || nivelCompletado) return;
  if (evento.key === 'ArrowRight' || tecla === 'd') { evento.preventDefault(); moverDerecha = true; }
  else if (evento.key === 'ArrowLeft' || tecla === 'a') { evento.preventDefault(); moverIzquierda = true; }
  else if (evento.code === 'Space' || evento.key === 'ArrowUp' || tecla === 'w') { evento.preventDefault(); saltar(); }
  else if (tecla === 'q' && !evento.repeat) { evento.preventDefault(); lanzarPiedrita(); }
}, { passive: false });
window.addEventListener('keyup', (evento) => {
  const tecla = evento.key.toLowerCase();
  if (evento.key === 'ArrowRight' || tecla === 'd') moverDerecha = false;
  if (evento.key === 'ArrowLeft' || tecla === 'a') moverIzquierda = false;
});
window.addEventListener('blur', () => { moverIzquierda = false; moverDerecha = false; });
document.addEventListener('visibilitychange', () => { if (document.hidden) { moverIzquierda = false; moverDerecha = false; } });
// El sonido se inicia solo tras una interacción del usuario, por las políticas del navegador.
document.addEventListener('pointerdown', () => { if (!juegoPausado && preferenciasPausa.musica) aplicarMusicaNivel2(); }, { passive: true });


function iniciarSecuenciaNivel2() {
  if (nivel2Listo || !introNivel2 || !cargaNivel2 || !transicionNivel2) return;
  introNivel2.classList.remove('pampas-visible');
  cargaNivel2.classList.add('visible');
  const barra = $('progresoCargaNivel2');
  const porcentaje = $('porcentajeCargaNivel2');
  const inicio = performance.now();
  const duracion = 3200;
  function actualizarCarga(ahora) {
    const avance = Math.min(1, (ahora - inicio) / duracion);
    const valor = Math.round(avance * 100);
    if (barra) barra.style.width = valor + '%';
    if (porcentaje) porcentaje.textContent = valor + '%';
    if (avance < 1) requestAnimationFrame(actualizarCarga);
    else {
      cargaNivel2.classList.remove('visible');
      transicionNivel2.classList.add('visible');
      window.setTimeout(() => {
        transicionNivel2.classList.remove('visible');
        transicionNivel2.setAttribute('aria-hidden','true');
        introNivel2.setAttribute('aria-hidden','true');
        nivel2Listo = true;
        juegoPausado = false;
        ultimoFrame = 0;
        aplicarMusicaNivel2();
        mostrarMensaje('¡La llanura te espera! A/D: moverte · ESPACIO: saltar · Q: piedritas');
      }, 850);
    }
  }
  requestAnimationFrame(actualizarCarga);
}
$('comenzarNivel2')?.addEventListener('click', iniciarSecuenciaNivel2);

function gameLoop(timestamp) {
  if (juegoTerminado || nivelCompletado) return;
  if (!ultimoFrame) ultimoFrame = timestamp;
  const deltaMs = Math.min(42, Math.max(0, timestamp - ultimoFrame));
  ultimoFrame = timestamp;
  const dt = deltaMs / 16.6667;
  if (!juegoPausado) {
    actualizarJugador(dt);
    actualizarObstaculos(timestamp);
    actualizarEnemigos(dt, timestamp);
    actualizarProyectiles(dt, deltaMs);
    actualizarRecolectables(dt, timestamp);
    actualizarTiempo(deltaMs);
    actualizarCamara();
    comprobarMeta();
  }
  window.requestAnimationFrame(gameLoop);
}

leerPreferenciasPausa();
inicializarMundo();
actualizarCamara();
mostrarMensaje('A/D o flechas: moverte · ESPACIO: saltar · Q: lanzar piedritas');
window.requestAnimationFrame(gameLoop);
