import { W, H, clamp, eio, lerp } from './lib.js';
import { makeScenes, KEYWORDS, EMOJI, LANG, IMAGES } from './scenes.js';
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
const buf = document.createElement('canvas'); buf.width = canvas.width; buf.height = canvas.height; const bctx = buf.getContext('2d');
await document.fonts.ready;
await loadImages(IMAGES);
const TR = .5; // blur crossfade between scenes (s)
function drawScene(c, s, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none'; c.globalAlpha = 1; c.fillStyle = '#000'; c.fillRect(0, 0, canvas.width, canvas.height);
  c.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  // global camera: slow push-in across each scene plus a gentle drift, so no frame is ever still
  const u = clamp((t - s.start) / Math.max(1, Math.min(s.end, DURATION) - s.start)), z = 1 + .04 * eio(u);
  c.save(); c.translate(W / 2 + 6 * Math.sin(t * .37), H / 2 + 8 * Math.sin(t * .29)); c.rotate(.004 * Math.sin(t * .45)); c.scale(z, z); c.translate(-W / 2, -H / 2);
  s.draw(c, t); c.restore();
}
window.renderFrame = t => {
  const i = Math.max(0, scenes.findIndex(s => t >= s.start && t < s.end)), s = scenes[i];
  drawScene(ctx, s, t);
  const k = i > 0 ? clamp((t - s.start) / TR) : 1;
  if (k < 1) { // previous scene dissolves away with a blur on top of the new one
    drawScene(bctx, scenes[i - 1], t);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - eio(k); ctx.filter = `blur(${(eio(k) * 16 * scale).toFixed(1)}px)`; ctx.drawImage(buf, 0, 0); ctx.restore();
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  }
  // soft fade behind captions (colour follows the theme through the crossfade)
  const prevLight = i > 0 ? scenes[i - 1].light : s.light, m = eio(k);
  const col = [0, 1, 2].map(j => Math.round(lerp((prevLight ? [246, 246, 243] : [13, 13, 16])[j], (s.light ? [246, 246, 243] : [13, 13, 16])[j], m))).join(',');
  const g = ctx.createLinearGradient(0, 0, 0, 470); g.addColorStop(0, `rgba(${col},1)`); g.addColorStop(.72, `rgba(${col},.88)`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 470);
  drawCaptions(ctx, t, WORDS, CHUNKS, m > .5 ? s.light : prevLight);
};
window.grab = (type, quality = .92) => canvas.toDataURL(type, quality);
window.__ready = true;
