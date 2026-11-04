# Work summary: 4 November 2026

A modern rebuild of stratastaffglobal.com, planned to replace the current WordPress site next year.

Commits: `fd5d13a` (PHP site, admin portal, capacity calculator) and `e69f88e` (GSAP animation).

## New site

- Replaced the earlier static `modern-ss` design (the "paper agenda" look) with a standalone PHP 8 site. It has no WordPress and no SQL database: content is stored as JSON files.
- Clean URLs for every page:
  - Home, About, Team, Clients, Contact and Privacy.
  - Solutions, plus one page for each of the 10 strata roles.
  - Learning and the course outline.
  - Careers, plus one page for each job, with an apply form.
  - Insights, plus one page for each article.
  - Capacity calculator.
- All content comes from the live site: copy, stats, the 9 testimonials, 3 jobs, 8 insights, 23 team members, role details, course outlines, FAQs and the privacy policy. No invented text.
- More than 100 live-site images converted to WebP, reducing them from 36 MB to 3.5 MB.
- Nav dropdowns mirror the live site's About, Solutions and Learning menus.

## Admin portal (`/admin/`)

- A secure sign-in with hashed passwords, CSRF protection, rate limiting and session timeout. The first admin account is created from localhost.
- Manage:
  - Careers: post, edit and close jobs.
  - Insights: articles with a cover image, inline images, a gallery, an SEO title, and draft or publish.
  - Team: photo, name, title, department and bio, with drag to reorder.
  - Testimonials, roles, platform and membership logos, and FAQs.
- Logo and settings: logo, favicon, share image, hero text and photos, stats, contact details, social links, SEO and the privacy policy.
- A media library with drag-and-drop upload. Images are resized and converted to WebP in the browser.
- Job applications (with resume download) and contact enquiries, each with status tracking.

## SEO

- A unique title (up to 65 characters), meta description, canonical URL, and Open Graph and Twitter tags on every page.
- JSON-LD structured data: Organization (including memberships), WebSite, FAQPage, BreadcrumbList, Service, JobPosting (for Google for Jobs), NewsArticle, Course list, Review and WebApplication.
- A dynamic `sitemap.xml` and `robots.txt`, the `en-AU` locale, and preloading of the main hero image.
- An audit script checked all 32 sitemap pages, and all of them pass.

## Design changes from feedback

- Brand colours taken from the logo: blue `#094BC1` and green `#00544E`. The blue-to-green gradient was replaced with a tonal blue.
- Kept the animated, premium look (floating cards, rotating role names, count-up stats, logo marquee), benchmarked against cloudstaff.com.
- CTA band: the Strata Staff logo mark sits in a white circle badge.
- Hero: removed the decorative pill and the two kicker lines, and repositioned the floating chips so they no longer cover the photos.
- Removed the "—" line before section labels and the quote icon on testimonials.
- Fixed the nav hover highlight so it also covers the dropdown arrow.
- Insights cards now show square announcement graphics in full, over a blurred background, instead of cropping them.
- Memberships researched and labelled "Industry memberships": SCA NSW, SCA SA, SCA WA, REINSW and CCI BC.

## Capacity calculator

- Turned the LinkedIn landing-page calculator into a `/capacity-calculator` page in the site design: managers × admin hours × weeks gives hours and 40-hour work weeks.
- Added it to About → "Our people", below "Our awesome team".
- Added a compact version on the homepage.

## Animation (GSAP)

- Added GSAP 3.13 (free, with ScrollTrigger and SplitText).
- Effects:
  - Headlines reveal word by word.
  - The hero intro plays as one timeline, with photo wipes and scroll parallax.
  - Cards rise in staggered groups.
  - Images wipe open.
  - The "How it works" line draws as you scroll.
  - Task chips pop in.
  - The CTA logo spins in.
  - Main buttons lean towards the cursor.
  - The header hides on scroll down and returns on scroll up.
- The CSS animations remain as a fallback, and visitors with reduced motion turned on get no animation.
- Fixed cards that stayed invisible after anchor links or team filters.
- Installed the official GSAP agent skills (`greensock/gsap-skills`) in `.claude/skills/`.

## Notes and open items

- The privacy policy is copied from the live site and still describes the WordPress setup. It needs review before launch.
- The contact form is not yet connected to the CRM (put on hold).
- Live-site issues found: the Strata Executive Assistant page returns 404, and the MRI logo image is broken.
- Not deployed. Content (`database/data/`), uploads and config are kept out of git.

## Follow-up on 5 November 2026

- Moved the site out of `strata-landing-page` into its own folder, `htdocs/strata-modern`. `strata-landing-page` stays the WordPress copy of the live site.
- Reorganised the code into `backend/`, `frontend/`, `database/`, `plugins/`, `assets/`, `careers/` and `insights/`. The calculator and GSAP are now plugins that can be switched on and off. See the README for the full map.
- Commit `52eb081`.
