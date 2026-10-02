/* Accessibility and integrity audit over every built page.

   Catches the class of bug that a visual review cannot see and that a per-page
   spot check misses:
     - duplicate id attributes within a page (breaks fragment links and label
       association, and is invisible until something reads the wrong element)
     - internal #fragment links that point at an id the page does not have
     - aria-describedby / aria-labelledby / aria-controls / for targets that do
       not exist
     - images with no alt attribute at all (alt="" is fine and deliberate)
     - form controls with no accessible name (label[for], aria-label, or a
       wrapping label)
     - a <label for> pointing at a missing or non-control element

   Usage:  node tools/a11y-check.mjs        (needs serve.mjs running)
   Exits non-zero when anything is found. */
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const B = 'http://127.0.0.1:4173';
const pages = readdirSync(ROOT).filter(f => f.endsWith('.html')).sort();

const problems = [];
const add = (page, kind, detail) => problems.push({ page, kind, detail });
const idsOf = html => new Set([...html.matchAll(/\sid\s*=\s*"([^"]+)"/g)].map(m => m[1]));

let totalIds = 0;
for (const p of pages) {
  let html;
  try {
    const r = await fetch(`${B}/${p}`);
    if (!r.ok) { add(p, 'http', `status ${r.status}`); continue; }
    html = await r.text();
  } catch (e) { add(p, 'fetch', String(e).slice(0, 80)); continue; }

  // duplicate ids
  const all = [...html.matchAll(/\sid\s*=\s*"([^"]+)"/g)].map(m => m[1]);
  totalIds += all.length;
  const seen = new Map();
  for (const id of all) seen.set(id, (seen.get(id) || 0) + 1);
  for (const [id, n] of seen) if (n > 1) add(p, 'duplicate-id', `"${id}" appears ${n} times`);
  const have = new Set(all);

  // internal fragment links resolve
  for (const m of html.matchAll(/href\s*=\s*"#([^"]+)"/g)) {
    if (!have.has(m[1])) add(p, 'dangling-fragment', `href="#${m[1]}"`);
  }

  // ARIA reference targets exist
  for (const attr of ['aria-describedby', 'aria-labelledby', 'aria-controls']) {
    const re = new RegExp(`${attr}\\s*=\\s*"([^"]+)"`, 'g');
    for (const m of html.matchAll(re)) {
      for (const ref of m[1].trim().split(/\s+/)) {
        if (ref && !have.has(ref)) add(p, `dangling-${attr}`, `"${ref}"`);
      }
    }
  }

  // images must state alt, even if empty
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt\s*=/.test(m[0])) add(p, 'img-no-alt', m[0].slice(0, 80));
  }

  // label[for] must point at a real control
  const controlIds = new Set([...html.matchAll(/<(?:input|select|textarea)\b[^>]*\sid\s*=\s*"([^"]+)"/g)].map(m => m[1]));
  for (const m of html.matchAll(/<label\b[^>]*\sfor\s*=\s*"([^"]+)"/g)) {
    if (!controlIds.has(m[1])) add(p, 'label-for-missing-control', `for="${m[1]}"`);
  }

  // every control needs a name: label[for], aria-label(ledby), or a *wrapping*
  // label. The wrapping case is implicit association and is easy to miss when
  // scanning attributes, so the label spans are located by index and the control
  // is tested against them positionally.
  const forTargets = new Set([...html.matchAll(/<label\b[^>]*\sfor\s*=\s*"([^"]+)"/g)].map(m => m[1]));
  const labelSpans = [];
  for (const m of html.matchAll(/<label\b[^>]*>[\s\S]*?<\/label>/g)) {
    labelSpans.push([m.index, m.index + m[0].length]);
  }
  const insideLabel = i => labelSpans.some(([a, b]) => i >= a && i < b);
  for (const m of html.matchAll(/<(input|select|textarea)\b[^>]*>/g)) {
    const tag = m[0];
    if (/\stype\s*=\s*"(hidden|submit|button|reset|image)"/i.test(tag)) continue;
    const idm = tag.match(/\sid\s*=\s*"([^"]+)"/);
    const named = (idm && forTargets.has(idm[1]))
      || /\saria-label\s*=|\saria-labelledby\s*=/.test(tag)
      || insideLabel(m.index);
    if (!named) add(p, 'control-without-name', tag.replace(/\s+/g, ' ').slice(0, 90));
  }
}

console.log(`a11y-check: ${pages.length} pages, ${totalIds} id attributes scanned`);
if (!problems.length) {
  console.log('  no duplicate ids, dangling fragments, dangling ARIA references,');
  console.log('  unnamed controls or missing alt attributes.');
  process.exit(0);
}
const byKind = new Map();
for (const p of problems) byKind.set(p.kind, (byKind.get(p.kind) || 0) + 1);
console.log('');
for (const [k, n] of [...byKind.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${k}`);
console.log('');
for (const p of problems.slice(0, 40)) console.log(`  ${p.page}  ${p.kind}  ${p.detail}`);
if (problems.length > 40) console.log(`  ... and ${problems.length - 40} more`);
process.exit(1);
