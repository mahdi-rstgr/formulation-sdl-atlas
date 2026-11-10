/* The self-driving laboratory in 3D: the assemblab demonstration platform (assets/platform.js, built from catalogue
 * CAD) on a lab floor, with the digital and intelligence infrastructure around it. Presentation only; the scientific
 * content lives in data/sdl-workflow.js.
 *
 *   const scene = await createSDLScene(hostElement, { root: "./", onProgress });
 *   scene.setStage(stage, stageIndex, allStages);   // reveal, highlight, frame, connect
 *   scene.setSafety(true | false);                    // safety layer on top of any stage
 *
 * A stage with `all: true` (the floor overview) shows everything. Otherwise actors appear at the stage that introduces
 * them and stay as dimmed context afterwards; the current stage's actors are in full colour and framed by the camera.
 * Connections are animated: data (cyan), commands (indigo), model proposals (green), safety gates (amber, shield).
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildPlatform } from "./platform.js";

const C = { data: 0x22D3EE, command: 0x818CF8, model: 0x4ADE80, gate: 0xF59E0B, ghost: 0x556179 };
const LINK = { data: C.data, command: C.command, model: C.model, gate: C.gate };
const NAMES = {
  frame: "T-slot workstations", labware: "Labware", gantry: "Compact gantry", dispensers: "Dispensing tools", ot2: "Opentrons OT-2",
  pumpP: "Peristaltic pump", pumpR: "Reciprocating pump", arm: "Lite 6 cobot", balance: "Analytical balance", mixer: "Planetary mixer",
  visco: "Gantry viscometer", flow: "Flow sensor", tower: "Stack light", estop: "Emergency stop", sensors: "Process sensors",
  twin: "Digital twin", controller: "Orchestration", datacenter: "Data centre", ml: "Models and optimization", agents: "AI agents", safety: "Safety layer",
};

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .55, metalness: .08, transparent: true, ...o });
function box(w, d, h, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, d, h), mat); m.position.set(x, y, z + h / 2); return m; }
function canvasTex(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { c, x: c.getContext("2d"), t }; }

export async function createSDLScene(host, { root = "./", onProgress = () => { } } = {}) {
  /* ------------------------------------------------------------------ renderer, camera, light */
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true }); r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.toneMapping = THREE.ACESFilmicToneMapping;
  r.outputColorSpace = THREE.SRGBColorSpace; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; host.prepend(r.domElement);
  const scene = new THREE.Scene(); const pm = new THREE.PMREMGenerator(r); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3b4660, .5));
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(-3, -4.5, 7); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 5, bottom: -5, near: .5, far: 20 }); key.shadow.bias = -.0005; key.shadow.radius = 4; scene.add(key);
  const rim = new THREE.DirectionalLight(0x9cc3ff, .5); rim.position.set(4, 5, 3); scene.add(rim);
  const cam = new THREE.PerspectiveCamera(30, 1, .05, 80); cam.up.set(0, 0, 1);
  const ctl = new OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.maxPolarAngle = Math.PI * .47; ctl.minDistance = .6; ctl.maxDistance = 18;

  /* ------------------------------------------------------------------ the platform, from catalogue CAD */
  onProgress("Loading the platform CAD…");
  const P = await buildPlatform(THREE, { root, onProgress });
  const F = { w: P.size[0], d: P.size[1], h: P.deckZ }, deck = P.deckZ;
  P.group.updateMatrixWorld(true);

  /* ------------------------------------------------------------------ the lab floor: a slab with lanes and zones */
  const SW = 12, SD = 8, PX = 200;
  const ZONES = { cell: [-F.w / 2 - .55, -F.d / 2 - .55, F.w / 2 + .55, F.d / 2 + .55], control: [-3.0, -3.0, 3.3, -1.25], data: [-.8, 1.25, 3.5, 2.75] };
  {
    const ft = canvasTex(SW * PX, SD * PX), x = ft.x, X = v => (v + SW / 2) * PX, Y = v => (SD / 2 - v) * PX;
    x.fillStyle = "#1A2335"; x.fillRect(0, 0, ft.c.width, ft.c.height);
    for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * .025})`; x.fillRect(Math.random() * ft.c.width, Math.random() * ft.c.height, 2, 2); }
    x.strokeStyle = "rgba(148,163,184,.08)"; x.lineWidth = 2; for (let m = -SW / 2; m <= SW / 2; m++) { x.beginPath(); x.moveTo(X(m), 0); x.lineTo(X(m), ft.c.height); x.stroke(); }
    for (let m = -SD / 2; m <= SD / 2; m++) { x.beginPath(); x.moveTo(0, Y(m)); x.lineTo(ft.c.width, Y(m)); x.stroke(); }
    const rect = ([a, b, c, d]) => [X(a), Y(d), X(c) - X(a), Y(b) - Y(d)];
    // zone tints
    x.fillStyle = "rgba(59,130,246,.10)"; x.fillRect(...rect(ZONES.control)); x.fillStyle = "rgba(109,93,246,.11)"; x.fillRect(...rect(ZONES.data));
    for (const [z, col] of [[ZONES.control, "rgba(96,165,250,.55)"], [ZONES.data, "rgba(139,124,255,.55)"]]) { x.strokeStyle = col; x.lineWidth = 4; x.setLineDash([22, 14]); x.strokeRect(...rect(z)); } x.setLineDash([]);
    // hatched safety border around the cell
    { const [a, b, c, d] = ZONES.cell, t = .14; x.save(); x.beginPath(); x.rect(...rect([a, b, c, d])); x.rect(...rect([a + t, b + t, c - t, d - t])); x.clip("evenodd");
      x.fillStyle = "#F2C230"; x.fillRect(...rect([a, b, c, d])); x.strokeStyle = "#151A24"; x.lineWidth = 16; for (let k = -2000; k < 4000; k += 44) { x.beginPath(); x.moveTo(X(a) + k, Y(b) + 10); x.lineTo(X(a) + k + 600, Y(b) - 590); x.stroke(); } x.restore();
      x.fillStyle = "rgba(242,194,48,.05)"; x.fillRect(...rect([a + t, b + t, c - t, d - t])); }
    // aisles: yellow edge lines with direction arrows
    for (const [y0, y1] of [[-1.15, -.82], [.82, 1.15]]) { x.fillStyle = "#E8B923"; for (const y of [y0, y1]) x.fillRect(X(-SW / 2 + .4), Y(y) - 5, (SW - .8) * PX, 10);
      x.fillStyle = "rgba(255,255,255,.35)"; const yc = Y((y0 + y1) / 2); for (let m = -5; m < 5.5; m += 1.4) { x.beginPath(); x.moveTo(X(m), yc - 14); x.lineTo(X(m) + 34, yc); x.lineTo(X(m), yc + 14); x.closePath(); x.fill(); } }
    // floor lettering
    x.font = '600 64px "Space Grotesk", Inter, sans-serif'; x.textBaseline = "alphabetic";
    const word = (s, vx, vy, col = "rgba(226,232,240,.32)") => { x.fillStyle = col; x.fillText(s, X(vx), Y(vy)); };
    word("SELF-DRIVING CELL", ZONES.cell[0] + .25, ZONES.cell[3] - .32, "rgba(242,194,48,.55)");
    word("CONTROL · TWIN · AGENTS", ZONES.control[0] + .2, ZONES.control[1] + .2, "rgba(147,197,253,.5)");
    word("DATA · MODELS", ZONES.data[0] + .2, ZONES.data[3] - .4, "rgba(196,181,253,.55)");
    ft.t.needsUpdate = true;
    const side = new THREE.MeshStandardMaterial({ color: 0x2A3550, roughness: .8 }), top = new THREE.MeshStandardMaterial({ map: ft.t, roughness: .85, metalness: 0 });
    const slab = new THREE.Mesh(new THREE.BoxGeometry(SW, SD, .16), [side, side, side, side, top, side]); slab.position.z = -.08; slab.receiveShadow = true; scene.add(slab);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry), new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: .35 })); edge.position.copy(slab.position); scene.add(edge);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(SW, SD), new THREE.ShadowMaterial({ opacity: .45 })); sh.position.z = .002; sh.receiveShadow = true; scene.add(sh);
  }

  /* ------------------------------------------------------------------ actors */
  const actors = {};   // id -> { obj, mats: [{m, base}], cur, goal, mix, mixGoal }
  function actor(id, obj, opts = {}) {
    scene.add(obj); const mats = [];
    obj.traverse(o => { if (o.isMesh && !opts.noShadow) { o.castShadow = true; o.receiveShadow = true; }
      if (o.isMesh || o.isLine || o.isPoints || o.isSprite) { const list = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of list) { m.transparent = true; mats.push({ m, base: m.color ? m.color.clone() : null, op: m.opacity ?? 1 }); } } });
    const a = actors[id] = { id, obj, mats, cur: 0, goal: 0, mix: 0, mixGoal: 0, keepColor: !!opts.keepColor, ...opts };
    obj.visible = false; return a;
  }
  const twinSrc = [];
  for (const [id, g] of Object.entries(P.parts)) { g.traverse(o => { if (o.isMesh) twinSrc.push([o.geometry, o.matrixWorld.clone()]); }); actor(id, g); }

  /* ------------------------------------------------------------------ process sensors: markers that pulse */
  const sensors = new THREE.Group(); const sensorDots = [];
  const sensorAt = id => { const a = actors[id]; if (!a) return; const b = new THREE.Box3().setFromObject(a.obj), c = b.getCenter(new THREE.Vector3()); c.z = b.max.z + .06;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(.026, 16, 12), new THREE.MeshBasicMaterial({ color: C.data })); dot.position.copy(c);
    const ring = new THREE.Mesh(new THREE.RingGeometry(.045, .052, 40), new THREE.MeshBasicMaterial({ color: C.data, side: THREE.DoubleSide })); ring.position.copy(c);
    sensors.add(dot, ring); sensorDots.push({ dot, ring }); };
  for (const id of ["balance", "mixer", "dispensers", "flow", "visco"]) sensorAt(id);
  actor("sensors", sensors, { keepColor: true, noShadow: true });

  /* ------------------------------------------------------------------ digital twin: a desk monitor showing a live simulated copy of the platform */
  const RT = new THREE.WebGLRenderTarget(768, 432); RT.texture.colorSpace = THREE.SRGBColorSpace;
  const tScene = new THREE.Scene(); tScene.background = new THREE.Color(0x0B1426);
  tScene.add(new THREE.HemisphereLight(0xbfe3ff, 0x0B1426, 1.2));
  const twinMat = new THREE.MeshLambertMaterial({ color: 0x60A5FA, transparent: true, opacity: .5, depthWrite: false });
  for (const [geo, mw] of twinSrc) { const m = new THREE.Mesh(geo, twinMat); m.matrixAutoUpdate = false; m.matrix.copy(mw); tScene.add(m); }
  const tGrid = new THREE.GridHelper(6, 24, 0x2f5576, 0x1d3448); tGrid.rotation.x = Math.PI / 2; tScene.add(tGrid);
  const path = new THREE.CatmullRomCurve3([[.06, .17, deck + .12], [.4, .1, deck + .42], [.95, -.05, deck + .45], [1.32, -.21, deck + .3]].map(p => new THREE.Vector3(...p)));
  const plan = new THREE.Line(new THREE.BufferGeometry().setFromPoints(path.getPoints(60)), new THREE.LineDashedMaterial({ color: 0xffd166, dashSize: .04, gapSize: .025 })); plan.computeLineDistances(); tScene.add(plan);
  const cupT = new THREE.Mesh(new THREE.SphereGeometry(.035, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd166 })); tScene.add(cupT);
  const tCam = new THREE.PerspectiveCamera(34, 16 / 9, .05, 30); tCam.up.set(0, 0, 1);
  const twin = new THREE.Group(); const TW = { x: -1.95, y: -1.95 };
  const desk = std(0xD7DCE4), dark = std(0x1B2233), legM = std(0x8A94A6, { metalness: .5 });
  { twin.add(box(1.5, .7, .04, desk, 0, 0, .72)); for (const s of [-1, 1]) twin.add(box(.04, .62, .72, legM, s * .7, 0, 0));
    twin.add(box(.06, .06, .3, dark, 0, .12, .76)); twin.add(box(1.02, .04, .6, dark, 0, .1, 1.02));
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(.96, .54), new THREE.MeshBasicMaterial({ map: RT.texture, toneMapped: false })); scr.rotation.x = Math.PI / 2; scr.position.set(0, .077, 1.32); twin.add(scr);
    twin.add(box(.5, .18, .02, dark, 0, -.15, .76)); twin.position.set(TW.x, TW.y, 0); twin.rotation.z = .3; }
  actor("twin", twin);

  /* ------------------------------------------------------------------ orchestration controller: a cabinet with a workflow screen */
  const ctrlTex = canvasTex(256, 320);
  const controller = new THREE.Group();
  { controller.add(box(.5, .4, 1.1, std(0x1E2638, { metalness: .3 }), 0, 0, 0));
    const s = new THREE.Mesh(new THREE.PlaneGeometry(.38, .48), new THREE.MeshBasicMaterial({ map: ctrlTex.t, toneMapped: false })); s.rotation.x = Math.PI / 2; s.position.set(0, -.202, .78); controller.add(s);
    for (let i = 0; i < 4; i++) controller.add(box(.38, .01, .04, std(0x3A4560), 0, -.2, .12 + i * .08)); controller.position.set(-.15, -1.6, 0); }
  actor("controller", controller);

  /* ------------------------------------------------------------------ data centre: racks with live LEDs */
  const rackTex = canvasTex(128, 512);
  const datacenter = new THREE.Group();
  { const shell = std(0x161C2A, { metalness: .4, roughness: .4 });
    for (let i = 0; i < 3; i++) { const rk = new THREE.Group(); rk.add(box(.6, .9, 2.0, shell, 0, 0, 0));
      const face = new THREE.Mesh(new THREE.PlaneGeometry(.52, 1.86), new THREE.MeshBasicMaterial({ map: rackTex.t, toneMapped: false })); face.rotation.x = Math.PI / 2; face.position.set(0, -.452, 1.0); rk.add(face);
      rk.position.set((i - 1) * .66, 0, 0); datacenter.add(rk); }
    datacenter.position.set(2.45, 1.85, 0); }
  actor("datacenter", datacenter);

  /* ------------------------------------------------------------------ models and optimization: a large display beside the racks */
  const mlTex = canvasTex(960, 540);
  const ml = new THREE.Group();
  { ml.add(box(.08, .08, 1.0, dark, 0, .02, 0)); ml.add(box(.6, .4, .03, dark, 0, .02, 0)); ml.add(box(1.36, .05, .8, dark, 0, 0, 1.0));
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.3, .73), new THREE.MeshBasicMaterial({ map: mlTex.t, toneMapped: false })); s.rotation.x = Math.PI / 2; s.position.set(0, -.027, 1.4); ml.add(s); ml.position.set(.35, 1.8, 0); ml.rotation.z = .12; }
  actor("ml", ml);

  /* ------------------------------------------------------------------ AI agents: a workstation with three displays and a scientist */
  const agTex = [0, 1, 2].map(() => canvasTex(512, 320));
  const agents = new THREE.Group();
  { agents.add(box(1.9, .75, .04, desk, 0, 0, .72)); for (const s of [-1, 1]) agents.add(box(.04, .66, .72, legM, s * .9, 0, 0));
    [-1, 0, 1].forEach((k, i) => { const g = new THREE.Group(); g.add(box(.06, .06, .28, dark, 0, .05, 0)); g.add(box(.62, .035, .38, dark, 0, 0, .28));
      const s = new THREE.Mesh(new THREE.PlaneGeometry(.58, .34), new THREE.MeshBasicMaterial({ map: agTex[i].t, toneMapped: false })); s.rotation.x = Math.PI / 2; s.position.set(0, -.019, .47); g.add(s);
      g.position.set(k * .62, .12 + Math.abs(k) * -.06, .76); g.rotation.z = -k * .32; agents.add(g); });
    const person = new THREE.Group(); person.add(box(.34, .22, .6, std(0xf4f4f5), 0, 0, .55)); const head = new THREE.Mesh(new THREE.SphereGeometry(.1, 20, 16), std(0xbfa58f)); head.position.z = 1.28; person.add(head);
    person.add(box(.3, .2, .55, std(0x2B3448), 0, 0, 0)); person.position.set(0, -.72, 0); agents.add(person);
    agents.position.set(2.15, -2.05, 0); agents.rotation.z = -.3; }
  actor("agents", agents);

  /* ------------------------------------------------------------------ safety layer: enclosure, light curtain, containment, cobot limits */
  const safety = new THREE.Group();
  { const pc = new THREE.MeshStandardMaterial({ color: 0x9fc3d6, transparent: true, opacity: .12, roughness: .1, metalness: 0, side: THREE.DoubleSide, depthWrite: false });
    const h = 1.2, w = F.w + .16, d = F.d + .16, z0 = deck;
    for (const [px, py, rw, rot] of [[0, -d / 2, w, 0], [0, d / 2, w, 0], [-w / 2, 0, d, Math.PI / 2], [w / 2, 0, d, Math.PI / 2]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(rw, h), pc); p.rotation.x = Math.PI / 2; p.rotation.y = rot; p.position.set(px, py, z0 + h / 2); safety.add(p); }
    const fr = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, d, h)), new THREE.LineBasicMaterial({ color: 0x9fb3c8, transparent: true, opacity: .5 })); fr.position.set(0, 0, z0 + h / 2); safety.add(fr);
    const beam = new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: .75 });
    for (let i = 0; i < 7; i++) { const z = z0 + .1 + i * .15; safety.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-w / 2, -d / 2 - .02, z), new THREE.Vector3(w / 2, -d / 2 - .02, z)]), beam)); }
    for (const s of [-1, 1]) safety.add(box(.04, .04, h, std(0xf2c230), s * w / 2, -d / 2 - .02, z0));
    const tray = box(.6, .36, .02, std(0xf2c230, { opacity: .5 }), .7, -.27, deck); safety.add(tray);
    const ab = new THREE.Box3().setFromObject(actors.arm.obj), c = ab.getCenter(new THREE.Vector3()); c.z = deck + .02;
    const halo = new THREE.Mesh(new THREE.RingGeometry(.42, .44, 80), new THREE.MeshBasicMaterial({ color: C.gate, side: THREE.DoubleSide })); halo.position.copy(c); safety.add(halo); safety.userData.halo = halo; }
  actor("safety", safety, { keepColor: true, noShadow: true });

  /* ------------------------------------------------------------------ links (animated connections) */
  const linkGroup = new THREE.Group(); scene.add(linkGroup);
  const center = id => { const a = actors[id]; if (!a) return null; const b = new THREE.Box3().setFromObject(a.obj); const c = b.getCenter(new THREE.Vector3()); c.z = Math.min(b.max.z, Math.max(.4, c.z)); return c; };
  let links = [];
  const shieldTex = (() => { const t = canvasTex(128, 128), x = t.x; x.fillStyle = "#F59E0B"; x.beginPath(); x.moveTo(64, 10); x.lineTo(112, 28); x.quadraticCurveTo(110, 92, 64, 118); x.quadraticCurveTo(18, 92, 16, 28); x.closePath(); x.fill();
    x.strokeStyle = "#fff"; x.lineWidth = 11; x.lineCap = "round"; x.lineJoin = "round"; x.beginPath(); x.moveTo(42, 64); x.lineTo(58, 80); x.lineTo(88, 48); x.stroke(); t.t.needsUpdate = true; return t.t; })();
  function setLinks(list) {
    for (const l of links) { linkGroup.remove(l.g); l.g.traverse(o => { o.geometry?.dispose(); }); } links = [];
    for (const [a, b, kind] of list || []) { const p = center(a), q = center(b); if (!p || !q) continue;
      const mid = p.clone().lerp(q, .5); mid.z = Math.max(p.z, q.z) + .35 + p.distanceTo(q) * .12;
      const curve = new THREE.QuadraticBezierCurve3(p, mid, q), g = new THREE.Group(), col = LINK[kind] || C.command;
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)), new THREE.LineDashedMaterial({ color: col, dashSize: .05, gapSize: .035, transparent: true, opacity: .95 })); line.computeLineDistances(); g.add(line);
      const dots = [0, 1, 2].map(() => { const d = new THREE.Mesh(new THREE.SphereGeometry(kind === "data" ? .024 : .02, 12, 10), new THREE.MeshBasicMaterial({ color: col })); g.add(d); return d; });
      let sh = null; if (kind === "gate") { sh = new THREE.Sprite(new THREE.SpriteMaterial({ map: shieldTex, depthTest: false })); sh.scale.set(.16, .16, 1); sh.position.copy(curve.getPoint(.5)); sh.renderOrder = 10; g.add(sh); }
      linkGroup.add(g); links.push({ g, curve, dots, kind, sh }); }
  }

  /* ------------------------------------------------------------------ screens (canvas textures) */
  const mono = '500 15px "Roboto Mono", ui-monospace, monospace';
  function drawController(t) { const x = ctrlTex.x, W = 256, H = 320; x.fillStyle = "#0B1222"; x.fillRect(0, 0, W, H); x.fillStyle = "#E2E8F0"; x.font = '600 15px Inter, sans-serif'; x.fillText("Orchestration · L3", 14, 26);
    const steps = ["Dose paste", "Dose powder", "Weigh", "Move to mixer", "Mix 90 s", "Measure viscosity", "Store record"], k = Math.floor(t / 1.2) % steps.length;
    x.font = mono; steps.forEach((s, i) => { x.fillStyle = i < k ? "#4ADE80" : i === k ? "#FFD166" : "#64748B"; x.fillText(`${i < k ? "✓" : i === k ? "▶" : "·"} ${s}`, 14, 60 + i * 34); });
    x.fillStyle = "#7DB3FF"; x.fillText("SiLA 2 · REST · ROS 2", 14, H - 16); ctrlTex.t.needsUpdate = true; }
  function drawRack(t) { const x = rackTex.x; x.fillStyle = "#0E1320"; x.fillRect(0, 0, 128, 512);
    for (let u = 0; u < 22; u++) { const y = 8 + u * 23; x.fillStyle = "#1C2436"; x.fillRect(6, y, 116, 18);
      for (let k = 0; k < 6; k++) { const on = Math.sin(t * (3 + k) + u * 1.7 + k) > .2; x.fillStyle = on ? (k % 3 ? "#4ADE80" : "#22D3EE") : "#2A3245"; x.fillRect(12 + k * 9, y + 6, 5, 5); }
      x.fillStyle = "#334058"; x.fillRect(74, y + 5, 40, 7); } rackTex.t.needsUpdate = true; }
  const obs = []; for (let i = 0; i < 6; i++) obs.push(.08 + i * .16 + Math.sin(i * 7) * .03);
  const f = u => .55 + .28 * Math.sin(6.3 * u + .6) * Math.exp(-1.2 * u) + .12 * u;
  function drawML(t) { const x = mlTex.x, W = 960, H = 540; x.fillStyle = "#0B1222"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#E2E8F0"; x.font = '600 26px Inter, sans-serif'; x.fillText("Surrogate model and acquisition", 36, 50);
    x.font = '400 18px Inter, sans-serif'; x.fillStyle = "#94A3B8"; x.fillText("Gaussian process · Bayesian optimization", 36, 80);
    const L = 60, R = W - 40, T = 110, B = 380, n = 2 + Math.floor(t / 1.6) % obs.length, pts = obs.slice(0, n);
    const X = u => L + u * (R - L), Y = v => B - v * (B - T);
    x.strokeStyle = "#334058"; x.lineWidth = 1; x.beginPath(); x.moveTo(L, T); x.lineTo(L, B); x.lineTo(R, B); x.stroke();
    const sd = u => .03 + .22 * Math.min(1, Math.min(...pts.map(p => Math.abs(u - p))) * 5);
    x.fillStyle = "rgba(59,130,246,.25)"; x.beginPath(); for (let i = 0; i <= 100; i++) { const u = i / 100; x.lineTo(X(u), Y(f(u) + sd(u))); } for (let i = 100; i >= 0; i--) { const u = i / 100; x.lineTo(X(u), Y(f(u) - sd(u))); } x.fill();
    x.strokeStyle = "#60A5FA"; x.lineWidth = 3; x.beginPath(); for (let i = 0; i <= 100; i++) { const u = i / 100; x[i ? "lineTo" : "moveTo"](X(u), Y(f(u))); } x.stroke();
    x.fillStyle = "#F8FAFC"; for (const p of pts) { x.beginPath(); x.arc(X(p), Y(f(p)), 7, 0, 7); x.fill(); }
    let best = 0, bu = 0; const A = u => f(u) + 1.6 * sd(u); for (let i = 0; i <= 100; i++) { const u = i / 100; if (A(u) > best) { best = A(u); bu = u; } }
    const T2 = 420, B2 = 500; x.strokeStyle = "#4ADE80"; x.lineWidth = 3; x.beginPath(); for (let i = 0; i <= 100; i++) { const u = i / 100, v = (A(u) - .3) / 1.0; x[i ? "lineTo" : "moveTo"](X(u), B2 - Math.max(0, v) * (B2 - T2)); } x.stroke();
    x.strokeStyle = "#FFD166"; x.setLineDash([8, 6]); x.beginPath(); x.moveTo(X(bu), T); x.lineTo(X(bu), B2); x.stroke(); x.setLineDash([]);
    x.fillStyle = "#FFD166"; x.font = '600 18px Inter, sans-serif'; x.fillText("next experiment", Math.min(X(bu) + 10, R - 160), T + 20);
    x.fillStyle = "#94A3B8"; x.font = mono; x.fillText("composition →", R - 150, B + 26); x.fillText("acquisition", L + 6, T2 - 8); mlTex.t.needsUpdate = true; }
  const AGENTS = [["Campaign designer", "DRAFT", ["Goal: lower viscosity, keep yield stress", "Ingredients: 6 · bounds set", "Dry run in twin: 24 / 24 feasible", "Waiting for scientist approval ▶"]],
    ["Laboratory copilot", "INFORM", ["Run 18: mixing 90 s", "Why rejected? Cup out of reach", "Validation: twin clearance 14 mm", "Next: viscosity at 25 °C"]],
    ["Recovery advisor", "DRAFT", ["Fault: pen stall at 0.8 bar", "Context: lot B12, 31 °C", "Option 1: purge and retry", "Operator decides ▶"]]];
  function drawAgents(t) { AGENTS.forEach(([name, lvl, lines], i) => { const x = agTex[i].x, W = 512, H = 320; x.fillStyle = "#0B1222"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#E2E8F0"; x.font = '600 24px Inter, sans-serif'; x.fillText(name, 20, 40); x.fillStyle = lvl === "INFORM" ? "#4ADE80" : "#FFD166"; x.font = '600 15px Inter, sans-serif'; x.fillText(lvl, W - 90, 38);
    const shown = Math.floor((t * 1.4 + i * 1.3) % (lines.length + 2)); x.font = '400 19px "Roboto Mono", monospace';
    lines.slice(0, shown).forEach((l, k) => { x.fillStyle = l.endsWith("▶") ? "#FFD166" : "#CBD5E1"; x.fillText(l, 20, 92 + k * 46); });
    agTex[i].t.needsUpdate = true; }); }

  /* ------------------------------------------------------------------ labels for the current stage: placed on a ring around the view, each with a
   * leader line and a dot on its object, so the labels never cover the equipment. Angles follow the objects and are spread apart so labels don't overlap. */
  const labelBox = document.createElement("div"); labelBox.className = "sdl-labels"; host.append(labelBox); let labels = [];
  const lineSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); lineSvg.setAttribute("class", "sdl-lines"); labelBox.append(lineSvg);
  function setLabels(ids) { labelBox.querySelectorAll("span").forEach(e => e.remove()); lineSvg.innerHTML = "";
    labels = ids.filter(id => NAMES[id] && actors[id]).map(id => { const el = document.createElement("span"); el.textContent = NAMES[id]; labelBox.append(el);
      const ln = document.createElementNS("http://www.w3.org/2000/svg", "line"), dt = document.createElementNS("http://www.w3.org/2000/svg", "circle"); dt.setAttribute("r", 3.5); lineSvg.append(ln, dt);
      const b = new THREE.Box3().setFromObject(actors[id].obj); const p = b.getCenter(new THREE.Vector3()); p.z = b.min.z + (b.max.z - b.min.z) * .62; return { el, ln, dt, p, th: null }; }); }
  const TAU = Math.PI * 2;
  function placeLabels() {
    const W = host.clientWidth, H = host.clientHeight, cx = W / 2, cy = H / 2 + 4, v = new THREE.Vector3(), vis = [];
    for (const lb of labels) { v.copy(lb.p).project(cam); lb.ax = (v.x + 1) / 2 * W; lb.ay = (1 - v.y) / 2 * H;
      lb.ok = v.z < 1 && lb.ax > -20 && lb.ax < W + 20 && lb.ay > -20 && lb.ay < H + 20; lb.w = lb.el.offsetWidth; lb.h = lb.el.offsetHeight;
      if (lb.ok) { const t = Math.atan2((lb.ay - cy) / H, (lb.ax - cx) / W); lb.t = lb.th === null || still ? t : lb.th + Math.atan2(Math.sin(t - lb.th), Math.cos(t - lb.th)) * .25; vis.push(lb); } }
    // spread the angles so neighbouring labels keep a minimum gap on the ring
    vis.sort((a, b) => a.t - b.t); const n = vis.length, sep = n > 1 ? Math.min(TAU / n * .92, .62) : 0;
    for (let pass = 0; pass < 24 && n > 1; pass++) for (let i = 0; i < n; i++) { const A = vis[i], B = vis[(i + 1) % n]; let d = B.t - A.t; if (i === n - 1) d += TAU;
      if (d < sep) { const k = (sep - d) / 2; A.t -= k; B.t += k; } }
    for (const lb of labels) { if (!lb.ok) { lb.el.style.opacity = 0; lb.ln.style.opacity = 0; lb.dt.style.opacity = 0; continue; }
      lb.th = lb.t; const rx = W / 2 - 18 - lb.w / 2, ry = H / 2 - 58 - lb.h / 2;
      let x = cx + rx * Math.cos(lb.t), y = cy + ry * Math.sin(lb.t);
      x = Math.min(W - 18 - lb.w / 2, Math.max(18 + lb.w / 2, x)); y = Math.min(H - 52 - lb.h / 2, Math.max(54 + lb.h / 2, y));
      lb.el.style.opacity = 1; lb.el.style.transform = `translate(${x - lb.w / 2}px,${y - lb.h / 2}px)`;
      const dx = lb.ax - x, dy = lb.ay - y, k = Math.min(Math.abs(dx) > 1e-3 ? lb.w / 2 / Math.abs(dx) : 1e9, Math.abs(dy) > 1e-3 ? lb.h / 2 / Math.abs(dy) : 1e9, 1);
      lb.ln.setAttribute("x1", x + dx * k); lb.ln.setAttribute("y1", y + dy * k); lb.ln.setAttribute("x2", lb.ax); lb.ln.setAttribute("y2", lb.ay);
      lb.dt.setAttribute("cx", lb.ax); lb.dt.setAttribute("cy", lb.ay); lb.ln.style.opacity = 1; lb.dt.style.opacity = 1; }
  }

  /* ------------------------------------------------------------------ stage logic */
  let curStage = null, safetyOn = false, goal = null, userMoved = false, loopT = 0, loopPath = null;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;   // apply stages instantly, no camera flights
  const ghost = new THREE.Color(C.ghost);
  function frameBox(b, wide = false) { const c = b.getCenter(new THREE.Vector3()), rad = b.getSize(new THREE.Vector3()).length() / 2, vf = cam.fov * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * cam.aspect);
    const dist = rad / Math.sin(Math.min(vf, hf) / 2) * (wide ? .72 : .95), dir = (wide ? new THREE.Vector3(-.7, -1.25, 1.05) : new THREE.Vector3(-.45, -1.35, .85)).normalize();
    goal = { t: c, p: c.clone().add(dir.multiplyScalar(Math.max(1.3, dist))) }; }
  function paintScreens(tt) { drawController(tt); drawRack(tt); drawML(tt); drawAgents(tt); }
  function setStage(stage, idx, all) {
    curStage = stage; userMoved = false; paintScreens(t + 3);
    const introduced = new Set(); all.slice(0, idx + 1).filter(s => !s.all).forEach(s => s.show.forEach(id => introduced.add(id)));
    const focus = new Set(stage.all ? Object.keys(actors).filter(id => id !== "safety") : stage.focus);
    for (const [id, a] of Object.entries(actors)) {
      const isSafety = id === "safety", visible = isSafety ? (safetyOn || stage.safetyAll) : (stage.all || introduced.has(id) || focus.has(id));
      a.goal = visible ? 1 : 0; a.mixGoal = focus.has(id) || stage.loop || (isSafety && visible) ? 0 : 1; }
    setLinks(stage.links); setLabels(stage.all ? ["frame", "twin", "controller", "datacenter", "ml", "agents"] : stage.focus);
    const b = new THREE.Box3(); for (const id of focus) { const a = actors[id]; if (a) b.union(new THREE.Box3().setFromObject(a.obj)); }
    if (!b.isEmpty()) frameBox(b, stage.all || stage.loop);
    if (still) { for (const a of Object.values(actors)) { a.cur = a.goal; a.mix = a.mixGoal; } if (goal) { cam.position.copy(goal.p); ctl.target.copy(goal.t); goal = null; } }
    loopPath = stage.loop ? new THREE.CatmullRomCurve3(["ml", "controller", "twin", "frame", "balance", "controller", "datacenter", "ml"].map(center).filter(Boolean), true) : null;
  }
  function setSafety(v) { safetyOn = v; if (curStage) { const a = actors.safety; a.goal = v || curStage.safetyAll ? 1 : 0; a.mixGoal = 0; if (still) { a.cur = a.goal; a.mix = 0; } } }
  const loopDot = new THREE.Mesh(new THREE.SphereGeometry(.05, 16, 12), new THREE.MeshBasicMaterial({ color: C.data })); loopDot.visible = false; scene.add(loopDot);
  r.domElement.addEventListener("pointerdown", () => { userMoved = true; goal = null; });
  r.domElement.addEventListener("wheel", () => { userMoved = true; goal = null; }, { passive: true });

  paintScreens(3);   // screens show content from the first frame, then animate

  /* ------------------------------------------------------------------ resize, loop */
  function resize() { const w = host.clientWidth, h = host.clientHeight; r.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(host); resize();
  const everything = new THREE.Box3(); for (const a of Object.values(actors)) everything.union(new THREE.Box3().setFromObject(a.obj)); frameBox(everything, true); cam.position.copy(goal.p); ctl.target.copy(goal.t);
  let vis = true; new IntersectionObserver(es => vis = es[0].isIntersecting).observe(host);
  const clock = new THREE.Clock(); let t = 0, lastScreens = 0, frame = 0;
  (function loop() { requestAnimationFrame(loop); if (!vis) return; const dt = Math.min(clock.getDelta(), .05); t += dt;
    for (const a of Object.values(actors)) {
      a.cur += (a.goal - a.cur) * Math.min(1, dt * 5); a.mix += (a.mixGoal - a.mix) * Math.min(1, dt * 5);
      a.obj.visible = a.cur > .01; if (!a.obj.visible) continue;
      for (const { m, base, op } of a.mats) { if (base && !a.keepColor) m.color.copy(base).lerp(ghost, a.mix * .8); m.opacity = op * a.cur * (1 - a.mix * .6); m.depthWrite = a.mix < .5 && a.cur > .9 && op > .6; } }
    for (const { ring } of sensorDots) { const s = 1 + .5 * Math.abs(Math.sin(t * 3)); ring.scale.setScalar(s); ring.material.opacity = (1 - Math.abs(Math.sin(t * 3)) * .7) * actors.sensors.cur; }
    if (safety.userData.halo) safety.userData.halo.material.opacity = (.55 + .45 * Math.sin(t * 3)) * actors.safety.cur;
    for (const l of links) l.dots.forEach((d, i) => d.position.copy(l.curve.getPoint(((t * .35) + i / 3) % 1)));
    if (loopPath) { loopDot.visible = true; loopT = (loopT + dt * .07) % 1; loopDot.position.copy(loopPath.getPoint(loopT)); } else loopDot.visible = false;
    if (goal && !userMoved) { cam.position.lerp(goal.p, Math.min(1, dt * 2.6)); ctl.target.lerp(goal.t, Math.min(1, dt * 2.6)); if (cam.position.distanceTo(goal.p) < .01) goal = null; }
    ctl.update();
    if (t - lastScreens > .1) { lastScreens = t;
      if (actors.controller.obj.visible) drawController(t); if (actors.datacenter.obj.visible) drawRack(t); if (actors.ml.obj.visible) drawML(t); if (actors.agents.obj.visible) drawAgents(t); }
    if (actors.twin.obj.visible && (frame++ % 3 === 0)) { cupT.position.copy(path.getPoint((Math.sin(t * .6) + 1) / 2)); tCam.position.set(Math.cos(t * .15) * 3.6 - .4, Math.sin(t * .15) * 3.6 - 1, 2.6); tCam.lookAt(0, 0, .9);
      r.setRenderTarget(RT); r.render(tScene, tCam); r.setRenderTarget(null); }
    r.render(scene, cam);
    placeLabels();
  })();
  onProgress("");
  return { setStage, setSafety, names: NAMES };
}
