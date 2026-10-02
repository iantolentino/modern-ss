/* Contrast audit for the current palette. WCAG 2.1 relative luminance and
   contrast ratio, computed from the tokens actually in styles.css.

   Run from anywhere:  node tools/contrast.mjs
   The last line reports whether every text pair clears WCAG AA (4.5:1). */
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const tok = {};
for (const m of css.matchAll(/^\s*(--[\w-]+):\s*(#[0-9A-Fa-f]{6})\s*;/gm)) tok[m[1]] = m[2];

const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = hex => {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const WHITE = '#FFFFFF';
console.log('tokens found:', Object.keys(tok).length);
console.log('\n=== text on the light grounds ===');
const pairs = [
  ['--ink', 'primary text'], ['--ink-2', 'secondary text'], ['--ink-3', 'annotation'],
  ['--blue', 'links + primary action'], ['--teal', 'secondary action, record numbers'],
  ['--teal-soft', 'form labels, fact keys'], ['--blue-ink', 'pressed blue'], ['--teal-ink', 'pressed teal'],
];
for (const [t, role] of pairs) {
  if (!tok[t]) { console.log(`  ${t.padEnd(12)} MISSING`); continue; }
  const onWhite = ratio(tok[t], WHITE);
  const onSheet2 = ratio(tok[t], tok['--sheet-2'] || WHITE);
  const aa = onWhite >= 4.5 ? 'AA' : onWhite >= 3 ? 'AA-large only' : 'FAIL';
  console.log(`  ${t.padEnd(12)} ${tok[t].padEnd(8)} on white ${onWhite.toFixed(2).padStart(6)}:1   on --sheet-2 ${onSheet2.toFixed(2).padStart(6)}:1   ${aa}   ${role}`);
}

console.log('\n=== white on the solid brand grounds ===');
for (const t of ['--blue', '--teal', '--ink', '--blue-ink', '--teal-ink']) {
  if (!tok[t]) continue;
  const r = ratio(WHITE, tok[t]);
  console.log(`  white on ${t.padEnd(12)} ${tok[t]}  ${r.toFixed(2).padStart(6)}:1   ${r >= 4.5 ? 'AA' : 'FAIL'}`);
}

console.log('\n=== the highlighter ===');
const marker = tok['--marker'];
console.log(`  --marker ${marker}, ink on it ${ratio(tok['--ink'], marker).toFixed(2)}:1  (AA needs 4.5)`);
console.log(`  --marker ${marker}, ink-2 on it ${ratio(tok['--ink-2'], marker).toFixed(2)}:1`);

console.log('\n=== rules against the sheet (non-text, needs 3:1 only if meaningful) ===');
for (const t of ['--rule', '--rule-mid', '--rule-ink', '--grey']) {
  if (!tok[t]) { console.log(`  ${t} is an rgba/unknown, skipped`); continue; }
}
const worst = pairs.map(([t]) => tok[t] && ratio(tok[t], WHITE)).filter(Boolean).sort((a, b) => a - b)[0];
console.log(`\nlowest text contrast in the palette: ${worst.toFixed(2)}:1`);
console.log(worst >= 4.5 ? 'RESULT: every text colour clears AA on white.' : 'RESULT: something fails AA.');

/* The navy closing band paints its secondary text as white at reduced opacity
   over --ink, so the colour that actually renders is a composite, not a token.
   The token sweep above cannot see it, and this band rendered for the first time
   during the home page re-layout, so these pairs are checked explicitly. */
const rgb = hex => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
const over = (fg, alpha, bg) => {
  const f = rgb(fg), b = rgb(bg);
  return toHex([0, 1, 2].map(i => alpha * f[i] + (1 - alpha) * b[i]));
};

console.log('\n=== white at reduced opacity over the navy band (composited) ===');
const ink = tok['--ink'];
const bandPairs = [
  ['#FFFFFF', 1.00, '.resolution h2', 'heading'],
  ['#FFFFFF', 0.82, '.resolution .prose', 'body'],
  ['#FFFFFF', 0.62, '.resolution__ref .note/.ref', 'reference line'],
  [tok['--marker'], 1.00, '.resolution .btn2', 'secondary action'],
];
for (const [fg, a, sel, role] of bandPairs) {
  const eff = over(fg, a, ink);
  const r = ratio(eff, ink);
  const tag = r >= 4.5 ? 'AA' : r >= 3 ? 'AA-large only' : 'FAIL';
  console.log(`  ${sel.padEnd(30)} ${fg} @ ${a.toFixed(2)} -> ${eff}  ${r.toFixed(2).padStart(6)}:1  ${tag}  ${role}`);
}
const bandWorst = Math.min(...bandPairs.map(([fg, a]) => ratio(over(fg, a, ink), ink)));
console.log(`  lowest in the band: ${bandWorst.toFixed(2)}:1`);
console.log(bandWorst >= 4.5 ? '  RESULT: the navy band clears AA on every text pair.' : '  RESULT: the navy band has a failing pair.');
