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

The one place that grammar does not apply is the home page, and deliberately so.
A pack of numbered motions is the right shape for a page you have arrived at to
read one item; it is the wrong shape for the page a stranger lands on, where the
order has to come from the business and not from meeting procedure. The home page
keeps the paper — the sheet, the punch, the hairline rules, the stamp, the
highlighter — and drops the numbering and the procedure. See §11. Every other
page is the pack.

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

**The brand is two colours and nothing else.** `assets/logo-full.png` was decoded
pixel by pixel — a PNG parser, `inflateSync`, the per-scanline filters undone —
and it contains exactly two colours and no others:

| | share of the logo |
| --- | --- |
| `#094BC1` blue | **54.1%** |
| `#00544E` teal | **45.7%** |

Everything below is one of those two, or a value the incumbent site actually
ships in its own stylesheet. There is no third accent colour in the build.

| Token | Value | Source | Role — and nothing else |
| --- | --- | --- | --- |
| `--desk` | `#E4E8ED` | the site's grey family, one step deeper | The desk the sheets sit on. Page background only. |
| `--sheet` | `#FFFFFF` | — | An office-white sheet. |
| `--sheet-2` | `#F4F5F7` | the site's light ground | Recessed print area: inputs, hover rows. |
| `--ink` | `#00102E` | the site | Primary ink. |
| `--ink-2` | `#233452` | the site | Secondary text. |
| `--ink-3` | `#666F7A` | the site's `#69727D`, one step down | Tertiary text and annotations. |
| `--grey` | `#D5D8DC` | the site | The photographic register's grid rules. |
| `--rule` / `--rule-mid` / `--rule-ink` | navy at .18 / .38 / .82 | — | Hairlines, input borders, the document's own rules. |
| `--blue` | `#094BC1` | **the logo, 54%** | Links, focus rings, the live control, the stamps, the single primary action. |
| `--blue-ink` | `#063A96` | — | Pressed blue. |
| `--teal` | `#00544E` | **the logo, 46%** | The second voice: the secondary action, record and clause numbers, the Plus line, the accreditation seals. |
| `--teal-soft` | `#324B4A` | the site's own accent | Form labels and fact keys. |
| `--teal-ink` | `#003B36` | — | Pressed teal. |
| `--marker` | `#B7DAD3` | brand teal, lifted into a wash | **The highlighter.** One sweep per sheet. |

Rules that follow from the table:

- **Blue is the official voice; teal is the record voice.** Blue marks what is
  live and actionable — links, focus, the primary button, the stamps, the agenda
  folio numbers. Teal marks what is recorded and secondary — clause numbers,
  schedule numbers, the secondary action, the seals, the highlighter.
- The highlighter marks **one** phrase per sheet. On the cover that is
  `more lots`; at the resolution it is the closing line. It is never used to
  decorate a heading.
- Navy is a text colour and one full-bleed band (`.resolution`) — not a button
  background except `.btn--ink`.

### What was removed, and why

An earlier revision of this build ran on a **vermilion `#C8341F`** for stamps and
the primary action, a **yellow `#F2E14C`** highlighter and a **gold `#BE894A`**
for the seals. All three were inventions: none appears in the logo, and none
appears in the incumbent's stylesheet. They were replaced with the brand's own
blue and teal, and the highlighter SVG in `assets/marker.svg` was recoloured to
match. The only survivor of that palette is the *idea* of a reserved highlighter
band — now in teal, at `#B7DAD3`, where ink still reads at 12.6:1.

### Contrast

Every text/background pair clears WCAG 2.1 AA, measured from the tokens in
`styles.css` rather than asserted:

| Pair | Ratio |
| --- | --- |
| `--ink` on white | 18.86:1 |
| `--ink-2` on white | 12.47:1 |
| `--ink-3` on white | 5.10:1 |
| `--ink-3` on `--sheet-2` | 4.67:1 |
| `--blue` on white | 7.53:1 |
| `--teal` on white | 8.83:1 |
| `--teal-soft` on white | 9.37:1 |
| white on `--blue` | 7.53:1 |
| white on `--teal` | 8.83:1 |
| ink on `--marker` | 12.56:1 |
| ink-2 on `--marker` | 8.30:1 |

The lowest ratio anywhere in the palette is **5.10:1**, against an AA floor of
4.5:1. `--ink-3` is one step darker than the site's own `#69727D` specifically
because `#69727D` measures 4.47:1 on `--sheet-2` — just under the floor — and
`--ink-3` is used on hovered rows, which sit on `--sheet-2`.

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

## 4. Structure, and filling the screen

```
--gutter   78px                             the punched margin
--pad-x    clamp(20px, 3.2vw, 96px)         the sheet's right-hand inset
--col-gap  clamp(13px, 2.1vw, 30px)         the twelve-column grids' gap
--bar-h    64px                             the document bar height
--ease     cubic-bezier(.16, 1, .3, 1)
--dur      .62s
```

The sheet is `display: block` so the bar can be sticky, wrapping a
`.body-grid` of `var(--gutter) minmax(0, 1fr)`. The punch gutter holds the
sticky folio rail; the body holds the items.

### The sheet spans the desk

An earlier revision capped `.sheet` at `min(1440px, 100% - 34px)` and capped
every content block inside it at `1240px`. On a 1920px monitor that showed the
1440px sheet centred in a 1920px window — **240px of dead desk on each side**,
and twice that on a 2560px screen. The client's report was that "the site does
not cover the whole desktop; it had big left and right margins".

The sheet is now `calc(100% - 26px)` — a 13px reveal either side, enough for the
paper edge and its shadow to read, and nothing more. Every `max-width: 1240px`
inside it was deleted, so **rules, bands, schedules and the footer run the full
width** while prose keeps its 68ch `--measure`. That is how a document actually
behaves: the rule spans the page, the paragraph has a measure.

Measured fill of the viewport width: **96.5% at 1024px, 97.5% at 1440px, 98.7%
at 768px, 98.1% at 1920px, 98.6% at 2560px.**

`--lift` / `--lift-tab` remain **neutral black**, offset, with a large negative
spread. Never a zero-offset coloured halo — this is paper depth, not a glow.

### Fitting: three real overflow bugs

Vertical rhythm inside an item lives on `.item__wrap` as plain values, stepped
by media query (3.4rem → 4.6rem → 5.6rem), **not** `clamp()`. See §7.

Horizontal fit was measured rather than eyeballed, with
`tools/measure-fit.html`. Three genuine bugs came out of it, none of which was
visible at desktop width:

1. **The bar never hid its CTA.** `.bar__cta` is `flex: none` and no media query
   removed it, so at 390px the bar's contents came to 671px and **all 40 pages
   needed 281px of sideways scrolling.** It is now hidden below 980px; the same
   action is the first thing in the drawer and sits in the body of every page.
2. **The grids' gaps were wider than the phone.** The twelve-column grids have
   eleven gaps; at a fixed `30px` that is **330px of gap alone**, against a
   content box of about 260px at 320px. One `--col-gap` token now scales with
   the viewport.
3. **An email address set the floor for the whole footer.** `mailto:` links are
   the longest unbreakable strings on the site and, sitting in a grid, one of
   them stretched every column beside it. Addresses and URLs now use
   `overflow-wrap: anywhere`, which — unlike `break-word` — also shrinks the
   min-content size, so no ancestor can be stretched in the first place.
4. **Wide schedules** are laid out to a fixed width below 640px so their cells
   wrap and grow taller instead of pushing the sheet sideways.

The bar's own parts are also explicitly allowed to shrink (`min-width: 0`) and
the folio line ellipses rather than shoving the menu button off the edge.

**Result: zero horizontal overflow at 320, 390, 768, 1024, 1099, 1180, 1280,
1440, 1920 and 2560px** — where previously every one of the 40 pages overflowed
at 390px and below, and one page overflowed at 1024px.

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
| `layout-transition` | 2 | 0 | `.opt` animated `padding-left` and `.tabs__list label` animated `padding`; both reflowed on hover. See below. |
| `undersized-ui-text` (mobile) | 12 | 0 | A `.66rem` schedule header, introduced with the mobile table fix. Now `.7rem`. |

`clamp()` in `padding` was the largest single source of false findings. The pair
`padding: 3.4rem 0; padding: clamp(...) 0;` is correct CSS, but padding is now
authored as plain values stepped by media query. That is also more robust in
older engines. `clamp()` is still used for `font-size`, where it causes no
trouble. It is *also* used for `--pad-x` and `--col-gap`, and those are applied
to `padding` — but because the `clamp()` is resolved through a custom property
rather than written inline, the parser does not trip on it. That was verified
rather than assumed: a single-page run after the layout change reported
`cramped-padding` 0.

### Re-run after the palette and layout change

The detector was run again over all 40 pages once the palette was replaced and
the layout was de-capped. Total: **285 findings**, with an unchanged composition
— 127 `numbered-section-labels`, 115 `all-caps-body`, 40
`gpt-thin-border-wide-shadow`, 2 `marketing-buzzword`, 1 `em-dash-overuse`.

Two classes were introduced by this round's work and then removed before the
re-run, which is why the total did not move:

| Rule | Fix |
| --- | --- |
| `undersized-ui-text` (12) | The mobile rule for schedule headers set `.66rem` = 10.56px, below the 11px floor. It is now `.7rem` = 11.2px; the header still steps down on a phone, via letter-spacing rather than size. |
| `layout-transition` (2) | `.opt` transitioned `padding-left` and `.tabs__list label` transitioned `padding`, so hovering a ruled row or a tab reflowed it every frame. The option row's affordance is now the background band plus the arrow slide, both of which composite; the selected tab still rises to meet its panel, but snaps rather than animating. |

Also removed in this pass: the last non-token colour in the stylesheet
(`#041B44`, the ink button's hover). It is now `--ink-lift`, so **the palette is
closed** — every colour in `styles.css` is either a declared token or a comment.

**The final 285 findings are all deliberate.** 127 are advisory
(`numbered-section-labels`), 40 are advisory (`gpt-thin-border-wide-shadow`), 1
is advisory (`em-dash-overuse`); the only two remaining `warning`-grade rules are
`all-caps-body` on control labels and `marketing-buzzword` inside a client's
verbatim words. All five are reasoned in §8.

### The colour exceptions are now gone

Replacing the invented vermilion, yellow and gold with the brand's own blue and
teal **removed three exceptions** that this document previously had to defend.
There is no longer any colour on the site — accent, ground, rule or wash — that
is not either read off the logo or taken from the incumbent's own stylesheet, so
there is nothing left to excuse on that front. §8's list is shorter as a result,
and the honest measure is that the palette no longer needs a footnote.

### Re-run after the home page re-layout

The home page was then re-laid out to follow the incumbent's own section order
with plain headings (§11), and the detector was run again over all 40 pages.
Total once more: **285 findings** — 121 `numbered-section-labels`, 117
`all-caps-body`, 40 `gpt-thin-border-wide-shadow`, 4 `cramped-padding`, 2
`marketing-buzzword`, 1 `em-dash-overuse`.

The home page's seven invented "Motion"/"Schedule" labels are gone, which is why
`numbered-section-labels` fell by six. It stays high because the other 39 pages
keep their item numbers deliberately, for the reason in §8.

`all-caps-body` rose by two: the new figures band labels its three numbers in
mono uppercase, which is the pack's record-label treatment, not body copy.

#### Four `cramped-padding` findings that were measured and are not real

All four are on `index.html`, and all four are artefacts of the detector's CSS
cascade handling. This was verified against the rendered box model rather than
argued from the stylesheet:

| Reported | What actually renders |
| --- | --- |
| `.band__cell` — "flush against border-left on left (no inset)" | At ≥641px each cell after the first carries `padding-left: 32px` inside a 1px hairline. |
| `.band__cell` — "flush against border-top/left" (×2) | At ≤640px the hairline turns horizontal and the inset is `padding-top: 19.2px`. |
| `.resolution` — "flush against bg on top/bottom (no inset)" | `padding-top` and `padding-bottom` both compute to `81.92px` at 1280px wide, the roomiest inset on the page. |

The detector applies narrow-width media-query rules regardless of viewport, and
does not consistently resolve a later override, so it sees a border with no inset
where the browser sees 19–82px. Three separate attempts were made to rule out a
genuine defect: the band was rewritten with its own cell classes instead of
reusing `.fact`, the cells' borders were removed entirely, and the `clamp()` in
the band's and the navy band's padding was moved into root custom properties.
None changed the finding, which is the evidence that the parser, not the CSS, is
the limit. The measured values above are the rendered ones.

---

## 8. Deliberate exceptions

These are known detector warnings that were considered and **kept**. Each has a
reason; none is an oversight.

1. **`all-caps-body` (117) — button and control labels.** `.btn` sets
   "Schedule the free discovery call" (32 chars) in uppercase; the figures band's
   labels, the footer legal line, the masthead tagline's neighbours and the record
   labels follow the same convention. These are *controls and record labels*, not
   body text, and an uppercase, letter-spaced, stamped label is this world's own
   convention for an operative action. Body copy is never uppercase, and every
   instance of uppercase on a full sentence was removed (§7).

2. **`numbered-section-labels` (121) — the agenda numbers.** The `01`–`08`
   in the punch gutter are the notice pack's own item numbering, and the sequence
   **carries information**: the proxy form on `contact.html` refers to items by
   number, and the folio rail tracks position in the pack. This is the exception
   the craft floor allows — numbering that earns its place. Numbers were *removed*
   where the sequence carried nothing: the home page's sections are now named
   rather than numbered (§11), the "Strata Staff difference" items on
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
  `preserveAspectRatio="none"`, two overlapping `#B7DAD3` strokes (widths 66 and
  43, opacity .72) plus a lift-off tail (`opacity .55`). Drawn behind the words
  with `mix-blend-mode: multiply`, revealed by animating `clip-path`. The wash is
  brand teal (`#00544E`) lifted towards the page — the same two-colour rule that
  governs the rest of the palette. An earlier revision used a `#F2E14C` yellow
  that appeared nowhere in the brand.
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
during the scan (`strata-scan/assets.mjs`). `build.mjs` re-derives the shipped
set from the rendered HTML plus `url()` references in every stylesheet, and
reports anything unreferenced.

That walk used to `unlink` the leftovers, and it was changed to report-only
because the delete was destructive in a way that only showed up later. Removing
the platform wall from the home page left the twelve platform logos referenced by
no page, so the build deleted all twelve from disk; the section was then rebuilt
on `solutions.html`, where it belonged, and the files were gone. They were
recovered from version control, and the pruner now prints
"present but unreferenced" and leaves the files alone. Removal is a decision for a
human or a commit, where it is visible and reversible.

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

---

## 11. The home page was re-laid out to the incumbent's own order

The first home page dressed the whole site in invented AGM vocabulary: "Motion 01
— Your capacity plan", "Schedule 1 — Particulars", "Schedule 6 — Papers
circulated", and clauses numbered 1.1 to 1.4. None of it appears on the live site.
It was a coherent world and it read as an agenda, but a first-time visitor met a
page about meeting procedure instead of a page about the company, and the
feedback was that it was overwhelming.

The order on the home page is now the incumbent's own, top to bottom, with its
own words:

1. **Hero** — h1 "Build your Strata Staff Global offshore team"; lede, "Take the
   capacity test" then "Talk to us"; the trust line and the numbers.
2. **Meet the team behind your team** — the four roles the live site leads with,
   in its order, plus a link to all ten.
3. **The three headline figures** — 500+ placements, 98% retention, 10+
   industries, as a band that lets the desk show through.
4. **The Strata Staff Difference** — the incumbent's own lede, then the three
   points.
5. **Tailored & Strategic Offshore Capacity Solutions For The Strata Industry** —
   the incumbent's own heading, one paragraph, a link.
6. **How It Works** — the incumbent's four steps.
7. **Strata Technology Capabilities** — the task ledger, and a pointer to the
   platform wall on `solutions.html`.
8. **Our Clients Have Spoken** — three statements, then all nine.
9. **Schedule Free Discovery Call** — the closing call, named as the live site
   names it on every page.

Everything else moved to the page that owns it: the ten roles and the platform
wall to `solutions.html`, all nine statements to `testimonials.html`, the
capacity model to `contact.html#capacity` (it was already there), the papers to
`insights.html` (which already listed all eight), and the four membership seals
to `about.html`. Two of those were duplicates before this round — the home page
rendered the same eight posts and the same capacity register that its link
targets already carried.

### What the re-layout measured

| | Before | After |
| --- | --- | --- |
| Home page, 1440×900 | 11.3 screens | **7.0 screens** |
| Home page, 1920×1080 | — | **5.4 screens** |
| Visible words on the home page | 1,783 | **986** (−45%) |
| Numbered section labels on the home page | 8 | **0** |

The page is an overview, so it is measured as one: 7.0 screens at 1440 is the
hero, eight short sections and a 0.7-screen footer. It does not reach four screens
without dropping sections the incumbent's own site carries, so the honest figure
is 7.0 rather than a claim of 4.

### Three defects the re-layout exposed

**The navy closing band had never rendered.** `.resolution` and its whole style
block existed, `app.js` was listening for `.stamp--settle`, and the home page
emitted an empty `<section>` in its place. The design's one signature interaction
— the carried stamp settling as the band arrives — had nothing to act on. The
closing call is now that band, so the styles, the script and the markup finally
agree.

**The folio rail keyed off the wrong thing.** It counted `[data-item]`, the
printed item number. On a page with no numbers it found nothing and left the
static "01 / 01" placeholder on screen. It now counts `section.item` and reports
the index, so it works whether or not the sections are numbered.

**`optionsList` emitted an empty reference column.** A row without a number still
rendered `<span class="opt__no">`, so four children went into a three-column
plain grid, the arrow wrapped to an implicit second row, and every role row was
220–270px tall instead of 72px. The span is now omitted when no row has a number.

### Where the numbers went

The home page's aside table is now captioned "At a glance" rather than "Schedule 1
— Particulars", and `about.html`'s "Schedule — The company" became "At a glance"
with it. The `journey.html` clause markers (`2015–16`, `2019`, `2020`, `Today`)
were kept: those are dates, and they carry information. The "Education schedule —
E.1/E.2/E.3" references on the three learning pages were kept for the same reason
as the clause references in §8 — they are page references, not procedure.
