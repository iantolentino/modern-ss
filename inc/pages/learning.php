<?php
$crumbs = [['', 'Home'], ['learning', 'Learning']];
$m = 'assets/media/site/';
layout_head([
    'title' => 'Strata Training & Staff Academy | Strata Staff Global',
    'description' => 'How Strata Staff trains offshore strata professionals: the Foundation Training Program, role course outlines and the Strata Staff Academy.',
    'path' => 'learning',
    'schema' => [breadcrumb_schema($crumbs)],
], 'learning');
page_hero('Learning', 'Trained for strata before day one', 'Strata Staff invests in your offshore team from the start, with structured training programs, role-specific course outlines and a dedicated learning academy.', $crumbs);
?>
<section class="section" id="ftp">
  <div class="wrap split">
    <div class="split-img reveal"><img src="<?= e(media($m . 'foundation-training-program-1.webp')) ?>" alt="Strata Staff Foundation Training Program" width="560" height="560" loading="lazy"></div>
    <div class="reveal">
      <p class="eyebrow">Foundation Training Program</p>
      <h2>Industry-ready from the first placement</h2>
      <p class="lede">The Foundation Training Program (FTP), run by our Learning Delivery Team, trains aspiring strata professionals in the foundation skills they need before they're endorsed to a strata agency partner.</p>
      <h3 class="list-sub">What it builds in our people</h3>
      <ul class="checklist">
        <?php foreach (['A solid foundational knowledge base', 'Monitored competency levels', 'Professional growth and career advancement', 'Consistent proficiency interventions', 'Coaching on skill gaps'] as $x): ?><li><?= icon('check') ?> <?= e($x) ?></li><?php endforeach; ?>
      </ul>
    </div>
  </div>
</section>
<section class="section section-tint">
  <div class="wrap split reverse">
    <div class="split-img reveal"><img src="<?= e(media($m . 'foundation-training-program-2.webp')) ?>" alt="Strata Staff training session" width="560" height="560" loading="lazy"></div>
    <div class="reveal">
      <p class="eyebrow">For our agency partners</p>
      <h2>What the FTP means for your agency</h2>
      <ul class="checklist">
        <?php foreach (['Processes aligned with your internal agency metrics', 'Quality assurance and client satisfaction', 'A high compliance ratio', 'Task management tailored to each agency'] as $x): ?><li><?= icon('check') ?> <?= e($x) ?></li><?php endforeach; ?>
      </ul>
    </div>
  </div>
</section>
<section class="section" id="academy">
  <div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">Ongoing learning</p><h2>Our learning programs</h2></div>
    <div class="program">
      <article class="program-card reveal">
        <h3>Strata Staff Academy</h3>
        <p>Our online learning hub, where team members access training resources, certification tracks and professional development modules to stay strata-ready.</p>
        <p>Enrolment enquiries: <a href="mailto:training@stratastaffglobal.com">training@stratastaffglobal.com</a></p>
      </article>
      <article class="program-card reveal">
        <h3>Course outline per role</h3>
        <p>Every position has its own training outline, from accountants and executive assistants to compliance specialists and customer care.</p>
        <a class="text-link" href="<?= e(url('learning/course-outline')) ?>">View the course outlines <?= icon('arrow') ?></a>
      </article>
    </div>
  </div>
</section>
<?php layout_foot();
