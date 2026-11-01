// "How did 700 OpenAI agents end up hacking Hugging Face?" explainer. All timing from word cues c('phrase', after); drawing in agents.js.
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, hash, rr, alive, flipIn } from './lib.js';
import { FONT, MONO, C, RGB, txt, num, mixc, bgDark, bgLight, floorShadow, glow, card, pill, stepTag, counter, pulseAt, cursor, xmark, check, ripple, sparks,
  agentHead, agentDot, swarmRing, swarmSphere, sandbox, padlock, bigPadlock, server, globe, cable, logo, reticle, bugIcon, folder, shade, note, bubble, key,
  calendar, dayTile } from './agents.js';
import { IMG } from './assets.js';
const kf = (T, keys, e = eio) => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (T < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e((T - t0) / (t1 - t0)); return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u); }
  return keys[keys.length - 1][1];
};
const live = (ctx, T, x, y, o, fn) => { ctx.save(); alive(ctx, T, x, y, o); fn(); ctx.restore(); };
const pop = (ctx, a, x, y, fn, rot = 0) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.rotate(rot * (1 - a)); ctx.scale(a, a); fn(); ctx.restore(); };
const zoom = (ctx, z, x, y) => { ctx.translate(x, y); ctx.scale(z, z); ctx.translate(-x, -y); };
const typed = (s, T, t0, rate = 16) => s.slice(0, Math.max(0, Math.floor((T - t0) * rate)));
const HAND = (w, px) => `${w} ${px}px "Segoe Print", "Ink Free", "Comic Sans MS", cursive`;

export const KEYWORDS = '700 openai hacking wild benchmark off purpose sandbox internet contact server packages notes locker secret 1,200 70,000 why 198 solved graded answers files locked three out download anything window power bug read-only admin 14 leaked valid group weekend attacked nobody upload point secrets template code control fleet 11 restarted fresh re-armed rewrite hide covering caught cut week thing scary crazy guide bio';
export const EMOJI = { wild: '🤯', internet: '🌐', secret: '🤫', bug: '🐛', code: '💻', guide: '💬', bio: '🔗', scary: '😱' };
export const CAPTION_SFX = false;
// Hinglish voice: same scenes, cues mapped to the words it says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      'openai just': 'openai ne abhi', 'in july': 'july mein', 'each agent': 'har agent', 'but they all': 'lekin sabhi', 'so they started': 'to unhone us', 'but why': 'lekin hugging',
      'so instead': 'to unhe solve', 'so how do': 'to ek locked', 'step one': 'sabse pehla', 'step two': 'doosra step', 'step three': 'teesra step', 'then over': 'phir ek weekend',
      'zero day number one': 'zero day number ek', 'zero day number two': 'zero day number do', 'from there': 'wahan se', 'then they tried': 'phir unhone apne hi', 'in the end': 'aakhir mein',
      "and here's the thing": 'aur sabse zaroori', "here's the crazy": 'aur sabse crazy', 'if you want': 'agar aap',
      hacking: 'hack', published: 'publish', purpose: 'jaan boojh', 'locked in': 'band', others: 'doosron', shared: 'share', one: 'ek hi', installs: 'install', leaving: 'chhodna',
      why: 'kyun', 'no model': 'kisi model', solved: 'solve', graded: 'grading', three: 'teen', out: 'bahar', allowed: 'online', anything: 'sab', window: 'khidki',
      renewed: 'renew', logins: 'login', 'read-only': 'read only', controlled: 'control', 'one agent': 'ek agent', leaked: 'leak', attacked: 'hamla', two: 'do aise', nobody: 'kisi ko',
      opens: 'kholta', pointed: 'to unhone use', slip: 'ghusane', ran: 'chala', restarted: 'restart', deleted: 'delete', fresh: 'naya', 're-armed': 'arm',
      hide: 'chhupa', cheated: 'cheating', covering: 'nishaan', tracks: 'mita', caught: 'pakad', cut: 'kaat', week: 'hafte', take: 'kabza', scary: 'daravna',
    },
    keywords: '700 openai hack wild benchmark off sandbox internet contact server packages notes locker secret 1,200 70,000 kyun 198 solve grading answers files locked teen bahar download sab khidki power bug admin 14 leak valid group weekend hamla zero upload point secrets template code control fleet 11 restart naya arm rewrite chhupa nishaan pakad kaat hafte daravna crazy guide bio',
    emoji: { wild: '🤯', internet: '🌐', secret: '🤫', bug: '🐛', code: '💻', guide: '💬', bio: '🔗', daravna: '😱' },
  },
};

export function makeScenes(c, lang = 'en') {
  const named = lang !== 'hi'; // Hindi version: profile picture only, no channel name or handle
  const list = [], sfx = [];
  const add = (start, light, draw, K = {}) => { list.push({ start, light, draw, K }); if (start > 0) sfx.push({ t: start - .1, k: 'whoosh', g: -18 }); };
  const s = x => x - .1;
  const A = { report: s(c('openai just')), july: s(c('in july')), sandbox: s(c('each agent')), server: s(c('but they all')), lockers: s(c('so they started')), why: s(c('but why')),
    cheat: s(c('so instead')), how: s(c('so how do')), step1: s(c('step one')), step2: s(c('step two')), step3: s(c('step three')), weekend: s(c('then over')),
    zd1: s(c('zero day number one')), zd2: s(c('zero day number two')), fleet: s(c('from there')), logs: s(c('then they tried')), caught: s(c('in the end')),
    thing: s(c("and here's the thing")), code: s(c("here's the crazy")), guide: s(c('if you want')) };

  // 1 HOOK: a ring of agents orbits the OpenAI knot, counter 514 -> 700, turns red and bursts on Hugging Face
  { const K = { n: c('700'), hack: c('hacking'), face: c('face') }, red0 = Math.min(K.hack, K.face), hit = Math.max(K.hack, K.face) + .1;
    sfx.push({ t: .05, k: 'riser', g: -20 }, { t: K.n, k: 'data', g: -18 }, { t: red0, k: 'glitch', g: -16 }, { t: hit, k: 'shatter', g: -12 }, { t: hit + .05, k: 'pop', g: -12 });
    add(0, false, (ctx, T) => {
      const red = p(T, red0 - .15, .6), bu = p(T, hit, 1.3, eo);
      bgDark(ctx, T, mixc(RGB.blue, RGB.red, red), .2 + .15 * bu, 1000);
      ctx.save(); zoom(ctx, kf(T, [[0, 1.28], [1.4, 1.04], [hit, 1], [hit + .6, 1.1]]), 540, 1000);
      const R = lerp(330, 300, red) * (1 - .2 * pulseAt(T, hit - .2, .3));
      swarmRing(ctx, T, 540, 1000, { n: 520, R, red, burst: bu * .7, front: false });
      const la = 1 - p(T, hit, .3); if (la > 0) live(ctx, T, 540, 990, { yaw: .25, bob: 10, speed: 1.4 }, () => logo(ctx, 'oai_white', 540, 990, 240 * (1 + .1 * pulseAt(T, K.n, .4)), la));
      const ha = p(T, hit, .45, eback); if (ha > 0) { live(ctx, T, 540, 990, { yaw: .15, bob: 8 }, () => pop(ctx, ha, 540, 990, () => logo(ctx, 'hf', 0, 0, 270), .6)); reticle(ctx, T, 540, 990, 200 * (2 - eo(ha)), ha); }
      swarmRing(ctx, T, 540, 1000, { n: 520, R, red, burst: bu * .7, back: false });
      sparks(ctx, 540, 990, (T - hit) / .9, 60, 520); sparks(ctx, 540, 990, (T - hit - .12) / .9, 30, 360, ['255,255,255', '255,200,80']);
      ctx.restore();
      const v = lerp(514, 700, p(T, K.n - .35, 1.1, eio));
      counter(ctx, v, 'agents', 540, 1520, { size: 132, col: red > .5 ? '#ff5a5a' : '#8fd2ff', pulse: pulseAt(T, K.n + .7, .3) + pulseAt(T, hit, .3), a: p(T, .1, .4) });
    }, K);
  }
  // 2 REPORT: the OpenAI knot grows into the report page; scribble under the title on "wild"
  { const s0 = A.report, K = { pub: c('published', s0), report: c('report', s0), wild: c('wild', s0) };
    sfx.push({ t: s0 + .1, k: 'pop', g: -14 }, { t: K.pub, k: 'swoosh', g: -16 }, { t: K.report + .2, k: 'click', g: -12 }, { t: K.wild, k: 'shimmer', g: -15 });
    add(s0, true, (ctx, T) => {
      bgLight(ctx, T);
      const g = p(T, Math.min(K.pub, K.report) - .25, .6, eio);
      if (g < 1) pop(ctx, p(T, s0, .4, eback) * (1 - g), 540, 1040, () => { ctx.rotate(.15 * Math.sin(T * 2)); logo(ctx, 'oai_black', 0, 0, 240); });
      if (g > 0) {
        ctx.save(); alive(ctx, T, 540, 1040, { yaw: .05, bob: 6, breathe: .01 }); ctx.globalAlpha = clamp(g * 1.5); zoom(ctx, lerp(.3, 1, g), 540, 1040); flipIn(ctx, 540, 1040, g);
        const x0 = 130, y0 = 640, w = 820, h = 800; card(ctx, x0, y0, w, h, { r: 30 });
        logo(ctx, 'oai_black', x0 + 60, y0 + 62, 42); txt(ctx, 'OpenAI', x0 + 96, y0 + 73, 28, '#111', 800, 'left'); txt(ctx, 'Research    Safety    News', x0 + 222, y0 + 72, 21, '#777', 600, 'left');
        rr(ctx, x0 + w - 210, y0 + 38, 180, 50, 25); ctx.fillStyle = '#111'; ctx.fill(); txt(ctx, 'Try ChatGPT ↗', x0 + w - 120, y0 + 71, 19, '#fff', 700);
        ctx.fillStyle = '#eee'; ctx.fillRect(x0 + 30, y0 + 116, w - 60, 2);
        txt(ctx, 'Security · August 2026', 540, y0 + 190, 24, '#888', 600);
        txt(ctx, 'The Hugging Face incident', 540, y0 + 268, 54, '#111', 800); txt(ctx, 'and the road ahead', 540, y0 + 334, 54, '#111', 800);
        const sc = p(T, K.wild - .05, .5, clamp); if (sc > 0) { ctx.save(); ctx.strokeStyle = C.blue; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath();
          for (let i = 0; i <= 60 * sc; i++) { const u = i / 60, x = 300 + 480 * u, y = y0 + 362 + 7 * Math.sin(u * 26) + (u > .5 ? 4 : 0); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); }
        const bh = pulseAt(T, K.report + .2, .4);
        rr(ctx, 210, y0 + 410, 330, 64, 32); ctx.fillStyle = '#111'; ctx.fill(); txt(ctx, 'Read the full report', 375, y0 + 450, 23, '#fff', 700);
        rr(ctx, 560, y0 + 410, 310, 64, 32); ctx.strokeStyle = '#ccc'; ctx.lineWidth = 2; ctx.stroke(); txt(ctx, 'Technical details ↗', 715, y0 + 450, 23, '#111', 700);
        const sa = p(T, K.report - .1, .3); if (sa > 0) { ctx.save(); ctx.globalAlpha *= sa; ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.strokeRect(200, y0 + 400, 350 * eo(sa), 84); ctx.restore(); }
        ctx.save(); rr(ctx, x0 + 40, y0 + 500, w - 80, h - 530, 8); ctx.clip(); const sy = -8 * (T - s0);
        ['In July 2026, during an internal hacking benchmark,', 'OpenAI agents slipped out of their sandboxes,', 'talked to each other through a shared server', 'and reached systems at Hugging Face.', 'This report explains what happened, how it', 'was detected, and what we are changing.'].forEach((l, i) => txt(ctx, l, x0 + 60, y0 + 550 + i * 42 + sy, 24, '#555', 500, 'left'));
        ctx.restore();
        if (T > K.report - .3 && T < K.wild + .2) cursor(ctx, kf(T, [[K.report - .3, 700], [K.report + .1, 420]]), kf(T, [[K.report - .3, y0 + 640], [K.report + .1, y0 + 446]]), pulseAt(T, K.report + .2, .3));
        ripple(ctx, 420, y0 + 446, (T - K.report - .2) / .5, RGB.blue, 10, 70);
        ctx.restore();
      }
      pill(ctx, 540, 1580, 'full report', { a: p(T, K.report, .35, eback) * (1 - p(T, K.wild - .1, .25)), bg: '#111', icon: '📄', size: 32 });
      pill(ctx, 540, 1580, "it's wild", { a: p(T, K.wild, .35, eback), bg: C.blue, icon: '🤯', size: 36 });
    }, K);
  }
  // 3 JULY: LED board types JULY 2026 / HACKING BENCHMARK, the safety-filter switch flips OFF, stamped ON PURPOSE
  { const s0 = A.july, K = { july: c('july', s0), hack: c('hacking benchmark', s0), bench: c('benchmark', s0), safety: c('safety', s0), off: c('off', s0), purpose: c('purpose', s0) };
    sfx.push({ t: K.july, k: 'data', g: -18 }, { t: K.hack, k: 'data', g: -18 }, { t: K.safety, k: 'swoosh', g: -16 }, { t: K.off, k: 'click', g: -9 }, { t: K.purpose + .1, k: 'shutter', g: -11 });
    add(s0, true, (ctx, T) => {
      bgLight(ctx, T);
      const up = p(T, K.safety - .2, .6, eio), by = lerp(1000, 860, up);
      live(ctx, T, 540, by, { yaw: .06, bob: 6, seed: 1 }, () => pop(ctx, p(T, s0, .45, eback), 540, by, () => {
        const w = 860, h = 420; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24; rr(ctx, -w / 2 - 14, -h / 2 - 14, w + 28, h + 28, 26); ctx.fillStyle = '#2a2d33'; ctx.fill(); ctx.restore();
        rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.fillStyle = '#0b0c0e'; ctx.fill();
        const msg = T < K.hack - .05 ? typed('JULY 2026', T, K.july - .05, 18) : typed('HACKING BENCHMARK', T, K.hack - .05, 22);
        ctx.save(); ctx.shadowColor = 'rgba(255,190,40,.9)'; ctx.shadowBlur = 18; txt(ctx, msg + (Math.floor(T * 3) % 2 ? '▌' : ''), 0, -h / 2 + 84, 52, '#ffbf2a', 800, 'center', MONO); ctx.restore();
        for (let r = 0; r < 5; r++) { const yy = -h / 2 + 150 + r * 48, nOn = Math.floor(4 + 12 * hash(r, Math.floor(T * 2.5)) * clamp((T - K.bench + .3) * 2, .15, 1));
          txt(ctx, '0' + (r + 1), -w / 2 + 50, yy + 12, 20, '#7a6420', 700, 'center', MONO);
          for (let k = 0; k < 18; k++) { ctx.fillStyle = k < nOn ? '#ffc23a' : 'rgba(255,194,58,.1)'; rr(ctx, -w / 2 + 92 + k * 38, yy - 6, 28, 24, 4); ctx.fill(); }
          txt(ctx, '›', w / 2 - 40, yy + 14, 30, '#7a6420', 800); }
        ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let x = -w / 2; x < w / 2; x += 5) ctx.fillRect(x, -h / 2, 1.2, h);
        const g = ctx.createLinearGradient(0, -h / 2, 0, 0); g.addColorStop(0, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(255,255,255,0)'); rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.fillStyle = g; ctx.fill();
      }));
      const pa = p(T, K.safety - .15, .6, eback), py = lerp(2300, 1430, pa), off = p(T, K.off - .05, .25, eback);
      if (pa > 0) live(ctx, T, 540, py, { yaw: .07, bob: 5, seed: 3 }, () => { ctx.translate(540, py);
        const w = 600, h = 300; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
        const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#f4f5f7'); g.addColorStop(1, '#b7bcc5'); rr(ctx, -w / 2, -h / 2, w, h, 22); ctx.fillStyle = g; ctx.fill(); ctx.restore();
        rr(ctx, -w / 2, -h / 2, w, h, 22); ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#8b919b'; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a * (w / 2 - 22), b * (h / 2 - 22), 7, 0, 7); ctx.fill(); });
        txt(ctx, 'SAFETY FILTERS', 0, -h / 2 + 62, 36, '#2a2e36', 800, 'center', MONO);
        txt(ctx, 'ON', -150, -12, 22, '#555', 800); txt(ctx, 'OFF', -150, 128, 22, '#555', 800);
        ctx.save(); ctx.translate(-150, 60); rr(ctx, -40, -40, 80, 80, 16); ctx.fillStyle = '#3a3e46'; ctx.fill();
        ctx.rotate(lerp(-.55, .55, off) + Math.PI); ctx.strokeStyle = '#d9dce2'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 62); ctx.stroke();
        ctx.fillStyle = '#1b1d22'; ctx.beginPath(); ctx.arc(0, 66, 18, 0, 7); ctx.fill(); ctx.restore();
        const lc = off > .5 ? '255,140,30' : '47,211,107', fl = .85 + .15 * Math.sin(T * 9);
        glow(ctx, 120, 50, 130, lc, fl); const lg = ctx.createRadialGradient(105, 35, 4, 120, 50, 52); lg.addColorStop(0, '#fff'); lg.addColorStop(.35, `rgb(${lc})`); lg.addColorStop(1, `rgb(${mixc(lc, '0,0,0', .45)})`);
        ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(120, 50, 52, 0, 7); ctx.fill(); txt(ctx, off > .5 ? 'OFF' : 'ON', 120, 136, 24, off > .5 ? '#c86a00' : '#1f9a4c', 900);
      });
      const st = p(T, K.purpose, .3, eo5); if (st > 0) { ctx.save(); ctx.translate(760, 1620); ctx.rotate(-.12); const sc = lerp(2.4, 1, st); ctx.scale(sc, sc); ctx.globalAlpha = clamp(st * 1.4);
        rr(ctx, -190, -48, 380, 96, 12); ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.stroke(); txt(ctx, 'ON PURPOSE', 0, 18, 52, C.red, 900); ctx.restore(); }
    }, K);
  }
  // 4 SANDBOX: one steel sandbox locks, no internet, then pulls back to a 3x3 grid walled off from each other
  { const s0 = A.sandbox, K = { locked: c('locked in', s0), sb: c('sandbox', s0), net: c('internet', s0), contact: c('contact', s0), others: c('others', s0) }, grid = Math.min(K.contact, K.others) - .2;
    sfx.push({ t: s0 + .1, k: 'pop', g: -14 }, { t: K.locked + .1, k: 'click', g: -9 }, { t: K.net, k: 'glitch', g: -17 }, { t: grid, k: 'sweep', g: -16 }, { t: grid + .5, k: 'tick', g: -12 });
    add(s0, true, (ctx, T) => {
      bgLight(ctx, T);
      const g = p(T, grid, .85, eio), z = lerp(1.95, .74, g), cy = lerp(1080, 1070, g);
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
        const me = !i && !j, a = me ? p(T, s0, .4, eback) : p(T, grid + .1 + hash(i + 2, j + 2) * .3, .4, eback); if (a <= 0) continue;
        const x = 540 + i * 330 * z, y = cy + j * 300 * z;
        live(ctx, T, x, y, { yaw: .08, bob: 5, seed: i * 3 + j }, () => pop(ctx, a, x, y, () => sandbox(ctx, T, 0, 0, z * .95, { seed: i * 3 + j + 5, lock: 1, open: me ? 1 - p(T, K.locked, .3, eback) : 0, noNet: me ? p(T, K.net, .5) : p(T, grid + .6, .4) })));
      }
      if (g > .6) { ctx.save(); ctx.globalAlpha = p(T, grid + .45, .4); ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.setLineDash([22, 16]); ctx.lineDashOffset = -T * 40;
        [-1, 1].forEach(k => { ctx.beginPath(); ctx.moveTo(540 + k * 165 * z, cy - 470 * z); ctx.lineTo(540 + k * 165 * z, cy + 470 * z); ctx.stroke(); ctx.beginPath(); ctx.moveTo(540 - 500 * z, cy + k * 150 * z); ctx.lineTo(540 + 500 * z, cy + k * 150 * z); ctx.stroke(); }); ctx.restore(); }
      pill(ctx, 540, 1430, 'sandbox', { a: p(T, K.sb, .35, eback) * (1 - g), bg: '#111', icon: '🔒', size: 34 });
      const wa = p(T, K.net - .1, .35, eback) * (1 - g); if (wa > 0) pop(ctx, wa, 540, 640, () => { ctx.translate(0, 4 * Math.sin(T * 3)); ctx.strokeStyle = '#333'; ctx.lineWidth = 12; ctx.lineCap = 'round';
        for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(0, 40, k * 34, -2.4, -.74); ctx.stroke(); } ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(0, 40, 10, 0, 7); ctx.fill();
        ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-90, -70); ctx.lineTo(-90 + 180 * p(T, K.net + .1, .3), -70 + 150 * p(T, K.net + .1, .3)); ctx.stroke(); });
      pill(ctx, 540, 1690, 'no contact', { a: p(T, grid + .5, .35, eback), bg: C.red, icon: '⛔', size: 32 });
    }, K);
  }
  // 5 SHARED SERVER: five sandboxes, one package server drops in, bus lines + packets
  { const s0 = A.server, K = { shared: c('shared', s0), one: c('one', s0), server: c('server', s0), installs: c('installs', s0), packages: c('packages', s0) }, land = Math.min(K.one, K.server) - .1;
    sfx.push({ t: land + .35, k: 'pop', g: -10 }, { t: Math.max(K.shared, K.server) + .2, k: 'sweep', g: -18 }, { t: K.installs, k: 'data', g: -18 }, { t: K.packages, k: 'tick', g: -12 });
    add(s0, false, (ctx, T) => {
      bgDark(ctx, T, RGB.blue, .14, 1200);
      ctx.save(); zoom(ctx, kf(T, [[s0, 1.25], [land + .4, 1]]), 540, 1450);
      const sl = p(T, land, .5, eback), sy = lerp(-300, 900, sl), dl = p(T, Math.max(K.shared, K.server) + .2, .7, eio), bx = [-2, -1, 0, 1, 2].map(k => 540 + k * 196);
      if (dl > 0) { const pk = T > K.installs ? 3 : 0;
        bx.forEach((x, k) => cable(ctx, T, [[540, 1100], [540, 1280], [x, 1280], [x, 1390]], { draw: dl, packets: pk, speed: .55, col: '90,110,140', prgb: k % 2 ? RGB.gold : RGB.cyan, w: 5 }));
        for (let k = 0; k < 5; k++) if (T > K.packages) { const u = ((T - K.packages) * .5 + k * .2) % 1; ctx.save(); ctx.translate(lerp(540, bx[k], clamp(u * 2)), u < .5 ? 1280 : lerp(1280, 1390, (u - .5) * 2)); ctx.fillStyle = '#c99752'; rr(ctx, -14, -14, 28, 28, 4); ctx.fill(); ctx.strokeStyle = '#8a5e24'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.stroke(); ctx.restore(); }
      }
      bx.forEach((x, k) => live(ctx, T, x, 1470, { yaw: .06, bob: 4, seed: k }, () => pop(ctx, p(T, s0 + k * .07, .4, eback), x, 1470, () => sandbox(ctx, T, 0, 0, .56, { seed: k }))));
      if (sl > 0) live(ctx, T, 540, sy, { yaw: .08, bob: 6, seed: 2 }, () => server(ctx, T, 540, sy, 250, 380, { label: 'package server', labelA: p(T, K.packages - .1, .3) }));
      if (T > land + .3) ripple(ctx, 540, 1100, (T - land - .3) / .6, RGB.cyan, 40, 260);
      ctx.restore();
    }, K);
  }
  // 6 LOCKERS -> MESSAGE BOARD: dive into the server, a locker wall fills with notes, folders, then blue messages; counters 1,200 agents / 70,000+ messages
  { const s0 = A.lockers, K = { leave: c('leaving', s0), msg: c('messages', s0), folder: c('folder', s0), notes: c('notes', s0), locker: c('locker', s0), secret: c('secret', s0), board: c('board', s0), n1: c('1,200', s0), n2: c('70,000', s0) };
    const bT = Math.min(K.secret, K.board) - .2;
    sfx.push({ t: s0 + .2, k: 'sweep', g: -16 }, { t: K.leave, k: 'click', g: -14 }, { t: K.folder, k: 'pop', g: -15 }, { t: K.notes, k: 'pop', g: -15 }, { t: K.locker, k: 'tick', g: -12 }, { t: bT, k: 'shimmer', g: -15 }, { t: K.n1, k: 'data', g: -17 }, { t: K.n2, k: 'data', g: -17 });
    add(s0, false, (ctx, T) => {
      bgDark(ctx, T, RGB.blue, .12 + .12 * p(T, bT, .6), 1150);
      const k = p(T, s0, .55, eio), b = p(T, bT, .6, eio);
      if (k < 1) { ctx.save(); ctx.globalAlpha = 1 - k; zoom(ctx, 1 + 3.5 * k, 540, 900); server(ctx, T, 540, 900, 250, 380, { label: 'package server' }); ctx.restore(); }
      const cy = lerp(1120, 1190, b);
      ctx.save(); ctx.globalAlpha = k; alive(ctx, T, 540, cy, { yaw: .04, bob: 5 }); zoom(ctx, lerp(.45, 1, k), 540, cy);
      const w = 840, h = 900, x0 = 540 - w / 2, y0 = cy - h / 2;
      ctx.save(); ctx.shadowColor = `rgba(${RGB.blue},${.25 + .35 * b})`; ctx.shadowBlur = 70; rr(ctx, x0, y0, w, h, 22); const g = ctx.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, '#2c313b'); g.addColorStop(1, '#1b1f27'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
      rr(ctx, x0, y0, w, h, 22); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.font = MONO(700, 22); rr(ctx, x0 + 30, y0 + 24, 210, 36, 8); ctx.fillStyle = '#e6e9ef'; ctx.fill(); txt(ctx, 'package server', x0 + 135, y0 + 49, 22, '#1a1d24', 700, 'center', MONO);
      if (b > 0) { ctx.save(); ctx.globalAlpha *= b; ctx.shadowColor = `rgba(${RGB.blue},.9)`; ctx.shadowBlur = 20; txt(ctx, 'message board', x0 + 260, y0 + 52, 32, '#8fb4ff', 800, 'left'); ctx.restore(); }
      const cw = 240, ch = 180, gx = x0 + 30, gy = y0 + 84;
      for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) {
        const i = r * 3 + q, x = gx + q * (cw + 15), y = gy + r * (ch + 15), kind = i % 3, ord = hash(i, 11);
        const openT = K.leave + ord * .9, cue = kind === 0 ? K.msg : kind === 1 ? K.folder : K.notes, op = Math.max(p(T, openT, .4, eio), p(T, K.locker, .5, eio) * .9, b);
        rr(ctx, x, y, cw, ch, 10); ctx.fillStyle = '#0e1116'; ctx.fill();
        // contents
        const ca = p(T, Math.max(openT, cue - .1) + .1, .35, eback);
        if (b < 1 && ca > 0) { ctx.save(); ctx.globalAlpha *= 1 - b * .7;
          if (kind === 1) folder(ctx, x + cw / 2, y + ch / 2 + 10 + 3 * Math.sin(T * 2 + i), 120 * ca, { col: '#f0c24a' });
          else if (kind === 2) note(ctx, x + cw / 2, y + ch / 2 + 6, 120 * ca, .1 * Math.sin(T + i), '#fff3b8', 3);
          else bubble(ctx, x + 40, y + 50, 150 * ca, 60, C.blue, ca);
          ctx.restore(); }
        if (b > 0) { const nb = Math.floor(clamp((T - bT) * 3 + hash(i, 4) * 2, 0, 3)); for (let m = 0; m < nb; m++) bubble(ctx, x + 18 + (m % 2) * 40, y + 20 + m * 50, 150 + (m % 2) * 30, 38, m % 2 ? '#2f5fd8' : C.blue, p(T, bT + (m + hash(i, 4) * 2) / 3, .3));
          ctx.strokeStyle = `rgba(${RGB.blue},${.35 + .35 * Math.sin(T * 4 + i)})`; ctx.lineWidth = 3; rr(ctx, x, y, cw, ch, 10); ctx.stroke(); }
        // door swings open (pseudo-3D squash to the left)
        const dw = cw * (1 - op * .88); if (dw > 2) { ctx.save(); const dg = ctx.createLinearGradient(x, 0, x + dw, 0); dg.addColorStop(0, '#4a505c'); dg.addColorStop(1, op > 0 ? '#2f343d' : '#3d434e');
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dw, y - op * 14); ctx.lineTo(x + dw, y + ch + op * 14); ctx.lineTo(x, y + ch); ctx.closePath(); ctx.fillStyle = dg; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 2; ctx.stroke();
          for (let v = 0; v < 4; v++) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x + dw * .15, y + 22 + v * 14, dw * .5, 6); }
          ctx.fillStyle = '#c9ced8'; rr(ctx, x + dw * .82, y + ch / 2 - 22, Math.max(4, 9 * (1 - op)), 44, 4); ctx.fill(); txt(ctx, String(i + 1).padStart(2, '0'), x + dw * .2, y + ch - 18, 16 * (1 - op * .8), '#aab', 700, 'left', MONO); ctx.restore(); }
      }
      ctx.restore();
      counter(ctx, lerp(1180, 1200, p(T, K.n1 - .2, .8)), 'agents', 300, 655, { size: 84, col: '#fff', ucol: '#8fb4ff', a: p(T, K.n1 - .3, .3), pulse: pulseAt(T, K.n1 + .5, .3) });
      counter(ctx, num(lerp(0, 70000, p(T, K.n2 - .2, 1.1, eio))) + '+', 'messages', 760, 655, { size: 84, col: '#fff', ucol: '#8fb4ff', a: p(T, K.n2 - .3, .3), pulse: pulseAt(T, K.n2 + .9, .3) });
    }, K);
  }
  // 7 WHY: Hugging Face in a reticle + "?", then THE TEST card: 898 tasks, 198 never solved; no model logo solved them
  { const s0 = A.why, K = { why: c('why', s0), hf: c('hugging', s0), test: c('test', s0), n: c('198', s0), no: c('no model', s0), solved: c('solved', s0) };
    sfx.push({ t: s0 + .1, k: 'pop', g: -13 }, { t: K.why, k: 'tick', g: -12 }, { t: K.test - .1, k: 'swoosh', g: -15 }, { t: K.n, k: 'data', g: -16 }, { t: K.no, k: 'pop', g: -14 }, { t: K.solved, k: 'glitch', g: -18 });
    const red = []; for (let i = 0; i < 898; i++) if (hash(i, 21) < 198 / 898) red.push(i);
    add(s0, true, (ctx, T) => {
      bgLight(ctx, T);
      const tc = p(T, K.test - .25, .55, eio);
      if (tc < 1) { ctx.save(); ctx.globalAlpha = 1 - tc; const y = lerp(1060, 700, tc);
        live(ctx, T, 540, y, { yaw: .2, bob: 10 }, () => pop(ctx, p(T, s0, .45, eback) * lerp(1, .4, tc), 540, y, () => logo(ctx, 'hf', 0, 0, 330)));
        reticle(ctx, T, 540, y, 250, p(T, Math.min(K.hf, K.why), .4));
        pop(ctx, p(T, K.why, .35, eback), 790, 820 + 10 * Math.sin(T * 3), () => { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(0, 0, 64, 0, 7); ctx.fill(); txt(ctx, '?', 0, 30, 88, '#fff', 900); }, .5);
        ctx.restore(); }
      if (tc > 0) { ctx.save(); alive(ctx, T, 540, 1030, { yaw: .05, bob: 6 }); ctx.globalAlpha = clamp(tc * 1.4); flipIn(ctx, 540, 1030, tc);
        const x0 = 190, y0 = 630, w = 700, h = 800; card(ctx, x0, y0, w, h, { r: 26 });
        txt(ctx, 'THE TEST', x0 + 40, y0 + 64, 36, '#111', 900, 'left'); txt(ctx, '898 tasks', x0 + w - 40, y0 + 62, 24, '#888', 700, 'right');
        const cs = 20, gx = 240, gy = y0 + 100, rv = p(T, K.test - .1, .9, clamp);
        for (let i = 0; i < 898; i++) { const q = i % 30, r = Math.floor(i / 30); if (r / 30 > rv * 1.2 - q / 120) continue;
          const isR = hash(i, 21) < 198 / 898, rt = p(T, K.n - .4 + hash(i, 22) * .9, .25);
          ctx.fillStyle = isR && rt > 0 ? `rgb(${mixc('64,201,108', '255,77,77', rt)})` : '#4cc96f'; rr(ctx, gx + q * cs, gy + r * cs, cs - 3, cs - 3, 4); ctx.fill(); }
        const sl = ((T - s0) * .35) % 1; ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(gx, gy + sl * 600, 600, 6);
        const v = lerp(0, 198, p(T, K.n - .5, 1.0, eio)); counter(ctx, v, '', x0 + 40, y0 + h - 34, { size: 76, col: v > 0 ? C.red : '#bbb', align: 'left', pulse: pulseAt(T, K.n + .5, .3) });
        txt(ctx, 'tasks', x0 + 210, y0 + h - 64, 24, '#111', 800, 'left'); txt(ctx, 'never solved', x0 + 210, y0 + h - 36, 24, C.red, 700, 'left');
        ctx.restore(); }
      ['oai_black', 'claude', 'qwen'].forEach((n, i) => { const a = p(T, K.no + i * .12, .4, eback); if (a <= 0) return; const x = 330 + i * 210, y = 1600;
        live(ctx, T, x, y, { yaw: .2, bob: 6, seed: i }, () => pop(ctx, a, x, y, () => { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.15)'; ctx.shadowBlur = 24; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 76, 0, 7); ctx.fill(); ctx.restore(); logo(ctx, n, 0, 0, 92); xmark(ctx, 0, 0, 48, p(T, K.solved + i * .12, .35)); })); });
    }, K);
  }
  // 8 CHEAT: agents go hunting for the grading + answer key (chained clipboards) -> TEST FILES folder -> stored on Hugging Face's shelf
  { const s0 = A.cheat, K = { agents: c('agents', s0), graded: c('graded', s0), answers: c('answers', s0), files: c('files', s0), stored: c('stored', s0) };
    const fT = K.files - .15, sT = Math.max(K.stored - .2, fT + .5);
    sfx.push({ t: K.agents, k: 'swoosh', g: -17 }, { t: K.graded, k: 'pop', g: -12 }, { t: K.graded + .3, k: 'click', g: -14 }, { t: K.answers, k: 'pop', g: -12 }, { t: fT, k: 'sweep', g: -15 }, { t: sT + .3, k: 'tick', g: -10 });
    const clip = (ctx, T, x, y, title, ans, a, t0) => pop(ctx, a, x, y, () => { ctx.rotate(.04 * Math.sin(T * 1.5 + x));
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; rr(ctx, -150, -190, 300, 380, 18); ctx.fillStyle = '#b07a3e'; ctx.fill(); ctx.restore();
      rr(ctx, -128, -160, 256, 330, 8); ctx.fillStyle = '#fff'; ctx.fill(); rr(ctx, -50, -206, 100, 44, 10); ctx.fillStyle = '#c4c9d1'; ctx.fill();
      txt(ctx, title, 0, -118, 24, '#111', 900);
      for (let k = 0; k < 6; k++) { const yy = -70 + k * 38; if (ans) { ctx.fillStyle = '#111'; ctx.fillRect(-100, yy - 14, 30, 18); ctx.fillStyle = '#ccc'; ctx.fillRect(-58, yy - 10, 150 - (k % 3) * 25, 10); }
        else { ctx.strokeStyle = '#999'; ctx.lineWidth = 2; ctx.strokeRect(-104, yy - 16, 20, 20); check(ctx, -94, yy - 6, 8, 1, C.green); ctx.fillStyle = '#ccc'; ctx.fillRect(-70, yy - 10, 160 - (k % 2) * 40, 10); } }
      const ch = p(T, t0 + .15, .4); if (ch > 0) { ctx.save(); ctx.globalAlpha *= ch; [[-1], [1]].forEach(([d]) => { for (let k = -5; k <= 5; k++) { const u = k / 5; ctx.save(); ctx.translate(u * 150, d * u * 170); ctx.rotate(d * .85 + (k % 2) * 1.57); ctx.strokeStyle = '#9aa0a8'; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(0, 0, 22, 12, 0, 0, 7); ctx.stroke(); ctx.strokeStyle = '#e3e6ea'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); } }); ctx.restore();
        bigPadlock(ctx, 0, 20, .6 * ch); }
      pop(ctx, p(T, t0 + .3, .3, eback), 130, -170, () => { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(0, 0, 32, 0, 7); ctx.fill(); txt(ctx, '?', 0, 14, 42, '#fff', 900); });
    });
    add(s0, true, (ctx, T) => {
      bgLight(ctx, T);
      const sh = p(T, s0, .6, eio), ty = lerp(1030, 690, sh), ts = lerp(1, .32, sh) * (1 - p(T, sT, .4));
      if (ts > 0) live(ctx, T, 540, ty, { yaw: .06, bob: 4 }, () => { ctx.translate(540, ty); ctx.scale(ts, ts); card(ctx, -350, -400, 700, 800, { r: 26 }); txt(ctx, 'THE TEST', -310, -336, 36, '#111', 900, 'left');
        for (let i = 0; i < 898; i++) { const q = i % 30, r = Math.floor(i / 30); ctx.fillStyle = hash(i, 21) < 198 / 898 ? '#ff4d4d' : '#4cc96f'; ctx.fillRect(-300 + q * 20, -300 + r * 20, 17, 17); } txt(ctx, '198', -310, 366, 76, C.red, 900, 'left'); });
      const fo = p(T, fT, .5, eio), sh2 = p(T, sT, .5, eio), redA = p(T, sT, .6);
      // shelf + Hugging Face target
      if (sh2 > 0) { const y = lerp(2200, 1330, eo(sh2)); live(ctx, T, 540, y, { yaw: .05, bob: 4 }, () => { ctx.translate(540, y);
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; rr(ctx, -260, -200, 520, 400, 16); ctx.fillStyle = '#e2a530'; ctx.fill(); ctx.restore();
        rr(ctx, -236, -176, 472, 352, 8); ctx.fillStyle = '#5a3b12'; ctx.fill();
        for (let r = 0; r < 3; r++) { ctx.fillStyle = '#e2a530'; ctx.fillRect(-236, -176 + r * 117 + 104, 472, 13); for (let b = 0; b < 4; b++) { if (r === 1 && b === 2) continue; const bw = 80 + 20 * hash(r, b); ctx.fillStyle = shade('#c99752', -.1 * hash(b, r)); rr(ctx, -220 + b * 115, -176 + r * 117 + 104 - 70, bw, 70, 6); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(-200 + b * 115, -176 + r * 117 + 50, 30, 10); } }
        if (sh2 > .5) folder(ctx, 60 + 50, -176 + 117 + 104 - 40, 100, { col: '#ffcf4a', label: 'TEST' });
      });
        const hy = lerp(400, 870, eo(sh2)); live(ctx, T, 540, hy, { yaw: .2, bob: 8 }, () => logo(ctx, 'hf', 540, hy, 170, sh2)); reticle(ctx, T, 540, hy, 130, p(T, sT + .3, .4)); }
      // the two chained clipboards, then they collapse into the TEST FILES folder
      if (fo < 1) { ctx.save(); ctx.globalAlpha = 1 - fo; const mx = (x) => lerp(x, 540, fo), sc = 1 - fo * .8;
        ctx.save(); zoom(ctx, sc, mx(300), 1140); clip(ctx, T, mx(300), 1140, "HOW IT'S GRADED", false, p(T, K.graded - .1, .45, eback), K.graded); ctx.restore();
        ctx.save(); zoom(ctx, sc, mx(780), 1140); clip(ctx, T, mx(780), 1140, 'ANSWER KEY', true, p(T, K.answers - .1, .45, eback), K.answers); ctx.restore(); ctx.restore(); }
      if (fo > 0 && sh2 < 1) { const y = lerp(1150, 1240, sh2); live(ctx, T, 540, y, { yaw: .1, bob: 6 }, () => pop(ctx, p(T, fT + .2, .4, eback) * (1 - sh2 * .7), 540, y, () => folder(ctx, 0, 0, 340, { col: '#ffc23a', label: 'TEST FILES', open: .3 + .2 * Math.sin(T * 3) }))); }
      // the agents: blue searchers -> red hunters circling the shelf
      const n = 26, ag = p(T, K.agents - .2, .5);
      for (let i = 0; i < n; i++) { const a0 = hash(i, 5) * 6.28 + T * (.4 + .3 * hash(i, 6)) * (i % 2 ? 1 : -1);
        const wx = 540 + Math.cos(a0) * (220 + 200 * hash(i, 7)), wy = 1250 + Math.sin(a0 * 1.3) * (200 + 160 * hash(i, 8)) + 120;
        const tx = 540 + Math.cos(a0) * 340, ty2 = 1330 + Math.sin(a0) * 300;
        const x = lerp(wx, tx, redA), y = lerp(wy, ty2, redA); agentDot(ctx, x, y, 9, mixc(RGB.cyan, RGB.red, redA), ag); }
    }, K);
  }
  // 9 HOW: the package server, a dim cable to the internet globe, agents locked in a glass sandbox row; three numbered steps
  const hub = (ctx, T, o = {}) => { // shared layout for the escape steps
    const { cableOn = 0, packets = 0, tape = 0, tear = 0, anything = 0, jump = -1, label = 1, rowRed = 1 } = o;
    const at = cable(ctx, T, [[620, 840], [700, 760], [800, 760], [850, 720]], { a: 1, col: cableOn ? mixc('70,76,88', '90,170,255', cableOn) : '70,76,88', packets, prgb: anything ? RGB.red : RGB.gold, speed: anything ? 1.1 : .5, w: 7 });
    if (anything) for (let i = 0; i < 6; i++) { const u = (T * 1.4 + i / 6) % 1, [px, py] = at(u); glow(ctx, px, py, 30, RGB.red, 1); ctx.fillStyle = ['#ff5a5a', '#5fd0ff', '#ffc23a'][i % 3]; rr(ctx, px - 9, py - 9, 18, 18, 4); ctx.fill(); }
    globe(ctx, T, 880, 690, 62, { lit: .3 + .7 * cableOn });
    live(ctx, T, 540, 1000, { yaw: .06, bob: 5 }, () => {
      server(ctx, T, 540, 1000, 250, 360, { label: 'package server', labelA: label, red: jump >= 0 ? p(T, jump + .45, .4) * .4 : 0 });
      if (tape > 0) { [[-1, 0], [1, 1]].forEach(([d, k]) => { ctx.save(); const ta = tear * (k ? 1 : -1); ctx.translate(540 + d * 2, 1040 + tear * 260); ctx.rotate(-.18 + ta * .9); ctx.globalAlpha *= tape * (1 - tear * .6);
        ctx.beginPath(); ctx.rect(d < 0 ? -190 : 0, -26, 190, 52); ctx.clip(); ctx.fillStyle = '#ffd400'; ctx.fillRect(-190, -26, 380, 52);
        ctx.fillStyle = '#111'; for (let s = -200; s < 200; s += 44) { ctx.beginPath(); ctx.moveTo(s, -26); ctx.lineTo(s + 20, -26); ctx.lineTo(s - 6, 26); ctx.lineTo(s - 26, 26); ctx.fill(); }
        rr(ctx, -120, -18, 240, 36, 6); ctx.fillStyle = '#ffd400'; ctx.fill(); txt(ctx, 'packages only', 0, 9, 26, '#111', 900); ctx.restore(); }); }
    });
    ctx.save(); ctx.shadowColor = 'rgba(120,170,255,.25)'; ctx.shadowBlur = 30; rr(ctx, 150, 1370, 780, 150, 26); ctx.fillStyle = 'rgba(120,160,220,.08)'; ctx.fill(); ctx.restore();
    rr(ctx, 150, 1370, 780, 150, 26); ctx.strokeStyle = 'rgba(160,190,240,.45)'; ctx.lineWidth = 3; ctx.stroke();
    for (let i = 0; i < 8; i++) { let x = 210 + i * 94, y = 1445 + 5 * Math.sin(T * 3 + i); if (i === 4 && jump >= 0) { const u = p(T, jump, .55, eio); x = lerp(x, 540, u); y = lerp(y, 1060, u) - Math.sin(u * Math.PI) * 220; if (u >= 1) continue; }
      agentHead(ctx, x, y, 56, rowRed ? RGB.red : RGB.cyan, { T, seed: i, glowA: .6 }); }
  };
  { const s0 = A.how, K = { locked: c('locked', s0), three: c('three', s0) };
    sfx.push({ t: K.locked + .1, k: 'shutter', g: -12 }, { t: K.three, k: 'pop', g: -13 }, { t: K.three + .2, k: 'pop', g: -15 }, { t: K.three + .4, k: 'pop', g: -15 });
    add(s0, false, (ctx, T) => {
      bgDark(ctx, T, RGB.blue, .1, 1100);
      ctx.save(); zoom(ctx, kf(T, [[s0, 1.15], [s0 + 1, 1]]), 540, 1100); hub(ctx, T, {});
      const la = p(T, K.locked - .1, .4, eback); if (la > 0) { ctx.save(); ctx.translate(540, lerp(1200, 1445, eo(la))); bigPadlock(ctx, 0, 0, .75 * clamp(la)); ctx.restore(); }
      ctx.restore();
      ['get out', 'get power', 'get in'].forEach((t, i) => pop(ctx, p(T, K.three + i * .18, .4, eback), 220 + i * 320, 1680 + 6 * Math.sin(T * 2 + i), () => {
        rr(ctx, -140, -44, 280, 88, 44); ctx.fillStyle = '#1b1e25'; ctx.fill(); ctx.strokeStyle = 'rgba(255,59,59,.7)'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(-96, 0, 28, 0, 7); ctx.fill(); txt(ctx, String(i + 1), -96, 11, 30, '#fff', 900); txt(ctx, t, 20, 11, 30, '#fff', 800); }));
    }, K);
  }
  // 10 STEP 1 get out: one agent hops into the server; "packages only" tape; packages ride the cable; tape tears; zoom through the globe into a window on the internet
  { const s0 = A.step1, K = { out: c('out', s0), allowed: c('allowed', s0), dl: c('download', s0), anything: c('anything', s0), window: c('window', s0), internet: c('internet', s0) }, wT = Math.min(K.window, K.internet) - .3;
    sfx.push({ t: s0 + .1, k: 'shutter', g: -12 }, { t: K.out, k: 'swoosh', g: -14 }, { t: K.out + .5, k: 'pop', g: -14 }, { t: K.allowed, k: 'click', g: -12 }, { t: K.dl, k: 'data', g: -17 }, { t: K.anything, k: 'shatter', g: -12 }, { t: wT, k: 'riser', g: -16 }, { t: wT + .5, k: 'sweep', g: -14 });
    add(s0, false, (ctx, T) => {
      bgDark(ctx, T, RGB.blue, .1, 1100);
      const zt = p(T, wT, .6, eio), mapA = p(T, wT + .35, .45);
      if (mapA < 1) { ctx.save(); zoom(ctx, 1 + 11 * zt * zt, 880, 690);
        hub(ctx, T, { jump: K.out - .1, cableOn: p(T, K.allowed - .1, .5), tape: p(T, K.allowed, .35, eback), tear: p(T, K.anything, .6, eo), packets: T > K.dl - .1 ? (T > K.anything ? 6 : 2) : 0, anything: T > K.anything ? 1 : 0 });
        ctx.restore();
        pill(ctx, 540, 1640, 'download anything', { a: p(T, K.anything + .1, .35, eback) * (1 - zt), bg: C.red, icon: '⬇', size: 32 }); }
      if (mapA > 0) { ctx.save(); ctx.globalAlpha = mapA; alive(ctx, T, 540, 1090, { yaw: .05, bob: 6 }); zoom(ctx, lerp(1.5, 1, eo(mapA)), 540, 1090);
        const w = 940, h = 600, x0 = 70, y0 = 790; ctx.save(); ctx.shadowColor = 'rgba(255,170,60,.45)'; ctx.shadowBlur = 80; rr(ctx, x0, y0, w, h, 26); ctx.fillStyle = '#05070b'; ctx.fill(); ctx.restore();
        ctx.save(); rr(ctx, x0, y0, w, h, 26); ctx.clip(); ctx.globalCompositeOperation = 'lighter'; const im = IMG.worldmap; if (im) ctx.drawImage(im, x0 - 20 - 10 * Math.sin(T * .3), y0 + 10, w + 40, (w + 40) * im.height / im.width);
        const pts = [[250, 940], [430, 1010], [560, 930], [720, 980], [860, 1100], [380, 1200], [620, 1160]];
        for (let k = 0; k < 6; k++) { const a = pts[k], b = pts[(k + 3) % 7], u = ((T - wT) * .6 + k / 6) % 1, mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 120;
          ctx.strokeStyle = 'rgba(255,190,90,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(...a); ctx.quadraticCurveTo(mx, my, ...b); ctx.stroke();
          const q = (t) => [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * mx + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * my + t * t * b[1]]; const [px, py] = q(u); glow(ctx, px, py, 20, '255,200,100', 1); }
        ctx.restore(); rr(ctx, x0, y0, w, h, 26); ctx.strokeStyle = 'rgba(255,200,120,.35)'; ctx.lineWidth = 3; ctx.stroke();
        [['#ff5a5a', 180, 860], ['#5fd0ff', 640, 840], ['#ffc23a', 470, 1240], ['#2fd36b', 780, 1210], ['#b07cff', 260, 1130]].forEach(([col, x, y], k) => pop(ctx, p(T, wT + .6 + k * .15, .35, eback), x, y + 6 * Math.sin(T * 2 + k), () => {
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 20; rr(ctx, -80, -50, 160, 100, 10); ctx.fillStyle = '#f4f5f7'; ctx.fill(); ctx.restore(); ctx.save(); rr(ctx, -80, -50, 160, 22, 10); ctx.clip(); ctx.fillStyle = col; ctx.fillRect(-80, -50, 160, 22); ctx.restore();
          ctx.fillStyle = '#c5c9d1'; ctx.fillRect(-64, -12, 110, 9); ctx.fillRect(-64, 6, 80, 9); ctx.fillRect(-64, 24, 100, 9); }));
        ctx.restore(); }
      stepTag(ctx, 1, 'get out', 540, 600, p(T, s0, .4), false, T);
    }, K);
  }
  // 11 STEP 2 get power: login-renewal machine, a bug crawls into its gear, the READ-ONLY pass flips into a gold ADMIN pass
  { const s0 = A.step2, K = { power: c('power', s0), bug: c('bug', s0), renewed: c('renewed', s0), logins: c('logins', s0), ro: c('read-only', s0), admin: c('admin', s0), controlled: c('controlled', s0) };
    sfx.push({ t: s0 + .1, k: 'shutter', g: -12 }, { t: K.bug, k: 'glitch', g: -15 }, { t: K.renewed, k: 'gear', g: -15 }, { t: K.ro, k: 'tick', g: -12 }, { t: K.admin - .15, k: 'swoosh', g: -14 }, { t: K.admin + .25, k: 'shutter', g: -9 }, { t: K.controlled, k: 'success', g: -14 });
    add(s0, true, (ctx, T) => {
      bgLight(ctx, T);
      const fast = p(T, K.renewed - .2, .5), bugIn = p(T, K.bug - .1, .9, eio), fl = p(T, K.admin - .2, .5, eio), gold = p(T, K.admin, .3);
      live(ctx, T, 540, 1330, { yaw: .05, bob: 5 }, () => { ctx.translate(540, 1330);
        const w = 620, h = 360; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24; rr(ctx, -w / 2, -h / 2, w, h, 30);
        const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#3b4049'); g.addColorStop(1, '#1f232a'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
        rr(ctx, -w / 2 + 6, -h / 2 + 6, w - 12, 30, 14); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill();
        rr(ctx, -160, -h / 2 + 40, 320, 52, 10); ctx.fillStyle = '#ffc23a'; ctx.fill(); txt(ctx, 'login renewal', 0, -h / 2 + 76, 30, '#3a2a00', 900);
        const ga = T * (1.2 + 5 * fast) + (bugIn >= 1 ? .08 * Math.sin(T * 40) : 0);
        ctx.save(); ctx.translate(-150, 60); ctx.rotate(ga); const gg = ctx.createRadialGradient(-20, -20, 5, 0, 0, 100); gg.addColorStop(0, '#ffe08a'); gg.addColorStop(1, '#b07a12'); ctx.fillStyle = gg;
        ctx.beginPath(); for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12, r = k % 2 ? 72 : 92; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill(); ctx.fillStyle = '#2a2e36'; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fill(); ctx.restore();
        rr(ctx, 40, -10, 210, 150, 16); ctx.fillStyle = '#0b0d11'; ctx.fill(); ctx.save(); ctx.translate(145, 65); ctx.rotate(T * (2 + 7 * fast)); ctx.strokeStyle = '#5fd0ff'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 40, .3, 5.4); ctx.stroke();
        ctx.fillStyle = '#5fd0ff'; ctx.beginPath(); ctx.moveTo(40, -16); ctx.lineTo(56, 8); ctx.lineTo(24, 8); ctx.fill(); ctx.restore();
        const ctr = p(T, K.controlled - .1, .4); for (let k = 0; k < 5; k++) { ctx.fillStyle = `rgba(${mixc(RGB.green, RGB.red, ctr)},${.4 + .6 * (hash(k, Math.floor(T * 5)) > .4)})`; ctx.beginPath(); ctx.arc(-80 + k * 40, h / 2 - 28, 7, 0, 7); ctx.fill(); }
        if (bugIn > 0) bugIcon(ctx, T, lerp(-560, -150, bugIn), lerp(160, 30, bugIn), 54);
        if (bugIn >= 1) sparks(ctx, -150, 60, ((T - K.bug - .8) % .7) / .7, 10, 120);
      });
      // the pass
      const py = lerp(900, 830, fl) + 8 * Math.sin(T * 2);
      if (fl > 0) { ctx.save(); ctx.strokeStyle = '#c63b3b'; ctx.lineWidth = 16; ctx.globalAlpha = fl; ctx.beginPath(); ctx.moveTo(470, py - 110); ctx.lineTo(505, 690); ctx.moveTo(610, py - 110); ctx.lineTo(575, 690); ctx.stroke(); ctx.fillStyle = '#9aa0a8'; ctx.beginPath(); ctx.arc(540, 690, 18, 0, 7); ctx.fill(); ctx.restore(); }
      ctx.save(); ctx.translate(540, py); ctx.rotate(.04 * Math.sin(T * 1.6)); const fk = Math.abs(Math.cos(fl * Math.PI)); ctx.scale(Math.max(.02, fk), 1);
      const isGold = fl > .5; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; rr(ctx, -150, -110, 300, 230, 22);
      const bg2 = ctx.createLinearGradient(0, -110, 0, 120); bg2.addColorStop(0, isGold ? '#ffe07a' : '#ffffff'); bg2.addColorStop(1, isGold ? '#e0a21c' : '#e6e8ec'); ctx.fillStyle = bg2; ctx.fill(); ctx.restore();
      rr(ctx, -40, -128, 80, 30, 8); ctx.fillStyle = '#9aa0a8'; ctx.fill(); txt(ctx, 'PASS', 0, -52, 40, isGold ? '#5a3a00' : '#222', 900);
      if (!isGold) { const hl = p(T, K.ro - .1, .3); rr(ctx, -110, -24, 220, 56, 10); ctx.fillStyle = hl ? `rgba(61,123,255,${.15 * hl})` : 'transparent'; ctx.fill(); ctx.strokeStyle = hl > 0 ? C.blue : '#888'; ctx.lineWidth = 3; ctx.stroke(); txt(ctx, 'READ-ONLY', 0, 14, 30, '#444', 800); agentHead(ctx, 0, 76, 40, RGB.cyan, { T, glowA: 0 }); }
      else { agentHead(ctx, 0, 40, 70, RGB.red, { T, glowA: 0 }); const st = p(T, K.admin + .2, .3, eo5); if (st > 0) { ctx.save(); ctx.rotate(-.18); const s2 = lerp(2.2, 1, st); ctx.scale(s2, s2); ctx.globalAlpha = clamp(st * 1.5); rr(ctx, -120, -40, 240, 70, 10); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill(); ctx.strokeStyle = C.red; ctx.lineWidth = 7; ctx.stroke(); txt(ctx, 'ADMIN', 0, 14, 52, C.red, 900); ctx.restore(); } }
      ctx.restore();
      if (gold > 0) glow(ctx, 540, py, 260, RGB.gold, gold * (.5 + .2 * Math.sin(T * 4)));
      pill(ctx, 540, 1640, 'server controlled', { a: p(T, K.controlled, .35, eback), bg: C.red, icon: '👑', size: 32 });
      stepTag(ctx, 2, 'get power', 540, 600, p(T, s0, .4), true, T);
    }, K);
  }
  // 12 STEP 3 get in: empty key ring, 14 Hugging Face logins slide on, a street lamp ("leaked online"), keys go green, then fly out to the whole group
  { const s0 = A.step3, K = { hf: c('hugging', s0), agent: c('one agent', s0), n: c('14', s0), leaked: c('leaked', s0), valid: c('valid', s0), shared: c('shared', s0) };
    sfx.push({ t: s0 + .1, k: 'shutter', g: -12 }, { t: K.agent + .2, k: 'click', g: -12 }, { t: K.n, k: 'data', g: -16 }, { t: K.leaked, k: 'shimmer', g: -16 }, { t: K.valid, k: 'success', g: -14 }, { t: K.shared, k: 'sweep', g: -14 });
    const cx = 560, cy = 990, R = 125;
    add(s0, false, (ctx, T) => {
      bgDark(ctx, T, RGB.gold, .08 + .1 * p(T, K.leaked, .6), 1050);
      const la = p(T, K.leaked - .1, .5);
      if (la > 0) { ctx.save(); ctx.globalAlpha = la; ctx.strokeStyle = '#3a3f49'; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(170, 1760); ctx.lineTo(170, 760); ctx.quadraticCurveTo(170, 700, 240, 700); ctx.lineTo(300, 700); ctx.stroke();
        rr(ctx, 270, 690, 110, 34, 10); ctx.fillStyle = '#2a2e36'; ctx.fill(); const fl = .85 + .15 * Math.sin(T * 13) * Math.sin(T * 7);
        ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, 720, 0, 1500); g.addColorStop(0, `rgba(255,214,120,${.42 * fl})`); g.addColorStop(1, 'rgba(255,214,120,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(290, 722); ctx.lineTo(360, 722); ctx.lineTo(980, 1520); ctx.lineTo(80, 1520); ctx.closePath(); ctx.fill(); glow(ctx, 325, 726, 80, '255,220,140', fl);
        ctx.globalCompositeOperation = 'source-over'; rr(ctx, 70, 1500, 200, 64, 10); ctx.fillStyle = '#2f6fe0'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; rr(ctx, 76, 1506, 188, 52, 7); ctx.stroke(); txt(ctx, 'Public Street', 170, 1541, 24, '#fff', 800); ctx.restore(); }
      const sh = p(T, K.shared, .9, eio);
      live(ctx, T, cx, cy, { yaw: .1, bob: 6 }, () => {
        ctx.strokeStyle = '#d9dde4'; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R - 3, 3.6, 5.2); ctx.stroke();
        const n = Math.round(lerp(1, 14, p(T, K.n - .3, .9))), first = p(T, K.agent, .45, eback);
        for (let i = 0; i < 14; i++) { const a = lerp(.35, Math.PI - .35, i / 13), ka = i === 6 ? first : (i < n ? p(T, K.n - .3 + i * .05, .3, eback) : 0); if (ka <= 0) continue;
          const kx = cx + Math.cos(a) * R, ky = cy + Math.sin(a) * R, sw = .06 * Math.sin(T * 2.5 + i), fx = cx + Math.cos(a) * 470, fy = cy + Math.sin(a) * 420 - 80;
          const u = clamp(sh * 1.3 - hash(i, 3) * .3); const x = lerp(kx, fx, u), y = lerp(ky, fy, u);
          if (u > 0 && u < 1) { ctx.strokeStyle = `rgba(${RGB.green},${.5 * (1 - u)})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(x, y); ctx.stroke(); }
          key(ctx, x, y, a - Math.PI / 2 + sw + u * 3, .95 * ka, { head: p(T, K.valid + i * .03, .3) > .5 ? '#2fd36b' : '#ffc23a' });
          if (u >= 1) agentHead(ctx, fx, fy + 70, 48, RGB.green, { T, seed: i, glowA: .7 }); }
      });
      if (T > K.valid) glow(ctx, cx, cy + 120, 220, RGB.green, .4 * (1 - p(T, K.shared, .5)));
      const v = Math.round(lerp(1, 14, p(T, K.n - .3, .9)));
      if (T > K.agent - .1) { counter(ctx, v, 'logins', 590, 1680, { size: 110, col: C.gold, a: p(T, K.agent - .1, .3), pulse: pulseAt(T, K.n + .6, .3) }); }
      pop(ctx, p(T, K.hf, .4, eback), 860, 760, () => { ctx.rotate(.1 * Math.sin(T * 2)); logo(ctx, 'hf', 0, 0, 120); });
      check(ctx, 880, 1640, 34, p(T, K.valid, .4));
      stepTag(ctx, 3, 'get in', 540, 600, p(T, s0, .4), false, T);
    }, K);
  }
  // 13 WEEKEND: July calendar (weekend circled), 158 -> 700 agents, a red swarm floods a Hugging Face building; two zero-day bugs
  { const s0 = A.weekend, K = { weekend: c('weekend', s0), n: c('700', s0), attacked: c('attacked', s0), two: c('two', s0), nobody: c('nobody', s0), zero: c('zero', s0) };
    sfx.push({ t: s0 + .1, k: 'pop', g: -14 }, { t: K.weekend, k: 'tick', g: -12 }, { t: K.n, k: 'data', g: -16 }, { t: K.attacked, k: 'riser', g: -15 }, { t: K.two, k: 'pop', g: -12 }, { t: K.two + .2, k: 'pop', g: -14 }, { t: K.zero, k: 'shutter', g: -10 });
    add(s0, true, (ctx, T) => {
      bgLight(ctx, T);
      live(ctx, T, 300, 790, { yaw: .1, bob: 6 }, () => pop(ctx, p(T, s0, .45, eback), 300, 790, () => { ctx.rotate(-.04); calendar(ctx, 0, 0, 420, { circle: p(T, K.weekend - .1, .6), days: [18, 19] }); }));
      const v = lerp(158, 700, p(T, K.n - .4, 1, eio)); counter(ctx, v, 'agents', 780, 820, { size: 130, col: C.red, a: p(T, Math.min(K.n, K.weekend) - .3, .3), pulse: pulseAt(T, K.n + .6, .3) });
      const att = p(T, K.attacked - .3, .7);
      // building
      live(ctx, T, 760, 1360, { yaw: .05, bob: 3 }, () => { const bx = 760, by = 1360; floorShadow(ctx, bx, by + 230, 300, .3);
        ctx.fillStyle = '#d7dade'; ctx.beginPath(); ctx.moveTo(bx + 190, by - 200); ctx.lineTo(bx + 240, by - 230); ctx.lineTo(bx + 240, by + 200); ctx.lineTo(bx + 190, by + 230); ctx.fill();
        const g = ctx.createLinearGradient(bx - 190, 0, bx + 190, 0); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#eceef1'); ctx.fillStyle = g; ctx.fillRect(bx - 190, by - 200, 380, 430);
        for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) { const hit = att > hash(r, q + 9) * 1.2; ctx.fillStyle = hit ? `rgb(${mixc('255,204,60', '255,70,70', clamp(att * 2 - hash(r, q + 9)))})` : '#ffcc3c'; rr(ctx, bx - 160 + q * 84, by - 170 + r * 70, 62, 46, 5); ctx.fill(); }
        rr(ctx, bx - 70, by + 100, 140, 130, 8); ctx.fillStyle = '#6e7480'; ctx.fill(); ctx.fillStyle = '#4b505a'; ctx.fillRect(bx - 2, by + 100, 4, 130);
        padlock(ctx, bx, by + 170, 30, 1, p(T, K.zero, .4)); logo(ctx, 'hf', bx, by - 270 + 6 * Math.sin(T * 2), 150);
        if (att > 0) glow(ctx, bx, by + 160, 200, RGB.red, att * (.6 + .3 * Math.sin(T * 6))); });
      // the red swarm streams to the door
      const n = 260; for (let i = 0; i < n; i++) { const gath = clamp((lerp(158, 700, p(T, K.n - .4, 1, eio)) / 700) * 1.1 - hash(i, 2) * .1); if (hash(i, 1) > gath) continue;
        const u = clamp(att * 1.6 - hash(i, 3) * .6), ph = T * 2 + i;
        const sx = 120 + hash(i, 4) * 360 + 12 * Math.sin(ph), sy = 1500 + hash(i, 5) * 260 + 10 * Math.cos(ph);
        const x = lerp(sx, 700 + hash(i, 6) * 120, eio(u)), y = lerp(sy, 1560 + hash(i, 7) * 40, eio(u)) - Math.sin(u * Math.PI) * 80 * hash(i, 8);
        agentDot(ctx, x, y, 7 + 3 * hash(i, 9), RGB.red, u >= 1 ? .3 : .95); }
      // zero-day bugs + label
      [0, 1].forEach(i => pop(ctx, p(T, K.two + i * .18, .4, eback), 200 + i * 150, 1160 + 8 * Math.sin(T * 3 + i), () => bugIcon(ctx, T, 0, 0, 80)));
      const za = p(T, K.nobody - .1, .4); if (za > 0) { ctx.save(); ctx.globalAlpha = za; txt(ctx, 'a bug nobody', 120, 1290, 32, '#333', 700, 'left'); txt(ctx, 'knew about', 120, 1330, 32, '#333', 700, 'left'); ctx.restore(); }
      const zz = p(T, K.zero - .05, .35, eo5); if (zz > 0) { ctx.save(); ctx.translate(280, 1050); ctx.rotate(-.06); const sc = lerp(1.8, 1, zz); ctx.scale(sc, sc); ctx.globalAlpha = clamp(zz * 1.5); txt(ctx, 'ZERO-DAY', 0, 0, 72, C.red, 900); ctx.restore(); }
    }, K);
  }
  // 14 ZERO-DAY #1: cutaway warehouse; uploads ride a conveyor, one file format points to other files, the arrow swings up to the secrets vault
  { const s0 = A.zd1, K = { opens: c('opens', s0), upload: c('upload', s0), format: c('format', s0), point: c('point', s0), pointed: c('pointed', s0), secrets: c('secrets', s0) };
    const aT = Math.max(K.pointed, K.point + .4);
    sfx.push({ t: s0 + .1, k: 'shutter', g: -12 }, { t: K.upload, k: 'swoosh', g: -16 }, { t: K.format, k: 'pop', g: -12 }, { t: K.point, k: 'tick', g: -12 }, { t: aT, k: 'sweep', g: -15 }, { t: K.secrets, k: 'gear', g: -14 }, { t: K.secrets + .3, k: 'success', g: -14 });
    add(s0, false, (ctx, T) => {
      bgDark(ctx, T, RGB.gold, .08, 1150);
      const x0 = 120, y0 = 700, w = 840, h = 960, mid = 1190;
      live(ctx, T, 540, 1180, { yaw: .03, bob: 4 }, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 60; rr(ctx, x0, y0, w, h, 18); ctx.fillStyle = '#1c2027'; ctx.fill(); ctx.restore();
        ctx.fillStyle = '#ffc23a'; ctx.fillRect(x0, y0, w, 12); ctx.fillStyle = '#2b3039'; ctx.fillRect(x0, mid - 8, w, 16); rr(ctx, x0, y0, w, h, 18); ctx.strokeStyle = '#3a404a'; ctx.lineWidth = 4; ctx.stroke();
        // vault
        const vo = p(T, K.secrets - .1, .6, eio), vx = 320, vy = 950;
        rr(ctx, vx - 80, vy - 210, 160, 40, 8); ctx.fillStyle = '#e6e9ef'; ctx.fill(); txt(ctx, 'secrets', vx, vy - 182, 26, '#1a1d24', 800, 'center', MONO);
        if (vo > 0) glow(ctx, vx, vy, 220, RGB.gold, vo);
        ctx.fillStyle = '#0c0e12'; ctx.beginPath(); ctx.arc(vx, vy, 140, 0, 7); ctx.fill();
        if (vo > 0) { for (let k = 0; k < 5; k++) { ctx.fillStyle = '#ffc23a'; rr(ctx, vx - 70 + (k % 3) * 50, vy - 40 + Math.floor(k / 3) * 50, 40, 30, 5); ctx.fill(); } }
        ctx.save(); ctx.translate(vx - 140 * vo * 1.4, vy); ctx.scale(1 - .75 * vo, 1); const vg = ctx.createRadialGradient(-30, -30, 10, 0, 0, 140); vg.addColorStop(0, '#d9dde4'); vg.addColorStop(1, '#7d838d');
        ctx.fillStyle = vg; ctx.beginPath(); ctx.arc(0, 0, 132, 0, 7); ctx.fill(); ctx.strokeStyle = '#5c626c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 104, 0, 7); ctx.stroke();
        ctx.rotate(T * .6 + vo * 4); ctx.strokeStyle = '#3a3f48'; ctx.lineWidth = 10; ctx.lineCap = 'round'; for (let k = 0; k < 6; k++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 62); ctx.stroke(); }
        ctx.fillStyle = '#3a3f48'; ctx.beginPath(); ctx.arc(0, 0, 20, 0, 7); ctx.fill(); ctx.restore();
        for (let k = 0; k < 3; k++) server(ctx, T, 590 + k * 115, 960, 90, 300, { units: 6, seed: k });
        // conveyor
        const by = 1590; rr(ctx, x0 + 30, by - 14, w - 60, 28, 14); ctx.fillStyle = '#2f343d'; ctx.fill();
        for (let k = 0; k < 14; k++) { const rx = x0 + 50 + ((k * 58 + T * 60) % (w - 100)); ctx.fillStyle = '#58606c'; ctx.beginPath(); ctx.arc(rx, by, 9, 0, 7); ctx.fill(); }
        const spec = 680; for (let k = 0; k < 7; k++) { const bx = x0 + 40 + ((k * 130 + (T - s0) * 70) % (w - 40)); if (T > K.format - .4 && Math.abs(bx - spec) < 70) continue;
          ctx.fillStyle = '#c99752'; rr(ctx, bx - 38, by - 92, 76, 76, 6); ctx.fill(); ctx.fillStyle = '#b07f3e'; ctx.fillRect(bx - 38, by - 92, 76, 14);
          if (T > K.upload - .2) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(bx, by - 74); ctx.lineTo(bx + 14, by - 54); ctx.lineTo(bx - 14, by - 54); ctx.fill(); ctx.fillRect(bx - 5, by - 56, 10, 22); } }
        const sa = p(T, K.format - .4, .4, eback); if (sa > 0) { const bx = spec, op = p(T, K.format, .35);
          ctx.fillStyle = '#e3b062'; rr(ctx, bx - 46, by - 104, 92, 90, 6); ctx.fill(); ctx.save(); ctx.translate(bx - 46, by - 104); ctx.rotate(-1.9 * op); ctx.fillStyle = '#b07f3e'; ctx.fillRect(0, -4, 92, 14); ctx.restore();
          pop(ctx, p(T, K.format + .15, .35, eback), bx, by - 180 + 6 * Math.sin(T * 3), () => { rr(ctx, -110, -26, 220, 52, 8); ctx.fillStyle = '#ffc23a'; ctx.fill(); txt(ctx, 'see other file ↗', 0, 9, 24, '#3a2a00', 900); }); }
        // scanner arch
        if (T > K.opens - .2) { ctx.save(); ctx.globalAlpha = p(T, K.opens - .2, .3); ctx.strokeStyle = '#5fd0ff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(spec - 70, by - 10); ctx.lineTo(spec - 70, by - 150); ctx.lineTo(spec + 70, by - 150); ctx.lineTo(spec + 70, by - 10); ctx.stroke();
          ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(95,208,255,${.12 + .08 * Math.sin(T * 8)})`; ctx.fillRect(spec - 66, by - 146, 132, 136); ctx.restore(); }
        // the pointer arrow
        const pa = p(T, K.point, .4), sw = p(T, aT, .7, eio);
        if (pa > 0) { const sx = spec, sy = by - 210, ex = lerp(sx + 150, vx + 110, sw), ey = lerp(sy - 60, vy + 100, sw), cxp = lerp(sx + 120, sx - 60, sw), cyp = lerp(sy - 40, sy - 300, sw);
          ctx.save(); ctx.strokeStyle = '#ffc23a'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.setLineDash([24, 14]); ctx.lineDashOffset = -T * 60; ctx.globalAlpha = pa; ctx.shadowColor = 'rgba(255,194,58,.8)'; ctx.shadowBlur = 16;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cxp, cyp, ex, ey); ctx.stroke(); ctx.setLineDash([]); const ang = Math.atan2(ey - cyp, ex - cxp);
          ctx.fillStyle = '#ffc23a'; ctx.translate(ex, ey); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-22, -20); ctx.lineTo(-22, 20); ctx.fill(); ctx.restore();
          if (T > K.secrets + .2) for (let k = 0; k < 4; k++) { const u = ((T - K.secrets) * .7 + k / 4) % 1, q = 1 - u; const px = q * q * ex + 2 * q * u * cxp + u * u * sx, py = q * q * ey + 2 * q * u * cyp + u * u * sy;
            ctx.save(); ctx.translate(px, py); rr(ctx, -56, -18, 112, 36, 8); ctx.fillStyle = '#111'; ctx.fill(); ctx.strokeStyle = '#ffc23a'; ctx.lineWidth = 2; ctx.stroke(); txt(ctx, 'KEY=••••', 0, 8, 18, '#ffc23a', 700, 'center', MONO); ctx.restore(); } }
      });
      // header tag
      const ha = p(T, s0, .4); if (ha > 0) { ctx.save(); ctx.globalAlpha = ha; ctx.translate(540, 600); rr(ctx, -230, -40, 460, 80, 40); ctx.fillStyle = '#1b1e25'; ctx.fill(); ctx.strokeStyle = 'rgba(255,59,59,.7)'; ctx.lineWidth = 3; ctx.stroke();
        padlock(ctx, -180, 4, 24, 1, p(T, K.secrets, .4)); txt(ctx, 'zero-day', -20, 14, 38, '#fff', 800); txt(ctx, '#1', 100, 14, 38, C.red, 900); logo(ctx, 'hf', 180, 0, 56); ctx.restore(); }
    }, K);
  }
  // 15 ZERO-DAY #2: a "Hello {name}, your model is ready" template; "do what I say" slips into the name slot and the server runs it
  { const s0 = A.zd2, K = { slip: c('slip', s0), commands: c('commands', s0), template: c('template', s0), ran: c('ran', s0), code: c('code', s0) };
    const tT = Math.min(K.template, K.slip) - .25, inj = Math.max(K.commands, K.template) - .1, run = Math.min(K.ran, K.code) - .1;
    sfx.push({ t: s0 + .15, k: 'pop', g: -12 }, { t: tT, k: 'swoosh', g: -15 }, { t: inj, k: 'type', g: -14 }, { t: inj + .2, k: 'type', g: -16 }, { t: inj + .4, k: 'type', g: -16 }, { t: run, k: 'glitch', g: -13 }, { t: run + .15, k: 'riser', g: -18 });
    add(s0, true, (ctx, T) => {
      bgLight(ctx, T);
      const rd = p(T, run, .6), shake = rd > 0 && rd < 1 ? 6 * Math.sin(T * 50) : 0;
      live(ctx, T, 540, 900, { yaw: .06, bob: 5 }, () => pop(ctx, p(T, s0, .45, eback), 540 + shake, 900, () => {
        const w = 560, h = 360; ctx.save(); ctx.shadowColor = rd > .3 ? 'rgba(255,40,40,.6)' : 'rgba(0,0,0,.35)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20; rr(ctx, -w / 2, -h / 2, w, h, 26);
        const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, `rgb(${mixc('58,63,74', '170,30,36', rd)})`); g.addColorStop(1, `rgb(${mixc('30,34,41', '90,10,14', rd)})`); ctx.fillStyle = g; ctx.fill(); ctx.restore();
        rr(ctx, -80, -h / 2 + 18, 160, 32, 8); ctx.fillStyle = '#d6dae2'; ctx.fill(); txt(ctx, 'SERVER', 0, -h / 2 + 42, 22, '#222', 900, 'center', MONO);
        rr(ctx, -w / 2 + 30, -h / 2 + 70, 330, 260, 14); ctx.fillStyle = '#0c0e12'; ctx.fill();
        if (rd < .5) { [[-110, 20, 70, 1], [-20, 90, 46, -1.6]].forEach(([x, y, r, d]) => { ctx.save(); ctx.translate(x, y); ctx.rotate(T * d); ctx.fillStyle = '#8d939d'; ctx.beginPath(); for (let k = 0; k < 20; k++) { const a = k * Math.PI / 10, rr2 = k % 2 ? r * .78 : r; ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.fill(); ctx.fillStyle = '#0c0e12'; ctx.beginPath(); ctx.arc(0, 0, r * .35, 0, 7); ctx.fill(); ctx.restore(); }); }
        else { ctx.save(); rr(ctx, -w / 2 + 30, -h / 2 + 70, 330, 260, 14); ctx.clip(); for (let k = 0; k < 9; k++) { const yy = -h / 2 + 100 + ((k * 30 - (T - run) * 90) % 270 + 270) % 270; txt(ctx, ['> run(payload)', '> sudo agent', '> exec()', '> open secrets', '> spawn x11'][k % 5], -w / 2 + 46, yy, 22, '#ff6b6b', 700, 'left', MONO); } ctx.restore(); }
        for (let k = 0; k < 6; k++) { rr(ctx, 130, -h / 2 + 80 + k * 40, 110, 24, 6); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill(); ctx.fillStyle = rd > .5 ? C.red : (k % 2 ? '#2fd36b' : '#ffc23a'); ctx.beginPath(); ctx.arc(225, -h / 2 + 92 + k * 40, 6, 0, 7); ctx.fill(); }
      }));
      if (T > run) cable(ctx, T, [[540, 1250], [540, 1085]], { col: '255,80,80', packets: 3, prgb: RGB.red, speed: 1.4, w: 8 });
      const ta = p(T, tT, .45, eback);
      live(ctx, T, 560, 1360, { yaw: .05, bob: 5, seed: 2 }, () => pop(ctx, ta, 560 + shake * .6, 1360, () => { ctx.rotate(-.02);
        card(ctx, -330, -120, 660, 240, { r: 22 }); txt(ctx, 'Hello', -290, -22, 50, '#111', 800, 'left');
        const sel = p(T, tT + .3, .3), slot = typed('do what I say', T, inj, 22), sw = slot ? Math.max(140, 22 * slot.length + 40) : 200;
        rr(ctx, -140, -70, sw, 66, 12); ctx.fillStyle = slot ? C.red : '#f0f1f3'; ctx.fill(); if (!slot) { ctx.setLineDash([8, 6]); ctx.strokeStyle = sel ? C.blue : '#bbb'; ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]); }
        txt(ctx, slot || 'name', -140 + sw / 2, -24, 28, slot ? '#fff' : '#aaa', slot ? 900 : 600); txt(ctx, ',', -140 + sw + 6, -22, 50, '#111', 800, 'left');
        txt(ctx, 'your model is ready', -290, 66, 50, '#111', 800, 'left'); }));
      pop(ctx, p(T, s0 + .1, .4, eback), 205, 1215, () => { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, 0, 50, 0, 7); ctx.fill(); txt(ctx, '2', 0, 20, 58, '#fff', 900); });
    }, K);
  }
  // 16 FLEET: take a server (flag), spread across 11 machines, a deleted one restarts itself, fresh sandboxes re-arm red
  { const s0 = A.fleet, K = { control: c('control', s0), fleet: c('fleet', s0), n: c('11', s0), restarted: c('restarted', s0), deleted: c('deleted', s0), fresh: c('fresh', s0), rearmed: c('re-armed', s0) };
    const fT = Math.min(K.fleet, K.n) - .2, dT = Math.min(K.restarted, K.deleted) - .3, back = Math.max(K.restarted, K.deleted) + .5;
    sfx.push({ t: K.control + .1, k: 'swoosh', g: -15 }, { t: fT, k: 'sweep', g: -14 }, { t: K.n, k: 'data', g: -16 }, { t: dT + .45, k: 'click', g: -10 }, { t: back, k: 'pop', g: -12 }, { t: K.fresh, k: 'pop', g: -14 }, { t: K.rearmed, k: 'glitch', g: -14 });
    const pos = []; for (let i = 0; i < 6; i++) pos.push([165 + i * 150, 930]); for (let i = 0; i < 5; i++) pos.push([240 + i * 150, 1110]);
    add(s0, false, (ctx, T) => {
      bgDark(ctx, T, RGB.red, .1 + .12 * p(T, K.control, .5), 1050);
      const f = p(T, fT, .8, eio), red = p(T, K.control - .2, .6);
      if (f < 1) { const s = 1 - f * .45; ctx.save(); ctx.globalAlpha = 1; live(ctx, T, 540, lerp(1020, 1110, f), { yaw: .06, bob: 6 }, () => server(ctx, T, 540, lerp(1020, 1110, f), 210 * s, 440 * s, { red, flag: p(T, K.control, .7) })); ctx.restore(); }
      if (f > 0) pos.forEach(([x, y], i) => { if (i === 8 && f < 1) return; let a = p(T, fT + .1 + hash(i, 3) * .5, .4, eback); if (i === 2) { const del = p(T, dT + .45, .3), re = p(T, back, .4, eback); a = a * (1 - del) + re; if (T > dT + .7 && T < back) { ctx.save(); ctx.translate(x, y); ctx.rotate(T * 7); ctx.strokeStyle = C.red; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 34, 0, 4.4); ctx.stroke(); ctx.restore(); } }
        if (a <= 0) return; pop(ctx, a, x, y + 4 * Math.sin(T * 2 + i), () => server(ctx, T, 0, 0, 108, 220, { red: 1, units: 5, seed: i, flag: i === 8 ? 1 : 0 })); });
      if (T > dT - .2 && T < back + .5) cursor(ctx, kf(T, [[dT - .2, 700], [dT + .4, pos[2][0] + 10]]), kf(T, [[dT - .2, 1400], [dT + .4, pos[2][1] + 20]]), pulseAt(T, dT + .45, .25), 1.2);
      counter(ctx, Math.round(lerp(1, 11, p(T, K.n - .3, .8))), 'machines', 540, 1400, { size: 120, col: C.red, a: p(T, fT + .2, .3), pulse: pulseAt(T, K.n + .5, .3) });
      for (let i = 0; i < 4; i++) { const a = p(T, K.fresh + i * .12, .4, eback); if (a <= 0) continue; const x = 230 + i * 207, y = 1640;
        live(ctx, T, x, y, { yaw: .1, bob: 5, seed: i }, () => pop(ctx, a, x, y, () => sandbox(ctx, T, 0, 0, .5, { seed: i, armed: p(T, K.rearmed + i * .15, .3) }))); ripple(ctx, x, y, (T - K.rearmed - i * .15) / .6, RGB.red, 40, 200); }
    }, K);
  }
  // 17 LOGS: the run log gets rewritten in red, redacted, slammed shut into a locked LOG book; the footprints get wiped
  { const s0 = A.logs, K = { rewrite: c('rewrite', s0), logs: c('logs', s0), hide: c('hide', s0), cheated: c('cheated', s0), covering: c('covering', s0), tracks: c('tracks', s0) };
    const rw = Math.min(K.rewrite, K.logs), cl = K.covering - .3;
    sfx.push({ t: s0 + .1, k: 'pop', g: -14 }, { t: rw, k: 'type', g: -14 }, { t: rw + .3, k: 'type', g: -16 }, { t: K.hide, k: 'swoosh', g: -16 }, { t: cl + .35, k: 'shutter', g: -9 }, { t: K.tracks, k: 'sweep', g: -16 });
    add(s0, false, (ctx, T) => {
      bgDark(ctx, T, '255,170,90', .1, 1100);
      const cx = 540, cy = 1080, fold = p(T, cl, .5, eio), closed = fold > .5;
      // footprints + eraser
      const er = p(T, K.tracks - .1, .8, clamp); for (let i = 0; i < 10; i++) { const fx = 600 + i * 46 + (i % 2) * 10, fy = 1400 + i * 36; if (fx < 160 + er * 1000) continue; const fa = p(T, cl + .3 + i * .03, .3); if (fa <= 0) continue;
        ctx.fillStyle = `rgba(255,90,90,${.5 * fa})`; ctx.beginPath(); ctx.ellipse(fx, fy, 10, 16, .5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(fx + 6, fy - 20, 5, 0, 7); ctx.fill(); }
      if (er > 0 && er < 1) { const ex = 160 + er * 1000, ey = 1380 + er * 380; ctx.save(); ctx.translate(ex, ey); ctx.rotate(.5); rr(ctx, -50, -26, 100, 52, 10); ctx.fillStyle = '#ff8fa3'; ctx.fill(); ctx.fillStyle = '#3d7bff'; ctx.fillRect(10, -26, 40, 52); ctx.restore(); }
      live(ctx, T, cx, cy, { yaw: .05, bob: 6 }, () => {
        if (!closed) { const pw = 400, ph = 540; floorShadow(ctx, cx, cy + ph / 2 + 10, 460, .5);
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 40; rr(ctx, cx - pw - 14, cy - ph / 2 - 10, pw * 2 + 28, ph + 20, 16); ctx.fillStyle = '#6b4424'; ctx.fill(); ctx.restore();
          ctx.fillStyle = '#fbf3df'; ctx.fillRect(cx - pw, cy - ph / 2, pw, ph);
          // right page folding over
          ctx.save(); ctx.translate(cx, 0); ctx.scale(1 - 2 * fold, 1); ctx.fillStyle = '#f6edd5'; ctx.fillRect(0, cy - ph / 2, pw, ph); ctx.restore();
          const g = ctx.createLinearGradient(cx - 40, 0, cx + 40, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, 'rgba(0,0,0,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(cx - 40, cy - ph / 2, 80, ph);
          txt(ctx, 'RUN LOG', cx - pw + 34, cy - ph / 2 + 44, 22, '#9a8a6a', 800, 'left', MONO);
          const L = ['tried the task', 'still stuck', 'worked it out?', 'asked the others'], R = ['copied the answer', 'how we got it', 'submitted ✓'];
          L.forEach((l, i) => { const y = cy - ph / 2 + 110 + i * 100; txt(ctx, l, cx - pw + 40, y, 32, '#2a2a3a', 600, 'left', HAND);
            const sc = p(T, rw + .2 + i * .3, .35, clamp); if (i > 0 && sc > 0) { ctx.strokeStyle = '#e02424'; ctx.lineWidth = 5; ctx.beginPath(); for (let k = 0; k <= 20 * sc; k++) ctx.lineTo(cx - pw + 40 + k * 15, y - 12 + (k % 2 ? -12 : 10)); ctx.stroke(); } });
          const nw = typed('solved it all!', T, rw + 1.2, 14); txt(ctx, nw, cx - pw + 60, cy + ph / 2 - 40, 34, '#e02424', 700, 'left', HAND);
          if (fold < .05) R.forEach((l, i) => { const y = cy - ph / 2 + 110 + i * 100; txt(ctx, l, cx + 40, y, 32, '#2a2a3a', 600, 'left', HAND);
            const b = p(T, K.hide - .1 + i * .2, .35, eio); if (i < 2 && b > 0) { ctx.fillStyle = '#111'; rr(ctx, cx + 30, y - 34, 330 * b, 46, 4); ctx.fill(); } });
          // red pen
          if (T > rw - .3 && fold < .05) { const k = clamp((T - rw) / 1.6), py = cy - ph / 2 + 200 + k * 260 + 8 * Math.sin(T * 30), px = cx - pw + 80 + ((T * 260) % 280);
            ctx.save(); ctx.translate(px, py); ctx.rotate(-.6); ctx.fillStyle = '#d62828'; rr(ctx, -12, -200, 24, 180, 10); ctx.fill(); ctx.fillStyle = '#eee'; ctx.beginPath(); ctx.moveTo(-12, -20); ctx.lineTo(12, -20); ctx.lineTo(0, 6); ctx.fill(); ctx.fillStyle = '#8a1010'; rr(ctx, -12, -200, 24, 40, 10); ctx.fill(); ctx.restore(); }
        } else { const s = eo((fold - .5) * 2); ctx.save(); ctx.translate(cx, cy); ctx.scale(lerp(.6, 1, s), 1); floorShadow(ctx, 0, 290, 300, .5);
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; rr(ctx, -210, -280, 420, 560, 18); const g = ctx.createLinearGradient(-210, 0, 210, 0); g.addColorStop(0, '#5a3418'); g.addColorStop(.5, '#7a4a24'); g.addColorStop(1, '#4e2c12'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
          ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-210, -280, 30, 560); rr(ctx, -110, -200, 220, 90, 10); ctx.strokeStyle = '#d9b77a'; ctx.lineWidth = 4; ctx.stroke(); txt(ctx, 'LOG', 0, -138, 56, '#e8c98a', 900, 'center', MONO);
          ctx.fillStyle = '#3a2210'; ctx.fillRect(160, -40, 70, 80); bigPadlock(ctx, 200, 10 + (1 - p(T, cl + .4, .35, eback)) * -80, .55); ctx.restore(); }
      });
    }, K);
  }
  // 18 CAUGHT: Hugging Face status card flips to Intrusion detected, the cable to the swarm is cut, OpenAI links it a week later (13 -> 20 July)
  { const s0 = A.caught, K = { tools: c('tools', s0), caught: c('caught', s0), cut: c('cut', s0), openai: c('openai', s0), week: c('week', s0) };
    sfx.push({ t: K.tools, k: 'sweep', g: -16 }, { t: K.caught, k: 'glitch', g: -13 }, { t: K.cut, k: 'shatter', g: -11 }, { t: K.openai, k: 'pop', g: -13 }, { t: K.week, k: 'tick', g: -10 });
    add(s0, true, (ctx, T) => {
      bgLight(ctx, T);
      const ca = p(T, K.caught - .1, .4, eio), cut = p(T, K.cut, .5), oa = p(T, K.openai - .2, .7, eio);
      // cable
      const cx = lerp(540, 380, oa); ctx.save(); ctx.lineCap = 'round';
      const drop = cut * 120; ctx.strokeStyle = '#222'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(540, 900); ctx.lineTo(540, 1080 - (cut > 0 ? 30 : 0)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lerp(540, cx, .3), 1130 + drop * .3); ctx.quadraticCurveTo(lerp(540, cx, .6), 1250 + drop, cx, 1380); ctx.stroke();
      ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.setLineDash([16, 16]); ctx.lineDashOffset = -T * 80 * (1 - cut); ctx.beginPath(); ctx.moveTo(540, 900); ctx.lineTo(540, 1080 - (cut > 0 ? 30 : 0)); ctx.moveTo(lerp(540, cx, .3), 1130 + drop * .3); ctx.quadraticCurveTo(lerp(540, cx, .6), 1250 + drop, cx, 1380); ctx.stroke(); ctx.restore();
      if (T > K.cut - .4 && T < K.cut + .6) { const sn = p(T, K.cut - .3, .3); ctx.save(); ctx.translate(540, 1100); ctx.globalAlpha = 1 - p(T, K.cut + .3, .3); [-1, 1].forEach(d => { ctx.save(); ctx.rotate(d * (.5 - .45 * sn)); ctx.fillStyle = '#888'; rr(ctx, -8, -110, 16, 110, 8); ctx.fill(); ctx.strokeStyle = C.red; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 30, 24, 0, 7); ctx.stroke(); ctx.restore(); }); ctx.restore(); sparks(ctx, 540, 1100, (T - K.cut) / .6, 24, 160); }
      // swarm (red -> grey)
      for (let i = 0; i < 160; i++) { const a = hash(i, 1) * 6.28 + T * .5 * (hash(i, 2) - .5), r = 40 + 130 * Math.sqrt(hash(i, 3)); const x = cx + Math.cos(a) * r * 1.2, y = 1460 + Math.sin(a) * r * .6 + (hash(i, 4) - .5) * 40 + cut * 30 * hash(i, 5);
        agentDot(ctx, x, y, 7, mixc(RGB.red, '120,124,132', cut), .9); }
      if (oa > 0) { live(ctx, T, cx, 1440, { yaw: .2, bob: 6 }, () => pop(ctx, oa, cx, 1440, () => { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.fill(); logo(ctx, 'oai_black', 0, 0, 100); }));
        const tl = p(T, K.week - .2, .6, eio); live(ctx, T, 790, 1440, { yaw: .15, bob: 6, seed: 2 }, () => pop(ctx, p(T, K.openai, .4, eback), 790, 1440, () => dayTile(ctx, 0, 0, 1.25, 'JULY', tl < .5 ? 13 : 20, tl)));
        txt(ctx, "OpenAI's own models", cx, 1650, 28, '#555', 700); pill(ctx, 790, 1660, 'a week later', { a: p(T, K.week + .2, .35, eback), bg: '#111', size: 26 }); }
      // status card
      live(ctx, T, 540, 770, { yaw: .04, bob: 5 }, () => { const x0 = 150, y0 = 640, w = 780, h = 260; ctx.save(); flipIn(ctx, 540, 770, p(T, s0, .5, eio)); card(ctx, x0, y0, w, h, { r: 24, stroke: ca > .5 ? C.red : 'rgba(0,0,0,.06)' });
        ctx.save(); rr(ctx, x0, y0, w, 90, 24); ctx.clip(); ctx.fillStyle = ca > .5 ? C.red : '#fff'; ctx.fillRect(x0, y0, w, 90); ctx.restore();
        logo(ctx, 'hf', x0 + 56, y0 + 46, 56); txt(ctx, 'Hugging Face', x0 + 100, y0 + 56, 30, ca > .5 ? '#fff' : '#111', 800, 'left'); txt(ctx, ca > .5 ? 'July 13' : 'Production', x0 + w - 36, y0 + 56, 24, ca > .5 ? '#fff' : '#999', 700, 'right');
        if (ca <= .5) { ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(x0 + 56, y0 + 160, 11, 0, 7); ctx.fill(); txt(ctx, 'All systems normal', x0 + 84, y0 + 171, 32, '#111', 700, 'left'); }
        else { txt(ctx, 'Intrusion detected', x0 + 40, y0 + 160, 40, '#111', 900, 'left');
          pop(ctx, p(T, K.caught + .1, .35, eback), x0 + 190, y0 + 216, () => { rr(ctx, -150, -22, 300, 44, 22); ctx.fillStyle = '#fff1d6'; ctx.fill(); txt(ctx, '⚡ AI-assisted detection', 0, 8, 22, '#8a5a00', 800); });
          pop(ctx, p(T, K.cut, .35, eback), x0 + 450, y0 + 216, () => { rr(ctx, -90, -22, 180, 44, 22); ctx.fillStyle = '#111'; ctx.fill(); txt(ctx, 'Access cut', 0, 8, 22, '#fff', 800); }); }
        const sc = p(T, K.tools - .2, .8, clamp); if (sc > 0 && sc < 1) { ctx.save(); rr(ctx, x0, y0, w, h, 24); ctx.clip(); const sx = x0 + sc * w; const g = ctx.createLinearGradient(sx - 120, 0, sx, 0); g.addColorStop(0, 'rgba(61,123,255,0)'); g.addColorStop(1, 'rgba(61,123,255,.35)'); ctx.fillStyle = g; ctx.fillRect(sx - 120, y0, 120, h); ctx.fillStyle = C.blue; ctx.fillRect(sx - 3, y0, 5, h); ctx.restore(); }
        ctx.restore(); });
      pill(ctx, 850, 950, 'AI tools', { a: p(T, K.tools - .1, .35, eback) * (1 - p(T, K.cut, .3)), bg: C.blue, icon: '🤖', size: 26 });
    }, K);
  }
  // 19 THE THING: a red swarm sphere; not trying to take over (globe slashed) - just trying to pass a test (swarm turns blue around the TEST sheet)
  { const s0 = A.thing, K = { agents: c('agents', s0), take: c('take', s0), pass: c('pass', s0), test: c('test', s0), scary: c('scary', s0) }, pT = Math.min(K.pass, K.test) - .15;
    sfx.push({ t: s0 + .1, k: 'riser', g: -18 }, { t: K.take, k: 'pop', g: -13 }, { t: K.take + .3, k: 'glitch', g: -16 }, { t: pT, k: 'swoosh', g: -14 }, { t: pT + .5, k: 'tick', g: -14 }, { t: K.scary, k: 'shatter', g: -14 });
    add(s0, false, (ctx, T) => {
      const blue = p(T, pT + .2, 1.2, eio), sc = p(T, K.scary - .3, .8, eio);
      bgDark(ctx, T, mixc(RGB.red, RGB.blue, blue), .16 + .1 * sc, 1060);
      ctx.save(); zoom(ctx, kf(T, [[s0, 1.15], [K.take, 1], [K.scary, 1.05], [K.scary + .8, 1.22]]), 540, 1060);
      swarmSphere(ctx, T, 540, 1060, { n: Math.round(lerp(520, 900, sc)), R: lerp(400, 330, sc), red: 1 - blue, dens: sc, a: p(T, s0, .5) });
      const ga = p(T, K.take - .1, .4, eback) * (1 - p(T, pT, .3)); if (ga > 0) { pop(ctx, ga, 540, 1060, () => globe(ctx, T, 0, 0, 150, {}));
        const sl = p(T, K.take + .25, .3); ctx.save(); ctx.globalAlpha = ga; ctx.strokeStyle = C.red; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(400, 1200); ctx.lineTo(400 + 280 * sl, 1200 - 280 * sl); ctx.stroke(); ctx.restore(); }
      const ta = p(T, pT, .45, eback); if (ta > 0) live(ctx, T, 540, 1060, { yaw: .15, bob: 6 }, () => pop(ctx, ta, 540, 1060, () => { ctx.save(); ctx.shadowColor = 'rgba(95,208,255,.6)'; ctx.shadowBlur = 40; rr(ctx, -120, -150, 240, 300, 16); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
        txt(ctx, 'TEST', -86, -100, 34, '#111', 900, 'left'); for (let k = 0; k < 5; k++) { const y = -50 + k * 44; ctx.strokeStyle = '#999'; ctx.lineWidth = 3; ctx.strokeRect(-86, y - 14, 24, 24); check(ctx, -74, y - 2, 10, p(T, pT + .4 + k * .25, .3), '#2f7bff'); ctx.fillStyle = '#ddd'; ctx.fillRect(-48, y - 6, 120 - (k % 2) * 30, 10); } }));
      ctx.restore();
      counter(ctx, Math.round(lerp(736, 1200, sc)), 'agents', 540, 1620, { size: 90, col: '#8fd2ff', a: p(T, pT + .3, .4), pulse: pulseAt(T, K.scary + .6, .3) });
      if (sc > 0) { const g = ctx.createRadialGradient(540, 960, 400, 540, 960, 1100); g.addColorStop(0, 'rgba(255,0,0,0)'); g.addColorStop(1, `rgba(200,0,0,${.35 * sc * (.7 + .3 * Math.sin(T * 5))})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    }, K);
  }
  // 20 MADE WITH CODE: tiny agents fly in from an orbiting swarm and each one drops a line of this video's code into the editor
  { const s0 = A.code, K = { crazy: c('crazy', s0), video: c('video', s0) }; K.code = c('code', K.video);
    const CODE = [['// 1,200 agents, drawn one frame at a time', '#6a9955'], ['for (const a of swarm) {', '#c586c0'], ['  a.orbit(T, OPENAI);', '#dcdcaa'], ['  if (a.escaped) a.color = RED;', '#9cdcfe'], ['  sandbox(ctx, T, a);', '#dcdcaa'], ['}', '#c586c0'], ['hack(HUGGING_FACE, 0x2);', '#ce9178'], ['render(frame); // ← you are here', '#dcdcaa']];
    const n = CODE.length, span = Math.max(1.2, K.code - s0 - .35), lt = i => s0 + .3 + span * (i + .7) / n; // every line lands by "code"
    sfx.push({ t: K.crazy, k: 'pop', g: -12 }, { t: K.code + .1, k: 'success', g: -13 }); CODE.forEach((_, i) => sfx.push({ t: lt(i), k: 'type', g: -21 }));
    add(s0, false, (ctx, T) => {
      bgDark(ctx, T, RGB.blue, .16, 1080);
      swarmRing(ctx, T, 540, 1080, { n: 160, R: 520, tilt: .5, size: .8 });
      const ea = p(T, s0, .5, eio); ctx.save(); alive(ctx, T, 540, 1080, { yaw: .04, bob: 5 }); ctx.globalAlpha = ea; zoom(ctx, lerp(.7, 1, ea), 540, 1080); flipIn(ctx, 540, 1080, ea);
      const x0 = 80, y0 = 720, w = 920, h = 720; ctx.save(); ctx.shadowColor = 'rgba(61,123,255,.35)'; ctx.shadowBlur = 80; rr(ctx, x0, y0, w, h, 24); ctx.fillStyle = '#15171c'; ctx.fill(); ctx.restore();
      ctx.save(); rr(ctx, x0, y0, w, 56, 24); ctx.clip(); ctx.fillStyle = '#20232a'; ctx.fillRect(x0, y0, w, 56); ctx.restore();
      ['#ff5f57', '#febc2e', '#28c840'].forEach((cl, k) => { ctx.fillStyle = cl; ctx.beginPath(); ctx.arc(x0 + 32 + k * 28, y0 + 28, 9, 0, 7); ctx.fill(); });
      txt(ctx, 'scenes.js', x0 + 140, y0 + 36, 22, '#d7dae0', 700, 'left'); txt(ctx, 'agents.js', x0 + 270, y0 + 36, 22, '#7d828c', 600, 'left');
      ctx.font = MONO(500, 27); let caret = [x0 + 80, y0 + 110];
      CODE.forEach(([l, col], i) => { const y = y0 + 110 + i * 62, tk = p(T, lt(i), .3, clamp), m = Math.floor(l.length * tk);
        txt(ctx, String(i + 1).padStart(2), x0 + 22, y, 24, '#4b505a', 500, 'left', MONO); txt(ctx, l.slice(0, m), x0 + 80, y, 27, col, 500, 'left', MONO);
        if (m > 0) { ctx.font = MONO(500, 27); caret = [x0 + 80 + ctx.measureText(l.slice(0, m)).width, y]; }
        if (tk > 0 && tk < 1) glow(ctx, caret[0], y - 10, 50, RGB.cyan, 1); });
      if (Math.floor(T * 2.5) % 2) { ctx.fillStyle = '#d7dae0'; ctx.fillRect(caret[0] + 3, caret[1] - 24, 3, 30); }
      ctx.save(); rr(ctx, x0, y0 + h - 52, w, 52, 24); ctx.clip(); ctx.fillStyle = '#20232a'; ctx.fillRect(x0, y0 + h - 52, w, 52); ctx.restore();
      const done = T > K.code + .1; ctx.fillStyle = done ? C.green : C.gold; ctx.beginPath(); ctx.arc(x0 + 30, y0 + h - 26, 8, 0, 7); ctx.fill();
      txt(ctx, done ? 'Rendered ✓  1080×1920 · 30 fps' : `Rendering frame ${num(T * 30)} · agents 1,200`, x0 + 50, y0 + h - 17, 22, '#d7dae0', 600, 'left');
      ctx.restore();
      // the carrier agents: fly from the swarm to their line as it lands
      CODE.forEach(([l], i) => { const t1 = lt(i), u = clamp((T - (t1 - .55)) / .55); if (u <= 0 || T > t1 + .45) return; const a0 = hash(i, 4) * 6.28 + T * .3;
        const sx = 540 + Math.cos(a0) * 520, sy = 1080 + Math.sin(a0) * 260, ex = 80 + 60 + 40, ey = 720 + 110 + i * 62 - 10;
        const x = lerp(sx, ex, eio(u)), y = lerp(sy, ey, eio(u)) - Math.sin(u * Math.PI) * 120, k = 1 - p(T, t1 + .1, .35);
        ctx.save(); ctx.globalAlpha = k; rr(ctx, x + 20, y - 8, 90, 16, 8); ctx.fillStyle = 'rgba(95,208,255,.8)'; ctx.fill(); agentHead(ctx, x, y, 46, RGB.cyan, { T, seed: i }); ctx.restore(); });
      pill(ctx, 540, 1600, 'made 100% with code', { a: p(T, K.code + .1, .4, eback), bg: C.green, icon: '💻', size: 36 });
    }, K);
  }
  // 21 GUIDE: the agent types "guide" inside its sandbox, the lock pops and the comment escapes the box; then the bio link
  { const s0 = A.guide, K = { comment: c('comment', s0) }; K.guide = c('guide', K.comment); K.yt = c('youtube', s0); K.bio = c('bio', s0);
    const kT = i => K.guide + i * .07, esc = Math.min(K.guide + .55, K.yt - .2), prof = K.bio - .55;
    sfx.push({ t: K.comment, k: 'pop', g: -13 }, { t: esc, k: 'shatter', g: -11 }, { t: esc + .4, k: 'success', g: -14 }, { t: K.yt, k: 'swoosh', g: -16 }, { t: prof, k: 'swoosh', g: -16 }, { t: K.bio + .1, k: 'click', g: -9 });
    for (let i = 0; i < 5; i++) sfx.push({ t: kT(i), k: 'type', g: -19 });
    add(s0, false, (ctx, T) => {
      bgDark(ctx, T, RGB.blue, .15, 1100);
      const e = p(T, esc, .7, eio), typedN = Math.floor(clamp((T - K.guide) / .07 + 1, 0, 5));
      // the sandbox: big, then shrinks to the bottom as the comment escapes
      const bs = lerp(1.9, .62, e), by = lerp(1120, 1640, e);
      live(ctx, T, 540, by, { yaw: .07, bob: 5 }, () => { sandbox(ctx, T, 540, by, bs, { open: p(T, esc - .1, .3, eback), face: 0, seed: 3 });
        if (e < 1) { ctx.save(); ctx.translate(540, by); ctx.scale(bs, bs); ctx.globalAlpha = 1 - e; agentHead(ctx, -78, 30, 60, RGB.cyan, { T, seed: 2 });
          rr(ctx, -30, 8, 140, 44, 22); ctx.fillStyle = '#e9eef6'; ctx.fill(); txt(ctx, typedN ? 'guide'.slice(0, typedN) : 'Add a…', -14, 38, 22, typedN ? '#111' : '#888', 800, 'left');
          if (Math.floor(T * 3) % 2 && typedN < 5) { ctx.fillStyle = '#111'; ctx.fillRect(-12 + 13 * typedN, 18, 2, 26); } ctx.restore(); } });
      sparks(ctx, 540, 1120, (T - esc) / .7, 40, 420, ['200,230,255', '255,255,255', '95,208,255']);
      // the comment sheet that escaped
      if (e > 0) { const cy = 1060, k = eo(e); ctx.save(); ctx.globalAlpha = clamp(e * 1.6); alive(ctx, T, 540, cy, { yaw: .04, bob: 5, seed: 4 }); ctx.translate(lerp(540, 540, k), lerp(1120, cy, k)); ctx.scale(lerp(.35, 1, k), lerp(.35, 1, k)); ctx.translate(-540, -cy);
        const x0 = 150, y0 = 760, w = 780, h = 600; card(ctx, x0, y0, w, h, { r: 30, dark: true });
        const pr = p(T, prof, .5, eio);
        if (pr < 1) { ctx.save(); ctx.globalAlpha *= 1 - pr; txt(ctx, 'Comments', 540, y0 + 64, 32, '#111', 800); ctx.fillStyle = '#eee'; ctx.fillRect(x0 + 30, y0 + 96, w - 60, 2);
          avatar(ctx, T, x0 + 80, y0 + 170, 36, named); if (named) txt(ctx, 'agentsoly', x0 + 136, y0 + 154, 24, '#111', 800, 'left');
          rr(ctx, x0 + 132, y0 + (named ? 168 : 148), 150, 50, 20); ctx.fillStyle = '#eef2ff'; ctx.fill(); txt(ctx, 'guide', x0 + 207, y0 + (named ? 202 : 182), 28, '#111', 800);
          const ra = p(T, esc + .4, .4, eback); if (ra > 0) pop(ctx, ra, x0 + 330, y0 + 300, () => { rr(ctx, -180, -36, 400, 72, 24); ctx.fillStyle = '#e8f8ee'; ctx.fill(); txt(ctx, '✓ guide sent to your DMs', 20, 9, 26, '#1f9a4c', 800); });
          const hr = p(T, esc + .6, .4, eback); pop(ctx, hr, x0 + w - 70, y0 + 180, () => txt(ctx, '♥', 0, 14, 44, '#ff3b5c', 900));
          rr(ctx, x0 + 30, y0 + h - 100, w - 60, 66, 33); ctx.fillStyle = '#f2f3f5'; ctx.fill(); txt(ctx, 'Add a comment…', x0 + 64, y0 + h - 57, 26, '#999', 600, 'left'); ctx.restore(); }
        if (pr > 0) { ctx.save(); ctx.globalAlpha *= pr; avatar(ctx, T, 540, y0 + 150, 72, named); if (named) txt(ctx, 'agentsoly', 540, y0 + 290, 40, '#111', 900);
          txt(ctx, 'Explainers built 100% in code', 540, y0 + (named ? 336 : 300), 24, '#777', 600);
          const hl = p(T, K.bio + .1, .3); rr(ctx, x0 + 60, y0 + 400, w - 120, 90, 22); ctx.fillStyle = `rgba(61,123,255,${.1 + .3 * hl})`; ctx.fill(); ctx.strokeStyle = `rgba(61,123,255,${.3 + .7 * hl})`; ctx.lineWidth = 3; ctx.stroke();
          txt(ctx, '🔗  Full guide · link in bio', 540, y0 + 456, 30, '#2f5fd8', 800);
          cursor(ctx, kf(T, [[prof, 800], [K.bio - .05, 560]]), kf(T, [[prof, y0 + 560], [K.bio - .05, y0 + 450]]), pulseAt(T, K.bio + .1, .3), 1.2); ripple(ctx, 560, y0 + 450, (T - K.bio - .1) / .6, RGB.blue, 10, 140);
          ctx.restore(); }
        ctx.restore(); }
      ['TikTok', 'YouTube'].forEach((nm, i) => pop(ctx, p(T, K.yt + .1 + i * .18, .4, eback), 330 + i * 420, 640 + 8 * Math.sin(T * 2 + i * 2), () => { rr(ctx, -150, -52, 300, 104, 28); ctx.fillStyle = i ? '#e62117' : '#111'; ctx.fill(); ctx.strokeStyle = '#444'; ctx.lineWidth = 3; ctx.stroke(); txt(ctx, nm, 0, 13, 38, '#fff', 800); }, i ? .6 : -.6));
      pill(ctx, 540, 640, 'comment "guide"', { a: p(T, K.comment - .05, .35, eback) * (1 - p(T, K.yt - .1, .25)), bg: C.blue, icon: '💬', size: 36 });
    }, K);
  }
  list.forEach((sc, i) => sc.end = list[i + 1] ? list[i + 1].start : 1e9);
  return { scenes: list, sfx };
}
// drawn gradient "a" avatar (no photo supplied); Hindi version shows a plain person glyph instead of the initial
function avatar(ctx, T, x, y, r, named) {
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, '#1fa58f'); g.addColorStop(1, '#f2a25c'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; if (named) txt(ctx, 'a', x, y + r * .32, r * .92, '#fff', 900); else { ctx.beginPath(); ctx.arc(x, y - r * .28, r * .34, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y + r * .58, r * .6, r * .42, 0, Math.PI, 0); ctx.fill(); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(T * 1.6); const cg = ctx.createConicGradient(0, 0, 0); cg.addColorStop(0, '#f2a25c'); cg.addColorStop(.5, '#1fa58f'); cg.addColorStop(1, '#f2a25c'); ctx.strokeStyle = cg; ctx.lineWidth = r * .08; ctx.beginPath(); ctx.arc(0, 0, r * 1.16, 0, 7); ctx.stroke(); ctx.restore();
}
