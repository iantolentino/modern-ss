"""Two portraits the re-crop did not settle, checked at the raw source.

carlo-andreu-tayag is still cut at 0.005 headroom, which means frame()'s headroom
clamp did not bind -- most likely face_box() returned None for the raw and it fell
back to a centred crop. team-accountant detects at 0.034 in the 400px file and 0.331
in the 800px file, which cannot both be right: they are the same crop resized.

This reports the raw box and every candidate detection, so the disagreement is
visible rather than averaged away.
"""
import os

import cv2

ROOT = r'C:\Users\ianto\Downloads\ai-tests'
RAW_TEAM = os.path.join(ROOT, 'strata-scan', 'raw-team')
RAW_PORTRAIT = os.path.join(ROOT, 'strata-scan', 'raw-portrait')
CASCADES = os.path.join(ROOT, 'strata-scan', 'cascades')
ASSETS = os.path.join(ROOT, 'strata-modern', 'assets')

FRONTAL = cv2.CascadeClassifier(os.path.join(CASCADES, 'haarcascade_frontalface_default.xml'))
PROFILE = cv2.CascadeClassifier(os.path.join(CASCADES, 'haarcascade_profileface.xml'))

TARGETS = [
    ('people/carlo-andreu-tayag.webp', os.path.join(RAW_TEAM, 'Carly-1.jpg')),
    ('portrait/team-accountant-400.webp', os.path.join(RAW_PORTRAIT, 'Model-6.webp')),
]


def all_candidates(path, tag):
    im = cv2.imread(path)
    if im is None:
        print(f'    {tag}: could not read {path}')
        return
    h, w = im.shape[:2]
    grey = cv2.equalizeHist(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY))
    print(f'    {tag}: {w}x{h}')
    rows = []
    for sf in (1.03, 1.05, 1.08):
        for nb in (3, 5, 7):
            for cname, cas in (('front', FRONTAL), ('prof', PROFILE)):
                if cas.empty():
                    continue
                ms = max(20, int(min(w, h) * 0.06))
                for (x, y, fw, fh) in cas.detectMultiScale(grey, sf, nb, minSize=(ms, ms)):
                    shaped = 0.10 <= fh / h <= 0.80 and 0.6 <= fw / fh <= 1.8
                    rows.append((y / h, (y + fh) / h, sf, nb, cname, fh / h, shaped))
    if not rows:
        print('      no detections at all')
        return
    for (y0, y1, sf, nb, cname, fh_frac, shaped) in sorted(rows):
        print(f'      y {y0:.3f}..{y1:.3f}  h {fh_frac:.2f}  sf {sf} nb {nb} {cname}'
              + ('' if shaped else '   REJECTED (not face-shaped)'))
    print(f'      {len(rows)} candidates, {sum(1 for r in rows if r[6])} face-shaped')


for shipped, raw in TARGETS:
    print(f'\n  {shipped}')
    print('    shipped file: assets/' + shipped)
    all_candidates(os.path.join(ASSETS, shipped), 'shipped')
    if os.path.exists(raw):
        all_candidates(raw, 'raw    ')
    else:
        print(f'    raw: not found at {raw}')
