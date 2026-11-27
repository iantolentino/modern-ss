<?php
/**
 * "Email me my result" handler, included by the Hidden Capacity Test page.
 * Sets $mailErrors and $mailSent. The visitor gets their result by email; the enquiry is
 * saved to database/data/leads.json (shown under Enquiries in the admin) and sent to cfg('lead_emails').
 */

$mailErrors = [];
$mailSent = false;

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && ($_POST['form'] ?? '') === 'capacity') {
    if (!csrf_check()) $mailErrors[] = 'Your session expired. Please try again.';
    if (!empty($_POST['website'])) $mailErrors[] = 'Submission blocked.';
    if (rate_limited('capacity', 5, 3600)) $mailErrors[] = 'Too many requests. Please try again later.';
    $email = clean('email', 160);
    $hours = (int) preg_replace('/\D/', '', clean('result_hours', 12));
    $inputs = clean('result_inputs', 200);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $mailErrors[] = 'Please enter a valid email address.';
    if ($hours <= 0) $mailErrors[] = 'Enter your numbers in the test first.';
    if (!$mailErrors) {
        $weeks = number_format($hours / 40);
        $team = number_format($hours / 1920, 1);
        $summary = number_format($hours) . " hours a year on routine work: about $weeks full working weeks of manager time.\n"
            . "Team it would take: about $team specialists.\nYour inputs: $inputs";
        $all = load('leads');
        $all[] = ['id' => uid(), 'date' => date('c'), 'status' => 'new', 'email' => $email, 'first_name' => '', 'last_name' => '',
            'phone' => '', 'company' => '', 'country' => '', 'role' => 'Hidden Capacity Test', 'message' => $summary];
        save('leads', $all);
        send_mail($email, 'Your Hidden Capacity Test result',
            "Thanks for taking the Hidden Capacity Test.\n\n$summary\n\nThat time could go back to your clients and towards taking on more buildings.\n\n"
            . "Book a 30-minute discovery call: " . abs_url('contact') . "\n\nStrata Staff Global");
        send_mail((string) cfg('lead_emails'), 'Hidden Capacity Test result sent to ' . $email, $summary, $email);
        $mailSent = true;
    }
}
