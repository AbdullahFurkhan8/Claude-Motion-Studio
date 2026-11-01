// Renders a video folder. Run from the skill folder:
//   node tools/render.mjs --ep ../videos/<slug> [--lang en] [--fps 30] [--name "Title v1"] [--audio mix.wav]
//   node tools/render.mjs --ep ../videos/<slug> --stills 1,4,9 --scale .4     writes a contact sheet to <ep>/preview/
import http from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : args[i + 1]; };
const ep = path.resolve(opt('ep')), lang = opt('lang', 'en'), fps = +opt('fps', 30), scale = +opt('scale', 1), stills = opt('stills'), audio = opt('audio');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = http.createServer(async (q, r) => {
  const u = decodeURIComponent(new URL(q.url, 'http://x').pathname), base = u.startsWith('/ep/') ? ep : root, rel = u.startsWith('/ep/') ? u.slice(4) : u, f = path.join(base, path.normalize(rel));
  if (!f.startsWith(base) || !existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(await readFile(f));
});
await new Promise(ok => server.listen(0, '127.0.0.1', ok));
// Use the newest full Chromium Playwright has, because the GPU flags need it. MVD_CHROMIUM overrides.
function chrome() {
  if (process.env.MVD_CHROMIUM) return process.env.MVD_CHROMIUM;
  const d = path.join(os.homedir(), 'AppData/Local/ms-playwright');
  if (!existsSync(d)) return undefined;
  const c = readdirSync(d).filter(n => /^chromium-\d+/.test(n)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1])[0];
  const p = c && path.join(d, c, 'chrome-win64/chrome.exe'); return p && existsSync(p) ? p : undefined;
}
const browser = await chromium.launch({ executablePath: chrome(), args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage();
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  page.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) console.error('CONSOLE', m.text()); });
  await page.goto(`http://127.0.0.1:${server.address().port}/engine/index.html?scale=${scale}&lang=${lang}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const meta = await page.evaluate(() => window.__meta);
  await writeFile(path.join(ep, `cues_${lang}.json`), JSON.stringify(meta, null, 1));
  console.log(`${meta.total.toFixed(1)} s, ${meta.shots} shots, ${meta.panels} panels`);
  if (stills) {
    const dir = path.join(ep, 'preview'); await mkdir(dir, { recursive: true });
    const ts = stills === 'auto' ? Array.from({ length: 12 }, (_, i) => meta.total * (i + .5) / 12) : stills.split(',').map(Number);
    for (let i = 0; i < ts.length; i++) {
      const d = await page.evaluate(t => (window.renderFrame(t), window.grab()), ts[i]);
      await writeFile(path.join(dir, `s${String(i).padStart(2, '0')}.jpg`), Buffer.from(d.slice(d.indexOf(',') + 1), 'base64'));
    }
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(dir, 's%02d.jpg'), '-vf', `tile=${Math.min(6, ts.length)}x${Math.ceil(ts.length / 6)}`, '-frames:v', '1', path.join(dir, 'sheet.jpg')]);
    console.log(path.join(dir, 'sheet.jpg'));
  } else {
    const from = +opt('from', 0), to = +opt('to', meta.total), count = Math.ceil((to - from) * fps), dest = path.join(ep, 'renders', opt('name', `${path.basename(ep)} ${lang} v1`) + '.mp4');
    await mkdir(path.dirname(dest), { recursive: true });
    if (existsSync(dest)) throw Error('Output exists, use a new version name: ' + dest);
    const a = ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', 'pipe:0'];
    if (audio) a.push('-i', path.resolve(audio), '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k');
    a.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-t', String(count / fps), dest);
    const ff = spawn('ffmpeg', a, { stdio: ['pipe', 'inherit', 'inherit'] }), t0 = Date.now();
    for (let i = 0; i < count; i++) {
      const d = await page.evaluate(t => (window.renderFrame(t), window.grab()), from + i / fps);
      if (!ff.stdin.write(Buffer.from(d.slice(d.indexOf(',') + 1), 'base64'))) await new Promise(ok => ff.stdin.once('drain', ok));
      if (i % 150 === 0) console.log(`${i}/${count} frames, ${(i / ((Date.now() - t0) / 1000 + .01)).toFixed(1)} fps`);
    }
    ff.stdin.end(); await new Promise((ok, no) => ff.on('close', c => c ? no(Error('ffmpeg ' + c)) : ok()));
    console.log('Done:', dest);
  }
} finally { await browser.close(); server.close(); }
