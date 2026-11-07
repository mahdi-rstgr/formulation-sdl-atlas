# The Material Spectrum: From Liquids to Solids

!!! info "Updated to manuscript V3"

    In the review the spectrum is organized by **handling class** (liquids, semi-solids, powders and discrete objects) rather than by a single yield-stress axis, and each class is mapped onto dispensing technologies with typical accuracy and throughput (Table 1, on [Dispensing by Material Class](dispensing.md)). The yield-stress ranges below are the earlier wiki's illustrative organizing axis; for the review's sourced ranges, see Table 1. Discrete objects (vials, premix containers, lids) are treated in [Object Handling](../object-handling/robot-classes.md).

## Yield Stress as the Organizing Axis

Materials encountered in autonomous formulation laboratories span a continuum based on **yield stress** — the minimum stress required for flow:

```
┌─────────────────────────────────────────────────────────────────┐
│  10⁰ Pa         10² Pa         10⁴ Pa         10⁶ Pa         10⁹ Pa
│   └──────────────────────────────────────────────────────────────┘
│
│  LIQUIDS      SEMI-SOLIDS      POWDERS       SOLIDS
│  (flow)       (yield-stress)   (granular)    (rigid)
│
└─────────────────────────────────────────────────────────────────┘
```

**Lower yield stress → higher mobility → continuous flow**  
**Higher yield stress → lower mobility → discrete manipulation**

## Material Classes and Handling Technologies

### Liquids (Yield Stress ~10⁰ – 10² Pa)

**Discrete Dispensing:**
- Air-displacement pipettes (standard for < 100 cP)
- Positive-displacement syringes
- Syringe pumps

**Continuous Dispensing:**
- Peristaltic pumps
- Gear pumps

**Contactless:**
- Acoustic droplet ejection
- Piezoelectric dispensers

**Dominant Strategy:** Characterize (measure viscosity) → Act

---

### Semi-Solids & Gels (Yield Stress ~10² – 10⁵ Pa)

**Extrusion-Based:**
- Syringe-based extrusion (motor drives plunger)
- Air pressure-driven (gentler on shear-sensitive bio-inks)
- Screw/auger extrusion (decouples flow from pressure)

**Progressive Cavity Pumps:** For consistent output despite yield stress

**Dominant Strategies:**
- Real-time correction (watch→detect→correct)
- Iterative optimization (dispense→weigh→optimize)
- Feedforward prediction (measure→predict→print)

---

### Powders (Yield Stress ~10⁴ – 10⁶ Pa, Granular)

**Feeding Methods:**
- Auger/screw feeders (volumetric control)
- Vacuum-assisted dosing (suction through orifice)
- Vibratory hoppers (struggles with sticky/charged powders)

**Feedback:**
- Gravimetric (weigh continuously or at endpoints)
- Vision (estimate fill height in scoops)
- Tactile (touch-based retrieval)

**Dominant Strategies:**
- Simulation-based generalization (train in sim, apply to unseen powders)
- Real-time correction (scoop→verify→pour)
- Iterative optimization (measure→calibrate→dispense)

---

### Solids (Yield Stress ~10⁶ – 10⁹ Pa)

**Discrete Object Handling:**
- 6-DOF robotic arms (UR3e, Franka, Kinova)
- SCARA robots (higher precision)
- Cartesian/gantry systems (lower cost)

**End-Effectors:**
- Vacuum grippers
- Parallel grippers
- Soft/compliant grippers
- Vision-guided pick-and-place

**Dominant Strategy:** Tactile retrieval (probe→feel→retrieve)

---

## The Spectrum in Practice

The yield-stress spectrum determines not only **which mechanism** to use, but also **which strategy** to employ:

| Yield Stress (Pa) | Material | Handling Class | Primary Mechanism | Primary Strategy | Typical Accuracy |
| --- | --- | --- | --- | --- | --- |
| 10⁰ – 10¹ | Water, solvents | Liquid | Pipette/pump | Characterize | Excellent (< 1%) |
| 10¹ – 10² | Honey, oil | Liquid | Syringe/peristaltic | Characterize or iterate | High |
| 10² – 10³ | Thick paste, gel | Semi-solid | Screw extrusion | Real-time correction | Moderate |
| 10³ – 10⁵ | Yield-stress paste | Semi-solid | Air-pressure extrusion | Watch→detect→correct | Moderate |
| 10⁴ – 10⁶ | Powder (free-flowing) | Granular | Auger/vibration | Simulation generation | Variable |
| 10⁶ – 10⁸ | Powder (cohesive) | Granular | Gravimetric + vision | Real-time correction | Good (±1 mg) |
| 10⁸ – 10⁹ | Tablet, pellet | Solid | Pick-and-place | Tactile retrieval | Excellent |

---

## Key Insight: Strategies Recur Across Materials

While each material class presents distinct **physical challenges** (viscosity, flow, cohesion), the underlying **control strategies** are remarkably similar:

- Both high-viscosity **liquids** and **pastes** benefit from real-time correction
- Both **powders** and **semi-solids** use simulation-based generalization
- **All classes** can employ iterative optimization when feedback sensors are available

This strategy-level view reveals that future autonomous labs should:

1. **Identify material properties** (yield stress, viscosity, flowability) on the fly
2. **Select the appropriate strategy** (characterize, optimize, correct, predict, simulate, reinvent, or retrieve)
3. **Apply the strategy** using a shared sensing and control infrastructure
4. **Switch strategies** as materials change, without re-engineering the entire system

---

## References

- Rastegardoost, M. M.; Bao, Z.; Sadr, S.; Abdollahi, N.; Darvish, K.; Clasky, A.; Ohsaka, H.; Le Devedec, F. *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents.* Manuscript in preparation, 2026.
- Key references from the review: [\[13\]](../references.md#ref-13), [\[14\]](../references.md#ref-14), [\[18\]](../references.md#ref-18), [\[21\]](../references.md#ref-21), [\[30\]](../references.md#ref-30). Full list on the [References](../references.md) page.

### Further reading (from the earlier wiki)

- Tadros, T. F. (2010). *Rheology of Dispersions*. Wiley-VCH.
