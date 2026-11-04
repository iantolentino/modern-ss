<article class="person reveal" data-cat="<?= e(slugify($p['department'] ?? '')) ?>">
  <div class="person-img"><?= avatar($p, 'person-photo') ?></div>
  <h3><?= e($p['name']) ?></h3>
  <p class="person-title"><?= e($p['title']) ?></p>
  <?php if (!empty($p['bio'])): ?><p class="person-bio"><?= e($p['bio']) ?></p><?php endif; ?>
  <?php if (!empty($p['linkedin'])): ?><a class="person-li" href="<?= e($p['linkedin']) ?>" target="_blank" rel="noopener" aria-label="<?= e($p['name']) ?> on LinkedIn"><?= icon('linkedin') ?></a><?php endif; ?>
</article>
