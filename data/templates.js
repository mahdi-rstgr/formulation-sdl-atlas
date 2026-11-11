/* Design templates: the cells a new design can start from. Shared by the home page, Solutions and the Lab Simulator.
 * items: [id, x, y, z, roll, pitch, yaw, dockSlot?] in metres / radians, z = height of the surface it stands on. */
export const TEMPLATES = {
  /* ---------------------------------------------------------------- fully automated self-driving labs, one per field.
     Items without coordinates are laid out by the Lab Simulator: the arm takes the centre, stations spiral around it, and the
     orchestrator, optimizer and agents stand in a row behind the cell. Every one runs closed-loop in the Run panel. */
  inorganic: {
    name: "Inorganic materials SDL", mat: ["powder", "object"], auto: true,
    blurb: "Solid-state synthesis end to end: powders are dosed and weighed, milled, pressed into pellets and fired in muffle and tube furnaces, then identified by powder XRD and XRF. AlabOS schedules the furnaces and the arm, a constrained Bayesian planner picks the next precursor mix and firing profile, and a campaign agent plans and recovers behind a human-approval gate.",
    w: 5, d: 4, budget: 600000, items: [["ur5e"], ["quantos"], ["balance"], ["cl-retsch-pm100"], ["cl-specac-atlasmanual"], ["cl-nabertherm-l9"], ["cl-carbolite-tf1-12-60-300"], ["cl-rigaku-miniflex600-external-cooling"], ["cl-shimadzu-edx7200"],
      ["alabos"], ["bo-planner"], ["agent-campaign"]],
  },
  sustainable: {
    name: "Sustainable organic synthesis", mat: ["liquid", "object"], auto: true,
    blurb: "Greener routes to organic molecules: continuous-flow, photochemical and electrochemical reactors replace stoichiometric reagents and batch heating. An OT-2 prepares stock solutions, a rotary evaporator recovers solvent, and HPLC and benchtop NMR measure yield and selectivity. A categorical Bayesian optimizer chooses solvent, catalyst and conditions; the campaign agent trades yield against waste, and a quantum-chemistry agent screens candidates first.",
    w: 5, d: 4, budget: 500000, items: [["ur3e"], ["cl-syrris-asiadiscovery"], ["cl-hepatochem-photoredoxbox"], ["cl-ika-electrasyn2"], ["ot2"], ["cl-ika-rv10-digital-v"], ["cl-agilent-hplc1260"], ["cl-magritek-spinsolve80"],
      ["orch-os"], ["bo-categorical"], ["agent-campaign"], ["agent-chemistry"]],
  },
  drug: {
    name: "Drug discovery chemistry", mat: ["liquid", "powder", "object"], auto: true,
    blurb: "Design–make–test for small molecules: an Opentrons Flex sets up reactions in a parallel station and a microwave reactor, an automated flash system purifies, and HPLC, high-resolution Orbitrap MS and benchtop NMR confirm identity and purity. MADSci runs the workflow, BayBE optimizes conditions across the library, a lab copilot explains every run to the chemist, and the campaign agent plans and handles faults.",
    w: 5, d: 4, budget: 900000, items: [["pf400"], ["flex"], ["cl-radleys-mya4"], ["cl-antonpaar-monowave400"], ["cl-biotage-selekt"], ["cl-agilent-hplc1260"], ["cl-thermo-orbitrapexploris"], ["cl-magritek-spinsolve80"], ["balance"],
      ["madsci"], ["baybe"], ["agent-copilot"], ["agent-campaign"]],
  },
  polymer: {
    name: "Polymer synthesis & testing", mat: ["liquid", "paste", "object"], auto: true,
    blurb: "From monomer recipe to measured material: an OT-2 doses monomers, initiators and chain-transfer agents into a high-pressure reactor and a parallel station; GPC/SEC gives molar mass and dispersity, DSC and TGA the glass transition and stability, a rheometer the melt viscosity, and spin-coated films the coating behaviour. EOS orchestrates, Ax runs multi-objective Bayesian optimization, and the campaign agent plans and recovers.",
    w: 5, d: 4, budget: 800000, items: [["ur5e"], ["ot2"], ["cl-parr-4591"], ["cl-radleys-mya4"], ["cl-agilent-1290infinity"], ["cl-ta-dsc2500"], ["cl-ta-tga5500"], ["cl-antonpaar-mcr503"], ["cl-ossila-spincoater"],
      ["eos"], ["ax"], ["agent-campaign"]],
  },
  formulation: {
    name: "Formulation SDL", mat: ["liquid", "paste", "powder", "object"], auto: true,
    blurb: "Liquids, pastes and powders into one premix: a CNC tool changer docks a paste pen, a powder dispenser and a liquid pen, a Quantos doses fine powders, a balance checks every dose, and a planetary mixer and rotor–stator disperser blend. A rheometer, DLS and a Turbiscan measure viscosity, particle size and stability. MADSci orchestrates, a constrained Bayesian planner proposes the next recipe, and the campaign agent plans and recovers.",
    w: 5, d: 4, budget: 450000, items: [["ur5e"], ["cnc4040"], ["ecopen", null, null, null, 0, 0, 0, "dock0"], ["powder-auger", null, null, null, 0, 0, 0, "dock1"], ["lab-formulator-pen-assembly", null, null, null, 0, 0, 0, "dock2"],
      ["quantos"], ["balance"], ["thinky"], ["cl-ika-t25"], ["cl-antonpaar-mcr503"], ["cl-antonpaar-litesizerdls"], ["cl-microtrac-turbiscanlab"],
      ["madsci"], ["bo-planner"], ["agent-campaign"]],
  },
  biocompat: {
    name: "Biocompatibility screening", mat: ["liquid", "object"], auto: true,
    blurb: "In-vitro biocompatibility (cytotoxicity, in the spirit of ISO 10993-5) without manual plate work: cells are seeded in a biosafety cabinet, exposed to material extracts by an Opentrons Flex, incubated, washed and read for viability on a multi-mode plate reader, with qPCR for gene expression. UniLabOS schedules plates between incubator, centrifuge and readers, BayBE chooses the next extract concentrations, and a lab copilot reports to the scientist.",
    w: 5, d: 4, budget: 700000, items: [["pf400"], ["flex"], ["cl-esco-ac24s8"], ["cl-eppendorf-cellxpertc170i"], ["cl-biotek-405ts"], ["cl-bmg-clariostarplus"], ["cl-eppendorf-5910ri"], ["cl-biorad-cfxopus"],
      ["unilabos"], ["baybe"], ["agent-copilot"]],
  },

  sfl: {
    name: "Self-Formulating Lab cell", mat: ["liquid", "paste", "powder", "object"],
    blurb: "The review's reference cell: a CNC gantry docks a paste pen and a powder dispenser, a UR5e carries the premix cup to the mixer and the rheometer.",
    w: 3, d: 2, items: [["cnc4040", .6, .3, 0, 0, 0, 0], ["ecopen", 0, 0, 0, 0, 0, 0, "dock0"], ["powder-auger", 0, 0, 0, 0, 0, 0, "dock1"], ["lab-formulator-pen-assembly", 0, 0, 0, 0, 0, 0, "dock2"], ["balance", .55, -.55, 0, 0, 0, 0], ["ur5e", -.1, -.15, 0, 0, 0, 0], ["thinky", -.75, .3, 0, 0, 0, 0], ["characterizer", -.8, -.55, 0, 0, 0, 0], ["cup", .55, -.55, 0, 0, 0, 0]],
  },
  loop: {
    name: "Closed-loop cell", mat: ["liquid", "paste", "powder", "object"],
    blurb: "The Self-Formulating Lab cell run as a self-driving lab: MADSci orchestrates it, a constrained Bayesian planner chooses each next experiment, and a campaign agent plans the campaign behind a human-approval gate.",
    w: 3, d: 2, items: [["cnc4040", .6, .3, 0, 0, 0, 0], ["ecopen", 0, 0, 0, 0, 0, 0, "dock0"], ["powder-auger", 0, 0, 0, 0, 0, 0, "dock1"], ["lab-formulator-pen-assembly", 0, 0, 0, 0, 0, 0, "dock2"], ["balance", .55, -.55, 0, 0, 0, 0], ["ur5e", -.1, -.15, 0, 0, 0, 0], ["thinky", -.75, .3, 0, 0, 0, 0], ["characterizer", -.8, -.55, 0, 0, 0, 0], ["cup", .55, -.55, 0, 0, 0, 0],
      ["madsci", -.6, 1.55, 0, 0, 0, 0], ["bo-planner", .15, 1.55, 0, 0, 0, 0], ["agent-campaign", .9, 1.55, 0, 0, 0, 0]],
  },
  liquid: {
    name: "Liquid-handling bench", mat: ["liquid", "object"],
    blurb: "An Opentrons Flex prepares stocks; a UR5e moves vials to a balance, a vortexer and a characterizer. A syringe pump adds viscous liquids.",
    w: 3.5, d: 2, items: [["flex", -.95, .35, 0, 0, 0, 0], ["ur5e", .1, 0, 0, 0, 0, 0], ["balance", .75, -.45, 0, 0, 0, 0], ["vortex", .7, .45, 0, 0, 0, 0], ["characterizer", 1.25, .1, 0, 0, 0, 0], ["hamilton-psd4", -.3, -.7, 0, 0, 0, 0]],
  },
  powder: {
    name: "Powder & paste station", mat: ["powder", "paste", "object"],
    blurb: "Gravimetric Quantos and a twin-screw feeder dose solids, an Ultimus extrudes pastes, and a low-cost Lite 6 tends the mixer.",
    w: 3, d: 2, items: [["quantos", -.85, .45, 0, 0, 0, 0], ["mt12", -.9, -.45, 0, 0, 0, 0], ["ultimus", .85, .45, 0, 0, 0, 0], ["lite6", 0, 0, 0, 0, 0, 0], ["thinky", .85, -.45, 0, 0, 0, 0], ["characterizer", .1, .7, 0, 0, 0, 0]],
  },
  mounted: {
    name: "Cobots on McMaster structure", mat: ["object", "liquid"],
    blurb: "Real McMaster-Carr CAD: a UR5e on a high-capacity workstation with its stations, a UR3e on a pedestal, and a UR10e riding an electric slide.",
    w: 4, d: 3, items: [["mcm-5206n15", -1, .2, 0, 0, 0, 0], ["ur5e", -1, -.05, .793, 0, 0, 0], ["balance", -1.25, .5, .793, 0, 0, 0], ["vortex", -.72, .5, .793, 0, 0, 0], ["mcm-6333n16", .35, .2, 0, 0, 0, 0], ["ur3e", .35, .2, .61, 0, 0, 0], ["mcm-3813n14", 1.55, 0, 0, 0, 0, 0], ["ur10e", 1.55, -.3, .108, 0, 0, 0], ["ot2", .5, -.95, 0, 0, 0, 0]],
  },
  platforms: {
    name: "Platform hall", mat: ["liquid", "powder", "object"],
    blurb: "Turnkey platforms side by side: Hamilton STAR, Tecan Fluent, Chemspeed, Agilent Bravo and Echo, served by a KUKA mobile manipulator.",
    w: 6, d: 3, items: [["star", -1.7, .7, 0, 0, 0, 0], ["fluent", 1.4, .8, 0, 0, 0, 0], ["kmr", 0, -.4, 0, 0, 0, 0], ["chemspeed", -1.6, -.85, 0, 0, 0, 0], ["bravo", 1.0, -.9, 0, 0, 0, 0], ["echo", 2.2, -.9, 0, 0, 0, 0]],
  },
  empty: { name: "Blank workstation", mat: [], blurb: "A 3 × 2 m floor and the whole parts library.", w: 3, d: 2, items: [] },
};
