/* spacing-check.mjs — the craft floor's spacing rule, measured rather than eyeballed:
 * "tight groups, generous separation, more space above a heading than below it."
 *
 * Two artifact classes have to be excluded or this reports a defect on every page,
 * which is how a report teaches its reader to skim it (§16):
 *
 *   1. A heading at the top of a section has nothing above it *inside* the section.
 *      Its space above is the section wrapper's padding-top, so measure that edge
 *      rather than reporting zero.
 *   2. A heading that is one cell of a multi-column grid or flex row has no text
 *      beneath it at all -- its paragraph sits beside it. Measuring "below" there
 *      measures the next row. Those are reported as `row` and never flagged.
 *
 * Run: node tools/scan/spacing-check.mjs <url|page> [page...]
 * Exits non-zero if any heading that owns the space beneath it has more below it
 * than above it.
 */
const BASE = process.env.BASE || 'http://127.0.0.1:4173';
const PORT = process.env.CDP_PORT || 9334;
const PAGES = process.argv.slice(2);
if (!PAGES.length) { console.error('usage: node tools/scan/spacing-check.mjs <page> [page...]'); process.exit(2); }

async function attach() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list.find(t => t.type === 'page');
  if (!page) throw new Error('no page target on ' + PORT);
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
  const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  return { send, close: () => ws.close() };
}

const PROBE = String.raw`(() => {
  const rows = [];
  for (const h of document.querySelectorAll('main h1, main h2, main h3')) {
    const r = h.getBoundingClientRect();
    if (!r.height) continue;
    const sec = h.closest('section') || h.closest('main');
    const wrap = h.parentElement;
    const ws = getComputedStyle(wrap);
    const isRow = (ws.display === 'grid' || ws.display === 'flex') &&
                  (ws.gridTemplateColumns.split(' ').filter(Boolean).length > 1 || ws.display === 'flex');
    const boxes = [...sec.querySelectorAll('*')]
      .map(e => ({ e, b: e.getBoundingClientRect(), pos: getComputedStyle(e).position }))
      .filter(x => x.b.height > 0 && x.b.width > 0 && x.pos !== 'absolute' && x.pos !== 'fixed' &&
                   x.b.left < r.right && x.b.right > r.left && x.e !== sec);
    let above = null, aboveFrom = 'section padding-top';
    for (const x of boxes) {
      if (x.b.bottom > r.top + 1) continue;
      const gap = r.top - x.b.bottom;
      if (above === null || gap < above) { above = gap; aboveFrom = x.e.tagName.toLowerCase() + '.' + (x.e.className.split(' ')[0] || ''); }
    }
    if (above === null) above = Math.round(r.top - sec.getBoundingClientRect().top);
    let below = null, belowFrom = '';
    for (const x of boxes) {
      if (x.b.top < r.bottom - 1) continue;
      /* Only text that belongs to this heading's own group counts. A .trio cell on
         the role pages holds a reference number and a heading and nothing else, so the
         nearest box below it is the next item's cell -- 41px away and belonging to a
         different group. Item separation is not a heading's leading. */
      if (!h.parentElement.contains(x.e)) continue;
      const gap = x.b.top - r.bottom;
      if (below === null || gap < below) { below = gap; belowFrom = x.e.tagName.toLowerCase() + '.' + (x.e.className.split(' ')[0] || ''); }
    }
    rows.push({
      tag: h.tagName.toLowerCase(), isRow,
      mt: getComputedStyle(h).marginTop, mb: getComputedStyle(h).marginBottom,
      parent: h.parentElement.tagName.toLowerCase() + '.' + (h.parentElement.className.split(' ')[0] || ''),
      text: h.textContent.trim().replace(/\s+/g, ' ').slice(0, 44),
      above: Math.round(above), aboveFrom,
      below: below === null ? null : Math.round(below), belowFrom,
    });
  }
  return JSON.stringify(rows);
})()`;

const cdp = await attach();
/* Every probe here navigates a fresh page, and Chrome will otherwise answer a
   stylesheet request from its cache -- which made a live edit look like it had not
   applied at all. Bypass the cache for the whole run. */
await cdp.send('Network.enable');
await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
let flagged = 0, total = 0;
for (const p of PAGES) {
  await cdp.send('Page.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Page.navigate', { url: p.startsWith('http') ? p : `${BASE}/${p}` });
  await new Promise(r => setTimeout(r, 2500));
  const res = await cdp.send('Runtime.evaluate', { expression: PROBE, returnByValue: true, awaitPromise: false });
  const rows = JSON.parse(res.result.result.value);
  console.log(`\n=== ${p}  (${rows.length} headings)`);
  for (const x of rows) {
    const owns = !x.isRow && x.below !== null;
    const bad = owns && x.below > x.above;
    if (owns) total++;
    if (bad) flagged++;
    const note = bad ? '  <-- MORE BELOW' : x.isRow ? '  (row cell, not flagged)' : x.below === null ? '  (ends its own group)' : '';
    console.log(`  ${x.tag} in ${(x.parent || '').padEnd(16)} mt ${(x.mt || '?').padEnd(8)} mb ${(x.mb || '?').padEnd(8)} above ${String(x.above).padStart(4)}px (${x.aboveFrom.padEnd(18)}) below ${x.below === null ? '  n/a' : String(x.below).padStart(4) + 'px'} (${(x.belowFrom || '').padEnd(18)})${note}  ${x.text}`);
  }
}
cdp.close();
console.log(`\nheadings that own the space beneath them: ${total}; inversions: ${flagged}`);
process.exit(flagged ? 1 : 0);
