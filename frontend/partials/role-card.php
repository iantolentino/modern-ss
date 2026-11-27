<a class="role-card reveal" href="<?= e(url('solutions/' . $s['slug'])) ?>" data-cat="<?= e($s['category']) ?>">
  <div class="role-img"><img src="<?= e(media($s['image'])) ?>" alt="<?= e($s['title']) ?>" loading="lazy" width="300" height="380"></div>
  <div class="role-body">
    <h3><?= e($s['title']) ?></h3>
    <?php if (!empty($s['highlights'])): ?>
      <ul class="role-chips"><?php foreach (array_slice(lines($s['highlights']), 0, 3) as $h): ?><li><?= e($h) ?></li><?php endforeach; ?></ul>
    <?php else: ?>
      <p><?= e($s['summary']) ?></p>
    <?php endif; ?>
    <div class="role-foot">
      <?php $price = confirmed(role_price($s)); if ($price !== ''): ?><span class="role-price">From <strong><?= $price ?></strong>/mo</span><?php endif; ?>
      <span class="role-link">View role <?= icon('arrow') ?></span>
    </div>
  </div>
</a>
