# Feedback round: 27 November 2026

Your review of the competitive-review build (commit `f260ec4`), as a checklist.
`[ ]` to do · `[x]` done. If a session runs out, carry on from the first unticked item.

## Site-wide
- [x] **1. Remove the breadcrumb trail ("Home / …") from every page:** About, Clients, Team, Careers, Insights, Learning, Pricing, Trust Centre, Contact, Case studies, Solutions, Hidden Capacity Test and the role pages. Keep the breadcrumb structured data for Google; it is invisible.
  **Done:** Removed from every page; the breadcrumb data for Google stays.
- [x] **2. Remove every small label above a heading (`meta-line`):** Solutions ("Strata Services", "Strata Staff Plus"), role pages, course outline, job pages.
  **Done:** Removed everywhere, including the small location label on the Canada hero.
- [x] **3. Price placeholders:** "A$X,XXX*/month" adds no value. Show no price anywhere until a real price is entered in the admin (no `*`): hero facts, role cards, role pages, pricing page, Hidden Capacity Test.
  **Done:** Prices only appear once a real value without * is entered in the admin; otherwise nothing shows (pricing table says "On request").
- [x] **4. Nav hover:** neighbouring menu text overlaps when hovering. Fix on both the Australian and Canadian pages.
  **Done:** Cause: dropdown links were forced onto one line, and the About dropdown ran off the right edge. Dropdown text now wraps, and the About menu opens leftwards. The same menu is used on the AU and CA pages.

## Homepage
- [x] **5. Hero image:** the close-up portrait behind the test card looks scary and confusing. Replace it with a calmer, wider photo of the team at work. A real company photo is preferred; stock only if no real photo fits.
  **Done:** The hero now shows a real team-at-work photo (the-strata-staff-difference) across the top, with the test card below; that photo moved out of the lower section.
- [x] **6. Proof bar:** not laid out properly on desktop. Show the stats on one line. Show memberships 4 logos at a time, sliding automatically to the next like a phone home screen.
  **Done:** Stats on one line (platform label shortened to "Strata platforms"). Memberships show four at a time and slide one step every 3.2s; this pauses on hover and is off under reduced motion.
- [x] **7. Roles section:** adjust the colours (keep them uniform with the site) and show the details properly. The cards are too cramped at 5 per row.
  **Done:** Three per row with larger photos, blue-tinted chips and a soft card shadow.
- [x] **8. Testimonials section:** make it look pleasing.
  **Done:** A large lead quote, the Strata Choice "5 → 21" story card, a second quote, then the endorsing firms as a strip.

## Hidden Capacity Test page
- [x] **9.** Remove the breadcrumb and the "Two numbers · Result in seconds · No sign-up" line.
- [x] **10.** The whole calculator must be visible when the page opens (desktop).
  **Done:** Compact intro, two inputs side by side; fits a 1440×900 window.
- [x] **11.** Add a **Calculate** button.
  **Done:** The Calculate button reruns the sum and pulses the result.
- [x] **12.** Lay out the part under the calculator (book a call, email me my result, how we work it out) properly; it looks broken. Make sure the honeypot "Website" field never shows.
  **Done:** Three equal panels: talk it through, email me my result, how we work it out. The honeypot is hidden by CSS.
- [x] **13.** Keep the quote section, but rotate it through the other client quotes.
  **Done:** All client quotes rotate, one every 7s (paused on hover).

## Other pages
- [x] **14. Solutions:** show each role group as a slider with prev/next buttons so visitors can browse the list.
  **Done:** Previous/next buttons on each role group; 4 cards in view on desktop.
- [x] **15. Case study:** incomplete. Fill it with what we actually know (from Craig Mowll's quote) and drop the empty placeholder blocks.
  **Done:** Challenge and what-we-built written from Craig Mowll's testimonial; the empty metric boxes and placeholder notes are removed. Admin values still override.
- [x] **16. Contact:** rebuild the booking section as our own form with the same fields and details as the Microsoft Bookings page; do not embed Microsoft.
  **Done:** Our own form with the Bookings page fields: 30-min call, date (weekdays), slots 12:00 to 3:30 PM Philippine time, name, email, phone, special requests. The slot is shown in the visitor's time zone. Saved under Enquiries, emailed to solutions, and the visitor gets a confirmation that the time will be confirmed by email.
- [x] **17. Insights:** show 4 posts, with a "Show all" button for the rest.
  **Done:** 4 shown (featured plus three); "Show all 8 articles" reveals the rest.
- [x] **18. About:** the timeline image is broken (stuck half-revealed). Replace it with the updated image from stratastaffglobal.com/enjoying-the-journey/.
  **Done:** Updated image downloaded from the live site. Root cause: scroll animations used once:true, which stopped them part-way when a visitor reached the bottom of the page. Switched to play-once triggers site-wide, and the timeline no longer animates.

## Finish
- [x] **19.** Check every page at desktop and mobile, commit, push and republish the preview.
  **Done:** All 39 pages are error-free and every internal link resolves. No sideways scroll at 375px on 9 key pages.

## Round 3 (same day)
- [x] **20. Proof bar still not showing properly:** it rendered, but with tiny logos and cramped stats. Now two rows: four large stats across, then "Proud members of" with four logo tiles at a time that slide along (two at a time on phones).
- [x] **21. Homepage roles:** four role cards in view, the rest reached with prev/next arrows (or swipe). Switching between Strata Services and Strata Staff Plus starts from the first card.
- [x] **22. Hidden Capacity Test page was confusing:** rebuilt as three numbered plain-English questions with hints, and a "Your result" card beside them that explains the answer in a sentence and holds the book-a-call button, the email option and "How we work this out".
- [x] **23. Mobile:** checked at 375px; no sideways scroll on the homepage or the test page.
