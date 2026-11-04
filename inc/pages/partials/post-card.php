<article class="post-card reveal">
  <a href="<?= e(url('insights/' . $p['slug'])) ?>" class="post-img"<?php if (!empty($p['cover'])): ?> style="--bg: url('<?= e(media($p['cover'])) ?>')"<?php endif; ?>>
    <?php if (!empty($p['cover'])): ?><img src="<?= e(media($p['cover'])) ?>" alt="" loading="lazy" width="480" height="300"><?php endif; ?>
  </a>
  <div class="post-body">
    <p class="post-meta"><span class="tag"><?= e($p['category'] ?? 'News') ?></span><time datetime="<?= e($p['date']) ?>"><?= e(fdate($p['date'])) ?></time></p>
    <h3><a href="<?= e(url('insights/' . $p['slug'])) ?>"><?= e($p['title']) ?></a></h3>
    <p><?= e(plain($p['excerpt'] ?? $p['body'] ?? '', 140)) ?></p>
  </div>
</article>
