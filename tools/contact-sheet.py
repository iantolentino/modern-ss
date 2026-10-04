"""A contact sheet of exactly what a visitor sees, for a human to check.

The automated check joins measured CSS boxes against a detected face box and reports
whether the head falls outside the crop. That is a measurement, and it is only as
good as the detector. This produces the thing the measurement stands in for: every
photograph, cropped by the same arithmetic the browser applies, laid out at a size a
person can actually look at.

It reads tools/_crops.json, which the browser wrote, so the visible rectangle is the
real one -- object-fit, object-position, box size and all -- rather than a second
guess at the CSS. Faces are marked with a thin outline so a wrong detection is as
easy to spot as a bad crop.

Run: python tools/contact-sheet.py
Writes: tools/_contact-sheet.png and tools/_contact-sheet-tight.png
"""
import json
import os

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ASSETS = os.path.join(ROOT, 'assets')
CROPS = os.path.join(HERE, '_crops.json')
BOXES = os.path.join(ROOT, '..', 'strata-scan', '_face-boxes.json')

CELL_W, CELL_H = 190, 240
PAD, LABEL_H = 10, 22
COLS = 8

crops = [
    json.loads(line[5:])
    for line in open(CROPS, encoding='utf-8-sig').read().splitlines()
    if line.startswith('CROP|')
]
boxes = json.load(open(BOXES, encoding='utf-8'))
by_base = {}
for k, v in boxes.items():
    by_base.setdefault(k.split('/')[-1], v)


def face_for(src):
    v = boxes.get(src) or by_base.get(src)
    return v.get('face') if v else None


def render(rec):
    """The visible rectangle of one rendered image, at the size it is shown."""
    path = os.path.join(ASSETS, rec['src'])
    if not os.path.exists(path):
        return None
    im = Image.open(path).convert('RGB')
    nw, nh = im.size
    v = rec['vis']
    box = (round(v['x0'] * nw), round(v['y0'] * nh),
           round(v['x1'] * nw), round(v['y1'] * nh))
    box = (max(0, box[0]), max(0, box[1]), min(nw, box[2]), min(nh, box[3]))
    if box[2] <= box[0] or box[3] <= box[1]:
        return None
    out = im.crop(box)
    return out, box


# one row per distinct (file, box width) so the same face is not shown four times
seen = set()
entries = []
for rec in crops:
    if not rec.get('nw') or not rec.get('vis'):
        continue
    if not face_for(rec['src']):
        continue
    key = (rec['src'], round(rec['bw']))
    if key in seen:
        continue
    seen.add(key)
    entries.append(rec)

# tightest first, so anything wrong is on the first sheet rather than page four
def tightness(rec):
    f = face_for(rec['src'])
    nw = rec['nw'] or 1
    nh = rec['nh'] or 1
    return (f['y0'] - rec['vis']['y0']) if f else 9

entries.sort(key=tightness)

per_sheet = COLS * 6
sheets = [entries[i:i + per_sheet] for i in range(0, len(entries), per_sheet)] or [[]]

for si, group in enumerate(sheets):
    rows = (len(group) + COLS - 1) // COLS
    W = COLS * (CELL_W + PAD) + PAD
    H = rows * (CELL_H + LABEL_H + PAD) + PAD
    sheet = Image.new('RGB', (W, H), (228, 232, 237))
    draw = ImageDraw.Draw(sheet)

    for i, rec in enumerate(group):
        r, c = divmod(i, COLS)
        x = PAD + c * (CELL_W + PAD)
        y = PAD + r * (CELL_H + LABEL_H + PAD)
        got = render(rec)
        if not got:
            continue
        im, box = got
        bw, bh = rec['bw'], rec['bh']
        # show it at the size it is rendered, capped so a hero does not swamp the grid
        scale = min(CELL_W / bw, CELL_H / bh, 2.0)
        tw, th = max(1, round(bw * scale)), max(1, round(bh * scale))
        shown = im.resize((tw, th), Image.LANCZOS)
        # annotate the detected face, mapped from source pixels through the crop
        f = face_for(rec['src'])
        nw, nh = rec['nw'], rec['nh']
        if f:
            fx0 = (f['x0'] * nw - box[0]) / (box[2] - box[0]) * tw
            fx1 = (f['x1'] * nw - box[0]) / (box[2] - box[0]) * tw
            fy0 = (f['y0'] * nh - box[1]) / (box[3] - box[1]) * th
            fy1 = (f['y1'] * nh - box[1]) / (box[3] - box[1]) * th
            draw.rectangle([x + fx0, y + fy0, x + fx1, y + fy1],
                           outline=(9, 75, 193), width=1)
        sheet.paste(shown, (x, y))
        draw.rectangle([x, y, x + tw - 1, y + th - 1], outline=(0, 16, 46), width=1)
        headroom = (f['y0'] - rec['vis']['y0']) * 100 if f else -1
        label = f'{rec["src"][:26]}'
        sub = f'{rec["page"][:14]}  {bw}x{bh}  head {headroom:.0f}%'
        draw.text((x, y + th + 3), label, fill=(0, 16, 46))
        draw.text((x, y + th + 12), sub, fill=(102, 111, 122))

    name = '_contact-sheet.png' if si == 0 else f'_contact-sheet-{si + 1}.png'
    out = os.path.join(HERE, name)
    sheet.save(out)
    print(f'  {name}  {len(group)} photographs, {W}x{H}')
print(f'\n  {len(entries)} distinct photographs rendered, {len(sheets)} sheet(s)')
print('  blue outline = the detected face; if the outline is not on the face, the')
print('  measurement is wrong, not the crop.')
