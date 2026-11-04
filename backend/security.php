<?php
/** Sessions, CSRF, rate limiting and input cleaning. */

declare(strict_types=1);

/* ---------- Sessions & security ---------- */

function start_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_name('ssg_sess');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => APP_BASE . '/',
        'secure'   => $https,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function csrf_token(): string {
    start_session();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}

function csrf_field(): string {
    return '<input type="hidden" name="_csrf" value="' . e(csrf_token()) . '">';
}

function csrf_check(): bool {
    start_session();
    $t = $_POST['_csrf'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    return is_string($t) && !empty($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $t);
}

function client_ip(): string {
    return (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
}

/** Simple sliding-window rate limit, stored in database/data/private. */
function rate_limited(string $bucket, int $max, int $window): bool {
    $file = PRIVATE_DIR . '/rate-' . md5($bucket . client_ip()) . '.json';
    $now = time();
    $hits = is_file($file) ? (array) json_decode((string) file_get_contents($file), true) : [];
    $hits = array_values(array_filter($hits, function ($t) use ($now, $window) { return $t > $now - $window; }));
    if (count($hits) >= $max) return true;
    $hits[] = $now;
    @file_put_contents($file, json_encode($hits), LOCK_EX);
    return false;
}

function clean(string $key, int $max = 500): string {
    $v = $_POST[$key] ?? '';
    return is_string($v) ? mb_substr(trim(strip_tags($v)), 0, $max) : '';
}

function uid(): string {
    return bin2hex(random_bytes(6));
}
