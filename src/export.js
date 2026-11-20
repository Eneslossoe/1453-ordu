// Senaryodaki sahneleri/cümleleri JSON'a döker (TTS ve ses miksi bunu okur).
const fs = require('fs');
const path = require('path');
const { shots } = require('./script');
const out = shots.map((s) => ({
  id: s.id, kind: s.kind || 'shot', mood: s.mood, seg: s.seg,
  lead: s.lead ?? 0.35, tail: s.tail ?? 0.55, minDur: s.minDur || 0,
  sfx: s.sfx || [], lines: s.lines,
}));
const dir = path.join(__dirname, '..', 'build');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'shots.json'), JSON.stringify(out, null, 1));
const words = out.reduce((a, s) => a + s.lines.reduce((b, l) => b + l.t.split(/\s+/).length, 0), 0);
console.log(`${out.length} sahne, ${out.reduce((a, s) => a + s.lines.length, 0)} cümle, ${words} kelime`);
