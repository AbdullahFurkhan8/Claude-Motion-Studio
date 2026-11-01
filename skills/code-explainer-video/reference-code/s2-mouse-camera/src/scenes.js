// "Your mouse is secretly a camera" - how an optical mouse moves the cursor. All timing from word cues c('phrase', after).
// Everything is drawn in code (mouse.js + kit.js). No presenter, no user images, no brand logos.
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, win, hash, rr, alive, flipIn } from './lib.js';
import { FONT, MONO, GREEN, BLUE, txt, tw, bin, pop, card, pill, avatar } from './kit.js';
import { LIME, LIME_RGB, TEAL, TEAL_RGB, RED_RGB, INK, surf, specks, pixFrame, brackets, tag, counter, glassCard, badge, glow, pointer,
  deskCam, desk, monitor, wallpaper, mouseTop, internals, mouseBottom, sideCut, macro, fingertip, reportCard } from './mouse.js';

export const IMAGES = [];
const kf = (T, keys, e = eio) => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (T < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e((T - t0) / Math.max(1e-3, t1 - t0)); return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u); }
  return keys[keys.length - 1][1];
};
const live = (ctx, T, x, y, o, fn) => { ctx.save(); alive(ctx, T, x, y, o); fn(); ctx.restore(); };
const flip = (ctx, k, x, y, fn) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k * 1.5); flipIn(ctx, x, y, k); fn(); ctx.restore(); };
const typed = (s, T, t0, t1) => s.slice(0, Math.floor(s.length * clamp((T - t0) / Math.max(.05, t1 - t0))));
const fmt = n => Math.round(n).toLocaleString('en-US');
// world -> screen helper for the desk shots: mouse on the pad, cursor on the monitor
function deskShot(ctx, T, o = {}) {
  const { cam = {}, m = [0, 0], rot = 0, lift = 0, glass = 0, pad = 1, cur = null, press = 0, screen = null, mo = {}, ms = 1.1, code = null, curA = 1 } = o;
  const P = deskCam(cam);
  desk(ctx, T, P, { glass, pad: pad * (1 - glass), code });
  const scr = monitor(ctx, T, P, {}, (c, x, y, w, h) => { wallpaper(c, T, x, y, w, h); if (screen) screen(c, x, y, w, h); if (cur) pointer(c, x + w * (.5 + cur[0]), y + h * (.5 - cur[1]), Math.max(.7, w / 700), curA, press); });
  const g = P(m[0], m[1], 0), k = 1500 / g[2];
  mouseTop(ctx, T, g[0], g[1], k * ms, { rot, lift, cableTo: P(.8, 5.3, 0), press, ...mo });
  const cp = cur && scr ? [scr.x + scr.w * (.5 + cur[0]), scr.y + scr.h * (.5 - cur[1])] : null;
  return { P, scr, g, k, cp };
}
// tiny photo card (a sensor frame with a white border)
function photo(ctx, x, y, s, rot, ox, oy, a = 1, n = 8, mode = 'desk') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot);
  ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5; ctx.fillStyle = '#f4f5f0'; ctx.fillRect(-s / 2 - s * .07, -s / 2 - s * .07, s * 1.14, s * 1.14); ctx.shadowColor = 'transparent';
  pixFrame(ctx, -s / 2, -s / 2, s, n, ox, oy, { grid: 0, border: null, mode }); ctx.restore();
}
// big processor chip (DSP) icon
function dspChip(ctx, T, x, y, s, a = 1, hot = 0) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  glow(ctx, x, y, s * 1.4, TEAL_RGB, .5 * hot * (.8 + .2 * Math.sin(T * 6)));
  ctx.fillStyle = '#c9a24a'; for (let i = 0; i < 7; i++) { const o = -s * .42 + i * s * .14; ctx.fillRect(x + o - 4, y - s * .62, 8, s * .14); ctx.fillRect(x + o - 4, y + s * .48, 8, s * .14); ctx.fillRect(x - s * .62, y + o - 4, s * .14, 8); ctx.fillRect(x + s * .48, y + o - 4, s * .14, 8); }
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; rr(ctx, x - s / 2, y - s / 2, s, s, s * .1);
  const g = ctx.createLinearGradient(x - s / 2, y - s / 2, x + s / 2, y + s / 2); g.addColorStop(0, '#2c3038'); g.addColorStop(1, '#0f1115'); ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = `rgba(${TEAL_RGB},${.35 + .65 * hot})`; ctx.lineWidth = 3; ctx.stroke();
  rr(ctx, x - s * .3, y - s * .3, s * .6, s * .6, s * .06); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.letterSpacing = '3px'; txt(ctx, 'DSP', x, y + s * .08, s * .2, `rgba(${TEAL_RGB},${.6 + .4 * hot})`, 800, 'center', MONO); ctx.letterSpacing = '0px';
  ctx.restore();
}
function vec(ctx, x0, y0, x1, y1, col = LIME, wd = 7, a = 1) { // arrow
  if (a <= 0) return; const an = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0); ctx.save(); ctx.globalAlpha *= a; ctx.translate(x0, y0); ctx.rotate(an);
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = wd; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.max(0, L - wd * 3), 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(L, 0); ctx.lineTo(L - wd * 4, -wd * 2.4); ctx.lineTo(L - wd * 4, wd * 2.4); ctx.fill(); ctx.restore();
}
function title(ctx, s, x, y, size, a = 1, col = '#fff') { if (a <= 0) return; bin(ctx, a, () => { ctx.save(); ctx.letterSpacing = '4px'; txt(ctx, s, x, y, size, col, 800, 'center', MONO); ctx.restore(); }); }

export const KEYWORDS = 'camera thousands desk second cursor never tracks slid flip light skims angle fiber dust shadow chip fingernail 18 pixels 1500 sensor 12000 clever processor compares specks 3 exactly far way message bytes hundreds steps prove mousepad lift down move air see reporting glass freezes smooth same nothing laser counted crazy code guide bio';
export const EMOJI = { camera: '📸', code: '💻', guide: '💬', bio: '🔗' };
export const CAPTION_SFX = false;
// Hinglish voice: same scenes, cues mapped to the words it says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      thousands: 'hazaaron',
      'so how does': 'to isse', 'your computer never': 'aapka computer', 'mouse tracks': 'mouse aapke', 'how far': 'kitna slide', slid: 'hua',
      flip: 'ise ulta', 'it skims': 'woh desk par', angle: 'tirchhi', 'so every': 'isliye', dust: 'dhool', shadow: 'parchhai',
      'right above': 'uske theek', fingernail: 'naakhun', 'the first optical': 'sabse pehle', 'a modern': 'aaj ka',
      "now here's": 'ab aati', clever: 'samajhdaari', compares: 'compare', before: 'pichhli', hunts: 'wahi kan', specks: 'dhoondhta',
      'if they all': 'agar sab', exactly: 'pata chal', far: 'kitna', 'which way': 'kis taraf',
      'then it fires': 'phir woh', hundreds: 'sainkdon', 'and your computer adds': 'aur computer un',
      'and you can prove': 'aur aap khud', 'run out': 'mouse pad', lift: 'uthaiye', down: 'rakhiye', move: 'hilta',
      'in the air': 'hawa mein', see: 'dikhta', reporting: 'report', 'but on a glass': 'lekin glass', freezes: 'freeze', same: 'ek jaisi', nothing: 'kuch milta',
      'some logitech': 'kuch logitech', 'so your computer never knew': 'to aapke computer', counted: 'gini',
      "and here's the crazy": 'aur sabse',
    },
    keywords: 'camera hazaaron desk second cursor computer track slide ulta light tirchhi fiber dhool parchhai chip naakhun 18 pixels 1500 sensor 12000 samajhdaari processor compare kan 3 pata taraf message bytes sainkdon steps prove pad uthaiye rakhiye hilta hawa dikhta report glass freeze smooth jaisi kuch laser gini crazy code guide bio',
    emoji: { camera: '📸', code: '💻', guide: '💬', bio: '🔗' },
  },
};
const SMALL = new Set(['click', 'shutter', 'shimmer', 'success', 'data', 'glitch', 'gear', 'ring', 'pop', 'tick', 'kw', 'type', 'drip']);
const CODE = [
  ['const P = deskCam({ pitch: .9 });', '#9fb7ff'], ['desk(ctx, T, P, { pad: 1 });', '#cfd6e2'], ['for (const frame of sensor.frames()) {', '#c9bfff'],
  ['  const d = compare(prev, frame);', LIME], ['  if (d.match) report(d.dx, d.dy);', '#4fe3b0'], ['  prev = frame;', '#cfd6e2'], ['}', '#c9bfff'],
  ['send({ x: +3, y: 0 }); // 3 bytes', '#ffd479'], ['cursor.x += dx; cursor.y += dy;', '#ffb59a'], ['pixFrame(ctx, x, y, 600, 18);', '#9fb7ff'],
  ['mouseTop(ctx, T, gx, gy, k, { led });', '#cfd6e2'], ["sfx.push({ t: c('code') });", '#4fe3b0'],
];

export function makeScenes(c, lang = 'en') {
  const named = lang !== 'hi'; // Hindi version: profile picture only, no channel name or handle
  const list = [], sfx = [];
  const W3 = ['whoosh', 'swoosh', 'whoosh'];
  const add = (start, light, draw) => { list.push({ start, light, draw }); if (start > 0) sfx.push({ t: start - .05, k: W3[list.length % 3], g: -19 }); };
  const s = x => x - .1;
  const A = {
    so: s(c('so how does')), never: s(c('your computer never')), flip: s(c('flip')), skims: s(c('it skims')), every: s(c('so every')), right: s(c('right above')),
    first: s(c('the first optical')), now: s(c("now here's")), if: s(c('if they all')), then: s(c('then it fires')), adds: s(c('and your computer adds')),
    prove: s(c('and you can prove')), air: s(c('in the air')), glass: s(c('but on a glass')), some: s(c('some logitech')), knew: s(c('so your computer never knew')),
    crazy: s(c("and here's the crazy")),
  };

  // 1 HOOK: glossy mouse on the desk, x-ray shows the camera, little photos of the desk fly out by the thousand
  { const K = { cam: c('camera'), th: c('thousands'), desk: c('desk'), sec: c('second') };
    sfx.push({ t: .05, k: 'riser', g: -20 }, { t: K.cam, k: 'shutter', g: -12 }, { t: K.th, k: 'sweep', g: -18 });
    add(0, false, (ctx, T) => {
      const mx = .35 * Math.sin(T * 1.1), my = .2 * Math.sin(T * .8 + 1);
      const cam = { dist: kf(T, [[0, 3.3], [K.th, 4.4]]), pitch: .74, cy: 1480, tx: mx * .5, ty: my * .5 };
      const xr = win(T, K.cam - .15, K.th + .2, .3);
      const d = deskShot(ctx, T, { cam, m: [mx, my], rot: -.35 + .12 * Math.sin(T * .9), ms: 1.35, mo: { h: .26, xray: xr, led: .4 + .6 * xr, chipHi: xr } });
      if (xr > .3) tag(ctx, d.g[0] - 230, d.g[1] - 260, 'CAMERA INSIDE', xr, d.g[0] - 10, d.g[1] - d.k * .3);
      // photos of the desk flying out from under the mouse
      const t0 = K.cam + .1;
      for (let i = 0; i < 60; i++) { const b = t0 + i * .11, u = (T - b) / 1.15; if (u < 0 || u > 1) continue;
        const tx = 700 + 120 * (hash(i) - .5), ty = 640 + 40 * hash(i, 2), sx = d.g[0] + 30 * (hash(i, 3) - .5), sy = d.g[1];
        const x = lerp(sx, tx, eio(u)), y = lerp(sy, ty, eio(u)) - 260 * Math.sin(u * Math.PI) * hash(i, 4);
        photo(ctx, x, y, lerp(26, 70, eo(u)), (hash(i, 5) - .5) * 1.2 * (1 - u), 40 + i * 2.3, 30 + i * 1.3, clamp(u * 6) * clamp((1 - u) * 4), 8);
        if (u < .12) glow(ctx, sx, sy, 160, LIME_RGB, 1 - u / .12); }
      const ca = p(T, K.th, .5, eback); const cnt = Math.max(0, (T - K.th + .2) * 1500 * 2.2);
      if (ca > 0) live(ctx, T, 540, 600, { yaw: .04, bob: 4, seed: 2 }, () => flip(ctx, ca, 540, 600, () => counter(ctx, T, 250, 520, 580, 'PHOTOS TAKEN', fmt(cnt), '', { sub: '@ 1,500 / SEC', bar: (T * 2.2) % 1, pulse: Math.max(0, Math.sin(T * 14)) * .3 })));
      if (T > K.desk) tag(ctx, 540, 1720, 'PHOTOS OF YOUR DESK', p(T, K.desk, .4));
    });
  }

  // 2 SO HOW DOES THAT MOVE YOUR CURSOR? wide desk, cursor follows the mouse
  { const K = { cur: c('cursor', A.so) };
    add(A.so, false, (ctx, T) => {
      const u = T - A.so, mx = .9 * Math.sin(u * 1.6), my = .45 * Math.sin(u * 2.3 + .4);
      const d = deskShot(ctx, T, { cam: { dist: kf(T, [[A.so, 6.4], [K.cur + .6, 7.2]]), cy: kf(T, [[A.so, 1610], [K.cur + .6, 1570]]) }, m: [mx, my], rot: .05 * Math.sin(u), cur: [mx * .22, my * .3 + .05] });
      if (d.cp) { tag(ctx, d.cp[0] + 10, d.cp[1] - 90, 'CURSOR', p(T, K.cur, .4), d.cp[0] + 6, d.cp[1] - 8, { size: 20 });
        const q = p(T, K.cur + .1, .5, eback); if (q > 0) pop(ctx, q, 540, 1640, () => txt(ctx, '?', 540, 1700, 170, 'rgba(255,255,255,.92)', 900)); }
    });
  }

  // 3 THE COMPUTER NEVER TRACKS THE MOUSE: the mouse goes dashed ("?"), then it tracks the desk and reports only how far it slid
  { const K = { mt: c('mouse tracks', A.never), far: c('how far', A.never), slid: c('slid', A.never) };
    sfx.push({ t: K.far, k: 'sweep', g: -18 }, { t: K.slid + .1, k: 'shimmer', g: -17 });
    add(A.never, false, (ctx, T) => {
      const sl = kf(T, [[K.far - .1, 0], [K.slid + .3, .85]], eio), mx = -.45 + sl, my = 0;
      const ol = win(T, A.never + .05, K.mt, .2);
      const d = deskShot(ctx, T, { cam: { dist: 6.2, cy: 1630 }, m: [mx, my], cur: [mx * .22, .05], mo: { outline: ol, led: p(T, K.mt, .4) } });
      if (ol > .05) { pop(ctx, ol, d.g[0], d.g[1] - 210, () => txt(ctx, '?', d.g[0], d.g[1] - 160, 150, 'rgba(255,255,255,.95)', 900));
        title(ctx, 'COMPUTER: "WHERE IS IT?"', 540, 560, 30, ol); }
      // the mouse reads the desk under it
      const rd = p(T, K.mt, .4) * (1 - p(T, K.far, .3));
      if (rd > 0) { ctx.save(); ctx.globalAlpha = rd; ctx.strokeStyle = LIME; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -T * 40;
        ctx.beginPath(); ctx.ellipse(d.g[0], d.g[1], d.k * .7, d.k * .42, 0, 0, 7); ctx.stroke(); ctx.restore(); tag(ctx, 540, 1700, 'READS THE DESK', rd); }
      if (T > K.far - .1) { const p0 = d.P(-.45, -.9), p1 = d.P(mx, -.9); vec(ctx, p0[0], p0[1] + 60, p1[0], p1[1] + 60, LIME, 8, p(T, K.far, .3));
        tag(ctx, (p0[0] + p1[0]) / 2 + 40, p0[1] + 150, 'HOW FAR IT SLID  Δx +3', p(T, K.far + .2, .4)); }
    });
  }

  // 4 FLIP IT OVER: the mouse turns over, the little light glows
  { const K = { light: c('light', A.flip) };
    sfx.push({ t: K.light, k: 'shimmer', g: -16 });
    add(A.flip, false, (ctx, T) => {
      const P = deskCam({ dist: 5, cy: 1500 }); desk(ctx, T, P, { pad: 1 });
      ctx.fillStyle = 'rgba(5,6,8,.55)'; ctx.fillRect(-W, -H, W * 3, H * 3);
      const an = Math.PI * eio((T - A.flip - .15) / .75), cs = Math.cos(an), y = 1150 + 30 * Math.sin(an) * -1;
      live(ctx, T, 540, y, { yaw: .05, bob: 8, breathe: .01, seed: 3, tilt: .02 }, () => {
        ctx.save(); ctx.translate(540, y); ctx.rotate(-.2 + .2 * eio((T - A.flip) / 1)); ctx.translate(-540, -y);
        if (cs > 0) { ctx.save(); ctx.translate(540, y); ctx.scale(cs, 1); ctx.translate(-540, -y); mouseTop(ctx, T, 540, y + 40, 860, { sq: .95, h: .07, shadow: .6 }); ctx.restore(); }
        else mouseBottom(ctx, T, 540, y, 860, { led: p(T, K.light, .4) * (.85 + .15 * Math.sin(T * 5)), sx: -cs, lbl: 1 });
        ctx.restore();
      });
      tag(ctx, 800, 820, 'LED', p(T, K.light + .1, .4), 560, y - 900 * .6 * .2 - 20);
      tag(ctx, 300, 1640, 'LENS', p(T, K.light + .5, .4), 530, y - 860 * .1);
    });
  }

  // 5 IT SKIMS ACROSS YOUR DESK AT A LOW ANGLE (side cutaway)
  { const K = { ang: c('angle', A.skims) };
    sfx.push({ t: A.skims + .25, k: 'sweep', g: -16 });
    add(A.skims, false, (ctx, T) => {
      ctx.fillStyle = '#0b0c10'; ctx.fillRect(-W, -H, W * 3, H * 3); glow(ctx, 540, 1000, 900, '90,100,130', .25);
      const z = kf(T, [[A.skims, 1], [K.ang + .8, 1.25]]); ctx.save(); ctx.translate(540, 1250); ctx.scale(z, z); ctx.translate(-560, -1250);
      const bm = p(T, A.skims + .15, .7, eio);
      live(ctx, T, 560, 1200, { yaw: .01, bob: 3, breathe: .003, seed: 1 }, () => {
        const r = sideCut(ctx, T, 600, 1300, 900, { beam: bm, rays: p(T, K.ang + .4, .5), xray: 1 });
        // angle arc
        const aa = p(T, K.ang, .5); if (aa > 0) { const an = Math.atan2(r.spot[1] - r.led[1], r.spot[0] - r.led[0]); ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${aa})`; ctx.lineWidth = 3; ctx.setLineDash([8, 7]);
          ctx.beginPath(); ctx.moveTo(r.spot[0], r.spot[1]); ctx.lineTo(r.spot[0] - 300 * aa, r.spot[1]); ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); ctx.arc(r.spot[0], r.spot[1], 230, Math.PI, Math.PI + an * aa, false); ctx.stroke(); ctx.restore(); }
        tag(ctx, r.led[0] - 40, r.led[1] - 260, 'LED', p(T, A.skims + .3, .4), r.led[0], r.led[1] - 10);
        tag(ctx, r.spot[0] - 260, r.spot[1] + 140, 'LOW ANGLE', aa, r.spot[0] - 220, r.spot[1] - 10);
      });
      ctx.restore();
      title(ctx, 'SIDE VIEW · X-RAY', 540, 600, 26, p(T, A.skims + .1, .5), 'rgba(255,255,255,.6)');
    });
  }

  // 6 EVERY FIBER AND SPECK OF DUST THROWS A TINY SHADOW (macro)
  { const K = { fib: c('fiber', A.every), dust: c('dust', A.every), sh: c('shadow', A.every) };
    sfx.push({ t: K.sh, k: 'shimmer', g: -17 });
    add(A.every, false, (ctx, T) => {
      const u = T - A.every;
      macro(ctx, T, { lit: p(T, A.every, .8), slide: u * .22, hiF: win(T, K.fib, K.dust + .2, .2), hiD: win(T, K.dust, K.sh + .1, .2), hiS: p(T, K.sh, .4), cy: kf(T, [[A.every, 1080], [K.sh + 1, 1140]]) });
      tag(ctx, 300, 1560, 'FIBER', p(T, K.fib, .4)); tag(ctx, 560, 1660, 'DUST', p(T, K.dust, .4)); tag(ctx, 780, 1560, 'SHADOW', p(T, K.sh, .4));
      title(ctx, 'MAGNIFIED ILLUSTRATION', 540, 1840, 18, .6, 'rgba(255,255,255,.5)');
    });
  }

  // 7 A CAMERA CHIP THE SIZE OF YOUR FINGERNAIL (x-ray from above)
  { const K = { chip: c('camera chip', A.right), nail: c('fingernail', A.right) };
    sfx.push({ t: K.chip, k: 'shimmer', g: -16 }, { t: K.nail, k: 'swoosh', g: -19 });
    add(A.right, false, (ctx, T) => {
      ctx.fillStyle = '#0a0b0e'; ctx.fillRect(-W, -H, W * 3, H * 3); glow(ctx, 540, 1100, 800, '80,90,120', .3);
      const z = kf(T, [[A.right, 1], [K.chip + .3, 1.35], [K.nail + .6, 1.2]]), cy0 = 1160;
      ctx.save(); ctx.translate(540, 1150); ctx.scale(z, z); ctx.translate(-540, -1060);
      live(ctx, T, 540, cy0, { yaw: .04, bob: 5, breathe: .006, seed: 2 }, () => mouseTop(ctx, T, 540, cy0, 880, { sq: .92, h: .08, xray: 1, led: .8, chipHi: p(T, K.chip, .4) * (.85 + .15 * Math.sin(T * 5)), shadow: .5 }));
      const chip = [540, cy0 - 880 * .92 * .12 * .5 - 880 * .08 * .5 + 880 * .6 * .13];
      ctx.restore();
      const cs = [540 + (chip[0] - 540) * z, 1150 + (chip[1] - 1060) * z];
      tag(ctx, 540, 640, 'CAMERA CHIP', p(T, K.chip + .1, .4), cs[0], cs[1] - 40);
      const fa = p(T, K.nail, .6, eo5); fingertip(ctx, lerp(1250, 790, fa), lerp(2000, 1360, fa), 150, .55, fa);
      tag(ctx, 640, 1780, '≈ FINGERNAIL SIZE', p(T, K.nail + .3, .4));
    });
  }

  // 8 18 x 18 PIXELS AT 1,500 / SECOND -> MODERN GAMING SENSOR 12,000
  { const K = { n18: c('18', A.first), px: c('pixels', A.first), f15: c('1500', A.first), mod: c('a modern', A.first), gam: c('gaming', A.first), k12: c('12000', A.first) };
    sfx.push({ t: K.n18, k: 'shimmer', g: -18 }, { t: K.f15, k: 'data', g: -17 }, { t: K.mod, k: 'sweep', g: -17 }, { t: K.k12, k: 'success', g: -15 });
    add(A.first, false, (ctx, T) => {
      ctx.fillStyle = '#0a0b0e'; ctx.fillRect(-W, -H, W * 3, H * 3);
      ctx.save(); ctx.globalAlpha = .55; mouseTop(ctx, T, 540, 1700, 1500, { sq: .9, h: .02, xray: 1, led: .6, chipHi: 1, shadow: 0 }); ctx.restore();
      const modern = p(T, K.mod, .5), n = modern < .5 ? 18 : 36, fs = 600, fx = 540 - fs / 2, fy = 760 + 30 * Math.sin(T * .8);
      const step = Math.floor(T * (modern < .5 ? 10 : 24)), ox = 20 + step * .6, oy = 40 + step * .25;
      const fa = p(T, A.first + .2, .6, eo5);
      // light cone from the chip up to the frame
      if (fa > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, fy + fs, 0, 1560); g.addColorStop(0, `rgba(${LIME_RGB},${.0})`); g.addColorStop(1, `rgba(${LIME_RGB},${.28 * fa})`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(fx, fy + fs); ctx.lineTo(fx + fs, fy + fs); ctx.lineTo(600, 1560); ctx.lineTo(480, 1560); ctx.fill(); ctx.restore(); }
      live(ctx, T, 540, fy + fs / 2, { yaw: .05, bob: 0, breathe: .006, seed: 4 }, () => flip(ctx, fa, 540, fy + fs / 2, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 60; ctx.fillStyle = '#000'; ctx.fillRect(fx, fy, fs, fs); ctx.restore();
        pixFrame(ctx, fx, fy, fs, n, ox, oy, { grid: n === 18 ? 1 : .7 });
        brackets(ctx, fx - 18, fy - 18, fs + 36, fs + 36, p(T, K.px, .4));
        const lb = n === 18 ? '18 × 18' : '36 × 36'; tag(ctx, fx + fs - 70, fy - 50, lb, p(T, K.n18 + .1, .4), undefined, undefined, { size: 22 });
        ctx.save(); ctx.fillStyle = `rgba(255,70,70,${.6 + .4 * Math.sin(T * 8)})`; ctx.beginPath(); ctx.arc(fx + 26, fy + fs + 36, 8, 0, 7); ctx.fill(); ctx.restore();
        txt(ctx, 'FRAME ' + fmt(step), fx + 44, fy + fs + 44, 22, 'rgba(255,255,255,.65)', 700, 'left', MONO);
      }));
      // counter card
      const ca = p(T, K.f15 - .25, .45, eback);
      const v = modern < .01 ? 1500 * clamp((T - K.f15 + .25) / .5) : lerp(1500, 12000, eio(clamp((T - K.gam) / Math.max(.5, K.k12 - K.gam))));
      const lab = modern < .5 ? 'FIRST OPTICAL MICE' : 'MODERN GAMING SENSOR';
      if (ca > 0) live(ctx, T, 540, 570, { yaw: .03, bob: 3, seed: 6 }, () => flip(ctx, ca, 540, 570, () => counter(ctx, T, 190, 500, 700, lab, fmt(v), '/ second', { bar: v / 12000, pulse: win(T, K.k12, K.k12 + .3, .1) })));
    });
  }

  // 9 A TINY PROCESSOR COMPARES EVERY PHOTO WITH THE ONE BEFORE IT, HUNTS FOR THE SAME SPECKS
  { const K = { proc: c('processor', A.now), comp: c('compares', A.now), bef: c('before', A.now), hunt: c('hunts', A.now), sp: c('specks', A.now) };
    sfx.push({ t: K.proc, k: 'shimmer', g: -17 }, { t: K.comp + .1, k: 'sweep', g: -18 }, { t: K.sp, k: 'success', g: -17 });
    add(A.now, false, (ctx, T) => {
      ctx.fillStyle = '#0a0b0e'; ctx.fillRect(-W, -H, W * 3, H * 3); glow(ctx, 540, 1000, 900, '70,90,110', .3);
      ctx.save(); ctx.globalAlpha = .4; mouseTop(ctx, T, 540, 1820, 1500, { sq: .9, h: .02, xray: 1, led: .5, shadow: 0 }); ctx.restore();
      const ox = 30, oy = 50, fs = 400, mv = p(T, K.comp, .8, eio), y = 700;
      const x1 = lerp(80, 340, mv), x2 = lerp(600, 340, mv);
      const f1 = p(T, A.now + .1, .5, eo5), f2 = p(T, A.now + .3, .5, eo5);
      flip(ctx, f1, x1 + fs / 2, y + fs / 2, () => { pixFrame(ctx, x1, y, fs, 18, ox, oy, { border: 'rgba(255,255,255,.6)' }); });
      flip(ctx, f2, x2 + fs / 2, y + fs / 2, () => { ctx.globalAlpha *= lerp(1, .55, mv); pixFrame(ctx, x2, y, fs, 18, ox + 3, oy, { border: `rgba(${LIME_RGB},.9)` }); });
      txt(ctx, 'PHOTO 1 · BEFORE', x1, y + fs + 40, 20, `rgba(255,255,255,${.6 * f1 * (1 - mv)})`, 700, 'left', MONO);
      txt(ctx, 'PHOTO 2 · NOW', x2, y + fs + 40, 20, `rgba(${LIME_RGB},${.8 * f2 * (1 - mv)})`, 700, 'left', MONO);
      if (mv > .5) txt(ctx, 'OVERLAID', 540, y + fs + 40, 20, `rgba(255,255,255,${.6 * (mv - .5) * 2})`, 700, 'center', MONO);
      // specks circled on both
      const hs = p(T, K.hunt, .4); if (hs > 0) { const cs = fs / 18, list = specks(ox, oy, 18).slice(0, 5);
        list.forEach(([sx, sy], i) => { const a = clamp(hs * 2 - i * .2); ctx.strokeStyle = `rgba(${TEAL_RGB},${a})`; ctx.lineWidth = 3.5;
          ctx.beginPath(); ctx.arc(x1 + (sx - ox) * cs, y + (sy - oy) * cs, 26 + 4 * Math.sin(T * 5 + i), 0, 7); ctx.stroke();
          ctx.beginPath(); ctx.arc(x2 + (sx - ox - 3) * cs, y + (sy - oy) * cs, 26 + 4 * Math.sin(T * 5 + i), 0, 7); ctx.stroke(); }); }
      // processor
      const pa = p(T, K.proc, .5, eback);
      if (pa > 0) { live(ctx, T, 540, 1430, { yaw: .1, bob: 6, seed: 2 }, () => pop(ctx, pa, 540, 1430, () => dspChip(ctx, T, 540, 1430, 190, 1, p(T, K.comp, .4))));
        tag(ctx, 540, 1610, 'PROCESSOR · ON THE CHIP', pa);
        ctx.save(); ctx.globalAlpha = pa * .8; ctx.strokeStyle = `rgba(${TEAL_RGB},.6)`; ctx.lineWidth = 2.5; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -T * 50;
        ctx.beginPath(); ctx.moveTo(x1 + fs / 2, y + fs + 60); ctx.lineTo(500, 1320); ctx.moveTo(x2 + fs / 2, y + fs + 60); ctx.lineTo(580, 1320); ctx.stroke(); ctx.restore(); }
    });
  }

  // 10 THEY ALL SLID 3 PIXELS: it knows exactly how far and which way
  { const K = { three: c('3', A.if), ex: c('exactly', A.if), far: c('far', A.if), way: c('which way', A.if) };
    sfx.push({ t: K.three + .45, k: 'success', g: -14 }, { t: K.way, k: 'sweep', g: -18 });
    add(A.if, false, (ctx, T) => {
      ctx.fillStyle = '#0a0b0e'; ctx.fillRect(-W, -H, W * 3, H * 3); glow(ctx, 540, 1000, 900, '70,90,110', .3);
      const ox = 30, oy = 50, fs = 560, n = 18, cs = fs / n, x = 260, y = 640;
      const sh = 3 * eio(clamp((T - K.three) / .6));
      live(ctx, T, 540, y + fs / 2, { yaw: .03, bob: 4, breathe: .003, seed: 3 }, () => {
        pixFrame(ctx, x, y, fs, n, ox, oy, { border: 'rgba(255,255,255,.5)' });
        ctx.save(); ctx.beginPath(); ctx.rect(x - 200, y - 10, fs + 400, fs + 20); ctx.clip(); ctx.globalAlpha = .5; pixFrame(ctx, x + (3 - sh) * cs, y, fs, n, ox + 3, oy, { border: `rgba(${LIME_RGB},.95)`, bw: 4 }); ctx.restore();
        const m = p(T, K.three + .5, .3); specks(ox, oy, n).slice(0, 5).forEach(([sx, sy], i) => { ctx.strokeStyle = `rgba(${m > 0 ? TEAL_RGB : '255,255,255'},${.5 + .5 * m})`; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(x + (sx - ox) * cs, y + (sy - oy) * cs, 24, 0, 7); ctx.stroke(); });
        badge(ctx, x + fs - 70, y - 40, 'MATCH', TEAL_RGB, p(T, K.three + .5, .4));
      });
      // ruler: 3 px
      const ra = p(T, K.three, .4), ry = y + fs + 90; if (ra > 0) { ctx.save(); ctx.globalAlpha = ra; ctx.strokeStyle = LIME; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x, ry); ctx.lineTo(x + 3 * cs * clamp(sh / 3 + .001), ry); for (let i = 0; i <= 3; i++) { ctx.moveTo(x + i * cs, ry - 14); ctx.lineTo(x + i * cs, ry + 14); } ctx.stroke();
        txt(ctx, '3 px', x + 3 * cs + 30, ry + 16, 48, LIME, 800, 'left', MONO); ctx.restore(); }
      // direction readout
      const wa = p(T, K.way, .5, eback); if (wa > 0) { pop(ctx, wa, 540, 1560, () => { glassCard(ctx, 230, 1480, 620, 170, { r: 26 });
        vec(ctx, 300, 1565, 420, 1565, LIME, 8); txt(ctx, 'Δx = +3   Δy = 0', 470, 1580, 44, '#fff', 800, 'left', MONO); }); }
      const ea = p(T, K.ex, .4) * (1 - wa); if (ea > 0) tag(ctx, 540, 1560, 'EXACTLY HOW FAR', ea);
    });
  }

  // 11 IT FIRES A MESSAGE A FEW BYTES LONG, HUNDREDS OR EVEN THOUSANDS OF TIMES A SECOND
  { const K = { msg: c('message', A.then), by: c('bytes', A.then), hun: c('hundreds', A.then), th: c('thousands', A.then) };
    sfx.push({ t: K.msg, k: 'data', g: -17 }, { t: K.th, k: 'sweep', g: -18 });
    add(A.then, false, (ctx, T) => {
      const u = T - A.then, mx = .6 * Math.sin(u * 1.4), my = .3 * Math.sin(u * 2 + 1);
      const d = deskShot(ctx, T, { cam: { dist: 6.6, cy: 1640 }, m: [mx, my], cur: [mx * .22, my * .3 + .05] });
      // packets travelling along the cable to the computer
      const rate = T < K.hun ? 2.5 : T < K.th ? 7 : 16, a0 = p(T, K.msg - .2, .3);
      const nose = [d.g[0], d.g[1] - d.k * .55], dst = d.P(.8, 5.3, 0);
      for (let i = 0; i < 40; i++) { const ph = (T * rate / 6 + i / 40 * 6) % 1; if (i / 40 * 6 > rate * .8) continue;
        const q = eio(ph), x = lerp(nose[0], dst[0], q) + 50 * Math.sin(q * Math.PI), y = lerp(nose[1], dst[1], q);
        ctx.save(); ctx.globalAlpha = a0 * Math.sin(ph * Math.PI); glow(ctx, x, y, 34, LIME_RGB, .8); rr(ctx, x - 16, y - 8, 32, 16, 8); ctx.fillStyle = LIME; ctx.fill(); ctx.restore(); }
      live(ctx, T, 540, 650, { yaw: .03, bob: 3, seed: 2 }, () => flip(ctx, p(T, K.msg - .1, .5, eo5), 300, 640, () => reportCard(ctx, T, 60, 520, 500, { hi: win(T, K.by, K.by + .6, .2), title: 'THE REPORT · 3 BYTES' })));
      const ca = p(T, K.hun - .2, .45, eback), v = T < K.th ? lerp(0, 500, eo(clamp((T - K.hun + .2) / .5))) : lerp(500, 8000, eio(clamp((T - K.th) / .9)));
      if (ca > 0) live(ctx, T, 800, 640, { yaw: .03, bob: 3, seed: 5 }, () => flip(ctx, ca, 800, 640, () => counter(ctx, T, 590, 520, 440, 'REPORTS', fmt(v), '/ s', { h: 230, bar: v / 8000 })));
      title(ctx, 'VALUES ILLUSTRATIVE', 540, 1860, 16, .5, 'rgba(255,255,255,.5)');
    });
  }

  // 12 YOUR COMPUTER ADDS UP THOSE TINY STEPS TO MOVE THE CURSOR (monitor close-up)
  { const K = { st: c('steps', A.adds), cur: c('cursor', A.adds) };
    sfx.push({ t: K.cur, k: 'shimmer', g: -17 });
    add(A.adds, false, (ctx, T) => {
      const P = deskCam({ dist: 9, ty: 4.5, cy: 1400, pitch: .5 }); desk(ctx, T, P, { pad: 0 });
      { const mp = P(.35 * Math.sin((T - A.adds) * 1.4), 2.6), k = 1500 / mp[2]; mouseTop(ctx, T, mp[0], mp[1], k * 1.1, { cableTo: P(.8, 5.3, 0), led: .5 }); }
      const scr = monitor(ctx, T, P, {}, (c2, x, y, w, h) => {
        wallpaper(c2, T, x, y, w, h);
        const N = Math.floor(clamp((T - A.adds - .2) / Math.max(.8, K.cur + .6 - A.adds)) * 26), pts = [];
        for (let i = 0; i <= 26; i++) pts.push([x + w * (.12 + .7 * i / 26), y + h * (.75 - .5 * (i / 26) + .1 * Math.sin(i * .5))]);
        c2.save(); for (let i = 0; i <= N; i++) { c2.fillStyle = `rgba(${LIME_RGB},${.35 + .65 * (i === N)})`; c2.beginPath(); c2.arc(pts[i][0], pts[i][1], 5, 0, 7); c2.fill(); }
        if (N > 0) { c2.strokeStyle = `rgba(${LIME_RGB},.35)`; c2.lineWidth = 2; c2.setLineDash([4, 8]); c2.beginPath(); pts.slice(0, N + 1).forEach((q, i) => i ? c2.lineTo(q[0], q[1]) : c2.moveTo(q[0], q[1])); c2.stroke(); } c2.restore();
        pointer(c2, pts[N][0], pts[N][1], 1.4);
        tag(c2, pts[N][0] + 30, pts[N][1] - 70, 'CURSOR', p(T, K.cur, .4), pts[N][0] + 8, pts[N][1] - 8, { size: 20 });
        const ca = p(T, A.adds + .2, .5, eback);
        if (ca > 0) { c2.save(); c2.globalAlpha = ca; glassCard(c2, x + 30, y + 30, 380, 120); c2.letterSpacing = '3px'; txt(c2, 'CURSOR POSITION', x + 54, y + 66, 17, 'rgba(255,255,255,.55)', 700, 'left', MONO); c2.letterSpacing = '0px';
          txt(c2, 'x ' + (960 + N * 3), x + 54, y + 126, 44, '#fff', 800, 'left', MONO); const fl = ((T * 10) % 1); txt(c2, '+3', x + 270, y + 126 - 10 * fl, 32, `rgba(${LIME_RGB},${1 - fl})`, 800, 'left', MONO); c2.restore(); }
      });
      if (scr) title(ctx, 'EVERY STEP = +3 px', 540, scr.y + scr.h + 210, 30, p(T, K.st, .5), LIME);
    });
  }

  // 13 PROVE IT: run out of mousepad, lift, put it back, the cursor doesn't move
  { const K = { run: c('run out', A.prove), lift: c('lift', A.prove), down: c('down', A.prove), mv: c('move', A.prove) };
    sfx.push({ t: K.lift, k: 'swoosh', g: -19 }, { t: K.mv, k: 'shimmer', g: -16 });
    add(A.prove, false, (ctx, T) => {
      const mx = kf(T, [[A.prove, -.6], [K.lift, 1.9], [K.down - .1, -.6]], eio), lift = kf(T, [[K.lift - .1, 0], [K.lift + .3, .45], [K.down - .3, .45], [K.down + .1, 0]], eio);
      const cx = kf(T, [[A.prove, -.6], [K.lift, 1.9]], eio) * .2;
      const d = deskShot(ctx, T, { cam: { dist: 7, cy: 1600, tx: mx * .25 }, m: [mx, -.2], lift, cur: [cx, .02], mo: { led: .6 } });
      const pe = d.P(2.7, -.2); if (T > K.run - .3 && T < K.down) tag(ctx, pe[0] - 230, pe[1] + 170, 'END OF THE PAD', win(T, K.run - .2, K.lift + .2, .3), pe[0], pe[1] + 10);
      if (lift > .05) tag(ctx, d.g[0], d.g[1] - d.k * (.9 + lift) - 60, 'IN THE AIR', clamp(lift * 3));
      if (d.cp) tag(ctx, d.cp[0], d.cp[1] - 80, 'CURSOR STAYS', p(T, K.down, .4), d.cp[0] + 4, d.cp[1] - 6, { size: 20 });
      title(ctx, 'PROVE IT', 540, 580, 40, p(T, A.prove + .05, .5) * (1 - p(T, K.run, .3)));
    });
  }

  // 14 IN THE AIR THE CAMERA CAN'T SEE YOUR DESK, SO IT STOPS REPORTING
  { const K = { see: c('see', A.air), rep: c('reporting', A.air) };
    sfx.push({ t: K.rep, k: 'glitch', g: -16 });
    add(A.air, false, (ctx, T) => {
      ctx.fillStyle = '#0b0c10'; ctx.fillRect(-W, -H, W * 3, H * 3); glow(ctx, 540, 1100, 900, '90,100,130', .25);
      const lift = .6 + .05 * Math.sin(T * 2);
      live(ctx, T, 560, 1250, { yaw: .01, bob: 3, breathe: .003, seed: 2 }, () => {
        const r = sideCut(ctx, T, 560, 1420, 860, { lift, beam: 1, rays: 1, blur: 1 });
        tag(ctx, r.spot[0] + 250, r.spot[1] - 120, 'OUT OF FOCUS', p(T, K.see, .4), r.spot[0] + 60, r.spot[1] - 6);
        const h = d => d; // keep lints quiet
      });
      const ca = p(T, A.air + .1, .5, eo5);
      live(ctx, T, 540, 680, { yaw: .04, bob: 4, seed: 3 }, () => flip(ctx, ca, 540, 680, () => { card(ctx, 180, 540, 720, 300, { r: 26, fill: '#f6f7f3', dark: true });
        pixFrame(ctx, 210, 570, 240, 18, 0, 0, { mode: 'blur', border: 'rgba(0,0,0,.3)', seed: Math.floor(T * 8) });
        ctx.letterSpacing = '3px'; txt(ctx, 'WHAT THE', 490, 660, 24, 'rgba(20,22,28,.55)', 700, 'left', MONO); txt(ctx, 'SENSOR SEES', 490, 700, 24, 'rgba(20,22,28,.55)', 700, 'left', MONO); ctx.letterSpacing = '0px';
        txt(ctx, 'just blur', 490, 770, 40, INK, 800, 'left'); }));
      badge(ctx, 540, 1730, '0 REPORTS', RED_RGB, p(T, K.rep, .4), 34);
    });
  }

  // 15 BUT ON A GLASS TABLE THE CURSOR FREEZES: every photo looks the same, nothing to compare
  { const K = { fr: c('freezes', A.glass), sm: c('smooth', A.glass), same: c('same', A.glass), no: c('nothing', A.glass) };
    sfx.push({ t: K.fr, k: 'glitch', g: -16 }, { t: K.no, k: 'glitch', g: -17 });
    add(A.glass, false, (ctx, T) => {
      const u = T - A.glass, mx = .8 * Math.sin(u * 1.5), my = .35 * Math.sin(u * 2.1);
      const fz = T > K.fr - .2, cxy = fz ? [.8 * Math.sin((K.fr - .2 - A.glass) * 1.5) * .22, .35 * Math.sin((K.fr - .2 - A.glass) * 2.1) * .3 + .05] : [mx * .22, my * .3 + .05];
      const d = deskShot(ctx, T, { cam: { dist: 6.8, cy: 1620 }, m: [mx, my], glass: p(T, A.glass, .7), cur: cxy, mo: { led: .7 } });
      if (d.cp) { const fa = p(T, K.fr, .35); if (fa > 0) { badge(ctx, d.cp[0] + 10, d.cp[1] - 60, 'FROZEN', RED_RGB, fa, 22); } }
      const ca = p(T, K.sm, .5, eo5);
      live(ctx, T, 540, 660, { yaw: .03, bob: 4, seed: 4 }, () => flip(ctx, ca, 540, 660, () => {
        card(ctx, 160, 540, 760, 250, { r: 24, fill: '#f6f7f3', dark: true });
        const sa = p(T, K.same, .4);
        pixFrame(ctx, 195, 565, 200, 18, 0, 0, { mode: 'glass', border: 'rgba(0,0,0,.25)', seed: 1 }); pixFrame(ctx, 685, 565, 200, 18, 0, 0, { mode: 'glass', border: 'rgba(0,0,0,.25)', seed: 2 });
        txt(ctx, 'PHOTO 1', 195, 788, 16, 'rgba(20,22,28,.5)', 700, 'left', MONO); txt(ctx, 'PHOTO 2', 685, 788, 16, 'rgba(20,22,28,.5)', 700, 'left', MONO);
        txt(ctx, sa > 0 ? '=' : '?', 540, 700, 90, `rgba(${p(T, K.no, .3) > 0 ? RED_RGB : '20,22,28'},.9)`, 900);
      }));
      badge(ctx, 540, 520, 'NO MATCH', RED_RGB, p(T, K.no, .4), 26);
      if (T > K.sm) tag(ctx, 540, 1850, 'GLASS = NO TEXTURE', p(T, K.sm, .4));
    });
  }

  // 16 SOME MICE FIX THAT WITH A LASER THAT TRACKS THE TINY DUST ON THE GLASS
  { const K = { las: c('laser', A.some), dust: c('dust', A.some) };
    sfx.push({ t: K.las, k: 'shimmer', g: -16 }, { t: K.dust + .2, k: 'success', g: -15 });
    add(A.some, false, (ctx, T) => {
      const u = T - A.some, mx = .8 * Math.sin(u * 1.5 + 2), my = .35 * Math.sin(u * 2.1 + 1), go = T > K.dust;
      const d = deskShot(ctx, T, { cam: { dist: 6.8, cy: 1620 }, m: [mx, my], glass: 1, cur: go ? [mx * .22, my * .3 + .05] : [.12, .08], mo: { led: .9 * p(T, K.las, .4) } });
      // laser dot under the mouse
      const la = p(T, K.las, .3); if (la > 0) { glow(ctx, d.g[0], d.g[1], 120, '255,80,80', la); ctx.fillStyle = `rgba(255,120,120,${la})`; ctx.beginPath(); ctx.arc(d.g[0], d.g[1], 6, 0, 7); ctx.fill(); }
      tag(ctx, 300, 1340, 'LASER SENSOR', p(T, K.las, .4), d.g[0] - 20, d.g[1] - d.k * .3);
      const lm = p(T, K.las, .4);
      live(ctx, T, 540, 660, { yaw: .03, bob: 4, seed: 4 }, () => {
        card(ctx, 160, 540, 760, 250, { r: 24, fill: '#f6f7f3', dark: true });
        const ox = 10 + Math.floor(T * 6) * .5;
        pixFrame(ctx, 195, 565, 200, 18, ox, 0, { mode: lm > .5 ? 'laser' : 'glass', border: 'rgba(0,0,0,.25)', seed: 1 }); pixFrame(ctx, 685, 565, 200, 18, ox + 2, 0, { mode: lm > .5 ? 'laser' : 'glass', border: 'rgba(0,0,0,.25)', seed: 2 });
        txt(ctx, 'PHOTO 1', 195, 786, 16, 'rgba(20,22,28,.5)', 700, 'left', MONO); txt(ctx, 'PHOTO 2', 685, 786, 16, 'rgba(20,22,28,.5)', 700, 'left', MONO);
        txt(ctx, go ? '=' : '?', 540, 700, 90, go ? `rgba(${TEAL_RGB},1)` : 'rgba(20,22,28,.9)', 900);
      });
      badge(ctx, 540, 520, 'MATCH', TEAL_RGB, p(T, K.dust + .2, .4), 26);
      if (go) tag(ctx, d.g[0] + 200, d.g[1] + 120, 'TINY DUST', p(T, K.dust, .4), d.g[0] + 20, d.g[1] + 10, { size: 20 });
    });
  }

  // 17 THE COMPUTER NEVER KNEW WHERE THE MOUSE WAS: it just counted thousands of tiny photos (top view filmstrip)
  { const K = { cnt: c('counted', A.knew), th: c('thousands', A.knew), dk: c('desk', A.knew) };
    sfx.push({ t: K.cnt, k: 'sweep', g: -18 }, { t: K.dk + .1, k: 'shimmer', g: -18 });
    add(A.knew, false, (ctx, T) => {
      const P = deskCam({ pitch: .38, dist: 6.2, cy: 1180 }); desk(ctx, T, P, { pad: 1, lamp: .7 });
      const path = q => [-1.05 + 2.6 * q + .45 * Math.sin(q * 9), -1.7 + 3.6 * q + .35 * Math.sin(q * 6 + 1)];
      const t0 = Math.min(K.cnt, K.th, K.dk) - .3, prog = clamp((T - t0) / 3.4), N = Math.floor(prog * 110);
      for (let i = 0; i < N; i++) { const q = i / 110, a = path(q), b = path(q + .01), pa = P(a[0], a[1]), pb = P(b[0], b[1]); if (!pa || !pb) continue;
        photo(ctx, pa[0], pa[1], 58, Math.atan2(pb[1] - pa[1], pb[0] - pa[0]), i * 1.7, i * .6, clamp((N - i) / 3) * .95, 6); }
      const mq = N > 0 ? path(prog) : path(0), mp = P(mq[0], mq[1]), k = 1500 / mp[2];
      const ol = win(T, A.knew + .05, t0, .2);
      mouseTop(ctx, T, mp[0], mp[1], k * .95, { sq: .93, h: .1, outline: ol, rot: .6, led: .6 });
      if (ol > .05) pop(ctx, ol, mp[0], mp[1] - 230, () => txt(ctx, '?', mp[0], mp[1] - 170, 150, 'rgba(255,255,255,.95)', 900));
      const ca = p(T, Math.min(K.cnt, K.th) - .1, .45, eback);
      if (ca > 0) live(ctx, T, 540, 600, { yaw: .04, bob: 4, seed: 7 }, () => flip(ctx, ca, 540, 600, () => counter(ctx, T, 220, 520, 640, 'PHOTOS COUNTED', fmt(N * 137 + Math.max(0, T - t0) * 900), '', { sub: '18 × 18 PX EACH', bar: prog })));
    });
  }

  // 18 ENDING: the sensor "sees" this video's code as its desk, then the same mouse posts "guide" and clicks the bio link
  { const K = { code: c('code', A.crazy), com: c('comment', A.crazy), gd: c('guide', A.crazy), yt: c('youtube', A.crazy), link: c('link', A.crazy), bio: c('bio', A.crazy) };
    const cta = Math.min(K.link, K.bio), post = K.gd + .55, clk = cta + .35;
    sfx.push({ t: A.crazy + .05, k: 'riser', g: -18 }, { t: K.code + .1, k: 'success', g: -14 }, { t: post, k: 'click', g: -11 }, { t: K.yt - .05, k: 'swoosh', g: -17 }, { t: clk, k: 'click', g: -10 });
    // code laid on the mousepad (world units), scrolling toward the camera
    const codeOn = (c2, scroll, xform) => { CODE.concat(CODE).forEach(([l, col], i) => { const wy = 2.0 - i * .34 + scroll; if (wy < -2.3 || wy > 2.3) return; xform(c2, l, col, -2.45, wy); }); };
    let sens = null, sx = null;
    add(A.crazy, false, (ctx, T) => {
      const u = T - A.crazy, scroll = (u * .45) % (CODE.length * .34);
      const zoom = p(T, K.com - .35, 1.0, eio); // push toward the monitor for the comment + bio
      const cam = { dist: lerp(5.4, 8, zoom), cy: lerp(1300, 1450, zoom), ty: lerp(0, 2.2, zoom) };
      // cursor path on the monitor (normalised), the mouse follows it on the pad
      const box = [-.12, .06], postB = [.26, .06], linkB = [.05, -.2];
      let cur = [.25 * Math.sin(u * 1.3), .2 * Math.sin(u * 1.7)];
      if (T > K.com - .4) cur = kf(T, [[K.com - .4, cur], [K.gd - .1, box], [post - .15, postB], [K.yt + .2, postB], [clk - .1, linkB]]);
      const m0 = [-1.1 + cur[0] * 2.4, -.2 + cur[1] * 2], m1 = [cur[0] * 4, 1.0 + cur[1] * 2.5], m = [lerp(m0[0], m1[0], zoom), lerp(m0[1], m1[1], zoom)];
      const press = Math.max(clamp(1 - Math.abs(T - post) / .12), clamp(1 - Math.abs(T - clk) / .12));
      const screen = (c2, x, y, w, h) => {
        const ca = p(T, K.com - .2, .5, eo5), ba = p(T, K.yt - .1, .5, eo5);
        if (ca > 0 && ba < 1) { c2.save(); c2.globalAlpha = ca * (1 - ba); const px = x + w * .1, py = y + h * .14, pw = w * .8, ph = h * .62;
          glassCard(c2, px, py, pw, ph, { r: 16 }); txt(c2, 'Comments', px + 26, py + 46, Math.max(18, h * .06), '#fff', 800, 'left');
          const iy = py + ph * .42; rr(c2, px + 22, iy, pw * .62, ph * .2, ph * .1); c2.fillStyle = '#1b2029'; c2.fill(); c2.strokeStyle = T > K.gd - .2 ? 'rgba(120,160,255,.8)' : 'rgba(255,255,255,.2)'; c2.lineWidth = 2; c2.stroke();
          const g2 = typed('guide', T, K.gd - .1, K.gd + .25); txt(c2, g2 || 'Add a comment…', px + 44, iy + ph * .13, Math.max(16, h * .055), g2 ? '#fff' : '#7a8290', g2 ? 700 : 500, 'left');
          const bx = px + pw * .7, bw = pw * .26; rr(c2, bx, iy, bw, ph * .2, ph * .1); c2.fillStyle = T > post ? '#30c060' : BLUE; c2.fill(); txt(c2, T > post ? 'Posted ✓' : 'Post', bx + bw / 2, iy + ph * .13, Math.max(16, h * .05), '#fff', 800);
          const pa = p(T, post + .05, .4, eback); if (pa > 0) pop(c2, pa, px + pw / 2, py + ph * .82, () => { avatarSmall(c2, px + 44, py + ph * .82, 18); txt(c2, 'guide', px + 76, py + ph * .82 + 8, Math.max(16, h * .055), '#fff', 700, 'left'); txt(c2, 'just now', px + pw - 26, py + ph * .82 + 8, Math.max(12, h * .04), 'rgba(255,255,255,.5)', 500, 'right'); });
          c2.restore(); }
        if (ba > 0) { c2.save(); c2.globalAlpha = ba; const px = x + w * .08, py = y + h * .1, pw = w * .84, ph = h * .7;
          glassCard(c2, px, py, pw, ph, { r: 16 }); const ar = ph * .16; avatar(c2, T, px + 30 + ar, py + 26 + ar, ar, true);
          if (named) { txt(c2, 'agentsoly', px + 60 + ar * 2, py + 26 + ar * .9, ph * .1, '#fff', 800, 'left'); txt(c2, 'Explainers built 100% in code', px + 60 + ar * 2, py + 26 + ar * 1.6, ph * .055, 'rgba(255,255,255,.6)', 500, 'left'); }
          else txt(c2, 'Explainers built 100% in code', px + 60 + ar * 2, py + 26 + ar * 1.2, ph * .06, 'rgba(255,255,255,.7)', 600, 'left');
          const yy = py + ph * .55; pill(c2, px + 30, yy, '▶ YouTube', { bg: '#e62117', size: ph * .055, h: ph * .12, align: 'left' }); pill(c2, px + 30 + pw * .33, yy, '♪ TikTok', { bg: '#0b0b0f', size: ph * .055, h: ph * .12, align: 'left', stroke: 'rgba(255,255,255,.35)' });
          const hl = p(T, clk, .3), ly = py + ph * .72, lh = ph * .17; rr(c2, px + 30, ly, pw - 60, lh, 12); c2.fillStyle = `rgba(47,123,255,${.18 + .5 * hl})`; c2.fill(); c2.strokeStyle = `rgba(110,160,255,${.5 + .5 * hl})`; c2.lineWidth = 2; c2.stroke();
          txt(c2, '🔗  Link in bio · full guide', px + 54, ly + lh * .64, ph * .065, '#dfe8ff', 800, 'left');
          c2.restore(); }
      };
      const curS = zoom > .3 ? cur.map((v, i) => i ? v : v) : cur;
      const d = deskShot(ctx, T, { cam, m, rot: .08 * Math.sin(u), cur: curS, curA: 1, press, screen, mo: { led: .8, xray: (1 - zoom) * .0 }, code: (c2, P) => {
        codeOn(c2, scroll, (cc, l, col, wx, wy) => { const q = P(wx, wy); if (!q) return; const k = 1500 / q[2]; cc.save(); cc.translate(q[0], q[1]); cc.scale(1, .62); cc.font = MONO(600, k * .16); cc.fillStyle = col; cc.globalAlpha = .9; cc.fillText(l, 0, 0); cc.restore(); }); } });
      // sensor view card: the pixels the camera sees right now (real pixelation of the code under the mouse)
      const sa = (1 - zoom) * p(T, A.crazy + .2, .5, eo5);
      if (sa > 0) { if (!sens) { sens = new OffscreenCanvas(36, 36); sx = sens.getContext('2d'); } sx.setTransform(1, 0, 0, 1, 0, 0); sx.fillStyle = '#1a1f28'; sx.fillRect(0, 0, 36, 36); const sc = 36 / 1.3; sx.setTransform(sc, 0, 0, sc, 18 - m[0] * sc, 18 + m[1] * sc);
        codeOn(sx, scroll, (cc, l, col, wx, wy) => { cc.font = MONO(600, .16); cc.fillStyle = col; cc.fillText(l, wx, -wy); });
        live(ctx, T, 540, 690, { yaw: .04, bob: 4, seed: 9 }, () => flip(ctx, sa, 540, 690, () => {
          card(ctx, 160, 520, 760, 340, { r: 26, fill: '#f6f7f3', dark: true });
          ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(sens, 190, 550, 280, 280); ctx.restore(); pixFrame;
          ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 1; i < 36; i++) { ctx.moveTo(190 + i * 280 / 36, 550); ctx.lineTo(190 + i * 280 / 36, 830); ctx.moveTo(190, 550 + i * 280 / 36); ctx.lineTo(470, 550 + i * 280 / 36); } ctx.stroke();
          brackets(ctx, 182, 542, 296, 296, 1, 26, '120,140,20');
          ctx.letterSpacing = '3px'; txt(ctx, 'WHAT THE', 505, 610, 22, 'rgba(20,22,28,.55)', 700, 'left', MONO); txt(ctx, 'SENSOR SEES', 505, 645, 22, 'rgba(20,22,28,.55)', 700, 'left', MONO); ctx.letterSpacing = '0px';
          txt(ctx, 'this video’s', 505, 720, 36, INK, 800, 'left'); txt(ctx, 'own code', 505, 765, 36, INK, 800, 'left');
          txt(ctx, 'FRAME ' + fmt(Math.floor(T * 30)), 505, 820, 20, 'rgba(20,22,28,.5)', 700, 'left', MONO);
        }));
        const st = p(T, K.code, .45, eback); if (st > 0) pop(ctx, st, 540, 960, () => badge(ctx, 540, 960, '100% CODE', LIME_RGB, 1, 34), -.2);
      }
      if (d.cp && press > 0) { ctx.save(); ctx.strokeStyle = `rgba(110,160,255,${press})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(d.cp[0], d.cp[1], 20 + 30 * (1 - press), 0, 7); ctx.stroke(); ctx.restore(); }
      if (zoom > 0 && T > post - .3 && T < post + .8) tag(ctx, d.g[0] + 170, d.g[1] - 120, 'CLICK', win(T, post - .25, post + .7, .2), d.g[0] + 10, d.g[1] - d.k * .4, { size: 20 });
      if (T > clk - .3) tag(ctx, d.g[0] + 170, d.g[1] - 120, 'CLICK', win(T, clk - .25, clk + .9, .2), d.g[0] + 10, d.g[1] - d.k * .4, { size: 20 });
    });
  }

  list.forEach((sc, i) => sc.end = list[i + 1] ? list[i + 1].start : 1e9);
  // sound rule: small UI hits only as single hits >= 1.5 s apart (whooshes/risers/sweeps are free)
  sfx.sort((a, b) => a.t - b.t); let last = -9; const out = [];
  for (const q of sfx) { if (SMALL.has(q.k)) { if (q.t - last < 1.5) continue; last = q.t; } out.push(q); }
  return { scenes: list, sfx: out };
}
function avatarSmall(ctx, x, y, r) { ctx.fillStyle = '#4a5160'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.fillStyle = '#cfd6e2'; ctx.beginPath(); ctx.arc(x, y - r * .25, r * .35, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y + r * .55, r * .6, r * .38, 0, Math.PI, 0); ctx.fill(); }
