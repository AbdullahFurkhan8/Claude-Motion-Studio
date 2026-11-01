// Character rigs. makeHuman is one rig with style options; the bots are makeBlock, makeOrb, makeCloudBot and makeGlowBot.
// Every character exposes root, chestY, headY and update({ t, talk, mood, pose, prevPose, poseBlend, look, id }).
import * as THREE from 'three';
import { mat, glow, basic, mesh, box, cyl, group, facet, taper, hash, clamp, lerp } from './lowpoly.js';
const D = Math.PI / 180;
// Joint angles in degrees: [shoulderX, shoulderZ, elbowX] per arm, thigh, knee and spine lean.
const SIT = { thigh: -86, knee: 84 }, STAND = { thigh: 0, knee: 0 };
export const POSES = {
  stand:    { L: [4, 12, -14], R: [4, 12, -14], ...STAND, lean: 0 },
  sit:      { L: [-22, 12, -66], R: [-22, 12, -66], ...SIT, lean: 3 },
  type:     { L: [-40, 8, -74], R: [-40, 8, -74], ...SIT, lean: 7 },
  point:    { L: [4, 12, -14], R: [-74, 24, -18], ...STAND, lean: 0 },
  sitpoint: { L: [-22, 12, -66], R: [-72, 22, -22], ...SIT, lean: 3 },
  shrug:    { L: [-12, 46, -96], R: [-12, 46, -96], ...STAND, lean: -3 },
  sitshrug: { L: [-14, 44, -94], R: [-14, 44, -94], ...SIT, lean: -2 },
  palm:     { L: [4, 12, -14], R: [-128, -10, -124], ...STAND, lean: 6 },
  sitpalm:  { L: [-22, 12, -66], R: [-128, -10, -124], ...SIT, lean: 8 },
  arms:     { L: [-42, -4, -112], R: [-42, -4, -112], ...STAND, lean: -2 },
};
// brow slope (+ is angry), brow height, eyelid (0 open, 1 shut), mouth width, smile.
export const MOODS = {
  neutral: { brow: 0, by: 0, lid: .12, mw: 1, sm: 0 },
  happy:   { brow: -8, by: .02, lid: .05, mw: 1.3, sm: 1 },
  smug:    { brow: 6, by: -.01, lid: .42, mw: 1.15, sm: .7 },
  angry:   { brow: 22, by: -.03, lid: .2, mw: 1.1, sm: -.5 },
  sad:     { brow: -18, by: .03, lid: .38, mw: .8, sm: -1 },
  shock:   { brow: -10, by: .06, lid: 0, mw: .7, sm: 0 },
  tired:   { brow: -4, by: -.01, lid: .55, mw: .9, sm: -.3 },
};
const mixPose = (a, b, k) => ({ L: a.L.map((v, i) => lerp(v, b.L[i], k)), R: a.R.map((v, i) => lerp(v, b.R[i], k)), thigh: lerp(a.thigh, b.thigh, k), knee: lerp(a.knee, b.knee, k), lean: lerp(a.lean, b.lean, k) });
const blinkAt = (t, id) => { const k = Math.floor(t / 2.9 + id), ph = t - (k - id + hash(k * 3 + id) * .7) * 2.9; return ph > 0 && ph < .13; };
export function makeHuman(o = {}) {
  const s = { skin: 0xa8704a, hoodie: 0x2c5a5c, pants: 0x22222a, shoe: 0xe8e4dc, hair: 0x1a1412, strings: 0xc8843a, eyes: 'cartoon', hairStyle: 'pomp', beard: false, headScale: 1, seed: 3, ...o };
  const skin = mat(s.skin), hood = mat(s.hoodie), hair = mat(s.hair), dark = basic(0x0b0a0c), shade = new THREE.Color(s.skin).multiplyScalar(.8).getHex();
  const root = group(), hips = group(root, [0, 1.42, 0]), torso = group(hips);
  mesh(taper(1.02, .62, .86, .52, 1.12), hood, torso, [0, .56, 0]);
  mesh(taper(.66, .06, .72, .06, .3), mat(new THREE.Color(s.hoodie).multiplyScalar(.74).getHex()), torso, [0, .26, .31]);
  mesh(facet(.5, 0, .05, 5, [1, .42, .86]), hood, torso, [0, 1.14, -.02]);
  for (const x of [-.11, .11]) box(.038, .42, .03, mat(s.strings), torso, [x, .74, .3]);
  const neck = group(torso, [0, 1.2, .02]), head = group(neck, [0, .52 * s.headScale, 0]);
  head.scale.setScalar(s.headScale);
  mesh(facet(1, 1, .09, s.seed, [.62, .68, .6]), skin, head);
  const eyes = [], lids = [], brows = [];
  for (const x of [-.25, .25]) {
    const e = group(head, [x, .06, .55]);
    if (s.eyes === 'anime') {
      mesh(new THREE.SphereGeometry(.14, 12, 10), basic(0x120d0e), e, [0, 0, -.03]).scale.z = .45;
      mesh(new THREE.SphereGeometry(.045, 8, 6), basic(0xc8c8c8), e, [.045, .05, .04]);
      mesh(new THREE.SphereGeometry(.02, 6, 5), basic(0xb0b0b0), e, [-.05, -.05, .04]);
    } else if (s.eyes === 'cartoon') {
      mesh(new THREE.SphereGeometry(.1, 10, 8), basic(0xf4efe6), e, [0, 0, -.02]).scale.z = .45;
      mesh(new THREE.SphereGeometry(.062, 10, 8), basic(0x120d0e), e, [.012, 0, .025]);
      mesh(new THREE.SphereGeometry(.02, 6, 5), basic(0xffffff), e, [.035, .03, .07]);
    } else mesh(new THREE.SphereGeometry(.07, 10, 8), basic(0x120d0e), e).scale.z = .4;
    if (s.eyes !== 'dot') {
      lids.push(box(s.eyes === 'anime' ? .3 : .25, .26, .03, mat(new THREE.Color(s.skin).multiplyScalar(.55).getHex()), e, [0, .13, .07]));
      brows.push(box(.3, s.eyes === 'anime' ? .036 : .075, .06, mat(s.eyes === 'anime' ? 0x241a18 : s.hair), head, [x, .28, .6], [0, x > 0 ? .28 : -.28, 0]));
    }
    eyes.push(e);
  }
  mesh(new THREE.ConeGeometry(.08, .19, s.noseSides || 4), mat(s.noseColor || shade), head, [0, -.08, .6], [1.25, .78, 0]);
  const mouth = group(head, [0, -.28, .55]);
  const mo = box(.2, .1, .03, dark, mouth), teeth = box(.15, .03, .035, basic(0xf1ece2), mouth, [0, .025, .002]);
  const lip = box(.17, .022, .03, mat(new THREE.Color(s.skin).multiplyScalar(.5).getHex()), mouth);
  if (s.beard) {
    const b = mat(s.hair);
    mesh(facet(.66, 1, .05, 8, [1.0, .55, .95]), b, head, [0, -.4, -.02]);
    for (const x of [-.56, .56]) box(.1, .34, .32, b, head, [x, -.13, .02]);
    mouth.position.set(0, -.31, .68);
  }
  for (const x of [-.63, .63]) mesh(facet(.12, 0, .06, 11, [.55, 1, .8]), skin, head, [x, 0, 0]);
  if (s.hairStyle === 'pomp') {
    mesh(facet(.66, 1, .12, 21, [1, .62, 1]), hair, head, [0, .42, -.08]);
    mesh(facet(.5, 1, .14, 22, [1.14, .46, 1.1]), hair, head, [.04, .68, .14], [-.2, 0, .06]);
    mesh(facet(.34, 0, .1, 23, [1.5, .6, .9]), hair, head, [.08, .76, .44], [-.1, .1, .08]);
    for (const x of [-.6, .6]) box(.09, .3, .5, hair, head, [x, .22, -.06]);
  } else if (s.hairStyle === 'mop') {
    mesh(facet(.74, 2, .2, 31, [1.04, .66, 1.04]), hair, head, [0, .5, -.1]);
    for (let i = 0; i < 26; i++) {
      const a = i / 26 * Math.PI * 2 + 1.2, u = hash(i + 4), r = .62 + .1 * u, y = .34 + .22 * hash(i + 9);
      if (Math.cos(a) > .55) continue;   // keep the face clear; the fringe below covers the forehead
      mesh(new THREE.ConeGeometry(.15 + .1 * u, .6 + .34 * u, 4), hair, head, [Math.sin(a) * r, y, Math.cos(a) * r - .06], [Math.PI + Math.cos(a) * .42 + (u - .5) * .4, 0, -Math.sin(a) * .42 + (u - .5) * .4]);
    }
    for (let i = 0; i < 7; i++) mesh(new THREE.ConeGeometry(.15, .46, 4), hair, head, [-.46 + i * .155, .6 - .08 * hash(i + 2), .46], [Math.PI - .5, 0, (i - 3) * .05]);
  } else {
    mesh(facet(.68, 1, .08, 41, [1, .6, 1]), hair, head, [0, .4, -.06]);
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, r = .42; mesh(new THREE.ConeGeometry(.15, .58, 4), mat(i % 3 === 2 ? 0x8a5a2e : s.hair), head, [Math.sin(a) * r, .76, Math.cos(a) * r - .05], [Math.cos(a) * .42, 0, -Math.sin(a) * .42]); }
    mesh(new THREE.ConeGeometry(.17, .66, 4), hair, head, [0, .94, 0]);
  }
  const arm = side => {
    const sh = group(torso, [side * .55, 1.04, 0]);
    mesh(taper(.26, .26, .36, .36, .6), hood, sh, [0, -.27, 0]);
    const el = group(sh, [0, -.54, 0]);
    mesh(taper(.22, .22, .27, .27, .52), hood, el, [0, -.24, 0]);
    mesh(facet(.15, 0, .08, 14, [1, 1.05, .9]), skin, el, [0, -.56, 0]);
    return { sh, el };
  };
  const armL = arm(-1), armR = arm(1);
  const leg = side => {
    const th = group(hips, [side * .26, 0, 0]);
    box(.36, .74, .4, mat(s.pants), th, [0, -.34, 0]);
    const kn = group(th, [0, -.68, 0]);
    box(.32, .66, .35, mat(s.pants), kn, [0, -.3, 0]);
    box(.36, .22, .62, mat(s.shoe), kn, [0, -.64, .12]);
    return { th, kn };
  };
  const legL = leg(-1), legR = leg(1);
  return {
    kind: 'human', root, chestY: 2.3, headY: 3.2,
    update({ t, talk, mood, pose, prevPose, poseBlend, look = [0, 0], id = 0 }) {
      const P = mixPose(POSES[prevPose] || POSES[pose] || POSES.stand, POSES[pose] || POSES.stand, poseBlend), M = MOODS[mood] || MOODS.neutral;
      const br = Math.sin(t * 1.5 + id) * .012;
      torso.rotation.x = P.lean * D + br + talk * .012; torso.scale.y = 1 + br * .6;
      for (const [a, j, side] of [[armL, P.L, -1], [armR, P.R, 1]]) {
        const w = Math.sin(t * 1.1 + side + id) * 1.6 + talk * Math.sin(t * 7 + side) * 2.5;
        a.sh.rotation.x = (j[0] + w) * D; a.sh.rotation.z = side * j[1] * D; a.el.rotation.x = j[2] * D;
      }
      for (const l of [legL, legR]) { l.th.rotation.x = P.thigh * D; l.kn.rotation.x = P.knee * D; }
      neck.rotation.y = look[0] + Math.sin(t * .63 + id) * .03 + talk * Math.sin(t * 2.3) * .05;
      neck.rotation.x = look[1] + talk * Math.sin(t * 6.1 + id) * .022 + Math.sin(t * .9) * .012;
      neck.rotation.z = Math.sin(t * .47 + id) * .02;
      const b = blinkAt(t, id), lid = M.lid;
      lids.forEach(l => { l.visible = lid > .2; l.scale.y = clamp(lid); l.position.y = .13 - .13 * lid; });
      eyes.forEach(e => e.scale.y = b ? .12 : 1);
      brows.forEach((r, i) => { r.rotation.z = (i ? 1 : -1) * M.brow * -D; r.position.y = .28 + M.by; });
      const open = clamp(talk);
      mouth.scale.x = M.mw * (1 + open * .1);
      mo.visible = open > .06; teeth.visible = open > .25 && s.eyes !== 'dot'; lip.visible = !mo.visible;
      mo.scale.y = .15 + open * 1.5; mo.position.y = -open * .04; lip.position.y = M.sm * .012;
    },
  };
}
// Rectangles, happy arcs and shut lines; setEyes() toggles which one shows.
function eyeSet(root, [ex, ey, ez], w, h, col) {
  const m = col ? glow(col, 3.2) : basic(0x120b0c), out = { rect: [], arc: [], line: [] };
  for (const x of [-ex, ex]) {
    out.rect.push(box(w, h, .02, m, root, [x, ey, ez]));
    const a = mesh(new THREE.TorusGeometry(w * .92, w * .2, 6, 10, Math.PI), m, root, [x, ey - .02, ez]); a.visible = false; out.arc.push(a);
    const l = box(w * 1.7, w * .32, .02, m, root, [x, ey, ez]); l.visible = false; out.line.push(l);
  }
  return out;
}
function setEyes(E, mood, blink, sx = 1) {
  const happy = mood === 'happy' || mood === 'smug', shut = blink || mood === 'tired';
  E.rect.forEach((r, i) => { r.visible = !happy && !shut; r.scale.set(sx, mood === 'shock' ? 1.3 : mood === 'angry' ? .75 : 1, 1); r.rotation.z = mood === 'angry' ? (i ? .3 : -.3) : mood === 'sad' ? (i ? -.26 : .26) : 0; });
  E.arc.forEach(a => a.visible = happy && !blink); E.line.forEach(l => l.visible = shut);
}
// The little block creature: a chunky box on four peg legs with side nubs.
export function makeBlock(o = {}) {
  const s = { color: 0xc95a33, eye: null, w: 2.1, h: 1.5, d: 1.5, eyeH: .46, ...o };
  const root = group(), body = group(root, [0, 1.42, 0]), M = mat(s.color);
  box(s.w, s.h, s.d, M, body);
  box(.34, .3, .46, M, body, [s.w / 2 + .16, -.04, 0]); box(.34, .3, .46, M, body, [-s.w / 2 - .16, -.04, 0]);
  const legs = [-.72, -.25, .25, .72].map(x => { const g = group(root, [x * s.w / 2.1, .7, .18]); box(.26, .72, .3, M, g, [0, -.3, 0]); return g; });
  const E = eyeSet(body, [.46, .16, s.d / 2 + .012], .17, s.eyeH, s.eye);
  return { kind: 'block', root, chestY: 1.4, headY: 1.5, update({ t, talk, mood, id = 1 }) {
    const hop = Math.abs(Math.sin(t * 7)) * talk * .1, sq = 1 + Math.sin(t * 14) * talk * .02;
    body.position.y = 1.42 + Math.sin(t * 1.8 + id) * .025 + hop; body.scale.set(1 / sq, sq, 1 / sq);
    body.rotation.z = Math.sin(t * 1.3) * .018 + talk * Math.sin(t * 5) * .03; body.rotation.y = Math.sin(t * .7) * .05;
    body.rotation.x = mood === 'sad' || mood === 'tired' ? .12 : 0;
    legs.forEach((l, i) => l.rotation.x = Math.sin(t * 2 + i * 1.7) * .06 * (1 + talk * 2));
    setEyes(E, mood, blinkAt(t, id));
  } };
}
// The hovering orange orb: faceted ball, black round visor, ear cap, antenna, orbit ring and an equaliser mouth.
export function makeOrb(o = {}) {
  const s = { color: 0xd8602c, eye: 0xffe6a8, ring: 0xf0dcc0, tip: 0xffd24a, ...o };
  const root = group(), body = group(root, [0, 2.6, 0]), R = .92;
  mesh(facet(R, 2, .025, 2), s.color, body);
  const face = group(body, [0, .02, R * .86]);
  const VA = .9;   // the visor is a black cap on the ball, so it curves with it
  mesh(new THREE.SphereGeometry(R * 1.03, 36, 14, 0, Math.PI * 2, 0, VA), basic(0x07070b), body, [0, 0, 0], [Math.PI / 2, 0, 0]);
  mesh(new THREE.TorusGeometry(R * 1.03 * Math.sin(VA), .055, 8, 36), mat(0x9c2b1e), body, [0, 0, R * 1.03 * Math.cos(VA)]);
  cyl(.28, .3, .16, 10, mat(0xc34e22), body, [R * .96, 0, -.05], [0, 0, Math.PI / 2]);
  box(.06, .34, .06, mat(0xb4321e), body, [0, R + .15, 0]);
  const tip = mesh(new THREE.SphereGeometry(.09, 10, 8), glow(s.tip, 2.4), body, [0, R + .36, 0]);
  const ring = mesh(new THREE.TorusGeometry(1.28, .016, 6, 64), basic(s.ring), body, [0, 0, 0], [1.08, .1, 0]);
  const E = eyeSet(face, [.27, .13, .135], .13, .1, s.eye);
  const bars = [-3, -2, -1, 0, 1, 2, 3].map(i => box(.042, .1, .02, glow(s.eye, 3), face, [i * .065, -.2, .135]));
  return { kind: 'orb', root, chestY: 2.6, headY: 2.6, update({ t, talk, mood, id = 1 }) {
    body.position.y = 2.6 + Math.sin(t * 1.6 + id) * .06; body.rotation.set(Math.sin(t * .9) * .03, Math.sin(t * .6) * .08 + talk * Math.sin(t * 4) * .03, Math.sin(t * .53) * .025);
    ring.rotation.z = t * .55; ring.rotation.y = .1 + Math.sin(t * .6) * .1;
    tip.material.emissiveIntensity = 2 + Math.sin(t * 3) * .7;
    setEyes(E, mood, blinkAt(t, id), 1.6);
    bars.forEach((b, i) => { const v = talk * (.45 + .55 * Math.abs(Math.sin(t * (9 + i) + i * 2))) * (1 - Math.abs(i - 3) * .12); b.scale.y = .12 + v * 2.6; b.visible = talk > .03 || Math.abs(i - 3) < 2; });
  } };
}
function chevron(p, x, y, z, size, m, right = false) {
  const g = group(p, [x, y, z]);
  if (right) { box(size, size * .24, .02, m, g, [0, size * .3, 0], [0, 0, -.75]); box(size, size * .24, .02, m, g, [0, -size * .3, 0], [0, 0, .75]); }
  else { box(size, size * .24, .02, m, g, [-size * .36, 0, 0], [0, 0, .75]); box(size, size * .24, .02, m, g, [size * .36, 0, 0], [0, 0, -.75]); }
  return g;
}
// A rival bot: blue lumpy cloud head with a monitor face and a little prompt on its belly.
export function makeCloudBot(o = {}) {
  const s = { color: 0x4a5ab8, face: 0x0b0d18, eye: 0xdfe8ff, ...o };
  const root = group(), M = s.color, head = group(root, [0, 2.55, 0]), body = group(root, [0, 1.15, 0]);
  [[0, 0, 0, 1.06], [-.7, .3, 0, .62], [.72, .32, .05, .62], [-.62, -.42, .05, .55], [.64, -.42, 0, .58], [0, .72, -.05, .62], [0, -.62, .05, .55]].forEach(([x, y, z, r], i) => mesh(facet(r, 1, .08, i + 50), M, head, [x, y, z]));
  box(1.42, 1.02, .1, basic(s.face), head, [0, 0, 1.0]);
  const G = glow(s.eye, 2.6), eyes = [chevron(head, -.33, .12, 1.07, .32, G), chevron(head, .33, .12, 1.07, .32, G)];
  const dots = [-.12, 0, .12].map(x => box(.055, .055, .02, G, head, [x, -.26, 1.07]));
  mesh(facet(.72, 1, .06, 60, [1.1, .86, .9]), M, body);
  for (const x of [-1, 1]) mesh(facet(.32, 1, .08, 61, [1.2, .85, 1]), M, body, [x * .9, .12, .1]);
  box(.3, .06, .02, G, body, [.16, -.15, .62]); chevron(body, -.22, 0, .62, .2, G, true);
  for (const x of [-.34, .34]) mesh(facet(.28, 1, .06, 62, [1, .7, 1.2]), M, root, [x, .22, .1]);
  return { kind: 'cloud', root, chestY: 2.4, headY: 2.5, update({ t, talk, id = 2 }) {
    head.position.y = 2.55 + Math.sin(t * 1.7 + id) * .03; head.rotation.z = talk * Math.sin(t * 6) * .03; head.rotation.y = Math.sin(t * .6) * .07;
    dots.forEach((d, i) => d.scale.y = talk > .1 ? 1 + 1.6 * Math.abs(Math.sin(t * 13 + i)) : 1);
    const b = blinkAt(t, id); eyes.forEach(e => e.scale.y = b ? .15 : 1);
  } };
}
// A rival bot: pale glowing robot with a black visor, a starburst chest and an antenna.
export function makeGlowBot(o = {}) {
  const s = { color: 0xb9b0ee, emissive: 0x4a3cdf, ...o };
  const root = group(), M = mat(s.color, { emissive: s.emissive, emissiveIntensity: .12 });
  const body = group(root, [0, 1.3, 0]), head = group(body, [0, 1.42, 0]);
  mesh(taper(1.04, .66, 1.3, .8, 1.5), M, body, [0, .3, 0]);
  const star = group(body, [0, .34, .42]), G = glow(0xffffff, 4.2);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r = i % 2 ? .3 : .24; box(.05, r, .02, G, star, [Math.sin(a) * r * .75, Math.cos(a) * r * .75, 0], [0, 0, -a]); }
  box(1.5, .84, .96, M, head); box(1.38, .66, .04, basic(0x07060e), head, [0, 0, .5]);
  const E = eyeSet(head, [.34, .06, .53], .2, .24, 0xffffff);
  const mo = box(.2, .05, .02, glow(0xffffff, 3), head, [0, -.2, .53]);
  mesh(facet(.32, 0, .05, 70, [.5, 1, 1]), M, head, [.84, 0, 0]); mesh(facet(.32, 0, .05, 71, [.5, 1, 1]), M, head, [-.84, 0, 0]);
  box(.05, .72, .05, M, head, [0, .76, 0]); const tip = mesh(new THREE.SphereGeometry(.1, 10, 8), glow(0xffffff, 4), head, [0, 1.14, 0]);
  const limb = (x, y, h, p) => { const g = group(p, [x, y, 0]); box(.28, h, .3, M, g, [0, -h / 2, 0]); return g; };
  const aL = limb(-.78, .98, 1.15, body), aR = limb(.78, .98, 1.15, body); limb(-.32, -.42, .9, body); limb(.32, -.42, .9, body);
  return { kind: 'glow', root, chestY: 1.6, headY: 2.7, update({ t, talk, mood, id = 3 }) {
    body.position.y = 1.3 + Math.sin(t * 1.4 + id) * .02; head.rotation.y = Math.sin(t * .55) * .1 + talk * Math.sin(t * 5) * .05; head.rotation.z = Math.sin(t * .8) * .02;
    star.rotation.z = t * .35; G.emissiveIntensity = 3.8 + Math.sin(t * 2.2) * .7 + talk * 1.5; tip.scale.setScalar(1 + Math.sin(t * 3) * .1);
    aL.rotation.z = -.14; aR.rotation.z = .14 + talk * .08 * Math.sin(t * 5); setEyes(E, mood, blinkAt(t, id)); mo.scale.y = 1 + talk * 3;
  } };
}
