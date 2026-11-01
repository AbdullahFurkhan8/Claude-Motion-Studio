// UI panels in 2D canvas. drawPanel(ctx, panel, p, theme, w, h, t): p runs 0..1 over the time the panel is on screen.
// Types: browser, chat, code, calendar, notify, big, form, error, checklist, grid. Any type can sit inside `step`.
import { clamp, eo, hash } from './lowpoly.js';
export function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
export function wrap(c, text, maxW) {
  const out = []; let cur = '';
  for (const w of String(text).split(' ')) { const n = cur ? cur + ' ' + w : w; if (c.measureText(n).width > maxW && cur) { out.push(cur); cur = w; } else cur = n; }
  if (cur) out.push(cur); return out;
}
const txt = (c, s, x, y, font, col, align = 'left') => { c.font = font; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'alphabetic'; c.fillText(s, x, y); };
function chrome(c, w, T, label, right) {
  c.fillStyle = T.bar; c.fillRect(0, 0, w, 62);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((k, i) => { c.fillStyle = k; c.beginPath(); c.arc(32 + i * 26, 31, 8, 0, 7); c.fill(); });
  rr(c, 124, 13, w - 300, 36, 18); c.fillStyle = T.field; c.fill();
  txt(c, label || '', 146, 38, `500 22px ${T.body}`, T.dim);
  if (right) txt(c, right, w - 24, 38, `600 22px ${T.body}`, T.accent, 'right');
}
function cursor(c, x, y) {
  c.save(); c.translate(x, y); c.scale(1.5, 1.5); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 8;
  c.fillStyle = '#fff'; c.strokeStyle = '#111'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 22); c.lineTo(6, 17); c.lineTo(10, 26); c.lineTo(14, 24); c.lineTo(10, 15); c.lineTo(17, 15); c.closePath(); c.fill(); c.stroke(); c.restore();
}
const sub = (p, a, b) => clamp((p - a) / (b - a));
const P = {
  browser(c, d, p, T, w, h) {
    chrome(c, w, T, d.url, d.badge);
    let y = 118; if (d.title) { txt(c, d.title, 44, y, `700 42px ${T.head}`, T.fg); y += 26; }
    if (d.text) { c.font = `500 28px ${T.body}`; for (const l of wrap(c, d.text, w - 88)) { y += 40; txt(c, l, 44, y, `500 28px ${T.body}`, T.dim); } y += 16; }
    const items = d.items || [], n = items.length, rowH = Math.min(112, (h - y - 26) / Math.max(1, n));
    items.forEach((it, i) => {
      const k = eo(sub(p, .08 + i * .78 / n, .2 + i * .78 / n)); if (k <= 0) return;
      c.save(); c.globalAlpha = k; c.translate(0, (1 - k) * 22);
      rr(c, 36, y + 8, w - 72, rowH - 14, 14); c.fillStyle = it.hot ? T.hot : T.card; c.fill();
      if (it.hot) { c.strokeStyle = T.accent; c.lineWidth = 3; c.stroke(); }
      txt(c, it.text, 62, y + rowH / 2 + (it.sub ? -3 : 9), `600 29px ${T.body}`, T.fg);
      if (it.sub) txt(c, it.sub, 62, y + rowH / 2 + 31, `500 22px ${T.body}`, T.dim);
      if (it.tag) { c.font = `700 22px ${T.body}`; const tw = c.measureText(it.tag).width + 30; rr(c, w - 56 - tw, y + rowH / 2 - 19, tw, 40, 10); c.fillStyle = T.accent; c.fill(); txt(c, it.tag, w - 56 - tw / 2, y + rowH / 2 + 8, `700 22px ${T.body}`, T.onAccent, 'center'); }
      c.restore(); y += rowH;
    });
    d._used = y + 24;
    if (d.cursor !== false && n) { const f = p * n, i = Math.min(n - 1, Math.floor(f)), ry = (d.title ? 144 : 118) + rowH * (i + .5 + Math.sin(f * 2) * .1); cursor(c, w * (.62 + .2 * hash(i)) + Math.sin(p * 5) * 10, ry); }
  },
  chat(c, d, p, T, w, h) {
    chrome(c, w, T, d.title || 'New chat', d.badge);
    let y = 96; const msgs = d.msgs || [], n = msgs.length;
    msgs.forEach((m, i) => {
      const a = .05 + i * .85 / n, k = sub(p, a, a + .08); if (k <= 0) return;
      const me = m.from === 'me', bw = w * .76; c.font = `500 30px ${T.body}`;
      const chars = me ? m.text.length : Math.ceil(m.text.length * sub(p, a, a + .85 / n * .9));
      const lines = wrap(c, m.text, bw - 48), hh = lines.length * 42 + 34;
      c.save(); c.globalAlpha = eo(k);
      if (me) { const longest = Math.max(...lines.map(l => c.measureText(l).width)) + 48; rr(c, w - 36 - longest, y, longest, hh, 20); c.fillStyle = T.card; c.fill(); }
      let left = chars;
      lines.forEach((l, j) => { const s = l.slice(0, Math.max(0, left)); left -= l.length + 1; const x = me ? w - 36 - Math.max(...lines.map(q => c.measureText(q).width)) - 24 : 44; txt(c, s, x, y + 44 + j * 42, `500 30px ${T.body}`, T.fg); });
      c.restore(); y += hh + 22;
    });
    if (d.alert && p > .62) { const k = eo(sub(p, .62, .72)); c.globalAlpha = k; rr(c, 36, h - 136, w - 72, 100, 16); c.fillStyle = '#7a2230'; c.fill(); txt(c, d.alert, 62, h - 76, `700 30px ${T.body}`, '#ffd9dd'); c.globalAlpha = 1; }
  },
  code(c, d, p, T, w, h) {
    c.fillStyle = '#0f131b'; c.fillRect(0, 0, w, h);
    if (d.badge) { c.font = `700 32px ${T.body}`; const tw = c.measureText(d.badge).width + 56; rr(c, (w - tw) / 2, 26, tw, 64, 32); c.fillStyle = '#1c1f26'; c.fill(); c.strokeStyle = T.accent; c.lineWidth = 3; c.stroke(); txt(c, d.badge, w / 2, 70, `700 32px ${T.body}`, '#fff', 'center'); }
    const files = d.files || []; files.forEach((f, i) => {
      const k = eo(sub(p, i * .8 / files.length, i * .8 / files.length + .1)); if (k <= 0) return;
      const x = 40 + i % 2 * 180 + i * 18, y = 120 + i * (h - 200) / files.length * .92, ww = w - 260, hh = 76 + f.lines.length * 42;
      c.save(); c.globalAlpha = k; c.translate(0, (1 - k) * 40);
      rr(c, x, y, ww, hh, 14); c.fillStyle = '#141a24'; c.fill(); c.strokeStyle = T.accent; c.lineWidth = 3; c.stroke();
      ['#ff5f57', '#febc2e', '#28c840'].forEach((q, j) => { c.fillStyle = q; c.beginPath(); c.arc(x + 26 + j * 22, y + 28, 7, 0, 7); c.fill(); });
      txt(c, f.name, x + 104, y + 36, `600 24px Consolas, monospace`, '#aab4c4');
      f.lines.forEach((l, j) => txt(c, l, x + 26, y + 90 + j * 42, `500 28px Consolas, monospace`, j % 2 ? '#d7dde8' : '#f2c97d'));
      c.restore();
    });
  },
  calendar(c, d, p, T, w, h) {
    chrome(c, w, T, d.url || 'calendar', d.badge);
    txt(c, d.title || 'Calendar', 44, 116, `700 38px ${T.head}`, T.fg);
    const cols = d.cols || 7, rows = d.rows || 8, ox = 190, oy = 150, cw = (w - ox - 36) / cols, ch = (h - oy - 30) / rows, total = (d.fill ?? cols * rows) * eo(sub(p, .05, .9));
    for (let r = 0; r < rows; r++) {
      txt(c, (d.rowLabel || 'Week') + ' ' + (r + 1), 44, oy + ch * r + ch / 2 + 8, `600 23px ${T.body}`, T.dim);
      for (let q = 0; q < cols; q++) { const on = r * cols + q < total; rr(c, ox + q * cw + 3, oy + r * ch + 3, cw - 6, ch - 6, 8); c.fillStyle = on ? T.accent : T.card; c.fill(); }
    }
  },
  notify(c, d, p, T, w, h) {
    c.fillStyle = T.bg; c.fillRect(0, 0, w, h);
    rr(c, 36, 34, 66, 66, 16); c.fillStyle = T.accent; c.fill(); txt(c, (d.from || '?')[0], 69, 80, `700 40px ${T.body}`, T.onAccent, 'center');
    txt(c, d.from || '', 122, 62, `700 34px ${T.body}`, T.fg); txt(c, d.sub || '', 122, 98, `500 25px ${T.body}`, T.dim); txt(c, 'now', w - 36, 62, `500 24px ${T.body}`, T.dim, 'right');
    let y = 158; c.font = `500 33px ${T.body}`; for (const l of wrap(c, d.body || '', w - 76)) { txt(c, l, 36, y, `500 33px ${T.body}`, T.fg); y += 46; }
    y += 8; for (const [k, v] of d.rows || []) { txt(c, k, 56, y, `500 31px ${T.body}`, T.dim); txt(c, v, 300, y, `600 31px ${T.body}`, T.fg); y += 46; }
    if (d.total) { rr(c, 36, y - 34, w - 72, 74, 12); c.fillStyle = T.hot; c.fill(); c.strokeStyle = T.accent; c.lineWidth = 3; c.stroke(); txt(c, d.total[0], 62, y + 15, `700 34px ${T.body}`, T.fg); txt(c, d.total[1], 300, y + 16, `800 42px ${T.body}`, T.good, 'left'); y += 92; }
    if (d.foot) { txt(c, d.foot, 36, y + 6, `600 30px ${T.body}`, T.fg); y += 28; }
    d._used = y + 20;
  },
  big(c, d, p, T, w, h) {
    c.fillStyle = d.bg || T.bg; c.fillRect(0, 0, w, h);
    if (d.kicker) txt(c, d.kicker, w / 2, h / 2 - 98, `600 34px ${T.body}`, T.dim, 'center');
    c.font = `800 ${d.size || 92}px ${T.head}`; const lines = wrap(c, d.title, w - 80);
    lines.forEach((l, i) => txt(c, l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * (d.size || 92) * 1.14 + 30, `800 ${d.size || 92}px ${T.head}`, d.color || T.accent, 'center'));
    if (d.sub) txt(c, d.sub, w / 2, h / 2 + 40 + lines.length * 62, `500 32px ${T.body}`, T.dim, 'center');
  },
  form(c, d, p, T, w, h) {
    c.fillStyle = T.bg; c.fillRect(0, 0, w, h);
    txt(c, d.title || 'Create an account', w / 2, 118, `800 56px ${T.head}`, T.fg, 'center'); txt(c, d.sub || '', w / 2, 170, `500 30px ${T.body}`, T.dim, 'center');
    let y = 216; (d.fields || []).forEach((f, i) => {
      txt(c, f.label || f, 80, y + 20, `500 26px ${T.body}`, T.dim); rr(c, 80, y + 34, w - 160, 74, 12); c.fillStyle = T.card; c.fill(); c.strokeStyle = T.line; c.lineWidth = 2; c.stroke();
      const v = f.value || '', n = Math.floor(v.length * sub(p, .1 + i * .25, .3 + i * .25)); txt(c, v.slice(0, n), 104, y + 84, `500 30px ${T.body}`, T.fg); y += 130;
    });
    rr(c, 80, y + 12, w - 160, 92, 14); c.fillStyle = d.buttonColor || '#3467ee'; c.fill(); txt(c, d.button || 'Sign up', w / 2, y + 72, `800 36px ${T.body}`, '#fff', 'center');
    cursor(c, w * (.75 - .2 * eo(sub(p, .4, .8))), y + 70 + (1 - eo(sub(p, .4, .8))) * 90);
  },
  error(c, d, p, T, w, h) {
    c.fillStyle = d.bg || '#4a1d36'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(0, 0, w, 78);
    txt(c, d.crumb || 'Terminal  /  Build history', 44, 50, `500 30px ${T.body}`, '#e6cfe0');
    txt(c, d.time || '', 56, 156, `500 30px ${T.body}`, '#e6cfe0'); txt(c, d.title || 'BUILD FAILED', 56, 240, `800 64px ${T.head}`, '#fff');
    (d.lines || []).forEach((l, i) => { if (p > .12 + i * .15) txt(c, l, 56, 320 + i * 58, `500 36px ${T.body}`, '#f0dbe8'); });
  },
  checklist(c, d, p, T, w, h) {
    chrome(c, w, T, d.url, d.badge); if (d.title) txt(c, d.title, 44, 122, `700 40px ${T.head}`, T.fg);
    const items = d.items || [], n = items.length, y0 = 150, rh = (h - y0 - 24) / n;
    items.forEach((it, i) => {
      const k = sub(p, .06 + i * .82 / n, .16 + i * .82 / n), y = y0 + i * rh; c.save(); c.globalAlpha = .35 + .65 * eo(k);
      rr(c, 40, y + rh / 2 - 19, 38, 38, 10); c.strokeStyle = T.line; c.lineWidth = 3; c.stroke();
      if (k > 0) { c.fillStyle = it.bad ? '#d6453d' : T.good; rr(c, 40, y + rh / 2 - 19, 38, 38, 10); c.globalAlpha *= eo(k); c.fill(); txt(c, it.bad ? '✕' : '✓', 59, y + rh / 2 + 12, `800 28px ${T.body}`, '#fff', 'center'); }
      txt(c, it.text || it, 100, y + rh / 2 + 11, `600 30px ${T.body}`, T.fg); c.restore();
    });
  },
  grid(c, d, p, T, w, h) {     // A picture-grid challenge. Cells are {c:'#hex', label:'', on:true}
    c.fillStyle = '#20252f'; c.fillRect(0, 0, w, h); c.fillStyle = '#2d62c0'; c.fillRect(24, 24, w - 48, 170);
    txt(c, d.prompt || 'Select all squares with', 58, 86, `600 32px ${T.body}`, '#dce8ff'); txt(c, d.word || '', 58, 152, `800 54px ${T.head}`, '#fff');
    txt(c, d.step || 'Step 1 of 3', w - 58, 86, `600 28px ${T.body}`, '#dce8ff', 'right');
    const cells = d.cells || [], cols = d.cols || 3, rows = Math.ceil(cells.length / cols), ox = 34, oy = 212, cw = (w - 68) / cols, ch = (h - oy - 118) / rows, ons = cells.filter(q => q.on).length; let seen = 0;
    cells.forEach((q, i) => {
      const x = ox + (i % cols) * cw, y = oy + Math.floor(i / cols) * ch; c.fillStyle = q.c || '#566070'; c.fillRect(x + 4, y + 4, cw - 8, ch - 8);
      if (q.label) txt(c, q.label, x + cw / 2, y + ch / 2 + 12, `700 30px ${T.body}`, '#fff', 'center');
      if (q.on) { seen++; if (p > seen / (ons + 1) * .85) { c.fillStyle = '#2f8cff'; c.beginPath(); c.arc(x + 34, y + 34, 22, 0, 7); c.fill(); txt(c, '✓', x + 34, y + 45, `800 28px ${T.body}`, '#fff', 'center'); } }
    });
    rr(c, w - 234, h - 92, 196, 66, 8); c.fillStyle = '#2d62c0'; c.fill(); txt(c, 'VERIFY', w - 136, h - 47, `800 30px ${T.body}`, '#fff', 'center');
    const onIdx = cells.map((q, i) => q.on ? i : -1).filter(i => i >= 0); if (onIdx.length) { const i = onIdx[Math.min(onIdx.length - 1, Math.floor(p * onIdx.length))]; cursor(c, ox + (i % cols + .55) * cw + Math.sin(p * 9) * 8, oy + (Math.floor(i / cols) + .55) * ch); }
  },
};
// `ui` scales the whole panel so its text stays readable on a phone.
export function drawPanel(c, panel, p, T, W, H, t, ui = 1) {
  const w = W * ui, h = H * ui;
  c.save(); c.clearRect(0, 0, W, H); c.scale(1 / ui, 1 / ui); c.fillStyle = T.bg; c.fillRect(0, 0, w, h);
  let d = panel;
  if (panel.type === 'step' || panel.step) {      // Step header sits above the inner panel.
    c.fillStyle = '#1b1416'; c.fillRect(0, 0, w, 150);
    const [a, b] = panel.step || [1, 5]; rr(c, 24, 18, 134, 38, 19); c.fillStyle = T.accent; c.fill(); txt(c, `STEP ${a}/${b}`, 91, 45, `800 22px ${T.body}`, T.onAccent, 'center');
    for (let i = 0; i < b; i++) { const x = 174 + i * (w - 200) / b; rr(c, x, 28, (w - 200) / b - 8, 18, 9); c.fillStyle = 'rgba(255,255,255,.14)'; c.fill(); if (i < a) { const f = i < a - 1 ? 1 : p; rr(c, x, 28, Math.max(10, ((w - 200) / b - 8) * f), 18, 9); c.fillStyle = T.accent; c.fill(); } }
    txt(c, panel.heading || '', 24, 122, `700 46px ${T.head}`, '#fff');
    c.translate(16, 150); rr(c, 0, 0, w - 32, h - 166, 18); c.clip();
    (P[panel.type === 'step' ? 'browser' : panel.type] || P.browser)(c, d, p, T, w - 32, h - 166);
  } else (P[panel.type] || P.browser)(c, d, p, T, w, h);
  c.restore();
}
