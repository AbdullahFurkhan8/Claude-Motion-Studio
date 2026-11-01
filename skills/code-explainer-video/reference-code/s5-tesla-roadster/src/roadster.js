// Tesla Roadster kit: dark studio set (red neon poles, light strip, glossy floor), glossy silver Roadster side / front / top views
// with an x-ray mode (cold-gas tanks, gas lines, nozzles, fans, seal), cold-gas plumes, glossy balloon, curved ramp ceiling,
// force arrows, mono tags with leader lines, HUD dials, headline titles, clip frames (src/assets/clip) drawn into cards.
import { W, H, clamp, lerp, eo, eio, eback, hash, rr } from './lib.js';
import { FONT, MONO, txt, tw, bin, pop, glowDot } from './kit.js';
import { IMG } from './assets.js';

export const RED_RGB = '255,64,40', CYAN = '#6fe6ff', CYAN_RGB = '111,230,255', ORANGE = '#ff7a2f', ORANGE_RGB = '255,122,47', BLUEP_RGB = '60,120,255';

// ---------- studio set ----------
export function studio(ctx, T, { hz = 1260, poles = 1, strip = 1, spot = 1, lanes = 1, tint = 0 } = {}) {
  let g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#07090d'); g.addColorStop(hz / H * .8, '#0d1016'); g.addColorStop(hz / H, '#16181d'); g.addColorStop(Math.min(1, hz / H + .06), '#1c1f25'); g.addColorStop(1, '#060709');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  // spotlight haze from the rig
  if (spot) for (const [sx, s0] of [[230, 0], [860, 1.7]]) {
    const r = 760 + 40 * Math.sin(T * .5 + s0), gr = ctx.createRadialGradient(sx, hz - 380, 20, sx, hz - 200, r);
    gr.addColorStop(0, `rgba(170,195,235,${.16 * spot})`); gr.addColorStop(.5, `rgba(120,150,210,${.05 * spot})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr; ctx.fillRect(-W, -H, W * 3, H * 3);
  }
  // red neon poles behind the set (parallax drift + gentle flicker)
  if (poles > 0) {
    ctx.save(); ctx.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const x = -60 + i * 150 + 50 * hash(i, 2) + 14 * Math.sin(T * .21 + i), top = hz - 260 - 640 * hash(i, 5), fl = .75 + .25 * Math.sin(T * (2 + hash(i, 7) * 3) + i * 2);
      ctx.strokeStyle = `rgba(${RED_RGB},${.85 * poles * fl})`; ctx.shadowColor = `rgba(${RED_RGB},.9)`; ctx.shadowBlur = 22; ctx.lineWidth = 4 + 2 * hash(i, 9);
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, hz - 40); ctx.stroke();
    }
    ctx.restore();
  }
  // horizontal red light strip with travelling streaks
  if (strip > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    g = ctx.createLinearGradient(0, hz - 110, 0, hz - 10); g.addColorStop(0, 'rgba(255,60,30,0)'); g.addColorStop(.55, `rgba(255,70,30,${.42 * strip})`); g.addColorStop(1, 'rgba(255,60,30,0)');
    ctx.fillStyle = g; ctx.fillRect(-W, hz - 110, W * 3, 100);
    for (let i = 0; i < 7; i++) { const u = (T * (.18 + .1 * hash(i, 3)) + hash(i, 4)) % 1, x = lerp(-400, W + 400, u), y = hz - 70 + 40 * hash(i, 6);
      const sg = ctx.createLinearGradient(x - 300, 0, x + 300, 0); sg.addColorStop(0, 'rgba(255,90,50,0)'); sg.addColorStop(.5, `rgba(255,120,70,${.55 * strip})`); sg.addColorStop(1, 'rgba(255,90,50,0)');
      ctx.fillStyle = sg; ctx.fillRect(x - 300, y, 600, 5); }
    ctx.restore();
  }
  // glossy floor + white lane lines in perspective
  g = ctx.createLinearGradient(0, hz, 0, H); g.addColorStop(0, 'rgba(60,64,72,.55)'); g.addColorStop(.25, 'rgba(26,28,33,.6)'); g.addColorStop(1, 'rgba(4,5,7,.9)');
  ctx.fillStyle = g; ctx.fillRect(-W, hz, W * 3, H * 2);
  if (lanes > 0) { ctx.save(); ctx.strokeStyle = `rgba(235,238,245,${.55 * lanes})`; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-200, H + 40); ctx.lineTo(W * .62, hz + 6); ctx.stroke();
    ctx.lineWidth = 5; ctx.globalAlpha = .5; ctx.beginPath(); ctx.moveTo(W + 300, H - 160); ctx.lineTo(W * .5, hz + 30); ctx.stroke(); ctx.restore(); }
  // floating dust motes
  ctx.save(); for (let i = 0; i < 26; i++) { const x = (hash(i, 11) * W + T * 8 * (hash(i, 12) - .5) * 4 + W) % W, y = 520 + hash(i, 13) * (hz - 560) + 12 * Math.sin(T * .7 + i);
    ctx.fillStyle = `rgba(255,255,255,${.25 + .35 * hash(i, 14)})`; ctx.beginPath(); ctx.arc(x, y, 1.5 + 2.5 * hash(i, 15), 0, 7); ctx.fill(); } ctx.restore();
  if (tint) { ctx.fillStyle = `rgba(0,0,0,${tint})`; ctx.fillRect(-W, -H, W * 3, H * 3); }
  const v = ctx.createRadialGradient(W / 2, H * .55, H * .3, W / 2, H * .55, H * .85); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.6)');
  ctx.fillStyle = v; ctx.fillRect(-W, -H, W * 3, H * 3);
}

// ---------- the Roadster (side view, local units: length 900, ground at y=0, nose to +x) ----------
const WR = 82, WF = [300, -82], WB = [-290, -82];
function bodyPath(ctx) {
  ctx.beginPath(); ctx.moveTo(-452, -58);
  ctx.bezierCurveTo(-460, -110, -452, -150, -430, -163);
  ctx.bezierCurveTo(-360, -178, -290, -186, -210, -197);
  ctx.bezierCurveTo(-150, -238, -80, -262, 10, -262);
  ctx.bezierCurveTo(90, -260, 150, -226, 230, -181);
  ctx.bezierCurveTo(320, -150, 400, -129, 452, -101);
  ctx.bezierCurveTo(472, -90, 470, -60, 455, -46);
  ctx.lineTo(398, -42); ctx.arc(WF[0], WF[1], 100, .44, Math.PI - .44, true);
  ctx.lineTo(-192, -42); ctx.arc(WB[0], WB[1], 100, .44, Math.PI - .44, true);
  ctx.closePath();
}
function canopyPath(ctx) {
  ctx.beginPath(); ctx.moveTo(-196, -200);
  ctx.bezierCurveTo(-140, -240, -70, -254, 10, -254);
  ctx.bezierCurveTo(85, -252, 140, -224, 206, -186);
  ctx.bezierCurveTo(120, -192, -60, -198, -196, -200); ctx.closePath();
}
export function wheel(ctx, T, x, y, r, spin = 0) {
  ctx.save(); ctx.translate(x, y);
  let g = ctx.createRadialGradient(-r * .2, -r * .3, r * .2, 0, 0, r); g.addColorStop(0, '#2a2d33'); g.addColorStop(1, '#0b0c0f');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  const rr2 = r * .72; g = ctx.createLinearGradient(-rr2, -rr2, rr2, rr2); g.addColorStop(0, '#f4f6f9'); g.addColorStop(.5, '#a9afb8'); g.addColorStop(1, '#5d636c');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rr2, 0, 7); ctx.fill();
  ctx.rotate(spin); ctx.strokeStyle = 'rgba(40,44,52,.35)'; ctx.lineWidth = r * .04;
  for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.arc(0, 0, rr2 * .78, -.25, .25); ctx.stroke(); }
  ctx.fillStyle = '#2b2f36'; ctx.beginPath(); ctx.arc(0, 0, r * .14, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(-r * .04, -r * .05, r * .05, 0, 7); ctx.fill();
  ctx.restore();
}
// o: { xray 0..1, tanks 0..1 (glow), lines 0..1, nozzles 0..1, fans 0..1, seal 0..1, spin, shadow, lights, dark 0..1 }
export function roadster(ctx, T, x, y, s, o = {}) {
  const { xray = 0, tanks = 0, lines = 0, nozzles = 0, fans = 0, seal = 0, spin = 0, shadow = 1, lights = 1, dark = 0, lowP = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (shadow) { const g = ctx.createRadialGradient(0, 0, 40, 0, 0, 520); g.addColorStop(0, `rgba(0,0,0,${.7 * shadow})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.save(); ctx.scale(1, .12); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 520, 0, 7); ctx.fill(); ctx.restore(); }
  const ba = 1 - .78 * xray;
  // body paint
  ctx.save(); ctx.globalAlpha *= ba;
  bodyPath(ctx); let g = ctx.createLinearGradient(0, -262, 0, -40);
  g.addColorStop(0, '#ffffff'); g.addColorStop(.35, '#dfe3e8'); g.addColorStop(.62, '#aab1bb'); g.addColorStop(.8, '#6f7682'); g.addColorStop(1, '#3a3f47');
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); bodyPath(ctx); ctx.clip();
  // moving studio sheen (glossy)
  const sx = -700 + ((T * 160) % 1800);
  const sg = ctx.createLinearGradient(sx - 140, 0, sx + 140, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.45)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sg; ctx.save(); ctx.transform(1, 0, -.6, 1, 0, 0); ctx.fillRect(sx - 140, -300, 280, 300); ctx.restore();
  // lower body darkening + sill
  g = ctx.createLinearGradient(0, -110, 0, -40); g.addColorStop(0, 'rgba(20,22,26,0)'); g.addColorStop(1, 'rgba(20,22,26,.55)'); ctx.fillStyle = g; ctx.fillRect(-470, -110, 940, 80);
  ctx.fillStyle = 'rgba(18,20,24,.85)'; ctx.fillRect(-200, -58, 410, 16);
  // side intake
  ctx.fillStyle = 'rgba(25,27,32,.8)'; ctx.beginPath(); ctx.moveTo(-200, -128); ctx.quadraticCurveTo(-150, -140, -110, -126); ctx.lineTo(-120, -92); ctx.quadraticCurveTo(-160, -86, -196, -96); ctx.closePath(); ctx.fill();
  if (dark > 0) { ctx.fillStyle = `rgba(6,7,9,${dark})`; ctx.fillRect(-480, -280, 960, 280); }
  ctx.restore();
  // shoulder highlight + door shut line
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-430, -158); ctx.bezierCurveTo(-200, -170, 200, -150, 450, -100); ctx.stroke();
  ctx.strokeStyle = 'rgba(60,66,76,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-60, -196); ctx.quadraticCurveTo(-70, -120, -50, -60); ctx.stroke();
  // glass canopy
  canopyPath(ctx); g = ctx.createLinearGradient(0, -256, 0, -186); g.addColorStop(0, '#2c333e'); g.addColorStop(1, '#07090c'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); canopyPath(ctx); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.moveTo(-120, -246); ctx.lineTo(-40, -252); ctx.lineTo(-140, -196); ctx.lineTo(-200, -196); ctx.closePath(); ctx.fill(); ctx.restore();
  // lights
  if (lights) { ctx.save(); ctx.shadowColor = 'rgba(255,255,255,.9)'; ctx.shadowBlur = 18; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(418, -110); ctx.lineTo(456, -95); ctx.stroke();
    ctx.shadowColor = `rgba(${RED_RGB},1)`; ctx.strokeStyle = '#ff3b2a'; ctx.beginPath(); ctx.moveTo(-449, -146); ctx.lineTo(-452, -112); ctx.stroke(); ctx.restore(); }
  ctx.restore();
  // x-ray outline
  if (xray > 0) { ctx.save(); ctx.globalAlpha *= xray; ctx.globalCompositeOperation = 'lighter'; bodyPath(ctx); ctx.strokeStyle = `rgba(${CYAN_RGB},.55)`; ctx.lineWidth = 4; ctx.shadowColor = CYAN; ctx.shadowBlur = 16; ctx.stroke();
    canopyPath(ctx); ctx.strokeStyle = `rgba(${CYAN_RGB},.35)`; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.strokeStyle = `rgba(${CYAN_RGB},.12)`; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = -400; i <= 400; i += 50) { ctx.moveTo(i, -250); ctx.lineTo(i, -45); } ctx.stroke(); ctx.restore(); }
  // internals (x-ray)
  if (xray > 0) {
    ctx.save(); ctx.globalAlpha *= xray;
    if (lines > 0) { ctx.save(); ctx.globalAlpha *= lines; ctx.strokeStyle = `rgba(${CYAN_RGB},.9)`; ctx.lineWidth = 5; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -T * 60; ctx.shadowColor = CYAN; ctx.shadowBlur = 12;
      for (const [nx, ny] of NOZ) { ctx.beginPath(); ctx.moveTo(0, -112); ctx.quadraticCurveTo(nx * .5, -70, nx, ny); ctx.stroke(); } ctx.restore(); }
    tank(ctx, T, -170, 180, -112, 30, tanks); tank(ctx, T, -150, 120, -168, 26, tanks);
    if (nozzles > 0) NOZ.forEach(([nx, ny], i) => { const a = clamp(nozzles * 3 - i * .4); if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, nx, ny, 46, CYAN_RGB, 1);
      ctx.fillStyle = '#eaffff'; ctx.beginPath(); ctx.arc(nx, ny, 9, 0, 7); ctx.fill(); ctx.strokeStyle = CYAN; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(nx, ny, 16 + 4 * Math.sin(T * 5 + i), 0, 7); ctx.stroke(); ctx.restore(); });
    if (fans > 0) [-110, 130].forEach((fx, i) => { ctx.save(); ctx.globalAlpha *= fans; ctx.translate(fx, -52); ctx.scale(1, .32);
      ctx.fillStyle = 'rgba(20,30,40,.8)'; ctx.beginPath(); ctx.arc(0, 0, 78, 0, 7); ctx.fill(); ctx.strokeStyle = CYAN; ctx.lineWidth = 5; ctx.stroke();
      ctx.rotate(T * 14 + i); ctx.fillStyle = `rgba(${CYAN_RGB},.8)`; for (let k = 0; k < 6; k++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.ellipse(36, 0, 34, 11, .4, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#dff'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, 7); ctx.fill(); ctx.restore(); });
    ctx.restore();
  }
  if (lowP > 0) { ctx.save(); ctx.globalAlpha *= lowP; const gl = ctx.createLinearGradient(0, -60, 0, 0); gl.addColorStop(0, `rgba(${BLUEP_RGB},.85)`); gl.addColorStop(1, `rgba(${BLUEP_RGB},.35)`);
    ctx.fillStyle = gl; ctx.shadowColor = `rgba(${BLUEP_RGB},1)`; ctx.shadowBlur = 40; rr(ctx, -390, -44, 780, 40, 20); ctx.fill(); ctx.restore(); }
  if (seal > 0) { ctx.save(); ctx.globalAlpha *= seal; ctx.strokeStyle = ORANGE; ctx.shadowColor = ORANGE; ctx.shadowBlur = 20; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-392, -4); ctx.lineTo(-392, -42); ctx.moveTo(392, -4); ctx.lineTo(392, -42); ctx.moveTo(-392, -6); ctx.lineTo(392, -6); ctx.stroke(); ctx.restore(); }
  wheel(ctx, T, WB[0], WB[1], WR, spin); wheel(ctx, T, WF[0], WF[1], WR, spin);
  ctx.restore();
}
// nozzle positions on the side view (bottom jets + rear/front side jets)
export const NOZ = [[-395, -40], [-120, -40], [120, -40], [395, -40], [-455, -96], [462, -72]];
export const carPt = (x, y, s, px, py, rot = 0) => [x + (px * Math.cos(rot) - py * Math.sin(rot)) * s, y + (px * Math.sin(rot) + py * Math.cos(rot)) * s];
function tank(ctx, T, x0, x1, y, r, glow) {
  ctx.save(); rr(ctx, x0 - r, y - r, x1 - x0 + 2 * r, 2 * r, r);
  const g = ctx.createLinearGradient(0, y - r, 0, y + r); g.addColorStop(0, `rgba(190,250,255,${.55 + .4 * glow})`); g.addColorStop(.5, `rgba(${CYAN_RGB},${.35 + .45 * glow})`); g.addColorStop(1, `rgba(20,110,140,${.5 + .3 * glow})`);
  ctx.fillStyle = g; if (glow > 0) { ctx.shadowColor = CYAN; ctx.shadowBlur = 30 * glow; } ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(220,255,255,.8)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.55)'; rr(ctx, x0, y - r * .7, x1 - x0, r * .28, r * .14); ctx.fill();
  ctx.restore();
}
// floor reflection of a car (draw before the car)
export function reflection(ctx, T, x, y, s, o = {}, a = .16) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, 2 * y); ctx.scale(1, -1); roadster(ctx, T, x, y, s, { ...o, shadow: 0, xray: 0, lowP: 0, seal: 0 }); ctx.restore();
  const g = ctx.createLinearGradient(0, y, 0, y + 260 * s); g.addColorStop(0, 'rgba(10,11,14,0)'); g.addColorStop(1, 'rgba(10,11,14,.9)'); ctx.fillStyle = g; ctx.fillRect(x - 520 * s, y, 1040 * s, 280 * s);
}

// front view (local: width 560, ground y=0); tilt handled by caller
export function roadsterFront(ctx, T, x, y, s, { jets = [0, 0], glow = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  [-235, 235].forEach(wx => { ctx.fillStyle = '#0d0e11'; rr(ctx, wx - 42, -150, 84, 150, 30); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.12)'; rr(ctx, wx - 30, -140, 14, 120, 7); ctx.fill(); });
  ctx.beginPath(); ctx.moveTo(-280, -60); ctx.bezierCurveTo(-292, -140, -270, -170, -230, -185); ctx.bezierCurveTo(-150, -205, 150, -205, 230, -185); ctx.bezierCurveTo(270, -170, 292, -140, 280, -60); ctx.quadraticCurveTo(0, -40, -280, -60); ctx.closePath();
  let g = ctx.createLinearGradient(0, -205, 0, -45); g.addColorStop(0, '#ffffff'); g.addColorStop(.5, '#c4cad2'); g.addColorStop(1, '#5d646e'); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-150, -198); ctx.bezierCurveTo(-120, -290, 120, -290, 150, -198); ctx.closePath(); g = ctx.createLinearGradient(0, -290, 0, -198); g.addColorStop(0, '#323a46'); g.addColorStop(1, '#07090c'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.shadowColor = '#fff'; ctx.shadowBlur = 16; ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-250, -150); ctx.lineTo(-120, -142); ctx.moveTo(250, -150); ctx.lineTo(120, -142); ctx.stroke(); ctx.restore();
  ctx.fillStyle = 'rgba(15,17,21,.8)'; rr(ctx, -120, -110, 240, 34, 17); ctx.fill();
  [[-282, -110, -1], [282, -110, 1]].forEach(([jx, jy, d], i) => { glowDot(ctx, jx, jy, 30, CYAN_RGB, .4 + glow); ctx.fillStyle = '#dff'; ctx.beginPath(); ctx.arc(jx, jy, 9, 0, 7); ctx.fill();
    if (jets[i] > 0) plume(ctx, T, jx, jy, d > 0 ? 0 : Math.PI, 340, 70, jets[i]); });
  ctx.restore();
}

// top view (pointing up; local length 880, width 420, centre at 0,0)
export function roadsterTop(ctx, T, x, y, s, { lit = 0, n = 10, label = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 30;
  [[-205, -270], [205, -270], [-210, 270], [205, 270]].forEach(([wx, wy]) => { ctx.fillStyle = '#0c0d10'; rr(ctx, wx - 34, wy - 70, 68, 140, 22); ctx.fill(); });
  ctx.beginPath(); ctx.moveTo(0, -440); ctx.bezierCurveTo(150, -440, 200, -380, 205, -250); ctx.bezierCurveTo(212, -60, 215, 200, 200, 360); ctx.bezierCurveTo(190, 430, 120, 440, 0, 440);
  ctx.bezierCurveTo(-120, 440, -190, 430, -200, 360); ctx.bezierCurveTo(-215, 200, -212, -60, -205, -250); ctx.bezierCurveTo(-200, -380, -150, -440, 0, -440); ctx.closePath();
  let g = ctx.createLinearGradient(-210, 0, 210, 0); g.addColorStop(0, '#7d848f'); g.addColorStop(.25, '#e9ecf0'); g.addColorStop(.5, '#ffffff'); g.addColorStop(.75, '#dfe3e8'); g.addColorStop(1, '#727985');
  ctx.fillStyle = g; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.ellipse(0, 20, 140, 230, 0, 0, 7); g = ctx.createLinearGradient(0, -210, 0, 250); g.addColorStop(0, '#39414d'); g.addColorStop(1, '#07090c'); ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(-50, -60, 30, 120, -.1, 0, 7); ctx.fill();
  ctx.save(); ctx.shadowColor = '#fff'; ctx.shadowBlur = 14; ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-150, -405); ctx.quadraticCurveTo(0, -440, 150, -405); ctx.stroke();
  ctx.shadowColor = `rgba(${RED_RGB},1)`; ctx.strokeStyle = '#ff3b2a'; ctx.beginPath(); ctx.moveTo(-160, 425); ctx.quadraticCurveTo(0, 445, 160, 425); ctx.stroke(); ctx.restore();
  THR10.slice(0, n).forEach(([tx, ty, ang], i) => { const a = clamp(lit * 10 - i); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.globalCompositeOperation = 'lighter'; plume(ctx, T, tx, ty, ang, 150, 44, .55 * a); glowDot(ctx, tx, ty, 60, CYAN_RGB, 1); ctx.restore();
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#0e1a22'; ctx.strokeStyle = CYAN; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(tx, ty, 26, 0, 7); ctx.fill(); ctx.stroke();
    if (label) txt(ctx, String(i + 1), tx, ty + 10, 26, '#eaffff', 800, 'center', MONO); ctx.restore(); });
  ctx.restore();
}
export const THR10 = [[-215, -330, Math.PI], [215, -330, 0], [-222, -60, Math.PI], [222, -60, 0], [-222, 160, Math.PI], [222, 160, 0], [-200, 380, Math.PI * .8], [200, 380, Math.PI * .2], [0, -450, -Math.PI / 2], [0, 455, Math.PI / 2]];

// ---------- cold-gas plume: cone + streaming puffs (ang = direction of the gas) ----------
export function plume(ctx, T, x, y, ang, len, w, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalAlpha *= clamp(a);
  const g = ctx.createLinearGradient(0, 0, len, 0); g.addColorStop(0, 'rgba(235,250,255,.85)'); g.addColorStop(.35, 'rgba(180,225,245,.4)'); g.addColorStop(1, 'rgba(160,200,230,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -w * .12); ctx.lineTo(len, -w); ctx.lineTo(len, w); ctx.lineTo(0, w * .12); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 14; i++) { const u = (T * 1.6 + hash(i, 21)) % 1, px = len * u, py = (hash(i, 22) - .5) * 2 * w * u * .9 + 6 * Math.sin(T * 7 + i);
    ctx.fillStyle = `rgba(225,242,250,${.35 * (1 - u)})`; ctx.beginPath(); ctx.arc(px, py, 6 + w * .45 * u, 0, 7); ctx.fill(); }
  ctx.restore();
}

// ---------- glossy balloon ----------
export function balloon(ctx, T, x, y, r, { knot = 1, open = 0, wob = 1, rot = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot + .05 * wob * Math.sin(T * 2.3)); const sq = 1 + .04 * wob * Math.sin(T * 3.1);
  ctx.save(); ctx.shadowColor = 'rgba(255,70,40,.45)'; ctx.shadowBlur = r * .6;
  ctx.beginPath(); ctx.ellipse(0, 0, r * sq, r * 1.12 / sq, 0, 0, 7);
  let g = ctx.createRadialGradient(-r * .35, -r * .45, r * .05, 0, 0, r * 1.15); g.addColorStop(0, '#ffb39a'); g.addColorStop(.25, '#ff5a36'); g.addColorStop(.75, '#d6311b'); g.addColorStop(1, '#7a170c');
  ctx.fillStyle = g; ctx.fill(); ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(-r * .38, -r * .5, r * .16, r * .26, -.6, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.ellipse(r * .45, r * .35, r * .08, r * .2, -.6, 0, 7); ctx.fill();
  // neck / knot
  ctx.fillStyle = '#b8240f'; ctx.beginPath(); ctx.moveTo(-r * .1, r * 1.08); ctx.lineTo(r * .1, r * 1.08); ctx.lineTo(r * .16 * (1 + open), r * 1.25); ctx.lineTo(-r * .16 * (1 + open), r * 1.25); ctx.closePath(); ctx.fill();
  if (knot) { ctx.beginPath(); ctx.ellipse(0, r * 1.27, r * .14, r * .06, 0, 0, 7); ctx.fill(); }
  ctx.restore();
}

// ---------- the curved ramp ceiling (car drives on its underside) ----------
export function rampCeiling(ctx, T, cx, cy, R, a0 = -2.5, a1 = -.65, { truss = 1 } = {}) {
  ctx.save();
  if (truss) { ctx.strokeStyle = 'rgba(190,196,206,.55)'; ctx.lineWidth = 4; ctx.beginPath();
    for (let k = 0; k <= 22; k++) { const a = lerp(a0, a1, k / 22), b = lerp(a0, a1, (k + 1) / 22), r1 = R + 70, r2 = R + 200;
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      if (k < 22) { ctx.lineTo(cx + Math.cos(b) * r1, cy + Math.sin(b) * r1); ctx.moveTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); ctx.lineTo(cx + Math.cos(b) * r2, cy + Math.sin(b) * r2); } }
    ctx.stroke(); }
  ctx.beginPath(); ctx.arc(cx, cy, R + 70, a0, a1); ctx.arc(cx, cy, R, a1, a0, true); ctx.closePath();
  const g = ctx.createRadialGradient(cx, cy, R, cx, cy, R + 70); g.addColorStop(0, '#d9d4cb'); g.addColorStop(1, '#8a857d'); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = '#ff5a3c'; ctx.lineWidth = 6; ctx.shadowColor = `rgba(${RED_RGB},.9)`; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(cx, cy, R + 4, a0, a1); ctx.stroke();
  ctx.shadowBlur = 0; ctx.setLineDash([40, 30]); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R + 36, a0, a1); ctx.stroke();
  ctx.restore();
}

// ---------- arrows, tags, titles, dials ----------
export function arrow(ctx, x0, y0, x1, y1, { col = ORANGE, w = 16, head = 2.6, a = 1, glow = 1 } = {}) {
  if (a <= 0) return; const L = Math.hypot(x1 - x0, y1 - y0); if (L < 2) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x0, y0); ctx.rotate(Math.atan2(y1 - y0, x1 - x0));
  if (glow) { ctx.shadowColor = col; ctx.shadowBlur = 18 * glow; }
  const hl = Math.min(L * .45, w * head * 1.2); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(0, -w / 2); ctx.lineTo(L - hl, -w / 2); ctx.lineTo(L - hl, -w * head / 2); ctx.lineTo(L, 0); ctx.lineTo(L - hl, w * head / 2); ctx.lineTo(L - hl, w / 2); ctx.lineTo(0, w / 2); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(0, -w / 2, L - hl, w * .3);
  ctx.restore();
}
export function curvedArrow(ctx, cx, cy, r, a0, a1, { col = ORANGE, w = 16, a = 1 } = {}) {
  if (a <= 0 || Math.abs(a1 - a0) < .02) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 18;
  const dir = Math.sign(a1 - a0), ae = a1 - dir * .16; ctx.beginPath(); ctx.arc(cx, cy, r, a0, ae, dir < 0); ctx.stroke();
  const ex = cx + Math.cos(a1) * r, ey = cy + Math.sin(a1) * r, tg = a1 + dir * Math.PI / 2; ctx.translate(ex, ey); ctx.rotate(tg);
  ctx.beginPath(); ctx.moveTo(w * 1.6, 0); ctx.lineTo(-w * .9, -w * 1.4); ctx.lineTo(-w * .9, w * 1.4); ctx.closePath(); ctx.fill(); ctx.restore();
}
// small mono tag (dark pill, accent border) with a leader line to (lx, ly)
export function tag(ctx, x, y, s, a = 1, lx, ly, { rgb = '235,240,248', size = 22 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a);
  ctx.font = MONO(700, size); ctx.letterSpacing = '2px'; const w = ctx.measureText(s).width + 30, h = size * 1.75;
  if (lx != null) { const k = eo(a); ctx.strokeStyle = `rgba(${rgb},.85)`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lerp(x, lx, k), lerp(y, ly, k)); ctx.stroke();
    ctx.fillStyle = `rgb(${rgb})`; ctx.beginPath(); ctx.arc(lerp(x, lx, k), lerp(y, ly, k), 7, 0, 7); ctx.fill(); }
  rr(ctx, x - w / 2, y - h / 2, w, h, 8); ctx.fillStyle = 'rgba(10,12,16,.88)'; ctx.fill(); ctx.strokeStyle = `rgba(${rgb},.9)`; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = `rgb(${rgb})`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 1, y + 1); ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '0px'; ctx.restore();
}
// headline under the captions: big bold caps + spaced mono subtitle
export function title(ctx, a, head, sub, { y = 590, col = '#fff', size = 74, glow, x = W / 2 } = {}) {
  bin(ctx, a, () => {
    ctx.save(); ctx.font = FONT(900, size); let s = size; while (ctx.measureText(head).width > 960 && s > 30) { s -= 2; ctx.font = FONT(900, s); }
    ctx.textAlign = 'center'; if (glow) { ctx.shadowColor = `rgba(${glow},.75)`; ctx.shadowBlur = 30; } ctx.fillStyle = col; ctx.fillText(head, x, y);
    ctx.restore();
    if (sub) { ctx.save(); ctx.letterSpacing = '5px'; txt(ctx, sub, x, y + 50, 24, 'rgba(210,216,226,.75)', 700, 'center', MONO); ctx.restore(); }
  });
}
// circular HUD dial (pitch / altitude style)
export function dial(ctx, T, x, y, r, label, value, frac, { rgb = '235,240,248', a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(8,10,14,.75)'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, r - 6, 0, 7); ctx.stroke();
  ctx.strokeStyle = `rgb(${rgb})`; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, r - 6, -Math.PI / 2, -Math.PI / 2 + 6.283 * clamp(frac)); ctx.stroke();
  ctx.letterSpacing = '2px'; txt(ctx, label, x, y - r * .36, r * .2, 'rgba(220,226,236,.7)', 700, 'center', MONO); ctx.letterSpacing = '0px';
  txt(ctx, value, x, y + r * .22, r * .42, '#fff', 800, 'center', MONO);
  ctx.restore();
}
// stamp (rotated outlined label) that slams in
export function stamp(ctx, k, x, y, s, { col = '#fff', bg = 'rgba(12,14,18,.92)', size = 70, rot = -.08 } = {}) {
  if (k <= 0) return; const sc = lerp(1.8, 1, eback(clamp(k))); ctx.save(); ctx.globalAlpha *= clamp(k * 2); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.font = FONT(900, size); const w = ctx.measureText(s).width + size * .8, h = size * 1.45;
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 30; rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fillStyle = bg; ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 4); ctx.textBaseline = 'alphabetic'; ctx.restore();
}

// ---------- logo (black PNG recoloured) ----------
const tints = {};
export function tinted(name, col) {
  const k = name + col; if (tints[k]) return tints[k]; const im = IMG[name]; if (!im) return null;
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d');
  x.drawImage(im, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); return tints[k] = c;
}
export function teslaLogo(ctx, x, y, w, { col = '#ffffff', a = 1, glow = 0 } = {}) {
  const c = tinted('tesla', col); if (!c || a <= 0) return; const h = w * c.height / c.width; ctx.save(); ctx.globalAlpha *= a;
  if (glow) { ctx.shadowColor = `rgba(${RED_RGB},${glow})`; ctx.shadowBlur = 40; } ctx.drawImage(c, x - w / 2, y - h / 2, w, h); ctx.restore();
}

// ---------- the user's clip (30 fps frames in assets/clip) ----------
export const CLIP_FRAMES = 608, CLIP_W = 1128, CLIP_H = 656;
export const clipName = t => 'clip/' + String(1 + Math.max(0, Math.min(CLIP_FRAMES - 1, Math.floor(t * 30)))).padStart(4, '0');
// draw clip time t into a rounded card; src = [sx, sy, sw, sh] crop in source pixels (default full frame)
export function clipCard(ctx, t, x, y, w, h, { src, r = 34, a = 1, border = 'rgba(255,255,255,.22)' } = {}) {
  const im = IMG[clipName(t)]; if (!im || a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.75)'; ctx.shadowBlur = 80; ctx.shadowOffsetY = 34; rr(ctx, x, y, w, h, r); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip();
  const [sx, sy, sw, sh] = src || [0, 0, CLIP_W, CLIP_H]; ctx.drawImage(im, sx, sy, sw, sh, x, y, w, h);
  const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(.3, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.restore(); rr(ctx, x, y, w, h, r); ctx.strokeStyle = border; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
}
// car position in the clip (normalised), measured by eye from the footage, for the close-up crop
const TRACK = [[0, .5, .5], [12.3, .5, .44], [12.5, .5, .42], [13, .49, .45], [13.5, .48, .46], [14, .48, .49], [14.5, .47, .54], [15, .46, .52], [15.5, .46, .52], [16, .49, .54], [16.5, .52, .55], [17, .54, .52], [17.5, .52, .44], [18, .5, .38], [18.5, .46, .42], [19, .43, .52], [20.3, .48, .55]];
export function clipTrack(t) {
  for (let i = 1; i < TRACK.length; i++) if (t < TRACK[i][0]) { const [t0, x0, y0] = TRACK[i - 1], [t1, x1, y1] = TRACK[i], u = eio((t - t0) / (t1 - t0)); return [lerp(x0, x1, u), lerp(y0, y1, u)]; }
  return TRACK[TRACK.length - 1].slice(1);
}
// viewfinder corners + REC badge over a card
export function viewfinder(ctx, T, x, y, w, h, label, { a = 1 } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 4; const L = 46, m = 26;
  [[x + m, y + m, 1, 1], [x + w - m, y + m, -1, 1], [x + m, y + h - m, 1, -1], [x + w - m, y + h - m, -1, -1]].forEach(([cx, cy, dx, dy]) => { ctx.beginPath(); ctx.moveTo(cx + dx * L, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + dy * L); ctx.stroke(); });
  const on = Math.sin(T * 6) > -.3; ctx.fillStyle = on ? '#ff3b30' : 'rgba(255,59,48,.3)'; ctx.beginPath(); ctx.arc(x + m + 28, y + m + 70, 10, 0, 7); ctx.fill();
  ctx.letterSpacing = '3px'; txt(ctx, label, x + m + 50, y + m + 79, 24, '#fff', 700, 'left', MONO); ctx.letterSpacing = '0px'; ctx.restore();
}
export const tc = t => { const s = Math.max(0, t); return `00:${String(Math.floor(s)).padStart(2, '0')}:${String(Math.floor((s % 1) * 30)).padStart(2, '0')}`; };
