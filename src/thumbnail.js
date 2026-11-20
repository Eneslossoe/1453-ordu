// YouTube kapak görseli (1280x720) — kanalın mevcut kapak düzenine uygun:
// ortada "1453", kırmızı şerit, solda başıbozuk, sağda padişah, şimşek ayırıcı.
const fs = require('fs');
const path = require('path');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const C = require('./lib/core');
const { BG, timeInfo } = require('./lib/bg');
const { drawPerson } = require('./lib/person');
const UI = require('./lib/ui');
const { FX } = require('./lib/fx');

const F = path.join(__dirname, '..', 'assets', 'fonts');
GlobalFonts.registerFromPath(path.join(F, 'Cinzel_900Black.ttf'), 'Cinzel');
GlobalFonts.registerFromPath(path.join(F, 'Nunito_900Black.ttf'), 'Nunito');

const cv = createCanvas(1920, 1080), ctx = cv.getContext('2d');
const env = { createCanvas };
const t = 1.3;

// sol yarı: gece, surlar, yağmur gibi ok yağmuru
ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1010, 0); ctx.lineTo(930, 1080); ctx.lineTo(0, 1080); ctx.clip();
ctx.save(); ctx.translate(960, 540); ctx.scale(1.25, 1.25); ctx.translate(-760, -560);
BG.walls(ctx, { time: 'night', torches: true, defenders: true }, t, timeInfo({ time: 'night' }), env);
C.tintAmount(0.45);
FX.arrows(ctx, { dens: 0.7 }, t);
ctx.restore();
C.setTint([1, 1, 1], 1);
ctx.fillStyle = 'rgba(10,20,50,0.25)'; ctx.fillRect(0, 0, 1010, 1080);
drawPerson(ctx, { look: 'basibozuk', x: 420, y: 1230, s: 2.35, expr: 'scared', prop: 'club', act: 'shake' }, t);
ctx.restore();

// sağ yarı: altın ışık, Ayasofya
ctx.save(); ctx.beginPath(); ctx.moveTo(1010, 0); ctx.lineTo(1920, 0); ctx.lineTo(1920, 1080); ctx.lineTo(930, 1080); ctx.clip();
ctx.save(); ctx.translate(960, 540); ctx.scale(1.1, 1.1); ctx.translate(-1150, -560);
BG.city(ctx, { time: 'golden' }, t, timeInfo({ time: 'golden' }), env);
ctx.restore();
C.setTint([1, 1, 1], 1);
const g = ctx.createRadialGradient(1560, 520, 50, 1560, 520, 900);
g.addColorStop(0, 'rgba(255,220,120,0.55)'); g.addColorStop(1, 'rgba(255,180,60,0)');
ctx.fillStyle = g; ctx.fillRect(900, 0, 1100, 1080);
drawPerson(ctx, { look: 'padisah', x: 1600, y: 1235, s: 2.2, expr: 'smug' }, t);
ctx.restore();

// şimşek ayırıcı
C.poly(ctx, [[1040, -20], [960, 330], [1030, 460], [930, 780], [1000, 880], [950, 1100], [990, 1100], [1050, 880], [975, 780], [1075, 460], [1005, 330], [1080, -20]]);
ctx.fillStyle = '#fff7c2'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#20160e'; ctx.stroke();
C.glow(ctx, 1000, 540, 420, '#fff2a0', 0.35);

// başlık
const tg = ctx.createLinearGradient(0, 40, 0, 260);
tg.addColorStop(0, '#fff2b0'); tg.addColorStop(0.55, '#f0c24e'); tg.addColorStop(1, '#b8862e');
ctx.font = '900 250px Cinzel'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
ctx.lineJoin = 'round'; ctx.lineWidth = 22; ctx.strokeStyle = '#1a0f06'; ctx.strokeText('1453', 980, 165);
ctx.fillStyle = tg; ctx.fillText('1453', 980, 165);
// kırmızı şerit
ctx.save(); ctx.translate(985, 365); ctx.rotate(-0.025);
ctx.font = '900 70px Nunito';
const s = 'OSMANLI ASKERİ OLSAYDIN?';
const w = ctx.measureText(s).width + 90;
C.rr(ctx, -w / 2 + 8, -54, w, 116, 12); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fill();
C.rr(ctx, -w / 2, -62, w, 116, 12); ctx.fillStyle = '#d1222a'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = '#20160e'; ctx.stroke();
C.text(ctx, s, 0, -2, { font: '900 70px Nunito', fill: '#fff', stroke: '#20160e', lw: 10 });
ctx.restore();
// etiketler
UI.label(ctx, 'BAŞIBOZUK', 360, 985, { at: 0, tilt: -5 }, 5);
UI.label(ctx, 'PADİŞAH', 1610, 985, { at: 0, tilt: 5 }, 5);

const out = process.argv[2] || path.join(__dirname, '..', 'output', 'kapak.png');
fs.mkdirSync(path.dirname(out), { recursive: true });
const small = createCanvas(1280, 720);
small.getContext('2d').drawImage(cv, 0, 0, 1280, 720);
fs.writeFileSync(out, small.toBuffer('image/png'));
console.log('kapak:', out);
