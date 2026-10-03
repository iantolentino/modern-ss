/* Read the detector's JSON without going through a shell redirect.
 *
 * PowerShell's `>` rewrites the stream with a BOM and the wrong code page, so the
 * file arrives as mojibake and JSON.parse dies on the first byte. Spawning the
 * CLI and taking stdout as a buffer keeps the payload intact.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const CMD = process.env.IMPECCABLE_CMD;
const targets = process.argv.slice(2);
if (!CMD || !targets.length) {
  console.error('usage: IMPECCABLE_CMD=<cmd> node detect-json.mjs <files...>');
  process.exit(2);
}

/* The CLI exits non-zero whenever it has findings, so execFileSync throws on the
   normal path. The payload is still on the error's stdout. */
let raw;
try {
  raw = execFileSync(CMD, ['detect', ...targets, '--json'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });
} catch (e) {
  if (!e.stdout) throw e;
  raw = e.stdout;
}

/* Strip a BOM if one survived, then parse. */
const clean = raw.replace(/^\uFEFF/, '');
const parsed = JSON.parse(clean);
const arr = Array.isArray(parsed) ? parsed : (parsed.findings ?? parsed.results ?? []);

writeFileSync('_d-new.json', JSON.stringify(arr, null, 2));
console.log(`findings: ${arr.length}  (saved _d-new.json)`);

const by = new Map();
for (const x of arr) {
  const k = x.antipattern ?? x.rule ?? '?';
  if (!by.has(k)) by.set(k, []);
  by.get(k).push(x);
}

for (const [rule, list] of [...by].sort((a, b) => b[1].length - a[1].length)) {
  const sev = list[0].severity ?? '';
  console.log(`\n${rule}  x${list.length}  [${sev}]`);
  const seen = new Map();
  for (const x of list) {
    const key = `${(x.snippet ?? '').trim().slice(0, 78)}`;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  for (const [k, c] of [...seen].slice(0, 8)) console.log(`   ${String(c).padStart(3)}x  ${k}`);
}
