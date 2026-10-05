import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const OUT = 'C:/Users/ianto/Downloads/ai-tests/strata-modern/assets/fonts';
await mkdir(OUT, { recursive: true });

const fams = [
  ['archivo', 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap'],
  ['spline-mono', 'https://fonts.googleapis.com/css2?family=Spline+Sans+Mono:wght@300..700&display=swap'],
];

const faces = [];
for (const [key, url] of fams) {
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  const css = await res.text();
  console.log(`--- ${key}: HTTP ${res.status} (${css.length}b) ---`);
  if (!res.ok) { console.log(css.slice(0, 300)); continue; }
  // keep only latin + latin-ext blocks to limit weight
  const blocks = css.split('/*').filter(b => /^\s*latin/.test(b));
  const keep = blocks.filter(b => /^\s*latin\s*\*\//.test(b) || /^\s*latin-ext/.test(b));
  let i = 0;
  const out = [];
  for (const b of keep) {
    const sub = (b.match(/^\s*([a-z-]+)/) || [, 'x'])[1];
    const src = (b.match(/url\((https:[^)]+\.woff2)\)/) || [])[1];
    const wght = (b.match(/font-weight:\s*([^;]+);/) || [, '400'])[1];
    const st = (b.match(/font-stretch:\s*([^;]+);/) || [, '100%'])[1];
    const style = (b.match(/font-style:\s*([^;]+);/) || [, 'normal'])[1];
    if (!src) continue;
    const fname = `${key}-${sub}-${i++}.woff2`;
    const r = await fetch(src, { headers: { 'user-agent': UA } });
    if (!r.ok) { console.log('FAIL font', fname, r.status); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    await writeFile(path.join(OUT, fname), buf);
    const body = b.slice(b.indexOf('*/') + 2)
      .replace(/url\([^)]+\)/, `url('${fname}')`)
      .replace(/\/\*\s*latin[^*]*\*\/\s*/g, '')
      .replace(/^\s*@font-face\s*\{/, '')
      .trim()
      .replace(/\}\s*$/, '');
    out.push(`@font-face {\n${body}\n}`);
    console.log('  ok', fname, buf.length, 'b', sub, wght, st);
  }
  faces.push(`/* ${key} */\n` + out.join('\n'));
}
await writeFile(path.join(OUT, 'fonts.css'), faces.join('\n\n'));
console.log('\nwrote fonts.css', faces.join('').length, 'chars');
