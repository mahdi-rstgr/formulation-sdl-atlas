"""Build the assemblab brand files in assets/brand/ (mark, horizontal and stacked lockups, light and dark, favicon).

    pip install fonttools
    python scripts/build_brand.py SpaceGrotesk-SemiBold.ttf assets/brand

The mark is the "Twin Module": three solid modules (lab hardware, data tools, AI agents) and one dashed module,
the digital twin. The wordmark is "assemblab" in Space Grotesk 600 (SIL Open Font License, Google Fonts) with "lab"
in the accent colour, outlined to vector paths so the files need no installed font.
"""
import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

font = TTFont(sys.argv[1]); out = sys.argv[2]
gs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font["hmtx"]
UPM = font["head"].unitsPerEm


def word(text, size, x0, base, track=-0.04):
    """Return (path, width) for text outlined at size px, baseline at base."""
    pen = SVGPathPen(gs); x = 0; s = size / UPM
    for ch in text:
        g = cmap[ord(ch)]
        gs[g].draw(TransformPen(pen, (s, 0, 0, -s, x0 + x, base)))
        x += hmtx[g][0] * s + track * size
    return pen.getCommands(), x - track * size


def mark(ink, accent, dash="5 3.4", sw=3):
    return (f'<rect x="4" y="4" width="26" height="26" rx="5" fill="{ink}"/>'
            f'<rect x="34" y="4" width="26" height="26" rx="5" fill="{ink}"/>'
            f'<rect x="4" y="34" width="26" height="26" rx="5" fill="{accent}"/>'
            f'<rect x="35.5" y="35.5" width="23" height="23" rx="4" fill="none" stroke="{accent}" stroke-width="{sw}"'
            + (f' stroke-dasharray="{dash}"' if dash else "") + '/>')


THEMES = {"": dict(ink="#0E1A2B", accent="#2563EB"), "-dark": dict(ink="#F7F8FA", accent="#60A5FA")}
svg = lambda vb, body: f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="assemblab"><title>assemblab</title>{body}</svg>\n'
for suf, t in THEMES.items():
    m = mark(t["ink"], t["accent"])
    open(f"{out}/assemblab-mark{suf}.svg", "w").write(svg("0 0 64 64", m))
    a, wa = word("assemb", 44, 80, 47); b, wb = word("lab", 44, 80 + wa - 1.2, 47)
    open(f"{out}/assemblab-logo{suf}.svg", "w").write(svg(f"0 0 {80 + wa + wb + 4:.1f} 64", m + f'<path d="{a}" fill="{t["ink"]}"/><path d="{b}" fill="{t["accent"]}"/>'))
    a2, wa2 = word("assemb", 52, 0, 0); b2, wb2 = word("lab", 52, wa2 - 1.4, 0); W = wa2 + wb2
    S = 3; mw = 64 * S; W2 = max(mw, W) + 40
    open(f"{out}/assemblab-logo-stacked{suf}.svg", "w").write(svg(f"0 0 {W2:.1f} {mw + 92:.1f}",
        f'<g transform="translate({(W2 - mw) / 2:.1f} 0) scale({S})">{m}</g>'
        f'<g transform="translate({(W2 - W) / 2:.1f} {mw + 70:.1f})"><path d="{a2}" fill="{t["ink"]}"/><path d="{b2}" fill="{t["accent"]}"/></g>'))
# favicon: the mark on a light tile, large (the modules fill ~84% of the tile) with a solid twin outline so it reads at 16 px
open(f"{out}/assemblab-favicon.svg", "w").write(svg("0 0 64 64", '<rect width="64" height="64" rx="12" fill="#F7F8FA"/>'
    f'<g transform="translate(3.2 3.2) scale(0.9)">{mark("#0E1A2B", "#2563EB", dash=None, sw=4)}</g>'))
print("ok")
