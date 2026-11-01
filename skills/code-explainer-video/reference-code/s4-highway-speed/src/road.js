// Drawing kit for the "highway stopwatch" (average speed camera) explainer. Pure functions of inputs + time T.
// Night highway in perspective (lamps, light pools, rails, traffic, gantries), glossy red car (rear + side), cute ANPR camera,
// speed pills, speedometer, capture cards, number plate OCR, route map + stopwatch, signs, e-challan, radar gun, officer, globe.
import { W, H, clamp, lerp, eo, eio, eback, hash, rr } from './lib.js';
import { FONT, MONO, txt, glowDot, pill } from './kit.js';
export const ORANGE = '#ff6b3d', ORANGE_RGB = '255,107,61', MINT = '#7be6b4', MINT_RGB = '123,230,180', LAMP_RGB = '255,186,110';
export const CYAN = '#5fe3ff', CYAN_RGB = '95,227,255', BLUE_RGB = '70,140,255', REDL_RGB = '255,48,48';
export const PLATE = 'MH 12 AB 1234';

// ---------- projection ----------
export function proj({ hy = 860, vx = 540, f = 1000, h = 2.6, camX = 0 } = {}) {
  return (X, Y, d) => (d < .25 ? null : [vx + f * (X - camX) / d, hy + f * (h - Y) / d, f / d]);
}
const quad = (ctx, a, b, c, d) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };

// ---------- the highway scene ----------
// z = metres travelled (drives the dashes, lamps, light pools). Returns the projector P(X, Y, d) -> [x, y, scale].
export function highway(ctx, T, o = {}) {
  const { z = 0, hy = 860, vx = 540, f = 1000, h = 2.6, camX = 0, traffic = 1, gantries = [], lines = 0, warm = 1, near = 2.2 } = o;
  const P = proj({ hy, vx, f, h, camX });
  // sky: deep navy to a warm haze on the horizon
  let g = ctx.createLinearGradient(0, -200, 0, hy + 10); g.addColorStop(0, '#02040a'); g.addColorStop(.6, '#0a1222'); g.addColorStop(.92, '#2a2230'); g.addColorStop(1, '#4a3328');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, hy + H + 10);
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 46; i++) { const x = hash(i, 7) * W, y = hash(i, 8) * (hy - 200); ctx.globalAlpha = (.15 + .5 * hash(i, 9)) * (.6 + .4 * Math.sin(T * 1.5 + i * 3)); ctx.beginPath(); ctx.arc(x, y, .7 + 1.3 * hash(i, 10), 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
  // hills (two layers, parallax with camX)
  [['#0c1019', .35, 120, 0], ['#06080e', .7, 70, 3]].forEach(([col, par, amp, s]) => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-W, hy + 2);
    for (let x = -W; x <= 2 * W; x += 20) { const u = x + camX * 60 * par + T * 3 * par; ctx.lineTo(x, hy - amp * (.45 + .3 * Math.sin(u / 210 + s) + .2 * Math.sin(u / 77 + s * 2) + .08 * Math.sin(u / 31))); }
    ctx.lineTo(2 * W, hy + 2); ctx.closePath(); ctx.fill();
  });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, vx, hy, 520, '255,150,80', .35 * warm); ctx.restore();
  // ground
  g = ctx.createLinearGradient(0, hy, 0, H); g.addColorStop(0, '#0d0d10'); g.addColorStop(1, '#060608'); ctx.fillStyle = g; ctx.fillRect(-W, hy, W * 3, H + 400);
  // road surface
  const far = 600, RW = 5.8;
  quad(ctx, P(-RW, 0, near), P(-RW, 0, far), P(RW, 0, far), P(RW, 0, near));
  g = ctx.createLinearGradient(0, hy, 0, H); g.addColorStop(0, '#1d1a1c'); g.addColorStop(.35, '#2a2421'); g.addColorStop(1, '#231f1d'); ctx.fillStyle = g; ctx.fill();
  // warm light pools under the lamps
  const LP = 34, lamps = [];
  for (let k = 12; k >= 0; k--) for (const sd of [-1, 1]) { const d = k * LP - (z % LP) + (sd > 0 ? LP / 2 : 0); if (d > near * .6 && d < 420) lamps.push([sd, d]); }
  lamps.sort((a, b) => b[1] - a[1]);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [sd, d] of lamps) {
    const r = 9, c = P(sd * 3.6, 0, d), a = P(sd * 3.6, 0, Math.max(near * .7, d - r)), b = P(sd * 3.6, 0, d + r); if (!c || !a || !b) continue;
    const rx = r * c[2] * 1.15, ry = Math.max(2, (a[1] - b[1]) / 2), cy = (a[1] + b[1]) / 2;
    ctx.save(); ctx.translate(c[0], cy); ctx.scale(1, ry / rx);
    const gg = ctx.createRadialGradient(0, 0, 0, 0, 0, rx); gg.addColorStop(0, `rgba(${LAMP_RGB},${.34 * warm})`); gg.addColorStop(.5, `rgba(${LAMP_RGB},${.12 * warm})`); gg.addColorStop(1, `rgba(${LAMP_RGB},0)`);
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, 0, rx, 0, 7); ctx.fill(); ctx.restore();
  }
  ctx.restore();
  // markings: yellow edge lines + dashed white lane lines
  const strip = (X, w, d0, d1, col) => { const a = P(X - w, 0, d0), b = P(X - w, 0, d1), c = P(X + w, 0, d1), e = P(X + w, 0, d0); if (!a || !b) return; quad(ctx, a, b, c, e); ctx.fillStyle = col; ctx.fill(); };
  strip(-5.2, .1, near, far, 'rgba(255,196,60,.85)'); strip(5.2, .1, near, far, 'rgba(255,196,60,.85)');
  for (let k = 40; k >= 0; k--) { const d0 = k * 12 - (z % 12); if (d0 + 4 < near) continue; for (const X of [-1.75, 1.75]) strip(X, .08, Math.max(near, d0), d0 + 4, 'rgba(240,240,235,.8)'); }
  // guard rails
  for (const sd of [-1, 1]) {
    const X = sd * 6.5;
    for (let k = 60; k >= 0; k--) { const d = k * 4 - (z % 4); if (d < near) continue; const a = P(X, 0, d), b = P(X, .75, d); if (!a) continue; ctx.strokeStyle = 'rgba(120,120,130,.55)'; ctx.lineWidth = Math.max(1, .12 * a[2]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    ctx.beginPath(); for (let d = near; d < far; d *= 1.06) { const q = P(X, .75, d); d === near ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]); }
    ctx.strokeStyle = 'rgba(190,190,200,.7)'; ctx.lineWidth = 3; ctx.stroke();
  }
  // traffic: tail lights ahead (slower cars) and oncoming headlights beyond the median
  if (traffic > 0) {
    for (let i = 0; i < 5; i++) {
      const d = 60 + ((hash(i, 4) * 400 - (z * .25 + T * 4) * (0.3 + hash(i, 5) * .4)) % 420 + 420) % 420, X = [-3.5, 0, 3.5][i % 3] + .2 * Math.sin(T * .3 + i);
      const q = P(X, .8, d), s = q[2]; if (q[1] > H) continue;
      ctx.fillStyle = 'rgba(10,10,12,.9)'; rr(ctx, q[0] - .95 * s, q[1] - .5 * s, 1.9 * s, 1.1 * s, .2 * s); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const sx of [-.7, .7]) { glowDot(ctx, q[0] + sx * s, q[1], Math.max(6, .9 * s), REDL_RGB, .9 * traffic); ctx.fillStyle = 'rgba(255,90,80,.95)'; ctx.fillRect(q[0] + sx * s - .15 * s, q[1] - .06 * s, .3 * s, .12 * s); } ctx.restore();
    }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const d = ((hash(i, 11) * 500 - (z * 1.6 + T * 20)) % 500 + 500) % 500 + 8, q = P(-9.5, .7, d); if (!q || q[0] < -200) continue;
      for (const sx of [-.6, .6]) glowDot(ctx, q[0] + sx * q[2], q[1], Math.max(8, 1.6 * q[2]), '255,240,215', .8 * traffic);
    }
    ctx.restore();
  }
  // gantries far -> near, then lamps far -> near
  [...gantries].sort((a, b) => b.d - a.d).forEach(gt => { if (gt.d > near * .8) gantry(ctx, T, P, gt); });
  for (const [sd, d] of lamps) {
    const base = P(sd * 7.2, 0, d), top = P(sd * 7.2, 10, d), arm = P(sd * 4.8, 9.7, d); if (!base || top[1] < -400 && base[1] < -400) continue;
    const s = base[2]; ctx.strokeStyle = '#2b2c33'; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1.5, .22 * s);
    ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(top[0], top[1]); ctx.quadraticCurveTo(top[0], arm[1], arm[0], arm[1]); ctx.stroke();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, arm[0], arm[1] + .1 * s, Math.max(14, 2.4 * s), LAMP_RGB, .9); glowDot(ctx, arm[0], arm[1], Math.max(30, 6 * s), LAMP_RGB, .25); ctx.restore();
    ctx.fillStyle = '#fff2d8'; rr(ctx, arm[0] - .45 * s, arm[1] - .05 * s, .9 * s, .18 * s, .09 * s); ctx.fill();
  }
  if (lines > 0) speedLines(ctx, T, vx, hy - 60, lines);
  return P;
}
export function speedLines(ctx, T, cx, cy, a = 1) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = 0; i < 46; i++) {
    const an = hash(i, 1) * 6.283, u = (T * (1.6 + hash(i, 2)) + hash(i, 3)) % 1, r0 = 380 + u * 1100, len = 120 + 260 * u;
    const x0 = cx + Math.cos(an) * r0, y0 = cy + Math.sin(an) * r0 * 1.2; if (Math.abs(Math.cos(an)) < .25 && Math.sin(an) > 0) continue;
    ctx.strokeStyle = `rgba(255,255,255,${a * .5 * Math.sin(u * Math.PI)})`; ctx.lineWidth = 2 + 3 * u;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + Math.cos(an) * len, y0 + Math.sin(an) * len * 1.2); ctx.stroke();
  }
  ctx.restore();
}
// overhead gantry with a blue sign and two small cameras; gt = {d, label, flash}
export function gantry(ctx, T, P, gt) {
  const { d, label = 'CAMERA A', flash = 0, beam = 0 } = gt;
  const s = P(0, 0, d)[2];
  ctx.save(); ctx.lineCap = 'butt';
  const post = (X) => { const a = P(X, 0, d), b = P(X, 7.6, d); const g = ctx.createLinearGradient(a[0] - .2 * s, 0, a[0] + .2 * s, 0); g.addColorStop(0, '#3c3f47'); g.addColorStop(.5, '#8a8d96'); g.addColorStop(1, '#2a2c33'); ctx.fillStyle = g; ctx.fillRect(a[0] - .18 * s, b[1], .36 * s, a[1] - b[1]); };
  post(-6.9); post(6.9);
  const l = P(-7.1, 7.6, d), r = P(7.1, 7.6, d), l2 = P(-7.1, 6.8, d);
  const bh = l2[1] - l[1]; let g = ctx.createLinearGradient(0, l[1], 0, l2[1]); g.addColorStop(0, '#9a9da6'); g.addColorStop(1, '#3a3c44');
  ctx.fillStyle = g; ctx.fillRect(l[0], l[1], r[0] - l[0], bh * .22); ctx.fillRect(l[0], l2[1] - bh * .22, r[0] - l[0], bh * .22);
  ctx.strokeStyle = '#6c6f78'; ctx.lineWidth = Math.max(1, .06 * s); ctx.beginPath();
  for (let x = l[0], i = 0; x < r[0]; x += bh * .9, i++) { ctx.moveTo(x, l[1] + bh * .2); ctx.lineTo(x + bh * .9, l2[1] - bh * .2); }
  ctx.stroke();
  // sign
  const a = P(-3.4, 9.4, d), b = P(1.4, 7.7, d);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = .3 * s;
  rr(ctx, a[0], a[1], b[0] - a[0], b[1] - a[1], .2 * s); g = ctx.createLinearGradient(0, a[1], 0, b[1]); g.addColorStop(0, '#2563d8'); g.addColorStop(1, '#123a94'); ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = Math.max(1, .07 * s); rr(ctx, a[0] + .12 * s, a[1] + .12 * s, b[0] - a[0] - .24 * s, b[1] - a[1] - .24 * s, .14 * s); ctx.stroke();
  const cx = (a[0] + b[0]) / 2;
  if (s > 6) { ctx.letterSpacing = `${.03 * s}px`; txt(ctx, 'AVERAGE SPEED CHECK', cx, a[1] + .55 * s, .3 * s, 'rgba(255,255,255,.85)', 700); ctx.letterSpacing = '0px'; }
  txt(ctx, '◉ ' + label, cx, b[1] - .38 * s, .62 * s, '#fff', 900);
  // two small cameras hanging under the beam
  for (const X of [-1.75, 1.75]) { const c = P(X, 6.6, d); camBox(ctx, T, c[0], c[1], s * .0028, { flash, beam: 0, mini: true }); }
  if (beam > 0) { // green detection zone on the road
    const z0 = Math.max(1.5, d - 9), z1 = d - 2; const q1 = P(-1.6, 0, z0), q2 = P(-1.6, 0, z1), q3 = P(1.6, 0, z1), q4 = P(1.6, 0, z0);
    if (q1 && q2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; quad(ctx, q1, q2, q3, q4); ctx.fillStyle = `rgba(60,230,150,${.18 * beam})`; ctx.fill(); ctx.strokeStyle = `rgba(120,255,190,${.8 * beam})`; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }
  }
  ctx.restore();
}

// ---------- the red car ----------
// rear view: (x, y) = ground point under the rear centre; s = 1 -> 520 px wide
export function carRear(ctx, T, x, y, s = 1, { brake = 0, plate = PLATE, beam = 1, sheen = 1 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // headlight wash ahead of the car + shadow
  if (beam > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, -300, 10, 0, -300, 520); g.addColorStop(0, `rgba(255,235,200,${.22 * beam})`); g.addColorStop(1, 'rgba(255,235,200,0)'); ctx.fillStyle = g; ctx.save(); ctx.scale(1, .45); ctx.beginPath(); ctx.arc(0, -560, 520, 0, 7); ctx.fill(); ctx.restore(); ctx.restore(); }
  ctx.save(); ctx.scale(1, .16); let g = ctx.createRadialGradient(0, -60, 20, 0, -60, 340); g.addColorStop(0, 'rgba(0,0,0,.85)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -60, 340, 0, 7); ctx.fill(); ctx.restore();
  if (brake > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.scale(1, .25); const gg = ctx.createRadialGradient(0, 120, 10, 0, 120, 420); gg.addColorStop(0, `rgba(255,40,30,${.35 * brake})`); gg.addColorStop(1, 'rgba(255,40,30,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, 120, 420, 0, 7); ctx.fill(); ctx.restore(); }
  // tyres
  ctx.fillStyle = '#09090b'; rr(ctx, -252, -100, 74, 100, 16); ctx.fill(); rr(ctx, 178, -100, 74, 100, 16); ctx.fill();
  // mirrors
  ctx.fillStyle = '#9b1a12'; rr(ctx, -292, -318, 50, 30, 10); ctx.fill(); rr(ctx, 242, -318, 50, 30, 10); ctx.fill();
  // body
  const body = () => { ctx.beginPath(); ctx.moveTo(-258, -70); ctx.lineTo(-262, -230); ctx.quadraticCurveTo(-262, -272, -232, -280); ctx.lineTo(232, -280); ctx.quadraticCurveTo(262, -272, 262, -230); ctx.lineTo(258, -70); ctx.quadraticCurveTo(258, -52, 238, -52); ctx.lineTo(-238, -52); ctx.quadraticCurveTo(-258, -52, -258, -70); ctx.closePath(); };
  g = ctx.createLinearGradient(0, -285, 0, -50); g.addColorStop(0, '#ff5a42'); g.addColorStop(.35, '#e0301f'); g.addColorStop(.75, '#a5180f'); g.addColorStop(1, '#5e0d08');
  body(); ctx.fillStyle = g; ctx.fill();
  ctx.save(); body(); ctx.clip();
  g = ctx.createLinearGradient(-262, 0, 262, 0); g.addColorStop(0, 'rgba(0,0,0,.45)'); g.addColorStop(.18, 'rgba(0,0,0,0)'); g.addColorStop(.82, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.45)'); ctx.fillStyle = g; ctx.fillRect(-270, -300, 540, 260);
  if (sheen > 0) { const sx = -700 + ((T * 260) % 1400); g = ctx.createLinearGradient(sx - 120, 0, sx + 120, 0); g.addColorStop(0, 'rgba(255,230,200,0)'); g.addColorStop(.5, `rgba(255,230,200,${.28 * sheen})`); g.addColorStop(1, 'rgba(255,230,200,0)'); ctx.fillStyle = g; ctx.fillRect(-270, -300, 540, 260); }
  ctx.fillStyle = 'rgba(255,220,200,.35)'; ctx.fillRect(-240, -276, 480, 3);
  ctx.restore();
  // bumper + diffuser
  g = ctx.createLinearGradient(0, -110, 0, -48); g.addColorStop(0, '#2c2c33'); g.addColorStop(1, '#0d0d10'); rr(ctx, -250, -108, 500, 58, 22); ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(-230, -104, 460, 2);
  // chrome strip + plate
  g = ctx.createLinearGradient(-150, 0, 150, 0); g.addColorStop(0, '#666a73'); g.addColorStop(.5, '#f2f4f8'); g.addColorStop(1, '#666a73'); rr(ctx, -150, -200, 300, 7, 3.5); ctx.fillStyle = g; ctx.fill();
  numberPlate(ctx, 0, -158, 200, plate);
  // tail light bar + clusters
  const b = .5 + .5 * clamp(brake), lb = (a) => `rgba(255,${Math.round(40 + 60 * b)},${Math.round(40 + 40 * b)},${a})`;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  glowDot(ctx, -200, -226, 120 + 80 * b, REDL_RGB, .55 * b); glowDot(ctx, 200, -226, 120 + 80 * b, REDL_RGB, .55 * b); glowDot(ctx, 0, -226, 160, REDL_RGB, .25 * b);
  ctx.restore();
  g = ctx.createLinearGradient(0, -240, 0, -212); g.addColorStop(0, lb(1)); g.addColorStop(1, '#6d0606');
  rr(ctx, -248, -244, 110, 34, 12); ctx.fillStyle = g; ctx.fill(); rr(ctx, 138, -244, 110, 34, 12); ctx.fill();
  rr(ctx, -140, -232, 280, 9, 4.5); ctx.fillStyle = lb(.95); ctx.fill();
  ctx.fillStyle = `rgba(255,230,220,${.55 + .45 * b})`; rr(ctx, -236, -232, 80, 6, 3); ctx.fill(); rr(ctx, 156, -232, 80, 6, 3); ctx.fill();
  // rear glass + roof
  ctx.beginPath(); ctx.moveTo(-226, -282); ctx.lineTo(-182, -392); ctx.quadraticCurveTo(-176, -404, -160, -404); ctx.lineTo(160, -404); ctx.quadraticCurveTo(176, -404, 182, -392); ctx.lineTo(226, -282); ctx.closePath();
  g = ctx.createLinearGradient(0, -404, 0, -282); g.addColorStop(0, '#2b3446'); g.addColorStop(1, '#0a0d14'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(190,210,255,.12)'; const rx = -120 + 40 * Math.sin(T * .7); ctx.beginPath(); ctx.moveTo(rx, -410); ctx.lineTo(rx + 70, -410); ctx.lineTo(rx - 10, -270); ctx.lineTo(rx - 80, -270); ctx.fill();
  ctx.fillStyle = 'rgba(255,200,140,.07)'; ctx.fillRect(-240, -300, 480, 20); ctx.restore();
  g = ctx.createLinearGradient(0, -426, 0, -400); g.addColorStop(0, '#d8301f'); g.addColorStop(1, '#7a110a'); rr(ctx, -192, -424, 384, 24, 12); ctx.fillStyle = g; ctx.fill();
  rr(ctx, -60, -418, 120, 7, 3.5); ctx.fillStyle = brake > .1 ? `rgba(255,70,60,${.4 + .6 * brake})` : 'rgba(90,10,10,.9)'; ctx.fill();
  ctx.restore();
}
export function numberPlate(ctx, x, y, w, text = PLATE, { glow = 0, hiIdx = -1 } = {}) {
  const h = w * .25; ctx.save();
  if (glow > 0) { ctx.shadowColor = `rgba(90,255,170,${glow})`; ctx.shadowBlur = w * .2; }
  rr(ctx, x - w / 2, y - h / 2, w, h, h * .14); ctx.fillStyle = '#f6f5ef'; ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = '#121214'; ctx.lineWidth = Math.max(1, w * .012); rr(ctx, x - w / 2 + w * .015, y - h / 2 + w * .015, w - w * .03, h - w * .03, h * .1); ctx.stroke();
  ctx.fillStyle = '#1f49c9'; rr(ctx, x - w / 2 + w * .03, y - h / 2 + w * .03, w * .075, h - w * .06, h * .06); ctx.fill();
  ctx.font = FONT(800, w * .03); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('IND', x - w / 2 + w * .068, y + h * .32);
  ctx.font = MONO(800, w * .098); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const chars = [...text], cw = w * .062, x0 = x + w * .045 - (chars.length - 1) * cw / 2;
  chars.forEach((ch, i) => { ctx.fillStyle = i === hiIdx ? '#e02020' : '#121214'; ctx.fillText(ch, x0 + i * cw, y + h * .04); });
  ctx.textBaseline = 'alphabetic'; ctx.restore();
}
// side view facing right; (x, y) = ground under the middle; s = 1 -> 900 px long
export function carSide(ctx, T, x, y, s = 1, { spin = 1, brake = 0, blur = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.scale(1, .12); const sg = ctx.createRadialGradient(0, -40, 20, 0, -40, 560); sg.addColorStop(0, 'rgba(0,0,0,.8)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, -40, 560, 0, 7); ctx.fill(); ctx.restore();
  const body = () => { ctx.beginPath(); ctx.moveTo(-450, -70); ctx.lineTo(-462, -190); ctx.quadraticCurveTo(-460, -230, -420, -240); ctx.lineTo(-330, -250); ctx.quadraticCurveTo(-250, -370, -150, -385); ctx.lineTo(120, -388); ctx.quadraticCurveTo(220, -380, 300, -270); ctx.lineTo(420, -245); ctx.quadraticCurveTo(468, -235, 470, -180); ctx.lineTo(462, -80); ctx.quadraticCurveTo(455, -50, 420, -50); ctx.lineTo(-420, -50); ctx.quadraticCurveTo(-450, -52, -450, -70); ctx.closePath(); };
  let g = ctx.createLinearGradient(0, -390, 0, -50); g.addColorStop(0, '#ff6a50'); g.addColorStop(.3, '#e3301e'); g.addColorStop(.7, '#a3170e'); g.addColorStop(1, '#4d0a06');
  body(); ctx.fillStyle = g; ctx.fill();
  ctx.save(); body(); ctx.clip();
  g = ctx.createLinearGradient(0, -250, 0, -170); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,220,200,.4)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(-480, -250, 960, 80);
  const sx = -900 + ((T * 900) % 1800); g = ctx.createLinearGradient(sx - 160, 0, sx + 160, 0); g.addColorStop(0, 'rgba(255,240,220,0)'); g.addColorStop(.5, 'rgba(255,240,220,.3)'); g.addColorStop(1, 'rgba(255,240,220,0)'); ctx.fillStyle = g; ctx.fillRect(-480, -400, 960, 360);
  ctx.strokeStyle = 'rgba(60,0,0,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-40, -250); ctx.lineTo(-30, -60); ctx.moveTo(-60, -170); ctx.lineTo(-20, -170); ctx.stroke();
  ctx.restore();
  // windows
  ctx.beginPath(); ctx.moveTo(-300, -255); ctx.quadraticCurveTo(-240, -350, -150, -362); ctx.lineTo(110, -364); ctx.quadraticCurveTo(190, -358, 255, -262); ctx.closePath();
  g = ctx.createLinearGradient(0, -365, 0, -255); g.addColorStop(0, '#30394c'); g.addColorStop(1, '#090c12'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(200,220,255,.13)'; const rx = ((T * 500) % 900) - 400; ctx.beginPath(); ctx.moveTo(rx, -370); ctx.lineTo(rx + 60, -370); ctx.lineTo(rx - 20, -250); ctx.lineTo(rx - 80, -250); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#1b0503'; ctx.fillRect(-38, -364, 16, 110);
  // lights
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 470, -190, 260, '255,240,210', .7); glowDot(ctx, -462, -200, 120 + 100 * brake, REDL_RGB, .5 + .4 * brake); ctx.restore();
  rr(ctx, 410, -215, 60, 26, 10); ctx.fillStyle = '#fff6e0'; ctx.fill();
  rr(ctx, -466, -222, 40, 36, 10); ctx.fillStyle = `rgb(255,${60 + 60 * brake | 0},50)`; ctx.fill();
  // wheels
  for (const wx of [-285, 290]) {
    ctx.fillStyle = '#0a0a0c'; ctx.beginPath(); ctx.arc(wx, -62, 112, Math.PI, 0); ctx.fill();
    g = ctx.createRadialGradient(wx - 20, -80, 10, wx, -60, 95); g.addColorStop(0, '#2f3036'); g.addColorStop(1, '#0b0b0d'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(wx, -60, 95, 0, 7); ctx.fill();
    g = ctx.createRadialGradient(wx - 14, -74, 4, wx, -60, 60); g.addColorStop(0, '#f2f4f8'); g.addColorStop(.7, '#9aa2ae'); g.addColorStop(1, '#4b525d'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(wx, -60, 60, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(30,34,40,.85)'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const a = i * 1.2566 + T * 14 * spin; ctx.beginPath(); ctx.moveTo(wx + Math.cos(a) * 12, -60 + Math.sin(a) * 12); ctx.lineTo(wx + Math.cos(a) * 52, -60 + Math.sin(a) * 52); ctx.stroke(); }
    if (blur > 0) { ctx.fillStyle = `rgba(140,146,156,${.6 * blur})`; ctx.beginPath(); ctx.arc(wx, -60, 58, 0, 7); ctx.fill(); }
  }
  ctx.restore();
}

// ---------- speed pill (orange = over, mint = ok) ----------
export function speedPill(ctx, T, x, y, v, { ok = false, s = 1, a = 1, mark = 0 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.scale(s, s);
  const rgb = ok ? MINT_RGB : ORANGE_RGB, w = 330, h = 128;
  ctx.shadowColor = `rgba(${rgb},.55)`; ctx.shadowBlur = 40; rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(8,10,14,.82)'; ctx.fill(); ctx.shadowBlur = 0;
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = `rgb(${rgb})`; ctx.lineWidth = 7; ctx.stroke();
  ctx.font = FONT(900, 82); const n = String(Math.round(v)), nw = ctx.measureText(n).width; ctx.font = FONT(700, 32); const uw = ctx.measureText('km/h').width;
  const x0 = -(nw + 12 + uw) / 2;
  txt(ctx, n, x0, 29, 82, '#fff', 900, 'left'); txt(ctx, 'km/h', x0 + nw + 12, 26, 32, 'rgba(255,255,255,.85)', 700, 'left');
  if (mark > 0) { // check (ok) or cross (over) drawn over the pill
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 20; ctx.strokeStyle = ok ? '#c9ffe6' : '#ffb39b'; ctx.shadowColor = `rgba(${rgb},1)`; ctx.shadowBlur = 30; const k = clamp(mark);
    ctx.beginPath(); if (ok) { ctx.moveTo(-50, 0); ctx.lineTo(-50 + 40 * clamp(k * 2), 40 * clamp(k * 2)); if (k > .5) ctx.lineTo(-10 + 90 * clamp(k * 2 - 1), 40 - 100 * clamp(k * 2 - 1)); }
    else { ctx.moveTo(-60, -50); ctx.lineTo(-60 + 120 * clamp(k * 2), -50 + 100 * clamp(k * 2)); if (k > .5) { ctx.moveTo(60, -50); ctx.lineTo(60 - 120 * clamp(k * 2 - 1), -50 + 100 * clamp(k * 2 - 1)); } }
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- the cute ANPR camera (original design) ----------
// (x, y) = centre of the box; s = 1 -> box 420 px wide. look = [-1..1, -1..1]
export function camBox(ctx, T, x, y, s = 1, { flash = 0, look = [0, 0], blink = 0, beam = 0, mini = false, arm = 1, mood = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const w = 420, h = 360;
  if (beam > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, h / 2, 0, h / 2 + 1100); g.addColorStop(0, `rgba(60,230,150,${.35 * beam})`); g.addColorStop(1, 'rgba(60,230,150,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-90, h / 2); ctx.lineTo(90, h / 2); ctx.lineTo(420, h / 2 + 1100); ctx.lineTo(-420, h / 2 + 1100); ctx.fill(); ctx.restore(); }
  if (arm > 0 && !mini) { let g = ctx.createLinearGradient(-30, 0, 30, 0); g.addColorStop(0, '#3a3c43'); g.addColorStop(.5, '#9a9ca5'); g.addColorStop(1, '#2c2e34'); ctx.fillStyle = g; ctx.fillRect(-26, -h / 2 - 900, 52, 900); }
  // roof slab (perspective top)
  ctx.fillStyle = '#f4f2ec'; ctx.beginPath(); ctx.moveTo(-w / 2 - 40, -h / 2 - 20); ctx.lineTo(w / 2 + 40, -h / 2 - 20); ctx.lineTo(w / 2 + 10, -h / 2 - 80); ctx.lineTo(-w / 2 - 10, -h / 2 - 80); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c8c4ba'; ctx.fillRect(-w / 2 - 40, -h / 2 - 20, w + 80, 18);
  // IR panel on the left
  if (!mini) { rr(ctx, -w / 2 - 70, -h / 2 + 50, 70, 200, 10); ctx.fillStyle = '#16171b'; ctx.fill();
    for (let i = 0; i < 4; i++) for (let j = 0; j < 8; j++) { const on = .55 + .45 * Math.sin(T * 3 + i + j * .7); ctx.fillStyle = `rgba(255,${40 + 30 * on | 0},40,${.5 + .5 * on})`; ctx.beginPath(); ctx.arc(-w / 2 - 56 + i * 14, -h / 2 + 66 + j * 23, 5, 0, 7); ctx.fill(); } }
  // body
  ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
  rr(ctx, -w / 2, -h / 2, w, h, 60); let g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, '#fffdf7'); g.addColorStop(.6, '#ece7dc'); g.addColorStop(1, '#c9c2b4'); ctx.fillStyle = g; ctx.fill();
  ctx.shadowColor = 'transparent';
  g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, 'rgba(255,255,255,.6)'); g.addColorStop(.25, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(120,110,90,.25)'); ctx.fillStyle = g; ctx.fill();
  // status LED
  ctx.fillStyle = `rgba(255,${90 + 40 * Math.sin(T * 4) | 0},50,1)`; ctx.beginPath(); ctx.arc(w / 2 - 50, -h / 2 + 48, 13, 0, 7); ctx.fill();
  // lens: outer black ring, white ring, teal iris, pupil
  const lx = look[0] * 34, ly = look[1] * 26, R = 150;
  ctx.fillStyle = '#0d0e11'; ctx.beginPath(); ctx.arc(0, 6, R, 0, 7); ctx.fill();
  ctx.fillStyle = '#f7f7f3'; ctx.beginPath(); ctx.arc(0, 6, R * .78, 0, 7); ctx.fill();
  const lid = clamp(blink); if (lid < 1) {
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 6, R * .78, R * .78 * (1 - lid), 0, 0, 7); ctx.clip();
    g = ctx.createRadialGradient(lx - 14, ly - 8, 4, lx, ly + 6, R * .5); g.addColorStop(0, '#9ff3e4'); g.addColorStop(.6, '#3cb7a6'); g.addColorStop(1, '#1d6d64'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, ly + 6, R * .48, 0, 7); ctx.fill();
    ctx.fillStyle = '#0b0c0f'; ctx.beginPath(); ctx.arc(lx, ly + 6, R * (.2 + .04 * Math.sin(T * 2)), 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.arc(lx - R * .14, ly - R * .12, R * .08, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(lx + R * .1, ly + R * .14, R * .035, 0, 7); ctx.fill();
    ctx.restore();
  }
  if (mood > 0) { ctx.strokeStyle = '#0d0e11'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-R * .8, -R * .95 - 10 * mood); ctx.lineTo(-R * .2, -R * .8 + 18 * mood); ctx.moveTo(R * .8, -R * .95 - 10 * mood); ctx.lineTo(R * .2, -R * .8 + 18 * mood); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 6, R * .93, -2.6, -1.2); ctx.stroke();
  // amber LED row under the lens
  for (let i = 0; i < 9; i++) { const on = .5 + .5 * Math.sin(T * 5 - i * .6); ctx.fillStyle = `rgba(255,${180 + 40 * on | 0},70,${.5 + .5 * on})`; ctx.beginPath(); ctx.arc(-80 + i * 20, h / 2 - 22, 6, 0, 7); ctx.fill(); }
  if (flash > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 0, 6, 700, '255,255,255', flash); glowDot(ctx, 0, 6, 260, '255,255,255', flash); ctx.restore(); }
  ctx.restore();
}

// ---------- speedometer ----------
export function speedo(ctx, T, cx, cy, r, v, { limit = 100, max = 220, a = 1, label = 'km/h', unit = '' } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  const a0 = Math.PI * .75, a1 = Math.PI * 2.25, ang = u => lerp(a0, a1, clamp(u / max));
  ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 30;
  let g = ctx.createRadialGradient(cx, cy - r * .3, r * .1, cx, cy, r * 1.08); g.addColorStop(0, '#2a3040'); g.addColorStop(.7, '#10131b'); g.addColorStop(1, '#05060a');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r * 1.06, 0, 7); ctx.fill(); ctx.shadowColor = 'transparent';
  g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r); g.addColorStop(0, '#f2f4f8'); g.addColorStop(.3, '#6a707c'); g.addColorStop(.6, '#e1e4ea'); g.addColorStop(1, '#3d424c');
  ctx.strokeStyle = g; ctx.lineWidth = r * .05; ctx.beginPath(); ctx.arc(cx, cy, r * 1.06, 0, 7); ctx.stroke();
  // red zone over the limit
  ctx.lineWidth = r * .07; ctx.strokeStyle = 'rgba(255,70,50,.9)'; ctx.beginPath(); ctx.arc(cx, cy, r * .9, ang(limit), a1); ctx.stroke();
  for (let u = 0; u <= max; u += 10) {
    const an = ang(u), big = u % 20 === 0; ctx.strokeStyle = u > limit ? '#ff7a62' : 'rgba(235,240,250,.85)'; ctx.lineWidth = big ? r * .022 : r * .01;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * r * (big ? .74 : .79), cy + Math.sin(an) * r * (big ? .74 : .79)); ctx.lineTo(cx + Math.cos(an) * r * .86, cy + Math.sin(an) * r * .86); ctx.stroke();
    if (big) txt(ctx, String(u), cx + Math.cos(an) * r * .6, cy + Math.sin(an) * r * .6 + r * .05, r * .12, u > limit ? '#ff9a85' : '#e8ecf4', 700);
  }
  // limit marker
  const la = ang(limit); ctx.fillStyle = '#ff4a3d'; ctx.beginPath(); ctx.moveTo(cx + Math.cos(la) * r * .99, cy + Math.sin(la) * r * .99); ctx.lineTo(cx + Math.cos(la - .05) * r * 1.1, cy + Math.sin(la - .05) * r * 1.1); ctx.lineTo(cx + Math.cos(la + .05) * r * 1.1, cy + Math.sin(la + .05) * r * 1.1); ctx.fill();
  ctx.letterSpacing = '2px'; txt(ctx, 'LIMIT', cx + Math.cos(la) * r * .42, cy + Math.sin(la) * r * .42 + r * .04, r * .07, '#ff6a55', 800); ctx.letterSpacing = '0px';
  // needle
  const na = ang(v) + .006 * Math.sin(T * 23);
  ctx.save(); ctx.shadowColor = 'rgba(255,120,60,.9)'; ctx.shadowBlur = 24; ctx.strokeStyle = '#ff7a3d'; ctx.lineWidth = r * .03; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - Math.cos(na) * r * .12, cy - Math.sin(na) * r * .12); ctx.lineTo(cx + Math.cos(na) * r * .82, cy + Math.sin(na) * r * .82); ctx.stroke(); ctx.restore();
  g = ctx.createRadialGradient(cx - r * .02, cy - r * .03, 2, cx, cy, r * .09); g.addColorStop(0, '#f4f6fa'); g.addColorStop(1, '#4a505b'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r * .085, 0, 7); ctx.fill();
  txt(ctx, unit || String(Math.round(v)), cx, cy + r * .5, unit ? r * .19 : r * .26, '#fff', 900);
  txt(ctx, label, cx, cy + r * .66, r * .085, 'rgba(220,226,236,.75)', 700);
  // glass glare
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r * 1.03, 0, 7); ctx.clip(); g = ctx.createLinearGradient(cx - r, cy - r, cx + r * .2, cy); g.addColorStop(0, 'rgba(255,255,255,.14)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx - r * .3, cy - r * .55, r * 1.1, r * .55, -.4, 0, 7); ctx.fill(); ctx.restore();
  ctx.restore();
}

// ---------- capture card (camera photo + plate + time) ----------
export function capCard(ctx, T, x, y, w, { cam = 'A', time = '22:14:05', km = 'KM 0', plate = PLATE, rows = 1, check = 0, col = '#1f4fc4', head = 'ANPR', box = 1 } = {}) {
  const h = w * 1.18, x0 = x - w / 2, y0 = y - h / 2, u = w / 100;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 8 * u; ctx.shadowOffsetY = 3 * u;
  rr(ctx, x0, y0, w, h, 4 * u); let g = ctx.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, '#fbf9f3'); g.addColorStop(1, '#e8e3d7'); ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent';
  rr(ctx, x0, y0, w, 15 * u, [4 * u, 4 * u, 0, 0]); ctx.fillStyle = col; ctx.fill();
  txt(ctx, 'CAMERA ' + cam, x0 + 5 * u, y0 + 10.2 * u, 7.4 * u, '#fff', 900, 'left'); txt(ctx, head, x0 + w - 5 * u, y0 + 9.8 * u, 4.4 * u, 'rgba(255,255,255,.9)', 800, 'right');
  // photo
  const px = x0 + 5 * u, py = y0 + 20 * u, pw = w - 10 * u, ph = 56 * u;
  ctx.save(); rr(ctx, px, py, pw, ph, 2 * u); ctx.clip(); g = ctx.createLinearGradient(0, py, 0, py + ph); g.addColorStop(0, '#1a1214'); g.addColorStop(1, '#3a2220'); ctx.fillStyle = g; ctx.fillRect(px, py, pw, ph);
  carRear(ctx, T, x, py + ph + 6 * u, pw / 520 * .82, { beam: 0, brake: .7, plate });
  ctx.fillStyle = 'rgba(255,40,40,.12)'; ctx.fillRect(px, py, pw, ph);
  for (let i = 0; i < ph; i += 3) { ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(px, py + i, pw, 1); }
  ctx.restore();
  txt(ctx, `CAM ${cam}  ${time}`, px + 3 * u, py + 6 * u, 3.6 * u, '#ffd27a', 700, 'left', MONO);
  ctx.fillStyle = '#ff3b30'; ctx.beginPath(); ctx.arc(px + pw - 4 * u, py + 4.5 * u, 1.4 * u * (.7 + .3 * Math.sin(T * 6)), 0, 7); ctx.fill();
  if (box > 0) { // green box around the plate
    const bx = x, by = py + ph + 6 * u - (158 * pw / 520 * .82), bw = 200 * pw / 520 * .82 * 1.25, bh = bw * .38;
    ctx.strokeStyle = `rgba(80,255,160,${box})`; ctx.lineWidth = .7 * u; const c = 3 * u;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => { const cxx = bx + sx * bw / 2, cyy = by + sy * bh / 2; ctx.beginPath(); ctx.moveTo(cxx - sx * c, cyy); ctx.lineTo(cxx, cyy); ctx.lineTo(cxx, cyy - sy * c); ctx.stroke(); });
  }
  // rows
  const R = [['PLATE', plate], ['TIME', time], ['PLACE', km]];
  R.forEach(([k, v], i) => { const a = clamp(rows * 3 - i); if (a <= 0) return; ctx.globalAlpha = a; const ry = py + ph + 11 * u + i * 9 * u;
    txt(ctx, k, px + 1 * u, ry, 3.8 * u, '#6c6a64', 700, 'left', MONO); txt(ctx, v, px + pw - 1 * u, ry, 5 * u, '#17181c', 800, 'right', MONO); ctx.globalAlpha = 1; });
  ctx.restore();
  if (check > 0) checkBadge(ctx, x0 + w - 2 * u, y0 + 2 * u, 9 * u, check);
}
export function checkBadge(ctx, x, y, r, k, ok = true) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); const s = eback(clamp(k * 1.3)); ctx.scale(s, s);
  ctx.shadowColor = ok ? 'rgba(40,220,130,.8)' : 'rgba(255,60,50,.8)'; ctx.shadowBlur = r * .8;
  const g = ctx.createLinearGradient(0, -r, 0, r); g.addColorStop(0, ok ? '#5cf0a2' : '#ff7a6a'); g.addColorStop(1, ok ? '#13a85e' : '#d82a1d'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = '#fff'; ctx.lineWidth = r * .22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const d = clamp(k * 1.6 - .3);
  ctx.beginPath(); if (ok) { ctx.moveTo(-r * .42, 0); ctx.lineTo(lerp(-r * .42, -r * .1, clamp(d * 2)), lerp(0, r * .32, clamp(d * 2))); if (d > .5) ctx.lineTo(lerp(-r * .1, r * .45, clamp(d * 2 - 1)), lerp(r * .32, -r * .35, clamp(d * 2 - 1))); }
  else { const q = r * .36 * clamp(d * 1.5); ctx.moveTo(-q, -q); ctx.lineTo(q, q); ctx.moveTo(q, -q); ctx.lineTo(-q, q); }
  ctx.stroke(); ctx.restore();
}
// big neon X (like a stamp over something)
export function bigX(ctx, x, y, r, k) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); const s = eback(clamp(k * 1.2)); ctx.scale(s, s); ctx.lineCap = 'round';
  [[r * .34, 'rgba(255,90,70,.35)'], [r * .2, '#ffb3a3'], [r * .12, '#fff']].forEach(([lw, c]) => { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.shadowColor = 'rgba(255,80,60,.9)'; ctx.shadowBlur = r * .4; ctx.beginPath(); ctx.moveTo(-r, -r); ctx.lineTo(r, r); ctx.moveTo(r, -r); ctx.lineTo(-r, r); ctx.stroke(); });
  ctx.restore();
}

// ---------- signs ----------
export function limitSign(ctx, T, x, y, r, n = 100, { pole = 700 } = {}) {
  ctx.save();
  let g = ctx.createLinearGradient(x - 16, 0, x + 16, 0); g.addColorStop(0, '#3a3c44'); g.addColorStop(.5, '#a4a7b0'); g.addColorStop(1, '#30323a'); ctx.fillStyle = g; ctx.fillRect(x - 15, y, 30, pole);
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18; ctx.fillStyle = '#b9bcc4'; ctx.beginPath(); ctx.arc(x, y, r * 1.04, 0, 7); ctx.fill(); ctx.shadowColor = 'transparent';
  g = ctx.createRadialGradient(x, y - r * .4, r * .2, x, y, r); g.addColorStop(0, '#ff6050'); g.addColorStop(1, '#c4180c'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  g = ctx.createRadialGradient(x - r * .2, y - r * .3, r * .1, x, y, r * .78); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e6e6e2'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * .76, 0, 7); ctx.fill();
  txt(ctx, String(n), x, y + r * .25, r * .7, '#111216', 900);
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip(); const sx = x - r * 2 + ((T * .5) % 1) * r * 4; g = ctx.createLinearGradient(sx - r * .3, 0, sx + r * .3, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
  ctx.restore();
}
// green highway direction-style sign with lines of text; lines: [[text, size, col]]
export function roadSign(ctx, T, x, y, w, h, lines, { a = 1, posts = true, col = ['#1a7a46', '#0d5530'] } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  if (posts) { for (const px of [x - w * .3, x + w * .3]) { const g = ctx.createLinearGradient(px - 12, 0, px + 12, 0); g.addColorStop(0, '#2c2e35'); g.addColorStop(.5, '#8c8f98'); g.addColorStop(1, '#25272d'); ctx.fillStyle = g; ctx.fillRect(px - 12, y + h / 2, 24, 900); } }
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
  rr(ctx, x - w / 2, y - h / 2, w, h, 28); let g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, col[0]); g.addColorStop(1, col[1]); ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#f4f4ee'; ctx.lineWidth = 7; rr(ctx, x - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28, 18); ctx.stroke();
  g = ctx.createLinearGradient(0, y - h / 2, 0, y); g.addColorStop(0, 'rgba(255,255,255,.14)'); g.addColorStop(1, 'rgba(255,255,255,0)'); rr(ctx, x - w / 2, y - h / 2, w, h / 2, [28, 28, 0, 0]); ctx.fillStyle = g; ctx.fill();
  const tot = lines.reduce((s, l) => s + l[1] * 1.15, 0); let yy = y - tot / 2;
  lines.forEach(([s, size, c = '#fff', ww = 900]) => { yy += size * 1.15; txt(ctx, s, x, yy - size * .22, size, c, ww); });
  ctx.restore();
}

// ---------- number plate OCR (ANPR) ----------
export function plateOCR(ctx, T, x, y, w, k, { text = PLATE, read = PLATE, wrong = -1, glow = 1 } = {}) {
  const h = w * .25;
  numberPlate(ctx, x, y, w, text, { glow: .8 * glow });
  // scan line sweeping the plate
  const sl = (T * 1.2) % 1; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sx = x - w / 2 + w * sl;
  let g = ctx.createLinearGradient(sx - 40, 0, sx + 6, 0); g.addColorStop(0, 'rgba(80,255,170,0)'); g.addColorStop(1, `rgba(80,255,170,${.6 * glow})`); ctx.fillStyle = g; ctx.fillRect(sx - 40, y - h / 2, 46, h); ctx.restore();
  // per-character boxes as they are recognised
  const chars = [...text], cw = w * .062, x0 = x + w * .045 - (chars.length - 1) * cw / 2, n = Math.floor(k * chars.length + 1e-6);
  ctx.save(); ctx.lineWidth = 2.5;
  chars.forEach((ch, i) => { if (ch === ' ' || i >= n) return; ctx.strokeStyle = i === wrong ? 'rgba(255,80,60,.95)' : 'rgba(80,255,170,.9)'; ctx.strokeRect(x0 + i * cw - cw * .45, y - h * .3, cw * .9, h * .62); });
  ctx.restore();
  // read-out box under the plate
  const by = y + h / 2 + 26, bw = w * .9;
  rr(ctx, x - bw / 2, by, bw, h * .82, 14); ctx.fillStyle = 'rgba(6,20,14,.85)'; ctx.fill(); ctx.strokeStyle = 'rgba(80,255,170,.6)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.letterSpacing = '3px'; txt(ctx, 'ANPR READ', x - bw / 2 + 20, by + 30, w * .03, 'rgba(120,255,190,.75)', 700, 'left', MONO); ctx.letterSpacing = '0px';
  const rd = [...read].slice(0, n).join('');
  ctx.font = MONO(800, w * .065); ctx.textAlign = 'left'; let xx = x - bw / 2 + 20;
  [...rd].forEach((ch, i) => { ctx.fillStyle = i === wrong ? '#ff6a55' : '#8affc8'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12; ctx.fillText(ch, xx, by + h * .7); xx += ctx.measureText(ch).width; });
  ctx.shadowBlur = 0; if (k < 1 && Math.sin(T * 10) > 0) { ctx.fillStyle = '#8affc8'; ctx.fillRect(xx + 4, by + h * .7 - w * .05, w * .025, w * .055); }
}

// ---------- route map (top-down) ----------
// path from bottom (camera A) to top (camera B) inside the box; prog 0..1 = blue line drawn; car at carU
export const routePt = (u, cx = 540, top = 620, bot = 1700) => { const y = lerp(bot, top, u); return [cx + 120 * Math.sin(u * 3.2 + .4) - 60 * Math.sin(u * 7), y]; };
export function routeMap(ctx, T, { cx = 540, top = 620, bot = 1700, prog = 0, carU = -1, pins = 1, glow = 1, col = BLUE_RGB } = {}) {
  ctx.fillStyle = '#05070c'; ctx.fillRect(-W, -H, W * 3, H * 3);
  // faint city blocks + dots
  for (let i = 0; i < 260; i++) { const x = hash(i, 21) * W, y = 500 + hash(i, 22) * 1450, a = .05 + .18 * hash(i, 23) * (.7 + .3 * Math.sin(T * 2 + i)); ctx.fillStyle = `rgba(${LAMP_RGB},${a})`; ctx.fillRect(x, y, 3 + 5 * hash(i, 24), 2 + 3 * hash(i, 25)); }
  ctx.strokeStyle = 'rgba(120,140,180,.07)'; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k < 14; k++) { ctx.moveTo(0, 520 + k * 110 + 20 * Math.sin(k)); ctx.lineTo(W, 560 + k * 110 - 30 * Math.cos(k)); } ctx.stroke();
  // the highway: wide dark band with lamp dots
  const N = 80, pts = []; for (let i = 0; i <= N; i++) pts.push(routePt(i / N, cx, top - 120, bot + 140));
  const pathTo = (k) => { ctx.beginPath(); pts.forEach((q, i) => { if (i / N > k) return; i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); };
  pathTo(1); ctx.strokeStyle = '#1a1b20'; ctx.lineWidth = 64; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 46; i++) { const u = i / 46, q = routePt(u, cx, top - 120, bot + 140), e = routePt(u + .01, cx, top - 120, bot + 140), nx = -(e[1] - q[1]), ny = e[0] - q[0], l = Math.hypot(nx, ny);
    for (const sd of [-1, 1]) glowDot(ctx, q[0] + sd * nx / l * 44, q[1] + sd * ny / l * 44, 26, LAMP_RGB, .5 + .2 * Math.sin(T * 3 + i)); }
  ctx.restore();
  // map coordinates for A (u = .1) and B (u = .9)
  const uA = .1, uB = .9, map = u => routePt(lerp(uA, uB, u), cx, top - 120, bot + 140);
  if (prog > 0) {
    ctx.save(); ctx.beginPath(); for (let i = 0; i <= 60; i++) { const q = map(i / 60 * clamp(prog)); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
    ctx.lineCap = 'round'; ctx.strokeStyle = `rgba(${col},${.25 * glow})`; ctx.lineWidth = 34; ctx.stroke(); ctx.strokeStyle = `rgba(${col},.95)`; ctx.lineWidth = 12; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
  }
  if (carU >= 0) { const q = map(carU); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, q[0], q[1], 60, '255,90,70', .9); ctx.restore(); ctx.fillStyle = '#ff5a44'; ctx.beginPath(); ctx.arc(q[0], q[1], 14, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke(); ctx.strokeStyle = `rgba(255,120,100,${.6 * (1 - (T * 1.5) % 1)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(q[0], q[1], 14 + 40 * ((T * 1.5) % 1), 0, 7); ctx.stroke(); }
  if (pins > 0) { const a = map(0), b = map(1); mapPin(ctx, T, a[0], a[1], '#2fd07a', 'CAMERA A', pins); mapPin(ctx, T, b[0], b[1], '#ff4a3d', 'CAMERA B', pins); }
  return map;
}
export function mapPin(ctx, T, x, y, col, label, a = 1, side = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); const bob = 6 * Math.sin(T * 2.4 + x);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(x, y, 18, 6, 0, 0, 7); ctx.fill();
  ctx.translate(x, y - 8 + bob); const g = ctx.createLinearGradient(-30, -90, 30, 0); g.addColorStop(0, col); g.addColorStop(1, '#0b0b0d');
  ctx.shadowColor = col; ctx.shadowBlur = 24; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-12, -24, -34, -40, -34, -66); ctx.arc(0, -66, 34, Math.PI, 0); ctx.bezierCurveTo(34, -40, 12, -24, 0, 0); ctx.fillStyle = col; ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.ellipse(-10, -78, 10, 16, -.5, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -66, 12, 0, 7); ctx.fill();
  if (label) { ctx.letterSpacing = '3px'; txt(ctx, label, side * 54, -54, 26, col, 900, side > 0 ? 'left' : 'right'); ctx.letterSpacing = '0px'; }
  ctx.restore();
}
// glowing cyan stopwatch; t = seconds shown, sweep = hand progress (0..1 per minute)
export function stopwatch(ctx, T, x, y, r, secs, { a = 1, rgb = CYAN_RGB } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y, r * 2.2, rgb, .5); ctx.restore();
  rr(ctx, x - r * .16, y - r * 1.36, r * .32, r * .2, r * .05); ctx.fillStyle = `rgb(${rgb})`; ctx.fill(); ctx.fillRect(x - r * .06, y - r * 1.18, r * .12, r * .2);
  ctx.save(); ctx.translate(x + Math.cos(-.8) * r * 1.1, y + Math.sin(-.8) * r * 1.1); ctx.rotate(.75); rr(ctx, -r * .09, -r * .12, r * .18, r * .2, r * .04); ctx.fill(); ctx.restore();
  let g = ctx.createRadialGradient(x, y - r * .3, r * .1, x, y, r); g.addColorStop(0, 'rgba(20,40,60,.95)'); g.addColorStop(1, 'rgba(4,10,18,.95)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.shadowColor = `rgb(${rgb})`; ctx.shadowBlur = r * .3; ctx.strokeStyle = `rgb(${rgb})`; ctx.lineWidth = r * .09; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.shadowBlur = 0;
  for (let i = 0; i < 60; i++) { const an = i / 60 * 6.283 - Math.PI / 2, big = i % 5 === 0; ctx.strokeStyle = `rgba(${rgb},${big ? .95 : .45})`; ctx.lineWidth = big ? r * .03 : r * .012; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r * (big ? .74 : .8), y + Math.sin(an) * r * (big ? .74 : .8)); ctx.lineTo(x + Math.cos(an) * r * .86, y + Math.sin(an) * r * .86); ctx.stroke(); }
  // elapsed arc
  const fr = (secs % 60) / 60, an = fr * 6.283 - Math.PI / 2;
  ctx.strokeStyle = `rgba(${rgb},.35)`; ctx.lineWidth = r * .12; ctx.beginPath(); ctx.arc(x, y, r * .55, -Math.PI / 2, an); ctx.stroke();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = r * .035; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an) * r * .78, y + Math.sin(an) * r * .78); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, r * .06, 0, 7); ctx.fill();
  const mm = Math.floor(secs / 60), ss = Math.floor(secs % 60);
  txt(ctx, `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, x, y + r * .48, r * .24, '#e8fbff', 800, 'center', MONO);
  ctx.restore();
}

// ---------- e-challan ticket (prints out of a slot) ----------
export function ticket(ctx, T, x, y, w, k, { title = 'e-CHALLAN', rows = [['VEHICLE', PLATE], ['OFFENCE', 'OVER-SPEEDING'], ['AVG SPEED', '120 km/h']], amount = '₹ 2,000', stamp = 0, body = null, a = 1 } = {}) {
  if (a <= 0 || k <= 0) return; const h = w * 1.25, show = h * clamp(k);
  ctx.save(); ctx.globalAlpha *= a;
  // slot
  rr(ctx, x - w / 2 - 30, y - 26, w + 60, 40, 20); ctx.fillStyle = '#16181e'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#000'; rr(ctx, x - w / 2 - 6, y - 10, w + 12, 10, 5); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.rect(x - w, y - 4, w * 2, h + 200); ctx.clip(); ctx.translate(0, show - h);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
  ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h);
  for (let i = 0; i <= 16; i++) ctx.lineTo(x + w / 2 - i * w / 16, y + h + (i % 2 ? 12 : 0)); ctx.closePath(); ctx.fillStyle = '#fbfaf6'; ctx.fill(); ctx.shadowColor = 'transparent';
  const u = w / 100;
  if (body) body(ctx, x - w / 2, y, w, h);
  else {
    rr(ctx, x - w / 2 + 6 * u, y + 6 * u, w - 12 * u, 12 * u, 2 * u); ctx.fillStyle = '#d8261b'; ctx.fill();
    txt(ctx, title, x, y + 14.6 * u, 7 * u, '#fff', 900);
    rows.forEach(([kk, v], i) => { const ry = y + 30 * u + i * 12 * u; txt(ctx, kk, x - w / 2 + 8 * u, ry, 3.8 * u, '#77736a', 700, 'left', MONO); txt(ctx, v, x + w / 2 - 8 * u, ry, 5 * u, '#17181c', 800, 'right', MONO); ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(x - w / 2 + 8 * u, ry + 4 * u, w - 16 * u, 1); });
    txt(ctx, 'FINE', x - w / 2 + 8 * u, y + 76 * u, 4.4 * u, '#77736a', 700, 'left', MONO); txt(ctx, amount, x + w / 2 - 8 * u, y + 79 * u, 11 * u, '#d8261b', 900, 'right');
    for (let i = 0; i < 46; i++) { const bw = (1 + (hash(i, 30) * 3 | 0)) * .45 * u; ctx.fillStyle = '#17181c'; ctx.fillRect(x - w / 2 + 8 * u + i * 1.84 * u, y + 90 * u, bw, 22 * u); }
    if (stamp > 0) { ctx.save(); ctx.translate(x + 14 * u, y + 52 * u); ctx.rotate(-.22); const s = lerp(1.6, 1, eo(clamp(stamp))); ctx.scale(s, s); ctx.globalAlpha *= clamp(stamp * 2);
      ctx.strokeStyle = '#d8261b'; ctx.lineWidth = 1.2 * u; rr(ctx, -28 * u, -8 * u, 56 * u, 16 * u, 3 * u); ctx.stroke(); txt(ctx, 'ISSUED', 0, 3.4 * u, 9 * u, '#d8261b', 900); ctx.restore(); }
  }
  ctx.restore(); ctx.restore();
}

// ---------- radar gun + police officer (icons, original drawings) ----------
export function radarGun(ctx, T, x, y, s = 1, { beam = 1 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (beam > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { const u = ((T * .8 + i / 4) % 1); ctx.strokeStyle = `rgba(255,90,70,${beam * .7 * (1 - u)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(170, -40, 40 + u * 220, -.5, .5); ctx.stroke(); } ctx.restore(); }
  let g = ctx.createLinearGradient(0, -110, 0, 20); g.addColorStop(0, '#ffd166'); g.addColorStop(1, '#d4900e'); rr(ctx, -150, -100, 300, 120, 30); ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = '#1b1c22'; ctx.beginPath(); ctx.ellipse(150, -40, 34, 62, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#3a3f4b'; ctx.beginPath(); ctx.ellipse(152, -40, 22, 46, 0, 0, 7); ctx.fill();
  rr(ctx, -110, -80, 120, 50, 10); ctx.fillStyle = '#10251c'; ctx.fill(); txt(ctx, '142', -50, -42, 36, '#7dffb1', 800, 'center', MONO);
  g = ctx.createLinearGradient(-90, 0, -10, 0); g.addColorStop(0, '#2b2d35'); g.addColorStop(1, '#14151a'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-90, 10); ctx.lineTo(-10, 10); ctx.lineTo(-30, 170); ctx.quadraticCurveTo(-60, 185, -100, 170); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; rr(ctx, -140, -94, 270, 10, 5); ctx.fill();
  ctx.restore();
}
export function officer(ctx, T, x, y, s = 1) { // friendly bust: cap, face, uniform shoulders, badge
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  let g = ctx.createLinearGradient(0, 40, 0, 260); g.addColorStop(0, '#c8a56e'); g.addColorStop(1, '#8b6b3c'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-190, 260); ctx.quadraticCurveTo(-190, 90, -70, 70); ctx.lineTo(70, 70); ctx.quadraticCurveTo(190, 90, 190, 260); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7a5c2f'; ctx.beginPath(); ctx.moveTo(-40, 70); ctx.lineTo(0, 140); ctx.lineTo(40, 70); ctx.fill();
  ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(-95, 150, 18, 0, 7); ctx.fill();
  g = ctx.createRadialGradient(-20, -60, 10, 0, -30, 110); g.addColorStop(0, '#f1c7a5'); g.addColorStop(1, '#b98463'); ctx.fillStyle = g; ctx.fillRect(-28, 30, 56, 50); ctx.beginPath(); ctx.ellipse(0, -30, 88, 100, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#2a1d16'; ctx.beginPath(); ctx.ellipse(-32, -26, 9, 11, 0, 0, 7); ctx.ellipse(32, -26, 9, 11, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#3a2418'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-30, 22); ctx.quadraticCurveTo(0, 8, 30, 22); ctx.stroke();
  g = ctx.createLinearGradient(0, -170, 0, -70); g.addColorStop(0, '#5a6a8a'); g.addColorStop(1, '#2b3550'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -112, 112, 52, 0, Math.PI, 0); ctx.lineTo(96, -92); ctx.lineTo(-96, -92); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#141a28'; ctx.beginPath(); ctx.ellipse(0, -90, 108, 22, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(0, -128, 16, 0, 7); ctx.fill();
  ctx.restore();
}

// ---------- evidence review monitor ----------
export function reviewScreen(ctx, T, x, y, w, k, { verdict = 0 } = {}) {
  const h = w * .66; ctx.save();
  ctx.fillStyle = '#20232b'; ctx.fillRect(x - 20, y + h / 2, 40, 120); rr(ctx, x - 120, y + h / 2 + 110, 240, 22, 11); ctx.fill();
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 60; rr(ctx, x - w / 2, y - h / 2, w, h, 24); ctx.fillStyle = '#16181e'; ctx.fill(); ctx.shadowColor = 'transparent';
  rr(ctx, x - w / 2 + 16, y - h / 2 + 16, w - 32, h - 32, 12); let g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, '#0d1a24'); g.addColorStop(1, '#081018'); ctx.fillStyle = g; ctx.fill();
  const x0 = x - w / 2 + 44, u = w / 100;
  ctx.letterSpacing = '3px'; txt(ctx, 'EVIDENCE REVIEW', x0, y - h / 2 + 11 * u, 3.4 * u, 'rgba(255,200,120,.85)', 800, 'left', MONO); ctx.letterSpacing = '0px';
  txt(ctx, 'CAM B · 22:19:05', x + w / 2 - 44, y - h / 2 + 11 * u, 3 * u, 'rgba(200,210,230,.6)', 700, 'right', MONO);
  const r1 = clamp(k * 2), r2 = clamp(k * 2 - 1);
  ctx.globalAlpha = r1; txt(ctx, 'PHOTO', x0, y - h / 2 + 24 * u, 3 * u, 'rgba(200,210,230,.6)', 700, 'left', MONO);
  numberPlate(ctx, x0 + 22 * u, y - h / 2 + 33 * u, 44 * u, PLATE);
  ctx.globalAlpha = r2; txt(ctx, 'ANPR READ', x0, y - h / 2 + 47 * u, 3 * u, 'rgba(200,210,230,.6)', 700, 'left', MONO);
  numberPlate(ctx, x0 + 22 * u, y - h / 2 + 56 * u, 44 * u, 'MH 12 A8 1234', { hiIdx: 7 });
  ctx.globalAlpha = 1;
  if (r2 > .5) { const bl = .6 + .4 * Math.sin(T * 8); ctx.strokeStyle = `rgba(255,90,70,${bl})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x0 + 22 * u + (7 - 6) * 44 * u * .062 + 44 * u * .045, y - h / 2 + 56 * u, 3.6 * u, 0, 7); ctx.stroke();
    txt(ctx, '⚠ MISMATCH', x + w * .22, y - h / 2 + 46 * u, 4 * u, '#ff7a62', 900); }
  if (verdict > 0) { ctx.save(); ctx.translate(x + w * .2, y + h * .2); ctx.rotate(-.18); const s = lerp(1.8, 1, eo(clamp(verdict))); ctx.scale(s, s); ctx.globalAlpha = clamp(verdict * 2);
    ctx.strokeStyle = '#ff7a3d'; ctx.lineWidth = 6; rr(ctx, -150, -42, 300, 84, 12); ctx.stroke(); txt(ctx, 'REJECTED', 0, 18, 52, '#ff7a3d', 900); ctx.restore(); }
  ctx.restore();
}

// ---------- dotted globe ----------
const land = (lat, lon) => { // procedural continents: a sum of blobs (not a real map)
  const b = [[45, -100, 30], [-15, -60, 24], [50, 15, 20], [5, 20, 26], [55, 90, 32], [22, 78, 14], [-25, 135, 16], [65, -40, 10]];
  let v = 0; for (const [la, lo, r] of b) { let dl = lon - lo; dl = ((dl + 540) % 360) - 180; v = Math.max(v, 1 - Math.hypot(lat - la, dl * Math.cos(lat * Math.PI / 180) * 1.2) / r); }
  return v + .18 * Math.sin(lat * .3 + lon * .2) * Math.cos(lon * .15) > .05;
};
export function globe(ctx, T, cx, cy, r, { rot = 0, a = 1, pins = [] } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, cx, cy, r * 1.5, '70,120,255', .35); ctx.restore();
  let g = ctx.createRadialGradient(cx - r * .35, cy - r * .4, r * .1, cx, cy, r); g.addColorStop(0, '#16233e'); g.addColorStop(1, '#04070f'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
  const tilt = .35;
  for (let la = -80; la <= 80; la += 2.8) for (let lo = -180; lo < 180; lo += 2.8) {
    const phi = la * Math.PI / 180, th = lo * Math.PI / 180 + rot;
    let X = Math.cos(phi) * Math.sin(th), Y = Math.sin(phi), Z = Math.cos(phi) * Math.cos(th);
    const Y2 = Y * Math.cos(tilt) - Z * Math.sin(tilt), Z2 = Y * Math.sin(tilt) + Z * Math.cos(tilt); if (Z2 < 0) continue;
    const isL = land(la, lo); if (!isL && (Math.round(la / 2.8) + Math.round(lo / 2.8)) % 3) continue;
    ctx.fillStyle = isL ? `rgba(255,${170 + 30 * Z2 | 0},90,${.35 + .6 * Z2})` : `rgba(90,130,220,${.18 * Z2})`;
    ctx.beginPath(); ctx.arc(cx + X * r, cy - Y2 * r, (isL ? 4.2 : 2) * (.5 + .5 * Z2), 0, 7); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(120,170,255,.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
  g = ctx.createRadialGradient(cx, cy, r * .85, cx, cy, r * 1.08); g.addColorStop(0, 'rgba(90,150,255,0)'); g.addColorStop(1, 'rgba(90,150,255,.35)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r * 1.08, 0, 7); ctx.fill();
  const out = pins.map(([la, lo]) => { const phi = la * Math.PI / 180, th = lo * Math.PI / 180 + rot; const X = Math.cos(phi) * Math.sin(th), Y = Math.sin(phi), Z = Math.cos(phi) * Math.cos(th); const Y2 = Y * Math.cos(tilt) - Z * Math.sin(tilt), Z2 = Y * Math.sin(tilt) + Z * Math.cos(tilt); return [cx + X * r, cy - Y2 * r, Z2]; });
  ctx.restore(); return out;
}

// ---------- LED variable message sign (amber dot text) ----------
export function ledSign(ctx, T, x, y, w, h, lines, { a = 1, rgb = '255,176,60' } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 50; rr(ctx, x - w / 2, y - h / 2, w, h, 18); ctx.fillStyle = '#0b0c10'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#4a4d56'; ctx.lineWidth = 8; ctx.stroke();
  ctx.save(); rr(ctx, x - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28, 8); ctx.clip();
  ctx.fillStyle = 'rgba(255,176,60,.04)'; for (let yy = y - h / 2; yy < y + h / 2; yy += 9) for (let xx = x - w / 2; xx < x + w / 2; xx += 9) ctx.fillRect(xx, yy, 4, 4);
  lines.forEach(([s, col, size = 30], i) => { ctx.font = MONO(700, size); ctx.fillStyle = col || `rgb(${rgb})`; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 14; ctx.textAlign = 'left'; ctx.fillText(s, x - w / 2 + 36, y - h / 2 + 56 + i * size * 1.42); });
  ctx.restore();
  ctx.restore();
}
