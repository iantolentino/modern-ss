<?php
/** Canada (BC) page, competitive review slide 24. Hours, CAD pricing and Canadian stories are placeholders. */
$c = setting('contact', []);
$ca = setting('canada', []);
$offer = setting('offer', []);
$cci = null;
foreach (items('logos', function ($l) { return ($l['group'] ?? '') === 'membership'; }) as $l) if (stripos($l['name'], 'Canadian') !== false || stripos($l['name'], 'CCI') !== false) $cci = $l;
$crumbs = [['', 'Home'], ['canada', 'Canada']];
layout_head([
    'title' => 'Offshore Strata Staff for BC Strata Managers | Strata Staff Canada',
    'description' => 'Strata-trained offshore teams for British Columbia strata management companies: Form B and Form F requests, depreciation-report admin, CRT paperwork and owner enquiries.',
    'path' => 'canada',
    'schema' => [breadcrumb_schema($crumbs)],
    'locale' => 'en_CA',
], 'canada');
?>
<section class="hero hero-test hero-ca">
  <div class="hero-glow" aria-hidden="true"></div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="<?= e(url()) ?>">Home</a></li><li><span aria-current="page">Canada</span></li></ol></nav>
      <p class="hero-place"><?= icon('pin') ?> Strata Staff Canada · Vancouver</p>
      <h1>Grow your portfolio <span class="hero-accent">without growing your payroll.</span></h1>
      <p class="hero-sub">Strata-trained offshore teams for BC strata management companies: Form B and Form F requests, depreciation-report admin, CRT paperwork and owner enquiries<?= ph($ca['hours'] ?? '') !== '' ? ', with ' . lcfirst(ph($ca['hours'])) : '' ?>.</p>
      <div class="hero-actions">
        <a class="btn btn-primary btn-lg" href="<?= e(url('hidden-capacity-test')) ?>"><?= icon('clock') ?> Take the test in C$</a>
        <a class="btn btn-ghost-light btn-lg" href="<?= e(url('contact')) ?>">Book a 30-minute discovery call</a>
      </div>
      <ul class="hero-facts">
        <?php if ($cci): ?><li><?= icon('check') ?> Member, CCI BC Chapter</li><?php endif; ?>
        <?php if (ph($ca['pricing'] ?? '') !== ''): ?><li><?= icon('check') ?> <?= ph($ca['pricing']) ?><?= ph($offer['from_month_ca'] ?? '') !== '' ? ', from ' . ph($offer['from_month_ca']) . '/month' : '' ?></li><?php endif; ?>
        <?php if (ph($ca['stories'] ?? '') !== ''): ?><li><?= icon('check') ?> <?= ph($ca['stories']) ?></li><?php endif; ?>
      </ul>
    </div>
    <div class="ca-tasks calc-card">
      <h2 class="calc-title">BC tasks we handle</h2>
      <p class="calc-intro">Under the Strata Property Act</p>
      <ul class="check-list">
        <?php foreach (lines((string) ($ca['tasks'] ?? '')) as $t): ?><li><?= icon('check') ?><span><?= ph($t) ?></span></li><?php endforeach; ?>
      </ul>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div>
      <h2>A Vancouver office, a team in Pampanga</h2>
      <p class="lede">Our Canadian clients work with our Vancouver office. Their offshore team works from our Marisol Office in <?= e((string) setting('facts.location')) ?>, trained in strata before they start.</p>
      <ul class="facts-list">
        <li><span>Vancouver office</span><strong><?= e($c['ca_address'] ?? '') ?></strong></li>
        <li><span>Phone</span><strong><a href="tel:<?= e(preg_replace('/[^\d+]/', '', $c['ca_phone'] ?? '')) ?>"><?= e($c['ca_phone'] ?? '') ?></a></strong></li>
        <li><span>Email</span><strong><a href="mailto:<?= e($c['email'] ?? '') ?>"><?= e($c['email'] ?? '') ?></a></strong></li>
      </ul>
    </div>
    <?php if ($cci): ?>
    <div class="ca-member">
      <img src="<?= e(media($cci['image'])) ?>" alt="<?= e($cci['name']) ?>" loading="lazy" height="96">
      <p><strong>Member of the <?= e($cci['name']) ?></strong><?php if (!empty($cci['note'])): ?><br><?= e($cci['note']) ?><?php endif; ?></p>
    </div>
    <?php endif; ?>
  </div>
</section>
<?php layout_foot();
