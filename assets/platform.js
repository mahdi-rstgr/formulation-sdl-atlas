/* The assemblab demonstration platform: a self-driving formulation station composed from catalogue devices,
 * in the style of a compact laboratory automation system (aluminium-extrusion frame, stainless deck, a small
 * cobot at the back, dispensing modules, labware racks, a stack light). Used by the home-page hero render
 * (tools/render-platform.html) and by the 3D workflow scene (assets/sdl-scene.js).
 *
 *   const P = await buildPlatform(THREE, { root: "./" });
 *   P.group            THREE.Group, standing on z = 0, centred on its footprint (metres, Z up)
 *   P.parts[id]        component groups: frame, labware, gantry, dispensers, ot2, pumpP, pumpR, arm, balance,
 *                      mixer, visco, flow, tower, estop
 *   P.info[id]         { label, sub, product } for annotations and links
 *   P.size             [w, d, h]
 */
const dec = b => { const s = atob(b), a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a.buffer; };

/* CAD files carry SolidWorks' default colours; give each device the finish it has in reality */
const RECOLOR = {
  "ot2": { "#cad1ee": "#eef1f5" },
  "cnc3030": { "#b8bec6": "#9aa3ad", "#cad1ee": "#262b33" },
  "lab-cnc-viscometer": { "#b8bec6": "#c3c9d0", "#cad1ee": "#6c7f99" },
  "peristaltic-pump": { "#b8bec6": "#32363d", "#cad1ee": "#e6e8ec" },
  "reciprocating-pump": { "#b8bec6": "#c7ccd3", "#cad1ee": "#2b3038" },
  "sensirion-slf3s": { "#cad1ee": "#3a3f47" },
  "mcm-9351n11": { "#b8bec6": "#c9ced5" },
};

export const PLATFORM_INFO = {
  frame: { label: "T-slot workstation frame", sub: "Two McMaster-Carr modules, stainless deck", product: "mcm-9351n11" },
  labware: { label: "Labware", sub: "Vial racks, volumetric flasks, reagent bottles", product: "cup" },
  gantry: { label: "Compact gantry", sub: "Genmitsu 3030: picks a tool and doses", product: "cnc3030" },
  dispensers: { label: "Dispensing tools", sub: "Formulator Pen, powder dispenser, ecoPEN", product: "lab-formulator-pen-assembly" },
  ot2: { label: "Opentrons OT-2", sub: "Prepares liquid stocks", product: "ot2" },
  pumpP: { label: "Peristaltic pump", sub: "Acceleration Consortium module", product: "peristaltic-pump" },
  pumpR: { label: "Reciprocating pump", sub: "Viscous liquids", product: "reciprocating-pump" },
  arm: { label: "Lite 6 cobot", sub: "Moves cups and vials between stations", product: "lite6" },
  balance: { label: "Analytical balance", sub: "Checks every dose by mass", product: "balance" },
  mixer: { label: "Planetary mixer", sub: "Mixes and degasses the premix", product: "thinky" },
  visco: { label: "Gantry viscometer", sub: "Measures each premix in its cup", product: "lab-cnc-viscometer" },
  flow: { label: "Flow sensor", sub: "Sensirion SLF3S in the liquid line", product: "sensirion-slf3s" },
  tower: { label: "Stack light", sub: "Shows the cell's state at a glance", product: null },
  estop: { label: "Emergency stop", sub: "Hard-wired, cuts all actuators", product: null },
};

export async function buildPlatform(THREE, { root = "./", onProgress = () => { } } = {}) {
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .5, metalness: .08, ...o });
  const box = (w, d, h, m, x = 0, y = 0, z = 0) => { const k = new THREE.Mesh(new THREE.BoxGeometry(w, d, h), m); k.position.set(x, y, z + h / 2); return k; };
  const cyl = (r, h, m, x = 0, y = 0, z = 0, seg = 24) => { const k = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m); k.rotation.x = Math.PI / 2; k.position.set(x, y, z + h / 2); return k; };
  const cache = {};
  const load = id => cache[id] ??= fetch(`${root}data/models/${id}.json`).then(r => r.json());
  async function model(id, x, y, z, rotZ = 0, rec = RECOLOR[id] || {}) {
    const doc = await load(id), g = new THREE.Group();
    for (const p of doc.parts) {
      const q = new Uint16Array(dec(p.v)), pos = new Float32Array(q.length);
      for (let i = 0; i < q.length; i++) pos[i] = q[i] * doc.scale[i % 3] + doc.offset[i % 3];
      const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setIndex(new THREE.BufferAttribute(new Uint32Array(dec(p.f)), 1)); geo.computeVertexNormals();
      const c = (rec[p.color.toLowerCase()] || p.color);
      g.add(new THREE.Mesh(geo, std(c, { metalness: id.startsWith("mcm-") ? .45 : .1, roughness: id.startsWith("mcm-") ? .38 : .5 })));
    }
    g.position.set(x, y, z); g.rotation.z = rotZ; g.userData.size = doc.size; return g;
  }

  const P = new THREE.Group(), parts = {};
  const add = (id, ...objs) => { (parts[id] ??= new THREE.Group()).add(...objs); };
  onProgress("Loading the platform…");
  /* ---------------- frame: two T-slot workstations, one stainless deck, a lower shelf */
  const ws = await load("mcm-9351n11"), W = ws.size[0], D = ws.size[1], H = ws.size[2];
  const steel = std(0xd5dae0, { metalness: .65, roughness: .32 }), dark = std(0x2a2e35, { roughness: .6 });
  add("frame", await model("mcm-9351n11", -W / 2, 0, 0), await model("mcm-9351n11", W / 2, 0, 0));
  const deckZ = H + .012;
  add("frame", box(2 * W - .02, D - .02, .012, steel, 0, 0, H));
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) add("frame", cyl(.03, .05, dark, sx * (W - .06), sy * (D / 2 - .06), 0));
  /* ---------------- module A (x < 0): OT-2, Lite 6, balance, labware, stack light */
  const [ot2, arm, bal] = await Promise.all([model("ot2", -W + .38, .08, deckZ), model("lite6", -.62, .16, deckZ), model("balance", -.92, -.24, deckZ)]);
  add("ot2", ot2); add("arm", arm); add("balance", bal);
  const glass = new THREE.MeshStandardMaterial({ color: 0xdbe9f5, roughness: .08, metalness: 0, transparent: true, opacity: .45, depthWrite: false });
  const acrylic = new THREE.MeshStandardMaterial({ color: 0xbcd5ea, roughness: .1, transparent: true, opacity: .5 });
  const capW = std(0xf4f5f7), capB = std(0x2f6fd6), hdpe = std(0xf2f2ee, { roughness: .7 }), liquidA = std(0x7fb6e8, { transparent: true, opacity: .75 });
  // vial rack: 4 x 6 vials with caps
  { const rx = -.42, ry = -.25; add("labware", box(.27, .17, .018, acrylic, rx, ry, deckZ), box(.27, .17, .006, acrylic, rx, ry, deckZ + .045));
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { const x = rx - .11 + i * .044, y = ry - .055 + j * .037;
      add("labware", cyl(.012, .058, glass, x, y, deckZ + .012), cyl(.009, .03, liquidA, x, y, deckZ + .014), cyl(.0128, .014, j % 2 ? capB : capW, x, y, deckZ + .07)); } }
  // volumetric flasks on a tray
  { const lathe = (() => { const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector2(.034 * Math.sin(Math.PI * Math.min(1, t * 1.05)) + .004, t * .068)); }
      pts.push(new THREE.Vector2(.0075, .078), new THREE.Vector2(.0075, .16), new THREE.Vector2(.0095, .165)); return new THREE.LatheGeometry(pts, 28); })();
    add("labware", box(.3, .1, .012, acrylic, -.11, -.27, deckZ));
    for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(lathe, glass); f.rotation.x = Math.PI / 2; f.position.set(-.215 + i * .07, -.27, deckZ + .012); add("labware", f);
      const liq = new THREE.Mesh(new THREE.SphereGeometry(.026, 18, 12, 0, Math.PI * 2, Math.PI * .45, Math.PI * .55), std(i % 2 ? 0x9ed0a8 : 0xf0c27a, { transparent: true, opacity: .8 })); liq.position.set(-.215 + i * .07, -.27, deckZ + .046); add("labware", liq);
      add("labware", cyl(.009, .012, std(0xe9eef4), -.215 + i * .07, -.27, deckZ + .177)); } }
  // reagent bottles
  for (let i = 0; i < 3; i++) { const x = -.3 + i * .1, y = .3; add("labware", cyl(.042, .15, hdpe, x, y, deckZ, 32), cyl(.018, .025, hdpe, x, y, deckZ + .15), cyl(.02, .022, i === 1 ? capB : std(0xd9433a), x, y, deckZ + .172)); }
  // stack light at the back-left corner
  { const g = []; g.push(cyl(.012, .26, steel, -W + .05, D / 2 - .06, deckZ)); [[0x2fbf71, .26], [0xf2c230, .305], [0xe0402f, .35]].forEach(([c, z], i) => g.push(cyl(.024, .045, std(c, { emissive: c, emissiveIntensity: i === 0 ? .9 : .12, transparent: true, opacity: .92 }), -W + .05, D / 2 - .06, deckZ + z)));
    g.push(cyl(.024, .012, dark, -W + .05, D / 2 - .06, deckZ + .395)); add("tower", ...g); }
  /* ---------------- module B (x > 0): gantry + tools, viscometer, mixer, pumps, flow line */
  const [g3030, pen, powder, eco, visco, mixer, pumpR, pumpP, flow] = await Promise.all([
    model("cnc3030", .42, .1, deckZ), model("lab-formulator-pen-assembly", .06, .3, deckZ + .05), model("powder", .06, .17, deckZ + .05), model("ecopen", .06, .04, deckZ + .05),
    model("lab-cnc-viscometer", 1.18, .17, deckZ, Math.PI / 2), model("mixer", 1.45, -.28, deckZ), model("reciprocating-pump", .84, -.3, deckZ),
    model("peristaltic-pump", .55, -.32, deckZ), model("sensirion-slf3s", .64, -.2, deckZ + .02)]);
  add("gantry", g3030); add("visco", visco); add("mixer", mixer); add("pumpR", pumpR); add("pumpP", pumpP); add("flow", flow);
  // tool stand that parks the three dispensing tools
  { const alu = std(0xb9c0c8, { metalness: .55, roughness: .35 }); add("dispensers", box(.1, .4, .012, alu, .06, .17, deckZ), box(.02, .4, .05, alu, .06, .17, deckZ + .012), pen, powder, eco); }
  // the liquid line: peristaltic pump -> reciprocating pump -> flow sensor -> viscometer
  { const z = deckZ + .03, pts = [[.55, -.32], [.66, -.36], [.84, -.36], [.66, -.2], [.9, -.08], [1.05, .05]].map(([x, y]) => new THREE.Vector3(x, y, z));
    add("flow", new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, .005, 8), std(0x86c5ef, { roughness: .2, transparent: true, opacity: .9 }))); }
  // e-stop on the front edge
  { const es = []; es.push(box(.07, .05, .07, std(0xf2c230), 1.08, -D / 2 + .05, deckZ)); const m = cyl(.026, .022, std(0xd42a1d), 1.08, -D / 2 + .05, deckZ + .07); es.push(m); add("estop", ...es); }
  for (const [id, g] of Object.entries(parts)) { g.name = id; P.add(g); }
  const bb = new THREE.Box3().setFromObject(P), sz = bb.getSize(new THREE.Vector3());
  return { group: P, parts, info: PLATFORM_INFO, size: [sz.x, sz.y, sz.z], deckZ };
}
