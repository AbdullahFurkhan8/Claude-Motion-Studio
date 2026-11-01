// Illustrations for the laptop-battery explainer. Pure functions of inputs + time.
import { W, H, clamp, lerp, eo, eio, hash, rr, GOLD } from './lib.js';
export const FONT = (w, px) => `${w} ${px}px Inter, "Segoe UI", Arial`;

export function bgLight(ctx) { const g = ctx.createRadialGradient(W / 2, H * .45, 100, W / 2, H * .45, H * .8); g.addColorStop(0, '#fbfbfa'); g.addColorStop(1, '#e4e4e1'); ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3); }
export function bgDark(ctx, grid = true) {
  ctx.fillStyle = '#0c0d10'; ctx.fillRect(-W, -H, W * 3, H * 3);
  if (grid) { ctx.strokeStyle = 'rgba(255,255,255,.035)'; ctx.lineWidth = 1; for (let x = 0; x <= W; x += 54) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y <= H; y += 54) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
}
export function shadow(ctx, x, y, w, a = .25) { const g = ctx.createRadialGradient(x, y, 5, x, y, w); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.save(); ctx.translate(x, y); ctx.scale(1, .18); ctx.translate(-x, -y); ctx.fillStyle = g; ctx.fillRect(x - w, y - w, w * 2, w * 2); ctx.restore(); }
const silver = (ctx, x0, y0, x1, y1) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#f4f5f7'); g.addColorStop(.5, '#c9ccd2'); g.addColorStop(1, '#a9adb5'); return g; };

// Wallpaper + menu bar with battery percentage
export function wallpaper(ctx, w, h, T, pct = null, dark = 0) {
  let g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f2a25c'); g.addColorStop(1, '#8a2f12'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  for (let k = 0; k < 4; k++) { ctx.fillStyle = `rgba(${k % 2 ? '255,210,150' : '120,30,10'},.35)`; ctx.beginPath(); ctx.moveTo(0, h * (.35 + k * .15)); for (let x = 0; x <= w; x += w / 20) ctx.lineTo(x, h * (.35 + k * .15) + Math.sin(x / w * 5 + k + T * .3) * h * .06); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(0, 0, w, h * .07);
  if (pct !== null) { const s = h * .045; ctx.fillStyle = '#222'; ctx.font = FONT(700, s); ctx.textAlign = 'right'; ctx.fillText(Math.round(pct) + '%', w * .86, h * .055); ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.strokeRect(w * .875, h * .018, w * .06, h * .04); ctx.fillStyle = pct < 15 ? '#e53935' : '#222'; ctx.fillRect(w * .88, h * .025, w * .05 * pct / 100, h * .026); }
  if (dark > 0) { ctx.fillStyle = `rgba(0,0,0,${dark})`; ctx.fillRect(0, 0, w, h); }
}
// Open laptop, front view. (x,y) = centre of screen; w = screen width
export function laptopOpen(ctx, x, y, w, screenFn) {
  const h = w * .62;
  shadow(ctx, x, y + h / 2 + w * .1, w * .7, .3);
  rr(ctx, x - w / 2 - 14, y - h / 2 - 14, w + 28, h + 28, 18); ctx.fillStyle = '#1b1c1f'; ctx.fill();
  ctx.save(); rr(ctx, x - w / 2, y - h / 2, w, h, 6); ctx.clip(); ctx.translate(x - w / 2, y - h / 2); screenFn(ctx, w, h); ctx.restore();
  ctx.fillStyle = silver(ctx, x, y + h / 2, x, y + h / 2 + 40); ctx.beginPath(); ctx.moveTo(x - w / 2 - 70, y + h / 2 + 34); ctx.lineTo(x - w / 2 - 14, y + h / 2 + 12); ctx.lineTo(x + w / 2 + 14, y + h / 2 + 12); ctx.lineTo(x + w / 2 + 70, y + h / 2 + 34); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9ea2a9'; rr(ctx, x - w / 2 - 70, y + h / 2 + 32, w + 140, 10, 5); ctx.fill();
}
// Closed laptop lid seen from above
export function laptopLid(ctx, x, y, w, rot = 0, emblem = true) {
  const h = w * .68; ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 25;
  rr(ctx, -w / 2, -h / 2, w, h, 28); ctx.fillStyle = silver(ctx, -w / 2, -h / 2, w / 2, h / 2); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 3; ctx.stroke();
  if (emblem) { ctx.fillStyle = 'rgba(120,124,132,.45)'; ctx.beginPath(); ctx.arc(0, 0, w * .05, 0, 7); ctx.fill(); }
  ctx.restore();
}
// Bottom panel with screws; open 0..1 lifts it away
export function laptopBottom(ctx, x, y, w, T, screwOut = 0, open = 0) {
  const h = w * .68;
  ctx.save(); ctx.translate(x, y);
  // internals revealed underneath
  rr(ctx, -w / 2, -h / 2, w, h, 28); ctx.fillStyle = '#1a1b1e'; ctx.fill();
  for (let i = 0; i < 6; i++) { const cx = -w * .42 + (i % 3) * w * .29, cy = h * .02 + Math.floor(i / 3) * h * .22; rr(ctx, cx, cy, w * .26, h * .19, 10); const g = ctx.createLinearGradient(0, cy, 0, cy + h * .19); g.addColorStop(0, '#2d2f35'); g.addColorStop(1, '#0d0e10'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#444'; ctx.stroke(); }
  rr(ctx, -w * .42, -h * .42, w * .84, h * .36, 10); ctx.fillStyle = '#123'; ctx.fill();
  for (let i = 0; i < 14; i++) { ctx.fillStyle = '#2c3b4a'; ctx.fillRect(-w * .4 + i * w * .058, -h * .38, w * .04, h * .05); }
  // panel
  if (open < 1) {
    ctx.save(); ctx.globalAlpha = 1 - open; ctx.translate(0, -open * 700); ctx.rotate(-open * .3);
    rr(ctx, -w / 2, -h / 2, w, h, 28); ctx.fillStyle = silver(ctx, -w / 2, -h / 2, w / 2, h / 2); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,.35)'; for (const sx of [-1, 1]) for (let i = 0; i < 18; i++) { ctx.fillRect(sx * w * .3 - 4 + (sx > 0 ? 0 : 0), -h * .32 + i * 8, sx * w * .12, 3); }
    ctx.restore();
  }
  // screws
  [[-.45, -.42], [0, -.44], [.45, -.42], [-.47, 0], [.47, 0], [-.45, .42], [0, .44], [.45, .42]].forEach(([sx, sy], i) => {
    const t = clamp(screwOut * 1.3 - i * .04), px = sx * w + sx * 300 * eo(t), py = sy * h + sy * 300 * eo(t) - 200 * Math.sin(t * Math.PI);
    if (open > .5 && t >= 1) return;
    ctx.save(); ctx.translate(px, py); ctx.rotate(t * 12); ctx.globalAlpha = 1 - clamp((t - .7) / .3);
    ctx.fillStyle = '#6b6f77'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, 7); ctx.fill(); ctx.strokeStyle = '#222'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.moveTo(0, -6); ctx.lineTo(0, 6); ctx.stroke(); ctx.restore();
  });
  ctx.restore();
}
// Magnetic charging plug (side view), tip at (x,y), cable going left
export function plug(ctx, x, y, s = 1, led = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#d8d8dc'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-160, 0); ctx.bezierCurveTo(-400, 0, -500, 120, -900, 140); ctx.stroke();
  const g = ctx.createLinearGradient(0, -60, 0, 60); g.addColorStop(0, '#f2f2f4'); g.addColorStop(.5, '#c4c6cc'); g.addColorStop(1, '#8e9199');
  rr(ctx, -200, -55, 200, 110, 26); ctx.fillStyle = g; ctx.fill();
  rr(ctx, -14, -38, 26, 76, 8); ctx.fillStyle = '#2a2b2f'; ctx.fill();
  for (let i = 0; i < 5; i++) { ctx.fillStyle = '#d9b44a'; ctx.beginPath(); ctx.arc(0, -26 + i * 13, 4.5, 0, 7); ctx.fill(); }
  if (led > 0) { ctx.fillStyle = `rgba(80,255,120,${led})`; ctx.shadowColor = '#5f5'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(-100, -56, 6, 0, 7); ctx.fill(); }
  ctx.restore();
}
// Laptop side edge with ports (for plug-in)
export function laptopEdge(ctx, x, y, w) {
  const g = ctx.createLinearGradient(0, y - 60, 0, y + 60); g.addColorStop(0, '#e9eaed'); g.addColorStop(.5, '#b9bcc3'); g.addColorStop(1, '#6e7178');
  rr(ctx, x, y - 60, w, 120, 30); ctx.fillStyle = g; ctx.fill();
  rr(ctx, x + 14, y - 40, 30, 80, 8); ctx.fillStyle = '#16171a'; ctx.fill();
  rr(ctx, x + 90, y - 18, 70, 36, 18); ctx.fillStyle = '#16171a'; ctx.fill(); rr(ctx, x + 190, y - 18, 70, 36, 18); ctx.fill();
}
// Shattering battery panel; t 0..1
export function shatter(ctx, x, y, w, h, t, T) {
  ctx.save(); ctx.translate(x, y);
  for (let i = 0; i < 8; i++) { const cx = -w * .42 + (i % 4) * w * .22, cy = -h * .35 + Math.floor(i / 4) * h * .4; rr(ctx, cx, cy, w * .19, h * .3, 12); const g = ctx.createRadialGradient(cx + w * .1, cy + h * .15, 5, cx + w * .1, cy + h * .15, w * .2); g.addColorStop(0, `rgba(255,${150 + 60 * Math.sin(T * 9 + i)},60,1)`); g.addColorStop(1, 'rgba(120,20,0,1)'); ctx.fillStyle = g; ctx.fill(); }
  ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(0, 0, 10, 0, 0, w * .7); gl.addColorStop(0, `rgba(255,120,30,${.6 * t})`); gl.addColorStop(1, 'rgba(255,60,0,0)'); ctx.fillStyle = gl; ctx.fillRect(-w, -h, w * 2, h * 2); ctx.globalCompositeOperation = 'source-over';
  const n = 7, m = 5;
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
    const k = i * m + j, sx = -w / 2 + (i + .5) * w / n, sy = -h / 2 + (j + .5) * h / m, dir = Math.atan2(sy, sx) + (hash(k) - .5);
    const d = t * (120 + 380 * hash(k, 1)), px = sx + Math.cos(dir) * d, py = sy + Math.sin(dir) * d + t * t * 200;
    ctx.save(); ctx.translate(px, py); ctx.rotate(t * (hash(k, 2) - .5) * 4); ctx.globalAlpha = 1 - clamp((t - .6) / .4) * .7;
    ctx.beginPath(); const r = w / n * .62; for (let v = 0; v < 5; v++) { const a = v / 5 * 7 + hash(k, v); const rad = r * (.75 + .35 * hash(k, v + 3)); v ? ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad) : ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad); }
    ctx.closePath(); ctx.fillStyle = silver(ctx, -r, -r, r, r); ctx.fill(); ctx.strokeStyle = 'rgba(255,170,90,.6)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}

// Battery cross-section: copper | graphite anode | separator | cathode spheres | aluminium
// q: 0 = ions in anode (charged) -> 1 = in cathode. e: electrons visible 0..1
export function cell(ctx, T, { x = 60, y = 640, w = 960, h = 640, q = 0, ions = 1, e = 0, label = 1 } = {}) {
  const xCu = x, xA = x + 50, xS = x + w * .42, xC = x + w * .5, xAl = x + w - 50;
  let g = ctx.createLinearGradient(xCu, 0, xCu + 50, 0); g.addColorStop(0, '#7a3a14'); g.addColorStop(.5, '#e99559'); g.addColorStop(1, '#8a4318');
  ctx.fillStyle = g; rr(ctx, xCu, y - 30, 46, h + 30, 8); ctx.fill();
  g = ctx.createLinearGradient(xAl, 0, xAl + 50, 0); g.addColorStop(0, '#7e848c'); g.addColorStop(.5, '#e7eaee'); g.addColorStop(1, '#7e848c');
  ctx.fillStyle = g; rr(ctx, xAl, y - 30, 46, h + 30, 8); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = FONT(800, 30); ctx.textAlign = 'center'; ctx.fillText('−', xCu + 23, y - 40); ctx.fillText('+', xAl + 23, y - 40);
  // graphite flakes
  for (let i = 0; i < 380; i++) { const fx = xA + 6 + hash(i, 1) * (xS - xA - 12), fy = y + hash(i, 2) * h; ctx.save(); ctx.translate(fx, fy); ctx.rotate(hash(i, 3) * 3); const b = 110 + 90 * hash(i, 4); ctx.fillStyle = `rgb(${b + 40},${b},${b * .3})`; ctx.fillRect(-16, -5, 32, 10); ctx.restore(); }
  // separator (white zigzag)
  ctx.fillStyle = '#e9e9ea'; ctx.fillRect(xS, y, xC - xS, h); ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 3;
  for (let yy = y + 8; yy < y + h; yy += 16) { ctx.beginPath(); for (let k = 0; k <= 8; k++) { const px = xS + k * (xC - xS) / 8, py = yy + (k % 2 ? 5 : -5); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
  // cathode spheres
  for (let i = 0; i < 210; i++) { const cx = xC + 20 + hash(i, 5) * (xAl - xC - 40), cy = y + 15 + hash(i, 6) * (h - 30), r = 16 + 10 * hash(i, 7); const sg = ctx.createRadialGradient(cx - r * .4, cy - r * .4, 2, cx, cy, r); sg.addColorStop(0, '#9da3ab'); sg.addColorStop(1, '#2b2e33'); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); }
  // ions
  if (ions > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 70; i++) {
      const ax = xA + 20 + hash(i, 8) * (xS - xA - 40), ay = y + 20 + hash(i, 9) * (h - 40), cx = xC + 30 + hash(i, 10) * (xAl - xC - 60), cy = y + 20 + hash(i, 11) * (h - 40);
      const u = eio(clamp(q * 1.6 - hash(i, 12) * .6)), px = lerp(ax, cx, u) + Math.sin(T * 3 + i) * 3, py = lerp(ay, cy, u) + Math.sin(u * Math.PI) * (hash(i, 13) - .5) * 80;
      const rg = ctx.createRadialGradient(px, py, 1, px, py, 16); rg.addColorStop(0, `rgba(255,240,170,${ions})`); rg.addColorStop(.4, `rgba(${GOLD},${.8 * ions})`); rg.addColorStop(1, 'rgba(255,160,40,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(px, py, 16, 0, 7); ctx.fill();
    }
    ctx.restore();
  }
  // electrons in copper foil, rising
  if (e > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const py = y + h - ((T * 220 + hash(i) * h) % (h + 30)); ctx.fillStyle = `rgba(190,220,255,${e * .9})`; ctx.beginPath(); ctx.arc(xCu + 10 + hash(i, 2) * 26, py, 4, 0, 7); ctx.fill(); } ctx.restore(); }
  if (label) { ctx.globalAlpha = label; ctx.fillStyle = '#fff'; ctx.font = FONT(800, 38); ctx.textAlign = 'center'; ctx.fillText('Battery', x + w / 2, y + h + 56); ctx.font = FONT(600, 24); ctx.fillText('anode', xCu + 60, y + h + 50); ctx.fillText('cathode', xAl - 20, y + h + 50); ctx.globalAlpha = 1; }
  return { xCu, xAl, xS, xC };
}
// glowing dots flowing along a polyline path (list of [x,y])
export function flow(ctx, T, pts, a = 1, speed = .35, n = 26, rgb = '190,220,255') {
  if (a <= 0) return; const seg = []; let L = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < n; k++) { let s = ((T * speed + k / n) % 1) * L, i = 0; while (i < seg.length - 1 && s > seg[i]) { s -= seg[i]; i++; } const u = s / seg[i]; const px = lerp(pts[i][0], pts[i + 1][0], u), py = lerp(pts[i][1], pts[i + 1][1], u);
    const g = ctx.createRadialGradient(px, py, 1, px, py, 14); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(.35, `rgba(${rgb},${a * .8})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, 14, 0, 7); ctx.fill(); }
  ctx.restore();
}
export function wire(ctx, pts, col = '#c9884a', w = 12) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = w * .3; ctx.stroke(); }
// Battery box filled with ion particles. used: 0..1 fraction turned red, empty: 0..1 fade to dark, cap: capacity (1 = full height)
export function batteryBox(ctx, T, x, y, w, h, { used = 0, empty = 0, cap = 1, lost = 0 } = {}) {
  ctx.fillStyle = 'rgba(0,0,0,.18)'; rr(ctx, x - 22, y - 22, w + 44, h + 44, 22); ctx.fill();
  const fg = ctx.createLinearGradient(x, y - 20, x, y + h + 20); fg.addColorStop(0, '#e6e8ec'); fg.addColorStop(1, '#9aa0a8'); ctx.strokeStyle = fg; ctx.lineWidth = 18; rr(ctx, x - 9, y - 9, w + 18, h + 18, 14); ctx.stroke();
  ctx.fillStyle = '#111'; ctx.fillRect(x, y, w, h);
  for (const [sx, sy] of [[x - 9, y - 9], [x + w + 9, y - 9], [x - 9, y + h + 9], [x + w + 9, y + h + 9]]) { ctx.fillStyle = '#777'; ctx.beginPath(); ctx.arc(sx, sy, 7, 0, 7); ctx.fill(); }
  const top = y + h * (1 - cap);
  for (let i = 0; i < 1500; i++) {
    const px = x + 4 + hash(i, 1) * (w - 8), py = top + 4 + hash(i, 2) * (y + h - top - 8) + Math.sin(T * 2 + i) * 1.5;
    const isUsed = py > lerp(y + h, top, used) - 30 * hash(i, 3) ? 1 : 0;
    const isLost = hash(i, 4) < lost;
    const b = .6 + .4 * Math.sin(T * 5 + i * 1.7);
    ctx.fillStyle = isLost ? `rgba(90,90,96,${.8 * (1 - empty * .5)})` : isUsed ? `rgba(${200 * b + 40},${30 * b},20,${1 - empty * .85})` : `rgba(255,${190 * b + 30},${40 * b},1)`;
    ctx.fillRect(px, py, 9, 9);
  }
  if (cap < 1) { ctx.fillStyle = 'rgba(80,80,86,.5)'; ctx.fillRect(x, y, w, h * (1 - cap)); ctx.strokeStyle = '#e53935'; ctx.setLineDash([12, 8]); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + w, top); ctx.stroke(); ctx.setLineDash([]); }
}
// Hexagon molecule
export function molecule(ctx, x, y, s, rot, a = 1, col = '235,200,210') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a; ctx.strokeStyle = `rgba(${col},.85)`; ctx.lineWidth = 3;
  ctx.beginPath(); for (let k = 0; k <= 6; k++) { const an = k / 6 * Math.PI * 2; k ? ctx.lineTo(Math.cos(an) * s, Math.sin(an) * s) : ctx.moveTo(Math.cos(an) * s, Math.sin(an) * s); } ctx.stroke();
  ctx.fillStyle = `rgba(${col},1)`; for (let k = 0; k < 6; k++) { const an = k / 6 * Math.PI * 2; ctx.beginPath(); ctx.arc(Math.cos(an) * s, Math.sin(an) * s, 5, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(s, 0); ctx.lineTo(s * 1.8, 0); ctx.stroke(); ctx.beginPath(); ctx.arc(s * 1.8, 0, 6, 0, 7); ctx.fill();
  ctx.restore();
}
export function glowDot(ctx, x, y, r, a = 1, rgb = GOLD) { const g = ctx.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, `rgba(255,245,200,${a})`); g.addColorStop(.4, `rgba(${rgb},${a * .85})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
// Thermal palette 0..1 -> rgb
export function heat(v) { v = clamp(v); const stops = [[0, [10, 0, 30]], [.25, [90, 0, 110]], [.5, [220, 30, 30]], [.75, [255, 140, 0]], [.92, [255, 230, 90]], [1, [255, 255, 240]]]; for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) { const [a, ca] = stops[i - 1], [b, cb] = stops[i], u = (v - a) / (b - a); return `rgb(${ca.map((c, k) => Math.round(lerp(c, cb[k], u))).join(',')})`; } return 'rgb(255,255,240)'; }
export function thermalBar(ctx, x, y, h, lo, hi) {
  for (let i = 0; i < h; i += 3) { ctx.fillStyle = heat(1 - i / h); ctx.fillRect(x, y + i, 22, 3); }
  ctx.fillStyle = '#fff'; ctx.font = FONT(700, 20); ctx.textAlign = 'right'; ctx.fillText(hi + '°C', x - 8, y + 14); ctx.fillText(lo + '°C', x - 8, y + h);
}
export function crosshair(ctx, x, y, txt) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 18, 0, 7); ctx.moveTo(x - 32, y); ctx.lineTo(x - 10, y); ctx.moveTo(x + 10, y); ctx.lineTo(x + 32, y); ctx.moveTo(x, y - 32); ctx.lineTo(x, y - 10); ctx.moveTo(x, y + 10); ctx.lineTo(x, y + 32); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = FONT(800, 44); ctx.textAlign = 'left'; ctx.shadowColor = '#000'; ctx.shadowBlur = 10; ctx.fillText(txt, x + 44, y - 20); ctx.shadowBlur = 0; }
// Isometric ball-and-stick lattice block; filled(i,j,k)->0..1 ion presence
export function lattice(ctx, cx, cy, s, n, tint, filled, T, crack = 0) {
  const iso = (i, j, k) => [cx + (i - j) * s * .87, cy + (i + j) * s * .5 - k * s];
  ctx.lineWidth = 3;
  for (let k = 0; k < n; k++) for (let j = n - 1; j >= 0; j--) for (let i = 0; i < n; i++) {
    const p = iso(i, j, k); ctx.strokeStyle = 'rgba(120,124,132,.6)';
    for (const [di, dj, dk] of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) if (i + di < n && j + dj < n && k + dk < n) { const q = iso(i + di, j + dj, k + dk); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); }
  }
  for (let k = 0; k < n; k++) for (let j = n - 1; j >= 0; j--) for (let i = 0; i < n; i++) {
    const p = iso(i, j, k), f = filled(i, j, k);
    const g = ctx.createRadialGradient(p[0] - 4, p[1] - 4, 1, p[0], p[1], s * .2); g.addColorStop(0, '#fff'); g.addColorStop(1, tint); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], s * .17, 0, 7); ctx.fill();
    if (f > 0) { const q = iso(i + .5, j + .5, k + .5); ctx.fillStyle = `rgba(232,178,40,${f})`; ctx.beginPath(); ctx.arc(q[0], q[1], s * .15 * (.6 + .4 * f), 0, 7); ctx.fill(); }
  }
  if (crack > 0) { ctx.strokeStyle = `rgba(30,20,20,${crack})`; ctx.lineWidth = 7; for (let c = 0; c < 4; c++) { ctx.beginPath(); let px = cx - s * 2 + c * s * 1.4, py = cy - s * 1.5; ctx.moveTo(px, py); for (let k = 0; k < 7 * crack; k++) { px += (hash(c, k) - .5) * s; py += s * .6; ctx.lineTo(px, py); } ctx.stroke(); } }
}
// Generic settings window (light). rows: [{label, sub, toggle:0..1|undefined, slider:0..1|undefined}]
export function settingsWindow(ctx, x, y, w, title, rows, { dark = false, hi = -1, hiA = 0 } = {}) {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
  const h = 120 + rows.length * 150; rr(ctx, x, y, w, h, 24); ctx.fillStyle = dark ? '#202227' : '#fdfdfd'; ctx.fill(); ctx.restore();
  ctx.fillStyle = dark ? '#2b2e35' : '#eceef1'; rr(ctx, x, y, w, 70, [24, 24, 0, 0]); ctx.fill();
  if (!dark) for (let k = 0; k < 3; k++) { ctx.fillStyle = ['#ff5f57', '#febc2e', '#28c840'][k]; ctx.beginPath(); ctx.arc(x + 34 + k * 28, y + 35, 9, 0, 7); ctx.fill(); }
  ctx.fillStyle = dark ? '#fff' : '#1c1d20'; ctx.font = FONT(700, 30); ctx.textAlign = 'left'; ctx.fillText(title, x + (dark ? 30 : 130), y + 46);
  rows.forEach((r, i) => {
    const ry = y + 100 + i * 150;
    rr(ctx, x + 24, ry, w - 48, 128, 18); ctx.fillStyle = dark ? '#2a2c32' : '#f3f4f6'; ctx.fill();
    if (i === hi && hiA > 0) { ctx.strokeStyle = `rgba(47,120,255,${hiA})`; ctx.lineWidth = 5; ctx.stroke(); }
    ctx.fillStyle = dark ? '#fff' : '#1c1d20'; ctx.font = FONT(700, 28); ctx.fillText(r.label, x + 50, ry + 50);
    ctx.fillStyle = dark ? '#a9adb5' : '#6b6f78'; ctx.font = FONT(500, 21); ctx.fillText(r.sub || '', x + 50, ry + 88);
    if (r.toggle !== undefined) { const tx = x + w - 140, ty = ry + 40; rr(ctx, tx, ty, 92, 50, 25); ctx.fillStyle = `rgb(${Math.round(lerp(150, 52, r.toggle))},${Math.round(lerp(152, 199, r.toggle))},${Math.round(lerp(160, 89, r.toggle))})`; ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(tx + 25 + 42 * eo(r.toggle), ty + 25, 21, 0, 7); ctx.fill(); }
    if (r.slider !== undefined) { const sx = x + w * .45, sw = w * .45, sy2 = ry + 64; ctx.fillStyle = '#d5d8dd'; rr(ctx, sx, sy2 - 4, sw, 8, 4); ctx.fill(); ctx.fillStyle = '#34c759'; rr(ctx, sx, sy2 - 4, sw * r.slider, 8, 4); ctx.fill(); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#bbb'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx + sw * r.slider, sy2, 18, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#1c1d20'; ctx.font = FONT(800, 26); ctx.textAlign = 'center'; ctx.fillText(Math.round(lerp(80, 100, r.slider)) + '%', sx + sw * r.slider, sy2 - 30); ctx.textAlign = 'left'; }
  });
  return h;
}
export function cursor(ctx, x, y, press = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1.6 - press * .2, 1.6 - press * .2); ctx.fillStyle = '#111'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.lineTo(8, 23); ctx.lineTo(14, 35); ctx.lineTo(19, 33); ctx.lineTo(13, 21); ctx.lineTo(23, 21); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}
