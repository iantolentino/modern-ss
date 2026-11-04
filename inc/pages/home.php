<?php
$hero = setting('hero', []);
$c = setting('contact', []);
$services = items('services');
$testimonials = items('testimonials');
$posts = array_slice(items('insights'), 0, 3);
$faqs = items('faqs');
$platforms = items('logos', function ($l) { return ($l['group'] ?? '') === 'platform'; });
$members = items('logos', function ($l) { return ($l['group'] ?? '') === 'membership'; });
$rotating = array_column(array_filter($services, function ($s) { return $s['category'] === 'strata'; }), 'title');

$faqSchema = [
    '@context' => 'https://schema.org', '@type' => 'FAQPage',
    'mainEntity' => array_map(function ($f) {
        return ['@type' => 'Question', 'name' => $f['q'], 'acceptedAnswer' => ['@type' => 'Answer', 'text' => $f['a']]];
    }, $faqs),
];
$siteSchema = ['@context' => 'https://schema.org', '@type' => 'WebSite', 'name' => setting('site_name'), 'url' => abs_url(''), 'publisher' => ['@id' => abs_url('#org')]];

layout_head([
    'title' => setting('seo.home_title'),
    'description' => setting('seo.home_description'),
    'path' => '',
    'schema' => $faqs ? [$siteSchema, $faqSchema] : [$siteSchema],
    'body_class' => 'is-home',
    'preload' => media($hero['image'] ?? ''),
]);
?>
<section class="hero">
  <div class="hero-glow" aria-hidden="true"></div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="hero-kicker"><?= e($hero['eyebrow'] ?? '') ?></p>
      <h1><?= e($hero['title'] ?? '') ?></h1>
      <?php if ($rotating): ?>
      <p class="rotator">Hire a dedicated <span class="rotator-words" data-words="<?= e(json_encode(array_values($rotating))) ?>"><span class="rotator-word"><?= e($rotating[0]) ?></span></span></p>
      <?php endif; ?>
      <p class="hero-sub"><?= e($hero['subtitle'] ?? '') ?></p>
      <div class="hero-actions">
        <a class="btn btn-primary btn-lg" href="<?= e(url('contact')) ?>">Talk to us <?= icon('arrow') ?></a>
        <?php if (!empty($c['scorecard_url'])): ?><a class="btn btn-ghost-light btn-lg" href="<?= e($c['scorecard_url']) ?>">Take the capacity test</a><?php endif; ?>
      </div>
      <?php if ($testimonials): ?>
      <div class="hero-trust">
        <div class="stack"><?php foreach (array_slice($testimonials, 0, 4) as $t): ?><?= avatar($t, 'stack-img') ?><?php endforeach; ?></div>
        <p><strong>Trusted by strata agencies</strong> across Australia &amp; Canada</p>
      </div>
      <?php endif; ?>
    </div>
    <div class="hero-visual">
      <div class="hv-card hv-main"><img src="<?= e(media($hero['image'] ?? '')) ?>" alt="Strata Staff offshore strata administrative specialist" width="420" height="520" fetchpriority="high"></div>
      <div class="hv-card hv-side hv-a"><img src="<?= e(media($hero['image_2'] ?? '')) ?>" alt="Strata Staff offshore strata accountant" width="220" height="260" loading="lazy"></div>
      <div class="hv-card hv-side hv-b"><img src="<?= e(media($hero['image_3'] ?? '')) ?>" alt="Strata Staff offshore executive assistant" width="220" height="260" loading="lazy"></div>
      <div class="float-chip fc-1" aria-hidden="true"><?= icon('check') ?> Strata-trained and ready</div>
      <div class="float-chip fc-2" aria-hidden="true"><span class="big">98%</span> retention rate</div>
      <div class="float-chip fc-3" aria-hidden="true"><span class="big">200k+</span> tasks a month</div>
    </div>
  </div>
</section>

<?php if ($platforms): ?>
<section class="platforms" aria-labelledby="platforms-title">
  <h2 id="platforms-title" class="platforms-label">Familiar with 13+ strata platforms</h2>
  <div class="marquee"><div class="marquee-track">
    <?php foreach (array_merge($platforms, $platforms) as $i => $l): $dupe = $i >= count($platforms); ?>
      <span class="logo-item"<?= $dupe ? ' aria-hidden="true"' : '' ?>><?php if (!empty($l['image'])): ?><img src="<?= e(media($l['image'])) ?>" alt="<?= $dupe ? '' : e($l['name']) ?>" height="36"><?php else: ?><?= e($l['name']) ?><?php endif; ?></span>
    <?php endforeach; ?>
  </div></div>
</section>
<?php endif; ?>

<section class="section section-stats">
  <div class="wrap">
    <div class="stats reveal">
      <?php foreach (setting('stats', []) as $s): ?>
        <div class="stat">
          <span class="stat-num" data-count="<?= e($s['value']) ?>"><?= e($s['value']) ?></span><span class="stat-suf"><?= e($s['suffix']) ?></span>
          <span class="stat-label"><?= e($s['label']) ?></span>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="section calc-teaser">
  <div class="wrap calc-teaser-grid">
    <div class="reveal">
      <p class="eyebrow">Capacity calculator</p>
      <h2>How much manager time is tied up in admin?</h2>
      <p class="lede">Enter two numbers to see the back-office hours your strata managers could get back each year.</p>
      <a class="text-link" href="<?= e(url('capacity-calculator')) ?>">See the full capacity calculator <?= icon('arrow') ?></a>
    </div>
    <div class="reveal"><?php $calcId = 'calc-home'; $calcFull = false; require __DIR__ . '/partials/calculator.php'; ?></div>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div class="split-img reveal">
      <img src="<?= e(media('assets/media/site/the-strata-staff-difference.webp')) ?>" alt="Strata Staff team members at work" width="560" height="560" loading="lazy">
      <div class="img-badge"><span class="big">Since 2019</span> serving strata agencies</div>
    </div>
    <div class="reveal">
      <p class="eyebrow">The Strata Staff difference</p>
      <h2>High-performing teams, trained for strata</h2>
      <p class="lede">Our staff are not generalists. They are trained specifically in strata operations and familiar with Australian and Canadian strata legislation.</p>
      <div class="mini-features">
        <?php foreach ([
            ['spark', 'Strata-trained and ready', 'Teams that understand the dynamics and changing requirements of strata agencies.'],
            ['layers', 'Tailored capacity solutions', 'Add headcount without a proportional rise in overheads.'],
            ['trend', 'Platform expertise', 'StrataMax, Urbanise, Stratafy, MRI, Strata Vault, PIQ, Smata and more.'],
        ] as $f): ?>
          <div class="mini-feature"><span class="feature-icon"><?= icon($f[0]) ?></span><div><h3><?= e($f[1]) ?></h3><p><?= e($f[2]) ?></p></div></div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>

<section class="section section-tint" id="roles">
  <div class="wrap">
    <div class="section-head row reveal">
      <div>
        <p class="eyebrow">Roles built for strata</p>
        <h2>Meet the team behind your team</h2>
        <p class="lede">Skilled professionals, trained in strata workflows and ready to support your agency.</p>
      </div>
      <div class="tabs" role="tablist" aria-label="Role category">
        <button role="tab" aria-selected="true" data-filter="strata">Strata management</button>
        <button role="tab" aria-selected="false" data-filter="pm">Property management</button>
      </div>
    </div>
    <div class="roles" data-filter-target>
      <?php foreach ($services as $s) require __DIR__ . '/partials/role-card.php'; ?>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head center reveal">
      <p class="eyebrow">How it works</p>
      <h2>From first call to a working offshore team</h2>
    </div>
    <ol class="steps">
      <?php foreach ([
          ['calendar', 'Book a discovery call', 'A free 30-minute call with our solutions team about your staffing needs and goals.'],
          ['layers', 'We design your solution', 'A capacity plan matching the right roles, skills and strata platforms to your business.'],
          ['users', 'Meet your offshore team', 'We select, vet and train your staff on strata operations before they start.'],
          ['trend', 'Scale with confidence', 'Your team works inside your workflows and grows as your portfolio does.'],
      ] as $i => $st): ?>
        <li class="step reveal"><span class="step-num"><?= icon($st[0]) ?><em><?= $i + 1 ?></em></span><h3><?= e($st[1]) ?></h3><p><?= e($st[2]) ?></p></li>
      <?php endforeach; ?>
    </ol>
  </div>
</section>

<section class="section section-dark">
  <div class="wrap tasks-grid">
    <div class="reveal">
      <p class="eyebrow light">Day-to-day strata work</p>
      <h2>200,000+ strata tasks a month</h2>
      <p class="lede">From archiving and levy queries to Section 184 certificates and AGM agendas, this is the work our teams process every day.</p>
      <a class="btn btn-light" href="<?= e(url('solutions')) ?>">See all solutions <?= icon('arrow') ?></a>
    </div>
    <ul class="chips reveal" aria-label="Strata tasks we handle">
      <?php foreach (['Reconciliation', 'Payment runs', 'Debt recovery', 'Financial reports', 'Valuations', 'Bank downloads', 'Section 184', 'Section 22', 'Invoicing', 'Levy queries', 'Strata roll', 'Insurance claims', 'Drafting letters', 'Data updates', 'Archiving', 'Asbestos', 'AFSS', 'Work orders', 'By-law notices', 'Compliance', 'AGM', 'EGM'] as $t): ?>
        <li><?= icon('check') ?><?= e($t) ?></li>
      <?php endforeach; ?>
    </ul>
  </div>
</section>

<?php if ($testimonials): ?>
<section class="section" id="clients">
  <div class="wrap">
    <div class="section-head row reveal">
      <div><p class="eyebrow">Our clients have spoken</p><h2>What strata agencies say</h2></div>
      <div class="slider-nav">
        <a class="text-link" href="<?= e(url('clients')) ?>">All testimonials <?= icon('arrow') ?></a>
        <button type="button" class="round-btn" data-slide="-1" aria-label="Previous testimonials"><?= str_replace('<svg', '<svg style="transform:rotate(180deg)"', icon('arrow')) ?></button>
        <button type="button" class="round-btn" data-slide="1" aria-label="Next testimonials"><?= icon('arrow') ?></button>
      </div>
    </div>
    <div class="testimonials" data-slider>
      <?php foreach ($testimonials as $t): ?>
        <figure class="quote-card">
          <blockquote><p><?= e($t['quote']) ?></p></blockquote>
          <figcaption>
            <?= avatar($t, 'quote-avatar') ?>
            <span><strong><?= e($t['name']) ?></strong><small><?= e(implode(', ', array_filter([$t['title'] ?? '', ($t['company'] ?? '') !== ($t['name'] ?? '') ? ($t['company'] ?? '') : '']))) ?></small></span>
          </figcaption>
        </figure>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<?php if ($members): ?>
<section class="members" aria-labelledby="members-title">
  <div class="wrap">
    <div class="section-head center reveal">
      <p class="eyebrow">Industry memberships</p>
      <h2 id="members-title">Part of the strata industry in Australia and Canada</h2>
      <p class="lede">We are members of the associations that set standards for strata and property management.</p>
    </div>
    <ul class="member-logos">
      <?php foreach ($members as $l): $tag = !empty($l['url']) ? 'a' : 'div'; ?>
        <li class="reveal">
          <<?= $tag ?> class="member"<?= $tag === 'a' ? ' href="' . e($l['url']) . '" target="_blank" rel="noopener"' : '' ?>>
            <span class="member-logo"><img src="<?= e(media($l['image'])) ?>" alt="<?= e($l['name']) ?> member" loading="lazy" height="64"></span>
            <span class="member-name"><?= e($l['name']) ?></span>
            <?php if (!empty($l['note'])): ?><small><?= e($l['note']) ?></small><?php endif; ?>
          </<?= $tag ?>>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
</section>
<?php endif; ?>

<?php if ($posts): ?>
<section class="section section-tint">
  <div class="wrap">
    <div class="section-head row reveal">
      <div><p class="eyebrow">Insights</p><h2>News from Strata Staff</h2></div>
      <a class="text-link" href="<?= e(url('insights')) ?>">All insights <?= icon('arrow') ?></a>
    </div>
    <div class="post-grid">
      <?php foreach ($posts as $p) require __DIR__ . '/partials/post-card.php'; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<?php if ($faqs): ?>
<section class="section">
  <div class="wrap faq-grid">
    <div class="reveal">
      <p class="eyebrow">FAQ</p>
      <h2>Common questions</h2>
      <p class="lede">Anything else? <a href="<?= e(url('contact')) ?>">Ask our solutions team.</a></p>
    </div>
    <div class="faq">
      <?php foreach ($faqs as $i => $f): ?>
        <details class="reveal"<?= $i === 0 ? ' open' : '' ?>><summary><?= e($f['q']) ?><?= icon('plus') ?></summary><p><?= e($f['a']) ?></p></details>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>
<?php layout_foot();
