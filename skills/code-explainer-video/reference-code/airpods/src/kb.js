// iPhone-style keyboard with hidden "hit zones". Drawn in keyboard units (1 unit = 1 letter cell) through a mapper,
// so the same code draws a flat keyboard or a 3D macro perspective.
import { W, H, clamp, lerp, eo, hash, GOLD } from './lib.js';
export const ROWH = 1.35;
const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
export function layout() { // letter -> cell {u,v,w,h} (zone cell), key inset inside
  const L = {};
  ROWS[0].split('').forEach((c, i) => L[c] = { u: i, v: 0, w: 1, h: ROWH, row: 0 });
  ROWS[1].split('').forEach((c, i) => L[c] = { u: .5 + i, v: ROWH, w: 1, h: ROWH, row: 1 });
  ROWS[2].split('').forEach((c, i) => L[c] = { u: 1.5 + i, v: ROWH * 2, w: 1, h: ROWH, row: 2 });
  return L;
}
const BASE = layout();
// zones resized by weights within each row (sum preserved), grown cells also extend vertically
export function zones(scale = {}) {
  const Z = {};
  ROWS.forEach((r, ri) => {
    const ks = r.split(''), ws = ks.map(c => scale[c] ?? 1), tot = ws.reduce((a, b) => a + b, 0), x0 = BASE[ks[0]].u;
    let u = x0; ks.forEach((c, i) => { const w = ws[i] / tot * ks.length; const g = Math.max(0, (scale[c] ?? 1) - 1); Z[c] = { u, v: ri * ROWH - g * .35, w, h: ROWH + g * .7 }; u += w; });
  });
  return Z;
}
export const flat = (x0, y0, w) => { const k = w / 10; return (u, v) => [x0 + u * k, y0 + v * k, k]; };
// perspective: P from proj3, keyboard centred at (5, 2.7) units, unit size s
export const persp = (P, s = .5, z = 0) => (u, v) => { const q = P((u - 5) * s, -(v - 2.7) * s, z); if (!q) return [0, 0, 0]; const q2 = P((u + 1 - 5) * s, -(v - 2.7) * s, z); return [q[0], q[1], q2 ? Math.hypot(q2[0] - q[0], q2[1] - q[1]) : 0]; };
function quad(ctx, m, u, v, w, h, r = .14) {
  const pts = [m(u, v), m(u + w, v), m(u + w, v + h), m(u, v + h)];
  const k = pts[0][2] * r; ctx.beginPath();
  for (let i = 0; i < 4; i++) { const a = pts[i], b = pts[(i + 1) % 4], c0 = pts[(i + 3) % 4]; if (i === 0) ctx.moveTo((a[0] + c0[0]) / 2, (a[1] + c0[1]) / 2); ctx.arcTo(a[0], a[1], b[0], b[1], k); }
  ctx.closePath();
}
// opts: zoneA (gold zones alpha), scale{letter:weight}, zoneHi{letter:0..1}, pressed letter, pressA, popup letter, popA,
// keyA (key visibility), labels{letter:text}, sugg [3 words], suggHi index, dashed (invisible zone outline), showBottom
export function keyboard(ctx, m, o = {}) {
  const { zoneA = 0, scale = {}, zoneHi = {}, pressed = null, pressA = 1, popup = null, popA = 0, keyA = 1, labels = {}, sugg = null, suggHi = -1, dashed = 0, bottom = true, panel = 1, onlyZones = false, ghost = 0 } = o;
  if (panel > 0 && !onlyZones) { ctx.globalAlpha = panel; quad(ctx, m, -.25, sugg ? -1.35 : -.25, 10.5, (sugg ? 1.35 : 0) + ROWH * 4 + .4, .05); ctx.fillStyle = '#1f2023'; ctx.fill(); ctx.globalAlpha = 1; }
  if (sugg && !onlyZones) sugg.forEach((s, i) => { const c = m(1.67 + i * 3.33, -.7); if (i === suggHi) { quad(ctx, m, i * 3.33 + .2, -1.15, 2.95, .9, .2); ctx.fillStyle = '#4a4b50'; ctx.fill(); } ctx.fillStyle = '#e8e8ea'; ctx.font = `${i === suggHi ? 700 : 500} ${c[2] * .42}px Inter, "Segoe UI", Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, c[0], c[1]); });
  const Z = zones(scale);
  if (zoneA > 0 || dashed > 0) for (const c in Z) {
    const z = Z[c], hi = zoneHi[c] || 0; quad(ctx, m, z.u + .03, z.v + .03, z.w - .06, z.h - .06, .12);
    if (zoneA > 0) { ctx.fillStyle = `rgba(${GOLD},${zoneA * (.32 + .5 * hi)})`; ctx.fill(); ctx.strokeStyle = `rgba(255,${210 + 40 * hi},${120 + 120 * hi},${zoneA * (.7 + .3 * hi)})`; ctx.lineWidth = Math.max(1.5, m(0, 0)[2] * (.03 + .04 * hi)); ctx.stroke(); }
    if (hi > 0 && zoneA > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${GOLD},${.35 * hi * zoneA})`; ctx.lineWidth = m(0, 0)[2] * .25; ctx.stroke(); ctx.restore(); }
    if (dashed > 0) { ctx.setLineDash([8, 8]); ctx.strokeStyle = `rgba(255,255,255,${dashed * .6})`; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); }
    if (onlyZones && zoneA > 0) { const p = m(z.u + z.w / 2, z.v + z.h / 2); ctx.fillStyle = `rgba(60,40,0,${zoneA * .8})`; ctx.font = `700 ${p[2] * .45}px Inter, "Segoe UI", Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(c.toUpperCase(), p[0], p[1]); }
  }
  if (onlyZones) return Z;
  if (keyA > 0) {
    ctx.globalAlpha = keyA;
    const key = (u, v, w, txt, special = false, isP = false) => {
      quad(ctx, m, u + .07, v + .14, w - .14, ROWH - .28, .14);
      ctx.fillStyle = isP ? `rgb(${lerp(92, 225, pressA)},${lerp(93, 226, pressA)},${lerp(98, 230, pressA)})` : special ? '#3a3b3f' : '#5c5d62'; ctx.fill();
      if (ghost > 0) { ctx.fillStyle = `rgba(31,32,35,${ghost})`; ctx.fill(); }
      const c = m(u + w / 2, v + ROWH / 2); ctx.fillStyle = isP && pressA > .5 ? '#111' : '#f4f4f6'; ctx.font = `${special ? 600 : 500} ${c[2] * (special ? .32 : .56)}px Inter, "Segoe UI", Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, c[0], c[1] + c[2] * .03);
    };
    for (const c in BASE) { const b = BASE[c]; key(b.u, b.v, 1, c, false, c === pressed); }
    if (bottom) { key(0, ROWH * 2, 1.3, '⇧', true); key(8.7, ROWH * 2, 1.3, '⌫', true); key(0, ROWH * 3, 2.4, '123', true); key(2.4, ROWH * 3, 5.2, 'space', true); key(7.6, ROWH * 3, 2.4, 'return', true); }
    ctx.globalAlpha = 1;
  }
  for (const c in labels) { const b = BASE[c], p = m(b.u + .5, b.v + ROWH * .82); ctx.fillStyle = '#fff'; ctx.font = `800 ${p[2] * .3}px Inter, "Segoe UI", Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 6; ctx.fillText(labels[c], p[0], p[1]); ctx.shadowBlur = 0; }
  if (popup && popA > 0) { // character preview bubble
    const b = BASE[popup]; ctx.save(); ctx.globalAlpha = popA;
    quad(ctx, m, b.u - .22, b.v - 1.55 * eo(popA), 1.44, 1.5, .25); ctx.fillStyle = '#7a7b80'; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 20; ctx.fill(); ctx.shadowBlur = 0;
    quad(ctx, m, b.u + .07, b.v - .3, .86, .5, .1); ctx.fill();
    const c = m(b.u + .5, b.v - .8 * eo(popA)); ctx.fillStyle = '#fff'; ctx.font = `500 ${c[2] * .95}px Inter, "Segoe UI", Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(popup, c[0], c[1]); ctx.restore();
  }
  return Z;
}
export const keyCenter = (m, c) => { const b = BASE[c]; return m(b.u + .5, b.v + ROWH / 2); };
// Thumb pad seen from above (rounded, with nail), tip at (x,y)
export function thumbTop(ctx, x, y, s = 1, ang = -.5, a = 1, ghost = 0) {
  if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.globalAlpha = a;
  const path = () => { ctx.beginPath(); ctx.moveTo(-95, 900); ctx.lineTo(-95, 0); ctx.arc(0, 0, 95, Math.PI, 0); ctx.lineTo(95, 900); ctx.closePath(); };
  if (ghost > 0) { path(); ctx.strokeStyle = `rgba(255,255,255,${ghost})`; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = `rgba(255,255,255,${ghost * .12})`; ctx.fill(); ctx.restore(); return; }
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; path();
  const g = ctx.createLinearGradient(-95, 0, 95, 0); g.addColorStop(0, '#a46a54'); g.addColorStop(.35, '#e2ac91'); g.addColorStop(.6, '#efc3a9'); g.addColorStop(1, '#9c624e'); ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.beginPath(); ctx.moveTo(-58, 40); ctx.quadraticCurveTo(0, -40, 58, 40); ctx.lineTo(54, 170); ctx.quadraticCurveTo(0, 190, -54, 170); ctx.closePath();
  const n = ctx.createLinearGradient(0, -20, 0, 180); n.addColorStop(0, '#f8dccd'); n.addColorStop(1, '#e7b9a3'); ctx.fillStyle = n; ctx.fill(); ctx.strokeStyle = 'rgba(150,90,70,.4)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
}
export function crossMark(ctx, x, y, a = 1, r = 34) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.moveTo(x - r * 1.4, y); ctx.lineTo(x + r * 1.4, y); ctx.moveTo(x, y - r * 1.4); ctx.lineTo(x, y + r * 1.4); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore(); }
