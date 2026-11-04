<?php
/**
 * Plugin loader. Each folder in plugins/ has a plugin.php manifest that returns
 * ['name' => ..., 'enabled' => bool, 'order' => int, 'styles' => [...], 'scripts' => [...]].
 * Local asset paths are relative to the plugin folder; full URLs (CDN) are used as-is.
 * Set 'enabled' => false in a manifest to switch a plugin off while debugging.
 */

declare(strict_types=1);

function plugins(): array {
    static $list = null;
    if ($list !== null) return $list;
    $list = [];
    foreach (glob(PLUGINS_DIR . '/*/plugin.php') ?: [] as $file) {
        $p = (array) require $file;
        if (empty($p['enabled'])) continue;
        $p['dir'] = basename(dirname($file));
        $list[] = $p;
    }
    usort($list, function ($a, $b) { return ((int) ($a['order'] ?? 10)) <=> ((int) ($b['order'] ?? 10)); });
    return $list;
}

function plugin_enabled(string $dir): bool {
    return in_array($dir, array_column(plugins(), 'dir'), true);
}

/** URL for a plugin asset, cache-busted by file time for local files. */
function plugin_asset(array $p, string $src): string {
    if (preg_match('#^https?://#i', $src)) return $src;
    $rel = 'plugins/' . $p['dir'] . '/' . ltrim($src, '/');
    return url($rel) . '?v=' . @filemtime(ROOT_DIR . '/' . $rel);
}

function plugin_styles(): void {
    foreach (plugins() as $p) foreach ($p['styles'] ?? [] as $s) {
        echo '<link rel="stylesheet" href="' . e(plugin_asset($p, $s)) . '">' . "\n";
    }
}

function plugin_scripts(): void {
    foreach (plugins() as $p) foreach ($p['scripts'] ?? [] as $s) {
        echo '<script src="' . e(plugin_asset($p, $s)) . '" defer></script>' . "\n";
    }
}
