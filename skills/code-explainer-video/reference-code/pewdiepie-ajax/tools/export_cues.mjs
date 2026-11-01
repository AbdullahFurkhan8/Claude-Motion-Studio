// node tools/export_cues.mjs new -> cache/cues_new.json (scene SFX + keyword pops), same cue logic as the renderer
// Versions starting with "hi" use the scenes' LANG.hi cue aliases and keywords (translated voice).
import { writeFileSync, mkdirSync } from 'node:fs';
const v = process.argv[2] || 'new';
const { WORDS, CHUNKS, DURATION } = await import(`../src/timing_${v}.js`);
const scenesMod = await import('../src/scenes.js'), { makeScenes } = scenesMod;
const { makeCue, keywordTimes, setKeywords } = await import('../src/captions.js');
const lang = v.startsWith('hi') ? 'hi' : 'en', L = (scenesMod.LANG || {})[lang] || {};
if (L.keywords || scenesMod.KEYWORDS) setKeywords(L.keywords || scenesMod.KEYWORDS, L.emoji || scenesMod.EMOJI); // per-project keyword list
const { sfx } = makeScenes(makeCue(WORDS, L.alias), lang);
const pops = scenesMod.CAPTION_SFX === false ? [] : keywordTimes(WORDS, CHUNKS).map(t => ({ t, k: 'kw', g: -25 }));
const cues = [...sfx, ...pops].sort((a, b) => a.t - b.t);
mkdirSync('cache', { recursive: true }); writeFileSync(`cache/cues_${v}.json`, JSON.stringify({ DURATION, cues }, null, 1));
console.log(v, cues.length, 'cues');
