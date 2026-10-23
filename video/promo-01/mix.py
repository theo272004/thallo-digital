"""
mix.py — the sound bed for Promo 01, and the final mux.

Everything here is synthesised, so there is nothing to license: a pad that
follows the story (questioning → hollow → warm → building → resolved), a soft
pluck pulse while Thallo builds and runs, whooshes on the scene wipes, ticks
when a card lands. The bed ducks under the voice using the same envelope the
page uses for the waveform. It is a placeholder for real music, not a
replacement: swap bed.wav for a licensed track and rerun the mux.

    python -I video/promo-01/mix.py     (after render.mjs has written out/silent.mp4)

Writes out/bed.wav, out/thallo-promo-01.mp4 (voice + bed) and
out/thallo-promo-01-vo-only.mp4 (voice alone, for when music is added later).
"""
import json, re, subprocess, sys, wave
from pathlib import Path
import numpy as np
from scipy.signal import lfilter

HERE = Path(__file__).resolve().parent
OUT = HERE / "out"
SR = 48000
DUR = 59.6
N = int(SR * DUR)

data = (HERE / "assets" / "data.js").read_text(encoding="utf-8")
WORDS = json.loads(re.search(r"window\.WORDS=(\[.*?\]);", data, re.S).group(1))
ENV = json.loads(re.search(r"window\.ENV=(\[.*?\]);", data, re.S).group(1))
VO_OFFSET = float(re.search(r"window\.VO_OFFSET=([\d.]+);", data).group(1))

def at(word, nth=1):
    k = 0
    for w in WORDS:
        if re.sub(r"[^a-z']", "", w["w"].lower()) == word:
            k += 1
            if k == nth:
                return w["s"]
    raise KeyError(word)

T = dict(but=at("but"), thats=at("that's"), at=at("at"), then=at("then"), and_=at("and", 7),
         if_=at("if", 2), lets=at("let's"))
rng = np.random.default_rng(7)
t = np.arange(N) / SR

def hz(note):
    names = {"C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4, "F#": -3, "G": -2, "G#": -1, "A": 0, "A#": 1, "B": 2}
    m = re.match(r"([A-G]#?)(\d)", note)
    return 440.0 * 2 ** ((names[m.group(1)] + (int(m.group(2)) - 4) * 12) / 12)

def lowpass(x, fc):
    # one-pole, run twice for a gentler 12 dB/oct slope
    a = np.exp(-2 * np.pi * fc / SR)
    return lfilter([1 - a], [1, -a], lfilter([1 - a], [1, -a], x))

def seg(t0, t1):
    return slice(int(t0 * SR), min(N, int(t1 * SR)))

# ------------------------------------------------------------------ pad
PADS = [  # (start, end, notes, level)
    (0.0, T["but"], ["B2", "F#3", "A3", "C#4", "D4"], 1.0),
    (T["but"], T["thats"] - .35, ["G2", "D3", "F#3", "B3"], .7),
    (T["thats"], T["then"], ["D3", "A3", "E4", "F#4", "A4"], 1.0),
    (T["then"], T["and_"], ["D3", "A3", "D4", "F#4", "B4"], .9),
    (T["and_"], T["if_"], ["G2", "D3", "B3", "E4", "A4"], .9),
    (T["if_"], T["lets"], ["D3", "A3", "C#4", "F#4", "E5"], 1.0),
    (T["lets"], DUR, ["D2", "A2", "D3", "F#3", "A3", "E4"], 1.15),
]
pad = np.zeros(N)
for (a, b, notes, lvl) in PADS:
    fade = 1.2
    s = seg(max(0, a - fade / 2), min(DUR, b + fade / 2))
    tt = t[s]
    env = np.clip((tt - (a - fade / 2)) / fade, 0, 1) * np.clip(((b + fade / 2) - tt) / fade, 0, 1)
    env = env ** 1.5
    x = np.zeros_like(tt)
    for f in (hz(n) for n in notes):
        for det in (-0.12, 0.0, 0.12):  # cents-ish chorus
            ff = f * 2 ** (det / 12)
            x += np.sin(2 * np.pi * ff * tt + rng.uniform(0, 6.28)) * .6
            x += np.sin(2 * np.pi * ff * 2 * tt + rng.uniform(0, 6.28)) * .12
    pad[s] += x * env * lvl / len(notes)
# the breath before "That's where we can help"
breath = np.ones(N); s = seg(T["thats"] - 1.0, T["thats"]); breath[s] = np.linspace(1, .15, s.stop - s.start)
pad *= breath
pad = lowpass(pad, 1400.0)
pad *= 1 + .08 * np.sin(2 * np.pi * .12 * t)  # slow breathing

# ------------------------------------------------------------------ pluck pulse while we build and run
pl = np.zeros(N)
BPM = 100.0; step = 60 / BPM / 2
arps = {  # chord tones per bar, cycled
    "build": [["D4", "A4", "F#5", "A4"], ["C#4", "A4", "E5", "A4"], ["B3", "F#4", "D5", "F#4"], ["G3", "D4", "B4", "D4"]],
    "run": [["G3", "D4", "B4", "D4"], ["A3", "E4", "C#5", "E4"], ["D4", "A4", "F#5", "A4"], ["A3", "E4", "C#5", "E4"]],
    "res": [["D4", "A4", "F#5", "E5"], ["B3", "F#4", "D5", "C#5"]],
}
def plucks(a, b, key, gain):
    k = 0; x = a
    while x < b:
        bar = int(k / 8) % len(arps[key]); note = arps[key][bar][k % 4]
        f = hz(note); s = seg(x, x + .7); tt = t[s] - x
        tone = (np.sin(2 * np.pi * f * tt) + .35 * np.sin(2 * np.pi * 2 * f * tt) + .1 * np.sin(2 * np.pi * 3 * f * tt))
        env = np.exp(-tt * 7) * np.clip(tt / .004, 0, 1)
        acc = 1.0 if k % 4 == 0 else .7
        ramp = np.clip((x - a) / 2.0, .25, 1)
        pl[s] += tone * env * gain * acc * ramp
        x += step; k += 1
plucks(T["then"] + .1, T["and_"] - .2, "build", .22)
plucks(T["and_"] + .2, T["if_"] - .4, "run", .26)
plucks(T["if_"] + .1, T["lets"] - .3, "res", .16)
pl = lowpass(pl, 2600.0)

# ------------------------------------------------------------------ sfx
fx = np.zeros(N)
def whoosh(c, length=.8, gain=.5, f=1800):
    s = seg(c - length * .7, c + length * .3); n = s.stop - s.start
    noise = rng.standard_normal(n)
    env = np.concatenate([np.linspace(0, 1, int(n * .7)) ** 2, np.linspace(1, 0, n - int(n * .7)) ** 1.5])
    fx[s] += lowpass(noise, f) * env * gain
def tick(c, gain=.35, f=1500):
    s = seg(c, c + .09); tt = t[s] - c
    fx[s] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 60) * gain
def boom(c, gain=.9):
    s = seg(c, c + 1.8); tt = t[s] - c
    f = 70 * np.exp(-tt * 1.5) + 42
    fx[s] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.2) * gain

for c in (T["but"], T["thats"] - .1, T["at"] - .2, T["then"], T["and_"], T["if_"] - .2, T["lets"] - .2):
    whoosh(c)
boom(T["thats"], .7); boom(T["lets"], 1.0)
for w, n, f in [("examples", 1, 1500), ("how", 1, 1600), ("who", 1, 1700), ("what", 1, 1800),
                ("understand", 1, 1400), ("problems", 1, 1500), ("why", 2, 1600),
                ("service", 1, 1500), ("blog", 1, 1650), ("case", 1, 1800), ("resources", 1, 2000),
                ("writing", 1, 1500), ("seo", 1, 1650), ("publishing", 1, 1800), ("distribution", 1, 2000),
                ("attract", 1, 1700), ("qualified", 1, 1850), ("leads", 1, 2000), ("fit", 1, 2200)]:
    tick(at(w, n), .3, f)

# ------------------------------------------------------------------ duck under the voice and mix the bed
env = np.interp(t, np.arange(len(ENV)) / 30.0, ENV, right=0)
k = int(SR * .25); env = np.convolve(env, np.ones(k) / k, mode="same")
duck = 1 - .45 * np.clip(env * 1.4, 0, 1)
bed = (pad * .5 + pl) * duck + fx
fade = np.ones(N); s = seg(DUR - 2.5, DUR); fade[s] = np.linspace(1, 0, s.stop - s.start) ** 2
bed *= fade
bed /= np.max(np.abs(bed)) + 1e-9
bed *= 10 ** (-14 / 20)  # bed peaks at -14 dBFS before the voice goes on top

def write(path, x):
    x16 = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x16.tobytes())
write(OUT / "bed.wav", bed)
print("wrote", OUT / "bed.wav")

silent = OUT / "silent.mp4"
vo = HERE / "assets" / "vo.mp3"
if not silent.exists():
    sys.exit("render the picture first: node video/promo-01/render.mjs")
common = ["-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart", "-shortest"]
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(silent), "-i", str(vo), "-i", str(OUT / "bed.wav"),
    "-filter_complex", f"[1:a]adelay={int(VO_OFFSET*1000)}:all=1,apad,volume=1.0[v];[2:a]volume=0.55[b];[v][b]amix=inputs=2:normalize=0:duration=longest,loudnorm=I=-14:TP=-1.5:LRA=9[a]",
    "-map", "0:v", "-map", "[a]", *common, str(OUT / "thallo-promo-01.mp4")], check=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(silent), "-i", str(vo),
    "-filter_complex", f"[1:a]adelay={int(VO_OFFSET*1000)}:all=1,apad,loudnorm=I=-14:TP=-1.5:LRA=9[a]",
    "-map", "0:v", "-map", "[a]", *common, str(OUT / "thallo-promo-01-vo-only.mp4")], check=True)
print("wrote", OUT / "thallo-promo-01.mp4")
