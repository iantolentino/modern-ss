<?php
/**
 * Strata Staff Global — modern site core.
 * Flat-file storage (JSON in /data), no database required.
 */

declare(strict_types=1);

define('ROOT_DIR', dirname(__DIR__));
define('DATA_DIR', ROOT_DIR . '/data');
define('UPLOAD_DIR', ROOT_DIR . '/uploads');
define('PRIVATE_DIR', DATA_DIR . '/private');

if (!defined('APP_BASE')) {
    define('APP_BASE', rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/'));
}

$config = [
    // Allows first-admin setup from a non-local host when set (e.g. on cPanel).
    'setup_token' => '',
    // Overrides the detected origin for canonical URLs / sitemap, e.g. https://stratastaffglobal.com
    'site_url'    => '',
    'lead_emails' => 'solutions@stratastaffglobal.com',
    'job_emails'  => 'careers@stratastaffglobal.com',
];
if (is_file(ROOT_DIR . '/config.php')) {
    $config = array_merge($config, (array) require ROOT_DIR . '/config.php');
}
$GLOBALS['ssg_config'] = $config;

function cfg(string $key, $default = null) {
    return $GLOBALS['ssg_config'][$key] ?? $default;
}

/* ---------- Escaping & URLs ---------- */

function e($v): string {
    return htmlspecialchars((string) $v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function url(string $path = ''): string {
    $path = ltrim($path, '/');
    return APP_BASE . '/' . $path;
}

function site_origin(): string {
    if (cfg('site_url')) return rtrim((string) cfg('site_url'), '/');
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    return ($https ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . (cfg('site_url') ? '' : APP_BASE);
}

function abs_url(string $path = ''): string {
    if (preg_match('#^https?://#i', $path)) return $path;
    return site_origin() . '/' . ltrim($path, '/');
}

/** Media values are either absolute URLs or paths relative to the site root (uploads/...). */
function media(?string $src, string $fallback = ''): string {
    $src = trim((string) $src);
    if ($src === '') return $fallback;
    if (preg_match('#^(https?:)?//#i', $src)) return $src;
    return url($src);
}

function slugify(string $s): string {
    $s = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $s), '-'));
    return $s !== '' ? $s : 'item';
}

/* ---------- JSON store ---------- */

function store_path(string $name): string {
    return DATA_DIR . '/' . preg_replace('/[^a-z0-9_-]/', '', $name) . '.json';
}

function load(string $name, $default = []) {
    $file = store_path($name);
    if (!is_file($file)) return $default;
    $data = json_decode((string) file_get_contents($file), true);
    return is_array($data) ? $data : $default;
}

function save(string $name, $data): bool {
    $file = store_path($name);
    $tmp = $file . '.' . bin2hex(random_bytes(4)) . '.tmp';
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (file_put_contents($tmp, $json, LOCK_EX) === false) return false;
    return rename($tmp, $file);
}

function settings(): array {
    static $s = null;
    if ($s === null) $s = load('settings');
    return $s;
}

function setting(string $path, $default = '') {
    $node = settings();
    foreach (explode('.', $path) as $k) {
        if (!is_array($node) || !array_key_exists($k, $node)) return $default;
        $node = $node[$k];
    }
    return $node;
}

/** Visible, ordered items of a collection. */
function items(string $name, ?callable $filter = null): array {
    $list = array_values(array_filter(load($name), function ($i) use ($filter) {
        if (isset($i['status']) && in_array($i['status'], ['draft', 'closed', 'hidden'], true)) return false;
        return $filter ? $filter($i) : true;
    }));
    usort($list, function ($a, $b) {
        if (isset($a['date'], $b['date'])) return strcmp((string) $b['date'], (string) $a['date']);
        return ((int) ($a['order'] ?? 0)) <=> ((int) ($b['order'] ?? 0));
    });
    return $list;
}

function find_by_slug(string $name, string $slug): ?array {
    foreach (load($name) as $i) {
        if (($i['slug'] ?? '') === $slug) return $i;
    }
    return null;
}

/* ---------- Text formatting (safe markdown-lite) ---------- */

function inline_md(string $s): string {
    $s = str_replace('\*', "\x01", e($s)); // \* is a literal asterisk
    $s = preg_replace_callback('/!\[([^\]]*)\]\(([^)\s]+)\)/', function ($m) {
        $src = html_entity_decode($m[2], ENT_QUOTES);
        if (!preg_match('#^(https?://|uploads/|assets/media/)#i', $src)) return '';
        return '<img src="' . e(media($src)) . '" alt="' . $m[1] . '" loading="lazy">';
    }, $s);
    $s = preg_replace('/\*\*(.+?)\*\*/s', '<strong>$1</strong>', $s);
    $s = preg_replace('/(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)/s', '<em>$1</em>', $s);
    $s = preg_replace_callback('/\[([^\]]+)\]\(([^)\s]+)\)/', function ($m) {
        $href = html_entity_decode($m[2], ENT_QUOTES);
        if (!preg_match('#^(https?://|/|mailto:|tel:|\#)#i', $href)) return $m[1];
        $ext = preg_match('#^https?://#i', $href) ? ' target="_blank" rel="noopener"' : '';
        return '<a href="' . e($href) . '"' . $ext . '>' . $m[1] . '</a>';
    }, $s);
    return str_replace("\x01", '*', $s);
}

function md(string $text): string {
    $lines = preg_split('/\r\n|\r|\n/', trim($text));
    $html = '';
    $para = [];
    $list = null;
    $flushPara = function () use (&$para, &$html) {
        if ($para) { $html .= '<p>' . inline_md(implode(' ', $para)) . "</p>\n"; $para = []; }
    };
    $flushList = function () use (&$list, &$html) {
        if ($list) { $html .= "<{$list['tag']}>" . implode('', $list['items']) . "</{$list['tag']}>\n"; $list = null; }
    };
    foreach ($lines as $line) {
        $t = trim($line);
        if ($t === '') { $flushPara(); $flushList(); continue; }
        if (preg_match('/^(#{2,4})\s+(.*)$/', $t, $m)) {
            $flushPara(); $flushList();
            $lvl = strlen($m[1]);
            $html .= "<h$lvl>" . inline_md($m[2]) . "</h$lvl>\n";
            continue;
        }
        if (preg_match('/^(?:[-*]|(\d+)\.)\s+(.*)$/', $t, $m)) {
            $flushPara();
            $tag = $m[1] !== '' ? 'ol' : 'ul';
            if ($list && $list['tag'] !== $tag) $flushList();
            if (!$list) $list = ['tag' => $tag, 'items' => []];
            $list['items'][] = '<li>' . inline_md($m[2]) . '</li>';
            continue;
        }
        if (preg_match('/^>\s?(.*)$/', $t, $m)) {
            $flushPara(); $flushList();
            $html .= '<blockquote><p>' . inline_md($m[1]) . "</p></blockquote>\n";
            continue;
        }
        $flushList();
        $para[] = $t;
    }
    $flushPara(); $flushList();
    return $html;
}

function plain(string $text, int $len = 160): string {
    $t = trim(preg_replace('/\s+/', ' ', preg_replace('/[#*>\[\]]|\(https?:[^)]+\)/', '', $text)));
    if (mb_strlen($t) <= $len) return $t;
    return rtrim(mb_substr($t, 0, $len - 1), " ,.;:") . '…';
}

function lines(string $text): array {
    return array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', $text)), 'strlen'));
}

function fdate(string $d, string $fmt = 'j M Y'): string {
    $ts = strtotime($d);
    return $ts ? date($fmt, $ts) : '';
}

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

/** Simple sliding-window rate limit, stored in data/private. */
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

function send_mail(string $to, string $subject, string $body, string $replyTo = ''): bool {
    $headers = "From: Strata Staff Global <no-reply@" . preg_replace('/^www\./', '', (string) ($_SERVER['HTTP_HOST'] ?? 'localhost')) . ">\r\n";
    if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) $headers .= "Reply-To: $replyTo\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    return @mail($to, $subject, $body, $headers);
}

function uid(): string {
    return bin2hex(random_bytes(6));
}

require __DIR__ . '/seed.php';
ensure_seeded();
