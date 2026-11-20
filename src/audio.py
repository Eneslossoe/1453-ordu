"""Prosedürel müzik + ses efektleri + final miks.

Müzik: Hicaz makamında (Re) ud benzeri (Karplus-Strong) tınılar, ney benzeri nefesli,
davul/def ritimleri ve dron. Her sahnenin "mood" değerine göre değişir.
Anlatım konuşurken müzik otomatik kısılır (ducking).
Çıktı: build/mix.wav (44.1 kHz stereo)
"""
import json
import os
import wave
from functools import lru_cache

import numpy as np
from scipy.signal import butter, lfilter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.environ.get("BUILD_DIR") or os.path.join(ROOT, "build")
SR = 44100
RNG = np.random.default_rng(1453)

# Hicaz (Re): D Eb F# G A Bb C D
HICAZ = [0, 1, 4, 5, 7, 8, 10, 12]
D3 = 146.83


def hz(deg, octave=0, root=D3):
    o, d = divmod(deg, len(HICAZ) - 1)
    return root * 2 ** ((HICAZ[d] + 12 * (o + octave)) / 12)


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc / (SR / 2), "low", output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc / (SR / 2), "high", output="sos"), x)


def bp(x, f1, f2, order=2):
    return sosfilt(butter(order, [f1 / (SR / 2), f2 / (SR / 2)], "band", output="sos"), x)


def env_exp(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def tt(d):
    return np.arange(int(d * SR)) / SR


# ── enstrümanlar ──
def pluck(f, dur=1.2, bright=0.5, amp=1.0):
    return _pluck(round(f, 2), round(dur, 2), round(bright, 2)) * amp


@lru_cache(maxsize=None)
def _pluck(f, dur, bright, amp=1.0):
    """Karplus-Strong (ud benzeri)."""
    rng = np.random.default_rng(int(f * 100))
    n = int(dur * SR)
    p = max(2, int(SR / f))
    buf = (rng.random(p) * 2 - 1) * amp
    buf = lp(buf, 1500 + 5000 * bright, 1) if p > 8 else buf
    out = np.zeros(n)
    b = buf.copy()
    decay = 0.996
    idx = 0
    for i in range(n):
        out[i] = b[idx]
        nxt = (idx + 1) % p
        b[idx] = decay * 0.5 * (b[idx] + b[nxt])
        idx = nxt
    out *= np.minimum(1, np.arange(n) / (0.002 * SR))
    return out


def ney(f, dur, amp=1.0):
    t = tt(dur)
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.4)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    tone = np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
    breath = bp(RNG.standard_normal(len(t)), f * 0.8, min(f * 4, 9000)) * 0.35
    a = np.minimum(1, t / 0.18) * np.minimum(1, (dur - t) / 0.3)
    return (tone + breath) * np.clip(a, 0, 1) * amp


def reed(f, dur, amp=1.0):
    t = tt(dur)
    vib = 1 + 0.01 * np.sin(2 * np.pi * 6 * t) * np.minimum(1, t / 0.3)
    ph = np.cumsum(f * vib) / SR
    saw = 2 * (ph % 1) - 1
    x = bp(saw, f * 0.9, 3200) + 0.3 * bp(saw, 1100, 1500)
    a = np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.12)
    return x * np.clip(a, 0, 1) * amp


def dum(amp=1.0):
    t = tt(0.7)
    f = 48 + 90 * np.exp(-t / 0.04)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    x += lp(RNG.standard_normal(len(t)), 900) * np.exp(-t / 0.02) * 0.5
    return x * amp


def tek(amp=1.0):
    t = tt(0.25)
    x = bp(RNG.standard_normal(len(t)), 1500, 5000) * np.exp(-t / 0.035)
    x += np.sin(2 * np.pi * 330 * t) * np.exp(-t / 0.05) * 0.4
    return x * amp


def zil(amp=1.0):
    t = tt(2.0)
    return hp(RNG.standard_normal(len(t)), 5000) * np.exp(-t / 0.5) * amp


def drone(dur, root=73.42, dark=False, amp=1.0):
    t = tt(dur)
    x = np.zeros(len(t))
    freqs = [root, root * 1.5, root * 2, root * 2.003] + ([root * 2 ** (1 / 12) * 2] if dark else [])
    for i, f in enumerate(freqs):
        ph = 2 * np.pi * f * t + i
        x += (np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)) * (0.6 if dark and i == 4 else 1)
    x = lp(x, 900 if not dark else 500)
    lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.07 * t + 1.3)
    return x * lfo * amp / len(freqs)


def place(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf) or i + len(x) <= 0:
        return
    if i < 0:
        x = x[-i:]
        i = 0
    n = min(len(x), len(buf) - i)
    buf[i:i + n] += x[:n] * gain


MOODS = {
    #           bpm  dron  drum-desen                       ud      ney    reed  zil
    "epic":     (88, 0.9, "D...t.D.D...t.t.", "arp", 0.0, 0.0, 16),
    "tense":    (100, 0.8, "D.t.D.t.D.t.Dttt", "stac", 0.0, 0.0, 0),
    "light":    (104, 0.5, "..t...t...t..tt.", "melody", 0.35, 0.0, 0),
    "dark":     (60, 1.1, "D...............", None, 0.5, 0.0, 0),
    "row":      (80, 0.7, "D.......t.......", "arp", 0.0, 0.0, 0),
    "war":      (96, 0.9, "D..tD.t.D..tD.tt", "stac", 0.0, 0.0, 16),
    "gallop":   (138, 0.6, "t.tDt.tDt.tDt.tD", "arp", 0.0, 0.0, 0),
    "march":    (112, 0.7, "D...t...D...t.t.", "melody", 0.0, 0.45, 16),
    "intrigue": (70, 0.8, "D.......t...t...", "low", 0.45, 0.0, 0),
    "majestic": (80, 1.0, "D.......D...t...", "arp", 0.35, 0.3, 32),
}


def music_for(mood, dur, seed):
    rng = np.random.default_rng(seed)
    bpm, dr, pat, ud, ney_a, reed_a, zil_every = MOODS[mood]
    step = 60 / bpm / 4  # 16'lık
    n = int((dur + 2) * SR)
    L = np.zeros(n)
    R = np.zeros(n)
    d = drone(dur + 2, 73.42, dark=(mood in ("dark", "tense", "intrigue")), amp=dr)
    L += d
    R += d
    steps = int(dur / step) + 1
    deg = 0
    for s in range(steps):
        at = s * step
        c = pat[s % len(pat)]
        if c == "D":
            x = dum(0.9)
            place(L, x, at)
            place(R, x, at)
        elif c == "t":
            x = tek(0.35)
            place(L, x, at, 0.8)
            place(R, x, at + 0.004, 1.0)
        if zil_every and s % (zil_every * 4) == 0 and s > 0:
            x = zil(0.12)
            place(L, x, at)
            place(R, x, at + 0.01)
        # ud
        if ud == "arp" and s % 2 == 0:
            seq = [0, 2, 4, 2, 7, 4, 2, 4]
            k = seq[(s // 2) % len(seq)] + (3 if (s // 32) % 2 else 0)
            x = pluck(hz(k, 0), 0.9, 0.45, 0.5)
            place(L if s % 4 else R, x, at, 0.55)
        elif ud == "stac" and s % 2 == 0:
            k = [0, 1, 0, 1, 0, 4, 1, 0][(s // 2) % 8]
            x = pluck(hz(k, -1), 0.5, 0.6, 0.6)
            place(L, x, at, 0.5)
            place(R, x, at + 0.006, 0.5)
        elif ud == "melody" and s % 2 == 0 and rng.random() < 0.7:
            deg = int(np.clip(deg + rng.choice([-2, -1, 1, 1, 2]), 0, 8))
            x = pluck(hz(deg, 0), 1.0, 0.55, 0.55)
            place(L if rng.random() < 0.5 else R, x, at, 0.6)
        elif ud == "low" and s % 8 == 0:
            k = [0, 1, 0, 4, 3, 1, 0, -2][(s // 8) % 8]
            x = pluck(hz(k, -1), 1.4, 0.3, 0.7)
            place(L, x, at, 0.6)
            place(R, x, at + 0.008, 0.6)
    # ney / reed uzun cümleler
    bar = step * 16
    if ney_a or reed_a:
        tcur = rng.random() * bar
        while tcur < dur:
            ln = bar * rng.choice([1, 1.5, 2])
            k = int(rng.choice([0, 2, 3, 4, 5, 4, 2]))
            if ney_a:
                x = ney(hz(k, 1 if mood != "dark" else 0), ln * 0.9, ney_a)
                place(L, x, tcur, 0.5)
                place(R, x, tcur + 0.012, 0.5)
            if reed_a:
                x = reed(hz(k, 1), ln * 0.85, reed_a)
                place(L, x, tcur + 0.01, 0.35)
                place(R, x, tcur, 0.35)
            tcur += ln + bar * rng.choice([0.5, 1, 1.5])
    return L[:int(dur * SR)], R[:int(dur * SR)]


# ── ses efektleri ──
def sfx(kind, dur_hint=3.0):
    if kind == "whoosh":
        t = tt(0.6)
        x = RNG.standard_normal(len(t))
        out = np.zeros(len(t))
        for i in range(0, len(t), 512):
            fc = 300 + 3500 * (i / len(t))
            seg = bp(x[max(0, i - 2048):i + 512], fc * 0.7, fc * 1.4)[-512:] if i > 0 else np.zeros(512)
            out[i:i + 512] = seg[:len(out[i:i + 512])]
        return out * np.sin(np.pi * t / 0.6) * 0.7
    if kind == "taiko":
        t = tt(2.5)
        f = 42 + 70 * np.exp(-t / 0.06)
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5)
        x += lp(RNG.standard_normal(len(t)), 600) * np.exp(-t / 0.05) * 0.6
        return reverb(x, 0.4) * 1.1
    if kind == "tick":
        t = tt(0.12)
        return np.sin(2 * np.pi * 1400 * t) * np.exp(-t / 0.018) * 0.6
    if kind == "click":
        t = tt(0.06)
        return bp(RNG.standard_normal(len(t)), 2000, 6000) * np.exp(-t / 0.008) * 0.8
    if kind == "crack":
        t = tt(1.2)
        x = hp(RNG.standard_normal(len(t)), 2500) * np.exp(-t / 0.15)
        for f in RNG.uniform(2500, 7000, 12):
            x += np.sin(2 * np.pi * f * t) * np.exp(-t / RNG.uniform(0.05, 0.3)) * 0.15
        return reverb(x, 0.3) * 0.7
    if kind == "crowd":
        t = tt(3.5)
        x = bp(RNG.standard_normal(len(t)), 250, 1800)
        x *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.9 * t + RNG.random(len(t)) * 0.0)
        return x * np.minimum(1, t / 0.5) * np.minimum(1, (3.5 - t) / 1.2) * 0.5
    if kind == "whip":
        t = tt(0.35)
        x = hp(RNG.standard_normal(len(t)), 3000) * np.exp(-((t - 0.12) ** 2) / 0.0004)
        return x * 0.8
    if kind == "arrows":
        out = np.zeros(int(1.6 * SR))
        for i in range(6):
            t = tt(0.3)
            f = np.linspace(3000, 1200, len(t))
            x = bp(RNG.standard_normal(len(t)), 1500, 6000) * np.sin(np.pi * t / 0.3) * 0.4
            place(out, x, RNG.uniform(0, 1.2))
        return out
    if kind == "clash":
        t = tt(0.9)
        x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, d in [(830, 0.4), (1290, 0.3), (1870, 0.25), (2670, 0.18), (3910, 0.1)])
        x += hp(RNG.standard_normal(len(t)), 3000) * np.exp(-t / 0.01)
        return x * 0.35
    if kind == "bubble":
        out = np.zeros(int(2.5 * SR))
        for i in range(10):
            t = tt(0.08)
            f = RNG.uniform(250, 600) * (1 + 3 * t / 0.08)
            place(out, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.08) * 0.25, RNG.uniform(0, 2.3))
        return out
    if kind == "fire":
        d = max(3.0, dur_hint)
        t = tt(d)
        x = lp(RNG.standard_normal(len(t)), 400) * 0.35
        for _ in range(int(d * 18)):
            c = bp(RNG.standard_normal(400), 1500, 6000) * np.exp(-np.arange(400) / 60) * RNG.uniform(0.1, 0.5)
            place(x, c, RNG.uniform(0, d))
        return x * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.6) * 0.6
    if kind == "dig":
        t = tt(0.3)
        x = np.sin(2 * np.pi * 90 * t) * np.exp(-t / 0.05) + lp(RNG.standard_normal(len(t)), 1200) * np.exp(-t / 0.04) * 0.6
        return x * 0.8
    if kind == "knock":
        out = np.zeros(int(0.6 * SR))
        for at in (0, 0.22):
            t = tt(0.15)
            place(out, (np.sin(2 * np.pi * 220 * t) + bp(RNG.standard_normal(len(t)), 600, 2500) * 0.6) * np.exp(-t / 0.03), at)
        return out * 0.8
    if kind in ("boom", "boom_small", "boom_far"):
        L = {"boom": 3.0, "boom_small": 2.0, "boom_far": 2.0}[kind]
        t = tt(L)
        x = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t / 0.1)) / SR) * np.exp(-t / 0.6)
        x += lp(RNG.standard_normal(len(t)), 1500 if kind != "boom_far" else 400) * np.exp(-t / 0.5) * 0.9
        x += hp(RNG.standard_normal(len(t)), 2000) * np.exp(-t / 0.03) * (0.6 if kind == "boom" else 0.2)
        x = reverb(x, 0.6)
        return x * {"boom": 1.3, "boom_small": 0.8, "boom_far": 0.45}[kind]
    if kind == "waves":
        d = max(4.0, dur_hint)
        t = tt(d)
        x = lp(RNG.standard_normal(len(t)), 700) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.18 * t) ** 2)
        return x * np.minimum(1, t / 1) * np.minimum(1, (d - t) / 1) * 0.35
    if kind == "wind":
        d = max(4.0, dur_hint)
        t = tt(d)
        x = bp(RNG.standard_normal(len(t)), 200, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.12 * t))
        return x * np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 1.5) * 0.3
    if kind == "splash":
        t = tt(1.0)
        return bp(RNG.standard_normal(len(t)), 400, 5000) * np.exp(-t / 0.25) * np.minimum(1, t / 0.02) * 0.8
    if kind == "stamp":
        t = tt(0.4)
        return (np.sin(2 * np.pi * 70 * t) * np.exp(-t / 0.07) + lp(RNG.standard_normal(len(t)), 2500) * np.exp(-t / 0.03) * 0.7) * 1.0
    if kind == "creak":
        t = tt(1.0)
        f = 180 + 40 * np.sin(2 * np.pi * 3 * t) + RNG.standard_normal(len(t)).cumsum() * 0.02
        x = bp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 300, 1800) * np.sin(np.pi * t)
        return x * 0.25
    if kind == "coins":
        out = np.zeros(int(1.2 * SR))
        for i in range(9):
            t = tt(0.25)
            f = RNG.uniform(3000, 5500)
            place(out, (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.47 * t)) * np.exp(-t / 0.06) * 0.25, RNG.uniform(0, 0.9))
        return out
    if kind == "gallop":
        d = max(3.0, dur_hint)
        out = np.zeros(int(d * SR))
        beat = 60 / 138
        k = 0.0
        while k < d:
            for off in (0, 0.11, 0.22):
                t = tt(0.12)
                place(out, (np.sin(2 * np.pi * 110 * t) + lp(RNG.standard_normal(len(t)), 1500) * 0.5) * np.exp(-t / 0.03) * 0.5, k + off)
            k += beat
        tt_ = tt(d)
        return out * np.minimum(1, tt_ / 0.5) * np.minimum(1, (d - tt_) / 0.8)
    if kind == "drumroll":
        out = np.zeros(int(2.4 * SR))
        n = 26
        for i in range(n):
            place(out, dum(0.25 + 0.75 * i / n), 2.2 * (i / n) ** 0.8)
        return out * 0.8
    if kind == "flag":
        t = tt(0.8)
        return bp(RNG.standard_normal(len(t)), 300, 3000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 9 * t))) * np.sin(np.pi * t / 0.8) * 0.4
    if kind == "arrow_hit":
        t = tt(0.3)
        return (np.sin(2 * np.pi * 160 * t) * np.exp(-t / 0.04) + bp(RNG.standard_normal(len(t)), 800, 3000) * np.exp(-t / 0.02)) * 0.8
    if kind == "gong":
        t = tt(4.5)
        x = sum(np.sin(2 * np.pi * f * t + i) * np.exp(-t / d) * a for i, (f, d, a) in enumerate([(98, 3.0, 1), (157, 2.4, 0.6), (231, 1.8, 0.5), (311, 1.2, 0.4), (447, 0.8, 0.3)]))
        return x * np.minimum(1, t / 0.01) * 0.45
    raise ValueError(kind)


def reverb(x, amt=0.4):
    out = x.copy()
    for d, g in [(0.029, 0.5), (0.037, 0.45), (0.041, 0.4), (0.053, 0.35), (0.067, 0.3), (0.083, 0.25)]:
        k = int(d * SR)
        y = np.zeros(len(x) + int(SR * 1.5))
        y[:len(x)] = x
        for rep in range(1, 12):
            s = k * rep
            if s >= len(y):
                break
            y[s:s + len(x)] += x[:len(y) - s] * (g ** rep)
        out = np.concatenate([out, np.zeros(len(y) - len(out))]) if len(out) < len(y) else out
        out[:len(y)] += lp(y, 3500)[:len(out)] * amt * 0.25
    return out


def write_wav(p, st):
    with wave.open(p, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())


def read_wav(p):
    with wave.open(p) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    return a


def main():
    tl = json.load(open(os.path.join(BUILD, "timeline.json"), encoding="utf-8"))
    total = tl["total"]
    N = int((total + 1) * SR)
    voice = read_wav(os.path.join(BUILD, "narration.wav"))
    voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]

    # ── müzik: aynı mood'lu ardışık sahneleri grupla ──
    mL = np.zeros(N)
    mR = np.zeros(N)
    groups = []
    for s in tl["shots"]:
        if groups and groups[-1][0] == s["mood"]:
            groups[-1][2] = s["end"]
        else:
            groups.append([s["mood"], s["start"], s["end"]])
    XF = 1.2
    for gi, (mood, st, en) in enumerate(groups):
        d = en - st + XF
        L, R = music_for(mood, d, 100 + gi)
        n = len(L)
        fade = np.ones(n)
        fi = int(XF * SR)
        if gi > 0:
            fade[:fi] = np.linspace(0, 1, fi)
        fade[-fi:] = np.minimum(fade[-fi:], np.linspace(1, 0, fi))
        i0 = int(max(0, st - XF / 2) * SR)
        m = min(n, N - i0)
        mL[i0:i0 + m] += L[:m] * fade[:m]
        mR[i0:i0 + m] += R[:m] * fade[:m]
        print(f"  müzik: {mood:9s} {st:7.1f}-{en:7.1f}")
    peak = max(np.max(np.abs(mL)), np.max(np.abs(mR))) or 1
    mL /= peak
    mR /= peak

    # ducking (anlatım zarfı)
    env = np.abs(voice)
    win = int(0.05 * SR)
    env = np.convolve(env, np.ones(win) / win, mode="same")
    env = np.clip(env / (np.percentile(env[env > 0.003], 80) + 1e-9), 0, 1)
    # yavaş bırakma
    sm = lfilter([1 - 0.9997], [1, -0.9997], env)
    duck = np.clip(np.maximum(env, sm * 1.4), 0, 1)
    mgain = 0.40 * (1 - 0.62 * duck)
    mL *= mgain
    mR *= mgain

    # ── efektler ──
    fL = np.zeros(N)
    fR = np.zeros(N)
    for s in tl["shots"]:
        for kind, at in s["sfx"]:
            if isinstance(at, str):
                li, off = at[1:].split("+")
                at = s["lines"][int(li)]["start"] + float(off)
            x = sfx(kind, s["end"] - s["start"] - at)
            pan = RNG.uniform(-0.3, 0.3)
            gain = 0.55
            place(fL, x, s["start"] + at, gain * (1 - pan))
            place(fR, x, s["start"] + at, gain * (1 + pan))

    L = voice * 1.0 + mL + fL
    R = voice * 1.0 + mR + fR
    # yumuşak limitleyici
    pk = max(np.max(np.abs(L)), np.max(np.abs(R)))
    L = np.tanh(L / pk * 1.15) / np.tanh(1.15) * 0.95
    R = np.tanh(R / pk * 1.15) / np.tanh(1.15) * 0.95
    st = np.stack([L, R], 1)[: int(total * SR)]
    write_wav(os.path.join(BUILD, "mix.wav"), st)
    # anlatımsız müzik+efekt kanalı (kendi sesinizle yeniden seslendirmek için)
    bL, bR = (mL + fL) / pk, (mR + fR) / pk
    write_wav(os.path.join(BUILD, "muzik_efekt.wav"), np.clip(np.stack([bL, bR], 1)[: int(total * SR)] * 1.1, -1, 1))
    print(f"mix.wav yazıldı ({total:.1f} sn)")


if __name__ == "__main__":
    main()
