"""Build data/review.json from the final manuscript and the SFL knowledge base.

Usage:  python scripts/build_review_json.py <path to Material_Handling checkout>
Reads Manuscript_V3.md (title, authors, abstract, keywords, sections, captions) and
self_formulating_lab/kb/review.json (Tables 1-7, scenarios, references; built by its build_kb.py).
"""
import json, re, sys
from pathlib import Path

src = Path(sys.argv[1])
md = (src / "Manuscript_V3.md").read_text(encoding="utf8")
kb = json.loads((src / "self_formulating_lab/kb/review.json").read_text(encoding="utf8"))
lines = md.split("\n")
authors = []
for a in lines[2].split(", "):
    m = re.match(r"(.+?)\s+([ab])(\*)?$", a.strip())
    authors.append({"name": m.group(1), "affiliation": m.group(2), "corresponding": bool(m.group(3))})
out = {
    "title": lines[0].lstrip("# ").strip(),
    "version": "V3 (final)",
    "authors": authors,
    "affiliations": {"a": "University of Toronto, Toronto, ON M5S 3H6, Canada",
                     "b": "SEKISUI Chemical Co., Ltd., Osaka, Japan"},
    "abstract": md.split("## Abstract")[1].split("**Keywords:**")[0].strip(),
    "keywords": [k.strip() for k in md.split("**Keywords:**")[1].split("\n")[0].split(";")],
    "sections": [l.lstrip("# ").strip() for l in lines if re.match(r"^##+ \d", l)],
    "figure_captions": {int(m.group(1)): m.group(2).strip() for m in re.finditer(r"^\*\*Figure (\d+)\.\*\*\s*(.+)$", md, re.M)},
}
out.update(kb)
dst = Path(__file__).resolve().parents[1] / "data/review.json"
dst.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf8")
print("wrote", dst, len(out["references"]), "references")
