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
?>
<section class="page-hero">
  <div class="wrap hero-media-grid">
    <div>
      <nav class="crumbs" aria-label="Breadcrumb"><ol>
        <li><a href="<?= e(url()) ?>">Home</a></li><li><a href="<?= e(url('solutions')) ?>">Solutions</a></li><li><span aria-current="page"><?= e($item['title']) ?></span></li>
      </ol></nav>
      <p class="eyebrow"><?= $item['category'] === 'pm' ? 'Strata Staff Plus · Property management' : 'Strata Services · Strata management' ?></p>
      <h1><?= e($item['title']) ?></h1>
      <p class="lede"><?= e($item['summary']) ?></p>
      <a class="btn btn-primary btn-lg" href="<?= e($contactUrl) ?>">Enquire about this role <?= icon('arrow') ?></a>
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
      <h2>Expertise</h2>
      <ul class="checklist"><?php foreach ($exp as $t): ?><li><?= icon('check') ?> <?= e($t) ?></li><?php endforeach; ?></ul>
      <?php endif; ?>
      <?php $mods = lines($item['outline'] ?? ''); if ($mods): ?>
      <h2>Training outline</h2>
      <p>Every <?= e($item['title']) ?> completes this outline before joining your team.</p>
      <ol class="modules">
        <?php foreach ($mods as $mod): $parts = explode(':', $mod, 2); ?>
          <li><?php if (count($parts) === 2): ?><span><?= e(trim($parts[0])) ?></span><?= e(trim($parts[1])) ?><?php else: ?><?= e($mod) ?><?php endif; ?></li>
        <?php endforeach; ?>
      </ol>
      <p><a class="text-link" href="<?= e(url('learning/course-outline')) ?>">All course outlines <?= icon('arrow') ?></a></p>
      <?php endif; ?>
    </div>
    <aside class="side-card reveal">
      <h2 class="h4">Add this role to your team</h2>
      <p>Book a free 30-minute discovery call. We'll match the role to your workflows and the strata platforms you use.</p>
      <a class="btn btn-primary btn-block" href="<?= e($contactUrl) ?>">Book a discovery call</a>
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
