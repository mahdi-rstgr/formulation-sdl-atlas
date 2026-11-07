import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CATEGORIES, ITEMS, PROC, addDock } from "./catalog.js";

const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const REFS = "../wiki/references/#ref-";
const linkRefs = s => esc(s).replace(/\[([\d,\s–-]+)\]/g, (_, l) => "[" + l.split(",").map(n => n.trim()).map(n => /^\d+$/.test(n) ? `<a href="${REFS}${n}" target="_blank" rel="noopener">${n}</a>` : n).join(", ") + "]");
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { } } };

/* ------------------------------------------------------------------ prices from the review */
const R = await (await fetch("../data/review.json")).json();
function parsePrice(s) {
  const nums = [], cur = /€/.test(s) ? "€" : "$";
  for (const m of String(s).matchAll(/[$€]\s?([\d,]+)(?:\s*[–-]\s*([\d,]+))?/g)) { nums.push(+m[1].replace(/,/g, "")); if (m[2]) nums.push(+m[2].replace(/,/g, "")); }
  return nums.length ? { lo: Math.min(...nums), hi: Math.max(...nums), cur } : null;
}
for (const it of ITEMS) {
  if (it.src) {
    const [t, key] = it.src, rows = R[t].rows;
    const row = rows.find(r => Object.values(r).some(v => String(v).includes(key)));
    if (row) {
      it.row = row; it.ref = row.Ref || "";
      it.spec = row.Accuracy || row.Repeatability || row["Accuracy / precision"] || "";
      let raw = row.Price || "";
      if (it.priceIndex != null) { const parts = raw.split(";").map(s => s.trim()); raw = parts[it.priceIndex] || raw; }
      it.priceRaw = raw; it.price = parsePrice(raw);
    }
  }
  if (!it.priceRaw || /^[-–]$/.test(it.priceRaw.trim())) it.priceRaw = it.price || (it.row ? "Not listed" : "Not in review"), it.price = null;
  it.quote = !it.price;
}
const money = (v, cur = "$") => cur + Math.round(v).toLocaleString("en-US");
const fmt = p => p ? (p.lo === p.hi ? money(p.lo, p.cur) : `${money(p.lo, p.cur)}–${Math.round(p.hi).toLocaleString("en-US")}`) : "";

/* ------------------------------------------------------------------ three.js scene */
const view = $("#canvas");
let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); view.appendChild(renderer.domElement); }
catch { view.innerHTML = '<p class="nogl">The 3D workstation needs WebGL, which is turned off in this browser.</p>'; }
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.02, 60); camera.up.set(0, 0, 1);
const controls = new OrbitControls(camera, renderer?.domElement ?? view);
controls.enableDamping = true; controls.maxPolarAngle = Math.PI * .48;
scene.add(new THREE.HemisphereLight(0xffffff, 0x8a94a6, 1.15));
const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(2, -3, 5); scene.add(sun);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ visible: false })); scene.add(ground);
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
let grid, area, areaW = 3, areaD = 2;
function paint() {
  scene.background = new THREE.Color(css("--stage"));
  if (grid) scene.remove(grid);
  const dark = matchMedia("(prefers-color-scheme: dark)").matches;
  grid = new THREE.GridHelper(12, 120, dark ? 0x2a3541 : 0xc8d0d8, dark ? 0x1b242e : 0xe1e6ea); grid.rotation.x = Math.PI / 2; scene.add(grid);
  drawArea();
}
function drawArea() {
  if (area) scene.remove(area);
  const g = new THREE.Group();
  const fill = new THREE.Mesh(new THREE.PlaneGeometry(areaW, areaD), new THREE.MeshBasicMaterial({ color: new THREE.Color(css("--accent")), transparent: true, opacity: .06, depthWrite: false }));
  fill.position.z = .001; g.add(fill);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(areaW, areaD)), new THREE.LineBasicMaterial({ color: new THREE.Color(css("--accent")) }));
  edge.position.z = .002; g.add(edge); area = g; scene.add(g);
}
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", paint);
function resize() { const w = view.clientWidth, h = view.clientHeight; if (!w || !h || !renderer) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(view);
function home() { const s = Math.max(areaW, areaD); camera.position.set(s * .55, -s * 1.15, s * .9); controls.target.set(0, 0, .2); controls.update(); }

/* ------------------------------------------------------------------ model loading */
const meshCache = {};
async function meshModel(id) {
  meshCache[id] ??= fetch(`../data/models/${id}.json`).then(r => r.json()).then(doc => {
    const parts = doc.parts.map(p => {
      const s = atob(p.v), q = new Uint16Array(new Uint8Array([...s].map(c => c.charCodeAt(0))).buffer);
      const pos = new Float32Array(q.length);
      for (let i = 0; i < q.length; i++) pos[i] = q[i] * doc.scale[i % 3] + doc.offset[i % 3];
      const f = atob(p.f), idx = new Uint32Array(new Uint8Array([...f].map(c => c.charCodeAt(0))).buffer);
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeVertexNormals();
      return { g, m: new THREE.MeshStandardMaterial({ color: p.color, roughness: .5, metalness: .12 }) };
    });
    return { parts, size: doc.size };
  });
  return meshCache[id];
}
async function buildModel(it) {
  const g = new THREE.Group();
  if (it.model.startsWith("mesh:")) {
    const mm = await meshModel(it.model.slice(5));
    for (const p of mm.parts) g.add(new THREE.Mesh(p.g, p.m));
    if (it.dock) g.userData.slots = addDock(g, mm.size);
  } else g.add(PROC[it.model](it.dims, it.color || "#c9cfd6", it.style || {}));
  return g;
}

/* ------------------------------------------------------------------ placed devices */
let placed = [], uid = 1, selected = null, dirty = false;
const byId = Object.fromEntries(ITEMS.map(i => [i.id, i]));
const footprint = obj => { const b = new THREE.Box3().setFromObject(obj.group); return b; };
async function add(id, x = null, y = null, rot = 0, opts = {}) {
  const it = byId[id]; if (!it) return;
  const group = await buildModel(it);
  const obj = { uid: uid++, id, group, rot, dockedTo: null, slot: null };
  group.userData.obj = obj;
  group.rotation.z = rot;
  if (x == null) { const p = freeSpot(obj); x = p.x; y = p.y; }
  group.position.set(x, y, 0);
  scene.add(group); placed.push(obj);
  if (it.stack) rest(obj);
  if (it.reach) { const ring = new THREE.Mesh(new THREE.RingGeometry(it.reach - .006, it.reach, 96), new THREE.MeshBasicMaterial({ color: 0x23906b, transparent: true, opacity: .55, side: THREE.DoubleSide, depthWrite: false })); ring.position.z = .003; group.add(ring); obj.ring = ring; }
  if (it.tool) trySnap(obj);
  if (!opts.silent) { select(obj); refresh(); }
  return obj;
}
function freeSpot(obj) {  // first spot (spiral from the centre, 5 cm grid) whose footprint touches nothing
  const others = placed.map(rect);
  for (let r = 0; r < Math.max(areaW, areaD) * 1.5; r += .1) for (let a = 0; a < 6.283; a += r ? .1 / r : 7) {
    obj.group.position.set(snap(Math.cos(a) * r), snap(Math.sin(a) * r), 0);
    const me = rect(obj);
    if (!others.some(o => overlap(me, o))) return { x: obj.group.position.x, y: obj.group.position.y };
  }
  return { x: areaW / 2 + 1, y: 0 };
}
function rest(obj) {  // small labware sits on whatever device is under it
  obj.group.position.z = 0; let top = 0;
  const p = obj.group.position;
  for (const o of placed) { if (o === obj || byId[o.id].stack) continue; const b = new THREE.Box3().setFromObject(o.group);
    if (p.x > b.min.x && p.x < b.max.x && p.y > b.min.y && p.y < b.max.y) top = Math.max(top, b.max.z); }
  obj.group.position.z = top;
}
function remove(obj) { scene.remove(obj.group); placed = placed.filter(o => o !== obj); for (const o of placed) if (o.dockedTo === obj) { o.dockedTo = null; o.group.position.z = 0; } if (selected === obj) select(null); refresh(); }
function trySnap(obj) {
  obj.dockedTo = null; obj.group.position.z = 0;
  for (const host of placed) {
    const slots = host.group.userData.slots; if (!slots) continue;
    for (let k = 0; k < slots.length; k++) {
      const w = host.group.localToWorld(slots[k].clone());
      if (Math.hypot(w.x - obj.group.position.x, w.y - obj.group.position.y) < .12 && !placed.some(o => o !== obj && o.dockedTo === host && o.slot === k)) {
        obj.group.position.set(w.x, w.y, w.z); obj.dockedTo = host; obj.slot = k; return true;
      }
    }
  }
  return false;
}

/* selection */
let selBox = null;
function select(obj) {
  selected = obj;
  if (selBox) { scene.remove(selBox); selBox = null; }
  if (obj) { selBox = new THREE.BoxHelper(obj.group, new THREE.Color(css("--accent"))); scene.add(selBox); }
  renderSelected();
}
function renderSelected() {
  const el = $("#selected");
  if (!selected) { el.innerHTML = `<p class="muted">Select a device in the workstation to move, rotate or remove it. Drag devices from the library, or press <b>Add</b>.</p>`; return; }
  const it = byId[selected.id];
  el.innerHTML = `<div class="sel-head"><b>${esc(it.name)}</b><span class="muted">${esc(it.sub)}</span></div>
    <div class="sel-actions">
      <button type="button" data-a="rl" title="Rotate 15° left (Q)">⟲ 15°</button><button type="button" data-a="rr" title="Rotate 15° right (E)">⟳ 15°</button>
      <button type="button" data-a="r90" title="Rotate 90° (R)">90°</button><button type="button" data-a="dup" title="Duplicate (D)">Duplicate</button>
      <button type="button" data-a="del" class="danger" title="Delete (Del)">Remove</button></div>
    <p class="small">${esc(it.priceRaw)} ${linkRefs(it.ref)} ${it.spec ? "· " + esc(it.spec) : ""}${it.reach ? ` · reach ${it.reach} m` : ""}${selected.dockedTo ? " · docked on the CNC tool dock" : ""}</p>`;
  el.querySelectorAll("button").forEach(b => b.onclick = () => act(b.dataset.a));
}
function act(a) {
  if (!selected) return;
  const g = selected.group;
  if (a === "rl") g.rotation.z += Math.PI / 12; if (a === "rr") g.rotation.z -= Math.PI / 12; if (a === "r90") g.rotation.z += Math.PI / 2;
  if (a === "dup") return add(selected.id, g.position.x + .4, g.position.y, g.rotation.z);
  if (a === "del") return remove(selected);
  selected.rot = g.rotation.z;
  if (selected.group.userData.slots) for (const o of placed) if (o.dockedTo === selected) { const w = g.localToWorld(g.userData.slots[o.slot].clone()); o.group.position.copy(w); }
  select(selected); refresh();
}

/* ------------------------------------------------------------------ pointer interaction */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function floorAt(ev) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera); const p = new THREE.Vector3(); return ray.ray.intersectPlane(floorPlane, p) ? p : null;
}
function pick(ev) {
  floorAt(ev);
  const hits = ray.intersectObjects(placed.map(o => o.group), true).filter(h => !(h.object.geometry?.type === "RingGeometry"));
  let o = hits[0]?.object; while (o && !o.userData.obj) o = o.parent; return o?.userData.obj ?? null;
}
const snap = v => Math.round(v / .05) * .05;
let drag = null;
if (renderer) {
  renderer.domElement.addEventListener("pointerdown", ev => {
    const obj = pick(ev); if (!obj) { if (ev.button === 0 && !ev.shiftKey) select(null); return; }
    select(obj); const p = floorAt(ev);
    drag = { obj, dx: obj.group.position.x - p.x, dy: obj.group.position.y - p.y, moved: false };
    controls.enabled = false; renderer.domElement.setPointerCapture(ev.pointerId);
  });
  renderer.domElement.addEventListener("pointermove", ev => {
    if (!drag) return; const p = floorAt(ev); if (!p) return;
    const g = drag.obj.group; g.position.set(snap(p.x + drag.dx), snap(p.y + drag.dy), 0); drag.moved = true;
    if (g.userData.slots) for (const o of placed) if (o.dockedTo === drag.obj) o.group.position.copy(g.localToWorld(g.userData.slots[o.slot].clone()));
    selBox?.update();
  });
  renderer.domElement.addEventListener("pointerup", () => {
    if (!drag) return; controls.enabled = true;
    if (drag.moved) { const it = byId[drag.obj.id]; if (it.tool) trySnap(drag.obj); if (it.stack) rest(drag.obj); refresh(); select(drag.obj); }
    drag = null;
  });
  view.addEventListener("dragover", ev => { ev.preventDefault(); ev.dataTransfer.dropEffect = "copy"; view.classList.add("drop"); });
  view.addEventListener("dragleave", () => view.classList.remove("drop"));
  view.addEventListener("drop", async ev => { ev.preventDefault(); view.classList.remove("drop"); const id = ev.dataTransfer.getData("text/plain"); const p = floorAt(ev); if (id && p) await add(id, snap(p.x), snap(p.y)); });
}
addEventListener("keydown", ev => {
  if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName)) return;
  const k = ev.key.toLowerCase();
  if (k === "delete" || k === "backspace") { ev.preventDefault(); act("del"); }
  if (k === "q") act("rl"); if (k === "e") act("rr"); if (k === "r") act("r90"); if (k === "d") act("dup"); if (k === "escape") select(null);
});

/* ------------------------------------------------------------------ checks: overlap, reach, area */
function rect(o) { // oriented footprint as 4 corners
  const b = new THREE.Box3(); o.group.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(o.group.matrixWorld).invert();
  o.group.traverse(m => { if (m.isMesh && m.geometry.type !== "RingGeometry" && m.geometry.type !== "TorusGeometry") { m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld)); b.union(bb); } });
  return [[b.min.x, b.min.y], [b.max.x, b.min.y], [b.max.x, b.max.y], [b.min.x, b.max.y]].map(([x, y]) => new THREE.Vector3(x, y, 0).applyMatrix4(o.group.matrixWorld));
}
function overlap(a, b) { // SAT on two convex quads
  for (const poly of [a, b]) for (let i = 0; i < 4; i++) {
    const p1 = poly[i], p2 = poly[(i + 1) % 4], nx = p2.y - p1.y, ny = p1.x - p2.x;
    const pa = a.map(p => p.x * nx + p.y * ny), pb = b.map(p => p.x * nx + p.y * ny);
    if (Math.max(...pa) <= Math.min(...pb) + 1e-3 || Math.max(...pb) <= Math.min(...pa) + 1e-3) return false;
  }
  return true;
}
function checks() {
  const R = placed.map(o => ({ o, r: rect(o) })), out = { overlaps: [], outside: [], reach: [] };
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
    const a = R[i], b = R[j];
    if (a.o.dockedTo === b.o || b.o.dockedTo === a.o || (a.o.dockedTo && a.o.dockedTo === b.o.dockedTo)) continue;
    if (byId[a.o.id].stack || byId[b.o.id].stack) continue;
    if (overlap(a.r, b.r)) out.overlaps.push([a.o, b.o]);
  }
  for (const { o, r } of R) if (r.some(p => Math.abs(p.x) > areaW / 2 + 1e-3 || Math.abs(p.y) > areaD / 2 + 1e-3)) out.outside.push(o);
  for (const { o } of R) {
    const it = byId[o.id]; if (!it.reach) continue;
    const base = o.group.position, inR = [], outR = [];
    for (const { o: t, r } of R) {
      if (t === o || byId[t.id].cat === "arm") continue;
      const c = r.reduce((a, p) => a.add(p), new THREE.Vector3()).multiplyScalar(.25);
      const d = Math.hypot(c.x - base.x, c.y - base.y);
      (d <= it.reach ? inR : outR).push(byId[t.id].name.split(" (")[0]);
    }
    out.reach.push({ o, inR, outR });
  }
  return out;
}

/* ------------------------------------------------------------------ cart + report */
function refresh() {
  dirty = true;
  const lines = {}; for (const o of placed) (lines[o.id] ??= { it: byId[o.id], n: 0 }).n++;
  const L = Object.values(lines);
  const tot = {}; let quote = 0;
  for (const { it, n } of L) { if (it.price) { const c = it.price.cur; tot[c] ??= { lo: 0, hi: 0 }; tot[c].lo += n * it.price.lo; tot[c].hi += n * it.price.hi; } else quote += n; }
  $("#cart-lines").innerHTML = L.length ? L.sort((a, b) => (b.it.price?.hi ?? 0) * b.n - (a.it.price?.hi ?? 0) * a.n).map(({ it, n }) => `
    <tr><td><span class="sw cat-${it.cat}"></span>${esc(it.name)}<div class="muted small">${esc(it.sub)} ${linkRefs(it.ref)}</div></td>
    <td class="num">${n}</td><td class="num">${it.price ? fmt({ lo: it.price.lo * n, hi: it.price.hi * n, cur: it.price.cur }) : `<span class="q">${esc(it.priceRaw)}</span>`}</td></tr>`).join("")
    : `<tr><td colspan="3" class="muted">The cart fills as you place devices.</td></tr>`;
  const usd = tot["$"] || { lo: 0, hi: 0 };
  $("#cart-total").innerHTML = `${usd.hi ? fmt({ ...usd, cur: "$" }) : "$0"}${tot["€"] ? ` <span class="muted">+ ${fmt({ ...tot["€"], cur: "€" })}</span>` : ""}`;
  $("#cart-quote").textContent = quote ? `${quote} item${quote > 1 ? "s" : ""} without a list price in the review (quote, lab-built or not listed) are not in the total.` : "Every item has a list price in the review.";
  const budget = +$("#budget").value || 0, pct = budget ? Math.min(100, 100 * usd.hi / budget) : 0, over = usd.hi > budget;
  $("#budget-bar").style.width = pct + "%"; $("#budget-bar").classList.toggle("over", over);
  $("#budget-note").innerHTML = budget ? (over ? `Over budget by <b>${money(usd.hi - budget)}</b> at upper list prices.` : `<b>${money(budget - usd.hi)}</b> left at upper list prices.`) : "";
  $("#count").textContent = placed.length;
  const c = checks();
  const msgs = [];
  for (const [a, b] of c.overlaps) msgs.push(`<li class="warn">${esc(byId[a.id].name.split(" (")[0])} overlaps ${esc(byId[b.id].name.split(" (")[0])}</li>`);
  for (const o of c.outside) msgs.push(`<li class="warn">${esc(byId[o.id].name.split(" (")[0])} is outside the ${areaW} × ${areaD} m workstation</li>`);
  for (const r of c.reach) msgs.push(`<li class="${r.outR.length ? "info" : "ok"}">${esc(byId[r.o.id].name)} reaches ${r.inR.length ? esc(r.inR.join(", ")) : "nothing yet"}${r.outR.length ? `; out of reach: ${esc(r.outR.join(", "))}` : ""}</li>`);
  $("#checks").innerHTML = msgs.join("") || `<li class="ok">No overlaps. Everything is inside the workstation.</li>`;
  saveLocal();
}
$("#budget").addEventListener("input", refresh);

/* ------------------------------------------------------------------ library */
function library(filter = "") {
  const f = filter.trim().toLowerCase();
  $("#library").innerHTML = CATEGORIES.map(cat => {
    const items = ITEMS.filter(i => i.cat === cat.id && (!f || (i.name + " " + i.sub).toLowerCase().includes(f)));
    if (!items.length) return "";
    return `<details class="cat" open><summary><span class="sw cat-${cat.id}"></span>${cat.name}<span class="muted">${items.length}</span></summary>` +
      cat.subs.map(sub => { const its = items.filter(i => i.sub === sub); return its.length ? `<div class="sub">${esc(sub)}</div>` + its.map(it => `
        <div class="dev" draggable="true" data-id="${it.id}" tabindex="0" title="${esc(it.note || "Drag into the workstation, or press Add")}">
          <div class="dev-main"><b>${esc(it.name)}</b><span class="muted small">${it.model.startsWith("mesh:") ? "real mesh · " : ""}${it.reach ? `reach ${it.reach} m · ` : ""}${esc(it.spec ? it.spec.split(";")[0] : it.sub)}</span></div>
          <div class="dev-side"><span class="price ${it.quote ? "q" : ""}">${esc(it.price ? fmt(it.price) : it.priceRaw)}</span><button type="button" class="add" data-id="${it.id}" aria-label="Add ${esc(it.name)}">Add</button></div>
        </div>`).join("") : ""; }).join("") + `</details>`;
  }).join("") || `<p class="muted">No device matches “${esc(filter)}”.</p>`;
  document.querySelectorAll(".dev").forEach(d => d.addEventListener("dragstart", ev => { ev.dataTransfer.setData("text/plain", d.dataset.id); ev.dataTransfer.effectAllowed = "copy"; }));
  document.querySelectorAll(".add").forEach(b => b.onclick = () => add(b.dataset.id));
}
$("#search").addEventListener("input", e => library(e.target.value));

/* ------------------------------------------------------------------ layouts: templates, save, share, export */
const TEMPLATES = {
  sfl: { name: "Self-Formulating Lab cell", w: 3, d: 2, items: [["cnc4040", .55, .25, 0], ["ecopen", 0, 0, 0, "dock0"], ["powder-hapd", 0, 0, 0, "dock1"], ["balance", .55, -.55, 0], ["ur5e", -.15, -.2, 0], ["thinky", -.7, .3, 0], ["characterizer", -.85, -.55, 0], ["cup", .55, -.55, 0]] },
  liquid: { name: "Liquid-handling bench", w: 3, d: 1.5, items: [["ot2", -.8, .2, 0], ["ur3e", 0, 0, 0], ["balance", .45, -.3, 0], ["vortex", .45, .3, 0], ["characterizer", 1.0, 0, 0]] },
  powder: { name: "Powder & paste station", w: 3, d: 2, items: [["quantos", -.9, .4, 0], ["mt12", -.9, -.45, 0], ["ultimus", .9, .45, 0], ["lite6", 0, 0, 0], ["thinky", .9, -.45, 0], ["balance", -.2, .65, 0]] },
  empty: { name: "Empty workstation", w: 3, d: 2, items: [] },
};
async function load(layout) {
  for (const o of [...placed]) scene.remove(o.group); placed = []; select(null);
  areaW = layout.w || 3; areaD = layout.d || 2; $("#aw").value = areaW; $("#ad").value = areaD; drawArea();
  let cnc = null;
  for (const [id, x, y, rot, dock] of layout.items) {
    const o = await add(id, x, y, rot, { silent: true });
    if (id === "cnc4040") cnc = o;
    if (dock && cnc) { const k = +dock.slice(4); const w = cnc.group.localToWorld(cnc.group.userData.slots[k].clone()); o.group.position.copy(w); o.dockedTo = cnc; o.slot = k; }
  }
  for (const o of placed) if (byId[o.id].stack) rest(o);
  if (layout.budget) $("#budget").value = layout.budget;
  refresh(); home();
}
function serialize() {
  return { w: areaW, d: areaD, budget: +$("#budget").value, items: placed.map(o => { const p = o.group.position; const it = [o.id, +p.x.toFixed(3), +p.y.toFixed(3), +o.group.rotation.z.toFixed(3)]; if (o.dockedTo) it.push("dock" + o.slot); return it; }) };
}
function saveLocal() { store.set("sfl-builder-layout", JSON.stringify(serialize())); }
$("#template").addEventListener("change", e => { if (e.target.value) load(TEMPLATES[e.target.value]); });
$("#aw").addEventListener("change", e => { areaW = Math.max(1, +e.target.value || 3); drawArea(); refresh(); });
$("#ad").addEventListener("change", e => { areaD = Math.max(1, +e.target.value || 2); drawArea(); refresh(); });
$("#share").addEventListener("click", async () => {
  const url = location.href.split("#")[0] + "#l=" + btoa(JSON.stringify(serialize())).replace(/=+$/, "");
  history.replaceState(null, "", url);
  try { await navigator.clipboard.writeText(url); toast("Link copied. Anyone with it sees this layout."); } catch { toast("Link is in the address bar. Copy it from there."); }
});
$("#csv").addEventListener("click", () => {
  const rows = [["Device", "Category", "Qty", "List price (review)", "Unit low", "Unit high", "Currency", "Review refs"]];
  const lines = {}; for (const o of placed) (lines[o.id] ??= { it: byId[o.id], n: 0 }).n++;
  for (const { it, n } of Object.values(lines)) rows.push([it.name, it.sub, n, it.priceRaw, it.price?.lo ?? "", it.price?.hi ?? "", it.price?.cur ?? "", it.ref || ""]);
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "formulation-cell-bom.csv"; a.click();
  toast("Bill of materials downloaded.");
});
$("#clear").addEventListener("click", () => load(TEMPLATES.empty));
$("#home").addEventListener("click", home);
function toast(t) { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 2600); }

/* ------------------------------------------------------------------ boot */
paint(); resize(); library();
(function tick() { requestAnimationFrame(tick); if (!renderer) return; controls.update(); if (selBox && selected) selBox.update(); renderer.render(scene, camera); })();
let start = TEMPLATES.sfl;
const hash = location.hash.match(/#l=([A-Za-z0-9+/]+)/);
if (hash) { try { start = JSON.parse(atob(hash[1])); } catch { } }
else { const s = store.get("sfl-builder-layout"); if (s) { try { const j = JSON.parse(s); if (j.items?.length) start = j; } catch { } } }
await load(start);
