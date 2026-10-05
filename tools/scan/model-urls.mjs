/* The incumbent home page's role portraits and section images, with full URLs.
   These are the assets the site is actually built on and they were missed in the
   original scan. Prints everything needed to fetch them. */
import { readFileSync } from 'node:fs';
const h = readFileSync('C:/Users/ianto/Downloads/ai-tests/strata-scan/pages/home.html', 'utf8');

const want = /Model-\d+|The-Strata-Staff-Difference|Tailored-Strategic|Joshua-Baldwin/i;
const seen = new Set();
console.log('=== full img tags for the role portraits and section images ===');
for (const m of h.matchAll(/<img\b[^>]*>/gi)) {
  const tag = m[0];
  if (!want.test(tag)) continue;
  const src = (tag.match(/(?:data-src|src)="([^"]+)"/) || [, ''])[1];
  const base = src.split('/').pop();
  if (seen.has(base)) continue;
  seen.add(base);
  console.log(`\n  ${base}`);
  for (const a of ['src', 'data-src', 'srcset', 'sizes', 'alt', 'width', 'height', 'class']) {
    const v = (tag.match(new RegExp(`\\s${a}="([^"]*)"`)) || [, ''])[1];
    if (v) console.log(`     ${a.padEnd(9)} ${v.replace(/\s+/g, ' ').slice(0, 150)}`);
  }
}

console.log('\n=== base URL in use ===');
const abs = [...h.matchAll(/(?:data-src|src)="(https?:\/\/[^"]+)"/g)].map(m => m[1]);
console.log(`  absolute asset URLs: ${abs.length}`);
if (abs.length) console.log(`  e.g. ${abs.find(u => /Model-\d/.test(u)) || abs[0]}`);
const rel = [...h.matchAll(/(?:data-src|src)="(\/[^"]*wp-content[^"]*)"/g)].map(m => m[1]);
console.log(`  root-relative asset URLs: ${rel.length}`);
if (rel.length) console.log(`  e.g. ${rel.find(u => /Model-\d/.test(u)) || rel[0]}`);

/* Which page does the difference/capacity artwork belong to, and is it a photo? */
console.log('\n=== section artwork dimensions on the home page ===');
for (const m of h.matchAll(/<img\b[^>]*>/gi)) {
  const tag = m[0];
  const src = (tag.match(/(?:data-src|src)="([^"]+)"/) || [, ''])[1];
  if (!/Difference|Tailored|Model-/.test(src)) continue;
  console.log(`  ${src.split('/').pop().padEnd(40)} ${(tag.match(/width="(\d+)"/) || [, '?'])[1]}x${(tag.match(/height="(\d+)"/) || [, '?'])[1]}`);
}

/* Maristella Gaton: the capture reused Marey's file. Check the raw markup so we
   never put the wrong name under a face. */
console.log('\n=== Maristella Gaton entry, raw ===');
const i = h.indexOf('Maristella');
console.log(i < 0 ? '  name not found in home.html' : '  ' + h.slice(Math.max(0, i - 700), i + 120).replace(/\s+/g, ' ').slice(-820));
