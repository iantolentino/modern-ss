/* List the prose in build.mjs, longest first, so the trim targets the real fat
   rather than whatever happens to be on screen. */
import { readFile } from 'node:fs/promises';

const src = await readFile('../strata-modern/build.mjs', 'utf8');
const lines = src.split('\n');

// prose = sentences inside markup, i.e. text between > and < , or in lede/desc
// strings. Strip template holes so they do not inflate the count.
const rows = [];
lines.forEach((line, i) => {
  const found = [];
  for (const m of line.matchAll(/>([^<>{}]{55,})</g)) found.push(m[1]);
  for (const m of line.matchAll(/(?:desc|lede|title|label|q|blurb|text):\s*'([^']{55,})'/g)) found.push(m[1]);
  for (const m of line.matchAll(/(?:desc|lede|title|label|q|blurb|text):\s*"([^"]{55,})"/g)) found.push(m[1]);
  for (const m of line.matchAll(/`([^`]{55,})`/g)) {
    // only prose-looking template strings, not code
    if (/[;=]{2}|=>|\$\{.*\$\{/.test(m[1])) continue;
    if (/^[\s<]*(div|section|table|ul|ol|nav|header|footer)[\s>]/.test(m[1].trim())) continue;
    found.push(m[1]);
  }
  for (const t of found) {
    const clean = t.replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
    const words = clean.split(/\s+/).filter(Boolean).length;
    if (words >= 9) rows.push({ line: i + 1, words, text: clean });
  }
});

rows.sort((a, b) => b.words - a.words);
const total = rows.reduce((a, r) => a + r.words, 0);
console.log(`prose blocks of 9+ words: ${rows.length}, totalling ${total} words\n`);
console.log('  line  words  text');
for (const r of rows.slice(0, 70)) {
  console.log(`  ${String(r.line).padStart(4)}  ${String(r.words).padStart(5)}  ${r.text.slice(0, 108)}${r.text.length > 108 ? '…' : ''}`);
}
const buckets = {};
for (const r of rows) buckets[r.words] = (buckets[r.words] || 0) + 1;
console.log('\nif every block of 20+ words lost a third:');
const long = rows.filter(r => r.words >= 20);
console.log(`  ${long.length} blocks, ${long.reduce((a, r) => a + r.words, 0)} words -> would save ~${Math.round(long.reduce((a, r) => a + r.words, 0) / 3)}`);
