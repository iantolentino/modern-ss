# Competitive review: to-do list

Source: *Website Competitive Review & Redesign Blueprint* (leadership review, 25 November 2026, 30 slides).
Target: this modern site (`htdocs/strata-modern`). The live WordPress site is not changed by this list.

**Status:** `[ ]` to do · `[x]` done · `[~]` built with a placeholder · `[B]` needs the business (can't be built from the website alone).

**Where facts come from:** **LIVE** = stratastaffglobal.com · **DECK** = the review deck · **PH** = placeholder marked with `*` for you to confirm before anyone sees the site.

## What the deck says, in short

- **Score:** we score **5.2/10**, tied with GOSS (founded 2024, no clients named) and well behind **Cloudstaff on 8.1**, which already sells strata with strata clients on its site. Jatro BPO scores 3.9.
- **Where the gap is:** the 2.95-point gap to Cloudstaff is about **56% website** (message, pricing tool, conversion, design, speed) and **44% proof the business must produce** (case studies, reviews, content, ISO 27001). A better site alone closes only about half of it.
- **The plan:** eight moves to reach a projected **8.3 by day 90**:
  1. a growth-led hero
  2. a trust section
  3. a proof engine
  4. upgraded role pages
  5. a dollar result in the calculator
  6. one clear booking path
  7. an insights hub and a real Canada page
  8. speed and clean-up
- **Our strengths are buried:** two SCA presidents quote us, plus 500+ placed, 98% retention, the 5-to-21 story, the Academy and the CCI BC membership. All of these sit below a generic hero today.

## Notes on applying the deck

1. **Most of the technical fixes are already done on this modern site:**
   - `en_AU` locale
   - the task counter falls back to its real value for search engines
   - clean role URLs
   - no Tailwind development CDN
   - structured data
   - alt text

   The remaining technical fixes apply to the live WordPress site.
2. **Styling:** the mockups use small uppercase labels above headings. The impeccable skill bans these, and we removed them earlier at your request. The layouts and content follow the mockups; the labels stay out.
3. **Hero photos:** the mockup hero has no photos. You asked to keep the company's real photos, so the hero keeps a staff photo beside the Hidden Capacity Test.
4. **Prices, claims, certifications and client metrics are never invented.** Each one goes in as a `*` placeholder that you confirm or remove.

---

## 1. Quick fixes (slides 11, 12, 13)

- [x] **1.1 Platforms:** remove Bing and stop claiming "13+". Show the real count of platforms staff are trained on. (DECK s11, s13)
  **Done:** Bing removed; the strip, stat and FAQ now say 12 platforms, counted from the logo list.
- [x] **1.2 Menu labels:** "Our awesome team" → "Our team", "Enjoying the journey" → "Our journey". (DECK s12)
- [x] **1.3 One word:** use "premium" or "premier" everywhere, not both. Using "premium" for now. (DECK s12; to confirm)
  **Done:** Site copy already uses "premium" only; no change needed.
- [x] **1.4 One action name:** "Book a 30-minute discovery call" on every main button. The header button is shortened to "Book a call". (DECK s16, s26)
  **Done:** Header "Book a call"; hero, closing band, role and test pages "Book a 30-minute discovery call".
- [x] **1.5 Testimonials lead with the agency:** Munro Property and Strata Management SA, not the person's SCA role. The quote text is unchanged. **Confirm titles with both people.** (DECK s10, s12, s19)
  **Done:** Bylines now read "Munro Property, President, SCA Australasia". **[B] confirm titles with both people.**
- [x] **1.6 Testimonial typos:** "consistently are consistently" and similar. Fix obvious duplicated words only. The Strata Bee quote has no person named. (DECK s12)
  **Done:** The modern copy was already clean. Strata Bee still has no person named: **[B]**.
- [~] **1.7 Stats:** add a short "how we measure this" note for 500+ placements and 98% retention. (DECK s26) **PH** for the wording of the method.
  **Done:** "how measured" link under the proof bar, text from the admin (Offer, trust & proof).
- [B] **1.8 Founding year:** the site says 2019 (LIVE), the deck says "since 2017 (confirm)". Keep 2019 and flag it. **[B] confirm.**
  **Done:** Shown as "Since 2019*" and editable in the admin (Year founded).
- [B] **1.9 Executive bios:** 3 of 4 are blank. **[B] supply bios** (fields exist in the admin).
- [B] **1.10 Australian address:** only a PO Box. **[B] street address**, or keep the PO Box.
- [x] **1.11 Job form:** experience options capped at 2 years on the live site. Check the modern form offers a full range.
  **Done:** The modern job form has no capped experience field; nothing to fix.
- [x] **1.12 Australian spelling** across the site copy.
  **Done:** Checked: content already uses Australian spelling.
- [~] **1.13 Strata Staff Plus:** explained in one line wherever it appears. The DECK wording needs confirming. (s12, s19)

## 2. Hero (move 1, slides 16, 18)

- [x] **2.1 Headline:** "Grow your portfolio without growing your payroll" (DECK, the team's chosen slogan).
- [x] **2.2 Supporting line:** "Your managers are spending hours each week on work that doesn't need their experience. Find out how many, and what it costs, with the Hidden Capacity Test." (DECK)
- [x] **2.3 Hidden Capacity Test card** beside the headline:
  **Done:** Live on the homepage; result in hours, working weeks and dollars.
  - managers, routine hours per day, and an optional hourly cost
  - the result in hours, working weeks and dollars
  - "See my full result"
- [x] **2.4 Two actions:** "Take the Hidden Capacity Test" and "Book a 30-minute discovery call".
- [~] **2.5 Facts line:** "Result in seconds" · "Teams in Pampanga, PH" · "From A$X,XXX/month*" (**PH** price).
- [x] **2.6 Proof bar:**
  **Done:** Since-year is a placeholder until confirmed.
  - 500+ placements
  - 98% retention, with a "how measured" link
  - since 2019*
  - the trained-platform count
  - memberships: SCA NSW, SCA SA, SCA WA, REINSW, CCI BC
- [x] **2.7** Keep a real staff photo in the hero (your request).

## 3. Hidden Capacity Test page (moves 1 and 5, slides 17, 21)

- [x] **3.1 Formula:** managers × routine hours per **day** × 5 days × 48 weeks. Default 6 × 2 = 2,880 hours (72 working weeks). (DECK s17)
- [x] **3.2 Currency:** Australia A$ / Canada C$ toggle. Optional hourly cost gives the dollar figure (A$60 example → A$172,800).
- [x] **3.3 Team size:** hours ÷ 1,920 hours a year ≈ specialists needed (2,880 → ~1.5).
- [~] **3.4 Indicative cost:** "From A$XX,XXX a year*", all-inclusive (recruitment, Academy training, equipment, HR and payroll). **PH**
- [x] **3.5 Result copy:** "That time could go back to your clients and towards taking on more buildings." (DECK)
- [x] **3.6 "How we work this out":** the assumptions note. (DECK)
- [x] **3.7 Actions:** "Book a 30-minute discovery call" and "Email me my result". The email is saved as an enquiry in the admin and sent to the visitor.
  **Done:** Tested: the enquiry is saved in the admin. Email sends from the live server (XAMPP has no mail server).
- [x] **3.8 Wording:** "Hidden Capacity Test" in the main navigation, not under About. The old `/capacity-calculator` link keeps working.
  **Done:** Now at `/hidden-capacity-test`; `/capacity-calculator` redirects there.

## 4. Trust and training (move 2, slide 20)

- [~] **4.1 Trust section, "Your owners' data, protected":** four pillars: data and privacy, access controls, accountability, continuity. Each pillar shows the question it answers. **[B] Operations must write the answers**; until then each says "Details to be confirmed*".
  **Done:** Built; each pillar shows "Details to be confirmed*" until operations writes the answer in the admin.
- [~] **4.2 Trust facts:** "Teams in Angeles City, PH" (LIVE) and "ISO 27001 roadmap*" (**PH**, shown as a roadmap item only).
- [~] **4.3 Trust Centre page** (`/trust`) holding the four pillars in full. **PH** content.
  **Done:** Built at `/trust`.
- [x] **4.4 Academy band, "Trained in strata before they join your team":**
  - Foundation Training Program
  - a course outline for every role
  - platform tracks
  - a link to the course outlines (LIVE content we already have)
- [x] **4.5 Academy in the main navigation.**
  **Done:** "Academy" in the main navigation (links to the Learning page).

## 5. Proof (move 3, slides 10, 19, 23)

- [x] **5.1 Featured quote** led by the agency, plus "Also endorsed by leaders at" (the six firms already quoted: Strata Choice, ESM Strata, Toowoomba Strata, Vital Strata, Stanton & Taylor, Professionals Strata Team).
- [~] **5.2 Client story card:** "From 5 to 21 team members", Craig Mowll, Strata Choice, linking to the case study. Video is **PH**.
  **Done:** Links to the case study; the video link goes in the admin when recorded.
- [~] **5.3 Case study page** (`/case-studies/strata-choice`):
  **Done:** Built at `/case-studies/strata-choice`.
  - 5 → 21 since 2023 and 4.2× growth (from the LIVE quote)
  - at-a-glance facts
  - challenge, what we built and results sections: **PH, [B] needs client data and written approval**
  - hours returned and faster response metrics: **PH**, shown as "to capture"
- [x] **5.4 Case studies index** (`/case-studies`).
  **Done:** Built at `/case-studies`.
- [B] **5.5** **[B]** Ask three clients for data and video, Strata Choice first. (DECK s27)
- [B] **5.6** **[B]** 25+ Google reviews (month 4–12).

## 6. Roles (move 4, slides 19, 22)

- [~] **6.1 Homepage, "Build your team by role":**
  **Done:** Built; chips editable per role in the admin.
  - tabs: Strata Services (6) and Strata Staff Plus (4)
  - one-line Strata Staff Plus explanation
  - each card: task chips, "From A$X,XXX/mo*" (**PH**) and View role
- [~] **6.2 Role page hero:** a role-specific line, plus facts:
  - platforms (LIVE)
  - hours, "AEST/AEDT or Pacific*" (**PH**)
  - levels, "Junior · Mid · Senior*" (**PH**)
- [~] **6.3 Role page price card:**
  - "From A$X,XXX/month*"
  - what's included: recruitment and strata screening, Academy training, secure workstation and equipment, HR, payroll and benefits, replacement guarantee*
  - "Shortlist in 10 business days*" (**PH**)
- [x] **6.4 "How they're trained":** the Academy curriculum for the role, from the LIVE course outlines. Hours are **PH**.
  **Done:** Uses the existing course outline per role. Module hours are not shown until supplied.
- [~] **6.5 "Sample shortlist":** anonymised illustrative candidates, labelled as illustrations. **PH**
  **Done:** Shown only in preview mode; hidden with the other placeholders.
- [x] **6.6 Actions:** "Request a shortlist" and "Take the Hidden Capacity Test".
- [x] **6.7 Strata Accountant:** lead with trust accounting, levy runs and Section 184 certificates, our answer to TOA Global. (DECK s9, s22)
  **Done:** Lead line set on the Strata Accountant page; editable per role.

## 7. Pricing, path and Canada (moves 5, 6, 7, slides 18, 24)

- [~] **7.1 Pricing page** (`/pricing`): a from-price per role, all **PH**, plus what's included and the test. **[B] decide whether to publish from-prices** (deck decision 1).
  **Done:** Built at `/pricing`. **[B] decide on publishing prices.**
- [~] **7.2 Top bar:**
  **Done:** Built. Live chat and client login show as placeholders until their links are added in the admin.
  - AU / CA switch
  - phone for the current country
  - email
  - live chat* (**PH**, no provider yet)
  - client login* (**PH**)
- [x] **7.3 Navigation:** Roles ▾ · Hidden Capacity Test · Pricing · Case studies · Academy · Insights · About.
  **Done:** Careers, Our team, Trust Centre and Canada sit under About.
- [x] **7.4 Embedded booking:** the LIVE Microsoft Bookings page (`outlook.office365.com/book/ScheduleFreeDiscoveryCall@prtna.com/`) on the contact page.
  **Done:** Embedded on `/contact#book`. Microsoft only allows it inside https pages, so it shows on GitHub Pages and the live domain, not on local http.
- [x] **7.5 Mobile:** a sticky "Take the test" / "Book a call" bar. On a phone, the two-field test appears near the top of the page.
- [~] **7.6 Canada page** (`/canada`):
  **Done:** Built at `/canada` (en-CA locale).
  - BC work under the Strata Property Act: Form B information certificates, Form F certificates of payment, depreciation-report admin, CRT dispute packs, strata fee arrears, council minutes and bylaw registers (DECK s24)
  - Vancouver office (LIVE), CCI BC member (LIVE)
  - Pacific-time hours, CAD pricing and Canadian client stories: **PH**
- [B] **7.7** **[B] Insights hub:** monthly strata guides and a monthly strata brief (content work).

## 8. Speed and health (move 8)

- [x] **8.1** Homepage under 2 MB. Check page weight after the changes.
  **Done:** Measured 25 Nov build: about 0.9 MB and 44 requests (live site: about 10 MB, 162 requests).
- [x] **8.2** No broken links, every image with alt text, structured data still valid.
  **Done:** All 39 pages render without errors and every internal link resolves.

## 9. Decisions for leadership (slide 27), not website tasks

- [B] Publish a from-price for each role.
- [B] Ask three clients for data and video (Strata Choice first).
- [B] Fund ISO 27001 (6–12 months).
- [B] Test the persona with five clients.
- [B] Track monthly: enquiries, test completions, booked calls, organic visits, page weight.

## Placeholders to confirm before showing anyone

All of these are in the admin under **Logo & settings → Offer, trust & proof** (role prices under **Roles**). Each shows on the site with an amber `*`.

**Showing them or hiding them:**
- To preview everything, leave **Unconfirmed items** on "Show".
- To show the site to anyone, switch it to **"Hide until confirmed"**. This was tested: every placeholder disappears and prices fall back to "On request".

| Placeholder | Where it shows | Default |
|---|---|---|
| Year founded | Proof bar, "since" badge | 2019* (live site), deck says confirm 2017 |
| How the stats are measured | Under the proof bar | Method to be written by operations* |
| From-price per role, per month (AU and CA) | Hero facts, role cards, role pages, pricing | A$X,XXX* · C$X,XXX* |
| Indicative team cost per year (AU and CA) | Hidden Capacity Test page | A$XX,XXX* · C$XX,XXX* |
| What every role includes | Role pages, pricing | Replacement guarantee* |
| Shortlist promise | Role pages, pricing | Shortlist in 10 business days* |
| Working hours, levels | Role pages | AEST/AEDT or Pacific* · Junior · Mid · Senior* |
| Strata Staff Plus line | Homepage roles, pricing | Deck wording* |
| Certification status | Trust section, Trust Centre | ISO 27001 roadmap* |
| Four trust answers | Trust Centre | Details to be confirmed by operations* |
| Live chat, client login links | Top bar | Placeholder until a link is added |
| Strata Choice: roles, platforms, challenge, what we built, results, metrics, video | Case study | To be written with the client's data and approval* |
| Canada: hours, CAD pricing, Canadian stories | Canada page | Pacific-time coverage* · Pricing in CAD* · Canadian client stories* |
| Sample shortlist | Role pages | Anonymised candidates from a real shortlist* |

**Not placeholders, already true (from the live site or the deck's confirmed facts):**
- the slogan and test copy (the team's)
- 500+ placements, 98% retention and 12 platforms
- the memberships
- the 5 → 21 story since 2023
- the Vancouver office and Angeles City team
- the booking page
- the BC task list (deck)
