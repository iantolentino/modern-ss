"""Is the tight framing in the raw download, or is the crop doing it?

The shipped portraits show a face filling about half the frame width, which is a head
shot rather than the head-and-shoulders the brief asks for. A crop that keeps the full
width cannot zoom in on anything -- it can only remove height -- so if the shipped
face is large, the raw's face must be just as large, and no window can fix it.

This measures the same face box in the raw and in the shipped file. If the two agree
on width, the tightness is upstream in what the incumbent publishes and the only
honest options are to accept it or to fetch a better original. If the shipped face is
wider than the raw's, the crop is doing something it should not.

Run: python strata-scan/raw-vs-shipped.py
"""
import json
import os

import cv2

ROOT = r'C:\Users\ianto\Downloads\ai-tests'
SCAN = os.path.join(ROOT, 'strata-scan')
ASSETS = os.path.join(ROOT, 'strata-modern', 'assets')
RAW_TEAM = os.path.join(SCAN, 'raw-team')
RAW_PORTRAIT = os.path.join(SCAN, 'raw-portrait')
CASCADES = os.path.join(SCAN, 'cascades')

FRONTAL = cv2.CascadeClassifier(os.path.join(CASCADES, 'haarcascade_frontalface_default.xml'))
PROFILE = cv2.CascadeClassifier(os.path.join(CASCADES, 'haarcascade_profileface.xml'))


def face(path):
    im = cv2.imread(path)
    if im is None:
        return None
    h, w = im.shape[:2]
    grey = cv2.equalizeHist(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY))
    rows = []
    for sf in (1.03, 1.05, 1.08):
        for nb in (3, 5, 7):
            for cas in (FRONTAL, PROFILE):
                if cas.empty():
                    continue
                ms = max(20, int(min(w, h) * 0.06))
                for (x, y, fw, fh) in cas.detectMultiScale(grey, sf, nb, minSize=(ms, ms)):
                    if not (0.10 <= fh / h <= 0.80 and 0.6 <= fw / fh <= 1.8):
                        continue
                    rows.append((x, y, fw, fh))
    if not rows:
        return {'w': w, 'h': h, 'face': None}
    solid = [r for r in rows if r[3] / h >= 0.15] or rows
    x, y, fw, fh = min(solid, key=lambda r: (r[1], -(r[2] * r[3])))
    return {'w': w, 'h': h, 'face': {'x0': x / w, 'x1': (x + fw) / w,
                                     'y0': y / h, 'y1': (y + fh) / h}}


roster = json.load(open(os.path.join(RAW_TEAM, 'roster.json'), encoding='utf-8'))
print(f'  {"person":<26}{"raw":>11}{"raw face w":>12}{"shipped":>11}{"ship face w":>13}   verdict')

rows = []
for p in roster[:8]:
    stem = p['stem']
    rf = next((x for x in os.listdir(RAW_TEAM) if os.path.splitext(x)[0] == stem), None)
    if not rf:
        continue
    r = face(os.path.join(RAW_TEAM, rf))
    sname = p['name'].lower().replace(' ', '-')
    # the shipped slug drops middle names in some cases; find the closest file
    cands = [f for f in os.listdir(os.path.join(ASSETS, 'people'))
             if f.startswith(sname.split('-')[0]) or sname.startswith(f.split('.')[0].split('-')[0])]
    sp = os.path.join(ASSETS, 'people', cands[0]) if cands else None
    s = face(sp) if sp else None
    if not r or not r['face'] or not s or not s['face']:
        print(f'  {p["name"]:<26}   no face found in one of the two')
        continue
    rw = r['face']['x1'] - r['face']['x0']
    sw = s['face']['x1'] - s['face']['x0']
    verdict = 'the raw is already this tight' if abs(rw - sw) < 0.08 else 'CROP IS ZOOMING'
    rows.append((rw, sw))
    print(f'  {p["name"]:<26}{str(r["w"])+"x"+str(r["h"]):>11}{rw:>12.2f}'
          f'{str(s["w"])+"x"+str(s["h"]):>11}{sw:>13.2f}   {verdict}')

if rows:
    import statistics
    print(f'\n  median raw face width      {statistics.median([a for a, _ in rows]):.2f} of the frame')
    print(f'  median shipped face width  {statistics.median([b for _, b in rows]):.2f} of the frame')
