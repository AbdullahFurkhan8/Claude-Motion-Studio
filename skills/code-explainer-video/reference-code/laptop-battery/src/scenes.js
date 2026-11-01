// Laptop-battery explainer scenes. Every time comes from word cues c('phrase', after).
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, win, hash, GOLD, rr, label, note, ring, alive, flipIn } from './lib.js';
import * as A from './art.js';
const { FONT } = A;
const kf = (T, keys, e = eio) => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (T < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e((T - t0) / (t1 - t0)); return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u); }
  return keys[keys.length - 1][1];
};
const push = (ctx, s, cx = 540, cy = 900) => { ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); };
const tag = (ctx, txt, x, y, a, light) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = FONT(700, 24); ctx.textAlign = 'center'; ctx.fillStyle = light ? '#1c1d20' : '#fff'; ctx.fillText(txt, x, y); ctx.restore(); };

export const KEYWORDS = 'stop charger destroying nope outdated wears works lithium anode cathode electrons detour laptop current trip zero plug messier side grab lock lithium fewer smaller crust slows hotter happen sun hot duvet covered fast extremes crammed speeds happiest 100 wrecking not plugged 80 stops cable mac optimised limit pc app off on stress send friend unplugged follow code edit guide comment bio';
export const CAPTION_SFX = false; // no sound on caption keywords
export const EMOJI = { hotter: '🔥', sun: '☀️', duvet: '🛏', zero: '🪫', plug: '🔌', friend: '👋', code: '💻', bio: '🔗', comment: '💬' };

// Hinglish voice: same scenes, cues mapped to the words it says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      destroying: 'kharab', nope: 'nahi bilkul', 'to know': 'ye samajhne', wears: 'ye samajhne > kharab', see: 'samajhna', works: 'kaam kaise', inside: 'battery ke andar',
      middle: 'beech', detour: 'isliye wo', 'that detour': 'yahi detour',
      'once nearly': 'jab lagbhag', trip: 'safar', plug: 'charger lagao', back: 'wapas', 'in practice': 'lekin reality',
      messier: 'complicated', grab: 'pakad', 'less lithium': 'matlab', fewer: 'ions kam', smaller: 'capacity', 'on top of that': 'iske alawa',
      build: 'bana', crust: 'layer', grows: 'moti', slows: 'slow', 'and the hotter': 'aur jitni',
      gets: 'heat', happen: 'reactions hoti', 'a laptop': 'laptop ko dhoop', sun: 'dhoop', covered: 'block', age: 'purana', fast: 'reasons', 'the second': 'doosri cheez',
      extremes: 'extreme', either: 'dono', crammed: 'jama', damage: 'dono > damage', somewhere: 'lagbhag 20', happiest: 'comfortable', 'so if': 'to agar laptop',
      wrecking: 'kharab kar raha', 'not on most': 'most recent', 'once yours': 'jab tumhara laptop',
      plugged: 'connected', 'stops around': 'around', itself: 'rok deta', 'after that': 'uske baad', runs: 'seedha', cable: 'power', 'on a mac': 'mac par',
      already: 'enabled', 'set the': 'ya tum', 'on a pc': 'pc par', ship: 'kyunki kuch', switch: 'ise on', 'keep it': 'laga rehne', stress: 'tension', 'send this': 'ye us dost',
      friend: 'dost', unplugged: 'har baar', 'every time': 'unplug', 'follow for': 'aisi aur',
      'the complete': 'jo complete', 'if you want': 'agar tumhe', watching: 'tiktok',
    },
    keywords: 'laptop charger kharab nahi outdated lithium ions anode cathode electrons beech detour current zero lagao wapas complicated reactions pakad lock kam capacity layer moti slow heat dhoop car duvet block purana extreme 0% 100% jama damage 20 80% comfortable recent connected rok power mac optimised limit pc off on tension dost unplug follow code edit guide comment bio',
    emoji: { heat: '🔥', dhoop: '☀️', duvet: '🛏', zero: '🪫', lagao: '🔌', dost: '👋', code: '💻', bio: '🔗', comment: '💬' },
  },
};

export function makeScenes(c, lang = 'en') {
  const named = lang !== 'hi'; // Hindi version: profile picture only, no channel name
  const list = [], sfx = [], track = [];
  const add = (start, light, draw) => { list.push({ start, light, draw }); if (start > 0) sfx.push({ t: start - .12, k: 'whoosh', g: -17 }); };
  const pose = (t, name, item) => track.push([t, name, item]);
  // channel avatar: gradient disc with the channel initial (or a plain person icon when unnamed) and a spinning ring
  const avatarFace = (ctx, x, y, r) => { const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, '#1fa58f'); g.addColorStop(1, '#f2a25c'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; if (named) { ctx.font = FONT(900, r * .92); ctx.textAlign = 'center'; ctx.fillText('a', x, y + r * .32); } else { ctx.beginPath(); ctx.arc(x, y - r * .28, r * .34, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y + r * .58, r * .6, r * .42, 0, Math.PI, 0); ctx.fill(); } };
  const avatarRing = (ctx, T, x, y, r) => { ctx.save(); ctx.translate(x, y); ctx.rotate(T * 1.6); const g = ctx.createConicGradient(0, 0, 0); g.addColorStop(0, '#f2a25c'); g.addColorStop(.5, '#1fa58f'); g.addColorStop(1, '#f2a25c'); ctx.strokeStyle = g; ctx.lineWidth = r * .07; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke(); ctx.restore(); };
  const s = x => x - .1;

  // 1 HOOK: plug snaps in, then the battery shatters
  { const K = { s0: 0, laptop: c('laptop'), charger: c('charger'), destroy: c('destroying'), end: c('nope') };
    sfx.push({ t: K.charger, k: 'click', g: -10 }, { t: K.destroy, k: 'glitch', g: -12 }, { t: K.destroy + .05, k: 'shatter', g: -12 });
    pose(0, 'point'); pose(K.destroy, 'panic');
    add(0, false, (ctx, T) => {
      A.bgDark(ctx, false);
      const g = ctx.createRadialGradient(540, 900, 50, 540, 900, 700); g.addColorStop(0, 'rgba(120,90,50,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (T < K.destroy - .05) {
        ctx.save(); push(ctx, kf(T, [[0, 1.5], [K.charger, 1.15], [K.destroy, 1.05]]), 600, 950);
        A.laptopEdge(ctx, 620, 950, 700);
        const px = kf(T, [[0, 380], [K.laptop, 470], [K.charger, 618]], eo5);
        A.plug(ctx, px, 950, 1, p(T, K.charger, .3));
        ctx.restore();
        for (let i = 0; i < 30; i++) { ctx.fillStyle = `rgba(255,200,120,${.15 * hash(i, 3)})`; ctx.beginPath(); ctx.arc(hash(i) * W, (hash(i, 1) * H - T * 20) % H, 2 + 3 * hash(i, 2), 0, 7); ctx.fill(); }
      } else {
        ctx.save(); push(ctx, lerp(1.25, 1, eo5((T - K.destroy) / .7)));
        A.shatter(ctx, 540, 920, 760, 520, clamp((T - K.destroy) / 1.4), T);
        ctx.restore();
      }
    });
  }
  // 2 NOPE: myth busted on light background
  { const s0 = s(c('nope')), K = { outd: c('outdated'), end: c('to know') };
    sfx.push({ t: s0 + .1, k: 'pop', g: -12 }, { t: K.outd, k: 'tick', g: -12 });
    pose(s0, 'stop');
    add(s0, true, (ctx, T) => {
      A.bgLight(ctx);
      ctx.save(); push(ctx, lerp(1.08, 1, eo5((T - s0) / .6)));
      const bob = Math.sin(T * 2) * 10, rot = -.25 + Math.sin(T * .8) * .03;
      A.shadow(ctx, 540, 1250, 380, .25);
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(160, 1000 + bob); ctx.bezierCurveTo(60, 1100, 120, 1300, 0, 1350); ctx.stroke();
      A.laptopLid(ctx, 540, 920 + bob, 640, rot);
      ctx.fillStyle = '#4caf50'; ctx.beginPath(); ctx.arc(200, 990 + bob, 8, 0, 7); ctx.fill();
      if (T > K.outd) { const a = p(T, K.outd, .3, eback); ctx.save(); ctx.translate(540, 900); ctx.rotate(-.18); ctx.scale(a, a); ctx.strokeStyle = '#e53935'; ctx.lineWidth = 10; rr(ctx, -260, -70, 520, 140, 18); ctx.stroke(); ctx.fillStyle = '#e53935'; ctx.font = FONT(900, 80); ctx.textAlign = 'center'; ctx.fillText('OUTDATED', 0, 28); ctx.restore(); }
      ctx.restore();
    });
  }
  // 3 KNOW: unscrew bottom panel, zoom into a cell
  { const s0 = s(c('to know')), K = { wears: c('wears'), see: c('see', s0), works: c('works'), end: c('inside') };
    sfx.push({ t: K.wears + .1, k: 'gear', g: -16 });
    sfx.push({ t: K.see, k: 'swoosh', g: -16 }, { t: K.works, k: 'riser', g: -20 });
    pose(s0, 'think'); pose(K.wears, 'point'); pose(K.works, 'wow');
    add(s0, true, (ctx, T) => {
      A.bgLight(ctx);
      const z = kf(T, [[s0, 1], [K.see, 1.05], [K.works + .3, 3.2]], eio);
      ctx.save(); push(ctx, z, 540 - (z - 1) * 60, 960);
      A.laptopBottom(ctx, 540, 920, 700, T, p(T, K.wears, 1.2, x => x), p(T, K.see - .4, .6));
      ctx.restore();
      if (T > K.works - .1) { ctx.fillStyle = `rgba(12,13,16,${p(T, K.works - .1, .4)})`; ctx.fillRect(0, 0, W, H); }
    });
  }
  // 4 INSIDE: ions travel anode -> cathode, electrons take the detour
  { const s0 = s(c('inside')), K = { lith: c('lithium'), travel: c('travel'), anode: c('anode'), cath: c('cathode'), elec: c('electrons'), middle: c('middle'), detour: c('detour'), laptop: c('laptop', c('detour')), end: c('that detour') };
    sfx.push({ t: K.lith, k: 'shimmer', g: -16 }, { t: K.travel, k: 'sweep', g: -20 }, { t: K.anode, k: 'pop', g: -18 }, { t: K.cath, k: 'pop', g: -18 }, { t: K.elec, k: 'data', g: -18 }, { t: K.middle, k: 'tick', g: -14 }, { t: K.detour, k: 'swoosh', g: -16 });
    pose(s0, 'idle'); pose(K.lith, 'point'); pose(K.cath, 'peace'); pose(K.elec, 'wow'); pose(K.middle, 'cross'); pose(K.detour, 'point');
    add(s0, false, (ctx, T) => {
      A.bgDark(ctx);
      ctx.save(); push(ctx, kf(T, [[s0, 1.3], [K.lith, 1.12], [K.detour - .3, 1.12], [K.detour + .4, .92]]), 540, kf(T, [[s0, 950], [K.detour - .3, 950], [K.detour + .4, 860]]));
      const q = kf(T, [[K.travel, 0], [K.cath + .8, 1]]);
      const g = A.cell(ctx, T, { x: 70, y: 660, w: 940, h: 640, q, ions: p(T, K.lith, .5), e: p(T, K.elec, .4) });
      if (T > K.lith) label(ctx, 'LITHIUM ION', 300, 600, win(T, K.lith, K.elec), 300, 700, 22);
      if (T > K.middle && T < K.detour + .3) { const a = win(T, K.middle, K.detour + .3, .2); ctx.strokeStyle = `rgba(229,57,53,${a})`; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(g.xS - 30, 900); ctx.lineTo(g.xC + 30, 1060); ctx.moveTo(g.xC + 30, 900); ctx.lineTo(g.xS - 30, 1060); ctx.stroke(); }
      if (T > K.detour - .2) {
        const a = p(T, K.detour - .2, .5), top = 460;
        ctx.globalAlpha = a; A.laptopOpen(ctx, 540, top, 300, (x, w, h) => A.wallpaper(x, w, h, T, 76)); ctx.globalAlpha = 1;
        const L = [[g.xCu + 23, 630], [g.xCu + 23, 440], [380, 440]], R = [[700, 440], [g.xAl + 23, 440], [g.xAl + 23, 630]];
        ctx.globalAlpha = a; A.wire(ctx, L, '#d0884a', 10); A.wire(ctx, R, '#b8bec6', 10); ctx.globalAlpha = 1;
        A.flow(ctx, T, [[g.xCu + 23, 1250], ...L], a, .45, 22); A.flow(ctx, T, [...R, [g.xAl + 23, 1250]], a, .45, 22);
      }
      ctx.restore();
    });
  }
  // 5 CURRENT: battery box drains through laptop, then recharges
  { const s0 = s(c('that detour')), K = { cur: c('current'), once: c('once nearly'), trip: c('trip'), zero: c('zero'), plug: c('plug'), back: c('back'), end: c('in practice') };
    sfx.push({ t: K.cur, k: 'data', g: -16 }, { t: K.zero, k: 'tick', g: -10 }, { t: K.plug + .35, k: 'click', g: -10 }, { t: K.back, k: 'riser', g: -18 });
    pose(s0, 'point'); pose(K.once, 'shrug'); pose(K.zero, 'wow'); pose(K.plug, 'hold', 'plug'); pose(K.back + .5, 'thumbs');
    add(s0, true, (ctx, T) => {
      A.bgLight(ctx);
      ctx.save(); push(ctx, lerp(1.02, 1.08, (T - s0) / (K.end - s0)));
      const used = kf(T, [[K.once, 0], [K.zero, 1], [K.plug + .4, 1], [K.back + .6, 0]]), dead = T > K.zero && T < K.plug + .4;
      const pct = (1 - used) * 100; alive(ctx, T, 540, 900, { yaw: .1, bob: 8 });
      A.laptopOpen(ctx, 540, 600, 440, (x, w, h) => { if (dead) { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e53935'; x.lineWidth = 6; rr(x, w / 2 - 60, h / 2 - 28, 110, 56, 10); x.stroke(); x.fillStyle = '#e53935'; x.fillRect(w / 2 - 50, h / 2 - 18, 14, 36); x.fillRect(w / 2 + 52, h / 2 - 12, 8, 24); } else A.wallpaper(x, w, h, T, pct); });
      A.wire(ctx, [[300, 760], [240, 760], [240, 900]], '#d0884a', 12); A.wire(ctx, [[780, 760], [840, 760], [840, 900]], '#b8bec6', 12);
      A.batteryBox(ctx, T, 190, 920, 700, 330, { used, empty: dead ? .6 : 0 });
      if (!dead) { A.flow(ctx, T, [[240, 900], [240, 760], [300, 760]], T < K.zero ? 1 : .6, .6, 8); A.flow(ctx, T, [[780, 760], [840, 760], [840, 900]], T < K.zero ? 1 : .6, .6, 8); }
      if (T > K.plug) A.plug(ctx, kf(T, [[K.plug, -100], [K.plug + .35, 240]], eo5), 620, .45, p(T, K.plug + .35, .2));
      tag(ctx, 'electric current', 540, 820, win(T, K.cur, K.once), true);
      ctx.restore();
    });
  }
  // 6 PRACTICE: side reactions grab and lock lithium; fewer ions, smaller battery
  { const s0 = s(c('in practice')), K = { mess: c('messier'), side: c('side reactions'), grab: c('grab'), lock: c('lock'), less: c('less lithium'), fewer: c('fewer'), smaller: c('smaller'), end: c('on top of that') };
    sfx.push({ t: K.side, k: 'glitch', g: -18 }, { t: K.grab, k: 'pop', g: -14 }, { t: K.lock, k: 'shutter', g: -12 }, { t: K.fewer, k: 'tick', g: -14 }, { t: K.smaller, k: 'data', g: -16 });
    pose(s0, 'think'); pose(K.side, 'point'); pose(K.grab, 'cross'); pose(K.less, 'think'); pose(K.smaller, 'shrug');
    add(s0, false, (ctx, T) => {
      A.bgDark(ctx, false);
      if (T < K.less - .1) {
        ctx.save(); push(ctx, kf(T, [[s0, 1], [K.grab, 1.25], [K.less, 1.35]]), 420, 950);
        for (let r = 0; r < 14; r++) { const y = 560 + r * 56; ctx.strokeStyle = 'rgba(160,165,175,.5)'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 40; x < 430; x += 18) ctx.lineTo(x, y + (x / 18 % 2 ? 6 : -6)); ctx.stroke(); }
        for (let r = 0; r < 13; r++) for (let k = 0; k < 7; k++) { const x = 70 + k * 52, y = 588 + r * 56; const locked = k === 6 && r % 3 === 1 && T > K.lock; A.glowDot(ctx, x, y, 18, locked ? .35 : 1); }
        for (let i = 0; i < 22; i++) { const bx = 520 + hash(i) * 500, by = 560 + hash(i, 1) * 740; let x = bx + Math.sin(T * .7 + i) * 30, y = by + Math.cos(T * .6 + i * 2) * 30, a = 1;
          const tgt = i < 4 ? [70 + 6 * 52 + 40, 588 + (1 + i * 3) * 56] : null;
          if (tgt) { const u = p(T, K.grab + i * .1, .8, eio); x = lerp(x, tgt[0], u); y = lerp(y, tgt[1], u); }
          A.molecule(ctx, x, y, 22, T * .3 + i, a); }
        if (T > K.side && T < K.grab + .3) for (let i = 0; i < 5; i++) { const t = ((T - K.side) * 1.5 + i * .2) % 1; ring(ctx, 420 + hash(i, 4) * 60, 600 + hash(i, 5) * 650, t, '255,255,255', 5, 70); }
        if (T > K.lock) for (let i = 0; i < 4; i++) { const a = p(T, K.lock + i * .08, .3, eback), x = 70 + 6 * 52 + 20, y = 588 + (1 + i * 3) * 56; ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.fillStyle = 'rgba(235,240,245,.92)'; ctx.beginPath(); for (let v = 0; v < 6; v++) { const an = v / 6 * 7, r = 34 + 10 * hash(i, v); v ? ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r) : ctx.moveTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.fill(); ctx.restore(); }
        ctx.restore();
        tag(ctx, 'LOCKED FOR GOOD', 540, 1380, win(T, K.lock + .3, K.less), false);
      } else if (T < K.fewer - .1) {
        ctx.save(); push(ctx, lerp(1.15, 1, (T - K.less) / (K.fewer - K.less)));
        for (let i = 0; i < 70; i++) { const x = hash(i) * W, y = 520 + hash(i, 1) * 860, gone = hash(i, 2) < .4 * p(T, K.less + .4, .8); ctx.save(); ctx.translate(x, y); ctx.rotate(hash(i, 3) * 3 + T * .2 * (hash(i, 4) - .5)); const g = ctx.createLinearGradient(0, -20, 0, 20); g.addColorStop(0, gone ? '#55585e' : '#ffd24a'); g.addColorStop(1, gone ? '#222428' : '#c47a00'); ctx.fillStyle = g; rr(ctx, -55, -20, 110, 40, 20); ctx.fill(); ctx.restore(); }
        ctx.restore();
      } else {
        ctx.save(); push(ctx, lerp(1.05, 1, eo5((T - K.fewer) / .6))); alive(ctx, T, 540, 900, { yaw: .1, bob: 8 }); flipIn(ctx, 540, 900, p(T, K.fewer - .1, .6, eback));
        A.laptopOpen(ctx, 540, 600, 400, (x, w, h) => A.wallpaper(x, w, h, T, kf(T, [[K.fewer, 100], [K.smaller + .5, 78]])));
        A.wire(ctx, [[310, 750], [250, 750], [250, 900]], '#d0884a', 12); A.wire(ctx, [[770, 750], [830, 750], [830, 900]], '#b8bec6', 12);
        A.batteryBox(ctx, T, 190, 920, 700, 330, { cap: kf(T, [[K.fewer, 1], [K.smaller + .4, .72]]), lost: .2 });
        ctx.restore();
      }
    });
  }
  // 7 CRUST: SEI layer grows and slows the ions
  { const s0 = s(c('on top of that')), K = { build: c('build'), crust: c('crust'), grows: c('grows'), slows: c('slows'), end: c('and the hotter') };
    sfx.push({ t: K.crust, k: 'gear', g: -20 }, { t: K.slows, k: 'tick', g: -14 });
    pose(s0, 'point'); pose(K.crust, 'wow'); pose(K.slows, 'cross');
    add(s0, true, (ctx, T) => {
      A.bgLight(ctx);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 470, W, 940); ctx.clip();
      ctx.fillStyle = '#5d6066'; ctx.fillRect(0, 470, W, 940);
      for (let i = 0; i < 90; i++) { const g = ctx.createRadialGradient(hash(i) * W, 470 + hash(i, 1) * 940, 4, hash(i) * W, 470 + hash(i, 1) * 940, 40 + 60 * hash(i, 2)); g.addColorStop(0, 'rgba(160,165,172,.5)'); g.addColorStop(1, 'rgba(160,165,172,0)'); ctx.fillStyle = g; ctx.fillRect(0, 470, W, 940); }
      push(ctx, lerp(1, 1.12, (T - s0) / (K.end - s0)), 300, 940);
      ctx.fillStyle = '#3a3c41'; ctx.fillRect(0, 470, 210, 940); for (let y = 480; y < 1410; y += 14) { ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(0, y, 210, 3); }
      const cw = 110 * p(T, K.build, 2.5, x => x) + 40 * p(T, K.grows, 1.5);
      for (let i = 0; i < 160; i++) { const y = 470 + hash(i, 3) * 940, x = 210 + hash(i, 4) * cw, r = 14 + 14 * hash(i, 5); if (cw < 4) break; const g = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, r); g.addColorStop(0, '#e8eaed'); g.addColorStop(1, '#8d9198'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
      const speed = lerp(1, .25, p(T, K.slows - .5, 1.2)), ph = (T - s0) * speed;
      for (let i = 0; i < 46; i++) { const y0 = 490 + hash(i, 6) * 900, prog = (ph * .35 + hash(i, 7)) % 1, x = lerp(W + 20, 220, prog), y = y0 + Math.sin(x / 40 + i) * (x < 210 + cw + 60 ? 22 : 5); A.glowDot(ctx, x, y, 18); }
      ctx.restore();
      ctx.fillStyle = '#fff'; ctx.fillRect(60, 1370, 120, 6); ctx.font = FONT(700, 22); ctx.textAlign = 'left'; ctx.fillText('20 nm', 60, 1360);
      tag(ctx, 'CRUST', 300, 520, p(T, K.crust, .3), false);
    });
  }
  // 8 HEAT: thermal camera, sun, hot car, duvet, aging blob
  { const s0 = s(c('and the hotter')), K = { gets: c('gets'), happen: c('happen'), laptop: c('a laptop'), sun: c('sun'), car: c('hot car'), duvet: c('duvet'), covered: c('covered'), age: c('age'), fast: c('fast'), end: c('the second') };
    sfx.push({ t: K.gets - .3, k: 'stopwatch', g: -18 }, { t: K.happen, k: 'glitch', g: -16 }, { t: K.sun, k: 'riser', g: -18 }, { t: K.car, k: 'swoosh', g: -16 }, { t: K.duvet, k: 'swoosh', g: -16 }, { t: K.age, k: 'shimmer', g: -14 }, { t: K.fast, k: 'shutter', g: -14 });
    pose(s0, 'hold', 'thermo'); pose(K.laptop, 'cross'); pose(K.sun, 'shrug'); pose(K.car, 'think'); pose(K.duvet, 'point'); pose(K.age, 'panic');
    add(s0, false, (ctx, T) => {
      A.bgDark(ctx, false);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 460, W, 960); ctx.clip();
      if (T < K.laptop - .1) {
        const tmp = kf(T, [[s0, 27], [K.gets + .5, 35], [K.happen, 41]]), hv = (tmp - 20) / 25;
        push(ctx, kf(T, [[s0, 1], [K.happen, 1.6]]), 540, 940);
        for (let j = 0; j < 30; j++) for (let i = 0; i < 34; i++) { const v = hv * (.6 + .4 * Math.sin(i * .5 + j * .3)) + .15 * Math.sin(T * 6 + i * j); ctx.fillStyle = A.heat(v); ctx.fillRect(i * 32, 460 + j * 32, 32, 32); }
        if (T > K.gets + .6) for (let i = 0; i < 40; i++) { const t = ((T - K.gets) * 2 + hash(i)) % 1; ctx.fillStyle = `rgba(255,255,220,${(1 - t) * .9})`; ctx.beginPath(); ctx.arc(hash(i, 1) * W, 480 + hash(i, 2) * 920, 4 + t * 20, 0, 7); ctx.fill(); }
        ctx.setTransform(ctx.getTransform()); ctx.restore(); ctx.save();
        A.crosshair(ctx, 540, 940, tmp.toFixed(1) + ' °C'); A.thermalBar(ctx, 990, 520, 820, 20, 45);
        if (T > K.happen) { ctx.fillStyle = `rgba(255,250,235,${win(T, K.happen, K.laptop, .3)})`; ctx.fillRect(0, 460, W, 960); }
      } else if (T < K.car - .1) {
        const hot = p(T, K.sun, .5);
        push(ctx, lerp(1.1, 1.0, (T - K.laptop) / (K.car - K.laptop)));
        for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? '#a8743f' : '#b9824a'; ctx.fillRect(0, 460 + i * 82, W, 80); }
        A.laptopLid(ctx, 540, 940, 480, -.12);
        const sg = ctx.createRadialGradient(900, 500, 10, 900, 500, 700); sg.addColorStop(0, `rgba(255,250,210,${.8 * hot})`); sg.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 460, W, 960);
        if (hot > 0) { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(255,${lerp(255, 90, hot)},${lerp(255, 30, hot)},1)`; ctx.fillRect(0, 460, W, 960); ctx.globalCompositeOperation = 'source-over'; }
      } else if (T < K.age - .1) {
        const duvet = T > K.duvet - .1, hot = duvet ? p(T, K.covered, .6) : p(T, K.car + .3, .6);
        push(ctx, lerp(1.08, 1, eo5((T - (duvet ? K.duvet : K.car)) / .6)));
        if (!duvet) { ctx.fillStyle = '#2b2d33'; ctx.fillRect(0, 460, W, 960); ctx.fillStyle = '#9cc4d8'; ctx.fillRect(80, 480, 700, 300); ctx.fillStyle = '#3d4048'; rr(ctx, 60, 820, 960, 560, 40); ctx.fill(); ctx.fillStyle = '#c9b49a'; rr(ctx, 180, 900, 700, 440, 50); ctx.fill(); A.laptopLid(ctx, 520, 1080, 360, .1); }
        else { ctx.fillStyle = '#eef0f2'; ctx.fillRect(0, 460, W, 960); for (let i = 0; i < 9; i++) { ctx.strokeStyle = 'rgba(160,170,180,.5)'; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(-50, 480 + i * 120); ctx.bezierCurveTo(300, 420 + i * 120, 700, 560 + i * 120, 1130, 470 + i * 120); ctx.stroke(); }
          ctx.fillStyle = '#1e1f23'; rr(ctx, 250, 760, 580, 360, 40); ctx.fill(); for (const fx of [400, 680]) { ctx.strokeStyle = '#555'; ctx.lineWidth = 3; for (let r = 20; r < 90; r += 12) { ctx.beginPath(); ctx.arc(fx, 940, r, 0, 7); ctx.stroke(); } }
          ctx.fillStyle = 'rgba(238,240,242,.9)'; ctx.beginPath(); ctx.moveTo(150, 1200); ctx.bezierCurveTo(400, 1000 - 200 * p(T, K.covered - .3, .8), 700, 1000 - 200 * p(T, K.covered - .3, .8), 930, 1200); ctx.lineTo(930, 1420); ctx.lineTo(150, 1420); ctx.fill(); }
        if (hot > 0) { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(255,${lerp(255, 80, hot)},${lerp(255, 20, hot)},1)`; ctx.fillRect(0, 460, W, 960); ctx.globalCompositeOperation = 'source-over'; }
      } else {
        push(ctx, lerp(1, 1.2, (T - K.age) / (K.end - K.age)));
        ctx.fillStyle = A.heat(.42); ctx.fillRect(0, 460, W, 960);
        for (let i = 0; i < 60; i++) { ctx.fillStyle = `rgba(255,120,60,${.5 * hash(i, 4)})`; ctx.beginPath(); ctx.arc(hash(i) * W, 480 + hash(i, 1) * 920, 5, 0, 7); ctx.fill(); }
        const r = 230, dmg = p(T, K.fast - .3, .8);
        ctx.fillStyle = `rgba(40,0,0,${.8 * dmg})`; ctx.beginPath(); for (let k = 0; k <= 40; k++) { const an = k / 40 * 7, rr2 = (r + 90 * dmg) * (1 + .08 * Math.sin(an * 5 + T * 3)); k ? ctx.lineTo(540 + Math.cos(an) * rr2, 940 + Math.sin(an) * rr2 * .8) : ctx.moveTo(540 + Math.cos(an) * rr2, 940 + Math.sin(an) * rr2 * .8); } ctx.fill();
        ctx.fillStyle = A.heat(.88); ctx.beginPath(); for (let k = 0; k <= 40; k++) { const an = k / 40 * 7, rr2 = r * (1 - .2 * dmg) * (1 + .06 * Math.sin(an * 4 + T * 2)); k ? ctx.lineTo(540 + Math.cos(an) * rr2, 940 + Math.sin(an) * rr2 * .8) : ctx.moveTo(540 + Math.cos(an) * rr2, 940 + Math.sin(an) * rr2 * .8); } ctx.fill();
        ctx.fillStyle = A.heat(1); ctx.beginPath(); ctx.ellipse(540, 940, 100 * (1 - .3 * dmg), 80 * (1 - .3 * dmg), 0, 0, 7); ctx.fill();
      }
      ctx.restore();
    });
  }
  // 9 EXTREMES: 0% / 100% crams ions on one side; 20-80% happiest
  { const s0 = s(c('the second')), K = { ext: c('extremes'), zero: c('0', s0), hund: c('100', s0), either: c('either'), cram: c('crammed'), dmg: c('damage'), some: c('somewhere'), happy: c('happiest'), end: c('so if') };
    sfx.push({ t: K.ext, k: 'pop', g: -14 }, { t: K.zero, k: 'tick', g: -12 }, { t: K.hund, k: 'tick', g: -12 }, { t: K.dmg, k: 'glitch', g: -14 }, { t: K.happy, k: 'success', g: -12 });
    pose(s0, 'peace'); pose(K.ext, 'wow'); pose(K.zero, 'point'); pose(K.cram, 'cross'); pose(K.dmg, 'panic'); pose(K.some, 'shrug'); pose(K.happy, 'thumbs');
    add(s0, true, (ctx, T) => {
      A.bgLight(ctx);
      const pct = kf(T, [[s0, 58], [K.zero, 0], [K.hund - .2, 0], [K.hund + .3, 100], [K.dmg, 100], [K.some, 50], [K.some + .7, 20], [K.some + 1.4, 80], [K.happy + .3, 60]]);
      ctx.save(); push(ctx, kf(T, [[s0, 1], [K.dmg - .2, 1.05], [K.dmg + .3, 1.5], [K.some, 1.5], [K.some + .5, 1]]), 380, 1000);
      alive(ctx, T, 540, 900, { yaw: .1, bob: 8 });
      A.laptopOpen(ctx, 540, 560, 260, (x, w, h) => A.wallpaper(x, w, h, T, pct));
      ctx.strokeStyle = '#666'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(150, 900); ctx.lineTo(150, 700); ctx.lineTo(930, 700); ctx.lineTo(930, 900); ctx.stroke();
      const f = pct / 100;
      A.lattice(ctx, 300, 860, 78, 4, '#c9a24a', (i, j, k) => hash(i * 16 + j * 4 + k, 1) < f ? 1 : 0, T, p(T, K.dmg, .8));
      A.lattice(ctx, 790, 860, 78, 4, '#b8bcc4', (i, j, k) => hash(i * 16 + j * 4 + k, 2) < 1 - f ? 1 : 0, T);
      ctx.strokeStyle = '#9ab'; ctx.lineWidth = 5; for (let y = 760; y < 1260; y += 30) { ctx.beginPath(); ctx.moveTo(530, y); ctx.quadraticCurveTo(555, y + 15, 530, y + 30); ctx.stroke(); }
      ctx.restore();
      if (T > K.happy - .2) { const a = p(T, K.happy - .2, .4, eback); ctx.save(); alive(ctx, T, 540, 1370, { yaw: .2, bob: 6, seed: 2 }); ctx.translate(540, 1370); ctx.rotate((1 - a) * -.6); ctx.scale(a, a); rr(ctx, -200, -50, 400, 90, 45); ctx.fillStyle = '#34c759'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = FONT(900, 46); ctx.textAlign = 'center'; ctx.fillText('20 – 80%', 0, 12); ctx.restore(); }
    });
  }
  // 10 ALWAYS PLUGGED: evening desk at 100%
  { const s0 = s(c('so if')), K = { hund: c('100', s0), wreck: c('wrecking'), not: c('not on most'), recent: c('recent'), end: c('once yours') };
    sfx.push({ t: K.hund, k: 'pop', g: -14 }, { t: K.wreck, k: 'glitch', g: -16 }, { t: K.not, k: 'click', g: -12 });
    pose(s0, 'think'); pose(K.hund, 'point'); pose(K.wreck, 'panic'); pose(K.not, 'stop');
    add(s0, false, (ctx, T) => {
      A.bgDark(ctx, false);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 460, W, 960); ctx.clip();
      push(ctx, kf(T, [[s0, 1], [K.hund, 1.2], [K.not, 1.25], [K.recent + .4, .95]]), 540, 860);
      const g = ctx.createLinearGradient(0, 460, 0, 1000); g.addColorStop(0, '#3a2a4a'); g.addColorStop(1, '#e0874a'); ctx.fillStyle = g; ctx.fillRect(0, 460, W, 540);
      for (let i = 0; i < 14; i++) { ctx.fillStyle = 'rgba(20,15,25,.85)'; const bh = 80 + 200 * hash(i); ctx.fillRect(i * 80, 1000 - bh, 70, bh); }
      ctx.fillStyle = '#5a3a24'; ctx.fillRect(-200, 1000, W + 400, 500); for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(-200, 1030 + i * 70, W + 400, 4); }
      const lap = (x, y, w, a = 1) => { ctx.globalAlpha = a; A.laptopOpen(ctx, x, y, w, (cx, ww, hh) => { A.wallpaper(cx, ww, hh, T, 100); if (T > K.wreck && T < K.not && x === 540) { for (let i = 0; i < 5; i++) { cx.fillStyle = `rgba(255,${100 + 60 * Math.sin(T * 8 + i)},40,.85)`; rr(cx, ww * .08 + i * ww * .18, hh * .45, ww * .15, hh * .35, 8); cx.fill(); } } }); ctx.globalAlpha = 1; };
      if (T > K.recent) { lap(lerp(-300, 180, p(T, K.recent, .5)), 880, 260, p(T, K.recent, .3)); lap(lerp(1400, 900, p(T, K.recent + .1, .5)), 880, 260, p(T, K.recent + .1, .3)); }
      lap(540, 840, 420);
      A.wire(ctx, [[760, 1000], [820, 1080], [900, 1100]], '#ddd', 8); ctx.fillStyle = '#eee'; rr(ctx, 890, 1080, 90, 50, 10); ctx.fill();
      ctx.fillStyle = '#f2f2f2'; rr(ctx, 120, 1050, 70, 80, 10); ctx.fill(); for (let i = 0; i < 3; i++) { ctx.strokeStyle = `rgba(255,255,255,${.25})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(140 + i * 15, 1040); ctx.quadraticCurveTo(130 + i * 15 + Math.sin(T * 3 + i) * 10, 1000, 145 + i * 15, 960); ctx.stroke(); }
      ctx.restore();
    });
  }
  // 11 NOTICES: battery-level chart caps at 80%, then power runs straight off the cable
  { const s0 = s(c('once yours')), K = { plugged: c('plugged', s0), stops: c('stops around'), itself: c('itself'), after: c('after that'), runs: c('runs'), cable: c('cable'), end: c('on a mac') };
    sfx.push({ t: K.stops, k: 'data', g: -16 }, { t: K.itself, k: 'pop', g: -14 }, { t: K.runs, k: 'sweep', g: -16 }, { t: K.cable, k: 'click', g: -12 });
    pose(s0, 'think'); pose(K.stops, 'cross'); pose(K.after, 'stop'); pose(K.cable, 'thumbs');
    add(s0, true, (ctx, T) => {
      if (T < K.after - .1) {
        A.bgLight(ctx);
        ctx.save(); push(ctx, kf(T, [[s0, 1], [K.stops, 1.08]])); alive(ctx, T, 540, 900, { yaw: .08, bob: 6 }); flipIn(ctx, 540, 900, p(T, s0, .6, eback));
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.18)'; ctx.shadowBlur = 40; rr(ctx, 70, 470, 940, 880, 30); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
        ctx.fillStyle = '#1c1d20'; ctx.font = FONT(800, 36); ctx.textAlign = 'left'; ctx.fillText('Battery Level', 120, 550);
        ctx.fillStyle = '#8a8e96'; ctx.font = FONT(500, 24); ctx.fillText('Last 10 Days', 120, 590);
        const cap = p(T, K.stops - .3, .8), bars = 40, bx = 120, by = 1250, bh = 560, n = Math.floor(bars * clamp((T - s0) / 1.5 + .3));
        for (let i = 0; i < n; i++) { const v = i < 18 ? .95 + .05 * Math.sin(i) : lerp(.97, .8, cap); ctx.fillStyle = '#34c759'; ctx.fillRect(bx + i * 20, by - bh * v, 14, bh * v); }
        ctx.strokeStyle = '#ccc'; ctx.lineWidth = 2; for (const v of [0, .5, 1]) { ctx.beginPath(); ctx.moveTo(bx, by - bh * v); ctx.lineTo(bx + 800, by - bh * v); ctx.stroke(); ctx.fillStyle = '#999'; ctx.font = FONT(500, 20); ctx.fillText(v * 100 + '%', bx + 810, by - bh * v + 6); }
        if (cap > 0) { ctx.strokeStyle = `rgba(229,57,53,${cap})`; ctx.setLineDash([14, 10]); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx, by - bh * .8); ctx.lineTo(bx + 800, by - bh * .8); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = `rgba(229,57,53,${cap})`; ctx.font = FONT(800, 30); ctx.fillText('80%', bx + 680, by - bh * .8 - 14); }
        if (T > K.itself) { const a = p(T, K.itself, .3, eback); ctx.save(); ctx.translate(700, 760 + 6 * Math.sin(T * 2)); ctx.rotate((1 - a) * .5); ctx.scale(a, a); ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 20; rr(ctx, -170, -50, 340, 100, 18); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#1c1d20'; ctx.font = FONT(700, 26); ctx.textAlign = 'center'; ctx.fillText('Charging On Hold', 0, 10); ctx.restore(); }
        ctx.restore();
      } else {
        A.bgDark(ctx, false);
        ctx.save(); push(ctx, lerp(1.1, 1, eo5((T - K.after) / .6))); alive(ctx, T, 540, 940, { yaw: .07, bob: 6 });
        ctx.fillStyle = '#10261c'; rr(ctx, 40, 480, 1000, 920, 20); ctx.fill();
        for (let i = 0; i < 9; i++) { ctx.fillStyle = '#16181c'; rr(ctx, 120 + (i % 3) * 300, 540 + Math.floor(i / 3) * 170, 200, 120, 8); ctx.fill(); ctx.fillStyle = '#555'; ctx.font = FONT(600, 18); ctx.textAlign = 'center'; ctx.fillText(['CPU', 'RAM', 'SSD', 'PMIC', 'GPU', 'I/O', 'WIFI', 'USB', 'SMC'][i], 220 + (i % 3) * 300, 610 + Math.floor(i / 3) * 170); }
        const bat = [[60, 1030], [220, 1030]]; ctx.fillStyle = '#2a2b2f'; rr(ctx, 100, 1080, 880, 280, 16); ctx.fill();
        const dim = 1 - .7 * p(T, K.runs, .6); ctx.globalAlpha = dim; A.batteryBox(ctx, T, 130, 1110, 820, 220, {}); ctx.globalAlpha = 1;
        ctx.fillStyle = '#ccc'; rr(ctx, 0, 980, 60, 60, 10); ctx.fill(); A.wire(ctx, [[-200, 1010], [0, 1010]], '#ddd', 18);
        const path = [[60, 1010], [520, 1010], [520, 880], [220, 880], [220, 700]], path2 = [[520, 880], [820, 880], [820, 660]];
        ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 5; for (const pth of [path, path2]) { ctx.beginPath(); pth.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke(); }
        A.flow(ctx, T, path, p(T, K.runs - .3, .5), .6, 16, GOLD); A.flow(ctx, T, path2, p(T, K.runs - .1, .5), .6, 10, GOLD);
        ctx.restore();
        tag(ctx, 'battery resting · power from cable', 540, 1440, p(T, K.cable, .4), false);
      }
    });
  }
  // 12 MAC: optimised charging toggle + charge limit slider
  { const s0 = s(c('on a mac')), K = { opt: c('optimised'), already: c('already'), set: c('set the'), limit: c('limit'), end: c('on a pc') };
    sfx.push({ t: K.already, k: 'click', g: -12 }, { t: K.limit, k: 'sweep', g: -18 });
    pose(s0, 'point'); pose(K.already, 'thumbs'); pose(K.set, 'point');
    add(s0, false, (ctx, T) => {
      A.bgDark(ctx);
      ctx.save(); push(ctx, lerp(1.08, 1, eo5((T - s0) / .6)));
      const sl = kf(T, [[K.limit, 1], [K.limit + .8, 0]]); alive(ctx, T, 540, 800, { yaw: .07, bob: 6 }); flipIn(ctx, 540, 800, p(T, s0, .6, eback));
      A.settingsWindow(ctx, 90, 560, 900, 'Battery', [{ label: 'Optimised Battery Charging', sub: 'Learns your routine, holds at 80%', toggle: 1 }, { label: 'Charge Limit', sub: 'Stop charging at', slider: sl }, { label: 'Low Power Mode', sub: 'Never', toggle: 0 }], { hi: T < K.set ? 0 : 1, hiA: T > K.opt ? .9 : 0 });
      const cp = kf(T, [[s0, [700, 1400]], [K.already - .4, [890, 735]], [K.set, [890, 735]], [K.limit - .1, [883, 875]], [K.limit + .8, [495, 875]]]);
      A.cursor(ctx, cp[0], cp[1], T > K.limit - .1 && T < K.limit + .8 ? 1 : 0);
      ring(ctx, 890, 725, (T - K.already) / .5, '52,199,89', 10, 60);
      ctx.restore();
    });
  }
  // 13 PC: brand battery app, Battery Care Mode switch
  { const s0 = s(c('on a pc')), K = { app: c('app'), off: c('off', c('ship')), sw: c('switch'), keep: c('keep it'), stress: c('stress'), end: c('send this') };
    sfx.push({ t: K.off, k: 'tick', g: -12 }, { t: K.sw + .2, k: 'click', g: -10 }, { t: K.stress, k: 'success', g: -14 });
    pose(s0, 'point'); pose(K.off, 'shrug'); pose(K.sw, 'point'); pose(K.keep, 'thumbs'); pose(K.stress, 'wave');
    add(s0, false, (ctx, T) => {
      A.bgDark(ctx);
      ctx.save(); push(ctx, lerp(1.08, 1, eo5((T - s0) / .6)) * (T > K.keep ? lerp(1, .9, p(T, K.keep, .6)) : 1));
      const on = p(T, K.sw + .2, .3); alive(ctx, T, 540, 800, { yaw: .07, bob: 6, seed: 1 }); flipIn(ctx, 540, 800, p(T, s0, .6, eback));
      A.settingsWindow(ctx, 90, 540, 900, 'Device settings · Power', [{ label: 'Battery Care Mode', sub: on > .5 ? 'On · limits charge to ~80%' : 'Off', toggle: on }, { label: 'Rapid Charge', sub: 'Charge faster when needed', toggle: 0 }, { label: 'Instant Full-Charge', sub: 'Charge to 100% once', toggle: 0 }], { dark: true, hi: 0, hiA: T > K.off ? .9 : 0 });
      const cp = kf(T, [[s0, [600, 1400]], [K.app, [700, 900]], [K.sw, [880, 690]]]);
      A.cursor(ctx, cp[0], cp[1], T > K.sw + .1 && T < K.sw + .3 ? 1 : 0); ring(ctx, 900, 705, (T - K.sw - .2) / .5, '52,199,89', 10, 60);
      if (T > K.stress - .3) { const a = p(T, K.stress - .3, .4, eback); ctx.save(); ctx.translate(540, 1300 + 6 * Math.sin(T * 2)); ctx.rotate((1 - a) * -.6 + .03 * Math.sin(T * 1.4)); ctx.scale(a, a); rr(ctx, -210, -50, 420, 100, 50); ctx.fillStyle = '#34c759'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = FONT(900, 44); ctx.textAlign = 'center'; ctx.fillText('No stress ✓', 0, 15); ctx.restore(); }
      ctx.restore();
    });
  }
  // 14 SEND: share sheet
  { const s0 = s(c('send this')), K = { friend: c('friend'), unplug: c('unplugged'), every: c('every time'), end: c('follow for') };
    sfx.push({ t: s0 + .2, k: 'swoosh', g: -16 }, { t: K.unplug, k: 'click', g: -12 }, { t: K.every + .1, k: 'click', g: -12 }, { t: K.every + .2, k: 'success', g: -16 });
    pose(s0, 'point'); pose(K.friend, 'wave'); pose(K.every, 'thumbs');
    add(s0, true, (ctx, T) => {
      A.bgLight(ctx);
      ctx.save(); push(ctx, lerp(1, 1.05, (T - s0) / (K.end - s0)));
      const y0 = lerp(1500, 620, p(T, s0 + .1, .5, eback));
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.2)'; ctx.shadowBlur = 50; rr(ctx, 90, y0, 900, 640, 36); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
      rr(ctx, 130, y0 + 40, 820, 70, 18); ctx.fillStyle = '#f0f1f3'; ctx.fill(); ctx.fillStyle = '#888'; ctx.font = FONT(500, 28); ctx.textAlign = 'left'; ctx.fillText('⌕  Search', 160, y0 + 86);
      const names = ['Sofia', 'Daniel', 'Mei', 'Lucas'], cols = ['#d6a37f', '#8d6e63', '#c58f72', '#7b8f5a'], pick = T > K.unplug;
      names.forEach((n, i) => { const x = 210 + i * 220, y = y0 + 230 + 8 * Math.sin(T * 2 + i * 1.3); ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.arc(x, y, 72, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(40,25,20,.5)'; ctx.beginPath(); ctx.arc(x, y - 14, 26, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(x, y + 58, 46, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#333'; ctx.font = FONT(600, 26); ctx.textAlign = 'center'; ctx.fillText(n, x, y + 118);
        if (i === 3 && pick) { ctx.strokeStyle = '#2f8cff'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(x, y, 80, 0, 7); ctx.stroke(); ctx.fillStyle = '#2f8cff'; ctx.beginPath(); ctx.arc(x + 54, y + 54, 22, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = FONT(900, 24); ctx.fillText('✓', x + 54, y + 63); } });
      const sent = T > K.every + .1; rr(ctx, 130, y0 + 470, 820, 100, 22); ctx.fillStyle = sent ? '#1d4f8c' : pick ? '#111' : '#bbb'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = FONT(800, 34); ctx.textAlign = 'center'; ctx.fillText(sent ? '✓ Sent' : 'Send', 540, y0 + 532);
      const cp = kf(T, [[s0, [900, 1500]], [K.unplug - .3, [880, y0 + 250]], [K.every - .3, [560, y0 + 530]]]); A.cursor(ctx, cp[0], cp[1], (T > K.unplug - .1 && T < K.unplug + .1) || (T > K.every && T < K.every + .2) ? 1 : 0);
      ctx.restore();
    });
  }
  // 15 OUTRO: follow agentsoly, made in code, comment "guide", link in bio
  { const s0 = s(c('follow for')), K = { code: c('the complete'), codeW: c('code', c('the complete')), edit: c('edit'), want: c('if you want'), comment: c('comment'), guide: c('guide', c('comment')), tik: c('watching') - .4, bio: c('bio') };
    sfx.push({ t: s0 + .5, k: 'click', g: -10 }, { t: K.code, k: 'swoosh', g: -16 }, { t: K.edit, k: 'success', g: -14 }, { t: K.guide, k: 'pop', g: -12 }, { t: K.bio, k: 'pop', g: -12 });
    for (let i = 0; i < 12; i++) sfx.push({ t: K.code + .3 + i * .25, k: 'type', g: -24 });
    for (let i = 0; i < 5; i++) sfx.push({ t: K.guide + .1 + i * .085, k: 'type', g: -22 });
    pose(s0, 'wave'); pose(K.code, 'point'); pose(K.edit, 'stop'); pose(K.want, 'thumbs'); pose(K.comment, 'point'); pose(K.tik, 'shrug'); pose(K.bio, 'point');
    add(s0, false, (ctx, T) => {
      A.bgDark(ctx);
      ctx.save();
      if (T < K.code - .1) {
        push(ctx, lerp(1.1, 1, eo5((T - s0) / .6))); alive(ctx, T, 540, 900, { yaw: .12, bob: 10 }); flipIn(ctx, 540, 900, p(T, s0, .6, eback));
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 50; rr(ctx, 140, 620, 800, 560, 40); ctx.fillStyle = '#1b1d22'; ctx.fill(); ctx.restore();
        const g = ctx.createLinearGradient(380, 660, 700, 980); g.addColorStop(0, '#1fa58f'); g.addColorStop(1, '#f2a25c'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(540, 800, 110, 0, 7); ctx.fill();
        avatarRing(ctx, T, 540, 800, 126); avatarFace(ctx, 540, 800, 110);
        ctx.textAlign = 'center'; if (named) { ctx.fillStyle = '#fff'; ctx.font = FONT(800, 52); ctx.fillText('agentsoly', 540, 990); }
        ctx.fillStyle = '#9aa0aa'; ctx.font = FONT(500, 28); ctx.fillText('Explainers built 100% in code', 540, named ? 1040 : 1010);
        const fol = T > s0 + .5; rr(ctx, 360, 1080, 360, 76, 38); ctx.fillStyle = fol ? '#2b2e35' : '#2f8cff'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = FONT(800, 32); ctx.fillText(fol ? 'Following ✓' : 'Follow', 540, 1130);
        ring(ctx, 540, 1118, (T - s0 - .5) / .5, '47,140,255', 30, 160);
      } else if (T < K.want - .1) {
        push(ctx, lerp(1.06, 1, eo5((T - K.code) / .6)));
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 50; rr(ctx, 60, 500, 960, 880, 24); ctx.fillStyle = '#16181d'; ctx.fill(); ctx.restore();
        ctx.fillStyle = '#22252c'; rr(ctx, 60, 500, 960, 60, [24, 24, 0, 0]); ctx.fill(); for (let k = 0; k < 3; k++) { ctx.fillStyle = ['#ff5f57', '#febc2e', '#28c840'][k]; ctx.beginPath(); ctx.arc(100 + k * 28, 530, 9, 0, 7); ctx.fill(); }
        ctx.fillStyle = '#9aa0aa'; ctx.font = FONT(600, 22); ctx.textAlign = 'left'; ctx.fillText('scenes.js', 200, 538);
        const lines = [['// every frame = a function of time', '#6a9955'], ['export function battery(ctx, T) {', '#c586c0'], ['  const q = cue("travel");', '#9cdcfe'], ['  cell(ctx, T, { ions: 1, q });', '#dcdcaa'], ['  flow(ctx, T, wirePath);', '#dcdcaa'], ['  presenter(ctx, T, pose);', '#dcdcaa'], ['  captions(ctx, T, words);', '#dcdcaa'], ['}', '#c586c0'], ['', '#fff'], ['render.js → 3,800 frames → mp4', '#4ec9b0']];
        const typed = (T - K.code - .2) * 34; let used = 0; ctx.font = '500 28px "Cascadia Mono", Consolas, monospace';
        lines.forEach(([txt, col], i) => { const n = clamp(typed - used, 0, txt.length); used += txt.length + 4; ctx.fillStyle = '#555'; ctx.fillText(String(i + 1).padStart(2), 80, 620 + i * 52); ctx.fillStyle = col; ctx.fillText(txt.slice(0, Math.floor(n)), 140, 620 + i * 52); if (n > 0 && n < txt.length && Math.floor(T * 4) % 2) ctx.fillRect(140 + ctx.measureText(txt.slice(0, Math.floor(n))).width, 598, 14, 30); });
        const pr = p(T, K.edit - .6, 1.2, x => x); rr(ctx, 120, 1230, 840, 26, 13); ctx.fillStyle = '#2b2e35'; ctx.fill(); rr(ctx, 120, 1230, 840 * pr, 26, 13); ctx.fillStyle = '#34c759'; ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = FONT(700, 26); ctx.fillText(pr >= 1 ? 'Rendered ✓  no editing' : 'Rendering frames…', 120, 1310);
      } else if (T < K.tik - .1) {
        push(ctx, lerp(1.06, 1, eo5((T - K.want) / .6)));
        ctx.fillStyle = '#fff'; ctx.font = FONT(900, 92); ctx.textAlign = 'center'; ctx.fillText('FULL GUIDE', 540, 760 - 20 * (1 - p(T, K.want, .5, eback)));
        ctx.fillStyle = '#9aa0aa'; ctx.font = FONT(600, 34); ctx.fillText('how this video was made', 540, 820);
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 30; rr(ctx, 110, 980, 860, 120, 60); ctx.fillStyle = '#23262d'; ctx.fill(); ctx.restore();
        const word = 'guide', n = Math.floor(clamp((T - K.guide) * 12, 0, 5)); ctx.textAlign = 'left'; ctx.fillStyle = n ? '#fff' : '#777'; ctx.font = FONT(600, 40); ctx.fillText(n ? word.slice(0, n) : 'Add a comment…', 170, 1054);
        rr(ctx, 800, 1000, 150, 80, 40); ctx.fillStyle = n >= 5 ? '#2f8cff' : '#3a3d45'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = FONT(800, 30); ctx.fillText('Post', 875, 1052);
        if (T > K.guide + .7) { const a = p(T, K.guide + .7, .4, eback); ctx.save(); ctx.translate(540, 1240); ctx.scale(a, a); ctx.font = FONT(700, 34); ctx.fillStyle = '#ff4d6d'; ctx.fillText(named ? '♥  agentsoly replied' : '♥  Creator replied', 0, 0); ctx.restore(); }
      } else {
        push(ctx, lerp(1.06, 1, eo5((T - K.tik) / .6)));
        ['TikTok', 'YouTube'].forEach((n, i) => { const a = p(T, K.tik + .5 + i * .3, .4, eback); ctx.save(); ctx.translate(340 + i * 400, 640 + 10 * Math.sin(T * 2 + i * 2)); ctx.rotate((1 - a) * (i ? .6 : -.6)); ctx.scale(a, a); rr(ctx, -160, -60, 320, 120, 30); ctx.fillStyle = i ? '#e62117' : '#111'; ctx.fill(); ctx.strokeStyle = '#444'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = FONT(800, 40); ctx.textAlign = 'center'; ctx.fillText(n, 0, 14); ctx.restore(); });
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 40; rr(ctx, 110, 820, 860, 420, 36); ctx.fillStyle = '#1b1d22'; ctx.fill(); ctx.restore();
        avatarRing(ctx, T, 240, 940, 84); avatarFace(ctx, 240, 940, 70);
        ctx.textAlign = 'left'; if (named) { ctx.fillStyle = '#fff'; ctx.font = FONT(800, 46); ctx.fillText('agentsoly', 340, 930); } ctx.fillStyle = '#9aa0aa'; ctx.font = FONT(500, 28); ctx.fillText('Explainers built 100% in code', 340, named ? 975 : 955);
        const hl = p(T, K.bio, .4); rr(ctx, 160, 1060, 760, 100, 22); ctx.fillStyle = `rgba(47,140,255,${.15 + .35 * hl})`; ctx.fill(); ctx.strokeStyle = `rgba(47,140,255,${hl})`; ctx.lineWidth = 4; ctx.stroke();
        ctx.fillStyle = '#7fb6ff'; ctx.font = FONT(700, 36); ctx.fillText('🔗  Full guide · link in bio', 200, 1124);
        if (T > K.bio) A.cursor(ctx, kf(T, [[K.bio, 800], [K.bio + .5, 620]]), kf(T, [[K.bio, 1400], [K.bio + .5, 1120]]), T > K.bio + .5 && T < K.bio + .7 ? 1 : 0);
      }
      ctx.restore();
    });
  }
  list.forEach((sc, i) => sc.end = list[i + 1] ? list[i + 1].start : 1e9);
  track.sort((a, b) => a[0] - b[0]);
  return { scenes: list, sfx, track };
}
