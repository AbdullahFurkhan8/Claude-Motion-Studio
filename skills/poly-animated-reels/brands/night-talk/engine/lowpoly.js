// Low-poly building blocks. Everything is deterministic: use hash(), never Math.random.
import * as THREE from 'three';
export const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const eo = k => 1 - Math.pow(1 - clamp(k), 3);
export const eio = k => { k = clamp(k); return k * k * (3 - 2 * k); };
export const eback = k => { k = clamp(k); const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
export const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .78, metalness: 0, flatShading: true, ...o });
export const glow = (color, k = 2) => new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: k });
export const basic = (color, o = {}) => new THREE.MeshBasicMaterial({ color, ...o });
export function mesh(geo, m, p, [x = 0, y = 0, z = 0] = [], [rx = 0, ry = 0, rz = 0] = []) {
  const o = new THREE.Mesh(geo, typeof m === 'number' ? mat(m) : m);
  o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = o.receiveShadow = true;
  if (p) p.add(o); return o;
}
export const box = (w, h, d, m, p, pos, rot) => mesh(new THREE.BoxGeometry(w, h, d), m, p, pos, rot);
export const cyl = (r1, r2, h, n, m, p, pos, rot) => mesh(new THREE.CylinderGeometry(r1, r2, h, n), m, p, pos, rot);
export const group = (p, [x = 0, y = 0, z = 0] = []) => { const g = new THREE.Group(); g.position.set(x, y, z); if (p) p.add(g); return g; };
// Faceted lump: an icosphere with stable per-vertex jitter. Same position gives the same offset, so no cracks.
export function facet(r, detail, jitter, seed = 1, [sx = 1, sy = 1, sz = 1] = []) {
  const g = new THREE.IcosahedronGeometry(r, detail).toNonIndexed(), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = hash(Math.round(x * 97) + Math.round(y * 57) * 13 + Math.round(z * 37) * 7 + seed) - .5, k = 1 + n * jitter;
    p.setXYZ(i, x * k * sx, y * k * sy, z * k * sz);
  }
  g.computeVertexNormals(); return g;
}
// Tapered box (top width/depth differ from the bottom), used for torsos and sleeves.
export function taper(wb, db, wt, dt, h) {
  const g = new THREE.BoxGeometry(1, h, 1).toNonIndexed(), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const top = p.getY(i) > 0; p.setX(i, p.getX(i) * (top ? wt : wb)); p.setZ(i, p.getZ(i) * (top ? dt : db)); }
  g.computeVertexNormals(); return g;
}
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
export function plane(w, h, m, p, pos, rot) { const o = mesh(new THREE.PlaneGeometry(w, h), m, p, pos, rot); o.castShadow = false; return o; }
// Soft round bokeh disc that always faces the camera.
let discTex;
export function bokeh(size, color, parent, pos, opacity = .9) {
  discTex ||= canvasTex(128, 128, c => { const g = c.createRadialGradient(64, 64, 8, 64, 64, 63); g.addColorStop(0, '#fff'); g.addColorStop(.72, 'rgba(255,255,255,.82)'); g.addColorStop(.92, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.scale.setScalar(size); s.position.set(...pos); parent.add(s); return s;
}
export const point = (scene, color, k, dist, pos) => { const l = new THREE.PointLight(color, k, dist, 1.6); l.position.set(...pos); scene.add(l); return l; };
export function sun(scene, color, k, pos, target = [0, 1, 0], size = 7) {
  const l = new THREE.DirectionalLight(color, k); l.position.set(...pos); l.target.position.set(...target); l.castShadow = true;
  l.shadow.mapSize.set(2048, 2048); Object.assign(l.shadow.camera, { left: -size, right: size, top: size, bottom: -size, near: .1, far: 60 });
  l.shadow.bias = -.0008; l.shadow.normalBias = .02; scene.add(l, l.target); return l;
}
// Lighting looks: re-colours every light in a finished set. look = { color, mix, k }.
export function relight(scene, look) {
  if (!look) return;
  const c = new THREE.Color(look.color ?? 0xffffff);
  scene.traverse(o => { if (!o.isLight) return; o.color.lerp(c, look.mix ?? 0); o.intensity *= look.k ?? 1; if (o.isHemisphereLight) o.groundColor.lerp(c, (look.mix ?? 0) * .5); });
}
// Cameras worked out from where the two characters sit, so every new set frames them the same way.
export function autoShots([hx, hy, hz, , hs = 1], [bx, by, bz, , bs = 1], o = {}) {
  const H = hy + (o.headH ?? 3.15) * hs, Bt = by + (o.botH ?? 2.6) * bs, cx = (hx + bx) / 2, cy = (H + Bt) / 2 - .4, d = o.dist ?? 13.5, z = (hz + bz) / 2;
  return {
    two: { pos: [cx, cy + .7, z + d], look: [cx, cy, z], fov: 34 },
    panel: { pos: [cx, cy + .2, z + d + .6], look: [cx, cy + 2, z], fov: 34 },
    close_human: { pos: [hx + 1.5, H + .3, hz + (o.close ?? 4.4)], look: [hx, H, hz], fov: 34, roll: -6 },
    close_bot: { pos: [bx - 1.1, Bt + .1, bz + (o.closeBot ?? 6)], look: [bx, Bt, bz], fov: 34, roll: 5 },
  };
}
