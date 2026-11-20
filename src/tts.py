"""Seslendirme + zaman çizelgesi + altyazı.

build/shots.json'u okur, her cümleyi Piper (Türkçe) ile seslendirir,
sahne/cümle zamanlarını hesaplar ve şunları yazar:
  build/timeline.json   (render ve miks için)
  build/narration.wav   (yalnız anlatım)
  build/altyazi.srt     (YouTube'a yüklenebilir altyazı)
"""
import hashlib
import json
import os
import re
import sys
import wave

import numpy as np
from piper import PiperVoice, SynthesisConfig

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.environ.get("BUILD_DIR") or os.path.join(ROOT, "build")
VOICES = os.path.join(ROOT, "build", "voices")
VOICE = os.environ.get("VOICE", "fahrettin")
LENGTH_SCALE = float(os.environ.get("LENGTH_SCALE", "1.06"))
SR_OUT = 44100
GAP = float(os.environ.get("GAP", "0.30"))  # aynı sahnedeki cümleler arası sessizlik
FPS = 30


def load_voice():
    d = os.path.join(VOICES, f"vits-piper-tr_TR-{VOICE}-medium")
    return PiperVoice.load(os.path.join(d, f"tr_TR-{VOICE}-medium.onnx"))


def synth(voice, text):
    cache_dir = os.path.join(ROOT, "build", "tts_cache")
    os.makedirs(cache_dir, exist_ok=True)
    key = hashlib.sha1(f"{VOICE}|{LENGTH_SCALE}|{text}".encode()).hexdigest()[:16]
    path = os.path.join(cache_dir, key + ".npy")
    if os.path.exists(path):
        return np.load(path)
    cfg = SynthesisConfig(length_scale=LENGTH_SCALE, noise_scale=0.6, noise_w_scale=0.75)
    parts, sr = [], 22050
    for ch in voice.synthesize(text, syn_config=cfg):
        sr = ch.sample_rate
        parts.append(ch.audio_int16_array.astype(np.float32) / 32768.0)
        parts.append(np.zeros(int(0.18 * sr), np.float32))  # cümleler arası kısa nefes
    a = np.concatenate(parts) if parts else np.zeros(1, np.float32)
    # baştaki/sondaki sessizliği kırp
    env = np.abs(a) > 0.01
    if env.any():
        i0 = max(0, np.argmax(env) - int(0.02 * sr))
        i1 = min(len(a), len(a) - np.argmax(env[::-1]) + int(0.06 * sr))
        a = a[i0:i1]
    # 44.1 kHz'e yeniden örnekle (doğrusal enterpolasyon yeterli)
    n_out = int(len(a) * SR_OUT / sr)
    a = np.interp(np.linspace(0, len(a) - 1, n_out), np.arange(len(a)), a).astype(np.float32)
    np.save(path, a)
    return a


def split_sub(text, maxlen=int(os.environ.get("SUB_MAX", "44"))):
    """Bir cümleyi ekrana sığacak altyazı parçalarına böl (her parça en fazla 2 satır)."""
    words = text.split()
    chunks, cur = [], ""
    for w in words:
        if len(cur) + len(w) + 1 > maxlen * 2 and cur:
            chunks.append(cur)
            cur = w
        else:
            cur = (cur + " " + w).strip()
        if re.search(r"[.!?;:]$", w) and len(cur) > maxlen * 0.9:
            chunks.append(cur)
            cur = ""
    if cur:
        chunks.append(cur)
    return chunks


def wrap2(text, maxlen=44):
    if len(text) <= maxlen:
        return [text]
    words = text.split()
    best, bi = 1e9, 1
    for i in range(1, len(words)):
        a, b = " ".join(words[:i]), " ".join(words[i:])
        score = max(len(a), len(b))
        if score < best:
            best, bi = score, i
    return [" ".join(words[:bi]), " ".join(words[bi:])]


def srt_time(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def main():
    shots = json.load(open(os.path.join(BUILD, "shots.json"), encoding="utf-8"))
    voice = load_voice()
    t = 0.0
    timeline = {"fps": FPS, "shots": [], "subs": []}
    clips = []
    total_lines = sum(len(s["lines"]) for s in shots)
    done = 0
    for s in shots:
        start = t
        cur = start + s["lead"]
        lines = []
        for i, ln in enumerate(s["lines"]):
            audio = synth(voice, ln["s"])
            done += 1
            sys.stdout.write(f"\r  seslendirme {done}/{total_lines}")
            sys.stdout.flush()
            dur = len(audio) / SR_OUT
            lines.append({"start": round(cur - start, 3), "end": round(cur - start + dur, 3), "text": ln["t"]})
            clips.append((cur, audio))
            # altyazı parçaları: karakter sayısına göre orantılı zaman
            chunks = split_sub(ln["t"])
            tot = sum(len(c) for c in chunks)
            c0 = cur
            for c in chunks:
                cd = dur * len(c) / tot
                timeline["subs"].append({"start": round(c0, 3), "end": round(c0 + cd, 3), "lines": wrap2(c)})
                c0 += cd
            cur += dur + (GAP if i < len(s["lines"]) - 1 else 0)
        end = max(cur + s["tail"], start + s["minDur"])
        # kareye hizala
        end = round(end * FPS) / FPS
        timeline["shots"].append({"id": s["id"], "kind": s["kind"], "seg": s["seg"], "mood": s["mood"],
                                  "start": round(start, 4), "end": round(end, 4), "lines": lines, "sfx": s["sfx"]})
        t = end
    print()
    timeline["total"] = round(t, 4)
    timeline["frames"] = int(round(t * FPS))
    json.dump(timeline, open(os.path.join(BUILD, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    buf = np.zeros(int((t + 1) * SR_OUT), np.float32)
    for st, a in clips:
        i = int(st * SR_OUT)
        buf[i:i + len(a)] += a
    peak = np.max(np.abs(buf)) or 1
    buf = buf / peak * 0.89
    with wave.open(os.path.join(BUILD, "narration.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR_OUT)
        w.writeframes((buf * 32767).astype(np.int16).tobytes())

    with open(os.path.join(BUILD, "altyazi.srt"), "w", encoding="utf-8") as f:
        for i, sb in enumerate(timeline["subs"], 1):
            f.write(f"{i}\n{srt_time(sb['start'])} --> {srt_time(sb['end'])}\n" + "\n".join(sb["lines"]) + "\n\n")
    m, sec = divmod(t, 60)
    print(f"Toplam süre: {int(m)} dk {sec:.1f} sn, {len(timeline['shots'])} sahne")


if __name__ == "__main__":
    main()
