/* Device catalogue for the Lab Builder.
 * Prices, accuracy and references are looked up at runtime in data/review.json (Tables 2–4) via `src`,
 * so the review stays the single source of truth. Items without a review row say so.
 * Models: "mesh:<id>" loads a real mesh from data/models/<id>.json; any other key is a procedural model
 * built in this file from primitives, sized to the approximate footprint in `dims` [w, d, h] metres.
 */
import * as THREE from "three";

export const CATEGORIES = [
  { id: "handler", name: "Material handlers", subs: ["Liquid dispensers", "Paste & gel dispensers", "Powder dispensers"] },
  { id: "motion", name: "Motion providers", subs: ["Gantries with tool dock"] },
  { id: "arm", name: "Robot arms", subs: ["Cartesian gantry", "SCARA", "6-DOF articulated", "7-DOF collaborative", "Mobile manipulator"] },
  { id: "mixer", name: "Mixers", subs: ["Mixers"] },
  { id: "station", name: "Balances & stations", subs: ["Stations"] },
  { id: "platform", name: "Integrated platforms", subs: ["Liquid-handling platforms", "Formulation workstations"] },
];

export const ITEMS = [
  // ---------------------------------------------------------------- material handlers
  { id: "rainin-e4", cat: "handler", sub: "Liquid dispensers", name: "Rainin E4 XLS+", model: "pipette", dims: [0.12, 0.12, 0.32], src: ["table_3", "E4 XLS+"], tool: true, color: "#2C6FD1" },
  { id: "eppendorf-xplorer", cat: "handler", sub: "Liquid dispensers", name: "Eppendorf Xplorer", model: "pipette", dims: [0.12, 0.12, 0.33], src: ["table_3", "Xplorer"], tool: true, color: "#2C6FD1" },
  { id: "hamilton-psd4", cat: "handler", sub: "Liquid dispensers", name: "Hamilton PSD/4 syringe pump", model: "syringePump", dims: [0.07, 0.12, 0.24], src: ["table_3", "PSD/4"], color: "#2C6FD1" },
  { id: "qdos20", cat: "handler", sub: "Liquid dispensers", name: "Watson-Marlow Qdos 20", model: "peristaltic", dims: [0.2, 0.18, 0.22], src: ["table_3", "Qdos 20"], color: "#2C6FD1" },
  { id: "ecopen", cat: "handler", sub: "Paste & gel dispensers", name: "ViscoTec eco-PEN300 (formulator pen)", model: "mesh:ecopen", src: ["table_3", "eco-PEN300"], tool: true, note: "Real mesh from the formulation-cell twin." },
  { id: "ultimus", cat: "handler", sub: "Paste & gel dispensers", name: "Nordson EFD Ultimus V", model: "pneumaticDispenser", dims: [0.3, 0.25, 0.3], src: ["table_3", "Ultimus V"], color: "#C27A1E" },
  { id: "powder-hapd", cat: "handler", sub: "Powder dispensers", name: "Powder dispenser (HAPD, lab-built)", model: "mesh:powder", price: "Lab-built", tool: true, note: "The formulation cell's own powder dispenser; not a catalogue product." },
  { id: "quantos", cat: "handler", sub: "Powder dispensers", name: "Mettler-Toledo Quantos", model: "quantos", dims: [0.32, 0.45, 0.62], src: ["table_3", "Quantos"], color: "#7A5BB5" },
  { id: "mt12", cat: "handler", sub: "Powder dispensers", name: "Coperion K-Tron MT12 micro-feeder", model: "screwFeeder", dims: [0.45, 0.25, 0.5], src: ["table_3", "MT12"], color: "#7A5BB5" },
  { id: "vf1", cat: "handler", sub: "Powder dispensers", name: "3P Innovation VF1 vibratory feeder", model: "vibratoryFeeder", dims: [0.3, 0.18, 0.35], src: ["table_3", "VF1"], color: "#7A5BB5" },

  // ---------------------------------------------------------------- motion providers
  { id: "cnc4040", cat: "motion", sub: "Gantries with tool dock", name: "Genmitsu 4040-PRO CNC + tool dock", model: "mesh:cnc", dock: true, src: ["table_2", "4040-PRO"], note: "Real mesh from the formulation-cell twin, with a three-slot tool dock in front. Drop a pen, powder dispenser or pipette near a slot to dock it." },
  { id: "jubilee", cat: "motion", sub: "Gantries with tool dock", name: "Jubilee tool-changer", model: "jubilee", dims: [0.55, 0.55, 0.6], src: ["table_2", "Jubilee"], color: "#C27A1E" },

  // ---------------------------------------------------------------- robot arms (the review's five classes)
  { id: "drylin", cat: "arm", sub: "Cartesian gantry", name: "igus drylin XYZ gantry", model: "cartesian", dims: [0.9, 0.7, 0.6], src: ["table_2", "drylin"], reach: null, color: "#C27A1E" },
  { id: "rs3", cat: "arm", sub: "SCARA", name: "Epson RS3 SCARA", model: "scara", dims: [0.25, 0.25, 0.45], src: ["table_2", "RS3"], reach: 0.35, color: "#7A5BB5" },
  { id: "pf400", cat: "arm", sub: "SCARA", name: "PreciseFlex PF400", model: "pf400", dims: [0.25, 0.25, 0.75], src: ["table_2", "PF400"], reach: 0.59, color: "#7A5BB5" },
  { id: "ur3e", cat: "arm", sub: "6-DOF articulated", name: "Universal Robots UR3e", model: "mesh:ur3e", src: ["table_2", "UR3e"], reach: 0.5, note: "Real UR e-Series mesh (BSD-3)." },
  { id: "ur5e", cat: "arm", sub: "6-DOF articulated", name: "Universal Robots UR5e", model: "mesh:ur5e", price: "Not in review", reach: 0.85, note: "Real UR e-Series mesh (BSD-3). Price not listed in the review." },
  { id: "ur10e", cat: "arm", sub: "6-DOF articulated", name: "Universal Robots UR10e", model: "mesh:ur10e", price: "Not in review", reach: 1.3, note: "Real UR e-Series mesh (BSD-3). Price not listed in the review." },
  { id: "ur16e", cat: "arm", sub: "6-DOF articulated", name: "Universal Robots UR16e", model: "mesh:ur16e", price: "Not in review", reach: 0.9, note: "Real UR e-Series mesh (BSD-3). Price not listed in the review." },
  { id: "xarm6", cat: "arm", sub: "6-DOF articulated", name: "UFACTORY xArm 6", model: "arm6", dims: [0.2, 0.2, 0.75], src: ["table_2", "xArm 6"], reach: 0.7, color: "#E8EAED" },
  { id: "lite6", cat: "arm", sub: "6-DOF articulated", name: "UFACTORY Lite 6", model: "mesh:lite6", src: ["table_2", "Lite 6"], reach: 0.44, note: "Real UFACTORY Lite 6 mesh (BSD-3)." },
  { id: "fr3", cat: "arm", sub: "7-DOF collaborative", name: "Franka Research 3", model: "arm7", dims: [0.25, 0.25, 0.95], src: ["table_2", "Franka Research 3"], reach: 0.855, color: "#F2F2F2" },
  { id: "gen3", cat: "arm", sub: "7-DOF collaborative", name: "Kinova Gen3", model: "arm7", dims: [0.2, 0.2, 0.95], src: ["table_2", "Gen3"], reach: 0.902, color: "#4A4F57" },
  { id: "kmr", cat: "arm", sub: "Mobile manipulator", name: "KUKA KMR iiwa", model: "mobile", dims: [1.08, 0.63, 1.4], src: ["table_2", "KMR iiwa"], reach: 0.82, color: "#F28C28" },

  // ---------------------------------------------------------------- mixers
  { id: "thinky", cat: "mixer", sub: "Mixers", name: "Planetary centrifugal mixer", model: "mesh:mixer", price: "Not in review", note: "Real mesh of the formulation cell's planetary mixer." },
  { id: "vortex", cat: "mixer", sub: "Mixers", name: "Vortex mixer (generic)", model: "vortex", dims: [0.13, 0.16, 0.16], price: "Not in review", color: "#3B4048" },

  // ---------------------------------------------------------------- stations
  { id: "balance", cat: "station", sub: "Stations", name: "Analytical balance", model: "mesh:balance", price: "Not in review", note: "Real mesh from the formulation-cell twin." },
  { id: "characterizer", cat: "station", sub: "Stations", name: "Characterizer (generic)", model: "characterizer", dims: [0.3, 0.28, 0.24], price: "Not in review", color: "#2F6FD6" },
  { id: "cup", cat: "station", sub: "Stations", name: "Premix cup", model: "mesh:cup", price: "Not in review", stack: true, note: "Drop it on a balance, mixer or characterizer and it rests on top." },

  // ---------------------------------------------------------------- integrated platforms (approximate footprints)
  { id: "ot2", cat: "platform", sub: "Liquid-handling platforms", name: "Opentrons OT-2", model: "platform", dims: [0.63, 0.57, 0.66], style: { frame: "#E9ECEF", accent: "#2C6FD1", cols: 3, rows: 4, heads: 1 }, src: ["table_4", "Opentrons"], priceIndex: 0 },
  { id: "flex", cat: "platform", sub: "Liquid-handling platforms", name: "Opentrons Flex", model: "platform", dims: [0.87, 0.69, 0.84], style: { frame: "#F4F5F7", accent: "#3D3D9E", cols: 4, rows: 3, heads: 1, gripper: true }, src: ["table_4", "Opentrons"], priceIndex: 1 },
  { id: "star", cat: "platform", sub: "Liquid-handling platforms", name: "Hamilton Microlab STAR", model: "platform", dims: [1.68, 0.95, 0.9], style: { frame: "#DADFE5", accent: "#0F5FA8", cols: 9, rows: 2, heads: 8 }, src: ["table_4", "Hamilton"] },
  { id: "epmotion", cat: "platform", sub: "Liquid-handling platforms", name: "Eppendorf epMotion 5075", model: "platform", dims: [0.93, 0.65, 0.66], style: { frame: "#EEF1F3", accent: "#1F8A70", cols: 4, rows: 3, heads: 1 }, src: ["table_4", "epMotion"] },
  { id: "fluent", cat: "platform", sub: "Liquid-handling platforms", name: "Tecan Fluent 1080", model: "platform", dims: [2.0, 0.9, 0.95], style: { frame: "#E4E7EB", accent: "#1F5FBF", cols: 10, rows: 3, heads: 8, arms: 2 }, src: ["table_4", "Tecan"], priceIndex: 1 },
  { id: "biomek", cat: "platform", sub: "Liquid-handling platforms", name: "Beckman Coulter Biomek i7", model: "platform", dims: [1.25, 0.8, 0.9], style: { frame: "#E6E8EB", accent: "#C8102E", cols: 7, rows: 3, heads: 8, arms: 2 }, src: ["table_4", "Biomek"] },
  { id: "bravo", cat: "platform", sub: "Liquid-handling platforms", name: "Agilent Bravo", model: "platform", dims: [0.6, 0.6, 0.75], style: { frame: "#D9DDE2", accent: "#0085D5", cols: 3, rows: 3, heads: 96 }, src: ["table_4", "Bravo"] },
  { id: "echo", cat: "platform", sub: "Liquid-handling platforms", name: "Beckman Coulter Echo 525", model: "box", dims: [0.75, 0.7, 0.55], style: { frame: "#E6E8EB", accent: "#C8102E" }, src: ["table_4", "Echo"] },
  { id: "idot", cat: "platform", sub: "Liquid-handling platforms", name: "Dispendix I.DOT", model: "box", dims: [0.55, 0.5, 0.45], style: { frame: "#EEF0F2", accent: "#1F8A70" }, src: ["table_4", "I.DOT"] },
  { id: "chemspeed", cat: "platform", sub: "Formulation workstations", name: "Chemspeed workstation with SWILE / GDU-P", model: "platform", dims: [1.5, 0.85, 1.05], style: { frame: "#E8EAEC", accent: "#E30613", cols: 6, rows: 3, heads: 1, powder: true }, src: ["table_3", "SWILE"], note: "Workstation body is illustrative; the review lists Chemspeed's SWILE / GDU-P powder dosing (quote only)." },
];

/* ======================================================================= procedural models */
const M = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .55, metalness: .1, ...extra });
const GLASS = () => new THREE.MeshStandardMaterial({ color: 0xbfd6ea, transparent: true, opacity: .18, roughness: .1, depthWrite: false });
function box(g, w, d, h, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, d, h), mat); m.position.set(x, y, z + h / 2); g.add(m); return m; }
function cyl(g, r, h, mat, x = 0, y = 0, z = 0, r2 = r, seg = 24) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r, h, seg), mat); m.rotation.x = Math.PI / 2; m.position.set(x, y, z + h / 2); g.add(m); return m; }
function hcyl(g, r, len, mat, x, y, z, axis = "x") { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 20), mat); if (axis === "x") m.rotation.z = Math.PI / 2; m.position.set(x, y, z); g.add(m); return m; }
function rails(g, w, d, h, mat, t = 0.025) { // open frame: 4 posts + top rectangle
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) box(g, t, t, h, mat, sx * (w - t) / 2, sy * (d - t) / 2, 0);
  for (const sy of [-1, 1]) box(g, w, t, t, mat, 0, sy * (d - t) / 2, h - t);
  for (const sx of [-1, 1]) box(g, t, d, t, mat, sx * (w - t) / 2, 0, h - t);
}
const DARK = M(0x3b4048), ALU = M(0xb9c0c8, { metalness: .5, roughness: .35 }), WHITE = M(0xf3f4f6);

export const PROC = {
  pipette([w, d, h], c) { const g = new THREE.Group(); box(g, w, d, .02, DARK); box(g, .015, .015, h * .9, ALU, -w * .3, 0, .02);
    cyl(g, .017, h * .45, M(c), 0, 0, h * .35); cyl(g, .004, h * .18, WHITE, 0, 0, h * .17, .002); cyl(g, .02, .05, DARK, 0, 0, h * .8); return g; },
  syringePump([w, d, h], c) { const g = new THREE.Group(); box(g, w, d * .7, h, M(0xe6e8eb), 0, d * .15); box(g, w * .8, .01, h * .25, M(c), 0, -d * .2 - .005, h * .7);
    cyl(g, .012, h * .45, M(0xdfeaf5, { transparent: true, opacity: .7 }), 0, -d * .32, h * .12); return g; },
  peristaltic([w, d, h], c) { const g = new THREE.Group(); box(g, w, d, h * .8, M(0xd9dde2)); hcyl(g, h * .22, .05, M(c), 0, -d / 2 - .02, h * .45, "y");
    box(g, w * .5, .01, h * .2, DARK, -w * .1, -d / 2 - .005, h * .55); return g; },
  pneumaticDispenser([w, d, h], c) { const g = new THREE.Group(); box(g, w, d * .8, h * .35, M(0xe9ecef), 0, d * .1); box(g, w * .5, .01, h * .12, DARK, 0, -d * .3 - .005, h * .12);
    box(g, .04, .04, h * .4, ALU, w * .32, -d * .3, h * .35); cyl(g, .014, h * .25, M(c), w * .32, -d * .38, h * .5); return g; },
  quantos([w, d, h], c) { const g = new THREE.Group(); box(g, w, d, h * .18, M(0xe9ecef)); box(g, w * .7, d * .55, h * .4, GLASS(), 0, -d * .12, h * .18);
    box(g, w * .2, d * .25, h * .82, M(0xd5d9de), 0, d * .36, h * .18); box(g, w * .35, d * .3, h * .14, M(c), 0, d * .12, h * .7); cyl(g, .03, h * .1, ALU, 0, -d * .05, h * .6, .015); return g; },
  screwFeeder([w, d, h], c) { const g = new THREE.Group(); box(g, w * .5, d, h * .5, M(0xd5d9de), -w * .2); cyl(g, d * .25, h * .3, M(c), -w * .2, 0, h * .7, d * .45);
    hcyl(g, .025, w * .6, ALU, w * .15, 0, h * .55); return g; },
  vibratoryFeeder([w, d, h], c) { const g = new THREE.Group(); box(g, w * .6, d, h * .45, M(0xd5d9de)); cyl(g, d * .25, h * .3, M(c), -w * .1, 0, h * .55, d * .4);
    box(g, w * .7, .06, .03, ALU, w * .12, 0, h * .5); return g; },
  jubilee([w, d, h], c) { const g = new THREE.Group(); rails(g, w, d, h, DARK, .03); box(g, w * .9, d * .9, .01, M(0xc9cfd6), 0, 0, h * .3);
    box(g, w, .03, .03, ALU, 0, 0, h - .06); box(g, .08, .08, .1, M(c), 0, 0, h - .16);
    for (let i = 0; i < 4; i++) box(g, .07, .06, .12, M(i % 2 ? 0x2c6fd1 : 0xc27a1e), -w * .33 + i * w * .22, d / 2 - .06, h * .55); return g; },
  cartesian([w, d, h], c) { const g = new THREE.Group(); for (const sx of [-1, 1]) for (const sy of [-1, 1]) box(g, .04, .04, h, ALU, sx * (w / 2 - .02), sy * (d / 2 - .02));
    for (const sy of [-1, 1]) box(g, w, .05, .05, M(c), 0, sy * (d / 2 - .02), h - .05); box(g, .06, d, .06, M(c), .05, 0, h - .1); box(g, .05, .05, h * .55, ALU, .05, 0, h * .35);
    box(g, .07, .05, .05, DARK, .05, 0, h * .3); return g; },
  scara([w, d, h], c) { const g = new THREE.Group(); cyl(g, w * .4, h * .55, M(0xf0f1f3)); box(g, .2, .08, .06, M(c), .08, 0, h * .55); box(g, .17, .07, .05, M(0xf0f1f3), .23, 0, h * .62);
    cyl(g, .01, h * .5, ALU, .3, 0, h * .3); return g; },
  pf400([w, d, h], c) { const g = new THREE.Group(); box(g, .2, .2, .05, DARK); box(g, .1, .14, h, M(0xe6e8eb), 0, 0, .05); box(g, .08, .1, .12, M(c), .05, 0, h * .55);
    box(g, .3, .07, .05, M(0xe6e8eb), .2, 0, h * .6); box(g, .25, .06, .04, M(0xe6e8eb), .4, 0, h * .66); box(g, .05, .1, .03, DARK, .52, 0, h * .63); return g; },
  arm6([w, d, h], c) { const g = new THREE.Group(), m = M(c); cyl(g, .07, .12, m); cyl(g, .055, .1, DARK, 0, 0, .12);
    const up = cyl(g, .045, .32, m, 0, 0, .22); const fore = box(g, .26, .07, .07, m, .13, 0, .52); cyl(g, .04, .1, DARK, .26, 0, .48); box(g, .05, .05, .09, m, .26, 0, .39); return g; },
  arm7([w, d, h], c) { const g = new THREE.Group(), m = M(c); cyl(g, .08, .14, m); cyl(g, .06, .3, m, 0, 0, .14); cyl(g, .055, .08, DARK, 0, 0, .44);
    const e = new THREE.Group(); e.position.set(0, 0, .52); e.rotation.y = .9; g.add(e); cyl(e, .05, .3, m); cyl(e, .045, .06, DARK, 0, 0, .3);
    const f = new THREE.Group(); f.position.set(0, 0, .36); f.rotation.y = 1.2; e.add(f); cyl(f, .042, .22, m); box(f, .07, .05, .06, DARK, 0, 0, .22); return g; },
  mobile([w, d, h], c) { const g = new THREE.Group(); box(g, w, d, .7, M(c)); box(g, w * .98, d * .98, .02, DARK, 0, 0, .7);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) cyl(g, .06, .05, DARK, sx * w * .36, sy * (d / 2 + .01), .02);
    const arm = PROC.arm7([.2, .2, .7], "#F28C28"); arm.position.set(w * .25, 0, .72); arm.scale.setScalar(.85); g.add(arm); return g; },
  vortex([w, d, h], c) { const g = new THREE.Group(); box(g, w, d, h * .6, M(c)); cyl(g, w * .3, h * .2, M(0xd5d9de), 0, -d * .1, h * .6); return g; },
  characterizer([w, d, h], c) { const g = new THREE.Group(); box(g, w, d, h, M(c)); box(g, w * .5, .01, h * .35, M(0x111821), 0, -d / 2 - .005, h * .5);
    cyl(g, .04, .02, M(0xd5d9de), w * .25, 0, h); return g; },
  box([w, d, h], c, s) { const g = new THREE.Group(); box(g, w, d, h, M(s.frame)); box(g, w * .7, .01, h * .08, M(s.accent), 0, -d / 2 - .005, h * .8);
    box(g, w * .4, .01, h * .25, M(0x1a2230), -w * .15, -d / 2 - .006, h * .35); return g; },
  platform([w, d, h], c, s) {
    const g = new THREE.Group(), fr = M(s.frame), acc = M(s.accent);
    box(g, w, d, h * .16, fr);                                           // base cabinet
    box(g, w * .96, d * .9, .01, M(0x7a8592), 0, 0, h * .16);            // deck
    const cols = s.cols, rows = s.rows, cw = w * .9 / cols, rd = d * .8 / rows;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if ((i + j) % 3 !== 2)
      box(g, cw * .78, rd * .7, .015, M([0xf3f4f6, 0xdfeaf5, 0xe2b56b][(i * rows + j) % 3]), -w * .45 + cw * (i + .5), -d * .4 + rd * (j + .5), h * .17);
    for (const sx of [-1, 1]) box(g, .04, d, h * .84, fr, sx * (w / 2 - .02), 0, h * .16);  // side columns
    box(g, w, .04, h * .84, fr, 0, d / 2 - .02, h * .16);                                   // back wall
    box(g, w, d, .05, fr, 0, 0, h - .05);                                                   // roof
    box(g, w * .96, .005, h * .7, GLASS(), 0, -d / 2 + .01, h * .2);                         // front window
    for (let a = 0; a < (s.arms || 1); a++) {
      const x = -w * .2 + a * w * .35;
      box(g, .06, d * .9, .05, ALU, x, 0, h * .78);                                           // gantry bar
      const head = box(g, .09, .08, .14, acc, x, -d * .05 + a * .1, h * .62);
      const n = Math.min(s.heads, 8);
      for (let k = 0; k < n; k++) cyl(g, .004, .06, WHITE, x - .03 + (n > 1 ? k * .06 / (n - 1) : .03), -d * .05 + a * .1, h * .56);
    }
    if (s.gripper) { box(g, .05, .04, .1, DARK, w * .25, 0, h * .62); }
    if (s.powder) { cyl(g, .05, .12, M(0x7a5bb5), w * .3, -d * .1, h * .55, .03); }
    box(g, w * .25, .01, .04, acc, -w * .3, -d / 2 - .002, h * .1);                          // brand stripe (no logos)
    return g;
  },
};

/* CNC tool dock: three slots in front of the gantry (local frame of the CNC mesh, +y is the back). */
export function addDock(g, size) {
  const [w, d] = size, y = -d / 2 - .13, zTop = .2;
  for (const sx of [-1, 1]) box(g, .03, .06, zTop, DARK, sx * w * .38, y);
  box(g, w * .82, .08, .025, ALU, 0, y, zTop);
  const slots = [-.18, 0, .18].map(x => new THREE.Vector3(x * w / .6, y, zTop + .025));
  for (const s of slots) { const r = new THREE.Mesh(new THREE.TorusGeometry(.035, .006, 8, 24), M(0x2c6fd1)); r.position.copy(s); g.add(r); }
  return slots;
}
