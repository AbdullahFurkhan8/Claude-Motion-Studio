// "Why put AI data centers in space?" explainer. All timing comes from word cues c('phrase', after); drawn in code (dc.js + kit.js).
// User assets: Earth globe, NVIDIA rack photo, Google and SpaceX wordmarks (keyed out in src/assets). No presenter.
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, hash, rr, alive, flipIn } from './lib.js';
import { FONT, MONO, GREEN, RED, txt, tw, bin, pop, card, cursor, clickRing, pill, avatar, glowDot, bar, logo } from './kit.js';
import { HOT, HOT_RGB, COLD_RGB, SUN_RGB, AI_RGB, MINT, MINT_RGB, space, tag, stamp, title, panel, arrow, earth, sun, solar, chipSq, sat, wisps, irRings, rays, board, flame, logs, hand,
  thermo, stopwatch, gauge, rack, serverRack, iss, cloud, crossOut, money } from './dc.js';

export const IMAGES = ['globe.png', 'rack.png', 'google.png', 'spacex_w.png'];
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
const lowEarth = (ctx, T, a = 1) => earth(ctx, T, 540, 2170, 730, { a, spin: .02 }); // Earth horizon, top edge at y = 1440
const gPlate = (ctx, T, x, y, w, k, seed = 0) => flip(ctx, k, x, y, () => live(ctx, T, x, y, { yaw: .06, bob: 5, breathe: .01, seed }, () => { panel(ctx, x - w / 2, y - w * .22, w, w * .44, 26, { light: true }); logo(ctx, 'google', x, y, w * .68); }));
const dashCircle = (ctx, T, x, y, r, a = 1, col = '255,255,255') => { ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = `rgba(${col},.6)`; ctx.lineWidth = 3; ctx.setLineDash([14, 16]); ctx.lineDashOffset = -T * 20; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.restore(); };
const pillBox = (ctx, x, y, s, a, rgb = '255,205,90', size = 34, w2) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.font = FONT(900, size); ctx.letterSpacing = '3px'; const w = w2 || ctx.measureText(s).width + 64; rr(ctx, x - w / 2, y - size, w, size * 2, size); ctx.fillStyle = 'rgba(10,12,18,.9)'; ctx.fill(); ctx.strokeStyle = `rgb(${rgb})`; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = `rgb(${rgb})`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 2, y + 3); ctx.restore(); };
const mmss = s => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const timerPill = (ctx, x, y, secs, a, hot = 0) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); rr(ctx, x - 230, y - 90, 460, 180, 36); ctx.fillStyle = 'rgba(8,10,16,.88)'; ctx.fill(); ctx.strokeStyle = hot > .5 ? HOT : 'rgba(255,255,255,.35)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.save(); if (hot > .5) { ctx.shadowColor = HOT; ctx.shadowBlur = 24; } txt(ctx, mmss(secs), x, y + 24, 110, hot > .5 ? '#ff8f78' : '#fff', 900, 'center', MONO); ctx.restore(); ctx.letterSpacing = '4px'; txt(ctx, 'MAX RUN TIME', x, y + 66, 22, 'rgba(220,226,236,.75)', 700, 'center', MONO); ctx.restore(); };
const neural = (ctx, T, x, y, w, h, a = 1, col = AI_RGB) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; const L = [3, 5, 5, 2], pts = L.map((n, i) => Array.from({ length: n }, (_, j) => [x - w / 2 + w * i / (L.length - 1), y - h / 2 + h * (j + .5) / n]));
  ctx.lineWidth = 1.8; pts.forEach((col0, i) => i && col0.forEach(b => pts[i - 1].forEach(a0 => { ctx.strokeStyle = `rgba(${col},.28)`; ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); })));
  pts.flat().forEach((q, i) => { const g = .5 + .5 * Math.sin(T * 5 - q[0] * .03 + i); glowDot(ctx, q[0], q[1], 26, col, g * .8); ctx.fillStyle = `rgba(${col},${.5 + .5 * g})`; ctx.beginPath(); ctx.arc(q[0], q[1], 8, 0, 7); ctx.fill(); }); ctx.restore(); };
const miniSat = (ctx, T, x, y, s, rot = 0, lit = 1) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); [-1, 1].forEach(d => { ctx.fillStyle = '#1d3a98'; ctx.fillRect(d > 0 ? 34 : -154, -22, 120, 44); ctx.strokeStyle = 'rgba(180,210,255,.6)'; ctx.lineWidth = 3; ctx.strokeRect(d > 0 ? 34 : -154, -22, 120, 44); });
  ctx.fillStyle = '#d8dde7'; rr(ctx, -34, -34, 68, 68, 8); ctx.fill(); ctx.fillStyle = `rgba(${AI_RGB},${.5 + .5 * lit})`; ctx.fillRect(-20, -20, 40, 22); ctx.restore(); };

export const KEYWORDS = 'cold google ai chips 15 heat fan air chip light infrared campfire slow broken shut radiators nvidia rack space station data centers eight sunlight night clouds spacex million heavy 3600 ten 2030s expensive shakespeare starcloud orbit land water power code guide bio';
export const EMOJI = { cold: '🥶', heat: '🔥', campfire: '🔥', sunlight: '☀', code: '💻', guide: '💬', bio: '🔗', spacex: '🚀', fan: '🌀' };
export const CAPTION_SFX = false;
// Hinglish voice: same scenes, cues mapped to the words it says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      'freezing cold': 'thanda', four: 'chaar', '15': '15', 'at a time': 'chal', 'because of': 'garmi ki', 'how does that': 'kaise', 'make sense': 'possible', heat: 'garmi|wajah',
      'on earth': 'dharti par', fan: 'fan', 'blows air': 'hawa', "laptop's chip": 'laptop', 'carries the heat': 'aur garmi',
      'in space': 'space mein hawa', 'no air': 'hawa hai', 'nothing can': 'to garmi', away: 'koi',
      'the only way': 'baahar nikalne', 'only way': 'ek hi', light: 'roshni',
      'everything warm': 'har garm', warm: 'garm', invisible: 'invisible', infrared: 'infrared',
      "it's the heat": 'wahi garmi', campfire: 'alaav', touching: 'chhue',
      "but that's a very slow": 'lekin garmi khone', 'very slow': 'dheema', 'lose heat': 'khone',
      'so in space': 'to space mein', 'ai chip': 'ai chip', laptop: 'laptop', 'broken fan': 'fan toota',
      'the heat keeps building': 'garmi badhti', 'shut down': 'band', 'keeps building': 'rehti',
      "that's why a satellite": 'isliye satellite', satellite: 'satellite', 'big panels': 'bade panels', radiators: 'radiators', glow: 'chhod', dark: 'andhere',
      'and one nvidia': 'aur ek nvidia', nvidia: 'nvidia', rack: 'rack', 'so much heat': 'itni garmi',
      even: 'ki space', "space station's": 'space station', 'cooling system': 'cooling system', "couldn't handle": 'sambhal',
      'so why put': 'to data', 'data centers': 'data centers', 'in space at': 'space mein',
      'in the right orbit': 'sahi orbit', 'right orbit': 'sahi orbit', 'solar panel': 'solar panel', 'eight times': 'aath', 'than on earth': 'dharti se',
      'up there': 'wahan panel', almost: 'lagbhag', sunlight: 'dhoop', 'no night': 'na raat', clouds: 'baadal', 'air in the way': 'beech mein',
      "that's why spacex": 'isliye spacex', spacex: 'spacex', 'one million': '10 lakh', satellites: 'satellite',
      'but radiators': 'lekin radiators', heavy: 'bhaari',
      'and right now': 'aur abhi sirf', 'right now': 'abhi', 'one kilo': 'ek kilo', costs: 'kharcha', '3600': '3600',
      "google's math": 'google ke hisaab', "google's": 'google', 'ten times|10 times': '10 guna', compete: 'competition', mid2030s: '2030',
      "google's own": 'google ke apne', 'project lead': 'project lead', "doesn't expect": 'nahin lagta', 'beat earth': 'dharti ko', 'five years': '5 saal',
      "but it's already": 'lekin ye abhi', happening: 'ye abhi', 'last year': 'pichhle saal', starcloud: 'star cloud', 'small ai': 'chhote', shakespeare: 'shakespeare', orbit: 'orbit',
      'so for now': 'to abhi ke', expensive: 'ye bahut', 'but in the long run': 'lekin lambe', 'long run': 'lambe samay',
      'without using': 'bina zameen', land: 'zameen', water: 'paani', power: 'bijli', earth: 'dharti',
      "and here's the crazy": 'aur sabse crazy', code: 'code', comment: 'comment', guide: 'guide', youtube: 'youtube', link: 'link', bio: 'bio',
    },
    keywords: 'garmi fan hawa chip roshni infrared alaav dheema toota band radiators nvidia rack space station data centers aath dhoop raat baadal spacex lakh bhaari 3600 10 competition 2030 mehnga shakespeare orbit zameen paani bijli code guide bio ai google',
    emoji: { garmi: '🔥', alaav: '🔥', dhoop: '☀', code: '💻', guide: '💬', bio: '🔗', spacex: '🚀', fan: '🌀' },
  },
};

export function makeScenes(c, lang = 'en') {
  const named = lang !== 'hi'; // Hindi version: profile picture only, no channel name or handle
  const list = [], sfx = [];
  const add = (start, draw, light = false) => { list.push({ start, light, draw }); if (start > 0) sfx.push({ t: start - .05, k: 'whoosh', g: -19 }); };
  const s = x => x - .1;
  const A = {
    heat: s(c('because of', 4)), earth: s(c('on earth')), vac: s(c('in space', 11)), only: s(c('the only way')), warm: s(c('everything warm')), fire: s(c("it's the heat")), slow: s(c("but that's a very slow")),
    broke: s(c('so in space', 25)), build: s(c('the heat keeps building')), rad: s(c("that's why a satellite")), rack: s(c('and one nvidia')), iss: s(c('even')), why: s(c('so why put')), orbit: s(c('in the right orbit')),
    sunny: s(c('up there', 49)), clear: s(c('no night')), sx: s(c("that's why spacex")), heavy: s(c('but radiators')), cost: s(c('and right now')), math: s(c("google's math")), lead: s(c("google's own")),
    already: s(c("but it's already")), star: s(c('last year')), exp: s(c('so for now')), run: s(c('but in the long run')), land: s(c('without using')), crazy: s(c("and here's the crazy")),
  };

  // 1 HOOK: freezing satellite with Google's 4 AI chips and a 15-minute limit
  { const K = { cold: c('freezing cold'), google: c("google's"), four: c('four'), fifteen: c('15'), time: c('at a time') };
    sfx.push({ t: .02, k: 'riser', g: -21 });
    add(0, (ctx, T) => {
      space(ctx, T, { gy: 1000, tint: '40,80,180' });
      shot(ctx, T, 0, () => {
        lowEarth(ctx, T);
        const cold = p(T, K.cold, .8);
        live(ctx, T, 540, 1000, { yaw: .1, bob: 10, seed: 1 }, () => sat(ctx, T, 540, 1010, .85, { cold, heat: 0 }));
        const deg = Math.round(lerp(20, -270, eio(clamp((T - K.cold) / 1.0)))); bin(ctx, cold, () => { ctx.save(); ctx.shadowColor = 'rgba(120,200,255,.9)'; ctx.shadowBlur = 36; txt(ctx, deg + '°C', 540, 1330, 120, '#bfe6ff', 900, 'center', MONO); ctx.restore(); ctx.letterSpacing = '5px'; txt(ctx, 'DEEP SPACE', 540, 1380, 26, 'rgba(210,225,240,.8)', 700, 'center', MONO); ctx.letterSpacing = '0px'; });
        gPlate(ctx, T, 540, 660, 520, p(T, K.google, .55, eback), 2);
        tag(ctx, 880, 830, '4 AI CHIPS', p(T, K.four, .5), 585, 990, { rgb: '93,224,255' });
        const f = p(T, K.fifteen, .5, eback); if (f > 0) pop(ctx, f, 540, 1600, () => live(ctx, T, 540, 1600, { yaw: .05, bob: 5, seed: 3 }, () => timerPill(ctx, 540, 1600, 900, 1)));
      }, { cy: 1100 });
    });
  }
  // 2 the timer runs out: chips overheat
  { const K = { heat: c('heat', A.heat), how: c('how does that'), sense: c('make sense') };
    sfx.push({ t: K.sense, k: 'glitch', g: -17 });
    add(A.heat, (ctx, T) => {
      space(ctx, T, { gy: 1000, tint: '120,40,30' });
      shot(ctx, T, A.heat, () => {
        lowEarth(ctx, T); const h = p(T, K.heat - .3, 1.6, eio);
        live(ctx, T, 540, 1000, { yaw: .08, bob: 8, seed: 1 }, () => sat(ctx, T, 540, 1010, .85, { heat: h }));
        wisps(ctx, T, 540, 880, 230, h, 7);
        const u = clamp((T - A.heat) / (K.sense - A.heat + .3)); timerPill(ctx, 540, 1600, 900 * (1 - eio(u)), 1, u > .55 ? 1 : 0);
        const q = p(T, K.how, .55, eback); pop(ctx, q, 880, 760, () => live(ctx, T, 880, 760, { yaw: .1, bob: 8, spin: .05, seed: 5 }, () => { glowDot(ctx, 880, 740, 200, HOT_RGB, .7); ctx.save(); ctx.shadowColor = HOT; ctx.shadowBlur = 40; txt(ctx, '?', 880, 840, 260, '#ffb6a2', 900); ctx.restore(); }));
        stamp(ctx, p(T, K.sense, .45, eback), 540, 1300, 'SHUTS DOWN', { col: HOT, size: 60, rot: -.06 });
      }, { cy: 1100 });
    });
  }
  // 3 on Earth, a fan blows air over the chip
  { const K = { fan: c('fan', A.earth), air: c('blows air'), chip: c("laptop's chip"), carry: c('carries the heat') };
    add(A.earth, (ctx, T) => {
      space(ctx, T, { gy: 1100, tint: '30,70,60' });
      shot(ctx, T, A.earth, () => {
        const air = p(T, K.air, .7), heat = .2 + .5 * p(T, K.chip, .8);
        live(ctx, T, 540, 1130, { yaw: .05, bob: 6, breathe: .006, seed: 2 }, () => board(ctx, T, 540, 1130, 940, { heat, fan: 1, air }));
        tag(ctx, 760, 700, 'FAN', p(T, K.fan, .5), 747, 985, { rgb: '220,230,245' });
        tag(ctx, 320, 700, 'HOT CHIP', p(T, K.chip, .5), 333, 1000, { rgb: '255,150,110' });
        tag(ctx, 300, 1600, 'COOL AIR', p(T, K.air, .5), 300, 1380, { rgb: '120,200,255' });
        tag(ctx, 800, 1600, 'HEAT CARRIED AWAY', p(T, K.carry, .5), 850, 1380, { rgb: '255,120,80', size: 20 });
      }, { cy: 1130 });
    });
  }
  // 4 in space there's no air: heat stays
  { const K = { noair: c('no air', A.vac), nothing: c('nothing can', A.vac), away: c('away', A.vac) };
    add(A.vac, (ctx, T) => {
      space(ctx, T, { gy: 1050, tint: '90,40,50' });
      shot(ctx, T, A.vac, () => {
        const v = p(T, A.vac, .8), h = .35 + .5 * p(T, K.nothing, 2, eio);
        dashCircle(ctx, T, 540, 1050, 470, v * .6);
        live(ctx, T, 540, 1050, { yaw: .08, bob: 8, seed: 4 }, () => sat(ctx, T, 540, 1060, .8, { heat: h }));
        wisps(ctx, T, 540, 940, 220, h * .9, 6);
        tag(ctx, 250, 700, 'EMPTY SPACE', p(T, K.noair, .5), 330, 880, { rgb: '200,215,240' });
        const x = p(T, K.nothing, .5, eback); if (x > 0) { pop(ctx, x, 540, 1560, () => { glowDot(ctx, 540, 1560, 200, '120,200,255', .35); txt(ctx, 'AIR', 540, 1610, 130, 'rgba(200,225,255,.85)', 900, 'center', MONO); crossOut(ctx, p(T, K.nothing + .15, .4), 540, 1570, 120); }); }
        tag(ctx, 800, 1330, 'HEAT STUCK', p(T, K.away, .5), 700, 1190, { rgb: '255,120,80' });
      }, { cy: 1100 });
    });
  }
  // 5 the only way out is light
  { const K = { only: c('only way', A.only), light: c('light', A.only) };
    add(A.only, (ctx, T) => {
      space(ctx, T, { gy: 1050, tint: '110,80,30' });
      shot(ctx, T, A.only, () => {
        const r = p(T, K.light, .8);
        rays(ctx, T, 540, 1050, 180, 620, .25 + .75 * r, { n: 26 });
        live(ctx, T, 540, 1050, { yaw: .08, bob: 8, seed: 5 }, () => sat(ctx, T, 540, 1060, .8, { heat: .6 }));
        tag(ctx, 540, 1580, 'ONLY WAY OUT: LIGHT', p(T, K.only, .5), 540, 1330, { rgb: '255,205,90', size: 26 });
      }, { cy: 1100 });
    });
  }
  // 6 everything warm glows with invisible infrared
  { const K = { warm: c('warm', A.warm), inv: c('invisible', A.warm), ir: c('infrared', A.warm) };
    sfx.push({ t: K.ir, k: 'shimmer', g: -19 });
    add(A.warm, (ctx, T) => {
      space(ctx, T, { gy: 1050, tint: '120,30,110' });
      shot(ctx, T, A.warm, () => {
        const th = p(T, K.warm, .9);
        let g = ctx.createRadialGradient(540, 1050, 20, 540, 1050, 560); g.addColorStop(0, `rgba(255,230,130,${.85 * th})`); g.addColorStop(.3, `rgba(255,110,50,${.6 * th})`); g.addColorStop(.65, `rgba(170,30,120,${.4 * th})`); g.addColorStop(1, 'rgba(60,10,90,0)'); ctx.fillStyle = g; ctx.fillRect(-W, 300, W * 3, 1500);
        irRings(ctx, T, 540, 1050, 140, 560, th, { n: 5 });
        live(ctx, T, 540, 1050, { yaw: .08, bob: 8, seed: 6 }, () => sat(ctx, T, 540, 1060, .8, { heat: .7 }));
        tag(ctx, 250, 700, 'WARM', p(T, K.warm, .5), 400, 900, { rgb: '255,170,110' });
        tag(ctx, 850, 700, 'INVISIBLE LIGHT', p(T, K.inv, .5), 700, 900, { rgb: '220,190,255', size: 20 });
        const ir = p(T, K.ir, .5, eback); pop(ctx, ir, 540, 1580, () => pillBox(ctx, 540, 1580, 'INFRARED', 1, '255,150,110', 44));
        // heat scale
        const sy = 1000; const gg = ctx.createLinearGradient(0, sy - 260, 0, sy + 260); gg.addColorStop(0, '#ffe58a'); gg.addColorStop(.4, '#ff6a2e'); gg.addColorStop(.75, '#a21c78'); gg.addColorStop(1, '#271055'); ctx.globalAlpha = th; rr(ctx, 70, sy - 260, 36, 520, 18); ctx.fillStyle = gg; ctx.fill(); ctx.globalAlpha = 1; txt(ctx, 'HOT', 88, sy - 280, 20, '#ffe58a', 800, 'center', MONO); txt(ctx, 'COLD', 88, sy + 300, 20, '#9a7bd8', 800, 'center', MONO);
      }, { cy: 1100 });
    });
  }
  // 7 the heat you feel from a campfire without touching it
  { const K = { fire: c('campfire'), touch: c('touching') };
    add(A.fire, (ctx, T) => {
      space(ctx, T, { gy: 1500, tint: '150,60,20', stars: 70 });
      shot(ctx, T, A.fire, () => {
        const f = p(T, A.fire, .6, eback), hg = p(T, K.fire, .9);
        glowDot(ctx, 380, 1450, 520, '255,120,40', .35 + .1 * Math.sin(T * 9));
        live(ctx, T, 380, 1450, { yaw: .03, bob: 4, breathe: .01, seed: 1 }, () => { logs(ctx, 380, 1500, 1.15); flame(ctx, T, 380, 1500, 1.7 * f); });
        // infrared waves leaving the fire toward the hand
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; for (let i = 0; i < 7; i++) { const u = (T * .5 + i / 7) % 1, x = lerp(500, 740, u), y0 = 1260 + (i - 3) * 36; ctx.strokeStyle = `rgba(255,120,60,${.7 * hg * Math.sin(u * Math.PI)})`; ctx.lineWidth = 6; ctx.beginPath(); for (let k = 0; k <= 10; k++) { const yy = y0 + Math.sin(T * 5 + k * .9 + i) * 10; k ? ctx.lineTo(x - 40 + k * 8, yy) : ctx.moveTo(x - 40, yy); } ctx.stroke(); } ctx.restore();
        const hx = lerp(1250, 830, eo5(clamp((T - A.fire) / 1.2)));
        live(ctx, T, hx, 1300, { yaw: .05, bob: 6, seed: 2 }, () => hand(ctx, T, hx, 1300, 1.25, { rot: -.12, glow: hg * .8 }));
        tag(ctx, 540, 760, 'INFRARED HEAT', p(T, K.fire, .5), 600, 1200, { rgb: '255,160,100' });
        const tc = p(T, K.touch, .5); if (tc > 0) { ctx.save(); ctx.globalAlpha *= tc; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.setLineDash([10, 10]); ctx.beginPath(); ctx.moveTo(560, 1640); ctx.lineTo(lerp(560, 740, tc), 1640); ctx.stroke(); ctx.restore(); pillBox(ctx, 650, 1730, 'NOT TOUCHING', tc, '255,255,255', 28); }
      }, { cy: 1300 });
    });
  }
  // 8 but that's a very slow way to lose heat: fan cooling vs light-only
  { const K = { lose: c('lose heat', A.slow), slow: c('very slow', A.slow) };
    add(A.slow, (ctx, T) => {
      space(ctx, T, { gy: 1250, tint: '40,60,130' });
      shot(ctx, T, A.slow, () => {
        const d = clamp((T - K.lose) / 1.6), vis = p(T, A.slow, .5);
        stopwatch(ctx, T, 540, 800, 120, T * 2.6, vis);
        const thy = 1560, th = 520;
        thermo(ctx, 300, thy, th, 1 - .85 * eio(d), '120,200,255', { a: vis }); thermo(ctx, 780, thy, th, 1 - .12 * eio(d), '255,90,60', { a: vis });
        ctx.save(); ctx.globalAlpha *= vis; ctx.translate(300, 960); ctx.rotate(T * 8); ctx.fillStyle = 'rgba(220,230,245,.9)'; for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.ellipse(34, 0, 34, 12, 0, 0, 7); ctx.fill(); } ctx.restore();
        live(ctx, T, 780, 960, { yaw: .05, bob: 6, seed: 3 }, () => sat(ctx, T, 780, 960, .22, { heat: .5, dish: 0 }));
        tag(ctx, 300, 1730, 'FAN · ON EARTH', vis, undefined, undefined, { rgb: '120,200,255', size: 20 }); tag(ctx, 780, 1730, 'LIGHT ONLY · IN SPACE', vis, undefined, undefined, { rgb: '255,120,80', size: 20 });
        stamp(ctx, p(T, K.slow, .45, eback), 540, 1240, 'VERY SLOW', { col: '#ffcf5a', size: 58, rot: -.07 });
      }, { cy: 1200 });
    });
  }
  // 9 an AI chip in space is like a laptop with a broken fan
  { const K = { chip: c('ai chip', A.broke), laptop: c('laptop', A.broke), broken: c('broken fan', A.broke) };
    sfx.push({ t: K.broken, k: 'shatter', g: -18 });
    add(A.broke, (ctx, T) => {
      space(ctx, T, { gy: 1200, tint: '90,40,50' });
      shot(ctx, T, A.broke, () => {
        const br = p(T, K.broken, .5);
        live(ctx, T, 300, 700, { yaw: .1, bob: 8, seed: 1 }, () => sat(ctx, T, 300, 700, .34, { heat: .5, dish: 0 }));
        tag(ctx, 300, 880, 'AI CHIP IN SPACE', p(T, K.chip, .5), undefined, undefined, { rgb: '93,224,255', size: 20 });
        const eq = p(T, K.laptop - .2, .5, eback); pop(ctx, eq, 540, 720, () => txt(ctx, '≈', 540, 780, 130, '#ffd479', 900));
        tag(ctx, 800, 880, 'LAPTOP · BROKEN FAN', p(T, K.laptop, .5), undefined, undefined, { rgb: '255,160,120', size: 20 });
        live(ctx, T, 540, 1330, { yaw: .05, bob: 6, breathe: .006, seed: 2 }, () => board(ctx, T, 540, 1330, 940, { heat: .3 + .5 * br, fan: 1, broken: br, air: 1 - br }));
      }, { cy: 1250 });
    });
  }
  // 10 heat builds until it shuts down
  { const K = { build: c('keeps building', A.build), shut: c('shut down', A.build) };
    sfx.push({ t: K.shut, k: 'glitch', g: -16 });
    add(A.build, (ctx, T) => {
      space(ctx, T, { gy: 1300, tint: '120,40,30' });
      shot(ctx, T, A.build, () => {
        const u = clamp((T - A.build - .2) / Math.max(.6, K.shut - A.build - .1)), off = p(T, K.shut, .5), heat = eio(u) * (1 - .55 * off);
        gauge(ctx, 540, 740, 150, .08 + .9 * eio(u) * (1 - .6 * off), { label: 'CHIP TEMP', a: p(T, A.build, .4) });
        live(ctx, T, 540, 1320, { yaw: .04, bob: 5, breathe: .005, seed: 3 }, () => board(ctx, T, 540, 1320, 900, { heat, fan: 0, broken: 1, air: 0 }));
        if (off > 0) { ctx.save(); ctx.globalAlpha *= .45 * off; ctx.fillStyle = '#05070c'; rr(ctx, 90, 1320 - 333, 900, 666, 30); ctx.fill(); ctx.restore(); }
        wisps(ctx, T, 400, 1250, 140, heat * (1 - off));
        stamp(ctx, p(T, K.shut, .45, eback), 540, 1320, 'SHUTDOWN', { col: HOT, size: 74, rot: -.07 });
      }, { cy: 1250 });
    });
  }
  // 11 radiators glow the heat into the dark
  { const K = { big: c('big panels', A.rad), rad: c('radiators', A.rad), glow: c('glow', A.rad), dark: c('dark', A.rad) };
    sfx.push({ t: K.rad, k: 'gear', g: -19 });
    add(A.rad, (ctx, T) => {
      space(ctx, T, { gy: 1100, tint: '100,40,40' });
      shot(ctx, T, A.rad, () => {
        const ex = p(T, K.rad, 1.1, eio), gl = p(T, K.glow, 1.2, eio);
        if (gl > 0) { irRings(ctx, T, 540, 1100, 200, 640, gl * .6, { n: 4, per: 3 }); [-1, 1].forEach(d => arrow(ctx, 540 + d * 150, 1100, 540 + d * (250 + 90 * gl), 1100, { col: '255,120,80', w: 12, a: gl })); }
        live(ctx, T, 540, 1100, { yaw: .07, bob: 8, seed: 5 }, () => sat(ctx, T, 540, 1100, .62, { heat: .55 * (1 - .6 * gl), rad: ex, radGlow: gl, dish: 0 }));
        tag(ctx, 840, 790, 'BIG PANELS', p(T, K.big, .5), 600, 840, { rgb: '255,230,230' });
        tag(ctx, 240, 1420, 'RADIATORS', p(T, K.rad, .5), 470, 1340, { rgb: '255,150,120' });
        const d = p(T, K.dark, .6); if (d > 0) { ctx.save(); ctx.globalAlpha *= d; ctx.letterSpacing = '6px'; txt(ctx, 'HEAT → INTO THE DARK', 540, 1700, 34, '#ffb6a2', 800, 'center', MONO); ctx.restore(); }
      }, { cy: 1100 });
    });
  }
  // 12 one NVIDIA AI rack makes so much heat
  { const K = { nv: c('nvidia', A.rack), rack: c('rack', A.rack), much: c('so much heat', A.rack) };
    sfx.push({ t: K.much, k: 'riser', g: -22 });
    add(A.rack, (ctx, T) => {
      space(ctx, T, { gy: 1200, tint: '70,50,120' });
      shot(ctx, T, A.rack, () => {
        const k = p(T, A.rack, .6, eback), heat = p(T, K.much, 1.0, eio);
        flip(ctx, k, 540, 1180, () => live(ctx, T, 540, 1180, { yaw: .07, bob: 8, breathe: .01, seed: 2 }, () => rack(ctx, T, 540, 1180, 1050, { heat })));
        wisps(ctx, T, 540, 720, 240, heat, 8);
        tag(ctx, 270, 760, 'NVIDIA', p(T, K.nv, .5), 420, 900, { rgb: '120,230,120', size: 26 });
        tag(ctx, 830, 880, 'AI RACK', p(T, K.rack, .5), 690, 980, { rgb: '220,230,245', size: 26 });
        pillBox(ctx, 540, 1720, 'SO MUCH HEAT', p(T, K.much, .5, eback), '255,120,80', 36);
      }, { cy: 1180 });
    });
  }
  // 13 even the space station's cooling system couldn't handle it
  { const K = { st: c("space station's", A.iss), sys: c('cooling system', A.iss), cant: c("couldn't handle", A.iss) };
    sfx.push({ t: K.cant, k: 'glitch', g: -17 });
    add(A.iss, (ctx, T) => {
      space(ctx, T, { gy: 1050, tint: '40,70,140' });
      shot(ctx, T, A.iss, () => {
        const ov = p(T, K.cant - .2, .9, eio), v = p(T, A.iss, .6, eback);
        flip(ctx, v, 540, 1050, () => live(ctx, T, 540, 1050, { yaw: .06, bob: 8, seed: 3 }, () => iss(ctx, T, 540, 1050, .95, { over: ov })));
        tag(ctx, 250, 700, 'SPACE STATION', p(T, K.st, .5), 420, 960, { rgb: '220,230,245' });
        tag(ctx, 830, 700, 'MAIN COOLING', p(T, K.sys, .5), 770, 900, { rgb: '255,170,130' });
        const rk = p(T, A.iss + .4, .6, eback); live(ctx, T, 540, 1600, { yaw: .05, bob: 5, seed: 4 }, () => { serverRack(ctx, T, 540, 1700, 150, 230, { heat: 1, a: rk }); });
        wisps(ctx, T, 540, 1480, 100, rk, 4);
        tag(ctx, 800, 1580, '1 AI RACK', rk, 625, 1580, { rgb: '255,120,80', size: 20 });
        stamp(ctx, p(T, K.cant, .45, eback), 540, 1330, 'OVERLOAD', { col: HOT, size: 64, rot: -.06 });
      }, { cy: 1100 });
    });
  }
  // 14 so why put data centers in space?
  { const K = { dc: c('data centers', A.why), sp: c('in space at', A.why) };
    add(A.why, (ctx, T) => {
      space(ctx, T, { gy: 1100, tint: '50,70,160' });
      shot(ctx, T, A.why, () => {
        flip(ctx, p(T, K.dc - .2, .55, eback), 270, 1110, () => live(ctx, T, 270, 1110, { yaw: .06, bob: 6, seed: 1 }, () => { panel(ctx, 70, 780, 400, 660, 34); [0, 1, 2].forEach(i => serverRack(ctx, T, 150 + i * 120, 1300, 90, 330, { seed: i * 3 })); txt(ctx, 'DATA CENTER', 270, 1390, 28, '#dfe6f2', 800, 'center', MONO); }));
        flip(ctx, p(T, K.sp - .2, .55, eback), 810, 1110, () => live(ctx, T, 810, 1110, { yaw: .06, bob: 6, seed: 2 }, () => { panel(ctx, 610, 780, 400, 660, 34); miniSat(ctx, T, 810, 1000, 1.0, .12 * Math.sin(T)); miniSat(ctx, T, 760, 1210, .55, -.2); txt(ctx, 'IN SPACE', 810, 1390, 28, '#dfe6f2', 800, 'center', MONO); }));
        const a = p(T, K.sp - .1, .6); arrow(ctx, 500, 1110, 500 + 80 * a, 1110, { w: 12, a });
        const q = p(T, K.sp, .55, eback); pop(ctx, q, 540, 700, () => live(ctx, T, 540, 700, { yaw: .1, bob: 8, spin: .05, seed: 5 }, () => { glowDot(ctx, 540, 680, 200, '255,205,90', .7); ctx.save(); ctx.shadowColor = '#ffcf5a'; ctx.shadowBlur = 40; txt(ctx, '?', 540, 790, 260, '#ffe08a', 900); ctx.restore(); }));
      }, { cy: 1100 });
    });
  }
  // 15 in the right orbit a solar panel makes up to 8x the power
  { const K = { orbit: c('right orbit', A.orbit), panel: c('solar panel', A.orbit), eight: c('eight times', A.orbit), earth: c('than on earth', A.orbit) };
    sfx.push({ t: K.eight, k: 'success', g: -20 });
    add(A.orbit, (ctx, T) => {
      space(ctx, T, { gy: 950, tint: '60,90,170' });
      shot(ctx, T, A.orbit, () => {
        sun(ctx, T, 170, 690, 60, p(T, A.orbit, .7));
        earth(ctx, T, 540, 1050, 290, {});
        const ob = p(T, K.orbit, .8); ctx.save(); ctx.translate(540, 1050); ctx.rotate(-.28); ctx.globalAlpha *= ob; ctx.strokeStyle = 'rgba(255,205,90,.7)'; ctx.lineWidth = 4; ctx.setLineDash([16, 14]); ctx.lineDashOffset = -T * 30; ctx.beginPath(); ctx.ellipse(0, 0, 440, 150, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        const an = T * .8, sx = Math.cos(an) * 440, sy = Math.sin(an) * 150; if (Math.sin(an) > -.2 || Math.abs(sx) > 290) { ctx.save(); ctx.translate(sx, sy); ctx.rotate(.28); solar(ctx, T, -48, -30, 96, 60, { glow: p(T, K.panel, .6), cols: 4, rows: 2 }); ctx.restore(); } ctx.restore();
        tag(ctx, 800, 700, 'RIGHT ORBIT', p(T, K.orbit, .5), 760, 880, { rgb: '255,205,90' });
        // 1x vs 8x bars
        const bx = [330, 750], by = 1790, e = p(T, K.panel, .6);
        ctx.save(); ctx.globalAlpha *= e; rr(ctx, bx[0] - 70, by - 46, 140, 46, 8); ctx.fillStyle = '#4fa3ff'; ctx.fill(); const h8 = 46 + (330 - 46) * p(T, K.eight - .1, .9, eio); rr(ctx, bx[1] - 70, by - h8, 140, h8, 10); const g = ctx.createLinearGradient(0, by - h8, 0, by); g.addColorStop(0, '#ffe08a'); g.addColorStop(1, '#ff9a2c'); ctx.fillStyle = g; ctx.shadowColor = 'rgba(255,190,60,.8)'; ctx.shadowBlur = 30; ctx.fill(); ctx.restore();
        txt(ctx, 'ON EARTH', bx[0], by + 44, 24, 'rgba(210,225,245,.85)', 800, 'center', MONO); txt(ctx, 'IN ORBIT', bx[1], by + 44, 24, '#ffd479', 800, 'center', MONO);
        bin(ctx, p(T, K.earth, .4), () => txt(ctx, '1x', bx[0], by - 70, 52, '#bcd7ff', 900));
        pop(ctx, p(T, K.eight, .5, eback), bx[1], by - 360, () => { ctx.save(); ctx.shadowColor = '#ffb62c'; ctx.shadowBlur = 30; txt(ctx, 'UP TO 8x', bx[1], by - 350, 72, '#ffdc78', 900); ctx.restore(); });
      }, { cy: 1200 });
    });
  }
  // 16 up there a panel sits in sunlight almost all the time
  { const K = { almost: c('almost', A.sunny), sun: c('sunlight', A.sunny) };
    add(A.sunny, (ctx, T) => {
      space(ctx, T, { gy: 800, tint: '120,100,40' });
      shot(ctx, T, A.sunny, () => {
        const sv = p(T, A.sunny, .7); sun(ctx, T, 190, 730, 70, sv);
        earth(ctx, T, 650, 1500, 330, {});
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const u = (T * .5 + i / 5) % 1; ctx.strokeStyle = `rgba(${SUN_RGB},${.6 * sv * Math.sin(u * Math.PI)})`; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(lerp(260, 480, u) - 10, lerp(760, 1060, u) - 6); ctx.lineTo(lerp(260, 480, u) + 30, lerp(760, 1060, u) + 26); ctx.stroke(); } ctx.restore();
        live(ctx, T, 540, 1000, { yaw: .1, bob: 8, seed: 3 }, () => sat(ctx, T, 540, 1030, .56, { sunGlow: p(T, K.sun, .8), dish: 0, wings: 1 }));
        const f = p(T, K.almost, 1.2, eio); // battery full
        ctx.save(); ctx.globalAlpha *= p(T, K.almost - .2, .4); rr(ctx, 880, 700, 120, 270, 20); ctx.fillStyle = 'rgba(8,10,16,.9)'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(918, 686, 44, 14);
        rr(ctx, 894, 714 + 242 * (1 - f * .98), 92, 242 * f * .98, 12); ctx.fillStyle = f > .9 ? '#4ee08a' : '#ffd479'; ctx.fill(); ctx.restore();
        txt(ctx, Math.round(98 * f) + '%', 940, 1040, 44, '#fff', 900, 'center', MONO);
        pillBox(ctx, 540, 1810, 'SUNLIGHT ALMOST ALWAYS', p(T, K.sun, .5, eback), '255,205,90', 30);
      }, { cy: 1100 });
    });
  }
  // 17 no night, no clouds, no air in the way
  { const K = { night: c('no night', A.clear), clouds: c('clouds', A.clear), air: c('air in the way', A.clear) };
    add(A.clear, (ctx, T) => {
      space(ctx, T, { gy: 1300, tint: '70,80,150' });
      shot(ctx, T, A.clear, () => {
        const rows = [['NIGHT', K.night, 640], ['CLOUDS', K.clouds, 900], ['AIR', K.air, 1160]];
        rows.forEach(([lb, kt, y], i) => { const k = p(T, kt - .15, .5, eback); flip(ctx, k, 540, y, () => live(ctx, T, 540, y, { yaw: .04, bob: 5, seed: i }, () => {
          panel(ctx, 140, y - 100, 800, 200, 30); ctx.save(); ctx.translate(290, y);
          if (i === 0) { ctx.fillStyle = '#e8ecf6'; ctx.beginPath(); ctx.arc(0, 0, 58, 0, 7); ctx.fill(); ctx.fillStyle = '#0c1020'; ctx.beginPath(); ctx.arc(26, -10, 52, 0, 7); ctx.fill(); } else if (i === 1) cloud(ctx, 0, 6, .6); else { ctx.strokeStyle = 'rgba(160,210,255,.9)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let j = 0; j < 3; j++) { ctx.beginPath(); for (let q = 0; q <= 8; q++) { const xx = -50 + q * 12.5; q ? ctx.lineTo(xx, -30 + j * 30 + Math.sin(T * 5 + q + j) * 8) : ctx.moveTo(xx, -30 + j * 30); } ctx.stroke(); } }
          ctx.restore(); txt(ctx, lb, 560, y + 24, 64, '#fff', 900, 'left'); crossOut(ctx, p(T, kt + .1, .45), 290, y, 70); })); });
        const e = p(T, K.air + .3, .6, eback); sun(ctx, T, 190, 1560, 56, e);
        if (e > 0) { ctx.save(); ctx.globalAlpha *= e; ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${SUN_RGB},.6)`; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.setLineDash([30, 24]); ctx.lineDashOffset = -T * 90; ctx.beginPath(); ctx.moveTo(270, 1560); ctx.lineTo(640, 1640); ctx.stroke(); ctx.restore(); }
        live(ctx, T, 800, 1670, { yaw: .1, bob: 6, seed: 5 }, () => solar(ctx, T, 650, 1630, 300, 100, { glow: e, cols: 5, rows: 2 }));
        tag(ctx, 800, 1790, 'CLEAR PATH', e, undefined, undefined, { rgb: '255,205,90', size: 22 });
      }, { cy: 1150 });
    });
  }
  // 18 SpaceX wants up to one million satellites
  { const K = { sx: c('spacex', A.sx), mil: c('one million', A.sx), sats: c('satellites', A.sx) };
    sfx.push({ t: K.mil, k: 'shimmer', g: -20 });
    add(A.sx, (ctx, T) => {
      space(ctx, T, { gy: 1250, tint: '50,80,170' });
      shot(ctx, T, A.sx, () => {
        const sp = p(T, K.sx, .6, eback); flip(ctx, sp, 540, 650, () => live(ctx, T, 540, 650, { yaw: .08, bob: 6, seed: 1 }, () => logo(ctx, 'spacex_w', 540, 650, 440)));
        earth(ctx, T, 540, 1270, 280, {});
        const n = Math.floor(260 * p(T, K.mil - .3, 1.8, eio));
        ctx.save(); ctx.fillStyle = '#cfe6ff'; ctx.shadowColor = 'rgba(150,210,255,.9)'; ctx.shadowBlur = 8;
        for (let i = 0; i < n; i++) { const R = 330 + 70 * hash(i, 1), tilt = (hash(i, 2) - .5) * 2.2, an = T * (.18 + .1 * hash(i, 3)) * (hash(i, 4) > .5 ? 1 : -1) + hash(i, 5) * 6.28, x = 540 + Math.cos(an) * R, y = 1270 + Math.sin(an) * R * Math.sin(.5 + tilt * .35);
          const back = Math.sin(an) < 0 && Math.abs(x - 540) < 280; if (back) continue; ctx.beginPath(); ctx.arc(x, y, 2.6 + 1.5 * hash(i, 6), 0, 7); ctx.fill(); } ctx.restore();
        const cnt = Math.round(1e6 * eo(clamp((T - K.mil) / 1.1))), a = p(T, K.mil - .1, .4);
        bin(ctx, a, () => { ctx.save(); ctx.shadowColor = 'rgba(120,200,255,.8)'; ctx.shadowBlur = 30; txt(ctx, cnt.toLocaleString('en-US'), 540, 1690, 130, '#fff', 900, 'center', MONO); ctx.restore(); ctx.letterSpacing = '5px'; txt(ctx, 'SATELLITES · UP TO', 540, 1740, 28, 'rgba(200,220,245,.85)', 700, 'center', MONO); ctx.letterSpacing = '0px'; });
      }, { cy: 1150 });
    });
  }
  // 19 radiators are heavy
  { const K = { rad: c('radiators', A.heavy), heavy: c('heavy', A.heavy) };
    sfx.push({ t: K.heavy, k: 'shatter', g: -19 });
    add(A.heavy, (ctx, T) => {
      space(ctx, T, { gy: 1250, tint: '60,70,100' });
      shot(ctx, T, A.heavy, () => {
        const d = p(T, K.heavy - .35, .55, eio), dropY = lerp(760, 1100, d), sq = p(T, K.heavy, .3) * (1 - p(T, K.heavy + .3, .5)) * 14;
        ctx.save(); ctx.strokeStyle = 'rgba(200,210,225,.8)'; ctx.lineWidth = 5; [-220, 220].forEach(dx => { ctx.beginPath(); ctx.moveTo(540 + dx, 440); ctx.lineTo(540 + dx * .9, dropY - 90); ctx.stroke(); }); ctx.restore();
        live(ctx, T, 540, dropY, { yaw: .03, bob: 3, breathe: .004, seed: 2 }, () => { ctx.save(); ctx.translate(540, dropY); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 40; const g = ctx.createLinearGradient(-300, 0, 300, 0); g.addColorStop(0, '#d9a99d'); g.addColorStop(.5, '#f3f5f9'); g.addColorStop(1, '#b6bfce'); ctx.fillStyle = g; rr(ctx, -310, -90, 620, 180, 12); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(80,90,110,.4)'; ctx.lineWidth = 2; for (let k = -6; k <= 6; k++) { ctx.beginPath(); ctx.moveTo(k * 48, -90); ctx.lineTo(k * 48, 90); ctx.stroke(); } txt(ctx, 'RADIATOR', 0, 14, 44, '#3a4254', 900, 'center', MONO); ctx.restore(); });
        // scale platform
        ctx.save(); ctx.translate(540, 1300 + sq); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.fillStyle = '#2b323f'; rr(ctx, -380, 0, 760, 120, 18); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#ffcf5a'; for (let k = 0; k < 14; k++) ctx.fillRect(-370 + k * 54, 6, 28, 8);
        ctx.fillStyle = '#12161e'; rr(ctx, -130, 36, 260, 70, 12); ctx.fill(); ctx.restore();
        gauge(ctx, 540, 1470 + sq, 120, .12 + .86 * p(T, K.heavy, .5, eback), { label: 'LOAD' });
        pillBox(ctx, 540, 1730, 'RADIATORS = HEAVY', p(T, K.rad, .5, eback), '255,150,120', 34);
        stamp(ctx, p(T, K.heavy + .1, .45, eback), 540, 760, 'HEAVY', { col: '#ffcf5a', size: 76, rot: -.07 });
      }, { cy: 1150 });
    });
  }
  // 20 launching one kilo costs about $3,600
  { const K = { now: c('right now', A.cost), kilo: c('one kilo', A.cost), costs: c('costs', A.cost), price: c('3600', A.cost) };
    sfx.push({ t: K.price, k: 'shimmer', g: -20 });
    add(A.cost, (ctx, T) => {
      space(ctx, T, { gy: 1350, tint: '60,80,160' });
      shot(ctx, T, A.cost, () => {
        const lift = p(T, K.kilo - .2, 2.4, eio), ry = lerp(1340, 1210, lift), rock = (a, f) => Math.sin(T * f) * a;
        live(ctx, T, 540, ry, { yaw: .02, bob: 4, seed: 1 }, () => { ctx.save(); ctx.translate(540 + rock(3, 30) * lift, ry); const fl = 70 + 40 * Math.sin(T * 25) + 120 * lift; let g = ctx.createLinearGradient(0, 200, 0, 200 + fl * 2); g.addColorStop(0, 'rgba(255,240,170,.95)'); g.addColorStop(.4, 'rgba(255,140,40,.8)'); g.addColorStop(1, 'rgba(255,60,20,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-34, 196); ctx.quadraticCurveTo(0, 200 + fl * 2.4, 34, 196); ctx.closePath(); ctx.fill();
          g = ctx.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, '#9aa3b4'); g.addColorStop(.45, '#fff'); g.addColorStop(1, '#a4adbe'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -260); ctx.bezierCurveTo(70, -170, 62, -60, 62, 200); ctx.lineTo(-62, 200); ctx.bezierCurveTo(-62, -60, -70, -170, 0, -260); ctx.fill();
          ctx.fillStyle = '#9aa3b4'; [-1, 1].forEach(d => { ctx.beginPath(); ctx.moveTo(d * 60, 100); ctx.lineTo(d * 112, 224); ctx.lineTo(d * 60, 190); ctx.fill(); }); ctx.fillStyle = '#1b2438'; ctx.beginPath(); ctx.arc(0, -90, 24, 0, 7); ctx.fill(); ctx.strokeStyle = '#6ea8ff'; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); });
        const kk = p(T, K.kilo, .5, eback); pop(ctx, kk, 540, 760, () => live(ctx, T, 540, 760, { yaw: .1, bob: 8, spin: .03, seed: 3 }, () => { ctx.save(); ctx.translate(540, 760); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 30; const g = ctx.createLinearGradient(-90, -90, 90, 90); g.addColorStop(0, '#e4e8ef'); g.addColorStop(1, '#8993a4'); ctx.fillStyle = g; rr(ctx, -96, -80, 192, 160, 16); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(40,50,70,.5)'; ctx.lineWidth = 4; ctx.stroke(); txt(ctx, '1 KG', 0, 22, 60, '#2a3140', 900); ctx.restore(); }));
        tag(ctx, 250, 1240, 'RIGHT NOW', p(T, K.now, .5), 420, 1330, { rgb: '255,205,90' });
        const cnt = Math.round(3600 * eo(clamp((T - K.price) / .9))), a = p(T, K.costs, .45, eback);
        pop(ctx, a, 540, 1690, () => { ctx.save(); ctx.shadowColor = 'rgba(255,200,80,.9)'; ctx.shadowBlur = 36; txt(ctx, money(cnt), 540, 1710, 150, '#ffd479', 900, 'center', MONO); ctx.restore(); ctx.letterSpacing = '5px'; txt(ctx, 'TO LAUNCH 1 KG', 540, 1760, 28, 'rgba(220,226,236,.8)', 700, 'center', MONO); ctx.letterSpacing = '0px'; });
      }, { cy: 1200 });
    });
  }
  // 21 Google's math: launch has to get 10x cheaper by the mid-2030s
  { const K = { g: c("google's", A.math), ten: c('ten times|10 times', A.math), comp: c('compete', A.math), mid: c('mid2030s', A.math) };
    sfx.push({ t: K.ten, k: 'success', g: -20 });
    add(A.math, (ctx, T) => {
      space(ctx, T, { gy: 1200, tint: '40,60,130' });
      shot(ctx, T, A.math, () => {
        const px = 90, py = 780, pw = 900, ph = 760, ox = px + 90, oy = py + ph - 90, cw = pw - 150, ch = ph - 340;
        flip(ctx, p(T, A.math, .6, eback), 540, py + ph / 2, () => live(ctx, T, 540, py + ph / 2, { yaw: .03, bob: 5, seed: 1 }, () => {
          panel(ctx, px, py, pw, ph, 34); gPlate(ctx, T, px + 150, py + 70, 230, 1, 1); txt(ctx, 'LAUNCH COST PER KG', px + pw - 40, py + 78, 24, 'rgba(210,220,240,.85)', 800, 'right', MONO);
          ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ox, oy - ch - 20); ctx.lineTo(ox, oy); ctx.lineTo(ox + cw, oy); ctx.stroke(); txt(ctx, 'TODAY', ox, oy + 40, 22, 'rgba(200,215,240,.75)', 700, 'center', MONO); txt(ctx, 'MID-2030s', ox + cw - 20, oy + 40, 22, 'rgba(200,215,240,.75)', 700, 'center', MONO);
          const u = kf(T, [[A.math + .3, 0], [K.ten, .45], [K.comp, .75], [K.mid + .2, 1]], eio), f = x => 1 - (1 - Math.exp(-3.4 * x)) / (1 - Math.exp(-3.4)) * .9; // 1 -> .1
          ctx.save(); ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const x = i / 60 * u; const X = ox + cw * x, Y = oy - ch * f(x) - 10; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.strokeStyle = 'rgba(93,224,255,.2)'; ctx.lineWidth = 22; ctx.stroke(); ctx.strokeStyle = '#5de0ff'; ctx.lineWidth = 7; ctx.stroke();
          const ex = ox + cw * u, ey = oy - ch * f(u) - 10; glowDot(ctx, ex, ey, 60, AI_RGB, .9); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, ey, 11, 0, 7); ctx.fill(); ctx.restore();
          txt(ctx, '$3,600', ox + 10, oy - ch - 52, 50, '#ffd479', 900, 'left', MONO);
          bin(ctx, p(T, K.ten, .5), () => { ctx.save(); ctx.shadowColor = AI_RGB; ctx.shadowBlur = 24; txt(ctx, '÷ 10', ox + cw * .62, oy - ch * .62 - 70, 96, '#aef2ff', 900, 'center', MONO); ctx.restore(); });
          bin(ctx, p(T, K.mid, .5), () => txt(ctx, '≈ $360', ox + cw - 10, oy - 90, 50, '#7dffb0', 900, 'right', MONO));
        }));
        pillBox(ctx, 540, 1700, 'TEN TIMES CHEAPER TO COMPETE', p(T, K.comp, .5, eback), '93,224,255', 28);
      }, { cy: 1150 });
    });
  }
  // 22 Google's own project lead: not cheaper than Earth for five years
  { const K = { lead: c('project lead', A.lead), ex: c("doesn't expect", A.lead), beat: c('beat earth', A.lead), five: c('five years', A.lead) };
    add(A.lead, (ctx, T) => {
      space(ctx, T, { gy: 1250, tint: '50,60,130' });
      shot(ctx, T, A.lead, () => {
        flip(ctx, p(T, K.lead - .2, .55, eback), 540, 720, () => live(ctx, T, 540, 720, { yaw: .04, bob: 5, seed: 1 }, () => { panel(ctx, 120, 560, 840, 330, 34); ctx.save(); ctx.beginPath(); ctx.arc(270, 725, 78, 0, 7); ctx.clip(); ctx.fillStyle = '#26335c'; ctx.fillRect(190, 645, 160, 160); ctx.fillStyle = '#e4b592'; ctx.beginPath(); ctx.arc(270, 700, 36, 0, 7); ctx.fill(); ctx.fillStyle = '#3b4a7a'; ctx.beginPath(); ctx.ellipse(270, 810, 80, 62, 0, 0, 7); ctx.fill(); ctx.restore(); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(270, 725, 80, 0, 7); ctx.stroke();
          logo(ctx, 'google', 520, 640, 150); ctx.letterSpacing = '3px'; txt(ctx, 'PROJECT LEAD', 400, 740, 30, '#fff', 900, 'left', MONO); ctx.letterSpacing = '0px'; txt(ctx, 'does not expect to beat Earth on cost', 400, 800, 28, 'rgba(210,220,240,.85)', 600, 'left'); }));
        // balance: Earth side sinks (Earth still cheaper)
        const tilt = lerp(0, .2, eio(clamp((T - K.beat + .2) / .8))) * 1, bx = 540, by = 1330;
        ctx.save(); ctx.translate(bx, by); ctx.fillStyle = '#7d8798'; ctx.beginPath(); ctx.moveTo(-30, 220); ctx.lineTo(30, 220); ctx.lineTo(14, -10); ctx.lineTo(-14, -10); ctx.fill(); rr(ctx, -150, 210, 300, 28, 12); ctx.fill();
        ctx.rotate(-tilt); ctx.fillStyle = '#c7cfdd'; rr(ctx, -380, -14, 760, 24, 12); ctx.fill();
        [[-1, 0], [1, 1]].forEach(([d, k]) => { ctx.save(); ctx.translate(d * 340, -14); ctx.rotate(tilt); ctx.strokeStyle = '#9aa5b8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-70, 190); ctx.moveTo(0, 0); ctx.lineTo(70, 190); ctx.stroke(); ctx.fillStyle = '#aeb8ca'; ctx.beginPath(); ctx.ellipse(0, 195, 100, 18, 0, 0, 7); ctx.fill();
          if (k === 0) earth(ctx, T, 0, 120, 70, { glow: .3 }); else miniSat(ctx, T, 0, 130, .75, .1 * Math.sin(T)); ctx.restore(); }); ctx.restore();
        tag(ctx, 200, 1110, 'EARTH', p(T, K.beat, .5), undefined, undefined, { rgb: '120,200,255', size: 22 }); tag(ctx, 880, 1110, 'SPACE', p(T, K.beat, .5), undefined, undefined, { rgb: '255,205,90', size: 22 });
        const f = p(T, K.five, .5, eback); pop(ctx, f, 540, 1700, () => { ctx.save(); ctx.shadowColor = 'rgba(255,205,90,.8)'; ctx.shadowBlur = 30; txt(ctx, '5 YEARS', 540, 1730, 120, '#ffd479', 900, 'center', MONO); ctx.restore(); });
      }, { cy: 1150 });
    });
  }
  // 23 but it's already happening
  { const K = { hap: c('happening', A.already) };
    add(A.already, (ctx, T) => {
      space(ctx, T, { gy: 1100, tint: '40,120,90' });
      shot(ctx, T, A.already, () => {
        lowEarth(ctx, T); rays(ctx, T, 540, 1000, 160, 520, .6, { n: 18, col: MINT_RGB });
        live(ctx, T, 540, 1000, { yaw: .1, bob: 10, seed: 3 }, () => sat(ctx, T, 540, 1010, .8, { sunGlow: .5, dish: 1 }));
        stamp(ctx, p(T, K.hap, .5, eback), 540, 1420, 'ALREADY HAPPENING', { col: MINT, size: 56, rot: -.05 });
      }, { cy: 1100 });
    });
  }
  // 24 StarCloud trained a small AI on Shakespeare with an NVIDIA chip in orbit
  { const K = { sc: c('starcloud', A.star), small: c('small ai', A.star), sh: c('shakespeare', A.star), nv: c('nvidia', A.star), orb: c('orbit', A.star) };
    sfx.push({ t: K.nv, k: 'success', g: -21 });
    add(A.star, (ctx, T) => {
      space(ctx, T, { gy: 1100, tint: '40,70,150' });
      shot(ctx, T, A.star, () => {
        const sv = p(T, A.star, .6, eback); flip(ctx, sv, 540, 840, () => live(ctx, T, 540, 840, { yaw: .1, bob: 8, seed: 2 }, () => sat(ctx, T, 540, 850, .62, { chips: 1, dish: 1 })));
        tag(ctx, 540, 590, 'STARCLOUD', p(T, K.sc, .5), 540, 700, { rgb: '255,205,90', size: 26 });
        const nn = p(T, K.small, .6, eback); pop(ctx, nn, 540, 1290, () => live(ctx, T, 540, 1290, { yaw: .05, bob: 6, seed: 3 }, () => { panel(ctx, 270, 1140, 540, 300, 30); neural(ctx, T, 540, 1290, 380, 190); txt(ctx, 'SMALL AI', 540, 1180, 24, '#cfeeff', 800, 'center', MONO); }));
        const sh = p(T, K.sh, .55, eback); pop(ctx, sh, 250, 1650, () => live(ctx, T, 250, 1650, { yaw: .08, bob: 6, seed: 4 }, () => { ctx.save(); ctx.translate(250, 1650); ctx.rotate(-.05); ctx.fillStyle = '#7b2d26'; rr(ctx, -150, -100, 300, 200, 10); ctx.fill(); ctx.fillStyle = '#f6edd8'; rr(ctx, -140, -90, 135, 180, 6); ctx.fill(); rr(ctx, 5, -90, 135, 180, 6); ctx.fill(); ctx.strokeStyle = 'rgba(90,60,30,.5)'; ctx.lineWidth = 3; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(-125, -60 + k * 26); ctx.lineTo(-20, -60 + k * 26); ctx.moveTo(20, -60 + k * 26); ctx.lineTo(125, -60 + k * 26); ctx.stroke(); } ctx.restore(); txt(ctx, 'SHAKESPEARE', 250, 1790, 26, '#f4e9d0', 800, 'center', MONO); }));
        const nv = p(T, K.nv, .55, eback); pop(ctx, nv, 830, 1650, () => live(ctx, T, 830, 1650, { yaw: .08, bob: 6, seed: 5 }, () => { ctx.save(); ctx.translate(830, 1650); const g = ctx.createLinearGradient(-90, -90, 90, 90); g.addColorStop(0, '#3a6a2a'); g.addColorStop(1, '#16300f'); ctx.shadowColor = 'rgba(118,185,0,.8)'; ctx.shadowBlur = 36; rr(ctx, -95, -95, 190, 190, 22); ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = '#76b900'; ctx.lineWidth = 7; ctx.stroke(); txt(ctx, 'GPU', 0, 18, 56, '#e6ffc4', 900, 'center', MONO); ctx.restore(); txt(ctx, 'NVIDIA', 830, 1790, 26, '#b6e872', 800, 'center', MONO); }));
        const ar = p(T, K.small + .2, .5); arrow(ctx, 330, 1520, 400, 1470, { w: 9, a: ar * .9 }); arrow(ctx, 750, 1520, 680, 1470, { w: 9, a: p(T, K.small + .4, .5) * .9 });
        tag(ctx, 880, 700, 'IN ORBIT', p(T, K.orb, .5), 700, 820, { rgb: '120,200,255' });
      }, { cy: 1200 });
    });
  }
  // 25 so for now it's too expensive
  { const K = { exp: c('expensive', A.exp) };
    add(A.exp, (ctx, T) => {
      space(ctx, T, { gy: 1100, tint: '120,50,50' });
      shot(ctx, T, A.exp, () => {
        lowEarth(ctx, T);
        live(ctx, T, 400, 1000, { yaw: .1, bob: 10, seed: 3 }, () => sat(ctx, T, 400, 1010, .7, {}));
        const k = p(T, A.exp + .1, .8, eback), sw = Math.sin(T * 2.2) * .08; ctx.save(); ctx.translate(790, 780 + 0); ctx.rotate(.25 + sw); ctx.globalAlpha *= clamp(k * 1.4); ctx.scale(k, k);
        ctx.strokeStyle = '#d7dbe6'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -140); ctx.lineTo(0, 0); ctx.stroke(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; rr(ctx, -150, 0, 300, 190, 22); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#d42a2a'; rr(ctx, -150, 0, 300, 56, [22, 22, 0, 0]); ctx.fill(); ctx.fillStyle = '#9aa3b4'; ctx.beginPath(); ctx.arc(0, 28, 10, 0, 7); ctx.fill();
        txt(ctx, '$3,600', 0, 128, 70, '#15161a', 900, 'center', MONO); txt(ctx, 'PER KG', 0, 170, 22, '#5a6270', 800, 'center', MONO); ctx.restore();
        stamp(ctx, p(T, K.exp, .45, eback), 540, 1300, 'TOO EXPENSIVE', { col: HOT, size: 58, rot: -.05 });
      }, { cy: 1100 });
    });
  }
  // 26 in the long run: a ring of AI satellites on endless sunlight
  { const K = { run: c('long run', A.run), sl: Math.min(c('sunlight', A.run), A.land - .9) };
    add(A.run, (ctx, T) => {
      space(ctx, T, { gy: 1150, tint: '120,100,40' });
      shot(ctx, T, A.run, () => {
        const sv = p(T, K.run, .8); sun(ctx, T, 170, 700, 64, sv); earth(ctx, T, 540, 1200, 300, {});
        const n = 14; for (let i = 0; i < n; i++) { const an = i / n * 6.28 + T * .25, R = 440 * eo(clamp((T - A.run - i * .05) / .8)), x = 540 + Math.cos(an) * R, y = 1200 + Math.sin(an) * R * .42; if (Math.sin(an) < -.25 && Math.abs(x - 540) < 300) continue;
          ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(T + i) * .06); ctx.scale(.8, .8); glowDot(ctx, 0, 0, 70, SUN_RGB, .3 * sv); ctx.restore(); miniSat(ctx, T, x, y, .55, Math.sin(T + i) * .06); }
        rays(ctx, T, 170, 700, 90, 420, sv * .6, { n: 12 });
        tag(ctx, 540, 640, 'THE LONG RUN', p(T, K.run, .5), 540, 790, { rgb: '255,205,90', size: 26 });
        pillBox(ctx, 540, 1710, 'AI RUNNING ON SUNLIGHT', p(T, K.sl, .5, eback), '255,205,90', 32);
      }, { cy: 1150 });
    });
  }
  // 27 without land, water or power from Earth
  { const K = { land: c('land', A.land), water: c('water', A.land), power: c('power', A.land) };
    add(A.land, (ctx, T) => {
      space(ctx, T, { gy: 1100, tint: '40,110,80' });
      shot(ctx, T, A.land, () => {
        const items = [['LAND', K.land, 200], ['WATER', K.water, 540], ['POWER', K.power, 880]];
        items.forEach(([lb, kt, x], i) => { const k = p(T, kt - .15, .5, eback); flip(ctx, k, x, 880, () => live(ctx, T, x, 880, { yaw: .05, bob: 6, seed: i }, () => {
          panel(ctx, x - 150, 700, 300, 360, 30); ctx.save(); ctx.translate(x, 840);
          if (i === 0) { ctx.fillStyle = '#4a9a48'; ctx.beginPath(); ctx.moveTo(-90, 40); ctx.lineTo(0, -40); ctx.lineTo(90, 40); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#8b6a3a'; ctx.fillRect(-100, 40, 200, 24); ctx.fillStyle = '#3a7a38'; ctx.beginPath(); ctx.moveTo(-40, 40); ctx.lineTo(50, -10); ctx.lineTo(110, 40); ctx.fill(); }
          else if (i === 1) { ctx.fillStyle = '#4fa3ff'; ctx.shadowColor = 'rgba(80,170,255,.8)'; ctx.shadowBlur = 24; ctx.beginPath(); ctx.moveTo(0, -80); ctx.bezierCurveTo(60, -10, 70, 20, 0, 60); ctx.bezierCurveTo(-70, 20, -60, -10, 0, -80); ctx.fill(); }
          else { ctx.fillStyle = '#ffd479'; ctx.shadowColor = 'rgba(255,210,90,.9)'; ctx.shadowBlur = 24; ctx.beginPath(); ctx.moveTo(18, -80); ctx.lineTo(-50, 14); ctx.lineTo(-6, 14); ctx.lineTo(-22, 78); ctx.lineTo(54, -24); ctx.lineTo(8, -24); ctx.closePath(); ctx.fill(); }
          ctx.restore(); txt(ctx, lb, x, 1020, 40, '#fff', 900, 'center', MONO); crossOut(ctx, p(T, kt + .1, .45), x, 850, 80); })); });
        tag(ctx, 540, 640, 'FROM EARTH', p(T, A.land + .3, .5), undefined, undefined, { rgb: '120,200,255', size: 24 });
        const e = p(T, A.land + .5, .8); sun(ctx, T, 190, 1450, 56, e); live(ctx, T, 650, 1500, { yaw: .1, bob: 8, seed: 3 }, () => sat(ctx, T, 650, 1500, .4, { sunGlow: e, dish: 0 }));
        if (e > 0) { ctx.save(); ctx.globalAlpha *= e; ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${SUN_RGB},.6)`; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.setLineDash([26, 22]); ctx.lineDashOffset = -T * 80; ctx.beginPath(); ctx.moveTo(270, 1460); ctx.lineTo(470, 1490); ctx.stroke(); ctx.restore(); }
        pillBox(ctx, 540, 1730, 'RUNS ON SUNLIGHT', e, '255,205,90', 32);
      }, { cy: 1150 });
    });
  }
  // 28 ENDING: the video was made with code, written on the satellite's own terminal and downlinked to Earth
  { const K = { code: c('code', A.crazy), comment: c('comment', A.crazy), guide: c('guide', A.crazy), yt: c('youtube', A.crazy), link: c('link', A.crazy), bio: c('bio', A.crazy) };
    const cta = Math.min(K.link, K.bio), post = K.guide + .45, tStart = A.crazy + .3, tEnd = K.code - .12;
    sfx.push({ t: A.crazy + .05, k: 'riser', g: -17 }, { t: K.code + .15, k: 'success', g: -14 }, { t: post, k: 'click', g: -11 }, { t: K.yt, k: 'swoosh', g: -16 }, { t: cta + .3, k: 'click', g: -10 });
    const CODE = [['import sun from "orbit"', '#7fd8ff'], ['chip.run(sun, "forever")', '#ffd479'], ['radiate(heat)', '#ff9f80'], ['render("9:16")', '#c9bfff'], ['// 100% code', '#7a8597']];
    const nch = CODE.reduce((a, [l]) => a + l.length, 0);
    add(A.crazy, (ctx, T) => {
      space(ctx, T, { gy: 1000, tint: '40,70,170' });
      const sw = p(T, K.yt - .1, .7, eio), pr = clamp((T - tStart) / Math.max(.4, tEnd - tStart));
      shot(ctx, T, A.crazy, () => {
        earth(ctx, T, 540, 2160, 650, {});
        const ex = 70, ey = 500, ew = 940, eh = 580, k = p(T, A.crazy, .6, eo5);
        // satellite below the terminal beams the guide down to Earth
        live(ctx, T, 540, 1330, { yaw: .06, bob: 6, seed: 6 }, () => sat(ctx, T, 540, 1330, .55, { sunGlow: .5, dish: 1, heat: .1 * (1 - pr), chips: 1 }));
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const u = (T / 1.8 + i / 3) % 1; ctx.strokeStyle = `rgba(93,224,255,${.5 * (1 - u) * p(T, K.code, .6)})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(496, 1450, 20 + u * 130, .15 * Math.PI, .85 * Math.PI); ctx.stroke(); } ctx.restore();
        flip(ctx, k, 540, ey + eh / 2, () => live(ctx, T, 540, ey + eh / 2, { yaw: .025, bob: 4, breathe: .003, seed: 4 }, () => {
          const cm = p(T, K.comment - .15, .45, eio);
          card(ctx, ex, ey, ew, eh, { r: 30, fill: sw < .5 ? '#0f121b' : '#eef6ff', dark: true, stroke: sw < .5 ? 'rgba(255,255,255,.14)' : 'rgba(47,123,255,.6)' });
          if (sw < 1) { ctx.save(); ctx.globalAlpha *= 1 - sw; ['#ff5f57', '#febc2e', '#28c840'].forEach((cc, i) => { ctx.fillStyle = cc; ctx.beginPath(); ctx.arc(ex + 38 + i * 28, ey + 36, 9, 0, 7); ctx.fill(); });
            txt(ctx, 'orbit.js', ex + ew / 2, ey + 44, 26, '#cfd6e2', 700); txt(ctx, 'FRAME ' + String(Math.floor(T * 30)).padStart(4, '0'), ex + ew - 30, ey + 44, 22, '#5de0ff', 700, 'right', MONO); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(ex, ey + 68, ew, 2);
            if (cm < 1) { ctx.save(); ctx.globalAlpha *= 1 - cm; let left = nch * pr;
              CODE.forEach(([l, col], i) => { if (left <= 0) return; const n = Math.min(l.length, Math.floor(left)); left -= l.length;
                txt(ctx, String(i + 1), ex + 36, ey + 150 + i * 78, 26, 'rgba(140,150,165,.6)', 600, 'left', MONO); txt(ctx, l.slice(0, n), ex + 84, ey + 150 + i * 78, 38, col, 600, 'left', MONO);
                if (n < l.length && Math.sin(T * 10) > 0) { ctx.fillStyle = '#fff'; ctx.fillRect(ex + 86 + tw(ctx, l.slice(0, n), 38, 600, MONO), ey + 120 + i * 78, 4, 42); } });
              ctx.restore(); }
            if (cm > 0) { ctx.save(); ctx.globalAlpha *= cm * (1 - sw); ctx.letterSpacing = '3px'; txt(ctx, 'COMMENTS', ex + 50, ey + 150, 26, 'rgba(220,226,236,.75)', 700, 'left', MONO); ctx.letterSpacing = '0px';
              rr(ctx, ex + 50, ey + 200, ew - 100, 100, 50); ctx.fillStyle = '#1b2029'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 2; ctx.stroke();
              const g2 = typed('guide', T, K.guide - .15, K.guide + .2); txt(ctx, g2 || 'Add a comment…', ex + 92, ey + 265, 44, g2 ? '#fff' : '#7a8290', g2 ? 800 : 500, 'left');
              if (T < post && g2 && Math.sin(T * 9) > 0) { ctx.fillStyle = '#fff'; ctx.fillRect(ex + 96 + tw(ctx, g2, 44, 800), ey + 228, 4, 44); }
              const ps = p(T, post, .4, eback); if (ps > 0) pop(ctx, ps, ex + ew / 2, ey + 400, () => pill(ctx, ex + ew / 2, ey + 400, 'guide  ✓ sent', { bg: GREEN, size: 36, h: 78 })); ctx.restore(); }
            ctx.restore(); }
          if (sw > 0) { ctx.save(); ctx.globalAlpha *= sw; // downlink-received card with the bio link
            ctx.letterSpacing = '5px'; txt(ctx, 'DOWNLINK RECEIVED', ex + 40, ey + 70, 28, '#1d3f9a', 800, 'left', MONO); ctx.letterSpacing = '0px'; for (let b = 0; b < 4; b++) { ctx.fillStyle = '#2f7bff'; ctx.fillRect(ex + ew - 130 + b * 24, ey + 66 - (b + 1) * 10, 14, (b + 1) * 10); }
            ctx.fillStyle = 'rgba(47,123,255,.2)'; ctx.fillRect(ex + 30, ey + 92, ew - 60, 3);
            avatar(ctx, T, ex + 150, ey + 210, 76, named); if (named) txt(ctx, 'agentsoly', ex + 260, ey + 212, 58, '#14203a', 900, 'left'); txt(ctx, 'Explainers built 100% in code', ex + 260, ey + (named ? 262 : 230), 30, '#4a5a78', 600, 'left');
            pill(ctx, ex + 60, ey + 350, '▶ YouTube', { bg: '#e62117', size: 32, h: 72, align: 'left' }); pill(ctx, ex + 320, ey + 350, '♪ TikTok', { bg: '#15161b', size: 32, h: 72, align: 'left' });
            const hl = p(T, cta + .3, .35); rr(ctx, ex + 40, ey + 430, ew - 80, 96, 20); ctx.fillStyle = `rgba(47,123,255,${.12 + .3 * hl})`; ctx.fill(); ctx.strokeStyle = `rgba(47,123,255,${.4 + .6 * hl})`; ctx.lineWidth = 3; ctx.stroke();
            txt(ctx, '🔗  Link in bio · full guide', ex + 80, ey + 492, 40, '#1d3f9a', 800, 'left'); ctx.restore(); }
        }));
        // progress bar + stamp
        const bw = 520; bar(ctx, 190, 1140, bw, 18, pr, pr >= 1 ? GREEN : '#5de0ff', 'rgba(255,255,255,.1)');
        txt(ctx, pr >= 1 ? '100% CODE ✓' : Math.floor(pr * 100) + '%', 920, 1156, 30, pr >= 1 ? MINT : '#fff', 800, 'right', MONO);
        const st = p(T, K.code, .5, eback) * (1 - p(T, K.comment - .2, .3)); stamp(ctx, st, 540, 800, 'MADE WITH CODE', { col: MINT, size: 60, rot: -.05 });
        // the guide packet flies down the beam into Earth
        const fl = clamp((T - post) / .8); if (fl > 0 && fl < 1) { const x = lerp(496, 540, eo(fl)), y = lerp(1450, 1650, eo(fl)); glowDot(ctx, x, y, 60, AI_RGB, 1 - fl * .5); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill(); }
        if (T > post + .7) { const r = (T - post - .7) / 1.2; if (r < 1) { ctx.save(); ctx.strokeStyle = `rgba(93,224,255,${.7 * (1 - r)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(540, 1660, 40 + 260 * r, 14 + 60 * r, 0, 0, 7); ctx.stroke(); ctx.restore(); } }
        if (T > K.guide - .4 && T < post + .7) { const cx = kf(T, [[K.guide - .4, 900], [post - .05, 540]]), cy = kf(T, [[K.guide - .4, 1500], [post - .05, 900]]); cursor(ctx, cx, cy, clamp(1 - Math.abs(T - post) / .12), clamp((post + .7 - T) / .3)); clickRing(ctx, 540, 900, (T - post) / .5); }
        const ly = ey + 492 - 16; if (T > cta - .4) { const cx = kf(T, [[cta - .4, 900], [cta + .25, 700]]), cy = kf(T, [[cta - .4, 1500], [cta + .25, ly]]); cursor(ctx, cx, cy, clamp(1 - Math.abs(T - cta - .3) / .1)); clickRing(ctx, 700, ly, (T - cta - .3) / .5); }
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
