import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'pages');
const OUT = path.join(process.cwd(), 'texts');
await mkdir(OUT, { recursive: true });
const files = (await readdir(DIR)).filter(f => f.endsWith('.html') && !f.startsWith('_'));

const decode = s => s
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#0?39;|&apos;|&rsquo;|&#8217;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&hellip;/g, '…').replace(/&mdash;|&#8212;/g, '—').replace(/&ndash;|&#8211;/g, '–')
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).trim();

function textOf(html) {
  let h = html.replace(/<(script|style|noscript|svg|head)[\s\S]*?<\/\1>/gi, ' ');
  h = h.replace(/<!--[\s\S]*?-->/g, ' ');
  h = h.replace(/<\/(p|div|h[1-6]|li|tr|section|article|td|th)>/gi, '\n');
  h = h.replace(/<br\s*\/?>/gi, '\n');
  h = h.replace(/<\/(ul|ol|table|blockquote)>/gi, '\n');
  h = h.replace(/<[^>]+>/g, '');
  return decode(h.split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim()).filter(Boolean).join('\n'));
}

// dedupe consecutive repeated blocks (nav appears twice in WP markup)
function dedupe(t) {
  const lines = t.split('\n');
  const out = [];
  const seen = new Map();
  for (const l of lines) {
    out.push(l);
  }
  return out.join('\n');
}

const imageMap = {};
for (const f of files) {
  const html = await readFile(path.join(DIR, f), 'utf8');
  let t = dedupe(textOf(html));
  await writeFile(path.join(OUT, f.replace(/\.html$/, '.txt')), t);
  const imgs = [...new Set([...html.matchAll(/(?:src|data-src)=["'](https?:\/\/[^"']+\.(?:png|jpe?g|webp|svg|gif))/gi)].map(m => m[1]))];
  imageMap[f] = imgs;
}
await writeFile('images.json', JSON.stringify(imageMap, null, 1));
const all = new Set(); Object.values(imageMap).forEach(a => a.forEach(u => all.add(u)));
console.log('text files written:', files.length, '| unique images:', all.size);
await writeFile('all-images.txt', [...all].join('\n'));
