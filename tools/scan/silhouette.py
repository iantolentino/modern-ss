"""What is actually in these portraits? Measured from the silhouette, not a detector.

Every face-detector measurement says the framing is fine: the face sits at 10-20% from
the top, occupies about 40% of the height, and 45% of the frame is left below the
chin. Every CSS measurement says the same: the tightest crop on the site shows 94% of
the image, so the layout is not cutting anything. And yet the person looking at the
page says they can see only a mouth.

Those cannot all be true, so this measures the picture without a face detector and
without the layout. It takes the background colour from the four corners, marks every
pixel that differs from it, and reports the width of that subject silhouette row by
row. A head-and-shoulders frame has a narrow head over a sudden wide shoulder line. A
close-up has a silhouette that is already wide at the top and stays wide, with the
narrowest point near the bottom -- the jaw or the neck.

Run: python strata-scan/silhouette.py
"""
import os

import numpy as np
from PIL import Image

ROOT = r'C:\Users\ianto\Downloads\ai-tests'
PEOPLE = os.path.join(ROOT, 'strata-modern', 'assets', 'people')
PORTRAIT = os.path.join(ROOT, 'strata-modern', 'assets', 'portrait')

BANDS = 10


def profile(path):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.int16)
    h, w = a.shape[:2]

    # background from the corners: the median of four small patches
    p = max(3, min(h, w) // 20)
    corners = np.concatenate([
        a[:p, :p].reshape(-1, 3), a[:p, -p:].reshape(-1, 3),
        a[-p:, :p].reshape(-1, 3), a[-p:, -p:].reshape(-1, 3),
    ])
    bg = np.median(corners, axis=0)

    # distance from background, then a subject mask
    d = np.sqrt(((a - bg) ** 2).sum(axis=2))
    mask = d > 42

    rows = mask.mean(axis=1)          # fraction of each row that is subject
    # smooth a little so texture does not create false edges
    k = max(1, h // 120)
    rows = np.convolve(rows, np.ones(k) / k, mode='same')

    band = [round(float(rows[int(h * i / BANDS):int(h * (i + 1) / BANDS)].mean()), 3)
            for i in range(BANDS)]
    return {'w': w, 'h': h, 'band': band,
            'narrowest_at': round(float(np.argmin(rows)) / h, 2),
            'widest_at': round(float(np.argmax(rows)) / h, 2),
            'top_third': round(float(rows[:h // 3].mean()), 3),
            'bottom_third': round(float(rows[2 * h // 3:].mean()), 3)}


names = sorted(f for f in os.listdir(PEOPLE) if f.endswith('.webp'))
print('  subject width per vertical tenth of the frame (0 = nothing, 1 = full width)')
print('')
print(f'  {"portrait":<32}{"".join(f"{i:>6}" for i in range(1, BANDS + 1))}   shape')

verdicts = []
for n in names[:12]:
    r = profile(os.path.join(PEOPLE, n))
    b = r['band']
    # a head shot narrows high and widens low; head-and-shoulders narrows low
    shape = 'head fills the frame' if b[0] > 0.45 else ('head + shoulders' if b[0] < 0.35 else 'ambiguous')
    verdicts.append(shape)
    print(f'  {n[:31]:<32}' + ''.join(f'{v:>6.2f}' for v in b) + f'   {shape}')

print('')
from collections import Counter
print('  ' + ', '.join(f'{k}: {v}' for k, v in Counter(verdicts).items()))
print('')
print('  reading: a head-and-shoulders frame has small numbers at the top (background')
print('  beside the head), a jump where the shoulders start, and large numbers at the')
print('  bottom. A close-up starts large and stays large.')
