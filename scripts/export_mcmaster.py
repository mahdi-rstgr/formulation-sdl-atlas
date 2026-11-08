"""Tessellate McMaster-Carr STEP downloads (CAD/*.STEP) into the compact mesh JSON the design tool loads.

    pip install cadquery-ocp numpy
    python scripts/export_mcmaster.py CAD data/models

Each file "<part>_<name>.STEP" becomes data/models/mcm-<part lowercased>.json in the same format as
scripts/export_models.py: {"id", "label", "size", "scale", "offset", "parts": [{"color", "v", "f"}]}.
Faces are grouped by their STEP colour (assembly colours are inherited), meshed coarsely relative to the
part's size, converted from mm to m, rotated Z-up when the STEP is Y-up, centred on the footprint and
stood on z = 0. CAD models are (c) McMaster-Carr and used only to visualise the part; the CAD/ folder
itself is not committed.
"""
import base64, json, sys
from pathlib import Path
import numpy as np

from OCP.STEPCAFControl import STEPCAFControl_Reader
from OCP.TDocStd import TDocStd_Document
from OCP.XCAFApp import XCAFApp_Application
from OCP.TCollection import TCollection_ExtendedString
from OCP.XCAFDoc import XCAFDoc_DocumentTool, XCAFDoc_ShapeTool, XCAFDoc_ColorType, XCAFDoc_ColorTool
from OCP.TDF import TDF_Label
try:
    from OCP.TDF import TDF_LabelSequence
except ImportError:  # OCP >= 8
    from OCP.collections import Sequence_TDF_Label as TDF_LabelSequence
from OCP.TopLoc import TopLoc_Location
from OCP.Quantity import Quantity_Color, Quantity_TOC_sRGB
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRep import BRep_Tool
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_FACE, TopAbs_SOLID, TopAbs_REVERSED
from OCP.TopoDS import TopoDS

SRC, OUT = Path(sys.argv[1]), Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
UP = {}  # per-part override; McMaster (SolidWorks) downloads are Y-up, lab parts Z-up
DEFLECTION = 0.006   # chordal deflection as a fraction of the part diagonal
CELL = 0.0022       # vertex-clustering grid as a fraction of the diagonal (~3 mm on a 1.5 m part)
MIN_PART = 0.02      # solids smaller than this fraction of the diagonal (bolts, nuts, washers) are dropped


def hexcol(c):
    r, g, b = c.Values(Quantity_TOC_sRGB)
    return "#%02x%02x%02x" % tuple(int(round(max(0, min(1, x)) * 255)) for x in (r, g, b))


def read(path):
    doc = TDocStd_Document(TCollection_ExtendedString("XmlXCAF"))
    XCAFApp_Application.GetApplication_s().InitDocument(doc)
    rd = STEPCAFControl_Reader(); rd.SetColorMode(True); rd.SetNameMode(True)
    if rd.ReadFile(str(path)) != 1:
        raise RuntimeError("cannot read " + str(path))
    rd.Transfer(doc)
    st = XCAFDoc_DocumentTool.ShapeTool_s(doc.Main()); ct = XCAFDoc_DocumentTool.ColorTool_s(doc.Main())
    return st, ct, doc  # keep doc alive: the tools are invalid once it is collected


def own_color(ct, lab):
    c = Quantity_Color()
    for t in (XCAFDoc_ColorType.XCAFDoc_ColorSurf, XCAFDoc_ColorType.XCAFDoc_ColorGen):
        if XCAFDoc_ColorTool.GetColor_s(lab, t, c):
            return hexcol(c)
    return None


def leaves(st, ct, lab, loc, col, out):
    col = own_color(ct, lab) or col
    if XCAFDoc_ShapeTool.IsAssembly_s(lab):
        comps = TDF_LabelSequence(); XCAFDoc_ShapeTool.GetComponents_s(lab, comps, False)
        for i in range(1, comps.Length() + 1):
            comp = comps.Value(i); ref = TDF_Label()
            ccol = own_color(ct, comp) or col
            l2 = loc.Multiplied(XCAFDoc_ShapeTool.GetLocation_s(comp))
            if XCAFDoc_ShapeTool.GetReferredShape_s(comp, ref):
                leaves(st, ct, ref, l2, ccol, out)
    else:
        shp = XCAFDoc_ShapeTool.GetShape_s(lab)
        if not shp.IsNull():
            out.append((shp.Moved(loc), col or "#b8bec6", lab))


def cluster(v, f, cell):
    """Vertex-clustering decimation within one CAD face: snap to a grid, merge, drop collapsed triangles.
    Done per face so the hard edges between faces keep separate vertices (and normals)."""
    key = np.floor(v / cell).astype(np.int64)
    _, first, inv = np.unique(key, axis=0, return_index=True, return_inverse=True)
    inv = inv.reshape(-1)
    f2 = inv[f]
    keep = (f2[:, 0] != f2[:, 1]) & (f2[:, 1] != f2[:, 2]) & (f2[:, 0] != f2[:, 2])
    return v[first], f2[keep]


def mesh_parts(path):
    st, ct, _doc = read(path)
    free = TDF_LabelSequence(); st.GetFreeShapes(free)
    items = []
    for i in range(1, free.Length() + 1):
        leaves(st, ct, free.Value(i), TopLoc_Location(), None, items)
    box = Bnd_Box()
    for shp, _, _ in items:
        BRepBndLib.Add_s(shp, box)
    (x0, y0, z0), (x1, y1, z1) = [(p.X(), p.Y(), p.Z()) for p in (box.CornerMin(), box.CornerMax())]
    diag = float(np.linalg.norm([x1 - x0, y1 - y0, z1 - z0]))
    groups = {}
    solids, dropped = [], 0
    for shp, col, lab in items:                      # explode to solids; drop fasteners and other tiny parts
        sx = TopExp_Explorer(shp, TopAbs_SOLID); found = False
        while sx.More():
            s = sx.Current(); sx.Next(); found = True
            b = Bnd_Box(); BRepBndLib.Add_s(s, b)
            if b.IsVoid():
                continue
            lo, hi = b.CornerMin(), b.CornerMax()
            if np.linalg.norm([hi.X() - lo.X(), hi.Y() - lo.Y(), hi.Z() - lo.Z()]) < diag * MIN_PART:
                dropped += 1; continue
            solids.append((s, col))
        if not found:
            solids.append((shp, col))
    print(f"  {path.name}: {len(solids)} solids kept, {dropped} small parts dropped", flush=True)
    for shp, col in solids:
        BRepMesh_IncrementalMesh(shp, diag * DEFLECTION, False, 0.8, True)
        exp = TopExp_Explorer(shp, TopAbs_FACE)
        while exp.More():
            face = TopoDS.Face(exp.Current()); exp.Next()
            fcol = col
            c = Quantity_Color()
            if ct.GetColor(face, XCAFDoc_ColorType.XCAFDoc_ColorSurf, c):
                fcol = hexcol(c)
            loc = TopLoc_Location(); tri = BRep_Tool.Triangulation_s(face, loc)
            if tri is None:
                continue
            tr = loc.Transformation()
            n = tri.NbNodes()
            v = np.empty((n, 3))
            for k in range(1, n + 1):
                p = tri.Node(k).Transformed(tr); v[k - 1] = (p.X(), p.Y(), p.Z())
            m = tri.NbTriangles(); f = np.empty((m, 3), dtype=np.int64)
            for k in range(1, m + 1):
                t = tri.Triangle(k); f[k - 1] = (t.Value(1) - 1, t.Value(2) - 1, t.Value(3) - 1)
            if face.Orientation() == TopAbs_REVERSED:
                f = f[:, [0, 2, 1]]
            v, f = cluster(v, f, diag * CELL)
            if not len(f):
                continue
            n = len(v)
            g = groups.setdefault(fcol, [[], [], 0])
            g[0].append(v); g[1].append(f + g[2]); g[2] += n
    return [(c, np.concatenate(g[0]), np.concatenate(g[1])) for c, g in groups.items()]


def write(model_id, label, parts, up):
    parts = [(c, v / 1000.0, f) for c, v, f in parts]          # mm -> m
    if up == "y":                                                # Y-up -> Z-up
        parts = [(c, v[:, [0, 2, 1]] * [1, -1, 1], f[:, [0, 2, 1]]) for c, v, f in parts]
    allv = np.concatenate([p[1] for p in parts]); lo, hi = allv.min(0), allv.max(0)
    centre = np.array([(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, lo[2]])
    size = hi - lo; span = np.maximum(size, 1e-6)
    out = []
    for c, v, f in parts:
        q = np.round((v - lo) / span * 65535).astype("<u2")
        out.append({"color": c, "name": "", "v": base64.b64encode(q.tobytes()).decode(), "f": base64.b64encode(f.astype("<u4").tobytes()).decode()})
    doc = {"id": model_id, "label": label, "size": size.round(4).tolist(), "scale": (span / 65535).tolist(), "offset": (lo - centre).tolist(), "parts": out}
    p = OUT / f"{model_id}.json"; p.write_text(json.dumps(doc, separators=(",", ":")))
    ntri = sum(len(x[2]) for x in parts)
    print(f"{model_id:14s} {p.stat().st_size / 1024:7.0f} KB  {ntri:7d} tris  size {np.round(size, 3)}  colours {len(parts)}", flush=True)


only = set(sys.argv[3:])
for path in sorted(p for p in SRC.iterdir() if p.suffix.lower() in (".step", ".stp")):
    if "_" in path.stem:                     # McMaster download: "<part>_<name>.STEP"
        part, label = path.stem.split("_", 1)
        model_id, label = "mcm-" + part.lower(), label + " (McMaster-Carr " + part + ")"
    else:                                    # lab-made part, e.g. "Formulator Pen Assembly.step"
        part = label = path.stem
        model_id = "lab-" + "-".join(path.stem.lower().split())
    if only and part not in only:
        continue
    write(model_id, label, mesh_parts(path), UP.get(part, "y" if model_id.startswith("mcm-") else "z"))
