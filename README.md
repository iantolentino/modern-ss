# Strata Staff Global — modern site

Standalone PHP 8 site with a built-in content portal. No database and no WordPress.

- **Public site:** `/` · `/about` · `/solutions` (+ one page per role) · `/team` · `/careers` (+ one page per job, with an apply form) · `/insights` (+ articles) · `/contact` · `/privacy`
- **Admin portal:** `/admin/`
- **SEO:** a unique title, description and canonical URL on every page. Open Graph and Twitter cards. JSON-LD for Organization, WebSite, FAQPage, BreadcrumbList, Service, JobPosting (Google for Jobs) and NewsArticle. Dynamic `/sitemap.xml` and `/robots.txt`. Clean URLs, one H1 per page, lazy-loaded images.

## Local

http://localhost/strata-modern/

This folder is separate from the WordPress copy of the live site (`htdocs/strata-landing-page`). It is the site planned for next year.

On the first visit to `/admin/` from localhost, you are asked to create the first admin account. Add more users under **Users & security**.

## Folder structure

Each folder has one job, so a bug usually points to one place.

```
index.php            Front controller: every request comes here (see .htaccess)
backend/
  bootstrap.php      Paths, config and loading of everything below
  router.php         URL -> page file map, sitemap.xml, robots.txt
  helpers.php        Escaping, URLs, media paths, markdown, dates
  security.php       Sessions, CSRF, rate limiting, input cleaning
  mail.php           Outgoing notification email
  plugins.php        Loads plugins/*/plugin.php and their CSS/JS
  forms/contact.php  Contact form handling (validate, save, email)
  admin/             Admin portal at /admin/ (controller, UI, collection schemas)
  config.php         Your local/server settings (git-ignored; copy config.sample.php)
frontend/
  layout.php         <head>, header, nav menus, footer, SEO schema, page hero
  pages/             Home, About, Team, Solutions, Service, Learning, Clients, Contact, Privacy, 404
  partials/          Person card, role card
careers/
  list.php           /careers
  job.php            /careers/{slug}
  apply.php          Job application handling (resume upload, save, email HR)
insights/
  list.php           /insights
  post.php           /insights/{slug}
  post-card.php      Article card used on Home, Insights and article pages
database/
  store.php          JSON store: load(), save(), settings(), items(), find_by_slug()
  seed.php           First-run content from the live site
  privacy-default.md Default privacy policy
  data/              Live content JSON + private/ (rate limits, resumes). Git-ignored.
plugins/
  capacity-calculator/  /capacity-calculator page, homepage widget, its JS and CSS
  gsap-motion/          GSAP animation layer (motion.js, motion.css)
assets/
  css/site.css       Site styles
  js/site.js         Menus, reveals, counters, sliders, filters
  admin/             Admin portal CSS and JS
  media/             Built-in images
uploads/             Images uploaded through the admin (git-ignored)
tools/
  build_preview.py   Builds and publishes the static GitHub Pages preview
docs/                Work summaries
```

`backend/`, `frontend/`, `database/`, `tools/` and `docs/` are blocked from the web, as is any `.php` inside `plugins/`. `careers/` and `insights/` URLs always go through the router.

### Debugging tips

- **A page looks wrong:** find its file through the `switch` in `backend/router.php`.
- **A form fails:** see `backend/forms/contact.php` or `careers/apply.php`.
- **Content is wrong:** check the JSON in `database/data/`. Delete a file there to re-seed it from `database/seed.php`.
- **An animation misbehaves:** set `'enabled' => false` in `plugins/gsap-motion/plugin.php`. The site then falls back to its CSS animations.
- **Plugins:** each one has a `plugin.php` manifest listing its CSS and JS. Turning one off removes its assets, and for the calculator also its page, menu item and homepage section.

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

- `database/data/*.json`: all content. Created from `database/seed.php` on the first run. Blocked from the web.
- `database/data/private/resumes/`: uploaded CVs. Blocked from the web and downloadable only by signed-in admins.
- `uploads/`: images uploaded through the portal. PHP and script execution is blocked in this folder.
- `assets/media/`: built-in images taken from stratastaffglobal.com in Nov 2026, resized to WebP (about 3.5 MB total). They appear in the media library and can be swapped out, but not deleted.
- `database/privacy-default.md`: the live site's privacy policy, copied as-is. It still describes the WordPress setup (Contact Form 7, Turnstile, Microsoft Bookings), so have it reviewed before launch. It is editable under **Logo & settings → Privacy policy**.

**Back up `database/data/` and `uploads/`.** They are the site's content and are git-ignored.

## Online preview (GitHub Pages)

https://iantolentino.github.io/modern-ss/ is a static copy of the site, so people can view it without XAMPP. GitHub Pages can't run PHP, so in the preview the forms are disabled and there is no admin. Pages are marked noindex, so Google won't list the preview.

It is served from the `gh-pages` branch and doesn't update by itself. After changing the site, with XAMPP running:

```
python tools/build_preview.py --publish
```

This saves every page from http://localhost/strata-modern/, copies the files those pages use, then commits and pushes to `gh-pages`. Pages refreshes within a minute or two. To check a build without publishing, use `--out SOME_EMPTY_FOLDER`.

The preview shows your local content (`database/data/`), including anything you've edited in the local admin.

## Deploying to cPanel

1. Upload the folder's contents to the target directory (for example `public_html/` or a staging subdomain).
2. Copy `backend/config.sample.php` to `backend/config.php`. Set `site_url`, the notification emails, and a temporary `setup_token`.
3. Visit `/admin/?token=YOUR_TOKEN`, create your account, then clear `setup_token`.
4. To carry local content across, upload your local `database/data/` and `uploads/` folders as well.

## Animation

- **GSAP 3.13** (free, including ScrollTrigger and SplitText) loads from the jsDelivr CDN. `plugins/gsap-motion/motion.js` drives it: masked headline reveals, image wipes, hero parallax, staggered scroll reveals, the "How it works" progress line, magnetic buttons, and a header that hides on scroll.
- The CSS keyframe animations in `assets/css/site.css` are the fallback when GSAP can't load or the plugin is switched off. Visitors with *reduced motion* switched on get no animation.
- The official GSAP agent skills are in `.claude/skills/` in this folder, sourced from greensock/gsap-skills.
