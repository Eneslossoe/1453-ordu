#!/usr/bin/env bash
# Tüm üretim hattı: senaryo → ses → müzik → görüntü → final MP4
set -euo pipefail
cd "$(dirname "$0")"
VOICE=${VOICE:-fahrettin}
mkdir -p build/voices output
# 1) Türkçe Piper ses modeli (ilk çalıştırmada indirilir)
if [ ! -d "build/voices/vits-piper-tr_TR-$VOICE-medium" ]; then
  curl -L -o /tmp/voice.tar.bz2 "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-tr_TR-$VOICE-medium.tar.bz2"
  tar xjf /tmp/voice.tar.bz2 -C build/voices && rm /tmp/voice.tar.bz2
fi
# 2) senaryo → JSON, seslendirme + zaman çizelgesi + altyazı
node src/export.js
VOICE=$VOICE python3 src/tts.py
# 3) müzik + efekt + miks
python3 src/audio.py
# 4) görüntü (paralel parçalar)
FRAMES=$(python3 -c "import json;print(json.load(open('build/timeline.json'))['frames'])")
JOBS=${JOBS:-4}
CHUNK=$(( (FRAMES + JOBS - 1) / JOBS ))
rm -f build/parts.txt
for i in $(seq 0 $((JOBS-1))); do
  FROM=$((i*CHUNK)); TO=$(( (i+1)*CHUNK )); [ $TO -gt $FRAMES ] && TO=$FRAMES
  node src/render.js --out build/part$i.mp4 --from $FROM --to $TO --crf ${CRF:-21} &
  echo "file 'part$i.mp4'" >> build/parts.txt
done
wait
# 5) birleştir + ses + loudness (-14 LUFS, YouTube)
ffmpeg -y -loglevel error -f concat -safe 0 -i build/parts.txt -i build/mix.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 44100 -movflags +faststart -shortest output/1453_osmanli_ordusu.mp4
cp build/altyazi.srt output/altyazi.srt
cp build/muzik_efekt.wav output/muzik_efekt_anlatimsiz.wav
echo "Bitti: output/1453_osmanli_ordusu.mp4"
