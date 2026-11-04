<?php
/**
 * Page shell. Pages set $meta = [title, description, image, type, schema[], noindex]
 * then call layout_head($meta) ... layout_foot().
 */

function icon(string $name, string $cls = 'i'): string {
    $p = [
        'arrow'    => '<path d="M5 12h14M13 6l6 6-6 6"/>',
        'chev'     => '<path d="M6 9l6 6 6-6"/>',
        'check'    => '<path d="M5 12.5l4.5 4.5L19 7"/>',
        'phone'    => '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/>',
        'mail'     => '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
        'pin'      => '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
        'clock'    => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        'brief'    => '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 13h18"/>',
        'menu'     => '<path d="M4 7h16M4 12h16M4 17h16"/>',
        'close'    => '<path d="M6 6l12 12M18 6L6 18"/>',
        'shield'   => '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
        'spark'    => '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
        'layers'   => '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
        'trend'    => '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
        'calendar' => '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
        'users'    => '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 016 5"/>',
        'quote'    => '<path d="M9 7H6a2 2 0 00-2 2v3h5v5H4M20 7h-3a2 2 0 00-2 2v3h5v5h-5"/>',
        'linkedin' => '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 014 0v4M12 10v7"/>',
        'facebook' => '<path d="M14 21v-8h3l.5-3.5H14V7.5c0-1 .4-1.5 1.6-1.5H18V3a20 20 0 00-2.8-.2C12.5 2.8 11 4.4 11 7.2v2.3H8V13h3v8"/>',
        'instagram'=> '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
        'plus'     => '<path d="M12 5v14M5 12h14"/>',
        'help'     => '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1.2-1.5 2.5M12 17v.01"/>',
        'upload'   =>'<path d="M12 16V4M7 9l5-5 5 5M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3"/>',
    ];
    return '<svg class="' . e($cls) . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . ($p[$name] ?? '') . '</svg>';
}

function nav_items(): array {
    return [
        ['about', 'About'],
        ['solutions', 'Solutions'],
        ['learning', 'Learning'],
        ['team', 'Our Team'],
        ['careers', 'Careers'],
        ['insights', 'Insights'],
    ];
}

/** Dropdown groups for the header, mirroring the live site's menus. Each group: [heading, [[path, label, note]]]. */
function nav_menus(): array {
    $roles = function (string $cat) {
        return array_map(function ($s) { return ['solutions/' . $s['slug'], $s['title'], '']; },
            array_values(array_filter(items('services'), function ($s) use ($cat) { return $s['category'] === $cat; })));
    };
    return [
        'about' => [
            ['About Strata Staff', [
                ['about', 'Our story', 'Strata offshoring since 2019'],
                ['about#journey', 'Enjoying the journey', 'Our timeline and core values'],
                ['clients', 'Our clients have spoken', 'What strata agencies say'],
            ]],
            ['Our people', [
                ['team#executives', 'Executives', 'The leadership team'],
                ['team#team', 'Our awesome team', 'Managers, trainers and team leaders'],
                ['capacity-calculator', 'Capacity calculator', 'Find the hidden capacity in your team'],
            ]],
        ],
        'solutions' => [
            ['Strata Services', $roles('strata')],
            ['Strata Staff Plus', $roles('pm')],
        ],
        'learning' => [
            ['Learning', [
                ['learning/course-outline', 'Course outline per role', 'Training modules for every position'],
                ['learning#ftp', 'Foundation Training Program', 'How new staff become strata-ready'],
                ['learning#academy', 'Strata Staff Academy', 'Our online learning hub'],
            ]],
        ],
    ];
}

function org_schema(): array {
    $c = setting('contact', []);
    return [
        '@context' => 'https://schema.org',
        '@type' => 'Organization',
        '@id' => abs_url('#org'),
        'name' => setting('site_name'),
        'url' => abs_url(''),
        'logo' => abs_url(media(setting('logo'))),
        'email' => $c['email'] ?? '',
        'sameAs' => array_values(array_filter(setting('social', []))),
        'foundingDate' => '2019-04',
        'description' => setting('tagline'),
        'address' => [
            ['@type' => 'PostalAddress', 'streetAddress' => 'PO Box 109', 'addressLocality' => 'Ivanhoe', 'addressRegion' => 'VIC', 'postalCode' => '3079', 'addressCountry' => 'AU'],
            ['@type' => 'PostalAddress', 'streetAddress' => '777 Hornby Street, Suite 600', 'addressLocality' => 'Vancouver', 'addressRegion' => 'BC', 'postalCode' => 'V6Z 1S4', 'addressCountry' => 'CA'],
        ],
        'areaServed' => ['Australia', 'Canada'],
        'memberOf' => array_map(function ($l) {
            return array_filter(['@type' => 'Organization', 'name' => $l['name'], 'url' => $l['url'] ?? '']);
        }, items('logos', function ($l) { return ($l['group'] ?? '') === 'membership'; })),
        'contactPoint' => [
            ['@type' => 'ContactPoint', 'telephone' => $c['au_phone'] ?? '', 'contactType' => 'sales', 'areaServed' => 'AU'],
            ['@type' => 'ContactPoint', 'telephone' => $c['ca_phone'] ?? '', 'contactType' => 'sales', 'areaServed' => 'CA'],
        ],
    ];
}

function breadcrumb_schema(array $crumbs): array {
    $list = [];
    foreach ($crumbs as $i => $c) {
        $list[] = ['@type' => 'ListItem', 'position' => $i + 1, 'name' => $c[1], 'item' => abs_url($c[0])];
    }
    return ['@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => $list];
}

function layout_head(array $meta, string $active = ''): void {
    $name = setting('site_name', 'Strata Staff Global');
    $title = $meta['title'] ?? $name;
    // Search results show ~60 characters: drop trailing " | ..." segments until the title fits
    while (mb_strlen($title) > 65 && strpos($title, ' | ') !== false) $title = substr($title, 0, strrpos($title, ' | '));
    $desc = (string) ($meta['description'] ?? setting('seo.home_description'));
    if (mb_strlen($desc) > 160) $desc = plain($desc, 158);
    $img = abs_url(media($meta['image'] ?? '', media(setting('og_image'))));
    $canonical = abs_url($meta['path'] ?? '');
    $logo = media(setting('logo'));
    $fav = media(setting('favicon'), $logo);
    $schema = array_merge([org_schema()], $meta['schema'] ?? []);
    ?><!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($title) ?></title>
<meta name="description" content="<?= e($desc) ?>">
<link rel="canonical" href="<?= e($canonical) ?>">
<?php if (!empty($meta['noindex'])): ?><meta name="robots" content="noindex, follow"><?php else: ?><meta name="robots" content="index, follow, max-image-preview:large"><?php endif; ?>

<meta property="og:site_name" content="<?= e($name) ?>">
<meta property="og:type" content="<?= e($meta['type'] ?? 'website') ?>">
<meta property="og:title" content="<?= e($title) ?>">
<meta property="og:description" content="<?= e($desc) ?>">
<meta property="og:url" content="<?= e($canonical) ?>">
<meta property="og:image" content="<?= e($img) ?>">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#061a40">
<?php if ($fav): ?><link rel="icon" href="<?= e($fav) ?>"><?php endif; ?>
<?php if (!empty($meta['preload'])): ?><link rel="preload" as="image" href="<?= e($meta['preload']) ?>" fetchpriority="high"><?php endif; ?>
<meta property="og:locale" content="en_AU">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="<?= e(url('assets/css/site.css')) ?>?v=<?= @filemtime(ROOT_DIR . '/assets/css/site.css') ?>">
<?php foreach ($schema as $s): ?>
<script type="application/ld+json"><?= json_encode($s, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) ?></script>
<?php endforeach; ?>
</head>
<body class="<?= e($meta['body_class'] ?? '') ?>">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header" id="top">
  <div class="wrap header-inner">
    <a class="brand" href="<?= e(url()) ?>" aria-label="<?= e($name) ?> home">
      <?php if ($logo): ?><img src="<?= e($logo) ?>" alt="<?= e($name) ?>" width="160" height="48"><?php else: ?><span class="brand-text"><?= e($name) ?></span><?php endif; ?>
    </a>
    <nav class="main-nav" id="main-nav" aria-label="Main">
      <ul>
        <?php $menus = nav_menus(); foreach (nav_items() as [$slug, $label]): $sub = $menus[$slug] ?? null; ?>
          <li<?= $sub ? ' class="has-menu"' : '' ?>>
            <a href="<?= e(url($slug)) ?>"<?= $active === $slug ? ' aria-current="page"' : '' ?>><?= e($label) ?></a>
            <?php if ($sub): ?>
            <button class="menu-toggle" type="button" aria-expanded="false" aria-label="<?= e($label) ?> menu"><?= icon('chev') ?></button>
            <div class="menu<?= count($sub) > 1 ? ' menu-wide' : '' ?>">
              <?php foreach ($sub as [$heading, $links]): ?>
                <div class="menu-col">
                  <p class="menu-head"><?= e($heading) ?></p>
                  <ul>
                    <?php foreach ($links as [$path, $text, $note]): ?>
                      <li><a href="<?= e(url($path)) ?>"><span><?= e($text) ?></span><?php if ($note): ?><small><?= e($note) ?></small><?php endif; ?></a></li>
                    <?php endforeach; ?>
                  </ul>
                </div>
              <?php endforeach; ?>
            </div>
            <?php endif; ?>
          </li>
        <?php endforeach; ?>
      </ul>
      <a class="btn btn-sm nav-cta" href="<?= e(url('contact')) ?>">Talk to us <?= icon('arrow') ?></a>
    </nav>
    <button class="nav-toggle" type="button" aria-controls="main-nav" aria-expanded="false" aria-label="Open menu"><?= icon('menu') ?></button>
  </div>
</header>
<main id="main">
<?php
}

function layout_foot(): void {
    $c = setting('contact', []);
    $s = setting('social', []);
    $name = setting('site_name');
    ?>
</main>
<section class="cta-band">
  <div class="wrap"><div class="cta-inner reveal">
    <div class="cta-mark" aria-hidden="true" style="--mark: url(<?= e(url('assets/media/brand/strata-staff-mark-white.png')) ?>)"><span class="cta-badge"><img src="<?= e(url('assets/media/brand/strata-staff-mark.png')) ?>" alt="" width="88" height="88" loading="lazy"></span></div>
    <div>
      <h2>Schedule a free discovery call</h2>
      <p>Tell us about your agency and the work piling up. We'll show you where an offshore team fits. No obligation.</p>
    </div>
    <div class="cta-actions">
      <a class="btn btn-light" href="<?= e(url('contact')) ?>">Talk to us <?= icon('arrow') ?></a>
      <?php if (!empty($c['scorecard_url'])): ?><a class="btn btn-ghost-light" href="<?= e($c['scorecard_url']) ?>">Take the capacity test</a><?php endif; ?>
    </div>
  </div></div>
</section>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <?php $fl = media(setting('logo_footer'), media(setting('logo'))); if ($fl): ?><img src="<?= e($fl) ?>" alt="<?= e($name) ?>" width="150" height="45" loading="lazy" class="footer-logo"><?php endif; ?>
      <p><?= e(setting('tagline')) ?></p>
      <div class="social">
        <?php foreach (['linkedin' => 'LinkedIn', 'facebook' => 'Facebook', 'instagram' => 'Instagram'] as $k => $label): if (!empty($s[$k])): ?>
          <a href="<?= e($s[$k]) ?>" target="_blank" rel="noopener" aria-label="<?= $label ?>"><?= icon($k) ?></a>
        <?php endif; endforeach; ?>
      </div>
    </div>
    <div>
      <h3>Company</h3>
      <ul>
        <?php foreach (nav_items() as [$slug, $label]): ?><li><a href="<?= e(url($slug)) ?>"><?= e($label) ?></a></li><?php endforeach; ?>
        <li><a href="<?= e(url('contact')) ?>">Contact</a></li>
      </ul>
    </div>
    <div>
      <h3>Australia</h3>
      <p><?= icon('pin') ?> <?= e($c['au_address'] ?? '') ?></p>
      <p><a href="tel:<?= e(preg_replace('/[^\d+]/', '', $c['au_phone'] ?? '')) ?>"><?= icon('phone') ?> <?= e($c['au_phone'] ?? '') ?></a></p>
    </div>
    <div>
      <h3>Canada</h3>
      <p><?= icon('pin') ?> <?= e($c['ca_address'] ?? '') ?></p>
      <p><a href="tel:<?= e(preg_replace('/[^\d+]/', '', $c['ca_phone'] ?? '')) ?>"><?= icon('phone') ?> <?= e($c['ca_phone'] ?? '') ?></a></p>
      <p><a href="mailto:<?= e($c['email'] ?? '') ?>"><?= icon('mail') ?> <?= e($c['email'] ?? '') ?></a></p>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <span>&copy; <?= date('Y') ?> <?= e($name) ?>. All rights reserved.</span>
    <a href="<?= e(url('privacy')) ?>">Privacy Policy</a>
  </div>
</footer>
<script src="<?= e(url('assets/js/site.js')) ?>?v=<?= @filemtime(ROOT_DIR . '/assets/js/site.js') ?>" defer></script>
<?php // GSAP (free, incl. plugins) drives the richer motion; the CSS animations remain the fallback if it fails to load ?>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js" defer></script>
<script src="<?= e(url('assets/js/motion.js')) ?>?v=<?= @filemtime(ROOT_DIR . '/assets/js/motion.js') ?>" defer></script>
</body>
</html>
<?php
}

function page_hero(string $eyebrow, string $title, string $lede = '', array $crumbs = []): void { ?>
<section class="page-hero">
  <div class="wrap">
    <?php if ($crumbs): ?>
    <nav class="crumbs" aria-label="Breadcrumb"><ol>
      <?php foreach ($crumbs as $i => $c): ?>
        <li><?php if ($i < count($crumbs) - 1): ?><a href="<?= e(url($c[0])) ?>"><?= e($c[1]) ?></a><?php else: ?><span aria-current="page"><?= e($c[1]) ?></span><?php endif; ?></li>
      <?php endforeach; ?>
    </ol></nav>
    <?php endif; ?>
    <p class="eyebrow"><?= e($eyebrow) ?></p>
    <h1><?= e($title) ?></h1>
    <?php if ($lede): ?><p class="lede"><?= e($lede) ?></p><?php endif; ?>
  </div>
</section>
<?php }

function avatar(array $p, string $class = 'avatar'): string {
    $src = media($p['photo'] ?? '');
    if ($src) return '<img class="' . e($class) . '" src="' . e($src) . '" alt="' . e($p['name'] ?? '') . '" loading="lazy" width="320" height="400">';
    $ini = '';
    foreach (array_slice(preg_split('/\s+/', trim($p['name'] ?? '')), 0, 2) as $w) $ini .= mb_strtoupper(mb_substr($w, 0, 1));
    return '<span class="' . e($class) . ' avatar-initials" aria-hidden="true">' . e($ini) . '</span>';
}
