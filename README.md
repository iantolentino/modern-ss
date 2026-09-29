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
| `tools/measure-fit.html` | Measures every page for horizontal overflow and height in screens at a given viewport. |
| `DESIGN.md` | The design system, the accessibility decisions, and the detector findings. |
| `PRODUCT.md` | The product truth every claim on the site traces back to. |
| `.impeccable/` | The direction contract, the machine-readable design record, and rendered plates. |

## Fonts

Two self-hosted variable faces, subset to latin + latin-ext, declared in
`assets/fonts/fonts.css`: **Archivo** (weight 100–900, width 62–125) and
**Spline Sans Mono** (weight 300–700). There are no remote requests anywhere on
the site — no CDN, no font service, no analytics.

## Accessibility

WCAG 2.1 AA. One `h1` per page with no skipped heading levels, a focus-managed
and `inert` contents drawer, `aria-live` register readouts, inline form
validation with `role="alert"`, and a `prefers-reduced-motion` path that pins the
highlighter drawn. All text/background pairs were measured by hand; the ratios
are recorded in `DESIGN.md` and `.impeccable/design.json`.

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

`impeccable detect` runs over all 40 pages and reports **285 findings, down from
1109**. Seven rule classes were eliminated outright. Every one of the 285
remaining findings is a documented, reasoned exception — see `DESIGN.md` §8 and
`.impeccable/design.json`.
