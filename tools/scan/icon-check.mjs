/* icon-check.mjs — measures every icon SVG on every page against the font size
   of the element it sits in.
 *
 * Why this exists: the corner arrow is one authored SVG used in four containers,
 * and for most of the build only one of those containers had a width and height
 * for it. A `viewBox` of `0 0 16 16` is a 1:1 intrinsic ratio, so in a flex row
 * with `max-width: 100%` the arrow grew to fill whatever width the label left
 * over — 278x278 inside the cover's 339x314 button — while in a shrink-to-fit grid
 * column it collapsed to nothing instead, measuring 0x28 with the arrow's own path
 * painting at 11x8.
 *
 * That survived a full pass over 40 pages and 113 assets, because none of the
 * other tools can see an icon: gap-check measures section heights and the distance
 * from prose to a photograph, overlap-check measures images, face-verify measures
 * faces, contrast measures colour. An icon is none of those. This is the check
 * that would have caught it.
 *
 * An icon in this design is set to 1.05em of its container's font size, so
 * anything outside 0.5em-2em is reported. Two SVGs are not icons and are skipped:
 * the shared symbol sheet (`.sr`, width 0) and the guilloche rosette on the seal,
 * which is a full-bleed texture rather than a glyph.
 *
 * Development-only. Ships nothing. If Chrome is already listening on 9333 or 9334
 * it attaches to it; under a confined sandbox it cannot start its own.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';

const PAGES = process.argv.slice(2);
if (!PAGES.length) {
  console.error('usage: node tools/scan/icon-check.mjs <url> [url ...]');
  process.exit(2);
}

const PROBE = `(() => {
  const out = [];
  for (const s of document.querySelectorAll('svg')) {
    if (s.classList.contains('sr')) continue;                  // the symbol sheet
    if (s.closest('.seal__guilloche')) continue;              // a texture, not a glyph
    const r = s.getBoundingClientRect();
    const host = s.parentElement;
    const fs = parseFloat(getComputedStyle(host).fontSize) || 16;
    out.push({
      host: (typeof host.className === 'string' ? host.className : host.tagName).trim().slice(0, 24),
      w: Math.round(r.width), h: Math.round(r.height),
      em: Math.round((r.height / fs) * 100) / 100,
      label: (s.closest('a, button') || {}).textContent?.trim().replace(/\\s+/g, ' ').slice(0, 30) || '',
    });
  }
  return JSON.stringify(out);
})()`;

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
].find(p => existsSync(p));

const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJson = async (url, method = 'GET') => JSON.parse(await (await fetch(url, { method })).text());

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    ws.addEventListener('open', () => resolve({
      send(method, params = {}) {
        return new Promise((res, rej) => {
          const mid = ++id;
          pending.set(mid, { res, rej });
          ws.send(JSON.stringify({ id: mid, method, params }));
        });
      },
      close: () => ws.close(),
    }));
    ws.addEventListener('error', () => reject(new Error('could not open a debugging socket')));
    ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) {
        const { res, rej } = pending.get(m.id);
        pending.delete(m.id);
        m.error ? rej(new Error(m.error.message)) : res(m.result);
      }
    });
  });
}

let PORT = null, spawned = null;
for (const p of [9333, 9334, 9335]) {
  try { await getJson(`http://127.0.0.1:${p}/json/version`); PORT = p; break; } catch { }
}
if (!PORT) {
  PORT = 9361;
  const profile = process.cwd() + '\\_scratch-chrome-profile';
  mkdirSync(profile, { recursive: true });
  spawned = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`, '--no-first-run', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
  for (let i = 0; i < 20 && !spawned.exitCode; i++) {
    try { await getJson(`http://127.0.0.1:${PORT}/json/version`); break; } catch { await sleep(500); }
  }
  if (spawned.exitCode !== null) {
    console.error('Chrome started and exited at once. Under a confined sandbox it cannot');
    console.error('open its own child processes; start a browser with a debugging port');
    console.error('already open and run this again.');
    process.exit(2);
  }
}
console.log(`  measuring icons at 1440px against each icon's own font size\n`);

const sizes = new Map();
const offenders = [];
let pages = 0, icons = 0;

try {
  for (const url of PAGES) {
    const target = await getJson(`http://127.0.0.1:${PORT}/json/new?about:blank`, 'PUT');
    const cdp = await connect(target.webSocketDebuggerUrl);
    try {
      await cdp.send('Page.enable');
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
      await cdp.send('Page.navigate', { url });
      await sleep(2200);
      const res = await cdp.send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
      const found = JSON.parse(res.result.value);
      pages++;
      const name = url.split('/').pop();
      for (const f of found) {
        icons++;
        sizes.set(f.em, (sizes.get(f.em) || 0) + 1);
        if (f.em > 2 || f.em < 0.5) offenders.push({ name, ...f });
      }
    } finally { cdp.close(); }
  }
} finally {
  if (spawned) { try { spawned.kill(); } catch { } }
}

console.log(`  ${pages} pages, ${icons} icon instances`);
console.log('  rendered height, in em of the host font size:');
for (const [em, n] of [...sizes.entries()].sort((a, b) => a[0] - b[0])) {
  console.log(`    ${String(em).padStart(5)}em  ${String(n).padStart(4)}`);
}
console.log('');
if (!offenders.length) {
  console.log('  no icon is outside 0.5em-2em: every arrow is sized by its container');
} else {
  console.log(`  ${offenders.length} icon(s) outside 0.5em-2em:`);
  for (const o of offenders) {
    console.log(`    ${o.name}  ${o.w}x${o.h} = ${o.em}em  in .${o.host}  "${o.label}"`);
  }
  process.exitCode = 1;
}
