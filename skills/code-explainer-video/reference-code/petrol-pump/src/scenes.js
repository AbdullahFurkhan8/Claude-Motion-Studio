// "Stop at the first click" - how a petrol pump nozzle knows your tank is full. All timing from word cues c('phrase', after).
// Everything is drawn in code (pump.js + kit.js). No presenter, no user images.
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, hash, rr, alive, flipIn } from './lib.js';
import { FONT, MONO, GREEN, RED, BLUE, txt, tw, bin, pop, bgLight, card, cursor, clickRing, check, xmark, pill, avatar, glowDot } from './kit.js';
import { ORANGE, ORANGE_RGB, CYAN, CYAN_RGB, FUEL_RGB, AMBER_RGB, SALMON, bgNight, bgBlue, lcd, tag, status, dispenser, car, nozzle, nzP, NZ, suck, liquid,
  tankCut, charcoalBox, gauge, dash, engineIcon, board } from './pump.js';

export const IMAGES = [];
const kf = (T, keys, e = eio) => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (T < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e((T - t0) / Math.max(1e-3, t1 - t0)); return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u); }
  return keys[keys.length - 1][1];
};
const live = (ctx, T, x, y, o, fn) => { ctx.save(); alive(ctx, T, x, y, o); fn(); ctx.restore(); };
const flip = (ctx, k, x, y, fn) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k * 1.5); flipIn(ctx, x, y, k); fn(); ctx.restore(); };
const typed = (s, T, t0, t1) => s.slice(0, Math.floor(s.length * clamp((T - t0) / Math.max(.05, t1 - t0))));
// in-scene camera: put world point (fx,fy) at screen (ox,oy) with zoom s
const focus = (ctx, s, fx, fy, ox = 540, oy = 1180) => { ctx.translate(ox, oy); ctx.scale(s, s); ctx.translate(-fx, -fy); };
// "CLICK" burst with radiating ticks
function burst(ctx, T, t0, x, y, label = 'CLICK', col = ORANGE, size = 92) {
  const k = (T - t0) / 1.1; if (k <= 0 || k >= 1.4) return;
  const a = clamp((1.4 - k) / .4);
  ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round';
  for (let i = 0; i < 10; i++) { const an = i / 10 * 6.283 + .3, r0 = 60 + 120 * eo(k), r1 = r0 + 50 * (1 - clamp(k)); ctx.strokeStyle = `rgba(255,220,170,${1 - clamp(k)})`; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0 * .7); ctx.lineTo(x + Math.cos(an) * r1, y + Math.sin(an) * r1 * .7); ctx.stroke(); }
  pop(ctx, eback(clamp(k * 3)), x, y, () => { ctx.save(); ctx.translate(x, y); ctx.rotate(-.08); ctx.font = FONT(900, size); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(10,12,18,.9)'; ctx.lineWidth = 14; ctx.strokeText(label, 0, size * .35); ctx.shadowColor = `rgba(${ORANGE_RGB},.8)`; ctx.shadowBlur = 30; ctx.fillStyle = col; ctx.fillText(label, 0, size * .35); ctx.restore(); });
  ctx.restore();
}
function hose(ctx, x0, y0, x1, y1, sag = 420) {
  ctx.save(); ctx.lineCap = 'round';
  const path = (o) => { ctx.beginPath(); ctx.moveTo(x0, y0 + o); ctx.bezierCurveTo(x0 + 60, y0 + sag + o, x1 - 160, y1 + sag * .9 + o, x1, y1 + o); };
  path(0); ctx.strokeStyle = '#08090c'; ctx.lineWidth = 30; ctx.stroke();
  path(-7); ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
}
// the forecourt wide shot (hook and "stop at the first click")
const NZ_WIDE = { x: 571, y: 982, ang: .95, s: .4 };
function forecourt(ctx, T, { sale = 0, lit = 0 } = {}) {
  bgNight(ctx, T, { horizon: 1180 });
  live(ctx, T, 900, 1300, { yaw: .012, bob: 3, breathe: .004, seed: 2 }, () => car(ctx, T, 720, 1190, .8));
  const d = (() => { ctx.save(); alive(ctx, T, 150, 1300, { yaw: .025, bob: 3, breathe: .005, seed: 1 }); const r = dispenser(ctx, T, 150, 1720, .95, { sale, gal: sale / 3.49, lit }); ctx.restore(); return r; })();
  const rear = nzP(NZ_WIDE, ...NZ.rear);
  hose(ctx, d.hoseX, d.hoseY, rear[0], rear[1], 380);
  live(ctx, T, 640, 1080, { yaw: .02, bob: 2, breathe: 0, tilt: .006, seed: 4 }, () => nozzle(ctx, T, { ...NZ_WIDE, shell: 1, hose: false }));
}

export const KEYWORDS = 'clicks click squeeze round guess tip nozzle tiny hole flows sucks air thin tube handle rises stops vacuum yanks diaphragm valve shut sensor computer full extra vapor charcoal fumes liquid trigger engine repair hundreds stop first crazy code guide bio';
export const EMOJI = { air: '💨', fumes: '💨', engine: '⚠️', hundreds: '💸', code: '💻', guide: '💬', bio: '🔗' };
export const CAPTION_SFX = false;
// Hinglish voice: same scenes, cues mapped to the words it says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      clicks: 'click', squeeze: 'thoda aur', round: 'round', see: 'dekhiye', guess: 'andaaza',
      'near the tip': 'nozzle', nozzle: 'nok', tiny: 'chhota',
      'while gas flows': 'jab tak', sucks: 'kheenchta', thin: 'patli', handle: 'handle',
      'the moment': 'jaise hi', rises: 'chadh', stops: 'ruk',
      'that makes': 'isse vacuum', vacuum: 'vacuum', yanks: 'kheench', diaphragm: 'diaphragm', valve: 'valve', shut: 'jhat',
      'no sensor': 'na koi sensor', computer: 'computer', 'just air': 'bas hawa',
      'so that click': 'to woh click', full: 'full', 'and the extra': 'aur jo extra', straight: 'seedha', vapor: 'vapor',
      'a box': 'coal ka', charcoal: 'coal', fumes: 'fumes', liquid: 'liquid',
      consumer: 'consumer', trigger: 'consumer > isse', engine: 'engine', repair: 'aur sainkdon', hundreds: 'repair',
      'so stop': 'to pehle', first: 'ruk jaiye',
      "and here's the crazy": 'aur sabse', crazy: 'crazy', code: 'code', comment: 'comment', guide: 'guide', youtube: 'youtube', link: 'link', bio: 'bio',
    },
    keywords: 'click daal round andaaza nok nozzle chhota hole gas hawa kheenchta tube handle chadh ruk vacuum kheench diaphragm valve jhat sensor computer full extra seedha vapor coal fumes liquid engine repair sainkdon pehle crazy code guide bio',
    emoji: { hawa: '💨', fumes: '💨', engine: '⚠️', sainkdon: '💸', code: '💻', guide: '💬', bio: '🔗' },
  },
};

export function makeScenes(c, lang = 'en') {
  const named = lang !== 'hi'; // Hindi version: profile picture only, no channel name or handle
  const list = [], sfx = [];
  const add = (start, light, draw) => { list.push({ start, light, draw }); if (start > 0) sfx.push({ t: start - .05, k: 'whoosh', g: -19 }); };
  const s = x => x - .1;
  const A = {
    see: s(c('see')), near: s(c('near the tip')), while: s(c('while gas flows')), moment: s(c('the moment')), makes: s(c('that makes')), no: s(c('no sensor')),
    so: s(c('so that click')), box: s(c('a box')), consumer: s(c('consumer')), stop: s(c('so stop')), crazy: s(c("and here's the crazy")),
  };

  // 1 HOOK: night forecourt, the pump clicks off, you squeeze a little more to round it up
  { const K = { click: c('clicks'), sq: c('squeeze'), round: c('round') };
    const clickSale = 46.37, rT = Math.max(K.round + .15, K.sq + .8);
    sfx.push({ t: .05, k: 'riser', g: -20 }, { t: K.click, k: 'click', g: -9 }, { t: rT, k: 'shimmer', g: -18 });
    const sale = T => T < K.click ? clickSale * (.82 + .18 * clamp(T / K.click)) : T < K.sq ? clickSale : lerp(clickSale, 50, Math.floor(clamp((T - K.sq) / Math.max(.3, rT - K.sq)) * 6) / 6);
    add(0, false, (ctx, T) => {
      ctx.save(); const z = kf(T, [[0, 1.12], [K.click, 1.0], [K.sq, 1.0], [rT + .4, 1.14]]), f = kf(T, [[0, [600, 1150]], [K.click, [520, 1180]], [K.sq, [520, 1180]], [rT + .4, [330, 1100]]]);
      focus(ctx, z, f[0], f[1], 540, 1180 - (f[1] - 1180) * 0);
      forecourt(ctx, T, { sale: sale(T), lit: T > K.sq ? .5 + .5 * Math.sin(T * 8) : 0 });
      burst(ctx, T, K.click, 700, 790);
      const sq = p(T, K.sq, .45, eback); if (sq > 0 && T < rT) pop(ctx, sq, 360, 760, () => pill(ctx, 360, 760, '+ a little more', { bg: 'rgba(255,138,61,.95)', size: 30, h: 64 }));
      const r = p(T, rT, .5, eback); if (r > 0) pop(ctx, r, 330, 790, () => pill(ctx, 330, 790, 'ROUNDED  $50.00 ✓', { bg: 'rgba(30,160,90,.95)', size: 30, h: 64 }));
      ctx.restore();
    });
  }

  // 2 NOT A GUESS: close-up nozzle, the shell turns to glass
  { const K = { guess: c('guess', A.see) };
    sfx.push({ t: K.guess, k: 'sweep', g: -15 });
    add(A.see, false, (ctx, T) => {
      bgBlue(ctx, T);
      const o = { x: 380, y: 1000, ang: .5, s: kf(T, [[A.see, .9], [A.near, 1.02]]) }, xr = p(T, K.guess, .7, eio);
      live(ctx, T, 600, 1150, { yaw: .03, bob: 6, breathe: .006, seed: 3 }, () => nozzle(ctx, T, { ...o, shell: 1 - xr, flow: xr }));
      // question mark that gets crossed out
      const q = p(T, A.see + .1, .5, eback);
      pop(ctx, q, 760, 760, () => { live(ctx, T, 760, 760, { yaw: .2, bob: 8, seed: 5 }, () => { txt(ctx, '?', 760, 820, 190, 'rgba(255,255,255,.92)', 900); }); });
      xmark(ctx, 840, 680, 46, p(T, K.guess, .5));
      status(ctx, T, 540, 560, 'NOT A GUESS', '255,138,61', p(T, K.guess, .5));
    });
  }

  // 3 TINY HOLE near the tip (x-ray)
  { const K = { noz: c('nozzle', A.near), tiny: c('tiny', A.near) };
    sfx.push({ t: K.tiny, k: 'shimmer', g: -18 });
    add(A.near, false, (ctx, T) => {
      bgBlue(ctx, T);
      const o = { x: 200, y: 820, ang: .5, s: 1.35 }, hp = nzP(o, ...NZ.hole), tp = nzP(o, ...NZ.tip);
      ctx.save(); const z = kf(T, [[A.near, 1], [K.tiny, 1.18]]), f = kf(T, [[A.near, [600, 1100]], [K.tiny, [hp[0] - 60, hp[1] + 40]]]); focus(ctx, z, f[0], f[1], 540, 1150);
      live(ctx, T, hp[0], hp[1], { yaw: .015, bob: 4, breathe: .004, seed: 6 }, () => nozzle(ctx, T, { ...o, shell: 0, flow: 1, hole: p(T, K.tiny, .4) }));
      ctx.restore();
      const H1 = (x, y) => { const z = kf(T, [[A.near, 1], [K.tiny, 1.18]]), f = kf(T, [[A.near, [600, 1100]], [K.tiny, [hp[0] - 60, hp[1] + 40]]]); return [540 + (x - f[0]) * z, 1150 + (y - f[1]) * z]; };
      const tp2 = H1(...tp), hp2 = H1(...hp);
      tag(ctx, 330, 700, 'Nozzle tip', 'WHERE THE GAS COMES OUT', p(T, K.noz, .5) * (1 - p(T, K.tiny, .3)), tp2[0], tp2[1]);
      tag(ctx, 380, 1530, 'Tiny hole', 'NEAR THE TIP', p(T, K.tiny + .15, .5), hp2[0], hp2[1]);
    });
  }

  // 4 AIR is sucked in through the hole, up a thin tube into the handle
  { const K = { sucks: c('sucks', A.while), thin: c('thin', A.while), handle: c('handle', A.while) };
    sfx.push({ t: K.sucks, k: 'sweep', g: -17 });
    add(A.while, false, (ctx, T) => {
      bgBlue(ctx, T);
      const o = { x: 520, y: 1020, ang: .38, s: .82 }, hp = nzP(o, ...NZ.hole), dp = nzP(o, ...NZ.dia), mid = nzP(o, 250, -18);
      const z = kf(T, [[A.while, 1.45], [K.sucks + .3, 1.45], [K.thin, 1], [K.handle, 1.25]]), f = kf(T, [[A.while, hp], [K.sucks + .3, hp], [K.thin, [540, 1060]], [K.handle, [dp[0] + 60, dp[1] + 60]]]);
      const S = (x, y) => [540 + (x - f[0]) * z, 1150 + (y - f[1]) * z];
      ctx.save(); focus(ctx, z, f[0], f[1], 540, 1150);
      live(ctx, T, 540, 1050, { yaw: .015, bob: 4, breathe: .004, seed: 7 }, () => nozzle(ctx, T, { ...o, shell: 0, flow: 1, hole: .6, air: p(T, K.sucks, .5) }));
      suck(ctx, T, hp[0], hp[1] - 6, p(T, K.sucks - .2, .5) * (1 - p(T, K.thin, .5)));
      ctx.restore();
      const hs = S(...hp), ms = S(...mid), ds = S(...dp);
      tag(ctx, 640, 1560, 'Air sucked in', 'WHILE GAS FLOWS', p(T, K.sucks, .5) * (1 - p(T, K.thin - .2, .3)), hs[0], hs[1]);
      tag(ctx, 620, 1480, 'Thin tube', 'HOLE → HANDLE', p(T, K.thin + .1, .5) * (1 - p(T, K.handle - .1, .3)), ms[0], ms[1]);
      tag(ctx, 640, 1500, 'Into the handle', 'AIR KEEPS FLOWING', p(T, K.handle + .1, .5), ds[0], ds[1]);
    });
  }

  // 5 GAS RISES over the hole: the air stops
  { const K = { rises: c('rises', A.moment), stops: c('stops', A.moment) };
    sfx.push({ t: K.rises, k: 'swoosh', g: -19 }, { t: K.stops, k: 'glitch', g: -17 });
    add(A.moment, false, (ctx, T) => {
      bgBlue(ctx, T);
      const o = { x: 240, y: 760, ang: .6, s: 1.2 }, hp = nzP(o, ...NZ.hole);
      const lvl = kf(T, [[A.moment, 1700], [K.rises, 1330], [K.rises + .9, hp[1] - 50]], eo);
      const covered = clamp((hp[1] + 6 - lvl) / 30);
      live(ctx, T, 600, 1100, { yaw: .015, bob: 4, breathe: .004, seed: 8 }, () => nozzle(ctx, T, { ...o, shell: 0, flow: 1, hole: .7 * (1 - covered), air: 1 - covered }));
      suck(ctx, T, hp[0], hp[1] - 6, 1 - covered);
      // filler-neck walls
      ctx.save(); ctx.strokeStyle = 'rgba(190,215,255,.25)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(560, 1500); ctx.lineTo(560, 2000); ctx.moveTo(1060, 1500); ctx.lineTo(1060, 2000); ctx.stroke(); ctx.restore();
      liquid(ctx, T, lvl, { a: .8 });
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 18; i++) { const u = (T * .4 + hash(i, 3)) % 1, y = lerp(1900, lvl + 20, u); if (y < lvl + 10) continue; ctx.strokeStyle = `rgba(255,240,200,${.5 * Math.sin(u * Math.PI)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(150 + 800 * hash(i, 4) + 10 * Math.sin(T * 3 + i), y, 5 + 6 * hash(i, 5), 0, 7); ctx.stroke(); }
      ctx.restore();
      tag(ctx, 330, 1640, 'Gas covers the hole', 'LEVEL RISES', p(T, K.rises + .5, .5), hp[0], hp[1] + 30, { accent: FUEL_RGB });
      status(ctx, T, 540, 560, 'AIR STOPS', '255,74,61', p(T, K.stops, .45));
    });
  }

  // 6 VACUUM yanks the diaphragm, the valve snaps shut (the click)
  { const K = { vac: c('vacuum', A.makes), yank: c('yanks', A.makes), dia: c('diaphragm', A.makes), valve: c('valve', A.makes), shut: c('shut', A.makes) };
    sfx.push({ t: K.vac, k: 'riser', g: -21 }, { t: K.shut, k: 'shutter', g: -10 });
    add(A.makes, false, (ctx, T) => {
      bgBlue(ctx, T);
      const o = { x: 760, y: 1080, ang: .12, s: 1.25 }, dp = nzP(o, ...NZ.dia), vp = nzP(o, ...NZ.valve);
      const z = kf(T, [[A.makes, 1.05], [K.dia, 1.18], [K.valve, 1.1]]), f = kf(T, [[A.makes, [540, 1050]], [K.dia, [dp[0] + 60, dp[1] + 120]], [K.valve, [vp[0] - 40, vp[1] - 40]]]);
      const S = (x, y) => [540 + (x - f[0]) * z, 1150 + (y - f[1]) * z];
      const shut = clamp((T - K.shut + .05) / .15), shake = T > K.shut && T < K.shut + .35 ? 10 * Math.sin(T * 90) * (1 - (T - K.shut) / .35) : 0;
      ctx.save(); focus(ctx, z, f[0] + shake, f[1], 540, 1150);
      live(ctx, T, 500, 1000, { yaw: .015, bob: 4, breathe: .004, seed: 9 }, () => nozzle(ctx, T, { ...o, shell: 0, flow: 1 - shut, vac: p(T, K.vac, .4), dia: p(T, K.yank, .35, eback), valve: shut }));
      ctx.restore();
      const ds = S(...dp), vs = S(...vp);
      status(ctx, T, 540, 560, 'VACUUM', '150,120,255', p(T, K.vac, .4) * (1 - p(T, K.dia - .2, .3)));
      tag(ctx, 330, 640, 'Diaphragm', 'PULLED BY VACUUM', p(T, K.dia, .5), ds[0], ds[1] - 30, { accent: '255,174,138' });
      tag(ctx, 620, 1600, 'Valve snaps shut', 'THAT IS THE CLICK', p(T, K.valve + .1, .5), vs[0], vs[1], { accent: '255,174,138' });
      burst(ctx, T, K.shut, 820, 1330, 'CLICK', ORANGE, 84);
    });
  }

  // 7 NO SENSOR, NO COMPUTER, JUST AIR (light)
  { const K = { sensor: A.no + .1, comp: c('computer', A.no), air: c('just air', A.no) };
    sfx.push({ t: K.air + .1, k: 'success', g: -15 });
    add(A.no, true, (ctx, T) => {
      bgLight(ctx, T);
      const rows = [['No sensor', 'chip', K.sensor, false], ['No computer', 'pc', K.comp, false], ['Just air', 'air', K.air, true]];
      rows.forEach(([lb, ic, t0, ok], i) => {
        const y = 560 + i * 330, k = p(T, t0, .6, eo5);
        flip(ctx, k, 540, y + 140, () => live(ctx, T, 540, y + 140, { yaw: .05, bob: 5, breathe: .005, seed: i }, () => {
          card(ctx, 110, y, 860, 280, { r: 34, fill: ok ? '#0f1730' : '#fff' });
          const ix = 260, iy = y + 140;
          if (ic === 'chip') { rr(ctx, ix - 70, iy - 70, 140, 140, 18); ctx.fillStyle = '#20242c'; ctx.fill(); ctx.fillStyle = '#c8a24a';
            for (let j = 0; j < 4; j++) { ctx.fillRect(ix - 56 + j * 34, iy - 92, 12, 22); ctx.fillRect(ix - 56 + j * 34, iy + 70, 12, 22); ctx.fillRect(ix - 92, iy - 56 + j * 34, 22, 12); ctx.fillRect(ix + 70, iy - 56 + j * 34, 22, 12); }
            rr(ctx, ix - 34, iy - 34, 68, 68, 8); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; ctx.stroke(); }
          if (ic === 'pc') { rr(ctx, ix - 90, iy - 75, 180, 120, 14); ctx.fillStyle = '#20242c'; ctx.fill(); rr(ctx, ix - 76, iy - 62, 152, 94, 8); ctx.fillStyle = `rgba(47,123,255,${.6 + .2 * Math.sin(T * 3)})`; ctx.fill();
            ctx.fillStyle = '#20242c'; ctx.fillRect(ix - 12, iy + 45, 24, 28); rr(ctx, ix - 55, iy + 70, 110, 14, 7); ctx.fill(); }
          if (ic === 'air') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, ix, iy, 140, CYAN_RGB, .6); ctx.restore(); ctx.strokeStyle = CYAN; ctx.lineWidth = 10; ctx.lineCap = 'round';
            for (let j = 0; j < 3; j++) { const yy = iy - 40 + j * 40, ph = Math.sin(T * 3 + j) * 14; ctx.beginPath(); ctx.moveTo(ix - 90 + ph, yy); ctx.bezierCurveTo(ix - 30 + ph, yy - 26, ix + 20 + ph, yy + 26, ix + 60 + ph, yy); ctx.arc(ix + 60 + ph, yy - 16, 16, Math.PI / 2, -Math.PI * .9, true); ctx.stroke(); } }
          txt(ctx, lb, 400, y + 160, 64, ok ? '#fff' : '#15161a', 900, 'left');
          if (ok) check(ctx, 880, y + 140, 46, p(T, t0 + .2, .5)); else xmark(ctx, 880, y + 140, 46, p(T, t0 + .2, .5));
        }));
      });
    });
  }

  // 8 TANK IS ALREADY FULL -> the extra goes into the vapor system (car x-ray)
  { const K = { full: c('full', A.so), extra: c('and the extra', A.so), str: c('straight', A.so), vapor: c('vapor', A.so) };
    sfx.push({ t: K.full, k: 'gear', g: -15 }, { t: K.vapor, k: 'sweep', g: -18 });
    add(A.so, false, (ctx, T) => {
      bgNight(ctx, T, { horizon: 1420 });
      const cx0 = 260, cy0 = 1150, sc = .78;
      const z = kf(T, [[A.so, 1], [K.extra, 1], [K.vapor, 1.18]]), f = kf(T, [[A.so, [540, 1180]], [K.extra, [540, 1180]], [K.vapor, [700, 1150]]]);
      ctx.save(); focus(ctx, z, f[0], f[1], 540, 1180);
      live(ctx, T, 700, 1250, { yaw: .01, bob: 3, breathe: .003, seed: 3 }, () => {
        car(ctx, T, cx0, cy0, sc, { ghost: .75 });
        tankCut(ctx, T, cx0, cy0, sc, { fill: 1, neck: p(T, K.extra, 1.0), over: p(T, K.str, .6), can: 1 });
        nozzle(ctx, T, { x: cx0 - .36 * 640 * Math.cos(.95), y: cy0 - .36 * 640 * Math.sin(.95), ang: .95, s: .36, shell: 1, hose: true });
      });
      ctx.restore();
      const gv = kf(T, [[A.so, .55], [K.full, .55], [K.full + .8, 1]], eback);
      live(ctx, T, 790, 720, { yaw: .06, bob: 5, seed: 1 }, () => gauge(ctx, T, 790, 720, 140, gv, p(T, A.so, .5) * (1 - p(T, K.vapor - .3, .4))));
      status(ctx, T, 400, 560, 'TANK IS ALREADY FULL', '70,230,140', p(T, K.full, .45));
      const cw = [540 + (cx0 + 800 * sc - f[0]) * z, 1180 + (cy0 + 220 * sc - f[1]) * z];
      tag(ctx, 430, 1600, 'Vapor system', 'EXTRA GAS GOES HERE', p(T, K.vapor, .5), cw[0], cw[1], { accent: FUEL_RGB });
      const ex = p(T, K.extra, .45, eback); if (ex > 0 && T < K.vapor) pop(ctx, ex, 300, 760, () => pill(ctx, 300, 760, '+ the extra', { bg: 'rgba(255,138,61,.95)', size: 30, h: 64 }));
    });
  }

  // 9 A BOX OF CHARCOAL built for fumes, not liquid
  { const K = { char: c('charcoal', A.box), fumes: c('fumes', A.box), liq: c('liquid', A.box) };
    sfx.push({ t: K.liq, k: 'swoosh', g: -17 });
    add(A.box, false, (ctx, T) => {
      bgNight(ctx, T, { horizon: 1500, canopy: .6 });
      const wet = p(T, K.liq - .1, 1.2, eio), z = kf(T, [[A.box, .9], [K.char, 1.02], [K.liq + 1.2, 1.08]]);
      ctx.save(); focus(ctx, z, 540, 1200, 540, 1200);
      // vent pipe feeding the box from the left
      ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(200,220,255,.45)'; ctx.lineWidth = 46; ctx.beginPath(); ctx.moveTo(-80, 820); ctx.lineTo(260, 820); ctx.quadraticCurveTo(330, 820, 330, 900); ctx.stroke();
      ctx.strokeStyle = '#0a1226'; ctx.lineWidth = 34; ctx.stroke();
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 12; i++) { const u = (T * .7 + i / 12) % 1; const x = lerp(-80, 330, u), y = u > .85 ? lerp(820, 900, (u - .85) / .15) : 820;
        if (wet > 0) { ctx.fillStyle = `rgba(${FUEL_RGB},${wet})`; ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.fill(); }
        else glowDot(ctx, x, y, 34, '200,210,230', .4 * p(T, K.fumes - .2, .5)); }
      ctx.restore();
      live(ctx, T, 560, 1220, { yaw: .05, bob: 6, breathe: .006, seed: 2 }, () => charcoalBox(ctx, T, 560, 1240, 600, 440, { n: 70, wet, fumes: p(T, K.fumes, .5) * (1 - wet) }));
      ctx.restore();
      tag(ctx, 720, 760, 'Charcoal canister', 'VAPOR SYSTEM', p(T, K.char, .5), 640, 1010);
      status(ctx, T, 540, 560, 'BUILT FOR FUMES', '200,210,230', p(T, K.fumes, .45) * (1 - p(T, K.liq - .1, .3)));
      status(ctx, T, 540, 560, 'NOT LIQUID', '255,74,61', p(T, K.liq, .45));
    });
  }

  // 10 CONSUMER REPORTS: check engine light + repair costing hundreds
  { const K = { trig: c('trigger', A.consumer), eng: c('engine', A.consumer), rep: c('repair', A.consumer), hund: c('hundreds', A.consumer) };
    const on = Math.min(K.trig, K.eng) + .2, rep = Math.min(K.rep, K.hund), hund = Math.max(K.hund, rep + .4);
    sfx.push({ t: on, k: 'glitch', g: -15 }, { t: Math.max(rep, on + 1.6), k: 'data', g: -18 });
    add(A.consumer, false, (ctx, T) => {
      bgNight(ctx, T, { horizon: 1900, canopy: .4 });
      const sh = kf(T, [[A.consumer, 0], [rep, 0], [rep + .6, -200]]);
      live(ctx, T, 540, 1080 + sh, { yaw: .03, bob: 5, breathe: .004, seed: 4 }, () => dash(ctx, T, 540, 1080 + sh, 960, { on: p(T, on, .3) * (.85 + .15 * Math.sin(T * 9)), a: p(T, A.consumer, .4) }));
      bin(ctx, p(T, A.consumer + .1, .5), () => { ctx.letterSpacing = '4px'; txt(ctx, 'SOURCE · CONSUMER REPORTS', 540, 590, 24, 'rgba(200,210,230,.75)', 700, 'center', MONO); ctx.letterSpacing = '0px'; });
      const cy = 1460, k = p(T, rep, .6, eo5);
      flip(ctx, k, 540, cy + 120, () => live(ctx, T, 540, cy + 120, { yaw: .04, bob: 4, seed: 6 }, () => {
        card(ctx, 120, cy, 840, 290, { r: 28, fill: '#141821', dark: true, stroke: `rgba(${AMBER_RGB},.45)` });
        engineIcon(ctx, 196, cy + 66, .6, `rgb(${AMBER_RGB})`, 6);
        ctx.letterSpacing = '3px'; txt(ctx, 'CHECK ENGINE', 250, cy + 76, 24, `rgb(${AMBER_RGB})`, 800, 'left', MONO); ctx.letterSpacing = '0px';
        txt(ctx, 'Repair: hundreds of $', 160, cy + 160, 58, '#fff', 900, 'left');
        ['Purge valve', 'Charcoal canister', 'Labour'].forEach((l, i) => { const a = p(T, rep + .4 + i * .2, .4); ctx.globalAlpha = a; txt(ctx, '• ' + l, 160 + i * 270, cy + 230, 26, 'rgba(200,210,230,.8)', 600, 'left'); ctx.globalAlpha = 1; });
      }));
      ctx.save(); for (let i = 0; i < 7; i++) { const u = (T - hund - i * .12) / 1.6; if (u <= 0 || u >= 1) continue; txt(ctx, '$', 180 + i * 120, cy - 20 - 300 * eo(u), 56 + 10 * hash(i), `rgba(120,240,160,${1 - u})`, 900); } ctx.restore();
    });
  }

  // 11 STOP AT THE FIRST CLICK (back to the forecourt)
  { const K = { first: c('first', A.stop) };
    sfx.push({ t: K.first + .3, k: 'click', g: -9 });
    add(A.stop, false, (ctx, T) => {
      ctx.save(); const z = kf(T, [[A.stop, 1.15], [K.first + 1, 1.0]]); focus(ctx, z, 560, 1150, 540, 1180);
      forecourt(ctx, T, { sale: T < K.first + .3 ? 31.4 + (T - A.stop) * 4 : 31.4 + (K.first + .3 - A.stop) * 4 });
      burst(ctx, T, K.first + .3, 700, 790);
      ctx.restore();
      const a1 = p(T, A.stop + .05, .5, eback), a2 = p(T, K.first, .5, eback);
      pop(ctx, a1, 540, 640, () => { ctx.save(); ctx.font = FONT(900, 104); ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(5,8,14,.85)'; ctx.lineWidth = 16; ctx.strokeText('STOP AT THE', 540, 670); ctx.fillStyle = '#fff'; ctx.fillText('STOP AT THE', 540, 670); ctx.restore(); });
      pop(ctx, a2, 540, 760, () => { ctx.save(); ctx.font = FONT(900, 116); ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(5,8,14,.85)'; ctx.lineWidth = 16; ctx.strokeText('FIRST CLICK', 540, 790); ctx.shadowColor = `rgba(${ORANGE_RGB},.7)`; ctx.shadowBlur = 30; ctx.fillStyle = ORANGE; ctx.fillText('FIRST CLICK', 540, 790); ctx.restore(); }, -.05);
    });
  }

  // 12 ENDING: the pump meter pumps code to 100%, the comment is posted with the pump button, the price board flips to the bio
  { const K = { crazy: c('crazy', A.crazy), code: c('code', A.crazy), comment: c('comment', A.crazy), guide: c('guide', A.crazy), yt: c('youtube', A.crazy), link: c('link', A.crazy), bio: c('bio', A.crazy) };
    const cta = Math.min(K.link, K.bio), post = K.guide + .45;
    sfx.push({ t: A.crazy + .05, k: 'riser', g: -17 }, { t: K.code + .1, k: 'success', g: -13 }, { t: post, k: 'click', g: -11 }, { t: K.yt, k: 'swoosh', g: -16 }, { t: cta + .3, k: 'click', g: -10 });
    const CODE = [['nozzle({ air: true })', '#7fd8ff'], ['if (gas > hole)', '#ffb59a'], ['  air = 0', '#ffb59a'], ['vacuum.pull(diaphragm)', '#c9bfff'], ["valve.snap('shut')", '#9ee6b0'], ['tank.full = true', '#ffd479'], ["stop('first click')", '#ff9c5b']];
    add(A.crazy, false, (ctx, T) => {
      bgNight(ctx, T, { horizon: 1500 });
      const mv = p(T, K.yt - .15, .8, eio), ds = lerp(1.32, .92, mv), base = lerp(2000, 2010, mv);
      const pct = clamp((T - A.crazy - .2) / Math.max(.6, K.code - A.crazy - .1));
      const scr = (c2, x, y, w, h) => {
        const cm = p(T, K.comment - .1, .5, eio);
        if (cm < 1) { c2.save(); c2.globalAlpha *= 1 - cm;
          // code "fuel" level rising behind the lines
          const lv = y + h - (h - 70) * pct; const g = c2.createLinearGradient(0, lv, 0, y + h); g.addColorStop(0, `rgba(${FUEL_RGB},.35)`); g.addColorStop(1, `rgba(${FUEL_RGB},.08)`);
          c2.fillStyle = g; c2.beginPath(); c2.moveTo(x, y + h); for (let xx = 0; xx <= w; xx += 10) c2.lineTo(x + xx, lv + 3 * Math.sin(xx / 18 + T * 5)); c2.lineTo(x + w, y + h); c2.fill();
          c2.letterSpacing = '3px'; txt(c2, 'CODE', x + 16, y + 44, 20, 'rgba(255,200,120,.75)', 700, 'left', MONO); c2.letterSpacing = '0px';
          lcd(c2, (pct * 100).toFixed(1) + '%', x + w - 16, y + 52, 42, pct >= 1 ? '120,255,170' : AMBER_RGB);
          const nl = Math.floor(pct * CODE.length + .001);
          CODE.forEach(([l, col], i) => { if (i >= nl) return; const a = clamp((pct * CODE.length - i) * 2); c2.globalAlpha = (1 - cm) * a; txt(c2, l, x + 16, y + 100 + i * 32, 19, col, 600, 'left', MONO); });
          c2.restore(); }
        if (cm > 0) { c2.save(); c2.globalAlpha *= cm;
          txt(c2, 'COMMENTS', x + 16, y + 44, 20, 'rgba(255,200,120,.75)', 700, 'left', MONO);
          rr(c2, x + 14, y + 80, w - 28, 64, 32); c2.fillStyle = '#1b212b'; c2.fill(); c2.strokeStyle = 'rgba(255,255,255,.18)'; c2.lineWidth = 2; c2.stroke();
          const g2 = typed('guide', T, K.guide - .15, K.guide + .2); txt(c2, g2 || 'Add a comment…', x + 36, y + 122, 26, g2 ? '#fff' : '#7a8290', g2 ? 700 : 500, 'left');
          if (T < post && g2 && Math.sin(T * 9) > 0) { c2.fillStyle = '#fff'; c2.fillRect(x + 38 + tw(c2, g2, 26, 700), y + 98, 3, 30); }
          const ps = p(T, post, .4, eback); if (ps > 0) pop(c2, ps, x + w / 2, y + 220, () => { pill(c2, x + w / 2, y + 220, 'guide  ✓ posted', { bg: GREEN, size: 24, h: 52 }); });
          c2.restore(); }
      };
      ctx.save(); alive(ctx, T, 540, base - 500 * ds, { yaw: .03, bob: 5, breathe: .004, seed: 2 });
      const d = dispenser(ctx, T, 540, base, ds, { screen: scr, lit: T > post && T < post + .6 ? 1 : 0, press: clamp(1 - Math.abs(T - post) / .15) });
      ctx.restore();
      // finger-free press: cursor taps the green pump button to post
      const bx = 540 + ds * (-190 + 30 + 48), by = base + ds * (-980 + 510 + 35);
      if (T > K.guide - .4 && T < post + .7) { const cx = kf(T, [[K.guide - .4, bx + 220], [post - .05, bx]]), cy = kf(T, [[K.guide - .4, by + 260], [post - .05, by]]); cursor(ctx, cx, cy, clamp(1 - Math.abs(T - post) / .1), clamp((post + .7 - T) / .3)); clickRing(ctx, bx, by, (T - post) / .5, '60,230,130'); }
      // 100% CODE stamp (above the dispenser before the board comes in)
      const st = p(T, K.code, .5, eback) * (1 - mv);
      if (st > 0) pop(ctx, st, 540, 640, () => { ctx.save(); ctx.translate(540, 640); ctx.rotate(-.05); rr(ctx, -250, -62, 500, 124, 28); ctx.fillStyle = 'rgba(20,150,80,.95)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 4; ctx.stroke();
        txt(ctx, '100% CODE', 0, 24, 66, '#fff', 900); ctx.restore(); }, -.3);
      // price board drops in and flips its rows into the bio card
      const bd = p(T, K.yt - .2, .7, eo5);
      if (bd > 0) { ctx.save(); ctx.translate(0, (1 - bd) * -700); alive(ctx, T, 540, 760, { yaw: .025, bob: 4, breathe: .003, seed: 5 });
        const hl = p(T, cta + .3, .35);
        board(ctx, T, 540, 520, 820, [['REG', '3.49'], ['PLUS', '3.89'], ['DSL', '4.19']], {
          header: 'GUIDE', flips: [p(T, K.yt, .5, eio), p(T, K.yt + .25, .5, eio), p(T, cta - .2, .5, eio)],
          next: [
            (c2, x, y, w, h) => { avatar(c2, T, x + 60, y + h / 2, 36, named); txt(c2, named ? 'agentsoly' : 'Explainers in 100% code', x + 120, y + h / 2 + 13, named ? 40 : 32, '#fff', 800, 'left'); },
            (c2, x, y, w, h) => { pill(c2, x + 30, y + h / 2, '▶ YouTube', { bg: '#e62117', size: 30, h: 60, align: 'left' }); pill(c2, x + 260, y + h / 2, '♪ TikTok', { bg: '#0b0b0f', size: 30, h: 60, align: 'left', stroke: 'rgba(255,255,255,.35)' }); },
            (c2, x, y, w, h) => { rr(c2, x, y, w, h, 14); c2.fillStyle = `rgba(47,123,255,${.15 + .35 * hl})`; c2.fill(); c2.strokeStyle = `rgba(90,150,255,${.4 + .6 * hl})`; c2.lineWidth = 3; c2.stroke(); txt(c2, '🔗  Link in bio · full guide', x + 30, y + h / 2 + 12, 34, '#cfe0ff', 800, 'left'); },
          ] });
        ctx.restore();
        const lx = 540, ly = 520 + 120 + 2 * 110 + 47;
        if (T > cta - .4) { const cx = kf(T, [[cta - .4, 900], [cta + .25, lx + 120]]), cy = kf(T, [[cta - .4, 1050], [cta + .25, ly]]); cursor(ctx, cx, cy, clamp(1 - Math.abs(T - cta - .3) / .1)); clickRing(ctx, lx + 120, ly, (T - cta - .3) / .5); }
      }
    });
  }

  list.forEach((sc, i) => sc.end = list[i + 1] ? list[i + 1].start : 1e9);
  return { scenes: list, sfx };
}
