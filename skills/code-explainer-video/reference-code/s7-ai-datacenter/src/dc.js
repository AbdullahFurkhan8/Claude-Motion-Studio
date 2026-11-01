// Drawing kit for the "AI data centers in space" explainer. Pure functions of their inputs + time T (deterministic).
// Everything is drawn in code except the user's Earth globe, NVIDIA rack photo, Google and SpaceX wordmarks (src/assets/, keyed out).
import { W, H, clamp, lerp, eo, eio, eback, hash, rr } from './lib.js';
import { FONT, MONO, txt, tw, bin, pop, glowDot, pill, bar, logo } from './kit.js';
import { IMG } from './assets.js';

export const HOT = '#ff5a3c', HOT_RGB = '255,90,60', COLD_RGB = '120,200,255', SUN_RGB = '255,205,90', AI_RGB = '93,224,255', MINT = '#7dffb0', MINT_RGB = '125,255,176';

export function space(ctx, T, { tint = '30,56,130', gx = W / 2, gy = 1150, glow = 1, stars = 110 } = {}) {
  let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#04060d'); g.addColorStop(.55, '#080d1e'); g.addColorStop(1, '#03050a');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  if (glow > 0) { const r = 760 + 50 * Math.sin(T * .7); g = ctx.createRadialGradient(gx, gy, 20, gx, gy, r); g.addColorStop(0, `rgba(${tint},${.3 * glow})`); g.addColorStop(.55, `rgba(${tint},${.09 * glow})`); g.addColorStop(1, `rgba(${tint},0)`); ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3); }
  ctx.fillStyle = '#fff';
  for (let i = 0; i < stars; i++) { const x = ((hash(i) * W + T * (4 + 10 * hash(i, 2))) % W + W) % W, y = ((hash(i, 1) * H - T * 6 * hash(i, 3)) % H + H) % H;
    ctx.globalAlpha = (.12 + .55 * hash(i, 4)) * (.55 + .45 * Math.sin(T * (1 + 2 * hash(i, 6)) + i)); ctx.beginPath(); ctx.arc(x, y, .7 + 1.7 * hash(i, 5), 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .85); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); ctx.fillStyle = v; ctx.fillRect(-W, -H, W * 3, H * 3);
}
export function paper(ctx, T) { // light scene background
  ctx.fillStyle = '#f2f4f8'; ctx.fillRect(-W, -H, W * 3, H * 3);
  const off = (T * 6) % 60; ctx.strokeStyle = 'rgba(20,30,60,.05)'; ctx.lineWidth = 1.2; ctx.beginPath();
  for (let x = -60 + off; x <= W + 60; x += 60) { ctx.moveTo(x, -200); ctx.lineTo(x, H + 200); } for (let y = -60 + off * .5; y <= H + 60; y += 60) { ctx.moveTo(-200, y); ctx.lineTo(W + 200, y); } ctx.stroke();
  const g = ctx.createRadialGradient(W / 2, 1050, 50, W / 2, 1050, 1100); g.addColorStop(0, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(215,222,235,.4)'); ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
}
export function tag(ctx, x, y, s, a = 1, lx, ly, { rgb = '235,240,248', size = 22, light = false } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a);
  ctx.font = MONO(700, size); ctx.letterSpacing = '2px'; const w = ctx.measureText(s).width + 30, h = size * 1.75;
  if (lx != null) { const k = eo(a); ctx.strokeStyle = `rgba(${rgb},.85)`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lerp(x, lx, k), lerp(y, ly, k)); ctx.stroke(); ctx.fillStyle = `rgb(${rgb})`; ctx.beginPath(); ctx.arc(lerp(x, lx, k), lerp(y, ly, k), 7, 0, 7); ctx.fill(); }
  rr(ctx, x - w / 2, y - h / 2, w, h, 8); ctx.fillStyle = light ? 'rgba(255,255,255,.95)' : 'rgba(10,12,18,.88)'; ctx.fill(); ctx.strokeStyle = `rgba(${rgb},.9)`; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = light ? '#14161c' : `rgb(${rgb})`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 1, y + 1); ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '0px'; ctx.restore();
}
export function stamp(ctx, k, x, y, s, { col = '#fff', bg = 'rgba(12,14,18,.92)', size = 70, rot = -.08 } = {}) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ctx.globalAlpha *= clamp(k * 1.4);
  ctx.font = FONT(900, size); ctx.letterSpacing = '4px'; const w = ctx.measureText(s).width + 70, h = size * 1.5;
  rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.stroke(); ctx.lineWidth = 2; rr(ctx, -w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 10); ctx.stroke();
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 3, 4); ctx.restore();
}
export function title(ctx, a, head, sub, { y = 600, col = '#fff', size = 74, glow, x = W / 2, subCol = 'rgba(210,216,226,.78)' } = {}) {
  bin(ctx, a, () => {
    ctx.save(); ctx.font = FONT(900, size); let s = size; while (ctx.measureText(head).width > 960 && s > 30) { s -= 2; ctx.font = FONT(900, s); }
    ctx.textAlign = 'center'; if (glow) { ctx.shadowColor = `rgba(${glow},.75)`; ctx.shadowBlur = 30; } ctx.fillStyle = col; ctx.fillText(head, x, y); ctx.restore();
    if (sub) { ctx.save(); ctx.letterSpacing = '5px'; txt(ctx, sub, x, y + 50, 24, subCol, 700, 'center', MONO); ctx.restore(); }
  });
}
export function panel(ctx, x, y, w, h, r = 30, { light = false } = {}) { // glossy glass card
  ctx.save(); ctx.shadowColor = light ? 'rgba(30,40,80,.25)' : 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; rr(ctx, x, y, w, h, r);
  const g = ctx.createLinearGradient(x, y, x, y + h); if (light) { g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#eef1f7'); } else { g.addColorStop(0, 'rgba(36,42,58,.95)'); g.addColorStop(1, 'rgba(14,17,26,.95)'); }
  ctx.fillStyle = g; ctx.fill(); ctx.restore();
  ctx.save(); rr(ctx, x, y, w, h, r); ctx.strokeStyle = light ? 'rgba(20,30,60,.1)' : 'rgba(255,255,255,.14)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
}
export const arrow = (ctx, x0, y0, x1, y1, { col = '255,205,90', w = 14, head = 2.4, a = 1 } = {}) => {
  if (a <= 0) return; const ang = Math.atan2(y1 - y0, x1 - x0), hl = w * head;
  ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round'; ctx.strokeStyle = `rgba(${col},.2)`; ctx.lineWidth = w * 2.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(ang) * hl * .6, y1 - Math.sin(ang) * hl * .6); ctx.stroke();
  ctx.strokeStyle = `rgb(${col})`; ctx.lineWidth = w; ctx.stroke(); ctx.fillStyle = `rgb(${col})`; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(ang - .5) * hl * 1.2, y1 - Math.sin(ang - .5) * hl * 1.2); ctx.lineTo(x1 - Math.cos(ang + .5) * hl * 1.2, y1 - Math.sin(ang + .5) * hl * 1.2); ctx.closePath(); ctx.fill(); ctx.restore();
};

// ---------- Earth (user globe) ----------
export function earth(ctx, T, x, y, r, { a = 1, glow = 1, spin = .03, clouds = 1, shade = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  if (glow > 0) glowDot(ctx, x, y, r * 1.32, '90,160,255', .75 * glow);
  const im = IMG.globe; ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
  ctx.fillStyle = '#0b2a5a'; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.save(); ctx.translate(x, y); ctx.rotate(T * spin); const k = 1.03; if (im) ctx.drawImage(im, -r * k, -r * k, r * 2 * k, r * 2 * k); ctx.restore();
  if (clouds > 0) { ctx.fillStyle = `rgba(255,255,255,${.2 * clouds})`; for (let i = 0; i < 9; i++) { const u = ((hash(i, 6) + T * .012 * (1 + i % 3)) % 1), cx = x + (u * 2.4 - 1.2) * r, cy = y + (hash(i, 7) - .5) * r * 1.5; ctx.beginPath(); ctx.ellipse(cx, cy, r * (.2 + .12 * hash(i, 8)), r * .05, 0, 0, 7); ctx.fill(); } }
  if (shade > 0) { const g = ctx.createRadialGradient(x - r * .45, y - r * .4, r * .25, x + r * .1, y + r * .1, r * 1.25); g.addColorStop(0, 'rgba(0,0,10,0)'); g.addColorStop(.6, `rgba(0,0,12,${.28 * shade})`); g.addColorStop(1, `rgba(0,0,12,${.82 * shade})`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  ctx.restore();
  ctx.strokeStyle = 'rgba(150,205,255,.55)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.restore();
}
export function sun(ctx, T, x, y, r, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; glowDot(ctx, x, y, r * 4, SUN_RGB, .9);
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${SUN_RGB},.55)`; ctx.lineWidth = r * .1; ctx.lineCap = 'round';
  for (let i = 0; i < 14; i++) { const an = i * Math.PI / 7 + T * .25, l = r * (1.35 + .25 * Math.sin(T * 2 + i)); ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r * 1.2, y + Math.sin(an) * r * 1.2); ctx.lineTo(x + Math.cos(an) * l * 1.25, y + Math.sin(an) * l * 1.25); ctx.stroke(); }
  ctx.globalCompositeOperation = 'source-over'; const g = ctx.createRadialGradient(x - r * .2, y - r * .2, r * .1, x, y, r); g.addColorStop(0, '#fff7d0'); g.addColorStop(.6, '#ffc83c'); g.addColorStop(1, '#ff8a1c'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore();
}

// ---------- satellite (front view): silver body, 4 AI chips behind a window, gold foil base, solar wings, optional radiators ----------
export function solar(ctx, T, x, y, w, h, { glow = 0, seed = 0, sheen = 1, cols = 6, rows = 3 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.shadowColor = glow > 0 ? `rgba(${SUN_RGB},${.6 * glow})` : 'rgba(0,0,0,.4)'; ctx.shadowBlur = glow > 0 ? 34 : 12;
  let g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#2c5ad0'); g.addColorStop(.5, '#1a3a98'); g.addColorStop(1, '#0d2166'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(170,205,255,.5)'; ctx.lineWidth = 1.8; ctx.beginPath();
  for (let i = 1; i < cols; i++) { ctx.moveTo(w * i / cols, 0); ctx.lineTo(w * i / cols, h); } for (let j = 1; j < rows; j++) { ctx.moveTo(0, h * j / rows); ctx.lineTo(w, h * j / rows); } ctx.stroke();
  ctx.strokeStyle = 'rgba(255,205,120,.85)'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, w, h);
  if (sheen > 0) { const u = ((T * .35 + seed * .3) % 1.6) - .3; g = ctx.createLinearGradient(w * (u - .15), 0, w * (u + .15), h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, `rgba(255,255,255,${.28 * sheen})`); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
  ctx.restore();
}
export function chipSq(ctx, T, x, y, w, { heat = 0, cold = 0, on = 1, i = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); const hot = heat, g = ctx.createLinearGradient(-w / 2, -w / 2, w / 2, w / 2);
  g.addColorStop(0, hot > .1 ? `rgb(${Math.round(lerp(60, 255, hot))},${Math.round(lerp(70, 70, hot))},${Math.round(lerp(80, 50, hot))})` : '#3a4458'); g.addColorStop(1, hot > .1 ? `rgb(${Math.round(lerp(30, 190, hot))},30,30)` : '#171c28');
  if (hot > .05) { ctx.shadowColor = `rgba(${HOT_RGB},${hot})`; ctx.shadowBlur = 30 * hot; }
  rr(ctx, -w / 2, -w / 2, w, w, w * .14); ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = hot > .1 ? `rgba(255,${Math.round(lerp(220, 120, hot))},100,.9)` : cold > 0 ? `rgba(${COLD_RGB},.9)` : 'rgba(93,224,255,.85)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 1.5; ctx.strokeRect(-w * .28, -w * .28, w * .56, w * .56);
  txt(ctx, 'TPU', 0, w * .1, w * .27, hot > .3 ? '#ffe3d0' : '#cdeeff', 900, 'center', MONO);
  if (on) { const b = .5 + .5 * Math.sin(T * 4 + i * 1.7); ctx.fillStyle = hot > .3 ? '#fff' : `rgba(93,224,255,${.35 + .6 * b})`; ctx.beginPath(); ctx.arc(w * .32, -w * .32, 3.2, 0, 7); ctx.fill(); }
  ctx.restore();
}
export function sat(ctx, T, x, y, s, { heat = 0, cold = 0, wings = 1, rad = 0, radGlow = 0, rot = 0, sunGlow = 0, lit = 1, dish = 1, chips = 1 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  // radiators extend above and below the body (heat leaves as red glow)
  if (rad > 0) { const L = 360 * rad; [-1, 1].forEach(d => { ctx.save(); ctx.translate(0, d * (150 + L / 2)); ctx.shadowColor = `rgba(${HOT_RGB},${.7 * radGlow})`; ctx.shadowBlur = 50 * radGlow;
    const g = ctx.createLinearGradient(-110, 0, 110, 0); g.addColorStop(0, radGlow > 0 ? '#e9b9ae' : '#d7dde8'); g.addColorStop(.5, radGlow > 0 ? '#ff8a72' : '#f4f6fa'); g.addColorStop(1, radGlow > 0 ? '#d97a68' : '#b6bfce');
    ctx.fillStyle = g; ctx.fillRect(-110, -L / 2, 220, L); ctx.shadowBlur = 0; ctx.strokeStyle = radGlow > 0 ? 'rgba(130,20,10,.45)' : 'rgba(80,90,110,.35)'; ctx.lineWidth = 2;
    for (let k = -4; k <= 4; k++) { ctx.beginPath(); ctx.moveTo(k * 24, -L / 2); ctx.lineTo(k * 24, L / 2); ctx.stroke(); } for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(-110, -L / 2 + L * k / 6); ctx.lineTo(110, -L / 2 + L * k / 6); ctx.stroke(); }
    ctx.restore(); }); }
  if (wings > 0) { const wl = 330 * wings; [-1, 1].forEach(d => { ctx.fillStyle = '#9aa3b2'; ctx.fillRect(d * 130 - (d > 0 ? 0 : 60), -8, 60, 16); ctx.save(); ctx.translate(d * 190, 0); solar(ctx, T, d > 0 ? 0 : -wl, -80, wl, 160, { glow: sunGlow, seed: d, cols: 6, rows: 3 }); ctx.restore(); }); }
  if (dish) { ctx.save(); ctx.translate(-70, 170); ctx.rotate(.5 + .12 * Math.sin(T * .8)); ctx.fillStyle = '#c8cfdb'; ctx.beginPath(); ctx.ellipse(0, 40, 36, 12, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#e8ecf3'; ctx.beginPath(); ctx.arc(0, 38, 34, Math.PI, 0); ctx.fill(); ctx.strokeStyle = '#8b94a4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 36); ctx.lineTo(0, 0); ctx.stroke(); ctx.restore(); }
  // body
  ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 14; rr(ctx, -140, -160, 280, 320, 20);
  let g = ctx.createLinearGradient(-140, -160, 140, 160); g.addColorStop(0, '#f1f4f9'); g.addColorStop(.6, '#c4cbd8'); g.addColorStop(1, '#8d96a6'); ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.save(); rr(ctx, -140, -160, 280, 320, 20); ctx.clip(); g = ctx.createLinearGradient(0, 70, 0, 160); g.addColorStop(0, '#f2c14e'); g.addColorStop(.5, '#d9962e'); g.addColorStop(1, '#a8651a'); ctx.fillStyle = g; ctx.fillRect(-140, 70, 280, 100);
  ctx.strokeStyle = 'rgba(120,70,10,.35)'; ctx.lineWidth = 2; for (let k = -6; k <= 6; k++) { ctx.beginPath(); ctx.moveTo(k * 26, 70); ctx.lineTo(k * 26 + 14, 170); ctx.stroke(); } ctx.restore();
  if (chips) { rr(ctx, -112, -132, 224, 188, 12); ctx.fillStyle = '#0a1311'; ctx.fill(); ctx.strokeStyle = 'rgba(120,200,170,.4)'; ctx.lineWidth = 2; ctx.stroke();
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b], i) => chipSq(ctx, T, a * 52, -38 + b * 46, 78, { heat, cold, i })); }
  if (heat > .05) { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 0, -40, 230, HOT_RGB, heat * .55); ctx.globalCompositeOperation = 'source-over'; }
  if (cold > 0) { ctx.fillStyle = `rgba(190,230,255,${.55 * cold})`; for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.arc(-130 + hash(i, 3) * 260, -150 + hash(i, 4) * 300, 2 + 2.5 * hash(i, 5), 0, 7); ctx.fill(); } }
  ctx.restore();
}
// shimmering heat wisps rising from (x,y)
export function wisps(ctx, T, x, y, w, a = 1, n = 7, col = HOT_RGB) {
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const u = (T * .5 + hash(i, 2)) % 1, xx = x + (i / (n - 1) - .5) * w, hh = 150 + 110 * hash(i, 3); ctx.strokeStyle = `rgba(${col},${.7 * a * Math.sin(u * Math.PI)})`; ctx.lineWidth = 5; ctx.beginPath();
    for (let k = 0; k <= 12; k++) { const t = k / 12, yy = y - u * hh - t * 80; k ? ctx.lineTo(xx + Math.sin(T * 3 + i + t * 6) * 14, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
  ctx.restore();
}
// expanding infrared rings around (x,y)
export function irRings(ctx, T, x, y, r0, r1, a = 1, { n = 4, col = HOT_RGB, per = 2.4 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const u = (T / per + i / n) % 1; ctx.strokeStyle = `rgba(${col},${.8 * a * (1 - u)})`; ctx.lineWidth = 6 * (1 - u) + 1.5; ctx.beginPath(); ctx.arc(x, y, lerp(r0, r1, u), 0, 7); ctx.stroke(); }
  ctx.restore();
}
// radial light rays leaving (x,y)
export function rays(ctx, T, x, y, r0, r1, a = 1, { n = 22, col = SUN_RGB } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const an = i / n * Math.PI * 2 + .2, u = (T * .8 + hash(i, 4)) % 1, a0 = lerp(r0, r1, u * .6), a1 = lerp(r0, r1, .35 + u * .65);
    ctx.strokeStyle = `rgba(${col},${.9 * a * Math.sin(u * Math.PI)})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * a0, y + Math.sin(an) * a0); ctx.lineTo(x + Math.cos(an) * a1, y + Math.sin(an) * a1); ctx.stroke(); }
  ctx.restore();
}

// ---------- laptop motherboard, top-down: CPU, heat pipe, fan, airflow ----------
export function board(ctx, T, x, y, w, { heat = 0, fan = 1, broken = 0, air = 1, labels = 1, a = 1 } = {}) {
  if (a <= 0) return; const h = w * .74; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; rr(ctx, -w / 2, -h / 2, w, h, 30); let g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, '#16382b'); g.addColorStop(1, '#0a1f18'); ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 30); ctx.clip(); ctx.strokeStyle = 'rgba(120,230,170,.2)'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  for (let i = 0; i < 20; i++) { let px = -w / 2 + hash(i, 1) * w, py = -h / 2 + hash(i, 2) * h; ctx.beginPath(); ctx.moveTo(px, py); for (let k = 0; k < 3; k++) { px += (hash(i * 3 + k, 3) - .5) * 220; py += (hash(i * 3 + k, 4) - .5) * 120; ctx.lineTo(px, py); } ctx.stroke(); }
  for (let i = 0; i < 12; i++) { ctx.fillStyle = 'rgba(15,20,26,.9)'; ctx.fillRect(-w / 2 + 40 + hash(i, 5) * (w - 140), -h / 2 + 30 + hash(i, 6) * (h - 100), 28 + 30 * hash(i, 7), 16 + 14 * hash(i, 8)); }
  ctx.restore();
  const cx = -w * .22, fx = w * .22, cw = w * .2; // CPU, fan
  ctx.strokeStyle = heat > .3 ? '#ff9a4a' : '#d98a3a'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx + cw * .5, -h * .08); ctx.bezierCurveTo(cx + 150, -h * .32, fx - 160, -h * .32, fx - 40, -h * .1); ctx.stroke(); ctx.strokeStyle = 'rgba(255,230,180,.45)'; ctx.lineWidth = 6; ctx.stroke();
  // fan housing + blades
  ctx.fillStyle = '#12161d'; ctx.beginPath(); ctx.arc(fx, 0, w * .2, 0, 7); ctx.fill(); ctx.strokeStyle = '#2a323f'; ctx.lineWidth = 6; ctx.stroke();
  ctx.save(); ctx.translate(fx, 0); const spin = fan * (1 - broken) * T * 11; ctx.rotate(spin + broken * .5);
  for (let i = 0; i < 9; i++) { ctx.save(); ctx.rotate(i * Math.PI * 2 / 9); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(w * .05, -w * .02, w * .17, -w * .05, w * .17, w * .05); ctx.bezierCurveTo(w * .1, w * .02, w * .04, w * .03, 0, 0); ctx.fillStyle = fan * (1 - broken) > .5 ? 'rgba(220,230,245,.85)' : 'rgba(150,160,175,.85)'; ctx.fill(); ctx.restore(); }
  ctx.fillStyle = '#4a5260'; ctx.beginPath(); ctx.arc(0, 0, w * .04, 0, 7); ctx.fill(); ctx.restore();
  // CPU die
  ctx.save(); ctx.translate(cx, -h * .08); if (heat > .05) { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 0, 0, cw * 1.9, HOT_RGB, heat); ctx.globalCompositeOperation = 'source-over'; }
  rr(ctx, -cw / 2, -cw / 2, cw, cw, 14); g = ctx.createLinearGradient(-cw / 2, -cw / 2, cw / 2, cw / 2); g.addColorStop(0, heat > .3 ? `rgb(255,${Math.round(lerp(150, 70, heat))},60)` : '#8b93a3'); g.addColorStop(1, heat > .3 ? '#a0200e' : '#444c5c'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 3; ctx.stroke();
  txt(ctx, 'CPU', 0, 10, 32, '#fff', 900, 'center', MONO); ctx.restore();
  // airflow: blue streaks in from the left, over the chip, red with heat out through the right vents
  if (air > 0) { ctx.save(); ctx.lineCap = 'round'; for (let i = 0; i < 11; i++) { const u = (T * .55 + hash(i, 2)) % 1, yy = -h * .34 + hash(i, 3) * h * .66, xx = lerp(-w * .62, w * .62, u), hotk = clamp((xx - cx) / 200) * (.35 + heat * .65);
      const r = Math.round(lerp(110, 255, hotk)), gg = Math.round(lerp(200, 90, hotk)), bl = Math.round(lerp(255, 60, hotk)); ctx.strokeStyle = `rgba(${r},${gg},${bl},${.85 * air * Math.sin(u * Math.PI)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xx - 70, yy + Math.sin(T * 3 + i) * 5); ctx.lineTo(xx + 30, yy); ctx.stroke(); } ctx.restore(); }
  if (broken > 0) { const k = eback(broken); ctx.save(); ctx.translate(fx, 0); ctx.scale(k, k); ctx.strokeStyle = '#ff4a3d'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(255,60,40,.9)'; ctx.shadowBlur = 26; ctx.beginPath(); ctx.moveTo(-90, -90); ctx.lineTo(90, 90); ctx.moveTo(90, -90); ctx.lineTo(-90, 90); ctx.stroke(); ctx.restore(); }
  ctx.restore(); return { cx: x + cx, cy: y - h * .08, fx: x + fx, fy: y, h };
}

// ---------- props ----------
export function flame(ctx, T, x, y, s, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 0, -120, 330, '255,140,40', .55);
  [['255,70,20', 1, 1], ['255,150,30', .75, 1.2], ['255,230,120', .45, 1.5]].forEach(([rgb, k, sp], i) => { const f = Math.sin(T * 7 * sp + i) * 10, f2 = Math.sin(T * 11 * sp + i * 2) * 8; ctx.fillStyle = `rgba(${rgb},.9)`; ctx.beginPath(); ctx.moveTo(-90 * k, 0);
    ctx.bezierCurveTo(-110 * k + f2, -130 * k, -30 * k + f, -200 * k, f2, -330 * k - f * 2); ctx.bezierCurveTo(40 * k + f, -200 * k, 110 * k - f2, -120 * k, 90 * k, 0); ctx.closePath(); ctx.fill(); });
  ctx.globalCompositeOperation = 'source-over'; ctx.restore();
}
export function logs(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); [[-1, 0], [1, 0]].forEach(([d]) => { ctx.save(); ctx.rotate(d * .22); const g = ctx.createLinearGradient(0, -20, 0, 24); g.addColorStop(0, '#7a5230'); g.addColorStop(1, '#3a2514'); ctx.fillStyle = g; rr(ctx, -150, -22, 300, 46, 22); ctx.fill(); ctx.fillStyle = '#b9895a'; ctx.beginPath(); ctx.ellipse(d * 150, 1, 14, 22, 0, 0, 7); ctx.fill(); ctx.restore(); });
  [-170, 170].forEach(dx => { ctx.fillStyle = '#5d6168'; ctx.beginPath(); ctx.ellipse(dx, 40, 44, 28, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.ellipse(dx - 8, 30, 24, 12, 0, 0, 7); ctx.fill(); }); ctx.restore();
}
export function hand(ctx, T, x, y, s, { rot = 0, glow = 0, a = 1 } = {}) { // open palm, fingers up
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const sk = glow > 0 ? `rgb(${Math.round(lerp(236, 255, glow))},${Math.round(lerp(178, 150, glow))},${Math.round(lerp(140, 110, glow))})` : '#ecb28c';
  ctx.shadowColor = glow > 0 ? `rgba(255,120,60,${glow})` : 'rgba(0,0,0,.4)'; ctx.shadowBlur = 30; ctx.fillStyle = sk;
  rr(ctx, -74, -40, 148, 170, 50); ctx.fill(); [[-56, 120], [-19, 150], [19, 156], [54, 130]].forEach(([fx, fl], i) => { rr(ctx, fx - 17, -40 - fl, 34, fl + 30, 17); ctx.fill(); });
  ctx.save(); ctx.translate(-70, 40); ctx.rotate(-.9); rr(ctx, -17, -90, 34, 120, 17); ctx.fill(); ctx.restore(); ctx.shadowBlur = 0;
  rr(ctx, -62, 120, 124, 150, 18); ctx.fillStyle = '#1f2d55'; ctx.fill(); ctx.restore();
}
export function thermo(ctx, x, y, h, frac, col = '255,90,60', { w = 56, a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); const bulb = w * .85;
  rr(ctx, -w / 2, -h, w, h + 6, w / 2); ctx.fillStyle = 'rgba(235,240,250,.16)'; ctx.fill(); ctx.strokeStyle = 'rgba(235,240,250,.85)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, bulb * .7, bulb, 0, 7); ctx.fillStyle = `rgb(${col})`; ctx.fill(); ctx.stroke();
  const fh = (h - 16) * clamp(frac); ctx.fillStyle = `rgb(${col})`; ctx.shadowColor = `rgba(${col},.8)`; ctx.shadowBlur = 20; rr(ctx, -w * .22, -fh - 4, w * .44, fh + 12, w * .22); ctx.fill(); ctx.restore();
}
export function stopwatch(ctx, T, x, y, r, ang, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 24; ctx.fillStyle = '#c8cfdb'; rr(ctx, -r * .14, -r * 1.3, r * .28, r * .3, 5); ctx.fill();
  let g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, '#f2f4f8'); g.addColorStop(1, '#9aa3b3'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#10131a'; ctx.beginPath(); ctx.arc(0, 0, r * .86, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(Math.cos(an) * r * .7, Math.sin(an) * r * .7); ctx.lineTo(Math.cos(an) * r * .8, Math.sin(an) * r * .8); ctx.stroke(); }
  ctx.strokeStyle = '#ff5a3c'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ang) * r * .7, -Math.cos(ang) * r * .7); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, 7); ctx.fill(); ctx.restore();
}
export function gauge(ctx, x, y, r, frac, { label = 'TEMP', a = 1, hot = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.fillStyle = '#10131a'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 4; ctx.stroke();
  const a0 = Math.PI * .8, a1 = Math.PI * 2.2; ctx.lineWidth = r * .14; ctx.lineCap = 'butt';
  [['#35d07f', 0, .5], ['#f2c14e', .5, .78], ['#ff4a3d', .78, 1]].forEach(([c, f0, f1]) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(0, 0, r * .78, lerp(a0, a1, f0), lerp(a0, a1, f1)); ctx.stroke(); });
  const an = lerp(a0, a1, clamp(frac)); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an) * r * .68, Math.sin(an) * r * .68); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, r * .09, 0, 7); ctx.fill();
  ctx.letterSpacing = '2px'; txt(ctx, label, 0, r * .55, r * .17, 'rgba(255,255,255,.8)', 700, 'center', MONO); ctx.restore();
}

// NVIDIA rack photo (user asset) on a dark disc so its black edges melt into space
export function rack(ctx, T, x, y, h, { a = 1, heat = 0 } = {}) {
  const im = IMG.rack; if (!im || a <= 0) return; const w = h * im.width / im.height;
  ctx.save(); ctx.globalAlpha *= a; glowDot(ctx, x, y, h * .62, '0,0,0', 1); ctx.globalAlpha *= 1; ctx.drawImage(im, x - w / 2, y - h / 2, w, h);
  if (heat > 0) { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y - h * .05, h * .6, HOT_RGB, heat * .7); const hg = ctx.createLinearGradient(x - w * .2, 0, x + w * .16, 0); const al = .34 * heat * (.8 + .2 * Math.sin(T * 5)); hg.addColorStop(0, 'rgba(255,70,40,0)'); hg.addColorStop(.3, `rgba(255,80,40,${al})`); hg.addColorStop(.7, `rgba(255,80,40,${al})`); hg.addColorStop(1, 'rgba(255,70,40,0)'); ctx.fillStyle = hg; ctx.fillRect(x - w * .2, y - h * .36, w * .36, h * .62); }
  ctx.restore();
}
export function serverRack(ctx, T, x, y, w, h, { seed = 0, heat = 0, a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 20; rr(ctx, -w / 2, -h, w, h, 8); let g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#2c3340'); g.addColorStop(.5, '#161a22'); g.addColorStop(1, '#232a36'); ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0;
  const n = Math.floor(h / 22); for (let i = 0; i < n; i++) { ctx.fillStyle = '#0b0d12'; ctx.fillRect(-w / 2 + 6, -h + 8 + i * 22, w - 12, 16); const on = hash(i, seed + Math.floor(T * 2)) > .4; ctx.fillStyle = heat > .4 ? (on ? '#ff6a4a' : '#6a2a20') : (on ? '#5de0ff' : '#274458'); ctx.fillRect(-w / 2 + 12, -h + 13 + i * 22, 8, 6); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(-w / 2 + 28, -h + 14 + i * 22, w - 50, 4); }
  ctx.restore();
}
// space station: truss, solar arrays, white radiator panels (heat load glows when over > 0)
export function iss(ctx, T, x, y, s, { over = 0, a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  [[-330, -1], [-180, -1], [180, 1], [330, 1]].forEach(([px], i) => { [-1, 1].forEach(d => { ctx.save(); ctx.translate(px, d * 110); solar(ctx, T, -60, d > 0 ? 0 : -210, 120, 210, { seed: i, cols: 3, rows: 6, sheen: .6 }); ctx.restore(); }); });
  ctx.fillStyle = '#b9c0cc'; ctx.fillRect(-420, -14, 840, 28); ctx.fillStyle = '#8e97a6'; for (let k = -10; k <= 10; k++) ctx.fillRect(k * 40 - 2, -14, 4, 28);
  [[-90, -1], [90, 1]].forEach(([px, d], i) => { ctx.save(); ctx.translate(px, 0); const g = ctx.createLinearGradient(0, -20, 0, 20); g.addColorStop(0, '#f2f4f8'); g.addColorStop(1, '#aab2c0'); ctx.fillStyle = g; rr(ctx, -52, -34, 104, 68, 16); ctx.fill(); ctx.restore(); });
  [[-240, 0], [240, 0]].forEach(([px], i) => { ctx.save(); ctx.translate(px, 0); const k = over; ctx.shadowColor = `rgba(${HOT_RGB},${k})`; ctx.shadowBlur = 40 * k; ctx.fillStyle = k > .2 ? `rgb(255,${Math.round(lerp(240, 170, k))},${Math.round(lerp(240, 150, k))})` : '#f4f6fa'; ctx.fillRect(-30, -150, 60, 300); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(80,90,110,.4)'; ctx.lineWidth = 2; for (let j = 1; j < 8; j++) { ctx.beginPath(); ctx.moveTo(-30, -150 + j * 37); ctx.lineTo(30, -150 + j * 37); ctx.stroke(); } ctx.restore(); });
  ctx.restore();
}
export function cloud(ctx, x, y, s, a = 1, col = '255,255,255') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = `rgba(${col},.95)`; ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 24;
  [[-70, 10, 55], [-20, -20, 70], [45, -5, 60], [95, 15, 45], [10, 25, 60]].forEach(([cx, cy, r]) => { ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); }); ctx.restore();
}
export function crossOut(ctx, k, x, y, r, col = '#ff4a3d') {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.strokeStyle = col; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.moveTo(-r, -r); ctx.lineTo(lerp(-r, r, clamp(k * 2)), lerp(-r, r, clamp(k * 2))); ctx.stroke(); if (k > .5) { ctx.beginPath(); ctx.moveTo(r, -r); ctx.lineTo(lerp(r, -r, clamp(k * 2 - 1)), lerp(-r, r, clamp(k * 2 - 1))); ctx.stroke(); } ctx.restore();
}
export const money = n => '$' + Math.round(n).toLocaleString('en-US');
export { IMG };
