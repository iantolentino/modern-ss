<?php
// Admin portal at /admin/, routed by backend/router.php (bootstrap and layout are already loaded).
require __DIR__ . '/ui.php';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
start_session();

$schemas = require __DIR__ . '/schema.php';
$view = isset($_GET['view']) && is_string($_GET['view']) ? $_GET['view'] : 'dashboard';
$action = isset($_GET['action']) && is_string($_GET['action']) ? $_GET['action'] : '';
$users = load('users');

/* ---------- Auth ---------- */

function current_user(): ?array {
    if (empty($_SESSION['uid'])) return null;
    if (time() - ($_SESSION['seen'] ?? 0) > 8 * 3600) { session_destroy(); return null; }
    $_SESSION['seen'] = time();
    foreach (load('users') as $u) if ($u['id'] === $_SESSION['uid']) return $u;
    return null;
}

function setup_allowed(): bool {
    $local = in_array(client_ip(), ['127.0.0.1', '::1'], true);
    $tok = (string) cfg('setup_token');
    return $local || ($tok !== '' && hash_equals($tok, (string) ($_GET['token'] ?? $_POST['token'] ?? '')));
}

function go(string $q = '', string $flash = ''): void {
    if ($flash) $_SESSION['flash'] = $flash;
    header('Location: ' . url('admin/' . ($q ? '?' . $q : '')));
    exit;
}

if ($action === 'logout') {
    session_destroy();
    header('Location: ' . url('admin/'));
    exit;
}

// First-run: create the first administrator
if (!$users) {
    $err = '';
    if (!setup_allowed()) {
        auth_page('Setup locked', '<p class="muted">Create the first admin from this server\'s localhost, or set <code>setup_token</code> in <code>backend/config.php</code> and open <code>/admin/?token=YOUR_TOKEN</code>.</p>');
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $name = clean('name', 80); $email = strtolower(clean('email', 160)); $pw = (string) ($_POST['password'] ?? '');
        if (!csrf_check()) $err = 'Session expired, try again.';
        elseif ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $err = 'Enter your name and a valid email.';
        elseif (strlen($pw) < 10) $err = 'Password must be at least 10 characters.';
        else {
            save('users', [['id' => uid(), 'name' => $name, 'email' => $email, 'hash' => password_hash($pw, PASSWORD_DEFAULT), 'created' => date('c')]]);
            go('', 'Admin account created. Please sign in.');
        }
    }
    auth_page('Create your admin account', ($err ? '<div class="alert err">' . e($err) . '</div>' : '') . '
      <form method="post" class="stack">' . csrf_field() . '<input type="hidden" name="token" value="' . e($_GET['token'] ?? '') . '">
        <label>Your name<input name="name" required autocomplete="name"></label>
        <label>Email<input type="email" name="email" required autocomplete="email"></label>
        <label>Password <small>(10+ characters)</small><input type="password" name="password" required minlength="10" autocomplete="new-password"></label>
        <button class="btn primary block">Create account</button>
      </form>');
}

$me = current_user();
if (!$me) {
    $err = '';
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $email = strtolower(clean('email', 160));
        if (!csrf_check()) $err = 'Session expired, try again.';
        elseif (rate_limited('login', 8, 900)) $err = 'Too many attempts. Wait 15 minutes and try again.';
        else {
            foreach ($users as $u) {
                if (hash_equals($u['email'], $email) && password_verify((string) ($_POST['password'] ?? ''), $u['hash'])) {
                    session_regenerate_id(true);
                    $_SESSION['uid'] = $u['id'];
                    $_SESSION['seen'] = time();
                    go();
                }
            }
            $err = 'Incorrect email or password.';
        }
    }
    $flash = $_SESSION['flash'] ?? ''; unset($_SESSION['flash']);
    auth_page('Sign in to manage your site', ($flash ? '<div class="alert ok">' . e($flash) . '</div>' : '') . ($err ? '<div class="alert err">' . e($err) . '</div>' : '') . '
      <form method="post" class="stack">' . csrf_field() . '
        <label>Email<input type="email" name="email" required autocomplete="username" autofocus></label>
        <label>Password<input type="password" name="password" required autocomplete="current-password"></label>
        <button class="btn primary block">Sign in</button>
      </form>');
}

/* ---------- JSON / file endpoints ---------- */

function json_out($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

if ($action === 'upload') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_check()) json_out(['error' => 'Invalid request'], 400);
    $f = $_FILES['file'] ?? null;
    if (!$f || $f['error'] !== UPLOAD_ERR_OK) json_out(['error' => 'Upload failed'], 400);
    if ($f['size'] > 8 * 1024 * 1024) json_out(['error' => 'Image must be under 8 MB'], 400);
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
    $exts = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif', 'image/x-icon' => 'ico', 'image/vnd.microsoft.icon' => 'ico'];
    if (!isset($exts[$mime]) || ($mime !== 'image/x-icon' && $mime !== 'image/vnd.microsoft.icon' && !@getimagesize($f['tmp_name']))) json_out(['error' => 'Only JPG, PNG, WebP, GIF or ICO images'], 400);
    $hint = slugify(mb_substr((string) ($_POST['hint'] ?? 'image'), 0, 60));
    $dir = 'uploads/' . date('Y/m');
    if (!is_dir(ROOT_DIR . '/' . $dir)) mkdir(ROOT_DIR . '/' . $dir, 0755, true);
    $name = $hint . '-' . bin2hex(random_bytes(3)) . '.' . $exts[$mime];
    if (!move_uploaded_file($f['tmp_name'], ROOT_DIR . '/' . $dir . '/' . $name)) json_out(['error' => 'Could not save file'], 500);
    json_out(['path' => $dir . '/' . $name, 'url' => url($dir . '/' . $name)]);
}

/** Uploaded images first (newest first), then the built-in site images, which cannot be deleted. */
function media_files(): array {
    $out = [];
    foreach (['uploads' => UPLOAD_DIR, 'assets/media' => ROOT_DIR . '/assets/media'] as $prefix => $dir) {
        if (!is_dir($dir)) continue;
        $rows = [];
        $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS));
        foreach ($it as $file) {
            if (!preg_match('/\.(jpe?g|png|webp|gif|ico)$/i', $file->getFilename())) continue;
            $rel = $prefix . '/' . str_replace('\\', '/', substr($file->getPathname(), strlen($dir) + 1));
            $rows[] = ['path' => $rel, 'url' => url($rel), 'name' => $file->getFilename(), 'size' => $file->getSize(),
                'time' => $file->getMTime(), 'builtin' => $prefix !== 'uploads'];
        }
        usort($rows, function ($a, $b) { return $b['time'] <=> $a['time'] ?: strcmp($a['path'], $b['path']); });
        $out = array_merge($out, $rows);
    }
    return $out;
}

if ($action === 'media') json_out(media_files());

if ($action === 'resume') {
    $id = (string) ($_GET['id'] ?? '');
    foreach (load('applications') as $a) {
        if ($a['id'] === $id && preg_match('/^[\w.-]+$/', $a['resume']) && is_file(PRIVATE_DIR . '/resumes/' . $a['resume'])) {
            $ext = pathinfo($a['resume'], PATHINFO_EXTENSION);
            header('Content-Type: ' . ($ext === 'pdf' ? 'application/pdf' : 'application/octet-stream'));
            header('Content-Disposition: ' . ($ext === 'pdf' ? 'inline' : 'attachment') . '; filename="' . slugify($a['first_name'] . '-' . $a['last_name']) . '-resume.' . $ext . '"');
            readfile(PRIVATE_DIR . '/resumes/' . $a['resume']);
            exit;
        }
    }
    http_response_code(404); exit('Not found');
}

/* ---------- POST handlers ---------- */

function set_path(array &$arr, string $path, $value): void {
    $ref = &$arr;
    foreach (explode('.', $path) as $k) {
        if (!isset($ref[$k]) || !is_array($ref[$k])) $ref[$k] = $ref[$k] ?? [];
        $ref = &$ref[$k];
    }
    $ref = $value;
}

function collect_fields(array $fields, array $src): array {
    $out = [];
    foreach ($fields as $key => $f) {
        $raw = $src[str_replace('.', '__', $key)] ?? '';
        $raw = is_string($raw) ? trim($raw) : '';
        $type = $f[1];
        if ($type === 'number') $raw = (string) (int) $raw;
        elseif ($type === 'url' && $raw !== '' && !preg_match('#^(https?://|mailto:|tel:|/)#i', $raw)) $raw = 'https://' . $raw;
        elseif (in_array($type, ['image'], true) && $raw !== '' && !preg_match('#^(uploads/|assets/media/|https?://)#i', $raw)) $raw = '';
        elseif ($type === 'gallery') $raw = implode("\n", array_filter(lines($raw), function ($l) { return (bool) preg_match('#^(uploads/|assets/media/|https?://)#i', $l); }));
        elseif ($type === 'date' && $raw !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $raw)) $raw = '';
        elseif ($type === 'select') {
            $opts = $f[2]['options'];
            $keys = array_keys($opts) === range(0, count($opts) - 1) ? $opts : array_keys($opts);
            if (!in_array($raw, $keys, true)) $raw = (string) $keys[0];
        }
        $out[$key] = $raw;
    }
    return $out;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_check()) go('view=' . rawurlencode($view), 'Your session expired. Please try again.');
    $op = (string) ($_POST['op'] ?? '');

    if (isset($schemas[$view])) {
        $sc = $schemas[$view];
        $list = load($view);
        $id = (string) ($_POST['id'] ?? '');
        if ($op === 'delete') {
            $list = array_values(array_filter($list, function ($i) use ($id) { return $i['id'] !== $id; }));
            save($view, $list);
            go('view=' . $view, $sc['singular'] . ' deleted.');
        }
        if ($op === 'reorder') {
            $ids = array_flip(array_map('strval', (array) ($_POST['ids'] ?? [])));
            foreach ($list as &$i) if (isset($ids[$i['id']])) $i['order'] = $ids[$i['id']] + 1;
            unset($i);
            save($view, $list);
            json_out(['ok' => true]);
        }
        if ($op === 'save') {
            $data = collect_fields($sc['fields'], $_POST);
            foreach ($sc['fields'] as $k => $f) {
                if (!empty($f[2]['required']) && $data[$k] === '') go('view=' . $view . '&edit=' . rawurlencode($id ?: 'new'), $f[0] . ' is required.');
            }
            if (!empty($sc['slug'])) {
                $slug = slugify(trim((string) ($_POST['slug'] ?? '')) ?: $data[$sc['title']]);
                $base = $slug; $n = 2;
                $taken = array_column(array_filter($list, function ($i) use ($id) { return $i['id'] !== $id; }), 'slug');
                while (in_array($slug, $taken, true)) $slug = $base . '-' . $n++;
                $data['slug'] = $slug;
            }
            $found = false;
            foreach ($list as &$i) {
                if ($i['id'] === $id) { $i = array_merge($i, $data, ['updated' => date('Y-m-d')]); $found = true; }
            }
            unset($i);
            if (!$found) {
                $id = uid();
                if (isset($sc['fields']['order']) && $data['order'] === '0') $data['order'] = (string) (count($list) + 1);
                $list[] = ['id' => $id] + $data + ['created' => date('c')];
            }
            save($view, $list);
            go('view=' . $view . '&edit=' . $id, $sc['singular'] . ' saved.');
        }
    }

    if ($view === 'settings' && $op === 'save') {
        $s = load('settings');
        foreach (settings_sections() as $sec) {
            foreach (collect_fields($sec['fields'], $_POST) as $k => $v) set_path($s, $k, $v);
        }
        save('settings', $s);
        go('view=settings&tab=' . rawurlencode((string) ($_POST['tab'] ?? '')), 'Settings saved.');
    }

    if (in_array($view, ['applications', 'leads'], true)) {
        $list = load($view);
        $id = (string) ($_POST['id'] ?? '');
        if ($op === 'status') {
            $st = in_array($_POST['status'] ?? '', ['new', 'reviewing', 'shortlisted', 'contacted', 'rejected', 'hired', 'closed'], true) ? $_POST['status'] : 'new';
            foreach ($list as &$i) if ($i['id'] === $id) $i['status'] = $st;
            unset($i);
            save($view, $list);
            go('view=' . $view, 'Status updated.');
        }
        if ($op === 'delete') {
            foreach ($list as $i) {
                if ($i['id'] === $id && !empty($i['resume']) && preg_match('/^[\w.-]+$/', $i['resume'])) @unlink(PRIVATE_DIR . '/resumes/' . $i['resume']);
            }
            save($view, array_values(array_filter($list, function ($i) use ($id) { return $i['id'] !== $id; })));
            go('view=' . $view, 'Deleted.');
        }
    }

    if ($view === 'media' && $op === 'delete') {
        $path = (string) ($_POST['path'] ?? '');
        $real = realpath(ROOT_DIR . '/' . $path);
        $up = realpath(UPLOAD_DIR);
        if ($real && $up && strpos($real, $up . DIRECTORY_SEPARATOR) === 0 && is_file($real)) unlink($real);
        go('view=media', 'Image deleted.');
    }

    if ($view === 'users') {
        if ($op === 'add') {
            $name = clean('name', 80); $email = strtolower(clean('email', 160)); $pw = (string) ($_POST['password'] ?? '');
            if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($pw) < 10) go('view=users', 'Enter a name, a valid email and a password of 10+ characters.');
            if (in_array($email, array_column($users, 'email'), true)) go('view=users', 'That email already has an account.');
            $users[] = ['id' => uid(), 'name' => $name, 'email' => $email, 'hash' => password_hash($pw, PASSWORD_DEFAULT), 'created' => date('c')];
            save('users', $users);
            go('view=users', 'User added.');
        }
        if ($op === 'delete') {
            $id = (string) ($_POST['id'] ?? '');
            if ($id === $me['id']) go('view=users', 'You cannot remove your own account.');
            save('users', array_values(array_filter($users, function ($u) use ($id) { return $u['id'] !== $id; })));
            go('view=users', 'User removed.');
        }
        if ($op === 'password') {
            $pw = (string) ($_POST['password'] ?? '');
            if (!password_verify((string) ($_POST['current'] ?? ''), $me['hash'])) go('view=users', 'Current password is incorrect.');
            if (strlen($pw) < 10) go('view=users', 'New password must be at least 10 characters.');
            foreach ($users as &$u) if ($u['id'] === $me['id']) $u['hash'] = password_hash($pw, PASSWORD_DEFAULT);
            unset($u);
            save('users', $users);
            go('view=users', 'Password changed.');
        }
    }
    go('view=' . rawurlencode($view));
}

/* ---------- Views ---------- */

$flash = $_SESSION['flash'] ?? ''; unset($_SESSION['flash']);
admin_head($view, $me, $schemas, $flash);

if ($view === 'dashboard') {
    $apps = load('applications'); $leads = load('leads');
    $newApps = count(array_filter($apps, function ($a) { return ($a['status'] ?? '') === 'new'; }));
    $newLeads = count(array_filter($leads, function ($a) { return ($a['status'] ?? '') === 'new'; }));
    $openJobs = count(array_filter(load('jobs'), function ($j) { return ($j['status'] ?? '') === 'open'; }));
    ?>
    <div class="page-head"><div><h1>Welcome back, <?= e(explode(' ', $me['name'])[0]) ?></h1><p class="muted">What would you like to update today?</p></div></div>
    <div class="kpis">
      <a class="kpi" href="?view=jobs"><span class="kpi-ic"><?= icon('brief') ?></span><strong><?= $openJobs ?></strong><span>Open jobs</span></a>
      <a class="kpi" href="?view=applications"><span class="kpi-ic"><?= icon('users') ?></span><strong><?= $newApps ?></strong><span>New applications</span></a>
      <a class="kpi" href="?view=leads"><span class="kpi-ic"><?= icon('mail') ?></span><strong><?= $newLeads ?></strong><span>New enquiries</span></a>
      <a class="kpi" href="?view=insights"><span class="kpi-ic"><?= icon('spark') ?></span><strong><?= count(load('insights')) ?></strong><span>Articles</span></a>
    </div>
    <h2 class="sec-title">Quick actions</h2>
    <div class="quick">
      <a class="qa" href="?view=jobs&edit=new"><?= icon('plus') ?><strong>Post a new job</strong><span>Add an opening to the careers page</span></a>
      <a class="qa" href="?view=insights&edit=new"><?= icon('plus') ?><strong>Write an article</strong><span>Publish news to Insights</span></a>
      <a class="qa" href="?view=team&edit=new"><?= icon('upload') ?><strong>Add a team photo</strong><span>Upload a photo with name &amp; title</span></a>
      <a class="qa" href="?view=settings&tab=branding"><?= icon('layers') ?><strong>Change logo</strong><span>Update logo, favicon &amp; brand images</span></a>
    </div>
    <?php if ($apps): ?>
    <h2 class="sec-title">Latest applications</h2>
    <div class="card"><table class="table">
      <thead><tr><th>Applicant</th><th>Position</th><th>Received</th><th>Status</th></tr></thead>
      <tbody><?php foreach (array_slice(array_reverse($apps), 0, 5) as $a): ?>
        <tr><td><strong><?= e($a['first_name'] . ' ' . $a['last_name']) ?></strong><br><small class="muted"><?= e($a['email']) ?></small></td><td><?= e($a['job_title']) ?></td><td><?= e(fdate($a['date'], 'j M, g:ia')) ?></td><td><?= status_badge($a['status']) ?></td></tr>
      <?php endforeach; ?></tbody>
    </table></div>
    <?php endif;

} elseif (isset($schemas[$view])) {
    $sc = $schemas[$view];
    $list = load($view);
    $edit = isset($_GET['edit']) && is_string($_GET['edit']) ? $_GET['edit'] : null;
    if ($edit !== null) {
        $item = null;
        foreach ($list as $i) if ($i['id'] === $edit) $item = $i;
        if (!$item && $edit !== 'new') go('view=' . $view);
        collection_form($view, $sc, $item);
    } else {
        collection_list($view, $sc, $list);
    }

} elseif ($view === 'settings') {
    settings_view(load('settings'), (string) ($_GET['tab'] ?? 'branding'));

} elseif ($view === 'applications') {
    $apps = array_reverse(load('applications'));
    $filter = (string) ($_GET['job'] ?? '');
    $jobs = array_values(array_unique(array_column($apps, 'job_title')));
    if ($filter !== '') $apps = array_values(array_filter($apps, function ($a) use ($filter) { return $a['job_title'] === $filter; }));
    ?>
    <div class="page-head"><div><h1>Applications</h1><p class="muted">Candidates who applied through the careers page.</p></div>
    <?php if ($jobs): ?><form class="inline-filter"><input type="hidden" name="view" value="applications"><select name="job" onchange="this.form.submit()"><option value="">All positions</option><?php foreach ($jobs as $j): ?><option<?= $j === $filter ? ' selected' : '' ?>><?= e($j) ?></option><?php endforeach; ?></select></form><?php endif; ?></div>
    <?php if (!$apps): ?><div class="card empty-state"><?= icon('users') ?><h3>No applications yet</h3><p class="muted">They'll appear here when candidates apply.</p></div><?php else: ?>
    <div class="card"><table class="table">
      <thead><tr><th>Applicant</th><th>Position</th><th>Details</th><th>Resume</th><th>Status</th><th></th></tr></thead>
      <tbody><?php foreach ($apps as $a): ?>
        <tr>
          <td><strong><?= e($a['first_name'] . ' ' . $a['last_name']) ?></strong><br><a href="mailto:<?= e($a['email']) ?>"><?= e($a['email']) ?></a><br><small class="muted"><?= e($a['phone']) ?></small></td>
          <td><?= e($a['job_title']) ?><br><small class="muted"><?= e(fdate($a['date'], 'j M Y, g:ia')) ?></small></td>
          <td><small><?= e($a['schedule']) ?> · <?= e($a['availability']) ?></small><?php if ($a['message']): ?><br><small class="muted"><?= e(plain($a['message'], 90)) ?></small><?php endif; ?></td>
          <td><a class="btn sm" href="?action=resume&id=<?= e($a['id']) ?>" target="_blank"><?= icon('upload', 'i rot') ?> Resume</a></td>
          <td><?= status_select('applications', $a, ['new', 'reviewing', 'shortlisted', 'rejected', 'hired']) ?></td>
          <td><?= delete_button('applications', $a['id'], 'this application and resume') ?></td>
        </tr>
      <?php endforeach; ?></tbody>
    </table></div>
    <?php endif;

} elseif ($view === 'leads') {
    $leads = array_reverse(load('leads')); ?>
    <div class="page-head"><div><h1>Enquiries</h1><p class="muted">Messages from the contact form.</p></div></div>
    <?php if (!$leads): ?><div class="card empty-state"><?= icon('mail') ?><h3>No enquiries yet</h3></div><?php else: ?>
    <div class="card"><table class="table">
      <thead><tr><th>Contact</th><th>Agency</th><th>Message</th><th>Status</th><th></th></tr></thead>
      <tbody><?php foreach ($leads as $l): ?>
        <tr>
          <td><strong><?= e($l['first_name'] . ' ' . $l['last_name']) ?></strong><br><a href="mailto:<?= e($l['email']) ?>"><?= e($l['email']) ?></a><br><small class="muted"><?= e($l['phone']) ?></small></td>
          <td><?= e($l['company']) ?><br><small class="muted"><?= e($l['country']) ?><?= $l['role'] ? ' · ' . e($l['role']) : '' ?></small></td>
          <td><small><?= nl2br(e($l['message'])) ?></small><br><small class="muted"><?= e(fdate($l['date'], 'j M Y, g:ia')) ?></small></td>
          <td><?= status_select('leads', $l, ['new', 'contacted', 'closed']) ?></td>
          <td><?= delete_button('leads', $l['id'], 'this enquiry') ?></td>
        </tr>
      <?php endforeach; ?></tbody>
    </table></div>
    <?php endif;

} elseif ($view === 'media') {
    $files = media_files(); ?>
    <div class="page-head"><div><h1>Media library</h1><p class="muted">Every image you've uploaded. Drop new images here to add them.</p></div>
      <label class="btn primary"><?= icon('upload') ?> Upload images<input type="file" accept="image/*" multiple hidden data-media-upload></label></div>
    <div class="dropzone card" data-media-drop><?= icon('upload') ?><p>Drag &amp; drop images here</p><small class="muted">JPG, PNG or WebP. Large photos are resized automatically.</small></div>
    <div class="media-grid">
      <?php foreach ($files as $f): ?>
        <figure class="media-item">
          <img src="<?= e($f['url']) ?>" alt="" loading="lazy">
          <figcaption><span title="<?= e($f['name']) ?>"><?= e($f['name']) ?></span><small><?= round($f['size'] / 1024) ?> KB</small></figcaption>
          <?php if (!$f['builtin']): ?><form method="post" onsubmit="return confirm('Delete this image? Pages using it will show no image.')"><?= csrf_field() ?><input type="hidden" name="op" value="delete"><input type="hidden" name="path" value="<?= e($f['path']) ?>"><button class="icon-btn danger" title="Delete"><?= icon('close') ?></button></form><?php endif; ?>
        </figure>
      <?php endforeach; ?>
    </div>
    <?php if (!$files): ?><p class="muted center">No uploads yet.</p><?php endif;

} elseif ($view === 'users') { ?>
    <div class="page-head"><div><h1>Users &amp; security</h1><p class="muted">People who can sign in to this portal.</p></div></div>
    <div class="grid2">
      <div class="card pad">
        <h2 class="card-title">Admin users</h2>
        <ul class="user-list"><?php foreach ($users as $u): ?>
          <li><span class="avatar-sm"><?= e(mb_strtoupper(mb_substr($u['name'], 0, 1))) ?></span><span><strong><?= e($u['name']) ?></strong><small class="muted"><?= e($u['email']) ?></small></span>
            <?php if ($u['id'] !== $me['id']): ?><?= delete_button('users', $u['id'], $u['name'] . '\'s access') ?><?php else: ?><span class="badge">You</span><?php endif; ?></li>
        <?php endforeach; ?></ul>
        <h3 class="card-title sm">Add a user</h3>
        <form method="post" class="stack"><?= csrf_field() ?><input type="hidden" name="op" value="add">
          <label>Name<input name="name" required></label>
          <label>Email<input type="email" name="email" required></label>
          <label>Temporary password <small>(10+ characters)</small><input type="password" name="password" minlength="10" required autocomplete="new-password"></label>
          <button class="btn primary">Add user</button>
        </form>
      </div>
      <div class="card pad">
        <h2 class="card-title">Change your password</h2>
        <form method="post" class="stack"><?= csrf_field() ?><input type="hidden" name="op" value="password">
          <label>Current password<input type="password" name="current" required autocomplete="current-password"></label>
          <label>New password<input type="password" name="password" minlength="10" required autocomplete="new-password"></label>
          <button class="btn primary">Update password</button>
        </form>
      </div>
    </div>
<?php } else {
    echo '<div class="card empty-state"><h3>Page not found</h3></div>';
}

admin_foot();
