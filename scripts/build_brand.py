"""Build the Labu brand files in assets/brand/ (mark, horizontal and stacked lockups, light and dark).

    pip install fonttools
    python scripts/build_brand.py Inter-Bold.ttf assets/brand

The wordmark is Inter Bold (SIL Open Font License, from Google Fonts) outlined to vector paths, so the files
need no installed font. The mark: a beet whose left half is a flask with liquid (the experiment) and whose
right half is a circuit whose nodes trace the beet's outline (data, models and agents), with one leaf.
"""
import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
font = TTFont(sys.argv[1]); out = sys.argv[2]
gs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font["hmtx"]
UPM = font["head"].unitsPerEm

def word(text, size, x0, base, track=-0.02):
    pen = SVGPathPen(gs); x = 0; s = size / UPM
    for ch in text:
        g = cmap[ord(ch)]
        tp = TransformPen(pen, (s, 0, 0, -s, x0 + x, base)); gs[g].draw(tp)
        x += hmtx[g][0] * s + track * size
    return pen.getCommands(), x - track * size

def mark_body(beet, leaf, hole, rib):
    sw = 3.4
    return f'''<path d="M32.2 11.4C31.6 5.6 36.4 1.4 45.6 1 46 8.8 40.4 12.6 32.2 11.4Z" fill="{leaf}"/>
<path d="M33.6 10.4 42 4.2" stroke="{rib}" stroke-width="1.4" stroke-linecap="round"/>
<path d="M32 33.6H15.5C16.4 44.4 24.4 51.6 32 61.2Z" fill="{beet}"/>
<path d="M32 61.2C24.4 51.6 15.4 44.6 15.4 33.4 15.4 26.4 20 21.6 25 19.4V13.2M22.4 13.2H25M32 12.2V61.2" fill="none" stroke="{beet}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M32 24H39.6L42.4 21.2M32 33.6H45.4M32 43.6H38.8L41.6 46.4" fill="none" stroke="{beet}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="44.8" cy="18.8" r="3.1" fill="{hole}" stroke="{beet}" stroke-width="2.8"/>
<circle cx="48.8" cy="33.6" r="3.1" fill="{hole}" stroke="{beet}" stroke-width="2.8"/>
<circle cx="44.2" cy="49" r="3.1" fill="{hole}" stroke="{beet}" stroke-width="2.8"/>'''

THEMES = {"": dict(beet="#8C1D40", leaf="#5A9E3A", hole="#FFFFFF", rib="#FFFFFF", ink="#121212"),
          "-dark": dict(beet="#D24A7E", leaf="#6DB24A", hole="#121212", rib="#121212", ink="#F4F4F5")}
for suf, t in THEMES.items():
    body = mark_body(t["beet"], t["leaf"], t["hole"], t["rib"])
    open(f"{out}/labu-mark{suf}.svg", "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Labu">\n<title>Labu</title>\n{body}\n</svg>\n')
    d, w = word("Labu", 34, 70, 46)                         # horizontal lockup
    W = 70 + w + 4
    open(f"{out}/labu-logo{suf}.svg", "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.1f} 64" role="img" aria-label="Labu">\n<title>Labu</title>\n{body}\n<path d="{d}" fill="{t["ink"]}"/>\n</svg>\n')
    d2, w2 = word("Labu", 40, 0, 0)                         # stacked lockup for marketing
    S = 3.0; mw = 64 * S; H = mw + 70; W2 = max(mw, w2) + 40
    open(f"{out}/labu-logo-stacked{suf}.svg", "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W2:.1f} {H:.1f}" role="img" aria-label="Labu">\n<title>Labu</title>\n<g transform="translate({(W2-mw)/2:.1f} 0) scale({S})">{body}</g>\n<path transform="translate({(W2-w2)/2:.1f} {mw+52:.1f})" d="{d2}" fill="{t["ink"]}"/>\n</svg>\n')
print("ok")
