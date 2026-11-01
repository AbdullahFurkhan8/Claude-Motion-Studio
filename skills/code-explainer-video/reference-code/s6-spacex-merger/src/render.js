// Deterministic frame renderer: serves src/ on localhost, calls window.renderFrame(t) per frame, pipes JPEGs to FFmpeg.
// node src/render.js --v new --fps 30 [--scale 1] --out renders --name "Name v1" [--audio mix.wav] [--jpg  (write frames instead)]
import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const src = path.dirname(fileURLToPath(import.meta.url)), args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : args[i + 1]; };
const v = opt('v', 'new'), fps = +opt('fps', 30), scale = +opt('scale', 1), jpg = args.includes('--jpg');
const { DURATION } = await import(`./timing_${v}.js`);
const from = +opt('from', 0), to = +opt('to', DURATION), count = Math.ceil((to - from) * fps - 1e-6);
const out = path.resolve(opt('out', 'cache/frames')), dest = path.join(out, opt('name', 'Preview v1') + '.mp4'), audio = opt('audio');
if (!jpg && existsSync(dest)) throw Error('Output exists; use a new version name');
await mkdir(out, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer(async (q, r) => {
  const f = path.join(src, path.normalize(decodeURIComponent(new URL(q.url, 'http://x').pathname)));
  if (!f.startsWith(src) || !existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(await readFile(f));
});
await new Promise(ok => server.listen(0, '127.0.0.1', ok));
const browser = await chromium.launch({ executablePath: process.env.MVD_CHROMIUM || undefined });
let ff;
try {
  const page = await browser.newPage();
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html?scale=${scale}&v=${v}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  if (!jpg) {
    const a = ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', 'pipe:0'];
    if (audio) a.push('-ss', String(from), '-t', String(to - from), '-i', path.resolve(audio), '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k');
    a.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-t', String(count / fps), dest);
    ff = spawn(process.env.MVD_FFMPEG || 'ffmpeg', a, { stdio: ['pipe', 'inherit', 'inherit'] });
  }
  for (let i = 0; i < count; i++) {
    const data = await page.evaluate(t => (window.renderFrame(t), window.grab('image/jpeg')), from + i / fps);
    const buf = Buffer.from(data.slice(data.indexOf(',') + 1), 'base64');
    if (jpg) await writeFile(path.join(out, String(i).padStart(5, '0') + '.jpg'), buf);
    else if (!ff.stdin.write(buf)) await new Promise(ok => ff.stdin.once('drain', ok));
  }
  if (ff) { ff.stdin.end(); await new Promise((ok, no) => ff.on('close', c => c ? no(Error('ffmpeg ' + c)) : ok())); }
  console.log(`Rendered ${count} frames${jpg ? '' : ' -> ' + dest}`);
} finally { await browser.close(); server.close(); }
