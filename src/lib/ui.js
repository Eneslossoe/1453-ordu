// Arayüz/infografik öğeleri: etiketler, kartlar, istatistikler, haritalar, altyazı.
const C = require('./core');
const { W, H, INK, clamp, lerp, ease, appear, hash, noise1, col, mix, shade, rgba, ol, rr, ell, circ, poly, line, tube, glow, text, fitFont } = C;
const { drawPerson } = require('./person');
const { coin } = require('./things');

const GOLD = '#f0c24e', CREAM = '#fbf3df', RED = '#c0272d';

function popScale(t, at, dur = 0.38) { const k = appear(t, at, dur); return k <= 0 ? 0 : ease.back(k); }

function label(ctx, s, x, y, o, t) {
  const k = popScale(t, o.at || 0);
  if (k <= 0) return;
  const fs = o.small ? 40 : 54;
  ctx.save(); ctx.translate(x, y); ctx.rotate(((o.tilt || 0) * Math.PI) / 180); ctx.scale(k, k);
  ctx.font = `900 ${fs}px Nunito`;
  const w = ctx.measureText(s).width + 52, h = fs + 34;
  rr(ctx, -w / 2 + 7, -h / 2 + 9, w, h, 18); ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fill();
  rr(ctx, -w / 2, -h / 2, w, h, 18); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  text(ctx, s, 0, 3, { font: `900 ${fs}px Nunito`, fill: INK });
  ctx.restore();
}

function banner(ctx, s, o, t) {
  const k = appear(t, o.at || 0, 0.35);
  if (k <= 0) return;
  const y = o.y || 150;
  ctx.save(); ctx.translate(960, y);
  ctx.font = '900 70px Nunito';
  const w = ctx.measureText(s).width + 140;
  ctx.scale(ease.back(k), 1);
  poly(ctx, [[-w / 2 - 60, 10], [-w / 2 + 10, 10], [-w / 2 + 10, 80], [-w / 2 - 60, 80], [-w / 2 - 30, 45]]); ol(ctx, '#8e1b20', 6);
  poly(ctx, [[w / 2 + 60, 10], [w / 2 - 10, 10], [w / 2 - 10, 80], [w / 2 + 60, 80], [w / 2 + 30, 45]]); ol(ctx, '#8e1b20', 6);
  rr(ctx, -w / 2, -50, w, 110, 10); ol(ctx, RED, 6);
  text(ctx, s, 0, 6, { font: '900 70px Nunito', fill: '#fff', stroke: INK, lw: 10 });
  ctx.restore();
}

function date(ctx, main, sub, o, t) {
  const k = ease.out(appear(t, o.at || 0, 0.5));
  if (k <= 0) return;
  ctx.save(); ctx.translate(lerp(-520, 60, k), 56);
  rr(ctx, 8, 10, 470, 140, 14); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
  rr(ctx, 0, 0, 470, 140, 14); ctx.fillStyle = '#f3e6c4'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  rr(ctx, 12, 12, 446, 116, 8); ctx.lineWidth = 3; ctx.strokeStyle = '#b8862e'; ctx.stroke();
  const fs = fitFont(ctx, main, 'Cinzel', 900, 50, 420);
  text(ctx, main, 235, 58, { font: `900 ${fs}px Cinzel`, fill: '#7a1a14' });
  text(ctx, sub, 235, 104, { font: '900 32px Nunito', fill: INK });
  ctx.restore();
}

function rays(ctx, x, y, t, c, a, n = 18) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.12);
  for (let i = 0; i < n; i++) { ctx.rotate((Math.PI * 2) / n); poly(ctx, [[-40, 0], [0, -1600], [40, 0]]); ctx.fillStyle = rgba(c, a); ctx.fill(); }
  ctx.restore();
}

function rankCard(ctx, n, name, tag, look, t, env) {
  const g = ctx.createRadialGradient(700, 540, 80, 960, 540, 1300);
  g.addColorStop(0, '#2c2440'); g.addColorStop(1, '#07060c');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  rays(ctx, 520, 640, t, GOLD, 0.06);
  // zemin halkası
  const kp = popScale(t, 0.15, 0.45);
  ell(ctx, 520, 1000, 300, 46); ctx.fillStyle = 'rgba(240,194,78,0.18)'; ctx.fill();
  if (kp > 0) drawPerson(ctx, { look, x: 520, y: 1000, s: 2.05 * kp, expr: n >= 9 ? 'smug' : n <= 3 ? 'sad' : 'determined', act: 'idle' }, t);
  const k1 = ease.out(appear(t, 0.25, 0.5)), k2 = ease.out(appear(t, 0.45, 0.5)), k3 = ease.out(appear(t, 0.7, 0.5));
  ctx.save(); ctx.globalAlpha = k1; ctx.translate(lerp(1500, 1300, k1), 0);
  // madalyon
  circ(ctx, 0, 270, 92); ctx.fillStyle = '#1a1420'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = GOLD; ctx.stroke();
  circ(ctx, 0, 270, 76); ctx.lineWidth = 3; ctx.strokeStyle = rgba(GOLD, 0.6); ctx.stroke();
  text(ctx, String(n), 0, 278, { font: '900 96px Cinzel', fill: GOLD });
  text(ctx, 'RÜTBE', 0, 410, { font: '900 52px Cinzel', fill: rgba(GOLD, 0.9) });
  ctx.restore();
  ctx.save(); ctx.globalAlpha = k2; ctx.translate(lerp(1500, 1300, k2), 0);
  const fs = fitFont(ctx, name, 'Cinzel', 900, 150, 980);
  text(ctx, name, 0, 560, { font: `900 ${fs}px Cinzel`, fill: GOLD, stroke: '#2a1a08', lw: 12 });
  line(ctx, -380, 650, 380, 650, 4, GOLD);
  ctx.restore();
  ctx.save(); ctx.globalAlpha = k3; ctx.translate(lerp(1500, 1300, k3), 0);
  const fs2 = fitFont(ctx, tag, 'Nunito', 900, 48, 940);
  text(ctx, tag, 0, 730, { font: `900 ${fs2}px Nunito`, fill: CREAM });
  // ilerleme göstergesi (10 rütbe)
  for (let i = 0; i < 10; i++) {
    const x = -315 + i * 70, on = i < n;
    circ(ctx, x, 860, on ? 18 : 13); ctx.fillStyle = on ? GOLD : 'rgba(255,255,255,0.15)'; ctx.fill();
    if (i === n - 1) { circ(ctx, x, 860, 28 + Math.sin(t * 5) * 3); ctx.lineWidth = 4; ctx.strokeStyle = GOLD; ctx.stroke(); }
  }
  ctx.restore();
}

const BARS = [['kazanc', 'KAZANÇ', '#e0a920'], ['konfor', 'KONFOR', '#3d8bd9'], ['tehlike', 'TEHLİKE', '#d63a2f'], ['hayat', 'HAYATTA KALMA', '#3aa65a']];
function stats(ctx, name, st, t) {
  const k = ease.out(appear(t, 0.1, 0.5));
  ctx.save(); ctx.translate(lerp(2000, 0, k), 0);
  const x0 = 880, y0 = 110, w = 940, h = 760;
  rr(ctx, x0 + 10, y0 + 14, w, h, 26); ctx.fillStyle = 'rgba(60,30,10,0.3)'; ctx.fill();
  rr(ctx, x0, y0, w, h, 26); ctx.fillStyle = '#fbf3df'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
  rr(ctx, x0 + 16, y0 + 16, w - 32, h - 32, 16); ctx.lineWidth = 3; ctx.strokeStyle = '#b8862e'; ctx.stroke();
  const fs = fitFont(ctx, name, 'Cinzel', 900, 76, w - 120);
  text(ctx, name, x0 + w / 2, y0 + 92, { font: `900 ${fs}px Cinzel`, fill: '#7a1a14' });
  rr(ctx, x0 + 60, y0 + 150, w - 120, 74, 14); ctx.fillStyle = '#efe0bc'; ctx.fill();
  text(ctx, 'MAAŞ:', x0 + 90, y0 + 188, { font: '900 40px Nunito', fill: INK, align: 'left' });
  const fs3 = fitFont(ctx, st.maas, 'Nunito', 900, 40, w - 340);
  text(ctx, st.maas, x0 + 230, y0 + 188, { font: `900 ${fs3}px Nunito`, fill: '#7a1a14', align: 'left' });
  BARS.forEach(([key, lab, c], i) => {
    const y = y0 + 290 + i * 112;
    const kk = ease.out(appear(t, 0.5 + i * 0.3, 0.6));
    const v = st[key] / 10;
    text(ctx, lab, x0 + 70, y, { font: '900 38px Nunito', fill: INK, align: 'left' });
    const bx = x0 + 70, by = y + 28, bw = w - 260, bh = 36;
    rr(ctx, bx, by, bw, bh, 18); ctx.fillStyle = '#d9c9a4'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    if (v * kk > 0.01) { rr(ctx, bx + 4, by + 4, (bw - 8) * v * kk, bh - 8, 14); ctx.fillStyle = c; ctx.fill(); }
    text(ctx, `${Math.round(st[key] * kk)}/10`, x0 + w - 110, by + 18, { font: '900 40px Nunito', fill: INK });
  });
  ctx.restore();
}

function factList(ctx, x, y, items, t) {
  items.forEach(([ic, s, at], i) => {
    const k = ease.out(appear(t, at, 0.4));
    if (k <= 0) return;
    const yy = y + i * 150;
    ctx.save(); ctx.globalAlpha = k; ctx.translate(lerp(200, 0, k), 0);
    rr(ctx, x - 20, yy - 56, 720, 112, 20); ctx.fillStyle = 'rgba(255,250,235,0.92)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    if (ic === 'coin') coin(ctx, x + 50, yy, 34, 0.2);
    else {
      circ(ctx, x + 50, yy, 36); ol(ctx, ic === 'x' ? '#d63a2f' : '#3aa65a', 5);
      if (ic === 'x') { line(ctx, x + 34, yy - 16, x + 66, yy + 16, 9, '#fff'); line(ctx, x + 66, yy - 16, x + 34, yy + 16, 9, '#fff'); }
      else { ctx.beginPath(); ctx.moveTo(x + 32, yy); ctx.lineTo(x + 46, yy + 15); ctx.lineTo(x + 70, yy - 14); ctx.lineWidth = 9; ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.stroke(); }
    }
    text(ctx, s, x + 110, yy + 3, { font: '900 54px Nunito', fill: INK, align: 'left' });
    ctx.restore();
  });
}

function stamp(ctx, s, x, y, o, t) {
  const k = appear(t, o.at || 0, 0.22);
  if (k <= 0) return;
  const sc = lerp(2.6, 1, ease.out(k));
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.2); ctx.scale(sc, sc); ctx.globalAlpha = clamp(k * 1.5);
  ctx.font = '900 76px Cinzel';
  const w = ctx.measureText(s).width + 70;
  rr(ctx, -w / 2, -64, w, 128, 14); ctx.lineWidth = 10; ctx.strokeStyle = '#c4161c'; ctx.stroke();
  rr(ctx, -w / 2 + 12, -52, w - 24, 104, 8); ctx.lineWidth = 4; ctx.stroke();
  text(ctx, s, 0, 6, { font: '900 76px Cinzel', fill: '#c4161c' });
  ctx.restore();
}

function clock(ctx, x, y, s, o, t) {
  const k = popScale(t, o.at || 0);
  if (k <= 0) return;
  const fs = o.small ? 34 : 50;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.font = `900 ${fs}px Nunito`;
  const w = ctx.measureText(s).width + 130, h = fs + 50;
  rr(ctx, -w / 2, -h / 2, w, h, 18); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  const cx = -w / 2 + 52;
  circ(ctx, cx, 0, h * 0.32); ol(ctx, '#f3e6c4', 5);
  line(ctx, cx, 0, cx, -h * 0.22, 5); line(ctx, cx, 0, cx + Math.cos(t * 3) * h * 0.18, Math.sin(t * 3) * h * 0.18, 5);
  text(ctx, s, cx + 40, 3, { font: `900 ${fs}px Nunito`, fill: INK, align: 'left' });
  ctx.restore();
}

function warn(ctx, x, y, o, t) {
  const k = popScale(t, o.at || 0);
  if (k <= 0) return;
  const s = k * (1 + Math.sin(t * 8) * 0.06);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  poly(ctx, [[0, -110], [120, 90], [-120, 90]]); ctx.lineJoin = 'round'; ol(ctx, '#ffd23a', 10);
  text(ctx, '!', 0, 20, { font: '900 150px Nunito', fill: INK });
  ctx.restore();
}

function cloudShape(ctx, w, h) {
  ctx.beginPath();
  const n = 9;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const px = Math.cos(a) * w * 0.5, py = Math.sin(a) * h * 0.5; ctx.moveTo(px + h * 0.28, py); ctx.arc(px, py, h * 0.28, 0, Math.PI * 2); }
  ctx.moveTo(w * 0.5, 0); ctx.ellipse(0, 0, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
}
function thought(ctx, x, y, content, o, t) {
  const k = popScale(t, o.at || 0, 0.45);
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y);
  for (const [dx, dy, r] of [[-170, 190, 14], [-140, 150, 22]]) { circ(ctx, dx * k, dy * k, r * k); ol(ctx, '#fff', 5); }
  ctx.scale(k, k);
  cloudShape(ctx, 340, 220); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  cloudShape(ctx, 330, 210); ctx.fillStyle = '#fff'; ctx.fill();
  if (content === 'coins') {
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) coin(ctx, -75 + i * 50 + r * 25, 40 - r * 34, 28, 0.15);
    for (let i = 0; i < 4; i++) { const a = t * 3 + i * 1.6; const s = Math.max(0, Math.sin(a)) * 14; ctx.beginPath(); ctx.moveTo(-90 + i * 60, -60 - s); ctx.lineTo(-90 + i * 60 + s * 0.3, -60); ctx.lineTo(-90 + i * 60, -60 + s); ctx.lineTo(-90 + i * 60 - s * 0.3, -60); ctx.closePath(); ctx.fillStyle = '#f0b020'; ctx.fill(); }
  } else if (content === 'angry') {
    for (let i = 0; i < 3; i++) drawPerson(ctx, { look: 'yeniceri', x: -90 + i * 90, y: 96, s: 0.36, expr: 'angry', act: 'cheer', simple: true, seed: i, noShadow: true }, t);
  }
  ctx.restore();
}

function hourglass(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circ(ctx, 0, 0, 120); ctx.fillStyle = '#16120e'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = GOLD; ctx.stroke();
  circ(ctx, 0, 0, 104); ctx.lineWidth = 3; ctx.strokeStyle = rgba(GOLD, 0.6); ctx.stroke();
  rr(ctx, -62, -86, 124, 14, 5); ol(ctx, '#b8862e', 4); rr(ctx, -62, 72, 124, 14, 5); ol(ctx, '#b8862e', 4);
  line(ctx, -50, -74, -50, 74, 6, '#b8862e'); line(ctx, 50, -74, 50, 74, 6, '#b8862e');
  ctx.beginPath(); ctx.moveTo(-40, -72); ctx.quadraticCurveTo(-40, -20, -6, 0); ctx.quadraticCurveTo(-40, 20, -40, 72); ctx.lineTo(40, 72); ctx.quadraticCurveTo(40, 20, 6, 0); ctx.quadraticCurveTo(40, -20, 40, -72); ctx.closePath();
  ctx.fillStyle = 'rgba(220,235,255,0.2)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#e8dcc0'; ctx.stroke();
  const k = (t * 0.1) % 1;
  ctx.beginPath(); ctx.moveTo(-32 + k * 24, -40 + k * 34); ctx.quadraticCurveTo(0, -20 + k * 14, 32 - k * 24, -40 + k * 34); ctx.lineTo(4, -4); ctx.lineTo(-4, -4); ctx.closePath(); ctx.fillStyle = '#e0a940'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-36, 70); ctx.quadraticCurveTo(0, 40 - k * 20, 36, 70); ctx.closePath(); ctx.fill();
  line(ctx, 0, -4, 0, 60, 2.5, '#e0a940');
  ctx.restore();
}

function subscribe(ctx, x, y, o, t) {
  const k = popScale(t, o.at || 0);
  if (k <= 0) return;
  const clickAt = (o.at || 0) + 1.1;
  const done = t > clickAt;
  ctx.save(); ctx.translate(x, y); ctx.scale(k * (t > clickAt && t < clickAt + 0.15 ? 0.92 : 1), k);
  rr(ctx, -260, -70, 520, 140, 70); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
  rr(ctx, -268, -78, 520, 140, 70); ctx.fillStyle = done ? '#6b6b6b' : '#e62117'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
  text(ctx, done ? 'ABONE OLUNDU' : 'ABONE OL', -8, -4, { font: `900 ${done ? 54 : 64}px Nunito`, fill: '#fff' });
  // zil
  ctx.save(); ctx.translate(360, -8); if (done) ctx.rotate(Math.sin((t - clickAt) * 18) * 0.35 * Math.max(0, 1 - (t - clickAt) / 1.5));
  ctx.beginPath(); ctx.moveTo(-44, 36); ctx.quadraticCurveTo(-40, -50, 0, -54); ctx.quadraticCurveTo(40, -50, 44, 36); ctx.closePath(); ol(ctx, GOLD, 6);
  circ(ctx, 0, 46, 12); ol(ctx, GOLD, 5); ctx.restore();
  ctx.restore();
  // imleç
  const ck = ease.inOut(clamp((t - (o.at || 0) - 0.3) / 0.8));
  const cx = lerp(x + 520, x + 40, ck), cy = lerp(y + 380, y + 20, ck);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(1.6, 1.6);
  poly(ctx, [[0, 0], [0, 44], [11, 33], [20, 52], [28, 48], [19, 30], [34, 30]]); ctx.lineJoin = 'round'; ol(ctx, '#fff', 3.5);
  ctx.restore();
  if (t > clickAt && t < clickAt + 0.5) { const r = (t - clickAt) * 300; circ(ctx, x + 40, y + 20, r); ctx.lineWidth = 6; ctx.strokeStyle = `rgba(255,255,255,${1 - (t - clickAt) * 2})`; ctx.stroke(); }
}

function crack(ctx, at, t) {
  if (t < at) return;
  const k = clamp((t - at) / 0.35);
  ctx.save();
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + hash(i) * 0.3;
    ctx.beginPath(); ctx.moveTo(960, 540);
    let px = 960, py = 540;
    for (let j = 1; j <= 6; j++) { const r = j * 180 * k; px = 960 + Math.cos(a + (hash(i * 9 + j) - 0.5) * 0.4) * r; py = 540 + Math.sin(a + (hash(i * 9 + j) - 0.5) * 0.4) * r; ctx.lineTo(px, py); }
    ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = '#9fd8ff'; ctx.stroke();
  }
  hourglass(ctx, 960, 540, 1.2 * ease.back(clamp((t - at) / 0.4)), t * 6);
  const f = clamp((t - at - 0.3) / 0.5);
  ctx.fillStyle = `rgba(255,255,255,${f})`; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function bigTitle(ctx, s, x, y, o, t) {
  const k = popScale(t, o.at || 0, 0.6);
  if (k <= 0) return;
  glow(ctx, x, y, 600 * k, '#ffcf6a', 0.55);
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  const g = ctx.createLinearGradient(0, -110, 0, 110); g.addColorStop(0, '#fff2b0'); g.addColorStop(0.5, '#f0c24e'); g.addColorStop(1, '#b8862e');
  ctx.font = '900 250px Cinzel'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 18; ctx.strokeStyle = '#2a1608'; ctx.lineJoin = 'round'; ctx.strokeText(s, 0, 0);
  ctx.fillStyle = g; ctx.fillText(s, 0, 0);
  ctx.restore();
}

function dayCounter(ctx, x, y, n) {
  rr(ctx, x - 170, y - 60, 340, 120, 16); ctx.fillStyle = '#f3e6c4'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  text(ctx, `GÜN ${n}`, x, y + 4, { font: '900 64px Cinzel', fill: '#7a1a14' });
}

function ladder(ctx, items, t) {
  items.forEach((it, i) => {
    const x = 420 + i * 540, y = 990 - i * 150;
    const at = 0.2 + i * 1.0;
    const k = popScale(t, at, 0.45);
    rr(ctx, x - 220, y, 440, 1080 - y + 40, 12); ol(ctx, '#c9b696', 6);
    line(ctx, x - 220, y + 26, x + 220, y + 26, 4, '#a5523c');
    if (k <= 0) return;
    const s = (i === 2 ? 1.25 : 1.05) * k;
    if (i === 2) glow(ctx, x, y - 200, 340 * k, '#ffd27a', 0.5);
    drawPerson(ctx, { look: it.look, x, y, s, expr: i === 2 ? 'smug' : i === 0 ? 'happy' : 'neutral', act: 'idle', prop: i === 0 ? 'ladle' : i === 1 ? 'ladle' : null }, t);
    ctx.save(); ctx.translate(x, y - 330 * s - 90); ctx.scale(k, k);
    ctx.font = '900 50px Nunito'; const w = Math.max(ctx.measureText(it.t).width, 260) + 60;
    rr(ctx, -w / 2, -56, w, 130, 16); ctx.fillStyle = i === 2 ? '#fff4cc' : '#fff'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
    text(ctx, it.t, 0, -16, { font: '900 50px Nunito', fill: i === 2 ? '#7a1a14' : INK });
    text(ctx, it.sub, 0, 38, { font: '800 32px Nunito', fill: '#5a4a3a' });
    ctx.restore();
  });
}

function lineup(ctx, ranks, o, t, g) {
  const n = ranks.length;
  // vurgu takvimi
  let hi = -1;
  if (o.mode === 'intro' && g.lines.length > 1) {
    const s = g.L(1), d = g.Le(1) - s;
    const marks = [[0.0, 0], [0.24, 1], [0.44, 2], [0.62, 4], [0.84, 9]];
    for (const [f, idx] of marks) if (t > s + f * d) hi = idx;
  } else if (o.mode === 'outro') {
    const s = g.L(0), d = g.Le(0) - s;
    for (const [f, idx] of [[0.28, 0], [0.55, 1], [0.82, 9]]) if (t > s + f * d) hi = idx;
    if (t > g.Le(0) + 0.2) hi = -1;
  }
  for (let i = 0; i < n; i++) {
    const x = 150 + i * 180, y = 1010 - i * 46;
    rr(ctx, x - 90, y, 180, 1080 - y + 30, 6); ol(ctx, mix('#c9b696', '#e0c98a', i / n), 5);
    text(ctx, String(i + 1), x, y + 44, { font: '900 40px Cinzel', fill: '#5a2a12' });
    const at = o.mode === 'intro' ? 0.3 + i * 0.32 : 0;
    const k = popScale(t, at, 0.4);
    if (k <= 0) continue;
    const isHi = hi === i;
    if (isHi) glow(ctx, x, y - 120, 230, '#ffd27a', 0.6);
    const s = (isHi ? 0.78 : 0.6) * k;
    drawPerson(ctx, { look: ranks[i].look, x, y, s, expr: isHi ? 'happy' : i < 3 ? 'sad' : i > 7 ? 'smug' : 'neutral', act: isHi ? 'jump' : 'idle', seed: i }, t);
    const fs = ranks[i].name.length > 10 ? 22 : 27;
    ctx.save(); ctx.translate(x, y - 330 * s - 30); ctx.scale(k, k);
    ctx.font = `900 ${fs}px Nunito`; const w = ctx.measureText(ranks[i].name).width + 24;
    rr(ctx, -w / 2, -22, w, 44, 10); ctx.fillStyle = isHi ? '#fff4cc' : '#fff'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    text(ctx, ranks[i].name, 0, 2, { font: `900 ${fs}px Nunito`, fill: INK });
    ctx.restore();
  }
  if (o.mode === 'outro' && g.lines.length > 1 && t > g.L(1)) banner(ctx, 'CEVABINI YORUMLARA YAZ!', { at: g.L(1), y: 130 }, t);
  if (o.mode === 'intro') {
    const k = appear(t, 0.2, 0.5);
    ctx.save(); ctx.globalAlpha = k;
    text(ctx, 'BAŞIBOZUKTAN PADİŞAHA', 960, 110, { font: '900 74px Cinzel', fill: '#7a1a14', stroke: '#fbf3df', lw: 10 });
    ctx.restore();
  }
}

function endCard(ctx, t, env) {
  const g = ctx.createRadialGradient(960, 480, 80, 960, 540, 1200);
  g.addColorStop(0, '#2c2440'); g.addColorStop(1, '#07060c');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  rays(ctx, 640, 420, t, GOLD, 0.05);
  hourglass(ctx, 640, 400, 1.5 * popScale(t, 0.1, 0.5), t);
  const k = ease.out(appear(t, 0.4, 0.6));
  ctx.save(); ctx.globalAlpha = k;
  text(ctx, 'ZAMAN KIRIĞI', 640, 690, { font: '900 96px Cinzel', fill: GOLD, stroke: '#2a1a08', lw: 10 });
  text(ctx, 'Bir sonraki zaman kırığında görüşmek üzere!', 640, 790, { font: '900 40px Nunito', fill: CREAM });
  ctx.restore();
  subscribe(ctx, 610, 940, { at: 0.6 }, t);
  drawPerson(ctx, { look: 'yeniceri', x: 1500, y: 1000, s: 1.7, expr: 'happy', act: 'wave' }, t);
}

function split(ctx) {
  ctx.fillStyle = 'rgba(70,100,140,0.18)'; ctx.fillRect(-600, -300, 1560, 1700);
  ctx.fillStyle = 'rgba(240,190,80,0.2)'; ctx.fillRect(960, -300, 1600, 1700);
  poly(ctx, [[990, -40], [930, 300], [1000, 420], [920, 760], [990, 880], [940, 1120], [980, 1120], [1030, 880], [960, 760], [1040, 420], [970, 300], [1030, -40]]); ol(ctx, '#fff6c8', 5);
}

// ── HARİTALAR ──
const SEA = '#8fbdd3', LAND = '#e8d6a6';
function mapLabel(ctx, s, x, y, fs = 40, c = '#4a2a14') { text(ctx, s, x, y, { font: `900 ${fs}px Cinzel`, fill: c, stroke: 'rgba(251,243,223,0.85)', lw: 8 }); }
function dashArrow(ctx, pts, k, c, w = 10) {
  // pts: bezier [p0, c1, c2, p1]; k ilerleme
  const [p0, c1, c2, p1] = pts;
  const pt = (u) => { const a = 1 - u; return [a * a * a * p0[0] + 3 * a * a * u * c1[0] + 3 * a * u * u * c2[0] + u * u * u * p1[0], a * a * a * p0[1] + 3 * a * a * u * c1[1] + 3 * a * u * u * c2[1] + u * u * u * p1[1]]; };
  ctx.save(); ctx.setLineDash([26, 18]); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineCap = 'round';
  ctx.beginPath(); for (let i = 0; i <= 40; i++) { const u = (i / 40) * k; const [x, y] = pt(u); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
  if (k > 0.02) { const [x, y] = pt(k), [x2, y2] = pt(Math.max(0, k - 0.02)); const a = Math.atan2(y - y2, x - x2); ctx.save(); ctx.translate(x, y); ctx.rotate(a); poly(ctx, [[10, 0], [-26, -22], [-26, 22]]); ol(ctx, c, 4); ctx.restore(); }
}
function regionMap(ctx, o, t, env) {
  ctx.fillStyle = LAND; ctx.fillRect(-600, -300, 3100, 1700);
  const seaPoly = (pts) => { poly(ctx, pts); ctx.fillStyle = SEA; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#4a6a7a'; ctx.stroke(); };
  seaPoly([[1180, -60], [2000, -60], [2000, 360], [1750, 300], [1520, 330], [1430, 250], [1250, 190]]);
  ctx.lineWidth = 16; ctx.strokeStyle = SEA; ctx.beginPath(); ctx.moveTo(1430, 255); ctx.lineTo(1450, 480); ctx.stroke();
  ell(ctx, 1290, 530, 210, 60); ctx.fillStyle = SEA; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#4a6a7a'; ctx.stroke();
  ctx.lineWidth = 16; ctx.strokeStyle = SEA; ctx.beginPath(); ctx.moveTo(1100, 560); ctx.lineTo(1000, 660); ctx.stroke();
  seaPoly([[1000, 650], [1130, 700], [1160, 830], [1110, 1140], [-60, 1140], [-60, 860], [260, 820], [520, 760], [720, 700], [880, 640]]);
  poly(ctx, [[300, 880], [470, 860], [570, 930], [520, 1010], [470, 1090], [420, 1010], [360, 1090], [300, 1000], [250, 950]]); ctx.fillStyle = LAND; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#4a6a7a'; ctx.stroke();
  for (const [x, y, r] of [[800, 900, 30], [950, 800, 22], [700, 1010, 26], [1010, 960, 34]]) { ell(ctx, x, y, r * 1.4, r); ctx.fillStyle = LAND; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#4a6a7a'; ctx.stroke(); }
  mapLabel(ctx, 'KARADENİZ', 1650, 140, 40, '#2a4a5a'); mapLabel(ctx, 'EGE DENİZİ', 760, 840, 40, '#2a4a5a');
  // şehirler
  const city = (x, y, s, big) => { circ(ctx, x, y, big ? 20 : 14); ol(ctx, big ? RED : '#4a2a14', 5); mapLabel(ctx, s, x, y - 50, big ? 46 : 36); };
  city(1440, 470, 'İSTANBUL', true); city(1060, 330, 'EDİRNE'); mapLabel(ctx, 'MORA', 410, 1000, 44, '#7a1a14');
  // akıncı devriyesi
  const k1 = appear(t, 0.5, 1.0);
  if (k1 > 0) {
    ctx.save(); ctx.translate(1440, 470); ctx.rotate(t * 0.8); ctx.setLineDash([22, 16]); ctx.lineWidth = 9; ctx.strokeStyle = rgba('#2f6b3a', k1);
    ctx.beginPath(); ctx.arc(0, 0, 170, 0, Math.PI * 2 * k1); ctx.stroke(); ctx.restore();
    for (let i = 0; i < 3; i++) { const a = t * 0.8 + (i * Math.PI * 2) / 3; drawPerson(ctx, { look: 'akinci', x: 1440 + Math.cos(a) * 170, y: 470 + Math.sin(a) * 170 + 40, s: 0.26 * k1, expr: 'determined', simple: true, noShadow: true, seed: i }, t); }
  }
  if (o.mora != null && t > o.mora) {
    const k = ease.inOut(clamp((t - o.mora) / 2.2));
    dashArrow(ctx, [[1040, 360], [700, 450], [500, 650], [420, 860]], k, '#2f6b3a', 12);
    if (k > 0.6) label(ctx, 'TURAHAN BEY', 640, 560, { at: o.mora + 1.4, small: true }, t);
    const k2 = ease.inOut(clamp((t - o.mora - 3.0) / 1.8));
    if (k2 > 0) {
      dashArrow(ctx, [[520, 900], [800, 760], [1000, 640], [1150, 600]], k2 * 0.62, '#3d6bb5', 10);
      if (k2 >= 1) { ctx.save(); ctx.translate(930, 690); const s = ease.back(clamp((t - o.mora - 4.8) / 0.3)); ctx.scale(s, s); line(ctx, -40, -40, 40, 40, 16, '#d62828'); line(ctx, 40, -40, -40, 40, 16, '#d62828'); ctx.restore(); label(ctx, 'YARDIM ENGELLENDİ', 930, 800, { at: o.mora + 5.0, small: true }, t); }
    }
  }
}
function cityMap(ctx, o, t, env) {
  ctx.fillStyle = LAND; ctx.fillRect(-600, -300, 3100, 1700);
  ctx.save(); ctx.translate(210, 50); ctx.scale(0.86, 0.86);
  ctx.fillStyle = SEA;
  // Marmara (güney) + Boğaz (doğu)
  ctx.beginPath(); ctx.moveTo(-600, 1000); ctx.lineTo(560, 910); ctx.quadraticCurveTo(1100, 860, 1560, 560); ctx.lineTo(1700, 300); ctx.lineTo(1780, -300); ctx.lineTo(2600, -300); ctx.lineTo(2600, 1500); ctx.lineTo(-600, 1500); ctx.closePath(); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#4a6a7a'; ctx.stroke();
  // Haliç
  ctx.beginPath(); ctx.moveTo(380, 120); ctx.quadraticCurveTo(900, 170, 1300, 260); ctx.quadraticCurveTo(1560, 300, 1720, 330); ctx.lineTo(1700, 420); ctx.quadraticCurveTo(1400, 330, 1200, 330); ctx.quadraticCurveTo(800, 290, 470, 230); ctx.quadraticCurveTo(400, 180, 380, 120); ctx.closePath(); ctx.fill(); ctx.stroke();
  // deniz surları
  ctx.save(); ctx.setLineDash([14, 8]); ctx.lineWidth = 7; ctx.strokeStyle = '#8a7a62';
  ctx.beginPath(); ctx.moveTo(500, 238); ctx.quadraticCurveTo(800, 300, 1200, 345); ctx.quadraticCurveTo(1450, 360, 1650, 470); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(560, 898); ctx.quadraticCurveTo(1100, 845, 1545, 560); ctx.stroke(); ctx.restore();
  // kara surları
  ctx.beginPath(); ctx.moveTo(500, 238); ctx.quadraticCurveTo(470, 560, 560, 900); ctx.lineWidth = 22; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 14; ctx.strokeStyle = '#c4b294'; ctx.stroke();
  for (let i = 0; i <= 14; i++) { const u = i / 14, a = 1 - u; const x = a * a * 500 + 2 * a * u * 470 + u * u * 560, y = a * a * 238 + 2 * a * u * 560 + u * u * 900; ctx.beginPath(); ctx.rect(x - 12, y - 12, 24, 24); ol(ctx, '#d4c3a4', 4); }
  mapLabel(ctx, 'KONSTANTİNOPOLİS', 1050, 590, 46, '#5a2a12');
  mapLabel(ctx, 'HALİÇ', 1100, 285, 34, '#2a4a5a'); mapLabel(ctx, 'MARMARA DENİZİ', 1250, 890, 40, '#2a4a5a'); mapLabel(ctx, 'GALATA', 1300, 150, 36); mapLabel(ctx, 'BOĞAZ', 1830, 520, 36, '#2a4a5a');
  const badge = (s, x, y, c, at) => {
    const k = popScale(t, at, 0.4); if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.font = '900 34px Nunito'; const w = ctx.measureText(s).width + 40;
    rr(ctx, -w / 2, -34, w, 68, 14); ol(ctx, c, 5); text(ctx, s, 0, 2, { font: '900 34px Nunito', fill: '#fff' });
    flagIcon(ctx, -w / 2 - 6, -40);
    ctx.restore();
  };
  const flagIcon = (ctx, x, y) => { line(ctx, x, y + 40, x, y - 40, 5, '#5a3a22'); poly(ctx, [[x, y - 40], [x + 44, y - 28], [x, y - 14]]); ol(ctx, RED, 3); };
  badge('RUMELİ ASKERLERİ', 250, 330, '#3a6b8f', 0.6);
  badge('PADİŞAH + YENİÇERİLER', 250, 580, '#b3242c', 2.0);
  badge('ANADOLU ASKERLERİ', 270, 830, '#3a8a5a', 3.6);
  badge('ZAĞANOS PAŞA', 820, 90, '#6b4a8f', 5.2);
  if (o.wave != null && t > o.wave) {
    const k = ease.inOut(clamp((t - o.wave) / 1.2));
    const back = clamp((t - o.wave - 2.6) / 1.0);
    const reach = k * (1 - ease.inOut(back) * 0.85);
    ctx.save(); ctx.translate(380, 760); ctx.rotate(-0.12);
    rr(ctx, 0, -18, 320 * reach, 36, 18); ol(ctx, '#3a8a5a', 5);
    poly(ctx, [[320 * reach, -44], [320 * reach + 60, 0], [320 * reach, 44]]); ol(ctx, '#3a8a5a', 5);
    ctx.restore();
    if (back > 0.3) label(ctx, 'GERİ PÜSKÜRTÜLDÜ', 760, 690, { at: o.wave + 3.0, small: true }, t);
  }
  ctx.restore();
}

// ── ALTYAZI & FİLİGRAN ──
function subtitles(ctx, lines, alpha) {
  if (!lines || !lines.length) return;
  ctx.save(); ctx.globalAlpha = alpha;
  const fs = 50, lh = 64;
  lines.forEach((s, i) => {
    const y = H - 62 - (lines.length - 1 - i) * lh;
    text(ctx, s, 960, y, { font: `800 ${fs}px NunitoXB`, fill: '#ffffff', stroke: 'rgba(15,10,5,0.92)', lw: 11 });
  });
  ctx.restore();
}
function watermark(ctx, t) {
  ctx.save(); ctx.globalAlpha = 0.8;
  hourglass(ctx, 1838, 74, 0.34, t);
  ctx.restore();
}

module.exports = { label, banner, date, rankCard, stats, factList, stamp, clock, warn, thought, subscribe, crack, bigTitle, dayCounter, ladder, lineup, endCard, split, regionMap, cityMap, subtitles, watermark, hourglass };
