/* Bring .impeccable/design.json up to date after the imagery work.
   Run from strata-modern: node ../strata-scan/update-design-3.mjs */
import { readFileSync, writeFileSync } from 'node:fs';

const P = 'C:/Users/ianto/Downloads/ai-tests/strata-modern/.impeccable/design.json';
const d = JSON.parse(readFileSync(P, 'utf8'));

/* The detector was upgraded under us, so record the version that produced each run. */
d.detector.engine = 'impeccable 4.1.0';
d.detector.reRunAfterImagery = {
  when: 'after the photography was added and the caption sizes were corrected',
  findingsBeforeCaptions: 262,
  findingsAfterCaptions: 242,
  note: 'The new engine adds a tiny-text rule and reports cramped-padding more widely, so the first run after the imagery read 262 against the 242 recorded for 0.1.6. Eleven of the surplus were all-caps-body and one was tiny-text, all from .plate-fig__role, which set the people\'s job titles in 10.5px uppercase mono. Raising it to 12.5px sentence case and deleting the register overrides that shrank it further returned the total to 242 on the same rule mix as before, with tiny-text at zero.',
  caveat: 'The 242 recorded for 0.1.6 and the 242 recorded for 4.1.0 are not the same measurement: the engines differ. The composition is what matches, not the engine.',
};

/* The first gap is now closed. */
d.knownContentGaps[0] =
  'Maristella Gaton has no usable portrait: the incumbent\'s own team grid shows her name beside another officer\'s photograph, verified in the raw markup. Nineteen of twenty names therefore carry a face, and team.html states why the twentieth does not. The pairing of the other nineteen is taken from that same published grid and generated into content/team.json by the asset pass, so it cannot drift from the images that were downloaded.';

d.imagery = {
  inventory: {
    'assets/people/': '19 named team portraits, 3:4, 480x640, face-centred, 224KB',
    'assets/portrait/': '8 role photographs at 400w and 800w, 4:5, face-centred, 404KB',
    'assets/exec/': '4 executive portraits at 400w and 800w, 4:5, face-centred, 469KB',
    'assets/platform-*.{png,jpg}': '12 platform logos, unmodified',
  },
  weight: { before: '8.4MB', after: '1.6MB', files: 78 },
  weightCameFrom: [
    'exec-*.jpg re-encoded to WebP at two widths: 6.79MB -> 1.10MB (-84%)',
    'team portraits replaced at 480x640, -70% each on average',
    '33 files removed from assets/ after proving nothing in any shipped page or stylesheet pointed at them',
  ],
  sourcesMovedNotDeleted:
    'The 14 Model-*.webp and exec-*.jpg originals plus the 2 unused section panels moved to strata-scan/raw-portrait/, because optimise.py reads them and deleting them would make the asset pass unreproducible. Re-running the optimiser from the new folder reproduces every shipped file byte for byte with zero MISSING entries.',
  framing:
    'Faces sit 27%-66% down the frame (skin-tone centroid, faces.py; found in 31/31, median 56%), so no single object-position works: cropping for the median decapitates the outliers. Each image is cropped to its target aspect around its own measured face at build time (optimise.py), and the stylesheet carries no object-position at all.',
  identity:
    'Named people and role photographs are separate sets. The 19 people carry names the incumbent publishes beside those exact portraits. The 8 Model-*.webp photographs carry NO published personal name, so they are captioned by role and no identity is invented for them.',
  roleCoverage: '8 of the 10 role pages carry a photograph; insurance-specialist and pm-customer-care have no matching photograph and keep the stamp rather than borrowing another role\'s face.',
  unusedOnPurpose: [
    'The-Strata-Staff-Difference.webp',
    'Tailored-Strategic-Offshore-Capacity-Solutions-For-The-Strata-Industry.webp',
  ],
  unusedReason: 'Both are 768x768 composed panels with low edge energy and a large dark middle band: designed panels carrying their own type, not photographs. The sections that would have held them use real named people instead.',
};

/* platwall was replaced by wall; the photographic components are new. */
d.components = [
  ...d.components.filter(c => c !== 'platwall'),
  'plate-fig', 'faces', 'roles', 'role-card', 'wall', 'points',
];

d.tools.srcsetCheck = 'tools/srcset-check.mjs - walks every srcset candidate, <link href> and CSS url() and checks each against disk, then names every shipped image nothing points at. Closes the gap where a build could validate src and ship a broken 800w candidate.';
d.tools.detectJson = 'tools/detect-json.mjs - runs the detector and parses its JSON without a shell redirect, which corrupts the stream with a BOM and the wrong code page.';
d.tools.optimise = 'strata-scan/optimise.py - crops every portrait around its own measured face and writes content/team.json.';

/* Every number in this file should be checkable against what the build produced. */
d.verifiedAfterImagery = {
  pages: 40,
  horizontalOverflow: 'zero at 320, 390, 768, 1024, 1099, 1180, 1280, 1440, 1920, 2560',
  homeScreensAt1440: 10.5,
  homeScreensAt390: 17.0,
  homeScreensAt320: 21.3,
  medianPageScreensAt1440: 4.0,
  imagesOnHomePage: 52,
  localReferences: 105,
  brokenReferences: 0,
  orphanedAssets: 0,
  duplicateIds: 0,
  contrastFloor: '5.10:1 (--ink-3 on --sheet)',
  detectorFindings: 242,
  note: 'The home page is 3.5 screens longer than the 7.0 recorded in §11. That is the deliberate trade: the request was "too much text", and the response replaced prose with 52 images rather than deleting sections the incumbent\'s site carries.',
};

writeFileSync(P, JSON.stringify(d, null, 2) + '\n');
console.log('design.json updated');
console.log('  keys:', Object.keys(d).length);
console.log('  detector.engine:', d.detector.engine);
console.log('  components:', d.components.length);
console.log('  tools:', Object.keys(d.tools).join(', '));
