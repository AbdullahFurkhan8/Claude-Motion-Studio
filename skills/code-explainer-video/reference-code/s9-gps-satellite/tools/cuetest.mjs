// node tools/cuetest.mjs en|hi -> lists every cue that cannot be found (and keeps going)
const v = process.argv[2] || 'en';
const { WORDS } = await import(`../src/timing_${v}.js`);
const sm = await import('../src/scenes.js'), { makeCue, setKeywords } = await import('../src/captions.js');
const L = (sm.LANG || {})[v] || {}; setKeywords(L.keywords || sm.KEYWORDS, L.emoji || sm.EMOJI);
const base = makeCue(WORDS, L.alias); const miss = [];
const c = (ph, a = 0) => { try { return base(ph, a); } catch (e) { miss.push(e.message); return a + .1; } };
sm.makeScenes(c, v);
console.log(v, miss.length ? miss.join('\n') : 'all cues ok');
