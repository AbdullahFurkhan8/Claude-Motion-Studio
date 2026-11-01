// "NVIDIA put a supercomputer chip in a laptop" - RTX Spark (N1X) explainer. All timing from word cues c('phrase', after).
// Drawn in code (spark.js + kit.js) plus the user's assets: NVIDIA logo (keyed), RTX Spark badge, DGX Spark cutout,
// Jensen Huang photo card and the keynote clip (frames in assets/clip). No presenter.
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, hash, rr, alive, flipIn } from './lib.js';
import { FONT, MONO, SERIF, GREEN, RED, txt, tw, bin, pop, card, cursor, clickRing, check, xmark, pill, avatar, glowDot } from './kit.js';
import { img } from './assets.js';
import { NV, NV_RGB, LIME, LIME_RGB, TEAL_RGB, RED_RGB, bgRoom, bgStage, vignette, caps, callout, big, bubble, bz, trail, laptop, chatUI, chip,
  dataCenter, rack, coreFloor, memBoard, winApp, appBody, asmBody, photo, clipName, CLIP_FRAMES, prism, wifi, spinner, fileIcon, flipCal } from './spark.js';

export const IMAGES = ['nvidia_logo.png', 'rtx_spark.png', 'dgx_spark.png', 'jensen.jpg',
  ...Array.from({ length: CLIP_FRAMES }, (_, i) => `clip/${String(i + 1).padStart(4, '0')}.jpg`)];
const kf = (T, keys, e = eio) => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (T < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e((T - t0) / Math.max(1e-3, t1 - t0)); return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u); }
  return keys[keys.length - 1][1];
};
const live = (ctx, T, x, y, o, fn) => { ctx.save(); alive(ctx, T, x, y, o); fn(); ctx.restore(); };
const flip = (ctx, k, x, y, fn) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k * 1.5); flipIn(ctx, x, y, k); fn(); ctx.restore(); };
const typed = (s, T, t0, t1) => s.slice(0, Math.floor(s.length * clamp((T - t0) / Math.max(.05, t1 - t0))));
const focus = (ctx, s, fx, fy, ox = 540, oy = 1150) => { ctx.translate(ox, oy); ctx.scale(s, s); ctx.translate(-fx, -fy); };
const fmt = n => Math.round(n).toLocaleString('en-US');
function stamp(ctx, a, x, y, s, rgb = NV_RGB, rot = -.06, size = 64) {
  if (a <= 0) return; pop(ctx, eback(clamp(a)), x, y, () => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.font = FONT(900, size); const w = ctx.measureText(s).width + 70;
    rr(ctx, -w / 2, -size * .95, w, size * 1.5, 22); ctx.fillStyle = `rgba(${rgb},.95)`; ctx.shadowColor = `rgba(${rgb},.6)`; ctx.shadowBlur = 40; ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 4; ctx.stroke(); txt(ctx, s, 0, size * .32, size, '#0b0e08', 900); ctx.restore(); }, rot * 4);
}
function pulseRing(ctx, x, y, t, rgb = LIME_RGB, r0 = 30, r1 = 220, sy = 1) {
  if (t <= 0 || t >= 1) return; ctx.save(); ctx.translate(x, y); ctx.scale(1, sy); ctx.strokeStyle = `rgba(${rgb},${1 - t})`; ctx.lineWidth = 8 * (1 - t) + 2; ctx.beginPath(); ctx.arc(0, 0, lerp(r0, r1, eo(t)), 0, 7); ctx.stroke(); ctx.restore();
}
const logo = (ctx, T, x, y, w, a = 1) => { if (a <= 0) return; live(ctx, T, x, y, { yaw: .05, bob: 3, breathe: .01, seed: 1 }, () => img(ctx, 'nvidia_logo', x, y, w, a)); };

export const KEYWORDS = 'chip supercomputer laptop assistant leave spark n1x 16th center computer back internet lags files flips lap monster 20core mediatek blackwell 6144 cuda petaflop billion second memory processor 128 gigabytes models reinvents agents simple 40 apps ask work catch language windows translator prism asus lenovo msi arriving crazy code guide bio';
export const EMOJI = { monster: '🔥', internet: '🌐', files: '📁', lags: '🐢', code: '💻', guide: '💬', bio: '🔗' };
export const CAPTION_SFX = false;
// Hinglish voice: same scenes, cues mapped to the words it says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      'and your ai': 'aur aapke', 'inside a': 'ek laptop', assistant: 'assistant', never: 'kabhi', leave: 'bahar', inside: 'andar',
      "it's called": 'iska naam', 'right now': 'abhi jab', 'ask an': 'poochhte', 'your words': 'aapke words', processed: 'process', someone: 'kisi aur', answer: 'jawaab', back: 'waapas',
      "that's why it": 'isliye internet', lags: 'lag',
      'rtx spark flips': 'rtx spark ye', flips: 'ulta', runs: 'chalta', 'right here': 'yahin', lap: 'god',
      'and the chip': 'aur chip to', 'a 20-core': '20-core', together: 'dono milke', million: 'million', calculations: 'calculations', 'every second': 'second',
      'but the real': 'lekin asli', split: 'bant', 'graphics card': 'graphics card',
      'here they share': 'yahan dono', big: 'bade', itself: 'jaate',
      "that's why nvidia": 'isliye nvidia', reinvents: 'invent', era: 'daur', 'pitch is simple': 'pitch simple',
      'for 40 years': '40 saal', launched: 'launch', 'now you just': 'ab bas', 'just ask': 'poochhiye', work: 'kaam',
      "so what's the catch": 'to catch', 'its chip': 'iski chip', 'different language': 'alag bhasha', 'almost every': 'almost',
      'so older apps': 'isliye purane apps', "microsoft's": 'microsoft',
      'laptops from': 'asus', arriving: 'aa rahe',
      'and the next': 'aur ho sakta', talk: 'baat', live: 'rehta',
      "and here's the crazy": 'aur sabse crazy', learn: 'seekhna',
    },
    keywords: 'chip supercomputer laptop assistant bahar spark n1x october center computer waapas internet lag files ulta god monster 20core mediatek blackwell 6144 cuda petaflop billion second memory processor 128 gb models fit invent agents simple 40 apps poochhiye kaam catch bhasha windows translator prism asus lenovo msi crazy code guide bio',
    emoji: { monster: '🔥', internet: '🌐', files: '📁', lag: '🐢', code: '💻', guide: '💬', bio: '🔗' },
  },
};

export function makeScenes(c, lang = 'en', DURATION = 90) {
  const named = lang !== 'hi'; // Hindi version: profile picture only, no channel name or handle
  const list = [], sfx = [];
  const add = (start, light, draw) => { list.push({ start, light, draw }); if (start > 0) sfx.push({ t: start - .05, k: 'whoosh', g: -19 }); };
  const s = x => x - .1;
  const A = {
    assist: s(c('and your AI')), called: s(c("it's called")), now: s(c('right now')), why: s(c("that's why it")), flips: s(c('RTX Spark flips')),
    monster: s(c('and the chip')), cores: s(c('a 20-core')), peta: s(c('together')), mem: s(c('but the real')), share: s(c('here they share')),
    quote: s(c("that's why NVIDIA")), years: s(c('for 40 years')), catch: s(c("so what's the catch")), prism: s(c('so older apps')),
    oems: s(c('laptops from')), next: s(c('and the next')), end: s(c("and here's the crazy")),
  };

  // 1 HOOK: NVIDIA lifts the chip out of its DGX Spark desktop supercomputer and drops it inside a laptop
  { const K = { lift: c('chip'), label: c('desktop'), fly: c('inside a'), sup: c('supercomputer') };
    const fly = Math.max(K.fly, K.lift + .7), land = fly + .75;
    sfx.push({ t: .05, k: 'riser', g: -19 }, { t: K.lift, k: 'shimmer', g: -17 }, { t: fly, k: 'swoosh', g: -16 }, { t: land, k: 'success', g: -17 });
    add(0, false, (ctx, T) => {
      bgRoom(ctx, T, { desk: 1330 });
      logo(ctx, T, 540, 600, 400, p(T, 0, .6));
      const mv = p(T, fly - .15, .9, eio), bx = lerp(540, 250, mv), bw = lerp(720, 400, mv), by = lerp(1240, 1330, mv);
      const lx = lerp(1500, 690, p(T, fly - .35, .9, eo5));
      // DGX Spark (product photo cutout) on the desk
      live(ctx, T, bx, by, { yaw: .05, bob: 5, breathe: .006, seed: 2 }, () => {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, bx, by + 40, bw * .7, NV_RGB, .35 * (1 - mv * .6)); ctx.restore();
        img(ctx, 'dgx_spark', bx, by, bw);
      });
      // the laptop slides in from the right
      const LW = 560, LY = 1430, lp = { cx: lx, cy: LY };
      const land_k = p(T, land - .1, .5);
      let chipAt = [lx, LY + .38 * LW * .34];
      if (lx < 1400) live(ctx, T, lx, LY, { yaw: .02, bob: 3, breathe: .003, seed: 4 }, () => {
        const r = laptop(ctx, T, lx, LY, LW, { xray: land_k, chipGlow: land_k * (.7 + .3 * Math.sin(T * 5)), screen: (c2, x, y, w, h) => chatUI(c2, T, x, y, w, h, { greet: 1 }) });
        chipAt = r.chipAt;
      });
      // chip rising out of the box, then flying into the laptop
      const rise = p(T, K.lift, .7, eback);
      if (rise > 0 && T < land + .05) {
        const top = [bx, by - 230 * rise], u = p(T, fly, .8, eio);
        const P = [top, [top[0] + 120, top[1] - 260], [chipAt[0] - 60, chipAt[1] - 420], chipAt];
        const pos = u > 0 ? bz(u, ...P) : top, sc = lerp(170, 110, u);
        if (u > 0) trail(ctx, P, Math.max(0, u - .35), u, 1 - p(T, land - .1, .3));
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, pos[0], pos[1], sc * 1.6, NV_RGB, .8); ctx.restore();
        live(ctx, T, pos[0], pos[1], { yaw: .2, bob: 4, spin: 0, tilt: .05, seed: 3 }, () => chip(ctx, T, pos[0], pos[1], sc, { tilt: .3, gpu: 1 }));
      }
      pulseRing(ctx, chipAt[0], chipAt[1], (T - land) / .8, NV_RGB, 20, 180, .45);
      callout(ctx, 'DGX SPARK', 150, 860, bx - bw * .1, by - 60, p(T, K.label, .5) * (1 - p(T, fly - .3, .3)));
      bin(ctx, p(T, K.sup, .5) * (1 - p(T, fly - .3, .3)), () => caps(ctx, 'DESKTOP AI SUPERCOMPUTER', 150, 920, 20, 'rgba(214,245,72,.95)', 'left'));
      callout(ctx, 'INSIDE A LAPTOP', 560, 820, lx, LY - 120, p(T, land - .2, .5));
    });
  }

  // 2 YOUR AI ASSISTANT NEVER HAS TO LEAVE IT: the bubble tries to fly off to the cloud and snaps back
  { const K = { as: c('assistant', A.assist), nev: c('never', A.assist), leave: c('leave', A.assist) };
    const out = Math.max(K.leave, K.nev + .4), back = out + .65;
    sfx.push({ t: K.as, k: 'shimmer', g: -18 }, { t: out, k: 'sweep', g: -17 });
    add(A.assist, false, (ctx, T) => {
      bgRoom(ctx, T, { desk: 1400 });
      const LW = 800, LX = 540, LY = 1430;
      live(ctx, T, LX, LY, { yaw: .025, bob: 4, breathe: .004, seed: 5 }, () => laptop(ctx, T, LX, LY, LW, {
        screen: (c2, x, y, w, h) => chatUI(c2, T, x, y, w, h, { msgs: [{ me: true, lines: 1, a: p(T, A.assist + .1, .4), w: .45 }, { me: false, lines: 3, a: p(T, K.as, .4), w: .8 }] }) }));
      // cloud far top-right, crossed out once the bubble is pulled back
      const cl = p(T, K.nev - .2, .5), cx = 860, cy = 640;
      if (cl > 0) live(ctx, T, cx, cy, { yaw: .1, bob: 6, seed: 2 }, () => { ctx.save(); ctx.globalAlpha *= cl * .9; ctx.fillStyle = 'rgba(200,215,235,.18)'; ctx.strokeStyle = 'rgba(200,215,235,.7)'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(cx - 50, cy + 10, 42, Math.PI * .5, Math.PI * 1.5); ctx.arc(cx, cy - 20, 58, Math.PI, 0); ctx.arc(cx + 55, cy + 10, 42, Math.PI * 1.5, Math.PI * .5); ctx.closePath(); ctx.fill(); ctx.stroke();
        caps(ctx, 'CLOUD', cx, cy + 100, 20, 'rgba(200,215,235,.8)', 'center'); ctx.restore(); xmark(ctx, cx + 70, cy - 60, 30, p(T, back, .5)); });
      // bubble: pops out of the screen, reaches for the cloud, the tether yanks it back
      const home = [LX, LY - 320], hover = [LX - 40, LY - 560 - 10 * Math.sin(T * 2)];
      const emerge = p(T, K.as, .6, eback), reach = p(T, out, .45, eo) * (1 - p(T, back - .1, .5, eback));
      let pos = [lerp(home[0], hover[0], emerge), lerp(home[1], hover[1], emerge)];
      pos = [lerp(pos[0], cx - 120, reach), lerp(pos[1], cy + 40, reach)];
      if (emerge > 0) {
        // tether from the screen
        ctx.save(); ctx.strokeStyle = `rgba(${LIME_RGB},${.35 + .5 * reach})`; ctx.lineWidth = 3 + 3 * reach; ctx.setLineDash([12, 10]); ctx.lineDashOffset = -T * 60;
        ctx.beginPath(); ctx.moveTo(...home); ctx.quadraticCurveTo(home[0] - 80, (home[1] + pos[1]) / 2, pos[0], pos[1] + 30); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
        bubble(ctx, T, pos[0], pos[1], 1.1 + .1 * Math.sin(T * 3), { a: clamp(emerge * 2) });
      }
      const st = p(T, back + .2, .5, eback); if (st > 0) pop(ctx, st, 540, 1720, () => pill(ctx, 540, 1720, '✓  Stays on your laptop', { bg: 'rgba(118,185,0,.95)', fg: '#0b0e08', size: 34, h: 74, w: 800 }));
      callout(ctx, 'YOUR AI ASSISTANT', 110, 620, pos[0] - 70, pos[1] - 40, p(T, K.as + .2, .5) * (1 - p(T, out - .1, .3)));
    });
  }

  // 3 IT'S CALLED RTX SPARK, codename N1X, on sale October 16th
  { const K = { rtx: c('RTX', A.called), n1x: c('N1X', A.called), sale: c('sale', A.called), oct: c('October', A.called) };
    const fl = Math.max(K.oct, K.sale + .5);
    sfx.push({ t: K.rtx, k: 'shutter', g: -13 }, { t: fl, k: 'gear', g: -15 });
    add(A.called, false, (ctx, T) => {
      bgStage(ctx, T, { gy: 1150 });
      const b = p(T, K.rtx - .1, .7, eo5);
      flip(ctx, b, 540, 640, () => live(ctx, T, 540, 640, { yaw: .06, bob: 5, breathe: .006, seed: 1 }, () => {
        ctx.save(); ctx.shadowColor = `rgba(${NV_RGB},.55)`; ctx.shadowBlur = 60; img(ctx, 'rtx_spark', 540, 640, 620); ctx.restore(); }));
      const ch = p(T, A.called, .7, eo5), cs = lerp(.6, 1, ch) * 340;
      live(ctx, T, 540, 1100, { yaw: .12, bob: 8, breathe: .01, seed: 3 }, () => { ctx.save(); ctx.globalAlpha *= ch; ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 540, 1100, 420, NV_RGB, .55); ctx.restore();
        if (ch > 0) { ctx.save(); ctx.globalAlpha *= ch; chip(ctx, T, 540, 1100, cs, { tilt: .3, gpu: 1 }); ctx.restore(); } });
      callout(ctx, 'CODENAME N1X', 120, 920, 440, 1040, p(T, K.n1x, .5));
      // flip calendar SEP 1 -> OCT 16
      const ca = p(T, K.sale - .1, .6, eback);
      if (ca > 0) pop(ctx, ca, 540, 1600, () => live(ctx, T, 540, 1600, { yaw: .05, bob: 4, seed: 6 }, () => {
        pill(ctx, 540, 1460, 'ON SALE', { bg: 'rgba(118,185,0,.95)', fg: '#0b0e08', size: 26, h: 54, w: 900 });
        flipCal(ctx, T, 560, 1610, 170, ['SEP', '1'], ['OCT', '16'], p(T, fl, .5, eio)); }));
    });
  }

  // 4 RIGHT NOW: your words travel to a data center, get processed on someone else's computer, the answer travels back
  { const K = { ask: c('ask an', A.now), words: c('your words', A.now), proc: c('processed', A.now), some: c('someone', A.now), ans: c('answer', A.now), back: c('back', A.now) };
    const go = K.words, hall0 = Math.max(K.proc - .15, go + .9), hall1 = Math.max(K.ans - .15, hall0 + 1), ret = hall1 + .2;
    sfx.push({ t: go, k: 'sweep', g: -16 }, { t: hall0, k: 'data', g: -18 }, { t: ret + .1, k: 'swoosh', g: -16 });
    const LX = 540, LY = 1560, LW = 560, DC = [540, 860];
    const P = [[LX, LY - 230], [LX + 260, LY - 520], [DC[0] - 260, DC[1] + 260], [DC[0], DC[1] - 40]];
    add(A.now, false, (ctx, T) => {
      const hall = p(T, hall0, .55, eio) * (1 - p(T, hall1, .55, eio));
      ctx.save(); const z = 1 + 1.6 * hall; focus(ctx, z, lerp(540, DC[0], hall), lerp(1150, DC[1] - 60, hall), 540, 1150);
      bgRoom(ctx, T, { desk: 1500, glow: .7 });
      live(ctx, T, DC[0], DC[1], { yaw: .01, bob: 2, breathe: 0, seed: 1 }, () => dataCenter(ctx, T, DC[0], DC[1], 1.0, { lit: p(T, go + .6, .6) }));
      live(ctx, T, LX, LY, { yaw: .02, bob: 3, breathe: .003, seed: 4 }, () => laptop(ctx, T, LX, LY, LW, {
        screen: (c2, x, y, w, h) => chatUI(c2, T, x, y, w, h, { typed: T < go ? typed('Plan my trip', T, K.ask - .2, K.ask + .5) : '', msgs: T > ret + .8 ? [{ me: false, lines: 3, a: p(T, ret + .8, .4), w: .8 }] : [] }) }));
      // up: words travel to the data center
      const u = p(T, go, 1.0, eio), v = p(T, ret, 1.0, eio);
      if (T < hall0 + .2) { trail(ctx, P, 0, u, 1); if (u > 0 && u < 1) bubble(ctx, T, ...bz(u, ...P), .8); }
      if (T > ret) { trail(ctx, P, 1 - v, 1, 1, '120,230,255'); if (v < 1) bubble(ctx, T, ...bz(1 - v, ...P), .8, { col: '#8fe6ff', rgb: '120,230,255' }); }
      ctx.restore();
      // inside the hall: someone else's computer
      if (hall > 0) {
        ctx.save(); ctx.globalAlpha *= clamp(hall * 1.6); const hz = lerp(.85, 1, hall); focus(ctx, hz, 540, 1180, 540, 1180);
        ctx.fillStyle = '#d9dee3'; ctx.fillRect(-W, -H, W * 3, H * 3);
        const fg = ctx.createLinearGradient(0, 1500, 0, H); fg.addColorStop(0, '#b9c0c7'); fg.addColorStop(1, '#8d959d'); ctx.fillStyle = fg; ctx.fillRect(-W, 1500, W * 3, H);
        rack(ctx, T, 90, 560, 420, 1000, { act: .3 }); rack(ctx, T, 570, 560, 420, 1000, { act: .6 * p(T, hall0 + .3, .5) });
        bubble(ctx, T, 780, 1060 + 20 * Math.sin(T * 3), .9);
        vignette(ctx, .35);
        callout(ctx, "SOMEONE ELSE'S COMPUTER", 140, 1680, 780, 1120, p(T, K.some, .5));
        ctx.restore();
      }
      callout(ctx, 'YOUR WORDS', 120, 1240, LX - 120, LY - 330, p(T, go + .1, .4) * (1 - p(T, hall0 - .3, .3)));
      callout(ctx, 'THE ANSWER', 640, 1240, LX + 100, LY - 330, p(T, ret + .3, .4));
    });
  }

  // 5 WHY: needs the internet, it lags, your files leave your laptop
  { const K = { net: c('internet', A.why), lag: c('lags', A.why), files: c('files', A.why) };
    sfx.push({ t: K.lag, k: 'glitch', g: -16 }, { t: K.files + .2, k: 'swoosh', g: -18 });
    add(A.why, false, (ctx, T) => {
      bgRoom(ctx, T, { desk: 1700, glow: .4, tint: 'rgba(5,8,12,.35)' });
      const rows = [['Needs the internet', 'NO SIGNAL = NO AI', 'wifi', Math.min(K.net, A.why + .3)], ['It lags', 'ROUND TRIP TO A SERVER', 'lag', K.lag], ['Your files leave', 'UPLOADED TO SOMEONE ELSE', 'files', K.files]];
      rows.forEach(([lb, sub, ic, t0], i) => {
        const y = 560 + i * 350, k = p(T, t0 - .1, .6, eo5), cy = y + 150;
        flip(ctx, k, 540, cy, () => live(ctx, T, 540, cy, { yaw: .05, bob: 5, breathe: .004, seed: i + 1 }, () => {
          card(ctx, 90, y, 900, 300, { r: 36, fill: '#14181d', dark: true, stroke: 'rgba(255,255,255,.08)' });
          const ix = 250, iy = cy;
          rr(ctx, ix - 95, iy - 95, 190, 190, 40); ctx.fillStyle = `rgba(${RED_RGB},.12)`; ctx.fill();
          if (ic === 'wifi') { wifi(ctx, ix, iy - 20, 120, `rgba(${RED_RGB},${.55 + .45 * Math.sin(T * 5)})`, (T * 1.5) % 1.2); }
          if (ic === 'lag') { spinner(ctx, T, ix, iy, 62, `rgba(255,170,80,A)`); }
          if (ic === 'files') { for (let f = 0; f < 3; f++) { const u = ((T - t0) * .7 + f / 3) % 1; if (T < t0) continue; ctx.save(); ctx.globalAlpha *= Math.sin(u * Math.PI); fileIcon(ctx, ix - 30 + u * 140, iy + 10 - u * 90 + f * 8, 70); ctx.restore(); } }
          txt(ctx, lb, 400, cy + 6, 58, '#fff', 900, 'left');
          caps(ctx, sub, 402, cy + 62, 20, `rgba(${RED_RGB},.95)`);
          if (ic === 'lag') { const ms = Math.floor(lerp(0, 2400, clamp((T - t0) / 1.2))); txt(ctx, (ms / 1000).toFixed(1) + ' s', 940, cy - 50, 34, 'rgba(255,170,80,1)', 800, 'right', MONO); }
        }));
      });
    });
  }

  // 6 RTX SPARK FLIPS THAT: the AI runs right here, on the chip in your lap
  { const K = { flip: c('flips', A.flips), runs: c('runs', A.flips), here: c('right here', A.flips), chip: c('chip', A.flips), lap: c('lap', A.flips) };
    const xr = Math.min(K.runs, K.here) - .1, dive = Math.max(K.here, xr + .5), lapT = Math.max(K.lap, dive + .6);
    sfx.push({ t: K.flip, k: 'riser', g: -18 }, { t: dive + .7, k: 'success', g: -16 });
    add(A.flips, false, (ctx, T) => {
      bgRoom(ctx, T, { desk: 1230 });
      const LX = 540, LY = 1150, LW = 820, z = kf(T, [[A.flips, 1.0], [xr, 1.0], [dive + .5, 1.12]]);
      ctx.save(); focus(ctx, z, 540, lerp(1150, 1260, (z - 1) / .12), 540, 1150);
      let r;
      live(ctx, T, LX, LY, { yaw: .015, bob: 3, breathe: .003, seed: 6 }, () => { r = laptop(ctx, T, LX, LY, LW, { xray: p(T, xr, .7), chipGlow: p(T, dive + .6, .4) * (.75 + .25 * Math.sin(T * 6)),
        screen: (c2, x, y, w, h) => chatUI(c2, T, x, y, w, h, { msgs: [{ me: true, lines: 1, a: 1, w: .45 }, { me: false, lines: 3, a: p(T, dive + .7, .4), w: .8 }] }) }); });
      const ch = r ? r.chipAt : [540, 1250];
      // the old cloud route flips: arrow up -> arrow down into the deck
      const fk = p(T, K.flip, .6, eio);
      ctx.save(); ctx.globalAlpha *= 1 - p(T, xr, .4);
      ctx.translate(540, 560); ctx.rotate(Math.PI * fk); ctx.strokeStyle = `rgba(${LIME_RGB},.9)`; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(0, -60); ctx.moveTo(-40, -20); ctx.lineTo(0, -60); ctx.lineTo(40, -20); ctx.stroke(); ctx.restore();
      // bubble dives from the screen into the chip
      const u = p(T, dive, .7, eio), P = [[540, 800], [700, 900], [700, ch[1] - 160], ch];
      if (u < 1) { const q = u > 0 ? bz(u, ...P) : [540, 800 + 8 * Math.sin(T * 3)]; if (u > 0) trail(ctx, P, Math.max(0, u - .4), u); bubble(ctx, T, q[0], q[1], lerp(1, .6, u), { a: p(T, A.flips, .4) }); }
      pulseRing(ctx, ch[0], ch[1], (T - dive - .7) / .9, NV_RGB, 30, 260, .4);
      pulseRing(ctx, ch[0], ch[1], (T - lapT) / .9, LIME_RGB, 30, 300, .4);
      ctx.restore();
      callout(ctx, 'HERE', 160, 1520, 540 + (ch[0] - 540) * z, 1150 + (ch[1] - lerp(1150, 1260, (z - 1) / .12)) * z, p(T, Math.max(K.chip, dive + .5), .5));
      const lp = p(T, lapT, .5, eback); if (lp > 0) pop(ctx, lp, 640, 1720, () => pill(ctx, 640, 1720, 'Runs in your lap', { bg: 'rgba(118,185,0,.95)', fg: '#0b0e08', size: 34, h: 74, w: 800 }));
    });
  }

  // 7 THE CHIP IS A MONSTER: Jensen Huang holding it up (photo card, slow push + turn)
  { const K = { mon: c('monster', A.monster) };
    sfx.push({ t: K.mon, k: 'click', g: -11 });
    add(A.monster, false, (ctx, T) => {
      bgStage(ctx, T, { gy: 1050 });
      const k = p(T, A.monster, .7, eo5), zoom = lerp(1.0, 1.16, clamp((T - A.monster) / 3.5));
      flip(ctx, k, 540, 1060, () => live(ctx, T, 540, 1060, { yaw: .07, bob: 6, breathe: .004, tilt: .01, seed: 2 }, () => {
        photo(ctx, 'jensen', 130, 640, 820, 784, { r: 34, zoom, ox: .62, oy: .3 });
        // glow around the chip in his hand (photo coords ~ (300,150) of 400x382)
        const im = { x: 130, y: 640, w: 820, h: 784 }, sc = Math.max(im.w / 400, im.h / 382) * zoom, ix = im.x + (im.w - 400 * sc) * .62 + 300 * sc, iy = im.y + (im.h - 382 * sc) * .3 + 150 * sc;
        const g = p(T, K.mon - .2, .5); if (g > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, ix, iy, 190, LIME_RGB, g * (.7 + .3 * Math.sin(T * 5))); ctx.restore(); pulseRing(ctx, ix, iy, (T - K.mon) / 1, LIME_RGB, 40, 200); }
        caps(ctx, 'NVIDIA KEYNOTE', 170, 1390, 18, 'rgba(255,255,255,.75)');
      }));
      callout(ctx, 'RTX SPARK', 640, 1560, 760, 1240, p(T, A.monster + .4, .5));
      stamp(ctx, p(T, K.mon, .45), 360, 1620, 'MONSTER', NV_RGB, -.06, 76);
    });
  }

  // 8 A 20-core Grace CPU built with MediaTek next to a Blackwell GPU with 6,144 CUDA cores
  { const K = { grace: c('Grace', A.cores), med: c('MediaTek', A.cores), bw: c('Blackwell', A.cores), n: c('6,144', A.cores), cuda: c('CUDA', A.cores) };
    const g0 = Math.max(K.n, K.bw + .3), g1 = Math.max(K.cuda + .6, g0 + 1.2);
    sfx.push({ t: K.med, k: 'shimmer', g: -18 }, { t: g0, k: 'data', g: -17 });
    add(A.cores, false, (ctx, T) => {
      bgStage(ctx, T, { gy: 1150 });
      const lit = clamp((T - A.cores - .1) / Math.max(.5, K.grace + .3 - A.cores)) * 20, gf = clamp((T - g0) / (g1 - g0));
      const z = kf(T, [[A.cores, 1.08], [K.bw, 1.0], [g1, 1.04]]), fy = kf(T, [[A.cores, 1260], [K.bw, 1180], [g1, 1120]]);
      ctx.save(); focus(ctx, z, 540, fy, 540, 1180);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 540, 1180, 640, NV_RGB, .25 + .35 * gf); ctx.restore();
      let pos; live(ctx, T, 540, 1180, { yaw: .05, bob: 5, breathe: .004, seed: 4 }, () => { pos = chip(ctx, T, 540, 1180, 540, { tilt: .14, gpu: gf, coreFill: i => clamp(lit - i), hiCPU: p(T, A.cores, .4) * (1 - p(T, K.bw, .4)), hiGPU: p(T, K.bw, .4) }); });
      ctx.restore();
      const S = q => [540 + (q[0] - 540) * z, 1180 + (q[1] - fy) * z];
      const cp = S(pos.cpu), gp = S(pos.gpu);
      callout(ctx, 'GRACE CPU', 70, 1760, cp[0] - 120, cp[1] + 60, p(T, K.grace - .1, .5));
      callout(ctx, 'BLACKWELL GPU', 660, 600 + 90, gp[0] + 120, gp[1] - 100, p(T, K.bw, .5), { align: 'left' });
      // counter: 20 cores -> 6,144 CUDA cores
      const showN = T < g0 ? `${Math.round(lit)}` : fmt(6144 * eo(gf));
      const lab = T < g0 ? 'CPU CORES' : 'CUDA CORES';
      bin(ctx, p(T, A.cores + .05, .4), () => { big(ctx, showN, 300, 690, 120, '#fff', T < g0 ? '150,200,255' : NV_RGB); caps(ctx, lab, 300, 740, 22, T < g0 ? 'rgba(150,200,255,1)' : `rgba(${LIME_RGB},1)`, 'center'); });
      const mt = p(T, K.med, .5, eback); if (mt > 0) pop(ctx, mt, 780, 1830, () => pill(ctx, 780, 1830, 'Built with MediaTek', { bg: 'rgba(255,255,255,.95)', fg: '#111', size: 28, h: 62, w: 800 }));
    });
  }

  // 9 TOGETHER: up to one petaflop = a million billion calculations every second (core floor)
  { const K = { peta: c('petaflop', A.peta), mil: c('million', A.peta), bil: c('billion', A.peta), calc: c('calculations', A.peta), sec: c('every second', A.peta) };
    sfx.push({ t: A.peta + .1, k: 'riser', g: -18 }, { t: Math.max(K.sec, K.bil + .8), k: 'stopwatch', g: -16 });
    add(A.peta, false, (ctx, T) => {
      ctx.fillStyle = '#040605'; ctx.fillRect(-W, -H, W * 3, H * 3);
      const hz = kf(T, [[A.peta, 900], [K.peta, 760], [K.calc + 1, 700]]);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 540, hz + 200, 900, NV_RGB, .35); ctx.restore();
      coreFloor(ctx, T, { horizon: hz, lit: .35 + .65 * p(T, K.peta, .8), wave: 1 + p(T, K.mil, .8) * 1.5, spread: kf(T, [[A.peta, 1.3], [K.calc + 1, 1]]) });
      const fade = ctx.createLinearGradient(0, hz - 60, 0, hz + 260); fade.addColorStop(0, 'rgba(4,6,5,1)'); fade.addColorStop(1, 'rgba(4,6,5,0)'); ctx.fillStyle = fade; ctx.fillRect(-W, hz - 600, W * 3, 860);
      // the AI bubble zooming over the cores
      const u = ((T - A.peta) * .45) % 1, P = [[-100, 1500], [300, 1100], [800, 1350], [1180, 1050]]; trail(ctx, P, Math.max(0, u - .3), u, .9); bubble(ctx, T, ...bz(u, ...P), .8);
      const pf = p(T, K.peta, .5, eback);
      if (pf > 0 && T < K.mil) pop(ctx, pf, 540, 620, () => { big(ctx, '1', 540, 660, 170, '#fff', NV_RGB); caps(ctx, 'PETAFLOP · FP4 AI COMPUTE', 540, 730, 22, `rgba(${LIME_RGB},1)`, 'center'); });
      if (T >= K.mil) {
        const n = T < K.bil ? '1,000,000' : '1,000,000,000,000,000', sz = T < K.bil ? 110 : 62;
        bin(ctx, p(T, K.mil, .35), () => { live(ctx, T, 540, 640, { yaw: .02, bob: 3, seed: 2 }, () => { big(ctx, n, 540, 660, sz, '#fff', NV_RGB); caps(ctx, 'CALCULATIONS', 540, 730, 22, `rgba(${LIME_RGB},1)`, 'center'); }); });
        const sw = p(T, K.sec, .5, eback); if (sw > 0) pop(ctx, sw, 540, 860, () => { // stopwatch: one second
          ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(470, 860, 42, 0, 7); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(462, 806, 16, 10);
          const an = -Math.PI / 2 + clamp((T - K.sec) / 1) * Math.PI * 2; ctx.strokeStyle = `rgb(${LIME_RGB})`; ctx.beginPath(); ctx.moveTo(470, 860); ctx.lineTo(470 + Math.cos(an) * 32, 860 + Math.sin(an) * 32); ctx.stroke(); ctx.restore();
          txt(ctx, 'every second', 535, 878, 40, '#fff', 800, 'left'); });
      }
    });
  }

  // 10 THE REAL TRICK IS MEMORY: gaming laptops split it between processor and graphics card
  { const K = { mem: c('memory', A.mem), gam: c('gaming', A.mem), split: c('split', A.mem), proc: c('processor', A.mem), gc: c('graphics card', A.mem) };
    sfx.push({ t: K.gam, k: 'shutter', g: -15 }, { t: Math.max(K.split, K.gam + 1.5), k: 'glitch', g: -17 });
    add(A.mem, false, (ctx, T) => {
      bgStage(ctx, T, { gy: 1100, rgb: TEAL_RGB });
      const k = p(T, A.mem, .7, eo5);
      flip(ctx, k, 540, 1120, () => live(ctx, T, 540, 1120, { yaw: .04, bob: 5, breathe: .003, seed: 3 }, () => memBoard(ctx, T, 540, 1120, 960, { pool: 0, cpuHi: p(T, K.proc, .4), gpuHi: p(T, K.gc, .4) })));
      bin(ctx, p(T, K.mem, .4), () => big(ctx, 'MEMORY', 540, 640, 96, '#fff', TEAL_RGB));
      const gl = p(T, K.gam, .5, eback); if (gl > 0) pop(ctx, gl, 540, 1560, () => pill(ctx, 540, 1560, 'GAMING LAPTOP', { bg: 'rgba(255,255,255,.95)', fg: '#111', size: 28, h: 62, w: 800, font: MONO }));
      // split bar under the board
      const sp = p(T, K.split, .6, eback), bx = 140, by = 1680, bw = 800;
      if (gl > 0) { ctx.save(); ctx.globalAlpha *= gl; const gap = 40 * sp;
        rr(ctx, bx, by, bw / 2 - gap, 40, 20); ctx.fillStyle = 'rgba(150,200,255,.85)'; ctx.fill(); rr(ctx, bx + bw / 2 + gap, by, bw / 2 - gap, 40, 20); ctx.fillStyle = `rgba(${TEAL_RGB},.85)`; ctx.fill();
        caps(ctx, 'CPU', bx + 20, by + 80, 20, 'rgba(150,200,255,1)'); caps(ctx, 'GPU', bx + bw - 20, by + 80, 20, `rgba(${TEAL_RGB},1)`, 'right');
        if (sp > 0) { txt(ctx, '✂', 540, by + 34, 40 * sp, '#fff', 700); } ctx.restore(); }
    });
  }

  // 11 HERE THEY SHARE up to 128 GB, so even big AI models fit on the laptop itself
  { const K = { share: c('share', A.share), n: c('128', A.share), big: c('big', A.share), mod: c('models', A.share), fit: c('fit', A.share), self: c('itself', A.share) };
    const merge = Math.min(K.share, K.n) - .2, drop = Math.min(K.big, K.mod), fitT = Math.max(K.fit, drop + .6);
    sfx.push({ t: merge, k: 'gear', g: -15 }, { t: fitT, k: 'success', g: -15 });
    add(A.share, false, (ctx, T) => {
      bgStage(ctx, T, { gy: 1100, rgb: TEAL_RGB });
      const pool = p(T, merge, .8, eio), fill = .2 + .8 * p(T, K.n, 1.0, eo);
      live(ctx, T, 540, 1120, { yaw: .04, bob: 5, breathe: .003, seed: 3 }, () => memBoard(ctx, T, 540, 1120, 960, { pool, fill, model: p(T, drop - .2, .4), modelY: p(T, drop, Math.max(.4, fitT - drop), eback), fits: p(T, fitT, .4) }));
      // counter 24 -> 128 GB
      const gb = Math.round(lerp(24, 128, eo(clamp((T - K.n + .1) / .9))));
      bin(ctx, p(T, A.share + .1, .4), () => { big(ctx, String(gb), 470, 670, 130, '#fff', TEAL_RGB); txt(ctx, 'GB', 640, 670, 60, `rgb(${TEAL_RGB})`, 900, 'left'); caps(ctx, 'SHARED MEMORY', 540, 735, 22, `rgba(${TEAL_RGB},1)`, 'center'); });
      check(ctx, 860, 1560, 40, p(T, fitT, .5));
      const fp = p(T, Math.max(K.self, fitT + .3), .5, eback); if (fp > 0) pop(ctx, fp, 520, 1700, () => pill(ctx, 520, 1700, 'Fits on the laptop itself', { bg: 'rgba(118,185,0,.95)', fg: '#0b0e08', size: 34, h: 74, w: 800 }));
    });
  }

  // 12 NVIDIA: "reinvents the Windows PC for the era of personal AI agents" + Jensen Huang keynote clip (plays inside a card)
  { const K = { re: c('reinvents', A.quote), era: c('era', A.quote), ag: c('agents', A.quote), jen: c('Jensen', A.quote), simple: c('pitch is simple', A.quote) };
    const qEnd = Math.max(K.re, K.era, K.ag) + .3;
    sfx.push({ t: K.jen, k: 'shutter', g: -15 });
    const Q = ['“Reinvents the Windows PC', 'for the era of', 'personal AI agents.”'];
    add(A.quote, false, (ctx, T) => {
      bgRoom(ctx, T, { desk: 1560, glow: .6 });
      // quote typed line by line
      const total = Q.join('').length, n = total * clamp((T - A.quote - .1) / Math.max(.6, qEnd - A.quote - .1));
      let left = n; Q.forEach((l, i) => { const s2 = l.slice(0, Math.max(0, Math.floor(left))); left -= l.length; ctx.save(); txt(ctx, s2, 540, 590 + i * 66, 54, i === 2 ? LIME : '#fff', 800, 'center', (w, px) => SERIF(w, px, 'italic')); ctx.restore(); });
      caps(ctx, '— NVIDIA', 540, 820, 22, 'rgba(255,255,255,.7)', 'center', p(T, qEnd - .3, .5));
      // keynote clip card
      const k = p(T, A.quote + .1, .7, eo5), t0 = A.quote, cw = 940, chh = 557, cx = 70, cy = 900;
      flip(ctx, k, 540, cy + chh / 2, () => live(ctx, T, 540, cy + chh / 2, { yaw: .04, bob: 5, breathe: .004, seed: 2 }, () => {
        photo(ctx, clipName(T - t0), cx, cy, cw, chh, { r: 30, zoom: lerp(1.0, 1.06, clamp((T - t0) / 8)) });
        // live badge + name tag
        pill(ctx, cx + 30, cy + 44, '● KEYNOTE', { bg: 'rgba(10,12,14,.75)', fg: '#ff5a50', size: 20, h: 40, align: 'left', font: MONO });
        const nt = p(T, K.jen, .5, eback); if (nt > 0) pop(ctx, nt, cx + 220, cy + chh - 50, () => pill(ctx, cx + 30, cy + chh - 50, 'Jensen Huang · NVIDIA CEO', { bg: 'rgba(118,185,0,.95)', fg: '#0b0e08', size: 26, h: 56, align: 'left' }));
      }));
      // personal AI agents chips under the card
      const ags = [['✉', 'Email agent'], ['▦', 'Data agent'], ['▤', 'Files agent']];
      ags.forEach(([ic, lb], i) => { const a = p(T, K.ag + i * .15, .5, eback); if (a <= 0) return; const x = 200 + i * 340, y = 1600 + 14 * Math.sin(T * 2 + i);
        pop(ctx, a, x, y, () => { card(ctx, x - 150, y - 50, 300, 100, { r: 50, fill: '#151a1f', dark: true, stroke: `rgba(${LIME_RGB},.35)` }); txt(ctx, ic, x - 100, y + 14, 38, LIME, 700); txt(ctx, lb, x - 64, y + 11, 28, '#fff', 700, 'left'); }); });
      const sp = p(T, K.simple, .5, eback); if (sp > 0) pop(ctx, sp, 540, 1760, () => pill(ctx, 540, 1760, 'The pitch is simple', { bg: 'rgba(255,255,255,.95)', fg: '#111', size: 30, h: 66 }));
    });
  }

  // 13 FOR 40 YEARS you launched apps. Now you just ask, and the PC does the work.
  { const K = { y40: c('40', A.years), launch: c('launched', A.years), now: c('now you just', A.years), ask: c('just ask', A.years), work: c('work', A.years) };
    const boom = Math.min(K.now, K.ask) - .05, done = Math.max(K.work, boom + 1.1);
    sfx.push({ t: K.y40, k: 'gear', g: -16 }, { t: boom, k: 'glitch', g: -15 }, { t: done + .2, k: 'success', g: -15 });
    const WINS = [[.05, .08, .5, .5, 'Excel', 'rows'], [.4, .12, .52, .48, 'Explorer', 'folders'], [.12, .42, .46, .42, 'Mail', 'mail'], [.5, .45, .44, .44, 'Word', 'doc'], [.28, .25, .44, .46, 'Browser', 'web'], [.6, .05, .36, .36, 'Calendar', 'cal']];
    add(A.years, false, (ctx, T) => {
      bgRoom(ctx, T, { desk: 1420 });
      const LX = 540, LY = 1440, LW = 900;
      live(ctx, T, LX, LY, { yaw: .015, bob: 3, breathe: .003, seed: 7 }, () => laptop(ctx, T, LX, LY, LW, { screen: (c2, x, y, w, h) => {
        const g = c2.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#0d4f8b'); g.addColorStop(1, '#0a2a52'); c2.fillStyle = g; c2.fillRect(x, y, w, h);
        c2.fillStyle = 'rgba(10,14,20,.85)'; c2.fillRect(x, y + h - 34, w, 34); c2.fillStyle = '#3a8ee6'; c2.fillRect(x + 10, y + h - 27, 22, 20);
        const shat = p(T, boom, .9, eo);
        WINS.forEach(([u, v, ww, hh, title, kind], i) => {
          const t0 = A.years + .15 + i * Math.max(.2, (K.launch + .3 - A.years) / WINS.length), a = p(T, t0, .3, eback);
          if (a <= 0) return;
          c2.save(); const ox = (hash(i, 3) - .5) * 900 * shat, oy = (hash(i, 4) - .3) * -700 * shat; c2.globalAlpha *= 1 - shat; c2.translate(x + (u + ww / 2) * w + ox, y + (v + hh / 2) * h + oy); c2.rotate((hash(i, 5) - .5) * 1.2 * shat); c2.scale(a, a);
          winApp(c2, -ww * w / 2, -hh * h / 2, ww * w, hh * h, title, appBody(kind === 'folders' ? 'folders' : kind), { active: i === WINS.length - 1 });
          c2.restore();
        });
        // shards
        if (shat > 0 && shat < 1) for (let i = 0; i < 40; i++) { c2.fillStyle = `rgba(255,255,255,${.7 * (1 - shat)})`; c2.fillRect(x + w * hash(i, 1) + (hash(i, 2) - .5) * 500 * shat, y + h * hash(i, 3) - 300 * shat * hash(i, 4), 10, 7); }
        // the new way: one ask bar, the AI agent does the work
        const ab = p(T, boom + .2, .5, eback);
        if (ab > 0) { c2.save(); c2.globalAlpha *= clamp(ab); const bw = w * .7, bx = x + (w - bw) / 2, by = y + h * .3;
          rr(c2, bx, by, bw, 64, 32); c2.fillStyle = '#10151b'; c2.fill(); c2.strokeStyle = `rgba(${LIME_RGB},.8)`; c2.lineWidth = 3; c2.stroke();
          txt(c2, typed('Sort my week and book the flights', T, boom + .3, done - .2) || 'Ask anything', bx + 30, by + 42, 26, '#fff', 600, 'left');
          ['Calendar sorted', 'Flights booked', 'Report drafted'].forEach((l, i) => { const ta = done - .45 + i * .22, k2 = p(T, ta, .4); if (k2 <= 0) return; c2.save(); c2.globalAlpha *= k2; rr(c2, bx, by + 96 + i * 62, bw, 50, 14); c2.fillStyle = 'rgba(255,255,255,.08)'; c2.fill(); txt(c2, l, bx + 64, by + 130 + i * 62, 24, '#e8f0e0', 600, 'left'); check(c2, bx + 32, by + 121 + i * 62, 15, p(T, ta + .1, .4), NV); c2.restore(); });
          // AI agent cursor
          const cx2 = kf(T, [[boom + .4, bx + bw * .9], [done - .4, bx + bw * .2], [done + .6, bx + bw * .75]]), cy2 = kf(T, [[boom + .4, by + 200], [done - .4, by + 130], [done + .6, by + 250]]);
          cursor(c2, cx2, cy2, 0, 1); pill(c2, cx2 + 40, cy2 + 56, 'AI AGENT', { bg: LIME, fg: '#0b0e08', size: 16, h: 30, align: 'left', font: MONO });
          c2.restore(); }
      } }));
      const yrs = Math.round(40 * eo(clamp((T - A.years) / Math.max(.4, K.y40 + .3 - A.years))));
      const ya = 1 - p(T, boom + .3, .4);
      if (ya > 0) bin(ctx, p(T, A.years, .4) * ya, () => { big(ctx, String(yrs), 540, 690, 150, '#fff', '90,150,255'); caps(ctx, 'YEARS OF LAUNCHING APPS', 540, 760, 22, 'rgba(150,190,255,1)', 'center'); });
      const nw = p(T, boom + .3, .5, eback); if (nw > 0) pop(ctx, nw, 540, 680, () => { big(ctx, 'Just ask.', 540, 720, 120, LIME, LIME_RGB); });
    });
  }

  // 14 THE CATCH: its chip speaks a different language (ARM) from almost every Windows PC before it (x86)
  { const K = { its: c('its chip', A.catch), lang: c('different language', A.catch), alm: c('almost every', A.catch), win: c('Windows', A.catch) };
    const row = Math.min(K.alm, K.win) - .1;
    sfx.push({ t: A.catch + .1, k: 'riser', g: -19 }, { t: K.lang, k: 'glitch', g: -15 });
    add(A.catch, false, (ctx, T) => {
      bgStage(ctx, T, { gy: 1250, rgb: RED_RGB, glow: .8 });
      const hc = p(T, A.catch + .05, .5, eback) * (1 - p(T, row - .2, .4));
      if (hc > 0) pop(ctx, hc, 540, 700, () => big(ctx, 'THE CATCH?', 540, 730, 120, '#fff', RED_RGB));
      // the x86 crowd: every Windows PC before it
      const ra = p(T, row, .7, eo5);
      for (let i = 0; i < 5; i++) { const a = p(T, row + i * .08, .5, eback); if (a <= 0) continue; const x = 150 + i * 195, y = 720 + 8 * Math.sin(T * 2 + i);
        pop(ctx, a, x, y, () => { card(ctx, x - 80, y - 80, 160, 160, { r: 18, fill: '#e8e6e0', dark: true }); rr(ctx, x - 52, y - 52, 104, 104, 10); ctx.fillStyle = '#2a2d33'; ctx.fill(); txt(ctx, 'x86', x, y + 14, 38, '#f2f2f2', 800, 'center', MONO); }); }
      callout(ctx, 'WINDOWS PCs · x86', 300, 900, 540, 810, p(T, Math.max(K.win, row + .3), .5), { col: RED_RGB });
      // our chip: ARM
      const ca = p(T, A.catch, .6, eo5);
      live(ctx, T, 540, 1340, { yaw: .1, bob: 7, breathe: .006, seed: 2 }, () => { ctx.save(); ctx.globalAlpha *= ca; chip(ctx, T, 540, 1340, 300, { tilt: .25, gpu: 1 }); ctx.restore(); });
      callout(ctx, 'RTX SPARK · ARM', 640, 1700, 600, 1470, p(T, K.its, .5));
      // two languages: speech bubbles + "≠"
      const la = p(T, K.lang, .5, eback);
      if (la > 0) {
        pop(ctx, la, 300, 1040, () => { card(ctx, 110, 990, 380, 100, { r: 24, fill: '#fff' }); txt(ctx, 'MOV EAX, 5', 300, 1054, 36, '#1d2a6a', 800, 'center', MONO); });
        pop(ctx, la, 790, 1150, () => { card(ctx, 600, 1100, 380, 100, { r: 24, fill: LIME }); txt(ctx, 'MOV W0, #5', 790, 1164, 36, '#18200a', 800, 'center', MONO); });
        pop(ctx, p(T, K.lang + .2, .5, eback), 545, 1110, () => big(ctx, '≠', 545, 1140, 110, `rgb(${RED_RGB})`, RED_RGB));
      }
    });
  }

  // 15 OLDER APPS only run through Microsoft's live translator, Prism (x86 code -> glass prism -> ARM code)
  { const K = { ms: c("Microsoft's", A.prism), tr: c('translator', A.prism), pr: c('Prism', A.prism) };
    const flow = Math.min(K.tr, K.ms + .4);
    sfx.push({ t: flow, k: 'sweep', g: -16 }, { t: Math.max(K.pr, flow + 1.5), k: 'shimmer', g: -15 });
    const X86 = ['MOV EAX, 5', 'ADD EAX, EBX', 'CMP EAX, 9'], ARM = ['MOV W0, #5', 'ADD W0, W0, W1', 'CMP W0, #9'];
    add(A.prism, false, (ctx, T) => {
      bgStage(ctx, T, { gy: 1080, rgb: '120,200,255', glow: .7 });
      const wa = p(T, A.prism, .6, eo5);
      flip(ctx, wa, 540, 710, () => live(ctx, T, 540, 710, { yaw: .04, bob: 4, seed: 1 }, () => winApp(ctx, 150, 560, 780, 300, 'old_app.exe  (x86)', asmBody(X86, { size: 34, hl: Math.floor((T * 1.2) % 3) }))));
      const pa = p(T, K.ms - .1, .6, eback);
      // packets of code falling through the prism
      if (T > flow) for (let i = 0; i < 4; i++) { const u = ((T - flow) * .55 + i / 4) % 1, y = lerp(880, 1300, u), arm = y > 1080;
        ctx.save(); ctx.globalAlpha *= Math.sin(u * Math.PI); const s2 = arm ? ARM[i % 3] : X86[i % 3]; pill(ctx, 540 + (arm ? 120 * (u - .5) : 0) * (i % 2 ? 1 : -1), y, s2, { bg: arm ? `rgba(${TEAL_RGB},.92)` : 'rgba(235,238,245,.92)', fg: '#0c1014', size: 22, h: 44, font: MONO }); ctx.restore(); }
      if (pa > 0) pop(ctx, pa, 540, 1080, () => { ctx.save(); ctx.translate(540, 1080); ctx.rotate(Math.PI / 2); prism(ctx, T, 0, 0, 260, { beam: p(T, flow + .3, .6) }); ctx.restore(); });
      callout(ctx, 'MICROSOFT PRISM', 650, 1010, 640, 1080, p(T, Math.max(K.pr, flow + .5), .5), { col: TEAL_RGB });
      caps(ctx, 'LIVE TRANSLATOR · x86 → ARM', 700, 1050, 18, 'rgba(255,255,255,.75)', 'left', p(T, K.tr, .5));
      const na = p(T, flow + .7, .6, eo5);
      flip(ctx, na, 540, 1450, () => live(ctx, T, 540, 1450, { yaw: .04, bob: 4, seed: 3 }, () => winApp(ctx, 150, 1300, 780, 300, 'old_app.exe  (running on ARM)', asmBody(ARM, { size: 34, col: '#0b5a3f', n: (T - flow - .7) * 60, hl: 0, hlCol: `rgba(${TEAL_RGB},.25)` }))));
      check(ctx, 900, 1310, 34, p(T, Math.max(K.pr, flow + 1.5) + .1, .5), NV);
    });
  }

  // 16 LAPTOPS from ASUS, Dell, HP, Lenovo, Microsoft and MSI are arriving now
  { const names = ['ASUS', 'Dell', 'HP', 'Lenovo', 'Microsoft', 'MSI'];
    const K = names.map((n, i) => c(n, A.oems)); const K_arr = c('arriving', A.oems);
    sfx.push({ t: K_arr, k: 'swoosh', g: -16 });
    const POS = [[300, 840, 280], [790, 840, 280], [290, 1190, 320], [790, 1190, 320], [285, 1580, 380], [795, 1580, 380]];
    add(A.oems, false, (ctx, T) => {
      bgStage(ctx, T, { gy: 1250, rgb: '200,210,220', glow: .6, floor: 900 });
      names.forEach((n, i) => {
        const [x, y, w] = POS[i], t0 = i === 0 ? Math.min(K[0], A.oems + .3) : K[i], a = p(T, t0 - .1, .6, eo5);
        if (a <= 0) return;
        ctx.save(); ctx.translate(0, (1 - a) * 120); ctx.globalAlpha *= clamp(a * 1.4);
        live(ctx, T, x, y, { yaw: .03, bob: 4, breathe: .003, seed: i }, () => laptop(ctx, T, x, y, w, { lid: i % 2 ? '#22252b' : '#2b2f36', deck: i % 3 === 1 ? ['#3a3e45', '#24272c'] : ['#d7dbe1', '#a9afb8'],
          screen: (c2, sx, sy, sw, sh) => chatUI(c2, T + i, sx, sy, sw, sh, { greet: 1, inputA: 1 }) }));
        ctx.restore();
        const la = p(T, t0, .45);
        if (la > 0) { const lw = tw(ctx, n.toUpperCase(), 26, 700, MONO) + n.length * 4 + 40, ly = y - w * .63 - 46;
          pop(ctx, eback(la), x, ly, () => { rr(ctx, x - lw / 2, ly - 26, lw, 52, 26); ctx.fillStyle = 'rgba(10,12,14,.82)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.stroke(); caps(ctx, n.toUpperCase(), x, ly + 10, 26, '#fff', 'center'); }); }
      });
      const ar = p(T, K_arr, .5, eback); if (ar > 0) pop(ctx, ar, 540, 600, () => pill(ctx, 540, 600, 'Arriving now', { bg: 'rgba(118,185,0,.95)', fg: '#0b0e08', size: 36, h: 78 }));
    });
  }

  // 17 THE NEXT AI you talk to might live right inside your laptop
  { const K = { talk: c('talk', A.next), live: c('live', A.next), ins: c('inside', A.next), lap: c('laptop', A.next) };
    const xr = Math.min(K.live, K.ins) - .15, dive = Math.max(K.ins - .1, xr + .35), lab = Math.max(K.lap, dive + .5);
    sfx.push({ t: K.talk, k: 'shimmer', g: -18 }, { t: dive + .6, k: 'success', g: -15 });
    add(A.next, false, (ctx, T) => {
      bgRoom(ctx, T, { desk: 1260 });
      const LX = 540, LY = 1240, LW = 840, z = kf(T, [[A.next, 1.06], [dive, 1.0], [lab + 1, 1.08]]);
      ctx.save(); focus(ctx, z, 540, 1180, 540, 1180);
      let r; live(ctx, T, LX, LY, { yaw: .02, bob: 3, breathe: .003, seed: 8 }, () => { r = laptop(ctx, T, LX, LY, LW, { xray: p(T, xr, .6), chipGlow: p(T, dive + .55, .4) * (.75 + .25 * Math.sin(T * 6)),
        screen: (c2, x, y, w, h) => chatUI(c2, T, x, y, w, h, { msgs: [{ me: true, lines: 1, a: p(T, A.next + .1, .4), w: .5 }, { me: false, lines: 4, a: p(T, K.talk, .4), w: .85 }] }) }); });
      const ch = r ? r.chipAt : [540, 1350], u = p(T, dive, .65, eio), P = [[560, 860], [760, 900], [760, ch[1] - 200], ch];
      if (u < 1) { const q = u > 0 ? bz(u, ...P) : [560, 860 + 8 * Math.sin(T * 3)]; if (u > 0) trail(ctx, P, Math.max(0, u - .4), u); bubble(ctx, T, q[0], q[1], lerp(1.1, .6, u), { a: p(T, K.talk, .4) }); }
      pulseRing(ctx, ch[0], ch[1], (T - dive - .6) / .9, NV_RGB, 30, 280, .4);
      ctx.restore();
      callout(ctx, 'YOUR LAPTOP', 640, 1740, 540 + (ch[0] - 540) * z + 60, 1180 + (ch[1] - 1180) * z + 40, p(T, lab, .5));
      callout(ctx, 'THE NEXT AI', 110, 640, 540 + (560 - 540) * z - 60, 1180 + (860 - 1180) * z - 40, p(T, K.talk + .1, .5) * (1 - p(T, dive, .3)));
    });
  }

  // 18 ENDING: the RTX Spark chip compiles this video (real frame counter), "guide" is posted into the chip, then the bio card
  { const K = { crazy: c('crazy', A.end), code: c('code', A.end), learn: c('learn', A.end), comment: c('comment', A.end), guide: c('guide', A.end), yt: c('YouTube', A.end), link: c('link', A.end), bio: c('bio', A.end) };
    const cta = Math.min(K.link, K.bio), post = K.guide + .45, total = Math.round(DURATION * 30), sw = Math.min(K.comment - .2, K.guide - .5);
    sfx.push({ t: A.end + .05, k: 'riser', g: -17 }, { t: K.code + .1, k: 'success', g: -13 }, { t: post, k: 'click', g: -11 }, { t: K.yt, k: 'swoosh', g: -16 }, { t: cta + .3, k: 'click', g: -10 });
    const LINES = [['$ spark render explainer.js --fps 30', '#e8f0e0'], ['› 18 scenes · canvas + code only', '#9fb3c8'], ['› CUDA cores: 6,144 online', '#9fb3c8'], ['› frames', LIME], ['✓ build ok · 0 stock footage', '#7fe07f']];
    add(A.end, false, (ctx, T) => {
      bgStage(ctx, T, { gy: 1350, glow: 1 });
      const prog = clamp((T - A.end - .15) / Math.max(.6, K.code - A.end - .1)), bioK = p(T, K.yt - .2, .7, eo5);
      // the chip (bottom) shimmering as it renders
      const flash = clamp(1 - Math.abs(T - post - .5) / .35);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 540, 1430, 520, NV_RGB, .35 + .4 * flash); ctx.restore();
      let pos; live(ctx, T, 540, 1430, { yaw: .08, bob: 6, breathe: .006, seed: 5 }, () => { pos = chip(ctx, T, 540, 1430, 380, { tilt: .3, gpu: .15 + .85 * prog, coreFill: i => clamp(prog * 20 - i) }); });
      pulseRing(ctx, 540, 1430, (T - post - .5) / .9, LIME_RGB, 40, 320, .5);
      // data trail from chip up to the card
      const tp = [[540, 1260], [420, 1150], [660, 1050], [540, 960]]; trail(ctx, tp, 0, 1, .35 + .25 * Math.sin(T * 4));
      // terminal (compile) -> comment box -> bio card, all in the same card slot
      const cardY = 540, cardH = 400, termA = 1 - p(T, sw, .4), comA = p(T, sw, .4) * (1 - bioK);
      const ta = p(T, A.end, .6, eo5);
      if (termA > 0 && ta > 0) flip(ctx, ta, 540, cardY + cardH / 2, () => live(ctx, T, 540, cardY + cardH / 2, { yaw: .03, bob: 4, seed: 1 }, () => { ctx.save(); ctx.globalAlpha *= termA;
        card(ctx, 70, cardY, 940, cardH, { r: 28, fill: '#0d1013', dark: true, stroke: `rgba(${LIME_RGB},.3)` });
        ['#ff5f57', '#febc2e', '#28c840'].forEach((cc, i) => { ctx.fillStyle = cc; ctx.beginPath(); ctx.arc(110 + i * 28, cardY + 34, 9, 0, 7); ctx.fill(); });
        caps(ctx, 'RTX SPARK · TERMINAL', 540, cardY + 42, 18, 'rgba(255,255,255,.55)', 'center');
        const chars = LINES.reduce((a, l) => a + l[0].length, 0); let left = chars * prog;
        LINES.forEach(([l, col], i) => { let s2 = l.slice(0, Math.max(0, Math.floor(left))); left -= l.length; if (!s2) return;
          if (i === 3) s2 = `› frame ${String(Math.min(total, Math.floor(T * 30))).padStart(4, '0')} / ${total}`;
          txt(ctx, s2, 110, cardY + 108 + i * 56, 28, col, 600, 'left', MONO); });
        // progress bar
        rr(ctx, 110, cardY + cardH - 40, 860, 14, 7); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fill(); if (prog > 0) { rr(ctx, 110, cardY + cardH - 40, 860 * prog, 14, 7); ctx.fillStyle = NV; ctx.fill(); }
        ctx.restore(); }));
      stamp(ctx, p(T, K.code, .45) * (1 - p(T, sw - .1, .3)), 540, 1060, 'MADE WITH CODE', NV_RGB, -.05, 60);
      // comment box: "guide" typed and posted into the chip
      if (comA > 0) live(ctx, T, 540, cardY + 200, { yaw: .03, bob: 4, seed: 2 }, () => { ctx.save(); ctx.globalAlpha *= comA;
        card(ctx, 70, cardY + 60, 940, 300, { r: 28, fill: '#11151a', dark: true, stroke: 'rgba(255,255,255,.12)' });
        caps(ctx, 'COMMENTS', 120, cardY + 120, 20, 'rgba(255,255,255,.6)');
        rr(ctx, 110, cardY + 160, 860, 90, 45); ctx.fillStyle = '#1b2128'; ctx.fill(); ctx.strokeStyle = `rgba(${LIME_RGB},.5)`; ctx.lineWidth = 2; ctx.stroke();
        const g2 = typed('guide', T, K.guide - .15, K.guide + .2), posted = T > post;
        txt(ctx, posted ? 'Add a comment…' : (g2 || 'Add a comment…'), 160, cardY + 218, 36, g2 && !posted ? '#fff' : '#7a8290', g2 && !posted ? 800 : 500, 'left');
        if (!posted && g2 && Math.sin(T * 9) > 0) { ctx.fillStyle = '#fff'; ctx.fillRect(166 + tw(ctx, g2, 36, 800), cardY + 184, 3, 44); }
        ctx.fillStyle = LIME; ctx.beginPath(); ctx.arc(920, cardY + 205, 30, 0, 7); ctx.fill(); txt(ctx, '↑', 920, cardY + 220, 38, '#0b0e08', 900);
        txt(ctx, posted ? 'Posted ✓' : '', 540, cardY + 310, 28, `rgb(${LIME_RGB})`, 800);
        ctx.restore(); });
      // posted "guide" bubble flies into the chip
      const fu = p(T, post, .55, eio);
      if (fu > 0 && fu < 1) { const P = [[920, cardY + 205], [1000, 900], [700, 1200], [540, 1400]]; trail(ctx, P, Math.max(0, fu - .35), fu); const q = bz(fu, ...P);
        bubble(ctx, T, q[0], q[1], lerp(1, .6, fu)); txt(ctx, 'guide', q[0], q[1] + 8, 26 * lerp(1, .6, fu), '#1b2408', 900); }
      if (T > K.guide - .5 && T < post + .4) { const bx = 920, by = cardY + 205; cursor(ctx, kf(T, [[K.guide - .5, bx + 120], [post - .05, bx]]), kf(T, [[K.guide - .5, by + 160], [post - .05, by]]), clamp(1 - Math.abs(T - post) / .1), clamp((post + .4 - T) / .3)); clickRing(ctx, bx, by, (T - post) / .5, LIME_RGB); }
      // bio card
      if (bioK > 0) flip(ctx, bioK, 540, cardY + cardH / 2, () => live(ctx, T, 540, cardY + cardH / 2, { yaw: .03, bob: 4, breathe: .003, seed: 3 }, () => {
        card(ctx, 70, cardY, 940, cardH + 40, { r: 34, fill: '#12161b', dark: true, stroke: `rgba(${LIME_RGB},.35)` });
        avatar(ctx, T, 200, cardY + 120, 66, true);
        if (named) { txt(ctx, 'agentsoly', 300, cardY + 115, 50, '#fff', 800, 'left'); txt(ctx, 'Explainers built 100% in code', 300, cardY + 160, 28, '#9aa3ad', 500, 'left'); }
        else txt(ctx, 'Explainers built 100% in code', 300, cardY + 135, 32, '#c9d0d8', 600, 'left');
        pill(ctx, 110, cardY + 262, '▶ YouTube', { bg: '#e62117', size: 30, h: 64, align: 'left' }); pill(ctx, 340, cardY + 262, '♪ TikTok', { bg: '#0b0b0f', size: 30, h: 64, align: 'left', stroke: 'rgba(255,255,255,.35)' });
        const hl = p(T, cta + .3, .35);
        rr(ctx, 110, cardY + 320, 860, 84, 22); ctx.fillStyle = `rgba(118,185,0,${.18 + .5 * hl})`; ctx.fill(); ctx.strokeStyle = `rgba(${LIME_RGB},${.4 + .6 * hl})`; ctx.lineWidth = 3; ctx.stroke();
        txt(ctx, '🔗  Link in bio · full guide', 540, cardY + 374, 36, '#fff', 800);
      }));
      if (T > cta - .5) { const lx = 540, ly = cardY + 362; cursor(ctx, kf(T, [[cta - .5, 900], [cta + .25, lx + 130]]), kf(T, [[cta - .5, 1150], [cta + .25, ly]]), clamp(1 - Math.abs(T - cta - .3) / .1)); clickRing(ctx, lx + 130, ly, (T - cta - .3) / .5, LIME_RGB); }
    });
  }

  list.forEach((sc, i) => sc.end = list[i + 1] ? list[i + 1].start : 1e9);
  // sound rule: whooshes/sweeps/risers on cuts and reveals; any other small UI hit is a single sound >= 1.5 s after the previous one
  const BIG = new Set(['whoosh', 'swoosh', 'sweep', 'riser']), out = []; let last = -9;
  sfx.sort((a, b) => a.t - b.t).forEach(e => { if (BIG.has(e.k)) { out.push(e); return; } if (e.t - last >= 1.5) { out.push(e); last = e.t; } });
  return { scenes: list, sfx: out };
}
