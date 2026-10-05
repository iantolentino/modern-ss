/* Full roster + what imagery the incumbent actually leads with, page by page.

   The board portraits are worth labelling only if the pairing is real and
   ordered, so this extracts the whole grid rather than the first screenful. It
   also reads the exec and home pages for the srcset entries WordPress generated,
   because a 908x1671 1.4MB source is not what a landing page should ship. */
import { readFileSync } from 'node:fs';

const SCAN = 'C:/Users/ianto/Downloads/ai-tests/strata-scan/pages';
const read = f => readFileSync(`${SCAN}/${f}`, 'utf8');

const flat = (html, keepImg = true) => html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<img\b[^>]*>/gi, m => keepImg
    ? `\n[[IMG ${(m.match(/(?:data-src|src)="([^"]+)"/) || [, '?'])[1].split('/').pop()}]]\n`
    : '\n')
  .replace(/<[^>]+>/g, '\n')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, "'")
  .split('\n').map(s => s.trim()).filter(Boolean);

/* ---------- the full board ---------- */
console.log('=== our-awesome-team.html: the whole grid ===');
const t = flat(read('our-awesome-team.html'));
let n = 0;
for (let i = 0; i < t.length; i++) {
  if (!t[i].startsWith('[[IMG')) continue;
  const src = t[i].slice(6, -2);
  if (/flag|strata|logo|avatar|gravatar|pixel|\.svg|t\.gif/i.test(src)) continue;
  const name = t[i + 1] || '', role = t[i + 2] || '';
  if (name.length > 46 || name.startsWith('[[')) continue;
  console.log(`  ${String(++n).padStart(2)}. ${src.padEnd(30)} ${name.padEnd(26)} ${role.slice(0, 52)}`);
}
console.log(`  -> ${n} labelled portraits`);

/* ---------- what the exec page ships ---------- */
console.log('\n=== executives.html: image sources and generated sizes ===');
const ex = read('executives.html');
const seen = new Set();
for (const m of ex.matchAll(/<img\b[^>]*>/gi)) {
  const tag = m[0];
  const src = (tag.match(/(?:data-src|src)="([^"]+)"/) || [, ''])[1];
  const base = src.split('/').pop().replace(/-\d+x\d+(?=\.\w+$)/, '');
  if (!base || seen.has(base) || /flag|logo|pixel|\.svg/i.test(base)) continue;
  seen.add(base);
  const srcset = (tag.match(/srcset="([^"]+)"/) || [, ''])[1];
  const sizes = [...srcset.matchAll(/(\S+)\s+(\d+)w/g)].map(x => `${x[2]}w`).join(' ');
  const wh = (tag.match(/width="(\d+)"/) || [, '?'])[1] + 'x' + (tag.match(/height="(\d+)"/) || [, '?'])[1];
  const alt = (tag.match(/alt="([^"]*)"/) || [, ''])[1];
  console.log(`  ${base.padEnd(30)} attr ${wh.padEnd(12)} alt "${alt.slice(0, 30)}"`);
  if (sizes) console.log(`     srcset: ${sizes}`);
}

/* ---------- what the home page leads with ---------- */
console.log('\n=== home.html: every image, in document order ===');
const h = read('home.html');
let hn = 0;
for (const m of h.matchAll(/<img\b[^>]*>/gi)) {
  const tag = m[0];
  const src = (tag.match(/(?:data-src|src)="([^"]+)"/) || [, ''])[1];
  const alt = (tag.match(/alt="([^"]*)"/) || [, ''])[1];
  const wh = (tag.match(/width="(\d+)"/) || [, '?'])[1] + 'x' + (tag.match(/height="(\d+)"/) || [, '?'])[1];
  if (/pixel|t\.gif|gravatar/i.test(src)) continue;
  if (/logo|flag/i.test(src) && hn > 3) continue;
  console.log(`  ${String(++hn).padStart(2)}. ${wh.padEnd(11)} ${src.split('/').pop().slice(0, 34).padEnd(36)} alt "${alt.slice(0, 42)}"`);
}
console.log(`  -> ${hn} images on the incumbent home page`);

/* ---------- video / background imagery, which counts as image weight ---------- */
console.log('\n=== other media on the home page ===');
for (const pat of [/<video\b[^>]*>/gi, /background-image:\s*url\(([^)]+)\)/gi, /<source\b[^>]*>/gi]) {
  const hits = [...h.matchAll(pat)].map(m => (m[1] || m[0]).slice(0, 90));
  if (hits.length) hits.forEach(x => console.log(`  ${x}`));
}
const lazy = [...h.matchAll(/class="[^"]*lazyload[^"]*"/g)].length;
console.log(`  lazyload elements: ${lazy}`);
