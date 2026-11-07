# Safety in Autonomous Material Handling

!!! info "Updated to manuscript V3"

    The review adds two AI-era safeguards: a **digital twin as verification gate** that rehearses each proposed action and refers low-confidence cases to a human [\[129\]](../references.md#ref-129), [\[130\]](../references.md#ref-130), and **safety by construction** for AI agents, which receive no tools for device commands, arming the cell, editing safety configuration or approving runs, so that a prompt injection or model error can at worst produce a rejected draft. See [Simulation & Digital Twins](../simulation/index.md#a-layered-architecture-and-the-verification-gate) and [LLMs & AI Agents](../ai/agents.md#levels-of-autonomy-and-safeguards).

## Overview

As systems become more autonomous, safety becomes both more critical and more complex. This page addresses hazards, mitigations, and best practices.

---

## Safety Hierarchy

### 1. Inherent Safety (Design-Out Hazards)

**Principle:** Design the system so hazards cannot occur.

**Examples:**
- Use low-pressure pneumatics instead of high-pressure (reduced pressure → reduced explosion risk)
- Choose non-toxic solvents (reduced chemical burn risk)
- Use ergonomic dimensions to prevent worker awkward postures (reduce strain injury)
- Design grippers with soft materials (reduced pinch/crush injuries)

**Benefit:** No safety device needed; hazard is eliminated

---

### 2. Engineered Controls (Guard, Contain, Limit)

**Principle:** Use engineering to reduce risk even if hazard remains.

**Examples:**
- Pressure relief valve (limits pressure to safe level)
- Fume hood (contains toxic vapors)
- Interlocked safety gate (prevents robot motion when person is inside)
- Emergency stop button (cuts power instantly)

**Benefit:** Robust; works regardless of operator behavior

---

### 3. Administrative Controls (Rules, Training)

**Principle:** Document safe procedures; train workers to follow them.

**Examples:**
- "Never reach into feeder while running"
- "Wear safety glasses around high-pressure lines"
- "Check pressure gauge before operating"

**Limitation:** Depends on human compliance; single point of failure

---

### 4. Personal Protective Equipment (PPE)

**Principle:** Last-resort protection; worn by person if hazard exposure occurs.

**Examples:**
- Safety glasses (protects from splashes)
- Gloves (protects from chemical burns)
- Lab coat (reduces skin exposure)

**Limitation:** Only effective if worn; doesn't prevent hazard occurrence

---

## Hazard Categories

### Chemical Hazards

#### Toxic Solvents (Organic, Flammable, Corrosive)

**Hazard:** Inhalation, skin contact, ingestion, fire

**Mitigations:**
- Use fume hood for volatile solvents
- Secondary containment (tray under pump/lines) to catch leaks
- Intrinsically safe electrical (no sparks, no hot surfaces)
- Material compatibility (syringe + tubing + seals must resist solvent)
- Emergency eyewash and safety shower nearby

**Example specifications:**
- Boiling point > 100°C (less volatile)
- Flash point > 25°C (less flammable)
- LD50 > 1000 mg/kg (less acutely toxic)

---

### Pressure Hazards

#### High-Pressure Pump or Syringe Failure

**Hazard:** Sudden release of pressurized fluid (projectile, pressure wave, chemical splash)

**Mitigations:**
- Pressure relief valve (opens if pressure exceeds set point, e.g., 200 kPa)
- Ductile tubing + reinforced fittings (rated for 2× operating pressure)
- Pressure gauge + alarm (alerts if pressure anomalous)
- Safety shroud (contains any leaks locally)
- Regular inspection (visual check for bulges, cracks, corrosion)

**Example:**
- Operating pressure: 100 kPa
- Relief valve setting: 150 kPa
- Tubing rating: 300 kPa (2× relief)

---

### Mechanical Hazards

#### Robot Collision / Pinch Points

**Hazard:** Robot arm strikes person or object; gripper crushes hand/finger

**Mitigations:**
- **Speed limiting:** Collaborative robot (UR, Franka) can be set to max speed 0.5 m/s (gentle even if hits person)
- **Force/torque limiting:** Robot detects collision via wrist F/T sensor, stops immediately
- **Physical barriers:** Safety fencing around robot cells
- **Interlocked gates:** Gate opens only when robot is inactive
- **Vision-based safety:** Camera monitors for human presence; robot slows or stops if person approaches

**Specifications (ISO/TS 15066 — Collaborative Robotics):**
- Max power: 80 W (avoids serious injury from sustained contact)
- Max force: 150–400 N depending on contact location (hand vs. forehead)
- Monitoring latency: < 100 ms (robot stops before harmful acceleration)

---

### Electrical Hazards

#### Electrical Shock from Electrodes or High-Voltage Equipment

**Hazard:** Wet environment + electrical equipment = electrocution risk

**Mitigations:**
- **Low-voltage control (≤ 24 V DC):** Safe by design; ISO 13849-1 PLd-rated systems
- **GFCI protection (Ground Fault Circuit Interrupter):** Detects leakage current, cuts power in < 30 ms
- **Insulation inspection:** Visual and dielectric test annually
- **No mixing of wet and electrical:** Keep pumps, motors away from standing water

---

## System-Level Safety Architecture

### Fault Detection & Diagnosis

```
Sensor 1 (load cell)      Sensor 2 (pressure)
       ↓                            ↓
   Compare              Compare with
  consistency           expected value
       ↓                            ↓
  Divergence?           Anomaly?
       ↓                ↓
    ERROR detected
       ↓
  Safety Action:
    - Log error
    - Trigger alarm
    - Stop equipment
    - Alert operator
```

### Example: Syringe Extrusion Anomaly Detection

```
Normal mode:
  Applied pressure: 200 kPa → Flow rate: 2 mL/s
  Detector: IF pressure ~200 AND flow < 1.5, THEN anomaly (nozzle clog?)

Anomaly response:
  1. Log: "Clogged nozzle detected at t=123 sec"
  2. Alarm: Audible beep + LED red
  3. Action: Stop pump, hold pressure (don't lose pressure, takes time to rebuild)
  4. Wait: 5 seconds (maybe pressure surge clears clog)
  5. Retry: If still clogged, escalate to "STOP + request human"
  6. Human: Manually inspect nozzle, clear clog, restart
```

### Emergency Stop (E-Stop)

**Requirement:** One large red button, pressing it:
- Cuts power to all actuators (pump, motor, valve)
- Engages brakes (if available)
- Triggers alarm
- Can be done instantly by any person

**Electrical design:**
- Hard-wired (not software) to safety relay
- Series circuit: all E-stop buttons must be "closed" for system to run
- One button open → system stops immediately

---

## Material-Specific Hazards

### Powders

- **Dust explosion:** Fine powders (< 100 µm) suspended in air can explode if ignited
- Mitigation: Inert atmosphere (nitrogen), grounding (eliminate static), no ignition sources
- **Electrostatic buildup:** Moving powder acquires charge, creates spark
- Mitigation: Grounding strap on feeder; conductive lines
- **Bridging:** Powder jams hopper
- Hazard: Sudden release of bridged powder (impact)
- Mitigation: Mechanically safe hopper design; avoid shaking by hand (risk of sudden collapse)

### High-Viscosity Liquids

- **Straining injury:** Manual dispensing of very viscous material (> 1000 cP) can cause repetitive strain
- Mitigation: Automated pump (reduces manual force)

### Yield-Stress Materials

- **Pressure buildup:** Paste clogs nozzle; pressure rises until line ruptures
- Mitigation: Pressure relief valve; pressure monitoring with alarm

---

## Validation & Testing

### Pre-Deployment Checklist

- [ ] Review all hazard modes (FMEA or HAZOP study)
- [ ] Verify all safety devices are rated for duty
- [ ] Test E-stop function
- [ ] Verify pressure relief valve setting and operation
- [ ] Electrical safety audit (insulation, grounding, GFCI)
- [ ] Mechanical inspection (signs of wear, corrosion, cracks)
- [ ] Sensor calibration verification
- [ ] Software safety review (could software command unsafe action?)
- [ ] Human factors review (is training clear? Can E-stop be reached quickly?)
- [ ] Regulatory compliance (does system meet ISO/OSHA/FDA requirements?)

### Ongoing Monitoring

- **Daily:** Visual inspection (leaks, loose wires, cracks)
- **Weekly:** Test E-stop, verify pressure gauge readings
- **Monthly:** Inspect tubing, seals, connections
- **Quarterly:** Calibrate pressure transducers, validate sensor readings
- **Annually:** Full safety audit, electrical dielectric test, pressure relief valve test

---

## Documentation

### Safety Manual (Should Include)

1. **Hazard list:** What can go wrong?
2. **Safety devices:** How are hazards mitigated?
3. **Operating procedures:** Safe steps to operate system
4. **Maintenance schedule:** When to inspect/calibrate
5. **Emergency procedures:** What to do if E-stop triggered? How to restart?
6. **Training requirements:** What knowledge/certification needed?
7. **Contact information:** Who to call if something goes wrong?

### Example SOP (Standard Operating Procedure) for Liquid Dispensing

```
1. PRE-STARTUP CHECK (5 minutes)
   - Visually inspect pump for leaks, cracks
   - Check pressure gauge (should read 0 kPa)
   - Verify all tubing connections tight
   - Confirm E-stop button is accessible
   - Read chemical safety data sheet (SDS) for solvent

2. STARTUP (2 minutes)
   - Put on safety glasses, gloves, lab coat
   - Turn on fume hood (wait 2 minutes for airflow)
   - Press power button; wait for beep (system initialized)
   - Check LED: GREEN = ready, RED = error (investigate)

3. OPERATION (per task)
   - Load solvent bottle
   - Input dispense volume and speed via software
   - Press "START"
   - Do NOT leave unattended
   - Monitor pressure gauge (should stay < 120 kPa)
   - If alarm sounds, STOP immediately and investigate

4. POST-OPERATION (5 minutes)
   - Press "STOP" button
   - Wait 30 seconds for residual pressure to bleed
   - Turn off pump
   - Inspect for leaks
   - Log volume dispensed, any anomalies, in lab notebook
   - Close solvent bottle

5. SHUTDOWN
   - Turn off power
   - Disarm safety system (if applicable)
   - Cover equipment with dust cover
```

---

## References

- Rastegardoost, M. M.; Bao, Z.; Sadr, S.; Abdollahi, N.; Darvish, K.; Clasky, A.; Ohsaka, H.; Le Devedec, F. *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents.* Manuscript in preparation, 2026.
- Key references from the review: [\[35\]](../references.md#ref-35), [\[129\]](../references.md#ref-129), [\[130\]](../references.md#ref-130), [\[171\]](../references.md#ref-171). Full list on the [References](../references.md) page.

### Further reading (from the earlier wiki)

- ISO 12100: Safety of machinery – General principles for design
- ISO/TS 15066: Safety of collaborative robots (force limits, monitoring)
- NFPA 654: Standard on the Prevention of Fire and Dust Explosions
- OSHA Regulatory Requirements
- FDA 21 CFR Part 11 (Electronic Records, validation for pharma)
