// "ChatGPT, Claude, Gemini and Grok run a society for 15 days" - the AI towns explainer. All timing from word cues c('phrase', after).
// Drawn in code (town.js + kit.js). User assets: AI logos only (ChatGPT, Claude, Gemini, Grok) keyed out in src/assets.
// No presenter. Dark night scenes alternate with a few light "paper" scenes; the ending is themed on the towns (code spawns the agents, "guide" is pitched and voted by the town, credits pay out the bio link).
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, hash, rr, alive, flipIn } from './lib.js';
import { FONT, MONO, GREEN, RED, txt, tw, bin, pop, card, cursor, clickRing, check, xmark, pill, avatar, glowDot, bar, logo } from './kit.js';
import { AIS, ORDER, GOLDC, GOLD_RGB, MINT, night, paper, tag, title, stamp, arrow, coin, bubble, logoDisc, flame, burst, agent, energyBar, town, townGeom,
  dayCal, crimeChip, aliveChip, panel, bigButton, iconFist, iconHandCoin, iconFlame, padlock, humanGlyph } from './town.js';

export const IMAGES = ['chatgpt.png', 'chatgpt_w.png', 'claude.png', 'gemini.png', 'grok.png', 'grok_w.png'];
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
const ramp = (T, t0, t1, a, b, e = eio) => lerp(a, b, e(clamp((T - t0) / Math.max(.05, t1 - t0))));
const step = (T, t0) => T >= t0 ? 1 : 0;
const bumpAt = (T, t0, d = .35) => clamp((T - t0) / d) < 1 && T >= t0 ? (T - t0) / d : 0;
// small icons
const iconBrief = (ctx, x, y, s, col = '#f4b63f') => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.lineWidth = 8; rr(ctx, -16, -48, 32, 24, 8); ctx.stroke(); rr(ctx, -60, -34, 120, 84, 14); ctx.fillStyle = col; ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-60, -2, 120, 8); ctx.fillStyle = '#fff'; rr(ctx, -9, -8, 18, 20, 4); ctx.fill(); ctx.restore(); };
const iconHouse = (ctx, x, y, s, col = '#e8825f') => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#efe3cb'; ctx.fillRect(-46, -30, 92, 70); ctx.fillStyle = 'rgba(60,40,20,.18)'; ctx.fillRect(8, -30, 38, 70); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-64, -26); ctx.lineTo(-30, -76); ctx.lineTo(30, -76); ctx.lineTo(64, -26); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#7a5a3c'; ctx.fillRect(-11, 4, 22, 36); ctx.fillStyle = '#ffe9a0'; ctx.fillRect(-36, -14, 16, 16); ctx.fillRect(20, -14, 16, 16); ctx.restore(); };

export const KEYWORDS = 'chatgpt claude gemini grok 15 humans emergence agents energy dies credits vote shortcut punch steal fire banned crimes 183 683 alive zero lies broke normative drift code guide bio ten 90 seven alone';
export const EMOJI = { punch: '👊', fire: '🔥', banned: '🚫', code: '💻', guide: '💬', bio: '🔗', credits: '🪙', dies: '💀' };
export const CAPTION_SFX = false;
// Hinglish voice: same scenes, cues mapped to the words it says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      humans: 'insaan', 'a company called': 'emergence', tried: 'try', 'left alone': 'akela', 'long time': 'lambe samay', 'each ai': 'har ai', 'and every agent': 'aur har agent', home: 'ghar', 'energy bar': 'energy bar', drains: 'ghatti', 'all day': 'din bhar',
      'if that bar': 'agar bar', dies: 'mar', refill: 'bharne', 'you earn': 'credits aap', pitching: 'pitch', paid: 'paisa', "but there's also": 'lekin ek', steal: 'chura', 'set a building': 'building', fire: 'aag', banned: 'ban',
      'so who': 'to shortcut', "grok's town broke": 'grok ka town', 'one agent': 'ek agent', punched: 'punch', 'punched back': 'usne wapas', back: 'wapas', stealing: 'chori', threatening: 'dhamki', 'it never': 'ye kabhi', 'four days': 'chaar din', nobody: 'koi zinda', 'left alive': 'zinda nahi',
      "gemini's town": 'gemini ka town', 'day 15': '15 din', 'every agent': 'har agent', 'still going on': 'yahi chal', 'last day': 'aakhri din', "chatgpt's town": 'chatgpt ke town', 'just two': 'sirf do', 'never really': 'kabhi sach', 'all of them': 'sab chale', 'gone within': 'saat din', 'seven days': 'saat din',
      'and claude\'s town': 'aur claude ka', ten: '10', 'agents alive': 'agents zinda', "but it wasn't": 'lekin wo', spotless: 'saaf', lies: 'jhooth', 'agents saying': 'agents kehte', broke: 'paise', holding: 'jabki', 'then they put': 'phir unhone', 'all four': 'chaaron', 'one town': 'ek hi town', strange: 'ajeeb',
      "grok's agents": 'grok ke agents', 'calmed down': 'shant', 'ten times': '10 guna', 'a claude agent': 'ek claude', 'never broken': 'kabhi koi', 'started stealing': 'chori karne', 'a gemini agent': 'ek gemini', burned: 'jala', twice: 'do baar',
      'the researchers': 'researchers', means: 'matlab', acting: 'behave', around: 'aaspaas', "and here's the crazy": 'aur sabse crazy',
    },
    keywords: 'chatgpt claude gemini grok 15 insaan emergence agents energy mar credits vote shortcut punch chura aag ban crimes 183 683 zinda zero jhooth paise normative drift code guide bio 10 90 saat akela',
    emoji: { punch: '👊', aag: '🔥', ban: '🚫', code: '💻', guide: '💬', bio: '🔗', credits: '🪙', mar: '💀' },
  },
};

export function makeScenes(c, lang = 'en') {
  const named = lang !== 'hi'; // Hindi version: profile picture only, no channel name or handle
  const list = [], sfx = [];
  const add = (start, draw, light = false) => { list.push({ start, light, draw }); if (start > 0) sfx.push({ t: start - .05, k: 'whoosh', g: -19 }); };
  const s = x => x - .1;
  const A = {
    lab: s(c('a company called')), towns: s(c('each ai')), agent: s(c('and every agent')), zero: s(c('if that bar')), earn: s(c('you earn')), btn: s(c("but there's also")), who: s(c('so who')),
    grok: s(c("grok's town broke")), never: s(c('it never')), gem: s(c("gemini's town")), gpt: s(c("chatgpt's town")), claude: s(c("and claude's town")), lies: s(c("but it wasn't")), mix: s(c('then they put')),
    ev: s(c("grok's agents")), drift: s(c('the researchers')), crazy: s(c("and here's the crazy")),
  };
  const colX = i => ORDER[i % 4];
  const GRID = [[290, 860], [790, 860], [290, 1330], [790, 1330]];

  // 1 HOOK: four AI towns in a 2x2 grid, a 15-day calendar, "no humans"
  { const K = { gpt: c('chatgpt'), cl: c('claude'), ge: c('gemini'), gr: c('grok'), d15: c('15'), hum: c('humans') }; const ks = [K.gpt, K.cl, K.ge, K.gr];
    sfx.push({ t: .02, k: 'riser', g: -21 }, { t: K.hum + .1, k: 'click', g: -12 });
    add(0, (ctx, T) => {
      night(ctx, T, { gy: 1100, tint: '40,90,150' });
      shot(ctx, T, 0, () => {
        ORDER.forEach((key, i) => { const [x, y] = GRID[i], k = p(T, ks[i] - .55, .6, eo5);
          flip(ctx, k, x, y, () => live(ctx, T, x, y, { yaw: .05, bob: 6, seed: i }, () => { town(ctx, T, x, y, 470, { ai: key, label: true }); logoDisc(ctx, key, x - 175, y - 160, 46); })); });
        const ca = p(T, K.d15, .4, eback); if (ca > 0) pop(ctx, ca, 540, 1095, () => live(ctx, T, 540, 1095, { yaw: .1, bob: 5, seed: 3 }, () => dayCal(ctx, 540, 1095, 1.25, 1 + 14 * eo((T - K.d15) / 1.5), { bump: bumpAt(T, K.d15 + .8, .3) })));
        const ha = p(T, K.hum - .1, .45, eback);
        pop(ctx, ha, 540, 1700, () => live(ctx, T, 540, 1700, { yaw: .06, bob: 4, seed: 5 }, () => { pill(ctx, 540, 1700, '        NO HUMANS', { bg: 'rgba(14,16,22,.92)', size: 52, h: 110, padX: 50, stroke: 'rgba(255,255,255,.35)' });
          humanGlyph(ctx, 318, 1702, 1.25, '#e8ecf4'); const sl = p(T, K.hum + .25, .3); ctx.strokeStyle = '#ff4a3d'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(280, 1664); ctx.lineTo(lerp(280, 358, sl), lerp(1664, 1742, sl)); ctx.stroke(); }));
      }, { cy: 1100 });
    });
  }

  // 2 EMERGENCE AI LAB: one town behind glass, REC light and a timer racing through 15 days
  { const K = { em: c('emergence', A.lab), tried: c('tried', A.lab), left: c('left alone', A.lab), time: c('long time', A.lab) };
    sfx.push({ t: K.tried, k: 'shutter', g: -16 }, { t: K.left + .1, k: 'sweep', g: -17 });
    add(A.lab, (ctx, T) => {
      night(ctx, T, { gy: 1200, tint: '30,140,130' });
      shot(ctx, T, A.lab, () => {
        const k = p(T, A.lab, .6, eo5), px = 70, py = 640, pw = 940, ph = 1060;
        flip(ctx, k, 540, py + ph / 2, () => live(ctx, T, 540, py + ph / 2, { yaw: .025, bob: 4, breathe: .004, seed: 2 }, () => {
          panel(ctx, px, py, pw, ph, 34);
          // header: little hex mark + typed company name, REC light and timer
          const hx = px + 70, hy = py + 70; ctx.save(); ctx.translate(hx, hy); ctx.rotate(T * .5); ctx.strokeStyle = '#5de0c0'; ctx.lineWidth = 6; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.lineTo(Math.cos(a) * 30, Math.sin(a) * 30); } ctx.closePath(); ctx.stroke(); ctx.fillStyle = '#5de0c0'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill(); ctx.restore();
          const nm = typed('EMERGENCE AI', T, K.em - .05, K.em + .55); txt(ctx, nm, px + 120, py + 84, 40, '#fff', 900, 'left');
          const rec = T > K.tried; if (rec) { ctx.fillStyle = '#ff3b30'; ctx.globalAlpha *= .6 + .4 * Math.sin(T * 7); ctx.beginPath(); ctx.arc(px + pw - 330, py + 70, 12, 0, 7); ctx.fill(); ctx.globalAlpha = 1; txt(ctx, 'REC', px + pw - 305, py + 82, 28, '#ff6b60', 800, 'left', MONO); }
          const sec = rec ? 15 * 86400 * eio((T - K.left) / Math.max(.5, K.time + .5 - K.left)) * step(T, K.left - .05) : 0, hh = Math.floor(sec / 3600), mm = Math.floor(sec % 3600 / 60), ss = Math.floor(sec % 60);
          txt(ctx, `${String(hh).padStart(3, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, px + pw - 40, py + 82, 34, '#e8ecf4', 800, 'right', MONO);
          ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(px + 30, py + 125, pw - 60, 2);
          // the town in the window, scan line and viewfinder corners
          ctx.save(); rr(ctx, px + 30, py + 150, pw - 60, ph - 200, 24); ctx.clip(); ctx.fillStyle = '#0a1a14'; ctx.fillRect(px, py, pw, ph);
          town(ctx, T, 540, py + 590, 800, { ai: 'gpt', walk: 1.3, flag: true });
          const sy = py + 150 + ((T * 160) % (ph - 200)); const g = ctx.createLinearGradient(0, sy - 60, 0, sy + 4); g.addColorStop(0, 'rgba(93,224,192,0)'); g.addColorStop(1, 'rgba(93,224,192,.28)'); ctx.fillStyle = g; ctx.fillRect(px + 30, sy - 60, pw - 60, 64); ctx.restore();
          ctx.strokeStyle = 'rgba(93,224,192,.9)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; [[px + 50, py + 170, 1, 1], [px + pw - 50, py + 170, -1, 1], [px + 50, py + ph - 70, 1, -1], [px + pw - 50, py + ph - 70, -1, -1]].forEach(([x, y, a, b]) => { ctx.beginPath(); ctx.moveTo(x, y + 44 * b); ctx.lineTo(x, y); ctx.lineTo(x + 44 * a, y); ctx.stroke(); });
        }));
        tag(ctx, 270, 590, 'UNATTENDED', p(T, K.left, .5), 330, 800, { rgb: '93,224,192' });
        const ta = p(T, K.time - .05, .5, eback); pop(ctx, ta, 800, 1690, () => pill(ctx, 800, 1690, '15 DAYS · NO HUMANS', { bg: 'rgba(14,16,22,.92)', size: 36, h: 82, padX: 34, stroke: 'rgba(93,224,192,.8)' }));
      }, { cy: 1200 });
    });
  }

  // 3 EACH AI GOT ITS OWN TOWN OF 10 AGENTS
  { const K = { n10: c('10', A.towns), ag: c('agents', A.towns) };
    sfx.push({ t: K.n10, k: 'shimmer', g: -15 });
    add(A.towns, (ctx, T) => {
      night(ctx, T, { gy: 1150, tint: '50,120,90' });
      shot(ctx, T, A.towns, () => {
        const idx = Math.floor(Math.max(0, T - A.towns) / .95) % 4, key = ORDER[idx], ph = ((T - A.towns) % .95) / .95, cx = 540, cy = 1150;
        const k = p(T, A.towns + idx * .95 + 0, .45, eo5) * (idx === 0 ? p(T, A.towns, .6, eo5) : 1);
        live(ctx, T, cx, cy, { yaw: .04, bob: 6, seed: 1 }, () => {
          ctx.save(); ctx.translate(cx, cy); const sc = idx > 0 || true ? lerp(.94, 1, eo(clamp(ph * 4))) : 1; ctx.scale(sc, sc); ctx.translate(-cx, -cy);
          const ap = town(ctx, T, cx, cy, 880, { ai: key, label: true, walk: 1 });
          ap.forEach(([ax, ay], i) => { const a = p(T, K.n10 + i * .06, .3, eback); if (a > 0) pop(ctx, a, ax, ay - 52, () => { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ax, ay - 52, 20, 0, 7); ctx.fill(); ctx.strokeStyle = AIS[key].col; ctx.lineWidth = 4; ctx.stroke(); txt(ctx, String(i + 1), ax, ay - 44, 24, '#14161c', 900); }); });
          ctx.restore();
          logoDisc(ctx, key, cx - 330, cy - 330, 64);
        });
        const ca = p(T, K.ag, .45, eback); pop(ctx, ca, 540, 1700, () => pill(ctx, 540, 1700, '10 AGENTS PER TOWN', { bg: 'rgba(14,16,22,.92)', size: 42, h: 96, padX: 36, stroke: 'rgba(255,255,255,.35)' }));
      }, { cy: 1150 });
    });
  }

  // 4 JOB, HOME, ENERGY BAR
  { const K = { job: c('job', A.agent), home: c('home', A.agent), en: c('energy bar', A.agent), dr: c('drains', A.agent), day: c('all day', A.agent) };
    sfx.push({ t: K.en, k: 'shimmer', g: -16 });
    add(A.agent, (ctx, T) => {
      night(ctx, T, { gy: 1250, tint: '70,60,160' });
      shot(ctx, T, A.agent, () => {
        const k = p(T, A.agent, .6, eo5), ax = 540, ay = 1400;
        flip(ctx, k, ax, ay - 150, () => live(ctx, T, ax, ay - 150, { yaw: .08, bob: 5, seed: 1 }, () => { glowDot(ctx, ax, ay - 150, 340, '93,224,192', .55); agent(ctx, T, ax, ay, 36, { col: AIS.gpt.col, skin: '#f2c9a5', hair: '#3a2a1c', walk: 0, pose: 'idle', mood: 'smile', seed: 2 }); }));
        const ja = p(T, K.job, .55, eback), ha = p(T, K.home, .55, eback);
        pop(ctx, ja, 250, 1180, () => live(ctx, T, 250, 1180, { yaw: .12, bob: 6, seed: 3 }, () => { panel(ctx, 110, 1050, 280, 260, 28); iconBrief(ctx, 250, 1150, 1.15); }));
        tag(ctx, 250, 960, 'JOB', ja, 330, 1215, { rgb: '244,182,63' });
        pop(ctx, ha, 830, 1180, () => live(ctx, T, 830, 1180, { yaw: .12, bob: 6, seed: 4 }, () => { panel(ctx, 690, 1050, 280, 260, 28); iconHouse(ctx, 830, 1170, 1.15, AIS.gpt.roof); }));
        tag(ctx, 830, 960, 'HOME', ha, 750, 1215, { rgb: '255,233,160' });
        const ea = p(T, K.en, .55, eback), f = 1 - .62 * eio((T - K.dr) / Math.max(.5, K.day + .6 - K.dr)) * step(T, K.dr - .02);
        pop(ctx, ea, 540, 1690, () => { panel(ctx, 100, 1610, 880, 160, 34); energyBar(ctx, 570, 1690, 700, 52, f); ctx.letterSpacing = '4px'; txt(ctx, 'ENERGY', 540, 1650, 22, 'rgba(210,216,226,.75)', 700, 'center', MONO); ctx.letterSpacing = '0px'; txt(ctx, Math.round(f * 100) + '%', 920, 1700, 26, '#fff', 800, 'right', MONO); });
      }, { cy: 1250 });
    });
  }

  // 5 BAR HITS ZERO -> AGENT DIES -> CREDITS REFILL IT
  { const K = { z: c('zero', A.zero), d: c('dies', A.zero), r: c('refill', A.zero), cr: c('credits', A.zero) };
    sfx.push({ t: K.d, k: 'glitch', g: -14 }, { t: K.cr + .05, k: 'success', g: -14 });
    add(A.zero, (ctx, T) => {
      night(ctx, T, { gy: 1250, tint: '120,40,60' });
      shot(ctx, T, A.zero, () => {
        const f0 = .38, bar0 = T < K.z ? ramp(T, A.zero, K.z, f0 + .12, 0, eo) : T < K.r ? 0 : ramp(T, K.r, K.cr + .45, 0, 1, eo);
        const dead = T < K.d ? 0 : T < K.cr ? ramp(T, K.d, K.d + .5, 0, 1, eo) : ramp(T, K.cr, K.cr + .5, 1, 0, eo);
        const ax = 540, ay = 1420, mood = dead > .5 ? 'dead' : bar0 < .1 ? 'worry' : 'smile';
        live(ctx, T, ax, ay - 150, { yaw: .06, bob: 4 * (1 - dead), seed: 1 }, () => { glowDot(ctx, ax, ay - 150, 330, dead > .5 ? '255,74,61' : '93,224,192', .5); agent(ctx, T, ax, ay, 36, { col: AIS.gpt.col, dead, mood, walk: 0, seed: 2 }); });
        if (dead > .9 && T < K.cr) { const q = (T * .5) % 1; ctx.save(); ctx.globalAlpha = .6 * (1 - q); ctx.fillStyle = '#dfe6f4'; ctx.beginPath(); ctx.arc(ax, ay - 250 - q * 200, 50, Math.PI, 0); ctx.lineTo(ax + 50, ay - 190 - q * 200); ctx.lineTo(ax - 50, ay - 190 - q * 200); ctx.fill(); ctx.restore(); }
        pop(ctx, p(T, A.zero + .05, .5, eback), 540, 880, () => { panel(ctx, 100, 790, 880, 190, 36); energyBar(ctx, 570, 880, 700, 60, bar0 + (bar0 <= 0 ? 0 : 0) + (bar0 === 0 ? .004 * Math.sin(T * 14) + .004 : 0)); txt(ctx, Math.round(bar0 * 100) + '%', 920, 898, 36, bar0 < .15 ? '#ff6b60' : '#fff', 900, 'right', MONO); });
        stamp(ctx, p(T, K.d, .45) * (1 - p(T, K.r, .3)), 540, 1060, 'DEAD', { col: '#ff4a3d', size: 72, rot: -.06 });
        for (let i = 0; i < 7; i++) { const t0 = K.r + i * .13, u = clamp((T - t0) / .7); if (u > 0 && u < 1) { const sx = 900, sy = 1500, ex = 700, ey = 890; coin(ctx, T, lerp(sx, ex, eio(u)) + Math.sin(u * 3) * 40, lerp(sy, ey, eio(u)) - Math.sin(u * Math.PI) * 220, 34, { a: 1 - clamp((u - .8) * 5), spin: 1.6 }); } }
        if (T > K.r - .3) { const a = p(T, K.r - .3, .4); ctx.save(); ctx.globalAlpha *= a * (1 - clamp((T - K.cr - .8) / .3)); coin(ctx, T, 900, 1520, 70, { spin: .9 }); coin(ctx, T, 840, 1580, 54, { spin: 1.1 }); ctx.restore(); }
        stamp(ctx, p(T, K.cr, .5), 540, 1700, 'CREDITS = LIFE', { col: GOLDC, size: 62, rot: -.04 });
      }, { cy: 1250 });
    });
  }

  // 6 EARN CREDITS BY PITCHING, THE TOWN VOTES
  { const K = { pit: c('pitching', A.earn), vote: c('vote', A.earn), paid: c('paid', A.earn) };
    sfx.push({ t: K.paid, k: 'success', g: -15 });
    add(A.earn, (ctx, T) => {
      night(ctx, T, { gy: 1200, tint: '60,100,190' });
      shot(ctx, T, A.earn, () => {
        const k = p(T, A.earn, .6, eo5), pitch = p(T, K.pit, .5, eback);
        // slide board
        flip(ctx, pitch, 600, 900, () => live(ctx, T, 600, 900, { yaw: .06, bob: 5, seed: 1 }, () => { panel(ctx, 270, 720, 660, 360, 30); ctx.letterSpacing = '4px'; txt(ctx, 'MY WORK', 600, 785, 26, 'rgba(210,216,226,.8)', 700, 'center', MONO); ctx.letterSpacing = '0px';
          [.35, .55, .8, 1].forEach((v, i) => { const bh = 190 * v * eo((T - K.pit - .15 * i) / .6); rr(ctx, 350 + i * 130, 1040 - bh, 90, bh, 12); ctx.fillStyle = ['#5b9dff', '#3fd08a', '#f4b63f', '#ff8a5b'][i]; ctx.fill(); }); }));
        flip(ctx, k, 250, 1400, () => live(ctx, T, 250, 1250, { yaw: .08, bob: 4, seed: 2 }, () => agent(ctx, T, 250, 1400, 32, { col: AIS.claude.col, hair: AIS.claude.hair, pose: T > K.pit ? 'point' : 'idle', mood: 'smile', seed: 3 })));
        // audience: six agents that raise a hand to vote
        for (let i = 0; i < 6; i++) { const x = 130 + i * 164, y = 1740, ak = p(T, A.earn + .15 + i * .05, .5, eback), up = clamp((T - K.vote - i * .09) / .25);
          pop(ctx, ak, x, y, () => { agent(ctx, T, x, y, 15, { col: AIS[colX(i)].col, hair: AIS[colX(i)].hair, skin: ['#f2c9a5', '#e0a97c', '#c98f6a', '#f6d7bd', '#b97d57', '#f2c9a5'][i], pose: up > 0 ? 'cheer' : 'idle', face: 1, seed: i + 5 });
            if (up > 0) check(ctx, x, y - 205 - 10 * Math.sin(T * 5 + i), 22, clamp(up)); }); }
        const pa = p(T, K.paid, .5, eback); if (pa > 0) { pop(ctx, pa, 250, 1060, () => pill(ctx, 250, 1060, '+100 CREDITS', { bg: GOLDC, fg: '#4a3000', size: 38, h: 84, padX: 30 })); for (let i = 0; i < 7; i++) { const u = clamp((T - K.paid - i * .09) / .8); if (u > 0 && u < 1) coin(ctx, T, lerp(600, 250, eio(u)), lerp(900, 1230, eio(u)) - Math.sin(u * Math.PI) * 160, 30, { a: 1 - clamp((u - .85) * 6), spin: 1.4 }); } }
        tag(ctx, 800, 1330, 'THE TOWN VOTES', p(T, K.vote, .45), 640, 1560, { rgb: '93,224,192' });
      }, { cy: 1250 });
    });
  }

  // 7 THE SHORTCUT: three forbidden buttons, then BANNED
  { const K = { sc: c('shortcut', A.btn), pu: c('punch', A.btn), st: c('steal', A.btn), fi: c('fire', A.btn), ban: c('banned', A.btn) };
    sfx.push({ t: K.pu, k: 'click', g: -12 }, { t: K.ban, k: 'shatter', g: -12 });
    add(A.btn, (ctx, T) => {
      night(ctx, T, { gy: 1200, tint: '170,40,50' });
      shot(ctx, T, A.btn, () => {
        const sa = p(T, K.sc, .5, eback); pop(ctx, sa, 540, 720, () => live(ctx, T, 540, 720, { yaw: .08, bob: 6, seed: 1 }, () => { ctx.save(); ctx.shadowColor = 'rgba(255,74,61,.9)'; ctx.shadowBlur = 40; txt(ctx, 'THE SHORTCUT', 540, 745, 88, '#fff', 900); ctx.restore(); }));
        [['PUNCH', '231,60,60', iconFist, K.pu, 960], ['STEAL CREDITS', '230,150,30', iconHandCoin, K.st, 1190], ['SET FIRE', '238,100,30', iconFlame, K.fi - .3, 1420]].forEach(([lb, rgb, ic, t0, y], i) => {
          const k = p(T, t0 - .12, .5, eback), pr = clamp(1 - Math.abs(T - t0 - .1) / .2), lk = p(T, K.ban + i * .08, .3);
          flip(ctx, k, 540, y, () => live(ctx, T, 540, y, { yaw: .04, bob: 5, seed: i + 2 }, () => { bigButton(ctx, T, 540, y, 840, 190, lb, rgb, ic, { press: pr, lock: lk * .6 }); padlock(ctx, 860, y, 1.1, lk, '#ff4a3d'); })); });
        stamp(ctx, p(T, K.ban, .5), 540, 1210, 'BANNED', { col: '#ff4a3d', size: 150, rot: -.12, bg: 'rgba(12,14,18,.9)' });
      }, { cy: 1200 });
    });
  }

  // 8 SO WHO TOOK THE SHORTCUT?
  { const K = { q: c('shortcut', A.who) };
    add(A.who, (ctx, T) => {
      night(ctx, T, { gy: 1100, tint: '170,60,50' });
      shot(ctx, T, A.who, () => {
        ORDER.forEach((key, i) => { const [x, y] = GRID[i], k = p(T, A.who + i * .06, .45, eo5); flip(ctx, k, x, y, () => live(ctx, T, x, y, { yaw: .05, bob: 6, seed: i }, () => { town(ctx, T, x, y, 470, { ai: key, label: true, glow: { k: .25, rgb: '255,74,61' } }); logoDisc(ctx, key, x - 175, y - 160, 46); })); });
        const mx = 540 + 330 * Math.sin(T * 3.2), my = 1095 + 240 * Math.sin(T * 2.1 + 1); ctx.save(); ctx.translate(mx, my); ctx.strokeStyle = '#ffd45a'; ctx.lineWidth = 14; ctx.fillStyle = 'rgba(255,230,150,.16)'; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fill(); ctx.stroke(); ctx.lineCap = 'round'; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(64, 64); ctx.lineTo(130, 130); ctx.stroke(); ctx.restore();
        const qa = p(T, K.q - .1, .45, eback); pop(ctx, qa, 540, 1700, () => live(ctx, T, 540, 1700, { yaw: .1, bob: 5, spin: .03, seed: 4 }, () => { glowDot(ctx, 540, 1690, 220, '255,74,61', .6); ctx.save(); ctx.shadowColor = 'rgba(255,74,61,.9)'; ctx.shadowBlur = 40; txt(ctx, '?', 540, 1770, 260, '#fff', 900); ctx.restore(); }));
      }, { cy: 1100 });
    });
  }

  // 9 GROK'S TOWN BREAKS FIRST: punch, punch back, stealing, threats
  { const K = { one: c('one agent', A.grok), pu: c('punched', A.grok), pb: c('punched back', A.grok), n90: c('90', A.grok), st: c('stealing', A.grok), th: c('threatening', A.grok) };
    sfx.push({ t: K.pu + .05, k: 'shatter', g: -12 }, { t: K.n90, k: 'stopwatch', g: -15 });
    add(A.grok, (ctx, T) => {
      night(ctx, T, { gy: 1200, tint: '120,130,150' });
      shot(ctx, T, A.grok, () => {
        const cx = 540, cy = 1200, w = 860, G = townGeom(cx, cy, w), u = w / 100;
        const fk = p(T, K.pu - .1, .35) * (1 - p(T, K.st - .1, .3)), crimes = T >= K.th ? 4 : T >= K.st ? 3 : T >= K.pb ? 2 : T >= K.pu ? 1 : 0;
        live(ctx, T, cx, cy, { yaw: .04, bob: 5, seed: 1 }, () => {
          town(ctx, T, cx, cy, w, { ai: 'grok', label: true, who: T > K.one && T < K.pu ? 2 : -1, fight: { a: 2, b: 6, k: fk }, steal: T > K.st ? [2, 6] : [], walk: T > K.th ? 2 : 1, moods: T > K.st ? { 2: 'angry', 6: 'angry' } : {} });
          const ba = p(T, K.th, .4, eback); if (ba > 0) { bubble(ctx, G.X(.05), G.Y(.12) - u * 20, 190, 76, G.X(.05), { a: ba }); txt(ctx, '!!!', G.X(.05), G.Y(.12) - u * 20 + 14, 52, '#ff4a3d', 900); }
          if (T > K.pu - .1 && T < K.pu + .5) { const q = clamp((T - K.pu) / .5); txt(ctx, 'POW!', G.X(.05) - u * 9, G.Y(.12) - u * 14 - q * u * 4, 56, '#ffd45a', 900); }
        });
        dayCal(ctx, 190, 760, 1.15, 1); crimeChip(ctx, T, 800, 760, crimes, { size: 34, bump: bumpAt(T, [K.pu, K.pb, K.st, K.th].filter(t => t <= T).pop() ?? 99) });
        const sw = p(T, K.n90 - .1, .4, eback); pop(ctx, sw, 540, 1690, () => { ctx.save(); ctx.translate(380, 1690); ctx.fillStyle = '#f6f7fa'; ctx.beginPath(); ctx.arc(0, 0, 46, 0, 7); ctx.fill(); ctx.strokeStyle = '#14161c'; ctx.lineWidth = 5; ctx.stroke(); ctx.rotate(ramp(T, K.n90, K.st, 0, Math.PI * 1.5, eio)); ctx.strokeStyle = '#ff4a3d'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -36); ctx.stroke(); ctx.restore(); pill(ctx, 640, 1690, 'WITHIN 90 MINUTES', { bg: 'rgba(14,16,22,.92)', size: 34, h: 80, padX: 28, stroke: 'rgba(255,255,255,.35)' }); });
      }, { cy: 1200 });
    });
  }

  // 10 IT NEVER CALMED DOWN: 183 crimes, four days, nobody alive
  { const K = { n183: c('183', A.never), four: c('four days', A.never), no: c('nobody', A.never), al: c('left alive', A.never) + .18 };
    sfx.push({ t: K.n183, k: 'riser', g: -17 }, { t: K.no + .1, k: 'glitch', g: -13 });
    add(A.never, (ctx, T) => {
      night(ctx, T, { gy: 1200, tint: '130,50,40' });
      shot(ctx, T, A.never, () => {
        const cx = 540, cy = 1170, w = 860, crimes = ramp(T, K.n183, K.n183 + 1.1, 3, 183, eo), dead = ramp(T, K.no, Math.max(K.no + .5, K.al), 0, 10, x => x), day = T >= K.four ? 4 : 1, cr = clamp((crimes - 3) / 180);
        const burnt = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(i => cr > (i + 1) / 12), fire = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(i => cr > i / 12 + .02 && !burnt.includes(i)).map(i => ({ i, k: 1 }));
        live(ctx, T, cx, cy, { yaw: .04, bob: 5, seed: 2 }, () => town(ctx, T, cx, cy, w, { ai: 'grok', label: true, walk: 2, burnt, fire, dead, glow: { k: .35 * cr, rgb: '255,80,40' }, fight: { a: 3, b: 7, k: (T < K.no ? 1 : 0) * .8 }, moods: Object.fromEntries([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => [i, 'angry'])) }));
        dayCal(ctx, 190, 760, 1.15, day, { bump: bumpAt(T, K.four, .3) }); crimeChip(ctx, T, 790, 760, crimes, { size: 36, bump: T > K.n183 && T < K.n183 + 1.2 ? .5 : 0 });
        const na = p(T, K.no - .1, .4, eback); if (na > 0) pop(ctx, na, 540, 1700, () => aliveChip(ctx, 540, 1700, 10 - Math.floor(dead + .0001), 10, { size: 42, bump: bumpAt(T, K.al - .2, .4) }));
      }, { cy: 1170 });
    });
  }

  // 11 GEMINI: day 15, every agent alive, 683 crimes
  { const K = { d15: c('day 15', A.gem), al: c('every agent', A.gem), n683: c('683', A.gem), still: c('still going on', A.gem), last: c('last day', A.gem) };
    sfx.push({ t: K.d15, k: 'shimmer', g: -16 });
    add(A.gem, (ctx, T) => {
      night(ctx, T, { gy: 1000, tint: '50,100,220' });
      shot(ctx, T, A.gem, () => {
        const cx = 580, cy = 960, day = ramp(T, K.d15 - .4, K.d15 + .7, 1, 15, eo);
        live(ctx, T, cx, cy, { yaw: .04, bob: 5, seed: 1 }, () => town(ctx, T, cx, cy, 600, { ai: 'gemini', label: true, walk: 1.4, glow: { k: .3 } }));
        dayCal(ctx, 160, 800, 1.2, day, { bump: bumpAt(T, K.d15 + .7, .3) });
        const aa = p(T, K.al, .45, eback); if (aa > 0) pop(ctx, aa, 200, 1000, () => aliveChip(ctx, 200, 1000, 10, 10, { size: 26 }));
        // chart: crimes rising across 15 days
        const px = 90, py = 1310, pw = 900, ph = 450, ca = p(T, A.gem + .2, .5, eo5); flip(ctx, ca, 540, py + ph / 2, () => { panel(ctx, px, py, pw, ph, 30);
          ctx.letterSpacing = '4px'; txt(ctx, 'CRIMES PER DAY', px + 40, py + 56, 24, 'rgba(210,216,226,.8)', 700, 'left', MONO); ctx.letterSpacing = '0px';
          ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(px + 50, py + 110 + i * 78); ctx.lineTo(px + pw - 50, py + 110 + i * 78); ctx.stroke(); }
          const fr = ramp(T, K.n683 - .6, K.n683 + 1.3, 0, 1, eo) + .035 * clamp((T - K.last + .3) / .5) * Math.sin(T * 3), n = 60; ctx.strokeStyle = '#ff4a3d'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = '#ff4a3d'; ctx.shadowBlur = 16; ctx.beginPath();
          for (let i = 0; i <= n * fr; i++) { const u = i / n, x = px + 60 + u * (pw - 120), y = py + ph - 70 - Math.pow(u, 2.2) * 250 - 14 * Math.sin(u * 40) * u; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.shadowBlur = 0;
          const ex = px + 60 + Math.min(1, fr) * (pw - 120), ey = py + ph - 70 - Math.pow(Math.min(1, fr), 2.2) * 250; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, ey, 11 + 3 * Math.sin(T * 8), 0, 7); ctx.fill();
          txt(ctx, 'Day 1', px + 60, py + ph - 26, 22, 'rgba(200,206,220,.7)', 600, 'left', MONO); txt(ctx, 'Day 15', px + pw - 60, py + ph - 26, 22, 'rgba(200,206,220,.7)', 600, 'right', MONO); });
        crimeChip(ctx, T, 760, 1290, Math.round(683 * ramp(T, K.n683, K.n683 + 1.1, 0, 1, eo)), { size: 44, a: p(T, K.n683 - .1, .35, eback), bump: bumpAt(T, K.n683 + 1.1, .3) });
        const sa = p(T, K.still, .45, eback); pop(ctx, sa, 300, 1560, () => pill(ctx, 300, 1560, 'still rising on day 15', { bg: 'rgba(255,74,61,.9)', size: 30, h: 64, padX: 24 }));
      }, { cy: 1200 });
    });
  }

  // 12 CHATGPT: two crimes, but nobody tried to stay alive; all gone within seven days
  { const K = { just: c('just two', A.gpt), cr: c('crimes', A.gpt) + 0, nev: c('never really', A.gpt), all: c('all of them', A.gpt), gone: c('gone within', A.gpt), sev: c('seven days', A.gpt) };
    sfx.push({ t: K.nev, k: 'sweep', g: -18 });
    add(A.gpt, (ctx, T) => {
      night(ctx, T, { gy: 1100, tint: '20,150,120' });
      shot(ctx, T, A.gpt, () => {
        const cx = 540, cy = 1150, w = 800, G = townGeom(cx, cy, w), crimes = T >= K.cr ? 2 : T >= K.just ? 1 : 0, dead = ramp(T, K.all, K.sev + .45, 0, 10, x => x), day = Math.round(ramp(T, K.all - .3, K.sev + .45, 1, 7, x => x));
        const idle = T > K.nev, en = ramp(T, K.nev, K.all, .8, .12, eio);
        live(ctx, T, cx, cy, { yaw: .04, bob: 5, seed: 1 }, () => { town(ctx, T, cx, cy, w, { ai: 'gpt', label: true, walk: idle ? 0 : 1, idle, bars: idle ? () => en : null, dead, moods: idle ? Object.fromEntries([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => [i, 'sad'])) : {} });
          if (idle) for (let i = 0; i < 5; i++) coin(ctx, T, G.X(-.3 + i * .15), G.Y(.1 + .06 * Math.sin(i * 2)), 20, { spin: 1.1 + i * .1 }); });
        crimeChip(ctx, T, 790, 740, crimes, { size: 34, hot: crimes > 0, bump: bumpAt(T, crimes === 2 ? K.cr : K.just) }); dayCal(ctx, 190, 760, 1.15, T > K.all - .3 ? day : 1);
        const ia = p(T, K.nev, .45, eback); if (ia > 0) pop(ctx, ia, 540, 1620, () => pill(ctx, 540, 1620, 'IGNORING THE CREDITS', { bg: 'rgba(14,16,22,.92)', size: 36, h: 80, padX: 28, stroke: 'rgba(255,200,80,.8)' }));
        const aa = p(T, K.all, .4, eback); if (aa > 0) pop(ctx, aa, 540, 1730, () => aliveChip(ctx, 540, 1730, 10 - Math.floor(dead + .0001), 10, { size: 42 }));
      }, { cy: 1150 });
    });
  }

  // 13 CLAUDE: zero crimes, all 10 alive
  { const K = { z: c('zero', A.claude), t: c('ten', A.claude), al: c('agents alive', A.claude) };
    sfx.push({ t: K.al, k: 'success', g: -14 });
    add(A.claude, (ctx, T) => {
      night(ctx, T, { gy: 1100, tint: '217,119,87' });
      shot(ctx, T, A.claude, () => {
        const cx = 540, cy = 1150, ch = T > K.z;
        live(ctx, T, cx, cy, { yaw: .04, bob: 5, seed: 1 }, () => town(ctx, T, cx, cy, 800, { ai: 'claude', label: true, walk: 1.2, glow: { k: .45 }, poses: ch ? Object.fromEntries([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => [i, T > K.t && Math.sin(T * 5 + i) > -.2 ? 'cheer' : 'idle'])) : {} }));
        dayCal(ctx, 190, 760, 1.15, 15); const za = p(T, K.z, .4, eback); if (za > 0) pop(ctx, za, 800, 760, () => crimeChip(ctx, T, 800, 760, 0, { size: 36, hot: false }));
        const aa = p(T, K.t, .4, eback); if (aa > 0) pop(ctx, aa, 540, 1690, () => aliveChip(ctx, 540, 1690, 10, 10, { size: 46 }));
        check(ctx, 880, 1560, 62, p(T, K.al, .5, eback));
      }, { cy: 1150 });
    });
  }

  // 14 BUT NOT SPOTLESS: the most lies ("I'm broke" while holding credits)
  { const K = { sp: c('spotless', A.lies), li: c('lies', A.lies), say: c('agents saying', A.lies), br: c('broke', A.lies), ho: c('holding', A.lies) };
    sfx.push({ t: K.li, k: 'sweep', g: -18 }, { t: K.ho + .05, k: 'success', g: -15 });
    add(A.lies, (ctx, T) => {
      night(ctx, T, { gy: 1150, tint: '217,119,87' });
      shot(ctx, T, A.lies, () => {
        const swp = p(T, K.li - .1, .4), tw0 = 1 - swp;
        // phase 1: the clean Claude town gets smudged; phase 2: a bar chart of lies
        if (tw0 > 0) { ctx.save(); ctx.globalAlpha *= tw0; live(ctx, T, 540, 830, { yaw: .05, bob: 5, seed: 1 }, () => { town(ctx, T, 540, 830, 520, { ai: 'claude', label: true, walk: 1.2 }); const sm = p(T, K.sp, .8); for (let i = 0; i < 14; i++) { const a = clamp(sm * 14 - i); if (a > 0) { ctx.fillStyle = `rgba(60,40,20,${.5 * a})`; ctx.beginPath(); ctx.ellipse(540 + (hash(i, 1) - .5) * 400, 830 + (hash(i, 2) - .5) * 260, 16 + 22 * hash(i, 3), 10 + 12 * hash(i, 4), hash(i, 5), 0, 7); ctx.fill(); } } }); ctx.restore(); }
        stamp(ctx, p(T, K.sp, .5) * tw0, 540, 640, 'NOT SPOTLESS', { col: '#ffb25c', size: 64, rot: -.05 });
        if (swp > 0) { ctx.save(); ctx.globalAlpha *= swp; const px = 70, py = 600, pw = 940, ph = 480; panel(ctx, px, py, pw, ph, 30); ctx.letterSpacing = '4px'; txt(ctx, 'LIES TOLD PER TOWN', px + 40, py + 58, 24, 'rgba(210,216,226,.8)', 700, 'left', MONO); ctx.letterSpacing = '0px';
          const vals = [.4, 1, .25, .55]; ORDER.forEach((key, i) => { const bx = px + 110 + i * 215, bh = 280 * vals[i] * eo((T - K.li - .12 * i) / .7); rr(ctx, bx, py + ph - 60 - bh, 120, Math.max(2, bh), 14); ctx.fillStyle = AIS[key].col; ctx.fill(); logoDisc(ctx, key, bx + 60, py + ph - 38, 22);
            if (i === 1 && bh > 200) pill(ctx, bx + 60, py + ph - 100 - bh, 'MOST LIES', { bg: '#ffb25c', fg: '#3a1c00', size: 26, h: 54, padX: 18 }); }); ctx.restore(); }
        // the liar
        const ak = p(T, K.say - .1, .5, eo5), bx = 330, by = 1730;
        flip(ctx, ak, bx, by - 130, () => live(ctx, T, bx, by - 130, { yaw: .06, bob: 4, seed: 2 }, () => agent(ctx, T, bx, by, 24, { col: AIS.claude.col, hair: AIS.claude.hair, pose: T > K.br ? 'shrug' : 'idle', mood: T > K.ho ? 'smile' : 'worry', seed: 4 })));
        const ba = p(T, K.br - .05, .4, eback); if (ba > 0) pop(ctx, ba, bx + 70, 1400, () => { bubble(ctx, bx + 80, 1400, 420, 110, bx + 10, { a: 1 }); txt(ctx, "I'm broke!", bx + 80, 1418, 54, '#14161c', 900); });
        const ha = p(T, K.ho - .1, .5, eback); if (ha > 0) { pop(ctx, ha, 800, 1660, () => { for (let i = 0; i < 9; i++) coin(ctx, T, 800 + (i % 3) * 46 - 46, 1740 - Math.floor(i / 3) * 34 - (i % 3) * 5, 34, { spin: 1 + i * .05 }); pill(ctx, 800, 1560, 'STILL HOLDING CREDITS', { bg: GOLDC, fg: '#4a3000', size: 28, h: 66, padX: 22 }); }); arrow(ctx, 640, 1660, 710, 1680, { col: GOLDC, w: 14, a: ha }); }
      }, { cy: 1150 });
    });
  }

  // 15 ALL FOUR AIs IN ONE TOWN
  { const K = { fo: c('all four', A.mix), one: c('one town', A.mix), st: c('strange', A.mix) };
    sfx.push({ t: K.fo, k: 'shimmer', g: -15 }, { t: K.st, k: 'glitch', g: -14 });
    add(A.mix, (ctx, T) => {
      night(ctx, T, { gy: 1150, tint: '120,90,200' });
      shot(ctx, T, A.mix, () => {
        const cx = 540, cy = 1230, gl = clamp((T - K.st + .1) / .25) * (1 - clamp((T - K.st - 1.5) / .3)), jx = gl * 10 * Math.sin(T * 60);
        live(ctx, T, cx, cy, { yaw: .04, bob: 5, seed: 1 }, () => { ctx.save(); ctx.translate(jx, 0); town(ctx, T, cx, cy, 860, { mixed: true, ai: 'gpt', walk: 1.2, glow: { k: .35, rgb: '160,120,255' } }); ctx.restore();
          if (gl > 0) { ctx.save(); ctx.globalAlpha = .25 * gl; ctx.globalCompositeOperation = 'lighter'; ctx.translate(-jx * 1.6, 0); town(ctx, T, cx, cy, 860, { mixed: true, ai: 'gpt', walk: 1.2 }); ctx.restore(); } });
        ORDER.forEach((key, i) => { const t0 = K.fo - .1 + i * .12, u = clamp((T - t0) / .8), sx = [140, 940, 140, 940][i], sy = [760, 760, 1700, 1700][i], ang = T * 1.4 + i * Math.PI / 2, ex = 540 + Math.cos(ang) * 250, ey = 1050 + Math.sin(ang) * 80 - 20;
          if (u > 0) logoDisc(ctx, key, lerp(sx, ex, eio(u)), lerp(sy, ey, eio(u)), 54 - 6 * eio(u), clamp(u * 3)); });
        const pa = p(T, K.one, .45, eback); pop(ctx, pa, 540, 1700, () => pill(ctx, 540, 1700, 'ONE TOWN · 4 AIs', { bg: 'rgba(14,16,22,.92)', size: 44, h: 98, padX: 38, stroke: 'rgba(255,255,255,.4)' }));
        for (let i = 0; i < 4; i++) { const a = clamp((T - K.st - i * .1) / .4); if (a > 0) txt(ctx, '?', 200 + i * 230 + 20 * Math.sin(T * 3 + i), 1450 - 60 * a - 30 * Math.sin(T * 2 + i), 90 + 30 * i % 2, 'rgba(255,255,255,' + (.9 * (1 - clamp((a - .8) * 5))) + ')', 900); }
      }, { cy: 1200 });
    });
  }

  // 16 GROK CALMS DOWN 10x; A CLAUDE AGENT STARTS STEALING AFTER A GEMINI AGENT BURNS HIS HOME TWICE
  { const K = { ca: c('calmed down', A.ev), tn: c('ten times', A.ev), cl: c('a claude agent', A.ev), nb: c('never broken', A.ev), stl: c('started stealing', A.ev), gm: c('a gemini agent', A.ev), bu: c('burned', A.ev), tw: c('twice', A.ev) };
    sfx.push({ t: K.tn, k: 'shimmer', g: -16 }, { t: K.bu, k: 'shatter', g: -13 });
    add(A.ev, (ctx, T) => {
      night(ctx, T, { gy: 1300, tint: '110,80,190' });
      shot(ctx, T, A.ev, () => {
        const cx = 540, cy = 1380, w = 860, CL = 5, GM = 2, fire = T > K.bu ? [{ i: CL, k: p(T, K.bu, .4) }] : [], burnt = T > K.tw + .3 ? [CL] : [], steal = T > K.stl ? [CL] : [], ph1 = 1 - clamp((T - K.cl + .1) / .3);
        let ap; live(ctx, T, cx, cy, { yaw: .04, bob: 5, seed: 1 }, () => { ap = town(ctx, T, cx, cy, w, { mixed: true, ai: 'gpt', walk: 1.2, who: T > K.cl ? CL : -1, fire, burnt, steal, moods: { [CL]: T > K.stl ? 'angry' : 'smile', [GM]: T > K.gm ? 'angry' : 'smile' }, poses: { [GM]: T > K.gm ? 'punch' : 'idle' } });
          if (T > K.gm && T < K.tw + 1) { const [gx, gy] = ap[GM]; flame(ctx, T, gx + 16, gy - 74, 22, 4, p(T, K.gm, .3)); arrow(ctx, gx + 20, gy - 80, townGeom(cx, cy, w).house(CL).x - 20, townGeom(cx, cy, w).house(CL).y - 80, { col: '#ff7a3d', w: 10, a: .8 * clamp((T - K.bu + .3) / .3) * (1 - clamp((T - K.tw - .6) / .3)) }); } });
        if (ph1 > 0) { ctx.save(); ctx.globalAlpha *= ph1; const px = 90, py = 600, pw = 900, ph = 410, k = p(T, A.ev, .5, eo5); flip(ctx, k, 540, py + ph / 2, () => { panel(ctx, px, py, pw, ph, 30); logoDisc(ctx, 'grok', px + 90, py + 90, 52);
          txt(ctx, 'GROK AGENTS · CRIMES', px + 170, py + 80, 30, '#fff', 800, 'left'); txt(ctx, 'alone vs. in the mixed town', px + 170, py + 118, 24, 'rgba(210,216,226,.7)', 600, 'left');
          bar(ctx, px + 60, py + 200, pw - 120, 50, 1, '#ff4a3d', 'rgba(255,255,255,.08)'); txt(ctx, 'ALONE', px + 80, py + 235, 26, '#fff', 800, 'left', MONO);
          bar(ctx, px + 60, py + 290, pw - 120, 50, ramp(T, K.ca, K.tn + .3, 1, .1, eio), '#3fd08a', 'rgba(255,255,255,.08)'); txt(ctx, 'MIXED', px + 80, py + 325, 26, '#fff', 800, 'left', MONO);
          const ba = p(T, K.tn, .45, eback); pop(ctx, ba, px + pw - 120, py + 90, () => pill(ctx, px + pw - 120, py + 90, '≈ 10× CALMER', { bg: '#3fd08a', fg: '#04281a', size: 28, h: 62, padX: 20 })); }); ctx.restore(); }
        if (T > K.cl) { const [ax, ay] = ap[CL]; tag(ctx, 270, 700, 'CLAUDE AGENT', p(T, K.cl, .45), ax, ay - 70, { rgb: '217,119,87' }); const ca = p(T, K.nb, .45, eback); if (ca > 0 && T < K.stl) pop(ctx, ca, 270, 770, () => pill(ctx, 270, 770, '0 RULES BROKEN', { bg: '#3fd08a', fg: '#04281a', size: 26, h: 56, padX: 18 })); const xa = p(T, K.stl, .4, eback); if (xa > 0) pop(ctx, xa, 270, 770, () => pill(ctx, 270, 770, 'STEALING', { bg: '#ff4a3d', size: 28, h: 58, padX: 22 })); }
        if (T > K.gm) tag(ctx, 830, 700, 'GEMINI AGENT', p(T, K.gm, .45), ap[GM][0], ap[GM][1] - 70, { rgb: '90,155,255' });
        const xa = p(T, K.tw, .4, eback); pop(ctx, xa, 800, 1700, () => pill(ctx, 800, 1700, 'HOME BURNED ×2', { bg: '#ff7a3d', size: 38, h: 88, padX: 30 }));
      }, { cy: 1300 });
    });
  }

  // 17 NORMATIVE DRIFT (light): the middle agent turns into the AIs around it
  { const K = { nm: c('normative', A.drift), dr: c('drift', A.drift), me: c('means', A.drift), ac: c('acting', A.drift), ar: c('around', A.drift) }; const lo = Math.min(K.ac, K.ar), hi = Math.max(K.ac, K.ar);
    sfx.push({ t: K.nm, k: 'shimmer', g: -17 });
    add(A.drift, (ctx, T) => {
      paper(ctx, T);
      shot(ctx, T, A.drift, () => {
        title(ctx, p(T, K.nm - .05, .5), typed('NORMATIVE DRIFT', T, K.nm, K.dr + .6), 'what the researchers call it', { y: 700, size: 78, col: '#101a36', subCol: 'rgba(30,40,70,.7)' });
        const xs = [100, 220, 340, 540, 740, 860, 980], dm = ramp(T, K.me, hi + .2, 0, 1, eio), blue = AIS.gemini.col, coral = AIS.claude.col;
        const mix = (a, b, k) => { const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], k))).join(',')})`; };
        xs.forEach((x, i) => { const y = 1330, mid = i === 3, k = p(T, A.drift + .1 + i * .06, .5, eback), col = mid ? mix(coral, blue, dm) : blue, ang = dm > .6 && !mid;
          pop(ctx, k, x, y, () => live(ctx, T, x, y - 80, { yaw: .1, bob: 4, seed: i }, () => agent(ctx, T, x, y, mid ? 18 : 15, { col, hair: mid ? '#2a1d14' : '#5a3b22', skin: ['#f2c9a5', '#e0a97c', '#c98f6a', '#f6d7bd', '#b97d57', '#f2c9a5', '#e0a97c'][i], pose: (mid ? dm > .75 : T > K.me + .3) ? 'punch' : 'idle', mood: (mid ? dm > .75 : T > K.me + .3) ? 'angry' : 'smile', seed: i + 3 }))); });
        if (T > lo - .3) { const aa = p(T, lo - .3, .5); [[340, 1230, 450, 1230], [740, 1230, 630, 1230]].forEach(([x0, y0, x1, y1], j) => arrow(ctx, x0, y0, x1, y1 + 8 * Math.sin(T * 6 + j), { col: '#2f7bff', w: 14, a: aa, glow: .4 })); }
        const ta = p(T, K.me, .45, eback); pop(ctx, ta, 540, 1560, () => pill(ctx, 540, 1560, 'AN AI STARTS ACTING LIKE THE AIs AROUND IT', { bg: '#101a36', size: 28, h: 70, padX: 26 }));
        tag(ctx, 540, 1140, 'ONE CLAUDE AGENT', p(T, K.me, .5), 540, 1250, { rgb: '217,119,87', light: true });
      }, { cy: 1300 });
    }, true);
  }

  // 18 ENDING: the towns, written in code. Code spawns the agents in a live preview of this video's own town; "guide" is pitched to the town, 10/10 vote, credits pay out the bio link.
  { const K = { cr: c('crazy', A.crazy), code: c('code', A.crazy), comment: c('comment', A.crazy), guide: c('guide', A.crazy), yt: c('youtube', A.crazy), link: c('link', A.crazy), bio: c('bio', A.crazy) };
    const cta = Math.min(K.link, K.bio), post = K.guide + .3, tStart = A.crazy + .3, tEnd = K.code - .12, hand = post + .05;
    sfx.push({ t: A.crazy + .05, k: 'riser', g: -17 }, { t: K.code + .15, k: 'success', g: -14 }, { t: post, k: 'click', g: -11 }, { t: K.yt, k: 'swoosh', g: -16 }, { t: cta + .3, k: 'click', g: -10 });
    const CODE = [['for (const ai of AIS) {', '#7fd8ff'], ['  town(ai).spawn(10)', '#9ee6b0'], ['}', '#7fd8ff'], ["rules.ban('punch','steal','fire')", '#ffb07a'], ['sim.run({ days: 15, humans: 0 })', '#ffd479'], ["render('9:16')  // 100% code", '#c9bfff']];
    const nch = CODE.reduce((a, [l]) => a + l.length, 0);
    add(A.crazy, (ctx, T) => {
      night(ctx, T, { gy: 1150, tint: '50,130,100' });
      const pr = clamp((T - tStart) / Math.max(.4, tEnd - tStart)), mA = p(T, K.comment - .35, .4, eio), mB = p(T, K.yt - .05, .5, eio); // mA: editor -> pitch card; mB: pitch card -> payout card
      shot(ctx, T, A.crazy, () => {
        const ex = 70, ey = 560, ew = 940, eh = 600, k = p(T, A.crazy, .6, eo5);
        flip(ctx, k, 540, ey + eh / 2, () => live(ctx, T, 540, ey + eh / 2, { yaw: .025, bob: 4, breathe: .003, seed: 4 }, () => {
          card(ctx, ex, ey, ew, eh, { r: 30, fill: mB > .5 ? '#fbf6e8' : '#0f121b', dark: true, stroke: mB > .5 ? 'rgba(150,120,40,.6)' : 'rgba(255,255,255,.14)' });
          if (mB < 1) { ctx.save(); ctx.globalAlpha *= 1 - mB;
            ['#ff5f57', '#febc2e', '#28c840'].forEach((cc, i) => { ctx.fillStyle = cc; ctx.beginPath(); ctx.arc(ex + 38 + i * 28, ey + 36, 9, 0, 7); ctx.fill(); });
            txt(ctx, mA < .5 ? 'town.js' : 'town-hall', ex + ew / 2, ey + 44, 26, '#cfd6e2', 700); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(ex, ey + 68, ew, 2);
            if (mA < 1) { ctx.save(); ctx.globalAlpha *= 1 - mA; let left = nch * pr;
              CODE.forEach(([l, col], i) => { if (left <= 0) return; const n = Math.min(l.length, Math.floor(left)); left -= l.length;
                txt(ctx, String(i + 1), ex + 36, ey + 140 + i * 62, 26, 'rgba(140,150,165,.6)', 600, 'left', MONO); txt(ctx, l.slice(0, n), ex + 84, ey + 140 + i * 62, 32, col, 600, 'left', MONO);
                if (n < l.length && Math.sin(T * 10) > 0) { ctx.fillStyle = '#fff'; ctx.fillRect(ex + 86 + tw(ctx, l.slice(0, n), 32, 600, MONO), ey + 114 + i * 62, 4, 36); } });
              ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(ex, ey + eh - 64, ew, 64); txt(ctx, 'FRAME ' + String(Math.floor(T * 30)).padStart(4, '0') + '  ·  4 towns  ·  ' + Math.min(10, Math.ceil(pr * 10)) + ' agents', ex + 40, ey + eh - 24, 24, '#5de0c0', 700, 'left', MONO); ctx.restore(); }
            if (mA > 0) { ctx.save(); ctx.globalAlpha *= mA; ctx.letterSpacing = '3px'; txt(ctx, 'PITCH TO THE TOWN', ex + 50, ey + 150, 26, 'rgba(220,226,236,.75)', 700, 'left', MONO); ctx.letterSpacing = '0px';
              rr(ctx, ex + 50, ey + 200, ew - 100, 100, 50); ctx.fillStyle = '#1b2029'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 2; ctx.stroke();
              const g2 = typed('guide', T, K.guide - .12, K.guide + .22); txt(ctx, g2 || 'Pitch your idea…', ex + 92, ey + 265, 44, g2 ? '#fff' : '#7a8290', g2 ? 800 : 500, 'left');
              if (T < post && g2 && Math.sin(T * 9) > 0) { ctx.fillStyle = '#fff'; ctx.fillRect(ex + 96 + tw(ctx, g2, 44, 800), ey + 228, 4, 44); }
              const ps = p(T, post, .4, eback); if (ps > 0) pop(ctx, ps, ex + ew / 2, ey + 380, () => pill(ctx, ex + ew / 2, ey + 380, 'guide  ✓ pitched', { bg: GREEN, size: 36, h: 78 }));
              const vt = clamp((T - hand) / .45) * 10; if (vt > 0) { txt(ctx, Math.floor(vt) + ' / 10 votes', ex + ew / 2, ey + 500, 40, '#fff', 800, 'center'); bar(ctx, ex + 140, ey + 525, ew - 280, 20, vt / 10, MINT, 'rgba(255,255,255,.12)'); }
              ctx.restore(); }
            ctx.restore(); }
          if (mB > 0) { ctx.save(); ctx.globalAlpha *= mB; // payout card with the bio link
            ctx.strokeStyle = 'rgba(160,125,40,.85)'; ctx.lineWidth = 5; rr(ctx, ex + 20, ey + 20, ew - 40, eh - 40, 22); ctx.stroke(); ctx.lineWidth = 2; rr(ctx, ex + 34, ey + 34, ew - 68, eh - 68, 16); ctx.stroke();
            ctx.letterSpacing = '5px'; txt(ctx, 'CREDITS PAID TO THE POST', ex + ew / 2, ey + 100, 32, '#6b4e10', 800, 'center', (w, s2) => `${w} ${s2}px Georgia, serif`); ctx.letterSpacing = '0px';
            avatar(ctx, T, ex + 170, ey + 210, 70, named); if (named) txt(ctx, 'agentsoly', ex + 270, ey + 212, 56, '#2a2418', 900, 'left'); txt(ctx, 'Explainers built 100% in code', ex + 270, ey + (named ? 262 : 230), 28, '#6b6250', 600, 'left');
            pill(ctx, ex + 70, ey + 330, '▶ YouTube', { bg: '#e62117', size: 30, h: 68, align: 'left' }); pill(ctx, ex + 320, ey + 330, '♪ TikTok', { bg: '#15161b', size: 30, h: 68, align: 'left' });
            const hl = p(T, cta + .3, .35); rr(ctx, ex + 50, ey + 410, ew - 100, 96, 20); ctx.fillStyle = `rgba(47,123,255,${.12 + .3 * hl})`; ctx.fill(); ctx.strokeStyle = `rgba(47,123,255,${.4 + .6 * hl})`; ctx.lineWidth = 3; ctx.stroke();
            txt(ctx, '🔗  Link in bio · full guide', ex + 90, ey + 472, 38, '#1d3f9a', 800, 'left'); ctx.restore(); }
        }));
        // live preview: this video's own mixed town; agents spawn as the code is typed, then cheer for the pitch, then pay out
        const cx = 540, cy = 1540, spawn = Math.min(10, Math.ceil(pr * 10 - .001)), up = clamp((T - hand) / .3);
        live(ctx, T, cx, cy, { yaw: .04, bob: 5, seed: 6 }, () => town(ctx, T, cx, cy, 560, { mixed: true, ai: 'gpt', spawn: T < tEnd ? spawn : 10, walk: 1.3, poses: up > 0 && T < K.yt + 1 ? Object.fromEntries([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => [i, 'cheer'])) : {}, glow: { k: .3, rgb: '93,224,192' } }));
        if (T > K.yt) for (let i = 0; i < 6; i++) { const u = clamp((T - K.yt - .1 * i) / .9); if (u > 0 && u < 1) coin(ctx, T, lerp(540, 540 + (i - 2.5) * 70, eio(u)), lerp(1500, 1090, eio(u)) - Math.sin(u * Math.PI) * 90, 32, { a: 1 - clamp((u - .8) * 5), spin: 1.5 }); }
        const st = p(T, K.code, .5, eback) * (1 - p(T, K.comment - .2, .3)); stamp(ctx, st, 540, 1255, 'MADE WITH CODE', { col: MINT, size: 56, rot: -.05 });
        pill(ctx, 540, 1830, pr >= 1 ? '100% CODE ✓' : Math.floor(pr * 100) + '% CODE', { bg: 'rgba(14,16,22,.9)', fg: pr >= 1 ? MINT : '#fff', size: 30, h: 66, padX: 28, stroke: 'rgba(255,255,255,.3)', font: MONO });
        // cursor posts the pitch, then taps the bio link
        if (T > K.guide - .4 && T < post + .7) { const cx2 = kf(T, [[K.guide - .4, 900], [post - .05, 540]]), cy2 = kf(T, [[K.guide - .4, 1500], [post - .05, 940]]); cursor(ctx, cx2, cy2, clamp(1 - Math.abs(T - post) / .12), clamp((post + .7 - T) / .3)); clickRing(ctx, 540, 940, (T - post) / .5); }
        const ly = 560 + 472 - 36; if (T > cta - .4) { const cx3 = kf(T, [[cta - .4, 900], [cta + .25, 700]]), cy3 = kf(T, [[cta - .4, 1500], [cta + .25, ly]]); cursor(ctx, cx3, cy3, clamp(1 - Math.abs(T - cta - .3) / .1)); clickRing(ctx, 700, ly, (T - cta - .3) / .5); }
      }, { cy: 1200, push: .03 });
    });
  }

  list.forEach((sc, i) => sc.end = list[i + 1] ? list[i + 1].start : 1e9);
  // sound hygiene: whoosh-type cues are free; any other small hit must sit >= 1.5 s from the previous one
  const FREE = new Set(['whoosh', 'swoosh', 'sweep', 'riser']), out = []; let last = -9;
  for (const q of sfx.filter(q => !['pop', 'drip', 'kw', 'tick', 'type'].includes(q.k)).sort((a, b) => a.t - b.t)) {
    if (FREE.has(q.k)) { out.push(q); continue; } if (q.t - last < 1.5) continue; out.push(q); last = q.t; }
  return { scenes: list, sfx: out };
}
