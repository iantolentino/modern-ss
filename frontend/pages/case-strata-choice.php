<?php
/** Strata Choice case study (competitive review, slide 23). Only the 5 → 21 figure and the quote are confirmed. */
$cs = setting('case_strata_choice', []);
$quote = null;
foreach (items('testimonials') as $t) if (stripos($t['quote'] ?? '', '21 headcount') !== false) { $quote = $t; break; }
$from = (int) ($cs['from'] ?? 5);
$to = (int) ($cs['to'] ?? 21);
$crumbs = [['', 'Home'], ['case-studies', 'Case studies'], ['case-studies/strata-choice', 'Strata Choice']];
$title = "How Strata Choice grew its offshore team from $from to $to";
layout_head([
    'title' => "Strata Choice Case Study: $from to $to Offshore Staff | Strata Staff Global",
    'description' => "Strata Choice started with $from Strata Staff team members in " . ($cs['since'] ?? '2023') . " and now has $to strata-trained specialists supporting its managers.",
    'path' => 'case-studies/strata-choice',
    'schema' => [breadcrumb_schema($crumbs)],
], 'case-studies');
$text = function (string $v, string $fallback) { return md(trim($v) !== '' ? $v : $fallback); };
$metric = function (string $value, string $label) {
    return trim($value) !== '' ? '<div class="case-metric"><strong>' . e($value) . '</strong><span>' . e($label) . '</span></div>' : '';
};
$since = (string) ($cs['since'] ?? '2023');
?>
<section class="page-hero">
  <div class="wrap hero-media-grid">
    <div>
      <h1><?= e($title) ?></h1>
      <p class="lede">Strata Choice started with <?= $from ?> Strata Staff team members in <?= e($cs['since'] ?? '2023') ?>. Today <?= $to ?> strata-trained specialists support its managers.</p>
    </div>
    <?php if (!empty($cs['video_url'])): ?>
      <a class="story-card case-video" href="<?= e($cs['video_url']) ?>" target="_blank" rel="noopener"><?= icon('arrow') ?><strong><?= $quote ? e($quote['name']) . ', on scaling with Strata Staff' : 'Watch the video' ?></strong><span>Video testimonial</span></a>
    <?php elseif ($quote): ?>
      <figure class="story-card case-video"><?= avatar($quote, 'story-avatar') ?><strong><?= e($quote['name']) ?></strong><span><?= e(quote_byline($quote)) ?></span></figure>
    <?php endif; ?>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="case-metrics">
      <div class="case-metric"><strong><?= $from ?> → <?= $to ?></strong><span>team members since <?= e($cs['since'] ?? '2023') ?></span></div>
      <div class="case-metric"><strong><?= e(rtrim(rtrim(number_format($to / max(1, $from), 1), '0'), '.')) ?>×</strong><span>growth of the offshore team</span></div>
      <?= $metric((string) ($cs['hours_back'] ?? ''), 'hours returned per manager per week') ?>
      <?= $metric((string) ($cs['response'] ?? ''), 'faster owner response') ?>
    </div>
    <div class="content-grid case-body">
      <div class="prose">
        <h2>The challenge</h2>
        <?= $text((string) ($cs['challenge'] ?? ''), "Strata Choice is a major player in the strata industry. As it kept growing, it needed a partner that could help with its business cost challenges without slowing the business down.") ?>
        <h2>What we built</h2>
        <?php $roles = array_filter(array_map('confirmed', lines((string) ($cs['roles'] ?? '')))); if ($roles): ?><ul class="role-chips case-roles"><?php foreach ($roles as $r): ?><li><?= $r ?></li><?php endforeach; ?></ul><?php endif; ?>
        <?= $text((string) ($cs['built'] ?? ''), "Strata Staff became Strata Choice's offshore strategic partner in $since, starting with a team of $from. Rather than a fixed handover, the two businesses built the offshore team together, adding people as Strata Choice's requirements grew. Today the team is $to strong.") ?>
        <h2>Results in the client’s words</h2>
        <?php if ($quote): ?><blockquote><p><?= e($quote['quote']) ?></p></blockquote><?php endif; ?>
        <?= trim((string) ($cs['results'] ?? '')) !== '' ? md((string) $cs['results']) : '' ?>
      </div>
      <aside class="side-card">
        <h3>At a glance</h3>
        <ul class="facts-list">
          <li><span>Client</span><strong>Strata Choice</strong></li>
          <?php if ($quote): ?><li><span>Leader</span><strong><?= e($quote['name']) ?>, CEO</strong></li><?php endif; ?>
          <li><span>Partner since</span><strong><?= e($cs['since'] ?? '2023') ?></strong></li>
          <li><span>Team today</span><strong><?= $to ?> specialists</strong></li>
          <li><span>Growth</span><strong><?= e(rtrim(rtrim(number_format($to / max(1, $from), 1), '0'), '.')) ?>× the starting team</strong></li>
          <?php if (confirmed($cs['platforms'] ?? '') !== ''): ?><li><span>Platforms</span><strong><?= confirmed($cs['platforms']) ?></strong></li><?php endif; ?>
        </ul>
        <a class="btn btn-primary btn-block" href="<?= e(url('contact')) ?>">Book a 30-minute discovery call <?= icon('arrow') ?></a>
      </aside>
    </div>
  </div>
</section>
<?php layout_foot();
