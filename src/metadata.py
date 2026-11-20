"""YouTube metni (başlık, açıklama + bölümler, etiketler) ve okunabilir senaryo üretir."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build")
OUT = os.path.join(ROOT, "output")
os.makedirs(OUT, exist_ok=True)

RANKS = ["Başıbozuk", "Aşçı (Karakullukçu)", "Lağımcı", "Kürekçi (Azap)", "Topçu", "Akıncı",
         "Tımarlı Sipahi", "Yeniçeri", "Vezir", "Padişah"]

tl = json.load(open(os.path.join(BUILD, "timeline.json"), encoding="utf-8"))
shots = json.load(open(os.path.join(BUILD, "shots.json"), encoding="utf-8"))


def ts(t):
    t = int(t)
    return f"{t // 60}:{t % 60:02d}"


chapters = [("0:00", "Giriş: 29 Mayıs 1453")]
for s in tl["shots"]:
    if s["kind"] == "card":
        n = int(s["id"][1:])
        chapters.append((ts(s["start"]), f"{n}. Rütbe: {RANKS[n - 1]}"))
    if s["id"] == "o1":
        chapters.append((ts(s["start"]), "Sen hangisi olurdun?"))

title = "1453'te Osmanlı Ordusunda Her Rütbede Hayatın: Başıbozuktan Padişaha"
alt_titles = [
    "1453 İstanbul Kuşatmasında Osmanlı Askeri Olsaydın?",
    "Fetih Ordusunda Her Rütbede Hayat: Lağımcıdan Yeniçeriye, Aşçıdan Padişaha",
]
desc = f"""29 Mayıs 1453... 53 gündür süren kuşatmanın son gecesi. Peki sen bu ordunun içinde olsaydın, hayatın nasıl olurdu?

Bu videoda Osmanlı ordusundaki 10 farklı rütbe ve görevi en alttan en üste inceliyoruz: ganimet peşindeki başıbozuktan yeniçeri ocağının mutfağındaki aşçıya, surların altında tünel kazan lağımcıdan gemileri karadan yürüten kürekçiye, dev Şahi topunun başındaki topçudan 21 yaşındaki Sultan II. Mehmed'e kadar.

⏳ Bölümler
""" + "\n".join(f"{a} {b}" for a, b in chapters) + """

📚 Not: Sayılar ve bazı ayrıntılar (ordunun büyüklüğü, top güllelerinin ağırlığı, tünel sayısı vb.) kaynaklara göre değişir; videoda yaygın kabul gören değerler kullanılmıştır. "Balık içinde altın" hikâyesi bir rivayettir.
Kaynak önerileri: Kritovulos, Dukas, Nicolò Barbaro'nun kuşatma günlüğü, Tursun Bey; Steven Runciman – Konstantinopolis'in Düşüşü 1453; Halil İnalcık – Fatih Devri Üzerinde Tetkikler ve Vesikalar.

Sen hangi rütbede olmak isterdin? Yorumlara yaz! 👇
Abone olmayı ve bildirimleri açmayı unutma. Bir sonraki zaman kırığında görüşmek üzere!

#1453 #İstanbulunFethi #FatihSultanMehmed #Yeniçeri #OsmanlıTarihi
"""
tags = ["1453", "istanbulun fethi", "fatih sultan mehmed", "osmanlı ordusu", "yeniçeri", "akıncı", "tımarlı sipahi",
        "lağımcı", "topçu", "şahi topu", "ulubatlı hasan", "çandarlı halil paşa", "zağanos paşa", "başıbozuk",
        "gemilerin karadan yürütülmesi", "haliç zinciri", "rumeli hisarı", "osmanlı tarihi", "tarih animasyon",
        "her rütbede hayat", "osmanlı askeri olsaydın", "zaman kırığı"]

with open(os.path.join(OUT, "youtube.md"), "w", encoding="utf-8") as f:
    f.write(f"# YouTube metinleri\n\n## Başlık\n{title}\n\nAlternatifler:\n" + "\n".join(f"- {a}" for a in alt_titles))
    f.write(f"\n\n## Açıklama (kopyala-yapıştır)\n\n```\n{desc}```\n\n## Etiketler\n{', '.join(tags)}\n")
    f.write(f"\n## Video süresi\n{ts(tl['total'])}\n\n## Dosyalar\n- 1453_osmanli_ordusu.mp4 — final video (1920x1080, 30 fps)\n- kapak.png — kapak görseli (1280x720)\n- altyazi.srt — Türkçe altyazı (YouTube'a 'Altyazı yükle' ile eklenebilir)\n- muzik_efekt_anlatimsiz.wav — anlatımsız müzik+efekt kanalı (videoyu kendi sesinle seslendirmek istersen)\n- senaryo.md — tam senaryo (zaman damgalı)\n")

seg_names = {0: "GİRİŞ", 11: "KAPANIŞ"}
with open(os.path.join(OUT, "senaryo.md"), "w", encoding="utf-8") as f:
    f.write(f"# {title}\n\nToplam süre: {ts(tl['total'])}\n")
    cur = None
    for s, sh in zip(tl["shots"], shots):
        seg = s["seg"]
        if seg != cur:
            cur = seg
            name = seg_names.get(seg) or f"{seg}. RÜTBE — {RANKS[seg - 1].upper()}"
            f.write(f"\n## {name}\n\n")
        for ln in s["lines"]:
            f.write(f"**[{ts(s['start'] + ln['start'])}]** {ln['text']}\n\n")
print("youtube.md + senaryo.md yazıldı")
for a, b in chapters:
    print(a, b)
