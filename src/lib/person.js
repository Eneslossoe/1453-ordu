// Karakter çizimi: kafası büyük, kalın kenar çizgili, ön cepheden çizgi film karakteri.
// Orijin ayak hizasının ortası; y yukarı doğru negatif. s=1 → ~310 px boy.
const { INK, clamp, lerp, ease, appear, hash, noise1, col, mix, shade, rgba, ol, rr, ell, circ, poly, line, tube, glow, T } = require('./core');

const SKIN = '#f2d0a4';
const LOOKS = {
  nefer: { top: '#8a6240', trim: '#6b4a2f', belt: '#b5402f', pants: '#5c4a3a', boots: '#4a3424', hat: 'kece', hatC: '#7a5636', mus: true },
  basibozuk: { top: '#8f7350', trim: '#6e5638', belt: '#5c4a32', pants: '#7a6a52', boots: null, hat: 'rag', hatC: '#d8cba8', patches: true, stubble: true, prop: 'club' },
  asci: { top: '#3f5f8c', trim: '#2f4a70', belt: '#c0392b', pants: '#2e3f5c', boots: '#7a4a24', hat: 'asci', hatC: '#f4f1e8', apron: '#f6f3ea', mus: false, prop: 'ladle' },
  asciusta: { top: '#3f5f8c', trim: '#2f4a70', belt: '#c0392b', pants: '#2e3f5c', boots: '#7a4a24', hat: 'asci', hatC: '#f4f1e8', apron: '#f6f3ea', mus: true, prop: 'ladle' },
  corbaci: { top: '#7a1f2b', trim: '#e0b13c', belt: '#e0b13c', pants: '#3a2a4a', boots: '#e0b13c', hat: 'bork', hatC: '#f4f1e8', coat: 'coat', mus: true, plume: true },
  lagimci: { top: '#5d4b3b', trim: '#46382b', belt: '#3a2e22', pants: '#4a3e33', boots: '#2e241b', hat: 'leather', hatC: '#6b4a2b', dirt: true, stubble: true, prop: 'pickaxe' },
  kurekci: { top: '#efe7d2', trim: '#c9bfa5', belt: '#2f5d8a', pants: '#2f5d8a', boots: null, hat: 'redcap', hatC: '#c0392b', mus: true, prop: 'oar' },
  topcu: { top: '#a8382a', trim: '#7d281e', belt: '#2b2b2b', pants: '#3b3b48', boots: '#2b1d14', hat: 'redcap', hatC: '#7d281e', apron: '#7b5534', mus: true, dirt: true },
  akinci: { top: '#5f6e3a', trim: '#46522a', belt: '#8a5a2b', pants: '#6b5134', boots: '#3a2616', hat: 'kalpak', hatC: '#6e4a2c', mus: true, quiver: true, prop: 'bow' },
  sipahi: { top: '#9aa3ad', trim: '#6c757f', belt: '#8b1e1e', pants: '#7a2222', boots: '#c79a2e', hat: 'turbanhelm', hatC: '#c9ced4', coat: 'mail', cape: '#a52a2a', mus: true, beard: 'short', prop: 'lance' },
  cebelu: { top: '#8d969f', trim: '#646c74', belt: '#5a3b22', pants: '#5b4a3a', boots: '#3a2616', hat: 'helm', hatC: '#b8bec5', coat: 'mail', mus: true, prop: 'spear' },
  yeniceri: { top: '#2f4f8f', trim: '#203a6c', belt: '#c0392b', pants: '#a6342a', boots: '#d9a520', hat: 'bork', hatC: '#f4f1e8', coat: 'coat', mus: true, prop: 'sword' },
  hasan: { top: '#2f4f8f', trim: '#203a6c', belt: '#c0392b', pants: '#a6342a', boots: '#d9a520', hat: 'bork', hatC: '#f4f1e8', coat: 'coat', mus: true, beard: 'short' },
  mehter: { top: '#b52f2f', trim: '#e0b13c', belt: '#e0b13c', pants: '#2f4f8f', boots: '#d9a520', hat: 'kece', hatC: '#b52f2f', coat: 'coat', mus: true },
  vezir: { top: '#2e7d4f', trim: '#e3b448', belt: '#e3b448', pants: '#1f4f33', boots: '#c79a2e', hat: 'kallavi', hatC: '#f7f4ec', coat: 'kaftan', beard: 'short', beardC: '#3a2a1e', mus: true },
  halil: { top: '#8c2a3a', trim: '#e3b448', belt: '#e3b448', pants: '#4a1820', boots: '#c79a2e', hat: 'kallavi', hatC: '#f7f4ec', coat: 'kaftan', beard: 'long', beardC: '#e8e4dc', mus: true, browC: '#cfcac0', fur: '#efe6d6' },
  zaganos: { top: '#24365e', trim: '#e3b448', belt: '#e3b448', pants: '#16223d', boots: '#c79a2e', hat: 'kallavi', hatC: '#f7f4ec', coat: 'kaftan', beard: 'short', beardC: '#1e1612', mus: true },
  padisah: { top: '#b3242c', trim: '#f0c24e', belt: '#f0c24e', pants: '#5a1219', boots: '#f0c24e', hat: 'kavuk', hatC: '#fbf8f0', coat: 'kaftan', beard: 'short', beardC: '#3b2516', mus: true, fur: '#e9dcc4', pattern: true },
  cavus: { top: '#6b2b2b', trim: '#4e1e1e', belt: '#d9a520', pants: '#3a2a2a', boots: '#2b1d14', hat: 'tall', hatC: '#a32a2a', mus: true, prop: 'whip' },
  kaptan: { top: '#2a5f86', trim: '#e3b448', belt: '#e3b448', pants: '#1e3f5a', boots: '#c79a2e', hat: 'kallavi', hatC: '#f7f4ec', coat: 'kaftan', beard: 'short', beardC: '#2b1d14', mus: true },
  bizans: { top: '#6a2d7a', trim: '#e0b13c', belt: '#e0b13c', pants: '#4a2055', boots: '#3a2616', hat: 'helm', hatC: '#b8bec5', coat: 'scale', beard: 'short', beardC: '#4a3020', mus: false },
  giustiniani: { top: '#c9ced4', trim: '#8a929b', belt: '#8b1e1e', pants: '#8b1e1e', boots: '#3a2616', hat: 'sallet', hatC: '#d6dbe0', coat: 'plate', beard: 'short', beardC: '#5a3a22', cape: '#8b1e1e' },
  urban: { top: '#6b4f33', trim: '#4e3923', belt: '#2b1d14', pants: '#3e3a36', boots: '#2b1d14', hat: 'beret', hatC: '#2e2a2a', beard: 'long', beardC: '#7a5230', apron: '#5e4128' },
  koylu: { top: '#c9b28a', trim: '#a8916b', belt: '#7a5a3a', pants: '#6e6150', boots: '#4a3424', hat: 'kufi', hatC: '#efe9da', mus: true },
  koylu2: { top: '#9a7d5a', trim: '#7d6446', belt: '#4f6b3a', pants: '#5a4f42', boots: '#4a3424', hat: 'kufi', hatC: '#e0d6bf', beard: 'short', beardC: '#3b2a1c' },
  cocuk: { top: '#a8916b', trim: '#8a7452', belt: '#6b4a2f', pants: '#6e6150', boots: null, hat: 'hair', hatC: '#4a3020', child: true },
};

// ── kafa / yüz ──
function face(ctx, L, o, t) {
  const R = 64;
  const ex = o.expr || 'neutral';
  const simple = o.simple;
  const skin = L.skin || SKIN;
  // kulaklar
  if (!simple) {
    circ(ctx, -R + 4, 6, 15); ol(ctx, shade(skin, -0.06), 5);
    circ(ctx, R - 4, 6, 15); ol(ctx, shade(skin, -0.06), 5);
  }
  circ(ctx, 0, 0, R); ol(ctx, skin, simple ? 6 : 5.5);
  if (T.sil) return;
  // gölge (çene altı)
  ctx.save(); circ(ctx, 0, 0, R - 3); ctx.clip();
  ell(ctx, 0, R + 6, R * 1.1, 26); ctx.fillStyle = col(shade(skin, -0.12)); ctx.fill(); ctx.restore();
  if (L.dirt) { ctx.fillStyle = col('#8a6a48'); [[-30, 30, 9], [36, 18, 7], [12, -38, 6]].forEach(([x, y, r]) => { ell(ctx, x, y, r * 1.4, r); ctx.globalAlpha = 0.45; ctx.fill(); ctx.globalAlpha = 1; }); }
  if (L.stubble) { ctx.save(); circ(ctx, 0, 0, R - 3); ctx.clip(); ell(ctx, 0, 52, 52, 30); ctx.fillStyle = 'rgba(60,40,25,0.22)'; ctx.fill(); ctx.restore(); }
  // sakal
  const beardC = L.beardC || '#2e2016';
  if (L.beard) {
    const long = L.beard === 'long';
    ctx.beginPath();
    ctx.moveTo(-R + 6, 4);
    ctx.quadraticCurveTo(-R + 2, long ? 80 : 54, -18, long ? 112 : 74);
    ctx.quadraticCurveTo(0, long ? 128 : 84, 18, long ? 112 : 74);
    ctx.quadraticCurveTo(R - 2, long ? 80 : 54, R - 6, 4);
    ctx.quadraticCurveTo(R - 14, 40, 26, 46);
    ctx.quadraticCurveTo(0, 54, -26, 46);
    ctx.quadraticCurveTo(-R + 14, 40, -R + 6, 4);
    ol(ctx, beardC, 5);
  }
  // yanaklar
  if (ex === 'happy' || ex === 'smug' || L.child) { ctx.fillStyle = 'rgba(232,110,100,0.32)'; ell(ctx, -40, 22, 12, 8); ctx.fill(); ell(ctx, 40, 22, 12, 8); ctx.fill(); }
  // gözler
  const blink = !simple && ((t + (o.seed || 0) * 3.7) % 3.6) < 0.11;
  const big = ex === 'shocked' || ex === 'scared';
  const erx = big ? 17 : 14.5, ery = big ? 21 : 17.5;
  const pr = ex === 'shocked' ? 5 : ex === 'scared' ? 6 : 7.5;
  let lx = o.lookX ?? 0, ly = o.lookY ?? 0;
  if (ex === 'scared') lx += noise1(t * 7 + (o.seed || 0)) * 0.6;
  for (const sd of [-1, 1]) {
    const x = sd * 23, y = -4;
    if (blink || ex === 'happy' && o.squint) {
      ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.quadraticCurveTo(x, y + 7, x + 12, y);
      ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke();
      continue;
    }
    ell(ctx, x, y, erx, ery); ol(ctx, '#ffffff', 4.5);
    circ(ctx, x + lx * 5, y + ly * 4 + (ex === 'sad' ? 4 : 0), pr); ctx.fillStyle = INK; ctx.fill();
    if (!simple) { circ(ctx, x + lx * 5 - 2.5, y + ly * 4 - 3, 2.2); ctx.fillStyle = '#fff'; ctx.fill(); }
    // göz kapağı
    const lid = ex === 'tired' ? 0.5 : ex === 'smug' ? 0.42 : ex === 'angry' ? 0.3 : ex === 'determined' ? 0.22 : 0;
    if (lid > 0) {
      ctx.save(); ell(ctx, x, y, erx + 1, ery + 1); ctx.clip();
      ctx.fillStyle = col(shade(skin, -0.05));
      const tilt = ex === 'angry' || ex === 'determined' ? sd * -0.35 : 0;
      ctx.translate(x, y - ery + lid * ery * 2); ctx.rotate(tilt);
      ctx.fillRect(-30, -40, 60, 40);
      ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(30, 0); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
      ctx.restore();
    }
  }
  // kaşlar
  const browC = L.browC || (L.beardC && L.beard ? L.beardC : '#2a1c12');
  const bt = { neutral: 0, happy: 0.12, smug: 0, sad: 0.42, scared: 0.45, shocked: 0.18, angry: -0.5, tired: 0.15, determined: -0.3 }[ex] ?? 0;
  const by = { shocked: -14, scared: -8, happy: -5, sad: -2, angry: 2, determined: 1, tired: 2 }[ex] ?? 0;
  for (const sd of [-1, 1]) {
    let tilt = bt;
    if (ex === 'smug' && sd === 1) tilt = 0.28;
    const cx = sd * 24, cy = -32 + by - (ex === 'smug' && sd === 1 ? 6 : 0);
    const dx = 13 * Math.cos(tilt), dy = 13 * Math.sin(tilt);
    // iç uç (merkeze yakın) tilt>0 ise yukarı
    const ix = cx - sd * dx, iy = cy - dy, ox = cx + sd * dx, oy = cy + dy;
    line(ctx, ix, iy, ox, oy, simple ? 7 : 8, browC);
  }
  // burun
  if (!simple) { ell(ctx, 0, 16, 8, 6.5); ctx.fillStyle = col(shade(skin, -0.14)); ctx.fill(); }
  // bıyık
  if (L.mus || L.beard) {
    ctx.beginPath();
    ctx.moveTo(0, 25);
    ctx.bezierCurveTo(-10, 18, -30, 20, -36, 34);
    ctx.bezierCurveTo(-26, 30, -12, 34, 0, 30);
    ctx.bezierCurveTo(12, 34, 26, 30, 36, 34);
    ctx.bezierCurveTo(30, 20, 10, 18, 0, 25);
    ol(ctx, L.beard ? beardC : '#2a1c12', 3);
  }
  // ağız
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const my = L.mus || L.beard ? 42 : 36;
  ctx.beginPath();
  switch (ex) {
    case 'happy':
      ctx.moveTo(-20, my - 4); ctx.quadraticCurveTo(0, my + 20, 20, my - 4); ctx.closePath();
      ol(ctx, '#7a2a22', 4.5); break;
    case 'smug':
      ctx.moveTo(-14, my + 2); ctx.quadraticCurveTo(4, my + 8, 18, my - 6);
      ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); break;
    case 'sad': case 'tired':
      ctx.moveTo(-14, my + 6); ctx.quadraticCurveTo(0, my - (ex === 'sad' ? 6 : 0), 14, my + 6);
      ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); break;
    case 'scared':
      ell(ctx, 0, my + 4, 15, 9); ol(ctx, '#7a2a22', 4.5);
      ctx.beginPath(); ctx.moveTo(-13, my + 1); for (let i = 0; i <= 6; i++) ctx.lineTo(-13 + i * 4.3, my + 1 + (i % 2 ? 3 : -1));
      ctx.lineWidth = 2.5; ctx.strokeStyle = '#fff'; ctx.stroke(); break;
    case 'shocked':
      ell(ctx, 0, my + 6, 11, 15); ol(ctx, '#5a1a16', 4.5); break;
    case 'angry':
      rr(ctx, -16, my - 4, 32, 14, 5); ol(ctx, '#fff', 4.5);
      line(ctx, -16, my + 3, 16, my + 3, 2.5); break;
    case 'determined':
      ctx.moveTo(-14, my + 3); ctx.lineTo(14, my + 1);
      ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); break;
    default:
      ctx.moveTo(-12, my); ctx.quadraticCurveTo(0, my + 6, 12, my);
      ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
  }
  // ter damlası
  if ((ex === 'scared' || ex === 'tired') && !simple) {
    const k = ((t * 0.9 + (o.seed || 0)) % 1);
    ctx.save(); ctx.translate(R - 2, -30 + k * 26); ctx.globalAlpha = 1 - k * 0.6;
    ctx.beginPath(); ctx.moveTo(0, -14); ctx.quadraticCurveTo(10, 2, 0, 8); ctx.quadraticCurveTo(-10, 2, 0, -14);
    ol(ctx, '#8fd3ff', 3); ctx.restore();
  }
}

// ── başlıklar (kafa merkezine göre) ──
function hat(ctx, L, o, t, back) {
  const c = L.hatC || '#7a5636';
  switch (L.hat) {
    case 'kece':
      if (back) return;
      ctx.beginPath(); ctx.moveTo(-60, -22); ctx.bezierCurveTo(-62, -96, 62, -96, 60, -22); ctx.closePath(); ol(ctx, c, 5);
      rr(ctx, -64, -34, 128, 18, 8); ol(ctx, shade(c, -0.18), 5); break;
    case 'rag':
      if (back) { ctx.beginPath(); ctx.moveTo(40, -40); ctx.quadraticCurveTo(84, -10, 70, 40); ctx.lineTo(56, 36); ctx.quadraticCurveTo(64, 0, 30, -30); ol(ctx, shade(c, -0.12), 4.5); return; }
      ctx.beginPath(); ctx.moveTo(-64, -18);
      ctx.bezierCurveTo(-74, -70, -30, -98, 6, -92); ctx.bezierCurveTo(48, -98, 76, -64, 64, -18);
      ctx.quadraticCurveTo(0, -36, -64, -18); ol(ctx, c, 5);
      line(ctx, -50, -46, 40, -64, 3.5, shade(c, -0.25)); line(ctx, -54, -30, 56, -40, 3.5, shade(c, -0.25));
      circ(ctx, 46, -52, 12); ol(ctx, shade(c, -0.1), 4); break;
    case 'asci':
      if (back) return;
      ctx.beginPath(); ctx.moveTo(-48, -30); ctx.lineTo(-44, -118); ctx.quadraticCurveTo(0, -142, 48, -112); ctx.lineTo(48, -30); ctx.closePath(); ol(ctx, c, 5);
      rr(ctx, -56, -40, 112, 20, 8); ol(ctx, '#c0392b', 5);
      // kaşıklık (kepçe sapı)
      rr(ctx, -6, -98, 12, 46, 5); ol(ctx, '#b07a3c', 4); break;
    case 'leather':
      if (back) return;
      ctx.beginPath(); ctx.moveTo(-62, -6); ctx.bezierCurveTo(-66, -88, 66, -88, 62, -6); ctx.lineTo(50, -10); ctx.quadraticCurveTo(0, -40, -50, -10); ctx.closePath(); ol(ctx, c, 5);
      line(ctx, 0, -78, 0, -30, 3, shade(c, -0.3)); break;
    case 'redcap':
      if (back) return;
      ctx.beginPath(); ctx.moveTo(-58, -26); ctx.quadraticCurveTo(-46, -110, 18, -136); ctx.quadraticCurveTo(30, -132, 26, -118); ctx.quadraticCurveTo(54, -80, 58, -26); ctx.closePath(); ol(ctx, c, 5);
      rr(ctx, -62, -38, 124, 18, 8); ol(ctx, '#efe7d2', 5); break;
    case 'kalpak':
      if (back) return;
      ctx.beginPath(); ctx.moveTo(-62, -22); ctx.quadraticCurveTo(-74, -70, -60, -100);
      for (let i = 0; i < 6; i++) { const x0 = -60 + i * 20; ctx.arc(x0 + 10, -104 - Math.sin((i + 0.5) / 6 * Math.PI) * 10, 11, Math.PI, 0); }
      ctx.quadraticCurveTo(74, -70, 62, -22); ctx.quadraticCurveTo(0, -36, -62, -22); ctx.closePath(); ol(ctx, c, 5);
      ctx.strokeStyle = col(shade(c, 0.25)); ctx.lineWidth = 3;
      for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(-48 + i * 12, -92 + (i % 2) * 6); ctx.quadraticCurveTo(-44 + i * 12, -70, -50 + i * 12, -44); ctx.stroke(); }
      rr(ctx, -64, -36, 128, 16, 8); ol(ctx, shade(c, -0.25), 4.5);
      ctx.beginPath(); ctx.moveTo(30, -100); ctx.quadraticCurveTo(46, -150, 26, -178); ctx.quadraticCurveTo(20, -140, 22, -104); ol(ctx, '#d9d0bd', 3.5); break;
    case 'turbanhelm':
      if (back) return;
      ctx.beginPath(); ctx.moveTo(-50, -40); ctx.quadraticCurveTo(-44, -120, 0, -150); ctx.quadraticCurveTo(44, -120, 50, -40); ctx.closePath(); ol(ctx, c, 5);
      line(ctx, 0, -150, 0, -182, 6, '#c9ced4'); circ(ctx, 0, -186, 7); ol(ctx, '#e0b13c', 4);
      ctx.beginPath(); ctx.moveTo(-24, -128); ctx.quadraticCurveTo(-30, -80, -26, -50); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.stroke();
      rr(ctx, -66, -52, 132, 34, 16); ol(ctx, '#f4f1e8', 5);
      line(ctx, -56, -36, 56, -42, 3, '#d8d2c2'); break;
    case 'helm':
      if (back) return;
      ctx.beginPath(); ctx.moveTo(-60, -14); ctx.bezierCurveTo(-64, -104, 64, -104, 60, -14); ctx.closePath(); ol(ctx, c, 5);
      rr(ctx, -64, -26, 128, 16, 6); ol(ctx, shade(c, -0.2), 5);
      rr(ctx, -6, -26, 12, 40, 4); ol(ctx, shade(c, -0.1), 4);
      if (L.top === '#6a2d7a') { ctx.beginPath(); ctx.moveTo(-8, -86); ctx.quadraticCurveTo(10, -140, 50, -120); ctx.quadraticCurveTo(20, -110, 8, -84); ol(ctx, '#b52f2f', 4); }
      break;
    case 'sallet':
      if (back) { ctx.beginPath(); ctx.moveTo(30, -40); ctx.quadraticCurveTo(80, -20, 92, 20); ctx.lineTo(60, 10); ol(ctx, c, 5); return; }
      ctx.beginPath(); ctx.moveTo(-64, -6); ctx.bezierCurveTo(-68, -110, 68, -110, 64, -6); ctx.closePath(); ol(ctx, c, 5);
      ctx.beginPath(); ctx.moveTo(-30, -70); ctx.quadraticCurveTo(-36, -40, -34, -16); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.stroke(); break;
    case 'beret':
      if (back) return;
      ell(ctx, 6, -52, 76, 30, -0.1); ol(ctx, c, 5);
      circ(ctx, 10, -80, 7); ol(ctx, c, 4); break;
    case 'kufi':
      if (back) return;
      ctx.beginPath(); ctx.moveTo(-56, -30); ctx.bezierCurveTo(-58, -88, 58, -88, 56, -30); ctx.closePath(); ol(ctx, c, 5);
      rr(ctx, -62, -40, 124, 18, 9); ol(ctx, shade(c, -0.12), 4.5); break;
    case 'hair':
      if (back) return;
      ctx.beginPath(); ctx.moveTo(-62, -10); ctx.bezierCurveTo(-70, -80, 50, -100, 64, -14); ctx.quadraticCurveTo(40, -46, 10, -40); ctx.quadraticCurveTo(-20, -56, -62, -10); ol(ctx, c, 5); break;
    case 'tall':
      if (back) return;
      ctx.beginPath(); ctx.moveTo(-44, -40); ctx.lineTo(-36, -160); ctx.quadraticCurveTo(0, -176, 36, -160); ctx.lineTo(44, -40); ctx.closePath(); ol(ctx, c, 5);
      rr(ctx, -64, -56, 128, 34, 16); ol(ctx, '#f4f1e8', 5); break;
    case 'bork': {
      // yeniçeri börkü: arkaya sarkan "yatırma" + önde altın kaşıklık
      if (back) {
        ctx.beginPath(); ctx.moveTo(10, -150); ctx.bezierCurveTo(80, -150, 96, -60, 84, 40); ctx.lineTo(56, 44); ctx.bezierCurveTo(64, -40, 50, -110, 0, -128); ctx.closePath();
        ol(ctx, shade(c, -0.08), 5); return;
      }
      ctx.beginPath(); ctx.moveTo(-50, -30); ctx.lineTo(-46, -150); ctx.quadraticCurveTo(0, -176, 46, -150); ctx.lineTo(50, -30); ctx.closePath(); ol(ctx, c, 5);
      line(ctx, -20, -150, -22, -50, 3, shade(c, -0.12)); line(ctx, 20, -150, 22, -50, 3, shade(c, -0.12));
      rr(ctx, -58, -44, 116, 20, 8); ol(ctx, '#e0b13c', 5);
      ctx.beginPath(); ctx.moveTo(-12, -40); ctx.lineTo(-10, -112); ctx.quadraticCurveTo(0, -124, 10, -112); ctx.lineTo(12, -40); ctx.closePath(); ol(ctx, '#e0b13c', 4);
      if (L.plume) { ctx.beginPath(); ctx.moveTo(0, -116); ctx.quadraticCurveTo(-30, -190, 10, -240); ctx.quadraticCurveTo(20, -180, 6, -118); ol(ctx, '#2a2a2a', 3); }
      break;
    }
    case 'kallavi':
      if (back) return;
      rr(ctx, -30, -150, 60, 40, 14); ol(ctx, '#b52f2f', 5);
      ctx.beginPath(); ctx.moveTo(-74, -30); ctx.bezierCurveTo(-90, -110, -60, -136, 0, -134); ctx.bezierCurveTo(60, -136, 90, -110, 74, -30); ctx.quadraticCurveTo(0, -46, -74, -30); ol(ctx, c, 5);
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-70 + i * 6, -40 - i * 22); ctx.quadraticCurveTo(0, -60 - i * 24, 70 - i * 6, -40 - i * 22); ctx.lineWidth = 3; ctx.strokeStyle = col('#d8d2c2'); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-60, -50); ctx.lineTo(50, -120); ctx.lineWidth = 9; ctx.strokeStyle = col('#e3b448'); ctx.stroke(); break;
    case 'kavuk': {
      if (back) return;
      ctx.beginPath(); ctx.moveTo(-82, -30); ctx.bezierCurveTo(-104, -150, -50, -176, 0, -172); ctx.bezierCurveTo(50, -176, 104, -150, 82, -30); ctx.quadraticCurveTo(0, -48, -82, -30); ol(ctx, c, 5);
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-80 + i * 4, -42 - i * 24); ctx.bezierCurveTo(-30, -20 - i * 30, 30, -70 - i * 22, 80 - i * 6, -50 - i * 22); ctx.lineWidth = 3; ctx.strokeStyle = col('#ddd6c6'); ctx.stroke(); }
      ell(ctx, 0, -160, 30, 14); ol(ctx, '#b3242c', 4);
      // sorguç
      const sw = Math.sin(t * 2.4) * 0.06;
      ctx.save(); ctx.translate(0, -96); ctx.rotate(sw);
      for (const [dx, h, cc] of [[-10, 150, '#ffffff'], [6, 170, '#f4f1e8'], [20, 130, '#1e1e1e']]) {
        ctx.beginPath(); ctx.moveTo(dx - 6, 0); ctx.quadraticCurveTo(dx - 20, -h * 0.6, dx + 4, -h); ctx.quadraticCurveTo(dx + 14, -h * 0.5, dx + 6, 0); ol(ctx, cc, 3.5);
      }
      ctx.restore();
      ell(ctx, 0, -92, 16, 20); ol(ctx, '#f0c24e', 4); ell(ctx, 0, -92, 8, 11); ol(ctx, '#d11f3a', 3);
      break;
    }
  }
}

// ── poz (aksiyona göre) ──
function pose(act, t, seed) {
  const P = { bob: Math.sin(t * 2.2 + seed) * 2.5, dx: 0, legL: 0, legR: 0,
    armL: { a: 0.18 + Math.sin(t * 1.7 + seed) * 0.04, b: -0.15 }, armR: { a: 0.18 + Math.sin(t * 1.7 + seed + 1) * 0.04, b: -0.15 },
    lean: 0, propRot: 0.5, hand: 'R' };
  switch (act) {
    case 'walk': case 'march': {
      const sp = act === 'march' ? 6.5 : 7.5, ph = t * sp + seed;
      const amp = act === 'march' ? 0.5 : 0.42;
      P.legL = Math.sin(ph) * amp; P.legR = -Math.sin(ph) * amp;
      P.bob = -Math.abs(Math.sin(ph)) * 7;
      P.armL.a = 0.15 - Math.sin(ph) * 0.35; P.armR.a = 0.15 + Math.sin(ph) * 0.35; break;
    }
    case 'charge': {
      const ph = t * 11 + seed;
      P.legL = Math.sin(ph) * 0.6; P.legR = -Math.sin(ph) * 0.6; P.bob = -Math.abs(Math.sin(ph)) * 10; P.lean = 0.12;
      P.armR = { a: 2.5 + Math.sin(ph) * 0.2, b: 0.2 }; P.armL = { a: 0.9 + Math.sin(ph) * 0.3, b: 0.3 }; P.propRot = 0.2; break;
    }
    case 'shake':
      P.dx = noise1(t * 30 + seed * 9) * 3.5; P.bob = noise1(t * 26 + seed) * 2;
      P.armL = { a: 0.55, b: 1.3 }; P.armR = { a: 0.55, b: 1.3 }; P.propRot = 0.9; break;
    case 'jump': {
      const k = Math.abs(Math.sin(t * 5.5));
      P.bob = -k * 38; P.armL = { a: 2.6, b: 0.2 }; P.armR = { a: 2.6, b: 0.2 }; P.legL = -0.15 * k; P.legR = 0.15 * k; break;
    }
    case 'cheer': {
      const k = Math.abs(Math.sin(t * 4.5 + seed));
      P.bob = -k * 18; P.armL = { a: 2.7 + Math.sin(t * 9 + seed) * 0.15, b: 0.1 }; P.armR = { a: 2.7 - Math.sin(t * 9 + seed) * 0.15, b: 0.1 }; P.propRot = 0.1; break;
    }
    case 'wave':
      P.armR = { a: 2.5, b: 0.5 + Math.sin(t * 8) * 0.45 }; break;
    case 'stir': {
      const ph = t * 3.2;
      P.armR = { a: 0.95 + Math.sin(ph) * 0.18, b: 0.35 + Math.cos(ph) * 0.25 }; P.propRot = 2.2 + Math.sin(ph) * 0.15;
      P.armL = { a: 0.2, b: 0.6 }; break;
    }
    case 'dig': {
      const ph = (t * 1.1 + seed) % 1;
      const k = ph < 0.6 ? ease.inOut(ph / 0.6) : 1 - ease.in((ph - 0.6) / 0.4);
      P.armR = { a: 1.4 + k * 1.3, b: 0.3 }; P.armL = { a: -0.2 + k * 1.9, b: 0.5 }; P.propRot = -0.4 + k * 0.9 + 1.2;
      P.bob = (1 - k) * 6; P.lean = 0.06 * (1 - k); break;
    }
    case 'row': case 'pull': {
      const ph = t * (act === 'row' ? 2.4 : 1.8) + seed;
      const k = (Math.sin(ph) + 1) / 2;
      P.lean = act === 'pull' ? -0.12 - k * 0.06 : -0.08 + k * 0.16;
      P.armR = { a: 1.1 - k * 0.5, b: 0.7 - k * 0.5 }; P.armL = { a: 1.1 - k * 0.5, b: 0.7 - k * 0.5 };
      P.propRot = act === 'row' ? -0.62 + k * 0.25 : 0; P.bob = k * 4; break;
    }
    case 'ears':
      P.armL = { a: 2.0, b: 1.35 }; P.armR = { a: 2.0, b: 1.35 }; P.dx = noise1(t * 20) * 1.5; break;
    case 'show':
      P.armR = { a: 1.3, b: 0.5 }; P.propRot = 0.4; break;
    case 'whip': {
      const ph = (t * 1.3) % 1;
      P.armR = { a: 2.2 - Math.sin(ph * Math.PI) * 1.4, b: 0.4 }; P.propRot = 0.3 + Math.sin(ph * Math.PI) * 1.5; break;
    }
    case 'eat': {
      const k = Math.max(0, Math.sin(t * 2.5));
      P.armR = { a: 0.6 + k * 0.6, b: 1.2 + k * 1.0 }; P.armL = { a: -0.2, b: 1.3 }; break;
    }
    case 'pour':
      P.armR = { a: 1.45, b: 0.55 + Math.sin(t * 1.5) * 0.08 }; P.armL = { a: 1.0, b: 0.9 }; P.propRot = 2.3; break;
    case 'climb': {
      const ph = t * 4 + seed;
      P.armL = { a: 2.6 + Math.sin(ph) * 0.3, b: 0 }; P.armR = { a: 2.6 - Math.sin(ph) * 0.3, b: 0 };
      P.legL = Math.sin(ph) * 0.3; P.legR = -Math.sin(ph) * 0.3; P.bob = Math.sin(ph * 2) * 3; P.propRot = 0.1; break;
    }
    case 'drum': {
      const ph = t * 6.2;
      P.armR = { a: 0.9 + Math.max(0, Math.sin(ph)) * 0.8, b: 1.0 }; P.armL = { a: 0.9 + Math.max(0, -Math.sin(ph)) * 0.8, b: 1.0 }; P.bob = Math.abs(Math.sin(ph)) * 2; break;
    }
    case 'farm': {
      const ph = (t * 0.9 + seed) % 1;
      const k = ph < 0.55 ? ease.inOut(ph / 0.55) : 1 - ease.in((ph - 0.55) / 0.45);
      P.armR = { a: 0.8 + k * 1.4, b: 0.3 }; P.armL = { a: 0.2 + k * 1.2, b: 0.5 }; P.propRot = 1.8 + k * 0.6; P.lean = 0.08; break;
    }
    case 'write': {
      P.armR = { a: 0.95 + Math.sin(t * 7) * 0.05, b: 0.6 + Math.sin(t * 5) * 0.08 }; P.armL = { a: 0.7, b: 0.8 }; P.lookY = 0.8; break;
    }
    case 'point':
      P.armR = { a: 1.6, b: 0 }; break;
    case 'scout':
      P.armR = { a: 2.3, b: 1.75 }; P.lookX = 1; P.armL = { a: 0.5, b: 0.6 }; break;
  }
  return P;
}

function legs(ctx, L, P, o) {
  const pants = L.pants || '#5c4a3a';
  for (const [sd, ang] of [[-1, P.legL], [1, P.legR]]) {
    ctx.save(); ctx.translate(sd * 22, -72); ctx.rotate(ang);
    rr(ctx, -15, -4, 30, 66, 13); ol(ctx, pants, 5);
    if (L.boots) { rr(ctx, -16, 34, 32, 34, 10); ol(ctx, L.boots, 5); ell(ctx, sd * 8, 66, 22, 11); ol(ctx, L.boots, 5); }
    else { ell(ctx, sd * 6, 66, 19, 10); ol(ctx, L.skin || SKIN, 5); }
    ctx.restore();
  }
}

function torso(ctx, L, o, t) {
  const c = L.top, tr = L.trim || shade(c, -0.2);
  const coat = L.coat || 'tunic';
  const long = coat === 'coat' || coat === 'kaftan';
  const hem = long ? -16 : -64;
  const bw = long ? 74 : 60;
  if (L.cape && !T.sil) {
    ctx.beginPath(); ctx.moveTo(-44, -168); ctx.quadraticCurveTo(-96, -60, -84, -8); ctx.lineTo(84, -8); ctx.quadraticCurveTo(96, -60, 44, -168); ctx.closePath(); ol(ctx, shade(L.cape, -0.15), 5);
  }
  ctx.beginPath();
  ctx.moveTo(-44, -172); ctx.quadraticCurveTo(-50, -120, -bw, hem);
  ctx.quadraticCurveTo(0, hem + 10, bw, hem);
  ctx.quadraticCurveTo(50, -120, 44, -172);
  ctx.quadraticCurveTo(0, -182, -44, -172); ctx.closePath();
  ol(ctx, c, 5.5);
  if (T.sil) return;
  ctx.save(); ctx.clip();
  // gölge şerit
  ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(18, -190, 70, 200);
  if (coat === 'mail' || coat === 'scale') {
    ctx.fillStyle = col(shade(c, -0.25));
    for (let y = -165; y < hem; y += 11) for (let x = -80 + ((y / 11) % 2) * 6; x < 80; x += 12) { ctx.beginPath(); ctx.arc(x, y, coat === 'scale' ? 5 : 3, 0, Math.PI); ctx.fill(); }
  }
  if (coat === 'plate') { ctx.fillStyle = 'rgba(255,255,255,0.45)'; ell(ctx, -16, -128, 12, 34, 0.15); ctx.fill(); }
  if (L.pattern) { ctx.fillStyle = col(shade(L.trim, -0.05)); for (let y = -160; y < hem; y += 34) for (let x = -70 + ((y / 34) % 2) * 17; x < 80; x += 34) { ell(ctx, x, y, 7, 9); ctx.fill(); } }
  if (L.patches) {
    rr(ctx, -40, -110, 26, 24, 4); ol(ctx, '#a9875c', 3); rr(ctx, 16, -150, 22, 20, 4); ol(ctx, '#6e5a3e', 3);
    ctx.beginPath(); ctx.moveTo(-60, hem); for (let i = 0; i < 8; i++) ctx.lineTo(-60 + i * 17, hem - (i % 2) * 10); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
  }
  ctx.restore();
  if (long) {
    // önden açık dolama/kaftan
    ctx.beginPath(); ctx.moveTo(-10, -176); ctx.lineTo(-16, hem + 4); ctx.lineTo(16, hem + 4); ctx.lineTo(10, -176); ctx.closePath();
    ol(ctx, coat === 'kaftan' ? shade(c, 0.25) : (L.pants || shade(c, 0.2)), 4);
    line(ctx, -12, -174, -18, hem + 2, 7, tr); line(ctx, 12, -174, 18, hem + 2, 7, tr);
    if (L.fur) { ctx.beginPath(); ctx.moveTo(-46, -176); ctx.quadraticCurveTo(-30, -130, -14, -120); ctx.lineTo(14, -120); ctx.quadraticCurveTo(30, -130, 46, -176); ctx.quadraticCurveTo(0, -150, -46, -176); ol(ctx, L.fur, 4); }
  }
  if (L.apron) { ctx.beginPath(); ctx.moveTo(-36, -112); ctx.lineTo(36, -112); ctx.lineTo(44, hem + (long ? -30 : 4)); ctx.quadraticCurveTo(0, hem + 10, -44, hem + (long ? -30 : 4)); ctx.closePath(); ol(ctx, L.apron, 4.5); }
  // kuşak
  rr(ctx, -54, -118, 108, 20, 8); ol(ctx, L.belt || '#7a5a3a', 4.5);
  if (L.coat === 'kaftan' || L.coat === 'coat') { ell(ctx, 30, -100, 10, 16, 0.3); ol(ctx, L.belt, 3.5); }
}

function arm(ctx, L, sd, A, sleeve, fn) {
  const sx = sd * 42, sy = -160;
  const d1 = [sd * Math.sin(A.a), Math.cos(A.a)];
  const ex = sx + d1[0] * 44, ey = sy + d1[1] * 44;
  const a2 = A.a + A.b;
  const d2 = [sd * Math.sin(a2), Math.cos(a2)];
  const hx = ex + d2[0] * 44, hy = ey + d2[1] * 44;
  tube(ctx, [[sx, sy], [ex, ey], [hx, hy]], 24, sleeve, 5);
  if (fn) fn(hx, hy, a2);
  circ(ctx, hx, hy, 14); ol(ctx, L.skin || SKIN, 5);
  return [hx, hy];
}

// Ana fonksiyon
function drawPerson(ctx, o, t) {
  const L = typeof o.look === 'string' ? LOOKS[o.look] : o.look;
  if (!L) throw new Error('Bilinmeyen görünüm: ' + o.look);
  const seed = o.seed ?? hash((o.x || 0) * 0.13 + (o.y || 0) * 0.07) * 10;
  const P = pose(o.act || 'idle', t, seed);
  let s = o.s || 1;
  if (L.child) s *= 0.78;
  ctx.save();
  ctx.translate((o.x || 0) + P.dx * s, (o.y || 0));
  if (o.rot) ctx.rotate(o.rot);
  ctx.scale(s * (o.flip ? -1 : 1), s);
  if (o.alpha != null) ctx.globalAlpha *= clamp(o.alpha);
  // gölge
  if (!o.noLegs && !o.noShadow && !T.sil) { ell(ctx, 0, 4, 78, 13); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fill(); }
  ctx.translate(0, P.bob);
  ctx.rotate(P.lean);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const so = { ...o, seed, lookY: o.lookY ?? P.lookY, lookX: o.lookX ?? o.lookAt ?? 0 };
  const prop = o.prop === undefined ? L.prop : o.prop;
  const headY = -236;
  // arka katman
  ctx.save(); ctx.translate(0, headY); hat(ctx, L, so, t, true); ctx.restore();
  if (L.quiver && !T.sil) { ctx.save(); ctx.translate(-50, -150); ctx.rotate(-0.4); rr(ctx, -14, -60, 28, 100, 8); ol(ctx, '#7a4a24', 4.5); for (let i = 0; i < 3; i++) line(ctx, -6 + i * 6, -60, -6 + i * 6, -90, 3, '#d9c7a0'); ctx.restore(); }
  if (prop === 'bundle') drawProp(ctx, 'bundle', 30, -175, -0.5, t);
  if (!o.noLegs) {
    if (o.act === 'sit') { ell(ctx, 0, -28, 92, 30); ol(ctx, L.pants || '#5c4a3a', 5); }
    else legs(ctx, L, P, o);
  }
  if (o.act === 'sit') ctx.translate(0, 38);
  torso(ctx, L, o, t);
  const sleeve = L.coat === 'kaftan' ? L.top : (L.coat === 'mail' || L.coat === 'plate' || L.coat === 'scale') ? shade(L.top, -0.1) : shade(L.top, -0.06);
  // kafa
  ctx.save(); ctx.translate(0, headY);
  face(ctx, L, so, t);
  hat(ctx, L, so, t, false);
  ctx.restore();
  // özel taşınan eşyalar
  if (prop === 'davul') { ell(ctx, 0, -100, 70, 44); ol(ctx, '#c48a3c', 5); ell(ctx, 0, -100, 56, 32); ol(ctx, '#efe2c4', 4); line(ctx, -40, -150, 40, -150, 4, '#7a2a22'); }
  if (prop === 'basket') { ctx.save(); ctx.translate(0, -110); rr(ctx, -62, -30, 124, 66, 16); ol(ctx, '#b88a4a', 5); for (let i = 0; i < 4; i++) line(ctx, -52, -14 + i * 14, 52, -14 + i * 14, 3, '#8a6430'); ell(ctx, 0, -32, 56, 14); ol(ctx, '#6b4a2a', 4); ctx.restore(); }
  // kollar + eşya
  const handsAt = {};
  const twoHand = prop === 'basket' || prop === 'oar' || prop === 'rope' || prop === 'pickaxe' || prop === 'hoe';
  handsAt.L = arm(ctx, L, -1, prop === 'basket' ? { a: -0.5, b: -0.3 } : P.armL, sleeve,
    prop === 'bow' ? (hx, hy) => drawProp(ctx, 'bow', hx, hy, 0.15, t) :
      prop === 'buckets' ? (hx, hy) => drawProp(ctx, 'bucket', hx, hy, 0, t) : null);
  const rightFn = (hx, hy, a2) => {
    if (!prop || prop === 'bow' || prop === 'basket' || prop === 'davul' || prop === 'bundle') {
      if (prop === 'davul') drawProp(ctx, 'stick', hx, hy, 0.8, t);
      return;
    }
    if (prop === 'buckets') { drawProp(ctx, 'bucket', hx, hy, 0, t); return; }
    drawProp(ctx, prop, hx, hy, P.propRot, t, o);
  };
  handsAt.R = arm(ctx, L, 1, prop === 'basket' ? { a: -0.5, b: -0.3 } : P.armR, sleeve, rightFn);
  if (prop === 'davul') { const [lx, ly] = handsAt.L; drawProp(ctx, 'stick', lx, ly, -0.8, t); circ(ctx, lx, ly, 14); ol(ctx, L.skin || SKIN, 5); }
  ctx.restore();
  return handsAt;
}

// ── eşyalar (sap elde, yukarı doğru uzanır; rot = radyan) ──
function drawProp(ctx, name, x, y, rot, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  switch (name) {
    case 'sword': case 'rustysword': {
      const bl = name === 'rustysword' ? '#a8784a' : '#dfe4ea';
      ctx.beginPath(); ctx.moveTo(-7, -22); ctx.quadraticCurveTo(-4, -110, 26, -170); ctx.quadraticCurveTo(14, -100, 9, -22); ctx.closePath(); ol(ctx, bl, 4.5);
      if (name === 'rustysword') { ctx.fillStyle = col('#7a4a28'); [[0, -60], [6, -100], [12, -130]].forEach(([a, b]) => { circ(ctx, a, b, 5); ctx.fill(); }); }
      else { line(ctx, 0, -30, 12, -140, 2.5, '#ffffff'); }
      rr(ctx, -24, -28, 48, 10, 4); ol(ctx, '#d4a32c', 4);
      rr(ctx, -6, -20, 12, 34, 5); ol(ctx, '#5a3a22', 4); break;
    }
    case 'club':
      ctx.beginPath(); ctx.moveTo(-6, 16); ctx.lineTo(-12, -100); ctx.quadraticCurveTo(0, -128, 14, -100); ctx.lineTo(6, 16); ctx.closePath(); ol(ctx, '#8a5a32', 4.5);
      line(ctx, -4, -60, 6, -66, 3, '#5e3a1e'); line(ctx, -6, -86, 4, -92, 3, '#5e3a1e'); break;
    case 'ladle':
      tube(ctx, [[0, 20], [0, -130]], 9, '#b07a3c', 4); ell(ctx, 0, -146, 24, 16); ol(ctx, '#9aa1a8', 4); break;
    case 'pickaxe':
      tube(ctx, [[0, 30], [0, -120]], 11, '#8a5a32', 4);
      ctx.beginPath(); ctx.moveTo(-70, -96); ctx.quadraticCurveTo(0, -150, 70, -96); ctx.quadraticCurveTo(0, -128, -70, -96); ol(ctx, '#8d949b', 4.5); break;
    case 'hoe':
      tube(ctx, [[0, 30], [0, -140]], 10, '#8a5a32', 4);
      poly(ctx, [[-4, -140], [-50, -128], [-50, -110], [-4, -126]]); ol(ctx, '#8d949b', 4); break;
    case 'oar':
      tube(ctx, [[0, -120], [0, 240]], 12, '#9a6a3a', 4); ell(ctx, 0, 250, 20, 50); ol(ctx, '#9a6a3a', 4); break;
    case 'torch': {
      tube(ctx, [[0, 20], [0, -70]], 11, '#6b4224', 4);
      const f = 1 + Math.sin(t * 20) * 0.08 + noise1(t * 9) * 0.1;
      ctx.beginPath(); ctx.moveTo(-16, -72); ctx.quadraticCurveTo(-20 * f, -110 * f, 0, -140 * f); ctx.quadraticCurveTo(20 * f, -110 * f, 16, -72); ctx.closePath(); ol(ctx, '#ff9a2e', 3);
      ctx.beginPath(); ctx.moveTo(-8, -74); ctx.quadraticCurveTo(-8, -100, 0, -116 * f); ctx.quadraticCurveTo(8, -100, 8, -74); ctx.fillStyle = '#ffe27a'; ctx.fill();
      glow(ctx, 0, -100, 120, '#ff9a2e', 0.35); break;
    }
    case 'jug': {
      ctx.rotate(-rot + 2.0); // gövde eğik
      ctx.beginPath(); ctx.moveTo(-26, 30); ctx.quadraticCurveTo(-40, -10, -16, -40); ctx.lineTo(-10, -58); ctx.lineTo(10, -58); ctx.lineTo(16, -40); ctx.quadraticCurveTo(40, -10, 26, 30); ctx.closePath(); ol(ctx, '#b5653a', 4.5);
      ctx.restore(); ctx.save(); ctx.translate(x, y);
      // yağ akışı
      const k = (t * 3) % 1;
      ctx.beginPath(); ctx.moveTo(48, -30); ctx.quadraticCurveTo(80, 10, 86, 90); ctx.lineWidth = 8 + Math.sin(t * 10) * 1.5; ctx.strokeStyle = col('#d9a520'); ctx.globalAlpha = 0.85; ctx.stroke();
      circ(ctx, 86, 90 + k * 20, 6); ctx.fillStyle = col('#e8b830'); ctx.fill(); break;
    }
    case 'whip': {
      tube(ctx, [[0, 14], [0, -46]], 10, '#5a3a22', 4);
      ctx.beginPath(); ctx.moveTo(0, -46);
      for (let i = 1; i <= 10; i++) ctx.lineTo(Math.sin(i * 0.8 + t * 9) * i * 3.5, -46 - i * 16);
      ctx.lineWidth = 4; ctx.strokeStyle = col('#3a2616'); ctx.stroke(); break;
    }
    case 'lance': {
      tube(ctx, [[0, 120], [0, -330]], 10, '#9a6a3a', 4);
      poly(ctx, [[-10, -330], [0, -372], [10, -330]]); ol(ctx, '#dfe4ea', 4);
      const w = Math.sin(t * 6) * 8;
      ctx.beginPath(); ctx.moveTo(4, -322); ctx.quadraticCurveTo(50, -312 + w, 96, -300 + w * 1.5); ctx.lineTo(4, -280); ctx.closePath(); ol(ctx, '#c0392b', 4); break;
    }
    case 'spear':
      tube(ctx, [[0, 80], [0, -220]], 9, '#9a6a3a', 4);
      poly(ctx, [[-11, -218], [0, -262], [11, -218]]); ol(ctx, '#dfe4ea', 4); break;
    case 'bow':
      ctx.beginPath(); ctx.moveTo(0, -110); ctx.bezierCurveTo(-60, -80, -60, 80, 0, 110); ctx.lineWidth = 11; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = col('#8a5a2b'); ctx.stroke();
      line(ctx, 0, -110, 0, 110, 2, '#efe7d2'); break;
    case 'flag': {
      tube(ctx, [[0, 40], [0, -300]], 10, '#8a5a32', 4);
      circ(ctx, 0, -306, 10); ol(ctx, '#e0b13c', 4);
      ctx.beginPath(); ctx.moveTo(4, -296);
      for (let i = 0; i <= 8; i++) ctx.lineTo(4 + i * 18, -296 + Math.sin(i * 0.8 - t * 7) * 8);
      for (let i = 8; i >= 0; i--) ctx.lineTo(4 + i * 18, -200 + Math.sin(i * 0.8 - t * 7) * 8);
      ctx.closePath(); ol(ctx, '#c0272d', 4); break;
    }
    case 'rope':
      ctx.rotate(-rot);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-200, -30, -900, -160); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = col('#c9a46a'); ctx.stroke(); break;
    case 'bucket':
      line(ctx, 0, 0, 0, 26, 3);
      ctx.beginPath(); ctx.moveTo(-26, 26); ctx.lineTo(26, 26); ctx.lineTo(20, 76); ctx.lineTo(-20, 76); ctx.closePath(); ol(ctx, '#8a6a42', 4.5);
      ell(ctx, 0, 28, 24, 6); ol(ctx, '#6fb4d6', 3); break;
    case 'bowl':
      ctx.rotate(-rot);
      ell(ctx, 0, -6, 34, 12); ol(ctx, '#e8d9b5', 4); ctx.beginPath(); ctx.moveTo(-34, -6); ctx.quadraticCurveTo(0, 40, 34, -6); ol(ctx, '#a0663a', 4.5); break;
    case 'stick':
      tube(ctx, [[0, 10], [0, -70]], 7, '#8a5a32', 3); circ(ctx, 0, -74, 8); ol(ctx, '#efe2c4', 3); break;
    case 'bundle':
      tube(ctx, [[-60, 60], [70, -60]], 8, '#8a5a32', 4);
      ell(ctx, 76, -40, 40, 34); ol(ctx, '#c9a46a', 5); line(ctx, 60, -66, 86, -58, 3, '#8a6a42'); break;
  }
  ctx.restore();
}

module.exports = { LOOKS, drawPerson, drawProp, SKIN };
