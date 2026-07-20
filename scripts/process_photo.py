"""Remove the white background from the pointing-professional marketing image.
Flood-fills from the corners so the man + blue panel stay, enclosed white
(t-shirt) is preserved. Run: python scripts/process_photo.py"""
from PIL import Image, ImageDraw
import os

SRC = "D:/DOWNLOAD/screenshorts/Screenshot 2026-07-21 010427.png"
OUT = "public/images"
os.makedirs(OUT, exist_ok=True)

img = Image.open(SRC).convert("RGBA")
w, h = img.size
print("source:", w, h)

# Flood-fill outer near-white to transparent from several edge seeds.
seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
         (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]
for s in seeds:
    ImageDraw.floodfill(img, s, (0, 0, 0, 0), thresh=60)

bbox = img.getbbox()
out = img.crop(bbox)
out.save(os.path.join(OUT, "pointing-pro.png"))
print("saved:", out.size)
