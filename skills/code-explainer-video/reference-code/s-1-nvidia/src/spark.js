// Drawing kit for the NVIDIA RTX Spark explainer. Pure functions of their inputs + time T (deterministic).
// Laptop (front 3/4 with x-ray deck), chat app UI, glowing AI chat bubble + light paths, RTX Spark chip package
// (Grace CPU cores + Blackwell GPU grid), petaflop core floor, data center + server rack, memory board,
// retro Windows app windows, glass prism translator, photo/clip cards. Everything else lives in kit.js / lib.js.
import { W, H, clamp, lerp, eo, eio, eback, hash, rr } from './lib.js';
import { IMG } from './assets.js';
import { FONT, MONO, txt, tw, glowDot, card } from './kit.js';

export const NV = '#76b900', NV_RGB = '118,185,0', LIME = '#d6f548', LIME_RGB = '214,245,72', TEAL_RGB = '80,230,190', RED_RGB = '255,90,80';

// ---------- backgrounds ----------
// night room: window band with distant city lights + hills, warm wood desk below `desk`
export function bgRoom(ctx, T, { desk = 1250, glow = 1, tint = null } = {}) {
  let g = ctx.createLinearGradient(0, 0, 0, desk); g.addColorStop(0, '#0b1018'); g.addColorStop(1, '#17202c');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, desk + H);
  // hills + city lights through the window
  ctx.fillStyle = '#0d141d'; ctx.beginPath(); ctx.moveTo(-200, desk - 120);
  for (let x = -200; x <= W + 200; x += 40) ctx.lineTo(x, desk - 170 - 60 * Math.sin(x / 260) - 30 * Math.sin(x / 97 + 1));
  ctx.lineTo(W + 200, desk); ctx.lineTo(-200, desk); ctx.fill();
  for (let i = 0; i < 140; i++) {
    const x = hash(i, 1) * (W + 200) - 100, y = desk - 40 - 150 * hash(i, 2) * hash(i, 3);
    ctx.fillStyle = `rgba(255,${200 + 40 * hash(i, 4)},150,${(.25 + .5 * hash(i, 5)) * (.7 + .3 * Math.sin(T * 1.7 + i))})`;
    ctx.fillRect(x, y, 2.2, 2.2);
  }
  for (let i = 0; i < 50; i++) { // stars
    ctx.fillStyle = `rgba(255,255,255,${.25 * hash(i, 7) * (.6 + .4 * Math.sin(T * 2 + i))})`; ctx.fillRect(hash(i, 8) * W, hash(i, 9) * (desk - 350), 2, 2);
  }
  // window mullions
  ctx.fillStyle = 'rgba(4,6,10,.85)'; ctx.fillRect(-W, desk - 22, W * 3, 22); ctx.fillRect(W * .72, -H, 16, H + desk);
  // desk
  g = ctx.createLinearGradient(0, desk, 0, H + 200); g.addColorStop(0, '#3a2318'); g.addColorStop(.35, '#24150f'); g.addColorStop(1, '#0d0806');
  ctx.fillStyle = g; ctx.fillRect(-W, desk, W * 3, H);
  ctx.globalAlpha = .07; ctx.strokeStyle = '#ffcfa0'; ctx.lineWidth = 2;
  for (let i = 0; i < 26; i++) { const y = desk + 14 + i * i * 2.2; ctx.beginPath(); ctx.moveTo(-50, y); ctx.bezierCurveTo(300, y + 8 * Math.sin(i), 700, y - 6, W + 50, y + 5); ctx.stroke(); }
  ctx.globalAlpha = 1;
  if (glow > 0) { const r = ctx.createRadialGradient(W / 2, desk + 260, 20, W / 2, desk + 260, 760); r.addColorStop(0, `rgba(255,214,170,${.16 * glow})`); r.addColorStop(1, 'rgba(255,214,170,0)'); ctx.fillStyle = r; ctx.fillRect(-W, -H, W * 3, H * 3); }
  if (tint) { ctx.fillStyle = tint; ctx.fillRect(-W, -H, W * 3, H * 3); }
  vignette(ctx);
}
// dark studio with a slowly moving perspective floor grid and a soft green glow
export function bgStage(ctx, T, { gy = 1100, glow = 1, rgb = NV_RGB, floor = 1300 } = {}) {
  let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a0c0e'); g.addColorStop(1, '#050607');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let i = -14; i <= 14; i++) { ctx.moveTo(W / 2 + i * 30, floor); ctx.lineTo(W / 2 + i * 260, H + 300); }
  const off = (T * .35) % 1;
  for (let k = 0; k < 14; k++) { const u = (k + off) / 14, y = floor + (H + 300 - floor) * u * u; ctx.moveTo(-W, y); ctx.lineTo(W * 2, y); }
  ctx.stroke(); ctx.restore();
  if (glow > 0) { const r = ctx.createRadialGradient(W / 2, gy, 10, W / 2, gy, 720 + 30 * Math.sin(T)); r.addColorStop(0, `rgba(${rgb},${.18 * glow})`); r.addColorStop(.5, `rgba(${rgb},${.06 * glow})`); r.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = r; ctx.fillRect(-W, -H, W * 3, H * 3); }
  for (let i = 0; i < 40; i++) { const x = ((hash(i) * W + T * 8 * (hash(i, 2) - .5)) % W + W) % W, y = ((hash(i, 1) * H - T * 9 * hash(i, 3)) % H + H) % H; ctx.fillStyle = `rgba(255,255,255,${.1 + .15 * hash(i, 4)})`; ctx.fillRect(x, y, 2, 2); }
  vignette(ctx);
}
export function vignette(ctx, k = .6) {
  const v = ctx.createRadialGradient(W / 2, H * .55, H * .32, W / 2, H * .55, H * .85); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${k})`);
  ctx.fillStyle = v; ctx.fillRect(-W, -H, W * 3, H * 3);
}

// ---------- small text helpers ----------
export function caps(ctx, s, x, y, size = 22, col = 'rgba(230,236,226,.9)', align = 'left', a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.letterSpacing = '4px'; txt(ctx, s, x, y, size, col, 700, align, MONO); ctx.restore();
}
// label with a leader line from (x,y) to target (tx,ty) - the reference's thin "callout" style
export function callout(ctx, s, x, y, tx, ty, a = 1, { col = '255,255,255', align = 'left', size = 22 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a);
  const k = eo(a), w = tw(ctx, s, size, 700, MONO) + s.length * 4;
  const bx = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  ctx.strokeStyle = `rgba(${col},.75)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + 12); ctx.lineTo(lerp(x, tx, k), lerp(y + 12, ty, k)); ctx.stroke();
  ctx.fillStyle = `rgba(${col},1)`; ctx.beginPath(); ctx.arc(tx, ty, 6 * k, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(8,10,12,.72)'; rr(ctx, bx - 12, y - size - 6, w + 24, size + 22, 8); ctx.fill();
  caps(ctx, s, bx, y, size, `rgba(${col},1)`, 'left');
  ctx.restore();
}
// big stroked headline number/word
export function big(ctx, s, x, y, size, col = '#fff', glowRGB = null, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = FONT(900, size); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(4,6,8,.85)'; ctx.lineWidth = size * .14; ctx.strokeText(s, x, y);
  if (glowRGB) { ctx.shadowColor = `rgba(${glowRGB},.7)`; ctx.shadowBlur = 34; }
  ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore();
}

// ---------- AI chat bubble + light paths ----------
export function bubble(ctx, T, x, y, s = 1, { a = 1, glow = 1, col = LIME, rgb = LIME_RGB } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  if (glow > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y, 150 * s, rgb, glow * (.8 + .2 * Math.sin(T * 4))); ctx.restore(); }
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.shadowColor = `rgba(${rgb},.8)`; ctx.shadowBlur = 26 * glow;
  rr(ctx, -62, -40, 124, 72, 16); ctx.fillStyle = col; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-34, 30); ctx.lineTo(-44, 52); ctx.lineTo(-14, 30); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(40,52,10,.75)'; rr(ctx, -40, -20, 80, 9, 4.5); ctx.fill(); rr(ctx, -40, -2, 56, 9, 4.5); ctx.fill();
  const hg = ctx.createLinearGradient(0, -40, 0, 0); hg.addColorStop(0, 'rgba(255,255,255,.45)'); hg.addColorStop(1, 'rgba(255,255,255,0)'); rr(ctx, -60, -38, 120, 30, 14); ctx.fillStyle = hg; ctx.fill();
  ctx.restore();
}
// sample a cubic bezier; returns point at u
export const bz = (u, p0, p1, p2, p3) => { const v = 1 - u; return [0, 1].map(k => v * v * v * p0[k] + 3 * v * v * u * p1[k] + 3 * v * u * u * p2[k] + u * u * u * p3[k]); };
// glowing light trail along a bezier from u0 to u1 (0..1)
export function trail(ctx, P, u0, u1, a = 1, rgb = LIME_RGB, w = 5) {
  if (a <= 0 || u1 <= u0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  const pts = []; for (let i = 0; i <= 60; i++) { const u = lerp(u0, u1, i / 60); pts.push(bz(u, ...P)); }
  for (const [lw, al] of [[w * 6, .08], [w * 2.4, .22], [w, .95]]) {
    ctx.strokeStyle = `rgba(${rgb},${al * a})`; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
  }
  ctx.restore();
}

// ---------- laptop ----------
// Front 3/4 laptop. (cx, cy) = hinge centre, w = lid width. screen(ctx, x, y, w, h) draws the display.
// xray 0..1 turns the deck into glass and shows the board (fans, copper pipes, RTX Spark chip).
export function laptop(ctx, T, cx, cy, w, { screen = null, xray = 0, a = 1, chipGlow = 0, lid = '#1d2026', deck = ['#d7dbe1', '#a9afb8'] } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  const lh = w * .63, D = w * .34, fw = w * 1.12, th = w * .022;
  const Q = (u, v) => { const half = lerp(w, fw, v) / 2; return [cx + (u - .5) * 2 * half, cy + v * D]; };
  const quad = (u0, v0, u1, v1) => { const p = [Q(u0, v0), Q(u1, v0), Q(u1, v1), Q(u0, v1)]; ctx.beginPath(); p.forEach((q, i) => i ? ctx.lineTo(...q) : ctx.moveTo(...q)); ctx.closePath(); };
  // contact shadow
  const sg = ctx.createRadialGradient(cx, cy + D + 10, 10, cx, cy + D + 10, fw * .62); sg.addColorStop(0, 'rgba(0,0,0,.55)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); ctx.translate(cx, cy + D + 10); ctx.scale(1, .16); ctx.translate(-cx, -(cy + D + 10)); ctx.fillStyle = sg; ctx.fillRect(cx - fw, cy + D + 10 - fw * .62, fw * 2, fw * 1.24); ctx.restore();
  // deck front edge (thickness)
  ctx.fillStyle = '#7d838c'; ctx.beginPath(); ctx.moveTo(...Q(0, 1)); ctx.lineTo(...Q(1, 1)); ctx.lineTo(Q(1, 1)[0] - 6, Q(1, 1)[1] + th); ctx.lineTo(Q(0, 1)[0] + 6, Q(0, 1)[1] + th); ctx.closePath(); ctx.fill();
  // deck top
  let g = ctx.createLinearGradient(0, cy, 0, cy + D); g.addColorStop(0, deck[0]); g.addColorStop(1, deck[1]);
  quad(0, 0, 1, 1); ctx.fillStyle = g; ctx.fill();
  const solid = 1 - xray;
  if (solid > 0) {
    ctx.save(); ctx.globalAlpha *= solid;
    quad(.07, .07, .93, .55); ctx.fillStyle = 'rgba(30,33,38,.9)'; ctx.fill();
    const cols = 14, rows = 5;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const u0 = .08 + c * (.84 / cols), v0 = .085 + r * (.45 / rows);
      quad(u0 + .004, v0 + .01, u0 + .84 / cols - .004, v0 + .45 / rows - .01); ctx.fillStyle = '#121418'; ctx.fill();
    }
    quad(.34, .63, .66, .93); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }
  if (xray > 0) {
    ctx.save(); ctx.globalAlpha *= xray;
    quad(0, 0, 1, 1); g = ctx.createLinearGradient(0, cy, 0, cy + D); g.addColorStop(0, 'rgba(18,30,30,.97)'); g.addColorStop(1, 'rgba(10,20,22,.97)'); ctx.fillStyle = g; ctx.fill();
    ctx.save(); quad(0, 0, 1, 1); ctx.clip();
    // board traces
    ctx.strokeStyle = 'rgba(120,220,200,.16)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 18; i++) { const v = .08 + i * .05; ctx.beginPath(); ctx.moveTo(...Q(.05, v)); ctx.lineTo(...Q(.95, v)); ctx.stroke(); }
    // fans
    for (const fu of [.2, .8]) {
      const [fx, fy] = Q(fu, .36), rx = w * .1, ry = D * .26;
      ctx.fillStyle = '#0b1214'; ctx.beginPath(); ctx.ellipse(fx, fy, rx, ry, 0, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(160,200,210,.35)'; ctx.lineWidth = 2; ctx.stroke();
      for (let b = 0; b < 9; b++) { const an = b / 9 * 6.283 + T * 6; ctx.strokeStyle = 'rgba(160,190,200,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.quadraticCurveTo(fx + Math.cos(an + .4) * rx * .7, fy + Math.sin(an + .4) * ry * .7, fx + Math.cos(an) * rx * .92, fy + Math.sin(an) * ry * .92); ctx.stroke(); }
    }
    // copper heat pipes
    ctx.lineCap = 'round';
    for (const dv of [-.05, .05]) { ctx.strokeStyle = '#b8642e'; ctx.lineWidth = w * .016; ctx.beginPath(); ctx.moveTo(...Q(.2, .36 + dv)); ctx.lineTo(...Q(.8, .36 + dv)); ctx.stroke(); ctx.strokeStyle = 'rgba(255,190,140,.5)'; ctx.lineWidth = w * .004; ctx.stroke(); }
    // memory + battery
    for (const mu of [.37, .58]) { quad(mu, .14, mu + .05, .24); ctx.fillStyle = '#2b4c46'; ctx.fill(); }
    quad(.15, .66, .85, .95); ctx.fillStyle = 'rgba(40,46,52,.9)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.stroke();
    ctx.restore();
    // chip
    const [chx, chy] = Q(.5, .38);
    if (chipGlow > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, chx, chy, w * .3, NV_RGB, chipGlow); ctx.restore(); }
    ctx.save(); ctx.translate(chx, chy); ctx.scale(1, D / (w * .5)); chip(ctx, T, 0, 0, w * .2, { gpu: chipGlow, tilt: 0 }); ctx.restore();
    ctx.restore();
  }
  quad(0, 0, 1, 1); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5; ctx.stroke();
  // lid
  const lx = cx - w / 2, ly = cy - lh;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; rr(ctx, lx, ly, w, lh, w * .03); ctx.fillStyle = lid; ctx.fill(); ctx.restore();
  rr(ctx, lx, ly, w, lh, w * .03); ctx.strokeStyle = 'rgba(200,205,215,.55)'; ctx.lineWidth = 2.5; ctx.stroke();
  const m = w * .03, sx = lx + m, sy = ly + m, sw = w - 2 * m, sh = lh - m * 1.9;
  rr(ctx, sx, sy, sw, sh, w * .01); ctx.fillStyle = '#07090b'; ctx.fill();
  if (screen) { ctx.save(); rr(ctx, sx, sy, sw, sh, w * .01); ctx.clip(); screen(ctx, sx, sy, sw, sh); ctx.restore(); }
  // glare
  ctx.save(); rr(ctx, sx, sy, sw, sh, w * .01); ctx.clip(); g = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh); g.addColorStop(0, 'rgba(255,255,255,.07)'); g.addColorStop(.4, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(sx, sy, sw, sh); ctx.restore();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, ly + m * .5, 3, 0, 7); ctx.fill();
  // hinge
  ctx.fillStyle = '#2a2d33'; rr(ctx, cx - w * .45, cy - 4, w * .9, 8, 4); ctx.fill();
  ctx.restore();
  return { sx, sy, sw, sh, Q, chipAt: Q(.5, .38) };
}

// Chat app screen (dark): sidebar, greeting, optional messages, "Ask anything" input with a send button.
// o.msgs: [{ me: bool, lines: n, a, w }]; o.typed: text in the input; o.title
export function chatUI(ctx, T, x, y, w, h, o = {}) {
  const { msgs = [], typed = '', hint = 'Ask anything', greet = 1, inputA = 1, accent = LIME } = o, u = w / 600;
  ctx.fillStyle = '#0e1114'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#14181c'; ctx.fillRect(x, y, w * .2, h);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = i === 0 ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.12)'; rr(ctx, x + 14 * u, y + (24 + i * 22) * u, w * (.12 - .01 * (i % 3)), 7 * u, 3.5 * u); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,.12)'; rr(ctx, x + w - 120 * u, y + 16 * u, 100 * u, 18 * u, 9 * u); ctx.fill();
  const cx = x + w * .6;
  if (greet > 0 && !msgs.length) { ctx.save(); ctx.globalAlpha *= greet; txt(ctx, 'What can I help with?', cx, y + h * .42, 22 * u, 'rgba(255,255,255,.8)', 600); ctx.restore(); }
  let my = y + 60 * u;
  msgs.forEach(m => {
    if (m.a <= 0) { return; }
    ctx.save(); ctx.globalAlpha *= m.a; const bw = (m.w || .5) * w * .7, bh = (14 + 14 * m.lines) * u;
    const bx = m.me ? x + w - bw - 22 * u : x + w * .25; const yy = my + (1 - eo(m.a)) * 14;
    rr(ctx, bx, yy, bw, bh, 10 * u); ctx.fillStyle = m.me ? 'rgba(255,255,255,.13)' : 'rgba(255,255,255,0)'; ctx.fill();
    for (let l = 0; l < m.lines; l++) { ctx.fillStyle = m.me ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.55)'; rr(ctx, bx + 10 * u, yy + (10 + l * 14) * u, (bw - 20 * u) * (l === m.lines - 1 ? .6 : 1), 6 * u, 3 * u); ctx.fill(); }
    if (m.check) { ctx.fillStyle = `rgba(${NV_RGB},${m.check})`; ctx.beginPath(); ctx.arc(bx - 12 * u, yy + 13 * u, 6 * u, 0, 7); ctx.fill(); }
    ctx.restore(); my += bh + 12 * u;
  });
  if (inputA > 0) {
    ctx.save(); ctx.globalAlpha *= inputA; const iw = w * .66, ix = cx - iw / 2, iy = y + h - 64 * u;
    rr(ctx, ix, iy, iw, 40 * u, 20 * u); ctx.fillStyle = '#1b2025'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1.5; ctx.stroke();
    txt(ctx, typed || hint, ix + 18 * u, iy + 26 * u, 15 * u, typed ? '#fff' : 'rgba(255,255,255,.4)', typed ? 700 : 500, 'left');
    if (typed && Math.sin(T * 9) > 0) { ctx.fillStyle = '#fff'; ctx.fillRect(ix + 20 * u + tw(ctx, typed, 15 * u, 700), iy + 11 * u, 2, 19 * u); }
    ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(ix + iw - 20 * u, iy + 20 * u, 13 * u, 0, 7); ctx.fill();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5 * u; ctx.beginPath(); ctx.moveTo(ix + iw - 20 * u, iy + 27 * u); ctx.lineTo(ix + iw - 20 * u, iy + 13 * u); ctx.moveTo(ix + iw - 26 * u, iy + 19 * u); ctx.lineTo(ix + iw - 20 * u, iy + 13 * u); ctx.lineTo(ix + iw - 14 * u, iy + 19 * u); ctx.stroke();
    ctx.restore();
  }
}

// ---------- RTX Spark chip package (top-down) ----------
// cores: number of the 20 Grace CPU cores lit (0..20). gpu: Blackwell die fill 0..1. tilt: pseudo-3D lean.
export function chip(ctx, T, x, y, s, { cores = 20, gpu = 1, cpuA = 1, gpuA = 1, tilt = .25, frame = 1, hiCPU = 0, hiGPU = 0, coreFill = null } = {}) {
  ctx.save(); ctx.translate(x, y);
  if (tilt) ctx.transform(1, 0, -tilt * .5, 1 - tilt * .35, 0, 0);
  const W2 = s, H2 = s * 1.25;
  // substrate
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = s * .18; ctx.shadowOffsetY = s * .06;
  rr(ctx, -W2 / 2, -H2 / 2, W2, H2, s * .05); ctx.fillStyle = '#1a2a22'; ctx.fill(); ctx.restore();
  const sg = ctx.createLinearGradient(-W2 / 2, -H2 / 2, W2 / 2, H2 / 2); sg.addColorStop(0, '#d8b54a'); sg.addColorStop(.5, '#f6e39a'); sg.addColorStop(1, '#a7832c');
  rr(ctx, -W2 / 2, -H2 / 2, W2, H2, s * .05); ctx.strokeStyle = sg; ctx.lineWidth = s * .022; ctx.stroke();
  // silver frame
  if (frame > 0) {
    const f = s * .07; ctx.save(); ctx.globalAlpha *= frame;
    const fg = ctx.createLinearGradient(0, -H2 / 2, 0, H2 / 2); fg.addColorStop(0, '#f2f3f0'); fg.addColorStop(1, '#c9ccc6');
    rr(ctx, -W2 / 2 + f, -H2 / 2 + f, W2 - 2 * f, H2 - 2 * f, s * .03); ctx.fillStyle = fg; ctx.fill(); ctx.restore();
  }
  // GPU die (top)
  const gx = -W2 * .34, gy = -H2 * .38, gw = W2 * .68, gh = H2 * .44;
  ctx.save(); ctx.globalAlpha *= gpuA;
  rr(ctx, gx - s * .02, gy - s * .02, gw + s * .04, gh + s * .04, s * .02); ctx.fillStyle = '#0c0f0e'; ctx.fill();
  rr(ctx, gx, gy, gw, gh, s * .012); ctx.fillStyle = '#111a14'; ctx.fill();
  if (gpu > 0) {
    ctx.save(); rr(ctx, gx, gy, gw, gh, s * .012); ctx.clip();
    const lvl = gy + gh * (1 - clamp(gpu)), n = 28, cw = gw / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < Math.round(n * gh / gw); j++) {
      const cy = gy + j * cw; if (cy + cw < lvl) continue;
      const sh = .55 + .45 * Math.sin(T * 3 + i * .5 - j * .4 + hash(i, j) * 2);
      ctx.fillStyle = `rgba(${Math.round(90 + 60 * sh)},${Math.round(170 + 60 * sh)},${Math.round(20 + 20 * sh)},.95)`;
      ctx.fillRect(gx + i * cw + .6, cy + .6, cw - 1.2, cw - 1.2);
    }
    // diagonal sheen
    const sp = ((T * .35) % 1.6) - .3, lg = ctx.createLinearGradient(gx, gy, gx + gw, gy + gh); lg.addColorStop(clamp(sp - .1), 'rgba(255,255,255,0)'); lg.addColorStop(clamp(sp), 'rgba(255,255,255,.22)'); lg.addColorStop(clamp(sp + .1), 'rgba(255,255,255,0)');
    ctx.fillStyle = lg; ctx.fillRect(gx, gy, gw, gh);
    ctx.restore();
  } else { // idle die stripes
    ctx.save(); rr(ctx, gx, gy, gw, gh, s * .012); ctx.clip(); ctx.strokeStyle = 'rgba(118,185,0,.12)'; ctx.lineWidth = s * .04;
    for (let k = -6; k < 10; k++) { ctx.beginPath(); ctx.moveTo(gx + k * s * .1 + (T * 10) % (s * .1), gy); ctx.lineTo(gx + k * s * .1 - gh + (T * 10) % (s * .1), gy + gh); ctx.stroke(); } ctx.restore();
  }
  if (hiGPU > 0) { rr(ctx, gx - s * .03, gy - s * .03, gw + s * .06, gh + s * .06, s * .03); ctx.strokeStyle = `rgba(${LIME_RGB},${hiGPU})`; ctx.lineWidth = s * .012; ctx.stroke(); }
  ctx.restore();
  // CPU die (bottom) with 5x4 cores
  const cx0 = -W2 * .34, cy0 = H2 * .12, cw0 = W2 * .68, ch0 = H2 * .3;
  ctx.save(); ctx.globalAlpha *= cpuA;
  rr(ctx, cx0 - s * .02, cy0 - s * .02, cw0 + s * .04, ch0 + s * .04, s * .02); ctx.fillStyle = '#0c0f0e'; ctx.fill();
  const nc = 5, nr = 4, pw = cw0 / nc, ph = ch0 / nr;
  for (let r = 0; r < nr; r++) for (let c = 0; c < nc; c++) {
    const i = r * nc + c, on = coreFill ? coreFill(i) : (i < cores ? 1 : 0);
    const px = cx0 + c * pw + s * .008, py = cy0 + r * ph + s * .008, w0 = pw - s * .016, h0 = ph - s * .016;
    const pg = ctx.createLinearGradient(px, py, px, py + h0); pg.addColorStop(0, on ? `rgba(${lerp(150, 200, on)},${lerp(165, 225, on)},${lerp(190, 255, on)},1)` : '#5b6573'); pg.addColorStop(1, on ? `rgba(${lerp(100, 120, on)},${lerp(115, 150, on)},${lerp(140, 220, on)},1)` : '#3b434e');
    rr(ctx, px, py, w0, h0, s * .01); ctx.fillStyle = pg; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(px + w0 * .15, py + h0 * .2, w0 * .3, h0 * .12); ctx.fillRect(px + w0 * .55, py + h0 * .6, w0 * .3, h0 * .12);
    if (on && coreFill) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(150,200,255,${.25 * on})`; rr(ctx, px, py, w0, h0, s * .01); ctx.fill(); ctx.restore(); }
  }
  if (hiCPU > 0) { rr(ctx, cx0 - s * .03, cy0 - s * .03, cw0 + s * .06, ch0 + s * .06, s * .03); ctx.strokeStyle = `rgba(150,200,255,${hiCPU})`; ctx.lineWidth = s * .012; ctx.stroke(); }
  ctx.restore();
  ctx.restore();
  return { gpu: [x + gx + gw / 2, y + gy + gh / 2], cpu: [x + cx0 + cw0 / 2, y + cy0 + ch0 / 2] };
}

// ---------- data center ----------
export function dataCenter(ctx, T, x, y, s, { lit = 0, a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createRadialGradient(0, -40, 10, 0, -40, 520); g.addColorStop(0, `rgba(170,210,255,${.18 + .2 * lit})`); g.addColorStop(1, 'rgba(170,210,255,0)'); ctx.fillStyle = g; ctx.fillRect(-600, -500, 1200, 900);
  // main hall
  ctx.fillStyle = '#c9d1d9'; ctx.beginPath(); ctx.moveTo(-380, 0); ctx.lineTo(-380, -120); ctx.lineTo(380, -120); ctx.lineTo(380, 0); ctx.fill();
  ctx.fillStyle = '#9aa4ae'; ctx.beginPath(); ctx.moveTo(-380, -120); ctx.lineTo(-330, -150); ctx.lineTo(430, -150); ctx.lineTo(380, -120); ctx.fill();
  ctx.fillStyle = '#7d8791'; ctx.beginPath(); ctx.moveTo(380, 0); ctx.lineTo(380, -120); ctx.lineTo(430, -150); ctx.lineTo(430, -30); ctx.fill();
  for (let i = 0; i < 16; i++) { const on = .3 + .7 * clamp(lit * 1.4 - hash(i, 3) * .4); ctx.fillStyle = `rgba(${lerp(60, 230, on)},${lerp(70, 250, on)},${lerp(80, 255, on)},1)`; ctx.fillRect(-350 + i * 44, -92, 30, 46); }
  // rooftop units + antenna
  for (let i = 0; i < 6; i++) { ctx.fillStyle = '#5f6973'; ctx.fillRect(-300 + i * 110, -172, 70, 26); }
  ctx.fillStyle = '#e8edf2'; ctx.fillRect(-80, -128, 160, 34); txt(ctx, 'DATA CENTER', 0, -104, 18, '#26303a', 800, 'center', MONO);
  ctx.fillStyle = `rgba(255,80,80,${.5 + .5 * Math.sin(T * 4)})`; ctx.beginPath(); ctx.arc(330, -200, 6, 0, 7); ctx.fill(); ctx.fillStyle = '#5f6973'; ctx.fillRect(328, -196, 4, 30);
  ctx.restore();
}
// front view of a server rack (racks of blinking units)
export function rack(ctx, T, x, y, w, h, { act = 0, a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  card(ctx, x, y, w, h, { r: 14, fill: '#e9edf0', dark: true, stroke: 'rgba(255,255,255,.5)' });
  rr(ctx, x + w * .07, y + w * .07, w * .86, h - w * .14, 8); ctx.fillStyle = '#121619'; ctx.fill();
  const n = 14, uh = (h - w * .2) / n;
  for (let i = 0; i < n; i++) {
    const uy = y + w * .1 + i * uh; rr(ctx, x + w * .1, uy, w * .8, uh - 5, 4); ctx.fillStyle = '#1e2429'; ctx.fill();
    for (let k = 0; k < 10; k++) { ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(x + w * .14 + k * w * .05, uy + 6, w * .03, uh - 17); }
    for (let k = 0; k < 3; k++) { const on = Math.sin(T * (5 + hash(i, k) * 9) + i * 3 + k) > .2 - act; ctx.fillStyle = on ? (k === 2 ? `rgba(${LIME_RGB},1)` : 'rgba(110,220,140,1)') : 'rgba(60,70,60,1)'; ctx.beginPath(); ctx.arc(x + w * .74 + k * w * .045, uy + uh / 2 - 2, 3.5, 0, 7); ctx.fill(); }
  }
  ctx.restore();
}

// ---------- petaflop core floor (perspective grid of green cells) ----------
export function coreFloor(ctx, T, { horizon = 700, n = 34, wave = 1, lit = 1, cx = W / 2, spread = 1 } = {}) {
  for (let j = n; j >= 0; j--) {
    const z0 = 1 + j * .45, z1 = 1 + (j + 1) * .45, y0 = horizon + 1400 / z1, y1 = horizon + 1400 / z0;
    for (let i = -n; i < n; i++) {
      const xa = cx + i * 120 * spread / z0, xb = cx + (i + 1) * 120 * spread / z0, xc = cx + (i + 1) * 120 * spread / z1, xd = cx + i * 120 * spread / z1;
      if (Math.max(xa, xb) < -50 || Math.min(xa, xb) > W + 50) continue;
      const on = clamp(lit * (1 + hash(i, j)) - hash(i + 3, j) * .8), sh = .5 + .5 * Math.sin(T * 4 * wave - j * .7 + i * .3 + hash(i, j) * 3);
      const fog = clamp(1.2 - j / n);
      const g = Math.round(lerp(60, 230, on * (.55 + .45 * sh)));
      ctx.fillStyle = `rgba(${Math.round(g * .55)},${g},${Math.round(g * .1)},${.95 * fog})`;
      const gap = .1, m = (a, b) => lerp(a, b, gap);
      ctx.beginPath(); ctx.moveTo(m(xd, xc), m(y0, y0) + (y1 - y0) * gap); ctx.lineTo(m(xc, xd), y0 + (y1 - y0) * gap); ctx.lineTo(m(xb, xa), y1 - (y1 - y0) * gap * .5); ctx.lineTo(m(xa, xb), y1 - (y1 - y0) * gap * .5); ctx.closePath(); ctx.fill();
    }
  }
}

// ---------- memory board (top-down) ----------
// pool 0 = split (CPU memory | GPU memory), 1 = one shared pool around a single chip
export function memBoard(ctx, T, x, y, w, { pool = 0, fill = 0, a = 1, model = 0, modelY = 0, fits = 0, cpuHi = 0, gpuHi = 0 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  const h = w * .62;
  card(ctx, x - w / 2, y - h / 2, w, h, { r: 26, fill: '#0f1c19', dark: true, stroke: 'rgba(120,220,200,.25)' });
  ctx.save(); rr(ctx, x - w / 2, y - h / 2, w, h, 26); ctx.clip();
  ctx.strokeStyle = 'rgba(120,220,200,.10)'; ctx.lineWidth = 2;
  for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.moveTo(x - w / 2, y - h / 2 + i * h / 15); ctx.lineTo(x + w / 2, y - h / 2 + i * h / 15 + 30 * Math.sin(i)); ctx.stroke(); }
  ctx.restore();
  // memory modules: positions lerp from split (two groups) to one pool (single bar)
  const mw = w * .36, mh = h * .5, my = y - h * .02;
  const L = [lerp(x - w * .27, x - w * .2, pool), my], R = [lerp(x + w * .27, x + w * .2, pool), my];
  const block = (cx, cy, bw, bh, lab, rgb, hi, fl) => {
    rr(ctx, cx - bw / 2, cy - bh / 2, bw, bh, 12); ctx.fillStyle = `rgba(${rgb},.12)`; ctx.fill(); ctx.strokeStyle = `rgba(${rgb},${.5 + .5 * hi})`; ctx.lineWidth = 2.5 + 3 * hi; ctx.stroke();
    const cols = 5, rows = 6, cwid = (bw - 24) / cols, chh = (bh - 24) / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const k = (r * cols + c) / (rows * cols), on = k < fl ? 1 : 0; rr(ctx, cx - bw / 2 + 12 + c * cwid + 2, cy - bh / 2 + 12 + r * chh + 2, cwid - 4, chh - 4, 4); ctx.fillStyle = on ? `rgba(${rgb},${.55 + .3 * Math.sin(T * 3 + r + c)})` : `rgba(${rgb},.18)`; ctx.fill(); }
    if (lab) caps(ctx, lab, cx, cy - bh / 2 - 16, 20, `rgba(${rgb},1)`, 'center');
  };
  const split = 1 - pool;
  if (split > .01) { ctx.save(); ctx.globalAlpha *= split; block(L[0], L[1], mw, mh, 'CPU MEMORY', '150,200,255', cpuHi, .45); block(R[0], R[1], mw, mh, 'GPU MEMORY', `${TEAL_RGB}`, gpuHi, .45); ctx.restore(); }
  if (pool > .01) { ctx.save(); ctx.globalAlpha *= pool; block(x, my, w * .86, mh, 'ONE SHARED POOL', TEAL_RGB, .3, fill); ctx.restore(); }
  // chips: two chips (split) -> one chip (pool)
  const chipS = w * .14;
  if (split > .01) {
    ctx.save(); ctx.globalAlpha *= split;
    const proc = (cx, lab, rgb) => { rr(ctx, cx - chipS / 2, my - chipS / 2, chipS, chipS, 10); ctx.fillStyle = '#d9dcd6'; ctx.fill(); rr(ctx, cx - chipS * .32, my - chipS * .32, chipS * .64, chipS * .64, 6); ctx.fillStyle = '#20262c'; ctx.fill(); txt(ctx, lab, cx, my + 8, chipS * .2, `rgb(${rgb})`, 800, 'center', MONO); };
    proc(x - w * .07, 'CPU', '150,200,255'); proc(x + w * .07, 'GPU', TEAL_RGB);
    ctx.strokeStyle = 'rgba(255,200,120,.8)'; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -T * 40; ctx.beginPath(); ctx.moveTo(x - w * .07 + chipS / 2, my); ctx.lineTo(x + w * .07 - chipS / 2, my); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  }
  if (pool > .01) { ctx.save(); ctx.globalAlpha *= pool; chip(ctx, T, x, my, chipS * 1.15, { tilt: 0, gpu: 1 }); ctx.restore(); }
  // AI model block dropping into the pool
  if (model > 0) {
    const bw = w * .3, bh = mh * .62, bx = x + w * .2 * pool + (1 - pool) * w * .27, by = lerp(y - h * 1.1, my, clamp(modelY));
    ctx.save(); ctx.globalAlpha *= model;
    ctx.save(); ctx.shadowColor = `rgba(${LIME_RGB},.6)`; ctx.shadowBlur = 30; rr(ctx, bx - bw / 2, by - bh / 2, bw, bh, 14); ctx.fillStyle = 'rgba(244,246,240,.96)'; ctx.fill(); ctx.restore();
    for (let i = 0; i < 9; i++) for (let j = 0; j < 5; j++) { ctx.fillStyle = `rgba(30,40,30,${.15 + .25 * hash(i, j)})`; ctx.fillRect(bx - bw / 2 + 14 + i * (bw - 28) / 9, by - bh / 2 + 14 + j * (bh - 28) / 5, (bw - 28) / 9 - 4, (bh - 28) / 5 - 4); }
    bubble(ctx, T, bx, by, .7, { glow: .4 });
    caps(ctx, 'AI MODEL', bx, by - bh / 2 - 14, 20, `rgba(${LIME_RGB},1)`, 'center');
    if (fits > 0) { ctx.strokeStyle = `rgba(${NV_RGB},${fits})`; ctx.lineWidth = 6; rr(ctx, bx - bw / 2 - 8, by - bh / 2 - 8, bw + 16, bh + 16, 18); ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();
  return { h, my };
}

// ---------- retro Windows app window ----------
export function winApp(ctx, x, y, w, h, title, body, { a = 1, active = true } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; ctx.fillStyle = '#e9ebef'; ctx.fillRect(x, y, w, h); ctx.restore();
  const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, active ? '#1d3f9a' : '#7a8190'); g.addColorStop(1, active ? '#5d8ee6' : '#b5bac4');
  const tb = Math.max(22, h * .09); ctx.fillStyle = g; ctx.fillRect(x + 3, y + 3, w - 6, tb);
  txt(ctx, title, x + 12, y + 3 + tb * .7, tb * .6, '#fff', 700, 'left');
  for (let i = 0; i < 3; i++) { ctx.fillStyle = '#d6d9de'; ctx.fillRect(x + w - 10 - (i + 1) * (tb * .85), y + 6, tb * .75, tb - 6); }
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.5; ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
  ctx.save(); ctx.beginPath(); ctx.rect(x + 4, y + tb + 5, w - 8, h - tb - 9); ctx.clip(); body(ctx, x + 4, y + tb + 5, w - 8, h - tb - 9); ctx.restore();
  ctx.restore();
}
// generic app body: rows of grey bars + a folder grid
export function appBody(kind) {
  return (ctx, x, y, w, h) => {
    ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, h);
    if (kind === 'folders') { for (let i = 0; i < 8; i++) { const fx = x + 14 + (i % 4) * (w - 28) / 4, fy = y + 16 + Math.floor(i / 4) * h * .45; ctx.fillStyle = '#f2c14e'; rr(ctx, fx, fy + 6, (w - 28) / 4 - 14, h * .28, 4); ctx.fill(); ctx.fillStyle = '#e0a92e'; rr(ctx, fx, fy, (w - 28) / 8, 10, 3); ctx.fill(); } return; }
    for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 3 === 0 ? 'rgba(30,60,140,.5)' : 'rgba(0,0,0,.18)'; ctx.fillRect(x + 10, y + 10 + i * (h - 16) / 9, (w - 20) * (.4 + .5 * hash(i, kind.length)), Math.max(3, (h - 16) / 9 * .45)); }
  };
}
// assembly code body for the old app window
export function asmBody(lines, { size = 30, col = '#1a1d24', hl = -1, hlCol = 'rgba(80,230,190,.35)', n = 1e9 } = {}) {
  return (ctx, x, y, w, h) => {
    ctx.fillStyle = '#fbfbf8'; ctx.fillRect(x, y, w, h);
    lines.forEach((l, i) => { const yy = y + size * 1.6 + i * size * 1.45; if (i === hl) { ctx.fillStyle = hlCol; ctx.fillRect(x + 8, yy - size, w - 16, size * 1.3); }
      txt(ctx, String(i + 1), x + 18, yy, size * .6, 'rgba(0,0,0,.3)', 600, 'left', MONO); txt(ctx, l.slice(0, Math.max(0, Math.floor(n - i * 40))), x + 52, yy, size, col, 600, 'left', MONO); });
  };
}

// ---------- photos & clip ----------
// draw image `name` cover-fitted into a rounded card (with a slow Ken Burns push given by `zoom`, offset ox/oy in 0..1)
export function photo(ctx, name, x, y, w, h, { r = 28, zoom = 1, ox = .5, oy = .5, a = 1, border = 'rgba(255,255,255,.18)', shadow = 1 } = {}) {
  const im = IMG[name]; if (!im || a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  if (shadow) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.65)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 30; rr(ctx, x, y, w, h, r); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore(); }
  ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip();
  const s = Math.max(w / im.width, h / im.height) * zoom, iw = im.width * s, ih = im.height * s;
  ctx.drawImage(im, x + (w - iw) * ox, y + (h - ih) * oy, iw, ih);
  const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, 'rgba(255,255,255,.08)'); g.addColorStop(.35, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.restore();
  rr(ctx, x, y, w, h, r); ctx.strokeStyle = border; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}
export const CLIP_FRAMES = 485;
export const clipName = (t) => 'clip/' + String(1 + Math.max(0, Math.min(CLIP_FRAMES - 1, Math.floor(t * 30)))).padStart(4, '0');

// ---------- glass prism (Microsoft Prism translator) ----------
export function prism(ctx, T, x, y, s, { a = 1, beam = 0 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
  const p = [[0, -s * .62], [s * .56, s * .4], [-s * .56, s * .4]];
  if (beam > 0) { // rainbow fan out of the right face
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ['255,80,80', '255,170,60', '240,240,80', '90,230,120', '80,170,255', '170,110,255'].forEach((c, i) => {
      const g = ctx.createLinearGradient(s * .3, 0, s * 1.6, 0); g.addColorStop(0, `rgba(${c},${.55 * beam})`); g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(s * .26, -s * .04 + i * 4); ctx.lineTo(s * 1.7, -s * .2 + i * s * .1); ctx.lineTo(s * 1.7, -s * .2 + (i + 1) * s * .1); ctx.lineTo(s * .26, i * 4); ctx.fill();
    });
    ctx.restore();
  }
  const g = ctx.createLinearGradient(-s * .5, -s * .6, s * .5, s * .4); g.addColorStop(0, 'rgba(200,240,255,.35)'); g.addColorStop(.5, 'rgba(120,180,220,.12)'); g.addColorStop(1, 'rgba(220,250,255,.3)');
  ctx.beginPath(); p.forEach((q, i) => i ? ctx.lineTo(...q) : ctx.moveTo(...q)); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(220,245,255,.85)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(...p[0]); ctx.lineTo(s * .05, s * .4); ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 2; ctx.stroke();
  const sp = (T * .5) % 1; ctx.save(); ctx.clip(); ctx.restore();
  ctx.fillStyle = `rgba(255,255,255,${.35 + .2 * Math.sin(T * 3)})`; ctx.beginPath(); ctx.arc(lerp(p[0][0], p[1][0], sp), lerp(p[0][1], p[1][1], sp), 4, 0, 7); ctx.fill();
  ctx.restore();
}

// ---------- icons ----------
export function wifi(ctx, x, y, s, col, k = 1) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = s * .12;
  for (let i = 0; i < 3; i++) { if (k < (i + 1) / 3 - .2) continue; ctx.beginPath(); ctx.arc(x, y + s * .35, s * (.3 + i * .28), -Math.PI * .75, -Math.PI * .25); ctx.stroke(); }
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y + s * .35, s * .09, 0, 7); ctx.fill(); ctx.restore();
}
export function spinner(ctx, T, x, y, r, col) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = r * .22;
  for (let i = 0; i < 8; i++) { const an = i / 8 * 6.283 + Math.floor(T * 10) / 8 * 6.283; ctx.strokeStyle = col.replace('A', String(.15 + .85 * (i / 8))); ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r * .5, y + Math.sin(an) * r * .5); ctx.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r); ctx.stroke(); }
  ctx.restore();
}
export function fileIcon(ctx, x, y, s, col = '#f4f6f8') {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-s * .4, -s * .5); ctx.lineTo(s * .18, -s * .5); ctx.lineTo(s * .4, -s * .28); ctx.lineTo(s * .4, s * .5); ctx.lineTo(-s * .4, s * .5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.moveTo(s * .18, -s * .5); ctx.lineTo(s * .18, -s * .28); ctx.lineTo(s * .4, -s * .28); ctx.fill();
  ctx.fillStyle = 'rgba(30,40,60,.45)'; for (let i = 0; i < 4; i++) ctx.fillRect(-s * .26, -s * .12 + i * s * .14, s * (i === 3 ? .3 : .52), s * .05);
  ctx.restore();
}
// flip-calendar tile pair (month + day) with a half-flip between values
export function flipCal(ctx, T, x, y, s, from, to, k) {
  const tile = (cx, w, a, b) => {
    const h = s; rr(ctx, cx - w / 2, y - h / 2, w, h, 16); ctx.fillStyle = '#16191d'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.stroke();
    const cur = k < .5 ? a : b, sq = Math.abs(Math.cos(clamp(k) * Math.PI));
    ctx.save(); ctx.translate(cx, y); ctx.scale(1, Math.max(.02, sq)); txt(ctx, cur, 0, s * .2, s * (cur.length > 2 ? .4 : .58), '#fff', 900, 'center', MONO); ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(cx - w / 2, y - 1.5, w, 3);
  };
  tile(x - s * .62, s * 1.2, from[0], to[0]); tile(x + s * .62, s * .9, from[1], to[1]);
}
