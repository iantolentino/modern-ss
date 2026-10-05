/* How far apart are the pictures and the words?
 *
 * The complaint is that images and text drift apart in places. That is measurable:
 * for every photograph, find the nearest block of prose above or below it and report
 * the vertical gap in pixels and in line-heights. A gap of one or two lines is a
 * margin; ten lines of empty space between a face and the sentence explaining it is
 * the fault, and it makes a page feel like unrelated slabs rather than an argument.
 *
 * Reuses the DevTools approach from overlap-check.mjs. Node 22+ has a global
 * WebSocket, so there are no dependencies.
 *
 * Run: node tools/scan/gap-check.mjs [--viewport 1440] [url ...]
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
let viewport = 1440;
const urls = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--viewport') viewport = Number(args[++i]);
  else urls.push(args[i]);
}
if (!urls.length) urls.push('http://127.0.0.1:4173/index.html');

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
].find(p => existsSync(p));
if (!CHROME) { console.error('  chrome.exe not found'); process.exit(1); }

const PORT = 9334;

const PROBE = `(() => {
  const vw = window.innerWidth;

  /* A "text block" is an element that directly holds meaningful prose: it has text of
     its own, it is not inside another block that also qualifies, and it is not a nav
     or a control. Taking only the innermost such element avoids measuring the same
     sentence twice at two levels of nesting. */
  const isTextBlock = el => {
    if (!el.textContent || el.textContent.trim().length < 24) return false;
    if (el.closest('nav, footer nav, .skip, button, a.btn, a.btn2')) return false;
    const tag = el.tagName.toLowerCase();
    if (!/^(p|li|h1|h2|h3|h4|blockquote|figcaption|dd|td|span|div)$/.test(tag)) return false;
    // innermost only: skip if a descendant already qualifies
    for (const c of el.children) {
      if (c.textContent && c.textContent.trim().length >= 24) return false;
    }
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    return true;
  };

  const texts = [];
  for (const el of document.querySelectorAll('body *')) {
    if (isTextBlock(el)) {
      const r = el.getBoundingClientRect();
      if (r.height < 8) continue;
      texts.push({
        top: r.top + window.scrollY, bottom: r.bottom + window.scrollY,
        left: r.left, right: r.right,
        text: el.textContent.trim().replace(/\\s+/g, ' ').slice(0, 60),
        lh: parseFloat(getComputedStyle(el).lineHeight) || 24,
      });
    }
  }

  const rows = [];
  for (const img of document.querySelectorAll('img')) {
    const r = img.getBoundingClientRect();
    if (r.width < 60 || r.height < 60) continue;
    const src = (img.currentSrc || img.src || '').split('/').pop();
    const top = r.top + window.scrollY, bottom = r.bottom + window.scrollY;
    const cx = r.left + r.width / 2;

    /* Only text that shares the image's horizontal band counts: prose in the next
       column over is not visually adjacent even when it is vertically nearby. */
    const beside = texts.filter(t => t.left < cx + 40 && t.right > cx - 40);

    let best = null;
    for (const t of beside) {
      // vertical gap when they do not overlap
      let gap = null;
      if (t.bottom <= top) gap = top - t.bottom;
      else if (t.top >= bottom) gap = t.top - bottom;
      else gap = 0;                       // vertically overlapping: adjacent
      if (gap === null) continue;
      if (!best || gap < best.gap) best = { gap, text: t.text, lh: t.lh, where: t.bottom <= top ? 'above' : 'below' };
    }
    if (best) rows.push({ src, w: Math.round(r.width), h: Math.round(r.height), ...best, gap: Math.round(best.gap) });
  }

  rows.sort((a, b) => b.gap - a.gap);

  /* Where the page's height actually goes. Without this the only number available is
     the total, which says a page is long without saying which section made it long --
     and the instinct is then to cut the wrong thing. */
  const sections = [];
  const walk = el => {
    for (const c of el.children) {
      const cs = getComputedStyle(c);
      const r = c.getBoundingClientRect();
      const cls = typeof c.className === 'string' ? c.className : '';
      if (/\\bitem\\b|\\bcover\\b|\\bresolution\\b|\\bband\\b|\\bfaces\\b|\\bwall\\b/.test(cls) && r.height > 60) {
        const h = c.querySelector('h1, h2');
        sections.push({
          cls: cls.split(/\\s+/).filter(x => /item|cover|resolution|band|faces|wall/.test(x)).join('.'),
          h: Math.round(r.height),
          head: h ? h.textContent.trim().replace(/\\s+/g, ' ').slice(0, 46) : '',
        });
      }
      if (c.children.length) walk(c);
    }
  };
  walk(document.body);

  return JSON.stringify({ vw, pageH: Math.round(document.documentElement.scrollHeight),
    imgCount: document.querySelectorAll('img').length, rows, sections });
})()`;

async function httpJson(url, method = 'GET') {
  const r = await fetch(url, { method });
  const t = await r.text();
  try { return JSON.parse(t); } catch { throw new Error(`${method} ${url} -> ${t.slice(0, 70)}`); }
}
function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0; const pending = new Map();
    ws.addEventListener('open', () => resolve({
      send(method, params = {}) {
        return new Promise((res, rej) => { const m = ++id; pending.set(m, { res, rej }); ws.send(JSON.stringify({ id: m, method, params })); });
      },
      close: () => ws.close(),
    }));
    ws.addEventListener('error', () => reject(new Error('ws error')));
    ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
    });
  });
}

const profile = mkdtempSync(path.join(tmpdir(), 'dsh-gap-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
  '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

try {
  let v = null;
  for (let i = 0; i < 40 && !v; i++) { try { v = await httpJson(`http://127.0.0.1:${PORT}/json/version`); } catch { await sleep(250); } }
  if (!v) throw new Error('Chrome did not open its debug port');

  for (const url of urls) {
    const target = await httpJson(`http://127.0.0.1:${PORT}/json/new?about:blank`, 'PUT');
    const cdp = await connect(target.webSocketDebuggerUrl);
    await cdp.send('Page.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: viewport, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.send('Page.navigate', { url });
    await sleep(2400);
    let res;
    try {
      const r = await cdp.send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
      res = JSON.parse(r.result.value);
    } catch (e) { console.log(`  ${url}: ${e.message}`); cdp.close(); continue; }

    const name = url.split('/').pop() || url;
    const wide = res.rows.filter(r => r.gap > 200);
    console.log('');
    console.log(`  ${name} @${res.vw}   ${res.imgCount} images`);
    if (res.sections && res.sections.length) {
      const total = res.sections.reduce((a, s) => a + s.h, 0);
      console.log('');
      console.log(`  where the height goes (${total}px of section, ${(total / 900).toFixed(1)} screens):`);
      for (const s of res.sections.sort((a, b) => b.h - a.h).slice(0, 12)) {
        const bar = '#'.repeat(Math.max(1, Math.round(s.h / 90)));
        console.log(`    ${String(s.h).padStart(6)}px  ${(s.h / 900).toFixed(1)}s  ${s.cls.padEnd(18)} ${bar}  ${s.head}`);
      }
      console.log(`    total page height: ${res.pageH}px = ${(res.pageH / 900).toFixed(1)} screens`);
    }
    console.log('');
    console.log(`  photographs with more than 200px of empty space to the nearest prose: ${wide.length}`);
    if (wide.length) {
      console.log('');
      console.log('    gap      imgsize   where   nearest text');
      for (const r of wide.slice(0, 14)) {
        console.log(`    ${String(r.gap).padStart(5)}px  ${String(r.w + 'x' + r.h).padEnd(9)} ${r.where.padEnd(7)} "${r.text}"`);
      }
      const worst = wide[0];
      console.log('');
      console.log(`    worst: ${worst.gap}px = ${(worst.gap / worst.lh).toFixed(1)} line-heights, ` +
        `text is ${worst.where} the image`);
    }
    cdp.close();
  }
} finally {
  chrome.kill();
  await sleep(400);
  try { rmSync(profile, { recursive: true, force: true }); } catch { }
}
