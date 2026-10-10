/* Checks the three things a stylesheet cannot be trusted to have got right merely
   because it was written: that the webfont actually loaded rather than silently
   falling back to Helvetica, that no section is left invisible by the scroll-driven
   reveal, and that pointer targets meet WCAG 2.2 SC 2.5.8 -- 24x24 CSS px, or
   spaced clear enough of one another that 24px circles do not intersect.
   The family in the font check is this site's own; change it with the stylesheet.
   Run: node tools/scan/render-check.mjs <url> [url ...] */
const PAGES = process.argv.slice(2);
const PROBE = String.raw`(async () => {
  await document.fonts.ready;
  const faces = [...document.fonts].map(f => f.family + ' ' + f.weight + ' ' + f.status);
  const fams = [...new Set(faces.map(f => f.split(' ').slice(0, -2).join(' ')))];
  const s = el => el ? getComputedStyle(el) : null;
  const px = v => Math.round(parseFloat(v) || 0);
  const h1 = document.querySelector('h1');
  const btn = document.querySelector('.btn, a.btn, button.btn');
  const secs = [...document.querySelectorAll('main > section')];
  const opac = () => secs.map(x => +(+getComputedStyle(x).opacity).toFixed(2));
  /* Smooth scrolling would make this measure the journey rather than the
     destination: the first pass read six sections as opacity 0 purely because
     the scroll was still animating. Scroll instantly, then wait for the position
     to actually arrive before reading opacity. */
  const prevBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';
  const goTo = async y => {
    window.scrollTo(0, y);
    for (let i = 0; i < 60 && Math.abs(scrollY - y) > 1; i++) await new Promise(r => setTimeout(r, 20));
    await new Promise(r => requestAnimationFrame(r));
  };
  const settled = [];
  for (const [i, x] of secs.entries()) {
    const abs = x.getBoundingClientRect().top + scrollY;
    for (const frac of [0.3, 0.05]) {
      await goTo(Math.max(0, Math.round(abs - innerHeight * frac)));
      settled.push(i + ':' + (+getComputedStyle(x).opacity).toFixed(2));
    }
  }
  await goTo(0);
  document.documentElement.style.scrollBehavior = prevBehavior;
  const fam = el => s(el).fontFamily.split(',')[0].replace(/["']/g, '');
  const out = {
    families: fams,
    h1: fam(h1) + ' ' + s(h1).fontWeight + ' ' + px(s(h1).fontSize) + 'px lh ' + s(h1).lineHeight + ' ls ' + s(h1).letterSpacing,
    body: fam(document.body) + ' ' + px(s(document.body).fontSize) + 'px',
    btn: btn ? fam(btn) + ' r' + s(btn).borderRadius + ' ' + s(btn).backgroundColor : 'no .btn',
    atTop: opac().join(','),
    settled: settled.join(' '),
    dimSections: settled.filter(x => +x.split(':')[1] < 0.99),
    fontCheck: document.fonts.check('700 64px "Plus Jakarta Sans"'),
    faceStatus: [...document.fonts].map(f => f.family + '=' + f.status).join(' '),
    glyphWidth: (() => {
      const mk = ff => { const e = document.createElement('span'); e.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-size:64px;font-weight:700;font-family:' + ff; e.textContent = 'Your strata agency'; document.body.appendChild(e); const w = Math.round(e.getBoundingClientRect().width); e.remove(); return w; };
      return mk("'Plus Jakarta Sans'") + ' vs arial ' + mk('Arial');
    })(),
    sections: secs.length,
    /* WCAG 2.2 SC 2.5.8 (AA): pointer targets at least 24x24 CSS px, OR spaced so
       that a 24px circle centred on each undersized target does not intersect a
       neighbouring target. Both halves of that rule are measured; links set
       inline in a sentence are exempt and are reported separately.
       (Whitespace is matched with String.raw above: inside a plain template
       literal a \s escape collapses to a bare s and silently ate every letter s
       in the label output, and \t / \n became real characters that broke the
       regex outright.) */
    targets: (() => {
      const ws = /\s+/g;
      const live = [];
      for (const el of document.querySelectorAll('a[href], button, input, select, textarea, summary')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        live.push({ el, r, inline: getComputedStyle(el).display === 'inline' });
      }
      const cen = t => ({ x: t.r.left + t.r.width / 2, y: t.r.top + t.r.height / 2 });
      const under = live.filter(t => t.r.width < 24 || t.r.height < 24);
      for (const t of under) {
        const a = cen(t);
        let min = Infinity;
        for (const o of live) { if (o === t) continue; const b = cen(o); const d = Math.hypot(a.x - b.x, a.y - b.y); if (d < min) min = d; }
        t.min = min;
      }
      const label = t => (t.el.textContent || t.el.getAttribute('aria-label') || t.el.type || t.el.tagName).trim().replace(ws, ' ').slice(0, 22) + ' ' + Math.round(t.r.width) + 'x' + Math.round(t.r.height) + ' gap' + Math.round(t.min);
      const blocked = under.filter(t => !t.inline && t.min < 24);
      const inlineUnder = under.filter(t => t.inline).length;
      return live.length + ' live targets; ' + under.length + ' under 24px (' + inlineUnder + ' inline, exempt). '
        + 'Non-inline and closer than 24px to a neighbour: ' + (blocked.length || 'none')
        + (blocked.length ? ' -> ' + blocked.slice(0, 6).map(label).join(' | ') : '');
    })(),
    docH: document.body.scrollHeight,
    heroBottom: h1 ? Math.round(document.querySelector('main > section').getBoundingClientRect().height) : null,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
  return JSON.stringify(out);
})()`;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJson = async (u, m = 'GET') => JSON.parse(await (await fetch(u, { method: m })).text());
function connect(wsUrl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl); let id = 0; const pending = new Map();
    ws.addEventListener('open', () => res({
      send(method, params = {}) { return new Promise((a, b) => { const mid = ++id; pending.set(mid, { a, b }); ws.send(JSON.stringify({ id: mid, method, params })); }); },
      close: () => ws.close(),
    }));
    ws.addEventListener('error', () => rej(new Error('ws error')));
    ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const { a, b } = pending.get(m.id); pending.delete(m.id); m.error ? b(new Error(m.error.message)) : a(m.result); } });
  });
}
let PORT = null;
for (const p of [9333, 9334]) { try { await getJson(`http://127.0.0.1:${p}/json/version`); PORT = p; break; } catch { } }
if (!PORT) { console.error('no browser'); process.exit(2); }
for (const url of PAGES) {
  const t = await getJson(`http://127.0.0.1:${PORT}/json/new?about:blank`, 'PUT');
  const cdp = await connect(t.webSocketDebuggerUrl);
  try {
    await cdp.send('Page.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.send('Page.navigate', { url });
    await sleep(3500);
    const r = await cdp.send('Runtime.evaluate', { expression: PROBE, returnByValue: true, awaitPromise: true });
    const d = JSON.parse(r.result.value);
    console.log(`\n=== ${url.replace(/^http:\/\/127\.0\.0\.1:4173\//, '')}`);
    console.log(`  families   ${d.families.join(' | ')}`);
    console.log(`  h1         ${d.h1}`);
    console.log(`  body       ${d.body}     ${d.btn}`);
    console.log(`  sections   ${d.sections}, opacity at top: ${d.atTop}`);
    console.log(`  settled    ${d.settled}`);
    console.log(`  dim        ${d.dimSections.length ? d.dimSections.join(' ') : 'none — every section reaches full opacity'}`);
    console.log(`  face       check=${d.fontCheck}  ${d.faceStatus}`);
    console.log(`  glyphs     ${d.glyphWidth}`);
    console.log(`  targets    ${d.targets}`);
    console.log(`  layout     cover ${d.heroBottom}px, doc ${d.docH}px, overflow ${d.overflow}px`);
  } catch (e) { console.log(`\n=== ${url}\n  FAILED ${e.message}`); } finally { cdp.close(); }
}
