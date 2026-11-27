<?php
$crumbs = [['', 'Home'], ['insights', 'Insights']];
$posts = items('insights');
$cat = isset($_GET['category']) && is_string($_GET['category']) ? $_GET['category'] : '';
$cats = array_values(array_unique(array_filter(array_column($posts, 'category'))));
if ($cat !== '') $posts = array_values(array_filter($posts, function ($p) use ($cat) { return slugify($p['category'] ?? '') === $cat; }));
layout_head([
    'title' => 'Insights: News & Strata Industry Updates | Strata Staff Global',
    'description' => 'News, announcements, newsletters and strata industry insights from Strata Staff Global.',
    'path' => 'insights' . ($cat ? '?category=' . rawurlencode($cat) : ''),
    'schema' => [breadcrumb_schema($crumbs)],
], 'insights');
page_hero('Insights', 'News, updates and industry insights.', 'Announcements, newsletters and stories from the Strata Staff Global team.', $crumbs);
$featured = ($cat === '' && $posts) ? array_shift($posts) : null;
?>
<section class="section">
  <div class="wrap">
    <?php if ($cats): ?>
    <nav class="chip-nav reveal" aria-label="Categories">
      <a href="<?= e(url('insights')) ?>"<?= $cat === '' ? ' aria-current="true"' : '' ?>>All</a>
      <?php foreach ($cats as $c): ?><a href="<?= e(url('insights?category=' . slugify($c))) ?>"<?= $cat === slugify($c) ? ' aria-current="true"' : '' ?>><?= e($c) ?></a><?php endforeach; ?>
    </nav>
    <?php endif; ?>
    <?php if ($featured): $p = $featured; ?>
      <article class="featured-post reveal">
        <a class="post-img" href="<?= e(url('insights/' . $p['slug'])) ?>"<?php if (!empty($p['cover'])): ?> style="--bg: url('<?= e(media($p['cover'])) ?>')"<?php endif; ?>><?php if (!empty($p['cover'])): ?><img src="<?= e(media($p['cover'])) ?>" alt="<?= e($p['title']) ?>" width="720" height="540"><?php endif; ?></a>
        <div class="post-body">
          <p class="post-meta"><span class="tag"><?= e($p['category'] ?? 'News') ?></span><time datetime="<?= e($p['date']) ?>"><?= e(fdate($p['date'])) ?></time></p>
          <h2><a href="<?= e(url('insights/' . $p['slug'])) ?>"><?= e($p['title']) ?></a></h2>
          <p><?= e(plain($p['excerpt'] ?? $p['body'] ?? '', 220)) ?></p>
          <a class="text-link" href="<?= e(url('insights/' . $p['slug'])) ?>">Read article <?= icon('arrow') ?></a>
        </div>
      </article>
    <?php endif; ?>
    <?php if ($posts): ?>
      <?php $visible = $featured ? 3 : 4; ?>
      <div class="post-grid" id="post-grid"><?php foreach ($posts as $pi => $p): ?><?php if ($pi === $visible): ?></div><div class="post-grid post-more" id="post-more" hidden><?php endif; ?><?php require ROOT_DIR . '/insights/post-card.php'; ?><?php endforeach; ?></div>
      <?php if (count($posts) > $visible): ?>
      <p class="show-all"><button type="button" class="btn btn-outline" data-show-all="post-more" aria-controls="post-more" aria-expanded="false">Show all <?= count($posts) + ($featured ? 1 : 0) ?> articles</button></p>
      <?php endif; ?>
    <?php elseif (!$featured): ?>
      <div class="empty"><h3>No articles yet</h3><p>Check back soon.</p></div>
    <?php endif; ?>
  </div>
</section>
<?php layout_foot();
