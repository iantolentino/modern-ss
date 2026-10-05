"""Prove the shoulder guard fires, by putting the original bug back.

strata-scan/shoulders.py compares each shipped portrait's bottom band against its raw
source and fails when the body has been cropped off. It reports clean on the current
assets, which is the right answer and on its own proves nothing: a check that has never
failed is indistinguishable from a check that cannot fail. The layout-level guard in
tools/face-verify.mjs was written first, tested this way, and turned out to be
incapable of detecting the bug at all -- it measures the file it is handed, so a file
that has already lost its shoulders has no shoulder line for it to miss.

So this reproduces the exact fault: crop the shipped portraits to 3:4, top-anchored,
which is what the producer used to do. Then run the guard and confirm it fails. Then
restore and confirm it passes.

Run: python strata-scan/guard-selftest.py
"""
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image

ROOT = r'C:\Users\ianto\Downloads\ai-tests'
SCAN = os.path.join(ROOT, 'strata-scan')
ASSETS = os.path.join(ROOT, 'strata-modern', 'assets')
PY = sys.executable
FOLDERS = ('people', 'portrait', 'exec')


def run_guard():
    p = subprocess.run([PY, os.path.join(SCAN, 'shoulders.py')],
                       capture_output=True, text=True, cwd=SCAN)
    return p.returncode, (p.stdout + p.stderr).strip()


def targets():
    for folder in FOLDERS:
        d = os.path.join(ASSETS, folder)
        if not os.path.isdir(d):
            continue
        for name in sorted(os.listdir(d)):
            if name.endswith('-400.webp'):
                yield folder, name, os.path.join(d, name)


def crop_to_three_four(path):
    """The old producer's crop: keep the full width, take the top 3:4 of the height.

    Top-anchored, because that was the last version -- and it is the one that looked
    most defensible, since it never took the top of a head off.
    """
    with Image.open(path) as im:
        im = im.convert('RGB')
        w, h = im.size
        ch = round(w / (3 / 4))
        if ch >= h:
            return False
        im.crop((0, 0, w, ch)).save(path, 'WEBP', quality=80, method=6)
        return True


print('  --- reproduce the bug: crop the shipped portraits to 3:4 ---')
backup = tempfile.mkdtemp(prefix='portrait-backup-')
n = 0
for folder, name, path in targets():
    shutil.copy2(path, os.path.join(backup, f'{folder}__{name}'))
    if crop_to_three_four(path):
        n += 1
print(f'  cropped {n} portraits to 3:4 (the old behaviour)')
print('')

code, out = run_guard()
fired = code != 0
print(f'  guard exit code {code} -> ' +
      ('FIRED, as it should' if fired else 'STAYED SILENT -- THE GUARD IS BROKEN'))
print('')
for line in out.splitlines():
    if 'LOST THE SHOULDERS' in line or 'source ' in line:
        print('  ' + line.strip())
    if 'lost its shoulders' in line:
        print('  ' + line.strip())

print('')
print('  --- restore the real assets ---')
for folder, name, path in targets():
    shutil.copy2(os.path.join(backup, f'{folder}__{name}'), path)
shutil.rmtree(backup, ignore_errors=True)
print(f'  restored {n} portraits')
print('')

code2, out2 = run_guard()
print(f'  guard exit code {code2} -> ' +
      ('STILL FAILING -- something is wrong' if code2 else 'clean again, as it should be'))
for line in out2.splitlines():
    if 'no portrait lost' in line or 'shipped bottom tenth' in line:
        print('  ' + line.strip())

print('')
if fired and code2 == 0:
    print('  RESULT: the guard catches the bug and passes on the fix.')
    raise SystemExit(0)
print('  RESULT: the guard does NOT distinguish the bug from the fix.')
raise SystemExit(1)
