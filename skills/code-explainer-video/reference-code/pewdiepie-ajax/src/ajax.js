// Drawing kit for the "PewDiePie's uncensored AI (Ajax / abliteration)" explainer. Pure functions of inputs + time T.
import { W, H, clamp, lerp, eo, eio, eback, hash, rr } from './lib.js';
import { img, IMG } from './assets.js';
export const F = (w, px) => `${w} ${px}px Inter, "Segoe UI", Arial`;
export const SERIF = (px, w = 400) => `italic ${w} ${px}px Georgia, "Times New Roman", serif`;
export const MONO = (px, w = 500) => `${w} ${px}px "Cascadia Mono", Consolas, monospace`;
export const COL = { red: '255,64,64', orange: '255,176,46', blue: '70,150,255', purple: '160,120,255', green: '52,211,153', pink: '255,120,180', yellow: '255,204,40' };
export function txt(ctx, s, x, y, font, col = '#111', align = 'center', base = 'alphabetic') { ctx.font = font; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y); }
export const fit = (ctx, s, font, maxW) => { ctx.font = font; return ctx.measureText(s).width > maxW; };

// ---------- backgrounds ----------
export function bgGrid(ctx, T, light = false) {
  ctx.fillStyle = light ? '#f4f4f2' : '#0f1012'; ctx.fillRect(-W, -H, W * 3, H * 3);
  const s = 54, o = (T * 5) % s;
  ctx.strokeStyle = light ? 'rgba(0,0,0,.045)' : 'rgba(255,255,255,.04)'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let x = -s + o; x <= W + s; x += s) { ctx.moveTo(x, -100); ctx.lineTo(x, H + 100); }
  for (let y = -s + o * .6; y <= H + s; y += s) { ctx.moveTo(-100, y); ctx.lineTo(W + 100, y); }
  ctx.stroke();
  const g = ctx.createRadialGradient(W / 2, H * .55, H * .2, W / 2, H * .55, H * .85);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, light ? 'rgba(0,0,0,.07)' : 'rgba(0,0,0,.55)'); ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
}
export function glow(ctx, x, y, r, rgb, a = 1) {
  if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${.55 * a})`); g.addColorStop(.4, `rgba(${rgb},${.18 * a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
// soft floating card
export function card(ctx, x, y, w, h, { light = true, r = 30, a = 1, fill, border = true, sh = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  ctx.shadowColor = light ? `rgba(20,25,40,${.16 * sh})` : `rgba(0,0,0,${.6 * sh})`; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
  rr(ctx, x, y, w, h, r); ctx.fillStyle = fill || (light ? '#ffffff' : '#18191d'); ctx.fill();
  ctx.shadowColor = 'transparent'; if (border) { ctx.strokeStyle = light ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.09)'; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.restore();
}
export function chip(ctx, x, y, s, { bg = '#eef3ff', fg = '#2457d6', size = 22, w = 700, border = null, align = 'left', mono = false } = {}) {
  ctx.font = mono ? MONO(size, w) : F(w, size); const tw = ctx.measureText(s).width, ph = size * .5, bw = tw + ph * 2.4, bh = size * 1.75;
  const x0 = align === 'center' ? x - bw / 2 : x; rr(ctx, x0, y - bh / 2, bw, bh, bh / 2); ctx.fillStyle = bg; ctx.fill();
  if (border) { ctx.strokeStyle = border; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.fillStyle = fg; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, x0 + ph * 1.2, y + 1); ctx.textBaseline = 'alphabetic'; return bw;
}

// ---------- Ajax emblem (vector redraw of the hexagon mark) ----------
const hexV = (R, k) => { const a = (-90 + 60 * k) * Math.PI / 180; return [R * Math.cos(a), R * Math.sin(a)]; };
const hexP = (R, s) => { const k = Math.floor(s), u = s - k, a = hexV(R, k), b = hexV(R, k + 1); return [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]; };
const PIECES = [[5.1, 6.92], [1.08, 2.18], [2.4, 4.92]]; // roof, right side, left+bottom
function ringPiece(ctx, s0, s1, R = 1, r = .66) {
  const pts = [hexP(R, s0)]; for (let k = Math.ceil(s0); k < s1; k++) pts.push(hexV(R, k)); pts.push(hexP(R, s1));
  const inn = [hexP(r, s0)]; for (let k = Math.ceil(s0); k < s1; k++) inn.push(hexV(r, k)); inn.push(hexP(r, s1));
  ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); inn.reverse().forEach(p => ctx.lineTo(p[0], p[1])); ctx.closePath();
}
function corePiece(ctx) {
  ctx.beginPath(); for (let k = 0; k < 6; k++) { const p = hexV(.5, k); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.closePath();
  const A = [[0, -.3], [.27, .21], [.08, .21], [0, .07], [-.08, .21], [-.27, .21]]; A.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
}
// explode 0..1 pushes the pieces apart in 3D-ish; depth = extrusion thickness (in units of size)
export function ajaxMark(ctx, x, y, size, { col = '#141414', side = '#3a3a3e', explode = 0, depth = 0, T = 0, spin = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(spin); ctx.scale(size / 2, size / 2);
  const parts = [...PIECES.map((p, i) => ({ i, draw: () => ringPiece(ctx, p[0], p[1]), mid: (p[0] + p[1]) / 2 })), { i: 3, draw: () => corePiece(ctx), mid: null }];
  for (const pc of parts) {
    ctx.save();
    if (explode > 0) {
      const d = pc.mid === null ? [0, 0] : hexP(1, pc.mid % 6), r = explode * (pc.mid === null ? 0 : 1.15);
      ctx.translate(d[0] * r + Math.sin(T * 1.3 + pc.i) * .05 * explode, d[1] * r + Math.cos(T * 1.1 + pc.i) * .05 * explode);
      ctx.rotate(explode * (pc.i - 1.5) * .35);
      if (pc.mid === null) ctx.scale(1 - .25 * explode, 1 - .25 * explode);
    }
    const dz = depth + explode * .18;
    if (dz > 0) { for (let k = 6; k >= 1; k--) { ctx.save(); ctx.translate(dz * k / 6 * .55, dz * k / 6); pc.draw(); ctx.fillStyle = side; ctx.fill('evenodd'); ctx.restore(); } }
    pc.draw(); ctx.fillStyle = col; ctx.fill('evenodd');
    ctx.restore();
  }
  ctx.restore();
}
export function ajaxWord(ctx, x, y, px, col = '#141414', align = 'left') { txt(ctx, 'Ajax', x, y, SERIF(px), col, align); }

// ---------- laptop (front view, dark MacBook) ----------
export function laptop(ctx, x, y, w, screenFn, { a = 1 } = {}) {
  const h = w * .64; if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  const g0 = ctx.createRadialGradient(x, y + h / 2 + w * .12, 5, x, y + h / 2 + w * .12, w * .7); g0.addColorStop(0, 'rgba(0,0,0,.28)'); g0.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); ctx.translate(x, y + h / 2 + w * .12); ctx.scale(1, .12); ctx.translate(-x, -(y + h / 2 + w * .12)); ctx.fillStyle = g0; ctx.fillRect(x - w, y + h / 2 + w * .12 - w, w * 2, w * 2); ctx.restore();
  rr(ctx, x - w / 2, y - h / 2, w, h, w * .03); ctx.fillStyle = '#0c0c0d'; ctx.fill(); ctx.strokeStyle = '#3b3c40'; ctx.lineWidth = 3; ctx.stroke();
  const m = w * .028, sw = w - 2 * m, sh = h - 2 * m;
  ctx.save(); rr(ctx, x - sw / 2, y - sh / 2, sw, sh, w * .012); ctx.clip(); ctx.translate(x - sw / 2, y - sh / 2); screenFn(ctx, sw, sh); ctx.restore();
  rr(ctx, x - w * .06, y - h / 2 + 2, w * .12, m * 1.1, 8); ctx.fillStyle = '#0c0c0d'; ctx.fill();
  // base seen slightly from above
  const by = y + h / 2, bd = w * .11;
  ctx.beginPath(); ctx.moveTo(x - w / 2 - 6, by); ctx.lineTo(x + w / 2 + 6, by); ctx.lineTo(x + w / 2 + w * .07, by + bd); ctx.lineTo(x - w / 2 - w * .07, by + bd); ctx.closePath();
  let g = ctx.createLinearGradient(0, by, 0, by + bd); g.addColorStop(0, '#2a2b2f'); g.addColorStop(1, '#1a1b1e'); ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = '#0d0d0f';
  for (let r = 0; r < 4; r++) { const v = (r + .5) / 4.6, yy = by + bd * (.1 + v * .78), ww = lerp(w * .92, w * 1.0, v), n = 14, kw = ww / n;
    for (let k = 0; k < n; k++) { rr(ctx, x - ww / 2 + k * kw + 2, yy, kw - 4, bd * .14, 3); ctx.fill(); } }
  rr(ctx, x - w / 2 - w * .075, by + bd - 2, w * 1.15, w * .022, 8); ctx.fillStyle = '#2f3034'; ctx.fill();
  ctx.restore(); return { w, h, sw, sh };
}
// Ajax website on the laptop screen
export function ajaxSite(ctx, w, h, T, markA = 1) {
  ctx.fillStyle = '#f6f3ec'; ctx.fillRect(0, 0, w, h);
  txt(ctx, 'Odysseus ↗', w * .05, h * .08, SERIF(h * .045), '#333', 'left');
  ctx.save(); ctx.globalAlpha *= markA; ajaxMark(ctx, w * .33, h * .38, h * .2, { T }); ajaxWord(ctx, w * .41, h * .44, h * .17); ctx.restore();
  txt(ctx, "I've decided to release Ajax when it's ready", w / 2, h * .62, SERIF(h * .045), '#444');
  txt(ctx, 'instead of putting a timer.', w / 2, h * .69, SERIF(h * .045), '#444');
  txt(ctx, '— Felix', w / 2, h * .8, SERIF(h * .036), '#888');
}

// ---------- notifications / cards ----------
export function notif(ctx, x, y, w, { title = 'OpenAI', body = '', time = 'now', a = 1, logo = 'openai_black' } = {}) {
  if (a <= 0) return; const h = 128; ctx.save(); ctx.globalAlpha *= a;
  ctx.shadowColor = 'rgba(0,0,0,.22)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18; rr(ctx, x - w / 2, y - h / 2, w, h, 32); ctx.fillStyle = 'rgba(250,250,252,.97)'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(0,0,0,.06)'; ctx.lineWidth = 2; ctx.stroke();
  rr(ctx, x - w / 2 + 24, y - 34, 68, 68, 16); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.1)'; ctx.stroke(); img(ctx, logo, x - w / 2 + 58, y, 50);
  txt(ctx, title, x - w / 2 + 112, y - 10, F(800, 28), '#111', 'left'); txt(ctx, time, x + w / 2 - 28, y - 10, F(500, 22), '#8a8d94', 'right');
  txt(ctx, body, x - w / 2 + 112, y + 28, F(500, 25), '#2a2c31', 'left');
  ctx.restore();
}
export function ytCard(ctx, x, y, w, a = 1) {
  if (a <= 0) return; const h = 132; card(ctx, x - w / 2, y - h / 2, w, h, { r: 26, a });
  ctx.save(); ctx.globalAlpha *= a; rr(ctx, x - w / 2 + 30, y - 22, 62, 44, 12); ctx.fillStyle = '#ff0000'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x - w / 2 + 54, y - 11); ctx.lineTo(x - w / 2 + 72, y); ctx.lineTo(x - w / 2 + 54, y + 11); ctx.fill();
  txt(ctx, 'I seriously should NOT be dropping this.', x - w / 2 + 116, y - 6, F(800, 28), '#111', 'left');
  txt(ctx, 'PewDiePie · 109M subscribers · Sep 30', x - w / 2 + 116, y + 32, F(500, 23), '#70737a', 'left'); ctx.restore();
}
// chat input bar (dark). text is drawn mono; caret blinks
export function chatBar(ctx, x, y, w, text, T, { a = 1, caret = true, light = false, send = 0, icon = 'qwen' } = {}) {
  if (a <= 0) return; const h = 104; ctx.save(); ctx.globalAlpha *= a;
  ctx.shadowColor = light ? 'rgba(0,0,0,.15)' : 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
  rr(ctx, x - w / 2, y - h / 2, w, h, h / 2); ctx.fillStyle = light ? '#fff' : '#1b1c20'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = light ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.stroke();
  if (icon === 'qwen') img(ctx, 'qwen', x - w / 2 + 56, y, 44); else ajaxMark(ctx, x - w / 2 + 56, y, 40, { col: light ? '#141414' : '#eee', side: light ? '#555' : '#888' });
  txt(ctx, text, x - w / 2 + 96, y + 11, MONO(32, 500), light ? '#16181d' : '#eef0f4', 'left');
  if (caret && Math.floor(T * 2.4) % 2 === 0) { ctx.font = MONO(32, 500); const cw = ctx.measureText(text).width; ctx.fillStyle = light ? '#16181d' : '#fff'; ctx.fillRect(x - w / 2 + 98 + cw, y - 20, 3, 40); }
  const bx = x + w / 2 - 54; ctx.fillStyle = light ? '#111' : '#fff'; ctx.beginPath(); ctx.arc(bx, y, 32 * (1 - .15 * send), 0, 7); ctx.fill();
  ctx.strokeStyle = light ? '#fff' : '#111'; ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx, y + 14); ctx.lineTo(bx, y - 13); ctx.moveTo(bx - 11, y - 3); ctx.lineTo(bx, y - 14); ctx.lineTo(bx + 11, y - 3); ctx.stroke();
  ctx.restore();
}
// chat reply bubble
export function bubble(ctx, x, y, lines, { a = 1, dark = true, icon = null, maxW = 520, size = 26, align = 'left', fg, bg, bold = false } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = F(bold ? 700 : 600, size);
  const L = Array.isArray(lines) ? lines : [lines], tw = Math.min(maxW, Math.max(...L.map(l => ctx.measureText(l).width))), ix = icon ? size * 1.5 : 0;
  const bw = tw + 44 + ix, bh = L.length * size * 1.35 + 30, x0 = align === 'center' ? x - bw / 2 : align === 'right' ? x - bw : x;
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  rr(ctx, x0, y - bh / 2, bw, bh, 20); ctx.fillStyle = bg || (dark ? 'rgba(32,33,38,.96)' : '#fff'); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = dark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.08)'; ctx.lineWidth = 2; ctx.stroke();
  if (icon) icon(x0 + 22 + size * .5, y - bh / 2 + 15 + size * .62);
  L.forEach((l, i) => txt(ctx, l, x0 + 22 + ix, y - bh / 2 + 15 + size * (1.02 + i * 1.35), F(bold ? 700 : 600, size), fg || (dark ? '#eef0f4' : '#16181d'), 'left'));
  ctx.restore(); return { x0, bw, bh };
}
export function lockIcon(ctx, x, y, s, col = '#ff5a5a') { ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = s * .16; ctx.beginPath(); ctx.arc(x, y - s * .15, s * .28, Math.PI, 0); ctx.stroke(); rr(ctx, x - s * .42, y - s * .15, s * .84, s * .62, s * .1); ctx.fill(); ctx.restore(); }
export function noSign(ctx, x, y, r, a = 1, T = 0) { // red neon "prohibited" sign
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.globalCompositeOperation = 'lighter';
  glow(ctx, x, y, r * 2.4, COL.red, .9 + .1 * Math.sin(T * 9));
  ctx.lineCap = 'round';
  for (const [lw, al] of [[r * .5, .18], [r * .3, .35], [r * .15, 1]]) {
    ctx.strokeStyle = `rgba(255,${al > .9 ? 120 : 60},${al > .9 ? 110 : 60},${al})`; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - r * .7, y - r * .7); ctx.lineTo(x + r * .7, y + r * .7); ctx.stroke();
  }
  ctx.restore();
}

// ---------- Hugging Face model card ----------
function hfHeader(ctx, x, y, w) {
  txt(ctx, '🤗', x + 30, y + 52, F(400, 34), '#000', 'left'); txt(ctx, 'Hugging Face', x + 80, y + 50, F(800, 28), '#111', 'left');
  rr(ctx, x + 300, y + 22, w - 330, 44, 22); ctx.fillStyle = '#f3f4f6'; ctx.fill(); txt(ctx, 'Search models, datasets, users…', x + 322, y + 51, F(500, 20), '#9aa0a8', 'left');
  ctx.fillStyle = '#eceef1'; ctx.fillRect(x, y + 88, w, 2);
}
export function hfCard(ctx, x, y, w, T, { tab = 0, lic = 0, files = 0, a = 1 } = {}) {
  const h = 640; card(ctx, x, y, w, h, { r: 28, a }); if (a <= 0) return h; ctx.save(); ctx.globalAlpha *= a;
  ctx.save(); rr(ctx, x, y, w, h, 28); ctx.clip();
  hfHeader(ctx, x, y, w);
  img(ctx, 'qwen', x + 48, y + 146, 34); txt(ctx, 'Qwen /', x + 76, y + 156, F(500, 32), '#6b7280', 'left'); txt(ctx, 'Qwen3.5-9B', x + 190, y + 156, F(800, 32), '#111', 'left');
  chip(ctx, x + w - 170, y + 145, '♡ Like 2.09k', { bg: '#f5f6f8', fg: '#444', size: 19, w: 600, border: '#e3e5e8' });
  let cx = x + 30; ['Transformers', 'Safetensors'].forEach(t => { cx += chip(ctx, cx, y + 214, t, { bg: '#f5f6f8', fg: '#444', size: 20, w: 600 }) + 12; });
  ctx.save(); const lw = chip(ctx, cx, y + 214, 'License: apache-2.0', { bg: lic > 0 ? `rgba(70,120,255,${.12 + .1 * lic})` : '#f5f6f8', fg: lic > 0 ? '#2a5bd7' : '#444', size: 20, w: 700, border: lic > 0 ? `rgba(70,120,255,${lic})` : null }); ctx.restore();
  // tabs
  const ty = y + 290, tabs = ['Model card', 'Files and versions', 'Community 68'], tx = [x + 30, x + 200, x + 460];
  tabs.forEach((t, i) => txt(ctx, t, tx[i], ty, F(i === Math.round(tab) ? 800 : 500, 23), i === Math.round(tab) ? '#111' : '#6b7280', 'left'));
  ctx.font = F(800, 23); const ul0 = [tx[0], ctx.measureText(tabs[0]).width], ul1 = [tx[1], ctx.measureText(tabs[1]).width];
  ctx.fillStyle = '#111'; ctx.fillRect(lerp(ul0[0], ul1[0], tab), ty + 14, lerp(ul0[1], ul1[1], tab), 4); ctx.fillStyle = '#eceef1'; ctx.fillRect(x, ty + 18, w, 2);
  if (tab < .5) {
    ctx.globalAlpha *= 1 - tab * 2;
    txt(ctx, 'Qwen3.5-9B', x + 30, ty + 80, F(800, 30), '#111', 'left');
    rr(ctx, x + 30, ty + 110, w - 60, 150, 14); ctx.fillStyle = '#eef4ff'; ctx.fill();
    ['This repository contains model weights and', 'configuration files for the post-trained model', 'in the Hugging Face Transformers format.'].forEach((l, i) => txt(ctx, l, x + 52, ty + 160 + i * 36, F(500, 23), '#1d4ed8', 'left'));
  } else {
    ctx.globalAlpha *= (tab - .5) * 2;
    const rows = [['model-00001-of-00004.safetensors', '5.28 GB'], ['model-00002-of-00004.safetensors', '5.34 GB'], ['model-00003-of-00004.safetensors', '5.37 GB'], ['model-00004-of-00004.safetensors', '3.33 GB'], ['config.json', '3 kB'], ['tokenizer.json', '12.8 MB']];
    rows.forEach((r, i) => { const yy = ty + 66 + i * 50, gone = clamp(files * 6 - i); ctx.save(); ctx.globalAlpha *= 1 - .65 * gone;
      txt(ctx, '📄', x + 34, yy + 8, F(400, 22), '#000', 'left'); txt(ctx, r[0], x + 72, yy + 8, MONO(20, 500), '#222', 'left'); txt(ctx, r[1] + '  ⤓', x + w - 30, yy + 8, F(600, 20), '#555', 'right');
      ctx.fillStyle = '#f0f1f3'; ctx.fillRect(x + 30, yy + 26, w - 60, 1.5); ctx.restore(); });
  }
  ctx.restore(); ctx.restore(); return h;
}
export function fileIcon(ctx, x, y, s, rot = 0, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s / 100, s / 100);
  ctx.shadowColor = 'rgba(0,0,0,.2)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  ctx.beginPath(); ctx.moveTo(-38, -50); ctx.lineTo(18, -50); ctx.lineTo(38, -30); ctx.lineTo(38, 50); ctx.lineTo(-38, 50); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#c9ccd2'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#4b7bec';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) ctx.fillRect(-26 + c * 18, -20 + r * 14, 14, 10);
  ctx.restore();
}
export function folder(ctx, x, y, s, gb, a = 1, pulse = 0) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s / 100 * (1 + .08 * pulse), s / 100 * (1 + .08 * pulse));
  ctx.shadowColor = 'rgba(30,90,200,.3)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  rr(ctx, -60, -42, 50, 20, 6); ctx.fillStyle = '#5aa9f5'; ctx.fill(); rr(ctx, -60, -32, 120, 80, 10); ctx.fillStyle = '#6bb8ff'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 22); ctx.moveTo(-14, 8); ctx.lineTo(0, 22); ctx.lineTo(14, 8); ctx.stroke();
  ctx.restore(); txt(ctx, 'Downloads', x + s * .75, y - 4, F(800, 30), '#111', 'left'); txt(ctx, gb.toFixed(1) + ' GB', x + s * .75, y + 32, F(600, 26), '#2f7de1', 'left');
}

// ---------- city map texture (generated once) ----------
let MAP = null;
export function mapTex() {
  if (MAP) return MAP; const S = 900, c = new OffscreenCanvas(S, S), g = c.getContext('2d');
  g.fillStyle = '#efe9da'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(160,205,140,.55)'; const x = hash(i, 3) * S, y = hash(i, 4) * S; g.beginPath(); g.ellipse(x, y, 30 + 60 * hash(i, 5), 20 + 40 * hash(i, 6), hash(i, 7) * 3, 0, 7); g.fill(); }
  g.strokeStyle = '#ffffff'; g.lineCap = 'round';
  for (let i = 0; i < 46; i++) { const v = i % 2, p = hash(i, 1) * S, a = hash(i, 2) * .5 - .25; g.lineWidth = 3 + 4 * hash(i, 8); g.beginPath();
    if (v) { g.moveTo(p, 0); g.lineTo(p + a * S, S); } else { g.moveTo(0, p); g.lineTo(S, p + a * S); } g.stroke(); }
  g.strokeStyle = '#f5c46b'; g.lineWidth = 9; [[0, 300, S, 520], [180, 0, 520, S], [0, 760, S, 690]].forEach(([a, b, c2, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c2, d); g.stroke(); });
  g.strokeStyle = '#d8d2c2'; g.lineWidth = 1; for (let i = 0; i < 160; i++) { const x = hash(i, 11) * S, y = hash(i, 12) * S; g.strokeRect(x, y, 14 + 20 * hash(i, 13), 10 + 16 * hash(i, 14)); }
  g.strokeStyle = '#9cc3ee'; g.lineWidth = 46; g.beginPath(); g.moveTo(640, -20); g.bezierCurveTo(400, 200, 760, 360, 520, 520); g.bezierCurveTo(300, 680, 420, 820, 160, 930); g.stroke();
  g.strokeStyle = '#86b3e3'; g.lineWidth = 4; g.stroke();
  return MAP = c;
}
// draw an image onto a projected quad via subdivided affine triangles. q(u,v) -> [x,y] screen
export function texQuad(ctx, im, q, n = 10, a = 1) {
  const iw = im.width, ih = im.height; ctx.save(); ctx.globalAlpha *= a;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const u0 = i / n, u1 = (i + 1) / n, v0 = j / n, v1 = (j + 1) / n;
    tri(ctx, im, q(u0, v0), q(u1, v0), q(u0, v1), [u0 * iw, v0 * ih], [u1 * iw, v0 * ih], [u0 * iw, v1 * ih]);
    tri(ctx, im, q(u1, v1), q(u0, v1), q(u1, v0), [u1 * iw, v1 * ih], [u0 * iw, v1 * ih], [u1 * iw, v0 * ih]);
  }
  ctx.restore();
}
function tri(ctx, im, p0, p1, p2, t0, t1, t2) {
  if (!p0 || !p1 || !p2) return;
  const cx = (p0[0] + p1[0] + p2[0]) / 3, cy = (p0[1] + p1[1] + p2[1]) / 3, ex = p => [p[0] + (p[0] - cx) * .04, p[1] + (p[1] - cy) * .04];
  const [a, b, c] = [ex(p0), ex(p1), ex(p2)];
  ctx.save(); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.clip();
  const d = (t1[0] - t0[0]) * (t2[1] - t0[1]) - (t2[0] - t0[0]) * (t1[1] - t0[1]);
  const m11 = ((p1[0] - p0[0]) * (t2[1] - t0[1]) - (p2[0] - p0[0]) * (t1[1] - t0[1])) / d, m12 = ((p1[1] - p0[1]) * (t2[1] - t0[1]) - (p2[1] - p0[1]) * (t1[1] - t0[1])) / d;
  const m21 = ((p2[0] - p0[0]) * (t1[0] - t0[0]) - (p1[0] - p0[0]) * (t2[0] - t0[0])) / d, m22 = ((p2[1] - p0[1]) * (t1[0] - t0[0]) - (p1[1] - p0[1]) * (t2[0] - t0[0])) / d;
  ctx.transform(m11, m12, m21, m22, p0[0] - m11 * t0[0] - m21 * t0[1], p0[1] - m12 * t0[0] - m22 * t0[1]);
  ctx.drawImage(im, 0, 0); ctx.restore();
}
export function pin(ctx, x, y, s = 1, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 14; ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-8, -18, -22, -26, -22, -44); ctx.arc(0, -44, 22, Math.PI, 0); ctx.bezierCurveTo(22, -26, 8, -18, 0, 0); ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, -44, 8, 0, 7); ctx.fill(); ctx.restore();
}

// ---------- 3D meaning map: clusters of requests ----------
export const CL = [
  { k: 'cooking', rgb: COL.orange, c: [-1.7, -.7, .35], emo: '🍳', q: ['Best carbonara recipe?', 'Easy pasta for two?', 'How long to boil an egg?'] },
  { k: 'coding', rgb: COL.blue, c: [1.6, -.4, .45], emo: '💻', q: ['Center a div in CSS?', 'Fix my Python loop', "Why won't my app build?"] },
  { k: 'music', rgb: COL.purple, c: [-.3, 1.4, .25], emo: '🎵', q: ['Best jazz albums', 'Read sheet music'] },
  { k: 'travel', rgb: COL.green, c: [.3, -1.5, .7], emo: '✈️', q: ['Cheap flights to Rome?', '3 days in Tokyo'] },
  { k: 'math', rgb: COL.pink, c: [1.4, 1.2, .95], emo: '➗', q: ['What is 15% of 80?', 'Solve 2x + 3 = 11'] },
  { k: 'refused', rgb: COL.red, c: [.1, .2, 2.7], emo: '🔒', q: ['How to make a…', 'Write malware that…', 'Pick a lock on…'] },
];
export const PTS = []; // {ci, b:[x,y,z] clustered, s:[x,y,z] scattered}
CL.forEach((cl, ci) => { for (let i = 0; i < 26; i++) {
  const r = .45 * Math.pow(hash(i, ci + 20), .7), a = hash(i, ci + 30) * 6.283, e = (hash(i, ci + 40) - .5) * 2.4;
  PTS.push({ ci, i, b: [cl.c[0] + r * Math.cos(a) * Math.cos(e), cl.c[1] + r * Math.sin(a) * Math.cos(e), cl.c[2] + r * .7 * Math.sin(e)],
    s: [(hash(i, ci + 50) - .5) * 4.4, (hash(i, ci + 60) - .5) * 4.4, .2 + hash(i, ci + 70) * 2.6] });
} });
export const centroid = ci => CL[ci].c;
export function axes3(ctx, P, a = 1, { len = 2.6, floor = 1, light = false } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; const o = P(-2.4, -2.4, 0);
  if (floor > 0) { ctx.strokeStyle = `rgba(255,255,255,${.06 * floor})`; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let k = -2.4; k <= 2.41; k += .6) { const p1 = P(k, -2.4, 0), p2 = P(k, 2.4, 0), p3 = P(-2.4, k, 0), p4 = P(2.4, k, 0); if (p1 && p2) { ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); } if (p3 && p4) { ctx.moveTo(p3[0], p3[1]); ctx.lineTo(p4[0], p4[1]); } } ctx.stroke(); }
  ctx.strokeStyle = 'rgba(220,226,236,.5)'; ctx.lineWidth = 2.5;
  [[2.4, -2.4, 0], [-2.4, 2.4, 0], [-2.4, -2.4, 3.6]].forEach(e => { const q = P(...e); if (o && q) { ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); } });
  ctx.restore();
}
// glowing dot
export function dot(ctx, x, y, r, rgb, a = 1, hot = 0) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.6); g.addColorStop(0, `rgba(${rgb},.55)`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, 7); ctx.fill();
  const g2 = ctx.createRadialGradient(x - r * .3, y - r * .3, 0, x, y, r); g2.addColorStop(0, `rgba(255,255,255,${.75 + .25 * hot})`); g2.addColorStop(.35, `rgba(${rgb},1)`); g2.addColorStop(1, `rgba(${rgb},.85)`);
  ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore();
}
// pos(pt) -> [x,y,z]; vis(pt) -> alpha; returns projected list (for labels)
export function cloud(ctx, T, P, pos, vis = () => 1, { size = 1, drops = 0, dropsZ = 0 } = {}) {
  const items = [];
  for (const pt of PTS) { const a = vis(pt); if (a <= 0) continue; const w = pos(pt); w[0] += .04 * Math.sin(T * 1.1 + pt.i + pt.ci); w[1] += .04 * Math.cos(T * .9 + pt.i * 2); w[2] += .03 * Math.sin(T * 1.3 + pt.i * 3);
    const q = P(...w); if (q) items.push({ pt, w, q, a }); }
  items.sort((m, n) => n.q[2] - m.q[2]);
  if (drops > 0) { ctx.save(); ctx.setLineDash([3, 5]); for (const it of items) { const f = P(it.w[0], it.w[1], dropsZ); if (!f) continue; ctx.strokeStyle = `rgba(${CL[it.pt.ci].rgb},${.4 * drops * it.a})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(it.q[0], it.q[1]); ctx.lineTo(f[0], f[1]); ctx.stroke(); ctx.fillStyle = `rgba(${CL[it.pt.ci].rgb},${.5 * drops * it.a})`; ctx.beginPath(); ctx.arc(f[0], f[1], 2.5, 0, 7); ctx.fill(); } ctx.restore(); }
  for (const it of items) dot(ctx, it.q[0], it.q[1], clamp(1500 / it.q[2] * .062 * size, 5, 26), CL[it.pt.ci].rgb, it.a);
  return items;
}
export function arrow3(ctx, a, b, rgb, w = 6, k = 1, head = 22) { // screen-space arrow a->b, drawn k of the way
  if (!a || !b || k <= 0) return; const x = lerp(a[0], b[0], k), y = lerp(a[1], b[1], k), an = Math.atan2(y - a[1], x - a[0]);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${rgb},.25)`; ctx.lineWidth = w * 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(x, y); ctx.stroke(); ctx.restore();
  ctx.strokeStyle = `rgb(${rgb})`; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(x - Math.cos(an) * head * .6, y - Math.sin(an) * head * .6); ctx.stroke();
  ctx.fillStyle = `rgb(${rgb})`; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(an - .45) * head, y - Math.sin(an - .45) * head); ctx.lineTo(x - Math.cos(an + .45) * head, y - Math.sin(an + .45) * head); ctx.fill();
}
export function tag(ctx, x, y, s, rgb, a = 1, size = 24) { // small dark label with coloured dot
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = F(700, size); const tw = ctx.measureText(s).width;
  rr(ctx, x - tw / 2 - 30, y - size * .95, tw + 52, size * 1.9, size * .95); ctx.fillStyle = 'rgba(20,21,25,.92)'; ctx.fill(); ctx.strokeStyle = `rgba(${rgb},.7)`; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = `rgb(${rgb})`; ctx.beginPath(); ctx.arc(x - tw / 2 - 12, y, 6, 0, 7); ctx.fill(); txt(ctx, s, x - tw / 2 + 2, y + size * .36, F(700, size), '#fff', 'left'); ctx.restore();
}
// glass plate (a parallelogram in 3D at height z)
export function plate(ctx, P, z, a = 1, ext = 2.6) {
  if (a <= 0) return; const q = [P(-ext, -ext, z), P(ext, -ext, z), P(ext, ext, z), P(-ext, ext, z)]; if (q.some(v => !v)) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); q.forEach((v, i) => i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1])); ctx.closePath();
  const g = ctx.createLinearGradient(q[0][0], q[0][1], q[2][0], q[2][1]); g.addColorStop(0, 'rgba(190,230,255,.22)'); g.addColorStop(.5, 'rgba(140,200,240,.08)'); g.addColorStop(1, 'rgba(190,230,255,.2)');
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(210,240,255,.7)'; ctx.lineWidth = 3; ctx.stroke();
  const t = [P(-ext, -ext, z - .12), P(ext, -ext, z - .12)]; if (t[0] && t[1]) { ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(t[0][0], t[0][1]); ctx.lineTo(t[1][0], t[1][1]); ctx.lineTo(q[1][0], q[1][1]); ctx.fillStyle = 'rgba(170,220,250,.18)'; ctx.fill(); }
  ctx.restore();
}

// ---------- arXiv paper ----------
export function arxivCard(ctx, x, y, w, { hiDate = 0, hiDir = 0, a = 1 } = {}) {
  const h = 640; card(ctx, x, y, w, h, { r: 18, a }); if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.save(); rr(ctx, x, y, w, h, 18); ctx.clip();
  ctx.fillStyle = '#b31b1b'; ctx.fillRect(x, y, w, 74); txt(ctx, 'arXiv', x + 30, y + 50, SERIF(36, 700), '#fff', 'left');
  ['Search', 'Submit', 'Donate', 'Log in'].forEach((t, i) => txt(ctx, t, x + w - 330 + i * 82, y + 46, F(600, 19), '#fff', 'left'));
  ctx.fillStyle = '#f2f2f2'; ctx.fillRect(x, y + 74, w, 44); txt(ctx, 'Computer Science > Machine Learning', x + 30, y + 104, F(700, 20), '#333', 'left');
  ctx.font = SERIF(25); const pre = '[Submitted on ', dt = '17 Jun 2024', pw = ctx.measureText(pre).width, dw = ctx.measureText(dt).width;
  if (hiDate > 0) { ctx.fillStyle = 'rgba(70,120,255,.22)'; ctx.fillRect(x + 30 + pw - 4, y + 148, (dw + 8) * hiDate, 36); ctx.strokeStyle = `rgba(70,120,255,${hiDate})`; ctx.lineWidth = 2; ctx.strokeRect(x + 30 + pw - 4, y + 148, (dw + 8) * hiDate, 36); }
  txt(ctx, pre + dt + ' (v1), last revised 30 Oct 2024]', x + 30, y + 174, SERIF(25), '#333', 'left');
  txt(ctx, 'Refusal in Language Models Is', x + 30, y + 240, F(800, 38), '#111', 'left');
  ctx.font = F(800, 38); const p2 = 'Mediated by a ', p2w = ctx.measureText(p2).width, sd = 'Single Direction', sdw = ctx.measureText(sd).width;
  if (hiDir > 0) { ctx.fillStyle = 'rgba(70,120,255,.22)'; ctx.fillRect(x + 26 + p2w, y + 254, (sdw + 8) * hiDir, 50); ctx.strokeStyle = `rgba(70,120,255,${hiDir})`; ctx.lineWidth = 2.5; ctx.strokeRect(x + 26 + p2w, y + 254, (sdw + 8) * hiDir, 50); }
  txt(ctx, p2 + sd, x + 30, y + 292, F(800, 38), '#111', 'left');
  txt(ctx, 'Andy Arditi, Oscar Obeso, Aaquib Syed, Daniel Paleka,', x + 30, y + 342, F(500, 22), '#2b4fc7', 'left');
  txt(ctx, 'Nina Panickssery, Wes Gurnee, Neel Nanda', x + 30, y + 372, F(500, 22), '#2b4fc7', 'left');
  ['Conversational large language models are fine-tuned for both', 'instruction-following and safety, resulting in models that obey', 'benign requests but refuse harmful ones. While this refusal', 'behavior is widespread across chat models, its underlying', 'mechanisms remain poorly understood. In this work, we show that', 'refusal is mediated by a one-dimensional subspace…'].forEach((l, i) => txt(ctx, l, x + 30, y + 422 + i * 32, F(400, 21), '#444', 'left'));
  ctx.restore(); ctx.restore();
}

// ---------- weights table ----------
export function weights(ctx, x, y, w, T, { a = 1, edit = 0, light = false } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  txt(ctx, 'weights', x, y, F(800, 28), '#fff', 'left'); txt(ctx, 'Qwen3.5-9B', x + 122, y, MONO(20), '#777', 'left');
  for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
    const i = r * 7 + c, v0 = (hash(i, 7) - .5) * .09, ed = hash(i, 9) < .45 ? clamp(edit * 3 - hash(i, 3) * 2) : 0, v = v0 + ed * (hash(i, 8) - .5) * .05;
    const xx = x + c * (w / 7), yy = y + 48 + r * 42;
    if (ed > 0) { ctx.fillStyle = `rgba(255,64,64,${.25 * ed * (1 - .5 * clamp(edit * 3 - 2))})`; rr(ctx, xx - 6, yy - 26, w / 7 - 8, 36, 6); ctx.fill(); }
    txt(ctx, (v >= 0 ? '+' : '') + v.toFixed(4), xx, yy, MONO(21, ed > 0 ? 700 : 500), ed > 0 ? `rgb(255,${Math.round(lerp(220, 110, ed))},${Math.round(lerp(220, 110, ed))})` : 'rgba(225,228,235,.75)', 'left');
  }
  ctx.restore();
}

// ---------- GSM8K card ----------
export function gsmCard(ctx, x, y, w, T, { strike = 0, score = 70.9, delta = 0, a = 1 } = {}) {
  const h = 760; card(ctx, x, y, w, h, { r: 26, a, fill: '#fbfaf7' }); if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  txt(ctx, 'GSM8K', x + 40, y + 74, F(900, 42), '#111', 'left'); txt(ctx, 'math test', x + 200, y + 72, F(500, 24), '#666', 'left');
  chip(ctx, x + w - 190, y + 60, 'Yi-1.5-9B', { bg: '#efefef', fg: '#333', size: 20, mono: true });
  const Q = [['Janet’s ducks lay 16 eggs per day.', 'She eats three for breakfast every…', '18'], ['A robe takes 2 bolts of blue fiber', 'and half that much white fiber…', '3'], ['Josh decides to try flipping a', 'house. He buys a house for…', '70,000']];
  Q.forEach((q, i) => { const yy = y + 160 + i * 120, bad = i > 0 ? clamp(strike * 2 - (i - 1)) : 0;
    txt(ctx, (i + 1) + '.', x + 40, yy, F(600, 24), '#888', 'left'); txt(ctx, q[0], x + 76, yy, F(500, 24), '#222', 'left'); txt(ctx, q[1], x + 76, yy + 34, F(500, 24), '#666', 'left');
    const ax = x + w - 120; txt(ctx, q[2], ax, yy + 16, `italic 700 30px Georgia, serif`, bad > 0 ? '#c0392b' : '#1d4ed8', 'right');
    if (bad > 0) { ctx.font = 'italic 700 30px Georgia, serif'; const tw = ctx.measureText(q[2]).width; ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(ax - tw - 6, yy + 6); ctx.lineTo(ax - tw - 6 + (tw + 12) * bad, yy + 2); ctx.stroke(); }
    const mx = x + w - 70, my = yy + 6; ctx.lineWidth = 5; ctx.lineCap = 'round';
    if (bad > .5) { ctx.strokeStyle = '#d63a2f'; ctx.beginPath(); ctx.moveTo(mx - 14, my - 14); ctx.lineTo(mx + 14, my + 14); ctx.moveTo(mx + 14, my - 14); ctx.lineTo(mx - 14, my + 14); ctx.stroke(); }
    else { ctx.strokeStyle = '#1e9e5a'; ctx.beginPath(); ctx.moveTo(mx - 16, my); ctx.lineTo(mx - 4, my + 12); ctx.lineTo(mx + 18, my - 16); ctx.stroke(); }
    ctx.fillStyle = '#ecebe6'; ctx.fillRect(x + 40, yy + 62, w - 80, 2); });
  txt(ctx, 'score', x + 40, y + 560, F(600, 24), '#666', 'left');
  txt(ctx, score.toFixed(1) + '%', x + 40, y + 660, F(900, 96), delta < 0 ? '#b8242a' : '#111', 'left');
  if (delta < 0) { txt(ctx, 'was 70.9%', x + w - 44, y + 580, F(500, 22), '#b8242a', 'right'); txt(ctx, delta.toFixed(1), x + w - 44, y + 650, 'italic 800 64px Georgia, serif', '#b8242a', 'right'); txt(ctx, 'points', x + w - 44, y + 688, 'italic 600 22px Georgia, serif', '#b8242a', 'right'); }
  txt(ctx, 'arXiv 2512.13655 · after abliteration', x + 40, y + h - 30, MONO(18), '#999', 'left');
  ctx.restore();
}

// ---------- GitHub repo card ----------
export function flame(ctx, x, y, s) { const g = ctx.createLinearGradient(x, y - s / 2, x, y + s / 2); g.addColorStop(0, '#ffcf4a'); g.addColorStop(.5, '#ff6a1a'); g.addColorStop(1, '#8a1a0a');
  rr(ctx, x - s / 2, y - s / 2, s, s, s * .22); ctx.fillStyle = '#2a0d07'; ctx.fill(); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y - s * .38); ctx.bezierCurveTo(x + s * .35, y - s * .05, x + s * .3, y + s * .38, x, y + s * .38); ctx.bezierCurveTo(x - s * .3, y + s * .38, x - s * .32, y, x - s * .08, y - s * .12); ctx.bezierCurveTo(x - s * .05, y - s * .22, x, y - s * .3, x, y - s * .38); ctx.fill(); }
export function githubCard(ctx, x, y, w, { a = 1, full = 1, stars = '32.7k' } = {}) {
  const h = lerp(130, 470, full); card(ctx, x, y, w, h, { r: 22, a }); if (a <= 0) return h; ctx.save(); ctx.globalAlpha *= a; ctx.save(); rr(ctx, x, y, w, h, 22); ctx.clip();
  flame(ctx, x + 70, y + 66, 76); txt(ctx, '⧉ p-e-w / ', x + 128, y + 56, F(500, 28), '#2563eb', 'left'); ctx.font = F(500, 28); const ow = ctx.measureText('⧉ p-e-w / ').width;
  txt(ctx, 'heretic', x + 128 + ow, y + 56, F(800, 28), '#2563eb', 'left'); chip(ctx, x + 128 + ow + 112, y + 46, 'Public', { bg: '#fff', fg: '#666', size: 16, border: '#ddd' });
  chip(ctx, x + 128, y + 96, '☆ Star  ' + stars, { bg: '#f6f8fa', fg: '#333', size: 19, border: '#d8dde3' });
  if (full > .3) { ctx.globalAlpha *= clamp((full - .3) / .5);
    txt(ctx, 'About', x + 34, y + 176, F(800, 24), '#111', 'left'); txt(ctx, 'Fully automatic censorship removal for', x + 34, y + 216, F(500, 27), '#222', 'left'); txt(ctx, 'language models', x + 34, y + 252, F(500, 27), '#222', 'left');
    let cx = x + 34; ['abliteration', 'llm', 'transformer'].forEach(t => { cx += chip(ctx, cx, y + 300, t, { bg: '#ddf4ff', fg: '#0969da', size: 18 }) + 10; });
    ctx.fillStyle = '#fff3c4'; ctx.fillRect(x + 24, y + 336, w - 48, 40); txt(ctx, '⚖  AGPL-3.0 license', x + 36, y + 364, F(600, 22), '#333', 'left');
    txt(ctx, '☆  ' + stars + ' stars', x + 36, y + 408, F(600, 22), '#444', 'left'); txt(ctx, '⑂  3.7k forks', x + 36, y + 444, F(600, 22), '#444', 'left'); }
  ctx.restore(); ctx.restore(); return h;
}
// refusals vs damage scatter
export const EDITS = [[.18, .55], [.62, .78], [.85, .62], [.5, .4], [.35, .28], [.72, .3], [.28, .52], [.9, .35], [.45, .18], [.6, .14], [.3, .12], [.2, .2], [.75, .1], [.4, .07], [.55, .22], [.25, .06], [.16, .04]];
export function scatter(ctx, x, y, w, h, T, { n = 0, best = 0, a = 1, edit = 0 } = {}) {
  card(ctx, x, y, w, h, { light: false, r: 22, a }); if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  txt(ctx, "Heretic's own test", x + 30, y + 46, F(700, 22), '#cfd3da', 'left'); txt(ctx, 'Gemma 3 12B', x + 30, y + 74, MONO(18), '#777', 'left');
  const shown = Math.max(1, Math.floor(n)), last = EDITS[Math.min(shown, EDITS.length) - 1], ref = Math.round(lerp(97, 3, best) + (1 - best) * last[1] * 40);
  txt(ctx, 'edit #' + Math.max(1, Math.round(edit)), x + w - 90, y + 46, MONO(22, 700), '#fff', 'right');
  txt(ctx, `${best > .5 ? 3 : Math.max(4, Math.round(last[1] * 100))}/100 · ${(best > .5 ? .16 : last[0]).toFixed(2)}`, x + w - 90, y + 74, MONO(18), '#888', 'right');
  ctx.save(); ctx.translate(x + w - 50, y + 58); ctx.rotate(.2 * Math.sin(T * 6)); ctx.strokeStyle = '#ff4a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); ctx.stroke(); txt(ctx, '↑', 0, 10, F(900, 28), '#ff4a3a'); ctx.restore();
  const px = x + 90, py = y + 120, pw = w - 140, ph = h - 220, X = v => px + v * pw, Y = v => py + ph - v * ph;
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + ph); ctx.lineTo(px + pw, py + ph); ctx.stroke();
  ['0', '50', '100'].forEach((l, i) => txt(ctx, l, px - 14, Y(i / 2) + 7, MONO(16), '#777', 'right')); ['0.0', '0.5', '1.0'].forEach((l, i) => txt(ctx, l, X(i / 2), py + ph + 30, MONO(16), '#777'));
  txt(ctx, 'damage →', px + pw / 2, py + ph + 68, F(700, 22), '#ddd');
  ctx.save(); ctx.translate(x + 30, py + ph / 2); ctx.rotate(-Math.PI / 2); txt(ctx, 'refusals', 0, 0, F(700, 22), '#ddd'); ctx.restore();
  // original point
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X(0), Y(.97), 9, 0, 7); ctx.stroke(); txt(ctx, 'original', X(0) + 22, Y(.97) + 2, F(800, 22), '#fff', 'left'); txt(ctx, '97/100 refuse', X(0) + 22, Y(.97) + 30, MONO(18), '#bbb', 'left');
  for (let i = 0; i < Math.min(n, EDITS.length); i++) { const [d, r] = EDITS[i], k = clamp(n - i); dot(ctx, X(d), Y(r), 5 + 3 * (1 - k), '220,224,232', .5 + .5 * k); }
  // by hand
  ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(X(.96), Y(.05), 9, 0, 7); ctx.stroke(); txt(ctx, 'by hand', X(.96), Y(.05) - 48, F(700, 20), '#ddd', 'right'); txt(ctx, '1.04', X(.96), Y(.05) - 22, MONO(18), '#bbb', 'right');
  if (best > 0) { ctx.save(); ctx.globalAlpha *= best; ctx.strokeStyle = 'rgb(52,211,120)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(.16), Y(.03)); ctx.lineTo(X(.16) + (X(.96) - X(.16)) * best, Y(.05)); ctx.stroke();
    dot(ctx, X(.16), Y(.03), 11, '52,211,120', 1, 1); txt(ctx, 'Heretic', X(.16) - 4, Y(.03) - 52, F(800, 26), 'rgb(52,211,120)', 'left'); txt(ctx, '3/100 · 0.16', X(.16) + 104, Y(.03) - 52, MONO(20), '#ddd', 'left'); ctx.restore(); }
  ctx.restore();
}
// toast
export function toast(ctx, x, y, w, l1, l2, k2 = 0, a = 1) {
  if (a <= 0) return; const h = k2 > 0 ? 150 : 100; card(ctx, x - w / 2, y - h / 2, w, h, { r: 22, a });
  ctx.save(); ctx.globalAlpha *= a; txt(ctx, l1, x - w / 2 + 34, y - h / 2 + 60, F(600, 27), '#16181d', 'left');
  if (k2 > 0) { ctx.globalAlpha *= clamp(k2); ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(x - w / 2 + 46, y - h / 2 + 106, 10, 0, 7); ctx.fill(); txt(ctx, l2, x - w / 2 + 68, y - h / 2 + 115, F(800, 27), '#16181d', 'left'); }
  ctx.restore();
}

// ---------- smoke detector ----------
export function smoke(ctx, T, x, y, s, { led = 1, unplug = 0, a = 1, smokeA = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  for (let i = 0; i < 26; i++) { const t = (T * .12 + hash(i)) % 1, px = x + (hash(i, 2) - .5) * s * 2.6 + Math.sin(T * .7 + i) * 40, py = y + s * 1.6 - t * s * 1.3;
    const g = ctx.createRadialGradient(px, py, 0, px, py, s * (.35 + .4 * hash(i, 3))); g.addColorStop(0, `rgba(150,150,155,${.16 * smokeA * Math.sin(t * Math.PI)})`); g.addColorStop(1, 'rgba(150,150,155,0)'); ctx.fillStyle = g; ctx.fillRect(px - s, py - s, s * 2, s * 2); }
  // wire + plug
  const wy = y + s * .62, gap = unplug * s * .35;
  ctx.lineCap = 'round'; ctx.strokeStyle = '#c0392b'; ctx.lineWidth = s * .045; ctx.beginPath(); ctx.moveTo(x - s * .04, wy); ctx.bezierCurveTo(x - s * .04, wy + s * .4, x - s * .2, wy + s * .6, x - s * .3, wy + s * 1.2); ctx.stroke();
  ctx.strokeStyle = '#222'; ctx.beginPath(); ctx.moveTo(x + s * .04, wy); ctx.bezierCurveTo(x + s * .04, wy + s * .4, x + s * .2, wy + s * .6, x + s * .3, wy + s * 1.2); ctx.stroke();
  rr(ctx, x - s * .14, wy - s * .04 + gap, s * .28, s * .16, s * .03); ctx.fillStyle = '#e8e8e8'; ctx.fill(); ctx.strokeStyle = '#999'; ctx.lineWidth = 2; ctx.stroke();
  rr(ctx, x - s * .1, wy - s * .1, s * .2, s * .08, s * .02); ctx.fillStyle = '#d0d0d0'; ctx.fill();
  // body
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
  let g = ctx.createRadialGradient(x - s * .2, y - s * .25, s * .1, x, y, s * .6); g.addColorStop(0, '#ffffff'); g.addColorStop(.7, '#e4e2dc'); g.addColorStop(1, '#b9b6ae');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s * .58, 0, 7); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(80,80,80,.55)'; ctx.lineWidth = s * .012;
  for (let k = 0; k < 48; k++) { const an = k / 48 * 6.283; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * s * .42, y + Math.sin(an) * s * .42); ctx.lineTo(x + Math.cos(an) * s * .55, y + Math.sin(an) * s * .55); ctx.stroke(); }
  ctx.fillStyle = '#efede8'; ctx.beginPath(); ctx.arc(x, y, s * .36, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.stroke();
  for (let k = 0; k < 24; k++) { const an = k / 24 * 6.283; ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(x + Math.cos(an) * s * .24, y + Math.sin(an) * s * .24, s * .012, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#f7f6f2'; ctx.beginPath(); ctx.arc(x, y, s * .16, 0, 7); ctx.fill(); ctx.strokeStyle = '#bbb'; ctx.lineWidth = 2; ctx.stroke(); txt(ctx, 'TEST', x, y + s * .03, F(700, s * .06), '#999');
  // LED
  const lx = x, ly = y - s * .46; glow(ctx, lx, ly, s * .5 * led, COL.orange, led * (.8 + .2 * Math.sin(T * 6)));
  ctx.fillStyle = led > .1 ? '#ffb02e' : '#7a5a20'; ctx.beginPath(); ctx.arc(lx, ly, s * .03, 0, 7); ctx.fill();
  ctx.restore();
}

// ---------- server rack (3/4 isometric box) ----------
export function rack(ctx, T, x, y, s, { leds = 1, a = 1, light = true } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  const w = s, h = s * 1.25, d = s * .32;
  const sh = ctx.createRadialGradient(x, y + h / 2 + 30, 5, x, y + h / 2 + 30, w); sh.addColorStop(0, 'rgba(0,0,0,.25)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); ctx.save(); ctx.translate(x, y + h / 2 + 30); ctx.scale(1, .15); ctx.translate(-x, -(y + h / 2 + 30)); ctx.fillStyle = sh; ctx.fillRect(x - w, y + h / 2 + 30 - w, w * 2, w * 2); ctx.restore();
  // side face
  ctx.fillStyle = '#16171a'; ctx.beginPath(); ctx.moveTo(x + w / 2, y - h / 2); ctx.lineTo(x + w / 2 + d * .6, y - h / 2 - d * .35); ctx.lineTo(x + w / 2 + d * .6, y + h / 2 - d * .35); ctx.lineTo(x + w / 2, y + h / 2); ctx.fill();
  ctx.fillStyle = '#2a2b30'; ctx.beginPath(); ctx.moveTo(x - w / 2, y - h / 2); ctx.lineTo(x - w / 2 + d * .6, y - h / 2 - d * .35); ctx.lineTo(x + w / 2 + d * .6, y - h / 2 - d * .35); ctx.lineTo(x + w / 2, y - h / 2); ctx.fill();
  let g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#26272c'); g.addColorStop(1, '#1b1c20'); ctx.fillStyle = g; ctx.fillRect(x - w / 2, y - h / 2, w, h);
  const n = 6, uh = h / n;
  for (let i = 0; i < n; i++) { const yy = y - h / 2 + i * uh; rr(ctx, x - w / 2 + 14, yy + 10, w - 28, uh - 18, 8); ctx.fillStyle = '#0f1013'; ctx.fill(); ctx.strokeStyle = '#34363c'; ctx.lineWidth = 2; ctx.stroke();
    for (let k = 0; k < 6; k++) { const on = leds > 0 && hash(i * 7 + k + Math.floor(T * 6 + hash(i, k) * 9), 3) > .4; ctx.fillStyle = on ? `rgba(80,230,140,${leds})` : '#2b2d33'; ctx.beginPath(); ctx.arc(x - w / 2 + 44 + k * 22, yy + uh / 2, 5, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#25272d'; rr(ctx, x + w * .08, yy + uh / 2 - 12, w * .32, 24, 5); ctx.fill(); }
  ctx.restore();
}

// ---------- HF search results ----------
export function hfSearch(ctx, x, y, w, T, { count = 0, hi = 0, scroll = 0, a = 1 } = {}) {
  const h = 860; card(ctx, x, y, w, h, { r: 28, a }); if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.save(); rr(ctx, x, y, w, h, 28); ctx.clip();
  txt(ctx, '🤗', x + 30, y + 52, F(400, 34), '#000', 'left'); txt(ctx, 'Hugging Face', x + 80, y + 50, F(800, 28), '#111', 'left'); txt(ctx, '◦ Models', x + w - 30, y + 48, F(600, 20), '#666', 'right');
  txt(ctx, 'Models', x + 30, y + 130, F(800, 34), '#111', 'left'); txt(ctx, Math.round(count).toLocaleString('en-US'), x + 160, y + 130, F(800, 34), count > 0 ? '#111' : '#aaa', 'left');
  rr(ctx, x + w - 330, y + 96, 300, 50, 25); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#d9dce1'; ctx.lineWidth = 2; ctx.stroke(); txt(ctx, '⌕  abliterated', x + w - 306, y + 129, F(600, 22), '#222', 'left');
  const rows = [['huihui-ai/Huihui-Qwen3.6-27B-', 'abliterated', '-GGUF', COL.blue], ['audnai/penclaw-GLM-5.3-', 'abliterated', '', '120,120,130'], ['lukey03/Qwen3.5-9B-', 'abliterated', '', COL.purple], ['huihui-ai/Huihui-GLM-5.3-Flash-', 'abliterated', '', COL.blue],
    ['Hikari07jp/Ternary-Bonsai-2-27B-', 'Abliterated', '', '200,90,60'], ['cantina-security/apex-flash-1-', 'abliterated', '', COL.orange], ['huihui-ai/Huihui-Qwen3.8-Next-', 'abliterated', '', COL.blue], ['mlabonne/Llama-4-8B-', 'abliterated', '', COL.green],
    ['failspy/Phi-5-mini-', 'abliterated', '', COL.pink], ['huihui-ai/gemma-4-12b-it-', 'abliterated', '', COL.blue]];
  ctx.save(); ctx.beginPath(); ctx.rect(x, y + 170, w, h - 170); ctx.clip();
  rows.forEach((r, i) => { const yy = y + 200 + i * 104 - scroll * 104, k = clamp(count / 8305 * 12 - i);
    if (k <= 0) return; ctx.save(); ctx.globalAlpha *= k; ctx.translate(0, (1 - eo(k)) * 30);
    rr(ctx, x + 24, yy, w - 48, 88, 14); ctx.fillStyle = '#fafbfc'; ctx.fill(); ctx.strokeStyle = '#eceef1'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = `rgb(${r[3]})`; ctx.beginPath(); ctx.arc(x + 50, yy + 32, 8, 0, 7); ctx.fill();
    ctx.font = MONO(21, 600); const w0 = ctx.measureText(r[0]).width, w1 = ctx.measureText(r[1]).width;
    if (hi > 0) { ctx.fillStyle = `rgba(255,70,70,${.22 * clamp(hi * 3 - i * .25)})`; rr(ctx, x + 70 + w0, yy + 14, w1 + 6, 30, 5); ctx.fill(); }
    txt(ctx, r[0], x + 72, yy + 38, MONO(21, 600), '#1f2328', 'left'); txt(ctx, r[1], x + 73 + w0, yy + 38, MONO(21, 700), hi > 0 ? '#d42a2a' : '#1f2328', 'left'); txt(ctx, r[2], x + 75 + w0 + w1, yy + 38, MONO(21, 600), '#1f2328', 'left');
    txt(ctx, `Text Generation · ${[27, 9, 32, 753][i % 4]}B · Updated ${1 + i % 5} days ago · ⤓ ${(2.3 - i * .17).toFixed(1)}k`, x + 72, yy + 72, F(500, 18), '#8a8f98', 'left');
    ctx.restore(); });
  ctx.restore(); ctx.restore(); ctx.restore();
}

// ---------- profile avatar (gradient "a"; Hindi: silhouette, no name) ----------
export function avatar(ctx, T, x, y, r, named) {
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, '#1fa58f'); g.addColorStop(1, '#f2a25c'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; if (named) txt(ctx, 'a', x, y + r * .32, F(900, r * .92), '#fff'); else { ctx.beginPath(); ctx.arc(x, y - r * .28, r * .34, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y + r * .58, r * .6, r * .42, 0, Math.PI, 0); ctx.fill(); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(T * 1.6); const cg = ctx.createConicGradient(0, 0, 0); cg.addColorStop(0, '#f2a25c'); cg.addColorStop(.5, '#1fa58f'); cg.addColorStop(1, '#f2a25c'); ctx.strokeStyle = cg; ctx.lineWidth = r * .08; ctx.beginPath(); ctx.arc(0, 0, r * 1.16, 0, 7); ctx.stroke(); ctx.restore();
}
