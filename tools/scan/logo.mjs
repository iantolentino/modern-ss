import { writeFile, readFile } from 'node:fs/promises';
const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36' };
const B = 'https://stratastaffglobal.com/wp-content/uploads';
const want = [
  ['2025/05/Stratastaff-latest.png', 'real-logo-2025.png'],
  ['2025/01/cropped-icon-update-1-192x192.png', 'real-icon-192.png'],
  ['2025/01/cropped-icon-update-1-32x32.png', 'real-icon-32.png'],
  ['2024/05/Flag_of_Australia_converted.svg', 'real-flag-au.svg'],
  ['2024/05/Flag_of_Canada_Pantone.svg', 'real-flag-ca.svg'],
];
for (const [p, out] of want) {
  try {
    const r = await fetch(`${B}/${p}`, { headers: UA });
    if (!r.ok) { console.log(`[${r.status}] ${p}`); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    await writeFile(out, buf);
    console.log(`[200] ${out}  ${buf.length}b`);
  } catch (e) { console.log(`[ERR] ${p} ${e.message}`); }
}

// PNG header → dimensions, so sizes can be compared without an image library
function pngSize(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
console.log('\ndimensions:');
for (const f of ['real-logo-2025.png', 'real-icon-192.png', 'real-icon-32.png']) {
  try {
    const b = await readFile(f);
    const s = pngSize(b);
    console.log(`  ${f.padEnd(22)} ${s ? s.w + 'x' + s.h : 'not a png'}  ratio ${s ? (s.w / s.h).toFixed(2) : '-'}:1  ${b.length}b`);
  } catch { console.log(`  ${f.padEnd(22)} missing`); }
}
console.log('\nwhat the rebuild currently ships:');
for (const f of ['../strata-modern/assets/logo-full.png', '../strata-modern/assets/logo-icon.png']) {
  try {
    const b = await readFile(f);
    const s = pngSize(b);
    console.log(`  ${f.split('/').pop().padEnd(22)} ${s ? s.w + 'x' + s.h : 'not a png'}  ratio ${s ? (s.w / s.h).toFixed(2) : '-'}:1  ${b.length}b`);
  } catch { console.log(`  ${f.padEnd(22)} missing`); }
}

// byte-identical?
const same = async (a, b) => {
  try { return Buffer.compare(await readFile(a), await readFile(b)) === 0; } catch { return false; }
};
console.log('\nbyte-identical to the 2025 logo? ' + (await same('real-logo-2025.png', '../strata-modern/assets/logo-full.png')));
console.log('byte-identical to the real icon?   ' + (await same('real-icon-192.png', '../strata-modern/assets/logo-icon.png')));
