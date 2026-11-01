// 16:9 ad: "one skill file made this video". Kinetic type replaces captions; every time comes from word cues c('phrase', after).
// No profile name or picture anywhere; the skill is named "Claude Motion Studio".
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, hash, rr, alive, flipIn } from './lib.js';
import { SANS, SERIF, INK, BLUE, BLUE2, CORAL, cover, photoBg, softBg, spaceBg, line, pillTag, webCard, card3, badge, skillCard, logo, laptop,
  appWindow, promptBox, modelMenu, cursor, check, buddy, dotNumber } from './kit.js';
const kf = (T, keys, e = eio) => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (T < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e((T - t0) / (t1 - t0)); return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u); }
  return keys[keys.length - 1][1];
};
const live = (ctx, T, x, y, o, fn) => { ctx.save(); alive(ctx, T, x, y, o); fn(); ctx.restore(); };
const zoom = (ctx, z, x, y) => { ctx.translate(x, y); ctx.scale(z, z); ctx.translate(-x, -y); };
const tap = (T, t0, d = .3) => T < t0 || T > t0 + d ? 0 : Math.sin((T - t0) / d * Math.PI);
const B = px => SANS(800, px), R = px => SANS(600, px);
const WEBS = ['web1', 'web2', 'web3', 'web4', 'web5', 'web6', 'web7', 'web8'];
const PROMPT = 'Use my SKILL.md and build a premium website for my studio';
const BUILD = 'Build a cinematic website like this for my brand';

export function makeScenes(c, DURATION) {
  const list = [], sfx = [];
  const add = (start, draw, o = {}) => { list.push({ start, draw, ...o }); if (start > 0 && !o.quiet) sfx.push({ t: start - .1, k: 'whoosh', g: -18 }); };
  const s = x => x - .1;
  const A = { one: s(c('one')), not: s(c('not')), just: s(c('just')), drop: s(c('i dropped')), every: s(c('every')), portf: s(c('portfolios')), prem: s(c('premium')),
    frame: s(c('every frame')), right: s(c('and right')), want: s(c('want')), follow: s(c('follow')), send: s(c("i'll")), but: s(c('but')), after: s(c('after')) };
  A.montage = c('this', c('website')) + .7; A.brand = c('minutes') + 1.0; A.end = s(c('comment', c('paid')));

  // 1 SKY: "What if..." over the mountains, then a sun bloom wipes to white
  { const K = { what: c('what'), end: A.one };
    sfx.push({ t: K.end - .5, k: 'riser', g: -16 });
    add(0, (ctx, T) => {
      photoBg(ctx, T, 'mountain', { zoom: kf(T, [[0, 1.25], [K.end, 1.06]]) });
      line(ctx, T, [{ s: 'What', t: K.what, font: B(96), col: '#fff' }, { s: 'if…', t: K.what + .35, font: B(96), col: '#fff' }], W / 2, H * .5, { slide: 30 });
      const b = p(T, K.end - .55, .55, eio); if (b > 0) { const r = lerp(60, 1500, b), g = ctx.createRadialGradient(W * .62, H * .5, 10, W * .62, H * .5, r);
        g.addColorStop(0, `rgba(255,255,255,${b})`); g.addColorStop(.5, `rgba(255,255,255,${b * .9})`); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    });
  }
  // 2 "one file could make videos like mine?"
  { const s0 = A.one, K = { file: c('file', s0), could: c('could', s0), videos: c('videos', s0), like: c('like', s0), mine: c('mine', s0) };
    sfx.push({ t: K.videos, k: 'pop', g: -14 });
    add(s0, (ctx, T) => {
      softBg(ctx, T);
      if (T < K.could - .05) { ctx.save(); zoom(ctx, kf(T, [[s0, 1.15], [K.could, 1]]), W / 2, H / 2);
        line(ctx, T, [{ s: 'one', t: s0 + .1, font: B(110) }, { s: 'file', t: K.file, font: B(110), col: BLUE }], W / 2, H / 2 + 40); ctx.restore(); return; }
      line(ctx, T, [{ s: 'could make', t: K.could, font: R(34), col: 'rgba(40,44,54,.45)' }], W / 2, 330);
      const sh = (T * .4) % 1.6 - .3; ctx.save(); zoom(ctx, kf(T, [[K.videos, .85], [K.videos + .5, 1], [A.not, 1.06]], eback), W / 2, 540);
      line(ctx, T, [{ s: 'videos', t: K.videos, font: B(230), grad: [BLUE, BLUE2] }], W / 2, 600, { slide: 40 });
      ctx.globalCompositeOperation = 'source-atop'; const g = ctx.createLinearGradient(W * sh, 0, W * (sh + .15), 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 380, W, 260);
      ctx.restore();
      line(ctx, T, [{ s: 'like', t: K.like, font: SERIF(84) }, { s: 'mine?', t: K.mine, font: SERIF(84) }], W / 2, 760);
    });
  }
  // 3 the list wheel: Not a studio / editor / team / budget
  { const s0 = A.not, items = ['Not a studio.', 'Not an editor.', 'Not a team.', 'Not a budget.'], ts = ['studio', 'editor', 'team', 'budget'].map(w => c(w, s0) - .35);
    ts.forEach(t => sfx.push({ t, k: 'tick', g: -16 }));
    add(s0, (ctx, T) => {
      softBg(ctx, T);
      let idx = 0; ts.forEach((t, i) => { if (T > t) idx = i + eo5(clamp((T - t) / .3)) - 1; }); idx = Math.max(idx, 0);
      items.forEach((it, i) => { const d = i - idx, a = clamp(1 - Math.abs(d) * .65) * p(T, s0, .3), y = H / 2 + d * 92;
        if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.filter = Math.abs(d) > .3 ? `blur(${Math.abs(d) * 4}px)` : 'none'; ctx.font = Math.abs(d) < .5 ? B(64) : R(54); ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(it, W / 2 - 230, y); ctx.restore(); });
      ctx.save(); ctx.strokeStyle = BLUE; ctx.lineWidth = 5; ctx.lineCap = 'round'; const ax = W / 2 - 290 + 6 * Math.sin(T * 5); ctx.beginPath(); ctx.moveTo(ax - 30, H / 2); ctx.lineTo(ax, H / 2); ctx.moveTo(ax - 12, H / 2 - 14); ctx.lineTo(ax, H / 2); ctx.lineTo(ax - 12, H / 2 + 14); ctx.stroke(); ctx.restore();
    });
  }
  // 4 "Just this. A skill file." + the SKILL.md card
  { const s0 = A.just, K = { this: c('this', s0), a: c('a', c('this', s0)), skill: c('skill', s0), file: c('file', s0) };
    sfx.push({ t: s0 + .1, k: 'swoosh', g: -14 }, { t: K.file, k: 'pop', g: -13 });
    add(s0, (ctx, T) => {
      softBg(ctx, T);
      const up = p(T, K.a - .1, .4);
      ctx.save(); ctx.translate(0, -70 * up); ctx.globalAlpha = 1 - .55 * up; zoom(ctx, 1 - .45 * up, 300, 560);
      line(ctx, T, [{ s: 'Just', t: s0 + .05, font: B(92) }, { s: 'this.', t: K.this, font: B(92) }], 160, 570, { align: 'left' }); ctx.restore();
      line(ctx, T, [{ s: 'A', t: K.a, font: B(100) }, { s: 'skill', t: K.skill, font: B(100) }, { s: 'file.', t: K.file, font: B(100), col: BLUE }], 160, 620, { align: 'left' });
      live(ctx, T, 1400, 540, { yaw: .14, bob: 10 }, () => { flipIn(ctx, 1400, 540, p(T, s0, .7, eback)); skillCard(ctx, T, 1400, 540, 520); });
      if (T > K.skill) cursor(ctx, kf(T, [[K.skill, 1700], [K.file + .3, 1560]]), kf(T, [[K.skill, 900], [K.file + .3, 760]]), tap(T, K.file + .3, .25));
    });
  }
  // 5 LAPTOP IN THE SKY: drop the file in, give it one prompt, pick the model, send. "Watch." zooms into the screen.
  { const s0 = A.drop, K = { dropped: c('dropped', s0), claude: c('claude', s0), gave: c('gave', s0), prompt: c('prompt', s0), watch: c('watch', s0), end: A.every };
    const typeA = K.gave - .1, typeB = K.prompt + .1, sendT = K.prompt + .45;
    sfx.push({ t: K.dropped + .5, k: 'pop', g: -13 }, { t: K.claude, k: 'shimmer', g: -16 }, { t: typeB + .1, k: 'tick', g: -16 }, { t: sendT, k: 'click', g: -10 }, { t: K.watch, k: 'riser', g: -15 });
    for (let i = 0; i < 6; i++) sfx.push({ t: typeA + i * (typeB - typeA) / 6, k: 'type', g: -24 });
    add(s0, (ctx, T) => {
      photoBg(ctx, T, 'sky');
      const z = kf(T, [[s0, .92], [K.gave, 1.0], [K.watch, 1.05], [K.end, 2.4]], eio); ctx.save(); zoom(ctx, z, W / 2, 500);
      live(ctx, T, W / 2, 500, { yaw: .03, bob: 8 }, () => laptop(ctx, W / 2, 470, 860, (c2, w, h) => {
        c2.fillStyle = '#f7f7fa'; c2.fillRect(0, 0, w, h);
        logo(c2, w / 2, h * .2, 44, 1, T * .3); c2.fillStyle = INK; c2.font = SANS(700, 26); c2.textAlign = 'center'; c2.fillText('What should we build?', w / 2, h * .32);
        const dropped = T > K.dropped + .5; const pb = promptBox(c2, w * .1, h * .42, w * .8, { txt: PROMPT, n: (T - typeA) / (typeB - typeA) * PROMPT.length, chip: dropped ? { name: 'SKILL.md' } : null, send: tap(T, sendT, .25), s: .9, T });
        const menu = p(T, K.prompt - .5, .25) * (1 - p(T, K.prompt + .05, .2)); modelMenu(c2, w * .62, h * .42 + 120, .8, T > K.prompt - .2 ? 2 : 1, menu);
        if (T > sendT + .2) { c2.fillStyle = `rgba(255,255,255,${p(T, sendT + .2, .3)})`; c2.fillRect(0, 0, w, h); logo(c2, w / 2, h * .45, 70 * p(T, sendT + .2, .4, eback), 1, T * 2); c2.fillStyle = CORAL; c2.font = SANS(700, 26); c2.fillText('Claude is designing…', w / 2, h * .62); }
        if (T > K.dropped && T < sendT + .4) cursor(c2, kf(T, [[K.dropped, w * .3], [K.gave, w * .7], [K.prompt - .4, w * .75], [sendT - .1, pb.sendX]]), kf(T, [[K.dropped, h * .55], [K.gave, h * .7], [K.prompt - .4, h * .74], [sendT - .1, pb.sendY]]), tap(T, sendT, .25), .9);
      }));
      // the file flying into the screen
      const fly = p(T, K.dropped - .1, .7, eio); if (fly < 1) live(ctx, T, lerp(330, W / 2, fly), lerp(560, 420, fly), { yaw: .2, bob: 6 }, () => skillCard(ctx, T, lerp(330, W / 2, fly), lerp(560, 420, fly), lerp(240, 60, fly), 1 - fly * .8));
      ctx.restore();
      const out = 1 - p(T, K.watch + .3, .3);
      pillTag(ctx, 330, 470, 'I dropped it', p(T, K.dropped, .35) * out); pillTag(ctx, 1590, 470, 'into Claude Code', p(T, K.claude, .35) * out);
      pillTag(ctx, W / 2, 900, 'gave it one prompt', p(T, K.gave, .35) * out); pillTag(ctx, 1590, 640, 'Watch.', p(T, K.watch, .3) * (1 - p(T, K.end - .25, .2)), { size: 40 });
    });
  }
  // 6 WEBSITES PEOPLE PAY THOUSANDS FOR: a drifting 3D row of sites with price tags
  { const s0 = A.every, K = { day: c('day', s0), people: c('people', s0), pay: c('pay', s0), thousands: c('thousands', s0), website: c('website', s0), like: c('like', c('website', s0)), end: A.montage };
    const prices = ['$9,500', '$12,000', '$15,000', '$8,000', '$11,000'];
    sfx.push({ t: K.thousands, k: 'data', g: -16 }, { t: K.website, k: 'swoosh', g: -15 });
    add(s0, (ctx, T) => {
      softBg(ctx, T);
      const focus = p(T, K.website - .1, .7, eio), row = [0, 1, 2, 3, 4, 5, 6];
      row.forEach(i => { const x = W / 2 + (i - 3) * 470 - (T - s0) * 60, d = (x - W / 2) / W, ang = d * 1.2, y = 600 + Math.abs(d) * 60, a = 1 - focus * (i === 3 ? 0 : .85);
        if (i === 3 && focus > 0) return; ctx.save(); ctx.filter = focus > 0 && i !== 3 ? `blur(${focus * 8}px)` : 'none'; card3(ctx, WEBS[i], x, y, 420 - Math.abs(d) * 120, ang, a); ctx.restore();
        if (i > 0 && i < 6) badge(ctx, x + 150, y - 140, prices[i - 1], p(T, K.thousands + i * .07, .35, eback) * a); });
      if (focus > 0) { const x = lerp(W / 2 - (T - s0) * 60, W / 2, focus), w = lerp(420, 980, focus);
        live(ctx, T, x, 620, { yaw: .05, bob: 6 }, () => { webCard(ctx, WEBS[3], x, 620, w); badge(ctx, x + w / 2 - 70, 620 - w * .375 - 6, '$12,000', 1); });
        const scan = p(T, K.like, .8, x => x); if (scan > 0 && scan < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sx = x - w / 2 + w * scan, g = ctx.createLinearGradient(sx - 120, 0, sx + 20, 0); g.addColorStop(0, 'rgba(120,150,255,0)'); g.addColorStop(1, 'rgba(160,190,255,.7)'); ctx.fillStyle = g; ctx.fillRect(sx - 120, 620 - w * .375, 140, w * .75); ctx.restore(); } }
      const out = focus;
      ctx.save(); ctx.translate(0, -40 * out); ctx.globalAlpha = 1 - .5 * out;
      line(ctx, T, [{ s: 'Every', t: s0, font: B(56) }, { s: 'day,', t: K.day, font: B(56) }, { s: 'people', t: K.people, font: B(56) }, { s: 'pay', t: K.pay, font: B(56) }, { s: 'thousands', t: K.thousands, font: B(56), col: BLUE }], W / 2, 170); ctx.restore();
      line(ctx, T, [{ s: 'for a', t: K.website - .2, font: B(56) }, { s: 'website', t: K.website, font: B(56) }, { s: 'like', t: K.like, font: B(56) }, { s: 'this.', t: K.like + .25, font: SERIF(64), col: BLUE }], W / 2, 220);
    });
  }
  // 7 BUILD MONTAGE (no voice): reference + prompt -> Claude designs -> code + live build -> deployed
  { const s0 = A.montage, e = A.portf, d = e - s0, t1 = s0 + d * .25, t2 = s0 + d * .32, t3 = s0 + d * .5, t4 = s0 + d * .86;
    sfx.push({ t: t1, k: 'click', g: -10 }, { t: t2, k: 'shimmer', g: -15 }, { t: t3, k: 'data', g: -16 }, { t: t4, k: 'success', g: -13 }); for (let i = 0; i < 5; i++) sfx.push({ t: s0 + .1 + i * d * .04, k: 'type', g: -24 });
    add(s0, (ctx, T) => {
      softBg(ctx, T, 1);
      ctx.save(); zoom(ctx, kf(T, [[s0, 1.08], [t3, 1], [e, 1.05]]), W / 2, H / 2);
      live(ctx, T, W / 2, H / 2, { yaw: .04, bob: 5 }, () => appWindow(ctx, 260, 120, 1400, 840, (c2, x, y, w, h) => {
        if (T < t2) { // reference image + prompt
          webCard(c2, 'web8', x + w / 2, y + 300, 380, 1);
          promptBox(c2, x + 200, y + 540, w - 400, { txt: BUILD, n: (T - s0) / (t1 - s0 - .05) * BUILD.length, chip: { name: 'reference.png', img: 'web8' }, send: tap(T, t1, .25), T });
          cursor(c2, kf(T, [[s0, x + w * .6], [t1 - .1, x + w - 240]]), kf(T, [[s0, y + 660], [t1 - .1, y + 660]]), tap(T, t1, .25));
        } else if (T < t3) { logo(c2, x + w / 2, y + h / 2 - 40, 130 * p(T, t2, .4, eback), 1, T * 1.5); c2.fillStyle = CORAL; c2.font = SANS(700, 44); c2.textAlign = 'center'; c2.fillText('Claude is designing…', x + w / 2, y + h / 2 + 100); }
        else { // code on the left, the site building on the right, steps ticking
          c2.fillStyle = '#16181d'; c2.fillRect(x, y + 50, w * .36, h - 50); c2.font = '500 20px "Cascadia Mono", Consolas, monospace'; c2.textAlign = 'left';
          const code = ['<section class="hero">', '  <h1>Never stop</h1>', '  <video autoplay muted>', '</section>', '.hero { display: grid;', '  place-items: center; }', 'gsap.from(".hero h1", {', '  y: 80, opacity: 0 })'];
          code.forEach((l, i) => { const n = clamp((T - t3) * 90 - i * 22, 0, l.length); c2.fillStyle = ['#c586c0', '#9cdcfe', '#dcdcaa', '#4ec9b0'][i % 4]; c2.fillText(l.slice(0, n), x + 24, y + 110 + i * 34); });
          const bx = x + w * .4, bw = w * .56, rv = p(T, t3, t4 - t3 - .1, x => x); c2.save(); c2.beginPath(); c2.rect(bx, y + 70, bw * 1, (h - 260) * rv); c2.clip(); webCard(c2, 'web2', bx + bw / 2, y + 70 + bw * .375, bw, 1, { shadow: 0 }); c2.restore();
          c2.strokeStyle = 'rgba(80,110,255,.8)'; c2.lineWidth = 3; c2.beginPath(); c2.moveTo(bx, y + 70 + (h - 260) * rv); c2.lineTo(bx + bw, y + 70 + (h - 260) * rv); if (rv < 1) c2.stroke();
          ['Designing layout', 'Writing index.html', 'Shipping to preview'].forEach((st, i) => { const tt = t3 + (t4 - t3) * (i + 1) / 3.2; c2.fillStyle = '#eef0f6'; rr(c2, x + w * .4 + i * 270, y + h - 90, 250, 56, 28); c2.fill();
            c2.fillStyle = INK; c2.font = SANS(600, 20); c2.fillText(st, x + w * .4 + i * 270 + 56, y + h - 55); if (T > tt) check(c2, x + w * .4 + i * 270 + 30, y + h - 62, 14, p(T, tt, .25)); });
          if (T > t4) { c2.save(); c2.globalAlpha = p(T, t4, .3); rr(c2, x + w * .62, y + 66, 220, 48, 24); c2.fillStyle = '#e6f8ec'; c2.fill(); c2.fillStyle = '#1f9d4d'; c2.font = SANS(800, 22); c2.fillText('●  Deployed · live', x + w * .62 + 24, y + 98); c2.restore(); }
        }
      }));
      ctx.restore();
    });
  }
  // 8 THE WALL: Portfolios / Stores / Landing pages in a frosted slot over a moving grid of sites
  { const s0 = A.portf, words = ['Portfolios', 'Stores', 'Landing pages'], ts = [c('portfolios'), c('stores', s0), c('landing', s0)];
    ts.forEach(t => sfx.push({ t, k: 'tick', g: -14 }));
    add(s0, (ctx, T) => {
      ctx.fillStyle = '#eef0f8'; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.filter = 'blur(2px)';
      for (let r = 0; r < 4; r++) for (let k = -1; k < 6; k++) { const dir = r % 2 ? 1 : -1, x = ((k * 420 + dir * (T - s0) * 140 + r * 210) % 2520 + 2520) % 2520 - 300; webCard(ctx, WEBS[(r * 3 + k + 8) % 8], x, 150 + r * 270, 380, 1, { shadow: .4 }); }
      ctx.restore();
      ctx.fillStyle = 'rgba(240,242,250,.35)'; ctx.fillRect(0, 0, W, H);
      const bw = 560, bh = 230, bx = W / 2 - bw / 2, by = H / 2 - bh / 2; ctx.save(); ctx.shadowColor = 'rgba(40,50,90,.25)'; ctx.shadowBlur = 50; rr(ctx, bx, by, bw, bh, 26); ctx.fillStyle = 'rgba(250,250,253,.86)'; ctx.fill(); ctx.restore();
      ctx.strokeStyle = BLUE; ctx.lineWidth = 4; [[bx + 120, by + 70, 1, 1], [bx + bw - 120, by + 70, -1, 1], [bx + 120, by + bh - 70, 1, -1], [bx + bw - 120, by + bh - 70, -1, -1]].forEach(([x, y, sx, sy]) => { ctx.beginPath(); ctx.moveTo(x, y + 26 * sy); ctx.lineTo(x, y); ctx.lineTo(x + 26 * sx, y); ctx.stroke(); });
      let idx = 0; ts.forEach((t, i) => { if (T > t - .15) idx = i; }); const k = eo5(clamp((T - ts[idx] + .15) / .3));
      ctx.save(); rr(ctx, bx, by, bw, bh, 26); ctx.clip(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      [-1, 0, 1].forEach(o => { const i = idx + o; if (i < 0 || i >= words.length) return; 
        const yy = H / 2 + (o + (1 - k)) * 80; ctx.globalAlpha = o === 0 ? 1 : .25; ctx.font = o === 0 ? B(58) : R(38); ctx.fillStyle = INK; ctx.fillText(words[i], W / 2, yy); });
      ctx.restore();
    });
  }
  // 9 PREMIUM WEBSITES IN MINUTES: sites orbit the words in 3D
  { const s0 = A.prem, K = { web: c('websites', s0), min: c('minutes', s0), end: A.brand };
    sfx.push({ t: K.min, k: 'success', g: -14 });
    add(s0, (ctx, T) => {
      softBg(ctx, T);
      const orbit = (front) => WEBS.forEach((nm, i) => { const a = (T - s0) * .55 + i / WEBS.length * Math.PI * 2, z = Math.sin(a); if ((z > 0) !== front) return;
        const x = W / 2 + Math.cos(a) * 760, y = 640 + z * 120, sc = .75 + .3 * z; ctx.save(); ctx.globalAlpha = p(T, s0 + i * .05, .4) * (.55 + .45 * (z + 1) / 2); card3(ctx, nm, x, y, 330 * sc, Math.cos(a) * -.9, 1); ctx.restore(); });
      orbit(false);
      line(ctx, T, [{ s: 'Premium', t: s0 + .05, font: B(104) }, { s: 'websites', t: K.web, font: B(104) }], W / 2, 520);
      line(ctx, T, [{ s: 'in', t: K.min - .25, font: SERIF(96), col: BLUE }, { s: 'minutes.', t: K.min, font: SERIF(96), col: BLUE }], W / 2, 650);
      orbit(true);
    });
  }
  // 10 BRAND CARD (no voice): Claude · Build something beautiful.
  { const s0 = A.brand, end = A.frame;
    sfx.push({ t: s0 + .3, k: 'shimmer', g: -14 });
    add(s0, (ctx, T) => {
      softBg(ctx, T);
      ctx.save(); zoom(ctx, kf(T, [[s0, 1.1], [end, 1]]), W / 2, H / 2);
      logo(ctx, W / 2, 380, 150 * p(T, s0 + .1, .6, eback), 1, (T - s0) * .4);
      line(ctx, T, [{ s: 'Claude', t: s0 + .35, font: B(120) }], W / 2, 600);
      line(ctx, T, [{ s: 'Build something', t: s0 + .8, font: R(44), col: 'rgba(40,44,54,.55)' }, { s: 'beautiful.', t: s0 + 1.2, font: SERIF(60), col: CORAL }], W / 2, 700);
      ctx.restore();
    }, { quiet: false });
  }
  // 11 EVERY FRAME CAME FROM THAT ONE FILE: laptop in the sky shows the brand card; the file links to it
  { const s0 = A.frame, K = { you: c('you', s0), came: c('came', s0), that: c('that', s0), file: c('file', s0), end: A.right };
    sfx.push({ t: K.came - .2, k: 'pop', g: -13 }, { t: K.file, k: 'success', g: -14 });
    add(s0, (ctx, T) => {
      photoBg(ctx, T, 'sky');
      live(ctx, T, 1000, 480, { yaw: .03, bob: 8 }, () => laptop(ctx, 1000, 460, 720, (c2, w, h) => { softBg(c2, T); logo(c2, w / 2, h * .3, 70, 1, T * .4); c2.fillStyle = INK; c2.font = B(60); c2.textAlign = 'center'; c2.fillText('Claude', w / 2, h * .58);
        c2.font = R(24); c2.fillStyle = 'rgba(40,44,54,.55)'; c2.fillText('Build something', w / 2 - 50, h * .7); c2.font = SERIF(30); c2.fillStyle = CORAL; c2.fillText('beautiful.', w / 2 + 120, h * .7); }));
      const fa = p(T, K.came - .3, .5, eback); live(ctx, T, 330, 480, { yaw: .18, bob: 10 }, () => { flipIn(ctx, 330, 480, fa); skillCard(ctx, T, 330, 480, 280, clamp(fa)); });
      if (T > K.came) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 4; ctx.setLineDash([12, 12]); ctx.lineDashOffset = -T * 50; const k = p(T, K.came, .6); ctx.beginPath(); ctx.moveTo(480, 480); ctx.lineTo(lerp(480, 620, k), 480); ctx.stroke(); ctx.restore(); }
      pillTag(ctx, 330, 860, 'Every frame', p(T, s0, .35)); pillTag(ctx, 1000, 900, 'you just watched', p(T, K.you, .35));
      pillTag(ctx, 1600, 420, 'came from', p(T, K.came, .35)); pillTag(ctx, 1600, 510, 'that one skill file.', p(T, K.that, .35));
    });
  }
  // 12 "And right now you're thinking... no way." over a glowing horizon
  { const s0 = A.right, K = { right: c('right', s0), now: c('now', s0), you: c("you're", s0), think: c('thinking', s0), no: c('no', s0), way: c('way', s0) };
    sfx.push({ t: K.no, k: 'riser', g: -16 }, { t: K.way, k: 'pop', g: -10 });
    add(s0, (ctx, T) => {
      spaceBg(ctx, T, .6 + .4 * p(T, K.no, .5));
      line(ctx, T, [{ s: 'And', t: s0 + .05, font: B(52), col: '#fff' }, { s: 'right', t: K.right, font: B(52), col: '#fff' }, { s: 'now', t: K.now, font: B(52), col: '#fff' }, { s: "you're", t: K.you, font: B(52), col: '#fff' }, { s: 'thinking…', t: K.think, font: B(52), col: '#fff' }], W / 2, 380);
      if (T > K.think) { const k = eo(clamp((T - K.think) / .3)); ctx.save(); ctx.font = B(52); const full = ctx.measureText("And right now you're thinking…").width, tw = ctx.measureText('thinking…').width; ctx.fillStyle = 'rgba(70,110,255,.55)'; ctx.fillRect(W / 2 + full / 2 - tw - 8, 330, (tw + 16) * k, 66); ctx.restore(); }
      ctx.save(); zoom(ctx, kf(T, [[K.no, 1.25], [K.no + .4, 1]], eback), W / 2, 560); ctx.shadowColor = 'rgba(120,160,255,.9)'; ctx.shadowBlur = 40;
      line(ctx, T, [{ s: 'no', t: K.no, font: B(170), col: '#fff' }, { s: 'way.', t: K.way, font: B(170), col: '#fff' }], W / 2, 620); ctx.restore();
    }, { dark: true });
  }
  // 13 "Want the skill file?" the card turns in a bright sky
  { const s0 = A.want, K = { skill: c('skill', s0), file: c('file', s0) };
    sfx.push({ t: s0 + .1, k: 'swoosh', g: -14 });
    add(s0, (ctx, T) => {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3f7fe6'); g.addColorStop(1, '#b8d6ff'); ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
      const ang = kf(T, [[s0, -1.3], [K.skill, 0], [A.follow, .25]], eo5); ctx.save(); ctx.translate(W / 2, 470); ctx.transform(Math.max(.05, Math.cos(ang)), Math.sin(ang) * .2, 0, 1, 0, 0); skillCard(ctx, T, 0, 0, 380, 1, { tile: 0 }); ctx.restore();
      line(ctx, T, [{ s: 'Want', t: s0 + .05, font: B(76), col: '#fff' }, { s: 'the', t: c('the', s0), font: B(76), col: '#fff' }, { s: 'skill', t: K.skill, font: B(76), col: '#fff' }, { s: 'file?', t: K.file, font: B(76), col: '#fff' }], W / 2, 930);
    });
  }
  // 14 FOLLOW + COMMENT "SKILL": a post card with no name or picture
  { const s0 = A.follow, K = { me: c('me', s0), comment: c('comment', s0), skill: c('skill', s0), end: A.send };
    const fol = K.me + .1, typ = K.comment + .1, post = Math.min(K.skill + .5, K.end - .25);
    sfx.push({ t: fol, k: 'click', g: -10 }, { t: post, k: 'click', g: -11 }, { t: post + .1, k: 'pop', g: -13 }); for (let i = 0; i < 5; i++) sfx.push({ t: typ + i * .08, k: 'type', g: -22 });
    add(s0, (ctx, T) => {
      softBg(ctx, T);
      line(ctx, T, [{ s: 'Follow', t: s0 + .05, font: B(52) }, { s: 'me', t: K.me, font: B(52) }, { s: 'and', t: c('and', s0), font: B(52) }, { s: 'comment', t: K.comment, font: B(52) }, { s: '"SKILL"', t: K.skill, font: B(52), col: BLUE }], W / 2, 170);
      live(ctx, T, W / 2, 600, { yaw: .04, bob: 6 }, () => { flipIn(ctx, W / 2, 600, p(T, s0, .6, eback));
        const x = W / 2 - 430, y = 290, w = 860, h = 620; ctx.save(); ctx.shadowColor = 'rgba(40,50,90,.22)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20; rr(ctx, x, y, w, h, 28); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
        const fk = p(T, fol, .3); rr(ctx, x + 40, y + 40, w - 80, 66, 16); ctx.fillStyle = fk > .5 ? '#eef0f6' : BLUE; ctx.fill(); ctx.fillStyle = fk > .5 ? INK : '#fff'; ctx.font = B(28); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(fk > .5 ? 'Following ✓' : 'Follow', W / 2, y + 74);
        if (T > fol) { const r = (T - fol) * 900; ctx.save(); ctx.beginPath(); rr(ctx, x + 40, y + 40, w - 80, 66, 16); ctx.clip(); ctx.fillStyle = `rgba(63,95,224,${.25 * (1 - clamp((T - fol) / .6))})`; ctx.beginPath(); ctx.arc(W / 2, y + 74, r, 0, 7); ctx.fill(); ctx.restore(); }
        ['web2', 'web5', 'web8'].forEach((nm, i) => webCard(ctx, nm, x + 40 + 130 + i * 268, y + 250, 254, 1, { shadow: .2, r: 10 }));
        rr(ctx, x + 40, y + h - 130, w - 80, 74, 37); ctx.fillStyle = '#f3f4f8'; ctx.fill(); ctx.strokeStyle = T > K.comment ? BLUE : 'transparent'; ctx.lineWidth = 3; ctx.stroke();
        const n = Math.floor(clamp((T - typ) / .08 + 1, 0, 5)); ctx.textAlign = 'left'; ctx.font = R(28); ctx.fillStyle = n ? INK : 'rgba(40,44,54,.4)'; ctx.fillText(T > post ? 'Add a comment…' : n ? 'SKILL'.slice(0, n) : 'Add a comment…', x + 80, y + h - 92);
        if (T > post) { ctx.save(); ctx.globalAlpha = p(T, post, .3); rr(ctx, x + 40, y + h - 50, 150, 40, 20); ctx.fillStyle = '#eef1ff'; ctx.fill(); ctx.fillStyle = BLUE; ctx.font = B(22); ctx.fillText('💬  SKILL', x + 60, y + h - 29); ctx.restore(); }
        ctx.beginPath(); ctx.arc(x + w - 82, y + h - 93, 24, 0, 7); ctx.fillStyle = n >= 5 ? BLUE : '#c9cdd8'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = B(24); ctx.textAlign = 'center'; ctx.fillText('↑', x + w - 82, y + h - 92);
        const cx = kf(T, [[s0, W / 2 + 200], [fol - .2, W / 2 + 60], [typ, x + 300], [post - .15, x + w - 82]]), cy = kf(T, [[s0, y + 200], [fol - .2, y + 80], [typ, y + h - 90], [post - .15, y + h - 92]]); cursor(ctx, cx, cy, tap(T, fol, .2) + tap(T, post, .2));
      });
    });
  }
  // 15 DM: the comment arrives, the skill file is sent back
  { const s0 = A.send, K = { send: c('send', s0), dms: c('dms', s0), end: A.but };
    sfx.push({ t: K.send, k: 'pop', g: -13 }, { t: K.dms, k: 'success', g: -13 });
    add(s0, (ctx, T) => {
      softBg(ctx, T);
      line(ctx, T, [{ s: "I'll", t: s0 + .05, font: B(52) }, { s: 'send', t: K.send, font: B(52) }, { s: 'the skill file', t: c('the', s0), font: B(52) }, { s: 'to your', t: c('to', s0), font: B(52) }, { s: 'DMs.', t: K.dms, font: B(52), col: BLUE }], W / 2, 170);
      live(ctx, T, W / 2, 600, { yaw: .04, bob: 6 }, () => {
        const x = W / 2 - 430, y = 270, w = 860, h = 640; ctx.save(); ctx.shadowColor = 'rgba(40,50,90,.22)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20; rr(ctx, x, y, w, h, 28); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
        ctx.fillStyle = INK; ctx.font = B(28); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Messages', x + 40, y + 50); ctx.fillStyle = '#eef0f6'; ctx.fillRect(x, y + 92, w, 2);
        pop2(ctx, p(T, s0 + .1, .35, eback), x + w - 120, y + 170, () => { rr(ctx, -80, -30, 160, 60, 30); ctx.fillStyle = BLUE; ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = B(26); ctx.textAlign = 'center'; ctx.fillText('SKILL', 0, 2); });
        if (T < K.send + .2) { for (let i = 0; i < 3; i++) { ctx.fillStyle = `rgba(40,44,54,${.3 + .4 * Math.max(0, Math.sin(T * 8 - i))})`; ctx.beginPath(); ctx.arc(x + 80 + i * 22, y + 280, 7, 0, 7); ctx.fill(); } }
        else { const a = p(T, K.send + .2, .4, eback); pop2(ctx, a, x + 270, y + 360, () => { rr(ctx, -210, -130, 420, 260, 22); ctx.fillStyle = '#f3f4f8'; ctx.fill(); ctx.fillStyle = INK; ctx.font = R(24); ctx.textAlign = 'left'; ctx.fillText("Here's your skill — enjoy! ✨", -186, -92);
          rr(ctx, -186, -50, 372, 150, 16); ctx.fillStyle = '#fff'; ctx.fill(); ctx.save(); ctx.translate(-120, 25); skillCard(ctx, T, 0, 0, 100, 1, { tile: 0 }); ctx.restore(); ctx.fillStyle = INK; ctx.font = B(26); ctx.fillText('SKILL.md', -50, 0); ctx.fillStyle = CORAL; ctx.font = SANS(700, 19); ctx.fillText('Claude Motion Studio', -50, 34); ctx.fillStyle = 'rgba(40,44,54,.45)'; ctx.font = R(16); ctx.fillText('Claude Code skill · 4 KB', -50, 62); }); }
      });
    });
  }
  // 16 "But be quick, only the random 100 members get it free."
  { const s0 = A.but, K = { be: c('be', s0), quick: c('quick', s0), only: c('only', s0), random: c('random', s0), n100: c('100', s0), members: c('members', s0), free: c('free', s0), end: A.after };
    sfx.push({ t: K.quick, k: 'swoosh', g: -12 }, { t: K.n100, k: 'riser', g: -16 }, { t: K.free, k: 'pop', g: -11 });
    add(s0, (ctx, T) => {
      softBg(ctx, T);
      if (T < K.only - .1) {
        line(ctx, T, [{ s: 'But', t: s0 + .05, font: B(120) }, { s: 'be', t: K.be, font: B(120) }, { s: 'quick.', t: K.quick, font: `italic 900 120px Inter, "Segoe UI", Arial`, col: BLUE }], W / 2, 560);
        const bx = kf(T, [[s0, 300], [K.quick, 640], [K.only, 1700]]); buddy(ctx, T, bx, 860, 16, { walk: 1 });
        if (T > K.quick) for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(63,95,224,${.4 - i * .09})`; ctx.fillRect(bx - 110 - i * 50, 800 + i * 14, 40, 6); }
        return;
      }
      line(ctx, T, [{ s: 'Only', t: K.only, font: B(60) }, { s: 'the', t: c('the', K.only), font: B(60) }, { s: 'random', t: K.random, font: B(60), col: BLUE }], W / 2, 220);
      dotNumber(ctx, T, '100', W / 2 + 60, 320, 330, p(T, K.n100 - .15, .9, x => x));
      buddy(ctx, T, 520, 820, 15, { walk: 0 });
      if (T > K.n100 - .2 && T < K.n100 + .7) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const u = (T - K.n100 + .2) * 1.4 + hash(i) * .2, ang = -1.2 + hash(i, 1) * 1.2; ctx.fillStyle = `rgba(120,150,255,${clamp(1 - u)})`; ctx.beginPath(); ctx.arc(560 + Math.cos(ang) * u * 400, 720 + Math.sin(ang) * u * 400, 6, 0, 7); ctx.fill(); } ctx.restore(); }
      line(ctx, T, [{ s: 'members', t: K.members, font: R(48), col: 'rgba(40,44,54,.6)' }], W / 2 + 60, 760);
      if (T > K.free - .2) pop2(ctx, p(T, K.free - .2, .4, eback), W / 2 + 60, 880, () => { ctx.font = B(42); const w = ctx.measureText('get it free.').width + 70; rr(ctx, -w / 2, -42, w, 84, 42); ctx.fillStyle = BLUE; ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('get it free.', 0, 2); });
    });
  }
  // 17 "After that, it's paid." the tag flips FREE -> PAID under a magnifier
  { const s0 = A.after, K = { that: c('that', s0), paid: c('paid', s0), end: A.end };
    sfx.push({ t: K.paid, k: 'shutter', g: -12 });
    add(s0, (ctx, T) => {
      softBg(ctx, T);
      line(ctx, T, [{ s: 'After', t: s0 + .05, font: B(60) }, { s: 'that,', t: K.that, font: B(60) }, { s: "it's", t: c("it's", s0), font: B(60) }, { s: 'paid.', t: K.paid, font: B(60), col: CORAL }], W / 2, 220);
      const fl = p(T, K.paid - .15, .35, eio), ang = fl * Math.PI, paid = ang > Math.PI / 2;
      live(ctx, T, W / 2, 560, { yaw: .03, bob: 6 }, () => { ctx.save(); ctx.translate(W / 2, 560); ctx.scale(Math.max(.03, Math.abs(Math.cos(ang))), 1);
        rr(ctx, -330, -170, 660, 340, 30); ctx.fillStyle = paid ? '#fdf1ea' : '#fff'; ctx.shadowColor = 'rgba(40,50,90,.2)'; ctx.shadowBlur = 50; ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = paid ? CORAL : BLUE; ctx.font = SANS(700, 22); ctx.textAlign = 'left'; ctx.fillText(paid ? 'SKILL.md · after the first 100' : 'SKILL.md · random 100', -290, -120);
        ctx.font = B(170); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(paid ? 'PAID' : 'FREE', 0, 30); ctx.restore(); });
      const mx = kf(T, [[s0, 700], [K.paid - .2, 1150], [K.end, 1050]]), my = 560 + 30 * Math.sin(T * 3);
      ctx.save(); ctx.strokeStyle = '#2a2d38'; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(mx, my, 95, 0, 7); ctx.stroke(); ctx.lineCap = 'round'; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(mx - 70, my + 70); ctx.lineTo(mx - 160, my + 160); ctx.stroke();
      ctx.fillStyle = 'rgba(200,220,255,.18)'; ctx.beginPath(); ctx.arc(mx, my, 88, 0, 7); ctx.fill(); ctx.restore();
      buddy(ctx, T, mx - 210, my + 260, 14, { hat: 0 });
    });
  }
  // 18 END CARD: the skill's name and the call to action (no profile name or picture)
  { const s0 = A.end, K = { skill: c('skill', s0) };
    sfx.push({ t: s0 + .2, k: 'pop', g: -12 }, { t: K.skill + .3, k: 'click', g: -10 });
    add(s0, (ctx, T) => {
      softBg(ctx, T);
      ctx.save(); zoom(ctx, kf(T, [[s0, 1.1], [DURATION, 1]]), W / 2, H / 2);
      logo(ctx, W / 2, 330, 120 * p(T, s0, .5, eback), 1, T * .5);
      line(ctx, T, [{ s: 'Claude', t: s0 + .05, font: B(96) }, { s: 'Motion', t: s0 + .2, font: B(96), col: CORAL }, { s: 'Studio', t: s0 + .35, font: B(96) }], W / 2, 540);
      const bk = p(T, K.skill - .1, .4, eback), pulse = 1 + .04 * Math.sin(T * 6) * clamp(T - K.skill);
      if (bk > 0) { ctx.save(); ctx.translate(W / 2, 680); ctx.scale(bk * pulse, bk * pulse); rr(ctx, -260, -48, 520, 96, 48); const g = ctx.createLinearGradient(-260, 0, 260, 0); g.addColorStop(0, BLUE); g.addColorStop(1, BLUE2); ctx.fillStyle = g; ctx.shadowColor = 'rgba(63,95,224,.45)'; ctx.shadowBlur = 30; ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff'; ctx.font = B(40); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Comment "SKILL"', 0, 2); ctx.restore(); }
      line(ctx, T, [{ s: 'Follow for the free skill · random 100 only', t: K.skill + .3, font: R(26), col: 'rgba(40,44,54,.5)' }], W / 2, 790);
      buddy(ctx, T, W / 2 + 380, 730, 13, { blink: true });
      ctx.restore();
    });
  }
  list.forEach((sc, i) => sc.end = list[i + 1] ? list[i + 1].start : 1e9);
  return { scenes: list, sfx };
}
const pop2 = (ctx, a, x, y, fn) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.scale(a, a); fn(); ctx.restore(); };
