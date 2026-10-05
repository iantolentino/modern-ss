import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API = 'https://api.github.com/repos/pbakaus/impeccable/git/trees/main?recursive=1';
const RAW = 'https://raw.githubusercontent.com/pbakaus/impeccable/main/';
const ROOT = process.argv[2] || process.cwd();

const res = await fetch(API, { headers: { 'user-agent': 'node' } });
const { tree } = await res.json();
const wanted = tree.filter(t => t.type === 'blob' && t.path.startsWith('.dsh/'));
console.log('files to fetch:', wanted.length);

let n = 0;
for (const f of wanted) {
  const dest = path.join(ROOT, f.path.split('/').join(path.sep));
  await mkdir(path.dirname(dest), { recursive: true });
  const r = await fetch(RAW + f.path, { headers: { 'user-agent': 'node' } });
  if (!r.ok) { console.log('FAIL', f.path, r.status); continue; }
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(dest, buf);
  n++;
  console.log('ok', f.path, buf.length);
}
console.log('downloaded', n, '/', wanted.length);
