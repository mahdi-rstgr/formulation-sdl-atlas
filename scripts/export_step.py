"""Tessellate STEP CAD into the compact mesh JSON that assemblab's 3D views load.

    pip install cadquery-ocp numpy
    python scripts/export_step.py CAD_DIR data/models            # every *.STEP in a folder (McMaster downloads, lab parts)
    python scripts/export_step.py FILE.STEP data/models --id ot2 --label "Opentrons OT-2" --up z
    python scripts/export_step.py Formulator.STEP data/models --id lab-formulator --groups --cell 0.0011 --min-part 0.008

Output: data/models/<id>.json = {"id", "label", "size", "scale", "offset", "parts": [{"color", "name", "v", "f"}]}
(uint16-quantised vertices, uint32 triangles, base64), in metres, Z-up, centred on the footprint, standing on z = 0.
Faces are grouped by STEP colour. With --groups, each top-level component of the assembly is also mapped to a named
group (frame, gantry, arm, mixer, balance, dispensers) so a viewer can highlight it; parts without a STEP colour get
the group's colour. Fasteners and other tiny solids are dropped and each face is decimated by vertex clustering.
McMaster (SolidWorks) downloads are Y-up; lab assemblies are Z-up unless --up says otherwise.

The models in data/models were made with:
    python scripts/export_step.py CAD data/models                                    # McMaster parts, lab-built liquid pen
    python scripts/export_step.py "OT-2 Reference Model Detailed.STEP" data/models --id ot2 --label "Opentrons OT-2" --color "#e9ebee"
    python scripts/export_step.py Formulator.STEP data/models --id lab-formulator --label "Formulation cell"         --groups --cell 0.0015 --min-part 0.008 --ignore-color "#cad1ee"
"""
import argparse, base64, json, re, sys
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

from OCP.TDataStd import TDataStd_Name

DEFLECTION = 0.006   # chordal deflection as a fraction of the part diagonal
CELL = 0.0022        # vertex-clustering grid as a fraction of the diagonal (~3 mm on a 1.5 m part)
MIN_PART = 0.02      # solids smaller than this fraction of the diagonal (bolts, nuts, washers) are dropped
TOP_GROUPS = False   # set by --groups
GROUPS = [           # (group, regex on the top-level component name, colour used when the STEP has none)
    ("frame", r"frame|t-slot|framing|fixture|dowel", "#c9c6bd"),
    ("gantry", r"cnc|tool_changer|gantry", "#3f6fd8"),
    ("arm", r"ur\d|ur3|ur5|robot|arm", "#3b3d42"),
    ("mixer", r"thinky|mixer", "#eeeeee"),
    ("balance", r"balance|exa", "#d9d9dc"),
    ("dispensers", r"pen|dispenser|powder|parking", "#f2f2f2"),
]


def name_of(lab):
    a = TDataStd_Name()
    return a.Get().ToExtString() if lab.FindAttribute(TDataStd_Name.GetID_s(), a) else ""


def group_of(name):
    for g, rx, _ in GROUPS:
        if re.search(rx, name, re.I):
            return g
    return "other"


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


IGNORE = set()       # STEP colours to treat as "no colour" (e.g. a CAD tool's default), set by --ignore-color
BASE = "#b8bec6"     # colour for parts with no colour at all, set by --color


def own_color(ct, lab):
    c = Quantity_Color()
    for t in (XCAFDoc_ColorType.XCAFDoc_ColorSurf, XCAFDoc_ColorType.XCAFDoc_ColorGen):
        if XCAFDoc_ColorTool.GetColor_s(lab, t, c) and hexcol(c) not in IGNORE:
            return hexcol(c)
    return None


def leaves(st, ct, lab, loc, col, out, group=None):
    col = own_color(ct, lab) or col
    if XCAFDoc_ShapeTool.IsAssembly_s(lab):
        comps = TDF_LabelSequence(); XCAFDoc_ShapeTool.GetComponents_s(lab, comps, False)
        for i in range(1, comps.Length() + 1):
            comp = comps.Value(i); ref = TDF_Label()
            ccol = own_color(ct, comp) or col
            l2 = loc.Multiplied(XCAFDoc_ShapeTool.GetLocation_s(comp))
            if XCAFDoc_ShapeTool.GetReferredShape_s(comp, ref):
                g = group or (group_of(name_of(comp) + " " + name_of(ref)) if TOP_GROUPS else None)
                leaves(st, ct, ref, l2, ccol, out, g)
    else:
        shp = XCAFDoc_ShapeTool.GetShape_s(lab)
        if not shp.IsNull():
            if group and not col:
                col = next(c for g, _, c in GROUPS if g == group) if group != "other" else None
            out.append((shp.Moved(loc), col or BASE, group or ""))


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
    for shp, col, grp in items:                      # explode to solids; drop fasteners and other tiny parts
        sx = TopExp_Explorer(shp, TopAbs_SOLID); found = False
        while sx.More():
            s = sx.Current(); sx.Next(); found = True
            b = Bnd_Box(); BRepBndLib.Add_s(s, b)
            if b.IsVoid():
                continue
            lo, hi = b.CornerMin(), b.CornerMax()
            if np.linalg.norm([hi.X() - lo.X(), hi.Y() - lo.Y(), hi.Z() - lo.Z()]) < diag * MIN_PART:
                dropped += 1; continue
            solids.append((s, col, grp))
        if not found:
            solids.append((shp, col, grp))
    print(f"  {path.name}: {len(solids)} solids kept, {dropped} small parts dropped", flush=True)
    for shp, col, grp in solids:
        BRepMesh_IncrementalMesh(shp, diag * DEFLECTION, False, 0.8, True)
        exp = TopExp_Explorer(shp, TopAbs_FACE)
        while exp.More():
            face = TopoDS.Face(exp.Current()); exp.Next()
            fcol = col
            c = Quantity_Color()
            if ct.GetColor(face, XCAFDoc_ColorType.XCAFDoc_ColorSurf, c) and hexcol(c) not in IGNORE:
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
            g = groups.setdefault((grp, fcol), [[], [], 0])
            g[0].append(v); g[1].append(f + g[2]); g[2] += n
    return [(k, np.concatenate(g[0]), np.concatenate(g[1])) for k, g in groups.items()]


def write(model_id, label, parts, up):
    parts = [(c, v / 1000.0, f) for c, v, f in parts]          # mm -> m
    if up == "y":                                                # Y-up -> Z-up
        parts = [(c, v[:, [0, 2, 1]] * [1, -1, 1], f[:, [0, 2, 1]]) for c, v, f in parts]
    allv = np.concatenate([p[1] for p in parts]); lo, hi = allv.min(0), allv.max(0)
    centre = np.array([(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, lo[2]])
    size = hi - lo; span = np.maximum(size, 1e-6)
    out = []
    for (grp, c), v, f in parts:
        q = np.round((v - lo) / span * 65535).astype("<u2")
        out.append({"color": c, "name": grp, "v": base64.b64encode(q.tobytes()).decode(), "f": base64.b64encode(f.astype("<u4").tobytes()).decode()})
    doc = {"id": model_id, "label": label, "size": size.round(4).tolist(), "scale": (span / 65535).tolist(), "offset": (lo - centre).tolist(), "parts": out}
    p = OUT / f"{model_id}.json"; p.write_text(json.dumps(doc, separators=(",", ":")))
    ntri = sum(len(x[2]) for x in parts)
    print(f"{model_id:28s} {p.stat().st_size / 1024:7.0f} KB  {ntri:7d} tris  size {np.round(size, 3)}  colours {len(parts)}", flush=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("src", type=Path, help="a .STEP file, or a folder of them")
    ap.add_argument("out", type=Path, help="output folder, e.g. data/models")
    ap.add_argument("--id"); ap.add_argument("--label"); ap.add_argument("--up", choices=["y", "z"])
    ap.add_argument("--groups", action="store_true", help="name parts by top-level assembly group (frame, arm, ...)")
    ap.add_argument("--cell", type=float, default=CELL); ap.add_argument("--min-part", type=float, default=MIN_PART)
    ap.add_argument("--deflection", type=float, default=DEFLECTION)
    ap.add_argument("--only", nargs="*", default=[], help="folder mode: only these part numbers / stems")
    ap.add_argument("--ignore-color", nargs="*", default=[], help="STEP colours to ignore, e.g. #cad1ee")
    ap.add_argument("--color", default=BASE, help="colour for parts without one")
    a = ap.parse_args()
    OUT = a.out; OUT.mkdir(parents=True, exist_ok=True)
    CELL, MIN_PART, DEFLECTION, TOP_GROUPS = a.cell, a.min_part, a.deflection, a.groups
    IGNORE, BASE = {c.lower() for c in a.ignore_color}, a.color
    files = sorted(p for p in a.src.iterdir() if p.suffix.lower() in (".step", ".stp")) if a.src.is_dir() else [a.src]
    for path in files:
        if a.id and len(files) == 1:
            model_id, label, part = a.id, a.label or path.stem, path.stem
        elif "_" in path.stem:               # McMaster download: "<part>_<name>.STEP"
            part, label = path.stem.split("_", 1)
            model_id, label = "mcm-" + part.lower(), label + " (McMaster-Carr " + part + ")"
        else:                                # lab-made part, e.g. "Liquid Pen Assembly.step"
            part = label = path.stem
            model_id = "lab-" + "-".join(path.stem.lower().split())
        if a.only and part not in a.only:
            continue
        write(model_id, label, mesh_parts(path), a.up or ("y" if model_id.startswith("mcm-") else "z"))
