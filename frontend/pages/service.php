<?php
$crumbs = [['', 'Home'], ['solutions', 'Solutions'], ['solutions/' . $item['slug'], $item['title']]];
$schema = [
    '@context' => 'https://schema.org', '@type' => 'Service',
    'name' => 'Offshore ' . $item['title'], 'serviceType' => $item['title'],
    'description' => $item['summary'], 'provider' => ['@id' => abs_url('#org')],
    'areaServed' => [['@type' => 'Country', 'name' => 'Australia'], ['@type' => 'Country', 'name' => 'Canada']],
];
$photo = $item['image_detail'] ?? '' ?: $item['image'];
layout_head([
    'title' => 'Offshore ' . $item['title'] . ' | Strata Staff Global',
    'description' => $item['summary'] . (mb_strlen($item['summary']) < 115 ? ' Trained in strata before day one.' : ''),
    'path' => 'solutions/' . $item['slug'],
    'image' => $photo,
    'schema' => [breadcrumb_schema($crumbs), $schema],
], 'solutions');
$others = array_slice(array_filter(items('services'), function ($s) use ($item) { return $s['slug'] !== $item['slug'] && $s['category'] === $item['category']; }), 0, 4);
$contactUrl = url('contact?role=' . rawurlencode($item['title']));
$offer = setting('offer', []);
$platformNames = array_column(items('logos', function ($l) { return ($l['group'] ?? '') === 'platform' && !empty($l['image']); }), 'name');
$included = array_filter(array_map('ph', lines((string) ($offer['included'] ?? ''))));
$price = ph(role_price($item));
?>
<section class="page-hero">
  <div class="wrap hero-media-grid">
    <div>
      <nav class="crumbs" aria-label="Breadcrumb"><ol>
        <li><a href="<?= e(url()) ?>">Home</a></li><li><a href="<?= e(url('solutions')) ?>">Solutions</a></li><li><span aria-current="page"><?= e($item['title']) ?></span></li>
      </ol></nav>
      <h1><?= e($item['title']) ?></h1>
      <p class="lede"><?= e(trim((string) ($item['lead'] ?? '')) !== '' ? $item['lead'] : $item['summary']) ?></p>
      <ul class="role-facts">
        <?php if ($platformNames): ?><li><?= icon('layers') ?><strong>Platforms</strong> <?= e(implode(' · ', array_slice($platformNames, 0, 5))) ?></li><?php endif; ?>
        <?php if (ph($offer['hours'] ?? '') !== ''): ?><li><?= icon('clock') ?><strong>Hours</strong> <?= ph($offer['hours']) ?></li><?php endif; ?>
        <?php if (ph($offer['levels'] ?? '') !== ''): ?><li><?= icon('users') ?><strong>Levels</strong> <?= ph($offer['levels']) ?></li><?php endif; ?>
      </ul>
      <div class="hero-actions">
        <a class="btn btn-primary btn-lg" href="<?= e($contactUrl) ?>">Request a shortlist <?= icon('arrow') ?></a>
        <?php if (plugin_enabled('capacity-calculator')): ?><a class="btn btn-ghost-light btn-lg" href="<?= e(url('hidden-capacity-test')) ?>"><?= icon('clock') ?> Take the Hidden Capacity Test</a><?php endif; ?>
      </div>
    </div>
    <div class="hero-portrait"><img src="<?= e(media($photo)) ?>" alt="Offshore <?= e($item['title']) ?> at Strata Staff Global" width="440" height="500" fetchpriority="high"></div>
  </div>
</section>
<section class="section">
  <div class="wrap content-grid">
    <div class="prose reveal">
      <h2>About the role</h2>
      <?= md($item['body'] ?? '') ?>
      <?php $exp = lines($item['tasks'] ?? ''); if ($exp): ?>
      <h2>What they handle</h2>
      <ul class="checklist"><?php foreach ($exp as $t): ?><li><?= icon('check') ?> <?= e($t) ?></li><?php endforeach; ?></ul>
      <?php endif; ?>
      <?php $mods = lines($item['outline'] ?? ''); if ($mods): ?>
      <h2>How they're trained</h2>
      <p>Every <?= e($item['title']) ?> completes the Strata Staff Academy course for the role before joining your team.</p>
      <ol class="modules">
        <?php foreach ($mods as $mod): $parts = explode(':', $mod, 2); ?>
          <li><?php if (count($parts) === 2): ?><span><?= e(trim($parts[0])) ?></span><?= e(trim($parts[1])) ?><?php else: ?><?= e($mod) ?><?php endif; ?></li>
        <?php endforeach; ?>
      </ol>
      <p><a class="text-link" href="<?= e(url('learning/course-outline')) ?>">All course outlines <?= icon('arrow') ?></a></p>
      <?php endif; ?>
      <?php if (!ph_hidden()): ?>
      <h2>Sample shortlist</h2>
      <div class="shortlist">
        <?php foreach (['A', 'B', 'C'] as $n => $letter): ?>
          <div class="shortlist-card"><span class="shortlist-mark"><?= $letter . ($n + 1) ?></span><div><strong>Candidate <?= $letter ?></strong><span><?= ph('Experience, platforms and availability from a real shortlist*') ?></span></div></div>
        <?php endforeach; ?>
      </div>
      <p class="small muted">Anonymised examples for illustration.</p>
      <?php endif; ?>
    </div>
    <aside class="side-card price-card reveal">
      <?php if ($price !== ''): ?>
      <small class="muted">Indicative, all-inclusive</small>
      <p class="price-big">From <?= $price ?> <span>/ month</span></p>
      <?php else: ?>
      <h2 class="h4">Add this role to your team</h2>
      <?php endif; ?>
      <?php if ($included): ?><ul class="check-list"><?php foreach ($included as $line): ?><li><?= icon('check') ?><span><?= $line ?></span></li><?php endforeach; ?></ul><?php endif; ?>
      <?php if (ph($offer['shortlist'] ?? '') !== ''): ?><p class="price-shortlist"><?= icon('clock') ?> <?= ph($offer['shortlist']) ?></p><?php endif; ?>
      <a class="btn btn-primary btn-block" href="<?= e($contactUrl) ?>">Book a 30-minute discovery call</a>
    </aside>
  </div>
</section>
<?php if ($others): ?>
<section class="section section-tint">
  <div class="wrap">
    <div class="section-head row reveal"><h2>Related roles</h2><a class="text-link" href="<?= e(url('solutions')) ?>">All solutions <?= icon('arrow') ?></a></div>
    <div class="roles"><?php foreach ($others as $s) require FRONTEND_DIR . '/partials/role-card.php'; ?></div>
  </div>
</section>
<?php endif; ?>
<?php layout_foot();
