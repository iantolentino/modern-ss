import { readFile, readdir } from 'node:fs/promises';
const slug = s => s.toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/-\d+x\d+$/, '').replace(/-scaled$/, '').replace(/-e\d{10,}$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const SCAN = 'C:/Users/ianto/Downloads/ai-tests/strata-scan';
const HOST = 'https://stratastaffglobal.com';
const files = (await readdir(SCAN + '/pages')).filter(f => f.endsWith('.html'));
const index = new Map();
for (const p of files) {
  const html = await readFile(`${SCAN}/pages/${p}`, 'utf8');
  for (const m of html.matchAll(/(?:data-src|src|href)="([^"]+\.(?:webp|png|jpe?g|svg|gif))(?:\?[^"]*)?"/gi)) {
    const base = m[1].split('/').pop();
    index.set(slug(base), base);
    index.set(slug(base.replace(/-\d+x\d+/, '')), base);
  }
}
console.log('index size', index.size);
// what do the team-page sources look like?
const team = [...index.entries()].filter(([k, v]) => /david|pineda|beltran|bulaun|adriano/i.test(v));
console.log('\nteam-ish source basenames:');
for (const [k, v] of team.slice(0, 12)) console.log('  ', k, '=>', v);
console.log('\nall source basenames containing "model":');
for (const [k, v] of [...index.entries()].filter(([k, v]) => /model/i.test(v)).slice(0, 8)) console.log('  ', k, '=>', v);
console.log('\nsource basenames for clients (baldwin etc):');
for (const [k, v] of [...index.entries()].filter(([k, v]) => /baldwin|haines|cvetko|mowll|stanton/i.test(v)).slice(0, 8)) console.log('  ', k, '=>', v);
