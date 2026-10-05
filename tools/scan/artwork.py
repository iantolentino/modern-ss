"""What are the two 768x768 section images?

We cannot look at them, and it matters: a photograph can be run large and
full-bleed, while an infographic that already contains its own text must not be
scaled down to a thumbnail or captioned as if it were a picture of something.

Tells: how many distinct colours survive quantisation (a graphic has few, a
photograph has many), the share of the image in its single most common colour,
and the mean edge energy (flat vector art scores low, photography scores high).
"""
import os
from PIL import Image, ImageFilter, ImageStat

ASSETS = r'C:\Users\ianto\Downloads\ai-tests\strata-modern\assets'
TARGETS = ['The-Strata-Staff-Difference.webp',
           'Tailored-Strategic-Offshore-Capacity-Solutions-For-The-Strata-Industry.webp']

print(f'{"file":<50}{"colors":>8}{"top%":>7}{"edges":>8}{"sat":>7}  read')
for f in TARGETS:
    p = os.path.join(ASSETS, f)
    if not os.path.exists(p):
        print(f'{f:<50}  MISSING')
        continue
    im = Image.open(p).convert('RGB')
    q = im.quantize(colors=32, method=Image.MEDIANCUT).convert('RGB')
    hist = sorted(q.getcolors(im.size[0] * im.size[1]) or [], reverse=True)
    colors = len(hist)
    top_pct = (hist[0][0] / (im.size[0] * im.size[1]) * 100) if hist else 0
    edges = ImageStat.Stat(im.convert('L').filter(ImageFilter.FIND_EDGES)).mean[0]
    hsv = im.convert('HSV')
    sat = ImageStat.Stat(hsv).mean[1]

    # A graphic that carries its own text tends to be high-contrast and flat.
    if colors <= 12 and top_pct > 25:
        read = 'flat graphic, few colours - likely vector/infographic'
    elif edges < 6:
        read = 'very flat - likely a solid or typographic panel'
    elif colors >= 24 and edges > 18:
        read = 'continuous tone - photograph'
    else:
        read = 'mixed - photo with graphic overlay, or a composed panel'

    print(f'{f[:48]:<50}{colors:>8}{top_pct:>6.1f}%{edges:>8.1f}{sat:>7.0f}  {read}')

    # Is there a dark, high-contrast band where text would sit?
    g = im.convert('L')
    w, h = g.size
    rows = [ImageStat.Stat(g.crop((0, y, w, y + h // 8))).mean[0] for y in range(0, h, h // 8)]
    print(f'{"":<50}  8-row brightness profile: ' + ' '.join(f'{r:>3.0f}' for r in rows))
