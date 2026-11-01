// Drawing kit for the "AI towns" explainer (four AIs run a 15-day society). Pure functions of their inputs + time T (deterministic).
// Everything is drawn in code except the user's AI logos (src/assets/*.png; *_w.png are white versions of the black logos).
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, hash, rr } from './lib.js';
import { FONT, MONO, txt, tw, bin, pop, pill, logo, glowDot, GREEN, RED } from './kit.js';

export const AIS = {
  gpt: { name: 'GPT-5 mini', col: '#10a37f', rgb: '16,163,127', roof: '#16b48d', logo: 'chatgpt_w', disc: '#10a37f', hair: '#3a2a1c' },
  claude: { name: 'Claude Sonnet 4.6', col: '#d97757', rgb: '217,119,87', roof: '#e8825f', logo: 'claude', disc: '#ffffff', hair: '#2a1d14' },
  gemini: { name: 'Gemini 3 Flash', col: '#4285f4', rgb: '66,133,244', roof: '#5a9bff', logo: 'gemini', disc: '#ffffff', hair: '#5a3b22' },
  grok: { name: 'Grok 4.1 Fast', col: '#b3b9c6', rgb: '179,185,198', roof: '#8f97a6', logo: 'grok_w', disc: '#1b1d23', hair: '#15151a' },
};
export const ORDER = ['gpt', 'claude', 'gemini', 'grok'];
export const GOLDC = '#ffcf5a', GOLD_RGB = '255,207,90', MINT = '#7dffb0';
const SKINS = ['#f2c9a5', '#e0a97c', '#c98f6a', '#f6d7bd', '#b97d57'];

// ---------- backgrounds ----------
export function night(ctx, T, { tint = '30,56,130', gx = W / 2, gy = 1150, glow = 1 } = {}) {
  let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#070a14'); g.addColorStop(.55, '#0b1122'); g.addColorStop(1, '#05070d');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  if (glow > 0) { const r = 780 + 50 * Math.sin(T * .7); g = ctx.createRadialGradient(gx, gy, 20, gx, gy, r); g.addColorStop(0, `rgba(${tint},${.34 * glow})`); g.addColorStop(.55, `rgba(${tint},${.1 * glow})`); g.addColorStop(1, `rgba(${tint},0)`); ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3); }
  ctx.strokeStyle = 'rgba(160,190,255,.035)'; ctx.lineWidth = 1.2; ctx.beginPath(); const off = (T * 8) % 80;
  for (let x = -80 + off; x <= W + 80; x += 80) { ctx.moveTo(x, -200); ctx.lineTo(x, H + 200); } for (let y = -80 + off * .5; y <= H + 80; y += 80) { ctx.moveTo(-200, y); ctx.lineTo(W + 200, y); } ctx.stroke();
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 70; i++) { const x = ((hash(i) * W + T * (3 + 8 * hash(i, 2))) % W + W) % W, y = ((hash(i, 1) * H - T * 5 * hash(i, 3)) % H + H) % H; ctx.globalAlpha = (.1 + .4 * hash(i, 4)) * (.55 + .45 * Math.sin(T * (1 + 2 * hash(i, 6)) + i)); ctx.beginPath(); ctx.arc(x, y, .7 + 1.4 * hash(i, 5), 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .85); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); ctx.fillStyle = v; ctx.fillRect(-W, -H, W * 3, H * 3);
}
export function paper(ctx, T) {
  ctx.fillStyle = '#f3f5f8'; ctx.fillRect(-W, -H, W * 3, H * 3);
  const off = (T * 6) % 60; ctx.strokeStyle = 'rgba(20,30,60,.05)'; ctx.lineWidth = 1.2; ctx.beginPath();
  for (let x = -60 + off; x <= W + 60; x += 60) { ctx.moveTo(x, -200); ctx.lineTo(x, H + 200); } for (let y = -60 + off * .5; y <= H + 60; y += 60) { ctx.moveTo(-200, y); ctx.lineTo(W + 200, y); } ctx.stroke();
  const g = ctx.createRadialGradient(W / 2, 1050, 50, W / 2, 1050, 1100); g.addColorStop(0, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(215,222,235,.4)'); ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
}

// ---------- labels ----------
export function tag(ctx, x, y, s, a = 1, lx, ly, { rgb = '235,240,248', size = 22, light = false } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a);
  ctx.font = MONO(700, size); ctx.letterSpacing = '2px'; const w = ctx.measureText(s).width + 30, h = size * 1.75;
  if (lx != null) { const k = eo(a); ctx.strokeStyle = `rgba(${rgb},.85)`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lerp(x, lx, k), lerp(y, ly, k)); ctx.stroke(); ctx.fillStyle = `rgb(${rgb})`; ctx.beginPath(); ctx.arc(lerp(x, lx, k), lerp(y, ly, k), 6, 0, 7); ctx.fill(); }
  rr(ctx, x - w / 2, y - h / 2, w, h, 8); ctx.fillStyle = light ? 'rgba(255,255,255,.95)' : 'rgba(10,12,18,.88)'; ctx.fill(); ctx.strokeStyle = `rgba(${rgb},.9)`; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = light ? '#14161c' : `rgb(${rgb})`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 1, y + 1); ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '0px'; ctx.restore();
}
export function title(ctx, a, head, sub, { y = 600, col = '#fff', size = 74, glow, x = W / 2, subCol = 'rgba(210,216,226,.75)' } = {}) {
  bin(ctx, a, () => {
    ctx.save(); ctx.font = FONT(900, size); let s = size; while (ctx.measureText(head).width > 960 && s > 30) { s -= 2; ctx.font = FONT(900, s); }
    ctx.textAlign = 'center'; if (glow) { ctx.shadowColor = `rgba(${glow},.75)`; ctx.shadowBlur = 30; } ctx.fillStyle = col; ctx.fillText(head, x, y); ctx.restore();
    if (sub) { ctx.save(); ctx.letterSpacing = '5px'; txt(ctx, sub, x, y + 50, 24, subCol, 700, 'center', MONO); ctx.restore(); }
  });
}
export function stamp(ctx, k, x, y, s, { col = '#fff', bg = 'rgba(12,14,18,.92)', size = 70, rot = -.08 } = {}) {
  if (k <= 0) return; const sc = lerp(1.8, 1, eback(clamp(k))); ctx.save(); ctx.globalAlpha *= clamp(k * 2); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.font = FONT(900, size); const w = ctx.measureText(s).width + size * .8, h = size * 1.45;
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 30; rr(ctx, -w / 2, -h / 2, w, h, 14); if (bg) { ctx.fillStyle = bg; ctx.fill(); } ctx.shadowBlur = 0;
  ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 4); ctx.textBaseline = 'alphabetic'; ctx.restore();
}
export function arrow(ctx, x0, y0, x1, y1, { col = GOLDC, w = 16, head = 2.6, a = 1, glow = 1 } = {}) {
  if (a <= 0) return; const L = Math.hypot(x1 - x0, y1 - y0); if (L < 2) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x0, y0); ctx.rotate(Math.atan2(y1 - y0, x1 - x0));
  if (glow) { ctx.shadowColor = col; ctx.shadowBlur = 18 * glow; }
  const hl = Math.min(L * .45, w * head * 1.2); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(0, -w / 2); ctx.lineTo(L - hl, -w / 2); ctx.lineTo(L - hl, -w * head / 2); ctx.lineTo(L, 0); ctx.lineTo(L - hl, w * head / 2); ctx.lineTo(L - hl, w / 2); ctx.lineTo(0, w / 2); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(0, -w / 2, L - hl, w * .3); ctx.restore();
}
export function coin(ctx, T, x, y, r, { a = 1, spin = 1, txtc = '$' } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(Math.max(.12, Math.abs(Math.cos(T * spin * 2 + x * .01))), 1);
  const g = ctx.createRadialGradient(-r * .3, -r * .3, 2, 0, 0, r); g.addColorStop(0, '#fff0a8'); g.addColorStop(.6, '#f2b91d'); g.addColorStop(1, '#a8740a'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(120,80,0,.6)'; ctx.lineWidth = r * .08; ctx.beginPath(); ctx.arc(0, 0, r * .78, 0, 7); ctx.stroke(); txt(ctx, txtc, 0, r * .3, r * .9, '#8a5a06', 900); ctx.restore();
}
export function bubble(ctx, x, y, w, h, tailX, { fill = '#fff', stroke = 'rgba(0,0,0,.08)', a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10; rr(ctx, x - w / 2, y - h / 2, w, h, 26); ctx.fillStyle = fill; ctx.fill();
  ctx.beginPath(); ctx.moveTo(tailX - 18, y + h / 2 - 2); ctx.lineTo(tailX, y + h / 2 + 36); ctx.lineTo(tailX + 22, y + h / 2 - 2); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; rr(ctx, x - w / 2, y - h / 2, w, h, 26); ctx.stroke(); ctx.restore();
}
// round badge with an AI logo
export function logoDisc(ctx, key, x, y, r, a = 1) {
  const A = AIS[key]; if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.shadowColor = `rgba(${A.rgb},.7)`; ctx.shadowBlur = r * .5; ctx.fillStyle = A.disc; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = A.col; ctx.lineWidth = r * .09; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); logo(ctx, A.logo, x, y, r * (key === 'grok' ? 1.05 : 1.15)); ctx.restore();
}

// ---------- flames, sparks ----------
export function flame(ctx, T, x, y, s, seed = 0, k = 1) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, -1.2, 0, 0, -1.2, 3.4); g.addColorStop(0, 'rgba(255,170,60,.5)'); g.addColorStop(1, 'rgba(255,90,20,0)'); ctx.fillStyle = g; ctx.fillRect(-4, -5, 8, 8);
  for (let i = 0; i < 3; i++) {
    const fx = (i - 1) * .95, fl = .75 + .25 * Math.sin(T * 11 + i * 2.1 + seed), h = (2.2 + (i === 1 ? 1.3 : 0)) * fl;
    ctx.fillStyle = i === 1 ? 'rgba(255,206,90,.95)' : 'rgba(255,100,30,.9)'; ctx.beginPath(); ctx.moveTo(fx - .8, 0); ctx.quadraticCurveTo(fx - .9, -h * .6, fx + Math.sin(T * 9 + i) * .3, -h); ctx.quadraticCurveTo(fx + .9, -h * .6, fx + .8, 0); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
export function burst(ctx, T, x, y, r, k, col = '#ffd45a') { // comic impact star
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(T * 2); const n = 8, s = r * (.7 + .3 * Math.sin(T * 30)) * eback(clamp(k * 2));
  ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n, d = i % 2 ? s * .45 : s; ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d); } ctx.closePath();
  ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = r * .6; ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#fff6c8'; ctx.scale(.5, .5); ctx.fill(); ctx.restore();
}

// ---------- the agent (feet at x,y; height about 9 s) ----------
// o: col (shirt), skin, hair, face (+1/-1), mood smile|angry|sad|dead|worry, pose idle|punch|cheer|hold|point|shrug, walk (0..1), dead (0..1 falls over), bar (0..1 energy bar above), seed
export function agent(ctx, T, x, y, s, o = {}) {
  const { col = '#10a37f', skin = '#f2c9a5', hair = '#3a2a1c', face = 1, mood = 'smile', pose = 'idle', walk = 0, dead = 0, bar = null, seed = 0, a = 1, hold = null } = o;
  if (a <= 0) return; const t = T * 5 + seed * 2.3, sw = Math.sin(t) * walk, bob = Math.abs(Math.sin(t)) * walk * .35 * s;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(0, 0, 2.6 * s, .8 * s, 0, 0, 7); ctx.fill();
  if (dead > 0) { ctx.rotate(face * dead * Math.PI / 2 * .92); ctx.translate(0, -dead * .3 * s); }
  ctx.translate(0, -bob); ctx.scale(face, 1);
  const lw = .9 * s;
  ctx.lineCap = 'round'; ctx.strokeStyle = '#2b2f3a'; ctx.lineWidth = lw; // legs
  ctx.beginPath(); ctx.moveTo(-.9 * s, -1.4 * s); ctx.lineTo(-.9 * s + sw * 1.1 * s, 0); ctx.moveTo(.9 * s, -1.4 * s); ctx.lineTo(.9 * s - sw * 1.1 * s, 0); ctx.stroke();
  // arms: angle from straight down, + = forward
  const idleA = .25 + .3 * Math.sin(T * 1.7 + seed), armR = { idle: [-idleA, idleA], punch: [-.35, 1.55 + .15 * Math.sin(T * 24)], cheer: [-2.7 + .3 * Math.sin(T * 6), 2.7 - .3 * Math.sin(T * 6 + 1)], hold: [-.3, 2.5], point: [-.3, 1.5], shrug: [-1.2, 1.2] }[pose] || [-.3, .3];
  const arm = (side, ang) => { const sx = side * 2.35 * s, sy = -4.5 * s, L = 3.1 * s, ex = sx + Math.sin(ang) * L * (side < 0 ? 1 : 1) * 1, ey = sy + Math.cos(ang) * L;
    ctx.strokeStyle = col; ctx.lineWidth = 1.25 * s; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke(); ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(ex, ey, .75 * s, 0, 7); ctx.fill(); return [ex, ey]; };
  arm(-1, armR[0]);
  // torso
  ctx.fillStyle = col; rr(ctx, -2.5 * s, -5.5 * s, 5 * s, 4.6 * s, 1.7 * s); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.14)'; rr(ctx, -2.5 * s, -5.5 * s, 2 * s, 4.6 * s, 1.2 * s); ctx.fill();
  const hand = arm(1, armR[1]);
  // head
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, -7.7 * s, 2.5 * s, 0, 7); ctx.fill();
  ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(0, -8.1 * s, 2.55 * s, Math.PI * 1.02, Math.PI * 1.98); ctx.lineTo(1.9 * s, -8.3 * s); ctx.quadraticCurveTo(0, -9.6 * s, -2.2 * s, -8.2 * s); ctx.closePath(); ctx.fill();
  if (s > 3.2) { // face
    ctx.fillStyle = '#1b1d24'; ctx.strokeStyle = '#1b1d24'; ctx.lineWidth = .3 * s; ctx.lineCap = 'round';
    if (mood === 'dead') { [-.9, .9].forEach(ex => { ctx.beginPath(); ctx.moveTo((ex - .35) * s, -7.9 * s); ctx.lineTo((ex + .35) * s, -7.2 * s); ctx.moveTo((ex + .35) * s, -7.9 * s); ctx.lineTo((ex - .35) * s, -7.2 * s); ctx.stroke(); }); }
    else { const bl = Math.sin(T * 1.3 + seed * 3) > .985 ? .1 : 1; [-.95, .95].forEach(ex => { ctx.beginPath(); ctx.ellipse(ex * s, -7.6 * s, .28 * s, .34 * s * bl, 0, 0, 7); ctx.fill(); }); }
    if (mood === 'angry') { ctx.beginPath(); ctx.moveTo(-1.5 * s, -8.5 * s); ctx.lineTo(-.4 * s, -8 * s); ctx.moveTo(1.5 * s, -8.5 * s); ctx.lineTo(.4 * s, -8 * s); ctx.stroke(); }
    ctx.beginPath(); if (mood === 'smile') ctx.arc(0, -7 * s, .8 * s, .15 * Math.PI, .85 * Math.PI); else if (mood === 'angry' || mood === 'sad') ctx.arc(0, -6.2 * s, .7 * s, 1.15 * Math.PI, 1.85 * Math.PI); else if (mood === 'worry') { ctx.moveTo(-.6 * s, -6.5 * s); ctx.lineTo(.6 * s, -6.4 * s); } else { ctx.moveTo(-.5 * s, -6.4 * s); ctx.lineTo(.5 * s, -6.4 * s); } ctx.stroke();
  }
  if (hold === 'coin') coin(ctx, T, hand[0] + .2 * s, hand[1] - 1.6 * s, 1.3 * s, { spin: 1.4 });
  ctx.restore();
  if (bar != null) energyBar(ctx, x, y - 11.8 * s, 4.6 * s, .8 * s, bar, { mini: true });
}

// energy bar (capsule), mini = no bolt
export function energyBar(ctx, x, y, w, h, f, { mini = false, a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; const x0 = x - w / 2;
  rr(ctx, x0 - h * .12, y - h * .62, w + h * .24, h * 1.24, h); ctx.fillStyle = 'rgba(8,10,16,.85)'; ctx.fill();
  const c = f > .5 ? '#3fd08a' : f > .22 ? '#f4b63f' : '#ff4a3d'; ctx.save(); rr(ctx, x0, y - h / 2, w, h, h / 2); ctx.clip(); ctx.fillStyle = c; ctx.fillRect(x0 - 2, y - h / 2, 2 + w * clamp(f), h); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(x0, y - h / 2, w, h * .3); ctx.restore();
  if (!mini) { ctx.fillStyle = '#ffe266'; ctx.beginPath(); ctx.moveTo(x0 - h * .4, y - h * .95); ctx.lineTo(x0 - h * 1.1, y + h * .1); ctx.lineTo(x0 - h * .6, y + h * .1); ctx.lineTo(x0 - h * .8, y + h * 1.0); ctx.lineTo(x0 - h * .1, y - h * .2); ctx.lineTo(x0 - h * .55, y - h * .2); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}

// ---------- the island town ----------
const HOUSE_A = i => i / 10 * Math.PI * 2 + .31;
export function townGeom(cx, cy, w) {
  const Kx = w * .44, Ky = w * .33, X = gx => cx + gx * Kx, Y = gy => cy + gy * Ky;
  const house = i => ({ x: X(.76 * Math.cos(HOUSE_A(i))), y: Y(.74 * Math.sin(HOUSE_A(i))) });
  return { X, Y, house };
}
// o: ai, mixed, light, dead (count, fractional = falling), bars (0..1 or fn(i)), fire [{i,k}], burnt [i], fight {a,b,k}, steal [i], walk, flag, glow, hit (house i highlighted), spawn (agents shown, 0..10), who (agent i highlighted ring)
export function town(ctx, T, cx, cy, w, o = {}) {
  const A = AIS[o.ai || 'gpt'], dark = !o.light, G = townGeom(cx, cy, w), { X, Y } = G, th = w * .05, u = w / 100, walk = o.walk ?? 1;
  const colOf = i => o.mixed ? AIS[ORDER[i % 4]] : A;
  ctx.save();
  if (o.glow) glowDot(ctx, cx, cy + w * .05, w * .85, o.glow.rgb || A.rgb, o.glow.k ?? .5);
  ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = w * .09; ctx.shadowOffsetY = w * .05; rr(ctx, cx - w / 2, cy - w * .39 + th, w, w * .78, w * .09); ctx.fillStyle = dark ? '#0f2a1b' : '#5b8a4c'; ctx.fill(); ctx.shadowColor = 'transparent';
  rr(ctx, cx - w / 2, cy - w * .39, w, w * .78, w * .09); let g = ctx.createLinearGradient(0, cy - w * .39, 0, cy + w * .39); if (dark) { g.addColorStop(0, '#2c7048'); g.addColorStop(1, '#1d5233'); } else { g.addColorStop(0, '#9dd37e'); g.addColorStop(1, '#74b25a'); } ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = dark ? 'rgba(160,255,190,.22)' : 'rgba(255,255,255,.55)'; ctx.lineWidth = w * .006; ctx.stroke();
  ctx.save(); rr(ctx, cx - w / 2, cy - w * .39, w, w * .78, w * .09); ctx.clip(); // grass tufts
  for (let i = 0; i < 34; i++) { const tx = cx + (hash(i, 3) - .5) * w * .94, ty = cy + (hash(i, 4) - .5) * w * .72; ctx.fillStyle = dark ? 'rgba(110,200,130,.16)' : 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.ellipse(tx, ty, u * (1 + hash(i, 5) * 1.4), u * .5, 0, 0, 7); ctx.fill(); }
  ctx.restore();
  // paths + plaza
  ctx.strokeStyle = dark ? '#c9bd94' : '#e8dcb4'; ctx.lineWidth = u * 2.4; ctx.lineCap = 'round'; ctx.globalAlpha *= .8;
  for (let i = 0; i < 10; i++) { const h = G.house(i); ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(h.x, h.y + u * 1); ctx.stroke(); } ctx.globalAlpha /= .8;
  ctx.beginPath(); ctx.ellipse(X(0), Y(0), w * .17, w * .125, 0, 0, 7); ctx.fillStyle = dark ? '#d9cfa8' : '#efe6c2'; ctx.fill(); ctx.strokeStyle = 'rgba(120,100,60,.45)'; ctx.lineWidth = u * .6; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(X(0), Y(0), w * .13, w * .095, 0, 0, 7); ctx.strokeStyle = 'rgba(120,100,60,.3)'; ctx.stroke();
  // drawables sorted by y
  const items = [];
  // hall in the middle
  items.push({ y: Y(-.05), fn: () => { const hx = X(0), hy = Y(-.05), r = w * .062;
    ctx.fillStyle = '#b9b2a0'; ctx.fillRect(hx - r, hy - r * 1.3, r * 2, r * 1.3); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(hx, hy - r * 1.3, r, r * 1.3); ctx.beginPath(); ctx.ellipse(hx, hy, r, r * .42, 0, 0, Math.PI); ctx.fillStyle = '#a49d8b'; ctx.fill();
    ctx.fillStyle = '#4b4638'; rr(ctx, hx - r * .22, hy - r * .9, r * .44, r * .8, r * .2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(hx, hy - r * 1.3, r * 1.05, r * .45, 0, Math.PI, 0); ctx.fillStyle = A.col; ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.ellipse(hx - r * .3, hy - r * 1.55, r * .35, r * .14, 0, 0, 7); ctx.fill();
    if (o.flag !== false) { const py = hy - r * 1.7; ctx.strokeStyle = '#e8e8ee'; ctx.lineWidth = u * .5; ctx.beginPath(); ctx.moveTo(hx, py); ctx.lineTo(hx, py - w * .1); ctx.stroke();
      ctx.fillStyle = A.col; ctx.beginPath(); ctx.moveTo(hx, py - w * .1); for (let k = 0; k <= 8; k++) ctx.lineTo(hx + k * u * 1.1, py - w * .1 + Math.sin(T * 5 + k * .8) * u * .5 + k * .12 * u); for (let k = 8; k >= 0; k--) ctx.lineTo(hx + k * u * 1.1, py - w * .1 + u * 3.4 + Math.sin(T * 5 + k * .8) * u * .5 + k * .12 * u); ctx.closePath(); ctx.fill();
      logo(ctx, A.logo === 'claude' || A.logo === 'gemini' ? A.logo : A.logo, hx + u * 3.3, py - w * .1 + u * 1.8, u * 2.6, 1); } } });
  for (let i = 0; i < 10; i++) { const h = G.house(i), C = colOf(i), burnt = (o.burnt || []).includes(i), hs = w * .078;
    items.push({ y: h.y, fn: () => {
      const hit = o.hit === i; if (hit) glowDot(ctx, h.x, h.y - hs * .5, hs * 2.2, '255,80,60', .7 + .2 * Math.sin(T * 9));
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(h.x + hs * .1, h.y, hs * .62, hs * .17, 0, 0, 7); ctx.fill();
      ctx.fillStyle = burnt ? '#4a423c' : '#efe3cb'; ctx.fillRect(h.x - hs / 2, h.y - hs * .62, hs, hs * .62); ctx.fillStyle = 'rgba(60,40,20,.16)'; ctx.fillRect(h.x + hs * .12, h.y - hs * .62, hs * .38, hs * .62);
      ctx.fillStyle = burnt ? '#2a2522' : '#7a5a3c'; ctx.fillRect(h.x - hs * .1, h.y - hs * .38, hs * .2, hs * .38); ctx.fillStyle = burnt ? '#1d1a18' : (dark ? '#ffe9a0' : '#9fd6ff'); ctx.fillRect(h.x - hs * .38, h.y - hs * .5, hs * .17, hs * .17); ctx.fillRect(h.x + hs * .22, h.y - hs * .5, hs * .17, hs * .17);
      ctx.beginPath(); ctx.moveTo(h.x - hs * .62, h.y - hs * .58); ctx.lineTo(h.x - hs * .3, h.y - hs * 1.08); ctx.lineTo(h.x + hs * .3, h.y - hs * 1.08); ctx.lineTo(h.x + hs * .62, h.y - hs * .58); ctx.closePath(); ctx.fillStyle = burnt ? '#241f1d' : C.roof; ctx.fill();
      if (!burnt) { ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.moveTo(h.x - hs * .55, h.y - hs * .62); ctx.lineTo(h.x - hs * .28, h.y - hs * 1.04); ctx.lineTo(h.x - hs * .05, h.y - hs * 1.04); ctx.lineTo(h.x - hs * .3, h.y - hs * .62); ctx.fill(); }
      if (burnt) { ctx.fillStyle = 'rgba(80,80,90,.5)'; for (let k = 0; k < 3; k++) { const q = (T * .5 + k / 3 + i * .17) % 1; ctx.globalAlpha = .5 * (1 - q); ctx.beginPath(); ctx.arc(h.x + Math.sin(q * 5 + k) * hs * .2, h.y - hs * 1.1 - q * hs * 1.6, hs * (.12 + q * .3), 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
      const fi = (o.fire || []).find(f => f.i === i); if (fi) { flame(ctx, T, h.x - hs * .25, h.y - hs * 1.0, hs * .55, i, fi.k); flame(ctx, T, h.x + hs * .2, h.y - hs * .75, hs * .42, i + 3, fi.k); }
    } });
  }
  // agents
  const nA = o.spawn ?? 10, dead = o.dead || 0;
  const fi = o.fight, apos = [];
  for (let i = 0; i < 10; i++) { const h = G.house(i), door = [h.x, h.y + u * 1.8], ang = HOUSE_A(i), spot = [X(.30 * Math.cos(ang)), Y(.34 * Math.sin(ang)) + u * 1.5];
    const sph = .5 + .5 * Math.sin(T * .55 * walk + i * 2.1), s = o.idle ? 0 : eio(sph) * .85; let ax = lerp(door[0], spot[0], s), ay = lerp(door[1], spot[1], s), face = spot[0] > door[0] ? 1 : -1;
    if (sph > .5 && !o.idle) face = -face;
    apos.push([ax, ay, face, !o.idle && sph > .02 && sph < .98 ? walk : 0]); }
  if (fi && fi.k > 0) { const [a, b] = [fi.a, fi.b], mx = X(.05), my = Y(.12), d = u * (3.2 - 1.2 * Math.abs(Math.sin(T * 16)) * fi.k);
    apos[a] = [lerp(apos[a][0], mx - d, eo(fi.k * 3)), lerp(apos[a][1], my, eo(fi.k * 3)), 1, 0]; apos[b] = [lerp(apos[b][0], mx + d, eo(fi.k * 3)), lerp(apos[b][1], my, eo(fi.k * 3)), -1, 0]; }
  for (let i = 0; i < 10; i++) { if (i >= nA) continue; const [ax, ay, face, wk] = apos[i], C = colOf(i), isDead = i < Math.floor(dead), dying = i === Math.floor(dead) ? dead % 1 : 0, sk = SKINS[i % SKINS.length];
    items.push({ y: ay + .1, fn: () => {
      const fighting = fi && fi.k > 0 && (i === fi.a || i === fi.b);
      if (o.who === i) { ctx.strokeStyle = '#ffd45a'; ctx.lineWidth = u * .7; ctx.beginPath(); ctx.ellipse(ax, ay, u * 4.2, u * 1.6, 0, 0, 7); ctx.stroke(); }
      const bar = typeof o.bars === 'function' ? o.bars(i) : o.bars;
      agent(ctx, T, ax, ay, u * .62, { col: C.col, skin: sk, hair: C.hair, face, walk: isDead ? 0 : wk, dead: isDead ? 1 : dying, mood: isDead ? 'dead' : fighting ? 'angry' : (o.moods && o.moods[i]) || 'smile', pose: fighting ? 'punch' : (o.poses && o.poses[i]) || 'idle', seed: i, bar: isDead ? null : bar });
      if ((o.steal || []).includes(i) && !isDead) coin(ctx, T, ax, ay - u * 8.2 - u * 1.2 * Math.abs(Math.sin(T * 6 + i)), u * 1.5, { spin: 1.6 });
      if (isDead) { const q = (T * .35 + i * .21) % 1; ctx.globalAlpha = .55 * (1 - q); ctx.fillStyle = '#dfe6f4'; ctx.beginPath(); ctx.arc(ax, ay - u * 4 - q * u * 9, u * 1.5, Math.PI, 0); ctx.lineTo(ax + u * 1.5, ay - u * 2.8 - q * u * 9); ctx.lineTo(ax - u * 1.5, ay - u * 2.8 - q * u * 9); ctx.fill(); ctx.globalAlpha = 1; }
    } });
  }
  items.sort((a, b) => a.y - b.y).forEach(it => it.fn());
  if (fi && fi.k > 0) burst(ctx, T, X(.05), Y(.12) - u * 5, u * 5.5, .6 + .4 * Math.sin(T * 14), '#ffd45a');
  ctx.restore();
  if (o.label) { const lw = pill(ctx, cx, cy + w * .39 + th + w * .05, A.name, { bg: dark ? 'rgba(10,12,18,.85)' : 'rgba(255,255,255,.92)', fg: dark ? '#e8ecf4' : '#14161c', size: Math.max(16, w * .052), stroke: `rgba(${A.rgb},.8)`, padX: w * .035 }); }
  return apos;
}

// ---------- small UI chips ----------
export function dayCal(ctx, x, y, s, day, { a = 1, bump = 0 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); const k = 1 + .14 * Math.sin(clamp(bump) * Math.PI); ctx.scale(s * k, s * k);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 8; rr(ctx, -50, -56, 100, 112, 16); ctx.fillStyle = '#f6f7fa'; ctx.fill(); ctx.shadowBlur = 0;
  ctx.save(); rr(ctx, -50, -56, 100, 112, 16); ctx.clip(); ctx.fillStyle = '#e8352f'; ctx.fillRect(-50, -56, 100, 30); ctx.restore();
  ctx.fillStyle = '#fff'; ctx.font = FONT(900, 20); ctx.textAlign = 'center'; ctx.letterSpacing = '3px'; ctx.fillText('DAY', 0, -34); ctx.letterSpacing = '0px';
  ctx.fillStyle = '#14161c'; ctx.font = FONT(900, 66); ctx.fillText(String(Math.round(day)), 0, 36); ctx.restore();
}
export function crimeChip(ctx, T, x, y, n, { a = 1, size = 28, bump = 0, label = 'crimes', hot = true } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); const k = 1 + .16 * Math.sin(clamp(bump) * Math.PI); ctx.scale(k, k);
  const s = `${Math.round(n)} ${label}`; ctx.font = FONT(800, size); const w = ctx.measureText(s).width + size * 2.1, h = size * 1.9;
  ctx.shadowColor = hot ? 'rgba(255,60,50,.5)' : 'rgba(0,0,0,.4)'; ctx.shadowBlur = 24; rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(14,16,22,.94)'; ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = hot ? 'rgba(255,74,61,.9)' : 'rgba(120,255,170,.7)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = hot ? '#ff4a3d' : '#3fd08a'; ctx.globalAlpha *= .75 + .25 * Math.sin(T * 6); ctx.beginPath(); ctx.arc(-w / 2 + size * .95, 0, size * .3, 0, 7); ctx.fill(); ctx.globalAlpha = a;
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, -w / 2 + size * 1.55, 2); ctx.textBaseline = 'alphabetic'; ctx.restore();
}
export function aliveChip(ctx, x, y, n, tot = 10, { a = 1, size = 28, bump = 0 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); const k = 1 + .16 * Math.sin(clamp(bump) * Math.PI); ctx.scale(k, k);
  const s = `${Math.round(n)} / ${tot} alive`; ctx.font = FONT(800, size); const w = ctx.measureText(s).width + size * 2, h = size * 1.9, ok = n > 0;
  ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 20; rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(14,16,22,.94)'; ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = ok ? 'rgba(120,255,170,.8)' : 'rgba(255,74,61,.9)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = ok ? '#3fd08a' : '#ff4a3d'; ctx.beginPath(); ctx.arc(-w / 2 + size * .9, -size * .12, size * .24, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(-w / 2 + size * .9, size * .34, size * .4, size * .24, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, -w / 2 + size * 1.5, 2); ctx.textBaseline = 'alphabetic'; ctx.restore();
}
// glass card for charts / UI
export function panel(ctx, x, y, w, h, r = 30, { light = false } = {}) {
  ctx.save(); ctx.shadowColor = light ? 'rgba(30,40,80,.25)' : 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; rr(ctx, x, y, w, h, r);
  const g = ctx.createLinearGradient(x, y, x, y + h); if (light) { g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#eef1f7'); } else { g.addColorStop(0, 'rgba(36,42,58,.95)'); g.addColorStop(1, 'rgba(14,17,26,.95)'); } ctx.fillStyle = g; ctx.fill(); ctx.restore();
  ctx.save(); rr(ctx, x, y, w, h, r); ctx.strokeStyle = light ? 'rgba(20,30,60,.1)' : 'rgba(255,255,255,.14)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
}
// round action button (punch / steal / fire)
export function bigButton(ctx, T, x, y, w, h, label, rgb, icon, { press = 0, a = 1, lock = 0 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y + press * 8); const sc = 1 - press * .03; ctx.scale(sc, sc);
  ctx.shadowColor = `rgba(${rgb},.55)`; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14 - press * 8; rr(ctx, -w / 2, -h / 2, w, h, h * .3); let g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, `rgb(${rgb})`); g.addColorStop(1, `rgba(${rgb.split(',').map(v => Math.round(v * .55)).join(',')},1)`); ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; ctx.shadowOffsetY = 0;
  rr(ctx, -w / 2 + 6, -h / 2 + 6, w - 12, h * .42, h * .24); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.arc(-w / 2 + h * .52, 0, h * .34, 0, 7); ctx.fill(); icon(ctx, -w / 2 + h * .52, 0, h * .3, T);
  ctx.fillStyle = '#fff'; ctx.font = FONT(900, h * .32); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(label, -w / 2 + h * 1.05, 3); ctx.textBaseline = 'alphabetic';
  if (lock > 0) { ctx.fillStyle = `rgba(10,12,18,${.62 * lock})`; rr(ctx, -w / 2, -h / 2, w, h, h * .3); ctx.fill(); }
  ctx.restore();
}
export const iconFist = (ctx, x, y, r) => { ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#fff'; rr(ctx, -r * .8, -r * .55, r * 1.6, r * 1.2, r * .35); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = r * .1; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-r * .8 + i * r * .4, -r * .5); ctx.lineTo(-r * .8 + i * r * .4, r * .05); ctx.stroke(); } ctx.fillStyle = '#fff'; rr(ctx, -r * .55, r * .5, r * 1.1, r * .45, r * .2); ctx.fill(); ctx.restore(); };
export const iconHandCoin = (ctx, x, y, r, T) => { coin(ctx, T, x, y - r * .1, r * .75, { spin: 1.2 }); ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = r * .22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - r * .9, y + r * .7); ctx.quadraticCurveTo(x, y + r * 1.15, x + r * .9, y + r * .55); ctx.stroke(); ctx.restore(); };
export const iconFlame = (ctx, x, y, r, T) => { flame(ctx, T, x, y + r * .8, r * .95, 2, 1); };
// padlock
export function padlock(ctx, x, y, s, k = 1, col = '#ff4a3d') { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * eback(clamp(k)), s * eback(clamp(k))); ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, -14, 20, Math.PI, 0); ctx.stroke(); rr(ctx, -30, -14, 60, 50, 10); ctx.fillStyle = col; ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 8, 6, 0, 7); ctx.fill(); ctx.fillRect(-2.5, 8, 5, 14); ctx.restore(); }
// tiny person glyph (for "no humans")
export function humanGlyph(ctx, x, y, s, col = '#fff') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, -16, 12, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, 18, 24, 20, 0, Math.PI, 0); ctx.fill(); ctx.restore(); }
