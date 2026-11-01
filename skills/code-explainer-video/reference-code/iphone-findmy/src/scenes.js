// "Find My works on a switched-off iPhone" explainer. All timing from word cues c('phrase', after); assets from src/assets (user PNGs).
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, win, hash, GOLD, rr, label, note, ring, alive, flipIn } from './lib.js';
import { bgDark, FONT, cursor } from './art.js';
import { img, IMG } from './assets.js';
const kf = (T, keys, e = eio) => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (T < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e((T - t0) / (t1 - t0)); return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u); }
  return keys[keys.length - 1][1];
};
const txt = (ctx, s, x, y, size, col = '#fff', w = 700, align = 'center') => { ctx.fillStyle = col; ctx.font = FONT(w, size); ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); };
const live = (ctx, T, x, y, o, fn) => { ctx.save(); alive(ctx, T, x, y, o); fn(); ctx.restore(); };
const pop = (ctx, a, x, y, fn, rot = 0) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.rotate(rot * (1 - a)); ctx.scale(a, a); fn(); ctx.restore(); };
const zoom = (ctx, z, x, y) => { ctx.translate(x, y); ctx.scale(z, z); ctx.translate(-x, -y); };
const BLUE = '90,160,255', RED = '255,80,80', GREEN = '52,199,89';
const hex = (i, s = 0) => Array.from({ length: 4 }, (_, k) => Math.floor(hash(i * 7 + k, s) * 256).toString(16).padStart(2, '0')).join(' ');
// phone image with something drawn on its screen: screen box is a fraction of the image (measured from the PNG)
const SCREEN = { iphone_front: [.05, .022, .95, .978, .12], hand_iphone: [.142, .028, .684, .842, .1] };
function phoneWith(ctx, name, x, y, w, screenFn, a = 1) {
  const i = IMG[name]; if (!i || a <= 0) return; const h = w * i.height / i.width, [u0, v0, u1, v1, r] = SCREEN[name];
  img(ctx, name, x, y, w, a); if (!screenFn) return;
  const sx = x - w / 2 + u0 * w, sy = y - h / 2 + v0 * h, sw = (u1 - u0) * w, sh = (v1 - v0) * h;
  ctx.save(); ctx.globalAlpha *= a; rr(ctx, sx, sy, sw, sh, sw * r); ctx.clip(); screenFn(sx, sy, sw, sh); ctx.restore();
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#000'; rr(ctx, x - sw * .16, sy + sh * .018, sw * .32, sh * .042, sh * .021); ctx.fill(); ctx.restore(); // dynamic island
}
function shot(ctx, name, sx, sy, sw, sh) { const i = IMG[name]; const s = Math.max(sw / i.width, sh / i.height); ctx.drawImage(i, sx + (sw - i.width * s) / 2, sy + (sh - i.height * s) / 2, i.width * s, i.height * s); }
function chipGlow(ctx, T, x, y, s, a = 1) { // the Bluetooth radio, drawn as a glowing gold chip
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; const g = ctx.createRadialGradient(x, y, 4, x, y, s * 1.6); g.addColorStop(0, `rgba(${GOLD},.55)`); g.addColorStop(1, `rgba(${GOLD},0)`); ctx.fillStyle = g; ctx.fillRect(x - s * 2, y - s * 2, s * 4, s * 4);
  rr(ctx, x - s / 2, y - s / 2, s, s, s * .12); const gg = ctx.createLinearGradient(x - s / 2, y - s / 2, x + s / 2, y + s / 2); gg.addColorStop(0, '#f7d77a'); gg.addColorStop(1, '#b8862a'); ctx.fillStyle = gg; ctx.fill();
  ctx.strokeStyle = `rgba(255,240,200,${.5 + .4 * Math.sin(T * 4)})`; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
}
function waves(ctx, T, x, y, r1, a = 1, col = GOLD, speed = .8) { for (let i = 0; i < 3; i++) ring(ctx, x, y, ((T * speed + i / 3) % 1) * (a > 0 ? 1 : 0), col, 10, r1); }
function padlock(ctx, x, y, s, open = 0, a = 1, col = '#e9edf2') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.strokeStyle = col; ctx.lineWidth = s * .14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -s * .35 - open * s * .3, s * .32, Math.PI, 0); ctx.lineTo(s * .32, -s * .1 - open * s * .3); ctx.stroke();
  rr(ctx, -s * .5, -s * .15, s, s * .8, s * .12); ctx.fillStyle = col; ctx.fill(); ctx.fillStyle = '#20232a'; ctx.beginPath(); ctx.arc(0, s * .2, s * .1, 0, 7); ctx.fill(); ctx.restore();
}
function bar(ctx, T) { // warm bar background: bokeh lights + wooden counter + a glass
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1a10'); g.addColorStop(.6, '#4a2c16'); g.addColorStop(1, '#1a0f08'); ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  for (let i = 0; i < 26; i++) { const x = hash(i) * W, y = 480 + hash(i, 1) * 700, r = 30 + 60 * hash(i, 2), a = .12 + .18 * (.5 + .5 * Math.sin(T * (.6 + hash(i, 3)) + i));
    const b = ctx.createRadialGradient(x, y, 1, x, y, r); b.addColorStop(0, `rgba(255,${180 + 50 * hash(i, 4)},110,${a})`); b.addColorStop(1, 'rgba(255,190,110,0)'); ctx.fillStyle = b; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#5a3418'; ctx.fillRect(-W, 1500, W * 3, 600); for (let i = 0; i < 5; i++) { ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(-W, 1530 + i * 60, W * 3, 4); }
  ctx.save(); ctx.globalAlpha = .9; rr(ctx, 110, 1180, 180, 330, 20); const gl = ctx.createLinearGradient(110, 1180, 290, 1180); gl.addColorStop(0, 'rgba(240,170,40,.75)'); gl.addColorStop(.5, 'rgba(255,210,90,.9)'); gl.addColorStop(1, 'rgba(200,130,30,.75)'); ctx.fillStyle = gl; ctx.fill();
  ctx.fillStyle = 'rgba(255,250,235,.9)'; rr(ctx, 110, 1180, 180, 50, 20); ctx.fill(); ctx.restore();
}
function hexStream(ctx, T, x, y, n, t0, a = 1, seed = 0) { ctx.save(); ctx.globalAlpha = a; ctx.font = '600 30px "Cascadia Mono", Consolas, monospace'; ctx.textAlign = 'left';
  for (let i = 0; i < n; i++) { const s = clamp((T - t0) * 6 - i); if (s <= 0) continue; ctx.fillStyle = `rgba(${GOLD},${.45 + .55 * s})`; ctx.fillText(hex(i, seed), x, y + i * 42); } ctx.restore(); }
function avatar(ctx, T, x, y, r, named) {
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, '#1fa58f'); g.addColorStop(1, '#f2a25c'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; if (named) txt(ctx, 'a', x, y + r * .32, r * .92, '#fff', 900); else { ctx.beginPath(); ctx.arc(x, y - r * .28, r * .34, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y + r * .58, r * .6, r * .42, 0, Math.PI, 0); ctx.fill(); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(T * 1.6); const cg = ctx.createConicGradient(0, 0, 0); cg.addColorStop(0, '#f2a25c'); cg.addColorStop(.5, '#1fa58f'); cg.addColorStop(1, '#f2a25c'); ctx.strokeStyle = cg; ctx.lineWidth = r * .08; ctx.beginPath(); ctx.arc(0, 0, r * 1.16, 0, 7); ctx.stroke(); ctx.restore();
}
const cross = (ctx, x, y, r, a) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = `rgb(${RED})`; ctx.lineWidth = 12; ctx.lineCap = 'round'; const s = r * eo(a); ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); ctx.stroke(); ctx.restore(); };
function battery(ctx, x, y, w, h, level, reserve, a = 1) { // horizontal battery; gold reserve section at the left end
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#cfd6e2'; ctx.lineWidth = 6; rr(ctx, x, y, w, h, 18); ctx.stroke(); rr(ctx, x + w + 6, y + h * .3, 16, h * .4, 5); ctx.fillStyle = '#cfd6e2'; ctx.fill();
  const iw = w - 20; if (level > 0) { rr(ctx, x + 10, y + 10, iw * level, h - 20, 10); ctx.fillStyle = level < .1 ? `rgb(${RED})` : `rgb(${GREEN})`; ctx.fill(); }
  if (reserve > 0) { rr(ctx, x + 10, y + 10, iw * .07 * reserve, h - 20, 10); ctx.fillStyle = `rgb(${GOLD})`; ctx.fill(); } ctx.restore();
}

export const KEYWORDS = 'thief off map 24 running really 11 radio awake grabs bar black job codes bluetooth airpods dark whispering 15 gps internet idea thief stranger hears location locks apple unlock read never helped leftovers nobody dead empty five slider findable crazy code guide bio';
export const EMOJI = { map: '🗺️', airpods: '🎧', apple: '', code: '💻', guide: '💬', bio: '🔗' };
export const CAPTION_SFX = false;
// Hinglish voice: same scenes, cues mapped to the words it says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      "so what's|so what": 'to ek band', 'on most': 'iphone 11', 'keeps one': 'aur bas', 'picture this': 'sochiye', 'right before': 'screen black', 'then everything': 'phir baaki',
      'it has no': 'uske paas na', 'but then the thief': 'lekin phir wo chor', 'only your': 'use sirf', 'but that radio': 'lekin wo radio', "that's also why": 'isliye ek dead',
      "and it's why": 'aur isliye jab', 'so your phone was': 'haan', "and here's": 'aur sabse', 'if you want': 'agar aap bhi',
      find: 'phir bhi', running: 'chal kya', "isn't": 'band hota', really: 'hota hi nahi', since: 'ke baad', shuts: 'band ho jaata|battery poori', see: 'dikhta|jaagta',
      small: 'chhota sa', awake: 'jaagta', grabs: 'utha', holds: 'daba', job: 'aakhri kaam', writes: 'banata', hands: 'de deta', same: 'wahi jo',
      dark: 'phir baaki > band', whispering: 'dheere', over: 'baar-baar', switches: 'badal', 15: 'pandrah', idea: 'pata hi',
      walks: 'guzarta', someone: 'aise insaan', hears: 'sun leta|sunega', adds: 'apni location', locks: 'lock', sends: 'bhej deta', unlock: 'khol', read: 'padh', stranger: 'anjaan', knows: 'pata bhi', helped: 'madad',
      leftovers: 'bachi hui battery', nobody: 'koi apple', empty: 'khatam', saves: 'aur bachi hui', five: 'paanch', slider: 'likhi',
      never: 'kabhi sach', kept: 'usne ek', "stranger's": 'baaki kaam > anjaan', rest: 'kar diya', whole: 'poora video', send: 'bhej',
    },
    keywords: 'chor off 24 map band radio jaagta bar black codes bluetooth airpods dheere pandrah gps internet insaan location lock apple khol padh madad battery dead khatam paanch slider findable crazy code guide bio',
    emoji: { map: '🗺️', airpods: '🎧', code: '💻', guide: '💬', bio: '🔗' },
  },
};

export function makeScenes(c, lang = 'en') {
  const named = lang !== 'hi'; // Hindi version: profile picture only, no channel name
  const list = [], sfx = [];
  const add = (start, draw) => { list.push({ start, light: false, draw }); if (start > 0) sfx.push({ t: start - .12, k: 'whoosh', g: -17 }); };
  const s = x => x - .1;
  const A = { what: s(c("so what's|so what")), most: s(c('on most')), keeps: s(c('keeps one')), bar: s(c('picture this')), before: s(c('right before')), dark: s(c('then everything')),
    gps: s(c('it has no')), thief: s(c('but then the thief')), only: s(c('only your')), left: s(c('but that radio')), dead: s(c("that's also why")), slider: s(c("and it's why")),
    recap: s(c('so your phone was')), crazy: s(c("and here's")), guide: s(c('if you want')) };

  // 1 HOOK: power off -> still on the map for 24 hours
  { const K = { off: c('off'), find: c('find'), map: c('map'), h24: c('24'), end: A.what };
    sfx.push({ t: K.off, k: 'click', g: -10 }, { t: K.find, k: 'swoosh', g: -14 }, { t: K.map, k: 'pop', g: -12 }, { t: K.h24, k: 'riser', g: -18 });
    add(0, (ctx, T) => {
      bgDark(ctx);
      if (T < K.find - .1) {
        const z = kf(T, [[0, 1.15], [K.off, 1]]); ctx.save(); zoom(ctx, z, 540, 1100);
        live(ctx, T, 540, 1100, { yaw: .1, bob: 8 }, () => phoneWith(ctx, 'iphone_front', 540, 1100, 560, (sx, sy, sw, sh) => {
          shot(ctx, 'power_off', sx, sy, sw, sh); const k = p(T, .3, K.off - .3, eio); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx + sw * (.22 + .52 * k), sy + sh * .158, sw * .07, 0, 7); ctx.fill();
          ctx.fillStyle = `rgba(0,0,0,${p(T, K.off, .3)})`; ctx.fillRect(sx, sy, sw, sh); }));
        ctx.restore(); label(ctx, 'SWITCHED OFF', 540, 1830, p(T, K.off, .3));
      } else {
        const z = kf(T, [[K.find, 1.3], [K.map + .6, 1.05], [K.end, 1.12]]); ctx.save(); zoom(ctx, z, 540, 1010);
        live(ctx, T, 540, 1150, { yaw: .05, bob: 5 }, () => { flipIn(ctx, 540, 1150, p(T, K.find, .5, eback)); img(ctx, 'map_night', 540, 1150, 1000); });
        waves(ctx, T, 540 - 500 + .54 * 1000, 1150 - 889 + .37 * 1778, 260, 1, BLUE); ctx.restore();
        if (T > K.h24 - .2) pop(ctx, p(T, K.h24 - .2, .45, eback), 540, 1620, () => { rr(ctx, -250, -95, 500, 170, 40); ctx.fillStyle = 'rgba(12,13,16,.85)'; ctx.fill(); ctx.strokeStyle = `rgba(${GOLD},.8)`; ctx.lineWidth = 4; ctx.stroke();
          txt(ctx, `${Math.round(24 * p(T, K.h24 - .2, 1, eio))} h`, -40, 40, 110, '#fff', 900); txt(ctx, 'UP TO', 170, -10, 26, `rgb(${GOLD})`, 800); txt(ctx, 'HOURS', 170, 30, 26, `rgb(${GOLD})`, 800); }, -.4);
      }
    });
  }
  // 2 STILL RUNNING: the phone isn't really off
  { const s0 = A.what, K = { running: c('running'), isnt: c("isn't"), really: c('really'), end: A.most };
    sfx.push({ t: K.running, k: 'shimmer', g: -16 }, { t: K.really, k: 'shutter', g: -12 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      live(ctx, T, 540, 1080, { yaw: .2, bob: 10 }, () => { flipIn(ctx, 540, 1080, p(T, s0, .6, eback)); phoneWith(ctx, 'iphone_front', 540, 1080, 500, (sx, sy, sw, sh) => {
        ctx.fillStyle = '#050506'; ctx.fillRect(sx, sy, sw, sh); const a = p(T, K.running - .2, .5); if (a > 0) { chipGlow(ctx, T, sx + sw * .5, sy + sh * .55, 46 * a, a); waves(ctx, T, sx + sw * .5, sy + sh * .55, 200, a); } }); });
      if (T > K.running) txt(ctx, '?', 860, 760 + 10 * Math.sin(T * 3), 120, `rgba(${GOLD},${p(T, K.running, .4) * (1 - p(T, K.isnt, .3))})`, 900);
      pop(ctx, p(T, K.really - .1, .35, eback), 540, 1700, () => { ctx.strokeStyle = `rgb(${RED})`; ctx.lineWidth = 8; rr(ctx, -330, -66, 660, 112, 16); ctx.stroke(); txt(ctx, 'NOT REALLY OFF', 0, 18, 64, `rgb(${RED})`, 900); }, -.6);
    });
  }
  // 3 SINCE iPHONE 11: everything you see shuts down
  { const s0 = A.most, K = { since: c('since'), n11: c('11'), shuts: c('shuts'), see: c('see', c('shuts')), end: A.keeps };
    sfx.push({ t: s0 + .2, k: 'sweep', g: -16 }, { t: K.n11, k: 'pop', g: -12 }, { t: K.shuts, k: 'glitch', g: -16 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const z = kf(T, [[s0, .85], [K.n11, 1], [K.end, 1.08]]); ctx.save(); zoom(ctx, z, 540, 1080);
      live(ctx, T, 540, 1080, { yaw: .12, bob: 8 }, () => { ctx.save(); ctx.translate(lerp(600, 0, p(T, s0, .8, eo5)), 0); img(ctx, 'exploded', 540, 1080, 1020); ctx.restore();
        const dim = p(T, K.shuts, .8); if (dim > 0) { ctx.fillStyle = `rgba(12,13,16,${.7 * dim})`; ctx.fillRect(0, 700, W, 760); chipGlow(ctx, T, 540 - 510 + .37 * 1020, 1080 - 316 + .52 * 632, 30, dim); } });
      ctx.restore();
      label(ctx, 'SCREEN', 160, 760, p(T, s0 + .6, .4), 160, 820, 22); label(ctx, 'LOGIC BOARD', 420, 1440, p(T, s0 + .9, .4), 400, 1360, 22); label(ctx, 'BATTERY', 700, 760, p(T, s0 + 1.2, .4), 690, 840, 22);
      pop(ctx, p(T, K.n11 - .2, .4, eback), 540, 1640, () => { rr(ctx, -260, -55, 520, 100, 50); ctx.fillStyle = '#1d2027'; ctx.fill(); txt(ctx, 'iPhone 11 and later', 0, 14, 40, '#fff', 800); });
      note(ctx, 'Illustration, parts simplified', 40, H - 60, 1);
    });
  }
  // 4 ONE RADIO AWAKE: logic board, the Bluetooth chip stays on
  { const s0 = A.keeps, K = { small: c('small'), radio: c('radio'), awake: c('awake'), end: A.bar };
    sfx.push({ t: K.radio, k: 'shimmer', g: -14 }, { t: K.awake, k: 'pop', g: -14 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const z = kf(T, [[s0, 1], [K.radio, 1.6]]), bx = 540 + .14 * 1300, by = 1050 - .02 * 707; ctx.save(); zoom(ctx, z, bx, by);
      live(ctx, T, 540, 1050, { yaw: .06, bob: 5 }, () => { img(ctx, 'logic_board', 540, 1050, 1300); ctx.fillStyle = `rgba(12,13,16,${.65 * p(T, K.small, .6)})`; ctx.fillRect(0, 700, W, 700); chipGlow(ctx, T, bx, by, 60 * p(T, K.small - .2, .5, eback)); });
      if (T > K.awake) waves(ctx, T, bx, by, 300); ctx.restore();
      label(ctx, 'BLUETOOTH RADIO', 540, 1500, p(T, K.radio, .4)); txt(ctx, 'stays awake', 540, 1560, 36, `rgba(${GOLD},${p(T, K.awake, .4)})`, 800);
      note(ctx, 'Illustration, parts simplified', 40, H - 60, 1);
    });
  }
  // 5 BAR: someone grabs the phone and holds the button
  { const s0 = A.bar, K = { grabs: c('grabs'), bar: c('bar'), holds: c('holds'), button: c('button'), off: c('off', c('button')), end: A.before };
    sfx.push({ t: K.grabs, k: 'swoosh', g: -14 }, { t: K.button, k: 'click', g: -10 }, { t: K.off, k: 'tick', g: -12 });
    add(s0, (ctx, T) => {
      bar(ctx, T);
      const hy = lerp(2400, 1150, p(T, K.grabs - .2, .7, eback)); live(ctx, T, 600, hy, { yaw: .08, bob: 8 }, () => phoneWith(ctx, 'hand_iphone', 600, hy, 820, (sx, sy, sw, sh) => {
        if (T < K.button) { const g = ctx.createLinearGradient(sx, sy, sx, sy + sh); g.addColorStop(0, '#1b3d8f'); g.addColorStop(1, '#0a1640'); ctx.fillStyle = g; ctx.fillRect(sx, sy, sw, sh); txt(ctx, '23:47', sx + sw / 2, sy + sh * .2, sw * .24, '#fff', 700); }
        else { shot(ctx, 'power_off', sx, sy, sw, sh); const k = p(T, K.off - .2, .5, eio); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx + sw * (.22 + .52 * k), sy + sh * .158, sw * .07, 0, 7); ctx.fill(); } }));
      if (T > K.holds) { const a = p(T, K.holds, .3); ring(ctx, 905, 980, ((T - K.holds) * 1.5) % 1, '255,255,255', 10, 60); txt(ctx, 'hold', 905, 900, 30, `rgba(255,255,255,${a})`, 700); }
    });
  }
  // 6 LAST JOB: screen goes black; the processor writes codes and hands them to the Bluetooth radio (same as AirPods)
  { const s0 = A.before, K = { black: c('black'), job: c('job'), writes: c('writes'), codes: c('codes'), hands: c('hands'), bt: c('bluetooth'), same: c('same'), pods: c('airpods'), end: A.dark };
    sfx.push({ t: K.black, k: 'shutter', g: -14 }, { t: K.writes, k: 'data', g: -16 }, { t: K.hands, k: 'sweep', g: -16 }, { t: K.pods, k: 'pop', g: -12 });
    for (let i = 0; i < 6; i++) sfx.push({ t: K.writes + .2 + i * .16, k: 'type', g: -24 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      if (T < K.job) { live(ctx, T, 540, 1080, { yaw: .12, bob: 8 }, () => phoneWith(ctx, 'iphone_front', 540, 1080, 500, (sx, sy, sw, sh) => {
          ctx.fillStyle = '#000'; ctx.fillRect(sx, sy, sw, sh); const a = 1 - p(T, K.black, .4); if (a > 0) { ctx.save(); ctx.translate(sx + sw / 2, sy + sh / 2); for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.fillStyle = `rgba(255,255,255,${a * (((i + Math.floor(T * 10)) % 8) / 8)})`; rr(ctx, -4, 18, 8, 22, 4); ctx.fill(); } ctx.restore(); } }));
        return; }
      const z = kf(T, [[K.job, 1.5], [K.writes, 1.25], [K.bt, 1.05]]), px = 540 - .12 * 1300, py = 980, bx = 540 + .14 * 1300, by = 980 - .02 * 707; ctx.save(); zoom(ctx, z, 540, 980);
      live(ctx, T, 540, 980, { yaw: .06, bob: 5 }, () => { img(ctx, 'logic_board', 540, 980, 1300); ctx.fillStyle = 'rgba(12,13,16,.45)'; ctx.fillRect(0, 600, W, 760);
        ctx.strokeStyle = `rgba(${BLUE},${.6 + .3 * Math.sin(T * 5)})`; ctx.lineWidth = 4; rr(ctx, px - 70, py - 70, 140, 140, 14); ctx.stroke(); label(ctx, 'PROCESSOR', px, py - 100, p(T, K.job, .4));
        chipGlow(ctx, T, bx, by, 50 * p(T, K.bt - .3, .5, eback)); label(ctx, 'BLUETOOTH RADIO', bx + 40, by - 100, p(T, K.bt, .4)); });
      ctx.restore();
      if (T > K.codes - .2 && T < K.hands + .9) { const fly = p(T, K.hands, .8, eio); ctx.save(); ctx.translate(lerp(0, 380, fly), lerp(0, -40, fly)); ctx.globalAlpha = 1 - fly * .9; rr(ctx, 120, 1260, 330, 290, 18); ctx.fillStyle = 'rgba(12,13,16,.9)'; ctx.fill(); ctx.strokeStyle = `rgba(${GOLD},.6)`; ctx.lineWidth = 2; ctx.stroke(); hexStream(ctx, T, 150, 1310, 6, K.writes); ctx.restore(); }
      if (T > K.same - .2) { const a = p(T, K.same - .2, .5, eback); live(ctx, T, 860, 1540, { yaw: .3, bob: 10 }, () => img(ctx, 'case_closed', 860, 1540, 260 * clamp(a, 0, 1.2)));
        ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = `rgba(${BLUE},.8)`; ctx.setLineDash([12, 10]); ctx.lineDashOffset = -T * 40; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx, by + 60); ctx.quadraticCurveTo(900, 1250, 860, 1440); ctx.stroke(); ctx.restore(); label(ctx, 'AIRPODS', 860, 1690, p(T, K.pods, .4)); }
      note(ctx, 'Illustration, parts simplified · codes illustrative', 40, H - 60, 1);
    });
  }
  // 7 DARK: only the radio whispers one code, switching every 15 minutes
  { const s0 = A.dark, K = { dark: c('dark'), whisper: c('whispering'), over: c('over'), switches: c('switches'), m15: c('15'), end: A.gps };
    sfx.push({ t: K.dark, k: 'shutter', g: -14 }, { t: K.whisper, k: 'shimmer', g: -16 }, { t: K.switches, k: 'tick', g: -12 }, { t: K.m15, k: 'stopwatch', g: -16 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const bx = 540 + .14 * 1300, by = 1150 - .02 * 707, d = p(T, K.dark - .3, .7);
      live(ctx, T, 540, 1150, { yaw: .05, bob: 5 }, () => { img(ctx, 'logic_board', 540, 1150, 1300); ctx.fillStyle = `rgba(6,7,9,${.45 + .5 * d})`; ctx.fillRect(0, 700, W, 900); chipGlow(ctx, T, bx, by, 54); });
      if (T > K.whisper - .3) { waves(ctx, T, bx, by, 520, 1, GOLD, .6); const n = T > K.m15 ? 1 : 0;
        ctx.save(); ctx.globalAlpha = p(T, K.whisper - .3, .4); ctx.font = '700 40px "Cascadia Mono", Consolas, monospace'; ctx.textAlign = 'center';
        for (let i = 0; i < 3; i++) { const u = ((T - K.whisper) * .35 + i / 3) % 1; ctx.fillStyle = `rgba(${GOLD},${1 - u})`; ctx.fillText(hex(n, 9), bx + (i - 1) * 60, by - 120 - u * 420); } ctx.restore(); }
      if (T > K.switches - .3) { const a = p(T, K.switches - .3, .4, eback); pop(ctx, a, 230, 760, () => { ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.stroke(); const an = -Math.PI / 2 + p(T, K.switches, 1.6, eio) * Math.PI / 2;
          ctx.strokeStyle = `rgb(${GOLD})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an) * 70, Math.sin(an) * 70); ctx.stroke(); ctx.fillStyle = `rgba(${GOLD},.25)`; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 86, -Math.PI / 2, an); ctx.fill(); });
        txt(ctx, 'new code every 15 min', 540, 1720, 40, `rgba(255,255,255,${p(T, K.m15, .4)})`, 800); }
      label(ctx, 'BLUETOOTH RADIO', bx, by + 140, 1); note(ctx, 'Signal shown in gold, invisible to the eye · codes illustrative', 40, H - 60, 1);
    });
  }
  // 8 NO GPS, NO INTERNET: it has no idea where it is
  { const s0 = A.gps, K = { gps: c('gps'), net: c('internet'), idea: c('idea'), end: A.thief };
    sfx.push({ t: K.gps, k: 'glitch', g: -16 }, { t: K.net, k: 'glitch', g: -16 }, { t: K.idea, k: 'pop', g: -14 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      live(ctx, T, 540, 1150, { yaw: .04, bob: 4 }, () => { img(ctx, 'map_night', 540, 1150, 1000, .35 + .2 * p(T, K.idea, .6)); });
      [['GPS', 300, K.gps], ['INTERNET', 780, K.net]].forEach(([n, x, t], i) => pop(ctx, p(T, t - .2, .4, eback), x, 820 + 8 * Math.sin(T * 2 + i), () => {
        rr(ctx, -170, -70, 340, 140, 30); ctx.fillStyle = '#1d2027'; ctx.fill(); txt(ctx, n, 0, 16, 46, '#fff', 900); cross(ctx, 0, 0, 80, p(T, t + .2, .3)); }, i ? .5 : -.5));
      if (T > K.idea - .3) { const a = p(T, K.idea - .3, .4); ctx.save(); ctx.translate(540, 1300); ctx.rotate(Math.sin(T * 2) * .2); txt(ctx, '?', 0, 60, 220, `rgba(${GOLD},${a})`, 900); ctx.restore(); txt(ctx, 'no idea where it is', 540, 1560, 40, `rgba(255,255,255,${a})`, 700); }
    });
  }
  // 9 STRANGER: thief walks past someone's iPhone; it hears the code, adds its location, locks it, sends it to Apple
  { const s0 = A.thief, K = { walks: c('walks'), someone: c('someone'), hears: c('hears'), adds: c('adds'), loc: c('location'), locks: c('locks'), sends: c('sends'), apple: c('apple', c('sends')), end: A.only };
    sfx.push({ t: K.someone, k: 'pop', g: -12 }, { t: K.hears, k: 'data', g: -16 }, { t: K.loc, k: 'pop', g: -12 }, { t: K.locks, k: 'click', g: -10 }, { t: K.sends, k: 'sweep', g: -16 }, { t: K.apple, k: 'success', g: -14 });
    add(s0, (ctx, T) => {
      const z = kf(T, [[s0, 1.15], [K.hears, 1.3], [K.sends, 1]]); bgDark(ctx); ctx.save(); zoom(ctx, z, 540, 1200);
      live(ctx, T, 540, 1200, { yaw: .03, bob: 4 }, () => img(ctx, 'map_day', 540, 1200, 1000));
      const yx = kf(T, [[s0, [250, 1500]], [K.hears, [470, 1260]], [K.end, [560, 1150]]], x => x), sx = 690, sy = 1180;
      ctx.save(); ctx.translate(yx[0], yx[1]); ctx.rotate(-.5); img(ctx, 'iphone_back', 0, 0, 90); ctx.restore(); waves(ctx, T, yx[0], yx[1], 230, 1, GOLD, .9);
      label(ctx, 'YOUR iPHONE · OFF', yx[0] - 40, yx[1] + 120, p(T, s0 + .3, .4));
      const sa = p(T, K.someone - .2, .5, eback); ctx.save(); ctx.translate(sx, sy); ctx.rotate(.4); ctx.scale(sa, sa); img(ctx, 'stranger_iphone', 0, 0, 110); ctx.restore(); label(ctx, "A STRANGER'S iPHONE", sx + 60, sy - 110, sa);
      if (T > K.hears) ring(ctx, sx, sy, ((T - K.hears) * 1.4) % 1, BLUE, 20, 120);
      ctx.restore();
      // the packet: code + location, locked, flying to Apple
      if (T > K.adds - .3) { const fly = p(T, K.sends, 1.2, eio), x = lerp(540, 540, fly), y = lerp(1640, 760, fly), a = p(T, K.adds - .3, .4);
        pop(ctx, a, x, y, () => { rr(ctx, -230, -60, 460, 120, 24); ctx.fillStyle = 'rgba(12,13,16,.92)'; ctx.fill(); ctx.strokeStyle = `rgba(${GOLD},.8)`; ctx.lineWidth = 3; ctx.stroke();
          ctx.font = '700 32px "Cascadia Mono", Consolas, monospace'; ctx.textAlign = 'left'; ctx.fillStyle = `rgb(${GOLD})`; ctx.fillText(hex(0, 9), -190, -8); ctx.fillStyle = `rgba(255,120,110,${p(T, K.loc, .3)})`; ctx.fillText('📍 + location', -190, 34);
          padlock(ctx, 175, 0, 70, 0, p(T, K.locks - .1, .3)); }); }
      if (T > K.sends) { const a = p(T, K.sends + .4, .5, eback); live(ctx, T, 540, 600, { yaw: .3, bob: 8 }, () => img(ctx, 'apple_white', 540, 600, 120 * a, clamp(a))); }
      note(ctx, 'Illustrative location, range not to scale', 40, H - 60, 1);
    });
  }
  // 10 ONLY YOUR DEVICES: you unlock it; Apple can't read it; the stranger never knows
  { const s0 = A.only, K = { unlock: c('unlock'), apple: c('apple', s0), read: c('read'), stranger: c('stranger'), knows: c('knows'), helped: c('helped'), end: A.left };
    sfx.push({ t: K.unlock, k: 'success', g: -14 }, { t: K.read, k: 'glitch', g: -16 }, { t: K.helped, k: 'pop', g: -12 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      if (T < K.apple - .1) {
        live(ctx, T, 540, 1120, { yaw: .12, bob: 8 }, () => { flipIn(ctx, 540, 1120, p(T, s0, .6, eback)); phoneWith(ctx, 'iphone_front', 540, 1120, 520, (sx, sy, sw, sh) => shot(ctx, 'findmy', sx, sy, sw, sh)); });
        padlock(ctx, 540, 1080, 150 * (1 - p(T, K.unlock + .5, .4)), p(T, K.unlock, .4, eback), 1 - p(T, K.unlock + .5, .4), `rgb(${GOLD})`);
        label(ctx, 'YOUR DEVICES', 540, 760, p(T, s0 + .2, .4));
      } else if (T < K.stranger - .1) {
        live(ctx, T, 540, 1000, { yaw: .3, bob: 10 }, () => img(ctx, 'apple_white', 540, 1000, 260));
        padlock(ctx, 540, 1350, 150, 0, p(T, K.read - .3, .4, eback), `rgb(${GOLD})`); txt(ctx, "Apple can't read it", 540, 1580, 48, `rgba(255,255,255,${p(T, K.read, .4)})`, 800);
      } else {
        live(ctx, T, 540, 1080, { yaw: .25, bob: 10 }, () => { flipIn(ctx, 540, 1080, p(T, K.stranger - .1, .5, eback)); img(ctx, 'stranger_iphone', 540, 1080, 420); });
        pop(ctx, p(T, K.knows, .4, eback), 540, 1500, () => { rr(ctx, -270, -50, 540, 100, 50); ctx.fillStyle = '#1d2027'; ctx.fill(); txt(ctx, '🔕  no notification', 0, 14, 38, '#fff', 700); });
        pop(ctx, p(T, K.helped, .4, eback), 540, 1660, () => txt(ctx, 'but it just helped you ✓', 0, 0, 42, `rgb(${GREEN})`, 800));
      }
    });
  }
  // 11 LEFTOVERS: up to 24 h on reserve; nobody nearby -> nobody hears it
  { const s0 = A.left, K = { left: c('leftovers'), h24: c('24', s0), nobody: c('nobody'), hears: c('hears', s0), end: A.dead };
    sfx.push({ t: K.left, k: 'pop', g: -14 }, { t: K.h24, k: 'tick', g: -12 }, { t: K.nobody, k: 'glitch', g: -18 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      if (T < K.nobody - .1) {
        live(ctx, T, 540, 1000, { yaw: .1, bob: 8 }, () => battery(ctx, 240, 900, 600, 220, 0, 1 - .5 * p(T, K.h24, 2), 1)); chipGlow(ctx, T, 540, 1300, 40); waves(ctx, T, 540, 1300, 200);
        label(ctx, 'RUNNING ON LEFTOVERS', 540, 840, p(T, K.left, .4));
        if (T > K.h24 - .2) pop(ctx, p(T, K.h24 - .2, .4, eback), 540, 1620, () => txt(ctx, 'Apple: up to 24 hours', 0, 0, 46, '#fff', 800));
      } else {
        live(ctx, T, 540, 1150, { yaw: .04, bob: 4 }, () => img(ctx, 'map_night', 540, 1150, 1000, .6)); const fade = 1 - p(T, K.hears, 1.2);
        ring(ctx, 540, 1150 - 889 + .37 * 1778, ((T - K.nobody) * .8) % 1, GOLD, 20, 500 * fade + 20);
        txt(ctx, 'nobody nearby = nobody hears it', 540, 1720, 40, `rgba(255,255,255,${p(T, K.hears - .3, .4)})`, 700);
      }
      note(ctx, 'Charge shown in gold · illustrative', 40, H - 60, 1);
    });
  }
  // 12 DEAD iPHONE: it shuts down early and keeps a reserve for up to 5 more hours
  { const s0 = A.dead, K = { dead: c('dead'), map: c('map', s0), shuts: c('shuts', s0), empty: c('empty'), saves: c('saves'), radio: c('radio', c('saves')), five: c('five'), end: A.slider };
    sfx.push({ t: K.dead, k: 'glitch', g: -16 }, { t: K.shuts, k: 'shutter', g: -14 }, { t: K.saves, k: 'pop', g: -12 }, { t: K.five, k: 'success', g: -14 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      if (T < K.shuts - .1) {
        live(ctx, T, 540, 1080, { yaw: .15, bob: 8 }, () => phoneWith(ctx, 'iphone_front', 540, 1080, 460, (sx, sy, sw, sh) => { ctx.fillStyle = '#000'; ctx.fillRect(sx, sy, sw, sh);
          if (Math.floor(T * 1.5) % 2 === 0 || T < K.map) battery(ctx, sx + sw * .3, sy + sh * .46, sw * .36, sh * .07, .04, 0, 1); }));
        if (T > K.map - .2) { const a = p(T, K.map - .2, .4, eback); pop(ctx, a, 820, 760, () => { ctx.fillStyle = `rgb(${RED})`; ctx.beginPath(); ctx.arc(0, -30, 46, Math.PI, 0); ctx.lineTo(0, 60); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -30, 18, 0, 7); ctx.fill(); }); txt(ctx, 'still on the map', 820, 880, 34, `rgba(255,255,255,${a})`, 700); }
      } else {
        const lvl = kf(T, [[K.shuts, .35], [K.empty, .07], [K.saves, .07]]);
        live(ctx, T, 540, 1000, { yaw: .1, bob: 8 }, () => battery(ctx, 200, 880, 680, 240, lvl, p(T, K.saves, .5), 1));
        label(ctx, 'POWER RESERVE', 330, 1210, p(T, K.saves, .4), 260, 1110, 22);
        if (T > K.radio - .2) { chipGlow(ctx, T, 540, 1420, 40); waves(ctx, T, 540, 1420, 180); }
        if (T > K.five - .2) pop(ctx, p(T, K.five - .2, .4, eback), 540, 1700, () => txt(ctx, '+ up to 5 hours', 0, 0, 58, `rgb(${GOLD})`, 900), -.4);
      }
      note(ctx, 'Illustration · Apple, iPhone User Guide', 40, H - 60, 1);
    });
  }
  // 13 SLIDER: "iPhone Findable After Power Off"
  { const s0 = A.slider, K = { off: c('off', s0), line: c('line'), slider: c('slider'), findable: c('findable'), end: A.recap };
    sfx.push({ t: K.off, k: 'click', g: -12 }, { t: K.line, k: 'pop', g: -14 }, { t: K.findable, k: 'success', g: -14 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      const z = kf(T, [[s0, 1], [K.line, 1], [K.slider + .2, 2.1]]), fx = 540, fy = 838; ctx.save(); zoom(ctx, z, fx, lerp(1100, fy, p(T, K.line, 1, eio)));
      live(ctx, T, 540, 1100, { yaw: .1, bob: 8 }, () => phoneWith(ctx, 'iphone_front', 540, 1100, 560, (sx, sy, sw, sh) => { shot(ctx, 'power_off', sx, sy, sw, sh);
        const h = p(T, K.findable - .2, .4); if (h > 0) { ctx.strokeStyle = `rgba(${GOLD},${h})`; ctx.lineWidth = 4; rr(ctx, sx + sw * .06, sy + sh * .228, sw * .88, sh * .042, 10); ctx.stroke(); } }));
      ctx.restore();
    });
  }
  // 14 RECAP: never really off; one radio awake + a stranger's phone
  { const s0 = A.recap, K = { never: c('never', s0), kept: c('kept'), radio: c('radio', c('kept')), stranger: c("stranger's"), rest: c('rest'), end: A.crazy };
    sfx.push({ t: K.never, k: 'pop', g: -12 }, { t: K.radio, k: 'shimmer', g: -14 }, { t: K.stranger, k: 'sweep', g: -16 });
    add(s0, (ctx, T) => {
      bgDark(ctx); const z = kf(T, [[s0, 1.25], [K.end, 1]]); ctx.save(); zoom(ctx, z, 540, 1150);
      live(ctx, T, 540, 1150, { yaw: .04, bob: 4 }, () => img(ctx, 'map_night', 540, 1150, 1000, .8));
      const yx = 430, yy = 1250, sx = 760, sy = 1050; ctx.save(); ctx.translate(yx, yy); ctx.rotate(-.4); img(ctx, 'iphone_back', 0, 0, 110); ctx.restore(); if (T > K.radio - .2) waves(ctx, T, yx, yy, 300);
      if (T > K.stranger - .2) { const a = p(T, K.stranger - .2, .5, eback); ctx.save(); ctx.translate(sx, sy); ctx.rotate(.4); ctx.scale(a, a); img(ctx, 'stranger_iphone', 0, 0, 120); ctx.restore();
        ctx.save(); ctx.globalAlpha = p(T, K.rest - .3, .4); ctx.strokeStyle = `rgba(${BLUE},.9)`; ctx.lineWidth = 5; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -T * 50; ctx.beginPath(); ctx.moveTo(sx, sy - 80); ctx.quadraticCurveTo(700, 700, 540, 640); ctx.stroke(); ctx.restore();
        img(ctx, 'apple_white', 540, 600, 90, p(T, K.rest - .3, .4)); }
      ctx.restore();
      pop(ctx, p(T, K.never - .1, .4, eback), 540, 1720, () => txt(ctx, 'never really off', 0, 0, 56, '#fff', 900), -.4);
    });
  }
  // 15 CODE: this whole video was made with code
  { const s0 = A.crazy, K = { crazy: c('crazy'), whole: c('whole'), code: c('code', c('whole')), end: A.guide };
    sfx.push({ t: K.crazy, k: 'pop', g: -12 }, { t: K.code, k: 'success', g: -14 }); for (let i = 0; i < 10; i++) sfx.push({ t: K.whole + i * .2, k: 'type', g: -24 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      live(ctx, T, 540, 1000, { yaw: .08, bob: 8 }, () => { flipIn(ctx, 540, 1000, p(T, s0, .6, eback));
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 50; rr(ctx, 60, 560, 960, 880, 24); ctx.fillStyle = '#16181d'; ctx.fill(); ctx.restore();
        ctx.fillStyle = '#22252c'; rr(ctx, 60, 560, 960, 60, [24, 24, 0, 0]); ctx.fill(); ['#ff5f57', '#febc2e', '#28c840'].forEach((cl, k) => { ctx.fillStyle = cl; ctx.beginPath(); ctx.arc(100 + k * 28, 590, 9, 0, 7); ctx.fill(); }); txt(ctx, 'scenes.js', 200, 598, 22, '#9aa0aa', 600, 'left');
        const lines = [['// every frame = a function of time', '#6a9955'], ['export function findMy(ctx, T) {', '#c586c0'], ['  const code = rotate(T, 15 * 60);', '#9cdcfe'], ['  radio.whisper(code);', '#dcdcaa'], ['  stranger.hear(code).lock();', '#dcdcaa'], ['}', '#c586c0'], ['', '#fff'], ['render.js → frames → mp4', '#4ec9b0']];
        let used = 0; const typed = (T - K.crazy) * 40; ctx.font = '500 30px "Cascadia Mono", Consolas, monospace'; ctx.textAlign = 'left';
        lines.forEach(([s1, col], i) => { const n = clamp(typed - used, 0, s1.length); used += s1.length + 4; ctx.fillStyle = '#555'; ctx.fillText(String(i + 1).padStart(2), 80, 690 + i * 60); ctx.fillStyle = col; ctx.fillText(s1.slice(0, Math.floor(n)), 140, 690 + i * 60); });
        const pr = p(T, K.whole, K.code - K.whole + .6, x => x); rr(ctx, 120, 1300, 840, 26, 13); ctx.fillStyle = '#2b2e35'; ctx.fill(); rr(ctx, 120, 1300, 840 * pr, 26, 13); ctx.fillStyle = '#34c759'; ctx.fill();
        txt(ctx, pr >= 1 ? 'Rendered ✓  made with code' : 'Rendering frames…', 120, 1380, 30, '#fff', 700, 'left'); });
    });
  }
  // 16 GUIDE: comment "guide"; YouTube / TikTok -> link in bio
  { const s0 = A.guide, K = { comment: c('comment'), guide: c('guide', c('comment')), send: c('send', c('comment')), yt: c('youtube'), bio: c('bio') };
    sfx.push({ t: K.guide + .5, k: 'click', g: -12 }, { t: K.send, k: 'pop', g: -12 }, { t: K.yt, k: 'swoosh', g: -16 }, { t: K.bio, k: 'click', g: -10 }); for (let i = 0; i < 5; i++) sfx.push({ t: K.guide + i * .085, k: 'type', g: -22 });
    add(s0, (ctx, T) => {
      bgDark(ctx);
      if (T < K.yt - .1) {
        pop(ctx, p(T, s0, .5, eback), 540, 760, () => { txt(ctx, 'FULL GUIDE', 0, 0, 100, '#fff', 900); txt(ctx, 'make videos like this', 0, 64, 36, '#9aa0aa', 600); });
        live(ctx, T, 540, 1040, { yaw: .08, bob: 8 }, () => { rr(ctx, 110, 980, 860, 120, 60); ctx.fillStyle = '#23262d'; ctx.fill();
          const n = Math.floor(clamp((T - K.guide) * 12, 0, 5)); txt(ctx, n ? 'guide'.slice(0, n) : 'Add a comment…', 170, 1054, 40, n ? '#fff' : '#777', 600, 'left');
          rr(ctx, 800, 1000, 150, 80, 40); ctx.fillStyle = n >= 5 ? '#2f8cff' : '#3a3d45'; ctx.fill(); txt(ctx, 'Post', 875, 1052, 30, '#fff', 800); });
        pop(ctx, p(T, K.send, .4, eback), 540, 1300, () => txt(ctx, named ? '♥  agentsoly replied: sent ✓' : '♥  Creator replied: sent ✓', 0, 0, 36, '#ff4d6d', 700), .5);
      } else {
        ['TikTok', 'YouTube'].forEach((n, i) => pop(ctx, p(T, K.yt + .3 + i * .25, .4, eback), 340 + i * 400, 660 + 10 * Math.sin(T * 2 + i * 2), () => { rr(ctx, -160, -60, 320, 120, 30); ctx.fillStyle = i ? '#e62117' : '#111'; ctx.fill(); ctx.strokeStyle = '#444'; ctx.lineWidth = 3; ctx.stroke(); txt(ctx, n, 0, 14, 40, '#fff', 800); }, i ? .6 : -.6));
        live(ctx, T, 540, 1030, { yaw: .1, bob: 10 }, () => { flipIn(ctx, 540, 1030, p(T, K.yt, .6, eback));
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 40; rr(ctx, 110, 820, 860, 420, 36); ctx.fillStyle = '#1b1d22'; ctx.fill(); ctx.restore();
          avatar(ctx, T, 240, 940, 70, named); if (named) txt(ctx, 'agentsoly', 350, 930, 46, '#fff', 800, 'left'); txt(ctx, 'Explainers built 100% in code', 350, named ? 975 : 955, 28, '#9aa0aa', 500, 'left');
          const hl = p(T, K.bio, .4); rr(ctx, 160, 1060, 760, 100, 22); ctx.fillStyle = `rgba(47,140,255,${.15 + .35 * hl})`; ctx.fill(); ctx.strokeStyle = `rgba(47,140,255,${hl})`; ctx.lineWidth = 4; ctx.stroke();
          txt(ctx, '🔗  Full guide · link in bio', 200, 1124, 36, '#7fb6ff', 700, 'left'); });
        if (T > K.bio) cursor(ctx, kf(T, [[K.bio, 800], [K.bio + .5, 620]]), kf(T, [[K.bio, 1400], [K.bio + .5, 1120]]), T > K.bio + .5 && T < K.bio + .7 ? 1 : 0);
      }
    });
  }
  list.forEach((sc, i) => sc.end = list[i + 1] ? list[i + 1].start : 1e9);
  return { scenes: list, sfx };
}
