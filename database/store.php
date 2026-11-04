<?php
/** Flat-file JSON store: every collection is database/data/<name>.json. */

declare(strict_types=1);

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
