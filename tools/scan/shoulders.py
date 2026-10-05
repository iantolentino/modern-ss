"""Do the shipped portraits still contain the shoulders their sources have?

The bug this exists to prevent was in the producer, not the layout. Portraits were
cropped from a 0.543-aspect source into a 3:4 box, which keeps the top 72.5% of the
height -- and the shoulders live in the bottom 30%. Every face survived, so the face
detector called it clean, and every portrait shipped as a head on a neck.

A layout-level check cannot see that, because it can only measure the file it is
given. If the file has already lost its shoulders, its own silhouette has no shoulder
line to compare against and the check passes vacuously. The comparison has to be
against the source.

So: measure the subject's width in ten bands down the raw source and down the file we
ship from it, and compare the bottom band. If the source has a wide bottom -- a
shoulder line -- and the shipped file's is much narrower, the crop removed the body.
That is the check, it runs without a browser, and it fails loudly.

Also writes strata-scan/_silhouette.json for tools/face-verify.mjs, which uses the
same numbers for its layout-level check.

Run: python strata-scan/shoulders.py
"""
import json
import os
import re

import numpy as np
from PIL import Image

ROOT = r'C:\Users\ianto\Downloads\ai-tests'
MODERN = os.path.join(ROOT, 'strata-modern')
ASSETS = os.path.join(MODERN, 'assets')
SCAN = os.path.join(ROOT, 'strata-scan')
RAW_TEAM = os.path.join(SCAN, 'raw-team-orig')
RAW_PORTRAIT = os.path.join(SCAN, 'raw-portrait')
BANDS = 10

# How much narrower than its source a shipped bottom band may be before it counts as
# a lost shoulder. Resizing and WebP quantisation move this by a percent or two; a
# crop that removes the body moves it by tens.
TOLERANCE = 0.25

# assets/portrait/<name>-400.webp and assets/exec/<name>-400.webp come from these
# sources in raw-portrait/, named exactly as the incumbent's own files are.
ROLE_SRC = {
    'accountant': 'Model-1', 'administrative-specialist': 'Model-8',
    'executive-assistant': 'Model-9', 'compliance': 'Model-10',
    'team-executive-assistant': 'Model-3', 'team-accountant': 'Model-6',
    'team-administration': 'Model-4', 'team-customer-care': 'Model-2',
    'trevor': 'exec-trevor', 'paul': 'exec-paul',
    'tongta': 'exec-tongta', 'dan': 'exec-dan',
}


def bands_of(im):
    """Subject width as a fraction of frame width, in BANDS equal slices top to bottom.

    Background is taken from the four corners, which on these photographs is the
    studio wall. A pixel counts as subject when it differs from that colour by more
    than 42 in RGB distance: loose enough to keep dark hair and clothing against a
    light wall, tight enough to ignore film grain.
    """
    a = np.asarray(im.convert('RGB')).astype(np.int16)
    h, w = a.shape[:2]
    p = max(3, min(h, w) // 20)
    corners = np.concatenate([
        a[:p, :p].reshape(-1, 3), a[:p, -p:].reshape(-1, 3),
        a[-p:, :p].reshape(-1, 3), a[-p:, -p:].reshape(-1, 3),
    ])
    bg = np.median(corners, axis=0)
    mask = np.sqrt(((a - bg) ** 2).sum(axis=2)) > 42
    rows = mask.mean(axis=1)
    k = max(1, h // 120)                 # light smoothing against texture edges
    rows = np.convolve(rows, np.ones(k) / k, mode='same')
    return [round(float(rows[int(h * i / BANDS):int(h * (i + 1) / BANDS)].mean()), 4)
            for i in range(BANDS)]


def bands_of_path(p):
    with Image.open(p) as im:
        return bands_of(im), im.size


def find_raw(folder, stem):
    """The raw source behind a shipped portrait, or None if it is not on disk."""
    if folder == 'people':
        for e in ('.jpg', '.jpeg', '.png', '.webp'):
            p = os.path.join(RAW_TEAM, stem + e)
            if os.path.exists(p):
                return p
        return None
    src = ROLE_SRC.get(stem)
    if not src:
        return None
    for e in ('.webp', '.jpg', '.png'):
        p = os.path.join(RAW_PORTRAIT, src + e)
        if os.path.exists(p):
            return p
    return None


silhouette = {}
lost = []
compared = 0
no_raw = 0

for folder in ('people', 'portrait', 'exec'):
    d = os.path.join(ASSETS, folder)
    if not os.path.isdir(d):
        continue
    for name in sorted(os.listdir(d)):
        # one width is enough; the 800 is the same picture
        if not name.endswith('-400.webp'):
            continue
        stem = name[:-len('-400.webp')]
        rel = f'{folder}/{name}'
        bands, (w, h) = bands_of_path(os.path.join(d, name))
        silhouette[rel] = {'w': w, 'h': h, 'bands': bands, 'bottom': bands[-1]}

        raw = find_raw(folder, stem)
        if not raw:
            no_raw += 1
            continue
        rb, _ = bands_of_path(raw)
        compared += 1
        # a source with a narrow bottom has no shoulder line to lose
        if rb[-1] < 0.5:
            continue
        if bands[-1] < rb[-1] - TOLERANCE:
            lost.append({
                'asset': rel, 'raw': os.path.basename(raw),
                'source_bottom': rb[-1], 'shipped_bottom': bands[-1],
            })

with open(os.path.join(SCAN, '_silhouette.json'), 'w', encoding='utf-8') as f:
    json.dump(silhouette, f, indent=1)

print(f'  {len(silhouette)} portraits measured, {compared} compared against their source')
if no_raw:
    print(f'  {no_raw} had no source on disk (run fetch-team-originals.mjs), not compared')
print('')

if lost:
    print(f'  {len(lost)} LOST THE SHOULDERS - the shipped bottom is much narrower '
          f'than the source:')
    for r in lost:
        print(f'    {r["asset"]:<44} source {r["source_bottom"]:.2f} -> shipped '
              f'{r["shipped_bottom"]:.2f}   ({r["raw"]})')
    print('    The crop is cutting the body off. See DESIGN.md 15.')
else:
    print('  no portrait lost its shoulders: every shipped bottom band matches its source.')
    print('  A portrait whose source ends in a shoulder line still ends in one.')

bottoms = [v['bottom'] for v in silhouette.values()]
print('')
print(f'  shipped bottom tenth: min {min(bottoms):.2f}, '
      f'median {sorted(bottoms)[len(bottoms) // 2]:.2f}, max {max(bottoms):.2f}')

raise SystemExit(1 if lost else 0)
