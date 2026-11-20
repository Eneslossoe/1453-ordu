// Ortak yardımcılar: matematik, renk/tint, çizim kısayolları.
const W = 1920, H = 1080;
const INK = '#20160e';

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = {
  inOut: (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2),
  out: (k) => 1 - Math.pow(1 - k, 3),
  in: (k) => k * k * k,
  back: (k) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
  elastic: (k) => (k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
};
// 0→1 arası "ortaya çıkış" ilerlemesi
const appear = (t, at, dur = 0.4) => clamp((t - at) / dur);

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function noise1(x) { const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }

// ── renk & tint ──
const hexCache = new Map();
function hex2rgb(h) {
  let v = hexCache.get(h);
  if (v) return v;
  let s = h.replace('#', '');
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  v = [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  hexCache.set(h, v);
  return v;
}
const rgb2hex = (r, g, b) => '#' + [r, g, b].map((x) => Math.round(clamp(x, 0, 255)).toString(16).padStart(2, '0')).join('');
function mix(a, b, k) { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(A[2], B[2], k)); }
const shade = (c, k) => (k > 0 ? mix(c, '#ffffff', k) : mix(c, '#000000', -k));
function rgba(c, a) { const [r, g, b] = hex2rgb(c); return `rgba(${r},${g},${b},${a})`; }

// Global tint (gece/şafak vb.): renkler çizilirken çarpılır.
const T = { mul: [1, 1, 1], amt: 1, sil: null, cache: new Map() };
function setTint(mul, amt = 1) { T.mul = mul; T.amt = amt; T.cache.clear(); }
function tintAmount(a) { if (T.amt !== a) { T.amt = a; T.cache.clear(); } }
function col(c) {
  if (T.sil) return T.sil;
  if (T.mul[0] === 1 && T.mul[1] === 1 && T.mul[2] === 1) return c;
  let v = T.cache.get(c);
  if (v) return v;
  const [r, g, b] = hex2rgb(c);
  const m = T.mul.map((x) => lerp(1, x, T.amt));
  v = rgb2hex(r * m[0], g * m[1], b * m[2]);
  T.cache.set(c, v);
  return v;
}
const TIMES = {
  day: [1, 1, 1], golden: [1.05, 0.93, 0.78], sunrise: [1.0, 0.85, 0.75], dawn: [0.78, 0.66, 0.72],
  predawn: [0.42, 0.42, 0.62], dusk: [0.82, 0.6, 0.62], night: [0.36, 0.4, 0.62], tunnel: [0.75, 0.62, 0.5],
};

// ── çizim kısayolları ──
function ol(ctx, fill, lw = 5, stroke = INK) {
  if (fill) { ctx.fillStyle = col(fill); ctx.fill(); }
  if (lw > 0) { ctx.lineWidth = lw; ctx.strokeStyle = T.sil || stroke; ctx.stroke(); }
}
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, Math.PI * 2); }
function circ(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, Math.abs(r), 0, Math.PI * 2); }
function poly(ctx, pts, close = true) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (close) ctx.closePath();
}
function line(ctx, x0, y0, x1, y1, lw, c = INK, cap = 'round') {
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
  ctx.lineWidth = lw; ctx.strokeStyle = T.sil || col(c); ctx.lineCap = cap; ctx.stroke();
}
// Kalın, kenar çizgili "boru" (kol, sap vb.)
function tube(ctx, pts, w, fill, lw = 5) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (lw > 0) { ctx.lineWidth = w + lw * 2; ctx.strokeStyle = T.sil || INK; ctx.stroke(); }
  ctx.lineWidth = w; ctx.strokeStyle = col(fill); ctx.stroke();
}
function glow(ctx, x, y, r, c, a = 0.6) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(c, a)); g.addColorStop(1, rgba(c, 0));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
function text(ctx, s, x, y, o = {}) {
  ctx.save();
  ctx.font = o.font || '900 48px Nunito';
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = o.base || 'middle';
  if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.lw || 8; ctx.strokeStyle = o.stroke; ctx.strokeText(s, x, y); }
  ctx.fillStyle = o.fill || '#fff';
  ctx.fillText(s, x, y);
  ctx.restore();
}
function fitFont(ctx, s, family, weight, size, maxW) {
  let sz = size;
  ctx.font = `${weight} ${sz}px ${family}`;
  while (ctx.measureText(s).width > maxW && sz > 10) { sz -= 2; ctx.font = `${weight} ${sz}px ${family}`; }
  return sz;
}

module.exports = {
  W, H, INK, clamp, lerp, ease, appear, rng, hash, noise1, hex2rgb, rgb2hex, mix, shade, rgba,
  T, setTint, tintAmount, col, TIMES, ol, rr, ell, circ, poly, line, tube, glow, text, fitFont,
};
