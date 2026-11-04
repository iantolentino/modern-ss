<?php
$crumbs = [['', 'Home'], ['insights', 'Insights'], ['insights/' . $post['slug'], $post['title']]];
$schema = [
    '@context' => 'https://schema.org', '@type' => 'NewsArticle',
    'headline' => mb_substr($post['title'], 0, 110),
    'datePublished' => $post['date'], 'dateModified' => $post['updated'] ?? $post['date'],
    'image' => !empty($post['cover']) ? [abs_url(media($post['cover']))] : [],
    'author' => ['@type' => 'Organization', 'name' => $post['author'] ?? setting('site_name')],
    'publisher' => ['@id' => abs_url('#org')],
    'mainEntityOfPage' => abs_url('insights/' . $post['slug']),
];
layout_head([
    'title' => ($post['seo_title'] ?? '' ?: $post['title']) . ' | Strata Staff Global',
    // Short excerpts make weak snippets; fall back to the article body
    'description' => plain(mb_strlen($post['excerpt'] ?? '') >= 90 ? $post['excerpt'] : ($post['body'] ?? $post['excerpt'] ?? ''), 158),
    'path' => 'insights/' . $post['slug'],
    'image' => $post['cover'] ?? '',
    'type' => 'article',
    'schema' => [breadcrumb_schema($crumbs), $schema],
], 'insights');
$more = array_slice(array_filter(items('insights'), function ($p) use ($post) { return $p['slug'] !== $post['slug']; }), 0, 3);
?>
<article>
  <header class="page-hero post-hero">
    <div class="wrap narrow">
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="<?= e(url()) ?>">Home</a></li><li><a href="<?= e(url('insights')) ?>">Insights</a></li><li><span aria-current="page"><?= e($post['category'] ?? 'Article') ?></span></li></ol></nav>
      <p class="post-meta light"><span class="tag tag-light"><?= e($post['category'] ?? 'News') ?></span><time datetime="<?= e($post['date']) ?>"><?= e(fdate($post['date'], 'j F Y')) ?></time></p>
      <h1><?= e($post['title']) ?></h1>
      <?php if (!empty($post['excerpt'])): ?><p class="lede"><?= e($post['excerpt']) ?></p><?php endif; ?>
    </div>
  </header>
  <?php if (!empty($post['cover'])): ?>
  <div class="wrap narrow post-cover"><div class="post-cover-frame" style="--bg: url('<?= e(media($post['cover'])) ?>')"><img src="<?= e(media($post['cover'])) ?>" alt="<?= e($post['title']) ?>" width="960" height="540" fetchpriority="high"></div></div>
  <?php endif; ?>
  <div class="section"><div class="wrap narrow prose"><?= md($post['body'] ?? '') ?>
    <?php if (!empty($post['gallery'])): ?><div class="gallery"><?php foreach (lines($post["gallery"]) as $gi => $g): ?><a href="<?= e(media($g)) ?>" target="_blank" rel="noopener"><img src="<?= e(media($g)) ?>" alt="<?= e($post["title"]) ?>, page <?= $gi + 2 ?>" loading="lazy"></a><?php endforeach; ?></div><?php endif; ?>
  </div></div>
</article>
<?php if ($more): ?>
<section class="section section-tint">
  <div class="wrap">
    <div class="section-head reveal"><h2>More insights</h2></div>
    <div class="post-grid"><?php foreach ($more as $p) require __DIR__ . '/partials/post-card.php'; ?></div>
  </div>
</section>
<?php endif; ?>
<?php layout_foot();
