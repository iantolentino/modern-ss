"""Where the face actually is in every shipped photograph.

The first version of this used the YCbCr skin-tone test from faces.py and returned a
bounding box. On these files it returned y0=0, y1=1 for almost every portrait at
11-34% coverage -- the whole frame -- because the test also fires on warm walls,
timber and beige office background. A box that spans the image cannot answer "is the
head inside the crop", and the check built on it reported 79 clipped faces that were
not clipped.

So this uses a real detector: OpenCV's Haar cascades, frontal and profile, taking the
largest detection. The profile cascade matters because a few of these portraits are
not square to camera, and a frontal-only detector reports nothing for them -- which
would read as "no face to clip" and hide the images most worth checking.

It also records the margin above the face, because the failure that matters visually
is not the detected rectangle being clipped, it is the hair on top of the head being
cut off. The Haar box starts around the brow, so a few percent of headroom above it
is the difference between a portrait and a decapitation.

Writes strata-scan/_face-boxes.json
"""
import json
import os

import cv2

ROOT = r'C:\Users\ianto\Downloads\ai-tests'
ASSETS = os.path.join(ROOT, 'strata-modern', 'assets')
CASCADES = os.path.join(ROOT, 'strata-scan', 'cascades')
OUT = os.path.join(ROOT, 'strata-scan', '_face-boxes.json')

RASTERS = ('.webp', '.jpg', '.jpeg', '.png')

FRONTAL = cv2.CascadeClassifier(os.path.join(CASCADES, 'haarcascade_frontalface_default.xml'))
PROFILE = cv2.CascadeClassifier(os.path.join(CASCADES, 'haarcascade_profileface.xml'))
if FRONTAL.empty():
    raise SystemExit('frontal cascade missing; run: node strata-scan/get-cascades.mjs')


def detect(path):
    im = cv2.imread(path)
    if im is None:
        return {'error': 'could not be decoded by OpenCV'}
    h, w = im.shape[:2]
    grey = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    grey = cv2.equalizeHist(grey)

    # Run several parameter sets and pool the results. One setting misses real faces
    # (the first version used scaleFactor 1.08 / minNeighbors 5 and found nothing in
    # 11 of the 19 officers); loosening alone invents them. Pooling and then choosing
    # on plausibility is what makes the answer stable.
    cands = []
    for sf in (1.03, 1.05, 1.08):
        for nb in (3, 5, 7):
            ms = max(20, int(min(w, h) * 0.06))
            for cas, kind in ((FRONTAL, 'frontal'), (PROFILE, 'profile')):
                if cas.empty():
                    continue
                for (x, y, fw, fh) in cas.detectMultiScale(grey, sf, nb, minSize=(ms, ms)):
                    cands.append({'x': x, 'y': y, 'w': fw, 'h': fh, 'kind': kind})

    if not cands:
        return {'w': w, 'h': h, 'faces': [], 'reason': 'no face detected'}

    # Plausibility. In these frames a face is a substantial part of the picture: the
    # sources are 908x1671 cropped around a head, so a detection covering 3% of the
    # height is a tie, a badge or a light fitting, not a face. The first pooled run
    # put "the face" of one officer in the top 12% of the frame on that basis.
    def plausible(c):
        fh_frac, fw_frac = c['h'] / h, c['w'] / w
        ar = c['w'] / c['h']
        if not (0.12 <= fh_frac <= 0.75):
            return False
        if not (0.6 <= ar <= 1.8):
            return False
        return True

    ok = [c for c in cands if plausible(c)]
    if not ok:
        return {
            'w': w, 'h': h, 'faces': [], 'candidates': len(cands),
            'reason': f'{len(cands)} detections, none face-shaped',
        }

    # Highest plausible face wins, matching optimise.py's _pick_face. Largest-alone
    # chose torsos over faces on two sources, which is how a crop ends up framed on a
    # body; "upper half, largest" still admitted a torso centred at 0.502. These are
    # single-subject portraits, so the head is the topmost face-like blob. Detections
    # under 15% of the height are excluded so a small false positive cannot win.
    solid = [c for c in ok if c['h'] / h >= 0.15] or ok
    c = min(solid, key=lambda c: (c['y'], -(c['w'] * c['h'])))

    return {
        'w': w, 'h': h,
        'faces': len(ok), 'candidates': len(cands),
        'kind': c['kind'],
        'face': {
            'x0': round(c['x'] / w, 4), 'x1': round((c['x'] + c['w']) / w, 4),
            'y0': round(c['y'] / h, 4), 'y1': round((c['y'] + c['h']) / h, 4),
        },
        # room above the brow, as a fraction of image height: the Haar box starts near
        # the brow, so this is what stands between the picture and a decapitation
        'headroom': round(c['y'] / h, 4),
    }


out = {}
count = 0
for dirpath, _, names in os.walk(ASSETS):
    for name in sorted(names):
        if not name.lower().endswith(RASTERS):
            continue
        full = os.path.join(dirpath, name)
        rel = os.path.relpath(full, ASSETS).replace('\\', '/')
        out[rel] = detect(full)
        count += 1

json.dump(out, open(OUT, 'w', encoding='utf-8'), indent=1)

people = {k: v for k, v in out.items() if v.get('face')}
print(f'  {count} rasters scanned, face detected in {len(people)}')
for fam in ('people/', 'portrait/', 'exec/', 'post/', ''):
    grp = {k: v for k, v in out.items() if k.startswith(fam) and not (fam == '' and '/' in k)}
    got = [v for v in grp.values() if v.get('face')]
    print(f'    {fam or "(top level)":<12} {len(got):>3} of {len(grp):>3} have a face')

noface = sorted(k for k, v in out.items() if not v.get('face'))
print(f'\n  no face in {len(noface)}:')
for k in noface:
    print(f'    {k:<44} {out[k].get("reason", out[k].get("error", ""))}')

hk = [(k, v) for k, v in people.items() if k.startswith(('people/', 'portrait/', 'exec/'))]
hk.sort(key=lambda kv: kv[1]['headroom'])
print('\n  tightest headroom above the brow (fraction of image height):')
for k, v in hk[:8]:
    print(f'    {k:<44} headroom {v["headroom"]:.3f}  face y {v["face"]["y0"]:.3f}..{v["face"]["y1"]:.3f}')

print(f'\n  wrote {os.path.relpath(OUT, ROOT)}')
