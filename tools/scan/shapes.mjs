import { readFileSync } from 'node:fs';
const raw = readFileSync(process.argv[2], 'utf8');
const data = JSON.parse(raw.slice(raw.indexOf('[')));
const rule = process.argv[3];
const seen = new Map();
for (const f of data) {
  if (f.antipattern !== rule) continue;
  const s = String(f.snippet || '');
  if (!seen.has(s)) seen.set(s, { n: 0, files: new Set() });
  const e = seen.get(s); e.n++; e.files.add(f.file.split('\\').pop());
}
console.log(`${rule}: ${[...seen.values()].reduce((a, b) => a + b.n, 0)} findings in ${seen.size} distinct shapes\n`);
for (const [s, v] of [...seen.entries()].sort((a, b) => b[1].n - a[1].n)) {
  console.log(`x${String(v.n).padStart(4)}  ${s}`);
  console.log(`        e.g. ${[...v.files].slice(0, 3).join(', ')}`);
}
