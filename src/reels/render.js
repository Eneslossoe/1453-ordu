// Dikey Reels/Shorts render (1080x1920). Ortada dünya sahnesinin 1080x1080 kırpımı,
// üstte rütbe başlığı + ilerleme, altta "hayatta kalma" çubuğu + kelime kelime altyazı.
// Kullanım: node src/reels/render.js --out build/reels/v.mp4 [--from F --to F] | --preview dir --times 0.5,...
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const C = require('../lib/core');
const { makeStage } = require('../lib/stage');
const UI = require('../lib/ui');
const { shots, RANKS } = require('./script');

const ROOT = path.join(__dirname, '..', '..');
const F = path.join(ROOT, 'assets', 'fonts');
GlobalFonts.registerFromPath(path.join(F, 'Cinzel_900Black.ttf'), 'Cinzel');
GlobalFonts.registerFromPath(path.join(F, 'Nunito_900Black.ttf'), 'Nunito');
GlobalFonts.registerFromPath(path.join(F, 'Nunito_800ExtraBold.ttf'), 'NunitoXB');

const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const TL = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'reels', 'timeline.json'), 'utf8'));
const FPS = TL.fps;
const byId = Object.fromEntries(shots.map((s) => [s.id, s]));
const VW = 1080, VH = 1920, PY = 410; // panel üst kenarı
const GOLD = '#f0c24e', INK = C.INK;

const world = createCanvas(1920, 1080), wctx = world.getContext('2d');
const main = createCanvas(VW, VH), ctx = main.getContext('2d');
const env = { createCanvas };

// kelime zamanlamaları
const WORDS = [];
TL.shots.forEach((s) => s.lines.forEach((ln) => {
  const ws = ln.text.split(/\s+/);
  const wt = ws.map((w) => w.length + 1.5), tot = wt.reduce((a, b) => a + b, 0);
  let t = s.start + ln.start; const dur = ln.end - ln.start;
  // ≤20 karakterlik parçalara böl
  let chunk = [], clen = 0;
  const chunks = [];
  ws.forEach((w, i) => {
    const d = (dur * wt[i]) / tot;
    if (chunk.length && clen + w.length + 1 > 20) { chunks.push(chunk); chunk = []; clen = 0; }
    chunk.push({ w, t0: t, t1: t + d }); clen += w.length + 1; t += d;
    if (/[.!?:,]$/.test(w) && clen > 10) { chunks.push(chunk); chunk = []; clen = 0; }
  });
  if (chunk.length) chunks.push(chunk);
  chunks.forEach((c) => WORDS.push({ t0: c[0].t0, t1: c[c.length - 1].t1, words: c }));
}));

function shotAt(tg) { let i = 0; while (i < TL.shots.length - 1 && TL.shots[i + 1].start <= tg + 1e-6) i++; return i; }

function bgFill() {
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, '#0d0a14'); g.addColorStop(0.5, '#1c1628'); g.addColorStop(1, '#0d0a14');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
}

function topPanel(s, t, tg) {
  // şerit
  ctx.save(); ctx.translate(VW / 2, 92); ctx.rotate(-0.02);
  ctx.font = '900 50px Nunito';
  const txt = '1453’TE OSMANLI ASKERİ OLSAYDIN?';
  const w = Math.min(1040, ctx.measureText(txt).width + 70);
  C.rr(ctx, -w / 2, -46, w, 92, 12); ctx.fillStyle = '#d1222a'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  const fs1 = C.fitFont(ctx, txt, 'Nunito', 900, 50, w - 50);
  C.text(ctx, txt, 0, 2, { font: `900 ${fs1}px Nunito`, fill: '#fff', stroke: INK, lw: 8 });
  ctx.restore();
  const k = C.ease.back(C.clamp(t / 0.35));
  if (s.seg >= 1 && s.seg <= 10) {
    const r = RANKS[s.seg];
    ctx.save(); ctx.globalAlpha = C.clamp(t / 0.2);
    C.text(ctx, `RÜTBE ${s.seg}/10`, VW / 2, 192, { font: '900 42px Cinzel', fill: C.rgba(GOLD, 0.9) });
    ctx.translate(VW / 2, 282); ctx.scale(k, k);
    const fs = C.fitFont(ctx, r.name, 'Cinzel', 900, 104, 1000);
    C.text(ctx, r.name, 0, 0, { font: `900 ${fs}px Cinzel`, fill: GOLD, stroke: '#1a0f06', lw: 12 });
    ctx.restore();
    for (let i = 0; i < 10; i++) {
      const x = VW / 2 - 315 + i * 70, on = i < s.seg;
      C.circ(ctx, x, 366, on ? 15 : 11); ctx.fillStyle = on ? GOLD : 'rgba(255,255,255,0.18)'; ctx.fill();
      if (i === s.seg - 1) { C.circ(ctx, x, 366, 24 + Math.sin(tg * 6) * 2); ctx.lineWidth = 4; ctx.strokeStyle = GOLD; ctx.stroke(); }
    }
  } else if (s.seg === 0) {
    ctx.save(); ctx.translate(VW / 2, 265); ctx.scale(k, k);
    const g = ctx.createLinearGradient(0, -80, 0, 80); g.addColorStop(0, '#fff2b0'); g.addColorStop(0.55, GOLD); g.addColorStop(1, '#b8862e');
    ctx.font = '900 170px Cinzel'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = '#1a0f06'; ctx.strokeText('1453', 0, 0); ctx.fillStyle = g; ctx.fillText('1453', 0, 0);
    ctx.restore();
  } else {
    ctx.save(); ctx.translate(VW / 2, 270); ctx.scale(k, k);
    C.text(ctx, 'SEN HANGİSİ', 0, -48, { font: '900 84px Cinzel', fill: GOLD, stroke: '#1a0f06', lw: 10 });
    C.text(ctx, 'OLURDUN?', 0, 50, { font: '900 84px Cinzel', fill: GOLD, stroke: '#1a0f06', lw: 10 });
    ctx.restore();
  }
}

function bottomPanel(s, t, tg) {
  if (s.seg >= 1 && s.seg <= 10) {
    const v = RANKS[s.seg].hayat / 10, k = C.ease.out(C.clamp((t - 0.3) / 0.8));
    C.text(ctx, 'HAYATTA KALMA', 90, 1548, { font: '900 36px Nunito', fill: '#fbf3df', align: 'left' });
    C.text(ctx, `${Math.round(v * 10 * k)}/10`, 990, 1548, { font: '900 40px Nunito', fill: '#fbf3df', align: 'right' });
    C.rr(ctx, 90, 1578, 900, 40, 20); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#fbf3df'; ctx.stroke();
    if (v * k > 0.01) { C.rr(ctx, 95, 1583, 890 * v * k, 30, 15); ctx.fillStyle = C.mix('#d63a2f', '#3aa65a', v); ctx.fill(); }
  }
  // kelime kelime altyazı
  const ch = WORDS.find((c) => tg >= c.t0 - 0.02 && tg < c.t1 + 0.15);
  if (ch) {
    ctx.save();
    ctx.font = '900 80px Nunito';
    const parts = ch.words.map((w) => w.w);
    const sp = ctx.measureText(' ').width;
    const widths = parts.map((p) => ctx.measureText(p).width);
    let total = widths.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
    const sc = Math.min(1, 1000 / total);
    const pop = 1 + 0.08 * (1 - C.clamp((tg - ch.t0) / 0.12));
    ctx.translate(VW / 2, 1716); ctx.scale(sc * pop, sc * pop);
    let x = -total / 2;
    ch.words.forEach((w, i) => {
      const active = tg >= w.t0 && tg < w.t1 + 0.05;
      C.text(ctx, w.w, x + widths[i] / 2, 0, { font: '900 80px Nunito', fill: active ? '#ffd23a' : '#ffffff', stroke: '#0a0705', lw: 14 });
      x += widths[i] + sp;
    });
    ctx.restore();
  }
  // kanal etiketi
  ctx.save(); ctx.globalAlpha = 0.9;
  UI.hourglass(ctx, VW / 2 - 175, 1838, 0.26, tg);
  C.text(ctx, 'ZAMAN KIRIĞI', VW / 2 + 30, 1840, { font: '900 42px Cinzel', fill: GOLD });
  ctx.restore();
}

function renderFrame(f) {
  const tg = f / FPS;
  const i = shotAt(tg), s = TL.shots[i], t = tg - s.start;
  // dünya sahnesi
  wctx.setTransform(1, 0, 0, 1, 0, 0); wctx.globalAlpha = 1; wctx.globalCompositeOperation = 'source-over';
  wctx.fillStyle = '#000'; wctx.fillRect(0, 0, 1920, 1080);
  C.setTint([1, 1, 1], 1); C.T.sil = null;
  byId[s.id].draw(makeStage(wctx, s, t, env));
  // dikey kompozisyon
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  bgFill();
  const z = 1 + 0.07 * (1 - C.ease.out(C.clamp(t / 0.3)));
  const sw = 1080 / z;
  ctx.drawImage(world, 960 - sw / 2, 540 - sw / 2, sw, sw, 0, PY, VW, VW);
  if (t < 0.1 && i > 0) { ctx.fillStyle = `rgba(255,255,255,${0.6 * (1 - t / 0.1)})`; ctx.fillRect(0, PY, VW, VW); }
  C.line(ctx, 0, PY, VW, PY, 5, GOLD, 'butt'); C.line(ctx, 0, PY + VW, VW, PY + VW, 5, GOLD, 'butt');
  topPanel(s, t, tg);
  bottomPanel(s, t, tg);
  const fade = Math.min(C.clamp(tg / 0.25), C.clamp((TL.total - tg) / 0.5));
  if (fade < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - fade})`; ctx.fillRect(0, 0, VW, VH); }
}

async function renderVideo() {
  const from = +arg('from', 0), to = Math.min(+arg('to', TL.frames), TL.frames);
  const out = arg('out', path.join(ROOT, 'build', 'reels', 'video.mp4'));
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${VW}x${VH}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', arg('crf', '20'), '-tune', 'animation', '-pix_fmt', 'yuv420p', '-g', '60', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = from; f < to; f++) {
    renderFrame(f);
    const buf = main.data();
    if (!ff.stdin.write(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength))) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  process.stderr.write(`[${path.basename(out)}] bitti: ${((Date.now() - t0) / 1000).toFixed(0)} sn\n`);
}

function preview() {
  const dir = arg('preview'); fs.mkdirSync(dir, { recursive: true });
  const times = (arg('times', '0.6')).split(',').map(Number);
  TL.shots.forEach((s, i) => times.forEach((a, j) => {
    renderFrame(Math.round((s.start + a * (s.end - s.start)) * FPS));
    fs.writeFileSync(path.join(dir, `${String(i).padStart(2, '0')}_${s.id}_${j}.png`), main.toBuffer('image/png'));
  }));
}

if (arg('preview')) preview(); else renderVideo().catch((e) => { console.error(e); process.exit(1); });
