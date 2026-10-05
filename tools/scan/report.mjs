import { readFile, writeFile } from 'node:fs/promises';
const s = JSON.parse(await readFile('analysis.json', 'utf8'));

// site-wide nav = most common nav links on home
const home = s.find(x => x.file === 'home.html');
let out = '# STRATA STAFF GLOBAL — SITE DOSSIER\n\n';
out += '## SITE-WIDE NAVIGATION (from home)\n';
home.navLinks.forEach(l => { out += `- ${l.text}  ->  ${l.href}\n`; });
out += '\n## HOME META\n- title: ' + home.title + '\n- desc: ' + home.desc + '\n';
out += '\n## H1S ACROSS SITE\n';
s.forEach(x => { if (x.h1.length) out += `- ${x.file}: ${x.h1.join(' | ')}\n`; });

out += '\n## PER-PAGE OUTLINE\n';
for (const x of s) {
  out += `\n### ${x.file}\n`;
  out += `title: ${x.title}\n`;
  if (x.desc) out += `desc: ${x.desc}\n`;
  if (x.h2.length) out += `H2: ${x.h2.join(' || ')}\n`;
  if (x.h3.length) out += `H3: ${x.h3.slice(0, 20).join(' || ')}\n`;
  out += `images: ${x.imgsCount}\n`;
}
await writeFile('DOSSIER.md', out);
console.log('dossier written', out.length, 'chars');

// home text separately
let ht = '# HOME PAGE TEXT\n\n' + home.text.replace(/\n+/g, '\n');
await writeFile('HOME-TEXT.md', ht);
console.log('home text', ht.length);
