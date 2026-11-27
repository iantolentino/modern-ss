<?php
start_session(); // the "Email me my result" form needs its CSRF cookie before output
require BACKEND_DIR . '/forms/capacity.php';
$crumbs = [['', 'Home'], ['hidden-capacity-test', 'Hidden Capacity Test']];
$quotes = items('testimonials');
$roles = items('services', function ($s) { return $s['category'] === 'strata'; });
$app = [
    '@context' => 'https://schema.org', '@type' => 'WebApplication',
    'name' => 'Hidden Capacity Test', 'applicationCategory' => 'BusinessApplication', 'operatingSystem' => 'Any',
    'url' => abs_url('hidden-capacity-test'), 'offers' => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'AUD'],
    'description' => 'Work out how many strata manager hours a year go on routine work, what that costs, and the offshore team it would take.',
    'provider' => ['@id' => abs_url('#org')],
];
layout_head([
    'title' => 'Hidden Capacity Test for Strata Agencies | Strata Staff Global',
    'description' => 'How many hours are your strata managers spending on routine work, and what does it cost? Two numbers, result in seconds, no sign-up.',
    'path' => 'hidden-capacity-test',
    'schema' => [breadcrumb_schema($crumbs), $app],
], 'hidden-capacity-test');
$c = setting('contact', []);
?>
<section class="page-hero hct-hero">
  <div class="wrap">
    <h1>The Hidden Capacity Test</h1>
    <p class="lede">How many hours are your managers spending on work that doesn't need their experience, and what is it costing you? Enter a few numbers and see what it adds up to.</p>
  </div>
</section>

<section class="section hct-section">
  <div class="wrap">
    <?php $calcId = 'calc-main'; $calcFull = true; require PLUGINS_DIR . '/capacity-calculator/widget.php'; ?>
    <div class="hct-next">
      <div class="hct-panel">
        <h2 class="h4">Talk it through with us</h2>
        <p>We'll look at your numbers, your platforms and the roles that would take this work on.</p>
        <a class="btn btn-primary" href="<?= e(url('contact')) ?>">Book a 30-minute discovery call <?= icon('arrow') ?></a>
      </div>
      <form class="hct-panel hct-mail" method="post" action="<?= e(url('hidden-capacity-test')) ?>#email-result" id="email-result" data-calc-mail>
        <?= csrf_field() ?><input type="hidden" name="form" value="capacity">
        <input type="hidden" name="result_hours" value="2880"><input type="hidden" name="result_inputs" value="">
        <div class="hp-field" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
        <h2 class="h4"><label for="hct-email">Email me my result</label></h2>
        <?php if ($mailSent): ?>
          <p class="notice ok" role="status"><?= icon('check') ?> Sent. Check your inbox for your result.</p>
        <?php else: ?>
          <p>We'll send the numbers above so you can share them with your team.</p>
          <?php if ($mailErrors): ?><p class="notice" role="alert"><?= e(implode(' ', $mailErrors)) ?></p><?php endif; ?>
          <div class="hct-mail-row"><input id="hct-email" type="email" name="email" required autocomplete="email" placeholder="you@agency.com.au"><button class="btn btn-outline" type="submit">Send</button></div>
        <?php endif; ?>
      </form>
      <div class="hct-panel">
        <h2 class="h4">How we work this out</h2>
        <p>Managers × daily routine hours × 5 days × 48 working weeks a year, allowing four weeks for leave and public holidays. Team size divides the hours by 1,920 working hours a year.</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head center reveal">
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
      <h2>Don't hire your next manager just to solve an admin problem</h2>
      <p class="lede">Before adding another onshore position, look at the workload underneath the role. Some of it may be better handled by dedicated offshore capacity.</p>
    </div>
    <?php if ($quotes): ?>
    <div class="quote-rotator reveal" data-rotate aria-live="polite">
      <?php foreach ($quotes as $i => $q): ?>
      <figure class="quote-card quote-feature"<?= $i ? ' hidden' : '' ?>>
        <blockquote><p><?= e(sentences($q['quote'], 320)) ?></p></blockquote>
        <figcaption><?= avatar($q, 'quote-avatar') ?><span><strong><?= e($q['name']) ?></strong><small><?= e(quote_byline($q)) ?></small></span></figcaption>
      </figure>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>
  </div>
</section>
<?php layout_foot();
