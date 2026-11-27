<?php
$services = items('services');
$offer = setting('offer', []);
$crumbs = [['', 'Home'], ['pricing', 'Pricing']];
layout_head([
    'title' => 'Pricing: Offshore Strata Staff by Role | Strata Staff Global',
    'description' => 'Indicative all-inclusive monthly pricing for every strata-trained role: recruitment, Academy training, equipment, HR and payroll included.',
    'path' => 'pricing',
    'schema' => [breadcrumb_schema($crumbs)],
], 'pricing');
page_hero('Pricing', 'Pricing by role', 'An all-inclusive monthly price for each strata-trained specialist. Your exact quote depends on the role, level and hours you need.', $crumbs);
$included = array_filter(array_map('ph', lines((string) ($offer['included'] ?? ''))));
?>
<section class="section">
  <div class="wrap">
    <div class="pricing-intro">
      <div>
        <h2>What every role includes</h2>
        <ul class="check-list">
          <?php foreach ($included as $line): ?><li><?= icon('check') ?><span><?= $line ?></span></li><?php endforeach; ?>
        </ul>
      </div>
      <div class="side-card">
        <h3>Not sure how many you need?</h3>
        <p>The Hidden Capacity Test turns your managers' routine hours into the team size it would take.</p>
        <a class="btn btn-primary btn-block" href="<?= e(url('hidden-capacity-test')) ?>"><?= icon('clock') ?> Take the Hidden Capacity Test</a>
        <?php if (ph($offer['shortlist'] ?? '') !== ''): ?><p class="small muted"><?= ph($offer['shortlist']) ?></p><?php endif; ?>
      </div>
    </div>

    <?php foreach (['strata' => 'Strata Services', 'pm' => 'Strata Staff Plus · property management'] as $cat => $label): $rows = array_filter($services, function ($s) use ($cat) { return $s['category'] === $cat; }); if (!$rows) continue; ?>
    <h2 class="pricing-group"><?= e($label) ?></h2>
    <?php if ($cat === 'pm' && ph($offer['strata_plus'] ?? '') !== ''): ?><p class="roles-note"><?= ph($offer['strata_plus']) ?></p><?php endif; ?>
    <div class="price-table" role="table" aria-label="<?= e($label) ?> pricing">
      <div class="price-row price-head" role="row"><span role="columnheader">Role</span><span role="columnheader">What they handle</span><span role="columnheader">From, per month</span><span role="columnheader"></span></div>
      <?php foreach ($rows as $s): ?>
        <div class="price-row" role="row">
          <span role="cell"><strong><?= e($s['title']) ?></strong></span>
          <span role="cell" class="price-tasks"><?= e(implode(' · ', array_slice(lines((string) ($s['highlights'] ?? '')), 0, 3))) ?></span>
          <span role="cell" class="price-amount"><?= confirmed(role_price($s)) ?: 'On request' ?></span>
          <span role="cell"><a class="text-link" href="<?= e(url('solutions/' . $s['slug'])) ?>">View role <?= icon('arrow') ?></a></span>
        </div>
      <?php endforeach; ?>
    </div>
    <?php endforeach; ?>
    <p class="small muted pricing-note">Prices are indicative; your quote depends on the role, level and hours. Canadian pricing is in CAD<?= confirmed($offer['from_month_ca'] ?? '') !== '' ? ', from ' . confirmed($offer['from_month_ca']) . ' a month' : '' ?>.</p>
  </div>
</section>
<?php layout_foot();
