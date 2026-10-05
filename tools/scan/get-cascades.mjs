/* Fetch the Haar cascade files the face check needs.
 *
 * opencv-python-headless ships no cascade XML in 5.0, so they are downloaded from
 * the OpenCV repository rather than assumed present. Two cascades: the frontal one,
 * and the profile one, because a few of these portraits are not square to camera and
 * a frontal-only detector silently reports "no face" for them -- which would read as
 * "nothing to clip" and hide exactly the images worth checking.
 *
 * Run: node strata-scan/get-cascades.mjs
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.join(import.meta.dirname, 'cascades');
await mkdir(OUT, { recursive: true });

const FILES = [
  'haarcascade_frontalface_default.xml',
  'haarcascade_profileface.xml',
];
const BASE = 'https://raw.githubusercontent.com/opencv/opencv/4.x/data/haarcascades/';

for (const f of FILES) {
  const res = await fetch(BASE + f);
  if (!res.ok) { console.log(`  FAILED ${f} (${res.status})`); continue; }
  const text = await res.text();
  /* Validate on the root element. The first version tested for `<cascade>`, which
     this file does not contain literally -- its root is `<opencv_storage>` -- so a
     perfectly good 930KB cascade was rejected as "not a cascade". */
  if (!text.includes('opencv_storage')) { console.log(`  FAILED ${f} (not a cascade)`); continue; }
  await writeFile(path.join(OUT, f), text, 'utf8');
  console.log(`  ${f}  ${(text.length / 1024).toFixed(0)}kb`);
}
console.log(`  wrote ${path.relative(path.join(import.meta.dirname, '..'), OUT)}/`);
