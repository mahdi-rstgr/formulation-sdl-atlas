"""Export SFL twin scenes and RRT-Connect transfers as static JSON for the atlas site.

Run from Material_Handling/self_formulating_lab:  python <this file> <out_dir>
"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, '.')
from sfl.cell import scene, Cell
out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
ROUTE = [("balance", "mixer"), ("mixer", "characterizer"), ("characterizer", "balance")]
for arm in ("ur3e", "ur5e", "ur10e", "ur16e"):
    t = time.time()
    s = scene(arm)
    cell = Cell(arm)
    runs = []
    for a, b in ROUTE:
        try:
            segs = cell.transfer(a, b)
            for sg in segs:
                sg["joints"] = [[round(float(x), 4) for x in q] for q in sg["joints"]]
            runs.append({"source": a, "dest": b, "segments": segs})
        except Exception as e:
            runs.append({"source": a, "dest": b, "error": str(e)})
    s["runs"] = runs
    p = out / f"{arm}.json"; p.write_text(json.dumps(s, separators=(",", ":")))
    print(arm, f"{p.stat().st_size/1e6:.2f} MB", [(r['source'], r['dest'], 'ERR' if 'error' in r else sum(len(x['joints']) for x in r['segments'])) for r in runs], f"{time.time()-t:.1f}s")
