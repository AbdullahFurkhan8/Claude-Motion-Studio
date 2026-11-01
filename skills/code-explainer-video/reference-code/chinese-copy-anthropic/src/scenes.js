// "How do Chinese AI companies copy Anthropic models?" - distillation explainer. All timing from word cues c('phrase', after).
// Everything is drawn in code (kit.js) except the user's logos (Claude, Qwen, Alibaba, ChatGPT).
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, hash, rr, alive, flipIn } from './lib.js';
import { FONT, MONO, SERIF, CORAL, CORAL_RGB, PURPLE, PURPLE_RGB, BLUE, GREEN, RED, AMBER, INK, TOKCOL, fmt, txt, tw, bin, pop,
  bgDark, bgLight, card, macWin, logo, glowDot, claude, qwen, anthropicMark, cursor, clickRing, check, xmark, pill, chip, bar, wrap, para,
  miniCard, avatar, layerCube, apiBox } from './kit.js';

export const IMAGES = ['claude.png', 'qwen.png', 'alibaba.png', 'chatgpt.png'];
const kf = (T, keys, e = eio) => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (T < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e((T - t0) / Math.max(1e-3, t1 - t0)); return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u); }
  return keys[keys.length - 1][1];
};
const live = (ctx, T, x, y, o, fn) => { ctx.save(); alive(ctx, T, x, y, o); fn(); ctx.restore(); };
const flip = (ctx, k, x, y, fn) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k * 1.5); flipIn(ctx, x, y, k); fn(); ctx.restore(); };
const typed = (s, T, t0, t1) => s.slice(0, Math.floor(s.length * clamp((T - t0) / Math.max(.05, t1 - t0))));
const caret = (T) => Math.sin(T * 9) > 0;
const TOKS = ['The', 'best', 'way', 'to', 'learn', 'is', 'to'];
// lay out token chips centred on cx; returns [{x,w}]
function rowLayout(ctx, toks, cx, size, gap = 12) {
  ctx.font = MONO(700, size); const ws = toks.map(t => ctx.measureText('·' + t).width + size * .9);
  const tot = ws.reduce((a, b) => a + b, 0) + gap * (toks.length - 1); let x = cx - tot / 2;
  return ws.map(w => { const o = { x, w }; x += w + gap; return o; });
}
const NUMS = (i, j, s = 0) => { const v = (hash(i * 7 + j, 3 + s) - .5) * .11; return (v < 0 ? '-' : ' ') + Math.abs(v).toFixed(4); };

export const KEYWORDS = 'chinese copy report alibaba million exchanges distillation teacher collect check student weights billions tokens numbers layer multiplies context probability picks repeats low adjust millions contacting catch hidden inside picked hesitating final thinking summary smaller skill overfitting transfer test crazy code guide bio';
export const EMOJI = { distillation: '⚗️', thinking: '🧠', overfitting: '📉', code: '💻', guide: '💬', bio: '🔗' };
export const CAPTION_SFX = false;
// Hinglish voice: same scenes, cues mapped to the words it says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      chinese: 'chinese', copy: 'copy', anthropic: 'anthropic ke', models: 'karti', 'anthropic just': 'anthropic ne', report: 'report',
      'it says': 'usmein likha', alibaba: 'alibaba', over: 'zyada', million: 'crore', exchanges: 'exchanges', 'with claude': 'claude ke saath', 'three months': '3 mahine', qwen: 'qwen',
      'and i wanted': 'aur main', understand: 'samajhna', works: 'kaam', 'the technique': 'is technique', distillation: 'distillation', 'you take': 'aap ek', stronger: 'strong', teacher: 'teacher',
      collect: 'collect', check: 'check', 'train your': 'apna model', own: 'train', student: 'student', 'training changes': 'training model ki', weights: 'weights', billions: 'arabon', calculates: 'calculate',
      first: 'sabse pehle', cuts: 'aapke', tokens: 'tokens', 'small pieces': 'chhote', turns: 'aur har', list: 'list', then: 'phir layer', multiplies: 'apne weights',
      'along the way': 'is dauraan', 'looks back': 'wapas', earlier: 'pichhle', context: 'context',
      'at the end': 'aakhir', probability: 'probability', 'every possible': 'possible', 'picks one': 'ek ko chunta', sentence: 'sentence', repeats: 'phir se',
      'during training': 'training ke dauraan', "teacher's answer": 'teacher ka answer', 'which token': 'agla token', next: 'chahiye', low: 'kam', 'training calculates': 'to training',
      adjust: 'adjust', fix: 'galti', 'repeat that': 'isko laakhon', 'starts answering': 'jawaab dene', 'without ever': 'bina kabhi',
      "but here's the catch": 'lekin yahan', between: 'beech', hidden: 'hidden', 'stay inside': 'andar', 'and claude only': 'aur claude sirf', picked: 'chuna', 'full probabilities': 'poori probabilities',
      hesitating: 'hichkicha', 'two words': 'do words', 'so the student': 'to student sirf', 'how the teacher': 'pahuncha',
      "that's why": 'isi liye', thinking: 'thinking', 'step-by-step': 'step', 'before answering': 'likhta', closest: 'kareeb', summary: 'summary',
      'a smaller': 'ek chhota', smaller: 'chhota', also: 'student', hold: 'rakh', 'every skill': 'skill', 'learn the examples': 'examples', struggle: 'atak', 'never seen': 'kabhi dekhi', overfitting: 'overfitting',
      'so collecting': 'to answers', transfer: 'transfer', 'useful skills': 'kaam ki', 'the test': 'asli test', solve: 'solve', "hasn't seen": 'dekhi nahi',
      "and here's the crazy": 'aur sabse crazy', 'made with code': 'code se', comment: 'comment', guide: 'guide', youtube: 'youtube', link: 'link',
    },
    keywords: 'chinese copy report alibaba crore exchanges distillation teacher collect check student weights arabon tokens numbers layer multiply context probability chunta kam adjust laakhon contact catch hidden andar chuna hichkicha final thinking summary chhota skill overfitting transfer test crazy code guide bio',
    emoji: { distillation: '⚗️', thinking: '🧠', overfitting: '📉', code: '💻', guide: '💬', bio: '🔗' },
  },
};

export function makeScenes(c, lang = 'en') {
  const named = lang !== 'hi'; // Hindi version: profile picture only, no channel name or handle
  const list = [], sfx = [];
  const add = (start, light, draw) => { list.push({ start, light, draw }); if (start > 0) sfx.push({ t: start - .05, k: 'whoosh', g: -19 }); };
  const s = x => x - .1;
  const A = {
    release: s(c('anthropic just')), says: s(c('it says')), wanted: s(c('and i wanted')), tech: s(c('the technique')), training: s(c('training changes')),
    first: s(c('first')), then: s(c('then')), along: s(c('along the way')), end: s(c('at the end')), during: s(c('during training')), catch: s(c("but here's the catch")),
    shows: s(c('and claude only')), why: s(c("that's why")), smaller: s(c('a smaller')), so: s(c('so collecting')), crazy: s(c("and here's the crazy")),
  };

  // 1 HOOK (dark): Claude fires a swarm of exchanges into Qwen; counter rolls to 151,000,000
  { const K = { chinese: c('chinese'), copy: c('copy'), anth: c('anthropic'), models: c('models'), end: A.release };
    sfx.push({ t: .05, k: 'riser', g: -15 }, { t: .3, k: 'data', g: -17 }, { t: K.copy, k: 'swoosh', g: -14 }, { t: K.copy + .15, k: 'pop', g: -12 }, { t: K.anth + .2, k: 'tick', g: -12 });
    add(0, false, (ctx, T) => {
      const split = p(T, K.copy - .25, .9, eio), y = 990;
      bgDark(ctx, T, lerp(540, 680, split), y, 1);
      const cx = lerp(540, 290, split), qx = lerp(1300, 790, split);
      // particle swarm: bursts out of Claude, then streams into Qwen
      ctx.save();
      for (let i = 0; i < 380; i++) {
        const h1 = hash(i, 1), h2 = hash(i, 2), h3 = hash(i, 3);
        const burst = eo(clamp((T - .02 - h3 * .4) / 1.1)), ang = h1 * 6.283 + T * (.22 + .3 * h2) * (i % 2 ? 1 : -1), rad = burst * (100 + 330 * Math.sqrt(h2));
        let px = cx + Math.cos(ang) * rad, py = y + Math.sin(ang) * rad * .85, r = 2 + 3.6 * h2, fade = 1;
        const ts = K.chinese + .5 + h3 * 1.3, m = eio(clamp((T - ts) / .9));
        if (m > 0) {
          const ph = ((T - ts) * .5 + h1) % 1, sx = cx + (h2 - .5) * 90, sy = y + (h1 - .5) * 140, mx = (sx + qx) / 2, my = y - 220 * (h3 - .45) - 30;
          const bx = (1 - ph) ** 2 * sx + 2 * (1 - ph) * ph * mx + ph * ph * qx, by = (1 - ph) ** 2 * sy + 2 * (1 - ph) * ph * my + ph * ph * y;
          px = lerp(px, bx, m); py = lerp(py, by, m); fade = lerp(1, clamp((1 - ph) * 4) * clamp(ph * 8), m); r *= lerp(1, .55 + .6 * (1 - ph), m);
        }
        if (fade <= .02 || burst <= 0) continue;
        const near = clamp(1 - Math.hypot(px - qx, py - y) / 260) * m;
        ctx.globalAlpha = fade * (.45 + .55 * h3);
        ctx.fillStyle = i % 5 === 0 ? `rgb(${CORAL_RGB})` : near > .3 ? '#b9afff' : '#c8ccd6';
        ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill();
        if (r > 4) { ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(px - r * .3, py - r * .3, r * .3, 0, 7); ctx.fill(); }
      }
      ctx.restore();
      // chat cards flying across once the pair has formed
      const ca = p(T, K.copy + .3, .5);
      for (let k = 0; k < 4; k++) {
        const ph = ((T - K.copy) * .42 + k / 4) % 1, a = ca * Math.sin(ph * Math.PI);
        miniCard(ctx, lerp(cx + 70, qx - 70, ph), y - 150 - Math.sin(ph * Math.PI) * 90 + k * 30, 190, k, a, (ph - .5) * .25);
      }
      claude(ctx, T, cx, y, lerp(330, 250, split), { glow: 1, spin: .25 });
      const qa = p(T, K.copy, .55, eback);
      if (qa > 0) { ctx.save(); if (qa < 1) ctx.filter = `blur(${(1 - qa) * 10}px)`; qwen(ctx, T, qx, y, 250 * clamp(qa, 0, 1.2), { glow: 1 }); ctx.restore(); }
      bin(ctx, p(T, K.copy + .4, .5), () => { txt(ctx, 'Claude', cx, y + 200, 30, 'rgba(255,255,255,.75)', 700); txt(ctx, 'Qwen', qx, y + 200, 30, 'rgba(255,255,255,.75)', 700); });
      // counter
      const tEnd = Math.max(K.anth, K.copy) + .2, v = 151e6 * Math.pow(eo(clamp((T - .1) / tEnd)), 1.25), done = T > tEnd + .1;
      const pulse = 1 + .05 * Math.sin(clamp((T - tEnd - .1) / .4) * Math.PI);
      ctx.save(); ctx.translate(540, 1440); ctx.scale(pulse, pulse); ctx.shadowColor = `rgba(${CORAL_RGB},.75)`; ctx.shadowBlur = 30;
      txt(ctx, fmt(done ? 151e6 : v), 0, 0, 112, '#fff', 800); ctx.shadowBlur = 0; ctx.letterSpacing = '9px'; txt(ctx, 'EXCHANGES', 0, 56, 28, CORAL, 800); ctx.letterSpacing = '0px'; ctx.restore();
    });
  }

  // report page used by scenes 2 and 3 (local layout 880 wide)
  const QUOTE = 'Scale of distillation attacks attributable to Alibaba between May and July 2026: over 151 million exchanges observed.';
  function reportPage(ctx, T, x, y, w, h, { scroll = 0, hl = 0, alib = 0 } = {}) {
    card(ctx, x, y, w, h, { r: 24 });
    ctx.save(); rr(ctx, x, y, w, h, 24); ctx.clip(); ctx.translate(x, y - scroll);
    anthropicMark(ctx, 62, 46, 28);
    [['Research', w - 420], ['Policy', w - 318], ['News', w - 236]].forEach(([s, xx]) => txt(ctx, s, xx, 54, 21, '#3a3a3a', 500));
    pill(ctx, w - 110, 46, 'Try Claude', { bg: '#141414', size: 20, h: 42 });
    ctx.fillStyle = '#f0eee6'; ctx.fillRect(0, 92, w, 470);
    ['Detecting and', 'countering misuse of', 'AI: September 2026'].forEach((s, i) => txt(ctx, s, w / 2, 236 + i * 68, 56, INK, 700));
    pill(ctx, w / 2 - 120, 470, 'Download report', { bg: '#2b2b2b', size: 21, h: 48 }); pill(ctx, w / 2 + 112, 470, 'Download IOCs', { bg: '#fff', fg: INK, stroke: '#888', size: 21, h: 48 });
    para(ctx, 'Over the past eight months, our Threat Intelligence team identified and disrupted operations in which threat actors tried to use Claude for malicious activity.', 60, 650, w - 120, 42, SERIF(400, 27), '#2a2a2a');
    para(ctx, 'GTG 16005: Chain-of-thought distillation and AI R&D campaign by Alibaba (Qwen / Tongyi Lab)', 60, 880, w - 330, 52, FONT(800, 40), INK);
    if (alib > 0) pop(ctx, eback(alib), w - 150, 920, () => logo(ctx, 'alibaba', w - 150, 920, 230 + 6 * Math.sin(T * 2)));
    // quote with a blue highlight sweeping over "over 151 million exchanges observed."
    ctx.font = SERIF(400, 29, 'italic'); const lines = wrap(ctx, QUOTE, w - 120), hs = QUOTE.indexOf('over 151'), he = QUOTE.length; let off = 0;
    const lim = hs + (he - hs) * clamp(hl);
    lines.forEach((ln, i) => {
      const ly = 1120 + i * 44, a = Math.max(off, hs), b = Math.min(off + ln.length, lim);
      if (hl > 0 && b > a) { const x0 = 60 + ctx.measureText(ln.slice(0, a - off)).width, x1 = 60 + ctx.measureText(ln.slice(0, b - off)).width; ctx.fillStyle = 'rgba(70,130,255,.25)'; ctx.fillRect(x0 - 3, ly - 30, x1 - x0 + 6, 40); }
      ctx.fillStyle = '#2a2a2a'; ctx.textAlign = 'left'; ctx.fillText(ln, 60, ly); off += ln.length + 1;
    });
    ctx.restore();
  }
  // Claude ··· Qwen header row
  function headerRow(ctx, T, x1, x2, y, s, a = 1) {
    if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
    claude(ctx, T, x1, y, s); qwen(ctx, T, x2, y, s);
    for (let k = 0; k < 3; k++) { const ph = ((T * .6 + k / 3) % 1); miniCard(ctx, lerp(x1 + s * .9, x2 - s * .9, ph), y - 4 * Math.sin(ph * 6), s * 1.3, k, Math.sin(ph * Math.PI)); }
    ctx.restore();
  }

  // 2 RELEASE (light): Anthropic mark, Claude + Qwen, then the report page slides up
  { const K = { report: c('report') };
    sfx.push({ t: A.release + .3, k: 'pop', g: -15 }, { t: K.report - .1, k: 'swoosh', g: -14 });
    add(A.release, true, (ctx, T) => {
      bgLight(ctx, T);
      const m = p(T, K.report - .15, .8, eio);
      bin(ctx, p(T, A.release + .05, .5) * (1 - m), () => live(ctx, T, 540, 650, { yaw: .2, bob: 6 }, () => anthropicMark(ctx, 540, 650, 92)));
      const cX = lerp(330, 400, m), qX = lerp(750, 680, m), Y = lerp(1020, 545, m), S = lerp(220, 54, m);
      const la = 1 - m;
      if (la > .02) for (let k = 0; k < 3; k++) live(ctx, T, 540 + (k - 1) * 30, 880 + k * 60, { seed: k, bob: 10 }, () => miniCard(ctx, 540 + (k - 1) * 40, 880 + k * 62, 200, k + 2, la * p(T, A.release + .2 + k * .12, .4), (k - 1) * .08));
      headerRow(ctx, T, cX, qX, Y, S, m);
      if (m < 1) { claude(ctx, T, cX, Y, S * (1 - m * 0), { a: 1 - m }); qwen(ctx, T, qX, Y, S, { a: 1 - m }); }
      bin(ctx, la, () => { txt(ctx, 'Claude', cX, Y + 170, 34, INK, 800); txt(ctx, 'Qwen', qX, Y + 170, 34, INK, 800); });
      const ry = lerp(1980, 640, p(T, K.report - .1, .8, eo5));
      if (ry < 1920) reportPage(ctx, T, 100, ry, 880, 1060, { scroll: 260 * p(T, K.report + .9, 1.4, eio) });
    });
  }

  // 3 SAYS (light): scroll to the Alibaba section, highlight the quote, stat card with 151,000,000
  { const K = { alib: c('alibaba'), over: c('over'), mil: c('million'), exch: c('exchanges'), with: c('with claude'), three: c('three months'), qwen: c('qwen') };
    const n0 = Math.min(K.over, K.mil) - .1;
    sfx.push({ t: K.alib, k: 'pop', g: -11 }, { t: n0, k: 'sweep', g: -16 }, { t: n0 + .35, k: 'data', g: -17 }, { t: Math.max(K.three, n0 + .8), k: 'tick', g: -12 }, { t: K.qwen, k: 'pop', g: -14 });
    add(A.says, true, (ctx, T) => {
      bgLight(ctx, T);
      const sc = p(T, A.says, 1.1, eio), shrink = p(T, n0 + .1, .9, eio);
      ctx.save(); ctx.translate(540, 640); ctx.scale(lerp(1, .82, shrink), lerp(1, .82, shrink)); ctx.translate(-540, -640 + lerp(0, -40, shrink));
      reportPage(ctx, T, 100, 640, 880, 1060, { scroll: lerp(260, 640, sc) + 120 * shrink, hl: p(T, K.over, .9, eio), alib: p(T, K.alib - .05, .5) });
      ctx.restore();
      const hx = 360; headerRow(ctx, T, hx, hx + 260, 545, 54);
      const qp = p(T, K.qwen - .05, .45, eback); if (qp > 0) pop(ctx, qp, hx + 300, 545, () => pill(ctx, hx + 300, 545, 'Qwen 3.5 · 3.6 · 3.7', { bg: PURPLE, size: 22, align: 'left' }));
      // stat card
      const ka = p(T, n0 + .25, .7, eo5);
      if (ka > 0) {
        const cy = lerp(1950, 1300, ka);
        live(ctx, T, 540, cy + 220, { yaw: .05, bob: 5, breathe: .006 }, () => {
          card(ctx, 110, cy, 860, 450, { r: 30 });
          const v = 151e6 * eo(clamp((T - n0 - .35) / Math.max(.8, K.exch - n0)));
          txt(ctx, fmt(v), 540, cy + 170, 118, INK, 800);
          bin(ctx, p(T, Math.max(K.with, n0 + .5), .45), () => { const t1 = 'exchanges with', ww = tw(ctx, t1, 36, 500); txt(ctx, t1, 540 - 70, cy + 245, 36, '#555', 500); claude(ctx, T, 540 - 70 + ww / 2 + 30, cy + 233, 36); txt(ctx, 'Claude', 540 - 70 + ww / 2 + 56, cy + 245, 36, INK, 800, 'left'); });
          ['May', 'June', 'July'].forEach((mo, i) => { const a = p(T, Math.max(K.three, n0 + .8) + i * .14, .4, eback); pop(ctx, a, 380 + i * 160, cy + 345, () => pill(ctx, 380 + i * 160, cy + 345, mo, { bg: INK, size: 28, h: 56, padX: 26 })); });
        });
      }
    });
  }

  // 4 WANTED (light): back to the pair, exchanges streaming across, "how?"
  { const K = { und: c('understand'), works: c('works') };
    add(A.wanted, true, (ctx, T) => {
      bgLight(ctx, T);
      const m = p(T, A.wanted, .9, eio), S = lerp(54, 230, m), cX = lerp(360, 300, m), qX = lerp(620, 780, m), Y = lerp(545, 1000, m);
      headerRow(ctx, T, cX, qX, Y, S);
      bin(ctx, p(T, A.wanted + .5, .4), () => { txt(ctx, 'Claude', cX, Y + 170, 34, INK, 800); txt(ctx, 'Qwen', qX, Y + 170, 34, INK, 800); });
      // magnifier sweeping the stream
      const g = p(T, K.und - .1, .5, eback);
      if (g > 0) pop(ctx, g, 540, 780, () => {
        const mx = 540 + 50 * Math.sin(T * 1.6), my = 700 + 20 * Math.sin(T * 2.3);
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.18)'; ctx.shadowBlur = 30; ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(mx, my, 92, 0, 7); ctx.fill(); ctx.restore();
        ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(mx, my, 92, 0, 7); ctx.stroke(); ctx.lineCap = 'round'; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(mx + 66, my + 66); ctx.lineTo(mx + 140, my + 140); ctx.stroke();
        txt(ctx, '?', mx, my + 34, 96, BLUE, 900);
      });
      pill(ctx, 540, 1300, 'how does it work?', { bg: '#fff', fg: INK, stroke: 'rgba(0,0,0,.12)', size: 32, h: 70, padX: 30, a: p(T, K.works - .1, .4) });
    });
  }

  // 5 TECHNIQUE (light): the "Distillation" app: choose a teacher, collect, filter, train the student
  { const K = { dist: c('distillation'), take: c('you take'), strong: c('stronger'), teacher: c('teacher'), coll: c('collect', c('teacher')), check: c('check'), train: c('train your'), own: c('own', c('train your')), student: c('student', c('train your')), end: A.training };
    sfx.push({ t: K.dist, k: 'type', g: -14 }, { t: K.strong, k: 'click', g: -10 }, { t: K.teacher, k: 'click', g: -10 }, { t: K.coll + .1, k: 'data', g: -17 }, { t: K.check + .15, k: 'success', g: -16 }, { t: K.check + .7, k: 'glitch', g: -20 }, { t: K.train, k: 'pop', g: -14 }, { t: K.student, k: 'pop', g: -12 });
    const PROMPTS = [['Explain recursion', 'A function that calls itself on a smaller input'], ['Write a regex for emails', 'Sorry, I can\'t help with that.'], ['Summarize this email', 'They want to move the meeting to Friday'], ['Why is the sky blue?', 'Air scatters blue light more than red'], ['Explain DNS', 'DNS is the'], ['Fix this failing test', 'Await the call before the assertion']];
    const OPTS = [['Claude Sonnet 4.5', 'claude'], ['GPT-5', 'chatgpt'], ['Claude Opus 4.6', 'claude'], ['Claude Opus 4.7', 'claude']];
    add(A.tech, true, (ctx, T) => {
      bgLight(ctx, T);
      // big title typing in
      const word = 'Distillation', n = Math.floor(word.length * clamp((T - K.dist + .05) / .45));
      if (n > 0) { ctx.save(); txt(ctx, word.slice(0, n - 1), 100, 650, 76, INK, 800, 'left'); const xx = 100 + tw(ctx, word.slice(0, n - 1), 76, 800); if (n < word.length) ctx.filter = 'blur(4px)'; txt(ctx, word[n - 1], xx, 650, 76, INK, 800, 'left'); ctx.restore(); }
      const wx = 90, wy = 700, ww = 900, wh = kf(T, [[K.strong - .25, 400], [K.strong + .1, 880]]), k = p(T, A.tech, .7, eo5);
      flip(ctx, k, 540, wy + wh / 2, () => live(ctx, T, 540, wy + wh / 2, { yaw: .035, bob: 4, breathe: .004 }, () => macWin(ctx, wx, wy, ww, wh, 'Distillation', (ctx, x0, y0) => {
        const st1 = T < K.strong ? 0 : T < K.check ? 1 : 2, st2 = T < K.check ? 0 : T < K.train ? 1 : 2, st3 = T < K.train ? 0 : 1;
        const steps = [['Collect', st1], ['Filter', st2], ['Train', st3 ? 1 : 0]], sx = [x0 + 150, x0 + 450, x0 + 750], sy = y0 + 70;
        ctx.strokeStyle = '#e3e3e8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx[0] + 34, sy); ctx.lineTo(sx[2] - 34, sy); ctx.stroke();
        [[0, K.check], [1, K.train]].forEach(([i, t]) => { const f = p(T, t, .5); if (f > 0) { ctx.strokeStyle = GREEN; ctx.beginPath(); ctx.moveTo(sx[i] + 34, sy); ctx.lineTo(lerp(sx[i] + 34, sx[i + 1] - 34, f), sy); ctx.stroke(); } });
        steps.forEach(([nm, s_], i) => {
          if (s_ === 2) check(ctx, sx[i], sy, 26, p(T, i ? K.train : K.check, .4), GREEN);
          else { ctx.fillStyle = s_ ? BLUE : '#fff'; ctx.strokeStyle = s_ ? BLUE : '#c9c9d0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(sx[i], sy, 26, 0, 7); ctx.fill(); ctx.stroke();
            if (i === 2 && !s_) qwen(ctx, T, sx[i], sy, 30); else txt(ctx, String(i + 1), sx[i], sy + 9, 24, s_ ? '#fff' : '#777', 800); }
          txt(ctx, nm, sx[i], sy + 66, 24, s_ === 1 ? INK : '#888', s_ === 1 ? 800 : 500);
        });
        ctx.fillStyle = '#eee'; ctx.fillRect(x0 + 30, y0 + 160, ww - 60, 1.5);
        // teacher row
        const ry = y0 + 220, picked = T >= K.teacher;
        txt(ctx, 'Teacher', x0 + 40, ry + 9, 24, '#777', 600, 'left');
        rr(ctx, x0 + 160, ry - 34, 700, 68, 14); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = T > K.strong && !picked ? BLUE : '#d9d9de'; ctx.lineWidth = T > K.strong && !picked ? 3 : 2; ctx.stroke();
        claude(ctx, T, x0 + 196, ry, 30);
        if (!picked) txt(ctx, 'Choose a model', x0 + 226, ry + 9, 25, '#888', 500, 'left');
        else { const pa = p(T, K.teacher, .35, eback); txt(ctx, 'Claude Opus 4.7', x0 + 226, ry + 9, 26, INK, 800, 'left'); pop(ctx, pa, x0 + 510, ry, () => pill(ctx, x0 + 510, ry, 'teacher', { bg: CORAL, size: 22 })); }
        ctx.strokeStyle = '#888'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + 818, ry - 5); ctx.lineTo(x0 + 828, ry + 5); ctx.lineTo(x0 + 838, ry - 5); ctx.stroke();
        // collect table / train panel
        const ta = p(T, K.coll - .1, .4) * (1 - p(T, K.train - .1, .4)), ty = y0 + 300;
        if (ta > 0) {
          ctx.save(); ctx.globalAlpha *= ta;
          txt(ctx, 'Prompt', x0 + 40, ty, 22, '#888', 700, 'left'); txt(ctx, 'Answer', x0 + 360, ty, 22, '#888', 700, 'left');
          if (T > K.check) txt(ctx, 'Quality', x0 + 860, ty, 22, '#888', 700, 'right');
          PROMPTS.forEach(([pr, an], i) => {
            const t0 = K.coll + .1 + i * .18, a = p(T, t0, .3); if (a <= 0) return;
            const yy = ty + 58 + i * 56, bad = i === 4, fx = bad ? p(T, K.check + .7, .4) : 0;
            ctx.save(); ctx.globalAlpha *= a * (1 - .55 * fx);
            ctx.save(); ctx.beginPath(); ctx.rect(x0 + 30, yy - 30, 310, 40); ctx.clip(); txt(ctx, typed(pr, T, t0, t0 + .3), x0 + 40, yy, 23, INK, 700, 'left'); ctx.restore();
            ctx.save(); ctx.beginPath(); ctx.rect(x0 + 350, yy - 30, 440, 40); ctx.clip(); txt(ctx, typed(an, T, t0 + .1, t0 + .5), x0 + 360, yy, 22, '#666', 400, 'left'); ctx.restore();
            if (fx > 0) { ctx.strokeStyle = RED; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + 40, yy - 8); ctx.lineTo(x0 + 40 + 740 * fx, yy - 8); ctx.stroke(); }
            ctx.restore();
            if (bad) xmark(ctx, x0 + 840, yy - 8, 15, p(T, K.check + .6, .3)); else check(ctx, x0 + 840, yy - 8, 15, p(T, K.check + .12 + i * .1, .3));
          });
          const fy = ty + 58 + 6 * 56 + 10, done = T > K.check + .9, v = done ? 151e6 : 150552982 * eo(clamp((T - K.coll) / Math.max(.6, K.check - K.coll)));
          ctx.fillStyle = done ? GREEN : AMBER; ctx.beginPath(); ctx.arc(x0 + 48, fy - 8, 8, 0, 7); ctx.fill();
          txt(ctx, done ? 'Collected' : 'Collecting', x0 + 66, fy, 23, done ? GREEN : '#b07300', 700, 'left');
          txt(ctx, fmt(v) + (done ? '+' : '') + '  exchanges', x0 + 860, fy, 24, INK, 700, 'right', MONO);
          ctx.restore();
        }
        const tr = p(T, K.train - .05, .5);
        if (tr > 0) bin(ctx, tr, () => {
          txt(ctx, 'Dataset', x0 + 40, ty, 25, INK, 800, 'left'); check(ctx, x0 + 160, ty - 8, 13, tr); txt(ctx, 'checked', x0 + 182, ty, 23, GREEN, 700, 'left');
          rr(ctx, x0 + 30, ty + 40, ww - 60, 420, 22); ctx.fillStyle = '#f4f4f7'; ctx.fill();
          txt(ctx, 'Base model', x0 + 60, ty + 100, 24, '#777', 600, 'left'); qwen(ctx, T, x0 + 222, ty + 92, 40); txt(ctx, 'Qwen', x0 + 252, ty + 101, 28, INK, 800, 'left');
          pop(ctx, p(T, K.student, .4, eback), x0 + 400, ty + 92, () => pill(ctx, x0 + 400, ty + 92, 'student', { bg: PURPLE, size: 22 }));
          // loss curve 2.63 -> 0.19
          const gx = x0 + 70, gy = ty + 160, gw = ww - 140, gh = 240, f = p(T, K.own - .1, Math.max(.8, K.end - K.own - .1), eio);
          txt(ctx, 'loss', gx + gw, gy - 10, 22, '#888', 600, 'right');
          ctx.strokeStyle = '#e0e0e6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
          const L = u => .19 + 2.44 * Math.exp(-u * 4.2) + .03 * Math.sin(u * 40) * (1 - u);
          ctx.strokeStyle = PURPLE; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.beginPath();
          for (let i = 0; i <= 80 * f; i++) { const u = i / 80, X = gx + gw * u, Y = gy + gh - (L(u) / 2.7) * gh; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.stroke();
          const u = f, X = gx + gw * u, Y = gy + gh - (L(u) / 2.7) * gh; ctx.fillStyle = PURPLE; ctx.beginPath(); ctx.arc(X, Y, 8, 0, 7); ctx.fill();
          txt(ctx, L(u).toFixed(2), X + (u > .8 ? -14 : 16), Y - 16, 26, PURPLE, 800, u > .8 ? 'right' : 'left', MONO);
          txt(ctx, 'training loss · Qwen3 0.6B', gx + gw, gy + gh + 40, 19, '#999', 500, 'right');
        });
        // dropdown overlay
        const open = T > K.strong + .08 && T < K.teacher + .05;
        if (open) {
          const oa = p(T, K.strong + .08, .2), hov = Math.round(kf(T, [[K.strong + .2, 0], [K.teacher - .15, 3]]));
          ctx.save(); ctx.globalAlpha *= oa; card(ctx, x0 + 160, ry + 44, 700, 4 * 62 + 16, { r: 16, sh: .8 });
          OPTS.forEach(([nm, lg], i) => {
            const oy = ry + 52 + i * 62; if (i === hov) { rr(ctx, x0 + 168, oy, 684, 56, 10); ctx.fillStyle = BLUE; ctx.fill(); }
            if (lg === 'chatgpt') logo(ctx, i === hov ? 'chatgpt' : 'chatgpt', x0 + 200, oy + 28, 28); else claude(ctx, T, x0 + 200, oy + 28, 26);
            txt(ctx, nm, x0 + 230, oy + 37, 25, i === hov ? '#fff' : INK, 600, 'left');
          });
          ctx.restore();
        }
        // cursor
        const cxp = kf(T, [[K.take, x0 + 980], [K.strong - .1, x0 + 700], [K.teacher - .15, x0 + 520], [K.coll + .6, x0 + 1000]]), cyp = kf(T, [[K.take, y0 + 900], [K.strong - .1, ry + 4], [K.teacher - .15, ry + 52 + 3 * 62 + 30], [K.coll + .6, y0 + 900]]);
        const press = Math.max(clamp(1 - Math.abs(T - K.strong) / .12), clamp(1 - Math.abs(T - K.teacher) / .12));
        if (T > K.take && T < K.coll + .6) { cursor(ctx, cxp, cyp, press); clickRing(ctx, cxp, cyp, (T - K.strong) / .4); clickRing(ctx, cxp, cyp, (T - K.teacher) / .4); }
      })));
    });
  }

  // 6 WEIGHTS (dark): Qwen drops in, its weights become a wall of 235 billion numbers
  { const K = { w: c('weights'), bil: c('billions'), calc: c('calculates') };
    sfx.push({ t: A.training + .35, k: 'shutter', g: -12 }, { t: K.w, k: 'pop', g: -14 }, { t: K.bil, k: 'sweep', g: -15 }, { t: K.bil + .2, k: 'data', g: -17 });
    add(A.training, false, (ctx, T) => {
      bgDark(ctx, T, 540, 900);
      const d = p(T, A.training + .05, .45, eback), qy = lerp(-200, 640, d), vel = (1 - p(T, A.training + .05, .45)) * 1;
      for (let g = 3; g >= 1; g--) if (vel > .05) qwen(ctx, T, 540, qy - g * 60 * vel, 170, { a: .18 * vel });
      qwen(ctx, T, 540, qy, 170, { glow: .9 });
      bin(ctx, p(T, A.training + .5, .4), () => txt(ctx, 'Qwen3-235B', 540, 770, 26, 'rgba(255,255,255,.7)', 700));
      const wa = p(T, K.w - .1, .5); if (wa <= 0) return;
      const Z = lerp(1, .24, p(T, K.bil, 1.4, eio)), tile = (ox, oy, a) => {
        ctx.save(); ctx.globalAlpha *= a; ctx.translate(ox, oy);
        rr(ctx, -380, -240, 760, 480, 22); ctx.fillStyle = 'rgba(28,26,44,.92)'; ctx.fill(); ctx.strokeStyle = `rgba(${PURPLE_RGB},.45)`; ctx.lineWidth = 2; ctx.stroke();
        ctx.font = MONO(600, 30); ctx.textAlign = 'center';
        for (let r = 0; r < 8; r++) for (let q = 0; q < 5; q++) { const fl = Math.floor(T * 3 + hash(r * 5 + q + ox, 1) * 9); const hot = hash(r * 5 + q, fl) > .86;
          ctx.fillStyle = hot ? '#c9bfff' : 'rgba(220,220,235,.75)'; ctx.fillText(NUMS(r, q, fl + ox), -300 + q * 150, -170 + r * 52); }
        ctx.restore();
      };
      ctx.save(); rr(ctx, 50, 860, 980, 560, 30); ctx.clip();
      ctx.translate(540, 1140); ctx.scale(Z, Z);
      const others = p(T, K.bil + .1, .8);
      for (let ix = -3; ix <= 3; ix++) for (let iy = -2; iy <= 2; iy++) { if (!ix && !iy) continue; if (others > 0) tile(ix * 800, iy * 520, others * (.6 + .4 * hash(ix, iy))); }
      bin(ctx, wa, () => tile(0, 0, 1));
      ctx.restore();
      ctx.strokeStyle = `rgba(${PURPLE_RGB},.35)`; ctx.lineWidth = 2; rr(ctx, 50, 860, 980, 560, 30); ctx.globalAlpha = wa; ctx.stroke(); ctx.globalAlpha = 1;
      pop(ctx, p(T, K.w, .4, eback), 540, 860, () => pill(ctx, 540, 860, 'weights', { bg: PURPLE, size: 28 }));
      const ca = p(T, K.bil + .1, .5);
      if (ca > 0) bin(ctx, ca, () => {
        const v = 235e9 * eo(clamp((T - K.bil - .1) / Math.max(1, K.calc + .5 - K.bil)));
        ctx.save(); ctx.shadowColor = `rgba(${PURPLE_RGB},.9)`; ctx.shadowBlur = 30; txt(ctx, fmt(v), 540, 1545, 92, '#fff', 800); ctx.restore();
        txt(ctx, 'Qwen3-235B  ·  235 billion weights', 540, 1610, 28, '#a99cff', 700);
      });
    });
  }

  // token row shared by scenes 7-10 (dark)
  const TY = 640;
  function numCols(ctx, T, lay, y, a, t0) {
    ctx.font = MONO(600, 19); ctx.textAlign = 'center';
    lay.forEach((o, i) => { for (let r = 0; r < 6; r++) { const k = clamp((T - t0 - i * .07 - r * .05) / .2) * a; if (k <= 0) continue;
      ctx.globalAlpha = k; ctx.fillStyle = TOKCOL[i]; ctx.fillText(NUMS(i, r, Math.floor(T * .8 + i)), o.x + o.w / 2, y + r * 30); } });
    ctx.globalAlpha = 1;
  }

  // 7 TOKENS (dark): text -> token chips -> lists of numbers
  { const K = { cuts: c('cuts'), tok: c('tokens'), small: c('small pieces'), turns: c('turns'), list: c('list') };
    sfx.push({ t: K.cuts, k: 'type', g: -15 }, { t: K.tok, k: 'shatter', g: -15 }, { t: K.small, k: 'tick', g: -14 }, { t: K.turns + .2, k: 'data', g: -17 });
    add(A.first, false, (ctx, T) => {
      bgDark(ctx, T, 540, 1200);
      const lay = rowLayout(ctx, TOKS, 540, 30), sent = TOKS.join(' '), tk = p(T, K.tok - .05, .6, eio);
      // input field with the typed sentence
      const fa = (1 - tk) * p(T, A.first + .1, .4);
      if (fa > 0) { ctx.save(); ctx.globalAlpha *= fa; rr(ctx, 110, TY - 50, 860, 100, 20); ctx.fillStyle = '#16161d'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
      ctx.font = MONO(700, 30); const cw = ctx.measureText('a').width, sx = 540 - sent.length * cw / 2;
      const shown = typed(sent, T, K.cuts - .3, K.tok - .25);
      if (tk < 1) { ctx.save(); ctx.globalAlpha *= 1 - tk; txt(ctx, shown, sx, TY + 11, 30, '#f2f2f6', 700, 'left', MONO); if (caret(T) && T < K.tok) { ctx.fillStyle = '#fff'; ctx.fillRect(sx + shown.length * cw + 3, TY - 20, 3, 40); } ctx.restore(); }
      let ci = 0; TOKS.forEach((t, i) => { const from = sx + ci * cw - cw * .9; ci += t.length + 1; const a = p(T, K.tok - .05 + i * .06, .35);
        if (a > 0) chip(ctx, lerp(from, lay[i].x, eo(a)), TY, t, TOKCOL[i], { a, glow: 1 - a }); });
      const la = p(T, K.small, .4); if (la > 0) { const o = lay[4]; ctx.save(); ctx.globalAlpha = la; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(o.x + o.w / 2, TY + 28); ctx.lineTo(o.x + o.w / 2, TY + 60 * la); ctx.stroke(); ctx.restore(); bin(ctx, la * (1 - p(T, K.turns, .3)), () => txt(ctx, 'token', o.x + o.w / 2, TY + 92, 28, '#fff', 800)); }
      numCols(ctx, T, lay, TY + 70, p(T, K.turns, .3), K.turns + .1);
      bin(ctx, p(T, K.list, .4), () => txt(ctx, 'a list of numbers', 540, TY + 285, 30, '#fff', 800));
      live(ctx, T, 540, 1150, { yaw: .2, bob: 10 }, () => { qwen(ctx, T, 540, 1150, 170, { glow: .8 }); txt(ctx, 'Qwen3 0.6B', 540, 1285, 28, 'rgba(255,255,255,.75)', 700); });
    });
  }

  // 8 LAYERS (dark): 28 layers stack up, one layer up close = numbers x weights
  { const K = { mult: c('multiplies'), w2: c('weights', c('multiplies') - .5) };
    sfx.push({ t: A.then + .3, k: 'gear', g: -16 }, { t: K.mult, k: 'pop', g: -14 }, { t: K.w2, k: 'tick', g: -12 });
    add(A.then, false, (ctx, T) => {
      bgDark(ctx, T, 540, 1150);
      const lay = rowLayout(ctx, TOKS, 540, 30);
      TOKS.forEach((t, i) => chip(ctx, lay[i].x, TY, t, TOKCOL[i]));
      numCols(ctx, T, lay, TY + 70, 1, -10);
      const nL = Math.round(kf(T, [[A.then + .2, 1], [K.mult + .2, 28]], e => e)), sa = p(T, A.then + .1, .4);
      bin(ctx, sa, () => { const s1 = 'layer ' + nL, s2 = ' of 28', w1 = tw(ctx, s1, 30, 800), w2 = tw(ctx, s2, 30, 500); txt(ctx, s1, 540 - (w1 + w2) / 2, 940, 30, '#fff', 800, 'left'); txt(ctx, s2, 540 - (w1 + w2) / 2 + w1, 940, 30, '#9a9aa8', 500, 'left'); });
      // stack of plates (purple slab)
      for (let i = 0; i < nL; i++) {
        const y = 1170 - i * 6.5, a = sa * clamp(.35 + i / 40);
        ctx.fillStyle = `rgba(${PURPLE_RGB},${.55 * a})`; ctx.beginPath(); ctx.moveTo(250, y); ctx.lineTo(790, y); ctx.lineTo(840, y - 34); ctx.lineTo(300, y - 34); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = `rgba(190,180,255,${.5 * a})`; ctx.lineWidth = 1.2; ctx.stroke();
      }
      glowDot(ctx, 545, 1080, 380, PURPLE_RGB, .5 * sa);
      // one layer up close
      const pa = p(T, K.mult - .15, .5, eo5); if (pa <= 0) return;
      flip(ctx, pa, 540, 1440, () => {
        card(ctx, 70, 1250, 940, 400, { r: 24, fill: '#15141f', dark: true, stroke: `rgba(${PURPLE_RGB},.5)` });
        txt(ctx, 'one layer, up close', 105, 1300, 24, '#a7a7b8', 600, 'left');
        ctx.font = MONO(600, 25); ctx.textAlign = 'center'; const sw = Math.floor(kf(T, [[K.mult + .2, 0], [K.w2 + .3, 3]], e => e)) % 3;
        for (let r = 0; r < 6; r++) {
          const yy = 1350 + r * 40; ctx.fillStyle = '#5fd2ff'; ctx.fillText(NUMS(0, r, 9), 175, yy + 8);
          for (let q = 0; q < 3; q++) { if (q === sw && T > K.mult + .2) { ctx.fillStyle = `rgba(${PURPLE_RGB},.45)`; ctx.fillRect(365 + q * 125 - 58, yy - 20, 116, 38); } ctx.fillStyle = '#e8e8f0'; ctx.fillText(NUMS(r, q, 11), 365 + q * 125, yy + 8); }
        }
        txt(ctx, '×', 258, 1468, 44, '#fff', 600); txt(ctx, '=', 680, 1468, 44, '#fff', 600);
        const ra = p(T, K.w2, .5); ctx.font = MONO(700, 25);
        for (let r = 0; r < 3; r++) { ctx.globalAlpha = clamp(ra * 3 - r); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(NUMS(r, 5, 13), 830, 1415 + r * 44); } ctx.globalAlpha = 1;
        txt(ctx, 'numbers', 175, 1620, 23, '#5fd2ff', 700); txt(ctx, 'weights', 490, 1620, 23, '#c9bfff', 700); if (ra > 0) txt(ctx, 'new numbers', 830, 1620, 23, '#fff', 700);
      });
    });
  }

  // 9 ATTENTION (dark): the last word looks back at the earlier words
  { const K = { looks: c('looks back'), earlier: c('earlier'), each: c('each word|context'), ctx: c('context') };
    sfx.push({ t: K.looks, k: 'sweep', g: -15 }, { t: K.ctx, k: 'shimmer', g: -15 });
    add(A.along, false, (ctx, T) => {
      bgDark(ctx, T, 540, 950);
      const m = p(T, A.along, .8, eio), size = lerp(30, 38, m), y = lerp(TY, 1000, m);
      const lay = rowLayout(ctx, TOKS, 540, size, lerp(12, 14, m));
      numCols(ctx, T, rowLayout(ctx, TOKS, 540, 30), TY + 70, 1 - p(T, A.along, .35), -10);
      const last = lay[6], lx = last.x + last.w / 2, WGT = [.55, .35, .5, .25, 1, .4];
      ctx.save(); ctx.lineCap = 'round';
      WGT.forEach((wg, i) => {
        const a = p(T, K.looks + i * .1, .5); if (a <= 0) return;
        const o = lay[i], x = o.x + o.w / 2, top = y - size * .9, hgt = 80 + (lx - x) * .55;
        const g = ctx.createLinearGradient(x, 0, lx, 0); g.addColorStop(0, TOKCOL[i]); g.addColorStop(1, TOKCOL[6]);
        ctx.strokeStyle = g; ctx.lineWidth = 3 + 13 * wg; ctx.globalAlpha = .9; ctx.beginPath();
        const N = 40; for (let k = 0; k <= N * a; k++) { const u = 1 - k / N, X = lerp(x, lx, u), Y = top - Math.sin(u * Math.PI) * hgt; k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.stroke();
        ctx.globalAlpha = 1; if (a >= 1) { const u = 1 - ((T * .7 + i * .17) % 1), X = lerp(x, lx, u), Y = top - Math.sin(u * Math.PI) * hgt; glowDot(ctx, X, Y, 26, '255,255,255', .9); }
      });
      ctx.restore();
      const glowK = p(T, K.ctx - .2, .6);
      TOKS.forEach((t, i) => chip(ctx, lay[i].x, y, t, TOKCOL[i], { size, glow: i === 6 ? .8 + .2 * Math.sin(T * 4) : glowK * (.5 + .5 * Math.sin(T * 3 + i)) }));
      bin(ctx, p(T, K.earlier, .45), () => { txt(ctx, 'looks back', 540, y + 130, 34, '#fff', 800); txt(ctx, 'thicker line = matters more', 540, y + 180, 26, '#9a9aa8', 500); });
      const ca = p(T, K.ctx - .1, .5, eback);
      pop(ctx, ca, 540, 1400, () => { card(ctx, 200, 1340, 680, 120, { r: 22, fill: '#17171f', dark: true, stroke: 'rgba(255,255,255,.1)' }); txt(ctx, '“to” = the word right after', 540, 1393, 28, '#d8d8e2', 600); txt(ctx, '“the best way to learn is …”', 540, 1435, 26, '#9a9aa8', 500); });
    });
  }

  // 10 NEXT TOKEN (dark): probability bars, pick "practice", add it, repeat
  { const K = { prob: c('probability', A.end), every: c('every possible'), picks: c('picks one'), sent: c('sentence'), rep: c('repeats') };
    sfx.push({ t: K.prob, k: 'sweep', g: -16 }, { t: K.picks, k: 'click', g: -11 }, { t: K.sent, k: 'pop', g: -13 }, { t: K.rep, k: 'pop', g: -13 });
    const BARS = [['practice', 31.3], ['do', 15.8], ['learn', 13.9], ['teach', 2.3], ['try', 1.7]];
    add(A.end, false, (ctx, T) => {
      bgDark(ctx, T, 540, 1150);
      const l1 = TOKS.slice(0, 5), l2 = ['is', 'to'], lay1 = rowLayout(ctx, l1, 540, 32), added = T > K.sent - .15, dot = T > K.rep;
      l1.forEach((t, i) => chip(ctx, lay1[i].x, 620, t, TOKCOL[i], { size: 32 }));
      const l2t = [...l2, added ? 'practice' : '        ', ...(dot ? ['.'] : [])], lay2 = rowLayout(ctx, l2t, 540, 32);
      chip(ctx, lay2[0].x, 700, 'is', TOKCOL[5], { size: 32 }); chip(ctx, lay2[1].x, 700, 'to', TOKCOL[6], { size: 32 });
      const slot = lay2[2];
      if (!added) { ctx.save(); ctx.setLineDash([8, 7]); ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 2; rr(ctx, slot.x, 675, slot.w, 50, 9); ctx.stroke(); ctx.restore(); if (caret(T)) { ctx.fillStyle = '#fff'; ctx.fillRect(slot.x + 18, 684, 3, 32); } }
      else chip(ctx, slot.x, 700, 'practice', PURPLE, { size: 32, glow: 1 - p(T, K.sent, .6) });
      if (dot) { const a = p(T, K.rep, .3, eback); pop(ctx, a, lay2[3].x + 20, 700, () => chip(ctx, lay2[3].x, 700, '.', '#c9cdd6', { size: 32, lead: false })); }
      // chart
      const loop = p(T, K.rep + .1, .5), regrow = p(T, K.rep + .7, .7, eio);
      bin(ctx, p(T, A.end + .2, .4), () => txt(ctx, 'next token, by probability', 120, 900, 32, '#fff', 800, 'left'));
      BARS.forEach(([w, v], i) => {
        const y = 980 + i * 86, g = p(T, K.prob - .1 + i * .1, .6, eio), win_ = i === 0 && T > K.picks, v2 = [38, 21, 9, 4, 2][i];
        const frac = (lerp(v, v2, regrow) / 40) * g * (1 - loop * (1 - regrow));
        if (win_) { rr(ctx, 90, y - 34, 900, 68, 16); ctx.fillStyle = `rgba(${PURPLE_RGB},${.25 * p(T, K.picks, .3)})`; ctx.fill(); }
        txt(ctx, w, 300, y + 10, 30, win_ ? '#fff' : '#c8c8d4', 700, 'right', MONO);
        bar(ctx, 325, y - 16, 520, 32, frac, win_ ? PURPLE : '#7a7d8c', 'rgba(255,255,255,.06)');
        if (g > 0) txt(ctx, lerp(v, v2, regrow).toFixed(1) + '%', 945, y + 10, 27, '#c8c8d4', 600, 'right', MONO);
      });
      const ea = p(T, K.every, .5); if (ea > 0) { ctx.save(); ctx.globalAlpha = ea; for (let k = 0; k < 70; k++) { const h = 40 * Math.exp(-k / 9) + 2; ctx.fillStyle = 'rgba(160,160,180,.5)'; ctx.fillRect(325 + k * 7.4, 1440 - h, 4.5, h); } ctx.restore();
        txt(ctx, '+151,931 more possible tokens', 540, 1490, 26, `rgba(170,170,190,${ea})`, 600); }
      // winner flies into the sentence
      const fl = p(T, K.picks + .15, Math.max(.4, K.sent - K.picks - .2), eio);
      if (fl > 0 && fl < 1) chip(ctx, lerp(130, slot.x, fl), lerp(980, 700, fl) - Math.sin(fl * Math.PI) * 120, 'practice', PURPLE, { size: 32, glow: 1 });
    });
  }

  // 11 TRAINING (light): teacher's answer vs student's guess; weights nudged until "teach" wins
  { const K = { ans: c("teacher's answer"), which: c('which token'), next: c('next', c('which token')), low: c('low'), calc: c('training calculates'), adj: c('adjust'), fix: c('fix'), rep: c('repeat that'), starts: c('starts answering'), without: c('without ever') };
    sfx.push({ t: K.ans, k: 'pop', g: -14 }, { t: K.which, k: 'swoosh', g: -16 }, { t: K.next + .55, k: 'drip', g: -12 }, { t: K.low, k: 'glitch', g: -19 }, { t: K.adj, k: 'data', g: -18 }, { t: K.rep, k: 'riser', g: -17 }, { t: K.starts, k: 'success', g: -13 }, { t: K.without + .3, k: 'shatter', g: -15 });
    const B0 = [['practice', 31.3, 2.1], ['do', 15.8, 2.7], ['learn', 13.9, 9.0], ['teach', 2.3, 82.5], ['try', 1.7, .4]];
    add(A.during, true, (ctx, T) => {
      bgLight(ctx, T);
      const m = p(T, K.ans - .2, .8, eio), y = lerp(1000, 560, m), x1 = lerp(330, 230, m), x2 = lerp(750, 850, m), S = lerp(170, 54, m);
      // link dots (break when "without ever contacting")
      const brk = p(T, K.without + .2, .4);
      for (let k = 0; k < 7; k++) { const u = (k + .5) / 7, ph = ((T * .7 - u) % 1 + 1) % 1; ctx.fillStyle = `rgba(${CORAL_RGB},${(.35 + .65 * (ph < .15 ? 1 : 0)) * (1 - brk * (Math.abs(u - .5) < .2 ? 1 : .6))})`; ctx.beginPath(); ctx.arc(lerp(x1 + S * .9, x2 - S * .9, u), y + (brk * (u - .5) * 30), lerp(7, 4, m), 0, 7); ctx.fill(); }
      if (brk > 0) { xmark(ctx, 540, y, 20, brk, RED); bin(ctx, brk, () => txt(ctx, 'never contacted', 540, y + 50, 22, RED, 700)); }
      live(ctx, T, x1, y, { yaw: .2, bob: 4 }, () => claude(ctx, T, x1, y, S)); live(ctx, T, x2, y, { yaw: .2, bob: 4, seed: 2 }, () => qwen(ctx, T, x2, y, S));
      txt(ctx, 'teacher', lerp(x1, x1 + 50, m), lerp(y + S * .9, y + 8, m), lerp(34, 24, m), INK, 700, m > .5 ? 'left' : 'center');
      txt(ctx, 'student', lerp(x2, x2 - 50, m), lerp(y + S * .9, y + 8, m), lerp(34, 24, m), INK, 700, m > .5 ? 'right' : 'center');
      // teacher's answer
      const qa = p(T, K.ans, .5); let teachX = 0;
      if (qa > 0) bin(ctx, qa, () => { card(ctx, 140, 615, 800, 100, { r: 20 }); claude(ctx, T, 190, 665, 34); const s1 = 'The best way to learn is to ', w1 = tw(ctx, s1, 34, 400, SERIF); txt(ctx, s1, 225, 677, 34, INK, 400, 'left', SERIF);
        teachX = 225 + w1; const tw2 = tw(ctx, 'teach.', 34, 400, SERIF); rr(ctx, teachX - 4, 645, tw2 + 8, 44, 6); ctx.fillStyle = `rgba(${CORAL_RGB},.18)`; ctx.fill(); txt(ctx, 'teach.', teachX, 677, 34, INK, 400, 'left', SERIF); ctx.fillStyle = CORAL; ctx.fillRect(teachX, 684, tw2, 3); });
      // chart
      const ca = p(T, K.which - .1, .5); if (ca <= 0) return;
      const steps = kf(T, [[K.rep, 0], [K.starts + .2, 1]], e => e), stepN = T < K.rep ? 1 : 1 + Math.floor(steps * 10);
      const fixK = p(T, K.fix, .6, eio), qv = i => { const [, a, b] = B0[i]; const s0 = i === 3 ? lerp(a, 5.3, fixK) : a; const s1 = i === 3 ? 5.3 : a; return T < K.rep ? s0 : lerp(s1, b, eio(steps)); };
      bin(ctx, ca, () => {
        card(ctx, 100, 770, 880, 480, { r: 26 });
        txt(ctx, 'Qwen', 140, 830, 26, PURPLE, 800, 'left'); txt(ctx, '’s next word after “…is to”', 140 + tw(ctx, 'Qwen', 26, 800), 830, 26, '#444', 600, 'left');
        if (T > K.rep) pill(ctx, 860, 822, `step ${stepN} of 11`, { bg: '#eef0ff', fg: PURPLE, size: 20 });
        B0.forEach(([w], i) => {
          const yy = 900 + i * 72, v = qv(i), hl = i === 3 ? p(T, K.low, .4) : 0, good = i === 3 && v > 50;
          if (hl > 0) { rr(ctx, 120, yy - 30, 840, 60, 14); ctx.fillStyle = good ? `rgba(48,192,96,${.14 * hl})` : `rgba(242,161,20,${.18 * hl})`; ctx.fill(); }
          txt(ctx, w, 290, yy + 9, 27, INK, 600, 'right', MONO);
          bar(ctx, 315, yy - 14, 500, 28, v / 90 * p(T, K.which + i * .08, .6, eio), good ? GREEN : hl > .5 ? AMBER : '#737886', 'rgba(0,0,0,.07)');
          txt(ctx, v.toFixed(1) + '%', 935, yy + 9, 25, good ? GREEN : '#555', 700, 'right', MONO);
        });
      });
      // "teach" chip drops from the answer onto its row
      const dp = p(T, K.next - .1, .6, eio);
      if (dp > 0 && T < K.rep + .3) chip(ctx, lerp(560, 105, dp), lerp(665, 1116, dp) - Math.sin(dp * Math.PI) * 60, 'teach', CORAL, { size: 22, dark: false, a: 1 - p(T, K.rep, .3) });
      // weights card
      const wa = p(T, K.calc - .1, .5);
      if (wa > 0) bin(ctx, wa, () => {
        ctx.strokeStyle = AMBER; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(540, 1255); ctx.lineTo(540, 1295); ctx.stroke();
        card(ctx, 150, 1300, 780, 190, { r: 24 });
        const nud = p(T, K.adj, .4), title = nud > 0 ? 'weights, nudged' : 'weights';
        txt(ctx, title, 540, 1350, 26, nud > 0 ? '#b07300' : '#666', 700);
        const base = [0.00585938, -0.00418091, 0.01965332], fl = Math.floor(T * 12);
        base.forEach((b, i) => { const v = T > K.adj ? b + (T < K.adj + .5 ? (hash(i, fl) - .5) * .004 : [.00031, -.00027, .00044][i] * (1 + Math.floor(steps * 10))) : b;
          txt(ctx, v.toFixed(8), 280 + i * 260, 1430, 33, INK, 700, 'center', MONO); });
      });
      // student now answers like the teacher
      const sa = p(T, K.starts - .05, .5);
      if (sa > 0) bin(ctx, sa, () => { card(ctx, 140, 1545, 800, 100, { r: 20, stroke: 'rgba(48,192,96,.5)' }); qwen(ctx, T, 190, 1595, 38); const s1 = 'The best way to learn is to ', w1 = tw(ctx, s1, 34, 400, SERIF); txt(ctx, s1, 225, 1607, 34, INK, 400, 'left', SERIF);
        const tw2 = tw(ctx, 'teach.', 34, 400, SERIF); rr(ctx, 225 + w1 - 4, 1575, tw2 + 8, 44, 6); ctx.fillStyle = `rgba(${PURPLE_RGB},.16)`; ctx.fill(); txt(ctx, 'teach.', 225 + w1, 1607, 34, INK, 400, 'left', SERIF); check(ctx, 930, 1550, 22, p(T, K.starts + .2, .4)); });
    });
  }

  // hidden-state cell colours (pink / blue), lit row by row
  const litFn = (T, t0) => (i, j) => { const row = 27 - i, on = clamp((T - t0) * 9 - row * .5); if (on <= 0) return ['0,0,0', 0]; const h = hash(i * 31 + j, 4), f = .55 + .45 * Math.sin(T * 3 + h * 9);
    return [h > .55 ? '236,72,153' : '56,189,248', on * (.25 + .65 * h) * f]; };

  // 12 CATCH (dark): the hidden states stay inside the model (and inside Claude)
  { const K = { betw: c('between'), hid: c('hidden'), stay: c('stay inside') };
    sfx.push({ t: A.catch + .1, k: 'riser', g: -17 }, { t: K.betw, k: 'glitch', g: -18 }, { t: K.hid, k: 'pop', g: -13 }, { t: K.stay, k: 'shutter', g: -13 });
    add(A.catch, false, (ctx, T) => {
      bgDark(ctx, T, 540, 1000);
      const rise = p(T, A.catch, .8, eo5), hid = p(T, K.hid - .1, .7, eio), box = p(T, K.stay - .1, .9, eio);
      const sc = lerp(1, .6, hid), cy = lerp(lerp(1500, 1010, rise), 760, hid);
      const cubeAt = (c2, cx_, cy_, s_) => { c2.save(); c2.translate(cx_, cy_); c2.scale(s_, s_); layerCube(c2, T, -210, -240, 420, 480, { dx: 80 + 25 * Math.sin(T * .7), dy: -55, lit: litFn(T, K.betw), a: 1 }); c2.restore(); };
      if (box < 1) { ctx.save(); ctx.globalAlpha = 1 - box; cubeAt(ctx, 540, cy, sc); ctx.restore(); }
      if (T > K.betw && hid < 1) bin(ctx, p(T, K.betw + .3, .4) * (1 - hid), () => { const L = Math.min(28, 1 + Math.floor((T - K.betw) * 9)); txt(ctx, `after layer ${L}  ·  biggest ${(2.55 + .4 * Math.sin(T * 2)).toFixed(2)}`, 540, 1340, 26, '#bfc3d6', 600, 'center', MONO); });
      const ga = hid * (1 - p(T, K.stay - .1, .5));
      if (ga > 0) bin(ctx, ga, () => {
        txt(ctx, 'hidden states', 540, 1060, 48, '#fff', 800);
        for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) { const h = hash(r * 4 + q, 6), fl = Math.floor(T * 4 + h * 5), v = (hash(r * 4 + q, fl) - .5) * 30;
          rr(ctx, 230 + q * 160, 1100 + r * 66, 140, 54, 10); ctx.fillStyle = h > .5 ? 'rgba(236,72,153,.55)' : 'rgba(56,189,248,.5)'; ctx.fill(); txt(ctx, v.toFixed(2), 300 + q * 160, 1137 + r * 66, 26, '#fff', 700, 'center', MONO); }
        txt(ctx, '… 1,024 numbers', 540, 1340, 24, '#9a9aa8', 600, 'center', MONO);
      });
      if (box > 0) { ctx.save(); const bs = lerp(.4, 1, eback(box)); ctx.translate(540, 1010); ctx.scale(bs, bs); ctx.translate(-540, -1010);
        apiBox(ctx, T, 540, 1010, 760, 620, (c2, sx, sy, sw, sh) => cubeAt(c2, sx + sw / 2 - 30, sy + sh / 2 + 20, .62), { a: clamp(box * 2) }); ctx.restore(); }
      txt(ctx, 'measured on an open model · Qwen3 0.6B', 540, 1500, 22, 'rgba(200,200,215,.5)', 500);
    });
  }

  // 13 SHOWS (dark): the API returns one token; the probabilities, hesitation and path stay hidden
  { const K = { picked: c('picked'), full: c('full probabilities'), hes: c('hesitating'), two: c('two words'), so: c('so the student'), how: c('how the teacher') }; K.two = Math.max(K.two, K.hes + .4);
    sfx.push({ t: K.picked, k: 'pop', g: -12 }, { t: K.full + .35, k: 'shatter', g: -13 }, { t: K.hes, k: 'sweep', g: -16 }, { t: K.so + .3, k: 'drip', g: -13 }, { t: K.how, k: 'glitch', g: -18 });
    const PATH = ['avoid', 'have', 'find', 'either', 'hard', 'themselves', 'practice', 'learn', 'practice'];
    add(A.shows, false, (ctx, T) => {
      bgDark(ctx, T, 540, 1000);
      const ph = T < K.full ? 0 : T < K.hes ? 1 : T < K.how ? 2 : 3;
      live(ctx, T, 540, 1010, { yaw: .03, bob: 5, breathe: .004 }, () => apiBox(ctx, T, 540, 1010, 760, 620, (c2, sx, sy, sw, sh) => {
        const pa = (t0) => p(T, t0, .4);
        if (ph === 0) { c2.save(); c2.translate(sx + sw / 2 - 30, sy + sh / 2 + 20); c2.scale(.62, .62); layerCube(c2, T, -210, -240, 420, 480, { dx: 80 + 25 * Math.sin(T * .7), dy: -55, lit: litFn(T, -99) }); c2.restore(); }
        if (ph === 1) { const a = pa(K.full); c2.save(); c2.globalAlpha = a;
          txt(c2, fmt(lerp(133513, 151936, p(T, K.full, 1))) + ' possible next tokens', sx + sw / 2, sy + 100, 26, '#e6e6f0', 700);
          for (let k = 0; k < 90; k++) { const h = (k ? 230 * Math.exp(-k / 7) : 230) + 3 + 2 * Math.sin(T * 3 + k); c2.fillStyle = k === 0 ? PURPLE : 'rgba(170,175,200,.75)'; c2.fillRect(sx + 50 + k * 6.6, sy + 400 - h * clamp(a * 1.4 - k / 140), 4.4, h * clamp(a * 1.4 - k / 140)); }
          const lk = p(T, K.full + .35, .45, eback); c2.fillStyle = `rgba(0,0,0,${.55 * clamp(lk)})`; c2.fillRect(sx, sy, sw, sh);
          if (lk > 0) { const ly = lerp(sy - 120, sy + sh / 2 - 10, clamp(lk)); c2.strokeStyle = '#e8e8f0'; c2.lineWidth = 14; c2.beginPath(); c2.arc(sx + sw / 2, ly - 40, 44, Math.PI, 0); c2.stroke(); rr(c2, sx + sw / 2 - 72, ly - 40, 144, 110, 18); c2.fillStyle = '#e8e8f0'; c2.fill(); c2.fillStyle = '#222'; c2.beginPath(); c2.arc(sx + sw / 2, ly + 5, 12, 0, 7); c2.fill(); c2.fillRect(sx + sw / 2 - 4, ly + 5, 8, 30); }
          c2.restore(); }
        if (ph === 2) { const a = pa(K.hes); c2.save(); c2.globalAlpha = a;
          const L = Math.round(kf(T, [[K.hes, 24], [K.so - .3, 28]], e => e));
          txt(c2, 'its best guess, layer by layer', sx + sw / 2, sy + 90, 26, '#e6e6f0', 700); txt(c2, `layer ${L} of 28`, sx + sw / 2, sy + 130, 22, '#9a9aa8', 600, 'center', MONO);
          const [pv, lv] = kf(T, [[K.hes, [78, 17]], [K.two, [37, 33]], [K.two + 1.1, [43, 18]], [K.so - .2, [31, 14]]]);
          [['practice', pv, PURPLE], ['learn', lv, '#ec4899']].forEach(([w, v, col], i) => { const yy = sy + 210 + i * 90; txt(c2, w, sx + 190, yy + 10, 28, '#fff', 700, 'right', MONO); bar(c2, sx + 210, yy - 18, 380, 36, v / 85, col, 'rgba(255,255,255,.08)'); txt(c2, Math.round(v) + '%', sx + 640, yy + 10, 26, '#ddd', 700, 'right', MONO); });
          if (T > K.two) txt(c2, 'two words, neck and neck', sx + sw / 2, sy + 430, 24, `rgba(236,72,153,${p(T, K.two, .4)})`, 700);
          c2.restore(); }
        if (ph === 3) { const a = pa(K.how), d = p(T, K.how + .1, Math.max(.8, A.why - K.how - .4), clamp); c2.save(); c2.globalAlpha = a;
          txt(c2, 'how it got there', sx + sw / 2, sy + 70, 26, '#e6e6f0', 700);
          const pts = PATH.map((w, i) => [sx + 120 + (i % 2 ? 300 : 0) + 60 * Math.sin(i * 1.7), sy + 110 + i * 38, w]);
          c2.strokeStyle = 'rgba(255,255,255,.08)'; c2.lineWidth = 1; for (let i = 0; i < 9; i++) { c2.beginPath(); c2.moveTo(sx + 30, sy + 110 + i * 38); c2.lineTo(sx + sw - 30, sy + 110 + i * 38); c2.stroke(); }
          c2.strokeStyle = '#ec4899'; c2.lineWidth = 4; c2.beginPath(); const nP = d * (PATH.length - 1);
          pts.forEach(([x, y], i) => { if (i > nP + 1) return; const [px, py] = i > nP ? [lerp(pts[i - 1][0], x, nP - i + 1), lerp(pts[i - 1][1], y, nP - i + 1)] : [x, y]; i ? c2.lineTo(px, py) : c2.moveTo(px, py); }); c2.stroke();
          pts.forEach(([x, y, w], i) => { if (i > nP + .5) return; c2.fillStyle = '#ec4899'; c2.beginPath(); c2.arc(x, y, 6, 0, 7); c2.fill(); txt(c2, w, x + 16, y + 8, 21, i === PATH.length - 1 ? '#fff' : '#bbb', 600, 'left', MONO); txt(c2, 'layer ' + [1, 4, 8, 12, 16, 20, 24, 27, 28][i], sx + sw - 36, y + 7, 17, '#777', 500, 'right', MONO); });
          c2.restore(); }
      }));
      // output pill from the API slot
      const oa = p(T, K.picked - .1, .6, eo5);
      if (oa > 0) bin(ctx, oa, () => { const y = lerp(1280, 1395, oa); rr(ctx, 330, y - 40, 420, 80, 18); ctx.fillStyle = '#16161d'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.stroke();
        txt(ctx, '…is to', 365, y + 10, 30, '#bbb', 600, 'left'); chip(ctx, 470, y, 'practice', '#4fd6e8', { size: 30, glow: .6 + .4 * Math.sin(T * 3) }); });
      if (T > K.full + .5 && T < K.hes) bin(ctx, p(T, K.full + .5, .4), () => txt(ctx, 'the student never sees these', 540, 1500, 28, '#ff8fb3', 700));
      const qa = p(T, K.so, .5);
      if (qa > 0) { live(ctx, T, 540, 1560, { yaw: .2, bob: 6 }, () => qwen(ctx, T, 540, 1560, 100 * qa, { glow: .8 * qa })); bin(ctx, qa, () => txt(ctx, 'only the final text reaches it', 540, 1665, 26, '#c9bfff', 700));
        const tph = ((T - K.so) * .8) % 1; if (T > K.so + .3) chip(ctx, 540 + 40, lerp(1395, 1530, tph), 'practice', '#4fd6e8', { size: 18, a: Math.sin(tph * Math.PI) }); }
    });
  }

  // 14 WHY (dark): Alibaba went after Claude's thinking; now only a summary is shown
  { const K = { alib: c('alibaba', A.why), think: c('thinking', A.why), step: c('step-by-step'), before: c('before answering'), closest: c('closest'), summ: c('summary') };
    const THINK = 'It’s a known saying. Teaching makes you explain it, so you understand it twice. So the next word: “teach”.';
    sfx.push({ t: K.alib, k: 'pop', g: -11 }, { t: K.think, k: 'swoosh', g: -15 }, { t: K.think + .2, k: 'type', g: -18 }, { t: K.before + .2, k: 'type', g: -18 }, { t: K.closest, k: 'shimmer', g: -15 }, { t: K.summ, k: 'shutter', g: -13 });
    add(A.why, false, (ctx, T) => {
      bgDark(ctx, T, 540, 1050);
      const k = p(T, A.why, .7, eo5);
      flip(ctx, k, 540, 1080, () => live(ctx, T, 540, 1080, { yaw: .03, bob: 4, breathe: .004 }, () => macWin(ctx, 90, 640, 900, 900, 'Finish the saying', (c2, x0, y0, w) => {
        pill(c2, x0 + w - 90, y0 - 33, 'illustration', { bg: 'rgba(255,255,255,.08)', fg: '#9a9aa8', size: 17 });
        // user bubble
        c2.font = FONT(500, 28); const ub = wrap(c2, 'Finish the saying: the best way to learn is to', 520), bw = Math.max(...ub.map(l => c2.measureText(l).width)) + 50;
        rr(c2, x0 + w - 40 - bw, y0 + 40, bw, ub.length * 40 + 34, 24); c2.fillStyle = '#2f6df6'; c2.fill(); ub.forEach((l, i) => txt(c2, l, x0 + w - 40 - bw + 25, y0 + 82 + i * 40, 28, '#fff', 500, 'left'));
        // thinking block
        const ty = y0 + 200, op = p(T, K.think - .1, .6, eio), col = p(T, K.summ - .1, .6, eio), hh = lerp(70, 330, op * (1 - col));
        if (op > 0) {
          rr(c2, x0 + 40, ty, w - 80, hh, 20); c2.fillStyle = '#1f1f27'; c2.fill(); c2.strokeStyle = col > .5 ? CORAL : 'rgba(255,255,255,.1)'; c2.lineWidth = 2; c2.stroke();
          txt(c2, col > .5 ? 'Recognized a known saying  ›' : '🧠  Thinking', x0 + 72, ty + 46, 26, '#e8e8f0', 700, 'left');
          if (hh > 120) { c2.save(); rr(c2, x0 + 40, ty, w - 80, hh, 20); c2.clip(); para(c2, THINK, x0 + 72, ty + 104, w - 150, 44, FONT(400, 29, ''), '#b9b9c8', THINK.length * clamp((T - K.think) / Math.max(.8, K.before - K.think - .2))); c2.restore(); }
          const sh = p(T, K.closest, 1.2, eio); if (sh > 0 && sh < 1) { c2.save(); rr(c2, x0 + 40, ty, w - 80, hh, 20); c2.clip(); const gx = lerp(x0 - 200, x0 + w + 200, sh), g = c2.createLinearGradient(gx - 120, 0, gx + 120, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.16)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c2.fillStyle = g; c2.fillRect(x0, ty, w, hh); c2.restore(); }
        }
        // answer
        const ay = ty + (op > 0 ? hh : 0) + 70, aa = p(T, K.before, .3);
        if (aa > 0) { c2.save(); c2.globalAlpha = aa; claude(c2, T, x0 + 68, ay - 10, 34); txt(c2, typed('The best way to learn is to teach.', T, K.before + .1, K.before + .8), x0 + 100, ay, 31, '#f2f2f6', 600, 'left'); c2.restore(); }
        if (col > .3) pop(c2, p(T, K.summ + .2, .4, eback), x0 + w / 2, ty + 130, () => pill(c2, x0 + w / 2, ty + 130, 'now: a summary only', { bg: 'rgba(217,119,87,.12)', fg: '#ffb59a', stroke: CORAL, size: 26, h: 54 }));
      }, { dark: true })));
      // Alibaba wants the thinking
      const la = p(T, K.alib, .5, eback);
      if (la > 0) pop(ctx, la, 820, 575, () => live(ctx, T, 820, 575, { bob: 5 }, () => { card(ctx, 690, 535, 260, 80, { r: 18, fill: '#fff', dark: true }); logo(ctx, 'alibaba', 820, 575, 190); }));
      const ta = p(T, K.step, .5) * (1 - p(T, K.summ, .4));
      if (ta > 0) { ctx.save(); ctx.globalAlpha = ta; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -T * 40; ctx.strokeStyle = '#ff7a1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(880, 620); ctx.quadraticCurveTo(960, 780, 880, 905); ctx.stroke(); ctx.restore();
        pill(ctx, 760, 905, 'what Alibaba wanted', { bg: '#ff6a00', size: 21, a: ta }); }
      bin(ctx, p(T, K.closest, .5) * (1 - p(T, K.summ, .4)), () => txt(ctx, 'the closest window into how it thinks', 540, 1630, 30, '#e8e8f0', 700));
    });
  }

  // Hugging Face style model card (scenes 15-16)
  const SK = [['agentic tasks', '#5b9dff'], ['software engineering', '#3fd08a'], ['kernel development', '#b58cff']];
  function hfWin(ctx, T, tab, body) {
    const x = 70, y = 590, w = 940, h = 960;
    card(ctx, x, y, w, h, { r: 26 });
    ['#ff5f57', '#febc2e', '#28c840'].forEach((cc, i) => { ctx.fillStyle = cc; ctx.beginPath(); ctx.arc(x + 34 + i * 26, y + 34, 8.5, 0, 7); ctx.fill(); });
    rr(ctx, x + 140, y + 12, w - 180, 44, 22); ctx.fillStyle = '#f1f1f4'; ctx.fill(); txt(ctx, '🤗  huggingface.co/Qwen/Qwen3-0.6B', x + 165, y + 42, 21, '#555', 500, 'left');
    ctx.fillStyle = 'rgba(0,0,0,.07)'; ctx.fillRect(x, y + 70, w, 1.5);
    qwen(ctx, T, x + 62, y + 130, 46); txt(ctx, 'Qwen /', x + 100, y + 142, 32, '#888', 600, 'left'); txt(ctx, 'Qwen3-0.6B', x + 100 + tw(ctx, 'Qwen / ', 32, 600), y + 142, 32, INK, 800, 'left');
    pill(ctx, x + 450, y + 131, 'student', { bg: PURPLE, size: 21, align: 'left' });
    ['Model card', 'Eval'].forEach((s_, i) => { const tx = x + 40 + i * 190; txt(ctx, s_, tx, y + 222, 25, i === tab ? INK : '#999', i === tab ? 800 : 500, 'left'); });
    const ux = lerp(x + 40, x + 230, tab), uw = lerp(tw(ctx, 'Model card', 25, 800), tw(ctx, 'Eval', 25, 800), tab);
    ctx.fillStyle = INK; ctx.fillRect(ux, y + 236, uw, 4); ctx.fillStyle = 'rgba(0,0,0,.07)'; ctx.fillRect(x, y + 240, w, 1.5);
    ctx.save(); rr(ctx, x, y + 242, w, h - 242, [0, 0, 26, 26]); ctx.clip(); body(x + 40, y + 300, w - 80); ctx.restore();
  }

  // 15 SMALLER (light): capacity, a skill falls off; memorises examples; overfitting
  { const K = { smaller: c('smaller'), also: c('also', A.smaller), hold: c('hold'), every: c('every skill'), learn: c('learn the examples'), strug: c('struggle'), never: c('never seen'), over: c('overfitting') };
    sfx.push({ t: K.smaller, k: 'pop', g: -14 }, { t: K.also, k: 'drip', g: -14 }, { t: K.also + .3, k: 'drip', g: -15 }, { t: K.every + .3, k: 'swoosh', g: -14 }, { t: K.learn, k: 'click', g: -11 }, { t: K.learn + .5, k: 'success', g: -16 }, { t: K.never, k: 'glitch', g: -16 }, { t: K.over, k: 'shatter', g: -13 });
    const EX = ['The best way to learn is to teach', 'Practice makes perfect', 'Two heads are better than one'];
    add(A.smaller, true, (ctx, T) => {
      bgLight(ctx, T);
      const tabT = p(T, K.learn, .4, eio);
      flip(ctx, p(T, A.smaller, .7, eo5), 540, 1140, () => live(ctx, T, 540, 1140, { yaw: .025, bob: 4, breathe: .003 }, () => hfWin(ctx, T, tabT, (x, y, w) => {
        if (tabT < 1) { ctx.save(); ctx.globalAlpha *= 1 - tabT; ctx.translate(-tabT * 200, 0);
          txt(ctx, 'Parameters', x, y + 10, 28, INK, 800, 'left');
          [['Qwen3-235B-A22B', 235e9, 1, '#888'], ['Qwen3-0.6B', 596049920, .0025, PURPLE]].forEach(([nm, v, f, cc], i) => { const yy = y + 70 + i * 90, a = i ? p(T, K.smaller, .5) : 1;
            txt(ctx, nm, x, yy, 24, '#555', 600, 'left'); txt(ctx, fmt(v), x + w, yy, 24, INK, 700, 'right', MONO);
            rr(ctx, x, yy + 16, w, 24, 12); ctx.fillStyle = 'rgba(0,0,0,.06)'; ctx.fill(); ctx.fillStyle = cc; ctx.globalAlpha *= a; rr(ctx, x, yy + 16, Math.max(24, w * f), 24, 12); ctx.fill(); ctx.globalAlpha /= a || 1; });
          const sy = y + 290; txt(ctx, 'Skills', x, sy, 28, INK, 800, 'left');
          const n = [0, 1, 2].filter(i => T > K.also + i * .28).length, cap = n / 3; txt(ctx, 'capacity', x + w - 260, sy, 22, '#777', 600, 'right');
          bar(ctx, x + w - 245, sy - 18, 245, 22, cap, cap >= 1 ? RED : AMBER); if (cap >= 1) txt(ctx, 'full', x + w, sy + 36, 20, RED, 800, 'right');
          const w0 = tw(ctx, '·' + SK[0][0], 26, 700, MONO) + 23.4, SP = [[x, sy + 75], [x + w0 + 14, sy + 75], [x, sy + 150]];
          SK.forEach(([s_, cc], i) => { const t0 = K.also + i * .28, d = p(T, t0, .5, eback); if (d <= 0) return;
            chip(ctx, SP[i][0], lerp(SP[i][1] - 300, SP[i][1], d), s_, cc, { size: 26, dark: false, lead: false, a: clamp(d * 2) }); });
          // the extra skill bounces off and falls out
          const f = clamp((T - K.every + .1) / 1.6); if (f > 0) { const yy = sy + 235 + (f < .3 ? lerp(-260, 0, eo(f / .3)) : 900 * (f - .3) ** 2), xx = x + 300 + 300 * Math.max(0, f - .3), r = Math.max(0, f - .3) * 3;
            ctx.save(); ctx.translate(xx, yy); ctx.rotate(r); chip(ctx, -110, 0, 'long-horizon tasks', '#ff9c5b', { size: 26, dark: false, lead: false }); ctx.restore();
            if (f > .25 && f < .9) pill(ctx, x + w - 90, sy + 240, 'no room', { bg: AMBER, size: 20 }); }
          ctx.restore(); }
        if (tabT > 0) { ctx.save(); ctx.globalAlpha *= tabT; ctx.translate((1 - tabT) * 200, 0);
          const nOk = [0, 1, 2].filter(i => T > K.learn + .3 + i * .3).length;
          txt(ctx, 'Training examples', x, y + 10, 28, INK, 800, 'left'); txt(ctx, `${nOk}/3`, x + w, y + 10, 26, GREEN, 800, 'right', MONO);
          EX.forEach((e, i) => { const t0 = K.learn + .1 + i * .3, a = p(T, t0, .3); if (a <= 0) return; const yy = y + 80 + i * 76; rr(ctx, x, yy - 38, w, 62, 14); ctx.fillStyle = '#f5f6f8'; ctx.fill();
            txt(ctx, typed(e, T, t0, t0 + .3), x + 22, yy + 3, 25, INK, 500, 'left', SERIF); check(ctx, x + w - 34, yy - 7, 17, p(T, t0 + .2, .3)); });
          const ny = y + 380, na = p(T, K.strug - .1, .4);
          if (na > 0) bin(ctx, na, () => { txt(ctx, 'New problem', x, ny, 28, INK, 800, 'left'); rr(ctx, x, ny + 30, w, 72, 14); ctx.fillStyle = 'rgba(242,161,20,.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(242,161,20,.6)'; ctx.lineWidth = 2; ctx.stroke();
            const s1 = 'The best way to rest is to ', w1 = tw(ctx, s1, 26, 500, SERIF); txt(ctx, s1, x + 22, ny + 76, 26, INK, 500, 'left', SERIF);
            txt(ctx, typed('teach', T, K.strug + .4, K.strug + .8), x + 22 + w1, ny + 76, 26, '#c07a00', 800, 'left', SERIF); xmark(ctx, x + w - 36, ny + 66, 18, p(T, K.never - .1, .3), AMBER);
            pop(ctx, p(T, K.never, .4, eback), x + w - 150, ny, () => pill(ctx, x + w - 150, ny - 8, 'never seen', { bg: AMBER, size: 21 })); });
          ctx.restore(); }
      })));
      if (T > K.learn - .5 && T < K.learn + .5) { const cx = kf(T, [[K.learn - .5, 700], [K.learn - .05, 330]]), cy = kf(T, [[K.learn - .5, 1100], [K.learn - .05, 820]]); cursor(ctx, cx, cy, clamp(1 - Math.abs(T - K.learn) / .1)); clickRing(ctx, cx, cy, (T - K.learn) / .4); }
      const oa = p(T, K.over - .05, .5, eback);
      if (oa > 0) pop(ctx, oa, 540, 1560, () => live(ctx, T, 540, 1560, { bob: 5, yaw: .06 }, () => { card(ctx, 230, 1480, 620, 150, { r: 28 }); txt(ctx, 'overfitting', 540, 1575, 72, INK, 900);
        const u = p(T, K.over + .2, .5); ctx.strokeStyle = AMBER; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(350, 1600); ctx.lineTo(350 + 380 * u, 1600 + 6 * Math.sin(u * 9)); ctx.stroke(); }));
    });
  }

  // 16 SO (light): answers collected from Claude transfer skills; held-out test passes
  { const K = { trans: c('transfer'), test: c('the test'), solve: c('solve'), hasnt: c("hasn't seen") };
    sfx.push({ t: A.so + .2, k: 'swoosh', g: -16 }, { t: K.trans, k: 'success', g: -14 }, { t: K.test, k: 'click', g: -12 }, { t: K.solve, k: 'click', g: -10 }, { t: K.hasnt, k: 'type', g: -16 }, { t: K.hasnt + .45, k: 'success', g: -12 });
    const ANS = ["Here's the fix", 'First, split it', 'Kernel updated', 'Tests pass now'];
    add(A.so, true, (ctx, T) => {
      bgLight(ctx, T);
      const tabT = 1 - p(T, A.so, .4, eio) + p(T, K.test - .1, .4, eio);
      live(ctx, T, 540, 1140, { yaw: .025, bob: 4, breathe: .003 }, () => hfWin(ctx, T, clamp(tabT), (x, y, w) => {
        if (T < K.test) { ctx.save();
          txt(ctx, 'Answers collected from', x, y + 10, 28, INK, 800, 'left'); claude(ctx, T, x + tw(ctx, 'Answers collected from ', 28, 800) + 16, y, 30); txt(ctx, 'Claude', x + tw(ctx, 'Answers collected from ', 28, 800) + 36, y + 10, 28, INK, 800, 'left');
          ANS.forEach((s_, i) => { const a = p(T, A.so + .2 + i * .18, .5, eo5); if (a <= 0) return; const cx = x + (i % 2) * (w / 2 + 10), cy = y + 50 + Math.floor(i / 2) * 110;
            ctx.save(); ctx.globalAlpha *= a; ctx.translate(-(1 - a) * 400, 0); card(ctx, cx, cy, w / 2 - 10, 90, { r: 18, sh: .5 }); claude(ctx, T, cx + 36, cy + 45, 26); txt(ctx, s_, cx + 64, cy + 54, 25, INK, 600, 'left'); ctx.restore(); });
          const sy = y + 330; txt(ctx, 'Skills', x, sy, 28, INK, 800, 'left');
          let cx = x; SK.forEach(([s_, cc], i) => { const ok = p(T, K.trans + i * .25, .4), ww = chip(ctx, cx, sy + 70 + (i === 2 ? 80 : 0), s_ + (ok > 0 ? '  ✓' : ''), ok > .5 ? GREEN : cc, { size: 26, dark: false, lead: false, fill: ok > .5 ? '#eefaf1' : '#fff' }); if (i < 2) cx += ww + 14; else cx = x; if (i === 1) cx = x; });
          ctx.restore(); }
        else { ctx.save(); ctx.globalAlpha *= p(T, K.test, .4);
          txt(ctx, 'Held-out test', x, y + 10, 28, INK, 800, 'left'); pill(ctx, x + 230, y, 'never seen', { bg: '#fff4dd', fg: '#b07300', size: 20, align: 'left' });
          rr(ctx, x, y + 50, w, 120, 18); ctx.fillStyle = '#f5f6f8'; ctx.fill();
          const s1 = 'Actions speak louder than ', w1 = tw(ctx, s1, 34, 500, SERIF); txt(ctx, s1, x + 30, y + 124, 34, INK, 500, 'left', SERIF);
          const ansT = typed('words', T, K.hasnt, K.hasnt + .4); if (ansT) txt(ctx, ansT, x + 30 + w1, y + 124, 34, GREEN, 800, 'left', SERIF); else { ctx.fillStyle = '#bbb'; ctx.fillRect(x + 34 + w1, y + 126, 110, 3); }
          const run = T > K.solve, done = T > K.hasnt + .4, by = y + 260;
          rr(ctx, x, by - 40, 250, 80, 18); ctx.fillStyle = done ? GREEN : BLUE; ctx.fill(); txt(ctx, done ? 'Passed' : run ? 'Running…' : 'Run test', x + 125, by + 10, 28, '#fff', 800);
          if (run && !done) { ctx.save(); ctx.translate(x + 300, by); ctx.rotate(T * 8); ctx.strokeStyle = BLUE; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 20, 0, 4.5); ctx.stroke(); ctx.restore();
            qwen(ctx, T, x + 380, by, 40); txt(ctx, 'thinking' + '.'.repeat(1 + Math.floor(T * 4) % 3), x + 412, by + 9, 26, PURPLE, 700, 'left'); }
          if (done) { check(ctx, x + w - 40, y + 110, 26, p(T, K.hasnt + .4, .4)); qwen(ctx, T, x + 310, by, 40); txt(ctx, 'solved a problem it never saw', x + 342, by + 9, 24, GREEN, 700, 'left'); }
          ctx.restore();
          const bx = x + 125, bY = by; if (T < K.solve + .4) { const cx = kf(T, [[K.test, x + 700], [K.solve - .1, bx]]), cy = kf(T, [[K.test, y + 520], [K.solve - .1, bY]]); cursor(ctx, cx, cy, clamp(1 - Math.abs(T - K.solve) / .1)); clickRing(ctx, cx, cy, (T - K.solve) / .4, '255,255,255'); }
        }
      }));
    });
  }

  // 17 ENDING (dark): the video's own code gets distilled - code drips through a condenser into the finished video
  { const K = { crazy: c('crazy'), code: c('code', A.crazy), comment: c('comment'), guide: c('guide'), yt: c('youtube'), link: c('link') };
    sfx.push({ t: K.crazy - .1, k: 'riser', g: -16 }, { t: K.code, k: 'success', g: -13 }, { t: K.comment + .1, k: 'type', g: -14 }, { t: K.guide + .25, k: 'click', g: -10 }, { t: K.yt, k: 'pop', g: -13 }, { t: K.yt + .3, k: 'pop', g: -14 }, { t: K.link + .25, k: 'click', g: -9 });
    for (let t = K.crazy + .3; t < K.yt; t += .9) sfx.push({ t, k: 'drip', g: -24 });
    const CODE = [['// scenes.js  ·  teacher: the code', '#6a737d'], ["claude(ctx, T, 290, 990, 250, { glow: 1 });", '#ffb59a'], ["qwen(ctx, T, 790, 990, 250);", '#c9bfff'], ["txt(ctx, fmt(151e6), 540, 1440, 112);", '#9ee6b0'],
      ["chip(ctx, x, 640, 'learn', TOKCOL[4]);", '#7fb6ff'], ["bar(ctx, 325, y, 520, 32, 31.3 / 40);", '#ffd479'], ["apiBox(ctx, T, 540, 1010, 760, 620);", '#ffb59a'], ["layerCube(ctx, T, x, y, 420, 480);", '#c9bfff'],
      ["c('distillation')  // cue on the word", '#9ee6b0'], ["render(30 fps)  →  video.mp4", '#7fb6ff']];
    add(A.crazy, false, (ctx, T) => {
      bgDark(ctx, T, 540, 1300);
      const prof = p(T, K.yt - .1, .7, eio);
      // teacher: the code window (flips into the profile card later)
      const k1 = p(T, A.crazy, .6, eo5) * (1 - prof);
      flip(ctx, k1, 540, 790, () => macWin(ctx, 90, 570, 900, 440, 'scenes.js  ·  teacher', (c2, x0, y0, w, h) => {
        const sc = Math.max(0, (T - A.crazy) * 1.6 - 3);
        for (let i = Math.floor(sc); i < Math.floor(sc) + 10; i++) { const [l, col] = CODE[i % CODE.length], yy = y0 + 50 + (i - sc) * 40; if (yy < y0 + 10 || yy > y0 + h - 50) continue; const lit = Math.floor((T - A.crazy) * 1.6) === i;
          if (lit) { c2.fillStyle = 'rgba(255,255,255,.05)'; c2.fillRect(x0, yy - 28, w, 40); } txt(c2, String(i % CODE.length + 1).padStart(2), x0 + 40, yy, 20, '#555', 500, 'right', MONO); txt(c2, l, x0 + 62, yy, 22, col, 600, 'left', MONO); }
        const cl = typed('// comment "guide" ✓', T, K.comment, K.guide + .2); if (cl) { const yy = y0 + h - 30; c2.fillStyle = 'rgba(47,123,255,.15)'; c2.fillRect(x0, yy - 28, w, 40); txt(c2, cl, x0 + 62, yy, 22, '#7fb6ff', 700, 'left', MONO); }
      }, { dark: true }));
      // profile card
      if (prof > 0) flip(ctx, prof, 540, 790, () => live(ctx, T, 540, 790, { yaw: .04, bob: 4 }, () => {
        card(ctx, 90, 600, 900, 380, { r: 30, fill: '#17171c', dark: true, stroke: 'rgba(255,255,255,.1)' });
        avatar(ctx, T, 220, 730, 74, named);
        if (named) txt(ctx, 'agentsoly', 330, 718, 46, '#fff', 800, 'left');
        txt(ctx, 'Explainers built 100% in code', 330, named ? 768 : 742, 28, '#9aa0aa', 500, 'left');
        const hl = p(T, K.link + .2, .35); rr(ctx, 140, 850, 800, 92, 22); ctx.fillStyle = `rgba(47,123,255,${.12 + .3 * hl})`; ctx.fill(); ctx.strokeStyle = `rgba(47,123,255,${.3 + .7 * hl})`; ctx.lineWidth = 3; ctx.stroke();
        txt(ctx, '🔗  Full guide · link in bio', 180, 908, 34, '#8fc0ff', 700, 'left');
        const cx = kf(T, [[K.link - .4, 880], [K.link + .15, 640]]), cy = kf(T, [[K.link - .4, 1060], [K.link + .15, 905]]);
        if (T > K.link - .4) { cursor(ctx, cx, cy, clamp(1 - Math.abs(T - K.link - .25) / .1)); clickRing(ctx, cx, cy, (T - K.link - .25) / .5); }
      }));
      // condenser coil: glass tube with code glyphs dripping through it
      const ca = p(T, A.crazy + .2, .6), top = 1030, bot = 1200;
      if (ca > 0) { ctx.save(); ctx.globalAlpha = ca;
        const coil = u => [540 + 150 * Math.sin(u * Math.PI * 5), lerp(top, bot, u)];
        ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(200,215,255,.18)'; ctx.lineWidth = 26; ctx.beginPath(); for (let i = 0; i <= 100; i++) { const [x, y] = coil(i / 100); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; ctx.stroke();
        ctx.font = MONO(700, 22); ctx.textAlign = 'center';
        for (let i = 0; i < 18; i++) { const u = ((T - A.crazy) * .45 + i / 18) % 1, [x, y] = coil(u), ch = 'c(){}=>;[]0.1ctx'[i % 16];
          ctx.fillStyle = `rgba(${['255,181,154', '201,191,255', '158,230,176', '127,182,255'][i % 4]},${Math.sin(u * Math.PI)})`; ctx.fillText(ch, x, y + 7); }
        glowDot(ctx, 540, bot + 10, 60, CORAL_RGB, .6);
        ctx.restore(); }
      // student: the finished video filling up drop by drop
      const px = 540, py = 1480, pw = 300, ph = 520, pa = p(T, A.crazy + .3, .6, eback);
      pop(ctx, pa, px, py, () => live(ctx, T, px, py, { yaw: .1, bob: 6, seed: 3 }, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 50; rr(ctx, px - pw / 2 - 12, py - ph / 2 - 12, pw + 24, ph + 24, 46); ctx.fillStyle = '#1c1c22'; ctx.fill(); ctx.restore();
        ctx.strokeStyle = '#4a4a55'; ctx.lineWidth = 3; ctx.stroke();
        ctx.save(); rr(ctx, px - pw / 2, py - ph / 2, pw, ph, 36); ctx.clip();
        ctx.fillStyle = '#0d0d10'; ctx.fillRect(px - pw / 2, py - ph / 2, pw, ph);
        const fill = p(T, A.crazy + .3, Math.max(1, K.code + .3 - A.crazy), clamp), lvl = py + ph / 2 - ph * fill;
        ctx.save(); ctx.beginPath(); ctx.moveTo(px - pw / 2, py + ph / 2); for (let x = 0; x <= pw; x += 10) ctx.lineTo(px - pw / 2 + x, lvl + 6 * Math.sin(x / 30 + T * 5)); ctx.lineTo(px + pw / 2, py + ph / 2); ctx.closePath(); ctx.clip();
        // mini hook frame of this very video
        glowDot(ctx, px, py - 30, 260, PURPLE_RGB, .5);
        for (let i = 0; i < 60; i++) { const u = ((T * .5 + hash(i)) % 1); ctx.fillStyle = 'rgba(200,204,214,.7)'; ctx.beginPath(); ctx.arc(lerp(px - 70, px + 70, u), py - 40 + (hash(i, 2) - .5) * 80 * Math.sin(u * Math.PI), 2, 0, 7); ctx.fill(); }
        claude(ctx, T, px - 80, py - 40, 90, { glow: .8 }); qwen(ctx, T, px + 80, py - 40, 90, { glow: .8 });
        txt(ctx, '151,000,000', px, py + 90, 38, '#fff', 800); ctx.letterSpacing = '4px'; txt(ctx, 'EXCHANGES', px, py + 116, 13, CORAL, 800); ctx.letterSpacing = '0px';
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(px - pw / 2, lvl - 1, pw, 2);
        // comment bar on the phone
        const cb = p(T, K.comment - .2, .4);
        if (cb > 0) { ctx.save(); ctx.globalAlpha = cb; rr(ctx, px - pw / 2 + 16, py + ph / 2 - 74, pw - 32, 54, 27); ctx.fillStyle = 'rgba(40,40,50,.95)'; ctx.fill();
          const g = typed('guide', T, K.guide - .15, K.guide + .15); txt(ctx, g || 'Add a comment…', px - pw / 2 + 36, py + ph / 2 - 39, 22, g ? '#fff' : '#888', g ? 700 : 500, 'left');
          ctx.fillStyle = T > K.guide + .25 ? BLUE : '#555'; ctx.beginPath(); ctx.arc(px + pw / 2 - 44, py + ph / 2 - 47, 18, 0, 7); ctx.fill(); txt(ctx, '↑', px + pw / 2 - 44, py + ph / 2 - 39, 22, '#fff', 800); ctx.restore();
          const hp = (T - K.guide - .25) / 1.2; if (hp > 0 && hp < 1) for (let i = 0; i < 5; i++) txt(ctx, '♥', px + pw / 2 - 44 + 20 * Math.sin(i * 2 + hp * 6), py + ph / 2 - 70 - hp * 200 - i * 26, 26, `rgba(255,77,109,${1 - hp})`, 800); }
        ctx.restore();
        const stamp = p(T, K.code, .45, eback); if (stamp > 0) pop(ctx, stamp, px, py - ph / 2 + 50, () => pill(ctx, px, py - ph / 2 + 50, '100% code', { bg: GREEN, size: 24 }), -.4);
        txt(ctx, 'frame ' + fmt(Math.floor(T * 30)), px, py + ph / 2 + 50, 20, 'rgba(200,200,215,.6)', 500, 'center', MONO);
      }));
      // platform pills
      [['YouTube', '#e62117', 200, -.5], ['TikTok', '#111', 880, .5]].forEach(([nm, bgc, x, r], i) => { const a = p(T, K.yt + i * .35, .45, eback);
        pop(ctx, a, x, 1380 + 8 * Math.sin(T * 2 + i), () => pill(ctx, x, 1380 + 8 * Math.sin(T * 2 + i), nm, { bg: bgc, size: 32, h: 72, padX: 28, stroke: 'rgba(255,255,255,.25)' }), r); });
    });
  }

  list.forEach((sc, i) => sc.end = list[i + 1] ? list[i + 1].start : 1e9);
  return { scenes: list, sfx };
}
