"""
Process the Exzelon logo:
  1. Remove the white background (flood-fill from corners so the inner white
     arrow cut-out is preserved).
  2. Emit a colour version (transparent bg) for light surfaces.
  3. Emit an all-white version for dark / periwinkle surfaces.
  4. Emit mark-only crops (colour + white) for compact / square contexts.

Run: python scripts/process_logo.py
"""
from PIL import Image, ImageDraw
import numpy as np
import os

SRC = "D:/DOWNLOAD/imgs/logo.jpg"
OUT = "public/brand"
os.makedirs(OUT, exist_ok=True)

img = Image.open(SRC).convert("RGBA")
w, h = img.size
print("source size:", w, h)

# --- 1. flood-fill outer white to transparent (keeps enclosed white arrow) ---
# PIL floodfill compares within `thresh` of the seed colour (sum of channel diffs).
for seed in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1)]:
    ImageDraw.floodfill(img, seed, (0, 0, 0, 0), thresh=140)

arr = np.array(img)
alpha = arr[:, :, 3]
r = arr[:, :, 0].astype(int)
g = arr[:, :, 1].astype(int)
b = arr[:, :, 2].astype(int)

# "ink" (the blue leaf + both wordmark words) vs the inner white arrow.
opaque = alpha > 0
is_blue = (b - r) > 30
leaf = opaque & is_blue
inner_white = opaque & ~is_blue  # the arrow cut-out that survived flood-fill

# --- 2. colour version (as-is after flood-fill), auto-cropped to content ---
color = Image.fromarray(arr, "RGBA")
bbox = color.getbbox()
color_cropped = color.crop(bbox)
color_cropped.save(os.path.join(OUT, "exzelon-logo.png"))
print("colour logo:", color_cropped.size)

# --- 3. white version: ink -> white, arrow -> transparent, bg transparent ---
white = np.zeros_like(arr)
white[leaf] = [255, 255, 255, 255]
# inner_white (arrow) stays fully transparent so it reads as a cut-out
white_img = Image.fromarray(white, "RGBA").crop(bbox)
white_img.save(os.path.join(OUT, "exzelon-logo-white.png"))
print("white logo:", white_img.size)

# --- 4. mark-only crop: the widest empty column-run in the left half is the
#        gap between the leaf mark and the "Exzelon" wordmark. ---
col_has_ink = leaf.any(axis=0)
start = int(np.where(col_has_ink)[0][0])
half = int(0.55 * w)
best_start, best_len = mark_right_default = bbox[2], 0
best_len = 0
x = start
while x < half:
    if not col_has_ink[x]:
        s = x
        while x < half and not col_has_ink[x]:
            x += 1
        if (x - s) > best_len:
            best_len, best_start = x - s, s
    else:
        x += 1
mark_right = best_start if best_len > 6 else bbox[2]

def crop_mark(image):
    m = image.crop((0, 0, mark_right, h))
    bb = m.getbbox()
    return m.crop(bb) if bb else m

crop_mark(color).save(os.path.join(OUT, "exzelon-mark.png"))
crop_mark(Image.fromarray(white, "RGBA")).save(os.path.join(OUT, "exzelon-mark-white.png"))
mm = crop_mark(color)
print("mark:", mm.size, "mark_right:", mark_right)

# --- preview: white logo + white mark composited on navy, to verify visually ---
navy = Image.new("RGBA", (white_img.width + 80, white_img.height + 80), (10, 16, 36, 255))
navy.alpha_composite(white_img, (40, 40))
navy.convert("RGB").save(os.path.join(OUT, "_preview-white-on-navy.png"))
mk = crop_mark(Image.fromarray(white, "RGBA"))
navy2 = Image.new("RGBA", (mk.width + 60, mk.height + 60), (10, 16, 36, 255))
navy2.alpha_composite(mk, (30, 30))
navy2.convert("RGB").save(os.path.join(OUT, "_preview-mark-on-navy.png"))
print("done")
