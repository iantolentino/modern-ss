/* Record the face-framing pass in .impeccable/design.json.
 *
 * Kept as a script for the same reason as update-design-4.mjs: the file is read by
 * other tooling, so every edit has to preserve the keys it already has. A hand edit
 * is how `components` ended up being iterated with Object.keys over an array and
 * reported as indices 0..n.
 *
 * Run: node strata-scan/update-design-5.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', 'strata-modern');
const FILE = path.join(ROOT, '.impeccable', 'design.json');

const raw = await readFile(FILE, 'utf8');
const j = JSON.parse(raw.replace(/^\uFEFF/, ''));

const before = Object.keys(j).length;

j.tools = j.tools ?? {};
Object.assign(j.tools, {
  faceBoxes: 'strata-scan/face-boxes.py - detect the face in every shipped raster (OpenCV Haar)',
  faceCheck: 'tools/face-check.ps1 - measure the rectangle each image actually shows, per viewport',
  faceVerify: 'tools/face-verify.mjs - join the two; exits non-zero on a clipped or masked face',
  contactSheet: 'tools/contact-sheet.py - render every crop with the face outlined, for a human',
});

j.faceFraming = {
  summary:
    'Every portrait is cropped so the head is in frame. Eleven of 43 were not, ' +
    'because frame() in optimise.py placed the skin-tone centroid at FACE_BIAS and ' +
    'the centroid is dragged down by the neck, hands and warm background.',
  detector:
    'OpenCV Haar cascades, frontal and profile, pooled over nine parameter sets and ' +
    'filtered by shape (height 10-80% of frame, aspect 0.6-1.8). Chosen because the ' +
    'previous YCbCr skin-tone box spanned the whole frame on these photographs at ' +
    '11-34% coverage and reported 79 clipped faces that were not clipped.',
  selection:
    'Highest plausible detection, not largest. Largest chose a torso over the face on ' +
    'team-accountant; "largest in the upper half" still admitted a torso centred at ' +
    '0.502 on carlo-andreu-tayag. Single-subject portraits make the head the topmost ' +
    'face-like blob.',
  cropRule:
    'The window still aims at FACE_BIAS but is bounded above by head_top minus 0.55 ' +
    'of a face height. All 31 raw sources keep the head in the top 15% (min 0.024, ' +
    'median 0.097), less than that margin needs, so the bound is always active and ' +
    'the crop is effectively top-anchored. With no detection it also anchors to the ' +
    'top rather than centring, which is the fallback that cut carlo-andreu-tayag.',
  headroomBefore: { under5pct: 11, under3_5pct: 7, of: 43 },
  headroomAfter: { under5pct: 1, under3_5pct: 1, of: 43 },
  clippedAfter: 0,
  maskedAfter: 0,
  maskedBefore: 9,
  measured: '517 rendered images, 215 matched a detected face, at 1440x900 and 390x844',
  faceCentreMedianAfter: '35%',
  remainingTight: [
    { asset: 'assets/exec/trevor-400.webp', headroom: '2.4%', note: "the source's own limit (raw head at 0.024)" },
  ],
  clientCircles:
    '.stmt__sig img carried border-radius: 50%, showing nine real clients as avatars. ' +
    'Removed. The only two circles left in styles.css are .hole and .perf, which are paper.',
  knownFalsePasses: [
    'tools/_crops.json is keyed by basename and strata-scan/_face-boxes.json by path, ' +
    'so the first join tested 36 of 535 images and announced the site clean.',
    'Density was computed from naturalWidth, which Chrome already divides by the ' +
    'effective srcset density; it invented eleven upscales that were not upscales.',
  ],
  caveat:
    'The detector is a heuristic and is wrong on a minority of frames. ' +
    'tools/contact-sheet.py exists so the check can be read rather than trusted.',
};

j.imagery = j.imagery ?? {};
j.imagery.faceFraming = {
  clipped: 0,
  masked: 0,
  tested: 215,
  tightUnder3pct: 5,
  tightNote: 'all five are the same asset, trevor-400, at its source limit',
  softUnder1x: 2,
  softNote:
    'marisol-office 0.82x and connect-q1-q2-2024 0.79x; both source-limited, ' +
    'nothing larger is published upstream',
};

await writeFile(FILE, JSON.stringify(j, null, 2) + '\n', 'utf8');

console.log(`  top-level keys: ${before} -> ${Object.keys(j).length}`);
console.log(`  tools: ${Object.keys(j.tools).length}`);
console.log(`  added faceFraming, imagery.faceFraming, and 4 tool entries`);
