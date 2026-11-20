// REELS (dikey, ≤60 sn): 1453'te Osmanlı askeri olsaydın? — 10 rütbe, hızlı tempo.
// Sahneler dünya koordinatında çizilir; dikey videoda ortadaki 1080x1080 pencere (x: 420–1500) gösterilir.
const S = [];
const L = (t, s) => ({ t, s: s || t });
const R = {
  1: { name: 'BAŞIBOZUK', hayat: 1 }, 2: { name: 'AŞÇI', hayat: 8 }, 3: { name: 'LAĞIMCI', hayat: 2 }, 4: { name: 'KÜREKÇİ', hayat: 6 },
  5: { name: 'TOPÇU', hayat: 5 }, 6: { name: 'AKINCI', hayat: 6 }, 7: { name: 'TIMARLI SİPAHİ', hayat: 5 }, 8: { name: 'YENİÇERİ', hayat: 4 },
  9: { name: 'VEZİR', hayat: 5 }, 10: { name: 'PADİŞAH', hayat: 8 },
};
const base = { mood: 'war', lead: 0.12, tail: 0.18 };
const shot = (o) => S.push({ ...base, ...o });

shot({
  id: 'h', seg: 0, lead: 0.3,
  lines: [L('1453’te Osmanlı ordusunda olsaydın, hangi rütbede hayatta kalırdın?', 'Bin dört yüz elli üçte Osmanlı ordusunda olsaydın, hangi rütbede hayatta kalırdın?')],
  sfx: [['taiko', 0.05]],
  draw(g) {
    g.cam(960, 560, 1.08, 960, 600, 1.16);
    g.bg('walls', { time: 'night', torches: true, defenders: true });
    g.crowd({ look: 'mix', x0: 300, x1: 1620, y: 1070, rows: 2, n: 12, s: 0.45, silhouette: true });
    g.person({ look: 'nefer', x: 960, y: 1040, s: 1.45, expr: 'shocked', enter: 'pop', at: 0 });
    g.fx('question', { x: 1150, y: 470, at: 0.6 });
  },
});
shot({
  id: 'b', seg: 1,
  lines: [L('Başıbozuk: Maaş yok, zırh yok. Son saldırıda ilk dalga sensin!')],
  sfx: [['whoosh', 0], ['arrows', 1.0], ['crowd', 0.4]],
  draw(g) {
    g.cam(960, 600, 1.02, 960, 620, 1.1);
    g.bg('walls', { time: 'night', torches: true, defenders: true });
    g.crowd({ look: 'basibozuk', x0: 300, x1: 1620, y: 1000, rows: 3, n: 10, s: 0.55, act: 'charge' });
    g.fx('arrows', { dens: 0.9 });
    g.person({ look: 'basibozuk', x: 960, y: 1060, s: 1.35, expr: 'scared', act: 'shake', prop: 'club' });
  },
});
shot({
  id: 'a', seg: 2,
  lines: [L('Aşçı: Ordunun en güvenli işi. Üstelik bölük komutanına bile çorbacı denir!')],
  sfx: [['whoosh', 0], ['bubble', 0.4]],
  draw(g) {
    g.bg('kitchen');
    g.kazan(1230, 970, 0.95, { fire: true });
    g.person({ look: 'asci', x: 760, y: 975, s: 1.45, expr: 'happy', act: 'stir', prop: 'ladle' });
    g.label('ÇORBACI = KOMUTAN', 960, 250, { at: g.L(0) + 2.3, small: true });
  },
});
shot({
  id: 'l', seg: 3,
  lines: [L('Lağımcı: Surların altına tünel kazarsın. Ama karşı tünelden ateş ve duman gelir!')],
  sfx: [['whoosh', 0], ['dig', 0.4], ['dig', 1.3], ['dig', 2.2], ['boom_small', 'L0+3.0'], ['fire', 'L0+3.1']],
  draw(g) {
    const hit = g.L(0) + 3.0;
    g.shake(g.t > hit && g.t < hit + 0.5 ? 14 : 0);
    g.bg('tunnel', { breach: g.t > hit });
    g.person({ look: 'lagimci', x: 880, y: 940, s: 1.4, expr: g.t > hit ? 'shocked' : 'determined', act: g.t > hit ? 'shake' : 'dig', prop: 'pickaxe' });
    g.lantern(640, 560, { flicker: true });
    if (g.t > hit) { g.fx('fire', { x: 1400, y: 920, w: 240, at: hit }); g.fx('smoke', { x: 1300, y: 650, n: 8, dark: true }); g.flash(hit); }
  },
});
shot({
  id: 'k', seg: 4,
  lines: [L('Kürekçi: Gemileri bir gecede karadan yürütüp Haliç’e indirirsin!', 'Kürekçi: Gemileri bir gecede karadan yürütüp Haliçe indirirsin!')],
  sfx: [['whoosh', 0], ['creak', 0.8], ['creak', 2.6]],
  draw(g) {
    g.cam(960, 560, 1.0, 1000, 540, 1.06);
    g.bg('hill', { time: 'night' });
    g.landShip(g.t + 19);
    g.person({ look: 'kurekci', x: 1290, y: 1010, s: 1.05, expr: 'determined', act: 'pull', prop: 'rope' });
  },
});
shot({
  id: 't', seg: 5,
  lines: [L('Topçu: Dev Şahi topu günde sadece birkaç kez ateşlenir. Bazen de patlar!')],
  sfx: [['whoosh', 0], ['boom', 'L0+1.3']],
  draw(g) {
    const F = g.L(0) + 1.3;
    g.shake(g.t > F && g.t < F + 0.6 ? 20 * (1 - (g.t - F) / 0.6) : 0);
    g.bg('battery', { wallHit: g.t > F + 1.1 ? g.t - F - 1.1 : -1 });
    g.cannon(1110, 900, 0.85, { fire: F });
    g.person({ look: 'topcu', x: 620, y: 960, s: 1.3, expr: g.t > F ? 'shocked' : 'scared', act: g.t > F ? 'shake' : 'ears' });
    g.flash(F);
  },
});
shot({
  id: 'ak', seg: 6,
  lines: [L('Akıncı: Maaş yok, vergi de yok. Kazancın sadece ganimet!')],
  sfx: [['whoosh', 0], ['gallop', 0], ['coins', 'L0+2.4']],
  draw(g) {
    g.bg('country', { time: 'day', scroll: g.t * 520 });
    g.horse(940, 1000, 1.0, { rider: 'akinci', act: 'gallop', expr: 'happy' });
    g.fx('dust', { x: 760, y: 990, trail: true });
    g.fx('coins', { x: 960, y: 60, at: g.L(0) + 2.3 });
  },
});
shot({
  id: 's', seg: 7,
  lines: [L('Tımarlı sipahi: Bir köyün vergisi senin. Karşılığında savaşa gelmek zorundasın.')],
  sfx: [['whoosh', 0], ['coins', 1.2]],
  draw(g) {
    g.bg('country', { time: 'day', village: true, fields: true });
    g.person({ look: 'koylu', x: 1340, y: 910, s: 0.85, act: 'farm', expr: 'neutral', prop: 'hoe' });
    g.horse(800, 1000, 0.95, { rider: 'sipahi', act: 'idle', expr: 'smug' });
    g.fx('coinflow', { x0: 1330, y0: 680, x1: 820, y1: 560, at: 1.0 });
  },
});
shot({
  id: 'y', seg: 8,
  lines: [L('Yeniçeri: Evlenmek yasak, sakal yasak. Ama surlara ilk çıkan büyük ödülü alır!')],
  sfx: [['whoosh', 0], ['drumroll', 0.2], ['flag', 'L0+3.0'], ['crowd', 'L0+3.1']],
  draw(g) {
    const up = g.L(0) + 3.0;
    g.cam(960, 600, 1.02, 1000, 560, 1.1);
    g.bg('walls', { time: 'dawn', damage: 2, flagTower: Math.max(0, Math.min(1, (g.t - up) / 1.0)) });
    g.crowd({ look: 'yeniceri', x0: 300, x1: 1620, y: 1010, rows: 3, n: 9, s: 0.58, act: 'march', flags: true });
    g.person({ look: 'yeniceri', x: 880, y: 1060, s: 1.35, expr: g.t > up ? 'happy' : 'determined', act: g.t > up ? 'cheer' : 'march', prop: 'sword' });
  },
});
shot({
  id: 'v', seg: 9,
  lines: [L('Vezir: Konfor çok yüksek. Ama tek bir yanlış tavsiye seni idama götürebilir.')],
  sfx: [['whoosh', 0], ['gong', 'L0+2.2']],
  draw(g) {
    const bad = g.L(0) + 2.2;
    g.bg('divan');
    g.tray(1270, 940);
    g.person({ look: 'vezir', x: 820, y: 970, s: 1.45, expr: g.t > bad ? 'scared' : 'smug', act: g.t > bad ? 'shake' : 'idle' });
    if (g.t > bad) g.vignette('#5a0000', Math.min(0.75, (g.t - bad) * 1.5));
  },
});
shot({
  id: 'p', seg: 10,
  lines: [L('Ve padişah: Yirmi bir yaşında koca bir imparatorluğun yükü. Tarih onu Fatih diye anacak.')],
  sfx: [['whoosh', 0], ['taiko', 'L0+3.6']],
  draw(g) {
    g.cam(960, 560, 1.06, 960, 600, 1.0);
    g.bg('city', { time: 'golden' });
    g.horse(930, 1020, 0.9, { rider: 'padisah', act: 'idle', expr: 'smug', white: true });
    g.fx('sparkle', { x: 960, y: 500 });
  },
});
shot({
  id: 'o', seg: 11, tail: 1.6,
  lines: [L('Sen hangisi olurdun? Yorumlara yaz, tam video kanalda!')],
  sfx: [['whoosh', 0], ['click', 'L0+2.0']],
  draw(g) {
    g.bg('parchment');
    const looks = ['basibozuk', 'asci', 'lagimci', 'kurekci', 'topcu', 'akinci', 'sipahi', 'yeniceri', 'vezir', 'padisah'];
    looks.forEach((lk, i) => {
      const col = i % 5, row = Math.floor(i / 5);
      const x = 530 + col * 215, y = 600 + row * 400;
      g.person({ look: lk, x, y, s: 0.62, expr: i < 3 ? 'sad' : i > 7 ? 'smug' : 'happy', act: 'idle', enter: 'pop', at: 0.05 + i * 0.08, seed: i });
      g.label(String(i + 1), x, y + 40, { at: 0.05 + i * 0.08, small: true });
    });
  },
});

module.exports = { shots: S, RANKS: R };
