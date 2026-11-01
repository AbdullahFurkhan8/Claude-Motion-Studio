// lists every cue call with the scene window it should belong to (calls come in scene order after the A table)
const v = process.argv[2] || 'en';
const { WORDS, DURATION } = await import(`../src/timing_${v}.js`);
const sm = await import('../src/scenes.js'), { makeCue } = await import('../src/captions.js');
const lang = v.startsWith('hi') ? 'hi' : 'en', L = (sm.LANG || {})[lang] || {};
const base = makeCue(WORDS, L.alias), calls = [];
const c = (ph, a = 0) => { const t = base(ph, a); calls.push([ph, t]); return t; };
const { scenes } = sm.makeScenes(c, lang);
const starts = scenes.map(s => s.start + .1); let si = 0;
const rows = calls.slice(28);
// group: a call belongs to scene si; move on when the call time passes into a later scene's window and is >= that start
for (const [ph, t] of rows) {
  while (si + 1 < scenes.length && t >= starts[si + 1] - .2 && t >= scenes[si].end - 0.2 && false) si++;
  console.log(ph.padEnd(22), t.toFixed(2));
}
