// node tools/check_cues.mjs en|hi -> prints each scene's window (flags nothing; just lists)
const v = process.argv[2] || 'en';
const { WORDS, DURATION } = await import(`../src/timing_${v}.js`);
const sm = await import('../src/scenes.js'), { makeCue, setKeywords } = await import('../src/captions.js');
const lang = v.startsWith('hi') ? 'hi' : 'en', L = (sm.LANG || {})[lang] || {};
const { scenes, sfx } = sm.makeScenes(makeCue(WORDS, L.alias), lang);
scenes.forEach((s, i) => console.log(i + 1, s.start.toFixed(2), (Math.min(s.end, DURATION) - s.start).toFixed(2)));
console.log('sfx', sfx.length, 'dur', DURATION);
