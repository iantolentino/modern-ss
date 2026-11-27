<?php
$trust = setting('trust', []);
$crumbs = [['', 'Home'], ['trust', 'Trust Centre']];
layout_head([
    'title' => 'Trust Centre: Data, Access and Continuity | Strata Staff Global',
    'description' => "How Strata Staff protects your owners' data, controls access, stays accountable for its offshore team and keeps your work running when someone is away.",
    'path' => 'trust',
    'schema' => [breadcrumb_schema($crumbs)],
], 'about');
page_hero('Trust', 'Trust Centre', 'The four questions strata principals ask first, answered in one place.', $crumbs);
$icons = ['lock', 'key', 'users', 'shield'];
?>
<section class="section">
  <div class="wrap content-grid">
    <div class="trust-list">
      <?php foreach ((array) ($trust['pillars'] ?? []) as $i => $p): $answer = trim((string) ($p['answer'] ?? '')); ?>
        <article class="trust-row" id="<?= e(slugify($p['title'] ?? 'pillar')) ?>">
          <span class="feature-icon"><?= icon($icons[$i] ?? 'shield') ?></span>
          <div>
            <h2><?= e($p['title'] ?? '') ?></h2>
            <p class="trust-q"><?= e($p['question'] ?? '') ?></p>
            <?php if ($answer !== ''): ?>
              <div class="prose"><?= md($answer) ?></div>
            <?php elseif (!ph_hidden()): ?>
              <p class="trust-todo"><?= ph('Details to be confirmed by operations*') ?></p>
            <?php endif; ?>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
    <aside class="side-card">
      <h3>At a glance</h3>
      <ul class="facts-list">
        <li><span>Where the team works</span><strong><?= e((string) setting('facts.location')) ?></strong></li>
        <?php if (ph($trust['iso'] ?? '') !== ''): ?><li><span>Certification</span><strong><?= ph($trust['iso']) ?></strong></li><?php endif; ?>
        <li><span>Privacy policy</span><strong><a href="<?= e(url('privacy')) ?>">Read it</a></strong></li>
      </ul>
      <a class="btn btn-primary btn-block" href="<?= e(url('contact')) ?>">Book a 30-minute discovery call <?= icon('arrow') ?></a>
    </aside>
  </div>
</section>
<?php layout_foot();
