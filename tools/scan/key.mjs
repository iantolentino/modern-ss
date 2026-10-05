import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'texts');
const files = await readdir(DIR);
const NAVMARK = 'Toggle menu';
const FOOTMARK = 'Company\nEnjoying The Journey';
const out = [];
const wanted = [
  'solutions', 'strata-services', 'about-us', 'enjoying-the-journey', 'insights',
  'careers-at-strata-staff', 'foundation-training-program', 'strata-staff-plus',
  'strata-staff-academy', 'learning', 'course-outline',
  'strata-services__strata-accountant', 'strata-services__strata-customer-care',
  'strata-staff-plus__property-management-accountant', 'executives', 'our-awesome-team',
  'clients-testimonials', 'feedback__joshua-baldwin', 'strata-staff-connect-3rd-quarter-2024',
  'humble-journey', 'junior-accountant', 'foundation-training-program-basic-strata',
  'appointment-booking', 'strata-services__strata-compliance-specialist',
  'strata-services__strata-insurance-specialist', 'strata-services__strata-administration-specialist',
  'strata-staff-plus__property-management-customer-care', 'strata-staff-plus__property-management-executive-assistant',
  'strata-staff-plus__property-management-administrative-specialist',
];

for (const w of wanted) {
  const f = files.find(x => x === `${w}.txt`);
  if (!f) { out.push(`\n\n===== MISSING ${w} =====`); continue; }
  let t = await readFile(path.join(DIR, f), 'utf8');
  const i = t.indexOf(NAVMARK);
  if (i > -1) t = t.slice(i + NAVMARK.length);
  const j = t.indexOf(FOOTMARK);
  if (j > -1) t = t.slice(0, j);
  t = t.replace(/^Search for:\s*$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
  out.push(`\n\n================ ${w} ================\n${t}`);
}
const body = out.join('\n');
await writeFile('KEY-CONTENT.md', body);
console.log('written', body.length, 'chars');
