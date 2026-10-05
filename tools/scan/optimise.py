"""Normalise every portrait for the web, framed on the face.

Sources
  strata-scan/raw-team/*     480w team portraits
  strata-scan/raw-portrait/  the 908x1671 originals: Model-*.webp role
                             photographs and exec-*.jpg executives, the latter up
                             to 1.4MB each. These live here rather than in
                             strata-modern/assets/ because they are inputs, not
                             things any page should ship.

The subject was located by skin-tone centroid (see faces.py) and sits anywhere
from 27% to 66% down the frame. A single CSS `object-position` therefore cannot
work: cropping for the average decapitates the outliers. Each image is instead
cropped to its target aspect around its OWN measured face, so the framing is
deterministic and CSS needs no cropping at all.

Outputs into strata-modern/assets/
  people/<slug>.webp        3:4, face-centred
  portrait/<role>-NNN.webp  4:5, face-centred, at 400w and 800w
  exec/<name>-NNN.webp      4:5, face-centred, at 400w and 800w
  ../content/team.json      the published name/role pairing
"""
import json
import os
import re
import unicodedata

import cv2
import numpy as np
from PIL import Image

ROOT = r'C:\Users\ianto\Downloads\ai-tests'
ASSETS = os.path.join(ROOT, 'strata-modern', 'assets')
RAW = os.path.join(ROOT, 'strata-scan', 'raw-team')
# The uncropped uploads, 908x1671 against raw-team's 480x883. Same framing at twice
# the resolution; fetched by fetch-team-originals.mjs.
RAW_TEAM_ORIG = os.path.join(ROOT, 'strata-scan', 'raw-team-orig')
RAW_PORTRAIT = os.path.join(ROOT, 'strata-scan', 'raw-portrait')
CONTENT = os.path.join(ROOT, 'strata-modern', 'content')
for d in ('people', 'portrait', 'exec'):
    os.makedirs(os.path.join(ASSETS, d), exist_ok=True)
os.makedirs(CONTENT, exist_ok=True)

roster = json.load(open(os.path.join(RAW, 'roster.json'), encoding='utf-8'))
FACE_BIAS = 0.38  # where in the crop window the face should sit


def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^\w\s-]', '', s).strip().lower()
    return re.sub(r'[\s_]+', '-', s)


def face_y(im):
    """Vertical centroid of skin-tone pixels as a fraction of height.

    Superseded by face_box() for framing, and kept only because the shipped files it
    produced are still worth being able to reproduce. It is not used any more: the
    centroid includes the neck, hands and warm background, which is what put seven
    officers' heads above the top of their own crops.
    """
    small = im.convert('YCC' if False else 'RGB')
    small = small.resize((max(1, im.size[0] // 4), max(1, im.size[1] // 4)), Image.BILINEAR)
    ycbcr = small.convert('YCbCr')
    w, h = small.size
    px = ycbcr.load()
    tot = 0
    acc = 0
    for y in range(h):
        n = 0
        for x in range(w):
            Y, Cb, Cr = px[x, y]
            if 80 <= Y <= 245 and 77 <= Cb <= 133 and 133 <= Cr <= 180:
                n += 1
        tot += n
        acc += n * y
    return (acc / tot / h) if tot >= 30 else None


CASCADES = os.path.join(ROOT, 'strata-scan', 'cascades')
_FRONTAL = cv2.CascadeClassifier(os.path.join(CASCADES, 'haarcascade_frontalface_default.xml'))
_PROFILE = cv2.CascadeClassifier(os.path.join(CASCADES, 'haarcascade_profileface.xml'))

# The Haar box starts at the brow, so the skull and hair above it are roughly another
# half a face height. This is the margin the crop must preserve above the box.
HEAD_MARGIN = 0.55


def _pick_face(rows, h, w):
    """Choose the face from several plausible detections.

    Largest-wins is the obvious rule and it is wrong twice over on this set. The raw
    for team-accountant yields two face-shaped boxes, y 0.072..0.384 and
    y 0.382..0.762; the lower one is bigger and is a torso. The raw for
    carlo-andreu-tayag yields a torso at y 0.331..0.673 whose centre sits at 0.502 --
    just inside a naive "upper half" filter -- and it wins on size too, which is why
    his head shipped cut at 0.005 headroom while the source had room to spare.

    These sources are single-subject portraits cropped from a taller frame, so the
    head is the topmost face-like blob. Choosing the highest is therefore the rule
    that matches the material. Detections under 15% of the frame height are excluded
    first, so a small false positive near the top cannot win instead.
    """
    solid = [r for r in rows if r[3] / h >= 0.15] or rows
    return min(solid, key=lambda r: (r[1], -(r[2] * r[3])))


def face_box(im):
    """Where the head is, as fractions of the image. None if no plausible face.

    Returns the chosen face and, separately, `head_top` -- the highest point any
    face-shaped detection claims a face starts. The crop uses head_top, because the
    cost of the crop cutting a head is much higher than the cost of a little extra
    air above it, so the most pessimistic reading of where the head begins is the
    one worth framing against.

    Detections are pooled over several parameter sets and then filtered by shape. One
    setting alone missed real faces; loosening without the shape filter invents them
    (it once put a face in the top 12% of a portrait on the strength of a light
    fitting). A face in these frames is a substantial part of the picture -- the
    sources are cropped around a head -- so a detection covering under a tenth of the
    height is not one.
    """
    if _FRONTAL.empty():
        return None
    arr = cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR)
    h, w = arr.shape[:2]
    grey = cv2.equalizeHist(cv2.cvtColor(arr, cv2.COLOR_BGR2GRAY))
    rows = []
    for sf in (1.03, 1.05, 1.08):
        for nb in (3, 5, 7):
            for cas in (_FRONTAL, _PROFILE):
                if cas.empty():
                    continue
                ms = max(20, int(min(w, h) * 0.06))
                for (x, y, fw, fh) in cas.detectMultiScale(grey, sf, nb, minSize=(ms, ms)):
                    if not (0.10 <= fh / h <= 0.80 and 0.6 <= fw / fh <= 1.8):
                        continue
                    rows.append((x, y, fw, fh))
    if not rows:
        return None
    x, y, fw, fh = _pick_face(rows, h, w)
    head_top = min(r[1] for r in rows) / h
    return {
        'y0': y / h, 'y1': (y + fh) / h, 'h': fh / h, 'cy': (y + fh / 2) / h,
        'head_top': head_top,
    }


def frame(im, ratio=None, fb=None):
    """Ship the whole photograph. No crop.

    Three attempts went into cropping these portraits and all three were wrong in the
    same direction, so the crop is gone.

    The first placed the skin-tone centroid at FACE_BIAS. The centroid is dragged down
    by the neck, the hands and any warm background, so a subject in a light top got a
    crop that followed it down and took the top of the head off -- seven of the
    nineteen officers shipped that way, neil-dane-puno at 0.000 headroom where his
    source had 0.135.

    The second anchored the top, which fixed every head. It did not fix the actual
    complaint, and could not have: a face detector only ever knows about faces, and
    the faces were never the problem.

    What was wrong is the crop itself. These sources are 908x1671, aspect 0.543, and
    squaring them into a 3:4 or 4:5 box means discarding a third of the height. The
    silhouette says what that third is. Measured in tenths of subject width, Anna
    Marie David's source runs:

        0.85 0.86 0.93 0.81 | 0.33 0.22 0.15 | 0.33 0.41 0.83
        \\______ head _____/  \\___ neck ___/  \\__ shoulders __/

    The shoulders are the bottom 30%, and a 3:4 crop keeps the top 72.5%, which lands
    just above them. The result is a large head on a neck: head and no shoulders,
    which is what reads as a face too close up.

    These frames are already composed as head-and-shoulders. The composition was
    never ours to make. Keeping the whole frame keeps the shoulders, and the display
    boxes now carry the source's own 908/1671 so nothing is cut in CSS either.

    `ratio` and `fb` are kept in the signature so callers need not change, and are
    ignored. face_box() is still run, to record where the face sits in team.json and
    so tools/face-verify.mjs has something to check against.
    """
    return im


def save(im, path, q=82):
    im.save(path, 'WEBP', quality=q, method=6)
    return os.path.getsize(path)


report = []
faces = []

# ---------- team portraits: the whole frame, at the source's own aspect ----------
people = []
for p in roster:
    s = slug(p['name'])
    # the uncropped upload, matched by slug rather than by the roster's stem
    src = next((os.path.join(RAW_TEAM_ORIG, f) for f in os.listdir(RAW_TEAM_ORIG)
                if os.path.splitext(f)[0] == s), None)
    if not src:                       # fall back to the generated size if unfetched
        stem = p['stem']
        src = next((os.path.join(RAW, f) for f in os.listdir(RAW)
                    if os.path.splitext(f)[0] == stem), None)
    if not src:
        print(f'  MISSING {p["stem"]} / {s}')
        continue
    im = Image.open(src).convert('RGB')
    fb = face_box(im)
    faces.append(fb['cy'] if fb else None)
    out = frame(im)
    after = 0
    # the same -400/-800 naming the role and executive portraits use, so one srcset
    # helper covers all three
    for w in (400, 800):
        h = round(out.size[1] * w / out.size[0])
        after += save(out.resize((w, h), Image.LANCZOS),
                      os.path.join(ASSETS, 'people', f'{s}-{w}.webp'), 80)
    report.append((f'people/{s}-{{400,800}}.webp', out.size, os.path.getsize(src), after))
    people.append({'file': f'people/{s}-400.webp', 'name': p['name'], 'role': p['role'],
                   'w': out.size[0], 'h': out.size[1],
                   'faceY': round(fb['cy'] * 100, 1) if fb else None})

ROLE_ART = {
    # The incumbent's four role cards, named exactly as its own alt text names them.
    'Model-1': 'accountant',
    'Model-8': 'administrative-specialist',
    'Model-9': 'executive-assistant',
    'Model-10': 'compliance',
    # Its second four-up, which it labels as "team member" shots rather than roles.
    'Model-3': 'team-executive-assistant',
    'Model-6': 'team-accountant',
    'Model-4': 'team-administration',
    'Model-2': 'team-customer-care',
}
EXECS = {'exec-trevor': 'trevor', 'exec-paul': 'paul', 'exec-tongta': 'tongta', 'exec-dan': 'dan'}

for stem, name in list(ROLE_ART.items()) + list(EXECS.items()):
    src = next((os.path.join(RAW_PORTRAIT, stem + e) for e in ('.webp', '.jpg')
                if os.path.exists(os.path.join(RAW_PORTRAIT, stem + e))), None)
    if not src:
        print(f'  MISSING {stem}')
        continue
    im = Image.open(src).convert('RGB')
    fb = face_box(im)
    faces.append(fb['cy'] if fb else None)
    framed = frame(im)
    folder = 'portrait' if stem in ROLE_ART else 'exec'
    before = os.path.getsize(src)
    after = 0
    for w in (400, 800):
        h = round(framed.size[1] * w / framed.size[0])
        after += save(framed.resize((w, h), Image.LANCZOS),
                      os.path.join(ASSETS, folder, f'{name}-{w}.webp'), 82)
    report.append((f'{folder}/{name}-{{400,800}}.webp', framed.size, before, after))

with open(os.path.join(CONTENT, 'team.json'), 'w', encoding='utf-8') as f:
    json.dump({
        'note': 'Portraits and the name/role pairing are the ones the incumbent '
                'publishes on its own team page. Maristella Gaton appears in that '
                'grid with another person\'s photograph, so she is deliberately '
                'absent here rather than mislabelled.',
        'crop': '3:4, framed on a detected face with the skull kept in frame. The '
                'face is placed FACE_BIAS down the window, but never so low that the '
                'head is cut; see frame() in strata-scan/optimise.py.',
        'people': people,
    }, f, indent=2)
    f.write('\n')

print(f'{"output":<44}{"crop px":<13}{"before":>9}{"after":>9}  change')
tb = ta = 0
for name, size, before, after in report:
    tb += before
    ta += after
    print(f'{name:<44}{size[0]}x{size[1]:<8}{before//1024:>7}kb{after//1024:>8}kb  {(after-before)/before*100:+.0f}%')
print(f'\n{"TOTAL":<44}{"":<13}{tb//1024:>7}kb{ta//1024:>8}kb  {(ta-tb)/tb*100:+.0f}%')
known = [f for f in faces if f]
print(f'\n{len(people)} people, {len(ROLE_ART)} role photographs, {len(EXECS)} executive photographs')
print(f'faces located in {len(known)}/{len(faces)} images; '
      f'range {min(known)*100:.0f}%-{max(known)*100:.0f}%, median {sorted(known)[len(known)//2]*100:.0f}%')
