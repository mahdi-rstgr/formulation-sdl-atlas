/* The self-driving laboratory in 3D: the physical cell from CAD plus the digital and intelligence infrastructure
 * around it. Presentation only; the scientific content lives in data/sdl-workflow.js.
 *
 *   const scene = await createSDLScene(hostElement, { root: "./", onProgress });
 *   scene.setStage(stage, stageIndex, allStages);   // reveal, highlight, frame, connect
 *   scene.setSafety(true | false);                    // safety layer on top of any stage
 *
 * Actors appear at the stage that introduces them and stay as grey context afterwards; the current stage's actors
 * are shown in full colour and framed by the camera. Connections are animated: data (beet), commands (graphite),
 * model proposals (green) and safety gates (amber, with a shield).
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const C = { beet: 0xB82E5C, command: 0x45454d, model: 0x4E9A3A, gate: 0xD08A00, ghost: 0xc9c9cf, screen: 0x0f1115 };
const LINK = { data: C.beet, command: C.command, model: C.model, gate: C.gate };
const NAMES = {
  frame: "T-slot frame and deck", gantry: "Gantry and tool changer", dispensers: "Dispensing tools", arm: "Overhead UR3",
  balance: "Analytical balances", mixer: "Planetary mixer", ot2: "Opentrons OT-2", benchL: "Bench", benchR: "Characterization bench",
  pumpP: "Peristaltic pump", pumpR: "Reciprocating pump", visco: "Gantry viscometer", inline: "Inline viscometer", flow: "Flow sensor",
  cnc3030: "3030 gantry", sensors: "Process sensors", twin: "Digital twin", controller: "Orchestration controller",
  datacenter: "Data centre", ml: "Models and optimization", agents: "AI agents", safety: "Safety layer", estop: "Emergency stop",
};

const dec = b => { const s = atob(b), a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a.buffer; };
function meshesFromDoc(doc) {
  const out = [];
  for (const p of doc.parts) {
    const q = new Uint16Array(dec(p.v)), pos = new Float32Array(q.length);
    for (let i = 0; i < q.length; i++) pos[i] = q[i] * doc.scale[i % 3] + doc.offset[i % 3];
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setIndex(new THREE.BufferAttribute(new Uint32Array(dec(p.f)), 1)); g.computeVertexNormals(); g.computeBoundingBox();
    out.push({ g, color: p.color, name: p.name || "" });
  }
  return out;
}
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .55, metalness: .08, transparent: true, ...o });
function box(w, d, h, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, d, h), mat); m.position.set(x, y, z + h / 2); return m; }
function canvasTex(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { c, x: c.getContext("2d"), t }; }

export async function createSDLScene(host, { root = "./", onProgress = () => { } } = {}) {
  /* ------------------------------------------------------------------ renderer, camera, light */
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true }); r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.toneMapping = THREE.ACESFilmicToneMapping;
  r.outputColorSpace = THREE.SRGBColorSpace; host.prepend(r.domElement);
  const scene = new THREE.Scene(); const pm = new THREE.PMREMGenerator(r); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8a90, .55)); const key = new THREE.DirectionalLight(0xffffff, 1.35); key.position.set(4, -5, 8); scene.add(key);
  const cam = new THREE.PerspectiveCamera(30, 1, .05, 80); cam.up.set(0, 0, 1);
  const ctl = new OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.maxPolarAngle = Math.PI * .5; ctl.minDistance = .5; ctl.maxDistance = 22;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), new THREE.MeshBasicMaterial({ color: 0xe9e9ee, transparent: true, opacity: .55 })); floor.position.z = -.002; scene.add(floor);
  const grid = new THREE.GridHelper(14, 28, 0xd3d3da, 0xdedee4); grid.rotation.x = Math.PI / 2; grid.position.z = -.001; grid.material.transparent = true; grid.material.opacity = .6; scene.add(grid);

  /* ------------------------------------------------------------------ actors */
  const actors = {};   // id -> { obj, mats: [{m, base}], box, kind }
  function actor(id, obj, opts = {}) {
    scene.add(obj); const mats = [];
    obj.traverse(o => { if (o.isMesh || o.isLine || o.isPoints || o.isSprite) { const list = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of list) { m.transparent = true; mats.push({ m, base: m.color ? m.color.clone() : null, op: m.opacity ?? 1 }); } } });
    const b = new THREE.Box3().setFromObject(obj);
    const a = actors[id] = { id, obj, mats, box: b, cur: 0, goal: 0, mix: 0, mixGoal: 0, keepColor: !!opts.keepColor, ...opts };
    obj.visible = false; return a;
  }
  const load = async f => (await fetch(`${root}data/models/${f}.json`)).json();
  const placed = (doc, x, y, z = 0, rotZ = 0) => { const g = new THREE.Group(); for (const p of meshesFromDoc(doc)) g.add(new THREE.Mesh(p.g, std(p.color))); g.position.set(x, y, z); g.rotation.z = rotZ; return g; };

  onProgress("Loading the Formulator CAD…");
  const fdoc = await load("lab-formulator");
  const groups = {};
  for (const p of meshesFromDoc(fdoc)) { (groups[p.name || "frame"] ??= new THREE.Group()).add(new THREE.Mesh(p.g, std(p.color, { metalness: p.name === "frame" ? .35 : .08 }))); }
  for (const [n, g] of Object.entries(groups)) actor(n, g);
  const F = { w: fdoc.size[0], d: fdoc.size[1], h: fdoc.size[2] };

  onProgress("Loading instruments…");
  const [ot2, bench, pP, pR, visco, inline, flow, cnc3030] = await Promise.all(["ot2", "mcm-9351n11", "peristaltic-pump", "reciprocating-pump", "lab-cnc-viscometer", "lab-inline-viscometer", "sensirion-slf3s", "cnc3030"].map(f => load(f).catch(() => null)));
  // left bench with the OT-2
  const BL = { x: -F.w / 2 - 1.05, w: 1.15, d: .8, h: .9 };
  const benchL = new THREE.Group(); { const top = std(0xd9d9de), leg = std(0x9aa0a8, { metalness: .5 });
    benchL.add(box(BL.w, BL.d, .04, top, 0, 0, BL.h - .04)); for (const sx of [-1, 1]) for (const sy of [-1, 1]) benchL.add(box(.04, .04, BL.h - .04, leg, sx * (BL.w / 2 - .05), sy * (BL.d / 2 - .05), 0)); benchL.position.set(BL.x, 0, 0); }
  actor("benchL", benchL);
  if (ot2) actor("ot2", placed(ot2, BL.x, 0, BL.h));
  // right characterization bench (McMaster T-slot workstation) with pumps, sensor and viscometers on top
  const BR = { x: F.w / 2 + 1.15, h: bench ? bench.size[2] : .95, w: bench ? bench.size[0] : 1.6, d: bench ? bench.size[1] : .85 };
  if (bench) actor("benchR", placed(bench, BR.x, 0, 0)); else actor("benchR", box(BR.w, BR.d, BR.h, std(0xc9c6bd), BR.x, 0, 0));
  const slots = []; let sx = BR.x - BR.w / 2 + .08;
  const put = (id, doc, y = 0, gap = .06) => { if (!doc) return; const w = doc.size[0]; const x = sx + w / 2; sx += w + gap; slots.push([id, x]); actor(id, placed(doc, x, y, BR.h)); return x; };
  const xP = put("pumpP", pP, -.12); const xR = put("pumpR", pR, -.12);
  const xI = put("inline", inline, -.1); const xF = put("flow", flow, -.22, .08);
  // the liquid line: pumps -> flow sensor -> inline viscometer, as a tube on the bench
  if (pP && inline && flow) { const zt = BR.h + .05, pts = [[xP, -.3], [xR, -.32], [xF, -.3], [xI, -.28]].map(([x, y]) => new THREE.Vector3(x, y, zt));
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, .008, 8), std(0x7fb6d9, { roughness: .2, opacity: .9 })); actors.flow.obj.add(tube); tube.position.set(-actors.flow.obj.position.x, -actors.flow.obj.position.y, -actors.flow.obj.position.z); }
  // gantry viscometer and the compact 3030 gantry stand on the floor beyond the bench
  const xV = BR.x + BR.w / 2 + .5;
  if (visco) actor("visco", placed(visco, xV, -.05, 0));
  if (cnc3030) actor("cnc3030", placed(cnc3030, xV, visco ? visco.size[1] / 2 + cnc3030.size[1] / 2 + .25 : 0, 0));

  /* ------------------------------------------------------------------ process sensors: markers that pulse */
  const sensors = new THREE.Group(); const sensorDots = [];
  const sensorAt = (id, label) => { const a = actors[id]; if (!a) return; const b = new THREE.Box3().setFromObject(a.obj), c = b.getCenter(new THREE.Vector3()); c.z = b.max.z + .06;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(.03, 16, 12), new THREE.MeshBasicMaterial({ color: C.beet })); dot.position.copy(c);
    const ring = new THREE.Mesh(new THREE.RingGeometry(.05, .058, 40), new THREE.MeshBasicMaterial({ color: C.beet, side: THREE.DoubleSide })); ring.position.copy(c); ring.lookAt(c.clone().add(new THREE.Vector3(0, 0, 1)));
    sensors.add(dot, ring); sensorDots.push({ dot, ring, label }); };
  for (const [id, l] of [["balance", "mass"], ["mixer", "torque"], ["dispensers", "pressure"], ["inline", "viscosity"], ["flow", "flow"], ["visco", "viscosity"]]) sensorAt(id, l);
  actor("sensors", sensors, { keepColor: true });

  /* ------------------------------------------------------------------ digital twin: a desk monitor showing a live simulated copy of the cell */
  const RT = new THREE.WebGLRenderTarget(640, 360); RT.texture.colorSpace = THREE.SRGBColorSpace;
  const tScene = new THREE.Scene(); tScene.background = new THREE.Color(0x0e1a26);
  tScene.add(new THREE.HemisphereLight(0xbfe3ff, 0x0e1a26, 1.1));
  const twinMat = new THREE.MeshLambertMaterial({ color: 0x7cc4ff, transparent: true, opacity: .55, depthWrite: false });
  const twinEdge = new THREE.MeshBasicMaterial({ color: 0x7cc4ff, wireframe: true, transparent: true, opacity: .08 });
  for (const g of Object.values(groups)) for (const m of g.children) { tScene.add(new THREE.Mesh(m.geometry, twinMat)); tScene.add(new THREE.Mesh(m.geometry, twinEdge)); }
  const tGrid = new THREE.GridHelper(4, 16, 0x2f5576, 0x1d3448); tGrid.rotation.x = Math.PI / 2; tScene.add(tGrid);
  const path = new THREE.CatmullRomCurve3([[-.45, -.1, .95], [-.2, .15, 1.25], [.15, .2, 1.3], [.45, .05, .95]].map(p => new THREE.Vector3(...p)));
  const plan = new THREE.Line(new THREE.BufferGeometry().setFromPoints(path.getPoints(60)), new THREE.LineDashedMaterial({ color: 0xffd166, dashSize: .04, gapSize: .025 })); plan.computeLineDistances(); tScene.add(plan);
  const cupT = new THREE.Mesh(new THREE.SphereGeometry(.04, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd166 })); tScene.add(cupT);
  const tCam = new THREE.PerspectiveCamera(34, 16 / 9, .05, 30); tCam.up.set(0, 0, 1);
  const twin = new THREE.Group(); const TW = { x: -F.w / 2 - .9, y: -F.d / 2 - 1.35 };
  { const desk = std(0xe3e3e8), dark = std(0x26272b);
    twin.add(box(1.5, .7, .04, desk, 0, 0, .72)); for (const sx2 of [-1, 1]) twin.add(box(.04, .62, .72, std(0x9aa0a8, { metalness: .5 }), sx2 * .7, 0, 0));
    twin.add(box(.06, .06, .3, dark, 0, .12, .76)); const bez = box(1.02, .04, .6, dark, 0, .1, 1.02); twin.add(bez);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(.96, .54), new THREE.MeshBasicMaterial({ map: RT.texture, toneMapped: false })); scr.rotation.x = Math.PI / 2; scr.position.set(0, .077, 1.32); twin.add(scr);
    twin.add(box(.5, .18, .02, dark, 0, -.15, .76)); twin.position.set(TW.x, TW.y, 0); twin.rotation.z = .35; }
  actor("twin", twin);

  /* ------------------------------------------------------------------ orchestration controller: a cabinet with a workflow screen */
  const ctrlTex = canvasTex(256, 320);
  const controller = new THREE.Group(); const CT = { x: 0, y: -F.d / 2 - 1.05 };
  { const dark = std(0x2a2b30, { metalness: .3 }); controller.add(box(.5, .4, 1.1, dark, 0, 0, 0));
    const s = new THREE.Mesh(new THREE.PlaneGeometry(.38, .48), new THREE.MeshBasicMaterial({ map: ctrlTex.t, toneMapped: false })); s.rotation.x = Math.PI / 2; s.position.set(0, -.202, .78); controller.add(s);
    for (let i = 0; i < 4; i++) controller.add(box(.38, .01, .04, std(0x4a4b52), 0, -.2, .12 + i * .08)); controller.position.set(CT.x, CT.y, 0); }
  actor("controller", controller);

  /* ------------------------------------------------------------------ data centre: racks with live LEDs */
  const rackTex = canvasTex(128, 512);
  const datacenter = new THREE.Group(); const DC = { x: F.w / 2 + .55, y: F.d / 2 + 1.25 };
  { const shell = std(0x1f2024, { metalness: .4, roughness: .4 });
    for (let i = 0; i < 3; i++) { const rk = new THREE.Group(); rk.add(box(.6, .9, 2.0, shell, 0, 0, 0));
      const face = new THREE.Mesh(new THREE.PlaneGeometry(.52, 1.86), new THREE.MeshBasicMaterial({ map: rackTex.t, toneMapped: false })); face.rotation.x = Math.PI / 2; face.position.set(0, -.452, 1.0); rk.add(face);
      rk.position.set((i - 1) * .66, 0, 0); datacenter.add(rk); }
    datacenter.position.set(DC.x, DC.y, 0); }
  actor("datacenter", datacenter);

  /* ------------------------------------------------------------------ models and optimization: a large display beside the racks */
  const mlTex = canvasTex(960, 540);
  const ml = new THREE.Group(); const ML = { x: DC.x + 1.85, y: DC.y - .15 };
  { const dark = std(0x26272b); ml.add(box(.08, .08, 1.0, dark, 0, .02, 0)); ml.add(box(.6, .4, .03, dark, 0, .02, 0)); ml.add(box(1.36, .05, .8, dark, 0, 0, 1.0));
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.3, .73), new THREE.MeshBasicMaterial({ map: mlTex.t, toneMapped: false })); s.rotation.x = Math.PI / 2; s.position.set(0, -.027, 1.4); ml.add(s); ml.position.set(ML.x, ML.y, 0); ml.rotation.z = -.25; }
  actor("ml", ml);

  /* ------------------------------------------------------------------ AI agents: a workstation with three displays */
  const agTex = [0, 1, 2].map(() => canvasTex(512, 320));
  const agents = new THREE.Group(); const AG = { x: F.w / 2 + 1.25, y: -F.d / 2 - 1.45 };
  { const desk = std(0xe3e3e8), dark = std(0x26272b);
    agents.add(box(1.9, .75, .04, desk, 0, 0, .72)); for (const sx2 of [-1, 1]) agents.add(box(.04, .66, .72, std(0x9aa0a8, { metalness: .5 }), sx2 * .9, 0, 0));
    [-1, 0, 1].forEach((k, i) => { const g = new THREE.Group(); g.add(box(.06, .06, .28, dark, 0, .05, 0)); g.add(box(.62, .035, .38, dark, 0, 0, .28));
      const s = new THREE.Mesh(new THREE.PlaneGeometry(.58, .34), new THREE.MeshBasicMaterial({ map: agTex[i].t, toneMapped: false })); s.rotation.x = Math.PI / 2; s.position.set(0, -.019, .47); g.add(s);
      g.position.set(k * .62, .12 + Math.abs(k) * -.06, .76); g.rotation.z = -k * .32; agents.add(g); });
    const person = new THREE.Group(); const skin = std(0xbfa58f), coat = std(0xf4f4f5); person.add(box(.34, .22, .6, coat, 0, 0, .55)); const head = new THREE.Mesh(new THREE.SphereGeometry(.1, 20, 16), skin); head.position.z = 1.28; person.add(head);
    person.add(box(.3, .2, .55, std(0x3a3b40), 0, 0, 0)); person.position.set(0, -.72, 0); agents.add(person);
    agents.position.set(AG.x, AG.y, 0); agents.rotation.z = -.35; }
  actor("agents", agents);

  /* ------------------------------------------------------------------ safety layer */
  const safety = new THREE.Group();
  { const pc = new THREE.MeshStandardMaterial({ color: 0x9fc3d6, transparent: true, opacity: .14, roughness: .1, metalness: 0, side: THREE.DoubleSide, depthWrite: false });
    const h = 1.75, w = F.w * .96, d = F.d * .94, z0 = .12;
    for (const [px, py, rw, rot] of [[0, -d / 2, w, 0], [0, d / 2, w, 0], [-w / 2, 0, d, Math.PI / 2], [w / 2, 0, d, Math.PI / 2]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(rw, h), pc); p.rotation.x = Math.PI / 2; p.rotation.y = rot; p.position.set(px, py, z0 + h / 2); safety.add(p); }
    const beam = new THREE.LineBasicMaterial({ color: 0xe0402f, transparent: true, opacity: .75 });
    for (let i = 0; i < 9; i++) { const z = .3 + i * .16; safety.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-w / 2, -d / 2 - .02, z), new THREE.Vector3(w / 2, -d / 2 - .02, z)]), beam)); }
    for (const sx2 of [-1, 1]) safety.add(box(.04, .04, 1.6, std(0xf2c230), sx2 * w / 2, -d / 2 - .02, .2));
    const es = new THREE.Group(); es.add(box(.1, .08, .1, std(0xf2c230), 0, 0, 0)); const mush = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .03, 24), std(0xd42a1d)); mush.rotation.x = Math.PI / 2; mush.position.set(0, -.055, .05); es.add(mush);
    es.position.set(w / 2 + .05, -d / 2 - .06, 1.05); safety.add(es);
    const tray = new THREE.Mesh(new THREE.BoxGeometry(Math.max(.5, (xI ?? BR.x) - (xP ?? BR.x) + .5), .55, .03), std(0xf2c230, { opacity: .55 })); tray.position.set(((xP ?? BR.x) + (xI ?? BR.x)) / 2, -.1, BR.h + .015); safety.add(tray);
    if (actors.arm) { const ab = new THREE.Box3().setFromObject(actors.arm.obj), c = ab.getCenter(new THREE.Vector3()); const halo = new THREE.Mesh(new THREE.TorusGeometry(Math.max(.25, ab.getSize(new THREE.Vector3()).length() * .45), .008, 8, 80), new THREE.MeshBasicMaterial({ color: C.gate })); halo.position.copy(c); safety.add(halo); safety.userData.halo = halo; } }
  actor("safety", safety, { keepColor: true });
  actors.estop = { box: new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(F.w * .48 + .05, -F.d * .47 - .06, 1.1), new THREE.Vector3(.1, .1, .1)), obj: null, mats: [] };

  /* ------------------------------------------------------------------ links (animated connections) */
  const linkGroup = new THREE.Group(); scene.add(linkGroup);
  const center = id => { const a = actors[id]; if (!a) return null; const b = a.obj ? new THREE.Box3().setFromObject(a.obj) : a.box; const c = b.getCenter(new THREE.Vector3()); c.z = Math.min(b.max.z, Math.max(.4, c.z)); return c; };
  let links = [];
  const shieldTex = (() => { const t = canvasTex(128, 128), x = t.x; x.fillStyle = "#D08A00"; x.beginPath(); x.moveTo(64, 10); x.lineTo(112, 28); x.quadraticCurveTo(110, 92, 64, 118); x.quadraticCurveTo(18, 92, 16, 28); x.closePath(); x.fill();
    x.strokeStyle = "#fff"; x.lineWidth = 11; x.lineCap = "round"; x.lineJoin = "round"; x.beginPath(); x.moveTo(42, 64); x.lineTo(58, 80); x.lineTo(88, 48); x.stroke(); t.t.needsUpdate = true; return t.t; })();
  function setLinks(list) {
    for (const l of links) { linkGroup.remove(l.g); l.g.traverse(o => { o.geometry?.dispose(); }); } links = [];
    for (const [a, b, kind] of list || []) { const p = center(a), q = center(b); if (!p || !q) continue;
      const mid = p.clone().lerp(q, .5); mid.z = Math.max(p.z, q.z) + .35 + p.distanceTo(q) * .12;
      const curve = new THREE.QuadraticBezierCurve3(p, mid, q), g = new THREE.Group(), col = LINK[kind] || C.command;
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)), new THREE.LineDashedMaterial({ color: col, dashSize: .05, gapSize: .035, transparent: true, opacity: .9 })); line.computeLineDistances(); g.add(line);
      const dots = [0, 1, 2].map(i => { const d = new THREE.Mesh(new THREE.SphereGeometry(kind === "data" ? .022 : .018, 12, 10), new THREE.MeshBasicMaterial({ color: col })); g.add(d); return d; });
      let sh = null; if (kind === "gate") { sh = new THREE.Sprite(new THREE.SpriteMaterial({ map: shieldTex, depthTest: false })); sh.scale.set(.16, .16, 1); sh.position.copy(curve.getPoint(.5)); sh.renderOrder = 10; g.add(sh); }
      linkGroup.add(g); links.push({ g, curve, dots, kind, sh }); }
  }

  /* ------------------------------------------------------------------ screens (canvas textures) */
  const mono = '500 15px "Roboto Mono", ui-monospace, monospace';
  function drawController(t) { const x = ctrlTex.x, W = 256, H = 320; x.fillStyle = "#101216"; x.fillRect(0, 0, W, H); x.fillStyle = "#e4e4e7"; x.font = '600 15px Inter, sans-serif'; x.fillText("Orchestration · L3", 14, 26);
    const steps = ["Dose paste", "Dose powder", "Weigh", "Move to mixer", "Mix 90 s", "Measure viscosity", "Store record"], k = Math.floor(t / 1.2) % steps.length;
    x.font = mono; steps.forEach((s, i) => { x.fillStyle = i < k ? "#4ADE80" : i === k ? "#FFD166" : "#6b6b73"; x.fillText(`${i < k ? "✓" : i === k ? "▶" : "·"} ${s}`, 14, 60 + i * 34); });
    x.fillStyle = "#E0679A"; x.fillText("SiLA 2 · REST · ROS 2", 14, H - 16); ctrlTex.t.needsUpdate = true; }
  function drawRack(t) { const x = rackTex.x; x.fillStyle = "#15161a"; x.fillRect(0, 0, 128, 512);
    for (let u = 0; u < 22; u++) { const y = 8 + u * 23; x.fillStyle = "#24262c"; x.fillRect(6, y, 116, 18);
      for (let k = 0; k < 6; k++) { const on = Math.sin(t * (3 + k) + u * 1.7 + k) > .2; x.fillStyle = on ? (k % 3 ? "#4ADE80" : "#E0679A") : "#2f3138"; x.fillRect(12 + k * 9, y + 6, 5, 5); }
      x.fillStyle = "#3a3c44"; x.fillRect(74, y + 5, 40, 7); } rackTex.t.needsUpdate = true; }
  const obs = []; for (let i = 0; i < 6; i++) obs.push(.08 + i * .16 + Math.sin(i * 7) * .03);
  const f = u => .55 + .28 * Math.sin(6.3 * u + .6) * Math.exp(-1.2 * u) + .12 * u;
  function drawML(t) { const x = mlTex.x, W = 960, H = 540; x.fillStyle = "#101216"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#e4e4e7"; x.font = '600 26px Inter, sans-serif'; x.fillText("Surrogate model and acquisition", 36, 50);
    x.font = '400 18px Inter, sans-serif'; x.fillStyle = "#a1a1aa"; x.fillText("Gaussian process · Bayesian optimization", 36, 80);
    const L = 60, R = W - 40, T = 110, B = 380, n = 2 + Math.floor(t / 1.6) % obs.length, pts = obs.slice(0, n);
    const X = u => L + u * (R - L), Y = v => B - v * (B - T);
    x.strokeStyle = "#3a3c44"; x.lineWidth = 1; x.beginPath(); x.moveTo(L, T); x.lineTo(L, B); x.lineTo(R, B); x.stroke();
    const sd = u => .03 + .22 * Math.min(1, Math.min(...pts.map(p => Math.abs(u - p))) * 5);
    x.fillStyle = "rgba(184,46,92,.22)"; x.beginPath(); for (let i = 0; i <= 100; i++) { const u = i / 100; x.lineTo(X(u), Y(f(u) + sd(u))); } for (let i = 100; i >= 0; i--) { const u = i / 100; x.lineTo(X(u), Y(f(u) - sd(u))); } x.fill();
    x.strokeStyle = "#E0679A"; x.lineWidth = 3; x.beginPath(); for (let i = 0; i <= 100; i++) { const u = i / 100; x[i ? "lineTo" : "moveTo"](X(u), Y(f(u))); } x.stroke();
    x.fillStyle = "#F4F4F5"; for (const p of pts) { x.beginPath(); x.arc(X(p), Y(f(p)), 7, 0, 7); x.fill(); }
    let best = 0, bu = 0; const A = u => f(u) + 1.6 * sd(u); for (let i = 0; i <= 100; i++) { const u = i / 100; if (A(u) > best) { best = A(u); bu = u; } }
    const T2 = 420, B2 = 500; x.strokeStyle = "#4E9A3A"; x.lineWidth = 3; x.beginPath(); for (let i = 0; i <= 100; i++) { const u = i / 100, v = (A(u) - .3) / 1.0; x[i ? "lineTo" : "moveTo"](X(u), B2 - Math.max(0, v) * (B2 - T2)); } x.stroke();
    x.strokeStyle = "#FFD166"; x.setLineDash([8, 6]); x.beginPath(); x.moveTo(X(bu), T); x.lineTo(X(bu), B2); x.stroke(); x.setLineDash([]);
    x.fillStyle = "#FFD166"; x.font = '600 18px Inter, sans-serif'; x.fillText("next experiment", Math.min(X(bu) + 10, R - 160), T + 20);
    x.fillStyle = "#a1a1aa"; x.font = mono; x.fillText("composition →", R - 150, B + 26); x.fillText("acquisition", L + 6, T2 - 8); mlTex.t.needsUpdate = true; }
  const AGENTS = [["Campaign designer", "DRAFT", ["Goal: lower viscosity, keep yield stress", "Ingredients: 6 · bounds set", "Dry run in twin: 24 / 24 feasible", "Waiting for scientist approval ▶"]],
    ["Laboratory copilot", "INFORM", ["Run 18: mixing 90 s", "Why rejected? Cup out of reach", "Validation: twin clearance 14 mm", "Next: viscosity at 25 °C"]],
    ["Recovery advisor", "DRAFT", ["Fault: pen stall at 0.8 bar", "Context: lot B12, 31 °C", "Option 1: purge and retry", "Operator decides ▶"]]];
  function drawAgents(t) { AGENTS.forEach(([name, lvl, lines], i) => { const x = agTex[i].x, W = 512, H = 320; x.fillStyle = "#101216"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#e4e4e7"; x.font = '600 24px Inter, sans-serif'; x.fillText(name, 20, 40); x.fillStyle = lvl === "INFORM" ? "#4ADE80" : "#FFD166"; x.font = '600 15px Inter, sans-serif'; x.fillText(lvl, W - 90, 38);
    const shown = Math.floor((t * 1.4 + i * 1.3) % (lines.length + 2)); x.font = '400 19px "Roboto Mono", monospace';
    lines.slice(0, shown).forEach((l, k) => { x.fillStyle = l.endsWith("▶") ? "#FFD166" : "#c4c4cc"; x.fillText(l, 20, 92 + k * 46); });
    agTex[i].t.needsUpdate = true; }); }

  /* ------------------------------------------------------------------ labels for the current stage (HTML, projected) */
  const labelBox = document.createElement("div"); labelBox.className = "sdl-labels"; host.append(labelBox); let labels = [];
  function setLabels(ids) { labelBox.innerHTML = ""; labels = ids.filter(id => NAMES[id] && actors[id]).map(id => { const el = document.createElement("span"); el.textContent = NAMES[id]; labelBox.append(el);
    const b = actors[id].obj ? new THREE.Box3().setFromObject(actors[id].obj) : actors[id].box; const p = b.getCenter(new THREE.Vector3()); p.z = b.max.z + .08; return { el, p }; }); }

  /* ------------------------------------------------------------------ stage logic */
  let curStage = null, safetyOn = false, goal = null, userMoved = false, loopT = 0, loopPath = null;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;   // apply stages instantly, no camera flights
  const ghost = new THREE.Color(C.ghost);
  function frameBox(b) { const c = b.getCenter(new THREE.Vector3()), rad = b.getSize(new THREE.Vector3()).length() / 2, vf = cam.fov * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * cam.aspect);
    const dist = rad / Math.sin(Math.min(vf, hf) / 2) * .95, dir = new THREE.Vector3(.55, -1.35, .78).normalize(); goal = { t: c, p: c.clone().add(dir.multiplyScalar(Math.max(1.2, dist))) }; }
  function paintScreens(tt) { drawController(tt); drawRack(tt); drawML(tt); drawAgents(tt); }
  function setStage(stage, idx, all) {
    curStage = stage; userMoved = false; paintScreens(t + 3);
    const introduced = new Set(); all.slice(0, idx + 1).forEach(s => s.show.forEach(id => introduced.add(id)));
    const focus = new Set(stage.focus);
    for (const [id, a] of Object.entries(actors)) { if (!a.obj) continue;
      const isSafety = id === "safety", visible = isSafety ? (safetyOn || stage.safetyAll) : (introduced.has(id) || focus.has(id));
      a.goal = visible ? 1 : 0; a.mixGoal = focus.has(id) || stage.loop || (isSafety && visible) ? 0 : 1; }
    setLinks(stage.links); setLabels(stage.focus);
    const b = new THREE.Box3(); for (const id of stage.focus) { const a = actors[id]; if (a?.obj) b.union(new THREE.Box3().setFromObject(a.obj)); else if (a) b.union(a.box); }
    if (!b.isEmpty()) frameBox(b);
    if (still) { for (const a of Object.values(actors)) { a.cur = a.goal; a.mix = a.mixGoal; } if (goal) { cam.position.copy(goal.p); ctl.target.copy(goal.t); goal = null; } }
    loopPath = stage.loop ? new THREE.CatmullRomCurve3(["ml", "controller", "twin", "frame", "balance", "controller", "datacenter", "ml"].map(center).filter(Boolean), true) : null;
  }
  function setSafety(v) { safetyOn = v; if (curStage) { const a = actors.safety; a.goal = v || curStage.safetyAll ? 1 : 0; a.mixGoal = 0; } }
  const loopDot = new THREE.Mesh(new THREE.SphereGeometry(.05, 16, 12), new THREE.MeshBasicMaterial({ color: C.beet })); loopDot.visible = false; scene.add(loopDot);
  r.domElement.addEventListener("pointerdown", () => { userMoved = true; goal = null; });
  r.domElement.addEventListener("wheel", () => { userMoved = true; goal = null; }, { passive: true });

  paintScreens(3);   // screens show content from the first frame, then animate

  /* ------------------------------------------------------------------ resize, loop */
  function resize() { const w = host.clientWidth, h = host.clientHeight; r.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(host); resize();
  const all = new THREE.Box3(); for (const a of Object.values(actors)) if (a.obj) all.union(new THREE.Box3().setFromObject(a.obj)); frameBox(all); cam.position.copy(goal.p); ctl.target.copy(goal.t);
  let vis = true; new IntersectionObserver(es => vis = es[0].isIntersecting).observe(host);
  const clock = new THREE.Clock(); let t = 0, lastScreens = 0, frame = 0;
  (function loop() { requestAnimationFrame(loop); if (!vis) return; const dt = Math.min(clock.getDelta(), .05); t += dt;
    for (const a of Object.values(actors)) { if (!a.obj) continue;
      a.cur += (a.goal - a.cur) * Math.min(1, dt * 5); a.mix += (a.mixGoal - a.mix) * Math.min(1, dt * 5);
      a.obj.visible = a.cur > .01; if (!a.obj.visible) continue; a.obj.scale.setScalar(.92 + .08 * a.cur);
      for (const { m, base, op } of a.mats) { if (base && !a.keepColor) m.color.copy(base).lerp(ghost, a.mix * .85); m.opacity = op * a.cur * (1 - a.mix * .72); m.depthWrite = a.mix < .5 && a.cur > .9; } }
    for (const { dot, ring } of sensorDots) { const s = 1 + .5 * Math.abs(Math.sin(t * 3)); ring.scale.setScalar(s); ring.material.opacity = (1 - Math.abs(Math.sin(t * 3)) * .7) * actors.sensors.cur; }
    if (safety.userData.halo) safety.userData.halo.rotation.z = t * .4;
    for (const l of links) l.dots.forEach((d, i) => d.position.copy(l.curve.getPoint(((t * .35) + i / 3) % 1)));
    if (loopPath) { loopDot.visible = true; loopT = (loopT + dt * .07) % 1; loopDot.position.copy(loopPath.getPoint(loopT)); } else loopDot.visible = false;
    if (goal && !userMoved) { cam.position.lerp(goal.p, Math.min(1, dt * 2.6)); ctl.target.lerp(goal.t, Math.min(1, dt * 2.6)); if (cam.position.distanceTo(goal.p) < .01) goal = null; }
    ctl.update();
    if (t - lastScreens > .1) { lastScreens = t;
      if (actors.controller.obj.visible) drawController(t); if (actors.datacenter.obj.visible) drawRack(t); if (actors.ml.obj.visible) drawML(t); if (actors.agents.obj.visible) drawAgents(t); }
    if (actors.twin.obj.visible && (frame++ % 3 === 0)) { cupT.position.copy(path.getPoint((Math.sin(t * .6) + 1) / 2)); tCam.position.set(Math.cos(t * .15) * 3.1, Math.sin(t * .15) * 3.1 - .2, 2.0); tCam.lookAt(0, 0, .9);
      r.setRenderTarget(RT); r.render(tScene, tCam); r.setRenderTarget(null); }
    r.render(scene, cam);
    const rect = host.getBoundingClientRect(), v = new THREE.Vector3();
    for (const lb of labels) { v.copy(lb.p).project(cam); const show = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05; lb.el.style.opacity = show ? 1 : 0;
      lb.el.style.transform = `translate(${(v.x + 1) / 2 * rect.width}px,${(1 - v.y) / 2 * rect.height}px) translate(-50%,-120%)`; }
  })();
  onProgress("");
  return { setStage, setSafety, names: NAMES };
}
