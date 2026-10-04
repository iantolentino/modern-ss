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

### The navy band's text, which the token sweep cannot see

The closing band paints its secondary text as white at reduced opacity over
`--ink`, so the colour that actually renders is a **composite**, not a token, and
the sweep above is blind to it. The band rendered for the first time during the
home page re-layout, so these pairs were added to `contrast.mjs` and composited
explicitly:

| Pair | Composited to | Ratio |
| --- | --- | --- |
| `.resolution h2` — white at 100% | `#FFFFFF` | 18.86:1 |
| `.resolution .prose` — white at 82% | `#D1D4D9` | 12.69:1 |
| `.resolution__ref .note/.ref` — white at 62% | `#9EA4B0` | 7.54:1 |
| `.resolution .btn2` — `--marker` | `#B7DAD3` | 12.56:1 |

The lowest pair in the band is **7.54:1**. Several of these use `rgba()`, and a
token-only audit would have reported the band as unmeasured rather than as
passing, which is the more dangerous of the two failures.

Two components added in the same round were checked and clear comfortably:
`.band__k` (`--teal-soft` on `--sheet-2`) at 8.59:1, and `.stmt--compact`'s
quotes, which sit on the sheet and use `--ink`.

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

### What the automated audit covers

Everything above was written by hand and could all have been true of the source
while something else was true of the built pages, so `tools/a11y-check.mjs` walks
the 40 rendered pages and tests the failures that are invisible to a visual
review:

| Check | Result across 40 pages |
| --- | --- |
| duplicate `id` attributes within a page | **0** (280 ids scanned) |
| internal `href="#…"` pointing at a missing id | **0** |
| `aria-describedby` / `aria-labelledby` / `aria-controls` target missing | **0** |
| form control with no accessible name (`label[for]`, wrapping `label`, or `aria-label`) | **0** |
| `<label for>` pointing at a missing or non-control element | **0** |
| `<img>` with no `alt` attribute at all (`alt=""` is allowed and deliberate) | **0** |
| every page serving with the full shell | **40 / 40** |

This is the check that matters most for the form work, because the validation
messages are wired by *generated* ids (`field-err-0`, `field-err-1`, …) appended to
`aria-describedby` at runtime. A collision there would be silent: the page would
render, the form would work, and a screen reader would read the wrong message.

The first run reported four unnamed controls on `careers.html`. Those turned out
to be radios wrapped in their own `<label>` inside a `<fieldset>` — implicit
association, which is correct — so the **check** was fixed, not the page. It was
then pointed at a deliberately broken copy of that page and correctly flagged the
control, which is what shows the passing result is not vacuous.

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
Total: **242 findings** — 121 `numbered-section-labels`, 74 `all-caps-body`, 40
`gpt-thin-border-wide-shadow`, 4 `cramped-padding`, 2 `marketing-buzzword`, 1
`em-dash-overuse`.

The home page's seven invented "Motion"/"Schedule" labels are gone, which is why
`numbered-section-labels` fell by six. It stays high because the other 39 pages
keep their item numbers deliberately, for the reason in §8.

#### `all-caps-body`: 117 → 74, because the previous exception was not true

§8 previously excused this rule as "button and control labels". Auditing the
findings instead of trusting that sentence showed it was wrong. Dumping every
uppercase text node on the home page gave the real distribution, and the longest
strings were not labels at all:

| Text | Chars | Where |
| --- | --- | --- |
| `See all ten roles and both service lines` | 40 | `.btn2` link |
| `See the platforms and the ten roles` | 35 | `.btn2` link |
| `solutions@stratastaffglobal.com` | 31 | `.btn2` link |
| `Read all nine statements` | 24 | `.btn2` link |

`.btn2` was uppercased, so the site's ordinary "go and read this" link was set as
a shouted control label, and — worse — the solutions **email address** rendered as
`SOLUTIONS@STRATASTAFFGLOBAL.COM`. That is both hard to read and wrong for an
address a reader may copy.

`.btn2` is now sentence case and the primary `.btn` stays uppercase. The hierarchy
gained from this rather than losing: primary and secondary actions are now
distinguished by case as well as by fill, instead of only by fill.

The remaining 74 are genuine labels — the tallest uppercase string on the site is
now the 32-character primary CTA `Schedule the free discovery call`, followed by
form field labels (≤21), footer column headings (≤17), stamps, address labels and
the skip link. Every one is a control, a field name or a record label; no
sentence is uppercased anywhere. That is now a claim that was measured, not
assumed.

`all-caps-body` also rose by two in this round: the new figures band labels its
three numbers in mono uppercase, which is the pack's record-label treatment.

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

**Re-run after the imagery work.** The engine changed from `0.1.6` to `4.1.0`
partway through this rebuild, and the newer engine adds a `tiny-text` rule and
reports `cramped-padding` more widely. Its first pass over the photographic pages
read 262. One of those findings was real and mattered: `.plate-fig__role` was
setting people's job titles in 10.5px uppercase mono. Fixing it returned the total
to **242** on the same rule mix listed above, with `tiny-text` at zero. The two
242s are therefore not the same measurement — the composition matches, the engine
does not. See §12.

---

## 8. Deliberate exceptions

These are known detector warnings that were considered and **kept**. Each has a
reason; none is an oversight.

1. **`all-caps-body` (74) — control labels, field names and record labels.** The
   tallest uppercase string on the site is the primary CTA "Schedule the free
   discovery call" (32 characters); the rest are form field labels (≤21), footer
   column headings (≤17), stamps, address labels and the skip link. These are
   *controls and record labels*, not body text, and an uppercase, letter-spaced,
   stamped label is this world's own convention for an operative action.

   This exception was previously overstated and is now narrowed by measurement.
   It used to excuse `.btn2` as well, and `.btn2` was carrying 40-character
   sentences and the solutions email address in uppercase. Both were fixed (§7);
   `.btn2` is sentence case, and uppercase is left to the primary action. The
   test applied is now: **no sentence is uppercased anywhere on the site.**

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

- **Team portraits are paired with names** — this entry previously said the
  opposite, and the earlier caution was misplaced. The pairing is published by the
  incumbent beside each photograph on its own team page, so it is established
  rather than inferred, and it is generated into `content/team.json`. See §12.
  **One name of twenty remains unpaired**: Maristella Gaton appears on the
  incumbent's gallery beside another officer's photograph, verified in the raw
  markup, so she is left out rather than shown under a face that is not hers. The
  page states this. Executive and client portraits are paired for the same reason
  as the rest — the pairing is published.
- **The eight role photographs carry no personal name**, because the incumbent
  publishes none against them. They are captioned by role and no identity is
  invented for them. See §12.
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
during the initial scan by a one-off workbench script that is not part of this
repo. `build.mjs` re-derives the shipped set from the rendered HTML plus `url()`
references in every stylesheet, and reports anything unreferenced.

That walk used to `unlink` the leftovers, and it was changed to report-only
because the delete was destructive in a way that only showed up later. Removing
the platform wall from the home page left the twelve platform logos referenced by
no page, so the build deleted all twelve from disk; the section was then rebuilt
on `solutions.html`, where it belonged, and the files were gone. They were
recovered from version control, and the pruner now prints
"present but unreferenced" and leaves the files alone. Removal is a decision for a
human or a commit, where it is visible and reversible.

### Every file, rather than every set

The paragraph above was the whole of the provenance record for most of this build,
and it is a claim about a *set*: it cannot be checked against a file, so it cannot
fail when one file is not what it says. `assets/PROVENANCE.json` now carries one row
per shipped asset — the URL it came from, or its authorship, and for the derived
families the record the mapping came from. `strata-scan/provenance.mjs` generates it
and exits non-zero on an unresolved row. Current result: **93 assets, 92 with a
source URL, 1 authored, 0 unresolved.**

The mapping is derived from records the asset passes already wrote, not retyped:
`assets.mjs` (shipped name → upload path, for brand, membership marks, platform
logos, executive originals and client portraits), `raw-team/roster.json` (the raw
stem, published name and role of the nineteen officers), `optimise.py`'s `ROLE_ART`
and `EXECS` (which `Model-N` became which role), `fetch-post-images.mjs`'s
`FEATURED` (each post's own `og:image`), and `content/post-images.json` (the short
shipped stem → full post slug). The team portraits use the incumbent's own
name-adjacency: the caption that follows each portrait in its gallery is the pairing
it publishes, and that is where `people/anna-marie-david.webp` ←
`2024/05/Anna-full-163x300.jpg` comes from.

**The mapping had to be stated, not inferred, and the first attempt proved it.** It
slug-matched shipped basenames against every URL in the scan and reported **all 93
assets as sourceless**, because the shipped names were chosen for this site rather
than copied from the source: `Model-1.webp` shipped as `portrait/accountant-400.webp`,
`Flag_of_Australia_converted.svg` as `flag-au.svg`, `Paul-Cvetko-Lueger-150x150.jpg`
as `client-paul-cvetko.jpg`. Deriving the name was never going to work; the passes
had already written down what they did, and the record had to read that.

Three bugs in the generator are worth keeping, because all three were silent.
Slugging the shipped *path* rather than its basename (`people/anna-marie-david` never
matches an index keyed `anna-marie-david`). Hand-counting a character offset into
`'ROLE_ART = {'` — eleven instead of twelve, producing `return {{` rather than a
wrong answer. And treating `optimise.py`'s `ROLE_ART` as JavaScript when it is a
Python dict carrying `#` comments. The offsets are computed and the dicts are read
with a regex now.

### The build guard

`build.mjs` renders every page into memory and refuses to write anything if any
page contains `undefined`, `NaN`, `[object Object]` or an escaped `<span`. An
unfilled template hole is a build failure, not a cosmetic bug: it fails loudly
with the offending page and a snippet, and exits non-zero.

This exists because it happened. All ten role pages once shipped
`<a href="undefined">undefined</a>` and `Item A.2 — undefined` in their
breadcrumbs, because the page function was handed the role *array* where it
expected a line descriptor. Every page still returned HTTP 200 and rendered, so
only a full-reference sweep caught it. `tools/final-check.mjs` is that
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

## 12. The imagery system

### The defect this section exists to record

§11 re-laid the home page out to the incumbent's own section order and measured
it honestly at 7.0 screens. It was still wrong, and the owner said so: *"you need
to use the images on the site, so visitors can see the staffs and real persons,
not just [text] … as of now it is too much text."*

He was describing a real hole in the rebuild, not a matter of taste. **The
original scan never downloaded the photography.** It captured 65 pages of markup
and 58 text files, and the image audit found the logo, the flags, the platform
logos and a handful of 163px thumbnails — but not the eight `Model-*.webp` role
portraits the incumbent leads with, not the two 1000×1000 section images, and not
the team portraits at any usable size. A page cannot show faces it does not have.
The rebuild was text-heavy because its asset set was, and no amount of copy
editing would have fixed that.

### What was fetched, and what was thrown away

Everything the incumbent publishes, at the largest size it publishes:

| Set | Source | Result |
| --- | --- | --- |
| 19 team portraits | the incumbent's own team grid, re-fetched at 480w | `assets/people/*.webp`, 3:4, 224KB total |
| 8 role photographs | `Model-*.webp`, 908×1671 | `assets/portrait/*-{400,800}.webp`, 4:5, 404KB |
| 4 executive portraits | `exec-*.jpg`, 908×1671, up to 1.4MB each | `assets/exec/*-{400,800}.webp`, 4:5, 469KB |
| 12 platform logos | already held | `assets/platform-*.{png,jpg}` |
| 8 named `alt` strings | the incumbent's own markup | `content/team.json` |

**`assets/` went from 8.4MB to 1.6MB** across 78 files. The weight came out of
three places: the executives were re-encoded to WebP at two widths (6.79MB →
1.10MB, −84%); the 19 team portraits were replaced at 480×640 (−70% each on
average); and 33 files that no shipped page referenced were removed from the
folder entirely — the 19 superseded 163px thumbnails, the fourteen
`Model-*.webp`/`exec-*.jpg` originals, and the two section panels.

Those fourteen originals were **moved to `strata-scan/raw-portrait/`, not
deleted.** They are inputs to `optimise.py`, so deleting them would have made the
asset pass unreproducible. Moving them is verified safe: re-running the optimiser
from the new folder reproduces the shipped files **byte for byte**, with zero
`MISSING` entries.

### Framing is decided at build time, not in CSS

The measured face position in these photographs sits anywhere from **27% to 66%
down the frame** (skin-tone centroid, `faces.py`; a subject was located in 31 of
31 images, median 56%). A single `object-position` cannot serve that spread:
setting it for the median decapitates every low-framed subject, and setting it
for the extremes crops out everyone else.

So each image is cropped to its target aspect ratio **around its own measured
face** before it ships (`optimise.py`), and the stylesheet carries no
`object-position` at all. `object-fit: cover` remains only as a safety net for
the responsive widths, not as the framing mechanism. This is why
`aspect-ratio` can be changed per component — 3:4 for the contact strip, 4:5 for
role cards and the register — without any risk of cutting a head off.

### Named people and unnamed role photographs are different sets

The incumbent's own team page publishes each portrait beside its owner's name and
title, so **the pairing is established, not guessed.** `content/team.json` is
generated by the asset pass rather than typed by hand, so the pairing cannot
drift from the images that were actually downloaded. Nineteen portraits carry a
published name; `assets/people/` and the register on `team.html` use them.

The `Model-*.webp` role photographs are a **separate set and carry no published
personal name.** They are role illustrations. Their captions therefore read as
roles ("Strata Administrative Specialist"), and no identity is invented for them
— inventing a name for a stock photograph of a real employee would be the single
most damaging thing this rebuild could do. On the role pages the caption is
omitted entirely, because the page title already names the role.

Eight of the ten role pages can carry one of these photographs. `insurance-specialist`
and `pm-customer-care` have no matching photograph on the live site, so they keep
the stamp rather than borrowing a face that belongs to a different role.

**Nineteen portraits stand against twenty names.** The twentieth, Maristella
Gaton (Accountant Lead Trainer), appears on the incumbent's own gallery **with
another officer's photograph.** This was verified in the raw markup. She is
deliberately absent rather than shown under a face that is not hers, and the
`team.html` register says so in a note. An earlier revision of this rebuild
handled this by showing all nineteen portraits *without any names*; that was
over-cautious, because the pairing was published all along and only one entry was
unusable.

### Two images were downloaded and deliberately not used

`The-Strata-Staff-Difference.webp` and
`Tailored-Strategic-Offshore-Capacity-Solutions-For-The-Strata-Industry.webp` are
768×768 composed panels. Measured, both are low-edge-energy with a large dark
band through the middle — the signature of a designed panel carrying its own
type, not a photograph. Placing unverifiable, text-bearing artwork beside
headings that say the same thing would either duplicate the words or contradict
them.

The sections that would have carried them use **real named people** instead: the
training manager stands beside the training claim, the accounting manager beside
the capacity claim. The images are kept in `strata-scan/raw-portrait/` with the
other unused sources.

### The caption was the worst-set text on the page

The detector re-run after this work caught something the design had got backwards.
`.plate-fig__role` — the line that tells a visitor *who this person is* — was set
in **10.5px uppercase mono**, the least readable treatment available, on the most
important line of the component. The `tiny-text` and `all-caps-body` rules both
fired.

This was fixed on its merits, not to quiet the detector: the role line is now
sentence-case mono at **12.5px** in `--ink-2`, and the register overrides that
made it smaller were deleted. The face caption (`11.84px`), the strip caption and
the platform captions were raised at the same time. **Findings went 262 → 242**,
and `tiny-text` went to zero.

### Phone behaviour: the register becomes a list

Nineteen plates in two columns is ten rows of scrolling — 4.71 screens of the
smallest viewport spent on one section. Below 640px the register stops being a
grid and becomes a list: a 60px thumbnail, the name, the role, one line each.
That is **3.58 screens instead of 4.71**, and it reads better, because a 60px
thumbnail beside a name is legible where a 90px plate with a wrapped caption is
not. No person is hidden at any width.

### Where the numbers went

| Measure | Before §12 | After |
| --- | --- | --- |
| Home page, 1440px | 7.0 screens | **10.5 screens** |
| Home page, 390px | 12.7 screens | 17.0 screens |
| Home page, 320px | 17.4 screens | 21.3 screens |
| Images on the home page | 6 | **52** |
| `assets/` on disk | 8.4MB | **1.6MB** |
| Worst caption size | 10.5px uppercase | 12.5px sentence case |
| Detector findings | 262 | 242 |

**The page got longer and that is the honest outcome.** It is 3.5 screens taller
at 1440px because it now shows 52 images, 19 of them named portraits and 4 of them
role cards. The complaint being answered was *"too much text"*, not *"too long"*,
and the response was to replace prose with photography rather than to delete
sections the incumbent's own site carries. Text density fell; scroll length rose.
Both numbers are stated here so the trade is visible rather than implied.

Horizontal overflow remains zero at 320, 390, 768, 1024, 1099, 1180, 1280, 1440,
1920 and 2560px.

## 13. The imagery system, second pass: the rest of the site

§12 put the company's own photography on the home and team pages. It left **28 of
the 40 pages carrying no photograph at all**, including `solutions.html` — the page
whose heading is "Meet our offshore specialists" and which had 23 images, every one
of them a platform mark or the logo.

The cause was the same one §12 records. The original scan captured markup and copy
but never pulled the images those pages display. The difference in this pass is
that eight of those images are *per-post featured images* the incumbent publishes
as its own `og:image`, so they could be fetched by name rather than guessed at from
the `<img>` tags in the article bodies — the two newsletter posts carry 8–14 page
scans, which are the article's content, not its hero.

### The rule used to decide where a photograph goes

A photograph was added to a page only where the page's own subject is the thing
pictured. That produced a smaller change than blanket coverage would have, and it
is the reason five pages still have none:

| Page | The photograph, and why it belongs there |
| --- | --- |
| `solutions.html` | The eight role photographs, as one strip, because the page is a list of roles |
| `strata-services.html`, `strata-staff-plus.html` | Each role's own photograph beside its name in the table — the face sits against the role it belongs to |
| `about.html` | The four office bearers, as the answer to "who is behind this" |
| `journey.html` | The same four, captioned as *the people this timeline names* — the timeline already names them |
| `foundation-training-program.html`, `learning.html` | The training manager and the two lead trainers |
| `course-outline.html` | Each role's photograph in its own tab, so switching tabs changes the face with the syllabus |
| `careers.html` | The office photograph the company published when it refurbished Angeles City, captioned as where these roles are based |
| the four job pages | The two colleagues that vacancy sits with |
| `contact.html` | The business development and client success managers, who are the "solutions team" the page already names |
| `insights.html`, the eight posts | Each post's own featured image |

Nothing was invented to make a page look busier. The lede on
`foundation-training-program.html` says the lead trainers cover *two* disciplines
rather than claiming one per discipline, because the accounting lead trainer is one
of the twenty names the incumbent publishes without a usable photograph; the page
says what is true instead of a rounder version of it.

### Two bugs in the optimiser, both of which would have shipped a lie

**The width in the filename was the width requested, not the width produced.** The
600px source was written as `-1200.webp`, so the `srcset` advertised a 1200w
candidate that did not exist: a large viewport would have selected it and upscaled
a 600px file. Widths are now data. `optimise-post.py` writes
`content/post-images.json` recording the real pixel width of every variant and the
build generates `srcset` from that.

**Sources between 640 and 1200 got only a 640 variant**, so those heroes would also
have upscaled. The script now emits the source width in that range, and caps at
1200 rather than shipping the 1536 and 2048 originals — about 250KB of pixels no
layout asks for.

`tools/post-check.mjs` verifies the rendered `srcset` against **the files on disk**,
reading each WebP's real header width, rather than against the manifest. A
manifest-only check would pass the mislabelled-name bug the tool exists to catch.

### Four of the eight post images are not photographs

Measured with the same tells §12 used for the section panels — distinct colours,
mean edge energy — they run from a 2:1 office photograph at 37.3 edge energy to a
1:1 announcement panel at 2.7, which is what a flat designed panel carrying its own
type looks like. So they are **not cropped to a common box**: each keeps its own
aspect and is fitted `contain` on the `--sheet-2` ground, which reads as a plate
mounted on a sheet. Cropping a square panel to a landscape box would cut the type
out of it.

`alt=""` on every one. They carry nothing the surrounding text does not, and nobody
here has looked at them, so a description would have been invented. An empty alt
states the image is decorative; a fabricated one is a claim about a picture nobody
has seen. The named portraits are the exception and carry their name and role —
composed from `team.json`, not typed.

### A defect found while placing the office bearers

`ctaBlock` had a hardcoded `data-item="09"` on all fifteen pages that use it, and
`.item__no` is not hidden — it renders as blue mono text in the gutter. So
`about.html` printed **"01 02 03 04 09"**, telling the reader four sections were
missing. Every page with fewer than nine items printed the same false jump:
`solutions` printed 01 02 03 09, `team` and `journey` printed 01 02 09.

Both the attribute and the printed number are now derived from document order after
the page is generated, and the build asserts both sequences on every page:

```
data-item sequence is 01 02 04      -> flaw
printed item numbers are 01 02 04   -> flaw
```

That check is what would have caught the hardcoded 09, and it is the class of
defect that survives review because each page looks locally consistent.

### Coverage is now something the build can be asked about

`tools/imagery-audit.mjs` reports which pages carry photography and which do not,
and exits non-zero if a page carries none without being declared. Imagery work
regresses silently — a page rebuilt from a template loses its plates and nothing
fails.

Writing it found a bug in itself worth recording: the first version tested for
`assets/client/` and so reported `testimonials.html` as carrying **no** photography,
when it carries nine client faces, because those files are flat at the top of
`assets/` as `client-*.jpg`. A coverage tool that misreports coverage is worse than
none. The nine client portraits were then checked properly: all 150×150, 72KB in
total, served at exactly their natural size, needing no optimisation pass.

### Where the numbers went

| Measure | After §12 | After §13 |
| --- | --- | --- |
| Pages carrying photography | 12 of 40 | **35 of 40** |
| `assets/` on disk | 1.6MB | **2.3MB** (93 files) |
| Median page, 1440px | 4.0 screens | 4.3 screens |
| Home page, 1440px | 10.5 screens | unchanged |
| Detector findings | 242 | 251 |
| — of which `numbered-section-labels` | 121 | 130 |

The detector total rose by nine and the rise is entirely that one rule, which fires
on the *existence* of numbered section labels. Here the numbering is the design's
organising device — the pages read as agenda items and the numbers carry real
sequence — so it is the one rule knowingly not complied with, and the count moving
with genuine added content is the expected consequence rather than a regression.

The five pages still without photography are declared, with reasons, in
`tools/imagery-audit.mjs`: `privacy.html` (a legal document), `404.html` (a dead
end), `academy.html` (enrolment particulars and a form; the role tracks are on
`course-outline.html`), and `role-insurance-specialist.html` /
`role-pm-customer-care.html`, for which the incumbent publishes no photograph —
those keep the stamp rather than borrowing another role's face.

## 14. Faces: the portraits were framing on a centroid, not on a head

Asked to make sure the faces are shown properly. Answering that honestly meant
building a detector first, because the check I had was not measuring faces.

### The check was wrong, and it said so twice

The first version found a "face" with the YCbCr skin-tone test carried over from
`faces.py`. On these photographs it returned a box spanning the **entire frame** at
11–34% coverage, because that test also fires on warm walls, timber and beige office
background. Built on it, the check reported **79 clipped faces**, none of which were
clipped, and it reported them with confident per-file detail.

It was replaced with OpenCV Haar cascades, frontal and profile, pooled over nine
parameter sets and filtered by shape. One setting alone missed real faces — 11 of the
19 officers — and loosening without the shape filter invents them, which is how an
earlier run put "the face" of one officer in the top 12% of her portrait on the
strength of a light fitting. A face in these frames is a substantial part of the
picture, so a detection under a tenth of the height is not one.

Two more bugs in the tooling, both caught by reading the output instead of trusting
it:

- The crop records are keyed by basename and the face boxes by path, so the join
  matched **36 of 535** images — only the files sitting at the top of `assets/`. It
  then announced, on that evidence, that no face was clipped.
- Density was computed from `naturalWidth`. With a `srcset` of `w` descriptors and a
  `sizes` attribute, Chrome reports `naturalWidth` already divided by the effective
  density, so dividing by the CSS box width applies the correction twice and invents
  softness. It called `accountant-400` — a 400×500 file in a 320×400 box — an upscale
  at "0.73×". Eleven of the reported thirteen were this artefact. The real figure is
  read from the file's own dimensions.

A measurement tool that flatters the thing it measures is worse than no tool. Both
of these reported success.

### What the detector found

**Seven of the nineteen officers, and four more portraits, were shipping with the top
of the head cut off** — and the layout then removed another 3.1% in the 4:5 boxes.
`neil-dane-puno` had 0.000 headroom where his source had 0.135.

The cause was `frame()` in `strata-scan/optimise.py`:

```python
top = round((fy * H) - FACE_BIAS * ch)
```

`fy` is the **skin-tone centroid**, and it is dragged downward by the neck, the hands,
and any warm background. For a subject in a light top it sat well below the face, the
crop followed it down, and the head went off the top. Recording where a face *is* is
not the same as knowing where a head *ends*.

### The rule the material implies

Rather than keep tuning the detector, every raw source was measured for where its
head actually sits:

| | Headroom in the raw, as a fraction of height |
| --- | --- |
| Minimum | **0.024** (`exec-trevor`) |
| Median | **0.097** |
| Maximum | 0.148 |

All 31 sources keep the head inside the top 15%. The margin a brow needs above the
detected box is larger than that, so the constraint is always active and **the window
is top-anchored for this material**. That is the right answer rather than a
workaround: these are portraits cropped from taller pictures, so the head is at the
top and everything worth keeping is below it.

Two sources — Mary Ann Pineda and Trevor — have the head at the very top of the
download, where **no crop can create headroom**. They now sit at their source's floor
instead of below it. `mary-ann-pineda` went from 0.008 to 0.064.

Two selection bugs surfaced on the way, both the same mistake in different clothes:

- **Largest detection wins** picked a torso over the face on `team-accountant`, whose
  raw yields a face box at y 0.072–0.384 and a bigger torso at y 0.382–0.762.
- **Largest in the upper half** still admitted a torso centred at 0.502 on
  `carlo-andreu-tayag`, which is why his head shipped cut at 0.005 while his source
  had room to spare.

The rule is now **the highest plausible detection**, which is what a single-subject
portrait implies: the head is the topmost face-like blob.

### The circles

`.stmt__sig img` carried `border-radius: 50%`, showing nine real clients through a
round mask. A round crop is the avatar idiom, and an avatar is what you show when you
have no photograph. We have the photographs; the corners come off a face for no reason
but convention. The rule now reads:

```css
.stmt__sig img {
  width: 68px; height: 68px; object-fit: cover;
  border: 1px solid var(--rule); filter: saturate(.9);
}
```

The only two circles left in the stylesheet are `.hole` (a punched hole) and
`.perf::before/after` (perforation dots). Those are paper, not people.

### The numbers

| Measure | Before | After |
| --- | --- | --- |
| Portraits under 5% headroom (of 43) | 11 | **1** |
| Portraits under 3.5% headroom | 7 | **1** |
| Faces clipped by a box, 1440px and 390px | 79 *reported* | **0** |
| Client faces behind a circular mask | 9 | **0** |
| Face centre position, median | 38% (intended) | 35% (measured) |

The one remaining tight portrait is Trevor, at 2.4%, which is his source's limit.

### How to check this without trusting the detector

`tools/face-verify.mjs` joins the browser's measured crop rectangles against the
detected face boxes, and exits non-zero on a clipped or masked face. It reports the
*tight* cases rather than hiding them, because a margin is not a failure.

But it is a heuristic, so `tools/contact-sheet.py` renders every crop — using the real
visible rectangles the browser reported, not a second guess at the CSS — and marks the
detected face, for a person to look at. **Read the contact sheet, not the exit code.**
If the blue outline is not on a face, the measurement is wrong rather than the crop,
and that is exactly the failure this pair of tools is built to expose.

Two sub-1× densities remain and both are source-limited: `marisol-office` is a 1024px
original in a 1248px box and `connect-q1-q2-2024` a 600px original in a 758px box, with
nothing larger published to serve. Recorded rather than hidden.



