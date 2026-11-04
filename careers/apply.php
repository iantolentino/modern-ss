<?php
/**
 * Job application handler, included by careers/job.php ($job, $open set there).
 * Sets $errors, $sent and $old for the page. Resumes go to database/data/private/resumes,
 * applications to database/data/applications.json, and HR is emailed at cfg('job_emails').
 */

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
