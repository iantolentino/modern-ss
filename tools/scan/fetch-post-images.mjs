/* Fetch each post's featured image.
 *
 * The rebuild shipped nine pages of pure text because the original scan only
 * captured markup and copy -- it never pulled the images those pages actually
 * display. Each post's `og:image` is the canonical featured image the incumbent
 * itself nominates, so that is what is fetched here rather than guessing from the
 * <img> tags in the body (the newsletter posts carry 8-14 page scans, which are
 * the article's content, not its hero).
 *
 * Fetches at full size into raw-post/; optimise-post.py does the resizing.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'strata-scan', 'raw-post');
const HOST = 'https://stratastaffglobal.com/wp-content/uploads/';

/* slug -> the path the incumbent publishes as that post's og:image */
const FEATURED = {
  'as-we-enter-2025-a-new-symbol-will-lead-the-way': '2025/01/SEO-v2.jpg',
  'strata-staff-connect-1st-2nd-quarter-2024': '2024/07/Q1-2-Page-1.jpg',
  'strata-staff-connect-3rd-quarter-2024': '2024/11/Email-News-Letter-Q3-Final_01-e1731373818159.jpg',
  'strata-staff-joins-sca-south-australia': '2025/07/SCA-SA-1-1.jpg',
  'strata-staff-joins-the-canadian-condominium-institute-cci-british-columbia-chapter': '2025/11/image-4.jpg',
  'we-are-a-trusted-sca-member': '2025/02/1738805162915.jpg',
  'strata-staff-unveils-its-upgraded-marisol-office': '2025/06/image-1024x512.png',
  'premium-in-strategic-client-partnerships-and-engagement': '2024/11/image-5-1024x785.jpg',
};

await mkdir(OUT, { recursive: true });

for (const [slug, rel] of Object.entries(FEATURED)) {
  const ext = path.extname(rel);
  const url = HOST + rel;
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) {
      console.log(`  ${res.status}  ${slug}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(path.join(OUT, slug + ext), buf);
    console.log(`  ok  ${String(Math.round(buf.length / 1024)).padStart(5)}kb  ${slug}`);
  } catch (e) {
    console.log(`  ERR ${slug}: ${e.message}`);
  }
}
console.log(`\nwrote to ${path.relative(ROOT, OUT)}`);
