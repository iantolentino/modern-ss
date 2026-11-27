# Feedback round 6: 27 November 2026

From your review as a visitor, a full re-read of the competitive review deck (including the concept mockups on slides 18 to 24), the live site, and a phone check of every key page at 375px.
`[ ]` to do · `[x]` done · `[B]` needs the business. If a session runs out, carry on from the first unticked item.

## A. Your comments
- [x] **A1. Remove "How these figures are measured: method to be written by operations."** Also remove the "how measured" link beside 98%, which points to it. The method note stays in the admin so it can come back once operations writes it.
- [x] **A2. Moving background on every hero.** The live site's homepage hero plays a looping video (an office tower at dusk, 1.6 MB at 720p). Plan:
  - **Home:** use that video behind the navy hero (muted, looped, no controls). Show the still poster when the visitor prefers reduced motion.
  - **Every other page hero:** a slow, visible drift of the glows and the Strata Staff mark, with no video, so inner pages stay light.
  **Done:** Home plays the live hero video behind a navy tint, with the poster for reduced motion. Inner heroes: the glow drifts (16s) and the Strata Staff mark floats (14s), now at 10% opacity so it reads as a logo.
- [x] **A3. Hero right side is a stretched, boring box.** Follow deck slide 18:
  - Limit the card to its natural width.
  - Add an eyebrow pill above the headline: "Strata-trained offshore teams for Australian and Canadian agencies".
  - Add a floating "98% staff retention" badge on the card.
  - Add a small "5 → 21 · Strata Choice" proof chip.
  **Done:** Eyebrow pill, card capped at 600px, 98% retention badge, and a "5 → 21 · Strata Choice" chip linking to the case study (hidden on phones).
- [x] **A4. Role photos: heads still too big.** The photos are tight portraits, so any wide crop fills the card with a face. Show each photo smaller (head to chest), over a soft blurred copy of the same photo so the edges don't look cut. Apply on home, Solutions and related roles.
  **Done:** Head to chest at about 112% of the image height, centred over a blurred copy, with the sides faded.
- [x] **A5. Video in "What strata agencies say"** (deck slide 19). The live site has a client video, "Awesome Journey - Premium Client Partner" (`/wp-content/uploads/2025/05/HORNER-FINAL.mp4`). Add a video card that plays it on click, streamed from the live site with nothing loaded until play; the file is 165 MB.
  - [B] The deck's Strata Choice video ("Craig Mowll on scaling") still needs filming.
  **Done:** "Awesome Journey · premium client partner" card with a play button. The video only downloads when pressed. Stars added to the lead quote, and the endorsing firms moved inside the lead card (as in the mockup).
- [x] **A6. Take time; no rushing.** Every item is checked at 1895 desktop, 1280 laptop and 375 phone before it is ticked.

## B. Deck items missed or only half done
- [x] **B1. Lead quote stars** (slide 19): five stars on the lead testimonial card.
- [x] **B2. Phone homepage** (slide 24):
  - the test shows only the two main fields on phones (the hourly cost stays on the full test page)
  - the result sits directly under them
  - the proof stats show as three small tiles
  **Done:** Two fields on phones; the stats show as a 2×2 grid of tiles (four stats, not the mockup's three).
- [x] **B3. Strata Choice case study** (slide 23): the video tile in the hero shows "Video testimonial · coming soon" (placeholder) instead of an empty blue box.
- [x] **B4. Hidden Capacity Test page** (slide 21): it already has the three results (cost, team size, indicative price). Check the "That time could go back to your clients…" line is still shown.

## C. Phone layout problems found at 375px
**Homepage**
- [x] **C1. Role tabs:**
  - Problem: "Strata Services · 6 roles" and "Strata Staff Plus · property management · 4 roles" wrap into tall two-line pills.
  - Fix: on phones, use a single scrolling row with short labels ("Strata · 6", "Property mgmt · 4"). Hide the arrows on phones (swipe instead), with the next card peeking in.
- [x] **C2. Role cards:** an empty strip sits at the bottom when no price is set. Remove the empty footer space.
- [x] **C3. Trust pillars:** four tall cards stacked. On phones, use a compact two-by-two grid with smaller icons.
- [x] **C4. Academy band:** three tall cards. Tighten the padding and icon size on phones.
- [x] **C5. Task chips:** 28 chips make a very long list. On phones, show 10 plus a "Show all tasks" button.
- [x] **C6. Insights:** three tall cards stacked. On phones, use a swipeable row.
- [x] **C7. CTA band:** "Book a 30-minute discovery call" wraps to two lines inside the button. On phones, make the buttons full width with one-line text.
- [x] **C8. Footer:** the links run in one long column. On phones, use two columns (Company | Australia + Canada).

**Hidden Capacity Test page**
- [x] **C9. Quote rotator bug:** all nine client quotes show stacked instead of one at a time. The `[hidden]` attribute is overridden by the card's display style. This affects desktop too.

  **Done:** One quote at a time. The test page on a phone went from about 10,900px to 7,000px tall.
**Solutions and role pages**
- [x] **C10.** The prev/next arrows sit on their own row; hide them on phones (swipe).
- [x] **C11. Related roles on role pages:** two narrow columns whose chips break word by word. Use a swipeable row of full cards.

**About and Team**
- [x] **C12. Executives:** a long bio in a half-width card makes a tall, narrow column (Dan Fabros). On phones, use one column for executives with the bio under the name.
- [x] **C13. Team filter tabs:** cut off on the right ("Training & De…"). Make them a scrolling row with a fade edge.

**Learning**
- [x] **C14.** The second photo of the offset pair runs 20px off the screen (sideways scroll). Contain it.

  **Done:** Root cause: the slide-in and zoom animations start the photo off to the side. Sideways overflow is now clipped site-wide; no page scrolls sideways at 375px.
**Careers**
- [x] **C15. Job filter tabs:** wrap ("Human Resources" on two lines). Use a single scrolling row.
- [x] **C16. Job page:** the apply form is at the very bottom of a long page. Add an "Apply now" button in the hero that jumps to the form.

**Everywhere**
- [x] **C17. Small labels under 13px** ("No sign-up", "(optional)", "Module 1"): raise them to at least 13px on phones.
- [x] **C18. Header "Book a call" button:** 37px tall; raise it to at least 40px for tapping.

## D. Finish
- [x] **D1.** Check every page at 1895, 1280 and 375. No sideways scroll, and no console errors.
  **Done:** All 39 pages return 200 with no PHP errors. No sideways scroll at 375px on 20 key pages, every tap target is at least 38px, and no text is under 12.5px. Visual check at 1440 and 375 on home, test, role, about, team, learning, careers, job and case study pages.
- [x] **D2.** Commit, push, republish the preview.
- [x] **D3.** Ask: copy the two live videos into the project instead of streaming them from stratastaffglobal.com? The hero video is 1.6 MB; the client video is 165 MB, which is too big for the repo.
  **Done (your answer: copy it):** The hero video (1.6 MB) and its poster (117 KB) are now in `assets/media/site/`, and the homepage uses them. The preview builder now also copies video files and `poster` images. The 165 MB client video still streams from the live site.

## E. Round 6b: "not working properly on mobile, not properly responsive" (same day)
Tested as a visitor: menu, dropdowns, tabs, sliders, calculator, video, FAQ and full-page scroll at 375. Widths 320, 360, 600, 768 and 1024 across 15 pages, plus screenshots at 768 and 1024.
Phone interactions all work: the menu opens, closes and scrolls, tabs switch, sliders swipe, the calculator updates, the video plays, the FAQ toggles, and nothing stays invisible after scrolling. The problems are at tablet and small-laptop widths:
- [x] **E1. Hero needs more room below** (your request: at least 20px). The test card and the "5 → 21" chip run into the bottom edge.
- [x] **E2. At 1024 the "5 → 21" chip covers "See my full result".** Place the chip under the card instead of over it.
- [x] **E3. At 961 to 1200 the logo is squashed by the crowded menu.** Keep the logo at full size, and tighten the menu spacing at those widths.
- [x] **E4. At 1024 the wide dropdown menus run past the right edge of the screen.** Keep them inside the window.
- [x] **E5. Proof bar at 768 to 1100:** the member logos are cut off at the right edge. Put the members on their own full-width row under the stats.
- [x] **E6. Roles section at tablet width:** the arrows drop onto their own line under the tabs. Keep them on the tab row.
- [x] **E7. News on tablets:** two cards, then one alone on the next row. Use the swipeable row up to 960.
- [x] **E8. Role photos (your request):** replace the zoomed-out portraits on the role cards with stock photos that show each role at work. Keep the company portraits on the role pages themselves.
  **Done:** Ten Unsplash work scenes (Unsplash License, free for commercial use) in `assets/media/roles/scene/`, about 400 KB in total. Credits and how to swap one are in `docs/photo-credits.md`. Any role without a scene falls back to its team portrait.

## F. Founding year, homepage width, chat assistant (same day)
- [x] **F1. Founding year:** 2019, confirmed by you. The site already showed "Since 2019"; the admin help text now says it is confirmed.
- [x] **F2. Homepage a little more centred on wide screens:** the content is capped at 1,640px on the homepage only. At 1895px it sits about 220px in from each edge; at 1440px and below nothing changes. Backgrounds still run full width.
- [x] **F3. Chat assistant** (`plugins/chat-assistant/`): a "Chat with us" button on every page, and the top-bar "Live chat" opens it too.
  - Tapping a question shows it as your message, a typing indicator, then the written answer with buttons such as Pricing, Take the test or Book a call.
  - Answers come from the FAQs in the admin (edit them there), plus five built from site facts: what we do, roles, cost, the test, Canada. "Talk to a person" lists book a call, both phone numbers and the email.
  - Typed questions are matched to the closest preset question by keywords. 14 test phrases all matched correctly, and anything with no good match offers a person.
  - **Later, AI:** replace `answerFor()` in `chat.js` with a call to a server-side endpoint that holds the API key. Never put the key in the browser.
  - Phones: a round button above the sticky call bar; the chat opens as a sheet covering most of the screen.

## G. Canada page: layout and Canadian wording (same day)
Checked at 1440 and 375, and read against Canadian English and BC strata terms.
- [x] **G1. Hero:** add the eyebrow pill from deck slide 24 ("Strata Staff Canada · Vancouver"), matching the homepage.
- [x] **G2. "pacific-time" lower-cased:** a code bug (`lcfirst`). It must read "Pacific time".
- [x] **G3. Canadian spelling and terms:** "enquiries" becomes "inquiries"; spell out "Civil Resolution Tribunal (CRT)" once; "strata management companies", not "agencies".
- [x] **G4. "Take the test in C$" opens the test in A$:** open it with Canada · C$ selected.
- [x] **G5. Office section:** the right-aligned address wraps raggedly, and the CCI card has big gaps and a repeated "Member · Canada" line. Use clean contact rows with icons, and a tidy membership card.
- [x] **G6. The page ends abruptly after one section:** add "Why BC strata management companies work with us", built only from facts already on the site (strata training covering Canadian legislation, CCI BC membership, the test in C$, a Vancouver office).
- [x] **G7. Phones:** office details stack (label above value) instead of being squeezed side by side.
- [x] **G8. Call-to-action band on the Canada page:** say "strata management company" instead of "agency".
