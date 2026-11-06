<?php
/** Escaping, URLs, media paths and text formatting helpers. */

declare(strict_types=1);

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
    // Paths from url()/media() already carry the install folder; don't add it twice
    if (APP_BASE !== '' && strpos($path, APP_BASE . '/') === 0) $path = substr($path, strlen(APP_BASE));
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
