// Drawing kit for the "How does GPS work with no service?" explainer. Pure functions of their inputs + time T (deterministic).
// Everything is drawn in code except the Earth photo (user asset src/assets/globe.png, cut to a circle).
import { W, H, clamp, lerp, eo, eio, eback, hash, rr } from './lib.js';
import { FONT, MONO, txt, tw, bin, pop, card, glowDot, pill } from './kit.js';
import { IMG } from './assets.js';
export const GOLDC = '#ffc046', GOLD_RGB = '255,192,70', SKY = '#4f9dff', SKY_RGB = '79,157,255', CYAN = '#5de0ff', CYAN_RGB = '93,224,255', MINT = '#7dffb0', MINT_RGB = '125,255,176', RED = '#ff5a5f', RED_RGB = '255,90,95', VIO = '#b99bff', VIO_RGB = '185,155,255';

// ---------- backgrounds ----------
export function space(ctx, T, { tint = '30,56,130', gx = W / 2, gy = 1150, glow = 1, stars = 110, a = 1 } = {}) {
  let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#03050c'); g.addColorStop(.55, '#070c1d'); g.addColorStop(1, '#03050a');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  if (glow > 0) { const r = 760 + 50 * Math.sin(T * .7); g = ctx.createRadialGradient(gx, gy, 20, gx, gy, r); g.addColorStop(0, `rgba(${tint},${.34 * glow})`); g.addColorStop(.55, `rgba(${tint},${.1 * glow})`); g.addColorStop(1, `rgba(${tint},0)`); ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3); }
  ctx.fillStyle = '#fff';
  for (let i = 0; i < stars; i++) { const x = ((hash(i) * W + T * (3 + 9 * hash(i, 2))) % W + W) % W, y = ((hash(i, 1) * H - T * 5 * hash(i, 3)) % H + H) % H;
    ctx.globalAlpha = (.15 + .6 * hash(i, 4)) * (.55 + .45 * Math.sin(T * (1 + 2 * hash(i, 6)) + i)); ctx.beginPath(); ctx.arc(x, y, .7 + 1.7 * hash(i, 5), 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .85); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); ctx.fillStyle = v; ctx.fillRect(-W, -H, W * 3, H * 3);
}
// daytime hillside sky for the hiking beat
export function sky(ctx, T) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a3a6c'); g.addColorStop(.45, '#4b86c8'); g.addColorStop(.75, '#a9cde6'); g.addColorStop(1, '#2f4a2b'); ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  for (let i = 0; i < 6; i++) { const x = ((hash(i) * 1400 + T * (10 + 8 * hash(i, 2))) % 1400) - 160, y = 560 + hash(i, 1) * 520, s = 1 + hash(i, 3);
    ctx.fillStyle = 'rgba(255,255,255,.5)'; [[0, 0, 60], [55, -14, 52], [-55, 8, 46], [110, 10, 40]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.ellipse(x + dx * s, y + dy * s, r * s * 1.2, r * s * .6, 0, 0, 7); ctx.fill(); }); }
}

// ---------- labels ----------
export function tag(ctx, x, y, s, a = 1, lx, ly, { rgb = '235,240,248', size = 22, light = false, sub } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a);
  ctx.font = MONO(700, size); ctx.letterSpacing = '2px'; const w = Math.max(ctx.measureText(s).width, sub ? ctx.measureText(sub).width * .8 : 0) + 30, h = size * 1.75 + (sub ? size * .95 : 0);
  if (lx != null) { const k = eo(a); ctx.strokeStyle = `rgba(${rgb},.85)`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lerp(x, lx, k), lerp(y, ly, k)); ctx.stroke(); ctx.fillStyle = `rgb(${rgb})`; ctx.beginPath(); ctx.arc(lerp(x, lx, k), lerp(y, ly, k), 7, 0, 7); ctx.fill(); }
  rr(ctx, x - w / 2, y - h / 2, w, h, 8); ctx.fillStyle = light ? 'rgba(255,255,255,.95)' : 'rgba(8,12,22,.9)'; ctx.fill(); ctx.strokeStyle = `rgba(${rgb},.9)`; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = light ? '#14161c' : `rgb(${rgb})`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 1, y + (sub ? -size * .32 : 1));
  if (sub) { ctx.letterSpacing = '1px'; ctx.font = MONO(600, size * .72); ctx.fillStyle = light ? '#454a56' : 'rgba(215,224,240,.8)'; ctx.fillText(sub, x, y + size * .78); }
  ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '0px'; ctx.restore();
}
export function title(ctx, a, head, sub, { y = 600, col = '#fff', size = 70, glow, x = W / 2, subCol = 'rgba(210,216,226,.8)' } = {}) {
  bin(ctx, a, () => {
    ctx.save(); ctx.font = FONT(900, size); let s = size; while (ctx.measureText(head).width > 960 && s > 30) { s -= 2; ctx.font = FONT(900, s); }
    ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 18; if (glow) { ctx.shadowColor = `rgba(${glow},.75)`; ctx.shadowBlur = 30; } ctx.fillStyle = col; ctx.fillText(head, x, y); ctx.restore();
    if (sub) { ctx.save(); ctx.letterSpacing = '5px'; ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 10; txt(ctx, sub, x, y + 50, 24, subCol, 700, 'center', MONO); ctx.restore(); }
  });
}
export function stamp(ctx, k, x, y, s, { col = '#fff', bg = 'rgba(8,12,22,.92)', size = 70, rot = -.06 } = {}) {
  if (k <= 0) return; const sc = lerp(1.8, 1, eback(clamp(k))); ctx.save(); ctx.globalAlpha *= clamp(k * 2); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.font = FONT(900, size); let w = ctx.measureText(s).width + size * .8; const h = size * 1.45;
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 30; rr(ctx, -w / 2, -h / 2, w, h, 14); if (bg) { ctx.fillStyle = bg; ctx.fill(); } ctx.shadowBlur = 0;
  ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 4); ctx.textBaseline = 'alphabetic'; ctx.restore();
}
export function arrow(ctx, x0, y0, x1, y1, { col = GOLDC, w = 16, head = 2.6, a = 1, glow = 1 } = {}) {
  if (a <= 0) return; const L = Math.hypot(x1 - x0, y1 - y0); if (L < 2) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x0, y0); ctx.rotate(Math.atan2(y1 - y0, x1 - x0));
  if (glow) { ctx.shadowColor = col; ctx.shadowBlur = 18 * glow; }
  const hl = Math.min(L * .45, w * head * 1.2); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(0, -w / 2); ctx.lineTo(L - hl, -w / 2); ctx.lineTo(L - hl, -w * head / 2); ctx.lineTo(L, 0); ctx.lineTo(L - hl, w * head / 2); ctx.lineTo(L - hl, w / 2); ctx.lineTo(0, w / 2); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(0, -w / 2, L - hl, w * .3); ctx.restore();
}

// ---------- Earth, satellites, signals ----------
// Earth photo as a circle centred on (x,y) with radius r; the photo's rim glows cyan. yaw squashes it slightly for a slow turn.
export function globe(ctx, T, x, y, r, { a = 1, glow = 1, yaw = .05 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  glowDot(ctx, x, y, r * 1.5, '60,160,255', .5 * glow);
  const i = IMG.globe; if (i) { const d = r * 2 * (600 / 564); ctx.translate(x, y); ctx.rotate(.05 * Math.sin(T * .3)); ctx.transform(1 - yaw * (.5 + .5 * Math.sin(T * .4)), 0, 0, 1, 0, 0); ctx.drawImage(i, -d / 2, -d / 2, d, d); }
  ctx.restore();
}
export const youPos = (x, y, r) => [x - .46 * r, y - .035 * r]; // where "you" (India) sits on the Earth photo
export function youDot(ctx, T, x, y, { a = 1, label = 'You', size = 26, pulse = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a);
  for (let k = 0; k < 2; k++) { const u = (T * .8 + k * .5) % 1; ctx.strokeStyle = `rgba(${GOLD_RGB},${.7 * (1 - u) * pulse})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 10 + 46 * u, 0, 7); ctx.stroke(); }
  glowDot(ctx, x, y, 50, GOLD_RGB, .8); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill(); ctx.fillStyle = GOLDC; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill();
  if (label) { ctx.font = FONT(800, size); const w = ctx.measureText(label).width + 26; rr(ctx, x + 18, y - 4, w, size * 1.5, 10); ctx.fillStyle = 'rgba(8,12,22,.9)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,192,70,.7)'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#ffe9b8'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(label, x + 31, y + size * .75 - 4); ctx.textBaseline = 'alphabetic'; }
  ctx.restore();
}
// satellite centred on (x,y), size s (body about 110 s wide); rot in radians; panels point sideways
export function sat(ctx, T, x, y, s = 1, { rot = 0, glow = 0, dish = 1, a = 1, clock = 0 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (glow > 0) glowDot(ctx, 0, 0, 260, GOLD_RGB, glow);
  const panel = (sx) => { ctx.save(); ctx.scale(sx, 1);
    ctx.strokeStyle = '#8d96a8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(56, 0); ctx.lineTo(100, 0); ctx.stroke();
    for (let k = 0; k < 2; k++) { const px = 100 + k * 138, g = ctx.createLinearGradient(px, -64, px + 130, 64); g.addColorStop(0, '#2d58b8'); g.addColorStop(.5, '#4f86ea'); g.addColorStop(1, '#1d3f8f');
      rr(ctx, px, -64, 130, 128, 5); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(190,215,255,.6)'; ctx.lineWidth = 1.6; ctx.beginPath();
      for (let i = 1; i < 4; i++) { ctx.moveTo(px + i * 32.5, -64); ctx.lineTo(px + i * 32.5, 64); } for (let j = 1; j < 4; j++) { ctx.moveTo(px, -64 + j * 32); ctx.lineTo(px + 130, -64 + j * 32); } ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.moveTo(px, -64); ctx.lineTo(px + 60, -64); ctx.lineTo(px + 10, 64); ctx.lineTo(px, 64); ctx.fill(); }
    ctx.restore(); };
  panel(1); panel(-1);
  const g = ctx.createLinearGradient(-56, -64, 56, 64); g.addColorStop(0, '#e6c067'); g.addColorStop(.45, '#b78a2c'); g.addColorStop(1, '#6f5114');
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 20; rr(ctx, -56, -66, 112, 132, 12); ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,240,190,.5)'; ctx.lineWidth = 2; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-56, -66 + k * 33); ctx.lineTo(56, -66 + k * 33); ctx.stroke(); }
  if (dish > 0) { ctx.fillStyle = '#d7dbe4'; ctx.beginPath(); ctx.ellipse(0, 46, 36, 14, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#7d8596'; ctx.beginPath(); ctx.ellipse(0, 46, 22, 8, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#d7dbe4'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -66); ctx.lineTo(0, -96); ctx.stroke(); ctx.fillStyle = GOLDC; ctx.beginPath(); ctx.arc(0, -98, 7 + 2 * Math.sin(T * 5), 0, 7); ctx.fill(); }
  ctx.restore();
}
// travelling signal: crescents running from (x0,y0) to (x1,y1). k = how far the front has travelled (0..1)
export function beam(ctx, T, x0, y0, x1, y1, { k = 1, rgb = GOLD_RGB, n = 4, speed = .5, w = 90, a = 1, line = 1, cres = 1 } = {}) {
  if (a <= 0 || k <= 0) return; const L = Math.hypot(x1 - x0, y1 - y0), ang = Math.atan2(y1 - y0, x1 - x0);
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x0, y0); ctx.rotate(ang); ctx.lineCap = 'round'; const e = L * clamp(k);
  if (line > 0) { const g = ctx.createLinearGradient(0, 0, e, 0); g.addColorStop(0, `rgba(${rgb},${.7 * line})`); g.addColorStop(1, `rgba(${rgb},${.2 * line})`); ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.setLineDash([22, 14]); ctx.lineDashOffset = -T * 90; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(e, 0); ctx.stroke(); ctx.setLineDash([]); }
  ctx.globalCompositeOperation = 'lighter';
  if (cres > 0) for (let i = 0; i < n; i++) { const u = (T * speed + i / n) % 1, d = u * e, hw = w * (.25 + .75 * u), al = Math.sin(u * Math.PI);
    ctx.beginPath(); ctx.moveTo(d - hw * .2, -hw); ctx.quadraticCurveTo(d + hw * .35, 0, d - hw * .2, hw); ctx.strokeStyle = `rgba(${rgb},${.14 * al * cres})`; ctx.lineWidth = 12; ctx.stroke(); ctx.strokeStyle = `rgba(${rgb},${.95 * al * cres})`; ctx.lineWidth = 3.5; ctx.stroke(); }
  ctx.restore();
}
export function ringsOut(ctx, T, x, y, { rgb = GOLD_RGB, n = 3, r1 = 260, a = 1, speed = .6, lw = 3 } = {}) { // expanding broadcast rings
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const u = (T * speed + i / n) % 1; ctx.strokeStyle = `rgba(${rgb},${.85 * (1 - u) * a})`; ctx.lineWidth = lw * (1 - u * .6) + .5; ctx.beginPath(); ctx.arc(x, y, 20 + (r1 - 20) * eo(u), 0, 7); ctx.stroke(); }
  ctx.restore();
}
export function orbit(ctx, T, cx, cy, rx, ry, { rot = 0, a = 1, rgb = '160,200,255' } = {}) { ctx.save(); ctx.strokeStyle = `rgba(${rgb},${.3 * a})`; ctx.lineWidth = 2; ctx.setLineDash([10, 12]); ctx.lineDashOffset = -T * 12; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, rot, 0, 7); ctx.stroke(); ctx.restore(); }

// ---------- phone with a maps screen ----------
const ROUTE = [[.38, 1.08], [.44, .86], [.62, .66], [.52, .46], [.58, .26], [.5, -.06]];
export function routeAt(u, w, h) { const n = ROUTE.length - 1, f = clamp(u) * n, i = Math.min(n - 1, Math.floor(f)), t = f - i; return [lerp(ROUTE[i][0], ROUTE[i + 1][0], t) * w, lerp(ROUTE[i][1], ROUTE[i + 1][1], t) * h]; }
// Maps screen drawn in (0,0)-(w,h). o: dot (0..1 along the route or -1 none), pan (px), traffic (0..1), blank (0..1 grey placeholders), noSvc, date, acc (accuracy radius px), sheet
export function mapScreen(ctx, w, h, T, o = {}) {
  const { dot = -1, pan = 0, traffic = 0, blank = 0, noSvc = false, date = '', acc = 46, sheet = 1, route = 1, fetchK = 1, label = '' } = o;
  ctx.fillStyle = '#eaefe4'; ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.translate(0, pan % 140 - 0);
  ctx.fillStyle = '#cfe4c0'; [[.2, .3, 90], [.8, .55, 120], [.3, .8, 100], [.85, .08, 80], [.12, 1.1, 90]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.ellipse(x * w, y * h, r * 1.3, r, .4, 0, 7); ctx.fill(); });
  ctx.fillStyle = '#b8d8ee'; ctx.beginPath(); ctx.moveTo(w * .78, -140); ctx.bezierCurveTo(w * .9, h * .25, w * .74, h * .5, w, h * .62); ctx.lineTo(w, -140); ctx.fill();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const road = (pts, lw, col = '#fff') => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h)); ctx.strokeStyle = '#c9cfc6'; ctx.lineWidth = lw + 5; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke(); };
  road([[-.1, .2], [.4, .32], [1.1, .22]], 16); road([[-.1, .72], [.5, .6], [1.1, .8]], 18); road([[.12, -.1], [.2, .5], [.1, 1.2]], 12); road([[.82, -.1], [.74, .5], [.9, 1.2]], 12);
  ctx.restore();
  if (traffic > 0) { ctx.save(); ctx.globalAlpha = traffic; ctx.lineCap = 'round'; [[[-.1, .72], [.5, .6], [1.1, .8]], [[-.1, .2], [.4, .32], [1.1, .22]]].forEach((pts, k) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h)); ctx.strokeStyle = k ? '#f2a114' : '#e5453a'; ctx.lineWidth = 9; ctx.stroke(); }); ctx.restore(); }
  if (route > 0) { ctx.save(); ctx.globalAlpha = route; ctx.beginPath(); for (let i = 0; i <= 40; i++) { const [x, y] = routeAt(i / 40, w, h); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = 'rgba(30,70,200,.25)'; ctx.lineWidth = 22; ctx.stroke(); ctx.strokeStyle = '#2f62f0'; ctx.lineWidth = 12; ctx.stroke(); ctx.restore(); }
  if (blank > 0) { ctx.save(); ctx.globalAlpha = blank; ctx.fillStyle = '#dfe3ea'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#c9cfd9'; ctx.lineWidth = 2; for (let x = 0; x < w; x += 110) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); } for (let y = 0; y < h; y += 110) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    txt(ctx, 'NO MAP DATA', w / 2, h * .42, 38, '#8b93a3', 800); ctx.restore(); }
  if (fetchK < 1) { ctx.save(); ctx.fillStyle = '#dfe3ea'; const rows = 8, cols = 5, cw = w / cols, ch = h / rows; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const u = (r * cols + c) / (rows * cols); if (u > fetchK) { ctx.fillRect(c * cw + 2, r * ch + 2, cw - 4, ch - 4); } } ctx.restore(); }
  if (dot >= 0) { const [x, y] = routeAt(dot, w, h), pr = 1 + .12 * Math.sin(T * 3);
    ctx.fillStyle = 'rgba(47,98,240,.16)'; ctx.beginPath(); ctx.arc(x, y, acc * pr, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(47,98,240,.5)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 17, 0, 7); ctx.fill(); ctx.fillStyle = '#2f62f0'; ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); ctx.fill(); }
  if (label) { ctx.font = FONT(700, 24); ctx.fillStyle = '#5a6a55'; ctx.textAlign = 'center'; ctx.fillText(label, w * .3, h * .3); }
  // status bar and bottom sheet
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(0, 0, w, 78); txt(ctx, '10:42', 86, 54, 28, '#111', 800, 'center');
  if (noSvc) { rr(ctx, w - 214, 24, 168, 40, 20); ctx.fillStyle = '#e5453a'; ctx.fill(); txt(ctx, 'No Service', w - 130, 52, 22, '#fff', 800); } else { ctx.fillStyle = '#111'; for (let i = 0; i < 4; i++) ctx.fillRect(w - 130 + i * 14, 52 - i * 6, 8, 6 + i * 6); }
  if (sheet > 0) { ctx.fillStyle = '#fff'; rr(ctx, 0, h - 150, w, 150, [30, 30, 0, 0]); ctx.fill(); txt(ctx, '18 min', 40, h - 82, 44, '#1a7f3c', 800, 'left'); txt(ctx, '1.2 km · Ridge Trail', 40, h - 40, 26, '#555', 600, 'left');
    if (date) txt(ctx, date, w - 36, h - 82, 24, '#2f62f0', 800, 'right'); }
}
export function phoneX(ctx, T, x, y, s, screenOpts, { alpha = 1, rot = 0, pw = 500, ph = 1060 } = {}) {
  if (alpha <= 0) return; ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 60; rr(ctx, -pw / 2 - 16, -ph / 2 - 16, pw + 32, ph + 32, 84); ctx.fillStyle = '#16181c'; ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = '#6b7079'; ctx.lineWidth = 4; ctx.stroke();
  ctx.save(); rr(ctx, -pw / 2, -ph / 2, pw, ph, 70); ctx.clip(); ctx.translate(-pw / 2, -ph / 2); mapScreen(ctx, pw, ph, T, screenOpts); ctx.restore();
  rr(ctx, -62, -ph / 2 + 22, 124, 36, 18); ctx.fillStyle = '#000'; ctx.fill();
  const g = ctx.createLinearGradient(-pw / 2, -ph / 2, pw / 2, ph / 2); g.addColorStop(0, 'rgba(255,255,255,.1)'); g.addColorStop(.45, 'rgba(255,255,255,0)'); rr(ctx, -pw / 2, -ph / 2, pw, ph, 70); ctx.fillStyle = g; ctx.fill();
  ctx.restore();
}

// ---------- clocks ----------
export function dial(ctx, T, x, y, r, { kind = 'atomic', rate = 1, off = 0, a = 1, label = '' } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
  const at = kind === 'atomic', col = at ? GOLD_RGB : VIO_RGB;
  glowDot(ctx, 0, 0, r * 1.7, col, .6);
  const g = ctx.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r); g.addColorStop(0, '#26304a'); g.addColorStop(1, '#0c1120'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  ctx.strokeStyle = `rgb(${col})`; ctx.lineWidth = r * .06; ctx.stroke();
  for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = i % 3 ? 2 : 5; ctx.beginPath(); ctx.moveTo(Math.sin(an) * r * .82, -Math.cos(an) * r * .82); ctx.lineTo(Math.sin(an) * r * .93, -Math.cos(an) * r * .93); ctx.stroke(); }
  const t = T * rate + off, hand = (an, len, lw, c) => { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(an) * r * len, -Math.cos(an) * r * len); ctx.stroke(); };
  hand(t * .05, .5, r * .06, '#fff'); hand(t * .6, .72, r * .035, '#fff'); hand(t * 6.28 * (at ? 1 : 1), .8, r * .02, `rgb(${col})`);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, r * .06, 0, 7); ctx.fill();
  if (label) { ctx.letterSpacing = '2px'; txt(ctx, label, 0, r + 54, 28, `rgb(${col})`, 800, 'center', MONO); ctx.letterSpacing = '0px'; }
  ctx.restore();
}
// atomic clock box: a glass cylinder over a gold block with a pink readout
export function atomicClock(ctx, T, x, y, s = 1, { a = 1, glow = 0 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  if (glow > 0) glowDot(ctx, 0, -20, 220, GOLD_RGB, glow);
  let g = ctx.createLinearGradient(-110, 0, 110, 0); g.addColorStop(0, '#6d5018'); g.addColorStop(.5, '#e9c56a'); g.addColorStop(1, '#6d5018'); rr(ctx, -110, 10, 220, 90, 12); ctx.fillStyle = g; ctx.fill();
  g = ctx.createLinearGradient(-80, 0, 80, 0); g.addColorStop(0, '#8d97aa'); g.addColorStop(.35, '#f1f4fa'); g.addColorStop(.7, '#7f889a'); g.addColorStop(1, '#4c5466'); rr(ctx, -80, -78, 160, 96, 38); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = `rgba(${GOLD_RGB},${.5 + .4 * Math.sin(T * 6)})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -30, 30, 0, 7); ctx.stroke();
  rr(ctx, -84, 34, 76, 40, 6); ctx.fillStyle = '#ff5fb0'; ctx.fill(); txt(ctx, String(Math.floor(T * 9.19e3) % 10000).padStart(4, '0'), -46, 64, 28, '#2b0a1b', 800, 'center', MONO);
  ctx.fillStyle = '#27ae60'; for (let i = 0; i < 4; i++) ctx.fillRect(14 + i * 22, 52, 14, 8);
  ctx.restore();
}
// crystal (quartz) oscillator: small metal can with a vibrating crystal
export function quartz(ctx, T, x, y, s = 1, { a = 1, glow = 0 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s); if (glow > 0) glowDot(ctx, 0, 0, 180, VIO_RGB, glow);
  const g = ctx.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, '#9aa3b6'); g.addColorStop(.4, '#f2f4fa'); g.addColorStop(1, '#6a7388'); rr(ctx, -62, -36, 124, 72, 10); ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = '#313a52'; ctx.fillRect(-48, 36, 6, 34); ctx.fillRect(42, 36, 6, 34);
  ctx.save(); ctx.translate(0, 0); const v = Math.sin(T * 30) * 4; ctx.fillStyle = '#b99bff'; ctx.beginPath(); ctx.moveTo(-28 - v * .3, -18); ctx.lineTo(28 + v * .3, -18); ctx.lineTo(22 + v, 18); ctx.lineTo(-22 - v, 18); ctx.closePath(); ctx.globalAlpha *= .85; ctx.fill(); ctx.restore();
  ctx.fillStyle = '#313a52'; ctx.font = FONT(800, 20); ctx.textAlign = 'center'; ctx.fillText('32.768k', 0, 54);
  ctx.restore();
}

// ---------- hiker, mountain, people ----------
export function mountain(ctx, T, x, y, w, h, { snow = 1, col = '#3f5f3a', col2 = '#58814f' } = {}) {
  ctx.save(); ctx.translate(x, y); let g = ctx.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, col2); g.addColorStop(1, col); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w * .12, -h * .86); ctx.lineTo(0, -h); ctx.lineTo(w * .18, -h * .8); ctx.lineTo(w / 2, 0); ctx.closePath(); ctx.fill();
  if (snow > 0) { ctx.fillStyle = `rgba(255,255,255,${.9 * snow})`; ctx.beginPath(); ctx.moveTo(-w * .12, -h * .86); ctx.lineTo(0, -h); ctx.lineTo(w * .18, -h * .8); ctx.lineTo(w * .08, -h * .72); ctx.lineTo(0, -h * .8); ctx.lineTo(-w * .06, -h * .72); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
export function hiker(ctx, T, x, y, s = 1, { walk = 1, phone = 1, dir = 1 } = {}) { // simple walking hiker, side view
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s); const sw = Math.sin(T * 6 * walk), bob = Math.abs(Math.cos(T * 6 * walk)) * 6 * walk;
  ctx.translate(0, -bob); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const leg = (ph, col) => { const a = Math.sin(T * 6 * walk + ph) * .5 * walk; ctx.strokeStyle = col; ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(Math.sin(a) * 90, -150 + Math.cos(a) * 90); const k = Math.sin(a) * 90, ky = -150 + Math.cos(a) * 90; ctx.lineTo(k - Math.sin(a * .5) * 20 - 6 * walk, ky + 70); ctx.stroke(); ctx.fillStyle = '#2a2220'; rr(ctx, k - 30, ky + 62, 56, 24, 10); ctx.fill(); };
  leg(Math.PI, '#243043'); // back leg
  ctx.fillStyle = '#c23a2a'; rr(ctx, -62, -330, 70, 140, 20); ctx.fill(); ctx.fillStyle = '#4b6f8f'; rr(ctx, -74, -320, 54, 120, 16); ctx.fill(); // backpack
  ctx.fillStyle = '#e0642f'; rr(ctx, -40, -340, 84, 190, 28); ctx.fill(); // jacket
  leg(0, '#2f3f5c');
  ctx.fillStyle = '#f0c3a0'; ctx.beginPath(); ctx.arc(8, -378, 30, 0, 7); ctx.fill(); ctx.fillStyle = '#7a3b1a'; ctx.beginPath(); ctx.arc(2, -392, 30, Math.PI, 0); ctx.fill(); ctx.fillRect(-28, -392, 22, 14); // head + cap
  ctx.strokeStyle = '#e0642f'; ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(10, -310); ctx.lineTo(60, -270 - 10 * sw); ctx.lineTo(96, -330); ctx.stroke(); // arm holding the phone up
  if (phone) { ctx.save(); ctx.translate(104, -346); ctx.rotate(-.18); rr(ctx, -16, -34, 34, 62, 6); ctx.fillStyle = '#111'; ctx.fill(); rr(ctx, -11, -29, 24, 52, 4); ctx.fillStyle = '#2f62f0'; ctx.fill(); ctx.restore(); }
  ctx.restore();
}
export function person(ctx, x, y, s, { col = '#e0642f', skin = '#d9a07c', hair = '#222', a = 1 } = {}) { // small front-facing person with a phone, for the "millions listen" crowd
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col; rr(ctx, -30, -120, 60, 100, 24); ctx.fill(); ctx.fillStyle = '#243043'; rr(ctx, -26, -26, 22, 56, 8); ctx.fill(); rr(ctx, 4, -26, 22, 56, 8); ctx.fill();
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, -150, 28, 0, 7); ctx.fill(); ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(0, -158, 28, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#111'; rr(ctx, 16, -96, 22, 38, 5); ctx.fill(); ctx.fillStyle = '#2f62f0'; rr(ctx, 19, -92, 16, 30, 3); ctx.fill(); ctx.restore();
}
export function dishAnt(ctx, T, x, y, s = 1, { a = 1, rot = -.5, glow = 0 } = {}) { // home satellite dish on a roof
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s); if (glow > 0) glowDot(ctx, 0, -60, 200, SKY_RGB, glow);
  ctx.fillStyle = '#3a2f2c'; ctx.beginPath(); ctx.moveTo(-160, 0); ctx.lineTo(0, -120); ctx.lineTo(160, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#b65a43'; ctx.fillRect(-120, 0, 240, 130); ctx.fillStyle = '#ffd88a'; rr(ctx, -70, 36, 56, 56, 6); ctx.fill();
  ctx.strokeStyle = '#8d96a8'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(60, -80); ctx.lineTo(60, -20); ctx.stroke();
  ctx.save(); ctx.translate(60, -90); ctx.rotate(rot + .05 * Math.sin(T * .8)); const g = ctx.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, '#dfe5f0'); g.addColorStop(1, '#8a93a6'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 62, 20, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#444b5c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -46); ctx.stroke(); ctx.restore();
  ctx.restore();
}
export function carTop(ctx, x, y, s, col, { a = 1 } = {}) { // little car seen from the side, for the jam
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col; rr(ctx, -60, -26, 120, 34, 10); ctx.fill(); rr(ctx, -34, -52, 70, 34, 12); ctx.fill(); ctx.fillStyle = 'rgba(200,230,255,.85)'; rr(ctx, -26, -46, 24, 22, 5); ctx.fill(); rr(ctx, 4, -46, 26, 22, 5); ctx.fill();
  ctx.fillStyle = '#111'; [-34, 34].forEach(wx => { ctx.beginPath(); ctx.arc(wx, 8, 14, 0, 7); ctx.fill(); }); ctx.fillStyle = '#ff3b3b'; ctx.fillRect(-62, -18, 6, 10); ctx.restore();
}
