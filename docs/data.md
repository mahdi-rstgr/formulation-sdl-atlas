# Data guide

## `data/review.json`

Machine-readable content of the final (V3) review manuscript.

| Key | Type | Content |
|---|---|---|
| `title`, `version` | string | Manuscript title and version |
| `authors` | list of `{name, affiliation, corresponding}` | Eight authors in order |
| `affiliations` | object | `a`, `b`: full affiliation text |
| `abstract`, `keywords` | string, list | As in the manuscript |
| `sections` | list | Numbered section and subsection headings |
| `figure_captions` | object | Figure number → caption |
| `steps` | list of `{step, name, question, section}` | The seven steps (Dose, Move, Buy, Extend, Rehearse, Orchestrate, Decide) |
| `table_1` … `table_7` | `{caption, columns, rows}` | Tables exactly as in the manuscript. Each row is an object keyed by column name. Reference cells look like `[46]` or `[3,58]` |
| `literature_scenarios` | list of `{figure, material_class, sense_act, ref, citation}` | The 20 scenarios of Fig. 3 |
| `references` | list of `{n, text}` | 178 references, numbered as in the manuscript |

Prices and accuracies are strings, kept exactly as written in the review (for example `"$191–350"`, `"Quote"` or `"~$42,000 (reseller)"`). The atlas parses them in `assets/app.js` (`parsePrice`, `parseRep`).

## `data/twin/<arm>.json`

| Key | Content |
|---|---|
| `arm` | `name`, `reach` (m), `payload_kg`, `labels`, `home` (rad), `origins` (6 joint origin matrices), `base_to_inertia`, joint limits |
| `base` | 4×4 base pose, column-major |
| `arm_meshes` | Per link: list of `{name, vertices, faces, normals}`; base64 float32 and uint32 arrays in metres |
| `devices` | `{name, label, pose, color, meshes, box}` for the balance, CNC gantry, mixer and characterizer |
| `cup` | Premix cup meshes |
| `stations` | Pick and place point for each station (m) |
| `gripper`, `cup_height` | Tool length and cup height (m) |
| `runs` | Planned transfers: `{source, dest, segments: [{label, carrying, joints, min_clearance_mm}]}`. Joint angles are in radians, sampled every 0.03 rad |
