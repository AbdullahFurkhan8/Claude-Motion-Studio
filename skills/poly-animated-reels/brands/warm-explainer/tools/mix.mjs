// Voice + quiet ambience + sparse SFX, mastered to -14 LUFS.
// Usage: node tools/mix.mjs <video folder> [--lang en] [--sfx <sound-effects folder>]   writes mix_<lang>.wav
// Run render.mjs once first (stills are enough): it writes cues_<lang>.json.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, existsSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), a = process.argv.slice(2), ep = path.resolve(a[0]);
const opt = (k, d) => { const i = a.indexOf('--' + k); return i < 0 ? d : a[i + 1]; };
const lang = opt('lang', 'en'), lib = path.resolve(opt('sfx', path.join(root, '../../../../sound-effects')));
const meta = JSON.parse(readFileSync(path.join(ep, `cues_${lang}.json`))), brand = JSON.parse(readFileSync(path.join(root, 'brand/audio.json')));
const pool = { ui: ['Pop/Sweet UI Open.wav', 'Pop/Premium And Smooth Pop.wav', 'Pop/Smooth Pop.wav'], cut: ['Whooshes/Simple Whoosh 2.wav', 'Whooshes/Cinematic Low Whoosh.wav', 'Whooshes/Cinematic Mediam Whoosh.wav'], end: ['Risers/Smooth Riser.wav'] };
const gain = { ui: .35, cut: .22, end: .3 }, n = {}, inputs = ['-i', path.join(ep, `voice_${lang}.wav`), '-f', 'lavfi', '-t', String(meta.total), '-i', brand.ambience], parts = [];
let idx = 2, labels = '[v][bed]';
for (const c of meta.cues) {
  const list = pool[c.kind]; n[c.kind] = (n[c.kind] || 0) + 1; const f = path.join(lib, list[n[c.kind] % list.length]);
  if (!existsSync(f)) { console.log('skipping missing sfx', f); continue; }
  inputs.push('-i', f); parts.push(`[${idx}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${gain[c.kind]},atrim=0:1.6,afade=t=out:st=1.2:d=0.4,adelay=${Math.round(c.t * 1000)}:all=1[s${idx}]`); labels += `[s${idx}]`; idx++;
}
const fc = [`[0:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=${meta.total}[v]`, `[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=${brand.bedGain}[bed]`, ...parts, `${labels}amix=inputs=${idx}:normalize=0:duration=first[m]`].join(';');
const tmp = path.join(ep, `_premix_${lang}.wav`), dest = path.join(ep, `mix_${lang}.wav`);
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', fc, '-map', '[m]', '-t', String(meta.total), tmp], { stdio: 'inherit' });
const measure = f => { const e = spawnSync('ffmpeg', ['-hide_banner', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr; return +e.slice(e.lastIndexOf('Integrated loudness')).match(/I:\s+(-?[\d.]+)/)[1]; };
let g = -14 - measure(tmp);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-af', `volume=${g.toFixed(2)}dB,alimiter=limit=0.89:level=false`, dest], { stdio: 'inherit' });
for (let i = 0; i < 3; i++) {
  const l = measure(dest); if (Math.abs(l + 14) < .1) break; g += -14 - l;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-af', `volume=${g.toFixed(2)}dB,alimiter=limit=0.89:level=false`, dest], { stdio: 'inherit' });
}
unlinkSync(tmp);
console.log(dest, measure(dest), 'LUFS,', meta.cues.length, 'sfx cues');
