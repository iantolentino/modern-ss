/* Fetch the imagery the original scan missed.

   The incumbent's home page is built on eight staff portraits (Model-*.webp) and
   two 1000x1000 section images. None of them were downloaded, which is the whole
   reason our home page had no faces on it.

   WordPress generated several widths per file, so we take the largest variant
   that is still sensible rather than the multi-megabyte original.

   Run:  node fetch-missing.mjs */
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { readFileSync } from 'node:fs';

const BASE = 'https://stratastaffglobal.com';
const OUT = 'C:/Users/ianto/Downloads/ai-tests/strata-modern/assets';
const SCAN = 'C:/Users/ianto/Downloads/ai-tests/strata-scan/pages';
mkdirSync(OUT, { recursive: true });

const home = readFileSync(`${SCAN}/home.html`, 'utf8');
const team = readFileSync(`${SCAN}/our-awesome-team.html`, 'utf8');

/* name -> best candidate url */
const jobs = new Map();

const note = (tag) => {
  const src = (tag.match(/(?:data-src|src)="([^"]+)"/) || [, ''])[1];
  if (!src) return;
  const base = src.split('/').pop();
  if (!/^Model-\d+\.webp$|Difference\.webp$|Tailored-Strategic.*\.webp$/i.test(base)) return;
  const srcset = (tag.match(/srcset="([^"]+)"/) || [, ''])[1];
  const cands = [...srcset.matchAll(/(\S+)\s+(\d+)w/g)].map(m => ({
    url: m[1].startsWith('http') ? m[1] : BASE + m[1],
    w: +m[2],
  }));
  if (!cands.length) cands.push({ url: src.startsWith('http') ? src : BASE + src, w: 99999 });
  // biggest variant at or under 900px wide; fall back to the smallest available
  const sorted = cands.sort((a, b) => a.w - b.w);
  const pick = sorted.filter(c => c.w <= 900).pop() || sorted[0];
  const prev = jobs.get(base);
  if (!prev || pick.w > prev.w) jobs.set(base, pick);
};

for (const m of home.matchAll(/<img\b[^>]*>/gi)) note(m[0]);

/* Maristella Gaton: the grid capture reused Marey's file, so read her actual
   markup directly. We never put a name under someone else's face. */
const mi = team.indexOf('Maristella');
if (mi > -1) {
  const chunk = team.slice(Math.max(0, mi - 1200), mi + 60);
  const tags = [...chunk.matchAll(/<img\b[^>]*>/gi)];
  if (tags.length) {
    const t = tags[tags.length - 1][0];
    console.log('Maristella neighbourhood image:', (t.match(/(?:data-src|src)="([^"]+)"/) || [, '?'])[1].split('/').pop());
  }
}

console.log(`fetching ${jobs.size} files\n`);
let ok = 0, bytes = 0;
for (const [base, pick] of [...jobs.entries()].sort()) {
  try {
    const r = await fetch(pick.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; site-restoration/1.0)' },
    });
    if (!r.ok) { console.log(`  ${base.padEnd(30)} HTTP ${r.status}`); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    const dest = `${OUT}/${base}`;
    writeFileSync(dest, buf);
    ok++; bytes += buf.length;
    console.log(`  ${base.padEnd(30)} ${String(pick.w).padStart(5)}w  ${(buf.length / 1024).toFixed(0).padStart(5)}kb`);
  } catch (e) {
    console.log(`  ${base.padEnd(30)} FAILED ${String(e).slice(0, 60)}`);
  }
}
console.log(`\n${ok} files, ${(bytes / 1024 / 1024).toFixed(2)}MB`);
