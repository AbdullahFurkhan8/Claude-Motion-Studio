import { W, H, clamp, eio } from './lib.js';
import { makeScenes, KEYWORDS, EMOJI, LANG } from './scenes.js';
import { makeCue, drawCaptions, setKeywords } from './captions.js';
import { loadImages } from './assets.js';
const q = new URLSearchParams(location.search), scale = Number(q.get('scale')) || 1, v = q.get('v') || 'new';
const { WORDS, CHUNKS, DURATION } = await import(`./timing_${v}.js`);
const lang = v.startsWith('hi') ? 'hi' : 'en', L = LANG[lang] || {};
setKeywords(L.keywords || KEYWORDS, L.emoji || EMOJI);
const { scenes } = makeScenes(makeCue(WORDS, L.alias), lang);
const canvas = document.getElementById('c');
canvas.width = 2 * Math.round(W * scale / 2); canvas.height = 2 * Math.round(H * scale / 2);
const ctx = canvas.getContext('2d');
await document.fonts.ready;
await loadImages(['iphone_front.png', 'iphone_back.png', 'hand_iphone.png', 'logic_board.png', 'power_off.png', 'stranger_iphone.png', 'exploded.png', 'map_day.png', 'map_night.png', 'findmy.png', 'apple_white.png', 'case_closed.png']);
window.renderFrame = t => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  const s = scenes.find(s => t >= s.start && t < s.end) || scenes[0];
  // global camera: slow push-in across each scene plus a gentle drift, so no frame is ever still
  const u = clamp((t - s.start) / Math.max(1, Math.min(s.end, DURATION) - s.start)), z = 1 + .05 * eio(u);
  ctx.save(); ctx.translate(W / 2 + 6 * Math.sin(t * .37), H / 2 + 8 * Math.sin(t * .29)); ctx.rotate(.005 * Math.sin(t * .45)); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  s.draw(ctx, t); ctx.restore();
  // soft fade behind captions
  let g = ctx.createLinearGradient(0, 0, 0, 470); const bgc = s.light ? '242,242,240' : '12,13,16';
  g.addColorStop(0, `rgba(${bgc},1)`); g.addColorStop(.75, `rgba(${bgc},.9)`); g.addColorStop(1, `rgba(${bgc},0)`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 470);
  const k = clamp((t - s.start) / .12); if (s.start > 0 && k < 1) { ctx.fillStyle = `rgba(${bgc},${.7 * (1 - k)})`; ctx.fillRect(0, 0, W, H); }
  drawCaptions(ctx, t, WORDS, CHUNKS, s.light);
};
window.grab = (type, quality = .92) => canvas.toDataURL(type, quality);
window.__ready = true;
