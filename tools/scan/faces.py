"""Locate the subject in every portrait, so CSS crops the face rather than the chin.

We cannot look at these images, so the crop position is measured instead of
guessed. Skin-tone pixels are detected per row and their vertical centroid is
reported as a percentage from the top; that is exactly the number
`object-position` wants. Also reports the top-third average colour, which decides
whether a caption needs a light or dark ground behind it.

Writes assets/portraits.json for the build.
"""
import json
import os
from PIL import Image

ASSETS = r'C:\Users\ianto\Downloads\ai-tests\strata-modern\assets'


def skin_rows(im, step=3):
    """Count skin-ish pixels per row. YCbCr ranges are the classic ones."""
    small = im.convert('RGB').resize((im.size[0] // step, im.size[1] // step), Image.BILINEAR)
    ycbcr = small.convert('YCbCr')
    w, h = small.size
    px = ycbcr.load()
    rows = [0] * h
    for y in range(h):
        for x in range(w):
            Y, Cb, Cr = px[x, y]
            if 80 <= Y <= 245 and 77 <= Cb <= 133 and 133 <= Cr <= 180:
                rows[y] += 1
    return rows, h


def analyse(path):
    im = Image.open(path).convert('RGB')
    rows, h = skin_rows(im)
    total = sum(rows)
    if total < 30:
        centroid = None
    else:
        centroid = sum(y * n for y, n in enumerate(rows)) / total / h
    top = im.crop((0, 0, im.size[0], max(1, im.size[1] // 3))).resize((1, 1), Image.LANCZOS)
    return {
        'w': im.size[0], 'h': im.size[1],
        'aspect': round(im.size[0] / im.size[1], 3),
        'skinCentroidPct': round(centroid * 100, 1) if centroid is not None else None,
        'skinCoveragePct': round(total / (im.size[0] * im.size[1] / 9) * 100, 1),
        'topThirdColor': '#%02X%02X%02X' % top.getpixel((0, 0)),
    }


out = {}
print(f'{"file":<44}{"px":<12}{"aspect":>7}{"face at":>9}{"skin%":>7}  top third')
for folder in ('people', 'portrait', 'exec'):
    d = os.path.join(ASSETS, folder)
    if not os.path.isdir(d):
        continue
    for f in sorted(os.listdir(d)):
        if not f.endswith('.webp'):
            continue
        a = analyse(os.path.join(d, f))
        out[f'{folder}/{f}'] = a
        face = f'{a["skinCentroidPct"]:.0f}%' if a['skinCentroidPct'] is not None else 'n/a'
        print(f'{folder + "/" + f:<44}{a["w"]}x{a["h"]:<7}{a["aspect"]:>7}{face:>9}{a["skinCoveragePct"]:>6.1f}%  {a["topThirdColor"]}')

with open(os.path.join(ASSETS, 'portraits.json'), 'w', encoding='utf-8') as fh:
    json.dump(out, fh, indent=2)
    fh.write('\n')

faces = [v['skinCentroidPct'] for v in out.values() if v['skinCentroidPct'] is not None]
if faces:
    faces.sort()
    print(f'\n{len(out)} images measured; {len(faces)} with a detected subject')
    print(f'face centroid: min {faces[0]:.0f}%  median {faces[len(faces)//2]:.0f}%  max {faces[-1]:.0f}%')
    print(f'-> a crop window centred near {faces[len(faces)//2]:.0f}% keeps every face in frame')
