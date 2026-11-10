# Self-Formulating Lab (SFL) agent: spec

**Status:** prototype. The twin, motion planning and a local chat agent run in [`mahdi-rstgr/Material_Handling`](https://github.com/mahdi-rstgr/Material_Handling) (`self_formulating_lab/`). The selection step runs as a preview on the atlas page.

## Purpose

A formulator who wants to automate should be able to describe what they need in plain language and get back a cell they can inspect, edit and price:

- **Budget:** the money available for handling hardware.
- **Ingredients:** materials and their properties, such as viscosity in cP, yield stress in Pa and Hausner ratio.
- **Throughput:** samples per day.
- **Space:** floor area and bench depth.
- **Constraints:** for example, an existing balance or a fume hood.

## Session flow

1. **Requirements dialogue.** The agent asks for anything it is missing and maps each ingredient to a material class (review Table 1).
2. **Candidate cell.** Per material class, it picks a dosing mechanism and product (Tables 1, 3 and 4). It then picks a robot that meets the repeatability, payload and reach required (Table 2), and the stations (balance, mixer, characterizer).
3. **Layout.** It places the stations around the robot so that every transfer is reachable, the cell fits the floor area, and the cell can be serviced.
4. **Rehearsal.** It plans every transfer in the twin (IK and RRT-Connect, with clearance against device boxes) and reports the minimum clearance and cycle time.
5. **User edits.** The user drags products in and out or moves stations. Reach and collisions are re-checked after every move.
6. **Output:**
   - a bill of materials, with list prices, quote-only items and sources
   - the layout
   - a twin scene file
   - a short rationale that cites the review

## What runs today

| Piece | Where | State |
|---|---|---|
| UR3e/5e/10e/16e kinematics and meshes | `self_formulating_lab/sfl/arms.py` | Done |
| Cell layout that rescales to arm reach | `self_formulating_lab/sfl/cell.py` | Done (fixed four-station cell) |
| IK and RRT-Connect with clearance checking | `sfl/cell.py`, `sfl/rrt.py` | Done |
| Local LLM agent with tools: `select_arm`, `transfer`, `recommend_dispensing`, `recommend_arm`, `search_review` | `sfl/agent.py` (Ollama + LiteLLM; rule-based fallback) | Done |
| Browser twin | `web/index.html`; static version on this site | Done |
| Selection step from budget, materials and repeatability | Atlas page, "Plan a cell" | Preview (rule-based) |
| Layout optimizer | | Not started |
| Drag-and-drop editing | `builder/` (Lab Builder) | Done: library of 39 devices, live cart, overlap, reach and workstation checks, share links, CSV |
| Bill-of-materials export | `builder/` (CSV) | Done (list prices from the review) |
| Catalogue beyond UR arms in the twin (dispensers and robots from Tables 2–4) | | Not started (needs meshes) |

## Design rules

- **Cite or say so.** Every recommendation names the table and reference it comes from. Anything the review does not cover is labelled as the agent's inference.
- **Rehearse before showing.** No layout reaches the user until all its transfers have planned without collisions.
- **Quote-only is not free.** Items without a list price are listed separately and never counted as $0.
- **The person decides.** The agent drafts a cell, and the person approves purchases. This matches the "Draft" autonomy level in review Table 7.

## Hand-off

The output (equipment list, station poses, twin scene) is meant to be a starting point for a self-building lab such as a self-building lab planner. A self-building lab could then build the skills and workflows that run the cell.
