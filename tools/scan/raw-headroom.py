"""Is the head cut in the shipped file, or was it already cut in the source?

Re-cropping can only recover a head that is still present in the raw download. This
runs the face detector over the raw sources for the portraits the shipped-file check
flagged, and reports where the face sits in the original. If the raw face has healthy
headroom, the loss happened in frame() and can be fixed by re-cropping. If it does
not, the loss happened upstream and no crop can bring it back.

Run: python strata-scan/raw-headroom.py
"""
import json
import os

import cv2

ROOT = r'C:\Users\ianto\Downloads\ai-tests'
RAW_TEAM = os.path.join(ROOT, 'strata-scan', 'raw-team')
RAW_PORTRAIT = os.path.join(ROOT, 'strata-scan', 'raw-portrait')
CASCADES = os.path.join(ROOT, 'strata-scan', 'cascades')
FACE_BOXES = os.path.join(ROOT, 'strata-scan', '_face-boxes.json')

FRONTAL = cv2.CascadeClassifier(os.path.join(CASCADES, 'haarcascade_frontalface_default.xml'))
PROFILE = cv2.CascadeClassifier(os.path.join(CASCADES, 'haarcascade_profileface.xml'))

# the shipped stems the check flagged, mapped to the raw file they came from
FLAGGED = {
    'people/neil-dane-puno.webp': 'Neil.webp',
    'people/riel-lacsamana.webp': 'Riel-1.jpg',
    'people/mary-ann-pineda.webp': 'Chi-full.jpg',
    'people/leah-adriano.webp': 'Leah-1.jpg',
    'people/jahaziel-beltran.webp': 'Jahazel-1.jpg',
    'people/sarahjane-manliclic.webp': 'Ma.-Sarahjane.webp',
    'people/sheena-magdaraog.webp': 'Sheena-1.jpg',
    'exec/paul-400.webp': 'exec-paul.jpg',
    'exec/trevor-400.webp': 'exec-trevor.jpg',
}
# a couple of healthy ones, as controls
CONTROL = {
    'people/anna-marie-david.webp': 'Anna-full.jpg',
    'people/rei-sanchez.webp': 'Rei-1.jpg',
}


def detect(path):
    im = cv2.imread(path)
    if im is None:
        return None
    h, w = im.shape[:2]
    grey = cv2.equalizeHist(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY))
    best = None
    for sf in (1.03, 1.05, 1.08):
        for nb in (3, 5, 7):
            for cas in (FRONTAL, PROFILE):
                if cas.empty():
                    continue
                ms = max(20, int(min(w, h) * 0.06))
                for (x, y, fw, fh) in cas.detectMultiScale(grey, sf, nb, minSize=(ms, ms)):
                    if not (0.10 <= fh / h <= 0.80 and 0.6 <= fw / fh <= 1.8):
                        continue
                    if best is None or fw * fh > best[2] * best[3]:
                        best = (x, y, fw, fh)
    if best is None:
        return {'w': w, 'h': h, 'face': None}
    x, y, fw, fh = best
    return {'w': w, 'h': h, 'face': {'y0': y / h, 'y1': (y + fh) / h}, 'headroom': y / h}


def find_raw(stem):
    for d in (RAW_TEAM, RAW_PORTRAIT):
        for f in os.listdir(d):
            if os.path.splitext(f)[0] == stem:
                return os.path.join(d, f)
    return None


shipped = json.load(open(FACE_BOXES, encoding='utf-8'))

print('  FLAGGED (head at or near the top of the shipped file)\n')
print(f'  {"shipped":<34}{"shipped head":>13}{"raw size":>12}{"raw head":>10}   verdict')
for key, stem in FLAGGED.items():
    p = find_raw(stem)
    if not p:
        print(f'  {key:<34}{"":>13}{"":>12}{"":>10}   raw source not found ({stem})')
        continue
    r = detect(p)
    sh = shipped.get(key, {}).get('headroom')
    if r is None or r['face'] is None:
        print(f'  {key:<34}{sh if sh is None else round(sh,3):>13}{str(r["w"])+"x"+str(r["h"]) if r else "?":>12}{"none":>10}   no face found in the raw either')
        continue
    raw_hr = r['headroom']
    verdict = 'FIXABLE - the head is in the raw, frame() lost it' if raw_hr > 0.06 else 'raw is also tight; re-cropping gains little'
    print(f'  {key:<34}{sh if sh is None else round(sh,3):>13}{str(r["w"])+"x"+str(r["h"]):>12}{round(raw_hr,3):>10}   {verdict}')

print('\n  CONTROLS (shipped headroom already healthy)\n')
for key, stem in CONTROL.items():
    p = find_raw(stem)
    r = detect(p) if p else None
    sh = shipped.get(key, {}).get('headroom')
    if r and r['face']:
        print(f'  {key:<34}{round(sh,3):>13}{str(r["w"])+"x"+str(r["h"]):>12}{round(r["headroom"],3):>10}')
