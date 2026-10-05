/* Build assets/PROVENANCE.json: every shipped asset mapped to the source it came from.
 *
 * The brief's finish condition is that every shipping raster carries its provenance.
 * Until now that claim lived in prose -- "all raster assets are the incumbent site's
 * own files" -- which is a claim about a set, not about a file, and cannot be
 * checked. This turns it into a record with one row per shipped asset.
 *
 * The mapping is derived, not retyped, from the records the asset passes already
 * wrote:
 *   - assets.mjs          shipped name -> upload path, for brand/member/platform/exec/client
 *   - raw-team/roster.json raw stem + published name + role, for the nineteen officers
 *   - optimise.py         ROLE_ART and EXECS: which Model-N became which role
 *   - fetch-post-images.mjs  FEATURED: post slug -> og:image
 *   - content/post-images.json  short shipped stem -> full post slug
 * and, for the team portraits, the name-adjacency rule the incumbent's own gallery
 * publishes (the <h2> caption that follows each image).
 *
 * A first attempt matched shipped basenames against every URL in the scan by slug
 * and reported all 93 assets as sourceless, because the shipped names were chosen
 * for the site rather than copied from the source. That is the finding worth
 * keeping: this record has to be a mapping, and a mapping has to be stated.
 */
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const SCAN = import.meta.dirname;
const DELIV = path.join(SCAN, '..', 'strata-modern');
const HOST = 'https://stratastaffglobal.com';
const UPLOADS = HOST + '/wp-content/uploads/';

const slug = s =>
  s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\.[a-z0-9]+$/, '')
    .replace(/-\d+x\d+$/, '')
    .replace(/-scaled$/, '')
    .replace(/-e\d{10,}$/, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* --- read the maps the asset passes already wrote -------------------------- */

// assets.mjs is a script, not a module: extract its `files` object literal rather
// than importing it (importing would re-run the downloads).
const assetsSrc = await readFile(path.join(SCAN, 'assets.mjs'), 'utf8');
/* Pull the body of an object literal out of a source file by finding its opening
   brace, rather than by counting characters in a marker string. The hand-counted
   version was off by one for ROLE_ART and produced `return {{`, so the offsets are
   computed now. */
function objectLiteral(src, marker) {
  const at = src.indexOf(marker);
  if (at < 0) throw new Error(`marker not found: ${marker}`);
  const open = src.indexOf('{', at + marker.length - 1);
  return new Function(`return {${src.slice(open + 1, src.indexOf('\n}', open))}}`)();
}

const FROM_ASSETS_MJS = objectLiteral(assetsSrc, 'const files =');

const roster = JSON.parse(await readFile(path.join(SCAN, 'raw-team', 'roster.json'), 'utf8'));

const optSrc = await readFile(path.join(SCAN, 'optimise.py'), 'utf8');
/* ROLE_ART and EXECS are Python dict literals carrying `#` comments, so they are
   read with a regex rather than evaluated. */
function pyDict(src, marker) {
  const at = src.indexOf(marker);
  if (at < 0) throw new Error(`marker not found: ${marker}`);
  const open = src.indexOf('{', at);
  const body = src.slice(open + 1, src.indexOf('}', open));
  const out = {};
  for (const m of body.matchAll(/'([^']+)'\s*:\s*'([^']+)'/g)) out[m[1]] = m[2];
  return out;
}
const ROLE_ART = pyDict(optSrc, 'ROLE_ART =');
const EXECS = pyDict(optSrc, 'EXECS =');

const postFetchSrc = await readFile(path.join(SCAN, 'fetch-post-images.mjs'), 'utf8');
const FEATURED = objectLiteral(postFetchSrc, 'const FEATURED =');

const POST_JSON = JSON.parse(await readFile(path.join(DELIV, 'content', 'post-images.json'), 'utf8'));

/* --- the team page's own name-adjacency rule ------------------------------- */
/* Each portrait is followed by its owner's name in a caption, which is the pairing
   the incumbent publishes. Name -> the srcset URL, so the portrait's source is
   established rather than guessed. */
const teamHtml = await readFile(path.join(SCAN, 'pages', 'our-awesome-team.html'), 'utf8');
const NAME_TO_URL = new Map();
{
  const re = /srcset="([^"]+)"[^>]*>\s*<\/div>\s*<div[^>]*class="gallery-item-caption-wrap[\s\S]{0,400}?<h2 class="fg-item-title">([^<]+)<\/h2>/g;
  for (const m of teamHtml.matchAll(re)) {
    const urls = [...m[1].matchAll(/(https?:\/\/[^\s,]+?)(?:-\d+x\d+)?\.(?:jpe?g|png|webp)\s+\d+w/g)].map(x => x[0].split(/\s+/)[0]);
    const best = urls.sort((a, b) => (parseInt(b.match(/(\d+)w$/)?.[1] ?? 0) - parseInt(a.match(/(\d+)w$/)?.[1] ?? 0)))[0];
    if (best) NAME_TO_URL.set(slug(m[2].trim()), best);
  }
}

/* --- exec sources, from the same upload paths assets.mjs recorded ---------- */
const EXEC_SRC = {
  trevor: FROM_ASSETS_MJS['exec-trevor.jpg'],
  paul: FROM_ASSETS_MJS['exec-paul.jpg'],
  tongta: FROM_ASSETS_MJS['exec-tongta.jpg'],
  dan: FROM_ASSETS_MJS['exec-dan.jpg'],
};

/* --- build shipped-asset -> source ---------------------------------------- */
const peopleBySlug = new Map();   // slug(name) -> upload path
for (const r of roster) {
  const key = slug(r.name);
  const url = NAME_TO_URL.get(key);
  if (url) peopleBySlug.set(key, url.replace(/^https?:\/\/[^/]+/, '').replace(/^\/wp-content\/uploads\//, ''));
}

const postByStem = new Map();     // short shipped stem -> upload path
for (const [stem, v] of Object.entries(POST_JSON.images)) {
  const featured = FEATURED[v.slug];
  if (featured) postByStem.set(stem, featured);
}

function sourceFor(rel) {
  const base = path.basename(rel);
  const stem = base.replace(/-\d+(\.[a-z0-9]+)$/i, '$1').replace(/\.[a-z0-9]+$/i, '');

  // top-level brand / member / platform / client: assets.mjs records these directly
  if (FROM_ASSETS_MJS[base]) return { path: FROM_ASSETS_MJS[base], via: 'assets.mjs' };

  // people/<slug>.webp, from the roster and the gallery's own caption pairing
  if (rel.startsWith('people/')) {
    const p = peopleBySlug.get(stem);
    if (p) return { path: p, via: 'raw-team/roster.json + the team page caption that follows each portrait' };
    return null;
  }

  // portrait/<role>-NNN.webp, from ROLE_ART
  if (rel.startsWith('portrait/')) {
    const model = Object.entries(ROLE_ART).find(([, role]) => role === stem)?.[0];
    if (!model) return null;
    return { path: `2025/07/${model}.webp`, via: 'optimise.py ROLE_ART, from the home page role cards' };
  }

  // exec/<name>-NNN.webp
  if (rel.startsWith('exec/')) {
    const p = EXEC_SRC[stem];
    if (!p) return null;
    return { path: p, via: 'optimise.py EXECS + assets.mjs' };
  }

  // post/<stem>-NNN.webp, from each post's own og:image
  if (rel.startsWith('post/')) {
    const p = postByStem.get(stem);
    if (!p) return null;
    return { path: p, via: "the post's own og:image (fetch-post-images.mjs FEATURED)" };
  }

  return null;
}

/* fonts and the authored marker are not the incumbent's uploads */
const AUTHORED = {
  'marker.svg': 'Authored for this rebuild: the highlighter stroke, drawn as an SVG path. Not from the incumbent.',
  'fonts.css': 'Generated from the Google Fonts CSS API for Archivo and Spline Sans Mono, then self-hosted.',
};
const isFont = rel => rel.startsWith('fonts/');

const readCache = { home: await readFile(path.join(SCAN, 'pages', 'home.html'), 'utf8') };

async function walk(dir, rel = '') {
  let out = [];
  for (const e of await readdir(path.join(dir, rel), { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out = out.concat(await walk(dir, r));
    else out.push(r);
  }
  return out;
}

const shipped = (await walk(path.join(DELIV, 'assets')))
  .filter(f => f !== 'PROVENANCE.json')
  .sort();

const rows = [];
const unmatched = [];
for (const rel of shipped) {
  const bytes = (await stat(path.join(DELIV, 'assets', rel))).size;
  const asset = `assets/${rel}`;

  if (AUTHORED[rel]) {
    rows.push({ asset, bytes, source: null, provenance: AUTHORED[rel] });
    continue;
  }
  if (isFont(rel)) {
    rows.push({
      asset, bytes, source: 'https://fonts.googleapis.com/css2?family=Archivo&family=Spline+Sans+Mono',
      provenance: 'Self-hosted from Google Fonts, which serves these under the SIL Open Font License.',
    });
    continue;
  }

  const hit = sourceFor(rel);
  if (hit) {
    rows.push({ asset, bytes, source: UPLOADS + hit.path, via: hit.via });
  } else {
    rows.push({ asset, bytes, source: null });
    unmatched.push(asset);
  }
}

const resolved = rows.filter(r => r.source || r.provenance);
const byDir = {};
for (const r of rows) {
  const d = r.asset.split('/')[1].includes('.') ? '(top level)' : r.asset.split('/')[1];
  byDir[d] ??= { files: 0, bytes: 0, unresolved: 0 };
  byDir[d].files++;
  byDir[d].bytes += r.bytes;
  if (!r.source && !r.provenance) byDir[d].unresolved++;
}

const out = {
  note: 'Every asset shipped in assets/, with the URL or authorship it came from. Generated by strata-scan/provenance.mjs; do not edit by hand. A null source with no provenance means the generator could not establish where the file came from; that is reported rather than guessed.',
  incumbentHost: HOST,
  derivedFrom: {
    'assets.mjs': 'shipped name -> upload path, for brand, membership marks, platform logos, executive originals and client portraits',
    'raw-team/roster.json': 'the raw stem, published name and role of the nineteen officers',
    'optimise.py': 'ROLE_ART (which Model-N became which role) and EXECS',
    'fetch-post-images.mjs': "FEATURED, each post's own og:image",
    'content/post-images.json': 'the short shipped stem -> full post slug',
    'pages/our-awesome-team.html': 'the caption that follows each portrait, which is the name/photo pairing the incumbent publishes',
  },
  methodNote: 'The mapping has to be stated, not inferred. A first attempt slug-matched shipped basenames against every URL in the scan and reported all 93 assets as sourceless, because the shipped names were chosen for the site rather than copied from the source.',
  totals: {
    assets: rows.length,
    withSource: rows.filter(r => r.source).length,
    authoredOrLicensed: rows.filter(r => !r.source && r.provenance).length,
    unresolved: unmatched.length,
    bytes: rows.reduce((a, r) => a + r.bytes, 0),
  },
  byDirectory: byDir,
  assets: rows,
};

await writeFile(path.join(DELIV, 'assets', 'PROVENANCE.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');

console.log(`  ${rows.length} assets: ${out.totals.withSource} with a source URL, ${out.totals.authoredOrLicensed} authored/licensed, ${unmatched.length} unresolved`);
console.log(`  ${(out.totals.bytes / 1024 / 1024).toFixed(2)}MB total\n`);
for (const [d, v] of Object.entries(byDir).sort((a, b) => b[1].bytes - a[1].bytes)) {
  console.log(`    ${d.padEnd(14)} ${String(v.files).padStart(3)} files  ${(v.bytes / 1024).toFixed(0).padStart(5)}kb` + (v.unresolved ? `   ${v.unresolved} UNRESOLVED` : ''));
}
if (unmatched.length) {
  console.log('\n  unresolved:');
  for (const u of unmatched) console.log(`    ${u}`);
}
process.exitCode = unmatched.length ? 1 : 0;
