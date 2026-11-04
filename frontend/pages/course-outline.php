<?php
$crumbs = [['', 'Home'], ['learning', 'Learning'], ['learning/course-outline', 'Course outline per role']];
$services = items('services', function ($s) { return trim((string) ($s['outline'] ?? '')) !== ''; });
$groups = ['strata' => 'Strata training outlines', 'pm' => 'Property management training outline'];
$courses = ['@context' => 'https://schema.org', '@type' => 'ItemList', 'itemListElement' => array_values(array_map(function ($s, $i) {
    return ['@type' => 'ListItem', 'position' => $i + 1, 'item' => [
        '@type' => 'Course', 'name' => $s['title'] . ' training',
        'description' => 'Strata Staff training outline for the ' . $s['title'] . ' role: ' . implode('; ', lines($s['outline'])),
        'provider' => ['@id' => abs_url('#org')],
    ]];
}, $services, array_keys($services)))];
layout_head([
    'title' => 'Strata Training Course Outline per Role | Strata Staff Global',
    'description' => 'Training modules for every Strata Staff role, from strata administrators and accountants to compliance, insurance and property management.',
    'path' => 'learning/course-outline',
    'schema' => [breadcrumb_schema($crumbs), $courses],
], 'learning');
page_hero('Learning', 'Course outline per role', 'Every Strata Staff specialist completes a role-specific training outline before joining your team. Here is what each role covers.', $crumbs);
?>
<?php foreach ($groups as $cat => $heading):
    $rows = array_values(array_filter($services, function ($s) use ($cat) { return $s['category'] === $cat; }));
    if (!$rows) continue;
    // Property management roles share one outline; show it once with all four roles named
    if ($cat === 'pm') $rows = [array_merge($rows[0], ['title' => implode(' · ', array_map(function ($r) { return str_replace('Property Management ', '', $r['title']); }, $rows)), 'shared' => $rows])];
    ?>
<section class="section<?= $cat === 'pm' ? ' section-tint' : '' ?>">
  <div class="wrap">
    <div class="section-head reveal"><p class="eyebrow"><?= $cat === 'pm' ? 'Strata Staff Plus' : 'Strata Services' ?></p><h2><?= e($heading) ?></h2></div>
    <div class="outline-grid">
      <?php foreach ($rows as $s): ?>
        <article class="outline-card reveal">
          <h3><?php if (empty($s['shared'])): ?><a href="<?= e(url('solutions/' . $s['slug'])) ?>"><?= e($s['title']) ?></a><?php else: ?><?= e($s['title']) ?><?php endif; ?></h3>
          <ol class="modules">
            <?php foreach (lines($s['outline']) as $mod): $parts = explode(':', $mod, 2); ?>
              <li><?php if (count($parts) === 2): ?><span><?= e(trim($parts[0])) ?></span><?= e(trim($parts[1])) ?><?php else: ?><?= e($mod) ?><?php endif; ?></li>
            <?php endforeach; ?>
          </ol>
        </article>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endforeach; ?>
<?php layout_foot();
