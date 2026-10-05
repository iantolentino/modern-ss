/* Decode a PNG without any image library: parse the chunks, inflate the IDAT
   stream, undo the per-scanline filters, then count the colours. Enough to read
   a logo's real palette. */
import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';

const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

function decode(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a png');
  let p = 8, ihdr = null, idat = [], plte = null, trns = null;
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('ascii', p + 4, p + 8);
    const data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') {
      ihdr = {
        w: data.readUInt32BE(0), h: data.readUInt32BE(4),
        depth: data[8], colorType: data[9], interlace: data[12],
      };
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'PLTE') plte = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  if (ihdr.interlace) throw new Error('interlaced png not supported');
  if (ihdr.depth !== 8) throw new Error('only 8-bit supported, got ' + ihdr.depth);
  const ch = CHANNELS[ihdr.colorType];
  const raw = inflateSync(Buffer.concat(idat));
  const stride = ihdr.w * ch;
  const out = Buffer.alloc(ihdr.h * stride);
  let pos = 0;
  for (let y = 0; y < ihdr.h; y++) {
    const filter = raw[pos++];
    const line = raw.subarray(pos, pos + stride); pos += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? cur[x - ch] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= ch ? prev[x - ch] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      cur[x] = v & 0xff;
    }
  }
  return { ...ihdr, ch, pixels: out, plte, trns };
}

const hex = (r, g, b) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();

function analyse(file, label) {
  return readFile(file).then(buf => {
    const img = decode(buf);
    const counts = new Map();
    let opaque = 0;
    for (let i = 0; i < img.pixels.length; i += img.ch) {
      let r, g, b, a = 255;
      if (img.ch === 4) { r = img.pixels[i]; g = img.pixels[i + 1]; b = img.pixels[i + 2]; a = img.pixels[i + 3]; }
      else if (img.ch === 3) { r = img.pixels[i]; g = img.pixels[i + 1]; b = img.pixels[i + 2]; }
      else if (img.ch === 1) { r = g = b = img.pixels[i]; }
      else { r = g = b = img.pixels[i]; a = img.pixels[i + 1]; }
      if (a < 128) continue;                       // ignore the transparent field
      opaque++;
      // quantise to 3 bits per channel to merge antialiasing gradients
      const k = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      const e = counts.get(k) || { n: 0, r: 0, g: 0, b: 0 };
      e.n++; e.r += r; e.g += g; e.b += b;
      counts.set(k, e);
    }
    const rows = [...counts.values()].sort((a, b) => b.n - a.n);
    console.log(`\n=== ${label} — ${img.w}x${img.h}, ${opaque} opaque pixels ===`);
    console.log('  share   colour     (mean of the bucket)');
    for (const e of rows.slice(0, 16)) {
      const r = Math.round(e.r / e.n), g = Math.round(e.g / e.n), b = Math.round(e.b / e.n);
      const pct = (100 * e.n / opaque).toFixed(1).padStart(5);
      const bar = '#'.repeat(Math.max(1, Math.round(40 * e.n / opaque)));
      console.log(`  ${pct}%  ${hex(r, g, b)}   ${bar}`);
    }
    // the genuinely saturated brand colours, ignoring near-white / near-black
    const sat = rows.filter(e => {
      const r = e.r / e.n, g = e.g / e.n, b = e.b / e.n;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      return mx - mn > 40 && mx > 40;
    }).slice(0, 8);
    console.log('  -- saturated brand colours --');
    for (const e of sat) {
      const r = Math.round(e.r / e.n), g = Math.round(e.g / e.n), b = Math.round(e.b / e.n);
      console.log(`     ${hex(r, g, b)}  ${(100 * e.n / opaque).toFixed(1)}%`);
    }
    return sat.map(e => hex(Math.round(e.r / e.n), Math.round(e.g / e.n), Math.round(e.b / e.n)));
  });
}

const dir = '../strata-modern/assets/';
const a = await analyse(dir + 'logo-full.png', 'the logo (logo-full.png)');
await analyse(dir + 'logo-icon.png', 'the favicon mark (logo-icon.png)');
console.log('\nTop saturated colours in the logo:', a.join(', '));
