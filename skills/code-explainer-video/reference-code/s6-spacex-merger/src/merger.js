// Drawing kit for the "Tesla + SpaceX merger" explainer. Pure functions of their inputs + time T (deterministic). Everything is drawn in code
// except the user's logos (src/assets/*.png, keyed out; *_w.png are white versions of the black logos).
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, hash, rr } from './lib.js';
import { FONT, MONO, txt, tw, bin, pop, card, glowDot, pill, bar, logo } from './kit.js';
import { IMG } from './assets.js';
export const TRED = '#e31937', TRED_RGB = '227,25,55', SBLUE = '#8cc0ff', SBLUE_RGB = '140,192,255', AI = '#5de0ff', AI_RGB = '93,224,255', GOLDC = '#ffcf5a', GOLD_RGB = '255,207,90', MINT = '#7dffb0', MINT_RGB = '125,255,176';

// ---------- backgrounds ----------
export function space(ctx, T, { tint = '30,56,130', gx = W / 2, gy = 1150, glow = 1, stars = 90, grid = 1 } = {}) {
  let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05070f'); g.addColorStop(.55, '#0a0f22'); g.addColorStop(1, '#04060c');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  if (glow > 0) { const r = 760 + 50 * Math.sin(T * .7); g = ctx.createRadialGradient(gx, gy, 20, gx, gy, r); g.addColorStop(0, `rgba(${tint},${.32 * glow})`); g.addColorStop(.55, `rgba(${tint},${.1 * glow})`); g.addColorStop(1, `rgba(${tint},0)`); ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3); }
  if (grid > 0) { ctx.strokeStyle = `rgba(160,190,255,${.035 * grid})`; ctx.lineWidth = 1.2; ctx.beginPath(); const off = (T * 8) % 80; for (let x = -80 + off; x <= W + 80; x += 80) { ctx.moveTo(x, -200); ctx.lineTo(x, H + 200); } for (let y = -80 + off * .5; y <= H + 80; y += 80) { ctx.moveTo(-200, y); ctx.lineTo(W + 200, y); } ctx.stroke(); }
  ctx.fillStyle = '#fff';
  for (let i = 0; i < stars; i++) { const x = ((hash(i) * W + T * (4 + 10 * hash(i, 2))) % W + W) % W, y = ((hash(i, 1) * H - T * 6 * hash(i, 3)) % H + H) % H;
    ctx.globalAlpha = (.12 + .5 * hash(i, 4)) * (.55 + .45 * Math.sin(T * (1 + 2 * hash(i, 6)) + i)); ctx.beginPath(); ctx.arc(x, y, .7 + 1.6 * hash(i, 5), 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .85); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); ctx.fillStyle = v; ctx.fillRect(-W, -H, W * 3, H * 3);
}
export function paperBg(ctx, T, { warm = 0 } = {}) {
  ctx.fillStyle = warm ? '#f4f0e8' : '#f3f5f8'; ctx.fillRect(-W, -H, W * 3, H * 3);
  const off = (T * 6) % 60; ctx.strokeStyle = 'rgba(20,30,60,.05)'; ctx.lineWidth = 1.2; ctx.beginPath();
  for (let x = -60 + off; x <= W + 60; x += 60) { ctx.moveTo(x, -200); ctx.lineTo(x, H + 200); } for (let y = -60 + off * .5; y <= H + 60; y += 60) { ctx.moveTo(-200, y); ctx.lineTo(W + 200, y); } ctx.stroke();
  const g = ctx.createRadialGradient(W / 2, 1050, 50, W / 2, 1050, 1100); g.addColorStop(0, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(215,222,235,.4)'); ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
}
export const ground = (ctx, y, a = 1, light = false) => { const g = ctx.createLinearGradient(0, y, 0, y + 200); g.addColorStop(0, light ? `rgba(150,160,180,${.35 * a})` : `rgba(120,150,230,${.16 * a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-W, y, W * 3, 200); ctx.fillStyle = light ? `rgba(120,130,150,${.5 * a})` : `rgba(160,190,255,${.4 * a})`; ctx.fillRect(-W, y, W * 3, 2); };

// ---------- generic labels ----------
export function tag(ctx, x, y, s, a = 1, lx, ly, { rgb = '235,240,248', size = 22, light = false } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a);
  ctx.font = MONO(700, size); ctx.letterSpacing = '2px'; const w = ctx.measureText(s).width + 30, h = size * 1.75;
  if (lx != null) { const k = eo(a); ctx.strokeStyle = `rgba(${rgb},.85)`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lerp(x, lx, k), lerp(y, ly, k)); ctx.stroke(); ctx.fillStyle = `rgb(${rgb})`; ctx.beginPath(); ctx.arc(lerp(x, lx, k), lerp(y, ly, k), 7, 0, 7); ctx.fill(); }
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
// logo with a soft glow; w = width; names: spacex xai grok tesla barclays jpm rbc (+ _w white variants)
export function lg(ctx, name, x, y, w, a = 1, rot = 0) { logo(ctx, name, x, y, w, a, rot); }
export function teslaT(ctx, x, y, w, col = 'tesla_w', a = 1) { // just the T mark (top part of the logo)
  const i = IMG[col]; if (!i || a <= 0) return; const sh = i.height * .70, h = w * sh / i.width; ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(i, 0, 0, i.width, sh, x - w / 2, y - h / 2, w, h); ctx.restore();
}

// ---------- the car (side view, glossy red sedan). Origin = ground under the middle; ~540 wide ----------
export function wheel(ctx, T, x, y, r, spin) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#0b0c10'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  const g = ctx.createRadialGradient(-r * .2, -r * .2, 2, 0, 0, r * .72); g.addColorStop(0, '#e6e9ef'); g.addColorStop(1, '#7c828d'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * .68, 0, 7); ctx.fill();
  ctx.rotate(spin); ctx.strokeStyle = '#2a2d35'; ctx.lineWidth = r * .1; for (let i = 0; i < 5; i++) { ctx.rotate(Math.PI * 2 / 5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r * .64, 0); ctx.stroke(); }
  ctx.fillStyle = '#15171c'; ctx.beginPath(); ctx.arc(0, 0, r * .16, 0, 7); ctx.fill(); ctx.restore();
}
export function car(ctx, T, x, y, s, { col = TRED, spin = T * 6, glow = 0, lights = 1, sensing = 0, shadow = 1 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (shadow) { const g = ctx.createRadialGradient(0, 4, 10, 0, 4, 300); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.save(); ctx.scale(1, .1); ctx.beginPath(); ctx.arc(0, 40, 300, 0, 7); ctx.fill(); ctx.restore(); }
  if (glow > 0) glowDot(ctx, 0, -90, 420, TRED_RGB, glow * .5);
  if (lights > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(-270, 0, -620, 0); g.addColorStop(0, `rgba(255,244,214,${.35 * lights})`); g.addColorStop(1, 'rgba(255,244,214,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-262, -78); ctx.lineTo(-640, -140); ctx.lineTo(-640, -10); ctx.lineTo(-262, -62); ctx.fill(); ctx.restore(); }
  const body = () => { ctx.beginPath(); ctx.moveTo(-268, -50); ctx.bezierCurveTo(-276, -78, -262, -94, -222, -102); ctx.bezierCurveTo(-170, -112, -120, -116, -70, -124); ctx.bezierCurveTo(-40, -160, 0, -180, 60, -182); ctx.bezierCurveTo(120, -182, 170, -170, 214, -128); ctx.bezierCurveTo(250, -122, 270, -104, 272, -76); ctx.bezierCurveTo(274, -62, 270, -52, 262, -48); ctx.lineTo(-262, -48); ctx.closePath(); };
  body(); let g = ctx.createLinearGradient(0, -190, 0, -40); g.addColorStop(0, '#ff5a6e'); g.addColorStop(.35, col); g.addColorStop(1, '#6d0a1c'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); body(); ctx.clip(); g = ctx.createLinearGradient(-270, 0, 270, 0); g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.25)'); ctx.fillStyle = g; ctx.fillRect(-280, -200, 560, 200);
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-230, -96); ctx.bezierCurveTo(-120, -112, 40, -110, 240, -100); ctx.stroke(); ctx.restore();
  // glass
  ctx.beginPath(); ctx.moveTo(-62, -128); ctx.bezierCurveTo(-36, -158, -4, -172, 56, -174); ctx.bezierCurveTo(112, -174, 150, -164, 196, -128); ctx.closePath(); g = ctx.createLinearGradient(0, -176, 0, -126); g.addColorStop(0, '#0d1424'); g.addColorStop(1, '#27324d'); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(15,10,12,.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(62, -174); ctx.lineTo(62, -126); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.moveTo(-40, -130); ctx.lineTo(10, -170); ctx.lineTo(34, -170); ctx.lineTo(-12, -130); ctx.fill();
  // arches + wheels
  [-168, 172].forEach(wx => { ctx.fillStyle = '#05060a'; ctx.beginPath(); ctx.arc(wx, -44, 58, Math.PI, 0); ctx.lineTo(wx + 58, -44); ctx.fill(); wheel(ctx, T, wx, -44, 46, spin); });
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-262, -50, 524, 4);
  if (lights > 0) { ctx.save(); ctx.shadowColor = '#fff4d0'; ctx.shadowBlur = 24; ctx.fillStyle = '#fff6dc'; rr(ctx, -270, -88, 28, 12, 6); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = '#ff3050'; ctx.save(); ctx.shadowColor = '#ff3050'; ctx.shadowBlur = 16; rr(ctx, 258, -112, 14, 8, 4); ctx.fill(); ctx.restore();
  if (sensing > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 3; k++) { const u = (T * .8 + k / 3) % 1; ctx.strokeStyle = `rgba(${AI_RGB},${(1 - u) * .7 * sensing})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(-40, -150, 80 + u * 260, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); } ctx.restore(); }
  ctx.restore();
}

// ---------- the rocket (Starship-like, stainless). Origin = base centre; ~120 wide, ~720 tall at s=1 ----------
export function rocket(ctx, T, x, y, s, { flame = 0, rot = 0, label = true, glow = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (flame > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 4; k++) { const fl = (230 + 70 * k) * flame * (1 + .08 * Math.sin(T * 24 + k * 2)), w = 50 - k * 7; const g = ctx.createLinearGradient(0, 0, 0, fl); g.addColorStop(0, k < 2 ? 'rgba(255,255,230,.95)' : 'rgba(255,200,110,.7)'); g.addColorStop(.4, 'rgba(255,140,50,.5)'); g.addColorStop(1, 'rgba(255,90,20,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-w, 0); ctx.quadraticCurveTo(-w * .3, fl * .6, 0, fl); ctx.quadraticCurveTo(w * .3, fl * .6, w, 0); ctx.fill(); } glowDot(ctx, 0, 40, 220, '255,170,80', .55 * flame); ctx.restore(); }
  if (glow > 0) glowDot(ctx, 0, -360, 420, SBLUE_RGB, glow * .45);
  const hull = () => { ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(-60, -520); ctx.bezierCurveTo(-60, -640, -26, -720, 0, -750); ctx.bezierCurveTo(26, -720, 60, -640, 60, -520); ctx.lineTo(60, 0); ctx.closePath(); };
  // fins (behind) : two bottom flaps, two top canards
  ctx.fillStyle = '#9aa1ac'; ctx.beginPath(); ctx.moveTo(-60, -30); ctx.lineTo(-118, 6); ctx.lineTo(-108, -150); ctx.lineTo(-60, -190); ctx.fill(); ctx.beginPath(); ctx.moveTo(60, -30); ctx.lineTo(118, 6); ctx.lineTo(108, -150); ctx.lineTo(60, -190); ctx.fill();
  ctx.fillStyle = '#b8bec8'; ctx.beginPath(); ctx.moveTo(-58, -560); ctx.lineTo(-100, -540); ctx.lineTo(-96, -490); ctx.lineTo(-58, -500); ctx.fill(); ctx.beginPath(); ctx.moveTo(58, -560); ctx.lineTo(100, -540); ctx.lineTo(96, -490); ctx.lineTo(58, -500); ctx.fill();
  hull(); const g = ctx.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, '#6e7580'); g.addColorStop(.28, '#e9edf3'); g.addColorStop(.5, '#ffffff'); g.addColorStop(.75, '#aab1bc'); g.addColorStop(1, '#5a616c'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); hull(); ctx.clip(); ctx.strokeStyle = 'rgba(40,46,56,.35)'; ctx.lineWidth = 2; for (let k = 1; k < 9; k++) { ctx.beginPath(); ctx.moveTo(-60, -k * 66); ctx.lineTo(60, -k * 66); ctx.stroke(); }
  ctx.fillStyle = 'rgba(8,10,14,.82)'; ctx.fillRect(-60, -700, 20, 640); // heat-shield tile side
  ctx.fillStyle = '#2a2f38'; ctx.fillRect(-60, -330, 120, 6); ctx.restore();
  if (label) { ctx.save(); ctx.translate(8, -330); ctx.rotate(-Math.PI / 2); ctx.font = FONT(800, 22); ctx.letterSpacing = '8px'; ctx.fillStyle = 'rgba(25,30,40,.85)'; ctx.textAlign = 'center'; ctx.fillText('SPACEX', 0, 8); ctx.restore(); }
  ctx.restore();
}

// ---------- people (flat vector, original) ----------
export function person(ctx, T, x, y, s, { suit = '#1d2540', shirt = '#f2f4f8', tie = '#c0182e', skin = '#e9b894', hair = '#4a3322', seed = 0, walk = 0, bob = 1, face = 0 } = {}) {
  ctx.save(); const b = bob * 3 * Math.sin(T * 2 + seed); ctx.translate(x, y); ctx.scale(s, s);
  const sw = Math.sin(T * 5 + seed) * walk;
  // legs
  [[-18, -sw], [18, sw]].forEach(([lx, sv]) => { ctx.fillStyle = suit; ctx.save(); ctx.translate(lx, -130); ctx.rotate(sv * .22); rr(ctx, -14, 0, 28, 124, 8); ctx.fill(); ctx.fillStyle = '#0b0c10'; rr(ctx, -16, 114, 40, 16, 8); ctx.fill(); ctx.restore(); });
  ctx.translate(0, b);
  // torso
  let g = ctx.createLinearGradient(-50, 0, 50, 0); g.addColorStop(0, suit); g.addColorStop(.5, '#2c3866'); g.addColorStop(1, suit);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-48, -300); ctx.quadraticCurveTo(-62, -310, -62, -270); ctx.lineTo(-52, -150); ctx.lineTo(52, -150); ctx.lineTo(62, -270); ctx.quadraticCurveTo(62, -310, 48, -300); ctx.quadraticCurveTo(0, -322, -48, -300); ctx.fill();
  ctx.fillStyle = shirt; ctx.beginPath(); ctx.moveTo(-14, -306); ctx.lineTo(14, -306); ctx.lineTo(0, -222); ctx.fill();
  ctx.fillStyle = tie; ctx.beginPath(); ctx.moveTo(-6, -300); ctx.lineTo(6, -300); ctx.lineTo(9, -250); ctx.lineTo(0, -228); ctx.lineTo(-9, -250); ctx.fill();
  ctx.fillStyle = suit; [-1, 1].forEach(d => { ctx.save(); ctx.translate(d * 58, -290); ctx.rotate(d * (.1 + .08 * Math.sin(T * 2 + seed + d)) + (d > 0 ? sw * .3 : -sw * .3)); rr(ctx, -13, 0, 26, 130, 12); ctx.fill(); ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, 136, 13, 0, 7); ctx.fill(); ctx.fillStyle = suit; ctx.restore(); });
  // head
  ctx.fillStyle = skin; rr(ctx, -9, -322, 18, 22, 6); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, -352, 30, 36, 0, 0, 7); ctx.fill();
  ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(0, -372, 31, 21, 0, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.ellipse(-24, -356, 8, 18, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#1a1410'; const ey = -354 + (face === 1 ? 1 : 0); ctx.beginPath(); ctx.arc(-11 + 3 * Math.sin(T * .8 + seed), ey, 2.6, 0, 7); ctx.arc(11 + 3 * Math.sin(T * .8 + seed), ey, 2.6, 0, 7); ctx.fill();
  ctx.strokeStyle = '#8a4b3a'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); if (face === 1) ctx.arc(0, -330, 8, Math.PI * 1.1, Math.PI * 1.9); else ctx.arc(0, -340, 8, .2, Math.PI - .2); ctx.stroke();
  ctx.restore();
}
// Optimus-style humanoid robot (original drawing), origin = feet
export function robot(ctx, T, x, y, s, { walk = 1, glow = 0, seed = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const sw = Math.sin(T * 4 + seed) * walk;
  if (glow > 0) glowDot(ctx, 0, -250, 330, AI_RGB, glow * .5);
  const metal = (x0, w) => { const g = ctx.createLinearGradient(x0, 0, x0 + w, 0); g.addColorStop(0, '#8b929e'); g.addColorStop(.4, '#f1f4f8'); g.addColorStop(1, '#7d8591'); return g; };
  [[-22, -sw], [22, sw]].forEach(([lx, sv]) => { ctx.save(); ctx.translate(lx, -140); ctx.rotate(sv * .3); ctx.fillStyle = metal(-14, 28); rr(ctx, -14, 0, 28, 100, 10); ctx.fill(); ctx.translate(0, 98); ctx.rotate(-Math.abs(sv) * .25); rr(ctx, -12, 0, 24, 46, 8); ctx.fill(); ctx.fillStyle = '#15181e'; rr(ctx, -14, 40, 40, 14, 7); ctx.fill(); ctx.restore(); });
  ctx.fillStyle = metal(-48, 96); rr(ctx, -46, -312, 92, 176, 26); ctx.fill(); ctx.fillStyle = '#15181e'; rr(ctx, -24, -280, 48, 34, 9); ctx.fill(); ctx.fillStyle = `rgba(${AI_RGB},${.5 + .4 * Math.sin(T * 3 + seed)})`; rr(ctx, -16, -272, 32, 6, 3); ctx.fill();
  [-1, 1].forEach(d => { ctx.save(); ctx.translate(d * 58, -294); ctx.rotate(d * .12 + (d > 0 ? sw : -sw) * .5); ctx.fillStyle = metal(-12, 24); rr(ctx, -12, 0, 24, 90, 11); ctx.fill(); ctx.translate(0, 88); ctx.rotate(-.3 * Math.abs(sw)); rr(ctx, -11, 0, 22, 84, 10); ctx.fill(); ctx.fillStyle = '#15181e'; ctx.beginPath(); ctx.arc(0, 90, 13, 0, 7); ctx.fill(); ctx.restore(); });
  ctx.fillStyle = metal(-24, 48); rr(ctx, -10, -330, 20, 22, 6); ctx.fill(); rr(ctx, -34, -392, 68, 66, 28); ctx.fill(); ctx.fillStyle = '#0b0d12'; rr(ctx, -27, -376, 54, 36, 16); ctx.fill();
  ctx.fillStyle = AI; ctx.shadowColor = AI; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(-11, -358, 4, 0, 7); ctx.arc(11, -358, 4, 0, 7); ctx.fill(); ctx.restore();
}
// glossy chip die (square, pins, inner grid, label)
export function chip(ctx, T, x, y, w, { label = 'AI', col = AI, rgb = AI_RGB, glow = 1, pins = 7, a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
  if (glow > 0) glowDot(ctx, 0, 0, w * 1.1, rgb, glow * .8);
  ctx.fillStyle = '#9aa3b2'; for (let i = 0; i < pins; i++) { const t = (i - (pins - 1) / 2) * (w * .8 / pins); ctx.fillRect(t - 4, -w / 2 - 14, 8, 16); ctx.fillRect(t - 4, w / 2 - 2, 8, 16); ctx.fillRect(-w / 2 - 14, t - 4, 16, 8); ctx.fillRect(w / 2 - 2, t - 4, 16, 8); }
  ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; rr(ctx, -w / 2, -w / 2, w, w, w * .12); let g = ctx.createLinearGradient(-w / 2, -w / 2, w / 2, w / 2); g.addColorStop(0, '#2d3446'); g.addColorStop(1, '#0f121b'); ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.strokeStyle = `rgba(${rgb},.8)`; ctx.lineWidth = 3; ctx.stroke();
  ctx.save(); rr(ctx, -w * .38, -w * .38, w * .76, w * .76, w * .06); ctx.clip(); ctx.strokeStyle = `rgba(${rgb},.18)`; ctx.lineWidth = 1.5; for (let k = -4; k <= 4; k++) { ctx.beginPath(); ctx.moveTo(k * w * .1, -w); ctx.lineTo(k * w * .1, w); ctx.moveTo(-w, k * w * .1); ctx.lineTo(w, k * w * .1); ctx.stroke(); }
  const sy = ((T * .4) % 1.4 - .2) * w * .9 - w * .45; g = ctx.createLinearGradient(0, sy - 30, 0, sy + 30); g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(.5, `rgba(${rgb},.35)`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.fillRect(-w / 2, sy - 30, w, 60); ctx.restore();
  txt(ctx, label, 0, w * .13, w * .36, col, 900); ctx.restore();
}
// planet with atmosphere glow; centre (x,y), radius r
export function planet(ctx, T, x, y, r, { a = 1 } = {}) {
  ctx.save(); ctx.globalAlpha *= a; glowDot(ctx, x, y, r * 1.3, '90,160,255', .8);
  let g = ctx.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r); g.addColorStop(0, '#4a8fe8'); g.addColorStop(.6, '#1c4aa0'); g.addColorStop(1, '#071a40'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip(); ctx.fillStyle = 'rgba(80,190,120,.55)';
  for (let i = 0; i < 6; i++) { const ang = i * 1.1 + T * .06, cx = x + Math.cos(ang) * r * .6, cy = y + Math.sin(i * 2.3) * r * .55; ctx.beginPath(); ctx.ellipse(cx, cy, r * (.14 + .1 * hash(i, 3)), r * (.1 + .08 * hash(i, 4)), ang, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(x + ((hash(i, 6) * 2.2 - 1.1 + T * .02 * (1 + i % 2)) % 2.2 - 1.1) * r, y + (hash(i, 7) - .5) * r * 1.4, r * .3, r * .05, 0, 0, 7); ctx.fill(); }
  g = ctx.createRadialGradient(x + r * .5, y + r * .5, r * .2, x + r * .5, y + r * .5, r * 1.4); g.addColorStop(0, 'rgba(0,0,10,0)'); g.addColorStop(1, 'rgba(0,0,10,.75)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
  ctx.strokeStyle = 'rgba(140,200,255,.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.restore();
}
// data-centre satellite: solar wings + a rack module
export function dcSat(ctx, T, x, y, s, { rot = 0, lit = 1 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  [-1, 1].forEach(d => { ctx.save(); ctx.translate(d * 70, 0); let g = ctx.createLinearGradient(0, -40, 0, 40); g.addColorStop(0, '#1d3a8c'); g.addColorStop(1, '#0b1a50'); ctx.fillStyle = g; ctx.fillRect(d > 0 ? 0 : -190, -44, 190, 88); ctx.strokeStyle = 'rgba(160,200,255,.45)'; ctx.lineWidth = 2; for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo((d > 0 ? 0 : -190) + k * 38, -44); ctx.lineTo((d > 0 ? 0 : -190) + k * 38, 44); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(d > 0 ? 0 : -190, 0); ctx.lineTo(d > 0 ? 190 : 0, 0); ctx.stroke(); ctx.restore(); });
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 24; rr(ctx, -70, -70, 140, 140, 16); const g = ctx.createLinearGradient(-70, -70, 70, 70); g.addColorStop(0, '#cfd5df'); g.addColorStop(1, '#79808c'); ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#10131a'; rr(ctx, -54, -54, 108, 108, 8); ctx.fill();
  for (let i = 0; i < 6; i++) { const yy = -48 + i * 17; ctx.fillStyle = '#1f2533'; ctx.fillRect(-48, yy, 96, 13); for (let j = 0; j < 6; j++) { const on = hash(i * 7 + j, 11 + Math.floor(T * 3 * (1 + hash(i, 9)))) > .35; ctx.fillStyle = on ? `rgba(${AI_RGB},${.9 * lit})` : 'rgba(80,100,130,.5)'; ctx.fillRect(-42 + j * 15, yy + 4, 8, 5); } }
  ctx.restore();
}
// share certificate: kind 't' (Tesla red) or 's' (SpaceX white). Draws centred at (x,y), width w
export function shareCard(ctx, T, x, y, w, kind = 't', { price = null, a = 1, rot = 0, half = 1, tagTxt = '1 SHARE' } = {}) {
  if (a <= 0) return; const h = w * .62; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot);
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 16;
  const tes = kind === 't'; rr(ctx, -w / 2, -h / 2, w * half, h, w * .05); let g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  if (tes) { g.addColorStop(0, '#ff4a5c'); g.addColorStop(1, '#a30d22'); } else { g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#bcc6d6'); } ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.save(); rr(ctx, -w / 2, -h / 2, w * half, h, w * .05); ctx.clip();
  ctx.strokeStyle = tes ? 'rgba(255,255,255,.14)' : 'rgba(40,60,100,.12)'; ctx.lineWidth = 1.5; for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.ellipse(w * .2, h * .1, w * (.12 + k * .06), h * (.1 + k * .05), 0, 0, 7); ctx.stroke(); }
  const sh = ctx.createLinearGradient(-w / 2, -h / 2, -w / 2, h * .1); sh.addColorStop(0, 'rgba(255,255,255,.3)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sh; ctx.fillRect(-w / 2, -h / 2, w, h * .6);
  const sx = ((T * .35) % 1.6 - .3) * w * 1.4 - w * .7; ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.moveTo(sx, -h / 2); ctx.lineTo(sx + w * .16, -h / 2); ctx.lineTo(sx - w * .08, h / 2); ctx.lineTo(sx - w * .24, h / 2); ctx.fill();
  if (tes) { teslaT(ctx, -w * .3, -h * .06, w * .2, 'tesla_w'); txt(ctx, tagTxt, w * .04, -h * .02, w * .085, '#fff', 900, 'left'); txt(ctx, 'TSLA', w * .04, h * .16, w * .06, 'rgba(255,255,255,.8)', 700, 'left', MONO); }
  else { logo(ctx, 'spacex', 0, -h * .08, w * .66, 1); txt(ctx, tagTxt, 0, h * .24, w * .085, '#1a2030', 900, 'center'); }
  ctx.restore(); ctx.restore();
}
// price tag under a card
export function priceTag(ctx, x, y, v, { a = 1, col = '#fff', bg = '#10131b', size = 40, label = 'USD' } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = FONT(900, size); const s = '$' + v, w = ctx.measureText(s).width + size * 1.1, h = size * 1.7;
  rr(ctx, x - w / 2, y - h / 2, w, h, h / 2); ctx.fillStyle = bg; ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 18; ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y + 2); ctx.textBaseline = 'alphabetic'; ctx.restore();
}
// dollar bill (top view)
export function bill(ctx, x, y, w, rot = 0, a = 1, big = '$') {
  if (a <= 0) return; const h = w * .46; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot);
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6; rr(ctx, -w / 2, -h / 2, w, h, 6); const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#4f9a62'); g.addColorStop(.5, '#7cc88c'); g.addColorStop(1, '#4a9560'); ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 2; rr(ctx, -w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 4); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.arc(0, 0, h * .3, 0, 7); ctx.fill();
  txt(ctx, big, 0, h * .17, h * .46, '#1e5a30', 900); ctx.restore();
}
export function coin(ctx, T, x, y, r, { a = 1, spin = 1, txtc = '$' } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(Math.max(.12, Math.abs(Math.cos(T * spin * 2 + x * .01))), 1);
  let g = ctx.createRadialGradient(-r * .3, -r * .3, 2, 0, 0, r); g.addColorStop(0, '#fff0a8'); g.addColorStop(.6, '#f2b91d'); g.addColorStop(1, '#a8740a'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(120,80,0,.6)'; ctx.lineWidth = r * .08; ctx.beginPath(); ctx.arc(0, 0, r * .78, 0, 7); ctx.stroke(); txt(ctx, txtc, 0, r * .3, r * .9, '#8a5a06', 900); ctx.restore();
}
// paper agreement document
export function doc(ctx, T, x, y, w, { a = 1, rot = 0, lines = 6, head = 'AGREEMENT AND', head2 = 'PLAN OF MERGER', dark = false } = {}) {
  if (a <= 0) return; const h = w * 1.32; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; rr(ctx, -w / 2, -h / 2, w, h, 8); const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#fffdf6'); g.addColorStop(1, '#ece4cf'); ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  txt(ctx, head, 0, -h / 2 + w * .13, w * .062, '#2a2418', 800, 'center', (wt, px) => `${wt} ${px}px Georgia, serif`); txt(ctx, head2, 0, -h / 2 + w * .2, w * .062, '#2a2418', 800, 'center', (wt, px) => `${wt} ${px}px Georgia, serif`);
  teslaT(ctx, -w * .12, -h / 2 + w * .31, w * .09, 'tesla'); logo(ctx, 'spacex', w * .1, -h / 2 + w * .31, w * .26, 1);
  for (let k = 0; k < lines; k++) { ctx.fillStyle = 'rgba(40,36,26,.35)'; ctx.fillRect(-w * .38, -h / 2 + w * .46 + k * w * .075, w * (.76 - .18 * hash(k, 3)), w * .016); }
  ctx.fillStyle = 'rgba(40,36,26,.6)'; ctx.fillRect(-w * .38, h / 2 - w * .13, w * .3, 2); ctx.fillRect(w * .08, h / 2 - w * .13, w * .3, 2); ctx.restore();
}
export function pie(ctx, T, cx, cy, r, frac, { col = '#2f7bff', base = '#dfe4ec', depth = 26, rim = true, a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(cx, cy); ctx.scale(1, .46);
  const disc = (dy, fill, ang0 = 0, ang1 = Math.PI * 2, mid = true) => { ctx.fillStyle = fill; ctx.beginPath(); if (mid) ctx.moveTo(0, dy); ctx.arc(0, dy, r, ang0, ang1); if (mid) ctx.closePath(); ctx.fill(); };
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 40; disc(depth, '#b7bfcd'); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = '#aeb6c4'; ctx.fillRect(-r, 0, r * 2, depth); disc(0, base);
  const a1 = -Math.PI / 2, a2 = a1 + Math.PI * 2 * frac, lift = 20 * clamp(frac * 3);
  if (frac > .001) { ctx.fillStyle = shade(col, -.35); ctx.beginPath(); ctx.moveTo(0, -lift + depth); ctx.arc(0, -lift + depth, r, a1, a2); ctx.closePath(); ctx.fill(); disc(-lift, col, a1, a2); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.moveTo(0, -lift); ctx.arc(0, -lift, r * .96, a1, a2); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function shade(hex, k) { const n = parseInt(hex.slice(1), 16), c = i => Math.round(clamp(((n >> (16 - 8 * i)) & 255) * (1 + k), 0, 255)); return `rgb(${c(0)},${c(1)},${c(2)})`; }
// stack of bills on a surface
export function cashStack(ctx, T, x, y, w, n = 6, { a = 1 } = {}) { for (let i = 0; i < n; i++) bill(ctx, x + (hash(i, 2) - .5) * 14, y - i * 14, w, (hash(i, 5) - .5) * .06, a); }
// speech bubble
export function bubble(ctx, x, y, w, h, tailX, { fill = '#fff', stroke = 'rgba(0,0,0,.08)', a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10; rr(ctx, x - w / 2, y - h / 2, w, h, 26); ctx.fillStyle = fill; ctx.fill();
  ctx.beginPath(); ctx.moveTo(tailX - 18, y + h / 2 - 2); ctx.lineTo(tailX, y + h / 2 + 36); ctx.lineTo(tailX + 22, y + h / 2 - 2); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; rr(ctx, x - w / 2, y - h / 2, w, h, 26); ctx.stroke(); ctx.restore();
}
// glass door / window (meeting room) background wall: x,y,w,h
export function glassRoom(ctx, T, x, y, w, h, { a = 1, dark = true } = {}) {
  ctx.save(); ctx.globalAlpha *= a; rr(ctx, x, y, w, h, 24); let g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, dark ? '#1a2442' : '#dfe6f4'); g.addColorStop(1, dark ? '#0b1022' : '#c3cde2'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); rr(ctx, x, y, w, h, 24); ctx.clip();
  for (let i = 0; i < 4; i++) { const gx = x + w * (i + .5) / 4; ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.fillRect(gx - 22, y, 44, h); }
  const sx = ((T * .12) % 1.4 - .2) * (w + 300) - 150; ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.beginPath(); ctx.moveTo(x + sx, y); ctx.lineTo(x + sx + 120, y); ctx.lineTo(x + sx - 60, y + h); ctx.lineTo(x + sx - 180, y + h); ctx.fill();
  g = ctx.createLinearGradient(0, y + h * .72, 0, y + h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = g; ctx.fillRect(x, y + h * .72, w, h * .28); ctx.restore();
  ctx.strokeStyle = dark ? 'rgba(170,200,255,.35)' : 'rgba(40,60,100,.25)'; ctx.lineWidth = 3; rr(ctx, x, y, w, h, 24); ctx.stroke(); ctx.restore();
}
export function table(ctx, x, y, w, h = 70, col = '#6e4a2c') { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12; rr(ctx, x - w / 2, y, w, h, 14); const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#9b6d42'); g.addColorStop(1, col); ctx.fillStyle = g; ctx.fill(); ctx.restore(); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x - w / 2 + 14, y + 4, w - 28, 3); }
export const money = n => n >= 1e12 ? (n / 1e12).toFixed(1) + 'T' : n.toLocaleString('en-US');
