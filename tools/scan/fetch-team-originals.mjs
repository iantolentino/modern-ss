/* Fetch the uncropped originals for the team portraits.
 *
 * The portraits are not tight head shots in the source. Measuring the raw silhouette
 * shows the head in the top 40%, a narrow neck at 40-70%, and the shoulders widening
 * back to 0.90 of the full width in the bottom 30%. Our crop takes the top 72.5% to
 * force a 0.543-aspect photo into a 3:4 box, which lands just above the shoulder
 * line: head and neck, no shoulders. That is the "only teeth" complaint, and the
 * face detector could never have caught it because the face was never cut.
 *
 * The files we hold are WordPress generated sizes. assets/PROVENANCE.json records the
 * upload path behind each one, and stripping the -WxH suffix asks for the original:
 * 908x1671 rather than 480x883, the same framing at twice the resolution. That is
 * what this fetches, into raw-team-orig/.
 *
 * Run: node strata-scan/fetch-team-originals.mjs
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(import.meta.dirname, 'raw-team-orig');
await mkdir(OUT, { recursive: true });

const PROV = JSON.parse(await readFile(path.join(ROOT, 'strata-modern', 'assets', 'PROVENANCE.json'), 'utf8'));
const rows = PROV.assets.filter(r => /assets\/people\//.test(r.asset) && r.source);

const original = url => url.replace(/-\d+x\d+(\.(?:jpe?g|png|webp|gif))$/i, '$1');

const have = new Set(await readdir(OUT));
let ok = 0, skipped = 0, failed = 0;

for (const r of rows) {
  const slug = path.basename(r.asset).replace(/\.webp$/, '');
  const url = original(r.source);
  const ext = (url.match(/\.(jpe?g|png|webp|gif)$/i) || [, 'jpg'])[1].toLowerCase();
  const name = `${slug}.${ext}`;

  if (have.has(name)) { skipped++; continue; }

  try {
    const res = await fetch(url);
    if (!res.ok) { console.log(`  ${res.status}  ${slug}  ${url}`); failed++; continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 2000) { console.log(`  too small (${buf.length}b)  ${slug}`); failed++; continue; }
    await writeFile(path.join(OUT, name), buf);
    console.log(`  ${(buf.length / 1024).toFixed(0).padStart(4)}kb  ${name}`);
    ok++;
  } catch (e) {
    console.log(`  ERR  ${slug}  ${e.message}`);
    failed++;
  }
}

console.log(`\n  fetched ${ok}, already held ${skipped}, failed ${failed}`);
console.log(`  wrote ${path.relative(ROOT, OUT)}/`);
