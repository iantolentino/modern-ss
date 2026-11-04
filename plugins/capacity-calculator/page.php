<?php
$crumbs = [['', 'Home'], ['about', 'About'], ['capacity-calculator', 'Capacity calculator']];
$quote = null;
foreach (items('testimonials') as $t) if (stripos($t['quote'], 'focus on what we need to do onshore') !== false) $quote = $t;
$roles = items('services', function ($s) { return $s['category'] === 'strata'; });
$app = [
    '@context' => 'https://schema.org', '@type' => 'WebApplication',
    'name' => 'Strata Capacity Calculator', 'applicationCategory' => 'BusinessApplication', 'operatingSystem' => 'Any',
    'url' => abs_url('capacity-calculator'), 'offers' => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'AUD'],
    'description' => 'Estimate how many strata manager hours a year are tied up in admin and back-office work.',
    'provider' => ['@id' => abs_url('#org')],
];
layout_head([
    'title' => 'Strata Capacity Calculator | Strata Staff Global',
    'description' => 'How much manager time is tied up in admin? Estimate the back-office hours your strata managers could get back in under 30 seconds.',
    'path' => 'capacity-calculator',
    'schema' => [breadcrumb_schema($crumbs), $app],
], 'about');
?>
<section class="page-hero">
  <div class="wrap calc-hero">
    <div>
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="<?= e(url()) ?>">Home</a></li><li><a href="<?= e(url('about')) ?>">About</a></li><li><span aria-current="page">Capacity calculator</span></li></ol></nav>
      <p class="eyebrow">The hidden capacity inside your business</p>
      <h1>How much time could you give back to your strata managers?</h1>
      <p class="lede">Your managers are valuable. If they spend hours every week on administration, routine accounting and customer enquiries, you're paying manager-level salaries for work that can often be delegated.</p>
      <p class="calc-note"><?= icon('clock') ?> Takes less than 30 seconds · No obligation</p>
    </div>
    <?php $calcId = 'calc-main'; $calcFull = true; require PLUGINS_DIR . '/capacity-calculator/widget.php'; ?>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head center reveal">
      <p class="eyebrow">The opportunity</p>
      <h2>What if your managers got those hours back?</h2>
      <p class="lede">The goal isn't simply to add cheaper staff. It's to move the right work to the right level of resource, and free your experienced people to do the work only they can do.</p>
    </div>
    <div class="benefit-cards">
      <?php foreach ([
          ['trend', 'More portfolio capacity', 'Managers spend more time on portfolio issues, relationships and work that needs their expertise.'],
          ['layers', 'Better growth economics', 'Create operating capacity without automatically adding every layer of onshore overhead.'],
          ['shield', 'Less back-office pressure', 'Routine work gets a dedicated resource instead of competing with urgent manager priorities.'],
      ] as $i => $c): ?>
        <article class="benefit-card reveal"><span class="feature-icon"><?= icon($c[0]) ?></span><h3><?= e($c[1]) ?></h3><p><?= e($c[2]) ?></p></article>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="section section-dark">
  <div class="wrap">
    <div class="section-head center reveal">
      <p class="eyebrow light">Purpose-built for strata</p>
      <h2>A dedicated extension of your team, not a generic VA</h2>
      <p class="lede">Strata-trained offshore support built around your systems, processes and portfolio.</p>
    </div>
    <div class="role-links">
      <?php foreach ($roles as $r): ?>
        <a class="role-link-card reveal" href="<?= e(url('solutions/' . $r['slug'])) ?>"><strong><?= e($r['title']) ?></strong><span><?= e($r['summary']) ?></span><?= icon('arrow') ?></a>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap narrow">
    <div class="section-head center reveal">
      <p class="eyebrow">A different way to scale</p>
      <h2>Don't hire your next manager just to solve an admin problem</h2>
      <p class="lede">Before adding another onshore position, look at the workload underneath the role. Some of it may be better handled by dedicated offshore capacity.</p>
    </div>
    <?php if ($quote): ?>
    <figure class="quote-card quote-feature reveal">
      <blockquote><p><?= e($quote['quote']) ?></p></blockquote>
      <figcaption><?= avatar($quote, 'quote-avatar') ?><span><strong><?= e($quote['name']) ?></strong><small><?= e($quote['title']) ?>, <?= e($quote['company']) ?></small></span></figcaption>
    </figure>
    <?php endif; ?>
  </div>
</section>
<?php layout_foot();
