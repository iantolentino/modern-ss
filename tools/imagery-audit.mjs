/* Which pages carry photography, and which deliberately do not.
 *
 * The imagery pass is the kind of work that silently regresses: a page rebuilt
 * from a template loses its plates and nothing fails. This reports coverage by
 * folder so the gaps are visible, and names the pages that are meant to have none
 * rather than leaving them to look like oversights.
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

/* Pages with no photograph on purpose, and the reason. Anything not on this list
   and not carrying a photograph is a gap. */
const INTENTIONALLY_BARE = {
  'privacy.html': 'a legal document; imagery would only push the text further down',
  '404.html': 'a dead end; the useful thing is the route back, not a picture',
  'academy.html': 'enrolment particulars and a form; the role tracks live on course-outline.html',
  'role-insurance-specialist.html': 'the incumbent publishes no photograph for this role; it keeps the stamp rather than borrowing another role\u2019s face',
  'role-pm-customer-care.html': 'the incumbent publishes no photograph for this role; it keeps the stamp rather than borrowing another role\u2019s face',
};

/* Each entry is a regex over the src. The client portraits are flat at the top of
   assets/ rather than in a folder of their own, so a `assets/client/` test missed
   all nine of them and reported the testimonials page as carrying no photography
   when it carries nine client faces. */
const KINDS = {
  people: [/assets\/people\//, 'a named officer'],
  portrait: [/assets\/portrait\//, 'a role photograph'],
  exec: [/assets\/exec\//, 'an office bearer'],
  post: [/assets\/post\//, 'a post or office photograph'],
  client: [/assets\/client-/, 'a client portrait'],
};

const rows = [];
for (const f of (await readdir(ROOT)).filter(f => f.endsWith('.html')).sort()) {
  const src = await readFile(path.join(ROOT, f), 'utf8');
  const imgs = [...src.matchAll(/<img[^>]*>/g)].map(m => m[0]);
  const counts = {};
  for (const [kind, [re]] of Object.entries(KINDS)) {
    const n = imgs.filter(t => re.test(t)).length;
    if (n) counts[kind] = n;
  }
  const photos = Object.values(counts).reduce((a, b) => a + b, 0);
  rows.push({ f, photos, counts, total: imgs.length });
}

const bare = rows.filter(r => r.photos === 0);
const covered = rows.filter(r => r.photos > 0);
const unexplained = bare.filter(r => !INTENTIONALLY_BARE[r.f]);

console.log(`  ${covered.length} of ${rows.length} pages carry photography\n`);
console.log('  photos  other  total  page');
for (const r of rows.filter(r => r.photos > 0).sort((a, b) => b.photos - a.photos)) {
  console.log(`  ${String(r.photos).padStart(6)}${String(r.total - r.photos).padStart(7)}${String(r.total).padStart(7)}  ${r.f}`);
}

console.log(`\n  ${bare.length} pages carry none:`);
for (const r of bare) {
  const why = INTENTIONALLY_BARE[r.f];
  console.log(`    ${why ? 'on purpose ' : 'UNEXPLAINED'}  ${r.f.padEnd(38)}${why ?? ''}`);
}

const tally = {};
for (const r of rows) for (const [k, n] of Object.entries(r.counts)) tally[k] = (tally[k] ?? 0) + n;
console.log('\n  image references by kind:');
for (const [k, n] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${String(n).padStart(4)}  ${k.padEnd(10)} ${KINDS[k][1]}`);
}

if (unexplained.length) {
  console.log(`\n  ${unexplained.length} page(s) carry no photograph and are not declared above:`);
  for (const r of unexplained) console.log(`    ${r.f}`);
  process.exitCode = 1;
} else {
  console.log('\n  every page without a photograph is declared, with its reason.');
}
