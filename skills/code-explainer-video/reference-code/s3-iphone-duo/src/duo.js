// Drawing kit for the "iPhone Duo foldable screen" explainer. Pure functions of their inputs + time T (deterministic).
// - phone3d(): a book-style foldable iPhone in orthographic 3D (two rounded slabs on a hinge, extruded by slices,
//   faces texture-mapped with affine transforms: inner display, cover display, titanium back with cameras + Apple logo).
// - makeCurve()/stack2d(): a stack of ultra-thin layers along any bent centre line (tangent-angle profile), with
//   per-layer slide (ends stagger like a deck of cards) or solid (ends aligned, strain-coloured), glue lines and skins.
// - odometer(), bumps, strands, teardrop hinge housing, iOS cards.
import { W, H, clamp, lerp, eo, eio, eback, hash, rr } from './lib.js';
import { IMG } from './assets.js';
import { FONT, MONO, txt, glowDot } from './kit.js';

export const LIME = '222,238,104', LIME_HEX = '#dfee68', STRESS = '255,84,72', ICE = '150,200,255';
export const sm = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export const sig = (x, w = 1) => 1 / (1 + Math.exp(-x / w));

// ---------------- backgrounds ----------------
export function bgStudio(ctx, T, { floor = 1380, tint = '120,140,175', spot = 1, warm = 0, dust = 50 } = {}) {
  let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1b1c21'); g.addColorStop(.55, '#141519'); g.addColorStop(1, '#0a0b0d');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  if (spot > 0) { // soft floor pool of light (ellipse)
    ctx.save(); ctx.translate(W / 2, floor); ctx.scale(1, .32);
    const col = warm > 0 ? `${Math.round(lerp(+tint.split(',')[0], 255, warm))},${Math.round(lerp(+tint.split(',')[1], 214, warm))},${Math.round(lerp(+tint.split(',')[2], 160, warm))}` : tint;
    const r = 760 + 30 * Math.sin(T * .7);
    g = ctx.createRadialGradient(0, 0, 10, 0, 0, r); g.addColorStop(0, `rgba(${col},${.30 * spot})`); g.addColorStop(.5, `rgba(${col},${.10 * spot})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.fillRect(-r, -r, 2 * r, 2 * r); ctx.restore();
    g = ctx.createRadialGradient(W / 2, floor - 700, 20, W / 2, floor - 700, 900); g.addColorStop(0, `rgba(${tint},${.07 * spot})`); g.addColorStop(1, `rgba(${tint},0)`);
    ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  }
  ctx.fillStyle = '#fff';
  for (let i = 0; i < dust; i++) {
    const x = ((hash(i, 7) * W + T * 10 * (hash(i, 2) - .5)) % W + W) % W, y = ((hash(i, 8) * H - T * 8 * hash(i, 3)) % H + H) % H;
    ctx.globalAlpha = (.05 + .18 * hash(i, 4)) * (.6 + .4 * Math.sin(T * 1.7 + i)); ctx.beginPath(); ctx.arc(x, y, .8 + 1.4 * hash(i, 5), 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
  g = ctx.createRadialGradient(W / 2, H * .55, H * .32, W / 2, H * .55, H * .85); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
}
export function floorShadow(ctx, x, y, w, a = .6, h = .16) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, h); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w);
  g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-w, -w, 2 * w, 2 * w); ctx.restore();
}
// small grey italic-ish disclaimer
export function fine(ctx, s, x, y, a = 1, align = 'left') { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a * .5; txt(ctx, s, x, y, 19, '#c9ced8', 500, align); ctx.restore(); }
// spaced-caps tag with a leader line to (lx, ly)
export function tag(ctx, s, x, y, a = 1, lx, ly, { rgb = '255,255,255', size = 26, align = 'center' } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a);
  ctx.font = MONO(700, size); ctx.letterSpacing = '3px'; const w = ctx.measureText(s).width;
  const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  rr(ctx, x0 - 14, y - size - 8, w + 28, size + 22, 8); ctx.fillStyle = 'rgba(12,13,16,.72)'; ctx.fill(); ctx.strokeStyle = `rgba(${rgb},.45)`; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = `rgb(${rgb})`; ctx.textAlign = 'left'; ctx.fillText(s, x0, y); ctx.letterSpacing = '0px';
  if (lx !== undefined) {
    const sx = clamp(lx, x0 - 14, x0 + w + 14), sy = ly > y ? y + 14 : y - size - 8, k = eo(clamp(a));
    ctx.strokeStyle = `rgba(${rgb},.8)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(lerp(sx, lx, k), lerp(sy, ly, k)); ctx.stroke();
    ctx.fillStyle = `rgb(${rgb})`; ctx.beginPath(); ctx.arc(lerp(sx, lx, k), lerp(sy, ly, k), 5, 0, 7); ctx.fill();
  }
  ctx.restore();
}
// big number / headline with soft glow
export function bigNum(ctx, s, x, y, size, a = 1, col = '#fff', glow = '255,255,255') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.shadowColor = `rgba(${glow},.45)`; ctx.shadowBlur = 30; txt(ctx, s, x, y, size, col, 900, 'center', MONO); ctx.restore();
}

// ---------------- Apple logo (user asset, tinted copies cached) ----------------
const tints = {};
export function apple(ctx, x, y, w, col = '#ffffff', a = 1) {
  const i = IMG.apple_white; if (!i || a <= 0) return;
  let c = tints[col]; if (!c) { c = tints[col] = new OffscreenCanvas(i.width, i.height); const x2 = c.getContext('2d'); x2.drawImage(i, 0, 0); x2.globalCompositeOperation = 'source-in'; x2.fillStyle = col; x2.fillRect(0, 0, i.width, i.height); }
  const h = w * i.height / i.width; ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(c, x - w / 2, y - h / 2, w, h); ctx.restore();
}

// ---------------- orthographic 3D ----------------
export function view({ x = W / 2, y = 1150, s = 1, yaw = 0, pitch = 0, roll = 0 }) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
  return (px, py, pz) => {
    let X = px * cy + pz * sy, Z = -px * sy + pz * cy, Y = py;           // yaw about Y
    let Y2 = Y * cp - Z * sp, Z2 = Y * sp + Z * cp;                         // pitch about X
    const X3 = X * cr - Y2 * sr, Y3 = X * sr + Y2 * cr;                    // roll about view axis
    return [x + s * X3, y - s * Y3, Z2];
  };
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
// draw fn(ctx) in face-local coords (0..w, 0..h) mapped onto the parallelogram p0 -> p1 (u) / p0 -> p3 (v)
export function onQuad(ctx, p0, p1, p3, w, h, fn) {
  const u = sub(p1, p0), v = sub(p3, p0);
  ctx.save(); ctx.transform(u[0] / w, u[1] / w, v[0] / h, v[1] / h, p0[0], p0[1]); fn(); ctx.restore();
}
const area2 = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

// rotate model point about the hinge (Y axis through x=0,z=0)
const rotY = (p, b) => [p[0] * Math.cos(b) + p[2] * Math.sin(b), p[1], -p[0] * Math.sin(b) + p[2] * Math.cos(b)];

export const PH = { w: 330, h: 470, t: 14, r: 46 };
const COL = {
  navy: { edge: ['#1d2638', '#5b6c8c', '#2a3550'], back: ['#2d3a55', '#1d2740', '#3b4a68'], logo: 'rgba(170,185,215,.55)' },
  gold: { edge: ['#7d6750', '#efdcc2', '#9a8166'], back: ['#d8c3a6', '#b89f82', '#e7d6bd'], logo: 'rgba(120,98,74,.55)' },
  black: { edge: ['#16171a', '#6a6e78', '#24262b'], back: ['#2a2c31', '#1b1c20', '#3a3d44'], logo: 'rgba(140,145,155,.5)' },
  silver: { edge: ['#7c818b', '#f2f4f7', '#9ba0aa'], back: ['#e9ebee', '#c9ccd2', '#f6f7f9'], logo: 'rgba(120,124,132,.6)' },
};
// iOS-ish wallpaper + icons for the inner display (one canvas across both halves: width 2w)
export function homeScreen(ctx, T, w, h, { glow = 0, crease = 0, dim = 0 } = {}) {
  let g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#0b1a3d'); g.addColorStop(.45, '#1d2f7a'); g.addColorStop(.75, '#5a2d8c'); g.addColorStop(1, '#0d0f24');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) { const cx = w * (.25 + .3 * i) + 40 * Math.sin(T * .5 + i * 2), cy = h * (.35 + .2 * Math.sin(T * .4 + i)); glowDot(ctx, cx, cy, 260, ['70,120,255', '170,80,255', '40,200,255'][i], .55); }
  ctx.restore();
  txt(ctx, '9:41', w * .25, 120, 74, 'rgba(255,255,255,.92)', 300);
  const cols = ['#34c759', '#0a84ff', '#ff9f0a', '#ff375f', '#5e5ce6', '#64d2ff', '#ffd60a', '#bf5af2'];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
    const x = w * .08 + c * (w * .84 / 6) + 8, y = 200 + r * 120, k = (r * 6 + c);
    rr(ctx, x, y, 74, 74, 18); const gg = ctx.createLinearGradient(x, y, x, y + 74); gg.addColorStop(0, cols[k % 8]); gg.addColorStop(1, cols[(k + 3) % 8]); ctx.fillStyle = gg; ctx.globalAlpha = .9; ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(x + 37, y + 37, 16, 0, 7); ctx.fill();
  }
  rr(ctx, w * .2, h - 130, w * .6, 96, 34); ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fill();
  if (dim > 0) { ctx.fillStyle = `rgba(0,0,0,${dim})`; ctx.fillRect(0, 0, w, h); }
  if (crease > 0) { // the crease line down the middle
    g = ctx.createLinearGradient(w / 2 - 14, 0, w / 2 + 14, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.45, `rgba(0,0,0,${.5 * crease})`); g.addColorStop(.55, `rgba(255,255,255,${.35 * crease})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(w / 2 - 14, 0, 28, h);
  }
  if (glow > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; g = ctx.createLinearGradient(w / 2 - 60, 0, w / 2 + 60, 0); g.addColorStop(0, `rgba(${LIME},0)`); g.addColorStop(.5, `rgba(${LIME},${.6 * glow})`); g.addColorStop(1, `rgba(${LIME},0)`); ctx.fillStyle = g; ctx.fillRect(w / 2 - 60, 0, 120, h); ctx.restore(); }
}
export function lockScreen(ctx, T, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#141a2e'); g.addColorStop(1, '#05060a'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, w * .5 + 30 * Math.sin(T * .6), h * .7, 260, '60,110,255', .5); ctx.restore();
  txt(ctx, 'Thursday 30 October', w / 2, 80, 20, 'rgba(255,255,255,.75)', 600);
  txt(ctx, '9:41', w / 2, 170, 92, 'rgba(255,255,255,.95)', 700);
}

// The foldable iPhone. open: 0 closed .. 1 flat. Returns a projector of model coords (hinge on the Y axis, x right, y up, z = screen normal of the right half).
export function phone3d(ctx, T, o = {}) {
  const { open = 0, color = 'navy', inner = null, cover = null, a = 1, shadow = 1, cam = true, spineGlow = 0, gloss = 1 } = o;
  const { w, h, t, r } = PH; const C = COL[color] || COL.navy;
  const P = view(o); const b = Math.PI * (1 - clamp(open));
  if (a <= 0) return P;
  ctx.save(); ctx.globalAlpha *= a;
  const halves = [
    { side: 'R', M: p => p, x0: 0 },
    { side: 'L', M: p => rotY(p, b), x0: -w },
  ];
  const corner = (hf, u, v, z) => P(...hf.M([hf.x0 + u, h / 2 - v, z]));   // face-local (u right, v down) -> screen
  halves.forEach(hf => { const c = hf.M([hf.x0 + w / 2, 0, -t / 2]); hf.depth = P(...c)[2]; });
  halves.sort((A, B) => A.depth - B.depth);
  // hinge spine (cylinder along y at x=0, z=-t/2)
  const s0 = P(0, h / 2 - r * .5, -t / 2), s1 = P(0, -h / 2 + r * .5, -t / 2), sw = Math.hypot(...sub(P(0, 0, 0), P(0, 0, -t))) + 6;
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = C.edge[0]; ctx.lineWidth = Math.max(4, sw); ctx.beginPath(); ctx.moveTo(...s0); ctx.lineTo(...s1); ctx.stroke();
  ctx.strokeStyle = C.edge[1]; ctx.globalAlpha *= .5; ctx.lineWidth = Math.max(1.5, sw * .25); ctx.stroke(); ctx.restore();
  if (spineGlow > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.strokeStyle = `rgba(${LIME},${.25 * spineGlow})`; ctx.lineWidth = 40; ctx.beginPath(); ctx.moveTo(...s0); ctx.lineTo(...s1); ctx.stroke(); ctx.restore(); }
  for (const hf of halves) {
    // which side faces the viewer? screen face normal = M([0,0,1]) direction
    const n0 = hf.M([0, 0, 0]), n1 = hf.M([0, 0, 1]), nz = P(...n1)[2] - P(...n0)[2];
    const screenUp = nz > 0, K = 9;
    const zs = []; for (let k = 0; k <= K; k++) zs.push(screenUp ? -t + t * k / K : -t * k / K);
    // extruded slab: rounded silhouettes from far to near
    for (let k = 0; k < K; k++) {
      const z = zs[k], p0 = corner(hf, 0, 0, z), p1 = corner(hf, w, 0, z), p3 = corner(hf, 0, h, z);
      onQuad(ctx, p0, p1, p3, w, h, () => {
        const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, C.edge[0]); g.addColorStop(.35 + .1 * Math.sin(T * .6), C.edge[1]); g.addColorStop(1, C.edge[2]);
        rr(ctx, 0, 0, w, h, r); ctx.fillStyle = g; ctx.fill();
        if (k === K - 1) { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.stroke(); }
      });
    }
    // near face
    if (screenUp) {
      const z = 0, p0 = corner(hf, 0, 0, z), p1 = corner(hf, w, 0, z), p3 = corner(hf, 0, h, z);
      onQuad(ctx, p0, p1, p3, w, h, () => {
        rr(ctx, 0, 0, w, h, r); ctx.fillStyle = '#050608'; ctx.fill();
        const bz = 12; ctx.save(); rr(ctx, bz, bz, w - 2 * bz, h - 2 * bz, r - bz); ctx.clip();
        if (inner) { ctx.translate(hf.side === 'L' ? bz : -w + bz, bz); inner(ctx, 2 * (w - bz), h - 2 * bz); } else { ctx.fillStyle = '#07080b'; ctx.fillRect(0, 0, w, h); }
        ctx.restore();
        if (gloss > 0) { const sp = ((T * .12 + (hf.side === 'L' ? 0 : .15)) % 1.4) - .2, g = ctx.createLinearGradient(0, 0, w, h);
          g.addColorStop(clamp(sp - .12), 'rgba(255,255,255,0)'); g.addColorStop(clamp(sp), `rgba(255,255,255,${.10 * gloss})`); g.addColorStop(clamp(sp + .12), 'rgba(255,255,255,0)');
          rr(ctx, 0, 0, w, h, r); ctx.fillStyle = g; ctx.fill(); }
      });
    } else {
      const z = -t;
      if (hf.side === 'R') { // titanium back with camera + logo (viewed from behind: u runs from x=w to x=0)
        const p0 = P(...hf.M([w, h / 2, z])), p1 = P(...hf.M([0, h / 2, z])), p3 = P(...hf.M([w, -h / 2, z]));
        onQuad(ctx, p0, p1, p3, w, h, () => backPanel(ctx, T, w, h, r, C, cam));
      } else { // cover display on the left half's back
        const p0 = P(...hf.M([0, h / 2, z])), p1 = P(...hf.M([-w, h / 2, z])), p3 = P(...hf.M([0, -h / 2, z]));
        onQuad(ctx, p0, p1, p3, w, h, () => {
          rr(ctx, 0, 0, w, h, r); ctx.fillStyle = '#050608'; ctx.fill();
          ctx.save(); rr(ctx, 12, 12, w - 24, h - 24, r - 12); ctx.clip(); ctx.translate(12, 12);
          if (cover) cover(ctx, w - 24, h - 24); else lockScreen(ctx, T, w - 24, h - 24);
          ctx.restore();
          rr(ctx, w / 2 - 34, 26, 68, 20, 10); ctx.fillStyle = '#000'; ctx.fill();
          const sp = ((T * .12) % 1.4) - .2, g = ctx.createLinearGradient(0, 0, w, h);
          g.addColorStop(clamp(sp - .12), 'rgba(255,255,255,0)'); g.addColorStop(clamp(sp), 'rgba(255,255,255,.10)'); g.addColorStop(clamp(sp + .12), 'rgba(255,255,255,0)');
          rr(ctx, 0, 0, w, h, r); ctx.fillStyle = g; ctx.fill();
        });
      }
    }
  }
  ctx.restore();
  return P;
}
function backPanel(ctx, T, w, h, r, C, cam) {
  const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, C.back[2]); g.addColorStop(.5, C.back[0]); g.addColorStop(1, C.back[1]);
  rr(ctx, 0, 0, w, h, r); ctx.fillStyle = g; ctx.fill();
  const sp = ((T * .1) % 1.6) - .3, s = ctx.createLinearGradient(0, 0, w, h);
  s.addColorStop(clamp(sp - .15), 'rgba(255,255,255,0)'); s.addColorStop(clamp(sp), 'rgba(255,255,255,.16)'); s.addColorStop(clamp(sp + .15), 'rgba(255,255,255,0)');
  ctx.fillStyle = s; ctx.fill();
  apple(ctx, w / 2, h * .56, w * .2, C.logo);
  if (cam) { // camera plateau, two lenses + flash
    const cx = w - 120, cy = 92; rr(ctx, cx - 92, cy - 64, 184, 128, 44);
    const pg = ctx.createLinearGradient(cx - 92, cy - 64, cx + 92, cy + 64); pg.addColorStop(0, C.back[2]); pg.addColorStop(1, C.back[1]); ctx.fillStyle = pg; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 2; ctx.stroke();
    [cx - 44, cx + 44].forEach((lx, i) => {
      ctx.fillStyle = '#0c0d10'; ctx.beginPath(); ctx.arc(lx, cy, 38, 0, 7); ctx.fill(); ctx.strokeStyle = C.edge[1]; ctx.lineWidth = 4; ctx.stroke();
      const lg = ctx.createRadialGradient(lx - 8, cy - 10, 2, lx, cy, 28); lg.addColorStop(0, '#5a6aa8'); lg.addColorStop(.35, '#1a1f3a'); lg.addColorStop(1, '#050608');
      ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(lx, cy, 27, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(lx - 9 + 2 * Math.sin(T + i), cy - 10, 5, 0, 7); ctx.fill();
    });
  }
}

// ---------------- bent layer stacks ----------------
// centre line from a tangent-angle profile th(s) (screen coords, y down), sampled on [s0, s1]; point at s = 0 sits on (x, y).
export function makeCurve(th, s0, s1, x = 0, y = 0, N = 260) {
  const S = [], X = [], Y = [], A = []; let px = 0, py = 0; const ds = (s1 - s0) / N;
  for (let i = 0; i <= N; i++) { const s = s0 + i * ds, a = th(s); S.push(s); A.push(a); X.push(px); Y.push(py); px += Math.cos(th(s + ds / 2)) * ds; py += Math.sin(th(s + ds / 2)) * ds; }
  const i0 = Math.round(-s0 / ds), ox = x - X[i0], oy = y - Y[i0];
  for (let i = 0; i <= N; i++) { X[i] += ox; Y[i] += oy; }
  const at = s => { const f = clamp((s - s0) / ds, 0, N - 1e-6), i = Math.floor(f), u = f - i; return [lerp(X[i], X[i + 1], u), lerp(Y[i], Y[i + 1], u), lerp(A[i], A[i + 1], u)]; };
  return { at, s0, s1 };
}
// stack of n layers along curve C. core = [ca, cb] arc range of the "phone screen". slide 0: solid (ends aligned along normals), 1: each layer keeps its length.
// offsets run along the left normal (-sin a, cos a) -> for a left-to-right curve that is "down".
export function stack2d(ctx, T, C, o = {}) {
  const { n = 10, gap = 14, fill = .74, ca = -300, cb = 300, slide = 1, depth = [70, -46], glue = 1, glueRGB = LIME, strain = 0, gridN = 0,
    a = 1, peel = 0, colA = '#eef1f5', colB = '#c3c9d3', skin = 1, glow = 0, cracks = 0 } = o;
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  const L = cb - ca, M = 90;
  const off = i => (i - (n - 1) / 2) * gap * (1 + peel * .9 * Math.abs(i - (n - 1) / 2) / n * 2);
  const pt = (s, d) => { const [x, y, an] = C.at(s); return [x - Math.sin(an) * d, y + Math.cos(an) * d, an]; };
  // per-layer arc range
  const range = d => {
    if (slide <= 0) return [ca, cb];
    // length of offset curve over [ca, cb] ~ L - d * (a(cb) - a(ca)); keep L by moving the ends symmetrically
    const da = C.at(cb)[2] - C.at(ca)[2], lo = L - d * da, ext = (L - lo) / 2 * slide; return [ca - ext, cb + ext];
  };
  const layers = []; for (let i = 0; i < n; i++) { const d = off(i), [sa, sb] = range(d); layers.push({ i, d, sa, sb }); }
  // skins (outer surfaces receding along `depth`), 2D backface-culled
  if (skin > 0) for (const ly of [layers[0], layers[n - 1]]) {
    const dd = ly.d + (ly === layers[0] ? -1 : 1) * gap * fill / 2;
    for (let k = 0; k < M; k++) {
      const s = lerp(ly.sa, ly.sb, k / M), s2 = lerp(ly.sa, ly.sb, (k + 1) / M), p0 = pt(s, dd), p1 = pt(s2, dd);
      const q = [p0, p1, [p1[0] + depth[0], p1[1] + depth[1]], [p0[0] + depth[0], p0[1] + depth[1]]];
      const ar = area2(q[0], q[1], q[2]) * (ly === layers[0] ? 1 : -1); if (ar >= 0) continue;
      const lit = .55 + .45 * Math.cos(p0[2] + .9); const c = Math.round(lerp(120, 236, clamp(lit)));
      ctx.fillStyle = `rgb(${c},${c + 3},${c + 8})`; ctx.beginPath(); q.forEach((v, j) => j ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1])); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke();
    }
  }
  // end caps of every layer (receding faces at both ends)
  for (const ly of layers) for (const s of [ly.sa, ly.sb]) {
    const p0 = pt(s, ly.d - gap * fill / 2), p1 = pt(s, ly.d + gap * fill / 2);
    ctx.fillStyle = '#9aa1ad'; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p1[0] + depth[0], p1[1] + depth[1]); ctx.lineTo(p0[0] + depth[0], p0[1] + depth[1]); ctx.closePath(); ctx.fill();
  }
  // front cross-section: each layer as a strip of quads (strain colour per segment)
  for (const ly of layers) {
    const d0 = ly.d - gap * fill / 2, d1 = ly.d + gap * fill / 2;
    for (let k = 0; k < M; k++) {
      const s = lerp(ly.sa, ly.sb, k / M), s2 = lerp(ly.sa, ly.sb, (k + 1) / M);
      const A0 = pt(s, d0), A1 = pt(s2, d0), B1 = pt(s2, d1), B0 = pt(s, d1);
      let col = (k + ly.i) % 2 ? colA : colB; col = ly.i % 2 ? colA : '#e2e6ec';
      if (strain > 0) { // curvature x offset -> tension (red, outside) / compression
        const kap = (C.at(s2)[2] - C.at(s)[2]) / Math.max(1e-6, s2 - s), e = clamp(Math.abs(kap * ly.d) * 9 * strain), hot = clamp(Math.abs(kap) * 60 * strain);
        const m = Math.max(e, hot * .8);
        col = `rgb(${Math.round(lerp(226, 255, m))},${Math.round(lerp(230, 96, m))},${Math.round(lerp(236, 84, m))})`;
      }
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(A0[0], A0[1]); ctx.lineTo(A1[0], A1[1]); ctx.lineTo(B1[0], B1[1]); ctx.lineTo(B0[0], B0[1]); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = .8; ctx.stroke();
      if (gridN > 0 && k % gridN === 0) { ctx.strokeStyle = 'rgba(60,64,72,.35)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(A0[0], A0[1]); ctx.lineTo(B0[0], B0[1]); ctx.stroke(); }
    }
  }
  // glue lines between layers (glowing)
  if (glue > 0 && n > 1) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (let i = 0; i < n - 1; i++) {
      const d = (layers[i].d + layers[i + 1].d) / 2, sa = Math.max(layers[i].sa, layers[i + 1].sa), sb = Math.min(layers[i].sb, layers[i + 1].sb);
      ctx.beginPath(); for (let k = 0; k <= M; k++) { const p = pt(lerp(sa, sb, k / M), d); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
      ctx.strokeStyle = `rgba(${glueRGB},${.18 * glue})`; ctx.lineWidth = gap * (1 - fill) + 8; ctx.stroke();
      ctx.strokeStyle = `rgba(${glueRGB},${.85 * glue})`; ctx.lineWidth = Math.max(1.5, gap * (1 - fill) * .8); ctx.stroke();
      // travelling sparkle along the glue
      const u = (T * .25 + hash(i, 3)) % 1, sp = pt(lerp(sa, sb, u), d); glowDot(ctx, sp[0], sp[1], 26, glueRGB, .8 * glue);
    }
    ctx.restore();
  }
  if (glow > 0) { const m = pt((ca + cb) / 2, 0); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, m[0], m[1], 260, STRESS, glow); ctx.restore(); }
  if (cracks > 0) { // jagged cracks from the outer skin at the middle
    ctx.save(); ctx.strokeStyle = `rgba(40,8,8,.9)`; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    for (let j = -2; j <= 2; j++) {
      const s = (ca + cb) / 2 + j * 26, dTop = off(0) - gap / 2; let d = dTop; let p = pt(s, d);
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); const len = n * gap * clamp(cracks * 1.3 - Math.abs(j) * .15) * .7;
      for (let k = 1; k <= 8 && (k / 8) * n * gap * .7 <= len + 1; k++) { d = dTop + (k / 8) * n * gap * .7; p = pt(s + (hash(k, j + 5) - .5) * 18, d); ctx.lineTo(p[0], p[1]); }
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}
// profiles
export const vBend = (ang, r = 80) => s => ang / 2 - ang * sig(s, r * .45);               // flat when ang=0, V/U when ang -> pi
export function teardrop(bulge = .5, w = 60, k = 70) { // down the left arm, round the bulb, up the right arm
  return s => Math.PI / 2 - (Math.PI + 2 * bulge) * sig(s, w) + bulge * sig(s + k, w * .6) + bulge * sig(s - k, w * .6);
}

// ---------------- odometer ----------------
// value: number (rolls like a car odometer) or array of reel positions; strip: symbols per reel
export function odometer(ctx, T, x, y, s, value, { digits = 5, label = 'FOLDS', strip = '0123456789', a = 1, blur = 0 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  const rw = 62, rh = 92, gapx = 10, Wd = digits * rw + (digits - 1) * gapx + 56, Hd = rh + 48;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
  rr(ctx, -Wd / 2, -Hd / 2, Wd, Hd, 26); const g = ctx.createLinearGradient(0, -Hd / 2, 0, Hd / 2); g.addColorStop(0, '#f1f2f4'); g.addColorStop(.5, '#b9bdc5'); g.addColorStop(1, '#7d828c'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
  rr(ctx, -Wd / 2, -Hd / 2, Wd, Hd, 26); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.stroke();
  rr(ctx, -Wd / 2 + 16, -Hd / 2 + 14, Wd - 32, Hd - 28, 16); ctx.fillStyle = '#1a1b1f'; ctx.fill();
  for (let i = 0; i < digits; i++) {
    const rx = -Wd / 2 + 28 + i * (rw + gapx), ry = -rh / 2;
    let pos; if (Array.isArray(value)) pos = value[i]; else { const pw = Math.pow(10, digits - 1 - i), v = Math.max(0, value); const base = Math.floor(v / pw), fr = v / pw - base; pos = base + Math.max(0, (fr * pw - (pw - 1))); }
    ctx.save(); rr(ctx, rx, ry, rw, rh, 8); ctx.clip();
    const rg = ctx.createLinearGradient(0, ry, 0, ry + rh); rg.addColorStop(0, '#9fa3ab'); rg.addColorStop(.3, '#ffffff'); rg.addColorStop(.7, '#ffffff'); rg.addColorStop(1, '#9fa3ab');
    ctx.fillStyle = rg; ctx.fillRect(rx, ry, rw, rh);
    const L = strip.length, f = ((pos % L) + L) % L, i0 = Math.floor(f), u = f - i0;
    for (const [k, dy] of [[i0, -u * rh], [(i0 + 1) % L, (1 - u) * rh]]) { if (blur > 0) ctx.filter = `blur(${blur}px)`; txt(ctx, strip[k], rx + rw / 2, ry + rh / 2 + 24 + dy, 66, '#16171b', 800, 'center', MONO); ctx.filter = 'none'; }
    const sh = ctx.createLinearGradient(0, ry, 0, ry + rh); sh.addColorStop(0, 'rgba(0,0,0,.45)'); sh.addColorStop(.25, 'rgba(0,0,0,0)'); sh.addColorStop(.75, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.45)');
    ctx.fillStyle = sh; ctx.fillRect(rx, ry, rw, rh); ctx.restore();
  }
  if (label) { ctx.letterSpacing = '4px'; txt(ctx, label, -Wd / 2 + 8, -Hd / 2 - 16, 20, 'rgba(230,234,240,.75)', 700, 'left', MONO); ctx.letterSpacing = '0px'; }
  ctx.restore();
}

// ---------------- macro bits ----------------
// layer pair with glowing polymer strands; shift = top layer offset (px)
export function strands(ctx, T, x0, x1, yTop, yBot, { shift = 0, n = 26, a = 1, wave = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const bx = lerp(x0, x1, (i + .5) / n), tx = bx + shift;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath(); const ph = hash(i, k) * 6.28, amp = (10 + 10 * hash(i, k + 3)) * wave;
      for (let j = 0; j <= 30; j++) { const u = j / 30, yy = lerp(yBot, yTop, u), xx = lerp(bx, tx, u) + Math.sin(u * 9 + ph + T * 3) * amp * Math.sin(u * Math.PI); j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
      ctx.strokeStyle = `rgba(${LIME},.12)`; ctx.lineWidth = 12; ctx.stroke(); ctx.strokeStyle = `rgba(${LIME},.9)`; ctx.lineWidth = 3; ctx.stroke();
    }
  }
  ctx.restore();
}
export function slab(ctx, x0, x1, y, h, { top = '#e9ecf1', side = '#a8afbb', depth = 34, a = 1 } = {}) { // horizontal glossy slab seen slightly from above
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = '#d7dbe2'; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + depth, y - depth * .6); ctx.lineTo(x1 + depth, y - depth * .6); ctx.lineTo(x1, y); ctx.closePath(); ctx.fill();
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, top); g.addColorStop(1, side); ctx.fillStyle = g; ctx.fillRect(x0, y, x1 - x0, h);
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(x0, y, x1 - x0, 2); ctx.restore();
}
// field of tiny matte bumps on a receding plane; rays: 0..1 scattered light
export function bumps(ctx, T, { cx = 540, cy = 1300, a = 1, scale = 1, rays = 0, mode = 'matte' } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  const rows = 16, cols = 14;
  for (let r = rows - 1; r >= 0; r--) for (let c = 0; c < cols; c++) {
    const zr = r / rows, persp = lerp(1.25, .45, zr) * scale, x = cx + (c - cols / 2 + (r % 2) * .5) * 74 * persp, y = cy + 260 * scale - zr * 520 * scale * lerp(1, .8, zr);
    const rad = 30 * persp * (.85 + .2 * hash(r * 31 + c));
    const g = ctx.createRadialGradient(x - rad * .35, y - rad * .45, rad * .1, x, y, rad); g.addColorStop(0, '#d9dde5'); g.addColorStop(.45, '#6b717d'); g.addColorStop(1, '#1d2026');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rad, rad * .78, 0, 0, 7); ctx.fill();
  }
  ctx.restore();
}
export function lightRays(ctx, T, x, y, { a = 1, scatter = 1, n = 9, len = 360, inAng = -2.1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { // incoming bundle
    const o = (i - (n - 1) / 2) * 9, sx = x + Math.cos(inAng) * len + o, sy = y + Math.sin(inAng) * len;
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(x + o * .3, y); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.6; ctx.stroke();
  }
  for (let i = 0; i < 18; i++) { // outgoing: one mirror bundle (scatter 0) or a fan (scatter 1)
    const mirror = Math.PI - inAng + (i - 8.5) * .015, fan = -Math.PI * (.08 + .84 * (i / 17)) + .05 * Math.sin(T * 2 + i), an = lerp(mirror, fan, scatter);
    const l = len * lerp(1, .55 + .3 * hash(i, 2), scatter), pulse = .55 + .45 * Math.sin(T * 5 - i);
    ctx.strokeStyle = `rgba(200,225,255,${.7 * pulse})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l); ctx.stroke();
  }
  glowDot(ctx, x, y, 70, '255,255,255', .8); ctx.restore();
}
// stylised eye (iris looks around slightly)
export function eye(ctx, T, x, y, s = 1, a = 1, squint = 0) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  const o = 1 - .6 * squint; ctx.beginPath(); ctx.moveTo(-90, 0); ctx.quadraticCurveTo(0, -80 * o, 90, 0); ctx.quadraticCurveTo(0, 80 * o, -90, 0); ctx.closePath();
  ctx.fillStyle = '#f4f6fa'; ctx.fill(); ctx.save(); ctx.clip(); const ix = 8 * Math.sin(T * 1.3);
  const g = ctx.createRadialGradient(ix, 0, 4, ix, 0, 38); g.addColorStop(0, '#0e1a33'); g.addColorStop(.35, '#2c6fd6'); g.addColorStop(1, '#0c2d63'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ix, 0, 38, 0, 7); ctx.fill();
  ctx.fillStyle = '#05070c'; ctx.beginPath(); ctx.arc(ix, 0, 15, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ix - 12, -12, 7, 0, 7); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
}
// hinge housing (U-shaped titanium shell with gears) around a teardrop bulb, centre (x,y), scale s
export function hingeHousing(ctx, T, x, y, s = 1, { a = 1, front = false, xr = 0 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  if (!front) {
    // shell
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const shell = (w, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(-w, -420); ctx.lineTo(-w, 40); ctx.arc(0, 40, w, Math.PI, 0, true); ctx.lineTo(w, -420); ctx.stroke(); };
    shell(250, 'rgba(160,170,185,.32)', 46); shell(250, 'rgba(225,232,242,.85)', 6); shell(222, 'rgba(255,255,255,.3)', 2);
    // gears + plates at the bottom
    for (let i = 0; i < 3; i++) {
      const gx = (i - 1) * 120, gy = 330 + (i === 1 ? 26 : 0), R = i === 1 ? 54 : 40, rot = T * (i % 2 ? -.8 : .8);
      ctx.save(); ctx.translate(gx, gy); ctx.rotate(rot); ctx.fillStyle = '#c9ced8';
      ctx.beginPath(); for (let k = 0; k < 24; k++) { const an = k / 24 * Math.PI * 2, rr2 = k % 2 ? R : R + 9; ctx.lineTo(Math.cos(an) * rr2, Math.sin(an) * rr2); } ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7d838f'; ctx.beginPath(); ctx.arc(0, 0, R * .55, 0, 7); ctx.fill(); ctx.fillStyle = '#e7eaef'; ctx.beginPath(); ctx.arc(0, 0, R * .2, 0, 7); ctx.fill(); ctx.restore();
    }
    // gold cam plate
    rr(ctx, -70, 260, 140, 40, 10); const gg = ctx.createLinearGradient(0, 260, 0, 300); gg.addColorStop(0, '#f5d58a'); gg.addColorStop(1, '#a8802f'); ctx.fillStyle = gg; ctx.fill();
  } else {
    // front glass rails
    ctx.strokeStyle = 'rgba(200,220,255,.18)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-205, -420); ctx.lineTo(-205, 60); ctx.moveTo(205, -420); ctx.lineTo(205, 60); ctx.stroke();
  }
  ctx.restore();
}
// iOS style card with blur-glass look
export function iosCard(ctx, x, y, w, h, { r = 38, dark = true, a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 26; rr(ctx, x, y, w, h, r); ctx.fillStyle = dark ? '#1c1d22' : '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
  const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, dark ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,1)'); g.addColorStop(1, dark ? 'rgba(255,255,255,0)' : 'rgba(240,241,245,1)');
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = dark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.06)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
}
