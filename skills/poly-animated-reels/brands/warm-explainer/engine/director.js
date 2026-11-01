// Turns episode + timing into shots, panels, caption chunks and sound cues. Runs in the browser and in Node.
const h = n => { const s = Math.sin(n * 91.7 + 11.3) * 43758.5453; return s - Math.floor(s); };
const wordCount = s => s.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length;
// An emotion tag in the line also sets the character's face, unless the line has its own `mood`.
const TAG_MOOD = { happy: 'happy', excited: 'happy', laughs: 'happy', laughing: 'happy', cheerful: 'happy', proud: 'happy', sad: 'sad', hurt: 'sad', crying: 'sad', quiet: 'sad', whispers: 'sad', angry: 'angry', frustrated: 'angry', annoyed: 'angry', shouting: 'angry', shocked: 'shock', surprised: 'shock', scared: 'shock', sarcastic: 'smug', smug: 'smug', teasing: 'smug', deadpan: 'smug', tired: 'tired', sighs: 'tired', bored: 'tired' };
const tagMood = t => { for (const m of t.matchAll(/<([^>]+)>/g)) { const v = TAG_MOOD[m[1].trim().toLowerCase()]; if (v) return v; } return null; };
export function direct(ep, timing, brand, lang = 'en') {
  const others = ep.cast || ['human', 'bot'], lines = ep.lines.map((l, i) => ({ ...l, mood: l.mood || tagMood(l.text), ...timing.lines[i], i }));
  const other = who => others.find(w => w !== who) || who, shots = [], panels = [];
  const endDur = ep.end ? (ep.end.dur || 3) : 0, total = timing.duration + endDur;
  // Panels: a line with `ui` opens one. It holds for `keep` further lines (default 0), or to the next panel.
  let open = null;
  lines.forEach((l, i) => {
    if (open && (l.ui || l.ui === false || i > open.last)) { open.end = l.start; open = null; }
    if (l.ui) { open = { ...l.ui, start: l.start, end: timing.duration, last: i + (l.ui.keep || 0), first: i, set: l.ui.set }; panels.push(open); }
  });
  if (open) open.end = timing.duration;
  const panelAt = t => panels.find(p => t >= p.start && t < p.end);
  // Shots. Explicit `shot` wins. Otherwise: wide opener, wide every fourth beat, close on the speaker,
  // and a long line cuts to the listener's reaction halfway through.
  let sinceWide = 0, prevName = null;
  lines.forEach((l, i) => {
    const start = i ? l.start - .04 : 0, next = lines[i + 1], end = next ? next.start - .04 : total;
    const p = panelAt(l.start + .01); let name = l.shot;
    if (!name) {
      if (p) name = p.shot || brand.panelShot || 'two';
      else if (i === 0) name = 'two';
      else if (sinceWide >= 3 && wordCount(l.text) > 2) name = 'two';
      else name = 'close_' + l.who;
    }
    sinceWide = name === 'two' ? 0 : sinceWide + 1;
    if (name === 'two' && brand.twoFor?.[l.who]) name = brand.twoFor[l.who];   // a wide shot must show whoever is speaking
    const push = (n, a, b, react) => { shots.push({ name: n, start: a, end: b, line: i, react, seed: i * 7 + (react ? 3 : 0) }); prevName = n; };
    if (!l.shot && !p && name.startsWith('close') && wordCount(l.text) >= 10) {
      const m = l.start + (l.end - l.start) * .55; push(name, start, m, false); push('close_' + other(l.who), m, end, true);
    } else push(name, start, end, false);
  });
  if (!shots.length) shots.push({ name: 'two', start: 0, end: total, line: 0, seed: 0 });
  shots[shots.length - 1].end = total;
  // Captions: split a line at punctuation into short chunks; each chunk is on screen until the next begins.
  const chunks = [], maxW = brand.caption?.maxWords || 7;
  lines.forEach(l => {
    let cur = [];
    const flush = () => { if (cur.length) chunks.push({ who: l.who, words: cur, text: cur.map(w => w.w).join(' '), start: cur[0].s, end: cur[cur.length - 1].e, line: l.i }); cur = []; };
    l.words.forEach(w => { cur.push(w); if (/[.?!…,;:]$/.test(w.w) && cur.length >= 2 || /[.?!…]$/.test(w.w) || cur.length >= maxW) flush(); });
    flush();
  });
  chunks.forEach((c, i) => { const n = chunks[i + 1]; c.until = n ? Math.min(n.start, c.end + 1.1) : c.end + .8; });
  // Sound cues: only real visual events and never a train. Small hits stay at least 1.5 s apart.
  const cues = []; let last = -9;
  panels.forEach(p => { if (p.start - last >= 1.5) { cues.push({ t: p.start, kind: 'ui' }); last = p.start; } });
  shots.forEach((s, i) => { if (i && (s.name === 'two' || i % 5 === 0) && !cues.some(c => Math.abs(c.t - s.start) < 1.5)) cues.push({ t: s.start, kind: 'cut' }); });
  if (ep.end) cues.push({ t: timing.duration, kind: 'end' });
  cues.sort((a, b) => a.t - b.t);
  return { lines, shots, panels, chunks, cues, total, endStart: ep.end ? timing.duration : Infinity, panelAt, other };
}
