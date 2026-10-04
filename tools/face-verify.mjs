/* Join the browser's crop rectangles with the detected face boxes and report any face
 * the layout is cutting.
 *
 * Two independent measurements have to agree for this to work: face-boxes.py says
 * where the face is in the source file as fractions (OpenCV Haar, frontal and
 * profile), and face-check.html says which fractions of the source the box actually
 * shows at a given viewport. A face is lost when part of its box falls outside the
 * visible rectangle.
 *
 * This began on a YCbCr skin-tone box, which was useless: on these photographs it
 * returned a region spanning the entire frame at 11-34% coverage, because it also
 * fires on warm walls and timber, and it reported 79 clipped faces that were not
 * clipped. It was replaced with a real detector. Treat the output as a measurement
 * of a heuristic, not a verdict; tools/contact-sheet.py renders the same crops for a
 * person to look at.
 *
 * Reads  tools/_crops.json   (CROP| JSON lines, written by face-check.ps1)
 *        strata-scan/_face-boxes.json
 * Run    node tools/face-verify.mjs
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const FACES = path.join(ROOT, '..', 'strata-scan', '_face-boxes.json');

const strip = s => s.replace(/^\uFEFF/, '');

const crops = strip(await readFile(path.join(ROOT, 'tools', '_crops.json'), 'utf8'))
  .split('\n').filter(l => l.startsWith('CROP|'))
  .map(l => JSON.parse(l.slice(5)));

const boxes = JSON.parse(await readFile(FACES, 'utf8'));

/* The browser reports the chosen file's basename; the boxes are keyed by path
   relative to assets/. Joining those two directly matched only the files that sit at
   the top level, so the first run tested 36 of 535 images and reported "no face is
   clipped" on almost no evidence. Index both ways and join on the basename. */
const byBase = new Map();
for (const [k, v] of Object.entries(boxes)) {
  const b = k.split('/').pop();
  // a basename can be ambiguous across folders; keep the first and record the clash
  if (byBase.has(b)) byBase.set(b, byBase.get(b) === v ? v : { ...v, ambiguous: true });
  else byBase.set(b, v);
}
const lookupFace = src => boxes[src] ?? byBase.get(src) ?? null;

/* The box is already the face -- a Haar detection, not a skin region -- so it is
   measured directly. The number that matters is headroom: how much room is left
   above the brow inside the visible rectangle. A crop that decapitates shows up
   there first, before the box itself is cut. */
const MIN_HEADROOM = 0.03;

const clipped = [];   // the face box falls outside the visible rectangle
const masked = [];    // the face is behind a non-rectangular mask
const soft = [];      // rendered larger than the file can support
const ambiguous = []; // a basename that exists in more than one assets/ folder
const tight = [];     // inside the rectangle, but with little room above the brow
let checked = 0;

for (const c of crops) {
  if (!c.nw || !c.nh) continue;
  const fb = lookupFace(c.src);
  if (!fb || !fb.face || !c.vis) continue;
  checked++;
  if (fb.ambiguous) ambiguous.push(c.src);
  const s = fb.face;
  const v = c.vis;

  const inside = s.y0 >= v.y0 && s.y1 <= v.y1 && s.x0 >= v.x0 && s.x1 <= v.x1;
  const overlaps = s.y1 > v.y0 && s.y0 < v.y1 && s.x1 > v.x0 && s.x0 < v.x1;

  if (!inside && overlaps) {
    const cutTop = Math.max(0, v.y0 - s.y0);
    const cutBot = Math.max(0, s.y1 - v.y1);
    const cutL = Math.max(0, v.x0 - s.x0);
    const cutR = Math.max(0, s.x1 - v.x1);
    clipped.push({
      page: c.page, vw: c.vw, src: c.src, crop: c.crop,
      headOut: Math.round(((cutTop + cutBot + cutL + cutR) / ((s.y1 - s.y0) + (s.x1 - s.x0))) * 1000) / 10,
      detail: `top ${(cutTop * 100).toFixed(1)}% bottom ${(cutBot * 100).toFixed(1)}% left ${(cutL * 100).toFixed(1)}% right ${(cutR * 100).toFixed(1)}%`,
    });
  } else if (!overlaps) {
    clipped.push({
      page: c.page, vw: c.vw, src: c.src, crop: c.crop, headOut: 100,
      detail: 'the face is entirely outside the visible rectangle',
    });
  }

  const headroom = s.y0 - v.y0;
  if (inside && headroom < MIN_HEADROOM) {
    tight.push({ page: c.page, vw: c.vw, src: c.src, headroom, box: `${c.bw}x${c.bh}` });
  }

  if (c.radius && c.radius !== '0px') {
    masked.push({ page: c.page, vw: c.vw, src: c.src, radius: c.radius, box: `${c.bw}x${c.bh}` });
  }
  /* Density has to come from the file's real pixel width, not from naturalWidth.
     With a srcset of `w` descriptors and a `sizes` attribute, Chrome reports
     naturalWidth already divided by the effective density, so dividing it by the CSS
     box width counts the same correction twice and invents softness: it called
     accountant-400 -- a 400x500 file in a 320x400 box, comfortably sharp -- an
     upscale at "0.73x". The boxes carry the true dimensions, so use those. */
  if (fb.w && c.bw && fb.w / c.bw < 1) {
    soft.push({ page: c.page, vw: c.vw, src: c.src, density: fb.w / c.bw, nat: `${fb.w}x${fb.h}`, box: `${c.bw}x${c.bh}` });
  }
}

const pages = [...new Set(crops.map(c => c.page))].length;
const uniq = a => [...new Map(a.map(x => [`${x.src}|${x.page}|${x.vw}`, x])).values()];

console.log(`  ${crops.length} rendered images across ${pages} page/viewport combinations`);
console.log(`  ${checked} matched a detected face and were tested`);
if (ambiguous.length) console.log(`  note: ${uniq(ambiguous).length} basename(s) exist in more than one folder`);
console.log('');
const noBox = crops.filter(c => c.nw && !lookupFace(c.src));
console.log(`  ${noBox.length} rendered images have no face (logos, marks, flags, designed panels)`);

if (clipped.length) {
  console.log(`  ${clipped.length} CLIPPED - the box cuts into the face:`);
  for (const r of uniq(clipped).slice(0, 40)) {
    console.log(`    ${r.src}`);
    console.log(`        ${r.page} @${r.vw}  crop ${r.crop.w}% w / ${r.crop.h}% h  face ${r.headOut}% outside  (${r.detail})`);
  }
} else {
  console.log('  no face is clipped by any box at any measured viewport.');
}

if (tight.length) {
  console.log(`\n  ${tight.length} TIGHT - inside the box, but under ${(MIN_HEADROOM * 100).toFixed(0)}% of room above the brow:`);
  for (const r of uniq(tight).slice(0, 20)) {
    console.log(`    ${r.src}  headroom ${(r.headroom * 100).toFixed(1)}%  box ${r.box}  ${r.page} @${r.vw}`);
  }
  console.log('    (above 0 a face is not cut; this is the margin, not a failure)');
}

if (masked.length) {
  console.log(`\n  ${masked.length} MASKED - shown through a non-rectangular shape:`);
  for (const r of uniq(masked).slice(0, 20)) {
    console.log(`    ${r.src}  radius ${r.radius}  box ${r.box}  ${r.page} @${r.vw}`);
  }
}

if (soft.length) {
  console.log(`\n  ${soft.length} SOFT - the file is narrower than the box it fills (upscaled):`);
  for (const r of uniq(soft).slice(0, 20)) {
    console.log(`    ${r.src}  ${r.nat} in a ${r.box} box  density ${r.density.toFixed(2)}x  ${r.page} @${r.vw}`);
  }
}

process.exitCode = clipped.length || masked.length ? 1 : 0;
