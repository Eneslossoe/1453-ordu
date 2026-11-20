// Sahne bağlamı (g): senaryodaki draw(g) fonksiyonlarının kullandığı API.
const C = require('./core');
const { W, H, clamp, lerp, ease, appear, noise1, rgba, setTint, tintAmount, T } = C;
const { BG, timeInfo } = require('./bg');
const TH = require('./things');
const { drawPerson } = require('./person');
const { FX } = require('./fx');
const UI = require('./ui');

function makeStage(ctx, tl, t, env) {
  const d = tl.end - tl.start;
  const lines = tl.lines;
  let li = 0;
  for (let i = 0; i < lines.length; i++) if (t >= lines[i].start - 0.05) li = i;
  const cam = { x0: 960, y0: 540, z0: 1.0, x1: 960, y1: 540, z1: 1.045 };
  let shake = 0;
  const g = { ctx, t, d, p: clamp(t / d), li, lines, env };
  g.L = (i) => (lines.length ? lines[Math.min(i, lines.length - 1)].start : 0);
  g.Le = (i) => (lines.length ? lines[Math.min(i, lines.length - 1)].end : d);
  g.lt = t - g.L(li);

  const camAt = () => {
    const k = ease.inOut(g.p);
    return [lerp(cam.x0, cam.x1, k), lerp(cam.y0, cam.y1, k), lerp(cam.z0, cam.z1, k)];
  };
  const applyCam = () => {
    const [cx, cy, z] = camAt();
    const sx = shake ? noise1(t * 40) * shake : 0, sy = shake ? noise1(t * 40 + 9) * shake : 0;
    ctx.translate(960 + sx, 540 + sy); ctx.scale(z, z); ctx.translate(-cx, -cy);
  };
  const toScreen = (x, y) => { const [cx, cy, z] = camAt(); return [960 + (x - cx) * z, 540 + (y - cy) * z]; };
  const world = (fn) => { ctx.save(); applyCam(); fn(); ctx.restore(); };
  const screen = (fn) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); fn(); ctx.restore(); };

  g.cam = (x0, y0, z0, x1, y1, z1) => Object.assign(cam, { x0, y0, z0, x1, y1, z1 });
  g.shake = (a) => { shake = a; };
  g.bg = (name, o = {}) => {
    world(() => { const ti = timeInfo(o); g.ti = ti; BG[name](ctx, o, t, ti, env); });
    tintAmount(0.55);
  };
  g.person = (o) => {
    let x = o.x, s = o.s || 1, act = o.act, flip = o.flip;
    if (o.walk) {
      const [x0, x1, t0, t1] = o.walk;
      const k = clamp((t - t0) / Math.max(0.01, t1 - t0));
      x = lerp(x0, x1, k);
      if (flip == null) flip = x1 < x0;
      if (k >= 1 && act === 'walk') act = 'idle';
    }
    if (o.enter === 'pop') { const k = appear(t, o.at || 0, 0.4); if (k <= 0) return; s *= ease.back(k); }
    if (o.enter === 'slide') { const k = ease.out(appear(t, o.at || 0, 0.5)); x = lerp(2300, x, k); }
    world(() => {
      if (o.clipBelow != null) { ctx.beginPath(); ctx.rect(-2000, -2000, 6000, o.clipBelow + 2000); ctx.clip(); }
      drawPerson(ctx, { ...o, x, s, act, flip }, t);
    });
  };
  g.parapet = (y) => world(() => {
    const BGm = require('./bg');
    BGm.stoneWall(ctx, -560, y, 2480, 1200, '#cdbb9b');
    BGm.merlons(ctx, -560, 2480, y, '#cdbb9b', 40);
  });
  g.crowd = (o) => world(() => TH.crowd(ctx, o, t));
  g.horse = (x, y, s, o = {}) => world(() => TH.horse(ctx, x, y, s, o, t));
  g.ship = (x, y, s, o = {}) => world(() => TH.ship(ctx, x, y, s, o, t));
  g.carrack = (x, y, s) => world(() => TH.carrack(ctx, x, y, s, t));
  g.cannon = (x, y, s, o = {}) => world(() => TH.cannon(ctx, x, y, s, o, t, t));
  g.kazan = (x, y, s, o = {}) => world(() => TH.kazan(ctx, x, y, s, o, t));
  g.campfires = (list, s = 1) => world(() => list.forEach(([x, y]) => TH.campfire(ctx, x, y, s, t)));
  g.tray = (x, y) => world(() => TH.tray(ctx, x, y, t));
  g.fish = (x, y, o = {}) => { const k = appear(t, o.at || 0, 0.4); if (k > 0) world(() => TH.fish(ctx, x, y, ease.back(k), t)); };
  g.scroll = (x, y, title, o = {}) => { const k = appear(t, o.at || 0, 0.4); if (k > 0) world(() => TH.scroll(ctx, x, y, title, ease.back(k), t)); };
  g.planTable = (x, y) => world(() => TH.planTable(ctx, x, y, t));
  g.emptyPurse = (x, y, o = {}) => { const k = appear(t, o.at || 0, 0.4); if (k > 0) world(() => TH.emptyPurse(ctx, x, y, ease.back(k), t)); };
  g.boatRail = () => world(() => TH.boatRail(ctx));
  g.convoy = (tt) => world(() => TH.convoy(ctx, tt));
  g.landShip = (tt) => world(() => TH.landShip(ctx, t, tt));
  g.lantern = (x, y, o = {}) => {
    world(() => TH.lanternLamp(ctx, x, y, t));
    const [sx, sy] = toScreen(x, y);
    const fade = o.fade || 0;
    const fl = o.flicker ? 1 + noise1(t * 7) * 0.05 : 1;
    const r = 760 * fl * (1 - fade * 0.8);
    screen(() => {
      const gr = ctx.createRadialGradient(sx, sy, r * 0.12, sx, sy, r);
      gr.addColorStop(0, 'rgba(8,4,2,0)'); gr.addColorStop(0.55, `rgba(8,4,2,${0.35 + fade * 0.4})`); gr.addColorStop(1, `rgba(8,4,2,${0.93 + fade * 0.07})`);
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
      C.glow(ctx, sx, sy, 300 * (1 - fade), '#ffb44a', 0.35);
    });
  };
  g.darkness = (a) => { if (a > 0) screen(() => { ctx.fillStyle = `rgba(0,0,0,${clamp(a)})`; ctx.fillRect(0, 0, W, H); }); };
  g.dim = (a) => screen(() => { ctx.fillStyle = `rgba(5,5,20,${a})`; ctx.fillRect(0, 0, W, H); });
  g.sepia = (a) => { if (a > 0.01) screen(() => { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(200,150,90,${a})`; ctx.fillRect(0, 0, W, H); }); };
  g.vignette = (c, a) => screen(() => {
    const gr = ctx.createRadialGradient(960, 540, 250, 960, 540, 1150);
    gr.addColorStop(0, rgba(c, 0)); gr.addColorStop(1, rgba(c, a));
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  });
  g.flash = (t0) => { if (t >= t0 && t < t0 + 0.4) screen(() => { ctx.fillStyle = `rgba(255,250,235,${1 - (t - t0) / 0.4})`; ctx.fillRect(0, 0, W, H); }); };
  g.fx = (name, o = {}) => world(() => FX[name](ctx, o, t));
  g.label = (s, x, y, o = {}) => world(() => UI.label(ctx, s, x, y, o, t));
  g.banner = (s, o = {}) => screen(() => UI.banner(ctx, s, o, t));
  g.date = (a, b, o = {}) => screen(() => UI.date(ctx, a, b, o, t));
  g.rankCard = (n, name, tag, look) => screen(() => UI.rankCard(ctx, n, name, tag, look, t, env));
  g.stats = (name, st) => screen(() => UI.stats(ctx, name, st, t));
  g.factList = (x, y, items) => screen(() => UI.factList(ctx, x, y, items, t));
  g.stamp = (s, x, y, o = {}) => screen(() => UI.stamp(ctx, s, x, y, o, t));
  g.clock = (x, y, s, o = {}) => screen(() => UI.clock(ctx, x, y, s, o, t));
  g.warn = (x, y, o = {}) => screen(() => UI.warn(ctx, x, y, o, t));
  g.thought = (x, y, c, o = {}) => {
    if (o.follow) x += lerp(o.follow[0], o.follow[1], g.p) - o.follow[1];
    world(() => UI.thought(ctx, x, y, c, o, t));
  };
  g.subscribe = (x, y, o = {}) => screen(() => UI.subscribe(ctx, x, y, o, t));
  g.crack = (at) => screen(() => UI.crack(ctx, at, t));
  g.bigTitle = (s, x, y, o = {}) => screen(() => UI.bigTitle(ctx, s, x, y, o, t));
  g.dayCounter = (x, y, n) => screen(() => UI.dayCounter(ctx, x, y, n));
  g.ladder = (items) => world(() => UI.ladder(ctx, items, t));
  g.lineup = (ranks, o = {}) => world(() => UI.lineup(ctx, ranks, o, t, g));
  g.endCard = () => screen(() => UI.endCard(ctx, t, env));
  g.split = () => world(() => UI.split(ctx));
  g.regionMap = (o = {}) => world(() => UI.regionMap(ctx, o, t, env));
  g.cityMap = (o = {}) => world(() => UI.cityMap(ctx, o, t, env));
  return g;
}

module.exports = { makeStage };
