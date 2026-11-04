<?php
/** Admin rendering helpers. */

function admin_assets(): string {
    $v = @filemtime(ROOT_DIR . '/assets/admin/admin.css') . @filemtime(ROOT_DIR . '/assets/admin/admin.js');
    return '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
        . '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap">'
        . '<link rel="stylesheet" href="' . e(url('assets/admin/admin.css')) . '?v=' . $v . '">';
}

function auth_page(string $title, string $body): void {
    $logo = media(setting('logo')); ?><!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title><?= e($title) ?> | Site Admin</title><?= admin_assets() ?></head>
<body class="auth">
  <main class="auth-card">
    <?php if ($logo): ?><img src="<?= e($logo) ?>" alt="<?= e(setting('site_name')) ?>" class="auth-logo"><?php endif; ?>
    <h1><?= e($title) ?></h1>
    <?= $body ?>
    <p class="muted center small"><a href="<?= e(url()) ?>">← Back to website</a></p>
  </main>
</body></html><?php
    exit;
}

function admin_head(string $view, array $me, array $schemas, string $flash): void {
    $nav = [
        ['Overview', [['dashboard', 'Dashboard', 'layers']]],
        ['Content', array_merge(
            array_map(function ($k, $s) { return [$k, $s['label'], $s['icon']]; }, array_keys($schemas), $schemas),
            [['media', 'Media library', 'upload']]
        )],
        ['Inbox', [['applications', 'Applications', 'users'], ['leads', 'Enquiries', 'mail']]],
        ['Site', [['settings', 'Logo & settings', 'spark'], ['users', 'Users & security', 'shield']]],
    ];
    $newApps = count(array_filter(load('applications'), function ($a) { return ($a['status'] ?? '') === 'new'; }));
    $newLeads = count(array_filter(load('leads'), function ($a) { return ($a['status'] ?? '') === 'new'; }));
    ?><!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>Site Admin | <?= e(setting('site_name')) ?></title><?= admin_assets() ?>
<meta name="csrf" content="<?= e(csrf_token()) ?>"><meta name="upload-url" content="<?= e(url('admin/?action=upload')) ?>"><meta name="media-url" content="<?= e(url('admin/?action=media')) ?>">
</head>
<body>
<aside class="sidebar" id="sidebar">
  <a class="side-brand" href="?view=dashboard"><?php $l = media(setting('logo')); if ($l): ?><img src="<?= e($l) ?>" alt=""><?php endif; ?><span>Site Admin</span></a>
  <nav>
    <?php foreach ($nav as [$group, $links]): ?>
      <p class="nav-label"><?= e($group) ?></p>
      <?php foreach ($links as [$k, $label, $ic]): ?>
        <a href="?view=<?= e($k) ?>"<?= $view === $k ? ' class="active"' : '' ?>><?= icon($ic) ?><span><?= e($label) ?></span>
          <?php if ($k === 'applications' && $newApps): ?><em><?= $newApps ?></em><?php elseif ($k === 'leads' && $newLeads): ?><em><?= $newLeads ?></em><?php endif; ?></a>
      <?php endforeach; ?>
    <?php endforeach; ?>
  </nav>
  <div class="side-foot">
    <span class="avatar-sm"><?= e(mb_strtoupper(mb_substr($me['name'], 0, 1))) ?></span>
    <span class="who"><strong><?= e($me['name']) ?></strong><small><?= e($me['email']) ?></small></span>
    <a href="?action=logout" class="icon-btn" title="Sign out"><?= icon('arrow') ?></a>
  </div>
</aside>
<div class="main">
  <header class="topbar">
    <button class="icon-btn menu-btn" type="button" data-menu aria-label="Menu"><?= icon('menu') ?></button>
    <span class="grow"></span>
    <a class="btn ghost" href="<?= e(url()) ?>" target="_blank" rel="noopener">View website ↗</a>
  </header>
  <div class="content">
  <?php if ($flash): ?><div class="toast" role="status"><?= icon('check') ?> <?= e($flash) ?></div><?php endif;
}

function admin_foot(): void { ?>
  </div>
</div>
<div class="modal" id="lib-modal" hidden>
  <div class="modal-card">
    <div class="modal-head"><h2>Choose an image</h2><button class="icon-btn" type="button" data-close-modal aria-label="Close"><?= icon('close') ?></button></div>
    <div class="modal-body"><div class="media-grid pick" data-lib-grid><p class="muted">Loading…</p></div></div>
  </div>
</div>
<script src="<?= e(url('assets/admin/admin.js')) ?>?v=<?= @filemtime(ROOT_DIR . '/assets/admin/admin.js') ?>"></script>
</body></html>
<?php }

function status_badge(string $s): string {
    $map = ['open' => 'ok', 'published' => 'ok', 'hired' => 'ok', 'contacted' => 'ok', 'new' => 'info', 'reviewing' => 'warn', 'shortlisted' => 'warn', 'draft' => 'muted', 'hidden' => 'muted', 'closed' => 'muted', 'rejected' => 'muted'];
    return '<span class="badge ' . ($map[$s] ?? '') . '">' . e(ucfirst($s)) . '</span>';
}

function status_select(string $view, array $row, array $opts): string {
    $h = '<form method="post" action="?view=' . e($view) . '">' . csrf_field() . '<input type="hidden" name="op" value="status"><input type="hidden" name="id" value="' . e($row['id']) . '"><select class="status-sel" name="status" onchange="this.form.submit()">';
    foreach ($opts as $o) $h .= '<option value="' . $o . '"' . (($row['status'] ?? '') === $o ? ' selected' : '') . '>' . ucfirst($o) . '</option>';
    return $h . '</select></form>';
}

function delete_button(string $view, string $id, string $what): string {
    return '<form method="post" action="?view=' . e($view) . '" onsubmit="return confirm(\'Delete ' . e(addslashes($what)) . '? This cannot be undone.\')">' . csrf_field()
        . '<input type="hidden" name="op" value="delete"><input type="hidden" name="id" value="' . e($id) . '"><button class="icon-btn danger" title="Delete">' . icon('close') . '</button></form>';
}

function thumb(string $src, string $class = 'thumb'): string {
    $u = media($src);
    return $u ? '<img class="' . $class . '" src="' . e($u) . '" alt="" loading="lazy">' : '<span class="' . $class . ' empty"></span>';
}

function collection_list(string $view, array $sc, array $list): void {
    $sortable = isset($sc['fields']['order']);
    usort($list, function ($a, $b) use ($sortable) {
        if ($sortable) return ((int) ($a['order'] ?? 0)) <=> ((int) ($b['order'] ?? 0));
        return strcmp((string) ($b['date'] ?? ''), (string) ($a['date'] ?? ''));
    });
    $q = isset($_GET['q']) && is_string($_GET['q']) ? trim($_GET['q']) : '';
    ?>
    <div class="page-head">
      <div><h1><?= e($sc['label']) ?></h1><p class="muted"><?= count($list) ?> <?= count($list) === 1 ? strtolower($sc['singular']) : strtolower($sc['singular']) . 's' ?><?= $sortable ? ' · drag rows to reorder' : '' ?></p></div>
      <a class="btn primary" href="?view=<?= e($view) ?>&edit=new"><?= icon('plus') ?> Add <?= e(strtolower($sc['singular'])) ?></a>
    </div>
    <?php if (!$list): ?>
      <div class="card empty-state"><?= icon($sc['icon']) ?><h3>Nothing here yet</h3><p class="muted">Create your first <?= e(strtolower($sc['singular'])) ?>.</p><a class="btn primary" href="?view=<?= e($view) ?>&edit=new">Add <?= e(strtolower($sc['singular'])) ?></a></div>
    <?php return; endif; ?>
    <div class="card">
      <div class="table-tools"><input type="search" placeholder="Search <?= e(strtolower($sc['label'])) ?>…" data-table-search value="<?= e($q) ?>"></div>
      <table class="table rows-link" data-view="<?= e($view) ?>"<?= $sortable ? ' data-sortable' : '' ?>>
        <thead><tr><?php if ($sortable): ?><th class="w-drag"></th><?php endif; ?><?php foreach ($sc['columns'] as $k => $label): ?><th<?= in_array($sc['fields'][$k][1] ?? '', ['image'], true) ? ' class="w-thumb"' : '' ?>><?= e($label) ?></th><?php endforeach; ?><th class="w-act"></th></tr></thead>
        <tbody>
        <?php foreach ($list as $row): ?>
          <tr data-id="<?= e($row['id']) ?>" data-href="?view=<?= e($view) ?>&edit=<?= e($row['id']) ?>">
            <?php if ($sortable): ?><td class="drag" draggable="true" title="Drag to reorder">⋮⋮</td><?php endif; ?>
            <?php foreach ($sc['columns'] as $k => $label):
                $type = $sc['fields'][$k][1] ?? 'text';
                $val = (string) ($row[$k] ?? ''); ?>
              <td><?php
                if ($type === 'image') echo thumb($val);
                elseif ($k === 'status') echo status_badge($val ?: 'published');
                elseif ($type === 'select') echo e($sc['fields'][$k][2]['options'][$val] ?? $val);
                elseif ($type === 'date') echo e(fdate($val));
                elseif ($k === $sc['title']) echo '<strong>' . e($val) . '</strong>';
                else echo e(plain($val, 80));
              ?></td>
            <?php endforeach; ?>
            <td class="w-act"><div class="row-actions">
              <?php if (!empty($sc['slug']) && !empty($row['slug']) && !in_array($row['status'] ?? '', ['draft'], true)): ?><a class="icon-btn" href="<?= e(url($sc['public'] . $row['slug'])) ?>" target="_blank" title="View on site">↗</a><?php endif; ?>
              <?= delete_button($view, $row['id'], '"' . ($row[$sc['title']] ?? 'item') . '"') ?>
            </div></td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    </div>
    <?php
}

function field_html(string $key, array $f, $value, string $hintField = ''): string {
    [$label, $type, $o] = [$f[0], $f[1], $f[2] ?? []];
    $name = str_replace('.', '__', $key);
    $id = 'f-' . $name;
    if (($value === null || $value === '') && isset($o['default'])) $value = $o['default'] === 'today' ? date('Y-m-d') : $o['default'];
    $value = (string) ($value ?? '');
    $req = !empty($o['required']) ? ' required' : '';
    $ph = isset($o['placeholder']) ? ' placeholder="' . e($o['placeholder']) . '"' : '';
    $help = !empty($o['help']) ? '<small class="help">' . e($o['help']) . '</small>' : '';
    $cls = 'field' . (!empty($o['half']) ? ' half' : '') . ' t-' . $type;
    $h = '<div class="' . $cls . '"><label for="' . $id . '">' . e($label) . (!empty($o['required']) ? ' <b class="req">*</b>' : '') . '</label>';

    switch ($type) {
        case 'textarea':
            $h .= '<textarea id="' . $id . '" name="' . $name . '" rows="' . (int) ($o['rows'] ?? 3) . '"' . $req . $ph . '>' . e($value) . '</textarea>';
            break;
        case 'md':
            $h .= '<div class="md-tools" data-md-for="' . $id . '"><button type="button" data-md="## " title="Heading">H</button><button type="button" data-md="**" title="Bold"><b>B</b></button><button type="button" data-md="*" title="Italic"><i>I</i></button><button type="button" data-md="- " title="Bullet list">• List</button><button type="button" data-md="link" title="Link">Link</button><button type="button" data-md="img" title="Insert image">Image</button></div>'
                . '<textarea class="md" id="' . $id . '" name="' . $name . '" rows="' . (int) ($o['rows'] ?? 6) . '"' . $req . '>' . e($value) . '</textarea>';
            $help = '<small class="help">Formatting: <code>## Heading</code>, <code>**bold**</code>, <code>- list item</code>, <code>[link text](https://…)</code>. Leave a blank line between paragraphs.</small>';
            break;
        case 'lines':
            $h .= '<textarea id="' . $id . '" name="' . $name . '" rows="' . max(4, count(lines($value)) + 1) . '"' . $req . '>' . e($value) . '</textarea>';
            break;
        case 'select':
            $opts = $o['options'];
            $isList = array_keys($opts) === range(0, count($opts) - 1);
            $h .= '<select id="' . $id . '" name="' . $name . '">';
            foreach ($opts as $k => $lab) {
                $k = $isList ? $lab : $k;
                $h .= '<option value="' . e($k) . '"' . ((string) $k === $value ? ' selected' : '') . '>' . e($lab) . '</option>';
            }
            $h .= '</select>';
            break;
        case 'image':
            $src = media($value);
            $h .= '<div class="imgfield' . ($src ? ' has' : '') . '" data-imgfield data-max="' . (int) ($o['max'] ?? 1600) . '" data-hint="' . e($hintField) . '">'
                . '<input type="hidden" name="' . $name . '" value="' . e($value) . '">'
                . '<div class="img-drop" tabindex="0" role="button" aria-label="Upload ' . e($label) . '"><img src="' . e($src) . '" alt=""' . ($src ? '' : ' hidden') . '>'
                . '<div class="img-empty">' . icon('upload') . '<strong>Drop an image or click to upload</strong><small>JPG, PNG, WebP</small></div><div class="img-progress"><span></span></div></div>'
                . '<div class="img-actions"><button type="button" class="btn sm" data-img-upload>' . icon('upload') . ' Upload new</button><button type="button" class="btn sm ghost" data-img-library>Choose from library</button><button type="button" class="btn sm ghost danger-text" data-img-remove>Remove</button></div>'
                . '<input type="file" accept="image/*" hidden></div>';
            break;
        case 'gallery':
            $h .= '<div class="gallery-field" data-gallery data-hint="' . e($hintField) . '"><input type="hidden" name="' . $name . '" value="' . e($value) . '"><div class="g-items">';
            foreach (lines($value) as $g) $h .= '<span class="g-item" data-path="' . e($g) . '"><img src="' . e(media($g)) . '" alt=""><button type="button" aria-label="Remove">×</button></span>';
            $h .= '</div><button type="button" class="btn sm" data-g-add>' . icon('plus') . ' Add photos</button><input type="file" accept="image/*" multiple hidden></div>';
            break;
        default:
            $t = ['date' => 'date', 'number' => 'number', 'url' => 'url'][$type] ?? 'text';
            $list = '';
            if (!empty($o['list'])) {
                $list = ' list="' . $id . '-list"';
                $h .= '<datalist id="' . $id . '-list">' . implode('', array_map(function ($x) { return '<option value="' . e($x) . '">'; }, $o['list'])) . '</datalist>';
            }
            $h .= '<input id="' . $id . '" type="' . $t . '" name="' . $name . '" value="' . e($value) . '"' . $req . $ph . $list . '>';
    }
    return $h . $help . '</div>';
}

function collection_form(string $view, array $sc, ?array $item): void {
    $isNew = !$item;
    $item = $item ?? [];
    ?>
    <form method="post" class="edit-form" data-dirty-guard>
      <?= csrf_field() ?><input type="hidden" name="op" value="save"><input type="hidden" name="id" value="<?= e($item['id'] ?? '') ?>">
      <div class="page-head sticky">
        <div><a class="back" href="?view=<?= e($view) ?>">← <?= e($sc['label']) ?></a><h1><?= $isNew ? 'New ' . e(strtolower($sc['singular'])) : e($item[$sc['title']] ?? 'Edit') ?></h1></div>
        <div class="head-actions">
          <?php if (!$isNew && !empty($sc['slug']) && ($item['status'] ?? '') !== 'draft'): ?><a class="btn ghost" href="<?= e(url($sc['public'] . $item['slug'])) ?>" target="_blank">View on site ↗</a><?php endif; ?>
          <button class="btn primary" type="submit"><?= icon('check') ?> Save</button>
        </div>
      </div>
      <div class="card pad form-grid">
        <?php foreach ($sc['fields'] as $k => $f) echo field_html($k, $f, $item[$k] ?? null, 'f-' . $sc['title']); ?>
        <?php if (!empty($sc['slug'])): ?>
          <div class="field half"><label for="f-slug">URL slug</label><div class="prefix"><span><?= e(url($sc['public'])) ?></span><input id="f-slug" name="slug" value="<?= e($item['slug'] ?? '') ?>" placeholder="auto from title"></div><small class="help">Leave blank to generate from the title. Changing it changes the page address.</small></div>
        <?php endif; ?>
      </div>
      <div class="form-foot"><button class="btn primary lg" type="submit"><?= icon('check') ?> Save <?= e(strtolower($sc['singular'])) ?></button></div>
    </form>
    <?php
}

function settings_sections(): array {
    $stats = [];
    for ($i = 0; $i < 4; $i++) {
        $stats["stats.$i.value"] = ['Stat ' . ($i + 1) . ' number', 'text', ['half' => true]];
        $stats["stats.$i.suffix"] = ['Suffix', 'text', ['half' => true, 'placeholder' => '+ or %']];
        $stats["stats.$i.label"] = ['Label', 'text', []];
    }
    return [
        'branding' => ['Logo & branding', [
            'site_name' => ['Company name', 'text', ['required' => true, 'half' => true]],
            'tagline' => ['Tagline', 'text', ['half' => true]],
            'logo' => ['Main logo', 'image', ['help' => 'Shown in the header. A transparent PNG works best.', 'max' => 800]],
            'logo_footer' => ['Footer logo', 'image', ['help' => 'Shown on the dark footer (displayed in white).', 'max' => 800]],
            'favicon' => ['Browser tab icon (favicon)', 'image', ['help' => 'Square image, at least 64×64.', 'max' => 256]],
            'og_image' => ['Social share image', 'image', ['help' => 'Shown when the site is shared on LinkedIn/Facebook. 1200×630 is ideal.', 'max' => 1200]],
        ]],
        'homepage' => ['Homepage hero', [
            'hero.eyebrow' => ['Small label', 'text', []],
            'hero.title' => ['Headline', 'text', ['required' => true]],
            'hero.note' => ['Small note under the buttons', 'text', []],
            'hero.subtitle' => ['Sub-headline', 'textarea', ['rows' => 2]],
            'hero.image' => ['Main hero photo', 'image', ['max' => 1200]],
            'hero.image_2' => ['Second photo', 'image', ['max' => 800]],
            'hero.image_3' => ['Third photo', 'image', ['max' => 800]],
        ]],
        'stats' => ['Stats', $stats],
        'careers' => ['Careers page', [
            'careers.headline' => ['Headline', 'text', []],
            'careers.intro' => ['Intro', 'textarea', ['rows' => 3]],
            'careers.image' => ['Hero photo', 'image', ['max' => 1200]],
            'careers.benefits' => ['Benefits (shown on careers page)', 'lines', ['help' => 'One per line.']],
        ]],
        'contact' => ['Contact & social', [
            'contact.email' => ['Sales email', 'text', ['half' => true]],
            'contact.careers_email' => ['Careers email', 'text', ['half' => true]],
            'contact.booking_url' => ['Discovery call booking link', 'url', ['half' => true]],
            'contact.scorecard_url' => ['Capacity test link', 'url', ['half' => true]],
            'contact.au_address' => ['Australia address', 'text', ['half' => true]],
            'contact.au_phone' => ['Australia phone', 'text', ['half' => true]],
            'contact.ca_address' => ['Canada address', 'text', ['half' => true]],
            'contact.ca_phone' => ['Canada phone', 'text', ['half' => true]],
            'social.linkedin' => ['LinkedIn', 'url', ['half' => true]],
            'social.facebook' => ['Facebook', 'url', ['half' => true]],
            'social.instagram' => ['Instagram', 'url', ['half' => true]],
        ]],
        'seo' => ['SEO', [
            'seo.home_title' => ['Homepage title tag', 'text', ['help' => 'About 50 to 60 characters. Shown as the Google result headline.']],
            'seo.home_description' => ['Homepage meta description', 'textarea', ['rows' => 3, 'help' => 'About 140 to 160 characters. Shown under the headline in Google.']],
        ]],
        'privacy' => ['Privacy policy', [
            'privacy' => ['Privacy policy page', 'md', ['rows' => 24]],
        ]],
    ];
}

function get_path(array $arr, string $path) {
    foreach (explode('.', $path) as $k) {
        if (!is_array($arr) || !array_key_exists($k, $arr)) return '';
        $arr = $arr[$k];
    }
    return is_array($arr) ? '' : $arr;
}

function settings_view(array $s, string $tab): void {
    $secs = settings_sections();
    if (!isset($secs[$tab])) $tab = 'branding';
    ?>
    <form method="post" class="edit-form" data-dirty-guard>
      <?= csrf_field() ?><input type="hidden" name="op" value="save"><input type="hidden" name="tab" value="<?= e($tab) ?>" data-tab-input>
      <div class="page-head sticky"><div><h1>Logo &amp; settings</h1><p class="muted">Brand, homepage, contact details and SEO.</p></div><button class="btn primary"><?= icon('check') ?> Save settings</button></div>
      <div class="settings-tabs" role="tablist">
        <?php foreach ($secs as $k => $sec): ?><button type="button" role="tab" data-tab="<?= e($k) ?>" aria-selected="<?= $k === $tab ? 'true' : 'false' ?>"><?= e($sec[0]) ?></button><?php endforeach; ?>
      </div>
      <?php foreach ($secs as $k => $sec): ?>
        <div class="card pad form-grid" data-panel="<?= e($k) ?>"<?= $k === $tab ? '' : ' hidden' ?>>
          <?php foreach ($sec[1] as $key => $f) echo field_html($key, $f, get_path($s, $key), 'f-site_name'); ?>
        </div>
      <?php endforeach; ?>
    </form>
    <?php
}
