// "Highway stopwatch" - how average speed cameras (ANPR) catch you even if you brake. All timing from word cues c('phrase', after).
// Everything is drawn in code (road.js + kit.js). No presenter, no user images, no creator segments.
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, hash, rr, alive, flipIn } from './lib.js';
import { FONT, MONO, txt, tw, bin, pop, card, cursor, clickRing, pill, avatar, glowDot } from './kit.js';
import { ORANGE, ORANGE_RGB, MINT, MINT_RGB, CYAN_RGB, BLUE_RGB, LAMP_RGB, PLATE, highway, speedLines, carRear, carSide, numberPlate, speedPill, camBox, speedo,
  capCard, checkBadge, bigX, limitSign, roadSign, plateOCR, routeMap, mapPin, stopwatch, ticket, radarGun, officer, reviewScreen, globe, ledSign } from './road.js';
import { tag, status } from './pump.js';

export const IMAGES = [];
const kf = (T, keys, e = eio) => {
  keys = keys.map(k => k.slice()); for (let i = 1; i < keys.length; i++) keys[i][0] = Math.max(keys[i][0], keys[i - 1][0] + .01); // cue order can differ per voice
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (T < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e((T - t0) / Math.max(1e-3, t1 - t0)); return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u); }
  return keys[keys.length - 1][1];
};
const live = (ctx, T, x, y, o, fn) => { ctx.save(); alive(ctx, T, x, y, o); fn(); ctx.restore(); };
const flip = (ctx, k, x, y, fn) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k * 1.5); flipIn(ctx, x, y, k); fn(); ctx.restore(); };
const typed = (s, T, t0, t1) => s.slice(0, Math.floor(s.length * clamp((T - t0) / Math.max(.05, t1 - t0))));
// metres travelled since t0 for a speed profile v(t) in km/h (visual scale .5 so 100 km/h reads well on screen)
const travel = (T, t0, v) => { let z = 0; for (let t = t0; t < T; t += .05) z += v(Math.min(t, T)) * Math.min(.05, T - t) / 3.6 * .5; return z; };
const dim = (ctx, a) => { if (a <= 0) return; ctx.fillStyle = `rgba(3,4,8,${a})`; ctx.fillRect(-W, -H, W * 3, H * 3); };
// big headline with dark outline
function headline(ctx, a, x, y, s, size, col = '#fff', glow = null, rot = 0) {
  pop(ctx, a, x, y, () => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.font = FONT(900, size); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(5,7,12,.88)'; ctx.lineWidth = size * .16; ctx.strokeText(s, 0, size * .35); if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 34; } ctx.fillStyle = col; ctx.fillText(s, 0, size * .35); ctx.restore(); });
}
// the chase camera: highway + red car from behind (+ optional gantry); returns the projector
function chase(ctx, T, { z, gantries = [], brake = 0, lines = 0, carY = 1640, carS = .92, camX = 0, sway = 1 } = {}) {
  const P = highway(ctx, T, { z, gantries, lines, camX });
  carRear(ctx, T, 540 + 8 * sway * Math.sin(T * .8), carY + 2 * Math.sin(T * 11), carS, { brake });
  return P;
}
// white speed card (ring gauge) used for the "under the limit at both cameras" beat
function speedCard(ctx, T, x, y, w, v, cam, col, { ok = 0, bad = 0 } = {}) {
  const h = w * 1.25; card(ctx, x - w / 2, y - h / 2, w, h, { r: 22, fill: '#fbf9f3', dark: true, stroke: null });
  rr(ctx, x - w / 2, y - h / 2, w, 70, [22, 22, 0, 0]); ctx.fillStyle = col; ctx.fill();
  txt(ctx, 'CAMERA ' + cam, x - w / 2 + 24, y - h / 2 + 48, 32, '#fff', 900, 'left'); txt(ctx, 'SPEED', x + w / 2 - 22, y - h / 2 + 46, 20, 'rgba(255,255,255,.85)', 800, 'right');
  const cy = y + 10, r = w * .3;
  ctx.lineCap = 'round'; ctx.strokeStyle = '#e4ded1'; ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(x, cy, r, Math.PI * .75, Math.PI * 2.25); ctx.stroke();
  ctx.strokeStyle = bad > .5 ? '#e0402f' : '#1ea860'; ctx.beginPath(); ctx.arc(x, cy, r, Math.PI * .75, Math.PI * (.75 + 1.5 * v / 140 * clamp(ok + .6))); ctx.stroke();
  txt(ctx, String(v), x, cy + 30, 104, '#15161a', 900); txt(ctx, 'km/h', x, cy + 76, 30, '#77736a', 700);
  txt(ctx, 'LIMIT 100', x, y + h / 2 - 36, 24, '#77736a', 800, 'center', MONO);
  if (ok > 0) checkBadge(ctx, x + w / 2 - 10, y - h / 2 + 10, 44, ok);
  if (bad > 0) checkBadge(ctx, x, cy, r * .9, bad, false);
}

export const KEYWORDS = 'speed camera highway brakes challan capturing moment 60 still radar police speeding example limit first photo plate exact floor fast 10 second brake 95 under both real game records same stamp anpr automatic recognition distance average 5 120 6 pointless whole route wrong human review country one two points gun stopwatch follow crazy code guide bio';
export const EMOJI = { challan: '🧾', stopwatch: '⏱️', code: '💻', guide: '💬', bio: '🔗' };
export const CAPTION_SFX = false;
// Hinglish voice: same scenes, cues mapped to the words it says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      brakes: 'brake', hmm: 'to bhai', 'one minute': 'ek minute', capturing: 'capture', 'that moment': 'us moment',
      'you can drive': 'tum 100', still: 'tab bhi', 'but with no radar': 'par bhai', 'how does': 'pata kaise',
      "let's understand": 'chalo', 'and you cross': 'aur tum pehle', 'first camera': 'pehle camera', 'exact time': 'exact time',
      'then you floor': 'ab tum aage', floor: 'panja', fast: 'tez', '10 kilometers': 'tez',
      'but the moment you spot': 'lekin doosra', 'second camera': 'doosra camera',
      'you think you were': 'tumhe lagta', both: 'dono', 'real game': 'asli game',
      'the first camera records': 'pehla camera', 'second camera reads': 'doosra camera wahi', 'same plate': 'wahi plate',
      'the technology': 'number plate pehchanne', 'the system knows': 'system ko pata', 'how long': 'kitna time',
      'say you covered': 'jaise tumne', '5 minutes': '5 minute', while: 'jabki', '6 minutes': '6 minute',
      'so braking': 'matlab camera', pointless: 'fayda', 'because the system': 'kyunki system', 'whole route': 'poore route',
      'and one more': 'aur ek interesting', 'read wrong': 'galat', "that's why in some": 'isliye kuch',
      'the exact process': 'exact process', 'so remember': 'to yaad', 'one second': 'ek second', 'it calculates': 'do points', 'two points': 'do points',
      'in simple words': 'simple words', stopwatch: 'stop watch', "that's why instead": 'isliye camera',
      "and here's the crazy": 'aur sabse',
    },
    keywords: 'camera highway brake challan capture moment 60 radar police speeding example limit photo plate exact panja tez 10 doosra 95 dono asli game record wahi stamp anpr automatic recognition distance average 5 120 6 fayda route galat human review country second points gun stop watch follow crazy code guide bio',
    emoji: { challan: '🧾', watch: '⏱️', code: '💻', guide: '💬', bio: '🔗' },
  },
};

export function makeScenes(c, lang = 'en') {
  const named = lang !== 'hi'; // Hindi version: profile picture only, no channel name or handle
  const list = [], sfx = [];
  const add = (start, draw) => { list.push({ start, light: false, draw }); if (start > 0) sfx.push({ t: start - .05, k: 'whoosh', g: -19 }); };
  const s = x => x - .1;
  const A = {};
  A.hold = s(c('hmm')); A.drive = s(c('you can drive', A.hold)); A.but = s(c('but with no radar', A.drive)); A.lets = s(c("let's understand", A.but));
  A.cross = s(c('and you cross', A.lets)); A.floor = s(c('then you floor', A.cross)); A.fast = s(c('fast', A.floor)); A.spot = s(c('but the moment you spot', A.fast));
  A.think = s(c('you think you were', A.spot)); A.records = s(c('the first camera records', A.think)); A.tech = s(c('the technology', A.records));
  A.system = s(c('the system knows', A.tech)); A.say = s(c('say you covered', A.system)); A.so = s(c('so braking', A.say)); A.because = s(c('because the system', A.so));
  A.one = s(c('and one more', A.because)); A.why = s(c("that's why in some", A.one)); A.exact = s(c('the exact process', A.why)); A.remember = s(c('so remember', A.exact));
  A.calc = s(c('it calculates', A.remember)); A.simple = s(c('in simple words', A.calc)); A.instead = s(c("that's why instead", A.simple)); A.crazy = s(c("and here's the crazy", A.instead));

  // 1 HOOK: chase cam at 140, you see the camera gantry and hit the brakes, "no challan now"
  { const K = { brakes: c('brakes'), challan: c('challan') };
    const v = t => kf(t, [[0, 140], [K.brakes, 140], [K.brakes + 1.3, 62]], eo);
    sfx.push({ t: .05, k: 'riser', g: -20 }, { t: K.brakes, k: 'swoosh', g: -16 });
    add(0, (ctx, T) => {
      const z = travel(T, 0, v), br = clamp((T - K.brakes) / .2) * (1 - clamp((T - K.brakes - 2.2) / .6)), shake = T > K.brakes && T < K.brakes + .4 ? 6 * Math.sin(T * 70) * (1 - (T - K.brakes) / .4) : 0;
      ctx.save(); ctx.translate(shake, 0);
      chase(ctx, T, { z, gantries: [{ d: 64 - z, label: 'CAMERA A' }], brake: br, lines: clamp((v(T) - 100) / 40) * .8 });
      ctx.restore();
      const t1 = p(T, .05, .6, eback) * (1 - p(T, K.brakes - .3, .4));
      if (t1 > 0) pop(ctx, t1, 540, 560, () => { ctx.save(); rr(ctx, 540 - 300, 515, 600, 92, 18); ctx.fillStyle = 'rgba(215,72,40,.92)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,220,200,.6)'; ctx.lineWidth = 2; ctx.stroke();
        txt(ctx, 'THE HIGHWAY STOPWATCH', 540, 562, 36, '#fff', 900); txt(ctx, 'average speed cameras, drawn in code', 540, 594, 20, 'rgba(255,235,225,.85)', 600); ctx.restore(); });
      live(ctx, T, 540, 700, { yaw: .05, bob: 6, seed: 1 }, () => speedPill(ctx, T, 540, 700, v(T), { ok: v(T) <= 100, s: 1 + .08 * p(T, K.brakes, .3) * (1 - p(T, K.brakes + .3, .3)) }));
      const ch = p(T, K.challan, .5, eback);
      if (ch > 0) live(ctx, T, 540, 880, { yaw: .08, bob: 5, seed: 3 }, () => pop(ctx, ch, 540, 880, () => pill(ctx, 540, 880, '😌  "No challan now"', { bg: 'rgba(255,255,255,.95)', fg: '#15161a', size: 34, h: 76 })));
    });
  }

  // 2 HOLD ON: the cute camera close-up; some cameras don't check your speed at that moment
  { const K = { min: c('one minute', A.hold), cap: c('capturing', A.hold), mom: c('that moment', A.hold) };
    sfx.push({ t: K.cap, k: 'glitch', g: -18 });
    add(A.hold, (ctx, T) => {
      highway(ctx, T, { z: T * 6, hy: 1250 }); dim(ctx, .25);
      const look = [Math.sin(T * 1.3) * .8, .3 + .3 * Math.sin(T * .9)], bl = Math.max(0, 1 - Math.abs(((T - A.hold) % 2.6) - 1.3) * 12);
      const y0 = kf(T, [[A.hold, 600], [A.hold + .6, 900]], eback);
      live(ctx, T, 540, y0, { yaw: .06, bob: 8, breathe: .01, seed: 2 }, () => camBox(ctx, T, 540, y0, 1.25, { look, blink: bl, mood: p(T, K.cap, .3) }));
      // a stopwatch "one minute"
      const sw = p(T, K.min, .5, eback); if (sw > 0) pop(ctx, sw, 860, 1430, () => stopwatch(ctx, T, 860, 1430, 110, 60 - clamp((T - K.min) / 6) * 6));
      // "speed at this moment?" pill crossed out
      const sp = p(T, K.cap - .3, .5, eback);
      if (sp > 0) live(ctx, T, 400, 1460, { yaw: .06, bob: 6, seed: 4 }, () => { pop(ctx, sp, 400, 1460, () => speedPill(ctx, T, 400, 1460, 60, { ok: true })); bigX(ctx, 400, 1460, 90, p(T, K.mom, .45)); });
      status(ctx, T, 540, 1660, 'NOT CHECKING SPEED HERE', ORANGE_RGB, p(T, K.mom, .45), 26);
    });
  }

  // 3 100 -> 60 right in front of the camera, still a challan
  { const K = { s60: c('60', A.drive), still: c('still', A.drive), ch: c('challan', A.drive) };
    const v = t => kf(t, [[A.drive, 100], [K.s60 - .2, 100], [K.s60 + .7, 60]], eo), flashT = K.s60 + 1.1, tk = Math.max(K.still, flashT + .6);
    const zAt = T => travel(T, A.drive, v), G = zAt(flashT) + 3.2 + 0;
    sfx.push({ t: flashT, k: 'shutter', g: -11 }, { t: tk, k: 'sweep', g: -15 });
    add(A.drive, (ctx, T) => {
      const z = zAt(T), fl = Math.max(0, 1 - Math.abs(T - flashT) / .25);
      chase(ctx, T, { z, gantries: [{ d: G - z + 3.2, label: 'CAMERA A', flash: fl, beam: clamp((T - K.s60) / .5) * (1 - clamp((T - flashT - .4) / .4)) }], brake: clamp((T - K.s60 + .2) / .2) });
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 540, 900, 1400, '255,255,255', fl * .9); ctx.restore();
      live(ctx, T, 540, 640, { yaw: .05, bob: 6, seed: 5 }, () => speedPill(ctx, T, 540, 640, v(T), { ok: true }));
      const k = p(T, tk, 1.0, eo); if (k > 0) live(ctx, T, 540, 1100, { yaw: .04, bob: 5, seed: 6 }, () => ticket(ctx, T, 540, 760, 500, k, { stamp: p(T, tk + .9, .4) }));
    });
  }

  // 4 No radar, no police officer: how does the camera know?
  { const K = { radar: c('radar', A.but), pol: c('police', A.but), how: c('how does', A.but), spd: c('speeding', A.but) };
    sfx.push({ t: K.radar + .1, k: 'glitch', g: -18 }, { t: K.how, k: 'swoosh', g: -18 });
    add(A.but, (ctx, T) => {
      highway(ctx, T, { z: T * 8, hy: 1150 }); dim(ctx, .45);
      const out = p(T, K.how - .15, .6, eio);
      [[300, 'radar', K.radar - .5, K.radar], [780, 'pol', K.pol - .4, K.pol]].forEach(([x, kind, t0, tx], i) => {
        const k = p(T, t0, .6, eo5) * (1 - out); const y = 1050 + out * 500;
        flip(ctx, k, x, y, () => live(ctx, T, x, y, { yaw: .06, bob: 7, seed: i + 2 }, () => {
          card(ctx, x - 210, y - 270, 420, 540, { r: 34, fill: '#141821', dark: true, stroke: 'rgba(255,255,255,.12)' });
          if (kind === 'radar') radarGun(ctx, T, x - 20, y - 20, .95); else officer(ctx, T, x, y - 40, .95);
          ctx.letterSpacing = '4px'; txt(ctx, kind === 'radar' ? 'RADAR' : 'POLICE', x, y + 225, 34, '#e8ecf4', 900); ctx.letterSpacing = '0px';
          bigX(ctx, x, y - 30, 130, p(T, tx + .05, .45));
        }));
      });
      const cm = p(T, K.how - .1, .7, eback);
      if (cm > 0) { const y = lerp(-300, 980, cm);
        live(ctx, T, 540, y, { yaw: .07, bob: 8, seed: 7 }, () => camBox(ctx, T, 540, y, 1.05, { look: [Math.sin(T * 2) * .9, .2], mood: .6 }));
        const q = p(T, K.how + .3, .5, eback); pop(ctx, q, 850, 640, () => live(ctx, T, 850, 640, { yaw: .25, bob: 10, seed: 3 }, () => { card(ctx, 780, 560, 140, 150, { r: 30, fill: '#fff', dark: true }); txt(ctx, '?', 850, 680, 130, '#15161a', 900); }));
        status(ctx, T, 540, 1640, 'HOW DOES IT KNOW?', CYAN_RGB, p(T, K.spd, .45), 28);
      }
    });
  }

  // 5 Example: the speed limit is 100
  { const K = { ex: c('example', A.lets), lim: c('limit', A.lets) }; K.n = c('100', K.lim);
    sfx.push({ t: K.lim, k: 'swoosh', g: -17 });
    add(A.lets, (ctx, T) => {
      const z = (T - A.lets) * 100 / 3.6 * .5;
      chase(ctx, T, { z, carS: .8, carY: 1700 });
      status(ctx, T, 540, 560, 'A SMALL EXAMPLE', CYAN_RGB, p(T, K.ex - .2, .45) * (1 - p(T, K.lim - .2, .3)), 26);
      const k = p(T, K.lim - .1, .8, eback); const y = lerp(1500, 860, k);
      if (k > 0) live(ctx, T, 800, y, { yaw: .1, bob: 6, seed: 2 }, () => limitSign(ctx, T, 800, y, 190 * (1 + .06 * p(T, K.n, .25) * (1 - p(T, K.n + .25, .3))), 100));
      const pl = p(T, K.n + .1, .5, eback); if (pl > 0) pop(ctx, pl, 330, 700, () => pill(ctx, 330, 700, 'LIMIT  100 km/h', { bg: 'rgba(220,40,30,.95)', size: 36, h: 80 }));
    });
  }

  // 6 Camera A: you pass at 100, it photographs the plate and notes the exact time
  { const K = { first: c('first camera', A.cross), photo: c('photo', A.cross), plate: c('plate', A.cross), time: c('exact time', A.cross) };
    const fT = Math.min(K.photo, K.plate) - .05, v = () => 100, G = travel(fT, A.cross, v) + 3.2;
    sfx.push({ t: fT, k: 'shutter', g: -10 }, { t: Math.max(K.time, fT + 1.6), k: 'success', g: -16 });
    add(A.cross, (ctx, T) => {
      const z = travel(T, A.cross, v), fl = Math.max(0, 1 - Math.abs(T - fT) / .25);
      chase(ctx, T, { z, gantries: [{ d: G - z + 3.2, label: 'CAMERA A', flash: fl, beam: clamp((T - K.first) / .4) }] });
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 540, 900, 1400, '255,255,255', fl * .9); ctx.restore();
      live(ctx, T, 540, 640, { yaw: .05, bob: 6, seed: 5 }, () => speedPill(ctx, T, 540, 640, 100, { ok: true, a: 1 - p(T, fT + .1, .3) }));
      const k = p(T, fT + .1, .7, eo5);
      flip(ctx, k, 540, 1020, () => live(ctx, T, 540, 1020, { yaw: .05, bob: 6, breathe: .004, seed: 6 }, () => capCard(ctx, T, 540, 1020, 560, { cam: 'A', rows: clamp((T - fT - .3) / 1.2), check: p(T, Math.max(K.time, fT + 1.6), .5), time: '22:14:05', km: 'KM 0' })));
      const hl = p(T, K.time, .4); if (hl > 0) { ctx.save(); ctx.globalAlpha = hl * (.6 + .4 * Math.sin(T * 6)); ctx.strokeStyle = MINT; ctx.lineWidth = 4; rr(ctx, 262, 1190, 556, 50, 10); ctx.restore(); }
    });
  }

  // 7a Floor it: speedometer 100 -> 140
  { const K = { fl: c('floor', A.floor) };
    sfx.push({ t: K.fl, k: 'riser', g: -17 });
    add(A.floor, (ctx, T) => {
      highway(ctx, T, { z: (T - A.floor) * 20, hy: 1400, lines: p(T, K.fl, 1) }); dim(ctx, .35);
      const v = kf(T, [[A.floor, 100], [K.fl, 100], [K.fl + 1.2, 142]], eo) + (T > K.fl + 1.2 ? 1.5 * Math.sin(T * 9) : 0);
      const sh = T > K.fl ? 3 * Math.sin(T * 47) : 0;
      live(ctx, T, 540, 1080, { yaw: .03, bob: 5, seed: 3 }, () => speedo(ctx, T, 540 + sh, 1080, 400, v, { a: p(T, A.floor, .4) }));
      const pl = p(T, K.fl + .4, .5, eback); if (pl > 0) live(ctx, T, 540, 1640, { yaw: .05, bob: 6, seed: 4 }, () => pop(ctx, pl, 540, 1640, () => pill(ctx, 540, 1640, '🔥  FLOOR IT', { bg: 'rgba(255,107,61,.95)', size: 40, h: 88 })));
    });
  }

  // 7b Drive fast for the next 10 km (side view with speed streaks)
  { const K = { km: c('10 kilometers', A.fast) };
    sfx.push({ t: A.fast + .25, k: 'whoosh', g: -15 });
    add(A.fast, (ctx, T) => {
      // night backdrop with streaking lamps
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#04060c'); g.addColorStop(.55, '#151525'); g.addColorStop(1, '#0a0a0d'); ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 9; i++) { const x = ((-T * 2600 + i * 420) % 3780 + 3780) % 3780 - 600; ctx.strokeStyle = `rgba(${LAMP_RGB},.5)`; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x, 760); ctx.lineTo(x + 380, 760); ctx.stroke(); glowDot(ctx, x + 190, 760, 220, LAMP_RGB, .35); }
      ctx.restore();
      ctx.fillStyle = '#1d1b1e'; ctx.fillRect(-W, 1440, W * 3, 600);
      ctx.fillStyle = 'rgba(255,196,60,.85)'; ctx.fillRect(-W, 1480, W * 3, 8);
      for (let i = 0; i < 8; i++) { const x = ((-T * 3200 + i * 300) % 2400 + 2400) % 2400 - 300; ctx.fillStyle = 'rgba(240,240,235,.75)'; ctx.fillRect(x, 1640, 150, 10); }
      ctx.strokeStyle = 'rgba(160,160,170,.6)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-W, 1330); ctx.lineTo(W * 2, 1330); ctx.stroke();
      for (let i = 0; i < 14; i++) { const x = ((-T * 2600 + i * 120) % 1680 + 1680) % 1680 - 300; ctx.fillStyle = 'rgba(120,120,130,.6)'; ctx.fillRect(x, 1330, 8, 80); }
      // motion streaks
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 30; i++) { const y = 600 + hash(i, 3) * 1250, x = ((-T * (3000 + 2000 * hash(i, 4)) + hash(i, 5) * 2000) % 2200 + 2200) % 2200 - 400; ctx.strokeStyle = `rgba(255,255,255,${.12 + .2 * hash(i, 6)})`; ctx.lineWidth = 2 + 2 * hash(i, 7); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 260, y); ctx.stroke(); } ctx.restore();
      live(ctx, T, 540, 1560, { yaw: .01, bob: 3, breathe: .003, seed: 2 }, () => carSide(ctx, T, 560 + 20 * Math.sin(T * 1.7), 1600 + 3 * Math.sin(T * 13), .95, { spin: 1, blur: 1 }));
      live(ctx, T, 540, 650, { yaw: .05, bob: 6, seed: 5 }, () => speedPill(ctx, T, 540, 650, 140 + 2 * Math.sin(T * 3)));
      const km = p(T, K.km - .3, .5, eback);
      if (km > 0) { const d = clamp((T - K.km + .3) / 2.2) * 10; pop(ctx, km, 540, 900, () => { card(ctx, 540 - 230, 830, 460, 140, { r: 28, fill: 'rgba(10,14,22,.9)', dark: true, stroke: 'rgba(95,227,255,.45)' });
        txt(ctx, d.toFixed(1) + ' km', 540, 925, 72, '#fff', 900, 'center', MONO); }); }
    });
  }

  // 8 Camera B: you spot it, brake, pass at 95
  { const K = { sec: c('second camera', A.spot), br: c('brake', A.spot), n95: c('95', A.spot) };
    const v = t => kf(t, [[A.spot, 140], [K.br, 140], [K.br + 1.2, 95]], eo), fT = Math.max(K.n95, K.br + 1.3) + .2, G = travel(fT, A.spot, v) + 3.2;
    sfx.push({ t: K.br, k: 'swoosh', g: -16 }, { t: fT, k: 'shutter', g: -11 });
    add(A.spot, (ctx, T) => {
      const z = travel(T, A.spot, v), fl = Math.max(0, 1 - Math.abs(T - fT) / .25), br = clamp((T - K.br) / .2);
      chase(ctx, T, { z, gantries: [{ d: G - z + 3.2, label: 'CAMERA B', flash: fl, beam: clamp((T - K.sec) / .4) }], brake: br, lines: clamp((v(T) - 100) / 40) * .7 });
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 540, 900, 1400, '255,255,255', fl * .9); ctx.restore();
      live(ctx, T, 540, 640, { yaw: .05, bob: 6, seed: 5 }, () => speedPill(ctx, T, 540, 640, v(T), { ok: v(T) <= 100, mark: p(T, fT + .2, .6) }));
    });
  }

  // 9 Under the limit at both cameras... but this is where the real game is
  { const K = { both: c('both', A.think), game: c('real game', A.think) };
    sfx.push({ t: K.game, k: 'riser', g: -16 });
    add(A.think, (ctx, T) => {
      highway(ctx, T, { z: T * 12, hy: 1300 }); dim(ctx, .4);
      const g = p(T, K.game, .5);
      [[300, 100, 'A', '#1f4fc4', A.think + .1], [780, 95, 'B', '#c8331f', A.think + .35]].forEach(([x, v, cm, col, t0], i) => {
        const k = p(T, t0, .6, eo5), y = 1000 - 40 * g;
        flip(ctx, k, x, y, () => live(ctx, T, x, y, { yaw: .07, bob: 7, seed: i * 3 }, () => { ctx.globalAlpha *= 1 - .5 * g; speedCard(ctx, T, x, y, 400, v, cm, col, { ok: p(T, K.both + i * .25, .5) }); }));
      });
      status(ctx, T, 540, 1430, 'UNDER THE LIMIT · TWICE', MINT_RGB, p(T, K.both, .45) * (1 - g), 26);
      if (g > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 540, 1500, 700, ORANGE_RGB, .4 * g); ctx.restore();
        headline(ctx, p(T, K.game, .5, eback), 540, 1500, 'THE REAL GAME', 110, ORANGE, `rgba(${ORANGE_RGB},.8)`, -.04);
        const gl = T - K.game < .35 ? 1 : 0; if (gl) { ctx.fillStyle = 'rgba(255,107,61,.25)'; for (let i = 0; i < 6; i++) ctx.fillRect(0, 1380 + hash(i, Math.floor(T * 30)) * 260, W, 6 + 10 * hash(i, 9)); } }
    });
  }

  // 10 Camera A records plate + time; Camera B reads the same plate + a second time stamp
  { const K = { b: c('second camera reads', A.records), same: c('same plate', A.records), st: c('time stamp', A.records) };
    sfx.push({ t: A.records + .3, k: 'data', g: -18 }, { t: K.same + .2, k: 'shimmer', g: -16 });
    add(A.records, (ctx, T) => {
      highway(ctx, T, { z: T * 10, hy: 1450 }); dim(ctx, .5);
      const ka = p(T, A.records + .15, .7, eo5), kb = p(T, K.b, .7, eo5), w = 470;
      flip(ctx, ka, 340, 820, () => live(ctx, T, 340, 820, { yaw: .04, bob: 6, seed: 1 }, () => capCard(ctx, T, 340, 820, w, { cam: 'A', rows: clamp((T - A.records - .4) / 1.2), time: '22:14:05', km: 'KM 0', check: p(T, A.records + 1.8, .5) })));
      flip(ctx, kb, 340, 1420, () => live(ctx, T, 340, 1420, { yaw: .04, bob: 6, seed: 2 }, () => capCard(ctx, T, 340, 1420, w, { cam: 'B', col: '#c8331f', rows: clamp((T - K.b - .2) / 1.2), time: '22:19:05', km: 'KM 10', check: p(T, K.st, .5) })));
      // MATCH arc between the two plates
      const m = p(T, K.same, .9, eio);
      if (m > 0) { const y1 = 820 + 30, y2 = 1420 + 30; ctx.save(); ctx.lineCap = 'round';
        ctx.beginPath(); const N = 40; for (let i = 0; i <= N * m; i++) { const u = i / N, x = 600 + 300 * Math.sin(u * Math.PI), y = lerp(y1, y2, u); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.strokeStyle = `rgba(${MINT_RGB},.25)`; ctx.lineWidth = 30; ctx.stroke(); ctx.strokeStyle = MINT; ctx.lineWidth = 9; ctx.shadowColor = MINT; ctx.shadowBlur = 24; ctx.stroke(); ctx.restore();
        pop(ctx, p(T, K.same + .6, .5, eback), 900, 1120, () => pill(ctx, 900, 1120, 'MATCH', { bg: 'rgba(16,140,80,.95)', size: 36, h: 76 })); }
      const st = p(T, K.st, .5, eback); if (st > 0) pop(ctx, st, 870, 1750, () => pill(ctx, 870, 1750, '⏱  +5 min', { bg: 'rgba(10,14,22,.92)', size: 32, h: 70, stroke: `rgba(${CYAN_RGB},.7)` }));
    });
  }

  // 11 ANPR: the plate is read character by character
  { const K = { anpr: c('anpr', A.tech), auto: c('automatic', A.tech) };
    sfx.push({ t: A.tech + .3, k: 'data', g: -17 }, { t: K.anpr, k: 'swoosh', g: -16 });
    add(A.tech, (ctx, T) => {
      highway(ctx, T, { z: T * 6, hy: 1500 }); dim(ctx, .55);
      const k = clamp((T - A.tech - .2) / Math.max(.8, K.anpr - A.tech - .3));
      live(ctx, T, 540, 800, { yaw: .04, bob: 6, breathe: .004, seed: 3 }, () => plateOCR(ctx, T, 540, 760, 900, k));
      const a = p(T, K.anpr, .6, eback);
      if (a > 0) { live(ctx, T, 540, 1320, { yaw: .05, bob: 6, seed: 2 }, () => { headline(ctx, a, 540, 1300, 'ANPR', 190, MINT, `rgba(${MINT_RGB},.8)`); }); }
      const e = p(T, K.auto, .6); if (e > 0) bin(ctx, e, () => { ctx.letterSpacing = '2px'; txt(ctx, 'Automatic Number Plate Recognition', 540, 1480, 42, '#e8fff4', 800); ctx.letterSpacing = '0px'; });
      live(ctx, T, 540, 1700, { yaw: .06, bob: 6, seed: 8 }, () => camBox(ctx, T, 540, 1720, .45, { look: [Math.sin(T) * .5, -.8], arm: 0, beam: 0 }));
    });
  }

  // 12 Distance + time -> average speed (route map, stopwatch, formula sign)
  { const K = { dist: c('distance', A.system), long: c('how long', A.system), avg: c('average speed', A.system) };
    sfx.push({ t: K.dist, k: 'sweep', g: -16 }, { t: K.long + .1, k: 'stopwatch', g: -15 }, { t: K.avg, k: 'swoosh', g: -17 });
    add(A.system, (ctx, T) => {
      const pr = p(T, K.dist - .2, 1.2, eio);
      const map = routeMap(ctx, T, { prog: pr, carU: pr, pins: p(T, A.system + .1, .5) });
      const mid = map(.5);
      const kl = p(T, K.dist + .6, .5, eback); if (kl > 0) pop(ctx, kl, mid[0] + 210, mid[1], () => pill(ctx, mid[0] + 210, mid[1], '10 KM', { bg: `rgba(${BLUE_RGB},.95)`, size: 40, h: 84 }));
      const sw = p(T, K.long, .6, eback); if (sw > 0) live(ctx, T, 250, 1050, { yaw: .05, bob: 6, seed: 2 }, () => pop(ctx, sw, 250, 1050, () => stopwatch(ctx, T, 250, 1050, 140, clamp((T - K.long) / 1.6) * 300)));
      const fs = p(T, K.avg, .6, eback); if (fs > 0) live(ctx, T, 540, 1640, { yaw: .03, bob: 5, seed: 4 }, () => pop(ctx, fs, 540, 1640, () => roadSign(ctx, T, 540, 1640, 920, 220, [['AVG SPEED =', 58], ['DISTANCE ÷ TIME', 58, '#ffe28a']], { posts: false })));
    });
  }

  // 13 10 km in 5 min = 120 km/h; at 100 it would take 6 min
  { const K = { m5: c('5 minutes', A.say), n120: c('120', A.say), wh: c('while', A.say), m6: c('6 minutes', A.say) };
    sfx.push({ t: K.n120, k: 'shimmer', g: -15 }, { t: K.wh + .1, k: 'sweep', g: -17 });
    add(A.say, (ctx, T) => {
      highway(ctx, T, { z: T * 14, hy: 1250 }); dim(ctx, .3);
      const l1 = typed('10 KM ÷ ' + (T >= K.m5 - .1 ? '5 MIN' : '?'), T, A.say + .1, A.say + .5), r = p(T, K.n120, .5, eback);
      live(ctx, T, 540, 760, { yaw: .03, bob: 5, seed: 1 }, () => roadSign(ctx, T, 540, 760, 940, 330, [[l1 || ' ', 84], ...(r > 0 ? [['= 120 KM/H', 92 * (.6 + .4 * r), '#ffb08a']] : [])], { posts: true }));
      // race bars: you (5 min) vs the limit (6 min)
      const k = p(T, K.wh - .1, .6, eo5);
      if (k > 0) { const y0 = 1250, run = clamp((T - K.wh) / Math.max(1.2, K.m6 - K.wh + .6));
        flip(ctx, k, 540, y0 + 170, () => live(ctx, T, 540, y0 + 170, { yaw: .04, bob: 5, seed: 3 }, () => {
          card(ctx, 90, y0, 900, 360, { r: 32, fill: 'rgba(12,15,22,.94)', dark: true, stroke: 'rgba(255,255,255,.1)' });
          [['YOU · 120 km/h', 5, ORANGE, 0], ['LIMIT · 100 km/h', 6, MINT, 1]].forEach(([lb, mins, col, i]) => {
            const yy = y0 + 90 + i * 150, f = clamp(run * 6 / mins);
            txt(ctx, lb, 140, yy, 30, '#e8ecf4', 800, 'left'); txt(ctx, (f * mins).toFixed(1) + ' min', 940, yy, 34, col, 900, 'right', MONO);
            rr(ctx, 140, yy + 24, 800, 34, 17); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill();
            ctx.save(); rr(ctx, 140, yy + 24, 800, 34, 17); ctx.clip(); rr(ctx, 140 - 34, yy + 24, 34 + 800 * f, 34, 17); ctx.fillStyle = col; ctx.fill(); ctx.restore();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(140 + 800 * f, yy + 41, 11, 0, 7); ctx.fill();
          });
        })); }
    });
  }

  // 14a Braking in front of the camera is pointless
  { const K = { pt: c('pointless', A.so) };
    sfx.push({ t: K.pt, k: 'glitch', g: -16 });
    add(A.so, (ctx, T) => {
      highway(ctx, T, { z: T * 10, hy: 1450 }); dim(ctx, .45);
      const v = kf(T, [[A.so, 112], [A.so + .8, 95]], eo);
      live(ctx, T, 540, 1050, { yaw: .03, bob: 5, seed: 3 }, () => { speedo(ctx, T, 540, 1050, 380, v); bigX(ctx, 540, 1050, 260, p(T, K.pt, .5)); });
      status(ctx, T, 540, 1610, 'BRAKING HERE = POINTLESS', ORANGE_RGB, p(T, K.pt + .1, .45), 28);
    });
  }

  // 14b ...because it looks at the average speed of your whole route
  { const K = { wr: c('whole route', A.because) };
    sfx.push({ t: K.wr, k: 'sweep', g: -15 });
    add(A.because, (ctx, T) => {
      const pr = p(T, A.because, 1.2, eio), w = p(T, K.wr, .5);
      routeMap(ctx, T, { prog: pr, carU: pr, col: w > .5 ? '255,107,61' : BLUE_RGB, glow: 1 + w });
      live(ctx, T, 540, 620, { yaw: .05, bob: 6, seed: 4 }, () => pop(ctx, p(T, A.because + .5, .5, eback), 540, 620, () => pill(ctx, 540, 620, 'AVERAGE  120 km/h', { bg: 'rgba(255,107,61,.95)', size: 40, h: 88 })));
      status(ctx, T, 540, 1820, 'THE WHOLE ROUTE COUNTS', ORANGE_RGB, w, 26);
    });
  }

  // 15a What if the plate is read wrong?
  { const K = { wr: c('read wrong', A.one) };
    sfx.push({ t: K.wr, k: 'glitch', g: -15 });
    add(A.one, (ctx, T) => {
      highway(ctx, T, { z: T * 6, hy: 1500 }); dim(ctx, .55);
      const k = clamp((T - A.one - .2) / Math.max(.8, K.wr - A.one));
      live(ctx, T, 540, 900, { yaw: .04, bob: 6, seed: 3 }, () => plateOCR(ctx, T, 540, 860, 900, k, { read: 'MH 12 A8 1234', wrong: T > K.wr - .3 ? 7 : -1 }));
      const q = p(T, K.wr + .2, .5, eback); if (q > 0) pop(ctx, q, 540, 1420, () => headline(ctx, 1, 540, 1420, 'B → 8 ?', 120, '#ff7a62', 'rgba(255,90,70,.8)'));
      status(ctx, T, 540, 600, 'ONE MORE THING', CYAN_RGB, p(T, A.one + .1, .45) * (1 - p(T, K.wr - .2, .3)), 26);
    });
  }

  // 15b Human officers review the evidence
  { const K = { hum: c('human officers', A.why), rev: c('review', A.why), ev: c('evidence', A.why) };
    sfx.push({ t: K.hum, k: 'swoosh', g: -17 }, { t: K.ev + .2, k: 'shutter', g: -12 });
    add(A.why, (ctx, T) => {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#06080e'); g.addColorStop(1, '#141018'); ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 540, 900, 800, '255,170,90', .18); ctx.restore();
      const k = p(T, A.why, .7, eo5);
      flip(ctx, k, 540, 860, () => live(ctx, T, 540, 860, { yaw: .03, bob: 5, seed: 2 }, () => reviewScreen(ctx, T, 540, 860, 900, clamp((T - A.why - .2) / 1.4), { verdict: p(T, K.ev + .2, .5) })));
      const o = p(T, K.hum - .2, .7, eback); if (o > 0) live(ctx, T, 540, 1600, { yaw: .05, bob: 6, seed: 5 }, () => { ctx.save(); ctx.translate(0, (1 - o) * 400); officer(ctx, T, 540, 1560, 1.05); ctx.restore(); });
      pop(ctx, p(T, K.rev, .5, eback), 820, 1440, () => pill(ctx, 820, 1440, '👀  HUMAN REVIEW', { bg: 'rgba(10,14,22,.92)', size: 30, h: 70, stroke: `rgba(${LAMP_RGB},.8)` }));
    });
  }

  // 16 It differs by country and system (dotted globe)
  { const K = { co: c('country', A.exact) };
    sfx.push({ t: K.co, k: 'sweep', g: -17 });
    add(A.exact, (ctx, T) => {
      ctx.fillStyle = '#03050a'; ctx.fillRect(-W, -H, W * 3, H * 3);
      for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(255,255,255,${.1 + .4 * hash(i, 2) * (.6 + .4 * Math.sin(T * 2 + i))})`; ctx.beginPath(); ctx.arc(hash(i) * W, 480 + hash(i, 1) * 1440, .8 + 1.4 * hash(i, 3), 0, 7); ctx.fill(); }
      const pins = globe(ctx, T, 540, 1150, 440, { rot: T * .25, pins: [[50, 15], [22, 78], [-25, 135], [40, -100]] });
      const labels = ['Fixed fines', 'Points', 'Human check', 'Signs first'];
      pins.forEach(([x, y, zz], i) => { const a = p(T, K.co + i * .25, .4) * clamp(zz * 3); if (a <= 0) return; mapPin(ctx, T, x, y, ['#ffb35c', '#7be6b4', '#5fe3ff', '#ff7a62'][i], null, a);
        pill(ctx, x, y - 120, labels[i], { bg: 'rgba(10,14,22,.9)', size: 24, h: 50, a, stroke: 'rgba(255,255,255,.25)' }); });
      status(ctx, T, 540, 580, 'RULES DIFFER BY COUNTRY', LAMP_RGB, p(T, A.exact + .2, .45), 26);
    });
  }

  // 17a Not your speed for one second
  { const K = { one: c('one second', A.remember) };
    sfx.push({ t: K.one + .1, k: 'glitch', g: -17 });
    add(A.remember, (ctx, T) => {
      highway(ctx, T, { z: T * 12, hy: 1400 }); dim(ctx, .4);
      const k = p(T, A.remember + .1, .6, eo5);
      flip(ctx, k, 540, 1020, () => live(ctx, T, 540, 1020, { yaw: .05, bob: 6, seed: 4 }, () => {
        card(ctx, 190, 640, 700, 760, { r: 40, fill: 'rgba(12,15,22,.94)', dark: true, stroke: 'rgba(255,255,255,.1)' });
        ctx.letterSpacing = '4px'; txt(ctx, 'SPOT SPEED', 540, 720, 30, 'rgba(220,226,236,.7)', 800); ctx.letterSpacing = '0px';
        speedo(ctx, T, 540, 1040, 250, 95);
        pill(ctx, 540, 1330, '⏱  1 SECOND', { bg: 'rgba(255,255,255,.1)', size: 32, h: 70 });
        bigX(ctx, 540, 1020, 230, p(T, K.one + .1, .5));
      }));
      status(ctx, T, 540, 1600, 'NOT THIS', ORANGE_RGB, p(T, K.one + .2, .45), 28);
    });
  }

  // 17b ...but how fast you covered the distance between two points
  { const K = { two: c('two points', A.calc) };
    sfx.push({ t: K.two, k: 'sweep', g: -16 });
    add(A.calc, (ctx, T) => {
      const pr = p(T, K.two - .2, 1.3, eio);
      const map = routeMap(ctx, T, { prog: pr, carU: pr, pins: p(T, A.calc, .4) });
      const a = map(0), b = map(1); [a, b].forEach(([x, y], i) => { const r = p(T, K.two + i * .3, .5); if (r > 0) { ctx.strokeStyle = `rgba(255,255,255,${.7 * (1 - (T * 1.2 + i * .5) % 1)})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 30 + 60 * ((T * 1.2 + i * .5) % 1), 0, 7); ctx.stroke(); } });
      live(ctx, T, 540, 600, { yaw: .05, bob: 6, seed: 2 }, () => pop(ctx, p(T, K.two + .4, .5, eback), 540, 600, () => pill(ctx, 540, 600, 'POINT A  →  POINT B', { bg: `rgba(${BLUE_RGB},.95)`, size: 38, h: 84 })));
    });
  }

  // 18 Not a speed gun on the roadside, a stopwatch for the whole highway
  { const K = { gun: c('speed gun', A.simple), sw: c('stopwatch', A.simple) };
    sfx.push({ t: K.gun + .1, k: 'glitch', g: -17 }, { t: K.sw, k: 'stopwatch', g: -14 });
    add(A.simple, (ctx, T) => {
      const P = highway(ctx, T, { z: (T - A.simple) * 14 });
      const sw = p(T, K.sw, .7, eback), gOut = p(T, K.sw - .2, .5);
      // roadside speed gun on a post (crossed out)
      if (gOut < 1) { ctx.save(); ctx.globalAlpha = 1 - gOut; live(ctx, T, 760, 1250, { yaw: .05, bob: 5, seed: 2 }, () => { ctx.fillStyle = '#2b2c33'; ctx.fillRect(800, 1250, 22, 520); radarGun(ctx, T, 780, 1220, .9); bigX(ctx, 780, 1200, 170, p(T, K.gun + .1, .45)); }); ctx.restore(); }
      if (sw > 0) { // cyan line along the whole road + the big stopwatch
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const X of [-5.2, 5.2]) { ctx.beginPath(); for (let d = 2.4; d < 500; d *= 1.08) { const q = P(X, 0, d); d === 2.4 ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]); } ctx.strokeStyle = `rgba(${CYAN_RGB},${.8 * sw})`; ctx.lineWidth = 8; ctx.shadowColor = `rgb(${CYAN_RGB})`; ctx.shadowBlur = 20; ctx.stroke(); } ctx.restore();
        live(ctx, T, 540, 1080, { yaw: .05, bob: 8, seed: 4 }, () => pop(ctx, sw, 540, 1080, () => stopwatch(ctx, T, 540, 1080, 260, (T - K.sw) * 40 + 20)));
      }
      carRear(ctx, T, 540 + 6 * Math.sin(T * .8), 1700, .75, {});
      status(ctx, T, 540, 580, 'A STOPWATCH FOR THE WHOLE HIGHWAY', CYAN_RGB, p(T, K.sw + .3, .45), 24);
    });
  }

  // 19 Just follow the speed limit
  { const K = { fol: c('follow', A.instead) };
    const G = travel(K.fol + .4, A.instead, () => 100) + 3.2;
    sfx.push({ t: K.fol, k: 'success', g: -14 });
    add(A.instead, (ctx, T) => {
      const z = travel(T, A.instead, () => 100), fl = Math.max(0, 1 - Math.abs(T - K.fol - .4) / .3);
      chase(ctx, T, { z, gantries: [{ d: G - z + 3.2, label: 'CAMERA A', beam: 1 }] });
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 540, 800, 1300, '80,255,170', fl * .5); ctx.restore();
      live(ctx, T, 540, 640, { yaw: .05, bob: 6, seed: 5 }, () => speedPill(ctx, T, 540, 640, 100, { ok: true, mark: p(T, K.fol, .6) }));
      const k = p(T, K.fol + .2, .6, eback); if (k > 0) pop(ctx, k, 540, 860, () => pill(ctx, 540, 860, '✓  FOLLOW THE LIMIT', { bg: 'rgba(16,140,80,.95)', size: 38, h: 84 }));
    });
  }

  // 20 ENDING: the gantry LED sign types this video's code, the code-o-meter hits 100, the camera reads "guide" like a plate,
  //    and the e-challan printer prints a bio pass instead of a fine.
  { const K = { code: c('code', A.crazy), comment: c('comment', A.crazy), guide: c('guide', A.crazy), yt: c('youtube', A.crazy), link: c('link', A.crazy), bio: c('bio', A.crazy) };
    const cta = Math.min(K.link, K.bio), endCode = Math.max(K.code + .3, A.crazy + 1.4), read0 = K.guide + .1;
    sfx.push({ t: A.crazy + .05, k: 'riser', g: -17 }, { t: endCode, k: 'success', g: -13 }, { t: read0 + .4, k: 'data', g: -16 }, { t: K.yt, k: 'swoosh', g: -16 }, { t: cta + .3, k: 'click', g: -11 });
    const CODE = [["const a = cam('A').read(plate)", '#7fd8ff'], ["const b = cam('B').read(plate)", '#7fd8ff'], ['const km = 10, h = (b.t - a.t) / 3600', '#ffd479'], ['const avg = km / h  // 120', '#ffb59a'], ['if (avg > LIMIT) challan(plate)', '#ff8a6a'], ["render(highway, { fps: 30 })", '#9ee6b0']];
    const total = CODE.reduce((s, l) => s + l[0].length, 0);
    add(A.crazy, (ctx, T) => {
      highway(ctx, T, { z: (T - A.crazy) * 12, hy: 1550 }); dim(ctx, .25);
      const ph2 = p(T, K.comment - .2, .6, eio), ph3 = p(T, K.yt - .15, .7, eio);
      // phase 1: LED sign typing the code + the code-o-meter
      if (ph2 < 1) { ctx.save(); ctx.globalAlpha = 1 - ph2; ctx.translate(0, -300 * eio(ph2));
        const n = Math.floor(total * clamp((T - A.crazy - .15) / Math.max(.6, endCode - A.crazy - .3))); let left = n;
        const lines = CODE.map(([l, col]) => { const s = l.slice(0, Math.max(0, left)); left -= l.length; return [s, col, 31]; });
        live(ctx, T, 540, 820, { yaw: .02, bob: 4, breathe: .003, seed: 2 }, () => {
          ctx.fillStyle = '#5c5f68'; ctx.fillRect(140, 300, 26, 260); ctx.fillRect(914, 300, 26, 260);
          ledSign(ctx, T, 540, 820, 980, 560, [['// highway-stopwatch.js', 'rgba(255,176,60,.6)', 28], ...lines]);
          if (n < total && Math.sin(T * 10) > 0) { const li = lines.findIndex(l => l[0].length < CODE[lines.indexOf(l)][0].length); const L = lines[Math.max(0, li)]; ctx.font = MONO(700, 31); ctx.fillStyle = '#ffb03c'; ctx.fillRect(86 + ctx.measureText(L[0]).width, 820 - 280 + 56 + (Math.max(0, li) + 1) * 44 - 28, 16, 32); }
        });
        const pct = clamp(n / total) * 100;
        live(ctx, T, 540, 1470, { yaw: .03, bob: 5, seed: 4 }, () => speedo(ctx, T, 540, 1470, 290, pct, { limit: 100, max: 100, label: '% CODE', unit: Math.round(pct) + '%' }));
        const st = p(T, endCode, .5, eback); if (st > 0) pop(ctx, st, 860, 1240, () => pill(ctx, 860, 1240, '100% CODE', { bg: 'rgba(16,140,80,.95)', size: 36, h: 80 }), -.3);
        ctx.restore(); }
      // phase 2: the camera reads the comment "guide" like a number plate
      if (ph2 > 0 && ph3 < 1) { ctx.save(); ctx.globalAlpha = ph2 * (1 - ph3); ctx.translate(0, 200 * (1 - eio(ph2)) - 300 * eio(ph3));
        const look = [0, .9];
        live(ctx, T, 540, 700, { yaw: .05, bob: 6, seed: 3 }, () => camBox(ctx, T, 540, 700, .9, { look, beam: p(T, K.guide, .4) * (1 - p(T, read0 + 1.4, .4)) }));
        const y = 1240; live(ctx, T, 540, y, { yaw: .03, bob: 4, seed: 6 }, () => {
          rr(ctx, 140, y - 70, 800, 140, 70); ctx.fillStyle = '#f6f5ef'; ctx.fill(); ctx.strokeStyle = '#121214'; ctx.lineWidth = 6; ctx.stroke();
          const g2 = typed('guide', T, K.guide - .15, K.guide + .25); txt(ctx, g2 || 'Add a comment…', 200, y + 22, 64, g2 ? '#121214' : '#8a8a86', g2 ? 900 : 500, 'left', g2 ? MONO : FONT);
          if (g2.length < 5 && Math.sin(T * 9) > 0) { ctx.fillStyle = '#121214'; ctx.fillRect(206 + tw(ctx, g2, 64, 900, MONO), y - 30, 5, 64); }
          ctx.letterSpacing = '3px'; txt(ctx, 'COMMENT', 200, y - 86, 24, 'rgba(230,236,245,.75)', 800, 'left', MONO); ctx.letterSpacing = '0px';
        });
        const rd = p(T, read0, .5); if (rd > 0) { const by = 1420; bin(ctx, rd, () => { rr(ctx, 190, by, 700, 120, 18); ctx.fillStyle = 'rgba(6,20,14,.9)'; ctx.fill(); ctx.strokeStyle = 'rgba(80,255,170,.6)'; ctx.lineWidth = 3; ctx.stroke();
          ctx.letterSpacing = '3px'; txt(ctx, 'ANPR READ', 222, by + 38, 22, 'rgba(120,255,190,.75)', 700, 'left', MONO); ctx.letterSpacing = '0px';
          txt(ctx, typed('GUIDE', T, read0 + .1, read0 + .6), 222, by + 98, 54, '#8affc8', 800, 'left', MONO); }); checkBadge(ctx, 860, by + 20, 40, p(T, read0 + .7, .5)); }
        ctx.restore(); }
      // phase 3: the challan printer prints a bio pass
      if (ph3 > 0) { const k = clamp((T - K.yt + .1) / 1.1), hl = p(T, cta + .3, .35);
        live(ctx, T, 540, 1100, { yaw: .03, bob: 5, breathe: .003, seed: 5 }, () => ticket(ctx, T, 540, 600, 760, eo(k), { body: (c2, x, y, w, h) => {
          rr(c2, x + 40, y + 40, w - 80, 86, 16); c2.fillStyle = '#1f7a4a'; c2.fill(); txt(c2, named ? 'BIO PASS · NOT A FINE' : 'BIO PASS', x + w / 2, y + 98, 40, '#fff', 900);
          avatar(c2, T, x + w / 2, y + 260, 92, named);
          if (named) txt(c2, 'agentsoly', x + w / 2, y + 430, 58, '#15161a', 900);
          else txt(c2, 'Explainers in 100% code', x + w / 2, y + 430, 40, '#15161a', 800);
          pill(c2, x + w / 2 - 150, y + 530, '▶ YouTube', { bg: '#e62117', size: 32, h: 70 }); pill(c2, x + w / 2 + 150, y + 530, '♪ TikTok', { bg: '#0b0b0f', size: 32, h: 70 });
          rr(c2, x + 50, y + 620, w - 100, 110, 20); c2.fillStyle = `rgba(47,123,255,${.12 + .3 * hl})`; c2.fill(); c2.strokeStyle = `rgba(47,123,255,${.5 + .5 * hl})`; c2.lineWidth = 4; c2.stroke();
          txt(c2, '🔗  Link in bio · full guide', x + w / 2, y + 690, 40, '#1d3f9e', 900);
          for (let i = 0; i < 52; i++) { const bw = (1 + (hash(i, 31) * 3 | 0)) * 3; c2.fillStyle = '#17181c'; c2.fillRect(x + 60 + i * 12.4, y + 780, bw, 110); }
        } }));
        const lx = 540, ly = 600 - 950 + 950 * eo(k) + 690 - 20;
        if (T > cta - .4) { const cx = kf(T, [[cta - .4, 960], [cta + .25, lx + 160]]), cy = kf(T, [[cta - .4, 1700], [cta + .25, ly]]); cursor(ctx, cx, cy, clamp(1 - Math.abs(T - cta - .3) / .1)); clickRing(ctx, lx + 160, ly, (T - cta - .3) / .5); }
      }
    });
  }

  list.forEach((sc, i) => sc.end = list[i + 1] ? list[i + 1].start : 1e9);
  // sound hygiene: small hits >= 1.5 s apart, nothing piled on a cut whoosh
  const big = new Set(['whoosh', 'riser']); const out = []; let lastSmall = -9;
  sfx.sort((a, b) => a.t - b.t).forEach(q => {
    if (big.has(q.k)) { if (out.some(o => big.has(o.k) && Math.abs(o.t - q.t) < .6)) return; out.push(q); return; }
    if (q.t - lastSmall < 1.5 || out.some(o => o.k === 'whoosh' && Math.abs(o.t - q.t) < .35)) return; out.push(q); lastSmall = q.t;
  });
  return { scenes: list, sfx: out };
}
