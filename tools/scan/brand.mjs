const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36' };
const h = await (await fetch('https://stratastaffglobal.com/', { headers: UA })).text();

const imgs = [...h.matchAll(/<img[^>]+>/gi)].map(m => m[0]);
const logoImgs = imgs.filter(t => /logo/i.test(t) && !/carousel|spinner/i.test(t));
console.log('logo <img> tags in the homepage markup:');
for (const t of logoImgs.slice(0, 12)) {
  const src = (t.match(/src=["']([^"']+)/) || [])[1];
  const alt = (t.match(/alt=["']([^"']*)/) || [])[1];
  const cls = (t.match(/class=["']([^"']*)/) || [])[1];
  console.log('  ' + (src || '?'));
  console.log('     alt="' + (alt || '') + '"  class="' + (cls || '') + '"');
}

console.log('\nfavicon / site icon links:');
for (const m of h.matchAll(/<link[^>]+(?:icon|apple-touch)[^>]*>/gi)) console.log('  ' + m[0]);

// the header logo specifically, and its rendered size
const header = h.match(/<header[\s\S]*?<\/header>/i);
if (header) {
  console.log('\ninside <header>:');
  for (const m of header[0].matchAll(/<img[^>]+>/gi)) {
    const src = (m[0].match(/src=["']([^"']+)/) || [])[1];
    const wh = (m[0].match(/width=["']?(\d+)/) || [])[1] + 'x' + (m[0].match(/height=["']?(\d+)/) || [])[1];
    console.log('  ' + src + '   ' + wh);
  }
  const brand = header[0].match(/<a[^>]*site-title[\s\S]{0,400}/i);
  if (brand) console.log('\n  brand markup: ' + brand[0].slice(0, 300).replace(/\s+/g, ' '));
}

// the two CA logos referenced anywhere
console.log('\nCA-site logos referenced:');
for (const m of h.matchAll(/https?:\/\/[^"']*Strata-Staff-(?:Primary|Secondary)-Logo[^"']*/gi)) console.log('  ' + m[0]);

// brand colours actually applied to the header/nav in the inline post CSS
const sheets = [...h.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)].map(m => m[1]);
const want = sheets.filter(s => /post-\d+\.css|global|theme/.test(s)).slice(0, 6);
console.log('\npulling global/theme css for the real accent usage:');
for (const s of want) {
  const url = s.startsWith('http') ? s : 'https://stratastaffglobal.com' + (s.startsWith('/') ? s : '/' + s);
  try {
    const css = await (await fetch(url, { headers: UA })).text();
    const hits = [...css.matchAll(/[^{}]*(?:background|color)[^{}]*\{[^}]*(?:#00544E|#094BC1|#324B4A|#d65050|#233452)[^}]*\}/gi)];
    if (hits.length) {
      console.log('  ' + url.split('/').pop() + '  (' + hits.length + ' rules using a brand colour)');
      for (const x of hits.slice(0, 6)) console.log('    ' + x[0].replace(/\s+/g, ' ').slice(0, 220));
    }
  } catch (e) { console.log('  ERR ' + url + ' ' + e.message); }
}
