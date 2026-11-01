// All scenes. Timing comes only from word cues c('phrase', after) so the same code fits any narration of this script.
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, win, hash, GOLD, rr, cam, bg, topShade, label, note, stack, finger, pen, phone, gloveHold, tapFinger, ring, snow, rain, drop, knit, proj3, grid3 } from './lib.js';
import * as S from './screens.js';

// piecewise keyframes: [[t,v],...] eased between keys
const kf = (T, keys, e = eio) => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (T < keys[i][0]) {
    const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e((T - t0) / (t1 - t0));
    return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u);
  }
  return keys[keys.length - 1][1];
};
const focus = (ctx, s, fx, fy, cy = H * .56) => { ctx.translate(W / 2, cy); ctx.scale(s, s); ctx.translate(-fx, -fy); };
function burst(ctx, x, y, t, seed, n = 18) { // white "nothing happens" particles
  if (t <= 0 || t >= 1) return; ctx.fillStyle = '#fff';
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * hash(i, seed), d = 40 + 160 * hash(i, seed + 1) * eo(t);
    ctx.globalAlpha = (1 - t) * .8; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * .6, 2 + 2 * hash(i, seed + 2), 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function counter(ctx, val, x, y, a, sub, sub2) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'left'; ctx.fillStyle = '#fff';
  ctx.font = '800 120px Inter, "Segoe UI", Arial'; ctx.fillText(Math.round(val), x, y);
  const w = ctx.measureText(String(Math.round(val))).width;
  ctx.font = '700 30px Inter, "Segoe UI", Arial'; ctx.fillText(sub, x + w + 20, y - 52);
  if (sub2) { ctx.font = '500 20px Inter, "Segoe UI", Arial'; ctx.globalAlpha = a * .6; ctx.fillText(sub2, x + w + 20, y - 20); }
  ctx.restore();
}
function diamonds(ctx, T, o) { // flat top-down ITO diamond grid
  const { d = 84, a = 1, row = -99, rowP = 0, col = -99, colP = 0, twinkle = 0, ox = 0, oy = 0 } = o;
  ctx.save(); ctx.globalAlpha = a;
  for (let j = -2; j < H / d + 2; j++) for (let i = -2; i < W / d + 2; i++) for (let k = 0; k < 2; k++) {
    const x = ox + (i + k * .5) * d, y = oy + (j + k * .5) * d, s = d * .43;
    let b = .16 + .05 * hash(i * 7 + j, k);
    if (k === 0 && j === row && x < lerp(-100, W + 100, rowP)) b = .85;
    if (k === 1 && i === col && y < lerp(-100, H + 100, colP)) b = .85;
    ctx.fillStyle = `rgba(220,226,236,${b})`; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s, y); ctx.fill();
    if (twinkle > 0 && k === 0) { const tw = twinkle * (.5 + .5 * Math.sin(T * 6 + hash(i, j) * 20)); ctx.fillStyle = `rgba(255,255,255,${tw})`; ctx.beginPath(); ctx.arc(x + d / 4, y + d / 4, 5, 0, 7); ctx.fill(); }
  }
  ctx.restore();
}
function waterDome(ctx, x, y, w, h, a = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.ellipse(x, y, w / 2, h, 0, Math.PI, 0); ctx.closePath();
  const g = ctx.createLinearGradient(x, y - h, x, y); g.addColorStop(0, 'rgba(210,230,250,.35)'); g.addColorStop(1, 'rgba(120,160,200,.12)');
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(230,240,255,.7)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(x - w * .2, y - h * .7, w * .08, h * .1, -.5, 0, 7); ctx.fill(); ctx.restore();
}
function woolPad(ctx, x, y, R, a, T) { // knit fingertip seen from above
  ctx.save(); ctx.globalAlpha = a;
  for (let ringI = 0; ringI < 9; ringI++) {
    const r = R * (ringI + 1) / 9, n = Math.round(6 + ringI * 7);
    for (let i = 0; i < n; i++) {
      const an = i / n * Math.PI * 2 + ringI * .3 + T * .05, px = x + Math.cos(an) * r, py = y + Math.sin(an) * r * .78;
      ctx.strokeStyle = `rgba(200,206,216,${.35 + .4 * ringI / 9})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(px, py, 14, 11, an, 0, 7); ctx.stroke();
    }
  }
  ctx.restore();
}

export const CAPTION_SFX = false; // no sound on caption keywords
// Hinglish voice: same scenes, cues mapped to the words it says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      'under the glass': 'tumhare phone ke glass', 'your body is': 'tumhari body mostly', 'the phone sees': 'phone unhi', 'but your glove': 'lekin tumhare gloves',
      'for the phone': 'phone ke liye', "that's also why": 'isi wajah se baarish', "it's why": 'aur isi wajah', 'so your screen never': 'to tumhari screen', 'follow me': 'aise hi aur',
      lightest: 'ungli', finger: 'halke se touch|ungli', ignores: 'lekin ek pen', pressed: 'daba', hard: 'zor', can: 'phir bhi', 'so what|how is': 'aakhir', "isn't": 'kyunki screen', body: 'measure',
      winter: 'sardi',
      rows: 'ek direction', columns: 'doosri direction', everywhere: 'jahan bhi', crosses: 'cross', checks: 'check', 'every one': 'in sabhi', 'over and over': 'baar-baar',
      conducts: 'conduct', bare: 'bina glove', close: 'paas', pulls: 'kheench', away: 'leta hai', crossings: 'neeche wale', 'right under': 'thoda sa',
      dip: 'kami', separately: 'alag-alag', two: 'do ungliyon', 'which is how': 'isi tarah',
      conduct: 'conduct', pressing: 'press', never: 'hi nahi hota', moves: 'move',
      nobody: 'kisi ne',
      crazy: 'pagal', rain: 'baarish', water: 'paani', too: 'bhi electricity', drop: 'boond', like: 'jaisi',
      work: 'kaam', 'they have': 'unke', carries: 'pahunchata',
      felt: 'feel', tiny: 'chhota sa', missing: 'gayab', took: 'hata',
      send: 'ye us', someone: 'insaan', works: 'kabhi kaam', wet: 'geele',
    },
    keywords: 'phone touch pen ignore pressure electricity body sardi gloves call glass grid wires row column cross charge salty conduct ungli bina exact kami alagalag pinch zoom move baarish pagal paani boond conductive thread pahunchata gayab follow bhejo geele',
    emoji: { electricity: '⚡', salty: '💧', baarish: '🌧', gloves: '🧤', geele: '💦', phone: '📱' },
  },
};

export function makeScenes(c, lang = 'en') {
  const named = lang !== 'hi'; // Hindi version: profile picture only, no channel name
  const A = {
    hook: 0, winter: c('imagine') - .1, grid: c('under the glass') - .1, body: c('your body is') - .1,
    detect: c('the phone sees') - .1, glove: c('but your glove') - .1, nobody: c('for the phone') - .1,
    rain: c("that's also why") - .1,
  };
  A.tglove = c("it's why", A.rain) - .1; A.outro = c('so your screen never') - .1; A.cta = c('follow me') - .1;
  const sfx = [], tap = (t, g = -14) => sfx.push({ t, k: 'click', g }), wh = (t, g = -16) => sfx.push({ t, k: 'whoosh', g });
  const list = [];
  const add = (start, draw) => { list.push({ start, draw }); if (start > 0) wh(start - .12); };

  // 1 HOOK — finger vs pen over the magnified screen stack
  {
    const K = { phone: c('phone'), light: c('lightest'), fing: c('finger'), ign: c('ignores'), press: c('pressed'), hard: c('hard'), can: c('can'),
      sowhat: c('so what|how is'), isnt: c("isn't"), pres2: c('pressure'), elec: c('electricity'), body: c('body'), end: A.winter };
    sfx.push({ t: K.light - .5, k: 'riser', g: -24 }, { t: K.press + .1, k: 'tick', g: -14 }, { t: K.hard, k: 'tick', g: -12 }, { t: K.pres2, k: 'tick', g: -14 }, { t: K.elec - .6, k: 'riser', g: -20 });
    add(0, (ctx, T) => {
      bg(ctx, T);
      const s = kf(T, [[0, 1.75], [K.ign - .3, 1.6], [K.sowhat, 1.6], [K.sowhat + .6, 1.15], [K.elec - .3, 1.2], [K.elec + .3, 1.7], [K.body, 1.7], [K.body + .5, .7]]);
      const f = kf(T, [[0, [380, 1040]], [K.ign - .3, [430, 1040]], [K.ign + .3, [700, 1040]], [K.sowhat, [700, 1040]], [K.sowhat + .6, [540, 1000]], [K.elec - .3, [540, 1000]], [K.elec + .3, [420, 1020]]]);
      ctx.save(); focus(ctx, s, f[0], f[1]);
      const fy = kf(T, [[0, [-400, 400]], [K.light, [330, 1060]], [K.fing, [340, 1092]], [K.sowhat, [340, 1092]], [K.sowhat + .5, [-500, 700]], [K.elec - .5, [-500, 700]], [K.elec, [400, 1085]]], eo);
      const pull = p(T, K.light - .3, .7) * (1 - p(T, K.sowhat, .4)) + p(T, K.elec - .2, .5);
      const ptip = kf(T, [[0, [1400, 300]], [K.ign - .5, [1400, 300]], [K.ign, [780, 1108]], [K.press, [780, 1108]], [K.press + .25, [780, 1116]], [K.can + .3, [780, 1116]], [K.sowhat + .3, [820, 960]], [K.isnt, [820, 960]], [K.pres2, [790, 1112]], [K.elec - .5, [790, 1112]], [K.elec, [1500, 400]]], eo);
      const shake = T > K.hard && T < K.can + .3 ? Math.sin(T * 70) * 2 : 0;
      stack(ctx, T, { y: 1150, pulls: [{ x: fy[0] + 30, y: fy[1] + 10, s: pull, r: 110 }] });
      burst(ctx, ptip[0], 1108, (T - K.press - .1) / .9, 3); burst(ctx, ptip[0], 1108, (T - K.hard) / .9, 7); burst(ctx, ptip[0], 1108, (T - K.pres2) / .9, 11);
      finger(ctx, { x: fy[0], y: fy[1], ang: -.75, wid: 240, T, glow: p(T, K.elec, .5) });
      pen(ctx, { x: ptip[0] + shake, y: ptip[1], ang: .5 });
      const la = 1 - p(T, K.sowhat, .3);
      label(ctx, 'GLASS', 470, 1010, p(T, K.phone, .4) * la, 470, 1106, 20);
      label(ctx, 'WIRES', 570, 975, p(T, K.light, .4) * la, 570, 1140, 20);
      label(ctx, 'CHARGE', 330, 930, p(T, K.fing - .2, .4) * la, 360, 1070, 20);
      ctx.restore(); topShade(ctx); note(ctx, 'Magnified illustration', 40, H - 60, 1 - p(T, K.sowhat, .3));
    });
  }
  // 2 WINTER — gloved hand can't answer a call
  {
    const s0 = A.winter, K = { wint: c('winter'), call: c('call'), gloves: c('gloves'), end: A.grid };
    sfx.push({ t: K.call, k: 'ring', g: -18 }, { t: K.gloves + .1, k: 'tick', g: -14 }, { t: K.gloves + 1.3, k: 'tick', g: -14 });
    add(s0, (ctx, T) => {
      bg(ctx, T, { top: '#11161f', bot: '#030406', dust: 0 }); snow(ctx, T, 90, .5 + .5 * p(T, K.wint, 1));
      ctx.save(); focus(ctx, lerp(1, 1.12, (T - s0) / (K.end - s0)) * 1.2, 540, 1220, H * .6);
      const py = lerp(2400, 1180, eback((T - s0) / .7)), ringing = T > K.call;
      const rot = -.04 + (ringing ? Math.sin(T * 55) * .012 * ((T * 1.5) % 1 < .35) : 0);
      gloveHold(ctx, { x: 540, y: py, part: 'back' });
      phone(ctx, { x: 540, y: py, w: 470, h: 1000, rot }, (x, w, h) => {
        if (!ringing) S.lock(x, w, h, T, { frost: p(T, K.wint, 1) }); else S.call(x, w, h, T, {}); S.frostFx(x, w, h, T, p(T, K.wint, 1) * .6);
      });
      gloveHold(ctx, { x: 540, y: py, part: 'front' });
      const kx = 540 - 235 + 82, ky = py + 500 - 128;
      const tf = kf(T, [[s0, [1300, 2300]], [K.gloves - .5, [1300, 2300]], [K.gloves, [kx, ky]], [K.gloves + .5, [kx + 40, ky]], [K.gloves + .8, [kx, ky]], [K.gloves + 1.2, [kx + 50, ky]], [K.gloves + 1.6, [kx, ky]]], eo);
      tapFinger(ctx, { x: tf[0], y: tf[1] });
      ring(ctx, kx, ky, (T - K.gloves) / .6, '255,120,120'); ring(ctx, kx, ky, (T - K.gloves - 1.2) / .6, '255,120,120');
      ctx.restore(); topShade(ctx);
    });
  }
  // 3 GRID — wires under the glass, rows, columns, crossings, scanning
  {
    const s0 = A.grid, K = { glass: c('glass', s0), grid: c('grid', s0), rows: c('rows'), cols: c('columns'), every: c('everywhere'), crosses: c('crosses'),
      charge: c('charge', s0), checks: c('checks'), one: c('every one'), over: c('over and over'), end: A.body };
    sfx.push({ t: K.grid, k: 'data', g: -20 }, { t: K.rows, k: 'sweep', g: -20 }, { t: K.cols, k: 'sweep', g: -20 }, { t: K.crosses, k: 'whoosh', g: -18 }, { t: K.charge, k: 'pop', g: -14 }, { t: K.checks, k: 'data', g: -18 }, { t: K.over - .3, k: 'gear', g: -18 });
    add(s0, (ctx, T) => {
      bg(ctx, T, { dust: 20 });
      if (T < K.grid + .2) { // push into the phone glass
        const s = lerp(1, 3.4, p(T, s0 + .2, K.grid - s0, eio));
        ctx.save(); focus(ctx, s, 540, 1250, H * .55);
        phone(ctx, { x: 540, y: 1150, w: 470, h: 1000 }, (x, w, h) => S.call(x, w, h, T, {}));
        ctx.restore();
        diamonds(ctx, T, { a: p(T, K.glass, .8) * .9 });
      } else if (T < K.crosses) {
        diamonds(ctx, T, { d: 92, a: 1, row: 8, rowP: p(T, K.rows, 1.2), col: 6, colP: p(T, K.cols, 1.2), twinkle: p(T, K.every, .4), ox: -20 * (T - K.grid), oy: 0 });
        label(ctx, 'ROW', 80, 8 * 92 - 30, p(T, K.rows, .4), undefined, undefined, 22);
        label(ctx, 'COLUMN', 6 * 92 + 46 - 20 * (T - K.grid) + 120, 1300, p(T, K.cols + .3, .4), undefined, undefined, 22);
        note(ctx, 'The wires are transparent in a real phone', 40, H - 60, 1);
      } else {
        const dist = kf(T, [[K.crosses, 2.6], [K.one - .2, 3.2], [K.over + .8, 16]]);
        const P = proj3({ pitch: kf(T, [[K.crosses, .75], [K.over, 1.0]]), yaw: Math.PI / 4 + .08 * Math.sin(T * .3), dist, cy: H * .6 });
        const scan = T > K.checks ? -6 + ((T - K.checks) * (T > K.one ? 18 : 5)) % 12 : -99;
        grid3(ctx, T, P, { n: 9, arcs: p(T, K.charge, .5), nums: p(T, K.checks + .3, .5), gold: (i, j) => (i === 0 && j === -1 ? p(T, K.charge - .3, .5) * (1 - p(T, K.one, .5)) : 0), scan });
        const cp = P(0, 0); if (cp) label(ctx, 'CROSSING', cp[0] - 230, cp[1] - 200, win(T, K.crosses + .2, K.charge), cp[0], cp[1] - 10, 22);
        if (cp) label(ctx, 'CHARGE', cp[0] + 200, cp[1] - 250, win(T, K.charge + .2, K.checks), cp[0] + 40, cp[1] - 60, 22);
        counter(ctx, lerp(0, 120, p(T, K.over, 1.2)), 70, 1640, p(T, K.over, .4), 'scans a second', 'Many phones, e.g. iPhone X and later');
      }
      topShade(ctx);
    });
  }
  // 4 BODY — salty water conducts; bare fingertip pulls charge
  {
    const s0 = A.body, K = { mostly: c('mostly'), salty: c('salty'), cond: c('conducts', s0), bare: c('bare'), close: c('close', s0), pulls: c('pulls'),
      charge: c('charge', s0), away: c('away'), cross: c('crossings', s0), under: c('right under'), end: A.detect };
    sfx.push({ t: K.mostly, k: 'pop', g: -14 }, { t: K.cond, k: 'shimmer', g: -18 }, { t: K.pulls - .2, k: 'riser', g: -20 }, { t: K.charge, k: 'data', g: -20 }, { t: K.cross, k: 'tick', g: -16 });
    add(s0, (ctx, T) => {
      bg(ctx, T);
      const s = kf(T, [[s0, 1.1], [K.mostly, 1.35], [K.bare - .2, 1.35], [K.bare + .4, 1.3], [K.cross, 1.35], [K.under, 1.8]]);
      const f = kf(T, [[s0, [540, 1000]], [K.mostly, [540, 760]], [K.bare - .2, [540, 760]], [K.bare + .4, [540, 1080]], [K.cross, [540, 1200]], [K.under, [540, 1400]]]);
      ctx.save(); focus(ctx, s, f[0], f[1]);
      const ty = kf(T, [[s0, 860], [K.bare, 860], [K.close + .3, 1222]], eio), pull = p(T, K.pulls - .2, .7);
      const { xs, ws } = stack(ctx, T, { y: 1330, values: 1, pulls: [{ x: 560, y: ty + 4, s: pull, r: 95 }] });
      finger(ctx, { x: 540, y: ty, ang: -.35, wid: 300, T, ions: win(T, K.mostly, K.bare, .35), glow: Math.max(p(T, K.cond, .5) * (1 - p(T, K.bare, .3)), pull * .8) });
      if (T > K.cross) { // bracket under dipped values
        const d = xs.map((x, i) => [x, ws[i]]).filter(v => v[1] > .1); if (d.length) {
          const a = p(T, K.cross, .4), x0 = d[0][0] - 40, x1 = d[d.length - 1][0] + 40, y = 1330 + 130;
          ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y - 14); ctx.lineTo(x0, y); ctx.lineTo(lerp(x0, x1, a), y); if (a > .99) ctx.lineTo(x1, y - 14); ctx.stroke();
        }
      }
      ctx.restore(); topShade(ctx);
      note(ctx, T < K.bare ? 'Magnified illustration' : 'Values illustrative', W - 40, H - 60, 1, 'right');
    });
  }
  // 5 DETECT — dip map, touch, two fingers, pinch to zoom
  {
    const s0 = A.detect, K = { dip: c('dip'), exact: c('exact'), touch: c('touch', s0), sep: c('separately'), two: c('two'), how: c('which is how'), pinch: c('pinch'), end: A.glove };
    const C1 = { '0,0': 62, '1,0': 84, '-1,0': 81, '0,1': 82, '0,-1': 83, '1,1': 95, '-1,-1': 96, '1,-1': 94, '-1,1': 95 };
    const C2 = { '3,-3': 72, '4,-3': 76, '3,-2': 79, '2,-3': 86, '3,-4': 88 };
    sfx.push({ t: K.dip, k: 'data', g: -18 }, { t: K.exact, k: 'pop', g: -16 }, { t: K.touch, k: 'shutter', g: -12 }, { t: K.two, k: 'pop', g: -14 }, { t: K.two + .25, k: 'pop', g: -16 }, { t: K.pinch, k: 'whoosh', g: -18 });
    add(s0, (ctx, T) => {
      bg(ctx, T, { dust: 20 });
      if (T < K.pinch - .25) {
        const dist = kf(T, [[s0, 7], [K.dip, 5.4], [K.touch, 4.6], [K.sep, 5.2], [K.two, 7.5], [K.how, 7.5], [K.pinch, 12]]);
        const P = proj3({ pitch: kf(T, [[s0, .9], [K.how, .9], [K.pinch, .2]]), yaw: Math.PI / 4 + .1 * Math.sin(T * .4), dist, cy: H * .6, tx: kf(T, [[K.two - .2, 0], [K.two + .6, 1.5]]), ty: kf(T, [[K.two - .2, 0], [K.two + .6, -1.5]]) });
        const val = (i, j) => { const k = i + ',' + j; if (C1[k] && T > K.dip + (Math.abs(i) + Math.abs(j)) * .06) return C1[k]; if (C2[k] && T > K.two) return C2[k]; return 100; };
        const hi = (i, j) => (Math.abs(i + .5) < 1.5 && Math.abs(j + .5) < 1.5 ? p(T, K.exact, .4) * .55 : 0) + (T > K.two && Math.abs(i - 2.5) < 1.2 && Math.abs(j + 3.5) < 1.2 ? .4 : 0);
        const scan = T > K.sep - .8 && T < K.two ? -9 + (T - K.sep + .8) * 9 : -99;
        grid3(ctx, T, P, { n: 9, arcs: .8, nums: 1, valueFn: val, hi, scan });
        const c0 = P(0, 0);
        if (c0) {
          const t = (T - K.touch) / .9; ring(ctx, c0[0], c0[1], t, '255,255,255', 30, 260); ring(ctx, c0[0], c0[1], t - .2, GOLD, 30, 200);
          if (T > K.sep) { ctx.strokeStyle = `rgba(255,255,255,${p(T, K.sep, .4) * .8})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(c0[0], c0[1] - 20, 150 * 6 / dist, 90 * 6 / dist, 0, 0, 7); ctx.stroke(); }
        }
        const c2 = P(3, -3); if (c2 && T > K.two) { ctx.strokeStyle = `rgba(255,255,255,${p(T, K.two, .4) * .8})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(c2[0], c2[1] - 20, 120 * 6 / dist, 72 * 6 / dist, 0, 0, 7); ctx.stroke(); }
        if (c0) label(ctx, 'TOUCH ✓', c0[0], c0[1] - 280, win(T, K.touch + .1, K.sep, .2), undefined, undefined, 30);
        note(ctx, 'Values illustrative', 40, H - 60, 1);
      } else {
        const z = 1 + .7 * p(T, K.pinch + .2, 1.4, eio), sp = 60 + 120 * p(T, K.pinch + .2, 1.4, eio);
        ctx.save(); focus(ctx, lerp(1.25, 1.1, p(T, K.pinch - .25, .5)), 540, 1100);
        phone(ctx, { x: 540, y: 1100, w: 520, h: 1080, s: eo5((T - K.pinch + .25) / .5) * .1 + .9 }, (x, w, h) => S.photo(x, w, h, T, z));
        tapFinger(ctx, { x: 560 + sp, y: 1000 - sp * .5, glove: false, ang: -.45 });       // index: body down-right
        tapFinger(ctx, { x: 500 - sp * .8, y: 1120 + sp * .4, glove: false, ang: .55 });   // thumb: body down-left
        ring(ctx, 560 + sp, 1000 - sp * .5, ((T - K.pinch) * 1.5) % 1, '255,255,255', 30, 60); ring(ctx, 500 - sp * .8, 1120 + sp * .4, ((T - K.pinch) * 1.5) % 1, '255,255,255', 30, 60);
        ctx.restore();
      }
      topShade(ctx);
    });
  }
  // 6 GLOVE — wool doesn't conduct, charge never moves
  {
    const s0 = A.glove, K = { cond: c('conduct', s0), fing: c('finger', s0), press: c('pressing'), charge: c('charge', s0), never: c('never', s0), moves: c('moves'), end: A.nobody };
    sfx.push({ t: K.press, k: 'tick', g: -12 }, { t: K.never, k: 'whoosh', g: -20 }, { t: K.moves, k: 'pop', g: -16 });
    add(s0, (ctx, T) => {
      bg(ctx, T);
      if (T < K.cond - .1) {
        ctx.save(); focus(ctx, lerp(1.1, 1.25, (T - s0) / (K.cond - s0)), 540, 950);
        woolPad(ctx, 540, 950, 330, p(T, s0, .4), T); label(ctx, 'WOOL', 760, 1260, p(T, s0 + .3, .4), 700, 1200, 22); ctx.restore();
      } else {
        const ty = kf(T, [[K.cond, 1000], [K.press, 1258]], eio);
        ctx.save(); focus(ctx, kf(T, [[K.cond, 1.25], [K.press, 1.05], [K.never, 1]]), 540, kf(T, [[K.cond, 1050], [K.press, 1200]]));
        const bare = p(T, K.never, .6, eo);
        stack(ctx, T, { y: 1380, values: p(T, K.charge - .4, .4), pulls: [{ x: 880, y: 1290, s: bare, r: 90 }] });
        finger(ctx, { x: 460, y: ty, ang: -.3, wid: 330, T, wool: 1 });
        finger(ctx, { x: lerp(1300, 880, bare), y: lerp(900, 1290, bare), ang: .45, wid: 240, T, alpha: bare, glow: bare * .7 });
        label(ctx, 'GLOVE', 300, 1000, win(T, K.never + .3, K.end, .3), 360, 1160, 22); label(ctx, 'BARE', 900, 1000, win(T, K.never + .3, K.end, .3), 880, 1130, 22);
        ctx.restore();
      }
      topShade(ctx); note(ctx, T > K.charge ? 'Values illustrative' : 'Magnified illustration', W - 40, H - 60, 1, 'right');
    });
  }
  // 7 NOBODY — missed call
  {
    const s0 = A.nobody, K = { nobody: c('nobody'), end: A.rain };
    sfx.push({ t: K.nobody, k: 'pop', g: -14 });
    add(s0, (ctx, T) => {
      bg(ctx, T, { top: '#11161f', bot: '#030406', dust: 0 }); snow(ctx, T, 90, .8);
      ctx.save(); focus(ctx, lerp(1.08, 1, eo5((T - s0) / .6)) * lerp(1, 1.06, (T - s0) / (K.end - s0)) * 1.2, 540, 1220, H * .6);
      gloveHold(ctx, { x: 540, y: 1180, part: 'back' });
      phone(ctx, { x: 540, y: 1180, w: 470, h: 1000, rot: -.04 }, (x, w, h) => T < K.nobody ? S.call(x, w, h, T, {}) : S.lock(x, w, h, T, { missed: p(T, K.nobody, .5, eback) }));
      gloveHold(ctx, { x: 540, y: 1180, part: 'front' });
      ctx.restore(); topShade(ctx);
    });
  }
  // 8 RAIN — water conducts; every drop looks like a finger
  {
    const s0 = A.rain, K = { crazy: c('crazy'), rain: c('rain', s0), water: c('water'), too: c('too'), drop: c('drop'), like: c('like', s0), end: A.tglove };
    sfx.push({ t: K.crazy, k: 'glitch', g: -16 }, { t: K.rain, k: 'rain', g: -22 }, { t: K.too, k: 'pop', g: -16 });
    for (let i = 0; i < 6; i++) tap(K.like + i * .16, -20);
    add(s0, (ctx, T) => {
      bg(ctx, T, { top: '#10151d', bot: '#030406', dust: 0 });
      const ra = .4 + .6 * p(T, K.rain, .6);
      if (T < K.water - .1 || T > K.drop - .1) {
        ctx.save(); focus(ctx, lerp(1.06, 1, eo5((T - s0) / .6)) * lerp(1, 1.06, (T - s0) / (K.end - s0)) * 1.2, 540, 1220, H * .6);
        gloveHold(ctx, { x: 540, y: 1180, part: 'back' });
        phone(ctx, { x: 540, y: 1180, w: 470, h: 1000, rot: -.04 }, (x, w, h) => {
          const crazy = T > K.crazy && T < K.water;
          if (T < s0 + .5) S.lock(x, w, h, T, {}); else if (crazy && Math.floor(T * 5) % 3 === 1) S.map(x, w, h, T); else S.home(x, w, h, T, { jitter: crazy ? 1 : 0 });
          const nd = T > K.drop ? 9 : Math.floor(14 * p(T, K.rain, 2.5, x => x));
          for (let i = 0; i < nd; i++) { const dx = 60 + hash(i, 21) * (w - 120), dy = 300 + hash(i, 22) * (h - 500); drop(x, dx, dy, 16 + 12 * hash(i, 23)); ring(x, dx, dy, (T - K.like - i * .16) / .6, '255,255,255', 20, 70); }
          if (crazy) for (let i = 0; i < 4; i++) { const tt = (T * 3 + i * .25) % 1, k = Math.floor(T * 3 + i * .25); ring(x, hash(k, 5) * w, hash(k, 6) * h, tt, '255,255,255', 15, 60); }
        });
        gloveHold(ctx, { x: 540, y: 1180, part: 'front' });
        ctx.restore();
      } else {
        ctx.save(); focus(ctx, kf(T, [[K.water, 1.3], [K.too, 1.0]]), kf(T, [[K.water, 540], [K.too, 640]]), 1150);
        const fp = p(T, K.too, .6);
        stack(ctx, T, { y: 1260, values: 1, pulls: [{ x: 540, y: 1060, s: p(T, K.water, .6) * .9, r: 130 }, { x: 900, y: 1150, s: fp, r: 90 }] });
        waterDome(ctx, 540, 1220, 380, 200, p(T, K.water - .1, .4));
        finger(ctx, { x: lerp(1300, 900, fp), y: lerp(800, 1150, fp), ang: .45, wid: 230, T, alpha: fp, glow: fp * .6 });
        label(ctx, 'WATER', 540, 960, p(T, K.water + .2, .3), 540, 1010, 22);
        ctx.restore();
      }
      rain(ctx, T, 120, ra); topShade(ctx);
    });
  }
  // 9 TOUCHSCREEN GLOVES — conductive thread carries the charge
  {
    const s0 = A.tglove, K = { work: c('work', s0), have: c('they have'), tips: c('fingertips'), carries: c('carries'), glass: c('glass', s0), end: A.outro };
    sfx.push({ t: K.work - .3, k: 'tick', g: -12 }, { t: K.work, k: 'success', g: -14 }, { t: K.have, k: 'whoosh', g: -18 }, { t: K.carries, k: 'shimmer', g: -16 }, { t: K.glass, k: 'data', g: -18 });
    add(s0, (ctx, T) => {
      bg(ctx, T, { top: '#10151d', bot: '#030406', dust: 0 });
      if (T < K.have - .1) {
        ctx.save(); focus(ctx, lerp(1.0, 1.08, (T - s0) / (K.have - s0)) * 1.2, 540, 1220, H * .6);
        gloveHold(ctx, { x: 540, y: 1180, part: 'back' });
        phone(ctx, { x: 540, y: 1180, w: 470, h: 1000, rot: -.04 }, (x, w, h) => S.call(x, w, h, T, { slide: p(T, K.work - .3, .7), answered: p(T, K.work + .5, .4) }));
        gloveHold(ctx, { x: 540, y: 1180, part: 'front' });
        const sl = eo(p(T, K.work - .3, .7, x => x)), kx = 540 - 235 + 82 + sl * 306, ky = 1180 + 500 - 128;
        tapFinger(ctx, { x: kf(T, [[s0, 1300], [K.work - .5, kx]], eo) + (T > K.work - .5 ? kx - (540 - 235 + 82) : 0), y: kf(T, [[s0, 2300], [K.work - .5, ky]], eo), tint: '#4a4d54' });
        ring(ctx, kx, ky, (T - K.work + .3) / .6, '120,255,150');
        ctx.restore();
      } else if (T < K.tips - .1) {
        const s = lerp(2.2, 2.6, (T - K.have) / (K.tips - K.have));
        ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2);
        ctx.fillStyle = knit(ctx, '#55595f'); ctx.fillRect(-W, -H, W * 3, H * 3);
        const th = p(T, K.have + .4, .8);
        for (let r = 0; r < 120; r += 5) { ctx.fillStyle = `rgba(230,236,248,${.75 * th})`; ctx.fillRect(-W, r * 20 + 2 - 600, W * 3, 6); ctx.fillStyle = `rgba(230,236,248,${.15 * th})`; ctx.fillRect(-W, r * 20 - 4 - 600, W * 3, 18); }
        ctx.restore();
        label(ctx, 'CONDUCTIVE THREAD', 720, 1150, th, 640, 1210, 22); note(ctx, 'Magnified illustration', W - 40, H - 60, 1, 'right');
      } else {
        ctx.save(); focus(ctx, kf(T, [[K.tips, 1.35], [K.carries, 1.1]]), 540, kf(T, [[K.tips, 1200], [K.carries, 1250]]));
        const cg = p(T, K.carries, .6);
        stack(ctx, T, { y: 1380, values: p(T, K.glass - .3, .4), pulls: [{ x: 540, y: 1300, s: cg, r: 100 }] });
        finger(ctx, { x: 540, y: 1258, ang: -.3, wid: 330, T, wool: 1, thread: 1, woolGlow: cg, glow: cg * .6 });
        ctx.restore();
      }
      topShade(ctx);
    });
  }
  // 10 OUTRO — a tiny bit of charge goes missing
  {
    const s0 = A.outro, K = { felt: c('felt', s0), tiny: c('tiny', s0), missing: c('missing'), took: c('took'), end: A.cta };
    sfx.push({ t: K.tiny, k: 'tick', g: -14 }, { t: K.missing, k: 'data', g: -16 }, { t: K.took, k: 'shimmer', g: -14 });
    add(s0, (ctx, T) => {
      bg(ctx, T);
      ctx.save(); focus(ctx, kf(T, [[s0, 1], [K.felt, 1.25], [K.end, 1.4]]), 540, 1100);
      const st = p(T, K.felt - .2, .6) * (1 - .8 * p(T, K.missing, .4));
      stack(ctx, T, { y: 1250, sp: 150, pulls: [{ x: 540, y: 900, s: st, r: 55 }], focus: 3, focusA: 0 });
      finger(ctx, { x: 540, y: 890, ang: -.25, wid: 460, T, glow: .3 + .5 * p(T, K.took, .5) });
      if (T > K.took) for (let i = 0; i < 3; i++) ring(ctx, 540, 880, ((T - K.took) * .9 + i / 3) % 1, GOLD, 10, 90);
      const v = T < K.tiny ? 100 : T < K.missing ? kf(T, [[K.tiny, 100], [K.tiny + .5, 98], [K.missing - .3, 72]]) : 71;
      ctx.restore();
      counter(ctx, v, 80, 1700, p(T, K.felt, .4), 'less than 1 pF', 'charge change · values illustrative');
      topShade(ctx);
    });
  }
  // 11 CTA — follow + share UI
  {
    const s0 = A.cta, K = { follow: c('follow', s0), send: c('send', s0), someone: c('someone'), works: c('works', s0), wet: c('wet') };
    const sx = 540 - 320, sy = 1080 - 650; // screen origin for w=640 h=1300
    const tg = { follow: [sx + 315, sy + 1300 - 230], share: [sx + 640 - 46, sy + 1300 * .48 + 3 * 86 - 12], sofia: [sx + 80, sy + 1300 * .42 + 180], send: [sx + 320, sy + 1300 * .42 + 415] };
    const taps = [[K.follow + .25, tg.follow], [K.send, tg.share], [K.someone + .1, tg.sofia], [K.works, tg.send]];
    taps.forEach(([t]) => tap(t, -12)); sfx.push({ t: K.send + .15, k: 'swoosh', g: -20 }, { t: K.wet, k: 'drip', g: -16 });
    add(s0, (ctx, T) => {
      bg(ctx, T);
      ctx.save(); focus(ctx, lerp(1.25, 1.12, eo5((T - s0) / .6)), 540, 1150, H * .58);
      phone(ctx, { x: 540, y: 1080, w: 640, h: 1300 }, (x, w, h) => S.reel(x, w, h, T, { named, following: T > taps[0][0], share: p(T, K.send + .15, .5), pick: T > taps[2][0], sent: T > taps[3][0], wet: p(T, K.wet - .4, 1.2, x => x) }));
      const keys = [[s0, [900, 2300]]]; taps.forEach(([t, xy]) => { keys.push([t - .35, xy]); keys.push([t + .15, xy]); });
      const fp = kf(T, keys, eio), press = taps.some(([t]) => T > t - .08 && T < t + .1);
      tapFinger(ctx, { x: fp[0], y: fp[1] + (press ? 6 : 0), glove: false, ang: -.2, glow: press ? .8 : .25 });
      taps.forEach(([t, xy]) => ring(ctx, xy[0], xy[1], (T - t) / .5));
      ctx.restore(); topShade(ctx);
    });
  }
  list.forEach((s, i) => s.end = list[i + 1] ? list[i + 1].start : 1e9);
  return { scenes: list, sfx };
}
