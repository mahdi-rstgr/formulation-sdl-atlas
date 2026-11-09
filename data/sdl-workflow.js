/* The self-driving laboratory, stage by stage: the scientific content behind the home page's workflow section.
 * Sequence and wording follow the review "Self-Driving Laboratories for Formulation" (manuscript V3):
 * §2 material handling, §3 object handling, §4 commercial solutions, §5 customization, §6 simulation and digital
 * twins, §7 architecture and orchestration, §8 data, machine learning and AI agents, §9 outlook. Physical safety
 * follows the wiki's safety page; the digital safeguards follow §6, §7 and §8.3.
 *
 * Fields
 *   id, band     band: physical | digital | intelligence | safety
 *   title, sub   stepper label and one-line summary
 *   text         what happens at this stage (kept short; the 3D view carries the rest)
 *   ref          review section(s) and reference numbers
 *   show         scene actors that appear at this stage (they stay, dimmed, afterwards)
 *   focus        actors highlighted and framed by the camera
 *   links        connections drawn and animated: [from, to, kind]  kind: data | command | model | gate
 *   flows        short "what connects to what" statements shown under the text
 *   parts        catalogue ids listed under "In the library"
 */
export const BANDS = {
  physical: { name: "Physical cell", blurb: "Hardware that doses, moves, mixes and measures" },
  digital: { name: "Digital infrastructure", blurb: "Twin, orchestration and data" },
  intelligence: { name: "Intelligence", blurb: "Models and agents that decide" },
  safety: { name: "Safety", blurb: "Built into every layer" },
};

export const STAGES = [
  // ---------------------------------------------------------------- physical cell
  { id: "assemble", band: "physical", title: "Assemble the workstation", sub: "Frame, deck and benches",
    text: "A self-driving cell starts as structure: a T-slot frame and fixture-plate deck that every instrument bolts to, so stations can move without redrilling. Benches beside it carry the liquid handler and the characterization line.",
    ref: "§3–4", show: ["frame", "benchL", "benchR"], focus: ["frame", "benchL", "benchR"], links: [],
    flows: ["Structure fixes every station's position, which the twin and the planner rely on."],
    parts: ["lab-formulator", "mcm-9351n11", "mcm-5206n15", "mcm-6333n16"] },
  { id: "dose", band: "physical", title: "Dose liquids, pastes and powders", sub: "Dispensers chosen by rheology",
    text: "Each ingredient is dosed by the mechanism its rheology allows: a gantry changes between a paste pen, a powder dispenser and a liquid pen; an OT-2 prepares liquid stocks; peristaltic and reciprocating pumps move liquids too viscous to pipette.",
    ref: "§2, §4.1 · Table 1, Table 3", show: ["gantry", "dispensers", "ot2", "pumpP", "pumpR"], focus: ["gantry", "dispensers", "ot2", "pumpP", "pumpR"], links: [],
    flows: ["Viscosity, yield stress and powder flowability set the dispenser (Table 1)."],
    parts: ["ecopen", "powder-hapd", "lab-formulator-pen-assembly", "ot2", "reciprocating-pump", "peristaltic-pump"] },
  { id: "move", band: "physical", title: "Move samples between stations", sub: "Overhead arm on a linear rail",
    text: "An inverted UR3 on a linear rail carries the premix cup from the dispensers to the balances, the mixer and the characterization line, leaving the deck free for instruments.",
    ref: "§3 · Table 2, Fig. 4", show: ["arm"], focus: ["arm"], links: [],
    flows: ["Reach and repeatability, not formulation, decide the arm class."],
    parts: ["ur3e", "ur5e", "mcm-3813n14", "pf400"] },
  { id: "process", band: "physical", title: "Weigh and mix", sub: "Balances and a planetary mixer",
    text: "Two analytical balances check every dose by mass, and a planetary centrifugal mixer blends and degasses the premix in its own cup.",
    ref: "§2, §8.1", show: ["balance", "mixer"], focus: ["balance", "mixer"], links: [],
    flows: ["Every dose is verified by weight, not assumed from volume."],
    parts: ["balance", "thinky", "quantos", "vortex"] },
  { id: "characterize", band: "physical", title: "Characterize the product", sub: "Viscometers and flow sensing",
    text: "A gantry-mounted viscometer, carried by a compact 3030 gantry, measures each premix in its cup, and a flow sensor follows liquids as they move through the line, without taking a sample.",
    ref: "§2, §5, §8.1", show: ["cnc3030", "visco", "flow"], focus: ["cnc3030", "visco", "flow"], links: [],
    flows: ["Property data (viscosity, flow) are what the planner learns from."],
    parts: ["lab-cnc-viscometer", "sensirion-slf3s", "cnc3030", "characterizer"] },
  { id: "sense", band: "physical", title: "Sense while it runs", sub: "Process signals, in seconds",
    text: "Sense–act loops close on the instruments themselves: balance readings, extrusion pressure, mixing torque, flow and images are read while the step runs, so dispensing is corrected rather than assumed.",
    ref: "§2 (Fig. 3), §8.1", show: ["sensors"], focus: ["sensors", "balance", "visco", "flow"], links: [],
    flows: ["Process data must be acted on within seconds; property data feed the planner between experiments."],
    parts: ["balance", "sensirion-slf3s", "lab-cnc-viscometer"] },

  // ---------------------------------------------------------------- digital infrastructure
  { id: "twin", band: "digital", title: "Rehearse in a digital twin", sub: "The cell, simulated",
    text: "A digital twin mirrors the cell. Each planned motion and workflow runs first in simulation, at the fidelity it needs, from workflow timing and kinematics to contact dynamics and material physics, and only verified plans are released to the hardware.",
    ref: "§6 · Fig. 6–7, Table 6", show: ["twin"], focus: ["twin", "frame"], links: [["twin", "frame", "gate"]],
    flows: ["The twin shares the cell's geometry and rehearses every action before release."],
    parts: ["moveit2", "mujoco", "isaacsim", "simpy", "ac-self-building-labs"] },
  { id: "orchestrate", band: "digital", title: "Orchestrate devices as one", sub: "L1 devices · L2 integration · L3 workflow",
    text: "Orchestration software registers every device, issues operations in order, tracks tools, containers and remaining material, and branches on results. Devices talk to it through standard interfaces such as SiLA 2, REST, ROS 2 or MCP.",
    ref: "§7 · Fig. 8, Supplementary Table S1", show: ["controller"], focus: ["controller"],
    links: [["controller", "gantry", "command"], ["controller", "arm", "command"], ["controller", "ot2", "command"], ["controller", "benchR", "command"], ["controller", "twin", "command"]],
    flows: ["Commands go down to devices; status, results and errors come back."],
    parts: ["madsci", "alabos", "eos", "unilabos", "pylabrobot", "sila2"] },
  { id: "data", band: "digital", title: "Collect and store the data", sub: "FAIR records in a data centre",
    text: "Every experiment produces scalars and labels, time series, spectra and flow curves, images and metadata on lots, settings and trajectories. They are collected, checked and stored as FAIR records so that each experiment can be reused, not only its headline result.",
    ref: "§8.1 · Fig. 9", show: ["datacenter"], focus: ["datacenter", "controller"],
    links: [["balance", "controller", "data"], ["visco", "controller", "data"], ["flow", "controller", "data"], ["mixer", "controller", "data"], ["controller", "datacenter", "data"]],
    flows: ["Instruments → acquisition → orchestration → data centre, with provenance."],
    parts: ["madsci", "ac-chemos2"] },

  // ---------------------------------------------------------------- intelligence
  { id: "model", band: "intelligence", title: "Learn and choose the next experiment", sub: "Surrogate models and Bayesian optimization",
    text: "A surrogate model maps composition and process to measured properties. An acquisition function uses its predictions and their uncertainty to rank candidates, and Bayesian optimization picks the next formulation to make in as few experiments as possible.",
    ref: "§8.2 · Fig. 9", show: ["ml"], focus: ["ml", "datacenter"], links: [["datacenter", "ml", "data"], ["ml", "controller", "model"]],
    flows: ["Data train the model; the model proposes the next experiment."],
    parts: ["ax", "baybe", "ac-atlas", "ac-gryffin", "ac-chimera"] },
  { id: "agents", band: "intelligence", title: "AI agents plan and assist", sub: "Campaigns, copilots, recovery",
    text: "Agents built on large language models draft campaigns from a scientist's goal, explain what the cell is doing, rank recovery options after a fault and draft reports. They act only through tools the orchestration software exposes, with a person approving every campaign.",
    ref: "§8.3 · Table 7", show: ["agents"], focus: ["agents", "controller"], links: [["agents", "controller", "gate"], ["datacenter", "agents", "data"]],
    flows: ["Agents propose; people and deterministic checks decide."],
    parts: ["ac-optima", "ac-organa", "ac-el-agente", "mcp"] },
  { id: "loop", band: "intelligence", title: "Close the loop", sub: "Design → make → measure → learn",
    text: "Together the layers form one loop: a proposed experiment is rehearsed in the twin, run on the cell, measured, stored and learned from, and the next proposal follows. The bottleneck returns to where it belongs: the formulations worth making.",
    ref: "§9 · Fig. 9", show: [], focus: ["frame", "twin", "controller", "datacenter", "ml", "agents"], loop: true,
    links: [["ml", "controller", "model"], ["controller", "twin", "command"], ["twin", "frame", "gate"], ["balance", "controller", "data"], ["controller", "datacenter", "data"], ["datacenter", "ml", "data"], ["agents", "controller", "gate"]],
    flows: ["One pulse travels the whole loop."],
    parts: ["lab-formulator", "ac-atlas", "madsci", "ac-optima"] },

  // ---------------------------------------------------------------- safety, across every layer
  { id: "safety", band: "safety", title: "Safety in every layer", sub: "Physical guards and digital gates",
    text: "Safety is designed in, not added at the end. Physically: an interlocked enclosure and light curtain, a hard-wired emergency stop, a force- and speed-limited cobot, and spill containment under the pumps. Digitally: the twin verifies every plan before release, orchestration pauses, retries and alerts people, and agents receive no tool that can command devices or change safety settings.",
    ref: "§6, §7 (Table S1), §8.3 · wiki: Safety", show: ["safety"], focus: ["safety", "frame", "twin", "controller", "agents"], safetyAll: true,
    links: [["twin", "frame", "gate"], ["agents", "controller", "gate"], ["controller", "gantry", "command"]],
    flows: ["Physical: enclosure, interlocks, e-stop, force limits, containment.", "Digital: twin verification, orchestration checks, human checkpoints, safety by construction."],
    parts: ["mcm-9198n17", "ur3e", "madsci", "moveit2"] },
];

/* Where each safety mechanism shows in the scene (shown on the safety stage, or anytime with the safety toggle). */
export const SAFETY = [
  { at: "frame", kind: "physical", label: "Interlocked enclosure and light curtain" },
  { at: "estop", kind: "physical", label: "Hard-wired emergency stop" },
  { at: "arm", kind: "physical", label: "Force- and speed-limited cobot" },
  { at: "benchR", kind: "physical", label: "Spill containment under the pumps" },
  { at: "twin", kind: "digital", label: "Twin verifies every plan before release" },
  { at: "controller", kind: "digital", label: "Pause, retry and alert people" },
  { at: "agents", kind: "digital", label: "Human checkpoint; no device tools for agents" },
];
