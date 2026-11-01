// Original presenter character (teal hoodie, round glasses, headphones) drawn in code.
// Poses blend with an overshoot ease; mouth flaps while a word is being spoken; blinks are periodic.
import { lerp, clamp, eback, hash } from './lib.js';
// [rUpper, rFore, lUpper, lFore, rHand, lHand, brow]; angles: 0 = arm down, PI/2 = straight out, PI = up, >PI = inward
export const POSES = {
  idle: [.18, .15, .18, .15, 'fist', 'fist', 0], stop: [1.25, 1.55, .2, .1, 'open', 'fist', -1], point: [1.5, 1.35, .2, .1, 'point', 'fist', 1],
  think: [.45, 2.95, .25, 1.3, 'fist', 'fist', -1], panic: [2.1, 1.55, 2.1, 1.55, 'open', 'open', 1], thumbs: [.9, 1.25, .9, 1.25, 'thumb', 'thumb', 1],
  shrug: [.65, 1.05, .65, 1.05, 'open', 'open', 1], hold: [.75, 1.85, .2, .1, 'item', 'fist', 0], wave: [1.6, 1.5, .2, .1, 'open', 'fist', 1],
  cross: [.5, 2.3, .5, 2.3, 'fist', 'fist', -1], peace: [1.4, 1.5, .2, .1, 'peace', 'fist', 1], wow: [.7, 1.4, .7, 1.4, 'open', 'open', 2],
};
const SKIN = '#f1c09c', SKIN_D = '#d99c76', HOOD = '#1fa58f', HOOD_D = '#137a69', HAIR = '#3a2418';
function poseAt(T, track) { // track: [[t,name,item?],...] sorted
  let i = 0; while (i + 1 < track.length && track[i + 1][0] <= T) i++;
  const cur = POSES[track[i][1]], prev = POSES[(track[i - 1] || track[i])[1]], u = eback(clamp((T - track[i][0]) / .35));
  return { a: cur.map((v, k) => typeof v === 'number' ? lerp(prev[k], v, u) : v), item: track[i][2], name: track[i][1] };
}
function hand(ctx, x, y, ang, type, item, T) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = SKIN; ctx.strokeStyle = SKIN_D; ctx.lineWidth = 3;
  if (type === 'open') { ctx.beginPath(); ctx.ellipse(0, 18, 30, 34, 0, 0, 7); ctx.fill(); ctx.stroke(); for (let f = -1.5; f <= 1.5; f++) { ctx.beginPath(); ctx.roundRect(f * 14 - 6, 30, 12, 34, 6); ctx.fill(); ctx.stroke(); } }
  else { ctx.beginPath(); ctx.arc(0, 16, 28, 0, 7); ctx.fill(); ctx.stroke(); }
  if (type === 'point' || type === 'peace') { ctx.beginPath(); ctx.roundRect(-7, 26, 14, 52, 7); ctx.fill(); ctx.stroke(); }
  if (type === 'peace') { ctx.save(); ctx.rotate(-.35); ctx.beginPath(); ctx.roundRect(-7, 26, 14, 50, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
  if (type === 'thumb') { ctx.beginPath(); ctx.roundRect(-8, 20, 16, 46, 8); ctx.fill(); ctx.stroke(); }
  if (type === 'item' && item === 'thermo') { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#999'; ctx.beginPath(); ctx.roundRect(-9, 20, 18, 110, 9); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.arc(0, 30, 14, 0, 7); ctx.fill(); ctx.fillRect(-4, 30, 8, 40 + 40 * (.5 + .5 * Math.sin(T * 2))); }
  if (type === 'item' && item === 'plug') { ctx.fillStyle = '#e9e9ec'; ctx.strokeStyle = '#999'; ctx.beginPath(); ctx.roundRect(-22, 24, 44, 70, 10); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#c8a64a'; ctx.fillRect(-12, 92, 6, 18); ctx.fillRect(6, 92, 6, 18); ctx.strokeStyle = '#ddd'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 24); ctx.quadraticCurveTo(-30, -40, -10, -120); ctx.stroke(); }
  ctx.restore();
}
function arm(ctx, sx, sy, side, a1, a2, htype, item, T) {
  const d1 = [side * Math.sin(a1), Math.cos(a1)], ex = sx + d1[0] * 155, ey = sy + d1[1] * 155;
  const a = a1 + a2, d2 = [side * Math.sin(a), Math.cos(a)], hx = ex + d2[0] * 140, hy = ey + d2[1] * 140;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = HOOD_D; ctx.lineWidth = 62; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.strokeStyle = HOOD; ctx.lineWidth = 52; ctx.stroke();
  hand(ctx, hx, hy, -side * a, htype, item, T);
}
// cx = centre x, base = bottom y, s = scale; talk: 0..1 mouth openness
export function presenter(ctx, T, track, { cx = 540, base = 1920, s = 1, talk = 0, look = 0 } = {}) {
  const { a, item } = poseAt(T, track);
  ctx.save(); ctx.translate(cx, base); ctx.scale(s, s);
  const bob = Math.sin(T * 2.2) * 4;
  ctx.translate(0, bob);
  // torso
  ctx.fillStyle = HOOD; ctx.beginPath(); ctx.moveTo(-190, 0); ctx.bezierCurveTo(-200, -170, -150, -235, -60, -245); ctx.lineTo(60, -245); ctx.bezierCurveTo(150, -235, 200, -170, 190, 0); ctx.fill();
  ctx.fillStyle = HOOD_D; ctx.fillRect(-4, -200, 8, 200); ctx.beginPath(); ctx.moveTo(-60, -245); ctx.quadraticCurveTo(0, -170, 60, -245); ctx.fill();
  ctx.strokeStyle = '#eee'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-30, -200); ctx.lineTo(-34, -140); ctx.moveTo(30, -200); ctx.lineTo(34, -140); ctx.stroke(); // hoodie strings
  // neck + headphones around neck
  ctx.fillStyle = SKIN_D; ctx.fillRect(-32, -290, 64, 60);
  ctx.strokeStyle = '#2b2f36'; ctx.lineWidth = 16; ctx.beginPath(); ctx.ellipse(0, -248, 78, 34, 0, 0, Math.PI); ctx.stroke();
  ctx.fillStyle = '#2b2f36'; ctx.beginPath(); ctx.roundRect(-96, -270, 34, 50, 12); ctx.roundRect(62, -270, 34, 50, 12); ctx.fill();
  // head
  const hy = -400, tilt = Math.sin(T * 1.3) * .03 + look * .08;
  ctx.save(); ctx.translate(0, hy); ctx.rotate(tilt);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(0, 0, 112, 128, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-112, 10, 20, 28, 0, 0, 7); ctx.ellipse(112, 10, 20, 28, 0, 0, 7); ctx.fill(); // ears
  ctx.fillStyle = HAIR; ctx.beginPath(); ctx.moveTo(-118, -10); ctx.bezierCurveTo(-130, -120, -40, -165, 30, -150); ctx.bezierCurveTo(110, -140, 135, -80, 118, -10);
  ctx.bezierCurveTo(100, -70, 40, -95, -10, -80); ctx.bezierCurveTo(-60, -70, -95, -50, -118, -10); ctx.fill();
  // glasses + eyes
  const blink = ((T + 1.3) % 3.7) < .12 ? .1 : 1, brow = a[6];
  for (const ex of [-46, 46]) {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, 6, 36, 0, 7); ctx.fill();
    ctx.fillStyle = '#2a1a12'; ctx.beginPath(); ctx.ellipse(ex + look * 8, 10, 12, 14 * blink, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#1d1f24'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(ex, 6, 38, 0, 7); ctx.stroke();
    ctx.strokeStyle = HAIR; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ex - 26, -48 - brow * 6 + (ex < 0 ? brow * -3 : 0)); ctx.lineTo(ex + 26, -48 - brow * 6 + (ex > 0 ? brow * -3 : 0)); ctx.stroke();
  }
  ctx.strokeStyle = '#1d1f24'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-10, 4); ctx.lineTo(10, 4); ctx.stroke();
  // mouth
  const mo = clamp(talk) * 26;
  ctx.fillStyle = '#7a2b25'; ctx.beginPath(); ctx.ellipse(0, 72, 30, 6 + mo, 0, 0, 7); ctx.fill();
  if (mo > 8) { ctx.fillStyle = '#ef7d7d'; ctx.beginPath(); ctx.ellipse(0, 72 + mo * .5, 18, mo * .35, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(240,120,110,.25)'; ctx.beginPath(); ctx.arc(-74, 48, 18, 0, 7); ctx.arc(74, 48, 18, 0, 7); ctx.fill();
  ctx.restore();
  // arms (shoulders)
  arm(ctx, 140, -205, 1, a[0], a[1], a[4], item, T);
  arm(ctx, -140, -205, -1, a[2], a[3], a[5], item, T);
  ctx.restore();
}
export function talkAmount(T, WORDS) {
  for (const w of WORDS) if (T >= w.s && T <= w.e) return .45 + .55 * Math.abs(Math.sin((T - w.s) * 17 + hash(w.s)));
  return 0;
}
