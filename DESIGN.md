# DESIGN.md — Strata Staff Global, "AGENDA"

The design system behind the `strata-modern` rebuild. Written for whoever changes
this next. It records what the site is made of, why the parts are the shape they
are, and which of the detector's warnings are deliberate.

- **Surface:** static site, 40 HTML pages, no build step required to view it.
- **Generator:** `build.mjs` writes every page and `styles-tabs.css`. Run
  `node build.mjs` from this directory after editing `styles.css`, `app.js`,
  `content/*.json`, or the page bodies in `build.mjs` itself.
- **Preview:** `node serve.mjs 4173` → <http://127.0.0.1:4173/>
- **Truth:** `PRODUCT.md` holds the product facts every claim on the site must
  trace to. If a number is not in `PRODUCT.md`, it does not go on a page.

---

## 1. The world: a bound AGM notice pack

The incumbent site's own subject matter is the agenda paper: the document a
strata manager assembles, prints, punches, circulates and files. The rebuild
takes that object literally. Every page is **a sheet on a desk**.

That single decision generates the whole interface:

| Notice-pack object | Interface decision |
| --- | --- |
| A4 sheet on an office desk | `.sheet` — white, 1px border, lifted off a `--desk` grey |
| The punch margin | `.punch` — a 78px gutter with two punched holes and a live folio rail |
| Clause numbering | `.item__no` in the gutter, `.clause__no` ("1.1") inside clauses |
| The double head-rule of a schedule | `--rule-head` (3px double, in the record's ink) |
| Index tabs cut into a sheet edge | `.tabs` — radio-driven, works with no JavaScript |
| A rubber stamp | `.stamp` — SVG-turbulence ink, rotated, four sizes |
| A highlighter sweep on the operative words | `.mark` / `.field-marker` — one per sheet |
| Accreditation seals | `.seal` — an epicycloid guilloché ring drawn once as an SVG symbol |
| The perforated proxy form at the back | `.perf` + `.foot` — the back cover |
| A slip of paper left on the desk | `.cookies` — the cookie notice as a torn slip |

The world is a **document**, so the layout grammar is a document's: a ruled
schedule of items, each with a number, a heading, a body and sometimes a margin
note. There are no cards. Lists are ruled rows (`.opt`), tables (`.sched`), or
numbered clauses (`.clauses`).

### The one motion

There is exactly one authored easing, `--ease: cubic-bezier(.16, 1, .3, 1)`
(exponential ease-out), and no bounce anywhere. Two things move:

1. the highlighter sweeping left to right over the operative phrase, once per
   sheet, and
2. the `.stamp--settle` pressing down at the resolution.

Everything else is a colour or a hairline changing state. `prefers-reduced-motion`
sets every duration to .001ms and pins the highlighter to its drawn state.

---

## 2. Colour

Colour is **committed, and the roles are reserved**. No colour is decorative and
no colour does two jobs.

| Token | Value | Role — and nothing else |
| --- | --- | --- |
| `--desk` | `#EDEBE6` | The desk the sheets sit on. Page background only. |
| `--sheet` | `#FFFFFF` | An office-white sheet. |
| `--sheet-2` | `#FAF9F6` | A second sheet / recessed print area (inputs, hover rows). |
| `--ink` | `#00102E` | Primary ink. The incumbent brand navy, kept as the ink. |
| `--ink-2` | `#2C3A56` | Secondary text. Tinted from the ink, never a grey. |
| `--ink-3` | `#5A6880` | Tertiary text and annotations. |
| `--rule` | `rgba(0,16,46,.18)` | Hairline rules inside schedules. |
| `--rule-mid` | `rgba(0,16,46,.38)` | Input borders, table header underline. |
| `--rule-ink` | `rgba(0,16,46,.82)` | The document's own rules: head-rules, closing rules. |
| `--strata` | `#094BC1` | Links, focus rings, the live control. |
| `--strata-ink` | `#063A96` | Pressed / deeper blue. |
| `--stamp` | `#C8341F` | **Rubber stamps and the single primary action.** Nothing else. |
| `--stamp-ink` | `#A32715` | The primary action's pressed state. |
| `--marker` | `#F2E14C` | **The highlighter.** One sweep per sheet, one field band per site. |
| `--plus` | `#00544E` | The Strata Staff Plus service line. |
| `--gold` | `#BE894A` | **Accreditation seals only.** |

Rules that follow from the table:

- Vermilion appears at most twice per screen: the stamp and the one primary
  button. If a screen needs a third vermilion thing, the hierarchy is wrong.
- The highlighter marks **one** phrase per sheet. On the cover that is
  `more lots`; at the resolution it is the closing line. It is never used to
  decorate a heading.
- Gold is never a link, a button, or a border. Only a seal.
- Navy is a text colour and one full-bleed band (`.resolution`) — not a button
  background except `.btn--ink`.

### Contrast

Every text/background pair clears WCAG 2.1 AA. Measured against white:
`--ink` 18.4:1, `--ink-2` 11.4:1, `--ink-3` 5.6:1, `--stamp` 5.3:1,
`--strata` 7.5:1. Ink on the marker field is 14.0:1. Body text on the navy
resolution band is 12.7:1.

---

## 3. Type

Two self-hosted variable faces, declared in `assets/fonts/fonts.css`, subset to
latin + latin-ext and preloaded by the browser normally (no JS font loading).

| Token | Stack | Use |
| --- | --- | --- |
| `--sans` | `Archivo` (wght 100–900, wdth 62–125) | Headings and body. Variable width is used as a *voice*: display type is set at 96–106% width. |
| `--mono` | `Spline Sans Mono` (wght 300–700) | Record type: references, folios, clause numbers, tables, labels. |

The scale is fluid and tokenised:

```
--h1     clamp(2.55rem, 1.1rem + 5.4vw, 5.4rem)
--h2     clamp(1.85rem, 1.05rem + 2.9vw, 3.15rem)
--h3     clamp(1.18rem, 1.02rem + .6vw, 1.45rem)
--lede   clamp(1.06rem, .98rem + .5vw, 1.34rem)
--body   1.0625rem
--measure 68ch
```

Discipline:

- Headings are set tight (`line-height` 1.06–1.2) at large sizes; body is 1.55.
- `--mono` is never a costume. It is used where the world would print in a
  fixed-width field — a register, a reference, a schedule — not to make a
  paragraph look technical.
- Body copy has a `--measure` of 68ch. Long prose in the privacy annexure and
  insight papers is constrained by it.
- Nothing that carries meaning is set below **11px**; functional text and
  annotations run 11.5–12.8px.

---

## 4. Structure and spacing

```
--gutter   78px      the punched margin
--pad-x    58px      the sheet's horizontal inset
--bar-h    64px      the document bar height
--ease     cubic-bezier(.16, 1, .3, 1)
--dur      .62s
```

The sheet is `display: block` so the bar can be sticky, wrapping a
`.body-grid` of `var(--gutter) minmax(0, 1fr)`. The punch gutter holds the
sticky folio rail; the body holds the items.

- `--lift` / `--lift-tab` are **neutral black**, offset, with a large negative
  spread. Never a zero-offset coloured halo. This is paper depth, not a glow.
- Responsive breakpoints at **1240px, 980px, 640px**. The punch gutter and the
  item numbers collapse below 980px; the register table drops its task and
  reference columns below 640px.
- Vertical rhythm inside an item lives on `.item__wrap` as plain values, stepped
  by media query (3.4rem → 4.6rem → 5.6rem), **not** `clamp()`. See §7.

### Z-index layers

Bar `10` · drawer `40` · cookie slip `30` · `.mark__ink` `2` · `.field-marker::after`
noise `0` (behind text at `z-index: 1`).

---

## 5. Components

| Component | Where | Note |
| --- | --- | --- |
| `.sheet`, `.bar`, `.body-grid`, `.punch` | every page | The document shell. |
| `.cover` | `index.html` | Two-column first viewport: motion, then `Schedule 1 — Particulars`. |
| `.item`, `.item__wrap`, `.item__no`, `.item__head`, `.item__body`, `.item__aside` | every page | The ruled schedule of sections. |
| `.clauses` / `.clause` | home, journey | Numbered clauses, never cards. |
| `.tabs` | home, course outline, team | Index tabs. Panels driven by `:checked`; visibility rules generated into `styles-tabs.css`. |
| `.sched` | everywhere | The table grammar. `thead th` carries `--rule-head`. |
| `.register`, `.scale`, `.reg-table` | home | The signature interaction: a range input that rebuilds the post register. |
| `.stamp` (`--lg`, `--sm`, `--quiet`, `--settle`) | home, about, contact, jobs, testimonials | Rubber stamps. |
| `.mark` / `.field-marker` | home | The highlighter. |
| `.seal`, `.plats`, `.platwall` | home, team, executives | Seal rings, logo schedule, photographic register. |
| `.stmt` | home, testimonials | Nine signed statements. |
| `.opts` / `.opt` | solutions, insights, careers, 404 | The list grammar: a ruled, selectable row. |
| `.form` / `.field` | academy, careers, contact | Front-end only, with inline validation. |
| `.foot`, `.perf`, `.cookies` | every page | The back cover, the perforation, the slip. |

### The one signature interaction

`#capacity` on the home page is a real `<input type="range">` (5–21) laid over a
printed ruler. Moving it rebuilds `#reg-rows` from an inline JSON pool, updates
four `[data-reg-*]` readouts, and sets `aria-valuetext`. The readout is
`aria-live="polite"`. Without JavaScript the register renders its first five
posts statically and the readout shows them — nothing is hidden.

It is labelled **illustrative** in the interface, because the post breakdown is a
model and the 200,000 tasks/month figure is the company's reported number.

---

## 6. Accessibility decisions

- Every page has one `<h1>`, then `<h2>` per item, then `<h3>`. Footer column
  titles are `<h3>`, not `<h4>`, so no level is skipped.
- The skip link targets `<main id="main">`.
- The contents drawer is `inert` while closed, traps focus to its first control
  on open, restores focus on close, and toggles `aria-expanded` on its opener.
- Radio groups in forms are `<fieldset>` + `<legend>`, not a `<label for>`
  pointing at nothing.
- Item numbers are decorative folios **and** meaningful, so they are exposed as
  `<span class="sr">Item </span>01` rather than hidden.
- Table headers use `scope="col"`; specific tables carry a `<caption>`.
- Forms validate on submit only, mark the offending field with
  `aria-invalid`, and write the message into an adjacent `.field__err` with
  `role="alert"`. Success goes to a `role="status"` panel that is focused.
- Decorative imagery is `alt=""`; the logo, platform marks and membership seals
  are described. Team portraits are deliberately unpaired with names, so they
  carry empty alts and a caption device (see §8).
- Print stylesheet removes the bar, drawer, punch gutter and cookie slip.

---

## 7. Detector findings: what was fixed

`impeccable detect` was run over all 40 pages after the build was complete. The
count went from **1109 → 285** findings, and six rule classes were eliminated
outright. Every fix below was a change to the design, not a suppression.

| Rule | Before | After | What was actually wrong |
| --- | --- | --- | --- |
| `low-contrast` | 554 | 0 | Appeared only in an intermediate implementation that drew the double rule as a background stripe; reverted to a real border, which removed both the class and the stripe. |
| `side-tab` | 386 | 0 | `border-top: 3px double` repeated on ten different selectors; now declared once as `--rule-head`. |
| `cramped-padding` | 209 | 0 | Four real defects: `.fact` had `padding-right: 0` against a `border-right`; `.sched` cells had 4.8px horizontal padding; `.trio`'s third column zeroed its right inset; and the mobile breakpoint zeroed it again. Plus `clamp()` in `padding` — see below. |
| `undersized-ui-text` | 75 | 0 | Small stamps were 10.08px; plate captions 9.92px. Both now ≥11.5px. |
| `tiny-text` | 20 | 0 | `.note`, `.tasks` and drawer labels were 11.8px; now ≥12.5px. |
| `dark-glow` | 40 | 0 | `--lift` was tinted navy; now neutral black. |
| `all-caps-body` | 201 | 115 | `.note` and `.reg-out__note` set full sentences in uppercase (up to 100 chars), and breadcrumbs uppercased whole page titles (up to 84 chars). Both now sentence case. |
| `tight-leading` | 1 | 0 | `.field-marker p` was 1.24; now 1.32. |

`clamp()` in `padding` was the largest single source of false findings. The pair
`padding: 3.4rem 0; padding: clamp(...) 0;` is correct CSS, but padding is now
authored as plain values stepped by media query. That is also more robust in
older engines. `clamp()` is still used for `font-size`, where it causes no
trouble.

**The final 285 findings are all deliberate.** 127 are advisory
(`numbered-section-labels`), 40 are advisory (`gpt-thin-border-wide-shadow`), 1
is advisory (`em-dash-overuse`); the only two remaining `warning`-grade rules are
`all-caps-body` on control labels and `marketing-buzzword` inside a client's
verbatim words. All five are reasoned in §8.

---

## 8. Deliberate exceptions

These are known detector warnings that were considered and **kept**. Each has a
reason; none is an oversight.

1. **`all-caps-body` (115) — button and control labels.** `.btn` sets
   "Schedule the free discovery call" (32 chars) in uppercase; the footer legal
   line, the masthead tagline's neighbours and the record labels follow the same
   convention. These are *controls and record labels*, not body text, and an
   uppercase, letter-spaced, stamped label is this world's own convention for an
   operative action. Body copy is never uppercase, and every instance of
   uppercase on a full sentence was removed (§7).

2. **`numbered-section-labels` (127) — the agenda numbers.** The `01`–`08`
   in the punch gutter are the notice pack's own item numbering, and the sequence
   **carries information**: the proxy form on `contact.html` refers to items by
   number, and the folio rail tracks position in the pack. This is the exception
   the craft floor allows — numbering that earns its place. Numbers were *removed*
   where the sequence carried nothing: the "Strata Staff difference" items on
   `about.html` and the four core values on `journey.html` no longer count
   themselves. Clause references tied to a role (`A.1.1`) were kept, because they
   are references.

3. **`marketing-buzzword` (2) — a client's own words.** The phrase "game-changer"
   appears inside the verbatim testimonial from Michael Haines. Testimonials are
   evidence, reproduced in full and attributed. Editing a client's language to
   satisfy a lint rule would make the evidence less true, not more.

4. **`gpt-thin-border-wide-shadow` (40) — the sheet's lift.** `.sheet` is a 1px
   bordered sheet with a soft drop shadow. It is paper on a desk. The shadow is
   offset with a large negative spread so it reads tight, and it is neutral
   black; this is the one place the rule's concern does not apply.

5. **`em-dash-overuse` (1, privacy annexure).** The privacy text is a
   restatement of the incumbent's policy and uses parenthetical dashes the way
   the source does. Rewriting punctuation in a legal annexure to satisfy a
   stylistic preference is not an improvement.

### Content exceptions, stated on the page

- **Team portraits are not paired with names.** The gallery holds 19 plates
  against 20 names and the filenames do not map reliably on their own.
  Mislabelling a colleague is worse than leaving the pair apart, so the page
  shows an unnamed photographic register plus a separate named register of
  officers, and says so in the copy. Executive and client portraits *are* paired,
  because those filenames are unambiguous.
- **`Strata Executive Assistant` has no page in the live sitemap**, though the
  navigation lists it. The role page is built only from real published phrases
  and its real five training modules, and does not invent scope.
- **All forms are front-end only** and say so: "Demo build — this form is not
  connected to an endpoint."
- **`platform-mri-2.webp` returned 404** from the incumbent host and is not
  shipped; MRI appears once.

---

## 9. Textures and generated artwork

Two SVG assets are authored in-repo, not downloaded:

- **`assets/marker.svg`** — the highlighter. `viewBox="0 0 1000 100"`,
  `preserveAspectRatio="none"`, two overlapping `#F2E14C` strokes (widths 66 and
  43, opacity .68) plus a lift-off tail. Drawn behind the words with
  `mix-blend-mode: multiply`, revealed by animating `clip-path`.
- **`#guilloche`** in the inline `<defs>` on every page — the seal ring, traced
  from an epicycloid (`R=35, r=9, d=20`, 240 points) and referenced by
  `<use>`, so the geometry is paid for once per page rather than once per seal.
- **`#ink-rough`** in the same `<defs>` — the stamp's ink. `feTurbulence` +
  `feDisplacementMap` (scale 1.9) roughens the edge, and a second turbulence
  composited `operator="in"` speckles the fill. The alpha floor is set at .5 so
  the stamped words stay legible rather than eroding away.
- **`--noise`** — a 140px fractal-noise tile used at low opacity on the marker
  field and the buttons.

The `#defs` container is visually hidden with the clip pattern, **not**
`display: none`, so the filters still resolve in every engine.

---

## 10. Asset provenance

All raster assets in `assets/` are the incumbent site's own files, downloaded
during the scan (`strata-scan/assets.mjs`) and pruned by `build.mjs` so that
nothing orphaned ships. `build.mjs` re-derives the shipped set from the rendered
HTML plus `url()` references in every stylesheet, then deletes the rest — run it
after removing any image reference, and the file leaves with it.

### The build guard

`build.mjs` renders every page into memory and refuses to write anything if any
page contains `undefined`, `NaN`, `[object Object]` or an escaped `<span`. An
unfilled template hole is a build failure, not a cosmetic bug: it fails loudly
with the offending page and a snippet, and exits non-zero.

This exists because it happened. All ten role pages once shipped
`<a href="undefined">undefined</a>` and `Item A.2 — undefined` in their
breadcrumbs, because the page function was handed the role *array* where it
expected a line descriptor. Every page still returned HTTP 200 and rendered, so
only a full-reference sweep caught it. `strata-scan/final-check.mjs` is that
sweep: it fetches all 40 pages, checks the shell markers on each, resolves every
local `href`/`src`, confirms no remote dependency, matches emitted tab ids
against generated visibility rules, and walks each page's `h1`–`h4` sequence.
