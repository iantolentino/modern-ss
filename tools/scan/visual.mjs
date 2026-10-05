import { readFile, writeFile } from 'node:fs/promises';
const html = await readFile('pages/home.html', 'utf8');

// font families referenced
const fonts = new Set();
for (const m of html.matchAll(/font-family\s*:\s*([^;}"']+)/gi)) fonts.add(m[1].trim().slice(0, 120));
console.log('--- inline font-family ---');
console.log([...fonts].join('\n'));

// google fonts / font files
const links = [...html.matchAll(/<link[^>]+href=["']([^"']*(?:fonts|font)[^"']*)["']/gi)].map(m => m[1]);
console.log('\n--- font links ---');
console.log([...new Set(links)].join('\n'));

const sheets = [...new Set([...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)/gi)].map(m => m[1]))];
console.log('\n--- stylesheets ---');
console.log(sheets.join('\n'));

const logos = [...new Set([...html.matchAll(/["'](https?:\/\/[^"']*(?:logo|brand|symbol|stratastaff)[^"']*\.(?:png|jpe?g|webp|svg))["']/gi)].map(m => m[1]))];
console.log('\n--- logo candidates ---');
console.log(logos.join('\n'));

await writeFile('home-sheets.txt', sheets.join('\n'));
