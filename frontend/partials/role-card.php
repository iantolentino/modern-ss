<a class="role-card reveal" href="<?= e(url('solutions/' . $s['slug'])) ?>" data-cat="<?= e($s['category']) ?>">
  <?php $scene = 'assets/media/roles/scene/' . $s['slug'] . '.webp'; // a work scene for the role (stock); the role page keeps the team portrait ?>
  <?php if (is_file(ROOT_DIR . '/' . $scene)): ?>
  <div class="role-img role-img--scene"><img src="<?= e(media($scene)) ?>" alt="" loading="lazy" width="960" height="800"></div>
  <?php else: ?>
  <div class="role-img" style="--img: url('<?= e(media($s['image'])) ?>')"><img src="<?= e(media($s['image'])) ?>" alt="<?= e($s['title']) ?>" loading="lazy" width="300" height="380"></div>
  <?php endif; ?>
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
