/* assemblab home hero: a compact self-driving cell in 3D, built with the Lab Simulator's own models (lab-simulator/catalog.js).
   A T-slot robot workstation carries an Opentrons Flex, a UR3e cobot, a magnetic hotplate stirrer and an HPLC.
   Minimal interaction: hovering a component tints it lime, fades the rest, lifts it slightly and shows its label;
   the camera drifts a little with the cursor; the liquid handler and the arm run a small idle animation. */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { ITEMS, buildModel } from "../lab-simulator/catalog.js";

/* the cell: library ids, deck positions [x, y] in metres (front of the cell faces -y) */
export const HERO_PARTS = [
  { key: "bench", id: "mcm-9351n11", name: "Robot workstation", role: "T-slot deck that carries the cell", pos: [0, 0], base: true },
  { key: "flex", id: "flex", name: "Opentrons Flex", role: "Liquid handling: pipettes, plates, tips", pos: [-.36, .06] },
  { key: "arm", id: "ur3e", name: "UR3e cobot", role: "Moves vials between stations", pos: [.13, .08] },
  { key: "stir", id: "cl-ika-plate-rctdigital", name: "Magnetic hotplate stirrer", role: "Heats and mixes each sample", pos: [.31, -.27] },
  { key: "hplc", id: "cl-agilent-hplc1260", name: "HPLC system", role: "Analyses every run", pos: [.6, .14] },
];
const LIME = new THREE.Color(0xC7FF2E), GLOW = LIME.clone().multiplyScalar(.32);

export async function createHeroScene(el, { onHover = () => { }, onSelect = () => { }, onProgress = () => { } } = {}) {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75)); renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  el.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
  const camera = new THREE.PerspectiveCamera(28, 1, .05, 60); camera.up.set(0, 0, 1);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x0f0f0f, .55));
  const key = new THREE.DirectionalLight(0xffffff, 2.1); key.position.set(2.2, -3, 4.2); key.castShadow = true;
  key.shadow.mapSize.set(1536, 1536); Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: .5, far: 12 }); key.shadow.bias = -.0005; key.shadow.radius = 4; scene.add(key);
  const rim = new THREE.DirectionalLight(0xC7FF2E, .55); rim.position.set(-3, 3, 2); scene.add(rim);

  // floor: soft shadow, a faint lime pool, a fading grid
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: .55 })); floor.receiveShadow = true; scene.add(floor);
  const radial = (stops) => { const c = document.createElement("canvas"); c.width = c.height = 512; const x = c.getContext("2d"), g = x.createRadialGradient(256, 256, 0, 256, 256, 256);
    stops.forEach(([o, col]) => g.addColorStop(o, col)); x.fillStyle = g; x.fillRect(0, 0, 512, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2), new THREE.MeshBasicMaterial({ map: radial([[0, "rgba(199,255,46,.16)"], [.5, "rgba(199,255,46,.04)"], [1, "rgba(0,0,0,0)"]]), transparent: true, depthWrite: false }));
  pool.position.z = .001; scene.add(pool);
  // a fine grid drawn into a texture whose alpha fades radially, so it dissolves into the page with no visible edge
  const gridTex = (() => { const c = document.createElement("canvas"), N = 1024; c.width = c.height = N; const x = c.getContext("2d");
    x.strokeStyle = "rgba(255,255,255,.10)"; x.lineWidth = 1.5; for (let i = 0; i <= 40; i++) { const p = i * N / 40; x.beginPath(); x.moveTo(p, 0); x.lineTo(p, N); x.moveTo(0, p); x.lineTo(N, p); x.stroke(); }
    x.globalCompositeOperation = "destination-in"; const g = x.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2); g.addColorStop(0, "#000"); g.addColorStop(.55, "rgba(0,0,0,.6)"); g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g; x.fillRect(0, 0, N, N); const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; })();
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ map: gridTex, transparent: true, depthWrite: false }));
  grid.position.z = .0005; scene.add(grid);

  // hover ring on the floor or deck under the highlighted component
  const ring = new THREE.Mesh(new THREE.RingGeometry(.49, .5, 96), new THREE.MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0, depthWrite: false }));
  scene.add(ring);

  const cell = new THREE.Group(); scene.add(cell);
  const parts = new Map(), pickables = [];
  const byId = Object.fromEntries(ITEMS.map(i => [i.id, i]));
  let deckTop = .95, loaded = 0;

  function adopt(spec, root) {
    const mats = [];
    root.traverse(o => {
      if (!o.isMesh) return;
      o.material = Array.isArray(o.material) ? o.material.map(m => m.clone()) : o.material.clone();
      for (const m of [].concat(o.material)) mats.push({ m, em: m.emissive ? m.emissive.clone() : null, op: m.opacity, tr: m.transparent, dw: m.depthWrite });
      o.userData.key = spec.key; pickables.push(o);
    });
    const P = { ...spec, root, mats, h: 0, dim: 0, t0: performance.now(), z0: root.position.z, box: new THREE.Box3().setFromObject(root) };
    parts.set(spec.key, P); return P;
  }
  async function build(spec) {
    const it = byId[spec.id]; if (!it) throw new Error("not in catalogue: " + spec.id);
    const root = await buildModel(it);
    if (spec.base) {   // centre the workstation on the origin and read its deck height
      const b = new THREE.Box3().setFromObject(root), c = b.getCenter(new THREE.Vector3());
      root.position.set(-c.x, -c.y, -b.min.z); deckTop = b.max.z - b.min.z;
    } else root.position.set(spec.pos[0], spec.pos[1], deckTop);
    cell.add(root); root.updateMatrixWorld(true);
    const P = adopt(spec, root);
    if (spec.key === "stir") {   // a small spinning lime ring on the plate: stirring
      const top = P.box.max.z - deckTop, r = new THREE.Mesh(new THREE.TorusGeometry(.035, .003, 8, 48), new THREE.MeshBasicMaterial({ color: LIME }));
      r.position.set(0, -.03, top + .004); root.add(r); P.spin = r;
    }
    loaded++; onProgress(loaded, HERO_PARTS.length); fit();
    return P;
  }

  // camera: a fixed three-quarter view that drifts with the cursor; distance fits the cell to the canvas
  const target = new THREE.Vector3(0, 0, .55), dir = new THREE.Vector3(.62, -1, .62).normalize();
  let dist = 4;
  function fit() {
    const b = new THREE.Box3().setFromObject(cell); if (b.isEmpty()) return;
    const s = b.getBoundingSphere(new THREE.Sphere()); target.copy(s.center); target.z = Math.max(.4, s.center.z * .9);
    const v = THREE.MathUtils.degToRad(camera.fov) / 2, hz = Math.atan(Math.tan(v) * camera.aspect);
    dist = Math.max(s.radius / Math.sin(v), s.radius / Math.sin(hz)) * 1.02;
  }
  function resize() { const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); renderer.domElement.style.width = w + "px"; renderer.domElement.style.height = h + "px"; camera.aspect = w / h; camera.updateProjectionMatrix(); fit(); }
  new ResizeObserver(resize).observe(el); resize();

  // pointer: parallax + picking
  const ndc = new THREE.Vector2(), ray = new THREE.Raycaster(), par = { x: 0, y: 0, tx: 0, ty: 0 };
  let hovered = null, forced = null, dirty = false, inside = false;
  el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); par.tx = ndc.x; par.ty = ndc.y; inside = true; dirty = true; });
  el.addEventListener("pointerleave", () => { inside = false; par.tx = par.ty = 0; setHover(null); });
  el.addEventListener("click", () => { const P = parts.get(hovered); if (P) onSelect(P); });
  function pick() { ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(pickables, false)[0]; setHover(hit ? hit.object.userData.key : null); }
  function setHover(k) { if (k === hovered) return; hovered = k; el.style.cursor = k ? "pointer" : ""; onHover(k ? parts.get(k) : null); }

  // label for the active component, pinned above it
  const label = document.createElement("div"); label.className = "h3d-label"; label.setAttribute("aria-hidden", "true"); el.append(label);
  let labelKey = null;

  const clock = new THREE.Clock(); let t = 0, running = true, visible = true;
  const v3 = new THREE.Vector3();
  function frame() {
    if (!running) return; requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), .05); t += dt;
    if (dirty && inside) { pick(); dirty = false; }
    const act = forced || hovered;
    // camera drift
    par.x += (par.tx - par.x) * .06; par.y += (par.ty - par.y) * .06;
    const sway = still ? 0 : Math.sin(t * .18) * .05;
    const yaw = (still ? 0 : par.x * .2) + sway, pitch = still ? 0 : par.y * .07;
    const d = dir.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), -yaw); d.z += pitch; d.normalize();
    camera.position.copy(target).addScaledVector(d, dist); camera.lookAt(target);
    // components: appear, highlight, dim, lift, idle animation
    for (const P of parts.values()) {
      const a = Math.min(1, (performance.now() - P.t0) / 700), e = 1 - Math.pow(1 - a, 3);
      const on = act === P.key ? 1 : 0, off = act && act !== P.key ? 1 : 0;
      P.h += (on - P.h) * .14; P.dim += (off - P.dim) * .12;
      P.root.scale.setScalar(.97 + .03 * e);
      if (!P.base) P.root.position.z = P.z0 + (1 - e) * .05 + P.h * .018;
      const op = 1 - .7 * P.dim;
      for (const s of P.mats) {
        if (s.em) s.m.emissive.copy(s.em).lerp(GLOW, P.h);
        const want = op * s.op, tr = s.tr || want < .995;
        if (tr !== s.m.transparent) { s.m.transparent = tr; s.m.depthWrite = !tr && s.dw; s.m.needsUpdate = true; }
        s.m.opacity = want;
      }
      if (!still && P.root.userData.tick) P.root.userData.tick(t, dt);
      if (P.spin && !still) P.spin.rotation.z += dt * 5;
    }
    // ring + label follow the active component
    const A = act && parts.get(act);
    ring.material.opacity += ((A ? .9 : 0) - ring.material.opacity) * .15;
    if (A) { A.root.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(A.root), c = b.getCenter(v3), sz = b.getSize(new THREE.Vector3());
      ring.position.set(c.x, c.y, (A.base ? 0 : deckTop) + .003); ring.scale.setScalar(Math.max(sz.x, sz.y) * (A.base ? .62 : .78));
      if (labelKey !== A.key) { labelKey = A.key; label.innerHTML = `<b>${A.name}</b><span>${A.role}</span>`; }
      const p = new THREE.Vector3(c.x, c.y, b.max.z + .04).project(camera), r = el.getBoundingClientRect();
      label.style.transform = `translate(${(p.x + 1) / 2 * r.width}px, ${(1 - p.y) / 2 * r.height}px) translate(-50%, -100%)`; label.classList.add("on"); }
    else { label.classList.remove("on"); labelKey = null; }
    renderer.render(scene, camera);
  }
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 }).observe(el);
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; });
  frame();

  // the deck first (everything stands on it), then the instruments in parallel; a part that fails to stream is skipped
  await build(HERO_PARTS[0]);
  await Promise.all(HERO_PARTS.slice(1).map(s => build(s).catch(err => { console.warn("hero part skipped:", s.id, err); loaded++; onProgress(loaded, HERO_PARTS.length); })));
  fit();

  return {
    highlight(k) { forced = k; },
    dispose() { running = false; renderer.dispose(); },
  };
}
