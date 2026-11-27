<?php
/**
 * Discovery-call request handler, included by frontend/pages/contact.php.
 * Mirrors the fields of the Microsoft Bookings page (30-minute call, date, time in Philippine time,
 * name, email, phone, special requests). Our form cannot see the team's calendar, so the request is
 * saved under Enquiries and the time is confirmed by email.
 * Sets $bookErrors, $bookSent and $bookOld for the page.
 */

$bookSlots = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30']; // UTC+8, from the Bookings page
$bookErrors = [];
$bookSent = false;
$bookOld = [];

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && ($_POST['form'] ?? '') === 'booking') {
    $bookOld = $_POST;
    if (!csrf_check()) $bookErrors[] = 'Your session expired. Please try again.';
    if (!empty($_POST['website'])) $bookErrors[] = 'Submission blocked.';
    if (rate_limited('booking', 5, 3600)) $bookErrors[] = 'Too many requests. Please try again later or email us directly.';
    $b = [
        'name' => clean('name', 120), 'email' => clean('email', 160), 'phone' => clean('phone', 40),
        'date' => clean('date', 10), 'time' => clean('time', 5), 'notes' => clean('notes', 2000),
    ];
    $day = DateTime::createFromFormat('Y-m-d', $b['date'], new DateTimeZone('Asia/Manila'));
    $today = new DateTime('today', new DateTimeZone('Asia/Manila'));
    if ($b['name'] === '') $bookErrors[] = 'Please enter your first and last name.';
    if (!filter_var($b['email'], FILTER_VALIDATE_EMAIL)) $bookErrors[] = 'Please enter a valid email address.';
    if ($b['phone'] === '') $bookErrors[] = 'Please enter your phone number.';
    if (!$day || $day < $today || (int) $day->format('N') > 5) $bookErrors[] = 'Please choose a weekday from today onwards.';
    if (!in_array($b['time'], $bookSlots, true)) $bookErrors[] = 'Please choose a time.';
    if (!$bookErrors) {
        $when = $day->format('l j F Y') . ', ' . date('g:i A', strtotime($b['time'])) . ' Philippine time (UTC+8)';
        $all = load('leads');
        $all[] = ['id' => uid(), 'date' => date('c'), 'status' => 'new', 'first_name' => $b['name'], 'last_name' => '',
            'email' => $b['email'], 'phone' => $b['phone'], 'company' => '', 'country' => '',
            'role' => 'Discovery call request', 'message' => "Requested time: $when\n\n" . $b['notes']];
        save('leads', $all);
        send_mail((string) cfg('lead_emails'), 'Discovery call request: ' . $b['name'],
            "Requested time: $when\nName: {$b['name']}\nEmail: {$b['email']}\nPhone: {$b['phone']}\n\nSpecial requests:\n{$b['notes']}\n\nConfirm the time with the client and add it to the Free Consultation Call calendar.",
            $b['email']);
        send_mail($b['email'], 'Your discovery call request with Strata Staff',
            "Thanks for booking a 30-minute discovery call.\n\nRequested time: $when\n\nWe'll confirm the time by email shortly. If it doesn't suit, just reply to that email.\n\nStrata Staff Global");
        $bookSent = true;
        $bookOld = [];
    }
}
