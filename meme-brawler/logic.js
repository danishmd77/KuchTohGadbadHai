// ============================================================
//  LOGIC: state, entities, combat, waves, arenas
// ============================================================
'use strict';

const ENEMY_TYPES = {
  grunt:   { w: 66, h: 112, hp: 30, speed: 95, score: 100 },
  charger: { w: 72, h: 118, hp: 40, speed: 85, score: 150 },
  thrower: { w: 64, h: 110, hp: 24, speed: 80, score: 150 },
  boss:    { w: 150, h: 200, hp: 240, speed: 70, score: 1000 },
};

// ---------- mutable game state ----------
let state = 'title';
let levelIndex = 0;
let level = null;
let player = null;
let enemies = [];
let projectiles = [];
let particles = [];
let texts = [];
let banners = [];
const cam = { x: 0 };
let camLock = 0;
let arenaIndex = 0;
let arenaActive = false;
let currentArena = null;
let waveIndex = 0;
let waveDelay = 0;
let bossRef = null;
let now = 0;
let hitstop = 0;
let shake = 0;
let flash = 0;
let score = 0;

const COMIC = ['POW!', 'BAM!', 'DHISHOOM!', 'THWACK!', 'OOF!', 'BONK!'];

// ------------------------------------------------------------
//  ENTITIES
// ------------------------------------------------------------
function makePlayer() {
  return {
    x: 100, y: GROUND - 120, w: 66, h: 120,
    vx: 0, vy: 0, onGround: true, facing: 1,
    hp: 100, maxHp: 100,
    state: 'idle', stateT: 0,
    attackType: 'punch', didHit: false,
    chain: 0, chainTimer: 0, punchQueued: false,
    invuln: 0, flash: 0,
    combo: 0, comboT: 0, meter: 0,
    anim: 0,
  };
}

function makeEnemy(type, x, spec = {}) {
  const base = ENEMY_TYPES[type];
  const scale = spec.scale || 1;
  const w = base.w * scale;
  const h = base.h * scale;
  const hp = spec.hp || base.hp;
  return {
    type, x, y: GROUND - h, w, h,
    vx: 0, vy: 0, facing: -1,
    hp, maxHp: hp, speed: base.speed,
    state: type === 'boss' ? 'idle' : 'walk',
    stateT: 0,
    cooldown: type === 'boss' ? 1.4 : rand(0.5, 1.2),
    flash: 0, dead: false, didHit: false,
    anim: Math.random() * 6,
    score: base.score,
    scale,
    name: spec.name || (type === 'boss' ? 'BOSS' : ''),
  };
}

// ------------------------------------------------------------
//  FLOW
// ------------------------------------------------------------
function startLevel(i) {
  levelIndex = i;
  level = LEVELS[i]();
  player = makePlayer();
  enemies = [];
  projectiles = [];
  particles = [];
  texts = [];
  banners = [];
  arenaIndex = 0;
  arenaActive = false;
  currentArena = null;
  waveIndex = 0;
  waveDelay = 0;
  bossRef = null;
  cam.x = 0;
  camLock = 0;
  hitstop = 0;
  shake = 0;
  flash = 0;
  score = 0;
  state = 'playing';
  hideOverlay();
  banner(level.name.toUpperCase(), 1.4, 'CASE FILE OPEN');
  sfx('sting');
  updateCamera(0);
}

function showTitle() {
  state = 'title';
  levelIndex = 0;
  level = LEVELS[0]();
  player = makePlayer();
  enemies = [];
  projectiles = [];
  particles = [];
  texts = [];
  banners = [];
  arenaIndex = 0;
  arenaActive = false;
  currentArena = null;
  bossRef = null;
  cam.x = 0;
  camLock = 0;
  hitstop = 0;
  shake = 0;
  flash = 0;
  score = 0;
  showOverlay('KUCH TOH GADBAD HAI', 'A CID meme brawler', [
    { label: 'Play', action: () => startLevel(0) },
  ]);
}

function togglePause() {
  if (state === 'playing') {
    state = 'paused';
    showOverlay('Paused', level ? level.name : '', [
      { label: 'Resume', action: () => { state = 'playing'; hideOverlay(); } },
      { label: 'Restart', action: () => startLevel(levelIndex) },
      { label: 'Menu', action: showTitle },
    ]);
  } else if (state === 'paused') {
    state = 'playing';
    hideOverlay();
  }
}

function levelClear() {
  state = 'levelclear';
  sfxRandom('clear');
  if (levelIndex < LEVELS.length - 1) {
    showOverlay('SCENE CLEAR!', level.name, [
      { label: 'Next scene', action: () => startLevel(levelIndex + 1) },
    ]);
  } else {
    sfxRandom('win');
    showOverlay('CASE SOLVED!', 'The city is safe... for now', [
      { label: 'Play again', action: () => startLevel(0) },
    ]);
  }
}

function gameOver() {
  state = 'gameover';
  sfx('lose');
  showOverlay('YOU GOT MEMED', level ? level.name : '', [
    { label: 'Retry', action: () => startLevel(levelIndex) },
    { label: 'Menu', action: showTitle },
  ]);
}

// ------------------------------------------------------------
//  EFFECTS
// ------------------------------------------------------------
function burst(x, y, color, n, power = 240, size = 4) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = Math.random() * power;
    particles.push({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 40,
      life: rand(0.4, 0.9),
      max: 0.9,
      color,
      size: size * rand(0.6, 1.4),
    });
  }
}

function updateParticles(dt) {
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 900 * dt;
    p.life -= dt;
  }
  particles = particles.filter((p) => p.life > 0);
}

function popText(x, y, text, color, size = 24) {
  texts.push({ x, y, text, color, size, life: 0.85, max: 0.85, vy: -70 });
}

function updateTexts(dt) {
  for (const t of texts) {
    t.y += t.vy * dt;
    t.vy += 130 * dt;
    t.life -= dt;
  }
  texts = texts.filter((t) => t.life > 0);
}

function banner(text, dur = 1.2, sub = '') {
  banners = [{ text, sub, life: dur, max: dur }];
}

function updateBanners(dt) {
  for (const b of banners) b.life -= dt;
  banners = banners.filter((b) => b.life > 0);
}

// ------------------------------------------------------------
//  COMBAT
// ------------------------------------------------------------
function nearestEnemy() {
  let best = null;
  let bd = Infinity;
  for (const e of enemies) {
    if (e.dead) continue;
    const d = Math.abs((e.x + e.w / 2) - (player.x + player.w / 2));
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

function startPunch() {
  const p = player;
  if (p.state !== 'idle') return;
  if (p.chainTimer <= 0) p.chain = 0;
  p.attackType = p.chain === 2 ? 'kick' : 'punch';
  p.state = 'attack';
  p.stateT = 0;
  p.didHit = false;
  const near = nearestEnemy();
  if (near) p.facing = sign((near.x + near.w / 2) - (p.x + p.w / 2));
  sfx(p.attackType === 'kick' ? 'kick' : 'punch');
}

function playerHitbox() {
  const p = player;
  const reach = p.attackType === 'kick' ? 104 : 78;
  const h = p.h * 0.5;
  const y = p.y + p.h * 0.22;
  const x = p.facing > 0 ? p.x + p.w - 10 : p.x - reach + 10;
  return { x, y, w: reach, h };
}

function doPlayerHit() {
  const box = playerHitbox();
  const dmg = player.attackType === 'kick' ? 22 : 11;
  let hitAny = false;

  for (const e of enemies) {
    if (e.dead) continue;
    if (!overlaps(box, e)) continue;
    const dir = sign((e.x + e.w / 2) - (player.x + player.w / 2));
    damageEnemy(e, dmg, dir);
    hitAny = true;
  }

  if (hitAny) {
    hitstop = 0.055;
    shake = Math.max(shake, 6);
    sfxRandom('hit');
    popText(
      player.x + player.w / 2 + player.facing * 40,
      player.y + 40,
      COMIC[(Math.random() * COMIC.length) | 0],
      '#ffe14f',
      24
    );
  }
}

function damageEnemy(e, dmg, dir) {
  if (e.dead) return;
  e.hp -= dmg;
  e.flash = 0.16;

  if (e.type !== 'boss') {
    e.state = 'hurt';
    e.stateT = 0;
    e.vx = dir * 320;
  } else {
    e.vx = dir * 30;
  }

  burst(e.x + e.w / 2, e.y + e.h * 0.45, '#ff4fd8', 8, 220, 3);

  player.combo += 1;
  player.comboT = 1.6;
  if (player.state !== 'special') player.meter = Math.min(100, player.meter + 9);

  if (player.combo % 5 === 0) {
    popText(player.x + player.w / 2, player.y - 10, 'COMBO x' + player.combo, '#00f0ff', 22);
    sfx('combo');
  }

  if (e.hp <= 0) killEnemy(e);
}

function killEnemy(e) {
  if (e.dead) return;
  e.dead = true;
  score += e.score || 100;
  burst(e.x + e.w / 2, e.y + e.h * 0.5, '#ffe14f', 20, 320, 4);
  popText(e.x + e.w / 2, e.y, 'KO!', '#ff4fd8', 26);
  sfxRandom('ko');

  if (e.type === 'boss') {
    bossRef = null;
    shake = 20;
    hitstop = 0.12;
    banner('K.O.!', 1.4, e.name || 'BOSS DOWN');
  }
}

function doSpecial() {
  const p = player;
  if (p.meter < 100 || p.state === 'special') return;
  p.state = 'special';
  p.stateT = 0;
  p.meter = 0;
  hitstop = 0.12;
  shake = 18;
  flash = 0.25;
  banner('DARWAZA TOD DO!', 1.5, 'SPECIAL');
  sfxRandom('special');

  for (const e of enemies) {
    if (e.dead) continue;
    if (e.x + e.w > cam.x - 80 && e.x < cam.x + viewW + 80) {
      const dir = sign((e.x + e.w / 2) - (p.x + p.w / 2));
      damageEnemy(e, 42, dir);
      if (e.type !== 'boss') {
        e.state = 'hurt';
        e.stateT = 0;
        e.vx = dir * 560;
      }
    }
  }
  burst(p.x + p.w / 2, p.y + p.h * 0.6, '#b06cff', 46, 460, 6);
}

function hurtPlayer(dmg, dir) {
  const p = player;
  if (!p || p.invuln > 0 || state !== 'playing') return;
  p.hp -= dmg;
  p.invuln = 1.0;
  p.flash = 0.22;
  p.state = 'hurt';
  p.stateT = 0;
  p.vx = dir * 280;
  p.vy = -260;
  shake = Math.max(shake, 9);
  hitstop = 0.06;
  sfxRandom('hurt');
  popText(p.x + p.w / 2, p.y, '-' + dmg, '#ff4fd8', 20);

  if (p.hp <= 0) {
    p.hp = 0;
    gameOver();
  }
}

function groundClamp(a) {
  const feet = a.y + a.h;
  if (feet >= GROUND) {
    a.y = GROUND - a.h;
    a.vy = 0;
    a.onGround = true;
  } else {
    a.onGround = false;
  }
}

// ------------------------------------------------------------
//  PLAYER UPDATE
// ------------------------------------------------------------
function updatePlayer(dt) {
  const p = player;
  p.anim += dt;
  if (p.invuln > 0) p.invuln -= dt;
  if (p.flash > 0) p.flash -= dt;
  if (p.chainTimer > 0) p.chainTimer -= dt;
  if (p.comboT > 0) {
    p.comboT -= dt;
    if (p.comboT <= 0) p.combo = 0;
  }

  if (input.punchPressed) {
    input.punchPressed = false;
    if (p.state === 'attack') p.punchQueued = true;
    else if (p.state === 'idle') startPunch();
  }
  if (input.specialPressed) {
    input.specialPressed = false;
    if (p.state === 'idle') doSpecial();
  }
  if (input.jumpPressed) {
    input.jumpPressed = false;
    if (p.state === 'idle' && p.onGround) {
      p.vy = JUMP_VEL;
      p.onGround = false;
      sfx('jump');
    }
  }

  if (p.state === 'hurt') {
    p.stateT += dt;
    p.vx *= 0.92;
    p.x += p.vx * dt;
    p.vy += GRAVITY * dt;
    p.y += p.vy * dt;
    groundClamp(p);
    if (p.stateT > 0.32) { p.state = 'idle'; p.vx = 0; }
    return;
  }

  if (p.state === 'attack') {
    p.stateT += dt;
    p.x += p.facing * (p.attackType === 'kick' ? 130 : 70) * dt;
    p.vy += GRAVITY * dt;
    p.y += p.vy * dt;
    groundClamp(p);

    const hitAt = p.attackType === 'kick' ? 0.16 : 0.09;
    const endAt = p.attackType === 'kick' ? 0.42 : 0.28;

    if (!p.didHit && p.stateT >= hitAt) {
      p.didHit = true;
      doPlayerHit();
    }

    if (p.stateT >= endAt) {
      p.state = 'idle';
      p.chain = (p.chain + 1) % 3;
      p.chainTimer = 0.7;
      if (p.punchQueued && p.chain !== 0) {
        p.punchQueued = false;
        startPunch();
      } else {
        p.punchQueued = false;
      }
    }
    return;
  }

  if (p.state === 'special') {
    p.stateT += dt;
    p.vy += GRAVITY * dt;
    p.y += p.vy * dt;
    groundClamp(p);
    if (p.stateT >= 0.9) p.state = 'idle';
    return;
  }

  // idle
  let ax = 0;
  if (input.left) ax -= 1;
  if (input.right) ax += 1;

  if (ax !== 0) {
    p.vx = ax * MOVE_SPEED;
    p.facing = ax;
  } else {
    p.vx *= 0.65;
    if (Math.abs(p.vx) < 4) p.vx = 0;
  }
  p.x += p.vx * dt;

  p.vy += GRAVITY * dt;
  p.y += p.vy * dt;
  groundClamp(p);
}

// ------------------------------------------------------------
//  ENEMY AI
// ------------------------------------------------------------
function updateEnemies(dt) {
  for (const e of enemies) {
    if (e.dead) continue;
    e.anim += dt;
    if (e.flash > 0) e.flash -= dt;

    if (e.state === 'hurt') {
      e.stateT += dt;
      e.x += e.vx * dt;
      e.vx *= 0.88;
      if (e.stateT > 0.3) { e.state = 'walk'; e.vx = 0; }
    } else if (e.type === 'boss') {
      updateBoss(e, dt);
    } else if (e.type === 'grunt') {
      updateGrunt(e, dt);
    } else if (e.type === 'charger') {
      updateCharger(e, dt);
    } else if (e.type === 'thrower') {
      updateThrower(e, dt);
    }

    if (arenaActive) {
      e.x = clamp(e.x, cam.x + 10, cam.x + viewW - e.w - 10);
    }
    e.y = GROUND - e.h;
  }
  enemies = enemies.filter((e) => !e.dead);
}

function updateGrunt(e, dt) {
  const p = player;
  const dx = (p.x + p.w / 2) - (e.x + e.w / 2);
  const adist = Math.abs(dx);
  e.facing = dx >= 0 ? 1 : -1;

  switch (e.state) {
    case 'walk':
      if (adist > 64) e.x += e.facing * e.speed * dt;
      else { e.state = 'windup'; e.stateT = 0; sfxRandom('chase'); }
      break;
    case 'windup':
      e.stateT += dt;
      if (e.stateT >= 0.35) { e.state = 'strike'; e.stateT = 0; e.didHit = false; }
      break;
    case 'strike':
      e.stateT += dt;
      if (!e.didHit && e.stateT >= 0.05) {
        e.didHit = true;
        if (adist < 88) hurtPlayer(10, e.facing);
      }
      if (e.stateT >= 0.16) { e.state = 'recover'; e.stateT = 0; }
      break;
    case 'recover':
      e.stateT += dt;
      if (e.stateT >= 0.6) e.state = 'walk';
      break;
    default:
      e.state = 'walk';
  }
}

function updateCharger(e, dt) {
  const p = player;
  const dx = (p.x + p.w / 2) - (e.x + e.w / 2);
  const adist = Math.abs(dx);
  if (e.state !== 'dash') e.facing = dx >= 0 ? 1 : -1;

  switch (e.state) {
    case 'walk':
      if (adist > 220) e.x += e.facing * e.speed * dt;
      else { e.state = 'tele'; e.stateT = 0; sfxRandom('chase'); }
      break;
    case 'tele':
      e.stateT += dt;
      if (e.stateT >= 0.5) {
        e.state = 'dash';
        e.stateT = 0;
        e.didHit = false;
        e.vx = e.facing * 720;
        sfx('dash');
      }
      break;
    case 'dash':
      e.x += e.vx * dt;
      e.stateT += dt;
      if (!e.didHit && overlaps(player, e)) {
        e.didHit = true;
        hurtPlayer(14, e.facing);
      }
      if (e.stateT >= 0.45) { e.state = 'recover'; e.stateT = 0; e.vx = 0; }
      break;
    case 'recover':
      e.stateT += dt;
      if (e.stateT >= 0.8) e.state = 'walk';
      break;
    default:
      e.state = 'walk';
  }
}

function updateThrower(e, dt) {
  const p = player;
  const dx = (p.x + p.w / 2) - (e.x + e.w / 2);
  const adist = Math.abs(dx);
  e.facing = dx >= 0 ? 1 : -1;
  e.cooldown -= dt;

  if (adist < 180) e.x -= e.facing * e.speed * dt;
  else if (adist > 340) e.x += e.facing * e.speed * dt;

  if (e.cooldown <= 0 && adist < 620) {
    e.cooldown = rand(1.8, 2.6);
    spawnProjectile(e.x + e.w / 2, e.y + e.h * 0.42, e.facing * 430, -40, 9, '#8affc1', 10);
    sfx('throw');
  }
}

function updateBoss(e, dt) {
  const p = player;
  const dx = (p.x + p.w / 2) - (e.x + e.w / 2);
  const adist = Math.abs(dx);
  if (e.state !== 'charge') e.facing = dx >= 0 ? 1 : -1;

  switch (e.state) {
    case 'idle': {
      e.stateT += dt;
      e.cooldown -= dt;
      if (adist > 300) e.x += e.facing * e.speed * dt;
      if (e.cooldown <= 0) {
        const r = Math.random();
        if (adist < 240 && r < 0.5) e.state = 'tele_pound';
        else if (r < 0.78) e.state = 'tele_charge';
        else e.state = 'tele_spread';
        e.stateT = 0;
        sfxRandom('chase');
      }
      break;
    }
    case 'tele_pound':
      e.stateT += dt;
      if (e.stateT >= 0.55) { e.state = 'pound'; e.stateT = 0; e.didHit = false; }
      break;
    case 'pound':
      e.stateT += dt;
      if (!e.didHit) {
        e.didHit = true;
        shake = 16;
        burst(e.x + e.w / 2, GROUND - 8, '#ff4fd8', 30, 400, 6);
        sfx('pound');
        if (p.onGround && Math.abs((p.x + p.w / 2) - (e.x + e.w / 2)) < 320) {
          hurtPlayer(16, sign((p.x + p.w / 2) - (e.x + e.w / 2)));
        }
      }
      if (e.stateT >= 0.35) { e.state = 'idle'; e.stateT = 0; e.cooldown = 1.1; }
      break;
    case 'tele_charge':
      e.stateT += dt;
      if (e.stateT >= 0.5) {
        e.state = 'charge';
        e.stateT = 0;
        e.didHit = false;
        e.vx = e.facing * 560;
      }
      break;
    case 'charge':
      e.x += e.vx * dt;
      e.stateT += dt;
      if (!e.didHit && overlaps(player, e)) {
        e.didHit = true;
        hurtPlayer(18, e.facing);
      }
      if (e.stateT >= 0.6 || e.x < cam.x + 20 || e.x + e.w > cam.x + viewW - 20) {
        e.state = 'idle';
        e.stateT = 0;
        e.cooldown = 1.0;
        e.vx = 0;
      }
      break;
    case 'tele_spread':
      e.stateT += dt;
      if (e.stateT >= 0.45) {
        e.state = 'spread';
        e.stateT = 0;
        const bx = e.x + e.w / 2;
        const by = e.y + e.h * 0.35;
        for (let i = -1; i <= 1; i++) {
          spawnProjectile(bx, by, e.facing * 380, i * 150, 10, '#c98bff', 12);
        }
        sfx('throw');
      }
      break;
    case 'spread':
      e.stateT += dt;
      if (e.stateT >= 0.4) { e.state = 'idle'; e.stateT = 0; e.cooldown = 1.2; }
      break;
    default:
      e.state = 'idle';
  }

  if (e.hp < e.maxHp * 0.5) e.cooldown = Math.min(e.cooldown, 0.9);
  e.x = clamp(e.x, cam.x + 10, cam.x + viewW - e.w - 10);
}

// ------------------------------------------------------------
//  PROJECTILES
// ------------------------------------------------------------
function spawnProjectile(x, y, vx, vy, r, color, dmg) {
  projectiles.push({ x, y, vx, vy, r, color, dmg, life: 3.2, dead: false });
}

function updateProjectiles(dt) {
  for (const pr of projectiles) {
    if (pr.dead) continue;
    pr.x += pr.vx * dt;
    pr.y += pr.vy * dt;
    pr.vy += 240 * dt;
    pr.life -= dt;

    if (pr.life <= 0 || pr.x < cam.x - 120 || pr.x > cam.x + viewW + 120 || pr.y > GROUND + 40) {
      pr.dead = true;
      continue;
    }

    const box = { x: pr.x - pr.r, y: pr.y - pr.r, w: pr.r * 2, h: pr.r * 2 };
    if (overlaps(box, player)) {
      pr.dead = true;
      hurtPlayer(pr.dmg, sign(pr.vx));
    }
  }
  projectiles = projectiles.filter((p) => !p.dead);
}

// ------------------------------------------------------------
//  ARENAS / WAVES
// ------------------------------------------------------------
function checkArenaTrigger() {
  if (arenaActive || arenaIndex >= level.arenas.length) return;
  const a = level.arenas[arenaIndex];
  if (player.x + player.w / 2 >= a.trigger) activateArena(a);
}

function activateArena(a) {
  currentArena = a;
  arenaActive = true;
  camLock = clamp(a.trigger - viewW * 0.30, 0, Math.max(0, level.width - viewW));
  cam.x = camLock;
  waveIndex = 0;
  waveDelay = 0;
  enemies = [];
  spawnWave(a.waves[0]);
  banner(a.boss ? 'BOSS FIGHT!' : 'FIGHT!', 1.2, a.boss ? 'FINAL SHOWDOWN' : '');
  sfx(a.boss ? 'boss' : 'sting');
  if (a.boss) sfxRandom('boss');
  player.x = clamp(player.x, cam.x + 30, cam.x + viewW - player.w - 30);
}

function spawnWave(wave) {
  for (let i = 0; i < wave.length; i++) {
    const spec = wave[i];
    if (spec.type === 'boss') {
      const b = makeEnemy('boss', cam.x + viewW * 0.72, spec);
      enemies.push(b);
      bossRef = b;
      continue;
    }
    const side = spec.side || (i % 2 === 0 ? 'left' : 'right');
    const x = side === 'left'
      ? cam.x + 40 + Math.random() * 70
      : cam.x + viewW - 110 - Math.random() * 70;
    enemies.push(makeEnemy(spec.type, x, spec));
    sfxRandom('spawn');
  }
}

function updateArena(dt) {
  if (!arenaActive) {
    checkArenaTrigger();
    return;
  }

  if (waveDelay > 0) {
    waveDelay -= dt;
    if (waveDelay <= 0) {
      spawnWave(currentArena.waves[waveIndex]);
      sfx('wave');
    }
    return;
  }

  if (enemies.length === 0) {
    if (waveIndex < currentArena.waves.length - 1) {
      waveIndex++;
      waveDelay = 0.9;
      banner('WAVE ' + (waveIndex + 1), 0.9);
      sfx('wave');
    } else {
      const wasBoss = !!currentArena.boss;
      arenaActive = false;
      currentArena = null;
      arenaIndex++;
      if (wasBoss) {
        levelClear();
      } else {
        banner('GO \u2192', 1.1);
        sfx('clear');
      }
    }
  }
}

function updateCamera(dt) {
  if (arenaActive) {
    cam.x = camLock;
  } else {
    const target = clamp(player.x + player.w / 2 - viewW * 0.42, 0, Math.max(0, level.width - viewW));
    cam.x += (target - cam.x) * Math.min(1, dt * 6);
  }

  const minX = arenaActive ? cam.x + 24 : 0;
  const maxX = arenaActive ? cam.x + viewW - player.w - 24 : Math.max(0, level.width - player.w);
  player.x = clamp(player.x, minX, Math.max(minX, maxX));
}

// ------------------------------------------------------------
//  MAIN UPDATE
// ------------------------------------------------------------
function update(dt) {
  now += dt;
  if (shake > 0) shake = Math.max(0, shake - dt * 50);
  if (flash > 0) flash = Math.max(0, flash - dt);
  updateParticles(dt);
  updateTexts(dt);
  updateBanners(dt);

  if (state !== 'playing') {
    input.jumpPressed = false;
    input.punchPressed = false;
    input.specialPressed = false;
    return;
  }
  if (hitstop > 0) { hitstop -= dt; return; }

  updatePlayer(dt);
  if (state !== 'playing') return;

  updateEnemies(dt);
  if (state !== 'playing') return;

  updateProjectiles(dt);
  updateArena(dt);
  updateCamera(dt);
}

// ------------------------------------------------------------
//  DEBUG HOOK (for testing)
// ------------------------------------------------------------
window.__meme = {
  get state() { return state; },
  get levelIndex() { return levelIndex; },
  get player() {
    return player
      ? { x: player.x, y: player.y, hp: player.hp, state: player.state, meter: player.meter, combo: player.combo, onGround: player.onGround }
      : null;
  },
  get enemies() { return enemies.map((e) => ({ type: e.type, x: Math.round(e.x), hp: e.hp, state: e.state })); },
  get arena() { return { index: arenaIndex, active: arenaActive }; },
  get boss() { return bossRef ? { hp: bossRef.hp, max: bossRef.maxHp } : null; },
  get cam() { return cam.x; },
  warp(x) { if (player) player.x = x; },
  hurt(n) { hurtPlayer(n, 1); },
  fillMeter() { if (player) player.meter = 100; },
  clearWave() { for (const e of enemies) killEnemy(e); },
  start(i) { startLevel(i); },
};
