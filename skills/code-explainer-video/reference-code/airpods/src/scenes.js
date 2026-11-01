// AirPods noise-cancelling explainer. All timing from word cues c('phrase', after); assets from src/assets (user PNG/SVG).
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, win, hash, GOLD, rr, label, note, ring, alive, flipIn } from './lib.js';
import { bgDark, FONT, cursor } from './art.js';
import { img } from './assets.js';
const kf = (T, keys, e = eio) => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (T < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e((T - t0) / (t1 - t0)); return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u); }
  return keys[keys.length - 1][1];
};
const txt = (ctx, s, x, y, size, col = '#fff', w = 700, align = 'center') => { ctx.fillStyle = col; ctx.font = FONT(w, size); ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); };
const live = (ctx, T, x, y, o, fn) => { ctx.save(); alive(ctx, T, x, y, o); fn(); ctx.restore(); };
const pop = (ctx, a, x, y, fn, rot = 0) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.rotate(rot * (1 - a)); ctx.scale(a, a); fn(); ctx.restore(); };
const BLUE = '90,160,255', RED = '255,80,80';
// glowing sound wave between x0..x1; amp may be negative (= flipped); jag > 0 makes it voice-like; env(u) shapes the amplitude along x
function wave(ctx, x0, x1, y, amp, { k = .028, ph = 0, col = GOLD, w = 6, a = 1, env = null, jag = 0, dash = null } = {}) {
  if (a <= 0) return;
  const path = () => { ctx.beginPath(); for (let x = x0; x <= x1; x += 3) { const u = (x - x0) / Math.max(1, x1 - x0), e = env ? env(u) : 1;
    let v = Math.sin(x * k - ph); if (jag) v = (1 - jag) * v + jag * (.6 * Math.sin(x * k * 2.9 - ph * 2.3) + .45 * Math.sin(x * k * 6.1 + ph * 3.1) * Math.sin(x * .011 - ph));
    const yy = y + amp * e * v; x === x0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } };
  ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${col},.28)`; ctx.lineWidth = w * 3.2; path(); ctx.stroke();
  ctx.strokeStyle = `rgba(${col},1)`; ctx.lineWidth = w; path(); ctx.stroke(); ctx.restore();
}
// air as particles: each dot oscillates around its rest x, so compressions travel to the right
function air(ctx, T, x0, x1, y0, y1, { amp = 18, k = .03, speed = 6, n = 420, a = 1, col = GOLD } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < n; i++) { const rx = lerp(x0, x1, hash(i, 1)), y = lerp(y0, y1, hash(i, 2)), x = rx + amp * Math.sin(rx * k - T * speed);
    const d = .5 + .5 * Math.cos(rx * k - T * speed); ctx.fillStyle = `rgba(${col},${.25 + .65 * d})`; ctx.beginPath(); ctx.arc(x, y, 2.2 + 1.6 * hash(i, 3), 0, 7); ctx.fill(); }
  ctx.restore();
}
function eardrum(ctx, x, y, h, flex, a = 1) { // membrane seen side-on, bulges with flex (-1..1)
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = 'rgba(255,225,200,.95)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y - h / 2); ctx.quadraticCurveTo(x + 46 * flex, y, x, y + h / 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,190,150,.35)'; ctx.lineWidth = 22; ctx.stroke(); ctx.restore();
}
function chip(ctx, x, y, s, T, a = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y);
  ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 6; for (let i = -3; i <= 3; i++) for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(i * s * .12, d * s * .5); ctx.lineTo(i * s * .12, d * s * .64); ctx.stroke(); ctx.beginPath(); ctx.moveTo(d * s * .5, i * s * .12); ctx.lineTo(d * s * .64, i * s * .12); ctx.stroke(); }
  rr(ctx, -s / 2, -s / 2, s, s, s * .1); const g = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2); g.addColorStop(0, '#2c3038'); g.addColorStop(1, '#121418'); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = `rgba(${GOLD},${.5 + .3 * Math.sin(T * 3)})`; ctx.lineWidth = 3; ctx.stroke();
  txt(ctx, 'CHIP', 0, 14, s * .16, '#e9e3d2', 800); ctx.restore();
}
function speaker(ctx, x, y, r, off, a = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x + off, y);
  for (let i = 5; i >= 1; i--) { ctx.fillStyle = `rgb(${40 + i * 18},${42 + i * 18},${48 + i * 18})`; ctx.beginPath(); ctx.ellipse(0, 0, r * i / 5 * .45, r * i / 5, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#d9dce2'; ctx.beginPath(); ctx.ellipse(0, 0, r * .12, r * .26, 0, 0, 7); ctx.fill(); ctx.restore();
}
const arrow = (ctx, x, y, dir, len, col, a = 1) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = ctx.fillStyle = `rgb(${col})`; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dir * len, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + dir * (len + 22), y); ctx.lineTo(x + dir * len, y - 18); ctx.lineTo(x + dir * len, y + 18); ctx.fill(); ctx.restore(); };
const cross = (ctx, x, y, r, a) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = `rgb(${RED})`; ctx.lineWidth = 14; ctx.lineCap = 'round'; const s = r * eo(a);
  ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); ctx.stroke(); ctx.restore(); };
function wall(ctx, x, y, w, h, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; for (let r = 0; r < h / 40; r++) for (let c = -1; c < w / 80 + 1; c++) { const bx = x + c * 80 + (r % 2) * 40; if (bx < x - 1 || bx + 76 > x + w + 1) continue; rr(ctx, bx, y + r * 40, 76, 36, 4); ctx.fillStyle = r % 2 ? '#7a4a3a' : '#8a5644'; ctx.fill(); } ctx.restore(); }
function avatar(ctx, T, x, y, r, named) {
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, '#1fa58f'); g.addColorStop(1, '#f2a25c'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; if (named) txt(ctx, 'a', x, y + r * .32, r * .92, '#fff', 900); else { ctx.beginPath(); ctx.arc(x, y - r * .28, r * .34, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y + r * .58, r * .6, r * .42, 0, Math.PI, 0); ctx.fill(); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(T * 1.6); const cg = ctx.createConicGradient(0, 0, 0); cg.addColorStop(0, '#f2a25c'); cg.addColorStop(.5, '#1fa58f'); cg.addColorStop(1, '#f2a25c'); ctx.strokeStyle = cg; ctx.lineWidth = r * .08; ctx.beginPath(); ctx.arc(0, 0, r * 1.16, 0, 7); ctx.stroke(); ctx.restore();
}
const logoWhite = (ctx, x, y, w, a = 1) => img(ctx, 'apple_white', x, y, w, a);

export const KEYWORDS = 'airpods engine silent blocking nowhere removing second opposite plane roar air eardrum hundreds microphone before chip flips down pushes pulls hard anti noise cancel silence perfect inside whatever 200 erase person predict voice time fit seal leaks test nothing crazy code guide bio';
export const EMOJI = { engine: '✈️', silence: '🤫', code: '💻', guide: '💬', bio: '🔗' };
export const CAPTION_SFX = false;
// Hinglish voice: same scenes, cues mapped to the words it says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      'so where': 'to phir', picture: 'sochiye', 'and sound is': 'aur sound asal', 'on the outside': 'har airpod', 'a chip': 'phir ek chip', 'where the engine': 'jahan engine',
      'apple calls': 'apple ise', 'the two waves': 'ye dono waves', 'but the copy': 'lekin ye copy', 'on the first': 'pehle airpods', "that's why": 'isliye ye plane',
      "it's also why": 'aur isliye fit', 'your iphone even': 'aapke iphone', "so your airpods aren't": 'to aapke airpods duniya', "and here's": 'aur sabse', 'if you want': 'agar aap bhi',
      'not blocking': 'block nahi', blocking: 'block', nowhere: 'kahin nahi', removing: 'hatate', adding: 'upar ek', second: 'doosra|second', listen: 'sunte', exact: 'bilkul ulta', opposite: 'ulta',
      long: 'lambi', low: 'bhaari', roar: 'awaaz', air: 'hawa', pushing: 'push', pulling: 'pull', hundreds: 'saikdon',
      tiny: 'chhota sa', hears: 'sun leta', split: 'ek pal', before: 'pehle hi', reaches: 'pahunchne', flips: 'flip', down: 'kar deti',
      pushes: 'push karta', pulls: 'pull karta', hard: 'taakat', anti: 'anti-noise', meet: 'milti', barely: 'lagbhag hilta', hear: 'sunai',
      never: 'kabhi perfect', 'second microphone': 'doosra microphone', facing: 'taraf', whatever: 'jo bhi', slips: 'bach', canceling: 'use bhi cancel', every: 'baar hota',
      erase: 'gayab', person: 'insaan', voice: 'awaaz', changes: 'badalti', flipped: 'itni tezi', leaks: 'side se', called: 'uska naam', playing: 'play kar rahe', two: 'dono', nothing: 'zero',
      whole: 'poora video', send: 'bhej',
    },
    keywords: 'airpods engine silent block kahin hatate doosra ulta plane awaaz hawa eardrum saikdon microphone pehle chip flip push pull taakat antinoise cancel silence perfect bach 200 gayab insaan predict tezi fit seal test zero crazy code guide bio',
    emoji: { engine: '✈️', silence: '🤫', code: '💻', guide: '💬', bio: '🔗' },
  },
};

export function makeScenes(c, lang = 'en') {
  const named = lang !== 'hi'; // Hindi version: profile picture only, no channel name
  const list = [], sfx = [];
  const add = (start, draw) => { list.push({ start, light: false, draw }); if (start > 0) sfx.push({ t: start - .12, k: 'whoosh', g: -17 }); };
  const s = x => x - .1;
  const A = { where: s(c('so where')), plane: s(c('picture')), air: s(c('and sound is')), mic: s(c('on the outside')), chip: s(c('a chip')), push: s(c('where the engine')),
    anti: s(c('apple calls')), cancel: s(c('the two waves')), copy: s(c('but the copy')), first: s(c('on the first')), voice: s(c("that's why")), fit: s(c("it's also why")),
    test: s(c('your iphone even')), recap: s(c("so your airpods aren't")), crazy: s(c("and here's")), guide: s(c('if you want')) };

  // 1 HOOK: engine noise -> AirPod -> eardrum goes silent; a wall? no.
  { const K = { plane: c('plane'), engine: c('engine'), silent: c('silent'), not: c('not blocking'), sound: c('sound', c('blocking')), end: A.where };
    sfx.push({ t: .05, k: 'pop', g: -14 }, { t: K.engine, k: 'riser', g: -20 }, { t: K.silent, k: 'shimmer', g: -14 }, { t: K.not, k: 'shutter', g: -14 }, { t: K.not + .5, k: 'glitch', g: -16 });
    add(0, (ctx, T) => {
      bgDark(ctx);
      const z = kf(T, [[0, 1.12], [K.silent, 1], [K.end, 1.04]]); ctx.save(); ctx.translate(540, 1050); ctx.scale(z, z); ctx.translate(-540, -1050);
      live(ctx, T, 200, 1050, { yaw: .12, bob: 8 }, () => img(ctx, 'window2', 200, 1050, 300 * lerp(.6, 1, p(T, 0, .5, eback))));
      const quiet = p(T, K.silent, .7);
      wave(ctx, 330, 600, 1050, 70, { ph: T * 7, a: p(T, .2, .4) });
      wave(ctx, 600, 980, 1050, 70 * (1 - quiet), { ph: T * 7, a: p(T, .2, .4), env: u => 1 - .3 * u });
      if (quiet > .5) wave(ctx, 600, 980, 1050, 70 * quiet, { ph: T * 7 + Math.PI, col: BLUE, a: .5 * win(T, K.silent, K.silent + 1.2, .3) });
      eardrum(ctx, 990, 1050, 240, Math.sin(T * 7 - 990 * .028) * (1 - quiet));
      const by = lerp(1700, 1050, p(T, 0, .7, eback)); live(ctx, T, 600, by, { yaw: .2, bob: 10, seed: 1 }, () => img(ctx, 'bud_3q', 600, by, 250));
      label(ctx, 'ENGINE NOISE', 200, 780, p(T, K.engine - .3, .4), 200, 830, 22); label(ctx, 'EARDRUM', 960, 880, p(T, K.engine, .4), 985, 930, 22);
      wall(ctx, 700, 780, 240, 520, win(T, K.not - .1, K.end, .25) * p(T, K.not - .1, .3)); cross(ctx, 820, 1040, 140, p(T, K.not + .4, .3) * win(T, K.not, K.end, .2));
      ctx.restore();
      note(ctx, 'Illustration: sound drawn as a line', 40, H - 60, 1);
    });
  }
  // 2 WHERE: nowhere; a second sound on top; the exact opposite
  { const s0 = A.where, K = { nowhere: c('nowhere'), removing: c('removing'), adding: c('adding'), second: c('second', c('adding')), listen: c('listen'), exact: c('exact'), opp: c('opposite'), end: A.plane };
    sfx.push({ t: K.nowhere, k: 'pop', g: -10 }, { t: K.removing, k: 'tick', g: -14 }, { t: K.second, k: 'shimmer', g: -16 }, { t: K.listen, k: 'data', g: -18 }, { t: K.opp, k: 'sweep', g: -16 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const by = 820; live(ctx, T, 540, by, { yaw: .25, bob: 12, speed: 1.3 }, () => img(ctx, 'bud_3q', 540, by, lerp(300, 380, p(T, s0, .6, eback))));
      if (T > K.listen) for (let i = 0; i < 3; i++) ring(ctx, 470, 720, ((T - K.listen) * 1.2 + i * .33) % 1, BLUE, 20, 140);
      for (let i = 0; i < 6; i++) { const t = ((T - s0) * .5 + hash(i)) % 1; txt(ctx, '?', 140 + hash(i, 1) * 800, 1100 - t * 300, 60, `rgba(${GOLD},${win(T, s0, K.nowhere, .3) * (1 - t)})`, 900); }
      pop(ctx, p(T, K.nowhere, .35, eback) * win(T, K.nowhere, K.adding, .3), 540, 1080, () => { ctx.strokeStyle = `rgb(${RED})`; ctx.lineWidth = 8; rr(ctx, -260, -70, 520, 120, 18); ctx.stroke(); txt(ctx, 'NOWHERE', 0, 18, 76, `rgb(${RED})`, 900); }, -.6);
      wave(ctx, 60, 1020, 1330, 70, { ph: T * 6 });
      label(ctx, 'ENGINE NOISE', 540, 1240, p(T, s0, .4));
      const flip = lerp(1, -1, p(T, K.opp, .9, eio)), b = p(T, K.second - .2, .7);
      wave(ctx, 60, 1020, 1560, 70 * flip * b, { ph: T * 6, col: BLUE, a: b });
      label(ctx, T > K.opp ? 'EXACT OPPOSITE' : 'SECOND SOUND', 540, 1470, b, undefined, undefined, 24);
      if (T > K.removing && T < K.adding) { const a = p(T, K.removing, .3); ctx.strokeStyle = `rgba(${RED},${a})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(80, 1330); ctx.lineTo(lerp(80, 1000, a), 1330); ctx.stroke(); txt(ctx, 'not removed', 540, 1430, 40, `rgba(255,255,255,${a})`, 700); }
    });
  }
  // 3 PLANE: window, engine roar rings, one long low wave
  { const s0 = A.plane, K = { plane: c('plane', s0), engine: c('engine', s0), long: c('long'), low: c('low'), roar: c('roar'), end: A.air };
    sfx.push({ t: K.engine, k: 'riser', g: -18 }, { t: K.roar, k: 'sweep', g: -14 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const z = kf(T, [[s0, 1.25], [K.plane + .3, 1], [K.end, 1.12]]);
      ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000);
      live(ctx, T, 540, 1000, { yaw: .1, bob: 8 }, () => {
        flipIn(ctx, 540, 1000, p(T, s0, .7, eback)); img(ctx, 'window2', 540, 1000, 620);
        if (T > K.engine) for (let i = 0; i < 5; i++) ring(ctx, 505, 1110, ((T - K.engine) * .7 + i * .2) % 1, GOLD, 40, 560);
      });
      ctx.restore();
      const rev = p(T, K.long, 1.4, x => x); wave(ctx, 60, lerp(60, 1020, rev), 1640, 60, { k: .012, ph: T * 3 });
      label(ctx, 'ONE LONG, LOW ROAR', 540, 1560, p(T, K.low, .4));
      note(ctx, 'Not to scale', 40, H - 60, 1);
    });
  }
  // 4 AIR: particles push and pull the eardrum, hundreds of times a second
  { const s0 = A.air, K = { air: c('air'), push: c('pushing'), pull: c('pulling'), drum: c('eardrum'), hund: c('hundreds'), sec: c('second', c('hundreds')), end: A.mic };
    sfx.push({ t: K.air, k: 'shimmer', g: -18 }, { t: K.drum, k: 'pop', g: -14 }, { t: K.hund, k: 'stopwatch', g: -16 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      live(ctx, T, 540, 720, { yaw: .08, bob: 6 }, () => { flipIn(ctx, 540, 720, p(T, s0, .6, eback)); img(ctx, 'ear2', 540, 720, 700); });
      const sp = lerp(4, 9, p(T, K.hund, 1.2));
      air(ctx, T, 80, 820, 960, 1440, { a: p(T, K.air - .2, .5), speed: sp });
      label(ctx, 'AIR', 300, 940, p(T, K.air, .4), 300, 980, 24);
      eardrum(ctx, 860, 1200, 420, Math.sin(820 * .03 - T * sp) * p(T, K.drum - .5, .5), p(T, K.drum - .3, .4));
      label(ctx, 'EARDRUM', 900, 940, p(T, K.drum, .4), 870, 1000, 24);
      if (T > K.push) arrow(ctx, 640, 1500, 1, 120, GOLD, win(T, K.push, K.pull + .4, .2)); if (T > K.pull) arrow(ctx, 820, 1560, -1, 120, BLUE, win(T, K.pull, K.hund, .2));
      if (T > K.hund) { const n = Math.round(lerp(30, 330, p(T, K.hund, 1.4, eio))), a = p(T, K.hund, .3);
        rr(ctx, 120, 1620, lerp(20, 700, n / 330), 50, 12); ctx.fillStyle = `rgba(${GOLD},${a})`; ctx.fill(); txt(ctx, String(n), 960, 1665, 64, `rgba(255,255,255,${a})`, 900, 'right'); txt(ctx, 'pushes in 1 second', 120, 1720, 28, `rgba(207,214,226,${a})`, 600, 'left'); }
      note(ctx, 'Illustrative · slowed down', 40, H - 60, 1);
    });
  }
  // 5 MIC: outer microphone hears the roar a split second before your ear
  { const s0 = A.mic, K = { pod: c('airpod'), tiny: c('tiny'), mic: c('microphone'), hears: c('hears'), split: c('split'), before: c('before'), reach: c('reaches'), end: A.chip };
    sfx.push({ t: K.mic, k: 'pop', g: -12 }, { t: K.hears, k: 'data', g: -18 }, { t: K.split, k: 'tick', g: -12 }, { t: K.reach, k: 'tick', g: -14 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const z = kf(T, [[s0, .8], [K.pod, 1], [K.mic, 1.35], [K.split - .2, 1.35], [K.split + .4, 1]]), cx = 600, cy = 1000;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy);
      wave(ctx, 40, 470, 870, 50, { ph: T * 6, a: p(T, K.hears - .6, .4), env: u => clamp(u * 3) });
      live(ctx, T, cx, cy, { yaw: .14, bob: 8 }, () => { img(ctx, 'bud_left', cx, cy, 520); const mx = cx - 44, my = cy - 210;
        ctx.fillStyle = `rgba(${GOLD},${.35 + .35 * Math.sin(T * 6)})`; ctx.beginPath(); ctx.arc(mx, my, 34 * p(T, K.mic, .3, eback), 0, 7); ctx.fill();
        if (T > K.hears) ring(ctx, mx, my, ((T - K.hears) * 1.4) % 1, GOLD, 20, 120);
        label(ctx, 'OUTER MICROPHONE', mx - 60, my - 140, p(T, K.mic, .4), mx, my - 30, 22); });
      ctx.restore();
      const tl = p(T, K.split - .3, .5); if (tl > 0) { ctx.save(); ctx.globalAlpha = tl; const y = 1620; ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(140, y); ctx.lineTo(940, y); ctx.stroke();
        const m1 = 320, m2 = lerp(320, 760, p(T, K.before, .8)); ctx.fillStyle = `rgb(${GOLD})`; ctx.beginPath(); ctx.arc(m1, y, 16, 0, 7); ctx.fill(); txt(ctx, 'mic hears', m1, y - 34, 28, '#fff', 700);
        ctx.fillStyle = '#ff9f80'; ctx.beginPath(); ctx.arc(m2, y, 16, 0, 7); ctx.fill(); txt(ctx, 'ear hears', m2, y + 60, 28, '#fff', 700);
        txt(ctx, 'a split second', (m1 + m2) / 2, y - 80, 32, `rgb(${GOLD})`, 800); ctx.restore(); }
      note(ctx, 'Magnified illustration', 40, H - 60, 1);
    });
  }
  // 6 CHIP: the wave goes in, comes out upside down
  { const s0 = A.chip, K = { chip: c('chip'), wave: c('wave'), flips: c('flips'), down: c('down'), end: A.push };
    sfx.push({ t: K.chip, k: 'pop', g: -12 }, { t: K.wave, k: 'data', g: -18 }, { t: K.flips, k: 'gear', g: -14 }, { t: K.down, k: 'success', g: -16 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      wave(ctx, 40, 360, 1050, 80, { ph: T * 6, a: p(T, K.wave - .3, .4) });
      const f = lerp(1, -1, p(T, K.flips, 1, eio)); wave(ctx, 720, 1040, 1050, 80 * f, { ph: T * 6, col: f < 0 ? BLUE : GOLD, a: p(T, K.wave + .2, .4) });
      live(ctx, T, 540, 1050, { yaw: .18, bob: 10 }, () => { flipIn(ctx, 540, 1050, p(T, s0, .6, eback)); chip(ctx, 540, 1050, 300 * p(T, K.chip - .3, .5, eback), T); });
      if (T > K.flips) { ctx.save(); ctx.translate(880, 820); ctx.rotate(T * 3); ctx.strokeStyle = `rgba(${BLUE},.9)`; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 46, .3, 5.4); ctx.stroke(); ctx.restore(); }
      label(ctx, 'NOISE IN', 200, 900, p(T, K.wave, .4)); label(ctx, 'FLIPPED OUT', 880, 1260, p(T, K.down - .2, .4));
      note(ctx, 'Illustration', 40, H - 60, 1);
    });
  }
  // 7 PUSH / PULL: speaker answers the engine with equal force
  { const s0 = A.push, K = { pushes: c('pushes'), spk: c('speaker'), pulls: c('pulls'), hard: c('hard'), end: A.anti };
    sfx.push({ t: K.pushes, k: 'swoosh', g: -16 }, { t: K.pulls, k: 'swoosh', g: -16 }, { t: K.hard, k: 'tick', g: -12 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      air(ctx, T, 60, 560, 820, 1280, { amp: 24, speed: 6 });
      const osc = Math.sin(T * 6), on = p(T, K.spk - .3, .5);
      live(ctx, T, 780, 1050, { yaw: .12, bob: 6 }, () => speaker(ctx, 780, 1050, 240 * on, 30 * osc * p(T, K.pulls, .4), on));
      label(ctx, 'SPEAKER', 780, 760, p(T, K.spk, .4));
      arrow(ctx, 300, 1400, 1, 150, GOLD, p(T, K.pushes, .3)); txt(ctx, 'ENGINE PUSHES', 370, 1480, 32, `rgba(${GOLD},${p(T, K.pushes, .3)})`, 800);
      arrow(ctx, 860, 1560, -1, 150, BLUE, p(T, K.pulls, .3)); txt(ctx, 'SPEAKER PULLS', 790, 1640, 32, `rgba(${BLUE},${p(T, K.pulls, .3)})`, 800);
      const h = p(T, K.hard, .6, eback); if (h > 0) { rr(ctx, 140, 1700, 380 * h, 34, 10); ctx.fillStyle = `rgb(${GOLD})`; ctx.fill(); rr(ctx, 560, 1700, 380 * h, 34, 10); ctx.fillStyle = `rgb(${BLUE})`; ctx.fill(); txt(ctx, '= just as hard', 540, 1790, 36, `rgba(255,255,255,${clamp(h)})`, 800); }
      note(ctx, 'Sound shown in colour, invisible in air', 40, H - 60, 1);
    });
  }
  // 8 ANTI-NOISE: Apple's name for the flipped sound
  { const s0 = A.anti, K = { apple: c('apple', s0), anti: c('anti'), end: A.cancel };
    sfx.push({ t: K.apple, k: 'shimmer', g: -16 }, { t: K.anti, k: 'pop', g: -10 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      live(ctx, T, 540, 820, { yaw: .4, bob: 12, speed: 1.2 }, () => logoWhite(ctx, 540, 820, 240 * p(T, s0, .6, eback), p(T, s0, .3)));
      const a = p(T, K.anti, .5, eback);
      pop(ctx, a, 540, 1180, () => { const g = ctx.createLinearGradient(-330, 0, 330, 0); g.addColorStop(0, `rgb(${GOLD})`); g.addColorStop(1, `rgb(${BLUE})`); ctx.fillStyle = g; ctx.font = FONT(900, 130); ctx.textAlign = 'center'; ctx.fillText('anti-noise', 0, 40); }, -.4);
      txt(ctx, 'the flipped copy of the noise', 540, 1290, 34, `rgba(207,214,226,${p(T, K.anti + .3, .4)})`, 600);
      wave(ctx, 60, 1020, 1520, 60, { ph: T * 6, a: .9 }); wave(ctx, 60, 1020, 1520, -60, { ph: T * 6, col: BLUE, a: p(T, K.anti, .5) });
    });
  }
  // 9 CANCEL: two waves meet, sum goes flat, eardrum barely moves -> silence
  { const s0 = A.cancel, K = { meet: c('meet'), cancel: c('cancel'), drum: c('eardrum', s0), barely: c('barely'), hear: c('hear', c('barely')), sil: c('silence'), end: A.copy };
    sfx.push({ t: K.meet, k: 'swoosh', g: -16 }, { t: K.cancel, k: 'shimmer', g: -14 }, { t: K.sil, k: 'success', g: -14 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const m = p(T, K.meet - .3, .8), cc = p(T, K.cancel, 1, eio), ph = T * 6;
      wave(ctx, lerp(-400, 60, m), lerp(560, 1020, m), 820, 60, { ph }); wave(ctx, lerp(520, 60, m), lerp(1480, 1020, m), 1000, -60 * cc - 60 * (1 - cc) * .3, { ph, col: BLUE });
      txt(ctx, '+', 540, 940, 60, '#fff', 800); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(140, 1090, 800, 3);
      const res = 60 * (1 - cc * .97); wave(ctx, 60, 900, 1220, res * m, { ph, col: '235,235,240', w: 5 });
      label(ctx, 'WHAT REACHES YOUR EAR', 480, 1330, p(T, K.meet, .4));
      eardrum(ctx, 960, 1220, 260, Math.sin(ph - 900 * .028) * (res / 60), p(T, K.drum - .3, .4)); label(ctx, 'EARDRUM', 960, 1430, p(T, K.drum, .4));
      if (T > K.barely) txt(ctx, 'barely moves', 540, 1520, 44, `rgba(255,255,255,${p(T, K.barely, .4)})`, 800);
      const sa = p(T, K.sil - .2, .5, eback); pop(ctx, sa, 540, 1680, () => { rr(ctx, -330, -60, 660, 120, 60); ctx.fillStyle = '#1d2027'; ctx.fill();
        ['Transparency', 'Adaptive', 'Noise Cancellation'].forEach((n, i) => { const x = -220 + i * 220, on = i === 2; if (on) { ctx.fillStyle = '#2f8cff'; ctx.beginPath(); ctx.arc(x, -10, 36, 0, 7); ctx.fill(); } txt(ctx, on ? '🤫' : '◯', x, 2, 30, '#fff', 700); txt(ctx, n, x, 48, 18, on ? '#fff' : '#9aa0aa', 600); }); });
    });
  }
  // 10 INNER MIC: the copy is never perfect; a second mic inside catches what slips through
  { const s0 = A.copy, K = { never: c('never'), second: c('second microphone'), facing: c('facing'), whatever: c('whatever'), slips: c('slips'), canc: c('canceling'), end: A.first };
    sfx.push({ t: K.never, k: 'glitch', g: -18 }, { t: K.second, k: 'pop', g: -12 }, { t: K.slips, k: 'data', g: -18 }, { t: K.canc, k: 'success', g: -16 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const cx = 420, cy = 1050, z = kf(T, [[s0, 1], [K.second, 1.25], [K.end, 1.3]]);
      ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy);
      live(ctx, T, cx, cy, { yaw: .12, bob: 8 }, () => { img(ctx, 'earbud_side', cx, cy, 560); const mx = cx + 230, my = cy - 110;
        const a = p(T, K.second, .3, eback); ctx.fillStyle = `rgba(${BLUE},${.5 * a + .3 * a * Math.sin(T * 6)})`; ctx.beginPath(); ctx.arc(mx, my, 30 * a, 0, 7); ctx.fill();
        if (T > K.facing) for (let i = 0; i < 2; i++) ring(ctx, mx, my, ((T - K.facing) * 1.2 + i * .5) % 1, BLUE, 16, 110);
        label(ctx, 'INNER MICROPHONE', mx - 40, my - 200, p(T, K.second, .4), mx, my - 30, 22); });
      ctx.restore();
      const left = p(T, K.never, .4) * (1 - p(T, K.canc, .8, eio)); wave(ctx, 640, 1040, 1500, 26 * left + 2, { ph: T * 9, col: RED, jag: .5, a: p(T, K.never - .2, .3) });
      label(ctx, T > K.canc ? 'CANCELLED TOO' : 'LEFTOVER NOISE', 840, 1420, p(T, K.never, .4));
      note(ctx, 'Magnified illustration', 40, H - 60, 1);
    });
  }
  // 11 200x: corrected 200 times every second (Apple, first AirPods Pro)
  { const s0 = A.first, K = { pro: c('pro'), apple: c('apple', s0), n: c('200'), every: c('every', c('200')), end: A.voice };
    sfx.push({ t: K.pro, k: 'pop', g: -12 }, { t: K.n, k: 'riser', g: -18 }, { t: K.every, k: 'success', g: -14 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const a = p(T, s0, .6, eback);
      live(ctx, T, 360, 950, { yaw: .3, bob: 14, seed: 1 }, () => img(ctx, 'bud_right', 360, 950, 300 * a));
      live(ctx, T, 720, 930, { yaw: .3, bob: 14, seed: 3 }, () => img(ctx, 'bud_left', 720, 930, 300 * a));
      const t = p(T, K.pro - .2, .4); logoWhite(ctx, 380, 650, 44, t); txt(ctx, 'AirPods Pro · 2019', 420, 665, 34, `rgba(255,255,255,${t})`, 700, 'left');
      if (T > K.n - .3) { const n = Math.round(200 * p(T, K.n - .3, 1, eio)), b = p(T, K.n - .3, .3);
        ctx.save(); ctx.translate(540, 1420); ctx.rotate(T * 4); ctx.strokeStyle = `rgba(${GOLD},${.8 * b})`; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, 200, 0, 5.3); ctx.stroke(); ctx.restore();
        txt(ctx, String(n), 540, 1460, 150, `rgba(255,255,255,${b})`, 900); txt(ctx, 'times per second', 540, 1520, 32, `rgba(207,214,226,${b})`, 600); }
      note(ctx, 'Apple, 2019 · first AirPods Pro', 40, H - 60, 1);
    });
  }
  // 12 VOICE: a steady engine is easy to predict; a voice changes too fast
  { const s0 = A.voice, K = { erase: c('erase'), person: c('person'), steady: c('steady'), predict: c('predict'), voice: c('voice', c('predict')), changes: c('changes'), time: c('time', c('flipped')), end: A.fit };
    sfx.push({ t: K.erase, k: 'shimmer', g: -16 }, { t: K.person, k: 'pop', g: -12 }, { t: K.predict, k: 'success', g: -16 }, { t: K.changes, k: 'glitch', g: -16 }, { t: K.time, k: 'tick', g: -12 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const ph = T * 5;
      live(ctx, T, 190, 830, { yaw: .1, bob: 6 }, () => img(ctx, 'window2', 190, 830, 190));
      const gone = p(T, K.erase, .8); wave(ctx, 330, 1020, 820, 60 * (1 - .9 * gone), { ph }); wave(ctx, 330, 1020, 820, 60 * (1 - .9 * gone), { ph, col: BLUE, dash: [14, 12], a: p(T, K.steady, .4) });
      if (T > K.predict) txt(ctx, '✓ easy to predict', 680, 960, 38, `rgba(120,230,140,${p(T, K.predict, .4)})`, 800);
      const pa = p(T, K.person - .2, .5, eback);
      live(ctx, T, 190, 1340, { yaw: .1, bob: 6, seed: 2 }, () => { if (pa <= 0) return; ctx.save(); ctx.beginPath(); ctx.arc(190, 1340, 120 * pa, 0, 7); ctx.clip(); img(ctx, 'person2', 175, 1340 + 120 * pa, 300 * pa); ctx.restore(); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(190, 1340, 120 * pa, 0, 7); ctx.stroke(); });
      const va = p(T, K.person, .4); wave(ctx, 330, 1020, 1340, 70, { ph: ph * 1.6, k: .035, jag: .8, col: '255,170,120', a: va });
      wave(ctx, 330, 1020, 1340, 70, { ph: ph * 1.6 - 1.4, k: .035, jag: .8, col: BLUE, dash: [14, 12], a: p(T, K.changes, .4) });
      if (T > K.time - .2) cross(ctx, 900, 1340, 70, p(T, K.time - .2, .3)); if (T > K.changes) txt(ctx, 'changes too fast', 680, 1500, 38, `rgba(255,140,120,${p(T, K.changes, .4)})`, 800);
      label(ctx, 'ENGINE', 190, 655, p(T, s0, .4)); label(ctx, 'VOICE', 190, 1520, pa);
      note(ctx, 'Illustrative · dashed = the chip\'s guess', 40, H - 60, 1);
    });
  }
  // 13 FIT: tip must seal the ear canal, or noise leaks around it
  { const s0 = A.fit, K = { fit: c('fit'), tip: c('tip'), seal: c('seal'), leaks: c('leaks'), end: A.test };
    sfx.push({ t: K.fit, k: 'pop', g: -12 }, { t: K.seal, k: 'tick', g: -12 }, { t: K.leaks, k: 'sweep', g: -16 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const gap = p(T, K.seal, .6, eio);
      ctx.save(); ctx.fillStyle = '#d9a48a'; ctx.beginPath(); ctx.moveTo(0, 700); ctx.lineTo(1080, 700); ctx.lineTo(1080, 960); ctx.bezierCurveTo(800, 960, 700, 990, 560, 980); ctx.lineTo(560, 940); ctx.bezierCurveTo(400, 900, 200, 880, 0, 900); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, 1500); ctx.lineTo(1080, 1500); ctx.lineTo(1080, 1180); ctx.bezierCurveTo(800, 1180, 700, 1150, 560, 1160); ctx.lineTo(560, 1210); ctx.bezierCurveTo(400, 1260, 200, 1280, 0, 1270); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#4a1f1a'; ctx.fillRect(560, 975, 520, 190); eardrum(ctx, 1000, 1070, 190, Math.sin(T * 6) * gap * .6);
      const by = lerp(1060, 1010, gap); live(ctx, T, 400, by, { yaw: .05, bob: 4 }, () => img(ctx, 'earbud_side', 400, by, 560));
      if (gap > .2) { ctx.strokeStyle = `rgba(${RED},${gap})`; ctx.lineWidth = 5; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.ellipse(590, 1175, 70, 26, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
      if (T > K.leaks - .3) { const a = p(T, K.leaks - .3, .5); ctx.save(); ctx.globalAlpha = a; for (let i = 0; i < 70; i++) { const u = ((T - K.leaks) * .45 + hash(i)) % 1, x = lerp(80, 980, u), y = u < .55 ? lerp(1360, 1180, u / .55) + 20 * Math.sin(i) : 1070 + 70 * Math.sin(i * 1.7) * (1 - u);
        ctx.fillStyle = `rgba(${GOLD},${.9 * (1 - Math.abs(u - .5))})`; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); } ctx.restore(); }
      label(ctx, 'EAR TIP', 330, 1460, p(T, K.tip, .4), 420, 1230, 24); label(ctx, T > K.leaks ? 'NOISE LEAKS IN' : 'NO SEAL', 760, 1300, p(T, K.seal, .4), 610, 1190, 24);
      note(ctx, 'Not to scale', 40, H - 60, 1);
    });
  }
  // 14 TEST: iPhone settings -> Ear Tip Fit Test
  { const s0 = A.test, K = { test: c('test', s0), called: c('called'), fit: c('fit test'), end: A.recap };
    sfx.push({ t: s0 + .2, k: 'swoosh', g: -16 }, { t: K.test, k: 'click', g: -12 }, { t: K.called, k: 'swoosh', g: -16 }, { t: K.fit, k: 'success', g: -14 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const shots = [['mock_settings', s0], ['mock_noise', K.test], ['mock_fittest', K.called]];
      const focusI = T > K.called ? 2 : T > K.test ? 1 : 0;
      shots.forEach(([n, t0], i) => { const d = i - kf(T, [[s0, 0], [K.test, 0], [K.test + .5, 1], [K.called, 1], [K.called + .5, 2]]), x = 540 + d * 470, sc = i === focusI ? 1 : .8, a = p(T, t0 - .4, .5);
        live(ctx, T, x, 1150, { yaw: .1, bob: 8, seed: i }, () => { ctx.translate(x, 1150); ctx.scale(sc, sc); ctx.translate(-x, -1150); flipIn(ctx, x, 1150, a); img(ctx, n, x, 1150, 500, clamp(a) * (i === focusI ? 1 : .55)); }); });
      if (T > K.fit) { const a = p(T, K.fit, .4); [[-.23, .2], [.23, .2]].forEach(([u, v], i) => ring(ctx, 540 + u * 500, 1150 + v * 1084, ((T - K.fit) * 1.2 + i * .3) % 1, '52,199,89', 30, 120)); txt(ctx, 'Settings → AirPods → Ear Tip Fit Test', 540, 1780, 30, `rgba(255,255,255,${a})`, 700); }
    });
  }
  // 15 RECAP: not blocking the world; the two add up to nothing
  { const s0 = A.recap, K = { blocking: c('blocking', s0), playing: c('playing'), opp: c('opposite', s0), two: c('two', s0), nothing: c('nothing'), end: A.crazy };
    sfx.push({ t: K.blocking, k: 'shutter', g: -14 }, { t: K.opp, k: 'sweep', g: -16 }, { t: K.nothing, k: 'success', g: -12 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      live(ctx, T, 540, 800, { yaw: .3, bob: 14 }, () => img(ctx, 'case_closed', 540, 800, 420 * p(T, s0, .6, eback)));
      wall(ctx, 300, 1000, 480, 200, win(T, K.blocking - .1, K.playing, .2)); cross(ctx, 540, 1100, 120, win(T, K.blocking + .2, K.playing, .2));
      const ph = T * 6, m = p(T, K.two, .9, eio);
      wave(ctx, 60, 1020, lerp(1260, 1420, m), 60, { ph, a: p(T, K.playing, .4) }); wave(ctx, 60, 1020, lerp(1580, 1420, m), -60, { ph, col: BLUE, a: p(T, K.opp - .2, .4) });
      if (T > K.nothing - .2) { const a = p(T, K.nothing - .2, .5, eback); ctx.fillStyle = 'rgba(12,13,16,.85)'; ctx.fillRect(0, 1330, W, 180 * clamp(a)); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(80, 1420); ctx.lineTo(1000, 1420); ctx.stroke(); pop(ctx, a, 540, 1640, () => txt(ctx, '= 0', 0, 40, 140, '#fff', 900), -.5); }
    });
  }
  // 16 CODE: this whole video was made with code
  { const s0 = A.crazy, K = { crazy: c('crazy'), whole: c('whole'), code: c('code', c('whole')), end: A.guide };
    sfx.push({ t: K.crazy, k: 'pop', g: -12 }, { t: K.code, k: 'success', g: -14 }); for (let i = 0; i < 10; i++) sfx.push({ t: K.whole + i * .2, k: 'type', g: -24 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      live(ctx, T, 540, 1000, { yaw: .08, bob: 8 }, () => { flipIn(ctx, 540, 1000, p(T, s0, .6, eback));
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 50; rr(ctx, 60, 560, 960, 880, 24); ctx.fillStyle = '#16181d'; ctx.fill(); ctx.restore();
        ctx.fillStyle = '#22252c'; rr(ctx, 60, 560, 960, 60, [24, 24, 0, 0]); ctx.fill(); ['#ff5f57', '#febc2e', '#28c840'].forEach((cl, k) => { ctx.fillStyle = cl; ctx.beginPath(); ctx.arc(100 + k * 28, 590, 9, 0, 7); ctx.fill(); }); txt(ctx, 'scenes.js', 200, 598, 22, '#9aa0aa', 600, 'left');
        const lines = [['// every frame = a function of time', '#6a9955'], ['export function cancel(ctx, T) {', '#c586c0'], ['  const noise = wave(T);', '#9cdcfe'], ['  const anti = flip(noise);', '#9cdcfe'], ['  draw(noise + anti); // = 0', '#dcdcaa'], ['}', '#c586c0'], ['', '#fff'], ['render.js → frames → mp4', '#4ec9b0']];
        let used = 0; const typed = (T - K.crazy) * 40; ctx.font = '500 30px "Cascadia Mono", Consolas, monospace'; ctx.textAlign = 'left';
        lines.forEach(([s1, col], i) => { const n = clamp(typed - used, 0, s1.length); used += s1.length + 4; ctx.fillStyle = '#555'; ctx.fillText(String(i + 1).padStart(2), 80, 690 + i * 60); ctx.fillStyle = col; ctx.fillText(s1.slice(0, Math.floor(n)), 140, 690 + i * 60); });
        const pr = p(T, K.whole, K.code - K.whole + .6, x => x); rr(ctx, 120, 1300, 840, 26, 13); ctx.fillStyle = '#2b2e35'; ctx.fill(); rr(ctx, 120, 1300, 840 * pr, 26, 13); ctx.fillStyle = '#34c759'; ctx.fill();
        txt(ctx, pr >= 1 ? 'Rendered ✓  made with code' : 'Rendering frames…', 120, 1380, 30, '#fff', 700, 'left'); });
    });
  }
  // 17 GUIDE: comment "guide"; YouTube / TikTok -> link in bio
  { const s0 = A.guide, K = { comment: c('comment'), guide: c('guide', c('comment')), send: c('send', c('comment')), yt: c('youtube'), bio: c('bio') };
    sfx.push({ t: K.guide + .5, k: 'click', g: -12 }, { t: K.send, k: 'pop', g: -12 }, { t: K.yt, k: 'swoosh', g: -16 }, { t: K.bio, k: 'click', g: -10 }); for (let i = 0; i < 5; i++) sfx.push({ t: K.guide + i * .085, k: 'type', g: -22 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      if (T < K.yt - .1) {
        pop(ctx, p(T, s0, .5, eback), 540, 760, () => { txt(ctx, 'FULL GUIDE', 0, 0, 100, '#fff', 900); txt(ctx, 'make videos like this', 0, 64, 36, '#9aa0aa', 600); });
        live(ctx, T, 540, 1040, { yaw: .08, bob: 8 }, () => { rr(ctx, 110, 980, 860, 120, 60); ctx.fillStyle = '#23262d'; ctx.fill();
          const n = Math.floor(clamp((T - K.guide) * 12, 0, 5)); txt(ctx, n ? 'guide'.slice(0, n) : 'Add a comment…', 170, 1054, 40, n ? '#fff' : '#777', 600, 'left');
          rr(ctx, 800, 1000, 150, 80, 40); ctx.fillStyle = n >= 5 ? '#2f8cff' : '#3a3d45'; ctx.fill(); txt(ctx, 'Post', 875, 1052, 30, '#fff', 800); });
        pop(ctx, p(T, K.send, .4, eback), 540, 1300, () => txt(ctx, named ? '♥  agentsoly replied: sent ✓' : '♥  Creator replied: sent ✓', 0, 0, 36, '#ff4d6d', 700), .5);
      } else {
        ['TikTok', 'YouTube'].forEach((n, i) => pop(ctx, p(T, K.yt + .3 + i * .25, .4, eback), 340 + i * 400, 660 + 10 * Math.sin(T * 2 + i * 2), () => { rr(ctx, -160, -60, 320, 120, 30); ctx.fillStyle = i ? '#e62117' : '#111'; ctx.fill(); ctx.strokeStyle = '#444'; ctx.lineWidth = 3; ctx.stroke(); txt(ctx, n, 0, 14, 40, '#fff', 800); }, i ? .6 : -.6));
        live(ctx, T, 540, 1030, { yaw: .1, bob: 10 }, () => { flipIn(ctx, 540, 1030, p(T, K.yt, .6, eback));
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 40; rr(ctx, 110, 820, 860, 420, 36); ctx.fillStyle = '#1b1d22'; ctx.fill(); ctx.restore();
          avatar(ctx, T, 240, 940, 70, named); if (named) txt(ctx, 'agentsoly', 350, 930, 46, '#fff', 800, 'left'); txt(ctx, 'Explainers built 100% in code', 350, named ? 975 : 955, 28, '#9aa0aa', 500, 'left');
          const hl = p(T, K.bio, .4); rr(ctx, 160, 1060, 760, 100, 22); ctx.fillStyle = `rgba(47,140,255,${.15 + .35 * hl})`; ctx.fill(); ctx.strokeStyle = `rgba(47,140,255,${hl})`; ctx.lineWidth = 4; ctx.stroke();
          txt(ctx, '🔗  Full guide · link in bio', 200, 1124, 36, '#7fb6ff', 700, 'left'); });
        if (T > K.bio) cursor(ctx, kf(T, [[K.bio, 800], [K.bio + .5, 620]]), kf(T, [[K.bio, 1400], [K.bio + .5, 1120]]), T > K.bio + .5 && T < K.bio + .7 ? 1 : 0);
      }
    });
  }
  list.forEach((sc, i) => sc.end = list[i + 1] ? list[i + 1].start : 1e9);
  return { scenes: list, sfx };
}
