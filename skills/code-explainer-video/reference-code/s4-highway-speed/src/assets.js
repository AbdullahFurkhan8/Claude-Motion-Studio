// Image assets (the user's PNG/SVG files in src/assets/), preloaded before the first frame.
// draw: img(ctx, 'bud_3q', x, y, w) centres the image on (x, y) at width w, keeping its aspect.
export const IMG = {};
export async function loadImages(names) {
  await Promise.all(names.map(n => new Promise((ok, no) => { const i = new Image(); i.onload = () => { IMG[n.replace(/\.\w+$/, '')] = i; ok(); }; i.onerror = () => no(Error('image ' + n)); i.src = './assets/' + n; })));
}
export function img(ctx, name, x, y, w, a = 1) {
  const i = IMG[name]; if (!i || a <= 0) return; const h = w * i.height / i.width;
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(i, x - w / 2, y - h / 2, w, h); ctx.restore(); return h;
}
