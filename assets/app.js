import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const REFS = "../wiki/references/#ref-";
const linkRefs = s => esc(s).replace(/\[([\d,\s–-]+)\]/g, (_, list) =>
  "[" + list.split(",").map(n => n.trim()).map(n => /^\d+$/.test(n) ? `<a class="ref" href="${REFS}${n}">${n}</a>` : n).join(", ") + "]");
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const CLASS = { liquid: "c-liquid", "semi-solid": "c-semi", semi: "c-semi", powder: "c-powder", object: "c-object", platform: "c-platform" };
const classOf = m => /liquid/i.test(m) ? "liquid" : /semi|gel|paste/i.test(m) ? "semi" : /powder|granular/i.test(m) ? "powder" : "object";

/** Parse "$191–350", "~$42,000 (reseller)", "€104,500", "OT-2 from $15,950; Flex from $26,400" → {lo, hi, cur} or null (quote / not listed). */
function parsePrice(s) {
  const nums = [], cur = /€/.test(s) ? "€" : "$";
  for (const m of String(s).matchAll(/[$€]\s?([\d,]+)(?:\s*[–-]\s*([\d,]+))?/g)) {
    nums.push(+m[1].replace(/,/g, ""));
    if (m[2]) nums.push(+m[2].replace(/,/g, ""));
  }
  return nums.length ? { lo: Math.min(...nums), hi: Math.max(...nums), cur } : null;
}
const money = (v, cur = "$") => cur + Math.round(v).toLocaleString("en-US");
const fmtPrice = p => !p ? "Quote" : p.lo === p.hi ? money(p.lo, p.cur) : `${money(p.lo, p.cur)}–${Math.round(p.hi).toLocaleString("en-US")}`;
/** Parse repeatability strings such as "±0.03 mm", "0.3–0.5 mm", "<±0.1 mm" → worst case in mm. */
function parseRep(s) {
  const n = [...String(s).matchAll(/(\d*\.\d+|\d+)/g)].map(m => +m[1]);
  return n.length ? Math.max(...n.filter(x => x < 5).slice(0, 2)) : null;
}

const R = await (await fetch("../data/review.json")).json();

/* ================================================================ twin */
const view = $("#view");
let renderer = null;
try { renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); view.appendChild(renderer.domElement); }
catch { view.innerHTML = '<p class="muted" style="padding:24px">The 3D twin needs WebGL, which this browser has turned off. Everything else on the page works.</p>'; }
const scene3 = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 50);
camera.up.set(0, 0, 1);
const controls = new OrbitControls(camera, renderer?.domElement ?? view);
controls.enableDamping = true; controls.enableZoom = false;
scene3.add(new THREE.HemisphereLight(0xffffff, 0x8a94a6, 1.15));
const sun = new THREE.DirectionalLight(0xffffff, 1.25); sun.position.set(2, -3, 4); scene3.add(sun);
const grid = new THREE.GridHelper(4, 40); grid.rotation.x = Math.PI / 2; scene3.add(grid);
function paintTheme() {
  scene3.background = new THREE.Color(css("--stage") || "#e9eef3");
  const dark = matchMedia("(prefers-color-scheme: dark)").matches;
  grid.material.color = new THREE.Color(dark ? 0x26313c : 0xc9d2db); grid.material.opacity = .9;
}
paintTheme(); matchMedia("(prefers-color-scheme: dark)").addEventListener("change", paintTheme);
function resize() { const w = view.clientWidth, h = view.clientHeight; if (!w || !h || !renderer) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(view);

const COLORS = { mixer: 0xf0f1f3, frame: 0x9aa3ad, shaft: 0xc0c6cd, head: 0x2f6fd6, tool: 0x3b4048, adapter: 0x7a8592, pan: 0xc9cfd6, body: 0x3b4048 };
const dec = (b64, T) => { const s = atob(b64), a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return new T(a.buffer); };
function meshFrom(m, color) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(dec(m.vertices, Float32Array), 3));
  g.setIndex(new THREE.BufferAttribute(dec(m.faces, Uint32Array), 1));
  if (m.normals) g.setAttribute("normal", new THREE.BufferAttribute(dec(m.normals, Float32Array), 3)); else g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, metalness: 0.15, roughness: 0.55 }));
}
const M4 = a => new THREE.Matrix4().fromArray(a);
const rotZ = q => new THREE.Matrix4().makeRotationZ(q);

let S = null, world = null, links = [], cup = null, devGroups = {}, boxHelpers = [], frames = [], fi = 0, carrying = false;
let segs = [], segIndex = [], showBoxes = false, focusName = "overview", camGoal = null;
const cache = {};
async function loadArm(arm) {
  $("#hud-meta").textContent = "Loading " + arm.toUpperCase() + "…";
  S = cache[arm] ??= await (await fetch(`../data/twin/${arm}.json`)).json();
  if (world) scene3.remove(world);
  world = new THREE.Group(); scene3.add(world); devGroups = {}; boxHelpers = [];
  for (const d of S.devices) {
    const g = new THREE.Group(); g.matrixAutoUpdate = false; g.matrix.copy(M4(d.pose));
    if (d.meshes.length) for (const m of d.meshes) { const key = Object.keys(COLORS).find(k => m.name.includes(k)); g.add(meshFrom(m, COLORS[key] ?? 0xc9cfd6)); }
    else if (d.box) { const [lo, hi] = d.box; const b = new THREE.Mesh(new THREE.BoxGeometry(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]), new THREE.MeshStandardMaterial({ color: d.color, roughness: .6 })); b.position.set((hi[0] + lo[0]) / 2, (hi[1] + lo[1]) / 2, (hi[2] + lo[2]) / 2); g.add(b); }
    world.add(g); devGroups[d.name] = g;
  }
  world.updateMatrixWorld(true);
  for (const g of Object.values(devGroups)) { const h = new THREE.Box3Helper(new THREE.Box3().setFromObject(g), 0xe0563b); h.visible = showBoxes; world.add(h); boxHelpers.push(h); }
  const armGroup = new THREE.Group(); world.add(armGroup);
  links = ["base", "shoulder", "upper_arm", "forearm", "wrist_1", "wrist_2", "wrist_3"].map(n => {
    const g = new THREE.Group(); g.matrixAutoUpdate = false;
    for (const m of S.arm_meshes[n]) g.add(meshFrom(m, n === "base" ? 0x9aa3ad : 0xdfe3e8));
    armGroup.add(g); return g;
  });
  const grip = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color: 0x3b4048 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.06), mat); body.position.z = 0.03; grip.add(body);
  for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.03, S.gripper - 0.06), mat); f.position.set(s * 0.045, 0, 0.06 + (S.gripper - 0.06) / 2); grip.add(f); }
  links[6].add(grip);
  cup = new THREE.Group(); for (const m of S.cup) cup.add(meshFrom(m, 0xe2b56b)); cup.matrixAutoUpdate = false; world.add(cup);
  carrying = false; frames = []; placeCup("balance"); setQ(S.arm.home); renderSteps([]);
  $("#hud-meta").textContent = `${S.arm.name.toUpperCase()} · reach ${S.arm.reach} m · payload ${S.arm.payload_kg} kg`;
  focus(focusName, true);
}
function placeCup(st) { const p = S.stations[st]; cup.matrix.makeTranslation(p[0], p[1], p[2]); cup.userData.station = st; }
function fk(qv) {
  let T = M4(S.base).multiply(M4(S.arm.base_to_inertia)); const out = [T.clone()];
  for (let i = 0; i < 6; i++) { T = T.multiply(M4(S.arm.origins[i])).multiply(rotZ(qv[i])); out.push(T.clone()); }
  return out;
}
function setQ(qv) {
  const F = fk(qv);
  F.forEach((m, i) => { links[i].matrix.copy(m); links[i].matrixWorldNeedsUpdate = true; });
  if (carrying) cup.matrix.copy(F[6].clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, S.gripper + 0.01 + S.cup_height)).multiply(new THREE.Matrix4().makeRotationX(Math.PI)));
}
function renderSteps(list, active = -1) {
  $("#hud-steps").innerHTML = list.map((s, i) => `<span class="${i === active ? "on" : ""}" title="minimum clearance ${s.min_clearance_mm} mm">${esc(s.label)}</span>`).join("");
}
function runRoute(src, dst) {
  const r = S.runs.find(x => x.source === src && x.dest === dst);
  if (!r || r.error) return;
  if (cup.userData.station !== src) { carrying = false; placeCup(src); }
  segs = r.segments; frames = []; segIndex = [];
  segs.forEach((s, k) => s.joints.forEach(j => { frames.push({ q: j, carry: s.carrying }); segIndex.push(k); }));
  fi = 0; cup.userData.station = dst;
  $("#hud-meta").textContent = `${S.arm.name.toUpperCase()} · ${src} → ${dst} · ${frames.length} checked poses · min clearance ${Math.min(...segs.map(s => s.min_clearance_mm))} mm`;
}
function focus(name, instant = false) {
  focusName = name;
  const R0 = Math.max(1.3, 2.3 * (S?.arm.reach ?? .85));
  let target = new THREE.Vector3(0.15, 0.05, 0.25), pos = new THREE.Vector3(R0 * .9, -R0 * 1.25, R0 * .95);
  const d = devGroups[name];
  if (d) {
    const c = new THREE.Box3().setFromObject(d).getCenter(new THREE.Vector3());
    target = c; const dir = new THREE.Vector3(c.x, c.y, 0).normalize(); if (!dir.lengthSq()) dir.set(1, 0, 0);
    pos = c.clone().add(dir.multiplyScalar(R0 * .55)).add(new THREE.Vector3(R0 * .25, -R0 * .35, R0 * .45));
  } else if (name === "arm") { target.set(0.05, 0.05, 0.35); pos.set(R0 * .55, -R0 * .95, R0 * .7); }
  for (const [k, g] of Object.entries(devGroups)) g.traverse(o => { if (o.material) o.material.emissive = new THREE.Color(k === name ? 0xc7ff2e : 0x000000), o.material.emissiveIntensity = k === name ? .35 : 0; });
  if (instant || reduced) { camera.position.copy(pos); controls.target.copy(target); controls.update(); camGoal = null; }
  else camGoal = { pos, target };
}
function setBoxes(on) { showBoxes = on; boxHelpers.forEach(h => h.visible = on); $("#boxes").setAttribute("aria-pressed", String(on)); }

let acc = 0, visible = true;
new IntersectionObserver(e => visible = e[0].isIntersecting).observe(view);
function tick() {
  requestAnimationFrame(tick);
  if (!visible || !S || !renderer) return;
  if (camGoal) {
    camera.position.lerp(camGoal.pos, .06); controls.target.lerp(camGoal.target, .06);
    if (camera.position.distanceTo(camGoal.pos) < .005) camGoal = null;
  }
  if (frames.length && fi < frames.length) {
    acc += reduced ? 4 : 1;
    while (acc >= 1 && fi < frames.length) {
      const f = frames[fi];
      carrying = f.carry; setQ(f.q); renderSteps(segs, segIndex[fi]); fi++; acc -= 1;
    }
    if (fi >= frames.length) { renderSteps(segs); placeCup(cup.userData.station); }
  }
  controls.update(); renderer.render(scene3, camera);
}
resize(); tick();
const twinReady = loadArm("ur5e");

$("#arm").addEventListener("change", e => loadArm(e.target.value));
$("#play").addEventListener("click", () => S && runRoute(cup.userData.station, nextStation(cup.userData.station)));
const ORDER = ["balance", "mixer", "characterizer"];
const nextStation = s => ORDER[(ORDER.indexOf(s) + 1) % 3];
function updatePlayLabel() { const s = cup?.userData.station ?? "balance"; $("#play").textContent = `Run ${s} → ${nextStation(s)}`; }
setInterval(updatePlayLabel, 500);
$("#boxes").addEventListener("click", () => setBoxes(!showBoxes));

/* chapters drive the twin */
const chapters = [...document.querySelectorAll(".chapter")];
const io = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) {
    chapters.forEach(c => c.classList.toggle("active", c === e.target));
    const el = e.target;
    if (!S) { twinReady.then(() => { focus(el.dataset.focus || "overview"); setBoxes(el.dataset.boxes === "1"); }); continue; }
    focus(el.dataset.focus || "overview");
    setBoxes(el.dataset.boxes === "1");
    if (el.dataset.run && !el.dataset.played) { el.dataset.played = "1"; const [a, b] = el.dataset.run.split("-"); runRoute(a, b); }
  }
}, { rootMargin: "-45% 0px -45% 0px" });
chapters.forEach(c => io.observe(c));

/* ================================================================ 1 Dose: material spectrum */
const T1 = R.table_1.rows;
const TRACKS = [
  { key: "visc", name: "Viscosity", unit: "cP", log: true, min: 1, max: 1e5, ticks: [1, 10, 100, 1e3, 1e4, 1e5], start: 300,
    bands: [{ lo: 1, hi: 20, row: 0 }, { lo: 20, hi: 500, row: 1 }, { lo: 500, hi: 1e5, row: 2 }] },
  { key: "ys", name: "Yield stress", unit: "Pa", log: true, min: 1, max: 1e4, ticks: [1, 10, 100, 1e3, 1e4], start: 60,
    bands: [{ lo: 10, hi: 500, row: 3, lane: 0 }, { lo: 100, hi: 1e4, row: 4, lane: 1 }] },
  { key: "hr", name: "Hausner ratio", unit: "", log: false, min: 1.0, max: 1.6, ticks: [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6], start: 1.3,
    bands: [{ lo: 1.0, hi: 1.11, row: 5, label: "free-flowing" }, { lo: 1.11, hi: 1.4, row: 5, label: "increasingly cohesive" }, { lo: 1.4, hi: 1.6, row: 5, label: "very cohesive" }] },
];
const short = r => T1[r].Material.replace(" liquids", "");
function spectrum() {
  const W = 560, L = 96, Rr = 14, TH = 64, H = TRACKS.length * TH + 8, pw = W - L - Rr;
  const xs = t => v => L + pw * (t.log ? (Math.log10(v) - Math.log10(t.min)) / (Math.log10(t.max) - Math.log10(t.min)) : (v - t.min) / (t.max - t.min));
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Material property scales with dispensing technologies from Table 1">`;
  TRACKS.forEach((t, i) => {
    const y = 8 + i * TH, x = xs(t), c = t.key === "visc" ? "var(--liquid)" : t.key === "ys" ? "var(--semi)" : "var(--powder)";
    svg += `<text class="track-name" x="0" y="${y + 18}">${t.name}</text><text class="axt" x="0" y="${y + 32}">${t.unit || "(–)"}</text>`;
    t.bands.forEach((b, j) => {
      const by = y + 6 + (b.lane ?? 0) * 13;
      svg += `<rect x="${x(b.lo)}" y="${by}" width="${Math.max(2, x(b.hi) - x(b.lo) - 1)}" height="11" rx="2" fill="${c}" opacity="${.35 + .2 * (j % 3)}"></rect>`;
      svg += `<text class="lbl" x="${x(b.lo) + 4}" y="${by + 9}" style="font-size:9.5px;fill:var(--ink)">${esc(b.label || short(b.row))}</text>`;
    });
    svg += `<line class="ax" x1="${L}" x2="${L + pw}" y1="${y + 36}" y2="${y + 36}"></line>`;
    t.ticks.forEach(v => svg += `<line class="ax" x1="${x(v)}" x2="${x(v)}" y1="${y + 36}" y2="${y + 40}"></line><text class="axt" x="${x(v)}" y="${y + 51}" text-anchor="middle">${v >= 1000 ? (v / 1000) + "k" : v}</text>`);
    svg += `<g class="handle" data-track="${i}" tabindex="0" role="slider" aria-label="${t.name}" aria-valuemin="${t.min}" aria-valuemax="${t.max}"><line x1="0" x2="0" y1="${y + 2}" y2="${y + 38}" stroke="var(--ink)" stroke-width="2"></line><circle cx="0" cy="${y + 36}" r="6" fill="var(--ink)"></circle></g>`;
  });
  svg += "</svg>";
  const host = $("#spectrum"); host.innerHTML = svg;
  const el = host.querySelector("svg");
  const vals = TRACKS.map(t => t.start);
  const inv = t => px => { const f = Math.min(1, Math.max(0, (px - L) / pw)); return t.log ? 10 ** (Math.log10(t.min) + f * (Math.log10(t.max) - Math.log10(t.min))) : t.min + f * (t.max - t.min); };
  function set(i, v) {
    const t = TRACKS[i]; vals[i] = v;
    const g = el.querySelector(`[data-track="${i}"]`); g.setAttribute("transform", `translate(${xs(t)(v)},0)`); g.setAttribute("aria-valuenow", v.toPrecision(3));
    const band = t.bands.filter(b => v >= b.lo && v <= b.hi).pop();
    const row = band ? T1[band.row] : null, cls = t.key === "visc" ? "liquid" : t.key === "ys" ? "semi" : "powder";
    const prods = R.table_3.rows.filter(r => classOf(r.Material) === cls);
    $("#spectrum-pick").innerHTML = row
      ? `<b>${esc(t.name)} ${t.log ? Math.round(v).toLocaleString() : v.toFixed(2)} ${t.unit}</b> → <b>${esc(row.Material)}</b>${band.label ? " (" + band.label + ")" : ""}. Dose with <b>${esc(row["Common Technologies"])}</b>; typical accuracy ${esc(row["Typical Accuracy"]).toLowerCase()}, throughput ${esc(row.Throughput).toLowerCase()}. Watch for ${esc(row["Key Challenges"]).toLowerCase()}.<br><span class="muted small">${prods.length} commercial ${cls === "semi" ? "semi-solid" : cls} dispensers in Table 3, from ${esc(prods.map(p => p.Brand).filter((b, k, a) => a.indexOf(b) === k).slice(0, 4).join(", "))}.</span>`
      : `<b>${esc(t.name)}</b>: outside the ranges in Table 1.`;
  }
  TRACKS.forEach((t, i) => {
    const g = el.querySelector(`[data-track="${i}"]`);
    const move = e => { const p = el.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const loc = p.matrixTransform(el.getScreenCTM().inverse()); set(i, inv(t)(loc.x)); };
    g.addEventListener("pointerdown", e => { g.setPointerCapture(e.pointerId); g.onpointermove = move; });
    g.addEventListener("pointerup", () => g.onpointermove = null);
    g.addEventListener("keydown", e => { if (!/Arrow(Left|Right)/.test(e.key)) return; e.preventDefault(); const k = e.key === "ArrowRight" ? 1 : -1; set(i, t.log ? Math.min(t.max, Math.max(t.min, vals[i] * 10 ** (k * .1))) : Math.min(t.max, Math.max(t.min, vals[i] + k * .02))); });
    set(i, t.start);
  });
  set(0, TRACKS[0].start);
}
spectrum();

/* ================================================================ 2 Move: robot classes */
const RCLASS = [["Cartesian", "var(--semi)", "Gantry"], ["SCARA", "var(--powder)", "SCARA"], ["6-DOF", "var(--liquid)", "6-DOF arm"], ["7-DOF", "var(--object)", "7-DOF cobot"], ["Mobile", "var(--ink-2)", "Mobile manipulator"]];
const rcol = c => (RCLASS.find(k => c.includes(k[0])) || RCLASS[4])[1];
const ROBOTS = R.table_2.rows.map(r => ({ ...r, price: parsePrice(r.Price), rep: parseRep(r.Repeatability) }));
function robots() {
  const W = 560, H = 330, L = 52, B = 40, T = 10, Rr = 70;
  const x = v => L + (W - L - Rr) * (Math.log10(v) - 2.6) / (4.8 - 2.6);
  const y = v => T + (H - T - B) * (Math.log10(v) - Math.log10(0.005)) / (Math.log10(1) - Math.log10(0.005));
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Robot repeatability versus price, Table 2">`;
  [500, 1000, 5000, 10000, 50000].forEach(v => s += `<line class="ax" x1="${x(v)}" x2="${x(v)}" y1="${T}" y2="${H - B}" opacity=".5"></line><text class="axt" x="${x(v)}" y="${H - B + 14}" text-anchor="middle">${v >= 1000 ? "$" + v / 1000 + "k" : "$" + v}</text>`);
  [0.01, 0.03, 0.1, 0.3, 1].forEach(v => s += `<line class="ax" x1="${L}" x2="${W - Rr}" y1="${y(v)}" y2="${y(v)}" opacity=".5"></line><text class="axt" x="${L - 6}" y="${y(v) + 3}" text-anchor="end">±${v}</text>`);
  s += `<text class="axt" x="${(W - Rr + L) / 2}" y="${H - 6}" text-anchor="middle">list price (log)</text><text class="axt" transform="translate(12 ${(H - B) / 2}) rotate(-90)" text-anchor="middle">repeatability, mm (log) · more precise ↑</text>`;
  s += `<line class="ax" x1="${W - Rr + 12}" x2="${W - Rr + 12}" y1="${T}" y2="${H - B}" stroke-dasharray="3 3"></line><text class="axt" x="${W - Rr + 34}" y="${H - B + 14}" text-anchor="middle">quote</text>`;
  const dots = [], labels = [];
  ROBOTS.forEach((r, i) => {
    if (r.rep == null) return;
    const cx = r.price ? x(Math.sqrt(r.price.lo * r.price.hi)) : W - Rr + 34, cy = y(r.rep), c = rcol(r["Robot class"]);
    dots.push(`<circle class="dot" data-i="${i}" tabindex="0" cx="${cx}" cy="${cy}" r="7" fill="${r.price ? c : "var(--surface)"}" stroke="${c}" stroke-width="2"><title>${esc(r.Brand + " " + r.Model)}</title></circle>`);
    // hand-placed labels: [text, anchor, dx, dy] — the $30–42k cluster at ±0.1 mm needs explicit room
    const LAB = { "4040": ["Genmitsu 4040-PRO", "start", 10, 4], drylin: ["igus drylin", "end", -10, 4], "Lite 6": ["Lite 6", "start", 10, 4],
      "xArm": ["xArm 6", "end", -10, 4], RS3: ["Epson RS3", "start", 10, 4], UR3e: ["UR3e", "start", 10, 4], "Research 3": ["FR3", "end", -10, -8],
      Gen3: ["Gen3", "middle", 0, 20], iiwa: ["KMR iiwa", "middle", 4, -12], PF400: ["PF400", "middle", 0, -12] };
    const key = Object.keys(LAB).find(k => r.Model.includes(k));
    const [text, anchor, dx, dy] = key ? LAB[key] : [r.Model, "start", 10, 4];
    labels.push(`<text class="lbl" x="${cx + dx}" y="${cy + dy}" text-anchor="${anchor}" style="font-size:10px">${esc(text)}</text>`);
  });
  s += labels.join("") + dots.join("");
  s += "</svg>";
  const missing = ROBOTS.filter(r => r.rep == null).map(r => r.Brand + " " + r.Model);
  $("#robots").innerHTML = s + `<div class="legend">${RCLASS.map(c => `<span><i style="background:${c[1]}"></i>${c[2]}</span>`).join("")}<span><i style="border:2px solid var(--ink-3);background:transparent"></i>quote only</span></div>` + (missing.length ? `<p class="muted small">Not plotted (no published repeatability): ${esc(missing.join(", "))}.</p>` : "");
  const pick = i => {
    const r = ROBOTS[i];
    document.querySelectorAll("#robots .dot").forEach(d => d.classList.toggle("sel", +d.dataset.i === i));
    $("#robot-pick").innerHTML = `<b>${esc(r.Brand)} ${esc(r.Model)}</b> · ${esc(r["Robot class"])}<br>Repeatability ${esc(r.Repeatability)} · price ${esc(r.Price)} ${linkRefs(r.Ref)}`;
  };
  document.querySelectorAll("#robots .dot").forEach(d => { d.addEventListener("click", () => pick(+d.dataset.i)); d.addEventListener("keydown", e => e.key === "Enter" && pick(+d.dataset.i)); });
  pick(ROBOTS.findIndex(r => /UR3e/.test(r.Model)));
}
robots();

/* ================================================================ 3 Buy: catalogue */
const CAT = [
  ...R.table_3.rows.map(r => ({ cls: classOf(r.Material), name: `${r.Brand} ${r.Model}`, mech: r.Mechanism, acc: r.Accuracy, price: parsePrice(r.Price), raw: r.Price, ref: r.Ref })),
  ...R.table_4.rows.map(r => ({ cls: "platform", name: r.Platform, mech: r.Mechanism, acc: r["Accuracy / precision"], price: parsePrice(r.Price), raw: r.Price, ref: r.Ref })),
];
const FILTERS = [["all", "All"], ["liquid", "Liquids"], ["semi", "Gels & pastes"], ["powder", "Powders"], ["platform", "Platforms"]];
function catalog(f = "all") {
  const px = v => 100 * (Math.log10(v) - 2) / (5.1 - 2);
  $("#buy-filters").innerHTML = FILTERS.map(([k, l]) => `<button type="button" data-f="${k}" aria-pressed="${k === f}">${l} <span class="muted">${k === "all" ? CAT.length : CAT.filter(c => c.cls === k).length}</span></button>`).join("");
  $("#catalog").innerHTML = CAT.filter(c => f === "all" || c.cls === f).map(c => `
    <div class="item ${CLASS[c.cls]}">
      <div><h4><span class="swatch"></span>${esc(c.name)}</h4><div class="meta">${esc(c.mech)}</div></div>
      <div><div class="pbar"><div class="rail"></div>${c.price ? `<div class="fill" style="left:${px(c.price.lo)}%;width:${Math.max(1.5, px(c.price.hi) - px(c.price.lo))}%;background:var(--c)"></div>` : `<span class="q">${/quote/i.test(c.raw) ? "quote" : "not listed"}</span>`}</div>
      <div class="price">${c.price ? esc(c.raw.length > 40 ? fmtPrice(c.price) : c.raw) : ""} ${linkRefs(c.ref)}</div></div>
      ${c.acc && c.acc !== "-" ? `<div class="acc">${esc(c.acc)}</div>` : ""}
    </div>`).join("");
  document.querySelectorAll("#buy-filters button").forEach(b => b.onclick = () => catalog(b.dataset.f));
}
catalog();

/* ================================================================ 4 Extend */
(() => {
  const by = {};
  R.table_5.rows.forEach(r => (by[r["Layer modified"]] ??= []).push(r));
  $("#retrofits").innerHTML = Object.entries(by).map(([layer, rows]) => `<div class="grp">${esc(layer)}</div>` + rows.map(r =>
    `<div class="rcard"><b>${esc(r["Base platform"])}</b>: ${esc(r["Novel idea"])} ${linkRefs(r.Ref)}<div class="gain">→ ${esc(r["New capability unlocked"])}</div></div>`).join("")).join("");
})();

/* ================================================================ 5 Rehearse: fidelity ladder */
(() => {
  const LV = [[1, "Workflow", "Queues, timing, device states"], [2, "Kinematics", "Geometry, reach, collision-free motion"], [3, "Contact dynamics", "Forces, grasping, rigid bodies"], [4, "Material physics", "Liquids, pastes and powders themselves"]];
  const toolsAt = n => R.table_6.rows.filter(r => String(r.Level).split(/[–\s(+)]/).filter(Boolean).map(Number).some(v => v === n) || (String(r.Level).includes("1–2") && n === 1));
  $("#fidelity").innerHTML = LV.slice().reverse().map(([n, t, d]) => `<div class="rung ${n === 2 ? "here" : ""}"><div class="lv">${n}<small>level</small></div><div><h4>${t}${n === 2 ? " · this twin" : ""}</h4><p>${d}</p><div class="tools">${toolsAt(n).map(r => `<span title="${esc(r["Best SDL use"])}">${esc(r["Tool or class"].replace(/\s*\(.*?\)/, ""))}</span>`).join("")}</div></div></div>`).join("");
})();

/* ================================================================ 7 Decide: agent roles */
(() => {
  const k = a => /inform/i.test(a) ? "inform" : /act/i.test(a) ? "act" : "draft";
  $("#agents").innerHTML = R.table_7.rows.map(r => `<div class="agent"><h4>${esc(r.Agent)}</h4><span class="aut ${k(r.Autonomy)}">${esc(r.Autonomy)}</span><p>${esc(r["Example tasks"])}. Human checkpoint: ${esc(r["Human checkpoint"]).toLowerCase()}. Examples: ${linkRefs(r["SDL examples"])}</p></div>`).join("");
})();

/* ================================================================ scenarios */
function scenarios(f = "all") {
  const SC = R.literature_scenarios.map(s => ({ ...s, cls: classOf(s.material_class) }));
  const F = [["all", "All 20"], ["liquid", "Liquids"], ["semi", "Semi-solids"], ["powder", "Powders"]];
  $("#sc-filters").innerHTML = F.map(([kk, l]) => `<button type="button" data-f="${kk}" aria-pressed="${kk === f}">${l}</button>`).join("");
  $("#sc-grid").innerHTML = SC.filter(s => f === "all" || s.cls === f).map(s => `
    <li class="sc ${CLASS[s.cls]}"><div class="fig"><span>${esc(s.figure)}</span><span>${esc(s.material_class)}</span></div>
      <div class="seq">${s.sense_act.split("->").map(w => esc(w.trim())).join(" <i>→</i> ")}</div>
      <p>${esc(s.citation.split(",")[0])} et al.${(s.citation.match(/(19|20)\d{2}/) || [""])[0] ? " (" + s.citation.match(/(19|20)\d{2}/)[0] + ")" : ""} <a class="ref" href="${REFS}${s.ref}">[${s.ref}]</a></p></li>`).join("");
  document.querySelectorAll("#sc-filters button").forEach(b => b.onclick = () => scenarios(b.dataset.f));
}
scenarios();

/* ================================================================ planner (SFL selection step preview) */
const pickItem = name => CAT.find(c => c.name.includes(name));
const DISP = {
  "m-liq": { label: "Water-like liquids", item: pickItem("E4 XLS+"), why: "air-displacement pipetting suits 1–20 cP (Table 1)" },
  "m-visc": { label: "Viscous liquids", item: pickItem("PSD/4"), why: "positive displacement handles 20–100,000 cP without air-cushion error" },
  "m-paste": { label: "Gels and pastes", item: pickItem("Ultimus V"), why: "pneumatic extrusion overcomes yield stress; lowest-priced standalone unit" },
  "m-pow": { label: "Powders", item: pickItem("MT12"), why: "auger feeding is the only listed-price powder doser; others are quote-only" },
};
function plan() {
  const budget = +$("#budget").value, need = +$("#rep").value;
  $("#budget-out").textContent = money(budget);
  const disp = Object.entries(DISP).filter(([id]) => $("#" + id).checked).map(([, d]) => d);
  const dcost = disp.reduce((a, d) => a + (d.item.price?.hi ?? 0), 0);
  const fits = ROBOTS.filter(r => r.price && r.rep != null && r.rep <= need).sort((a, b) => a.price.hi - b.price.hi);
  const arms = fits.filter(r => !/Cartesian/.test(r["Robot class"]));
  const robot = arms.find(r => r.price.hi + dcost <= budget) || arms[0] || fits[0];
  const total = dcost + (robot?.price.hi ?? 0), over = total > budget;
  const twinArm = robot && /UR3e/.test(robot.Model) ? "ur3e" : "ur5e";
  const rows = [
    robot ? `<tr><td><span class="swatch c-object"></span>${esc(robot.Brand + " " + robot.Model)}<div class="muted small">Moves the premix cup · ${esc(robot.Repeatability)} ${linkRefs(robot.Ref)}</div></td><td class="num">${esc(robot.Price)}</td></tr>` : `<tr><td colspan="2">No robot in Table 2 meets ±${need} mm with a listed price.</td></tr>`,
    ...disp.map(d => `<tr><td><span class="swatch ${CLASS[d.item.cls]}"></span>${esc(d.item.name)}<div class="muted small">${esc(d.label)}: ${esc(d.why)} ${linkRefs(d.item.ref)}</div></td><td class="num">${esc(d.item.raw)}</td></tr>`),
  ];
  const cheaper = over ? ROBOTS.filter(r => r.price && r.rep != null && !/Cartesian/.test(r["Robot class"])).sort((a, b) => a.price.hi - b.price.hi)[0] : null;
  $("#plan-out").innerHTML = `
    <table class="bom"><thead><tr><th>Proposed hardware</th><th style="text-align:right">List price</th></tr></thead><tbody>${rows.join("")}</tbody>
    <tfoot><tr><th>Total (upper list price)</th><th class="num" style="text-align:right">${money(total)}</th></tr></tfoot></table>
    <div class="budgetbar" role="img" aria-label="${Math.round(100 * total / budget)}% of budget"><i class="${over ? "over" : ""}" style="width:${Math.min(100, 100 * total / budget)}%"></i></div>
    <p class="note">${over ? `Over budget by <b>${money(total - budget)}</b>. ${cheaper ? `Relaxing repeatability to ±${cheaper.rep} mm allows the ${esc(cheaper.Brand + " " + cheaper.Model)} (${esc(cheaper.Price)}), or drop one material class.` : ""}` : `Within budget, with <b>${money(budget - total)}</b> left for the balance, mixer, characterizer and integration, which this preview does not price.`}</p>
    <button type="button" class="btn small" id="to-twin">Show the cell in the twin (${twinArm.toUpperCase()})</button>
    <p class="muted small">${twinArm === "ur3e" ? "The twin loads the same arm." : "The twin has UR e-Series arms only, so it previews the closest UR model."} Rules: cheapest arm in Table 2 that meets the repeatability and fits the budget with the dispensers; per material, the lowest-priced dispenser whose mechanism Table 1 recommends.</p>`;
  $("#to-twin").onclick = async () => { $("#arm").value = twinArm; await loadArm(twinArm); $("#stage").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); focus("overview"); runRoute("balance", "mixer"); };
}
$("#plan-form").addEventListener("input", plan); plan();

/* ================================================================ citation */
(() => {
  const names = R.authors.map(a => { const parts = a.name.split(" "); const last = /Le Devedec/.test(a.name) ? "Le Devedec" : parts.at(-1); const first = a.name.replace(" " + last, ""); return `${first.split(" ").map(p => p[0] + ".").join(" ")} ${last}`; });
  $("#citation").innerHTML = `${esc(names.join(", "))}. <i>${esc(R.title)}</i>. Manuscript in preparation, 2026.`;
})();
