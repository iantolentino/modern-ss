// Pull the live site's stylesheets and extract its real colour vocabulary.
const BASE = 'https://stratastaffglobal.com';
const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36' };

const home = await (await fetch(BASE + '/', { headers: UA })).text();
const sheets = [...new Set([...home.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)].map(m => m[1]))];
console.log('stylesheets on the homepage:');
for (const s of sheets) console.log('  ' + s);

// also catch stylesheets enqueued inside inline Elementor/post CSS
const inlineUrls = [...new Set([...home.matchAll(/href=["']([^"']+\.css[^"']*)["']/gi)].map(m => m[1]))];
for (const s of inlineUrls) if (!sheets.includes(s)) sheets.push(s);

const all = [];
for (const s of sheets) {
  const url = s.startsWith('http') ? s : BASE + (s.startsWith('/') ? s : '/' + s);
  try {
    const r = await fetch(url, { headers: UA });
    if (!r.ok) { console.log(`  [${r.status}] ${url}`); continue; }
    const css = await r.text();
    console.log(`  [200] ${css.length}b  ${url}`);
    all.push(css);
  } catch (e) { console.log(`  [ERR] ${url} ${e.message}`); }
}
const blob = all.join('\n');

// hex frequency
const hex = {};
for (const m of blob.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
  let h = m[1].toLowerCase();
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  hex[h] = (hex[h] || 0) + 1;
}
const top = Object.entries(hex).sort((a, b) => b[1] - a[1]).slice(0, 40);
console.log('\n=== most-used hex colours across the site\'s own CSS ===');
for (const [h, n] of top) console.log(`  #${h.toUpperCase()}  x${n}`);

// rgb()/rgba() with real values
const rgb = {};
for (const m of blob.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)) {
  const k = [m[1], m[2], m[3]].map(Number);
  const key = k.join(',');
  rgb[key] = (rgb[key] || 0) + 1;
}
console.log('\n=== most-used rgb() colours ===');
for (const [k, n] of Object.entries(rgb).sort((a, b) => b[1] - a[1]).slice(0, 20)) {
  const [r, g, b] = k.split(',').map(Number);
  const h = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  console.log(`  rgb(${k})  = ${h}  x${n}`);
}

// brand-declared custom properties
const vars = {};
for (const m of blob.matchAll(/--([\w-]*colou?r[\w-]*|--[\w-]*(?:primary|secondary|accent|brand|global)[\w-]*)\s*:\s*([^;}]+)/gi)) {
  const k = m[1], v = m[2].trim();
  if (/^#|^rgb|^hsl/.test(v)) vars[k] = (vars[k] ? vars[k] + ' | ' : '') + v;
}
console.log('\n=== declared colour custom properties (brand-ish) ===');
const vk = Object.keys(vars);
if (!vk.length) console.log('  (none matched)');
for (const k of vk.slice(0, 60)) console.log(`  --${k}: ${vars[k]}`);
