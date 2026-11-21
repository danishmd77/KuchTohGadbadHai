// ============================================================
//  MAIN: rendering, HUD, overlays, loop
// ============================================================
'use strict';

const overlay = document.getElementById('overlay');
const ovTitle = document.getElementById('ov-title');
const ovSub = document.getElementById('ov-sub');
const ovButtons = document.getElementById('ov-buttons');

// ------------------------------------------------------------
//  OVERLAY
// ------------------------------------------------------------
function showOverlay(title, sub, buttons) {
  ovTitle.textContent = title;
  ovSub.textContent = sub || '';
  ovButtons.innerHTML = '';
  (buttons || []).forEach((b) => {
    const btn = document.createElement('button');
    btn.textContent = b.label;
    btn.addEventListener('click', () => {
      ensureAudio();
      sfx('combo');
      b.action();
    });
    ovButtons.appendChild(btn);
  });
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  overlay.classList.add('hidden');
}

// ------------------------------------------------------------
//  WORLD RENDER
// ------------------------------------------------------------
function drawWorld() {
  // projectiles (behind actors)
  for (const pr of projectiles) {
    ctx.save();
    ctx.shadowColor = pr.color;
    ctx.shadowBlur = 14;
    ctx.fillStyle = pr.color;
    circle(pr.x, pr.y, pr.r);
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    circle(pr.x - 2, pr.y - 2, pr.r * 0.35);
  }

  // enemies
  for (const e of enemies) {
    if (e.dead) continue;
    drawActor(e, e.type, now);
  }

  // player
  if (player) drawActor(player, 'acp', now);

  // particles
  for (const p of particles) {
    ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  // comic words
  for (const t of texts) {
    const a = clamp(t.life / t.max, 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = `900 ${t.size}px ui-monospace, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(10,7,20,0.9)';
    ctx.strokeText(t.text, t.x, t.y);
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  }
}

// ------------------------------------------------------------
//  HUD
// ------------------------------------------------------------
function drawHUD() {
  if (!player || state === 'title') return;
  const p = player;

  ctx.save();
  ctx.textBaseline = 'alphabetic';

  // health bar
  const hx = 18, hy = 18;
  const hw = Math.min(250, viewW * 0.44);
  const hh = 18;
  ctx.fillStyle = 'rgba(10,7,20,0.6)';
  roundRectPath(hx - 3, hy - 3, hw + 6, hh + 6, 8);
  ctx.fill();

  const ratio = clamp(p.hp / p.maxHp, 0, 1);
  const grad = ctx.createLinearGradient(hx, 0, hx + hw, 0);
  grad.addColorStop(0, '#ff2b5e');
  grad.addColorStop(1, '#39ffb0');
  ctx.fillStyle = grad;
  roundRectPath(hx, hy, hw * ratio, hh, 6);
  ctx.fill();

  ctx.strokeStyle = 'rgba(232,230,255,0.35)';
  ctx.lineWidth = 1;
  roundRectPath(hx, hy, hw, hh, 6);
  ctx.stroke();

  ctx.fillStyle = '#e8e6ff';
  ctx.font = '700 11px ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('ACP HP', hx, hy - 6);

  // special meter
  const sy = hy + hh + 12;
  ctx.fillStyle = 'rgba(10,7,20,0.6)';
  roundRectPath(hx - 3, sy - 3, hw + 6, 18, 8);
  ctx.fill();
  ctx.fillStyle = p.meter >= 100 ? '#ffe14f' : '#b06cff';
  roundRectPath(hx, sy, hw * (p.meter / 100), 12, 6);
  ctx.fill();
  ctx.fillStyle = p.meter >= 100 ? '#ffe14f' : 'rgba(232,230,255,0.6)';
  ctx.font = '700 10px ui-monospace, monospace';
  ctx.fillText(p.meter >= 100 ? 'SPECIAL READY!' : 'GADBAD METER', hx, sy + 10);

  // score
  ctx.textAlign = 'left';
  ctx.font = '700 14px ui-monospace, monospace';
  ctx.fillStyle = '#ffe14f';
  ctx.fillText('SCORE ' + score, hx, sy + 34);

  // combo
  if (p.combo > 1) {
    ctx.textAlign = 'center';
    ctx.font = '900 26px ui-monospace, monospace';
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.fillText('x' + p.combo + ' COMBO', viewW / 2, 62);
    ctx.shadowBlur = 0;
  }

  // level name (when no boss, and only if there is room)
  if (!bossRef && level && viewW >= 720) {
    ctx.textAlign = 'center';
    ctx.font = '600 11px ui-monospace, monospace';
    ctx.fillStyle = 'rgba(232,230,255,0.45)';
    ctx.fillText(level.name.toUpperCase(), viewW / 2, 22);
  }

  // boss bar
  if (bossRef) {
    const bw = Math.min(560, viewW * 0.62);
    const bx = (viewW - bw) / 2;
    const by = 78;

    ctx.fillStyle = 'rgba(10,7,20,0.72)';
    roundRectPath(bx - 3, by - 3, bw + 6, 26, 8);
    ctx.fill();

    ctx.fillStyle = '#ff2b5e';
    roundRectPath(bx, by, bw * clamp(bossRef.hp / bossRef.maxHp, 0, 1), 20, 6);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,79,216,0.6)';
    ctx.lineWidth = 1;
    roundRectPath(bx, by, bw, 20, 6);
    ctx.stroke();

    ctx.fillStyle = '#ffd6f6';
    ctx.font = '700 11px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(bossRef.name || 'BOSS', viewW / 2, by - 7);
  }

  ctx.restore();
}

function drawBanners() {
  for (const b of banners) {
    const t = 1 - b.life / b.max;
    const a = b.life < 0.3 ? b.life / 0.3 : 1;
    const pop = 1 + Math.sin(Math.min(1, t * 3) * Math.PI) * 0.12;
    const fs = Math.min(46, viewW * 0.075);

    ctx.save();
    ctx.globalAlpha = clamp(a, 0, 1);
    ctx.translate(viewW / 2, VIEW_H * 0.34);
    ctx.scale(pop, pop);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `900 ${fs}px ui-monospace, monospace`;
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(10,7,20,0.9)';
    ctx.strokeText(b.text, 0, 0);

    const g = ctx.createLinearGradient(-viewW * 0.3, 0, viewW * 0.3, 0);
    g.addColorStop(0, '#00f0ff');
    g.addColorStop(0.5, '#b06cff');
    g.addColorStop(1, '#ff4fd8');
    ctx.fillStyle = g;
    ctx.fillText(b.text, 0, 0);

    if (b.sub) {
      ctx.font = '700 16px ui-monospace, monospace';
      ctx.fillStyle = '#ffe14f';
      ctx.fillText(b.sub, 0, fs * 0.95);
    }
    ctx.restore();
  }
}

// ------------------------------------------------------------
//  FRAME
// ------------------------------------------------------------
let lastShownState = null;
let lastMeterReady = null;

function syncUI() {
  if (state !== lastShownState) {
    if (pauseBtn) pauseBtn.style.display = state === 'playing' ? 'flex' : 'none';
    lastShownState = state;
  }
  const ready = !!(player && player.meter >= 100 && state === 'playing');
  if (ready !== lastMeterReady) {
    const el = document.getElementById('btn-special');
    if (el) el.classList.toggle('ready', ready);
    lastMeterReady = ready;
  }
}

function render() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cw, ch);
  ctx.scale(scale, scale);

  drawBackground();

  const sx = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  const sy = shake > 0 ? (Math.random() - 0.5) * shake : 0;

  ctx.save();
  ctx.translate(-cam.x + sx, sy);
  drawWorld();
  ctx.restore();

  drawHUD();
  drawBanners();

  if (flash > 0) {
    ctx.fillStyle = `rgba(255,60,120,${flash * 0.5})`;
    ctx.fillRect(0, 0, viewW, VIEW_H);
  }

  syncUI();
}

let lastT = performance.now();

function frame(t) {
  let dt = (t - lastT) / 1000;
  lastT = t;
  if (!isFinite(dt) || dt < 0) dt = 0;
  dt = Math.min(dt, 1 / 30);

  update(dt);
  render();
  requestAnimationFrame(frame);
}

// ------------------------------------------------------------
//  BOOT
// ------------------------------------------------------------
loadCustomAssets();
resize();
showTitle();
requestAnimationFrame(frame);
