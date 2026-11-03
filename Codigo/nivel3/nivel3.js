'use strict';
(() => {
  const $ = (id) => document.getElementById(id);
  const arena = $('campoPulperia');
  const playerEl = $('facundo');
  const playerImg = $('facundoSprite');
  const enemiesEl = $('enemigos');
  const pickupsEl = $('coleccionables');
  const effectsEl = $('efectos');
  const music = $('musicaPulperia');
  const GROUND = 38;
  const TARGET = 30;
  const DURATION = 90;
  const runFacundo = [1,2,3,4].map(n => `../img/pulperia/facundo_run_${n}.png`);
  const attackFacundo = [1,2,3,4].map(n => `../img/pulperia/facundo_attack_${n}.png`);
  const runFederal = [1,2,3,4,5].map(n => `../img/pulperia/federal_sable_run_${n}.png`);
  const attackFederal = [1,2,3,4].map(n => `../img/pulperia/federal_sable_attack_${n}.png`);
  const runGaucho = [1,2,3,4].map(n => `../img/pulperia/federal_gaucho_${n}.png`);
  const runPistolero = [1,2,3,4].map(n => `../img/pulperia/federal_pistolero_${n}.png`);
  const runManta = [1,2,3,4,5,6].map(n => `../img/pulperia/federal_manta_run_${n}.png`);
  const story = [
    {sello:'CRÓNICAS DE LAS PROVINCIAS · 1835',kicker:'CAPÍTULO III',title:'LA PULPERÍA',text:'Al caer la tarde, una pulpería recibe viajeros, rumores y hombres armados. Bajo la luz de los faroles, las disputas de la época también se juegan a puerta cerrada.'},
    {sello:'LA RIOJA · TIERRAS FEDERALES',kicker:'EL TIGRE DE LOS LLANOS',title:'FACUNDO QUIROGA',text:'Juan Facundo Quiroga (1788–1835), caudillo federal riojano, ganó influencia durante las guerras civiles que dividieron a las Provincias Unidas del Río de la Plata.'},
    {sello:'UNA ÉPOCA EN GUERRA',kicker:'PODER Y LEALTADES',title:'RUMORES EN EL CAMINO',text:'Su figura despertaba adhesiones y temor. Las disputas políticas no eran abstractas: atravesaban los caminos, los pueblos y lugares de encuentro como esta pulpería.'},
    {sello:'BARRANCA YACO · 16 DE FEBRERO DE 1835',kicker:'EL DESTINO SE ACERCA',title:'UNA LEYENDA COBRA VIDA',text:'Quiroga fue asesinado en una emboscada en Barranca Yaco, Córdoba. Esta arena de combate es una recreación ficticia: por un instante, la memoria de Facundo toma el cuerpo de Sarmiento y vuelve a luchar.'}
  ];
  let storyIndex = 0;
  let rafId = 0, lastFrame = 0, running = false, paused = false, ended = false, cinematic = true, transforming = false;
  let arenaWidth = 0, arenaHeight = 0, playerX = 160, playerY = 0, playerVy = 0, facing = 1;
  let moveLeft = false, moveRight = false, playerMoving = false;
  let playerHealth = 5, kills = 0, score = 0, timeLeft = DURATION, spawnClock = .6, spawnCount = 0, enemyId = 0;
  let animClock = 0, attackKind = '', attackRemaining = 0, attackFrameClock = 0;
  let lightCooldown = 0, heavyCooldown = 0, specialCooldown = 0, dashCooldown = 0, dashRemaining = 0, invulnRemaining = 0;
  let messageClock = 0, elapsed = 0;
  const enemies = [], pickups = [], sparks = [];
  let settings = {volume:70,music:true,sound:true};
  let audioCtx = null;
  const timeEl = $('tiempo');
  const killsEl = $('kills');
  const progressEl = $('progresoKills');
  const hpEl = $('vidaFacundo');
  const pauseMenu = $('menuPausa');
  const cine = $('cinematica');
  const transform = $('transformacion');

  // Preload all local frame crops so transitions remain smooth.
  [...runFacundo,...attackFacundo,...runFederal,...attackFederal,...runGaucho,...runPistolero,...runManta,
    ...Array.from({length:5},(_,i)=>`../img/sarmiento_anim/transition_${i+1}.png`)].forEach(src => { const im = new Image(); im.src = src; });
  function playFx(kind='slash') {
    if (!settings.sound) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtx) audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const config = kind === 'hurt' ? [145,82,.17,'sawtooth'] : kind === 'hit' ? [620,260,.10,'square'] : kind === 'heavy' ? [170,74,.22,'sawtooth'] : kind === 'special' ? [260,880,.36,'triangle'] : [410,190,.12,'sawtooth'];
      osc.type = config[3]; osc.frequency.setValueAtTime(config[0], now);
      if (config[1] !== config[0]) osc.frequency.exponentialRampToValueAtTime(Math.max(35,config[1]), now + config[2]);
      gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(Math.max(.004, (settings.volume / 100) * .035), now + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, now + config[2]);
      osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + config[2] + .02);
    } catch (_) { /* El audio es decorativo; no debe interrumpir la partida. */ }
  }
  function preloadDecorDust() {
    const dust = $('destellosAmbiente');
    for (let i=0;i<22;i++) {
      const dot = document.createElement('i'); dot.className='polvo';
      dot.style.setProperty('--x', `${3+(i*37)%94}%`);
      dot.style.setProperty('--y', `${12+(i*23)%65}%`);
      dot.style.setProperty('--dur', `${3.8+(i%7)*.55}s`);
      dot.style.animationDelay = `${-(i%8)*.48}s`;
      dust.appendChild(dot);
    }
  }
  function showMessage(text, seconds=1.6, target='avisoJuego') {
    const el=$(target); el.textContent=text; el.classList.add('visible');
    if (target==='avisoJuego') messageClock=seconds;
    else window.setTimeout(()=>el.classList.remove('visible'), seconds*1000);
  }
  function updateStory() {
    const s=story[storyIndex];
    $('cineSello').textContent=s.sello; $('cineKicker').textContent=s.kicker;
    $('tituloCine').textContent=s.title; $('textoCine').textContent=s.text;
    $('cinePaso').textContent=String(storyIndex+1).padStart(2,'0');
    $('cineProgreso').style.width=`${(storyIndex+1)/story.length*100}%`;
    $('cineSiguiente').innerHTML=storyIndex===story.length-1?'VER LA TRANSFORMACIÓN <span>✦</span>':'CONTINUAR <span>→</span>';
  }
  function advanceStory() {
    if (!cinematic || transforming) return;
    if (storyIndex < story.length-1) { storyIndex++; updateStory(); }
    else startTransformation();
  }
  function startTransformation() {
    if (transforming || !cinematic) return;
    transforming=true; cinematic=false;
    cine.classList.remove('visible');
    transform.classList.add('visible'); transform.setAttribute('aria-hidden','false');
    const sarmiento=$('sarmientoTransformacion'), fac=$('facundoTransformacion'), flash=$('transformacionFlash');
    let frame=1; sarmiento.classList.remove('se-desvanece'); fac.classList.remove('aparece');
    sarmiento.src=`../img/sarmiento_anim/transition_${frame}.png`;
    const transTimer=window.setInterval(()=>{ frame=frame%5+1; sarmiento.src=`../img/sarmiento_anim/transition_${frame}.png`; },230);
    window.setTimeout(()=>{ sarmiento.classList.add('se-desvanece'); fac.classList.add('aparece'); flash.classList.add('destello'); },1350);
    window.setTimeout(()=>{ window.clearInterval(transTimer); transform.classList.remove('visible'); transform.setAttribute('aria-hidden','true'); transforming=false; startGame(); },2700);
  }
  function startGame() {
    if (running) return;
    running=true; paused=false; ended=false; timeLeft=DURATION; lastFrame=0;
    arenaWidth=arena.clientWidth; arenaHeight=arena.clientHeight;
    playerX=Math.max(40,arenaWidth*.24); playerY=0; playerVy=0; facing=1; playerHealth=5; kills=0; score=0; spawnCount=0; spawnClock=.2;
    enemies.splice(0).forEach(e=>e.el.remove()); pickups.splice(0).forEach(p=>p.el.remove()); sparks.splice(0).forEach(s=>s.el.remove());
    attackKind=''; attackRemaining=0; lightCooldown=0; heavyCooldown=0; specialCooldown=0; dashCooldown=0; dashRemaining=0; invulnRemaining=0; elapsed=0;
    updateHUD(); renderPlayer(); spawnEnemy('sable'); spawnEnemy('gaucho'); spawnClock=.85;
    music.volume=settings.volume/100;
    if (settings.music) music.play().catch(()=>{});
    showMessage('¡Facundo entra en combate! Derrotá a 30.',2.4);
    lastFrame=0; if(!rafId) rafId=requestAnimationFrame(loop);
  }
  function updateHUD() {
    const t=Math.max(0,Math.ceil(timeLeft));
    timeEl.textContent=`${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
    killsEl.textContent=String(kills).padStart(2,'0');
    progressEl.style.width=`${Math.min(100,kills/TARGET*100)}%`;
    hpEl.innerHTML=Array.from({length:5},(_,i)=>`<span class="${i<playerHealth?'':'vacio'}">♥</span>`).join(' ');
    $('barraVidaFacundo').style.width=`${playerHealth/5*100}%`;
    $('recargaRonda').textContent=specialCooldown<=0?'LISTA':`${specialCooldown.toFixed(0)}s`;
    $('btnRonda').classList.toggle('activo',specialCooldown<=0);
  }
  function getFrame(arr, frame) { return arr[Math.abs(frame)%arr.length]; }
  function setSprite(img, src) { if (img && img.getAttribute('src') !== src) img.setAttribute('src', src); }
  function renderPlayer() {
    playerEl.style.left=`${playerX}px`;
    playerEl.style.bottom=`${GROUND+playerY}px`;
    const img=playerImg;
    if (attackRemaining>0) {
      const idx=Math.min(attackFacundo.length-1,Math.floor((attackKind==='heavy'?0.36:0.29)-attackRemaining));
      const elapsedAttack = (attackKind==='special'?0:attackRemaining);
      const frameIdx=Math.min(attackFacundo.length-1,Math.floor((attackDuration(attackKind)-elapsedAttack)/.095));
      setSprite(img,getFrame(attackFacundo,Math.max(0,frameIdx)));
    } else if (dashRemaining>0) {
      setSprite(img,getFrame(runFacundo,Math.floor(animClock/0.075)));
    } else if (playerMoving || playerY>0) {
      setSprite(img,getFrame(runFacundo,Math.floor(animClock/0.115)));
    } else {
      setSprite(img,getFrame(runFacundo,Math.floor(animClock/0.55)));
    }
    img.style.transform=facing<0?'scaleX(-1)':'scaleX(1)';
    playerEl.classList.toggle('daño', invulnRemaining>0 && Math.floor(elapsed*16)%2===0);
    playerEl.classList.toggle('dash', dashRemaining>0);
    playerEl.classList.toggle('en-ataque',attackRemaining>0);
    playerEl.classList.toggle('mirando-izq',facing<0);
    playerEl.style.setProperty('--slash-dir',facing>0?'1':'-1');
  }
  function attackDuration(kind) { return kind==='heavy'?.45:kind==='special'?.58:.32; }
  function createEnemy(type) {
    if (spawnCount>=45 || enemies.filter(e=>!e.dead).length>=8 || ended) return;
    const id=++enemyId; spawnCount++;
    const el=document.createElement('div'); el.className=`actor enemigo enemy-${type}`; el.dataset.id=String(id);
    const img=document.createElement('img'); img.alt='Federal armado'; img.draggable=false;
    const health=document.createElement('div'); health.className='vida-enemigo'; const bar=document.createElement('span'); health.appendChild(bar);
    el.append(img,health); enemiesEl.appendChild(el);
    let edge;
    if (spawnCount<=2) edge=spawnCount===1?'right':'left'; else edge=Math.random()<.5?'left':'right';
    const x=edge==='left'?Math.max(0,15+Math.random()*90):Math.max(0,arenaWidth-105-Math.random()*90);
    const typeFrames=type==='gaucho'?runGaucho:(type==='pistolero'?runPistolero:(type==='manta'?runManta:runFederal));
    const maxHp=(spawnCount%6===0)?2:1;
    const e={id,type,el,img,bar,x,y:0,facing:-1,hp:maxHp,maxHp,dead:false,speed:58+Math.random()*27,anim:Math.random()*1.1,phase:'run',phaseTime:0,attackCooldown:.6+Math.random()*1.1,stun:0,hitFlash:0,runFrames:typeFrames,hitCooldown:0,attackIndex:0};
    el.classList.toggle('duro',maxHp>1);
    el.style.left=`${x}px`; el.style.bottom=`${GROUND}px`;
    img.src=typeFrames[0]; img.style.transform='scaleX(1)';
    if (maxHp>1) { el.title='Federal veterano: resiste dos golpes'; bar.style.width='100%'; }
    e.el=e.el; enemies.push(e); renderEnemy(e);
  }
  function spawnEnemy(type) {
    if (!type) { const r=spawnCount%8; type=(r===2||r===5)?'gaucho':(r===7?'manta':'sable'); }
    createEnemy(type);
  }
  function renderEnemy(e) {
    if (e.dead) return;
    e.el.style.left=`${e.x}px`; e.el.style.bottom=`${GROUND+e.y}px`;
    e.img.style.transform=e.facing<0?'scaleX(-1)':'scaleX(1)';
    e.el.classList.toggle('mirando-derecha',e.facing>0);
    if (e.phase==='swing') setSprite(e.img,getFrame(attackFederal,Math.floor(e.anim/.09)));
    else if (e.phase==='windup') setSprite(e.img,getFrame(attackFederal,Math.floor(e.anim/.12)));
    else setSprite(e.img,getFrame(e.runFrames,Math.floor(e.anim/.16)));
    e.el.classList.toggle('alerta',e.phase==='windup');
    e.el.classList.toggle('atacando',e.phase==='swing');
    e.el.classList.toggle('herido',e.hitFlash>0);
    e.bar.style.width=`${Math.max(0,e.hp/e.maxHp*100)}%`;
  }
  function makeEffect(x,y,kind='hit',text='') {
    const el=document.createElement('div');
    if (kind==='wave') el.className='efecto-onda';
    else if (kind==='dust') el.className='efecto-polvo';
    else if (kind==='number') { el.className='efecto-numerito'; el.textContent=text; }
    else el.className='efecto-impacto';
    el.style.left=`${x-(kind==='wave'?90:kind==='number'?8:33)}px`;
    el.style.bottom=`${GROUND+y-(kind==='wave'?90:kind==='number'?0:33)}px`;
    effectsEl.appendChild(el); sparks.push({el,life:kind==='wave'?.58:.4});
  }
  function popMessage(text) { showMessage(text,1.15,'avisoHabilidad'); }
  function attack(kind) {
    if (!running||paused||ended||transforming||cinematic) return;
    if (kind==='light'&&lightCooldown>0 || kind==='heavy'&&heavyCooldown>0 || kind==='special'&&specialCooldown>0) return;
    attackKind=kind; attackRemaining=attackDuration(kind); attackFrameClock=0;
    playFx(kind==='special'?'special':kind==='heavy'?'heavy':'slash');
    if (kind==='light') lightCooldown=.30;
    if (kind==='heavy') heavyCooldown=.86;
    if (kind==='special') { specialCooldown=12; dashRemaining=0; popMessage('¡RONDA FEDERAL!'); }
    const reach=kind==='light'?128:kind==='heavy'?158:200;
    const yAllow=kind==='special'?210:kind==='heavy'?135:105;
    const candidates=enemies.filter(e=>!e.dead&&Math.abs(e.y-playerY)<yAllow&&Math.abs(e.x-playerX)<reach && (kind==='special'||(facing>0?e.x-playerX>-30:e.x-playerX<30)));
    if (kind==='special') makeEffect(playerX+55*facing,playerY+40,'wave');
    else makeEffect(playerX+facing*(kind==='heavy'?90:76),playerY+42,'hit');
    let hitCount=0;
    candidates.forEach(e=>{
      const damage=kind==='heavy'?2:1;
      damageEnemy(e,damage,kind==='special'?1.3:kind==='heavy'?.65:.08);
      if(kind==='special') { e.phase='stun';e.stun=1.25;e.anim=0; }
      hitCount++;
    });
    if (hitCount===0) { if(kind==='special') popMessage('La ronda no alcanzó a nadie.'); }
    else if (hitCount>1) popMessage(`${hitCount} federales alcanzados`);
    renderPlayer();
  }
  function damageEnemy(e,damage,stun) {
    if(e.dead) return;
    e.hp-=damage; e.hitFlash=.22; e.stun=Math.max(e.stun,stun); e.x+=e.x>playerX?18:-18; playFx('hit');
    makeEffect(e.x+40,42,'hit'); makeEffect(e.x+36,73,'number',damage>1?'−2':'−1');
    e.bar.style.width=`${Math.max(0,e.hp/e.maxHp*100)}%`;
    if(e.hp<=0) defeatEnemy(e);
    else { e.el.classList.add('herido'); setTimeout(()=>e.el?.classList.remove('herido'),180); }
  }
  function defeatEnemy(e) {
    if(e.dead)return; e.dead=true; kills=Math.min(TARGET,kills+1); score+=100; e.el.classList.add('caido');
    makeEffect(e.x+42,45,'dust');
    setTimeout(()=>{ if(e.el.parentNode)e.el.remove(); },460);
    if(kills%4===0){const dropType=kills%24===0?'canteen':kills%20===0?'food':kills%16===0?'bottle':kills%12===0?'heal':kills%8===0?'bag':'coin';dropItem(e.x,dropType);}
    if(kills===TARGET){ updateHUD(); finishGame(true); }
    else { if(kills%5===0)showMessage(`${kills} / 30 · ¡Seguí presionando!`,1.3); updateHUD(); }
  }
  function dropItem(x,type) {
    const src=type==='heal'?'item_botiquin.png':type==='canteen'?'item_cantimplora.png':type==='bag'?'item_bolsa.png':type==='food'?'item_comida.png':type==='bottle'?'item_botella.png':'item_moneda.png';
    const el=document.createElement('div'); el.className='recolectable'; el.style.left=`${Math.max(10,Math.min(arenaWidth-60,x))}px`;
    const img=document.createElement('img'); img.src=`../img/pulperia/${src}`; img.alt=type==='heal'?'Botiquín':type==='canteen'?'Cantimplora':'Moneda';
    const label=document.createElement('span'); label.textContent=type==='heal'?'+1 VIDA':type==='canteen'?'+IMPULSO':type==='food'?'+1 VIDA':type==='bag'?'+250 PTS':type==='bottle'?'+50 PTS':'+PUNTOS'; el.append(img,label); pickupsEl.appendChild(el);
    pickups.push({el,x:Math.max(10,Math.min(arenaWidth-60,x)),type,life:9,bob:Math.random()*6});
  }
  function collectItem(p) {
    p.el.classList.add('recogido');
    if(p.type==='heal'){ if(playerHealth<5){playerHealth++;score+=30;showMessage('¡Botiquín! +1 vida.',1.5);}else{score+=100;showMessage('Vida completa: +100 puntos.',1.4);} }
    else if(p.type==='canteen'){score+=75; dashCooldown=Math.max(0,dashCooldown-1.3);lightCooldown=0;showMessage('¡Impulso! Ataque y esquiva recargados.',1.6);}
    else if(p.type==='food'){playerHealth=Math.min(5,playerHealth+1);score+=60;showMessage('Comida recogida · +1 vida y 60 puntos.',1.5);}
    else if(p.type==='bag'){score+=250;specialCooldown=Math.max(0,specialCooldown-2.5);showMessage('Botín de la pulpería · +250 puntos.',1.5);}
    else if(p.type==='bottle'){score+=50;lightCooldown=0;showMessage('Botella recogida · +50 puntos.',1.4);}
    else {score+=125;showMessage('Moneda recogida · +125 puntos.',1.3);}
    updateHUD(); setTimeout(()=>p.el.remove(),240); p.life=0;
  }
  function takeDamage(fromX) {
    if(invulnRemaining>0||dashRemaining>0||ended||paused)return;
    playerHealth=Math.max(0,playerHealth-1);invulnRemaining=1.15;playerX+=playerX<fromX?-38:38; playFx('hurt');
    playerX=Math.max(4,Math.min(arenaWidth-105,playerX)); makeEffect(playerX+52,60,'hit'); showMessage('¡Cuidado con el sable!',1.1); updateHUD();
    if(playerHealth<=0)finishGame(false);
  }
  function startDash() {
    if(!running||paused||ended||dashCooldown>0)return;
    dashRemaining=.26;dashCooldown=2.4;invulnRemaining=Math.max(invulnRemaining,.34);playerMoving=true;playFx('slash');
    playerEl.classList.add('dash'); popMessage('¡Esquiva!');
  }
  function jump() {
    if(!running||paused||ended||playerY>0)return;
    playerVy=510; playerY=1;
  }
  function updatePlayer(dt) {
    playerMoving=false;
    if(dashRemaining>0){playerX+=facing*560*dt;dashRemaining-=dt;playerMoving=true;}
    else if(moveLeft!==moveRight){facing=moveLeft?-1:1;playerX+=(moveLeft?-1:1)*280*dt;playerMoving=true;}
    const maxX=Math.max(0,arenaWidth-104);playerX=Math.max(0,Math.min(maxX,playerX));
    if(playerY>0||playerVy>0){playerY+=playerVy*dt;playerVy-=1300*dt;if(playerY<=0){playerY=0;playerVy=0;}}
    lightCooldown=Math.max(0,lightCooldown-dt);heavyCooldown=Math.max(0,heavyCooldown-dt);specialCooldown=Math.max(0,specialCooldown-dt);dashCooldown=Math.max(0,dashCooldown-dt);invulnRemaining=Math.max(0,invulnRemaining-dt);attackRemaining=Math.max(0,attackRemaining-dt);
    if(attackRemaining<=0)attackKind='';
    animClock+=dt; renderPlayer();
  }
  function updateEnemies(dt) {
    const alive=enemies.filter(e=>!e.dead);
    for(const e of alive){
      e.anim+=dt;e.attackCooldown-=dt;e.hitFlash=Math.max(0,e.hitFlash-dt);e.stun=Math.max(0,e.stun-dt);
      const dx=playerX-e.x, dist=Math.abs(dx);e.facing=dx>0?1:-1;
      if(e.stun>0){ e.phase='stun'; renderEnemy(e);continue; }
      if(e.phase==='windup'){
        e.phaseTime-=dt;
        if(e.phaseTime<=0){e.phase='swing';e.phaseTime=.28;e.attackCooldown=1.15+Math.random()*.55;e.anim=0;
          if(dist<108 && playerY<36 && invulnRemaining<=0 && dashRemaining<=0)takeDamage(e.x);
        }
      }else if(e.phase==='swing'){
        e.phaseTime-=dt;if(e.phaseTime<=0){e.phase='recover';e.phaseTime=.3;}
      }else if(e.phase==='recover'){
        e.phaseTime-=dt;if(e.phaseTime<=0)e.phase='run';
      }else{
        if(dist>70){e.x+=Math.sign(dx)*e.speed*dt;e.phase='run';}
        else if(e.attackCooldown<=0){e.phase='windup';e.phaseTime=.58;e.anim=0;}
      }
      e.x=Math.max(-35,Math.min(arenaWidth-55,e.x));renderEnemy(e);
    }
  }
  function updatePickups(dt) {
    for(let i=pickups.length-1;i>=0;i--){const p=pickups[i];p.life-=dt;p.bob+=dt*3.2;p.el.style.left=`${p.x+Math.sin(p.bob)*5}px`;p.el.style.bottom=`${GROUND+42+Math.sin(p.bob)*7}px`;
      if(Math.abs(p.x-playerX)<57&&playerY<75){collectItem(p);pickups.splice(i,1);continue;}
      if(p.life<=0){p.el.remove();pickups.splice(i,1);}
    }
    for(let i=sparks.length-1;i>=0;i--){sparks[i].life-=dt;if(sparks[i].life<=0){sparks[i].el.remove();sparks.splice(i,1);}}
  }
  function loop(now) {
    rafId=requestAnimationFrame(loop);
    if(!running||paused||ended||cinematic||transforming){lastFrame=now;return;}
    if(!lastFrame)lastFrame=now;
    const dt=Math.min(.042,(now-lastFrame)/1000);lastFrame=now;elapsed+=dt;timeLeft=Math.max(0,timeLeft-dt);
    updatePlayer(dt);updateEnemies(dt);updatePickups(dt);
    spawnClock-=dt;
    if(spawnClock<=0&&spawnCount<45&&enemies.filter(e=>!e.dead).length<8){spawnEnemy();spawnClock=spawnCount<8?.82:1.42;}
    if(messageClock>0){messageClock-=dt;if(messageClock<=0)$('avisoJuego').classList.remove('visible');}
    updateHUD();
    if(timeLeft<=0&&!ended)finishGame(false);
  }
  function finishGame(won) {
    if(ended)return;ended=true;running=false;paused=false;moveLeft=false;moveRight=false;music.pause();
    $('resultadoSello').textContent=won?'DESAFÍO SUPERADO':'EL TIEMPO SE AGOTÓ';
    $('resultadoTitulo').textContent=won?'¡LA PULPERÍA RESISTE!':'¡LOS FEDERALES TE SUPERARON!';
    $('resultadoTexto').textContent=won?'Facundo derrotó a 30 federales antes de que terminara el minuto y medio.':'No alcanzaste los 30 enemigos en 90 segundos. Probá encadenar cortes y usar la ronda cuando te rodeen.';
    $('resultadoKills').textContent=`${String(kills).padStart(2,'0')} / 30`;
    const t=Math.max(0,Math.ceil(timeLeft));$('resultadoTiempo').textContent=`${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
    $('resultadoPuntos').textContent=String(score+ (won?Math.ceil(timeLeft)*20:0)).padStart(5,'0');
    $('resultadoJuego').classList.add('visible');$('resultadoJuego').setAttribute('aria-hidden','false');
  }
  function openPause(){if(!running||ended||cinematic||transforming||paused)return;paused=true;moveLeft=moveRight=false;music.pause();pauseMenu.classList.add('visible');pauseMenu.setAttribute('aria-hidden','false');}
  function closePause(){if(!paused)return;paused=false;pauseMenu.classList.remove('visible');pauseMenu.setAttribute('aria-hidden','true');lastFrame=0;if(settings.music)music.play().catch(()=>{});}
  function restart(){window.location.reload();}
  function goMenu(){music.pause();window.location.href='../inicio/inicio.html#menu';}
  function updateVolume(){settings.volume=Number($('volumen').value);$('volumenValor').textContent=`${settings.volume}%`;music.volume=settings.volume/100;}
  function toggleMusic(){settings.music=!settings.music;$('toggleMusica').textContent=settings.music?'ACTIVADA':'DESACTIVADA';if(settings.music&&running&&!paused)music.play().catch(()=>{});else music.pause();}
  function toggleSound(){settings.sound=!settings.sound;$('toggleSonido').textContent=settings.sound?'ACTIVADOS':'DESACTIVADOS';}
  function toggleFullscreen(){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.().catch(()=>{});else document.exitFullscreen?.().catch(()=>{});}
  function bindHold(id,down,up){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture?.(e.pointerId);down();});['pointerup','pointercancel','lostpointercapture','pointerleave'].forEach(ev=>el.addEventListener(ev,e=>{if(ev==='pointerleave'&&e.buttons!==0)return;up();}));}
  bindHold('moverIzquierda',()=>{if(running&&!paused){moveLeft=true;moveRight=false;facing=-1;}},()=>moveLeft=false);
  bindHold('moverDerecha',()=>{if(running&&!paused){moveRight=true;moveLeft=false;facing=1;}},()=>moveRight=false);
  $('btnSaltar').addEventListener('pointerdown',e=>{e.preventDefault();jump();});
  $('btnCorte').addEventListener('pointerdown',e=>{e.preventDefault();attack('light');});
  $('btnTajo').addEventListener('pointerdown',e=>{e.preventDefault();attack('heavy');});
  $('btnRonda').addEventListener('pointerdown',e=>{e.preventDefault();attack('special');});
  $('botonPausa').addEventListener('click',()=>paused?closePause():openPause());
  $('continuarJuego').addEventListener('click',closePause);$('reiniciarJuego').addEventListener('click',restart);
  $('volverMenu').addEventListener('click',goMenu);$('reintentar').addEventListener('click',restart);
  $('volverNivel2').addEventListener('click',()=>window.location.href='../nivel2/nivel2parte2.html');$('volverMenuResultado').addEventListener('click',goMenu);
  $('cineSiguiente').addEventListener('click',advanceStory);$('cineOmitir').addEventListener('click',startTransformation);
  $('volumen').addEventListener('input',updateVolume);$('toggleMusica').addEventListener('click',toggleMusic);$('toggleSonido').addEventListener('click',toggleSound);$('togglePantalla').addEventListener('click',toggleFullscreen);
  document.addEventListener('keydown',e=>{
    const key=e.key.toLowerCase();
    if(cinematic){if(key===' '||key==='enter'||key==='arrowright'){e.preventDefault();advanceStory();}else if(key==='escape'){e.preventDefault();startTransformation();}return;}
    if(transforming)return;
    if(key==='escape'){e.preventDefault();if(paused)closePause();else openPause();return;}
    if(!running||paused||ended)return;
    if(key==='arrowleft'||key==='a'){e.preventDefault();moveLeft=true;moveRight=false;facing=-1;}
    else if(key==='arrowright'||key==='d'){e.preventDefault();moveRight=true;moveLeft=false;facing=1;}
    else if(key===' '||key==='arrowup'||key==='w'){e.preventDefault();if(!e.repeat)jump();}
    else if(key==='j'||key==='x'){e.preventDefault();if(!e.repeat)attack('light');}
    else if(key==='k'){e.preventDefault();if(!e.repeat)attack('heavy');}
    else if(key==='e'){e.preventDefault();if(!e.repeat)attack('special');}
    else if(key==='shift'){e.preventDefault();if(!e.repeat)startDash();}
  });
  document.addEventListener('keyup',e=>{const key=e.key.toLowerCase();if(key==='arrowleft'||key==='a')moveLeft=false;if(key==='arrowright'||key==='d')moveRight=false;});
  window.addEventListener('blur',()=>{moveLeft=moveRight=false;});
  window.addEventListener('resize',()=>{arenaWidth=arena.clientWidth;playerX=Math.max(0,Math.min(arenaWidth-104,playerX));renderPlayer();});
  updateStory();preloadDecorDust();arenaWidth=arena.clientWidth;renderPlayer();
  rafId=requestAnimationFrame(loop);
})();
