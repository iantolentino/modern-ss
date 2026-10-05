import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const B = 'https://stratastaffglobal.com/wp-content/uploads/';
const OUT = 'C:/Users/ianto/Downloads/ai-tests/strata-modern/assets';
await mkdir(OUT, { recursive: true });

const files = {
  // brand
  'logo-primary.png': '2025/01/Updated-Strata-Staff-Primary-Logo.png',
  'logo-full.png': '2025/05/Stratastaff-latest.png',
  'logo-icon.png': '2025/01/cropped-icon-update-1-192x192.png',
  'flag-au.svg': '2024/05/Flag_of_Australia_converted.svg',
  'flag-ca.svg': '2024/05/Flag_of_Canada_Pantone.svg',
  // industry memberships
  'member-sca-nsw.png': '2025/02/SCA-NSW-Member-Logo-Colour-230x76.png',
  'member-sca-sa.png': '2025/07/SCA-SA-Member-Logo-Colour-230x73.png',
  'member-cci-bc.png': '2026/05/PNG-CCI-Logo-230x129.png',
  'member-reinsw.png': '2026/05/REINSW-RESIZED-230x128.png',
  // strata platforms
  'platform-stratamax.png': '2024/05/Strata-Max.png',
  'platform-urbanise.png': '2024/05/urbanise.png',
  'platform-stratafy.png': '2024/05/strtafy_zennexo_co-1.png',
  'platform-mri.png': '2024/05/MR5.png',
  'platform-mri-2.webp': '2024/07/mRI-e1732661171439.webp',
  'platform-stratavault.png': '2024/05/sv_logo.png',
  'platform-piq.png': '2024/05/PIQ-Logo.png',
  'platform-smata.jpg': '2024/05/1630523099061-e1732660827703.jpg',
  'platform-idmax.png': '2024/05/IDMAx.png',
  'platform-buildium.png': '2024/07/Buildium.png',
  'platform-aim.png': '2024/05/AIM.png',
  'platform-bing.png': '2024/05/Bing.png',
  'platform-strack.png': '2024/05/Strack.png',
  // executives
  'exec-trevor.jpg': '2024/05/Trev-full.jpg',
  'exec-paul.jpg': '2024/05/Paul-full.jpg',
  'exec-tongta.jpg': '2024/05/Tongta-full.jpg',
  'exec-dan.jpg': '2024/07/SD-full.jpg',
  // team
  'team-anna.jpg': '2024/05/Anna-full-163x300.jpg',
  'team-trixy.webp': '2025/12/Trixy-163x300.webp',
  'team-neil.webp': '2025/12/Neil-163x300.webp',
  'team-maryann.jpg': '2024/05/Chi-full-163x300.jpg',
  'team-marey.webp': '2025/12/Marey-163x300.webp',
  'team-jeremiah.webp': '2025/12/Jerem-163x300.webp',
  'team-jahaziel.jpg': '2024/05/Jahazel-1-163x300.jpg',
  'team-sarahjane.webp': '2025/12/Ma.-Sarahjane-163x300.webp',
  'team-desika.jpg': '2024/05/Desika-1-163x300.jpg',
  'team-patricia-garcia.webp': '2025/12/Patty-163x300.webp',
  'team-leah.jpg': '2024/05/Leah-1-163x300.jpg',
  'team-riel.jpg': '2024/05/Riel-1-163x300.jpg',
  'team-dave.webp': '2025/12/Dave-163x300.webp',
  'team-ian.webp': '2025/12/Ian-Kennent-163x300.webp',
  'team-patricia-puno.jpg': '2024/06/Patricia-163x300.jpg',
  'team-rei.jpg': '2024/05/Rei-1-163x300.jpg',
  'team-sheena.jpg': '2024/05/Sheena-1-163x300.jpg',
  'team-carlo.jpg': '2024/05/Carly-1-163x300.jpg',
  'team-mcryn.jpg': '2024/05/Mcryn-1-163x300.jpg',
  // client signatories
  'client-joshua-baldwin.jpg': '2024/05/Joshua-Baldwin-150x150.jpg',
  'client-michael-haines.jpg': '2024/05/Michael-Haines-150x150.jpg',
  'client-craig-mowll.png': '2024/07/Craig-Mowll-150x150.png',
  'client-paul-cvetko.jpg': '2024/06/Paul-Cvetko-Lueger-150x150.jpg',
  'client-jason-elliott.jpg': '2024/05/Jason-Elliott-150x150.jpg',
  'client-mark-louis.jpg': '2024/05/Mark-Louis-150x150.jpg',
  'client-strata-bee.png': '2024/05/images-150x150.png',
  'client-stanton-taylor.png': '2024/05/Stanton-_-Taylor-Strata-Management-150x150.png',
  'client-professionals.jpg': '2024/05/Professional-Strata-Logo-New-e1715744644663-150x150.jpg',
  'team-feature.png': '2025/05/Stratastaff-2-latest-e1746410813994-230x293.png',
};

let ok = 0, fail = [];
for (const [name, rel] of Object.entries(files)) {
  const r = await fetch(B + rel, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!r.ok) { fail.push(`${name} (${r.status})`); continue; }
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(path.join(OUT, name), buf);
  ok++;
}
console.log('downloaded', ok, 'of', Object.keys(files).length);
if (fail.length) console.log('FAILED:\n' + fail.join('\n'));
