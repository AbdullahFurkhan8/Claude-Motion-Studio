// "Your MacBook trackpad has no button" explainer. All timing from word cues c('phrase', after); everything drawn in code (mac.js).
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, hash, GOLD, rr, label, note, ring, alive, flipIn, finger, proj3 } from './lib.js';
import { FONT, cursor } from './art.js';
import { AMBER, room, studio, deck, laptop, screenOff, desktop, dockBar, win, finderBody, notesBody, lookupCard, trackpadPanel, cutaway, coilBox, along,
  box3, copperFill, hand, pill, forceMeter, xmark, check, fingertipMacro, oldPad } from './mac.js';
const kf = (T, keys, e = eio) => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (T < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e((T - t0) / (t1 - t0)); return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u); }
  return keys[keys.length - 1][1];
};
const txt = (ctx, s, x, y, size, col = '#fff', w = 700, align = 'center') => { ctx.fillStyle = col; ctx.font = FONT(w, size); ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); };
const live = (ctx, T, x, y, o, fn) => { ctx.save(); alive(ctx, T, x, y, o); fn(); ctx.restore(); };
const pop = (ctx, a, x, y, fn, rot = 0) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.rotate(rot * (1 - a)); ctx.scale(a, a); fn(); ctx.restore(); };
const zoom = (ctx, z, x, y) => { ctx.translate(x, y); ctx.scale(z, z); ctx.translate(-x, -y); };
const RED = '255,80,80', GREEN = '52,199,89', BLUE = '90,160,255';
// haptic "click": a damped sideways shake starting at t0 (px)
const jolt = (T, t0, amp = 22) => T < t0 ? 0 : amp * Math.sin((T - t0) * 44) * Math.exp(-(T - t0) * 9);
// press depth for a tap at t0 (0..1, quick down and up)
const tap = (T, t0, d = .35) => T < t0 || T > t0 + d ? 0 : Math.sin((T - t0) / d * Math.PI);
// a point on the trackpad (fractions u,v of the pad) in deck-local coords
const tp = (geo, u, v) => [geo.px + geo.pw * u, geo.py + geo.ph * v];
const SENS = [[.158, .208], [.842, .208], [.158, .792], [.842, .792]]; // corner sensors as pad fractions (matches trackpadXray)

export const KEYWORDS = 'macbook button mysterious brain clicked magnet faking shut click switch sensor corner measure hard force decides pulse current coil split rail sideways back fingertip sharp exact taptic nothing anywhere top bottom change harder second deeper settings choose never tapped crazy code guide bio';
export const EMOJI = { macbook: '💻', magnet: '🧲', pulse: '⚡', brain: '🧠', code: '💻', guide: '💬', bio: '🔗' };
export const CAPTION_SFX = false;
// Hinglish voice: same scenes, cues mapped to the words it says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      'so what are': 'to aap asal', 'try this': 'ye try', 'on any recent': 'kisi bhi naye', instead: 'uski jagah', 'the moment your': 'jaise hi', 'it fires': 'wo wire',
      'the magnet pulls': 'wo magnet trackpad', 'your fingertip': 'aapki ungli wo', 'apple calls': 'ise taptic', 'but when your': 'lekin jab', 'your finger is': 'aapki ungli daba',
      "that's also why": 'isliye aap ise', 'older macbook': 'purane macbook', "and it's why": 'aur isliye aapka', 'and in your settings': 'aur settings', "so you've never": 'to aapne kabhi',
      "and here's": 'aur sabse', 'if you want': 'agar aap bhi',
      feeling: 'feel', brain: 'dimaag', clicked: 'click hua', faking: 'naatak', shut: 'shutdown', press: 'dabaiye', 'no click': 'koi click', recent: 'naye', under: 'neeche',
      tiny: 'chhota', measure: 'naapte', hard: 'zor', pushing: 'daba rahi', crosses: 'upar jaata', decides: 'decide', split: 'ek pal', whole: 'poora', sideways: 'side', back: 'wapas',
      sharp: 'tez', exact: 'theek usi', real: 'asli', pressing: 'daba', 'nothing is': 'wapas koi', anywhere: 'kahin', top: 'upar', bottom: 'neeche ki', change: 'badal',
      harder: 'zor', second: 'doosra', deeper: 'gehra', clicks: 'click hone', never: 'kabhi', tapped: 'tap', moment: 'sahi pal', send: 'bhej',
    },
    keywords: 'macbook button mysterious dimaag magnet naatak shutdown switch sensor corner naapte zor force decide pulse current coil pal rail jhatka wapas ungli tez taptic kahin upar neeche badal doosra gehra settings choose kabhi tap crazy code guide bio',
    emoji: { macbook: '💻', magnet: '🧲', pulse: '⚡', dimaag: '🧠', code: '💻', guide: '💬', bio: '🔗' },
  },
};

export function makeScenes(c, lang = 'en') {
  const named = lang !== 'hi'; // Hindi version: profile picture only, no channel name
  const list = [], sfx = [];
  const add = (start, draw) => { list.push({ start, light: false, draw }); if (start > 0) sfx.push({ t: start - .12, k: 'whoosh', g: -17 }); };
  const s = x => x - .1;
  const A = { what: s(c('so what are')), try: s(c('try this')), recent: s(c('on any recent')), instead: s(c('instead')), moment: s(c('the moment your')), fires: s(c('it fires')),
    pulls: s(c('the magnet pulls')), tip: s(c('your fingertip')), apple: s(c('apple calls')), shut: s(c('but when your')), finger: s(c('your finger is', c('but when your'))), anywhere: s(c("that's also why")),
    older: s(c('older macbook')), change: s(c("and it's why")), settings: s(c('and in your settings')), never: s(c("so you've never")), crazy: s(c("and here's")), guide: s(c('if you want')) };
  const FY = 1180; // glass line of the side cutaway

  // 1 HOOK: the trackpad has no button, yet your brain is sure it clicked
  { const K = { tp: c('trackpad'), button: c('button'), myst: c('mysterious'), brain: c('brain'), click: c('clicked'), end: A.what };
    sfx.push({ t: .15, k: 'click', g: -12 }, { t: K.button, k: 'glitch', g: -16 }, { t: K.myst, k: 'shimmer', g: -16 }, { t: K.click, k: 'tick', g: -9 });
    add(0, (ctx, T) => {
      studio(ctx, T);
      const z = kf(T, [[0, 1.35], [K.button, 1.05], [K.end, 1.15]]); ctx.save(); zoom(ctx, z, 600, FY - 40);
      const pr = Math.max(tap(T, .15, .4), tap(T, K.click - .05, .4)), j = jolt(T, .2, 10) + jolt(T, K.click, 18);
      const geo = cutaway(ctx, T, { y: FY, jolt: j, press: 3 * pr, coil: Math.max(tap(T, .18, .3), tap(T, K.click, .35)) });
      // the switch that isn't there
      const ga = p(T, K.button - .1, .4);
      if (ga > 0) { ctx.save(); ctx.globalAlpha = ga * (1 - p(T, K.brain, .4)); ctx.setLineDash([12, 10]); ctx.strokeStyle = `rgb(${RED})`; ctx.lineWidth = 4; rr(ctx, 520, FY + 85, 120, 56, 10); ctx.stroke(); ctx.restore(); xmark(ctx, 580, FY + 113, 40, p(T, K.button + .2, .3) * (1 - p(T, K.brain, .4))); }
      finger(ctx, { x: 600, y: geo.top + 2 + 3 * pr, ang: -.62, wid: 230, len: 1500, T });
      if (T > K.click) ring(ctx, 600, geo.top, (T - K.click) * 1.6, AMBER, 30, 220);
      ctx.restore();
      label(ctx, 'GLASS', 900, FY - 200, p(T, .5, .4), 900, FY - 64, 22); label(ctx, 'COIL', 330, FY + 250, p(T, K.tp, .4), 330, FY + 76, 22);
      label(ctx, 'NO SWITCH', 580, FY + 250, p(T, K.button, .4) * (1 - p(T, K.brain, .4)), 580, FY + 145, 22);
      if (T > K.myst - .1 && T < K.brain) txt(ctx, '?', 860, 760 + 14 * Math.sin(T * 3), 150, `rgba(${GOLD},${p(T, K.myst - .1, .3) * (1 - p(T, K.brain - .2, .2))})`, 900);
      pill(ctx, 540, 1700, 'click', { a: p(T, K.click, .35, eback), col: AMBER, icon: '✓' });
      note(ctx, 'Magnified illustration', 40, H - 60, 1);
    });
  }
  // 2 WHAT ARE YOU FEELING: not a button, a magnet faking a click
  { const s0 = A.what, K = { feel: c('feeling', s0), button: c('button', s0), magnet: c('magnet', s0), fake: c('faking', s0), end: A.try };
    sfx.push({ t: K.button, k: 'pop', g: -14 }, { t: K.button + .35, k: 'glitch', g: -16 }, { t: K.magnet, k: 'riser', g: -18 }, { t: K.fake, k: 'tick', g: -9 });
    add(s0, (ctx, T) => {
      studio(ctx, T);
      const z = kf(T, [[s0, 1.1], [K.magnet, 1.3], [K.end, 1.45]]); ctx.save(); zoom(ctx, z, 520, FY + 40);
      const mg = p(T, K.magnet, .5), f = clamp(mg - p(T, K.fake + .6, .5) * .6), pr = tap(T, K.fake - .05, .4);
      const geo = cutaway(ctx, T, { y: FY, jolt: jolt(T, K.fake, 20), press: 3 * pr, coil: f * (.7 + .3 * Math.sin(T * 9)), field: f });
      // a classic button appears under the glass... and gets crossed out
      const ba = p(T, K.button - .1, .4, eback) * (1 - p(T, K.magnet - .2, .3));
      pop(ctx, ba, 580, FY + 105, () => { rr(ctx, -60, -10, 120, 46, 8); ctx.fillStyle = '#3a3d44'; ctx.fill(); ctx.fillStyle = '#9aa0aa'; ctx.beginPath(); ctx.ellipse(0, -10, 36, 22, 0, Math.PI, 0); ctx.fill(); });
      xmark(ctx, 580, FY + 105, 50, p(T, K.button + .35, .3) * (1 - p(T, K.magnet - .2, .3)));
      finger(ctx, { x: 640, y: geo.top + 2 + 3 * pr, ang: -.6, wid: 230, len: 1500, T });
      if (T > K.fake) ring(ctx, 640, geo.top, (T - K.fake) * 1.6, AMBER, 30, 220);
      ctx.restore();
      if (T < K.button) txt(ctx, '?', 540, 820 + 10 * Math.sin(T * 3), 160, `rgba(${GOLD},${p(T, K.feel - .2, .3)})`, 900);
      label(ctx, 'BUTTON?', 580, 1520, ba, 580, FY + 160, 22);
      pill(ctx, 540, 1640, 'MAGNET', { a: p(T, K.magnet, .4, eback), col: AMBER, icon: '🧲' });
      pill(ctx, 540, 1780, 'fake click', { a: p(T, K.fake, .4, eback), size: 36, col: '255,255,255' });
      note(ctx, 'Magnified illustration', 40, H - 60, 1);
    });
  }
  // 3 TRY THIS: shut the Mac down and press the trackpad -> no click
  { const s0 = A.try, K = { shut: c('shut', s0), press: c('press', s0), no: c('no click', s0), end: A.recent };
    sfx.push({ t: K.shut + .2, k: 'shutter', g: -14 }, { t: K.press + .3, k: 'drip', g: -20 }, { t: K.no, k: 'glitch', g: -15 });
    add(s0, (ctx, T) => {
      room(ctx, T, { desk: 1500 });
      const z = kf(T, [[s0, 1], [K.press, 1.05], [K.no, 1.3]]); ctx.save(); zoom(ctx, z, 560, 1400);
      const off = p(T, K.shut, .5);
      const { P, geo } = laptop(ctx, T, 560, 1380, .78, { screenFn: (c2, w, h) => { desktop(c2, w, h, T); if (off > 0) { c2.globalAlpha = off; screenOff(c2, w, h, T); c2.globalAlpha = 1; } } });
      const [u, v] = tp(geo, .55, .55), [hx, hy] = P(u, v), hin = p(T, K.press - .3, .6, eo5), pr = tap(T, K.press + .3, .45) + tap(T, K.no, .45);
      hand(ctx, lerp(hx + 500, hx, hin), lerp(hy + 700, hy, hin) + 6 * pr, -.45, .78 - .03 * pr, hin);
      if (T > K.press + .3) ring(ctx, hx, hy, ((T - K.press - .3) * 1.2) % 1, '200,200,200', 10, 70);
      ctx.restore();
      pill(ctx, 540, 640, 'SHUT DOWN', { a: p(T, K.shut, .35, eback) * (1 - p(T, K.press, .3)), size: 38, icon: '⏻' });
      pill(ctx, 540, 1720, 'NO CLICK', { a: p(T, K.no - .05, .35, eback), col: RED, icon: '🔇' });
    });
  }
  // 4 NO SWITCH: top view of a recent MacBook, x-ray under the trackpad
  { const s0 = A.recent, K = { recent: c('recent', s0), sw: c('switch', s0), under: c('under', s0), end: A.instead };
    sfx.push({ t: s0 + .2, k: 'sweep', g: -16 }, { t: K.sw, k: 'glitch', g: -15 }, { t: K.under + .1, k: 'shimmer', g: -16 });
    add(s0, (ctx, T) => {
      room(ctx, T, { lamp: .5, desk: 2400 });
      const z = kf(T, [[s0, .9], [K.recent + .5, 1], [K.end, 1.12]]), y0 = kf(T, [[s0, 1000], [K.end, 880]]); ctx.save(); zoom(ctx, z, 540, 1150);
      live(ctx, T, 540, y0, { yaw: .03, bob: 4 }, () => { ctx.translate(540, y0); const xr = Math.min(Math.max(p(T, K.under, .6), p(T, K.sw, .6)), 1);
        const geo = deck(ctx, T, 1500, { xray: xr * .9 });
        const [cx, cy] = tp(geo, .5, .45), a = p(T, K.sw - .1, .4);
        if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -T * 30; ctx.strokeStyle = `rgb(${RED})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, 110 * eback(a), 0, 7); ctx.stroke(); ctx.restore(); xmark(ctx, cx, cy, 55, p(T, K.sw + .2, .3)); } });
      ctx.restore();
      pill(ctx, 540, 1720, 'NO SWITCH', { a: p(T, K.sw, .35, eback), col: RED, size: 40 });
      note(ctx, 'Illustration, parts simplified', 40, H - 60, 1);
    });
  }
  // 5 SENSORS: one force sensor in each corner; together they measure how hard you push
  { const s0 = A.instead, K = { tiny: c('tiny', s0), sensor: c('sensor', s0), corner: c('corner', s0), measure: c('measure', s0), hard: c('hard', s0), push: c('pushing', s0), end: A.moment };
    const tA = Math.min(K.sensor, K.corner), tB = Math.max(K.sensor, K.corner);
    sfx.push({ t: tA, k: 'pop', g: -13 }); [0, 1, 2, 3].forEach(i => sfx.push({ t: tB + i * .12, k: 'tick', g: -16 })); sfx.push({ t: K.measure, k: 'data', g: -16 }, { t: K.hard, k: 'swoosh', g: -16 });
    add(s0, (ctx, T) => {
      room(ctx, T, { lamp: .45, desk: 2400 });
      const geoProbe = { px: -375, py: 255 - 204, pw: 750, ph: 408 }; // trackpad of a 1500-wide deck (matches deck())
      const [sx, sy] = tp(geoProbe, SENS[1][0], SENS[1][1]);
      const zk = kf(T, [[s0, 0], [tA + .1, 0], [tA + .6, 1], [K.measure - .3, 1], [K.measure + .3, 0]]);
      const z = lerp(1, 2.4, zk), fx = lerp(540, 540 + sx, zk), fy = lerp(1100, 900 + sy, zk);
      ctx.save(); ctx.translate(540, 1100); ctx.scale(z, z); ctx.translate(-fx, -fy);
      ctx.save(); ctx.translate(540, 900);
      const press = p(T, K.measure, .5) * (1 + .6 * p(T, K.hard, .5)), touch = [.62, .42];
      const vals = SENS.map(([u, v]) => 34 * press * (1.25 - Math.hypot(u - touch[0], v - touch[1])) + 2 * Math.sin(T * 9 + u * 7) * press);
      const hi = SENS.map((_, i) => Math.max(p(T, tB + i * .12, .2) * (1 - p(T, tB + i * .12 + .5, .4)), press * .6));
      const geo = deck(ctx, T, 1500, { xray: 1, vals, valsA: p(T, K.measure, .4), sensorHi: hi });
      ctx.restore(); ctx.restore();
      const [hx, hy] = tp(geo, touch[0], touch[1]), hin = p(T, K.measure - .3, .5, eo5);
      if (hin > 0) hand(ctx, lerp(540 + hx + 500, 540 + hx, hin), lerp(900 + hy + 700, 900 + hy, hin) + 4 * press, -.4, 1 - .03 * press, hin);
      label(ctx, 'FORCE SENSOR', 760, 1500, zk * p(T, tA + .3, .4), 700, 1250, 24);
      if (T > K.measure) pill(ctx, 540, 1760, `${Math.round(clamp(vals.reduce((a, b) => a + b, 0), 0, 999))} g`, { a: p(T, K.measure, .4, eback), col: AMBER, size: 40, icon: '⚖' });
      note(ctx, 'Illustration · values illustrative', 40, H - 60, 1);
    });
  }
  // 6 THRESHOLD: push crosses a set force -> your Mac decides it's a click
  { const s0 = A.moment, K = { cross: c('crosses', s0), force: c('force', s0), decide: c('decides', s0), end: A.fires }; K.click = c('click', K.decide);
    sfx.push({ t: K.force, k: 'riser', g: -18 }, { t: K.force + .5, k: 'tick', g: -10 }, { t: K.decide, k: 'swoosh', g: -15 }, { t: K.click, k: 'click', g: -9 });
    add(s0, (ctx, T) => {
      if (T < K.decide - .1) {
        room(ctx, T, { lamp: .45, desk: 2400 });
        const v = kf(T, [[s0, .12], [K.cross, .35], [K.force + .45, .62]]), crossed = p(T, K.force + .4, .2) * (1 - p(T, K.force + .9, .5));
        ctx.save(); ctx.translate(540, 760); const geo = deck(ctx, T, 1500, { xray: 1, valsA: 1, vals: SENS.map((_, i) => 60 * v + 6 * i), sensorHi: v, coil: crossed }); ctx.restore();
        const [hx, hy] = tp(geo, .6, .45); hand(ctx, 540 + hx, 760 + hy + 6 * v, -.4, 1 - .04 * v);
        live(ctx, T, 540, 1640, { yaw: .04, bob: 4 }, () => { rr(ctx, 90, 1530, 900, 230, 30); ctx.fillStyle = 'rgba(14,15,18,.9)'; ctx.fill(); txt(ctx, 'PUSH FORCE', 140, 1585, 26, 'rgba(255,255,255,.7)', 800, 'left');
          forceMeter(ctx, 140, 1625, 800, v, .5, 1, crossed); });
        if (T > K.force + .4) ring(ctx, 540, 1638, (T - K.force - .4) * 1.5, AMBER, 20, 200);
      } else {
        room(ctx, T, { lamp: .7, desk: 1700 });
        const k = p(T, K.decide - .1, .5, eback); ctx.save(); zoom(ctx, lerp(.85, 1, k), 540, 1080);
        live(ctx, T, 540, 1080, { yaw: .05, bob: 6 }, () => { flipIn(ctx, 540, 1080, k);
          rr(ctx, 50, 700, 980, 640, 30); ctx.fillStyle = '#0b0b0c'; ctx.fill(); ctx.save(); rr(ctx, 70, 720, 940, 600, 14); ctx.clip(); ctx.translate(70, 720);
          desktop(ctx, 940, 600, T, { dock: 0 }); const d = dockBar(ctx, 940, 600, T, 0, tap(T, K.click, .5));
          const fa = p(T, K.click + .1, .4, eback); if (fa > 0) { ctx.save(); ctx.globalAlpha = clamp(fa); zoom(ctx, fa, 470, 260); win(ctx, 160, 90, 620, 360, 'Recents', finderBody); ctx.restore(); }
          const cx = kf(T, [[K.decide, 700], [K.click - .1, d.x0 + d.gap + d.s / 2]]), cy = kf(T, [[K.decide, 220], [K.click - .1, d.y0 + d.gap + d.s / 2]]);
          cursor(ctx, cx, cy, tap(T, K.click, .25)); ctx.restore(); });
        ctx.restore();
        pill(ctx, 540, 1560, "that's a click", { a: p(T, K.click, .35, eback), col: GREEN, icon: '✓' });
      }
    });
  }
  // 7 PULSE -> COIL -> MAGNET
  { const s0 = A.fires, K = { pulse: c('pulse', s0), cur: c('current', s0), coil: c('coil', s0), split: c('split', s0), magnet: c('magnet', s0), end: A.pulls };
    const go = Math.min(K.pulse, K.cur) - .1, hit = go + 1.1;
    sfx.push({ t: go, k: 'sweep', g: -14 }, { t: hit, k: 'shimmer', g: -13 }, { t: K.magnet, k: 'riser', g: -17 });
    add(s0, (ctx, T) => {
      studio(ctx, T);
      const z = kf(T, [[s0, 1.1], [go, 1.25], [hit, 1.55], [K.end, 1.7]]), fx = kf(T, [[s0, 380], [go, 250], [hit, 470]]); ctx.save(); zoom(ctx, z, fx, FY + 60);
      const lit = p(T, hit, .15), field = p(T, K.magnet - .2, .5);
      cutaway(ctx, T, { y: FY, pulse: T > go && T < hit + .1 ? (T - go) / 1.1 : null, wireGlow: p(T, go, .3) * (1 - lit), coil: lit * (.75 + .25 * Math.sin(T * 12)), field: Math.max(field, lit * .5) });
      ctx.restore();
      pill(ctx, 300, 760, 'PULSE OF CURRENT', { a: p(T, go, .35, eback) * (1 - p(T, hit + .6, .3)), col: AMBER, size: 34, icon: '⚡' });
      label(ctx, 'COIL OF WIRE', 540, 1660, p(T, Math.max(K.coil, hit), .4), 540, 1400, 26);
      pill(ctx, 540, 1780, 'ELECTROMAGNET', { a: p(T, K.magnet, .4, eback), col: AMBER, size: 38, icon: '🧲' });
      note(ctx, 'Current shown in amber, invisible to the eye', 40, H - 60, 1);
    });
  }
  // 8 RAIL: the magnet pulls a metal rail; the whole pad jolts sideways, then back (3D)
  { const s0 = A.pulls, K = { rail: c('rail', s0), whole: c('whole', s0), side: c('sideways', s0), end: A.tip }; K.back = c('back', K.side);
    sfx.push({ t: K.rail, k: 'pop', g: -13 }, { t: K.side, k: 'tick', g: -8 }, { t: K.back, k: 'tick', g: -11 });
    add(s0, (ctx, T) => {
      studio(ctx, T, 1560);
      const yaw = -.55 + .08 * Math.sin(T * .35), P = proj3({ yaw, pitch: kf(T, [[s0, .62], [K.end, .5]]), dist: 42, f: 1900, cx: 540, cy: 1180 });
      const dx = kf(T, [[K.side - .05, 0], [K.side + .1, .9], [K.back - .05, .9], [K.back + .12, 0]], eo) + .04 * Math.sin(T * 30) * p(T, K.side, .1) * (1 - p(T, K.back + .2, .2));
      const glow = Math.max(p(T, s0 + .2, .3) * (1 - p(T, K.whole, .5)), p(T, K.side - .1, .1) * (1 - p(T, K.side + .4, .3)));
      box3(ctx, P, [-9, -6, 0], [9, 6, .4], ['#25272c', '#17181b', '#1d1e22']);
      [-3.6, -1.2, 1.2, 3.6].forEach(x => box3(ctx, P, [x - 1.05, 1.1, .4], [x + 1.05, 2.3, 1.05], [copperFill(glow), copperFill(glow * .6), copperFill(glow * .8)], 'rgba(90,40,15,.6)'));
      box3(ctx, P, [-4.8 + dx, .9, 1.1], [4.8 + dx, 2.5, 1.25], ['#d9dce1', '#8c9098', '#aeb2b9']);
      ctx.save(); ctx.globalAlpha = .38; box3(ctx, P, [-8 + dx, -5, 1.3], [8 + dx, 5, 1.6], [(c2, f) => { const g = c2.createLinearGradient(f[0][0], f[0][1], f[2][0], f[2][1]); g.addColorStop(0, '#5a5f68'); g.addColorStop(.5, '#3b3f46'); g.addColorStop(1, '#2b2e33'); c2.fillStyle = g; c2.fill(); }, '#6d727b', '#80858e'], 'rgba(255,255,255,.35)'); ctx.restore();
      const tip = P(-4 + dx, -3, 1.6); finger(ctx, { x: tip[0], y: tip[1] + 2, ang: -.55, wid: 130, len: 1300, T });
      if (glow > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; [-3.6, -1.2, 1.2, 3.6].forEach(x => { const a = P(x, 1.7, 1.0), b = P(x, 1.7, 1.12); ctx.strokeStyle = `rgba(${AMBER},${glow})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(b[0], b[1] - 30); ctx.lineTo(a[0], a[1]); ctx.stroke(); }); ctx.restore(); }
      const r = P(4.8 + dx, 2.5, 1.2); label(ctx, 'METAL RAIL', r[0] + 90, r[1] + 170, p(T, K.rail, .4), r[0], r[1] + 10, 24);
      const g2 = P(-8 + dx, -5, 1.6); label(ctx, 'TRACKPAD GLASS', g2[0] + 200, g2[1] - 90, p(T, K.whole, .4), g2[0] + 120, g2[1] - 10, 24);
      if (T > K.side - .1 && T < K.back + .6) { const a = 1 - p(T, K.back + .2, .4); ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        const ax = 540, ay = 1660, d = T < K.back ? 1 : -1; ctx.beginPath(); ctx.moveTo(ax - 120 * d, ay); ctx.lineTo(ax + 120 * d, ay); ctx.lineTo(ax + 90 * d, ay - 26); ctx.moveTo(ax + 120 * d, ay); ctx.lineTo(ax + 90 * d, ay + 26); ctx.stroke(); ctx.restore(); }
      note(ctx, 'Movement exaggerated', 40, H - 60, 1);
    });
  }
  // 9 FINGERTIP: you feel the jolt exactly when a real button would give way -> brain reads a click
  { const s0 = A.tip, K = { sharp: c('sharp', s0), exact: c('exact', s0), real: c('real', s0), brain: c('brain', s0), end: A.apple }; K.click = c('click', K.brain);
    sfx.push({ t: K.sharp, k: 'tick', g: -8 }, { t: K.real + .2, k: 'click', g: -12 }, { t: K.brain, k: 'shimmer', g: -15 });
    add(s0, (ctx, T) => {
      if (T < K.real - .1) {
        studio(ctx, T, 2400);
        const z = kf(T, [[s0, 1.15], [K.sharp, 1], [K.end, 1.05]]); ctx.save(); zoom(ctx, z, 540, 1100);
        fingertipMacro(ctx, T, 1150, jolt(T, K.sharp, 26) + jolt(T, K.exact, 16));
        ctx.restore();
        if (T > K.sharp) ring(ctx, 540, 1150, (T - K.sharp) * 1.3, AMBER, 60, 520);
        note(ctx, 'Movement exaggerated', 40, H - 60, 1);
      } else {
        studio(ctx, T);
        const z = kf(T, [[K.real - .1, 1.25], [K.end, 1.05]]); ctx.save(); zoom(ctx, z, 580, FY);
        const dip = tap(T, K.real + .1, .5), geo = cutaway(ctx, T, { y: FY, press: 4 * dip, jolt: jolt(T, K.real + .2, 18), coil: tap(T, K.real + .15, .4) });
        ctx.save(); ctx.globalAlpha = .35 * (1 - p(T, K.brain, .4)); ctx.setLineDash([10, 8]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; rr(ctx, 40, geo.top + 24 * dip, 1000, 56, 4); ctx.stroke(); ctx.restore();
        finger(ctx, { x: 600, y: geo.top + 2 + 4 * dip, ang: -.62, wid: 230, len: 1500, T });
        ctx.restore();
        label(ctx, 'FEELS LIKE A BUTTON GOING DOWN', 540, 1560, p(T, K.real, .4) * (1 - p(T, K.brain, .3)), undefined, undefined, 26);
        if (T > K.brain - .2) { const a = p(T, K.brain - .2, .45, eback); pop(ctx, a, 540, 760, () => { txt(ctx, '🧠', 0, 40, 130); for (let i = 0; i < 3; i++) ring(ctx, 0, 0, ((T * .9 + i / 3) % 1), AMBER, 60, 180); }); }
        pill(ctx, 540, 1700, 'CLICK', { a: p(T, K.click, .35, eback), col: GREEN, icon: '✓' });
        note(ctx, 'Movement exaggerated', 40, H - 60, 1);
      }
    });
  }
  // 10 TAPTIC ENGINE: the module, turning in 3D
  { const s0 = A.apple, K = { taptic: c('taptic', s0), end: A.shut };
    sfx.push({ t: s0 + .2, k: 'sweep', g: -16 }, { t: K.taptic, k: 'success', g: -13 });
    add(s0, (ctx, T) => {
      studio(ctx, T, 1600);
      const P = proj3({ yaw: -.7 + (T - s0) * .22, pitch: .62, dist: 34, f: lerp(1900, 2400, p(T, s0, 1.2, eo5)), cx: 540, cy: 1150 }), glow = .3 + .7 * p(T, K.taptic, .4) * (.7 + .3 * Math.sin(T * 6));
      box3(ctx, P, [-6.2, -1.3, 0], [6.2, 1.3, .25], ['#3a3d44', '#1d1e22', '#26282d']);
      box3(ctx, P, [-6.2, -1.3, .25], [6.2, -1.05, .9], ['#55585f', '#2a2c31', '#34363c']);
      [-3.6, 0, 3.6].forEach(x => box3(ctx, P, [x - 1.6, -.9, .25], [x + 1.6, .9, .8], [copperFill(glow), copperFill(glow * .6), copperFill(glow * .8)], 'rgba(90,40,15,.6)'));
      box3(ctx, P, [-6.2, 1.05, .25], [6.2, 1.3, .9], ['#55585f', '#2a2c31', '#34363c']);
      box3(ctx, P, [6.2, -.5, 0], [7.6, .5, .12], ['#e2a160', '#8c4a22', '#b86a35']);
      const t = P(0, 0, 1.2); label(ctx, 'TAPTIC ENGINE', t[0], t[1] - 260, p(T, K.taptic, .4), t[0], t[1] - 30, 32);
      note(ctx, 'Illustration, parts simplified', 40, H - 60, 1);
    });
  }
  // 11 SHUT DOWN: no current, no magnet, nothing to feel
  { const s0 = A.shut, K = { shut: c('shut', s0), cur: c('current', s0), magnet: c('magnet', s0), end: A.finger }; K.cur2 = c('current', K.cur + .1); K.feel = c('feel', K.magnet);
    sfx.push({ t: K.shut + .1, k: 'shutter', g: -13 }, { t: K.cur, k: 'glitch', g: -15 }, { t: K.magnet, k: 'glitch', g: -15 }, { t: K.feel, k: 'drip', g: -18 });
    add(s0, (ctx, T) => {
      studio(ctx, T);
      const z = kf(T, [[s0, 1.05], [K.cur, 1.4], [K.magnet, 1.4], [K.end, 1.2]]), fx = kf(T, [[s0, 540], [K.cur, 200], [K.magnet - .2, 200], [K.magnet + .3, 520]]); ctx.save(); zoom(ctx, z, fx, FY + 60);
      const dead = p(T, K.shut, .5), ghost = p(T, K.magnet - .3, .3) * (1 - p(T, K.magnet + .3, .5));
      cutaway(ctx, T, { y: FY, dead, field: ghost * .5 });
      xmark(ctx, 120, FY + 108, 46, p(T, K.cur, .3)); xmark(ctx, 520, FY + 44, 70, p(T, K.magnet + .2, .3));
      ctx.restore();
      pill(ctx, 540, 640, 'POWER OFF', { a: p(T, K.shut, .35, eback), size: 36, icon: '⏻' });
      pill(ctx, 300, 1620, 'no current', { a: p(T, K.cur2 - .1, .35, eback), col: RED, size: 34 });
      pill(ctx, 780, 1620, 'no magnet', { a: p(T, K.magnet, .35, eback), col: RED, size: 34 });
      pill(ctx, 540, 1770, 'nothing to feel', { a: p(T, K.feel, .35, eback), size: 38 });
    });
  }
  // 12 PRESSING, NOTHING CLICKS BACK: the finger pushes, the haptic trace stays flat
  { const s0 = A.finger, K = { press: c('pressing', s0), nothing: c('nothing is', s0), end: A.anywhere };
    for (let i = 0; i < 3; i++) sfx.push({ t: K.press + i * .7, k: 'drip', g: -22 });
    add(s0, (ctx, T) => {
      studio(ctx, T);
      const pr = [0, 1, 2].reduce((m, i) => Math.max(m, tap(T, K.press + i * .7, .5)), 0);
      ctx.save(); zoom(ctx, kf(T, [[s0, 1.25], [K.end, 1.05]]), 600, FY);
      const geo = cutaway(ctx, T, { y: FY, dead: 1, press: 3 * pr }); finger(ctx, { x: 600, y: geo.top + 2 + 3 * pr - 30 * (1 - pr), ang: -.62, wid: 230, len: 1500, T });
      ctx.restore();
      live(ctx, T, 540, 1660, { yaw: .03, bob: 3 }, () => { rr(ctx, 90, 1560, 900, 200, 26); ctx.fillStyle = 'rgba(14,15,18,.92)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.stroke();
        txt(ctx, 'HAPTIC FEEDBACK', 130, 1610, 24, 'rgba(255,255,255,.6)', 800, 'left'); ctx.strokeStyle = `rgba(${RED},.9)`; ctx.lineWidth = 4; ctx.beginPath();
        for (let x = 0; x <= 820; x += 8) { const y = 1690 + .8 * Math.sin(x * .3 + T * 20); x ? ctx.lineTo(130 + x, y) : ctx.moveTo(130, y); } ctx.stroke();
        const sx = 130 + ((T - s0) * 260) % 820; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx, 1690, 7, 0, 7); ctx.fill(); });
      pill(ctx, 540, 780, 'nothing clicks back', { a: p(T, K.nothing, .35, eback), col: RED, size: 40 });
    });
  }
  // 13 ANYWHERE: click works all over the glass, even the very top
  { const s0 = A.anywhere, K = { any: c('anywhere', s0), top: c('top', s0), end: A.older };
    const pts = [[.22, .72], [.78, .3], [.45, .55], [.86, .82], [.15, .3]], taps = pts.map((_, i) => K.any - .1 + i * .32).filter(t => t < K.top - .2);
    taps.forEach(t => sfx.push({ t, k: 'tick', g: -14 })); sfx.push({ t: K.top, k: 'tick', g: -9 }, { t: K.top + .2, k: 'success', g: -15 });
    add(s0, (ctx, T) => {
      room(ctx, T, { lamp: .45, desk: 2400 });
      ctx.save(); zoom(ctx, kf(T, [[s0, 1], [K.end, 1.1]]), 540, 1100); ctx.translate(540, 860);
      const geo = deck(ctx, T, 1500);
      let cur = [.6, .6], last = -1; taps.forEach((t, i) => { if (T > t - .25) { cur = pts[i]; last = i; } }); if (T > K.top - .3) cur = [.5, .05];
      const prevIdx = last - 1, prev = T > K.top - .3 ? pts[last] || [.6, .6] : prevIdx >= 0 ? pts[prevIdx] : [.6, .6];
      const tMove = T > K.top - .3 ? K.top - .3 : taps[last] - .25, k = last < 0 ? 1 : eo5(clamp((T - tMove) / .22)), uv = [lerp(prev[0], cur[0], k), lerp(prev[1], cur[1], k)];
      taps.forEach((t, i) => { const [x, y] = tp(geo, ...pts[i]); if (T > t) { ring(ctx, x, y, (T - t) * 2, AMBER, 10, 120); check(ctx, x, y - 70, 30, p(T, t, .3) * (1 - p(T, K.top, .4))); } });
      const [tx, ty] = tp(geo, .5, .05); if (T > K.top) { ring(ctx, tx, ty, (T - K.top) * 1.6, AMBER, 10, 160); check(ctx, tx, ty - 90, 40, p(T, K.top, .35)); }
      const [hx, hy] = tp(geo, ...uv), pr = [...taps, K.top].reduce((m, t) => Math.max(m, tap(T, t - .05, .25)), 0);
      ctx.restore(); hand(ctx, 540 + hx, 860 + hy + 6 * pr, -.4, 1 - .04 * pr, p(T, s0, .4));
      pill(ctx, 540, 1760, 'even the very top', { a: p(T, K.top, .35, eback), col: GREEN, size: 40, icon: '✓' });
    });
  }
  // 14 OLDER TRACKPADS: a hinged plate with one switch at the bottom
  { const s0 = A.older, K = { button: c('button', s0), bottom: c('bottom', s0), end: A.change };
    const tTop = (s0 + K.button) / 2 + .3;
    sfx.push({ t: tTop, k: 'drip', g: -20 }, { t: K.bottom + .15, k: 'click', g: -8 });
    add(s0, (ctx, T) => {
      studio(ctx, T);
      const atBottom = T > K.bottom - .5, pr = atBottom ? tap(T, K.bottom, .6) : tap(T, tTop, .6);
      ctx.save(); zoom(ctx, kf(T, [[s0, 1.2], [K.end, 1.05]]), 540, 1100);
      oldPad(ctx, T, 1100, atBottom ? .03 * pr : .004 * pr, atBottom ? pr : 0);
      const fx = kf(T, [[s0, 260], [K.bottom - .5, 260], [K.bottom - .1, 860]]), fy = 1100 + 30 - 48 + (fx - 120) * (atBottom ? .03 * pr : .004 * pr);
      finger(ctx, { x: fx, y: fy - 2 - 30 * (1 - pr), ang: -.55, wid: 190, len: 1400, T });
      if (atBottom && T > K.bottom + .15) ring(ctx, 880, 1220, (T - K.bottom - .15) * 1.5, AMBER, 20, 160);
      ctx.restore();
      pill(ctx, 540, 700, 'OLDER MACBOOKS', { a: p(T, s0, .4, eback), size: 36 });
      pill(ctx, 300, 1620, 'stiff at the top', { a: p(T, tTop + .2, .35, eback) * (1 - p(T, K.bottom - .5, .3)), col: RED, size: 32 });
      pill(ctx, 540, 1720, 'one big button', { a: p(T, K.button, .35, eback), size: 38 });
      pill(ctx, 760, 1620, 'clicks at the bottom', { a: p(T, K.bottom + .1, .35, eback), col: GREEN, size: 32 });
      note(ctx, 'Movement exaggerated', 40, H - 60, 1);
    });
  }
  // 15 CHANGE THE CLICK: press harder -> a second, deeper click (Look Up)
  { const s0 = A.change, K = { change: c('change', s0), harder: c('harder', s0), second: c('second', s0), deeper: c('deeper', s0), end: A.settings };
    sfx.push({ t: K.change + .3, k: 'tick', g: -12 }, { t: K.second, k: 'tick', g: -8 }, { t: K.second + .25, k: 'pop', g: -13 });
    add(s0, (ctx, T) => {
      room(ctx, T, { desk: 1600 });
      ctx.save(); zoom(ctx, kf(T, [[s0, 1.0], [K.second, 1.06], [K.end, 1.1]]), 520, 1100);
      const hl = p(T, K.harder, .3), lk = p(T, K.second, .4, eback);
      const { P, geo } = laptop(ctx, T, 520, 1460, .86, { screenFn: (c2, w, h) => { desktop(c2, w, h, T, { dock: 1 });
        const nw = w * .62, nh = h * .42, nx = w * .1, ny = h * .16; win(c2, nx, ny, nw, nh, 'Notes', (c3, x, y, ww, hh) => { const r = notesBody(c3, x, y, ww, hh, hl); if (lk <= 0) cursor(c3, r.wx, r.wy, tap(T, K.change + .3, .25)); });
        if (lk > 0) { c2.save(); c2.translate(nx + nw * .3, ny + nh * .9); c2.scale(lk, lk); lookupCard(c2, 0, 0, w * .5, clamp(lk)); c2.restore(); } } });
      const [hx, hy] = P(...tp(geo, .5, .55)), pr = Math.max(tap(T, K.change + .3, .35), .4 * p(T, K.harder - .2, .3) * (1 - p(T, K.deeper + .4, .3)) + .6 * tap(T, K.second, .5));
      hand(ctx, hx, hy + 8 * pr, -.42, .9 - .04 * pr);
      if (T > K.change + .3) ring(ctx, hx, hy, (T - K.change - .3) * 2, '255,255,255', 10, 90);
      if (T > K.second) { ring(ctx, hx, hy, (T - K.second) * 1.6, AMBER, 10, 140); ring(ctx, hx, hy, (T - K.second - .12) * 1.6, AMBER, 10, 140); }
      ctx.restore();
      pill(ctx, 270, 1740, '1st click', { a: p(T, K.change + .3, .35, eback), size: 34 });
      pill(ctx, 780, 1740, '2nd, deeper click', { a: p(T, K.second, .35, eback), col: AMBER, size: 34 });
    });
  }
  // 16 SETTINGS: choose how hard you press before it clicks
  { const s0 = A.settings, K = { settings: c('settings', s0), choose: c('choose', s0), hard: c('hard', s0), clicks: c('clicks', s0), end: A.never };
    const e2 = Math.min(K.hard, K.clicks), e3 = Math.max(K.hard, K.clicks);
    sfx.push({ t: s0 + .1, k: 'swoosh', g: -15 }, { t: K.choose + .35, k: 'tick', g: -13 }, { t: e2 + .35, k: 'tick', g: -13 }, { t: e3 + .45, k: 'tick', g: -13 });
    add(s0, (ctx, T) => {
      room(ctx, T, { lamp: .5, desk: 2400 });
      const v = kf(T, [[K.choose, 1], [K.choose + .4, 0], [e2, 0], [e2 + .4, 2], [e3 + .1, 2], [e3 + .5, 1]]);
      ctx.save(); zoom(ctx, kf(T, [[s0, 1], [K.choose, 1.08], [K.end, 1.14]]), 540, 1100);
      live(ctx, T, 540, 1150, { yaw: .05, bob: 6 }, () => { flipIn(ctx, 540, 1150, p(T, s0, .6, eback));
        const r = trackpadPanel(ctx, 90, 560, 900, T, { click: v, hi: p(T, K.choose - .2, .3) });
        cursor(ctx, r.knobX + 4, r.knobY + 6, tap(T, K.choose, .2) + tap(T, e2, .2)); });
      ctx.restore();
      const lbl = ['Light', 'Medium', 'Firm'][Math.round(v)]; pill(ctx, 540, 1740, `Click: ${lbl}`, { a: p(T, K.choose, .35, eback), col: BLUE, size: 38 });
    });
  }
  // 17 RECAP: you pressed a sensor; a magnet tapped back at the right moment
  { const s0 = A.never, K = { never: c('never', s0), sensor: c('sensor', s0), magnet: c('magnet', s0), tapped: c('tapped', s0), moment: c('moment', s0), end: A.crazy };
    sfx.push({ t: K.never, k: 'pop', g: -13 }, { t: K.sensor, k: 'data', g: -16 }, { t: K.tapped, k: 'tick', g: -8 }, { t: K.moment, k: 'success', g: -14 });
    add(s0, (ctx, T) => {
      room(ctx, T, { desk: 1600 });
      const xr = p(T, K.sensor - .3, .5), pr = p(T, K.sensor - .2, .4), coil = Math.max(p(T, K.magnet, .3) * .5, tap(T, K.tapped, .5));
      ctx.save(); zoom(ctx, kf(T, [[s0, 1.0], [K.sensor, 1.35], [K.end, 1.45]]), 560, 1480); ctx.translate(jolt(T, K.tapped, 10), 0);
      const { P, geo } = laptop(ctx, T, 560, 1420, .9, { screenFn: (c2, w, h) => desktop(c2, w, h, T), deckOpt: { xray: xr, vals: SENS.map((_, i) => 20 * pr + 4 * i), valsA: pr, sensorHi: pr * .8, coil } });
      const [hx, hy] = P(...tp(geo, .6, .45)); hand(ctx, hx, hy + 6 * pr, -.42, .85 - .03 * pr);
      if (T > K.tapped) ring(ctx, hx, hy, (T - K.tapped) * 1.6, AMBER, 10, 160);
      ctx.restore();
      pill(ctx, 540, 640, 'never a real click', { a: p(T, K.never, .35, eback) * (1 - p(T, K.sensor - .3, .3)), size: 40 });
      pill(ctx, 290, 1760, 'sensor', { a: p(T, K.sensor, .35, eback), col: AMBER, size: 34, icon: '⚖' });
      pill(ctx, 790, 1760, 'magnet', { a: p(T, K.magnet, .35, eback), col: AMBER, size: 34, icon: '🧲' });
      check(ctx, 540, 1760, 40, p(T, K.moment, .35));
    });
  }
  // 18 + 19 ENDING (themed for this video): the same laptop writes the code that draws the trackpad, then you type "guide" on its keys and click its trackpad.
  const endLaptop = (ctx, T, screenFn, deckOpt = {}) => laptop(ctx, T, 488, 1500, .98, { screenFn, deckOpt });
  // 18 CODE: the editor types the click logic while a live preview of this video's cutaway renders beside it
  { const s0 = A.crazy, K = { crazy: c('crazy', s0), whole: c('whole', s0) }; K.code = c('code', K.whole);
    const CODE = [['// the click you feel = code', '#6a9955'], ['export function click(ctx, T) {', '#c586c0'], ['  const f = force(T);', '#9cdcfe'], ['  if (f > FIRM) {', '#c586c0'], ['    coil.pulse(T);', '#dcdcaa'], ['    glass.jolt(T, 22);', '#dcdcaa'], ['  }', '#c586c0'], ['  cutaway(ctx, T);', '#dcdcaa'], ['}', '#c586c0']];
    const total = CODE.reduce((a, l) => a + l[0].length, 0), rate = total / Math.max(.8, K.code - s0 - .3); // every line finishes typing by "code"
    sfx.push({ t: K.crazy, k: 'pop', g: -12 }, { t: K.code, k: 'success', g: -14 }); for (let i = 0; i < 8; i++) sfx.push({ t: s0 + .3 + i * (K.code - s0 - .3) / 8, k: 'type', g: -24 });
    add(s0, (ctx, T) => {
      room(ctx, T, { desk: 1640 });
      ctx.save(); zoom(ctx, kf(T, [[s0, 1.3], [s0 + .8, 1.12], [K.code + 1, 1.05]]), 540, 1060);
      endLaptop(ctx, T, (c2, w, h) => {
        c2.fillStyle = '#15171c'; c2.fillRect(0, 0, w, h); c2.fillStyle = '#20232a'; c2.fillRect(0, 0, w, 40);
        ['#ff5f57', '#febc2e', '#28c840'].forEach((cl, k) => { c2.fillStyle = cl; c2.beginPath(); c2.arc(22 + k * 22, 20, 7, 0, 7); c2.fill(); });
        txt(c2, 'scenes.js', 100, 27, 17, '#d7dae0', 600, 'left'); txt(c2, 'mac.js', 200, 27, 17, '#7d828c', 600, 'left'); txt(c2, 'Preview', w * .55 + 16, 27, 17, '#d7dae0', 600, 'left');
        let left = (T - s0 - .3) * rate, caret = [46, 76]; c2.font = '500 19px "Cascadia Mono", Consolas, monospace'; c2.textAlign = 'left';
        CODE.forEach(([line, col], i) => { const n = Math.floor(clamp(left, 0, line.length)); left -= line.length; const y = 76 + i * 34;
          c2.fillStyle = '#4b505a'; c2.fillText(String(i + 1).padStart(2), 12, y); c2.fillStyle = col; c2.fillText(line.slice(0, n), 46, y); if (n > 0) caret = [46 + c2.measureText(line.slice(0, n)).width, y]; });
        if (Math.floor(T * 2.5) % 2) { c2.fillStyle = '#d7dae0'; c2.fillRect(caret[0] + 2, caret[1] - 18, 2, 22); }
        // live preview pane: this video's cutaway, revealed left to right as the code lands
        const px = w * .55, pw = w - px, rv = p(T, K.whole - .2, Math.max(.6, K.code - K.whole + .4), x => x);
        c2.fillStyle = '#0d0d0f'; c2.fillRect(px, 40, pw, h - 80); c2.fillStyle = '#2a2d34'; c2.fillRect(px, 40, 2, h - 80);
        c2.save(); c2.beginPath(); c2.rect(px, 40, pw * rv, h - 80); c2.clip(); c2.translate(px + pw / 2, h * .52); c2.scale(.36, .36); c2.translate(-540, -FY);
        const pt = T % 1.2; cutaway(c2, T, { y: FY, jolt: jolt(pt, .1, 20), coil: tap(pt, .05, .4), field: tap(pt, .05, .5) }); finger(c2, { x: 600, y: FY - 58, ang: -.62, wid: 230, len: 900, T }); c2.restore();
        if (rv > 0 && rv < 1) { c2.fillStyle = `rgba(${AMBER},.9)`; c2.fillRect(px + pw * rv - 2, 40, 3, h - 80); }
        // status bar: the real frame number of this video
        c2.fillStyle = '#20232a'; c2.fillRect(0, h - 40, w, 40); const done = T > K.code;
        c2.fillStyle = done ? `rgb(${GREEN})` : `rgb(${AMBER})`; c2.beginPath(); c2.arc(20, h - 20, 6, 0, 7); c2.fill();
        txt(c2, done ? 'Rendered ✓' : `Rendering frame ${Math.round(T * 30).toLocaleString('en-US')}`, 36, h - 13, 17, '#d7dae0', 600, 'left');
      });
      ctx.restore();
      pill(ctx, 540, 650, 'made 100% with code', { a: p(T, K.code, .4, eback), col: GREEN, size: 40, icon: '💻' });
    });
  }
  // 19 GUIDE: type "guide" on the laptop's own keys, post it with a trackpad click; then the bio link gets a force click
  { const s0 = A.guide, K = { comment: c('comment', s0) }; K.guide = c('guide', K.comment); K.send = c('send', K.comment); K.yt = c('youtube', s0); K.bio = c('bio', s0);
    const post = Math.min(K.guide + .7, K.send - .2), keyT = i => K.guide + i * .085;
    sfx.push({ t: post, k: 'tick', g: -9 }, { t: K.send, k: 'pop', g: -12 }, { t: K.yt, k: 'swoosh', g: -16 }, { t: K.bio + .15, k: 'tick', g: -8 }, { t: K.bio + .3, k: 'success', g: -14 });
    for (let i = 0; i < 5; i++) sfx.push({ t: keyT(i), k: 'type', g: -20 });
    add(s0, (ctx, T) => {
      room(ctx, T, { desk: 1640 });
      const keyHi = {}; 'GUIDE'.split('').forEach((ch, i) => keyHi[ch] = Math.max(keyHi[ch] || 0, tap(T, keyT(i) - .03, .22)));
      const n = Math.floor(clamp((T - K.guide) / .085 + 1, 0, 5)), profile = T > K.yt - .1;
      const hpr = profile ? tap(T, K.bio + .1, .5) : tap(T, post - .05, .35);
      ctx.save(); zoom(ctx, kf(T, [[s0, 1.05], [K.yt - .1, 1.12], [K.yt + .4, 1.05], [K.bio + 1, 1.12]]), 540, 1150);
      const { P, geo } = endLaptop(ctx, T, (c2, w, h) => {
        desktop(c2, w, h, T, { dock: 0 });
        if (!profile) {
          win(c2, w * .12, h * .1, w * .76, h * .8, 'Comments', (c3, x, y, ww, hh) => {
            txt(c3, 'FULL GUIDE', x + ww / 2, y + hh * .2, 46, '#fff', 900); txt(c3, 'make videos like this', x + ww / 2, y + hh * .3, 20, '#9aa0aa', 600);
            rr(c3, x + 24, y + hh * .66, ww - 48, 64, 32); c3.fillStyle = '#2a2c32'; c3.fill();
            txt(c3, n ? 'guide'.slice(0, n) : 'Add a comment…', x + 52, y + hh * .66 + 41, 24, n ? '#fff' : '#777', 600, 'left');
            const posted = T > post; rr(c3, x + ww - 150, y + hh * .66 + 8, 110, 48, 24); c3.fillStyle = n >= 5 ? '#2f8cff' : '#3a3d45'; c3.fill(); txt(c3, posted ? 'Sent' : 'Post', x + ww - 95, y + hh * .66 + 40, 20, '#fff', 800);
            const ra = p(T, K.send, .4, eback); if (ra > 0) { c3.save(); c3.globalAlpha = clamp(ra); txt(c3, named ? '♥  agentsoly replied: sent ✓' : '♥  Reply: sent ✓', x + ww / 2, y + hh * .5, 24, '#ff4d6d', 700); c3.restore(); }
            if (n >= 5 && T < post + .3) cursor(c3, x + ww - 95, y + hh * .66 + 34, tap(T, post - .05, .25));
          });
        } else {
          win(c2, w * .14, h * .1, w * .72, h * .8, 'Profile', (c3, x, y, ww, hh) => {
            avatar(c3, T, x + 90, y + 90, 50, named); if (named) txt(c3, 'agentsoly', x + 170, y + 84, 34, '#fff', 800, 'left');
            txt(c3, 'Explainers built 100% in code', x + 170, y + (named ? 120 : 100), 19, '#9aa0aa', 500, 'left');
            const hl = p(T, K.bio + .1, .3); rr(c3, x + 40, y + hh * .55, ww - 80, 74, 18); c3.fillStyle = `rgba(47,140,255,${.15 + .35 * hl})`; c3.fill(); c3.strokeStyle = `rgba(47,140,255,${hl})`; c3.lineWidth = 3; c3.stroke();
            txt(c3, '🔗  Full guide · link in bio', x + 70, y + hh * .55 + 47, 25, '#7fb6ff', 700, 'left');
            cursor(c3, kf(T, [[K.yt, x + ww * .8], [K.bio - .1, x + ww * .55]]), kf(T, [[K.yt, y + hh * .25], [K.bio - .1, y + hh * .55 + 40]]), tap(T, K.bio + .1, .3));
          });
        }
      }, { keyHi });
      const [hx, hy] = P(...tp(geo, .55, .6)), hin = p(T, s0 + .1, .5, eo5);
      hand(ctx, lerp(hx + 400, hx, hin), lerp(hy + 600, hy, hin) + 7 * hpr, -.42, .9 - .04 * hpr, hin);
      if (T > post && !profile) ring(ctx, hx, hy, (T - post) * 1.8, AMBER, 10, 120);
      if (T > K.bio + .1) { ring(ctx, hx, hy, (T - K.bio - .1) * 1.6, AMBER, 10, 150); ring(ctx, hx, hy, (T - K.bio - .25) * 1.6, AMBER, 10, 150); }
      ctx.restore();
      ['TikTok', 'YouTube'].forEach((nm, i) => pop(ctx, p(T, K.yt + .2 + i * .2, .4, eback), 330 + i * 420, 650 + 8 * Math.sin(T * 2 + i * 2), () => { rr(ctx, -150, -55, 300, 110, 28); ctx.fillStyle = i ? '#e62117' : '#111'; ctx.fill(); ctx.strokeStyle = '#444'; ctx.lineWidth = 3; ctx.stroke(); txt(ctx, nm, 0, 13, 38, '#fff', 800); }, i ? .6 : -.6));
      pill(ctx, 540, 650, 'comment "guide"', { a: p(T, K.comment, .35, eback) * (1 - p(T, K.yt - .3, .25)), col: BLUE, size: 38, icon: '💬' });
    });
  }
  list.forEach((sc, i) => sc.end = list[i + 1] ? list[i + 1].start : 1e9);
  return { scenes: list, sfx };
}
function avatar(ctx, T, x, y, r, named) {
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, '#1fa58f'); g.addColorStop(1, '#f2a25c'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; if (named) txt(ctx, 'a', x, y + r * .32, r * .92, '#fff', 900); else { ctx.beginPath(); ctx.arc(x, y - r * .28, r * .34, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y + r * .58, r * .6, r * .42, 0, Math.PI, 0); ctx.fill(); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(T * 1.6); const cg = ctx.createConicGradient(0, 0, 0); cg.addColorStop(0, '#f2a25c'); cg.addColorStop(.5, '#1fa58f'); cg.addColorStop(1, '#f2a25c'); ctx.strokeStyle = cg; ctx.lineWidth = r * .08; ctx.beginPath(); ctx.arc(0, 0, r * 1.16, 0, 7); ctx.stroke(); ctx.restore();
}
