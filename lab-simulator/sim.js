/* Run simulation for the Lab Simulator: the digital layer (orchestration, optimizers, AI agents) driving the placed hardware.
 *
 *   const sim = createSim({ THREE, scene, byId, toast });
 *   sim.sync(placed)       after any change to the layout (rebuilds the workflow and the links)
 *   sim.update(dt)         every frame while the workstation is running
 *   sim.reset()            start a new campaign
 *
 * Model of a campaign
 *   An orchestrator builds the workflow from the capabilities on the deck (dose → move → weigh → mix → move → characterize)
 *   and runs it once per experiment: a command travels to each device, the device works for the step's duration, and
 *   weighing and characterization send their data back. Each experiment makes one premix at a thickener fraction x and
 *   measures a desirability y = f(x) + noise (viscosity on target, no separation; f is hidden from the optimizer).
 *   An optimizer keeps a Gaussian-process surrogate (RBF kernel) of y(x) and proposes the next x by upper confidence
 *   bound, after a two-point space-filling initial design; without one the orchestrator walks a fixed grid. Agents draft the campaign and every sixth experiment
 *   re-plan; their plans pass a human-approval gate (automatic, or manual with the Approve button). Dispensing steps
 *   fail now and then (stall, clog); the orchestrator retries, and an agent, if present, drafts the recovery for approval.
 */
const STEP_S = { dose: 1.6, move: 1.1, weigh: 1.0, mix: 1.8, characterize: 2.0 };
const VERB = { dose: "Dose", move: "Move cup", weigh: "Weigh", mix: "Mix", characterize: "Measure" };
const COL = { command: 0x818CF8, data: 0x22D3EE, model: 0x4ADE80, gate: 0xF59E0B };
const f = x => .82 * Math.exp(-((x - .68) ** 2) / (2 * .07 ** 2)) + .34 * Math.exp(-((x - .22) ** 2) / (2 * .05 ** 2)) + .06;   // hidden objective
const noise = () => (Math.random() + Math.random() + Math.random() - 1.5) * .025;

/* ---------------------------------------------------------------- Gaussian process (RBF), exact inference on a 1-D grid */
function gp(X, Y, grid, ls = .09, sn = .03) {
  const n = X.length, m = Y.reduce((a, b) => a + b, 0) / Math.max(1, n), k = (a, b) => Math.exp(-((a - b) ** 2) / (2 * ls * ls));
  if (!n) return { mu: grid.map(() => .5), sd: grid.map(() => .5) };
  const K = X.map((a, i) => X.map((b, j) => k(a, b) * .09 + (i === j ? sn * sn : 0)));          // signal variance 0.09 (sd 0.3)
  const L = K.map(r => r.map(() => 0));                                                            // Cholesky
  for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) { let s = K[i][j]; for (let q = 0; q < j; q++) s -= L[i][q] * L[j][q]; L[i][j] = i === j ? Math.sqrt(Math.max(s, 1e-12)) : s / L[j][j]; }
  const solveL = b => { const z = []; for (let i = 0; i < n; i++) { let s = b[i]; for (let q = 0; q < i; q++) s -= L[i][q] * z[q]; z.push(s / L[i][i]); } return z; };
  const solveLT = z => { const x = Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let s = z[i]; for (let q = i + 1; q < n; q++) s -= L[q][i] * x[q]; x[i] = s / L[i][i]; } return x; };
  const alpha = solveLT(solveL(Y.map(y => y - m)));
  const mu = [], sd = [];
  for (const u of grid) { const ks = X.map(a => k(a, u) * .09); mu.push(m + ks.reduce((s, v, i) => s + v * alpha[i], 0)); const v = solveL(ks); sd.push(Math.sqrt(Math.max(1e-9, .09 - v.reduce((s, x) => s + x * x, 0)))); }
  return { mu, sd };
}

export function createSim({ THREE, scene, byId, toast = () => { } }) {
  const linkGroup = new THREE.Group(); scene.add(linkGroup);
  const grid = Array.from({ length: 101 }, (_, i) => i / 100);
  let placed = [], roles = { orchestrator: [], optimizer: [], agent: [] }, hardware = [], workflow = [];
  let st = null, flights = [], wires = [], waitingApproval = null, manual = false, listeners = new Set();
  const log = [];

  /* ---------------------------------------------------------------- state */
  function reset() {
    st = { phase: "idle", t: 0, n: 0, X: [], Y: [], best: null, step: 0, x: null, faults: 0, plan: 0, wait: 0 };
    log.length = 0; waitingApproval = null; for (const fl of flights) linkGroup.remove(fl.g); flights = [];
    say("Campaign reset.", "info"); emit();
  }
  function say(text, kind = "info") { log.push({ t: st ? st.n : 0, text, kind }); if (log.length > 60) log.shift(); emit(); }
  function emit() { for (const fn of listeners) fn(api.state()); }

  /* ---------------------------------------------------------------- workflow from the deck */
  const capsOf = o => byId[o.id].caps || [];
  const has = (o, c) => capsOf(o).includes(c);
  function sync(list) {
    placed = list; roles = { orchestrator: [], optimizer: [], agent: [] }; hardware = [];
    for (const o of placed) { const it = byId[o.id]; if (it.digital) roles[it.role]?.push(o); else hardware.push(o); }
    const dosers = hardware.filter(o => has(o, "liquids") || has(o, "pastes") || has(o, "powders"));
    const by = c => hardware.filter(o => has(o, c));
    workflow = [];
    if (dosers.length) workflow.push({ kind: "dose", devs: dosers });
    if (by("move").length) workflow.push({ kind: "move", devs: by("move").slice(0, 1), to: "balance" });
    if (by("weigh").length) workflow.push({ kind: "weigh", devs: by("weigh"), data: true });
    if (by("mix").length) workflow.push({ kind: "mix", devs: by("mix") });
    if (by("move").length && by("characterize").length) workflow.push({ kind: "move", devs: by("move").slice(0, 1), to: "characterizer" });
    if (by("characterize").length) workflow.push({ kind: "characterize", devs: by("characterize"), data: true });
    drawWires(); if (!st) reset(); else emit();
  }

  /* ---------------------------------------------------------------- links in 3D: faint wiring plus animated flights */
  const anchor = o => { const b = new THREE.Box3().setFromObject(o.group), c = b.getCenter(new THREE.Vector3()); c.z = b.max.z + .05; return c; };
  function curve(a, b) { const p = anchor(a), q = anchor(b), mid = p.clone().lerp(q, .5); mid.z = Math.max(p.z, q.z) + .25 + p.distanceTo(q) * .18; return new THREE.QuadraticBezierCurve3(p, mid, q); }
  function drawWires() {
    for (const w of wires) { linkGroup.remove(w); w.geometry.dispose(); } wires = [];
    const orch = roles.orchestrator[0]; if (!orch) return;
    const ends = [...hardware, ...roles.optimizer, ...roles.agent, ...roles.orchestrator.slice(1)];
    for (const o of ends) { const c = curve(orch, o), kind = byId[o.id].role === "agent" ? "gate" : byId[o.id].role === "optimizer" ? "model" : "command";
      const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(40)), new THREE.LineDashedMaterial({ color: COL[kind], dashSize: .04, gapSize: .05, transparent: true, opacity: .28, depthWrite: false }));
      ln.computeLineDistances(); ln.userData.helper = true; linkGroup.add(ln); wires.push(ln); }
  }
  function fly(a, b, kind, dur = .9) {
    if (!a || !b || a === b) return; const c = curve(a, b), g = new THREE.Group();
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(40)), new THREE.LineBasicMaterial({ color: COL[kind], transparent: true, opacity: .85, depthWrite: false }));
    const dot = new THREE.Mesh(new THREE.SphereGeometry(kind === "data" ? .024 : .02, 12, 10), new THREE.MeshBasicMaterial({ color: COL[kind] }));
    g.add(line, dot); linkGroup.add(g); flights.push({ g, c, dot, line, t: 0, dur });
  }
  function busy(o, on, kind = "command") {
    if (!o) return; if (!o.busyRing) { const b = new THREE.Box3().setFromObject(o.group), s = b.getSize(new THREE.Vector3()), r = Math.max(s.x, s.y) * .62 + .03;
      o.busyRing = new THREE.Mesh(new THREE.RingGeometry(r, r + .018, 64), new THREE.MeshBasicMaterial({ color: COL[kind], transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
      o.busyRing.userData.helper = true; o.busyRing.position.z = .006; o.group.add(o.busyRing); }
    o.busyRing.material.color.setHex(COL[kind]); o.busyOn = on;
  }

  /* ---------------------------------------------------------------- decisions */
  function propose() {
    const opt = roles.optimizer[0];
    if (!opt) { const seq = [.1, .3, .5, .7, .9, .2, .4, .6, .8, .05, .95]; return { x: seq[st.n % seq.length], why: "grid design (no optimizer)" }; }
    if (st.X.length < 2) { const x = [.25, .75][st.X.length]; ud(opt).sim = { title: `${short(opt)} · initial design`, plot: { grid, mu: grid.map(() => .5), sd: grid.map(() => .3), obs: st.X.map((u, i) => [u, st.Y[i]]), next: x } }; ud(opt).redraw?.();
      return { x, why: `${short(opt)}: space-filling initial design` }; }
    const { mu, sd } = gp(st.X, st.Y, grid); let bi = 0, bv = -1e9; const beta = st.n < 4 ? 3 : 2;
    for (let i = 0; i < grid.length; i++) { const v = mu[i] + beta * sd[i]; if (v > bv) { bv = v; bi = i; } }
    ud(opt).sim = { title: `${short(opt)} · GP-UCB`, plot: { grid, mu, sd, obs: st.X.map((x, i) => [x, st.Y[i]]), next: grid[bi] } }; ud(opt).redraw?.();
    return { x: grid[bi], why: `${short(opt)}: GP-UCB, μ ${mu[bi].toFixed(2)} ± ${(2 * sd[bi]).toFixed(2)}` };
  }
  const short = o => byId[o.id].name.split(" (")[0];
  const ud = o => o.group.children[0].userData;   // the model group (its screens read userData.sim)
  function agentSay(lines) { for (const a of roles.agent) { const S = ud(a).sim ||= { title: short(a), lines: [] }; S.lines.push(...lines); S.lines = S.lines.slice(-8); ud(a).redraw?.(); } }
  function orchScreen(status) { const o = roles.orchestrator[0]; if (!o) return;
    ud(o).sim = { title: `${short(o)} · experiment ${st.n + 1}`, status, lines: workflow.map((w, i) => [`${VERB[w.kind]}${w.to ? " → " + w.to : ""} · ${w.devs.map(d => "#" + d.no).join(",")}`, i < st.step ? 2 : i === st.step && st.phase === "run" ? 1 : 0]) };
    ud(o).redraw?.(); }
  function gate(text, then) {
    const ag = roles.agent[0], orch = roles.orchestrator[0]; fly(ag, orch, "gate", 1.1); agentSay([text, manual ? "Waiting for your approval ▶" : "Auto-approved by the scientist's policy"]);
    if (manual) { waitingApproval = then; st.phase = "approval"; say(`${short(ag)}: ${text} Waiting for approval.`, "gate"); toast("An agent is waiting for your approval in the Run panel."); }
    else { say(`${short(ag)}: ${text} Approved (auto).`, "gate"); st.phase = "wait"; st.wait = 1.1; st.after = then; }
  }

  /* ---------------------------------------------------------------- the loop */
  function update(dt) {
    for (const fl of [...flights]) { fl.t += dt / fl.dur; fl.dot.position.copy(fl.c.getPoint(Math.min(1, fl.t))); fl.line.material.opacity = .85 * (1 - Math.max(0, fl.t - .7) / .3);
      if (fl.t >= 1) { linkGroup.remove(fl.g); fl.g.traverse(m => m.geometry?.dispose()); flights.splice(flights.indexOf(fl), 1); } }
    for (const o of placed) if (o.busyRing) { const target = o.busyOn ? .55 + .35 * Math.sin(performance.now() / 160) : 0; o.busyRing.material.opacity += (target - o.busyRing.material.opacity) * Math.min(1, dt * 8); }
    const orch = roles.orchestrator[0];
    if (!orch || !st) return;
    if (!workflow.length) { if (st.phase !== "nohw") { st.phase = "nohw"; orchScreen("no devices to orchestrate"); say("The orchestrator has no devices to run yet.", "warn"); } return; }
    if (st.phase === "nohw") st.phase = "idle";
    if (st.phase === "approval") return;
    if (st.phase === "wait") { st.wait -= dt; if (st.wait <= 0) { const fn = st.after; st.after = null; st.phase = "idle"; fn?.(); } return; }
    if (st.phase === "idle") {                                                     // start the next experiment
      if (roles.agent.length && (st.n === 0 || st.n % 6 === 0) && st.plan <= st.n) { st.plan = st.n + 1;
        gate(st.n === 0 ? "Campaign drafted: maximize desirability over the thickener fraction, 24 runs." : `Re-plan after ${st.n} runs: narrow the search near x = ${st.X[st.Y.indexOf(Math.max(...st.Y))].toFixed(2)}.`, () => { st.phase = "idle"; });
        return; }
      const p = propose(); st.x = p.x; st.step = 0; st.t = 0; st.phase = "run"; st.retry = false;
      if (roles.optimizer[0]) fly(roles.optimizer[0], orch, "model", 1);
      say(`Experiment ${st.n + 1}: x = ${p.x.toFixed(2)} (${p.why}).`, "model"); begin(); return;
    }
    if (st.phase === "run") {
      const w = workflow[st.step]; st.t += dt;
      if (st.t >= STEP_S[w.kind] * (st.retry ? 1.5 : 1)) {
        for (const d of w.devs) busy(d, false);
        if (w.kind === "dose" && !st.retry && Math.random() < .07) { st.retry = true; st.faults++; st.t = 0; const d = w.devs[Math.floor(Math.random() * w.devs.length)];
          say(`Fault on #${d.no} ${short(d)}: dispense stalled. ${short(orch)} pauses and retries.`, "warn"); busy(d, true, "gate");
          if (roles.agent.length) { agentSay([`Fault #${d.no}: stall`, "Recovery: purge, re-prime, retry ▶"]); fly(roles.agent[0], orch, "gate", 1); say(`${short(roles.agent[0])} drafts the recovery (purge and re-prime); approved by policy.`, "gate"); }
          return; }
        if (w.data) for (const d of w.devs) fly(d, orch, "data", .9);
        st.step++; st.t = 0; st.retry = false;
        if (st.step >= workflow.length) finish(); else begin();
      }
    }
  }
  function begin() { const w = workflow[st.step], orch = roles.orchestrator[0]; for (const d of w.devs) { fly(orch, d, "command", .7); busy(d, true, "command"); } orchScreen(`running: ${VERB[w.kind].toLowerCase()}`); }
  function finish() {
    const orch = roles.orchestrator[0], measured = workflow.some(w => w.kind === "characterize");
    if (measured) { const y = Math.max(0, f(st.x) + noise()); st.X.push(st.x); st.Y.push(y); st.best = st.best == null ? y : Math.max(st.best, y);
      say(`Result ${st.n + 1}: y = ${y.toFixed(3)}${y >= st.best ? " · new best" : ""}. Stored with its settings and lot.`, "data");
      for (const o of roles.optimizer) fly(orch, o, "data", .9); for (const a of roles.agent) fly(orch, a, "data", .9);
      if (roles.optimizer[0]) propose(); }
    else say(`Experiment ${st.n + 1} made, but nothing measures it: add a characterization station to close the loop.`, "warn");
    st.n++; st.phase = "wait"; st.wait = .6; st.after = null; orchScreen("experiment stored"); emit();
  }

  const api = {
    sync, update, reset,
    approve() { if (!waitingApproval) return; const fn = waitingApproval; waitingApproval = null; st.phase = "idle"; say("Scientist approved the plan.", "gate"); agentSay(["Approved by the scientist"]); fn(); emit(); },
    setManual(v) { manual = v; emit(); },
    on(fn) { listeners.add(fn); fn(api.state()); },
    roles: () => roles,
    state: () => ({ phase: st?.phase, n: st?.n || 0, best: st?.best, X: st?.X || [], Y: st?.Y || [], faults: st?.faults || 0, log, workflow, roles, waiting: !!waitingApproval, manual, f, grid }),
    gp,
  };
  return api;
}
