// Illustrations for the MacBook trackpad explainer: room, laptop, keyboard deck, side cutaway, coils, sensors, macOS-style UI.
// Everything is drawn in code and depends only on its inputs + time T (deterministic). No real logos.
import { W, H, clamp, lerp, eo, eio, hash, rr, GOLD } from './lib.js';
import { FONT } from './art.js';
export const AMBER = '255,170,60', COPPER = ['#f0a76a', '#c8743d', '#8c4a22'];

// Warm dark room: black top, desk-lamp glow, walnut desk at the bottom.
export function room(ctx, T, { lampX = 170, lampY = 760, desk = 1480, lamp = 1 } = {}) {
  let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b0a09'); g.addColorStop(.6, '#15110d'); g.addColorStop(1, '#0d0907');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  if (lamp > 0) {
    const r = 620 + 20 * Math.sin(T * .8); g = ctx.createRadialGradient(lampX, lampY, 10, lampX, lampY, r);
    g.addColorStop(0, `rgba(255,190,120,${.55 * lamp})`); g.addColorStop(.25, `rgba(220,140,70,${.22 * lamp})`); g.addColorStop(1, 'rgba(160,90,40,0)');
    ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
    for (let i = 0; i < 9; i++) { // soft bokeh
      const x = lampX + (hash(i) - .5) * 700 + 14 * Math.sin(T * .4 + i), y = lampY + (hash(i, 1) - .5) * 600, rad = 30 + 70 * hash(i, 2);
      const b = ctx.createRadialGradient(x, y, 1, x, y, rad); b.addColorStop(0, `rgba(255,200,140,${.08 * lamp})`); b.addColorStop(1, 'rgba(255,200,140,0)');
      ctx.fillStyle = b; ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill();
    }
  }
  wood(ctx, desk);
}
export function wood(ctx, y0, a = 1) {
  const g = ctx.createLinearGradient(0, y0, 0, H + 200); g.addColorStop(0, `rgba(70,40,22,${a})`); g.addColorStop(.35, `rgba(46,26,14,${a})`); g.addColorStop(1, `rgba(16,9,5,${a})`);
  ctx.fillStyle = g; ctx.fillRect(-W, y0, W * 3, H * 2);
  ctx.save(); ctx.globalAlpha = .18 * a; ctx.strokeStyle = '#1a0d06'; ctx.lineWidth = 2;
  for (let i = 0; i < 18; i++) { const y = y0 + 20 + i * i * 4.2; ctx.beginPath(); ctx.moveTo(-W, y); for (let x = -W; x <= 2 * W; x += 80) ctx.lineTo(x, y + 6 * Math.sin(x / 140 + i)); ctx.stroke(); }
  ctx.restore();
}
// Plain dark studio background with a soft warm floor glow (for cutaways).
export function studio(ctx, T, floor = 1420) {
  ctx.fillStyle = '#0d0d0f'; ctx.fillRect(-W, -H, W * 3, H * 3);
  const g = ctx.createRadialGradient(W / 2, floor + 300, 50, W / 2, floor + 300, 1100); g.addColorStop(0, 'rgba(120,70,35,.55)'); g.addColorStop(1, 'rgba(120,70,35,0)');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  wood(ctx, floor, .8);
}

// ---------- keyboard deck (top-down, local coords centred on (0,0), width w) ----------
const ROWS = ['` 1 2 3 4 5 6 7 8 9 0 - =', 'Q W E R T Y U I O P [ ]', 'A S D F G H J K L ; \'', 'Z X C V B N M , . /'];
export function deck(ctx, T, w, o = {}) {
  const { xray = 0, vals = null, coil = 0, tp = 1, sensorHi = 0, valsA = 0, keysA = 1, keyHi = {} } = o, h = w * .68;
  let g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#3d4046'); g.addColorStop(1, '#2c2e33');
  rr(ctx, -w / 2, -h / 2, w, h, w * .03); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = w * .002; ctx.stroke();
  // keyboard well
  const k = w / 15.2, kx0 = -w / 2 + w * .06, ky0 = -h / 2 + h * .06;
  rr(ctx, kx0 - k * .15, ky0 - k * .15, w * .88 + k * .3, k * 5.4, k * .2); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill();
  ctx.save(); ctx.globalAlpha *= keysA;
  ctx.font = FONT(500, k * .26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let r = 0; r < 5; r++) {
    const keys = r < 4 ? ROWS[r].split(' ') : ['', '', '', '', ' ', '', '', ''], n = keys.length, kw = (w * .88 - (n - 1) * k * .12) / n;
    for (let i = 0; i < n; i++) {
      let x = kx0 + i * (kw + k * .12), ww = kw;
      if (r === 4) { const sizes = [1, 1, 1, 1.3, 5.2, 1.3, 1, 1]; const tot = sizes.reduce((a, b) => a + b, 0), unit = (w * .88 - 7 * k * .12) / tot; x = kx0 + sizes.slice(0, i).reduce((a, b) => a + b, 0) * unit + i * k * .12; ww = sizes[i] * unit; }
      const y = ky0 + r * k * 1.06;
      rr(ctx, x, y, ww, k * .92, k * .14); ctx.fillStyle = '#121316'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1; ctx.stroke();
      const kh = keyHi[keys[i]] || 0; // key being typed: amber fill + glow
      if (kh > 0) { rr(ctx, x, y, ww, k * .92, k * .14); ctx.fillStyle = `rgba(${AMBER},${.85 * kh})`; ctx.shadowColor = `rgba(${AMBER},${kh})`; ctx.shadowBlur = k * .6; ctx.fill(); ctx.shadowBlur = 0; }
      if (keys[i].trim()) { ctx.fillStyle = 'rgba(230,232,236,.6)'; ctx.fillText(keys[i], x + ww / 2, y + k * .46); }
    }
  }
  ctx.restore();
  // trackpad
  const pw = w * .5, ph = h * .4, px = -pw / 2, py = h / 2 - ph - h * .05;
  g = ctx.createLinearGradient(px, py, px + pw, py + ph); g.addColorStop(0, '#45484f'); g.addColorStop(.5, '#383b41'); g.addColorStop(1, '#303237');
  rr(ctx, px, py, pw, ph, w * .015); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = w * .003; ctx.stroke();
  ctx.save(); rr(ctx, px, py, pw, ph, w * .015); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.beginPath(); ctx.moveTo(px + pw * .2, py); ctx.lineTo(px + pw * .45, py); ctx.lineTo(px + pw * .25, py + ph); ctx.lineTo(px, py + ph); ctx.fill();
  if (xray > 0) trackpadXray(ctx, T, px, py, pw, ph, { a: xray, vals, coil, sensorHi, valsA });
  ctx.restore();
  return { px, py, pw, ph, w, h };
}
// What sits under the glass: plate, X brace, 4 corner force sensors, the taptic coil bar.
export function trackpadXray(ctx, T, px, py, pw, ph, { a = 1, vals = null, coil = 0, sensorHi = 0, valsA = 0 } = {}) {
  ctx.save(); ctx.globalAlpha *= a;
  rr(ctx, px, py, pw, ph, 0); ctx.fillStyle = 'rgba(14,15,18,.86)'; ctx.fill();
  const ix = px + pw * .05, iy = py + ph * .07, iw = pw * .9, ih = ph * .86, u = pw / 100;
  rr(ctx, ix, iy, iw, ih, u * 2); ctx.fillStyle = '#2a2c31'; ctx.fill(); ctx.strokeStyle = '#5a5e66'; ctx.lineWidth = u * .6; ctx.stroke();
  ctx.strokeStyle = '#17181b'; ctx.lineWidth = u * 4.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(ix + iw * .12, iy + ih * .16); ctx.lineTo(ix + iw * .88, iy + ih * .84); ctx.moveTo(ix + iw * .88, iy + ih * .16); ctx.lineTo(ix + iw * .12, iy + ih * .84); ctx.stroke();
  ctx.strokeStyle = '#4a4e56'; ctx.lineWidth = u * 1.2; ctx.stroke();
  // taptic coil bar
  const bx = px + pw / 2, by = iy + ih * .62; rr(ctx, bx - iw * .2, by - u * 1.6, iw * .4, u * 3.2, u); ctx.fillStyle = '#1a1b1e'; ctx.fill();
  for (let i = 0; i < 18; i++) { ctx.fillStyle = 'rgba(200,205,214,.55)'; ctx.fillRect(bx - iw * .18 + i * iw * .02, by - u, u * .5, u * 2); }
  if (coil > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gg = ctx.createRadialGradient(bx, by, 2, bx, by, iw * .3); gg.addColorStop(0, `rgba(${AMBER},${.6 * coil})`); gg.addColorStop(1, `rgba(${AMBER},0)`); ctx.fillStyle = gg; ctx.fillRect(bx - iw * .3, by - iw * .3, iw * .6, iw * .6); ctx.restore(); }
  // corner sensors
  const cs = [[.12, .16], [.88, .16], [.12, .84], [.88, .84]];
  cs.forEach(([cx, cy], i) => {
    const x = ix + iw * cx, y = iy + ih * cy, s = u * 9;
    rr(ctx, x - s * .55, y - s * .75, s * 1.1, s * 1.5, s * .25); ctx.fillStyle = '#c9ccd2'; ctx.fill();
    ctx.fillStyle = '#9da1a9'; ctx.beginPath(); ctx.arc(x, y - s * .3, s * .3, 0, 7); ctx.fill();
    const hi = typeof sensorHi === 'number' ? sensorHi : sensorHi[i];
    rr(ctx, x - s * .42, y + s * .05, s * .84, s * .55, s * .08); ctx.fillStyle = hi > 0 ? `rgb(${Math.round(lerp(214, 255, hi))},${Math.round(lerp(138, 200, hi))},${Math.round(lerp(60, 90, hi))})` : '#d68a3c'; ctx.fill();
    if (hi > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gg = ctx.createRadialGradient(x, y + s * .3, 1, x, y + s * .3, s * 1.6); gg.addColorStop(0, `rgba(${AMBER},${.7 * hi})`); gg.addColorStop(1, `rgba(${AMBER},0)`); ctx.fillStyle = gg; ctx.fillRect(x - s * 2, y - s * 2, s * 4, s * 4); ctx.restore(); }
    if (vals && valsA > 0) { ctx.save(); ctx.globalAlpha *= valsA; ctx.font = FONT(800, u * 6.5); ctx.textAlign = cx < .5 ? 'left' : 'right'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.shadowColor = '#000'; ctx.shadowBlur = 8; ctx.fillText(String(Math.round(vals[i])), x + (cx < .5 ? s * .9 : -s * .9), y + (cy < .5 ? s * .9 : -s * .9)); ctx.restore(); }
  });
  ctx.restore();
}

// ---------- laptop, 3/4 axonometric ----------
// (x,y) = centre of the deck; s = scale (deck is 1000 local units wide). screenFn(ctx, w, h) draws the display.
export function laptop(ctx, T, x, y, s, { screenFn, deckOpt = {}, lid = 1, kx = -.16, ky = .42, after } = {}) {
  const w = 1000, h = w * .68, P = (u, v) => [x + s * (u + kx * v), y + s * ky * v];
  // shadow
  ctx.save(); const sg = ctx.createRadialGradient(x, y + s * ky * h * .55, 10, x, y + s * ky * h * .55, s * 700); sg.addColorStop(0, 'rgba(0,0,0,.6)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.translate(x, y + s * ky * h * .55); ctx.scale(1, .22); ctx.translate(-x, -(y + s * ky * h * .55)); ctx.fillStyle = sg; ctx.fillRect(x - s * 800, y - s * 400, s * 1600, s * 2000); ctx.restore();
  // lid (behind the deck)
  const [hx, hy] = P(0, -h / 2), lh = 640, ang = lerp(0, 1, lid), lx = .05 * ang, ly = -.95 * ang - .05;
  if (lid > .02) {
    ctx.save(); ctx.transform(s, 0, -s * lx, -s * ly, hx, hy);
    rr(ctx, -w / 2 + 6, -lh, w - 12, lh, 30); ctx.fillStyle = '#0b0b0c'; ctx.fill(); ctx.strokeStyle = '#55585e'; ctx.lineWidth = 4; ctx.stroke();
    const sx = -w / 2 + 34, sy = -lh + 30, sw = w - 68, sh = lh - 64;
    ctx.save(); rr(ctx, sx, sy, sw, sh, 12); ctx.clip(); ctx.translate(sx, sy); (screenFn || blank)(ctx, sw, sh, T); ctx.restore();
    rr(ctx, -70, -lh + 30, 140, 26, [0, 0, 12, 12]); ctx.fillStyle = '#0b0b0c'; ctx.fill(); // notch
    ctx.restore();
  }
  // front edge thickness
  const a = P(-w / 2, h / 2), b = P(w / 2, h / 2), t = s * 26;
  let g = ctx.createLinearGradient(0, a[1], 0, a[1] + t); g.addColorStop(0, '#5b5e65'); g.addColorStop(1, '#1d1e21');
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(b[0], b[1] + t); ctx.lineTo(a[0], a[1] + t); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  const r = P(w / 2, -h / 2); ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(r[0], r[1]); ctx.lineTo(r[0], r[1] + t); ctx.lineTo(b[0], b[1] + t); ctx.closePath(); ctx.fillStyle = '#26282c'; ctx.fill();
  ctx.save(); ctx.transform(s, 0, s * kx, s * ky, x, y); const geo = deck(ctx, T, w, deckOpt); if (after) after(ctx, geo); ctx.restore();
  return { P, geo };
}
const blank = (ctx, w, h) => { const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#111'); g.addColorStop(.5, '#050505'); g.addColorStop(1, '#0d0d0d'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); };
export function screenOff(ctx, w, h, T, glare = 1) { blank(ctx, w, h); ctx.fillStyle = `rgba(255,190,120,${.08 * glare})`; ctx.beginPath(); ctx.moveTo(w * .1, 0); ctx.lineTo(w * .45, 0); ctx.lineTo(w * .2, h); ctx.lineTo(-w * .1, h); ctx.fill(); }

// ---------- macOS-style desktop (original drawing, no real icons) ----------
export function wall(ctx, w, h, T) {
  let g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#3a0d0c'); g.addColorStop(.5, '#7a1c12'); g.addColorStop(1, '#2a0807'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  for (let k = 0; k < 5; k++) {
    ctx.fillStyle = ['rgba(255,120,60,.35)', 'rgba(140,20,15,.55)', 'rgba(255,170,90,.25)', 'rgba(90,10,10,.5)', 'rgba(230,90,50,.3)'][k];
    ctx.beginPath(); const y0 = h * (.15 + k * .17); ctx.moveTo(0, y0);
    for (let x = 0; x <= w; x += w / 24) ctx.lineTo(x, y0 + Math.sin(x / w * 4 + k * 1.3 + T * .25) * h * .07 - x / w * h * .18);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
  }
}
export function desktop(ctx, w, h, T, { dock = 1, menu = 1 } = {}) {
  wall(ctx, w, h, T);
  if (menu) {
    ctx.fillStyle = 'rgba(20,8,8,.45)'; ctx.fillRect(0, 0, w, h * .045); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = FONT(600, h * .024); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.beginPath(); ctx.arc(w * .03, h * .0225, h * .009, 0, 7); ctx.fill();
    ['Finder', 'File', 'Edit', 'View', 'Go', 'Window', 'Help'].reduce((x, s, i) => { ctx.font = FONT(i ? 500 : 700, h * .024); ctx.fillText(s, x, h * .024); return x + ctx.measureText(s).width + w * .025; }, w * .06);
    ctx.textAlign = 'right'; ctx.fillText('Wed 9:41', w * .97, h * .024);
  }
  if (dock) dockBar(ctx, w, h, T);
}
const DOCK = ['#2f8cff', '#34c759', '#ff9f0a', '#ff375f', '#5e5ce6', '#64d2ff', '#ffd60a', '#bf5af2', '#ff453a', '#30d158', '#8e8e93'];
export function dockBar(ctx, w, h, T, hi = -1, hiA = 0) {
  const n = DOCK.length, s = h * .075, gap = s * .22, dw = n * s + (n + 1) * gap, x0 = (w - dw) / 2, y0 = h - s - gap * 3;
  rr(ctx, x0, y0, dw, s + gap * 2, s * .32); ctx.fillStyle = 'rgba(40,30,30,.55)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1.5; ctx.stroke();
  DOCK.forEach((c, i) => {
    const lift = i === hi ? hiA * s * .3 : 0, x = x0 + gap + i * (s + gap), y = y0 + gap - lift;
    const g = ctx.createLinearGradient(x, y, x, y + s); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,.35)');
    rr(ctx, x, y, s, s, s * .24); ctx.fillStyle = c; ctx.fill(); ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); [0, 1, 2].forEach(k => { if ((i + k) % 3 === 0) ctx.arc(x + s * .5, y + s * .5, s * .18, 0, 7); }); ctx.fill();
  });
  return { x0, y0, s, gap };
}
// Dark app window with traffic lights. Content drawn by fn(ctx, x, y, w, h) inside.
export function win(ctx, x, y, w, h, title, fn, light = false) {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
  rr(ctx, x, y, w, h, w * .02); ctx.fillStyle = light ? '#f4f4f5' : '#1f2025'; ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1.5; rr(ctx, x, y, w, h, w * .02); ctx.stroke();
  const tb = h * .085; ['#ff5f57', '#febc2e', '#28c840'].forEach((c, k) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + tb * .6 + k * tb * .45, y + tb * .55, tb * .14, 0, 7); ctx.fill(); });
  ctx.fillStyle = light ? '#333' : 'rgba(255,255,255,.8)'; ctx.font = FONT(700, tb * .36); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(title, x + tb * 2.2, y + tb * .56);
  ctx.save(); rr(ctx, x, y + tb, w, h - tb, [0, 0, w * .02, w * .02]); ctx.clip(); fn(ctx, x, y + tb, w, h - tb); ctx.restore();
}
export function finderBody(ctx, x, y, w, h) {
  ctx.fillStyle = '#26272c'; ctx.fillRect(x, y, w * .26, h);
  ctx.font = FONT(500, h * .055); ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.55)';
  ['Recents', 'Applications', 'Desktop', 'Documents', 'Downloads'].forEach((s, i) => ctx.fillText(s, x + w * .03, y + h * (.12 + i * .1)));
  const cols = ['#c97b4a', '#6b7280', '#3b82f6', '#a3a3a3'];
  cols.forEach((c, i) => { const ix = x + w * (.32 + i * .17), iy = y + h * .1; rr(ctx, ix, iy, w * .13, w * .1, 6); ctx.fillStyle = c; ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(ix, iy + w * .115, w * .13, h * .025); });
  [0, 1].forEach(i => { const ix = x + w * (.32 + i * .17), iy = y + h * .52; ctx.fillStyle = '#4aa8f0'; rr(ctx, ix, iy + w * .02, w * .13, w * .085, 6); ctx.fill(); rr(ctx, ix, iy, w * .06, w * .03, 4); ctx.fill(); });
}
// Notes-style window text with a highlighted word and an optional Look Up popup.
export function notesBody(ctx, x, y, w, h, hl = 0, lookup = 0) {
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff'; ctx.font = FONT(800, h * .13); ctx.fillText('Desk reset', x + w * .06, y + h * .24);
  ctx.font = FONT(500, h * .085); ctx.fillStyle = 'rgba(255,255,255,.8)';
  const l1a = 'Wipe the keyboard first, then the', l2a = 'trackpad', l2b = ' and the screen.';
  ctx.fillText(l1a, x + w * .06, y + h * .42);
  const tw = ctx.measureText(l2a).width;
  if (hl > 0) { ctx.fillStyle = `rgba(255,214,10,${.85 * hl})`; rr(ctx, x + w * .06 - 4, y + h * .5, tw + 8, h * .11, 4); ctx.fill(); }
  ctx.fillStyle = hl > .5 ? '#111' : 'rgba(255,255,255,.8)'; ctx.fillText(l2a, x + w * .06, y + h * .58);
  ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillText(l2b, x + w * .06 + tw, y + h * .58);
  ctx.fillText('Order a new lamp bulb.', x + w * .06, y + h * .74);
  return { wx: x + w * .06 + tw / 2, wy: y + h * .56 };
}
export function lookupCard(ctx, x, y, w, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; const h = w * .62;
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 30; rr(ctx, x, y, w, h, 18); ctx.fillStyle = '#2a2b31'; ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = FONT(700, w * .045); ctx.fillText('DICTIONARY', x + w * .06, y + h * .14);
  ctx.fillStyle = '#fff'; ctx.font = FONT(800, w * .075); ctx.fillText('trackpad', x + w * .06, y + h * .32);
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = FONT(500, w * .05); ctx.fillText('| ˈtrakˌpad |  noun', x + w * .42, y + h * .32);
  ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.font = FONT(500, w * .05);
  ['a flat, touch-sensitive pad used to', 'move a pointer on a screen.'].forEach((s, i) => ctx.fillText(s, x + w * .06, y + h * (.5 + i * .13)));
  rr(ctx, x + w * .06, y + h * .78, w * .4, h * .13, 10); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = FONT(600, w * .042); ctx.fillText('Open in Dictionary', x + w * .09, y + h * .865);
  ctx.restore();
}
// Trackpad settings panel (dark). click: 0 Light .. 1 Medium .. 2 Firm (continuous).
export function trackpadPanel(ctx, x, y, w, T, { click = 1, hi = 0, force = 1 } = {}) {
  const h = w * 1.18;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20; rr(ctx, x, y, w, h, 28); ctx.fillStyle = '#1e1f24'; ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; rr(ctx, x, y, w, h, 28); ctx.stroke();
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, k) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 36 + k * 28, y + 38, 9, 0, 7); ctx.fill(); });
  ctx.fillStyle = '#fff'; ctx.font = FONT(800, 34); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Trackpad', x + 140, y + 50);
  // tabs
  const tw = (w - 60) / 3; rr(ctx, x + 30, y + 90, w - 60, 54, 14); ctx.fillStyle = '#2b2d33'; ctx.fill();
  rr(ctx, x + 34, y + 94, tw - 8, 46, 11); ctx.fillStyle = '#4b4e57'; ctx.fill();
  ctx.font = FONT(600, 24); ctx.textAlign = 'center'; ['Point & Click', 'Scroll & Zoom', 'More Gestures'].forEach((s, i) => { ctx.fillStyle = i ? 'rgba(255,255,255,.6)' : '#fff'; ctx.fillText(s, x + 30 + tw * (i + .5), y + 125); });
  const row = (i, lbl, sub, fn, hl = 0) => {
    const ry = y + 175 + i * 128; rr(ctx, x + 30, ry, w - 60, 112, 18); ctx.fillStyle = '#26282e'; ctx.fill();
    if (hl > 0) { ctx.strokeStyle = `rgba(47,140,255,${hl})`; ctx.lineWidth = 4; ctx.stroke(); }
    ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = FONT(700, 28); ctx.fillText(lbl, x + 56, ry + (sub ? 46 : 64));
    if (sub) { ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = FONT(500, 20); ctx.fillText(sub, x + 56, ry + 80); }
    fn && fn(ry);
  };
  const slider = (ry, v, labels) => {
    const sx = x + w * .46, sw = w * .44, sy = ry + 48; rr(ctx, sx, sy - 4, sw, 8, 4); ctx.fillStyle = '#4a4d55'; ctx.fill();
    labels.forEach((l, k) => { const tx = sx + sw * k / (labels.length - 1); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(tx - 1.5, sy + 12, 3, 10); ctx.font = FONT(600, 20); ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillText(l, tx, sy + 48); });
    const kx = sx + sw * v; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(kx, sy, 19, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    return kx;
  };
  const tog = (ry, on) => { const tx = x + w - 140, ty = ry + 32; rr(ctx, tx, ty, 88, 48, 24); ctx.fillStyle = on ? '#2f8cff' : '#4a4d55'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(tx + (on ? 64 : 24), ty + 24, 20, 0, 7); ctx.fill(); };
  let knob = 0;
  row(0, 'Tracking speed', '', ry => slider(ry, .55, ['Slow', 'Fast']));
  row(1, 'Click', '', ry => { knob = slider(ry, click / 2, ['Light', 'Medium', 'Firm']); }, hi);
  row(2, 'Force Click and', 'haptic feedback', ry => tog(ry, force > .5));
  row(3, 'Look up & data', 'Force Click with One Finger', null);
  row(4, 'Tap to click', 'Tap with one finger', ry => tog(ry, false));
  return { knobX: knob, knobY: y + 175 + 128 + 48, h };
}

// ---------- side cutaway of the trackpad ----------
// y = glass bottom line. jolt: sideways shift (px) of glass + rail. press: glass dip. coil/field: glow 0..1.
// pulse: 0..1 progress of a current pulse along the wire (null = none). dead: unpowered tint.
export function cutaway(ctx, T, o = {}) {
  const { y = 1180, jolt = 0, press = 0, coil = 0, field = 0, pulse = null, wireGlow = 0, dead = 0, coils = [330, 455, 580, 705], cw = 112, base = 1 } = o;
  const gy = y + press;
  // chassis floor + panels
  if (base) {
    ctx.fillStyle = '#1b1c20'; ctx.fillRect(-60, y + 150, W + 120, 26); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(-60, y + 150, W + 120, 2);
    ctx.strokeStyle = '#33353b'; ctx.lineWidth = 4; [[40, 440], [500, 300], [820, 300]].forEach(([x, w]) => { rr(ctx, x, y + 196, w, 90, 10); ctx.stroke(); });
    ctx.fillStyle = '#121316'; ctx.fillRect(-60, y + 300, W + 120, 30);
  }
  // side brackets (C-shaped frame)
  ctx.strokeStyle = '#5b5f68'; ctx.lineWidth = 10; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(190, y - 70); ctx.lineTo(70, y - 70); ctx.arcTo(40, y - 70, 40, y + 140, 30); ctx.lineTo(40, y + 110); ctx.arcTo(40, y + 140, 120, y + 140, 30); ctx.lineTo(190, y + 140); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(890, y - 70); ctx.lineTo(1010, y - 70); ctx.arcTo(1040, y - 70, 1040, y + 140, 30); ctx.lineTo(1040, y + 110); ctx.arcTo(1040, y + 140, 960, y + 140, 30); ctx.lineTo(890, y + 140); ctx.stroke();
  ctx.fillStyle = '#c87a3a'; ctx.fillRect(60, y - 92, 110, 10); ctx.fillRect(910, y - 92, 110, 10); // gaskets
  // wire into the first coil
  const wp = [[-80, y + 108], [210, y + 108], [250, y + 70], [coils[0] - cw / 2 + 6, y + 50]];
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#7a4a26'; ctx.lineWidth = 6; ctx.beginPath(); wp.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke();
  if (wireGlow > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${AMBER},${.5 * wireGlow})`; ctx.lineWidth = 16; ctx.stroke(); ctx.restore(); }
  ctx.fillStyle = '#bfc3ca'; ctx.beginPath(); ctx.arc(210, y + 108, 9, 0, 7); ctx.fill();
  if (pulse !== null && pulse >= 0 && pulse <= 1) along(ctx, wp, pulse);
  // coils (copper windings)
  coils.forEach((cx, i) => coilBox(ctx, T, cx, y + 44, cw, 58, coil * (1 - .15 * i), dead));
  // magnetic field loops
  if (field > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    coils.forEach((cx, i) => { for (let k = 1; k <= 4; k++) {
      const br = 1 + .04 * Math.sin(T * 6 + k + i), a = field * (.55 - k * .1);
      ctx.strokeStyle = `rgba(${AMBER},${a})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, y + 44, (cw * .5 + k * 18) * br, (30 + k * 20) * br, 0, 0, 7); ctx.stroke();
    } });
    ctx.restore();
  }
  // rail (metal plate under the glass) + glass slab
  ctx.save(); ctx.translate(jolt, 0);
  let g = ctx.createLinearGradient(0, gy - 4, 0, gy + 12); g.addColorStop(0, '#e6e8ec'); g.addColorStop(1, '#7d828b');
  ctx.fillStyle = g; rr(ctx, coils[0] - cw / 2 - 20, gy - 2, coils[coils.length - 1] - coils[0] + cw + 40, 14, 4); ctx.fill();
  g = ctx.createLinearGradient(0, gy - 60, 0, gy - 2); g.addColorStop(0, '#7b8089'); g.addColorStop(.12, '#4b4f57'); g.addColorStop(1, '#2c2f35');
  ctx.fillStyle = g; ctx.fillRect(40, gy - 58, 1000, 56); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillRect(40, gy - 60, 1000, 3);
  ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.beginPath(); ctx.moveTo(300, gy - 57); ctx.lineTo(360, gy - 57); ctx.lineTo(330, gy - 3); ctx.lineTo(270, gy - 3); ctx.fill();
  ctx.restore();
  if (dead > 0) { ctx.fillStyle = `rgba(8,9,12,${.35 * dead})`; ctx.fillRect(-60, y - 100, W + 120, 260); }
  return { top: gy - 60, wire: wp };
}
export function coilBox(ctx, T, cx, cy, w, h, glow = 0, dead = 0) {
  const x = cx - w / 2, y = cy - h / 2;
  let g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, COPPER[0]); g.addColorStop(.5, COPPER[1]); g.addColorStop(1, COPPER[2]);
  rr(ctx, x, y, w, h, 10); ctx.fillStyle = g; ctx.fill();
  ctx.save(); rr(ctx, x, y, w, h, 10); ctx.clip(); ctx.strokeStyle = 'rgba(90,40,15,.45)'; ctx.lineWidth = 1.5;
  for (let k = 3; k < h; k += 4) { ctx.beginPath(); ctx.moveTo(x, y + k); ctx.lineTo(x + w, y + k); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,230,190,.25)'; ctx.fillRect(x, y + 3, w, 5); ctx.restore();
  if (glow > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    rr(ctx, x, y, w, h, 10); ctx.fillStyle = `rgba(255,200,110,${.55 * glow})`; ctx.fill();
    g = ctx.createRadialGradient(cx, cy, 4, cx, cy, w * 1.1); g.addColorStop(0, `rgba(${AMBER},${.55 * glow})`); g.addColorStop(1, `rgba(${AMBER},0)`); ctx.fillStyle = g; ctx.fillRect(cx - w * 1.2, cy - w * 1.2, w * 2.4, w * 2.4);
    ctx.restore();
  }
  if (dead > 0) { rr(ctx, x, y, w, h, 10); ctx.fillStyle = `rgba(10,10,12,${.45 * dead})`; ctx.fill(); }
}
// glowing current pulse at progress u along a polyline, with a short trail
export function along(ctx, pts, u, rgb = AMBER, r = 22) {
  const seg = []; let L = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  const at = s => { s = clamp(s, 0, 1) * L; let i = 0; while (i < seg.length - 1 && s > seg[i]) { s -= seg[i]; i++; } const k = s / seg[i]; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; };
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 8; k++) { const [x, y] = at(u - k * .025), a = 1 - k / 8, rad = r * (1 - k * .08);
    const g = ctx.createRadialGradient(x, y, 1, x, y, rad); g.addColorStop(0, `rgba(255,245,210,${a})`); g.addColorStop(.35, `rgba(${rgb},${.8 * a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill(); }
  ctx.restore();
}

// ---------- 3D boxes (proj3 projector from lib.js) ----------
// Painter's order inside a box: far sides first, top last. cols: [top, side, front] fills (strings or fn(ctx, quad)).
export function box3(ctx, P, [x0, y0, z0], [x1, y1, z1], cols, stroke = 'rgba(255,255,255,.12)') {
  const v = (x, y, z) => P(x, y, z), q = pts => pts.map(p => v(...p));
  const sides = [
    q([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]]), q([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]),
    q([[x1, y1, z0], [x0, y1, z0], [x0, y1, z1], [x1, y1, z1]]), q([[x0, y1, z0], [x0, y0, z0], [x0, y0, z1], [x0, y1, z1]])];
  if (sides.some(f => f.some(p => !p))) return;
  const depth = f => f.reduce((a, p) => a + p[2], 0) / 4;
  sides.map((f, i) => [f, i]).sort((a, b) => depth(b[0]) - depth(a[0])).forEach(([f, i]) => face(ctx, f, i % 2 ? cols[1] : cols[2], stroke));
  face(ctx, q([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]), cols[0], stroke);
}
function face(ctx, f, fill, stroke) {
  ctx.beginPath(); f.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
  if (typeof fill === 'function') fill(ctx, f); else { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
}
export const copperFill = glow => (ctx, f) => {
  const g = ctx.createLinearGradient(f[0][0], f[0][1], f[2][0], f[2][1]); g.addColorStop(0, '#f2ae74'); g.addColorStop(1, '#9a5427'); ctx.fillStyle = g; ctx.fill();
  if (glow > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,200,110,${.6 * glow})`; ctx.fill(); ctx.restore(); }
};

// ---------- hands ----------
// Top-down hand, index fingertip at (x,y), finger pointing along ang (0 = up). s = scale.
export function hand(ctx, x, y, ang = -.5, s = 1, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  const skin = (x0, x1) => { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#a8705a'); g.addColorStop(.45, '#f0c6ad'); g.addColorStop(1, '#b77c64'); return g; };
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetX = 18; ctx.shadowOffsetY = 26;
  // curled fingers + palm
  [[95, 300, 62, 150, .15], [150, 330, 58, 140, .3], [196, 370, 52, 120, .45]].forEach(([fx, fy, fw, fh, r]) => { ctx.save(); ctx.translate(fx, fy); ctx.rotate(r); rr(ctx, -fw / 2, -fh / 2, fw, fh, fw / 2); ctx.fillStyle = skin(-fw / 2, fw / 2); ctx.fill(); ctx.restore(); });
  ctx.beginPath(); ctx.ellipse(110, 470, 165, 185, .25, 0, 7); ctx.fillStyle = skin(-60, 280); ctx.fill();
  ctx.save(); ctx.translate(-50, 420); ctx.rotate(-.7); rr(ctx, -34, -120, 68, 220, 34); ctx.fillStyle = skin(-34, 34); ctx.fill(); ctx.restore(); // thumb
  rr(ctx, -36, -10, 72, 400, 36); ctx.fillStyle = skin(-36, 36); ctx.fill(); // index finger
  ctx.shadowColor = 'transparent';
  rr(ctx, -22, 2, 44, 52, 20); ctx.fillStyle = 'rgba(255,225,215,.55)'; ctx.fill(); // nail
  ctx.strokeStyle = 'rgba(120,70,55,.25)'; ctx.lineWidth = 2; [150, 250].forEach(k => { ctx.beginPath(); ctx.moveTo(-22, k); ctx.quadraticCurveTo(0, k + 8, 22, k); ctx.stroke(); });
  ctx.restore();
}

// ---------- small UI pieces ----------
export function pill(ctx, x, y, text, { col = '255,255,255', bg = 'rgba(14,15,18,.9)', size = 44, a = 1, icon = '' } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.font = FONT(800, size); const s = (icon ? icon + '  ' : '') + text, w = ctx.measureText(s).width + size * 1.4, h = size * 1.9;
  rr(ctx, x - w / 2, y - h / 2, w, h, h / 2); ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = `rgba(${col},.85)`; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = `rgb(${col})`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y + 2); ctx.restore();
}
// Force meter: Light / Medium / Firm with a threshold mark. v, thr in 0..1.
export function forceMeter(ctx, x, y, w, v, thr = .5, a = 1, crossed = 0) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  rr(ctx, x, y, w, 26, 13); ctx.fillStyle = '#2a2c31'; ctx.fill();
  const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#6b4a2a'); g.addColorStop(1, `rgb(${AMBER})`);
  rr(ctx, x, y, Math.max(26, w * clamp(v)), 26, 13); ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillRect(x + w * thr - 2, y - 18, 4, 62);
  ctx.font = FONT(600, 26); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  [['Light', 0], ['Medium', .5], ['Firm', 1]].forEach(([s, k]) => { ctx.fillStyle = Math.abs(k - thr) < .01 ? '#fff' : 'rgba(255,255,255,.5)'; ctx.fillText(s, x + w * k, y + 76); });
  if (crossed > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const r = ctx.createRadialGradient(x + w * thr, y + 13, 2, x + w * thr, y + 13, 120); r.addColorStop(0, `rgba(${AMBER},${.8 * crossed})`); r.addColorStop(1, `rgba(${AMBER},0)`); ctx.fillStyle = r; ctx.fillRect(x + w * thr - 130, y - 120, 260, 260); ctx.restore(); }
  ctx.restore();
}
export function xmark(ctx, x, y, r, a, col = '255,80,80') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.strokeStyle = `rgb(${col})`; ctx.lineWidth = r * .22; ctx.lineCap = 'round'; const s = r * eo(a);
  ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); ctx.stroke(); ctx.restore();
}
export function check(ctx, x, y, r, a, col = '52,199,89') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.fillStyle = `rgb(${col})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = r * .22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const k = eo(a);
  ctx.beginPath(); ctx.moveTo(x - r * .45, y); ctx.lineTo(x - r * .1, y + r * .35 * Math.min(1, k * 2)); if (k > .5) ctx.lineTo(x - r * .1 + r * .6 * (k - .5) * 2, y + r * .35 - r * .75 * (k - .5) * 2); ctx.stroke(); ctx.restore();
}
// Fingertip macro: big skin pad with ridges pressed onto glass at line gy.
export function fingertipMacro(ctx, T, gy, shake = 0, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(shake, 0);
  ctx.save(); ctx.beginPath(); ctx.rect(-W, -H, W * 3, gy + H); ctx.clip();
  const cx = W / 2, cy = gy - 420, r = 900;
  let g = ctx.createRadialGradient(cx - 120, cy - 200, 50, cx, cy, r); g.addColorStop(0, '#f6cdb6'); g.addColorStop(.6, '#e2a88d'); g.addColorStop(1, '#a8705a');
  ctx.beginPath(); ctx.ellipse(cx, cy + 200, r, 640, 0, 0, 7); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(140,80,62,.35)'; ctx.lineWidth = 5;
  for (let k = 0; k < 26; k++) { ctx.beginPath(); ctx.ellipse(cx + 60, gy - 120, 40 + k * 34, 22 + k * 15, -.08, 0, 7); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,235,220,.25)'; ctx.lineWidth = 2;
  for (let k = 0; k < 26; k++) { ctx.beginPath(); ctx.ellipse(cx + 60, gy - 123, 40 + k * 34, 22 + k * 15, -.08, 0, 7); ctx.stroke(); }
  ctx.restore();
  g = ctx.createLinearGradient(0, gy, 0, gy + 260); g.addColorStop(0, '#5d626b'); g.addColorStop(.08, '#2f3238'); g.addColorStop(1, '#16171b');
  ctx.fillStyle = g; ctx.fillRect(-W, gy, W * 3, 260); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(-W, gy, W * 3, 3);
  ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.beginPath(); ctx.moveTo(280, gy); ctx.lineTo(360, gy); ctx.lineTo(300, gy + 260); ctx.lineTo(220, gy + 260); ctx.fill();
  ctx.fillStyle = '#0e0f12'; ctx.fillRect(-W, gy + 260, W * 3, H);
  ctx.restore();
}
// Old "diving board" trackpad: glass hinged at the top edge (left), one switch under the bottom edge (right).
export function oldPad(ctx, T, y, tilt = 0, sw = 0) {
  const hx = 120, L = 840;
  ctx.fillStyle = '#1b1c20'; ctx.fillRect(40, y + 120, 1000, 24); ctx.strokeStyle = '#5b5f68'; ctx.lineWidth = 8; rr(ctx, 40, y - 20, 1000, 164, 26); ctx.stroke();
  // switch
  const sx = hx + L - 80, sy = y + 120, dome = 18 * (1 - sw);
  ctx.fillStyle = '#3a3d44'; rr(ctx, sx - 50, sy - 30, 100, 30, 6); ctx.fill();
  ctx.fillStyle = sw > .5 ? `rgb(${AMBER})` : '#9aa0aa'; ctx.beginPath(); ctx.ellipse(sx, sy - 30, 34, dome + 4, 0, Math.PI, 0); ctx.fill();
  label2(ctx, 'SWITCH', sx, sy + 50);
  // hinge
  ctx.fillStyle = '#9aa0aa'; ctx.beginPath(); ctx.arc(hx, y + 30, 14, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(hx, y + 30); ctx.rotate(tilt);
  const g = ctx.createLinearGradient(0, -46, 0, 0); g.addColorStop(0, '#7b8089'); g.addColorStop(.12, '#4b4f57'); g.addColorStop(1, '#2c2f35');
  ctx.fillStyle = g; ctx.fillRect(0, -46, L, 46); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillRect(0, -48, L, 3);
  ctx.fillStyle = '#d0d3d8'; ctx.fillRect(L - 110, 0, 60, 18); // plunger
  ctx.restore();
  label2(ctx, 'TOP', hx + 40, y + 200); label2(ctx, 'BOTTOM', hx + L - 60, y + 200);
}
function label2(ctx, s, x, y) { ctx.save(); ctx.font = FONT(700, 22); ctx.letterSpacing = '3px'; ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.textAlign = 'center'; ctx.fillText(s, x, y); ctx.restore(); }
