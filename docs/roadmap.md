# Roadmap

Status as of November 2026.

| Track | Done | Next |
|---|---|---|
| Review | Manuscript V3 complete (8 authors, 178 references, 7 tables, 9 figures) | Submit; then add the DOI to the atlas, wiki and `data/review.json` |
| Wiki | Rebuilt from V3 and published at `/wiki/` | Generate the hardware pages from `catalog.json` |
| Atlas site | Seven-step scroll with live twin, charts from Tables 1–7, scenarios, planner preview | Add the open-source orchestration comparison (Supplementary Table S1) as an interactive table |
| Catalogue | Tables 2–4 in `review.json` | Create `catalog.json` with per-field source, date and grade ([library agent spec](library-agent.md)) |
| Library agent | Spec | Weekly diff job, then LLM-proposed pull requests |
| SFL agent | Twin, RRT-Connect, local chat agent, selection preview | Requirements dialogue, then layout optimizer, then drag-and-drop editing, then bill of materials |
| Twin | Four UR arms, balance, CNC gantry, mixer, characterizer | Meshes for the most-cited dispensers and robots in Tables 2–3; a second robot class (SCARA or gantry) |
| Outreach | Brief prepared for the Matter Lab / Self-Building Labs | Agree on a shared cell description for the SFL → SBL hand-off |

## Milestones

1. **M1: Catalogue as data.** `catalog.json`, validator, and wiki hardware pages generated from it.
2. **M2: Library agent v1.** Weekly pull requests with sourced changes, reviewed by a person.
3. **M3: SFL agent v1.** From a requirements chat to a rehearsed cell, a bill of materials and a shareable twin link.
4. **M4: Drag-and-drop lab builder.** Users compose their own cell from the catalogue, with live reach and collision feedback.
5. **M5: Hand-off.** Export a designed cell in a format a self-building lab can start from.
