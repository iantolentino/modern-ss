<?php
$crumbs = [['', 'Home'], ['team', 'Our Team']];
$people = items('team');
$leaders = array_values(array_filter($people, function ($p) { return ($p['group'] ?? '') === 'leadership'; }));
$crew = array_values(array_filter($people, function ($p) { return ($p['group'] ?? '') !== 'leadership'; }));
$depts = array_values(array_unique(array_filter(array_column($crew, 'department'))));
layout_head([
    'title' => 'Our Team & Executives | Strata Staff Global',
    'description' => 'Meet the executives, managers, trainers and team leaders who support Strata Staff Global\'s strata agency partners in Australia and Canada.',
    'path' => 'team',
    'schema' => [breadcrumb_schema($crumbs)],
], 'team');
page_hero('Our people', 'Our awesome team', 'The management and leadership team supporting our strata agency partners, from task-level detail to capacity and performance reviews.', $crumbs);
?>
<?php if ($leaders): ?>
<section class="section" id="executives">
  <div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">Leadership</p><h2>Executives</h2></div>
    <div class="people people-lg"><?php foreach ($leaders as $p) require __DIR__ . '/partials/person.php'; ?></div>
  </div>
</section>
<?php endif; ?>
<?php if ($crew): ?>
<section class="section section-tint" id="team">
  <div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">Management &amp; team leaders</p><h2>The people behind your team</h2></div>
    <?php if (count($depts) > 1): ?>
    <div class="tabs tabs-scroll reveal" role="tablist" aria-label="Department">
      <button role="tab" aria-selected="true" data-filter="all">All</button>
      <?php foreach ($depts as $d): ?><button role="tab" aria-selected="false" data-filter="<?= e(slugify($d)) ?>"><?= e($d) ?></button><?php endforeach; ?>
    </div>
    <?php endif; ?>
    <div class="people" data-filter-target><?php foreach ($crew as $p) require __DIR__ . '/partials/person.php'; ?></div>
  </div>
</section>
<?php endif; ?>
<section class="section">
  <div class="wrap join-card reveal">
    <div><h2>Want to join the team?</h2><p>We're looking for results-oriented, outcome-focused people.</p></div>
    <a class="btn btn-primary btn-lg" href="<?= e(url('careers')) ?>">See open roles <?= icon('arrow') ?></a>
  </div>
</section>
<?php layout_foot();
