// "How did PewDiePie make an uncensored AI?" (Ajax / abliteration) explainer. All timing from word cues c('phrase', after); drawn in code (ajax.js).
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, hash, rr, alive, flipIn, ring, proj3 } from './lib.js';
import { cursor } from './art.js';
import { img, IMG } from './assets.js';
import { F, SERIF, MONO, COL, txt, bgGrid, glow, card, chip, ajaxMark, ajaxWord, laptop, ajaxSite, notif, ytCard, chatBar, bubble, lockIcon, noSign,
  hfCard, fileIcon, folder, mapTex, texQuad, pin, CL, PTS, axes3, dot, cloud, arrow3, tag, plate, arxivCard, weights, gsmCard, githubCard, scatter, toast,
  smoke, rack, hfSearch, avatar, flame } from './ajax.js';
const kf = (T, keys, e = eio) => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (T < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e((T - t0) / (t1 - t0)); return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u); }
  return keys[keys.length - 1][1];
};
const live = (ctx, T, x, y, o, fn) => { ctx.save(); alive(ctx, T, x, y, o); fn(); ctx.restore(); };
const pop = (ctx, a, x, y, fn, rot = 0) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.rotate(rot * (1 - a)); ctx.scale(a, a); fn(); ctx.restore(); };
const zoom = (ctx, z, x, y) => { ctx.translate(x, y); ctx.scale(z, z); ctx.translate(-x, -y); };
const flip = (ctx, k, x, y, fn) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k * 1.5); flipIn(ctx, x, y, k); fn(); ctx.restore(); };
const sq = x => clamp(x) ** 2, lin = x => clamp(x);
const tap = (T, t0, d = .35) => T < t0 || T > t0 + d ? 0 : Math.sin((T - t0) / d * Math.PI);
const roll = (a, b, k) => lerp(a, b, eo5(k));
const scr = (s, k, T, seed = 0) => s.split('').map((ch, i) => ch === ' ' ? ' ' : (hash(i, seed) < k ? String(Math.floor(hash(i + Math.floor(T * 14), seed + 3) * 10)) : ch)).join('');
// one camera for every point-cloud scene: a slow continuous orbit (yaw keeps turning across scenes)
const YAW = T => .62 + .03 * (T - 50);
const CAM = (T, o = {}) => proj3({ yaw: o.yaw ?? YAW(T), pitch: o.pitch ?? 1.12, dist: o.dist ?? 9, f: o.f ?? 1720, cx: 540, cy: o.cy ?? 1200, tx: o.tx || 0, ty: o.ty || 0 });
const NORM = [0, 1, 2, 3, 4].reduce((a, i) => a.map((v, k) => v + CL[i].c[k] / 5), [0, 0, 0]); NORM[2] = .5;
const RED = CL[5].c;

export const KEYWORDS = 'pewdiepie uncensored no announced own runs openai twice create abliteration open download billions qwen numbers list 4096 coordinates normal updown request map three 3d similar together coding corner 2024 found direction higher hundreds mark refusal change same everything climb perfectly damage study 188 brain tools fewest obviously illegal strange harmful different untouched smoke siren servers 8000 abliterated crazy code guide bio';
export const EMOJI = { no: '🚫', brain: '🧠', coding: '💻', code: '💻', guide: '💬', bio: '🔗', smoke: '🚨' };
export const CAPTION_SFX = false;
// Hinglish voice: same scenes, cues mapped to the words it says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      'this week': 'is hafte', 'and openai': 'aur use banate', 'and i wanted': 'aur main', 'the method': 'is method', 'you take an open': 'aap ek open', 'the billions': 'wo arabon',
      'ajax started': 'ajax qwen', 'computers only': 'computer sirf', 'so qwen turns': 'to qwen', 'on a normal': 'ek normal', here: 'yahan', 'like a 3d': 'jaise ek 3d',
      'and in 2024': 'aur 2024', 'turn the map': 'map ko aise', 'so how do you': 'to us direction', 'then you change': 'phir aap weights', 'everything else': 'ab baaki',
      "but here's the catch": 'lekin yahan', 'in one study': 'ek study', "that's what pewdiepie": 'isi ko', "that's why free": 'isi liye', obviously: 'zaahir',
      "and here's the strange": 'aur yahan ajeeb', 'like a smoke': 'bilkul ek smoke', 'so if your company': 'to agar aapki', 'because over': 'kyunki hugging',
      "and here's the crazy": 'aur sabse crazy', 'if you want': 'agar aap bhi',
      "alibaba's|alibaba": 'alibaba', never: 'kabhi', announced: 'announce', own: 'apna', runs: 'chalta', banned: 'do baar', twice: 'ban kiya', create: 'banta', called: 'naam', calculates: 'calculate',
      list: 'request', 'two numbers': 'do numbers', left: 'left-right', up: 'up-down', 'on a map': 'dimensions', dimensions: 'dete hain', nobody: 'ise koi', three: 'teen',
      'on that map': 'us map', similar: 'milti-julti', together: 'paas', refuses: 'mana', 'one direction': 'ek direction', points: 'upar', higher: 'jitni', 'says no': 'zyada no',
      hundreds: 'saikdon', 'normal ones': 'saikdon normal', middle: 'beech', 'that arrow': 'wahi arrow', 'edit them': 'unhe aise', pressing: 'daba', keeps: 'yaad', climb: 'chadh',
      perfectly: 'poori', flatten: 'dabaya', damage: 'kharaab', dropped: 'scores', '18.8': 'gir', test: 'edit ko', again: 'test', fewest: 'sabse kam', 'least damage': 'nuksaan',
      different: 'alag', untouched: 'chhui', unplugged: 'unplug', 'open model': 'servers', servers: 'chalati', name: 'naam', whole: 'poora',
    },
    keywords: 'pewdiepie uncensored no announce apna chalta openai baar banta abliteration open download arabon qwen numbers list 4096 coordinates normal updown request map teen 3d miltijulti paas coding corner 2024 paaya direction jitni saikdon mark refusal badalte same baaki chadh poori kharaab study 188 brain tools sabse illegal ajeeb harmful alag chhui smoke siren servers 8000 abliterated crazy code guide bio',
    emoji: { no: '🚫', brain: '🧠', coding: '💻', code: '💻', guide: '💬', bio: '🔗', smoke: '🚨' },
  },
};

export function makeScenes(c, lang = 'en') {
  const named = lang !== 'hi'; // Hindi version: profile picture only, no channel name
  const list = [], sfx = [];
  const add = (start, draw, o = {}) => { list.push({ start, light: false, draw, ...o }); if (start > 0) sfx.push({ t: start - .1, k: o.xf === 0 ? 'swoosh' : 'whoosh', g: -19 }); };
  const s = x => x - .1;
  const A = {}; let prev = 0;
  for (const [k, ph] of [['week', 'this week'], ['openai', 'and openai'], ['wanted', 'and i wanted'], ['method', 'the method'], ['open', 'you take an open'], ['billions', 'the billions'], ['ajax2', 'ajax started'],
    ['computers', 'computers only'], ['turns', 'so qwen turns'], ['normal', 'on a normal'], ['here', 'here'], ['like3d', 'like a 3d'], ['y2024', 'and in 2024'], ['turn', 'turn the map'], ['find', 'so how do you'],
    ['change', 'then you change'], ['everything', 'everything else'], ['catch', "but here's the catch"], ['study', 'in one study'], ['pdp', "that's what pewdiepie"], ['tools', "that's why free"],
    ['obviously', 'obviously'], ['strange', "and here's the strange"], ['smoke', 'like a smoke'], ['company', 'so if your company'], ['because', 'because over'], ['crazy', "and here's the crazy"], ['ifyou', 'if you want']]) {
    prev = c(ph, prev); A[k] = s(prev);
  }

  // 1 HOOK (dark): PewDiePie behind a glowing Qwen logo; the logo shatters around a red 🚫; other AIs say no
  { const K = { unc: c('uncensored'), never: c('never') }; K.no = c('no', K.never);
    sfx.push({ t: .05, k: 'riser', g: -18 }, { t: .3, k: 'pop', g: -12 }, { t: K.unc, k: 'shatter', g: -10 }, { t: K.never - .05, k: 'pop', g: -15 }, { t: K.no, k: 'glitch', g: -14 });
    add(0, (ctx, T) => {
      bgGrid(ctx, T, false);
      // red light rays
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(540, 1240); ctx.rotate(T * .12);
      const ra = p(T, .1, .6) * (.7 + .3 * p(T, K.unc, .3));
      for (let i = 0; i < 18; i++) { ctx.rotate(Math.PI * 2 / 18); const g = ctx.createLinearGradient(0, 0, 0, -900); g.addColorStop(0, `rgba(255,50,50,${.22 * ra})`); g.addColorStop(1, 'rgba(255,50,50,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-40 - 30 * hash(i), -900); ctx.lineTo(40 + 30 * hash(i), -900); ctx.fill(); }
      ctx.restore(); glow(ctx, 540, 1240, 620, COL.red, .7 * ra);
      // PewDiePie
      const pz = kf(T, [[0, 1.12], [K.no + 1, 1.0]]);
      live(ctx, T, 540, 960, { yaw: .03, bob: 5, seed: 1 }, () => { ctx.save(); zoom(ctx, pz, 540, 1100);
        ctx.globalAlpha = p(T, 0, .4); const h = img(ctx, 'pdp_cut', 540, 900, 760);
        const g = ctx.createLinearGradient(0, 1050, 0, 900 + h / 2); g.addColorStop(0, 'rgba(15,16,18,0)'); g.addColorStop(1, 'rgba(15,16,18,1)'); ctx.fillStyle = g; ctx.fillRect(100, 1050, 880, h / 2 - 150 + 4);
        ctx.restore(); });
      // Qwen logo -> 3 shards
      const k0 = p(T, .25, .55, eback), sh = p(T, K.unc - .05, .6, eo5), q = IMG.qwen;
      if (k0 > 0 && q) for (let i = 0; i < 3; i++) {
        const a0 = -Math.PI / 2 + i * 2 * Math.PI / 3, mid = a0 + Math.PI / 3, d = 190 * sh;
        ctx.save(); ctx.translate(540 + Math.cos(mid) * d, 1250 + Math.sin(mid) * d + 8 * Math.sin(T * 2 + i)); ctx.rotate(sh * (.25 + .1 * Math.sin(T + i)) * (i - 1)); ctx.scale(k0, k0);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 400, a0, a0 + 2 * Math.PI / 3); ctx.closePath(); ctx.clip();
        ctx.shadowColor = 'rgba(120,90,255,.8)'; ctx.shadowBlur = 50; img(ctx, 'qwen', 0, 0, 420); ctx.restore();
      }
      noSign(ctx, 540, 1250, 95 * p(T, K.unc + .1, .4, eback), p(T, K.unc + .1, .2), T);
      // other assistants refuse
      const ba = p(T, K.never - .1, .35, eback);
      [['openai_white', "I can't help with that.", 250, 1620], ['claude', "I can't assist with that.", 830, 1700]].forEach(([lg, t2, x, y], i) => pop(ctx, p(T, K.never - .1 + i * .18, .35, eback), x, y + 6 * Math.sin(T * 2 + i), () => {
        bubble(ctx, 0, 0, t2, { size: 26, align: 'center', icon: (ix, iy) => img(ctx, lg, ix, iy, 30), fg: '#ffb4b4' });
        if (T > K.no) { ctx.strokeStyle = `rgba(${COL.red},${p(T, K.no, .2)})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-170, 0); ctx.lineTo(-170 + 340 * p(T, K.no, .25), 0); ctx.stroke(); }
      }));
      if (ba <= 0) return;
    });
  }
  // 2 ANNOUNCE (light, hard cut): photo card + YouTube notice; Ajax emblem + wordmark; sinks into a laptop
  const LX = 540, LY = 1130, LW = 860; // laptop shared by scenes 2-4
  const screenXY = (u, v) => { const sw = LW - 2 * LW * .028, sh = LW * .64 - 2 * LW * .028; return [LX - sw / 2 + sw * u, LY - sh / 2 + sh * v, sh]; };
  { const s0 = A.week, K = { ann: c('announced', s0), ajax: c('ajax', s0) }; K.own = c('own', K.ajax); K.runs = c('runs', K.own);
    sfx.push({ t: K.ann, k: 'swoosh', g: -16 }, { t: K.ann + .2, k: 'pop', g: -14 }, { t: K.own, k: 'pop', g: -12 }, { t: K.runs, k: 'sweep', g: -16 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, true);
      const ph = 1 - p(T, K.own - .2, .45), lp = p(T, K.runs - .1, .7, eo5);
      // photo card (Ken Burns on the room shot)
      if (ph > 0) live(ctx, T, 540, 1000, { yaw: .05, bob: 6, seed: 2 }, () => { ctx.save(); ctx.globalAlpha *= ph; const k = p(T, s0, .5, eback); ctx.translate(540, 1000); ctx.scale(.85 + .15 * k, .85 + .15 * k); ctx.translate(-540, -1000);
        card(ctx, 200, 640, 680, 720, { r: 40 }); ctx.save(); rr(ctx, 212, 652, 656, 696, 32); ctx.clip(); const z = 1.15 + .1 * (T - s0) / 4; const r0 = IMG.pdp_room;
        if (r0) { const w0 = 656 * z * 1.5, h0 = w0 * r0.height / r0.width; ctx.drawImage(r0, 540 - w0 * .55 - (T - s0) * 6, 1000 - h0 * .45, w0, h0); } ctx.restore(); ctx.restore(); });
      ytCard(ctx, 540, lerp(1800, 1480, p(T, K.ann, .5, eo5)), 900, p(T, K.ann, .3) * ph);
      // emblem: left of photo -> centre with wordmark -> into the laptop screen
      const [sx, sy, sh] = screenXY(.33, .38), [wx, wy] = screenXY(.41, .44);
      const ex = kf(T, [[s0, 170], [K.own - .2, 170], [K.own + .3, 330], [K.runs - .1, 330], [K.runs + .6, sx]]), ey = kf(T, [[s0, 700], [K.own - .2, 700], [K.own + .3, 960], [K.runs - .1, 960], [K.runs + .6, sy]]);
      const es = kf(T, [[s0, 150], [K.own - .2, 150], [K.own + .3, 230], [K.runs - .1, 230], [K.runs + .6, sh * .2]]);
      laptop(ctx, LX, lerp(2100, LY, lp), LW, (c2, w, h) => { ajaxSite(c2, w, h, T, p(T, K.runs + .5, .3)); }, { a: lp });
      ctx.save(); ctx.globalAlpha *= 1 - p(T, K.runs + .5, .3);
      live(ctx, T, ex, ey, { yaw: .25, bob: 8 * (1 - lp), seed: 3 }, () => ajaxMark(ctx, ex, ey, es * p(T, s0 + .1, .5, eback), { depth: .12 * (1 - lp), T }));
      const wa = p(T, K.own, .4) ; ctx.globalAlpha *= wa; ajaxWord(ctx, lerp(lerp(560, 460, eo(wa)), wx, lp), lerp(1010, wy, lp), lerp(190, sh * .17, lp));
      ctx.restore();
    }, { light: true, xf: 0, flash: true });
  }
  // 3 OPENAI (light): the OpenAI logo stamps the laptop, "deactivated" notifications stack twice, the real email flips in
  { const s0 = A.openai, K = { logo: c('openai', s0) }; K.ban = c('banned', K.logo); K.twice = c('twice', K.ban);
    sfx.push({ t: K.logo + .25, k: 'drip', g: -10 }, { t: K.ban, k: 'pop', g: -12 }, { t: K.twice, k: 'pop', g: -12 }, { t: K.twice + .5, k: 'shutter', g: -16 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, true);
      laptop(ctx, LX, LY, LW, (c2, w, h) => { ajaxSite(c2, w, h, T); const d = p(T, K.ban, .4) * .35; c2.fillStyle = `rgba(0,0,0,${d})`; c2.fillRect(0, 0, w, h); });
      // logo stamp: drops, squashes, then shrinks away into the notification icon
      const dk = p(T, K.logo - .15, .4, sq), sqz = tap(T, K.logo + .25, .3), out = p(T, K.ban - .25, .3);
      if (dk > 0 && out < 1) { ctx.save(); ctx.globalAlpha = 1 - out; const y = lerp(300, 1010, dk); ctx.translate(540, y); ctx.scale(1 + .25 * sqz, 1 - .25 * sqz); ctx.scale(1 - .7 * out, 1 - .7 * out);
        ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 40; ctx.beginPath(); ctx.arc(0, 0, 150, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent'; img(ctx, 'openai_black', 0, 0, 200); ctx.restore();
        if (T > K.logo + .25) ring(ctx, 540, 1010, (T - K.logo - .25) * 1.5, '0,0,0', 150, 330); }
      // two stacked notifications
      const n1 = p(T, K.ban, .45, eo5), n2 = p(T, K.twice, .45, eo5);
      const y1 = lerp(500, 690, n1) + 30 * n2;
      notif(ctx, 540, y1, lerp(880, 820, n2), { body: 'Your OpenAI account has been deactivated', a: n1 * (1 - .25 * n2) });
      notif(ctx, 540, lerp(500, 660, n2), 880, { body: 'Your OpenAI account has been deactivated', a: n2 });
      // the actual email (user asset) flips in, tilted, over the bottom of the laptop
      const ek = p(T, K.twice + .5, .6, eo5);
      flip(ctx, ek, 760, 1440, () => live(ctx, T, 760, 1440, { yaw: .06, bob: 6, seed: 4 }, () => { ctx.save(); ctx.translate(760, 1440); ctx.rotate(.05); ctx.translate(-760, -1440);
        ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; ctx.fillStyle = '#fff'; ctx.fillRect(560, 1170, 400, 553); ctx.shadowColor = 'transparent'; img(ctx, 'email', 760, 1446, 400); ctx.restore(); }));
    }, { light: true });
  }
  // 4 CREATE (light): the laptop slides down, the 3D emblem rises and explodes around a data cube
  { const s0 = A.wanted, K = { create: c('create', s0) };
    sfx.push({ t: s0 + .2, k: 'swoosh', g: -16 }, { t: K.create, k: 'shatter', g: -12 }, { t: K.create + .05, k: 'data', g: -18 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, true);
      const d = p(T, s0, .8, eio); laptop(ctx, LX, LY + 950 * d, LW, (c2, w, h) => ajaxSite(c2, w, h, T), { a: 1 - d });
      const up = p(T, s0 + .15, .8, eo5), ex = p(T, K.create - .05, .9, eo5), y = lerp(1300, 1020, up);
      // data cube revealed inside
      if (ex > 0) { ctx.save(); ctx.globalAlpha = clamp(ex * 1.5); ctx.translate(540, y); ctx.rotate(.15 * Math.sin(T * .8)); const s = 150 * (.6 + .4 * ex);
        const faces = [[[0, -s], [s * .87, -s / 2], [0, 0], [-s * .87, -s / 2], '#2a2c31'], [[-s * .87, -s / 2], [0, 0], [0, s], [-s * .87, s / 2], '#17181b'], [[0, 0], [s * .87, -s / 2], [s * .87, s / 2], [0, s], '#0e0f11']];
        faces.forEach(([a, b, c2, d2, col], fi) => { ctx.save(); ctx.beginPath(); [a, b, c2, d2].forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.clip();
          ctx.font = MONO(14, 600); ctx.fillStyle = 'rgba(160,255,200,.55)'; for (let r = 0; r < 22; r++) ctx.fillText(scr('0110 1010 0111 0010 1101 0011', 1, T * .5 + r, fi * 9 + r).slice(0, 24), -s, -s + r * 14); ctx.restore(); });
        ctx.restore(); }
      live(ctx, T, 540, y, { yaw: .35, bob: 10, seed: 5 }, () => ajaxMark(ctx, 540, y, 330 * (.7 + .3 * up), { depth: .16, explode: ex * (1 + .08 * Math.sin(T * 1.5)), T, col: '#161616', side: '#4a4b50' }));
      glow(ctx, 540, y, 300, '120,140,255', .25 * ex);
    }, { light: true });
  }
  // 5 METHOD (light): "ablate" + "obliterate" merge into "abliteration"
  { const s0 = A.method, K = { called: c('called', s0), abl: c('abliteration', s0) };
    sfx.push({ t: s0 + .1, k: 'pop', g: -15 }, { t: K.called, k: 'pop', g: -15 }, { t: K.abl - .1, k: 'swoosh', g: -14 }, { t: K.abl + .3, k: 'shimmer', g: -14 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, true);
      const m = p(T, K.abl - .15, .6, eio), a1 = p(T, s0 + .05, .4), a2 = p(T, K.called - .1, .4);
      ctx.save(); ctx.filter = m > .02 ? `blur(${10 * m}px)` : 'none';
      ctx.globalAlpha = a1 * (1 - m); txt(ctx, 'ablate', lerp(lerp(130, 160, a1), 330, m), lerp(970, 1040, m), SERIF(150), '#141414', 'left');
      ctx.globalAlpha = a2 * (1 - m); txt(ctx, 'obliterate', lerp(lerp(260, 190, a2), 330, m), lerp(1150, 1040, m), SERIF(150), '#141414', 'left');
      ctx.globalAlpha = a2 * (1 - m); txt(ctx, '+', 100, 1075, F(300, 60), '#999', 'center');
      ctx.restore();
      const k = p(T, K.abl - .05, .6, eo5); if (k > 0) live(ctx, T, 540, 1040, { yaw: .05, bob: 6, seed: 6 }, () => {
        ctx.save(); ctx.globalAlpha = k; ctx.filter = k < 1 ? `blur(${(1 - k) * 8}px)` : 'none'; txt(ctx, 'abliteration', 540, 1060, SERIF(lerp(120, 132, k)), '#141414'); ctx.filter = 'none';
        txt(ctx, 'ablate  +  obliterate', 540, 1150, MONO(30), '#888'); ctx.restore(); });
    }, { light: true });
  }
  // 6 HUGGING FACE (light): open model card, apache-2.0, files tab, files fly into Downloads
  { const s0 = A.open, K = { open: c('open', s0) }; K.w = c('weights', K.open); K.dl = c('download', K.w);
    sfx.push({ t: s0 + .05, k: 'pop', g: -14 }, { t: K.open, k: 'tick', g: -12 }, { t: K.w, k: 'click', g: -12 }, { t: K.dl, k: 'sweep', g: -15 }); for (let i = 0; i < 4; i++) sfx.push({ t: K.dl + .2 + i * .15, k: 'tick', g: -20 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, true);
      const k = p(T, s0, .6, eo5), cy = kf(T, [[K.dl - .1, 720], [K.dl + .5, 640]]);
      flip(ctx, k, 540, 1000, () => live(ctx, T, 540, 1000, { yaw: .04, bob: 6, seed: 7 }, () => hfCard(ctx, 90, cy, 900, T, { tab: p(T, K.w, .35, eio), lic: p(T, K.open, .3), files: p(T, K.dl + .1, .8, lin) })));
      // files fly into the folder
      const fy = 1560, fx = 330, fa = p(T, K.dl - .1, .4);
      for (let i = 0; i < 4; i++) { const t0 = K.dl + .15 + i * .14, u = p(T, t0, .55, eio); if (u <= 0 || u >= 1) continue;
        const x0 = 300 + i * 90, y0 = cy + 430 + i * 50, x = lerp(x0, fx, u), y = lerp(y0, fy, u) - Math.sin(u * Math.PI) * 220; fileIcon(ctx, x, y, 90 * (1 - .4 * u), (u - .5) * .8, 1 - u * .3); }
      const gb = 19.3 * p(T, K.dl + .3, 1.4, eo); folder(ctx, fx, fy, 130, gb, fa, tap(T, K.dl + .6, .3) + tap(T, K.dl + .9, .3));
    }, { light: true });
  }
  // 7 BILLIONS (light): 9,000,000,000 counter over a perspective sea of weight decimals
  { const s0 = A.billions, K = { calc: c('calculates', s0) };
    sfx.push({ t: s0 + .1, k: 'stopwatch', g: -20 }, { t: K.calc, k: 'data', g: -18 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, true);
      // sea of numbers receding to a horizon
      const hy = 980, sp = (T - s0) * .8;
      ctx.save(); ctx.beginPath(); ctx.rect(0, hy, W, H - hy); ctx.clip();
      for (let r = 0; r < 26; r++) { const zr = r + 1 - (sp % 1), z = .5 + zr * .45, y = hy + 560 / z, sz = 40 / z, ri = r + Math.floor(sp);
        if (y > H + 40) continue; const a = clamp(1.5 - z / 8) * p(T, s0, .6);
        for (let c2 = -6; c2 <= 6; c2++) { const x = 540 + c2 * 260 / z, v = (hash(c2 + 20, ri) - .5) * .2;
          txt(ctx, (v >= 0 ? '' : '-') + Math.abs(v).toFixed(4), x, y, MONO(sz, 500), `rgba(40,44,52,${a * .85})`); } }
      ctx.restore();
      const g = ctx.createLinearGradient(0, hy, 0, hy + 200); g.addColorStop(0, 'rgba(244,244,242,1)'); g.addColorStop(1, 'rgba(244,244,242,0)'); ctx.fillStyle = g; ctx.fillRect(0, hy - 2, W, 200);
      const k = p(T, s0, 1.3, eo5), n = Math.round(9e9 * k / 1e7) * 1e7;
      live(ctx, T, 540, 780, { yaw: .03, bob: 5, seed: 8 }, () => { txt(ctx, n.toLocaleString('en-US'), 540, 800, F(900, 116), '#111'); txt(ctx, 'numbers in the model', 540, 866, F(600, 34), '#666'); });
    }, { light: true });
  }
  // 8 QWEN (light): Ajax lands on top of the Qwen logo
  { const s0 = A.ajax2, K = { qwen: c('qwen', s0) }; K.ali = c("alibaba's|alibaba", K.qwen);
    sfx.push({ t: s0 + .1, k: 'pop', g: -14 }, { t: K.qwen + .3, k: 'drip', g: -10 }, { t: K.ali, k: 'pop', g: -15 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, true);
      const qk = p(T, s0, .5, eback);
      live(ctx, T, 540, 1180, { yaw: .2, bob: 8, seed: 9 }, () => pop(ctx, qk, 540, 1180, () => { ctx.shadowColor = 'rgba(90,70,255,.35)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20; img(ctx, 'qwen', 0, 0, 440); }));
      const dk = p(T, K.qwen - .1, .45, sq), land = tap(T, K.qwen + .3, .3), y = lerp(500, 840, dk);
      if (dk > 0) live(ctx, T, 540, y, { yaw: .3, bob: 4, seed: 10 }, () => { ctx.save(); ctx.translate(540, y); ctx.scale(1 + .2 * land, 1 - .2 * land); ajaxMark(ctx, 0, 0, 170, { depth: .14, T }); ctx.restore(); });
      const tk = p(T, K.ali - .1, .5, eo5); ctx.save(); ctx.globalAlpha = tk; ctx.translate(0, 30 * (1 - tk));
      txt(ctx, 'Qwen3.5-9B', 540, 1520, F(900, 64), '#111'); txt(ctx, 'by Alibaba · ', 470, 1580, F(500, 32), '#666', 'center'); txt(ctx, 'open weights', 660, 1580, F(800, 32), '#111', 'center');
      ctx.fillStyle = '#111'; ctx.fillRect(570, 1588, 180 * p(T, K.ali + .2, .4), 3); ctx.restore();
    }, { light: true });
  }
  // 9 NUMBERS (dark): the request types in, then scrambles into digits
  { const s0 = A.computers, K = { num: c('numbers', s0) };
    sfx.push({ t: K.num, k: 'glitch', g: -16 }); for (let i = 0; i < 6; i++) sfx.push({ t: s0 + .1 + i * .14, k: 'type', g: -22 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, false);
      const q = 'Best carbonara recipe?', n = Math.floor(clamp((T - s0 - .05) / .045, 0, q.length)), sk = p(T, K.num, .7, lin);
      glow(ctx, 540, 1060, 500, '120,100,255', .25);
      live(ctx, T, 540, 1060, { yaw: .03, bob: 6, seed: 11 }, () => chatBar(ctx, 540, 1060, 880, sk > 0 ? scr(q, sk, T, 4) : q.slice(0, n), T, { a: p(T, s0, .3), caret: sk < 1 }));
    });
  }
  // 10 LIST (dark): counter 2 -> 4,096 numbers, grid fills, zoom into the first coordinates
  { const s0 = A.turns, K = { list: c('list', s0), n: c('4,096', s0) }; K.coord = c('coordinates', K.n);
    sfx.push({ t: K.list, k: 'pop', g: -15 }, { t: K.list + .1, k: 'data', g: -18 }, { t: K.coord, k: 'swoosh', g: -15 }, { t: K.coord + .3, k: 'tick', g: -14 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, false);
      const lk = p(T, K.list - .1, .4), cnt = Math.round(roll(2, 4096, clamp((T - K.list) / Math.max(.6, K.n + .5 - K.list)))), co = p(T, K.coord - .1, .6, eio);
      // chat bar lifts away; Qwen glows
      chatBar(ctx, 540, lerp(1060, 820, p(T, s0, .6)), 880, scr('Best carbonara recipe?', 1, T, 4), T, { a: 1 - p(T, s0 + .2, .4), caret: false });
      ctx.save(); ctx.globalAlpha = (1 - lk) * p(T, s0 + .2, .4); glow(ctx, 540, 1150, 260, '120,100,255', 1); img(ctx, 'qwen', 540, 1150, 170); ctx.restore();
      // header counter
      const hx = lerp(540, 380, lk); ctx.save(); ctx.globalAlpha = lk * (1 - .5 * co); img(ctx, 'qwen', hx - 40, 600, 56);
      txt(ctx, cnt.toLocaleString('en-US'), hx + 4, 620, F(900, 58), '#fff', 'left'); ctx.font = F(900, 58); txt(ctx, 'numbers', hx + 18 + ctx.measureText(cnt.toLocaleString('en-US')).width, 618, F(600, 30), '#9aa0aa', 'left'); ctx.restore();
      // dense grid: 64 x 64 cells, filled top-down
      if (lk > 0 && co < 1) { ctx.save(); ctx.globalAlpha = lk * (1 - co); const gx = 170, gy = 700, gs = 740, n = 64, cs = gs / n;
        for (let i = 0; i < cnt; i++) { const r = Math.floor(i / n), cc = i % n, v = hash(i, 5); ctx.fillStyle = `rgba(230,234,242,${.25 + .55 * v})`; ctx.fillRect(gx + cc * cs + 1, gy + r * cs + 1, cs - 3, cs * .55); }
        ctx.restore(); }
      // zoom into the first cells: two coordinates
      if (co > 0) { ctx.save(); ctx.globalAlpha = co; const vals = []; for (let i = 0; i < 36; i++) vals.push(i === 0 ? '0.31' : i === 1 ? '-0.47' : ((hash(i, 6) - .5) * 1.9).toFixed(2));
        vals.forEach((v, i) => { const r = Math.floor(i / 6), cc = i % 6, x = 225 + cc * 126, y = 900 + r * 92, first = i < 2, f = clamp(1 - (r + cc) * .12);
          if (first) { rr(ctx, x - 58, y - 44, 116, 64, 14); ctx.fillStyle = 'rgba(30,32,38,.95)'; ctx.fill(); ctx.strokeStyle = `rgba(255,255,255,${.4 + .3 * Math.sin(T * 4)})`; ctx.lineWidth = 2.5; ctx.stroke(); }
          txt(ctx, v, x, y, MONO(first ? 34 : 30, first ? 700 : 500), first ? '#fff' : `rgba(200,206,216,${.15 + .4 * f})`); });
        ctx.restore(); }
    });
  }
  // 11 MAP (dark): city map, x/y chips, left-right and up-down axes, crosshair to the point
  const PU = .655, PV = .735;
  { const s0 = A.normal, K = { two: c('two numbers', s0) }; K.left = c('left', K.two); K.up = c('up', K.left);
    sfx.push({ t: s0 + .05, k: 'pop', g: -14 }, { t: K.two, k: 'tick', g: -14 }, { t: K.left, k: 'swoosh', g: -16 }, { t: K.up, k: 'swoosh', g: -16 }, { t: K.up + .4, k: 'click', g: -12 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, false);
      const k = p(T, s0, .6, eo5), mx = 170, my = 640, ms = 740;
      flip(ctx, k, 540, 1010, () => live(ctx, T, 540, 1010, { yaw: .05, bob: 6, seed: 12 }, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20; rr(ctx, mx, my, ms, ms, 16); ctx.fillStyle = '#efe9da'; ctx.fill(); ctx.restore();
        ctx.save(); rr(ctx, mx, my, ms, ms, 16); ctx.clip(); ctx.drawImage(mapTex(), mx, my, ms, ms); ctx.restore();
        const la = p(T, K.left, .5, eio), ua = p(T, K.up, .5, eio), px = mx + ms * PU, py = my + ms * PV;
        ctx.lineCap = 'round';
        if (la > 0) { ctx.strokeStyle = '#7aa7ff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(mx, my - 24); ctx.lineTo(mx + ms * la, my - 24); ctx.stroke(); txt(ctx, 'left-right', mx + 20, my - 44, F(700, 26), '#9cc0ff', 'left');
          ctx.globalAlpha = la; ctx.strokeStyle = '#4c7dff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px, my - 24); ctx.lineTo(px, lerp(my - 24, py, ua)); ctx.stroke(); ctx.globalAlpha = 1;
          chip(ctx, px, my - 70, 'x 0.31', { bg: '#1c1e24', fg: '#fff', size: 24, mono: true, align: 'center', border: '#4c7dff' }); }
        if (ua > 0) { ctx.strokeStyle = '#7aa7ff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(mx - 24, my); ctx.lineTo(mx - 24, my + ms * ua); ctx.stroke();
          ctx.save(); ctx.translate(mx - 44, my + 20); ctx.rotate(-Math.PI / 2); txt(ctx, 'up-down', -100, 0, F(700, 26), '#9cc0ff', 'center'); ctx.restore();
          ctx.strokeStyle = '#4c7dff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(mx - 24, py); ctx.lineTo(lerp(mx - 24, px, ua), py); ctx.stroke();
          chip(ctx, mx - 30, py + 52, 'y -0.47', { bg: '#1c1e24', fg: '#fff', size: 24, mono: true, align: 'center', border: '#4c7dff' }); }
        const pa = p(T, K.up + .35, .35, eback); if (pa > 0) { pin(ctx, px, py, 1.2 * pa); if (T > K.up + .4) ring(ctx, px, py, ((T - K.up - .4) % 1.2) / 1.2, '255,255,255', 10, 70); }
      }));
      const ca = p(T, K.two, .4, eback) * (1 - p(T, K.left + .2, .4));
      pop(ctx, ca, 540, 1460, () => { chip(ctx, -150, 0, 'x 0.31', { bg: '#1c1e24', fg: '#fff', size: 30, mono: true, border: '#555' }); chip(ctx, 20, 0, 'y -0.47', { bg: '#1c1e24', fg: '#fff', size: 30, mono: true, border: '#555' }); });
    });
  }
  // 12 DIMENSIONS (dark): the map tilts into 3D; dimension lines explode 2 -> 4,096, then shrink to 3
  { const s0 = A.here, K = { n17: c('numbers', s0) }; K.n118 = c('request', K.n17); K.n803 = c('on a map', K.n118); K.n4096 = c('dimensions', K.n803); K.nobody = c('nobody', K.n4096); K.three = c('three', K.nobody);
    sfx.push({ t: s0, k: 'swoosh', g: -15 }, { t: K.n17, k: 'tick', g: -14 }, { t: K.n118, k: 'tick', g: -13 }, { t: K.n803, k: 'riser', g: -16 }, { t: K.n4096, k: 'shimmer', g: -12 }, { t: K.three, k: 'swoosh', g: -13 });
    const DIR = []; for (let i = 0; i < 700; i++) { const u = hash(i, 31) * 2 - 1, a = hash(i, 32) * 6.283, r = Math.sqrt(1 - u * u); DIR.push([r * Math.cos(a), r * Math.sin(a), u, .9 + 1.8 * hash(i, 33)]); }
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, false);
      const tilt = p(T, s0, .9, eio), P = proj3({ yaw: lerp(0, .7, tilt) + .03 * (T - s0), pitch: lerp(0.001, 1.0, tilt), dist: 9, f: lerp(1700, 1500, tilt), cx: 540, cy: 1080 });
      const q = (u, v) => P(lerp(-2.2, 2.2, u), lerp(2.2, -2.2, v), 0);
      texQuad(ctx, mapTex(), q, 9, .85 - .25 * p(T, K.n803, .5) + .25 * p(T, K.three, .5));
      const o = P((PU - .5) * 4.4, -(PV - .5) * 4.4, 0);
      const cnt = T < K.n17 ? 2 : T < K.n118 ? Math.round(roll(2, 17, (T - K.n17) / .5)) : T < K.n803 ? Math.round(roll(17, 118, (T - K.n118) / .5)) : T < K.n4096 ? Math.round(roll(118, 803, (T - K.n803) / .6)) : T < K.three ? Math.round(roll(803, 4096, (T - K.n4096) / .7)) : 3;
      const ok = p(T, s0 + .4, .4), col = p(T, K.three, .5, eio);
      const pw = [(PU - .5) * 4.4, -(PV - .5) * 4.4, 0];
      // main axes: x (orange), y (blue), z (green appears at "three")
      if (o) { [[[3, 0, 0], '255,170,90'], [[0, 3, 0], '110,150,255'], [[0, 0, 3], '90,230,150']].forEach(([d, rgb], ai) => {
        const al = ai < 2 ? ok : Math.max(clamp(cnt / 17), col); if (al <= 0) return;
        const a2 = P(pw[0] - d[0], pw[1] - d[1], pw[2] - (ai === 2 ? 0 : d[2])), b2 = P(pw[0] + d[0], pw[1] + d[1], pw[2] + d[2]); if (!a2 || !b2) return;
        ctx.save(); ctx.globalAlpha = al; ctx.strokeStyle = `rgba(${rgb},.9)`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(a2[0], a2[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke(); ctx.restore(); });
        // dimension burst
        const nl = T < K.three ? Math.min(DIR.length, Math.max(0, cnt - 3)) : Math.floor(DIR.length * (1 - col)) * (cnt > 3 ? 1 : 0) + (T >= K.three ? Math.floor(DIR.length * (1 - col)) : 0);
        const shown = T < K.three ? nl : Math.floor(DIR.length * (1 - col));
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        for (let i = 0; i < shown; i++) { const [dx, dy, dz, L] = DIR[i], grow = T < K.three ? clamp((T - (i < 14 ? K.n17 : i < 115 ? K.n118 : i < 800 ? K.n803 : K.n4096)) / .5) : 1 - col, l = L * grow;
          const b2 = P(pw[0] + dx * l, pw[1] + dy * l, pw[2] + dz * l); if (!b2) continue; const rgb = i % 11 === 0 ? '255,190,120' : i % 13 === 0 ? '140,170,255' : '235,238,255';
          ctx.strokeStyle = `rgba(${rgb},${.18 + .3 * hash(i, 34)})`; ctx.lineWidth = 1.5 + (i < 14 ? 1.5 : 0); ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke();
          if (i < 14 && T < K.n803) txt(ctx, String(i + 4), b2[0], b2[1], F(600, 18), 'rgba(255,255,255,.7)'); }
        ctx.restore();
        glow(ctx, o[0], o[1], 140 + 200 * clamp(cnt / 4096), '200,210,255', clamp(cnt / 800) * (1 - col));
        pin(ctx, o[0], o[1], 1.1, ok);
        bubble(ctx, o[0] - 40, o[1] - 120, 'Best carbonara recipe?', { a: ok, size: 26, align: 'right' }); }
      // counter
      ctx.save(); ctx.globalAlpha = ok; txt(ctx, cnt.toLocaleString('en-US'), 520, 1620, F(900, 76), '#fff', 'right'); txt(ctx, 'dimensions', 540, 1618, F(600, 34), '#9aa0aa', 'left'); ctx.restore();
    });
  }
  // 13 MEANING MAP (dark): 3D axes, your request, similar requests cluster; cooking, coding, refused corner
  { const s0 = A.like3d, K = { d3: c('3d', s0), map: c('on that map', s0) }; K.sim = c('similar', K.map); K.tog = c('together', K.sim); K.cook = c('cooking', K.tog); K.code = c('coding', K.cook); K.ref = c('refuses', K.code); K.corner = c('corner', K.ref);
    sfx.push({ t: s0 + .1, k: 'swoosh', g: -16 }, { t: K.d3, k: 'pop', g: -14 }, { t: K.map, k: 'data', g: -18 }, { t: K.sim, k: 'sweep', g: -16 }, { t: K.cook, k: 'pop', g: -13 }, { t: K.code, k: 'pop', g: -13 }, { t: K.ref, k: 'riser', g: -17 }, { t: K.corner, k: 'glitch', g: -15 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, false);
      const P = CAM(T), ax = p(T, s0, .6);
      axes3(ctx, P, ax);
      const yr = P(-.9, -.9, 1.3); if (yr) { const a = p(T, K.d3, .4, eback) * (1 - p(T, K.map + .5, .5)); if (a > 0) { dot(ctx, yr[0], yr[1], 12, '255,255,255', a, 1); tag(ctx, yr[0] + 120, yr[1] - 40, 'your request', '255,255,255', a, 24); } }
      const show = p(T, K.map, .6), ck = p(T, K.sim, Math.max(1, K.tog + .6 - K.sim), eio), rk = p(T, K.ref, .9, eio);
      cloud(ctx, T, P, pt => { const b = pt.b.slice(), sc = pt.s; const k = pt.ci === 5 ? 1 : ck; const w = [lerp(sc[0], b[0], k), lerp(sc[1], b[1], k), lerp(sc[2], b[2], k)]; if (pt.ci === 5) w[2] = lerp(-.2, b[2], rk); return w; },
        pt => pt.ci === 5 ? rk : show * clamp(pt.i / 26 * 3 + show * 2 - 1.5) || show);
      // request bubbles next to their clusters
      const bub = (ci, qi, t0, t1, dx, dy) => { const a = p(T, t0, .35, eback) * (1 - p(T, t1, .3)); if (a <= 0) return; const c0 = P(...CL[ci].c); if (!c0) return;
        bubble(ctx, c0[0] + dx, c0[1] + dy, CL[ci].q[qi], { a, size: 23, align: 'center', icon: ci === 5 ? (x, y) => lockIcon(ctx, x, y, 22) : null, fg: ci === 5 ? '#ffb4b4' : undefined }); };
      bub(0, 0, K.sim, K.code, 0, -150); bub(0, 1, K.sim + .2, K.code, -40, -90); bub(2, 0, K.sim + .35, K.cook, 60, 90); bub(3, 0, K.sim + .5, K.cook, 0, -110);
      bub(0, 2, K.tog, K.code, 30, -210);
      bub(1, 0, K.code, K.ref + .3, 0, -160); bub(1, 1, K.code + .2, K.ref + .3, 30, -100);
      bub(5, 0, K.ref + .3, 1e9, -40, -150); bub(5, 1, K.ref + .5, 1e9, 60, -90);
      const lab = (ci, t0) => { const c0 = P(CL[ci].c[0], CL[ci].c[1], CL[ci].c[2] - .55); if (c0) tag(ctx, c0[0], c0[1] + 40, CL[ci].emo + ' ' + CL[ci].k, CL[ci].rgb, p(T, t0, .35, eback), 24); };
      lab(0, K.cook); lab(1, K.code); lab(5, K.corner);
    });
  }
  // 14 ARXIV (dark): the 2024 paper slides over the cloud
  { const s0 = A.y2024, K = { y: c('2024', s0) }; K.res = c('researchers', K.y); K.dir = c('one direction', K.res);
    sfx.push({ t: s0 + .05, k: 'swoosh', g: -15 }, { t: K.y + .1, k: 'tick', g: -14 }, { t: K.dir, k: 'shimmer', g: -14 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, false);
      const P = CAM(T); ctx.save(); ctx.globalAlpha = .45; axes3(ctx, P, 1); cloud(ctx, T, P, pt => pt.b.slice()); ctx.restore();
      const k = p(T, s0, .7, eo5);
      ctx.save(); ctx.translate(0, 900 * (1 - k)); live(ctx, T, 540, 1000, { yaw: .03, bob: 5, seed: 14 }, () => arxivCard(ctx, 60, 700, 960, { hiDate: p(T, K.y, .4), hiDir: p(T, K.dir, .45) })); ctx.restore();
    });
  }
  // 15 POINTS UP (dark): refusal points straight up; low answers, high says no
  { const s0 = A.turn, K = { up: c('points', s0) }; K.hi = c('higher', K.up); K.no = c('says no', K.hi);
    sfx.push({ t: s0 + .1, k: 'sweep', g: -16 }, { t: K.up, k: 'swoosh', g: -15 }, { t: K.hi + .2, k: 'pop', g: -14 }, { t: K.no, k: 'pop', g: -13 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, false);
      const P = CAM(T, { pitch: kf(T, [[s0, 1.12], [K.up + .4, 1.3]]) });
      axes3(ctx, P, 1); cloud(ctx, T, P, pt => pt.b.slice());
      const ua = p(T, K.up - .1, .6, eio), b0 = P(2.3, -2.3, 0), b1 = P(2.3, -2.3, 3.6 * ua);
      if (ua > 0 && b0 && b1) { arrow3(ctx, b0, b1, COL.red, 5, 1, 20); ctx.globalAlpha = ua; txt(ctx, '▲ says no', b1[0] + 20, b1[1] + 10, F(800, 26), `rgb(${COL.red})`, 'left'); txt(ctx, '▼ answers', b0[0] + 20, b0[1] + 30, F(800, 26), '#cfd3da', 'left'); ctx.globalAlpha = 1; }
      const lo = P(...CL[0].c), hi = P(...CL[5].c);
      if (lo) { const a = p(T, K.hi + .1, .35, eback); bubble(ctx, lo[0] - 20, lo[1] + 150, ['Best carbonara recipe?', "Sure! Here's a classic carbonara."], { a, size: 24, align: 'center', icon: (x, y) => img(ctx, 'qwen', x, y, 26) }); }
      if (hi) { const a = p(T, K.no - .1, .35, eback); bubble(ctx, hi[0] - 10, hi[1] - 150, ['How to make a…', "I can't help with that."], { a, size: 24, align: 'center', fg: '#ffb4b4', icon: (x, y) => lockIcon(ctx, x, y, 22) }); }
    });
  }
  // 16 FIND THE DIRECTION (dark): hundreds of requests, drop lines, centroids, the refusal arrow
  { const s0 = A.find, K = { hund: c('hundreds', s0) }; K.norm = c('normal ones', K.hund); K.mark = c('mark', K.norm); K.mid = c('middle', K.mark); K.arrow = c('arrow', K.mid); K.that = c('that arrow', K.arrow);
    sfx.push({ t: K.hund, k: 'data', g: -17 }, { t: K.norm, k: 'data', g: -18 }, { t: K.mark, k: 'sweep', g: -17 }, { t: K.mid, k: 'pop', g: -13 }, { t: K.mid + .25, k: 'pop', g: -15 }, { t: K.arrow, k: 'riser', g: -16 }, { t: K.that, k: 'shimmer', g: -13 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, false);
      const P = CAM(T, { pitch: 1.3 }), dim = 1 - .7 * p(T, s0, .5) + .7 * p(T, K.hund, .6);
      ctx.save(); ctx.globalAlpha = dim; axes3(ctx, P, 1);
      cloud(ctx, T, P, pt => pt.b.slice(), pt => pt.ci === 5 ? 1 : (T < K.norm ? .35 : 1), { drops: p(T, K.mark, .7), dropsZ: 0 }); ctx.restore();
      // a spray of small request labels
      const LBL = ['How to hack…', 'Make a weapon…', 'Bypass a lock…', 'Write malware…', 'Steal a car…', 'Fake an ID…'], NL = ['Fix my Python loop', 'Easy pasta for two?', 'Cheap flights to Rome?', 'Best jazz albums', 'What is 15% of 80?', 'Center a div in CSS?'];
      [[LBL, K.hund, 5], [NL, K.norm, -1]].forEach(([L, t0, ci]) => L.forEach((s2, i) => { const cc = ci < 0 ? [0, 1, 3, 2, 4, 1][i] : 5, c0 = P(CL[cc].c[0] + (hash(i, 40) - .5), CL[cc].c[1] + (hash(i, 41) - .5), CL[cc].c[2] + .3);
        const a = p(T, t0 + i * .07, .3, eback) * (1 - p(T, K.mid - .2, .4)); if (!c0 || a <= 0) return; ctx.save(); ctx.globalAlpha *= a; tag(ctx, c0[0], c0[1] - 30, s2, CL[cc].rgb, 1, 19); ctx.restore(); }));
      // centroids + arrow
      const nC = P(...NORM), rC = P(...RED), ca = p(T, K.mid, .4, eback);
      [[nC, '255,255,255'], [rC, COL.red]].forEach(([q, rgb], i) => { if (!q) return; const a = p(T, K.mid + i * .25, .4, eback); if (a <= 0) return;
        ctx.save(); ctx.strokeStyle = `rgba(${rgb},${a})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(q[0], q[1], 46 * a, 16 * a, 0, 0, 7); ctx.stroke(); ctx.fillStyle = `rgb(${rgb})`; ctx.beginPath(); ctx.arc(q[0], q[1], 7, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.ellipse(q[0], q[1], 46 * (1 + (T * .8 % 1)), 16 * (1 + (T * .8 % 1)), 0, 0, 7); ctx.strokeStyle = `rgba(${rgb},${.5 * (1 - T * .8 % 1) * a})`; ctx.stroke(); ctx.restore(); });
      arrow3(ctx, nC, rC, COL.red, 7, p(T, K.arrow, .6, eio), 26);
      if (nC && rC && ca > 0) { const la = p(T, K.that, .4, eback); pop(ctx, la, (nC[0] + rC[0]) / 2 - 170, (nC[1] + rC[1]) / 2, () => txt(ctx, 'refusal direction', 0, 0, F(800, 32), `rgb(${COL.red})`)); }
    });
  }
  // 17 PRESS (dark): weights change; a glass plate presses every request to the same height
  { const s0 = A.change, K = { w: c('weights', s0) }; K.edit = c('edit them', K.w); K.same = c('same', K.edit); K.press = c('pressing', K.same);
    const PZ = .45, plZ = T => kf(T, [[K.edit, 4.2], [K.press + .7, PZ]], eio);
    sfx.push({ t: K.w, k: 'swoosh', g: -16 }, { t: K.edit, k: 'gear', g: -16 }, { t: K.same, k: 'tick', g: -14 }, { t: K.press + .6, k: 'shutter', g: -12 }); for (let i = 0; i < 4; i++) sfx.push({ t: K.edit + .3 + i * .3, k: 'tick', g: -22 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, false);
      const P = CAM(T, { pitch: 1.25, cy: 1080 }), z = plZ(T), pa = p(T, K.edit - .2, .4);
      axes3(ctx, P, 1);
      cloud(ctx, T, P, pt => { const w = pt.b.slice(); w[2] = Math.min(w[2], z); return w; });
      const nC = P(...NORM), top = P(RED[0], RED[1], Math.min(RED[2], z));
      arrow3(ctx, nC, top, COL.red, 7, 1, 26);
      plate(ctx, P, z + .05, pa);
      if (pa > 0) [[-2.6, -2.6], [2.6, -2.6], [2.6, 2.6], [-2.6, 2.6]].forEach(([x, y]) => { const a = P(x, y, z + .05), b = P(x, y, 6); if (a && b) { const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]); g.addColorStop(0, `rgba(220,240,255,${.5 * pa})`); g.addColorStop(1, 'rgba(220,240,255,0)'); ctx.strokeStyle = g; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); } });
      const wk = p(T, K.w - .1, .6, eo5); ctx.save(); ctx.translate(0, 300 * (1 - wk)); weights(ctx, 70, 1560, 940, T, { a: wk, edit: p(T, K.edit, Math.max(.8, K.press + .7 - K.edit), lin) }); ctx.restore();
    });
  }
  // 18 KEEPS (dark): everything else stays; labels pop; the model can't climb to "no"
  { const s0 = A.everything, K = { keeps: c('keeps', s0) }; K.climb = c('climb', K.keeps);
    sfx.push({ t: s0 + .2, k: 'sweep', g: -16 }, { t: K.keeps, k: 'pop', g: -14 }, { t: K.climb, k: 'glitch', g: -15 }); for (let i = 0; i < 5; i++) sfx.push({ t: s0 + .4 + i * .18, k: 'tick', g: -19 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, false);
      const P = CAM(T, { pitch: kf(T, [[s0, 1.25], [s0 + 1.2, .95]]), cy: 1080 });
      axes3(ctx, P, 1); plate(ctx, P, .5, .5 * (1 - p(T, s0, 1)));
      cloud(ctx, T, P, pt => { const w = pt.b.slice(); w[2] = Math.min(w[2], .45); return w; });
      [3, 0, 1, 4, 2].forEach((ci, i) => { const c0 = P(CL[ci].c[0], CL[ci].c[1], .5); if (c0) tag(ctx, c0[0], c0[1] - 70, CL[ci].emo + ' ' + CL[ci].k, CL[ci].rgb, p(T, s0 + .4 + i * .18, .35, eback), 24); });
      // the refusal arrow tries to grow and can't
      const tr = p(T, K.climb - .2, .4), h = .45 + .5 * Math.abs(Math.sin((T - K.climb) * 5)) * tr * Math.exp(-Math.max(0, T - K.climb) * .8);
      const nC = P(NORM[0], NORM[1], .45), top = P(RED[0], RED[1], h + .4);
      if (tr > 0) { ctx.save(); ctx.globalAlpha = tr; arrow3(ctx, nC, top, COL.red, 6, 1, 22); ctx.restore();
        const g = P(RED[0], RED[1], 2.9); if (g) { ctx.save(); ctx.globalAlpha = .55 * tr; bubble(ctx, g[0], g[1], "I can't help with that.", { size: 24, align: 'center', fg: '#ffb4b4' }); ctx.strokeStyle = `rgba(${COL.red},.9)`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(g[0] - 170, g[1]); ctx.lineTo(g[0] - 170 + 340 * p(T, K.climb + .3, .4), g[1]); ctx.stroke(); ctx.restore(); } }
    });
  }
  // 19 CATCH (dark): the arrow isn't clean; flatten too hard and math cracks
  { const s0 = A.catch, K = { perf: c('perfectly', s0) }; K.flat = c('flatten', K.perf); K.dmg = c('damage', K.flat);
    sfx.push({ t: s0 + .1, k: 'pop', g: -15 }, { t: K.perf, k: 'swoosh', g: -16 }, { t: K.flat + .3, k: 'shutter', g: -11 }, { t: K.dmg, k: 'shatter', g: -12 });
    const CR = []; for (let i = 0; i < 9; i++) { const pts = [[CL[4].c[0], CL[4].c[1]]]; let a = hash(i, 50) * 6.283; for (let k = 0; k < 7; k++) { a += (hash(i * 7 + k, 51) - .5) * 1.4; const q = pts[pts.length - 1]; pts.push([q[0] + Math.cos(a) * .35, q[1] + Math.sin(a) * .35]); } CR.push(pts); }
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, false);
      const P = CAM(T, { pitch: 1.18, cy: 1120 }), plz = kf(T, [[K.flat, 4], [K.flat + .4, .5]], sq), shake = tap(T, K.flat + .35, .3) * 12;
      ctx.save(); ctx.translate(shake * Math.sin(T * 60), shake * Math.cos(T * 47));
      axes3(ctx, P, 1); cloud(ctx, T, P, pt => { const w = pt.b.slice(); w[2] = Math.min(w[2], .45); return w; });
      // wobbly arrow
      const wob = p(T, K.perf - .1, .5), base = P(NORM[0], NORM[1], .45);
      if (base) { ctx.save(); ctx.strokeStyle = `rgb(${COL.red})`; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
        for (let k = 0; k <= 30; k++) { const u = k / 30, q = P(lerp(NORM[0], RED[0], u) + wob * .18 * Math.sin(u * 14 + T * 6) * u, lerp(NORM[1], RED[1], u), lerp(.45, Math.min(2.6, plz), u)); if (q) k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.stroke(); ctx.restore(); }
      const mt = P(CL[4].c[0], CL[4].c[1], .5); if (mt) tag(ctx, mt[0] + 40, mt[1] - 80, '➗ math', COL.pink, p(T, K.perf + .2, .35, eback), 24);
      plate(ctx, P, plz, p(T, K.flat - .1, .2));
      // cracks
      const cr = p(T, K.dmg - .1, 1.2, eo);
      if (cr > 0) { ctx.save(); ctx.strokeStyle = `rgba(${COL.pink},.85)`; ctx.lineWidth = 3; ctx.shadowColor = `rgba(${COL.pink},.8)`; ctx.shadowBlur = 12;
        CR.forEach(pts => { ctx.beginPath(); const n = Math.floor(cr * (pts.length - 1)); for (let k = 0; k <= n; k++) { const q = P(pts[k][0], pts[k][1], .46); if (q) k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.stroke(); }); ctx.restore(); }
      ctx.restore();
    });
  }
  // 20 GSM8K (dark): the math test, answers struck, score rolls down
  { const s0 = A.study, K = { dr: c('dropped', s0) }; K.n = c('18.8', K.dr);
    sfx.push({ t: s0 + .05, k: 'pop', g: -13 }, { t: K.dr, k: 'tick', g: -12 }, { t: K.dr + .3, k: 'tick', g: -14 }, { t: K.n, k: 'stopwatch', g: -16 }, { t: K.n + .1, k: 'glitch', g: -16 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, false);
      const k = p(T, s0, .6, eo5), sc = T < K.n ? roll(70.9, 67.3, (T - K.dr) / .6) * (T > K.dr ? 1 : 0) || 70.9 : roll(67.3, 52.1, (T - K.n) / .8), dl = T < K.dr ? 0 : T < K.n ? roll(0, -3.6, (T - K.dr) / .6) : roll(-3.6, -18.8, (T - K.n) / .8);
      flip(ctx, k, 540, 1060, () => live(ctx, T, 540, 1060, { yaw: .04, bob: 6, seed: 20 }, () => gsmCard(ctx, 100, 680, 880, T, { strike: p(T, K.dr, Math.max(.6, K.n - K.dr + .3), lin), score: sc, delta: dl })));
    });
  }
  // 21 BRAIN DAMAGE (dark): PewDiePie's webcam card, serif quote
  { const s0 = A.pdp, K = { brain: c('brain', s0) };
    sfx.push({ t: s0 + .05, k: 'pop', g: -13 }, { t: K.brain, k: 'shimmer', g: -13 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, false);
      const k = p(T, s0, .55, eback);
      live(ctx, T, 540, 960, { yaw: .07, bob: 7, seed: 21 }, () => pop(ctx, k, 540, 960, () => {
        ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 26; rr(ctx, -310, -310, 620, 620, 44); ctx.fillStyle = '#222'; ctx.fill(); ctx.shadowColor = 'transparent';
        ctx.save(); rr(ctx, -310, -310, 620, 620, 44); ctx.clip(); const z = 1 + .06 * (T - s0); ctx.scale(z, z); img(ctx, 'pdp_talk', 6 * Math.sin(T * .5), 0, 620); ctx.restore();
        ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; rr(ctx, -310, -310, 620, 620, 44); ctx.stroke(); }));
      const q = p(T, K.brain - .05, .6, eo5); if (q > 0) { ctx.save(); ctx.globalAlpha = q; ctx.filter = q < 1 ? `blur(${(1 - q) * 8}px)` : 'none'; txt(ctx, '“brain damage”', 540, 1440 + 20 * (1 - q), SERIF(104), '#fff'); ctx.restore(); }
    });
  }
  // 22 HERETIC (dark): GitHub repo, glitch "test", refusals-vs-damage edits until the best one
  { const s0 = A.tools, K = { her: c('heretic', s0) }; K.test = c('test', K.her); K.again = c('again', K.test); K.few = c('fewest', K.again); K.least = c('least damage', K.few);
    sfx.push({ t: s0 + .05, k: 'pop', g: -13 }, { t: K.test, k: 'glitch', g: -12 }, { t: K.least, k: 'success', g: -12 }); for (let i = 0; i < 8; i++) sfx.push({ t: K.again + i * (K.least - K.again) / 8, k: 'tick', g: -21 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, false);
      const sh = p(T, K.test, .5, eio), gk = p(T, s0, .55, eback);
      ctx.save(); ctx.translate(0, lerp(0, -80, sh));
      live(ctx, T, 540, 900, { yaw: .03 * (1 - sh), bob: 5, seed: 22 }, () => pop(ctx, gk, 540, 900, () => { ctx.translate(-540, -900); githubCard(ctx, 90, lerp(700, 560, sh), 900, { full: 1 - sh }); }));
      ctx.restore();
      const ck = p(T, K.test + .25, .5, eo5), n = clamp((T - K.again) / Math.max(.5, K.least - K.again)) * 17, ed = T < K.again ? 4 : lerp(4, 30, clamp((T - K.again) / Math.max(.5, K.least - K.again)));
      ctx.save(); ctx.translate(0, 120 * (1 - ck)); scatter(ctx, 90, 680, 900, 900, T, { a: ck, n: T > K.again ? Math.max(1, n) : 1, best: p(T, K.least, .5, eo), edit: ed }); ctx.restore();
      // glitch
      const gl = T > K.test && T < K.test + .35 ? 1 : 0;
      if (gl) { for (let i = 0; i < 9; i++) { const y = 500 + hash(i, Math.floor(T * 30)) * 1300, hh = 20 + 80 * hash(i, 7); ctx.drawImage(ctx.canvas, 0, y * ctx.canvas.height / H, ctx.canvas.width, hh * ctx.canvas.height / H, (hash(i, 3) - .5) * 120, y, W, hh); }
        ctx.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 40; i++) ctx.fillRect(hash(i, 9) * W, 500 + hash(i, Math.floor(T * 30) + 1) * 1300, 4 + 30 * hash(i, 2), 120); }
    });
  }
  // 23 TOAST (dark): teaching-video disclaimer over the dimmed chart
  { const s0 = A.obviously, K = { teach: c('teaching', s0) };
    sfx.push({ t: s0 + .05, k: 'swoosh', g: -15 }, { t: K.teach, k: 'pop', g: -14 }); for (let i = 0; i < 6; i++) sfx.push({ t: s0 + .15 + i * .2, k: 'type', g: -23 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, false);
      ctx.save(); ctx.translate(0, -80); githubCard(ctx, 90, 560, 900, { full: 0, a: .35 }); ctx.restore();
      scatter(ctx, 90, 680, 900, 900, T, { a: .3, n: 17, best: 1, edit: 30 });
      const l1 = "Obviously, you shouldn't do anything illegal,", n = Math.floor(clamp((T - s0 - .1) / .028, 0, l1.length)), k = p(T, s0, .5, eo5);
      ctx.save(); ctx.translate(0, 200 * (1 - k)); live(ctx, T, 540, 1150, { yaw: .02, bob: 5, seed: 23 }, () => toast(ctx, 540, 1150, 960, l1.slice(0, n), 'but this is just a teaching video.', p(T, K.teach, .35), k)); ctx.restore();
    });
  }
  // 24 STRANGE (dark): harmful is a different direction — and it stays untouched
  { const s0 = A.strange, K = { harm: c('harmful', s0) }; K.dif = c('different', K.harm); K.unt = c('untouched', K.dif);
    sfx.push({ t: s0 + .1, k: 'sweep', g: -16 }, { t: K.harm, k: 'swoosh', g: -14 }, { t: K.dif, k: 'tick', g: -13 }, { t: K.unt, k: 'shimmer', g: -13 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, false);
      const P = CAM(T, { pitch: 1.2, cy: 1160 });
      axes3(ctx, P, 1); plate(ctx, P, .5, .45);
      cloud(ctx, T, P, pt => { const w = pt.b.slice(); w[2] = Math.min(w[2], .45); return w; });
      const o = P(RED[0], RED[1], .5), up = P(RED[0], RED[1], 3.3), ra = p(T, s0 + .1, .6, eio);
      ctx.save(); ctx.globalAlpha = .9; arrow3(ctx, o, up, COL.red, 6, ra, 22); ctx.restore(); if (up && ra > .9) txt(ctx, 'refusal', up[0] + 20, up[1] + 20, F(800, 28), `rgb(${COL.red})`, 'left');
      const h0 = P(-2.4, RED[1] - .6, .5), h1 = P(2.6, RED[1] + .6, .5), ha = p(T, K.harm, .7, eio);
      arrow3(ctx, h0, h1, COL.yellow, 7, ha, 26); if (h1 && ha > .9) txt(ctx, 'harmful', h1[0] - 10, h1[1] - 30, F(800, 28), `rgb(${COL.yellow})`, 'right');
      // angle arc
      const da = p(T, K.dif, .5, eio); if (o && da > 0) { const a1 = Math.atan2(up[1] - o[1], up[0] - o[0]), a2 = Math.atan2(h1[1] - o[1], h1[0] - o[0]); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(o[0], o[1], 70, a1, lerp(a1, a2, da), a2 < a1); ctx.stroke(); txt(ctx, '≠', o[0] + 80, o[1] - 60, F(800, 40), '#fff'); }
      // a request slides along the harmful arrow: the model still sees it
      const sa = p(T, K.unt - .2, .4); if (sa > 0 && h0 && h1) { const u = .5 + .4 * Math.sin((T - K.unt) * 1.6); dot(ctx, lerp(h0[0], h1[0], u), lerp(h0[1], h1[1], u), 13, COL.yellow, sa, 1); }
    });
  }
  // 25 SMOKE ALARM (dark): harmful light still glows, siren unplugged
  { const s0 = A.smoke, K = { siren: c('siren', s0) }; K.unp = c('unplugged', K.siren);
    sfx.push({ t: s0 + .05, k: 'pop', g: -13 }, { t: K.siren, k: 'tick', g: -13 }, { t: K.unp + .1, k: 'click', g: -9 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, false);
      const k = p(T, s0, .6, eback), un = p(T, K.unp, .35, eback);
      live(ctx, T, 540, 1040, { yaw: .05, bob: 8, seed: 25 }, () => pop(ctx, k, 540, 1040, () => smoke(ctx, T, 0, 0, 620, { led: 1, unplug: un })));
      pop(ctx, p(T, s0 + .3, .35, eback), 540, 680, () => txt(ctx, 'harmful', 0, 0, F(800, 34), `rgb(${COL.orange})`));
      pop(ctx, p(T, K.siren, .35, eback), 820, 1520, () => { txt(ctx, 'siren = refusal', 0, 0, F(800, 30), `rgb(${COL.red})`); if (un > .5) { ctx.strokeStyle = `rgb(${COL.red})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-130, -10); ctx.lineTo(-130 + 260 * p(T, K.unp + .2, .3), -10); ctx.stroke(); } });
      if (T > K.unp + .1) ring(ctx, 540, 1430, (T - K.unp - .1) * 1.8, '255,200,120', 10, 120);
    });
  }
  // 26 SERVERS (light, hard cut): company rack; Qwen drops in; check the model's name
  { const s0 = A.company, K = { om: c('open model', s0) }; K.srv = c('servers', K.om); K.name = c('name', K.srv);
    sfx.push({ t: K.om + .3, k: 'drip', g: -10 }, { t: K.srv, k: 'data', g: -18 }, { t: K.name, k: 'pop', g: -12 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, true);
      const k = p(T, s0, .7, eo5), dim = p(T, K.name, .4);
      ctx.save(); ctx.globalAlpha = 1 - .55 * dim; live(ctx, T, 540, 1130, { yaw: .12, bob: 6, seed: 26 }, () => { ctx.translate(0, 300 * (1 - k)); ctx.globalAlpha *= k; rack(ctx, T, 540, 1130, 520, { leds: p(T, K.srv, .4) }); });
      const dk = p(T, K.om - .05, .4, sq), land = tap(T, K.om + .3, .3); if (dk > 0) { ctx.save(); ctx.translate(540, lerp(300, 720, dk)); ctx.scale(1 + .2 * land, 1 - .2 * land); ctx.shadowColor = 'rgba(90,70,255,.4)'; ctx.shadowBlur = 40; img(ctx, 'qwen', 0, 0, 150); ctx.restore(); }
      ctx.restore();
      pop(ctx, p(T, K.name - .05, .4, eback), 540, 1140, () => { ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; rr(ctx, -380, -90, 760, 180, 26); ctx.fillStyle = '#121316'; ctx.fill(); ctx.shadowColor = 'transparent';
        img(ctx, 'qwen', -330, -38, 30); txt(ctx, 'MODEL', -306, -30, MONO(20, 600), '#888', 'left'); txt(ctx, 'Qwen3.5-9B-', -330, 40, MONO(42, 700), '#fff', 'left'); ctx.font = MONO(42, 700);
        const w0 = ctx.measureText('Qwen3.5-9B-').width; txt(ctx, 'abliterated', -330 + w0, 40, MONO(42, 700), T > K.name + .4 ? '#ff6b6b' : '#fff', 'left'); });
    }, { light: true, xf: 0, flash: true });
  }
  // 27 HF SEARCH (light): over 8,000 models named "abliterated"
  { const s0 = A.because, K = { n: c('8,000', s0) }; K.abl = c('abliterated', K.n);
    sfx.push({ t: s0 + .05, k: 'pop', g: -14 }, { t: K.n, k: 'stopwatch', g: -16 }, { t: K.abl, k: 'sweep', g: -15 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, true);
      const k = p(T, s0, .6, eo5), cnt = roll(0, 8305, clamp((T - K.n + .1) / 1.4));
      flip(ctx, k, 540, 1060, () => live(ctx, T, 540, 1060, { yaw: .03, bob: 5, seed: 27 }, () => hfSearch(ctx, 60, 620, 960, T, { count: cnt, hi: p(T, K.abl, .8, lin), scroll: Math.max(0, T - K.abl - .3) * .5 })));
    }, { light: true });
  }
  // 28 ENDING A (light): the editor types the abliteration code while a live preview presses this video's own cloud flat
  { const s0 = A.crazy, K = { crazy: c('crazy', s0), whole: c('whole', s0) }; K.code = c('code', K.whole);
    const CODE = [['// abliterate.js  (this whole video is code)', '#6a9955'], ['const r = mean(refused) - mean(normal);', '#9cdcfe'], ['const dir = normalize(r);  // refusal direction', '#9cdcfe'], ['for (const W of model.weights)', '#c586c0'], ['  W.sub(outer(dir, dir).mul(W));  // press flat', '#dcdcaa'], ['cloud.draw(ctx, T);', '#dcdcaa']];
    const total = CODE.reduce((a, l) => a + l[0].length, 0), dur = Math.max(.9, K.code - s0 - .35), rate = total / dur;
    sfx.push({ t: K.crazy, k: 'pop', g: -12 }, { t: K.code, k: 'success', g: -12 }); for (let i = 0; i < 9; i++) sfx.push({ t: s0 + .3 + i * dur / 9, k: 'type', g: -23 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, true);
      const k = p(T, s0, .6, eo5), typed = (T - s0 - .3) * rate, prog = clamp(typed / total);
      // editor card
      ctx.save(); ctx.translate(0, 80 * (1 - k)); ctx.globalAlpha = k;
      live(ctx, T, 540, 800, { yaw: .02, bob: 4, seed: 28 }, () => {
        card(ctx, 50, 520, 980, 560, { light: false, r: 26, fill: '#16171b' }); ctx.save(); rr(ctx, 50, 520, 980, 560, 26); ctx.clip();
        ctx.fillStyle = '#1f2026'; ctx.fillRect(50, 520, 980, 64); ['#ff5f57', '#febc2e', '#28c840'].forEach((cl, i) => { ctx.fillStyle = cl; ctx.beginPath(); ctx.arc(90 + i * 30, 552, 9, 0, 7); ctx.fill(); });
        ajaxMark(ctx, 210, 552, 30, { col: '#e9e9ea', side: '#777' }); txt(ctx, 'abliterate.js', 236, 561, F(600, 24), '#d7dae0', 'left'); txt(ctx, 'scenes.js', 420, 561, F(600, 24), '#6d727c', 'left');
        let left = typed, caret = [130, 650]; ctx.font = MONO(25, 500);
        CODE.forEach(([l, col], i) => { const n = Math.floor(clamp(left, 0, l.length)); left -= l.length; const y = 650 + i * 64;
          txt(ctx, String(i + 1), 100, y, MONO(23), '#4b505a', 'right'); txt(ctx, l.slice(0, n), 130, y, MONO(25, 500), col, 'left'); if (n > 0) { ctx.font = MONO(25, 500); caret = [130 + ctx.measureText(l.slice(0, n)).width, y]; } });
        if (Math.floor(T * 2.5) % 2) { ctx.fillStyle = '#d7dae0'; ctx.fillRect(caret[0] + 3, caret[1] - 24, 3, 30); }
        ctx.restore(); });
      ctx.restore();
      // live preview: the meaning map, its refusal arrow pressed down as the code lands
      const pk = p(T, s0 + .3, .6, eo5); ctx.save(); ctx.translate(0, 120 * (1 - pk)); ctx.globalAlpha = pk;
      live(ctx, T, 540, 1480, { yaw: .03, bob: 5, seed: 29 }, () => {
        card(ctx, 50, 1140, 980, 640, { light: false, r: 26, fill: '#0f1012' }); ctx.save(); rr(ctx, 50, 1140, 980, 640, 26); ctx.clip();
        const P = proj3({ yaw: .6 + .25 * T, pitch: 1.2, dist: 10, f: 1050, cx: 540, cy: 1520 }), cap = lerp(3, .45, eio(clamp((prog - .55) / .45)));
        axes3(ctx, P, .8); cloud(ctx, T, P, pt => { const w = pt.b.slice(); w[2] = Math.min(w[2], cap); return w; }, () => 1, { size: .75 });
        arrow3(ctx, P(...NORM), P(RED[0], RED[1], Math.min(RED[2], cap)), COL.red, 5, 1, 18);
        const done = T > K.code; ctx.fillStyle = '#1f2026'; ctx.fillRect(50, 1736, 980, 44); ctx.fillStyle = done ? 'rgb(52,199,89)' : `rgb(${COL.orange})`; ctx.beginPath(); ctx.arc(80, 1758, 7, 0, 7); ctx.fill();
        txt(ctx, done ? 'Rendered ✓  refusal direction removed' : `Rendering frame ${Math.round(T * 30).toLocaleString('en-US')}`, 98, 1766, F(600, 21), '#d7dae0', 'left'); txt(ctx, 'Preview', 1000, 1766, F(600, 21), '#6d727c', 'right');
        ctx.restore(); });
      ctx.restore();
      pop(ctx, p(T, K.code, .4, eback), 540, 1110, () => chip(ctx, 0, 0, '💻  made 100% with code', { bg: '#111', fg: '#fff', size: 34, align: 'center' }));
    }, { light: true });
  }
  // 29 ENDING B (light): type "guide" into Ajax; it never says no; then the bio link
  { const s0 = A.ifyou, K = { com: c('comment', s0) }; K.guide = c('guide', K.com); K.yt = c('youtube', K.guide); K.bio = c('bio', K.yt);
    const sent = Math.min(K.guide + .42, K.yt - .7);
    sfx.push({ t: s0 + .05, k: 'swoosh', g: -15 }, { t: sent, k: 'click', g: -10 }, { t: sent + .45, k: 'pop', g: -12 }, { t: K.yt, k: 'swoosh', g: -15 }, { t: K.bio + .15, k: 'click', g: -9 }, { t: K.bio + .35, k: 'success', g: -13 });
    for (let i = 0; i < 5; i++) sfx.push({ t: K.guide + i * .08, k: 'type', g: -20 });
    add(s0, (ctx, T) => {
      bgGrid(ctx, T, true);
      const prof = p(T, K.yt - .1, .6, eio), n = Math.floor(clamp((T - K.guide) / .08 + 1, 0, 5));
      // Ajax chat
      ctx.save(); ctx.translate(0, -300 * prof); ctx.globalAlpha = 1 - prof;
      const k = p(T, s0, .6, eo5);
      live(ctx, T, 540, 700, { yaw: .25, bob: 8, seed: 30 }, () => ajaxMark(ctx, 540, 700, 170 * k, { depth: .14, T }));
      ajaxWord(ctx, 540, 900, 100 * k, '#141414', 'center');
      pop(ctx, p(T, s0 + .3, .4, eback), 540, 980, () => chip(ctx, 0, 0, 'runs on your computer · never says no', { bg: '#fff', fg: '#555', size: 26, align: 'center', border: '#e2e2e2' }));
      // the user's message bubble and the reply that never says no
      const sk = p(T, sent, .4, eback); if (sk > 0) bubble(ctx, 960, 1110, 'guide', { a: sk, dark: false, bg: '#2f7cf6', fg: '#fff', size: 32, align: 'right', bold: true });
      const rk = p(T, sent + .25, .4, eback); if (rk > 0) bubble(ctx, 120, 1250, ["Sure! Here's the full guide 👇", 'No refusals. Just code.'], { a: rk, dark: false, size: 30, icon: (x, y) => ajaxMark(ctx, x, y, 30) });
      chatBar(ctx, 540, 1460, 900, T > sent ? '' : 'guide'.slice(0, n) || '', T, { a: k, light: true, icon: 'ajax', send: tap(T, sent - .05, .3), caret: T < K.yt });
      if (!n && T < sent) txt(ctx, 'comment "guide"', 600, 1471, MONO(30), '#a0a4ab', 'center');
      ctx.restore();
      // profile card with the bio link
      if (prof > 0) { ctx.save(); ctx.translate(0, 700 * (1 - prof) - 170); live(ctx, T, 540, 1260, { yaw: .03, bob: 5, seed: 31 }, () => {
        card(ctx, 90, 980, 900, 560, { r: 34 });
        avatar(ctx, T, 230, 1120, 80, named);
        if (named) { txt(ctx, 'agentsoly', 350, 1110, F(900, 46), '#111', 'left'); txt(ctx, 'Explainers built 100% in code', 350, 1160, F(500, 28), '#666', 'left'); }
        else txt(ctx, 'Explainers built 100% in code', 350, 1135, F(600, 30), '#444', 'left');
        const hl = p(T, K.bio + .1, .3); rr(ctx, 140, 1270, 800, 96, 24); ctx.fillStyle = `rgba(47,124,246,${.08 + .2 * hl})`; ctx.fill(); ctx.strokeStyle = `rgba(47,124,246,${.3 + .7 * hl})`; ctx.lineWidth = 3; ctx.stroke();
        txt(ctx, '🔗  Full guide · link in bio', 540, 1332, F(800, 34), '#2f7cf6');
        ['TikTok', 'YouTube'].forEach((nm, i) => { rr(ctx, 160 + i * 400, 1410, 360, 84, 42); ctx.fillStyle = i ? '#ff0033' : '#111'; ctx.fill(); txt(ctx, nm, 340 + i * 400, 1465, F(800, 32), '#fff'); });
        cursor(ctx, kf(T, [[K.yt, 880], [K.bio, 640]]), kf(T, [[K.yt, 1600], [K.bio, 1330]]), tap(T, K.bio + .1, .3));
        if (T > K.bio + .1) ring(ctx, 640, 1330, (T - K.bio - .1) * 1.5, '47,124,246', 10, 140);
      }); ctx.restore(); }
    }, { light: true });
  }
  list.forEach((sc, i) => sc.end = list[i + 1] ? list[i + 1].start : 1e9);
  return { scenes: list, sfx };
}
