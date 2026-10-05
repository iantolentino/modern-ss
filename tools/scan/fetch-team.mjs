/* Pull the team portraits at a size that can actually show a face.

   The original scan saved only the 163x300 thumbnails, which is why the board
   could not be shown at any real size. Every portrait has WordPress variants up
   to 908w; 480w is the sweet spot for a wall or a card on a 2x display.

   Writes to assets/raw-team/ so the optimiser can work from full-quality sources.
   Run:  node fetch-team.mjs */
import { writeFileSync, mkdirSync } from 'node:fs';
import { readFileSync } from 'node:fs';

const BASE = 'https://stratastaffglobal.com';
const SCAN = 'C:/Users/ianto/Downloads/ai-tests/strata-scan/pages';
const OUT = 'C:/Users/ianto/Downloads/ai-tests/strata-scan/raw-team';
mkdirSync(OUT, { recursive: true });

const html = readFileSync(`${SCAN}/our-awesome-team.html`, 'utf8');

/* Rebuild the grid order: image -> the name that follows it. This is the label
   the incumbent itself publishes, so we are copying a real pairing, not making
   one up. */
const flat = html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<img\b[^>]*>/gi, m => {
    const src = (m.match(/(?:data-src|src)="([^"]+)"/) || [, ''])[1];
    const srcset = (m.match(/srcset="([^"]+)"/) || [, ''])[1];
    return `\n[[IMG|${src}|${srcset}]]\n`;
  })
  .replace(/<[^>]+>/g, '\n')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, "'")
  .split('\n').map(s => s.trim()).filter(Boolean);

const people = [];
for (let i = 0; i < flat.length; i++) {
  if (!flat[i].startsWith('[[IMG|')) continue;
  const [, src, srcset] = flat[i].slice(2, -2).split('|');
  const stem = src.split('/').pop().replace(/-\d+x\d+(?=\.\w+$)/, '');
  if (/flag|logo|reinsw|pixel|strata|^t\./i.test(stem)) continue;
  const name = flat[i + 1] || '', role = flat[i + 2] || '';
  if (!name || name.startsWith('[[') || name.length > 46) continue;

  const cands = [...srcset.matchAll(/(\S+)\s+(\d+)w/g)].map(m => ({ url: m[1], w: +m[2] }));
  const pick = cands.filter(c => c.w >= 480).sort((a, b) => a.w - b.w)[0]
    || cands.sort((a, b) => b.w - a.w)[0];
  if (!pick) continue;
  people.push({ stem, name, role, url: pick.url.startsWith('http') ? pick.url : BASE + pick.url, w: pick.w });
}

const seen = new Set();
const list = people.filter(p => !seen.has(p.stem) && seen.add(p.stem));
console.log(`fetching ${list.length} team portraits\n`);

let ok = 0, bytes = 0;
for (const p of list) {
  const ext = p.url.split('.').pop();
  const dest = `${OUT}/${p.stem}.${ext}`;
  try {
    const r = await fetch(p.url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; site-restoration/1.0)' } });
    if (!r.ok) { console.log(`  ${p.stem.padEnd(18)} HTTP ${r.status}`); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    writeFileSync(dest, buf);
    ok++; bytes += buf.length;
    console.log(`  ${p.stem.padEnd(18)} ${String(p.w).padStart(4)}w ${(buf.length / 1024).toFixed(0).padStart(5)}kb  ${p.name} — ${p.role.slice(0, 30)}`);
  } catch (e) { console.log(`  ${p.stem.padEnd(18)} FAILED ${String(e).slice(0, 50)}`); }
}

/* Persist the pairing so the build uses the incumbent's own labels. */
writeFileSync(`${OUT}/roster.json`, JSON.stringify(list.map(({ stem, name, role }) => ({ stem, name, role })), null, 2) + '\n');
console.log(`\n${ok} portraits, ${(bytes / 1024).toFixed(0)}kb`);
console.log('roster.json written with the published name/role pairing');
