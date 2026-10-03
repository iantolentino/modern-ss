/* Verify the post imagery actually landed, and that every variant the srcset
   advertises exists at the width it claims.
 *
 * The manifest is the build's source of truth, so this checks the rendered HTML
 * against the files on disk rather than against the manifest: a srcset that
 * names a 1200w candidate for a 600px file is exactly the bug this exists to
 * catch, and it would pass a manifest-only check.
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const html = (await readdir(ROOT)).filter(f => f.endsWith('.html'));

const seen = new Map();          // file -> [claimed widths]
const pagesWithHero = [];
const pagesWithThumb = [];
let missing = 0;

for (const f of html) {
  const src = await readFile(path.join(ROOT, f), 'utf8');
  if (/post-fig--hero/.test(src)) pagesWithHero.push(f);

  const figs = [...src.matchAll(/<span class="post-fig[^"]*"><img ([^>]*)>/g)];
  if (figs.length) pagesWithThumb.push(`${f} (${figs.length})`);

  for (const [, attrs] of figs) {
    const srcset = /srcset="([^"]+)"/.exec(attrs);
    const single = /src="([^"]+)"/.exec(attrs);
    const candidates = srcset
      ? srcset[1].split(',').map(s => s.trim().split(/\s+/))
      : [[single[1], null]];
    for (const [url, descriptor] of candidates) {
      if (!seen.has(url)) seen.set(url, []);
      if (descriptor) seen.get(url).push(descriptor);
    }
  }
}

/* Now confirm each file exists and its real pixel width matches its descriptor. */
const dims = new Map();
for (const url of seen.keys()) {
  const p = path.join(ROOT, url);
  try {
    const buf = await readFile(p);
    // WebP: 'RIFF' .... 'WEBP' then a chunk; VP8L/VP8 /VP8X carry size differently,
    // so fall back to the manifest-independent check of "does it exist at all".
    dims.set(url, buf.length);
  } catch {
    console.log(`  MISSING  ${url}`);
    missing++;
  }
}

const total = [...dims.values()].reduce((a, b) => a + b, 0);
console.log(`  post images referenced: ${seen.size}`);
console.log(`  all present on disk:    ${seen.size - missing} of ${seen.size}`);
console.log(`  total weight:           ${Math.round(total / 1024)}kb`);
console.log(`  pages with a hero:      ${pagesWithHero.length}`);
console.log(`  pages with thumbnails:  ${pagesWithThumb.length}`);

/* The declared width must match the real width. Node can read WebP dimensions
   from the VP8X/VP8/VP8L header. */
async function webpSize(p) {
  const b = await readFile(p);
  const fourcc = b.toString('ascii', 12, 16);
  if (fourcc === 'VP8X') return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
  if (fourcc === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (fourcc === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  return null;
}

let wrong = 0;
for (const [url, descriptors] of seen) {
  if (!descriptors.length) continue;
  const size = await webpSize(path.join(ROOT, url));
  if (!size) { console.log(`  UNREADABLE ${url}`); wrong++; continue; }
  const claimed = parseInt(descriptors[0], 10);
  if (size[0] !== claimed) {
    console.log(`  WIDTH MISMATCH ${url}: srcset says ${claimed}w, file is ${size[0]}px`);
    wrong++;
  }
}
console.log(`  srcset widths that disagree with the file: ${wrong}`);
