"""Normalise the eight post featured images, and record their real widths.

Unlike the portraits these are NOT cropped. They range from a 2:1 office
photograph to a 1:1 square announcement panel, and at least four are designed
panels carrying their own type. Cropping those to a common aspect would cut the
type out, which is worse than showing the image whole on a tinted ground. So each
keeps its own aspect ratio and the CSS mounts it `object-fit: contain`.

Files are named for the width they actually are, and the manifest records that
width, because an earlier version of this script named every first output by the
width it *asked* for: the 600px source was written as `-1200.webp`, so the srcset
claimed a 1200w candidate that did not exist and the browser would pick it for
large viewports and upscale a 600px file. The manifest is what the build reads,
so the srcset cannot disagree with the file on disk.
"""
import json
import os
from PIL import Image

ROOT = r'C:\Users\ianto\Downloads\ai-tests'
RAW = os.path.join(ROOT, 'strata-scan', 'raw-post')
OUT = os.path.join(ROOT, 'strata-modern', 'assets', 'post')
MANIFEST = os.path.join(ROOT, 'strata-modern', 'content', 'post-images.json')

# Wipe the previous run, including the mislabelled files.
if os.path.isdir(OUT):
    for f in os.listdir(OUT):
        os.remove(os.path.join(OUT, f))
os.makedirs(OUT, exist_ok=True)

STEM = {
    'as-we-enter-2025-a-new-symbol-will-lead-the-way': 'a-new-symbol',
    'strata-staff-connect-1st-2nd-quarter-2024': 'connect-q1-q2-2024',
    'strata-staff-connect-3rd-quarter-2024': 'connect-q3-2024',
    'strata-staff-joins-sca-south-australia': 'joins-sca-sa',
    'strata-staff-joins-the-canadian-condominium-institute-cci-british-columbia-chapter': 'joins-cci-bc',
    'we-are-a-trusted-sca-member': 'trusted-sca-member',
    'strata-staff-unveils-its-upgraded-marisol-office': 'marisol-office',
    'premium-in-strategic-client-partnerships-and-engagement': 'client-partnerships',
}

manifest = {}
report = []

for f in sorted(os.listdir(RAW)):
    slug = os.path.splitext(f)[0]
    stem = STEM.get(slug)
    if not stem:
        print(f'  no stem mapped for {slug}')
        continue

    im = Image.open(os.path.join(RAW, f)).convert('RGB')
    src_w, src_h = im.size
    before = os.path.getsize(os.path.join(RAW, f))

    # Two variants is the whole point: 640 for the index thumbnail (which renders
    # near 360px) and 1200 for the hero on the post's own page, capped at 760px.
    # 1200 covers that hero at 1.5x DPR, so the 1536 and 2048 originals are not
    # emitted -- 250kb of pixels no layout would ever ask for.
    # A source that lands *between* the two (a 1024px original, say) also gets a
    # full-size variant, otherwise it would ship only a 640 and the hero would
    # upscale it. Nothing is ever upscaled.
    wanted = {640 if 640 <= src_w else src_w}
    if src_w >= 1200:
        wanted.add(1200)
    elif src_w > 640:
        wanted.add(src_w)
    wanted = sorted(wanted, reverse=True)

    entries = []
    after = 0
    for w in wanted:
        h = round(src_h * w / src_w)
        out = im if w == src_w else im.resize((w, h), Image.LANCZOS)
        dest = os.path.join(OUT, f'{stem}-{w}.webp')
        out.save(dest, 'WEBP', quality=82, method=6)
        n = os.path.getsize(dest)
        after += n
        entries.append({'w': w, 'h': h, 'file': f'assets/post/{stem}-{w}.webp', 'bytes': n})

    manifest[stem] = {
        'slug': slug,
        'srcW': src_w,
        'srcH': src_h,
        'ratio': round(src_w / src_h, 4),
        'variants': entries,
    }
    report.append((stem, (src_w, src_h), before, after, [e['w'] for e in entries]))

os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
with open(MANIFEST, 'w', encoding='utf-8') as fh:
    json.dump({'note': 'Featured images for the eight posts, normalised uncropped. '
                       'Widths are the real pixel widths; the build builds srcset from this.',
               'images': manifest}, fh, indent=2)
    fh.write('\n')

print(f'{"stem":<24}{"source":>12}{"before":>9}{"after":>8}  variants')
tb = ta = 0
for stem, size, before, after, widths in report:
    tb += before
    ta += after
    print(f'{stem:<24}{f"{size[0]}x{size[1]}":>12}{before // 1024:>8}kb{after // 1024:>7}kb  {widths}')
print(f'\n{len(report)} images: {tb // 1024}kb -> {ta // 1024}kb ({100 - round(ta / tb * 100)}% smaller)')
print(f'manifest: {os.path.relpath(MANIFEST, ROOT)}')
