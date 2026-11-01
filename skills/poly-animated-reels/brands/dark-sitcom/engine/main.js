// Frame renderer. window.renderFrame(t) draws one deterministic frame, window.grab() returns a JPEG.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import brandFactory from '/brand/brand.js';
import { direct } from './director.js';
import { drawPanel, rr, wrap } from './ui.js';
import { clamp, eo, eback, eio, hash, lerp, bokeh } from './lowpoly.js';
const q = new URLSearchParams(location.search), W = 1080, H = 1920, scale = +(q.get('scale') || 1), lang = q.get('lang') || 'en';
const [episode, timing] = await Promise.all([fetch('/ep/episode.json').then(r => r.json()), fetch(`/ep/timing_${lang}.json`).then(r => r.json())]);
await Promise.all(['600 40px Lora', '700 40px Lora', '600 40px Rubik', '800 40px Rubik'].map(f => document.fonts.load(f)));
const out = document.createElement('canvas'); out.width = W * scale; out.height = H * scale; document.body.append(out);
const octx = out.getContext('2d');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W * scale, H * scale, false); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const brand = brandFactory({ episode, lang });
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = brand.exposure ?? 1;
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, W / H, .05, 300);
const panelCanvas = document.createElement('canvas'); panelCanvas.width = brand.panel?.w || 1000; panelCanvas.height = brand.panel?.h || 760;
const pctx = panelCanvas.getContext('2d'), panelTex = new THREE.CanvasTexture(panelCanvas); panelTex.colorSpace = THREE.SRGBColorSpace; panelTex.anisotropy = 8;
brand.build(scene, panelTex);
// The signature light for every brand: a hard warm side light that burns the edges into a glow, plus a bright front fill.
const HL = { k: 4, fill: 1.2, color: 0xffc678, ...(brand.hero || {}) };
const hero = new THREE.DirectionalLight(HL.color, HL.k); hero.position.set(7, 2.6, 1.4);
const fill = new THREE.DirectionalLight(0xfff0e6, HL.fill); fill.position.set(-1, 3, 10); scene.add(hero, fill);
// Floating dots rise through the frame and big string lights hang above. They follow the camera, so every set and shot has them.
const motes = Array.from({ length: 18 }, (_, i) => ({ s: bokeh(1, i % 9 === 4 ? 0xff4a58 : i % 3 ? 0xdfe4ff : 0xffe2b0, scene, [0, 0, 0], .6), x: hash(i + 1) - .5, y: hash(i + 2), d: 5 + hash(i + 3) * 13, v: .035 + hash(i + 4) * .05, r: .006 + hash(i + 5) * hash(i + 5) * .018 }));
const bulbs = Array.from({ length: 5 }, (_, i) => ({ a: bokeh(1, 0xfff4dc, scene, [0, 0, 0], .95), h: bokeh(1, 0xffb868, scene, [0, 0, 0], .14), x: (i - 2) * .24 + (hash(i) - .5) * .04, y: .39 - (i % 2) * .025 - hash(i + 8) * .02 }));
const _r = new THREE.Vector3(), _u = new THREE.Vector3(), _f = new THREE.Vector3();
function placeOnCamera(o, x, y, d) { const h = 2 * d * Math.tan(camera.fov * Math.PI / 360); o.position.copy(camera.position).addScaledVector(_f, d).addScaledVector(_r, x * h * camera.aspect).addScaledVector(_u, y * h); return h; }
function updateAir(t, world) {
  camera.updateMatrixWorld(); camera.matrixWorld.extractBasis(_r, _u, _f); _f.negate();
  for (const m of motes) { const h = placeOnCamera(m.s, m.x + Math.sin(t * .4 + m.d) * .015, ((m.y + t * m.v) % 1.1) - .55, m.d); m.s.scale.setScalar(m.r * h * (1 + (m.d - 5) * .04)); m.s.material.opacity = .28 + .34 * Math.abs(Math.sin(t * .7 + m.d)); m.s.visible = !world; }
  for (const [i, b] of bulbs.entries()) { const sway = Math.sin(t * .5) * .012, hh = placeOnCamera(b.a, b.x + sway, b.y, 20); placeOnCamera(b.h, b.x + sway, b.y, 20.1); b.a.scale.setScalar(hh * .05 * (1 + .05 * Math.sin(t * 2 + i))); b.h.scale.setScalar(hh * .085); b.a.visible = b.h.visible = !world && brand.bulbs !== false; }
}
const G = direct(episode, timing, brand, lang);
const target = new THREE.WebGLRenderTarget(W * scale, H * scale, { samples: 4, type: THREE.HalfFloatType });
const composer = new EffectComposer(renderer, target);
composer.addPass(new RenderPass(scene, camera));
const B = brand.bloom || { strength: .35, radius: .6, threshold: .85 };
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W * scale / 2, H * scale / 2), B.strength, B.radius, B.threshold));
composer.addPass(new OutputPass());
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, vig: { value: brand.vignette ?? .35 }, grain: { value: brand.grain ?? .02 }, tint: { value: new THREE.Vector3(...(brand.tint || [1, 1, 1])) }, seed: { value: 0 } },
  vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.);}',
  fragmentShader: `varying vec2 vUv;uniform sampler2D tDiffuse;uniform float vig,grain,seed;uniform vec3 tint;
    float r(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+seed)*43758.5453);}
    void main(){vec4 c=texture2D(tDiffuse,vUv);vec2 u=vUv-.5;u.y*=1.25;float v=1.-vig*smoothstep(.25,.85,length(u)*1.3);
    c.rgb=c.rgb*v*tint+(r(vUv)-.5)*grain;gl_FragColor=vec4(c.rgb,1.);}` });
composer.addPass(grade);
const overlay = document.createElement('canvas'); overlay.width = W; overlay.height = H; const O = overlay.getContext('2d');
const shotAt = t => G.shots.find(s => t >= s.start && t < s.end) || G.shots[G.shots.length - 1];
// Mouth openness for one character at time t.
function talkOf(who, t) {
  let v = 0;
  for (const l of G.lines) {
    if (l.who !== who || t < l.start - .1 || t > l.end + .1) continue;
    for (const w of l.words) if (t >= w.s - .03 && t <= w.e + .03) {
      const syl = Math.max(1, Math.round((w.w.replace(/[^a-z]/gi, '').length || 3) / 3)), k = clamp((t - w.s) / Math.max(.08, w.e - w.s));
      v = Math.max(v, .3 + .7 * Math.abs(Math.sin(k * syl * Math.PI)));
    }
  }
  return v;
}
const lineAt = t => { let r = G.lines[0]; for (const l of G.lines) if (t >= l.start - .05) r = l; return r; };
const moodOf = (who, t) => { let m = null; for (const l of G.lines) { if (t < l.start - .05) break; if (l.who === who && l.mood) m = l.mood; else if (l.who === who) m = null; } return m || 'neutral'; };
const poseAt = (who, i) => { for (let j = i; j >= 0; j--) if (G.lines[j].who === who && G.lines[j].pose) return G.lines[j].pose; return null; };
function drawCaption(t) {
  if (t >= G.endStart) return;
  const c = G.chunks.find(k => t >= k.start - .03 && t < k.until); if (!c) return;
  const S = brand.caption, a = Math.min(clamp((t - c.start + .03) / .08), clamp((c.until - t) / .1)), shot = shotAt(t), P_ = G.panelAt(t), pos = (brand.captionAt?.(shot, P_, panelHeight(P_))) ?? S.y;
  O.save(); O.globalAlpha = a; O.font = `${S.weight} ${S.size}px ${S.font}`; O.textAlign = 'center'; O.textBaseline = 'middle'; O.lineJoin = 'round';
  const lines = wrap(O, c.text, W - 170); lines.forEach((l, i) => {
    const y = pos + (i - (lines.length - 1) / 2) * S.size * 1.18;
    O.shadowColor = 'rgba(0,0,0,.75)'; O.shadowBlur = S.blur ?? 14; O.shadowOffsetY = 3; O.lineWidth = S.stroke ?? 6; O.strokeStyle = 'rgba(0,0,0,.38)'; O.strokeText(l, W / 2, y); O.fillStyle = S.color[c.who] || '#fff'; O.fillText(l, W / 2, y);
    O.shadowBlur = 0; O.shadowOffsetY = 0;
  }); O.restore();
}
// Overlay panels shrink to their content, measured once at full reveal.
function panelHeight(p) {
  if (!p) return 0; if (p._h) return p._h;
  const b = brand.panel, ui = b.ui || 1; drawPanel(pctx, p, 1, brand.theme, panelCanvas.width, panelCanvas.height, 0, ui);
  return p._h = p._used ? Math.min(b.h, p._used / ui) : b.h;
}
function drawOverlayPanel(p, t) {
  const b = { ...brand.panel, h: panelHeight(p) }, k = (t - p.start) / .32, out_ = (p.end - t) / .22, a = eback(k), x = b.x, y = b.y + (1 - a) * 90;
  O.save(); O.globalAlpha = clamp(Math.min(k * 2, out_ * 2)); O.shadowColor = 'rgba(0,0,0,.55)'; O.shadowBlur = 40; O.shadowOffsetY = 14;
  O.translate(x + b.w / 2, y + b.h / 2); O.scale(.96 + .04 * clamp(a), .96 + .04 * clamp(a)); O.translate(-b.w / 2, -b.h / 2);
  rr(O, 0, 0, b.w, b.h, 26); O.fillStyle = '#000'; O.fill(); O.shadowColor = 'transparent'; O.clip(); O.drawImage(panelCanvas, 0, 0); O.restore();
}
function drawEnd(t) {
  const k = clamp((t - G.endStart) / .3), e = episode.end, E = brand.end; O.save(); O.globalAlpha = k; O.fillStyle = E.bg; O.fillRect(0, 0, W, H);
  const d = t - G.endStart, s = 1 + d * .012; O.translate(W / 2, H / 2); O.scale(s, s); O.translate(-W / 2, -H / 2);
  O.textAlign = 'center'; O.textBaseline = 'alphabetic'; brand.endMark?.(O, t);
  O.font = `${E.weight} 76px ${E.font}`; const T = wrap(O, e.title, W - 200); T.forEach((l, i) => { O.font = `${E.weight} 76px ${E.font}`; O.fillStyle = '#fff'; O.fillText(l, W / 2, 900 + i * 92); });
  let y = 900 + T.length * 92 + 22; O.font = `${E.bodyWeight || 600} 44px ${E.font}`;
  const a = e.before || 'Comment', b = e.keyword || 'GUIDE', c2 = e.after || '', w1 = O.measureText(a + ' ').width, w2 = O.measureText(b).width + 34; const tot = w1 + w2; let x = W / 2 - tot / 2;
  O.textAlign = 'left'; O.fillStyle = '#fff'; O.fillText(a + ' ', x, y); x += w1; rr(O, x, y - 42, w2, 56, 10); O.fillStyle = E.accent; O.fill(); O.fillStyle = E.onAccent; O.font = `700 40px ${E.font}`; O.fillText(b, x + 17, y); O.textAlign = 'center';
  y += 66; O.font = `${E.bodyWeight || 600} 40px ${E.font}`; O.fillStyle = '#fff'; if (c2) { wrap(O, c2, W - 220).forEach(l => { O.fillText(l, W / 2, y); y += 52; }); }
  y += 50; O.fillStyle = E.accent; O.font = `600 36px ${E.font}`; O.fillText(e.follow || 'Follow for the next one', W / 2, y); O.restore();
}
window.renderFrame = t => {
  const S = shotAt(t), idx = G.shots.indexOf(S), prev = G.shots[idx - 1], li = lineAt(t), panel = G.panelAt(t), def = brand.shot(S.name, S, panel);
  const k = clamp((t - S.start) / Math.max(.4, S.end - S.start)), pb = eio((t - S.start) / .28);
  brand.apply?.(def, S, t);
  for (const [who, ch] of Object.entries(brand.cast)) {
    const place = (def.place || {})[who]; ch.root.visible = !!place;
    if (place) { ch.root.position.set(place[0], place[1], place[2]); ch.root.rotation.y = place[3] || 0; ch.root.scale.setScalar(place[4] || 1); }
    const pose = poseAt(who, li.i) || place?.[5] || 'stand', prevDef = prev ? brand.shot(prev.name, prev, null) : def;
    ch.update({ t, talk: talkOf(who, t), mood: moodOf(who, t), pose, prevPose: prevDef.place?.[who]?.[5] && poseAt(who, Math.max(0, li.i - 1)) || poseAt(who, Math.max(0, li.i - 1)) || place?.[5] || 'stand', poseBlend: pb, look: place?.[6] || [0, 0], id: who.length });
  }
  brand.update?.(t, S, def);
  // Camera: a slow push through the shot plus hand-held drift, with a small punch on the cut.
  const [px, py, pz] = def.pos, [lx, ly, lz] = def.look, push = (def.push ?? .05) * k, punch = (1 - eo((t - S.start) / .3)) * .04;
  const dx = lx - px, dy = ly - py, dz = lz - pz, m = push + punch - .04, seed = S.seed;
  camera.position.set(px + dx * m + Math.sin(t * .7 + seed) * .012, py + dy * m + Math.sin(t * .9 + seed) * .01, pz + dz * m);
  camera.lookAt(lx + Math.sin(t * .5) * .012, ly + Math.cos(t * .6) * .01, lz);
  camera.rotation.z += (def.roll || 0) * Math.PI / 180; camera.fov = def.fov || 30; camera.updateProjectionMatrix();
  updateAir(t, panel && brand.panel?.mode === 'world' && def.set !== 'room' && !def.place?.human);
  if (panel) { const p = clamp((t - panel.start) / Math.max(.6, panel.end - panel.start)); drawPanel(pctx, panel, p, brand.theme, panelCanvas.width, panelCanvas.height, t, brand.panel?.ui || 1); panelTex.needsUpdate = true; }
  brand.panelVisible?.(!!panel, def);
  grade.uniforms.seed.value = (t * 30) % 97;
  composer.render();
  O.clearRect(0, 0, W, H);
  if (panel && brand.panel?.mode === 'overlay') drawOverlayPanel(panel, t);
  brand.overlay?.(O, t, S, panel);
  drawCaption(t);
  if (t >= G.endStart) drawEnd(t);
  octx.drawImage(renderer.domElement, 0, 0, out.width, out.height);
  octx.drawImage(overlay, 0, 0, out.width, out.height);
};
window.grab = () => out.toDataURL('image/jpeg', .95);
window.__meta = { total: G.total, cues: G.cues, shots: G.shots.length, panels: G.panels.length };
renderFrame(0); window.__ready = true;
