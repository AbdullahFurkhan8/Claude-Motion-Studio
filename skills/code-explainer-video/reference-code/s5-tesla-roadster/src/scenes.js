// "How did Tesla's Roadster flip?" - cold-gas thrusters (Newton's third law) + fan downforce. All timing from word cues c('phrase', after).
// Drawn in code (roadster.js + kit.js). User assets: Tesla logo PNG (recoloured) and the Roadster flip clip (30 fps frames in assets/clip).
// No presenter. Clip: first 10 s full-frame in the hook, then a closer "camera 2" reshoot (cropped + tracked push-in), replay of the flip near the end.
import { W, H, clamp, lerp, eo, eo5, eio, eback, p, hash, rr, alive, flipIn } from './lib.js';
import { FONT, MONO, GREEN, RED, txt, tw, bin, pop, card, cursor, clickRing, check, xmark, pill, avatar, glowDot, bar } from './kit.js';
import { RED_RGB, CYAN, CYAN_RGB, ORANGE, ORANGE_RGB, BLUEP_RGB, studio, roadster, reflection, roadsterFront, roadsterTop, wheel, plume, balloon, rampCeiling,
  arrow, curvedArrow, tag, title, dial, stamp, teslaLogo, CLIP_FRAMES, CLIP_W, CLIP_H, clipCard, clipTrack, viewfinder, tc, NOZ, carPt } from './roadster.js';

export const IMAGES = ['tesla.png', ...Array.from({ length: CLIP_FRAMES }, (_, i) => `clip/${String(i + 1).padStart(4, '0')}.jpg`)];
const kf = (T, keys, e = eio) => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (T < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i], u = e((T - t0) / Math.max(1e-3, t1 - t0)); return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u); }
  return keys[keys.length - 1][1];
};
const live = (ctx, T, x, y, o, fn) => { ctx.save(); alive(ctx, T, x, y, o); fn(); ctx.restore(); };
const flip = (ctx, k, x, y, fn) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k * 1.5); flipIn(ctx, x, y, k); fn(); ctx.restore(); };
const typed = (s, T, t0, t1) => s.slice(0, Math.floor(s.length * clamp((T - t0) / Math.max(.05, t1 - t0))));
// scene punch-in: 1.1 -> 1 over the first half second, then a slow push
const shot = (ctx, T, t0, fn, { cx = 540, cy = 1150, push = .05, dur = 6 } = {}) => {
  const z = lerp(1.1, 1, eo(clamp((T - t0) / .55))) * (1 + push * eio(clamp((T - t0) / dur)));
  ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); fn(); ctx.restore();
};
const panel = (ctx, x, y, w, h, r = 30) => { // glossy dark glass card
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24; rr(ctx, x, y, w, h, r);
  const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, 'rgba(34,38,46,.94)'); g.addColorStop(1, 'rgba(14,16,20,.94)'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
  ctx.save(); rr(ctx, x, y, w, h, r); ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 2; ctx.stroke();
  const s = ctx.createLinearGradient(x, y, x, y + h * .4); s.addColorStop(0, 'rgba(255,255,255,.08)'); s.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = s; ctx.fill(); ctx.restore();
};

export const KEYWORDS = "roadster ramp upside launched flipped landed ai live audience balloon air newton's principle tanks compressed nozzles thrusters powerful downward upward sideways rotate stabilize 10 fans sealing lower higher downforce strong attached catch controlled human approved 2028 halo brand attention aerospace extreme control probably remarkable physics crazy code guide bio";
export const EMOJI = { balloon: '🎈', air: '💨', '2028': '📅', code: '💻', guide: '💬', bio: '🔗' };
export const CAPTION_SFX = false;
// Hinglish voice: same scenes, cues mapped to the words it says ('anchor > phrase' = phrase after anchor; 'a|b' = first found).
export const LANG = {
  hi: {
    alias: {
      roadster: 'roadster', 'curved ramp': 'curved', upside: 'ulta', launched: 'uchhla', flipped: 'flip', landed: 'utra',
      'live audience': 'live', october: 'october', 'so how does': 'to ek car', how: 'kaise',
      'the answer': 'jawaab', balloon: 'gubbara', fill: 'bharo', 'without tying': 'bina baandhe', rushes: 'nikalti', flies: 'udta', "newton's": 'newton', principle: 'principle', 'this car': 'is car',
      "let's start": 'pehle udne', inside: 'special', tanks: 'tanks', compressed: 'compressed',
      'the system releases': 'system us gas', nozzles: 'nozzles', cold: 'cold',
      'think of them': 'inhe gubbare', powerful: 'powerful', experiment: 'experiment',
      'push gas downward': 'gas ko neeche', downward: 'neeche', upward: 'upar', force: 'force',
      'push it sideways': 'side mein', sideways: 'side', rotate: 'ghumane', stabilize: 'stable',
      'tesla says': 'tesla kehta', '10': '10', around: 'aaspaas',
      'but how did': 'lekin roadster', 'drive upside': 'ulta kaise', falling: 'gire',
      "that's a completely": 'woh bilkul alag', underneath: 'car ke neeche', fans: 'fans', sealing: 'sealing',
      'the fans pull': 'fans gaadi', 'air out': 'hawa kheench', lower: 'kam pressure',
      'the higher atmospheric': 'bahar ka', pushes: 'dabata', downforce: 'downforce',
      'and if': 'aur agar', strong: 'strong', attached: 'chipki',
      'pretty incredible': 'kaafi kamaal', catch: 'catch', normal: 'normal', buy: 'khareed', traffic: 'traffic',
      'it was a controlled': 'ye bina human', controlled: 'controlled', human: 'human',
      'the flying version': 'udne wala version', approved: 'approve', production: 'production', '2028': '2028',
      "there's another": 'yahan ek aur', halo: 'halo', extraordinary: 'khaas', showcase: 'dikhane', brand: 'brand',
      'even if most': 'zyadatar customers', never: 'na bhi', attention: 'attention', exactly: 'bilkul yahi',
      "tesla wasn't": 'tesla sirf', electric: 'electric', aerospace: 'aerospace', extreme: 'extreme', vehicle: 'vehicle',
      'does that mean': 'to kya iska', 'flying cars': 'udne wali car', five: 'paanch', probably: 'shayad nahi',
      'short bursts': 'thodi der', safe: 'safe', aviation: 'aviation',
      'but a car driving': 'car ka ulta', remarkable: 'shaandaar', engineering: 'engineering',
      'and it all comes': 'aur sab wapas', physics: 'physics', 'balloon flying': 'udte gubbare', room: 'kamre',
      "and here's the crazy": 'aur sabse crazy', crazy: 'crazy', code: 'code', comment: 'comment', guide: 'guide', youtube: 'youtube', link: 'link', bio: 'bio',
    },
    keywords: 'roadster ramp ulta uchhla flip utra ai live audience gubbara hawa newton principle tanks compressed nozzles thrusters powerful neeche upar side ghumane stable 10 fans sealing kam zyada downforce strong chipki catch controlled human approve 2028 halo brand attention aerospace extreme control shayad shaandaar physics crazy code guide bio',
    emoji: { gubbara: '🎈', hawa: '💨', '2028': '📅', code: '💻', guide: '💬', bio: '🔗' },
  },
};

export function makeScenes(c, lang = 'en') {
  const named = lang !== 'hi'; // Hindi version: profile picture only, no channel name or handle
  const list = [], sfx = [];
  const add = (start, draw, light = false) => { list.push({ start, light, draw }); if (start > 0) sfx.push({ t: start - .05, k: 'whoosh', g: -19 }); };
  const s = x => x - .1;
  const A = {
    ai: s(c('AI')), how: s(c('so how does')), answer: s(c('the answer')), start: s(c("let's start")), rel: s(c('the system releases')), think: s(c('think of them')),
    down: s(c('push gas downward')), side: s(c('push it sideways')), says: s(c('tesla says')), but: s(c('but how did')), diff: s(c("that's a completely")),
    pull: s(c('the fans pull')), higher: s(c('the higher atmospheric')), andif: s(c('and if')), pretty: s(c('pretty incredible')), ctrl: s(c('it was a controlled')),
    fver: s(c('the flying version')), another: s(c("there's another")), even: s(c('even if most')), wasnt: s(c("tesla wasn't")), mean: s(c('does that mean')),
    bursts: s(c('short bursts')), driving: s(c('but a car driving')), comes: s(c('and it all comes')), crazy: s(c("and here's the crazy")),
  };

  // 1 HOOK: the real clip (first 10 s, full frame) in a big rounded card; step chips light up on each verb
  { const K = { ramp: c('curved ramp'), up: c('upside'), launch: c('launched'), flip: c('flipped'), land: c('landed') };
    sfx.push({ t: .02, k: 'riser', g: -21 }, { t: K.flip, k: 'swoosh', g: -19 });
    const steps = [['RAMP', K.ramp], ['UPSIDE DOWN', K.up], ['LAUNCH', K.launch], ['FLIP', K.flip], ['LAND', K.land]];
    add(0, (ctx, T) => {
      studio(ctx, T, { hz: 1500 });
      shot(ctx, T, 0, () => {
        const cw = 1000, ch = cw * CLIP_H / CLIP_W, x = 40, y = 820 - ch / 2 + 140, k = p(T, -.4, .8, eo5);
        flip(ctx, k, 540, y + ch / 2, () => live(ctx, T, 540, y + ch / 2, { yaw: .02, bob: 4, breathe: .004, seed: 1 }, () => {
          clipCard(ctx, T, x, y, cw, ch);
          ctx.save(); ctx.letterSpacing = '4px'; pill(ctx, x + 24, y + 44, 'TESLA · LIVE DEMO · OCT 15', { bg: 'rgba(10,12,16,.8)', size: 20, h: 44, align: 'left', font: MONO, stroke: 'rgba(255,255,255,.3)' }); ctx.restore();
          txt(ctx, tc(T), x + cw - 30, y + ch - 26, 24, 'rgba(255,255,255,.85)', 700, 'right', MONO);
        }));
        // title + logo above the card
        const ta = p(T, -.3, .6);
        live(ctx, T, 540, y - 150, { yaw: .1, bob: 4, breathe: .01, seed: 3 }, () => teslaLogo(ctx, 170, y - 110, 150, { a: ta, glow: .6 }));
        bin(ctx, ta, () => { txt(ctx, "TESLA'S NEW", 270, y - 130, 46, 'rgba(230,234,240,.85)', 800, 'left'); txt(ctx, 'ROADSTER', 268, y - 62, 86, '#fff', 900, 'left'); });
        // step chips under the clip
        const yy = y + ch + 110;
        steps.forEach(([lb, t0], i) => { const a = p(T, t0, .45, eback), on = T >= t0, cx = 120 + i * 210;
          pop(ctx, Math.max(.001, a), cx, yy, () => { ctx.save(); rr(ctx, cx - 96, yy - 40, 192, 80, 40); ctx.fillStyle = on ? 'rgba(255,74,40,.95)' : 'rgba(30,33,40,.85)'; if (on) { ctx.shadowColor = `rgba(${RED_RGB},.7)`; ctx.shadowBlur = 26; } ctx.fill(); ctx.restore();
            txt(ctx, lb, cx, yy + 9, lb.length > 6 ? 21 : 26, '#fff', 800, 'center'); });
          if (i < 4) { ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(cx + 96, yy - 2, 18, 4); } });
        // pitch / altitude dials driven by clip time
        const pitch = kf(T, [[0, 0], [2.5, 60], [4.3, 170], [5.6, 300], [6.6, 360], [8, 360]]), alt = kf(T, [[0, 0], [2.5, 30], [4.2, 67], [5.4, 40], [6.6, 0]]);
        dial(ctx, T, 250, yy + 210, 82, 'PITCH', String(Math.round(pitch % 360)) + '°', (pitch % 360) / 360, { a: p(T, K.ramp, .5) });
        dial(ctx, T, 830, yy + 210, 82, 'ALT FT', alt.toFixed(1), alt / 67, { rgb: '111,230,255', a: p(T, K.ramp, .5) });
      }, { cy: 1000, push: .04, dur: 10 });
    });
  }

  // 2 RESHOOT: camera 2, closer view of the same run (clip continues from 12.4 s, cropped and tracked on the car, slow push-in)
  { const K = { live: c('live audience', A.ai), oct: c('october', A.ai) }, c0 = 12.4;
    sfx.push({ t: A.ai + .12, k: 'shutter', g: -11 });
    add(A.ai, (ctx, T) => {
      studio(ctx, T, { hz: 1640, lanes: 0 });
      const u = T - A.ai, ct = c0 + u, z = lerp(1.3, 1.75, eio(clamp(u / 6))), [nx, ny] = clipTrack(ct);
      const cw = 960, ch = 1080, x = 60, y = 560, sh = CLIP_H / z, sw = sh * cw / ch;
      const sx = clamp(nx * CLIP_W - sw / 2, 0, CLIP_W - sw), sy = clamp(ny * CLIP_H - sh / 2, 0, CLIP_H - sh);
      const k = p(T, A.ai, .5, eo5);
      ctx.save(); ctx.translate(540, y + ch / 2); ctx.scale(lerp(1.12, 1, k), lerp(1.12, 1, k)); ctx.translate(-540, -(y + ch / 2));
      live(ctx, T, 540, y + ch / 2, { yaw: .015, bob: 3, breathe: .003, seed: 2 }, () => {
        clipCard(ctx, ct, x, y, cw, ch, { src: [sx, sy, sw, sh] });
        viewfinder(ctx, T, x, y, cw, ch, 'CAM 2 · CLOSE-UP');
        txt(ctx, tc(ct), x + cw - 40, y + 100, 24, 'rgba(255,255,255,.85)', 700, 'right', MONO);
      });
      ctx.restore();
      stamp(ctx, p(T, A.ai + .1, .45), 540, 1240, 'NOT AI', { size: 96, rot: -.07 });
      // live audience + date badges
      const la = p(T, K.live, .45, eback), oa = p(T, K.oct, .5, eback);
      pop(ctx, la, 300, 1730, () => pill(ctx, 300, 1730, '● LIVE AUDIENCE', { bg: 'rgba(255,59,48,.95)', size: 30, h: 70 }));
      pop(ctx, oa, 790, 1730, () => { live(ctx, T, 790, 1730, { yaw: .15, bob: 4, seed: 4 }, () => { rr(ctx, 690, 1660, 200, 140, 22); ctx.fillStyle = '#f4f5f7'; ctx.fill(); rr(ctx, 690, 1660, 200, 42, [22, 22, 0, 0]); ctx.fillStyle = '#ff3b30'; ctx.fill();
        txt(ctx, 'OCT', 790, 1690, 24, '#fff', 800); txt(ctx, '15', 790, 1782, 70, '#15161a', 900); }); });
    });
  }

  // 3 HOW? glossy Roadster turns on the studio floor
  { const K = { how: c('how', A.how) };
    add(A.how, (ctx, T) => {
      studio(ctx, T, { hz: 1340 });
      shot(ctx, T, A.how, () => {
        const sp = -T * 3;
        live(ctx, T, 540, 1340, { yaw: .05, bob: 0, breathe: .004, seed: 5 }, () => { reflection(ctx, T, 540, 1430, 1.05, { spin: sp }); roadster(ctx, T, 540, 1430, 1.05, { spin: sp }); });
      }, { cy: 1300 });
      title(ctx, p(T, K.how, .45), 'HOW?', 'A CAR THAT FLIPS ITSELF', { y: 660, size: 150 });
      const q = p(T, K.how + .2, .5, eback);
      pop(ctx, q, 860, 900, () => live(ctx, T, 860, 900, { yaw: .3, bob: 10, seed: 6 }, () => txt(ctx, '?', 860, 960, 170, `rgba(${RED_RGB},.95)`, 900)));
    });
  }

  // 4 BALLOON: fill it, let go untied -> air one way, balloon the other -> Newton's 3rd law -> same principle in the car
  { const K = { bal: c('balloon', A.answer), fill: c('fill', A.answer), tie: c('without tying', A.answer), rush: c('rushes', A.answer), flies: c('flies', A.answer), nw: c("newton's", A.answer), pr: c('principle', A.answer) };
    sfx.push({ t: K.rush, k: 'swoosh', g: -15 }, { t: K.nw, k: 'sweep', g: -18 });
    add(A.answer, (ctx, T) => {
      studio(ctx, T, { hz: 1560 });
      shot(ctx, T, A.answer, () => {
        const r = kf(T, [[A.answer, 0], [A.answer + .5, 55], [K.bal, 55], [K.bal + .5, 90], [K.fill, 90], [K.fill + .9, 150]], eback);
        const fly = clamp((T - K.rush) / 3.2), bx = lerp(430, 780, eo(fly)), by = lerp(1050, 1120, fly), rr2 = r * (1 - .3 * fly);
        const air = clamp((T - K.rush + .1) / .4) * (1 - clamp((T - K.pr - 1) / .6));
        if (air > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; plume(ctx, T, bx - rr2 * .2, by + rr2 * 1.25, Math.PI * .92, 520, 90, air); ctx.restore();
          for (let i = 0; i < 16; i++) { const u = (T * 1.2 + hash(i, 3)) % 1; ctx.fillStyle = `rgba(${CYAN_RGB},${.8 * air * (1 - u)})`; ctx.beginPath(); ctx.arc(bx - 60 - 560 * u, by + rr2 * 1.2 + (hash(i, 4) - .5) * 160 * u, 6, 0, 7); ctx.fill(); } }
        if (r > 1) live(ctx, T, bx, by, { yaw: .05, bob: 10, breathe: .01, seed: 7 }, () => balloon(ctx, T, bx, by, rr2, { knot: 0, open: T > K.tie ? 1 : 0, rot: -1.2 * eo(fly) * 0 + (fly > 0 ? -.35 : 0) }));
        if (r > 1 && T > K.fill) tag(ctx, bx + 210, by - 240, 'FILL IT WITH AIR', p(T, K.fill, .4) * (1 - p(T, K.tie - .1, .3)), bx + rr2 * .5, by - rr2 * .5);
        tag(ctx, bx + 230, by + 260, 'END NOT TIED', p(T, K.tie, .4) * (1 - p(T, K.rush, .3)), bx, by + rr2 * 1.25, { rgb: '255,180,150' });
        const ar = p(T, K.rush, .4); arrow(ctx, bx - 120, by + 360, bx - 420, by + 360, { col: CYAN, w: 18, a: ar }); tag(ctx, bx - 280, by + 430, 'AIR ←', ar, null, null, { rgb: CYAN_RGB });
        const fa = p(T, K.flies, .4); arrow(ctx, bx + 120, by + 360, bx + 330, by + 360, { col: ORANGE, w: 18, a: fa }); tag(ctx, bx + 230, by + 430, 'BALLOON →', fa, null, null, { rgb: ORANGE_RGB });
        // the car slides in: same principle
        const cr = p(T, K.pr, .9, eo5); if (cr > 0) { const cx = lerp(1500, 600, cr); live(ctx, T, cx, 1560, { yaw: .02, bob: 0, seed: 8 }, () => { reflection(ctx, T, cx, 1640, .62, { spin: -T * 4 }); roadster(ctx, T, cx, 1640, .62, { spin: -T * 4 * (1 - cr) }); }); }
      }, { cy: 1150, push: .06, dur: 9 });
      title(ctx, p(T, A.answer + .1, .45) * (1 - p(T, K.rush - .1, .3)), 'A KID EXPERIMENT', 'ONE BALLOON · NO KNOT', { y: 600 });
      title(ctx, p(T, K.nw, .45), "NEWTON'S 3RD LAW", 'ACTION = EQUAL, OPPOSITE REACTION', { y: 600 });
    });
  }

  // 5 PART 1 · FLYING: x-ray Roadster, high-pressure tanks of compressed gas
  { const K = { ins: c('inside', A.start), tanks: c('tanks', A.start), comp: c('compressed', A.start) };
    sfx.push({ t: K.ins, k: 'sweep', g: -16 });
    add(A.start, (ctx, T) => {
      studio(ctx, T, { hz: 1420 });
      const xr = p(T, K.ins, .8, eio), z = kf(T, [[A.start, 1], [K.ins, 1], [K.tanks, 1.25]]);
      shot(ctx, T, A.start, () => { ctx.save(); ctx.translate(540, 1300); ctx.scale(z, z); ctx.translate(-540, -1300);
        live(ctx, T, 540, 1300, { yaw: .02, bob: 4, breathe: .004, seed: 9 }, () => { reflection(ctx, T, 540, 1430, 1.08, {}); roadster(ctx, T, 540, 1430, 1.08, { xray: xr, tanks: p(T, K.tanks, .5) * (.75 + .25 * Math.sin(T * 4)) }); });
        ctx.restore();
        const S = (px, py) => [540 + (540 + px * 1.08 - 540) * z, 1300 + (1430 + py * 1.08 - 1300) * z];
        const t1 = S(100, -112), t2 = S(-60, -168);
        tag(ctx, 780, 920, 'HIGH-PRESSURE TANK', p(T, K.tanks, .45), t2[0], t2[1], { rgb: CYAN_RGB });
        tag(ctx, 330, 1720, 'HIGH-PRESSURE TANK', p(T, K.tanks + .2, .45), t1[0], t1[1], { rgb: CYAN_RGB });
      }, { cy: 1300, push: .03 });
      title(ctx, p(T, A.start + .05, .45) * (1 - p(T, K.comp - .1, .3)), 'PART 1 · FLYING', 'THE COLD-GAS SYSTEM', { y: 600 });
      title(ctx, p(T, K.comp, .45), 'COMPRESSED GAS', 'STORED AT HIGH PRESSURE', { y: 600, col: CYAN, glow: CYAN_RGB });
      // pressure gauge needle climbs
      const ga = p(T, K.comp, .5); if (ga > 0) live(ctx, T, 880, 800, { yaw: .08, bob: 5, seed: 3 }, () => { ctx.save(); ctx.globalAlpha *= ga; ctx.fillStyle = 'rgba(8,10,14,.85)'; ctx.beginPath(); ctx.arc(880, 800, 95, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 4; ctx.stroke();
        ctx.strokeStyle = CYAN; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(880, 800, 75, Math.PI * .75, Math.PI * 2.25); ctx.stroke(); const nv = kf(T, [[K.comp, 0], [K.comp + 1, .92]], eback) + .02 * Math.sin(T * 9);
        const an = Math.PI * .75 + nv * Math.PI * 1.5; ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(880, 800); ctx.lineTo(880 + Math.cos(an) * 66, 800 + Math.sin(an) * 66); ctx.stroke();
        txt(ctx, 'PSI', 880, 860, 22, 'rgba(220,230,240,.8)', 700, 'center', MONO); ctx.restore(); });
    });
  }

  // 6 RELEASED through nozzles called cold-gas thrusters
  { const K = { noz: c('nozzles', A.rel), cold: c('cold', A.rel) };
    sfx.push({ t: K.cold + .1, k: 'swoosh', g: -17 });
    add(A.rel, (ctx, T) => {
      studio(ctx, T, { hz: 1400 });
      shot(ctx, T, A.rel, () => {
        const s = 1.0, x = 540, y = 1400, blast = p(T, K.cold, .5);
        live(ctx, T, 540, 1300, { yaw: .02, bob: 4, breathe: .004, seed: 10 }, () => {
          reflection(ctx, T, x, y, s, {});
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; NOZ.forEach(([nx, ny], i) => { const [px, py] = carPt(x, y, s, nx, ny); const ang = i < 4 ? Math.PI / 2 : (i === 4 ? Math.PI : 0); plume(ctx, T, px, py, ang, 220, 60, blast * (.6 + .4 * Math.sin(T * 6 + i))); }); ctx.restore();
          roadster(ctx, T, x, y, s, { xray: 1, tanks: .6, lines: p(T, A.rel + .1, .6), nozzles: p(T, K.noz, .8) });
        });
        const n0 = carPt(x, y, s, ...NOZ[0]), n3 = carPt(x, y, s, ...NOZ[3]), n5 = carPt(x, y, s, ...NOZ[5]);
        tag(ctx, 240, 1660, 'NOZZLE', p(T, K.noz, .4), n0[0], n0[1], { rgb: CYAN_RGB });
        tag(ctx, 840, 1660, 'NOZZLE', p(T, K.noz + .15, .4), n3[0], n3[1], { rgb: CYAN_RGB });
        tag(ctx, 880, 1100, 'NOZZLE', p(T, K.noz + .3, .4), n5[0], n5[1], { rgb: CYAN_RGB });
        tag(ctx, 300, 1050, 'GAS LINES', p(T, A.rel + .3, .4) * (1 - p(T, K.cold, .3)), ...carPt(x, y, s, -60, -90), { rgb: CYAN_RGB });
      }, { cy: 1350 });
      title(ctx, p(T, A.rel + .05, .45) * (1 - p(T, K.cold - .1, .3)), 'RELEASE THE GAS', 'TANK → LINES → NOZZLES', { y: 600 });
      title(ctx, p(T, K.cold, .45), 'COLD-GAS THRUSTERS', 'NO FIRE, JUST GAS', { y: 600, col: CYAN, glow: CYAN_RGB });
    });
  }

  // 7 SUPER-POWERED BALLOON: balloon puff vs thruster blast, power bars
  { const K = { pw: c('powerful', A.think), bx: c('experiment', A.think) };
    add(A.think, (ctx, T) => {
      studio(ctx, T, { hz: 1500 });
      shot(ctx, T, A.think, () => {
        const ba = p(T, A.think + .1, .6, eback), ta = p(T, K.pw, .6, eback);
        flip(ctx, ba, 290, 1100, () => live(ctx, T, 290, 1100, { yaw: .05, bob: 5, breathe: .004, seed: 1 }, () => { panel(ctx, 60, 760, 460, 760);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; plume(ctx, T, 290, 1150, Math.PI / 2, 160, 30, .5); ctx.restore(); balloon(ctx, T, 290, 1000, 110, { knot: 0, open: 1 });
          txt(ctx, 'BALLOON', 290, 1390, 40, '#fff', 900); ctx.save(); ctx.letterSpacing = '3px'; txt(ctx, 'A PUFF', 290, 1432, 22, 'rgba(255,180,150,.9)', 700, 'center', MONO); ctx.restore();
          bar(ctx, 110, 1470, 360, 18, .12 * clamp((T - A.think) / .6), '#ff6a45', 'rgba(255,255,255,.1)'); }));
        flip(ctx, ta, 790, 1100, () => live(ctx, T, 790, 1100, { yaw: .05, bob: 5, breathe: .004, seed: 2 }, () => { panel(ctx, 560, 760, 460, 760);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; plume(ctx, T, 790, 1090, Math.PI / 2, 300, 120, 1); glowDot(ctx, 790, 1060, 90, CYAN_RGB, 1); ctx.restore();
          ctx.fillStyle = '#2a2f37'; rr(ctx, 730, 930, 120, 130, 14); ctx.fill(); ctx.fillStyle = '#9aa3ae'; ctx.beginPath(); ctx.moveTo(740, 1060); ctx.lineTo(840, 1060); ctx.lineTo(860, 1100); ctx.lineTo(720, 1100); ctx.closePath(); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(742, 940, 14, 110);
          txt(ctx, 'THRUSTER', 790, 1390, 40, '#fff', 900); ctx.save(); ctx.letterSpacing = '3px'; txt(ctx, 'A BLAST', 790, 1432, 22, `rgb(${CYAN_RGB})`, 700, 'center', MONO); ctx.restore();
          bar(ctx, 610, 1470, 360, 18, kf(T, [[K.pw, 0], [K.pw + 1, 1]], eo), CYAN, 'rgba(255,255,255,.1)'); }));
        txt(ctx, '≈', 540, 1150, 90, `rgba(255,255,255,${p(T, K.bx, .4)})`, 900);
      }, { cy: 1150 });
      title(ctx, p(T, K.pw, .45), 'SAME IDEA, WAY STRONGER', 'BALLOON EXPERIMENT × 1000', { y: 620, size: 64 });
    });
  }

  // 8 PUSH GAS DOWN -> UPWARD FORCE (car lifts on its jets)
  { const K = { dn: c('downward', A.down), up: c('upward', A.down), f: c('force', A.down) };
    sfx.push({ t: K.up, k: 'riser', g: -20 });
    add(A.down, (ctx, T) => {
      studio(ctx, T, { hz: 1560 });
      shot(ctx, T, A.down, () => {
        const lift = kf(T, [[A.down, 0], [K.dn + .2, 0], [K.up + .8, 230]], eio) + 8 * Math.sin(T * 3), x = 540, y = 1560 - lift, s = .95, jet = p(T, K.dn, .4);
        reflection(ctx, T, x, 1560, s, {}, .1 * (1 - lift / 300));
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; [0, 1, 2, 3].forEach(i => { const [px, py] = carPt(x, y, s, ...NOZ[i]); plume(ctx, T, px, py, Math.PI / 2, 120 + lift, 54 + lift * .15, jet); }); ctx.restore();
        live(ctx, T, x, y - 100, { yaw: .02, bob: 0, breathe: .003, seed: 11 }, () => roadster(ctx, T, x, y, s, { xray: .35, nozzles: jet, shadow: 1 - lift / 300 }));
        const da = p(T, K.dn, .4); arrow(ctx, 540, y + 40, 540, y + 40 + Math.max(60, lift * .8 + 60), { col: CYAN, w: 20, a: da });
        tag(ctx, 280, 1700, 'GAS ↓', da, null, null, { rgb: CYAN_RGB });
        const ua = p(T, K.up, .45, eback); arrow(ctx, 540, y - 280, 540, y - 280 - 260 * ua, { col: ORANGE, w: 28, a: ua });
        tag(ctx, 760, y - 470, 'FORCE ↑', p(T, K.f, .4), null, null, { rgb: ORANGE_RGB });
      }, { cy: 1250 });
      title(ctx, p(T, K.up, .45), 'GAS DOWN = CAR UP', 'ACTION · REACTION', { y: 600 });
    });
  }

  // 9 PUSH SIDEWAYS -> ROTATE / STABILISE (front view, side jets)
  { const K = { sd: c('sideways', A.side), rot: c('rotate', A.side), st: c('stabilize', A.side) };
    sfx.push({ t: K.rot, k: 'swoosh', g: -18 });
    add(A.side, (ctx, T) => {
      studio(ctx, T, { hz: 1600 });
      shot(ctx, T, A.side, () => {
        const ang = kf(T, [[A.side, 0], [K.rot, 0], [K.rot + .9, -.32], [K.st, -.32], [K.st + .9, 0]]) + .02 * Math.sin(T * 2);
        const jl = p(T, K.sd, .4) * (T < K.st ? 1 : 1 - p(T, K.st + .9, .4)), jr = p(T, K.st, .4) * (1 - p(T, K.st + 1, .5));
        ctx.save(); ctx.translate(540, 1300); ctx.rotate(ang); ctx.translate(-540, -1300);
        live(ctx, T, 540, 1300, { yaw: .03, bob: 6, breathe: .004, seed: 12 }, () => roadsterFront(ctx, T, 540, 1400, 1.45, { jets: [jl, jr] }));
        ctx.restore();
        curvedArrow(ctx, 540, 1170, 420, -Math.PI * .2, -Math.PI * .2 - 1.6 * p(T, K.rot, .7), { a: p(T, K.rot, .3) * (1 - p(T, K.st, .3)) });
        tag(ctx, 780, 840, 'ROTATE', p(T, K.rot, .4) * (1 - p(T, K.st, .3)), null, null, { rgb: ORANGE_RGB });
        tag(ctx, 540, 840, 'STABILISE', p(T, K.st, .4), null, null, { rgb: CYAN_RGB });
        tag(ctx, 200, 1730, 'SIDE JET', p(T, K.sd, .4), 190, 1260, { rgb: CYAN_RGB });
      }, { cy: 1300 });
      title(ctx, p(T, A.side + .05, .45), 'SIDE JETS', 'TURN · HOLD STEADY', { y: 600 });
    });
  }

  // 10 TEN THRUSTERS around the car (top view, they light up in turn)
  { const K = { ten: c('10', A.says), ar: c('around', A.says) };
    sfx.push({ t: K.ten, k: 'gear', g: -14 });
    add(A.says, (ctx, T) => {
      studio(ctx, T, { hz: 1900, lanes: 0, poles: .6 });
      shot(ctx, T, A.says, () => {
        const lit = clamp((T - K.ten + .2) / 1.4);
        live(ctx, T, 540, 1240, { yaw: .02, bob: 5, breathe: .004, spin: 0, seed: 13 }, () => { ctx.save(); ctx.translate(540, 1240); ctx.rotate(.12 * Math.sin(T * .4)); ctx.translate(-540, -1240); roadsterTop(ctx, T, 540, 1240, .95, { lit, label: 1 }); ctx.restore(); });
        const n = Math.min(10, Math.floor(lit * 10 + .001));
        bin(ctx, p(T, K.ten, .4), () => { panel(ctx, 380, 1720 - 70, 320, 120, 60); txt(ctx, String(n).padStart(2, '0'), 470, 1735, 70, CYAN, 900, 'center', MONO); txt(ctx, 'THRUSTERS', 610, 1726, 26, '#fff', 800, 'center'); });
      }, { cy: 1240 });
      bin(ctx, p(T, A.says + .1, .5), () => { teslaLogo(ctx, 540, 620, 90, { glow: .5 }); });
      ctx.save(); ctx.letterSpacing = '5px'; bin(ctx, p(T, A.says + .2, .5), () => txt(ctx, 'TESLA SAYS', 540, 720, 24, 'rgba(220,226,236,.75)', 700, 'center', MONO)); ctx.restore();
    });
  }

  // 11 UPSIDE DOWN WITHOUT FALLING? car on the underside of the curved ramp, gravity pulls down
  { const K = { ud: c('drive upside', A.but), fall: c('falling', A.but) };
    add(A.but, (ctx, T) => {
      studio(ctx, T, { hz: 1800, poles: .8 });
      shot(ctx, T, A.but, () => {
        const cx = 540, cy = 2250, R = 1150; rampCeiling(ctx, T, cx, cy, R, -2.45, -.7);
        const ang = kf(T, [[A.but, -1.85], [K.fall + 1.5, -1.42]]), px = cx + Math.cos(ang) * R, py = cy + Math.sin(ang) * R;
        live(ctx, T, px, py, { yaw: .01, bob: 2, breathe: 0, seed: 14 }, () => { ctx.save(); ctx.translate(px, py); ctx.rotate(ang + Math.PI / 2 + Math.PI); ctx.scale(-1, 1); roadster(ctx, T, 0, 0, .55, { spin: T * 5, shadow: 0 }); ctx.restore(); });
        const ga = p(T, K.fall, .5); arrow(ctx, px, py + 100, px, py + 100 + 260 * ga, { col: '#e8ecf2', w: 22, a: ga, glow: .4 });
        tag(ctx, px + 190, py + 300, 'GRAVITY ↓', ga, null, null);
      }, { cy: 1100 });
      title(ctx, p(T, K.ud, .45), 'UPSIDE DOWN?', 'WITHOUT FALLING', { y: 640, size: 90 });
    });
  }

  // 12 PART 2 · THE GRIP: fans + a sealing system underneath (x-ray underside)
  { const K = { und: c('underneath', A.diff), fans: c('fans', A.diff), seal: c('sealing', A.diff) };
    sfx.push({ t: K.und, k: 'sweep', g: -16 });
    add(A.diff, (ctx, T) => {
      studio(ctx, T, { hz: 1380 });
      const z = kf(T, [[A.diff, 1], [K.und, 1], [K.fans + .5, 1.35]]);
      shot(ctx, T, A.diff, () => { ctx.save(); ctx.translate(540, 1380); ctx.scale(z, z); ctx.translate(-540, -1380);
        live(ctx, T, 540, 1300, { yaw: .02, bob: 3, breathe: .003, seed: 15 }, () => { reflection(ctx, T, 540, 1420, 1.05, {}); roadster(ctx, T, 540, 1420, 1.05, { xray: p(T, K.und, .7), fans: p(T, K.fans, .5), seal: p(T, K.seal, .5) * (.8 + .2 * Math.sin(T * 5)) }); });
        ctx.restore();
        const S = (px, py) => [540 + (540 + px * 1.05 - 540) * z, 1380 + (1420 + py * 1.05 - 1380) * z];
        tag(ctx, 300, 1000, 'FANS', p(T, K.fans, .4), ...S(-110, -55), { rgb: CYAN_RGB }); tag(ctx, 800, 1000, 'FANS', p(T, K.fans + .15, .4), ...S(130, -55), { rgb: CYAN_RGB });
        tag(ctx, 540, 1720, 'SEAL / SKIRT', p(T, K.seal, .4), ...S(250, -6), { rgb: ORANGE_RGB });
      }, { cy: 1380, push: .03 });
      title(ctx, p(T, A.diff + .05, .45), 'PART 2 · THE GRIP', 'FANS + A SEAL', { y: 600 });
    });
  }

  // 13 FANS PULL AIR OUT -> LOWER PRESSURE under the car (pressure meter falls)
  { const K = { air: c('air out', A.pull), low: c('lower', A.pull) };
    add(A.pull, (ctx, T) => {
      studio(ctx, T, { hz: 1420 });
      shot(ctx, T, A.pull, () => {
        const x = 540, y = 1420, s = 1.05, pull = p(T, K.air, .4), lp = p(T, K.low, .6);
        live(ctx, T, 540, 1300, { yaw: .02, bob: 3, breathe: .003, seed: 16 }, () => { reflection(ctx, T, x, y, s, {}); roadster(ctx, T, x, y, s, { xray: .7, fans: 1, seal: .8, lowP: lp * (.85 + .15 * Math.sin(T * 4)) }); });
        // air particles sucked from under the floor, out through the fans to the rear
        for (let i = 0; i < 40; i++) { const u = (T * .55 + hash(i, 5)) % 1, sx0 = lerp(-380, 380, hash(i, 6)), dens = 1 - .75 * lp;
          if (hash(i, 7) > dens) continue; const px = x + lerp(sx0, -520, eio(u)) * s, py = y + lerp(-20, -60 - 40 * hash(i, 8), u) * s;
          ctx.fillStyle = `rgba(235,240,248,${.85 * pull * Math.sin(u * Math.PI)})`; ctx.beginPath(); ctx.arc(px, py, 6, 0, 7); ctx.fill(); }
        tag(ctx, 760, 1080, 'AIR PULLED OUT', pull * (1 - p(T, K.low, .3)), ...carPt(x, y, s, 130, -60));
        tag(ctx, 380, 1650, 'LOWER PRESSURE', lp, ...carPt(x, y, s, -100, -24), { rgb: '140,180,255' });
      }, { cy: 1350 });
      // pressure meter
      const m = p(T, A.pull + .2, .5);
      bin(ctx, m, () => live(ctx, T, 540, 690, { yaw: .05, bob: 4, seed: 4 }, () => { panel(ctx, 220, 600, 640, 170, 30); ctx.save(); ctx.letterSpacing = '3px'; txt(ctx, 'PRESSURE UNDER CAR', 540, 650, 22, 'rgba(220,226,236,.75)', 700, 'center', MONO); ctx.restore();
        const v = kf(T, [[A.pull, 1], [K.air, 1], [K.low + .8, .35]], eio); bar(ctx, 260, 690, 560, 30, v, v < .6 ? `rgb(${BLUEP_RGB})` : '#e8ecf2', 'rgba(255,255,255,.1)'); txt(ctx, Math.round(v * 100) + '%', 540, 755, 30, '#fff', 800, 'center', MONO); }));
    });
  }

  // 14 HIGHER PRESSURE OUTSIDE PUSHES -> DOWNFORCE (arrows rain on the car)
  { const K = { push: c('pushes', A.higher), df: c('downforce', A.higher) };
    sfx.push({ t: K.df, k: 'riser', g: -20 });
    add(A.higher, (ctx, T) => {
      studio(ctx, T, { hz: 1480 });
      shot(ctx, T, A.higher, () => {
        const x = 540, y = 1480, s = 1.0, press = p(T, K.push, .4) * (.8 + .2 * Math.sin(T * 5));
        live(ctx, T, 540, 1350, { yaw: .02, bob: 0, breathe: .003, seed: 17 }, () => { reflection(ctx, T, x, y, s, {}); roadster(ctx, T, x, y + 6 * press, s, { lowP: .8 }); });
        const ra = p(T, A.higher + .1, .5);
        for (let i = 0; i < 11; i++) { const ax = 90 + i * 90, ph = (T * 1.4 + hash(i, 9)) % 1, top = 820 + 40 * hash(i, 3), len = 170 + 50 * hash(i, 4);
          const yy = top + 40 * eio(ph) * press; arrow(ctx, ax, yy, ax + (540 - ax) * .08, yy + len, { col: ORANGE, w: 12, a: ra * (1 - .5 * ph), glow: .6 }); }
        const da = p(T, K.df, .5, eback); arrow(ctx, 540, 900, 540, 900 + 330 * da, { col: ORANGE, w: 46, head: 2, a: da });
        tag(ctx, 540, 790, 'HIGHER PRESSURE OUTSIDE', ra, null, null, { rgb: ORANGE_RGB });
      }, { cy: 1300 });
      title(ctx, p(T, K.df, .45), 'DOWNFORCE', 'THE AIR PUSHES IT DOWN', { y: 620, col: ORANGE, glow: ORANGE_RGB, size: 92 });
    });
  }

  // 15 STRONG ENOUGH -> STAYS ATTACHED upside down (downforce beats gravity)
  { const K = { st: c('strong', A.andif), att: c('attached', A.andif) };
    sfx.push({ t: K.att + .15, k: 'success', g: -15 });
    add(A.andif, (ctx, T) => {
      studio(ctx, T, { hz: 1800, poles: .8 });
      shot(ctx, T, A.andif, () => {
        const cx = 540, cy = 2150, R = 1100; rampCeiling(ctx, T, cx, cy, R, -2.5, -.65);
        const ang = kf(T, [[A.andif, -1.78], [K.att + 2, -1.42]]), px = cx + Math.cos(ang) * R, py = cy + Math.sin(ang) * R;
        live(ctx, T, px, py, { yaw: .01, bob: 1, breathe: 0, seed: 18 }, () => { ctx.save(); ctx.translate(px, py); ctx.rotate(ang + Math.PI / 2 + Math.PI); ctx.scale(-1, 1); roadster(ctx, T, 0, 0, .6, { spin: T * 5, shadow: 0, lowP: .9, seal: .8 }); ctx.restore(); });
        const fa = p(T, A.andif + .2, .5);
        for (let i = 0; i < 6; i++) { const ox = px - 250 + i * 100, ph = (T * 1.5 + i * .17) % 1; arrow(ctx, ox, py + 330 - 20 * ph, ox, py + 190 - 20 * ph, { col: ORANGE, w: 14, a: fa * (1 - .4 * ph), glow: .6 }); }
        arrow(ctx, px, py + 150, px, py + 300, { col: '#e8ecf2', w: 18, a: fa * .9, glow: .3 });
        // tug-of-war meter
        bin(ctx, p(T, K.st, .5), () => { panel(ctx, 140, 1530, 800, 230, 30);
          const df = kf(T, [[K.st, .4], [K.st + 1, .85]], eo);
          txt(ctx, 'DOWNFORCE', 180, 1600, 28, ORANGE, 800, 'left'); bar(ctx, 180, 1620, 720, 26, df, ORANGE, 'rgba(255,255,255,.08)');
          txt(ctx, 'GRAVITY', 180, 1690, 28, '#e8ecf2', 800, 'left'); bar(ctx, 180, 1710, 720, 26, .45, '#9aa3ae', 'rgba(255,255,255,.08)'); });
        check(ctx, 880, 1580, 40, p(T, K.att, .5));
      }, { cy: 1150 });
      stamp(ctx, p(T, K.att, .45), 540, 640, 'STAYS ATTACHED', { col: '#7dffb0', size: 64 });
    });
  }

  // 16 THE CATCH: not a flying car you can buy
  { const K = { catch: c('catch', A.pretty), norm: c('normal', A.pretty), buy: c('buy', A.pretty), tr: c('traffic', A.pretty) };
    sfx.push({ t: K.buy, k: 'shutter', g: -11 });
    add(A.pretty, (ctx, T) => {
      studio(ctx, T, { hz: 1450 });
      shot(ctx, T, A.pretty, () => {
        live(ctx, T, 540, 1350, { yaw: .03, bob: 0, breathe: .004, seed: 19 }, () => { reflection(ctx, T, 540, 1450, 1.0, { spin: -T * 2 }); roadster(ctx, T, 540, 1450, 1.0, { spin: -T * 2 }); });
        // traffic jam rows behind (tail lights), fade in at "traffic"
        const ta = p(T, K.tr, .6); if (ta > 0) for (let i = 0; i < 8; i++) { const x = 70 + i * 135 + 6 * Math.sin(T + i); ctx.save(); ctx.globalAlpha *= ta; ctx.fillStyle = '#1a1d23'; rr(ctx, x - 50, 1650, 100, 60, 14); ctx.fill();
          ctx.fillStyle = '#ff3b2a'; ctx.shadowColor = '#ff3b2a'; ctx.shadowBlur = 16 * (.6 + .4 * Math.sin(T * 4 + i)); ctx.fillRect(x - 40, 1670, 18, 8); ctx.fillRect(x + 22, 1670, 18, 8); ctx.restore(); }
        stamp(ctx, p(T, K.buy, .45), 540, 1180, 'NOT FOR SALE', { col: '#ff6a55', size: 84, rot: -.1 });
      }, { cy: 1350 });
      title(ctx, p(T, K.catch, .45), 'THE CATCH', '', { y: 640, size: 100 });
      const na = p(T, K.norm, .45, eback); pop(ctx, na, 540, 760, () => pill(ctx, 540, 760, 'NOT A NORMAL FLYING CAR', { bg: 'rgba(30,33,40,.9)', size: 30, h: 68, stroke: 'rgba(255,255,255,.3)' }));
    });
  }

  // 17 CONTROLLED DEMO: nobody at the wheel (top view cockpit with an empty seat and a self-turning wheel)
  { const K = { ctl: c('controlled', A.ctrl), hum: c('human', A.ctrl) };
    add(A.ctrl, (ctx, T) => {
      studio(ctx, T, { hz: 1900, lanes: 0, poles: .7 });
      shot(ctx, T, A.ctrl, () => {
        const xr = p(T, A.ctrl + .2, .6);
        live(ctx, T, 540, 1200, { yaw: .02, bob: 4, breathe: .004, seed: 20 }, () => { ctx.save(); ctx.translate(540, 1220); ctx.rotate(-.18 + .04 * Math.sin(T * .5)); ctx.translate(-540, -1220); roadsterTop(ctx, T, 540, 1220, 1.0, { lit: 0 });
          // empty seat + steering wheel turning by itself
          ctx.save(); ctx.globalAlpha *= xr; ctx.fillStyle = '#20252d'; rr(ctx, 450, 1200, 90, 130, 24); ctx.fill(); ctx.fillStyle = '#2d333d'; rr(ctx, 560, 1200, 90, 130, 24); ctx.fill();
          ctx.translate(495, 1150); ctx.rotate(.6 * Math.sin(T * 1.7)); ctx.strokeStyle = '#d9dee6'; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(0, 0, 50, 22, 0, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(50, 0); ctx.stroke(); ctx.restore(); ctx.restore(); });
        tag(ctx, 830, 1000, 'NO ONE AT THE WHEEL', p(T, K.hum, .4), 520, 1150);
        // remote control tablet
        const ra = p(T, K.ctl + .2, .6, eo5); flip(ctx, ra, 250, 1650, () => live(ctx, T, 250, 1650, { yaw: .06, bob: 5, seed: 5 }, () => { panel(ctx, 110, 1570, 280, 170, 24);
          ctx.save(); ctx.letterSpacing = '2px'; txt(ctx, 'REMOTE · OK', 250, 1615, 20, '#7dffb0', 700, 'center', MONO); ctx.restore(); ctx.strokeStyle = `rgba(${CYAN_RGB},.8)`; ctx.lineWidth = 3; ctx.beginPath();
          for (let i = 0; i <= 40; i++) { const xx = 140 + i * 5.5, yy = 1680 + 22 * Math.sin(i * .5 + T * 6) * Math.sin(i * .13); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }));
      }, { cy: 1250 });
      title(ctx, p(T, K.ctl, .45), 'CONTROLLED DEMO', 'NO HUMAN DRIVER', { y: 600 });
    });
  }

  // 18 FLYING VERSION: not approved for public roads; production target 2028 (flip calendar)
  { const K = { ap: c('approved', A.fver), pr: c('production', A.fver), y28: c('2028', A.fver) };
    sfx.push({ t: K.y28, k: 'gear', g: -14 });
    add(A.fver, (ctx, T) => {
      studio(ctx, T, { hz: 1500 });
      shot(ctx, T, A.fver, () => {
        const sl = kf(T, [[A.fver, -300], [K.pr, 540]], eo5);
        live(ctx, T, sl, 1400, { yaw: .02, bob: 0, breathe: .003, seed: 21 }, () => { reflection(ctx, T, sl, 1500, .85, { spin: -T * 6 }); roadster(ctx, T, sl, 1500, .85, { spin: -T * 6 }); });
        // road sign with a red cross
        const sa = p(T, K.ap, .5, eback); pop(ctx, sa, 820, 980, () => live(ctx, T, 820, 980, { yaw: .1, bob: 5, seed: 6 }, () => { ctx.fillStyle = '#8b929c'; ctx.fillRect(812, 1000, 16, 260);
          rr(ctx, 690, 860, 260, 170, 18); ctx.fillStyle = '#1f7a3a'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.stroke(); txt(ctx, 'PUBLIC', 820, 930, 40, '#fff', 900); txt(ctx, 'ROAD', 820, 985, 40, '#fff', 900); xmark(ctx, 930, 870, 40, p(T, K.ap + .2, .4)); }));
        // flip calendar 2026 -> 2028
        const ca = p(T, K.pr, .5, eback), fl = p(T, K.y28, .5, eio); if (ca > 0) live(ctx, T, 280, 980, { yaw: .1, bob: 5, seed: 7 }, () => pop(ctx, ca, 280, 980, () => {
          rr(ctx, 140, 860, 280, 240, 26); ctx.fillStyle = '#f4f5f7'; ctx.fill(); rr(ctx, 140, 860, 280, 64, [26, 26, 0, 0]); ctx.fillStyle = '#ff3b30'; ctx.fill(); ctx.save(); ctx.letterSpacing = '3px'; txt(ctx, 'TARGET', 280, 903, 24, '#fff', 800, 'center', MONO); ctx.restore();
          ctx.save(); ctx.translate(280, 1015); ctx.scale(1, Math.abs(Math.cos(fl * Math.PI)) || .001); txt(ctx, fl < .5 ? '2026' : '2028', 0, 30, 82, '#15161a', 900); ctx.restore(); }));
      }, { cy: 1250 });
      title(ctx, p(T, A.fver + .05, .45) * (1 - p(T, K.y28 - .1, .3)), 'FLYING VERSION', 'NOT APPROVED FOR PUBLIC ROADS', { y: 600 });
      title(ctx, p(T, K.y28, .45), '2028', 'TARGET FOR PRODUCTION', { y: 620, size: 110, glow: RED_RGB });
    });
  }

  // 19 HALO PRODUCT: glowing halo above the car; 1 showcases the tech, 2 builds the brand
  { const K = { halo: c('halo', A.another), ex: c('extraordinary', A.another), sh: c('showcase', A.another), br: c('brand', A.another) };
    sfx.push({ t: K.halo, k: 'shimmer', g: -15 });
    add(A.another, (ctx, T) => {
      studio(ctx, T, { hz: 1560 });
      shot(ctx, T, A.another, () => {
        live(ctx, T, 540, 1450, { yaw: .03, bob: 0, breathe: .004, seed: 22 }, () => { reflection(ctx, T, 540, 1560, .95, {}); roadster(ctx, T, 540, 1560, .95, {}); });
        const ha = p(T, K.halo, .7, eback); if (ha > 0) { const hy = 1180 + 10 * Math.sin(T * 2); ctx.save(); ctx.globalAlpha *= clamp(ha); ctx.translate(540, hy); ctx.scale(ha, ha);
          ctx.shadowColor = 'rgba(255,240,210,1)'; ctx.shadowBlur = 40; ctx.strokeStyle = 'rgba(255,246,228,.95)'; ctx.lineWidth = 16; ctx.beginPath(); ctx.ellipse(0, 0, 360, 70, 0, 0, 7); ctx.stroke();
          ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,1)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, 0, 360, 70, 0, T * 2 % 6.283, T * 2 % 6.283 + .8); ctx.stroke(); ctx.restore(); }
        const items = [['1 · SHOWCASES THE TECH', K.sh], ['2 · BUILDS THE BRAND', K.br]];
        items.forEach(([s, t0], i) => { const a = p(T, t0, .5, eo5); flip(ctx, a, 540, 840 + i * 120, () => { panel(ctx, 190, 790 + i * 120, 700, 96, 22); txt(ctx, s, 540, 852 + i * 120, 34, '#fff', 800); }); });
        if (T > K.br) live(ctx, T, 900, 1060, { yaw: .2, bob: 6, seed: 9 }, () => teslaLogo(ctx, 900, 1060, 90, { a: p(T, K.br + .1, .5), glow: .7 }));
        const ea = p(T, K.ex, .4) * (1 - p(T, K.sh - .1, .3)); pop(ctx, ea, 540, 870, () => pill(ctx, 540, 870, 'AN EXTRAORDINARY VEHICLE', { bg: 'rgba(30,33,40,.9)', size: 28, h: 64, stroke: 'rgba(255,255,255,.3)', font: MONO }));
      }, { cy: 1300 });
      title(ctx, p(T, A.another + .05, .45) * (1 - p(T, K.halo - .1, .3)), 'ONE MORE IDEA', 'WHY BUILD IT AT ALL?', { y: 640, size: 86 });
      title(ctx, p(T, K.halo, .45), 'HALO PRODUCT', '', { y: 640, size: 96, glow: '255,240,210' });
    });
  }

  // 20 FEW BUYERS, ENORMOUS ATTENTION (bars) -> that's exactly what this demo did
  { const K = { nv: c('never', A.even), att: c('attention', A.even), ex: c('exactly', A.even) };
    sfx.push({ t: K.att, k: 'riser', g: -20 });
    add(A.even, (ctx, T) => {
      studio(ctx, T, { hz: 1760, lanes: 0 });
      shot(ctx, T, A.even, () => {
        const base = 1600, ba = p(T, K.nv, .6), aa = kf(T, [[K.att - .1, 0], [K.att + 1.2, 1]], eo);
        const bars = [['BUYERS', 230, .08 * ba, '#9aa3ae'], ['ATTENTION', 700, aa, ORANGE]];
        bars.forEach(([lb, x, v, col], i) => { const hgt = 820 * v + 6; live(ctx, T, x + 110, base - hgt / 2, { yaw: .03, bob: 0, breathe: 0, seed: i }, () => {
          ctx.save(); ctx.shadowColor = i ? `rgba(${ORANGE_RGB},.6)` : 'transparent'; ctx.shadowBlur = 40; rr(ctx, x, base - hgt, 220, hgt, 18); const g = ctx.createLinearGradient(x, 0, x + 220, 0); g.addColorStop(0, col); g.addColorStop(.5, '#fff'); g.addColorStop(.55, col); g.addColorStop(1, col); ctx.globalAlpha *= .95; ctx.fillStyle = g; ctx.fill(); ctx.restore(); });
          txt(ctx, lb, x + 110, base + 70, 34, '#fff', 800); });
        txt(ctx, (aa * 100 | 0) > 0 ? '∞' : '', 810, base - 820 * aa - 30, 80, '#fff', 900);
        const ea = p(T, K.ex, .5, eback); stamp(ctx, ea, 540, 1820, 'DEMO = HEADLINES', { col: '#ffd479', size: 54, rot: -.05 });
        // camera flashes around the attention bar
        for (let i = 0; i < 6; i++) { const u = (T * .8 + hash(i, 2)) % 1; if (u > .12 || aa < .2) continue; glowDot(ctx, 640 + 340 * hash(i, 3), base - 800 * aa * hash(i, 4), 90, '255,255,255', 1 - u / .12); }
      }, { cy: 1300 });
      title(ctx, p(T, A.even + .05, .45) * (1 - p(T, K.att - .1, .3)), 'FEW WILL BUY ONE', 'BUT EVERYONE WATCHES', { y: 620, size: 80 });
      title(ctx, p(T, K.att, .45), 'ENORMOUS ATTENTION', '', { y: 620, size: 80 });
    });
  }

  // 21 NOT JUST ANOTHER ELECTRIC SPORTS CAR: three-item checklist with mini icons
  { const K = { el: c('electric', A.wasnt), aero: c('aerospace', A.wasnt), xt: c('extreme', A.wasnt), vc: c('vehicle', A.wasnt) };
    add(A.wasnt, (ctx, T) => {
      studio(ctx, T, { hz: 1720 });
      shot(ctx, T, A.wasnt, () => {
        const dk = p(T, K.aero, .6);
        live(ctx, T, 540, 1640, { yaw: .02, bob: 0, breathe: .003, seed: 23 }, () => { reflection(ctx, T, 540, 1720, .7, {}); roadster(ctx, T, 540, 1720, .7, { xray: dk * .8, nozzles: dk, tanks: dk * .5, seal: p(T, K.xt, .4), lowP: p(T, K.xt, .4) * .7 }); });
        const rows = [['AEROSPACE-INSPIRED PROPULSION', K.aero, CYAN_RGB], ['EXTREME DOWNFORCE', K.xt, ORANGE_RGB], ['VEHICLE CONTROL', K.vc, '125,255,176']];
        rows.forEach(([s, t0, rgb], i) => { const a = p(T, t0, .55, eo5), y = 880 + i * 170; flip(ctx, a, 540, y + 60, () => live(ctx, T, 540, y + 60, { yaw: .03, bob: 3, seed: i + 3 }, () => {
          panel(ctx, 110, y, 860, 130, 26); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 190, y + 65, 70, rgb, .9); ctx.restore();
          if (i === 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; plume(ctx, T, 190, y + 45, Math.PI / 2, 60, 18, 1); ctx.restore(); ctx.fillStyle = '#cfd6df'; rr(ctx, 172, y + 26, 36, 26, 6); ctx.fill(); }
          if (i === 1) arrow(ctx, 190, y + 25, 190, y + 105, { col: ORANGE, w: 12, glow: .5 });
          if (i === 2) { ctx.save(); ctx.translate(190, y + 65); ctx.rotate(.5 * Math.sin(T * 2)); ctx.strokeStyle = '#7dffb0'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.moveTo(-30, 0); ctx.lineTo(30, 0); ctx.stroke(); ctx.restore(); }
          txt(ctx, s, 260, y + 78, s.length > 22 ? 32 : 38, '#fff', 800, 'left'); check(ctx, 920, y + 65, 26, p(T, t0 + .2, .4)); })); });
      }, { cy: 1250 });
      title(ctx, p(T, A.wasnt + .05, .45), 'NOT JUST ANOTHER', 'ELECTRIC SPORTS CAR', { y: 620, size: 82 });
    });
  }

  // 22 FLYING CARS IN 5 YEARS? -> PROBABLY NOT (skyline, hovering car)
  { const K = { fc: c('flying cars', A.mean), five: c('five', A.mean), pn: c('probably', A.mean) };
    sfx.push({ t: K.pn, k: 'glitch', g: -15 });
    add(A.mean, (ctx, T) => {
      studio(ctx, T, { hz: 1700, poles: .4, strip: .5 });
      shot(ctx, T, A.mean, () => {
        // city skyline with lit windows
        for (let i = 0; i < 12; i++) { const x = -40 + i * 100, h = 260 + 420 * hash(i, 31), y = 1700 - h; ctx.fillStyle = `rgb(${16 + i % 3 * 4},${19 + i % 3 * 4},${26 + i % 3 * 5})`; ctx.fillRect(x, y, 92, h);
          for (let r = 0; r < h / 40 - 1; r++) for (let q = 0; q < 3; q++) if (hash(i * 40 + r * 3 + q, 32) > .55) { ctx.fillStyle = `rgba(255,214,140,${.35 + .3 * Math.sin(T * .8 + r + q + i)})`; ctx.fillRect(x + 12 + q * 26, y + 20 + r * 40, 14, 18); } }
        const hov = 1180 + 30 * Math.sin(T * 1.4), dr = p(T, K.pn, .9, eio), cy = lerp(hov, 1640, dr), x = 540 + 40 * Math.sin(T * .7);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; [0, 3].forEach(i => { const [px, py] = carPt(x, cy, .7, ...NOZ[i]); plume(ctx, T, px, py, Math.PI / 2, 220, 50, (1 - dr) * (.8 + .2 * Math.sin(T * 9 + i))); }); ctx.restore();
        live(ctx, T, x, cy - 80, { yaw: .02, bob: 0, seed: 24 }, () => roadster(ctx, T, x, cy, .7, { shadow: 0, spin: T * 4 }));
        const fa = p(T, K.five, .5, eback); pop(ctx, fa, 540, 860, () => live(ctx, T, 540, 860, { yaw: .1, bob: 5, seed: 2 }, () => pill(ctx, 540, 860, 'IN 5 YEARS?', { bg: 'rgba(47,123,255,.95)', size: 40, h: 84 })));
        stamp(ctx, p(T, K.pn, .45), 540, 1000, 'PROBABLY NOT.', { size: 76, rot: -.08 });
      }, { cy: 1250 });
      title(ctx, p(T, Math.min(K.fc, A.mean + .1), .45), 'FLYING CARS?', '', { y: 640, size: 96 });
    });
  }

  // 23 SHORT BURSTS ≠ SAFE, SUSTAINED FLIGHT (gas tank drains fast vs a long flight line)
  { const K = { safe: c('safe', A.bursts), av: c('aviation', A.bursts) };
    add(A.bursts, (ctx, T) => {
      studio(ctx, T, { hz: 1720 });
      shot(ctx, T, A.bursts, () => {
        const gas = clamp(1 - (T - A.bursts) / 2.2), hop = Math.max(0, Math.sin(clamp((T - A.bursts) / 2.2) * Math.PI)) * 160, x = 540, y = 1720 - hop;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; [0, 1, 2, 3].forEach(i => { const [px, py] = carPt(x, y, .75, ...NOZ[i]); plume(ctx, T, px, py, Math.PI / 2, 80 + hop * .8, 40, gas > .02 ? .9 : 0); }); ctx.restore();
        live(ctx, T, x, y - 80, { yaw: .02, bob: 0, seed: 25 }, () => { reflection(ctx, T, x, 1720, .75, {}, .1); roadster(ctx, T, x, y, .75, { shadow: 1 - hop / 200 }); });
        bin(ctx, p(T, A.bursts + .1, .4), () => { panel(ctx, 200, 1270, 680, 110, 26); ctx.save(); ctx.letterSpacing = '3px'; txt(ctx, 'COMPRESSED GAS LEFT', 540, 1310, 22, 'rgba(220,226,236,.75)', 700, 'center', MONO); ctx.restore();
          bar(ctx, 240, 1330, 600, 24, gas, gas < .25 ? RED : CYAN, 'rgba(255,255,255,.08)'); });
        // flight-time lines: bursts vs sustained
        const la = p(T, K.safe, .5); if (la > 0) { panel(ctx, 110, 740, 860, 480, 30);
          ctx.save(); ctx.globalAlpha *= la; txt(ctx, 'GAS BURSTS', 150, 820, 30, CYAN, 800, 'left'); ctx.strokeStyle = CYAN; ctx.lineWidth = 8; ctx.lineCap = 'round';
          [0, 1, 2].forEach(i => { ctx.beginPath(); ctx.moveTo(150 + i * 110, 900); ctx.lineTo(150 + i * 110 + 50 * la, 900); ctx.stroke(); });
          txt(ctx, 'AVIATION: HOURS', 150, 1060, 30, '#ffd479', 800, 'left'); ctx.strokeStyle = '#ffd479'; ctx.beginPath(); ctx.moveTo(150, 1140); ctx.lineTo(150 + 780 * kf(T, [[K.av, 0], [K.av + 1.4, 1]], eo), 1140); ctx.stroke(); ctx.restore(); }
      }, { cy: 1300 });
      title(ctx, p(T, A.bursts + .05, .45) * (1 - p(T, K.safe - .1, .3)), 'SHORT BURSTS', 'SECONDS OF GAS', { y: 620, col: CYAN, glow: CYAN_RGB });
      title(ctx, p(T, K.safe, .45), '≠ SAFE, SUSTAINED FLIGHT', '', { y: 620, size: 62 });
    });
  }

  // 24 REMARKABLE ENGINEERING: replay of the flip from the real clip
  { const K = { rem: c('remarkable', A.driving) }, c0 = 3.3;
    sfx.push({ t: K.rem, k: 'shimmer', g: -16 });
    add(A.driving, (ctx, T) => {
      studio(ctx, T, { hz: 1640 });
      const u = T - A.driving, ct = c0 + u * .85, cw = 1000, ch = cw * CLIP_H / CLIP_W, x = 40, y = 820;
      const z = lerp(1, 1.18, eio(clamp(u / 6))), sh = CLIP_H / z, sw = sh * cw / ch, sx = clamp(.62 * CLIP_W - sw / 2, 0, CLIP_W - sw), sy = clamp(.3 * CLIP_H - sh / 2, 0, CLIP_H - sh);
      const k = p(T, A.driving, .6, eo5);
      flip(ctx, k, 540, y + ch / 2, () => live(ctx, T, 540, y + ch / 2, { yaw: .02, bob: 4, breathe: .003, seed: 3 }, () => {
        clipCard(ctx, ct, x, y, cw, ch, { src: [sx, sy, sw, sh] });
        ctx.save(); ctx.letterSpacing = '4px'; pill(ctx, x + 24, y + 44, 'REAL FOOTAGE · REPLAY', { bg: 'rgba(10,12,16,.8)', size: 20, h: 44, align: 'left', font: MONO, stroke: 'rgba(255,255,255,.3)' }); ctx.restore();
        txt(ctx, '0.85×', x + cw - 30, y + ch - 26, 24, 'rgba(255,255,255,.85)', 700, 'right', MONO); }));
      const pitch = kf(ct, [[3.3, 150], [4.3, 170], [5.6, 300], [6.6, 360], [8, 360]]);
      dial(ctx, T, 250, 1640, 90, 'PITCH', String(Math.round(pitch % 360)) + '°', (pitch % 360) / 360, { a: p(T, A.driving + .3, .5) });
      dial(ctx, T, 830, 1640, 90, 'THRUST', 'GAS', .5 + .5 * Math.sin(T * 3), { rgb: CYAN_RGB, a: p(T, A.driving + .4, .5) });
      title(ctx, p(T, K.rem, .45), 'REMARKABLE ENGINEERING', '', { y: 640, size: 70 });
    });
  }

  // 25 SAME PHYSICS AS A BALLOON: balloon crosses the room beside the car
  { const K = { ph: c('physics', A.comes), bf: c('balloon flying', A.comes), room: c('room', A.comes) };
    sfx.push({ t: K.bf, k: 'swoosh', g: -16 });
    add(A.comes, (ctx, T) => {
      studio(ctx, T, { hz: 1560 });
      shot(ctx, T, A.comes, () => {
        live(ctx, T, 540, 1450, { yaw: .02, bob: 0, breathe: .004, seed: 26 }, () => { reflection(ctx, T, 540, 1560, .9, {}); roadster(ctx, T, 540, 1560, .9, { xray: .5, nozzles: .8 }); });
        const u = clamp((T - K.bf + .2) / 2.4), bx = lerp(-150, 1250, eio(u)), by = 1000 - 120 * Math.sin(u * Math.PI) + 30 * Math.sin(T * 6);
        if (u > 0 && u < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; plume(ctx, T, bx - 10, by + 100, Math.PI * .93, 260, 50, .9); ctx.restore(); balloon(ctx, T, bx, by, 90, { knot: 0, open: 1, rot: 1.2 }); }
        const ea = p(T, K.ph, .5, eback); pop(ctx, ea, 540, 830, () => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 540, 830, 120, CYAN_RGB, .6); ctx.restore(); txt(ctx, '🎈  =  🚗', 540, 860, 80, '#fff', 800); });
      }, { cy: 1250 });
      title(ctx, p(T, K.ph, .45), 'SAME PHYSICS AS A BALLOON', '', { y: 640, size: 60 });
    });
  }

  // 26 ENDING: the Roadster's centre screen boots a "launch sequence" that compiles this video's code, then "guide" is posted
  // with the launch button (thrusters fire), and the screen flips into the bio card.
  { const K = { crazy: c('crazy', A.crazy), code: c('code', A.crazy), comment: c('comment', A.crazy), guide: c('guide', A.crazy), yt: c('youtube', A.crazy), link: c('link', A.crazy), bio: c('bio', A.crazy) };
    const cta = Math.min(K.link, K.bio), post = K.guide + .45, codeEnd = Math.max(K.code + .2, K.comment - .25);
    sfx.push({ t: A.crazy + .05, k: 'riser', g: -17 }, { t: K.code + .15, k: 'success', g: -14 }, { t: post, k: 'click', g: -11 }, { t: K.yt, k: 'swoosh', g: -16 }, { t: cta + .3, k: 'click', g: -10 });
    const CODE = [["import { roadster } from './roadster.js'", '#7fd8ff'], ['tank.fill({ gas: "compressed" })', '#9ee6b0'], ['thrusters(10).fire(DOWN)', '#6fe6ff'], ['// action = reaction', '#7a8597'],
      ['fans.pull(air)  // low pressure', '#c9bfff'], ['car.grip = downforce', '#ffb07a'], ['flip({ deg: 360 })', '#ffd479'], ['render(9/16, "Tesla Roadster")', '#ff9c8a']];
    const nch = CODE.reduce((a, [l]) => a + l.length, 0);
    add(A.crazy, (ctx, T) => {
      studio(ctx, T, { hz: 1720, poles: .7 });
      const sw2 = p(T, K.yt - .1, .7, eio); // screen slides up for the bio card
      shot(ctx, T, A.crazy, () => {
        // dashboard: car-style floating centre touchscreen + glowing round LAUNCH button
        const sx = 90, sy = lerp(640, 600, sw2), sw = 900, sh = 640, k = p(T, A.crazy, .6, eo5);
        flip(ctx, k, 540, sy + sh / 2, () => live(ctx, T, 540, sy + sh / 2, { yaw: .025, bob: 4, breathe: .003, seed: 4 }, () => {
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.75)'; ctx.shadowBlur = 80; ctx.shadowOffsetY = 34; rr(ctx, sx - 16, sy - 16, sw + 32, sh + 32, 40); ctx.fillStyle = '#0b0c0f'; ctx.fill(); ctx.restore();
          rr(ctx, sx - 16, sy - 16, sw + 32, sh + 32, 40); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2; ctx.stroke();
          ctx.save(); rr(ctx, sx, sy, sw, sh, 26); ctx.clip(); const g = ctx.createLinearGradient(0, sy, 0, sy + sh); g.addColorStop(0, '#11141a'); g.addColorStop(1, '#07080b'); ctx.fillStyle = g; ctx.fillRect(sx, sy, sw, sh);
          // status bar with the real frame number
          teslaLogo(ctx, sx + 46, sy + 40, 40); ctx.save(); ctx.letterSpacing = '3px'; txt(ctx, 'LAUNCH SEQUENCE', sx + 80, sy + 50, 22, 'rgba(220,226,236,.8)', 700, 'left', MONO);
          txt(ctx, 'FRAME ' + String(Math.floor(T * 30)).padStart(4, '0'), sx + sw - 30, sy + 50, 22, CYAN, 700, 'right', MONO); ctx.restore();
          ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(sx, sy + 76, sw, 2);
          const cm = p(T, K.comment - .15, .45, eio), bio = sw2;
          if (cm < 1) { ctx.save(); ctx.globalAlpha *= 1 - cm;
            const shown = nch * clamp((T - A.crazy - .3) / Math.max(.4, codeEnd - A.crazy - .3)); let left = shown;
            CODE.forEach(([l, col], i) => { if (left <= 0) return; const n = Math.min(l.length, Math.floor(left)); left -= l.length;
              txt(ctx, String(i + 1).padStart(2, ' '), sx + 30, sy + 130 + i * 50, 22, 'rgba(140,150,165,.6)', 600, 'left', MONO); txt(ctx, l.slice(0, n), sx + 80, sy + 130 + i * 50, 25, col, 600, 'left', MONO);
              if (n < l.length && Math.sin(T * 10) > 0) { ctx.fillStyle = '#fff'; ctx.fillRect(sx + 82 + tw(ctx, l.slice(0, n), 25, 600, MONO), sy + 108 + i * 50, 3, 28); } });
            const pr = clamp(shown / nch); bar(ctx, sx + 30, sy + sh - 60, sw - 260, 16, pr, pr >= 1 ? GREEN : CYAN, 'rgba(255,255,255,.08)');
            txt(ctx, pr >= 1 ? '100% CODE ✓' : Math.floor(pr * 100) + '%', sx + sw - 30, sy + sh - 45, 26, pr >= 1 ? '#7dffb0' : '#fff', 800, 'right', MONO); ctx.restore(); }
          if (cm > 0 && bio < 1) { ctx.save(); ctx.globalAlpha *= cm * (1 - bio);
            ctx.save(); ctx.letterSpacing = '3px'; txt(ctx, 'COMMENTS', sx + 40, sy + 140, 24, 'rgba(220,226,236,.75)', 700, 'left', MONO); ctx.restore();
            rr(ctx, sx + 40, sy + 190, sw - 80, 96, 48); ctx.fillStyle = '#1b2029'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 2; ctx.stroke();
            const g2 = typed('guide', T, K.guide - .15, K.guide + .2); txt(ctx, g2 || 'Add a comment…', sx + 80, sy + 252, 40, g2 ? '#fff' : '#7a8290', g2 ? 800 : 500, 'left');
            if (T < post && g2 && Math.sin(T * 9) > 0) { ctx.fillStyle = '#fff'; ctx.fillRect(sx + 84 + tw(ctx, g2, 40, 800), sy + 218, 4, 42); }
            const ps = p(T, post, .4, eback); if (ps > 0) pop(ctx, ps, sx + sw / 2, sy + 400, () => pill(ctx, sx + sw / 2, sy + 400, 'guide  ✓ posted', { bg: GREEN, size: 34, h: 74 }));
            ctx.restore(); }
          if (bio > 0) { ctx.save(); ctx.globalAlpha *= bio;
            avatar(ctx, T, sx + 150, sy + 230, 82, named); if (named) txt(ctx, 'agentsoly', sx + 270, sy + 225, 58, '#fff', 900, 'left');
            txt(ctx, 'Explainers built 100% in code', sx + 270, sy + (named ? 280 : 245), 30, '#9aa0aa', 600, 'left');
            pill(ctx, sx + 60, sy + 410, '▶ YouTube', { bg: '#e62117', size: 32, h: 72, align: 'left' }); pill(ctx, sx + 320, sy + 410, '♪ TikTok', { bg: '#15161b', size: 32, h: 72, align: 'left', stroke: 'rgba(255,255,255,.35)' });
            const hl = p(T, cta + .3, .35); rr(ctx, sx + 40, sy + 490, sw - 80, 92, 20); ctx.fillStyle = `rgba(47,123,255,${.15 + .35 * hl})`; ctx.fill(); ctx.strokeStyle = `rgba(90,150,255,${.4 + .6 * hl})`; ctx.lineWidth = 3; ctx.stroke();
            txt(ctx, '🔗  Link in bio · full guide', sx + 80, sy + 550, 38, '#cfe0ff', 800, 'left'); ctx.restore(); }
          ctx.restore();
        }));
        // the car below the screen + LAUNCH button: pressing it posts the comment and fires the thrusters
        const by2 = 1500, fire = clamp(1 - (T - post) / 1.2) * (T > post ? 1 : 0), lift = 60 * Math.sin(clamp((T - post) / 1.4) * Math.PI);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; [0, 1, 2, 3].forEach(i => { const [px, py] = carPt(540, 1720 - lift, .62, ...NOZ[i]); plume(ctx, T, px, py, Math.PI / 2, 90 + lift, 40, fire); }); ctx.restore();
        live(ctx, T, 540, 1640, { yaw: .02, bob: 0, seed: 27 }, () => { reflection(ctx, T, 540, 1720, .62, {}, .12); roadster(ctx, T, 540, 1720 - lift, .62, { spin: -T * 3, nozzles: fire, xray: fire * .4 }); });
        const bp = clamp(1 - Math.abs(T - post) / .15), ba = p(T, K.comment - .3, .5, eback) * (1 - sw2);
        pop(ctx, ba, 880, by2 - 120, () => live(ctx, T, 880, by2 - 120, { yaw: .05, bob: 4, seed: 6 }, () => { ctx.save(); ctx.translate(880, by2 - 120); ctx.scale(1 - .08 * bp, 1 - .08 * bp);
          ctx.shadowColor = `rgba(${RED_RGB},${.6 + .4 * Math.sin(T * 4)})`; ctx.shadowBlur = 40; const g = ctx.createRadialGradient(-20, -24, 6, 0, 0, 84); g.addColorStop(0, '#ff8a70'); g.addColorStop(.6, '#e8321c'); g.addColorStop(1, '#7a130a');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 84, 0, 7); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 4; ctx.stroke(); txt(ctx, 'LAUNCH', 0, 10, 28, '#fff', 900); ctx.restore(); }));
        if (T > K.guide - .4 && T < post + .7 && ba > .5) { const cx = kf(T, [[K.guide - .4, 1050], [post - .05, 885]]), cy = kf(T, [[K.guide - .4, 1700], [post - .05, by2 - 115]]); cursor(ctx, cx, cy, bp, clamp((post + .7 - T) / .3)); clickRing(ctx, 880, by2 - 120, (T - post) / .5, '255,90,60'); }
        // cursor taps the bio link
        const ly = lerp(640, 600, sw2) + 536; if (T > cta - .4) { const cx = kf(T, [[cta - .4, 980], [cta + .25, 700]]), cy = kf(T, [[cta - .4, 1500], [cta + .25, ly]]); cursor(ctx, cx, cy, clamp(1 - Math.abs(T - cta - .3) / .1)); clickRing(ctx, 700, ly, (T - cta - .3) / .5); }
        const st = p(T, K.code, .5, eback) * (1 - p(T, K.comment - .2, .3)); stamp(ctx, st, 540, 1380, 'MADE WITH CODE', { col: '#7dffb0', size: 60, rot: -.05 });
      }, { cy: 1100, push: .03 });
    });
  }

  list.forEach((sc, i) => sc.end = list[i + 1] ? list[i + 1].start : 1e9);
  // sound hygiene: whoosh-type cues are free; any other small hit must sit >= 1.5 s from the previous one
  const FREE = new Set(['whoosh', 'swoosh', 'sweep', 'riser']), out = []; let last = -9;
  for (const q of sfx.filter(q => !['pop', 'drip', 'kw', 'tick', 'type'].includes(q.k)).sort((a, b) => a.t - b.t)) {
    if (FREE.has(q.k)) { out.push(q); continue; } if (q.t - last < 1.5) continue; out.push(q); last = q.t; }
  return { scenes: list, sfx: out };
}
