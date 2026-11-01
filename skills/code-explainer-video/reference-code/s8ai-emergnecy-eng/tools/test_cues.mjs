// node tools/test_cues.mjs en|hi -> builds the scenes (catches missing cue phrases) and prints scene starts
const v = process.argv[2] || 'en';
const { WORDS, DURATION } = await import(`../src/timing_${v}.js`); const { makeCue } = await import('../src/captions.js'); const sm = await import('../src/scenes.js');
const L = (sm.LANG || {})[v.startsWith('hi') ? 'hi' : 'en'] || {};
const { scenes } = sm.makeScenes(makeCue(WORDS, L.alias), v.startsWith('hi') ? 'hi' : 'en');
console.log(v, DURATION, scenes.map(s => s.start.toFixed(2)).join(' '));
