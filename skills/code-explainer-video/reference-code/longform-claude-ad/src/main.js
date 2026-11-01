import { W, H, clamp, eio } from './lib.js';
import { makeScenes } from './scenes.js';
import { makeCue } from './captions.js';
import { loadImages } from './assets.js';
const q = new URLSearchParams(location.search), scale = Number(q.get('scale')) || 1, v = q.get('v') || 'en';
const { WORDS, DURATION } = await import(`./timing_${v}.js`);
const { scenes } = makeScenes(makeCue(WORDS), DURATION);
const canvas = document.getElementById('c');
canvas.width = 2 * Math.round(W * scale / 2); canvas.height = 2 * Math.round(H * scale / 2);
const ctx = canvas.getContext('2d');
await document.fonts.ready;
await loadImages(['claude_logo.png', 'mountain.png', 'sky.png', ...[1, 2, 3, 4, 5, 6, 7, 8].map(i => `web${i}.png`)]);
window.renderFrame = t => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  const s = scenes.find(s => t >= s.start && t < s.end) || scenes[0];
  // global camera: slow push-in across each scene plus a gentle drift, so no frame is ever still
  const u = clamp((t - s.start) / Math.max(1, Math.min(s.end, DURATION) - s.start)), z = 1 + .035 * eio(u);
  ctx.save(); ctx.translate(W / 2 + 8 * Math.sin(t * .37), H / 2 + 6 * Math.sin(t * .29)); ctx.rotate(.003 * Math.sin(t * .45)); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  s.draw(ctx, t); ctx.restore();
  const k = clamp((t - s.start) / .18); if (s.start > 0 && k < 1) { ctx.fillStyle = `rgba(${s.dark ? '0,0,0' : '255,255,255'},${.8 * (1 - k)})`; ctx.fillRect(0, 0, W, H); }
  const e = clamp((t - (DURATION - .6)) / .6); if (e > 0) { ctx.fillStyle = `rgba(255,255,255,${e})`; ctx.fillRect(0, 0, W, H); }
};
window.grab = (type, quality = .92) => canvas.toDataURL(type, quality);
window.__ready = true;
