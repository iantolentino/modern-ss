/* Fetch the live homepage and print its section headings in document order, so
   the rebuild's information architecture is the incumbent's, not an invention. */
const res = await fetch('https://stratastaffglobal.com/', {
  headers: { 'user-agent': 'Mozilla/5.0 (compatible; layout-scan/1.0)' },
});
const html = await res.text();
console.log('status', res.status, 'bytes', html.length);

// strip scripts/styles/comments so headings inside templates do not pollute the run
const body = html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ');

const strip = s => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, "'")
  .replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();

console.log('\n=== headings in document order ===');
const seen = new Set();
for (const m of body.matchAll(/<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
  const t = strip(m[2]);
  if (!t || t.length > 120) continue;
  const key = m[1] + t;
  if (seen.has(key)) continue;
  seen.add(key);
  console.log(`  h${m[1]}  ${t}`);
}

console.log('\n=== top-level sections / their first text ===');
const secs = body.split(/<section\b/).slice(1);
secs.forEach((s, i) => {
  const h = s.match(/<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/i);
  const cls = (s.match(/^[^>]*class="([^"]*)"/) || [, ''])[1];
  console.log(`  ${String(i).padStart(2)}  h=${h ? strip(h[2]).slice(0, 52) : '(no heading)'}   class="${cls.slice(0, 60)}"`);
});
