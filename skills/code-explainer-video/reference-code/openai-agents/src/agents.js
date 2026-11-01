// Illustrations for the "700 OpenAI agents hacked Hugging Face" explainer. Pure functions of inputs + time T.
import { W, H, clamp, lerp, eo, eio, eback, hash, rr } from './lib.js';
export const FONT = (w, px) => `${w} ${px}px Inter, "Segoe UI", Arial`;
export const MONO = (w, px) => `${w} ${px}px "Cascadia Mono", Consolas, monospace`;
export const C = { red: '#ff3b3b', redD: '#c81e1e', blue: '#3d7bff', cyan: '#5fd0ff', gold: '#ffc23a', green: '#2fd36b', ink: '#111318', grey: '#8a8f99' };
export const RGB = { red: '255,59,59', blue: '61,123,255', cyan: '95,208,255', gold: '255,194,58', green: '47,211,107' };

export function txt(ctx, s, x, y, size, col = '#fff', w = 700, align = 'center', font = FONT) {
  ctx.fillStyle = col; ctx.font = font(w, size); ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y);
}
export const num = v => Math.round(v).toLocaleString('en-US');
export const mixc = (a, b, t) => a.split(',').map((x, i) => Math.round(lerp(+x, +b.split(',')[i], clamp(t)))).join(',');

// ---------- backgrounds ----------
export function bgDark(ctx, T, glow = RGB.blue, ga = .16, gy = H * .56) {
  ctx.fillStyle = '#0d0e11'; ctx.fillRect(-W, -H, W * 3, H * 3);
  let g = ctx.createRadialGradient(W / 2, gy, 20, W / 2, gy, 760); g.addColorStop(0, `rgba(${glow},${ga})`); g.addColorStop(1, `rgba(${glow},0)`);
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  ctx.fillStyle = 'rgba(255,255,255,.045)';
  for (let x = 27; x < W; x += 54) for (let y = 27; y < H; y += 54) { ctx.beginPath(); ctx.arc(x, y + (T * 6) % 54, 1.3, 0, 7); ctx.fill(); }
  g = ctx.createRadialGradient(W / 2, H * .55, H * .32, W / 2, H * .55, H * .85); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
}
export function bgLight(ctx, T) {
  ctx.fillStyle = '#f3f3f1'; ctx.fillRect(-W, -H, W * 3, H * 3);
  const g = ctx.createRadialGradient(W / 2, H * .52, 50, W / 2, H * .52, 900); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  ctx.fillStyle = 'rgba(0,0,0,.05)';
  for (let x = 27; x < W; x += 54) for (let y = 27; y < H; y += 54) { ctx.beginPath(); ctx.arc(x, y + (T * 6) % 54, 1.3, 0, 7); ctx.fill(); }
}
export function floorShadow(ctx, x, y, w, a = .3) {
  const g = ctx.createRadialGradient(x, y, 2, x, y, w); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); ctx.translate(x, y); ctx.scale(1, .16); ctx.translate(-x, -y); ctx.fillStyle = g; ctx.fillRect(x - w, y - w, w * 2, w * 2); ctx.restore();
}
export function glow(ctx, x, y, r, rgb, a = 1) {
  if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, `rgba(${rgb},${.55 * a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}

// ---------- generic UI ----------
export function card(ctx, x, y, w, h, { r = 26, fill = '#fff', sh = .16, stroke = 'rgba(0,0,0,.06)', dark = false } = {}) {
  ctx.save(); ctx.shadowColor = `rgba(0,0,0,${dark ? .6 : sh})`; ctx.shadowBlur = 60; ctx.shadowOffsetY = 22;
  rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
  rr(ctx, x, y, w, h, r); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
}
export function pill(ctx, x, y, s, { a = 1, bg = '#111', fg = '#fff', size = 30, icon = '', pad = 26 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); const k = .6 + .4 * clamp(a); ctx.scale(k, k);
  ctx.font = FONT(800, size); const t = (icon ? icon + '  ' : '') + s, w = ctx.measureText(t).width + pad * 2, h = size * 1.75;
  ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = bg; ctx.fill(); ctx.shadowColor = 'transparent';
  txt(ctx, t, 0, size * .36, size, fg, 800); ctx.restore();
}
// red "STEP N" stamp + bold label
export function stepTag(ctx, n, label, x, y, a, light, T) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y + (1 - eo(a)) * 30);
  ctx.font = FONT(800, 46); const lw = ctx.measureText(label).width, sw = 190, tot = sw + 22 + lw; ctx.translate(-tot / 2, 0);
  ctx.save(); ctx.translate(sw / 2, 0); ctx.rotate(-.05 + .01 * Math.sin(T * 2)); const s = 1 + .6 * (1 - eback(clamp(a * 1.4))); ctx.scale(s, s);
  rr(ctx, -sw / 2, -34, sw, 68, 10); ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = 'rgba(255,59,59,.1)'; ctx.fill();
  txt(ctx, 'STEP ' + n, 0, 15, 40, C.red, 900); ctx.restore();
  txt(ctx, label, sw + 22, 16, 46, light ? C.ink : '#fff', 800, 'left'); ctx.restore();
}
// big rolling counter with small caps unit
export function counter(ctx, v, unit, x, y, { size = 120, col = '#fff', ucol = null, a = 1, pulse = 0, align = 'center' } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); const s = 1 + .12 * pulse; ctx.scale(s, s);
  ctx.font = FONT(900, size); const t = typeof v === 'string' ? v : num(v), w1 = ctx.measureText(t).width; ctx.font = FONT(800, size * .26); const w2 = unit ? ctx.measureText(unit).width + 16 : 0;
  const x0 = align === 'center' ? -(w1 + w2) / 2 : 0;
  ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 20; txt(ctx, t, x0, 0, size, col, 900, 'left'); ctx.shadowBlur = 0;
  if (unit) txt(ctx, unit.toUpperCase(), x0 + w1 + 16, -size * .06, size * .24, ucol || col, 800, 'left');
  ctx.restore();
}
export const pulseAt = (T, t0, d = .35) => T < t0 || T > t0 + d ? 0 : Math.sin((T - t0) / d * Math.PI);
export function cursor(ctx, x, y, press = 0, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 - .15 * press), s * (1 - .15 * press)); ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 44); ctx.lineTo(11, 33); ctx.lineTo(19, 51); ctx.lineTo(27, 47); ctx.lineTo(19, 30); ctx.lineTo(34, 30); ctx.closePath();
  ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
}
export function xmark(ctx, x, y, r, a, col = C.red) {
  if (a <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = r * .28; ctx.lineCap = 'round'; const k = eo(a);
  ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x - r + 2 * r * clamp(k * 2), y - r + 2 * r * clamp(k * 2)); ctx.stroke();
  if (k > .5) { ctx.beginPath(); ctx.moveTo(x + r, y - r); ctx.lineTo(x + r - 2 * r * clamp(k * 2 - 1), y - r + 2 * r * clamp(k * 2 - 1)); ctx.stroke(); } ctx.restore();
}
export function check(ctx, x, y, r, a, col = C.green) {
  if (a <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = r * .3; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const k = eo(a);
  const pts = [[x - r, y], [x - r * .3, y + r * .7], [x + r, y - r * .7]]; ctx.beginPath(); ctx.moveTo(...pts[0]);
  if (k < .4) ctx.lineTo(lerp(pts[0][0], pts[1][0], k / .4), lerp(pts[0][1], pts[1][1], k / .4)); else { ctx.lineTo(...pts[1]); const u = (k - .4) / .6; ctx.lineTo(lerp(pts[1][0], pts[2][0], u), lerp(pts[1][1], pts[2][1], u)); }
  ctx.stroke(); ctx.restore();
}
export function ripple(ctx, x, y, t, rgb = RGB.blue, r0 = 20, r1 = 160) {
  if (t <= 0 || t >= 1) return; ctx.save(); ctx.strokeStyle = `rgba(${rgb},${1 - t})`; ctx.lineWidth = 6 * (1 - t) + 1;
  ctx.beginPath(); ctx.arc(x, y, lerp(r0, r1, eo(t)), 0, 7); ctx.stroke(); ctx.restore();
}
export function sparks(ctx, x, y, t, n = 40, R = 420, cols = ['255,214,90', '255,90,60', '255,255,220']) { // burst, t 0..1
  if (t <= 0 || t >= 1) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const a = hash(i, 3) * 6.283, d = R * (.4 + .6 * hash(i, 4)) * eo(t), l = 30 + 50 * hash(i, 5);
    ctx.strokeStyle = `rgba(${cols[i % cols.length]},${1 - t})`; ctx.lineWidth = 5 * (1 - t) + 1;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d); ctx.lineTo(x + Math.cos(a) * (d + l * (1 - t)), y + Math.sin(a) * (d + l * (1 - t))); ctx.stroke(); }
  ctx.restore();
}

// ---------- agents ----------
// a little robot head: rounded helmet, dark visor, two glowing eyes, antenna
export function agentHead(ctx, x, y, s, rgb = RGB.cyan, { T = 0, seed = 0, glowA = 1, light = false } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 40, s / 40);
  if (glowA > 0) glow(ctx, 0, 0, 60, rgb, .7 * glowA);
  let g = ctx.createLinearGradient(0, -26, 0, 26); g.addColorStop(0, light ? '#ffffff' : '#e9eef6'); g.addColorStop(1, light ? '#cfd6e2' : '#9aa6b8');
  ctx.strokeStyle = '#b8c2d0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(0, -34); ctx.stroke();
  ctx.fillStyle = `rgb(${rgb})`; ctx.beginPath(); ctx.arc(0, -36, 4.5, 0, 7); ctx.fill();
  rr(ctx, -30, -24, 60, 48, 18); ctx.fillStyle = g; ctx.fill();
  rr(ctx, -23, -14, 46, 26, 11); ctx.fillStyle = '#141a26'; ctx.fill();
  const bl = (Math.sin(T * 1.7 + seed * 9) > .97) ? .2 : 1;
  ctx.fillStyle = `rgb(${rgb})`; rr(ctx, -15, -6, 9, 10 * bl, 4); ctx.fill(); rr(ctx, 6, -6, 9, 10 * bl, 4); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.5)'; rr(ctx, -26, -21, 22, 5, 3); ctx.fill();
  ctx.restore();
}
// cheap glowing agent dot for big swarms
export function agentDot(ctx, x, y, r, rgb, a = 1) {
  ctx.globalAlpha = a; ctx.fillStyle = `rgba(${rgb},.25)`; ctx.beginPath(); ctx.arc(x, y, r * 1.9, 0, 7); ctx.fill();
  ctx.fillStyle = `rgb(${mixc(rgb, '255,255,255', .35)})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  if (r > 4) { ctx.fillStyle = '#10131a'; ctx.fillRect(x - r * .62, y - r * .25, r * 1.24, r * .5); ctx.fillStyle = `rgb(${rgb})`; ctx.fillRect(x - r * .45, y - r * .15, r * .25, r * .3); ctx.fillRect(x + r * .2, y - r * .15, r * .25, r * .3); }
  ctx.globalAlpha = 1;
}
// orbiting ring swarm (tilted 3D ellipse). red 0..1 recolours, burst pushes out, n visible count
export function swarmRing(ctx, T, cx, cy, { n = 600, R = 330, tilt = .42, red = 0, burst = 0, back = true, front = true, size = 1, spread = 1 } = {}) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const lane = hash(i, 1), a = hash(i, 2) * 6.283 + T * (.25 + .12 * lane), rad = R * (.78 + .42 * lane * spread) + burst * 500 * hash(i, 7);
    const z = Math.sin(a), x = cx + Math.cos(a) * rad, y = cy + z * rad * tilt + (hash(i, 3) - .5) * 40 - burst * 300 * hash(i, 8) * (hash(i, 9) - .3);
    pts.push([x, y, z, i]);
  }
  pts.sort((p, q) => p[2] - q[2]);
  for (const [x, y, z, i] of pts) {
    if ((z < 0 && !back) || (z >= 0 && !front)) continue;
    const r = (5 + 4 * (z + 1)) * size, rgb = mixc(RGB.cyan, RGB.red, red * 1.3 - hash(i, 4) * .3);
    agentDot(ctx, x, y, r, rgb, (.55 + .45 * (z + 1) / 2) * (1 - burst * .8));
  }
}
// spherical cloud swarm
export function swarmSphere(ctx, T, cx, cy, { n = 700, R = 360, red = 1, dens = 1, a = 1 } = {}) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const u = hash(i, 1) * 2 - 1, th = hash(i, 2) * 6.283 + T * (.2 + .1 * hash(i, 5)), rr_ = Math.cbrt(hash(i, 3)) * R * lerp(1.15, .85, dens), s = Math.sqrt(1 - u * u);
    const x = Math.cos(th) * s * rr_, z = Math.sin(th) * s * rr_, y = u * rr_;
    pts.push([cx + x + 6 * Math.sin(T * 2 + i), cy + y + 6 * Math.cos(T * 1.7 + i), z, i]);
  }
  pts.sort((p, q) => p[2] - q[2]);
  for (const [x, y, z, i] of pts) agentDot(ctx, x, y, 3.2 + 2.8 * (z / R + 1), mixc(RGB.cyan, RGB.red, red), a * (.4 + .3 * (z / R + 1)));
}

// ---------- steel sandbox box (glass front, robot inside, padlock, red LED) ----------
export function sandbox(ctx, T, x, y, s, { armed = 0, noNet = 0, seed = 0, lock = 1, face = 1, open = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const w = 300, h = 250, d = 60; // front face centred at 0,0
  floorShadow(ctx, 20, h / 2 + 18, 230, .35);
  // top face
  ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(-w / 2 + d, -h / 2 - d * .6); ctx.lineTo(w / 2 + d, -h / 2 - d * .6); ctx.lineTo(w / 2, -h / 2); ctx.closePath();
  let g = ctx.createLinearGradient(0, -h / 2 - d, 0, -h / 2); g.addColorStop(0, '#f2f4f7'); g.addColorStop(1, '#b9bec7'); ctx.fillStyle = g; ctx.fill();
  // side face
  ctx.beginPath(); ctx.moveTo(w / 2, -h / 2); ctx.lineTo(w / 2 + d, -h / 2 - d * .6); ctx.lineTo(w / 2 + d, h / 2 - d * .6); ctx.lineTo(w / 2, h / 2); ctx.closePath();
  g = ctx.createLinearGradient(w / 2, 0, w / 2 + d, 0); g.addColorStop(0, '#8d939d'); g.addColorStop(1, '#6b717b'); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 3; for (let k = 0; k < 6; k++) { const yy = -h / 2 + 50 + k * 26; ctx.beginPath(); ctx.moveTo(w / 2 + 14, yy - 8); ctx.lineTo(w / 2 + d - 14, yy - 8 - (d - 28) * .6); ctx.stroke(); }
  // front frame
  g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, '#eef0f3'); g.addColorStop(.5, '#c3c8d0'); g.addColorStop(1, '#9ca2ac');
  rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 2; ctx.stroke();
  // glass window
  const gx = -w / 2 + 26, gy = -h / 2 + 34, gw = w - 52, gh = h - 60;
  g = ctx.createLinearGradient(0, gy, 0, gy + gh); g.addColorStop(0, armed ? `rgb(${mixc('28,56,92', '92,18,22', armed)})` : '#1c385c'); g.addColorStop(1, armed ? `rgb(${mixc('10,22,40', '40,6,8', armed)})` : '#0a1628');
  rr(ctx, gx, gy, gw, gh, 10); ctx.fillStyle = g; ctx.fill();
  if (face > 0) { ctx.save(); ctx.globalAlpha *= face; agentHead(ctx, 0, gy + gh * .55 + 5 * Math.sin(T * 2 + seed), 92, armed > .5 ? RGB.red : RGB.cyan, { T, seed }); ctx.restore(); }
  // reflection streaks
  ctx.save(); rr(ctx, gx, gy, gw, gh, 10); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.13)';
  const sh = ((T * 40 + seed * 70) % 500) - 120; ctx.beginPath(); ctx.moveTo(gx + sh, gy); ctx.lineTo(gx + sh + 60, gy); ctx.lineTo(gx + sh - 40, gy + gh); ctx.lineTo(gx + sh - 100, gy + gh); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(gx, gy, gw, 14); ctx.restore();
  rr(ctx, gx, gy, gw, gh, 10); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; ctx.stroke();
  // no-internet red slash
  if (noNet > 0) { ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(255,40,40,.8)'; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.moveTo(gx + 20, gy + 20); ctx.lineTo(gx + 20 + (gw - 40) * eo(noNet), gy + 20 + (gh - 40) * eo(noNet)); ctx.stroke(); ctx.restore(); }
  // screws, padlock, LED
  ctx.fillStyle = '#7d838d'; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a * (w / 2 - 12), b * (h / 2 - 12), 4.5, 0, 7); ctx.fill(); });
  if (lock > 0) padlock(ctx, -28, -h / 2 + 17, 15, lock, open);
  const led = .6 + .4 * Math.sin(T * 5 + seed); ctx.fillStyle = `rgba(255,${armed ? 40 : 60},${armed ? 40 : 60},${led})`; ctx.beginPath(); ctx.arc(28, -h / 2 + 17, 9, 0, 7); ctx.fill(); glow(ctx, 28, -h / 2 + 17, 30, RGB.red, led * .8);
  ctx.restore();
}
export function padlock(ctx, x, y, s, a = 1, open = 0, col = '#2b2f36') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.scale(s / 15, s / 15);
  ctx.strokeStyle = '#8b919b'; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.arc(0, -6 - 8 * open, 8, Math.PI, 0); ctx.lineTo(8, -1 - 8 * open); ctx.moveTo(-8, -6 - 8 * open); ctx.lineTo(-8, -1 - 8 * open + 8 * open); ctx.stroke();
  rr(ctx, -12, -4, 24, 19, 4); ctx.fillStyle = col; ctx.fill(); ctx.fillStyle = '#ffc23a'; ctx.beginPath(); ctx.arc(0, 4, 3, 0, 7); ctx.fill(); ctx.restore();
}
export function bigPadlock(ctx, x, y, s, open = 0, col = C.gold) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#c7ccd4'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, -40 - 40 * open, 38, Math.PI, 0); ctx.lineTo(38, -30 - 40 * open + 40 * open * 0); ctx.moveTo(-38, -40 - 40 * open); ctx.lineTo(-38, -20); ctx.stroke();
  const g = ctx.createLinearGradient(0, -30, 0, 60); g.addColorStop(0, '#ffd866'); g.addColorStop(1, '#d99a12'); rr(ctx, -62, -30, 124, 96, 18); ctx.fillStyle = col === C.gold ? g : col; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; rr(ctx, -54, -24, 108, 14, 7); ctx.fill(); ctx.fillStyle = '#5a3a00'; ctx.beginPath(); ctx.arc(0, 10, 11, 0, 7); ctx.fill(); ctx.fillRect(-4, 10, 8, 26); ctx.restore();
}

// ---------- server rack ----------
export function server(ctx, T, x, y, w, h, { red = 0, label = '', labelA = 1, units = 7, seed = 0, flag = 0 } = {}) {
  ctx.save(); const d = w * .16;
  floorShadow(ctx, x + d / 2, y + h / 2 + 12, w * .9, .5);
  // side + top
  ctx.beginPath(); ctx.moveTo(x + w / 2, y - h / 2); ctx.lineTo(x + w / 2 + d, y - h / 2 - d * .55); ctx.lineTo(x + w / 2 + d, y + h / 2 - d * .55); ctx.lineTo(x + w / 2, y + h / 2); ctx.closePath();
  ctx.fillStyle = red ? `rgb(${mixc('34,38,46', '70,14,18', red)})` : '#22262e'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - w / 2, y - h / 2); ctx.lineTo(x - w / 2 + d, y - h / 2 - d * .55); ctx.lineTo(x + w / 2 + d, y - h / 2 - d * .55); ctx.lineTo(x + w / 2, y - h / 2); ctx.closePath();
  ctx.fillStyle = red ? `rgb(${mixc('78,84,96', '140,40,44', red)})` : '#4e5460'; ctx.fill();
  let g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, red ? `rgb(${mixc('44,48,58', '96,18,24', red)})` : '#2c303a'); g.addColorStop(.5, red ? `rgb(${mixc('58,63,74', '128,26,32', red)})` : '#3a3f4a'); g.addColorStop(1, red ? `rgb(${mixc('36,40,48', '80,14,20', red)})` : '#242832');
  rr(ctx, x - w / 2, y - h / 2, w, h, 12); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.stroke();
  const pad = w * .1, uh = (h - pad * 2) / units;
  for (let k = 0; k < units; k++) {
    const uy = y - h / 2 + pad + k * uh; rr(ctx, x - w / 2 + pad, uy + 3, w - pad * 2, uh - 6, 5); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill();
    for (let v = 0; v < 5; v++) { ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(x - w / 2 + pad + 10 + v * (w * .09), uy + uh * .3, w * .05, uh * .4); }
    for (let l = 0; l < 3; l++) { const on = hash(k * 3 + l, seed + Math.floor(T * 6 + hash(k, l) * 6)) > .35;
      const col = red > .5 ? RGB.red : (l === 2 ? RGB.gold : RGB.green); ctx.fillStyle = `rgba(${col},${on ? 1 : .25})`;
      ctx.beginPath(); ctx.arc(x + w / 2 - pad - 12 - l * 16, uy + uh / 2, Math.max(2.5, uh * .1), 0, 7); ctx.fill(); }
  }
  ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(x - w / 2 + 4, y - h / 2 + 4, w * .08, h - 8);
  if (red > 0) glow(ctx, x, y, w * 1.4, RGB.red, red * .55);
  if (label && labelA > 0) { ctx.globalAlpha = clamp(labelA); ctx.font = MONO(700, 24); const lw = ctx.measureText(label).width + 26;
    rr(ctx, x - lw / 2, y - h / 2 - 66, lw, 40, 8); ctx.fillStyle = '#e8ebf0'; ctx.fill(); txt(ctx, label, x, y - h / 2 - 38, 24, '#1a1d24', 700, 'center', MONO); ctx.globalAlpha = 1; }
  if (flag > 0) { const fx = x + w * .2, fy = y - h / 2 - d * .3; ctx.strokeStyle = '#ddd'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, fy - 110 * eo(flag)); ctx.stroke();
    if (flag > .4) { const fh = eo((flag - .4) / .6); ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(fx, fy - 110); for (let i = 0; i <= 8; i++) ctx.lineTo(fx + 70 * fh * i / 8, fy - 110 + 6 * Math.sin(T * 6 - i) + 0); ctx.lineTo(fx + 70 * fh, fy - 66 + 6 * Math.sin(T * 6 - 8)); for (let i = 8; i >= 0; i--) ctx.lineTo(fx + 70 * fh * i / 8, fy - 66 + 6 * Math.sin(T * 6 - i)); ctx.fill(); } }
  ctx.restore();
}

// ---------- globe ----------
export function globe(ctx, T, x, y, r, { a = 1, red = 0, lit = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a);
  glow(ctx, x, y, r * 2.2, red ? RGB.red : RGB.cyan, .6 * lit);
  let g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r); g.addColorStop(0, red ? '#ff8a8a' : '#8fd8ff'); g.addColorStop(.6, red ? '#c22a2a' : '#2b7fd4'); g.addColorStop(1, red ? '#5a0b0b' : '#0d3a74');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = Math.max(1.5, r * .03);
  for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.ellipse(x, y + k * r * .38, r * Math.sqrt(1 - (k * .38) ** 2), r * .08, 0, 0, 7); ctx.stroke(); }
  for (let k = 0; k < 4; k++) { const ph = (T * .5 + k / 4) % 1, rx = r * Math.cos(ph * Math.PI); ctx.beginPath(); ctx.ellipse(x, y, Math.abs(rx), r, 0, 0, 7); ctx.stroke(); }
  ctx.restore(); ctx.restore();
}
// glowing cable with travelling packets
export function cable(ctx, T, pts, { a = 1, col = '120,140,170', packets = 0, prgb = RGB.gold, speed = .5, w = 6, draw = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const seg = []; let L = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
  const at = u => { let d = u * L; for (let i = 0; i < seg.length; i++) { if (d <= seg[i]) { const k = d / seg[i]; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; } d -= seg[i]; } return pts[pts.length - 1]; };
  ctx.beginPath(); ctx.moveTo(...pts[0]); const steps = 60; for (let s = 1; s <= steps * draw; s++) ctx.lineTo(...at(s / steps));
  ctx.strokeStyle = `rgba(${col},.9)`; ctx.lineWidth = w; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = w * .35; ctx.stroke();
  for (let i = 0; i < packets; i++) { const u = (T * speed + i / packets) % 1; if (u > draw) continue; const [px, py] = at(u);
    glow(ctx, px, py, 26, prgb, 1); ctx.fillStyle = `rgb(${prgb})`; rr(ctx, px - 8, py - 8, 16, 16, 4); ctx.fill(); }
  ctx.restore(); return at;
}

// ---------- logos ----------
import { IMG } from './assets.js';
export function logo(ctx, name, x, y, w, a = 1) {
  const i = IMG[name]; if (!i || a <= 0) return 0; const h = w * i.height / i.width;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.drawImage(i, x - w / 2, y - h / 2, w, h); ctx.restore(); return h;
}
// reticle / target
export function reticle(ctx, T, x, y, r, a = 1, col = C.red) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.rotate(T * .8); ctx.strokeStyle = col; ctx.lineWidth = 6;
  for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(0, 0, r, k * Math.PI / 2 + .25, k * Math.PI / 2 + Math.PI / 2 - .25); ctx.stroke(); }
  ctx.lineWidth = 5; for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(r * .78, 0); ctx.lineTo(r * 1.18, 0); ctx.stroke(); }
  ctx.restore();
}
// bug icon (zero-day)
export function bugIcon(ctx, T, x, y, s, col = C.red) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 40, s / 40); ctx.strokeStyle = '#222'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let k = -1; k <= 1; k++) { const w = 6 * Math.sin(T * 14 + k); ctx.beginPath(); ctx.moveTo(-20, k * 12); ctx.lineTo(-36, k * 14 + w); ctx.moveTo(20, k * 12); ctx.lineTo(36, k * 14 - w); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-6, -26); ctx.lineTo(-14, -40); ctx.moveTo(6, -26); ctx.lineTo(14, -40); ctx.stroke();
  ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(0, -22, 12, 0, 7); ctx.fill();
  const g = ctx.createRadialGradient(-6, -6, 3, 0, 4, 28); g.addColorStop(0, '#ff8a80'); g.addColorStop(1, col); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 6, 22, 28, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#222'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, 34); ctx.stroke();
  ctx.fillStyle = '#222'; [[-10, 0], [10, 10], [-9, 18], [9, -6]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a, b, 4, 0, 7); ctx.fill(); }); ctx.restore();
}
// folder icon
export function folder(ctx, x, y, w, { col = '#f3c64d', open = 0, label = '' } = {}) {
  const h = w * .72; ctx.save(); ctx.translate(x, y);
  ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
  ctx.fillStyle = shade(col, -.18); rr(ctx, -w / 2, -h / 2, w * .42, h * .3, 8); ctx.fill(); rr(ctx, -w / 2, -h / 2 + h * .12, w, h * .88, 10); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#fff'; rr(ctx, -w / 2 + w * .08, -h / 2 + h * .2 - open * h * .25, w * .84, h * .6, 4); ctx.fill();
  const g = ctx.createLinearGradient(0, -h / 2 + h * .3, 0, h / 2); g.addColorStop(0, shade(col, .12)); g.addColorStop(1, col);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2 + h * .32); ctx.lineTo(w / 2, -h / 2 + h * .32); ctx.lineTo(w / 2 - 4, h / 2); ctx.lineTo(-w / 2 + 4, h / 2); ctx.closePath(); ctx.fill();
  if (label) txt(ctx, label, 0, h * .3, w * .1, '#5a3d00', 900);
  ctx.restore();
}
export function shade(hex, k) { const n = parseInt(hex.slice(1), 16), f = c => Math.round(clamp(k > 0 ? c + (255 - c) * k : c * (1 + k), 0, 255)); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }
// note paper with squiggle lines
export function note(ctx, x, y, w, rot = 0, col = '#fff6c9', lines = 3, T = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5;
  ctx.fillStyle = col; ctx.fillRect(-w / 2, -w * .4, w, w * .8); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(60,70,90,.65)'; ctx.lineWidth = 2;
  for (let k = 0; k < lines; k++) { ctx.beginPath(); const yy = -w * .2 + k * w * .2; for (let i = 0; i <= 10; i++) ctx.lineTo(-w * .38 + i * w * .07 * (k === lines - 1 ? .7 : 1), yy + 3 * Math.sin(i * 1.7 + k)); ctx.stroke(); }
  ctx.restore();
}
// chat bubble
export function bubble(ctx, x, y, w, h, col = C.blue, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); rr(ctx, x, y, w, h, h / 2.4); ctx.fillStyle = col; ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 14, y + h - 4); ctx.lineTo(x + 6, y + h + 10); ctx.lineTo(x + 28, y + h - 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)'; rr(ctx, x + 14, y + h * .32, w * .6, h * .14, 3); ctx.fill(); rr(ctx, x + 14, y + h * .58, w * .38, h * .14, 3); ctx.fill(); ctx.restore();
}
// key (for the key ring)
export function key(ctx, x, y, ang, s, { col = '#d6dae2', head = C.gold, a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  let g = ctx.createLinearGradient(-8, 0, 8, 0); g.addColorStop(0, shade('#d6dae2', -.25)); g.addColorStop(.5, col); g.addColorStop(1, shade('#d6dae2', -.35));
  ctx.fillStyle = g; rr(ctx, -7, 20, 14, 92, 3); ctx.fill();
  for (let k = 0; k < 4; k++) { ctx.fillRect(7, 62 + k * 12, 10 - (k % 2) * 4, 7); }
  g = ctx.createRadialGradient(-6, -4, 2, 0, 0, 26); g.addColorStop(0, shade(head.startsWith('#') ? head : '#ffc23a', .4)); g.addColorStop(1, head); ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, 24, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(0, -8, 7, 0, 7); ctx.fill();
  ctx.restore();
}
// paper calendar page
export function calendar(ctx, x, y, w, { circle = 0, title = 'JULY 2026', days = [] } = {}) {
  const h = w * .95; ctx.save(); ctx.translate(x, y); card(ctx, -w / 2, -h / 2, w, h, { r: 18 });
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h * .2, 18); ctx.clip(); ctx.fillStyle = '#1b1d22'; ctx.fillRect(-w / 2, -h / 2, w, h * .2); ctx.restore();
  txt(ctx, title, 0, -h / 2 + h * .135, w * .085, '#fff', 800);
  const cw = w / 7.6, x0 = -w / 2 + w * .06; ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) => txt(ctx, d, x0 + cw * (i + .5), -h / 2 + h * .29, w * .04, '#999', 700));
  for (let d = 1; d <= 31; d++) { const idx = d + 1, col = idx % 7, row = Math.floor(idx / 7); const cx = x0 + cw * (col + .5), cy = -h / 2 + h * .4 + row * h * .12;
    const hot = days.includes(d); txt(ctx, String(d), cx, cy, w * .05, hot ? C.red : (col > 4 ? '#111' : '#444'), hot ? 900 : 600);
    if (hot && circle > 0) { ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy - w * .018, w * .042, -1.6, -1.6 + 6.3 * eo(circle)); ctx.stroke(); } }
  ctx.restore();
}
// daily calendar tile
export function dayTile(ctx, x, y, s, month, day, flip = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); card(ctx, -80, -80, 160, 170, { r: 20 });
  ctx.save(); rr(ctx, -80, -80, 160, 44, 20); ctx.clip(); ctx.fillStyle = C.red; ctx.fillRect(-80, -80, 160, 44); ctx.restore();
  txt(ctx, month, 0, -49, 24, '#fff', 900); ctx.save(); ctx.scale(1, Math.abs(Math.cos(flip * Math.PI)) || .01); txt(ctx, String(day), 0, 40, 92, '#111', 900); ctx.restore(); ctx.restore();
}
