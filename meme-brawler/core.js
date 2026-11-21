// ============================================================
//  CORE: canvas, constants, utils, audio, assets, input
// ============================================================
'use strict';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const VIEW_H = 600;

const GROUND = 520;
const GRAVITY = 2400;
const MOVE_SPEED = 270;
const JUMP_VEL = -880;

let cw = 0, ch = 0, dpr = 1, scale = 1, viewW = 0;

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const sign = (v) => (v < 0 ? -1 : 1);

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function roundRectPath(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.5, r), 0, Math.PI * 2);
  ctx.fill();
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cw = window.innerWidth;
  ch = window.innerHeight;
  canvas.width = Math.floor(cw * dpr);
  canvas.height = Math.floor(ch * dpr);
  canvas.style.width = cw + 'px';
  canvas.style.height = ch + 'px';
  scale = ch / VIEW_H;
  viewW = cw / scale;

  const touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const rot = document.getElementById('rotate');
  if (rot) rot.style.display = (ch > cw && touch) ? 'block' : 'none';
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 120));

// ============================================================
//  AUDIO
// ============================================================
let audioCtx = null;
let masterGain = null;
let muted = false;
const customSfx = {};
let sfxBus = null;

function getSfxBus() {
  if (!sfxBus) {
    sfxBus = new Audio();
    sfxBus.preload = 'auto';
    sfxBus.volume = 0.7;
  }
  return sfxBus;
}

function ensureAudio() {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.9;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) { /* ignore */ }
}

function tone(freq, dur, type = 'square', vol = 0.05, slideTo = null, delay = 0) {
  if (muted) return;
  try {
    ensureAudio();
    if (!audioCtx) return;
    const t0 = audioCtx.currentTime + (delay || 0);
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(20, freq), t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + Math.max(0.01, dur));
    g.gain.setValueAtTime(Math.max(0.0001, vol), t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(0.02, dur));
    o.connect(g); g.connect(masterGain);
    o.start(t0); o.stop(t0 + dur + 0.04);
  } catch (e) { /* ignore */ }
}

function noiseBurst(dur = 0.08, vol = 0.08, freq = 1200) {
  if (muted) return;
  try {
    ensureAudio();
    if (!audioCtx) return;
    const len = Math.max(1, Math.floor(audioCtx.sampleRate * dur));
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const f = audioCtx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = freq;
    const g = audioCtx.createGain();
    g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(masterGain);
    src.start();
  } catch (e) { /* ignore */ }
}

function sfx(name) {
  const pool = SFX_POOLS[name];
  if (pool && pool.length) {
    sfxPlay(name, pool[(Math.random() * pool.length) | 0]);
    return;
  }
  const custom = customSfx[name];
  if (custom) {
    try { sfxPlay(name, custom.src); return; } catch (e) { /* fall through to synth */ }
  }
  switch (name) {
    case 'punch': noiseBurst(0.06, 0.10, 2200); tone(180, 0.06, 'square', 0.04, 90); break;
    case 'kick': noiseBurst(0.10, 0.13, 1000); tone(120, 0.10, 'sawtooth', 0.05, 55); break;
    case 'hit': noiseBurst(0.05, 0.07, 900); tone(95, 0.09, 'square', 0.05, 60); break;
    case 'hurt': tone(320, 0.20, 'sawtooth', 0.06, 110); break;
    case 'jump': tone(300, 0.12, 'sine', 0.045, 650); break;
    case 'special':
      tone(85, 0.55, 'sawtooth', 0.08, 40);
      noiseBurst(0.35, 0.10, 700);
      tone(700, 0.25, 'square', 0.05, 1400, 0.05);
      break;
    case 'boss': tone(70, 0.6, 'sawtooth', 0.09, 42); tone(105, 0.5, 'square', 0.05, 55, 0.1); break;
    case 'sting':
      tone(220, 0.13, 'square', 0.05);
      tone(220, 0.13, 'square', 0.05, null, 0.15);
      tone(185, 0.34, 'square', 0.055, null, 0.30);
      break;
    case 'clear': [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.12, 'sine', 0.05, null, i * 0.09)); break;
    case 'win': [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.18, 'sine', 0.05, null, i * 0.12)); break;
    case 'lose': tone(400, 0.5, 'sawtooth', 0.06, 90); break;
    case 'throw': tone(520, 0.10, 'sine', 0.04, 900); break;
    case 'dash': noiseBurst(0.14, 0.06, 2400); break;
    case 'pound': tone(60, 0.40, 'sine', 0.11, 30); noiseBurst(0.25, 0.10, 500); break;
    case 'ko': tone(200, 0.25, 'square', 0.06, 70); break;
    case 'combo': tone(900, 0.08, 'square', 0.04, 1300); break;
    case 'wave': tone(300, 0.10, 'square', 0.04, 500); break;
    case 'specialReady':
      tone(880, 0.10, 'sine', 0.05);
      tone(1180, 0.12, 'sine', 0.05, null, 0.10);
      break;
    default: break;
  }
}

// ============================================================
//  SOUND PLAYBACK: per-action one-shot queues
// Each action keeps its own Audio element + queue, so sounds
// play one at a time within an action but different actions
// can overlap (no more shared-bus bottleneck).
// ============================================================
const SFX_POOLS = {
  punch: [
    'assets/sfx/hit/03_cid-120-watt.mp3', 'assets/sfx/hit/07_cid-ke-bakchodi.mp3',
  ],
  hit: [
    'assets/sfx/hit/03_cid-120-watt.mp3', 'assets/sfx/hit/07_cid-ke-bakchodi.mp3',
  ],
  hurt: [
    'assets/sfx/hurt/01_aree-cid.mp3', 'assets/sfx/hurt/04_cid-acp-mc.mp3',
    'assets/sfx/hurt/12_cid-yeh-kya-back-rahe-ho-mcd.mp3',
  ],
  chase: [
    'assets/sfx/chase/02_chodu-cid-pakad-le.mp3', 'assets/sfx/chase/09_cid.mp3',
    'assets/sfx/chase/13_ek-baar-milja-beta.mp3',
  ],
  win: ['assets/sfx/win/10_cid-song.mp3'],
  special: [
    'assets/sfx/special/16_kya-cheda-bhosdi.mp3', 'assets/sfx/special/18_lund-pakad-ke-tarazu-ki-tarah-cid.mp3',
    'assets/sfx/special/19_masti-dekho-bc-cid-dubbing.mp3',
  ],
  boss: [
    'assets/sfx/boss/17_kyu-re-madarchod-cid.mp3', 'assets/sfx/boss/20_phir-teri-maiya-chodta-hu-cid.mp3',
  ],
  spawn: [
    'assets/sfx/spawn/14_ek-gand-pe-repta-mara-n-sarak-pe-hagta-firega.mp3',
  ],
  kill: ['assets/sfx/kill/05_cid-acp-pradhuman-fasi.mp3'],
  bossHit: ['assets/sfx/boss-hit/06_cid-gali-ovs.mp3'],
  gotKilled: ['assets/sfx/got-killed/15_ek-jhaat-bhar-ka-aadmi.mp3'],
};

const SFX_QUEUES = {};

function getSfxAudio(key) {
  let st = SFX_QUEUES[key];
  if (!st) {
    const a = new Audio();
    a.preload = 'auto';
    a.volume = 0.7;
    st = SFX_QUEUES[key] = { audio: a, queue: [], playing: false, loop: key === 'win' };
  }
  return st;
}

function playOnAudio(st, src, onEnded) {
  const a = st.audio;
  try { a.pause(); } catch (e) { /* ignore */ }
  a.src = src;
  try { a.currentTime = 0; } catch (e) { /* ignore */ }
  const pr = a.play();
  if (pr && pr.catch) pr.catch(() => {});
  if (typeof onEnded === 'function') {
    const h = () => { a.removeEventListener('ended', h); onEnded(); };
    // remove any prior ended listeners to avoid duplicates
    a.removeEventListener('ended', h);
    a.addEventListener('ended', h);
  }
}

function sfxPlay(key, src) {
  const st = getSfxAudio(key);
  const start = () => {
    st.playing = true;
    playOnAudio(st, src, () => {
      st.playing = false;
      if (st.loop && st.queue.length === 0) { st.queue.push(src); start(); return; }
      const next = st.queue.shift();
      if (next) { src = next; start(); }
    });
  };
  if (st.playing) { st.queue.push(src); return; }
  start();
}

function sfxStop(key) {
  const st = SFX_QUEUES[key];
  if (st) { st.queue.length = 0; st.playing = false; try { st.audio.pause(); } catch (e) {} }
}

function sfxRandom(key) { sfx(key); }

// ============================================================
//  CUSTOM ASSETS
// ============================================================
const faceImages = {};

function loadCustomAssets() {
  const cfg = window.CUSTOM_ASSETS || {};
  for (const [k, src] of Object.entries(cfg.faces || {})) {
    const img = new Image();
    img.onload = () => { faceImages[k] = img; };
    img.onerror = () => {};
    img.src = src;
  }
  for (const [k, src] of Object.entries(cfg.sfx || {})) {
    try {
      const a = new Audio();
      a.preload = 'auto';
      a.src = src;
      customSfx[k] = a;
    } catch (e) { /* ignore */ }
  }
}

// ============================================================
//  INPUT
// ============================================================
const input = {
  left: false,
  right: false,
  jumpPressed: false,
  punchPressed: false,
  specialPressed: false,
};

function bindHold(el, on, off) {
  if (!el) return;
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    ensureAudio();
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    el.classList.add('held');
    on();
  });
  const up = (e) => {
    if (e) e.preventDefault();
    el.classList.remove('held');
    off();
  };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('pointerleave', up);
}

function bindTap(el, fn) {
  if (!el) return;
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    ensureAudio();
    el.classList.add('held');
    fn();
  });
  const up = (e) => {
    if (e) e.preventDefault();
    el.classList.remove('held');
  };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('pointerleave', up);
}

bindHold(document.getElementById('btn-left'), () => { input.left = true; }, () => { input.left = false; });
bindHold(document.getElementById('btn-right'), () => { input.right = true; }, () => { input.right = false; });
bindTap(document.getElementById('btn-punch'), () => { input.punchPressed = true; });
bindTap(document.getElementById('btn-jump'), () => { input.jumpPressed = true; });
bindTap(document.getElementById('btn-special'), () => { input.specialPressed = true; });

const pauseBtn = document.getElementById('pauseBtn');
if (pauseBtn) {
  pauseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (typeof togglePause === 'function') togglePause();
  });
}

const PREVENT_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '];

window.addEventListener('keydown', (e) => {
  if (PREVENT_KEYS.includes(e.key)) e.preventDefault();

  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') input.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') input.right = true;

  if (e.key === 'j' || e.key === 'J' || e.key === 'z' || e.key === 'Z') {
    if (!e.repeat) input.punchPressed = true;
  }
  if (e.key === 'k' || e.key === 'K' || e.key === ' ' || e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
    if (!e.repeat) input.jumpPressed = true;
  }
  if (e.key === 'l' || e.key === 'L' || e.key === 'x' || e.key === 'X') {
    if (!e.repeat) input.specialPressed = true;
  }
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
    if (typeof togglePause === 'function') togglePause();
  }
  if (e.key === 'm' || e.key === 'M') {
    muted = !muted;
    if (!muted) tone(600, 0.06, 'sine', 0.04);
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') input.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') input.right = false;
});

window.addEventListener('pointerdown', () => ensureAudio(), { once: true });
window.addEventListener('contextmenu', (e) => e.preventDefault());

document.addEventListener('visibilitychange', () => {
  if (document.hidden && typeof togglePause === 'function') togglePause();
});

resize();
