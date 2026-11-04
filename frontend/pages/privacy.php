<?php
layout_head(['title' => 'Privacy Policy | Strata Staff Global', 'description' => 'How Strata Staff Global collects, uses, discloses and protects personal information.', 'path' => 'privacy']);
page_hero('Legal', 'Privacy Policy', '', [['', 'Home'], ['privacy', 'Privacy Policy']]);
?>
<section class="section"><div class="wrap narrow prose">
<?= md((string) setting('privacy', '')) ?>
</div></section>
<?php layout_foot();
