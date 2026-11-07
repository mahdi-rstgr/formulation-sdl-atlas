"""Export the real device meshes used by the Lab Builder (builder/) as compact JSON.

Run from Material_Handling/self_formulating_lab:
    python ../../formulation-sdl-atlas/scripts/export_models.py ../../formulation-sdl-atlas/data/models [path/to/lite6_urdf]

Each model is written as data/models/<id>.json:
    {"id", "size": [dx, dy, dz] (m), "parts": [{"color", "v": b64 uint16 xyz, "f": b64 uint32 tris}], "scale": [sx,sy,sz], "offset": [ox,oy,oz]}
Vertices are quantised to uint16 over the model's bounding box (sub-0.02 mm at these sizes), then
re-centred so the footprint is centred on the origin and the model stands on z = 0.
Sources: sdl_dt formulation-cell meshes (CNC gantry, eco-PEN, powder dispenser, balance, mixer, cup),
UR e-Series description files (BSD-3-Clause), UFACTORY Lite 6 URDF (BSD-3-Clause, via hygradme/lite6_urdf).
"""
import base64, json, math, struct, sys, xml.etree.ElementTree as ET
from pathlib import Path
import numpy as np

sys.path.insert(0, ".")
from sfl.arms import load_arm  # noqa: E402

MESH = Path("mesh")
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
LITE6 = Path(sys.argv[2]) if len(sys.argv) > 2 else None

PALETTE = {"mixer": "#eef0f2", "frame": "#9aa3ad", "shaft": "#c0c6cd", "head": "#2f6fd6", "tool": "#3b4048",
           "adapter": "#7a8592", "pan": "#c9cfd6", "body": "#3b4048", "cup": "#e2b56b"}


def color_for(name, default="#c9cfd6"):
    for k, c in PALETTE.items():
        if k in name:
            return c
    return default


def npz_parts(name, prefix=""):
    z = np.load(MESH / f"{name}.npz")
    for key in z.keys():
        if key.endswith("/vertices") and key.startswith(prefix):
            base = key[: -len("/vertices")]
            yield base, z[key].astype(float), z[base + "/faces"].astype(np.uint32)


def write(model_id, parts, label):
    """parts: list of (color, vertices Nx3 world, faces Mx3)."""
    allv = np.concatenate([v for _, v, _ in parts])
    lo, hi = allv.min(0), allv.max(0)
    centre = np.array([(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, lo[2]])
    size = hi - lo
    span = np.maximum(size, 1e-6)
    out = []
    for color, v, f in parts:
        q = np.round((v - lo) / span * 65535).astype("<u2")
        out.append({"color": color, "v": base64.b64encode(q.tobytes()).decode(), "f": base64.b64encode(f.astype("<u4").tobytes()).decode()})
    doc = {"id": model_id, "label": label, "size": size.round(4).tolist(), "scale": (span / 65535).tolist(),
           "offset": (lo - centre).tolist(), "parts": out}
    p = OUT / f"{model_id}.json"
    p.write_text(json.dumps(doc, separators=(",", ":")))
    print(f"{model_id:8s} {p.stat().st_size / 1024:7.0f} KB  size {np.round(size, 3)}")


def rot(rpy):
    r, p, y = rpy
    cx, sx, cy, sy, cz, sz = math.cos(r), math.sin(r), math.cos(p), math.sin(p), math.cos(y), math.sin(y)
    return np.array([[cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx],
                     [sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx],
                     [-sy, cy * sx, cy * cx]])


def tf(xyz=(0, 0, 0), rpy=(0, 0, 0)):
    t = np.eye(4); t[:3, :3] = rot(rpy); t[:3, 3] = xyz; return t


def apply(t, v):
    return (np.c_[v, np.ones(len(v))] @ t.T)[:, :3]


# ---- devices from the formulation-cell twin
write("cnc", [(color_for(n), v, f) for n, v, f in npz_parts("cnc")], "CNC dispensing gantry")
write("ecopen", [("#c9cfd6" if i else "#3b4048", v, f) for i, (n, v, f) in enumerate(npz_parts("ecopen"))], "eco-PEN volumetric dispenser")
write("powder", [("#7a5bb5" if i == 0 else "#c9cfd6", v, f) for i, (n, v, f) in enumerate(npz_parts("powder"))], "Powder dispenser")
write("balance", [(color_for(n, "#d9dde2"), v, f) for n, v, f in npz_parts("scale")], "Analytical balance")
write("mixer", [("#eef0f2", v, f) for n, v, f in npz_parts("cell", "mixer/")], "Planetary mixer")
write("cup", [("#e2b56b", v, f) for n, v, f in npz_parts("cell", "cup/")], "Premix cup")

# ---- UR e-Series arms, posed in a working posture
READY = [0.0, -2.1, 1.75, -1.2, -math.pi / 2, 0.0]
LINKS = ("base", "shoulder", "upper_arm", "forearm", "wrist_1", "wrist_2", "wrist_3")
for arm_name in ("ur3e", "ur5e", "ur10e", "ur16e"):
    arm = load_arm(arm_name)
    frames = arm.frames(READY)
    z = np.load(MESH / f"{arm_name}.npz")
    parts = []
    for i, link in enumerate(LINKS):
        for key in z.keys():
            if key.startswith(link + "/") and key.endswith("/vertices"):
                base = key[: -len("/vertices")]
                parts.append(("#8f98a3" if link == "base" else "#dfe3e8", apply(frames[i], z[key].astype(float)), z[base + "/faces"].astype(np.uint32)))
    write(arm_name, parts, f"Universal Robots {arm_name.upper()}")


# ---- UFACTORY Lite 6 from its URDF
def read_stl(path):
    data = path.read_bytes()
    n = struct.unpack("<I", data[80:84])[0]
    tri = np.frombuffer(data[84:84 + n * 50], dtype=np.dtype([("n", "<f4", 3), ("v", "<f4", (3, 3)), ("a", "<u2")]))["v"].reshape(-1, 3).astype(float)
    uniq, inv = np.unique(np.round(tri, 6), axis=0, return_inverse=True)
    return uniq, inv.reshape(-1, 3).astype(np.uint32)


if LITE6:
    root = ET.parse(LITE6 / "lite6.urdf").getroot()
    visual = {}
    for link in root.findall("link"):
        vis = link.find("visual")
        if vis is not None and vis.find("geometry/mesh") is not None:
            o = vis.find("origin")
            visual[link.get("name")] = (vis.find("geometry/mesh").get("filename"),
                                        tf([float(x) for x in o.get("xyz").split()], [float(x) for x in o.get("rpy").split()]) if o is not None else np.eye(4))
    joints = {j.find("child").get("link"): j for j in root.findall("joint")}
    pose = {"joint2": 0.5, "joint3": 1.1, "joint5": 0.8}
    world = {}

    def frame(link):
        if link in world:
            return world[link]
        j = joints.get(link)
        if j is None:
            world[link] = np.eye(4); return world[link]
        o = j.find("origin")
        t = frame(j.find("parent").get("link")) @ tf([float(x) for x in o.get("xyz").split()], [float(x) for x in o.get("rpy").split()])
        if j.get("type") == "revolute":
            ax = j.find("axis"); a = np.array([float(x) for x in ax.get("xyz").split()]) if ax is not None else np.array([0, 0, 1.0])
            ang = pose.get(j.get("name"), 0.0)
            k = a / np.linalg.norm(a); K = np.array([[0, -k[2], k[1]], [k[2], 0, -k[0]], [-k[1], k[0], 0]])
            r = np.eye(4); r[:3, :3] = np.eye(3) + math.sin(ang) * K + (1 - math.cos(ang)) * K @ K
            t = t @ r
        world[link] = t; return t

    parts = []
    for link, (fname, vo) in visual.items():
        if "gripper" in fname:
            continue
        v, f = read_stl(LITE6 / fname)
        parts.append(("#f2f3f4" if "base" not in fname else "#cfd3d8", apply(frame(link) @ vo, v), f))
    write("lite6", parts, "UFACTORY Lite 6")
