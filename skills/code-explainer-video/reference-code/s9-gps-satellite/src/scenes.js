// "How does your phone show your location with NO service?" - GPS explainer. All timing comes from word cues c('phrase', after).
// Drawn in code (gps.js + kit.js). User asset: the night Earth photo (src/assets/globe.png, cut to a circle). No presenter.
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, hash, rr, alive, flipIn } from './lib.js';
import { FONT, MONO, GREEN, txt, tw, bin, pop, card, cursor, clickRing, check, xmark, pill, avatar, glowDot, bar } from './kit.js';
import { GOLDC, GOLD_RGB, SKY, SKY_RGB, CYAN, CYAN_RGB, MINT, MINT_RGB, RED, RED_RGB, VIO, VIO_RGB, space, sky, tag, title, stamp, arrow, globe, youPos, youDot, sat, beam, ringsOut, orbit,
  routeAt, mapScreen, phoneX, dial, atomicClock, quartz, mountain, hiker, person, dishAnt, carTop } from './gps.js';

export const IMAGES = ['globe.png'];
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
const panel = (ctx, x, y, w, h, r = 30) => { // glossy dark glass card
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; rr(ctx, x, y, w, h, r);
  const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, 'rgba(36,44,64,.95)'); g.addColorStop(1, 'rgba(14,18,30,.95)'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
  ctx.save(); rr(ctx, x, y, w, h, r); ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
};
const phonePt = (cx, cy, s, u) => { const [dx, dy] = routeAt(u, 500, 1060); return [cx - 250 * s + dx * s, cy - 530 * s + dy * s]; };
const cloud = (ctx, T, x, y, s, a = 1, label = 'INTERNET') => {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y + 4 * Math.sin(T * 1.4)); ctx.scale(s, s); ctx.shadowColor = 'rgba(80,160,255,.6)'; ctx.shadowBlur = 40; ctx.fillStyle = '#e7f1ff';
  [[-70, 10, 52], [-10, -20, 66], [60, 0, 56], [100, 24, 36], [-100, 28, 34]].forEach(([cx, cy, r]) => { ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); }); rr(ctx, -110, 10, 230, 56, 28); ctx.fill(); ctx.shadowBlur = 0;
  ctx.letterSpacing = '3px'; txt(ctx, label, 5, 52, 26, '#2a4f9a', 800, 'center', MONO); ctx.letterSpacing = '0px'; ctx.restore();
};
// three-circle position fix. P = true spot, S = satellites. k = growth of each circle, err = extra radius (clock error)
const TP = [540, 1190], TS = [[190, 830], [900, 840], [640, 1700]];
const trilat = (ctx, T, { k = [1, 1, 1], err = 0, a = 1, satA = 1, col = GOLD_RGB, P = TP } = {}) => {
  ctx.save(); ctx.beginPath(); ctx.rect(0, 520, W, 1300); ctx.clip();
  TS.forEach((s, i) => { const r = (Math.hypot(s[0] - P[0], s[1] - P[1]) + err) * eo(k[i]); if (r < 2) return;
    ctx.globalCompositeOperation = 'lighter'; ctx.beginPath(); ctx.arc(s[0], s[1], r, 0, 7); ctx.strokeStyle = `rgba(${col},${.13 * a})`; ctx.lineWidth = 14; ctx.stroke(); ctx.strokeStyle = `rgba(${col},${.85 * a})`; ctx.lineWidth = 3.5; ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; });
  ctx.restore();
  TS.forEach((s, i) => { const ka = eback(clamp(k[i] * 2)) * satA; if (ka > 0) sat(ctx, T, s[0], s[1] - (i === 2 ? 0 : 0), .3 * ka, { rot: Math.atan2(P[1] - s[1], P[0] - s[0]) - Math.PI / 2 + .0, a: ka }); });
};

export const KEYWORDS = 'satellites signal map blue dot atomic clocks time position broadcast millisecond milliseconds 70 20,000 speed light distance distances perfect quartz 300 fourth clock error trilateration point offline network prefetching traffic stale data gnss gps navic starlink dish internet code guide bio comments india meters';
export const EMOJI = { satellites: '🛰', satellite: '🛰', phone: '📱', code: '💻', guide: '💬', bio: '🔗', signal: '📡', map: '🗺', starlink: '🌐' };
export const CAPTION_SFX = false;
// Hinglish voice: same scenes, cues mapped to the words it says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      'right now': 'is waqt', '20,000': '20,000', satellites: 'satellites', circling: 'chakkar', head: 'sar', "and they're showing": 'tumhari location', showing: 'dikha', map: 'map', 'no service': 'no service', location: 'location',
      'their signal': 'inka signal', 'far away': 'door', '70': '70', "and the signal's": 'is signal ka', "you're hiking": 'tum pahaad', network: 'network', step: 'kadam', 'blue dot': 'blue dot',
      'that dot': 'ye dot', 'your phone works': 'signal se tumhara', 'map shows': 'maps wahan', position: 'jagah', 'every satellite': 'har satellite', inside: 'andar', atomic: 'atomic',
      'each moment': 'wo har pal', 'two important': 'do important', 'what time': 'abhi kitne', where: 'kahan', 'it never listens': 'wo tumhari', never: 'nahi', broadcasting: 'bolta',
      "that's why you": 'isliye tum', friend: 'dost', millions: 'karodon', 'at once': 'saath', 'no matter': 'kitne bhi', 'one-way': 'one way', job: 'kaam',
      'when the signal': 'signal pahunchte', clock: 'ghadi', 'the signal travels': 'ye roshni', 'speed of light': 'roshni', distance: 'distance', time: 'time',
      "if your phone's": 'agar phone', perfect: 'bilkul', three: 'teen', 'but its clock': 'par uski', quartz: 'quartz', "say it's off": 'maanlo', millisecond: 'millisecond', '300': 'teen so', away: 'door',
      "that's why your phone": 'isliye phone', fourth: 'chautha', corrects: 'galti', few: 'kuch', 'finding your': 'distances se jagah', trilateration: 'trilateration', 'single point': 'ek point', 'but that only': 'par isse',
      'so with no service': 'to no service', 'your location': 'jagah mil', listens: 'sunta', 'the map is already': 'ye map pehle', already: 'pehle', "when there's network": 'network ho', roads: 'raaste', names: 'naam', fetches: 'laata',
      'but before the hike': 'par hike', downloaded: 'download', area: 'area', 'once the network': 'network jaate', drops: 'jaate', places: 'rakh',
      'downloading data': 'zaroorat se', prefetching: 'prefetching', before: 'pehle', 'but this map': 'par ye map', fresh: 'naya', last: 'aakhri', 'so an offline': 'isliye offline', traffic: 'traffic',
      'even if': 'neeche highway', jam: 'jam', 'no idea': 'pata', 'that kind': 'aise purane', stale: 'stale', 'now look up': 'ab upar', fourteenth: 'chaudhwa',
      'many new': 'kai nayi', countries: 'deshon', navic: 'navic', "that's called": 'ise kehte hain gnss', gnss: 'gnss', gps: 'gps', 'and all of it': 'aur ye sab', without: 'bina',
      'gps never': 'gps tumhare', 'starlink satellites': 'starlink ke', dish: 'dish', internet: 'internet', 'should starlink': 'india mein', comments: 'comment',
      "and here's the crazy": 'aur sabse', crazy: 'crazy', code: 'code', comment: 'comment', guide: 'guide', youtube: 'youtube', link: 'link', bio: 'bio',
    },
    keywords: 'satellites satellite signal map blue dot atomic ghadi time jagah broadcast millisecond 70 20,000 speed roshni distance distances bilkul quartz teen chautha galti trilateration point offline network prefetching traffic stale data gnss gps navic starlink dish internet code guide bio comment india meter kuch',
    emoji: { satellites: '🛰', satellite: '🛰', phone: '📱', code: '💻', guide: '💬', bio: '🔗', signal: '📡', map: '🗺', starlink: '🌐' },
  },
};

export function makeScenes(c, lang = 'en') {
  const list = [], sfx = [];
  const add = (start, draw, light = false) => { list.push({ start, light, draw }); if (start > 0) sfx.push({ t: start - .05, k: 'whoosh', g: -19 }); };
  const s = x => x - .1;
  const A = {
    map: s(c("and they're showing")), ms: s(c('their signal')), jour: s(c("and the signal's")), hike: s(c("you're hiking")), dot: s(c('that dot')), works: s(c('your phone works')),
    atom: s(c('every satellite')), two: s(c('each moment')), never: s(c('it never listens')), mill: s(c("that's why you")), one: s(c('no matter')), check: s(c('when the signal')),
    dist: s(c('the signal travels')), three: s(c("if your phone's")), quartz: s(c('but its clock')), off: s(c("say it's off")), fourth: s(c("that's why your phone")), tri: s(c('finding your')),
    where: s(c('so with no service')), fetch: s(c("when there's network")), hikeb: s(c('but before the hike')), drops: s(c('once the network')), pre: s(c('downloading data')),
    fresh: s(c('but this map')), jam: s(c('even if')), up: s(c('now look up')), many: s(c('many new')), gnss: s(c("that's called")), never2: s(c('gps never')), star: s(c('starlink satellites')),
    india: s(c('should starlink')), crazy: s(c("and here's the crazy")),
  };
  A.already = s(c('the map is already', A.where)); A.single = s(c('but that only', A.tri)); A.traffic = s(c('so an offline', A.fresh)); A.nonet = s(c('and all of it', A.gnss));

  // 1 HOOK: Earth, satellites 20,000 km overhead
  { const K = { km: c('20,000'), sats: c('satellites'), head: c('head') };
    sfx.push({ t: .02, k: 'riser', g: -21 }, { t: K.km + .1, k: 'shimmer', g: -17 });
    add(0, (ctx, T) => {
      space(ctx, T, { tint: '30,90,190', gy: 1450 });
      shot(ctx, T, 0, () => {
        const gx = 540, gy = 1500, R = 290, [yx, yy] = youPos(gx, gy, R);
        live(ctx, T, gx, gy, { yaw: .04, bob: 6, seed: 1 }, () => globe(ctx, T, gx, gy, R));
        orbit(ctx, T, gx, gy, 410, 240, { rot: -.18, a: p(T, K.sats, .6) });
        [0, 2.1, 4.2].forEach((a0, i) => { const k = p(T, K.sats + .12 * i, .5, eback), an = a0 + T * .35, ex = Math.cos(an) * 410, ey = Math.sin(an) * 240, ca = Math.cos(-.18), sa = Math.sin(-.18);
          sat(ctx, T, gx + ca * ex - sa * ey, gy + sa * ex + ca * ey, .26 * k, { rot: an + .3, a: k }); });
        const k = p(T, .1, .7, eback);
        live(ctx, T, 540, 830, { yaw: .1, bob: 6, seed: 2 }, () => sat(ctx, T, 540, 830, .6 * k, { rot: Math.sin(T * .6) * .08, glow: .5, a: k }));
        beam(ctx, T, 540, 880, yx, yy - 20, { k: p(T, K.km - .2, .9, eio), n: 3, w: 70 });
        youDot(ctx, T, yx, yy, { a: p(T, K.km, .4) });
        const dk = p(T, K.km - .1, .6); if (dk > 0) { ctx.save(); ctx.globalAlpha = dk; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(900, 850); ctx.lineTo(900, lerp(850, 1215, dk)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(880, 850); ctx.lineTo(920, 850); ctx.moveTo(880, lerp(850, 1215, dk)); ctx.lineTo(920, lerp(850, 1215, dk)); ctx.stroke(); ctx.restore(); }
        tag(ctx, 840, 1030, '~20,000 km', p(T, K.km, .5), 900, 1030, { rgb: CYAN_RGB, size: 30 });
      }, { cy: 1300 });
      title(ctx, p(T, K.head - .1, .5), 'ABOVE YOUR HEAD', 'SATELLITES CIRCLE THE EARTH', { y: 600, size: 64 });
    });
  }

  // 2 THE MAP SHOWS YOU, WITH NO SERVICE
  { const K = { loc: c('location', A.map), map: c('map', A.map), nos: c('no service', A.map) };
    sfx.push({ t: K.nos, k: 'click', g: -13 });
    add(A.map, (ctx, T) => {
      space(ctx, T, { tint: '40,80,190', gy: 1250 });
      shot(ctx, T, A.map, () => {
        const u = lerp(.18, .62, clamp((T - A.map) / 6)), [dx, dy] = phonePt(540, 1290, .85, u);
        flip(ctx, p(T, A.map + .05, .6, eo5), 540, 1290, () => live(ctx, T, 540, 1290, { yaw: .05, bob: 6, seed: 1 }, () => phoneX(ctx, T, 540, 1290, .85, { dot: u, noSvc: T >= K.nos - .05, sheet: 1 })));
        live(ctx, T, 880, 760, { yaw: .1, bob: 5, seed: 2 }, () => sat(ctx, T, 880, 760, .36 * p(T, A.map, .5, eback), { rot: .35, glow: .3 }));
        beam(ctx, T, 860, 800, dx + 8, dy - 12, { k: p(T, K.loc - .3, .9, eio), n: 3, w: 56, a: .9 });
        tag(ctx, 260, 780, 'LOCATION ON MAP', p(T, K.loc, .45), dx - 26, dy - 14, { rgb: SKY_RGB });
        stamp(ctx, p(T, K.nos, .45), 220, 1720, 'NO SERVICE', { col: RED, size: 52, rot: -.07 });
      }, { cy: 1250 });
    });
  }

  // 3 SIGNAL REACHES YOU IN ~70 MS
  { const K = { ms: c('70', A.ms), far: c('far away', A.ms) };
    sfx.push({ t: K.ms, k: 'shimmer', g: -16 });
    add(A.ms, (ctx, T) => {
      space(ctx, T, { tint: '40,90,200', gy: 1450 });
      shot(ctx, T, A.ms, () => {
        const gx = 540, gy = 1560, R = 260, [yx, yy] = youPos(gx, gy, R);
        live(ctx, T, gx, gy, { yaw: .04, bob: 5, seed: 1 }, () => globe(ctx, T, gx, gy, R));
        live(ctx, T, 540, 740, { yaw: .1, bob: 5, seed: 2 }, () => sat(ctx, T, 540, 740, .5, { glow: .4 }));
        const u = p(T, K.far - .5, 1.3, eio); beam(ctx, T, 540, 790, yx, yy - 24, { k: 1, n: 4, w: 80, speed: .7 });
        const ex = lerp(540, yx, u), ey = lerp(790, yy - 24, u); glowDot(ctx, ex, ey, 70, '255,240,190', .9 * (1 - p(T, K.ms + 1, .4)));
        youDot(ctx, T, yx, yy, { label: 'You' });
        const v = Math.round(70 * eo((T - K.ms) / 1.0)); bin(ctx, p(T, K.ms - .1, .3), () => { ctx.save(); ctx.shadowColor = `rgba(${GOLD_RGB},.8)`; ctx.shadowBlur = 40; txt(ctx, v + ' ms', 800, 1050, 120, '#fff', 900, 'center'); ctx.restore(); });
        tag(ctx, 300, 1050, '~20,000 km', p(T, K.far - .3, .5), 440, 1050, { rgb: CYAN_RGB, size: 28 });
      }, { cy: 1250 });
      title(ctx, p(T, A.ms + .05, .45), 'FROM SPACE TO YOUR PHONE', '', { y: 600, size: 58 });
    });
  }

  // 4 THE JOURNEY STARTS AT THE SATELLITE
  { const K = { sat: c('satellite', A.jour) };
    sfx.push({ t: K.sat, k: 'shimmer', g: -16 });
    add(A.jour, (ctx, T) => {
      space(ctx, T, { tint: '60,90,180', gy: 1100 });
      shot(ctx, T, A.jour, () => {
        const k = p(T, A.jour, .7, eback);
        ringsOut(ctx, T, 540, 1150, { r1: 520, n: 4, a: p(T, K.sat - .3, .6) });
        live(ctx, T, 540, 1150, { yaw: .14, bob: 10, spin: .05, seed: 1 }, () => sat(ctx, T, 540, 1150, 1.1 * k, { glow: .55, rot: 0 }));
        stamp(ctx, p(T, K.sat, .45), 540, 1650, 'START HERE', { col: GOLDC, size: 70, rot: -.04 });
      }, { cy: 1150 });
      title(ctx, p(T, A.jour + .05, .45), 'THE SIGNAL STARTS ON A SATELLITE', '', { y: 640, size: 54 });
    });
  }

  // 5 HIKING, NO NETWORK, BLUE DOT KEEPS MOVING
  { const K = { net: c('network', A.hike), blue: c('blue dot', A.hike), step: c('step', A.hike) };
    sfx.push({ t: K.net, k: 'click', g: -13 });
    add(A.hike, (ctx, T) => {
      sky(ctx, T);
      shot(ctx, T, A.hike, () => {
        const off = T * 30; mountain(ctx, T, 250 - off % 1200 + 0, 1330, 760, 520, { col: '#2e4a38', col2: '#4d6e58' }); mountain(ctx, T, 900 - off * .6, 1330, 900, 640, { col: '#35553c', col2: '#5a7f61' });
        ctx.fillStyle = '#466b2f'; ctx.fillRect(-200, 1330, W + 400, 700); ctx.fillStyle = '#a07a4e'; ctx.beginPath(); ctx.moveTo(-100, 1760); ctx.lineTo(W + 100, 1560); ctx.lineTo(W + 100, 1700); ctx.lineTo(-100, 1920); ctx.fill();
        live(ctx, T, 330, 1560, { yaw: .02, bob: 0, seed: 1 }, () => hiker(ctx, T, 330, 1650, 1.25, { walk: 1 }));
        const nk = p(T, K.net, .45, eback); pop(ctx, nk, 330, 880, () => { pill(ctx, 330, 880, 'No Service', { bg: RED, size: 34, h: 74, padX: 28 }); });
        const u = clamp((T - A.hike) / 6) * .5 + .2, ph = flip;
        flip(ctx, p(T, K.blue - .2, .55, eo5), 800, 1130, () => live(ctx, T, 800, 1130, { yaw: .06, bob: 6, seed: 2 }, () => phoneX(ctx, T, 800, 1130, .45, { dot: u, noSvc: T >= K.net - .05, sheet: 0 })));
        tag(ctx, 800, 770, 'BLUE DOT MOVES', p(T, K.step - .2, .45), phonePt(800, 1130, .45, u)[0], phonePt(800, 1130, .45, u)[1], { rgb: '120,180,255', size: 24 });
      }, { cy: 1250 });
    });
  }

  // 6 THAT DOT IS THE WORK OF THIS SIGNAL
  { const K = { sig: c('signal', A.dot) };
    sfx.push({ t: K.sig, k: 'shimmer', g: -16 });
    add(A.dot, (ctx, T) => {
      space(ctx, T, { tint: '50,90,200', gy: 1250 });
      shot(ctx, T, A.dot, () => {
        const u = lerp(.4, .56, clamp((T - A.dot) / 3)), [dx, dy] = phonePt(540, 1330, .78, u);
        live(ctx, T, 540, 740, { yaw: .1, bob: 5, seed: 1 }, () => sat(ctx, T, 540, 740, .45, { glow: .35 }));
        beam(ctx, T, 540, 790, dx, dy - 16, { k: p(T, K.sig - .5, 1, eio), n: 4, w: 64 });
        flip(ctx, p(T, A.dot, .6, eo5), 540, 1330, () => live(ctx, T, 540, 1330, { yaw: .05, bob: 6, seed: 2 }, () => phoneX(ctx, T, 540, 1330, .78, { dot: u, noSvc: true, sheet: 1 })));
        ringsOut(ctx, T, dx, dy, { r1: 130, n: 2, a: p(T, K.sig, .4), lw: 3 });
        stamp(ctx, p(T, K.sig, .45), 540, 1790, 'THE SIGNAL DOES THIS', { col: GOLDC, size: 44, rot: -.03 });
      }, { cy: 1250 });
    });
  }

  // 7 PHONE WORKS OUT YOUR POSITION, MAP SHOWS THE DOT
  { const K = { pos: c('position', A.works), shows: c('map shows', A.works) };
    sfx.push({ t: K.shows, k: 'click', g: -13 });
    add(A.works, (ctx, T) => {
      space(ctx, T, { tint: '50,90,200', gy: 1250 });
      shot(ctx, T, A.works, () => {
        live(ctx, T, 540, 720, { yaw: .1, bob: 5, seed: 1 }, () => sat(ctx, T, 540, 720, .42, { glow: .3 }));
        beam(ctx, T, 540, 765, 540, 940, { k: p(T, A.works + .1, .7, eio), n: 2, w: 50 });
        // phone chip box with a calculation readout
        const k = p(T, A.works + .3, .5, eback); pop(ctx, k, 540, 1060, () => { panel(ctx, 320, 940, 440, 240, 30); txt(ctx, 'YOUR PHONE', 540, 996, 26, CYAN, 800, 'center', MONO);
          const f = clamp((T - A.works - .6) / 1.6); txt(ctx, '18.7600° N', 540, 1076, 46, '#fff', 800, 'center', MONO); txt(ctx, '73.4100° E', 540, 1136, 46, '#fff', 800, 'center', MONO);
          ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(360, 1160, 360, 6); ctx.fillStyle = CYAN; ctx.fillRect(360, 1160, 360 * (K.pos > T ? f : 1), 6); });
        arrow(ctx, 540, 1200, 540, lerp(1200, 1330, p(T, K.pos, .4)), { col: GOLDC, w: 14, a: p(T, K.pos, .3) });
        const m = p(T, K.shows, .6, eback); flip(ctx, m, 540, 1560, () => live(ctx, T, 540, 1560, { yaw: .04, bob: 5, seed: 2 }, () => {
          ctx.save(); ctx.translate(540, 1560); rr(ctx, -380, -190, 760, 380, 30); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowBlur = 0; ctx.clip(); { const [rx, ry] = routeAt(.52, 500, 1060); ctx.translate(-rx, -ry); } mapScreen(ctx, 500, 1060, T, { dot: .52, sheet: 0, route: 1, acc: 40 }); ctx.restore(); }));
      }, { cy: 1250 });
      title(ctx, p(T, A.works + .05, .45), 'THE PHONE SOLVES FOR WHERE YOU ARE', '', { y: 600, size: 50 });
    });
  }

  // 8 ATOMIC CLOCKS INSIDE EVERY SATELLITE (magnified window)
  { const K = { inside: c('inside', A.atom), clk: c('atomic', A.atom) };
    sfx.push({ t: K.clk, k: 'shimmer', g: -16 });
    add(A.atom, (ctx, T) => {
      space(ctx, T, { tint: '120,90,30', gy: 1250 });
      shot(ctx, T, A.atom, () => {
        live(ctx, T, 540, 760, { yaw: .1, bob: 5, seed: 1 }, () => sat(ctx, T, 540, 760, .6, { glow: .4 }));
        const k = p(T, K.inside - .4, .7, eo5); ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = 'rgba(255,192,70,.5)'; ctx.lineWidth = 3; ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.moveTo(500, 800); ctx.lineTo(210, 1110); ctx.moveTo(580, 800); ctx.lineTo(870, 1110); ctx.stroke(); ctx.restore();
        const r = 400 * k; if (r > 4) { ctx.save(); ctx.translate(540, 1370); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip(); const g = ctx.createRadialGradient(0, -80, 40, 0, 0, 420); g.addColorStop(0, '#3a2a10'); g.addColorStop(1, '#120d05'); ctx.fillStyle = g; ctx.fillRect(-420, -420, 840, 840);
          ctx.strokeStyle = 'rgba(255,200,90,.14)'; ctx.lineWidth = 2; for (let i = -8; i < 9; i++) { ctx.beginPath(); ctx.moveTo(i * 50, -420); ctx.lineTo(i * 50, 420); ctx.stroke(); }
          [[-170, 40], [0, 40], [170, 40]].forEach(([x, y], i) => atomicClock(ctx, T, x, y + 20 * (i === 1 ? 0 : 0), .85, { a: p(T, K.inside + .1 * i, .45), glow: i === 1 ? .35 : 0 }));
          ctx.restore(); ctx.strokeStyle = GOLDC; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(540, 1370, r, 0, 7); ctx.stroke(); }
        tag(ctx, 540, 1160, 'ATOMIC CLOCKS', p(T, K.clk, .45), 540, 1310, { rgb: GOLD_RGB, size: 30 });
        stamp(ctx, p(T, K.clk + .3, .5), 540, 1800, 'MAGNIFIED · ILLUSTRATIVE', { col: 'rgba(255,230,160,.9)', size: 28, bg: 'rgba(10,8,4,.7)', rot: 0 });
      }, { cy: 1250 });
    });
  }

  // 9 IT SENDS TWO THINGS: THE TIME AND WHERE IT IS
  { const K = { two: c('two important', A.two), time: c('what time', A.two), where: c('where', A.two) };
    sfx.push({ t: K.time, k: 'click', g: -13 });
    add(A.two, (ctx, T) => {
      space(ctx, T, { tint: '60,90,190', gy: 1200 });
      shot(ctx, T, A.two, () => {
        live(ctx, T, 540, 740, { yaw: .1, bob: 5, seed: 1 }, () => sat(ctx, T, 540, 740, .55, { glow: .4 }));
        ringsOut(ctx, T, 540, 800, { r1: 240, n: 3, a: .8 });
        const pk = p(T, K.two - .2, .6, eio); if (pk > 0 && pk < 1) { const y = lerp(820, 1060, pk); rr(ctx, 490, y - 24, 100, 48, 10); ctx.fillStyle = GOLDC; ctx.fill(); txt(ctx, 'DATA', 540, y + 7, 22, '#2b1d00', 800, 'center', MONO); }
        [[290, K.time, 'TIME', '10:42:07.000', 'what time it is'], [790, K.where, 'POSITION', '20,200 km up', 'where I am']].forEach(([x, t0, h, v, sub], i) => {
          flip(ctx, p(T, t0 - .2, .55, eo5), x, 1330, () => live(ctx, T, x, 1330, { yaw: .06, bob: 6, seed: 2 + i }, () => {
            panel(ctx, x - 215, 1100, 430, 460, 34); ctx.letterSpacing = '4px'; txt(ctx, h, x, 1160, 28, i ? CYAN : GOLDC, 800, 'center', MONO); ctx.letterSpacing = '0px';
            if (!i) { dial(ctx, T, x, 1300, 92, { kind: 'atomic' }); txt(ctx, v, x, 1470, 32, '#fff', 800, 'center', MONO); } else { // position: orbit + pin
              ctx.strokeStyle = 'rgba(160,200,255,.5)'; ctx.lineWidth = 2; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.ellipse(x, 1320, 130, 70, -.3, 0, 7); ctx.stroke(); ctx.setLineDash([]); glowDot(ctx, x, 1320, 100, CYAN_RGB, .7); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + 130 * Math.cos(T * 1.2), 1320 + 70 * Math.sin(T * 1.2), 12, 0, 7); ctx.fill();
              ctx.fillStyle = '#8ab8ff'; ctx.beginPath(); ctx.arc(x, 1320, 40, 0, 7); ctx.fill(); txt(ctx, v, x, 1470, 32, '#fff', 800, 'center', MONO); }
          }));
        });
        arrow(ctx, 540, 1010, 330, 1090, { col: GOLDC, w: 10, a: p(T, K.time - .2, .3), glow: .5 }); arrow(ctx, 540, 1010, 750, 1090, { col: CYAN, w: 10, a: p(T, K.where - .2, .3), glow: .5 });
      }, { cy: 1250 });
      title(ctx, p(T, K.two - .1, .45), 'TWO IMPORTANT THINGS', '', { y: 600, size: 62 });
    });
  }

  // 10 IT NEVER LISTENS: IT JUST KEEPS BROADCASTING
  { const K = { never: c('never', A.never), keeps: c('broadcasting', A.never) };
    sfx.push({ t: K.never, k: 'click', g: -12 });
    add(A.never, (ctx, T) => {
      space(ctx, T, { tint: '60,90,190', gy: 1100 });
      shot(ctx, T, A.never, () => {
        live(ctx, T, 540, 760, { yaw: .1, bob: 5, seed: 1 }, () => sat(ctx, T, 540, 760, .6, { glow: .4 }));
        ringsOut(ctx, T, 540, 820, { r1: 330, n: 4, a: p(T, A.never, .5) });
        beam(ctx, T, 540, 880, 540, 1500, { k: 1, n: 5, w: 90, speed: .6, a: p(T, A.never + .1, .6) });
        flip(ctx, p(T, A.never + .1, .5, eo5), 540, 1640, () => live(ctx, T, 540, 1640, { yaw: .05, bob: 4, seed: 2 }, () => person(ctx, 540, 1740, 1.5)));
        // upward arrow that is blocked
        const bk = p(T, K.never, .45, eback);
        if (bk > 0) { ctx.save(); ctx.globalAlpha = clamp(bk); arrow(ctx, 780, 1650, 780, 1180, { col: 'rgba(160,170,190,.8)', w: 18, glow: 0 }); ctx.restore(); pop(ctx, bk, 780, 1420, () => xmark(ctx, 780, 1420, 58, 1, RED)); txt(ctx, 'NO REPLY', 780, 1720, 30, '#ffb3b6', 800, 'center', MONO); }
        const t2 = p(T, K.keeps, .5, eback); stamp(ctx, t2, 300, 1240, 'JUST BROADCASTS', { col: GOLDC, size: 46, rot: -.05 });
      }, { cy: 1250 });
    });
  }

  // 11 MILLIONS HEAR THE SAME SIGNAL AT ONCE
  { const K = { friend: c('friend', A.mill), mil: c('millions', A.mill), once: c('at once', A.mill) };
    sfx.push({ t: K.mil, k: 'shimmer', g: -16 });
    add(A.mill, (ctx, T) => {
      space(ctx, T, { tint: '60,90,190', gy: 1200 });
      shot(ctx, T, A.mill, () => {
        live(ctx, T, 540, 740, { yaw: .1, bob: 5, seed: 1 }, () => sat(ctx, T, 540, 740, .55, { glow: .4 }));
        const cols = ['#e0642f', '#2f9e6b', '#8a5bd6', '#d6a32f', '#d6455b', '#2f7bd6'];
        const rows = [[1560, 3, 1.1, 6], [1450, 5, .8, 4], [1360, 7, .62, 3]]; // y, count, scale
        rows.forEach(([y, n, sc], r) => { for (let i = 0; i < n; i++) { const x = 540 + (i - (n - 1) / 2) * (900 / Math.max(n, 3)) * (r ? 1 : .78), k = p(T, [A.mill + .1, K.friend, K.mil][r] + i * .05, .45, eback);
          if (k > 0) { beam(ctx, T, 540, 800, x, y - 170 * sc, { k: p(T, A.mill + .1, .6), n: 2, w: 30, a: .5, line: .35, cres: .8 }); pop(ctx, k, x, y, () => person(ctx, x + 4 * Math.sin(T * 2 + i), y, sc, { col: cols[(i + r) % 6], hair: ['#222', '#6b3f1d', '#111', '#a06a2a'][i % 4] })); } } });
        tag(ctx, 380, 1210, 'YOU', p(T, A.mill + .1, .4), 470, 1360, { rgb: GOLD_RGB, size: 22 });
        tag(ctx, 700, 1230, 'YOUR FRIEND', p(T, K.friend, .4), 640, 1400, { rgb: CYAN_RGB, size: 22 });
        const v = Math.round(1e6 * eo((T - K.mil) / 1.3)); const nk = p(T, K.mil - .1, .4);
        bin(ctx, nk, () => { ctx.save(); ctx.shadowColor = `rgba(${GOLD_RGB},.8)`; ctx.shadowBlur = 36; txt(ctx, v.toLocaleString('en-US') + '+', 540, 1010, 96, '#fff', 900, 'center'); ctx.restore(); txt(ctx, 'LISTENING AT ONCE', 540, 1058, 26, '#ffe9b8', 800, 'center', MONO); });
      }, { cy: 1250 });
    });
  }

  // 12 ONE-WAY BROADCAST
  { const K = { ow: c('one-way', A.one), job: c('job', A.one) };
    sfx.push({ t: K.ow, k: 'shimmer', g: -15 });
    add(A.one, (ctx, T) => {
      space(ctx, T, { tint: '70,80,190', gy: 1150 });
      shot(ctx, T, A.one, () => {
        // radio tower
        ctx.save(); ctx.translate(540, 1040); ctx.strokeStyle = '#cdd6e8'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-90, 360); ctx.lineTo(0, -250); ctx.lineTo(90, 360); ctx.stroke(); ctx.lineWidth = 4;
        for (let i = 0; i < 6; i++) { const y = -190 + i * 90, w = 14 + i * 14.4; ctx.beginPath(); ctx.moveTo(-w, y + 40); ctx.lineTo(w, y - 10 + 50); ctx.moveTo(w, y + 40); ctx.lineTo(-w, y - 10 + 50); ctx.moveTo(-w, y + 40); ctx.lineTo(w, y + 40); ctx.stroke(); }
        ctx.fillStyle = GOLDC; ctx.shadowColor = GOLDC; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(0, -258, 16 + 3 * Math.sin(T * 6), 0, 7); ctx.fill(); ctx.restore();
        ringsOut(ctx, T, 540, 782, { r1: 420, n: 4, lw: 4 });
        // one-way arrows to listeners
        [[160, 1440], [330, 1520], [750, 1520], [920, 1440]].forEach(([x, y], i) => { const k = p(T, A.one + .1 * i, .5, eback); beam(ctx, T, 540, 900, x, y - 80, { k: p(T, A.one, .7), n: 2, w: 30, a: .55, line: .5, cres: .8 }); pop(ctx, k, x, y, () => person(ctx, x, y + 90, .9, { col: ['#e0642f', '#2f9e6b', '#8a5bd6', '#d6455b'][i] })); });
        stamp(ctx, p(T, K.ow, .5), 540, 1700, 'ONE-WAY BROADCAST', { col: GOLDC, size: 58, rot: -.04 });
        bin(ctx, p(T, K.job, .4), () => txt(ctx, 'SAME JOB, NO MATTER HOW MANY', 540, 1790, 26, '#cfd6e2', 700, 'center', MONO));
      }, { cy: 1250 });
    });
  }

  // 13 PHONE CHECKS ITS CLOCK: ABOUT 70 MS
  { const K = { clock: c('clock', A.check), ms: c('70', A.check) };
    sfx.push({ t: K.ms, k: 'stopwatch', g: -16 });
    add(A.check, (ctx, T) => {
      space(ctx, T, { tint: '60,90,190', gy: 1200 });
      shot(ctx, T, A.check, () => {
        live(ctx, T, 540, 700, { yaw: .1, bob: 5, seed: 1 }, () => sat(ctx, T, 540, 700, .5, { glow: .4 }));
        const u = p(T, A.check + .2, 1.4, eio); beam(ctx, T, 540, 750, 540, 1320, { k: 1, n: 3, w: 56, a: .8 });
        glowDot(ctx, 540, lerp(750, 1320, u), 60, '255,240,190', .9 * (1 - p(T, K.ms + .5, .4)));
        flip(ctx, p(T, A.check + .1, .55, eo5), 540, 1540, () => live(ctx, T, 540, 1540, { yaw: .05, bob: 5, seed: 2 }, () => phoneX(ctx, T, 540, 1540, .3, { dot: .5, noSvc: true, sheet: 0, acc: 60 })));
        flip(ctx, p(T, A.check + .3, .55, eo5), 250, 900, () => { panel(ctx, 60, 790, 380, 220, 28); txt(ctx, 'SENT', 250, 840, 24, GOLDC, 800, 'center', MONO); txt(ctx, '10:42:07.000', 250, 925, 38, '#fff', 800, 'center', MONO); txt(ctx, 'satellite clock', 250, 975, 22, '#aeb8cc', 600, 'center'); });
        flip(ctx, p(T, K.clock - .1, .55, eo5), 830, 1330, () => live(ctx, T, 830, 1330, { yaw: .06, bob: 6, seed: 3 }, () => { panel(ctx, 640, 1170, 380, 330, 28); txt(ctx, 'ARRIVED', 830, 1218, 24, CYAN, 800, 'center', MONO); dial(ctx, T, 830, 1330, 62, { kind: 'quartz', off: 0 }); txt(ctx, '10:42:07.070', 830, 1450, 34, '#fff', 800, 'center', MONO); }));
        const v = Math.round(70 * eo((T - K.ms) / .9)); pop(ctx, p(T, K.ms - .1, .4, eback), 250, 1330, () => { panel(ctx, 70, 1230, 360, 200, 30); ctx.save(); ctx.shadowColor = `rgba(${GOLD_RGB},.8)`; ctx.shadowBlur = 30; txt(ctx, v + ' ms', 250, 1340, 88, '#fff', 900, 'center'); ctx.restore(); txt(ctx, 'TRAVEL TIME', 250, 1392, 24, '#ffe9b8', 800, 'center', MONO); });
      }, { cy: 1250 });
    });
  }

  // 14 TIME x SPEED OF LIGHT = DISTANCE
  { const K = { light: c('speed of light', A.dist), dist: c('distance', A.dist), time: c('time', A.dist) };
    sfx.push({ t: K.dist, k: 'shimmer', g: -16 });
    add(A.dist, (ctx, T) => {
      space(ctx, T, { tint: '80,80,200', gy: 1250 });
      shot(ctx, T, A.dist, () => {
        // a light ray racing across the top
        const ru = (T * .9) % 1; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gr = ctx.createLinearGradient(120, 0, 960, 0); gr.addColorStop(0, 'rgba(255,240,190,0)'); gr.addColorStop(ru, 'rgba(255,240,190,.95)'); gr.addColorStop(Math.min(1, ru + .001), 'rgba(255,240,190,0)'); ctx.strokeStyle = gr; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(120, 760); ctx.lineTo(960, 760); ctx.stroke(); ctx.restore();
        flip(ctx, p(T, A.dist + .05, .6, eo5), 540, 1230, () => live(ctx, T, 540, 1230, { yaw: .04, bob: 5, seed: 1 }, () => {
          panel(ctx, 100, 880, 880, 700, 40); ctx.letterSpacing = '5px'; txt(ctx, 'DISTANCE', 540, 970, 30, CYAN, 800, 'center', MONO); ctx.letterSpacing = '0px';
          bin(ctx, p(T, K.dist, .4), () => txt(ctx, 'd = c × t', 540, 1100, 120, '#fff', 900, 'center'));
          const row = (y, t0, big, small, col) => bin(ctx, p(T, t0, .45), () => { rr(ctx, 160, y - 62, 760, 124, 30); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke(); txt(ctx, small, 200, y + 14, 28, '#cfd6e2', 700, 'left', MONO); txt(ctx, big, 880, y + 18, 54, '#fff', 900, 'right'); });
          row(1250, K.light, '300,000 km/s', 'c  SPEED OF LIGHT', GOLDC); row(1390, K.time, '0.07 s', 't  TRAVEL TIME', CYAN);
          bin(ctx, p(T, Math.max(K.dist, K.time) + .25, .45), () => { rr(ctx, 160, 1470, 760, 100, 30); ctx.fillStyle = 'rgba(125,255,176,.14)'; ctx.fill(); ctx.strokeStyle = MINT; ctx.lineWidth = 2.5; ctx.stroke(); txt(ctx, 'd  ≈ 20,000 km', 540, 1538, 50, MINT, 900, 'center'); });
        }));
        txt(ctx, 'Values rounded', 540, 1650, 22, 'rgba(207,214,226,.55)', 600, 'center');
      }, { cy: 1250 });
    });
  }

  // 15 THREE DISTANCES GIVE A LOCATION
  { const K = { perf: c('perfect', A.three), three: c('three', A.three), loc: c('your location', A.three) };
    sfx.push({ t: K.loc, k: 'shimmer', g: -16 });
    add(A.three, (ctx, T) => {
      space(ctx, T, { tint: '70,80,190', gy: 1250 });
      shot(ctx, T, A.three, () => {
        trilat(ctx, T, { k: [p(T, K.three, .8, eio), p(T, K.three + .25, .8, eio), p(T, K.three + .5, .8, eio)] });
        youDot(ctx, T, TP[0], TP[1], { a: p(T, K.loc, .45), label: 'You' });
        const cl = p(T, K.perf - .1, .5, eback); pop(ctx, cl, 540, 1000, () => { dial(ctx, T, 540, 1000, 72, { kind: 'atomic' }); });
        stamp(ctx, p(T, K.perf, .45), 540, 780, 'PERFECT CLOCK', { col: MINT, size: 54, rot: -.04 });
      }, { cy: 1250 });
    });
  }

  // 16 PHONE CLOCK IS QUARTZ, NOT ATOMIC
  { const K = { atom: c('atomic', A.quartz), q: c('quartz', A.quartz) };
    sfx.push({ t: K.q, k: 'click', g: -12 });
    add(A.quartz, (ctx, T) => {
      space(ctx, T, { tint: '90,70,190', gy: 1250 });
      shot(ctx, T, A.quartz, () => {
        const col = (x, t0, head, sub, col, draw) => flip(ctx, p(T, t0 - .2, .6, eo5), x, 1250, () => live(ctx, T, x, 1250, { yaw: .05, bob: 6, seed: x }, () => { panel(ctx, x - 240, 800, 480, 900, 36); ctx.letterSpacing = '4px'; txt(ctx, head, x, 870, 28, col, 800, 'center', MONO); ctx.letterSpacing = '0px'; draw(); txt(ctx, sub, x, 1630, 44, '#fff', 900, 'center'); }));
        col(280, A.quartz + .1, 'SATELLITE', 'ATOMIC', GOLDC, () => { atomicClock(ctx, T, 280, 1180, 1, { glow: .35 }); dial(ctx, T, 280, 1480, 86, { kind: 'atomic' }); });
        col(800, K.q, 'YOUR PHONE', 'QUARTZ', VIO, () => { quartz(ctx, T, 800, 1170, 1.4, { glow: .4 }); dial(ctx, T, 800, 1480, 86, { kind: 'quartz', rate: 1, off: Math.sin(T * 2) * 1.1 }); });
        stamp(ctx, p(T, K.q + .2, .45), 540, 1000, '≠', { col: RED, size: 120, rot: 0 });
      }, { cy: 1250 });
      title(ctx, p(T, A.quartz + .05, .45), 'NOT THE SAME CLOCK', '', { y: 620, size: 62 });
    });
  }

  // 17 OFF BY 1 ms = 300 km WRONG PER DISTANCE
  { const K = { ms: c('millisecond', A.off), km: c('300', A.off), away: c('away', A.off) };
    sfx.push({ t: K.km, k: 'glitch', g: -17 });
    add(A.off, (ctx, T) => {
      space(ctx, T, { tint: '150,60,70', gy: 1250 });
      shot(ctx, T, A.off, () => {
        const e = 90 * p(T, K.km - .2, .9, eio), mv = p(T, K.away - .2, 1.0, eio);
        trilat(ctx, T, { err: e, col: RED_RGB });
        const wx = lerp(TP[0], 700, mv), wy = lerp(TP[1], 1040, mv);
        ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.setLineDash([10, 10]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(TP[0], TP[1]); ctx.lineTo(wx, wy); ctx.stroke(); ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(TP[0], TP[1], 14, 0, 7); ctx.fill(); txt(ctx, 'TRUE SPOT', TP[0] - 6, TP[1] + 50, 22, 'rgba(255,255,255,.7)', 700, 'center', MONO);
        youDot(ctx, T, wx, wy, { label: 'Your dot?', size: 24, pulse: 0 });
        const cl = p(T, A.off + .05, .5, eback); pop(ctx, cl, 300, 640, () => pill(ctx, 300, 640, 'CLOCK OFF BY 1 ms', { bg: '#7a2630', size: 32, h: 70, padX: 26 }));
        const ka = p(T, K.km, .45, eback); pop(ctx, ka, 840, 700, () => stamp(ctx, 1, 840, 700, '+300 km', { col: RED, size: 64, rot: -.05 }));
        tag(ctx, 540, 1790, 'EVERY DISTANCE 300 km WRONG', p(T, K.km + .2, .45), undefined, undefined, { rgb: RED_RGB, size: 26 });
      }, { cy: 1250 });
    });
  }

  // 18 FOURTH SATELLITE CORRECTS THE CLOCK
  { const K = { fourth: c('fourth', A.fourth), corr: c('corrects', A.fourth), few: c('few', A.fourth) };
    sfx.push({ t: K.fourth, k: 'click', g: -12 }, { t: K.few, k: 'success', g: -15 });
    add(A.fourth, (ctx, T) => {
      space(ctx, T, { tint: '40,110,200', gy: 1350 });
      shot(ctx, T, A.fourth, () => {
        const gx = 540, gy = 1390, R = 270, [yx, yy] = youPos(gx, gy, R);
        live(ctx, T, gx, gy, { yaw: .04, bob: 5, seed: 1 }, () => globe(ctx, T, gx, gy, R));
        [[190, 800], [890, 820], [140, 1480], [905, 1500]].forEach(([x, y], i) => { const k = i < 3 ? p(T, A.fourth + .1 * i, .5, eback) : p(T, K.fourth - .1, .6, eback), hl = i === 3 ? p(T, K.fourth, .5) : 0;
          beam(ctx, T, x, y, yx, yy - 10, { k: k, n: 2, w: 40, a: .8, rgb: i === 3 ? MINT_RGB : GOLD_RGB, line: .6 });
          live(ctx, T, x, y, { yaw: .12, bob: 5, seed: i }, () => sat(ctx, T, x, y, .3 * k, { rot: Math.atan2(yy - y, yx - x) - Math.PI / 2, a: k, glow: hl * .6 })); });
        tag(ctx, 850, 1370, '4th SATELLITE', p(T, K.fourth, .45), 905, 1450, { rgb: MINT_RGB, size: 22 });
        youDot(ctx, T, yx, yy, { label: p(T, K.few, .4) > 0 ? '± few meters' : 'You', size: 24 });
        const cv = 1 - eo((T - K.corr) / .9), ms = (1 * clamp(cv)).toFixed(1);
        pop(ctx, p(T, K.fourth + .3, .5, eback), 540, 1740, () => { panel(ctx, 140, 1670, 800, 140, 34); txt(ctx, 'CLOCK ERROR', 330, 1752, 28, '#cfd6e2', 800, 'center', MONO); txt(ctx, (T < K.corr ? '1.0' : ms) + ' ms', 740, 1756, 60, T > K.corr + .9 ? MINT : '#fff', 900, 'center', MONO); });
      }, { cy: 1250 });
      title(ctx, p(T, A.fourth + .05, .45), '4 DISTANCES · 4 UNKNOWNS', '', { y: 620, size: 54 });
    });
  }

  // 19 TRILATERATION, ONE SINGLE POINT
  { const K = { tri: c('trilateration', A.tri), pt: c('single point', A.single) };
    sfx.push({ t: K.tri, k: 'shimmer', g: -15 });
    add(A.tri, (ctx, T) => {
      space(ctx, T, { tint: '70,80,190', gy: 1250 });
      shot(ctx, T, A.tri, () => {
        trilat(ctx, T, { k: [p(T, A.tri, .8, eio), p(T, A.tri + .2, .8, eio), p(T, A.tri + .4, .8, eio)] });
        youDot(ctx, T, TP[0], TP[1], { a: p(T, A.tri + .9, .4), label: '' });
        stamp(ctx, p(T, K.tri, .5), 540, 760, 'TRILATERATION', { col: GOLDC, size: 72, rot: -.04 });
        const pa = p(T, K.pt, .45, eback); pop(ctx, pa, 760, 1050, () => pill(ctx, 760, 1050, 'JUST ONE POINT', { bg: '#14203a', stroke: CYAN, fg: CYAN, size: 30, h: 70, padX: 26 }));
        if (pa > 0) { ctx.save(); ctx.strokeStyle = CYAN; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(700, 1086); ctx.lineTo(lerp(700, TP[0] + 16, pa), lerp(1086, TP[1] - 10, pa)); ctx.stroke(); ctx.restore(); }
      }, { cy: 1250 });
    });
  }

  // 20 WHERE DOES THE MAP COME FROM? ALREADY ON THE PHONE
  { const K = { where: c('where', A.where), al: c('already', A.already) };
    sfx.push({ t: K.al, k: 'shimmer', g: -15 });
    add(A.where, (ctx, T) => {
      space(ctx, T, { tint: '60,90,190', gy: 1250 });
      shot(ctx, T, A.where, () => {
        const blank = 1 - p(T, K.al, .5);
        flip(ctx, p(T, A.where, .6, eo5), 540, 1260, () => live(ctx, T, 540, 1260, { yaw: .05, bob: 6, seed: 1 }, () => phoneX(ctx, T, 540, 1260, .88, { dot: p(T, K.al, .5) > .3 ? .5 : -1, noSvc: true, blank, route: 1 - blank, sheet: 1 - blank })));
        pop(ctx, p(T, K.where - .3, .5, eback) * blank, 540, 1230, () => txt(ctx, '?', 540, 1330, 360, 'rgba(255,255,255,.9)', 900));
        pop(ctx, p(T, K.al, .5, eback), 540, 690, () => stamp(ctx, 1, 540, 690, 'ALREADY ON YOUR PHONE', { col: MINT, size: 40, rot: -.03 }));
      }, { cy: 1250 });
    });
  }

  // 21 WITH NETWORK, MAPS FETCHES ROADS AND PLACE NAMES
  { const K = { fetch: c('fetches', A.fetch), roads: c('roads', A.fetch), names: c('names', A.fetch) };
    sfx.push({ t: K.roads, k: 'click', g: -13 });
    add(A.fetch, (ctx, T) => {
      space(ctx, T, { tint: '60,120,220', gy: 1150 });
      shot(ctx, T, A.fetch, () => {
        cloud(ctx, T, 540, 760, 1.05, p(T, A.fetch, .5, eback));
        const fk = clamp((T - A.fetch - .3) / 2.4);
        beam(ctx, T, 540, 880, 540, 1050, { k: p(T, A.fetch + .1, .5), n: 3, w: 60, rgb: SKY_RGB });
        flip(ctx, p(T, A.fetch + .05, .6, eo5), 540, 1420, () => live(ctx, T, 540, 1420, { yaw: .05, bob: 6, seed: 1 }, () => phoneX(ctx, T, 540, 1420, .62, { dot: .5, fetchK: fk, sheet: 0, route: 0, label: T > K.names ? 'Ridge Trail' : '' })));
        tag(ctx, 240, 1160, 'ROADS', p(T, K.roads, .45), 400, 1330, { rgb: '255,255,255', size: 26 }); tag(ctx, 840, 1180, 'PLACE NAMES', p(T, K.names, .45), 700, 1300, { rgb: GOLD_RGB, size: 26 });
        tag(ctx, 840, 720, 'NETWORK ON', p(T, A.fetch, .4), undefined, undefined, { rgb: MINT_RGB, size: 24 });
      }, { cy: 1250 });
    });
  }

  // 22 BEFORE THE HIKE: DOWNLOAD THE OFFLINE MAP OF THIS AREA
  { const K = { dl: c('downloaded', A.hikeb), area: c('area', A.hikeb) };
    sfx.push({ t: K.dl, k: 'data', g: -15 });
    add(A.hikeb, (ctx, T) => {
      space(ctx, T, { tint: '60,120,220', gy: 1150 });
      shot(ctx, T, A.hikeb, () => {
        cloud(ctx, T, 540, 740, .95, p(T, A.hikeb, .5, eback));
        const pr = clamp((T - K.dl) / 2.4), cx = 540, cy = 1330;
        flip(ctx, p(T, A.hikeb + .05, .6, eo5), cx, cy, () => live(ctx, T, cx, cy, { yaw: .05, bob: 5, seed: 1 }, () => {
          ctx.save(); ctx.translate(cx, cy); rr(ctx, -400, -300, 800, 600, 36); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowBlur = 0; ctx.clip(); ctx.translate(-400, -480); ctx.scale(1.6, 1); mapScreen(ctx, 500, 1060, T, { dot: -1, sheet: 0, route: 1 }); ctx.restore();
          ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = GOLDC; ctx.lineWidth = 6; ctx.setLineDash([22, 14]); ctx.lineDashOffset = -T * 40; rr(ctx, -330, -230, 660, 460, 14); ctx.stroke(); ctx.setLineDash([]);
          [[-330, -230], [330, -230], [-330, 230], [330, 230]].forEach(([x, y]) => { ctx.fillStyle = GOLDC; ctx.fillRect(x - 12, y - 12, 24, 24); }); ctx.restore(); }));
        tag(ctx, 540, 1670, 'THIS AREA', p(T, K.area, .45), 540, 1560, { rgb: GOLD_RGB, size: 28 });
        const ba = p(T, K.dl - .2, .4); if (ba > 0) { arrow(ctx, 540, 880, 540, lerp(880, 1010, ba), { col: SKY, w: 16, a: ba }); bar(ctx, 200, 1780, 680, 22, pr, pr >= 1 ? GREEN : SKY, 'rgba(255,255,255,.14)'); txt(ctx, pr >= 1 ? 'SAVED ✓' : Math.round(pr * 100) + '%', 900, 1800, 30, pr >= 1 ? MINT : '#fff', 800, 'left', MONO); }
        stamp(ctx, p(T, A.hikeb + .1, .5), 300, 650, 'BEFORE THE HIKE', { col: SKY, size: 36, rot: -.05 });
      }, { cy: 1250 });
    });
  }

  // 23 NETWORK DROPS, MAPS PLACES THE DOT ON THAT MAP
  { const K = { drops: c('drops', A.drops), pl: c('places', A.drops) };
    sfx.push({ t: K.drops, k: 'glitch', g: -17 }, { t: K.pl + .45, k: 'click', g: -12 });
    add(A.drops, (ctx, T) => {
      space(ctx, T, { tint: '60,90,190', gy: 1250 });
      shot(ctx, T, A.drops, () => {
        const nk = T >= K.drops - .05, dropK = clamp((T - K.pl) / .6), dotU = dropK > 0 ? .5 : -1;
        flip(ctx, p(T, A.drops, .6, eo5), 540, 1290, () => live(ctx, T, 540, 1290, { yaw: .05, bob: 6, seed: 1 }, () => phoneX(ctx, T, 540, 1290, .85, { dot: dotU, noSvc: nk, sheet: 1, date: 'Offline' })));
        const [dx, dy] = phonePt(540, 1290, .85, .5);
        if (dropK > 0 && dropK < 1) { const y = lerp(dy - 360, dy, eback(dropK)); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(dx, dy + 16, 22 * dropK, 7 * dropK, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#2f62f0'; ctx.beginPath(); ctx.arc(dx, y, 16, 0, 7); ctx.fill(); }
        ringsOut(ctx, T, dx, dy, { r1: 120, n: 2, a: dropK >= 1 ? 1 : 0, lw: 3, rgb: SKY_RGB });
        pop(ctx, p(T, K.drops, .45, eback), 240, 760, () => { ctx.save(); ctx.translate(240, 760); ctx.strokeStyle = RED; ctx.lineWidth = 12; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { ctx.globalAlpha = .9 - i * .2; ctx.beginPath(); ctx.arc(0, 40, 30 + i * 28, -2.3, -.84); ctx.stroke(); } ctx.globalAlpha = 1; ctx.beginPath(); ctx.moveTo(-70, -50); ctx.lineTo(70, 90); ctx.stroke(); ctx.restore(); });
        stamp(ctx, p(T, K.pl, .45), 840, 760, 'DOT ON SAVED MAP', { col: SKY, size: 34, rot: .04 });
      }, { cy: 1250 });
    });
  }

  // 24 PREFETCHING
  { const K = { pre: c('prefetching', A.pre), before: c('before', A.pre) };
    sfx.push({ t: K.pre, k: 'shimmer', g: -15 });
    add(A.pre, (ctx, T) => {
      space(ctx, T, { tint: '60,120,220', gy: 1200 });
      shot(ctx, T, A.pre, () => {
        cloud(ctx, T, 300, 880, .8, p(T, A.pre, .5, eback));
        const gx = 520, gy = 1010, tw_ = 118, th = 100; // a grid of map tiles filling up one by one
        for (let r = 0; r < 5; r++) for (let q = 0; q < 4; q++) { const n = r * 4 + q, t0 = A.pre + .4 + n * .12, f = p(T, t0, .35, eback); const x = gx + q * (tw_ + 8) + 40, y = gy + r * (th + 8) - 80;
          ctx.save(); ctx.translate(x + tw_ / 2, y + th / 2); ctx.scale(.4 + .6 * f, .4 + .6 * f); rr(ctx, -tw_ / 2, -th / 2, tw_, th, 12); ctx.fillStyle = f > .05 ? ['#cfe4c0', '#eaefe4', '#b8d8ee', '#dfe8d3'][(r + q * 2) % 4] : 'rgba(255,255,255,.06)'; ctx.globalAlpha = .3 + .7 * f; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
        arrow(ctx, 330, 960, 470, 1060, { col: SKY, w: 14, a: p(T, A.pre + .2, .4) });
        stamp(ctx, p(T, K.pre, .5), 540, 1740, 'PREFETCHING', { col: GOLDC, size: 76, rot: -.04 });
        pop(ctx, p(T, K.before, .45, eback), 270, 1300, () => { dial(ctx, T, 270, 1300, 70, { kind: 'quartz', rate: 3 }); txt(ctx, 'BEFORE YOU NEED IT', 270, 1410, 24, '#cfd6e2', 800, 'center', MONO); });
      }, { cy: 1250 });
    });
  }

  // 25 THE MAP IS ONLY AS FRESH AS THE LAST DOWNLOAD / NO TRAFFIC
  { const K = { fresh: c('fresh', A.fresh), last: c('last', A.fresh), tr: c('traffic', A.traffic) };
    sfx.push({ t: K.last, k: 'click', g: -12 }, { t: K.tr, k: 'glitch', g: -17 });
    add(A.fresh, (ctx, T) => {
      space(ctx, T, { tint: '90,90,170', gy: 1250 });
      shot(ctx, T, A.fresh, () => {
        flip(ctx, p(T, A.fresh, .6, eo5), 640, 1290, () => live(ctx, T, 640, 1290, { yaw: .05, bob: 6, seed: 1 }, () => phoneX(ctx, T, 640, 1290, .8, { dot: .5, sheet: 1, date: 'Offline · 20 Oct', traffic: 1 - p(T, K.tr, .4) })));
        pop(ctx, p(T, K.last - .1, .5, eback), 190, 880, () => { panel(ctx, 40, 740, 300, 270, 28); ctx.fillStyle = RED; rr(ctx, 40, 740, 300, 76, [28, 28, 0, 0]); ctx.fill(); txt(ctx, 'LAST DOWNLOAD', 190, 790, 24, '#fff', 800, 'center', MONO); txt(ctx, '20', 190, 930, 110, '#fff', 900, 'center'); txt(ctx, 'OCT', 190, 984, 34, '#ffb3b6', 800, 'center', MONO); });
        const dd = p(T, K.fresh, .5); tag(ctx, 190, 1160, 'ONLY THIS FRESH', dd, undefined, undefined, { rgb: GOLD_RGB, size: 22 });
        const tr = p(T, K.tr, .45, eback); pop(ctx, tr, 190, 1420, () => { rr(ctx, 40, 1350, 300, 140, 26); ctx.fillStyle = '#14203a'; ctx.fill(); ctx.strokeStyle = RED; ctx.lineWidth = 3; ctx.stroke(); txt(ctx, 'TRAFFIC', 190, 1418, 34, '#fff', 800, 'center', MONO); ctx.strokeStyle = RED; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(70, 1470); ctx.lineTo(310, 1370); ctx.stroke(); });
        txt(ctx, 'Illustrative map', 640, 1830, 20, 'rgba(207,214,226,.5)', 600, 'center');
      }, { cy: 1250 });
    });
  }

  // 26 A JAM BELOW, MAPS HAS NO IDEA: STALE DATA
  { const K = { jam: c('jam', A.jam), idea: c('no idea', A.jam), stale: c('stale', A.jam) };
    sfx.push({ t: K.jam, k: 'glitch', g: -17 }, { t: K.stale, k: 'shimmer', g: -15 });
    add(A.jam, (ctx, T) => {
      space(ctx, T, { tint: '120,70,60', gy: 1000 });
      shot(ctx, T, A.jam, () => {
        // highway strip with a jam
        ctx.fillStyle = '#20252f'; ctx.fillRect(-20, 700, W + 40, 220); ctx.fillStyle = 'rgba(255,255,255,.55)'; for (let x = -((T * 20) % 90); x < W; x += 90) ctx.fillRect(x, 808, 50, 6);
        for (let i = 0; i < 8; i++) { const k = p(T, A.jam + .05 * i, .45, eback), x = 90 + i * 125 + 4 * Math.sin(T * 1.2 + i); carTop(ctx, x, 880 - (i % 2) * 70, .9 * k, ['#d6455b', '#2f7bd6', '#d6a32f', '#8a5bd6', '#2f9e6b', '#e0642f', '#d6455b', '#2f7bd6'][i], { a: k }); }
        pop(ctx, p(T, K.jam, .45, eback), 540, 640, () => pill(ctx, 540, 640, 'JAM ON THE HIGHWAY', { bg: '#a3232f', size: 34, h: 76, padX: 30 }));
        flip(ctx, p(T, A.jam + .1, .6, eo5), 540, 1330, () => live(ctx, T, 540, 1330, { yaw: .05, bob: 5, seed: 1 }, () => phoneX(ctx, T, 540, 1330, .62, { dot: .5, sheet: 0, noSvc: true, traffic: 0 })));
        pop(ctx, p(T, K.idea, .45, eback), 880, 1330, () => txt(ctx, '?', 880, 1440, 260, 'rgba(255,255,255,.9)', 900));
        stamp(ctx, p(T, K.stale, .5), 540, 1745, 'STALE DATA', { col: GOLDC, size: 80, rot: -.04 });
      }, { cy: 1250 });
    });
  }

  // 27 LOOK UP: 20,000 km, 70 ms, ABOUT 1/14 SECOND
  { const K = { km: c('20,000', A.up), ms: c('70', A.up), fr: c('fourteenth', A.up) };
    sfx.push({ t: K.ms, k: 'shimmer', g: -16 });
    add(A.up, (ctx, T) => {
      space(ctx, T, { tint: '40,90,200', gy: 1400 });
      shot(ctx, T, A.up, () => {
        const gx = 300, gy = 1520, R = 200, [yx, yy] = youPos(gx, gy, R);
        live(ctx, T, gx, gy, { yaw: .04, bob: 5, seed: 1 }, () => globe(ctx, T, gx, gy, R));
        live(ctx, T, 300, 790, { yaw: .1, bob: 5, seed: 2 }, () => sat(ctx, T, 300, 790, .42, { glow: .35 }));
        beam(ctx, T, 300, 830, yx, yy - 20, { k: 1, n: 4, w: 56, speed: .8 }); youDot(ctx, T, yx, yy, { label: '', pulse: 0 });
        tag(ctx, 330, 1180, '~20,000 km', p(T, K.km, .45), 300, 1180, { rgb: CYAN_RGB, size: 28 });
        const v = Math.round(70 * eo((T - K.ms) / .8)); bin(ctx, p(T, K.ms - .1, .3), () => { ctx.save(); ctx.shadowColor = `rgba(${GOLD_RGB},.8)`; ctx.shadowBlur = 36; txt(ctx, v + ' ms', 760, 980, 96, '#fff', 900, 'center'); ctx.restore(); });
        // a second as a ring; one fourteenth wedge lit
        const rcx = 760, rcy = 1400, rr_ = 150; ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(rcx, rcy, rr_, 0, 7); ctx.stroke();
        const wk = p(T, K.fr, .8, eio); if (wk > 0) { ctx.save(); ctx.fillStyle = `rgba(${GOLD_RGB},.9)`; ctx.beginPath(); ctx.moveTo(rcx, rcy); ctx.arc(rcx, rcy, rr_, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 / 14 * wk); ctx.closePath(); ctx.fill(); ctx.restore(); }
        pop(ctx, p(T, K.fr, .45, eback), rcx, rcy + 250, () => { txt(ctx, '1/14 of a second', rcx, rcy + 255, 36, '#fff', 900, 'center'); });
        txt(ctx, '1 SECOND', rcx, rcy - 190, 22, 'rgba(207,214,226,.7)', 700, 'center', MONO);
      }, { cy: 1250 });
      title(ctx, p(T, A.up + .05, .45), 'NOW LOOK UP', '', { y: 610, size: 70 });
    });
  }

  // 28 MANY COUNTRIES' SATELLITES, NAVIC
  { const K = { co: c('countries', A.many), nv: c('navic', A.many) };
    sfx.push({ t: K.co, k: 'shimmer', g: -16 });
    add(A.many, (ctx, T) => {
      space(ctx, T, { tint: '40,90,200', gy: 1300 });
      shot(ctx, T, A.many, () => {
        const gx = 540, gy = 1330, R = 210;
        live(ctx, T, gx, gy, { yaw: .04, bob: 5, seed: 1 }, () => globe(ctx, T, gx, gy, R));
        const sys = [['GPS', 'USA', '255,192,70', 0, -.5, 400, 250], ['GLONASS', 'RUSSIA', '255,110,110', 1.4, .3, 440, 280], ['Galileo', 'EUROPE', '93,224,255', 2.6, -1.1, 380, 300], ['BeiDou', 'CHINA', '185,155,255', 3.8, .9, 460, 230], ['NavIC', 'INDIA', '125,255,176', 5.0, -.2, 340, 200]];
        sys.forEach(([n, ctry, rgb, a0, rot, rx, ry], i) => { const t0 = i < 4 ? K.co - .3 + i * .25 : K.nv - .1, k = p(T, t0, .6, eo5); if (k <= 0) return;
          orbit(ctx, T, gx, gy, rx * k, ry * k, { rot, a: 1, rgb }); const an = a0 + T * (.3 + .04 * i), ex = Math.cos(an) * rx, ey = Math.sin(an) * ry, X = gx + Math.cos(rot) * ex - Math.sin(rot) * ey, Y = gy + Math.sin(rot) * ex + Math.cos(rot) * ey;
          const sa = eback(k); sat(ctx, T, X, Y, .2 * sa, { rot: an, a: sa, glow: n === 'NavIC' ? .7 : 0 }); });
        const lab = [['GPS · USA', 290, 780, '255,192,70', K.co], ['GLONASS · RUSSIA', 790, 780, '255,110,110', K.co + .25], ['GALILEO · EUROPE', 290, 880, '93,224,255', K.co + .5], ['BEIDOU · CHINA', 790, 880, '185,155,255', K.co + .75], ['NAVIC · INDIA', 540, 1750, '125,255,176', K.nv]];
        lab.forEach(([t, x, y, rgb, t0]) => tag(ctx, x, y, t, p(T, t0, .45), undefined, undefined, { rgb, size: t.startsWith('NAVIC') ? 34 : 24 }));
      }, { cy: 1250 });
    });
  }

  // 29 GNSS, WHICH EVERYONE CALLS GPS; ALL WITHOUT A NETWORK
  { const K = { g: c('gnss', A.gnss), gps: c('gps', A.gnss), nn: c('without', A.nonet) };
    sfx.push({ t: K.g, k: 'shimmer', g: -15 }, { t: K.nn, k: 'click', g: -12 });
    add(A.gnss, (ctx, T) => {
      space(ctx, T, { tint: '60,90,190', gy: 1250 });
      shot(ctx, T, A.gnss, () => {
        const gx = 540, gy = 1300, R = 190; live(ctx, T, gx, gy, { yaw: .04, bob: 5, seed: 1 }, () => globe(ctx, T, gx, gy, R));
        [[0, 0, 360, 240, '255,192,70'], [2, -.6, 330, 270, '93,224,255'], [4, .7, 400, 220, '185,155,255'], [1, 1.2, 300, 280, '125,255,176']].forEach(([a0, rot, rx, ry, rgb], i) => { orbit(ctx, T, gx, gy, rx, ry, { rot, rgb }); const an = a0 + T * (.35 + .05 * i), ex = Math.cos(an) * rx, ey = Math.sin(an) * ry; sat(ctx, T, gx + Math.cos(rot) * ex - Math.sin(rot) * ey, gy + Math.sin(rot) * ex + Math.cos(rot) * ey, .17, { rot: an }); });
        stamp(ctx, p(T, K.g, .5), 540, 690, 'GNSS', { col: CYAN, size: 100, rot: -.03 });
        bin(ctx, p(T, K.g + .1, .4), () => txt(ctx, 'GLOBAL NAVIGATION SATELLITE SYSTEM', 540, 810, 24, '#cfd6e2', 700, 'center', MONO));
        pop(ctx, p(T, K.gps, .45, eback), 540, 1640, () => stamp(ctx, 1, 540, 1640, 'EVERYONE SAYS "GPS"', { col: GOLDC, size: 50, rot: .03 }));
        const nk = p(T, K.nn, .45, eback); pop(ctx, nk, 540, 1790, () => { pill(ctx, 540, 1790, 'WORKS WITHOUT A NETWORK', { bg: '#12331f', stroke: MINT, fg: MINT, size: 30, h: 70, padX: 28 }); });
      }, { cy: 1250 });
    });
  }

  // 30 GPS NEVER LISTENS TO YOUR PHONE
  { const K = { n: c('never', A.never2), l: c('listens', A.never2) };
    sfx.push({ t: K.n, k: 'click', g: -12 });
    add(A.never2, (ctx, T) => {
      space(ctx, T, { tint: '60,90,190', gy: 1200 });
      shot(ctx, T, A.never2, () => {
        live(ctx, T, 540, 740, { yaw: .1, bob: 5, seed: 1 }, () => sat(ctx, T, 540, 740, .55, { glow: .4 }));
        beam(ctx, T, 540, 800, 540, 1250, { k: p(T, A.never2, .6, eio), n: 4, w: 70 });
        flip(ctx, p(T, A.never2 + .05, .55, eo5), 540, 1470, () => live(ctx, T, 540, 1470, { yaw: .05, bob: 5, seed: 2 }, () => phoneX(ctx, T, 540, 1470, .42, { dot: .5, sheet: 0, noSvc: true })));
        const a = p(T, K.n, .5, eback); if (a > 0) { ctx.save(); ctx.globalAlpha = clamp(a); ctx.setLineDash([16, 14]); arrow(ctx, 880, 1500, 880, 1000, { col: 'rgba(160,170,190,.75)', w: 18, glow: 0 }); ctx.restore(); pop(ctx, a, 880, 1250, () => xmark(ctx, 880, 1250, 54, 1, RED)); }
        stamp(ctx, p(T, K.l, .5), 540, 1780, 'RECEIVE-ONLY', { col: GOLDC, size: 64, rot: -.04 });
      }, { cy: 1250 });
    });
  }

  // 31 STARLINK LISTENS TO THE DISH AT HOME
  { const K = { dish: c('dish', A.star), net: c('internet', A.star) };
    sfx.push({ t: K.dish, k: 'click', g: -12 }, { t: K.net, k: 'shimmer', g: -15 });
    add(A.star, (ctx, T) => {
      space(ctx, T, { tint: '30,120,200', gy: 1250 });
      shot(ctx, T, A.star, () => {
        live(ctx, T, 540, 760, { yaw: .1, bob: 5, seed: 1 }, () => sat(ctx, T, 540, 760, .5, { glow: .4, rot: .1 }));
        tag(ctx, 540, 640, 'STARLINK', p(T, A.star, .4), undefined, undefined, { rgb: SKY_RGB, size: 28 });
        const dx = 600, dy = 1500; flip(ctx, p(T, A.star + .1, .6, eo5), 540, 1560, () => live(ctx, T, 540, 1560, { yaw: .04, bob: 3, seed: 2 }, () => dishAnt(ctx, T, 540, 1560, 1.5, { glow: p(T, K.dish, .5) * .8 })));
        const topX = 540 + 60 * 1.5, topY = 1560 - 90 * 1.5;
        beam(ctx, T, 540, 810, topX, topY - 40, { k: p(T, A.star + .2, .8, eio), n: 3, w: 60, rgb: GOLD_RGB });
        beam(ctx, T, topX + 40, topY - 40, 600, 840, { k: p(T, K.dish, .9, eio), n: 3, w: 60, rgb: CYAN_RGB, a: .95 });
        stamp(ctx, p(T, K.dish + .2, .5), 280, 1060, 'IT LISTENS', { col: CYAN, size: 54, rot: -.06 });
        const ia = p(T, K.net, .5, eback); pop(ctx, ia, 850, 1130, () => { glowDot(ctx, 850, 1130, 140, SKY_RGB, .7); ctx.save(); ctx.translate(850, 1130); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 60, 0, 7); ctx.moveTo(-60, 0); ctx.lineTo(60, 0); ctx.moveTo(0, -60); ctx.lineTo(0, 60); ctx.ellipse(0, 0, 28, 60, 0, 0, 7); ctx.stroke(); ctx.restore(); txt(ctx, 'INTERNET', 850, 1240, 28, '#cfe3ff', 800, 'center', MONO); });
      }, { cy: 1250 });
    });
  }

  // 32 SHOULD STARLINK COME TO INDIA? TELL ME IN THE COMMENTS
  { const K = { cm: c('comments', A.india) };
    sfx.push({ t: K.cm, k: 'click', g: -12 });
    add(A.india, (ctx, T) => {
      space(ctx, T, { tint: '60,110,200', gy: 1200 });
      shot(ctx, T, A.india, () => {
        const gx = 540, gy = 980, R = 150; live(ctx, T, gx, gy, { yaw: .04, bob: 5, seed: 1 }, () => globe(ctx, T, gx, gy, R)); youDot(ctx, T, ...youPos(gx, gy, R), { label: 'India', size: 22 });
        flip(ctx, p(T, A.india + .1, .6, eo5), 540, 1450, () => live(ctx, T, 540, 1450, { yaw: .04, bob: 5, seed: 2 }, () => {
          panel(ctx, 110, 1190, 860, 520, 36); txt(ctx, 'STARLINK IN INDIA?', 540, 1272, 46, '#fff', 900, 'center');
          [['YES', 540 - 190, MINT], ['NO', 540 + 190, RED]].forEach(([l, x, col], i) => { const v = .5 + .22 * Math.sin(T * 1.3 + i * 3.1) * (i ? -1 : 1); rr(ctx, x - 160, 1330, 320, 250, 28); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
            txt(ctx, l, x, 1400, 56, col, 900, 'center'); bar(ctx, x - 120, 1470, 240, 24, v, col, 'rgba(255,255,255,.14)'); txt(ctx, Math.round(v * 100) + '%', x, 1550, 40, '#fff', 800, 'center', MONO); });
        }));
        const cm = p(T, K.cm, .5, eback); pop(ctx, cm, 540, 1790, () => pill(ctx, 540, 1790, '💬  TELL ME IN THE COMMENTS', { bg: '#14203a', stroke: SKY, fg: '#fff', size: 32, h: 76, padX: 30 }));
      }, { cy: 1250 });
    });
  }

  // 33 ENDING: the video's own code is broadcast from a satellite; "guide" goes UP this time; the map drops a pin on the bio link
  { const K = { crazy: c('crazy', A.crazy), code: c('code', A.crazy), comment: c('comment', A.crazy), guide: c('guide', A.crazy), yt: c('youtube', A.crazy), link: c('link', A.crazy), bio: c('bio', A.crazy) };
    const cta = Math.min(K.link, K.bio), post = K.guide + .45, tStart = A.crazy + .3, tEnd = K.code - .12;
    sfx.push({ t: A.crazy + .05, k: 'riser', g: -17 }, { t: K.code + .15, k: 'success', g: -14 }, { t: post, k: 'click', g: -11 }, { t: K.yt, k: 'swoosh', g: -16 }, { t: cta + .3, k: 'click', g: -10 });
    const CODE = [['import { sats } from "gps"', '#7fd8ff'], ['fix = trilaterate(sats, 4)', '#ffb07a'], ['clock.correct(fix.error)', '#ffd479'], ['map.draw(offlineTiles)', '#9ee6b0'], ['render("9:16")', '#c9bfff'], ['// 100% code', '#7a8597']];
    const nch = CODE.reduce((a, [l]) => a + l.length, 0);
    add(A.crazy, (ctx, T) => {
      space(ctx, T, { tint: '40,90,190', gy: 1150 });
      const sw = p(T, K.yt - .1, .7, eio), pr = clamp((T - tStart) / Math.max(.4, tEnd - tStart)); // sw: editor -> map with pins
      shot(ctx, T, A.crazy, () => {
        // satellite beaming the code down; later the comment goes UP
        live(ctx, T, 540, 690, { yaw: .1, bob: 5, seed: 1 }, () => sat(ctx, T, 540, 690, .38 * p(T, A.crazy, .6, eback), { glow: .4 }));
        beam(ctx, T, 540, 730, 540, 800, { k: p(T, A.crazy + .1, .5), n: 2, w: 40, a: (1 - p(T, K.comment - .2, .3)) * .9 });
        const up = p(T, post, .8, eio); if (up > 0 && up < 1) { const y = lerp(1250, 730, up); glowDot(ctx, 540, y, 70, CYAN_RGB, 1); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(540, y, 9, 0, 7); ctx.fill(); }
        const ex = 70, ey = 790, ew = 940, eh = 640, k = p(T, A.crazy, .6, eo5);
        flip(ctx, k, 540, ey + eh / 2, () => live(ctx, T, 540, ey + eh / 2, { yaw: .025, bob: 4, breathe: .003, seed: 4 }, () => {
          const cm = p(T, K.comment - .15, .45, eio);
          card(ctx, ex, ey, ew, eh, { r: 30, fill: sw < .5 ? '#0f121b' : '#16314a', dark: true, stroke: sw < .5 ? 'rgba(255,255,255,.14)' : 'rgba(120,190,255,.7)' });
          if (sw < 1) { ctx.save(); ctx.globalAlpha *= 1 - sw; ['#ff5f57', '#febc2e', '#28c840'].forEach((cc, i) => { ctx.fillStyle = cc; ctx.beginPath(); ctx.arc(ex + 38 + i * 28, ey + 36, 9, 0, 7); ctx.fill(); });
            txt(ctx, 'gps.js', ex + ew / 2, ey + 44, 26, '#cfd6e2', 700); txt(ctx, 'FRAME ' + String(Math.floor(T * 30)).padStart(4, '0'), ex + ew - 30, ey + 44, 22, CYAN, 700, 'right', MONO); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(ex, ey + 68, ew, 2);
            if (cm < 1) { ctx.save(); ctx.globalAlpha *= 1 - cm; let left = nch * pr;
              CODE.forEach(([l, col], i) => { if (left <= 0) return; const n = Math.min(l.length, Math.floor(left)); left -= l.length;
                txt(ctx, String(i + 1), ex + 36, ey + 140 + i * 64, 26, 'rgba(140,150,165,.6)', 600, 'left', MONO); txt(ctx, l.slice(0, n), ex + 84, ey + 140 + i * 64, 34, col, 600, 'left', MONO);
                if (n < l.length && Math.sin(T * 10) > 0) { ctx.fillStyle = '#fff'; ctx.fillRect(ex + 86 + tw(ctx, l.slice(0, n), 34, 600, MONO), ey + 112 + i * 64, 4, 38); } });
              ctx.restore(); }
            if (cm > 0) { ctx.save(); ctx.globalAlpha *= cm * (1 - sw); ctx.letterSpacing = '3px'; txt(ctx, 'COMMENTS', ex + 50, ey + 150, 26, 'rgba(220,226,236,.75)', 700, 'left', MONO); ctx.letterSpacing = '0px';
              rr(ctx, ex + 50, ey + 200, ew - 100, 100, 50); ctx.fillStyle = '#1b2029'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 2; ctx.stroke();
              const g2 = typed('guide', T, K.guide - .15, K.guide + .2); txt(ctx, g2 || 'Add a comment…', ex + 92, ey + 265, 44, g2 ? '#fff' : '#7a8290', g2 ? 800 : 500, 'left');
              if (T < post && g2 && Math.sin(T * 9) > 0) { ctx.fillStyle = '#fff'; ctx.fillRect(ex + 96 + tw(ctx, g2, 44, 800), ey + 228, 4, 44); }
              const ps = p(T, post, .4, eback); if (ps > 0) pop(ctx, ps, ex + ew / 2, ey + 420, () => pill(ctx, ex + ew / 2, ey + 420, 'guide  ✓ sent up to the satellite', { bg: GREEN, size: 34, h: 78 })); ctx.restore(); }
            ctx.restore(); }
          if (sw > 0) { ctx.save(); ctx.globalAlpha *= sw; // map card with pins: YouTube, TikTok and the bio link
            ctx.save(); rr(ctx, ex + 14, ey + 14, ew - 28, eh - 28, 22); ctx.clip(); ctx.translate(ex + 14, ey - 110); ctx.scale((ew - 28) / 500, 1); mapScreen(ctx, 500, 800, T, { dot: -1, sheet: 0, route: 1 }); ctx.restore();
            const pin = (x, y, col, label, k0) => { const kk = p(T, k0, .5, eback); if (kk <= 0) return; ctx.save(); ctx.translate(x, y - 40 * (1 - kk)); ctx.scale(kk, kk); ctx.fillStyle = col; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(0, -52, 38, Math.PI * .85, Math.PI * .15); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -52, 14, 0, 7); ctx.fill(); txt(ctx, label, 0, 46, 30, '#14203a', 900, 'center'); ctx.restore(); };
            pin(300, ey + 330, '#e62117', 'YouTube', K.yt); pin(700, ey + 280, '#15161b', 'TikTok', K.yt + .25);
            const hl = p(T, cta + .3, .35); rr(ctx, ex + 50, ey + 470, ew - 100, 110, 22); ctx.fillStyle = `rgba(255,255,255,.92)`; ctx.fill(); ctx.strokeStyle = `rgba(47,123,255,${.5 + .5 * hl})`; ctx.lineWidth = 4; ctx.stroke();
            txt(ctx, '🔗  Link in bio · full guide', ex + 90, ey + 540, 40, '#1d3f9a', 800, 'left'); ctx.restore(); }
        }));
        // fix bar: the typed code is the satellite lock
        const bw = 560; bar(ctx, 190, 1610, bw, 20, pr, pr >= 1 ? GREEN : CYAN, 'rgba(255,255,255,.1)');
        txt(ctx, pr >= 1 ? '100% CODE ✓' : Math.floor(pr * 100) + '%', 920, 1628, 30, pr >= 1 ? MINT : '#fff', 800, 'right', MONO);
        const fx = Math.min(4, Math.floor(pr * 4.999) ); [0, 1, 2, 3].forEach(i => { const on = pr > i / 4; ctx.fillStyle = on ? MINT : 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.arc(250 + i * 54, 1690, 12, 0, 7); ctx.fill(); }); txt(ctx, 'SATS LOCKED ' + fx, 640, 1700, 26, pr >= 1 ? MINT : '#cfd6e2', 800, 'left', MONO);
        const st = p(T, K.code, .5, eback) * (1 - p(T, K.comment - .2, .3)); stamp(ctx, st, 540, 1790, 'MADE WITH CODE', { col: MINT, size: 56, rot: -.04 });
        // cursor posts the comment, then taps the bio link
        if (T > K.guide - .4 && T < post + .7) { const cx = kf(T, [[K.guide - .4, 900], [post - .05, 540]]), cy = kf(T, [[K.guide - .4, 1500], [post - .05, 1220]]); cursor(ctx, cx, cy, clamp(1 - Math.abs(T - post) / .12), clamp((post + .7 - T) / .3)); clickRing(ctx, 540, 1220, (T - post) / .5); }
        const ly = 790 + 540 - 12; if (T > cta - .4) { const cx = kf(T, [[cta - .4, 900], [cta + .25, 700]]), cy = kf(T, [[cta - .4, 1600], [cta + .25, ly]]); cursor(ctx, cx, cy, clamp(1 - Math.abs(T - cta - .3) / .1)); clickRing(ctx, 700, ly, (T - cta - .3) / .5); }
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
