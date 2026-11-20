// Parçacık/efektler. t = sahne zamanı (sn).
const C = require('./core');
const { INK, clamp, lerp, ease, appear, rng, hash, noise1, col, mix, shade, rgba, ol, rr, ell, circ, poly, line, glow, text } = C;
const { coin } = require('./things');
const { softPuff } = require('./bg');

const FX = {
  embers(ctx, o, t) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 60; i++) {
      const k = (t * (0.08 + hash(i) * 0.08) + hash(i + 1)) % 1;
      const x = -200 + hash(i + 2) * 2300 + Math.sin(t + i) * 30, y = 1100 - k * 900;
      circ(ctx, x, y, 2 + hash(i + 3) * 3); ctx.fillStyle = `rgba(255,${150 + hash(i) * 80 | 0},60,${(1 - k) * 0.9})`; ctx.fill();
    }
    ctx.restore();
  },
  question(ctx, o, t) {
    for (let i = 0; i < 3; i++) {
      const k = appear(t, o.at + i * 0.25, 0.35);
      if (k <= 0) continue;
      const s = ease.back(k);
      ctx.save(); ctx.translate(o.x + i * 70 - 40, o.y - i * 50 + Math.sin(t * 3 + i) * 8); ctx.rotate(-0.2 + i * 0.2); ctx.scale(s, s);
      text(ctx, '?', 0, 0, { font: '900 110px Nunito', fill: '#ffd23a', stroke: INK, lw: 12 });
      ctx.restore();
    }
  },
  arrows(ctx, o, t) {
    const n = Math.round(26 * (o.dens || 1));
    for (let i = 0; i < n; i++) {
      const sp = 0.7 + hash(i) * 0.5;
      const k = (t * sp + hash(i + 5)) % 1;
      const x = -300 + hash(i + 9) * 2200 + k * 500, y = -100 + k * 1100;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(1100, 500));
      line(ctx, -60, 0, 50, 0, 4, '#5a3a22');
      poly(ctx, [[50, -7], [70, 0], [50, 7]]); ctx.fillStyle = col('#c9ced4'); ctx.fill();
      poly(ctx, [[-60, 0], [-74, -8], [-50, 0], [-74, 8]]); ctx.fillStyle = col('#efe7d2'); ctx.fill();
      ctx.restore();
    }
  },
  stones(ctx, o, t) {
    for (let i = 0; i < 8; i++) {
      const k = (t * (0.5 + hash(i) * 0.3) + hash(i + 2)) % 1;
      const x = 200 + hash(i + 4) * 1500, y = -60 + ease.in(k) * 1100;
      circ(ctx, x, y, 16 + hash(i) * 14); ol(ctx, '#8a847a', 4);
    }
  },
  smoke(ctx, o, t) {
    const n = o.n || 6;
    for (let i = 0; i < n; i++) {
      const k = (t * 0.22 + i / n) % 1;
      const x = o.x + (hash(i) - 0.5) * 300 + k * 120, y = o.y - k * 380;
      softPuff(ctx, x, y, 70 + k * 150, o.dark ? '#1e1919' : '#b4aea8', (o.dark ? 0.7 : 0.4) * (1 - k));
    }
  },
  dust(ctx, o, t) {
    for (let i = 0; i < 10; i++) {
      const k = (t * (o.trail ? 1.6 : 0.9) + i / 10) % 1;
      const x = o.x - (o.trail ? k * 500 : (hash(i) - 0.5) * 120 * k), y = o.y - k * (o.trail ? 60 : 140);
      softPuff(ctx, x, y, 30 + k * 70, '#c8aa78', 0.5 * (1 - k));
    }
  },
  fire(ctx, o, t) {
    const k = appear(t, o.at || 0, 0.6);
    const w = (o.w || 200) * k;
    for (let i = 0; i < 9; i++) {
      const fx = o.x - w / 2 + (i / 8) * w, h = (120 + noise1(t * 6 + i * 2) * 50) * k;
      ctx.beginPath(); ctx.moveTo(fx - 40, o.y); ctx.quadraticCurveTo(fx - 36, o.y - h * 0.6, fx, o.y - h); ctx.quadraticCurveTo(fx + 36, o.y - h * 0.6, fx + 40, o.y); ctx.closePath(); ctx.fillStyle = '#ff7a2a'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(fx - 18, o.y); ctx.quadraticCurveTo(fx - 16, o.y - h * 0.4, fx, o.y - h * 0.6); ctx.quadraticCurveTo(fx + 16, o.y - h * 0.4, fx + 18, o.y); ctx.closePath(); ctx.fillStyle = '#ffe07a'; ctx.fill();
    }
    glow(ctx, o.x, o.y - 80, 420 * k, '#ff7a2a', 0.5);
  },
  knock(ctx, o, t) {
    for (let i = 0; i < 3; i++) {
      const k = (t * 1.4 + i / 3) % 1;
      ctx.beginPath(); ctx.arc(o.x, o.y, 40 + k * 160, Math.PI * 0.7, Math.PI * 1.3); ctx.lineWidth = 8; ctx.strokeStyle = `rgba(255,230,160,${1 - k})`; ctx.stroke();
    }
    const s = 1 + Math.sin(t * 14) * 0.08;
    ctx.save(); ctx.translate(o.x - 60, o.y - 160); ctx.scale(s, s); ctx.rotate(-0.15);
    text(ctx, 'TAK! TAK!', 0, 0, { font: '900 64px Nunito', fill: '#ffe07a', stroke: INK, lw: 10 });
    ctx.restore();
  },
  germs(ctx, o, t) {
    const k = appear(t, o.at || 0, 0.8);
    for (let i = 0; i < 7; i++) {
      const a = t * 0.8 + i * 0.9, r = 230 + Math.sin(t + i) * 40;
      const x = o.x + Math.cos(a) * r, y = o.y + Math.sin(a) * r * 0.55;
      const s = (0.7 + hash(i) * 0.5) * k;
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(t * 2 + i);
      for (let j = 0; j < 8; j++) { const b = j / 8 * Math.PI * 2; line(ctx, Math.cos(b) * 26, Math.sin(b) * 26, Math.cos(b) * 40, Math.sin(b) * 40, 5, '#5aa83a'); circ(ctx, Math.cos(b) * 42, Math.sin(b) * 42, 6); ol(ctx, '#7ac84a', 3); }
      ctx.rotate(-(t * 2 + i));
      circ(ctx, 0, 0, 30); ol(ctx, '#7ac84a', 4);
      circ(ctx, -9, -4, 7); ol(ctx, '#fff', 2.5); circ(ctx, 9, -4, 7); ol(ctx, '#fff', 2.5);
      circ(ctx, -8, -3, 3); ctx.fillStyle = INK; ctx.fill(); circ(ctx, 10, -3, 3); ctx.fill();
      ctx.beginPath(); ctx.arc(0, 8, 9, 0.2, Math.PI - 0.2); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
      ctx.restore();
    }
  },
  splash(ctx, o, t) {
    const k = clamp((t - o.at) / 1.2);
    if (k <= 0 || k >= 1) return;
    for (let i = 0; i < 18; i++) {
      const a = -Math.PI * (0.1 + hash(i) * 0.8), sp = 300 + hash(i + 1) * 400;
      const x = o.x + Math.cos(a) * sp * k, y = o.y + Math.sin(a) * sp * k + 600 * k * k;
      circ(ctx, x, y, 10 * (1 - k) + 4); ctx.fillStyle = 'rgba(210,240,255,0.9)'; ctx.fill();
    }
  },
  coins(ctx, o, t) {
    for (let i = 0; i < 18; i++) {
      const k = (t - (o.at || 0)) * (0.5 + hash(i) * 0.3) - hash(i + 3) * 0.6;
      if (k < 0) continue;
      const kk = k % 1.3;
      coin(ctx, o.x + (hash(i + 5) - 0.5) * 500, o.y + kk * 800, 22, t * 1.3 + i);
    }
  },
  coinflow(ctx, o, t) {
    for (let i = 0; i < 6; i++) {
      const k = ((t - o.at) * 0.6 + i / 6) % 1;
      const x = lerp(o.x0, o.x1, k), y = lerp(o.y0, o.y1, k) - Math.sin(k * Math.PI) * 180;
      coin(ctx, x, y, 20, t + i);
    }
  },
  arrowhit(ctx, o, t) {
    const k = appear(t, o.at, 0.15);
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(2.6);
    line(ctx, 0, 0, 90 * k, 0, 6, '#5a3a22');
    poly(ctx, [[86 * k, -10], [110 * k, 0], [86 * k, 10]]); ctx.fillStyle = col('#efe7d2'); ctx.fill();
    ctx.restore();
    const f = clamp(1 - (t - o.at) / 0.4);
    if (f > 0) { ctx.save(); ctx.translate(o.x, o.y); ctx.scale(1 + (1 - f), 1 + (1 - f)); ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r = i % 2 ? 18 : 46; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fillStyle = `rgba(255,240,140,${f})`; ctx.fill(); ctx.restore(); }
  },
  sparkle(ctx, o, t) {
    for (let i = 0; i < 9; i++) {
      const k = (t * 0.8 + hash(i)) % 1;
      const s = Math.sin(k * Math.PI) * 26;
      const x = o.x + (hash(i + 1) - 0.5) * 600, y = o.y + (hash(i + 2) - 0.5) * 500;
      ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.25, y - s * 0.25); ctx.lineTo(x + s, y); ctx.lineTo(x + s * 0.25, y + s * 0.25); ctx.lineTo(x, y + s); ctx.lineTo(x - s * 0.25, y + s * 0.25); ctx.lineTo(x - s, y); ctx.lineTo(x - s * 0.25, y - s * 0.25); ctx.closePath();
      ctx.fillStyle = '#fff3b0'; ctx.fill();
    }
  },
  sweat() {},
};

module.exports = { FX };
