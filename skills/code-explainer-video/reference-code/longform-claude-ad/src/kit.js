// Drawing kit for the 16:9 "one skill file" ad: backgrounds, kinetic type, cards, laptop, app UI, pixel buddy.
// Pure functions of their inputs + time T (deterministic). Photos come from src/assets (user's images).
import { W, H, clamp, lerp, eo, eio, hash, rr } from './lib.js';
import { IMG } from './assets.js';
export const SANS = (w, px) => `${w} ${px}px Inter, "Segoe UI", Arial`;
export const SERIF = px => `italic 400 ${px}px Georgia, "Times New Roman", serif`;
export const INK = '#262a36', BLUE = '#3f5fe0', BLUE2 = '#7d95ff', CORAL = '#d97757';

// cover-fit an image into a rect (optional pan 0..1 and zoom)
export function cover(ctx, name, x, y, w, h, { zoom = 1, px = .5, py = .5, a = 1 } = {}) {
  const i = IMG[name]; if (!i || a <= 0) return; const s = Math.max(w / i.width, h / i.height) * zoom, iw = i.width * s, ih = i.height * s;
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(i, x + (w - iw) * px, y + (h - ih) * py, iw, ih); ctx.restore();
}
export function photoBg(ctx, T, name, { zoom = 1.08, drift = .02 } = {}) {
  ctx.fillStyle = '#7fb2e5'; ctx.fillRect(-W, -H, W * 3, H * 3);
  cover(ctx, name, -60, -40, W + 120, H + 80, { zoom: zoom + drift * Math.sin(T * .2), px: .5 + .1 * Math.sin(T * .13), py: .5 });
}
// soft lavender studio background with drifting colour blobs
export function softBg(ctx, T, tint = 0) {
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#f6f5fc'); g.addColorStop(1, tint ? '#e9ecfb' : '#eceaf9');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  [['185,200,255', .22, .3, 520], ['242,205,236', .78, .7, 560], ['200,225,255', .65, .2, 420], ['255,225,205', .2, .85, 380]].forEach(([c, x, y, r], i) => {
    const cx = W * x + 120 * Math.sin(T * .23 + i * 2), cy = H * y + 90 * Math.cos(T * .19 + i), b = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
    b.addColorStop(0, `rgba(${c},.55)`); b.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = b; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  });
}
// dark space with a glowing blue planet horizon
export function spaceBg(ctx, T, glow = 1) {
  ctx.fillStyle = '#05060d'; ctx.fillRect(-W, -H, W * 3, H * 3);
  for (let i = 0; i < 120; i++) { ctx.fillStyle = `rgba(255,255,255,${.15 + .5 * hash(i, 3) * (.6 + .4 * Math.sin(T * 2 + i))})`; ctx.fillRect(hash(i) * W, hash(i, 1) * H * .8, 2, 2); }
  const cx = W / 2, cy = H + 1650, r = 2050 + 6 * Math.sin(T);
  let g = ctx.createRadialGradient(cx, cy, r - 300, cx, cy, r + 120); g.addColorStop(0, 'rgba(20,40,140,.0)'); g.addColorStop(.7, `rgba(40,80,255,${.25 * glow})`); g.addColorStop(.86, `rgba(90,140,255,${.5 * glow})`); g.addColorStop(1, 'rgba(40,80,255,0)');
  ctx.fillStyle = g; ctx.fillRect(-W, 0, W * 3, H * 2);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = '#04050b'; ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(120,170,255,${.95 * glow})`; ctx.lineWidth = 5; ctx.shadowColor = '#4d7dff'; ctx.shadowBlur = 40; ctx.stroke(); ctx.restore();
}

// ---------- kinetic type ----------
// One line of words that blur/slide in at their times. parts: [{s:'word', t, font, col}]. align 'center'|'left'.
export function line(ctx, T, parts, x, y, { align = 'center', gap = .26, out = 1e9, slide = 26 } = {}) {
  ctx.save(); ctx.textBaseline = 'alphabetic';
  const ws = parts.map(p => { ctx.font = p.font; return ctx.measureText(p.s).width; }), sp = parts.map(p => (parseInt(/(\d+)px/.exec(p.font)[1]) * gap));
  const tw = ws.reduce((a, b) => a + b, 0) + sp.slice(0, -1).reduce((a, b) => a + b, 0);
  let cx = align === 'center' ? x - tw / 2 : x; const fo = 1 - clamp((T - out) / .3);
  parts.forEach((p, i) => {
    const a = clamp((T - p.t + .05) / .3) * fo;
    if (a > 0) { ctx.globalAlpha = a; ctx.font = p.font; ctx.fillStyle = p.col || INK; if (a < 1) ctx.filter = `blur(${(1 - a) * 10}px)`;
      if (p.grad) { const g = ctx.createLinearGradient(cx, y - 120, cx + ws[i], y); g.addColorStop(0, p.grad[0]); g.addColorStop(1, p.grad[1]); ctx.fillStyle = g; }
      ctx.fillText(p.s, cx, y + (1 - eo(a)) * slide); ctx.filter = 'none'; }
    cx += ws[i] + sp[i];
  });
  ctx.restore(); return tw;
}
export function pillTag(ctx, x, y, s, a = 1, { size = 30, dark = false } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.font = SANS(700, size); const w = ctx.measureText(s).width + size * 1.3, h = size * 1.8;
  ctx.translate(x, y + (1 - eo(a)) * 20); ctx.filter = a < 1 ? `blur(${(1 - a) * 6}px)` : 'none';
  rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = dark ? 'rgba(20,22,30,.75)' : 'rgba(150,175,215,.55)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 2); ctx.restore();
}

// ---------- cards ----------
export function webCard(ctx, name, x, y, w, a = 1, { shadow = 1, r = 14 } = {}) {
  if (a <= 0) return; const h = w * .75; ctx.save(); ctx.globalAlpha *= a;
  ctx.shadowColor = `rgba(40,40,80,${.35 * shadow})`; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24; rr(ctx, x - w / 2, y - h / 2, w, h, r); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.save(); rr(ctx, x - w / 2, y - h / 2, w, h, r); ctx.clip(); cover(ctx, name, x - w / 2, y - h / 2, w, h); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.5; rr(ctx, x - w / 2, y - h / 2, w, h, r); ctx.stroke(); ctx.restore(); return h;
}
// card drawn with a fake 3D Y-rotation (ang radians) by horizontal squash + vertical shear
export function card3(ctx, name, x, y, w, ang, a = 1) {
  const c = Math.cos(ang); if (c <= .02) return; ctx.save(); ctx.translate(x, y); ctx.transform(c, Math.sin(ang) * .22, 0, 1, 0, 0); webCard(ctx, name, 0, 0, w, a); ctx.restore();
}
export function badge(ctx, x, y, s, a = 1, col = BLUE) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.scale(a, a); ctx.font = SANS(800, 24); const w = ctx.measureText(s).width + 30;
  rr(ctx, -w / 2, -20, w, 40, 20); ctx.fillStyle = col; ctx.shadowColor = 'rgba(40,60,200,.4)'; ctx.shadowBlur = 16; ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 1); ctx.restore();
}
// The skill file: a sky tile with a paper document on it. x,y centre; w tile width.
export function skillCard(ctx, T, x, y, w, a = 1, { tile = 1 } = {}) {
  if (a <= 0) return; const h = w * 1.22; ctx.save(); ctx.globalAlpha *= a;
  if (tile) { ctx.shadowColor = 'rgba(40,60,120,.35)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; rr(ctx, x - w / 2, y - h / 2, w, h, w * .07); ctx.fillStyle = '#5aa0e8'; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.save(); rr(ctx, x - w / 2, y - h / 2, w, h, w * .07); ctx.clip(); cover(ctx, 'sky', x - w / 2, y - h / 2, w, h, { zoom: 1.4, px: .7 }); ctx.restore(); }
  const pw = w * .62, ph = pw * 1.3, px = x - pw / 2 + w * .02, py = y - ph / 2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-.03); ctx.translate(-x, -y);
  ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10; rr(ctx, px, py, pw, ph, 6); ctx.fillStyle = '#fbfbfa'; ctx.fill(); ctx.shadowColor = 'transparent';
  const s = pw / 300; logo(ctx, px + 34 * s, py + 40 * s, 30 * s);
  ctx.fillStyle = INK; ctx.font = SANS(800, 40 * s); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('SKILL.md', px + 22 * s, py + 100 * s);
  ctx.fillStyle = CORAL; ctx.font = SANS(700, 17 * s); ctx.fillText('Claude Motion Studio', px + 22 * s, py + 126 * s);
  ctx.fillStyle = 'rgba(40,44,54,.28)'; [.8, .64, .72, .5, .76, .58, .7, .44].forEach((l, i) => ctx.fillRect(px + 22 * s, py + (160 + i * 22) * s, (pw - 44 * s) * l, 6 * s));
  ctx.restore(); ctx.restore(); return h;
}
export function logo(ctx, x, y, s, a = 1, spin = 0) { const i = IMG.claude_logo; if (!i || a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(spin); ctx.drawImage(i, -s / 2, -s / 2, s, s); ctx.restore(); }

// ---------- laptop (front view, silver) ----------
// (x,y) = screen centre, w = screen width. screenFn(ctx, w, h) draws in screen space.
export function laptop(ctx, x, y, w, screenFn) {
  const h = w * .625, b = w * .03;
  ctx.save(); ctx.shadowColor = 'rgba(20,40,80,.35)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 30;
  rr(ctx, x - w / 2 - b, y - h / 2 - b, w + 2 * b, h + 2 * b, b * 1.2); ctx.fillStyle = '#c9ccd2'; ctx.fill(); ctx.restore();
  rr(ctx, x - w / 2 - b * .7, y - h / 2 - b * .7, w + 1.4 * b, h + 1.4 * b, b); ctx.fillStyle = '#121316'; ctx.fill();
  ctx.save(); rr(ctx, x - w / 2, y - h / 2, w, h, 4); ctx.clip(); ctx.translate(x - w / 2, y - h / 2); screenFn && screenFn(ctx, w, h); ctx.restore();
  // base
  const by = y + h / 2 + b, g = ctx.createLinearGradient(0, by, 0, by + w * .1); g.addColorStop(0, '#e3e5e9'); g.addColorStop(1, '#8f939b');
  ctx.beginPath(); ctx.moveTo(x - w / 2 - b, by); ctx.lineTo(x + w / 2 + b, by); ctx.lineTo(x + w * .64, by + w * .085); ctx.lineTo(x - w * .64, by + w * .085); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = 'rgba(30,32,38,.35)'; for (let r = 0; r < 3; r++) ctx.fillRect(x - w * (.42 + r * .02), by + w * (.012 + r * .02), w * (.84 + r * .04), w * .012);
  ctx.fillStyle = '#7d818a'; rr(ctx, x - w * .65, by + w * .085, w * 1.3, w * .012, w * .006); ctx.fill();
  return { x0: x - w / 2, y0: y - h / 2, w, h };
}

// ---------- app UI (a chat-style coding app, drawn from scratch) ----------
export function appWindow(ctx, x, y, w, h, fn) {
  ctx.save(); ctx.shadowColor = 'rgba(40,50,90,.25)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24; rr(ctx, x, y, w, h, 18); ctx.fillStyle = '#fbfbfd'; ctx.fill(); ctx.restore();
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, k) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 26 + k * 22, y + 24, 7, 0, 7); ctx.fill(); });
  ctx.save(); rr(ctx, x, y, w, h, 18); ctx.clip(); fn(ctx, x, y, w, h); ctx.restore();
}
// Prompt box: typed text (n chars of txt), optional chips, model name, send button press.
export function promptBox(ctx, x, y, w, { txt = '', n = 0, chip = null, model = 'Opus 5.5', send = 0, s = 1, caret = true, T = 0 } = {}) {
  const h = 150 * s; ctx.save(); ctx.shadowColor = 'rgba(40,50,90,.15)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; rr(ctx, x, y, w, h, 18 * s); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(40,44,54,.12)'; ctx.lineWidth = 1.5; rr(ctx, x, y, w, h, 18 * s); ctx.stroke();
  let tx = x + 22 * s;
  if (chip) { const cw = 190 * s; rr(ctx, tx, y + 18 * s, cw, 44 * s, 10 * s); ctx.fillStyle = '#f1f2f6'; ctx.fill();
    if (chip.img) { ctx.save(); rr(ctx, tx + 6 * s, y + 24 * s, 44 * s, 32 * s, 6 * s); ctx.clip(); cover(ctx, chip.img, tx + 6 * s, y + 24 * s, 44 * s, 32 * s); ctx.restore(); } else logo(ctx, tx + 26 * s, y + 40 * s, 24 * s);
    ctx.fillStyle = INK; ctx.font = SANS(700, 17 * s); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(chip.name, tx + 58 * s, y + 40 * s); }
  const ty = y + (chip ? 92 : 50) * s; ctx.fillStyle = INK; ctx.font = SANS(500, 24 * s); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const shown = txt.slice(0, Math.floor(n)); ctx.fillText(shown || (n <= 0 ? '' : ''), tx, ty);
  if (!shown) { ctx.fillStyle = 'rgba(40,44,54,.35)'; ctx.fillText('Describe what to build…', tx, ty); }
  if (caret && Math.floor(T * 2.4) % 2) { ctx.fillStyle = CORAL; ctx.fillRect(tx + ctx.measureText(shown).width + 3, ty - 14 * s, 2.5 * s, 28 * s); }
  // bottom row
  const by = y + h - 30 * s; ctx.font = SANS(600, 17 * s); ctx.fillStyle = 'rgba(40,44,54,.55)'; ctx.fillText('+   Auto-accept edits', tx, by);
  ctx.textAlign = 'right'; ctx.fillText(model + '  ⌄', x + w - 80 * s, by);
  const sx = x + w - 40 * s; ctx.save(); ctx.translate(sx, by); ctx.scale(1 - .15 * send, 1 - .15 * send); ctx.beginPath(); ctx.arc(0, 0, 20 * s, 0, 7); ctx.fillStyle = n > 0 ? CORAL : '#c9c3bf'; ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 9 * s); ctx.lineTo(0, -9 * s); ctx.moveTo(-7 * s, -2 * s); ctx.lineTo(0, -9 * s); ctx.lineTo(7 * s, -2 * s); ctx.stroke(); ctx.restore();
  return { sendX: sx, sendY: by, h };
}
export function modelMenu(ctx, x, y, s, sel, a = 1) {
  if (a <= 0) return; const items = [['Haiku 5.5', 'Fastest for quick tasks'], ['Sonnet 5.5', 'Smart, efficient for everyday'], ['Opus 5.5', 'Most capable for ambitious work'], ['Fable 5.1', 'Long-form creative work']];
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y + (1 - eo(a)) * 20); const w = 330 * s, h = (items.length * 62 + 16) * s;
  ctx.shadowColor = 'rgba(40,50,90,.22)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10; rr(ctx, 0, -h, w, h, 14 * s); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
  items.forEach(([n, d], i) => { const iy = -h + (8 + i * 62) * s; if (i === sel) { rr(ctx, 8 * s, iy, w - 16 * s, 58 * s, 10 * s); ctx.fillStyle = '#eef1ff'; ctx.fill(); }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = INK; ctx.font = SANS(700, 19 * s); ctx.fillText(n, 22 * s, iy + 26 * s); ctx.fillStyle = 'rgba(40,44,54,.5)'; ctx.font = SANS(500, 14 * s); ctx.fillText(d, 22 * s, iy + 46 * s);
    if (i === sel) { ctx.strokeStyle = BLUE; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(w - 46 * s, iy + 30 * s); ctx.lineTo(w - 38 * s, iy + 38 * s); ctx.lineTo(w - 24 * s, iy + 20 * s); ctx.stroke(); } });
  ctx.restore();
}
export function cursor(ctx, x, y, press = 0, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1.3 - press * .2), s * (1.3 - press * .2)); ctx.fillStyle = '#111'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.lineTo(8, 23); ctx.lineTo(14, 35); ctx.lineTo(19, 33); ctx.lineTo(13, 21); ctx.lineTo(23, 21); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}
export function check(ctx, x, y, r, a = 1, col = '#34c759') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = r * .24; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x - r * .42, y); ctx.lineTo(x - r * .1, y + r * .32); ctx.lineTo(x + r * .45, y - r * .35); ctx.stroke(); ctx.restore();
}

// ---------- pixel buddy (an original little file character) ----------
const BUDDY = ['..XXXXXX.', '..XXXXXXX', '..XXXXXXX', '..XEXXEXX', '..XXXXXXX', '..XXXXXXX', '..L.L.L.L'];
export function buddy(ctx, T, x, y, s = 12, { walk = 0, hat = 0, blink = true, a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; const bob = walk ? Math.abs(Math.sin(T * 12)) * s * .8 : Math.sin(T * 3) * s * .25;
  ctx.translate(x - s * 4.5, y - s * 7 - bob);
  const closed = blink && (T % 3.1) < .12;
  BUDDY.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === '.') return; let col = ch === 'E' ? (closed ? '#d06a4c' : '#1d1f26') : '#e07c5c';
    if (ch === 'L') { const lift = walk && ((c + Math.floor(T * 10)) % 2) ? -s * .5 : 0; ctx.fillStyle = '#b85c40'; ctx.fillRect(c * s, r * s + lift, s, s); return; }
    if (r === 0 && c === 7) return; ctx.fillStyle = col; ctx.fillRect(c * s, r * s, s + .5, s + .5);
  }));
  ctx.fillStyle = '#f3b49c'; ctx.fillRect(8 * s, 0, s, s); // folded corner
  ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(2 * s, 6 * s, 7 * s, s * .4);
  if (hat > 0) { ctx.globalAlpha *= hat; ctx.fillStyle = '#3f4fbf'; ctx.beginPath(); ctx.moveTo(1 * s, 0); ctx.lineTo(10 * s, 0); ctx.lineTo(6 * s, -5 * s); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#f4d35e'; ctx.fillRect(5 * s, -3 * s, s * .8, s * .8); }
  ctx.restore();
  ctx.save(); ctx.globalAlpha *= .18 * a; ctx.fillStyle = '#334'; ctx.beginPath(); ctx.ellipse(x, y + s * .6, s * 4, s * .8, 0, 0, 7); ctx.fill(); ctx.restore();
}
// big number drawn out of dots that fly into place (k 0..1)
export function dotNumber(ctx, T, s, x, y, size, k, col = '80,120,255') {
  const oc = dotNumber.cache || (dotNumber.cache = {}); let pts = oc[s + size];
  if (!pts) { const c = new OffscreenCanvas(Math.ceil(size * s.length * .7), Math.ceil(size * 1.1)), g = c.getContext('2d'); g.font = SANS(900, size); g.textBaseline = 'top'; g.fillStyle = '#000'; g.fillText(s, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data, step = Math.round(size / 18); pts = []; for (let j = 0; j < c.height; j += step) for (let i = 0; i < c.width; i += step) if (d[(j * c.width + i) * 4 + 3] > 128) pts.push([i, j]);
    pts.w = g.measureText(s).width; oc[s + size] = pts; }
  ctx.save(); const r = size / 40;
  pts.forEach(([i, j], n) => { const u = eo(clamp(k * 1.6 - hash(n) * .6)); if (u <= 0) return; const sx = x - pts.w / 2 + i, sy = y + j, fx = sx + (hash(n, 1) - .5) * 900, fy = sy + (hash(n, 2) - .5) * 700;
    ctx.fillStyle = `rgba(${col},${.35 + .65 * u})`; ctx.beginPath(); ctx.arc(lerp(fx, sx, u), lerp(fy, sy, u) + Math.sin(T * 3 + n) * 1.5, r * (1 + .3 * Math.sin(T * 4 + n)), 0, 7); ctx.fill(); });
  ctx.restore();
}
