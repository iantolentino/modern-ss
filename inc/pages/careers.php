<?php
$crumbs = [['', 'Home'], ['careers', 'Careers']];
$jobs = items('jobs');
$cr = setting('careers', []);
$depts = array_values(array_unique(array_filter(array_column($jobs, 'department'))));
layout_head([
    'title' => 'Careers at Strata Staff Global | Jobs in Angeles City, Pampanga',
    'description' => 'Join Strata Staff Global. Open roles in strata accounting, administration, HR and customer care with paid training, HMO and real career growth.',
    'path' => 'careers',
    'schema' => [breadcrumb_schema($crumbs)],
], 'careers');
?>
<section class="page-hero has-media">
  <div class="wrap hero-media-grid">
    <div>
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="<?= e(url()) ?>">Home</a></li><li><span aria-current="page">Careers</span></li></ol></nav>
      <p class="eyebrow">Careers</p>
      <h1><?= e($cr['headline'] ?? 'Join our team') ?></h1>
      <p class="lede"><?= e($cr['intro'] ?? '') ?></p>
      <a class="btn btn-primary btn-lg" href="#openings"><?= count($jobs) ?> open <?= count($jobs) === 1 ? 'role' : 'roles' ?> <?= icon('arrow') ?></a>
    </div>
    <?php if (!empty($cr['image'])): ?><div class="hero-portrait"><img src="<?= e(media($cr['image'])) ?>" alt="Strata Staff team member" width="420" height="520" fetchpriority="high"></div><?php endif; ?>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">Working at Strata Staff</p><h2>Benefits</h2><p class="lede">Our team works from the Marisol Office in Angeles City, Pampanga. Every new hire goes through our Foundation Training Program.</p></div>
    <ul class="benefits reveal">
      <?php foreach (lines((string) ($cr['benefits'] ?? '')) as $b): ?><li><?= icon('check') ?> <?= e($b) ?></li><?php endforeach; ?>
    </ul>
  </div>
</section>
<section class="section section-tint" id="openings">
  <div class="wrap">
    <div class="section-head row reveal">
      <div><p class="eyebrow">Open positions</p><h2>Find your next role</h2></div>
      <?php if (count($depts) > 1): ?>
      <div class="tabs" role="tablist" aria-label="Department">
        <button role="tab" aria-selected="true" data-filter="all">All</button>
        <?php foreach ($depts as $d): ?><button role="tab" aria-selected="false" data-filter="<?= e(slugify($d)) ?>"><?= e($d) ?></button><?php endforeach; ?>
      </div>
      <?php endif; ?>
    </div>
    <?php if (!$jobs): ?>
      <div class="empty reveal"><h3>No openings right now</h3><p>Send your CV to <a href="mailto:<?= e(setting('contact.careers_email')) ?>"><?= e(setting('contact.careers_email')) ?></a> and we'll reach out when a role fits.</p></div>
    <?php else: ?>
    <div class="jobs" data-filter-target>
      <?php foreach ($jobs as $j): ?>
        <a class="job-row reveal" href="<?= e(url('careers/' . $j['slug'])) ?>" data-cat="<?= e(slugify($j['department'] ?? '')) ?>">
          <span class="job-icon"><?= icon('brief') ?></span>
          <span class="job-main"><strong><?= e($j['title']) ?></strong><small><?= e($j['summary'] ?? '') ?></small></span>
          <span class="job-tags">
            <span class="tag"><?= icon('pin') ?><?= e($j['location']) ?></span>
            <span class="tag"><?= icon('clock') ?><?= e($j['schedule'] ?: $j['type']) ?></span>
          </span>
          <span class="job-go"><?= icon('arrow') ?></span>
        </a>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>
  </div>
</section>
<?php layout_foot();
