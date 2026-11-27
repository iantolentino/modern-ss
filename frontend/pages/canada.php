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
    'description' => 'Strata-trained offshore teams for British Columbia strata management companies: Form B and Form F requests, depreciation-report admin, Civil Resolution Tribunal paperwork and owner inquiries.',
    'path' => 'canada',
    'schema' => [breadcrumb_schema($crumbs)],
    'locale' => 'en_CA',
], 'canada');
?>
<section class="hero hero-test hero-ca">
  <div class="hero-glow" aria-hidden="true"></div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="hero-eyebrow"><?= icon('pin') ?> Strata Staff Canada · Vancouver</p>
      <h1>Grow your portfolio <span class="hero-accent">without growing your payroll.</span></h1>
      <p class="hero-sub">Strata-trained offshore teams for BC strata management companies: Form B and Form F requests, depreciation-report admin, Civil Resolution Tribunal (CRT) paperwork and owner inquiries<?= ph($ca['hours'] ?? '') !== '' ? ', with ' . ph($ca['hours']) : '' ?>.</p>
      <div class="hero-actions">
        <a class="btn btn-primary btn-lg" href="<?= e(url('hidden-capacity-test')) ?>?currency=CAD"><?= icon('clock') ?> Take the test in C$</a>
        <a class="btn btn-ghost-light btn-lg" href="<?= e(url('contact')) ?>">Book a 30-minute discovery call</a>
      </div>
      <ul class="hero-facts">
        <?php if ($cci): ?><li><?= icon('check') ?> Member, CCI BC Chapter</li><?php endif; ?>
        <?php if (ph($ca['pricing'] ?? '') !== ''): ?><li><?= icon('check') ?> <?= ph($ca['pricing']) ?><?= confirmed($offer['from_month_ca'] ?? '') !== '' ? ', from ' . confirmed($offer['from_month_ca']) . '/month' : '' ?></li><?php endif; ?>
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
  <div class="wrap ca-office">
    <div>
      <h2>A Vancouver office, a team in Pampanga</h2>
      <p class="lede">Our Canadian clients work with our Vancouver office. Their offshore team works from our Marisol Office in <?= e((string) setting('facts.location')) ?>, trained in strata before they start.</p>
      <ul class="ca-contact">
        <li><?= icon('pin') ?><div><span>Vancouver office</span><strong><?= e($c['ca_address'] ?? '') ?></strong></div></li>
        <li><?= icon('phone') ?><div><span>Phone</span><a href="tel:<?= e(preg_replace('/[^\d+]/', '', $c['ca_phone'] ?? '')) ?>"><?= e($c['ca_phone'] ?? '') ?></a></div></li>
        <li><?= icon('mail') ?><div><span>Email</span><a href="mailto:<?= e($c['email'] ?? '') ?>"><?= str_replace('@', '@<wbr>', e($c['email'] ?? '')) ?></a></div></li>
      </ul>
    </div>
    <?php if ($cci): ?>
    <div class="ca-member">
      <img src="<?= e(media($cci['image'])) ?>" alt="<?= e($cci['name']) ?>" loading="lazy" height="88">
      <p><strong>Proud member of the Canadian Condominium Institute, BC Chapter</strong></p>
      <p>CCI brings together condominium and strata owners, managers and professionals across British Columbia.</p>
    </div>
    <?php endif; ?>
  </div>
</section>

<section class="section section-tint">
  <div class="wrap">
    <div class="section-head reveal"><h2>Why BC strata management companies work with us</h2></div>
    <div class="ca-why">
      <article class="benefit-card reveal"><span class="feature-icon"><?= icon('book') ?></span><h3>Trained in strata first</h3><p>Every specialist completes our Foundation Training Program before day one, and our teams are familiar with Australian and Canadian strata legislation.</p></article>
      <article class="benefit-card reveal"><span class="feature-icon"><?= icon('shield') ?></span><h3>Part of the BC strata community</h3><p>We are a member of the Canadian Condominium Institute, BC Chapter, with an office in downtown Vancouver.</p></article>
      <article class="benefit-card reveal"><span class="feature-icon"><?= icon('clock') ?></span><h3>See your numbers in C$</h3><p>The Hidden Capacity Test shows the hours your strata managers spend on routine work, and what that time costs in Canadian dollars.</p><a class="text-link" href="<?= e(url('hidden-capacity-test')) ?>?currency=CAD">Take the test in C$ <?= icon('arrow') ?></a></article>
    </div>
  </div>
</section>
<?php layout_foot();
