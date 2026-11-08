/* Benchloop catalogue: every part a scientist can put in a self-driving lab, with the vendor page we refer them to.
 * Benchloop sells nothing. The cart groups parts by vendor and links out, one vendor at a time.
 *
 * Fields
 *   id      stable id; equals the 3D-model id in new-design/catalog.js when `design` is true
 *   name, brand, cat, sub
 *   mat     material classes the part handles: liquid | paste | powder | object (used by filters)
 *   price   list price string as published (review Tables 2-4, 2026) or "Quote" / "Open source" / "See vendor"
 *   spec    headline accuracy / repeatability / scope
 *   url     the vendor or project page the cart refers to
 *   ref     reference numbers in the review (wiki/references/#ref-N)
 *   design  true if the part can be placed in the 3D design tool
 *   caps    capabilities it adds to a cell: liquids pastes powders weigh move mix characterize mount orchestrate simulate decide
 */

export const CATS = [
  { id: "liquid", name: "Liquid handling", blurb: "Pipettes, syringe and peristaltic pumps for low- to medium-viscosity liquids." },
  { id: "paste", name: "Paste & gel dispensing", blurb: "Pneumatic, syringe and auger extrusion for yield-stress materials." },
  { id: "powder", name: "Powder dosing", blurb: "Gravimetric heads, screw and vibratory feeders for granular solids." },
  { id: "arm", name: "Robot arms", blurb: "Cartesian, SCARA, 6-DOF, 7-DOF, delta and mobile manipulators." },
  { id: "motion", name: "Gantries & motion", blurb: "CNC gantries, tool-changers and linear tracks that carry tools and arms." },
  { id: "platform", name: "Integrated platforms", blurb: "Turnkey liquid handlers and formulation workstations." },
  { id: "station", name: "Mixers, balances & analysis", blurb: "Stations the premix cup visits: weigh, mix, characterize." },
  { id: "structure", name: "Workstations & mounting", blurb: "Tables, pedestals and enclosures the cell is built on (McMaster-Carr)." },
  { id: "orchestration", name: "Orchestration software", blurb: "Open-source systems that run devices as one workflow." },
  { id: "simulation", name: "Simulation & twins", blurb: "From discrete-event models to GPU physics for rehearsing a cell." },
  { id: "ai", name: "Decision & AI", blurb: "Optimizers and agent protocols that choose the next experiment." },
];

const T = (o) => ({ kind: "hardware", design: false, mat: [], caps: [], ...o });
const S = (o) => ({ kind: "software", price: "Open source", design: false, mat: [], caps: [], ...o });

export const PRODUCTS = [
  // ---------------------------------------------------------------- liquid handling (Table 3)
  T({ id: "rainin-e4", name: "E4 XLS+ electronic pipette", brand: "Rainin", cat: "liquid", sub: "Air-displacement pipette", mat: ["liquid"], price: "$191–350", spec: "±0.8% accuracy; ≤0.15% CV", url: "https://www.shoprainin.com/Products/Pipettes-and-Tips/Pipettes/Single-Channel-Electronic-Pipettes/E4-XLS/E4-Electronic-Pipette,-LTS-E4-1000XLS+/p/17014482", ref: "59", design: true, caps: ["liquids"] }),
  T({ id: "eppendorf-xplorer", name: "Xplorer electronic pipette", brand: "Eppendorf", cat: "liquid", sub: "Air-displacement pipette", mat: ["liquid"], price: "$1,300", spec: "~±0.6% accuracy", url: "https://www.eppendorf.com/us-en/Products/Liquid-Handling/All-Pipettes-Dispensers-Automated-Liquid-Handlers/Eppendorf-Xplorer-Eppendorf-Xplorer-plus-p-PF-191054", ref: "60", design: true, caps: ["liquids"] }),
  T({ id: "gilson-microman", name: "MICROMAN E M1000E", brand: "Gilson", cat: "liquid", sub: "Positive-displacement pipette", mat: ["liquid"], price: "$524–527", spec: "±3–8% accuracy; ≤0.5–4% imprecision", url: "https://www.gilson.com", ref: "61", caps: ["liquids"] }),
  T({ id: "hamilton-psd4", name: "PSD/4 syringe pump", brand: "Hamilton", cat: "liquid", sub: "Positive-displacement pump", mat: ["liquid"], price: "$400–500", spec: "±1% accuracy; ≤0.05% repeatability", url: "https://www.hamiltoncompany.com/knowledge-base/spec-sheet/psd-4-specification-sheet", ref: "62", design: true, caps: ["liquids"] }),
  T({ id: "qdos20", name: "Qdos 20 metering pump", brand: "Watson-Marlow", cat: "liquid", sub: "Peristaltic pump", mat: ["liquid"], price: "$4,248", spec: "±1% dosing accuracy; ±0.5% repeatability", url: "https://www.wmfts.com/en-us/brands/watson-marlow-peristaltic-pumps/cased-pumps/qdos-accurate-versatile-chemical-dosing-pumps/", ref: "63", design: true, caps: ["liquids"] }),
  T({ id: "lab-formulator-pen-assembly", name: "Formulator Pen (lab-built)", brand: "Acceleration Consortium", cat: "liquid", sub: "Lab-built dispenser · CNC tool", mat: ["liquid"], price: "Lab-built", spec: "Liquid-dispensing tool for the CNC dock; real CAD", url: "", ref: "", design: true, caps: ["liquids"], note: "Lab-made tool from the formulation cell. Not sold; build files on request." }),
  T({ id: "masterflex-ls", name: "Masterflex L/S Digital", brand: "Cole-Parmer / Avantor", cat: "liquid", sub: "Peristaltic pump", mat: ["liquid"], price: "$9,000", spec: "±0.1–0.25% speed-control accuracy", url: "https://www.fishersci.com/shop/products/masterflex-l-s-digital-precision-pump-systems-open-head-sensor-easy-load-head-4/11747346", ref: "64", caps: ["liquids"] }),

  // ---------------------------------------------------------------- paste & gel (Table 3)
  T({ id: "ecopen", name: "preeflow eco-PEN300", brand: "ViscoTec", cat: "paste", sub: "Auger (progressive cavity) extrusion", mat: ["paste", "liquid"], price: "Quote", spec: "±1% dosing accuracy; cP = 4.26", url: "https://www.preeflow.com/en/hoechste-praezision-als-standard/", ref: "68", design: true, caps: ["pastes", "liquids"] }),
  T({ id: "ultimus", name: "Ultimus V dispenser", brand: "Nordson EFD", cat: "paste", sub: "Air-pressure extrusion", mat: ["paste"], price: "~$6,750", spec: "Pneumatic time-pressure dosing", url: "https://www.nordson.com/en/products/efd-products/ultimus-v-dispensers", ref: "17", design: true, caps: ["pastes"] }),
  T({ id: "cellink-syringe", name: "Syringe Pump Printhead", brand: "CELLINK", cat: "paste", sub: "Syringe extrusion", mat: ["paste"], price: "$3,190", spec: "Volumetric syringe extrusion", url: "https://www.cellink.com/product/syringe-pump-printhead/", ref: "65", caps: ["pastes"] }),
  T({ id: "cellink-pneumatic", name: "BIO X Pneumatic Printhead", brand: "CELLINK", cat: "paste", sub: "Air-pressure extrusion", mat: ["paste"], price: "$2,500", spec: "±0.5 °C temperature precision", url: "https://www.cellink.com/product/bio-x-pneumatic-printhead/", ref: "67", caps: ["pastes"] }),
  T({ id: "allevi2", name: "Allevi 2", brand: "Allevi (3D Systems)", cat: "paste", sub: "Air-pressure extrusion", mat: ["paste"], price: "$15,000", spec: "5 µm XY / 1 µm Z motion precision", url: "https://www.allevi3d.com/allevi-2/", ref: "66", caps: ["pastes"] }),
  T({ id: "fisnar-pdv1000", name: "PDV-1000 auger valve", brand: "Fisnar", cat: "paste", sub: "Auger extrusion", mat: ["paste"], price: "Quote", spec: "Min. dot size 0.508 mm", url: "https://www.fisnar.com/products/dispensing-valves/positive-displacement-dispensing-valves/pdv1000-precision-positive-displacement-auger-valves/", ref: "69", caps: ["pastes"] }),

  // ---------------------------------------------------------------- powder (Table 3)
  T({ id: "quantos", name: "Quantos QB1/QB6", brand: "Mettler-Toledo", cat: "powder", sub: "Gravimetric dosing head", mat: ["powder"], price: "Quote", spec: "Balance readable to 0.001 mg", url: "https://www.mt.com/us/en/home/library/product-brochures/laboratory-weighing/06_Automated_Sample_Preparation/02_QB_Liquid_Powder_Dispensing/02_Data_Sheets/DS_QB_Powder_Dosing.html", ref: "72", design: true, caps: ["powders", "weigh"] }),
  T({ id: "mt12", name: "MT12 twin-screw micro-feeder", brand: "Coperion K-Tron", cat: "powder", sub: "Screw feeder", mat: ["powder"], price: "~$9,800", spec: "1:4,000,000 weighing resolution in 80 ms", url: "https://coperion.com/en/products-services/process-equipment/feeders/micro-screw-feeders", ref: "70", design: true, caps: ["powders"] }),
  T({ id: "swile", name: "SWILE / GDU-P powder dosing", brand: "Chemspeed", cat: "powder", sub: "Screw / gravimetric dosing", mat: ["powder"], price: "Quote", spec: "±10 µg resolution", url: "https://www.chemspeed.com/crystal-swile/", ref: "71", caps: ["powders"] }),
  T({ id: "vf1", name: "VF1 vibratory feeder", brand: "3P Innovation", cat: "powder", sub: "Vibratory feeder", mat: ["powder"], price: "Quote", spec: "±1 mg dose accuracy", url: "https://www.3pinnovation.com/pharma-equipment/discover-range/vibratory-feeder", ref: "73", design: true, caps: ["powders"] }),
  T({ id: "eriez-hivi", name: "Hi-Vi Volumatic feeder", brand: "Eriez", cat: "powder", sub: "Vibratory feeder", mat: ["powder"], price: "Quote", spec: "Volumetric vibratory feeding", url: "https://www.eriez.com/Products/Sample-Preparation/Vibratory-Feeders/Volumatic-Feeder-Machine", ref: "74", caps: ["powders"] }),
  T({ id: "powder-hapd", name: "HAPD powder dispenser (lab-built)", brand: "Acceleration Consortium", cat: "powder", sub: "Lab-built tool", mat: ["powder"], price: "Lab-built", spec: "Tool for the CNC dock of the formulation cell", url: "", ref: "", design: true, caps: ["powders"], note: "Not a commercial product. Shown so the reference cell is complete." }),

  // ---------------------------------------------------------------- robot arms (Table 2)
  T({ id: "drylin", name: "drylin XYZ gantry", brand: "igus", cat: "arm", sub: "Cartesian gantry", mat: ["object"], price: "$2,461", spec: "0.3–0.5 mm repeatability", url: "https://www.igus.com/automation/xyz-gantry", ref: "47", design: true, caps: ["move"] }),
  T({ id: "rs3", name: "RS3 SCARA", brand: "Epson", cat: "arm", sub: "SCARA", mat: ["object"], price: "~$10,000", spec: "±0.010 mm repeatability; 0.35 m reach", url: "https://www.epson.com", ref: "50", design: true, caps: ["move"] }),
  T({ id: "pf400", name: "PreciseFlex PF400", brand: "Brooks (Precise Automation)", cat: "arm", sub: "SCARA lab robot", mat: ["object"], price: "Quote", spec: "±0.09 mm repeatability; 0.59 m reach", url: "https://www.brooks.com", ref: "49", design: true, caps: ["move"] }),
  T({ id: "ur3e", name: "UR3e", brand: "Universal Robots", cat: "arm", sub: "6-DOF cobot", mat: ["object"], price: "~$30,000", spec: "±0.03 mm repeatability; 0.5 m reach", url: "https://www.universal-robots.com/products/ur3e/", ref: "51", design: true, caps: ["move"] }),
  T({ id: "ur5e", name: "UR5e", brand: "Universal Robots", cat: "arm", sub: "6-DOF cobot", mat: ["object"], price: "See vendor", spec: "0.85 m reach; 5 kg payload", url: "https://www.universal-robots.com/products/ur5e/", ref: "", design: true, caps: ["move"] }),
  T({ id: "ur10e", name: "UR10e", brand: "Universal Robots", cat: "arm", sub: "6-DOF cobot", mat: ["object"], price: "See vendor", spec: "1.3 m reach; 12.5 kg payload", url: "https://www.universal-robots.com/products/ur10e/", ref: "", design: true, caps: ["move"] }),
  T({ id: "ur16e", name: "UR16e", brand: "Universal Robots", cat: "arm", sub: "6-DOF cobot", mat: ["object"], price: "See vendor", spec: "0.9 m reach; 16 kg payload", url: "https://www.universal-robots.com/products/", ref: "", design: true, caps: ["move"] }),
  T({ id: "xarm6", name: "xArm 6", brand: "UFACTORY", cat: "arm", sub: "6-DOF arm", mat: ["object"], price: "$9,500", spec: "±0.1 mm repeatability; 0.7 m reach", url: "https://www.ufactory.us/product/ufactory-xarm-6", ref: "52", design: true, caps: ["move"] }),
  T({ id: "lite6", name: "Lite 6", brand: "UFACTORY", cat: "arm", sub: "6-DOF arm", mat: ["object"], price: "~$4,200", spec: "±0.5 mm repeatability; 0.44 m reach", url: "https://www.ufactory.cc/lite-6-collaborative-robot/", ref: "53", design: true, caps: ["move"] }),
  T({ id: "fr3", name: "Franka Research 3", brand: "Franka Robotics", cat: "arm", sub: "7-DOF cobot", mat: ["object"], price: "~$30,000", spec: "<±0.1 mm repeatability; 0.855 m reach", url: "https://franka.de/franka-research-3", ref: "54", design: true, caps: ["move"] }),
  T({ id: "gen3", name: "Gen3", brand: "Kinova", cat: "arm", sub: "7-DOF cobot", mat: ["object"], price: "~$35,000", spec: "~±0.1 mm repeatability; 0.902 m reach", url: "https://www.kinovarobotics.com/product/gen3-robots", ref: "55", design: true, caps: ["move"] }),
  T({ id: "kmr", name: "KMR iiwa", brand: "KUKA", cat: "arm", sub: "Mobile manipulator", mat: ["object"], price: "~$42,000 (reseller)", spec: "±0.1 mm arm; ~±5 mm base positioning", url: "https://www.kuka.com", ref: "3,58", design: true, caps: ["move"] }),
  T({ id: "mcm-9198n23", name: "Delta robot", brand: "McMaster-Carr", cat: "arm", sub: "Delta (parallel) robot", mat: ["object"], price: "See vendor", spec: "High-speed overhead pick-and-place · part 9198N23", url: "https://www.mcmaster.com/9198N23/", ref: "", design: true, caps: ["move"], mcm: "9198N23" }),

  // ---------------------------------------------------------------- gantries & motion
  T({ id: "cnc4040", name: "Genmitsu 4040-PRO CNC + tool dock", brand: "SainSmart", cat: "motion", sub: "Gantry + tool dock", mat: ["liquid", "paste", "powder"], price: "$599", spec: "±0.1 mm running accuracy", url: "https://www.sainsmart.com/products/4040-pro-max", ref: "46", design: true, caps: [] }),
  T({ id: "jubilee", name: "Jubilee tool-changer", brand: "Machine Agency (open hardware)", cat: "motion", sub: "Tool-changing gantry", mat: ["liquid", "paste", "powder"], price: "~$1,400", spec: "Open-source multi-tool motion platform", url: "https://github.com/machineagency/science-jubilee", ref: "48", design: true, caps: [] }),
  T({ id: "mcm-3813n14", name: "Electric slide for Universal Robots", brand: "McMaster-Carr", cat: "motion", sub: "Linear 7th axis", mat: ["object"], price: "See vendor", spec: "2.1 m track that carries a UR arm (7th axis) · part 3813N14", url: "https://www.mcmaster.com/3813N14/", ref: "", design: true, caps: ["mount"], mcm: "3813N14" }),

  // ---------------------------------------------------------------- integrated platforms (Table 4)
  T({ id: "ot2", name: "OT-2", brand: "Opentrons", cat: "platform", sub: "Liquid handler", mat: ["liquid"], price: "$15,950", spec: "±0.6% / 0.3% CV at 300 µL", url: "https://opentrons.com/products/ot-2-robot", ref: "15", design: true, caps: ["liquids"] }),
  T({ id: "flex", name: "Flex", brand: "Opentrons", cat: "platform", sub: "Liquid handler with gripper", mat: ["liquid", "object"], price: "$26,400", spec: "8-channel pipetting and labware gripper", url: "https://opentrons.com/products/flex", ref: "15", design: true, caps: ["liquids", "move"] }),
  T({ id: "star", name: "Microlab STAR", brand: "Hamilton", cat: "platform", sub: "Liquid handler", mat: ["liquid"], price: "€104,500", spec: "Trueness ≤0.75–1%; CV ≤1.5–2%", url: "https://www.hamiltoncompany.com", ref: "16", design: true, caps: ["liquids", "move"] }),
  T({ id: "epmotion", name: "epMotion 5075", brand: "Eppendorf", cat: "platform", sub: "Liquid handler", mat: ["liquid"], price: "~$8,000–20,000", spec: "±0.6–0.7% systematic error at full scale", url: "https://www.eppendorf.com", ref: "75", design: true, caps: ["liquids"] }),
  T({ id: "fluent", name: "Fluent 1080", brand: "Tecan", cat: "platform", sub: "Liquid handler", mat: ["liquid"], price: "$32,995–75,000", spec: "CV ≤0.5% at 100 µL (standard head)", url: "https://lifesciences.tecan.com/fluent-laboratory-automation-workstation", ref: "77", design: true, caps: ["liquids", "move"] }),
  T({ id: "biomek", name: "Biomek i7", brand: "Beckman Coulter", cat: "platform", sub: "Liquid handler", mat: ["liquid"], price: "$34,995–38,995", spec: "Dual-arm, 96/384-channel head", url: "https://www.beckman.com/liquid-handlers/biomek-i-series-automated-workstations/biomek-i7", ref: "78", design: true, caps: ["liquids", "move"] }),
  T({ id: "bravo", name: "Bravo", brand: "Agilent", cat: "platform", sub: "Liquid handler", mat: ["liquid"], price: "$37,995–63,195", spec: "±2.1% / 2.1% CV at 1.0 µL (96-ch)", url: "https://www.agilent.com/en/product/automated-liquid-handling/automated-liquid-handling-platforms/bravo-automated-liquid-handling-platform", ref: "79", design: true, caps: ["liquids"] }),
  T({ id: "echo", name: "Echo 525", brand: "Beckman Coulter", cat: "platform", sub: "Acoustic dispenser", mat: ["liquid"], price: "Quote", spec: "<10% accuracy; 25 nL–5 µL", url: "https://www.beckman.com/liquid-handlers/echo-acoustic/echo-525", ref: "80", design: true, caps: ["liquids"] }),
  T({ id: "idot", name: "I.DOT", brand: "Dispendix", cat: "platform", sub: "Drop-on-demand dispenser", mat: ["liquid"], price: "Quote", spec: "<5% CV for 100 nL–10 µL", url: "https://www.dispendix.com/idot-non-contact-liquid-handler", ref: "76", design: true, caps: ["liquids"] }),
  T({ id: "chemspeed", name: "Formulation workstation (SWILE / GDU-P)", brand: "Chemspeed", cat: "platform", sub: "Formulation workstation", mat: ["liquid", "powder", "paste"], price: "Quote", spec: "Gravimetric powder and liquid dosing", url: "https://www.chemspeed.com", ref: "71,152", design: true, caps: ["powders", "liquids"] }),

  // ---------------------------------------------------------------- stations
  T({ id: "balance", name: "Analytical balance", brand: "Mettler-Toledo (or equivalent)", cat: "station", sub: "Balance", mat: ["liquid", "paste", "powder"], price: "See vendor", spec: "Gravimetric check of every dose", url: "https://www.mt.com", ref: "", design: true, caps: ["weigh"] }),
  T({ id: "thinky", name: "Planetary centrifugal mixer", brand: "THINKY", cat: "station", sub: "Mixer", mat: ["paste", "powder", "liquid"], price: "See vendor", spec: "Non-contact mixing and degassing", url: "https://www.thinkymixer.com", ref: "", design: true, caps: ["mix"] }),
  T({ id: "vortex", name: "Vortex mixer", brand: "Scientific Industries (or equivalent)", cat: "station", sub: "Mixer", mat: ["liquid"], price: "See vendor", spec: "Benchtop vortexing of vials", url: "https://www.scientificindustries.com", ref: "", design: true, caps: ["mix"] }),
  T({ id: "characterizer", name: "Rotational rheometer", brand: "Anton Paar (or equivalent)", cat: "station", sub: "Characterization", mat: ["paste", "liquid"], price: "See vendor", spec: "Flow curves, yield stress", url: "https://www.anton-paar.com/us-en/products/group/rheometer/", ref: "", design: true, caps: ["characterize"] }),
  T({ id: "cup", name: "Premix cup", brand: "Generic labware", cat: "station", sub: "Labware", mat: ["liquid", "paste", "powder"], price: "See vendor", spec: "The container that visits every station", url: "", ref: "", design: true, caps: [] }),

  // ---------------------------------------------------------------- workstations & mounting (McMaster-Carr, CAD in /CAD)
  T({ id: "mcm-5204n11", name: "Robot workstation", brand: "McMaster-Carr", cat: "structure", sub: "Workstation table", mat: [], price: "See vendor", spec: "Rigid table for a cobot and its stations · part 5204N11", url: "https://www.mcmaster.com/5204N11/", design: true, caps: ["mount"], mcm: "5204N11" }),
  T({ id: "mcm-5206n15", name: "High-capacity robot workstation", brand: "McMaster-Carr", cat: "structure", sub: "Workstation table", mat: [], price: "See vendor", spec: "Heavy-duty table for larger arms · part 5206N15", url: "https://www.mcmaster.com/5206N15/", design: true, caps: ["mount"], mcm: "5206N15" }),
  T({ id: "mcm-9351n11", name: "T-slotted robot workstation", brand: "McMaster-Carr", cat: "structure", sub: "Workstation table", mat: [], price: "See vendor", spec: "Extrusion frame; bolt fixtures anywhere · part 9351N11", url: "https://www.mcmaster.com/9351N11/", design: true, caps: ["mount"], mcm: "9351N11" }),
  T({ id: "mcm-6333n16", name: "Robot pedestal", brand: "McMaster-Carr", cat: "structure", sub: "Pedestal", mat: [], price: "See vendor", spec: "0.61 m column that raises an arm to bench height · part 6333N16", url: "https://www.mcmaster.com/6333N16/", design: true, caps: ["mount"], mcm: "6333N16" }),
  T({ id: "mcm-6333n117", name: "Low robot riser", brand: "McMaster-Carr", cat: "structure", sub: "Pedestal", mat: [], price: "See vendor", spec: "0.18 m riser plate for a cobot base · part 6333N117", url: "https://www.mcmaster.com/6333N117/", design: true, caps: ["mount"], mcm: "6333N117" }),
  T({ id: "mcm-3814n21", name: "Telescoping robot pedestal", brand: "McMaster-Carr", cat: "structure", sub: "Pedestal", mat: [], price: "See vendor", spec: "Height-adjustable arm column, up to 1.66 m · part 3814N21", url: "https://www.mcmaster.com/3814N21/", design: true, caps: ["mount"], mcm: "3814N21" }),
  T({ id: "mcm-9198n17", name: "Safety enclosure for delta robot", brand: "McMaster-Carr", cat: "structure", sub: "Enclosure", mat: [], price: "See vendor", spec: "Guarded frame that carries a delta robot · part 9198N17", url: "https://www.mcmaster.com/9198N17/", design: true, caps: ["mount"], mcm: "9198N17" }),

  // ---------------------------------------------------------------- orchestration (review §7.2, Supplementary Table S1)
  S({ id: "madsci", name: "MADSci", brand: "Argonne (AD-SDL)", cat: "orchestration", sub: "Orchestration system", spec: "Tracks tool mounts, container locations and material quantities", url: "https://github.com/AD-SDL/MADSci", ref: "158", caps: ["orchestrate"] }),
  S({ id: "alabos", name: "AlabOS", brand: "Ceder Group", cat: "orchestration", sub: "Orchestration system", spec: "Reserves devices and sample positions across steps", url: "https://github.com/CederGroupHub/alabos", ref: "159", caps: ["orchestrate"] }),
  S({ id: "eos", name: "EOS", brand: "UNC Robotics", cat: "orchestration", sub: "Orchestration system", spec: "Built-in Bayesian optimization; dynamic allocation", url: "https://github.com/UNC-Robotics/eos", ref: "160", caps: ["orchestrate", "decide"] }),
  S({ id: "helao", name: "HELAO-async", brand: "Caltech / HTE", cat: "orchestration", sub: "Orchestration system", spec: "Result-dependent steps; email and webhook alerts", url: "https://github.com/High-Throughput-Experimentation/helao-async", ref: "161", caps: ["orchestrate"] }),
  S({ id: "ivoryos", name: "IvoryOS", brand: "Hein Lab", cat: "orchestration", sub: "Orchestration system", spec: "Web UI over Python devices; Ax and BayBE built in", url: "https://pypi.org/project/ivoryos/", ref: "162", caps: ["orchestrate", "decide"] }),
  S({ id: "unilabos", name: "UniLabOS", brand: "DP Technology", cat: "orchestration", sub: "Orchestration system", spec: "ROS 2 devices; material and stock-lot quantities", url: "https://github.com/deepmodeling/Uni-Lab-OS", ref: "163", caps: ["orchestrate"] }),
  S({ id: "nimo", name: "NIMO", brand: "NIMS", cat: "orchestration", sub: "Orchestration system", spec: "Closed-loop exploration with PHYSBO and other AI", url: "https://github.com/NIMS-DA/NIMO", ref: "164", caps: ["orchestrate", "decide"] }),
  S({ id: "ares", name: "ARES OS 2.0", brand: "Air Force Research Laboratory", cat: "orchestration", sub: "Orchestration system", spec: "gRPC API; SiLA 2 devices; campaign execution", url: "https://github.com/AFRL-ARES/ARES", ref: "165", caps: ["orchestrate"] }),
  S({ id: "pylabrobot", name: "PyLabRobot", brand: "Open source", cat: "orchestration", sub: "Hardware-agnostic driver", spec: "One Python API for Opentrons, Hamilton and Tecan", url: "https://github.com/PyLabRobot/pylabrobot", ref: "88", caps: ["orchestrate"] }),
  S({ id: "sila2", name: "SiLA 2", brand: "SiLA Consortium", cat: "orchestration", sub: "Device standard", price: "Open standard", spec: "Common command protocol for lab devices", url: "https://sila-standard.com", ref: "", caps: ["orchestrate"] }),

  // ---------------------------------------------------------------- simulation (Table 6)
  S({ id: "simpy", name: "SimPy", brand: "Open source", cat: "simulation", sub: "Level 1 · discrete-event", spec: "Throughput, scheduling, bottlenecks", url: "https://simpy.readthedocs.io", ref: "94", caps: ["simulate"] }),
  S({ id: "moveit2", name: "MoveIt 2 + RViz", brand: "PickNik / ROS", cat: "simulation", sub: "Level 2 · planning", spec: "Collision-free motion planning for ROS cells", url: "https://moveit.ai", ref: "97", caps: ["simulate"] }),
  T({ id: "robodk", name: "RoboDK", brand: "RoboDK", cat: "simulation", sub: "Level 2 · offline programming", kind: "software", price: "See vendor", spec: "Robot kinematics and native program code", url: "https://robodk.com", ref: "", caps: ["simulate"] }),
  S({ id: "gazebo", name: "Gazebo", brand: "Open Robotics", cat: "simulation", sub: "Level 3 · rigid-body", spec: "Mobile manipulators, multi-station cells", url: "https://gazebosim.org", ref: "", caps: ["simulate"] }),
  S({ id: "mujoco", name: "MuJoCo", brand: "Google DeepMind", cat: "simulation", sub: "Level 3 · contact dynamics", spec: "Grasping, insertion, learning-based control", url: "https://mujoco.org", ref: "", caps: ["simulate"] }),
  S({ id: "pybullet", name: "PyBullet", brand: "Open source", cat: "simulation", sub: "Level 3 · rigid-body", spec: "Scripted experiments, rapid prototyping", url: "https://pybullet.org", ref: "104", caps: ["simulate"] }),
  T({ id: "isaacsim", name: "Isaac Sim", brand: "NVIDIA", cat: "simulation", sub: "Level 3–4 · GPU physics", kind: "software", price: "Free", spec: "Particle fluids, deformables, ray-traced sensors", url: "https://developer.nvidia.com/isaac/sim", ref: "", caps: ["simulate"] }),
  S({ id: "isaaclab", name: "Isaac Lab", brand: "NVIDIA", cat: "simulation", sub: "Level 3 · parallel learning", spec: "Reinforcement and imitation learning of skills", url: "https://github.com/isaac-sim/IsaacLab", ref: "109", caps: ["simulate"] }),

  // ---------------------------------------------------------------- decision & AI (§8, Table 7)
  S({ id: "ax", name: "Ax / BoTorch", brand: "Meta (open source)", cat: "ai", sub: "Bayesian optimization", spec: "Adaptive experimentation over formulation space", url: "https://ax.dev", ref: "136", caps: ["decide"] }),
  S({ id: "baybe", name: "BayBE", brand: "Merck KGaA (open source)", cat: "ai", sub: "Bayesian optimization", spec: "Chemistry-aware encodings and transfer learning", url: "https://github.com/emdgroup/baybe", ref: "", caps: ["decide"] }),
  S({ id: "physbo", name: "PHYSBO", brand: "ISSP, U. Tokyo (open source)", cat: "ai", sub: "Bayesian optimization", spec: "Fast Bayesian optimization used by NIMO", url: "https://github.com/issp-center-dev/PHYSBO", ref: "", caps: ["decide"] }),
  S({ id: "mcp", name: "Model Context Protocol", brand: "Open standard", cat: "ai", sub: "Agent ↔ device protocol", price: "Open standard", spec: "Lets AI agents call lab tools with human checkpoints", url: "https://modelcontextprotocol.io", ref: "171", caps: ["decide"] }),
];

/* ---------------------------------------------------------------- helpers shared by every page */
export const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
PRODUCTS.forEach((p, i) => { p.sku = "BL-" + String(1001 + i); });

export function parsePrice(s) {
  const nums = [], cur = /€/.test(s) ? "€" : "$";
  for (const m of String(s).matchAll(/[$€]\s?([\d,]+)(?:\s*[–-]\s*\$?([\d,]+))?/g)) { nums.push(+m[1].replace(/,/g, "")); if (m[2]) nums.push(+m[2].replace(/,/g, "")); }
  return nums.length ? { lo: Math.min(...nums), hi: Math.max(...nums), cur } : null;
}
export function vendorOf(p) {
  if (!p.url) return null;
  try { return new URL(p.url).hostname.replace(/^www\./, ""); } catch { return null; }
}
