<?php
/**
 * Contact form handler, included by frontend/pages/contact.php.
 * Sets $errors, $sent and $old (form values to refill) for the page.
 * Saved to database/data/leads.json and emailed to cfg('lead_emails').
 */

$errors = [];
$sent = false;
$old = ['role' => isset($_GET['role']) && is_string($_GET['role']) ? mb_substr($_GET['role'], 0, 100) : ''];

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $old = $_POST;
    if (!csrf_check()) $errors[] = 'Your session expired. Please submit the form again.';
    if (!empty($_POST['website'])) $errors[] = 'Submission blocked.';
    if (rate_limited('lead', 6, 3600)) $errors[] = 'Too many requests. Please try again later or email us directly.';
    $lead = [
        'first_name' => clean('first_name', 80), 'last_name' => clean('last_name', 80),
        'email' => clean('email', 160), 'phone' => clean('phone', 40),
        'company' => clean('company', 160), 'country' => clean('country', 20),
        'role' => clean('role', 100), 'message' => clean('message', 3000),
    ];
    if ($lead['first_name'] === '') $errors[] = 'Please enter your name.';
    if (!filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) $errors[] = 'Please enter a valid work email.';
    if ($lead['company'] === '') $errors[] = 'Please enter your agency name.';
    if (!$errors) {
        $all = load('leads');
        $all[] = $lead + ['id' => uid(), 'date' => date('c'), 'status' => 'new'];
        save('leads', $all);
        send_mail((string) cfg('lead_emails'), 'New enquiry: ' . $lead['company'],
            "Name: {$lead['first_name']} {$lead['last_name']}\nEmail: {$lead['email']}\nPhone: {$lead['phone']}\nAgency: {$lead['company']}\nCountry: {$lead['country']}\nRole of interest: {$lead['role']}\n\n{$lead['message']}",
            $lead['email']);
        $sent = true;
    }
}
