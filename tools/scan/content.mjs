import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const TXT = 'C:/Users/ianto/Downloads/ai-tests/strata-scan/texts';
const OUTDIR = 'C:/Users/ianto/Downloads/ai-tests/strata-modern/content';
await mkdir(OUTDIR, { recursive: true });

const read = async f => (await readFile(path.join(TXT, f), 'utf8'));
const NAV = 'Toggle menu';
const FOOT = 'Company\nEnjoying The Journey';
function body(t) {
  const i = t.indexOf(NAV);
  if (i > -1) t = t.slice(i + NAV.length);
  const j = t.indexOf(FOOT);
  if (j > -1) t = t.slice(0, j);
  return t.replace(/^Search for:.*$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
}

/* ---------------------------------------------------------------- posts -- */
const postMeta = [
  ['strata-staff-joins-the-canadian-condominium-institute-cci-british-columbia-chapter', 'Strata Staff Joins the Canadian Condominium Institute (CCI) British Columbia Chapter', 'Announcement', '7 November 2025', 'Strata Staff is proud to be a new member of the Canadian Condominium Institute (CCI) British Columbia Chapter.'],
  ['strata-staff-joins-sca-south-australia', 'Strata Staff Joins SCA South Australia', 'Announcement', '15 July 2025', 'We are proud to announce that Strata Staff is now a corporate member of the Strata Community Association South Australia (SCA SA).'],
  ['strata-staff-unveils-its-upgraded-marisol-office', 'Strata Staff Unveils Its Upgraded Marisol Office', 'Announcement', '25 June 2025', 'We have made exciting upgrades to our Marisol Office to create a more comfortable and productive environment for our team and clients.'],
  ['we-are-a-trusted-sca-member', 'We are a Trusted SCA Member', 'Announcement', '6 February 2025', 'Strata Staff is now an official corporate member of the Strata Community Association NSW — proud to be among the first offshore staffing firms to receive this recognition.'],
  ['as-we-enter-2025-a-new-symbol-will-lead-the-way', 'As we enter 2025, a new symbol will lead the way', 'Newsletter', '27 January 2025', 'As we continue to grow and evolve, we unveil our new brand identity for 2025 — a symbol that represents the next chapter of Strata Staff.'],
  ['premium-in-strategic-client-partnerships-and-engagement', 'Strata Staff Places Premium In Strategic Client Partnerships And Engagement', 'Client Partnerships and Engagement', '12 November 2024', 'Our Executive Managing Director, Dan Fabros Jr., recently visited valued clients in Sydney, Melbourne and Adelaide for a series of face-to-face meetings.'],
  ['strata-staff-connect-3rd-quarter-2024', 'Strata Staff Connect 3rd Quarter 2024', 'Newsletter', '30 October 2024', 'This quarter we focused on deepening client relationships and expanding our offshore capacity programs.'],
  ['strata-staff-connect-1st-2nd-quarter-2024', 'Strata Staff Connect 1st-2nd Quarter 2024', 'Newsletter', '31 July 2024', 'Breaking boundaries through our success with international client partners as we now provide 24/7 offshore capacity solutions.'],
];

const posts = [];
for (const [file, title, cat, date, sum] of postMeta) {
  let t;
  try { t = body(await read(file + '.txt')); } catch { t = ''; }
  // strip the leading breadcrumb / byline / duplicate title lines
  const lines = t.split('\n');
  const start = lines.findIndex(l => /^By Strata Staff/.test(l));
  let paras = (start > -1 ? lines.slice(start + 1) : lines.slice(3)).join('\n');
  paras = paras
    .split('\n').map(s => s.trim()).filter(Boolean)
    .filter(l => !/^(Leave a Reply|Recent Posts|Recent Comments|Archives|Categories|Announcement|Newsletter|Client Partnerships And Engagement|November 2025|July 2025|June 2025|February 2025|January 2025|November 2024|October 2024|July 2024|You must be logged in|Home »)$/.test(l))
    .filter(l => !/^\d{4}$/.test(l))
    .join('\n');
  posts.push({ file, title, cat, date, summary: sum, body: paras });
  console.log(`${file}\n  body chars: ${paras.length}\n  preview: ${paras.slice(0, 160).replace(/\n/g, ' | ')}`);
}
await writeFile(path.join(OUTDIR, 'posts.json'), JSON.stringify(posts, null, 2));

/* ----------------------------------------------------------------- jobs -- */
const jobFiles = [
  ['junior-accountant', 'Junior Accountant', 'Angeles City / San Fernando City', 'Nightshift (Permanent)', 'Full-Time (Permanent)'],
  ['mid-level-accountant-nightshift', 'Mid-Level Accountant (Nightshift)', 'Angeles City', 'Nightshift (Permanent)', 'Full-Time (Permanent)'],
  ['apply__senior-accountant', 'Senior Accountant', 'Angeles City', 'Dayshift (Permanent)', 'Full-Time (Permanent)'],
  ['hr-assistant', 'Human Resources Assistant', 'Angeles City', 'Dayshift (Permanent)', 'Full-Time (Permanent)'],
];
const jobs = [];
for (const [file, title, site, shift, type] of jobFiles) {
  let t = '';
  try { t = body(await read(file + '.txt')); } catch {}
  const lines = t.split('\n').map(s => s.trim()).filter(Boolean)
    .filter(l => !/^(Leave a Reply|Apply for This Role|MaleFemalePrefer not to say|DayshiftNightshift|Immediately30 Days|Δ|Schedule Free Discovery Call|We value your time.*|Email Us|Home ».*)$/.test(l))
    .filter(l => !/^Strata Administrative SpecialistStrata Executive Assistant/.test(l));
  const start = lines.findIndex(l => /^Position Details$/.test(l));
  const end = lines.findIndex(l => /^Apply for This Role$/.test(l));
  const slice = lines.slice(start > -1 ? start : 0, end > -1 ? end : lines.length);
  jobs.push({ file, title, site, shift, type, lines: slice });
  console.log(`\n=== ${title} (${slice.length} lines) ===\n` + slice.join('\n'));
}
await writeFile(path.join(OUTDIR, 'jobs.json'), JSON.stringify(jobs, null, 2));
console.log('\nwrote content/posts.json and content/jobs.json');
