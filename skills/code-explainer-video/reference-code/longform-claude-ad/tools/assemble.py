# Join voice parts into one track with silent gaps, and shift each part's Whisper words to the joined timeline.
# Usage: python tools/assemble.py   (edit PLAN below) -> analysis/voice.wav, analysis/en_words.json, prints DURATION
import json, subprocess, numpy as np
SR = 48000
SRC = "../Reference-videos/longform-videos/"
# (audio file, words json, cut start, cut end or None, place at seconds on the timeline)
PLAN = [("part-1.mp3", "part-1", 0, None, 0.0),
        ("part2.mp3", "part2", 0, 3.8, 15.3),     # "Every day ... a website like this."
        ("part2.mp3", "part2", 3.8, 9.95, 22.1),  # after a silent build montage: "Portfolios ... in minutes."
        ("part2.mp3", "part2", 9.95, None, 30.65),  # after the brand card: "Every frame ... skill file."
        ("part3.mp3", "part3", 0, None, 35.3)]
TAIL = 1.4
def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2)
clips, words, end = [], [], 0
for f, wj, a, b, at in PLAN:
    x = load(SRC + f); x = x[int(a * SR): int(b * SR) if b else len(x)].copy()
    n = min(len(x), int(.012 * SR)); x[:n] *= np.linspace(0, 1, n)[:, None]; x[-n:] *= np.linspace(1, 0, n)[:, None]
    clips.append((int(at * SR), x)); end = max(end, at + len(x) / SR)
    for w in json.load(open(f"analysis/{wj}_words.json", encoding="utf-8")):
        if w["s"] >= a - .02 and (b is None or w["s"] < b):
            words.append({"w": w["w"], "s": round(w["s"] - a + at, 2), "e": round(w["e"] - a + at, 2)})
dur = round(end + TAIL, 2); out = np.zeros((int(dur * SR), 2), np.float32)
for st, x in clips: out[st: st + len(x)] += x
tmp = "analysis/voice.f32"; out.tofile(tmp)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", tmp, "analysis/voice.wav"], check=True)
import os; os.remove(tmp)
json.dump(words, open("analysis/en_words.json", "w", encoding="utf-8"), indent=0)
print("DURATION", dur, len(words), "words")
