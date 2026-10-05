import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://stratastaffglobal.com';
const OUT = path.join(process.cwd(), 'pages');
await mkdir(OUT, { recursive: true });

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';
const seen = new Set();
const queued = new Set();

async function get(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' });
  return { status: res.status, type: res.headers.get('content-type') || '', buf: Buffer.from(await res.arrayBuffer()) };
}

function slugOf(u) {
  const p = new URL(u).pathname.replace(/\/$/, '');
  return (p === '' ? 'home' : p.replace(/^\//, '').replace(/\//g, '__')) || 'home';
}

const subs = ['post-sitemap.xml', 'page-sitemap.xml', 'wpm-testimonial-sitemap.xml', 'category-sitemap.xml', 'wpm-testimonial-category-sitemap.xml', 'author-sitemap.xml'];
const pages = new Set([BASE + '/']);
for (const s of subs) {
  const r = await get(`${BASE}/${s}`);
  const txt = r.buf.toString('utf8');
  await writeFile(path.join(OUT, `_sitemap_${s}`), txt);
  const found = [...txt.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => m[1]);
  console.log(`${s}: ${r.status} -> ${found.length} urls`);
  found.forEach(u => pages.add(u));
  // nested index?
  for (const u of found) if (u.endsWith('.xml')) subs.push(u);
}

console.log('\nTOTAL PAGES:', pages.size);
const results = [];
for (const u of pages) {
  if (seen.has(u)) continue;
  seen.add(u);
  try {
    const r = await get(u);
    const name = slugOf(u) + '.html';
    await writeFile(path.join(OUT, name), r.buf);
    results.push({ url: u, status: r.status, type: r.type, bytes: r.buf.length, file: name });
    console.log(`  ${r.status} ${String(r.buf.length).padStart(7)}b  ${u}`);
  } catch (e) {
    console.log(`  ERR ${u} ${e.message}`);
  }
}
await writeFile(path.join(OUT, '_index.json'), JSON.stringify(results, null, 2));
console.log('\nDone. pages:', results.length);
