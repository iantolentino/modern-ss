/* Print the heading sequence of a few live pages, to place the rebuild's
   remaining sections where the incumbent actually puts them. */
const urls = [
  'https://stratastaffglobal.com/about-us/',
  'https://stratastaffglobal.com/insights/',
  'https://stratastaffglobal.com/executives/',
  'https://stratastaffglobal.com/solutions/',
];

const strip = s => s.replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#8217;|&rsquo;/g, "'")
  .replace(/&nbsp;/g, ' ')
  .replace(/&[a-z]+;/g, ' ')
  .replace(/\s+/g, ' ').trim();

for (const u of urls) {
  try {
    const r = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; layout-scan/1.0)' } });
    const h = await r.text();
    const b = h.replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ');
    console.log(`=== ${u}  status ${r.status}  ${h.length} bytes`);
    const seen = new Set();
    let n = 0;
    for (const m of b.matchAll(/<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
      const t = strip(m[2]);
      if (!t || t.length > 110) continue;
      const k = m[1] + t;
      if (seen.has(k)) continue;
      seen.add(k);
      console.log(`   h${m[1]}  ${t}`);
      if (++n > 26) break;
    }
    // does it mention memberships?
    const mem = /membership|member of|CCI|Canadian Condominium|Strata Community Association/i.test(b);
    console.log(`   [mentions memberships: ${mem}]`);
    console.log('');
  } catch (e) {
    console.log(u, 'ERR', e.message);
  }
}
