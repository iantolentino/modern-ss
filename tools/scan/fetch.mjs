import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://stratastaffglobal.com';
const OUT = path.join(process.cwd(), 'pages');
await mkdir(OUT, { recursive: true });

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

async function get(url, asBuffer = false) {
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: '*/*' }, redirect: 'follow' });
  const buf = Buffer.from(await res.arrayBuffer());
  return { status: res.status, url: res.url, type: res.headers.get('content-type') || '', buf };
}

// 1. robots + sitemap
const urls = new Set();
for (const p of ['/sitemap.xml', '/sitemap_index.xml', '/wp-sitemap.xml', '/robots.txt']) {
  try {
    const r = await get(BASE + p);
    console.log(`GET ${p} -> ${r.status} ${r.type} ${r.buf.length}b`);
    if (/xml/.test(r.type) || p.endsWith('.xml')) {
      const txt = r.buf.toString('utf8');
      await writeFile(path.join(OUT, '..', p.replace(/\//g, '_').replace(/^_/, '')), txt);
      for (const m of txt.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) urls.add(m[1]);
      for (const m of txt.matchAll(/<sitemap>[\s\S]*?<loc>\s*([^<\s]+)\s*<\/loc>/g)) urls.add(m[1]);
    }
  } catch (e) {
    console.log(`GET ${p} failed: ${e.message}`);
  }
}
console.log('sitemap urls:', urls.size, [...urls].join('\n  '));
