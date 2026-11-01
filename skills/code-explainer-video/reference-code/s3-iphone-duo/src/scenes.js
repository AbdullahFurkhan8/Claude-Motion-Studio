// "iPhone Duo: how a folding screen survives" - every time comes from word cues c('phrase', after); no hard-coded seconds.
// Everything is drawn in code (duo.js + kit.js); the only image is the user's Apple logo (apple_white.png). No presenter.
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, hash, rr, alive, flipIn } from './lib.js';
import { FONT, MONO, GREEN, RED, BLUE, txt, tw, bin, pop, cursor, clickRing, check, xmark, pill, glowDot } from './kit.js';
import { LIME, LIME_HEX, STRESS, ICE, sm, bgStudio, floorShadow, fine, tag, bigNum, apple, view, onQuad, phone3d, PH, homeScreen, lockScreen,
  makeCurve, stack2d, vBend, teardrop, odometer, strands, slab, bumps, lightRays, eye, hingeHousing, iosCard } from './duo.js';

export const IMAGES = ['apple_white.png'];
const kf = (T, keys, e = eio) => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (T < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e((T - t0) / Math.max(1e-3, t1 - t0)); return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u); }
  return keys[keys.length - 1][1];
};
const live = (ctx, T, x, y, o, fn) => { ctx.save(); alive(ctx, T, x, y, o); const r = fn(); ctx.restore(); return r; };
const flip = (ctx, k, x, y, fn) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k * 1.5); flipIn(ctx, x, y, k); fn(); ctx.restore(); };
const typed = (s, T, t0, t1) => s.slice(0, Math.floor(s.length * clamp((T - t0) / Math.max(.05, t1 - t0))));
const focus = (ctx, s, fx, fy, ox = 540, oy = 1180) => { ctx.translate(ox, oy); ctx.scale(s, s); ctx.translate(-fx, -fy); };
// jagged red crack running down the crease of a display (local coords), k: 0..1 length
function crackLine(ctx, T, x, h, k, seed = 1) {
  if (k <= 0) return; ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const pts = []; for (let i = 0; i <= 24; i++) pts.push([x + (hash(i, seed) - .5) * 26, h * i / 24]);
  const n = Math.max(1, Math.floor(24 * clamp(k)));
  const path = () => { ctx.beginPath(); ctx.moveTo(...pts[0]); for (let i = 1; i <= n; i++) ctx.lineTo(...pts[i]); for (let i = 2; i <= n; i += 3) { const s = hash(i, seed + 4) > .5 ? 1 : -1; ctx.moveTo(...pts[i]); ctx.lineTo(pts[i][0] + s * (40 + 50 * hash(i, 9)), pts[i][1] + 30); ctx.lineTo(pts[i][0] + s * (70 + 60 * hash(i, 8)), pts[i][1] + 22); } };
  ctx.globalCompositeOperation = 'lighter'; path(); ctx.strokeStyle = `rgba(${STRESS},.25)`; ctx.lineWidth = 18; ctx.stroke();
  ctx.globalCompositeOperation = 'source-over'; path(); ctx.strokeStyle = `rgba(255,120,100,${.75 + .25 * Math.sin(T * 20)})`; ctx.lineWidth = 3.5; ctx.stroke(); ctx.restore();
}
// big caps headline with dark outline
function head(ctx, s, x, y, size, a, col = '#fff', glow) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.font = FONT(900, size); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(8,9,12,.85)'; ctx.lineWidth = 14; ctx.strokeText(s, x, y); if (glow) { ctx.shadowColor = `rgba(${glow},.7)`; ctx.shadowBlur = 30; } ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore();
}
// curved arrow (for slip/slide)
function arrow(ctx, x0, y0, x1, y1, a = 1, rgb = LIME) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = `rgb(${rgb})`; ctx.fillStyle = `rgb(${rgb})`; ctx.lineWidth = 5; ctx.lineCap = 'round';
  const k = eo(a), xe = lerp(x0, x1, k), ye = lerp(y0, y1, k); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(xe, ye); ctx.stroke();
  const an = Math.atan2(y1 - y0, x1 - x0); ctx.beginPath(); ctx.moveTo(xe + Math.cos(an) * 14, ye + Math.sin(an) * 14); ctx.lineTo(xe + Math.cos(an + 2.4) * 16, ye + Math.sin(an + 2.4) * 16); ctx.lineTo(xe + Math.cos(an - 2.4) * 16, ye + Math.sin(an - 2.4) * 16); ctx.fill(); ctx.restore();
}
// a deck of thin glossy layers in 3D (model: layers in the X-Z plane, stacked up Y). fan: splay like cards
function deck(ctx, T, P, n, { w = 520, d = 360, th = 8, gap = 14, fan = 0, lift = 0, a = 1, hi = -1, glue = 1, shown = 99 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  for (let i = 0; i < Math.min(n, Math.ceil(shown)); i++) {
    const k = clamp(shown - i), y = i * gap + lift * i * i * .6 + (1 - eo(k)) * 160, ox = fan * (i - n / 2) * 16 * Math.sin(T * .8 + i * .3) + fan * (i - n / 2) * 10, oz = fan * Math.cos(i * 1.3) * 10;
    ctx.save(); ctx.globalAlpha *= clamp(k * 2);
    for (let s = 0; s <= 3; s++) { // thickness slices
      const yy = y + th * s / 3, p0 = P(-w / 2 + ox, yy, -d / 2 + oz), p1 = P(w / 2 + ox, yy, -d / 2 + oz), p3 = P(-w / 2 + ox, yy, d / 2 + oz);
      onQuad(ctx, p0, p1, p3, w, d, () => {
        rr(ctx, 0, 0, w, d, 26);
        if (s < 3) { ctx.fillStyle = s === 0 ? '#8e95a1' : '#b9bfc9'; ctx.fill(); return; }
        const g = ctx.createLinearGradient(0, 0, w, d); g.addColorStop(0, '#ffffff'); g.addColorStop(.5, '#e6e9ee'); g.addColorStop(1, '#cfd4dc'); ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = i === hi ? `rgb(${LIME})` : 'rgba(255,255,255,.9)'; ctx.lineWidth = i === hi ? 6 : 2; ctx.stroke();
        const sp = ((T * .2 + i * .05) % 1.6) - .3, sg = ctx.createLinearGradient(0, 0, w, d); sg.addColorStop(clamp(sp - .1), 'rgba(255,255,255,0)'); sg.addColorStop(clamp(sp), 'rgba(255,255,255,.7)'); sg.addColorStop(clamp(sp + .1), 'rgba(255,255,255,0)');
        ctx.fillStyle = sg; ctx.fill();
      });
    }
    if (glue > 0 && i > 0) { // glowing glue rim under this layer
      const p0 = P(-w / 2 + ox, y - 2, d / 2 + oz), p1 = P(w / 2 + ox, y - 2, d / 2 + oz);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${LIME},${.55 * glue})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(...p0); ctx.lineTo(...p1); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  }
  ctx.restore();
}
// the test rig: gauge panel with a protractor and two clamps
function rig(ctx, T, cx, cy, wd, a = 1, ang = 0) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 50; rr(ctx, cx - wd / 2, cy - 330, wd, 420, 30);
  const g = ctx.createLinearGradient(0, cy - 330, 0, cy + 90); g.addColorStop(0, '#3a4150'); g.addColorStop(1, '#232831'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
  rr(ctx, cx - wd / 2, cy - 330, wd, 420, 30); ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 2; ctx.stroke();
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { ctx.fillStyle = '#5c6474'; ctx.beginPath(); ctx.arc(cx + sx * (wd / 2 - 34), cy - 120 + sy * 176, 9, 0, 7); ctx.fill(); }
  ctx.strokeStyle = 'rgba(220,228,240,.55)'; ctx.lineWidth = 2;
  for (let i = 0; i <= 36; i++) { const an = Math.PI + i / 36 * Math.PI, r0 = 230, r1 = i % 6 ? 246 : 262; ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * r0, cy - 40 + Math.sin(an) * r0 * .78); ctx.lineTo(cx + Math.cos(an) * r1, cy - 40 + Math.sin(an) * r1 * .78); ctx.stroke(); }
  const na = Math.PI * 1.5 + ang * .5; ctx.strokeStyle = `rgb(${STRESS})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, cy - 40); ctx.lineTo(cx + Math.cos(na) * 210, cy - 40 + Math.sin(na) * 164); ctx.stroke();
  ctx.fillStyle = '#d6dbe4'; ctx.beginPath(); ctx.arc(cx, cy - 40, 12, 0, 7); ctx.fill();
  ctx.restore();
}
function clamp3d(ctx, x, y, an, a = 1) { // jig clamp at a layer end, rotated to the tangent
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(an);
  const g = ctx.createLinearGradient(0, -60, 0, 60); g.addColorStop(0, '#eef1f5'); g.addColorStop(.5, '#a9b0bb'); g.addColorStop(1, '#6f7682');
  rr(ctx, -70, -62, 92, 124, 12); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2; ctx.stroke();
  for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(40,44,52,.35)'; ctx.fillRect(-60 + i * 20, -54, 8, 108); }
  ctx.restore();
}
// screens
const codeLines = [
  ['// duo.js  - fold, don\'t crack', '#7d8597'],
  ['const screen = layers(10)', '#9cdcfe'],
  ["screen.glue = 'custom adhesive'", LIME_HEX],
  ['on(\'fold\', () => layers.slide())', '#ffb59a'],
  ["hinge.curl('teardrop')", '#c9bfff'],
  ["crease.finish = 'matte'", '#9ee6b0'],
];
function editor(ctx, T, w, h, n, cursorOn) {
  ctx.fillStyle = '#0f1117'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#171a22'; ctx.fillRect(0, 0, w, 64); ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(30 + i * 24, 32, 8, 0, 7); ctx.fill(); });
  txt(ctx, 'duo.js', w / 2, 41, 22, '#cfd5e2', 700);
  let left = n; const lh = (h - 120) / codeLines.length;
  codeLines.forEach(([s, col], i) => {
    const y = 96 + i * lh;
    // each line sits on its own thin "layer" with a glowing glue line under it (the video's deck of layers)
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.035)' : 'rgba(255,255,255,.06)'; ctx.fillRect(10, y, w - 20, lh - 6);
    ctx.fillStyle = `rgba(${LIME},.35)`; ctx.fillRect(10, y + lh - 5, w - 20, 2);
    txt(ctx, String(i + 1), 34, y + lh / 2 + 9, 20, '#4a5163', 600, 'center', MONO);
    if (left > 0) { const t = s.slice(0, Math.floor(left)); txt(ctx, t, 62, y + lh / 2 + 9, 24, col, 600, 'left', MONO);
      if (left < s.length && cursorOn) { ctx.fillStyle = '#fff'; ctx.fillRect(64 + tw(ctx, t, 24, 600, MONO), y + lh / 2 - 14, 3, 28); } }
    left -= s.length;
  });
}
const CODE_LEN = codeLines.reduce((a, l) => a + l[0].length, 0);
function avatar(ctx, T, x, y, r, named) {
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, '#1fa58f'); g.addColorStop(1, '#f2a25c'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; if (named) txt(ctx, 'a', x, y + r * .32, r * .92, '#fff', 900); else { ctx.beginPath(); ctx.arc(x, y - r * .28, r * .34, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y + r * .58, r * .6, r * .42, 0, Math.PI, 0); ctx.fill(); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(T * 1.6); const cg = ctx.createConicGradient(0, 0, 0); cg.addColorStop(0, '#f2a25c'); cg.addColorStop(.5, '#1fa58f'); cg.addColorStop(1, '#f2a25c'); ctx.strokeStyle = cg; ctx.lineWidth = r * .08; ctx.beginPath(); ctx.arc(0, 0, r * 1.16, 0, 7); ctx.stroke(); ctx.restore();
}

export const KEYWORDS = 'iphone duo crack screen piece 10 ultra thin layers deck cards slide problem solid outside stretches inside squashes stress crease cracks peel fails 000 adhesive together shift microscopic paper slip relieve stretch hinge 100 parts teardrop kinks matte bumps scatters eye barely folds published tough literally sliding trust crazy code guide bio';
export const EMOJI = { eye: '👁', code: '💻', guide: '💬', bio: '🔗' };
export const CAPTION_SFX = false;
export const LANG = {
  hi: {
    alias: {
      because: 'kyunki', "it's more": 'woh 10', 'and when you fold': 'aur fold karte', "here's the problem": 'problem', 'bend it enough': 'zyada modo',
      'and the screen fails': 'aur screen theek', 'now imagine': 'ab sochiye', 'so how do': 'to das layers', 'apple uses': 'apple ek custom', "it's like bending": 'bilkul',
      'and the hinge': 'aur hinge', curls: 'screen ko ek aansu', 'is the crease': 'kya crease', 'no but': 'nahin lekin matte', 'so your eye': 'to aapki',
      'so how many': 'to kitne', "the screen doesn't": 'yeh screen mazboot', 'would you trust': 'kya aap ispe', "and here's the crazy": 'aur sabse crazy',
      iphone: 'iphone', fold: 'mud', again: 'baarbaar', 'and again': 'aadha', crack: 'crack',
      screen: 'screen', 'one piece': 'ek piece',
      '10': '10', ultra: 'ultra', layers: 'layers', deck: 'taash', cards: 'upar',
      'fold it': 'fold', slide: 'slide',
      problem: 'problem', solid: 'solid', outside: 'baahar', stretches: 'khinchti', inside: 'andar', squashes: 'dabti', stress: 'stress', crease: 'crease',
      tiny: 'chhotichhoti', cracks: 'crack', peel: 'alag',
      fails: 'kharaab', 'the fold': 'fold',
      '10 000': 'das hazaar',
      move: 'hilti', apart: 'kaise',
      adhesive: 'adhesive', holds: 'jod', together: 'rakhta', 'yet lets': 'lekin phone', shift: 'khisakne', microscopic: 'baareek', closes: 'band',
      paper: 'kaagaz', sheets: 'sheets', slip: 'phisalti', relieve: 'kam', none: 'kisi', stretch: 'khinchna',
      hinge: 'hinge', '100': '100', parts: 'parts', teardrop: 'aansu', kinks: 'kink',
      gone: 'gaya', matte: 'matte', bumps: 'bumps', scatters: 'bikher', eye: 'aankh', barely: 'mushkil', catches: 'pakad',
      many: 'kitne', published: 'publish', number: 'number',
      survive: 'bachti', tough: 'mazboot', literally: 'sach', sliding: 'slide', itself: 'andar', trust: 'bharosa',
      crazy: 'crazy', code: 'code', learn: 'seekhna', comment: 'comment', guide: 'guide', youtube: 'youtube', link: 'link', bio: 'bio',
    },
    keywords: 'iphone duo mud crack screen piece 10 ultra thin layers taash slide problem solid baahar khinchti andar dabti stress crease alag kharaab hazaar adhesive jod khisakne baareek kaagaz phisalti khinchna hinge 100 parts aansu kink matte bumps bikher aankh folds publish mazboot sach bharosa crazy code guide bio',
    emoji: { aankh: '👁', code: '💻', guide: '💬', bio: '🔗' },
  },
};

export function makeScenes(c, lang = 'en') {
  const named = lang !== 'hi'; // Hindi version: profile picture only, no channel name or handle
  const list = [], sfx = [];
  const add = (start, light, draw) => { list.push({ start, light, draw }); if (start > 0) sfx.push({ t: start - .05, k: 'whoosh', g: -19 }); };
  const s = x => x - .1;
  const A = {
    because: s(c('because')), more: s(c("it's more")), when: s(c('and when you fold')), problem: s(c("here's the problem")), enough: s(c('bend it enough')),
    fails: s(c('and the screen fails')), imagine: s(c('now imagine')), sohow: s(c('so how do')), uses: s(c('apple uses')), paper: s(c("it's like bending")),
    hinge: s(c('and the hinge')), curls: s(c('curls')), crease: s(c('is the crease')), no: s(c('no but')), eye: s(c('so your eye')), many: s(c('so how many')),
    tough: s(c("the screen doesn't")), trust: s(c('would you trust')), crazy: s(c("and here's the crazy")),
  };

  // 1 HOOK: the foldable iPhone turns, folds in half again and again, a crack flashes and is crossed out
  { const K = { ip: c('iphone'), fold: c('fold'), ag1: c('again'), ag2: c('and again'), crack: c('crack') };
    const f1 = Math.max(K.fold, .6), a1 = Math.max(K.ag1, f1 + .55), a2 = Math.max(K.ag2, a1 + .5);
    sfx.push({ t: .05, k: 'riser', g: -20 }, { t: K.crack, k: 'shatter', g: -14 });
    add(0, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1560 });
      const open = kf(T, [[0, 0], [f1, 0], [f1 + .45, 1], [a1, 1], [a1 + .4, .08], [a2, .08], [a2 + .45, 1]]);
      const yaw = kf(T, [[0, Math.PI + .9], [f1, Math.PI + .25], [f1 + .5, .42]]) + .05 * Math.sin(T * .9);
      const sc = kf(T, [[0, 1.55], [f1 + .4, 1.05]]);
      const crk = p(T, K.crack, .35);
      floorShadow(ctx, 540, 1600, 520 * sc, .7);
      live(ctx, T, 540, 1150, { yaw: .02, bob: 6, breathe: .006, seed: 1 }, () => phone3d(ctx, T, { x: 540 - 0 * sc, y: 1150, s: sc, yaw, pitch: .16, roll: -.03, open, color: 'navy',
        inner: (c2, w, h) => { homeScreen(c2, T, w, h, { crease: .4 }); crackLine(c2, T, w / 2, h, crk * (1 - p(T, K.crack + .55, .3)), 3); } }));
      const fc = kf(T, [[0, 0], [f1 + .2, 0], [f1 + .6, 1], [a1 + .1, 1], [a1 + .5, 2], [a2 + .1, 2], [a2 + .5, 3]], eo);
      live(ctx, T, 540, 1760, { yaw: .04, bob: 4, seed: 2 }, () => odometer(ctx, T, 540, 1760, .8, fc, { a: p(T, .2, .5) }));
      xmark(ctx, 790, 820, 46, p(T, K.crack + .5, .4));
      head(ctx, 'NO CRACK?', 540, 700, 84, p(T, K.crack + .45, .4, eback), '#fff');
    });
  }

  // 2 NOT ONE PIECE: the open phone lies down and its display lifts off as a stack of layers
  { const K = { scr: c('screen', A.because), one: c('one piece', A.because) };
    sfx.push({ t: K.one, k: 'sweep', g: -16 });
    add(A.because, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1500 });
      const ex = p(T, K.scr - .1, 1.1, eio), n = 11;
      const P = live(ctx, T, 540, 1300, { yaw: .015, bob: 4, breathe: .004, seed: 3 }, () => {
        floorShadow(ctx, 540, 1480, 560, .6);
        const P = phone3d(ctx, T, { x: 540, y: 1380, s: .98, yaw: .32 + .05 * Math.sin(T * .5), pitch: -1.02, open: 1, color: 'navy', inner: (c2, w, h) => homeScreen(c2, T, w, h, { dim: .6 * ex }) });
        const { w, h } = PH;
        for (let i = 0; i < n; i++) { // exploded display layers (rise one by one)
          const k = clamp(ex * 1.4 - i * .04), z = 4 + k * (60 + i * 52);
          const p0 = P(-w + 14, h / 2 - 14, z), p1 = P(w - 14, h / 2 - 14, z), p3 = P(-w + 14, -h / 2 + 14, z);
          onQuad(ctx, p0, p1, p3, 2 * w - 28, h - 28, () => {
            rr(ctx, 0, 0, 2 * w - 28, h - 28, 34);
            const top = i === n - 1, oled = i === 3;
            ctx.fillStyle = top ? 'rgba(210,225,255,.20)' : oled ? 'rgba(70,90,255,.55)' : `rgba(${i % 2 ? '230,235,245' : '200,210,225'},${.16 + .04 * i})`; ctx.fill();
            ctx.strokeStyle = i % 3 === 1 ? `rgba(${LIME},.9)` : 'rgba(255,255,255,.75)'; ctx.lineWidth = 3; ctx.stroke();
          });
        }
        return P;
      });
      // "ONE PIECE" pill gets struck through
      const op = p(T, K.one - .15, .4, eback);
      pop(ctx, op, 540, 640, () => { pill(ctx, 540, 640, 'ONE PIECE', { bg: 'rgba(30,32,38,.95)', size: 40, h: 84, stroke: 'rgba(255,255,255,.3)' });
        const k = p(T, K.one + .25, .3); if (k > 0) { ctx.strokeStyle = `rgb(${STRESS})`; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(410, 645); ctx.lineTo(lerp(410, 670, k), 645 - 8 * k); ctx.stroke(); } });
      xmark(ctx, 735, 600, 34, p(T, K.one + .3, .4));
      fine(ctx, 'Illustrative, not to scale', 60, 1860, p(T, A.because + .3, .5));
    });
  }

  // 3 MORE THAN 10 ULTRA-THIN LAYERS, stacked like a deck of cards
  { const K = { ten: c('10', A.more), ultra: c('ultra', A.more), layers: c('layers', A.more), deck: c('deck', A.more), cards: c('cards', A.more) };
    sfx.push({ t: K.deck, k: 'shutter', g: -16 });
    add(A.more, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1500 });
      const shown = kf(T, [[A.more, 3], [K.ten, 3], [K.layers, 11]], eo);
      const fan = p(T, K.deck - .1, .8, eio), yaw = -.62 + .12 * Math.sin(T * .4);
      floorShadow(ctx, 540, 1460, 520, .6);
      const P = view({ x: 540, y: 1390, s: 1.08, yaw, pitch: .62 });
      live(ctx, T, 540, 1250, { yaw: .02, bob: 5, breathe: .004, seed: 4 }, () => deck(ctx, T, P, 11, { gap: lerp(16, 20, fan), th: lerp(10, 6, p(T, K.ultra, .6)), fan, shown, glue: p(T, K.layers, .6) }));
      const num = shown < 10.5 ? String(Math.round(shown)) : '10+';
      bigNum(ctx, num, 540, 700, 150, p(T, A.more, .4));
      tag(ctx, 'ULTRA-THIN', 540, 800, p(T, K.ultra, .4) * (1 - p(T, K.deck - .2, .3)));
      tag(ctx, 'STACKED LIKE CARDS', 540, 800, p(T, K.deck, .4), undefined, undefined, { rgb: LIME });
      fine(ctx, 'Illustrative, not to scale', 60, 1860, 1);
    });
  }

  // 4 WHEN YOU FOLD IT, THEY SLIDE (side view of the stack bending into a V, ends staggering)
  { const K = { fold: c('fold it', A.when), slide: c('slide', A.when) };
    sfx.push({ t: K.slide, k: 'swoosh', g: -17 });
    add(A.when, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1480, tint: '160,170,120' });
      const b = kf(T, [[A.when, 0], [K.fold, .15], [K.fold + .9, 2.2]]), sl = p(T, K.slide - .2, .6);
      const C = makeCurve(vBend(b, 90), -520, 520, 540, 1260);
      live(ctx, T, 540, 1150, { yaw: .02, bob: 5, breathe: .004, seed: 5 }, () => stack2d(ctx, T, C, { n: 10, gap: 13, ca: -380, cb: 380, slide: sl, depth: [80, -60], glue: .6 + .4 * sl }));
      const e1 = C.at(-380 - 60), e2 = C.at(380 + 60);
      arrow(ctx, e1[0] - 40, e1[1] - 90, e1[0] + 10, e1[1] - 20, p(T, K.slide, .4));
      arrow(ctx, e2[0] + 40, e2[1] - 90, e2[0] - 10, e2[1] - 20, p(T, K.slide, .4));
      tag(ctx, 'LAYERS SLIDE', 540, 760, p(T, K.slide, .4), undefined, undefined, { rgb: LIME });
      fine(ctx, 'Illustrative, not to scale', 60, 1860, 1);
    });
  }

  // 5 THE PROBLEM: a solid sheet in a test rig; outside stretches, inside squashes, stress piles at the crease
  { const K = { prob: c('problem', A.problem), solid: c('solid', A.problem), out: c('outside', A.problem), str: c('stretches', A.problem), ins: c('inside', A.problem),
      sq: c('squashes', A.problem), stress: c('stress', A.problem), crease: c('crease', A.problem) };
    const b0 = Math.min(K.solid, K.out) - .2, b1 = Math.max(K.crease, K.stress) + .3;
    sfx.push({ t: K.prob, k: 'glitch', g: -18 }, { t: b0 + .1, k: 'gear', g: -17 }, { t: K.crease, k: 'riser', g: -20 });
    add(A.problem, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1500 });
      const b = kf(T, [[b0, 0], [b1, 2.1]], eio) + .02 * Math.sin(T * 2);
      const z = kf(T, [[A.problem, 1.05], [b1, 1.12]]);
      ctx.save(); focus(ctx, z, 540, 1200, 540, 1200);
      rig(ctx, T, 540, 1150, 880, 1, b);
      const C = makeCurve(vBend(b, 70), -520, 520, 540, 1250);
      live(ctx, T, 540, 1220, { yaw: .015, bob: 3, breathe: .003, seed: 6 }, () => {
        stack2d(ctx, T, C, { n: 8, gap: 11, fill: .98, ca: -330, cb: 330, slide: 0, depth: [60, -46], glue: 0, strain: p(T, K.out, .6) * clamp(b / 1.2), gridN: 5, glow: p(T, K.stress, .6) * .55 });
        const e1 = C.at(-330), e2 = C.at(330); clamp3d(ctx, e1[0] - 10, e1[1], e1[2]); clamp3d(ctx, e2[0] + 10, e2[1], e2[2] + Math.PI);
      });
      ctx.restore();
      const S = (x, y) => [540 + (x - 540) * z, 1200 + (y - 1200) * z];
      const bot = S(...C.at(0).slice(0, 2)), top = [bot[0], bot[1]];
      pill(ctx, 540, 600, 'THE PROBLEM', { bg: `rgba(${STRESS},.92)`, size: 34, h: 74, a: p(T, K.prob, .35) * (1 - p(T, K.solid - .1, .3)) });
      tag(ctx, 'SOLID SHEET', 540, 640, p(T, K.solid, .4) * (1 - p(T, K.str - .1, .3)));
      tag(ctx, 'TENSION  →  STRETCHES', 540, 1640, p(T, K.str, .4), bot[0], bot[1] + 70, { rgb: STRESS });
      tag(ctx, 'COMPRESSION  →  SQUASHES', 540, 620, p(T, K.sq, .4), top[0], top[1] - 30, { rgb: ICE });
      tag(ctx, 'CREASE', 820, 1460, p(T, K.crease, .4), bot[0] + 40, bot[1] + 30, { rgb: STRESS });
      fine(ctx, 'Illustrative, not to scale', 60, 1860, 1);
    });
  }

  // 6 BEND IT ENOUGH: macro of the crease, tiny cracks start and the layers peel apart
  { const K = { tiny: c('tiny', A.enough), cr: c('cracks', A.enough), peel: c('peel', A.enough) };
    sfx.push({ t: K.cr, k: 'shatter', g: -15 });
    add(A.enough, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1500, tint: '255,120,100', spot: .7 });
      const z = kf(T, [[A.enough, 1], [K.peel + 1, 1.12]]); ctx.save(); focus(ctx, z, 540, 1150, 540, 1150);
      const cx = 540, cy = 260, crk = p(T, K.cr - .1, 1.0, eo), pl = p(T, K.peel - .1, 1.1, eio), n = 9;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, cx, 1250, 900, STRESS, .35 + .1 * Math.sin(T * 3)); ctx.restore();
      for (let i = n - 1; i >= 0; i--) { // concentric layer bands around the fold
        const r0 = 700 + i * 92 + pl * i * 26 + pl * i * i * 3, r1 = r0 + 74, a0 = Math.PI * .12, a1 = Math.PI * .88;
        const heat = .55 + .45 * (i / n);
        ctx.beginPath(); ctx.arc(cx, cy, r1, a0, a1); ctx.arc(cx, cy, r0, a1, a0, true); ctx.closePath();
        const g = ctx.createRadialGradient(cx, cy, r0, cx, cy, r1); g.addColorStop(0, `rgb(${Math.round(200 + 55 * heat)},${Math.round(90 + 40 * (1 - heat))},${Math.round(80 + 30 * (1 - heat))})`); g.addColorStop(1, `rgb(${Math.round(150 + 60 * heat)},60,56)`);
        ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,220,210,.5)'; ctx.lineWidth = 2; ctx.stroke();
        for (let k = 0; k <= 22; k++) { const an = lerp(a0, a1, k / 22); ctx.strokeStyle = 'rgba(255,230,220,.35)'; ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0); ctx.lineTo(cx + Math.cos(an) * r1, cy + Math.sin(an) * r1); ctx.stroke(); }
        if (pl > 0 && i > 0) { ctx.strokeStyle = `rgba(10,4,6,${.9 * pl})`; ctx.lineWidth = 4 + pl * 18; ctx.beginPath(); ctx.arc(cx, cy, r0 - 4 - pl * 10, a0, a1); ctx.stroke(); }
      }
      // cracks: dark wedges climbing in from the outside band
      for (let j = 0; j < 5; j++) {
        const an = Math.PI * (.3 + .1 * j) + (hash(j, 2) - .5) * .05, len = (n * 92 + 160) * clamp(crk * 1.25 - j * .1), rOut = 700 + n * 92 + 80 + pl * 400;
        if (len <= 0) continue; ctx.fillStyle = '#12070a'; ctx.beginPath();
        const tipR = rOut - len; ctx.moveTo(cx + Math.cos(an - .025) * rOut, cy + Math.sin(an - .025) * rOut);
        for (let k = 1; k <= 6; k++) { const rr2 = lerp(rOut, tipR, k / 6), w2 = .025 * (1 - k / 6) + .003; ctx.lineTo(cx + Math.cos(an - w2 + (hash(k, j) - .5) * .02) * rr2, cy + Math.sin(an - w2) * rr2); }
        for (let k = 6; k >= 1; k--) { const rr2 = lerp(rOut, tipR, k / 6), w2 = .025 * (1 - k / 6) + .003; ctx.lineTo(cx + Math.cos(an + w2 + (hash(k, j + 9) - .5) * .02) * rr2, cy + Math.sin(an + w2) * rr2); }
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      tag(ctx, 'TINY CRACKS', 300, 640, p(T, K.cr, .4), undefined, undefined, { rgb: STRESS });
      tag(ctx, 'LAYERS PEEL APART', 760, 720, p(T, K.peel, .4), undefined, undefined, { rgb: '255,200,190' });
      fine(ctx, 'Magnified illustration', 60, 1860, 1);
    });
  }

  // 6b THE SCREEN FAILS RIGHT ALONG THE FOLD
  { const K = { fails: c('fails', A.fails), fold: c('the fold', A.fails) };
    const f0 = Math.min(K.fails, K.fold) - .1;
    sfx.push({ t: f0 + .1, k: 'glitch', g: -15 });
    add(A.fails, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1500 });
      const crk = p(T, f0, 1.0, eo), flick = T > f0 + .2 ? .5 + .5 * Math.sin(T * 31) * Math.sin(T * 7) : 0;
      floorShadow(ctx, 540, 1520, 560, .6);
      live(ctx, T, 540, 1250, { yaw: .02, bob: 5, breathe: .004, seed: 7 }, () => phone3d(ctx, T, { x: 540, y: 1300, s: 1.25, yaw: .3 + .05 * Math.sin(T * .5), pitch: -.95, open: 1, color: 'silver',
        inner: (c2, w, h) => { homeScreen(c2, T, w, h, { crease: 1, dim: .3 * crk }); if (crk > 0) { c2.save(); c2.globalAlpha = .35 * flick * crk; c2.fillStyle = `rgb(${STRESS})`; c2.fillRect(w / 2 - 90, 0, 180, h); c2.restore(); } crackLine(c2, T, w / 2, h, crk, 5); } }));
      pill(ctx, 540, 640, 'SCREEN FAILS ALONG THE FOLD', { bg: `rgba(${STRESS},.92)`, size: 30, h: 70, a: p(T, f0 + .1, .4) });
      fine(ctx, 'If the layers were fused', 60, 1860, 1);
    });
  }

  // 7 NOW IMAGINE 10,000 TIMES: the phone flaps open and shut while the fold counter rolls to 10,000
  { const K = { n: c('10 000', A.imagine) };
    sfx.push({ t: K.n - .3, k: 'data', g: -18 });
    add(A.imagine, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1450, warm: .5 });
      const cnt = kf(T, [[A.imagine, 0], [K.n - .3, 9000], [K.n + .7, 10000]], eo);
      const ph = (T - A.imagine) * 2.6, open = .5 + .5 * Math.sin(ph * Math.PI);
      floorShadow(ctx, 540, 1340, 420, .6);
      for (let g = 2; g >= 0; g--) { // motion ghosts
        const o2 = .5 + .5 * Math.sin((ph - g * .06) * Math.PI);
        live(ctx, T, 540, 1080, { yaw: .02, bob: 4, seed: 8 }, () => phone3d(ctx, T, { x: 540, y: 1080, s: 1.15, yaw: -.55, pitch: .5, open: o2 * .92, color: 'gold', a: g ? .18 : 1, inner: (c2, w, h) => homeScreen(c2, T, w, h, { crease: .5 }) }));
      }
      live(ctx, T, 540, 1600, { yaw: .04, bob: 4, seed: 9 }, () => odometer(ctx, T, 540, 1600, 1.15, cnt, { blur: T < K.n + .5 && T > A.imagine + .3 ? 1.5 : 0 }));
      head(ctx, '10,000×', 540, 690, 120, p(T, K.n, .45, eback), '#fff', '255,214,150');
      fine(ctx, 'A thought experiment, not a test result', 60, 1860, 1);
    });
  }

  // 8 SO HOW DO 10 LAYERS MOVE WITHOUT COMING APART?
  { const K = { layers: c('layers', A.sohow), move: c('move', A.sohow), apart: c('apart', A.sohow) };
    sfx.push({ t: K.move, k: 'swoosh', g: -18 });
    add(A.sohow, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1480 });
      const b = kf(T, [[K.move - .2, 0], [K.move + .7, 1.7]]), pe = p(T, K.apart, .5, eio) * (1 - p(T, K.apart + .9, .6, eio));
      const C = makeCurve(vBend(b, 100), -520, 520, 540, 1200);
      live(ctx, T, 540, 1150, { yaw: .02, bob: 5, breathe: .004, seed: 10 }, () => stack2d(ctx, T, C, { n: 10, gap: 15, ca: -360, cb: 360, slide: 0, peel: pe * 2.5, depth: [70, -52], glue: 1 - pe }));
      const e = C.at(-360);
      ctx.save(); ctx.globalAlpha = p(T, K.layers, .4); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; const bx = e[0] - 34, by = e[1];
      ctx.beginPath(); ctx.moveTo(bx + 12, by - 70); ctx.lineTo(bx, by - 70); ctx.lineTo(bx, by + 70); ctx.lineTo(bx + 12, by + 70); ctx.stroke(); ctx.restore();
      bigNum(ctx, '10 LAYERS', 540, 820, 90, p(T, K.layers, .4) * (1 - p(T, K.move, .3)));
      head(ctx, '?', 540, 760, 200, p(T, K.apart + .1, .5, eback), '#fff');
      fine(ctx, 'Illustrative, not to scale', 60, 1860, 1);
    });
  }

  // 9 CUSTOM ADHESIVE holds every layer, yet lets each one shift a microscopic amount
  { const K = { adh: c('adhesive', A.uses), holds: c('holds', A.uses), tog: c('together', A.uses), yet: c('yet lets', A.uses), shift: c('shift', A.uses), micro: c('microscopic', A.uses), closes: c('closes', A.uses) };
    const mac = Math.min(K.holds, K.tog) - .15;
    sfx.push({ t: K.adh, k: 'shimmer', g: -17 }, { t: mac, k: 'sweep', g: -18 }, { t: Math.max(K.micro, mac + 1.6), k: 'gear', g: -18 });
    add(A.uses, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1500, warm: .6, tint: '200,190,120' });
      const m = p(T, mac, .6, eio);
      if (m < 1) { // part 1: glowing stack, adhesive highlighted
        ctx.save(); ctx.globalAlpha = 1 - m; focus(ctx, 1 + 2.5 * m, 540, 1150, 540, 1150);
        const C = makeCurve(vBend(.06 * Math.sin(T), 100), -520, 520, 540, 1150);
        live(ctx, T, 540, 1150, { yaw: .02, bob: 4, breathe: .004, seed: 11 }, () => stack2d(ctx, T, C, { n: 6, gap: 26, fill: .66, ca: -360, cb: 360, slide: 0, depth: [90, -64], glue: .4 + .6 * p(T, K.adh, .5) }));
        ctx.restore();
        tag(ctx, 'CUSTOM ADHESIVE', 540, 800, p(T, K.adh, .4) * (1 - m), 640, 1150, { rgb: LIME });
      }
      if (m > 0) { // part 2: macro - polymer strands between two layers, top layer shifts
        ctx.save(); ctx.globalAlpha = m;
        const sh = 70 * p(T, K.shift - .1, .9, eio) * (1 - .15 * Math.sin(T * 2) * p(T, K.shift + .9, .3)) + 6 * Math.sin(T * 1.3);
        const y0 = 1010, y1 = 1330;
        slab(ctx, -60 + sh, 1140 + sh, y0 - 120, 120, { depth: 30 });
        strands(ctx, T, 30, 1050, y0, y1, { shift: sh, n: 16 });
        slab(ctx, -60, 1140, y1, 150, { depth: 0 });
        ctx.restore();
        tag(ctx, 'HOLDS', 220, 760, p(T, K.holds, .4) * m * (1 - p(T, K.yet, .3)), 300, 1100, { rgb: LIME });
        // ruler measuring the shift
        const ra = p(T, K.shift, .4) * m;
        if (ra > 0) { ctx.save(); ctx.globalAlpha = ra; ctx.strokeStyle = '#e8ecf2'; ctx.lineWidth = 2; const rx = 340, ry = 700;
          ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + 400, ry); ctx.stroke();
          for (let i = 0; i <= 20; i++) { ctx.beginPath(); ctx.moveTo(rx + i * 20, ry); ctx.lineTo(rx + i * 20, ry - (i % 5 ? 12 : 24)); ctx.stroke(); }
          const sh2 = 70 * p(T, K.shift - .1, .9, eio); ctx.strokeStyle = `rgb(${LIME})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(rx + 100, ry + 14); ctx.lineTo(rx + 100, ry + 120); ctx.moveTo(rx + 100 + sh2 * 2, ry + 14); ctx.lineTo(rx + 100 + sh2 * 2, ry + 120); ctx.stroke();
          ctx.restore(); }
        tag(ctx, 'SHIFT', 300, 900, p(T, K.shift + .1, .4) * m, undefined, undefined, { rgb: LIME });
        tag(ctx, 'MICROSCOPIC', 760, 900, p(T, K.micro, .4) * m, undefined, undefined, { rgb: LIME });
        // mini phone closing (bottom right)
        const cl = p(T, K.closes - .2, .7, eio), ca = p(T, Math.min(K.closes - .6, K.micro + .3), .4);
        if (ca > 0) live(ctx, T, 860, 1660, { yaw: .03, bob: 4, seed: 12 }, () => phone3d(ctx, T, { x: 860, y: 1660, s: .36, yaw: .5, pitch: .3, open: 1 - .92 * cl, color: 'gold', a: ca, inner: (c2, w, h) => homeScreen(c2, T, w, h, { glow: 1 }) }));
      }
      fine(ctx, 'Illustrative, not to scale', 60, 1860, 1);
    });
  }

  // 10 LIKE BENDING A STACK OF PAPER: sheets slip, relieve the stress, none has to stretch (solid vs sliding)
  { const K = { paper: c('paper', A.paper), sheets: c('sheets', A.paper), slip: c('slip', A.paper), rel: c('relieve', A.paper), none: c('none', A.paper), str: c('stretch', A.paper) };
    const cmp = Math.min(K.rel, K.none) + .1;
    sfx.push({ t: K.slip, k: 'swoosh', g: -17 }, { t: cmp, k: 'sweep', g: -18 }, { t: K.str + .1, k: 'success', g: -15 });
    add(A.paper, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1520, spot: 1.2 });
      const sp = p(T, cmp, .7, eio), b = kf(T, [[A.paper + .2, 0], [K.sheets, 1.4], [K.slip + .4, 2.3]]);
      // main paper stack (slides to the right half when the comparison comes in)
      const x = lerp(540, 760, sp), sc = lerp(1, .55, sp);
      ctx.save(); focus(ctx, sc, x, 1230, x, 1230);
      rig(ctx, T, x, 1150, 900, 1, b);
      const C = makeCurve(vBend(b, 80), -540, 540, x, 1260);
      live(ctx, T, x, 1220, { yaw: .015, bob: 3, breathe: .003, seed: 13 }, () => { stack2d(ctx, T, C, { n: 9, gap: 12, fill: .86, ca: -320, cb: 320, slide: p(T, K.slip - .3, .7), depth: [60, -46], glue: .5, glueRGB: '160,220,255', colA: '#f6f5ef', colB: '#e9e6dc' });
        const e1 = C.at(-320 - 40), e2 = C.at(320 + 40); clamp3d(ctx, e1[0] - 10, e1[1], e1[2], .9); clamp3d(ctx, e2[0] + 10, e2[1], e2[2] + Math.PI, .9); });
      ctx.restore();
      const sl = p(T, K.slip, .4) * (1 - sp); const eL = C.at(-380), eR = C.at(380);
      arrow(ctx, eL[0] - 20, eL[1] - 120, eL[0] + 20, eL[1] - 50, sl, ICE); arrow(ctx, eR[0] + 20, eR[1] - 120, eR[0] - 20, eR[1] - 50, sl, ICE);
      tag(ctx, 'STACK OF PAPER', 540, 680, p(T, K.paper, .4) * (1 - p(T, K.slip - .1, .3)));
      tag(ctx, 'SHEETS SLIP', 540, 680, p(T, K.slip, .4) * (1 - sp), undefined, undefined, { rgb: ICE });
      if (sp > 0) { // left: solid sheet (stressed), right: sliding sheets (fine)
        ctx.save(); ctx.globalAlpha = sp; focus(ctx, .55, 320, 1230, 320, 1230);
        rig(ctx, T, 320, 1150, 900, 1, 2.3);
        const C2 = makeCurve(vBend(2.3, 80), -540, 540, 320, 1260);
        stack2d(ctx, T, C2, { n: 9, gap: 12, fill: .98, ca: -320, cb: 320, slide: 0, depth: [60, -46], glue: 0, strain: 1, gridN: 5, glow: .5 });
        ctx.restore();
        tag(ctx, 'FUSED', 320, 920, sp, undefined, undefined, { rgb: STRESS }); tag(ctx, 'SLIDING', 760, 920, sp, undefined, undefined, { rgb: ICE });
        xmark(ctx, 320, 1560, 40, p(T, K.str, .4)); check(ctx, 760, 1560, 40, p(T, K.str + .15, .4));
        tag(ctx, 'NO STRETCH', 760, 1680, p(T, K.str + .2, .4), undefined, undefined, { rgb: '90,220,140' });
      }
      fine(ctx, 'Illustrative, not to scale', 60, 1860, 1);
    });
  }

  // 11 THE HINGE: over 100 parts (x-ray along the spine)
  { const K = { hinge: c('hinge', A.hinge), n: c('100', A.hinge), parts: c('parts', A.hinge) };
    sfx.push({ t: K.hinge + .1, k: 'gear', g: -15 });
    add(A.hinge, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1520 });
      const xr = p(T, K.hinge, .6), ex = p(T, K.parts - .1, .8, eback);
      floorShadow(ctx, 540, 1560, 520, .6);
      const P = live(ctx, T, 540, 1200, { yaw: .02, bob: 5, breathe: .004, seed: 14 }, () => phone3d(ctx, T, { x: 540, y: 1220, s: 1.15, yaw: Math.PI + .55 + .08 * Math.sin(T * .5), pitch: .22, open: .62, color: 'navy', spineGlow: xr }));
      // spine parts
      const { h, t } = PH, N = 26;
      ctx.save(); ctx.globalAlpha = xr;
      for (let i = 0; i < N; i++) {
        const yy = -h / 2 + 30 + (h - 60) * i / (N - 1), q = P(0, yy, -t / 2), d = ex * (40 + 60 * hash(i, 4)) * (i % 2 ? 1 : -1);
        const x = q[0] + d, y = q[1] + ex * (hash(i, 6) - .5) * 30, gold = i % 4 === 0, gear = i % 5 === 2;
        ctx.save(); ctx.translate(x, y); ctx.rotate(T * (gear ? 1.2 : 0) + i);
        if (gear) { ctx.fillStyle = '#d3d8e0'; ctx.beginPath(); for (let k = 0; k < 16; k++) { const an = k / 16 * 6.283, r = k % 2 ? 13 : 18; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.closePath(); ctx.fill(); }
        else { const g = ctx.createLinearGradient(-20, 0, 20, 0); g.addColorStop(0, gold ? '#a8802f' : '#6f7682'); g.addColorStop(.5, gold ? '#f5d58a' : '#e6e9ee'); g.addColorStop(1, gold ? '#a8802f' : '#6f7682'); ctx.fillStyle = g; rr(ctx, -20, -6, 40, 12, 4); ctx.fill(); }
        ctx.restore();
      }
      ctx.restore();
      const cnt = Math.round(100 * p(T, K.n - .5, .8, eo));
      bigNum(ctx, cnt >= 100 ? '100+' : String(cnt), 540, 700, 150, p(T, K.n - .5, .3));
      tag(ctx, 'PARTS IN THE HINGE', 540, 790, p(T, K.parts, .4));
      fine(ctx, 'Illustrative', 60, 1860, 1);
    });
  }

  // 11b CURLS THE SCREEN INTO A TEARDROP, so it never kinks
  { const K = { tear: c('teardrop', A.curls), kinks: c('kinks', A.curls) };
    sfx.push({ t: K.tear, k: 'shimmer', g: -17 }, { t: K.kinks + .2, k: 'success', g: -16 });
    add(A.curls, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1560, tint: '150,170,200' });
      const k = p(T, A.curls + .1, 1.2, eio), TD = teardrop(.3, 120, 700, 170);
      const C = makeCurve(s => lerp(0, TD(s), k), -820, 820, 540, 1560 - 120 * (1 - k));
      ctx.save(); focus(ctx, .78, 540, 1250, 540, 1250);
      hingeHousing(ctx, T, 540, 1375, .72, { a: k });
      live(ctx, T, 540, 1300, { yaw: .01, bob: 3, breathe: .003, seed: 15 }, () => stack2d(ctx, T, C, { n: 8, gap: 10, fill: .8, ca: -760, cb: 760, slide: 1, depth: [0, 0], skin: 0, glue: .9 }));
      ctx.restore();
      // ghost kink (what it avoids)
      const kg = p(T, K.kinks - .25, .3) * (1 - p(T, K.kinks + .9, .4));
      if (kg > 0) { ctx.save(); ctx.globalAlpha = kg; ctx.strokeStyle = `rgb(${STRESS})`; ctx.lineWidth = 8; ctx.lineJoin = 'miter'; ctx.setLineDash([16, 12]);
        ctx.beginPath(); ctx.moveTo(500, 760); ctx.lineTo(530, 1500); ctx.lineTo(580, 760); ctx.stroke(); ctx.restore(); xmark(ctx, 640, 1500, 36, kg); }
      tag(ctx, 'TEARDROP', 840, 1300, p(T, K.tear, .4), 680, 1440, { rgb: LIME });
      check(ctx, 860, 1560, 40, p(T, K.kinks + .3, .5));
      tag(ctx, 'NO KINK', 860, 1690, p(T, K.kinks + .4, .4), undefined, undefined, { rgb: '90,220,140' });
      fine(ctx, 'Cross-section, illustrative', 60, 1860, 1);
    });
  }

  // 12 IS THE CREASE GONE? (macro of the screen surface)
  { const K = { gone: c('gone', A.crease) };
    add(A.crease, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1500, spot: .6 });
      const z = kf(T, [[A.crease, 1], [A.no + .3, 1.15]]);
      ctx.save(); focus(ctx, z, 540, 1250, 540, 1250);
      phone3d(ctx, T, { x: 600, y: 1400, s: 2.6, yaw: .55 + .04 * Math.sin(T * .6), pitch: -1.15, open: .97, color: 'black',
        inner: (c2, w, h) => { const g = c2.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#0a0b0e'); g.addColorStop(.5, '#2a2d34'); g.addColorStop(.62, '#0b0c0f'); g.addColorStop(1, '#16181d'); c2.fillStyle = g; c2.fillRect(0, 0, w, h);
          const hl = (T * 60) % (w * 1.5) - w * .25; const s2 = c2.createLinearGradient(hl - 120, 0, hl + 120, 0); s2.addColorStop(0, 'rgba(255,255,255,0)'); s2.addColorStop(.5, 'rgba(255,255,255,.12)'); s2.addColorStop(1, 'rgba(255,255,255,0)'); c2.fillStyle = s2; c2.fillRect(0, 0, w, h);
          const gg = c2.createLinearGradient(w / 2 - 10, 0, w / 2 + 10, 0); gg.addColorStop(0, 'rgba(0,0,0,0)'); gg.addColorStop(.4, 'rgba(0,0,0,.8)'); gg.addColorStop(.6, 'rgba(255,255,255,.5)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); c2.fillStyle = gg; c2.fillRect(w / 2 - 10, 0, 20, h); } });
      ctx.restore();
      tag(ctx, 'CREASE', 330, 820, p(T, A.crease + .2, .4), 520, 1080);
      head(ctx, 'GONE?', 540, 700, 110, p(T, K.gone, .4, eback));
    });
  }

  // 12b NO - a matte finish of tiny bumps scatters light
  { const K = { matte: c('matte', A.no), bumps: c('bumps', A.no), sc: c('scatters', A.no) };
    sfx.push({ t: K.sc, k: 'shimmer', g: -17 });
    add(A.no, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1500, spot: .5 });
      const bz = p(T, K.bumps - .2, .8, eo);
      ctx.save(); focus(ctx, lerp(.85, 1.05, bz), 540, 1350, 540, 1350);
      bumps(ctx, T, { cx: 540, cy: 1300, scale: lerp(.6, 1, bz) });
      lightRays(ctx, T, 430, 1220, { a: p(T, K.sc - .3, .5), scatter: p(T, K.sc, .7, eio) });
      ctx.restore();
      pop(ctx, p(T, A.no + .05, .4, eback), 540, 640, () => pill(ctx, 540, 640, 'NO', { bg: `rgba(${STRESS},.95)`, size: 44, h: 88 }));
      tag(ctx, 'MATTE FINISH', 300, 780, p(T, K.matte, .4)); tag(ctx, 'TINY BUMPS', 780, 780, p(T, K.bumps, .4));
      tag(ctx, 'LIGHT SCATTERS', 540, 880, p(T, K.sc, .4), undefined, undefined, { rgb: ICE });
      fine(ctx, 'Magnified illustration', 60, 1860, 1);
    });
  }

  // 12c SO YOUR EYE BARELY CATCHES IT
  { const K = { eye: c('eye', A.eye), bar: c('barely', A.eye), cat: c('catches', A.eye) };
    add(A.eye, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1520 });
      const fade = p(T, K.bar - .1, 1.0, eio);
      floorShadow(ctx, 540, 1560, 560, .6);
      live(ctx, T, 540, 1300, { yaw: .02, bob: 5, breathe: .004, seed: 16 }, () => phone3d(ctx, T, { x: 540, y: 1360, s: 1.2, yaw: .35, pitch: -.9, open: 1, color: 'black', inner: (c2, w, h) => homeScreen(c2, T, w, h, { crease: 1 - .85 * fade }) }));
      live(ctx, T, 540, 760, { yaw: .1, bob: 8, seed: 17 }, () => eye(ctx, T, 540, 760, 1.2, p(T, A.eye, .4, eback), .5 * fade));
      tag(ctx, 'BARELY VISIBLE', 540, 950, p(T, K.bar, .4), 560, 1250);
    });
  }

  // 13 HOW MANY FOLDS? Apple hasn't published a number yet
  { const K = { many: c('many', A.many), pub: c('published', A.many), num: c('number', A.many) };
    const st = Math.min(K.pub, K.num) + .1;
    sfx.push({ t: st, k: 'shutter', g: -13 });
    add(A.many, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1450, warm: .8 });
      const ph = (T - A.many) * 1.4, open = .25 + .25 * Math.sin(ph * Math.PI);
      floorShadow(ctx, 540, 1360, 440, .6);
      live(ctx, T, 540, 1080, { yaw: .03, bob: 5, breathe: .004, seed: 18 }, () => phone3d(ctx, T, { x: 540, y: 1100, s: 1.0, yaw: Math.PI + .7, pitch: .3, open, color: 'gold' }));
      // reels spin blurred: nobody knows the number
      const spin = (T - A.many) * 9, reels = [0, 1, 2, 3, 4].map(i => spin * (1 + i * .23) + i * 3);
      live(ctx, T, 540, 1620, { yaw: .04, bob: 4, seed: 19 }, () => odometer(ctx, T, 540, 1620, 1.1, reels, { blur: 2.2, strip: '0123456789' }));
      const sp = p(T, st, .35, eback);
      pop(ctx, sp, 540, 1620, () => { ctx.save(); ctx.translate(540, 1620); ctx.rotate(-.08); rr(ctx, -300, -58, 600, 116, 18); ctx.fillStyle = 'rgba(20,21,26,.9)'; ctx.fill(); ctx.strokeStyle = `rgb(${STRESS})`; ctx.lineWidth = 6; ctx.stroke();
        txt(ctx, 'NOT PUBLISHED YET', 0, 18, 50, `rgb(${STRESS})`, 900, 'center', MONO); ctx.restore(); }, -.4);
      head(ctx, 'HOW MANY FOLDS?', 540, 700, 80, p(T, K.many, .4, eback));
    });
  }

  // 14 NOT BY BEING TOUGH - by sliding inside itself
  { const K = { surv: c('survive', A.tough), tough: c('tough', A.tough), lit: c('literally', A.tough), sl: c('sliding', A.tough), it: c('itself', A.tough) };
    const sw = Math.min(K.lit, K.sl) - .2;
    sfx.push({ t: K.tough, k: 'glitch', g: -17 }, { t: sw, k: 'sweep', g: -17 });
    add(A.tough, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1520 });
      const m = p(T, sw, .6, eio);
      if (m < 1) { ctx.save(); ctx.globalAlpha = 1 - m;
        floorShadow(ctx, 540, 1540, 460, .6);
        live(ctx, T, 540, 1200, { yaw: .02, bob: 5, seed: 20 }, () => phone3d(ctx, T, { x: 540, y: 1220, s: 1.15, yaw: -.5 + .1 * Math.sin(T * .6), pitch: .2, open: 0, color: 'navy' }));
        // armour plate that cracks: "tough" is crossed out
        const tg = p(T, K.tough - .2, .4, eback);
        pop(ctx, tg, 540, 680, () => pill(ctx, 540, 680, '🛡  TOUGH', { bg: 'rgba(30,32,38,.95)', size: 40, h: 84, stroke: 'rgba(255,255,255,.3)' }));
        xmark(ctx, 700, 640, 34, p(T, K.tough + .2, .4));
        ctx.restore(); }
      if (m > 0) { ctx.save(); ctx.globalAlpha = m;
        const TD = teardrop(.3, 120, 700, 170), k = .55 + .45 * (.5 + .5 * Math.sin((T - sw) * 2.2 - Math.PI / 2));
        const C = makeCurve(s => lerp(0, TD(s), k), -820, 820, 540, 1580 - 120 * (1 - k));
        ctx.save(); focus(ctx, .78, 540, 1250, 540, 1250); hingeHousing(ctx, T, 540, 1375, .72, { a: k });
        stack2d(ctx, T, C, { n: 8, gap: 10, fill: .8, ca: -760, cb: 760, slide: 1, depth: [0, 0], skin: 0, glue: 1 }); ctx.restore();
        tag(ctx, 'SLIDING INSIDE ITSELF', 540, 680, p(T, sw + .3, .4), undefined, undefined, { rgb: LIME });
        ctx.restore(); }
      fine(ctx, 'Illustrative, not to scale', 60, 1860, 1);
    });
  }

  // 15 WOULD YOU TRUST IT? (iOS-style poll card over the glowing Apple logo)
  { const K = { trust: c('trust', A.trust) };
    add(A.trust, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1500, spot: .8 });
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 540, 1000, 420, '255,255,255', .25); ctx.restore();
      live(ctx, T, 540, 1000, { yaw: .15, bob: 8, seed: 21 }, () => apple(ctx, 540, 1000, 300, '#ffffff', p(T, A.trust, .4)));
      const k = p(T, A.trust + .1, .5, eo5);
      flip(ctx, k, 540, 1500, () => live(ctx, T, 540, 1500, { yaw: .05, bob: 5, seed: 22 }, () => {
        iosCard(ctx, 150, 1350, 780, 300);
        txt(ctx, 'Would you trust it?', 540, 1430, 46, '#fff', 800);
        rr(ctx, 190, 1480, 330, 110, 26); ctx.fillStyle = 'rgba(48,192,96,.9)'; ctx.fill(); txt(ctx, 'Yes', 355, 1550, 40, '#fff', 800);
        rr(ctx, 560, 1480, 330, 110, 26); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fill(); txt(ctx, 'Not yet', 725, 1550, 40, '#fff', 800);
      }));
      clickRing(ctx, 355, 1535, (T - K.trust - .1) / .6, '48,192,96');
    });
  }

  // 16 ENDING: the phone's own display becomes the editor (each line on its own glued layer); it folds shut,
  // the fold counter rolls its reels into G-U-I-D-E, the cover screen posts the comment and shows the bio card.
  { const K = { crazy: c('crazy', A.crazy), code: c('code', A.crazy), learn: c('learn', A.crazy), comment: c('comment', A.crazy), guide: c('guide', A.crazy), yt: c('youtube', A.crazy), link: c('link', A.crazy), bio: c('bio', A.crazy) };
    const cta = Math.min(K.link, K.bio), bioT = Math.max(K.yt - .1, K.guide + 1.15), close0 = Math.min(K.learn, K.comment - .5), post = K.guide + .45, typeEnd = close0 - .15;
    sfx.push({ t: A.crazy + .05, k: 'riser', g: -18 }, { t: K.code + .1, k: 'success', g: -14 }, { t: close0 + .4, k: 'shutter', g: -15 }, { t: post, k: 'click', g: -11 }, { t: cta + .3, k: 'click', g: -10 });
    add(A.crazy, false, (ctx, T) => {
      bgStudio(ctx, T, { floor: 1560, tint: '150,165,200' });
      const open = kf(T, [[A.crazy, .2], [A.crazy + .6, 1], [close0, 1], [close0 + .7, 0]]);
      const yaw = kf(T, [[A.crazy, .4], [close0, .26], [close0 + .7, 0]]) + .05 * Math.sin(T * .7);
      const sc = kf(T, [[A.crazy, 1.18], [close0, 1.25], [close0 + .7, 1.42]]), py = kf(T, [[close0, 1120], [close0 + .7, 1060]]);
      const nChars = CODE_LEN * clamp((T - A.crazy - .3) / Math.max(.5, typeEnd - A.crazy - .3));
      const cover = (c2, w, h) => {
        lockScreen(c2, T, w, h);
        const pf = p(T, bioT, .5, eio);
        if (pf < 1) { c2.save(); c2.globalAlpha *= 1 - pf; // comment box
          rr(c2, 14, 200, w - 28, 210, 28); c2.fillStyle = 'rgba(40,44,56,.94)'; c2.fill(); c2.strokeStyle = 'rgba(255,255,255,.12)'; c2.lineWidth = 2; c2.stroke();
          txt(c2, 'Comments', 36, 238, 20, 'rgba(255,255,255,.7)', 700, 'left');
          rr(c2, 30, 256, w - 60, 60, 30); c2.fillStyle = '#12141a'; c2.fill(); c2.strokeStyle = 'rgba(255,255,255,.2)'; c2.lineWidth = 2; c2.stroke();
          const g2 = typed('guide', T, K.guide - .2, K.guide + .2); txt(c2, g2 || 'Add a comment…', 50, 295, 24, g2 ? '#fff' : '#7a8290', g2 ? 800 : 500, 'left');
          if (T < post && T > K.comment - .3 && Math.sin(T * 9) > 0) { c2.fillStyle = '#fff'; c2.fillRect(52 + tw(c2, g2 || '', 24, 800), 271, 3, 30); }
          const ps = p(T, post, .4, eback); if (ps > 0) pop(c2, ps, w / 2, 365, () => pill(c2, w / 2, 365, 'guide  ✓ posted', { bg: GREEN, size: 22, h: 46 }));
          c2.restore(); }
        if (pf > 0) { c2.save(); c2.globalAlpha *= pf; // bio card
          rr(c2, 14, 190, w - 28, 240, 28); c2.fillStyle = 'rgba(30,33,44,.95)'; c2.fill(); c2.strokeStyle = 'rgba(255,255,255,.14)'; c2.lineWidth = 2; c2.stroke();
          avatar(c2, T, w / 2, named ? 250 : 262, 40, named);
          if (named) txt(c2, 'agentsoly', w / 2, 330, 30, '#fff', 800);
          const hl = p(T, cta + .3, .35), by = named ? 352 : 330;
          rr(c2, 34, by, w - 68, 60, 30); c2.fillStyle = `rgba(47,123,255,${.55 + .45 * hl})`; c2.fill();
          txt(c2, '🔗 Link in bio', w / 2, by + 39, 24, '#fff', 800);
          c2.restore(); }
      };
      floorShadow(ctx, 540, 1500, 560 * sc, .6);
      live(ctx, T, 540, py, { yaw: .02, bob: 5, breathe: .004, seed: 23 }, () => phone3d(ctx, T, { x: 540, y: py, s: sc, yaw, pitch: .08, open, color: 'navy',
        inner: (c2, w, h) => editor(c2, T, w, h, nChars, T < typeEnd + .3), cover }));
      // the fold counter: reels roll from digits into the letters G U I D E
      const gk = p(T, K.guide - .3, .9, eio), word = 'GUIDE';
      const reels = [0, 1, 2, 3, 4].map(i => lerp(i === 4 ? 3 : 0, 10, clamp(gk * 1.6 - i * .15)));
      const ov = p(T, close0 + .3, .5);
      ctx.save(); ctx.globalAlpha = ov; live(ctx, T, 540, 1730, { yaw: .04, bob: 4, seed: 24 }, () => {
        odometer(ctx, T, 540, 1730, .95, reels.map(() => 0), { strip: ' ', label: gk > .5 ? 'COMMENT' : 'FOLDS' });
        ctx.save(); ctx.translate(540, 1730); ctx.scale(.95, .95); const rw = 62, gapx = 10, Wd = 5 * rw + 4 * gapx + 56;
        reels.forEach((pos, i) => { // per-reel strip: the ten digits, then that reel's letter
          const rx = -Wd / 2 + 28 + i * (rw + gapx), ry = -46, strip = '0123456789' + word[i], L = strip.length, f = clamp(pos, 0, L - 1), i0 = Math.floor(f), u = f - i0;
          ctx.save(); rr(ctx, rx, ry, rw, 92, 8); ctx.clip();
          for (const [k, dy] of [[i0, -u * 92], [Math.min(L - 1, i0 + 1), (1 - u) * 92]]) txt(ctx, strip[k], rx + rw / 2, ry + 46 + 24 + dy, 66, k === 10 ? '#1d4fd8' : '#16171b', 800, 'center', MONO);
          const sh = ctx.createLinearGradient(0, ry, 0, ry + 92); sh.addColorStop(0, 'rgba(0,0,0,.4)'); sh.addColorStop(.25, 'rgba(0,0,0,0)'); sh.addColorStop(.75, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.4)'); ctx.fillStyle = sh; ctx.fillRect(rx, ry, rw, 92);
          ctx.restore();
        });
        ctx.restore();
      }); ctx.restore();
      // 100% CODE chip
      const st = p(T, K.code, .45, eback) * (1 - p(T, close0, .3));
      pop(ctx, st, 540, 660, () => pill(ctx, 540, 660, '💻  100% CODE', { bg: 'rgba(20,150,80,.95)', size: 44, h: 96 }), -.3);
      // tap on the bio button (cover screen) - cursor-free: a ripple from the button position
      const bx = 540, byy = py + ((named ? 352 : 330) + 42 - 235) * sc;
      clickRing(ctx, bx, byy, (T - cta - .3) / .6, '90,150,255');
    });
  }

  list.forEach((sc, i) => sc.end = list[i + 1] ? list[i + 1].start : 1e9);
  // user rule: small UI hits (everything but whoosh/swoosh/sweep/riser) only as single hits at least 1.5 s apart
  const SWEEPS = new Set(['whoosh', 'swoosh', 'sweep', 'riser']); let last = -9;
  const out = sfx.sort((x, y) => x.t - y.t).filter(q => { if (SWEEPS.has(q.k)) return true; if (q.t - last < 1.5) return false; last = q.t; return true; });
  return { scenes: list, sfx: out };
}
