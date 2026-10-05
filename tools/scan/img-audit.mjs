/* Two questions, answered from the captured live pages and the asset bytes:

   1. Does the incumbent's team page actually pair each portrait with a name and
      a role? This decides whether we may label faces or must keep them unpaired.
   2. What are the real pixel dimensions of every asset? Layout depends on it, and
      three of the executive files are ~1MB, which is a conversion problem.

   Run:  node img-audit.mjs */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const SCAN = 'C:/Users/ianto/Downloads/ai-tests/strata-scan';
const ASSETS = 'C:/Users/ianto/Downloads/ai-tests/strata-modern/assets';

/* ---------- 1. the incumbent's team page ---------- */
const html = readFileSync(path.join(SCAN, 'pages/our-awesome-team.html'), 'utf8');

// Strip tags but keep img markers inline, so text order survives.
const flat = html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<img\b[^>]*>/gi, m => `\n[[IMG ${(m.match(/src="([^"]+)"/) || [, '?'])[1].split('/').pop()}]]\n`)
  .replace(/<[^>]+>/g, '\n')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#8217;|&rsquo;/g, "'")
  .split('\n')
  .map(s => s.trim())
  .filter(Boolean);

console.log('=== incumbent team page: portrait <-> name pairing ===');
let shown = 0;
for (let i = 0; i < flat.length && shown < 24; i++) {
  if (!flat[i].startsWith('[[IMG')) continue;
  const after = flat.slice(i + 1, i + 5).filter(s => !s.startsWith('[[IMG'));
  console.log(`  ${flat[i].replace('[[IMG ', '').replace(']]', '').padEnd(26)} -> ${after.slice(0, 3).join(' | ').slice(0, 78)}`);
  shown++;
}
if (!shown) console.log('  (no image markers found - page may load portraits via CSS or lazy attributes)');

const teamRefs = [...html.matchAll(/team-[a-z-]+\.(?:jpg|webp|png)/gi)].map(m => m[0]);
console.log(`\n  team-* references in that page: ${new Set(teamRefs).size} distinct of ${teamRefs.length}`);
console.log(`  name-like strings near the grid: ${(html.match(/<h[34][^>]*>[\s\S]{0,60}?<\/h[34]>/gi) || []).length} headings`);

/* ---------- 2. real dimensions of every image ---------- */
const size = (file) => {
  const b = readFileSync(file);
  if (b.slice(1, 4).toString() === 'PNG') return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b[0] === 0xFF && b[1] === 0xD8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xFF) { i++; continue; }
      const m = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) {
        return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      }
      i += 2 + len;
    }
  }
  if (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP') {
    const t = b.slice(12, 16).toString();
    if (t === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (t === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (t === 'VP8L') {
      const n = b.readUInt32LE(21);
      return [(n & 0x3fff) + 1, ((n >> 14) & 0x3fff) + 1];
    }
  }
  return null;
};

console.log('\n=== asset dimensions, largest pixels first ===');
const rows = [];
for (const f of readdirSync(ASSETS)) {
  if (!/\.(png|jpe?g|webp)$/i.test(f)) continue;
  const d = size(path.join(ASSETS, f));
  const bytes = readFileSync(path.join(ASSETS, f)).length;
  rows.push({ f, d, bytes });
}
rows.sort((a, b) => ((b.d?.[0] * b.d?.[1]) || 0) - ((a.d?.[0] * a.d?.[1]) || 0));
for (const r of rows) {
  const px = r.d ? `${r.d[0]}x${r.d[1]}` : 'unreadable';
  const mp = r.d ? ((r.d[0] * r.d[1]) / 1e6).toFixed(2) + 'MP' : '';
  const kb = (r.bytes / 1024).toFixed(0).padStart(5) + 'kb';
  console.log(`  ${r.f.padEnd(34)} ${px.padEnd(12)} ${mp.padEnd(8)} ${kb}`);
}
const total = rows.reduce((s, r) => s + r.bytes, 0);
console.log(`\n  ${rows.length} images, ${(total / 1024 / 1024).toFixed(2)}MB total`);
