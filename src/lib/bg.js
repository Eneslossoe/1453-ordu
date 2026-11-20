// Arka planlar. Hepsi "dünya" koordinatında çizilir (1920x1080 ekran, kamera için iki yana taşar).
const C = require('./core');
const { W, H, INK, clamp, lerp, ease, rng, hash, noise1, col, mix, shade, rgba, ol, rr, ell, circ, poly, line, tube, glow, setTint, T, TIMES } = C;
const X0 = -560, X1 = 2480;

const SKY = {
  day: ['#5aa9e6', '#a9d8f5', '#e3f4ff'],
  golden: ['#e9955a', '#f6c987', '#fff0c8'],
  sunrise: ['#4c6fb5', '#f2a46e', '#ffe1a0'],
  dawn: ['#27306a', '#9a5a86', '#f0a070'],
  predawn: ['#0f1535', '#2e2f5e', '#6a4f78'],
  dusk: ['#251c4a', '#8e3f6a', '#f08a5d'],
  night: ['#070b22', '#141d44', '#2a3766'],
};
const CYCLE = ['day', 'golden', 'dusk', 'night', 'night', 'dawn', 'day'];
function timeInfo(o) {
  if (o.cycle != null) {
    const f = clamp(o.cycle) * (CYCLE.length - 1), i = Math.min(CYCLE.length - 2, Math.floor(f)), k = f - i;
    const a = CYCLE[i], b = CYCLE[i + 1];
    return { name: k < 0.5 ? a : b, sky: SKY[a].map((c, j) => mix(c, SKY[b][j], k)), tint: TIMES[a].map((v, j) => lerp(v, TIMES[b][j], k)), nightK: (a === 'night' ? 1 - (b === 'night' ? 0 : k) : b === 'night' ? k : 0) };
  }
  const n = o.time || 'day';
  return { name: n, sky: SKY[n] || SKY.day, tint: TIMES[n] || [1, 1, 1], nightK: n === 'night' ? 1 : n === 'predawn' ? 0.7 : 0 };
}

function sky(ctx, ti, t, o = {}) {
  const g = ctx.createLinearGradient(0, -200, 0, o.horizon || 760);
  g.addColorStop(0, ti.sky[0]); g.addColorStop(0.55, ti.sky[1]); g.addColorStop(1, ti.sky[2]);
  ctx.fillStyle = g; ctx.fillRect(X0, -400, X1 - X0, H + 800);
  if (ti.nightK > 0) {
    const r = rng(7);
    ctx.fillStyle = `rgba(255,255,240,${0.85 * ti.nightK})`;
    for (let i = 0; i < 160; i++) {
      const x = X0 + r() * (X1 - X0), y = -200 + r() * 700, s = r() * 2.2 + 0.6;
      const tw = 0.6 + 0.4 * Math.sin(t * (1 + r() * 2) + i);
      ctx.globalAlpha = tw * ti.nightK; circ(ctx, x, y, s); ctx.fill();
    }
    ctx.globalAlpha = ti.nightK;
    circ(ctx, 1200, 100, 54); ctx.fillStyle = '#f6f0d8'; ctx.fill();
    circ(ctx, 1222, 86, 50); ctx.fillStyle = ti.sky[0]; ctx.fill();
    ctx.globalAlpha = 1;
    glow(ctx, 1200, 100, 220, '#cfd8ff', 0.18 * ti.nightK);
  }
  const n = ti.name;
  if (n === 'sunrise' || n === 'golden' || n === 'dusk' || n === 'dawn') {
    const sy = n === 'golden' ? 330 : 560;
    glow(ctx, 1380, sy, 520, n === 'dusk' ? '#ff8a50' : '#ffd27a', 0.55);
    circ(ctx, 1380, sy, n === 'golden' ? 70 : 90); ctx.fillStyle = rgba(n === 'dusk' ? '#ffb070' : '#fff1c4', 0.95); ctx.fill();
  }
  if (n !== 'night' && n !== 'predawn' && !o.noClouds) clouds(ctx, t, n === 'day' ? '#ffffff' : mix(ti.sky[1], '#ffffff', 0.45));
}

function clouds(ctx, t, c) {
  const r = rng(3);
  ctx.fillStyle = rgba(c, 0.85);
  for (let i = 0; i < 7; i++) {
    const bx = ((r() * (X1 - X0) + t * (8 + r() * 6)) % (X1 - X0)) + X0, by = 60 + r() * 260, s = 0.6 + r() * 0.8;
    for (let j = 0; j < 5; j++) { ell(ctx, bx + (j - 2) * 46 * s, by - Math.sin(j / 4 * Math.PI) * 26 * s, 60 * s, 34 * s); ctx.fill(); }
  }
}

function softPuff(ctx, x, y, r, c, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(c, a)); g.addColorStop(0.6, rgba(c, a * 0.7)); g.addColorStop(1, rgba(c, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
// ── yapı taşları ──
function merlons(ctx, x0, x1, y, c, size = 26) {
  for (let x = x0 + 4; x < x1 - size * 0.6; x += size * 1.7) { ctx.beginPath(); ctx.rect(x, y - size, size, size + 2); ol(ctx, c, 4); }
}
function stoneWall(ctx, x0, y0, x1, y1, c, band = '#a5523c') {
  ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ol(ctx, c, 5);
  ctx.fillStyle = col(band);
  for (let y = y0 + 40; y < y1 - 20; y += 70) ctx.fillRect(x0 + 2.5, y, x1 - x0 - 5, 9);
  ctx.strokeStyle = col(shade(c, -0.18)); ctx.lineWidth = 2;
  for (let y = y0 + 18; y < y1; y += 22) {
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.globalAlpha = 0.35; ctx.stroke(); ctx.globalAlpha = 1;
  }
}
function tower(ctx, x, y, w, h, c, o = {}) {
  stoneWall(ctx, x - w / 2, y, x + w / 2, y + h, c);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x + w * 0.18, y + 2, w * 0.32 - 2, h - 4);
  merlons(ctx, x - w / 2 - 6, x + w / 2 + 6, y, c, o.ms || 22);
  for (const wy of o.win || [0.3]) {
    const yy = y + h * wy;
    ctx.beginPath(); ctx.moveTo(x - 9, yy + 26); ctx.lineTo(x - 9, yy + 8); ctx.arc(x, yy + 8, 9, Math.PI, 0); ctx.lineTo(x + 9, yy + 26); ctx.closePath();
    ol(ctx, '#2a2420', 3);
  }
}
function flag(ctx, x, y, h, c, t, o = {}) {
  line(ctx, x, y, x, y - h, 5, '#5a3a22');
  circ(ctx, x, y - h - 5, 6); ol(ctx, '#e0b13c', 3);
  const L = o.len || 70, fh = o.fh || 44;
  ctx.beginPath(); ctx.moveTo(x, y - h);
  for (let i = 0; i <= 6; i++) ctx.lineTo(x + i * L / 6, y - h + Math.sin(i * 0.9 - t * 6 + x) * 5 * (i / 6));
  for (let i = 6; i >= 0; i--) ctx.lineTo(x + i * L / 6, y - h + fh + Math.sin(i * 0.9 - t * 6 + x) * 5 * (i / 6));
  ctx.closePath(); ol(ctx, c, 3.5);
  if (o.cross) { line(ctx, x + L * 0.45, y - h + 8, x + L * 0.45, y - h + fh - 8, 5, '#f0c24e'); line(ctx, x + 12, y - h + fh / 2, x + L - 12, y - h + fh / 2, 5, '#f0c24e'); }
  if (o.crescent) { ctx.beginPath(); ctx.arc(x + L * 0.45, y - h + fh / 2, fh * 0.28, 0, Math.PI * 2); ctx.fillStyle = col('#ffffff'); ctx.fill(); ctx.beginPath(); ctx.arc(x + L * 0.45 + fh * 0.1, y - h + fh / 2, fh * 0.23, 0, Math.PI * 2); ctx.fillStyle = col(c); ctx.fill(); }
}
function torchFlame(ctx, x, y, t, s = 1) {
  line(ctx, x, y, x, y + 26 * s, 5 * s, '#4a3020');
  const f = 1 + noise1(t * 8 + x) * 0.18;
  ctx.beginPath(); ctx.moveTo(x - 8 * s, y); ctx.quadraticCurveTo(x - 9 * s, y - 18 * s * f, x, y - 30 * s * f); ctx.quadraticCurveTo(x + 9 * s, y - 18 * s * f, x + 8 * s, y); ctx.closePath();
  ctx.fillStyle = '#ffae3a'; ctx.fill();
  ell(ctx, x, y - 8 * s, 4 * s, 9 * s * f); ctx.fillStyle = '#fff1a0'; ctx.fill();
  glow(ctx, x, y - 12 * s, 110 * s * f, '#ff9a3a', 0.42);
}
function tent(ctx, x, y, s, c = '#f2ebdc', trim = '#b5402f', o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ell(ctx, 0, 4, 150, 16); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-140, 0); ctx.quadraticCurveTo(-110, -90, -18, -190); ctx.lineTo(18, -190); ctx.quadraticCurveTo(110, -90, 140, 0); ctx.closePath(); ol(ctx, c, 5);
  if (o.stripes) { ctx.save(); ctx.clip(); ctx.fillStyle = col(trim); for (let i = -6; i < 6; i++) { ctx.beginPath(); ctx.moveTo(i * 44, 0); ctx.lineTo(i * 44 + 20, 0); ctx.lineTo(i * 6 + 3, -200); ctx.lineTo(i * 6, -200); ctx.fill(); } ctx.restore(); ctx.beginPath(); ctx.moveTo(-140, 0); ctx.quadraticCurveTo(-110, -90, -18, -190); ctx.lineTo(18, -190); ctx.quadraticCurveTo(110, -90, 140, 0); ctx.closePath(); ol(ctx, null, 5); }
  ctx.beginPath(); ctx.moveTo(-124, -38); ctx.quadraticCurveTo(0, -56, 124, -38); ctx.lineTo(132, -18); ctx.quadraticCurveTo(0, -36, -132, -18); ctx.closePath(); ol(ctx, trim, 4);
  poly(ctx, [[-30, 0], [0, -100], [30, 0]]); ol(ctx, shade(c, -0.35), 4);
  line(ctx, 0, -190, 0, -226, 5, '#5a3a22'); circ(ctx, 0, -232, 9); ol(ctx, '#e0b13c', 3.5);
  ctx.restore();
}
function tree(ctx, x, y, s, c = '#4f7a3a', kind = 'round') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(ctx, -10, -70, 20, 72, 6); ol(ctx, '#6b4a2b', 4);
  if (kind === 'cypress') { ctx.beginPath(); ctx.moveTo(0, -260); ctx.quadraticCurveTo(38, -150, 22, -50); ctx.quadraticCurveTo(0, -38, -22, -50); ctx.quadraticCurveTo(-38, -150, 0, -260); ol(ctx, shade(c, -0.15), 4); }
  else { circ(ctx, -30, -100, 44); ol(ctx, c, 4); circ(ctx, 30, -104, 46); ol(ctx, c, 4); circ(ctx, 0, -140, 52); ol(ctx, shade(c, 0.08), 4); }
  ctx.restore();
}
function house(ctx, x, y, s, wallC = '#efe3c8', roofC = '#b8553a') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.rect(-70, -90, 140, 90); ol(ctx, wallC, 4);
  poly(ctx, [[-86, -86], [0, -150], [86, -86]]); ol(ctx, roofC, 4);
  rr(ctx, -16, -50, 32, 50, 4); ol(ctx, '#7a4a28', 3.5);
  ctx.beginPath(); ctx.rect(34, -66, 22, 20); ol(ctx, '#5a6f86', 3);
  ctx.restore();
}
function dome(ctx, x, y, r, c) {
  ctx.beginPath(); ctx.moveTo(x - r, y); ctx.bezierCurveTo(x - r, y - r * 1.15, x + r, y - r * 1.15, x + r, y); ctx.closePath(); ol(ctx, c, 4);
}
function ground(ctx, y, c1, c2) {
  const g = ctx.createLinearGradient(0, y, 0, H + 100);
  g.addColorStop(0, col(c1)); g.addColorStop(1, col(c2));
  ctx.fillStyle = g; ctx.fillRect(X0, y, X1 - X0, H - y + 400);
}
function tufts(ctx, y0, y1, c, n, seed = 1) {
  const r = rng(seed); ctx.strokeStyle = col(c); ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = X0 + r() * (X1 - X0), y = y0 + r() * (y1 - y0), s = 0.5 + (y - y0) / (y1 - y0 + 1);
    ctx.beginPath(); ctx.moveTo(x - 8 * s, y - 14 * s); ctx.lineTo(x, y); ctx.lineTo(x + 2 * s, y - 18 * s); ctx.moveTo(x, y); ctx.lineTo(x + 10 * s, y - 12 * s); ctx.stroke();
  }
}
function citySkyline(ctx, y, s, c, o = {}) {
  ctx.save(); ctx.translate(0, y); ctx.scale(1, s);
  const r = rng(o.seed || 11);
  for (let x = X0; x < X1; x += 60 + r() * 50) { const h = 30 + r() * 50; ctx.beginPath(); ctx.rect(x, -h, 70 + r() * 40, h + 10); ol(ctx, shade(c, r() * 0.1 - 0.05), 3); }
  if (o.sofia !== false) { const sx = o.sofiaX || 1050; dome(ctx, sx - 90, -90, 50, c); dome(ctx, sx + 90, -90, 50, c); ctx.beginPath(); ctx.rect(sx - 150, -100, 300, 110); ol(ctx, c, 3); dome(ctx, sx, -98, 110, shade(c, 0.05)); }
  dome(ctx, 520, -60, 40, c); dome(ctx, 1500, -50, 34, c); dome(ctx, 300, -46, 28, c);
  ctx.restore();
}

// ── SURLAR ──
const GAPS = [980, 560, 1400];
function walls(ctx, o, t, ti) {
  const close = !!o.close;
  sky(ctx, ti, t, { noClouds: o.noClouds });
  setTint(ti.tint, 1);
  ctx.save();
  if (close) { ctx.translate(960, 300); ctx.scale(2.2, 2.2); ctx.translate(-960, -470); }
  // şehir silueti
  citySkyline(ctx, 318, 1, '#8c8fa3', { sofiaX: 1250 });
  const inner = () => {
    stoneWall(ctx, X0, 300, X1, 660, '#bcaa8c');
    merlons(ctx, X0, X1, 300, '#bcaa8c', 24);
    for (let x = X0 + 110; x < X1; x += 330) tower(ctx, x, 196, 140, 470, '#c4b294', { win: [0.12, 0.36] });
  };
  inner();
  // bizans / osmanlı bayrakları iç kulelerde
  for (let x = X0 + 110 + 330 * 2; x < X1; x += 660) {
    if (o.ottomanFlags) flag(ctx, x, 172, 70, '#c0272d', t, { crescent: true });
    else if (!o.noFlags) flag(ctx, x, 172, 70, '#9c2430', t, { cross: true });
  }
  // dış sur
  const outerY = 474, outerB = 690;
  ctx.save();
  const gaps = GAPS.slice(0, o.damage || 0);
  stoneWall(ctx, X0, outerY, X1, outerB, '#cdbb9b');
  merlons(ctx, X0, X1, outerY, '#cdbb9b', 22);
  for (let x = X0 + 275; x < X1; x += 330) {
    if (gaps.some((g) => Math.abs(g - x) < 120)) continue;
    tower(ctx, x, 420, 112, 270, '#d4c3a4', { win: [0.25] });
  }
  ctx.restore();
  // gedikler
  for (const gx of gaps) {
    ctx.save();
    const r = rng(gx);
    const pts = [[gx - 100, outerB + 2], [gx - 104, outerY + 60]];
    for (let i = 0; i <= 8; i++) pts.push([gx - 96 + i * 24, outerY - 30 + r() * 70 + Math.sin(i / 8 * Math.PI) * 50]);
    pts.push([gx + 104, outerY + 60], [gx + 100, outerB + 2]);
    poly(ctx, pts); ctx.save(); ctx.clip(); inner(); ground(ctx, 650, '#7f6e4c', '#7f6e4c'); ctx.restore();
    poly(ctx, pts); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    if (o.repair && ti.nightK > 0.3) {
      for (let i = 0; i < 9; i++) { rr(ctx, gx - 92 + i * 21, outerY + 50 + (i % 3) * 8, 19, outerB - outerY - 40, 4); ol(ctx, '#8a5a32', 3.5); }
      for (const bx of [gx - 50, gx + 30]) { rr(ctx, bx, outerB - 70, 44, 60, 10); ol(ctx, '#7a5530', 3.5); }
    }
    for (let i = 0; i < 14; i++) { circ(ctx, gx - 110 + r() * 220, outerB + 4 - r() * 26, 10 + r() * 16); ol(ctx, mix('#cdbb9b', '#8a7a62', r()), 3.5); }
  }
  // kapı
  if (o.gate) {
    const gx = 1210;
    rr(ctx, gx - 120, 380, 240, 312, 6); ol(ctx, '#c9b696', 5); merlons(ctx, gx - 126, gx + 126, 380, '#c9b696', 22);
    ctx.beginPath(); ctx.moveTo(gx - 70, outerB); ctx.lineTo(gx - 70, 540); ctx.arc(gx, 540, 70, Math.PI, 0); ctx.lineTo(gx + 70, outerB); ctx.closePath(); ol(ctx, '#2b2218', 5);
    ctx.save(); ctx.clip(); ctx.fillStyle = rgba('#ffe7b0', 0.55); ctx.fillRect(gx - 60, 520, 120, 200); ctx.restore();
    flag(ctx, gx - 100, 356, 60, '#c0272d', t, { crescent: true }); flag(ctx, gx + 60, 356, 60, '#c0272d', t, { crescent: true });
  }
  // hasan'ın kulesi (sancak dikme)
  if (o.flagTower > 0) {
    const fx = 1180;
    tower(ctx, fx, 400, 130, 290, '#d4c3a4', { win: [0.25] });
    const k = ease.out(o.flagTower);
    ctx.save(); ctx.translate(fx + 30, 378); ctx.rotate((1 - k) * -1.2);
    line(ctx, 0, 0, 0, -150, 6, '#5a3a22'); circ(ctx, 0, -156, 8); ol(ctx, '#e0b13c', 3);
    ctx.beginPath(); ctx.moveTo(0, -150); for (let i = 0; i <= 6; i++) ctx.lineTo(i * 18, -150 + Math.sin(i - t * 7) * 6 * (i / 6));
    for (let i = 6; i >= 0; i--) ctx.lineTo(i * 18, -90 + Math.sin(i - t * 7) * 6 * (i / 6)); ctx.closePath(); ol(ctx, '#c0272d', 4);
    ctx.restore();
  }
  // savunucular (dış sur üstü)
  if (o.defenders) {
    for (let x = X0 + 120; x < X1; x += 150) {
      if (gaps.some((g) => Math.abs(g - x) < 120)) continue;
      const b = Math.sin(t * 2 + x) * 3;
      circ(ctx, x, outerY - 30 + b, 15); ol(ctx, '#e8c9a0', 3.5);
      ctx.beginPath(); ctx.arc(x, outerY - 34 + b, 16, Math.PI, 0); ol(ctx, '#9aa3ad', 3.5);
    }
  }
  if (o.torches) for (let x = X0 + 200; x < X1; x += 330) torchFlame(ctx, x, outerY - 34, t, close ? 0.8 : 1);
  // hendek önü korkuluk + hendek
  stoneWall(ctx, X0, outerB, X1, outerB + 26, '#b4a283', '#b4a283');
  ctx.beginPath(); ctx.rect(X0, outerB + 26, X1 - X0, 52); ol(ctx, '#3c5560', 4);
  ctx.strokeStyle = col('#6c8c96'); ctx.lineWidth = 3;
  for (let i = 0; i < 30; i++) { const x = X0 + ((i * 113 + t * 20) % (X1 - X0)); ctx.beginPath(); ctx.moveTo(x, outerB + 46 + (i % 3) * 10); ctx.lineTo(x + 40, outerB + 46 + (i % 3) * 10); ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1; }
  ctx.restore();
  // ön zemin
  const gy = close ? 916 : 768;
  ground(ctx, gy, '#8a7a52', '#5e5236');
  tufts(ctx, gy + 10, H, '#5d6b38', close ? 40 : 70, 5);
  if (o.ladder) {
    ctx.save(); ctx.translate(1010, 1060); ctx.rotate(0.12);
    line(ctx, -60, 0, -60, -800, 12, '#8a5a32'); line(ctx, 60, 0, 60, -800, 12, '#8a5a32');
    for (let y = -40; y > -800; y -= 70) line(ctx, -60, y, 60, y, 9, '#9a6a3a');
    ctx.restore();
  }
  if (o.defendersClose) {
    // yakın plan: dış sur üstünde birkaç savunucu (kafa+omuz)
    for (const x of [380, 1560]) {
      circ(ctx, x, 238, 34); ol(ctx, '#e8c9a0', 4);
      ctx.beginPath(); ctx.arc(x, 230, 36, Math.PI, 0); ol(ctx, '#9aa3ad', 4);
    }
  }
}

// ── ORDUGÂH ──
function camp(ctx, o, t, ti) {
  sky(ctx, ti, t, {});
  setTint(ti.tint, 1);
  // ufukta surlar
  ctx.save(); ctx.translate(0, 600); ctx.scale(1, 1);
  ctx.fillStyle = col('#9a9aa8');
  ctx.beginPath(); ctx.rect(X0, -46, X1 - X0, 46); ol(ctx, '#a7a2a0', 3);
  for (let x = X0 + 40; x < X1; x += 130) { ctx.beginPath(); ctx.rect(x, -76, 40, 76); ol(ctx, '#aca7a3', 3); }
  ctx.restore();
  ground(ctx, 600, '#9c9a5e', '#6f6a3e');
  tufts(ctx, 640, H, '#5f6b34', 60, 9);
  if (o.otag) {
    ctx.save(); ctx.translate(960, 640); ctx.scale(2.1, 1.7);
    ctx.beginPath(); ctx.moveTo(-170, 0); ctx.lineTo(-150, -110); ctx.quadraticCurveTo(0, -200, 150, -110); ctx.lineTo(170, 0); ctx.closePath(); ol(ctx, '#b3242c', 4);
    ctx.beginPath(); ctx.moveTo(-150, -110); ctx.quadraticCurveTo(0, -150, 150, -110); ctx.lineWidth = 8; ctx.strokeStyle = col('#f0c24e'); ctx.stroke();
    for (let i = -3; i <= 3; i++) line(ctx, i * 46, -6, i * 44, -104 + Math.abs(i) * 4, 3, '#f0c24e');
    rr(ctx, -30, -80, 60, 80, 8); ol(ctx, '#5a1219', 3);
    line(ctx, 0, -168, 0, -210, 5, '#5a3a22'); circ(ctx, 0, -216, 10); ol(ctx, '#f0c24e', 3);
    ctx.restore();
    flag(ctx, 560, 650, 220, '#c0272d', t, { len: 90, fh: 56 }); flag(ctx, 1360, 650, 220, '#c0272d', t, { len: 90, fh: 56 });
  }
  const tents = [[-200, 640, 0.42], [120, 646, 0.4], [420, 640, 0.44], [760, 650, 0.4], [1180, 644, 0.42], [1500, 650, 0.45], [1820, 642, 0.4], [2160, 648, 0.42],
    [-60, 700, 0.62], [380, 712, 0.66], [1440, 706, 0.64], [1900, 714, 0.66], [2300, 700, 0.6]];
  const r = rng(21);
  for (const [x, y, s] of tents) {
    if (o.otag && Math.abs(x - 960) < 420 && y < 690) continue;
    const k = r();
    tent(ctx, x, y, s, k < 0.25 ? '#c94a3a' : k < 0.4 ? '#e8dcc0' : '#f2ebdc', k < 0.25 ? '#f0c24e' : '#b5402f', { stripes: k > 0.82 });
  }
  if (!o.otag) { flag(ctx, 250, 700, 200, '#c0272d', t, {}); flag(ctx, 1660, 712, 190, '#2f6b3a', t, {}); }
  // duman sütunları
  for (const [x, y] of [[260, 640], [1300, 660], [1980, 650]]) smoke(ctx, x, y, t, 0.7, ti.nightK > 0.5 ? '#3a3f55' : '#d8d2c8');
  if (ti.nightK > 0.5) for (const [x, y] of [[260, 660], [1300, 680], [1980, 670]]) glow(ctx, x, y, 160, '#ff8a3a', 0.4);
}
function smoke(ctx, x, y, t, s = 1, c = '#d8d2c8', n = 8) {
  for (let i = 0; i < n; i++) {
    const k = ((t * 0.25 + i / n) % 1);
    const px = x + Math.sin(k * 4 + i) * 30 * s + k * 80 * s, py = y - k * 420 * s;
    softPuff(ctx, px, py, (26 + k * 70) * s, c, 0.5 * (1 - k));
  }
}

// ── KIRSAL ──
function country(ctx, o, t, ti) {
  sky(ctx, ti, t, {});
  setTint(ti.tint, 1);
  const sc = o.scroll || 0;
  const hills = (y, amp, c, par, seed) => {
    ctx.beginPath(); ctx.moveTo(X0, H + 100);
    for (let x = X0; x <= X1; x += 40) ctx.lineTo(x, y - (noise1((x + sc * par) / 380 + seed) + 1) * amp);
    ctx.lineTo(X1, H + 100); ctx.closePath(); ol(ctx, c, 4);
  };
  if (o.hilltop) {
    hills(640, 50, '#7f8fa0', 0, 2);
    ctx.fillStyle = col('#9fb6c8'); ctx.fillRect(X0, 600, X1 - X0, 20);
    hills(700, 40, '#6f8a52', 0, 4);
    ctx.beginPath(); ctx.moveTo(X0, H + 50); ctx.quadraticCurveTo(300, 860, 900, 770); ctx.quadraticCurveTo(1500, 860, X1, H + 50); ctx.closePath(); ol(ctx, '#5e7a3e', 5);
    tufts(ctx, 800, H, '#45602c', 40, 3);
    return;
  }
  hills(600, 70, '#8fa6b0', 0.08, 1);
  hills(690, 80, '#86a35a', 0.3, 5);
  if (o.village) {
    const off = -(sc * 0.3) % 1400;
    for (let k = -1; k < 3; k++) for (const [x, y, s] of [[200, 640, 0.55], [330, 660, 0.6], [470, 645, 0.5], [1500, 650, 0.55], [1650, 668, 0.6]]) house(ctx, x + k * 1400 + off, y, s);
  }
  for (let k = -1; k < 4; k++) { const off = -(sc * 0.3) % 900; tree(ctx, 100 + k * 900 + off, 690, 0.6, '#5a8a3e'); tree(ctx, 640 + k * 900 + off, 700, 0.5, '#4f7a3a', 'cypress'); }
  ground(ctx, 760, '#9cb25e', '#6f8a3e');
  if (o.fields) {
    for (let i = 0; i < 6; i++) { ctx.save(); ctx.beginPath(); ctx.rect(1080 + (i % 3) * 300, 770 + Math.floor(i / 3) * 70, 290, 64); ol(ctx, i % 2 ? '#c9b25e' : '#a9b856', 3); ctx.restore(); }
  }
  if (o.road) { ctx.beginPath(); ctx.moveTo(X0, 880); ctx.quadraticCurveTo(960, 850, X1, 890); ctx.lineTo(X1, 1000); ctx.quadraticCurveTo(960, 960, X0, 1010); ctx.closePath(); ol(ctx, '#c4a676', 4); }
  tufts(ctx, 780, H, '#5d7a34', 70, 2);
  // hızlı kayan yakın çimen/taş
  if (sc) { const r = rng(8); ctx.fillStyle = col('#7d6a4c'); for (let i = 0; i < 30; i++) { const x = ((r() * 3000 - sc) % 3000 + 3000) % 3000 - 560, y = 1000 + r() * 80; ell(ctx, x, y, 14, 7); ctx.fill(); } }
}

// ── MUTFAK ──
function kitchen(ctx, o, t, ti) {
  sky(ctx, ti, t, {});
  setTint(ti.tint, 1);
  ground(ctx, 640, '#9c9a5e', '#6f6a3e');
  for (const [x, s] of [[150, 0.4], [520, 0.38], [1650, 0.42], [2000, 0.4]]) tent(ctx, x, 650, s);
  ground(ctx, 700, '#a08a62', '#7a6646');
  // tente
  ctx.beginPath(); ctx.moveTo(X0, 0); ctx.lineTo(X1, 0); ctx.lineTo(X1, 170);
  for (let x = X1; x >= X0; x -= 80) ctx.quadraticCurveTo(x - 40, 210, x - 80, 170);
  ctx.closePath(); ol(ctx, '#e9dcc0', 5);
  ctx.save(); ctx.clip(); ctx.fillStyle = col('#b5402f'); for (let x = X0; x < X1; x += 160) ctx.fillRect(x, 0, 80, 220); ctx.restore();
  for (const x of [120, 1800]) { rr(ctx, x - 14, 150, 28, 700, 6); ol(ctx, '#7a5530', 4); }
  // raf + bakır kaplar
  rr(ctx, 1480, 420, 380, 22, 6); ol(ctx, '#8a5a32', 4);
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(1530 + i * 90, 395, 34, 26, 0, Math.PI, 0); ctx.lineTo(1564 + i * 90, 420); ctx.lineTo(1496 + i * 90, 420); ctx.closePath(); ol(ctx, '#c46a3a', 4); }
  // çuvallar, odun
  for (const [x, y] of [[260, 880], [350, 900], [300, 830]]) { ctx.beginPath(); ctx.moveTo(x - 50, y); ctx.quadraticCurveTo(x - 60, y - 90, x - 20, y - 110); ctx.lineTo(x + 20, y - 110); ctx.quadraticCurveTo(x + 60, y - 90, x + 50, y); ctx.closePath(); ol(ctx, '#d9c49a', 4); }
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5 - i; j++) { circ(ctx, 1640 + j * 46 + i * 23, 950 - i * 40, 22); ol(ctx, '#9a6a3a', 4); circ(ctx, 1640 + j * 46 + i * 23, 950 - i * 40, 9); ol(ctx, '#c49a6a', 2); }
}

// ── TÜNEL ──
function tunnel(ctx, o, t, ti) {
  setTint(TIMES.tunnel, 1);
  ctx.fillStyle = col('#4a3426'); ctx.fillRect(X0, -400, X1 - X0, H + 800);
  ctx.beginPath(); ctx.moveTo(X0, 330);
  for (let x = X0; x <= X1; x += 60) ctx.lineTo(x, 300 + noise1(x / 90) * 26);
  ctx.lineTo(X1, 960); for (let x = X1; x >= X0; x -= 60) ctx.lineTo(x, 950 + noise1(x / 70 + 5) * 14);
  ctx.closePath(); ol(ctx, '#7a5a42', 6);
  const r = rng(4);
  for (let i = 0; i < 40; i++) { const x = X0 + r() * (X1 - X0), y = r() < 0.5 ? 300 + r() * 120 : 860 + r() * 80; ell(ctx, x, y, 14 + r() * 20, 10 + r() * 12, r()); ol(ctx, '#8d6e54', 3); }
  for (let i = 0; i < 12; i++) { const x = X0 + r() * (X1 - X0); ctx.beginPath(); ctx.moveTo(x, 300); ctx.quadraticCurveTo(x + 10, 340, x - 6, 380 + r() * 40); ctx.lineWidth = 4; ctx.strokeStyle = col('#3a281c'); ctx.stroke(); }
  for (let x = X0 + 200; x < X1; x += 420) {
    rr(ctx, x - 16, 300, 32, 660, 6); ol(ctx, '#8a5a32', 4.5); rr(ctx, x + 280 - 16, 300, 32, 660, 6); ol(ctx, '#8a5a32', 4.5);
    rr(ctx, x - 40, 286, 360, 34, 8); ol(ctx, '#9a6a3a', 4.5);
  }
  ctx.fillStyle = 'rgba(30,18,10,0.35)'; ctx.fillRect(X0, 930, X1 - X0, 60);
  if (o.breach) {
    ctx.beginPath(); const bx = 1450, by = 640; for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI * 2, rr2 = 150 + (i % 2) * 40; ctx.lineTo(bx + Math.cos(a) * rr2 * 0.8, by + Math.sin(a) * rr2); }
    ctx.closePath(); ol(ctx, '#2a1a10', 6);
    glow(ctx, bx, by, 300, '#ff7a2a', 0.55);
  }
}

// ── KESİT (lağım şeması) ──
function section(ctx, o, t, ti) {
  sky(ctx, { ...ti, sky: SKY.day, name: 'day', nightK: 0 }, t, { horizon: 330, noClouds: true });
  setTint([1, 1, 1], 1);
  const gy = 330;
  const g = ctx.createLinearGradient(0, gy, 0, H);
  g.addColorStop(0, '#8a6a4a'); g.addColorStop(1, '#4a3424');
  ctx.fillStyle = g; ctx.fillRect(X0, gy, X1 - X0, H);
  ctx.strokeStyle = 'rgba(40,25,15,0.35)'; ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) { ctx.beginPath(); for (let x = X0; x <= X1; x += 50) ctx.lineTo(x, 420 + i * 110 + noise1(x / 200 + i) * 18); ctx.stroke(); }
  const r = rng(12);
  for (let i = 0; i < 26; i++) { ell(ctx, X0 + r() * (X1 - X0), 400 + r() * 640, 10 + r() * 18, 7 + r() * 10, r()); ol(ctx, '#7d6650', 3); }
  ctx.fillStyle = '#7fae4e'; ctx.fillRect(X0, gy - 6, X1 - X0, 14);
  line(ctx, X0, gy + 8, X1, gy + 8, 4);
  // osmanlı tarafı
  for (const x of [80, 560]) tent(ctx, x, gy, 0.42);
  flag(ctx, 420, gy, 120, '#c0272d', t, {});
  // kuyu
  ctx.beginPath(); ctx.rect(300, gy, 70, 330); ol(ctx, '#2e2016', 4);
  rr(ctx, 280, gy - 70, 110, 16, 5); ol(ctx, '#8a5a32', 4); line(ctx, 290, gy - 60, 290, gy, 8, '#8a5a32'); line(ctx, 380, gy - 60, 380, gy, 8, '#8a5a32');
  // surlar
  ctx.beginPath(); ctx.moveTo(1120, gy); ctx.quadraticCurveTo(1170, gy + 60, 1220, gy); ol(ctx, '#3c5560', 3);
  ctx.beginPath(); ctx.rect(1250, gy - 120, 90, 120); ol(ctx, '#cdbb9b', 4); merlons(ctx, 1250, 1340, gy - 120, '#cdbb9b', 16);
  ctx.beginPath(); ctx.rect(1450, gy - 190, 120, 190); ol(ctx, '#bcaa8c', 4); merlons(ctx, 1450, 1570, gy - 190, '#bcaa8c', 16);
  ctx.fillStyle = col('#a5523c'); ctx.fillRect(1452, gy - 150, 116, 7); ctx.fillRect(1452, gy - 80, 116, 7);
  flag(ctx, 1510, gy - 190, 60, '#9c2430', t, { cross: true, len: 50, fh: 32 });
  for (const [x, w] of [[1240, 110], [1440, 140]]) { ctx.beginPath(); ctx.rect(x, gy + 8, w, 80); ol(ctx, '#9a8a70', 3); }
  for (const x of [1700, 1850, 2000]) house(ctx, x, gy, 0.5, '#e8dcc0', '#9c4a3a');
  // osmanlı tüneli(leri)
  const tun = (y, len, crossed, idx) => {
    const x1 = 335 + len;
    ctx.beginPath(); ctx.moveTo(335, gy + 300); ctx.lineTo(335, y); ctx.lineTo(x1, y);
    ctx.lineWidth = 78; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.lineWidth = 66; ctx.strokeStyle = col('#2e2016'); ctx.stroke();
    for (let x = 420; x < x1 - 40; x += 80) { line(ctx, x, y - 30, x, y + 30, 6, '#8a5a32'); line(ctx, x - 12, y - 30, x + 12, y - 30, 6, '#8a5a32'); }
    if (crossed) {
      const k = clamp(crossed); ctx.save(); ctx.translate(x1 - 10, y); ctx.scale(k, k);
      line(ctx, -30, -30, 30, 30, 12, '#d62828'); line(ctx, 30, -30, -30, 30, 12, '#d62828'); ctx.restore();
    } else if (idx === 0) {
      // kazan minik madenci
      ctx.save(); ctx.translate(x1 - 6, y + 30); ctx.scale(0.24, 0.24);
      require('./person').drawPerson(ctx, { look: 'lagimci', x: 0, y: 0, s: 1, act: 'dig', prop: 'pickaxe', expr: 'determined', simple: true }, t);
      ctx.restore();
    }
  };
  if (o.many) {
    const ys = [640, 560, 760, 700, 600], lens = [1050, 900, 980, 760, 1120];
    ys.forEach((y, i) => tun(y, lens[i], (o.crossed || 0) - i * 0.35 > 0 ? (o.crossed - i * 0.35) * 2 : 0, i + 1));
  } else {
    const len = clamp(o.progress ?? 1) * 1000;
    tun(600, len, 0, 0);
    if (o.counter) {
      const k = clamp(o.counter);
      const x1 = 1800 - k * 440;
      ctx.beginPath(); ctx.moveTo(1800, gy); ctx.lineTo(1800, 600); ctx.lineTo(x1, 600);
      ctx.lineWidth = 78; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineWidth = 66; ctx.strokeStyle = col('#3a1e1e'); ctx.stroke();
      ctx.save(); ctx.translate(x1 + 60, 630); ctx.scale(0.24, 0.24);
      require('./person').drawPerson(ctx, { look: 'bizans', x: 0, y: 0, s: 1, act: 'idle', expr: 'determined', lookX: -1, simple: true }, t);
      ctx.restore();
      if (k > 0.85) { const s = 1 + Math.sin(t * 12) * 0.15; ctx.save(); ctx.translate(1350, 600); ctx.scale(s, s); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; line(ctx, Math.cos(a) * 20, Math.sin(a) * 20, Math.cos(a) * 46, Math.sin(a) * 46, 6, '#ffd23a'); } ctx.restore(); }
    }
  }
}

// ── DENİZ ──
function sea(ctx, o, t, ti) {
  sky(ctx, ti, t, { horizon: 560 });
  setTint(ti.tint, 1);
  const hy = 560;
  if (o.city || o.chain) {
    // sol: İstanbul (deniz surları + silüet), sağ: Galata
    ctx.save(); ctx.beginPath(); ctx.rect(X0, -400, (o.chain ? 760 : X1) - X0, 2000); ctx.clip();
    citySkyline(ctx, hy - 34, 1.1, '#9c9aa6', { sofiaX: o.chain ? 300 : 1100 });
    stoneWall(ctx, X0, hy - 40, X1, hy + 6, '#c9b696'); merlons(ctx, X0, X1, hy - 40, '#c9b696', 16);
    for (let x = X0 + 60; x < X1; x += 220) { ctx.beginPath(); ctx.rect(x, hy - 80, 50, 80); ol(ctx, '#d0bd9d', 3); merlons(ctx, x - 4, x + 54, hy - 80, '#d0bd9d', 12); }
    if (o.horn) for (let x = X0 + 160; x < X1; x += 440) { circ(ctx, x, hy - 54, 9); ol(ctx, '#e8c9a0', 3); ctx.beginPath(); ctx.arc(x, hy - 58, 10, Math.PI, 0); ol(ctx, '#9aa3ad', 3); }
    ctx.restore();
    if (o.chain) {
      ctx.beginPath(); ctx.moveTo(1240, hy + 6); ctx.quadraticCurveTo(1500, hy - 70, X1, hy - 90); ctx.lineTo(X1, hy + 6); ctx.closePath(); ol(ctx, '#8a9a6a', 4);
      for (const [x, s] of [[1440, 0.5], [1560, 0.55], [1700, 0.6], [1900, 0.5]]) house(ctx, x, hy - 10 - (x - 1300) * 0.12, s, '#e8dcc0', '#9c4a3a');
      // Galata kulesi
      ctx.beginPath(); ctx.rect(1640, hy - 330, 70, 220); ol(ctx, '#c9b696', 4);
      poly(ctx, [[1630, hy - 330], [1675, hy - 420], [1720, hy - 330]]); ol(ctx, '#7a8a9a', 4);
    }
  }
  const g = ctx.createLinearGradient(0, hy, 0, H);
  g.addColorStop(0, col('#7fb2c9')); g.addColorStop(1, col('#2c5f7c'));
  ctx.fillStyle = g; ctx.fillRect(X0, hy, X1 - X0, H - hy + 400);
  ctx.strokeStyle = col('#cfe8f2'); ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 70; i++) {
    const r = hash(i * 3.1), y = hy + 10 + Math.pow(hash(i * 7.7), 1.6) * (H - hy);
    const sp = 20 + (y - hy) * 0.08;
    const x = ((r * (X1 - X0) + t * sp) % (X1 - X0)) + X0;
    const w = 20 + (y - hy) * 0.12;
    ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x, y - 6, x + w, y); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  if (o.chain) {
    // zincir: yüzen kütükler + halkalar
    ctx.beginPath(); ctx.moveTo(740, hy + 20); ctx.quadraticCurveTo(1000, hy + 110, 1260, hy + 18); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
    for (let i = 0; i <= 10; i++) {
      const k = i / 10, x = lerp(740, 1260, k), y = (1 - k) * (1 - k) * (hy + 20) + 2 * (1 - k) * k * (hy + 110) + k * k * (hy + 18);
      rr(ctx, x - 22, y - 10 + Math.sin(t * 2 + i) * 3, 44, 20, 9); ol(ctx, '#8a5a32', 4);
    }
  }
}

// ── TEPE (gemiler karadan) ──
const slopeY = (x) => 930 - (x + 200) * 0.26;
function hill(ctx, o, t, ti) {
  sky(ctx, ti, t, {});
  setTint(ti.tint, 1);
  ctx.fillStyle = col('#2c4a66'); ctx.fillRect(X0, 700, 1200, 400);
  ctx.beginPath(); ctx.moveTo(X0, 720); ctx.quadraticCurveTo(0, 680, 600, 700); ctx.lineTo(600, 720); ctx.closePath(); ol(ctx, '#3a4a3a', 3);
  for (let i = 0; i < 10; i++) { circ(ctx, -400 + i * 80, 700 - (i % 3) * 6, 3); ctx.fillStyle = '#ffd27a'; ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(X0, H + 100); ctx.lineTo(X0, slopeY(X0) + 60);
  for (let x = X0; x <= X1; x += 80) ctx.lineTo(x, slopeY(x) + 60 + noise1(x / 300) * 10);
  ctx.lineTo(X1, H + 100); ctx.closePath(); ol(ctx, '#5e6e3a', 5);
  tufts(ctx, 500, H, '#3f5228', 60, 6);
  // kızaklar
  for (let x = -300; x < 2400; x += 64) {
    const y = slopeY(x) + 64;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan(-0.26));
    rr(ctx, -12, -6, 24, 30, 7); ol(ctx, '#9a6a3a', 3.5); ctx.restore();
  }
  for (let x = -200; x < 2400; x += 360) torchFlame(ctx, x + 40, slopeY(x + 40) + 20, t, 0.9);
}

// ── TOP BATARYASI ──
function battery(ctx, o, t, ti) {
  sky(ctx, ti, t, { horizon: 600 });
  setTint(ti.tint, 1);
  // uzakta surlar
  ctx.save(); ctx.translate(1500, 430); ctx.scale(0.42, 0.42); ctx.translate(-960, -470);
  stoneWall(ctx, -400, 300, 2400, 680, '#bcaa8c'); merlons(ctx, -400, 2400, 300, '#bcaa8c', 24);
  for (let x = -300; x < 2400; x += 330) tower(ctx, x, 196, 140, 484, '#c4b294', { win: [0.2] });
  ctx.restore();
  ground(ctx, 600, '#9a8a5e', '#6a5a3a');
  // toprak tabya + çit
  ctx.beginPath(); ctx.moveTo(X0, 720); ctx.quadraticCurveTo(960, 640, X1, 720); ctx.lineTo(X1, 760); ctx.lineTo(X0, 760); ctx.closePath(); ol(ctx, '#8a7048', 4);
  for (let x = X0 + 20; x < X1; x += 42) { const y = 700 - Math.sin((x - X0) / (X1 - X0) * Math.PI) * 50; poly(ctx, [[x - 14, y + 50], [x - 14, y - 10], [x, y - 34], [x + 14, y - 10], [x + 14, y + 50]]); ol(ctx, '#9a6a3a', 3.5); }
  for (const x of [180, 1750, 1900]) { ell(ctx, x, 800, 60, 70); ol(ctx, '#b0905a', 4); for (let i = -2; i <= 2; i++) line(ctx, x + i * 22, 740, x + i * 22, 860, 3, '#8a6a3a'); }
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4 - i; j++) { circ(ctx, 1560 + j * 52 + i * 26, 990 - i * 44, 26); ol(ctx, '#9a948a', 4); }
  if (o.wallHit >= 0) {
    const k = o.wallHit;
    const px = 1500, py = 470;
    for (let i = 0; i < 14; i++) { const a = hash(i) * Math.PI - Math.PI, d = k * (120 + hash(i + 3) * 160); circ(ctx, px + Math.cos(a) * d, py + Math.sin(a) * d * 0.7 + k * k * 200, 8 + hash(i) * 10); ctx.fillStyle = col('#8a7a62'); ctx.globalAlpha = clamp(1.5 - k); ctx.fill(); ctx.globalAlpha = 1; }
    for (let i = 0; i < 8; i++) { const d = 40 + k * 120; circ(ctx, px + (hash(i + 9) - 0.5) * d * 2, py - hash(i + 4) * d * 0.8, 40 + k * 60); ctx.fillStyle = rgba('#d9cdb6', clamp(0.8 - k * 0.3)); ctx.fill(); }
  }
}

// ── DİVAN (çadır içi) ──
function divan(ctx, o, t, ti) {
  setTint([1, 0.96, 0.9], 1);
  const g = ctx.createLinearGradient(0, 0, 0, 820);
  g.addColorStop(0, '#6e1a1f'); g.addColorStop(1, '#a5282d');
  ctx.fillStyle = g; ctx.fillRect(X0, -400, X1 - X0, 1300);
  ctx.strokeStyle = '#e3b448'; ctx.lineWidth = 5;
  for (let x = X0; x < X1; x += 240) {
    ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.moveTo(x + 30, 760); ctx.lineTo(x + 30, 300); ctx.quadraticCurveTo(x + 30, 200, x + 120, 150); ctx.quadraticCurveTo(x + 210, 200, x + 210, 300); ctx.lineTo(x + 210, 760); ctx.stroke();
    ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(x + 120, 420, 50, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 120, 360); ctx.lineTo(x + 120, 480); ctx.moveTo(x + 60, 420); ctx.lineTo(x + 180, 420); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.moveTo(X0, -10); ctx.lineTo(X1, -10); ctx.lineTo(X1, 90); for (let x = X1; x > X0; x -= 120) ctx.quadraticCurveTo(x - 60, 150, x - 120, 90); ctx.closePath(); ol(ctx, '#e3b448', 5);
  rr(ctx, X0, 690, X1 - X0, 140, 20); ol(ctx, '#2e6b4a', 5);
  for (let x = X0 + 40; x < X1; x += 200) { rr(ctx, x, 600, 170, 120, 40); ol(ctx, '#3f8a5f', 4); line(ctx, x + 85, 610, x + 85, 710, 3, '#e3b448'); }
  ctx.fillStyle = col('#8c1d25'); ctx.fillRect(X0, 820, X1 - X0, 400);
  ctx.strokeStyle = col('#e3b448'); ctx.lineWidth = 6; ctx.strokeRect(-200, 860, 2320, 300);
  ctx.strokeStyle = col('#1f3f6b'); ctx.lineWidth = 14; ctx.strokeRect(-180, 880, 2280, 260);
  for (let x = -100; x < 2100; x += 120) { ctx.save(); ctx.translate(x, 1000); ctx.rotate(Math.PI / 4); ctx.strokeStyle = col('#e3b448'); ctx.lineWidth = 4; ctx.strokeRect(-24, -24, 48, 48); ctx.restore(); }
  for (const x of [330, 1590]) { line(ctx, x, 0, x, 170, 3, '#e3b448'); poly(ctx, [[x - 26, 170], [x + 26, 170], [x + 18, 240], [x - 18, 240]]); ol(ctx, '#e3b448', 4); glow(ctx, x, 210, 200, '#ffcf70', 0.45); }
}
function tentnight(ctx, o, t, ti) {
  setTint([0.6, 0.55, 0.7], 1);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1b1530'); g.addColorStop(1, '#3a2a40');
  ctx.fillStyle = g; ctx.fillRect(X0, -400, X1 - X0, H + 800);
  ctx.strokeStyle = 'rgba(227,180,72,0.25)'; ctx.lineWidth = 4;
  for (let x = X0; x < X1; x += 240) { ctx.beginPath(); ctx.moveTo(x + 30, 800); ctx.lineTo(x + 30, 300); ctx.quadraticCurveTo(x + 30, 200, x + 120, 150); ctx.quadraticCurveTo(x + 210, 200, x + 210, 300); ctx.lineTo(x + 210, 800); ctx.stroke(); }
  ctx.fillStyle = col('#4a1a20'); ctx.fillRect(X0, 820, X1 - X0, 400);
}

// ── BOĞAZ / RUMELİ HİSARI ──
function bosphorus(ctx, o, t, ti) {
  sky(ctx, ti, t, {});
  setTint(ti.tint, 1);
  ctx.beginPath(); ctx.moveTo(1300, 600); ctx.quadraticCurveTo(1700, 480, X1, 500); ctx.lineTo(X1, 700); ctx.lineTo(1300, 700); ctx.closePath(); ol(ctx, '#8aa07a', 4);
  ctx.save(); ctx.translate(1750, 560); ctx.scale(0.35, 0.35);
  ctx.beginPath(); ctx.rect(-80, -160, 160, 160); ol(ctx, '#cdbb9b', 5); merlons(ctx, -84, 84, -160, '#cdbb9b', 20); ctx.restore();
  const g = ctx.createLinearGradient(0, 560, 0, H);
  g.addColorStop(0, '#7fb2c9'); g.addColorStop(1, '#2c5f7c');
  ctx.fillStyle = g; ctx.fillRect(X0, 580, X1 - X0, 600);
  ctx.strokeStyle = '#cfe8f2'; ctx.lineWidth = 3;
  for (let i = 0; i < 40; i++) { const y = 600 + hash(i) * 460, x = ((hash(i * 3) * 3000 + t * 30) % 3000) - 560; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(x - 30, y); ctx.quadraticCurveTo(x, y - 6, x + 30, y); ctx.stroke(); }
  ctx.globalAlpha = 1;
  // sol yamaç
  ctx.beginPath(); ctx.moveTo(X0, 80); ctx.quadraticCurveTo(500, 140, 1150, 760); ctx.lineTo(1260, 1100); ctx.lineTo(X0, 1100); ctx.closePath(); ol(ctx, '#6f8a52', 5);
  tufts(ctx, 300, 1000, '#4f6a34', 40, 4);
  // Rumeli Hisarı
  const b = clamp(o.build ?? 1);
  ctx.save();
  ctx.beginPath(); ctx.rect(X0, 1100 - b * 1200, X1 - X0, 2000); ctx.clip();
  const wallPts = [[180, 330], [520, 470], [820, 700], [1040, 830]];
  for (let i = 0; i < wallPts.length - 1; i++) {
    const [ax, ay] = wallPts[i], [bx, by] = wallPts[i + 1];
    ctx.beginPath(); ctx.moveTo(ax, ay - 70); ctx.lineTo(bx, by - 70); ctx.lineTo(bx, by + 40); ctx.lineTo(ax, ay + 40); ctx.closePath(); ol(ctx, '#d4c3a4', 4.5);
    for (let k = 0; k < 1; k += 0.08) { const x = lerp(ax, bx, k), y = lerp(ay, by, k) - 70; ctx.beginPath(); ctx.rect(x, y - 18, 16, 20); ol(ctx, '#d4c3a4', 3); }
  }
  const tw = (x, y, w, h) => { stoneWall(ctx, x - w / 2, y - h, x + w / 2, y, '#d9c8a8', '#b8a586'); merlons(ctx, x - w / 2 - 4, x + w / 2 + 4, y - h, '#d9c8a8', 18); poly(ctx, [[x - w / 2 - 6, y - h - 16], [x, y - h - w * 0.8], [x + w / 2 + 6, y - h - 16]]); ol(ctx, '#7a8a9a', 4); };
  tw(180, 380, 150, 300); tw(1040, 880, 170, 340); tw(640, 600, 120, 230); tw(420, 470, 70, 140); tw(860, 760, 70, 140);
  ctx.restore();
  if (b < 1) {
    for (const x of [180, 640, 1040]) { const h = 360; for (let i = 0; i < 4; i++) line(ctx, x - 90 + i * 60, 900 - b * 300, x - 90 + i * 60, 900 - b * 300 - h * 0.4, 5, '#9a6a3a'); }
  }
  flag(ctx, 1040, 880 - 340 - 130, 70, '#c0272d', t, {});
}

// ── ŞEHİR / AYASOFYA ──
function city(ctx, o, t, ti) {
  sky(ctx, ti, t, {});
  setTint(ti.tint, 0.8);
  citySkyline(ctx, 700, 1.2, '#b39a86', { sofia: false, seed: 4 });
  const cx = 1100;
  // ayasofya
  ctx.save(); ctx.translate(cx, 760);
  const wc = '#d9a07a', dc = '#8d9aa6';
  ctx.beginPath(); ctx.rect(-430, -200, 860, 210); ol(ctx, wc, 5);
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.rect(sx * 300 - 60, -330, 120, 340); ol(ctx, shade(wc, -0.06), 5); poly(ctx, [[sx * 300 - 70, -330], [sx * 300, -370], [sx * 300 + 70, -330]]); ol(ctx, shade(wc, -0.1), 4); }
  for (const sx of [-1, 1]) dome(ctx, sx * 175, -250, 110, dc);
  ctx.beginPath(); ctx.rect(-240, -330, 480, 100); ol(ctx, wc, 5);
  ctx.beginPath(); ctx.rect(-200, -380, 400, 56); ol(ctx, shade(wc, 0.05), 5);
  for (let i = 0; i < 16; i++) { const x = -180 + i * 24; rr(ctx, x, -372, 12, 30, 5); ol(ctx, '#3a3040', 2.5); }
  dome(ctx, 0, -380, 230, dc);
  line(ctx, 0, -652, 0, -700, 6, '#d9a520'); circ(ctx, 0, -706, 9); ol(ctx, '#e8b830', 3);
  for (let i = 0; i < 9; i++) { rr(ctx, -380 + i * 90, -150, 34, 70, 14); ol(ctx, '#4a3a40', 3); }
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ell(ctx, cx - 80, 300, 90, 60); ctx.fill();
  for (const x of [480, 1700, 1820]) tree(ctx, x, 800, 1.0, '#3d5a2e', 'cypress');
  ground(ctx, 790, '#cdb68a', '#a08a62');
  // ışık hüzmeleri
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) {
    const a = -0.9 + i * 0.32 + Math.sin(t * 0.3 + i) * 0.03;
    ctx.beginPath(); ctx.moveTo(1380, 200); ctx.lineTo(1380 + Math.cos(a + Math.PI / 2) * 1600 - 40, 200 + Math.sin(a + Math.PI / 2) * 1600); ctx.lineTo(1380 + Math.cos(a + Math.PI / 2) * 1600 + 40, 200 + Math.sin(a + Math.PI / 2) * 1600); ctx.closePath();
    ctx.fillStyle = 'rgba(255,220,150,0.05)'; ctx.fill();
  }
  ctx.restore();
}

// ── PARŞÖMEN & KARANLIK ──
let paperCanvas = null;
function paperTexture(createCanvas) {
  if (paperCanvas) return paperCanvas;
  paperCanvas = createCanvas(640, 360);
  const p = paperCanvas.getContext('2d');
  const img = p.createImageData(640, 360);
  const r = rng(99);
  for (let i = 0; i < 640 * 360; i++) {
    const n = (r() - 0.5) * 18 + noise1(i % 640 / 30 + Math.floor(i / 640) / 50) * 10;
    img.data[i * 4] = 233 + n; img.data[i * 4 + 1] = 218 + n; img.data[i * 4 + 2] = 186 + n; img.data[i * 4 + 3] = 255;
  }
  p.putImageData(img, 0, 0);
  return paperCanvas;
}
function parchment(ctx, o, t, ti, env) {
  setTint([1, 1, 1], 1);
  ctx.drawImage(paperTexture(env.createCanvas), X0, -300, X1 - X0, H + 600);
  ctx.strokeStyle = 'rgba(140,100,50,0.10)'; ctx.lineWidth = 3;
  for (let x = -60; x < 2000; x += 160) for (let y = -60; y < 1140; y += 160) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8, r2 = i % 2 ? 34 : 60; ctx.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2); }
    ctx.closePath(); ctx.stroke();
  }
  const v = ctx.createRadialGradient(960, 540, 300, 960, 540, 1150);
  v.addColorStop(0, 'rgba(90,50,20,0)'); v.addColorStop(1, 'rgba(90,50,20,0.45)');
  ctx.fillStyle = v; ctx.fillRect(X0, -300, X1 - X0, H + 600);
}
function dark(ctx, o, t, ti) {
  setTint([0.8, 0.75, 0.75], 1);
  const g = ctx.createRadialGradient(960, 560, 50, 960, 560, 1100);
  g.addColorStop(0, '#2a1a16'); g.addColorStop(1, '#080505');
  ctx.fillStyle = g; ctx.fillRect(X0, -300, X1 - X0, H + 600);
}

const BG = { walls, camp, country, kitchen, tunnel, section, sea, hill, battery, divan, tentnight, bosphorus, city, parchment, dark };
module.exports = { BG, softPuff, timeInfo, sky, tent, tree, house, flag, torchFlame, smoke, merlons, stoneWall, tower, dome, slopeY, X0, X1 };
