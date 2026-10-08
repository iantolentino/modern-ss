/* Overlap and overflow, measured in a real browser on a real URL.
 *
 * Two complaints: the deployed images sit wrong, and some overlap at the left and
 * right. The first is explainable -- the Pages build failed, so live is a pre-fix
 * build -- but "overlap" is a claim about geometry, and geometry is measurable. This
 * drives headless Chrome over the Chrome DevTools Protocol and asks the page itself
 * what it laid out, so the answer is the browser's rather than an inference from CSS.
 *
 * Reports, per URL:
 *   overflow   any element whose border box extends past the viewport width
 *   overlap    any two photographs whose visible rectangles intersect
 *   clipped    any image whose box crops more than a few percent of the file
 *
 * Node 22+ has a global WebSocket, which is what makes this possible with no
 * dependencies. Chrome is spoken to over the DevTools socket directly.
 *
 * Run: node tools/scan/overlap-check.mjs [url ...]
 *      node tools/scan/overlap-check.mjs --viewports 1440,390
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
let viewports = [1440, 390];
const urls = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--viewports') viewports = args[++i].split(',').map(Number);
  else urls.push(args[i]);
}
if (!urls.length) {
  urls.push('https://iantolentino.github.io/modern-ss/index.html',
    'https://iantolentino.github.io/modern-ss/team.html');
}

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
].find(p => existsSync(p));
if (!CHROME) { console.error('  chrome.exe not found'); process.exit(1); }

const PORT = 9333;

/* The script the page runs on itself. Runs in the page, returns plain JSON. */
const PROBE = `(() => {
  const vw = window.innerWidth;
  const out = { vw, docW: document.documentElement.scrollWidth, overflow: [], images: [] };

  const label = el => {
    const cls = (el.className && typeof el.className === 'string')
      ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : '';
    return el.tagName.toLowerCase() + cls;
  };

  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    /* Skip anything parked entirely off-screen. A focusable control moved out of
       view -- this site's skip link sits at left: -999px until it is focused -- is a
       deliberate affordance, not a layout fault, and reporting it every run would
       train the reader to ignore the report. Only elements that straddle an edge, or
       run past the right edge into the page, can actually clip content. */
    if (r.right <= 0 || r.left >= vw) continue;
    const over = Math.max(0, -r.left, r.right - vw);
    if (over > 1) {
      const cs = getComputedStyle(el);
      out.overflow.push({
        sel: label(el), over: Math.round(over * 10) / 10,
        left: Math.round(r.left), right: Math.round(r.right),
        pos: cs.position, w: Math.round(r.width),
        text: (el.textContent || '').trim().slice(0, 40),
      });
    }
  }

  for (const img of document.querySelectorAll('img')) {
    const r = img.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    const cs = getComputedStyle(img);
    const src = img.currentSrc || img.src || '';
    // how much of the file the box shows, from the CSS rather than naturalWidth
    let cropW = 1, cropH = 1;
    const nw = img.naturalWidth, nh = img.naturalHeight;
    if (nw && nh && cs.objectFit === 'cover') {
      const boxAR = r.width / r.height, imgAR = nw / nh;
      if (imgAR > boxAR) { cropW = boxAR / imgAR; } else { cropH = imgAR / boxAR; }
    }
    out.images.push({
      src: src.split('/').pop(),
      x: Math.round(r.left), y: Math.round(r.top),
      w: Math.round(r.width), h: Math.round(r.height),
      fit: cs.objectFit, radius: cs.borderRadius,
      cropW: Math.round(cropW * 1000) / 1000, cropH: Math.round(cropH * 1000) / 1000,
      nat: nw + 'x' + nh,
      overlaps: false,
    });
  }

  // photographs only: overlap between two images is the complaint, and images that
  // merely share a grid cell edge are not overlapping
  for (let i = 0; i < out.images.length; i++) {
    for (let j = i + 1; j < out.images.length; j++) {
      const a = out.images[i], b = out.images[j];
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (ox > 2 && oy > 2) { a.overlaps = true; b.overlaps = true; }
    }
  }
  out.overlaps = out.images.filter(i => i.overlaps).length;
  out.imageCount = out.images.length;
  out.cropped = out.images.filter(i => (i.fit === 'cover' && (i.cropW < 0.98 || i.cropH < 0.98)));
  // the array itself is dropped: the caller wants counts and the cropped list, and
  // returning every rect makes the payload large for no reader
  delete out.images;
  return JSON.stringify(out);
})()`;

/* --- DevTools plumbing ---------------------------------------------------- */

async function httpJson(url, method = 'GET') {
  const r = await fetch(url, { method });
  const text = await r.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`${method} ${url} -> ${text.slice(0, 80)}`); }
}

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
    ws.addEventListener('error', e => reject(new Error('ws error')));
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

const profile = mkdtempSync(path.join(tmpdir(), 'dsh-overlap-'));
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu',
  '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));

try {
  let version = null;
  for (let i = 0; i < 40 && !version; i++) {
    try { version = await httpJson(`http://127.0.0.1:${PORT}/json/version`); }
    catch { await sleep(250); }
  }
  if (!version) throw new Error('Chrome did not open its debug port');

  for (const width of viewports) {
    console.log('');
    console.log('='.repeat(74));
    console.log(`  viewport ${width}px`);
    console.log('='.repeat(74));
    for (const url of urls) {
      /* Chrome refuses GET here: "This action supports only PUT verb." Older builds
         accepted GET, so this is version-dependent rather than wrong. */
      const target = await httpJson(`http://127.0.0.1:${PORT}/json/new?about:blank`, 'PUT');
      const cdp = await connect(target.webSocketDebuggerUrl);
      await cdp.send('Page.enable');
      await cdp.send('Emulation.setDeviceMetricsOverride',
        { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
      await cdp.send('Page.navigate', { url });
      await sleep(2200);
      let result;
      try {
        const r = await cdp.send('Runtime.evaluate',
          { expression: PROBE, returnByValue: true });
        result = JSON.parse(r.result.value);
      } catch (e) {
        console.log(`  ${url}\n    probe failed: ${e.message}`);
        cdp.close();
        continue;
      }
      const name = url.split('/').pop() || url;
      /* The authoritative overflow test is the document's own scrollWidth against
         the width we asked for. It used to compare against the viewport the page
         reported (`result.vw`), and at 320 and 390 this tool emulates a phone --
         where the browser widens its own layout viewport to fit content that
         overflows it, so an overflowing page reported a matching viewport and read
         as "fits". The perforation's right-hand punch hole put 6px of scroll on
         every one of the 40 pages at 980px and below, and this test called it
         clean at 390 for as long as it trusted the page's own number. It still
         prints that number, because a difference between the two is exactly the
         symptom. */
      const scrolls = result.docW > width;
      const problem = scrolls || result.overlaps > 0 || result.cropped.length > 0;
      console.log('');
      console.log(`  ${name}${problem ? '  <-- PROBLEM' : '  ok'}`);
      console.log(`    document scrollWidth ${result.docW} vs viewport ${width}px` +
        `${scrolls ? '  OVERFLOWS' : '  fits'}` +
        (result.vw !== width ? `  (page reports its own viewport as ${result.vw}px)` : ''));
      console.log(`    images ${result.imageCount}  ` +
        `overlapping ${result.overlaps}  cropped by cover: ${result.cropped.length}`);
      if (result.overflow.length) {
        console.log(`    ${result.overflow.length} elements straddling the viewport edge ` +
          `(not necessarily a fault; scrollWidth is the verdict):`);
        const seen = new Set();
        for (const o of result.overflow) {
          const k = o.sel + o.over;
          if (seen.has(k)) continue;
          seen.add(k);
          if (seen.size > 8) break;
          console.log(`      ${o.sel.padEnd(34)} ${String(o.over).padStart(7)}px over   ` +
            `left ${String(o.left).padStart(6)} right ${String(o.right).padStart(6)}  ${o.pos}  "${o.text}"`);
        }
      }
      if (result.cropped.length) {
        console.log('    images cropped by object-fit: cover:');
        for (const c of result.cropped.slice(0, 10)) {
          console.log(`      ${String(c.src).padEnd(38)} ${c.nat} in ${c.w}x${c.h}  ` +
            `shows ${(c.cropW * 100).toFixed(0)}% w / ${(c.cropH * 100).toFixed(0)}% h`);
        }
      }
      cdp.close();
    }
  }
} finally {
  chrome.kill();
  await sleep(400);
  try { rmSync(profile, { recursive: true, force: true }); } catch { }
}
