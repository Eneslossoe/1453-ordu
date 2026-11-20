// Nesneler: at, öküz, gemiler, top, kazan, fener, kalabalık vb.
const C = require('./core');
const { INK, clamp, lerp, ease, appear, rng, hash, noise1, col, mix, shade, rgba, ol, rr, ell, circ, poly, line, tube, glow, T } = C;
const { drawPerson, LOOKS } = require('./person');
const { slopeY, flag } = require('./bg');

// ── AT ── (sağa bakar; flip ile sola)
function horse(ctx, x, y, s, o, t) {
  const c = o.white ? '#f1ece2' : (o.color || '#8a5a3a');
  const mane = o.white ? '#d9d2c4' : '#3a2416';
  const act = o.act || 'idle';
  const ph = t * (act === 'gallop' ? 9 : act === 'walk' ? 4 : 0) + (o.phase || 0);
  const bob = act === 'gallop' ? -Math.abs(Math.sin(ph)) * 14 : act === 'walk' ? Math.sin(ph * 2) * 3 : Math.sin(t * 1.5) * 2;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  if (!o.water) { ell(ctx, 0, 6, 150, 16); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fill(); }
  ctx.translate(0, bob);
  if (act === 'rear') { ctx.translate(-80, -20); ctx.rotate(-0.35 - Math.sin(t * 3) * 0.05); ctx.translate(80, 20); }
  const leg = (lx, a, front) => {
    ctx.save(); ctx.translate(lx, -112); ctx.rotate(a);
    const knee = act === 'rear' && front ? 1.3 : (act === 'gallop' ? Math.max(0, Math.sin(ph + lx)) * 0.9 : 0.1);
    tube(ctx, [[0, 0], [0, 52]], 24, c, 5);
    ctx.translate(0, 52); ctx.rotate(front ? -knee : knee * 0.6);
    tube(ctx, [[0, 0], [0, 54]], 18, c, 5);
    rr(ctx, -13, 50, 26, 16, 5); ol(ctx, '#3a2a1e', 4);
    ctx.restore();
  };
  const sw = act === 'gallop' ? 0.65 : act === 'walk' ? 0.3 : 0.02;
  // arka bacaklar (uzak)
  leg(-70, Math.sin(ph + 1.6) * sw, false); leg(76, Math.sin(ph + 3.4) * sw, true);
  // kuyruk
  ctx.beginPath(); ctx.moveTo(-112, -178); ctx.quadraticCurveTo(-170, -150 + Math.sin(t * 4) * 10, -160 - (act === 'gallop' ? 30 : 0), -70 + Math.sin(t * 3) * 6); ctx.quadraticCurveTo(-140, -130, -110, -160); ol(ctx, mane, 4);
  // gövde
  ell(ctx, 0, -158, 124, 56); ol(ctx, c, 5);
  // boyun + kafa
  ctx.beginPath(); ctx.moveTo(70, -190); ctx.quadraticCurveTo(110, -260, 150, -290); ctx.lineTo(186, -262); ctx.quadraticCurveTo(140, -200, 118, -128); ctx.closePath(); ol(ctx, c, 5);
  ctx.save(); ctx.translate(166, -274); ctx.rotate(0.55 + (act === 'idle' ? Math.sin(t * 1.4) * 0.05 : 0));
  rr(ctx, -26, -24, 108, 50, 24); ol(ctx, c, 5);
  circ(ctx, 72, 6, 5); ctx.fillStyle = INK; ctx.fill();
  circ(ctx, 18, -6, 7); ctx.fillStyle = INK; ctx.fill(); circ(ctx, 16, -8, 2.2); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.restore();
  poly(ctx, [[150, -300], [160, -340], [172, -296]]); ol(ctx, c, 4);
  ctx.beginPath(); ctx.moveTo(78, -200); ctx.quadraticCurveTo(110, -280, 150, -306); ctx.quadraticCurveTo(140, -250, 98, -186); ol(ctx, mane, 4);
  // ön bacaklar (yakın)
  leg(-60, Math.sin(ph) * sw, false); leg(88, Math.sin(ph + 2.2) * sw, true);
  // eyer örtüsü
  ctx.beginPath(); ctx.moveTo(-58, -206); ctx.lineTo(48, -206); ctx.lineTo(56, -128); ctx.quadraticCurveTo(0, -118, -64, -128); ctx.closePath(); ol(ctx, o.rider === 'padisah' ? '#b3242c' : '#2f4f8f', 4.5);
  line(ctx, -62, -136, 54, -136, 6, '#e0b13c');
  // dizgin
  ctx.beginPath(); ctx.moveTo(196, -240); ctx.quadraticCurveTo(120, -200, 40, -230); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
  if (o.rider) {
    const ps = 0.82;
    const flipBack = o.flip; // binicinin yüzü kameraya dönük kalır
    ctx.save(); if (flipBack) ctx.scale(-1, 1);
    const ra = o.pose === 'scout' ? 'scout' : act === 'gallop' ? 'charge' : act === 'rear' ? 'shake' : 'idle';
    drawPerson(ctx, { look: o.rider, x: flipBack ? 6 : -6, y: -196 + 72 * ps, s: ps, expr: o.expr || 'determined', act: ra, noLegs: true, noShadow: true, prop: o.prop, lookX: o.flip ? -0.6 : 0.6 }, t);
    ctx.restore();
    const L = LOOKS[o.rider];
    tube(ctx, [[0, -192], [44, -150], [30, -96]], 26, L.pants || '#5c4a3a', 5);
    rr(ctx, 14, -112, 34, 30, 9); ol(ctx, L.boots || '#3a2616', 4);
  }
  ctx.restore();
  if (o.water) {
    ctx.save(); ctx.translate(x, y);
    const g = ctx.createLinearGradient(0, -90 * s, 0, 60 * s); g.addColorStop(0, rgba('#4f8fb0', 0.85)); g.addColorStop(1, rgba('#2c5f7c', 0.95));
    ctx.fillStyle = g; ctx.fillRect(-260 * s, -70 * s, 520 * s, 160 * s);
    ctx.strokeStyle = '#d8f0fa'; ctx.lineWidth = 4;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(0, -70 * s, (160 + i * 40 + (t * 60) % 40) * s, 16 * s, 0, 0, Math.PI * 2); ctx.globalAlpha = 0.5 - i * 0.1; ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.restore();
  }
}

// ── ÖKÜZ ──
function ox(ctx, x, y, s, t, ph = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ell(ctx, 0, 4, 120, 14); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fill();
  const p = t * 3 + ph;
  for (const [lx, o] of [[-60, 0], [56, 2], [-44, 3], [70, 1]]) { ctx.save(); ctx.translate(lx, -70); ctx.rotate(Math.sin(p + o) * 0.25); rr(ctx, -12, 0, 24, 72, 9); ol(ctx, '#6b4a30', 4); rr(ctx, -13, 62, 26, 12, 4); ol(ctx, '#2a1e16', 3); ctx.restore(); }
  ell(ctx, 0, -110, 100, 52); ol(ctx, '#8a6444', 5);
  ell(ctx, -30, -96, 30, 20); ctx.fillStyle = col('#efe2c8'); ctx.fill();
  ctx.save(); ctx.translate(108, -112 + Math.sin(p * 2) * 2);
  rr(ctx, -20, -30, 64, 60, 22); ol(ctx, '#8a6444', 5);
  ell(ctx, 40, 12, 18, 14); ol(ctx, '#d9a58a', 4);
  circ(ctx, 12, -8, 5); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-6, -26); ctx.quadraticCurveTo(-20, -60, 4, -66); ctx.quadraticCurveTo(-4, -50, 8, -28); ol(ctx, '#efe2c8', 3.5);
  ctx.restore();
  rr(ctx, 70, -170, 20, 80, 6); ol(ctx, '#9a6a3a', 4);
  ctx.restore();
}

// ── KADIRGA ── (sağa bakar)
function ship(ctx, x, y, s, o, t) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 1.6 + x) * 4 * s); ctx.scale(s * (o.flip ? -1 : 1), s); if (o.rot) ctx.rotate(o.rot);
  // kürekler
  const row = o.rowing !== false;
  for (let i = 0; i < 12; i++) {
    const ox2 = -230 + i * 40, a = row ? Math.sin(t * 2.4 + (o.phase || 0)) * 0.35 : 0.1;
    ctx.save(); ctx.translate(ox2, 8); ctx.rotate(0.55 + a);
    line(ctx, 0, 0, 0, 150, 7, '#8a5a32'); ell(ctx, 0, 150, 8, 22); ol(ctx, '#8a5a32', 3);
    ctx.restore();
  }
  // gövde
  ctx.beginPath(); ctx.moveTo(-320, -60); ctx.quadraticCurveTo(-300, 30, -180, 40); ctx.lineTo(240, 40); ctx.quadraticCurveTo(320, 20, 360, -30); ctx.lineTo(420, -36); ctx.lineTo(330, -50); ctx.lineTo(-290, -40); ctx.closePath(); ol(ctx, '#8a5a32', 5);
  line(ctx, -300, -20, 330, -20, 6, '#c0392b'); line(ctx, -280, 10, 300, 10, 3, '#5e3a1e');
  // kıç köşkü
  ctx.beginPath(); ctx.rect(-300, -100, 90, 56); ol(ctx, '#a06a3a', 4); ctx.beginPath(); ctx.arc(-255, -100, 45, Math.PI, 0); ol(ctx, '#c0392b', 4);
  // kürekçiler
  for (let i = 0; i < 9; i++) { const hx = -180 + i * 50, hy = -56 + (row ? Math.sin(t * 2.4 + (o.phase || 0)) * 3 : 0); circ(ctx, hx, hy, 12); ol(ctx, '#f2d0a4', 3); ctx.beginPath(); ctx.arc(hx, hy - 4, 12, Math.PI, 0); ol(ctx, '#c0392b', 3); }
  // direk + latin yelken
  line(ctx, 40, -40, 40, -380, 10, '#6b4224');
  if (o.sail !== false) {
    ctx.beginPath(); ctx.moveTo(-180, -110); ctx.lineTo(220, -420); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = col('#8a5a32'); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-170, -118); ctx.lineTo(214, -414); ctx.quadraticCurveTo(170 + Math.sin(t * 2) * 8, -200, 40, -60); ctx.closePath(); ol(ctx, '#f2ead6', 4);
    line(ctx, 30, -270, 120, -150, 3, '#d8cdb4');
  }
  flag(ctx, 40, -378, 0, '#c0272d', t, { len: 60, fh: 30 });
  flag(ctx, -290, -100, 70, '#c0272d', t, { len: 50, fh: 28 });
  ctx.restore();
}
// ── HRİSTİYAN GEMİSİ (karaka) ── (sağa bakar)
function carrack(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 1.2 + x) * 5 * s); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-300, -170); ctx.lineTo(-240, -170); ctx.lineTo(-230, -110); ctx.lineTo(200, -110); ctx.lineTo(240, -190); ctx.lineTo(300, -190); ctx.quadraticCurveTo(290, 0, 160, 40); ctx.lineTo(-200, 40); ctx.quadraticCurveTo(-300, 0, -300, -170); ctx.closePath(); ol(ctx, '#5e3a22', 5);
  line(ctx, -280, -60, 280, -60, 5, '#e0b13c');
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.rect(-170 + i * 60, -40, 22, 18); ol(ctx, '#2a1a10', 3); }
  for (const [mx, h, w] of [[-60, 520, 200], [130, 420, 150]]) {
    line(ctx, mx, -110, mx, -110 - h, 10, '#6b4224');
    const bulge = Math.sin(t * 1.5) * 6;
    ctx.beginPath(); ctx.moveTo(mx - w / 2, -110 - h + 30); ctx.lineTo(mx + w / 2, -110 - h + 30); ctx.quadraticCurveTo(mx + w / 2 + 20 + bulge, -110 - h * 0.55, mx + w / 2, -150); ctx.lineTo(mx - w / 2, -150); ctx.quadraticCurveTo(mx - w / 2 + 20 + bulge, -110 - h * 0.55, mx - w / 2, -110 - h + 30); ctx.closePath(); ol(ctx, '#f4efe2', 4);
    line(ctx, mx + 10, -110 - h + 70, mx + 10, -190, 12, '#c0272d'); line(ctx, mx - w / 2 + 20, -110 - h * 0.6, mx + w / 2 - 10, -110 - h * 0.6, 12, '#c0272d');
  }
  ctx.restore();
}

// ── ŞAHİ TOPU ── (namlu sağa bakar)
function cannon(ctx, x, y, s, o, t, gt) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const F = o.fire;
  let recoil = 0;
  if (F != null && gt > F) { const k = gt - F; recoil = k < 0.15 ? -k / 0.15 * 40 : -40 * Math.max(0, 1 - (k - 0.15) / 1.2); }
  // kızak / kütükler
  ell(ctx, 0, 8, 380, 20); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill();
  rr(ctx, -380, -60, 720, 60, 10); ol(ctx, '#8a5a32', 5);
  for (const lx of [-300, -40, 220]) { rr(ctx, lx - 30, -90, 60, 90, 8); ol(ctx, '#7a4a28', 4.5); }
  ctx.translate(recoil, 0);
  const by = -150;
  ctx.beginPath(); ctx.moveTo(-330, by - 52); ctx.quadraticCurveTo(-380, by, -330, by + 52); ctx.lineTo(260, by + 46); ctx.lineTo(300, by + 60); ctx.lineTo(330, by + 60); ctx.lineTo(330, by - 60); ctx.lineTo(300, by - 60); ctx.lineTo(260, by - 46); ctx.closePath(); ol(ctx, '#b8863a', 5.5);
  ctx.fillStyle = 'rgba(255,240,190,0.35)'; ctx.fillRect(-320, by - 34, 590, 14);
  for (const rx of [-250, -140, -20, 100, 210]) { rr(ctx, rx - 9, by - 58, 18, 116, 6); ol(ctx, '#9a6e2a', 4); }
  ell(ctx, 330, by, 16, 60); ol(ctx, '#2a1e12', 4);
  if (o.cracks) {
    const k = o.cracks;
    ctx.save(); ctx.lineWidth = 4; ctx.strokeStyle = k > 0.6 ? '#ff7a2a' : INK; ctx.lineCap = 'round';
    const cr = [[-80, by - 40, [[20, 14], [10, 20], [24, 8]]], [60, by - 30, [[-14, 18], [10, 16], [-6, 22]]], [150, by + 10, [[18, -16], [14, 10]]]];
    for (const [cx, cy, segs] of cr) { ctx.beginPath(); ctx.moveTo(cx, cy); let px = cx, py = cy; for (const [dx, dy] of segs.slice(0, Math.ceil(segs.length * k))) { px += dx; py += dy; ctx.lineTo(px, py); } ctx.stroke(); }
    if (k > 0.6) glow(ctx, 40, by, 200, '#ff6a20', (k - 0.6) * 0.8);
    ctx.restore();
  }
  if (o.oil) { const k = (t * 0.7) % 1; ctx.fillStyle = col('#e8b830'); for (let i = 0; i < 3; i++) { ell(ctx, -100 + i * 90, by + 50 + ((k + i * 0.33) % 1) * 60, 5, 8); ctx.globalAlpha = 0.8; ctx.fill(); ctx.globalAlpha = 1; } }
  ctx.restore();
  if (F != null && gt > F) {
    const k = gt - F;
    const mx = x + 340 * s, my = y + by * s;
    if (k < 0.35) {
      ctx.save(); ctx.translate(mx, my); ctx.scale(s * (1 + k * 3), s * (1 + k * 3));
      ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 60 : 140; ctx.lineTo(Math.cos(a) * r * 1.4 + 60, Math.sin(a) * r); } ctx.closePath();
      ctx.fillStyle = rgba('#ffd23a', 1 - k / 0.35); ctx.fill(); ctx.restore();
      glow(ctx, mx, my, 600, '#ffb040', 0.8 * (1 - k / 0.35));
    }
    for (let i = 0; i < 14; i++) {
      const kk = clamp(k / 3); const a = (hash(i) - 0.5) * 1.6;
      const d = ease.out(kk) * (200 + hash(i + 7) * 400);
      circ(ctx, mx + Math.cos(a) * d + 40, my + Math.sin(a) * d * 0.6 - kk * 120, (50 + hash(i + 2) * 70) * (0.5 + kk)); ctx.fillStyle = rgba('#d8d2c8', 0.75 * (1 - kk)); ctx.fill();
    }
    if (k < 1.2) { const bk = k / 1.2; circ(ctx, lerp(mx, 1500, bk), lerp(my, 470, bk) - Math.sin(bk * Math.PI) * 160, lerp(28, 10, bk) * s); ol(ctx, '#7d7a72', 3); }
  }
}

// ── KAZAN ──
function kazan(ctx, x, y, s, o, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.halo) {
    ctx.save(); ctx.rotate(t * 0.25);
    for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); poly(ctx, [[-22, -150], [0, -560], [22, -150]]); ctx.fillStyle = 'rgba(255,215,110,0.25)'; ctx.fill(); }
    ctx.restore(); glow(ctx, 0, -150, 420, '#ffd27a', 0.5);
  }
  for (let i = 0; i < 5; i++) { circ(ctx, -110 + i * 55, 0, 26); ol(ctx, '#8a847a', 4); }
  if (o.fire) {
    for (let i = 0; i < 5; i++) {
      const fx = -90 + i * 45, h = 70 + noise1(t * 6 + i * 3) * 22;
      ctx.beginPath(); ctx.moveTo(fx - 26, -10); ctx.quadraticCurveTo(fx - 26, -h * 0.6, fx, -h); ctx.quadraticCurveTo(fx + 26, -h * 0.6, fx + 26, -10); ctx.closePath(); ctx.fillStyle = '#ff8a2a'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(fx - 12, -10); ctx.quadraticCurveTo(fx - 10, -h * 0.4, fx, -h * 0.6); ctx.quadraticCurveTo(fx + 10, -h * 0.4, fx + 12, -10); ctx.closePath(); ctx.fillStyle = '#ffe07a'; ctx.fill();
    }
    glow(ctx, 0, -40, 260, '#ff8a3a', 0.45);
  }
  ctx.beginPath(); ctx.moveTo(-170, -190); ctx.quadraticCurveTo(-180, -40, 0, -40); ctx.quadraticCurveTo(180, -40, 170, -190); ctx.closePath(); ol(ctx, '#b8623a', 5.5);
  ctx.fillStyle = 'rgba(255,220,180,0.3)'; ell(ctx, -90, -120, 26, 50, 0.3); ctx.fill();
  ell(ctx, 0, -190, 175, 36); ol(ctx, '#d0784a', 5); ell(ctx, 0, -188, 150, 24); ol(ctx, '#e3c27a', 3.5);
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 186, -160, 26, sx > 0 ? -1.4 : 1.7, sx > 0 ? 1.4 : 4.6); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = col('#9a5a32'); ctx.stroke(); }
  for (let i = 0; i < 6; i++) { const k = (t * 0.4 + i / 6) % 1; circ(ctx, -80 + i * 32 + Math.sin(k * 6 + i) * 20, -230 - k * 260, 18 + k * 40); ctx.fillStyle = `rgba(255,255,255,${0.45 * (1 - k)})`; ctx.fill(); }
  ctx.restore();
}

// ── KAMP ATEŞİ ──
function campfire(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  line(ctx, -50, 0, 50, -14, 14, '#6b4224'); line(ctx, -50, -14, 50, 0, 14, '#5a3a1e');
  for (let i = 0; i < 4; i++) {
    const fx = -30 + i * 20, h = 70 + noise1(t * 7 + i * 2 + x) * 24;
    ctx.beginPath(); ctx.moveTo(fx - 22, -6); ctx.quadraticCurveTo(fx - 20, -h * 0.6, fx + 2, -h); ctx.quadraticCurveTo(fx + 22, -h * 0.6, fx + 22, -6); ctx.closePath(); ctx.fillStyle = '#ff8a2a'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(fx - 10, -6); ctx.quadraticCurveTo(fx - 8, -h * 0.4, fx + 2, -h * 0.6); ctx.quadraticCurveTo(fx + 10, -h * 0.4, fx + 10, -6); ctx.closePath(); ctx.fillStyle = '#ffe07a'; ctx.fill();
  }
  ctx.restore();
  glow(ctx, x, y - 30 * s, 260 * s, '#ff8a3a', 0.5);
}

// ── KALABALIK ──
const MIX = ['yeniceri', 'sipahi', 'basibozuk', 'akinci', 'cebelu', 'topcu', 'yeniceri', 'nefer'];
function crowd(ctx, o, t) {
  const rows = o.rows || 2, n = o.n || 20;
  const sil = o.silhouette;
  for (let r = rows - 1; r >= 0; r--) {
    const sc = (o.s || 0.5) * (1 - r * 0.12);
    const yy = o.y - r * 46 * (o.s || 0.5) * 2.2;
    const step = (o.x1 - o.x0) / n;
    if (sil) T.sil = mix('#0b0f1e', '#1d2440', r / rows);
    for (let i = 0; i < n; i++) {
      const seed = i * 7.3 + r * 13.1;
      const look = o.look === 'mix' ? MIX[Math.floor(hash(seed) * MIX.length)] : o.look;
      let x = o.x0 + (i + 0.5 + (r % 2) * 0.5) * step + (hash(seed + 2) - 0.5) * step * 0.4;
      let act = o.act || 'idle';
      if (act === 'charge') x += ((t * 60 + hash(seed) * 200) % 240) - 120;
      const prop = (o.banners || o.flags) && i % 5 === 2 ? 'flag' : act === 'charge' || act === 'march' ? (LOOKS[look].prop || 'sword') : null;
      drawPerson(ctx, { look, x, y: yy, s: sc, act: act === 'idle' ? 'idle' : act, expr: act === 'charge' ? 'angry' : act === 'cheer' ? 'happy' : 'determined', simple: true, seed, prop, noShadow: sil }, t);
    }
    T.sil = null;
  }
}

// ── küçük nesneler ──
function lanternLamp(ctx, x, y, t) {
  line(ctx, x, y - 60, x, y - 30, 3);
  rr(ctx, x - 22, y - 30, 44, 56, 8); ol(ctx, '#5a4a3a', 4);
  const f = 1 + noise1(t * 9) * 0.12;
  ell(ctx, x, y, 9, 16 * f); ctx.fillStyle = '#ffd36a'; ctx.fill();
}
function fish(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 3) * 6); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-180, 0); ctx.quadraticCurveTo(-40, -110, 120, -20); ctx.lineTo(170, -70); ctx.lineTo(170, 70); ctx.lineTo(120, 20); ctx.quadraticCurveTo(-40, 110, -180, 0); ctx.closePath(); ol(ctx, '#7fa9c4', 5);
  ctx.save(); ctx.clip(); ctx.fillStyle = col('#a9cde0'); ell(ctx, -30, 30, 150, 40); ctx.fill(); ctx.restore();
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-40 + i * 36, 0, 26, -0.9, 0.9); ctx.lineWidth = 3; ctx.strokeStyle = col('#5f8aa6'); ctx.stroke(); }
  circ(ctx, -120, -20, 14); ol(ctx, '#fff', 4); circ(ctx, -124, -20, 6); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
  for (let i = 0; i < 9; i++) { const k = (t * 0.8 + i / 9) % 1; coin(ctx, x - 190 * s - k * 120 - i * 6, y + 20 + k * k * 260 + (i % 3) * 14, 22 * s, t + i); }
}
function coin(ctx, x, y, r, t) {
  const w = Math.abs(Math.cos(t * 4)) * 0.7 + 0.3;
  ell(ctx, x, y, r * w, r); ol(ctx, '#f0c24e', 3.5); ell(ctx, x, y, r * w * 0.6, r * 0.6); ctx.lineWidth = 2.5; ctx.strokeStyle = col('#c08a1e'); ctx.stroke();
}
function tray(ctx, x, y, t) {
  ctx.save(); ctx.translate(x, y);
  ell(ctx, 0, 0, 220, 50); ol(ctx, '#c8893a', 5); ell(ctx, 0, -6, 190, 38); ol(ctx, '#e0a650', 3);
  ctx.beginPath(); ctx.moveTo(-90, -10); ctx.quadraticCurveTo(-80, -110, 0, -116); ctx.quadraticCurveTo(80, -110, 90, -10); ctx.closePath(); ol(ctx, '#f5ecd2', 4);
  for (let i = 0; i < 14; i++) { circ(ctx, -60 + hash(i) * 120, -30 - hash(i + 4) * 70, 4); ctx.fillStyle = col('#e6d7ad'); ctx.fill(); }
  for (const [fx, c] of [[130, '#d23a3a'], [160, '#e8a020'], [-140, '#6aa83a']]) { circ(ctx, fx, -26, 22); ol(ctx, c, 4); }
  ctx.beginPath(); ctx.moveTo(-180, -20); ctx.lineTo(-170, -70); ctx.lineTo(-130, -70); ctx.lineTo(-120, -20); ctx.closePath(); ol(ctx, '#b84a3a', 4);
  ctx.restore();
}
function scroll(ctx, x, y, title, k, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  rr(ctx, -200, -240, 400, 480, 10); ol(ctx, '#f3e6c4', 5);
  for (const sy of [-240, 240]) { rr(ctx, -226, sy - 22, 452, 44, 22); ol(ctx, '#c9a46a', 5); }
  C.text(ctx, title, 0, -150, { font: '900 40px Cinzel', fill: '#5a2a12' });
  for (let i = 0; i < 6; i++) { ctx.beginPath(); for (let j = 0; j <= 20; j++) ctx.lineTo(-150 + j * 15, -70 + i * 44 + Math.sin(j * 1.3 + i) * 6); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(90,50,20,0.55)'; ctx.stroke(); }
  ctx.restore();
}
function planTable(ctx, x, y, t) {
  ctx.save(); ctx.translate(x, y);
  rr(ctx, -330, -40, 660, 40, 8); ol(ctx, '#7a4a28', 5);
  for (const lx of [-300, 270]) { rr(ctx, lx, 0, 30, 120, 6); ol(ctx, '#6b4224', 4); }
  ctx.save(); ctx.translate(-30, -46); ctx.transform(1, 0, -0.5, 0.32, 0, 0);
  rr(ctx, -260, -260, 520, 260, 6); ol(ctx, '#efe0bc', 5);
  ctx.beginPath(); ctx.moveTo(-200, -40); ctx.lineTo(-180, -220); ctx.lineWidth = 12; ctx.strokeStyle = col('#8a6a4a'); ctx.stroke();
  for (let i = 0; i < 4; i++) { circ(ctx, -60 + i * 70, -120 + Math.sin(i) * 40, 14); ctx.fillStyle = col('#c0392b'); ctx.fill(); }
  ctx.restore();
  // mum
  rr(ctx, 220, -130, 30, 90, 6); ol(ctx, '#f4efe0', 4);
  const f = 1 + noise1(t * 8) * 0.15;
  ell(ctx, 235, -152, 9, 20 * f); ctx.fillStyle = '#ffcf5a'; ctx.fill();
  ctx.restore();
  glow(ctx, x + 235, y - 152, 520, '#ffb44a', 0.5);
}
function emptyPurse(ctx, x, y, k, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.beginPath(); ctx.moveTo(-70, 40); ctx.quadraticCurveTo(-90, -40, -30, -60); ctx.lineTo(30, -60); ctx.quadraticCurveTo(90, -40, 70, 40); ctx.quadraticCurveTo(0, 60, -70, 40); ol(ctx, '#9a7048', 5);
  line(ctx, -36, -56, 36, -56, 6, '#5a3a22');
  const fx = Math.cos(t * 3) * 90, fy = -110 + Math.sin(t * 5) * 30;
  circ(ctx, fx, fy, 8); ctx.fillStyle = INK; ctx.fill(); ell(ctx, fx - 6, fy - 8, 7, 4); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fill(); ell(ctx, fx + 6, fy - 8, 7, 4); ctx.fill();
  ctx.restore();
}
function boatRail(ctx) {
  rr(ctx, -560, 860, 3040, 300, 10); ol(ctx, '#8a5a32', 6);
  line(ctx, -560, 900, 2480, 900, 8, '#c0392b');
  for (let x = -500; x < 2480; x += 160) { rr(ctx, x, 840, 40, 40, 8); ol(ctx, '#6b4224', 4); }
}
function convoy(ctx, t) {
  const base = -560 + t * 70;
  const gy = 960;
  for (let i = 0; i < 4; i++) { ox(ctx, base + 1240 + i * 160, gy - 40, 0.52, t, i + 4); }
  for (let i = 0; i < 4; i++) { ox(ctx, base + 1280 + i * 160, gy - 4, 0.6, t, i); }
  const cx = base + 760;
  cannon(ctx, cx, gy - 34, 0.62, {}, t, t);
  for (const wx of [cx - 200, cx, cx + 180]) { circ(ctx, wx, gy - 6, 40); ol(ctx, '#7a4a28', 5); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4 + t * 2; line(ctx, wx + Math.cos(a) * 34, gy - 6 + Math.sin(a) * 34, wx - Math.cos(a) * 34, gy - 6 - Math.sin(a) * 34, 4, '#5a3a22'); } circ(ctx, wx, gy - 6, 10); ol(ctx, '#3a2616', 3); }
  line(ctx, cx + 230, gy - 110, base + 1230, gy - 120, 6, '#5a3a22');
  for (let i = 0; i < 5; i++) drawPerson(ctx, { look: i % 2 ? 'nefer' : 'koylu', x: cx - 520 + i * 120, y: gy + 50 + (i % 2) * 16, s: 0.5, act: 'walk', expr: 'tired', simple: true, seed: i * 3 }, t);
}
function landShip(ctx, t, gt) {
  const x = 240 + gt * 26;
  const y = slopeY(x) - 20;
  const ang = Math.atan(-0.26);
  ship(ctx, x, y, 0.85, { rot: ang, rowing: true, phase: 0 }, gt * 1.6);
  // ip + çekenler
  const bx = x + 330 * 0.85, by = slopeY(bx) - 60;
  for (let i = 0; i < 3; i++) { const px = bx + 220 + i * 150; drawPerson(ctx, { look: i === 1 ? 'yeniceri' : 'kurekci', x: px, y: slopeY(px) + 52, s: 0.6, act: 'pull', expr: 'determined', simple: true, seed: i, prop: null }, gt); }
  for (let i = 0; i < 2; i++) { const px = bx + 700 + i * 200; ox(ctx, px, slopeY(px) + 56, 0.55, gt, i); }
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 1100, slopeY(bx + 1100) - 40); ctx.lineWidth = 5; ctx.strokeStyle = col('#c9a46a'); ctx.stroke();
}

module.exports = { horse, ox, ship, carrack, cannon, kazan, campfire, crowd, lanternLamp, fish, coin, tray, scroll, planTable, emptyPurse, boatRail, convoy, landShip };
