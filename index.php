<?php
require __DIR__ . '/inc/bootstrap.php';
require __DIR__ . '/inc/layout.php';

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if (APP_BASE !== '' && strpos($path, APP_BASE) === 0) $path = substr($path, strlen(APP_BASE));
$path = trim(rawurldecode($path), '/');
if ($path === 'index.php') $path = '';
$seg = $path === '' ? [] : explode('/', $path);

function render(string $page, array $vars = []): void {
    extract($vars);
    require __DIR__ . '/inc/pages/' . $page . '.php';
    exit;
}

function not_found(): void {
    http_response_code(404);
    render('404');
}

switch ($seg[0] ?? '') {
    case '':          render('home');
    case 'about':     render('about');
    case 'team':      render('team');
    case 'contact':   render('contact');
    case 'privacy':   render('privacy');
    case 'clients':   render('clients');
    case 'capacity-calculator': render('capacity');
    case 'learning':
        if (($seg[1] ?? '') === 'course-outline') render('course-outline');
        if (isset($seg[1])) not_found();
        render('learning');
    case 'solutions':
        if (isset($seg[1])) {
            $item = find_by_slug('services', $seg[1]);
            if (!$item || ($item['status'] ?? '') === 'draft') not_found();
            render('service', ['item' => $item]);
        }
        render('solutions');
    case 'careers':
        if (isset($seg[1])) {
            $job = find_by_slug('jobs', $seg[1]);
            if (!$job) not_found();
            render('job', ['job' => $job]);
        }
        render('careers');
    case 'insights':
        if (isset($seg[1])) {
            $post = find_by_slug('insights', $seg[1]);
            if (!$post || ($post['status'] ?? '') === 'draft') not_found();
            render('post', ['post' => $post]);
        }
        render('insights');
    case 'sitemap.xml':
        header('Content-Type: application/xml; charset=utf-8');
        $urls = [['', '1.0'], ['about', '0.8'], ['solutions', '0.9'], ['learning', '0.6'], ['learning/course-outline', '0.6'], ['clients', '0.6'], ['capacity-calculator', '0.7'], ['team', '0.6'], ['careers', '0.8'], ['insights', '0.7'], ['contact', '0.8']];
        foreach (items('services') as $i) $urls[] = ['solutions/' . $i['slug'], '0.8'];
        foreach (items('jobs') as $i) $urls[] = ['careers/' . $i['slug'], '0.7', $i['date'] ?? ''];
        foreach (items('insights') as $i) $urls[] = ['insights/' . $i['slug'], '0.6', $i['date'] ?? ''];
        echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        foreach ($urls as $u) {
            echo '  <url><loc>' . e(abs_url($u[0])) . '</loc>' . (!empty($u[2]) ? '<lastmod>' . e($u[2]) . '</lastmod>' : '') . '<priority>' . $u[1] . "</priority></url>\n";
        }
        echo '</urlset>';
        exit;
    case 'robots.txt':
        header('Content-Type: text/plain; charset=utf-8');
        echo "User-agent: *\nDisallow: /admin/\nAllow: /\n\nSitemap: " . abs_url('sitemap.xml') . "\n";
        exit;
    default:
        not_found();
}
