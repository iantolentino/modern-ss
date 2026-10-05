/* Record what the shoulder fix changed, without touching any prior key.
 *
 *   node strata-scan/update-design-6.mjs
 *
 * The portrait section of .impeccable/design.json described a crop. There is no crop
 * now, and the shape of the data changes with it: frames and the ratios they are
 * shown in are the source's own, and a guard compares each shipped file against its
 * raw source.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', 'strata-modern');
const FILE = path.join(ROOT, '.impeccable', 'design.json');

const j = JSON.parse(await readFile(FILE, 'utf8'));

/* Replaces the earlier faceFraming, which described the crop that turned out to be
   the fault. Prior keys that are still true are carried across. */
j.faceFraming = {
  ...(j.faceFraming || {}),
  summary: 'Portraits ship uncropped at the source\'s own 908x1671. Portrait boxes ' +
    'carry 908/1671 so object-fit: cover has nothing to crop.',
  previousApproach: 'Cropped to 3:4 and 4:5, which keeps the top 72.5% of a ' +
    '0.543-aspect source and removes the shoulders in the bottom 30%.',
  whyItWasWrong: 'A face detector answers "is the face cut?". Every head was intact, ' +
    'so the check passed while every portrait read as a head on a neck. The fault was ' +
    'below the chin and no face measurement could observe it.',
  whatRevealedIt: 'Measuring the subject silhouette row by row: subject width per ' +
    'tenth of frame. The shoulders are the bottom 30% of every source.',
  sourceRatio: '908/1671 (0.5435)',
  cssToken: '--portrait-ra',
  croppedByCss: 0,
  portraitRendersMeasured: 70,
  portraitRendersShowingTheWholeFile: 70,
  shoulders: {
    guard: 'strata-scan/shoulders.py',
    method: 'subject width per tenth of frame, background from the four corners, ' +
      'shipped file compared against its raw source',
    compared: 31,
    shippedBottomTenth: { min: 0.34, median: 0.93, max: 0.99 },
    belowSourceBottom: 0,
    tolerance: 0.25,
    selfTest: 'strata-scan/guard-selftest.py',
    selfTestResult: 'reproducing the 3:4 crop makes it report 8 portraits losing ' +
      'their shoulders and exit 1; restoring the assets makes it exit 0',
    worstCaseUnderTheOldCrop: 'patricia-puno 0.95 source -> 0.04 shipped',
  },
  layoutGuard: {
    tool: 'tools/face-verify.mjs',
    reports: 'TORSO CUT',
    current: 'no box cuts the bottom of any portrait',
    limitation: 'Cannot detect a file-level crop: it measures the file it is handed, ' +
      'so a file that has already lost its shoulders has no shoulder line to miss.',
  },
  pageHeightCost: 'median page 4.3 -> 4.6 screens; 0 horizontal overflow at 12 widths',
};

j.imagery = j.imagery || {};
j.imagery.faceFraming = {
  clipped: 0,
  masked: 0,
  torsoCut: 0,
  tested: 101,
  tightUnder3pct: 5,
  softUnder1x: 2,
  note: 'tight and soft are both source limits; see README Honest limitations',
};

/* A bug this change uncovered: the build's own asset scanner could not parse srcset. */
j.assetScanning = {
  file: 'build.mjs',
  previousPattern: 'assets/([^"\' )?#]+',
  fault: 'The character class stopped at a quote but not at whitespace or a comma, so ' +
    'a srcset value was captured as one glued string holding both candidates. Neither ' +
    'variant registered and every 2x file looked like dead weight.',
  correctedPattern: 'assets/([^"\' )?#\\s,]+',
  previousReportedOrphans: 38,
  actualOrphans: 0,
  resultAfterFix: '112 shipped, 0 present but unreferenced',
  independentConfirmation: 'tools/srcset-check.mjs, which always parsed srcset, ' +
    'reports 0 images pointed at by neither src nor srcset',
  consequenceHadTheWalkStayedDestructive: 'It would have deleted every 800 while ' +
    'keeping the 400 beside it. It was made report-only earlier for an unrelated ' +
    'reason, and that is the only thing that saved the assets.',
};

await writeFile(FILE, JSON.stringify(j, null, 2) + '\n', 'utf8');

console.log(`  .impeccable/design.json — ${Object.keys(j).length} top-level keys`);
console.log(`   faceFraming: uncropped, ${j.faceFraming.shoulders.compared} compared, ` +
  `${j.faceFraming.shoulders.belowSourceBottom} lost the shoulders`);
console.log('   keys now: ' + Object.keys(j).sort().join(', '));
