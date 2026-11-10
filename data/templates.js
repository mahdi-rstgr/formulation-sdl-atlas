/* Design templates: the cells a new design can start from. Shared by the home page, Solutions and the Lab Simulator.
 * items: [id, x, y, z, roll, pitch, yaw, dockSlot?] in metres / radians, z = height of the surface it stands on. */
export const TEMPLATES = {
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
