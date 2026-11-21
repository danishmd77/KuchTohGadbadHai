// ============================================================
//  ART: cartoon faces, actors, background
// ============================================================
'use strict';

const LOOKS = {
  acp:     { skin: '#f2c49a', shirt: '#1b2a4a', pants: '#101a30', accent: '#ffd24a' },
  grunt:   { skin: '#ffe066', shirt: '#6a3cff', pants: '#2a1a5a', accent: '#ff4fd8' },
  charger: { skin: '#ff9a6c', shirt: '#b3123a', pants: '#4a0a1e', accent: '#ffd24a' },
  thrower: { skin: '#8affc1', shirt: '#1f7a5a', pants: '#0e3a2a', accent: '#00f0ff' },
  boss:    { skin: '#c98bff', shirt: '#3a1060', pants: '#1a0830', accent: '#ff4fd8' },
};

const stars = Array.from({ length: 90 }, () => ({
  x: Math.random() * 2400,
  y: Math.random() * 0.75,
  s: Math.random() * 1.8 + 0.5,
  tw: Math.random() * 6.28,
}));

// ------------------------------------------------------------
//  HEAD
// ------------------------------------------------------------
function drawHead(kind, cx, cy, size, facing, t) {
  const img = faceImages[kind];
  if (img) {
    ctx.save();
    ctx.translate(cx, cy);
    if (facing < 0) ctx.scale(-1, 1);
    // preserve aspect ratio (letterbox inside the square face box)
    const aspect = (img.naturalWidth || 1) / (img.naturalHeight || 1);
    let dw = size, dh = size;
    if (aspect > 1) dh = size / aspect;
    else if (aspect < 1) dw = size * aspect;
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
    return;
  }

  const look = LOOKS[kind] || LOOKS[kind && kind.startsWith && kind.startsWith('acp') ? 'acp' : null] || LOOKS.grunt;
  const hw = size * 0.50;
  const hh = size * 0.54;

  ctx.save();
  // head
  ctx.fillStyle = look.skin;
  roundRectPath(cx - hw, cy - hh, size, size * 1.08, size * 0.24);
  ctx.fill();
  ctx.lineWidth = Math.max(2, size * 0.028);
  ctx.strokeStyle = 'rgba(0,0,0,0.30)';
  ctx.stroke();

  // ears
  ctx.fillStyle = look.skin;
  circle(cx - hw, cy + size * 0.02, size * 0.09);
  circle(cx + hw, cy + size * 0.02, size * 0.09);

  // eyes
  const eyeY = cy - size * 0.08;
  const eyeDX = size * 0.19;
  const eyeR = size * 0.13;
  ctx.fillStyle = '#fff';
  circle(cx - eyeDX, eyeY, eyeR);
  circle(cx + eyeDX, eyeY, eyeR);

  const px = facing * eyeR * 0.35;
  ctx.fillStyle = '#1a1020';
  circle(cx - eyeDX + px, eyeY, eyeR * 0.46);
  circle(cx + eyeDX + px, eyeY, eyeR * 0.46);

  drawFaceDetails(kind, cx, cy, size, facing, t, look);
  ctx.restore();
}

function drawFaceDetails(kind, cx, cy, size, facing, t, look) {
  const hh = size * 0.54;
  const eyeY = cy - size * 0.08;
  const eyeDX = size * 0.19;
  const eyeR = size * 0.13;

  if (kind === 'acp') {
    // sunglasses
    ctx.fillStyle = '#0a0a12';
    const gw = eyeDX * 2 + eyeR * 1.5;
    roundRectPath(cx - gw / 2, eyeY - eyeR * 0.95, gw, eyeR * 1.9, size * 0.05);
    ctx.fill();
    ctx.fillRect(cx - size * 0.03, eyeY - eyeR * 0.1, size * 0.06, eyeR * 0.35);
    // shine
    ctx.strokeStyle = 'rgba(160,220,255,0.55)';
    ctx.lineWidth = Math.max(1, size * 0.02);
    ctx.beginPath();
    ctx.moveTo(cx - gw * 0.35, eyeY - eyeR * 0.4);
    ctx.lineTo(cx - gw * 0.15, eyeY + eyeR * 0.4);
    ctx.stroke();

    // mustache
    ctx.fillStyle = '#1a1020';
    ctx.beginPath();
    ctx.ellipse(cx - size * 0.13, cy + size * 0.17, size * 0.14, size * 0.055, -0.25, 0, Math.PI * 2);
    ctx.ellipse(cx + size * 0.13, cy + size * 0.17, size * 0.14, size * 0.055, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // mouth
    ctx.strokeStyle = '#7a2a2a';
    ctx.lineWidth = Math.max(1.5, size * 0.02);
    ctx.beginPath();
    ctx.arc(cx, cy + size * 0.22, size * 0.10, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // cap
    ctx.fillStyle = '#12203a';
    ctx.beginPath();
    ctx.ellipse(cx, cy - hh * 0.72, size * 0.52, size * 0.30, 0, Math.PI, 0);
    ctx.fill();
    const brimW = size * 0.66;
    const brimX = facing > 0 ? cx - size * 0.08 : cx - brimW + size * 0.08;
    ctx.fillRect(brimX, cy - hh * 0.74, brimW, size * 0.10);
    ctx.fillStyle = '#ffd24a';
    circle(cx, cy - hh * 0.88, size * 0.07);

  } else if (kind === 'grunt') {
    // raised brows
    ctx.strokeStyle = '#1a1020';
    ctx.lineWidth = Math.max(2, size * 0.025);
    ctx.beginPath();
    ctx.moveTo(cx - eyeDX - eyeR * 0.8, eyeY - eyeR * 1.55);
    ctx.lineTo(cx - eyeDX + eyeR * 0.8, eyeY - eyeR * 1.75);
    ctx.moveTo(cx + eyeDX - eyeR * 0.8, eyeY - eyeR * 1.75);
    ctx.lineTo(cx + eyeDX + eyeR * 0.8, eyeY - eyeR * 1.55);
    ctx.stroke();
    // little o mouth
    ctx.fillStyle = '#3a1020';
    ctx.beginPath();
    ctx.ellipse(cx, cy + size * 0.22, size * 0.07, size * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    // sweat drop
    ctx.fillStyle = 'rgba(120,200,255,0.85)';
    ctx.beginPath();
    ctx.ellipse(cx + size * 0.36, cy - size * 0.16, size * 0.035, size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

  } else if (kind === 'charger') {
    // angry brows
    ctx.strokeStyle = '#3a0a0a';
    ctx.lineWidth = Math.max(2, size * 0.035);
    ctx.beginPath();
    ctx.moveTo(cx - eyeDX - eyeR * 0.9, eyeY - eyeR * 1.7);
    ctx.lineTo(cx - eyeDX + eyeR * 0.9, eyeY - eyeR * 1.1);
    ctx.moveTo(cx + eyeDX - eyeR * 0.9, eyeY - eyeR * 1.1);
    ctx.lineTo(cx + eyeDX + eyeR * 0.9, eyeY - eyeR * 1.7);
    ctx.stroke();
    // gritted teeth
    ctx.fillStyle = '#fff';
    roundRectPath(cx - size * 0.16, cy + size * 0.14, size * 0.32, size * 0.12, size * 0.03);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const x = cx - size * 0.16 + (size * 0.32 / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, cy + size * 0.14);
      ctx.lineTo(x, cy + size * 0.26);
      ctx.stroke();
    }

  } else if (kind === 'thrower') {
    // big grin
    ctx.strokeStyle = '#123';
    ctx.lineWidth = Math.max(2, size * 0.03);
    ctx.beginPath();
    ctx.arc(cx, cy + size * 0.08, size * 0.20, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    // tongue
    ctx.fillStyle = '#ff6b9d';
    ctx.beginPath();
    ctx.ellipse(cx + size * 0.02, cy + size * 0.27, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    // brows
    ctx.strokeStyle = '#123';
    ctx.lineWidth = Math.max(2, size * 0.025);
    ctx.beginPath();
    ctx.moveTo(cx - eyeDX - eyeR * 0.8, eyeY - eyeR * 1.5);
    ctx.lineTo(cx - eyeDX + eyeR * 0.8, eyeY - eyeR * 1.5);
    ctx.moveTo(cx + eyeDX - eyeR * 0.8, eyeY - eyeR * 1.5);
    ctx.lineTo(cx + eyeDX + eyeR * 0.8, eyeY - eyeR * 1.5);
    ctx.stroke();

  } else if (kind === 'boss') {
    // glowing eyes
    ctx.save();
    ctx.shadowColor = '#ff2b5e';
    ctx.shadowBlur = size * 0.12;
    ctx.fillStyle = '#ff2b5e';
    circle(cx - eyeDX, eyeY, eyeR * 0.5);
    circle(cx + eyeDX, eyeY, eyeR * 0.5);
    ctx.restore();

    // jagged mouth
    const my = cy + size * 0.16;
    const mw = size * 0.26;
    ctx.fillStyle = '#1a0010';
    ctx.beginPath();
    ctx.moveTo(cx - mw, my);
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(cx - mw + (mw * 2) * ((i + 0.5) / 5), my + size * 0.10);
      ctx.lineTo(cx - mw + (mw * 2) * ((i + 1) / 5), my);
    }
    ctx.lineTo(cx + mw, my + size * 0.14);
    ctx.lineTo(cx - mw, my + size * 0.14);
    ctx.closePath();
    ctx.fill();

    // horns
    ctx.fillStyle = '#3a1060';
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.36, cy - size * 0.50);
    ctx.lineTo(cx - size * 0.50, cy - size * 0.84);
    ctx.lineTo(cx - size * 0.18, cy - size * 0.62);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.36, cy - size * 0.50);
    ctx.lineTo(cx + size * 0.50, cy - size * 0.84);
    ctx.lineTo(cx + size * 0.18, cy - size * 0.62);
    ctx.closePath();
    ctx.fill();
  }
}

// ------------------------------------------------------------
//  ACTOR
// ------------------------------------------------------------
function drawActor(a, kind, t) {
  const look = LOOKS[kind] || LOOKS[(kind && typeof kind === 'string' && kind.startsWith('acp')) ? 'acp' : null] || LOOKS.grunt;
  const feetY = a.y + a.h;
  const cx = a.x + a.w / 2;

  // shadow
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(cx, GROUND + 6, a.w * 0.55, Math.max(6, a.w * 0.12), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const isBoss = kind === 'boss';
  const isAcp = kind === 'acp' || (kind && typeof kind === 'string' && kind.startsWith('acp'));
  const headSize = isBoss ? a.h * 0.62 : (isAcp ? a.h * 0.48 : a.h * 0.56);
  const headCY = a.y + headSize * 0.52;
  const torsoTop = a.y + headSize * 0.92;
  const torsoBottom = feetY - a.h * 0.10;
  const torsoW = a.w * 0.62;
  const tx = cx - torsoW / 2;
  const th = Math.max(8, torsoBottom - torsoTop);

  // legs
  const moving = Math.abs(a.vx || 0) > 20;
  const swing = moving ? Math.sin(t * 14 + (a.anim || 0) * 3) : 0;
  const legW = Math.max(8, a.w * 0.20);
  const legH = Math.max(6, feetY - torsoBottom + 6);
  ctx.fillStyle = look.pants;
  roundRectPath(cx - a.w * 0.28 + swing * a.w * 0.10, torsoBottom - 4, legW, legH, 6);
  ctx.fill();
  roundRectPath(cx + a.w * 0.08 - swing * a.w * 0.10, torsoBottom - 4, legW, legH, 6);
  ctx.fill();

  // torso
  ctx.fillStyle = look.shirt;
  roundRectPath(tx, torsoTop, torsoW, th, a.w * 0.12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // belt
  ctx.fillStyle = look.accent;
  ctx.fillRect(tx, torsoBottom - a.h * 0.055, torsoW, Math.max(3, a.h * 0.035));

  // arms
  ctx.fillStyle = look.skin;
  const armW = Math.max(7, a.w * 0.15);
  const armY = torsoTop + th * 0.12;
  const armLen = th * 0.72;
  const attacking = a.state === 'attack' || a.state === 'strike' || a.state === 'charge' || a.state === 'dash';

  roundRectPath(tx - armW * 0.5, armY, armW, armLen, armW * 0.5);
  ctx.fill();

  if (attacking) {
    const ext = a.w * 0.55;
    const fx = a.facing > 0 ? tx + torsoW - armW * 0.2 : tx - armW * 0.8 - ext;
    roundRectPath(fx, armY + armLen * 0.15, armW + ext, armW, armW * 0.5);
    ctx.fill();
  } else {
    const fx = a.facing > 0 ? tx + torsoW - armW * 0.6 : tx - armW * 0.4;
    roundRectPath(fx, armY, armW, armLen, armW * 0.5);
    ctx.fill();
  }

  // badge
  if (kind === 'acp') {
    ctx.fillStyle = '#ffd24a';
    circle(cx + a.facing * torsoW * 0.16, torsoTop + th * 0.30, Math.max(3, a.w * 0.055));
  }

  // head
  drawHead(kind, cx, headCY, headSize, a.facing, t);

  // hurt flash
  if (a.flash > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(a.flash * 4, 0, 0.55);
    ctx.fillStyle = '#fff';
    roundRectPath(a.x - 2, a.y - 2, a.w + 4, a.h + 4, 14);
    ctx.fill();
    ctx.restore();
  }
}

// ------------------------------------------------------------
//  BACKGROUND
// ------------------------------------------------------------
function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND);
  g.addColorStop(0, '#160a2c');
  g.addColorStop(0.6, '#2a0f45');
  g.addColorStop(1, '#3a1550');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, viewW, GROUND);

  // moon
  const mx = viewW * 0.78 - cam.x * 0.02;
  ctx.save();
  ctx.shadowColor = '#ff7ad9';
  ctx.shadowBlur = 50;
  ctx.fillStyle = 'rgba(255,210,240,0.9)';
  circle(mx, 90, 40);
  ctx.restore();

  // stars
  for (const s of stars) {
    const x = ((s.x - cam.x * 0.05) % viewW + viewW) % viewW;
    const a = 0.25 + 0.5 * Math.abs(Math.sin(now * 1.3 + s.tw));
    ctx.fillStyle = `rgba(200,180,255,${a})`;
    ctx.fillRect(x, s.y * GROUND, s.s, s.s);
  }

  drawCity(cam.x * 0.18, '#1a0f33', 0.7, 0.9);
  drawCity(cam.x * 0.34, '#241343', 0.85, 1.15);
  drawTape();
  drawGround();
}

function drawCity(offset, color, alpha, heightScale) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const bw = 130;
  const start = Math.floor(offset / bw) - 1;
  const count = Math.ceil(viewW / bw) + 3;
  for (let i = start; i < start + count; i++) {
    const x = i * bw - offset;
    const seed = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    const h = (120 + seed * 150) * heightScale;
    ctx.fillStyle = color;
    ctx.fillRect(x, GROUND - h, bw - 12, h);
    ctx.fillStyle = 'rgba(0,240,255,0.10)';
    for (let wy = GROUND - h + 18; wy < GROUND - 24; wy += 30) {
      for (let wx = x + 14; wx < x + bw - 26; wx += 28) {
        if (((wx + wy + i) | 0) % 3 === 0) ctx.fillRect(wx, wy, 10, 12);
      }
    }
  }
  ctx.restore();
}

function drawTape() {
  const y = GROUND - 190;
  const off = (cam.x * 0.5) % 300;
  ctx.save();
  ctx.globalAlpha = 0.72;
  ctx.fillStyle = '#ffd24a';
  ctx.fillRect(0, y, viewW, 26);
  ctx.fillStyle = '#1a1020';
  ctx.font = '700 13px ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let x = -off; x < viewW; x += 300) {
    ctx.fillText('CRIME SCENE  \u2022  KUCH TOH GADBAD HAI  \u2022', x + 16, y + 14);
  }
  ctx.restore();
}

function drawGround() {
  ctx.fillStyle = '#0c0716';
  ctx.fillRect(0, GROUND, viewW, VIEW_H - GROUND);

  ctx.save();
  ctx.shadowColor = '#ff4fd8';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#ff4fd8';
  ctx.fillRect(0, GROUND - 2, viewW, 3);
  ctx.restore();

  const off = cam.x % 120;
  ctx.fillStyle = 'rgba(255,225,79,0.22)';
  for (let x = -off; x < viewW; x += 120) {
    ctx.fillRect(x, GROUND + 44, 60, 4);
  }

  ctx.fillStyle = 'rgba(255,79,216,0.05)';
  ctx.fillRect(0, GROUND, viewW, 40);
}
