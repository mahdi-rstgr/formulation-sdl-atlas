# Hardware Organized by Material Type

!!! info "Updated to manuscript V3"

    Mechanism descriptions below are from the earlier wiki. Accuracy, cost and vendor lines for which the review gives sourced values have been updated; remaining ranges are illustrative. For named products see [Commercial Dispensers](dispensers.md) and [Integrated Platforms](platforms.md); for robots see [Robot Classes](../object-handling/robot-classes.md).

## Liquids (Yield Stress < 100 Pa)

### Air-Displacement Pipettes

**Principle:** Movable piston creates air gap above liquid; changes in air volume precisely push/pull liquid.

**Accuracy:** <1% for water-like liquids on standard robots; Rainin E4 XLS+ ±0.8%, Eppendorf Xplorer ~±0.6% [\[59\]](../references.md#ref-59), [\[60\]](../references.md#ref-60)  
**Speed:** 30 sec per 10 mL  
**Cost:** $191–350 (Rainin E4 XLS+) to ~$1,300 (Eppendorf Xplorer) per pipette [\[59\]](../references.md#ref-59), [\[60\]](../references.md#ref-60)

**Vendors:** Eppendorf, Rainin, Gilson, Hamilton

**Suitable materials:** Water, solvents, dilute solutions; with slowed aspiration/dispensing and settling delays, up to ~1,000–1,400 cP (99% glycerol) on unmodified Opentrons GEN2 pipettes [\[21\]](../references.md#ref-21)

**Limitations:** Viscous liquids need hand-tuned per-liquid settings; volatile solvents evaporate into the air cushion; cannot handle yield-stress materials

---

### Syringe Pumps

**Principle:** Motor drives syringe plunger at controlled speed; linear displacement → precise volume flow.

**Accuracy:** ±2–5% typical; Hamilton PSD/4 OEM syringe pump ±1% [\[62\]](../references.md#ref-62)  
**Speed:** 5–30 sec per 10 mL (depends on speed setting)  
**Cost:** $400–500 (Hamilton PSD/4, OEM) to several $k per benchtop pump [\[62\]](../references.md#ref-62)

**Vendors:** Hamilton, New Era

**Suitable materials:** Low- to medium-viscosity liquids, some semi-solids

**Advantages:** Versatile, works on bench top, good for research

---

### Peristaltic Pumps

**Principle:** Rotating rollers squeeze flexible tubing; material never touches pump.

**Accuracy:** ±1% dosing accuracy for precision pumps (Watson-Marlow Qdos 20); generic tubing pumps drift with tubing wear [\[63\]](../references.md#ref-63)  
**Speed:** Tunable, 1–1000 mL/min  
**Cost:** $4,248 (Qdos 20) to ~$9,000 (Masterflex L/S Digital) [\[63\]](../references.md#ref-63), [\[64\]](../references.md#ref-64)

**Vendors:** Watson-Marlow, Cole-Parmer / Avantor (Masterflex)

**Suitable materials:** Any liquid (food-grade, sterile, corrosive); semi-solids at low rates

**Advantages:** No contact, aseptic, continuous flow

---

### Acoustic Droplet Ejection (ADE)

**Principle:** Focused acoustic transducer creates pressure pulse; ejects nano-droplets from well plate.

**Accuracy:** <10% transfer accuracy, <8% CV (Echo 525) [\[80\]](../references.md#ref-80)  
**Speed:** Milliseconds per droplet  
**Cost:** No public price [\[80\]](../references.md#ref-80)

**Vendors:** Beckman Coulter (Labcyte) Echo

**Suitable materials:** Aqueous solutions, low-viscosity liquids

**Advantages:** Contactless; useful for fragile reagents (proteins, cells)

**Limitations:** Expensive; transfer range 25 nL–5 µL (Echo 525) [\[80\]](../references.md#ref-80); not for viscous liquids. Research prototypes such as a self-focusing acoustic pipet reach picoliter volumes [\[24\]](../references.md#ref-24)

---

## Semi-Solids (Yield Stress 100 Pa – 100 kPa)

### Screw Extrusion (Stepper Motor)

**Principle:** Stepper motor drives rotating screw; screw flutes push material out.

**Accuracy:** ±2–5% (depends on material uniformity)  
**Speed:** 10–60 sec per mL  
**Cost:** $3k–$15k

**Vendors:** ViscoTec (preeflow eco-PEN300, ±1%, quote only) [\[68\]](../references.md#ref-68), Fisnar (PDV-1000) [\[69\]](../references.md#ref-69)

**Suitable materials:** Bio-inks, pastes, gels, highly viscous liquids

**Advantages:** Decouples flow from applied pressure; good control

---

### Air-Pressure Syringes

**Principle:** Compressed air pushes on syringe plunger; material is extruded through nozzle.

**Accuracy:** ±5–15% (sensitive to pressure fluctuations)  
**Speed:** 5–30 sec per mL  
**Cost:** $2k–$8k (syringe + regulator)

**Vendors:** Nordson EFD (Ultimus V, ~$6,750) [\[17\]](../references.md#ref-17), CELLINK (BIO X pneumatic printhead, $2,500) [\[67\]](../references.md#ref-67), Allevi (3D Systems) [\[66\]](../references.md#ref-66)

**Suitable materials:** Pastes, gels, gentle on cells (low shear)

**Advantages:** Gentle, no motor vibration; good for bio-inks

**Limitations:** Pressure fluctuation → volume variation; requires fast feedback for ±1%

---

### Progressive Cavity Pumps

**Principle:** Single rotating screw in elliptical cavity; creates expanding cells that push fluid.

**Accuracy:** ±1–3%  
**Speed:** Tunable, 10–1000 mL/min  
**Cost:** $5k–$20k

**Vendors:** Mono, Netzsch

**Suitable materials:** High-viscosity, yield-stress, shear-sensitive materials

**Advantages:** Gentle pumping action; excellent for viscous polymers, cells

---

## Powders (Yield Stress 10 kPa – 1 MPa)

### Auger / Screw Feeders

**Principle:** Rotating screw conveys powder from hopper to exit; volume per revolution ≈ constant.

**Accuracy:** ±2–8% (depends on flowability)  
**Speed:** 10–30 sec per gram  
**Cost:** $2k–$10k

**Vendors:** Coperion K-Tron (MT12 twin-screw micro-feeder, ~$9,800 secondary market) [\[70\]](../references.md#ref-70), Chemspeed (SWILE / GDU-P, quote only) [\[71\]](../references.md#ref-71)

**Suitable materials:** Free-flowing to moderately cohesive powders

**Limitations:** Fails with bridging powders; accuracy limited by slip

**Improvement:** Variable-pitch screws, vacuum assist

---

### Vibratory Hoppers

**Principle:** Vibrating bin loosens powder; gravity feeds through metered orifice.

**Accuracy:** ±5–15% (poor for cohesive materials)  
**Speed:** Fast, 2–10 sec per gram  
**Cost:** $1k–$5k

**Vendors:** 3P Innovation (VF1, ±1 mg dose accuracy) [\[73\]](../references.md#ref-73), Eriez (Hi-Vi Volumatic) [\[74\]](../references.md#ref-74)

**Suitable materials:** Free-flowing powders only

**Limitations:** Electrostatic buildup; poor accuracy; doesn't work for sticky powders

---

### Vacuum-Assisted Dosing

**Principle:** Suction creates vacuum through metered orifice; powder is pulled out by air flow.

**Accuracy:** ±1–3%  
**Speed:** 10–20 sec per gram  
**Cost:** $5k–$15k

**Vendors:** Research example: tuned vacuum flow and orifice size gave ≤0.1% RSD milligram transfers for one powder [\[37\]](../references.md#ref-37)

**Suitable materials:** Cohesive and fine powders; even electrostatic materials

**Advantages:** Works with difficult powders; good accuracy

---

### Fluidized-Bed Dispensers

**Principle:** Air flows up through porous membrane; powder floats weightless; exit through calibrated nozzle.

**Accuracy:** ±0.5–2% (excellent)  
**Speed:** 10–30 sec per gram  
**Cost:** $10k–$50k

**Vendors:** Not among the commercial products surveyed in the review (Table 3); figures here are illustrative.

**Suitable materials:** All powders (even bridging, cohesive, electrostatic)

**Advantages:** Highest accuracy; works with all powder types

**Limitations:** High cost; requires compressed air supply

---

### Gravimetric Feedback Systems

**Principle:** Real-time weighing on collection vessel; adjusts feeder speed to match target.

**Accuracy:** ±0.5–1% (depends on scale precision)  
**Speed:** 20–60 sec per dose (includes feedback cycles)  
**Cost:** $8k–$30k (feeder + scale + controller)

**Vendors:** Mettler-Toledo (Quantos, 0.001 mg readability, quote only) [\[72\]](../references.md#ref-72), Chemspeed (GDU) [\[71\]](../references.md#ref-71). Performance varies strongly with powder properties; systems often jam or require per-material calibration [\[18\]](../references.md#ref-18)

**Suitable materials:** Any powder

**Control strategy:** Iterative Optimization (Strategy 2) or Real-Time Correction (Strategy 3)

---

## Solids (Yield Stress > 1 MPa)

### 6-DOF Collaborative Robots

**Principle:** Motorized joints, each with encoders and torque sensors; compute target positions via kinematics.

**Accuracy:** ±0.03 mm (UR3e) to ±0.5 mm (UFACTORY Lite 6) repeatability [\[51\]](../references.md#ref-51), [\[52\]](../references.md#ref-52), [\[53\]](../references.md#ref-53)  
**Speed:** Cycle time 5–30 sec (depends on task)  
**Cost:** ~$4,200 (Lite 6) to ~$30,000 (UR3e); 7-DOF cobots ~$30,000–35,000 [\[51\]](../references.md#ref-51), [\[53\]](../references.md#ref-53), [\[54\]](../references.md#ref-54), [\[55\]](../references.md#ref-55)

**Vendors:** Universal Robots, UFACTORY, Franka Robotics, Kinova (see [Robot Classes](../object-handling/robot-classes.md))

**Suitable for:** Object pick-and-place, assembly, inspection

**Control strategies:** Tactile Retrieval (Strategy 7), Real-Time Correction (Strategy 3)

---

### Grippers

#### Parallel Gripper

- **Cost:** $1k–$3k
- **Grip force:** 100–1000 N
- **Suitable:** Rigid objects, boxes, rigid parts
- **Limitations:** Cannot adapt to soft or irregular shapes

#### Vacuum Gripper

- **Cost:** $500–$2k (suction cup only)
- **Lifting capacity:** 1–50 kg (depends on cup area, vacuum pump)
- **Suitable:** Flat, smooth, non-porous objects
- **Limitations:** Won't work on porous or deformable materials

#### Soft Gripper

- **Cost:** $2k–$10k
- **Grip force:** 1–10 N (gentle)
- **Suitable:** Delicate objects (tissue, fruit, fragile electronics)
- **Limitations:** Lower speed; may slip on smooth hard objects

#### Electroadhesion Gripper

- **Cost:** $3k–$10k
- **Lifting capacity:** 10–500 g (depends on voltage, material)
- **Suitable:** Any material (uses electrostatic force)
- **Advantages:** Non-contact; works on glass, foil, ceramics
- **Limitations:** Requires conductive gripper pad and target

---

### Pick-and-Place Systems (Gantry / SCARA)

**Principle:** Fast XY(Z) motion; specialized for high-speed discrete part handling.

**Accuracy:** Gantries ±0.1–0.5 mm; SCARA ±0.010–0.09 mm repeatability [\[46\]](../references.md#ref-46), [\[47\]](../references.md#ref-47), [\[49\]](../references.md#ref-49), [\[50\]](../references.md#ref-50)  
**Speed:** 1–3 sec per pick (very fast)  
**Cost:** $599 (desktop CNC gantry) to ~$2,500 (igus drylin); ~$1,400 open-source Jubilee; SCARA ~$10,000 or quote [\[46\]](../references.md#ref-46), [\[47\]](../references.md#ref-47), [\[48\]](../references.md#ref-48), [\[49\]](../references.md#ref-49), [\[50\]](../references.md#ref-50)

**Vendors:** SainSmart, igus, Machine Agency (Jubilee), Precise Automation, Epson

**Suitable for:** Tablets, pellets, small assemblies (food, pharma, electronics)

**Advantages:** Faster than 6-DOF robots for planar tasks

---

## Comparison Table: Key Commercial Systems

| System | Yield Stress Range | Accuracy | Speed | Cost | Strategy |
| --- | --- | --- | --- | --- | --- |
| Air-displacement pipette | 1–50 Pa | ±0.6–0.8% [\[59\]](../references.md#ref-59), [\[60\]](../references.md#ref-60) | 30 sec/10mL | $191–1,300 | Characterize |
| Syringe pump | 10–1000 Pa | ±2–5% | 10 sec/mL | $5k | Iterate |
| Air-pressure syringe | 100–10k Pa | ±5–15% | 10 sec/mL | $5k | Real-time correct |
| Screw extrusion | 500–50k Pa | ±2–5% | 20 sec/mL | $8k | Iterate/Predict |
| Auger feeder | 10k–1M Pa | ±2–8% | 10 sec/g | $5k | Characterize |
| Vacuum dispenser | 100k–1M Pa | ±1–3% | 15 sec/g | $10k | Iterate |
| Fluidized-bed | 100k–10M Pa | ±0.5–2% | 20 sec/g | $30k | Iterate/Feedback |
| Collaborative robot | > 1M Pa | ±0.03–0.1 mm | 5–30 sec | ~$30k [\[51\]](../references.md#ref-51), [\[54\]](../references.md#ref-54) | Tactile |

---

## Further Exploration

For each material type, see the [Material Properties](../materials/properties.md) page for characterization protocols, and [Recurring Strategies](../strategies/index.md) for recommended control approaches.

For cost vs. accuracy trade-offs, see [By Yield Stress & Cost](cost-accuracy.md).

## References

- Rastegardoost, M. M.; Bao, Z.; Sadr, S.; Abdollahi, N.; Darvish, K.; Clasky, A.; Ohsaka, H.; Le Devedec, F. *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents.* Manuscript in preparation, 2026.
- Key references from the review: [\[17\]](../references.md#ref-17), [\[21\]](../references.md#ref-21), [\[59\]](../references.md#ref-59), [\[61\]](../references.md#ref-61), [\[63\]](../references.md#ref-63), [\[68\]](../references.md#ref-68), [\[70\]](../references.md#ref-70), [\[72\]](../references.md#ref-72), [\[80\]](../references.md#ref-80). Full list on the [References](../references.md) page.
