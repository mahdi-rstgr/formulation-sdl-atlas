/* Device catalogue and 3D models for the Lab Builder.
 * Prices, accuracy and references are looked up at runtime in data/review.json (Tables 2–4) via `src`.
 * Models: "mesh:<id>" = real mesh (data/models/<id>.json); "arm:<id>" = articulated real arm (data/models/<id>_arm.json);
 * any other key = a procedural model built here from primitives at an approximate footprint `dims` [w, d, h] (m).
 * Every model returns a THREE.Group whose userData.tick(t, dt) animates it while the workstation is running.
 */
import * as THREE from "three";

export const CATEGORIES = [
  { id: "handler", name: "Material handlers", color: "var(--liquid)" },
  { id: "motion", name: "Motion providers", color: "var(--semi)" },
  { id: "arm", name: "Robot arms", color: "var(--object)" },
  { id: "mixer", name: "Mixers", color: "var(--powder)" },
  { id: "station", name: "Balances & stations", color: "var(--ink-3)" },
  { id: "platform", name: "Integrated platforms", color: "var(--accent)" },
  { id: "structure", name: "Workstations & mounting", color: "#c9a45c" },
];

/* capability each device provides (used by the cell intelligence panel) */
export const CAPS = {
  liquids: "Dose liquids", pastes: "Dose pastes & gels", powders: "Dose powders", weigh: "Weigh",
  move: "Move containers", mix: "Mix", characterize: "Characterize",
};

export const ITEMS = [
  // material handlers
  { id: "rainin-e4", cat: "handler", sub: "Liquid dispensers", name: "Rainin E4 XLS+", model: "pipette", dims: [0.12, 0.12, 0.32], src: ["table_3", "E4 XLS+"], tool: true, caps: ["liquids"], color: "#2C6FD1" },
  { id: "eppendorf-xplorer", cat: "handler", sub: "Liquid dispensers", name: "Eppendorf Xplorer", model: "pipette", dims: [0.12, 0.12, 0.33], src: ["table_3", "Xplorer"], tool: true, caps: ["liquids"], color: "#1F8A70" },
  { id: "hamilton-psd4", cat: "handler", sub: "Liquid dispensers", name: "Hamilton PSD/4 syringe pump", model: "syringePump", dims: [0.08, 0.14, 0.26], src: ["table_3", "PSD/4"], caps: ["liquids"], color: "#0F5FA8" },
  { id: "qdos20", cat: "handler", sub: "Liquid dispensers", name: "Watson-Marlow Qdos 20", model: "peristaltic", dims: [0.2, 0.18, 0.24], src: ["table_3", "Qdos 20"], caps: ["liquids"], color: "#C8102E" },
  { id: "ecopen", cat: "handler", sub: "Paste & gel dispensers", name: "ViscoTec eco-PEN300 (formulator pen)", model: "mesh:ecopen", src: ["table_3", "eco-PEN300"], tool: true, caps: ["pastes", "liquids"], note: "Real mesh from the formulation-cell twin." },
  { id: "ultimus", cat: "handler", sub: "Paste & gel dispensers", name: "Nordson EFD Ultimus V", model: "pneumatic", dims: [0.3, 0.26, 0.32], src: ["table_3", "Ultimus V"], caps: ["pastes"], color: "#0067B1" },
  { id: "powder-hapd", cat: "handler", sub: "Powder dispensers", name: "HAPD powder dispenser (Acceleration Consortium)", model: "mesh:powder", price: "Lab-built", tool: true, caps: ["powders"], note: "Lab-built by the Acceleration Consortium for its formulation cell." },
  { id: "quantos", cat: "handler", sub: "Powder dispensers", name: "Mettler-Toledo Quantos", model: "quantos", dims: [0.33, 0.46, 0.64], src: ["table_3", "Quantos"], caps: ["powders", "weigh"], color: "#2F6FD6" },
  { id: "mt12", cat: "handler", sub: "Powder dispensers", name: "Coperion K-Tron MT12 micro-feeder", model: "screwFeeder", dims: [0.46, 0.26, 0.52], src: ["table_3", "MT12"], caps: ["powders"], color: "#7A5BB5" },
  { id: "vf1", cat: "handler", sub: "Powder dispensers", name: "3P Innovation VF1 vibratory feeder", model: "vibratory", dims: [0.32, 0.2, 0.36], src: ["table_3", "VF1"], caps: ["powders"], color: "#7A5BB5" },
  { id: "lab-formulator-pen-assembly", cat: "handler", sub: "Liquid dispensers", name: "Formulator Pen (Acceleration Consortium)", model: "mesh:lab-formulator-pen-assembly", price: "Lab-built", tool: true, caps: ["liquids"], note: "Lab-built by the Acceleration Consortium; real CAD. Drop it near a CNC dock slot." },
  { id: "peristaltic-pump", cat: "handler", sub: "Liquid dispensers", name: "Peristaltic pump (cell module)", model: "mesh:peristaltic-pump", price: "See vendor", caps: ["liquids"], note: "Real CAD from the Acceleration Consortium's cell." },
  { id: "reciprocating-pump", cat: "handler", sub: "Liquid dispensers", name: "Reciprocating pump (cell module)", model: "mesh:reciprocating-pump", price: "See vendor", caps: ["liquids"], note: "Real CAD: piston pump for viscous liquids." },
  // motion providers
  { id: "cnc4040", cat: "motion", sub: "Gantry + tool dock", name: "Genmitsu 4040-PRO CNC + tool dock", model: "mesh:cnc", dock: true, src: ["table_2", "4040-PRO"], note: "Real mesh from the formulation-cell twin with a three-slot tool dock in front. Drop a pen, powder dispenser or pipette near a slot to dock it." },
  { id: "cnc3030", cat: "motion", sub: "Gantry", name: "Genmitsu 3030 CNC gantry", model: "mesh:cnc3030", price: "See vendor", note: "Real CAD: a compact three-axis gantry." },
  { id: "jubilee", cat: "motion", sub: "Tool-changer", name: "Jubilee tool-changer", model: "jubilee", dims: [0.56, 0.56, 0.62], src: ["table_2", "Jubilee"], color: "#C27A1E" },
  // robot arms: the review's five classes
  { id: "drylin", cat: "arm", sub: "Cartesian gantry", name: "igus drylin XYZ gantry", model: "cartesian", dims: [0.9, 0.7, 0.62], src: ["table_2", "drylin"], caps: ["move"], color: "#F5A623" },
  { id: "rs3", cat: "arm", sub: "SCARA", name: "Epson RS3 SCARA", model: "scara", dims: [0.26, 0.26, 0.48], src: ["table_2", "RS3"], reach: 0.35, caps: ["move"], color: "#F2F3F4" },
  { id: "pf400", cat: "arm", sub: "SCARA", name: "PreciseFlex PF400", model: "pf400", dims: [0.26, 0.26, 0.78], src: ["table_2", "PF400"], reach: 0.59, caps: ["move"], color: "#E6E8EB" },
  { id: "ur3e", cat: "arm", sub: "6-DOF articulated", name: "Universal Robots UR3e", model: "arm:ur3e", src: ["table_2", "UR3e"], reach: 0.5, caps: ["move"], note: "Real UR e-Series mesh (BSD-3), replaying an RRT-Connect transfer planned in the SFL twin." },
  { id: "ur5e", cat: "arm", sub: "6-DOF articulated", name: "Universal Robots UR5e", model: "arm:ur5e", price: "Not in review", reach: 0.85, caps: ["move"], note: "Real UR e-Series mesh (BSD-3), replaying planned transfers. Price not listed in the review." },
  { id: "ur10e", cat: "arm", sub: "6-DOF articulated", name: "Universal Robots UR10e", model: "arm:ur10e", price: "Not in review", reach: 1.3, caps: ["move"], note: "Real UR e-Series mesh (BSD-3). Price not listed in the review." },
  { id: "ur16e", cat: "arm", sub: "6-DOF articulated", name: "Universal Robots UR16e", model: "arm:ur16e", price: "Not in review", reach: 0.9, caps: ["move"], note: "Real UR e-Series mesh (BSD-3). Price not listed in the review." },
  { id: "xarm6", cat: "arm", sub: "6-DOF articulated", name: "UFACTORY xArm 6", model: "arm6", dims: [0.2, 0.2, 0.75], src: ["table_2", "xArm 6"], reach: 0.7, caps: ["move"], color: "#EDEFF1" },
  { id: "lite6", cat: "arm", sub: "6-DOF articulated", name: "UFACTORY Lite 6", model: "arm:lite6", src: ["table_2", "Lite 6"], reach: 0.44, caps: ["move"], note: "Real UFACTORY Lite 6 mesh (BSD-3)." },
  { id: "fr3", cat: "arm", sub: "7-DOF collaborative", name: "Franka Research 3", model: "arm7", dims: [0.25, 0.25, 0.95], src: ["table_2", "Franka Research 3"], reach: 0.855, caps: ["move"], color: "#F4F4F4" },
  { id: "gen3", cat: "arm", sub: "7-DOF collaborative", name: "Kinova Gen3", model: "arm7", dims: [0.2, 0.2, 0.95], src: ["table_2", "Gen3"], reach: 0.902, caps: ["move"], color: "#4A4F57" },
  { id: "mcm-9198n23", cat: "arm", sub: "Delta robot", name: "McMaster-Carr delta robot (9198N23)", model: "mesh:mcm-9198n23", price: "See vendor", reach: 0.5, caps: ["move"], overhead: true, note: "Real McMaster-Carr CAD. Mount it in the 9198N17 safety enclosure: drop it onto the enclosure and it sits on top." },
  { id: "kmr", cat: "arm", sub: "Mobile manipulator", name: "KUKA KMR iiwa", model: "mobile", dims: [1.08, 0.63, 1.4], src: ["table_2", "KMR iiwa"], reach: 0.82, caps: ["move"], color: "#F28C28" },
  // mixers
  { id: "thinky", cat: "mixer", sub: "Planetary", name: "Planetary centrifugal mixer", model: "mesh:mixer", price: "Not in review", caps: ["mix"], note: "Real mesh of the formulation cell's planetary mixer." },
  { id: "vortex", cat: "mixer", sub: "Vortex", name: "Vortex mixer (generic)", model: "vortex", dims: [0.13, 0.16, 0.17], price: "Not in review", caps: ["mix"], color: "#3B4048" },
  // stations
  { id: "lab-cnc-viscometer", cat: "station", sub: "Characterization", name: "Gantry viscometer (Acceleration Consortium)", model: "mesh:lab-cnc-viscometer", price: "Lab-built", caps: ["characterize"], note: "Real CAD: a viscometer carried by a gantry to each cup." },
  { id: "sensirion-slf3s", cat: "station", sub: "Sensors", name: "Sensirion SLF3S-1300F flow sensor", model: "mesh:sensirion-slf3s", price: "See vendor", caps: ["characterize"], note: "Real CAD: liquid flow sensor." },
  { id: "balance", cat: "station", sub: "Balance", name: "Analytical balance", model: "mesh:balance", price: "Not in review", caps: ["weigh"], note: "Real mesh from the formulation-cell twin." },
  { id: "characterizer", cat: "station", sub: "Characterization", name: "Characterizer (rheometer-type)", model: "characterizer", dims: [0.34, 0.3, 0.46], price: "Not in review", caps: ["characterize"], color: "#2F6FD6" },
  { id: "cup", cat: "station", sub: "Labware", name: "Premix cup", model: "mesh:cup", price: "Not in review", stack: true, note: "Drop it on a balance, mixer or characterizer and it rests on top." },
  // integrated platforms (approximate footprints)
  { id: "ot2", cat: "platform", sub: "Liquid handling", name: "Opentrons OT-2", model: "mesh:ot2", src: ["table_4", "Opentrons"], priceIndex: 0, caps: ["liquids"], note: "Real CAD: Opentrons' OT-2 reference model." },
  { id: "lab-formulator", cat: "platform", sub: "Formulation cell", name: "The Formulator (Acceleration Consortium)", model: "mesh:lab-formulator", price: "Lab-built", caps: ["liquids", "pastes", "powders", "weigh", "move", "mix"], note: "The Acceleration Consortium's self-driving formulation cell as one unit, from its CAD: T-slot frame, overhead UR3, gantry tool changer, dispensers, balances and THINKY mixer." },
  { id: "flex", cat: "platform", sub: "Liquid handling", name: "Opentrons Flex", model: "liquidHandler", dims: [0.87, 0.69, 0.84], style: { body: 0xeef0f2, frame: 0x1d2126, accent: 0x5b6ee1, cols: 3, rows: 4, ch: 8, screen: true, gripper: true, module: true }, src: ["table_4", "Opentrons"], priceIndex: 1, caps: ["liquids", "move"] },
  { id: "star", cat: "platform", sub: "Liquid handling", name: "Hamilton Microlab STAR", model: "liquidHandler", dims: [1.68, 0.95, 0.9], style: { body: 0xe9ecef, frame: 0x24303c, accent: 0x0f5fa8, cols: 8, rows: 3, ch: 8, screen: false, arms: 2 }, src: ["table_4", "Hamilton"], caps: ["liquids", "move"] },
  { id: "epmotion", cat: "platform", sub: "Liquid handling", name: "Eppendorf epMotion 5075", model: "liquidHandler", dims: [0.93, 0.65, 0.66], style: { body: 0xf1f3f4, frame: 0xc9ced4, accent: 0x1f8a70, cols: 4, rows: 3, ch: 8, screen: false }, src: ["table_4", "epMotion"], caps: ["liquids"] },
  { id: "fluent", cat: "platform", sub: "Liquid handling", name: "Tecan Fluent 1080", model: "liquidHandler", dims: [2.0, 0.9, 0.95], style: { body: 0xedf0f3, frame: 0x2a3440, accent: 0x1f5fbf, cols: 10, rows: 3, ch: 8, screen: true, arms: 2 }, src: ["table_4", "Tecan"], priceIndex: 1, caps: ["liquids", "move"] },
  { id: "biomek", cat: "platform", sub: "Liquid handling", name: "Beckman Coulter Biomek i7", model: "liquidHandler", dims: [1.25, 0.8, 0.9], style: { body: 0xeceff2, frame: 0x30343a, accent: 0xc8102e, cols: 6, rows: 3, ch: 8, screen: true, arms: 2 }, src: ["table_4", "Biomek"], caps: ["liquids", "move"] },
  { id: "bravo", cat: "platform", sub: "Liquid handling", name: "Agilent Bravo", model: "liquidHandler", dims: [0.6, 0.6, 0.75], style: { body: 0xe7eaee, frame: 0x6b7480, accent: 0x0085d5, cols: 3, rows: 3, ch: 96, screen: false }, src: ["table_4", "Bravo"], caps: ["liquids"] },
  { id: "echo", cat: "platform", sub: "Acoustic & drop dispensing", name: "Beckman Coulter Echo 525", model: "benchBox", dims: [0.75, 0.7, 0.55], style: { body: 0xe6e8eb, accent: 0xc8102e }, src: ["table_4", "Echo"], caps: ["liquids"] },
  { id: "idot", cat: "platform", sub: "Acoustic & drop dispensing", name: "Dispendix I.DOT", model: "benchBox", dims: [0.55, 0.5, 0.45], style: { body: 0xeef0f2, accent: 0x1f8a70 }, src: ["table_4", "I.DOT"], caps: ["liquids"] },
  { id: "chemspeed", cat: "platform", sub: "Formulation workstation", name: "Chemspeed workstation with SWILE / GDU-P", model: "liquidHandler", dims: [1.5, 0.85, 1.05], style: { body: 0xeceeef, frame: 0x2b2f35, accent: 0xe30613, cols: 6, rows: 3, ch: 1, screen: true, powder: true, vials: true }, src: ["table_3", "SWILE"], caps: ["powders", "liquids"], note: "Workstation body is illustrative; the review lists Chemspeed's SWILE / GDU-P powder dosing (quote only)." },
  // workstations & mounting: real McMaster-Carr CAD (scripts/export_mcmaster.py). Anything dropped on them rests on top.
  { id: "mcm-5204n11", cat: "structure", sub: "Workstation", name: "Robot workstation (McMaster 5204N11)", model: "mesh:mcm-5204n11", price: "See vendor", mount: true, caps: ["mount"], note: "Real McMaster-Carr CAD. Drop an arm or stations on it." },
  { id: "mcm-5206n15", cat: "structure", sub: "Workstation", name: "High-capacity robot workstation (McMaster 5206N15)", model: "mesh:mcm-5206n15", price: "See vendor", mount: true, caps: ["mount"], note: "Real McMaster-Carr CAD." },
  { id: "mcm-9351n11", cat: "structure", sub: "Workstation", name: "T-slotted robot workstation (McMaster 9351N11)", model: "mesh:mcm-9351n11", price: "See vendor", mount: true, caps: ["mount"], note: "Real McMaster-Carr CAD." },
  { id: "mcm-6333n16", cat: "structure", sub: "Pedestal", name: "Robot pedestal (McMaster 6333N16)", model: "mesh:mcm-6333n16", price: "See vendor", mount: true, caps: ["mount"], note: "Real McMaster-Carr CAD. 0.61 m column; drop an arm on top." },
  { id: "mcm-6333n117", cat: "structure", sub: "Pedestal", name: "Low robot riser (McMaster 6333N117)", model: "mesh:mcm-6333n117", price: "See vendor", mount: true, caps: ["mount"], note: "Real McMaster-Carr CAD." },
  { id: "mcm-3814n21", cat: "structure", sub: "Pedestal", name: "Telescoping robot pedestal (McMaster 3814N21)", model: "mesh:mcm-3814n21", price: "See vendor", mount: true, caps: ["mount"], note: "Real McMaster-Carr CAD." },
  { id: "mcm-3813n14", cat: "structure", sub: "Linear track", name: "Electric slide for UR arms (McMaster 3813N14)", model: "mesh:mcm-3813n14", price: "See vendor", mount: true, caps: ["mount"], note: "Real McMaster-Carr CAD. A 2.1 m seventh axis; drop a UR arm on the carriage." },
  { id: "mcm-9198n17", cat: "structure", sub: "Enclosure", name: "Delta robot safety enclosure (McMaster 9198N17)", model: "mesh:mcm-9198n17", price: "See vendor", mount: true, frame: true, caps: ["mount"], note: "Real McMaster-Carr CAD. Drop the delta robot on it to hang it from the frame." },
];

/* ============================================================== materials & primitives */
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .45, metalness: .05, ...o });
const MAT = {
  white: std(0xf1f2f4), light: std(0xdfe3e8), deck: std(0xd3d8de, { roughness: .7 }), dark: std(0x1f242a, { roughness: .6 }), black: std(0x121519),
  alu: std(0xb9c0c8, { metalness: .6, roughness: .3 }), steel: std(0x9aa3ad, { metalness: .7, roughness: .25 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0xcfe3f5, transparent: true, opacity: .14, roughness: .05, metalness: 0, depthWrite: false, side: THREE.DoubleSide }),
  tip: std(0xeef2f6, { roughness: .3, transparent: true, opacity: .92 }), liquid: std(0x2c6fd1, { roughness: .2 }), powder: std(0xd8c49a, { roughness: .9 }),
  well: std(0x2a2f36), amber: std(0xe2b56b, { roughness: .3 }),
};
const glow = (c, i = 1.4) => std(c, { emissive: c, emissiveIntensity: i });
function B(p, w, d, h, m, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, d, h), m); o.position.set(x, y, z + h / 2); p.add(o); return o; }
function C(p, r, h, m, x = 0, y = 0, z = 0, r2 = r, seg = 28) { const o = new THREE.Mesh(new THREE.CylinderGeometry(r2, r, h, seg), m); o.rotation.x = Math.PI / 2; o.position.set(x, y, z + h / 2); p.add(o); return o; }
function H(p, r, len, m, x, y, z, axis = "x") { const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 24), m); if (axis === "x") o.rotation.z = Math.PI / 2; o.position.set(x, y, z); p.add(o); return o; }
const G = (p, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
const ease = u => u * u * (3 - 2 * u);
const lerp = (a, b, u) => a + (b - a) * u;

/* screen with a canvas texture; draw(ctx, w, h, t) is called a few times per second */
function screen(p, w, h, draw, x, y, z, tilt = 0) {
  const cv = document.createElement("canvas"); cv.width = 256; cv.height = Math.round(256 * h / w);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  m.position.set(x, y, z); m.rotation.x = Math.PI / 2 - tilt; p.add(m);
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(w + .012, .008, h + .012), MAT.black); bezel.position.set(x, y + .005, z); bezel.rotation.x = -tilt; p.add(bezel);
  let last = -1;
  return t => { if (t - last < .25) return; last = t; draw(cv.getContext("2d"), cv.width, cv.height, t); tex.needsUpdate = true; };
}
const UI = (ctx, w, h, title, accent = "#5b8def") => {
  ctx.fillStyle = "#0c1117"; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = accent; ctx.fillRect(0, 0, w, 22);
  ctx.fillStyle = "#fff"; ctx.font = "600 13px system-ui"; ctx.fillText(title, 8, 15);
};

/* well plate or vial rack as one instanced mesh, fill(i, color) */
function plate(p, x, y, z, { cols = 12, rows = 8, pitch = .009, vial = false } = {}) {
  const g = G(p, x, y, z);
  B(g, cols * pitch + .01, rows * pitch + .01, .014, vial ? MAT.dark : MAT.white, 0, 0, 0);
  const geo = vial ? new THREE.CylinderGeometry(pitch * .38, pitch * .38, .03, 12) : new THREE.CylinderGeometry(pitch * .36, pitch * .36, .002, 10);
  const wells = new THREE.InstancedMesh(geo, std(0xffffff, { roughness: .3 }), cols * rows);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2), base = new THREE.Color(vial ? 0xe9eef3 : 0x39414b);
  for (let c = 0, i = 0; c < cols; c++) for (let r = 0; r < rows; r++, i++) {
    m.compose(new THREE.Vector3((c - (cols - 1) / 2) * pitch, (r - (rows - 1) / 2) * pitch, vial ? .029 : .0145), q, new THREE.Vector3(1, 1, 1));
    wells.setMatrixAt(i, m); wells.setColorAt(i, base);
  }
  g.add(wells);
  return { g, cols, rows, pitch, fillCol(c, color) { for (let r = 0; r < rows; r++) wells.setColorAt(c * rows + r, color); wells.instanceColor.needsUpdate = true; },
    reset() { for (let i = 0; i < cols * rows; i++) wells.setColorAt(i, base); wells.instanceColor.needsUpdate = true; },
    colX: c => x + (c - (cols - 1) / 2) * pitch, y };
}
function tipRack(p, x, y, z, { cols = 12, rows = 8, pitch = .009 } = {}) {
  const g = G(p, x, y, z); B(g, cols * pitch + .01, rows * pitch + .01, .03, std(0x5b6370), 0, 0, 0);
  const tips = new THREE.InstancedMesh(new THREE.CylinderGeometry(.0018, .0035, .03, 8), MAT.tip, cols * rows);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  const set = (i, on) => { const c = Math.floor(i / rows), r = i % rows; m.compose(new THREE.Vector3((c - (cols - 1) / 2) * pitch, (r - (rows - 1) / 2) * pitch, .045), q, new THREE.Vector3(on ? 1 : 0, on ? 1 : 0, on ? 1 : 0)); tips.setMatrixAt(i, m); };
  for (let i = 0; i < cols * rows; i++) set(i, true);
  g.add(tips);
  return { take(c) { for (let r = 0; r < rows; r++) set(c * rows + r, false); tips.instanceMatrix.needsUpdate = true; },
    reset() { for (let i = 0; i < cols * rows; i++) set(i, true); tips.instanceMatrix.needsUpdate = true; }, colX: c => x + (c - (cols - 1) / 2) * pitch, y };
}
/* keyframe runner: list of {x,y,z,d (s), on()} — interpolates a target object and fires callbacks */
function runner(keys, apply) {
  let i = 0, t0 = 0, from = { ...keys[0] };
  return (t) => {
    let k = keys[i], u = (t - t0) / k.d;
    while (u >= 1) { apply(k); k.on?.(); from = { ...k }; i = (i + 1) % keys.length; t0 += k.d; k = keys[i]; u = (t - t0) / k.d; if (i === 0) keys.onLoop?.(); }
    const e = ease(Math.max(0, u));
    apply({ x: lerp(from.x, k.x, e), y: lerp(from.y, k.y, e), z: lerp(from.z, k.z, e) });
  };
}

/* ============================================================== procedural models */
export const PROC = {
  /* deck-based liquid handler: enclosure, deck with labware, gantry that picks tips, aspirates and fills a plate column by column */
  liquidHandler([w, d, h], c, s) {
    const g = new THREE.Group(), body = std(s.body), frame = std(s.frame, { roughness: .5 }), acc = glow(s.accent, .9);
    const plinth = h * .14, deckZ = plinth + .012;
    B(g, w, d, plinth, frame);                                                     // base cabinet
    B(g, w * .99, d * .99, .012, body, 0, 0, plinth);                              // deck top
    const post = .035;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) B(g, post, post, h - plinth, frame, sx * (w - post) / 2, sy * (d - post) / 2, plinth);
    for (const sy of [-1, 1]) B(g, w, post, post, frame, 0, sy * (d - post) / 2, h - post);
    for (const sx of [-1, 1]) B(g, post, d, post, frame, sx * (w - post) / 2, 0, h - post);
    B(g, w - 2 * post, .01, h - plinth - post, body, 0, d / 2 - post / 2, plinth);    // back panel
    for (const sx of [-1, 1]) B(g, .006, d - 2 * post, h - plinth - post, MAT.glass, sx * (w / 2 - post / 2), 0, plinth);
    B(g, w - 2 * post, .006, h - plinth - post, MAT.glass, 0, -d / 2 + post / 2, plinth);
    const strip = B(g, w * .6, .004, .012, acc, 0, -d / 2 - .002, plinth * .55);    // status light
    // deck slots and labware
    const cols = s.cols, rows = s.rows, sw = (w - .12) / cols, sd = (d - .16) / rows, slots = [];
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const x = -w / 2 + .06 + sw * (i + .5), y = -d / 2 + .1 + sd * (j + .5);
      slots.push({ x, y }); B(g, sw * .92, sd * .9, .002, std(0xc3c9d0), x, y, deckZ);
    }
    const pick = k => slots[Math.min(k, slots.length - 1)];
    const pitch = Math.min(.009, sw * .8 / 12, sd * .8 / 8) * (s.vials ? 1.6 : 1);
    const pc = s.vials ? 6 : 12, pr = s.vials ? 4 : 8;
    const tipsA = s.powder ? null : tipRack(g, pick(0).x, pick(0).y, deckZ, { pitch, cols: 12, rows: 8 });
    const res = pick(1); B(g, sw * .8, sd * .7, .04, std(0x8fa3b8), res.x, res.y, deckZ); B(g, sw * .7, sd * .55, .002, s.powder ? MAT.powder : MAT.liquid, res.x, res.y, deckZ + .04);
    if (s.powder) { const hop = C(g, .035, .08, std(0x7a5bb5), res.x, res.y, deckZ + .04, .05); }
    const dst = plate(g, pick(rows).x, pick(rows).y, deckZ, { cols: pc, rows: pr, pitch, vial: !!s.vials });
    const src2 = plate(g, pick(rows + 1).x, pick(rows + 1).y, deckZ, { cols: pc, rows: pr, pitch, vial: !!s.vials });
    const trash = pick(slots.length - 1); B(g, sw * .8, sd * .8, .08, std(0x2a3038), trash.x, trash.y, deckZ);
    let shaker = null;
    if (s.module) { const m = pick(2 * rows + 1); B(g, sw * .85, sd * .85, .05, std(0x30363e), m.x, m.y, deckZ); shaker = G(g, m.x, m.y, deckZ + .05); plate(shaker, 0, 0, 0, { pitch }); }
    // gantry: bridge (moves in y), carriage (x), head (z)
    const top = h - .09, bridge = G(g, 0, 0, top);
    B(bridge, w - 2 * post, .05, .05, std(0xe9ecef), 0, 0, 0); B(bridge, w - 2 * post, .006, .02, acc, 0, -.028, .015);
    for (const sx of [-1, 1]) B(g, .03, d - .1, .02, MAT.alu, sx * (w / 2 - post - .02), 0, top + .015);
    const car = G(bridge, 0, -.04, 0), head = G(car, 0, 0, 0);
    B(car, .1, .05, .12, std(0xf4f5f7), 0, 0, -.02);
    const ch = s.ch, hw = ch === 96 ? 12 * pitch : .03, hd = ch >= 8 ? 8 * pitch + .01 : .03;
    B(head, hw + .02, hd, .16, std(0xf7f8fa), 0, 0, -.2); B(head, .02, hd, .1, acc, -hw / 2 - .01, 0, -.15);
    const tips = new THREE.Group(); head.add(tips);
    const nTip = ch === 96 ? 12 * 8 : ch >= 8 ? 8 : 1;
    for (let k = 0; k < nTip; k++) { const cx = ch === 96 ? ((k % 12) - 5.5) * pitch : 0, cy = ch === 96 ? (Math.floor(k / 12) - 3.5) * pitch : ch >= 8 ? (k - 3.5) * pitch : 0;
      const t = new THREE.Mesh(new THREE.CylinderGeometry(.0016, .0034, .05, 8), MAT.tip); t.rotation.x = Math.PI / 2; t.position.set(cx, cy, -.225); tips.add(t); }
    tips.visible = !!s.powder;
    if (s.powder) { tips.children.forEach(t => t.material = std(0x7a5bb5)); }
    if (s.gripper) { const gr = G(car, .09, 0, 0); B(gr, .04, .05, .12, std(0x2a2f36), 0, 0, -.12); for (const sy of [-1, 1]) B(gr, .01, .006, .05, MAT.alu, 0, sy * .03, -.17); }
    // second arm with a plate gripper on big decks
    let arm2 = null;
    if (s.arms === 2) { arm2 = G(bridge, w * .25, -.04, 0); B(arm2, .08, .06, .1, std(0x2a2f36), 0, 0, -.02); for (const sy of [-1, 1]) B(arm2, .012, .006, .14, MAT.alu, 0, sy * .05, -.16); }
    // screen
    let scr = null;
    if (s.screen) scr = screen(g, .2, .13, (ctx, W, Hh, t) => {
      UI(ctx, W, Hh, "Protocol running", "#" + s.accent.toString(16).padStart(6, "0"));
      ctx.fillStyle = "#9fb3c8"; ctx.font = "12px system-ui"; ctx.fillText(`Step ${1 + (Math.floor(t / 2.5) % 24)} / 24 · col ${1 + col}`, 8, 42);
      ctx.fillStyle = "#1e2a36"; ctx.fillRect(8, 52, W - 16, 10); ctx.fillStyle = "#5be3a0"; ctx.fillRect(8, 52, (W - 16) * ((col + 1) / pc), 10);
      ctx.fillStyle = "#cfe0f0"; ctx.fillText(`${(20.1 + Math.sin(t) * .2).toFixed(1)} °C · door closed`, 8, 82);
    }, w / 2 - .13, -d / 2 - .03, h * .78, .35);
    // the protocol, column by column
    let col = 0;
    const zUp = 0, zDip = -(top - deckZ - .3), liquidColor = new THREE.Color();
    const pal = [0x2c6fd1, 0x3f86e0, 0x5aa0ea, 0x7a5bb5, 0xc27a1e, 0x23906b];
    const keys = [];
    const P = (x, y, z, d, on) => keys.push({ x, y, z, d, on });
    function build() {
      keys.length = 0;
      if (!s.powder) { P(tipsA.colX(col), tipsA.y, zUp, 1.1); P(tipsA.colX(col), tipsA.y, zDip + .02, .5, () => { tipsA.take(col); tips.visible = true; }); P(tipsA.colX(col), tipsA.y, zUp, .4); }
      P(res.x, res.y, zUp, .9); P(res.x, res.y, zDip + .03, .5); P(res.x, res.y, zUp, .4);
      P(dst.colX(col), dst.y, zUp, .9);
      P(dst.colX(col), dst.y, zDip + .01, .5, () => { liquidColor.setHex(pal[col % pal.length]); dst.fillCol(col, liquidColor); });
      P(dst.colX(col), dst.y, zUp, .4);
      if (!s.powder) { P(trash.x, trash.y, zUp, 1); P(trash.x, trash.y, zDip + .06, .4, () => { tips.visible = false; }); P(trash.x, trash.y, zUp, .3, () => advance()); }
      else P(res.x, res.y, zUp, .8, () => advance());
    }
    function advance() { col++; if (col >= pc) { col = 0; dst.reset(); tipsA?.reset(); } build(); }
    build();
    const run = runner(keys, k => { bridge.position.y = k.y; car.position.x = k.x; head.position.z = k.z; });
    g.userData.tick = (t) => {
      run(t);
      strip.material.emissiveIntensity = .6 + .5 * Math.sin(t * 3);
      if (shaker) shaker.position.x = pick(2 * rows + 1).x + Math.sin(t * 40) * .0025;
      if (arm2) { const u = (Math.sin(t * .6) + 1) / 2; arm2.position.x = lerp(src2.colX(0) + .04, w * .35, u); }
      scr?.(t);
    };
    return g;
  },

  benchBox([w, d, h], c, s) {
    const g = new THREE.Group(); B(g, w, d, h, std(s.body)); B(g, w * .98, d * .98, .02, std(0x9aa3ad), 0, 0, h);
    const led = B(g, w * .5, .004, .012, glow(s.accent), 0, -d / 2 - .002, h * .85);
    const drawer = G(g, -w * .22, -d / 2, h * .32); B(drawer, .16, .14, .02, std(0x3a414a), 0, -.07, 0); plate(drawer, 0, -.07, .02, { pitch: .009 });
    const scr = screen(g, .16, .1, (ctx, W, Hh, t) => { UI(ctx, W, Hh, "Transfer", "#" + s.accent.toString(16).padStart(6, "0")); ctx.fillStyle = "#cfe0f0"; ctx.font = "12px system-ui"; ctx.fillText(`${Math.floor(t * 37) % 1536} / 1536 droplets`, 8, 44); ctx.fillText("2.5 nL · survey OK", 8, 64); }, w * .22, -d / 2 - .006, h * .55, 0);
    g.userData.tick = t => { const u = (Math.sin(t * .7) + 1) / 2; drawer.position.y = -d / 2 - u * .12; led.material.emissiveIntensity = .7 + .5 * Math.sin(t * 2); scr(t); };
    return g;
  },

  pipette([w, d, h], c) {
    const g = new THREE.Group(); B(g, w, d, .015, MAT.dark); B(g, .012, .012, h * .92, MAT.alu, -w * .32, 0, .015);
    const p = G(g, 0, 0, h * .2); C(p, .016, h * .5, std(c), 0, 0, 0); C(p, .006, h * .16, MAT.tip, 0, 0, -h * .16, .002); C(p, .021, .05, MAT.dark, 0, 0, h * .5);
    const btn = C(p, .007, .025, glow(0x5be3a0, .8), .012, 0, h * .5); B(p, .022, .004, .03, std(0x0c1117), 0, -.017, h * .38);
    g.userData.tick = t => { p.position.z = h * .2 + Math.max(0, Math.sin(t * 1.4)) * .01; btn.material.emissiveIntensity = .4 + .6 * (Math.sin(t * 3) > 0); };
    return g;
  },
  syringePump([w, d, h], c) {
    const g = new THREE.Group(); B(g, w, d * .7, h, std(0xe9ecef), 0, d * .15); B(g, w * .9, .01, h * .2, std(c), 0, -d * .2 - .005, h * .75);
    const valve = G(g, 0, -d * .32, h * .72); C(valve, .015, .03, MAT.steel, 0, 0, -.015); B(valve, .006, .03, .006, MAT.dark, 0, 0, .015);
    const barrel = C(g, .011, h * .42, new THREE.MeshPhysicalMaterial({ color: 0xe8f1fb, transparent: true, opacity: .45, roughness: .05 }), 0, -d * .32, h * .24);
    const fluid = C(g, .009, 1, MAT.liquid, 0, -d * .32, h * .24); const plunger = B(g, .03, .02, .012, MAT.dark, 0, -d * .32, h * .2);
    g.userData.tick = t => { const u = (Math.sin(t * .8) + 1) / 2, L = h * .4 * (.15 + .85 * u); fluid.scale.y = L; fluid.position.z = h * .24 + h * .42 - L / 2; plunger.position.z = h * .66 - L - .012 - .005; valve.rotation.z = Math.sin(t * .8) > 0 ? 0 : Math.PI / 2; };
    return g;
  },
  peristaltic([w, d, h], c) {
    const g = new THREE.Group(); B(g, w, d, h * .82, std(0xdfe3e8)); B(g, w, d * .2, h * .18, std(c), 0, -d * .4, h * .82);
    const head = G(g, -w * .12, -d / 2 - .025, h * .45); head.rotation.x = Math.PI / 2;
    const rotor = G(head); C(rotor, h * .2, .03, std(0xc9ced4), 0, 0, 0); for (let i = 0; i < 3; i++) { const a = i * 2.094; C(rotor, .014, .036, MAT.steel, Math.cos(a) * h * .14, Math.sin(a) * h * .14, -.003); }
    const tube = new THREE.Mesh(new THREE.TorusGeometry(h * .2, .006, 10, 40, Math.PI * 1.3), std(0xf5c26b, { transparent: true, opacity: .85 })); tube.position.set(-w * .12, -d / 2 - .045, h * .45); tube.rotation.set(Math.PI / 2, 0, Math.PI * .85); g.add(tube);
    const scr = screen(g, .08, .06, (ctx, W, Hh, t) => { UI(ctx, W, Hh, "Qdos", "#c8102e"); ctx.fillStyle = "#fff"; ctx.font = "600 22px system-ui"; ctx.fillText(`${(42 + 3 * Math.sin(t)).toFixed(1)}`, 10, 64); ctx.font = "11px system-ui"; ctx.fillText("rpm", 90, 64); }, w * .25, -d / 2 - .006, h * .52);
    g.userData.tick = (t, dt) => { rotor.rotation.z -= dt * 4; scr(t); };
    return g;
  },
  pneumatic([w, d, h], c) {
    const g = new THREE.Group(); B(g, w, d * .75, h * .34, std(0xe7eaee), 0, d * .1); B(g, w, d * .75, .02, std(c), 0, d * .1, h * .34);
    const scr = screen(g, .12, .07, (ctx, W, Hh, t) => { UI(ctx, W, Hh, "Ultimus V", "#0067b1"); ctx.fillStyle = "#fff"; ctx.font = "600 20px system-ui"; ctx.fillText(`${(2.4 + .1 * Math.sin(t * 2)).toFixed(2)} bar`, 10, 60); ctx.font = "11px system-ui"; ctx.fillStyle = "#9fb3c8"; ctx.fillText(Math.sin(t * 1.3) > 0 ? "DISPENSE" : "READY", 10, 80); }, -w * .15, -d * .28 - .006, h * .18);
    B(g, .03, .03, h * .55, MAT.alu, w * .32, -d * .25, 0); const syr = G(g, w * .32, -d * .32, h * .42);
    C(syr, .014, h * .28, new THREE.MeshPhysicalMaterial({ color: 0xf6e6c9, transparent: true, opacity: .7 }), 0, 0, 0); C(syr, .003, .03, MAT.steel, 0, 0, -.03);
    const drop = new THREE.Mesh(new THREE.SphereGeometry(.004, 10, 10), std(0xc27a1e)); syr.add(drop);
    g.userData.tick = t => { scr(t); const u = (t * 1.3) % 1; drop.position.z = -.035 - u * .08; drop.visible = Math.sin(t * 1.3 * Math.PI * 2) > -.2; };
    return g;
  },
  quantos([w, d, h], c) {
    const g = new THREE.Group(); B(g, w, d, h * .16, std(0xeceff2)); B(g, w * .72, d * .58, h * .4, MAT.glass, 0, -d * .12, h * .16);
    B(g, w * .24, d * .28, h * .84, std(0xdfe3e8), 0, d * .34, h * .16); const head = G(g, 0, d * .08, h * .62);
    B(head, w * .36, d * .3, h * .13, std(0x2f6fd6), 0, 0, 0); const doser = G(head, 0, -d * .08, 0); C(doser, .03, .07, std(0xf4f5f7), 0, 0, -.07, .02); C(doser, .009, .02, MAT.steel, 0, 0, -.09);
    C(g, w * .14, .006, MAT.steel, 0, -d * .12, h * .16); const vial = C(g, .016, .045, new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .5 }), 0, -d * .12, h * .166);
    const pile = C(g, .014, .001, MAT.powder, 0, -d * .12, h * .167);
    const scr = screen(g, .14, .07, (ctx, W, Hh, t) => { UI(ctx, W, Hh, "Quantos · dosing", "#2f6fd6"); const m = (t * 3.7) % 50; ctx.fillStyle = "#fff"; ctx.font = "600 20px ui-monospace,monospace"; ctx.fillText(`${m.toFixed(3)} mg`, 10, 60); }, 0, -d / 2 - .006, h * .08, .3);
    g.userData.tick = (t, dt) => { doser.rotation.z += dt * 2; const m = ((t * 3.7) % 50) / 50; pile.scale.y = 1 + m * 20; pile.position.z = h * .167 + m * .01; scr(t); };
    return g;
  },
  screwFeeder([w, d, h], c) {
    const g = new THREE.Group(); B(g, w * .5, d, h * .5, std(0xd5dae0), -w * .2); const hop = C(g, d * .26, h * .32, std(c), -w * .2, 0, h * .66, d * .46);
    const fill = C(g, d * .3, h * .02, MAT.powder, -w * .2, 0, h * .9, d * .4);
    const screw = G(g, w * .14, 0, h * .55); const tube = H(screw, .026, w * .62, new THREE.MeshPhysicalMaterial({ color: 0xdfe8f1, transparent: true, opacity: .35 }), 0, 0, 0);
    const aug = G(screw); for (let i = 0; i < 14; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(.018, .003, 6, 16), MAT.steel); r.rotation.y = Math.PI / 2 + .35; r.position.x = -w * .28 + i * w * .04; aug.add(r); }
    const stream = C(g, .004, .1, MAT.powder, w * .45, 0, h * .44);
    const scr = screen(g, .1, .06, (ctx, W, Hh, t) => { UI(ctx, W, Hh, "MT12 · LWF", "#7a5bb5"); ctx.fillStyle = "#fff"; ctx.font = "600 18px system-ui"; ctx.fillText(`${(1.25 + .02 * Math.sin(t * 2)).toFixed(2)} kg/h`, 8, 54); }, -w * .2, -d / 2 - .006, h * .3);
    g.userData.tick = (t, dt) => { aug.rotation.x += dt * 6; stream.scale.y = .8 + .2 * Math.sin(t * 9); fill.position.z = h * .9 - .03 * ((t * .05) % 1); scr(t); };
    return g;
  },
  vibratory([w, d, h], c) {
    const g = new THREE.Group(); B(g, w * .62, d, h * .46, std(0xd5dae0)); C(g, d * .24, h * .32, std(c), -w * .1, 0, h * .58, d * .42);
    const tray = G(g, w * .12, 0, h * .5); B(tray, w * .72, .07, .02, MAT.steel, 0, 0, 0); const bed = B(tray, w * .6, .05, .004, MAT.powder, 0, 0, .02);
    g.userData.tick = t => { tray.position.x = w * .12 + Math.sin(t * 60) * .0015; tray.position.z = h * .5 + Math.sin(t * 60 + 1) * .001; };
    return g;
  },
  jubilee([w, d, h], c) {
    const g = new THREE.Group(), fr = std(0x22262c); for (const sx of [-1, 1]) for (const sy of [-1, 1]) B(g, .03, .03, h, fr, sx * (w - .03) / 2, sy * (d - .03) / 2);
    for (const sy of [-1, 1]) B(g, w, .03, .03, fr, 0, sy * (d - .03) / 2, h - .03); for (const sx of [-1, 1]) B(g, .03, d, .03, fr, sx * (w - .03) / 2, 0, h - .03);
    const bed = G(g, 0, 0, h * .3); B(bed, w * .86, d * .8, .012, std(0xc9ced4), 0, 0, 0); plate(bed, -.1, -.05, .012, { pitch: .009 }); plate(bed, .1, -.05, .012, { pitch: .009 });
    const rack = []; for (let i = 0; i < 4; i++) { const tl = B(g, .06, .05, .11, std([0x2c6fd1, 0xc27a1e, 0x7a5bb5, 0x23906b][i]), -w * .3 + i * w * .2, d / 2 - .07, h * .58); rack.push(tl); }
    const gx = G(g, 0, 0, h - .07); B(gx, w - .06, .04, .03, MAT.alu, 0, 0, 0); const head = G(gx, 0, 0, 0); B(head, .08, .08, .08, std(c), 0, 0, -.06);
    g.userData.tick = t => { gx.position.y = Math.sin(t * .5) * d * .3; head.position.x = Math.sin(t * .9) * w * .3; bed.position.z = h * .3 + (Math.sin(t * .3) + 1) * .03; };
    return g;
  },
  cartesian([w, d, h], c) {
    const g = new THREE.Group(), al = MAT.alu, ac = std(c);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) B(g, .04, .04, h, al, sx * (w / 2 - .02), sy * (d / 2 - .02));
    for (const sy of [-1, 1]) B(g, w, .05, .05, ac, 0, sy * (d / 2 - .02), h - .05);
    const yb = G(g, 0, 0, h - .1); B(yb, .07, d, .06, ac, 0, 0, 0); const zc = G(yb, 0, 0, 0); B(zc, .06, .06, .1, MAT.dark, 0, 0, -.04);
    const z = G(zc, 0, 0, 0); B(z, .03, .03, h * .45, al, 0, 0, -h * .45); const gr = G(z, 0, 0, -h * .45); for (const s of [-1, 1]) B(gr, .008, .03, .05, MAT.dark, s * .02, 0, -.05);
    g.userData.tick = t => { yb.position.x = Math.sin(t * .6) * (w / 2 - .12); zc.position.y = Math.sin(t * .9 + 1) * (d / 2 - .12); z.position.z = -Math.max(0, Math.sin(t * 1.8)) * .12; gr.children.forEach((f, i) => f.position.x = (i ? 1 : -1) * (.012 + .01 * (Math.sin(t * 1.8) < 0))); };
    return g;
  },
  scara([w, d, h], c) {
    const g = new THREE.Group(), m = std(c); C(g, w * .38, h * .62, m); C(g, w * .4, .02, MAT.dark, 0, 0, h * .62);
    const j1 = G(g, 0, 0, h * .64); B(j1, .2, .09, .07, m, .08, 0, 0); C(j1, .045, .08, MAT.dark, .17, 0, -.005);
    const j2 = G(j1, .17, 0, .075); B(j2, .17, .075, .05, m, .085, 0, 0); const q = G(j2, .17, 0, 0); C(q, .009, h * .55, MAT.steel, 0, 0, -h * .5); C(q, .02, .04, MAT.dark, 0, 0, -h * .53);
    g.userData.tick = t => { j1.rotation.z = Math.sin(t * .7) * 1.2; j2.rotation.z = Math.sin(t * 1.1 + 1) * 1.6; q.position.z = -Math.max(0, Math.sin(t * 2.2)) * .06; };
    return g;
  },
  pf400([w, d, h], c) {
    const g = new THREE.Group(), m = std(c); B(g, .22, .22, .05, MAT.dark); B(g, .1, .14, h, m, 0, 0, .05); B(g, .02, .14, h * .9, std(0x7a5bb5, { emissive: 0x7a5bb5, emissiveIntensity: .25 }), .055, 0, .08);
    const zc = G(g, .06, 0, h * .5); B(zc, .08, .1, .12, MAT.dark, 0, 0, 0); const j1 = G(zc, .03, 0, .12); B(j1, .3, .08, .05, m, .15, 0, 0);
    const j2 = G(j1, .3, 0, .05); B(j2, .26, .07, .04, m, .13, 0, 0); const gr = G(j2, .26, 0, 0); B(gr, .06, .12, .03, MAT.dark, .02, 0, -.01);
    g.userData.tick = t => { zc.position.z = h * (.35 + .25 * (Math.sin(t * .5) + 1) / 2); j1.rotation.z = Math.sin(t * .6) * 1.3; j2.rotation.z = Math.sin(t * .9 + .5) * 1.8; gr.rotation.z = -j1.rotation.z - j2.rotation.z; };
    return g;
  },
  arm6([w, d, h], c) { return serialArm(c, [[.12, "z"], [.0, "y"], [.30, "y"], [.28, "z"], [.08, "y"], [.07, "z"]], .05); },
  arm7([w, d, h], c) { return serialArm(c, [[.14, "z"], [.0, "y"], [.31, "z"], [.0, "y"], [.38, "z"], [.0, "y"], [.1, "z"]], .055); },
  mobile([w, d, h], c) {
    const g = new THREE.Group(), base = G(g); B(base, w, d, .7, std(c)); B(base, w * .99, d * .99, .02, std(0x2a2f36), 0, 0, .7);
    B(base, w * .3, .004, .05, glow(0x5be3a0, .8), -w * .3, -d / 2 - .002, .55); for (const sx of [-1, 1]) B(base, .004, d * .6, .04, glow(0xffb020, .6), sx * (w / 2 + .002), 0, .1);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) C(base, .07, .06, MAT.dark, sx * w * .36, sy * (d / 2 - .03), 0);
    const arm = serialArm("#F28C28", [[.14, "z"], [.0, "y"], [.3, "z"], [.0, "y"], [.34, "z"], [.0, "y"], [.1, "z"]], .05); arm.position.set(w * .22, 0, .72); base.add(arm);
    const at = arm.userData.tick;
    g.userData.tick = (t, dt) => { base.position.x = Math.sin(t * .25) * .18; at(t, dt); };
    return g;
  },
  vortex([w, d, h], c) {
    const g = new THREE.Group(); B(g, w, d, h * .55, std(c)); B(g, w * .6, .004, .03, glow(0x5be3a0, .7), 0, -d / 2 - .002, h * .3);
    const cupH = G(g, 0, -d * .08, h * .55); C(cupH, w * .3, h * .1, std(0xc9ced4)); C(cupH, .012, .06, MAT.amber, 0, 0, h * .1);
    g.userData.tick = t => { cupH.position.x = Math.cos(t * 25) * .004; cupH.position.y = -d * .08 + Math.sin(t * 25) * .004; };
    return g;
  },
  characterizer([w, d, h], c) {
    const g = new THREE.Group(); B(g, w, d, h * .32, std(0xe7eaee)); B(g, w * .3, d * .3, h * .68, std(0xdfe3e8), 0, d * .3, h * .32);
    const headZ = h * .8, head = G(g, 0, d * .05, headZ); B(head, w * .26, d * .26, h * .14, std(c), 0, 0, 0); const sp = C(head, .02, .06, MAT.steel, 0, 0, -.06);
    C(g, w * .14, .01, MAT.steel, 0, d * .05, h * .32); const smp = C(g, w * .1, .004, MAT.amber, 0, d * .05, h * .33);
    const scr = screen(g, .16, .1, (ctx, W, Hh, t) => {
      UI(ctx, W, Hh, "Flow curve", "#2f6fd6"); ctx.strokeStyle = "#2a3646"; ctx.strokeRect(10, 28, W - 20, Hh - 38);
      ctx.strokeStyle = "#5be3a0"; ctx.lineWidth = 2; ctx.beginPath(); const n = Math.floor((t * 8) % 60) + 2;
      for (let i = 0; i < n; i++) { const x = 10 + (W - 20) * i / 60, y = 28 + (Hh - 38) * (.15 + .7 * Math.exp(-i / 18)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      ctx.fillStyle = "#9fb3c8"; ctx.font = "10px system-ui"; ctx.fillText("η vs γ̇ · shear-thinning", 14, Hh - 14);
    }, -w * .2, -d / 2 - .006, h * .17, .25);
    g.userData.tick = (t, dt) => { sp.rotation.y += dt * 8; head.position.z = headZ - .02 * (Math.sin(t * .4) > 0); scr(t); };
    return g;
  },
};

/* serial arm built from links: [[length, joint axis]], animated with smooth sinusoids */
function serialArm(color, spec, r) {
  const g = new THREE.Group(), m = std(color), jm = std(0x30353c);
  C(g, r * 1.4, .06, jm); let parent = G(g, 0, 0, .06); const joints = [];
  spec.forEach(([len, ax], i) => {
    const j = G(parent); j.userData.ax = ax; joints.push(j);
    if (ax === "y") { H(j, r * 1.05, r * 2.2, jm, 0, 0, 0, "y"); } else C(j, r * 1.05, .04, jm, 0, 0, -.02);
    if (len) C(j, r * (1 - i * .06), len, m, 0, 0, 0);
    parent = G(j, 0, 0, len);
  });
  const grip = G(parent); B(grip, .05, .06, .03, jm); for (const s of [-1, 1]) B(grip, .008, .012, .05, MAT.alu, 0, s * .02, .03);
  const ph = joints.map((_, i) => [.35 + i * .13, i * 1.7, i % 2 ? .6 : .9]);
  const rest = joints.map(j => j.userData.ax === "y" ? .5 : 0); if (rest.length > 3) rest[3] = joints[3].userData.ax === "y" ? -1.2 : 0;
  g.userData.tick = t => joints.forEach((j, i) => { const v = rest[i] + Math.sin(t * ph[i][0] + ph[i][1]) * ph[i][2] * (j.userData.ax === "y" ? .5 : 1);
    if (j.userData.ax === "y") j.rotation.y = v; else j.rotation.z = v; });
  return g;
}

/* ============================================================== real meshes */
const dec16 = (b64) => { const s = atob(b64), a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a.buffer; };
function geo(p, doc) {
  const q = new Uint16Array(dec16(p.v)), pos = new Float32Array(q.length);
  for (let i = 0; i < q.length; i++) pos[i] = q[i] * doc.scale[i % 3] + doc.offset[i % 3];
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setIndex(new THREE.BufferAttribute(new Uint32Array(dec16(p.f)), 1)); g.computeVertexNormals();
  return g;
}
const cache = {};
const getDoc = id => cache[id] ??= fetch(`../data/models/${id}.json`).then(r => r.json());

async function meshModel(it) {
  const id = it.model.slice(5), doc = await getDoc(id), g = new THREE.Group();
  const parts = doc.parts.map(p => { const m = new THREE.Mesh(geo(p, doc), std(p.color, { metalness: .12, roughness: .45 })); m.name = p.name || ""; g.add(m); return m; });
  g.userData.size = doc.size;
  if (id === "cnc") {                          // three axes: x bridge, y carriage, z head
    const X = parts.filter(m => /^cnc_[xyz]/.test(m.name)), Y = parts.filter(m => /^cnc_[yz]/.test(m.name)), Z = parts.filter(m => /^cnc_z/.test(m.name));
    const b0 = new Map(parts.map(m => [m, m.position.clone()]));
    const path = [[-.15, -.2, 0], [.18, -.2, 0], [.18, -.2, -.05], [.18, -.2, 0], [.18, .12, 0], [-.1, .12, 0], [-.1, .12, -.05], [-.1, .12, 0], [-.15, -.2, 0]];
    let seg = 0, t0 = 0;
    g.userData.tick = t => {
      let u = (t - t0) / .9; while (u >= 1) { t0 += .9; seg = (seg + 1) % (path.length - 1); u = (t - t0) / .9; }
      const a = path[seg], b = path[seg + 1], e = ease(u), p = a.map((v, i) => lerp(v, b[i], e));
      for (const m of parts) m.position.copy(b0.get(m));
      for (const m of X) m.position.x += p[0]; for (const m of Y) m.position.y += p[1]; for (const m of Z) m.position.z += p[2];
    };
  }
  if (id === "balance") {
    const [w, d, h] = doc.size;
    const scr = screen(g, .07, .025, (ctx, W, Hh, t) => { ctx.fillStyle = "#0b1a10"; ctx.fillRect(0, 0, W, Hh); ctx.fillStyle = "#7dffb2"; ctx.font = "600 52px ui-monospace,monospace";
      const v = 12.3456 + Math.sin(t * .8) * 3.2 + Math.sin(t * 7) * .0004; ctx.fillText(`${v.toFixed(4)} g`, 12, Hh - 22); }, 0, -d / 2 - .004, .025, .2);
    g.userData.tick = t => scr(t);
  }
  if (id === "mixer") {
    const [w, d, h] = doc.size, ring = new THREE.Mesh(new THREE.TorusGeometry(.05, .004, 8, 40, Math.PI * 1.4), glow(0x7a5bb5, 1.2));
    ring.position.set(0, 0, h + .005); g.add(ring);
    g.userData.tick = (t, dt) => { ring.rotation.z += dt * 6; ring.material.emissiveIntensity = 1 + .5 * Math.sin(t * 4); };
  }
  if (id === "ecopen" || id === "powder") {
    const [w, d, h] = doc.size, led = new THREE.Mesh(new THREE.SphereGeometry(.006, 12, 12), glow(id === "ecopen" ? 0xc27a1e : 0x7a5bb5, 1.5));
    led.position.set(0, 0, h + .006); g.add(led); g.userData.tick = t => led.material.emissiveIntensity = .6 + .9 * (Math.sin(t * 4) > 0);
  }
  return g;
}

async function articulated(it) {
  const id = it.model.slice(4), doc = await getDoc(id + "_arm"), g = new THREE.Group();
  let parent = g; const joints = [];
  for (const L of doc.links) {
    const o = new THREE.Group(); o.matrixAutoUpdate = false; o.matrix.fromArray(L.origin); parent.add(o);
    const j = new THREE.Group(); o.add(j); if (L.axis) joints.push({ j, axis: new THREE.Vector3(...L.axis).normalize() });
    for (const p of L.parts) j.add(new THREE.Mesh(geo(p, doc), std(p.color, { metalness: .15, roughness: .4 })));
    parent = j;
  }
  const grip = G(parent, 0, 0, 0); const gm = std(0x2a2f36); B(grip, .09, .045, .05, gm, 0, 0, 0); for (const s of [-1, 1]) B(grip, .01, .025, .06, MAT.alu, s * .03, 0, .05);
  if (id === "lite6") grip.position.z = .06;
  // stand the arm on z = 0 and centre it (bounding box of the home pose)
  const traj = doc.traj.length ? doc.traj : [[0, 0, 0, 0, 0, 0]];
  const setQ = q => joints.forEach((J, i) => J.j.quaternion.setFromAxisAngle(J.axis, q[i] ?? 0));
  setQ(traj[0]); g.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(g), wrap = new THREE.Group(); wrap.add(g); g.position.z = -bb.min.z;
  let f = 0;
  wrap.userData.tick = (t, dt) => { f = (f + dt * 30) % traj.length; const a = traj[Math.floor(f)], b = traj[(Math.floor(f) + 1) % traj.length], u = f % 1;
    setQ(a.map((v, i) => lerp(v, b[i], u))); };
  return wrap;
}

/* ============================================================== public builder */
export async function buildModel(it) {
  let g;
  if (it.model.startsWith("mesh:")) g = await meshModel(it);
  else if (it.model.startsWith("arm:")) g = await articulated(it);
  else g = PROC[it.model](it.dims, it.color || "#c9cfd6", it.style || {});
  const root = new THREE.Group(); root.add(g); root.userData.tick = g.userData.tick || null; root.userData.size = g.userData.size;
  root.traverse(o => { if (o.isMesh && !(o.material?.transparent)) { o.castShadow = true; o.receiveShadow = true; } });
  return root;
}

/* CNC tool dock: three slots in front of the gantry */
export function addDock(g, size) {
  const [w, d] = size, y = -d / 2 - .13, zTop = .2, dk = new THREE.Group(); g.add(dk);
  for (const sx of [-1, 1]) B(dk, .03, .06, zTop, MAT.dark, sx * w * .38, y);
  B(dk, w * .82, .08, .025, MAT.alu, 0, y, zTop);
  const slots = [-.18, 0, .18].map(x => new THREE.Vector3(x * w / .6, y, zTop + .025));
  for (const s of slots) { const r = new THREE.Mesh(new THREE.TorusGeometry(.035, .005, 8, 28), glow(0x2c6fd1, .8)); r.position.copy(s); dk.add(r); }
  return slots;
}
