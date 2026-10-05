/* Second design.json pass: the all-caps-body audit and the .btn2 fix. */
import { readFileSync, writeFileSync } from 'node:fs';

const P = 'C:/Users/ianto/Downloads/ai-tests/strata-modern/.impeccable/design.json';
const d = JSON.parse(readFileSync(P, 'utf8'));

d.detector.findingsAfter = 242;
d.detector.reRunAfterHomeRelayout.findings = 242;
d.detector.reRunAfterHomeRelayout.note =
  'numbered-section-labels falls by six because the home page\'s seven invented Motion/Schedule labels are gone. all-caps-body falls 117 -> 74 because .btn2 was uppercasing sentences and the solutions email address; it is now sentence case.';

d.detector.remainingByRule = {
  'numbered-section-labels': { count: 121, severity: 'advisory', disposition: 'deliberate' },
  'all-caps-body': { count: 74, severity: 'warning', disposition: 'deliberate' },
  'gpt-thin-border-wide-shadow': { count: 40, severity: 'advisory', disposition: 'deliberate' },
  'cramped-padding': { count: 4, severity: 'warning', disposition: 'false-positive' },
  'marketing-buzzword': { count: 2, severity: 'warning', disposition: 'deliberate' },
  'em-dash-overuse': { count: 1, severity: 'advisory', disposition: 'deliberate' },
};
d.detector.remainingTotal = 242;

d.detector.falsePositives = d.detector.falsePositives.filter(f => f.rule !== 'all-caps-body');
d.detector.correctedExceptions = [
  {
    rule: 'all-caps-body',
    previousDisposition: 'deliberate — described as "button and control labels"',
    previousCount: 117,
    nowCount: 74,
    whatWasWrong:
      'The exception was overstated. Auditing the findings instead of trusting the sentence showed .btn2 was uppercased and carrying 40-character sentences ("See all ten roles and both service lines") and the solutions email address, which rendered as SOLUTIONS@STRATASTAFFGLOBAL.COM. Neither is a control label.',
    fix:
      '.btn2 is now sentence case; the primary .btn stays uppercase. Primary and secondary actions are now distinguished by case as well as by fill, so the hierarchy improved rather than regressed.',
    residualRule:
      'No sentence is uppercased anywhere on the site. The tallest uppercase string is now the 32-character primary CTA "Schedule the free discovery call", followed by form field labels (<=21), footer headings (<=17), stamps, address labels and the skip link.',
    verifiedBy:
      'tools/measure-blocks.ps1 -Upper dumps every element the stylesheet uppercases with its rendered text and length, rather than inferring from the CSS.',
  },
];

d.tools.measureBlocks = 'tools/measure-blocks.ps1 -Page index.html [-Selector ".band__grid"] [-Upper] - one page block by block, with computed padding and border; -Upper dumps every uppercase text node with its rendered text';

writeFileSync(P, JSON.stringify(d, null, 2) + '\n');
console.log('updated; remaining total recorded:', d.detector.remainingTotal);
