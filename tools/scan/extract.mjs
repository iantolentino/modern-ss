import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'pages');
const files = (await readdir(DIR)).filter(f => f.endsWith('.html') && !f.startsWith('_'));

const decode = s => s
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#0?39;|&apos;|&rsquo;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&hellip;/g, '…').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
  .replace(/&#8217;/g, "'").replace(/&#8211;/g, '–').replace(/&#8212;/g, '—')
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/\s+/g, ' ').trim();

const strip = html => decode(html.replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|h[1-6]|li|tr|section)>/gi, '\n')
  .replace(/<[^>]+>/g, ' '));

const summary = [];
const allCss = [];
for (const f of files) {
  const html = await readFile(path.join(DIR, f), 'utf8');
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ''])[1].trim();
  const desc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || [, ''])[1];
  const h1 = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => strip(m[1])).filter(Boolean);
  const h2 = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => strip(m[1])).filter(Boolean);
  const h3 = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map(m => strip(m[1])).filter(Boolean);
  const imgs = [...new Set([...html.matchAll(/<img[^>]+src=["']([^"']+)/gi)].map(m => m[1]))].filter(u => !/data:/.test(u));
  const css = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)/gi)].map(m => m[1]);
  allCss.push(...css);
  // inline styles block
  const inline = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n');
  const colors = [...new Set([...html.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\([^)]+\)/g)].map(m => m[0].toLowerCase()))];
  // nav
  const navBlock = (html.match(/<nav[\s\S]{0,6000}?<\/nav>/i) || [''])[0];
  const navLinks = [...navBlock.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]{0,120}?)<\/a>/gi)]
    .map(m => ({ href: m[1], text: strip(m[2]) })).filter(l => l.text && !/^#/.test(l.href));

  summary.push({
    file: f, title, desc,
    h1, h2, h3,
    imgsCount: imgs.length, imgs: imgs.slice(0, 40),
    css: [...new Set(css)], colors: colors.slice(0, 60),
    navLinks,
    text: strip(html).slice(0, 6000),
  });
}

await writeFile('analysis.json', JSON.stringify(summary, null, 1));
console.log('analyzed', summary.length, 'pages');
console.log('stylesheets:', [...new Set(allCss)].length);
const allColors = new Set();
summary.forEach(s => s.colors.forEach(c => allColors.add(c)));
console.log('unique color literals:', allColors.size);
console.log([...allColors].join(' '));
