<?php
layout_head(['title' => 'Privacy Policy | Strata Staff Global', 'description' => 'How Strata Staff Global collects, uses, discloses and protects personal information.', 'path' => 'privacy']);
page_hero('Legal', 'Privacy Policy', '', [['', 'Home'], ['privacy', 'Privacy Policy']]);
?>
<?php $policy = (string) setting('privacy', ''); $toc = md_toc($policy); ?>
<section class="section"><div class="wrap doc-layout<?= $toc ? '' : ' no-aside' ?>">
  <?php if ($toc): ?>
  <aside class="doc-aside">
    <nav class="doc-toc" aria-label="On this page"><p class="doc-toc-title">On this page</p><ol>
      <?php foreach ($toc as $id => $title): ?><li><a href="#<?= e($id) ?>"><?= e($title) ?></a></li><?php endforeach; ?>
    </ol></nav>
  </aside>
  <?php endif; ?>
  <div class="doc-main prose"><?= md($policy) ?></div>
</div></section>
<?php layout_foot();
