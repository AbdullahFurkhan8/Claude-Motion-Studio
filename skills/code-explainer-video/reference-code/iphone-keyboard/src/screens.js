// Phone screen contents. Each draws in (0,0)-(w,h) screen space.
import { rr, lerp, clamp, eo, hash, drop, ring, stack, finger } from './lib.js';
const F = (wt, px) => `${wt} ${px}px Inter, "Segoe UI", Arial`;

function wall(ctx, w, h, a = '#5a4d48', b = '#1f1b1a') {
  const g = ctx.createLinearGradient(0, 0, w * .4, h); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}
export function lock(ctx, w, h, T, { missed = 0, frost = 0 } = {}) {
  wall(ctx, w, h);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
  ctx.font = F(600, 24); ctx.globalAlpha = .85; ctx.fillText('Saturday, January 17', w / 2, 140); ctx.globalAlpha = 1;
  ctx.font = F(700, 150); ctx.fillText('7:42', w / 2, 290);
  [[70, h - 90], [w - 70, h - 90]].forEach(([x, y]) => { ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.arc(x, y, 38, 0, 7); ctx.fill(); });
  if (missed > 0) {
    ctx.save(); ctx.globalAlpha = missed; const y = lerp(h - 300, h - 260, 1 - missed);
    rr(ctx, 24, y, w - 48, 96, 26); ctx.fillStyle = 'rgba(40,36,34,.85)'; ctx.fill();
    rr(ctx, 44, y + 24, 48, 48, 12); ctx.fillStyle = '#34c759'; ctx.fill();
    ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = F(700, 24); ctx.fillText('Sofia', 110, y + 44);
    ctx.font = F(500, 21); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText('Missed Call', 110, y + 74); ctx.restore();
  }
  if (frost > 0) frostFx(ctx, w, h, T, frost);
}
export function frostFx(ctx, w, h, T, a) {
  ctx.save(); ctx.globalAlpha = a;
  const g = ctx.createRadialGradient(w * .4, h * .55, 20, w * .4, h * .55, w * .9); g.addColorStop(0, 'rgba(230,236,245,.35)'); g.addColorStop(1, 'rgba(230,236,245,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(hash(i, 7) * w, hash(i, 8) * h, 1 + 3 * hash(i, 9), 0, 7); ctx.fill(); }
  ctx.restore();
}
// incoming call; slide 0..1 = knob progress; answered 0..1 = cross-fade to in-call UI
export function call(ctx, w, h, T, { slide = 0, answered = 0, ringing = 1 } = {}) {
  wall(ctx, w, h, '#c4aea6', '#6e5e59');
  ctx.fillStyle = '#e9d9d2'; ctx.beginPath(); ctx.arc(70, 120, 34, 0, 7); ctx.fill();
  ctx.fillStyle = '#8a6a5c'; ctx.beginPath(); ctx.arc(70, 110, 13, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(70, 146, 22, Math.PI, 0); ctx.fill();
  ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = F(500, 20); ctx.fillText('mobile', 118, 108);
  ctx.fillStyle = '#fff'; ctx.font = F(700, 34); ctx.fillText('Sofia', 118, 144);
  if (answered < 1) {
    ctx.save(); ctx.globalAlpha = 1 - answered;
    const px = 40, pw = w - 80, py = h - 170; rr(ctx, px, py, pw, 84, 42); ctx.fillStyle = 'rgba(40,30,28,.35)'; ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${.55 * (1 - slide)})`; ctx.font = F(500, 26); ctx.textAlign = 'center';
    ctx.fillText('slide to answer', w / 2 + 30, py + 51);
    const kx = lerp(px + 42, px + pw - 42, eo(slide));
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(kx, py + 42, 34, 0, 7); ctx.fill();
    ctx.fillStyle = '#34c759'; ctx.font = F(700, 30); ctx.fillText('✆', kx, py + 52);
    if (ringing) { const r = (T * 1.2) % 1; ctx.strokeStyle = `rgba(255,255,255,${.5 * (1 - r)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(70, 120, 34 + 30 * r, 0, 7); ctx.stroke(); }
    ctx.restore();
  }
  if (answered > 0) {
    ctx.save(); ctx.globalAlpha = answered; ctx.fillStyle = 'rgba(30,30,32,.75)'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = F(700, 40); ctx.fillText('Sofia', w / 2, 200);
    ctx.font = F(500, 24); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText('0:0' + Math.min(9, Math.floor(answered * 3)), w / 2, 238);
    for (let i = 0; i < 6; i++) { const x = w / 2 + ((i % 3) - 1) * 130, y = h - 470 + Math.floor(i / 3) * 140; ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.arc(x, y, 44, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#ff3b30'; ctx.beginPath(); ctx.arc(w / 2, h - 150, 46, 0, 7); ctx.fill(); ctx.restore();
  }
}
const ICONS = ['#3a8bff', '#ff9f0a', '#34c759', '#ff2d55', '#5e5ce6', '#ffd60a', '#64d2ff', '#bf5af2', '#ff453a', '#30d158', '#0a84ff', '#ff6b00', '#e9e9ee', '#ff375f', '#32ade6', '#ac8e68'];
export function home(ctx, w, h, T, { jitter = 0 } = {}) {
  wall(ctx, w, h, '#4d4642', '#1d1a19');
  const s = 88, gx = (w - 4 * s) / 5;
  for (let i = 0; i < 16; i++) {
    const c = i % 4, r = Math.floor(i / 4), x = gx + c * (s + gx), y = 110 + r * 150;
    const j = jitter * Math.sin(T * 30 + i * 3) * 6;
    rr(ctx, x + j, y, s, s, 22); ctx.fillStyle = ICONS[i]; ctx.fill();
    rr(ctx, x + 20 + j, y + 20, s - 40, s - 40, 10); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill();
  }
  rr(ctx, 24, h - 150, w - 48, 120, 40); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fill();
  for (let i = 0; i < 4; i++) { rr(ctx, gx + i * (s + gx), h - 134, s, s, 22); ctx.fillStyle = ICONS[(i * 5) % 16]; ctx.fill(); }
}
export function map(ctx, w, h, T) {
  ctx.fillStyle = '#e8e6e1'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 16;
  for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-50, i * 160 + T * 40 % 160); ctx.lineTo(w + 50, i * 160 - 120 + T * 40 % 160); ctx.stroke(); }
  ctx.lineWidth = 10; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(i * 130 + 20, -20); ctx.lineTo(i * 130 - 60, h + 20); ctx.stroke(); }
  ctx.strokeStyle = '#ffcc4d'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(w * .7, -20); ctx.lineTo(w * .2, h + 20); ctx.stroke();
  ctx.fillStyle = '#3478f6'; ctx.beginPath(); ctx.arc(w * .45, h * .45, 16, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.stroke();
  rr(ctx, 24, h - 140, w - 48, 80, 30); ctx.fillStyle = '#fff'; ctx.fill(); ctx.fillStyle = '#999'; ctx.font = F(500, 24); ctx.textAlign = 'left'; ctx.fillText('Search Maps', 70, h - 90);
}
export function photo(ctx, w, h, T, zoom = 1) { // snowy evening photo for pinch-to-zoom
  ctx.save(); ctx.translate(w / 2, h * .45); ctx.scale(zoom, zoom); ctx.translate(-w / 2, -h * .45);
  let g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2b2a3a'); g.addColorStop(.45, '#c8784a'); g.addColorStop(.55, '#f1d8c4'); g.addColorStop(1, '#ffffff');
  ctx.fillStyle = g; ctx.fillRect(-w, -h, w * 3, h * 3);
  for (let i = 0; i < 9; i++) { const x = hash(i, 3) * w, tw = 10 + 20 * hash(i, 4); ctx.fillStyle = '#2a1d18'; ctx.fillRect(x, h * .1, tw, h * .5); ctx.strokeStyle = '#2a1d18'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, h * .3); ctx.lineTo(x - 50, h * .2); ctx.moveTo(x + tw, h * .25); ctx.lineTo(x + 60, h * .15); ctx.stroke(); }
  ctx.fillStyle = '#f7efe8'; ctx.beginPath(); ctx.ellipse(w * .5, h * .72, w, h * .2, 0, 0, 7); ctx.fill();
  ctx.restore();
}
// Reel/short UI with a mini scene inside. o: following 0/1, share 0..1 sheet, pick 0/1, sent 0/1, wet 0..1
export function reel(ctx, w, h, T, o = {}) {
  ctx.fillStyle = '#0b0e14'; ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.translate(0, 80); ctx.scale(w / 1080, w / 1080);
  stack(ctx, T, { y: 760, sp: 110, pulls: [{ x: 540, y: 420, s: .8, r: 130 }] });
  finger(ctx, { x: 540, y: 410, ang: -.3, wid: 330, T, glow: .6 });
  ctx.restore();
  // right rail
  ['♡', '💬', '⟳', '➤', '⋯'].forEach((c, i) => { ctx.fillStyle = '#fff'; ctx.font = F(600, 38); ctx.textAlign = 'center'; ctx.fillText(c, w - 46, h * .48 + i * 86); });
  // bottom author row
  ctx.fillStyle = '#b48d7a'; ctx.beginPath(); ctx.arc(52, h - 230, 26, 0, 7); ctx.fill();
  ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = F(700, 24); ctx.fillText('agentsoly', 92, h - 222);
  const f = o.following || 0; rr(ctx, 240, h - 252, 150, 44, 12);
  ctx.fillStyle = f ? 'rgba(255,255,255,.18)' : '#fff'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = f ? '#fff' : '#000'; ctx.font = F(700, 22); ctx.textAlign = 'center'; ctx.fillText(f ? 'Following' : 'Follow', 315, h - 223);
  ctx.textAlign = 'left'; ctx.font = F(500, 20); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillText('♫ Original audio · agentsoly', 40, h - 170);
  ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(0, h - 120, w, 120);
  ['⌂', '▣', '▽', '⌕', '◉'].forEach((c, i) => { ctx.fillStyle = '#fff'; ctx.font = F(600, 32); ctx.textAlign = 'center'; ctx.fillText(c, (i + .5) * w / 5, h - 58); });
  const sh = o.share || 0;
  if (sh > 0) {
    ctx.save(); ctx.translate(0, (1 - eo(sh)) * h * .6); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(0, -h, w, h * 2);
    const y0 = h * .42; rr(ctx, 0, y0, w, h, 34); ctx.fillStyle = '#23262d'; ctx.fill();
    rr(ctx, w / 2 - 34, y0 + 14, 68, 7, 4); ctx.fillStyle = '#666'; ctx.fill();
    rr(ctx, 26, y0 + 46, w - 52, 54, 14); ctx.fillStyle = '#353943'; ctx.fill();
    ctx.fillStyle = '#999'; ctx.font = F(500, 22); ctx.textAlign = 'left'; ctx.fillText('⌕  Search', 46, y0 + 81);
    const names = ['Sofia', 'Daniel', 'Mei', 'Lucas'], cols = ['#d6a37f', '#8d6e63', '#c58f72', '#7b8f5a'];
    names.forEach((n, i) => {
      const x = (i + .5) * w / 4, y = y0 + 180;
      ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.arc(x, y, 50, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(40,25,20,.55)'; ctx.beginPath(); ctx.arc(x, y - 10, 18, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(x, y + 40, 32, Math.PI, 0); ctx.fill();
      if (i === 0 && o.pick) { ctx.strokeStyle = '#2f8cff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, 56, 0, 7); ctx.stroke(); ctx.fillStyle = '#2f8cff'; ctx.beginPath(); ctx.arc(x + 38, y + 38, 15, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = F(800, 18); ctx.textAlign = 'center'; ctx.fillText('✓', x + 38, y + 45); }
      ctx.fillStyle = '#ddd'; ctx.font = F(500, 21); ctx.textAlign = 'center'; ctx.fillText(n, x, y + 84);
    });
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.font = F(500, 22); ctx.textAlign = 'left'; ctx.fillText('Write a message...', 40, y0 + 330);
    const sb = o.pick ? 1 : .35; rr(ctx, 26, y0 + 380, w - 52, 70, 16); ctx.fillStyle = o.sent ? '#1d4f8c' : `rgba(47,140,255,${sb})`; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = F(700, 26); ctx.textAlign = 'center'; ctx.fillText(o.sent ? '✓ Sent' : 'Send', w / 2, y0 + 424);
    ctx.restore();
  }
  if (o.wet > 0) for (let i = 0; i < 14; i++) { const a = clamp(o.wet * 14 - i); if (a > 0) drop(ctx, hash(i, 11) * w, hash(i, 12) * h * .9 + 40, (10 + 16 * hash(i, 13)) * a); }
}
export { ring };
