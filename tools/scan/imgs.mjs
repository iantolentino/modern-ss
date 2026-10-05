import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const SCAN = 'C:/Users/ianto/Downloads/ai-tests/strata-scan';
const OUT = 'C:/Users/ianto/Downloads/ai-tests/strata-modern/assets';
await mkdir(OUT, { recursive: true });

const read = f => readFile(path.join(SCAN, 'pages', f), 'utf8');
const urlsIn = h => [...new Set([...h.matchAll(/(?:src|data-src|href)=["'](https?:\/\/[^"']+\.(?:png|jpe?g|webp|svg|gif))["']/gi)].map(m => m[1]))];

const home = await read('home.html');
const team = await read('our-awesome-team.html');
const exec = await read('executives.html');

console.log('--- TEAM PAGE IMAGES ---');
urlsIn(team).forEach(u => console.log(u));
console.log('--- EXEC PAGE IMAGES ---');
urlsIn(exec).forEach(u => console.log(u));
console.log('--- HOME: uploads (non-ui) ---');
urlsIn(home).filter(u => u.includes('/uploads/')).forEach(u => console.log(u));
