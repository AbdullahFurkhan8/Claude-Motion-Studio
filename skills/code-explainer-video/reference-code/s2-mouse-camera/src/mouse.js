// Illustrations for the "your mouse is a camera" explainer. Everything is drawn in code and depends only on
// its inputs + time T (deterministic). Original drawings only: no brand logos.
import { W, H, clamp, lerp, eo, eio, eback, hash, rr, proj3 } from './lib.js';
import { FONT, MONO, txt, tw, card } from './kit.js';
export const LIME = '#d8f24a', LIME_RGB = '216,242,74', TEAL = '#4fe3b0', TEAL_RGB = '79,227,176', RED_RGB = '255,96,96', INK = '#101217';

// ---------- desk-surface texture (what the sensor sees) ----------
const vh = (i, j) => hash(i * 57.31 + j * 13.17, 7);
function vn(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(vh(ix, iy), vh(ix + 1, iy), sx), lerp(vh(ix, iy + 1), vh(ix + 1, iy + 1), sx), sy);
}
const SP = 6; // speck cell size (in sensor pixels)
const speckAt = (sx, sy) => hash(sx * 3.17 + sy * 17.71, 2) > .5 ? [(sx + .2 + .6 * hash(sx, sy + 1)) * SP, (sy + .2 + .6 * hash(sy, sx + 2)) * SP, 1.2 + 1.3 * hash(sx + sy * 7, 4)] : null;
export function surf(x, y) {
  let v = .2 + .5 * vn(x / 6, y / 6) + .3 * vn(x / 2.5 + 11, y / 2.5 + 3) + .12 * vn(x + 5, y + 9);
  const sx = Math.floor(x / SP), sy = Math.floor(y / SP);
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const s = speckAt(sx + i, sy + j); if (!s) continue; const d = Math.hypot(x - s[0], y - s[1]); if (d < s[2]) v -= .55 * (1 - d / s[2]); }
  return clamp(v);
}
export function specks(ox, oy, n) { // speck centres inside a frame window
  const out = [];
  for (let sx = Math.floor(ox / SP) - 1; sx <= Math.floor((ox + n) / SP) + 1; sx++) for (let sy = Math.floor(oy / SP) - 1; sy <= Math.floor((oy + n) / SP) + 1; sy++) {
    const s = speckAt(sx, sy); if (s && s[0] > ox + 1 && s[0] < ox + n - 1 && s[1] > oy + 1 && s[1] < oy + n - 1) out.push(s);
  }
  return out;
}
const dustDot = (x, y) => { // tiny bright dust on glass (laser view)
  const cx = Math.floor(x / 5), cy = Math.floor(y / 5); let v = 0;
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const a = cx + i, b = cy + j; if (hash(a * 9.1 + b * 3.3, 5) < .55) continue;
    const px = (a + .5 + .4 * (hash(a, b) - .5)) * 5, py = (b + .5 + .4 * (hash(b, a) - .5)) * 5, d = Math.hypot(x - px, y - py); v = Math.max(v, clamp(1 - d / .9)); }
  return v;
};
// n x n sensor frame of the surface at offset (ox, oy), drawn as a size x size pixel grid.
// mode: 'desk' | 'glass' | 'laser' | 'blur'
export function pixFrame(ctx, x, y, size, n, ox, oy, { mode = 'desk', grid = 1, a = 1, border = 'rgba(216,242,74,.8)', bw = 2.5, seed = 0 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  const cs = size / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const u = ox + (i + .5) * 18 / n, w = oy + (j + .5) * 18 / n; let v, r, g, b;
    if (mode === 'glass') { v = .5 + .035 * (hash(i * 31 + j, seed) - .5); }
    else if (mode === 'blur') { v = .38 + .22 * vn(u / 9, w / 9); }
    else if (mode === 'laser') { v = .05 + .95 * dustDot(u, w); }
    else v = surf(u, w);
    r = Math.round(30 + 215 * v); g = Math.round(32 + 218 * v); b = Math.round(30 + 205 * v);
    ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fillRect(x + i * cs, y + j * cs, cs + .6, cs + .6);
  }
  if (grid > 0 && cs > 5) {
    ctx.strokeStyle = `rgba(10,12,16,${.28 * grid})`; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 1; i < n; i++) { ctx.moveTo(x + i * cs, y); ctx.lineTo(x + i * cs, y + size); ctx.moveTo(x, y + i * cs); ctx.lineTo(x + size, y + i * cs); }
    ctx.stroke();
  }
  if (border) { ctx.strokeStyle = border; ctx.lineWidth = bw; ctx.strokeRect(x, y, size, size); }
  ctx.restore();
}
// lime corner brackets around a rect
export function brackets(ctx, x, y, w, h, a = 1, len = 34, col = LIME_RGB) {
  if (a <= 0) return; ctx.save(); ctx.strokeStyle = `rgba(${col},${a})`; ctx.lineWidth = 5; ctx.lineCap = 'round'; const L = len;
  ctx.beginPath(); ctx.moveTo(x, y + L); ctx.lineTo(x, y); ctx.lineTo(x + L, y); ctx.moveTo(x + w - L, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + L);
  ctx.moveTo(x + w, y + h - L); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - L, y + h); ctx.moveTo(x + L, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - L); ctx.stroke(); ctx.restore();
}

// ---------- labels & cards ----------
// white tag with a lime dot (reference style) and optional leader line to (lx, ly)
export function tag(ctx, x, y, s, a = 1, lx, ly, { size = 24, dot = LIME, bg = 'rgba(246,247,242,.97)', fg = INK } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a);
  ctx.font = MONO(700, size); ctx.letterSpacing = '2px'; const w = ctx.measureText(s).width + size * 2.2, h = size * 1.75;
  if (lx !== undefined) { ctx.strokeStyle = 'rgba(246,247,242,.85)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y); const k = eo(a); ctx.lineTo(lerp(x, lx, k), lerp(y, ly, k)); ctx.stroke();
    ctx.fillStyle = LIME; ctx.beginPath(); ctx.arc(lerp(x, lx, k), lerp(y, ly, k), 7, 0, 7); ctx.fill(); }
  const s0 = .85 + .15 * eback(clamp(a)); ctx.translate(x, y); ctx.scale(s0, s0);
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  rr(ctx, -w / 2, -h / 2, w, h, 10); ctx.fillStyle = bg; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = dot; ctx.beginPath(); ctx.arc(-w / 2 + size * .8, 0, size * .26, 0, 7); ctx.fill();
  ctx.fillStyle = fg; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, -w / 2 + size * 1.4, 1);
  ctx.restore();
}
// premium white counter card: small caps label, big mono value, unit, lime progress bar
export function counter(ctx, T, x, y, w, label, value, unit = '', { a = 1, bar = -1, pulse = 0, h = 150, sub = '' } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a);
  const s = 1 + .04 * pulse; ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-x - w / 2, -y - h / 2);
  card(ctx, x, y, w, h, { r: 22, fill: '#f6f7f3', dark: true, stroke: 'rgba(255,255,255,.5)' });
  ctx.letterSpacing = '3px'; txt(ctx, label, x + 30, y + 40, 19, 'rgba(20,22,28,.55)', 700, 'left', MONO); ctx.letterSpacing = '0px';
  txt(ctx, value, x + 28, y + 106, 62, INK, 800, 'left', MONO);
  if (unit) txt(ctx, unit, x + 40 + tw(ctx, value, 62, 800, MONO), y + 104, 26, 'rgba(20,22,28,.6)', 600, 'left', MONO);
  if (sub) txt(ctx, sub, x + w - 28, y + 40, 18, 'rgba(20,22,28,.45)', 700, 'right', MONO);
  if (bar >= 0) { rr(ctx, x + 30, y + h - 26, w - 60, 8, 4); ctx.fillStyle = 'rgba(20,22,28,.08)'; ctx.fill(); if (bar > 0) { rr(ctx, x + 30, y + h - 26, Math.max(8, (w - 60) * clamp(bar)), 8, 4); ctx.fillStyle = '#b7d400'; ctx.fill(); } }
  ctx.restore();
}
// dark glass card
export function glassCard(ctx, x, y, w, h, { r = 22, a = 1, stroke = 'rgba(255,255,255,.14)' } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; rr(ctx, x, y, w, h, r); ctx.fillStyle = 'rgba(18,20,26,.92)'; ctx.fill(); ctx.shadowColor = 'transparent';
  const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, 'rgba(255,255,255,.07)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
}
export function badge(ctx, x, y, s, rgb, a = 1, size = 26) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); const k = eback(clamp(a)); ctx.translate(x, y); ctx.scale(k, k);
  ctx.font = MONO(800, size); ctx.letterSpacing = '3px'; const w = ctx.measureText(s).width + size * 1.4, h = size * 1.7;
  ctx.shadowColor = `rgba(${rgb},.6)`; ctx.shadowBlur = 24; rr(ctx, -w / 2, -h / 2, w, h, 9); ctx.fillStyle = `rgb(${rgb})`; ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#0c0e12'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 3, 1); ctx.restore();
}
export function glow(ctx, x, y, r, rgb, a = 1) {
  if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${.6 * a})`); g.addColorStop(.35, `rgba(${rgb},${.2 * a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
// small macOS-like arrow pointer
export function pointer(ctx, x, y, s = 1, a = 1, press = 0) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s * (1 - .12 * press), s * (1 - .12 * press));
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.lineTo(8, 23); ctx.lineTo(14, 35); ctx.lineTo(19, 33); ctx.lineTo(13, 21); ctx.lineTo(23, 21); ctx.closePath(); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.stroke(); ctx.restore();
}

// ---------- the desk (perspective) ----------
export const deskCam = ({ tx = 0, ty = 0, pitch = .9, dist = 8, f = 1500, cx = 540, cy = 1300, yaw = 0 } = {}) => proj3({ yaw, pitch, dist, f, cx, cy, tx, ty });
const quad = (ctx, pts) => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); };
export function desk(ctx, T, P, { pad = 1, glass = 0, code = null, lamp = 1 } = {}) {
  ctx.fillStyle = '#09090b'; ctx.fillRect(-W, -H, W * 3, H * 3);
  for (let k = -10; k < 40; k++) { // walnut planks running left-right
    const y0 = k * .62, a = P(0, y0), b = P(0, y0 + .62); if (!a || !b) continue;
    const top = b[1], bot = a[1], sh = hash(k, 3), fog = clamp(1.25 - a[2] / 26, .2, 1);
    ctx.fillStyle = `rgb(${(66 + 26 * sh) * fog | 0},${(38 + 14 * sh) * fog | 0},${(24 + 9 * sh) * fog | 0})`; ctx.fillRect(-W, top, W * 3, bot - top + 1);
    for (let g = 0; g < 7; g++) { // grain streaks
      const gy = y0 + .62 * hash(k, g + 10), gx = -9 + 18 * hash(k, g + 20), gl = 1.5 + 4 * hash(k, g + 30), p0 = P(gx, gy), p1 = P(gx + gl, gy); if (!p0 || !p1) continue;
      ctx.strokeStyle = `rgba(${hash(k, g) > .5 ? '255,200,150' : '10,5,2'},${.07 * fog})`; ctx.lineWidth = Math.max(1, 900 / p0[2] * .02); ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
    }
    ctx.fillStyle = `rgba(0,0,0,${.55 * fog})`; ctx.fillRect(-W, top, W * 3, Math.max(1.2, 160 / a[2]));
  }
  // warm lamp pool + falloff
  if (lamp > 0) { const lp = P(-1.5, 3.5), g = ctx.createRadialGradient(lp[0], lp[1], 20, lp[0], lp[1], 1100); g.addColorStop(0, `rgba(255,190,130,${.16 * lamp})`); g.addColorStop(1, 'rgba(255,190,130,0)'); ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3); }
  // keyboard (back-left, partly off-screen)
  const kq = [P(-8.2, 2.7), P(-3.1, 2.7), P(-3.1, 4.5), P(-8.2, 4.5)];
  if (kq.every(Boolean)) {
    const lift = (x, y) => { const p = P(x, y, .18); return p; };
    quad(ctx, [lift(-8.2, 2.7), lift(-3.1, 2.7), lift(-3.1, 4.5), lift(-8.2, 4.5)]); ctx.fillStyle = '#121317'; ctx.fill();
    quad(ctx, [kq[0], kq[1], lift(-3.1, 2.7), lift(-8.2, 2.7)]); ctx.fillStyle = '#060608'; ctx.fill();
    for (let r = 0; r < 5; r++) for (let c = 0; c < 15; c++) { const x0 = -8.05 + c * .33, y0 = 2.85 + r * .33, q = [P(x0, y0, .24), P(x0 + .27, y0, .24), P(x0 + .27, y0 + .27, .24), P(x0, y0 + .27, .24)]; if (!q.every(Boolean)) continue;
      quad(ctx, q); ctx.fillStyle = (r + c) % 7 ? '#24262c' : '#2c2f36'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1; ctx.stroke(); }
  }
  if (pad > 0) { // mousepad / glass top
    const c = [P(-2.7, -2.1), P(2.7, -2.1), P(2.7, 2.1), P(-2.7, 2.1)];
    ctx.save(); ctx.globalAlpha *= pad;
    const t0 = P(-2.7, -2.1, -.035), t1 = P(2.7, -2.1, -.035);
    quad(ctx, [c[0], c[1], t1, t0]); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill();
    quad(ctx, c); const g = ctx.createLinearGradient(0, c[2][1], 0, c[0][1]); g.addColorStop(0, '#20252f'); g.addColorStop(1, '#151920'); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(160,175,200,.22)'; ctx.lineWidth = 2; ctx.stroke();
    if (code) { ctx.save(); quad(ctx, c); ctx.clip(); code(ctx, P); ctx.restore(); }
    ctx.restore();
  }
  if (glass > 0) { // glass table top over the whole desk
    ctx.save(); ctx.globalAlpha *= glass;
    const c = [P(-6, -3), P(6, -3), P(6, 4.2), P(-6, 4.2)];
    quad(ctx, c); const g = ctx.createLinearGradient(0, c[2][1], 0, c[0][1]); g.addColorStop(0, 'rgba(190,215,235,.16)'); g.addColorStop(1, 'rgba(160,190,215,.30)'); ctx.fillStyle = g; ctx.fill();
    ctx.save(); quad(ctx, c); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { const x0 = -900 + i * 520 + ((T * 40) % 520); ctx.fillStyle = `rgba(220,235,255,${.06 + .03 * i})`; ctx.beginPath(); ctx.moveTo(x0, 300); ctx.lineTo(x0 + 140, 300); ctx.lineTo(x0 + 640, 2000); ctx.lineTo(x0 + 500, 2000); ctx.fill(); }
    ctx.restore();
    const e0 = P(-6, -3), e1 = P(6, -3); ctx.strokeStyle = 'rgba(200,240,235,.75)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(e0[0], e0[1]); ctx.lineTo(e1[0], e1[1]); ctx.stroke();
    const f0 = P(-6, -3, -.12), f1 = P(6, -3, -.12); quad(ctx, [e0, e1, f1, f0]); ctx.fillStyle = 'rgba(120,200,190,.25)'; ctx.fill();
    ctx.restore();
  }
  const v = ctx.createRadialGradient(W / 2, H * .55, H * .3, W / 2, H * .55, H * .85); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = v; ctx.fillRect(-W, -H, W * 3, H * 3);
}
// monitor standing on the desk at world (x, y); screenFn(ctx, sx, sy, sw, sh). Returns the screen rect.
export function monitor(ctx, T, P, { x = 0, y = 5.4, w = 6.2, h = 3.5, stand = 1.0 } = {}, screenFn) {
  const b = P(x, y, 0); if (!b) return null; const k = 1500 / b[2];
  const sw = w * k, sh = h * k, sx = b[0] - sw / 2, sy = b[1] - stand * k - sh;
  // shadow + stand
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(b[0], b[1] + 4, 1.4 * k, .22 * k, 0, 0, 7); ctx.fill();
  let g = ctx.createLinearGradient(b[0] - k, 0, b[0] + k, 0); g.addColorStop(0, '#16171b'); g.addColorStop(.5, '#2b2d33'); g.addColorStop(1, '#121316'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(b[0] - 1.1 * k, b[1]); ctx.lineTo(b[0] + 1.1 * k, b[1]); ctx.lineTo(b[0] + .8 * k, b[1] - .14 * k); ctx.lineTo(b[0] - .8 * k, b[1] - .14 * k); ctx.fill();
  rr(ctx, b[0] - .22 * k, sy + sh - 10, .44 * k, stand * k - .1 * k + 10, 6); ctx.fill();
  // bias light behind the screen
  const bl = ctx.createRadialGradient(b[0], sy + sh * .5, 10, b[0], sy + sh * .5, sw * .75); bl.addColorStop(0, 'rgba(120,140,190,.10)'); bl.addColorStop(1, 'rgba(120,140,190,0)'); ctx.fillStyle = bl; ctx.fillRect(sx - sw, sy - sh, sw * 3, sh * 3);
  // body
  ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16; rr(ctx, sx - 10, sy - 10, sw + 20, sh + 20, 12); ctx.fillStyle = '#0b0c0f'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.save(); rr(ctx, sx, sy, sw, sh, 4); ctx.clip(); screenFn && screenFn(ctx, sx, sy, sw, sh);
  const sg = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh); sg.addColorStop(0, 'rgba(255,255,255,.07)'); sg.addColorStop(.4, 'rgba(255,255,255,0)'); ctx.fillStyle = sg; ctx.fillRect(sx, sy, sw, sh); ctx.restore();
  ctx.restore();
  return { x: sx, y: sy, w: sw, h: sh, k };
}
// default desktop wallpaper + dock
export function wallpaper(ctx, T, x, y, w, h, { dock = 1, dim = 0 } = {}) {
  let g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#2a2e38'); g.addColorStop(1, '#0f1116'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  g = ctx.createRadialGradient(x + w * (.3 + .05 * Math.sin(T * .3)), y + h * .2, 10, x + w * .3, y + h * .2, w * .8); g.addColorStop(0, 'rgba(150,170,220,.18)'); g.addColorStop(1, 'rgba(150,170,220,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  if (dock > 0) { const dw = w * .3, dh = h * .055, dx = x + w / 2 - dw / 2, dy = y + h - dh - h * .03; rr(ctx, dx, dy, dw, dh, dh / 2); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fill();
    for (let i = 0; i < 7; i++) { const s = dh * .66; rr(ctx, dx + dw * .07 + i * (dw * .86 - s) / 6, dy + dh * .17, s, s, s * .25); ctx.fillStyle = `hsla(${200 + i * 22},40%,${60 + 6 * (i % 2)}%,.8)`; ctx.fill(); }
    txt(ctx, '9:41', x + w - 14, y + h - h * .045, Math.max(10, h * .04), 'rgba(255,255,255,.6)', 600, 'right'); }
  if (dim > 0) { ctx.fillStyle = `rgba(0,0,0,${dim})`; ctx.fillRect(x, y, w, h); }
}

// ---------- the mouse, seen from above (glossy, semi-3D) ----------
function mpath(ctx, w, l) {
  ctx.beginPath(); ctx.moveTo(0, -l / 2);
  ctx.bezierCurveTo(w * .4, -l / 2, w * .5, -l * .24, w * .5, l * .06); ctx.bezierCurveTo(w * .5, l * .36, w * .3, l * .5, 0, l * .5);
  ctx.bezierCurveTo(-w * .3, l * .5, -w * .5, l * .36, -w * .5, l * .06); ctx.bezierCurveTo(-w * .5, -l * .24, -w * .4, -l / 2, 0, -l / 2); ctx.closePath();
}
// (x, y) = ground point under the mouse centre; s = length in px. rot turns it on the ground; sq = perspective squash.
export function mouseTop(ctx, T, x, y, s, o = {}) {
  const { rot = 0, sq = .62, h = .2, lift = 0, xray = 0, outline = 0, press = 0, cableTo = null, a = 1, led = 0, chipHi = 0, shadow = 1 } = o;
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  const l = s, w = s * .6, H3 = h * s, up = lift * s;
  const at = (dz, fn) => { ctx.save(); ctx.translate(x, y - dz); ctx.scale(1, sq); ctx.rotate(rot); fn(); ctx.restore(); };
  // cable
  if (cableTo) { const nose = [x + Math.sin(rot) * l * .5, y - up - H3 * .3 - Math.cos(rot) * l * .5 * sq]; ctx.save(); ctx.lineCap = 'round';
    const pth = () => { ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.bezierCurveTo(nose[0] + Math.sin(rot) * 120, nose[1] - 140, cableTo[0] + 60, cableTo[1] + 160, cableTo[0], cableTo[1]); };
    pth(); ctx.strokeStyle = '#08090b'; ctx.lineWidth = Math.max(3, s * .045); ctx.stroke(); pth(); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = Math.max(1, s * .012); ctx.stroke(); ctx.restore(); }
  // ground shadow + LED spill
  if (shadow > 0) at(0, () => { const r = l * (.62 + lift * .8), g = ctx.createRadialGradient(0, 0, 1, 0, 0, r); const sa = .7 * shadow / (1 + lift * 5); g.addColorStop(0, `rgba(0,0,0,${sa})`); g.addColorStop(.6, `rgba(0,0,0,${sa * .5})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, r * .72, r, 0, 0, 7); ctx.fill(); });
  if (led > 0) at(0, () => { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, -l * .08, 1, 0, -l * .08, l * .75); g.addColorStop(0, `rgba(${LIME_RGB},${.5 * led / (1 + lift * 4)})`); g.addColorStop(1, `rgba(${LIME_RGB},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -l * .08, w * .9, l * .75, 0, 0, 7); ctx.fill(); });
  const body = 1 - outline, shell = body * (1 - .78 * xray);
  if (shell > 0) {
    ctx.save(); ctx.globalAlpha *= shell;
    for (let k = 0; k <= 10; k++) { const dz = up + H3 * k / 10; at(dz, () => { mpath(ctx, w * (1 - .03 * (1 - k / 10)), l * (1 - .03 * (1 - k / 10))); const c = Math.round(lerp(120, 205, k / 10)); ctx.fillStyle = `rgb(${c},${c + 4},${c + 10})`; ctx.fill(); }); }
    at(up + H3, () => { // glossy top
      mpath(ctx, w, l); const g = ctx.createRadialGradient(-w * .14, -l * .12, 2, 0, 0, l * .62); g.addColorStop(0, '#ffffff'); g.addColorStop(.45, '#eef0f2'); g.addColorStop(.85, '#c9ced6'); g.addColorStop(1, '#a8aeb8'); ctx.fillStyle = g; ctx.fill();
      ctx.save(); mpath(ctx, w, l); ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(-w * .17, -l * .1, w * .07, l * .26, -.12, 0, 7); ctx.fill();
      if (press > 0) { ctx.fillStyle = `rgba(40,60,90,${.18 * press})`; ctx.beginPath(); ctx.moveTo(0, -l / 2); ctx.lineTo(0, -l * .06); ctx.lineTo(-w * .6, -l * .06); ctx.lineTo(-w * .6, -l / 2); ctx.fill(); }
      ctx.restore();
      ctx.strokeStyle = 'rgba(60,70,85,.28)'; ctx.lineWidth = Math.max(1, s * .008); ctx.beginPath(); ctx.moveTo(0, -l / 2); ctx.lineTo(0, -l * .1);
      ctx.moveTo(-w * .49, -l * .02); ctx.quadraticCurveTo(0, -l * .12, w * .49, -l * .02); ctx.stroke();
      rr(ctx, -w * .065, -l * .4, w * .13, l * .2, w * .06); ctx.fillStyle = '#2b2f37'; ctx.fill();
      ctx.save(); rr(ctx, -w * .065, -l * .4, w * .13, l * .2, w * .06); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.22)';
      for (let i = 0; i < 6; i++) { const yy = -l * .4 + ((i * l * .04 + T * l * .02) % (l * .24)); ctx.fillRect(-w * .065, yy, w * .13, Math.max(1, l * .008)); } ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = Math.max(1, s * .006); mpath(ctx, w * .985, l * .985); ctx.stroke();
    });
    ctx.restore();
  }
  if (xray > 0 && body > 0) at(up + H3 * .5, () => { ctx.save(); ctx.globalAlpha *= xray * body; internals(ctx, T, w, l, { led: Math.max(led, .7), chipHi }); ctx.restore();
    ctx.strokeStyle = `rgba(${LIME_RGB},${.85 * xray * body})`; ctx.lineWidth = Math.max(2, s * .01); mpath(ctx, w, l); ctx.stroke(); });
  if (outline > 0) at(up, () => { ctx.globalAlpha *= outline; ctx.strokeStyle = 'rgba(240,244,250,.9)'; ctx.lineWidth = Math.max(2.5, s * .018); ctx.setLineDash([s * .05, s * .035]); ctx.lineDashOffset = -T * 30; mpath(ctx, w, l); ctx.stroke(); ctx.setLineDash([]); });
  ctx.restore();
}
// circuit board + optical parts inside the shell (top view, local mouse coords)
export function internals(ctx, T, w, l, { led = 1, chipHi = 0, dsp = 0 } = {}) {
  ctx.save(); mpath(ctx, w * .9, l * .9); ctx.clip();
  rr(ctx, -w * .4, -l * .36, w * .8, l * .66, w * .08); ctx.fillStyle = '#0f2a22'; ctx.fill(); ctx.strokeStyle = 'rgba(120,220,170,.35)'; ctx.lineWidth = Math.max(1, w * .006); ctx.stroke();
  ctx.strokeStyle = 'rgba(160,230,190,.28)'; ctx.lineWidth = Math.max(1, w * .006);
  for (let i = 0; i < 9; i++) { const yy = -l * .3 + i * l * .065; ctx.beginPath(); ctx.moveTo(-w * .36, yy); ctx.lineTo(-w * (.16 + .1 * hash(i)), yy); ctx.lineTo(-w * .08, yy + l * .03); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * .36, yy + l * .02); ctx.lineTo(w * (.18 + .08 * hash(i, 2)), yy + l * .02); ctx.stroke(); }
  for (let i = 0; i < 12; i++) { ctx.fillStyle = 'rgba(200,210,220,.5)'; ctx.fillRect(-w * .3 + w * .6 * hash(i, 4), -l * .3 + l * .58 * hash(i, 5), w * .03, w * .018); }
  // DSP / MCU
  rr(ctx, w * .08, l * .1, w * .2, w * .2, w * .02); ctx.fillStyle = '#16181d'; ctx.fill(); ctx.strokeStyle = dsp > 0 ? `rgba(${TEAL_RGB},${.5 + .5 * dsp})` : 'rgba(255,255,255,.25)'; ctx.lineWidth = Math.max(1, w * .01); ctx.stroke();
  // camera chip (sensor) with pins
  const cw = w * .26, cx = -cw / 2, cy = -l * .12;
  ctx.fillStyle = '#c9a24a'; for (let i = 0; i < 6; i++) { ctx.fillRect(cx - w * .04, cy + i * cw * .16 + cw * .05, w * .04, cw * .06); ctx.fillRect(cx + cw, cy + i * cw * .16 + cw * .05, w * .04, cw * .06); }
  rr(ctx, cx, cy, cw, cw, w * .025); ctx.fillStyle = chipHi > 0 ? `rgb(${Math.round(lerp(22, 216, chipHi))},${Math.round(lerp(24, 242, chipHi))},${Math.round(lerp(30, 74, chipHi))})` : '#16181d'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = Math.max(1, w * .008); ctx.stroke();
  // lens window under the chip
  ctx.beginPath(); ctx.arc(0, cy + cw / 2, cw * .26, 0, 7); const lg = ctx.createRadialGradient(-cw * .08, cy + cw * .4, 1, 0, cy + cw / 2, cw * .26); lg.addColorStop(0, '#e9f6ff'); lg.addColorStop(1, '#5d88a8'); ctx.fillStyle = lg; ctx.fill();
  // LED
  const lx = -w * .02, ly = -l * .3; ctx.fillStyle = `rgb(${LIME_RGB})`; ctx.beginPath(); ctx.arc(lx, ly, w * .035, 0, 7); ctx.fill(); ctx.restore();
  glow(ctx, lx, ly, w * .3, LIME_RGB, led * (.8 + .2 * Math.sin(T * 6)));
}
// underside (flat 2D, nose up). led 0..1 glow, lbl alpha of the sticker
export function mouseBottom(ctx, T, x, y, s, { led = 0, lbl = 1, sx = 1 } = {}) {
  const l = s, w = s * .6; ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1);
  ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 30; mpath(ctx, w * 1.02, l * 1.02); ctx.fillStyle = '#d9dde3'; ctx.fill(); ctx.shadowColor = 'transparent';
  mpath(ctx, w * .96, l * .96); let g = ctx.createLinearGradient(-w / 2, -l / 2, w / 2, l / 2); g.addColorStop(0, '#2a2d34'); g.addColorStop(1, '#121318'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); mpath(ctx, w * .96, l * .96); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.fillRect(-w, -l * .5, w * 2, l * .06); ctx.restore();
  // glide feet
  ctx.fillStyle = '#4a4e57'; rr(ctx, -w * .3, -l * .44, w * .6, l * .05, l * .025); ctx.fill(); rr(ctx, -w * .32, l * .38, w * .64, l * .05, l * .025); ctx.fill();
  // sensor recess + lens
  const sy = -l * .1; ctx.fillStyle = '#07080a'; rr(ctx, -w * .16, sy - w * .18, w * .32, w * .36, w * .06); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, sy, w * .085, 0, 7); g = ctx.createRadialGradient(-w * .03, sy - w * .03, 1, 0, sy, w * .085); g.addColorStop(0, '#f1f8ff'); g.addColorStop(.5, '#7f9fb8'); g.addColorStop(1, '#1d2731'); ctx.fillStyle = g; ctx.fill();
  if (led > 0) { const lp = [0, sy - w * .12]; ctx.fillStyle = `rgba(${LIME_RGB},${.4 + .6 * led})`; rr(ctx, -w * .1, sy - w * .16, w * .2, w * .07, w * .03); ctx.fill(); glow(ctx, lp[0], lp[1] + w * .06, w * .9 * (1 + .05 * Math.sin(T * 7)), LIME_RGB, led); }
  // sticker
  if (lbl > 0) { ctx.globalAlpha *= lbl; const ly = l * .12; ctx.letterSpacing = '2px'; txt(ctx, 'OPTICAL MOUSE', 0, ly, w * .07, 'rgba(255,255,255,.75)', 800, 'center', MONO); ctx.letterSpacing = '0px';
    txt(ctx, 'MODEL M-1 · 5V ⎓ 100mA', 0, ly + w * .1, w * .045, 'rgba(255,255,255,.45)', 600, 'center', MONO);
    for (let i = 0; i < 30; i++) { const bw = (hash(i, 3) > .5 ? 2 : 1) * w * .006; ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(-w * .2 + i * w * .0135, ly + w * .15, bw, w * .08); } }
  ctx.restore();
}

// ---------- side cross-section ----------
// (x, y) = point on the desk under the sensor; s = mouse length. lift raises the mouse; beam/focus 0..1.
export function sideCut(ctx, T, x, y, s, { lift = 0, beam = 1, rays = 1, xray = 1, labels = null, desk = 1, blur = 0 } = {}) {
  // desk surface band with fibres
  if (desk > 0) {
    const g = ctx.createLinearGradient(0, y, 0, y + 420); g.addColorStop(0, '#3c2416'); g.addColorStop(1, '#0c0705'); ctx.fillStyle = g; ctx.fillRect(-200, y, W + 400, 900);
    ctx.fillStyle = 'rgba(255,220,180,.18)'; ctx.fillRect(-200, y, W + 400, 2);
    for (let i = 0; i < 70; i++) { const fx = -100 + i * 18 + 6 * hash(i), fh = 3 + 9 * hash(i, 2); ctx.strokeStyle = `rgba(230,200,160,${.25 + .3 * hash(i, 3)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx, y + 1); ctx.lineTo(fx + 6 * (hash(i, 4) - .5), y - fh); ctx.stroke(); }
  }
  const up = lift * s * .45, by = y - 6 - up, L = s, Hh = s * .42;
  const prof = () => { ctx.beginPath(); ctx.moveTo(x - L * .55, by); ctx.lineTo(x + L * .45, by); ctx.bezierCurveTo(x + L * .52, by, x + L * .52, by - Hh * .7, x + L * .36, by - Hh * .95);
    ctx.bezierCurveTo(x + L * .15, by - Hh * 1.12, x - L * .25, by - Hh * .9, x - L * .5, by - Hh * .42); ctx.bezierCurveTo(x - L * .58, by - Hh * .3, x - L * .6, by, x - L * .55, by); ctx.closePath(); };
  // shadow on desk
  ctx.save(); const sg = ctx.createRadialGradient(x, y, 2, x, y, L * .6 * (1 + lift)); sg.addColorStop(0, `rgba(0,0,0,${.55 / (1 + lift * 3)})`); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(x, y + 4, L * .6 * (1 + lift), 22, 0, 0, 7); ctx.fill(); ctx.restore();
  // beam: LED low on the left, skimming to the spot under the lens
  const led = [x - L * .3, by - Hh * .1], spot = [x, y];
  if (beam > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const spread = 12 + 70 * lift, g = ctx.createLinearGradient(led[0], led[1], spot[0], spot[1]); g.addColorStop(0, `rgba(${LIME_RGB},${.75 * beam})`); g.addColorStop(1, `rgba(${LIME_RGB},${.35 * beam})`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(led[0], led[1] - 6); ctx.lineTo(spot[0] + spread, spot[1]); ctx.lineTo(spot[0] - spread * .6, spot[1]); ctx.lineTo(led[0], led[1] + 6); ctx.fill();
    ctx.fillStyle = `rgba(${LIME_RGB},${.5 * beam / (1 + lift * 2)})`; ctx.beginPath(); ctx.ellipse(spot[0], spot[1], 70 + 90 * lift, 9, 0, 0, 7); ctx.fill();
    glow(ctx, spot[0], spot[1], 180 + 160 * lift, LIME_RGB, beam * .9 / (1 + lift * 2));
    ctx.restore();
  }
  // shell
  ctx.save(); prof(); const g = ctx.createLinearGradient(x, by - Hh, x, by); g.addColorStop(0, `rgba(250,251,252,${1 - .72 * xray})`); g.addColorStop(1, `rgba(170,176,186,${1 - .72 * xray})`); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = xray > 0 ? `rgba(${LIME_RGB},.9)` : 'rgba(255,255,255,.6)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(x - L * .05, by - Hh * .96, L * .2, 6, -.08, 0, 7); ctx.fill(); ctx.restore();
  if (xray > 0) {
    ctx.save(); ctx.globalAlpha *= xray;
    // base plate with opening
    ctx.fillStyle = '#2a2d34'; ctx.fillRect(x - L * .53, by - 10, L * .45, 10); ctx.fillRect(x + L * .08, by - 10, L * .37, 10);
    // PCB
    const py = by - Hh * .42; rr(ctx, x - L * .44, py, L * .86, 14, 4); ctx.fillStyle = '#145a3e'; ctx.fill(); ctx.fillStyle = '#c9a24a'; for (let i = 0; i < 14; i++) ctx.fillRect(x - L * .4 + i * L * .06, py - 4, L * .02, 4);
    // sensor chip hanging under the PCB + lens below it
    rr(ctx, x - L * .08, py + 14, L * .16, Hh * .12, 6); ctx.fillStyle = '#16181d'; ctx.fill(); ctx.strokeStyle = `rgba(${LIME_RGB},.8)`; ctx.lineWidth = 2; ctx.stroke();
    const ly = by - Hh * .1; ctx.beginPath(); ctx.ellipse(x, ly, L * .1, Hh * .06, 0, 0, 7); const lg = ctx.createLinearGradient(x, ly - 20, x, ly + 20); lg.addColorStop(0, 'rgba(220,240,255,.95)'); lg.addColorStop(1, 'rgba(90,140,180,.8)'); ctx.fillStyle = lg; ctx.fill();
    ctx.fillStyle = '#3a3e47'; ctx.fillRect(x - L * .12, ly - 3, L * .03, Hh * .2); ctx.fillRect(x + L * .09, ly - 3, L * .03, Hh * .2);
    // LED package
    ctx.save(); ctx.translate(led[0], led[1]); ctx.rotate(.18); rr(ctx, -22, -14, 34, 28, 6); ctx.fillStyle = '#e9f0c0'; ctx.fill(); ctx.restore();
    glow(ctx, led[0], led[1], 90, LIME_RGB, beam);
    ctx.fillStyle = '#5a5f69'; ctx.fillRect(led[0] - 4, py + 14, 6, led[1] - py - 22);
    // reflected rays up through the lens to the chip
    if (rays > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${LIME_RGB},${.7 * rays})`; ctx.lineWidth = 2.5; const cy0 = py + 14 + Hh * .12;
      for (let i = -2; i <= 2; i++) { const sx0 = spot[0] + i * (14 + 30 * lift), mid = [x + i * L * .03, ly], end = [x + i * (L * .012) + i * blur * L * .02, cy0];
        const dash = ((T * 60) % 20); ctx.setLineDash([10, 10]); ctx.lineDashOffset = -dash; ctx.beginPath(); ctx.moveTo(sx0, spot[1] - 2); ctx.lineTo(mid[0], mid[1]); ctx.lineTo(end[0], end[1]); ctx.stroke(); }
      ctx.restore(); }
    ctx.restore();
  }
  return { led, spot, chip: [x, by - Hh * .42 + 14 + Hh * .06], lens: [x, by - Hh * .1], top: by - Hh };
}

// ---------- macro desk surface: fibres + dust lit from a low angle ----------
export function macro(ctx, T, { lit = 1, slide = 0, shadows = 1, hiF = 0, hiD = 0, hiS = 0, cy = 1150 } = {}) {
  const P = proj3({ yaw: 0, pitch: .42, dist: 5.2, f: 1500, cx: 540, cy, tx: slide, ty: 0 });
  ctx.fillStyle = '#07080a'; ctx.fillRect(-W, -H, W * 3, H * 3);
  // ground plane with light falloff from the left
  const q = [P(slide - 9, -4.2), P(slide + 9, -4.2), P(slide + 9, 14), P(slide - 9, 14)];
  ctx.beginPath(); q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
  let g = ctx.createLinearGradient(0, q[2][1], 0, q[0][1]); g.addColorStop(0, '#121318'); g.addColorStop(1, '#2a2c30'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
  g = ctx.createRadialGradient(-150, cy + 120, 20, -150, cy + 120, 1250); g.addColorStop(0, `rgba(${LIME_RGB},${.45 * lit})`); g.addColorStop(.5, `rgba(${LIME_RGB},${.12 * lit})`); g.addColorStop(1, `rgba(${LIME_RGB},0)`); ctx.fillStyle = g; ctx.fillRect(-W, 0, W * 3, H * 2);
  ctx.restore();
  // fine weave lines
  ctx.strokeStyle = 'rgba(255,255,255,.035)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let i = -30; i <= 30; i++) { const a = P(Math.floor(slide) + i * .5, -1.4), b = P(Math.floor(slide) + i * .5, 14); if (a && b) { ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); } }
  for (let j = 0; j < 40; j++) { const a = P(slide - 9, -1.4 + j * .4), b = P(slide + 9, -1.4 + j * .4); if (a && b) { ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); } } ctx.stroke();
  const SH = 3.6 * shadows * lit; // shadow length per unit height (low light from the left)
  const items = [];
  for (let i = 0; i < 420; i++) { const x = -6 + 22 * hash(i, 1), y = -3.2 + 8 * hash(i, 2); if (x < slide - 4.5 || x > slide + 4.5) continue;
    if (i % 3 === 2) items.push({ t: 'd', x, y, r: .07 + .09 * hash(i, 3), i });
    else { const an = hash(i, 4) * Math.PI, len = .25 + .5 * hash(i, 5), zt = .06 + .22 * hash(i, 6); items.push({ t: 'f', x, y, x2: x + Math.cos(an) * len * .6, y2: y + Math.sin(an) * len * .4, z2: zt, i }); } }
  items.sort((a, b) => b.y - a.y);
  for (const it of items) { // shadows first
    const p0 = P(it.x, it.y);
    if (!p0) continue;
    if (it.t === 'f') { const sh = P(it.x2 + it.z2 * SH, it.y2 + it.z2 * .25), top = P(it.x2, it.y2); if (!sh || !top) continue;
      ctx.strokeStyle = `rgba(0,0,0,${.75 * lit})`; ctx.lineWidth = Math.max(2, 1500 / p0[2] * .018); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(sh[0], sh[1]); ctx.stroke();
      if (hiS > 0) { ctx.strokeStyle = `rgba(110,160,255,${.55 * hiS})`; ctx.lineWidth = Math.max(2, 1500 / p0[2] * .012); ctx.stroke(); } }
    else { const sh = P(it.x + it.r * SH * 1.2, it.y), c = P(it.x, it.y); if (!sh || !c) continue; const rr_ = 1500 / c[2] * it.r;
      ctx.strokeStyle = `rgba(0,0,0,${.7 * lit})`; ctx.lineWidth = rr_ * 1.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(sh[0], sh[1]); ctx.stroke(); }
  }
  for (const it of items) {
    if (it.t === 'f') { const a = P(it.x, it.y), b = P(it.x2, it.y2, it.z2); if (!a || !b) continue; const wd = Math.max(2, 1500 / a[2] * .02);
      const gg = ctx.createLinearGradient(a[0], a[1], b[0], b[1]); gg.addColorStop(0, '#8b836c'); gg.addColorStop(1, '#f4ecd2'); ctx.strokeStyle = gg; ctx.lineWidth = wd; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      if (hiF > 0 && it.i % 7 === 0) { ctx.strokeStyle = `rgba(${LIME_RGB},${hiF})`; ctx.lineWidth = wd * .5; ctx.stroke(); } }
    else { const c = P(it.x, it.y, it.r); if (!c) continue; const r = 1500 / c[2] * it.r; const gg = ctx.createRadialGradient(c[0] - r * .4, c[1] - r * .4, 1, c[0], c[1], r); gg.addColorStop(0, '#fffdf2'); gg.addColorStop(1, '#8d8a7c'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, 7); ctx.fill();
      if (hiD > 0 && it.i % 4 === 2) { ctx.strokeStyle = `rgba(${LIME_RGB},${hiD})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(c[0], c[1], r + 10, 0, 7); ctx.stroke(); } }
  }
  return P;
}

// ---------- fingertip with nail (scale comparison) ----------
export function fingertip(ctx, x, y, s, ang = 0, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(ang);
  const r = s / 2; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
  ctx.beginPath(); ctx.moveTo(-r, 1400); ctx.lineTo(-r, 0); ctx.arc(0, 0, r, Math.PI, 0); ctx.lineTo(r, 1400); ctx.closePath();
  let g = ctx.createLinearGradient(-r, 0, r, 0); g.addColorStop(0, '#9b634f'); g.addColorStop(.3, '#dca58b'); g.addColorStop(.6, '#f0c4ab'); g.addColorStop(1, '#94604d'); ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent';
  const nw = r * 1.25, nh = r * 1.45; rr(ctx, -nw / 2, -r * .62, nw, nh, [nw / 2, nw / 2, nw * .18, nw * .18]);
  g = ctx.createLinearGradient(-nw / 2, 0, nw / 2, 0); g.addColorStop(0, '#d9a99a'); g.addColorStop(.5, '#fbe3da'); g.addColorStop(1, '#cf9c8d'); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(120,60,50,.35)'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(-nw * .15, -r * .2, nw * .08, nh * .3, 0, 0, 7); ctx.fill();
  ctx.restore();
}

// ---------- binary report packet ----------
export function reportCard(ctx, T, x, y, w, { a = 1, dx = 3, dy = 0, hi = 0, title = 'THE REPORT · 3 BYTES' } = {}) {
  if (a <= 0) return; const h = 230; glassCard(ctx, x, y, w, h, { a });
  ctx.save(); ctx.globalAlpha *= a; ctx.letterSpacing = '3px'; txt(ctx, title, x + 28, y + 44, 19, 'rgba(255,255,255,.55)', 700, 'left', MONO); ctx.letterSpacing = '0px';
  const b8 = v => (v & 255).toString(2).padStart(8, '0');
  [['BUTTONS', 0, ''], ['X', dx, (dx >= 0 ? '+' : '') + dx], ['Y', dy, String(dy)]].forEach(([k, v, d], i) => {
    const yy = y + 98 + i * 50; txt(ctx, k, x + 28, yy, 22, 'rgba(255,255,255,.45)', 700, 'left', MONO);
    txt(ctx, b8(v), x + 170, yy, 34, i === 1 ? `rgba(${LIME_RGB},${.7 + .3 * hi})` : '#9fb7ff', 700, 'left', MONO);
    if (d) txt(ctx, d, x + 370, yy, 26, i === 1 ? LIME : 'rgba(255,255,255,.5)', 800, 'left', MONO);
  });
  ctx.restore();
}
