"""Two questions before any optimisation:

   1. Are the four exec-*.jpg files the same photographs as the four Model-*.webp
      files? They share a 908x1671 crop. If they are the same images, we are
      carrying 4.1MB of JPEG that duplicates 1.8MB of WebP.
   2. The team portraits are only 163x300, which is too small to show a face at
      any real size. WordPress will have generated larger widths - find them.
"""
import os, re, hashlib
from PIL import Image, ImageChops

A = r'C:\Users\ianto\Downloads\ai-tests\strata-modern\assets'
SCAN = r'C:\Users\ianto\Downloads\ai-tests\strata-scan\pages'

def sig(path, n=16):
    im = Image.open(path).convert('L').resize((n, n), Image.LANCZOS)
    return list(im.getdata())

def dist(a, b):
    return sum(abs(x - y) for x, y in zip(a, b)) / len(a)

execs = [f for f in os.listdir(A) if f.startswith('exec-')]
models = [f for f in os.listdir(A) if re.match(r'Model-\d+', f)]
sigs = {f: sig(os.path.join(A, f)) for f in execs + models}

print('=== exec vs model: mean per-pixel difference (0 = identical) ===')
print('              ' + ''.join(f'{m[:13]:>15}' for m in sorted(models)))
for e in sorted(execs):
    row = ''.join(f'{dist(sigs[e], sigs[m]):>15.2f}' for m in sorted(models))
    print(f'{e:<14}{row}')

print('\n=== exact byte hashes (catches identical files with different names) ===')
seen = {}
for f in sorted(execs + models):
    h = hashlib.sha256(open(os.path.join(A, f), 'rb').read()).hexdigest()[:16]
    seen.setdefault(h, []).append(f)
for h, fs in seen.items():
    print(f'  {h}  {", ".join(fs)}')

# ---- team photo srcsets from the live grid ----
print('\n=== larger team-photo variants available on the live site ===')
html = open(os.path.join(SCAN, 'our-awesome-team.html'), encoding='utf-8').read()
found = {}
for tag in re.findall(r'<img\b[^>]*>', html, re.I):
    src = (re.search(r'(?:data-src|src)="([^"]+)"', tag) or [None, ''])[1]
    base = src.split('/')[-1]
    m = re.match(r'([A-Za-z][\w.\-]*?)-(\d+)x(\d+)\.(jpg|jpeg|webp|png)$', base)
    if not m:
        continue
    stem = m.group(1)
    if re.search(r'flag|logo|reinsw|pixel|strata', stem, re.I):
        continue
    srcset = (re.search(r'srcset="([^"]+)"', tag) or [None, ''])[1]
    widths = sorted({int(w) for w in re.findall(r'(\d+)w', srcset)} | {int(m.group(2))})
    found.setdefault(stem, set()).update(widths)
for stem in sorted(found):
    print(f'  {stem:<24} widths: {sorted(found[stem])}')
print(f'\n  {len(found)} team portraits with generated sizes')
