/* Do the uncropped originals exist, and are they less tight than the crops we have?
 *
 * The portraits are tight head shots: the face fills 0.55 of the frame width in the
 * shipped files, and measuring the raws shows the same 0.55 -- so the crop is not
 * zooming, the tightness is in the file the incumbent serves. But the files we hold
 * are WordPress *generated* sizes (-163x300, -480x883). WordPress keeps the upload
 * beside them, and the upload is often a taller, looser frame. If it is, the
 * head-and-shoulders framing the brief wants is available and the generated crops
 * were simply never the right source.
 *
 * Reads assets/PROVENANCE.json for the upload path behind each portrait, asks the
 * host for the original, and reports its dimensions and aspect.
 *
 * Run: node strata-scan/probe-originals.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PROV = JSON.parse(await readFile(path.join(ROOT, 'strata-modern', 'assets', 'PROVENANCE.json'), 'utf8'));

const rows = PROV.assets ?? PROV.rows ?? [];
if (!rows.length) {
  console.log('  no rows found in PROVENANCE.json; expected an assets array');
  process.exit(1);
}

// widths read from the file header, so a small download is still enough
function dims(buf) {
  if (buf.length < 32) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50) {                       // png
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {                       // jpeg
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
    return null;
  }
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') {
    const t = buf.slice(12, 16).toString();
    if (t === 'VP8X') return { w: (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1, h: (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1 };
    if (t === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    if (t === 'VP8L') {
      const b = buf.readUInt32LE(21);
      return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
    }
  }
  return null;
}

// strip the WordPress size suffix: Foo-480x883.jpg -> Foo.jpg
function original(url) {
  return url.replace(/-\d+x\d+(\.(?:jpe?g|png|webp|gif))$/i, '$1');
}

const people = rows.filter(r => /people\//.test(r.asset ?? '')).slice(0, 12);
console.log(`  ${rows.length} provenance rows, ${people.length} of them portraits\n`);
console.log(`  ${'asset'.padEnd(34)}${'we hold'.padEnd(13)}${'original'.padEnd(13)}aspect   verdict`);

// the dimensions of what we ship, read from the file rather than assumed
async function heldDims(rel) {
  try {
    const buf = await readFile(path.join(ROOT, rel.replace(/^assets\//, 'strata-modern/assets/')));
    return dims(buf);
  } catch { return null; }
}

const results = [];
for (const r of people.slice(0, 12)) {
  const src = r.source ?? '';
  if (!src) { console.log(`  ${r.asset.padEnd(34)}no source url`); continue; }
  const orig = original(src);
  let got = null;
  try {
    const res = await fetch(orig);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      got = dims(buf);
    }
  } catch { /* host may not serve it; report as absent */ }

  const hd = await heldDims(r.asset);
  const held = hd ? `${hd.w}x${hd.h}` : '?';
  if (!got) {
    console.log(`  ${r.asset.padEnd(34)}${held.padEnd(13)}${'not served'.padEnd(13)}         keep what we have`);
    results.push({ asset: r.asset, original: null });
    continue;
  }
  const ar = got.w / got.h;
  // our crops run 0.75 (3:4) and 0.80 (4:5); a much taller original means more scene
  const verdict = ar < 0.65 ? 'TALLER - more room, worth re-cropping' : 'similar frame';
  console.log(`  ${r.asset.padEnd(34)}${held.padEnd(13)}${(got.w + 'x' + got.h).padEnd(13)}${ar.toFixed(2)}     ${verdict}`);
  results.push({ asset: r.asset, source: orig, original: got, aspect: +ar.toFixed(3) });
}

await writeFile(path.join(ROOT, 'strata-scan', '_originals.json'), JSON.stringify(results, null, 1), 'utf8');
console.log(`\n  wrote strata-scan/_originals.json`);
