# Formulation SDL Atlas

**Live site:** https://mahdi-rstgr.github.io/formulation-sdl-atlas/ · **Wiki:** https://mahdi-rstgr.github.io/formulation-sdl-atlas/wiki/

This repository is the public home of a project from the [Acceleration Consortium](https://acceleration.utoronto.ca/), University of Toronto. The project's goal is a laboratory that can design itself for formulation. Handed a budget, a set of ingredients and a room, it should propose the equipment and layout, show the cell as a digital twin, and keep its knowledge of commercial hardware up to date.

The project has four parts:

| Part | What it is | Status |
|---|---|---|
| **Review** | *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents*: 8 authors, 178 references, 7 comparison tables, 9 figures | Complete (manuscript in preparation for submission) |
| **Wiki** | Living directory of materials, handling strategies, robots, dispensers, platforms, prices, simulation tools and agents, rebuilt from the final manuscript | Updated to V3 ([`wiki/`](wiki/), source in [`wiki-src/`](wiki-src/)) |
| **Library agent** | Watches vendor releases and proposes new or changed catalogue entries, each with its source and date, for a person to approve | Designed ([spec](docs/library-agent.md)) |
| **Self-Formulating Lab (SFL) agent + twin** | Talks with a user about budget, materials and space, proposes a cell, shows it in a 3D twin with collision-checked robot motions, and lets the user swap products | Prototype ([spec](docs/sfl-agent.md)); the twin and the selection step run on the live site |

## The atlas (this site)

The landing page is one static page with no build step. It follows a premix cup through the seven questions the review is organized around. A sticky 3D twin of a formulation cell moves its camera to the part of the cell each step is about.

| Step | Question | What the page shows | Source |
|---|---|---|---|
| 1 Dose | How is each ingredient dosed? | Draggable viscosity, yield-stress and Hausner-ratio scales that return the recommended dispensing technology and matching products | Table 1, Table 3 |
| 2 Move | How does the premix cup move? | Robot repeatability vs. list price, by class; the twin plays a planned balance → mixer transfer | Table 2 |
| 3 Buy | What can be bought? | Filterable catalogue of 17 dispensers and 8 integrated platforms with log-scale price bars; quote-only items marked | Tables 3–4 |
| 4 Extend | How to go beyond the catalogue? | Ten retrofits grouped by the layer they change | Table 5 |
| 5 Rehearse | Will the plan work? | Four-level fidelity ladder with tools; the twin shows the collision boxes it plans against | Table 6, Fig. 7 |
| 6 Orchestrate | How do devices run as one? | Architecture of a formulation SDL | Fig. 8 |
| 7 Decide | What to make next? | Five agent roles with autonomy level and human checkpoint | Table 7, Fig. 9 |

Below the steps:

- **Twenty literature scenarios** (Fig. 3), each titled by its sense–act sequence and filterable by material class.
- **Plan a cell**, a preview of the SFL agent's selection step. It picks a robot from Table 2 that meets the repeatability you need, picks a dispenser per material class from Table 3, totals the list prices against your budget, and loads the cell in the twin. It is rule-based and its rules are printed on the page.
- **Citation** and **related work** (Self-Building Labs).

Every number links to its reference in the wiki (`wiki/references/#ref-N`).

### The digital twin

The twin is the Self-Formulating Lab cell exported as static data:

- **Arms:** UR3e, UR5e, UR10e and UR16e, built from Universal Robots' official description files.
- **Devices:** an analytical balance, a CNC dispensing gantry, a Thinky planetary mixer and a characterizer, tessellated from CAD with OpenCASCADE.
- **Motions:** for each arm, the three premix transfers (balance → mixer → characterizer → balance) were planned offline with RRT-Connect in joint space and checked for clearance against the device boxes, the table, the gripper and the carried cup. Each step of a transfer shows its minimum clearance.

`data/twin/<arm>.json` holds the meshes (base64), the kinematics and the planned trajectories. The page runs forward kinematics in the browser. Nothing is simulated beyond kinematics and clearance: there are no forces and no material physics (level 2 of the review's fidelity hierarchy).

## The Lab Builder

[`builder/`](builder/) is a three-pane tool. On the left is a device library, in the middle a 3D workstation, and on the right a cart.

- **Devices:** users drag devices from six categories into the workstation:
  - material handlers: liquid, paste and powder dispensers
  - motion providers: a CNC gantry with a three-slot tool dock in front
  - robot arms: all five classes in the review (Cartesian gantry, SCARA, 6-DOF, 7-DOF, mobile manipulator)
  - mixers
  - balances and stations
  - integrated platforms (OT-2, Flex, Hamilton STAR, epMotion, Fluent, Biomek i7, Bravo, Echo, I.DOT, Chemspeed)
- **Moving devices:** drag to move, Q/E/R to rotate, D to duplicate, Delete to remove. Tools dropped near a CNC dock slot snap into it.
- **Cart:** updates live with list prices from Tables 2–4 (USD and EUR kept separate). Quote-only, lab-built and unlisted items are shown but not added to the total. There is a budget bar.
- **Layout checks:** footprint overlaps, devices outside the workstation, and which stations each arm can reach. Reach rings are drawn on the floor.
- **Templates and sharing:** templates (SFL cell, liquid-handling bench, powder and paste station), a share link that stores the layout in the URL, a CSV parts list, and autosave in the browser.
- **Models:**
  - Real meshes: the formulation-cell CNC gantry, eco-PEN, powder dispenser, balance, mixer and cup, the four UR e-Series arms, and the UFACTORY Lite 6 (`data/models/`, exported by `scripts/export_models.py`).
  - Everything else is drawn procedurally at approximate footprints (`builder/catalog.js`).

## Repository layout

| Path | Content |
|---|---|
| `index.html`, `assets/` | The atlas page (three.js 0.160 from unpkg, plain ES modules, no build) |
| `data/review.json` | Machine-readable review: title, authors, abstract, keywords, section list, figure captions, the seven steps, Tables 1–7, 20 literature scenarios, 178 references ([schema](docs/data.md)) |
| `data/twin/*.json` | Twin scenes and planned transfers per arm |
| `data/models/*.json` | Real device and arm meshes for the Lab Builder (quantised) |
| `builder/` | Lab Builder: `catalog.js` (devices, procedural models), `builder.js` (app) |
| `figures/` | Review figures used on the site (Figs. 1, 3, 4, 7, 8, 9 and the graphical abstract) |
| `wiki-src/` | MkDocs Material source of the wiki |
| `wiki/` | Built wiki, served at `/wiki/` |
| `docs/` | Specs for the library agent and the SFL agent, data guide, roadmap |
| `scripts/` | Scripts that regenerate `data/` from the manuscript and the SFL code |

## Run locally

```bash
python -m http.server 8000        # then open http://localhost:8000
```

To rebuild the wiki:

```bash
pip install mkdocs-material
mkdocs build -f wiki-src/mkdocs.yml --site-dir ../wiki
```

To regenerate the data, check out [`mahdi-rstgr/Material_Handling`](https://github.com/mahdi-rstgr/Material_Handling) (branch `self-formulating-lab`) next to this repository. Then run:

```bash
python scripts/build_review_json.py ../Material_Handling      # Manuscript_V3.md + kb/review.json -> data/review.json
cd ../Material_Handling/self_formulating_lab && python ../../formulation-sdl-atlas/scripts/export_twin.py ../../formulation-sdl-atlas/data/twin
```

The interactive SFL agent (chat with a local LLM through Ollama and LiteLLM, plus on-demand motion planning) lives in that repository under `self_formulating_lab/`.

## Roadmap

See [docs/roadmap.md](docs/roadmap.md). In short:

1. **Catalogue as data:** move Tables 2–4 and the wiki's hardware pages into one `catalog.json` with per-field sources and dates.
2. **Library agent:** a scheduled job that proposes catalogue updates as pull requests.
3. **SFL agent:**
   - Requirements dialogue.
   - Layout optimization over cost, footprint, throughput and handling accuracy.
   - Drag-and-drop editing in the twin, with reach and collision re-checked after every move.
   - A bill of materials as output.
4. **Hand-off:** export a designed cell in a form that a self-building lab can start from.

## Authors

Mohammad M. Rastegardoost<sup>a,*</sup>, Zeqing Bao<sup>a</sup>, Sara Sadr<sup>a</sup>, Nasim Abdollahi<sup>a</sup>, Kourosh Darvish<sup>a</sup>, Aaron Clasky<sup>a</sup>, Hiroki Ohsaka<sup>b</sup>, Frantz Le Devedec<sup>a</sup>

<sup>a</sup> Acceleration Consortium, University of Toronto, Toronto, ON M5S 3H6, Canada · <sup>b</sup> SEKISUI Chemical Co., Ltd., Osaka, Japan · <sup>*</sup> m.rastegardoost@utoronto.ca

## Citation

> M. M. Rastegardoost, Z. Bao, S. Sadr, N. Abdollahi, K. Darvish, A. Clasky, H. Ohsaka, F. Le Devedec. *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents.* Manuscript in preparation, 2026.

## Related work

[Self-Building Labs](https://self-building-labs.github.io/) (Bai, Zhao et al., [arXiv 2610.23826](https://arxiv.org/abs/2610.23826)) build the layout, twin, robot skills and workflows a lab needs for a scientific goal. The Self-Formulating Lab works one step earlier: it chooses what to buy and how to lay it out for a formulation budget. We see the two as complementary.

## Licence

- **Code** (`index.html`, `assets/`, `scripts/`): MIT, see [LICENSE](LICENSE).
- **Review text, tables, figures and wiki content:** © the authors, all rights reserved until the review is published.
- **UR e-Series meshes and kinematics in `data/twin/` and `data/models/ur*.json`:** BSD-3-Clause, Universal Robots ([data/twin/LICENSE-UR](data/twin/LICENSE-UR)).
- **UFACTORY Lite 6 mesh (`data/models/lite6.json`):** BSD-3-Clause, UFACTORY Inc., via hygradme/lite6_urdf ([data/models/LICENSE-Lite6](data/models/LICENSE-Lite6)).
- **Product names** are trademarks of their owners and are used only to identify products. Prices are list prices found by the authors in 2026, and many vendors quote on request.
