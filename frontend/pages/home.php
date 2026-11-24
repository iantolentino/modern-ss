<?php
$hero = setting('hero', []);
$c = setting('contact', []);
$services = items('services');
$testimonials = items('testimonials');
$posts = array_slice(items('insights'), 0, 3);
$faqs = items('faqs');
$platforms = items('logos', function ($l) { return ($l['group'] ?? '') === 'platform'; });
$members = items('logos', function ($l) { return ($l['group'] ?? '') === 'membership'; });
$stats = setting('stats', []);
$stock = 'assets/media/stock/';

// The featured quote is the one with a growth story; the rest follow it
$featured = null;
foreach ($testimonials as $t) if (stripos($t['quote'] ?? '', '21 headcount') !== false) { $featured = $t; break; }
$featured = $featured ?: ($testimonials[0] ?? null);
$moreQuotes = array_slice(array_values(array_filter($testimonials, function ($t) use ($featured) { return $t !== $featured; })), 0, 3);

$faqSchema = [
    '@context' => 'https://schema.org', '@type' => 'FAQPage',
    'mainEntity' => array_map(function ($f) {
        return ['@type' => 'Question', 'name' => $f['q'], 'acceptedAnswer' => ['@type' => 'Answer', 'text' => $f['a']]];
    }, $faqs),
];
$siteSchema = ['@context' => 'https://schema.org', '@type' => 'WebSite', 'name' => setting('site_name'), 'url' => abs_url(''), 'publisher' => ['@id' => abs_url('#org')]];
$heroImg = media($hero['image'] ?? '', media($stock . 'hero-tower.webp'));

layout_head([
    'title' => setting('seo.home_title'),
    'description' => setting('seo.home_description'),
    'path' => '',
    'schema' => $faqs ? [$siteSchema, $faqSchema] : [$siteSchema],
    'body_class' => 'is-home',
    'preload' => $heroImg,
]);
?>
<section class="fh-hero">
  <div class="fh-hero-panel">
    <h1><?= e($hero['title'] ?? '') ?></h1>
    <p class="fh-hero-sub"><?= e($hero['subtitle'] ?? '') ?></p>
    <div class="fh-hero-actions">
      <a class="btn btn-light btn-lg" href="<?= e(url('contact')) ?>">Book a discovery call <?= icon('arrow') ?></a>
      <a class="fh-link-light" href="#roles">See the roles</a>
    </div>
    <?php if ($testimonials): ?>
    <div class="fh-trust">
      <div class="stack"><?php foreach (array_slice($testimonials, 0, 4) as $t): ?><?= avatar($t, 'stack-img') ?><?php endforeach; ?></div>
      <p><?= e($hero['eyebrow'] ?? '') ?></p>
    </div>
    <?php endif; ?>
  </div>
  <div class="fh-hero-media">
    <div class="fh-facade" data-facade>
      <img src="<?= e($heroImg) ?>" alt="Residential apartment tower with rows of balconies" width="900" height="1600" fetchpriority="high">
    </div>
    <?php if (plugin_enabled('capacity-calculator')): ?>
    <form class="fh-calc" data-calc onsubmit="return false" aria-label="Quick capacity estimate">
      <p class="fh-calc-line">
        <label><span class="sr-only">Strata managers</span><input type="number" name="managers" min="1" max="500" value="6" inputmode="numeric"></label> managers
        <span aria-hidden="true">&times;</span>
        <label><span class="sr-only">Admin hours per manager each week</span><input type="number" name="hours" min="0" max="60" value="10" inputmode="numeric"></label> admin hrs a week
        <span aria-hidden="true">=</span>
        <output aria-live="polite"><strong data-calc-hours>2,880 hrs</strong> a year</output>
        <input type="hidden" name="weeks" value="48">
      </p>
      <p class="fh-calc-note"><span data-calc-copy>That's roughly 72 full 40-hour work weeks of manager time.</span> <a href="<?= e(url('capacity-calculator')) ?>">Full calculator</a></p>
    </form>
    <?php endif; ?>
  </div>
</section>

<?php if ($platforms): ?>
<section class="fh-platforms" aria-labelledby="platforms-title">
  <div class="wrap fh-platforms-inner">
    <h2 id="platforms-title">Trained on the strata platforms you already run</h2>
    <ul>
      <?php foreach ($platforms as $l): ?>
        <li><?php if (!empty($l['image'])): ?><img src="<?= e(media($l['image'])) ?>" alt="<?= e($l['name']) ?>" height="32" loading="lazy"><?php else: ?><span><?= e($l['name']) ?></span><?php endif; ?></li>
      <?php endforeach; ?>
    </ul>
  </div>
</section>
<?php endif; ?>

<section class="fh-directory" id="roles">
  <div class="wrap">
    <div class="fh-head">
      <h2>Roles trained for strata work</h2>
      <div class="tabs" role="tablist" aria-label="Role category">
        <button role="tab" aria-selected="true" data-filter="strata">Strata management</button>
        <button role="tab" aria-selected="false" data-filter="pm">Property management</button>
      </div>
    </div>
    <div class="fh-directory-grid">
      <ol class="fh-board" data-filter-target data-board>
        <?php $lot = ['strata' => 0, 'pm' => 0]; foreach ($services as $s): $n = ++$lot[$s['category']]; ?>
          <li data-cat="<?= e($s['category']) ?>">
            <a href="<?= e(url('solutions/' . $s['slug'])) ?>" data-img="<?= e(media($s['image'])) ?>">
              <span class="fh-lot">Lot <?= sprintf('%02d', $n) ?></span>
              <span class="fh-role"><strong><?= e($s['title']) ?></strong><span><?= e($s['summary']) ?></span></span>
              <?= icon('arrow') ?>
            </a>
          </li>
        <?php endforeach; ?>
      </ol>
      <figure class="fh-board-photo" aria-hidden="true">
        <img src="<?= e(media($services[0]['image'] ?? '')) ?>" alt="" width="600" height="760" loading="lazy" data-board-img>
      </figure>
    </div>
  </div>
</section>

<?php if ($stats): ?>
<section class="fh-proof" aria-label="Strata Staff in numbers">
  <img class="fh-proof-img" src="<?= e(media($stock . 'balcony-rows.webp')) ?>" alt="" width="2400" height="1546" loading="lazy">
  <div class="wrap">
    <dl class="fh-plaque">
      <?php foreach ($stats as $s): ?>
        <div><dt><?= e($s['label']) ?></dt><dd><span data-count="<?= e($s['value']) ?>"><?= e($s['value']) ?></span><?= e($s['suffix']) ?></dd></div>
      <?php endforeach; ?>
    </dl>
  </div>
</section>
<?php endif; ?>

<section class="fh-work">
  <div class="wrap fh-work-grid">
    <div class="fh-work-copy">
      <h2>The back-office work we take off your desk</h2>
      <p>From levy queries and Section 184 certificates to AGM agendas and by-law notices: this is the back-office work our teams process for agencies every day.</p>
      <a class="btn btn-light" href="<?= e(url('solutions')) ?>">See all solutions <?= icon('arrow') ?></a>
    </div>
    <ul class="fh-tasks" aria-label="Strata tasks we handle">
      <?php foreach (['Levy queries', 'Section 184', 'Section 22', 'AGM', 'EGM', 'By-law notices', 'Strata roll', 'Reconciliation', 'Payment runs', 'Debt recovery', 'Financial reports', 'Invoicing', 'Bank downloads', 'Insurance claims', 'Work orders', 'AFSS', 'Asbestos', 'Compliance', 'Valuations', 'Drafting letters', 'Data updates', 'Archiving'] as $t): ?>
        <li><?= e($t) ?></li>
      <?php endforeach; ?>
    </ul>
  </div>
</section>

<section class="fh-process">
  <div class="wrap fh-process-grid">
    <figure class="fh-process-photo"><img src="<?= e(media($stock . 'team-collab.webp')) ?>" alt="Offshore team members working through a task together" width="2000" height="1500" loading="lazy"></figure>
    <div>
      <h2>From first call to a working team</h2>
      <ol class="fh-steps">
        <?php foreach ([
            ['Book a discovery call', 'A free 30-minute call with our solutions team about your staffing needs and goals.'],
            ['We design your solution', 'A capacity plan matching the right roles, skills and strata platforms to your business.'],
            ['Meet your offshore team', 'We select, vet and train your staff on strata operations before they start.'],
            ['Scale with confidence', 'Your team works inside your workflows and grows as your portfolio does.'],
        ] as $i => $st): ?>
          <li><span class="fh-step-n"><?= $i + 1 ?></span><div><h3><?= e($st[0]) ?></h3><p><?= e($st[1]) ?></p></div></li>
        <?php endforeach; ?>
      </ol>
    </div>
  </div>
</section>

<?php if ($featured): ?>
<section class="fh-voices" id="clients">
  <div class="wrap">
    <figure class="fh-quote">
      <blockquote><p><?= e($featured['quote']) ?></p></blockquote>
      <figcaption><?= avatar($featured, 'fh-quote-avatar') ?><span><strong><?= e($featured['name']) ?></strong><?= e(implode(', ', array_filter([$featured['title'] ?? '', ($featured['company'] ?? '') !== ($featured['name'] ?? '') ? ($featured['company'] ?? '') : '']))) ?></span></figcaption>
    </figure>
    <?php if ($moreQuotes): ?>
    <div class="fh-quotes">
      <?php foreach ($moreQuotes as $t): ?>
        <figure>
          <blockquote><p><?= e(sentences($t['quote'], 260)) ?></p></blockquote>
          <figcaption><strong><?= e($t['name']) ?></strong><?= e(implode(', ', array_filter([$t['title'] ?? '', ($t['company'] ?? '') !== ($t['name'] ?? '') ? ($t['company'] ?? '') : '']))) ?></figcaption>
        </figure>
      <?php endforeach; ?>
    </div>
    <a class="text-link" href="<?= e(url('clients')) ?>">Read all <?= count($testimonials) ?> client stories <?= icon('arrow') ?></a>
    <?php endif; ?>
  </div>
</section>
<?php endif; ?>

<section class="fh-places" aria-labelledby="places-title">
  <div class="wrap"><h2 id="places-title">Serving strata agencies in Australia and Canada</h2></div>
  <div class="fh-places-grid">
    <figure>
      <img src="<?= e(media($stock . 'sydney-harbour.webp')) ?>" alt="Apartment buildings around Sydney Harbour" width="2400" height="1800" loading="lazy">
      <figcaption><strong>Australia</strong><span><?= e($c['au_address'] ?? '') ?></span><?php if (!empty($c['au_phone'])): ?><a href="tel:<?= e(preg_replace('/[^\d+]/', '', $c['au_phone'])) ?>"><?= e($c['au_phone']) ?></a><?php endif; ?></figcaption>
    </figure>
    <figure>
      <img src="<?= e(media($stock . 'vancouver-harbour.webp')) ?>" alt="Vancouver waterfront and residential towers" width="2400" height="986" loading="lazy">
      <figcaption><strong>Canada</strong><span><?= e($c['ca_address'] ?? '') ?></span><?php if (!empty($c['ca_phone'])): ?><a href="tel:<?= e(preg_replace('/[^\d+]/', '', $c['ca_phone'])) ?>"><?= e($c['ca_phone']) ?></a><?php endif; ?></figcaption>
    </figure>
  </div>
</section>

<?php if ($members): ?>
<section class="fh-members" aria-labelledby="members-title">
  <div class="wrap fh-members-inner">
    <h2 id="members-title">Members of the associations that set strata standards</h2>
    <ul>
      <?php foreach ($members as $l): $tag = !empty($l['url']) ? 'a' : 'div'; ?>
        <li><<?= $tag ?> class="fh-member"<?= $tag === 'a' ? ' href="' . e($l['url']) . '" target="_blank" rel="noopener"' : '' ?>>
          <img src="<?= e(media($l['image'])) ?>" alt="" loading="lazy" height="56">
          <span><?= e($l['name']) ?></span>
        </<?= $tag ?>></li>
      <?php endforeach; ?>
    </ul>
  </div>
</section>
<?php endif; ?>

<?php if ($posts): ?>
<section class="section section-tint">
  <div class="wrap">
    <div class="fh-head">
      <h2>News from Strata Staff</h2>
      <a class="text-link" href="<?= e(url('insights')) ?>">All insights <?= icon('arrow') ?></a>
    </div>
    <div class="post-grid">
      <?php foreach ($posts as $p) require ROOT_DIR . '/insights/post-card.php'; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<?php if ($faqs): ?>
<section class="section">
  <div class="wrap faq-grid">
    <div>
      <h2>Common questions</h2>
      <p class="lede">Anything else? <a href="<?= e(url('contact')) ?>">Ask our solutions team.</a></p>
    </div>
    <div class="faq">
      <?php foreach ($faqs as $i => $f): ?>
        <details<?= $i === 0 ? ' open' : '' ?>><summary><?= e($f['q']) ?><?= icon('plus') ?></summary><p><?= e($f['a']) ?></p></details>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>
<?php layout_foot();
