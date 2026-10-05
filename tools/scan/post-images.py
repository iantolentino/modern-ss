"""What are the eight post featured images?

We cannot see them, and the treatment depends on the answer. A photograph can be
run as a wide hero; a designed newsletter page with its own type must not be
cropped to a banner or scaled down until its text is unreadable.

Tells, same as the section-panel audit: aspect ratio, how many distinct colours
survive quantisation (a graphic has few, a photograph has many), and mean edge
energy (flat vector art scores low, photography scores high).
"""
import os
from PIL import Image, ImageFilter, ImageStat

RAW = r'C:\Users\ianto\Downloads\ai-tests\strata-scan\raw-post'

print(f'{"file":<56}{"size":>12}{"ratio":>7}{"colors":>8}{"edges":>7}  read')
for f in sorted(os.listdir(RAW)):
    p = os.path.join(RAW, f)
    im = Image.open(p).convert('RGB')
    w, h = im.size
    ratio = w / h
    q = im.quantize(colors=32, method=Image.MEDIANCUT).convert('RGB')
    hist = sorted(q.getcolors(w * h) or [], reverse=True)
    colors = len(hist)
    top_pct = (hist[0][0] / (w * h) * 100) if hist else 0
    edges = ImageStat.Stat(im.convert('L').filter(ImageFilter.FIND_EDGES)).mean[0]

    if 0.5 <= ratio <= 2.2 and colors >= 24 and edges > 16 and top_pct < 20:
        read = 'photograph'
    elif ratio < 0.5:
        read = 'tall page scan / poster - likely carries its own type'
    elif colors <= 14 and top_pct > 25:
        read = 'flat graphic'
    elif edges < 8:
        read = 'smooth panel or graphic'
    else:
        read = 'mixed - composed image, may carry type'

    print(f'{f[:54]:<56}{w}x{h:<7}{ratio:>7.2f}{colors:>8}{edges:>7.1f}  {read}')
