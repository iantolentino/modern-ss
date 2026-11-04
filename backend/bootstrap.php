<?php
/**
 * Strata Staff Global — modern site core.
 * Loaded once by index.php; sets paths and config, then pulls in the backend modules.
 * Flat-file storage (JSON in database/data), no SQL server required.
 */

declare(strict_types=1);

define('ROOT_DIR', dirname(__DIR__));
define('BACKEND_DIR', ROOT_DIR . '/backend');
define('FRONTEND_DIR', ROOT_DIR . '/frontend');
define('DATABASE_DIR', ROOT_DIR . '/database');
define('PLUGINS_DIR', ROOT_DIR . '/plugins');
define('DATA_DIR', DATABASE_DIR . '/data');
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
if (is_file(BACKEND_DIR . '/config.php')) {
    $config = array_merge($config, (array) require BACKEND_DIR . '/config.php');
}
$GLOBALS['ssg_config'] = $config;

function cfg(string $key, $default = null) {
    return $GLOBALS['ssg_config'][$key] ?? $default;
}

require BACKEND_DIR . '/helpers.php';
require BACKEND_DIR . '/security.php';
require BACKEND_DIR . '/mail.php';
require BACKEND_DIR . '/plugins.php';
require DATABASE_DIR . '/store.php';
require DATABASE_DIR . '/seed.php';
ensure_seeded();
