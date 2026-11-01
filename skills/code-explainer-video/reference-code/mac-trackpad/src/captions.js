// Word-by-word captions: spoken words fade/blur in, current word bold, keywords get a blue "text selection" box.
import { W, clamp, eo, lerp } from './lib.js';
export let KEYWORDS = new Set(('phone lightest brush finger ignores pressure electricity body gloves glass grid see rows columns crosses charge salty conducts ' +
  'fingertip close pulls away under dip exact touch two pinch glove anything never nobody crazy rain too drop work thread felt missing took follow wet pressing').split(' '));
export const setKeywords = (list, emoji = {}) => { KEYWORDS = new Set(list.split(' ').map(norm)); for (const k in emoji) EMOJI[norm(k)] = emoji[k]; };
const EMOJI = { electricity: '⚡', salty: '💧', rain: '🌧', gloves: '🧤', glove: '🧤', wet: '💦', phone: '📱' };
// any script (Latin, Devanagari...): keep letters, combining marks, digits and apostrophes
export const norm = s => s.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{M}\p{N}']/gu, '');

// alias: {englishPhrase: 'phrase in this voice'} for translated voices; 'anchor > phrase' finds phrase after anchor
export function makeCue(WORDS, alias = {}) {
  const memo = {};
  const find = (phrase, after) => {
    for (const alt of phrase.split('|')) { // 'a|b' = first alternative found (scripts differ slightly)
      const q = alt.trim().split(/\s+/).map(norm);
      for (let i = 0; i < WORDS.length; i++) {
        if (WORDS[i].s < after - 1e-3) continue;
        if (q.every((w, j) => WORDS[i + j] && WORDS[i + j].n === w)) return WORDS[i].s;
      }
    }
    return null;
  };
  return (phrase, after = 0) => {
    const key = phrase + '@' + after; if (key in memo) return memo[key];
    let a = alias[phrase] ?? phrase, t0 = after;
    if (a.includes('>')) { const [anc, ph] = a.split('>').map(x => x.trim()); t0 = find(anc, after); if (t0 == null) throw Error('cue anchor not found: ' + anc); a = ph; }
    const t = find(a, t0); if (t == null) throw Error('cue not found: ' + phrase + (a !== phrase ? ' -> ' + a : '') + ' after ' + after);
    return memo[key] = t;
  };
}
export function keywordTimes(WORDS, CHUNKS) { // first keyword occurrence per chunk -> sfx pops
  return CHUNKS.flatMap(ch => { const i = ch.find(i => KEYWORDS.has(WORDS[i].n.replace(/'s$/, ''))); return i === undefined ? [] : [WORDS[i].s]; });
}
export function drawCaptions(ctx, T, WORDS, CHUNKS, light = false) {
  let ci = -1; for (let i = 0; i < CHUNKS.length; i++) if (WORDS[CHUNKS[i][0]].s - .05 <= T) ci = i;
  if (ci < 0) return;
  const ch = CHUNKS[ci], last = WORDS[ch[ch.length - 1]], next = CHUNKS[ci + 1];
  const endT = next ? Math.min(WORDS[next[0]].s - .05, last.e + 1.2) : last.e + 1.5;
  if (T > endT + .25) return;
  const fade = 1 - clamp((T - endT) / .25);
  const size = 54, F = w => `${w} ${size}px Inter, "Segoe UI", "Nirmala UI", Arial`;
  ctx.save(); ctx.textBaseline = 'alphabetic';
  // layout into lines (max width)
  const items = ch.map(i => { const w = WORDS[i]; const em = EMOJI[w.n]; const txt = (em ? em + ' ' : '') + w.w; ctx.font = F(800); return { i, w, txt, wid: ctx.measureText(txt).width }; });
  const lines = [[]]; let lw = 0; const sp = 16, maxW = 900;
  items.forEach(it => { if (lw + it.wid > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(it); lw += it.wid + sp; });
  let cur = -1; ch.forEach(i => { if (WORDS[i].s <= T) cur = i; });
  lines.forEach((ln, li) => {
    const tw = ln.reduce((a, it) => a + it.wid, 0) + sp * (ln.length - 1); let x = (W - tw) / 2; const y = 330 + li * 70;
    ln.forEach(it => {
      const a = clamp((T - it.w.s + .04) / .18) * fade; if (a > 0) {
        const kw = KEYWORDS.has(it.w.n.replace(/'s$/, '')), isCur = it.i === cur;
        const dy = (1 - eo(a)) * 14;
        if (kw) { // selection box grows left->right
          const g = eo(clamp((T - it.w.s) / .22)), bx = x - 8, by = y - size + 4, bw = (it.wid + 16) * g, bh = size + 12;
          ctx.globalAlpha = fade; ctx.fillStyle = 'rgba(48,92,255,.28)'; ctx.fillRect(bx, by, bw, bh);
          ctx.strokeStyle = '#4f7dff'; ctx.lineWidth = 2.5; ctx.strokeRect(bx, by, bw, bh);
          ctx.fillStyle = '#6f95ff'; ctx.beginPath(); ctx.arc(bx, by - 4, 6, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(bx + bw, by + bh + 4, 6, 0, 7); ctx.fill();
        }
        ctx.globalAlpha = a; ctx.font = F(isCur || kw ? 800 : 500);
        ctx.fillStyle = light ? (isCur || kw ? '#111318' : 'rgba(40,44,52,.55)') : (isCur || kw ? '#ffffff' : 'rgba(225,230,238,.62)');
        ctx.shadowColor = light ? 'rgba(255,255,255,.9)' : 'rgba(0,0,0,.8)'; ctx.shadowBlur = 14;
        if (a < 1) ctx.filter = `blur(${(1 - a) * 6}px)`;
        ctx.fillText(it.txt, x, y + dy); ctx.filter = 'none'; ctx.shadowBlur = 0;
      }
      x += it.wid + sp;
    });
  });
  ctx.restore();
}
