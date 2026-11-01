// BRAND 1: warm cinematic low-poly. A hooded human and a hovering orange orb in cosy rooms. Serif captions.
// Sets: apartment, library, diner. Choose one with "set" in episode.json.
import * as THREE from 'three';
import { makeHuman, makeOrb } from '/engine/rig.js';
import { mat, glow, basic, box, cyl, mesh, group, plane, bokeh, point, sun, facet, canvasTex, hash, relight, autoShots } from '/engine/lowpoly.js';
const LIGHT = { bg: '#faf6ee', bar: '#efe9dd', field: '#ffffff', card: '#f1ebdf', fg: '#2a2420', dim: '#8a8074', accent: '#c8553a', onAccent: '#fff', hot: '#fbeed0', good: '#2e8a4a', line: '#d8cfc0', head: 'Lora', body: '"Segoe UI"' };
const DARK = { ...LIGHT, bg: '#1d1f24', bar: '#2a2c32', field: '#34363d', card: '#2a2c32', fg: '#eef0f3', dim: '#9aa0aa', hot: '#3a3226', line: '#454750' };
function rainWindow(p, w, h, pos, rotY = 0, top = 0x241a4e, bottom = 0x4a2f7a, lit = 0xffc66a) {
  const g = group(p, pos); g.rotation.y = rotY;
  plane(w, h, new THREE.MeshBasicMaterial({ map: canvasTex(64, 128, (c, W, H) => { const q = c.createLinearGradient(0, 0, 0, H); q.addColorStop(0, '#' + top.toString(16).padStart(6, '0')); q.addColorStop(1, '#' + bottom.toString(16).padStart(6, '0')); c.fillStyle = q; c.fillRect(0, 0, W, H); }) }), g);
  for (let i = 0; i < 7; i++) {       // skyline with small lit windows
    const bw = w / 7 * (.8 + hash(i) * .4), bh = h * (.1 + hash(i + 3) * .26), x = -w / 2 + (i + .5) * w / 7;
    box(bw, bh, .02, basic(0x1a1236), g, [x, -h / 2 + bh / 2, .02]);
    for (let k = 0; k < 8; k++) if (hash(i * 9 + k) > .55) box(.05, .07, .01, basic(lit), g, [x + (hash(k + i) - .5) * bw * .8, -h / 2 + hash(k * 3 + i) * bh * .9 + .04, .04]);
  }
  const drops = []; for (let i = 0; i < 26; i++) drops.push(bokeh(.05 + hash(i) * .08, 0xd8ccff, g, [(hash(i + 1) - .5) * w, (hash(i + 2) - .5) * h, .06], .55));
  return { g, drops, h };
}
const FRAME = (p, w, h, pos, col, t = .07) => { for (const [x, y, ww, hh] of [[0, h / 2, w + t, t], [0, -h / 2, w + t, t], [-w / 2, 0, t, h], [w / 2, 0, t, h], [0, 0, t * .6, h]]) box(ww, hh, .08, col, p, [pos[0] + x, pos[1] + y, pos[2] + .1]); };
function apartment(s) {
  const r = group(s), wall = mat(0xe9d8bb, { flatShading: false });
  box(26, 16, .2, wall, r, [0, 7, -3]); box(26, .2, 16, mat(0x6b3a22), r, [0, -.1, 3]);
  // Picture on the left, like a cheap landscape print.
  box(2.1, 1.6, .06, mat(0x3a2415), r, [-2.4, 5.4, -2.85]);
  plane(1.9, 1.4, new THREE.MeshStandardMaterial({ map: canvasTex(190, 140, (c, w, h) => { c.fillStyle = '#efe6cc'; c.fillRect(0, 0, w, h); c.fillStyle = '#e88a4a'; c.beginPath(); c.arc(110, 50, 18, 0, 7); c.fill(); c.fillStyle = '#5a7a4a'; c.beginPath(); c.moveTo(0, 140); c.lineTo(70, 56); c.lineTo(130, 140); c.fill(); c.fillStyle = '#7f9a58'; c.beginPath(); c.moveTo(70, 140); c.lineTo(140, 74); c.lineTo(190, 140); c.fill(); }) }), r, [-2.4, 5.4, -2.8]);
  const win = rainWindow(r, 2.8, 5.6, [2.5, 5, -2.87]); FRAME(r, 2.8, 5.6, [2.5, 5, -2.87], 0x3a2a3a);
  // Couch.
  const C = 0xb5482a, C2 = 0xc4552f;
  box(9, 1.0, 2.2, C, r, [0, .55, -1.3]); box(9, 1.9, .7, C, r, [0, 1.75, -2.3]);
  box(2.9, .34, 1.9, C2, r, [-1.5, 1.2, -1.2]); box(2.9, .34, 1.9, C2, r, [1.5, 1.2, -1.2]);
  box(2.9, 1.15, .4, C2, r, [-1.5, 2, -2]); box(2.9, 1.15, .4, C2, r, [1.5, 2, -2]);
  mesh(new THREE.BoxGeometry(1.4, .06, 1), mat(0xeadfc4), r, [.9, 1.42, -1.1], [.02, .4, .03]);    // throw blanket
  // Coffee table with a slice of life.
  const T = 0x7d4a26; box(5, .16, 2.3, T, r, [0, 1.15, 1.7]); box(4.6, .1, 2, T, r, [0, .35, 1.7]);
  for (const x of [-2.2, 2.2]) for (const z of [.75, 2.65]) box(.16, 1.1, .16, 0x5a3219, r, [x, .6, z]);
  const mug = group(r, [-1.7, 1.23, 1.6]); cyl(.2, .18, .36, 12, mat(0xf2ebdc), mug, [0, .18, 0]); cyl(.205, .205, .08, 12, mat(0xc8553a), mug, [0, .16, 0]);
  mesh(new THREE.TorusGeometry(.12, .03, 6, 10), mat(0xf2ebdc), mug, [.22, .18, 0]);
  box(.42, .03, .8, 0x15151a, r, [.25, 1.25, 1.75], [0, .5, 0]);                            // phone
  mesh(facet(.11, 0, .1, 3), mat(0xf0f0ee), r, [-.5, 1.28, 2]); mesh(facet(.11, 0, .1, 4), mat(0xf0f0ee), r, [.95, 1.28, 2.2]);
  mesh(facet(.2, 1, .05, 9), mat(0xc22a2a), r, [1.6, 1.42, 1.5]); box(.02, .12, .02, 0x3a2a12, r, [1.6, 1.64, 1.5]);
  box(1.2, .05, .9, 0xf2ece0, r, [-.3, .43, 1.7], [0, .25, 0]);
  const pen = box(.9, .03, .03, 0x1f2a44, r, [-.6, 1.26, 1.15], [0, .2, 0]);
  // Laptop on the human's knees.
  const lap = group(r, [-.52, 1.86, -.48]); lap.rotation.y = .85;
  box(1.1, .05, .8, 0x9a9ca2, lap); box(1.1, .66, .04, 0xb0b2b8, lap, [0, .31, .44], [.2, 0, 0]);
  sun(s, 0xffe6c2, 2.3, [4, 11, 8], [0, 2, 0], 8); s.add(new THREE.HemisphereLight(0xffe9cf, 0x5a2a1a, 1.5));
  const lamp = point(s, 0xffd9a0, 42, 18, [3.8, 6.5, 2]); point(s, 0xc8a0ff, 5, 8, [2.5, 4.5, -1]);
  const dust = []; for (let i = 0; i < 14; i++) dust.push(bokeh(.05 + hash(i + 40) * .05, 0xffe2b0, r, [(hash(i) - .5) * 6, 1 + hash(i + 1) * 6, (hash(i + 2) - .3) * 3], .3));
  return { win, dust, lamp,
    place: { human: [-1.0, .02, -.9, .85, 1, 'type', [.15, 0]], bot: [1.3, 1.3, -.7, -.55, .82] },
    shots: {
      two: { pos: [.1, 3.9, 13.5], look: [.1, 2.9, -1], fov: 34 },
      panel: { pos: [.1, 3, 13.4], look: [.1, 4.9, -1], fov: 34 },
      close_human: { pos: [.5, 3.6, 3.6], look: [-1.0, 3.35, -.8], fov: 34, roll: -7 },
      close_bot: { pos: [.3, 3.2, 3.6], look: [1.3, 3.7, -.7], fov: 34, roll: 6 },
    } };
}
function library(s) {
  const r = group(s), stone = mat(0xd6b98e), wood = 0x6d3a1f;
  box(40, .2, 40, mat(0x6a1f22), r, [0, -.1, -6]); box(40, 26, .3, stone, r, [0, 10, -13]);
  // Coffered ceiling.
  const cTex = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#b08a55'; c.fillRect(0, 0, w, h); for (let x = 0; x < 8; x++) for (let y = 0; y < 4; y++) { c.fillStyle = '#6e4a26'; c.fillRect(x * 64 + 8, y * 64 + 8, 48, 48); c.fillStyle = '#4a2f18'; c.fillRect(x * 64 + 15, y * 64 + 15, 34, 34); } });
  cTex.wrapS = cTex.wrapT = THREE.RepeatWrapping; cTex.repeat.set(3, 3);
  plane(44, 34, new THREE.MeshStandardMaterial({ map: cTex }), r, [0, 16, -6], [Math.PI / 2 + .12, 0, 0]);
  const win = rainWindow(r, 5.4, 9, [0, 7.3, -12.8], 0, 0x0e1840, 0x3456c8, 0xffe9b0);
  for (let k = 0; k <= 5; k++) box(.08, 9, .08, 0x241a22, r, [-2.7 + k * 1.08, 7.3, -12.6]); for (let k = 0; k < 6; k++) box(5.4, .08, .08, 0x241a22, r, [0, 3.2 + k * 1.6, -12.6]);
  mesh(new THREE.CircleGeometry(2.7, 24, 0, Math.PI), basic(0x101c55), r, [0, 11.8, -12.7]);
  for (const x of [-4.4, 4.4]) { cyl(.74, .86, 13, 14, stone, r, [x, 6.4, -11]); box(2, .4, 2, stone, r, [x, 13, -11]); box(2, .5, 2, stone, r, [x, .25, -11]); }
  for (const x of [-9, 9]) box(5, 7, .3, 0x4a2412, r, [x, 3.6, -12.6]);
  // Reading desk with brass lamps.
  box(9, .2, 3.6, 0x8a4630, r, [0, 2.1, .6]); box(8.6, 2, 3.2, wood, r, [0, 1, .6]);
  const books = group(r, [-1.5, 2.2, 1.4]); [[0x2d5b46, 1.3], [0xb03a2a, 1.2], [0x2d5b46, 1.25], [0xe8ddc4, 1.1]].forEach(([c, w], i) => box(w, .19, .9, c, books, [i * .04, .1 + i * .2, 0], [0, (i - 1) * .06, 0]));
  const cup = group(r, [1.6, 2.2, 1.3]); cyl(.22, .17, .62, 12, mat(0xe8ddc4), cup, [0, .31, 0]); cyl(.23, .18, .2, 12, mat(0xa56a30), cup, [0, .28, 0]);
  const lamps = []; for (const x of [-3.6, 3.4]) { box(.05, .7, .05, 0xb08a3a, r, [x, 2.5, -.7]); box(.9, .2, .34, mat(0x1e5a40), r, [x, 2.9, -.7]); lamps.push(point(s, 0xffe0a0, 7, 7, [x, 2.7, -.3])); }
  sun(s, 0xffe2b8, 1.2, [3, 13, 9], [0, 2, 0], 9); s.add(new THREE.HemisphereLight(0xffe6c8, 0x4a1a1a, 1.4));
  point(s, 0xffd8a0, 30, 22, [-2, 7, 3]); point(s, 0x6a80ff, 16, 20, [0, 7, -9]);
  const dust = []; for (let i = 0; i < 16; i++) dust.push(bokeh(.05 + hash(i + 40) * .06, 0xffe2b0, r, [(hash(i) - .5) * 8, 1.5 + hash(i + 1) * 7, (hash(i + 2) - .6) * 8], .28));
  return { win, dust,
    place: { human: [-1.1, .1, -1.4, .75, 1, 'sit', [.12, 0]], bot: [1.5, 1.0, -.9, -.6, 1] },
    shots: {
      two: { pos: [0, 3.5, 9.5], look: [0, 3.6, -1], fov: 34 },
      panel: { pos: [0, 3.2, 10.5], look: [0, 4.9, -1], fov: 36 },
      close_human: { pos: [.3, 3.7, 3.4], look: [-1.1, 3.35, -1.2], fov: 36, roll: 3 },
      close_bot: { pos: [.2, 3.4, 3.4], look: [1.5, 3.8, -.9], fov: 36, roll: -5 },
    } };
}
function diner(s) {
  const r = group(s), N = 8;
  const fl = canvasTex(256, 256, (c, w, h) => { for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) { c.fillStyle = (x + y) % 2 ? '#1c1d3c' : '#c8a878'; c.fillRect(x * w / N, y * h / N, w / N, h / N); } }); fl.wrapS = fl.wrapT = THREE.RepeatWrapping; fl.repeat.set(3, 3); fl.magFilter = THREE.NearestFilter;
  plane(30, 30, new THREE.MeshStandardMaterial({ map: fl, roughness: .4 }), r, [0, 0, 2], [-Math.PI / 2, 0, 0]);
  box(30, 2.2, .3, 0x2b5245, r, [0, 1.1, -3.4]); box(30, .4, .4, 0xe6dcc8, r, [0, 2.3, -3.3]);
  const win = rainWindow(r, 18, 8, [0, 6.4, -3.5], 0, 0x241848, 0x5a2a78, 0xffd27a);
  for (let i = -3; i <= 3; i++) box(.12, 8, .1, 0x201830, r, [i * 3, 6.4, -3.35]);
  box(3.4, 1.8, .05, 0x3a3a68, r, [.5, 6.2, -3.3]);
  const sign = canvasTex(512, 180, (c, w, h) => { c.clearRect(0, 0, w, h); c.font = '800 120px Rubik, Arial'; c.textAlign = 'center'; c.lineWidth = 7; c.strokeStyle = '#ff6ec7'; c.shadowColor = '#ff4fc0'; c.shadowBlur = 24; c.strokeText('OPEN', w / 2, 130); });
  plane(2.6, .9, new THREE.MeshBasicMaterial({ map: sign, transparent: true, side: THREE.DoubleSide }), r, [1.5, 7.1, -2.8], [0, Math.PI, 0]);
  point(s, 0xff5cc0, 22, 9, [1.5, 7, -2]);
  // Booth, table and pendant lamp.
  for (const [x, sd] of [[-3.1, 1], [3.5, -1]]) { box(2, 1.1, 3.4, 0x9a1622, r, [x, .55, -.6]); box(.5, 2.4, 3.4, 0xb51c28, r, [x - sd * .9, 2.1, -.6]); }
  const top = box(4, .12, 2.4, mat(0xc8b8a8, { roughness: .55 }), r, [.2, 2.3, -.6]); cyl(.13, .13, 2.2, 8, mat(0xb0b4bc, { metalness: .6, roughness: .3 }), r, [.2, 1.15, -.6]); cyl(.8, .9, .1, 16, mat(0xc8ccd4, { metalness: .5, roughness: .4 }), r, [.2, .05, -.6]);
  const mug = group(r, [1.6, 2.36, -.3]); cyl(.2, .18, .34, 12, mat(0xe8dcc0), mug, [0, .17, 0]);
  const lap = group(r, [-.75, 2.38, -.5]); lap.rotation.y = 1.1; box(1.1, .05, .8, 0x9a9ca2, lap); box(1.1, .78, .04, 0xb0b2b8, lap, [0, .36, .44], [.2, 0, 0]);
  cyl(.06, .16, .3, 8, mat(0xd0ccc4), r, [.9, 2.5, -1]); box(.5, .4, .3, 0xd8d4cc, r, [.4, 2.56, -1.1]);
  box(.02, 4, .02, 0x111111, r, [.2, 8, -.6]); const shade = mesh(new THREE.ConeGeometry(.75, .55, 16, 1, true), mat(0x101012, { side: THREE.DoubleSide }), r, [.2, 6, -.6]);
  mesh(new THREE.SphereGeometry(.14, 10, 8), glow(0xfff0d0, 8), r, [.2, 5.82, -.6]);
  const hero = new THREE.SpotLight(0xfff0d8, 36, 14, .62, .55, 1.4); hero.position.set(.2, 5.8, -.6); hero.target.position.set(.2, 2, -.6); hero.castShadow = true; hero.shadow.mapSize.set(2048, 2048); s.add(hero, hero.target);
  s.add(new THREE.HemisphereLight(0x8a7ac8, 0x3a1218, .85)); point(s, 0xc070ff, 12, 16, [0, 5, -2]); point(s, 0xffc890, 34, 16, [-3, 4.5, 6]);
  return { win, dust: [],
    place: { human: [-2.0, -.17, -.5, 1.45, 1, 'type', [-.05, .05]], bot: [1.9, 1, -.7, -.75, .85] },
    shots: {
      two: { pos: [0, 3.9, 17.5], look: [0, 4.05, -1], fov: 30 },
      panel: { pos: [0, 2.5, 14.5], look: [0, 6, -1], fov: 34 },
      close_human: { pos: [.7, 3.5, 4.6], look: [-2, 3.1, -.5], fov: 32, roll: -6 },
      close_bot: { pos: [.3, 3, 3], look: [2.05, 3.5, -.7], fov: 34, roll: 5 },
    } };
}
function cafe(s) {
  const r = group(s);
  const brick = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#3a1c14'; c.fillRect(0, 0, w, h); for (let y = 0; y < 10; y++) for (let x = 0; x < 6; x++) { c.fillStyle = ['#8a4a30', '#7a3e28', '#94543a'][(x * 3 + y * 7) % 3]; c.fillRect(x * 44 - (y % 2) * 22 + 2, y * 26 + 2, 40, 22); } }); brick.wrapS = brick.wrapT = THREE.RepeatWrapping; brick.repeat.set(5, 3);
  plane(30, 16, new THREE.MeshStandardMaterial({ map: brick }), r, [0, 7, -3.4]); box(30, .2, 18, mat(0x4a2c1c), r, [0, -.1, 3]);
  const win = rainWindow(r, 5.2, 4.6, [1.6, 4.9, -3.3], 0, 0x1b2150, 0x7a4470, 0xffd27a); FRAME(r, 5.2, 4.6, [1.6, 4.9, -3.3], 0x24140e, .14);
  box(4, .1, .5, 0x5a3219, r, [-3.4, 4.6, -3.1]); for (let i = 0; i < 6; i++) { const c = group(r, [-4.9 + i * .6, 4.66, -3.05]); cyl(.13, .1, .26, 8, mat(i % 2 ? 0xe8dcc0 : 0xc8553a), c, [0, .13, 0]); }
  // Window bar: a long counter with tall stools.
  box(9, .14, 1.5, mat(0x9a6238), r, [0, 2.7, .2]); box(.14, 2.6, 1.1, 0x4a2a16, r, [-3.8, 1.35, .2]); box(.14, 2.6, 1.1, 0x4a2a16, r, [3.8, 1.35, .2]);
  const stool = x => { cyl(.42, .42, .14, 10, mat(0x7a2e22), r, [x, 2.1, -.9]); cyl(.06, .06, 2, 7, mat(0x282830), r, [x, 1.05, -.9]); cyl(.4, .4, .06, 10, mat(0x282830), r, [x, .04, -.9]); }; stool(-1.3);
  const cup = group(r, [-.5, 2.78, .1]); cyl(.2, .16, .3, 10, mat(0xe8dcc0), cup, [0, .15, 0]);
  const lap = group(r, [-.7, 2.78, .3]); lap.rotation.y = -.15; box(1.1, .05, .8, 0x9a9ca2, lap); box(1.1, .66, .04, 0xb0b2b8, lap, [0, .31, .42], [.2, 0, 0]);
  const bulbs = []; for (let i = 0; i < 6; i++) { const x = -4 + i * 1.6, y = 6.1 - Math.sin(i * .9) * .2; box(.02, 1.2, .02, 0x111111, r, [x, y + .7, -1]); bulbs.push(mesh(new THREE.SphereGeometry(.13, 8, 6), glow(0xffcf8a, 5), r, [x, y, -1])); }
  s.add(new THREE.HemisphereLight(0xffd8b0, 0x3a1c14, 1.1)); sun(s, 0xffd8a8, 1.3, [-4, 9, 8], [0, 2, 0], 8); point(s, 0xffc070, 26, 12, [-1, 5.7, 1.5]); point(s, 0xc070ff, 7, 9, [1.6, 5, -2.4]);
  const place = { human: [-1.3, .74, -.9, .55, .9, 'sit', [.15, 0]], bot: [1.35, 1.4, -.5, -.5, .78] };
  return { win, dust: [], place, shots: autoShots(place.human, place.bot, { dist: 15 }) };
}
function train(s) {
  const r = group(s);
  box(30, .2, 12, mat(0x2c2a34), r, [0, -.1, 1]); box(30, .3, 12, mat(0xd8d4c8), r, [0, 7.4, 1]); box(30, 8, .2, mat(0xcfc8b4), r, [0, 3.8, -3.2]);
  const win = rainWindow(r, 8, 3.8, [0, 4, -3.05], 0, 0x161a44, 0x3c2c6a, 0xffd27a); FRAME(r, 8, 3.8, [0, 4, -3.05], 0x3a3c44, .14);
  const pass = []; for (let i = 0; i < 16; i++) pass.push(bokeh(.2 + hash(i) * .36, i % 3 ? 0xffc46a : 0x8ab0ff, r, [0, 2.7 + hash(i + 5) * 2.4, -2.95], .72));
  for (const x of [-3.2, 3.2]) { box(2.5, 1, 2, 0x25406e, r, [x, .95, -.9]); box(2.5, 4, .5, 0x2c4a7e, r, [x, 2.9, -2.1]); box(2.5, .7, .5, 0x3a5c94, r, [x, 4.7, -2.1]); }
  box(1.6, .1, 1.4, mat(0x8a8c94), r, [0, 2.2, -1.5]); box(.14, 2.2, .14, 0x55575e, r, [0, 1.1, -1.8]);
  const cup = group(r, [.2, 2.26, -1.5]); cyl(.18, .14, .3, 10, mat(0xe8dcc0), cup, [0, .15, 0]);
  for (let i = -2; i <= 2; i++) box(2.6, .08, .5, glow(0xfff0d8, 2.2), r, [i * 3.4, 7.2, .4]);
  box(30, .08, .08, mat(0xb8b8c0, { metalness: .6 }), r, [0, 6.1, 1]);
  s.add(new THREE.HemisphereLight(0xfff0d8, 0x383448, 1.8)); sun(s, 0xfff0dc, 1.5, [2, 7, 8], [0, 2, 0], 8); point(s, 0xffe4c0, 18, 14, [0, 6.6, 2]);
  const place = { human: [-2.3, .08, -.8, .95, 1, 'sit', [.1, 0]], bot: [1.6, 1.2, -.9, -.65, .78] };
  return { win, dust: [], pass, place, shots: autoShots(place.human, place.bot, { dist: 17 }) };
}
function office(s) {
  const r = group(s);
  box(30, .2, 18, mat(0x262a36), r, [0, -.1, 3]); box(30, 16, .2, mat(0x3a3e4e), r, [0, 7, -3.6]);
  const win = rainWindow(r, 10, 6.4, [0, 5, -3.45], 0, 0x0e1436, 0x4a3478, 0xffe0a0); for (let i = 0; i <= 4; i++) box(.12, 6.4, .1, 0x1a1c26, r, [-5 + i * 2.5, 5, -3.35]);
  box(5.4, .14, 2, mat(0x8a5a38), r, [.2, 2.2, .1]); for (const x of [-2.2, 2.6]) box(.12, 2.2, 1.8, 0x3a3c46, r, [x, 1.1, .1]);
  const scr = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x7ab8ff, emissiveIntensity: 1.5 });
  const m = group(r, [-.5, 2.3, .5]); m.rotation.y = -1.2; box(1.5, .9, .05, 0x15161c, m, [0, .8, 0]); box(1.38, .78, .01, scr, m, [0, .8, .03]); box(.1, .4, .1, 0x2a2c34, m, [0, .2, 0]);
  const cup = group(r, [1.5, 2.28, .5]); cyl(.2, .17, .32, 10, mat(0xe8dcc0), cup, [0, .16, 0]);
  const plant = group(r, [3.4, 0, -2.2]); cyl(.45, .34, .9, 8, mat(0xa85a36), plant, [0, .45, 0]); for (let i = 0; i < 7; i++) mesh(new THREE.ConeGeometry(.28, 1.6, 4), mat(0x2f6a48), plant, [Math.sin(i) * .3, 1.6 + hash(i) * .5, Math.cos(i) * .3], [Math.cos(i) * .4, 0, Math.sin(i) * .4]);
  box(1.3, .2, 1.3, 0x20222c, r, [-2.5, 1.45, -.6]); box(1.3, 1.7, .2, 0x20222c, r, [-2.9, 2.4, -1.1], [0, .8, 0]); cyl(.08, .08, 1.3, 7, mat(0x3c3e48), r, [-2.5, .7, -.6]);
  const lamp = group(r, [2.1, 2.28, -.3]); box(.05, .9, .05, 0xb08a3a, lamp, [0, .45, 0]); box(.5, .16, .28, mat(0xb4432a), lamp, [-.16, .95, 0]); point(s, 0xffc890, 12, 8, [1.8, 3, 0]);
  s.add(new THREE.HemisphereLight(0x9ab0e0, 0x30323c, 1.7)); sun(s, 0xc8d8ff, 1.2, [3, 8, 8], [0, 2, 0], 8); point(s, 0x7ab8ff, 13, 7, [-.9, 3.3, .9]); point(s, 0xc090ff, 7, 12, [0, 5, -2.5]);
  const place = { human: [-2.5, .16, -.6, 1.1, 1, 'sit', [-.05, 0]], bot: [1.3, 1.25, -.3, -.6, .78] };
  return { win, dust: [], place, shots: autoShots(place.human, place.bot, { dist: 17 }) };
}
const LOOKS = {
  evening: {},
  golden: { color: 0xffa64a, mix: .38, k: 1.1, exposure: 1.02, tint: [1.05, .99, .9] },
  bluehour: { color: 0x7f9cff, mix: .34, k: .95, exposure: 1.02, tint: [.96, .98, 1.08] },
  lamplit: { color: 0xffc27a, mix: .22, k: .7, exposure: 1.1, tint: [1.03, .97, .93] },
};
export default ({ episode }) => {
  const setName = episode.set || 'apartment', dark = ['diner', 'office', 'train'].includes(setName) && setName !== 'train' || episode.theme === 'dark', LOOK = LOOKS[episode.light] || LOOKS.evening;
  const human = makeHuman({ hoodie: 0x245a60, hairStyle: 'pomp', beard: true, eyes: 'cartoon', skin: 0x9a6240, ...(episode.human || {}) }), bot = makeOrb(episode.bot || {});
  let S;
  return {
    exposure: LOOK.exposure ?? (dark ? 1.15 : .95), bloom: { strength: .55, radius: .75, threshold: 1 }, hero: { k: dark ? 4.2 : 3 }, vignette: .42, grain: .025, tint: LOOK.tint || (dark ? [1, .98, 1.02] : [1.02, .99, .95]),
    theme: dark ? DARK : LIGHT, panelShot: 'panel', cast: { human, bot },
    caption: { font: 'Lora', weight: 600, size: 58, maxWords: 6, y: { diner: 500, library: 1520, cafe: 1500, train: 1560, office: 1500 }[setName] || 1280, color: { human: '#ffffff', bot: '#f6d25e' } },
    captionAt: (shot, panel, h) => panel ? 240 + h + 62 : null,
    panel: { mode: 'overlay', x: 40, y: 240, w: 1000, h: 790, ui: .8 },
    end: { bg: setName === 'diner' ? '#050505' : '#1a1412', font: 'Lora', weight: 700, accent: '#f0b63e', onAccent: '#1a1412' },
    endMark(O, t) { O.fillStyle = '#e0653a'; O.beginPath(); O.arc(540, 760 + Math.sin(t * 2) * 8, 26, 0, 7); O.fill(); },
    build(scene) {
      S = { apartment, library, diner, cafe, train, office }[setName](scene);
      scene.background = new THREE.Color(dark ? 0x120d1c : 0x2a1a12);
      scene.add(human.root, bot.root); relight(scene, LOOK);
    },
    shot(name) {
      const d = S.shots[name] || S.shots[name.replace(/_.*/, '')] || S.shots.two;
      return { ...d, place: S.place };
    },
    update(t) {
      S.win.drops.forEach((d, i) => { d.position.y = ((-t * (.7 + hash(i) * .9) + hash(i + 9) * 9) % S.win.h + S.win.h) % S.win.h - S.win.h / 2; });
      S.pass?.forEach((d, i) => { d.position.x = 5 - (((t * (1.4 + hash(i) * 1.3) + hash(i + 3) * 10) % 10)); });
      S.dust.forEach((d, i) => { d.position.x += Math.sin(t * .4 + i) * .0008; d.position.y += Math.cos(t * .3 + i) * .0006; });
    },
  };
};
