# Strata Staff Global — modern rebuild

A full rebuild of [stratastaffglobal.com](https://stratastaffglobal.com/) as a
static site. No build step is needed to view it. The 40 HTML pages are committed
as-is and work by opening `index.html`.

The design direction is **AGENDA — the AGM notice pack**: the incumbent's own
subject matter is the agenda paper a strata manager assembles, punches,
circulates and files, so every page is a sheet on a desk. Read
[DESIGN.md](DESIGN.md) for the system and the reasoning.

## Run it

```
node serve.mjs           # http://127.0.0.1:4173/
node serve.mjs 8080      # or pick a port
```

`serve.mjs` is a dependency-free static server. It also exposes a `POST
/__probe` sink that writes a request body to `_probe-result.txt`, used by
`tools/measure-fit.html`.

## Regenerate the pages

```
node build.mjs
```

`build.mjs` is the single page generator: it writes all 40 pages plus the
generated `styles-tabs.css`, then prunes `assets/` so nothing orphaned ships. It
renders every page into memory first and **refuses to write** if any page
contains `undefined`, `NaN`, `[object Object]` or an escaped `<span` — an
unfilled template hole is a build failure, not a cosmetic bug.

Edit `build.mjs` for page content and structure, `styles.css` for the design
system, `app.js` for interaction, and `content/*.json` for posts and jobs.

## What is here

| Path | What it is |
| --- | --- |
| `*.html` | The 40 built pages. Committed, not generated at deploy time. |
| `styles.css` | The design system: tokens, layout, components, responsive rules, print. |
| `styles-tabs.css` | Generated. Visibility rules for the radio-driven tab panels. |
| `app.js` | Progressive enhancement only. Every page works without it. |
| `build.mjs` | The generator. |
| `serve.mjs` | The preview server. |
| `assets/` | Fonts, the logo and favicon, client portraits, platform marks, membership seals, flags, the authored highlighter SVG. |
| `content/` | Posts and job listings as JSON. |
| `tools/measure-fit.html` | Measures every page for horizontal overflow, height in screens, word count and how much of the viewport the sheet covers — and names the widest element behind any overflow. |
| `tools/measure-fit.ps1` | The runner for the above. Boots the preview server if needed and drives Chrome headless. |
| `tools/measure-blocks.html` | Measures one page block by block, with the computed padding and border of any selector's children. `-Upper` dumps every element the stylesheet uppercases. |
| `tools/measure-blocks.ps1` | The runner for the above. |
| `tools/render-plates.ps1` | Renders the plates in `.impeccable/plates/`, measuring each page first so a plate ends where the page ends. |
| `tools/contrast.mjs` | Recomputes every text/background ratio from the tokens in `styles.css`, including the composited white-on-navy pairs. |
| `tools/final-check.mjs` | Fetches all 40 pages, resolves every local reference, confirms no remote dependency, matches emitted tab ids against generated rules, and walks each heading sequence. Needs `serve.mjs` running. |
| `tools/a11y-check.mjs` | Audits every built page for duplicate ids, dangling fragment links, dangling ARIA references, unnamed controls and missing `alt`. Needs `serve.mjs` running. |
| `tools/detect-all.mjs` | Re-runs the impeccable detector over all 40 pages and summarises by rule. Needs `IMPECCABLE_HOME` and `IMPECCABLE_CMD`. |
| `tools/detect-show.mjs` | Prints the detail behind one rule's findings, e.g. `node tools/detect-show.mjs cramped`. |
| `DESIGN.md` | The design system, the accessibility decisions, and the detector findings. |
| `PRODUCT.md` | The product truth every claim on the site traces back to. |
| `.impeccable/` | The direction contract, the machine-readable design record, and rendered plates. |

## Fonts

Two self-hosted variable faces, subset to latin + latin-ext, declared in
`assets/fonts/fonts.css`: **Archivo** (weight 100–900, width 62–125) and
**Spline Sans Mono** (weight 300–700). There are no remote requests anywhere on
the site — no CDN, no font service, no analytics.

## Colour

The brand is **two colours and nothing else**. `assets/logo-full.png` was decoded
pixel by pixel with a hand-written PNG parser and contains exactly two colours:
`#094BC1` blue (54.1% of pixels) and `#00544E` teal (45.7%). Every accent on the
site is one of those two; every ground is a value the incumbent site ships in its
own stylesheet. Blue is the official voice — links, focus, the primary action,
the stamps. Teal is the record voice — clause and schedule numbers, the secondary
action, the seals, and the highlighter wash (`#B7DAD3`).

An earlier revision invented a vermilion stamp, a yellow highlighter and a gold
seal. All three were replaced. `node tools/contrast.mjs` recomputes the
contrast ratios from the tokens; the lowest in the palette is **5.10:1** against
an AA floor of 4.5:1.

## Fit

`tools/measure-fit.html` loads all 40 pages in iframes, sequentially, and reports
horizontal overflow, the height of each page in screens, its word count, and how
much of the viewport the sheet actually covers. It also names the widest
contributing element behind any overflow.

Current result: **zero horizontal overflow at 320, 390, 768, 1024, 1099, 1180,
1280, 1440, 1920 and 2560px**, and the sheet covers **96.5%–98.7%** of the
viewport at every one of them. An earlier revision overflowed on all 40 pages
below 670px and left up to 560px of dead desk either side on a wide monitor.

`tools/measure-blocks.ps1` measures a single page block by block — how tall each
section is, and the computed padding and border of any selector's children. It
was written to find out *which* section was making the home page long instead of
guessing, and it is how three defects were located: role rows rendering at
220–270px instead of 72px, the figures band stacking into one column, and the
home page's true height. Both tools are development-only and ship nothing.

The home page is now an overview, on the incumbent's own order (**7.0 screens at
1440×900, 5.4 at 1920×1080**, down from 11.3; 986 visible words, down from 1,783).
The other 39 pages are unchanged in structure. See `DESIGN.md` §11.

Run it with:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\measure-fit.ps1 -Viewports "390x844,1440x900,2560x1400"
```

## Accessibility

WCAG 2.1 AA. One `h1` per page with no skipped heading levels, a focus-managed
and `inert` contents drawer, `aria-live` register readouts, inline form
validation with `role="alert"`, and a `prefers-reduced-motion` path that pins the
highlighter drawn. All text/background pairs were measured by hand; the ratios
are recorded in `DESIGN.md` and `.impeccable/design.json`.

`node tools/a11y-check.mjs` audits the built pages for the failures a visual
review cannot see. Current result: **40 pages, 280 `id` attributes, zero
duplicate ids, zero dangling `#fragment` links, zero dangling `aria-describedby`
/ `aria-labelledby` / `aria-controls` references, zero controls without an
accessible name, and zero images without an `alt` attribute.** The check was
verified against a deliberately broken copy of a page to confirm it is not
passing vacuously.

## Honest limitations

- **Forms are front-end only.** They say so on the page: submissions are not
  delivered to any endpoint.
- **The capacity control on the home page is illustrative.** It models a post
  mix; the 200,000-tasks/month figure is the company's reported number.
- **Team portraits are not paired with names.** There are 19 plates against 20
  names and the filenames do not map reliably on their own. The page shows an
  unnamed photographic register plus a separate named register of officers, and
  says why. Executive and client portraits are paired, because those filenames
  are unambiguous.
- **`Strata Executive Assistant` has no page in the live sitemap**, though the
  navigation lists it. That role page is built only from real published phrases
  and its real five training modules.
- **`platform-mri-2.webp` returned 404** from the incumbent host and is not
  shipped.

## Detector

`impeccable detect` runs over all 40 pages and reports **242 findings, down from
1109**. Seven rule classes were eliminated outright. Of the 242, **238 are
deliberate** and reasoned in `DESIGN.md` §8; the remaining 4 are `cramped-padding`
findings on the home page that were measured in the browser and are artefacts of
the detector's CSS cascade handling — it reports a border with no inset where the
rendered insets are 19–82px. The measurements are in `DESIGN.md` §7.

The 242 is 43 lower than the previous run because one of §8's exceptions turned
out to be false. `all-caps-body` had been excused as "button and control labels";
dumping every uppercase text node showed that `.btn2` was uppercasing
40-character sentences and rendering the solutions email address as
`SOLUTIONS@STRATASTAFFGLOBAL.COM`. `.btn2` is now sentence case and the site's
uppercase is reserved for the primary action and for short labels.

`tools/detect-all.mjs` re-runs the sweep and summarises by rule;
`tools/detect-show.mjs <rule>` prints the detail for one rule, which is how each
finding was located rather than guessed at. Both need the local `impeccable`
binary and take its install path from `IMPECCABLE_BIN`, so they check the
`IMPECCABLE_HOME` environment before running.
