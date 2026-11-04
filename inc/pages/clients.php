<?php
$crumbs = [['', 'Home'], ['about', 'About'], ['clients', 'Our clients have spoken']];
$testimonials = items('testimonials');
$reviews = array_map(function ($t) {
    return ['@type' => 'Review', 'reviewBody' => $t['quote'], 'author' => ['@type' => 'Person', 'name' => $t['name']]];
}, $testimonials);
$schema = ['@context' => 'https://schema.org', '@type' => 'Organization', '@id' => abs_url('#org'), 'name' => setting('site_name'), 'review' => $reviews];
layout_head([
    'title' => 'Client Testimonials | Strata Agencies on Strata Staff Global',
    'description' => 'What strata agencies across Australia say about working with Strata Staff Global, from SCA presidents to agency directors.',
    'path' => 'clients',
    'schema' => [breadcrumb_schema($crumbs), $schema],
], 'about');
page_hero('Our clients have spoken', 'What strata agencies say about us', 'Strata agency owners, directors and managers on what it\'s like to work with their Strata Staff team.', $crumbs);
?>
<section class="section">
  <div class="wrap">
    <div class="quote-grid">
      <?php foreach ($testimonials as $t): ?>
        <figure class="quote-card reveal">
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
<?php layout_foot();
