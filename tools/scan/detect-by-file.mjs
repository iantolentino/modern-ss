/* Which pages carry the numbered-section-labels advisory, and how many per page.
   A throwaway reader for _detect.json while checking whether the numbering fix
   moved the total. */
import { readFileSync } from 'node:fs';

const arr = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const rule = process.argv[3] || 'numbered-section-labels';

const by = new Map();
for (const x of arr) {
  if ((x.antipattern || x.rule) !== rule) continue;
  const f = (x.file || x.path || '?').split(/[\\/]/).pop();
  by.set(f, (by.get(f) ?? 0) + 1);
}
const rows = [...by].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
console.log(`${rule}: ${rows.reduce((s, r) => s + r[1], 0)} across ${rows.length} files`);
for (const [f, c] of rows) console.log(`  ${String(c).padStart(3)}  ${f}`);
