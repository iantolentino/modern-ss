/* Measures how peer sites actually render, in a real browser. Computed styles are
   the evidence raw-HTML extraction cannot reach here -- stylesheet fetches come
   back 403/404 and shell HTTP is sandbox-blocked, but the browser is not. Every
   sector number in DESIGN.md that names a rival's font, radius or H1 size came out
   of this file. Reads only; stores nothing.
   Run: node tools/scan/reference.mjs <url> [url ...] */
import { existsSync } from 'node:fs';

const URLS = process.argv.slice(2);
const WIDTH = 1440;

const PROBE = `(() => {
  const s = el => el ? getComputedStyle(el) : null;
  const px = v => Math.round(parseFloat(v) || 0);
  const fam = el => { const c = s(el); return c ? c.fontFamily.split(',')[0].replace(/["']/g, '').trim() + ' ' + c.fontWeight + ' ' + px(c.fontSize) + 'px' : null; };
  const rect = el => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) }; };
  const h1 = document.querySelector('h1');
  const ctaRe = /book|demo|quote|contact us|get started|proposal|enquir|talk to|free consult/i;
  const ctas = [...document.querySelectorAll('a,button')].filter(b => ctaRe.test((b.textContent || '').trim()) && b.getBoundingClientRect().width > 70);
  const btn = ctas[0];
  const header = document.querySelector('header') || document.querySelector('nav') || document.querySelector('[class*=header]');
  const heroImgs = [...document.images].filter(i => {
    const r = i.getBoundingClientRect();
    return r.width > 500 && r.top < 120 && r.height > 200;
  });
  const fields = {};
  for (const el of document.querySelectorAll('a,button,div,section,article,li')) {
    const c = s(el);
    if (!c) continue;
    if (c.borderRadius && px(c.borderRadius) > 0) fields['r' + px(c.borderRadius)] = (fields['r' + px(c.borderRadius)] || 0) + 1;
    if (c.boxShadow && c.boxShadow !== 'none') fields.shadow = (fields.shadow || 0) + 1;
    if (c.backgroundImage && c.backgroundImage.includes('gradient')) fields.gradient = (fields.gradient || 0) + 1;
  }
  const stop = h1 ? Math.round(h1.getBoundingClientRect().bottom + scrollY) : null;
  return JSON.stringify({
    title: document.title.slice(0, 70),
    h1: h1 ? h1.textContent.trim().replace(/\\s+/g, ' ').slice(0, 100) : null,
    h1words: h1 ? h1.textContent.trim().split(/\\s+/).length : null,
    h1type: h1 ? fam(h1) + '  lh ' + s(h1).lineHeight + '  ls ' + s(h1).letterSpacing + '  ' + s(h1).color : null,
    body: fam(document.body) + '  ' + s(document.body).color + ' on ' + s(document.body).backgroundColor,
    btn: btn ? { t: btn.textContent.trim().replace(/\\s+/g, ' ').slice(0, 28), type: fam(btn), bg: s(btn).backgroundColor, fg: s(btn).color, r: s(btn).borderRadius, sh: s(btn).boxShadow === 'none' ? 'none' : 'yes', pad: s(btn).padding } : null,
    ctaCount: ctas.length,
    ctaTexts: [...new Set(ctas.map(b => b.textContent.trim().replace(/\\s+/g, ' ').slice(0, 24)))].slice(0, 6),
    heroImg: heroImgs.length ? { n: heroImgs.length, src: (heroImgs[0].currentSrc || heroImgs[0].src).split('/').pop().slice(0, 40), ...rect(heroImgs[0]) } : null,
    nav: header ? { tag: header.tagName.toLowerCase(), ...rect(header), pos: s(header).position, bg: s(header).backgroundColor, z: s(header).zIndex } : null,
    h2s: [...document.querySelectorAll('h2')].slice(0, 8).map(h => h.textContent.trim().replace(/\\s+/g, ' ').slice(0, 46)),
    shapes: fields,
    heroBottom: stop,
    w: document.documentElement.clientWidth,
    sw: document.documentElement.scrollWidth,
    docH: document.body.scrollHeight,
  });
})()`;

const STICK = `(() => {
  const h = document.querySelector('header') || document.querySelector('nav') || document.querySelector('[class*=header]');
  if (!h) return JSON.stringify({ none: true });
  const before = Math.round(h.getBoundingClientRect().top);
  window.scrollTo(0, 700);
  const after = Math.round(h.getBoundingClientRect().top);
  const cs = getComputedStyle(h);
  window.scrollTo(0, 0);
  return JSON.stringify({ before, after, pos: cs.position, sticky: after >= -2 && after < 200 && cs.position !== 'static' });
})()`;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJson = async (u, m = 'GET') => JSON.parse(await (await fetch(u, { method: m })).text());
function connect(wsUrl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl);
    let id = 0; const pending = new Map();
    ws.addEventListener('open', () => res({
      send(method, params = {}) {
        return new Promise((a, b) => { const mid = ++id; pending.set(mid, { a, b }); ws.send(JSON.stringify({ id: mid, method, params })); });
      },
      close: () => ws.close(),
    }));
    ws.addEventListener('error', () => rej(new Error('ws error')));
    ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) { const { a, b } = pending.get(m.id); pending.delete(m.id); m.error ? b(new Error(m.error.message)) : a(m.result); }
    });
  });
}

let PORT = null;
for (const p of [9333, 9334]) { try { await getJson(`http://127.0.0.1:${p}/json/version`); PORT = p; break; } catch { } }
if (!PORT) { console.error('no browser listening on 9333/9334'); process.exit(2); }

for (const url of URLS) {
  const target = await getJson(`http://127.0.0.1:${PORT}/json/new?about:blank`, 'PUT');
  const cdp = await connect(target.webSocketDebuggerUrl);
  try {
    await cdp.send('Page.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.send('Page.navigate', { url });
    await sleep(5000);
    const r = await cdp.send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
    const d = JSON.parse(r.result.value);
    const st = JSON.parse((await cdp.send('Runtime.evaluate', { expression: STICK, returnByValue: true })).result.value);
    console.log(`\n=== ${url}`);
    if (!d.title) { console.log('  NOTHING LOADED (network blocked?)'); continue; }
    console.log(`  title      ${d.title}`);
    console.log(`  h1 (${d.h1words}w)   ${d.h1}`);
    console.log(`  h1 type    ${d.h1type}`);
    console.log(`  body       ${d.body}`);
    console.log(`  hero img   ${d.heroImg ? JSON.stringify(d.heroImg) : 'none above the fold'}`);
    console.log(`  hero ends  ${d.heroBottom}px   doc ${d.docH}px  width ${d.w}/${d.sw}`);
    console.log(`  ctas (${d.ctaCount})  ${d.ctaTexts.join(' | ')}`);
    console.log(`  button     ${d.btn ? JSON.stringify(d.btn) : 'none'}`);
    console.log(`  nav        ${d.nav ? JSON.stringify(d.nav) : 'none'}  sticky=${st.sticky} (top ${st.before} -> ${st.after})`);
    console.log(`  shapes     ${JSON.stringify(d.shapes)}`);
    console.log(`  h2s        ${d.h2s.join(' / ')}`);
  } catch (e) {
    console.log(`\n=== ${url}\n  FAILED: ${e.message}`);
  } finally { cdp.close(); }
}
