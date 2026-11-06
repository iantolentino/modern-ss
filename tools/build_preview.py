"""Static preview of this PHP site for GitHub Pages.

GitHub Pages can't run PHP, so this saves every page of the local site as plain HTML
(<path>/index.html), copies the CSS/JS/images they use, and rebases links to the Pages URL.
Pages are marked noindex, forms are disabled with a notice, and /admin/ is left out.

Needs XAMPP running with the site at --local-url, and Python 3.8+.

  Build to a folder to check it:   python tools/build_preview.py --out C:/temp/preview
  Build and publish to gh-pages:   python tools/build_preview.py --publish

--publish checks out the gh-pages branch in a temporary folder, replaces its contents,
commits and pushes. GitHub Pages (Settings -> Pages, source: gh-pages) rebuilds on push.
"""
import argparse, pathlib, re, shutil, subprocess, sys, tempfile, urllib.error, urllib.parse, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSET_EXT = r'css|js|webp|png|jpe?g|svg|gif|ico|pdf|woff2?'
NOTICE = ('<div style="position:fixed;left:12px;bottom:12px;z-index:9999;background:#061a40;color:#fff;'
          'font:600 12px/1.4 Manrope,system-ui,sans-serif;padding:8px 12px;border-radius:10px;'
          'box-shadow:0 6px 20px rgba(0,0,0,.25);opacity:.92">Preview build: forms and admin are disabled</div>'
          '<script>document.addEventListener("submit",function(e){e.preventDefault();'
          'alert("This is a static preview. Forms only work on the full PHP site.");},true);</script>')


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'strata-preview-build'})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.read().decode('utf-8')
    except urllib.error.HTTPError as e:  # the 404 page still has a body
        if e.code == 404:
            return e.read().decode('utf-8')
        raise


def build(local_url, pages_url, out):
    local_url, pages_url = local_url.rstrip('/'), pages_url.rstrip('/')
    base_local = urllib.parse.urlparse(local_url).path.rstrip('/') + '/'
    base_pages = urllib.parse.urlparse(pages_url).path.rstrip('/') + '/'

    try:
        sitemap = fetch(local_url + '/sitemap.xml')
    except urllib.error.URLError as e:
        sys.exit(f'Could not reach {local_url} ({e}). Is XAMPP running?')

    # Start from the sitemap, then follow internal page links (e.g. /privacy is linked but not in the sitemap)
    queue = [u[len(local_url):].strip('/') for u in re.findall(r'<loc>([^<]+)</loc>', sitemap)]
    pages, link_re = {}, re.compile(r'href="' + re.escape(base_local) + r'([^"?#]*)')
    while queue:
        path = queue.pop(0)
        if path in pages or path.split('/')[0] == 'admin' or re.search(r'\.(' + ASSET_EXT + r'|xml|txt)$', path):
            continue
        pages[path] = fetch(local_url + '/' + path)
        queue += [m.strip('/') for m in link_re.findall(pages[path])]
    pages['__404__'] = fetch(local_url + '/this-page-does-not-exist')

    if out.exists():
        # Only ever empty an earlier preview build (or a fresh gh-pages checkout), never an arbitrary folder
        if any(p.name != '.git' for p in out.iterdir()) and not (out / '.nojekyll').is_file():
            sys.exit(f'{out} is not empty and is not a previous preview build; choose an empty folder.')
        for p in out.iterdir():
            if p.name != '.git':
                shutil.rmtree(p) if p.is_dir() else p.unlink()
    out.mkdir(parents=True, exist_ok=True)

    assets = set()
    asset_re = re.compile(r'(?:src|href|content)="(' + re.escape(base_local) + r'[^"?#]+\.(?:' + ASSET_EXT + r'))(?:\?[^"]*)?"')
    url_re = re.compile(r'url\((?:&quot;|["\'])?(' + re.escape(base_local) + r'[^)"\'&]+)')
    srcset_re = re.compile(r'srcset="([^"]+)"')

    for path, body in pages.items():
        assets.update(asset_re.findall(body))
        assets.update(url_re.findall(body))
        for m in srcset_re.findall(body):
            assets.update(u for u in (p.strip().split(' ')[0] for p in m.split(',')) if u.startswith(base_local))
        html = body.replace(local_url, pages_url)
        for q in ('"', "'", '(', '&quot;'):
            html = html.replace(q + base_local, q + base_pages)
        html = re.sub(r'<link rel="canonical"[^>]*>', '', html)
        # Per-request CSRF tokens are useless in a static copy and would make every build look changed
        html = re.sub(r'(name="_csrf" value=")[^"]*', r'\1', html)
        html = html.replace('<head>', '<head>\n<meta name="robots" content="noindex, nofollow">', 1)
        html = html.replace('</body>', NOTICE + '\n</body>', 1)
        if base_local != base_pages and base_local in html:
            sys.exit(f'Unrewritten link to {base_local} in /{path}')
        dest = out / '404.html' if path == '__404__' else out / path / 'index.html'
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html, encoding='utf-8', newline='\n')

    # Stylesheets can pull in more files (fonts, background images)
    for a in [a for a in assets if a.endswith('.css')]:
        css_file = ROOT / a[len(base_local):]
        if not css_file.is_file():
            continue
        for u in re.findall(r'url\(["\']?([^)"\']+)', css_file.read_text(encoding='utf-8')):
            if u.startswith(base_local):
                assets.add(u)
            elif not u.startswith(('data:', 'http', '/', '#')):
                assets.add(str(pathlib.PurePosixPath(a).parent / u))

    missing = []
    for a in sorted(assets):
        rel = urllib.parse.unquote(a[len(base_local):])
        src = ROOT / rel
        if not src.is_file():
            missing.append(rel)
            continue
        (out / rel).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, out / rel)

    (out / '.nojekyll').write_text('', encoding='utf-8')
    (out / 'README.md').write_text(
        '# Static preview\n\nGenerated by `tools/build_preview.py` from the PHP site on `main`. '
        'Do not edit here; forms and admin only work on the PHP version.\n', encoding='utf-8', newline='\n')
    print(f'{len(pages)} pages and {len(assets) - len(missing)} files written to {out}')
    if missing:
        print('Missing files (referenced but not found):', *missing, sep='\n  ')


def git(*args, cwd=ROOT, check=True):
    return subprocess.run(['git', *args], cwd=cwd, check=check, text=True, capture_output=True).stdout.strip()


def publish(local_url, pages_url):
    head = git('rev-parse', '--short', 'HEAD')
    dirty = git('status', '--porcelain', '--', '.', ':!database/data', ':!uploads')
    tmp = pathlib.Path(tempfile.mkdtemp(prefix='strata-preview-'))
    work = tmp / 'gh-pages'
    try:
        git('fetch', 'origin', 'gh-pages')
        git('worktree', 'add', '-B', 'gh-pages', str(work), 'origin/gh-pages')
        build(local_url, pages_url, work)
        git('add', '-A', cwd=work)
        if not git('status', '--porcelain', cwd=work):
            print('No changes since the last preview; nothing to publish.')
            return
        source = f'main at {head}' + (' plus uncommitted local changes' if dirty else '')
        git('commit', '-m', f'Update static preview\n\nGenerated from {source}.', cwd=work)
        git('push', 'origin', 'gh-pages', cwd=work)
        print(f'Published {git("rev-parse", "--short", "HEAD", cwd=work)} to gh-pages. '
              f'GitHub Pages usually updates within a minute or two: {pages_url}/')
    except subprocess.CalledProcessError as e:
        sys.exit(f'git {" ".join(e.cmd[1:])} failed:\n{e.stderr}')
    finally:
        git('worktree', 'remove', '--force', str(work), check=False)
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description='Build a static GitHub Pages preview of the PHP site.')
    ap.add_argument('--local-url', default='http://localhost/strata-modern', help='where XAMPP serves this site')
    ap.add_argument('--pages-url', default='https://iantolentino.github.io/modern-ss', help='the GitHub Pages address')
    ap.add_argument('--out', type=pathlib.Path, help='build into this folder (it is emptied first)')
    ap.add_argument('--publish', action='store_true', help='build and push to the gh-pages branch')
    a = ap.parse_args()
    if a.publish:
        publish(a.local_url, a.pages_url)
    elif a.out:
        build(a.local_url, a.pages_url, a.out)
    else:
        ap.error('use --out FOLDER to build locally, or --publish to update GitHub Pages')
