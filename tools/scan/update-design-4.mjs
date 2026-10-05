/* Bring .impeccable/design.json up to date after the second imagery pass.
 *
 * Written as a script rather than by hand because the file is the machine-readable
 * record: the counts in it have to match the build, and the only way to be sure of
 * that is to compute them rather than retype them.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

/* This script lives in the scan workbench, but everything it reads and writes is
   in the deliverable. The build is the only thing under strata-modern/; the
   workbench is a sibling. */
const ROOT = path.resolve(import.meta.dirname, '..', 'strata-modern');
const FILE = path.join(ROOT, '.impeccable', 'design.json');
const j = JSON.parse(await readFile(FILE, 'utf8'));

/* --- imagery coverage, counted not asserted ------------------------------- */
const KINDS = {
  people: /assets\/people\//,
  portrait: /assets\/portrait\//,
  exec: /assets\/exec\//,
  post: /assets\/post\//,
  client: /assets\/client-/,
};
const pages = (await readdir(ROOT)).filter(f => f.endsWith('.html'));
let withPhoto = 0;
const per = {};
for (const f of pages) {
  const src = await readFile(path.join(ROOT, f), 'utf8');
  const tags = [...src.matchAll(/<img[^>]*>/g)].map(m => m[0]);
  let n = 0;
  for (const [kind, re] of Object.entries(KINDS)) {
    const c = tags.filter(t => re.test(t)).length;
    if (c) per[kind] = (per[kind] ?? 0) + c;
    n += c;
  }
  if (n) withPhoto++;
}

/* --- asset weight, counted not asserted ----------------------------------- */
async function walk(dir, rel = '') {
  let out = [];
  for (const e of await readdir(path.join(dir, rel), { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out = out.concat(await walk(dir, r));
    else out.push(r);
  }
  return out;
}
const assetFiles = await walk(path.join(ROOT, 'assets'));
let bytes = 0;
for (const f of assetFiles) bytes += (await readFile(path.join(ROOT, 'assets', f))).length;

j.imagery = {
  ...j.imagery,
  coverage: {
    pagesWithPhotography: withPhoto,
    pagesTotal: pages.length,
    byKind: per,
    withoutPhotography: [
      'privacy.html - a legal document; imagery would push the text further down',
      '404.html - a dead end; the useful thing is the route back',
      'academy.html - enrolment particulars and a form; the role tracks live on course-outline.html',
      'role-insurance-specialist.html - the incumbent publishes no photograph for this role',
      'role-pm-customer-care.html - the incumbent publishes no photograph for this role',
    ],
    enforcedBy: 'tools/imagery-audit.mjs, which exits non-zero on an undeclared bare page',
  },
  secondPass: {
    what: 'The remaining pages, so the photography is not confined to the home and team pages',
    postImages: 'Each post og:image, fetched by name rather than guessed from the <img> tags in the article body (two newsletter posts carry 8-14 page scans, which are content, not a hero)',
    notCropped: 'Four of the eight are designed panels carrying their own type (mean edge energy 2.7 against 37.3 for the one clear photograph), so each keeps its own aspect and is contain-fitted on the sheet-2 ground',
    altPolicy: 'alt="" on every post and office photograph: they carry nothing the surrounding text does not, and nobody here has looked at them, so any description would be invented. Named portraits carry their name and role, composed from team.json.',
    optimiserBugsFound: [
      'The filename carried the width requested, not the width produced: the 600px source was written as -1200.webp, so srcset advertised a 1200w candidate that did not exist and a large viewport would have upscaled a 600px file. Widths are now recorded in content/post-images.json and the build generates srcset from that.',
      'Sources between 640 and 1200 wide got only a 640 variant, so those heroes would have upscaled too. The source width is now emitted in that range, capped at 1200 rather than shipping the 1536 and 2048 originals.',
    ],
    verifiedBy: 'tools/post-check.mjs checks the rendered srcset against the files on disk by reading each WebP header width, not against the manifest, because a manifest-only check would pass the mislabelled-name bug it exists to catch',
  },
  defectFoundWhilePlacing: {
    what: 'ctaBlock carried a hardcoded data-item="09" on all fifteen pages that use it',
    visible: '.item__no is not hidden - it renders as blue mono in the gutter - so about.html printed "01 02 03 04 09", implying four missing sections',
    scope: 'every page with fewer than nine items: solutions printed 01 02 03 09, team and journey printed 01 02 09',
    fix: 'Both the attribute and the printed number are derived from document order after generation; the build asserts both sequences on every page',
    whyItSurvived: 'each page looks locally consistent, so it is invisible in review',
  },
  clientPortraits: {
    note: 'Of the nine, all 150x150 and 72KB in total, served at exactly their natural size. They need no optimisation pass. An early version of imagery-audit.mjs reported testimonials.html as bare because it tested for assets/client/ when the files are flat as assets/client-*.jpg.',
  },
};

j.detector = {
  ...j.detector,
  engine: 'impeccable 4.1.0',
  findingsAfter: 251,
  remainingTotal: 251,
  disposition: 'ship',
  secondPassNote: 'The total rose 242 -> 251 and the rise is entirely numbered-section-labels (121 -> 130), because the second imagery pass added real numbered sections to previously bare pages. That rule fires on the existence of numbered section labels; here the numbering is the designs organising device and carries real sequence, so it is the one rule knowingly not complied with. The 242 -> 251 change is therefore a content change, not a regression.',
};
j.detector.remainingByRule['numbered-section-labels'] = {
  ...j.detector.remainingByRule['numbered-section-labels'],
  count: 130,
  disposition: 'deliberate',
  note: 'Fires on the existence of numbered section labels. The numbering is the organising device of the agenda/papers world and carries real sequence information, so it is knowingly not complied with.',
};

j.tools = {
  ...j.tools,
  postCheck: 'tools/post-check.mjs - checks the rendered srcset against the real header width of each file on disk',
  imageryAudit: 'tools/imagery-audit.mjs - reports which pages carry photography, and fails on an undeclared bare page',
  optimisePost: 'strata-scan/optimise-post.py - normalises the post images uncropped and writes content/post-images.json',
};

j.imageryCoverage = { pagesWithPhotography: withPhoto, pagesTotal: pages.length };

/* Components are a flat list of names. Append the ones this pass introduced,
   without duplicating anything already there. */
if (Array.isArray(j.components)) {
  for (const name of ['post-fig', 'tab-role', 'opt__fig', 'role-thumb', 'faces--eight']) {
    if (!j.components.includes(name)) j.components.push(name);
  }
}

await writeFile(FILE, JSON.stringify(j, null, 2) + '\n', 'utf8');
console.log(`  coverage: ${withPhoto} of ${pages.length} pages`);
console.log(`  assets: ${assetFiles.length} files, ${(bytes / 1024 / 1024).toFixed(2)}MB`);
console.log(`  image refs by kind: ${JSON.stringify(per)}`);
console.log(`  detector total: ${j.detector.findingsAfter}, numbered-section-labels: ${j.detector.remainingByRule['numbered-section-labels'].count}`);
console.log(`  wrote ${path.relative(ROOT, FILE)}`);
