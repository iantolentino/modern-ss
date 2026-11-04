<?php
layout_head(['title' => 'Page not found | Strata Staff Global', 'description' => 'The page you are looking for could not be found.', 'noindex' => true]);
?>
<section class="page-hero">
  <div class="wrap narrow">
    <p class="eyebrow">404</p>
    <h1>Page not found</h1>
    <p class="lede">The page you're looking for has moved or no longer exists.</p>
    <div class="hero-actions">
      <a class="btn btn-primary btn-lg" href="<?= e(url()) ?>">Back to home</a>
      <a class="btn btn-outline btn-lg" href="<?= e(url('solutions')) ?>">See our solutions</a>
    </div>
  </div>
</section>
<?php layout_foot();
