const B = 'http://127.0.0.1:4173';
const checks = [
  ['/', 'home', ['Notice is hereby given', 'more lots', 'styles-tabs.css', 'assets/marker.svg', 'Schedule 1', 'stamp--lg', 'data-item="08"', 'class="hole"', 'field-marker', 'reg-pool|id="capacity"']],
  ['/course-outline.html', 'course outline', ['tab-c-s-admin', 'tab-p-p-acct', 'tabs__panel', 'data-tab="tab-c-s-acct"']],
  ['/team.html', 'team', ['tab-all', 'tab-sm', 'Photographic register', 'Officers by department']],
  ['/job-junior-accountant.html', 'job', ['Position details', 'Angeles City', 'Levy Administration|Levy']],
  ['/index.html', 'home tabs', ['tab-strata', 'tab-plus', 'reg-table']],
  ['/styles-tabs.css', 'tab css', ['#tab-strata:checked', '#tab-c-s-admin:checked', '#tab-all:checked']],
  ['/styles.css', 'css', ['--marker', '@import', 'prefers-reduced-motion', '::selection']],
  ['/app.js', 'js', ['IntersectionObserver', 'reg-pool', 'data-drawer-open']],
  ['/assets/marker.svg', 'marker', ['F2E14C', 'preserveAspectRatio']],
];

let fail = 0;
for (const [u, name, must] of checks) {
  const r = await fetch(B + u);
  const t = await r.text();
  const missing = must.filter(m => !new RegExp(m).test(t));
  if (missing.length) fail++;
  console.log(`${r.status}  ${name.padEnd(15)} ${String(t.length).padStart(7)}b  ${missing.length ? 'MISSING: ' + missing.join(' | ') : 'ok'}`);
}
// 404 behaviour
const nf = await fetch(B + '/nope.html');
const nft = await nf.text();
console.log(`${nf.status}  ${'404 page'.padEnd(15)} ${String(nft.length).padStart(7)}b  ${/not in this notice pack/.test(nft) ? 'ok' : 'MISSING 404 copy'}`);
// every internal link and asset resolves
const home = await (await fetch(B + '/')).text();
const files = [...new Set([...home.matchAll(/(?:href|src)="([^"#?][^"]*)"/g)].map(m => m[1]).filter(h => !/^(https?:|mailto:|tel:)/.test(h)))];
let bad = [];
for (const f of files) {
  const rr = await fetch(B + '/' + f, { method: 'GET' });
  if (!rr.ok) bad.push(`${rr.status} ${f}`);
}
console.log(`\nhome references ${files.length} local files; broken: ${bad.length ? bad.join(', ') : 'none'}`);
console.log(fail ? `\n${fail} check group(s) failed` : '\nall checks passed');
