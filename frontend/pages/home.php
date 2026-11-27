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
$offer = setting('offer', []);
$trust = setting('trust', []);
$story = setting('case_strata_choice', []);
$countCat = function (string $cat) use ($services) { return count(array_filter($services, function ($s) use ($cat) { return $s['category'] === $cat; })); };

// The growth story (5 to 21 staff) leads the proof; the other quotes follow it
$featured = null;
foreach ($testimonials as $t) if (stripos($t['quote'] ?? '', '21 headcount') !== false) { $featured = $t; break; }
$sliderQuotes = $featured ? array_values(array_filter($testimonials, function ($t) use ($featured) { return $t !== $featured; })) : $testimonials;
$lead = $sliderQuotes[0] ?? null; // shown large beside the client story
$firms = array_values(array_unique(array_filter(array_map(function ($t) { return $t['company'] ?? ''; }, $testimonials))));

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
]);
// "Grow your portfolio without growing your payroll." : the second half is set in the accent colour
$title = (string) ($hero['title'] ?? '');
$split = preg_split('/(?=\bwithout\b)/i', $title, 2);
?>
<section class="hero hero-test">
  <?php $heroVideo = setting('hero.video') ?: 'https://stratastaffglobal.com/wp-content/uploads/2026/11/ssg-hero-video-720.mp4'; ?>
  <video class="hero-video" autoplay muted loop playsinline preload="metadata" aria-hidden="true" tabindex="-1" poster="https://stratastaffglobal.com/wp-content/uploads/2026/11/ssg-hero-video-poster.jpg"><source src="<?= e($heroVideo) ?>" type="video/mp4"></video>
  <div class="hero-glow" aria-hidden="true"></div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="hero-eyebrow"><?= icon('users') ?> Strata-trained offshore teams for Australian and Canadian agencies</p>
      <h1><?= e($split[0]) ?><?php if (isset($split[1])): ?><span class="hero-accent"><?= e($split[1]) ?></span><?php endif; ?></h1>
      <p class="hero-sub"><?= e($hero['subtitle'] ?? '') ?></p>
      <div class="hero-actions">
        <?php if (plugin_enabled('capacity-calculator')): ?><a class="btn btn-primary btn-lg" href="#hidden-capacity-test"><?= icon('clock') ?> Take the Hidden Capacity Test</a><?php endif; ?>
        <a class="btn btn-ghost-light btn-lg" href="<?= e(url('contact')) ?>">Book a 30-minute discovery call</a>
      </div>
      <ul class="hero-facts">
        <li><?= icon('check') ?> Result in seconds</li>
        <li><?= icon('pin') ?> Teams in <?= e(preg_replace('/^Angeles City, /', '', (string) setting('facts.location'))) ?></li>
        <?php if (confirmed($offer['from_month'] ?? '') !== ''): ?><li><?= icon('check') ?> From <?= confirmed($offer['from_month']) ?>/month</li><?php endif; ?>
      </ul>
    </div>
    <div class="hero-test-visual" id="hidden-capacity-test">
      <?php if (plugin_enabled('capacity-calculator')): ?>
        <div class="hero-test-card"><?php $calcId = 'calc-home'; $calcFull = false; require PLUGINS_DIR . '/capacity-calculator/widget.php'; ?></div>
        <?php if (!empty($stats[1])): ?><p class="hero-float hero-float-a"><strong><?= e($stats[1]['value'] . $stats[1]['suffix']) ?></strong> staff retention</p><?php endif; ?>
        <a class="hero-float hero-float-b" href="<?= e(url('case-studies/strata-choice')) ?>"><strong><?= e($story['from'] ?? '5') ?> → <?= e($story['to'] ?? '21') ?></strong> team members · Strata Choice</a>
      <?php endif; ?>
    </div>
  </div>
</section>

<section class="proof-bar" aria-label="Strata Staff in numbers">
  <div class="wrap proof-bar-inner">
    <dl class="proof-stats">
      <?php foreach ($stats as $i => $s): if (stripos($s['label'], 'tasks') !== false) continue; ?>
        <div><dt><?= e($s['label']) ?></dt><dd><span data-count="<?= e($s['value']) ?>"><?= e($s['value']) ?></span><?= e($s['suffix']) ?></dd></div>
        <?php if ($i === 1): ?><div><dt>In strata offshoring</dt><dd>Since <?= ph(setting('facts.since')) ?></dd></div><?php endif; ?>
      <?php endforeach; ?>
    </dl>
    <?php if ($members): ?>
    <div class="proof-members">
      <div class="members-viewport" role="group" aria-label="Memberships"><ul class="members-track" data-members><?php foreach ($members as $l): ?><li><?php if (!empty($l['url'])): ?><a href="<?= e($l['url']) ?>" target="_blank" rel="noopener"><?php endif; ?><img src="<?= e(media($l['image'])) ?>" alt="<?= e($l['name']) ?>" height="40" loading="lazy"><?php if (!empty($l['url'])): ?></a><?php endif; ?></li><?php endforeach; ?></ul></div>
    </div>
    <?php endif; ?>
  </div>
</section>

<?php if ($platforms): ?>
<section class="platforms" aria-labelledby="platforms-title">
  <h2 id="platforms-title" class="platforms-label">Trained on <?= count($platforms) ?> strata platforms</h2>
  <div class="marquee"><div class="marquee-track">
    <?php foreach (array_merge($platforms, $platforms) as $i => $l): $dupe = $i >= count($platforms); ?>
      <span class="logo-item"<?= $dupe ? ' aria-hidden="true"' : '' ?>><?php if (!empty($l['image'])): ?><img src="<?= e(media($l['image'])) ?>" alt="<?= $dupe ? '' : e($l['name']) ?>" height="36"><?php else: ?><?= e($l['name']) ?><?php endif; ?></span>
    <?php endforeach; ?>
  </div></div>
</section>
<?php endif; ?>

<section class="section section-tint" id="roles">
  <div class="wrap">
    <div class="section-head row reveal">
      <div>
        <h2>Build your team by role</h2>
        <p class="lede">Strata-trained specialists for the work your managers shouldn't be doing.</p>
      </div>
      <a class="text-link" href="<?= e(url('pricing')) ?>">Compare all <?= count($services) ?> roles <?= icon('arrow') ?></a>
    </div>
    <div class="roles-bar">
      <div class="tabs" role="tablist" aria-label="Role category">
        <button role="tab" aria-selected="true" data-filter="strata"><span class="lbl-full">Strata Services · <?= $countCat('strata') ?> roles</span><span class="lbl-short">Strata · <?= $countCat('strata') ?> roles</span></button>
        <button role="tab" aria-selected="false" data-filter="pm"><span class="lbl-full">Strata Staff Plus · property management · <?= $countCat('pm') ?> roles</span><span class="lbl-short">Property mgmt · <?= $countCat('pm') ?> roles</span></button>
      </div>
      <div class="hs-nav">
        <button type="button" class="round-btn" data-hs-prev aria-controls="roles-home" aria-label="Previous roles"><?= str_replace('<svg', '<svg style="transform:rotate(180deg)"', icon('arrow')) ?></button>
        <button type="button" class="round-btn" data-hs-next aria-controls="roles-home" aria-label="Next roles"><?= icon('arrow') ?></button>
      </div>
    </div>
    <?php if (ph($offer['strata_plus'] ?? '') !== ''): ?><p class="roles-note"><?= ph($offer['strata_plus']) ?></p><?php endif; ?>
    <div class="roles roles-track" id="roles-home" data-filter-target data-hs-track>
      <?php foreach ($services as $s) require FRONTEND_DIR . '/partials/role-card.php'; ?>
    </div>
  </div>
</section>

<?php if ($testimonials): ?>
<section class="section voices-section" id="clients">
  <div class="wrap">
    <div class="section-head row reveal">
      <div><h2>What strata agencies say</h2></div>
      <a class="text-link" href="<?= e(url('clients')) ?>">All <?= count($testimonials) ?> client stories <?= icon('arrow') ?></a>
    </div>
    <div class="voices">
      <?php if ($lead): ?>
      <figure class="voice-lead reveal">
        <span class="stars" role="img" aria-label="Five stars">★★★★★</span>
        <blockquote><p><?= e(sentences($lead['quote'], 220)) ?></p></blockquote>
        <figcaption><?= avatar($lead, 'voice-avatar') ?><span><strong><?= e($lead['name']) ?></strong><small><?= e(quote_byline($lead)) ?></small></span></figcaption>
        <?php if ($firms): ?>
        <div class="endorsed"><span>Also endorsed by leaders at</span>
          <ul><?php foreach ($firms as $f): if ($f === ($lead['company'] ?? '')) continue; ?><li><?= e($f) ?></li><?php endforeach; ?></ul>
        </div>
        <?php endif; ?>
      </figure>
      <?php endif; ?>
      <?php if ($featured): ?>
      <a class="voice-story reveal" href="<?= e(url('case-studies/strata-choice')) ?>">
        <span class="voice-story-num"><?= e($story['from'] ?? '5') ?> <span aria-hidden="true">→</span> <?= e($story['to'] ?? '21') ?></span>
        <strong>team members since <?= e($story['since'] ?? '2023') ?></strong>
        <span class="voice-story-by"><?= avatar($featured, 'voice-avatar') ?><span><?= e($featured['name']) ?><small><?= e(quote_byline($featured)) ?></small></span></span>
        <span class="voice-story-link"><?= !empty($story['video_url']) ? 'Watch the video' : 'Read the client story' ?> <?= icon('arrow') ?></span>
      </a>
      <?php endif; ?>
      <?php $clientVideo = setting('client_video') ?: 'https://stratastaffglobal.com/wp-content/uploads/2025/05/HORNER-FINAL.mp4'; ?>
      <div class="voice-video reveal">
        <button type="button" class="voice-video-btn" data-video="<?= e($clientVideo) ?>" aria-label="Play the client video: Awesome Journey, premium client partner">
          <span class="voice-video-play"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg></span>
          <strong>Awesome Journey</strong>
          <span>Premium client partner · client video</span>
        </button>
      </div>
      <?php $second = $sliderQuotes[1] ?? null; if ($second): ?>
      <figure class="voice-quote reveal">
        <blockquote><p><?= e(sentences($second['quote'], 160)) ?></p></blockquote>
        <figcaption><?= avatar($second, 'voice-avatar') ?><span><strong><?= e($second['name']) ?></strong><small><?= e(quote_byline($second)) ?></small></span></figcaption>
      </figure>
      <?php endif; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<section class="section section-tint trust" id="trust">
  <div class="wrap">
    <div class="section-head row reveal">
      <div><h2><?= e($trust['headline'] ?? '') ?></h2></div>
      <ul class="trust-facts">
        <li><?= icon('pin') ?> Teams in <?= e((string) setting('facts.location')) ?></li>
        <?php if (ph($trust['iso'] ?? '') !== ''): ?><li><?= icon('shield') ?> <?= ph($trust['iso']) ?></li><?php endif; ?>
        <li><a class="text-link" href="<?= e(url('trust')) ?>">Trust Centre <?= icon('arrow') ?></a></li>
      </ul>
    </div>
    <div class="trust-grid">
      <?php foreach ((array) ($trust['pillars'] ?? []) as $i => $p): ?>
        <article class="trust-card reveal">
          <span class="feature-icon"><?= icon(['lock', 'key', 'users', 'shield'][$i] ?? 'shield') ?></span>
          <h3><?= e($p['title'] ?? '') ?></h3>
          <p><?= e($p['question'] ?? '') ?></p>
        </article>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="section section-dark academy-band">
  <div class="wrap tasks-grid">
    <div class="reveal">
      <h2>Trained in strata before they join your team</h2>
      <p class="lede">Every specialist completes our Foundation Training Program and a course built for their role, on the platforms your agency uses.</p>
      <a class="btn btn-light" href="<?= e(url('learning/course-outline')) ?>"><?= icon('book') ?> See the course outlines</a>
    </div>
    <ul class="academy-list reveal">
      <li><span class="feature-icon"><?= icon('book') ?></span><div><strong>Foundation Training Program</strong><span>Strata basics, legislation and owner communication before day one</span></div></li>
      <li><span class="feature-icon"><?= icon('layers') ?></span><div><strong>A course outline for every role</strong><span><?= e(implode(', ', array_map(function ($s) { return preg_replace('/^Strata /', '', $s['title']); }, array_filter($services, function ($s) { return $s['category'] === 'strata'; })))) ?></span></div></li>
      <li><span class="feature-icon"><?= icon('trend') ?></span><div><strong>Platform tracks</strong><span><?= e(implode(' · ', array_slice(array_column($platforms, 'name'), 0, 6))) ?></span></div></li>
    </ul>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div class="split-img reveal">
      <img src="<?= e(media($hero['image'] ?? 'assets/media/site/the-strata-staff-difference.webp')) ?>" alt="Strata Staff team members working together" width="560" height="560" loading="lazy">
      <div class="img-badge"><span class="big">Since <?= ph(setting('facts.since')) ?></span> serving strata agencies</div>
    </div>
    <div class="reveal">
      <h2>From first call to a working offshore team</h2>
      <ol class="steps-list">
        <?php foreach ([
            ['Book a 30-minute discovery call', 'A free call with our solutions team about your staffing needs and goals.'],
            ['We design your solution', 'A capacity plan matching the right roles, skills and strata platforms to your business.'],
            ['Meet your offshore team', 'We select, vet and train your staff on strata operations before they start.'],
            ['Scale with confidence', 'Your team works inside your workflows and grows as your portfolio does.'],
        ] as $i => $st): ?>
          <li><span class="step-n"><?= $i + 1 ?></span><div><h3><?= e($st[0]) ?></h3><p><?= e($st[1]) ?></p></div></li>
        <?php endforeach; ?>
      </ol>
    </div>
  </div>
</section>

<section class="section section-tint">
  <div class="wrap tasks-grid">
    <div class="reveal">
      <h2><?= e(($stats[2]['value'] ?? '200,000') . ($stats[2]['suffix'] ?? '+')) ?> strata tasks a month</h2>
      <p class="lede">From levy queries and Section 184 certificates to AGM agendas and by-law notices, this is the work our teams process every day.</p>
      <a class="btn btn-primary" href="<?= e(url('solutions')) ?>">See all solutions <?= icon('arrow') ?></a>
    </div>
    <ul class="chips chips-light reveal" aria-label="Strata tasks we handle">
      <?php $tasks = ['Reconciliation', 'Payment runs', 'Debt recovery', 'Financial reports', 'Valuations', 'Bank downloads', 'Section 184', 'Section 22', 'Invoicing', 'Levy queries', 'Strata roll', 'Insurance claims', 'Drafting letters', 'Data updates', 'Archiving', 'Asbestos', 'AFSS', 'Work orders', 'By-law notices', 'Compliance', 'AGM', 'EGM']; ?>
      <?php foreach ($tasks as $ti => $t): ?>
        <li<?= $ti >= 10 ? ' class="chip-extra"' : '' ?>><?= icon('check') ?><?= e($t) ?></li>
      <?php endforeach; ?>
    </ul>
    <button type="button" class="btn btn-outline btn-sm chips-more" data-chips-more>Show all <?= count($tasks) ?> tasks</button>
  </div>
</section>

<?php if ($posts): ?>
<section class="section home-posts">
  <div class="wrap">
    <div class="section-head row reveal">
      <div><h2>News from Strata Staff</h2></div>
      <a class="text-link" href="<?= e(url('insights')) ?>">All insights <?= icon('arrow') ?></a>
    </div>
    <div class="post-grid">
      <?php foreach ($posts as $p) require ROOT_DIR . '/insights/post-card.php'; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<?php if ($faqs): ?>
<section class="section section-tint">
  <div class="wrap faq-grid">
    <div class="reveal">
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
