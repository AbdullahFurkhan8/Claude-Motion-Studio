// BRAND 2: dark-room comedy. A big-headed hoodie kid in a different room each video, and a block creature standing on a
// giant keyboard in front of a giant screen. Every gag is on that screen. Bold sans captions. No channel handle anywhere.
// Sets switch per shot: the human's room (`study`, `bedroom`, `cubicle`, `garage`) and `stage` (bots + screen).
import * as THREE from 'three';
import { makeHuman, makeBlock, makeCloudBot } from '/engine/rig.js';
import { mat, basic, glow, box, cyl, mesh, group, plane, point, canvasTex, hash, relight } from '/engine/lowpoly.js';
const THEME = { bg: '#1a1e28', bar: '#232836', field: '#2e3444', card: '#262c3a', fg: '#f0f3f8', dim: '#98a2b4', accent: '#f0a860', onAccent: '#1a1208', hot: '#3a3226', good: '#58c07a', line: '#3e4656', head: 'Rubik', body: 'Rubik' };
const keyLight = (r, c, k, x, y, z) => { const l = new THREE.SpotLight(c, k, 18, .7, .7, 1.3); l.position.set(x, y, z); l.target.position.set(0, 3.2, 0); l.castShadow = true; l.shadow.mapSize.set(2048, 2048); r.add(l, l.target); };
const walls = (r, c, floor) => { box(30, 18, .3, mat(c), r, [0, 8, -4]); box(30, .2, 20, mat(floor), r, [0, -.1, 4]); };
function study(r) {
  walls(r, 0x2e1c16, 0x1c1416);
  box(2.4, 12, .5, mat(0x24150f), r, [3.4, 6, -3.6]);
  for (let i = 0; i < 6; i++) { box(2.2, .1, .5, mat(0x3a2418), r, [3.4, 1.4 + i * 1.6, -3.3]); for (let k = 0; k < 6; k++) box(.24, 1 + hash(i * 7 + k) * .3, .4, mat([0x4e3a2a, 0x3c2c3e, 0x5a4028][k % 3]), r, [2.5 + k * .34, 2 + i * 1.6, -3.3]); }
  box(1.4, .2, 1.1, 0x4a2a1c, r, [0, 1.2, -.5]); for (const x of [-.6, .6]) box(.14, 1.1, .9, 0x2a1810, r, [x, .55, -.5]);
  point(r, 0xff9a60, 14, 12, [-.5, 6, 1.8]); point(r, 0x6a86d0, 16, 12, [-3.5, 3.4, 3]); keyLight(r, 0xffe0c8, 70, -2.5, 7, 7);
  r.add(new THREE.HemisphereLight(0x88706a, 0x201418, .55));
  return { seat: 1.3 };
}
function bedroom(r) {
  walls(r, 0x241a3a, 0x18121f);
  box(3.6, .9, 5, 0x34285a, r, [0, .55, -.4]); box(3.8, .5, 5.2, 0x4a3a7a, r, [0, 1.1, -.4]); box(3.8, 2.2, .3, 0x2a2048, r, [0, 2, -3.1]);
  box(1.2, .3, .8, 0xd8d0e8, r, [-1, 1.5, -2.5], [.25, 0, 0]);
  for (const [x, y, c] of [[-3, 5.4, 0xc8553a], [2.8, 5.8, 0x4a86c8], [3.1, 3.9, 0xe8b04a]]) { box(1.5, 2, .04, c, r, [x, y, -3.8]); box(1.1, .5, .05, 0xf0ece0, r, [x, y + .3, -3.77]); }
  for (let i = 0; i < 7; i++) mesh(new THREE.BoxGeometry(1.9, .05, .05), glow(i % 2 ? 0xff4fa8 : 0x7a5cff, 3), r, [-6 + i * 2, 7.2, -3.7]);
  plane(1.8, 2.6, basic(0x8aa4e0), r, [-3.2, 3.2, -3.82]); box(.06, 2.6, .06, 0x14102a, r, [-3.2, 3.2, -3.78]);
  point(r, 0xff4fa8, 16, 12, [3.5, 6, -1.5]); point(r, 0x6a6cff, 18, 12, [-3.4, 5, 1]); keyLight(r, 0xffd8e0, 52, -2, 7, 7);
  r.add(new THREE.HemisphereLight(0x8878c0, 0x18121f, .7));
  return { seat: 1.38 };
}
function cubicle(r) {
  walls(r, 0x20282e, 0x171a1e);
  for (const x of [-2.7, 2.7]) box(.14, 4, 5, mat(0x56606a), r, [x, 2, -1.4]); box(5.4, 4, .14, mat(0x56606a), r, [0, 2, -3.8]);
  for (let i = 0; i < 4; i++) box(.7, .7, .03, [0xf0d858, 0x8ad0e8, 0xf0a0b0, 0xf0d858][i], r, [-1.8 + i * 1.2, 3 - (i % 2) * .5, -3.71], [0, 0, (i - 1.5) * .08]);
  box(5.2, .12, 1.4, mat(0x9a7a58), r, [0, 2.1, -3]); const scr = new THREE.MeshStandardMaterial({ color: 0, emissive: 0x58d0a0, emissiveIntensity: 1.4 });
  box(1.6, 1, .06, 0x15161c, r, [.9, 3.1, -3.2]); box(1.46, .86, .02, scr, r, [.9, 3.1, -3.15]);
  box(1.4, .24, 1.3, 0x2c303a, r, [0, 1.15, -.1]); cyl(.09, .09, 1.1, 7, mat(0x3c3e48), r, [0, .55, -.1]); box(1.3, 1.9, .2, 0x2c303a, r, [0, 2.2, -.8]);
  for (let i = -2; i <= 2; i++) box(1.8, .06, .4, glow(0xe8fff0, 1.6), r, [i * 2.4, 7.4, 0]);
  point(r, 0x58d0a0, 13, 8, [.9, 3.2, -2.2]); point(r, 0xe8f0e8, 13, 13, [0, 7, 1]); keyLight(r, 0xf0f4e8, 54, 2.4, 7, 7);
  r.add(new THREE.HemisphereLight(0xa0b4a8, 0x1a1c1e, .8));
  return { seat: 1.27 };
}
function garage(r) {
  walls(r, 0x2c2a2a, 0x24211f);
  const peg = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#6a5038'; c.fillRect(0, 0, w, h); c.fillStyle = '#3a2a1c'; for (let y = 0; y < 13; y++) for (let x = 0; x < 13; x++) c.fillRect(x * 20 + 8, y * 20 + 8, 4, 4); });
  plane(7, 4, new THREE.MeshStandardMaterial({ map: peg }), r, [0, 4.4, -3.8]);
  for (let i = 0; i < 6; i++) box(.12, .9 + hash(i) * .6, .08, [0xc8553a, 0x90949c, 0xe8b04a][i % 3], r, [-2.6 + i, 4.6, -3.7], [0, 0, (i % 3 - 1) * .3]);
  box(7, .14, 1.2, mat(0x7a5a3a), r, [0, 1.9, -3.3]); for (let i = 0; i < 4; i++) box(1, .8, .8, mat([0xa87a4a, 0x5a7aa0, 0xb04a3a, 0x7a9a5a][i]), r, [-2.6 + i * 1.8, 2.4, -3.3]);
  cyl(.5, .5, .16, 10, mat(0x4a3a2c), r, [0, 1.25, -.1]); cyl(.09, .09, 1.2, 7, mat(0x2c2c30), r, [0, .6, -.1]); cyl(.5, .5, .06, 10, mat(0x2c2c30), r, [0, .04, -.1]);
  box(.02, 2, .02, 0x111111, r, [0, 7.4, 1]); mesh(new THREE.SphereGeometry(.16, 8, 6), glow(0xffd28a, 8), r, [0, 6.4, 1]);
  point(r, 0xffc880, 42, 14, [0, 6.2, 1]); keyLight(r, 0xffe4c0, 42, -2.5, 7, 7); point(r, 0x5a7ad0, 12, 12, [3.5, 3, 3]);
  r.add(new THREE.HemisphereLight(0xa89880, 0x24211f, .6));
  return { seat: 1.33 };
}
function stage(s, panelTex) {
  const r = group(s);
  box(40, 14, .3, mat(0x101420), r, [0, 12, -6]);
  const fl = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#0b0d14'; c.fillRect(0, 0, w, h); for (let y = 0; y < 5; y++) for (let x = 0; x < 6; x++) { c.fillStyle = '#171a24'; c.fillRect(x * 85 + (y % 2) * 40 + 6, y * 102 + 8, 74, 88); } });
  fl.wrapS = fl.wrapT = THREE.RepeatWrapping; fl.repeat.set(3, 3);
  plane(40, 40, new THREE.MeshStandardMaterial({ map: fl, roughness: .55 }), r, [0, 0, 6], [-Math.PI / 2, 0, 0]);
  for (let i = -5; i <= 5; i++) box(.05, .03, 8, 0xb89468, r, [i * 1.1, .02, 3.6], [0, -i * .05, 0]);
  box(8.2, 11.3, .3, mat(0x1b1f2a), r, [0, 6, -3.2]);
  plane(7.8, 10.92, new THREE.MeshBasicMaterial({ map: panelTex, color: new THREE.Color(1.5, 1.5, 1.5) }), r, [0, 6, -3.0]);
  const idle = plane(7.8, 10.92, new THREE.MeshBasicMaterial({ color: 0x141824 }), r, [0, 6, -2.99]);
  for (let i = 0; i < 9; i++) { const b = box(4.5 - hash(i) * 2.5, .1, .02, basic(0x222836), idle, [-1 + hash(i + 3), 3.4 - i * .85, .02]); b.castShadow = false; }
  const glowL = point(r, 0x9fb4e8, 22, 13, [0, 5.4, -.6]);
  r.add(new THREE.HemisphereLight(0x8090b0, 0x241c1c, 1.1));
  const k = new THREE.SpotLight(0xffd8b8, 80, 20, .6, .7, 1.3); k.position.set(3.5, 8, 8); k.target.position.set(0, 1.6, 0); k.castShadow = true; k.shadow.mapSize.set(2048, 2048); r.add(k, k.target);
  return { r, idle, glowL };
}
const LOOKS = {
  moody: {},
  warm: { color: 0xff9a50, mix: .3, k: 1.1, tint: [1.05, .98, .92] },
  cold: { color: 0x7a9cff, mix: .16, k: 1.1, tint: [.98, .99, 1.05] },
  neon: { color: 0xff4fb0, mix: .24, k: 1.1, tint: [1.03, .95, 1.07] },
};
export default ({ episode }) => {
  const setName = { room: 'study', stage: 'study' }[episode.set] || episode.set || 'study', LOOK = LOOKS[episode.light] || LOOKS.moody;
  const human = makeHuman({ hoodie: 0x2f4464, hairStyle: 'mop', hair: 0x0f0b0c, eyes: 'anime', skin: 0xd0a288, headScale: 1.3, strings: 0xd08a4a, seed: 9, shoe: 0x241c20, ...(episode.human || {}) });
  const bot = makeBlock({ color: 0xc4532c, ...(episode.bot || {}) }), rival = makeCloudBot(episode.rival || {});
  let R, St, shots;
  const stagePlace = { bot: [0, 0, .4, -.05, 1.0] }, withRival = { bot: [1.15, 0, .4, -.5, .72], rival: [-1.15, 0, .3, .5, .72] };
  return {
    exposure: 1.1, bloom: { strength: .5, radius: .7, threshold: 1 }, hero: { k: 4.2, fill: 1.5 }, vignette: .5, grain: .03, tint: LOOK.tint || [1, .98, .97],
    theme: THEME, panelShot: 'panel', twoFor: { human: 'wide_human' }, cast: { human, bot, rival },
    captionAt: (shot, panel) => panel ? 1560 : null,
    caption: { font: 'Rubik', weight: 600, size: 46, maxWords: 7, y: 1420, blur: 10, stroke: 5, color: { human: '#ffffff', bot: '#f09a58', rival: '#a8bcff' } },
    panel: { mode: 'world', w: 1000, h: 1400, ui: .8 },
    end: { bg: '#0c0a0c', font: 'Rubik', weight: 800, accent: '#f0a860', onAccent: '#1a1208' },
    build(scene, panelTex) {
      R = group(scene); const { seat } = { study, bedroom, cubicle, garage }[setName](R);
      St = stage(scene, panelTex); scene.background = new THREE.Color(0x07070b); scene.add(human.root, bot.root, rival.root); relight(scene, LOOK);
      const HOME = { human: [0, seat - 1.42 + .05, 0, .08, 1, 'sit', [0, 0]] }, hy = seat + 1.9;
      shots = {
        close_human: { set: 'room', pos: [0, hy + .7, 8.6], look: [.1, hy, 0], fov: 34, place: HOME, push: .08 },
        wide_human: { set: 'room', pos: [0, hy + .8, 11.5], look: [.1, hy - .4, 0], fov: 34, place: HOME },
        close_bot: { set: 'stage', pos: [.1, 2.3, 11], look: [0, 1.75, 0], fov: 26, place: stagePlace, push: .08 },
        close_rival: { set: 'stage', pos: [-.6, 2.6, 10], look: [-.8, 2.3, 0], fov: 30, place: { rival: [-.8, 0, .4, .12, 1.05] }, push: .06 },
        two: { set: 'stage', pos: [0, 3.4, 15], look: [0, 3, -1], fov: 34, place: stagePlace },
        panel: { set: 'stage', pos: [0, 4.7, 15.9], look: [0, 4.7, -3], fov: 40, place: { bot: [0, 0, 1.4, 0, .72] }, push: .03 },
        panel_close: { set: 'stage', pos: [0, 6, 15.6], look: [0, 6, -3], fov: 40, place: {}, push: .03 },
      };
    },
    shot(name) {
      const d = shots[name] || shots.two;
      return episode.cast?.includes('rival') && name === 'two' ? { ...d, place: withRival } : d;
    },
    apply(d) { R.visible = d.set === 'room'; St.r.visible = d.set === 'stage'; },
    panelVisible(on) { St.idle.visible = !on; St.glowL.intensity = on ? 30 : 16; },
  };
};
