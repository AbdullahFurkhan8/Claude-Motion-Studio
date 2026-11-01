// Drawing kit for the "Chinese AI copy Claude" distillation explainer. Pure functions of their inputs + time T.
import { W, H, clamp, lerp, eo, eio, eback, hash, rr } from './lib.js';
import { IMG } from './assets.js';
export const FONT = (w, px) => `${w} ${px}px Inter, "Segoe UI", "Nirmala UI", Arial`;
export const MONO = (w, px) => `${w} ${px}px "Cascadia Mono", Consolas, monospace`;
export const SERIF = (w, px, it = '') => `${it} ${w} ${px}px Georgia, "Times New Roman", serif`;
export const CORAL = '#d97757', CORAL_RGB = '217,119,87', PURPLE = '#6d5df2', PURPLE_RGB = '109,93,242';
export const BLUE = '#2f7bff', GREEN = '#30c060', RED = '#ff4a3d', AMBER = '#f2a114', INK = '#15161a';
export const fmt = n => Math.round(n).toLocaleString('en-US');

export function txt(ctx, s, x, y, size, col = '#fff', w = 700, align = 'center', font = FONT) {
  ctx.fillStyle = col; ctx.font = font(w, size); ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y);
}
export function tw(ctx, s, size, w = 700, font = FONT) { ctx.font = font(w, size); return ctx.measureText(s).width; }
// blur-in: alpha + blur + slide up while a goes 0 -> 1
export function bin(ctx, a, fn, dy = 24) {
  a = clamp(a); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; if (a < 1) ctx.filter = `blur(${((1 - a) * 9).toFixed(1)}px)`; ctx.translate(0, (1 - eo(a)) * dy); fn(); ctx.restore();
}
// scale-pop around (x,y)
export function pop(ctx, a, x, y, fn, rot = 0) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.rotate(rot * (1 - a)); ctx.scale(a, a); ctx.translate(-x, -y); fn(); ctx.restore();
}

// ---------- backgrounds ----------
export function bgDark(ctx, T, gx = W / 2, gy = 1050, glow = 1) {
  ctx.fillStyle = '#0d0d10'; ctx.fillRect(-W, -H, W * 3, H * 3);
  const off = (T * 6) % 60;
  ctx.strokeStyle = 'rgba(255,255,255,.035)'; ctx.lineWidth = 1.2; ctx.beginPath();
  for (let x = -60 + off; x <= W + 60; x += 60) { ctx.moveTo(x, -200); ctx.lineTo(x, H + 200); }
  for (let y = -60 + off * .5; y <= H + 60; y += 60) { ctx.moveTo(-200, y); ctx.lineTo(W + 200, y); }
  ctx.stroke();
  if (glow > 0) {
    const r = 620 + 40 * Math.sin(T * .8), g = ctx.createRadialGradient(gx, gy, 10, gx, gy, r);
    g.addColorStop(0, `rgba(96,72,230,${.2 * glow})`); g.addColorStop(.5, `rgba(70,50,190,${.08 * glow})`); g.addColorStop(1, 'rgba(60,40,160,0)');
    ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  }
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .85); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = v; ctx.fillRect(-W, -H, W * 3, H * 3);
}
export function bgLight(ctx, T) {
  ctx.fillStyle = '#f6f6f3'; ctx.fillRect(-W, -H, W * 3, H * 3);
  const off = (T * 6) % 60;
  ctx.strokeStyle = 'rgba(20,20,40,.045)'; ctx.lineWidth = 1.2; ctx.beginPath();
  for (let x = -60 + off; x <= W + 60; x += 60) { ctx.moveTo(x, -200); ctx.lineTo(x, H + 200); }
  for (let y = -60 + off * .5; y <= H + 60; y += 60) { ctx.moveTo(-200, y); ctx.lineTo(W + 200, y); }
  ctx.stroke();
  const g = ctx.createRadialGradient(W / 2, 1000, 50, W / 2, 1000, 1100); g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(225,224,218,.35)');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
}

// ---------- cards & chrome ----------
export function card(ctx, x, y, w, h, { r = 26, fill = '#fff', sh = 1, stroke = 'rgba(0,0,0,.07)', dark = false } = {}) {
  ctx.save();
  if (sh > 0) {
    ctx.shadowColor = dark ? `rgba(0,0,0,${.6 * sh})` : `rgba(30,30,60,${.10 * sh})`; ctx.shadowBlur = 70; ctx.shadowOffsetY = 28;
    rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
    ctx.shadowColor = dark ? `rgba(0,0,0,${.5 * sh})` : `rgba(30,30,60,${.08 * sh})`; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3; ctx.fill();
  }
  ctx.shadowColor = 'transparent'; rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
}
// macOS-style window; body(ctx, x, y, w, h) is clipped to the content area (below the 64 px title bar)
export function macWin(ctx, x, y, w, h, title, body, { dark = false, r = 26 } = {}) {
  card(ctx, x, y, w, h, { r, fill: dark ? '#17171c' : '#fff', dark, stroke: dark ? 'rgba(255,255,255,.09)' : 'rgba(0,0,0,.07)' });
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 34 + i * 26, y + 32, 8.5, 0, 7); ctx.fill(); });
  txt(ctx, title, x + w / 2, y + 41, 24, dark ? '#e8e8ee' : '#1b1c20', 700);
  ctx.fillStyle = dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'; ctx.fillRect(x, y + 64, w, 1.5);
  ctx.save(); rr(ctx, x, y + 65, w, h - 65, [0, 0, r, r]); ctx.clip(); body(ctx, x, y + 65, w, h - 65); ctx.restore();
}

// ---------- logos ----------
export function logo(ctx, name, x, y, w, a = 1, rot = 0) {
  const i = IMG[name]; if (!i || a <= 0) return; const h = w * i.height / i.width;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(i, -w / 2, -h / 2, w, h); ctx.restore();
}
export function glowDot(ctx, x, y, r, rgb, a = 1) {
  if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${.55 * a})`); g.addColorStop(.4, `rgba(${rgb},${.18 * a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
// Claude starburst: slow spin + breathing; glow on dark scenes
export function claude(ctx, T, x, y, w, { a = 1, glow = 0, spin = .18 } = {}) {
  if (a <= 0) return; if (glow > 0) glowDot(ctx, x, y, w * 1.25, CORAL_RGB, glow * a);
  logo(ctx, 'claude', x, y, w * (1 + .03 * Math.sin(T * 2.1)), a, T * spin);
}
export function qwen(ctx, T, x, y, w, { a = 1, glow = 0 } = {}) {
  if (a <= 0) return; if (glow > 0) glowDot(ctx, x, y, w * 1.3, PURPLE_RGB, glow * a);
  ctx.save(); ctx.translate(x, y); ctx.transform(Math.cos(.16 * Math.sin(T * .9)), 0, 0, 1, 0, 0); logo(ctx, 'qwen', 0, 0, w * (1 + .025 * Math.sin(T * 1.7 + 1)), a); ctx.restore();
}
// Anthropic "A\" mark drawn in code (height s, centred on x,y)
export function anthropicMark(ctx, x, y, s, col = INK, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x - s * .62, y - s / 2); ctx.scale(s, s); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(.36, 0); ctx.lineTo(.56, 0); ctx.lineTo(.92, 1); ctx.lineTo(.71, 1); ctx.lineTo(.635, .78); ctx.lineTo(.285, .78); ctx.lineTo(.21, 1); ctx.closePath();
  ctx.moveTo(.345, .6); ctx.lineTo(.575, .6); ctx.lineTo(.46, .265); ctx.closePath(); ctx.fill('evenodd');
  ctx.beginPath(); ctx.moveTo(.66, 0); ctx.lineTo(.87, 0); ctx.lineTo(1.24, 1); ctx.lineTo(1.03, 1); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// ---------- small UI ----------
export function cursor(ctx, x, y, press = 0, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); const s = 1.55 - press * .18; ctx.scale(s, s);
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#111'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.lineTo(8, 23); ctx.lineTo(14, 35); ctx.lineTo(19, 33); ctx.lineTo(13, 21); ctx.lineTo(23, 21); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
}
export function clickRing(ctx, x, y, t, rgb = '47,123,255') {
  if (t <= 0 || t >= 1) return; ctx.save(); ctx.strokeStyle = `rgba(${rgb},${.8 * (1 - t)})`; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y, 8 + 46 * eo(t), 0, 7); ctx.stroke(); ctx.restore();
}
export function check(ctx, x, y, r, k = 1, col = GREEN) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); const s = eback(clamp(k * 1.4)); ctx.scale(s, s);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = r * .26; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const d = clamp(k * 1.6 - .4);
  ctx.beginPath(); ctx.moveTo(-r * .42, 0); if (d > 0) ctx.lineTo(lerp(-r * .42, -r * .1, clamp(d * 2)), lerp(0, r * .32, clamp(d * 2))); if (d > .5) ctx.lineTo(lerp(-r * .1, r * .45, clamp(d * 2 - 1)), lerp(r * .32, -r * .35, clamp(d * 2 - 1))); ctx.stroke(); ctx.restore();
}
export function xmark(ctx, x, y, r, k = 1, col = RED) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); const s = eback(clamp(k * 1.4)); ctx.scale(s, s);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = r * .24; ctx.lineCap = 'round'; const q = r * .36;
  ctx.beginPath(); ctx.moveTo(-q, -q); ctx.lineTo(q, q); ctx.moveTo(q, -q); ctx.lineTo(-q, q); ctx.stroke(); ctx.restore();
}
// centred pill; returns its width
export function pill(ctx, x, y, s, { bg = CORAL, fg = '#fff', size = 24, w = 700, padX = 18, h, a = 1, stroke, font = FONT, align = 'center' } = {}) {
  ctx.font = font(w, size); const tw_ = ctx.measureText(s).width, ww = tw_ + padX * 2, hh = h || size * 1.65;
  if (a <= 0) return ww; ctx.save(); ctx.globalAlpha *= a; const x0 = align === 'left' ? x : x - ww / 2;
  rr(ctx, x0, y - hh / 2, ww, hh, hh / 2); if (bg) { ctx.fillStyle = bg; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.fillStyle = fg; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, x0 + padX, y + 1); ctx.textBaseline = 'alphabetic'; ctx.restore(); return ww;
}
// token chip ("· best") with a coloured border; returns width. x = left edge
export const TOKCOL = ['#c9cdd6', '#5b9dff', '#3fd08a', '#f4b63f', '#ff6b8b', '#b58cff', '#4fd6e8', '#ff9c5b', '#9be15d'];
export function chip(ctx, x, y, s, col, { size = 30, dark = true, a = 1, glow = 0, lead = true, fill } = {}) {
  ctx.font = MONO(700, size); const t = (lead ? '·' : '') + s, ww = ctx.measureText(t).width + size * .9, hh = size * 1.55;
  if (a <= 0) return ww; ctx.save(); ctx.globalAlpha *= a;
  if (glow > 0) { ctx.shadowColor = col; ctx.shadowBlur = 24 * glow; }
  rr(ctx, x, y - hh / 2, ww, hh, 9); ctx.fillStyle = fill || (dark ? 'rgba(18,18,24,.92)' : '#fff'); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.fillStyle = dark ? '#f2f2f6' : INK; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(t, x + size * .45, y + 1);
  if (lead) { ctx.fillStyle = col; ctx.fillText('·', x + size * .45, y + 1); }
  ctx.textBaseline = 'alphabetic'; ctx.restore(); return ww;
}
// horizontal bar that never spills: the fill is clipped to the rounded track
export function bar(ctx, x, y, w, h, frac, col, track = 'rgba(0,0,0,.08)') {
  rr(ctx, x, y, w, h, h / 2); ctx.fillStyle = track; ctx.fill();
  const f = clamp(frac); if (f <= 0) return;
  ctx.save(); rr(ctx, x, y, w, h, h / 2); ctx.clip(); rr(ctx, x - h, y, h + w * f, h, h / 2); ctx.fillStyle = col; ctx.fill(); ctx.restore();
}
// wrap text into lines that fit maxW (by words)
export function wrap(ctx, s, maxW) {
  const out = []; let line = '';
  for (const wd of s.split(' ')) { const t = line ? line + ' ' + wd : wd; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = wd; } else line = t; }
  if (line) out.push(line); return out;
}
// draw wrapped text, revealing the first n characters (typing); returns number of lines
export function para(ctx, s, x, y, maxW, lh, font, col, n = 1e9, align = 'left') {
  ctx.font = font; ctx.fillStyle = col; ctx.textAlign = align; const lines = wrap(ctx, s, maxW); let left = n;
  lines.forEach((ln, i) => { if (left <= 0) return; ctx.fillText(ln.slice(0, Math.max(0, Math.floor(left))), x, y + i * lh); left -= ln.length + 1; });
  return lines.length;
}
// tiny chat card (the "exchanges" flying from Claude to Qwen)
const SNIPS = ["Here's a cleaner way: read the file once.", 'Step by step: first, split the problem.', 'Sure, the bug is in line 42.', 'Done. The tests pass now.', 'Short answer: use a hash map.', "Let's think about each part."];
export function miniCard(ctx, x, y, w, seed, a = 1, rot = 0) {
  if (a <= 0) return; const h = w * .5;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot);
  card(ctx, -w / 2, -h / 2, w, h, { r: w * .07, sh: .6 });
  ctx.fillStyle = CORAL; ctx.beginPath(); ctx.arc(-w / 2 + w * .09, -h / 2 + h * .2, w * .025, 0, 7); ctx.fill();
  para(ctx, SNIPS[seed % SNIPS.length], -w / 2 + w * .08, -h / 2 + h * .45, w * .84, w * .085, SERIF(400, Math.max(6, w * .066)), '#333');
  ctx.restore();
}
// drawn gradient "a" avatar (Hindi: silhouette only, no name)
export function avatar(ctx, T, x, y, r, named) {
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, '#1fa58f'); g.addColorStop(1, '#f2a25c'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; if (named) txt(ctx, 'a', x, y + r * .32, r * .92, '#fff', 900); else { ctx.beginPath(); ctx.arc(x, y - r * .28, r * .34, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y + r * .58, r * .6, r * .42, 0, Math.PI, 0); ctx.fill(); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(T * 1.6); const cg = ctx.createConicGradient(0, 0, 0); cg.addColorStop(0, '#f2a25c'); cg.addColorStop(.5, '#1fa58f'); cg.addColorStop(1, '#f2a25c'); ctx.strokeStyle = cg; ctx.lineWidth = r * .08; ctx.beginPath(); ctx.arc(0, 0, r * 1.16, 0, 7); ctx.stroke(); ctx.restore();
}

// ---------- 3D pieces ----------
// translucent stack of model layers, front face at (x,y,w,h), depth offset (dx,dy). lit(i,j) -> [rgb, a] for cell j of layer i
export function layerCube(ctx, T, x, y, w, h, { n = 28, dx = 70, dy = -50, cells = 14, lit = null, a = 1, tint = '120,130,160' } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  const ph = h / n;
  // back + side faces
  ctx.fillStyle = 'rgba(30,34,44,.55)'; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + dx, y + dy); ctx.lineTo(x + w + dx, y + h + dy); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(70,78,96,.55)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.lineTo(x + w + dx, y + dy); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  for (let i = 0; i < n; i++) {
    const yy = y + i * ph;
    ctx.fillStyle = `rgba(${tint},${.10 + .05 * (i % 2)})`; ctx.fillRect(x, yy, w, ph - 1.5);
    ctx.strokeStyle = 'rgba(200,210,235,.10)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + w, yy); ctx.lineTo(x + w + dx, yy + dy); ctx.stroke();
    if (lit) for (let j = 0; j < cells; j++) {
      const [rgb, la] = lit(i, j); if (la <= .02) continue;
      const cw = w / cells; ctx.fillStyle = `rgba(${rgb},${la})`; rr(ctx, x + j * cw + 2, yy + 1, cw - 4, ph - 3.5, 2); ctx.fill();
    }
  }
  const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(.5, 'rgba(255,255,255,.02)'); g.addColorStop(1, 'rgba(255,255,255,.06)');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(210,220,245,.35)'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.lineTo(x + w + dx, y + dy); ctx.lineTo(x + w + dx, y + h + dy); ctx.lineTo(x + w, y + h); ctx.moveTo(x + w, y); ctx.lineTo(x + w + dx, y + dy); ctx.stroke();
  ctx.restore();
}
// coral 3D "Claude" API box (CRT-like); screen(ctx, sx, sy, sw, sh) draws inside the screen
export function apiBox(ctx, T, cx, cy, w, h, screen, { a = 1, d = 90, label = true } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  const x = cx - w / 2, y = cy - h / 2, dx = d * .8, dy = -d * .6;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 80; ctx.shadowOffsetY = 40; rr(ctx, x, y, w, h, 26); ctx.fillStyle = '#b5583c'; ctx.fill(); ctx.restore();
  // top + side faces
  ctx.fillStyle = '#e99a7d'; ctx.beginPath(); ctx.moveTo(x + 18, y); ctx.lineTo(x + 18 + dx, y + dy); ctx.lineTo(x + w + dx - 8, y + dy); ctx.lineTo(x + w - 8, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#a44e33'; ctx.beginPath(); ctx.moveTo(x + w, y + 14); ctx.lineTo(x + w + dx, y + dy + 14); ctx.lineTo(x + w + dx, y + h + dy - 20); ctx.lineTo(x + w, y + h - 16); ctx.closePath(); ctx.fill();
  const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#e38a6a'); g.addColorStop(1, '#cc6b4c'); rr(ctx, x, y, w, h, 26); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(255,220,200,.45)'; ctx.lineWidth = 2; ctx.stroke();
  const sx = x + 34, sy = y + 34, sw = w - 68, sh = h - 112;
  rr(ctx, sx - 4, sy - 4, sw + 8, sh + 8, 22); ctx.fillStyle = '#7d3622'; ctx.fill();
  rr(ctx, sx, sy, sw, sh, 18); ctx.fillStyle = '#060608'; ctx.fill();
  ctx.save(); rr(ctx, sx, sy, sw, sh, 18); ctx.clip(); screen(ctx, sx, sy, sw, sh);
  const sg = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh); const sp = ((T * .25) % 1.6) - .3;
  sg.addColorStop(clamp(sp - .08), 'rgba(255,255,255,0)'); sg.addColorStop(clamp(sp), 'rgba(255,255,255,.07)'); sg.addColorStop(clamp(sp + .08), 'rgba(255,255,255,0)');
  ctx.fillStyle = sg; ctx.fillRect(sx, sy, sw, sh); ctx.restore();
  if (label) { const lw = pill(ctx, sx + 14, sy + 30, '   Claude', { bg: '#1a1a1f', size: 22, align: 'left', padX: 14, h: 38 }); logo(ctx, 'claude', sx + 34, sy + 30, 22); }
  rr(ctx, cx - 120, y + h - 54, 150, 16, 8); ctx.fillStyle = '#5a2414'; ctx.fill();
  txt(ctx, 'API', cx + 80, y + h - 39, 22, '#3d1a10', 800);
  ctx.restore();
}
