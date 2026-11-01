// Shared drawing primitives. Every function depends only on its inputs + time T (deterministic).
export const W = 1080, H = 1920;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const eo = t => 1 - Math.pow(1 - clamp(t), 3);
export const eo5 = t => 1 - Math.pow(1 - clamp(t), 5);
export const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const eback = t => { t = clamp(t); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
export const p = (T, t0, d = .5, e = eo) => e((T - t0) / d);            // eased progress
export const win = (T, a, b, f = .25) => clamp((T - a) / f) * clamp((b - T) / f); // fade in/out window
export const hash = (i, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
export const GOLD = '255,192,70';

export function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
// "Alive" idle motion around (cx, cy): slow pseudo-3D Y turn (squash + skew), bob, breathe and optional spin (rad/s).
// Wrap any object that would otherwise sit still: ctx.save(); alive(ctx, T, x, y, {...}); draw(); ctx.restore();
export function alive(ctx, T, cx, cy, { yaw = .12, bob = 8, breathe = .02, spin = 0, tilt = .012, speed = 1, seed = 0 } = {}) {
  const t = T * speed + seed * 1.7, a = yaw * Math.sin(t * .9), s = 1 + breathe * Math.sin(t * .7 + seed);
  ctx.translate(cx, cy + bob * Math.sin(t * 1.3 + seed)); ctx.rotate(spin * T + tilt * Math.sin(t * .6 + seed * 2));
  ctx.transform(Math.cos(a), Math.sin(a) * .1, 0, 1, 0, 0); ctx.scale(s, s); ctx.translate(-cx, -cy);
}
// 3D card flip-in around a vertical axis: k 0 -> edge-on, 1 -> facing the camera.
export function flipIn(ctx, cx, cy, k) { const c = Math.max(.001, Math.sin(clamp(k) * Math.PI / 2)); ctx.translate(cx, cy); ctx.transform(c, (1 - c) * .25, 0, 1, 0, 0); ctx.translate(-cx, -cy); }
export function cam(ctx, s = 1, cx = W / 2, cy = H / 2, rot = 0, dx = 0, dy = 0) {
  ctx.translate(cx + dx, cy + dy); ctx.rotate(rot); ctx.scale(s, s); ctx.translate(-cx, -cy);
}

export function bg(ctx, T, { top = '#151c29', bot = '#05070a', dust = 60 } = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  ctx.fillStyle = '#fff';
  for (let i = 0; i < dust; i++) {
    const x = ((hash(i) * W + T * 14 * (hash(i, 2) - .5)) % W + W) % W;
    const y = ((hash(i, 1) * H - T * 10 * hash(i, 3)) % H + H) % H;
    ctx.globalAlpha = (.06 + .22 * hash(i, 4)) * (.6 + .4 * Math.sin(T * 2 + i));
    ctx.beginPath(); ctx.arc(x, y, .8 + 1.6 * hash(i, 5), 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
export function topShade(ctx) { // dark band under captions + vignette
  let g = ctx.createLinearGradient(0, 0, 0, 560); g.addColorStop(0, 'rgba(4,6,9,.95)'); g.addColorStop(.6, 'rgba(4,6,9,.55)'); g.addColorStop(1, 'rgba(4,6,9,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 560);
  g = ctx.createRadialGradient(W / 2, H * .55, H * .3, W / 2, H * .55, H * .8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.6)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
export function label(ctx, txt, x, y, a = 1, lx, ly, size = 24) { // small spaced caps label + leader line
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = `700 ${size}px Inter, "Segoe UI", Arial`; ctx.letterSpacing = '3px';
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 8;
  ctx.fillText(txt, x, y);
  if (lx !== undefined) { ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y + 10); ctx.lineTo(lerp(x, lx, a), lerp(y + 10, ly, a)); ctx.stroke(); }
  ctx.restore();
}
export function note(ctx, txt, x, y, a = 1, align = 'left') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a * .55; ctx.font = '500 19px Inter, "Segoe UI", Arial';
  ctx.fillStyle = '#cfd6e2'; ctx.textAlign = align; ctx.fillText(txt, x, y); ctx.restore();
}

const bez = (t, a, b, c, d) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };
function glowStroke(ctx, a, w = 2, rgb = GOLD) {
  ctx.strokeStyle = `rgba(${rgb},${.12 * a})`; ctx.lineWidth = w * 5; ctx.stroke();
  ctx.strokeStyle = `rgba(${rgb},${.9 * a})`; ctx.lineWidth = w; ctx.stroke();
}

// Magnified screen cross-section: glass, electrodes, charge arcs (fountains), RGB pixel strip, values row.
// pulls: [{x,y,s,r}] conductive objects stealing charge. dead: [{x,r}] arcs hidden. focus: index of single highlighted arc.
export function stack(ctx, T, o = {}) {
  const { y = 1150, sp = 76, x0 = -160, x1 = W + 160, pulls = [], values = 0, valY = 110, arcA = 1, arcH = 1,
    focus = -1, focusA = 0, valueFn = null, pixBig = 1, glass = 1 } = o;
  // under layers
  let g = ctx.createLinearGradient(0, y + 20, 0, y + 600); g.addColorStop(0, '#1b222e'); g.addColorStop(.25, '#10141b'); g.addColorStop(1, '#07090c');
  ctx.fillStyle = g; ctx.fillRect(x0, y + 22, x1 - x0, 900);
  ctx.fillStyle = 'rgba(255,255,255,.05)'; for (let k = 0; k < 4; k++) ctx.fillRect(x0, y + 200 + k * 46, x1 - x0, 2);
  // pixel strip
  const pw = 10 * pixBig, ph = 16 * pixBig, step = 14 * pixBig, cols = ['255,60,80', '50,235,110', '60,120,255'];
  for (let x = x0, k = 0; x < x1; x += step, k++) {
    const b = .55 + .45 * Math.sin(T * 1.5 + k * 1.7) * hash(k, 9);
    ctx.fillStyle = `rgba(${cols[k % 3]},${b})`; rr(ctx, x, y + 34, pw, ph, 3 * pixBig); ctx.fill();
  }
  // glass slab
  ctx.globalAlpha = glass;
  g = ctx.createLinearGradient(0, y - 40, 0, y + 20); g.addColorStop(0, 'rgba(190,210,240,.22)'); g.addColorStop(1, 'rgba(120,140,170,.08)');
  ctx.fillStyle = g; ctx.fillRect(x0, y - 40, x1 - x0, 60);
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(x0, y - 41, x1 - x0, 2);
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x0, y + 19, x1 - x0, 1.5);
  ctx.globalAlpha = 1;
  // electrodes + arcs
  const xs = []; for (let x = x0 + ((W / 2 - x0) % sp); x < x1; x += sp) xs.push(x);
  const ws = xs.map(x => pulls.reduce((m, q) => Math.max(m, q.s * Math.exp(-(((x - q.x) / (q.r || 120)) ** 2))), 0));
  const ey = y - 6;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  xs.forEach((ex, i) => {
    if (i === xs.length - 1) return;
    const w = Math.max(ws[i], ws[i + 1]);
    const fa = focus >= 0 ? (i === focus ? 1 : 1 - .75 * focusA) : 1;
    for (let k = 0; k < 3; k++) {
      const a = ex + 8 + k * 5, b = ex + sp - 8 - k * 5;
      const h = (sp * (.55 + .28 * k) + Math.sin(T * 3 + i * 1.3 + k) * 4) * arcH * (1 - .75 * w);
      ctx.beginPath(); ctx.moveTo(a, ey); ctx.bezierCurveTo(a, ey - h * 1.33, b, ey - h * 1.33, b, ey);
      glowStroke(ctx, arcA * fa * (.85 - k * .18), 1.8);
      if (k === 0 && arcA * fa > .2) { // charge dot travelling along arc
        const tt = (T * .7 + hash(i)) % 1;
        ctx.fillStyle = `rgba(255,236,170,${arcA * fa * .9})`; ctx.beginPath();
        ctx.arc(bez(tt, a, a, b, b), bez(tt, ey, ey - h * 1.33, ey - h * 1.33, ey), 2.6, 0, 7); ctx.fill();
      }
    }
  });
  // pulled strands to conductive objects
  pulls.forEach(q => xs.forEach((ex, i) => {
    const w = q.s * Math.exp(-(((ex - q.x) / (q.r || 120)) ** 2)); if (w < .03) return;
    for (let k = 0; k < 3; k++) {
      const tx = q.x + (ex - q.x) * (.3 + .1 * k) + Math.sin(T * 4 + i + k) * 6;
      ctx.beginPath(); ctx.moveTo(ex + (k - 1) * 4, ey);
      ctx.bezierCurveTo(ex, lerp(ey, q.y, .55), tx, lerp(ey, q.y, .45), tx, q.y + 4);
      glowStroke(ctx, w * arcA * (.9 - k * .2), 1.6);
      const tt = (T * 1.2 + k * .33 + i * .17) % 1;
      ctx.fillStyle = `rgba(255,240,190,${w})`; ctx.beginPath();
      ctx.arc(bez(tt, ex, ex, tx, tx), bez(tt, ey, lerp(ey, q.y, .55), lerp(ey, q.y, .45), q.y), 3, 0, 7); ctx.fill();
    }
  }));
  ctx.restore();
  xs.forEach(ex => { ctx.fillStyle = '#e9eef6'; rr(ctx, ex - 13, ey - 3, 26, 9, 4.5); ctx.fill(); });
  // values row
  if (values > 0) {
    ctx.save(); ctx.globalAlpha = values; ctx.textAlign = 'center'; ctx.font = '600 34px "Cascadia Mono", Consolas, monospace';
    xs.forEach((ex, i) => {
      if (sp < 100 && i % 2) return;
      const v = valueFn ? valueFn(i, ex, ws[i]) : Math.round(100 - 38 * Math.max(ws[i], ws[i + 1] || 0));
      ctx.fillStyle = v < 100 ? '#fff' : 'rgba(220,226,236,.65)'; ctx.font = `${v < 100 ? 800 : 600} ${v < 100 ? 38 : 34}px "Cascadia Mono", Consolas, monospace`;
      ctx.fillText(v, ex, y + valY);
    });
    ctx.restore();
  }
  return { xs, ws };
}

// Finger seen from the side. Tip pad at (x,y); ang rotates the hand direction (negative = hand up-left).
export function finger(ctx, o) {
  const { x, y, ang = -.55, wid = 250, len = 1300, glow = 0, ions = 0, wool = 0, woolGlow = 0, T = 0, alpha = 1, thread = 0 } = o;
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(ang);
  const r = wid / 2;
  const path = () => { ctx.beginPath(); ctx.moveTo(-r, -len); ctx.lineTo(-r, -r); ctx.arc(0, -r, r, Math.PI, 0, true); ctx.lineTo(r, -len); ctx.closePath(); };
  if (wool > 0) { // knit loops around pad
    ctx.save(); ctx.globalAlpha = alpha * wool;
    for (let k = 0; k < 2; k++) {
      const n = 34, rad = r + 26 + k * 20;
      for (let i = 0; i <= n; i++) {
        const a = Math.PI * 1.05 * (i / n) - .02 + Math.PI * -.02, px = Math.cos(a) * rad, py = -r + Math.sin(a) * rad;
        if (py < -r - 40) continue;
        const cond = thread > 0 && (i % 4 === 0);
        ctx.strokeStyle = cond ? `rgba(${woolGlow > 0 ? '255,214,120' : '235,240,250'},${.9})` : 'rgba(170,176,186,.75)';
        ctx.lineWidth = cond ? 4.5 : 3; ctx.beginPath(); ctx.ellipse(px, py, 20, 16, a, 0, 7); ctx.stroke();
        if (cond && woolGlow > 0) { ctx.strokeStyle = `rgba(${GOLD},${.25 * woolGlow})`; ctx.lineWidth = 14; ctx.stroke(); }
      }
    }
    ctx.restore();
  }
  // soft shadow/rim
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; path(); ctx.fillStyle = '#b77d66'; ctx.fill(); ctx.restore();
  let g = ctx.createLinearGradient(-r, 0, r, 0);
  g.addColorStop(0, '#9a614f'); g.addColorStop(.25, '#d79f86'); g.addColorStop(.55, '#f0c3ab'); g.addColorStop(.85, '#d39a81'); g.addColorStop(1, '#8f5a49');
  path(); ctx.fillStyle = g; ctx.fill();
  ctx.save(); path(); ctx.clip();
  g = ctx.createRadialGradient(-r * .2, -r * 1.2, 10, 0, -r, r * 1.6); g.addColorStop(0, 'rgba(255,230,215,.35)'); g.addColorStop(1, 'rgba(255,230,215,0)');
  ctx.fillStyle = g; ctx.fillRect(-r, -len, wid, len);
  ctx.strokeStyle = 'rgba(110,60,45,.10)'; ctx.lineWidth = 2; // fingerprint ridges
  for (let k = 0; k < 22; k++) { ctx.beginPath(); ctx.ellipse(r * .1, -r * 1.25, 14 + k * 11, 10 + k * 8, .3, 0, 7); ctx.stroke(); }
  if (ions > 0) { // cross-section with salty ions
    ctx.globalAlpha = alpha * ions; ctx.fillStyle = 'rgba(28,34,44,.92)';
    ctx.beginPath(); ctx.moveTo(-r + 14, -len); ctx.lineTo(-r + 14, -r); ctx.arc(0, -r, r - 14, Math.PI, 0, true); ctx.lineTo(r - 14, -len); ctx.fill();
    for (let i = 0; i < 26; i++) {
      const cx = (hash(i, 1) - .5) * (wid - 90) + Math.sin(T * 2.2 + i) * 7, cy = -r * .7 - hash(i, 2) * 560 + Math.cos(T * 1.9 + i * 2) * 7;
      if (Math.hypot(cx, cy + r) > r - 44 && cy > -r) continue;
      const na = i % 2 === 0;
      ctx.fillStyle = na ? '#e9edf3' : '#66707e'; ctx.beginPath(); ctx.arc(cx, cy, 24, 0, 7); ctx.fill();
      if (glow > 0) { ctx.fillStyle = `rgba(${GOLD},${.5 * glow})`; ctx.beginPath(); ctx.arc(cx, cy, 32, 0, 7); ctx.fill(); }
      ctx.fillStyle = na ? '#1d2430' : '#fff'; ctx.font = '700 17px Inter, "Segoe UI", Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(na ? 'Na⁺' : 'Cl⁻', cx, cy);
    }
  }
  if (glow > 0) {
    ctx.globalAlpha = alpha; ctx.globalCompositeOperation = 'lighter';
    g = ctx.createRadialGradient(0, -r * .4, 5, 0, -r * .6, r * 2.6); g.addColorStop(0, `rgba(255,200,90,${.75 * glow})`); g.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = g; ctx.fillRect(-r, -len, wid, len);
  }
  ctx.restore(); ctx.restore();
}

// Ballpoint pen; tip at (x,y), body extends up-right for positive ang.
export function pen(ctx, { x, y, ang = .5, len = 1400, alpha = 1 }) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(ang);
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40;
  let g = ctx.createLinearGradient(-44, 0, 44, 0); g.addColorStop(0, 'rgba(40,52,80,.85)'); g.addColorStop(.3, 'rgba(110,130,170,.55)'); g.addColorStop(.6, 'rgba(30,40,62,.75)'); g.addColorStop(1, 'rgba(18,24,38,.9)');
  ctx.fillStyle = g; rr(ctx, -44, -len, 88, len - 118, 20); ctx.fill(); ctx.shadowBlur = 0;
  g = ctx.createLinearGradient(-12, 0, 12, 0); g.addColorStop(0, '#1a2a9a'); g.addColorStop(.45, '#4f6bff'); g.addColorStop(1, '#14208a');
  ctx.fillStyle = g; ctx.fillRect(-12, -len, 24, len - 120);
  ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(-30, -len, 6, len - 130);
  g = ctx.createLinearGradient(-30, 0, 30, 0); g.addColorStop(0, '#7a5a20'); g.addColorStop(.45, '#f3d27e'); g.addColorStop(1, '#6a4b18');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-7, -12); ctx.lineTo(-34, -112); ctx.lineTo(34, -112); ctx.lineTo(7, -12); ctx.fill();
  ctx.fillStyle = '#5c4416'; ctx.fillRect(-38, -126, 76, 16);
  ctx.fillStyle = '#c9ccd2'; ctx.beginPath(); ctx.arc(0, -6, 7, 0, 7); ctx.fill();
  ctx.restore();
}

// Phone shell; screenFn(ctx,w,h) draws in screen space (0,0)-(w,h).
export function phone(ctx, { x, y, w = 500, h = 1060, rot = 0, s = 1, alpha = 1 }, screenFn) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 60;
  rr(ctx, -w / 2 - 16, -h / 2 - 16, w + 32, h + 32, 84); ctx.fillStyle = '#16181c'; ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = '#6b7079'; ctx.lineWidth = 4; ctx.stroke();
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 70); ctx.clip(); ctx.translate(-w / 2, -h / 2); screenFn(ctx, w, h); ctx.restore();
  rr(ctx, -62, -h / 2 + 22, 124, 36, 18); ctx.fillStyle = '#000'; ctx.fill();
  const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, 'rgba(255,255,255,.08)'); g.addColorStop(.45, 'rgba(255,255,255,0)');
  rr(ctx, -w / 2, -h / 2, w, h, 70); ctx.fillStyle = g; ctx.fill();
  ctx.restore();
}

// Knit glove texture pattern (cached per context).
const pats = new WeakMap();
export function knit(ctx, tint = '#5f636b') {
  const key = tint; let m = pats.get(ctx); if (!m) pats.set(ctx, m = {}); if (m[key]) return m[key];
  const c = new OffscreenCanvas(22, 20), x = c.getContext('2d');
  x.fillStyle = tint; x.fillRect(0, 0, 22, 20); x.lineWidth = 4; x.lineCap = 'round';
  x.strokeStyle = 'rgba(255,255,255,.22)'; x.beginPath(); x.moveTo(2, 2); x.lineTo(11, 17); x.lineTo(20, 2); x.stroke();
  x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(11, 0); x.lineTo(11, 20); x.stroke();
  return m[key] = ctx.createPattern(c, 'repeat');
}
function capsule(ctx, x, y, w, h, rot, fill, shade = .5) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  rr(ctx, -w / 2, -h / 2, w, h, w / 2); ctx.fillStyle = fill; ctx.fill();
  const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, `rgba(0,0,0,${shade})`); g.addColorStop(.45, 'rgba(255,255,255,.12)'); g.addColorStop(1, `rgba(0,0,0,${shade})`);
  ctx.fillStyle = g; ctx.fill(); ctx.restore();
}
// Gloved left hand holding a phone centred at (x,y) of size pw x ph. part: 'back' (palm, drawn before phone) or 'front' (fingers wrapping edge).
export function gloveHold(ctx, { x, y, pw = 500, ph = 1060, part = 'back', s = 1, tint }) {
  const k = knit(ctx, tint);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (part === 'back') {
    capsule(ctx, -pw * .05, ph * .55, pw * 1.05, 520, -.12, k, .45);           // palm
    capsule(ctx, -pw * .48, ph * .22, 120, 430, -.35, k, .5);                 // thumb
  } else {
    for (let i = 0; i < 4; i++) capsule(ctx, pw * .5 + 20, -ph * .08 + i * 118, 110, 175, -1.35 + i * .05, k, .55);
  }
  ctx.restore();
}
// Single gloved / bare finger coming from bottom-right to tap at (x,y).
export function tapFinger(ctx, { x, y, ang = -.45, glove = true, alpha = 1, tint, glow = 0 }) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(ang);
  if (glove) { capsule(ctx, 0, 330, 120, 720, 0, knit(ctx, tint), .55); capsule(ctx, 90, 760, 380, 520, .2, knit(ctx, tint), .45); }
  else {
    const g = ctx.createLinearGradient(-55, 0, 55, 0); g.addColorStop(0, '#9b634f'); g.addColorStop(.5, '#efc2a8'); g.addColorStop(1, '#94604d');
    capsule(ctx, 0, 380, 110, 820, 0, g, .2);
    if (glow > 0) { ctx.globalCompositeOperation = 'lighter'; const r = ctx.createRadialGradient(0, 30, 2, 0, 30, 70); r.addColorStop(0, `rgba(255,205,90,${glow})`); r.addColorStop(1, 'rgba(255,205,90,0)'); ctx.fillStyle = r; ctx.fillRect(-80, -50, 160, 160); }
  }
  ctx.restore();
}
export function ring(ctx, x, y, t, col = '255,255,255', r0 = 20, r1 = 90) { // tap ripple, t in 0..1
  if (t <= 0 || t >= 1) return;
  ctx.save(); ctx.strokeStyle = `rgba(${col},${1 - t})`; ctx.lineWidth = 4 * (1 - t) + 1;
  ctx.beginPath(); ctx.arc(x, y, lerp(r0, r1, eo(t)), 0, 7); ctx.stroke(); ctx.restore();
}
export function snow(ctx, T, n = 120, a = 1, wind = 30) {
  ctx.fillStyle = '#fff';
  for (let i = 0; i < n; i++) {
    const sp = 60 + 120 * hash(i, 1), x = ((hash(i) * W + T * wind + Math.sin(T + i) * 20) % W + W) % W, y = ((hash(i, 2) * H + T * sp) % H);
    ctx.globalAlpha = a * (.25 + .6 * hash(i, 3)); ctx.beginPath(); ctx.arc(x, y, 1.5 + 3.5 * hash(i, 4), 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
export function rain(ctx, T, n = 140, a = 1) {
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const sp = 1600 + 900 * hash(i, 1), x = ((hash(i) * W * 1.3 - (T * sp * .25)) % (W * 1.3) + W * 1.3) % (W * 1.3), y = (hash(i, 2) * H + T * sp) % (H + 200) - 100;
    ctx.strokeStyle = `rgba(200,215,235,${a * (.12 + .25 * hash(i, 3))})`; ctx.lineWidth = 1 + 1.5 * hash(i, 4);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 14, y + 60); ctx.stroke();
  }
}
export function drop(ctx, x, y, r) { // water droplet on a surface (top view)
  const g = ctx.createRadialGradient(x - r * .3, y - r * .35, r * .1, x, y, r);
  g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(.35, 'rgba(200,220,240,.12)'); g.addColorStop(.9, 'rgba(20,30,40,.25)'); g.addColorStop(1, 'rgba(255,255,255,.35)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
}

// Simple 3D projector for the electrode grid (plane z=0, z up).
export function proj3({ yaw = Math.PI / 4, pitch = .9, dist = 8, f = 1500, cx = W / 2, cy = H * .58, tx = 0, ty = 0 }) {
  const cy_ = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  return (x, y, z = 0) => {
    x -= tx; y -= ty; const x1 = x * cy_ - y * sy, y1 = x * sy + y * cy_;
    const up = y1 * cp + z * sp, d = dist + y1 * sp - z * cp;
    return d <= .2 ? null : [cx + f * x1 / d, cy - f * up / d, d];
  };
}
// Electrode grid in 3D. opts: n (half size), arcs alpha, nums alpha, valueFn(i,j)->number, hi(i,j)->0..1 tile highlight, gold(i,j)->tile tint
export function grid3(ctx, T, P, o = {}) {
  const { n = 6, arcs = 0, nums = 0, valueFn = () => 100, hi = () => 0, gold = () => 0, scan = -99, bridge = 1 } = o;
  const cells = [];
  for (let i = -n; i < n; i++) for (let j = -n; j < n; j++) cells.push([i, j]);
  cells.sort((a, b) => (P(b[0] + .5, b[1] + .5) || [0, 0, 0])[2] - (P(a[0] + .5, a[1] + .5) || [0, 0, 0])[2]);
  for (const [i, j] of cells) {
    const g = .06, q = [P(i + g, j + g), P(i + 1 - g, j + g), P(i + 1 - g, j + 1 - g), P(i + g, j + 1 - g)];
    if (q.some(v => !v)) continue;
    const d = q[0][2], fog = clamp(1.4 - d / 14, .15, 1);
    ctx.beginPath(); q.forEach((v, k) => k ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1])); ctx.closePath();
    const h = hi(i, j), gt = gold(i, j);
    ctx.fillStyle = `rgba(${Math.round(lerp(52, 210, h) + 120 * gt)},${Math.round(lerp(56, 214, h) + 90 * gt)},${Math.round(lerp(64, 222, h) + 10 * gt)},${fog * (.85)})`;
    ctx.fill(); ctx.strokeStyle = `rgba(255,255,255,${.22 * fog})`; ctx.lineWidth = 1.5; ctx.stroke();
    if (Math.abs(j + .5 - scan) < .5) { ctx.fillStyle = `rgba(255,255,255,${.25 * (1 - Math.abs(j + .5 - scan) * 2)})`; ctx.fill(); }
  }
  // crossings: bridges, arcs, numbers (far to near)
  const pts = []; for (let i = -n + 1; i < n; i++) for (let j = -n + 1; j < n; j++) { const v = P(i, j); if (v) pts.push([i, j, v]); }
  pts.sort((a, b) => b[2][2] - a[2][2]);
  ctx.lineCap = 'round';
  for (const [i, j, v] of pts) {
    const fog = clamp(1.4 - v[2] / 14, .15, 1);
    if (bridge > 0) { const a = P(i - .09, j - .09, .04), b = P(i + .09, j + .09, .04); if (a && b) { ctx.strokeStyle = `rgba(235,240,248,${bridge * fog})`; ctx.lineWidth = Math.max(2, 900 / v[2] * .045); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); } }
    if (arcs > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 2; k++) {
        const hh = (.28 + k * .12) * (1 + .08 * Math.sin(T * 4 + i * 2 + j));
        ctx.beginPath();
        for (let s = 0; s <= 12; s++) { const u = s / 12, pt = P(i - .3 + .6 * u, j + .3 - .6 * u, 4 * hh * u * (1 - u)); if (pt) s ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]); }
        ctx.strokeStyle = `rgba(${GOLD},${.12 * arcs * fog})`; ctx.lineWidth = 8; ctx.stroke();
        ctx.strokeStyle = `rgba(${GOLD},${.85 * arcs * fog})`; ctx.lineWidth = 2; ctx.stroke();
      }
      ctx.restore();
    }
    if (nums > 0) {
      const val = valueFn(i, j), sz = clamp(1500 / v[2] * .2, 10, 60);
      ctx.font = `${val < 100 ? 800 : 600} ${sz}px Inter, "Segoe UI", Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = val < 100 ? `rgba(255,255,255,${nums})` : `rgba(200,206,216,${nums * .5 * fog})`;
      if (val < 100) { ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 10; }
      ctx.fillText(val, v[0], v[1] - sz * .9); ctx.shadowBlur = 0;
    }
  }
}
