"""Where the head sits in every raw source, measured once.

Framing can only preserve headroom the source still has. Iterating on the crop rule
without knowing this is guesswork: a portrait whose head already touches the top of
its raw download cannot be fixed by any window, and one with 25% of air above it can.
This reports the raw figure for all 31 sources so the crop rule can be judged against
the material rather than against its own output.

Run: python strata-scan/raw-headroom-all.py
"""
import os

import cv2

ROOT = r'C:\Users\ianto\Downloads\ai-tests'
SCAN = os.path.join(ROOT, 'strata-scan')
RAW_TEAM = os.path.join(SCAN, 'raw-team')
RAW_PORTRAIT = os.path.join(SCAN, 'raw-portrait')
CASCADES = os.path.join(SCAN, 'cascades')

FRONTAL = cv2.CascadeClassifier(os.path.join(CASCADES, 'haarcascade_frontalface_default.xml'))
PROFILE = cv2.CascadeClassifier(os.path.join(CASCADES, 'haarcascade_profileface.xml'))


def boxes(path):
    im = cv2.imread(path)
    if im is None:
        return None, []
    h, w = im.shape[:2]
    grey = cv2.equalizeHist(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY))
    out = []
    for sf in (1.03, 1.05, 1.08):
        for nb in (3, 5, 7):
            for cas in (FRONTAL, PROFILE):
                if cas.empty():
                    continue
                ms = max(20, int(min(w, h) * 0.06))
                for (x, y, fw, fh) in cas.detectMultiScale(grey, sf, nb, minSize=(ms, ms)):
                    if not (0.10 <= fh / h <= 0.80 and 0.6 <= fw / fh <= 1.8):
                        continue
                    out.append((x, y, fw, fh))
    return (w, h), out


roster = __import__('json').load(open(os.path.join(RAW_TEAM, 'roster.json'), encoding='utf-8'))

targets = []
for p in roster:
    stem = p['stem']
    f = next((x for x in os.listdir(RAW_TEAM) if os.path.splitext(x)[0] == stem), None)
    if f:
        targets.append((f'people/{p["name"]}', os.path.join(RAW_TEAM, f)))

ROLE_ART = {'Model-1': 'accountant', 'Model-8': 'administrative-specialist',
            'Model-9': 'executive-assistant', 'Model-10': 'compliance',
            'Model-3': 'team-executive-assistant', 'Model-6': 'team-accountant',
            'Model-4': 'team-administration', 'Model-2': 'team-customer-care'}
EXECS = {'exec-trevor': 'trevor', 'exec-paul': 'paul', 'exec-tongta': 'tongta', 'exec-dan': 'dan'}
for stem, role in list(ROLE_ART.items()) + list(EXECS.items()):
    for ext in ('.webp', '.jpg'):
        p = os.path.join(RAW_PORTRAIT, stem + ext)
        if os.path.exists(p):
            targets.append((f'{role} [{stem}]', p))

print(f'  {"source":<44}{"raw size":>11}{"highest":>9}{"lowest":>8}{"n":>4}   headroom')
rows = []
for label, path in targets:
    size, bs = boxes(path)
    if not size:
        print(f'  {label:<44}   unreadable')
        continue
    w, h = size
    if not bs:
        print(f'  {label:<44}{str(w)+"x"+str(h):>11}{"":>9}{"":>8}{0:>4}   NO FACE')
        continue
    highest = min(b[1] / h for b in bs)
    lowest = max((b[1] + b[3]) / h for b in bs)
    rows.append((label, highest, w, h, len(bs)))
    flag = '  <-- head at the very top of the raw' if highest < 0.05 else ''
    print(f'  {label:<44}{str(w)+"x"+str(h):>11}{highest:>9.3f}{lowest:>8.3f}{len(bs):>4}   {flag}')

if rows:
    rows.sort(key=lambda r: r[1])
    tight = [r for r in rows if r[1] < 0.05]
    print(f'\n  {len(rows)} sources with a face; {len(tight)} have the head under 5% from the top of the raw')
    print(f'  highest-face position: min {rows[0][1]:.3f}  median {rows[len(rows)//2][1]:.3f}  max {rows[-1][1]:.3f}')
