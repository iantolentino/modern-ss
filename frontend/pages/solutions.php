<?php
$crumbs = [['', 'Home'], ['solutions', 'Solutions']];
$services = items('services');
$groups = [
    'strata' => ['Strata Services', 'Strata management offshore solutions', 'Our strata management teams handle the back office of your agency, from financial processing and compliance tracking to customer care and executive support.'],
    'pm' => ['Strata Staff Plus', 'Property management offshore solutions', 'Extend your property management team with purpose-trained specialists who take on the operational load, so your in-house managers can focus on relationships and growth.'],
];
$list = ['@context' => 'https://schema.org', '@type' => 'ItemList', 'itemListElement' => array_map(function ($s, $i) {
    return ['@type' => 'ListItem', 'position' => $i + 1, 'url' => abs_url('solutions/' . $s['slug']), 'name' => $s['title']];
}, $services, array_keys($services))];
layout_head([
    'title' => 'Offshore Strata & Property Management Roles | Strata Staff',
    'description' => 'Offshore strata accountants, administrators, EAs, compliance, insurance and customer care specialists, plus property management roles.',
    'path' => 'solutions',
    'schema' => [breadcrumb_schema($crumbs), $list],
], 'solutions');
page_hero('Solutions', 'Offshore specialists for strata and property management', 'Every role on your offshore team is filled by a specialist who understands your industry. Choose a role to see what they do and how they support your business.', $crumbs);
?>
<?php foreach ($groups as $key => $g):
    $rows = array_filter($services, function ($s) use ($key) { return $s['category'] === $key; });
    if (!$rows) continue; ?>
<section class="section<?= $key === 'pm' ? ' section-tint' : '' ?>" id="<?= $key === 'pm' ? 'property-management' : 'strata-management' ?>">
  <div class="wrap">
    <div class="section-head reveal"><p class="eyebrow"><?= e($g[0]) ?></p><h2><?= e($g[1]) ?></h2><p class="lede"><?= e($g[2]) ?></p></div>
    <div class="roles"><?php foreach ($rows as $s) require FRONTEND_DIR . '/partials/role-card.php'; ?></div>
  </div>
</section>
<?php endforeach; ?>
<?php layout_foot();
