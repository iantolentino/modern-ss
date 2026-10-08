/* What is GitHub Pages actually serving, against what is in the repo?
 *
 * The local build is known good: 70 of 70 portrait renders show the whole file, the
 * portrait boxes carry 908/1671, and no image overlaps anything. If the deployed site
 * differs, the difference is in what got published, not in what was built. So fetch
 * the live bytes and compare them to the files on disk rather than reasoning about it.
 *
 * Checks, per page:
 *   - does the deployed html match the local bytes
 *   - does the deployed stylesheet carry the portrait ratio
 *   - do the portrait files the page asks for exist on the live origin
 *   - is the deployed image the size the page claims
 *
 * Run: node tools/scan/live-diff.mjs
 */
const LIVE = 'https://iantolentino.github.io/modern-ss';
const LOCAL = 'http://127.0.0.1:4173';

const PAGES = ['index.html', 'team.html', 'about.html', 'careers.html', 'executives.html'];
const ASSETS = [
  'styles.css',
  'assets/people/anna-marie-david-400.webp',
  'assets/people/anna-marie-david-800.webp',
  /* Not `assets/people/anna-marie-david.webp`: no page references that unsuffixed
     file and it exists on neither origin, so testing it printed "ABSENT LIVE" on
     every single run — a live-versus-local difference where there was none, and
     precisely the sort of line that teaches a reader to skim the report. */
  'assets/portrait/accountant-400.webp',
];

async function get(url) {
  try {
    const r = await fetch(url, { redirect: 'follow' });
    const buf = Buffer.from(await r.arrayBuffer());
    return { status: r.status, buf, type: r.headers.get('content-type') || '' };
  } catch (e) {
    return { status: 0, buf: Buffer.alloc(0), type: '', err: e.message };
  }
}

const hash = b => {
  let h = 0;
  for (let i = 0; i < b.length; i++) h = (h * 31 + b[i]) >>> 0;
  return h.toString(16).padStart(8, '0');
};

console.log('  page                live        local       same?');
console.log('  ' + '-'.repeat(62));
const liveHtml = {};
for (const p of PAGES) {
  const [l, o] = await Promise.all([get(`${LIVE}/${p}`), get(`${LOCAL}/${p}`)]);
  liveHtml[p] = l;
  const same = l.status === 200 && l.buf.length === o.buf.length && hash(l.buf) === hash(o.buf);
  console.log(`  ${p.padEnd(20)}${String(l.status).padEnd(4)}${String(l.buf.length).padStart(7)}b  ` +
    `${String(o.buf.length).padStart(7)}b  ${same ? 'yes' : 'NO'}`);
}

console.log('');
console.log('  asset                          live status   live bytes   local bytes   same?');
console.log('  ' + '-'.repeat(78));
for (const a of ASSETS) {
  const [l, o] = await Promise.all([get(`${LIVE}/${a}`), get(`${LOCAL}/${a}`)]);
  const same = l.status === 200 && o.status === 200 &&
    l.buf.length === o.buf.length && hash(l.buf) === hash(o.buf);
  console.log(`  ${a.padEnd(32)}${String(l.status).padEnd(13)}${String(l.buf.length).padStart(9)}b  ` +
    `${String(o.buf.length).padStart(10)}b   ${same ? 'yes' : (l.status === 404 ? 'ABSENT LIVE' : 'NO')}`);
}

console.log('');
console.log('  --- does the deployed markup ask for portraits that exist live? ---');
const idx = liveHtml['team.html'];
if (idx.status === 200) {
  const html = idx.buf.toString('utf8');
  const srcs = [...new Set([...html.matchAll(/src="(assets\/[^"]+)"/g)].map(m => m[1]))];
  const people = srcs.filter(s => s.includes('/people/'));
  console.log(`  team.html references ${srcs.length} assets, ${people.length} of them people portraits`);
  const missing = [];
  for (const s of people.slice(0, 8)) {
    const r = await get(`${LIVE}/${s}`);
    if (r.status !== 200) missing.push(`${s} -> ${r.status}`);
  }
  console.log(`  checked ${Math.min(8, people.length)} of them on the live origin`);
  if (missing.length) for (const m of missing) console.log(`    MISSING ${m}`);
  else console.log('    all present on the live origin');

  // what does the deployed markup claim the intrinsic size is?
  const dims = [...new Set([...html.matchAll(/width="(\d+)" height="(\d+)"/g)].map(m => `${m[1]}x${m[2]}`))];
  console.log(`  intrinsic sizes the deployed team page declares: ${dims.join(', ') || 'none'}`);
  console.log(`  aspect it implies: ${dims.map(d => (parseInt(d) / parseInt(d.split('x')[1])).toFixed(3)).join(', ')}`);
  console.log(`  (uncropped source is 0.543; the old 3:4 crop was 0.750, 4:5 was 0.800)`);
}

console.log('');
console.log('  --- deployed stylesheet ---');
const css = await get(`${LIVE}/styles.css`);
if (css.status === 200) {
  const t = css.buf.toString('utf8');
  const tok = t.match(/--portrait-ra:\s*([^;]+);/);
  console.log(`  --portrait-ra: ${tok ? tok[1].trim() : 'NOT PRESENT (pre-fix stylesheet)'}`);
  console.log(`  contains 'aspect-ratio: 4 / 5' (old portrait box): ${/aspect-ratio:\s*4\s*\/\s*5/.test(t) ? 'yes' : 'no'}`);
  const ar = [...new Set([...t.matchAll(/aspect-ratio:\s*([^;]+);/g)].map(m => m[1].trim()))];
  console.log(`  all aspect-ratio values: ${ar.join(' | ')}`);
} else {
  console.log(`  styles.css -> ${css.status}`);
}
