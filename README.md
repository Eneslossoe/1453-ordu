# 1453'te Osmanlı Ordusunda Her Rütbede Hayatın: Başıbozuktan Padişaha

**Zaman Kırığı** kanalı için kodla üretilmiş, ~10,5 dakikalık animasyonlu tarih videosu.
Format: "her rütbede hayatın" — izleyici ikinci tekil şahısla ("sen") 10 farklı rütbe/görevde 1453 kuşatmasını yaşar.

| # | Rütbe / Görev | Konu |
|---|---|---|
| 1 | Başıbozuk | Maaşsız gönüllüler, son saldırının ilk dalgası, arkadaki çavuşlar |
| 2 | Aşçı (Karakullukçu) | Yeniçeri mutfağı, kutsal kazan, "Çorbacı" rütbesi, kamptaki dev ateşler |
| 3 | Lağımcı | Novoberde madencileri, Johannes Grant'in karşı tünelleri |
| 4 | Kürekçi (Azap) | Haliç zinciri, 20 Nisan deniz savaşı, gemilerin karadan yürütülmesi |
| 5 | Topçu | Usta Urban, Şahi topu, sıcak yağ, haftalar süren bombardıman |
| 6 | Akıncı | Maaşsız ama vergisiz süvari, Turahan Bey'in Mora seferi |
| 7 | Tımarlı Sipahi | Tımar sistemi, cebelüler, Rumeli/Anadolu birliklerinin konumu |
| 8 | Yeniçeri | Devşirme, ocak kuralları, Giustiniani'nin yaralanması, Ulubatlı Hasan |
| 9 | Vezir | Çandarlı Halil – Zağanos Paşa çekişmesi, "balık içinde altın" rivayeti |
| 10 | Padişah | 21 yaşındaki II. Mehmed, Rumeli Hisarı, şehre giriş, Fatih unvanı |

## Çıktılar (`output/`)
- `1453_osmanli_ordusu.mp4` — final video (1920×1080, 30 fps, -14 LUFS)
- `kapak.png` — YouTube kapak görseli (1280×720)
- `altyazi.srt` — Türkçe altyazı
- `muzik_efekt_anlatimsiz.wav` — anlatımsız müzik + efekt kanalı (kendi sesinle seslendirmek için)
- `youtube.md` — başlık, açıklama (bölüm zaman damgalı), etiketler
- `senaryo.md` — zaman damgalı tam senaryo

## Nasıl üretiliyor?
Hiçbir hazır görsel/ses kullanılmadı; her şey kodla üretilir:

1. **Senaryo + sahneler** — `src/script.js`: her sahnenin cümleleri ve çizim talimatları.
2. **Seslendirme** — `src/tts.py`: Türkçe [Piper](https://github.com/rhasspy/piper) sesi (`tr_TR-fahrettin-medium`), cümle bazlı zamanlama ve SRT.
3. **Müzik + efekt** — `src/audio.py`: Hicaz makamında ud (Karplus-Strong), ney, davul/def ritimleri, dron; top, kılıç, ok, dalga, para vb. efektler; konuşma sırasında otomatik müzik kısma.
4. **Animasyon** — `src/render.js` + `src/lib/*`: `@napi-rs/canvas` ile kare kare çizim (karakterler, surlar, ordugâh, tünel, deniz, haritalar, kartlar), ffmpeg ile H.264.
5. **Kapak** — `src/thumbnail.js`, **YouTube metni** — `src/metadata.py`.

```bash
npm install
pip install piper-tts numpy scipy
./build.sh            # her şeyi baştan üretir → output/
# Farklı ses:  VOICE=dfki ./build.sh   (fahrettin | fettah | dfki)
# Tek sahne önizleme: node src/render.js --preview build/preview --only b3,t4 --times 0.3,0.8
```

Senaryoyu değiştirmek için `src/script.js` içindeki cümleleri düzenleyip `./build.sh` çalıştırman yeterli; sahne süreleri seslendirmeye göre otomatik ayarlanır.
