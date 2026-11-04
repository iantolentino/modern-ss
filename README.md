# Strata Staff Global — modern site

Standalone PHP 8 site with a built-in content portal. No database and no WordPress.

- **Public site:** `/` · `/about` · `/solutions` (+ one page per role) · `/team` · `/careers` (+ one page per job, with an apply form) · `/insights` (+ articles) · `/contact` · `/privacy`
- **Admin portal:** `/admin/`
- **SEO:** a unique title, description and canonical URL on every page. Open Graph and Twitter cards. JSON-LD for Organization, WebSite, FAQPage, BreadcrumbList, Service, JobPosting (Google for Jobs) and NewsArticle. Dynamic `/sitemap.xml` and `/robots.txt`. Clean URLs, one H1 per page, lazy-loaded images.

## Local

http://localhost/strata-landing-page/strata-modern/

On the first visit to `/admin/` from localhost, you are asked to create the first admin account. Add more users under **Users & security**.

## What the portal manages

| Section | What you can do |
|---|---|
| Careers | Post, edit and close jobs. Closed jobs drop off the list and out of Google. |
| Insights | Write articles with a cover image, inline images and a gallery. Save as draft or publish. |
| Team | Add photos with name and title, choose Executives or Team, drag to reorder |
| Testimonials / Roles / Logos / FAQs | Same editor style. Logos covers the platform and membership strips. |
| Media library | Every uploaded image, with bulk drag-and-drop upload |
| Logo & settings | Logo, footer logo, favicon, share image, hero text and photos, stats, contact details, social links, SEO |
| Applications | Applications with resume download and status tracking |
| Enquiries | Contact form leads |

Images are resized in the browser (max 800–1800px, depending on the field), converted to WebP, and named after the person or title for SEO.

## Data

- `data/*.json`: all content. Created from `inc/seed.php` on the first run. Blocked from the web.
- `data/private/resumes/`: uploaded CVs. Blocked from the web and downloadable only by signed-in admins.
- `uploads/`: images uploaded through the portal. PHP and script execution is blocked in this folder.
- `assets/media/`: built-in images taken from stratastaffglobal.com in Nov 2026, resized to WebP (about 3.5 MB total). They appear in the media library and can be swapped out, but not deleted.
- `inc/privacy-default.md`: the live site's privacy policy, copied as-is. It still describes the WordPress setup (Contact Form 7, Turnstile, Microsoft Bookings), so have it reviewed before launch. It is editable under **Logo & settings → Privacy policy**.

**Back up `data/` and `uploads/`.** They are the site's content and are git-ignored.

## Deploying to cPanel

1. Upload the folder's contents to the target directory (for example `public_html/` or a staging subdomain).
2. Copy `config.sample.php` to `config.php`. Set `site_url`, the notification emails, and a temporary `setup_token`.
3. Visit `/admin/?token=YOUR_TOKEN`, create your account, then clear `setup_token`.
4. To carry local content across, upload your local `data/` and `uploads/` folders as well.

## Animation

- **GSAP 3.13** (free, including ScrollTrigger and SplitText) loads from the jsDelivr CDN. `assets/js/motion.js` drives it: masked headline reveals, image wipes, hero parallax, staggered scroll reveals, the "How it works" progress line, magnetic buttons, and a header that hides on scroll.
- The CSS keyframe animations in `assets/css/site.css` are the fallback when GSAP can't load. Visitors with *reduced motion* switched on get no animation.
- The official GSAP agent skills are installed in this project's `.claude/skills/` folder, sourced from greensock/gsap-skills.
