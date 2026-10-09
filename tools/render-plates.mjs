/* render-plates.mjs — one full-height screenshot per page and width.
 *
 * This is the same job as tools/render-plates.ps1 and it exists for two reasons.
 * The .ps1 shells out to `chrome --screenshot`, sizing a window to the measured
 * document height (two passes per plate, because --screenshot captures the window
 * and not the document) and piping Chrome's output to Out-Null. Under a confined
 * sandbox both halves of that fail: Chrome cannot start its own child processes,
 * and a native program's stdout cannot be piped. So the plates could not be
 * re-rendered at all, and the committed plates quietly fell behind the build.
 *
 * This version talks to the browser over the devtools protocol instead, which
 * means it can use a browser that is already listening (the same rule the scan
 * tools follow), and it captures with `captureBeyondViewport` — so the plate ends
 * where the page ends in a single pass, whatever the window is.
 *
 * Lazy images are forced eager and the page is scrolled to the bottom and back
 * before the capture, so a plate never shows an empty box where a photograph
 * would be.
 *
 * Run: node tools/render-plates.mjs
 *      node tools/render-plates.mjs index.html,1440 index.html,390
 *      node tools/render-plates.mjs --out _plates index.html,1440
 *      node tools/render-plates.mjs --first 704 index.html,1440
 *
 * `--first <px>` writes just the top of the page instead of the whole plate, named
 * `<name>-first<px>.png`. It clips rather than shrinking the viewport, because a
 * page's first screen is defined at a 900px-tall viewport — capture it in a shorter
 * window and any `vh` in the layout answers a different question than the one the
 * measurement answered.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const BASE = process.env.PLATE_BASE || 'http://127.0.0.1:4173';

/* The same list the .ps1 renders, kept in the same shape: page,width. */
const DEFAULT = [
  'index.html,1440', 'index.html,1920', 'index.html,390', 'index.html,2560',
  'solutions.html,1440', 'role-accountant.html,1440', 'team.html,1440',
  'contact.html,1440', 'executives.html,1440', 'insights.html,1440',
  'job-hr-assistant.html,1440', 'strata-staff-plus.html,1440', '404.html,1440',
  'about.html,1440', 'testimonials.html,1440',
];

const argv = process.argv.slice(2);
let outDir = '.impeccable/plates';
let first = 0;
const items = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--out') { outDir = argv[++i]; continue; }
  if (argv[i] === '--first') { first = Number(argv[++i]); continue; }
  items.push(argv[i]);
}
const list = (items.length ? items : DEFAULT).map(s => {
  const [page, width] = s.split(',');
  return { page: page.trim(), width: Number((width || '1440').trim()) };
});

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
].find(p => existsSync(p));

const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJson = async (u, m = 'GET') => JSON.parse(await (await fetch(u, { method: m })).text());

function connect(wsUrl) {
  return new Promise((resolveA, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    ws.addEventListener('open', () => resolveA({
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
  PORT = 9364;
  const profile = resolve(ROOT, '_scratch-chrome-profile');
  mkdirSync(profile, { recursive: true });
  spawned = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`, '--no-first-run', '--disable-gpu', '--hide-scrollbars',
    'about:blank'], { stdio: 'ignore' });
  for (let i = 0; i < 20 && !spawned.exitCode; i++) {
    try { await getJson(`http://127.0.0.1:${PORT}/json/version`); break; } catch { await sleep(500); }
  }
  if (spawned.exitCode !== null) {
    console.error('Chrome started and exited at once. Under a confined sandbox it cannot open');
    console.error('its own child processes; start a browser with a debug port already open and');
    console.error('run this again (any of 9333, 9334, 9335 is picked up automatically).');
    process.exit(2);
  }
}
console.log(`  rendering plates from ${BASE} through the browser on port ${PORT}\n`);

const out = resolve(ROOT, outDir);
mkdirSync(out, { recursive: true });

const SETTLE = `(async () => {
  for (const i of document.querySelectorAll('img[loading="lazy"]')) i.loading = 'eager';
  const h = document.body.scrollHeight;
  for (let y = 0; y < h; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
  window.scrollTo(0, h);
  await new Promise(r => setTimeout(r, 400));
  window.scrollTo(0, 0);
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => {
    i.addEventListener('load', r, { once: true });
    i.addEventListener('error', r, { once: true });
    setTimeout(r, 4000);
  })));
  await new Promise(r => setTimeout(r, 500));
  return JSON.stringify({ h: document.body.scrollHeight, imgs: document.images.length,
    broken: [...document.images].filter(i => !i.complete || !i.naturalWidth).length });
})()`;

let made = 0, bytes = 0;
const failures = [];
try {
  for (const { page, width } of list) {
    const name = page.replace(/\.html$/, '') + '-' + width;
    const target = await getJson(`http://127.0.0.1:${PORT}/json/new?about:blank`, 'PUT');
    const cdp = await connect(target.webSocketDebuggerUrl);
    try {
      await cdp.send('Page.enable');
      await cdp.send('Emulation.setScrollbarsHidden', { hidden: true });
      await cdp.send('Emulation.setDeviceMetricsOverride',
        { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
      await cdp.send('Page.navigate', { url: `${BASE}/${page}` });
      await sleep(2200);
      const settled = await cdp.send('Runtime.evaluate',
        { expression: SETTLE, awaitPromise: true, returnByValue: true });
      const { h, imgs, broken } = JSON.parse(settled.result.value);
      if (broken) console.log(`    note: ${broken} of ${imgs} images did not load on ${page}`);
      const shot = await cdp.send('Page.captureScreenshot', first
        ? { format: 'png', captureBeyondViewport: true,
            clip: { x: 0, y: 0, width, height: Math.min(first, h), scale: 1 } }
        : { format: 'png', captureBeyondViewport: true, optimizeForSpeed: false });
      const file = resolve(out, `${name}${first ? `-first${first}` : ''}.png`);
      writeFileSync(file, Buffer.from(shot.data, 'base64'));
      const kb = Math.round(statSync(file).size / 1024);
      bytes += statSync(file).size; made++;
      console.log(`  ${(name + (first ? `-first${first}` : '')).padEnd(34)} ${String(width).padStart(5)}x${String(first ? Math.min(first, h) : h).padEnd(6)} ${String(kb).padStart(7)}kb`);
    } catch (e) {
      failures.push(`${name}: ${e.message}`);
      console.log(`  ${name.padEnd(34)} FAILED  ${e.message}`);
    } finally { cdp.close(); }
  }
} finally {
  if (spawned) { try { spawned.kill(); } catch { } }
}

console.log('');
console.log(`  ${made} plates in ${outDir} (${(bytes / 1048576).toFixed(1)}MB)`);
if (failures.length) {
  console.log(`  ${failures.length} failed:`);
  for (const f of failures) console.log(`    ${f}`);
  process.exitCode = 1;
}
