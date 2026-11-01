# Chunked Whisper (Hindi skips long stretches otherwise). Splits at silences every ~7 s.
# Usage: python tools/transcribe_chunks.py in.wav out.json lang
import sys, os, json, subprocess, re
import numpy as np, scipy.io.wavfile as wf
try:
    import torch; os.add_dll_directory(os.path.join(os.path.dirname(torch.__file__), "lib"))
except Exception: pass
from faster_whisper import WhisperModel
src, out, lang = sys.argv[1], sys.argv[2], sys.argv[3]
log = subprocess.run(["ffmpeg", "-i", src, "-af", "silencedetect=n=-40dB:d=0.18", "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
mids = [(a + b) / 2 for a, b in zip(st, en)]
sr, a = wf.read(src); a = a.astype(np.float32) / 32768.0
if a.ndim > 1: a = a.mean(1)
if sr != 16000:
    import scipy.signal as ss; a = ss.resample_poly(a, 16000, sr); sr = 16000
dur = len(a) / sr; cuts = [0.0]
for m in mids:
    if m - cuts[-1] >= 6.5: cuts.append(m)
cuts.append(dur)
mdl = WhisperModel("large-v3-turbo", device="cuda", compute_type="float16")
words, lines = [], []
for s0, s1 in zip(cuts, cuts[1:]):
    seg, _ = mdl.transcribe(a[int(s0 * sr):int(s1 * sr)], word_timestamps=True, language=lang, vad_filter=False, condition_on_previous_text=False)
    txt = []
    for s in seg:
        txt.append(s.text.strip())
        for w in s.words: words.append({"w": w.word.strip(), "s": round(w.start + s0, 2), "e": round(w.end + s0, 2)})
    lines.append(f"[{s0:6.2f}-{s1:6.2f}] {' '.join(txt)}")
json.dump(words, open(out, "w", encoding="utf-8"), indent=0, ensure_ascii=False)
open(out.replace(".json", ".txt"), "w", encoding="utf-8").write("\n".join(lines))
print(out, len(words), "words", round(dur, 2))
