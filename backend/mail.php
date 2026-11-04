<?php
/** Outgoing mail for form notifications. */

declare(strict_types=1);

function send_mail(string $to, string $subject, string $body, string $replyTo = ''): bool {
    $headers = "From: Strata Staff Global <no-reply@" . preg_replace('/^www\./', '', (string) ($_SERVER['HTTP_HOST'] ?? 'localhost')) . ">\r\n";
    if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) $headers .= "Reply-To: $replyTo\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    return @mail($to, $subject, $body, $headers);
}
