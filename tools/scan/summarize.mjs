import { readFileSync } from 'node:fs';
const file = process.argv[2];
const raw = readFileSync(file, 'utf8');
const start = raw.indexOf('[');
const data = JSON.parse(raw.slice(start));
const by = new Map();
for (const f of data) {
  const k = `${f.antipattern}||${f.severity}`;
  if (!by.has(k)) by.set(k, { n: 0, name: f.name, cat: f.category, samples: new Set(), desc: f.description });
  const e = by.get(k);
  e.n++;
  if (e.samples.size < 6) e.samples.add(String(f.snippet || '').slice(0, 120));
}
console.log(`total findings: ${data.length}\n`);
const rows = [...by.entries()].sort((a, b) => b[1].n - a[1].n);
for (const [k, v] of rows) {
  const [rule, sev] = k.split('||');
  console.log(`\n### ${rule}  [${sev}] ${v.cat}  x${v.n}   — ${v.name}`);
  for (const s of v.samples) console.log(`      · ${s}`);
}
console.log('\n\n---- description of top rule ----');
console.log(rows[0][1].desc);
