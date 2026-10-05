import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const url = 'https://github.com/pbakaus/impeccable/releases/download/engine-v0.1.6/impeccable-windows-x64.exe';
const dest = process.argv[2];
await mkdir(path.dirname(dest), { recursive: true });
const r = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0' } });
console.log('status', r.status, r.headers.get('content-type'), r.headers.get('content-length'));
if (!r.ok) { console.log(await r.text()); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
await writeFile(dest, buf);
console.log('wrote', dest, buf.length, 'bytes, magic:', buf.subarray(0, 2).toString('ascii'));
