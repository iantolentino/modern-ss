<?php
start_session(); // must precede output so the CSRF cookie is sent

/** Converts a "one item per line" field (with optional "## " sub-headings) to markdown. */
function job_list_md(string $text): string {
    return implode("\n", array_map(function ($l) {
        return strpos($l, '## ') === 0 ? "\n### " . substr($l, 3) . "\n" : '- ' . $l;
    }, lines($text)));
}
$open = ($job['status'] ?? 'open') === 'open';
$errors = [];
$sent = false;
$old = [];

if ($open && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $old = $_POST;
    if (!csrf_check()) $errors[] = 'Your session expired. Please submit the form again.';
    if (!empty($_POST['website'])) $errors[] = 'Submission blocked.';
    if (rate_limited('apply', 5, 3600)) $errors[] = 'Too many applications from your network. Please try again later.';
    $app = [
        'first_name' => clean('first_name', 80), 'last_name' => clean('last_name', 80),
        'email' => clean('email', 160), 'phone' => clean('phone', 40),
        'schedule' => clean('schedule', 40), 'availability' => clean('availability', 40),
        'message' => clean('message', 3000),
    ];
    if ($app['first_name'] === '' || $app['last_name'] === '') $errors[] = 'Please enter your full name.';
    if (!filter_var($app['email'], FILTER_VALIDATE_EMAIL)) $errors[] = 'Please enter a valid email address.';
    if ($app['phone'] === '') $errors[] = 'Please enter your contact number.';

    $f = $_FILES['resume'] ?? null;
    $ext = $f ? strtolower(pathinfo((string) $f['name'], PATHINFO_EXTENSION)) : '';
    if (!$f || $f['error'] !== UPLOAD_ERR_OK) {
        $errors[] = 'Please attach your resume (PDF or Word, max 10 MB).';
    } else {
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
        $okMime = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'];
        if ($f['size'] > 10 * 1024 * 1024 || !in_array($ext, ['pdf', 'doc', 'docx'], true) || !in_array($mime, $okMime, true)) {
            $errors[] = 'Resume must be a PDF or Word document under 10 MB.';
        }
    }

    if (!$errors) {
        $file = date('Ymd-His') . '-' . bin2hex(random_bytes(5)) . '.' . $ext;
        if (!move_uploaded_file($f['tmp_name'], PRIVATE_DIR . '/resumes/' . $file)) {
            $errors[] = 'We could not save your resume. Please try again.';
        } else {
            $all = load('applications');
            $all[] = $app + ['id' => uid(), 'job_id' => $job['id'], 'job_title' => $job['title'], 'resume' => $file,
                'resume_name' => mb_substr(basename((string) $f['name']), 0, 120), 'date' => date('c'), 'status' => 'new'];
            save('applications', $all);
            send_mail((string) cfg('job_emails'), 'New application: ' . $job['title'],
                "Position: {$job['title']}\nName: {$app['first_name']} {$app['last_name']}\nEmail: {$app['email']}\nPhone: {$app['phone']}\nSchedule: {$app['schedule']}\nAvailability: {$app['availability']}\n\n{$app['message']}\n\nView and download the resume in the admin portal: " . abs_url('admin/?view=applications'),
                $app['email']);
            $sent = true;
            $old = [];
        }
    }
}

$crumbs = [['', 'Home'], ['careers', 'Careers'], ['careers/' . $job['slug'], $job['title']]];
$schema = [
    '@context' => 'https://schema.org', '@type' => 'JobPosting',
    'title' => $job['title'],
    'description' => md(($job['description'] ?? '') . "\n\n## Responsibilities\n\n" . job_list_md($job['responsibilities'] ?? '') . "\n\n## Requirements\n\n" . job_list_md($job['qualifications'] ?? '')),
    'datePosted' => $job['date'] ?? date('Y-m-d'),
    'employmentType' => stripos($job['type'] ?? '', 'part') !== false ? 'PART_TIME' : 'FULL_TIME',
    'hiringOrganization' => ['@type' => 'Organization', 'name' => setting('site_name'), 'sameAs' => abs_url(''), 'logo' => abs_url(media(setting('logo')))],
    'jobLocation' => ['@type' => 'Place', 'address' => ['@type' => 'PostalAddress', 'addressLocality' => 'Angeles City', 'addressRegion' => 'Pampanga', 'addressCountry' => 'PH']],
    'directApply' => true,
];
if (!empty($job['closes'])) $schema['validThrough'] = $job['closes'] . 'T23:59:59';

layout_head([
    'title' => $job['title'] . ' Job, ' . preg_replace('/,.*$/', '', $job['location'] ?? '') . ' | Strata Staff Careers',
    'description' => plain($job['summary'] ?: ($job['description'] ?? ''), 155),
    'path' => 'careers/' . $job['slug'],
    'schema' => $open ? [breadcrumb_schema($crumbs), $schema] : [breadcrumb_schema($crumbs)],
    'noindex' => !$open,
], 'careers');
$v = function ($k) use ($old) { return e($old[$k] ?? ''); };
?>
<section class="page-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="<?= e(url()) ?>">Home</a></li><li><a href="<?= e(url('careers')) ?>">Careers</a></li><li><span aria-current="page"><?= e($job['title']) ?></span></li></ol></nav>
    <p class="eyebrow"><?= e($job['department'] ?? 'Careers') ?></p>
    <h1><?= e($job['title']) ?></h1>
    <p class="lede"><?= e($job['summary'] ?? '') ?></p>
    <div class="job-tags">
      <span class="tag tag-light"><?= icon('pin') ?><?= e($job['location']) ?></span>
      <span class="tag tag-light"><?= icon('brief') ?><?= e($job['type']) ?></span>
      <?php if (!empty($job['schedule'])): ?><span class="tag tag-light"><?= icon('clock') ?><?= e($job['schedule']) ?></span><?php endif; ?>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap content-grid">
    <div class="prose reveal">
      <?php if (!$open): ?><div class="notice">This position is now closed. <a href="<?= e(url('careers')) ?>">See current openings</a>.</div><?php endif; ?>
      <?= md($job['description'] ?? '') ?>
      <?php foreach (['responsibilities' => 'Responsibilities', 'qualifications' => 'Requirements', 'benefits' => 'Benefits'] as $k => $h): $l = lines($job[$k] ?? ''); if ($l): ?>
        <h2><?= $h ?></h2>
        <?php // Lines starting with "## " are sub-headings that split the list
        $inList = false;
        foreach ($l as $x) {
            if (strpos($x, '## ') === 0) {
                if ($inList) echo '</ul>';
                echo '<h3 class="list-sub">' . e(substr($x, 3)) . '</h3>';
                $inList = false;
                continue;
            }
            if (!$inList) { echo '<ul class="checklist">'; $inList = true; }
            echo '<li>' . icon('check') . ' ' . e($x) . '</li>';
        }
        if ($inList) echo '</ul>'; ?>
      <?php endif; endforeach; ?>
    </div>
    <?php if ($open): ?>
    <aside class="side-card apply-card reveal" id="apply">
      <?php if ($sent): ?>
        <div class="success"><?= icon('check') ?><h2 class="h4">Application received</h2><p>Thanks for applying. Our recruitment team will review your application and get in touch.</p></div>
      <?php else: ?>
      <h2 class="h4">Apply for this role</h2>
      <?php if ($errors): ?><div class="form-errors" role="alert"><?php foreach ($errors as $er): ?><p><?= e($er) ?></p><?php endforeach; ?></div><?php endif; ?>
      <form method="post" enctype="multipart/form-data" action="#apply" class="form">
        <?= csrf_field() ?>
        <div class="hp-field" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
        <div class="row2">
          <label>First name<input name="first_name" required autocomplete="given-name" value="<?= $v('first_name') ?>"></label>
          <label>Last name<input name="last_name" required autocomplete="family-name" value="<?= $v('last_name') ?>"></label>
        </div>
        <label>Email<input type="email" name="email" required autocomplete="email" value="<?= $v('email') ?>"></label>
        <label>Contact number<input type="tel" name="phone" required autocomplete="tel" value="<?= $v('phone') ?>"></label>
        <div class="row2">
          <label>Work schedule<select name="schedule"><option>Dayshift</option><option<?= ($old['schedule'] ?? '') === 'Nightshift' ? ' selected' : '' ?>>Nightshift</option><option<?= ($old['schedule'] ?? '') === 'Either' ? ' selected' : '' ?>>Either</option></select></label>
          <label>Availability<select name="availability"><option>Immediately</option><option<?= ($old['availability'] ?? '') === 'Within 30 days' ? ' selected' : '' ?>>Within 30 days</option></select></label>
        </div>
        <label>Message <span class="opt">(optional)</span><textarea name="message" rows="3"><?= $v('message') ?></textarea></label>
        <label class="file-drop">
          <input type="file" name="resume" accept=".pdf,.doc,.docx" required>
          <?= icon('upload') ?><span data-file-label>Upload resume <small>PDF or Word, max 10 MB</small></span>
        </label>
        <button class="btn btn-primary btn-block" type="submit">Submit application <?= icon('arrow') ?></button>
        <p class="fine">By applying you agree to our <a href="<?= e(url('privacy')) ?>">privacy policy</a>.</p>
      </form>
      <?php endif; ?>
    </aside>
    <?php endif; ?>
  </div>
</section>
<?php layout_foot();
