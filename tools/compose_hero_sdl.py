"""python tools/compose_hero_sdl.py  ->  assets/img/hero-sdl.webp
Compose the assemblab hero figure (hardware layer): the formulation cell centre stage, flanked by library instruments
on a reflective black floor with a soft lime glow. Transparent output so the page's wordmark and glass cards layer with it."""
import sys, pathlib
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

REPO = pathlib.Path(__file__).resolve().parents[1]; OUT = REPO / "assets/img/hero-sdl.webp"
W, H = 2400, 1240
FLOOR = 1080                     # y of the floor line (object bases)
LIME = (199, 255, 46)


def cutout(path):
    """Lift the cell off its white studio background: white regions (border-connected, or large pure-white enclosed
    openings) become a soft dark shadow, anti-aliased light edges are un-premultiplied against white."""
    import scipy.ndimage as nd
    im = np.asarray(Image.open(path).convert("RGB")).astype(np.float32)
    mn = im.min(2); L = im.mean(2); sat = im.max(2) - mn; TH = 236
    cand = mn >= TH; lab, n = nd.label(cand); idx = np.arange(1, n + 1)
    area = nd.sum(cand, lab, idx); meanL = nd.mean(L, lab, idx); meanS = nd.mean(sat, lab, idx)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, [i for i, a, m, s in zip(idx, area, meanL, meanS) if i in border or (a > 150 and m >= 252.5 and s < 3)])
    fr = nd.binary_dilation(bg, iterations=2) & ~bg & (mn >= 200)
    alpha = np.ones_like(L); alpha[bg] = np.clip((255 - L[bg]) / (255 - TH), 0, 1) * .55; alpha[fr] = np.clip((255 - mn[fr]) / 55, .35, 1)
    rgb = im.copy(); rgb[bg] = 0; a = alpha[fr][:, None]; rgb[fr] = np.clip((im[fr] - 255 * (1 - a)) / np.maximum(a, 1e-3), 0, 255)
    out = Image.fromarray(np.dstack([rgb.astype(np.uint8), (alpha * 255).astype(np.uint8)])); return out.crop(out.getbbox())

canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))

def load(p, scale):
    im = Image.open(p).convert("RGBA")
    im = im.crop(im.getbbox())
    if scale != 1: im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    return im

def base_y(im):
    """lowest row with substantial opacity (ignores the faint baked shadow)"""
    a = np.asarray(im)[..., 3]
    rows = np.where((a > 200).sum(1) > 3)[0]
    return rows.max() if len(rows) else im.height - 1

def reflection(im, strength=.20, length=.38):
    by = base_y(im); body = im.crop((0, 0, im.width, by + 1)).transpose(Image.FLIP_TOP_BOTTOM)
    h = int(body.height * length); body = body.crop((0, 0, body.width, h))
    a = np.asarray(body).astype(np.float32)
    ramp = np.linspace(strength, 0, h)[:, None] ** 1.4
    a[..., 3] *= ramp
    a[..., :3] *= .55
    return Image.fromarray(a.astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6))

def place(im, cx, floor=FLOOR, refl=True):
    by = base_y(im); x = int(cx - im.width / 2); y = int(floor - by)
    if refl:
        r = reflection(im); canvas.alpha_composite(r, (x, floor + 2))
    canvas.alpha_composite(im, (x, y))
    return x, y

# floor: a faint lime pool of light under the cell and a hairline horizon
glow = Image.new("L", (W, H), 0); d = ImageDraw.Draw(glow)
d.ellipse((W/2 - 900, FLOOR - 70, W/2 + 900, FLOOR + 120), fill=120)
glow = glow.filter(ImageFilter.GaussianBlur(70))
lime = Image.new("RGBA", (W, H), LIME + (0,)); lime.putalpha(glow.point(lambda v: int(v * .30)))
canvas.alpha_composite(lime)
white = Image.new("L", (W, H), 0); d = ImageDraw.Draw(white)
d.ellipse((W/2 - 560, FLOOR - 26, W/2 + 560, FLOOR + 40), fill=255)
white = white.filter(ImageFilter.GaussianBlur(28))
wl = Image.new("RGBA", (W, H), (255, 255, 255, 0)); wl.putalpha(white.point(lambda v: int(v * .10)))
canvas.alpha_composite(wl)

C = REPO / "assets/img/chemlab"


# hero: the formulation cell
cell = cutout(REPO / "assets/img/formulator/cell-perspective.webp")
place(cell, W / 2 + 10, FLOOR + 4)

# front row: balance left, rheometer right
place(load(C / "mt-xpr204e.webp", 1.15), 380, FLOOR + 30)
place(load(C / "antonpaar-mcr503.webp", 1.15), 2030, FLOOR + 30)

# fade the far left/right edges so the figure dissolves into the page
a = np.asarray(canvas).astype(np.float32)
x = np.linspace(0, 1, W); edge = np.clip(np.minimum(x, 1 - x) / .06, 0, 1)
y = np.linspace(0, 1, H); bot = np.clip((1 - y) / .08, 0, 1)
a[..., 3] *= edge[None, :] * bot[:, None]
canvas = Image.fromarray(a.astype(np.uint8))

canvas.save(OUT, "WEBP", quality=90, method=6)
print("saved", OUT, OUT.stat().st_size // 1024, "KB")
