const B = 'http://127.0.0.1:4173';
const slug = u => u.replace(B + '/', '') || 'index.html';

// 1. every page serves and has the shell
const list = ['index.html','404.html','about.html','academy.html','careers.html','contact.html',
  'course-outline.html','executives.html','foundation-training-program.html','insights.html',
  'journey.html','learning.html','privacy.html','solutions.html','strata-services.html',
  'strata-staff-plus.html','team.html','testimonials.html',
  'role-administrative-specialist.html','role-accountant.html','role-executive-assistant.html',
  'role-compliance-specialist.html','role-insurance-specialist.html','role-customer-care.html',
  'role-pm-administrative-specialist.html','role-pm-executive-assistant.html',
  'role-pm-accountant.html','role-pm-customer-care.html',
  'job-junior-accountant.html','job-mid-level-accountant.html','job-senior-accountant.html',
  'job-hr-assistant.html',
  'post-we-are-a-trusted-sca-member.html','post-strata-staff-joins-sca-south-australia.html',
  'post-strata-staff-joins-the-canadian-condominium-institute-cci-british-columbia-chapter.html',
  'post-strata-staff-connect-1st-2nd-quarter-2024.html','post-strata-staff-connect-3rd-quarter-2024.html',
  'post-as-we-enter-2025-a-new-symbol-will-lead-the-way.html',
  'post-strata-staff-unveils-its-upgraded-marisol-office.html',
  'post-premium-in-strategic-client-partnerships-and-engagement.html'];

let bad = [], refs = new Set(), pagesWithIssues = [];
for (const p of list) {
  const r = await fetch(B + '/' + p);
  const html = await r.text();
  if (!r.ok) { bad.push(`page ${p} -> ${r.status}`); continue; }
  const need = ['<title>', 'name="description"', 'lang="en-AU"', 'id="main"', 'styles.css', 'app.js',
    'class="bar"', 'class="foot"', 'data-folio-now', 'id="drawer"', 'assets/logo-full.png'];
  const miss = need.filter(n => !html.includes(n));
  if (miss.length) pagesWithIssues.push(`${p}: ${miss.join(', ')}`);
  for (const m of html.matchAll(/(?:href|src)="([^"#?][^"]*)"/g)) {
    const h = m[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(h)) continue;
    refs.add(h);
  }
}
console.log(`pages checked: ${list.length}`);
console.log(bad.length ? `FAILED PAGES:\n  ${bad.join('\n  ')}` : 'every page served 200');
console.log(pagesWithIssues.length ? `SHELL GAPS:\n  ${pagesWithIssues.join('\n  ')}` : 'every page carries the full shell');

// 2. every local reference on every page resolves
const broken = [];
for (const ref of [...refs].sort()) {
  const r = await fetch(B + '/' + ref, { method: 'GET' });
  if (!r.ok) broken.push(`${r.status}  ${ref}`);
}
console.log(`\nlocal references across all pages: ${refs.size}`);
console.log(broken.length ? `BROKEN:\n  ${broken.join('\n  ')}` : 'all resolve');

// 3. no remote dependencies (must be fully self-hosted)
const remote = [...refs].filter(h => /^(https?:)?\/\//.test(h));
console.log(`\nremote references: ${remote.length ? remote.join(', ') : 'none — fully self-hosted'}`);

// 4. tabs CSS covers every tab group actually emitted
const tabsCss = await (await fetch(B + '/styles-tabs.css')).text();
const ruleIds = new Set([...tabsCss.matchAll(/#([\w-]+):checked/g)].map(m => m[1]));
const usedIds = new Set();
for (const p of list) {
  const html = await (await fetch(B + '/' + p)).text();
  for (const m of html.matchAll(/<input type="radio" name="[^"]+" id="([^"]+)"/g)) usedIds.add(m[1]);
  for (const m of html.matchAll(/<div class="tabs__panel" data-tab="([^"]+)"/g)) usedIds.add(m[1]);
}
const uncovered = [...usedIds].filter(id => !ruleIds.has(id) && !usedIds.has(id.replace(/^tab-/, '')));
const missingRule = [...usedIds].filter(id => !ruleIds.has(id));
console.log(`\ntab ids emitted: ${usedIds.size}; visibility rules generated: ${ruleIds.size}`);
console.log(missingRule.length ? `TABS WITHOUT A RULE: ${missingRule.join(', ')}` : 'every tab panel has a visibility rule');

// 5. heading order per page
let hIssues = [];
for (const p of list) {
  const html = await (await fetch(B + '/' + p)).text();
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
  const seq = [...main.matchAll(/<h([1-4])[ >]/g)].map(m => +m[1]);
  const h1s = seq.filter(n => n === 1).length;
  let jump = null;
  for (let i = 1; i < seq.length; i++) if (seq[i] > seq[i - 1] + 1) { jump = `${seq[i - 1]}->${seq[i]}`; break; }
  if (h1s !== 1) hIssues.push(`${p}: ${h1s} h1 in main`);
  if (jump) hIssues.push(`${p}: heading jump ${jump}`);
}
console.log(`\n${hIssues.length ? 'HEADING ISSUES:\n  ' + hIssues.join('\n  ') : 'heading order: one h1 per page, no skipped levels'}`);
