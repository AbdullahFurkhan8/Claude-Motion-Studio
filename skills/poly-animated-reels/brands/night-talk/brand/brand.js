// BRAND 3: quiet night two-hander. A small human and a glowing block (or robot) sit on a giant laptop at night.
// Warm rim light, big bokeh string lights, city lights. Sets: `rooftop` (blue night) and `keys` (purple keyboard close).
// Set "botKind": "glow" for the robot. Short, soft captions.
import * as THREE from 'three';
import { makeHuman, makeBlock, makeGlowBot } from '/engine/rig.js';
import { mat, basic, glow, box, cyl, mesh, group, plane, bokeh, point, canvasTex, facet, hash, relight, autoShots } from '/engine/lowpoly.js';
const THEME = { bg: '#20222b', bar: '#2a2c36', field: '#343641', card: '#2c2e39', fg: '#e8e8f2', dim: '#9a9cae', accent: '#8f86ff', onAccent: '#fff', hot: '#35324e', good: '#6ad09a', line: '#44465a', head: '"Segoe UI"', body: '"Segoe UI"' };
function night(r, tint) {
  box(40, 26, .2, mat(0x10164a), r, [0, 10, -11]);
  plane(40, 26, new THREE.MeshBasicMaterial({ map: canvasTex(32, 128, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, tint[0]); g.addColorStop(1, tint[1]); c.fillStyle = g; c.fillRect(0, 0, w, h); }) }), r, [0, 10, -10.8]);
  for (let i = -3; i <= 3; i++) box(.3, 26, .1, basic(0x0a0c26), r, [i * 4.4 + 1.2, 10, -9]);
  box(40, .3, .1, basic(0x0a0c26), r, [0, 4.9, -9]);
  const city = [], stars = [], lights = [];
  for (let i = 0; i < 34; i++) { const x = (hash(i) - .5) * 12, y = -.4 + hash(i + 7) * 2.6; city.push(bokeh(.3 + hash(i + 2) * .24, i % 5 ? 0xffc46a : 0xfff0c8, r, [x, y, -7.4], .55)); }
  for (let i = 0; i < 9; i++) box(1.5 + hash(i) * 1.2, 1.2 + hash(i + 2) * 2.4, .1, basic(0x0a0e38), r, [-8 + i * 2, .2, -8]);
  for (let i = 0; i < 26; i++) stars.push(bokeh(.05 + hash(i + 20) * .08, 0xc8d0ff, r, [(hash(i + 3) - .5) * 12, 3 + hash(i + 4) * 9, -6], .55));
  for (const i of [0, 1]) bokeh(.2, 0xff4050, r, [i ? 1.7 : -1.2, 7.2 - i, -6.5], .9);
  for (let i = 0; i < 7; i++) lights.push(bokeh(.86, 0xfff0d0, r, [-5.4 + i * 1.8, 5.4 + hash(i) * .5, -4], .85));
  return { city, stars, lights };
}
function rooftop(s, panelTex) {
  const r = group(s), N = night(r, ['#10173f', '#2b3aa0']);
  // The laptop's top edge is the ledge they sit on; its screen drops below them.
  box(14, 3, 1.6, mat(0x16182a), r, [0, -1.5, -.2]);
  const screen = plane(5, 4.4, new THREE.MeshBasicMaterial({ map: panelTex, color: new THREE.Color(1.3, 1.3, 1.4) }), r, [0, -2.6, .62]);
  const idle = plane(5, 4.4, new THREE.MeshBasicMaterial({ map: canvasTex(1100, 968, (c, w, h) => { c.fillStyle = '#1b1d28'; c.fillRect(0, 0, w, h); for (let k = 0; k < 3; k++) { c.fillStyle = '#272a38'; c.beginPath(); c.roundRect(30 + k * 350, 40, 330, 880, 16); c.fill(); c.fillStyle = '#5a5cc0'; c.fillRect(60 + k * 350, 80, 240, 26); c.fillStyle = '#4a4c5e'; for (let y = 0; y < 18; y++) c.fillRect(60 + k * 350, 130 + y * 40, 150 + (y * 37 + k * 53) % 110, 12); } }) }), r, [0, -2.6, .63]);
  r.add(new THREE.HemisphereLight(0x8a90e0, 0x241840, .85));
  const rim = new THREE.DirectionalLight(0xffb060, 3.6); rim.position.set(7, 2.4, 2.2); r.add(rim);
  const key = new THREE.DirectionalLight(0xa8b4ff, 1.5); key.position.set(-3, 5, 8); key.castShadow = true; r.add(key);
  point(r, 0xb0a0ff, 7, 9, [0, -.6, 3]);
  return { r, idle, ...N,
    place: { human: [-1.15, -1.3, .05, .35, .78, 'sit', [.28, .14]], bot: [1.05, 0, -.1, -.28, .66] },
    shots: {
      two: { pos: [0, 2.3, 13], look: [0, 1.2, 0], fov: 32 },
      close_human: { pos: [.5, 2, 5.6], look: [-1.1, 1.7, 0], fov: 32, roll: -3 },
      close_bot: { pos: [-.1, 1.6, 6.6], look: [1, 1, 0], fov: 30, roll: 3 },
      panel: { pos: [0, 2, 13.5], look: [0, -.9, 0], fov: 33, push: .06 },
    } };
}
function keys(s, panelTex) {
  const r = group(s);
  box(40, 26, .2, mat(0x241a50), r, [0, 8, -10]);
  const scr = box(16, 10, .3, mat(0x2b2e3e, { roughness: .3 }), r, [0, 6.2, -6.5], [-.1, 0, 0]);
  const idle = plane(15, 9.4, new THREE.MeshBasicMaterial({ color: 0x2a2c3a }), r, [0, 6.2, -6.3], [-.1, 0, 0]);
  const screen = plane(15, 9.4, new THREE.MeshBasicMaterial({ map: panelTex }), r, [0, 6.2, -6.32], [-.1, 0, 0]);
  box(30, .3, 20, mat(0x17163a), r, [0, -.2, 1]);
  for (let z = 0; z < 6; z++) for (let x = 0; x < 11; x++) box(1.1, .22, 1.1, mat(0x35307a), r, [-6.6 + x * 1.32 + (z % 2) * .4, .08, -3.6 + z * 1.32]);
  r.add(new THREE.HemisphereLight(0x9a88ff, 0x1a1040, 1.3));
  const rim = new THREE.DirectionalLight(0xffa080, 5.5); rim.position.set(-6, 5, 3); r.add(rim);
  const key = new THREE.DirectionalLight(0xc8c0ff, 1.5); key.position.set(4, 9, 7); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); r.add(key);
  return { r, idle, city: [], stars: [], lights: [],
    place: { human: [-1.3, -.3, .3, .55, .85, 'sit', [.2, .12]], bot: [1.2, .14, -.6, -.4, .8] },
    shots: {
      two: { pos: [.2, 3.3, 12.5], look: [0, 1.7, 0], fov: 32 },
      close_human: { pos: [.2, 2.4, 6.2], look: [-1.3, 2.5, .3], fov: 34, roll: 4 },
      close_bot: { pos: [.1, 1.7, 5.2], look: [1.15, 1.7, -.6], fov: 34, roll: -3 },
      panel: { pos: [0, 4, 9], look: [0, 5.4, -6], fov: 44, push: .1 },
    } };
}
// Seated outdoor sets. Panels float as an overlay here, because there is no laptop screen in frame.
const sky = (r, a, b) => plane(50, 26, new THREE.MeshBasicMaterial({ map: canvasTex(32, 128, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, w, h); }) }), r, [0, 9, -12]);
const starField = r => { const a = []; for (let i = 0; i < 24; i++) a.push(bokeh(.05 + hash(i + 20) * .08, 0xd8dcff, r, [(hash(i + 3) - .5) * 13, 3 + hash(i + 4) * 8, -8], .6)); return a; };
function bench(s) {
  const r = group(s); sky(r, '#0c1238', '#34307c');
  plane(40, 24, mat(0x12204a), r, [0, 0, 2], [-Math.PI / 2, 0, 0]);
  for (let i = 0; i < 8; i++) { const x = -9 + i * 2.6, h = 3 + hash(i) * 2.4; mesh(new THREE.ConeGeometry(1.5, h, 6), mat(0x0d1a3c), r, [x, h / 2 + .6, -7 - hash(i + 2) * 2]); }
  mesh(new THREE.CircleGeometry(.75, 24), basic(0xf4ecd0), r, [-2.2, 5.6, -9.5]);
  for (const x of [-1.9, 1.9]) box(.14, 1.2, 1, 0x2a2c38, r, [x, .6, -.4]);
  for (let i = 0; i < 3; i++) box(4.4, .1, .3, 0x7a4a2c, r, [0, 1.25, -.8 + i * .4]); for (let i = 0; i < 3; i++) box(4.4, .3, .08, 0x7a4a2c, r, [0, 1.75 + i * .42, -1.08]);
  cyl(.06, .08, 6, 7, mat(0x1c1e2a), r, [2.8, 3, -1.2]); const lampG = mesh(new THREE.SphereGeometry(.26, 10, 8), glow(0xffc070, 7), r, [2.8, 6.1, -1.2]);
  point(r, 0xffb868, 42, 13, [2.6, 5.8, -.6]); r.add(new THREE.HemisphereLight(0x8a90e0, 0x141838, .75));
  const key = new THREE.DirectionalLight(0xa8b4ff, .9); key.position.set(-3, 5, 8); key.castShadow = true; r.add(key);
  const flies = []; for (let i = 0; i < 12; i++) flies.push(bokeh(.1, 0xffd878, r, [(hash(i) - .5) * 7, .8 + hash(i + 2) * 3, -2 + hash(i + 4)], .8));
  const place = { human: [-1.05, -.05, -.45, .32, .8, 'sit', [.3, .1]], bot: [1, 1.3, -.5, -.3, .62] };
  return { r, city: [], stars: [], lights: [], flies, place, shots: autoShots(place.human, place.bot, { headH: 3.3, botH: 1.5, dist: 11.5, close: 5, closeBot: 7 }) };
}
function fireescape(s) {
  const r = group(s); sky(r, '#141a4a', '#6a3a7a');
  const brick = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#2a1414'; c.fillRect(0, 0, w, h); for (let y = 0; y < 10; y++) for (let x = 0; x < 6; x++) { c.fillStyle = ['#6a3226', '#5a2a22', '#74382a'][(x * 3 + y * 7) % 3]; c.fillRect(x * 44 - (y % 2) * 22 + 2, y * 26 + 2, 40, 22); } }); brick.wrapS = brick.wrapT = THREE.RepeatWrapping; brick.repeat.set(2, 5);
  plane(9, 18, new THREE.MeshStandardMaterial({ map: brick }), r, [-3.6, 6, -3]);
  const w = new THREE.MeshStandardMaterial({ color: 0, emissive: 0xffc070, emissiveIntensity: .95 }); box(2.2, 3, .1, w, r, [-3.1, 3.8, -2.9]); box(.1, 3, .15, 0x24140e, r, [-3.1, 3.8, -2.85]); box(2.2, .1, .15, 0x24140e, r, [-3.1, 3.8, -2.85]);
  for (let i = 0; i < 9; i++) box(9, .05, 3, 0x202230, r, [0, .05, -1.4], [0, 0, 0]);
  for (let i = 0; i < 16; i++) box(.05, .05, 3, 0x383a4c, r, [-4.5 + i * .6, .1, -1.4]);
  for (let i = 0; i < 2; i++) box(9, .08, .08, 0x383a4c, r, [0, 2.3 + i * .08, .1 - i * .02]); for (let i = 0; i < 9; i++) box(.05, 2.3, .05, 0x383a4c, r, [-4 + i, 1.15, .1]);
  const N = []; for (let i = 0; i < 26; i++) N.push(bokeh(.26 + hash(i + 2) * .24, i % 5 ? 0xffc46a : 0xfff0c8, r, [1 + hash(i) * 8, -1 + hash(i + 7) * 4.6, -6], .4));
  for (let i = 0; i < 6; i++) box(1.4 + hash(i), 2 + hash(i + 2) * 3, .1, basic(0x12103a), r, [1 + i * 1.6, 1, -7]);
  const L = []; for (let i = 0; i < 6; i++) L.push(bokeh(.44, 0xfff0d0, r, [-2.4 + i * 1.3, 6.3 - Math.sin(i * .9) * .35, -2.4], .6));
  point(r, 0xffb060, 9, 8, [-2.8, 3.8, -1.6]); r.add(new THREE.HemisphereLight(0x8a80d8, 0x1c1438, .85));
  const key = new THREE.DirectionalLight(0xc0b0ff, 1); key.position.set(4, 6, 7); key.castShadow = true; r.add(key);
  const place = { human: [-1.15, -.75, -.2, .35, .8, 'sit', [.26, .1]], bot: [1, .05, -.3, -.3, .62] };
  return { r, city: N, stars: [], lights: L, place, shots: autoShots(place.human, place.bot, { headH: 3.3, botH: 1.5, dist: 11.5, close: 5, closeBot: 7 }) };
}
function campfire(s) {
  const r = group(s); sky(r, '#050a24', '#1c2a5a');
  plane(40, 24, mat(0x101c22), r, [0, 0, 2], [-Math.PI / 2, 0, 0]);
  for (let i = 0; i < 9; i++) { const h = 4 + hash(i) * 3; mesh(new THREE.ConeGeometry(1.6, h, 6), mat(0x0a1420), r, [-10 + i * 2.5, h / 2, -6 - hash(i) * 2]); }
  const stars = starField(r);
  mesh(new THREE.ConeGeometry(2.1, 2.6, 4), mat(0xc8843a), r, [3.4, 1.3, -3.6], [0, .6, 0]);
  for (const [x, ry] of [[-1.3, .22], [1.3, -.22]]) cyl(.44, .46, 2.3, 7, mat(0x5a3a22), r, [x, .45, -.3], [0, ry, Math.PI / 2]);
  const fire = group(r, [0, 0, 1.3]); for (let i = 0; i < 6; i++) { const a = i * 1.05; cyl(.1, .13, 1.4, 6, mat(0x3a2414), fire, [Math.sin(a) * .34, .14, Math.cos(a) * .34], [Math.cos(a) * 1.3, 0, -Math.sin(a) * 1.3]); }
  const flames = [[0, .7, .34, 1.5, 0xff7a20], [.15, .5, .24, 1, 0xffb030], [-.14, .5, .22, .85, 0xffd060]].map(([x, y, w, h, c]) => mesh(new THREE.ConeGeometry(w, h, 5), glow(c, 1.8), fire, [x, y, 0]));
  const light = point(r, 0xff9040, 12, 11, [0, 1.8, 2.2]);
  r.add(new THREE.HemisphereLight(0x6070c0, 0x181c24, .8));
  const place = { human: [-1.2, -.5, -.3, .5, .8, 'sit', [.24, .08]], bot: [1.15, .85, -.35, -.45, .62] };
  return { r, city: [], stars, lights: [], flames, fireLight: light, place, shots: { ...autoShots(place.human, place.bot, { headH: 3.3, botH: 1.5, dist: 11.5, close: 5, closeBot: 7 }) } };
}
const LOOKS = {
  night: {},
  amber: { color: 0xffa050, mix: .28, k: 1.1, tint: [1.05, .98, .94] },
  moon: { color: 0x88a4ff, mix: .32, k: .95, tint: [.95, .98, 1.08] },
  violet: { color: 0xb070ff, mix: .3, k: 1.05, tint: [1, .95, 1.08] },
};
export default ({ episode }) => {
  const setName = episode.set || 'rooftop', LOOK = LOOKS[episode.light] || LOOKS.night, floating = ['bench', 'fireescape', 'campfire'].includes(setName);
  const human = makeHuman({ hoodie: 0x34339a, hairStyle: 'spikes', eyes: 'dot', skin: 0xeab596, noseColor: 0xe08a4a, noseSides: 3, shoe: 0xeeeeff, hair: 0x14142a, seed: 12, headScale: 1.26, ...(episode.human || {}) });
  const bot = episode.botKind === 'glow' ? makeGlowBot(episode.bot || {}) : makeBlock({ color: 0xf0642a, ...(episode.bot || {}) });
  let S;
  return {
    exposure: 1.08, bloom: { strength: .65, radius: .8, threshold: 1 }, hero: { k: 4.6, fill: 1.1, color: 0xffcc70 }, vignette: .62, grain: .025, tint: LOOK.tint || [1, .98, 1.04],
    theme: THEME, panelShot: 'panel', cast: { human, bot },
    caption: { font: '"Segoe UI"', weight: 600, size: 46, maxWords: 8, y: 720, blur: 12, stroke: 4, color: { human: '#ffffff', bot: '#ffffff' } },
    captionAt: (shot, panel, h) => panel && floating ? 240 + h + 62 : null,
    panel: floating ? { mode: 'overlay', x: 40, y: 240, w: 1000, h: 790, ui: .8 } : { mode: 'world', w: 1100, h: setName === 'keys' ? 690 : 968, ui: .8 },
    end: { bg: '#090a18', font: '"Segoe UI"', weight: 700, accent: '#8f86ff', onAccent: '#fff' },
    build(scene, panelTex) { S = { rooftop, keys, bench, fireescape, campfire }[setName](scene, panelTex); scene.background = new THREE.Color(0x070818); scene.add(human.root, bot.root); relight(scene, LOOK); },
    shot(name) { const d = S.shots[name] || S.shots[name.replace(/_.*/, '')] || S.shots.two; return { ...d, place: S.place }; },
    panelVisible(on) { if (S.idle) S.idle.visible = !on; },
    update(t) {
      S.flames?.forEach((f, i) => { f.scale.set(1 + Math.sin(t * 9 + i) * .08, 1 + Math.sin(t * 11 + i * 2) * .16, 1); });
      if (S.fireLight) S.fireLight.intensity = (12 + Math.sin(t * 13) * 1.4 + Math.sin(t * 7.3) * 1.4) * (LOOK.k ?? 1);
      S.flies?.forEach((f, i) => { f.position.x += Math.sin(t * .8 + i) * .003; f.position.y += Math.cos(t * .6 + i * 2) * .002; f.material.opacity = .4 + .4 * Math.sin(t * 1.7 + i); });
      S.lights.forEach((l, i) => { l.position.x = -5.4 + i * 1.8 + Math.sin(t * .35) * .22; l.material.opacity = .72 + .16 * Math.sin(t * 1.4 + i * 2); });
      S.city.forEach((c, i) => { c.material.opacity = .42 + .2 * Math.sin(t * (.7 + hash(i)) + i); });
      S.stars.forEach((c, i) => { c.position.y -= .0007 * (1 + i % 3); if (c.position.y < 2.5) c.position.y = 12; });
    },
  };
};
