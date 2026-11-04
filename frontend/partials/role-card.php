<a class="role-card reveal" href="<?= e(url('solutions/' . $s['slug'])) ?>" data-cat="<?= e($s['category']) ?>">
  <div class="role-img"><img src="<?= e(media($s['image'])) ?>" alt="<?= e($s['title']) ?>" loading="lazy" width="300" height="380"></div>
  <div class="role-body">
    <h3><?= e($s['title']) ?></h3>
    <p><?= e($s['summary']) ?></p>
    <span class="role-link">View role <?= icon('arrow') ?></span>
  </div>
</a>
