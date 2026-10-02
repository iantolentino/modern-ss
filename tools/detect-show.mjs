/* Dump every finding for one rule (or all rules matching a substring), with the
   detail the detector recorded, so a regression can be located exactly.

   Reads the _detect.json that tools/detect-all.mjs writes.
   Usage:  node tools/detect-show.mjs cramped */
import { readFileSync } from 'node:fs';
const want = (process.argv[2] || '').toLowerCase();
const data = JSON.parse(readFileSync(new URL('../_detect.json', import.meta.url), 'utf8'));
const arr = Array.isArray(data) ? data : (data.findings || data.results || []);
let n = 0;
for (const f of arr) {
  const rule = (f.antipattern || f.rule || '').toLowerCase();
  if (want && !rule.includes(want)) continue;
  n++;
  const file = (f.file || f.path || '').split(/[\\/]/).pop();
  const detail = f.detail || f.message || f.selector || f.snippet || '';
  console.log(`  ${rule}  [${file}:${f.line || f.lineNumber || '?'}]`);
  console.log(`      ${String(detail).replace(/\s+/g, ' ').slice(0, 220)}`);
  for (const k of ['element', 'excerpt', 'text', 'value', 'col', 'computed']) {
    if (f[k]) console.log(`      ${k}: ${String(f[k]).replace(/\s+/g, ' ').slice(0, 180)}`);
  }
}
console.log(`\n  ${n} matching findings`);
