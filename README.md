# assemblab

**Build your self-driving lab, module by module.**

The interface is a dark dashboard: a left sidebar with the main sections, a top bar with search, theme and cart, navy cards with hairline borders, gradient stat tiles and blue, violet and cyan accents (`assets/bl.css`; a light theme sits behind the top-bar toggle). Text uses plain Google Fonts: Space Grotesk for headings and the wordmark, Inter for body text, Roboto Mono for numbers and part codes. The logo is the Twin Module mark: three solid modules and one dashed module, the physical cell and its digital twin. Its vector files are in `assets/brand/` and are built by `scripts/build_brand.py`.

**Live site:** https://mahdi-rstgr.github.io/formulation-sdl-atlas/

assemblab is where scientists design self-driving labs. They explore robots, dispensers, platforms, workstations and open-source software from every maker, lay the cell out in 3D, check that it works, and then buy each part from the company that makes it. assemblab sells nothing: the cart is split by vendor, and each group links to the maker's own page to order or request a quote.

The structure follows [vention.com](https://vention.com), which does the same for factory automation but sells its own parts.

| Path | Page | What it does |
|---|---|---|
| `/` | Home | A slow 360° turn around the whole self-driving lab (platform, twin, orchestration, data centre, models, agents) with the title on a dark gradient over its left side, as on vention.com; the partner ribbon; **Standardize automation across the lab**: the platform on a lab floor, a *Full lab floor* tab, then the 13 stages from the review as horizontal tabs, with hardware, digital twin, orchestration, data centre, models, agents and safety appearing stage by stage and animated connections between them (content in `data/sdl-workflow.js`, scene in `assets/sdl-scene.js`, deep links `#sdl-floor`, `#sdl-twin`, `#sdl-agents`, …); method; materials; the self-driving layer; parts categories; templates; sourcing; evidence |
| [`/lab-simulator/`](lab-simulator/) | Lab Simulator | The 3D Lab Simulator (formerly the Lab Builder), laid out like the rest of the site: the device library sits in a left sidebar, one collapsible group per category (all collapsed at first; a search opens the groups that match), and devices are dragged into the workstation. It opens with a start screen (blank, a template, or your saved design) and sends the design to the cart. `?t=<template>` opens a template and `?add=<id,id>` adds parts. |
| [`/parts/`](parts/) | Parts library | All parts with filters for category, material, type, price and maker; search; sort; a detail drawer for each part (`?cat=`, `?mat=`, `?q=`, `?p=`) |
| [`/solutions/`](solutions/) | Solutions | Guides by material (liquids, pastes and gels, powders, objects), design templates, and the 20 published sense–act loops |
| [`/self-driving/`](self-driving/) | Self-driving layer | Architecture (L1–L4); an orchestration picker built on Supplementary Table S1 that ranks the eight open-source systems by the functions you tick; the simulation fidelity ladder (Table 6); AI agent roles (Table 7) and optimizers |
| [`/cart/`](cart/) | Cart | Grouped by vendor with "order or quote" links and a contacted checklist; totals; a self-driving readiness check (act, sense, decide and run) that suggests the lowest-priced part for each missing step; share link (`?c=id:qty,…`); CSV; import from the current design |
| [`/atlas/`](atlas/) | Atlas | The original interactive review atlas with the live digital twin |
| [`/wiki/`](wiki/) | Learn | The wiki, rebranded as assemblab Learn |
| `/new-design/`, `/builder/` | | Redirect to `/lab-simulator/` so old links and shared designs keep working |

### Shared code

- `data/catalog.js`: the single parts catalogue. It holds 294 parts (the review's 95 plus 199 instruments from ChemLab-Assets), each with maker, category, materials handled, published price, headline spec, vendor URL and review references. It also says whether a part can be placed in 3D and which capabilities it adds.
- `data/templates.js`: the design templates used by the home page, Solutions and the Lab Simulator.
- `assets/bl.css`, `assets/bl.js`: the design system and the shared runtime: the app shell (sidebar, top bar, footer), a cart stored in `localStorage` and shared by every page, product cards with provider logos, and the product drawer.
- `assets/logos/`: provider logos. `logoOf()` in `data/catalog.js` picks a logo for each part (Opentrons, Universal Robots, and site icons for other makers). Makers without a logo get a two-letter badge.
- `assets/platform.js`: the demonstration platform composed from catalogue CAD (two McMaster-Carr workstations under a stainless deck with an OT-2, a Lite 6, a balance, labware, a 3030 gantry with three dispensing tools, the gantry viscometer, a mixer, pumps, a flow sensor, a stack light and an e-stop). It is used by the home-page 3D scene and the hero render.
- `tools/render-hero-orbit.html`: renders the home-page hero, one slow 360° orbit around the whole lab of section 1 (platform, digital twin, orchestration, data centre, models, agents), in batches of JPEG frames (`?n=240&k0=0&k1=30`, 1120 × 630). The frames are assembled into `assets/img/lab-orbit.webp` (animated, 240 frames at 10 fps: one turn every 24 s) and `assets/img/lab-orbit-poster.webp` (the still shown first, and to visitors who prefer reduced motion).
- `tools/render-platform.html`: renders a still of the platform alone and projects each component's outline for hotspots (not used by the current hero).

### ChemLab-Assets instruments (MBZUAI)

199 laboratory instruments from [ChemLab-Assets](https://mbzuai-nlp.github.io/ChemLab-Assets/) (Song, Zhang, Zhang, Ma, Chang, Chen; MBZUAI; release 1.5.0) are in the parts library and the Lab Simulator. They cover spectroscopy, chromatography, thermal and particle analysis, imaging, elemental analysis, synthesis, separation, sample prep, materials processing and lab utilities, each a specific commercial model with simulation-ready geometry.

- `tools/import_chemlab.py` reads the public catalogue and writes `data/chemlab.js` (name, maker, model, domain, size, up axis, GLB path) and the thumbnails in `assets/img/chemlab/`. Four instruments the catalogue already had with its own model (Quantos, THINKY ARE-310, PreciseFlex 400, Opentrons Flex) are skipped.
- The GLB models are **not** copied into this repository (about 1 MB each). The Lab Simulator streams each one from the [Hugging Face dataset](https://huggingface.co/datasets/MBZUAI/ChemLab-Assets) when it is placed, turns Y-up assets to Z-up and stands them on the floor at true scale.
- They sit in three new categories, *Analytical instruments*, *Synthesis & sample prep* and *Lab environment & utilities*, plus the existing ones where they fit (balances and meters, the syringe pump). Their capabilities (weigh, mix, characterize, dose) feed the Lab Simulator's checks and run simulation.
- **Licence:** the assets are **CC BY-NC 4.0** (attribution, non-commercial use only). Every entry, the product drawer and the footer credit the source and the licence. Commercial use of these models needs permission from the authors.

### Lab-built devices and research tools

Lab-built devices (the positive-displacement liquid pen, the auger powder dispenser, the gantry viscometer, the peristaltic and reciprocating pumps and the formulation cell) are listed as *Lab-built*. Research tools for self-driving labs are listed by function: the lab orchestration OS, the constrained Bayesian planner, the categorical Bayesian optimizer, the robust optimizer, the hierarchical multi-objective scalarizer, the optimizer benchmark suite, the self-building lab planner, and three agents (lab copilot, quantum-chemistry, campaign and recovery). Published ones link to their paper.

### The formulation cell, renders and CAD

- `assets/img/formulator/*.webp`: two renders of the lab-built formulation cell (template card), compressed from the original PNGs.
- `data/models/lab-formulator.json`: the formulation cell assembly from its STEP file, with each top-level component tagged by subsystem (`frame`, `arm`, `gantry`, `dispensers`, `balance`, `mixer`) for highlighting on the home page. It can also be placed in the Lab Simulator as one unit.
- `data/models/ot2.json`: Opentrons' OT-2 reference model, which replaces the procedural OT-2 in the Lab Simulator.

### McMaster-Carr parts and lab CAD

Workstations, pedestals, a UR electric slide, a delta robot and its safety enclosure from McMaster-Carr can be placed in the Lab Simulator, along with the lab-built positive-displacement liquid pen. These are real CAD:

- `scripts/export_step.py` tessellates STEP files with OpenCASCADE (`pip install cadquery-ocp numpy`). It drops fasteners, decimates within each face, converts McMaster's Y-up to Z-up and writes `data/models/*.json`. `--groups` tags assembly subsystems; the exact commands for every model are in the script's docstring.
- Source CAD and render PNGs are not kept in the repository; only the meshes and WebP renders are published.
- In the Lab Simulator, anything dropped onto a workstation, pedestal or slide rests on top and moves with it. The delta robot hangs inside its enclosure.
- Template renders on the home page and Solutions cards come from `lab-simulator/?shot=<template>`, which loads the template, frames it and writes a 1600 × 900 PNG into `<pre id="shot-out">` for headless capture; they are saved as `assets/img/templates/<template>.webp`.
- Thumbnails come from `lab-simulator/?thumbs=<id,id>`. The page writes the PNGs as data URLs into `<pre id="thumbs-out">` for headless capture.

## The atlas (`/atlas/`)

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
- **Citation** and **related work** (the self-building lab planner).

Every number links to its reference in the wiki (`wiki/references/#ref-N`).

### The digital twin

The twin is the Self-Formulating Lab cell exported as static data:

- **Arms:** UR3e, UR5e, UR10e and UR16e, built from Universal Robots' official description files.
- **Devices:** an analytical balance, a CNC dispensing gantry, a Thinky planetary mixer and a characterizer, tessellated from CAD with OpenCASCADE.
- **Motions:** for each arm, the three premix transfers (balance → mixer → characterizer → balance) were planned offline with RRT-Connect in joint space and checked for clearance against the device boxes, the table, the gripper and the carried cup. Each step of a transfer shows its minimum clearance.

`data/twin/<arm>.json` holds the meshes (base64), the kinematics and the planned trajectories. The page runs forward kinematics in the browser. Nothing is simulated beyond kinematics and clearance: there are no forces and no material physics (level 2 of the review's fidelity hierarchy).

## The Lab Simulator (`/lab-simulator/`, formerly New design and the Lab Builder)

[`lab-simulator/`](lab-simulator/) is a 3D lab simulator. The device library sits in a left sidebar, and the workstation fills the rest of the screen.

### The digital layer: orchestration, optimizers and AI agents

Orchestration software (MADSci, AlabOS, EOS, UniLabOS, the lab orchestration OS, PyLabRobot), optimizers (the constrained Bayesian planner, the categorical Bayesian optimizer, Ax, BayBE) and AI agents (the lab copilot agent, the quantum-chemistry agent, the campaign and recovery agent) can be placed like devices. They stand as control stations in a row behind the workstation and are left out of the footprint, overlap and reach checks. The run simulation is in `lab-simulator/sim.js`; the **Run** tab of the side panel shows it.

- **Orchestration.** The first orchestrator builds a workflow from the capabilities on the deck (dose → move → weigh → mix → move → characterize) and runs it once per experiment. Commands fly to each device, the device glows while it works, and weighing and characterization send data back. Dispensing steps fail now and then; the orchestrator pauses and retries.
- **Optimizers.** Each experiment makes a premix at a thickener fraction *x* and measures a desirability *y* from a hidden response curve with noise. An optimizer starts with a two-point space-filling design, then fits a Gaussian process (RBF kernel, exact inference) and proposes the next *x* by upper confidence bound. Its screen and the Run tab plot the mean, the ±2σ band and the observations. Without an optimizer the orchestrator walks a fixed grid; without a characterization station nothing is measured and the loop stays open.
- **Agents.** Agents draft the campaign, re-plan every six experiments and draft recoveries after faults. They act only through the orchestrator, behind a human-approval gate: automatic by default, or manual with *Ask me to approve every agent plan* and the **Approve plan** button.
- **Checks.** The Cell intelligence tab lists *Orchestrate as one workflow* and *Choose the next experiment* as capabilities, and warns when optimizers or agents have no orchestrator to act through.
- The **Closed-loop cell** template (`?t=loop`) is the Self-Formulating Lab cell with MADSci, the constrained Bayesian planner and the campaign and recovery agent.

- **Device banner:** six categories of devices, each with a rendered thumbnail and its list price:
  - **Material handlers:** liquid, paste and powder dispensers
  - **Motion providers:** a CNC gantry with a three-slot tool dock, and the Jubilee tool-changer
  - **Robot arms:** all five classes in the review (Cartesian, SCARA, 6-DOF, 7-DOF, mobile)
  - **Mixers**
  - **Balances and stations**
  - **Integrated platforms:** OT-2, Flex, STAR, epMotion, Fluent, Biomek i7, Bravo, Echo, I.DOT and Chemspeed

  Drag a card into the workstation, or press +.
- **Everything runs while it is placed:**
  - Liquid handlers pick tips, aspirate and fill a plate column by column, with touchscreens showing progress.
  - The CNC gantry's three axes trace a dispensing path.
  - Pumps, feeders and the Quantos dose; the balance shows a live mass reading; the rheometer draws a flow curve.
  - The UR e-Series and Lite 6 meshes are articulated. The UR arms replay RRT-Connect transfers planned in the SFL twin.
  - Space pauses everything.
- **6-DOF placement:** drag a device on the floor, or use the move/rotate gizmo (G and R keys, local or world axes). The inspector has numeric X, Y, Z, roll, pitch and yaw fields. Pens, powder dispensers and pipettes snap into CNC dock slots, and the premix cup rests on whatever it is dropped on.
- **Linked numbering:** every device gets a number. Hovering a device shows its name and price and highlights its cart row. Hovering a cart row highlights the device.
- **Cell intelligence:**
  - a capability check (dose liquids, pastes and powders; weigh; move containers; mix; characterize), with a one-click add of the lowest-priced device for any missing step
  - overlap and workstation-boundary checks
  - per-arm reach lists
  - auto-arrange around the arm with the longest reach
  - live metrics: reach coverage, floor used, budget used, issues
- **Templates, sharing and export:** six templates (including one on McMaster-Carr structure), share links that store the full 6-DOF layout in the URL, a CSV parts list with positions, and autosave in the browser.
- **Models:**
  - Real meshes: the formulation-cell devices and articulated UR e-Series and Lite 6 arms (`data/models/`, from `scripts/export_models.py`).
  - Everything else is procedural and drawn at approximate footprints (`builder/catalog.js`).
  - Thumbnails are rendered by opening `lab-simulator/?thumbs=1`.

## Repository layout

| Path | Content |
|---|---|
| `index.html`, `parts/`, `solutions/`, `self-driving/`, `cart/` | assemblab pages (plain HTML and ES modules, no build) |
| `assets/bl.css`, `assets/bl.js` | assemblab design system and shared runtime |
| `data/catalog.js`, `data/templates.js` | Parts catalogue and design templates |
| `atlas/`, `assets/app.js`, `assets/style.css` | The atlas page (three.js 0.160 from unpkg) |
| `data/review.json` | Machine-readable review: title, authors, abstract, keywords, section list, figure captions, the seven steps, Tables 1–7, 20 literature scenarios, 178 references ([schema](docs/data.md)) |
| `data/twin/*.json` | Twin scenes and planned transfers per arm |
| `data/models/*.json` | Real device meshes and articulated arms (`*_arm.json`: link meshes, joint chain, trajectory) for the Lab Builder |
| `lab-simulator/` | Lab Simulator: `catalog.js` (3D models, animated procedural models), `builder.js` (app), `sim.js` (run simulation of the digital layer), `thumbs/` (rendered card images) |
| `builder/` | Redirect to `lab-simulator/` |
| `figures/` | Review figures used on the site (Figs. 1, 3, 4, 7, 8, 9 and the graphical abstract) |
| `wiki-src/` | MkDocs Material source of the wiki |
| `wiki/` | Built wiki, served at `/wiki/` |
| `docs/` | Specs for the library agent and the SFL agent, data guide, roadmap |
| `scripts/` | Scripts that regenerate `data/` from the manuscript, the SFL code and the CAD in `CAD/` |

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

<sup>a</sup> University of Toronto, Toronto, ON M5S 3H6, Canada · <sup>b</sup> SEKISUI Chemical Co., Ltd., Osaka, Japan · <sup>*</sup> m.rastegardoost@utoronto.ca

## Citation

> M. M. Rastegardoost, Z. Bao, S. Sadr, N. Abdollahi, K. Darvish, A. Clasky, H. Ohsaka, F. Le Devedec. *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents.* Manuscript in preparation, 2026.

## Related work

Self-building lab planners (for example Bai, Zhao et al., [arXiv 2610.23826](https://arxiv.org/abs/2610.23826)) build the layout, twin, robot skills and workflows a lab needs for a scientific goal. The Self-Formulating Lab works one step earlier: it chooses what to buy and how to lay it out for a formulation budget. We see the two as complementary.

## Licence

- **Code** (pages, `assets/`, `data/*.js`, `lab-simulator/`, `scripts/`): MIT, see [LICENSE](LICENSE).
- **McMaster-Carr meshes (`data/models/mcm-*.json`):** tessellated from CAD that McMaster-Carr provides for its catalogue parts. They are used only to visualize those parts. McMaster-Carr is a trademark of McMaster-Carr Supply Company.
- **Review text, tables, figures and wiki content:** © the authors, all rights reserved until the review is published.
- **UR e-Series meshes and kinematics in `data/twin/` and `data/models/ur*.json`:** BSD-3-Clause, Universal Robots ([data/twin/LICENSE-UR](data/twin/LICENSE-UR)).
- **UFACTORY Lite 6 mesh (`data/models/lite6.json`):** BSD-3-Clause, UFACTORY Inc., via hygradme/lite6_urdf ([data/models/LICENSE-Lite6](data/models/LICENSE-Lite6)).
- **Product names** are trademarks of their owners and are used only to identify products. Prices are list prices found by the authors in 2026, and many vendors quote on request.

