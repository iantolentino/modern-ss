/* Update .impeccable/design.json for the home-page re-layout round:
   the re-run detector counts, the four measured false positives, the measured
   home-page heights, and the new block-measuring tool. */
import { readFileSync, writeFileSync } from 'node:fs';

const P = 'C:/Users/ianto/Downloads/ai-tests/strata-modern/.impeccable/design.json';
const d = JSON.parse(readFileSync(P, 'utf8'));

const total = (o) => Object.values(o).reduce((a, v) => a + (v.count || 0), 0);

d.detector.clearedRules = d.detector.clearedRules.filter(r => r !== 'cramped-padding');
d.detector.reRunAfterHomeRelayout = {
  when: 'after the home page was re-laid out to the incumbent site\'s own section order with plain headings',
  findings: 285,
  note: 'numbered-section-labels falls by six because the home page\'s seven invented Motion/Schedule labels are gone; the other 39 pages keep their item numbers deliberately. all-caps-body rises by two for the figures band\'s mono uppercase labels.',
};
d.detector.remainingByRule = {
  'numbered-section-labels': { count: 121, severity: 'advisory', disposition: 'deliberate' },
  'all-caps-body': { count: 117, severity: 'warning', disposition: 'deliberate' },
  'gpt-thin-border-wide-shadow': { count: 40, severity: 'advisory', disposition: 'deliberate' },
  'cramped-padding': { count: 4, severity: 'warning', disposition: 'false-positive' },
  'marketing-buzzword': { count: 2, severity: 'warning', disposition: 'deliberate' },
  'em-dash-overuse': { count: 1, severity: 'advisory', disposition: 'deliberate' },
};
d.detector.falsePositives = [
  {
    rule: 'cramped-padding',
    file: 'index.html',
    reported: [
      '.band__cell: children flush against border-left on left (no inset)',
      '.band__cell: children flush against border-top/left on left (no inset) x2',
      '.resolution: children flush against bg on top/bottom (no inset)',
    ],
    measured: 'At 1280px wide, .band__cell after the first renders padding-left: 32px inside a 1px hairline; at 390px the hairline is horizontal and the inset is padding-top: 19.2px; .resolution renders padding-top and padding-bottom of 81.92px.',
    why: 'The detector applies narrow-width media-query rules regardless of viewport and does not consistently resolve a later override, so it sees a border with no inset where the browser sees 19-82px. Three attempts to rule out a real defect did not change the finding: the band was given its own cell classes instead of reusing .fact, the cell borders were removed outright, and the clamp() in both bands\' padding was moved into root custom properties. Verified with tools/measure-blocks.ps1 reading getComputedStyle.',
  },
];
d.detector.remainingTotal = total(d.detector.remainingByRule);

d.fit.homeRelayout = {
  method: 'tools/measure-blocks.ps1 loads one page and reports each top-level block\'s height in screens, plus the computed padding and border of any selector\'s children. Written to locate which section was making the home page long instead of guessing.',
  before: { screens1440: 11.3, visibleWords: 1783, numberedSectionLabels: 8 },
  after: { screens1440: 7.0, screens1920: 5.4, screens390: 12.8, visibleWords: 986, numberedSectionLabels: 0 },
  note: 'The page is an overview: the hero, eight short sections on the incumbent\'s own order, and a 0.7-screen footer. It does not reach four screens without dropping sections the incumbent\'s own site carries, so the reported figure is 7.0 rather than a claim of 4.',
  defectsExposed: [
    'The .resolution navy closing band and its whole style block existed, app.js was listening for .stamp--settle, and the home page emitted an empty <section> in its place: the signature interaction had never rendered.',
    'The folio rail counted [data-item], the printed item number, so on an unnumbered page it found nothing and left the static "01 / 01" placeholder on screen. It now counts section.item and reports the index.',
    'optionsList emitted an empty .opt__no span for rows without a number, so four children went into a three-column plain grid and the arrow wrapped to an implicit second row: role rows rendered at 220-270px instead of 72px.',
    'The figures band was placed in .wrap, itself a twelve-column grid, without grid-column: 1 / -1, so it resolved to a single minmax(190px,1fr) track and stacked its three figures vertically.',
  ],
};

d.fit.bugsFixed.push('the asset pruner unlinked anything no page referenced, so moving the platform wall off the home page deleted all twelve platform logos from disk; it now reports "present but unreferenced" and leaves the files alone');

d.tools = {
  ...(d.tools || {}),
  measureFit: 'tools/measure-fit.ps1 -Viewports "390x844,1440x900" - all 40 pages: overflow, height in screens, words, sheet fill',
  measureBlocks: 'tools/measure-blocks.ps1 -Page index.html -Selector ".band__grid" - one page block by block, with computed padding and border',
  detectAll: 'strata-scan/detect-all.mjs - re-run the detector over all 40 pages, summarised by rule',
  detectShow: 'strata-scan/detect-show.mjs <rule> - the detail behind one rule\'s findings',
};

writeFileSync(P, JSON.stringify(d, null, 2) + '\n');
console.log('updated', P);
console.log('remaining findings recorded:', d.detector.remainingTotal);
