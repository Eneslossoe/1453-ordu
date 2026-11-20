#!/usr/bin/env bash
# Dikey Reels/Shorts (≤60 sn): src/reels/script.js → output/1453_reels.mp4
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p build/reels output
node src/export.js src/reels/script.js build/reels
BUILD_DIR=build/reels LENGTH_SCALE=1.0 GAP=0.2 SUB_MAX=18 python3 src/tts.py
BUILD_DIR=build/reels python3 src/audio.py
FR=$(python3 -c "import json;print(json.load(open('build/reels/timeline.json'))['frames'])")
C=$(( (FR + 2) / 3 ))
node src/reels/render.js --out build/reels/p0.mp4 --from 0 --to $C &
node src/reels/render.js --out build/reels/p1.mp4 --from $C --to $((2*C)) &
node src/reels/render.js --out build/reels/p2.mp4 --from $((2*C)) --to $FR &
wait
printf "file 'p0.mp4'\nfile 'p1.mp4'\nfile 'p2.mp4'\n" > build/reels/parts.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i build/reels/parts.txt -i build/reels/mix.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 44100 -movflags +faststart -shortest output/1453_reels.mp4
ffmpeg -loglevel error -y -ss 2.2 -i output/1453_reels.mp4 -frames:v 1 output/reels_kapak.png
echo "Bitti: output/1453_reels.mp4"
