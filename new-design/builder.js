import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { CATEGORIES, ITEMS, CAPS, buildModel, addDock } from "./catalog.js";
import { TEMPLATES } from "../data/templates.js";
import { cart as blCart, byId as P } from "../assets/bl.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const REFS = "../wiki/references/#ref-";
const linkRefs = s => esc(s).replace(/\[([\d,\s–-]+)\]/g, (_, l) => "[" + l.split(",").map(n => n.trim()).map(n => /^\d+$/.test(n) ? `<a href="${REFS}${n}" target="_blank" rel="noopener">${n}</a>` : n).join(", ") + "]");
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { } } };
const short = n => n.split(" (")[0];
const deg = r => r * 180 / Math.PI, rad = d => d * Math.PI / 180;

/* ================================================================ prices from the review */
const R = await (await fetch("../data/review.json")).json();
function parsePrice(s) {
  const nums = [], cur = /€/.test(s) ? "€" : "$";
  for (const m of String(s).matchAll(/[$€]\s?([\d,]+)(?:\s*[–-]\s*([\d,]+))?/g)) { nums.push(+m[1].replace(/,/g, "")); if (m[2]) nums.push(+m[2].replace(/,/g, "")); }
  return nums.length ? { lo: Math.min(...nums), hi: Math.max(...nums), cur } : null;
}
for (const it of ITEMS) {
  if (it.src) {
    const [t, key] = it.src, row = R[t].rows.find(r => Object.values(r).some(v => String(v).includes(key)));
    if (row) {
      it.row = row; it.ref = row.Ref || ""; it.spec = row.Accuracy || row.Repeatability || row["Accuracy / precision"] || "";
      let raw = row.Price || ""; if (it.priceIndex != null) raw = raw.split(";").map(s => s.trim())[it.priceIndex] || raw;
      it.priceRaw = raw; it.price = parsePrice(raw);
    }
  }
  if (!it.priceRaw || /^[-–]$/.test(String(it.priceRaw).trim())) it.priceRaw = it.price || (it.row ? "Not listed" : "Not in review"), it.price = null;
}
const byId = Object.fromEntries(ITEMS.map(i => [i.id, i]));
const money = (v, cur = "$") => cur + Math.round(v).toLocaleString("en-US");
const fmt = p => p ? (p.lo === p.hi ? money(p.lo, p.cur) : `${money(p.lo, p.cur)}–${Math.round(p.hi).toLocaleString("en-US")}`) : "";

/* ================================================================ thumbnails mode: ?thumbs=1 renders all, ?thumbs=id,id renders some; results land in <pre id="thumbs-out"> for headless capture */
if (new URLSearchParams(location.search).has("thumbs")) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); r.setSize(320, 240); r.toneMapping = THREE.ACESFilmicToneMapping;
  const sc = new THREE.Scene(); sc.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), .04).texture;
  sc.add(new THREE.HemisphereLight(0xffffff, 0x445566, .8)); const l = new THREE.DirectionalLight(0xffffff, 1.6); l.position.set(2, -3, 4); sc.add(l);
  const cam = new THREE.PerspectiveCamera(30, 4 / 3, .01, 50); cam.up.set(0, 0, 1);
  window.__thumbs = {};
  const only = (new URLSearchParams(location.search).get("thumbs") || "").split(",").filter(x => x && x !== "1");
  for (const it of ITEMS.filter(i => !only.length || only.includes(i.id))) {
    const m = await buildModel(it); m.userData.tick?.(1.3, .016); sc.add(m);
    const b = new THREE.Box3().setFromObject(m), c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3()).length();
    cam.position.set(c.x + s * .95, c.y - s * 1.35, c.z + s * .7); cam.lookAt(c); r.render(sc, cam);
    window.__thumbs[it.id] = r.domElement.toDataURL("image/png"); sc.remove(m);
  }
  window.__thumbsDone = true;
  const out = document.createElement("pre"); out.id = "thumbs-out"; out.textContent = JSON.stringify(window.__thumbs); document.body.append(out); // read by headless --dump-dom
  throw new Error("thumbnail mode finished");
}

/* ================================================================ scene */
const view = $("#canvas");
let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  view.appendChild(renderer.domElement);
} catch { view.innerHTML = '<p class="nogl">The 3D workstation needs WebGL, which is turned off in this browser.</p>'; }
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0F0F10);
if (renderer) scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
const camera = new THREE.PerspectiveCamera(36, 1, .02, 80); camera.up.set(0, 0, 1);
const controls = new OrbitControls(camera, renderer?.domElement ?? view); controls.enableDamping = true; controls.maxPolarAngle = Math.PI * .49; controls.minDistance = .4; controls.maxDistance = 14;
scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x1a2230, .55));
const key = new THREE.DirectionalLight(0xffffff, 1.9); key.position.set(2.5, -3.5, 5); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: .5, far: 20 }); key.shadow.bias = -.0004; scene.add(key);
const rim = new THREE.DirectionalLight(0xE0679A, .5); rim.position.set(-3, 4, 2.5); scene.add(rim);

// floor: shadow catcher, radial glow, rings, fine grid, workstation outline
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const shadowFloor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: .45 })); shadowFloor.receiveShadow = true; scene.add(shadowFloor);
function radialTex() { const c = document.createElement("canvas"); c.width = c.height = 512; const x = c.getContext("2d"), g = x.createRadialGradient(256, 256, 0, 256, 256, 256);
  g.addColorStop(0, "rgba(90,130,200,.30)"); g.addColorStop(.45, "rgba(60,90,150,.12)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 512, 512); return new THREE.CanvasTexture(c); }
const glowFloor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: radialTex(), transparent: true, depthWrite: false })); glowFloor.position.z = .0005; scene.add(glowFloor);
const rings = new THREE.Group(); scene.add(rings);
const grid = new THREE.GridHelper(14, 140, 0x22303d, 0x141c25); grid.rotation.x = Math.PI / 2; grid.position.z = .0003; scene.add(grid);
let area = null, areaW = 3, areaD = 2;
function drawArea() {
  if (area) scene.remove(area); area = new THREE.Group();
  const fill = new THREE.Mesh(new THREE.PlaneGeometry(areaW, areaD), new THREE.MeshBasicMaterial({ color: 0x2b5fbf, transparent: true, opacity: .07, depthWrite: false })); fill.position.z = .001; area.add(fill);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(areaW, areaD)), new THREE.LineBasicMaterial({ color: 0x7ea8f2, transparent: true, opacity: .9 })); edge.position.z = .002; area.add(edge);
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const c = new THREE.Mesh(new THREE.BoxGeometry(.12, .012, .004), new THREE.MeshBasicMaterial({ color: 0x9fc0ff })); c.position.set(sx * (areaW / 2 - .06), sy * areaD / 2, .003); area.add(c);
    const c2 = c.clone(); c2.rotation.z = Math.PI / 2; c2.position.set(sx * areaW / 2, sy * (areaD / 2 - .06), .003); area.add(c2); }
  scene.add(area);
  const s = Math.max(areaW, areaD) * 1.9; glowFloor.scale.set(s, s, 1);
  rings.clear(); for (let i = 1; i <= 4; i++) { const r = Math.max(areaW, areaD) * .28 * i; const m = new THREE.Mesh(new THREE.RingGeometry(r - .003, r, 128), new THREE.MeshBasicMaterial({ color: 0x3d5b85, transparent: true, opacity: .35 - i * .06, depthWrite: false })); m.position.z = .0008; rings.add(m); }
}
function resize() { const w = view.clientWidth, h = view.clientHeight; if (!w || !h || !renderer) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(view);
function setView(kind = "iso") {
  const s = Math.max(areaW, areaD);
  if (kind === "top") camera.position.set(0, -.001, s * 1.6); else if (kind === "front") camera.position.set(0, -s * 1.5, s * .35); else camera.position.set(s * .6, -s * 1.2, s * .85);
  controls.target.set(0, 0, .15); controls.update();
}

/* gizmo for 6-DOF moves */
const gizmo = new TransformControls(camera, renderer?.domElement ?? view); gizmo.setSize(.8); scene.add(gizmo);
gizmo.addEventListener("dragging-changed", e => { controls.enabled = !e.value; if (!e.value && selected) { afterMove(selected); } });
gizmo.addEventListener("objectChange", () => { if (selected) { followDock(selected); syncInspector(); } });

/* ================================================================ placed devices */
let placed = [], nextNo = 1, selected = null, hovered = null, running = true, showLabels = true;
const labelsEl = $("#labels");
async function add(id, x = null, y = null, opts = {}) {
  const it = byId[id]; if (!it) return;
  const group = await buildModel(it);
  if (it.dock) group.userData.slots = addDock(group.children[0], group.userData.size);
  const obj = { no: nextNo++, id, group, dockedTo: null, slot: null };
  group.userData.obj = obj;
  if (opts.rot) group.rotation.set(opts.rot[0] || 0, opts.rot[1] || 0, opts.rot[2] || 0);
  if (x == null) { const p = freeSpot(obj); x = p.x; y = p.y; }
  group.position.set(x, y, opts.z || 0); scene.add(group); placed.push(obj);
  if (it.reach) { const ring = new THREE.Mesh(new THREE.RingGeometry(it.reach - .008, it.reach, 128), new THREE.MeshBasicMaterial({ color: 0x5be3a0, transparent: true, opacity: .55, side: THREE.DoubleSide, depthWrite: false }));
    ring.position.z = .004; ring.userData.helper = true; group.add(ring);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(it.reach, 96), new THREE.MeshBasicMaterial({ color: 0x5be3a0, transparent: true, opacity: .05, depthWrite: false })); disc.position.z = .0035; disc.userData.helper = true; group.add(disc); }
  const lab = document.createElement("div"); lab.className = "tag"; lab.innerHTML = `<b>${obj.no}</b><span>${esc(short(it.name))}</span>`; labelsEl.appendChild(lab); obj.label = lab;
  lab.addEventListener("click", () => select(obj));
  if (it.tool) { if (!trySnap(obj)) rest(obj); } else if (!opts.z) rest(obj);
  if (!opts.silent) { select(obj); refresh(); pulse(obj); }
  return obj;
}
function remove(obj) {
  scene.remove(obj.group); obj.label.remove(); placed = placed.filter(o => o !== obj);
  for (const o of placed) if (o.dockedTo === obj) { o.dockedTo = null; o.group.position.z = 0; }
  if (selected === obj) select(null); refresh();
}
function pulse(obj) { obj.label.classList.remove("new"); void obj.label.offsetWidth; obj.label.classList.add("new"); }
function followDock(host) { const s = host.group.userData.slots; if (!s) return; host.group.updateMatrixWorld(true); for (const o of placed) if (o.dockedTo === host) o.group.position.copy(host.group.children[0].localToWorld(s[o.slot].clone())); }
function trySnap(obj) {
  obj.dockedTo = null;
  for (const host of placed) { const slots = host.group.userData.slots; if (!slots) continue; host.group.updateMatrixWorld(true);
    for (let k = 0; k < slots.length; k++) { const w = host.group.children[0].localToWorld(slots[k].clone());
      if (Math.hypot(w.x - obj.group.position.x, w.y - obj.group.position.y) < .14 && !placed.some(o => o !== obj && o.dockedTo === host && o.slot === k)) { obj.group.position.copy(w); obj.dockedTo = host; obj.slot = k; return true; } } }
  if (obj.group.position.z < .05) obj.group.position.z = 0; return false;
}
function rest(obj) { const it = byId[obj.id], p = obj.group.position; let top = 0, on = null;
  if (it.mount) { obj.onMount = null; return; }
  for (const o of placed) { if (o === obj || o.dockedTo || byId[o.id].stack) continue; const io = byId[o.id];
    if (!it.stack && !io.mount) continue;                       // devices stand on mounts; the cup stands on anything
    const b = boxOf(o); if (p.x > b.min.x && p.x < b.max.x && p.y > b.min.y && p.y < b.max.y) {
      let z = b.max.z; if (it.overhead && io.frame) { const h = boxOf(obj); z = b.max.z - (h.max.z - h.min.z) - .03; }
      if (z > top) { top = z; on = o; } } }
  if (!it.stack && !on && !obj.onMount) return;                 // keep a hand-set height unless it left a mount
  p.z = top; obj.onMount = on; }
function riders(host) { return placed.filter(o => o.onMount === host); }
function boxOf(o) { const b = new THREE.Box3(); o.group.updateMatrixWorld(true); o.group.traverse(m => { if (m.isMesh && !m.userData.helper && m.geometry) { m.geometry.computeBoundingBox(); b.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld)); } }); return b; }
function afterMove(obj) { const it = byId[obj.id]; if (it.tool) { if (!trySnap(obj)) rest(obj); } else rest(obj); followDock(obj); for (const o of placed) if (o !== obj && (byId[o.id].stack || o.onMount)) rest(o); refresh(); syncInspector(); }
function freeSpot(obj) {
  const others = placed.map(rect);
  for (let r = 0; r < Math.max(areaW, areaD) * 1.6; r += .1) for (let a = 0; a < 6.283; a += r ? .1 / r : 7) {
    obj.group.position.set(snap(Math.cos(a) * r), snap(Math.sin(a) * r), 0); const me = rect(obj);
    if (!others.some(o => overlap(me, o))) return { x: obj.group.position.x, y: obj.group.position.y };
  }
  return { x: areaW / 2 + 1, y: 0 };
}

/* ================================================================ geometry checks */
function rect(o) { o.group.updateMatrixWorld(true); const b = boxOf(o); return [[b.min.x, b.min.y], [b.max.x, b.min.y], [b.max.x, b.max.y], [b.min.x, b.max.y]].map(([x, y]) => new THREE.Vector2(x, y)); }
function overlap(a, b) { for (const poly of [a, b]) for (let i = 0; i < 4; i++) { const p1 = poly[i], p2 = poly[(i + 1) % 4], nx = p2.y - p1.y, ny = p1.x - p2.x;
  const pa = a.map(p => p.x * nx + p.y * ny), pb = b.map(p => p.x * nx + p.y * ny); if (Math.max(...pa) <= Math.min(...pb) + 1e-3 || Math.max(...pb) <= Math.min(...pa) + 1e-3) return false; } return true; }
const snap = v => Math.round(v / .05) * .05;
function analyse() {
  const Rr = placed.map(o => ({ o, r: rect(o), b: boxOf(o) })), out = { overlaps: [], outside: [], reach: [], covered: new Set(), footprint: 0 };
  for (let i = 0; i < Rr.length; i++) for (let j = i + 1; j < Rr.length; j++) { const a = Rr[i].o, b = Rr[j].o;
    if (a.dockedTo === b || b.dockedTo === a || (a.dockedTo && a.dockedTo === b.dockedTo) || byId[a.id].stack || byId[b.id].stack || a.onMount === b || b.onMount === a || (a.onMount || null) !== (b.onMount || null)) continue; // different levels
    if (overlap(Rr[i].r, Rr[j].r)) out.overlaps.push([a, b]); }
  for (const { o, r, b } of Rr) { if (r.some(p => Math.abs(p.x) > areaW / 2 + 1e-3 || Math.abs(p.y) > areaD / 2 + 1e-3)) out.outside.push(o); if (!o.dockedTo && !byId[o.id].stack && !o.onMount) out.footprint += (b.max.x - b.min.x) * (b.max.y - b.min.y); }
  const targets = Rr.filter(x => byId[x.o.id].cat !== "arm");
  for (const { o } of Rr) { const it = byId[o.id]; if (!it.reach) continue; const base = o.group.position, inR = [], outR = [];
    for (const { o: t, b } of targets) { const c = b.getCenter(new THREE.Vector3()); (Math.hypot(c.x - base.x, c.y - base.y) <= it.reach ? (inR.push(t), out.covered.add(t)) : outR.push(t)); }
    out.reach.push({ o, inR, outR }); }
  out.targets = targets.length; return out;
}

/* ================================================================ selection, hover, inspector */
let selBox = null, hovBox = null;
function select(obj) {
  selected = obj; if (selBox) { scene.remove(selBox); selBox = null; }
  if (obj) { selBox = new THREE.BoxHelper(obj.group, 0xE0679A); scene.add(selBox); gizmo.attach(obj.group); } else gizmo.detach();
  $$(".tag").forEach(t => t.classList.toggle("sel", obj && t === obj.label));
  $$("#cart-lines tr[data-no]").forEach(r => r.classList.toggle("sel", obj && +r.dataset.no === obj.no));
  renderInspector();
}
function setHover(obj) {
  if (hovered === obj) return; hovered = obj;
  if (hovBox) { scene.remove(hovBox); hovBox = null; }
  if (obj && obj !== selected) { hovBox = new THREE.BoxHelper(obj.group, 0x5be3a0); scene.add(hovBox); }
  $$(".tag").forEach(t => t.classList.toggle("hot", obj && t === obj.label));
  $$("#cart-lines tr[data-no]").forEach(r => r.classList.toggle("hot", obj && +r.dataset.no === obj.no));
  if (obj) $(`#cart-lines tr[data-no="${obj.no}"]`)?.scrollIntoView({ block: "nearest" });
}
function renderInspector() {
  const el = $("#inspector");
  if (!selected) { el.hidden = true; return; }
  el.hidden = false; const it = byId[selected.id], g = selected.group;
  el.innerHTML = `
    <div class="ins-head"><span class="no">${selected.no}</span><div><b>${esc(it.name)}</b><span>${esc(it.sub)} · ${esc(it.price ? fmt(it.price) : it.priceRaw)} ${linkRefs(it.ref)}</span></div>
      <button type="button" class="x" data-a="close" aria-label="Deselect">×</button></div>
    <div class="ins-modes" role="group" aria-label="Gizmo">
      <button type="button" data-g="translate" aria-pressed="${gizmo.mode === "translate"}">Move <kbd>G</kbd></button>
      <button type="button" data-g="rotate" aria-pressed="${gizmo.mode === "rotate"}">Rotate <kbd>R</kbd></button>
      <button type="button" data-g="space">${gizmo.space === "local" ? "Local axes" : "World axes"}</button>
    </div>
    <div class="ins-grid">
      ${["x", "y", "z"].map(k => `<label>${k.toUpperCase()}<input type="number" step="0.01" data-p="${k}" value="${g.position[k].toFixed(3)}"><i>m</i></label>`).join("")}
      ${[["x", "Roll"], ["y", "Pitch"], ["z", "Yaw"]].map(([k, n]) => `<label>${n}<input type="number" step="1" data-r="${k}" value="${deg(g.rotation[k]).toFixed(1)}"><i>°</i></label>`).join("")}
    </div>
    <div class="ins-actions">
      <button type="button" data-a="yawL">⟲ 15°</button><button type="button" data-a="yawR">⟳ 15°</button><button type="button" data-a="level">Level</button>
      <button type="button" data-a="floor">Drop to floor</button><button type="button" data-a="dup">Duplicate</button><button type="button" data-a="del" class="danger">Remove</button>
    </div>
    ${it.note ? `<p class="ins-note">${esc(it.note)}</p>` : ""}${selected.dockedTo ? `<p class="ins-note ok">Docked on #${selected.dockedTo.no}, slot ${selected.slot + 1}</p>` : ""}`;
  el.querySelectorAll("[data-g]").forEach(b => b.onclick = () => { const v = b.dataset.g; if (v === "space") gizmo.setSpace(gizmo.space === "local" ? "world" : "local"); else gizmo.setMode(v); renderInspector(); });
  el.querySelectorAll("[data-a]").forEach(b => b.onclick = () => act(b.dataset.a));
  el.querySelectorAll("input[data-p]").forEach(i => i.onchange = () => { g.position[i.dataset.p] = +i.value || 0; afterMove(selected); });
  el.querySelectorAll("input[data-r]").forEach(i => i.onchange = () => { g.rotation[i.dataset.r] = rad(+i.value || 0); afterMove(selected); });
}
function syncInspector() { if (!selected) return; const g = selected.group;
  $$("#inspector input[data-p]").forEach(i => { if (document.activeElement !== i) i.value = g.position[i.dataset.p].toFixed(3); });
  $$("#inspector input[data-r]").forEach(i => { if (document.activeElement !== i) i.value = deg(g.rotation[i.dataset.r]).toFixed(1); }); }
function act(a) {
  if (!selected) return; const g = selected.group;
  if (a === "close") return select(null);
  if (a === "yawL") g.rotation.z += Math.PI / 12; if (a === "yawR") g.rotation.z -= Math.PI / 12;
  if (a === "level") { g.rotation.x = 0; g.rotation.y = 0; } if (a === "floor") g.position.z = 0;
  if (a === "dup") return add(selected.id, null, null, { rot: [g.rotation.x, g.rotation.y, g.rotation.z] });
  if (a === "del") return remove(selected);
  afterMove(selected);
}

/* ================================================================ pointer */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function cast(ev) { const r = renderer.domElement.getBoundingClientRect(); ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); }
function floorAt(ev) { cast(ev); const p = new THREE.Vector3(); return ray.ray.intersectPlane(floorPlane, p) ? p : null; }
function pick(ev) { cast(ev); const hit = ray.intersectObjects(placed.map(o => o.group), true).find(h => !h.object.userData.helper); let o = hit?.object; while (o && !o.userData.obj) o = o.parent; return o?.userData.obj ?? null; }
const tip = $("#tip");
let drag = null;
if (renderer) {
  const el = renderer.domElement;
  el.addEventListener("pointerdown", ev => {
    if (gizmo.axis) return;                                    // the gizmo handles its own drag
    const obj = pick(ev); if (!obj) { if (ev.button === 0) select(null); return; }
    select(obj); const p = floorAt(ev); drag = { obj, dx: obj.group.position.x - p.x, dy: obj.group.position.y - p.y, moved: false, riders: riders(obj).map(o => [o, o.group.position.x - obj.group.position.x, o.group.position.y - obj.group.position.y]) };
    controls.enabled = false; el.setPointerCapture(ev.pointerId);
  });
  el.addEventListener("pointermove", ev => {
    if (drag) { const p = floorAt(ev); if (!p) return; const g = drag.obj.group; g.position.x = snap(p.x + drag.dx); g.position.y = snap(p.y + drag.dy); drag.moved = true; followDock(drag.obj); for (const [o, rx, ry] of drag.riders) { o.group.position.x = g.position.x + rx; o.group.position.y = g.position.y + ry; followDock(o); } syncInspector(); tip.hidden = true; return; }
    const obj = gizmo.dragging ? null : pick(ev); setHover(obj);
    if (obj) { const it = byId[obj.id], r = view.getBoundingClientRect(); tip.hidden = false; tip.style.left = (ev.clientX - r.left + 14) + "px"; tip.style.top = (ev.clientY - r.top + 14) + "px";
      tip.innerHTML = `<b>#${obj.no} ${esc(it.name)}</b><span>${esc(it.sub)} · ${esc(it.price ? fmt(it.price) : it.priceRaw)}${it.reach ? ` · reach ${it.reach} m` : ""}</span>`; }
    else tip.hidden = true;
  });
  el.addEventListener("pointerleave", () => { setHover(null); tip.hidden = true; });
  el.addEventListener("pointerup", () => { if (!drag) return; controls.enabled = true; if (drag.moved) afterMove(drag.obj); drag = null; });
  view.addEventListener("dragover", ev => { ev.preventDefault(); ev.dataTransfer.dropEffect = "copy"; view.classList.add("drop"); });
  view.addEventListener("dragleave", () => view.classList.remove("drop"));
  view.addEventListener("drop", async ev => { ev.preventDefault(); view.classList.remove("drop"); const id = ev.dataTransfer.getData("text/plain"); const p = floorAt(ev); if (id && p) await add(id, snap(p.x), snap(p.y)); });
}
addEventListener("keydown", ev => {
  if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName)) return;
  const k = ev.key.toLowerCase();
  if (k === " ") { ev.preventDefault(); toggleRun(); }
  if (k === "l") toggleLabels();
  if (!selected) return;
  if (k === "delete" || k === "backspace") { ev.preventDefault(); act("del"); }
  if (k === "g") { gizmo.setMode("translate"); renderInspector(); } if (k === "r") { gizmo.setMode("rotate"); renderInspector(); }
  if (k === "q") act("yawL"); if (k === "e") act("yawR"); if (k === "d") act("dup"); if (k === "escape") select(null);
});

/* ================================================================ intelligence: capabilities, auto-arrange */
function cheapestFor(cap) {
  const c = ITEMS.filter(i => i.caps?.includes(cap) && i.cat !== "platform");
  return c.sort((a, b) => (a.price?.hi ?? 1e9) - (b.price?.hi ?? 1e9))[0] || ITEMS.find(i => i.caps?.includes(cap));
}
async function autoArrange() {
  const arms = placed.filter(o => byId[o.id].reach).sort((a, b) => byId[b.id].reach - byId[a.id].reach);
  if (!arms.length) { toast("Add a robot arm first. Auto-arrange places stations around its reach."); return; }
  const arm = arms[0], R0 = byId[arm.id].reach; arm.group.position.set(0, 0, 0); arm.group.rotation.set(0, 0, 0);
  const items = placed.filter(o => o !== arm && !o.dockedTo && !byId[o.id].stack && !(byId[o.id].reach && o !== arm));
  items.sort((a, b) => { const A = boxOf(a), B2 = boxOf(b); return (B2.max.x - B2.min.x) * (B2.max.y - B2.min.y) - (A.max.x - A.min.x) * (A.max.y - A.min.y); });
  const done = [arm];
  for (const o of items) {
    let best = null;
    for (let r = .3; r < R0 + 2.5 && !best; r += .05) for (let a = -Math.PI / 2, k = 0; k < 48 && !best; k++, a += (k % 2 ? 1 : -1) * k * (Math.PI / 24)) {
      o.group.rotation.set(0, 0, a - Math.PI / 2); o.group.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
      const me = rect(o); if (!done.some(d => overlap(me, rect(d)))) best = true;
    }
    done.push(o); followDock(o);
  }
  for (const o of placed) if (byId[o.id].stack) { const bal = placed.find(p => p.id === "balance"); if (bal) { const c = boxOf(bal).getCenter(new THREE.Vector3()); o.group.position.set(c.x, c.y, 0); } rest(o); }
  const xs = placed.map(boxOf); const W = Math.max(...xs.map(b => Math.max(Math.abs(b.min.x), Math.abs(b.max.x)))) * 2, D = Math.max(...xs.map(b => Math.max(Math.abs(b.min.y), Math.abs(b.max.y)))) * 2;
  if (W > areaW || D > areaD) { areaW = Math.ceil(W * 2) / 2; areaD = Math.ceil(D * 2) / 2; $("#aw").value = areaW; $("#ad").value = areaD; drawArea(); }
  select(null); refresh(); setView("iso"); toast(`Arranged ${items.length} devices around #${arm.no} ${short(byId[arm.id].name)}.`);
}

/* ================================================================ cart, metrics, insights */
function refresh() {
  for (const o of placed) o._bb = null;
  // cart (one row per placed device)
  const rows = [...placed].sort((a, b) => a.no - b.no);
  const tot = {}; let quote = 0;
  for (const o of rows) { const it = byId[o.id]; if (it.price) { const c = it.price.cur; tot[c] ??= { lo: 0, hi: 0 }; tot[c].lo += it.price.lo; tot[c].hi += it.price.hi; } else quote++; }
  $("#cart-lines").innerHTML = rows.length ? rows.map(o => { const it = byId[o.id]; return `<tr data-no="${o.no}" class="${selected === o ? "sel" : ""}">
      <td class="no">${o.no}</td><td><span class="sw" style="background:${CATEGORIES.find(c => c.id === it.cat).color}"></span>${esc(short(it.name))}<div class="sub">${esc(it.sub)} ${linkRefs(it.ref)}${o.dockedTo ? ` · on #${o.dockedTo.no}` : ""}${o.onMount ? ` · on #${o.onMount.no}` : ""}${P[it.id]?.url ? ` · <a href="${P[it.id].url}" target="_blank" rel="noopener">vendor</a>` : ""}</div></td>
      <td class="num">${it.price ? fmt(it.price) : `<span class="q">${esc(it.priceRaw)}</span>`}</td></tr>`; }).join("")
    : `<tr><td colspan="3" class="empty">Drag devices from the banner into the workstation. The cart prices them as you go.</td></tr>`;
  $$("#cart-lines tr[data-no]").forEach(r => { const o = placed.find(p => p.no === +r.dataset.no);
    r.onmouseenter = () => setHover(o); r.onmouseleave = () => setHover(null); r.onclick = e => { if (e.target.tagName !== "A") select(o); }; });
  const usd = tot["$"] || { lo: 0, hi: 0 };
  $("#cart-total").innerHTML = `${usd.hi ? fmt({ ...usd, cur: "$" }) : "$0"}${tot["€"] ? `<small>+ ${fmt({ ...tot["€"], cur: "€" })}</small>` : ""}`;
  $("#cart-quote").textContent = quote ? `${quote} device${quote > 1 ? "s" : ""} without a list price in the review (quote, lab-built or not listed) are shown but not totalled.` : "Every device has a list price in the review.";
  const budget = +$("#budget").value || 0, pct = budget ? 100 * usd.hi / budget : 0, over = usd.hi > budget;
  $("#budget-bar").style.width = Math.min(100, pct) + "%"; $("#budget-bar").classList.toggle("over", over);
  $("#budget-note").innerHTML = budget ? (over ? `Over budget by <b>${money(usd.hi - budget)}</b>` : `<b>${money(budget - usd.hi)}</b> left`) + " at upper list prices" : "";
  // analysis
  const A = analyse(), cov = A.targets ? Math.round(100 * A.covered.size / A.targets) : 0, fp = Math.round(100 * A.footprint / (areaW * areaD));
  $("#m-devices").textContent = placed.length; $("#m-cov").textContent = A.targets && placed.some(o => byId[o.id].reach) ? cov + "%" : "–";
  $("#m-fp").textContent = fp + "%"; $("#m-budget").textContent = budget ? Math.round(pct) + "%" : "–";
  $("#m-budget").parentElement.classList.toggle("bad", over); $("#m-cov").parentElement.classList.toggle("bad", A.targets && cov < 100 && placed.some(o => byId[o.id].reach));
  $("#m-issues").textContent = A.overlaps.length + A.outside.length; $("#m-issues").parentElement.classList.toggle("bad", A.overlaps.length + A.outside.length > 0);
  // capabilities
  const have = new Set(placed.flatMap(o => byId[o.id].caps || []));
  $("#caps").innerHTML = Object.entries(CAPS).map(([k, n]) => { const ok = have.has(k), s = ok ? null : cheapestFor(k);
    return `<li class="${ok ? "ok" : "miss"}"><span class="ck">${ok ? "✓" : "!"}</span><span>${n}</span>${ok ? "" : `<button type="button" class="fix" data-id="${s.id}" title="${esc(s.name)} · ${esc(s.price ? fmt(s.price) : s.priceRaw)}">Add ${esc(short(s.name).split(" ").slice(0, 2).join(" "))}</button>`}</li>`; }).join("");
  $$("#caps .fix").forEach(b => b.onclick = () => add(b.dataset.id));
  const msgs = [];
  for (const [a, b] of A.overlaps) msgs.push(`<li class="warn"><b>#${a.no}</b> overlaps <b>#${b.no}</b> · ${esc(short(byId[a.id].name))} / ${esc(short(byId[b.id].name))}</li>`);
  for (const o of A.outside) msgs.push(`<li class="warn"><b>#${o.no}</b> ${esc(short(byId[o.id].name))} is outside the ${areaW} × ${areaD} m workstation</li>`);
  for (const r of A.reach) msgs.push(`<li class="${r.outR.length ? "info" : "ok"}"><b>#${r.o.no}</b> ${esc(short(byId[r.o.id].name))} reaches ${r.inR.length ? r.inR.map(t => "#" + t.no).join(", ") : "nothing yet"}${r.outR.length ? `; out of reach: ${r.outR.map(t => "#" + t.no).join(", ")}` : ""}</li>`);
  if (!placed.some(o => byId[o.id].reach) && placed.length) msgs.push(`<li class="info">No arm yet, so nothing carries the premix cup between stations.</li>`);
  $("#checks").innerHTML = msgs.join("") || `<li class="ok">No overlaps. Everything is inside the workstation.</li>`;
  $("#cart-count").textContent = placed.length;
  saveLocal();
}
$("#budget").addEventListener("input", refresh);

/* ================================================================ banner library */
let catFilter = "all";
function banner() {
  const q = $("#search").value.trim().toLowerCase();
  $("#cats").innerHTML = [{ id: "all", name: "All devices", color: "var(--ink-2)" }, ...CATEGORIES].map(c => {
    const n = ITEMS.filter(i => c.id === "all" || i.cat === c.id).length;
    return `<button type="button" data-c="${c.id}" aria-pressed="${catFilter === c.id}"><i style="background:${c.color}"></i>${c.name}<span>${n}</span></button>`; }).join("");
  $$("#cats button").forEach(b => b.onclick = () => { catFilter = b.dataset.c; banner(); $("#cards").scrollLeft = 0; });
  const list = ITEMS.filter(i => (catFilter === "all" || i.cat === catFilter) && (!q || (i.name + " " + i.sub + " " + i.cat).toLowerCase().includes(q)));
  $("#cards").innerHTML = list.map(it => `
    <div class="card" draggable="true" data-id="${it.id}" tabindex="0" title="${esc(it.note || "Drag into the workstation, or press Enter")}">
      <div class="thumb"><img src="thumbs/${it.id}.png" alt="" loading="lazy" onerror="this.remove()"><span class="cat-dot" style="background:${CATEGORIES.find(c => c.id === it.cat).color}"></span>${it.model.startsWith("mesh:") || it.model.startsWith("arm:") ? '<span class="badge">real mesh</span>' : ""}</div>
      <div class="meta"><b>${esc(short(it.name))}</b><span>${esc(it.sub)}${it.reach ? ` · ${it.reach} m` : ""}</span></div>
      <div class="foot"><span class="price ${it.price ? "" : "q"}">${esc(it.price ? fmt(it.price) : it.priceRaw)}</span><button type="button" class="add" data-id="${it.id}" aria-label="Add ${esc(it.name)}">+</button></div>
    </div>`).join("") || `<p class="none">No device matches “${esc(q)}”.</p>`;
  $$("#cards .card").forEach(c => { c.addEventListener("dragstart", ev => { ev.dataTransfer.setData("text/plain", c.dataset.id); ev.dataTransfer.effectAllowed = "copy"; });
    c.addEventListener("keydown", ev => { if (ev.key === "Enter") add(c.dataset.id); }); });
  $$("#cards .add").forEach(b => b.onclick = () => add(b.dataset.id));
}
$("#search").addEventListener("input", banner);
$("#scrollL").onclick = () => $("#cards").scrollBy({ left: -600, behavior: "smooth" });
$("#scrollR").onclick = () => $("#cards").scrollBy({ left: 600, behavior: "smooth" });

/* ================================================================ layouts */
async function load(layout) {
  for (const o of [...placed]) { scene.remove(o.group); o.label.remove(); } placed = []; nextNo = 1; select(null);
  areaW = layout.w || 3; areaD = layout.d || 2; $("#aw").value = areaW; $("#ad").value = areaD; drawArea();
  const made = [];
  for (const [id, x, y, z, rx, ry, rz, dock] of layout.items) { const o = await add(id, x, y, { silent: true, z, rot: [rx, ry, rz] }); made.push([o, dock]); }
  const cnc = placed.find(o => byId[o.id].dock);
  for (const [o, dock] of made) if (dock && cnc) { const k = +dock.slice(4); o.dockedTo = cnc; o.slot = k; }
  for (const o of placed) followDock(o);
  for (const o of placed) if (!byId[o.id].mount && !o.dockedTo) rest(o);
  if (layout.budget) $("#budget").value = layout.budget;
  refresh(); setView("iso");
}
function serialize() {
  return { w: areaW, d: areaD, budget: +$("#budget").value, items: [...placed].sort((a, b) => a.no - b.no).map(o => { const p = o.group.position, r = o.group.rotation;
    const it = [o.id, ...[p.x, p.y, p.z, r.x, r.y, r.z].map(v => +v.toFixed(3))]; if (o.dockedTo) it.push("dock" + o.slot); return it; }) };
}
function saveLocal() { store.set("sfl-builder-v2", JSON.stringify(serialize())); }
$("#template").addEventListener("change", e => { if (e.target.value) load(TEMPLATES[e.target.value]); e.target.value = ""; });
$("#aw").addEventListener("change", e => { areaW = Math.max(1, +e.target.value || 3); drawArea(); refresh(); });
$("#ad").addEventListener("change", e => { areaD = Math.max(1, +e.target.value || 2); drawArea(); refresh(); });
$("#share").addEventListener("click", async () => {
  const url = location.href.split("#")[0] + "#l=" + btoa(JSON.stringify(serialize())).replace(/=+$/, ""); history.replaceState(null, "", url);
  try { await navigator.clipboard.writeText(url); toast("Link copied. Anyone with it opens this exact layout."); } catch { toast("The link is in the address bar. Copy it from there."); }
});
$("#csv").addEventListener("click", () => {
  const rows = [["#", "Device", "Category", "List price (review)", "Low", "High", "Currency", "Review refs", "x (m)", "y (m)", "z (m)", "yaw (deg)"]];
  for (const o of [...placed].sort((a, b) => a.no - b.no)) { const it = byId[o.id], p = o.group.position; rows.push([o.no, it.name, it.sub, it.priceRaw, it.price?.lo ?? "", it.price?.hi ?? "", it.price?.cur ?? "", it.ref || "", p.x.toFixed(3), p.y.toFixed(3), p.z.toFixed(3), deg(o.group.rotation.z).toFixed(1)]); }
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" }));
  a.download = "formulation-cell-parts.csv"; a.click(); toast("Parts list downloaded, with positions.");
});
$("#clear").onclick = () => load(TEMPLATES.empty);
$("#arrange").onclick = autoArrange;
$$("[data-view]").forEach(b => b.onclick = () => setView(b.dataset.view));
function toggleRun() { running = !running; $("#run").setAttribute("aria-pressed", String(running)); $("#run").innerHTML = running ? "❚❚ Pause" : "▶ Run"; }
let labelMode = 1; // 0 off, 1 numbers, 2 numbers + names
function toggleLabels() { labelMode = (labelMode + 1) % 3; showLabels = labelMode > 0; labelsEl.hidden = !showLabels; labelsEl.classList.toggle("full", labelMode === 2);
  $("#labelsBtn").setAttribute("aria-pressed", String(showLabels)); $("#labelsBtn").textContent = ["Labels off", "Labels #", "Labels # + name"][labelMode]; }
$("#run").onclick = toggleRun; $("#labelsBtn").onclick = toggleLabels;
$$(".ptabs button").forEach(b => b.onclick = () => { $$(".ptabs button").forEach(x => x.setAttribute("aria-selected", String(x === b))); $$(".pane").forEach(p => p.hidden = p.id !== b.dataset.pane); });
$("#collapse").onclick = () => { document.body.classList.toggle("panel-off"); setTimeout(resize, 220); };
function toast(t) { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 2800); }

/* ================================================================ loop */
const clock = new THREE.Clock(); let simT = 0; const v3 = new THREE.Vector3();
function loop() {
  requestAnimationFrame(loop); if (!renderer) return;
  const dt = Math.min(clock.getDelta(), .05);
  if (running) { simT += dt; for (const o of placed) { o.group.userData.tick?.(simT + o.no * .37, dt); } }
  controls.update(); selBox?.update(); hovBox?.update();
  if (showLabels) { const r = view.getBoundingClientRect();
    for (const o of placed) { v3.copy(o.group.position); const bb = o._bb ?? (o._bb = boxOf(o)); v3.z = o.group.position.z + (bb.max.z - bb.min.z) + .06; v3.project(camera);
      const vis = v3.z < 1 && Math.abs(v3.x) < 1.1 && Math.abs(v3.y) < 1.1; o.label.style.display = vis ? "" : "none";
      if (vis) o.label.style.transform = `translate(${(v3.x + 1) / 2 * r.width}px, ${(1 - v3.y) / 2 * r.height}px) translate(-50%, -100%)`; } }
  renderer.render(scene, camera);
}

/* ================================================================ boot */
drawArea(); resize(); banner(); loop();
const Q = new URLSearchParams(location.search), h = location.hash.match(/#l=([A-Za-z0-9+/]+)/);
let saved = null; { const s = store.get("sfl-builder-v2"); if (s) { try { const j = JSON.parse(s); if (j.items?.length) saved = j; } catch { } } }
$("#template").innerHTML = `<option value="">Load a template…</option>` + Object.entries(TEMPLATES).map(([k, t]) => `<option value="${k}">${esc(t.name)}</option>`).join("");
if (Q.get("t") && TEMPLATES[Q.get("t")]) await load(TEMPLATES[Q.get("t")]);
else if (h) { let L = TEMPLATES.sfl; try { L = JSON.parse(atob(h[1])); } catch { } await load(L); }
else if (Q.get("add")) { await load(Q.has("fresh") || !saved ? TEMPLATES.empty : saved); for (const id of Q.get("add").split(",")) if (byId[id]) await add(id); toast("Added from the parts library. Drag it where it belongs."); }
else { await load(saved || TEMPLATES.sfl); startScreen(!!saved); }
if (Q.toString()) history.replaceState(null, "", location.pathname + location.hash);

/* ================================================================ start screen (like a "new design" chooser) */
function startScreen(hasSaved) {
  const el = document.createElement("div"); el.className = "start"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Start a design");
  const total = t => { let lo = 0; for (const [id] of t.items) { const it = byId[id]; if (it?.price && it.price.cur === "$") lo += it.price.lo; } return lo; };
  el.innerHTML = `<div class="start-in"><div class="start-h"><div><p class="k">New design</p><h2>How do you want to start?</h2></div><button type="button" class="x" aria-label="Close">✕</button></div>
    <div class="start-g">
      ${hasSaved ? `<button type="button" class="opt hl" data-k="__saved"><b>Continue your design</b><span>${saved.items.length} parts, saved in this browser</span></button>` : ""}
      <button type="button" class="opt" data-k="empty"><b>Blank workstation</b><span>A 3 × 2 m floor and the whole library</span></button>
      ${Object.entries(TEMPLATES).filter(([k]) => k !== "empty").map(([k, t]) => `<button type="button" class="opt" data-k="${k}"><div class="ims">${[...new Set(t.items.map(i => i[0]))].slice(0, 3).map(id => `<img src="thumbs/${id}.png" alt="" onerror="this.remove()">`).join("")}</div><b>${esc(t.name)}</b><span>${t.items.length} parts · from ${money(total(t))}</span></button>`).join("")}
    </div><p class="fine">Every template is a starting point. Swap any part, check the cell, then send it to your cart.</p></div>`;
  document.body.append(el);
  const close = () => el.remove();
  el.addEventListener("click", async e => { if (e.target === el || e.target.closest(".x")) return close(); const b = e.target.closest("[data-k]"); if (!b) return;
    close(); if (b.dataset.k !== "__saved") await load(TEMPLATES[b.dataset.k]); });
  addEventListener("keydown", function k(e) { if (e.key === "Escape") { close(); removeEventListener("keydown", k); } });
  el.querySelector(".opt").focus();
}

/* ================================================================ send the design to the shared Laboo cart */
$("#tocart").addEventListener("click", () => {
  const counts = {}; for (const o of placed) if (P[o.id]) counts[o.id] = (counts[o.id] || 0) + 1;
  if (!Object.keys(counts).length) { toast("Place a few parts first."); return; }
  blCart.replace(counts); location.href = "../cart/";
});
