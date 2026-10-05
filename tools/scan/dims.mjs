import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
const dir = 'C:/Users/ianto/Downloads/ai-tests/strata-modern/assets';
for (const f of (await readdir(dir)).sort()) {
  const b = await readFile(path.join(dir, f));
  let dim = '';
  if (b[0] === 0x89 && b[1] === 0x50) dim = `${b.readUInt32BE(16)}x${b.readUInt32BE(20)} PNG${b[25] === 6 ? ' rgba' : ''}`;
  else if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) { dim = `${b.readUInt16BE(i + 7)}x${b.readUInt16BE(i + 5)} JPEG`; break; }
      i += 2 + b.readUInt16BE(i + 2);
    }
  } else if (b.subarray(0, 4).toString() === 'RIFF') dim = 'WEBP';
  else dim = 'other';
  console.log(`${dim.padEnd(16)} ${String(b.length).padStart(8)}b  ${f}`);
}
