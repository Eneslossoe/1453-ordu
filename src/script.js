// 1453'te Osmanlı Ordusunda Her Rütbede Hayatın: Başıbozuktan Padişaha
// Senaryo + sahne tanımları. Her "shot" bir sahnedir:
//   lines: seslendirilecek cümleler. t = ekranda/altyazıda görünen metin, s = TTS'e giden okunuş (yoksa t kullanılır)
//   mood : arka plan müziğinin karakteri
//   sfx  : [tür, zaman] — zaman saniye (sahne başından) ya da 'L1+0.5' (1. cümlenin başlangıcı + 0.5 sn)
//   draw : sahneyi çizen fonksiyon (g = sahne bağlamı, bkz. src/lib/stage.js)

const S = [];
const L = (t, s) => ({ t, s: s || t });
const shot = (o) => { S.push(o); return o; };

const RANKS = [
  { look: 'basibozuk', name: 'BAŞIBOZUK', say: 'Başıbozuk' },
  { look: 'asci', name: 'AŞÇI', say: 'Aşçı' },
  { look: 'lagimci', name: 'LAĞIMCI', say: 'Lağımcı' },
  { look: 'kurekci', name: 'KÜREKÇİ', say: 'Kürekçi' },
  { look: 'topcu', name: 'TOPÇU', say: 'Topçu' },
  { look: 'akinci', name: 'AKINCI', say: 'Akıncı' },
  { look: 'sipahi', name: 'TIMARLI SİPAHİ', say: 'Tımarlı Sipahi' },
  { look: 'yeniceri', name: 'YENİÇERİ', say: 'Yeniçeri' },
  { look: 'vezir', name: 'VEZİR', say: 'Vezir' },
  { look: 'padisah', name: 'PADİŞAH', say: 'Padişah' },
];
const ORD = ['Birinci', 'İkinci', 'Üçüncü', 'Dördüncü', 'Beşinci', 'Altıncı', 'Yedinci', 'Sekizinci', 'Dokuzuncu', 'Onuncu'];

function card(n, tag, mood) {
  const r = RANKS[n - 1];
  shot({
    id: `r${n}`, kind: 'card', mood, seg: n, minDur: 3.6, lead: 0.7,
    lines: [L(`${n}. Rütbe: ${r.say}`, `${ORD[n - 1]} rütbe: ${r.say}.`)],
    sfx: [['whoosh', 0.05], ['taiko', 0.35]],
    draw(g) { g.rankCard(n, r.name, tag, r.look); },
  });
}

function stats(n, st, lines, mood, expr) {
  const r = RANKS[n - 1];
  shot({
    id: `r${n}s`, kind: 'stats', mood, seg: n, lead: 0.4, tail: 1.0,
    lines,
    sfx: [['tick', 0.5], ['tick', 0.8], ['tick', 1.1], ['tick', 1.4]],
    draw(g) {
      g.bg('parchment');
      g.person({ look: r.look, x: 470, y: 950, s: 1.75, expr: expr || 'neutral', act: 'idle', enter: 'pop' });
      g.stats(r.name, st);
    },
  });
}

// ─────────────────────────────── GİRİŞ ───────────────────────────────
shot({
  id: 'i1', mood: 'epic', seg: 0, lead: 1.2,
  lines: [L('29 Mayıs 1453. Gece yarısı.', 'Yirmi dokuz Mayıs, bin dört yüz elli üç. Gece yarısı.'),
    L('Elli üç gündür süren kuşatmanın son gecesindeyiz.')],
  sfx: [['taiko', 0.2], ['wind', 0]],
  draw(g) {
    g.cam(960, 420, 1.2, 960, 540, 1.0);
    g.bg('walls', { time: 'night', torches: true });
    g.campfires([[180, 1000], [620, 1030], [1150, 1010], [1690, 1025]], 1.1);
    g.crowd({ look: 'mix', x0: -80, x1: 2000, y: 1075, rows: 2, n: 30, s: 0.42, silhouette: true });
    g.fx('embers');
    g.date('29 MAYIS 1453', 'GECE YARISI', { at: 0.5 });
  },
});
shot({
  id: 'i2', mood: 'epic', seg: 0,
  lines: [L('Önünde bin yıldır hiçbir ordunun yıkamadığı İstanbul surları, arkanda ise döneminin en büyük ordularından biri var.')],
  draw(g) {
    g.cam(1080, 500, 1.08, 900, 560, 1.0);
    g.bg('walls', { time: 'night', torches: true, defenders: true });
    g.crowd({ look: 'mix', x0: -80, x1: 2000, y: 1010, rows: 4, n: 28, s: 0.5, banners: true });
    g.label('BİN YILLIK SURLAR', 1250, 250, { at: 0.5 });
    g.label('OSMANLI ORDUSU', 480, 690, { at: 3.4, tilt: 3 });
  },
});
shot({
  id: 'i3', mood: 'epic', seg: 0,
  lines: [L('Ve sen, bu ordunun içindesin.'), L('Ama kim olarak?')],
  draw(g) {
    g.bg('camp', { time: 'night' });
    g.person({ look: 'nefer', x: 960, y: 980, s: 1.7, expr: g.li < 1 ? 'neutral' : 'shocked', enter: 'pop' });
    g.fx('question', { x: 1150, y: 430, at: g.L(1) });
    g.banner('SEN KİM OLURDUN?', { at: g.L(1) + 0.2 });
  },
});
shot({
  id: 'i4', mood: 'epic', seg: 0,
  lines: [L('Bugün en alttan en üste, Osmanlı ordusundaki her rütbede hayatının nasıl olacağını göreceğiz.'),
    L('Ölüme ilk koşan başıbozuktan kazanın başındaki aşçıya, yerin altındaki lağımcıdan surları sarsan topçuya ve en sonunda yirmi bir yaşındaki padişaha kadar.')],
  draw(g) { g.bg('parchment'); g.lineup(RANKS, { mode: 'intro' }); },
});
shot({
  id: 'i5', mood: 'epic', seg: 0, tail: 1.0,
  lines: [L('Başlamadan önce kanala abone olmayı unutma.'), L('Hazırsan, zaman kırığından geçiyoruz!')],
  sfx: [['click', 1.6], ['crack', 'L1+1.5']],
  draw(g) {
    g.bg('parchment');
    g.person({ look: 'nefer', x: 560, y: 960, s: 1.6, expr: 'happy', act: 'wave', enter: 'pop' });
    g.subscribe(1250, 520, { at: 0.5 });
    g.crack(g.L(1) + 1.5);
  },
});

// ─────────────────────────── 1. BAŞIBOZUK ───────────────────────────
card(1, 'Maaşı yok, zırhı yok, şansı da yok.', 'tense');
shot({
  id: 'b1', mood: 'tense', seg: 1,
  lines: [L('İlk rütbemiz aslında bir rütbe bile değil. Sen bir başıbozuksun.'),
    L('Köyündeki tarlanı bırakıp orduya gönüllü katıldın. Kimse seni zorlamadı; seni buraya getiren tek şey, ganimet hayali.')],
  draw(g) {
    g.bg('country', { time: 'day', village: true });
    g.person({ look: 'basibozuk', y: 940, s: 1.45, expr: g.li ? 'happy' : 'neutral', act: 'walk', walk: [640, 1260, 0, g.d], prop: 'bundle' });
    g.thought(1560, 330, 'coins', { at: g.L(1) + 2.5, follow: [640, 1260] });
  },
});
shot({
  id: 'b2', mood: 'tense', seg: 1,
  lines: [L('Maaşın yok. Zırhın yok. Silahın ise ya evden getirdiğin paslı bir kılıç ya da bir sopa.'),
    L('Padişah, şehir alınırsa üç gün yağma izni vereceğini söylemiş. Senin bütün emeklilik planın bu.')],
  draw(g) {
    g.bg('camp', { time: 'day' });
    const club = g.t > g.L(0) + 4.2;
    g.person({ look: 'basibozuk', x: 800, y: 960, s: 1.65, expr: g.li ? 'smug' : 'sad', prop: club ? 'club' : 'rustysword', act: g.li ? 'idle' : 'show' });
    if (g.li < 1) {
      g.label('MAAŞ: 0 AKÇE', 1350, 330, { at: 0.3, tilt: -3 });
      g.label('ZIRH: YOK', 1350, 470, { at: 1.4, tilt: 2 });
    } else g.thought(1240, 330, 'coins', { at: g.L(1) + 0.3 });
  },
});
shot({
  id: 'b3', mood: 'tense', seg: 1,
  lines: [L('Ve 29 Mayıs gecesi, büyük saldırıda ilk dalga sensin.', 'Ve yirmi dokuz Mayıs gecesi, büyük saldırıda ilk dalga sensin.'),
    L('Görevin basit: Surlara koşmak ve savunucuları yormak.'),
    L('Geri dönmeyi düşünürsen, arkanda elinde kırbaçla bekleyen çavuşlar var.')],
  sfx: [['crowd', 'L1+0.3'], ['whip', 'L2+1.2'], ['whip', 'L2+2.6']],
  draw(g) {
    g.cam(900, 560, 1.0, g.li >= 2 ? 1160 : 900, 580, g.li >= 2 ? 1.12 : 1.04);
    g.bg('walls', { time: 'night', torches: true, defenders: true });
    g.date('29 MAYIS 1453', 'SAAT 01:30', { at: 0.3 });
    g.crowd({ look: 'basibozuk', x0: -100, x1: 2000, y: 1010, rows: 3, n: 26, s: 0.55, act: g.t > g.L(1) ? 'charge' : 'idle' });
    g.person({ look: 'basibozuk', x: 760, y: 1030, s: 1.3, expr: 'scared', act: 'shake', prop: 'club' });
    if (g.t > g.L(2)) g.person({ look: 'cavus', x: 1460, y: 1060, s: 1.45, expr: 'angry', prop: 'whip', act: 'whip', enter: 'slide', at: g.L(2) });
  },
});
shot({
  id: 'b4', mood: 'tense', seg: 1,
  lines: [L('Tepeden oklar, taşlar ve kaynar yağ yağarken hendekte saatlerce dövüşüyorsun.'),
    L('Gecenin sonunda, seninle birlikte koşanların çoğu geri dönmüyor.')],
  sfx: [['arrows', 0.3], ['arrows', 2.0], ['clash', 1.2], ['clash', 3.1]],
  draw(g) {
    const late = g.li >= 1;
    g.bg('walls', { time: late ? 'predawn' : 'night', close: true, torches: !late });
    if (!late) { g.fx('arrows', { dens: 1.2 }); g.fx('stones'); }
    g.person({ look: 'basibozuk', x: 900, y: 1000, s: 1.45, expr: late ? 'sad' : 'scared', act: late ? 'idle' : 'shake', prop: 'club' });
    g.fx('smoke', { x: 1400, y: 900, n: 6 });
    if (late) g.dim(0.35);
  },
});
stats(1, { maas: 'YOK — sadece ganimet', kazanc: 2, konfor: 1, tehlike: 10, hayat: 1 },
  [L('Başıbozuk olarak hayatta kalma şansın çok düşük. Ama sağ kalırsan, belki de cebin hayatında ilk kez dolacak.')], 'tense', 'sad');

// ───────────────────────────── 2. AŞÇI ─────────────────────────────
card(2, 'Ordunun kalbi mutfakta atar.', 'light');
shot({
  id: 'a1', mood: 'light', seg: 2,
  lines: [L('Şimdi biraz daha güvenli bir yere geçelim: Yeniçeri ocağının mutfağına.'),
    L('Sen bir karakullukçusun, yani aşçı çırağı. Kulağa basit geliyor, ama yeniçeri ocağında mutfak her şeydir.')],
  sfx: [['bubble', 0.2]],
  draw(g) {
    g.bg('kitchen');
    g.kazan(1220, 960, 1.35, { fire: true });
    g.person({ look: 'asci', x: 760, y: 965, s: 1.55, expr: 'happy', act: 'stir', prop: 'ladle' });
    g.label('KARAKULLUKÇU', 760, 470, { at: g.L(1) + 0.4 });
  },
});
shot({
  id: 'a2', mood: 'light', seg: 2,
  lines: [L('O kadar ki, bir yeniçeri bölüğünün komutanına bile çorbacı denir.'),
    L('Bölüğün kazanı kutsaldır. Savaşta kazanı kaybetmek, sancağı kaybetmek kadar büyük bir utançtır.')],
  draw(g) {
    g.bg('parchment');
    if (g.li < 1) {
      g.ladder([
        { t: 'KARAKULLUKÇU', sub: 'Aşçı çırağı — SEN', look: 'asci' },
        { t: 'AŞÇI USTA', sub: 'Mutfağın şefi', look: 'asciusta' },
        { t: 'ÇORBACI', sub: 'Bölük komutanı!', look: 'corbaci' },
      ]);
    } else {
      g.kazan(960, 900, 1.9, { fire: true, halo: true });
      g.label('KUTSAL KAZAN', 960, 300, { at: g.L(1) + 0.3 });
    }
  },
});
shot({
  id: 'a3', mood: 'light', seg: 2,
  lines: [L('Günün, güneş doğmadan başlar. Su taşırsın, odun kırarsın, binlerce asker için çorba ve pilav pişirirsin.')],
  draw(g) {
    g.bg('kitchen', { time: 'dawn' });
    g.kazan(1380, 960, 1.1, { fire: true });
    g.person({ look: 'asci', y: 965, s: 1.5, expr: 'tired', act: 'walk', walk: [420, 1000, 0, g.d * 0.9], prop: 'buckets' });
    g.clock(1600, 230, '05:00', { at: 0.3 });
  },
});
shot({
  id: 'a4', mood: 'light', seg: 2,
  lines: [L('Kuşatmanın son gecelerinde ordugâhta öyle büyük ateşler yakılır ki, surlardaki Bizanslılar Osmanlı kampının yandığını sanır.')],
  sfx: [['fire', 0]],
  draw(g) {
    g.cam(960, 540, 1.0, 1100, 470, 1.15);
    g.bg('walls', { time: 'night', torches: true });
    g.campfires([[120, 1010], [430, 1040], [760, 1000], [1080, 1045], [1420, 1010], [1760, 1040]], 2.4);
    g.person({ look: 'bizans', x: 1250, y: 500, s: 0.55, expr: 'shocked', act: 'shake', noLegs: true, clipBelow: 474 });
    g.label('KAMP YANIYOR MU?!', 1250, 250, { at: 3.0, small: true });
  },
});
shot({
  id: 'a5', mood: 'light', seg: 2,
  lines: [L('Hendeğe koşmazsın, surlara tırmanmazsın. Ama dikkat et: Kalabalık ordugâhta salgın hastalıklar, oklardan çok daha sessiz öldürür.')],
  draw(g) {
    g.bg('kitchen');
    const sick = g.t > g.d * 0.45;
    g.person({ look: 'asci', x: 900, y: 965, s: 1.6, expr: sick ? 'scared' : 'happy', act: sick ? 'shake' : 'eat', prop: 'bowl' });
    if (sick) g.fx('germs', { x: 900, y: 600, at: g.d * 0.45 });
  },
});
stats(2, { maas: 'Küçük ama düzenli', kazanc: 3, konfor: 5, tehlike: 2, hayat: 8 },
  [L('Aşçı olarak hayatta kalma şansın oldukça yüksek. Üstelik ordudaki en tok kişi de muhtemelen sensin.')], 'light', 'happy');

// ──────────────────────────── 3. LAĞIMCI ────────────────────────────
card(3, 'Savaşın görünmeyen yüzü: yerin altı.', 'dark');
shot({
  id: 'l1', mood: 'dark', seg: 3,
  lines: [L('Şimdi ışığı kapat. Çünkü yeni görevin, yerin metrelerce altında.'),
    L('Sen bir lağımcısın. Görevin, surların altına tünel kazıp temellerini çökertmek.')],
  sfx: [['dig', 'L1+0.2'], ['dig', 'L1+1.1'], ['dig', 'L1+2.0'], ['dig', 'L1+2.9'], ['dig', 'L1+3.8']],
  draw(g) {
    g.bg('tunnel');
    g.person({ look: 'lagimci', x: 900, y: 930, s: 1.45, expr: 'determined', act: g.li ? 'dig' : 'idle', prop: 'pickaxe' });
    g.lantern(680, 560, { flicker: true });
    if (g.li) g.fx('dust', { x: 1180, y: 700 });
    g.darkness(g.li ? 0.0 : Math.max(0, 1 - g.t / 2.5));
  },
});
shot({
  id: 'l2', mood: 'dark', seg: 3,
  lines: [L('Bu işin ustaları, Sırp Despotluğu’ndaki Novoberde gümüş madenlerinden gelen madencilerdir. Onlar kazar, sen toprağı taşırsın.'),
    L('Tek bir kandil ışığında, nefes almakta zorlanarak günlerce kazıyorsun.')],
  draw(g) {
    if (g.li < 1) {
      g.bg('section', { progress: g.p * 1.8 });
      g.label('NOVOBERDE MADENCİLERİ', 560, 640, { at: 1.5, small: true });
    } else {
      g.bg('tunnel');
      g.person({ look: 'lagimci', y: 930, s: 1.45, expr: 'tired', act: 'walk', walk: [1300, 760, g.L(1), g.d], flip: true, prop: 'basket' });
      g.lantern(640, 560, { flicker: true });
    }
  },
});
shot({
  id: 'l3', mood: 'dark', seg: 3,
  lines: [L('Ama surların öbür tarafında da biri dinliyor. Bizans’ın yanında savaşan mühendis Johannes Grant, karşı tüneller kazdırıyor.', 'Ama surların öbür tarafında da biri dinliyor. Bizansın yanında savaşan mühendis Yohannes Grant, karşı tüneller kazdırıyor.')],
  draw(g) {
    g.bg('section', { progress: 1, counter: Math.min(1, g.p * 1.4) });
    g.label('JOHANNES GRANT', 1450, 560, { at: 3.0, small: true });
  },
});
shot({
  id: 'l4', mood: 'dark', seg: 3,
  lines: [L('Bir gün kazmanın sesine duvarın ötesinden bir cevap gelir. Tünele duman, ateş, bazen de su dolar.')],
  sfx: [['dig', 0.3], ['knock', 1.6], ['knock', 2.2], ['boom_small', 3.6], ['fire', 3.7]],
  draw(g) {
    const hit = 3.6;
    g.shake(g.t > hit && g.t < hit + 0.6 ? 14 : 0);
    g.bg('tunnel', { breach: g.t > hit });
    g.person({ look: 'lagimci', x: 820, y: 930, s: 1.45, expr: g.t > 1.6 ? (g.t > hit ? 'shocked' : 'scared') : 'determined', act: g.t > hit ? 'shake' : (g.t > 1.6 ? 'idle' : 'dig'), prop: 'pickaxe' });
    g.lantern(600, 560, { flicker: true });
    if (g.t > 1.6 && g.t < hit) g.fx('knock', { x: 1350, y: 650 });
    if (g.t > hit) { g.fx('fire', { x: 1450, y: 900, w: 260, at: hit }); g.fx('smoke', { x: 1350, y: 650, n: 10, dark: true }); g.flash(hit); }
  },
});
shot({
  id: 'l5', mood: 'dark', seg: 3,
  lines: [L('Osmanlılar bu kuşatmada birçok tünel kazar ve neredeyse hepsi fark edilip yok edilir.'),
    L('Karanlıkta göğüs göğüse dövüşen lağımcıların çoğu için kazdıkları tünel, aynı zamanda mezarları olur.')],
  draw(g) {
    if (g.li < 1) { g.bg('section', { progress: 1, many: true, crossed: g.p * 2 }); }
    else {
      g.bg('tunnel');
      g.person({ look: 'lagimci', x: 960, y: 930, s: 1.45, expr: 'sad', act: 'idle', prop: 'pickaxe' });
      g.lantern(700, 560, { flicker: true, fade: Math.min(1, (g.t - g.L(1)) / (g.d - g.L(1))) });
    }
  },
});
stats(3, { maas: 'Düşük', kazanc: 3, konfor: 0, tehlike: 9, hayat: 2 },
  [L('Lağımcı olarak hayatta kalma şansın neredeyse başıbozuk kadar düşük. Üstelik yerin altında kahramanlığını kimse görmez.')], 'dark', 'tired');

// ──────────────────────────── 4. KÜREKÇİ ────────────────────────────
card(4, 'Gemiler denizde yüzer… seninkiler karada.', 'row');
shot({
  id: 'k1', mood: 'row', seg: 4,
  lines: [L('Bu sefer denizdesin. Sen Osmanlı donanmasında bir kürekçisin, yani bir azap.')],
  sfx: [['waves', 0]],
  draw(g) {
    g.bg('sea', { time: 'day' });
    g.ship(1300, 640, 0.9, { rowing: true });
    g.boatRail();
    g.person({ look: 'kurekci', x: 700, y: 1010, s: 1.5, expr: 'determined', act: 'row', prop: 'oar', noLegs: true });
  },
});
shot({
  id: 'k2', mood: 'row', seg: 4,
  lines: [L('Ama büyük bir sorun var: Bizanslılar Haliç’in ağzına dev bir zincir germiş. Donanmanız içeri giremiyor.', 'Ama büyük bir sorun var: Bizanslılar Haliçin ağzına dev bir zincir germiş. Donanmanız içeri giremiyor.')],
  draw(g) {
    g.cam(900, 540, 1.12, 960, 540, 1.0);
    g.bg('sea', { time: 'day', city: true, chain: true });
    g.ship(380, 760, 0.55, { rowing: false });
    g.ship(650, 820, 0.6, { rowing: false });
    g.label('HALİÇ ZİNCİRİ', 1180, 560, { at: 1.0 });
  },
});
shot({
  id: 'k3', mood: 'row', seg: 4,
  lines: [L('20 Nisan’da dört Hristiyan gemisi bütün Osmanlı donanmasını yarıp şehre ulaşınca, padişah öfkeyle atını denize sürer.', 'Yirmi Nisanda dört Hıristiyan gemisi bütün Osmanlı donanmasını yarıp şehre ulaşınca, padişah öfkeyle atını denize sürer.')],
  sfx: [['splash', 'L0+5.2']],
  draw(g) {
    g.bg('sea', { time: 'day' });
    g.date('20 NİSAN 1453', 'DENİZ SAVAŞI', { at: 0.2 });
    const k = g.p;
    for (let i = 0; i < 4; i++) g.carrack(-300 + k * 1400 + i * 260, 560 + (i % 2) * 70, 0.55);
    g.ship(500, 860, 0.45, { rowing: true });
    g.ship(1250, 880, 0.45, { rowing: true });
    if (g.t > 4.6) { g.horse(1500, 1060, 1.0, { rider: 'padisah', expr: 'angry', act: 'rear', water: true, flip: true }); g.fx('splash', { x: 1500, y: 1030, at: 5.2 }); }
  },
});
shot({
  id: 'k4', mood: 'row', seg: 4,
  lines: [L('Amiral Baltaoğlu Süleyman Bey görevinden alınır. Herkes bir sonraki hamleyi merak ediyor.')],
  sfx: [['stamp', 1.8]],
  draw(g) {
    g.bg('camp', { time: 'day' });
    g.person({ look: 'kaptan', x: 760, y: 960, s: 1.6, expr: 'sad', act: 'idle' });
    g.label('BALTAOĞLU SÜLEYMAN BEY', 760, 420, { at: 0.3, small: true });
    g.stamp('GÖREVDEN ALINDI', 1360, 720, { at: 1.8 });
  },
});
shot({
  id: 'k5', mood: 'row', seg: 4,
  lines: [L('Ve o hamle tarihe geçer. 22 Nisan gecesi, gemileri yağlanmış kızakların üstünde karadan yürütürsünüz!', 'Ve o hamle tarihe geçer. Yirmi iki Nisan gecesi, gemileri yağlanmış kızakların üstünde karadan yürütürsünüz!'),
    L('Halatları çekiyorsun, öküzler böğürüyor, davullar çalıyor. Bazı gemilerde yelkenler bile açık; kürekçiler havaya kürek çekiyor.')],
  sfx: [['creak', 'L1+0.5'], ['creak', 'L1+3.5']],
  draw(g) {
    g.cam(960, 540, 1.0, 1000, 520, 1.07);
    g.bg('hill', { time: 'night' });
    g.date('22 NİSAN 1453', 'GECE', { at: 0.3 });
    g.landShip(g.t);
    g.person({ look: 'kurekci', x: 1500, y: 1000, s: 1.25, expr: 'determined', act: 'pull', prop: 'rope' });
    g.label('GEMİLER KARADAN YÜRÜYOR!', 1180, 170, { at: g.L(0) + 2.0 });
  },
});
shot({
  id: 'k6', mood: 'row', seg: 4,
  lines: [L('Sabah olduğunda, yetmişe yakın Osmanlı gemisi Haliç’in içindedir. Surlardaki savunucular gözlerine inanamaz.', 'Sabah olduğunda, yetmişe yakın Osmanlı gemisi Haliçin içindedir. Surlardaki savunucular gözlerine inanamaz.')],
  draw(g) {
    g.bg('sea', { time: 'dawn', city: true, horn: true });
    for (let i = 0; i < 9; i++) g.ship(300 + i * 170, 780 + (i % 3) * 50, 0.32, { rowing: true });
    g.person({ look: 'bizans', x: 360, y: 1130, s: 1.55, expr: 'shocked', act: 'shake', noLegs: true });
    g.parapet(905);
    g.label('~70 GEMİ', 1300, 440, { at: 1.2 });
  },
});
stats(4, { maas: 'Az ama düzenli', kazanc: 3, konfor: 2, tehlike: 5, hayat: 6 },
  [L('Kürekçi olarak hayatta kalma şansın orta düzeyde. Ama sırtın ve kolların bu geceyi asla unutmayacak.')], 'row', 'tired');

// ───────────────────────────── 5. TOPÇU ─────────────────────────────
card(5, 'Bin yıllık surlara karşı dev toplar.', 'war');
shot({
  id: 't1', mood: 'war', seg: 5,
  lines: [L('Şimdi kulaklarını tıka. Sen bir topçusun ve dünyanın en büyük toplarından birinin başındasın.')],
  draw(g) {
    g.bg('battery');
    g.cannon(1260, 900, 1.2, {});
    g.person({ look: 'topcu', x: 400, y: 960, s: 1.5, expr: 'scared', act: 'ears' });
    g.label('ŞAHİ TOPU', 1260, 520, { at: 1.6 });
  },
});
shot({
  id: 't2', mood: 'war', seg: 5,
  lines: [L('Bu canavarı döken, Urban adında Macar bir ustadır. İşin ilginç yanı, Urban önce hizmetini Bizans imparatoruna teklif etmiş, ama imparator onun ücretini ödeyememiş.'),
    L('Fatih Sultan Mehmed ise istediğinden çok daha fazlasını vermiş.')],
  sfx: [['coins', 'L1+0.4']],
  draw(g) {
    g.bg('parchment');
    g.split();
    g.person({ look: 'urban', x: g.li ? 1440 : 480, y: 960, s: 1.45, expr: g.li ? 'happy' : 'sad', act: g.li ? 'jump' : 'idle' });
    g.label('BİZANS', 480, 150, { at: 0.2, small: true });
    g.label('OSMANLI', 1440, 150, { at: 0.2, small: true });
    g.label('USTA URBAN', g.li ? 1440 : 480, 420, { at: 0.8, small: true });
    if (g.t > 5.5 && !g.li) g.emptyPurse(780, 640, { at: 5.5 });
    if (g.li) g.fx('coins', { x: 1440, y: 200, at: g.L(1) + 0.3 });
  },
});
shot({
  id: 't3', mood: 'war', seg: 5,
  lines: [L('Bu topu Edirne’den getirmek için altmış öküz ve yüzlerce adam gerekti. Yolculuk yaklaşık iki ay sürdü.', 'Bu topu Edirneden getirmek için altmış öküz ve yüzlerce adam gerekti. Yolculuk yaklaşık iki ay sürdü.')],
  draw(g) {
    g.bg('country', { time: 'day', road: true });
    g.convoy(g.t);
    g.label('EDİRNE → İSTANBUL', 960, 150, { at: 0.4 });
    g.label('60 ÖKÜZ', 600, 470, { at: 2.0, small: true });
  },
});
shot({
  id: 't4', mood: 'war', seg: 5,
  lines: [L('Topun fırlattığı taş gülleler yarım tondan ağırdı. Ama bir atıştan sonra yeniden doldurmak saatler sürüyordu; günde yalnızca birkaç atış yapabiliyordun.')],
  sfx: [['boom', 1.5]],
  draw(g) {
    const F = 1.5;
    g.shake(g.t > F && g.t < F + 0.7 ? 22 * (1 - (g.t - F) / 0.7) : 0);
    g.bg('battery', { wallHit: g.t > F + 1.1 ? g.t - F - 1.1 : -1 });
    g.cannon(1050, 900, 1.25, { fire: F });
    g.person({ look: 'topcu', x: 480, y: 960, s: 1.45, expr: g.t > F ? 'shocked' : 'determined', act: g.t > F ? 'shake' : 'idle', prop: 'torch' });
    g.label('YARIM TONDAN AĞIR GÜLLE', 1250, 200, { at: F + 1.6, small: true });
    g.clock(1380, 420, 'YENİDEN DOLDURMA: SAATLER', { at: g.d * 0.62, small: true });
    g.flash(F);
  },
});
shot({
  id: 't5', mood: 'war', seg: 5,
  lines: [L('Her atıştan sonra namluya sıcak yağ dökersin, çünkü bu toplar bazen çatlar, patlar ve etrafındaki herkesi de yanında götürür.')],
  draw(g) {
    g.bg('battery');
    g.cannon(1100, 900, 1.25, { cracks: Math.min(1, g.p * 1.6), oil: true });
    g.person({ look: 'topcu', x: 680, y: 960, s: 1.45, expr: g.p > 0.5 ? 'scared' : 'neutral', act: 'pour', prop: 'jug' });
    g.warn(1500, 330, { at: g.d * 0.5 });
  },
});
shot({
  id: 't6', mood: 'war', seg: 5,
  lines: [L('Haftalar boyunca surları dövüyorsun. Gündüz yıktığınız yerleri savunucular gece onarıyor, sabah her şey yeniden başlıyor.')],
  sfx: [['boom_far', 0.8], ['boom_far', 3.6]],
  draw(g) {
    g.bg('walls', { cycle: g.p, damage: 1 + Math.round(g.p * 2), repair: true });
    g.dayCounter(1560, 150, Math.floor(6 + g.p * 40));
  },
});
stats(5, { maas: 'İyi', kazanc: 5, konfor: 3, tehlike: 6, hayat: 5 },
  [L('Topçu olarak düşman okları seni pek bulamaz; ama kendi topun bulabilir. Hayatta kalma şansın orta.')], 'war', 'neutral');

// ──────────────────────────── 6. AKINCI ────────────────────────────
card(6, 'Ordunun gözü, kulağı ve rüzgârı.', 'gallop');
shot({
  id: 'ak1', mood: 'gallop', seg: 6,
  lines: [L('Şimdi atına atla. Sen bir akıncısın: hafif zırhlı, hızlı ve korkusuz bir süvari.'),
    L('Akıncılar maaş almaz, vergi de ödemez. Senin kazancın, akınlarda ele geçirdiğin ganimettir.')],
  sfx: [['gallop', 0]],
  draw(g) {
    g.bg('country', { time: 'day', scroll: g.t * 520 });
    g.horse(560, 960, 0.75, { rider: 'akinci', act: 'gallop', expr: 'happy', phase: 1.3 });
    g.horse(1000, 990, 1.05, { rider: 'akinci', act: 'gallop', expr: 'determined' });
    g.fx('dust', { x: 760, y: 980, trail: true });
    g.label('MAAŞ: YOK', 1520, 260, { at: g.L(1) + 0.2, tilt: -3 });
    g.label('VERGİ: YOK', 1520, 390, { at: g.L(1) + 1.6, tilt: 2 });
    g.label('GANİMET: VAR!', 1520, 520, { at: g.L(1) + 3.6, tilt: -2 });
  },
});
shot({
  id: 'ak2', mood: 'gallop', seg: 6,
  lines: [L('Kuşatmada surlara tırmanmazsın. Görevin, şehrin çevresini kontrol altında tutmak, ordu için yiyecek bulmak ve etrafı kollamaktır.'),
    L('Bazı akıncılar ise Turahan Bey’in emrinde çok uzakta, Mora’dadır. Amaçları, imparatorun kardeşlerinin İstanbul’a yardım göndermesini engellemektir.', 'Bazı akıncılar ise Turahan Beyin emrinde çok uzakta, Morada dır. Amaçları, imparatorun kardeşlerinin İstanbula yardım göndermesini engellemektir.')],
  draw(g) { g.regionMap({ t: g.t, mora: g.L(1) }); },
});
shot({
  id: 'ak3', mood: 'gallop', seg: 6,
  lines: [L('Herkes bir Macar ordusunun ya da Venedik donanmasının yardıma gelmesinden korkuyor. Ufku izleyen ilk göz sensin.')],
  draw(g) {
    g.cam(960, 600, 1.0, 900, 640, 1.08);
    g.bg('country', { time: 'dusk', hilltop: true });
    g.horse(900, 740, 1.0, { rider: 'akinci', act: 'idle', expr: 'determined', pose: 'scout' });
  },
});
stats(6, { maas: 'YOK — ganimet', kazanc: 6, konfor: 4, tehlike: 5, hayat: 6 },
  [L('Akıncı olarak hayatta kalma şansın iyi, özgürlüğün yüksek. Ama ganimet yoksa, cebin de bomboş.')], 'gallop', 'smug');

// ───────────────────────── 7. TIMARLI SİPAHİ ─────────────────────────
card(7, 'Toprağın efendisi, padişahın süvarisi.', 'epic');
shot({
  id: 's1', mood: 'epic', seg: 7,
  lines: [L('Bir basamak daha yukarı çıkıyoruz. Sen bir tımarlı sipahisin.'),
    L('Padişah sana bir köyün vergi gelirini vermiş; buna tımar denir. Karşılığında, sefer emri gelince atını, zırhını ve askerlerini alıp orduya katılmak zorundasın.')],
  draw(g) {
    g.bg('country', { time: 'day', village: true, fields: true });
    g.person({ look: 'koylu', x: 1350, y: 900, s: 0.9, act: 'farm', expr: 'neutral', prop: 'hoe' });
    g.person({ look: 'koylu2', x: 1600, y: 920, s: 0.85, act: 'farm', expr: 'neutral', prop: 'hoe', flip: true });
    g.horse(620, 980, 1.05, { rider: 'sipahi', act: 'idle', expr: 'smug' });
    g.label('TIMAR', 1480, 360, { at: g.L(1) + 1.8 });
    if (g.t > g.L(1) + 2) g.fx('coinflow', { x0: 1450, y0: 700, x1: 700, y1: 560, at: g.L(1) + 2 });
  },
});
shot({
  id: 's2', mood: 'epic', seg: 7,
  lines: [L('Gelirin arttıkça yanında getirmen gereken zırhlı askerlerin, yani cebelülerin sayısı da artar.'),
    L('Gelmezsen mi? Tımarın elinden alınır. Yani bu savaş, senin için bir iş sözleşmesi gibidir.')],
  sfx: [['stamp', 'L1+1.6']],
  draw(g) {
    g.bg('camp', { time: 'day' });
    if (g.li < 1) {
      g.person({ look: 'sipahi', x: 620, y: 960, s: 1.5, expr: 'smug', prop: 'lance' });
      for (let i = 0; i < 3; i++) g.person({ look: 'cebelu', x: 1000 + i * 260, y: 960, s: 1.25, expr: 'determined', prop: 'spear', enter: 'pop', at: 1.0 + i * 1.0 });
      g.label('CEBELÜ', 1260, 460, { at: 3.5 });
    } else {
      g.person({ look: 'sipahi', x: 620, y: 960, s: 1.5, expr: g.t > g.L(1) + 1.6 ? 'shocked' : 'neutral', prop: 'lance' });
      g.scroll(1300, 560, 'TIMAR BERATI', { at: g.L(1) });
      g.stamp('İPTAL', 1300, 600, { at: g.L(1) + 1.6 });
    }
  },
});
shot({
  id: 's3', mood: 'epic', seg: 7,
  lines: [L('Kuşatmada Rumeli askerleri surların kuzey tarafında, Anadolu askerleri ise Marmara’ya yakın güney tarafında yer alır.', 'Kuşatmada Rumeli askerleri surların kuzey tarafında, Anadolu askerleri ise Marmaraya yakın güney tarafında yer alır.'),
    L('Son saldırının ikinci dalgasında Anadolu askerleri bir gedikten içeri girer, ama geri püskürtülür.')],
  draw(g) { g.cityMap({ t: g.t, wave: g.L(1) }); },
});
shot({
  id: 's4', mood: 'epic', seg: 7,
  lines: [L('At sırtında savaşmaya alışkın olan sen, bu kez yaya olarak merdivenlere tırmanıyorsun.')],
  sfx: [['arrows', 0.5], ['clash', 2.0]],
  draw(g) {
    g.bg('walls', { time: 'night', close: true, torches: true, ladder: true });
    g.fx('arrows', { dens: 0.8 });
    g.person({ look: 'sipahi', x: 1010, y: 1000 - Math.min(1, g.p * 1.2) * 260, s: 1.2, expr: 'determined', act: 'climb' });
  },
});
stats(7, { maas: 'Tımar geliri', kazanc: 6, konfor: 6, tehlike: 6, hayat: 5 },
  [L('Tımarlı sipahi olarak hayatta kalma şansın orta. Ama savaştan sağ dönersen, köyün ve gelirin seni bekliyor.')], 'epic', 'neutral');

// ──────────────────────────── 8. YENİÇERİ ────────────────────────────
card(8, 'Padişahın kapıkulu, ordunun çelik yumruğu.', 'march');
shot({
  id: 'y1', mood: 'march', seg: 8,
  lines: [L('Ve işte ordunun en meşhur askerleri. Sen bir yeniçerisin.'),
    L('Çocukken devşirmeyle ailenden alındın ve yıllarca Acemi Ocağı’nda eğitildin. Artık doğrudan padişaha bağlı bir kapıkulusun.', 'Çocukken devşirmeyle ailenden alındın ve yıllarca Acemi Ocağında eğitildin. Artık doğrudan padişaha bağlı bir kapıkulusun.')],
  draw(g) {
    g.bg('camp', { time: 'day' });
    if (g.li < 1) {
      g.crowd({ look: 'yeniceri', x0: 100, x1: 1820, y: 870, rows: 2, n: 14, s: 0.6 });
      g.person({ look: 'yeniceri', x: 960, y: 1000, s: 1.7, expr: 'determined', prop: 'sword', enter: 'pop' });
      g.label('YENİÇERİ', 960, 380, { at: 0.8 });
    } else {
      const T0 = g.L(1) + 2.2;
      const k = Math.max(0, Math.min(1, (g.t - T0) / 0.35));
      g.sepia(0.5 * (1 - k));
      if (k < 1) g.person({ look: 'cocuk', x: 960, y: 1000, s: 1.6, expr: 'sad', alpha: 1 - k });
      if (k > 0) g.person({ look: 'yeniceri', x: 960, y: 1000, s: 1.2 + k * 0.5, expr: 'determined', alpha: k, prop: 'sword' });
      if (g.t > T0 - 0.2 && g.t < T0 + 1.2) g.fx('sparkle', { x: 960, y: 640 });
      g.label('DEVŞİRME → ACEMİ OCAĞI → YENİÇERİ', 960, 160, { at: g.L(1) + 0.5, small: true });
    }
  },
});
shot({
  id: 'y2', mood: 'march', seg: 8,
  lines: [L('Kurallar serttir: Evlenemezsin, sakal bırakamazsın; sadece bıyık serbesttir.'),
    L('Maaşın olan ulufe üç ayda bir ödenir. Ocak senin evin, silah arkadaşların ise ailendir.')],
  sfx: [['tick', 1.0], ['tick', 2.4], ['tick', 3.8], ['coins', 'L1+0.4']],
  draw(g) {
    g.bg('parchment');
    g.person({ look: 'yeniceri', x: 480, y: 960, s: 1.7, expr: g.li ? 'happy' : 'neutral' });
    g.factList(1180, 300, [
      ['x', 'Evlenmek yasak', 0.9], ['x', 'Sakal yasak', 2.3], ['ok', 'Bıyık serbest', 3.7], ['coin', 'Ulufe: 3 ayda bir', g.L(1) + 0.3],
    ]);
  },
});
shot({
  id: 'y3', mood: 'march', seg: 8,
  lines: [L('29 Mayıs sabahına doğru, başıbozuklar ve Anadolu askerleri savunucuları yormuştur. Sıra artık sizdedir.', 'Yirmi dokuz Mayıs sabahına doğru, başıbozuklar ve Anadolu askerleri savunucuları yormuştur. Sıra artık sizdedir.'),
    L('Mehter çalarken, padişahın gözü önünde, düzenli saflar halinde surlara yürürsünüz.')],
  sfx: [['drumroll', 'L1+0.0']],
  draw(g) {
    g.cam(960, 560, 1.0, 1040, 540, 1.08);
    g.bg('walls', { time: 'dawn', damage: 2, defenders: true });
    g.date('29 MAYIS 1453', 'ŞAFAK', { at: 0.3 });
    g.crowd({ look: 'yeniceri', x0: -60, x1: 2000, y: 1010, rows: 3, n: 22, s: 0.58, act: g.li ? 'march' : 'idle', flags: true });
    g.person({ look: 'mehter', x: 260, y: 1050, s: 1.25, act: 'drum', expr: 'determined', prop: 'davul' });
    g.person({ look: 'yeniceri', x: 820, y: 1060, s: 1.35, expr: 'determined', act: g.li ? 'march' : 'idle', prop: 'sword' });
  },
});
shot({
  id: 'y4', mood: 'march', seg: 8,
  lines: [L('Tam o sırada savunmanın komutanı Giustiniani ağır yaralanır ve geri çekilir. Savunma çözülmeye başlar.', 'Tam o sırada savunmanın komutanı Custinyani ağır yaralanır ve geri çekilir. Savunma çözülmeye başlar.')],
  sfx: [['arrow_hit', 2.2]],
  draw(g) {
    g.bg('walls', { time: 'dawn', close: true, defendersClose: true });
    const hit = 2.2;
    const gx = 960 - Math.max(0, g.t - hit - 1.2) * 160;
    g.person({ look: 'giustiniani', x: gx, y: 450, s: 1.1, expr: g.t > hit ? 'shocked' : 'determined', act: g.t > hit ? 'shake' : 'idle', noLegs: true, prop: 'sword', clipBelow: 296, rot: g.t > hit ? -0.12 : 0 });
    if (g.t > hit) g.fx('arrowhit', { x: gx + 40, y: 230, at: hit });
    g.label('GIUSTINIANI', 960, 120, { at: 0.6, small: true });
  },
});
shot({
  id: 'y5', mood: 'march', seg: 8,
  lines: [L('Ulubatlı Hasan adında dev yapılı bir yeniçeri, sancağı surların üstüne diker ve oklarla şehit düşer.')],
  sfx: [['flag', 3.0], ['arrows', 4.0]],
  draw(g) {
    g.cam(960, 600, 1.0, 960, 480, 1.1);
    g.bg('walls', { time: 'dawn', damage: 2, flagTower: Math.max(0, Math.min(1, (g.t - 3.0) / 1.2)) });
    const fall = Math.max(0, g.t - 5.4);
    g.person({ look: 'hasan', x: 1180 + fall * 40, y: 1010 - Math.min(1, g.t / 3.0) * 600 + fall * fall * 120, s: 1.05, expr: g.t > 4.6 ? 'shocked' : 'determined', act: g.t < 3 ? 'climb' : (g.t < 4.6 ? 'cheer' : 'shake'), prop: g.t < 3 ? 'flag' : null, rot: Math.min(1.4, fall * 1.2), alpha: 1 - Math.min(1, fall / 1.6) });
    if (g.t > 4) g.fx('arrows', { dens: 0.6 });
    g.label('ULUBATLI HASAN', 700, 230, { at: 0.8 });
  },
});
shot({
  id: 'y6', mood: 'march', seg: 8,
  lines: [L('Sancağı gören binlerce yeniçeri gediklerden içeri akar. Bin yıllık surlar sonunda aşılmıştır.')],
  sfx: [['crowd', 0.2]],
  draw(g) {
    g.cam(960, 540, 1.05, 960, 540, 1.0);
    g.bg('walls', { time: 'sunrise', damage: 3, ottomanFlags: true });
    g.crowd({ look: 'yeniceri', x0: -60, x1: 2000, y: 1010, rows: 3, n: 24, s: 0.55, act: 'charge', flags: true });
    g.person({ look: 'yeniceri', x: 760, y: 1060, s: 1.4, expr: 'happy', act: 'cheer', prop: 'sword' });
  },
});
stats(8, { maas: 'Ulufe (3 ayda bir)', kazanc: 6, konfor: 5, tehlike: 8, hayat: 4 },
  [L('Yeniçeri olarak tehlike çok yüksek. Ama surlara ilk çıkanlara söz verilen ödüller, seni bir gecede zengin edebilir.')], 'march', 'determined');

// ───────────────────────────── 9. VEZİR ─────────────────────────────
card(9, 'Kılıçtan daha tehlikeli bir silah: siyaset.', 'intrigue');
shot({
  id: 'v1', mood: 'intrigue', seg: 9,
  lines: [L('Artık savaş alanında değiliz; padişahın çadırındayız. Sen bir vezirsin.'),
    L('Altın işlemeli kaftanlar, en güzel yemekler, yüzlerce hizmetkâr… Kulağa harika geliyor, değil mi?')],
  draw(g) {
    g.bg('divan');
    g.tray(1260, 930);
    g.person({ look: 'vezir', x: 820, y: 960, s: 1.6, expr: g.li ? 'happy' : 'smug', act: 'idle' });
    if (g.li) g.fx('sparkle', { x: 820, y: 620 });
  },
});
shot({
  id: 'v2', mood: 'intrigue', seg: 9,
  lines: [L('Ama divanda iki taraf var. Sadrazam Çandarlı Halil Paşa kuşatmanın kaldırılmasını istiyor; Zağanos Paşa ise sonuna kadar savaşmayı.'),
    L('Kuşatmanın sonlarına doğru toplanan savaş meclisinde, Zağanos Paşa’nın görüşü kazanır.', 'Kuşatmanın sonlarına doğru toplanan savaş meclisinde, Zağanos Paşanın görüşü kazanır.')],
  sfx: [['stamp', 'L1+2.2']],
  draw(g) {
    g.bg('divan');
    const won = g.t > g.L(1) + 2.2;
    g.person({ look: 'halil', x: 470, y: 960, s: 1.45, expr: won ? 'sad' : 'neutral' });
    g.person({ look: 'zaganos', x: 1450, y: 960, s: 1.45, expr: won ? 'smug' : 'angry', prop: 'sword' });
    g.person({ look: 'vezir', x: 960, y: 1010, s: 1.1, expr: 'neutral', lookAt: g.t < 3.5 ? -1 : (g.t < 7 ? 1 : 0) });
    g.label('ÇANDARLI HALİL: BARIŞ', 470, 400, { at: 1.0, small: true });
    g.label('ZAĞANOS: SAVAŞ', 1450, 400, { at: 4.2, small: true });
    if (won) g.stamp('KAZANDI', 1450, 640, { at: g.L(1) + 2.2 });
  },
});
shot({
  id: 'v3', mood: 'intrigue', seg: 9,
  lines: [L('Halil Paşa’nın Bizanslılardan rüşvet aldığı bile söylenir. Rivayete göre ona içi altın dolu balıklar gönderilmiştir.', 'Halil Paşanın Bizanslılardan rüşvet aldığı bile söylenir. Rivayete göre ona içi altın dolu balıklar gönderilmiştir.')],
  sfx: [['coins', 4.4]],
  draw(g) {
    g.bg('divan');
    g.person({ look: 'halil', x: 600, y: 960, s: 1.5, expr: 'scared', act: 'shake' });
    g.fish(1300, 700, { at: 3.6 });
    g.label('RİVAYET', 1300, 380, { at: 3.6, small: true });
  },
});
shot({
  id: 'v4', mood: 'intrigue', seg: 9,
  lines: [L('Şehir alındıktan kısa bir süre sonra Çandarlı Halil Paşa tutuklanır ve idam edilir. O, idam edilen ilk Osmanlı sadrazamıdır.')],
  sfx: [['gong', 3.4]],
  draw(g) {
    g.bg('dark');
    g.person({ look: 'halil', x: 960, y: 980, s: 1.6, expr: 'sad', alpha: 1 - Math.max(0, (g.t - 4) / 3) * 0.75 });
    g.vignette('#5a0000', 0.6);
    g.banner('İDAM EDİLEN İLK SADRAZAM', { at: 3.4, y: 170 });
  },
});
stats(9, { maas: 'Çok yüksek', kazanc: 9, konfor: 9, tehlike: 7, hayat: 5 },
  [L('Vezir olarak konforun çok yüksek. Ama burada seni bir ok değil, yanlış verdiğin tek bir tavsiye öldürebilir.')], 'intrigue', 'scared');

// ──────────────────────────── 10. PADİŞAH ────────────────────────────
card(10, '21 yaşında bir imparatorluğun yükü.', 'majestic');
shot({
  id: 'p1', mood: 'majestic', seg: 10,
  lines: [L('Ve son rütbe: Sen padişahsın. Sultan II. Mehmed. Henüz 21 yaşındasın.', 'Ve son rütbe: Sen padişahsın. Sultan İkinci Mehmed. Henüz yirmi bir yaşındasın.')],
  draw(g) {
    g.bg('camp', { time: 'day', otag: true });
    g.person({ look: 'padisah', x: 960, y: 1000, s: 1.75, expr: 'determined', enter: 'pop' });
    g.label('SULTAN II. MEHMED', 1480, 420, { at: 1.6 });
    g.label('21 YAŞINDA', 1480, 540, { at: 2.6, tilt: -3 });
  },
});
shot({
  id: 'p2', mood: 'majestic', seg: 10,
  lines: [L('Bu kuşatma için bir yıl önce Boğaz’a Rumeli Hisarı’nı yaptırdın; hem de yaklaşık dört ay gibi kısa bir sürede.', 'Bu kuşatma için bir yıl önce Boğaza Rumeli Hisarını yaptırdın; hem de yaklaşık dört ay gibi kısa bir sürede.')],
  draw(g) {
    g.bg('bosphorus', { build: Math.min(1, g.p * 1.3) });
    g.label('RUMELİ HİSARI • 1452', 960, 140, { at: 0.8 });
  },
});
shot({
  id: 'p3', mood: 'majestic', seg: 10,
  lines: [L('Geceleri uyuyamıyorsun. Surların planlarını çiziyor, topların yerini bizzat sen seçiyorsun.'),
    L('Başarısız olursan sadece bir şehri değil, belki de tahtını kaybedeceksin. Çünkü yeniçeriler daha önce de sana karşı ayaklanmıştı.')],
  draw(g) {
    g.bg('tentnight');
    g.planTable(1250, 900);
    g.person({ look: 'padisah', x: 760, y: 980, s: 1.55, expr: g.li ? 'scared' : 'tired', act: g.li ? 'idle' : 'write' });
    if (g.li) g.thought(1250, 380, 'angry', { at: g.L(1) + 2.0 });
  },
});
shot({
  id: 'p4', mood: 'majestic', seg: 10,
  lines: [L('Ve 29 Mayıs öğleden sonra, atının üzerinde şehre giriyorsun.', 'Ve yirmi dokuz Mayıs öğleden sonra, atının üzerinde şehre giriyorsun.')],
  sfx: [['crowd', 0.3]],
  draw(g) {
    g.bg('walls', { time: 'day', damage: 3, ottomanFlags: true, gate: true });
    g.crowd({ look: 'yeniceri', x0: -60, x1: 2000, y: 1040, rows: 1, n: 16, s: 0.55, act: 'cheer' });
    g.horse(300 + g.p * 900, 1000, 1.05, { rider: 'padisah', act: 'walk', expr: 'smug', white: true });
  },
});
shot({
  id: 'p5', mood: 'majestic', seg: 10,
  lines: [L('Doğruca Ayasofya’ya gidiyorsun. O gün bir çağ kapanıyor, yeni bir çağ açılıyor.', 'Doğruca Ayasofyaya gidiyorsun. O gün bir çağ kapanıyor, yeni bir çağ açılıyor.')],
  draw(g) {
    g.cam(960, 520, 1.12, 960, 560, 1.0);
    g.bg('city', { time: 'golden' });
    g.horse(700, 1010, 0.7, { rider: 'padisah', act: 'idle', expr: 'happy', white: true });
  },
});
shot({
  id: 'p6', mood: 'majestic', seg: 10, tail: 1.2,
  lines: [L('Artık sana sadece Sultan Mehmed denmeyecek. Tarih seni Fatih olarak hatırlayacak.')],
  sfx: [['taiko', 3.0]],
  draw(g) {
    g.bg('city', { time: 'dusk' });
    g.person({ look: 'padisah', x: 520, y: 1000, s: 1.6, expr: 'smug' });
    g.bigTitle('FATİH', 1300, 560, { at: 3.0 });
  },
});
stats(10, { maas: 'Hazinenin sahibi', kazanc: 10, konfor: 10, tehlike: 5, hayat: 8 },
  [L('Padişah olarak her şeye sahipsin. Ama bu zafer, yirmi bir yaşındaki omuzlarına koca bir imparatorluğun yükünü bıraktı.')], 'majestic', 'determined');

// ─────────────────────────────── KAPANIŞ ───────────────────────────────
shot({
  id: 'o1', mood: 'light', seg: 11,
  lines: [L('Peki sen hangisi olmak isterdin? Ganimet peşindeki başıbozuk mu, kazanın başındaki aşçı mı, yoksa tarihi değiştiren padişah mı?'),
    L('Cevabını yorumlara yaz.')],
  draw(g) { g.bg('parchment'); g.lineup(RANKS, { mode: 'outro' }); },
});
shot({
  id: 'o2', mood: 'light', seg: 11, tail: 3.0,
  lines: [L('Videoyu beğendiysen abone olmayı unutma. Bir sonraki zaman kırığında görüşmek üzere!')],
  sfx: [['click', 1.2]],
  draw(g) { g.endCard(); },
});

module.exports = { shots: S, RANKS };
