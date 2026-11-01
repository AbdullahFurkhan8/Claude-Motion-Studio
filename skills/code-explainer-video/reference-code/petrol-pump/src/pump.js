// Drawing kit for the "petrol pump first click" explainer. Pure functions of their inputs + time T (deterministic).
// Night forecourt, glossy dispenser with LCD meter, glossy car, x-ray fuel nozzle (venturi hole, air tube, diaphragm, valve),
// car tank cutaway, charcoal canister, dashboard check-engine light, LED price board.
import { W, H, clamp, lerp, eo, eio, eback, hash, rr } from './lib.js';
import { FONT, MONO, txt, glowDot } from './kit.js';
export const ORANGE = '#ff8a3d', ORANGE_RGB = '255,138,61', CYAN = '#5ee6ff', CYAN_RGB = '94,230,255', FUEL_RGB = '255,176,70', AMBER_RGB = '255,184,60';
export const SALMON = '#ffae8a';

// ---------- background ----------
export function bgNight(ctx, T, { horizon = 1180, canopy = 1, ground = 1 } = {}) {
  let g = ctx.createLinearGradient(0, 0, 0, horizon); g.addColorStop(0, '#04070f'); g.addColorStop(1, '#0d1a34');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  if (ground > 0) { // asphalt with converging forecourt lines
    ctx.save(); ctx.globalAlpha = ground;
    g = ctx.createLinearGradient(0, horizon, 0, H + 200); g.addColorStop(0, '#1c2230'); g.addColorStop(1, '#090b10');
    ctx.fillStyle = g; ctx.fillRect(-W, horizon, W * 3, H * 2);
    ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = -8; i <= 8; i++) { ctx.moveTo(W / 2 + i * 40, horizon); ctx.lineTo(W / 2 + i * 420, H + 300); }
    for (let k = 0; k < 7; k++) { const y = horizon + Math.pow((k + (T * .15) % 1) / 7, 2) * (H - horizon + 300); ctx.moveTo(-W, y); ctx.lineTo(W * 2, y); }
    ctx.stroke(); ctx.restore();
  }
  if (canopy > 0) { // canopy lights glow from above the frame
    ctx.save(); ctx.globalAlpha = canopy; ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { const x = 180 + i * 360 + 20 * Math.sin(T * .3 + i); glowDot(ctx, x, 470, 360, '120,160,255', .35); }
    ctx.restore();
  }
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 40; i++) { // floating dust
    const x = ((hash(i) * W + T * 12 * (hash(i, 2) - .5)) % W + W) % W, y = ((hash(i, 1) * H - T * 9 * hash(i, 3)) % H + H) % H;
    ctx.globalAlpha = (.05 + .16 * hash(i, 4)) * (.6 + .4 * Math.sin(T * 2 + i)); ctx.beginPath(); ctx.arc(x, y, .8 + 1.6 * hash(i, 5), 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
  g = ctx.createRadialGradient(W / 2, H * .58, H * .3, W / 2, H * .58, H * .85); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.6)');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
}
export function bgBlue(ctx, T) { // soft studio blue for the x-ray close-ups (like a glossy car panel out of focus)
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#060b18'); g.addColorStop(.55, '#0f2554'); g.addColorStop(1, '#1b3f8f');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  glowDot(ctx, 820 + 60 * Math.sin(T * .4), 1500, 900, '60,110,230', .45); glowDot(ctx, 150, 700 + 40 * Math.sin(T * .3), 500, '40,70,160', .3);
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,.04)';
  for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(-200 + i * 380 + (T * 10) % 380, 0); ctx.rotate(.5); ctx.fillRect(0, -400, 60 + 40 * hash(i), 3000); ctx.restore(); }
}

// LCD digits with ghost 8s + glow
export function lcd(ctx, s, x, y, size, rgb = AMBER_RGB, align = 'right', a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.font = MONO(700, size); ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = `rgba(${rgb},.08)`; ctx.fillText(s.replace(/[0-9]/g, '8'), x, y);
  ctx.shadowColor = `rgba(${rgb},.9)`; ctx.shadowBlur = size * .35; ctx.fillStyle = `rgb(${rgb})`; ctx.fillText(s, x, y); ctx.restore();
}
// small dark tag with title + mono subtitle and a leader line to (lx,ly)
export function tag(ctx, x, y, title, sub, a = 1, lx, ly, { accent = CYAN_RGB, size = 30 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a);
  ctx.font = FONT(800, size); const w1 = ctx.measureText(title).width; ctx.font = MONO(600, size * .55); const w2 = sub ? ctx.measureText(sub).width : 0;
  const w = Math.max(w1, w2) + 44, h = sub ? size * 2.3 : size * 1.7, bx = x - w / 2, by = y - h / 2;
  if (lx !== undefined) {
    const k = eo(a); ctx.strokeStyle = `rgba(${accent},.85)`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y + (ly > y ? h / 2 : -h / 2)); ctx.lineTo(lerp(x, lx, k), lerp(y + (ly > y ? h / 2 : -h / 2), ly, k)); ctx.stroke();
    ctx.fillStyle = `rgb(${accent})`; ctx.beginPath(); ctx.arc(lx, ly, 7 * k, 0, 7); ctx.fill();
  }
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  rr(ctx, bx, by, w, h, 14); ctx.fillStyle = 'rgba(14,18,28,.92)'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = `rgba(${accent},.55)`; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = `rgb(${accent})`; rr(ctx, bx, by + 12, 5, h - 24, 3); ctx.fill();
  txt(ctx, title, x, by + (sub ? size * 1.15 : size * 1.2), size, '#fff', 800);
  if (sub) { ctx.letterSpacing = '2px'; txt(ctx, sub, x, by + size * 1.85, size * .55, 'rgba(190,205,225,.8)', 600, 'center', MONO); ctx.letterSpacing = '0px'; }
  ctx.restore();
}
// status pill with a pulsing dot ("● TANK IS ALREADY FULL")
export function status(ctx, T, x, y, s, rgb = '70,230,140', a = 1, size = 24) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.font = MONO(700, size); ctx.letterSpacing = '3px';
  const w = ctx.measureText(s).width + 80, h = size * 2;
  rr(ctx, x - w / 2, y - h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(10,14,22,.85)'; ctx.fill(); ctx.strokeStyle = `rgba(${rgb},.6)`; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = `rgb(${rgb})`; ctx.beginPath(); ctx.arc(x - w / 2 + 30, y, 7 + 2 * Math.sin(T * 6), 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, x - w / 2 + 50, y + 1); ctx.restore();
}

// ---------- dispenser ----------
// centred on cx, standing on base; returns {hoseX, hoseY, screen:{x,y,w,h}} in world coords
export function dispenser(ctx, T, cx, base, s = 1, { sale = 0, gal = 0, screen = null, lit = 0, press = 0, holster = false } = {}) {
  const w = 380, h = 980;
  ctx.save(); ctx.translate(cx, base); ctx.scale(s, s);
  // island plinth
  let g = ctx.createLinearGradient(0, -10, 0, 90); g.addColorStop(0, '#d9dde3'); g.addColorStop(.15, '#9aa1ab'); g.addColorStop(1, '#4b5059');
  rr(ctx, -270, -14, 540, 110, 14); ctx.fillStyle = g; ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(-262, -14, 524, 3);
  // body
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20;
  g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#aeb6c1'); g.addColorStop(.18, '#f4f6f9'); g.addColorStop(.55, '#ffffff'); g.addColorStop(.85, '#cfd5dd'); g.addColorStop(1, '#8c95a2');
  rr(ctx, -w / 2, -h, w, h - 10, 26); ctx.fillStyle = g; ctx.fill(); ctx.restore();
  // specular sweep
  ctx.save(); rr(ctx, -w / 2, -h, w, h - 10, 26); ctx.clip();
  const sx = -w + ((T * 90) % (w * 3)); g = ctx.createLinearGradient(sx, 0, sx + 140, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(-w, -h, w * 2, h);
  // orange header with glow
  g = ctx.createLinearGradient(0, -h, 0, -h + 120); g.addColorStop(0, '#ffa257'); g.addColorStop(1, '#e8641d'); ctx.fillStyle = g; ctx.fillRect(-w / 2, -h, w, 120);
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-w / 2, -h + 6, w, 4);
  ctx.letterSpacing = '10px'; txt(ctx, 'FUEL', 6, -h + 80, 52, '#fff', 900); ctx.letterSpacing = '0px';
  ctx.fillStyle = '#e8641d'; ctx.fillRect(-w / 2, -260, w, 16);
  ctx.restore();
  // screen
  const sx0 = -w / 2 + 30, sy0 = -h + 150, sw = w - 60, sh = 330;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 16; rr(ctx, sx0 - 8, sy0 - 8, sw + 16, sh + 16, 18); ctx.fillStyle = '#2b3038'; ctx.fill(); ctx.restore();
  rr(ctx, sx0, sy0, sw, sh, 12); g = ctx.createLinearGradient(0, sy0, 0, sy0 + sh); g.addColorStop(0, '#0b0f14'); g.addColorStop(1, '#05070a'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); rr(ctx, sx0, sy0, sw, sh, 12); ctx.clip();
  if (screen) screen(ctx, sx0, sy0, sw, sh);
  else {
    ctx.letterSpacing = '3px'; txt(ctx, 'SALE  $', sx0 + 20, sy0 + 40, 18, 'rgba(255,200,120,.7)', 700, 'left', MONO);
    txt(ctx, 'GALLONS', sx0 + 20, sy0 + 160, 18, 'rgba(255,200,120,.7)', 700, 'left', MONO);
    txt(ctx, 'PRICE / GAL', sx0 + 20, sy0 + 270, 16, 'rgba(255,200,120,.55)', 700, 'left', MONO); ctx.letterSpacing = '0px';
    lcd(ctx, sale.toFixed(2), sx0 + sw - 20, sy0 + 122, 74); lcd(ctx, gal.toFixed(3), sx0 + sw - 20, sy0 + 232, 54, '120,255,170');
    lcd(ctx, '3.49', sx0 + sw - 20, sy0 + 306, 34, '255,120,90');
  }
  g = ctx.createLinearGradient(sx0, sy0, sx0 + sw, sy0 + sh); g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(.4, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(sx0, sy0, sw, sh);
  ctx.restore();
  // grade buttons
  ['87', '89', '93'].forEach((n, i) => {
    const bx = -w / 2 + 30 + i * 112, by = -h + 510, on = i === 0 ? 1 : 0, pr = i === 0 ? press : 0;
    rr(ctx, bx, by + pr * 4, 96, 70, 12); ctx.fillStyle = on ? '#1d9a52' : '#2a3039'; ctx.fill();
    if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, bx + 48, by + 35, 90, '60,230,130', .4 + .6 * lit); ctx.restore(); }
    txt(ctx, n, bx + 48, by + 48 + pr * 4, 30, '#fff', 800);
  });
  // holster recess
  rr(ctx, -w / 2 + 60, -h + 620, w - 120, 180, 20); g = ctx.createLinearGradient(0, -h + 620, 0, -h + 800); g.addColorStop(0, '#0f1217'); g.addColorStop(1, '#2a2f37'); ctx.fillStyle = g; ctx.fill();
  if (holster) { ctx.fillStyle = '#16191f'; rr(ctx, -40, -h + 640, 80, 150, 20); ctx.fill(); }
  ctx.restore();
  return { hoseX: cx + s * (w / 2 - 20), hoseY: base - s * 300, screen: { x: cx + s * sx0, y: base + s * sy0, w: sw * s, h: sh * s } };
}

// ---------- car (side, glossy) ----------
// origin = fuel filler. Rear of car to the left (x -220), front off to the right.
export function car(ctx, T, x, y, s = 1, { door = 1, ghost = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const body = () => {
    ctx.beginPath(); ctx.moveTo(-210, 300); ctx.lineTo(-228, 40); ctx.quadraticCurveTo(-225, -100, -150, -110); ctx.lineTo(70, -130);
    ctx.quadraticCurveTo(170, -330, 320, -380); ctx.quadraticCurveTo(560, -420, 860, -385); ctx.quadraticCurveTo(980, -300, 1080, -170);
    ctx.lineTo(1700, -120); ctx.lineTo(1700, 300); ctx.closePath();
  };
  // shadow
  ctx.save(); const sg = ctx.createRadialGradient(600, 470, 50, 600, 470, 1000); sg.addColorStop(0, 'rgba(0,0,0,.65)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.scale(1, .18); ctx.fillRect(-500, 470 / .18 - 1200, 2400, 2400); ctx.restore();
  ctx.save(); ctx.globalAlpha *= 1 - ghost * .8;
  let g = ctx.createLinearGradient(0, -420, 0, 320); g.addColorStop(0, '#6c9cff'); g.addColorStop(.28, '#2a62e0'); g.addColorStop(.55, '#143c9e'); g.addColorStop(1, '#071746');
  body(); ctx.fillStyle = g; ctx.fill();
  ctx.save(); body(); ctx.clip();
  // beltline reflection + moving specular
  g = ctx.createLinearGradient(0, -150, 0, -40); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(210,230,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(-300, -150, 2100, 110);
  const sx = -600 + ((T * 160) % 2600); g = ctx.createLinearGradient(sx, 0, sx + 260, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(-300, -450, 2100, 800);
  ctx.strokeStyle = 'rgba(0,10,40,.45)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(470, -120); ctx.lineTo(480, 280); ctx.stroke(); // door seam
  ctx.restore();
  // windows
  ctx.beginPath(); ctx.moveTo(120, -140); ctx.quadraticCurveTo(200, -300, 330, -350); ctx.quadraticCurveTo(560, -385, 840, -355); ctx.quadraticCurveTo(940, -270, 1010, -170); ctx.closePath();
  g = ctx.createLinearGradient(0, -380, 0, -140); g.addColorStop(0, '#22324f'); g.addColorStop(1, '#070b14'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(160,190,255,.16)'; ctx.beginPath(); ctx.moveTo(300, -400); ctx.lineTo(420, -400); ctx.lineTo(260, -100); ctx.lineTo(140, -100); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#0a1330'; ctx.fillRect(455, -360, 26, 230);
  // tail light
  g = ctx.createLinearGradient(-230, 0, -170, 0); g.addColorStop(0, '#ff3a3a'); g.addColorStop(1, '#8a0f14'); rr(ctx, -232, -60, 52, 90, 14); ctx.fillStyle = g; ctx.fill();
  // fuel door recess + open flap
  ctx.fillStyle = '#050a1a'; ctx.beginPath(); ctx.arc(0, 0, 52, 0, 7); ctx.fill();
  g = ctx.createRadialGradient(-10, -10, 4, 0, 0, 40); g.addColorStop(0, '#3a3f48'); g.addColorStop(1, '#101318'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fill();
  if (door > 0) { ctx.save(); ctx.translate(-56, 0); ctx.scale(.35 * door + .05, 1); g = ctx.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, '#0f2f86'); g.addColorStop(1, '#4f86ff'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(-50, 0, 54, 0, 7); ctx.fill(); ctx.restore(); }
  ctx.restore();
  // wheels
  wheel(ctx, T, 200, 300, 150, ghost); wheel(ctx, T, 1450, 300, 150, ghost);
  ctx.restore();
}
function wheel(ctx, T, x, y, r, ghost = 0) {
  ctx.save(); ctx.globalAlpha *= 1 - ghost * .7;
  ctx.fillStyle = '#03060f'; ctx.beginPath(); ctx.arc(x, y - 6, r + 22, Math.PI, 0); ctx.fill();
  let g = ctx.createRadialGradient(x - r * .3, y - r * .3, r * .2, x, y, r); g.addColorStop(0, '#2c2f36'); g.addColorStop(1, '#0a0b0e');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  g = ctx.createRadialGradient(x - 20, y - 25, 5, x, y, r * .62); g.addColorStop(0, '#f4f6fa'); g.addColorStop(.7, '#9aa2ae'); g.addColorStop(1, '#4b525d');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * .62, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(40,46,56,.8)'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const a = i * 1.2566 + T * .05; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * .18, y + Math.sin(a) * r * .18); ctx.lineTo(x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .55); ctx.stroke(); }
  ctx.fillStyle = '#e8ebf0'; ctx.beginPath(); ctx.arc(x, y, r * .12, 0, 7); ctx.fill();
  ctx.restore();
}

// ---------- fuel nozzle (x-ray capable) ----------
// local frame: origin = handle/spout joint, spout along +x to tip at x=640, handle toward -x. o.shell 1 = opaque, 0 = glass x-ray.
export const NZ = { tip: [640, 0], hole: [560, -34], dia: [-230, -150], valve: [-120, 0], tube: [-40, -18], rear: [-600, -10] };
export const nzP = (o, lx, ly) => { const c = Math.cos(o.ang || 0), sn = Math.sin(o.ang || 0), s = o.s || 1; return [o.x + s * (lx * c - ly * sn), o.y + s * (lx * sn + ly * c)]; };
const airPath = u => { // hole -> along tube -> up into diaphragm chamber
  const pts = [[560, -40], [560, -18], [-40, -18], [-150, -60], [-230, -128]];
  const segs = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1])), L = segs.reduce((a, b) => a + b, 0);
  let d = u * L; for (let i = 0; i < segs.length; i++) { if (d <= segs[i]) { const k = d / segs[i]; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; } d -= segs[i]; }
  return pts[pts.length - 1];
};
export function nozzle(ctx, T, o) {
  const { shell = 1, flow = 0, air = 0, hole = 0, vac = 0, dia = 0, valve = 0, hose = true, a = 1 } = o;
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(o.x, o.y); ctx.rotate(o.ang || 0); ctx.scale(o.s || 1, o.s || 1);
  const xr = 1 - shell; // x-ray amount
  if (hose) { // rubber hose out of the back
    ctx.lineCap = 'round'; ctx.strokeStyle = '#0c0d10'; ctx.lineWidth = 64; ctx.beginPath(); ctx.moveTo(-560, -10); ctx.bezierCurveTo(-800, -20, -950, -200, -1150, -480); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-560, -30); ctx.bezierCurveTo(-800, -40, -940, -220, -1140, -500); ctx.stroke();
  }
  const handle = () => { ctx.beginPath(); ctx.roundRect(-600, -95, 600, 170, 46); ctx.roundRect(-360, -205, 260, 140, 60); };
  const spout = () => { ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(600, -34); ctx.quadraticCurveTo(650, -30, 650, 0); ctx.quadraticCurveTo(650, 30, 600, 34); ctx.lineTo(0, 34); ctx.closePath(); };
  // trigger guard + lever
  ctx.strokeStyle = shell > .5 ? '#1a1d22' : `rgba(170,200,255,${.35 + .4 * shell})`; ctx.lineWidth = 18; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-70, 70); ctx.quadraticCurveTo(-120, 230, -330, 220); ctx.quadraticCurveTo(-520, 210, -560, 70); ctx.stroke();
  ctx.lineWidth = 22; ctx.strokeStyle = shell > .5 ? '#2d3138' : `rgba(200,220,255,${.4 + .4 * shell})`; ctx.beginPath(); ctx.moveTo(-100, 100); ctx.lineTo(-470, 130 - 25 * (1 - valve) * (flow > 0 ? 1 : 0)); ctx.stroke();
  // ---- internals (visible in x-ray) ----
  if (xr > 0) {
    ctx.save(); ctx.globalAlpha *= xr;
    // glass ghost bodies
    handle(); ctx.fillStyle = 'rgba(150,185,255,.10)'; ctx.fill(); ctx.strokeStyle = 'rgba(190,215,255,.55)'; ctx.lineWidth = 3; ctx.stroke();
    spout(); ctx.fillStyle = 'rgba(150,185,255,.10)'; ctx.fill(); ctx.stroke();
    // fuel channel
    ctx.fillStyle = 'rgba(255,170,70,.10)'; ctx.fillRect(-600, -44, 600, 88); ctx.fillRect(0, -26, 610, 52);
    // valve seat + poppet
    ctx.fillStyle = '#6b7380'; ctx.fillRect(-112, -44, 16, 26); ctx.fillRect(-112, 18, 16, 26);
    const vx = lerp(-185, -128, eback(valve));
    let g = ctx.createLinearGradient(vx - 14, 0, vx + 14, 0); g.addColorStop(0, '#ffcf9e'); g.addColorStop(1, '#e0703a');
    ctx.fillStyle = g; rr(ctx, vx - 14, -40, 28, 80, 10); ctx.fill();
    ctx.strokeStyle = 'rgba(255,207,158,.8)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(vx, -40); ctx.lineTo(vx, -70); ctx.lineTo(-230, -120 - 34 * dia); ctx.stroke();
    // diaphragm chamber
    ctx.save(); ctx.beginPath(); ctx.ellipse(-230, -150, 105, 46, 0, 0, 7); ctx.fillStyle = `rgba(${vac > 0 ? '120,90,255' : '40,60,100'},${.25 + .35 * vac * (.8 + .2 * Math.sin(T * 12))})`; ctx.fill();
    ctx.strokeStyle = 'rgba(190,215,255,.6)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    ctx.strokeStyle = SALMON; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-330, -140); ctx.quadraticCurveTo(-230, -140 - 60 * dia, -130, -140); ctx.stroke();
    if (dia > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, -230, -150 - 30 * dia, 90, '255,174,138', .5 * dia); ctx.restore(); }
    // air tube
    ctx.strokeStyle = `rgba(${CYAN_RGB},.75)`; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(560, -34); ctx.lineTo(560, -18); ctx.lineTo(-40, -18); ctx.lineTo(-150, -60); ctx.lineTo(-230, -112); ctx.stroke();
    // fuel stream dots (stop when flow 0)
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (flow > 0) for (let i = 0; i < 70; i++) {
      const u = ((T * .9 + hash(i)) % 1), px = lerp(-590, 650, u), py = (hash(i, 2) - .5) * (px < 0 ? 66 : 38);
      if (px > -130 && px < -100 && valve > .5) continue;
      ctx.fillStyle = `rgba(255,${190 + 40 * hash(i, 3) | 0},90,${.85 * flow})`; ctx.beginPath(); ctx.arc(px, py, 5 + 3 * hash(i, 4), 0, 7); ctx.fill();
    }
    if (air > 0) for (let i = 0; i < 26; i++) {
      const u = (T * .35 + i / 26) % 1, [px, py] = airPath(u);
      ctx.fillStyle = `rgba(${CYAN_RGB},${air * Math.min(1, u * 8, (1 - u) * 6)})`; ctx.beginPath(); ctx.arc(px, py, 6, 0, 7); ctx.fill();
    }
    ctx.restore();
    ctx.restore();
  }
  // ---- opaque shell ----
  if (shell > 0) {
    ctx.save(); ctx.globalAlpha *= shell;
    let g = ctx.createLinearGradient(0, -34, 0, 34); g.addColorStop(0, '#f2f4f7'); g.addColorStop(.35, '#a6adb8'); g.addColorStop(.7, '#5f6670'); g.addColorStop(1, '#2d3138');
    spout(); ctx.fillStyle = g; ctx.fill();
    g = ctx.createLinearGradient(0, -205, 0, 75); g.addColorStop(0, '#3a3f48'); g.addColorStop(.3, '#1e2127'); g.addColorStop(1, '#0b0c0f');
    handle(); ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.18)'; rr(ctx, -560, -80, 520, 12, 6); ctx.fill(); rr(ctx, -330, -192, 200, 10, 5); ctx.fill();
    ctx.fillStyle = ORANGE; rr(ctx, -600, -20, 60, 40, 8); ctx.fill(); // collar
    ctx.restore();
  }
  // spout spring coil (always) + hole
  ctx.strokeStyle = `rgba(230,236,245,${.35 + .4 * shell})`; ctx.lineWidth = 3;
  for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.ellipse(360 + k * 18, 0, 6, 36, 0, 0, 7); ctx.stroke(); }
  ctx.fillStyle = '#05070a'; ctx.beginPath(); ctx.ellipse(560, -33, 9, 4, 0, 0, 7); ctx.fill();
  if (hole > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 560, -34, 110, CYAN_RGB, hole * (.8 + .2 * Math.sin(T * 6)));
    ctx.strokeStyle = `rgba(${CYAN_RGB},${hole * (1 - (T * 1.2) % 1)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(560, -34, 14 + 50 * ((T * 1.2) % 1), 0, 7); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
// air being sucked into the hole from the surroundings (world coords)
export function suck(ctx, T, x, y, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 22; i++) { const u = (T * .8 + hash(i, 7)) % 1, ang = hash(i, 8) * Math.PI - Math.PI, r = lerp(170, 6, eio(u));
    ctx.fillStyle = `rgba(${CYAN_RGB},${a * Math.sin(u * Math.PI) * .9})`; ctx.beginPath(); ctx.arc(x + Math.cos(ang) * r, y + Math.sin(ang) * r * .8, 3 + 3 * (1 - u), 0, 7); ctx.fill(); }
  ctx.restore();
}
// glossy fuel liquid with a wavy surface from level down
export function liquid(ctx, T, level, { x0 = -200, x1 = W + 200, bot = H + 200, a = .85, amp = 8 } = {}) {
  ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.moveTo(x0, bot);
  for (let x = x0; x <= x1; x += 20) ctx.lineTo(x, level + amp * Math.sin(x / 70 + T * 3) + amp * .5 * Math.sin(x / 31 - T * 4.3));
  ctx.lineTo(x1, bot); ctx.closePath();
  const g = ctx.createLinearGradient(0, level - 20, 0, level + 700); g.addColorStop(0, 'rgba(255,214,140,.95)'); g.addColorStop(.08, 'rgba(255,160,60,.75)'); g.addColorStop(1, 'rgba(150,60,10,.9)');
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(255,240,200,.9)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
}

// ---------- car tank cutaway ----------
// origin = filler (same frame as car()). fill 0..1 tank level, neck 0..1 neck level, over 0..1 overflow into vent.
export function tankCut(ctx, T, x, y, s, { fill = .9, neck = 0, over = 0, can = 1, a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  const tx = 120, ty = 110, tw = 620, th = 210;
  // filler neck pipe
  const neckPath = () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(60, 20, 110, 60, 180, 120); };
  ctx.lineCap = 'round'; neckPath(); ctx.strokeStyle = 'rgba(200,220,255,.5)'; ctx.lineWidth = 58; ctx.stroke(); neckPath(); ctx.strokeStyle = '#0a1226'; ctx.lineWidth = 46; ctx.stroke();
  if (neck > 0) { ctx.save(); ctx.setLineDash([200 * neck, 400]); ctx.lineDashOffset = 0; ctx.beginPath(); ctx.moveTo(180, 120); ctx.bezierCurveTo(110, 60, 60, 20, 0, 0); ctx.strokeStyle = `rgba(${FUEL_RGB},.95)`; ctx.lineWidth = 40; ctx.stroke(); ctx.restore(); }
  // vent line to canister
  ctx.strokeStyle = 'rgba(200,220,255,.5)'; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(30, -10); ctx.lineTo(30, -80); ctx.lineTo(800, -80); ctx.lineTo(800, 120); ctx.stroke();
  if (over > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 16; i++) { const u = (T * .5 + i / 16) % 1, L = 70 + 770 + 200, d = u * L; let px, py;
      if (d < 70) { px = 30; py = -10 - d; } else if (d < 840) { px = 30 + d - 70; py = -80; } else { px = 800; py = -80 + d - 840; }
      ctx.fillStyle = `rgba(${FUEL_RGB},${over})`; ctx.beginPath(); ctx.arc(px, py, 9, 0, 7); ctx.fill(); }
    ctx.restore(); }
  // tank: glossy translucent box
  ctx.save(); rr(ctx, tx, ty, tw, th, 50); ctx.fillStyle = 'rgba(20,30,55,.85)'; ctx.fill(); ctx.clip();
  if (fill > 0) { const lv = ty + th * (1 - fill); ctx.beginPath(); ctx.moveTo(tx, ty + th);
    for (let xx = tx; xx <= tx + tw; xx += 15) ctx.lineTo(xx, lv + 5 * Math.sin(xx / 40 + T * 3)); ctx.lineTo(tx + tw, ty + th); ctx.closePath();
    const g = ctx.createLinearGradient(0, lv, 0, ty + th); g.addColorStop(0, '#ffd28a'); g.addColorStop(.1, '#ff9c3d'); g.addColorStop(1, '#a8460c'); ctx.fillStyle = g; ctx.fill(); }
  const g = ctx.createLinearGradient(0, ty, 0, ty + th); g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(.3, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(tx, ty, tw, th);
  ctx.restore();
  rr(ctx, tx, ty, tw, th, 50); ctx.strokeStyle = 'rgba(200,220,255,.7)'; ctx.lineWidth = 4; ctx.stroke();
  // canister on the vent line
  if (can > 0) charcoalBox(ctx, T, 800, 220, 240, 170, { a: can, wet: over * .6, n: 18 });
  ctx.restore();
}

// ---------- charcoal canister (pseudo-3D glass box with pellets) ----------
export function charcoalBox(ctx, T, cx, cy, w, h, { a = 1, wet = 0, n = 40, d = .35, fumes = 0 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  const dx = w * d, dy = -w * d * .6, x0 = cx - w / 2, y0 = cy - h / 2;
  // back faces
  ctx.fillStyle = 'rgba(20,26,40,.9)'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + dx, y0 + dy); ctx.lineTo(x0 + w + dx, y0 + dy); ctx.lineTo(x0 + w + dx, y0 + h + dy); ctx.lineTo(x0 + w, y0 + h); ctx.lineTo(x0, y0 + h); ctx.closePath(); ctx.fill();
  // pellets, back to front
  const pts = [];
  for (let i = 0; i < n; i++) { const u = hash(i, 11), v = hash(i, 12), z = hash(i, 13); pts.push([x0 + 16 + u * (w - 32) + dx * z, y0 + h * .3 + v * (h * .62) + dy * z, z, i]); }
  pts.sort((p, q) => q[2] - p[2]);
  const lvl = y0 + h - h * .95 * wet;
  for (const [px, py, z, i] of pts) {
    const r = w * .055 * (1 - z * .25), jig = 2 * Math.sin(T * 3 + i);
    const under = py + dy * 0 > lvl;
    const g = ctx.createRadialGradient(px - r * .35, py - r * .35 + jig, r * .1, px, py + jig, r);
    if (under) { g.addColorStop(0, '#ffe2a6'); g.addColorStop(.5, '#f4a43c'); g.addColorStop(1, '#9a4e10'); } else { g.addColorStop(0, '#9aa0ab'); g.addColorStop(.45, '#4a4f58'); g.addColorStop(1, '#16181d'); }
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py + jig, r, 0, 7); ctx.fill();
  }
  if (wet > 0) { ctx.save(); ctx.beginPath(); ctx.moveTo(x0, y0 + h); ctx.lineTo(x0, lvl); for (let xx = 0; xx <= w; xx += 10) ctx.lineTo(x0 + xx, lvl + 4 * Math.sin(xx / 20 + T * 4)); ctx.lineTo(x0 + w + dx, lvl + dy); ctx.lineTo(x0 + w + dx, y0 + h + dy); ctx.lineTo(x0 + w, y0 + h); ctx.closePath();
    ctx.fillStyle = 'rgba(255,150,50,.32)'; ctx.fill(); ctx.restore(); }
  if (fumes > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 14; i++) { const u = (T * .3 + i / 14) % 1; glowDot(ctx, x0 + w * (.2 + .6 * hash(i, 3)) + dx * .5, y0 + h * .2 - u * h * .9 + dy * .5, 40 + 30 * u, '200,210,230', fumes * .35 * Math.sin(u * Math.PI)); }
    ctx.restore(); }
  // glass front + top
  ctx.fillStyle = 'rgba(160,190,255,.10)'; ctx.fillRect(x0, y0, w, h);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + dx, y0 + dy); ctx.lineTo(x0 + w + dx, y0 + dy); ctx.lineTo(x0 + w, y0); ctx.closePath(); ctx.fillStyle = 'rgba(200,220,255,.14)'; ctx.fill();
  ctx.strokeStyle = 'rgba(210,225,255,.75)'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  ctx.strokeRect(x0, y0, w, h); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + dx, y0 + dy); ctx.lineTo(x0 + w + dx, y0 + dy); ctx.lineTo(x0 + w, y0); ctx.moveTo(x0 + w + dx, y0 + dy); ctx.lineTo(x0 + w + dx, y0 + h + dy); ctx.lineTo(x0 + w, y0 + h); ctx.stroke();
  const sg = ctx.createLinearGradient(x0, y0, x0 + w, y0 + h); sg.addColorStop(0, 'rgba(255,255,255,.18)'); sg.addColorStop(.35, 'rgba(255,255,255,0)'); ctx.fillStyle = sg; ctx.fillRect(x0, y0, w, h);
  ctx.restore();
}

// ---------- fuel gauge ----------
export function gauge(ctx, T, x, y, r, v, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.fillStyle = '#0d1119'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 3; ctx.stroke();
  const a0 = Math.PI * .8, a1 = Math.PI * 2.2;
  for (let i = 0; i <= 8; i++) { const an = lerp(a0, a1, i / 8); ctx.strokeStyle = i === 8 ? '#3cf08c' : 'rgba(255,255,255,.7)'; ctx.lineWidth = i % 4 ? 3 : 6;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r * .78, y + Math.sin(an) * r * .78); ctx.lineTo(x + Math.cos(an) * r * .92, y + Math.sin(an) * r * .92); ctx.stroke(); }
  txt(ctx, 'E', x + Math.cos(a0) * r * .58, y + Math.sin(a0) * r * .58 + 12, r * .2, '#ff6a5a', 800);
  txt(ctx, 'F', x + Math.cos(a1) * r * .58, y + Math.sin(a1) * r * .58 + 12, r * .2, '#3cf08c', 800);
  txt(ctx, '⛽', x, y + r * .55, r * .2, '#fff', 400);
  const an = lerp(a0, a1, clamp(v)) + .015 * Math.sin(T * 9);
  ctx.strokeStyle = '#ff7a3d'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(255,122,61,.9)'; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.moveTo(x - Math.cos(an) * r * .12, y - Math.sin(an) * r * .12); ctx.lineTo(x + Math.cos(an) * r * .74, y + Math.sin(an) * r * .74); ctx.stroke(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#e8ebf0'; ctx.beginPath(); ctx.arc(x, y, r * .08, 0, 7); ctx.fill();
  ctx.restore();
}

// ---------- dashboard + check engine ----------
export function engineIcon(ctx, x, y, s, col, lw = 7) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-34, -18); ctx.lineTo(-34, 22); ctx.lineTo(18, 22); ctx.lineTo(30, 10); ctx.lineTo(42, 10); ctx.lineTo(42, -14); ctx.lineTo(30, -14); ctx.lineTo(22, -24); ctx.lineTo(-20, -24); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10, -24); ctx.lineTo(-10, -36); ctx.moveTo(-22, -36); ctx.lineTo(2, -36); ctx.moveTo(-34, 0); ctx.lineTo(-48, 0); ctx.moveTo(-48, -12); ctx.lineTo(-48, 12); ctx.stroke();
  ctx.restore();
}
export function dash(ctx, T, cx, cy, w, { on = 0, a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  const h = w * .46;
  ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 70; rr(ctx, cx - w / 2, cy - h / 2, w, h, h * .45);
  let g = ctx.createLinearGradient(0, cy - h / 2, 0, cy + h / 2); g.addColorStop(0, '#1b2130'); g.addColorStop(1, '#07090e'); ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(160,190,255,.25)'; ctx.lineWidth = 3; ctx.stroke();
  [[-1, 'km/h'], [1, 'rpm']].forEach(([sd, lb], k) => {
    const x = cx + sd * w * .29, y = cy, r = h * .38;
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(x, y, r, Math.PI * .75, Math.PI * 2.25); ctx.stroke();
    for (let i = 0; i <= 12; i++) { const an = lerp(Math.PI * .75, Math.PI * 2.25, i / 12); ctx.strokeStyle = i > 9 && k ? '#ff4a3d' : 'rgba(220,230,255,.7)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r * .78, y + Math.sin(an) * r * .78); ctx.lineTo(x + Math.cos(an) * r * .92, y + Math.sin(an) * r * .92); ctx.stroke(); }
    const an = Math.PI * .75 + Math.PI * 1.5 * (.12 + .05 * Math.sin(T * 1.3 + k * 2) + k * .08);
    ctx.strokeStyle = '#ff7a3d'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an) * r * .8, y + Math.sin(an) * r * .8); ctx.stroke();
    ctx.fillStyle = '#ccd'; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill();
    txt(ctx, lb, x, y + r * .55, 20, 'rgba(200,210,230,.6)', 600, 'center', MONO);
  });
  const ex = cx, ey = cy - h * .05;
  if (on > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, ex, ey, 260 * (1 + .1 * Math.sin(T * 7)), AMBER_RGB, on); ctx.restore(); }
  engineIcon(ctx, ex, ey, 1.25, on > .5 ? `rgb(255,${190 + 40 * Math.sin(T * 7) | 0},70)` : 'rgba(120,110,90,.6)');
  ctx.restore();
}

// ---------- LED price board (rows flip like a split-flap) ----------
// rows: [[label, value]] ; flips: per-row 0..1 flip to next[i] (a draw fn(ctx, x, y, w, h))
export function board(ctx, T, cx, top, w, rows, { flips = [], next = [], header = 'GAS', a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  const rh = 110, h = 120 + rows.length * rh + 20, x0 = cx - w / 2;
  ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 60; rr(ctx, x0, top, w, h, 24);
  const g = ctx.createLinearGradient(0, top, 0, top + h); g.addColorStop(0, '#1c2433'); g.addColorStop(1, '#0a0d14'); ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(160,190,255,.3)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.letterSpacing = '8px'; txt(ctx, header, cx, top + 82, 56, ORANGE, 900); ctx.letterSpacing = '0px';
  rows.forEach(([lb, val], i) => {
    const ry = top + 120 + i * rh, f = clamp(flips[i] || 0), sc = Math.abs(Math.cos(f * Math.PI)), showNext = f > .5;
    ctx.save(); ctx.translate(cx, ry + rh / 2 - 8); ctx.scale(1, Math.max(.02, sc)); ctx.translate(-cx, -(ry + rh / 2 - 8));
    rr(ctx, x0 + 24, ry, w - 48, rh - 16, 14); ctx.fillStyle = showNext ? '#121a2a' : '#06080c'; ctx.fill();
    if (showNext && next[i]) next[i](ctx, x0 + 24, ry, w - 48, rh - 16);
    else { txt(ctx, lb, x0 + 50, ry + 64, 34, '#e7ecf5', 800, 'left', MONO); lcd(ctx, val, x0 + w - 50, ry + 70, 52); }
    ctx.restore();
  });
  ctx.restore();
  return h;
}
