import { W, H, clamp, eio, lerp } from './lib.js';
import { makeScenes, KEYWORDS, EMOJI, LANG } from './scenes.js';
import { makeCue, drawCaptions, setKeywords } from './captions.js';
import { loadImages } from './assets.js';
const q = new URLSearchParams(location.search), scale = Number(q.get('scale')) || 1, v = q.get('v') || 'en';
const { WORDS, CHUNKS, DURATION } = await import(`./timing_${v}.js`);
const lang = v.startsWith('hi') ? 'hi' : 'en', L = LANG[lang] || {};
setKeywords(L.keywords || KEYWORDS, L.emoji || EMOJI);
const { scenes } = makeScenes(makeCue(WORDS, L.alias), lang);
const canvas = document.getElementById('c');
canvas.width = 2 * Math.round(W * scale / 2); canvas.height = 2 * Math.round(H * scale / 2);
const ctx = canvas.getContext('2d');
const buf = document.createElement('canvas'); buf.width = canvas.width; buf.height = canvas.height; const bctx = buf.getContext('2d');
await document.fonts.ready;
await loadImages(['email.png', 'pdp_cut.png', 'pdp_room.jpg', 'pdp_talk.png', 'openai_black.png', 'openai_white.png', 'qwen.png', 'claude.png', 'ajax_small.png']);
// one scene with the global camera: slow push-in across the scene plus a gentle drift, so no frame is ever still
function drawScene(c, s, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, canvas.width, canvas.height);
  c.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  const u = clamp((t - s.start) / Math.max(1, Math.min(s.end, DURATION) - s.start)), z = 1 + .04 * eio(u);
  c.save(); c.translate(W / 2 + 6 * Math.sin(t * .37), H / 2 + 8 * Math.sin(t * .29)); c.rotate(.004 * Math.sin(t * .45)); c.scale(z, z); c.translate(-W / 2, -H / 2);
  s.draw(c, t); c.restore();
}
window.renderFrame = t => {
  const i = Math.max(0, scenes.findIndex(s => t >= s.start && t < s.end)), s = scenes[i], prev = scenes[i - 1];
  const xf = s.xf ?? .4, k = xf > 0 ? clamp((t - s.start) / xf) : 1;
  if (prev && k < 1) { // soft morph between scenes: new scene fades in over the old one
    drawScene(ctx, prev, t); drawScene(bctx, s, t);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = eio(k); ctx.drawImage(buf, 0, 0); ctx.globalAlpha = 1;
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  } else drawScene(ctx, s, t);
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  // hard cut: quick flash in the scene's tone
  const light = s.light, kk = prev && light !== prev.light && k < 1 ? eio(k) : 1;
  const c0 = prev && !prev.light ? [15, 16, 18] : [244, 244, 242], c1 = light ? [244, 244, 242] : [15, 16, 18];
  const bgc = (prev ? c0.map((x, j) => Math.round(lerp(x, c1[j], kk))) : c1).join(',');
  if (s.flash && t - s.start < .35) { ctx.fillStyle = `rgba(255,255,255,${.85 * (1 - (t - s.start) / .35)})`; ctx.fillRect(0, 0, W, H); }
  let g = ctx.createLinearGradient(0, 0, 0, 470);
  g.addColorStop(0, `rgba(${bgc},1)`); g.addColorStop(.7, `rgba(${bgc},.85)`); g.addColorStop(1, `rgba(${bgc},0)`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 470);
  drawCaptions(ctx, t, WORDS, CHUNKS, kk > .5 ? light : (prev ? prev.light : light));
};
window.grab = (type, quality = .92) => canvas.toDataURL(type, quality);
window.__ready = true;
