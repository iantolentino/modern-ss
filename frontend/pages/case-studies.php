<?php
$cs = setting('case_strata_choice', []);
$quote = null;
foreach (items('testimonials') as $t) if (stripos($t['quote'] ?? '', '21 headcount') !== false) { $quote = $t; break; }
$crumbs = [['', 'Home'], ['case-studies', 'Case studies']];
layout_head([
    'title' => 'Case Studies: Strata Agencies Growing with Strata Staff | Strata Staff Global',
    'description' => 'How strata agencies in Australia and Canada built offshore teams with Strata Staff, in numbers and in their own words.',
    'path' => 'case-studies',
    'schema' => [breadcrumb_schema($crumbs)],
], 'case-studies');
page_hero('Case studies', 'Case studies', 'How strata agencies built their offshore teams with us, in numbers and in their own words.', $crumbs);
?>
<section class="section">
  <div class="wrap">
    <a class="case-card" href="<?= e(url('case-studies/strata-choice')) ?>">
      <?php if ($quote): ?><?= avatar($quote, 'case-avatar') ?><?php endif; ?>
      <div>
        <strong>How Strata Choice grew its offshore team from <?= e($cs['from'] ?? '5') ?> to <?= e($cs['to'] ?? '21') ?></strong>
        <span><?= $quote ? e($quote['name'] . ', ' . quote_byline($quote)) : 'Strata Choice' ?> · Partner since <?= e($cs['since'] ?? '2023') ?></span>
      </div>
      <?= icon('arrow') ?>
    </a>
    <p class="muted case-more">More case studies are on the way. Read what <a href="<?= e(url('clients')) ?>">all our clients say</a> in the meantime.</p>
  </div>
</section>
<?php layout_foot();
