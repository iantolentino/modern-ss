<?php
$crumbs = [['', 'Home'], ['about', 'About']];
$leaders = items('team', function ($p) { return ($p['group'] ?? '') === 'leadership'; });
$m = 'assets/media/site/';
layout_head([
    'title' => 'About Strata Staff Global | Strata Offshoring Since 2019',
    'description' => 'Strata Staff Global started in Pampanga in April 2019 and now handles 200,000+ strata tasks a month for agencies in Australia and Canada.',
    'path' => 'about',
    'schema' => [breadcrumb_schema($crumbs)],
], 'about');
page_hero('About us', 'Strata offshoring, built by people who know strata', 'Strata Staff Global is a premium offshore capacity solutions provider serving strata agencies across Australia and Canada. We connect strata businesses with strata-trained teams who are ready to work from day one.', $crumbs);
?>
<section class="section">
  <div class="wrap split">
    <div class="photo-pair reveal">
      <img src="<?= e(media($m . 'about-strata-staff-team.webp')) ?>" alt="Strata Staff team members" width="400" height="510" loading="lazy">
      <img src="<?= e(media($m . 'about-strata-staff-office.webp')) ?>" alt="The Strata Staff office" width="400" height="510" loading="lazy">
    </div>
    <div class="prose reveal">
      <p class="eyebrow">Humble beginnings</p>
      <h2>Three computers and a water dispenser</h2>
      <p>Owners and co-founders Trevor McGuinness and Paul Miller wanted to test a business idea in the Philippines. After several trips and a lot of deliberation, they started beta testing strata administration work offshore, and Strata Staff launched in April 2019 in a small office in Mabalacat, Pampanga.</p>
      <p>The team started with three computers and a water dispenser, and spent countless hours documenting every strata admin task while servicing a few agencies on casual hours. Dan Fabros joined in late 2020 to help with operations and scaling. The business kept going through earthquakes, lockdowns and the COVID-19 pandemic.</p>
      <p>Today Strata Staff handles more than 200,000 individual strata tasks a month, from archiving and levy queries to S184/S22 certificates, financial statements, inbox management and AGM agendas.</p>
    </div>
  </div>
</section>

<section class="section section-tint" id="journey">
  <div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">Our journey</p><h2>2019 to today</h2></div>
    <img class="timeline-img reveal" src="<?= e(media($m . 'strata-staff-timeline-2019-2025.webp')) ?>" alt="Strata Staff timeline from 2019 to 2025" width="1400" height="693" loading="lazy">
  </div>
</section>

<section class="section" id="values">
  <div class="wrap">
    <div class="section-head reveal">
      <p class="eyebrow">Core values</p>
      <h2>Enjoy the journey</h2>
      <p class="lede">We keep an inclusive, intentional workplace guided by our values. Our people shape the quality of every engagement, and we keep improving our service levels to strengthen our partnerships.</p>
    </div>
    <div class="values reveal">
      <?php foreach (['enjoy-the-journey', 'core-values-cc', 'core-values-tdb', 'core-values-aa'] as $v): ?>
        <img src="<?= e(media($m . $v . '.webp')) ?>" alt="Strata Staff core value" width="300" height="420" loading="lazy">
      <?php endforeach; ?>
    </div>
  </div>
</section>

<?php if ($leaders): ?>
<section class="section section-tint">
  <div class="wrap">
    <div class="section-head row reveal">
      <div><p class="eyebrow">Leadership</p><h2>Executives</h2><p class="lede">Experience across strata, corporate finance and business development.</p></div>
      <a class="text-link" href="<?= e(url('team')) ?>">Meet the whole team <?= icon('arrow') ?></a>
    </div>
    <div class="people people-lg">
      <?php foreach ($leaders as $p) require FRONTEND_DIR . '/partials/person.php'; ?>
    </div>
  </div>
</section>
<?php endif; ?>
<?php layout_foot();
