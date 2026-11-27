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
    <p class="lede">Answer three quick questions to see how much of your strata managers' time goes on routine admin, and what that time is worth. It takes under a minute.</p>
  </div>
</section>

<?php $o = setting('offer', []); $yearAu = confirmed($o['from_year'] ?? ''); $yearCa = confirmed($o['from_year_ca'] ?? ''); ?>
<section class="section hct-section">
  <div class="wrap hct-tool" data-calc-scope>
    <form class="hct-quiz" data-calc onsubmit="return false" aria-labelledby="hct-quiz-title" data-year-au="<?= e($yearAu) ?>" data-year-ca="<?= e($yearCa) ?>">
      <h2 id="hct-quiz-title" class="h3">Your agency in three numbers</h2>
      <p class="hct-quiz-sub">Rough numbers are fine. Your result updates as you type.</p>

      <div class="hct-q">
        <span class="hct-num" aria-hidden="true">1</span>
        <div>
          <label class="hct-q-label" for="q-managers">How many strata managers work in your agency?</label>
          <span class="hct-field"><input id="q-managers" type="number" name="managers" min="1" max="500" value="6" inputmode="numeric"><span>managers</span></span>
        </div>
      </div>

      <div class="hct-q">
        <span class="hct-num" aria-hidden="true">2</span>
        <div>
          <label class="hct-q-label" for="q-hours">On a typical day, how many hours does each manager spend on routine admin?</label>
          <p class="hct-hint" id="q-hours-hint">Reconciliations, invoices, data updates, archiving and routine emails. Most managers tell us 1 to 3 hours.</p>
          <span class="hct-field"><input id="q-hours" type="number" name="hours" min="0" max="10" step="0.5" value="2" inputmode="decimal" aria-describedby="q-hours-hint"><span>hours a day</span></span>
        </div>
      </div>

      <div class="hct-q">
        <span class="hct-num" aria-hidden="true">3</span>
        <div>
          <label class="hct-q-label" for="q-cost">What does an hour of a manager's time cost you? <small>Optional</small></label>
          <p class="hct-hint" id="q-cost-hint">Salary plus on-costs, divided by hours worked. Leave it blank if you're not sure.</p>
          <div class="hct-cost-row">
            <div class="hct-currency" role="radiogroup" aria-label="Currency">
              <label><input type="radio" name="currency" value="AUD" checked><span>A$ Australia</span></label>
              <label><input type="radio" name="currency" value="CAD"><span>C$ Canada</span></label>
            </div>
            <span class="hct-field"><span data-calc-symbol>A$</span><input id="q-cost" type="number" name="cost" min="0" max="1000" step="1" placeholder="60" inputmode="decimal" aria-describedby="q-cost-hint"><span>an hour</span></span>
          </div>
        </div>
      </div>

      <button type="button" class="btn btn-primary btn-lg btn-block calc-run" data-calc-run>Show my result <?= icon('arrow') ?></button>
    </form>

    <aside class="hct-answer" data-calc-result aria-live="polite" aria-label="Your result">
      <p class="hct-answer-label">Your result</p>
      <p class="hct-big"><span data-calc-hours>2,880</span> hours a year</p>
      <p class="hct-answer-text">That is how long your managers spend on routine admin: about <strong><span data-calc-weeks>72</span> full working weeks</strong> of manager time.</p>
      <p class="hct-answer-text" data-calc-money hidden>At <span data-calc-rate></span> an hour, that time costs you <strong data-calc-cost></strong> a year.</p>
      <div class="hct-team"><?= icon('users') ?><p>It is the work of about <strong><span data-calc-team>1.5</span> full-time specialists</strong>. An offshore team can take it on, so your managers get those hours back.</p></div>
      <?php if ($yearAu !== ''): ?><p class="hct-answer-text">A dedicated offshore team costs from <strong data-calc-indicative><?= $yearAu ?></strong> a year, all-inclusive.</p><?php endif; ?>
      <a class="btn btn-light btn-block" href="<?= e(url('contact')) ?>#book">Book a free 30-minute call <?= icon('arrow') ?></a>

      <form class="hct-mail" method="post" action="<?= e(url('hidden-capacity-test')) ?>#email-result" id="email-result" data-calc-mail>
        <?= csrf_field() ?><input type="hidden" name="form" value="capacity">
        <input type="hidden" name="result_hours" value="2880"><input type="hidden" name="result_inputs" value="">
        <div class="hp-field" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
        <?php if ($mailSent): ?>
          <p class="hct-mail-ok" role="status"><?= icon('check') ?> Sent. Check your inbox for your result.</p>
        <?php else: ?>
          <label for="hct-email">Or email this result to yourself</label>
          <?php if ($mailErrors): ?><p class="hct-mail-error" role="alert"><?= e(implode(' ', $mailErrors)) ?></p><?php endif; ?>
          <div class="hct-mail-row"><input id="hct-email" type="email" name="email" required autocomplete="email" placeholder="you@agency.com.au"><button class="btn btn-ghost-light" type="submit">Send</button></div>
        <?php endif; ?>
      </form>

      <details class="hct-how">
        <summary>How we work this out</summary>
        <p>Managers × hours a day × 5 days × 48 working weeks (four weeks are left out for leave and public holidays). One full-time specialist works about 1,920 hours a year, so the team size is the hours divided by 1,920.</p>
      </details>
    </aside>
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
