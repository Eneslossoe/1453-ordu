// Kare kare render: timeline.json + script.js → ham RGBA kareler → ffmpeg (H.264).
// Kullanım:
//   node src/render.js --out build/part0.mp4 --from 0 --to 5000     (kare aralığı)
//   node src/render.js --preview build/preview [--at 0.6] [--only b1,b2]  (her sahneden PNG)
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const C = require('./lib/core');
const { makeStage } = require('./lib/stage');
const UI = require('./lib/ui');
const { shots } = require('./script');

const ROOT = path.join(__dirname, '..');
const F = path.join(ROOT, 'assets', 'fonts');
GlobalFonts.registerFromPath(path.join(F, 'Cinzel_900Black.ttf'), 'Cinzel');
GlobalFonts.registerFromPath(path.join(F, 'Nunito_900Black.ttf'), 'Nunito');
GlobalFonts.registerFromPath(path.join(F, 'Nunito_800ExtraBold.ttf'), 'NunitoXB');

const args = process.argv.slice(2);
const arg = (k, def) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : def; };
const TL = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'timeline.json'), 'utf8'));
const FPS = TL.fps;
const byId = Object.fromEntries(shots.map((s) => [s.id, s]));
const XF = 8; // geçiş (kare)

const env = { createCanvas };
const main = createCanvas(C.W, C.H), ctx = main.getContext('2d');
const off = createCanvas(C.W, C.H), octx = off.getContext('2d');

function drawShot(c, idx, t) {
  const tl = TL.shots[idx];
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  c.fillStyle = '#000'; c.fillRect(0, 0, C.W, C.H);
  C.setTint([1, 1, 1], 1); C.T.sil = null;
  const g = makeStage(c, tl, t, env);
  byId[tl.id].draw(g);
}

function shotAt(tg) {
  let lo = 0, hi = TL.shots.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (TL.shots[m].start <= tg + 1e-6) lo = m; else hi = m - 1; }
  return lo;
}

function renderFrame(f) {
  const tg = f / FPS;
  const i = shotAt(tg);
  const s = TL.shots[i];
  const t = tg - s.start;
  const fIn = Math.round((tg - s.start) * FPS);
  if (i > 0 && fIn < XF) {
    const p = TL.shots[i - 1];
    drawShot(ctx, i - 1, p.end - p.start + t);
    drawShot(octx, i, t);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = C.ease.inOut((fIn + 1) / (XF + 1));
    ctx.drawImage(off, 0, 0);
    ctx.globalAlpha = 1;
  } else drawShot(ctx, i, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // altyazı
  const sub = TL.subs.find((sb) => tg >= sb.start && tg < sb.end + 0.12);
  if (sub && s.kind !== 'card' && s.id !== 'o2') UI.subtitles(ctx, sub.lines, C.clamp(Math.min((tg - sub.start) / 0.12, 1)));
  if (s.kind !== 'card' && !['o2'].includes(s.id)) UI.watermark(ctx, tg);
  // baş/son karartma
  const fade = Math.min(C.clamp(tg / 0.8), C.clamp((TL.total - tg) / 1.2));
  if (fade < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - fade})`; ctx.fillRect(0, 0, C.W, C.H); }
}

async function renderVideo() {
  const from = +arg('from', 0), to = Math.min(+arg('to', TL.frames), TL.frames);
  const out = arg('out', path.join(ROOT, 'build', 'video.mp4'));
  const crf = arg('crf', '20');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${C.W}x${C.H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', arg('preset', 'medium'), '-crf', crf, '-tune', 'animation', '-pix_fmt', 'yuv420p', '-g', '60', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = from; f < to; f++) {
    renderFrame(f);
    const buf = main.data();
    if (!ff.stdin.write(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength))) await new Promise((r) => ff.stdin.once('drain', r));
    if ((f - from) % 300 === 0) process.stderr.write(`[${path.basename(out)}] ${f - from}/${to - from} kare, ${((Date.now() - t0) / 1000).toFixed(0)} sn\n`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  process.stderr.write(`[${path.basename(out)}] bitti: ${((Date.now() - t0) / 1000).toFixed(0)} sn\n`);
}

function preview() {
  const dir = arg('preview');
  fs.mkdirSync(dir, { recursive: true });
  const at = +arg('at', 0.6);
  const only = arg('only') ? arg('only').split(',') : null;
  const times = arg('times') ? arg('times').split(',').map(Number) : null;
  TL.shots.forEach((s, i) => {
    if (only && !only.includes(s.id)) return;
    const fr = times ? times : [at];
    fr.forEach((a, j) => {
      const tg = s.start + (a <= 1 ? a * (s.end - s.start) : a);
      renderFrame(Math.round(tg * FPS));
      fs.writeFileSync(path.join(dir, `${String(i).padStart(2, '0')}_${s.id}${fr.length > 1 ? '_' + j : ''}.png`), main.toBuffer('image/png'));
    });
  });
}

if (arg('preview')) preview();
else renderVideo().catch((e) => { console.error(e); process.exit(1); });
