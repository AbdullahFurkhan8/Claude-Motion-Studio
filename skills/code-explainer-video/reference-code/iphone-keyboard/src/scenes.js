// iPhone keyboard hit-zone explainer. All timing from word cues c('phrase', after).
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, win, hash, GOLD, rr, label, note, ring, phone, finger, proj3, alive, flipIn } from './lib.js';
import { bgDark, FONT, cursor } from './art.js';
import { keyboard, flat, persp, keyCenter, thumbTop, crossMark, ROWH } from './kb.js';
const kf = (T, keys, e = eio) => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (T < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e((T - t0) / (t1 - t0)); return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u); }
  return keys[keys.length - 1][1];
};
const push = (ctx, s, cx = 540, cy = 1000) => { ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); };
const txt = (ctx, s, x, y, size, col = '#fff', w = 700, align = 'center') => { ctx.fillStyle = col; ctx.font = FONT(w, size); ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); };
const live = (ctx, T, x, y, o, fn) => { ctx.save(); alive(ctx, T, x, y, o); fn(); ctx.restore(); };
const tapAt = (taps, T, d = .22) => taps.reduce((r, [t, k]) => (T >= t - .05 && T < t + d ? k : r), null);
const popAt = (taps, T, d = .35) => { for (const [t, k] of taps) if (T >= t && T < t + d) return [k, Math.min(1, (T - t) / .08) * (1 - clamp((T - t - d + .1) / .1))]; return [null, 0]; };
function chatScreen(ctx, w, h, T, { typed = '', red = false, sugg = ['I', 'The', "I'm"], suggHi = -1, pressed = null, popup = null, popA = 0, bubbles = [['dinner tonight?', 0]] } = {}) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#d6a37f'; ctx.beginPath(); ctx.arc(w / 2, 120, 40, 0, 7); ctx.fill(); txt(ctx, 'Sofia', w / 2, 192, 24, '#fff', 600);
  bubbles.forEach(([s, me], i) => { ctx.font = FONT(500, 28); const tw = ctx.measureText(s).width + 44, y = 260 + i * 80, x = me ? w - 24 - tw : 24; rr(ctx, x, y, tw, 60, 30); ctx.fillStyle = me ? '#2f7cf6' : '#2c2c2e'; ctx.fill(); txt(ctx, s, x + 22, y + 40, 28, '#fff', 500, 'left'); });
  const ky = h - 470; rr(ctx, 20, ky - 80, w - 40, 60, 30); ctx.strokeStyle = '#3a3a3c'; ctx.lineWidth = 3; ctx.stroke();
  txt(ctx, typed + (Math.floor(T * 2) % 2 ? '|' : ''), 46, ky - 40, 28, red ? '#ff453a' : '#fff', 500, 'left');
  keyboard(ctx, flat(10, ky + 70, w - 20), { sugg, suggHi, pressed, popup, popA });
}

export const KEYWORDS = 'keyboard thumb right every possible see touch size type invisible zone catches tap texting t i m already knows time word not bigger squeezed nothing same halfway e w gives next again single first 44 320 wide kocienda engineer book patented second hides pops finger hit accurate quietly target land follow send autocorrect';
export const EMOJI = { thumb: '👍', texting: '💬', book: '📖' };
export const CAPTION_SFX = false;
// Translated voices (Hindi uses Hinglish captions): same scenes, cues mapped to the words this voice says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      keyboard: 'keyboard', smaller: 'har key', thumb: 'thumb', hit: 'phir bhi', almost: 'sahi', 'how is': 'aakhir',
      possible: 'possible', because: 'kyunki', see: 'dikhai', touch: 'touch', change: 'size', type: 'type', 'under every': 'har letter ke neeche',
      invisible: 'invisible', 'that zone': 'wahi zone', catches: 'catch', tap: 'tap', say: 'maan lo',
      typed: 'type kiya', already: 'pehle se', word: 'word', w: 'T-I-M-W|W', not: 'nahi', 'so before': 'isliye',
      lands: 'land', bigger: 'bada', squeezed: 'chhote', screen: 'screen', 'every key': 'move > har key', same: 'ek hi', 'but if': 'lekin agar',
      halfway: 'lekin agar > thumb', gives: 'lekin agar > us tap', 'then you': 'phir tum',
      next: 'agla', changes: 'change', single: 'har ek', 'apple built': 'apple ne ye',
      first: 'pehle iphone', comfortable: 'comfortable', whole: 'poori', wide: 'wide',
      engineer: 'engineer', book: 'book', patented: 'patent', "and there's": 'aur ek doosri',
      second: 'doosri', hides: 'chhupa', pops: 'pop', finger: 'taaki', 'actually hit': 'actually', 'so no': 'to nahi',
      accurate: 'accurately', quietly: 'chupke', target: 'target', land: 'land', 'follow me': 'aisi hi',
      send: 'aur ye us', friend: 'dost', blames: 'galti', auto: 'autocorrect',
    },
    keywords: 'iphone thumb chhota sahi possible dikhai touch size badalta invisible zone catch tap message t i m time word timw bada chhote move beech e w agla change 44 320 wide engineer book patent doosri chhupa pop ungli accurately chupke target follow bhejo autocorrect',
    emoji: { thumb: '👍', message: '💬', book: '📖' },
  },
};

export function makeScenes(c, lang = 'en') {
  const list = [], sfx = [];
  const add = (start, draw) => { list.push({ start, light: false, draw }); if (start > 0) sfx.push({ t: start - .12, k: 'whoosh', g: -17 }); };
  const taps = arr => arr.forEach(([t]) => sfx.push({ t, k: 'type', g: -20 }));
  const s = x => x - .1;

  // 1 HOOK: macro keyboard with gold hit zones; a thumb bigger than the keys
  { const K = { kb: c('keyboard'), smaller: c('smaller'), thumb: c('thumb'), hit: c('hit'), almost: c('almost'), end: c('how is') };
    const gap = Math.min(.2, (K.end - K.almost - .3) / 5), T5 = ['t', 'i', 'm', 'e', 's'].map((k, i) => [K.almost + .15 + i * gap, k]); taps(T5);
    sfx.push({ t: K.kb, k: 'pop', g: -16 }, { t: K.thumb, k: 'swoosh', g: -18 }, { t: K.hit + .2, k: 'type', g: -12 });
    add(0, (ctx, T) => {
      bgDark(ctx);
      if (T < K.almost) {
        const P = proj3({ yaw: -.18 + .1 * Math.sin(T * .7), pitch: kf(T, [[0, .95], [K.almost, 1.05]]), dist: kf(T, [[0, 3.0], [K.kb, 3.5], [K.hit, 3.1]]), f: 1300, cy: 1050, tx: -1.25, ty: 1.0 });
        const m = persp(P, .5);
        keyboard(ctx, m, { zoneA: .95, zoneHi: { e: p(T, K.hit, .3) }, pressed: T > K.hit + .2 ? 'e' : null, popup: T > K.hit + .2 ? 'e' : null, popA: p(T, K.hit + .2, .2) });
        const e = keyCenter(m, 'e'); if (e[2]) label(ctx, 'TOUCH ZONE · INVISIBLE', e[0] - 150, e[1] - 330, win(T, K.kb, K.thumb), e[0] - 40, e[1] - 30, 24);
        const tip = kf(T, [[0, [-200, 400]], [K.smaller, [330, 760]], [K.thumb, [470, 880]], [K.hit, [470, 880]], [K.hit + .2, [500, 930]]], eo);
        finger(ctx, { x: tip[0], y: tip[1], ang: -.9, wid: kf(T, [[0, 380], [K.thumb + .3, 560]]), T });
      } else {
        const m = flat(40, 800, 1000), [pk, pa] = popAt(T5, T), zi = lerp(.9, 1, p(T, K.almost, .5, eback));
        live(ctx, T, 540, 1150, { yaw: .14, bob: 10 }, () => {
          ctx.translate(540, 1150); ctx.scale(zi, zi); ctx.translate(-540, -1150);
          keyboard(ctx, m, { zoneA: .8, sugg: ['"tim"', 'time', 'times'], suggHi: T > K.almost + .6 ? 1 : -1, pressed: tapAt(T5, T), popup: pk, popA: pa });
          const cur = T5.reduce((r, [t, k]) => (T > t - .3 ? k : r), 't'), kc = keyCenter(m, cur);
          thumbTop(ctx, kc[0] + 10, kc[1] + 30 + (tapAt(T5, T) ? 0 : 30), .9, -.45);
        });
      }
      note(ctx, 'Magnified illustration · zones drawn visible', 40, H - 60, 1);
    });
  }
  // 2 HOW: what you see vs what you touch (two layers)
  { const s0 = s(c('how is')), K = { poss: c('possible'), bec: c('because', s0), see: c('see', s0), touch: c('touch', s0), change: c('change'), type: c('type', c('change')), end: c('under every') };
    sfx.push({ t: K.poss, k: 'tick', g: -14 }, { t: K.bec, k: 'swoosh', g: -16 }, { t: K.see, k: 'pop', g: -16 }, { t: K.touch, k: 'pop', g: -14 }, { t: K.change, k: 'gear', g: -18 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const sep = p(T, K.bec, .9, eio);
      const P = proj3({ yaw: lerp(0, -.5, sep) + .08 * Math.sin(T * .6), pitch: lerp(0, .95, sep), dist: lerp(7.2, 7.6, sep), f: 1300, cy: 1000 });
      const top = persp(P, .5, lerp(0, 1.6, sep)), bot = persp(P, .5, 0);
      const t = Math.floor((T - K.change) / .45), sc = {}; if (T > K.change) 'qwertyuiopasdfghjklzxcvbnm'.split('').forEach((k, i) => sc[k] = .5 + 1.6 * hash(i, t));
      if (sep > .02) keyboard(ctx, bot, { onlyZones: true, zoneA: sep * .95, scale: sc });
      keyboard(ctx, top, { zoneA: 1 - sep, pressed: T > K.poss && T < K.poss + .3 ? 'e' : null });
      if (T < K.bec) { const a = keyCenter(top, 'w'), b = keyCenter(top, 'e'); crossMark(ctx, (a[0] + b[0]) / 2, a[1], win(T, K.poss, K.bec, .2)); }
      if (sep > .5) { const a = top(0, 0), b = bot(0, 0); label(ctx, 'WHAT YOU SEE', a[0] + 60, a[1] - 40, p(T, K.see, .4), undefined, undefined, 26); label(ctx, 'WHAT YOU TOUCH', b[0] + 80, b[1] + 520, p(T, K.touch, .4), undefined, undefined, 26);
        ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 2; for (const [u, v] of [[-.25, -.25], [10.25, -.25], [-.25, 5.55], [10.25, 5.55]]) { const q1 = top(u, v), q2 = bot(u, v); ctx.beginPath(); ctx.moveTo(q1[0], q1[1]); ctx.lineTo(q2[0], q2[1]); ctx.stroke(); } }
      note(ctx, 'Zones drawn visible. On a real iPhone they are invisible.', 40, H - 60, 1);
    });
  }
  // 3 UNDER: hit regions under j k l
  { const s0 = s(c('under every')), K = { inv: c('invisible'), zone: c('that zone'), catches: c('catches'), tap: c('tap'), end: c('say') };
    sfx.push({ t: K.inv, k: 'shimmer', g: -16 }, { t: K.catches + .3, k: 'type', g: -10 }, { t: K.catches + .3, k: 'pop', g: -14 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const P = proj3({ yaw: .05 + .1 * Math.sin(T * .55), pitch: 1.0 - .06 * Math.sin(T * .4), dist: kf(T, [[s0, 3.8], [K.end, 3.0]]), f: 1300, cy: 1050, tx: 1.5, ty: .35 });
      const m = persp(P, .5), hit = T > K.catches + .3;
      const vis = 1 - win(T, K.inv + .3, K.zone, .3);
      keyboard(ctx, m, { zoneA: .95 * vis * p(T, s0 + .2, .5), dashed: 1 - vis, zoneHi: { k: hit ? 1 : 0 }, pressed: hit ? 'k' : null, keyA: 1 });
      const k = keyCenter(m, 'k'); label(ctx, 'HIT REGION', k[0] - 220, k[1] + 300, p(T, K.zone, .4), k[0] - 40, k[1] + 90, 26);
      const tip = kf(T, [[s0, [1300, 300]], [K.catches - .3, [k[0] + 60, k[1] - 160]], [K.catches + .3, [k[0] + 40, k[1] - 40]], [K.end, [k[0] + 40, k[1] - 40]]], eo);
      finger(ctx, { x: tip[0], y: tip[1], ang: .7, wid: 420, T, alpha: p(T, K.catches - .6, .3) });
      if (hit) ring(ctx, k[0], k[1], (T - K.catches - .3) / .5, GOLD, 30, 160);
      note(ctx, 'Magnified illustration', 40, H - 60, 1);
    });
  }
  // 4 TEXTING: t-i-m, the phone already knows "time"
  { const s0 = s(c('say')), K = { typed: c('typed'), t: c('t', c('typed')), i: c('i', c('typed')), m: c('m', c('typed')), already: c('already'), time: c('time', c('already')), word: c('word'), w: c('w', c('word')), not: c('not', c('word')), end: c('so before') };
    const TT = [[K.t, 't'], [K.i, 'i'], [K.m, 'm']]; taps(TT); sfx.push({ t: K.already, k: 'data', g: -16 }, { t: K.word, k: 'success', g: -16 }, { t: K.w, k: 'type', g: -14 }, { t: K.not, k: 'glitch', g: -16 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const side = p(T, K.already - .2, .7, eio);
      let typed = 'what ' + TT.filter(([t]) => T > t).map(x => x[1]).join(''); const timw = T > K.w; if (timw) typed = 'what timw';
      const n = TT.filter(([t]) => T > t).length, sugg = [['I', 'The', "I'm"], ['"t"', 'to', 'the'], ['"ti"', 'time', 'tip'], ['"tim"', 'time', 'times']][n];
      const [pk, pa] = popAt([...TT, [K.w, 'w']], T);
      phone(ctx, { x: lerp(540, 300, side), y: 1060 + 12 * Math.sin(T * 1.2), w: 560, h: 1180, s: lerp(1, .78, side) * lerp(.85, 1, p(T, s0, .6, eback)), rot: .035 * Math.sin(T * .8) }, (x, w, h) => chatScreen(x, w, h, T, { typed, red: timw, sugg, suggHi: T > K.time ? 1 : -1, pressed: tapAt([...TT, [K.w, 'w']], T), popup: pk, popA: pa }));
      if (side > 0) {
        ctx.save(); ctx.globalAlpha = side; ctx.translate(lerp(200, 0, side), 0); alive(ctx, T, 795, 960, { yaw: .1, bob: 8, seed: 2 });
        rr(ctx, 560, 640, 470, 640, 24); ctx.fillStyle = '#16181d'; ctx.fill(); ctx.strokeStyle = '#2b2e35'; ctx.lineWidth = 2; ctx.stroke();
        txt(ctx, 'words starting "tim"', 590, 700, 24, '#9aa0aa', 600, 'left');
        const rows = timw ? [['timw', '0 of 333,333']] : [['time', '966,785,578'], ['times', '290,890,000'], ['timing', '112,031,173'], ['timely', '9,583,522'], ['timber', '9,503,000'], ['timothy', '7,400,960']];
        rows.forEach(([w2, n2], i) => { const y = 770 + i * 78, hi = !timw && i === 0 && T > K.time, ri = p(T, K.already + i * .09, .45, eback); ctx.save(); ctx.globalAlpha = side * clamp(ri); ctx.translate((1 - ri) * 160, 0); if (hi) { const pz = 1 + .04 * Math.sin(T * 5); ctx.translate(795, y - 14); ctx.scale(pz, pz); ctx.translate(-795, -(y - 14)); } if (hi) { rr(ctx, 576, y - 46, 438, 64, 12); ctx.fillStyle = 'rgba(52,199,89,.25)'; ctx.fill(); }
          ctx.font = '600 30px "Cascadia Mono", Consolas, monospace'; ctx.textAlign = 'left'; ctx.fillStyle = timw ? '#ff453a' : hi ? '#fff' : '#c9ced6'; ctx.fillText(w2, 596, y); ctx.textAlign = 'right'; ctx.fillText(n2, 1000, y); ctx.restore(); });
        if (timw) { const a = p(T, K.w, .4, eback); ctx.save(); ctx.translate(795, 945); ctx.rotate((1 - a) * -.5); ctx.scale(a, a); txt(ctx, '✕ not a word', 0, 15, 44, '#ff453a', 900); ctx.restore(); }
        txt(ctx, 'English word counts · illustrative', 590, 1260, 18, '#6b7078', 500, 'left');
        ctx.restore();
      }
    });
  }
  // 5 ZONES: E grows to 96%, neighbours squeezed; on screen nothing moves
  { const s0 = s(c('so before')), K = { lands: c('lands'), e: c('e', c('lands')), bigger: c('bigger'), squeezed: c('squeezed'), screen: c('screen', c('squeezed')), every: c('every key'), same: c('same'), end: c('but if') };
    sfx.push({ t: K.e, k: 'data', g: -18 }, { t: K.bigger, k: 'riser', g: -18 }, { t: K.bigger + .4, k: 'pop', g: -12 }, { t: K.squeezed, k: 'gear', g: -16 }, { t: K.screen, k: 'swoosh', g: -18 }, { t: K.same, k: 'tick', g: -14 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const m = flat(-40, 720, 1900), grow = p(T, K.bigger, .8, eback), sq = p(T, K.squeezed, .6);
      const zA = 1 - p(T, K.screen, .4);
      ctx.save(); alive(ctx, T, 540, 1100, { yaw: .07, bob: 8 });
      keyboard(ctx, m, { sugg: ['times', 'time', 'timing'], suggHi: 1, zoneA: zA, scale: { e: 1 + 1.5 * grow, w: 1 - .45 * sq, r: 1 - .45 * sq, s: 1 - .3 * sq, d: 1 - .2 * sq }, zoneHi: { e: grow }, labels: T > K.e && zA > .5 ? { q: '0%', w: '0%', e: '96%', r: '1%', t: '0%' } : {}, bottom: false });
      if (T > K.every) { const a = p(T, K.every, .4); ['w', 'e', 'r'].forEach(k => { const c0 = keyCenter(m, k); ctx.setLineDash([10, 8]); ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 3; ctx.strokeRect(c0[0] - 80, c0[1] - 108, 160, 216); ctx.setLineDash([]); });
        if (T > K.same) { const c1 = keyCenter(m, 'w'), c3 = keyCenter(m, 'r'); txt(ctx, 'same size', (c1[0] + c3[0]) / 2, c1[1] + 190, 34, `rgba(255,255,255,${p(T, K.same, .3)})`, 700); } }
      thumbTop(ctx, kf(T, [[s0, 120], [K.lands, 260]], eo), kf(T, [[s0, 1900], [K.lands, 1260]], eo) + 10 * Math.sin(T * 2), 1.1, -.5);
      ctx.restore();
      note(ctx, 'Zone sizes from English word counts, not Apple\'s own model', 40, H - 60, 1);
    });
  }
  // 6 HALFWAY: thumb lands between E and W; the iPhone gives it to E
  { const s0 = s(c('but if')), K = { half: c('halfway'), e: c('e', c('halfway')), w: c('w', c('halfway')), gives: c('gives'), tapE: c('e', c('gives')), end: c('then you') };
    sfx.push({ t: K.half, k: 'type', g: -12 }, { t: K.gives, k: 'shimmer', g: -16 }, { t: K.tapE, k: 'success', g: -12 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const m = flat(-40, 720, 1900), w0 = keyCenter(m, 'w'), e0 = keyCenter(m, 'e'), mx = (w0[0] + e0[0]) / 2, my = w0[1];
      const zA = p(T, K.gives, .5), give = T > K.tapE; ctx.save(); alive(ctx, T, 540, 1100, { yaw: .07, bob: 8, seed: 1 });
      keyboard(ctx, m, { sugg: ['times', 'time', 'timing'], suggHi: 1, zoneA: zA, scale: { e: 2.5, w: .55, r: .55 }, zoneHi: { e: zA }, pressed: give ? 'e' : null, popup: give ? 'e' : null, popA: p(T, K.tapE, .15), bottom: false });
      if (T > K.e && !give) { const hi = T > K.w ? 'w' : 'e', c0 = keyCenter(m, hi); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(c0[0] - 80, c0[1] - 108, 160, 216); }
      crossMark(ctx, mx, my, p(T, K.half, .3), 40);
      const lift = T < K.half ? 1 : clamp((T - K.half - .5) / .4);
      thumbTop(ctx, mx + 40 + lift * 80, my + 60 + lift * 260, 1.1, -.5, 1 - .6 * clamp((T - K.half) / .3) * (1 - lift));
      if (give) ring(ctx, e0[0], e0[1], (T - K.tapE) / .6, GOLD, 40, 220);
      ctx.restore();
    });
  }
  // 7 NEXT: every letter, a new zone map
  { const s0 = s(c('then you')), K = { next: c('next'), changes: c('changes'), single: c('single'), end: c('apple built') };
    const seq = 'works'.split('').map((k, i) => [K.next + .1 + i * .7, k]); taps(seq); sfx.push({ t: K.changes, k: 'gear', g: -18 });
    const likely = [{ o: 2.6, a: 1.6, i: 1.4 }, { r: 2.6, n: 1.5, u: 1.3 }, { k: 2.6, l: 1.6, d: 1.4 }, { s: 2.6, i: 1.6, e: 1.5 }, { h: 1.8, o: 1.6, t: 1.6 }, { p: 1.5, t: 1.5, h: 1.5 }];
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const n = seq.filter(([t]) => T > t).length, m = flat(90, 900, 900), [pk, pa] = popAt(seq, T);
      ctx.save(); ctx.translate((1 - p(T, s0, .5, eback)) * -700, 0); rr(ctx, 90, 700, 900, 90, 45); ctx.fillStyle = '#1c1d21'; ctx.fill(); txt(ctx, 'what time w' + 'works'.slice(1, n) , 130, 760, 40, '#fff', 500, 'left'); ctx.restore();
      ctx.save(); alive(ctx, T, 540, 1150, { yaw: .12, bob: 10 });
      keyboard(ctx, m, { zoneA: .9, scale: likely[Math.min(n, 5)], zoneHi: Object.fromEntries(Object.keys(likely[Math.min(n, 5)]).slice(0, 1).map(k => [k, 1])), pressed: tapAt(seq, T), popup: pk, popA: pa });
      ctx.restore();
      const lt = n ? seq[n - 1][0] : s0, pu = 1 + .18 * (1 - p(T, lt, .35)); ctx.save(); ctx.translate(540, 1548); ctx.scale(pu, pu); txt(ctx, `${10 + n} characters · ${10 + n} zone maps`, 0, 12, 36, '#ffd24a', 800); ctx.restore();
      note(ctx, 'Zone sizes from English word counts, not Apple\'s own model', 40, H - 60, 1);
    });
  }
  // 8 2007: 44 px buttons on a 320 px wide screen
  { const s0 = s(c('apple built')), K = { first: c('first'), comf: c('comfortable'), px44: c('44'), whole: c('whole'), px320: c('320'), wide: c('wide'), end: c('ken') };
    sfx.push({ t: K.first, k: 'pop', g: -14 }, { t: K.px44, k: 'tick', g: -12 }, { t: K.px320, k: 'data', g: -16 }, { t: K.wide, k: 'glitch', g: -16 }, { t: K.wide + .9, k: 'pop', g: -14 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      ctx.save(); push(ctx, lerp(1.08, 1, eo5((T - s0) / .6)));
      const pw = 520, ph = 1000, px = 540, py = 1080; alive(ctx, T, px, py, { yaw: .16, bob: 10 }); flipIn(ctx, px, py, p(T, s0, .7, eback));
      rr(ctx, px - pw / 2, py - ph / 2, pw, ph, 90); const g = ctx.createLinearGradient(px - pw / 2, 0, px + pw / 2, 0); g.addColorStop(0, '#8d9198'); g.addColorStop(.5, '#e4e6ea'); g.addColorStop(1, '#8d9198'); ctx.fillStyle = g; ctx.fill();
      rr(ctx, px - pw / 2 + 14, py - ph / 2 + 14, pw - 28, ph - 28, 80); ctx.fillStyle = '#0c0c0e'; ctx.fill();
      ctx.strokeStyle = '#555'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(px, py + ph / 2 - 80, 34, 0, 7); ctx.stroke();
      const sw = 420, sx = px - sw / 2, sy = py - 340; ctx.fillStyle = '#c9d1db'; ctx.fillRect(sx, sy, sw, 620);
      ctx.fillStyle = '#e8ecf0'; ctx.fillRect(sx, sy, sw, 300); keyboard(ctx, flat(sx + 4, sy + 360, sw - 8), { panel: 0, bottom: true });
      { const a = p(T, K.first, .5, eback); ctx.save(); ctx.globalAlpha = clamp(a); ctx.translate((1 - a) * -300, 0); txt(ctx, '2007', 140, 760, 80, '#fff', 900, 'left'); note(ctx, 'Illustrative', 140, 800, 1); ctx.restore(); }
      if (T > K.comf) { const a = p(T, K.comf, .4, eback); ctx.save(); ctx.globalAlpha = clamp(a); ctx.translate(880, 1240); ctx.rotate((1 - a) * Math.PI + .08 * Math.sin(T * 1.5)); ctx.scale(Math.max(0, a), Math.max(0, a)); ctx.translate(-880, -1240); rr(ctx, 820, 1180, 120, 120, 18); ctx.fillStyle = '#2f7cf6'; ctx.fill(); ctx.restore(); if (T > K.px44) txt(ctx, '44 px', 880, 1350, 44, '#fff', 800); }
      if (T > K.whole) { const a = p(T, K.whole, .5); ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, sy - 40); ctx.lineTo(sx, sy - 70); ctx.moveTo(sx, sy - 55); ctx.lineTo(sx + sw, sy - 55); ctx.moveTo(sx + sw, sy - 40); ctx.lineTo(sx + sw, sy - 70); ctx.stroke(); txt(ctx, Math.round(lerp(0, 320, p(T, K.px320 - .3, .6))) + ' px', px, sy - 85, 44, `rgba(255,255,255,${a})`, 800); }
      if (T > K.wide - .2) { const fit = p(T, K.wide + .9, .6), kw = lerp(sw / 320 * 44, sw / 10, fit), over = 10 * kw > sw + 1;
        for (let i = 0; i < 10; i++) { const x = sx + i * kw; ctx.fillStyle = x + kw > sx + sw + 1 ? 'rgba(229,57,53,.85)' : 'rgba(255,255,255,.85)'; rr(ctx, x + 3, sy + 230, kw - 6, 60, 8); ctx.fill(); }
        txt(ctx, over ? '10 × 44 = 440 px' : '10 keys × 32 px', 540, 1700, 54, over ? '#ff453a' : '#ffd24a', 900); }
      ctx.restore();
    });
  }
  // 9 KEN: engineer + book + patent
  { const s0 = s(c('ken')), K = { eng: c('engineer'), book: c('book'), pat: c('patented'), end: c("and there's") };
    sfx.push({ t: s0 + .2, k: 'pop', g: -14 }, { t: K.book, k: 'swoosh', g: -16 }, { t: K.pat, k: 'shutter', g: -12 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      if (T < K.pat - .2) {
        const a = p(T, s0 + .1, .5, eback); ctx.save(); alive(ctx, T, 540, 900, { yaw: .1, bob: 10 }); flipIn(ctx, 540, 900, p(T, s0 + .1, .7)); ctx.translate(540, 900); ctx.scale(a, a);
        rr(ctx, -420, -230, 840, 460, 36); ctx.fillStyle = '#17191e'; ctx.fill(); ctx.strokeStyle = '#2b2e35'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#2f7cf6'; ctx.beginPath(); ctx.arc(-260, -40, 110, 0, 7); ctx.fill(); txt(ctx, 'KK', -260, -5, 90, '#fff', 900);
        ctx.save(); ctx.translate(-260, -40); ctx.rotate(T * 1.4); ctx.setLineDash([22, 14]); ctx.strokeStyle = 'rgba(111,149,255,.9)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 128, 0, 7); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
        txt(ctx, 'Ken Kocienda', -110, -60, 58, '#fff', 800, 'left'); txt(ctx, 'Engineer behind the', -110, 0, 32, '#9aa0aa', 500, 'left'); txt(ctx, 'original iPhone keyboard', -110, 44, 32, '#9aa0aa', 500, 'left');
        ctx.restore();
        if (T > K.book) { const b = p(T, K.book, .5, eback); ctx.save(); alive(ctx, T, 540, 1420, { yaw: .35, bob: 14, speed: 1.4, seed: 3 }); ctx.translate(540, 1420); ctx.rotate(-.06 + (1 - b) * .6); ctx.scale(b, b); rr(ctx, -160, -220, 320, 440, 12); const g = ctx.createLinearGradient(0, -220, 0, 220); g.addColorStop(0, '#1e4f8c'); g.addColorStop(1, '#0d2647'); ctx.fillStyle = g; ctx.fill(); txt(ctx, 'CREATIVE', 0, -110, 40, '#fff', 900); txt(ctx, 'SELECTION', 0, -62, 40, '#fff', 900); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.strokeRect(-90, -20, 180, 140); txt(ctx, 'Ken Kocienda', 0, 190, 24, '#cfd8e4', 600); ctx.restore(); }
      } else {
        const a = p(T, K.pat - .2, .5, eback); ctx.save(); alive(ctx, T, 540, 1000, { yaw: .08, bob: 8 }); ctx.translate(540, 1000); ctx.rotate(-.04 * (1 - a) + .3 * (1 - clamp(a))); const za = a * (1 + .06 * p(T, K.pat, 2.5, eio)); ctx.scale(za, za); ctx.translate(-540, -1000);
        ctx.fillStyle = '#f7f5ef'; ctx.fillRect(120, 560, 840, 1000); txt(ctx, 'U.S. Patent', 160, 620, 28, '#222', 700, 'left'); txt(ctx, 'FIG. 8A', 540, 700, 34, '#222', 800);
        const m = flat(170, 820, 740); ctx.strokeStyle = '#222'; ctx.lineWidth = 3;
        'qwertyuiop'.split('').forEach((k, i) => { ctx.strokeRect(170 + i * 74 + 6, 820 + 10, 62, 80); txt(ctx, k.toUpperCase(), 170 + i * 74 + 37, 885, 34, '#222', 500); });
        'asdfghjkl'.split('').forEach((k, i) => { const hi = (k === 'a' || k === 'd') && T > K.pat + .4; ctx.fillStyle = hi ? 'rgba(255,170,40,.6)' : 'transparent'; ctx.fillRect(170 + 37 + i * 74 + 6, 930, 62, 80); ctx.strokeRect(170 + 37 + i * 74 + 6, 930, 62, 80); txt(ctx, k.toUpperCase(), 170 + 37 + i * 74 + 37, 985, 34, '#222', 500); });
        if (T > K.pat + .4) { const h2 = p(T, K.pat + .4, .4, eback); ctx.save(); ctx.globalAlpha = clamp(h2); ctx.translate((1 - h2) * 120, 0); txt(ctx, '↳ hidden hit regions', 540, 1100, 30, '#c07000', 700); ctx.restore(); }
        ctx.restore();
      }
    });
  }
  // 10 SECOND TRICK: thumb hides the key, the letter pops up
  { const s0 = s(c("and there's")), K = { second: c('second'), hides: c('hides'), pops: c('pops'), finger: c('finger', c('pops')), hit: c('actually hit'), end: c('so no') };
    sfx.push({ t: K.second, k: 'pop', g: -14 }, { t: K.hides, k: 'type', g: -12 }, { t: K.pops, k: 'pop', g: -10 }, { t: K.hit + .2, k: 'type', g: -14 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      if (T < K.hit - .1) {
        const P = proj3({ yaw: -.05 + .09 * Math.sin(T * .6), pitch: .9 + .04 * Math.sin(T * .45), dist: kf(T, [[s0, 3.6], [K.pops, 3.1]]), f: 1300, cy: 1150, tx: .5, ty: .35 });
        const m = persp(P, .5), h = keyCenter(m, 'h'), down = T > K.hides;
        keyboard(ctx, m, { pressed: down ? 'h' : null, popup: T > K.pops ? 'h' : null, popA: p(T, K.pops, .25, eback), zoneA: 0 });
        const ghost = win(T, K.hides + .5, K.pops, .3);
        const tip = kf(T, [[s0, [1200, 2100]], [K.hides, [h[0] + 30, h[1] + 20]]], eo);
        thumbTop(ctx, tip[0], tip[1], 1.25, .45, 1 - .75 * ghost); thumbTop(ctx, tip[0], tip[1], 1.25, .45, ghost, ghost);
        if (T > K.pops) label(ctx, 'CHARACTER PREVIEW', h[0] - 250, h[1] - 420, p(T, K.pops + .2, .3), h[0] - 60, h[1] - 300, 24);
      } else {
        const m = flat(40, 800, 1000), seq = [[K.hit + .2, 'y']]; alive(ctx, T, 540, 1150, { yaw: .12, bob: 10 });
        keyboard(ctx, m, { sugg: ['"y"', 'you', 'yes'], pressed: tapAt(seq, T, .5), popup: T > K.hit + .2 ? 'y' : null, popA: p(T, K.hit + .2, .15) });
        const y = keyCenter(m, 'y'); thumbTop(ctx, y[0] + 30, y[1] + 50, 1, .4);
      }
    });
  }
  // 11 TARGET: the keyboard quietly moves the target under your thumb
  { const s0 = s(c('so no')), K = { acc: c('accurate'), quiet: c('quietly'), target: c('target'), land: c('land', c('target')), end: c('follow me') };
    sfx.push({ t: K.acc, k: 'tick', g: -14 }, { t: K.quiet, k: 'gear', g: -18 }, { t: K.target, k: 'riser', g: -20 }, { t: K.land, k: 'type', g: -10 }, { t: K.land + .05, k: 'success', g: -14 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const m = flat(40, 820, 1000), mv = p(T, K.quiet, 1.4, eio), landed = T > K.land; ctx.save(); alive(ctx, T, 540, 1150, { yaw: .12, bob: 10 });
      keyboard(ctx, m, { sugg: ['"yo"', 'you', 'your'], suggHi: landed ? 1 : -1, zoneA: p(T, K.quiet - .3, .4), scale: { u: 1 + 1.6 * mv, y: 1 - .4 * mv, i: 1 - .4 * mv }, zoneHi: { u: mv }, pressed: landed ? 'u' : null, popup: landed ? 'u' : null, popA: p(T, K.land, .15) });
      const y = keyCenter(m, 'y'), u = keyCenter(m, 'u'), tx = lerp(y[0], u[0], .35), ty = y[1] + 10;
      crossMark(ctx, tx, ty, win(T, K.acc, K.end, .3), 30);
      if (T > K.target) label(ctx, 'THE TARGET', u[0] + 140, u[1] - 210, p(T, K.target, .3), u[0] + 20, u[1] - 60, 26);
      thumbTop(ctx, tx + 20 + (landed ? 0 : 60), ty + 40 + (landed ? 0 : 120 * (1 - p(T, K.land - .6, .6))), 1, -.35, 1);
      if (landed) ring(ctx, u[0], u[1], (T - K.land) / .6, GOLD, 30, 200);
      ctx.restore();
      ctx.save(); ctx.translate((1 - p(T, s0, .5, eback)) * 700, 0); txt(ctx, 'what time works? ' + (landed ? 'you' : 'yo'), 540, 700, 40, '#fff', 500); ctx.restore();
    });
  }
  // 12 CTA: follow the channel (Hindi: profile only, no channel name), send to the friend who blames autocorrect
  const named = lang !== 'hi';
  { const s0 = s(c('follow me')), K = { send: c('send'), friend: c('friend', c('send')), blames: c('blames'), auto: c('auto') };
    sfx.push({ t: s0 + .5, k: 'click', g: -10 }, { t: K.send + .1, k: 'swoosh', g: -16 }, { t: K.friend, k: 'click', g: -12 }, { t: K.auto, k: 'pop', g: -14 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      if (T < K.send) {
        ctx.save(); push(ctx, lerp(1.1, 1, eo5((T - s0) / .5))); alive(ctx, T, 540, 920, { yaw: .12, bob: 10 }); flipIn(ctx, 540, 920, p(T, s0, .6, eback));
        rr(ctx, 140, 640, 800, 560, 40); ctx.fillStyle = '#1b1d22'; ctx.fill();
        const g = ctx.createLinearGradient(430, 690, 650, 910); g.addColorStop(0, '#1fa58f'); g.addColorStop(1, '#f2a25c'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(540, 820, 110, 0, 7); ctx.fill();
        ctx.save(); ctx.translate(540, 820); ctx.rotate(T * 1.6); const gr = ctx.createConicGradient(0, 0, 0); gr.addColorStop(0, '#f2a25c'); gr.addColorStop(.5, '#1fa58f'); gr.addColorStop(1, '#f2a25c'); ctx.strokeStyle = gr; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 126, 0, 7); ctx.stroke(); ctx.restore();
        if (named) txt(ctx, 'a', 540, 855, 100, '#fff', 900);
        else { ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.beginPath(); ctx.arc(540, 790, 38, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(540, 885, 66, 46, 0, Math.PI, 0); ctx.fill(); }
        if (named) { txt(ctx, 'agentsoly', 540, 1010, 52, '#fff', 800); txt(ctx, 'Hidden tech, explained in code', 540, 1060, 28, '#9aa0aa', 500); }
        const fol = T > s0 + .5; rr(ctx, 360, 1100, 360, 76, 38); ctx.fillStyle = fol ? '#2b2e35' : '#2f8cff'; ctx.fill(); txt(ctx, fol ? 'Following ✓' : 'Follow', 540, 1150, 32, '#fff', 800); ring(ctx, 540, 1138, (T - s0 - .5) / .5, '47,140,255', 30, 160);
        ctx.restore();
      } else if (T < K.blames - .1) {
        const y0 = lerp(1600, 820, p(T, K.send, .5, eback)); rr(ctx, 60, y0, 960, 520, 36); ctx.fillStyle = '#23262d'; ctx.fill();
        ['Sofia', 'Daniel', 'Mei', 'Lucas'].forEach((n, i) => { const x = 180 + i * 240, y = y0 + 180 + 10 * Math.sin(T * 2 + i * 1.3) + (1 - p(T, K.send + .1 + i * .08, .4, eback)) * 120; ctx.fillStyle = ['#d6a37f', '#8d6e63', '#c58f72', '#7b8f5a'][i]; ctx.beginPath(); ctx.arc(x, y, 76, 0, 7); ctx.fill(); txt(ctx, n, x, y + 125, 28, '#ddd', 600); if (i === 0 && T > K.friend) { ctx.strokeStyle = '#2f8cff'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(x, y, 84, 0, 7); ctx.stroke(); } });
        rr(ctx, 100, y0 + 380, 880, 90, 20); ctx.fillStyle = T > K.friend + .3 ? '#1d4f8c' : '#2f8cff'; ctx.fill(); txt(ctx, T > K.friend + .3 ? '✓ Sent' : 'Send', 540, y0 + 438, 34, '#fff', 800);
      } else {
        rr(ctx, 60, 600, 960, 1000, 36); ctx.fillStyle = '#0f1013'; ctx.fill(); txt(ctx, 'Sofia', 540, 680, 34, '#fff', 700);
        const b1 = p(T, K.blames - .1, .3, eback); ctx.save(); ctx.globalAlpha = clamp(b1); ctx.translate((1 - b1) * -300, 4 * Math.sin(T * 2)); rr(ctx, 100, 740, 460, 80, 40); ctx.fillStyle = '#2c2c2e'; ctx.fill(); txt(ctx, 'autocorrect again 🙄', 130, 793, 32, '#fff', 500, 'left'); ctx.restore();
        const b2 = p(T, K.auto + .2, .4, eback); ctx.save(); ctx.globalAlpha = clamp(b2); ctx.translate((1 - b2) * 300, (1 - clamp(b2)) * 40); alive(ctx, T, 770, 1050, { yaw: .12, bob: 6, seed: 4 });
        rr(ctx, 560, 860, 420, 380, 24); ctx.fillStyle = '#1b1d22'; ctx.fill(); keyboard(ctx, flat(580, 940, 380), { zoneA: .9, scale: { e: 2.2 }, zoneHi: { e: 1 }, bottom: false, panel: 0 }); if (named) txt(ctx, '@agentsoly', 600, 905, 22, '#9aa0aa', 600, 'left');
        rr(ctx, 100, 1300, 640, 80, 40); ctx.fillStyle = '#2c2c2e'; ctx.fill(); txt(ctx, 'ok so it was never autocorrect 😂', 130, 1352, 30, '#fff', 500, 'left'); ctx.restore();
      }
    });
  }
  list.forEach((sc, i) => sc.end = list[i + 1] ? list[i + 1].start : 1e9);
  return { scenes: list, sfx };
}
