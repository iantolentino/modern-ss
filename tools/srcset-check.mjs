/* Every url inside a srcset, checked against the disk.
 *
 * The build's own orphan report and final-check both walk `src` attributes. A
 * `srcset` is where the width candidates live, so an image can be validated in
 * one place and broken in another: a browser on a wide screen picks the 800w
 * candidate, and if that file is missing the visitor sees nothing while the
 * `src` fallback still resolves. This closes that gap.
 *
 * It also reports srcset files that exist but are referenced by nothing, which
 * is how the orphan list should have read in the first place.
 */
import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

const pages = (await readdir(ROOT)).filter(f => f.endsWith('.html'));
const used = new Set();
const missing = [];

for (const p of pages) {
  const html = await readFile(path.join(ROOT, p), 'utf8');
  // srcset="a.webp 400w, b.webp 800w" — also covers image-set() style lists.
  const sets = [...html.matchAll(/srcset="([^"]+)"/g)];
  for (const [, list] of sets) {
    for (const part of list.split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (!url || /^(https?:)?\/\//.test(url) || url.startsWith('data:')) continue;
      const rel = url.replace(/^\.?\//, '');
      used.add(rel);
      try {
        await access(path.join(ROOT, rel));
      } catch {
        missing.push({ page: p, url: rel });
      }
    }
  }
}

/* Every shipped image, so we can name what nothing points at. Paths are built
   with forward slashes throughout: mixing separators on Windows made every
   nested file look like an orphan with a doubled directory in its name. */
const IMG = /\.(webp|png|jpe?g|svg|avif)$/i;
async function walk(dir) {
  const out = [];
  for (const e of await readdir(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`.replace(/\\/g, '/');
    if (e.isDirectory()) out.push(...await walk(rel));
    else if (IMG.test(e.name)) out.push(rel);
  }
  return out;
}

const onDisk = await walk('assets');
const orphans = onDisk.filter(p => !used.has(p));

/* Also scan plain src=, <link href> and CSS url() so "orphan" really means
   "nothing in the shipped page or stylesheet points here". Without the last two
   the favicon and the marker stroke both read as orphans when they are load
   bearing. */
const srcUsed = new Set();
const NORM = u => u.replace(/^\.?\//, '').split(/[?#]/)[0];

for (const p of pages) {
  const html = await readFile(path.join(ROOT, p), 'utf8');
  for (const [, url] of html.matchAll(/src="([^"]+)"/g)) {
    if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) continue;
    srcUsed.add(NORM(url));
  }
  for (const [, url] of html.matchAll(/<link[^>]+href="([^"]+)"/g)) {
    if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) continue;
    srcUsed.add(NORM(url));
  }
  // inline style="...url(...)..." — group 2 is the url, group 1 is its quote
  for (const [, , list] of html.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) {
    if (/^(https?:)?\/\//.test(list) || list.startsWith('data:')) continue;
    srcUsed.add(NORM(list));
  }
}

/* The stylesheet is shipped alongside every page, so anything it points at is
   referenced. url() here is relative to the stylesheet, which sits at the root. */
const css = await readFile(path.join(ROOT, 'styles.css'), 'utf8');
for (const [, , url] of css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) {
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) continue;
  srcUsed.add(NORM(url));
}

const realOrphans = orphans.filter(p => !srcUsed.has(p));

console.log(`srcset urls across ${pages.length} pages: ${used.size}`);
console.log(`  missing from disk: ${missing.length}`);
for (const m of missing.slice(0, 20)) console.log(`    ${m.page} -> ${m.url}`);

console.log(`\nimages on disk: ${onDisk.length}`);
console.log(`  pointed at by neither src nor srcset: ${realOrphans.length}`);
for (const o of realOrphans) console.log(`    ${o}`);

if (missing.length) process.exitCode = 1;
