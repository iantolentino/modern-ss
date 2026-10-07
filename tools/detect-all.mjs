/* Run the impeccable detector over every page and summarise by antipattern.
   The detector's JSON is a bare array, and each entry's rule name is under
   `antipattern` (not `findings`/`rule`).

   Usage:  node tools/detect-all.mjs
   Needs the impeccable install, which is not vendored here. Point the two
   environment variables at it:

     IMPECCABLE_HOME  the directory holding bin/<version>/impeccable.exe
     IMPECCABLE_CMD   the impeccable launcher (.cmd)

   Both are required; the script stops with a clear message rather than running
   the wrong binary. Writes _detect.json next to the pages, which
   tools/detect-show.mjs then reads. */
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, openSync, closeSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SITE = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const HOME = process.env.IMPECCABLE_HOME;
const CMD = process.env.IMPECCABLE_CMD;

if (!HOME || !CMD) {
  console.error('detect-all: set IMPECCABLE_HOME and IMPECCABLE_CMD first.');
  console.error('  IMPECCABLE_HOME  directory holding bin/<version>/impeccable.exe');
  console.error('  IMPECCABLE_CMD   the impeccable launcher (.cmd)');
  process.exit(2);
}

const pages = readdirSync(SITE).filter(f => f.endsWith('.html')).sort();
const out = path.join(SITE, '_detect.json');

const bin = path.join(HOME, 'bin', '0.1.6', 'impeccable.exe');
const env = { ...process.env, IMPECCABLE_HOME: HOME, IMPECCABLE_BIN: bin };
/* The detector's stdout goes straight onto a file descriptor, never through a
   pipe. Capturing a pipe needs a named pipe, which a confined sandbox denies:
   the child dies with EPERM and the JSON arrives empty. Writing to a descriptor
   sidesteps that. `cmd /c "... > file 2>&1"` is not an alternative — it trips
   Node's filename parsing. The detector exits non-zero whenever it finds
   anything, so its status is not the signal; the file it wrote is. */
const fd = openSync(out, 'w');
const proc = spawnSync('cmd', ['/c', `${CMD} detect --json ${pages.join(' ')}`], {
  cwd: SITE, env, stdio: ['ignore', fd, 'inherit'],
});
closeSync(fd);

const raw = readFileSync(out, 'utf8');
if (!raw.trim()) {
  console.log(`detector wrote nothing (status ${proc.status}${proc.error ? ', ' + proc.error : ''})`);
  console.log('  a confined sandbox must give the launcher a file descriptor, not a pipe.');
  process.exit(2);
}

let data;
try { data = JSON.parse(raw); }
catch (e) {
  console.log('could not parse detector output:', String(e).slice(0, 160));
  console.log(raw.slice(0, 500));
  process.exit(1);
}

const arr = Array.isArray(data) ? data : (data.findings || data.results || []);
const byRule = new Map();
for (const f of arr) {
  const rule = f.antipattern || f.rule || 'unknown';
  const sev = f.severity || '?';
  const k = `${rule}|${sev}`;
  if (!byRule.has(k)) byRule.set(k, { n: 0, files: new Set() });
  const e = byRule.get(k);
  e.n++;
  if (f.file || f.path) e.files.add(path.basename(f.file || f.path));
}
console.log(`total findings: ${arr.length} across ${pages.length} pages\n`);
const sorted = [...byRule.entries()].sort((a, b) => b[1].n - a[1].n);
console.log('  count  severity   rule');
for (const [k, v] of sorted) {
  const [rule, sev] = k.split('|');
  console.log(`  ${String(v.n).padStart(5)}  ${sev.padEnd(9)}  ${rule}  (${v.files.size} files)`);
}
