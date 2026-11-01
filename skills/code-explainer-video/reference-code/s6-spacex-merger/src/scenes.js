// "Why would Tesla merge with SpaceX?" - the share-swap explainer. All timing from word cues c('phrase', after).
// Drawn in code (merger.js + kit.js). User assets: logos only (SpaceX, xAI, Grok, Tesla, Barclays, J.P. Morgan, RBC) keyed out in src/assets.
// No presenter. Dark space scenes alternate with light "paper" scenes for the money beats; ending is themed on the merger (code merges two share cards).
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, hash, rr, alive, flipIn } from './lib.js';
import { FONT, MONO, GREEN, RED, txt, tw, bin, pop, card, cursor, clickRing, check, xmark, pill, avatar, glowDot, bar, logo } from './kit.js';
import { TRED, TRED_RGB, SBLUE, SBLUE_RGB, AI, AI_RGB, GOLDC, GOLD_RGB, MINT, MINT_RGB, space, paperBg, ground, tag, title, stamp, arrow, lg, teslaT, car, rocket, person, robot, chip,
  planet, dcSat, shareCard, priceTag, bill, coin, doc, pie, cashStack, bubble, glassRoom, table, wheel } from './merger.js';

export const IMAGES = ['spacex.png', 'spacex_w.png', 'xai.png', 'xai_w.png', 'grok.png', 'grok_w.png', 'tesla.png', 'tesla_w.png', 'barclays.png', 'jpm.png', 'jpm_w.png', 'rbc.png'];
const kf = (T, keys, e = eio) => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (T < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e((T - t0) / Math.max(1e-3, t1 - t0)); return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u); }
  return keys[keys.length - 1][1];
};
const live = (ctx, T, x, y, o, fn) => { ctx.save(); alive(ctx, T, x, y, o); fn(); ctx.restore(); };
const flip = (ctx, k, x, y, fn) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k * 1.5); flipIn(ctx, x, y, k); fn(); ctx.restore(); };
const typed = (s, T, t0, t1) => s.slice(0, Math.floor(s.length * clamp((T - t0) / Math.max(.05, t1 - t0))));
const shot = (ctx, T, t0, fn, { cx = 540, cy = 1150, push = .05, dur = 6 } = {}) => { // scene punch-in 1.1 -> 1, then a slow push
  const z = lerp(1.1, 1, eo(clamp((T - t0) / .55))) * (1 + push * eio(clamp((T - t0) / dur)));
  ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); fn(); ctx.restore();
};
const panel = (ctx, x, y, w, h, r = 30, { light = false } = {}) => { // glossy glass card
  ctx.save(); ctx.shadowColor = light ? 'rgba(30,40,80,.25)' : 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; rr(ctx, x, y, w, h, r);
  const g = ctx.createLinearGradient(x, y, x, y + h); if (light) { g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#eef1f7'); } else { g.addColorStop(0, 'rgba(36,42,58,.95)'); g.addColorStop(1, 'rgba(14,17,26,.95)'); } ctx.fillStyle = g; ctx.fill(); ctx.restore();
  ctx.save(); rr(ctx, x, y, w, h, r); ctx.strokeStyle = light ? 'rgba(20,30,60,.1)' : 'rgba(255,255,255,.14)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
};
const gear = (ctx, x, y, r, n, rot, col) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < n; i++) { const a = i * Math.PI * 2 / n, d = Math.PI / n * .5; [[-d * 1.3, .8], [-d * .7, 1], [d * .7, 1], [d * 1.3, .8]].forEach(([o, f]) => ctx.lineTo(Math.cos(a + o) * r * f, Math.sin(a + o) * r * f)); }
  ctx.closePath(); ctx.fill(); ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(0, 0, r * .28, 0, 7); ctx.fill(); ctx.restore();
};
const avatarBust = (ctx, T, cx, cy, r) => { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip(); ctx.fillStyle = '#25304f'; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); const s = r / 70; person(ctx, T, cx, cy + 330 * s, s, { bob: 0, face: 1 }); ctx.restore(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); };
const logoPlate = (ctx, T, name, x, y, w, h, { light = false, seed = 0, a = 1 } = {}) => { // glass plate with a logo, gently alive
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; live(ctx, T, x, y, { yaw: .06, bob: 5, breathe: .01, seed }, () => { panel(ctx, x - w / 2, y - h / 2, w, h, 26, { light }); logo(ctx, name, x, y, w * (name === 'tesla_w' || name === 'tesla' ? .3 : .66), 1); }); ctx.restore();
};

export const KEYWORDS = 'tesla spacex ai car rocket trillion robotaxis optimus xai grok terafab merge cash shares share swap bonus banks 20 35 hundreds billions musk himself allowed barclays 37 decided overstating code guide bio 386 159 half';
export const EMOJI = { car: '🚗', rocket: '🚀', cash: '💵', bonus: '🎁', code: '💻', guide: '💬', bio: '🔗' };
export const CAPTION_SFX = false;
// Hinglish voice: same scenes, cues mapped to the words it says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      'company?': 'judegi', 'this week': 'hafte', 'both companies': 'dono companies', 'together': 'milkar', 'both of them': 'dono ab', 'tesla needs': 'tesla ko', robotaxis: 'taxis',
      'and spacex owns': 'spacex ke paas', data: 'space', "they're even": 'dono milke', 'for both': 'banane ko', both: 'dono', 'but how': 'lekin itni', "you don't pay": 'cash se', shares: 'share se',
      'say you own': 'maanlo aapke', 'in the merger': 'merger mein', 'two and a half': 'dhai', 'this is called': 'ise kehte', 'but tesla owners': 'lekin tesla', 'banks think': 'banks ko',
      hundreds: 'saikdon', dollars: 'dollar', "now here's the strange": 'ab ajeeb', negotiating: 'negotiation', himself: 'hoga', "that's why he": 'isliye use', allowed: 'shamil',
      'but barclays': 'lekin barclays', owning: 'phir bhi', percent: 'percent', 'nothing is decided': 'abhi kuch', decided: 'decide', said: 'kaha', overstating: 'zyada',
      "so this isn't": 'to ye asal', "it's one ai": 'ye ek ai', "and here's the crazy": 'aur sabse crazy', comment: 'comment', youtube: 'youtube',
    },
    keywords: 'tesla spacex ai car rocket trillion taxis optimus xai grok terafab merge cash share swap bonus banks 20 35 saikdon musk khud shamil barclays 37 decide zyada code guide bio 386 159 dhai',
    emoji: { car: '🚗', rocket: '🚀', cash: '💵', bonus: '🎁', code: '💻', guide: '💬', bio: '🔗' },
  },
};

export function makeScenes(c, lang = 'en') {
  const named = lang !== 'hi'; // Hindi version: profile picture only, no channel name or handle
  const list = [], sfx = [];
  const add = (start, draw, light = false) => { list.push({ start, light, draw }); if (start > 0) sfx.push({ t: start - .05, k: 'whoosh', g: -19 }); };
  const s = x => x - .1;
  const A = {
    teams: s(c('this week')), worth: s(c('together')), ai: s(c('both of them')), tesla: s(c('tesla needs')), space: s(c('and spacex owns')), chips: s(c("they're even")), merge: s(c('but how')),
    pay: s(c("you don't pay")), say: s(c('say you own')), merger: s(c('in the merger')), swap: s(c('this is called')), bonus: s(c('but tesla owners')), banks: s(c('banks think')),
    strange: s(c("now here's the strange")), talks: s(c("that's why he")), barc: s(c('but barclays')), nothing: s(c('nothing is decided')), so: s(c("so this isn't")), one: s(c("it's one ai")), crazy: s(c("and here's the crazy")),
  };

  // 1 HOOK: car and rocket side by side, a giant "?" between them
  { const K = { car: c('car'), rocket: c('rocket') }; K.q = c('company?', K.rocket);
    sfx.push({ t: .02, k: 'riser', g: -21 }, { t: K.rocket, k: 'swoosh', g: -19 });
    add(0, (ctx, T) => {
      space(ctx, T, { gy: 1250, tint: '40,70,170' });
      shot(ctx, T, 0, () => {
        ground(ctx, 1560);
        const cx = lerp(-320, 290, eo5(clamp((T + .2) / 1.2))), fl = .18 + .8 * p(T, K.rocket, .6) * (1 - .3 * p(T, K.q, .8, eio));
        live(ctx, T, cx, 1500, { yaw: .03, bob: 0, breathe: .004, seed: 1 }, () => car(ctx, T, cx, 1560, .8, { glow: p(T, K.car, .5) * .8, spin: T * 8 }));
        live(ctx, T, 800, 1200, { yaw: .02, bob: 4, breathe: .005, seed: 2 }, () => rocket(ctx, T, 800, 1560 + 0 * T, .95, { flame: fl, glow: p(T, K.rocket, .6) }));
        live(ctx, T, 290, 1330, { yaw: .12, bob: 5, seed: 3 }, () => teslaT(ctx, 290, 1320, 110, 'tesla_w', p(T, K.car, .5)));
        live(ctx, T, 800, 790, { yaw: .1, bob: 5, seed: 4 }, () => lg(ctx, 'spacex_w', 800, 780, 340, p(T, K.rocket, .5)));
        const qa = p(T, K.q, .55, eback);
        pop(ctx, qa, 540, 1130, () => live(ctx, T, 540, 1130, { yaw: .1, bob: 8, spin: .05, seed: 5 }, () => { glowDot(ctx, 540, 1100, 360, GOLD_RGB, .7); ctx.save(); ctx.shadowColor = `rgba(${GOLD_RGB},.9)`; ctx.shadowBlur = 50; txt(ctx, '?', 540, 1260, 420, '#fff', 900); ctx.restore(); }));
        pill(ctx, 290, 1660, 'CAR COMPANY', { bg: TRED, size: 30, h: 66, a: p(T, K.car, .4) }); pill(ctx, 800, 1660, 'ROCKET COMPANY', { bg: '#2c64d6', size: 30, h: 66, a: p(T, K.rocket, .4) });
      }, { cy: 1250 });
    });
  }

  // 2 TEAMS: glass meeting room, two teams facing each other, a magnifier over the merger doc
  { const K = { both: c('both companies', A.teams), teams: c('teams', A.teams) };
    add(A.teams, (ctx, T) => {
      space(ctx, T, { gy: 1100, tint: '50,70,160' });
      shot(ctx, T, A.teams, () => {
        glassRoom(ctx, T, 50, 720, 980, 700, { a: p(T, A.teams, .5) });
        const k = p(T, A.teams + .1, .6, eo5);
        [[0, 0], [1, 1], [2, 0]].forEach(([i]) => {
          const y = 1230, lx = 200 + i * 90, rx = 880 - i * 90;
          person(ctx, T, lx, y, .62, { suit: '#7a1426', tie: '#fff', skin: ['#e9b894', '#c98f6a', '#f0c8a8'][i], hair: ['#2a1c12', '#111', '#8a5a2a'][i], seed: i, bob: 1 });
          person(ctx, T, rx, y, .62, { suit: '#e4e8f0', shirt: '#2a64d6', tie: '#14203a', skin: ['#c98f6a', '#e9b894', '#f0c8a8'][i], hair: ['#111', '#6a4a2a', '#222'][i], seed: i + 4, bob: 1 });
        });
        table(ctx, 540, 1215, 900, 76);
        live(ctx, T, 270, 1160, { yaw: .1, bob: 3, seed: 1 }, () => { rr(ctx, 205, 1130, 130, 58, 8); ctx.fillStyle = TRED; ctx.fill(); teslaT(ctx, 270, 1160, 36, 'tesla_w'); });
        live(ctx, T, 810, 1160, { yaw: .1, bob: 3, seed: 2 }, () => { rr(ctx, 745, 1130, 130, 58, 8); ctx.fillStyle = '#f2f5fb'; ctx.fill(); lg(ctx, 'spacex', 810, 1160, 100); });
        tag(ctx, 270, 780, 'TESLA TEAM', p(T, K.both, .45), 270, 1000, { rgb: '255,110,125' }); tag(ctx, 810, 780, 'SPACEX TEAM', p(T, K.both + .15, .45), 810, 1000, { rgb: SBLUE_RGB });
        // merger doc with magnifier
        const dk = p(T, K.teams, .6, eback); flip(ctx, dk, 540, 1640, () => live(ctx, T, 540, 1640, { yaw: .05, bob: 5, seed: 3 }, () => {
          doc(ctx, T, 540, 1640, 300, { lines: 5 });
          const mx = 540 + 90 * Math.sin(T * 1.6), my = 1650 + 30 * Math.sin(T * 2.3);
          ctx.save(); ctx.strokeStyle = '#d9dee8'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(mx, my, 62, 0, 7); ctx.stroke(); ctx.fillStyle = 'rgba(180,220,255,.18)'; ctx.fill(); ctx.lineCap = 'round'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(mx + 44, my + 44); ctx.lineTo(mx + 110, my + 112); ctx.stroke(); ctx.restore(); }));
      }, { cy: 1200 });
      title(ctx, p(T, A.teams + .05, .45), 'EACH SIDE SETS UP A TEAM', '', { y: 640, size: 64 });
    });
  }

  // 3 WORTH $3.7 TRILLION (light)
  { const K = { to: A.worth + .1, n: c('3.7', A.worth), tri: c('trillion', A.worth) };
    sfx.push({ t: K.tri, k: 'shimmer', g: -16 });
    add(A.worth, (ctx, T) => {
      paperBg(ctx, T);
      shot(ctx, T, A.worth, () => {
        const m = p(T, K.n - .2, .9, eio);
        const lx = lerp(250, 345, m), rx = lerp(830, 735, m);
        logoPlate(ctx, T, 'tesla', lx, 880, 300, 220, { light: true, seed: 1 }); logoPlate(ctx, T, 'spacex', rx, 880, 340, 220, { light: true, seed: 2 });
        ctx.save(); txt(ctx, '+', 540, 910, 90, 'rgba(20,30,60,.5)', 900); ctx.restore();
        const v = 3.7 * eo((T - K.n) / .8);
        bin(ctx, p(T, K.n - .1, .3), () => { ctx.save(); ctx.shadowColor = 'rgba(47,123,255,.35)'; ctx.shadowBlur = 40; txt(ctx, '$' + v.toFixed(1), 540, 1300, 250, '#0f1a38', 900); ctx.restore(); });
        const ta = p(T, K.tri, .5, eback); pop(ctx, ta, 540, 1400, () => pill(ctx, 540, 1400, 'TRILLION', { bg: '#2f7bff', size: 54, h: 100, padX: 40 }));
        // gold coins + cash growing under
        const n = Math.floor(14 * eo((T - K.n) / 1.4));
        cashStack(ctx, T, 540, 1760, 360, Math.max(1, n), { a: p(T, K.n - .2, .3) });
        [0, 1, 2, 3, 4].forEach(i => { const a = p(T, K.n + .1 * i, .4, eback); coin(ctx, T, 220 + i * 160 + 20 * Math.sin(T * 2 + i), 1660 + 20 * Math.sin(T * 3 + i * 2), 46, { a, spin: .7 + .1 * i }); });
      }, { cy: 1250 });
      title(ctx, p(T, A.worth + .05, .45), 'TOGETHER, THEY ARE WORTH', '', { y: 640, size: 60, col: '#101a36', subCol: 'rgba(30,40,70,.7)' });
    }, true);
  }

  // 4 BOTH ARE AI COMPANIES
  { const K = { ai: c('ai', A.ai), co: c('companies', A.ai) };
    sfx.push({ t: K.ai, k: 'shimmer', g: -15 });
    add(A.ai, (ctx, T) => {
      space(ctx, T, { gy: 1150, tint: '30,120,170' });
      shot(ctx, T, A.ai, () => {
        const ca = p(T, K.ai, .6, eback);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; [[200, 1060], [880, 1060]].forEach(([x, y], j) => { ctx.strokeStyle = `rgba(${AI_RGB},.55)`; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(540, 1160); ctx.bezierCurveTo(540, 1160 + 100, x, y + 220, x, y + 60); ctx.stroke();
          const u = (T * .8 + j * .5) % 1; glowDot(ctx, lerp(540, x, u), lerp(1160, y + 60, u) + Math.sin(u * Math.PI) * 120, 40, AI_RGB, ca); }); ctx.restore();
        pop(ctx, ca, 540, 1160, () => live(ctx, T, 540, 1160, { yaw: .12, bob: 6, spin: .1, seed: 1 }, () => chip(ctx, T, 540, 1160, 300, { label: 'AI' })));
        live(ctx, T, 200, 1010, { yaw: .12, bob: 5, seed: 2 }, () => { glowDot(ctx, 200, 1010, 200, TRED_RGB, .5); teslaT(ctx, 200, 1000, 170, 'tesla_w', p(T, A.ai, .5)); });
        live(ctx, T, 880, 1010, { yaw: .12, bob: 5, seed: 3 }, () => { glowDot(ctx, 880, 1010, 200, SBLUE_RGB, .4); lg(ctx, 'spacex_w', 880, 1000, 320, p(T, A.ai + .1, .5)); });
        stamp(ctx, p(T, K.co, .45), 540, 1560, 'AI COMPANIES', { col: AI, size: 78, rot: -.04 });
      }, { cy: 1200 });
    });
  }

  // 5 TESLA NEEDS AI: robotaxi + Optimus
  { const K = { taxi: c('robotaxis', A.tesla), opt: c('optimus', A.tesla), hum: c('humanoid', A.tesla) };
    add(A.tesla, (ctx, T) => {
      space(ctx, T, { gy: 1250, tint: '120,30,50' });
      shot(ctx, T, A.tesla, () => {
        ground(ctx, 1560); ctx.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 9; i++) { const x = ((i * 160 - T * 520) % 1440 + 1440) % 1440 - 180; ctx.fillRect(x, 1640, 90, 8); }
        const k = p(T, A.tesla + .05, .7, eo5);
        live(ctx, T, 330, 1500, { yaw: .02, bob: 0, breathe: .004, seed: 1 }, () => car(ctx, T, lerp(-250, 340, k), 1560, .72, { sensing: p(T, K.taxi - .2, .5), glow: .5, spin: T * 14 }));
        pill(ctx, 340, 1360, 'ROBOTAXI', { bg: TRED, size: 34, h: 70, a: p(T, K.taxi, .4, eback) });
        tag(ctx, 340, 1240, 'SELF-DRIVING AI', p(T, K.taxi + .1, .45), 340, 1330, { rgb: AI_RGB });
        const ra = p(T, K.opt, .6, eo5); flip(ctx, ra, 810, 1350, () => live(ctx, T, 810, 1350, { yaw: .1, bob: 0, seed: 2 }, () => robot(ctx, T, 810, 1560, 1.15, { glow: ra, seed: 1 })));
        pill(ctx, 810, 1040, 'OPTIMUS', { bg: '#f2f4f8', fg: '#15171c', size: 34, h: 70, a: p(T, K.opt, .4, eback) });
        tag(ctx, 810, 1000 - 90, 'HUMANOID ROBOT', p(T, K.hum, .45), 810, 1120, { rgb: AI_RGB });
        live(ctx, T, 540, 880, { yaw: .1, bob: 6, seed: 3 }, () => { glowDot(ctx, 540, 830, 240, TRED_RGB, .6); teslaT(ctx, 540, 830, 150, 'tesla_w', p(T, A.tesla, .5)); });
      }, { cy: 1250 });
    });
  }

  // 6 SPACEX OWNS XAI -> GROK, AI DATA CENTERS IN SPACE
  { const K = { xai: c('xai', A.space), grok: c('grok', A.space), data: c('data', A.space) };
    add(A.space, (ctx, T) => {
      space(ctx, T, { gy: 1500, tint: '40,90,200', grid: .4 });
      shot(ctx, T, A.space, () => {
        logoPlate(ctx, T, 'spacex_w', 540, 760, 520, 170, { seed: 1, a: p(T, A.space + .05, .5) });
        const oa = p(T, K.xai - .25, .4); arrow(ctx, 540, 860, 540, 920, { col: GOLDC, w: 14, a: oa }); pill(ctx, 700, 892, 'OWNS', { bg: GOLDC, fg: '#2a1c00', size: 28, h: 56, a: oa });
        flip(ctx, p(T, K.xai, .55, eo5), 300, 1030, () => logoPlate(ctx, T, 'xai_w', 300, 1030, 340, 200, { seed: 2 }));
        flip(ctx, p(T, K.grok, .55, eo5), 770, 1030, () => logoPlate(ctx, T, 'grok_w', 770, 1030, 400, 200, { seed: 3 }));
        arrow(ctx, 470, 1030, 560, 1030, { col: SBLUE, w: 12, a: p(T, K.grok - .2, .4) });
        pill(ctx, 520, 1150, 'CHATBOT', { bg: 'rgba(255,255,255,.1)', size: 22, h: 46, stroke: 'rgba(255,255,255,.4)', a: p(T, K.grok + .1, .4) });
        const dk = p(T, K.data, .8, eo5), py = lerp(2300, 1780, dk);
        planet(ctx, T, 540, py, 560, { a: dk });
        const ang = -1.2 + T * .25, sx = 540 + Math.cos(ang) * 640, sy = py + Math.sin(ang) * 640;
        live(ctx, T, sx, sy, { yaw: .1, bob: 4, seed: 4 }, () => dcSat(ctx, T, lerp(540, sx, dk), lerp(1450, sy, dk) - 0, .8, { rot: ang + Math.PI / 2 }));
        tag(ctx, 540, 1400, 'AI DATA CENTERS IN SPACE', p(T, K.data + .25, .5), 540, 1500, { rgb: AI_RGB });
      }, { cy: 1250 });
    });
  }

  // 7 TERAFAB: a chip wafer feeding both companies
  { const K = { fab: c('terafab', A.chips), chips: c('chips', A.chips), both: c('for both', A.chips) };
    sfx.push({ t: K.fab, k: 'swoosh', g: -17 });
    add(A.chips, (ctx, T) => {
      space(ctx, T, { gy: 1100, tint: '120,60,200' });
      shot(ctx, T, A.chips, () => {
        const wa = p(T, A.chips + .05, .7, eo5), cx = 540, cy = 1030, R = 290;
        flip(ctx, wa, cx, cy, () => live(ctx, T, cx, cy, { yaw: .12, bob: 6, spin: .03, seed: 1 }, () => {
          glowDot(ctx, cx, cy, 480, '150,90,255', .7); ctx.save(); ctx.translate(cx, cy); ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); const g = ctx.createRadialGradient(-R * .3, -R * .3, 10, 0, 0, R); g.addColorStop(0, '#c9bfe8'); g.addColorStop(1, '#4a3d7a'); ctx.fillStyle = g; ctx.fill(); ctx.clip();
          for (let i = -8; i <= 8; i++) for (let j = -8; j <= 8; j++) { const x = i * 36, y = j * 36; if (Math.hypot(x, y) > R - 14) continue; const lit = hash(i * 31 + j, 5 + Math.floor(T * 2)) > .6; ctx.fillStyle = lit ? `rgba(${AI_RGB},.85)` : 'rgba(20,16,50,.6)'; ctx.fillRect(x - 15, y - 15, 30, 30); }
          const ly = ((T * .5) % 1.2 - .1) * R * 2 - R; ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-R, ly, R * 2, 6); ctx.restore(); ctx.strokeStyle = 'rgba(220,210,255,.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); }));
        stamp(ctx, p(T, K.fab, .5), 540, 1030, 'TERAFAB', { col: '#fff', bg: 'rgba(40,20,110,.92)', size: 96, rot: -.05 });
        // two output streams of chips
        const sa = p(T, K.chips - .1, .4);
        [[200, 1560, 'tesla_w', TRED_RGB], [880, 1560, 'spacex_w', SBLUE_RGB]].forEach(([x, y, nm, rgb], j) => {
          glowDot(ctx, x, y, 200, rgb, .55 * sa); if (nm === 'tesla_w') teslaT(ctx, x, y, 110, nm, sa); else lg(ctx, nm, x, y, 250, sa);
          for (let k = 0; k < 3; k++) { const u = (T * .6 + k / 3 + j * .15) % 1, e = eio(u), px = lerp(540, x, e), py = lerp(1280, y - 70, e) + Math.sin(u * Math.PI) * -120; chip(ctx, T, px, py, 54 * (1 - .3 * u), { label: '', glow: .4, pins: 3, a: sa * Math.sin(u * Math.PI) }); } });
        pill(ctx, 540, 1700, 'CHIPS FOR BOTH', { bg: '#6a4ae0', size: 34, h: 72, a: p(T, K.both, .45, eback) });
      }, { cy: 1250 });
      title(ctx, p(T, A.chips + .05, .45), 'ONE GIANT CHIP FACTORY', '', { y: 640, size: 64 });
    });
  }

  // 8 HOW DO YOU MERGE TWO COMPANIES THIS BIG? two blocks collide
  { const K = { merge: c('merge', A.merge) };
    sfx.push({ t: K.merge, k: 'glitch', g: -16 });
    add(A.merge, (ctx, T) => {
      space(ctx, T, { gy: 1200, tint: '90,50,160' });
      shot(ctx, T, A.merge, () => {
        const m = p(T, K.merge - .15, .5, eio), sh = (1 - m) * 0 + Math.max(0, 1 - Math.abs(T - K.merge) / .25) * 8 * Math.sin(T * 90);
        const lx = lerp(230, 410, m) + sh, rx = lerp(850, 670, m) - sh, y = 1250;
        live(ctx, T, lx, y, { yaw: .05, bob: 6, seed: 1 }, () => { ctx.save(); ctx.shadowColor = `rgba(${TRED_RGB},.6)`; ctx.shadowBlur = 50; rr(ctx, lx - 190, y - 190, 380, 380, 50); const g = ctx.createLinearGradient(0, y - 190, 0, y + 190); g.addColorStop(0, '#ff4a5c'); g.addColorStop(1, '#8c0c1f'); ctx.fillStyle = g; ctx.fill(); ctx.restore(); teslaT(ctx, lx, y - 10, 190, 'tesla_w'); txt(ctx, 'TESLA', lx, y + 150, 36, '#fff', 900); });
        live(ctx, T, rx, y, { yaw: .05, bob: 6, seed: 2 }, () => { ctx.save(); ctx.shadowColor = `rgba(${SBLUE_RGB},.5)`; ctx.shadowBlur = 50; rr(ctx, rx - 190, y - 190, 380, 380, 50); const g = ctx.createLinearGradient(0, y - 190, 0, y + 190); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#aab6cc'); ctx.fillStyle = g; ctx.fill(); ctx.restore(); lg(ctx, 'spacex', rx, y - 10, 300); txt(ctx, 'SPACEX', rx, y + 150, 36, '#14203a', 900); });
        const ba = clamp(1 - Math.abs(T - K.merge) / .5); if (ba > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const a = i * .45 + 1, r = (T - K.merge + .2) * 600 * (.5 + hash(i, 3)); glowDot(ctx, 540 + Math.cos(a) * r, y + Math.sin(a) * r, 24, GOLD_RGB, ba); } ctx.restore(); }
        pop(ctx, p(T, K.merge + .15, .5, eback), 540, 900, () => live(ctx, T, 540, 900, { yaw: .1, bob: 6, seed: 3 }, () => { ctx.save(); ctx.shadowColor = `rgba(${GOLD_RGB},.8)`; ctx.shadowBlur = 40; txt(ctx, '?', 540, 1000, 300, '#fff', 900); ctx.restore(); }));
      }, { cy: 1250 });
      title(ctx, p(T, A.merge + .05, .45), 'TWO HUGE COMPANIES', '', { y: 640, size: 74 });
    });
  }

  // 9 NOT CASH, SHARES
  { const K = { cash: c('cash', A.pay), sh: c('shares', A.pay) };
    add(A.pay, (ctx, T) => {
      space(ctx, T, { gy: 1200, tint: '30,110,90' });
      shot(ctx, T, A.pay, () => {
        const out = p(T, K.sh - .1, .5, eio), ca = p(T, A.pay + .05, .45, eback);
        ctx.save(); ctx.translate(-out * 1300, 0); [0, 1, 2].forEach(i => live(ctx, T, 540, 1150, { yaw: .05, bob: 6, seed: i }, () => cashStack(ctx, T, 270 + i * 270, 1330 + 40 * Math.sin(T * 2 + i), 330, 7, { a: ca })));
        const xa = p(T, K.cash, .45); if (xa > 0) { ctx.save(); ctx.globalAlpha *= xa; ctx.strokeStyle = '#ff3b4a'; ctx.lineWidth = 28; ctx.lineCap = 'round'; ctx.shadowColor = '#ff3b4a'; ctx.shadowBlur = 40; const d = xa * 220; ctx.beginPath(); ctx.moveTo(540 - d, 1000 - d); ctx.lineTo(540 + d, 1000 + d); ctx.moveTo(540 + d, 1000 - d); ctx.lineTo(540 - d, 1000 + d); ctx.stroke(); ctx.restore(); }
        ctx.restore();
        const sa = p(T, K.sh, .7, eo5); ctx.save(); ctx.translate((1 - sa) * 1200, 0);
        live(ctx, T, 540, 1150, { yaw: .05, bob: 6, seed: 4 }, () => { shareCard(ctx, T, 330, 1050, 440, 't', { rot: -.08 }); shareCard(ctx, T, 760, 1120, 440, 's', { rot: .07 }); check(ctx, 540, 1300, 60, p(T, K.sh + .3, .4), '#30c060'); });
        ctx.restore();
      }, { cy: 1250 });
      title(ctx, p(T, K.cash - .05, .4) * (1 - p(T, K.sh - .15, .3)), 'NO CASH', '', { y: 640, size: 90, col: '#ff6b78' });
      title(ctx, p(T, K.sh, .45), 'PAY WITH SHARES', '', { y: 640, size: 80 });
    });
  }

  // 10 ONE TESLA SHARE = $386, ONE SPACEX SHARE = $159
  { const K = { t: c('tesla', A.say), a: c('386', A.say), s: c('spacex', A.say), b: c('159', A.say) };
    sfx.push({ t: K.a, k: 'shimmer', g: -17 });
    add(A.say, (ctx, T) => {
      paperBg(ctx, T);
      shot(ctx, T, A.say, () => {
        flip(ctx, p(T, K.t - .2, .6, eo5), 540, 990, () => live(ctx, T, 540, 990, { yaw: .1, bob: 6, seed: 1 }, () => shareCard(ctx, T, 540, 990, 600, 't')));
        const va = eo((T - K.a) / .6); priceTag(ctx, 540, 1230, Math.round(386 * va), { a: p(T, K.a - .1, .3), size: 64 });
        flip(ctx, p(T, K.s - .2, .6, eo5), 540, 1500, () => live(ctx, T, 540, 1500, { yaw: .1, bob: 6, seed: 2 }, () => shareCard(ctx, T, 540, 1500, 600, 's')));
        const vb = eo((T - K.b) / .6); priceTag(ctx, 540, 1740, Math.round(159 * vb), { a: p(T, K.b - .1, .3), size: 64, bg: '#2f7bff' });
        pill(ctx, 910, 990, '1 SHARE', { bg: '#14203a', size: 26, h: 58, a: p(T, A.say + .3, .4) }); pill(ctx, 910, 1500, '1 SHARE', { bg: '#14203a', size: 26, h: 58, a: p(T, K.s, .4) });
      }, { cy: 1300 });
      title(ctx, p(T, A.say + .05, .45), 'ONE SHARE EACH', '', { y: 640, size: 78, col: '#101a36' });
    }, true);
  }

  // 11 IN THE MERGER: Tesla share -> machine -> 2.5 SpaceX shares
  { const K = { t: c('tesla', A.merger), two: c('two and a half', A.merger), sh: c('spacex shares', A.merger) };
    sfx.push({ t: K.two - .1, k: 'gear', g: -14 });
    add(A.merger, (ctx, T) => {
      space(ctx, T, { gy: 1200, tint: '60,70,180' });
      shot(ctx, T, A.merger, () => {
        const mx = 540, my = 1180; const mk = p(T, A.merger + .05, .6, eo5);
        flip(ctx, mk, mx, my, () => live(ctx, T, mx, my, { yaw: .04, bob: 5, seed: 1 }, () => {
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; rr(ctx, mx - 190, my - 160, 380, 320, 40); const g = ctx.createLinearGradient(0, my - 160, 0, my + 160); g.addColorStop(0, '#39425f'); g.addColorStop(1, '#171c30'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
          ctx.strokeStyle = 'rgba(160,190,255,.5)'; ctx.lineWidth = 3; rr(ctx, mx - 190, my - 160, 380, 320, 40); ctx.stroke();
          const r = T * 1.1; gear(ctx, mx - 70, my - 20, 80, 12, r, '#d8a93a'); gear(ctx, mx + 70, my + 30, 62, 10, -r * 1.3 + .3, '#c0c7d6'); gear(ctx, mx + 10, my - 90, 40, 8, r * 1.9, '#f0cf6a');
          txt(ctx, 'SHARE SWAP', mx, my + 135, 28, `rgba(${GOLD_RGB},.95)`, 800, 'center', MONO); }));
        const tk = p(T, K.t - .1, .7, eio); if (tk < 1) shareCard(ctx, T, lerp(-120, 330, eo(tk > 0 ? tk : 0)) - tk * 0, lerp(1000, 1180, tk) - 90 * (1 - tk), 330, 't', { a: clamp(1.8 - tk * 1.2), rot: -.12 * (1 - tk) });
        const oa = p(T, K.two, .7, eo5);
        [0, 1, 2].forEach(i => { const sx = 830 + (i === 2 ? 20 : 0), sy = 1010 + i * 150; flip(ctx, clamp(oa * 1.5 - i * .25), sx, sy, () => live(ctx, T, sx, sy, { yaw: .06, bob: 4, seed: 3 + i }, () => shareCard(ctx, T, i === 2 ? sx - 75 : sx, sy, 300, 's', { half: i === 2 ? .5 : 1, tagTxt: i === 2 ? '½' : '1 SHARE' }))); });
        const ra = p(T, K.two, .5, eback); pop(ctx, ra, 540, 760, () => { ctx.save(); ctx.shadowColor = `rgba(${GOLD_RGB},.8)`; ctx.shadowBlur = 36; txt(ctx, '1 TESLA = 2½ SPACEX', 540, 780, 64, '#fff', 900); ctx.restore(); });
      }, { cy: 1250 });
    });
  }

  // 12 CALLED A SHARE SWAP
  { const K = { sw: c('swap', A.swap) };
    sfx.push({ t: A.swap + .15, k: 'success', g: -15 });
    add(A.swap, (ctx, T) => {
      space(ctx, T, { gy: 1200, tint: '30,120,170' });
      shot(ctx, T, A.swap, () => {
        [0, 1].forEach(i => { const a = T * 1.4 * (i ? -1 : 1) + i * Math.PI; ctx.save(); ctx.translate(540, 1150); ctx.rotate(a); ctx.strokeStyle = i ? SBLUE : '#ff6b78'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(0, 0, 250, 0, Math.PI * .8); ctx.stroke(); const ex = Math.cos(Math.PI * .8) * 250, ey = Math.sin(Math.PI * .8) * 250; ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.moveTo(ex - 40, ey + 20); ctx.lineTo(ex + 20, ey + 60); ctx.lineTo(ex + 40, ey - 20); ctx.fill(); ctx.restore(); });
        live(ctx, T, 540, 1150, { yaw: .1, bob: 4, seed: 1 }, () => { teslaT(ctx, 440, 1150, 90, 'tesla_w'); lg(ctx, 'spacex_w', 650, 1150, 170); });
        stamp(ctx, p(T, K.sw - .1, .5), 540, 1500, 'SHARE SWAP', { col: GOLDC, size: 84, rot: -.05 });
      }, { cy: 1250 });
    });
  }

  // 13 BONUS ON TOP
  { const K = { own: c('owners', A.bonus), bonus: c('bonus', A.bonus) };
    sfx.push({ t: K.bonus, k: 'shimmer', g: -16 });
    add(A.bonus, (ctx, T) => {
      space(ctx, T, { gy: 1250, tint: '160,110,30' });
      shot(ctx, T, A.bonus, () => {
        const pa = p(T, K.own - .1, .6, eo5);
        flip(ctx, pa, 200, 1500, () => live(ctx, T, 200, 1500, { yaw: .05, bob: 0, seed: 1 }, () => person(ctx, T, 220, 1700, .95, { suit: '#7a1426', tie: '#fff', face: 1, seed: 2 })));
        live(ctx, T, 650, 1250, { yaw: .08, bob: 6, seed: 3 }, () => shareCard(ctx, T, 650, 1330, 540, 't', { a: p(T, A.bonus + .05, .5, eo5) }));
        const bk = p(T, K.bonus, .6, eback), fall = lerp(-500, 0, eo(bk)); // gift box lands on the card
        pop(ctx, clamp(bk * 2), 650, 1020, () => live(ctx, T, 650, 1020, { yaw: .1, bob: 5, seed: 4 }, () => {
          ctx.save(); ctx.translate(650, 1020 + fall * .2); ctx.shadowColor = `rgba(${GOLD_RGB},.7)`; ctx.shadowBlur = 40; rr(ctx, -130, -90, 260, 180, 20); const g = ctx.createLinearGradient(-130, 0, 130, 0); g.addColorStop(0, '#e0a30f'); g.addColorStop(.5, '#ffd95a'); g.addColorStop(1, '#c58b0a'); ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0;
          ctx.fillStyle = '#e8321c'; ctx.fillRect(-20, -90, 40, 180); ctx.fillRect(-130, -14, 260, 28); ctx.save(); ctx.translate(0, -96); ctx.rotate(Math.sin(T * 3) * .05); ctx.beginPath(); ctx.ellipse(-46, -26, 44, 30, -.5, 0, 7); ctx.ellipse(46, -26, 44, 30, .5, 0, 7); ctx.fill(); ctx.restore(); ctx.restore(); }));
        for (let i = 0; i < 8; i++) { const u = clamp((T - K.bonus - .15) / 1.3); if (u <= 0 || u >= 1) continue; const a = -Math.PI / 2 + (i - 3.5) * .3; coin(ctx, T, 650 + Math.cos(a) * 340 * eo(u), 960 + Math.sin(a) * 420 * eo(u) + 380 * u * u, 34, { a: 1 - u * u, spin: 1.5 }); }
        pill(ctx, 650, 1620, '+ BONUS ON TOP', { bg: GOLDC, fg: '#2a1c00', size: 38, h: 82, a: p(T, K.bonus + .2, .45, eback) });
      }, { cy: 1250 });
      title(ctx, p(T, A.bonus + .05, .45), 'TESLA OWNERS WANT MORE', '', { y: 640, size: 64 });
    });
  }

  // 14 BANKS: 20-35% premium, hundreds of billions
  { const K = { b: A.banks + .1, a: c('20', A.banks), z: c('35', A.banks), h: c('hundreds', A.banks), d: c('dollars', A.banks) };
    sfx.push({ t: K.h, k: 'sweep', g: -17 });
    add(A.banks, (ctx, T) => {
      space(ctx, T, { gy: 1100, tint: '40,80,170' });
      shot(ctx, T, A.banks, () => {
        [['barclays', 'BARCLAYS', 330], ['jpm', 'J.P. MORGAN', 400], ['rbc', 'RBC', 340]].forEach(([nm, lb, w], i) => { const k = p(T, A.banks + .05 + .2 * i, .6, eo5), x = 540, y = 800 + i * 170, dir = i % 2 ? 1 : -1;
          ctx.save(); ctx.translate(dir * (1 - k) * 700, 0); ctx.globalAlpha *= clamp(k * 2); live(ctx, T, x, y, { yaw: .05, bob: 4, seed: i }, () => { panel(ctx, 90, y - 66, 900, 132, 28, { light: true }); logo(ctx, nm, 540, y, nm === 'barclays' ? 150 : nm === 'jpm' ? 330 : 250, 1); }); ctx.restore(); });
        // 20% - 35% slider
        const ty = 1340, x0 = 120, x1 = 960, f = v => x0 + (x1 - x0) * v / 50, ka = p(T, K.a, .4), kb = p(T, K.z, .4);
        rr(ctx, x0, ty - 12, x1 - x0, 24, 12); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fill();
        if (ka > 0) { rr(ctx, f(20), ty - 12, (f(35) - f(20)) * kb + 1, 24, 12); ctx.fillStyle = GOLDC; ctx.shadowColor = GOLDC; ctx.shadowBlur = 24; ctx.fill(); ctx.shadowBlur = 0; }
        if (ka > 0) pop(ctx, ka, f(20), ty, () => pill(ctx, f(20), ty - 56, '20%', { bg: '#fff', fg: '#14203a', size: 32, h: 64 }));
        if (kb > 0) pop(ctx, kb, f(35), ty, () => pill(ctx, f(35), ty + 56, '35%', { bg: GOLDC, fg: '#2a1c00', size: 32, h: 64 }));
        txt(ctx, 'BONUS', 120, ty - 56, 24, 'rgba(255,255,255,.55)', 800, 'left', MONO);
        const ha = p(T, K.h, .5, eback); pop(ctx, ha, 540, 1530, () => { ctx.save(); ctx.shadowColor = `rgba(${GOLD_RGB},.7)`; ctx.shadowBlur = 34; txt(ctx, 'HUNDREDS OF', 540, 1520, 62, '#fff', 900); txt(ctx, 'BILLIONS OF $', 540, 1594, 62, GOLDC, 900); ctx.restore(); });
        const n = Math.floor(10 * eo((T - K.d + .3) / 1)); [0, 1, 2].forEach(i => live(ctx, T, 300 + i * 240, 1740, { yaw: .05, bob: 5, seed: i }, () => cashStack(ctx, T, 300 + i * 240, 1790, 240, Math.max(1, Math.round(n * (i === 1 ? 1 : .7))), { a: p(T, K.h, .4) })));
      }, { cy: 1250 });
    });
  }

  // 15 MUSK RUNS BOTH: he negotiates with himself
  { const K = { m: c('musk', A.strange), b: c('both', A.strange), n: c('negotiating', A.strange), h: c('himself', A.strange) };
    sfx.push({ t: K.n, k: 'glitch', g: -17 });
    add(A.strange, (ctx, T) => {
      space(ctx, T, { gy: 1250, tint: '90,50,150' });
      shot(ctx, T, A.strange, () => {
        const ma = p(T, K.m - .1, .6, eo5);
        logoPlate(ctx, T, 'tesla_w', 230, 1000, 330, 200, { seed: 1, a: p(T, A.strange + .05, .5) }); logoPlate(ctx, T, 'spacex_w', 850, 1000, 330, 200, { seed: 2, a: p(T, A.strange + .1, .5) });
        flip(ctx, ma, 540, 1430, () => live(ctx, T, 540, 1430, { yaw: .06, bob: 0, seed: 3 }, () => person(ctx, T, 540, 1760, 1.35, { face: 1, seed: 1, bob: 1 })));
        tag(ctx, 540, 1800, 'ELON MUSK · CEO OF BOTH', p(T, K.m, .5), 540, 1740, { rgb: '255,255,255' });
        const ba = p(T, K.b, .5); [[300, 1100, 470, 1380], [780, 1100, 610, 1380]].forEach(([x0, y0, x1, y1], i) => { if (ba <= 0) return; ctx.save(); ctx.globalAlpha *= ba; ctx.strokeStyle = i ? SBLUE : '#ff6b78'; ctx.lineWidth = 6; ctx.setLineDash([16, 14]); ctx.lineDashOffset = -T * 40 * (i ? -1 : 1); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + (i ? -1 : 1) * 40, y1 - 60, x1, y1); ctx.stroke(); ctx.restore(); });
        const na = p(T, K.n, .5, eback);
        if (na > 0) { bubble(ctx, 250, 1190, 300, 100, 290, { a: na }); txt(ctx, 'More!', 250, 1210, 44, '#14203a', 900); bubble(ctx, 830, 1190, 300, 100, 790, { a: na, fill: '#e8f0ff' }); txt(ctx, 'No, more!', 830, 1210, 44, '#14203a', 900); }
        const ha = p(T, K.h, .6, eback); if (ha > 0) { ctx.save(); ctx.translate(540, 1480); ctx.globalAlpha *= clamp(ha); ctx.rotate(T * 1.6); ctx.strokeStyle = GOLDC; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.shadowColor = GOLDC; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(0, 0, 330, 0, Math.PI * 1.55 * ha); ctx.stroke(); ctx.restore(); }
        stamp(ctx, ha, 540, 800, 'HIM VS. HIM', { col: GOLDC, size: 78, rot: -.04 });
      }, { cy: 1300 });
      title(ctx, p(T, A.strange + .05, .45) * (1 - p(T, K.h - .1, .3)), 'ONE MAN, BOTH SIDES', '', { y: 640, size: 66 });
    });
  }

  // 16 NOT ALLOWED IN THE TALKS
  { const K = { al: c('allowed', A.talks) };
    sfx.push({ t: K.al, k: 'shatter', g: -16 });
    add(A.talks, (ctx, T) => {
      space(ctx, T, { gy: 1200, tint: '140,30,50' });
      shot(ctx, T, A.talks, () => {
        glassRoom(ctx, T, 60, 760, 700, 660, { a: p(T, A.talks, .4) });
        [0, 1, 2].forEach(i => { person(ctx, T, 190 + i * 160, 1290, .5, { suit: i % 2 ? '#7a1426' : '#e4e8f0', shirt: i % 2 ? '#fff' : '#2a64d6', skin: ['#e9b894', '#c98f6a', '#f0c8a8'][i], hair: '#222', seed: i, bob: 1 }); });
        table(ctx, 410, 1280, 560, 60);
        const mk = p(T, A.talks + .05, .6, eo5), sx = lerp(1250, 880, mk);
        live(ctx, T, sx, 1500, { yaw: .05, bob: 0, seed: 1 }, () => person(ctx, T, sx, 1600, 1.0, { face: 0, seed: 3, walk: 1 - mk }));
        const ka = p(T, K.al, .5, eback); if (ka > 0) pop(ctx, ka, 700, 1100, () => { ctx.save(); ctx.translate(700, 1100); ctx.shadowColor = '#ff3b4a'; ctx.shadowBlur = 50; ctx.strokeStyle = '#ff3b4a'; ctx.lineWidth = 34; ctx.beginPath(); ctx.arc(0, 0, 150, 0, 7); ctx.moveTo(-106, 106); ctx.lineTo(106, -106); ctx.stroke(); ctx.fillStyle = 'rgba(255,59,74,.18)'; ctx.beginPath(); ctx.arc(0, 0, 150, 0, 7); ctx.fill(); ctx.restore(); });
        pill(ctx, 540, 1700, 'NOT ALLOWED IN THE TALKS', { bg: '#c0182e', size: 34, h: 78, a: p(T, K.al + .15, .45, eback) });
      }, { cy: 1250 });
    });
  }

  // 17 BARCLAYS: Musk still owns ~37% (light)
  { const K = { ow: c('owning', A.barc), n: c('37', A.barc), pc: c('percent', A.barc) };
    sfx.push({ t: K.ow, k: 'riser', g: -19 });
    add(A.barc, (ctx, T) => {
      paperBg(ctx, T);
      shot(ctx, T, A.barc, () => {
        flip(ctx, p(T, A.barc + .05, .6, eo5), 540, 830, () => live(ctx, T, 540, 830, { yaw: .06, bob: 5, seed: 1 }, () => { panel(ctx, 210, 740, 660, 180, 32, { light: true }); logo(ctx, 'barclays', 540, 830, 230, 1); }));
        txt(ctx, 'ESTIMATE', 540, 975, 26, '#6a7387', 800, 'center', MONO);
        const fr = .37 * eo((T - K.ow) / 1.5), shown = Math.round(fr * 100);
        live(ctx, T, 540, 1450, { yaw: .06, bob: 6, seed: 2 }, () => { pie(ctx, T, 540, 1480, 320, fr, { col: '#2f7bff' });
          const mid = -Math.PI / 2 + Math.PI * fr, px = 540 + Math.cos(mid) * 190, py = 1480 + Math.sin(mid) * 190 * .46 - 30; if (fr > .05) person(ctx, T, px, py + 70, .34, { face: 1, seed: 4, bob: 0 }); });
        bin(ctx, p(T, K.ow, .4), () => { ctx.save(); ctx.shadowColor = 'rgba(47,123,255,.4)'; ctx.shadowBlur = 40; txt(ctx, shown + '%', 540, 1190, 210, '#1d56d6', 900); ctx.restore(); });
        tag(ctx, 860, 1380, 'MUSK', p(T, K.n, .45), 740, 1470, { rgb: '47,123,255', light: true }); tag(ctx, 220, 1640, 'EVERYONE ELSE', p(T, K.pc, .45), 340, 1560, { rgb: '90,100,130', light: true });
      }, { cy: 1250 });
      title(ctx, p(T, A.barc + .05, .45), 'STILL OWNS ABOUT A THIRD', '', { y: 640, size: 60, col: '#101a36' });
    }, true);
  }

  // 18 NOTHING IS DECIDED
  { const K = { d: c('decided', A.nothing), sd: c('said', A.nothing), ov: c('overstating', A.nothing) };
    sfx.push({ t: K.d, k: 'shatter', g: -16 });
    add(A.nothing, (ctx, T) => {
      space(ctx, T, { gy: 1300, tint: '70,70,110' });
      shot(ctx, T, A.nothing, () => {
        flip(ctx, p(T, A.nothing + .05, .6, eo5), 540, 1330, () => live(ctx, T, 540, 1330, { yaw: .05, bob: 6, seed: 1 }, () => doc(ctx, T, 540, 1330, 560, { lines: 8 })));
        stamp(ctx, p(T, K.d, .45), 560, 1380, 'NOT DECIDED', { col: '#d3182b', bg: 'rgba(255,250,240,.35)', size: 84, rot: -.18 });
        const ba = p(T, K.sd, .5, eback); pop(ctx, ba, 540, 830, () => live(ctx, T, 540, 830, { yaw: .04, bob: 4, seed: 2 }, () => { bubble(ctx, 560, 840, 800, 190, 220, { a: 1 }); avatarBust(ctx, T, 150, 840, 56);
          txt(ctx, '"Calling it certain', 590, 815, 42, '#14203a', 800, 'center'); txt(ctx, 'would be overstating it."', 590, 872, 42, '#14203a', 800, 'center');
          const u = p(T, K.ov, .6); ctx.fillStyle = `rgba(${GOLD_RGB},.9)`; ctx.fillRect(440, 886, 300 * u, 8); }));
      }, { cy: 1250 });
    });
  }

  // 19 NOT REALLY A CAR COMPANY JOINING A ROCKET COMPANY
  { const K = { car: c('car', A.so), rk: c('rocket', A.so) }; K.x = K.rk + .5;
    sfx.push({ t: K.x, k: 'glitch', g: -17 });
    add(A.so, (ctx, T) => {
      space(ctx, T, { gy: 1250, tint: '50,70,160' });
      shot(ctx, T, A.so, () => {
        ground(ctx, 1560);
        live(ctx, T, 290, 1500, { yaw: .03, bob: 0, seed: 1 }, () => car(ctx, T, 290, 1560, .72, { glow: p(T, K.car, .5), spin: T * 5 }));
        live(ctx, T, 800, 1200, { yaw: .02, bob: 4, seed: 2 }, () => rocket(ctx, T, 800, 1560, .85, { flame: .2 + .5 * p(T, K.rk, .5), glow: p(T, K.rk, .5) }));
        pill(ctx, 290, 1660, 'CAR CO.', { bg: TRED, size: 32, h: 66, a: p(T, K.car, .4) }); pill(ctx, 800, 1660, 'ROCKET CO.', { bg: '#2c64d6', size: 32, h: 66, a: p(T, K.rk, .4) });
        const ja = p(T, K.car + .1, .6); arrow(ctx, 380, 1200, 560 * ja + 380 * (1 - ja), 1200, { col: 'rgba(255,255,255,.7)', w: 14, a: ja, glow: 0 }); arrow(ctx, 700, 1200, 520 * ja + 700 * (1 - ja), 1200, { col: 'rgba(255,255,255,.7)', w: 14, a: ja, glow: 0 });
        const xa = p(T, K.x, .4, eback); if (xa > 0) pop(ctx, xa, 540, 1050, () => { ctx.save(); ctx.translate(540, 1050); ctx.strokeStyle = '#ff3b4a'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.shadowColor = '#ff3b4a'; ctx.shadowBlur = 40; ctx.beginPath(); ctx.moveTo(-130, -130); ctx.lineTo(130, 130); ctx.moveTo(130, -130); ctx.lineTo(-130, 130); ctx.stroke(); ctx.restore(); });
      }, { cy: 1250 });
      title(ctx, p(T, A.so + .05, .45), "NOT JUST A CAR + A ROCKET", '', { y: 640, size: 64 });
    });
  }

  // 20 ONE AI COMPANY WITH A CAR AND A ROCKET
  { const K = { ai: c('ai', A.one), car: c('car', A.one), rk: c('rocket', A.one) };
    sfx.push({ t: K.ai, k: 'shimmer', g: -15 });
    add(A.one, (ctx, T) => {
      space(ctx, T, { gy: 1150, tint: '30,130,180' });
      shot(ctx, T, A.one, () => {
        const ca = p(T, K.ai, .6, eback), cx = 540, cy = 1190;
        ctx.save(); ctx.strokeStyle = 'rgba(160,220,255,.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, cy, 380, 150, -.2, 0, 7); ctx.stroke(); ctx.restore();
        pop(ctx, ca, cx, cy, () => live(ctx, T, cx, cy, { yaw: .1, bob: 5, spin: .08, seed: 1 }, () => chip(ctx, T, cx, cy, 340, { label: 'AI' })));
        const orb = (a, t0, fn) => { const k = p(T, t0, .5, eback); if (k <= 0) return; const ang = a + T * .9, x = cx + Math.cos(ang) * 380 * Math.cos(-.2) - Math.sin(ang) * 150 * Math.sin(-.2), y = cy + Math.cos(ang) * 380 * Math.sin(-.2) + Math.sin(ang) * 150 * Math.cos(-.2), z = Math.sin(ang);
          ctx.save(); ctx.globalAlpha *= clamp(k); fn(x, y, .8 + .25 * z * k, z); ctx.restore(); };
        orb(.4, K.car, (x, y, sc) => car(ctx, T, x, y + 60 * sc, .26 * sc, { shadow: 0, spin: T * 6 })); orb(Math.PI + .4, K.rk, (x, y, sc) => rocket(ctx, T, x, y + 100 * sc, .21 * sc, { flame: .6, rot: Math.sin(T) * .1 }));
        stamp(ctx, p(T, K.car + .3, .5), 540, 1660, 'ONE AI COMPANY', { col: AI, size: 72, rot: -.04 });
      }, { cy: 1250 });
    });
  }

  // 21 ENDING: the merger, written in code. Code types into merge.js while the Tesla and SpaceX cards slide together; "guide" is posted, the editor becomes a share certificate with the bio link.
  { const K = { crazy: c('crazy', A.crazy), code: c('code', A.crazy), comment: c('comment', A.crazy), guide: c('guide', A.crazy), yt: c('youtube', A.crazy), link: c('link', A.crazy), bio: c('bio', A.crazy) };
    const cta = Math.min(K.link, K.bio), post = K.guide + .45, tStart = A.crazy + .3, tEnd = K.code - .12;
    sfx.push({ t: A.crazy + .05, k: 'riser', g: -17 }, { t: K.code + .15, k: 'success', g: -14 }, { t: post, k: 'click', g: -11 }, { t: K.yt, k: 'swoosh', g: -16 }, { t: cta + .3, k: 'click', g: -10 });
    const CODE = [['import { code } from "video"', '#7fd8ff'], ['swap = tesla / spacex', '#ffb07a'], ['bonus = swap * 1.2', '#ffd479'], ['merge(tesla, spacex)', '#9ee6b0'], ['render("9:16")', '#c9bfff'], ['// 100% code', '#7a8597']];
    const nch = CODE.reduce((a, [l]) => a + l.length, 0);
    add(A.crazy, (ctx, T) => {
      space(ctx, T, { gy: 1100, tint: '40,70,180' });
      const sw = p(T, K.yt - .1, .7, eio), pr = clamp((T - tStart) / Math.max(.4, tEnd - tStart)); // sw: editor -> certificate
      shot(ctx, T, A.crazy, () => {
        const ex = 70, ey = 600, ew = 940, eh = 640, k = p(T, A.crazy, .6, eo5);
        flip(ctx, k, 540, ey + eh / 2, () => live(ctx, T, 540, ey + eh / 2, { yaw: .025, bob: 4, breathe: .003, seed: 4 }, () => {
          const cm = p(T, K.comment - .15, .45, eio);
          // window chrome
          card(ctx, ex, ey, ew, eh, { r: 30, fill: sw < .5 ? '#0f121b' : '#fbf6e8', dark: true, stroke: sw < .5 ? 'rgba(255,255,255,.14)' : 'rgba(150,120,40,.6)' });
          if (sw < 1) { ctx.save(); ctx.globalAlpha *= 1 - sw; ['#ff5f57', '#febc2e', '#28c840'].forEach((cc, i) => { ctx.fillStyle = cc; ctx.beginPath(); ctx.arc(ex + 38 + i * 28, ey + 36, 9, 0, 7); ctx.fill(); });
            txt(ctx, 'merge.js', ex + ew / 2, ey + 44, 26, '#cfd6e2', 700); txt(ctx, 'FRAME ' + String(Math.floor(T * 30)).padStart(4, '0'), ex + ew - 30, ey + 44, 22, AI, 700, 'right', MONO); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(ex, ey + 68, ew, 2);
            if (cm < 1) { ctx.save(); ctx.globalAlpha *= 1 - cm; let left = nch * pr;
              CODE.forEach(([l, col], i) => { if (left <= 0) return; const n = Math.min(l.length, Math.floor(left)); left -= l.length;
                txt(ctx, String(i + 1), ex + 36, ey + 140 + i * 64, 26, 'rgba(140,150,165,.6)', 600, 'left', MONO); txt(ctx, l.slice(0, n), ex + 84, ey + 140 + i * 64, 34, col, 600, 'left', MONO);
                if (n < l.length && Math.sin(T * 10) > 0) { ctx.fillStyle = '#fff'; ctx.fillRect(ex + 86 + tw(ctx, l.slice(0, n), 34, 600, MONO), ey + 112 + i * 64, 4, 38); } });
              ctx.restore(); }
            if (cm > 0) { ctx.save(); ctx.globalAlpha *= cm * (1 - sw); ctx.letterSpacing = '3px'; txt(ctx, 'COMMENTS', ex + 50, ey + 150, 26, 'rgba(220,226,236,.75)', 700, 'left', MONO); ctx.letterSpacing = '0px';
              rr(ctx, ex + 50, ey + 200, ew - 100, 100, 50); ctx.fillStyle = '#1b2029'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 2; ctx.stroke();
              const g2 = typed('guide', T, K.guide - .15, K.guide + .2); txt(ctx, g2 || 'Add a comment…', ex + 92, ey + 265, 44, g2 ? '#fff' : '#7a8290', g2 ? 800 : 500, 'left');
              if (T < post && g2 && Math.sin(T * 9) > 0) { ctx.fillStyle = '#fff'; ctx.fillRect(ex + 96 + tw(ctx, g2, 44, 800), ey + 228, 4, 44); }
              const ps = p(T, post, .4, eback); if (ps > 0) pop(ctx, ps, ex + ew / 2, ey + 420, () => pill(ctx, ex + ew / 2, ey + 420, 'guide  ✓ posted', { bg: GREEN, size: 36, h: 78 })); ctx.restore(); }
            ctx.restore(); }
          if (sw > 0) { ctx.save(); ctx.globalAlpha *= sw; // share certificate with the bio link
            ctx.strokeStyle = 'rgba(160,125,40,.85)'; ctx.lineWidth = 5; rr(ctx, ex + 20, ey + 20, ew - 40, eh - 40, 22); ctx.stroke(); ctx.lineWidth = 2; rr(ctx, ex + 34, ey + 34, ew - 68, eh - 68, 16); ctx.stroke();
            ctx.letterSpacing = '5px'; txt(ctx, 'SHARE CERTIFICATE', ex + ew / 2, ey + 100, 34, '#6b4e10', 800, 'center', (w, s2) => `${w} ${s2}px Georgia, serif`); ctx.letterSpacing = '0px';
            avatar(ctx, T, ex + 170, ey + 230, 76, named); if (named) txt(ctx, 'agentsoly', ex + 280, ey + 232, 60, '#2a2418', 900, 'left'); txt(ctx, 'Explainers built 100% in code', ex + 280, ey + (named ? 285 : 250), 30, '#6b6250', 600, 'left');
            pill(ctx, ex + 70, ey + 390, '▶ YouTube', { bg: '#e62117', size: 32, h: 72, align: 'left' }); pill(ctx, ex + 330, ey + 390, '♪ TikTok', { bg: '#15161b', size: 32, h: 72, align: 'left' });
            const hl = p(T, cta + .3, .35); rr(ctx, ex + 50, ey + 470, ew - 100, 96, 20); ctx.fillStyle = `rgba(47,123,255,${.12 + .3 * hl})`; ctx.fill(); ctx.strokeStyle = `rgba(47,123,255,${.4 + .6 * hl})`; ctx.lineWidth = 3; ctx.stroke();
            txt(ctx, '🔗  Link in bio · full guide', ex + 90, ey + 532, 40, '#1d3f9a', 800, 'left'); ctx.restore(); }
        }));
        // two share cards slide together as the code runs, then merge into one
        const my = 1500, mg = p(T, tEnd, .4, eback), lx = lerp(250, 450, eio(pr)), rx = lerp(830, 630, eio(pr));
        if (mg < .05) { live(ctx, T, lx, my, { yaw: .06, bob: 5, seed: 1 }, () => shareCard(ctx, T, lx, my, 380, 't', { a: p(T, A.crazy + .1, .5) })); live(ctx, T, rx, my, { yaw: .06, bob: 5, seed: 2 }, () => shareCard(ctx, T, rx, my, 380, 's', { a: p(T, A.crazy + .15, .5) })); }
        else pop(ctx, mg, 540, my, () => live(ctx, T, 540, my, { yaw: .08, bob: 5, seed: 3 }, () => {
          ctx.save(); ctx.translate(540, my); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16; rr(ctx, -290, -178, 580, 356, 28); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
          ctx.save(); rr(ctx, -290, -178, 580, 356, 28); ctx.clip(); let g = ctx.createLinearGradient(-290, -178, 0, 178); g.addColorStop(0, '#ff4a5c'); g.addColorStop(1, '#a30d22'); ctx.fillStyle = g; ctx.fillRect(-290, -178, 290, 356);
          g = ctx.createLinearGradient(0, -178, 290, 178); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#bcc6d6'); ctx.fillStyle = g; ctx.fillRect(0, -178, 290, 356); ctx.restore();
          teslaT(ctx, -145, -10, 120, 'tesla_w'); lg(ctx, 'spacex', 145, -10, 230); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 8; txt(ctx, 'ONE COMPANY', 0, 135, 36, '#fff', 900); ctx.restore(); }));
        const bw = 520; bar(ctx, 190, 1740, bw, 20, pr, pr >= 1 ? GREEN : AI, 'rgba(255,255,255,.1)');
        txt(ctx, pr >= 1 ? '100% CODE ✓' : Math.floor(pr * 100) + '%', 920, 1758, 30, pr >= 1 ? MINT : '#fff', 800, 'right', MONO);
        const st = p(T, K.code, .5, eback) * (1 - p(T, K.comment - .2, .3)); stamp(ctx, st, 540, 1310, 'MADE WITH CODE', { col: MINT, size: 60, rot: -.05 });
        // cursor posts the comment, then taps the bio link
        if (T > K.guide - .4 && T < post + .7) { const cx = kf(T, [[K.guide - .4, 900], [post - .05, 540]]), cy = kf(T, [[K.guide - .4, 1500], [post - .05, 1020]]); cursor(ctx, cx, cy, clamp(1 - Math.abs(T - post) / .12), clamp((post + .7 - T) / .3)); clickRing(ctx, 540, 1020, (T - post) / .5); }
        const ly = 600 + 532 - 40; if (T > cta - .4) { const cx = kf(T, [[cta - .4, 900], [cta + .25, 700]]), cy = kf(T, [[cta - .4, 1500], [cta + .25, ly]]); cursor(ctx, cx, cy, clamp(1 - Math.abs(T - cta - .3) / .1)); clickRing(ctx, 700, ly, (T - cta - .3) / .5); }
      }, { cy: 1150, push: .03 });
    });
  }

  list.forEach((sc, i) => sc.end = list[i + 1] ? list[i + 1].start : 1e9);
  // sound hygiene: whoosh-type cues are free; any other small hit must sit >= 1.5 s from the previous one
  const FREE = new Set(['whoosh', 'swoosh', 'sweep', 'riser']), out = []; let last = -9;
  for (const q of sfx.filter(q => !['pop', 'drip', 'kw', 'tick', 'type'].includes(q.k)).sort((a, b) => a.t - b.t)) {
    if (FREE.has(q.k)) { out.push(q); continue; } if (q.t - last < 1.5) continue; out.push(q); last = q.t; }
  return { scenes: list, sfx: out };
}
