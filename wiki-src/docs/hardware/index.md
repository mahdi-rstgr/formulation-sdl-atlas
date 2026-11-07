# Commercial Hardware: Technologies and Systems

!!! info "Updated to manuscript V3"

    Sourced accuracy and price data from the review now live on three pages: [Commercial Dispensers](dispensers.md) (Table 3), [Integrated Platforms](platforms.md) (Table 4) and [Robot Classes](../object-handling/robot-classes.md) (Table 2); low-cost extensions are on [Retrofits](retrofits.md). The review's main finding: **price tracks mechanism class and ecosystem rather than accuracy, and outside liquid handling it is rarely public**. The vendor tables of the earlier wiki have been replaced by the review's sourced product list; component and setup cost estimates further down remain illustrative.

## Overview

This section surveys commercial material handling equipment available for autonomous formulation. Technologies are organized by yield stress (defining material class) and by strategy employed.

## Taxonomy by Material Class and Yield Stress

```
Yield Stress Range: 10⁰ – 10⁹ Pa

LIQUIDS (10⁰–10³ Pa)
  ├─ Pipettes & air-displacement systems
  ├─ Syringes & positive-displacement
  ├─ Peristaltic pumps
  ├─ Acoustic dispensing
  └─ Electrospray systems

SEMI-SOLIDS (10²–10⁵ Pa)
  ├─ Screw extrusion systems
  ├─ Air-pressure syringes
  ├─ Progressive cavity pumps
  └─ Piston extruders

POWDERS (10⁴–10⁶ Pa)
  ├─ Auger feeders (volumetric)
  ├─ Vibratory hoppers
  ├─ Vacuum aspiration systems
  ├─ Fluidized-bed dispensers
  └─ Gravimetric feedback systems

SOLIDS (10⁶–10⁹ Pa)
  ├─ Robotic arms (6-DOF)
  ├─ Grippers (parallel, soft, vacuum)
  ├─ Pick-and-place systems
  └─ Vision & force-feedback systems
```

---

## Key Equipment References

See [By Material Type](by-material.md) for detailed technology descriptions organized by material class.

See [By Yield Stress & Cost](cost-accuracy.md) for performance comparison (accuracy vs. cost) and selection guidance.

---

## Commercial Vendors (Examples from the Review)

The tables below list representative products with the accuracy and price reported in the review. "Quote" means no public price was found. Full tables: [Commercial Dispensers](dispensers.md), [Integrated Platforms](platforms.md), [Robot Classes](../object-handling/robot-classes.md).

### Liquid Handling

| Company | Product | Accuracy (reported) | Price | Ref |
| --- | --- | --- | --- | --- |
| Opentrons | OT-2 / Flex | ±15% at 1 µL; ±0.6% at 300 µL | OT-2 from $15,950; Flex from $26,400 | [\[15\]](../references.md#ref-15) |
| Hamilton | Microlab STAR | Trueness ≤0.75–1%; CV ≤1.5–2% | €104,500 | [\[16\]](../references.md#ref-16) |
| Eppendorf | epMotion 5075 | ±0.6–0.7% at full-scale volume | ~$8,000–20,000 | [\[75\]](../references.md#ref-75) |
| Tecan | Fluent (successor to Freedom EVO, sales ended Dec. 2025) | CV ≤3% at 10 µL, ≤0.5% at 100 µL | Fluent 1080 $32,995–75,000 | [\[77\]](../references.md#ref-77) |
| Rainin | E4 XLS+ pipette | ±0.8%; ≤0.15% CV | $191–350 | [\[59\]](../references.md#ref-59) |
| Watson-Marlow | Qdos 20 peristaltic pump | ±1% | $4,248 | [\[63\]](../references.md#ref-63) |

### Semi-Solid Dispensing

| Company | Product | Accuracy (reported) | Price | Ref |
| --- | --- | --- | --- | --- |
| Nordson EFD | Ultimus V (air pressure) | – | ~$6,750 | [\[17\]](../references.md#ref-17) |
| CELLINK | BIO X Pneumatic / Syringe Pump Printheads | ±0.5 °C temperature precision | $2,500–3,190 | [\[65\]](../references.md#ref-65), [\[67\]](../references.md#ref-67) |
| Allevi (3D Systems) | Allevi 2 | 5 µm XY / 1 µm Z motion precision | $15,000 | [\[66\]](../references.md#ref-66) |
| ViscoTec | preeflow eco-PEN300 (auger) | ±1% | Quote | [\[68\]](../references.md#ref-68) |
| Fisnar | PDV-1000 | – | Quote | [\[69\]](../references.md#ref-69) |

### Powder Dispensing

| Company | Product | Accuracy (reported) | Price | Ref |
| --- | --- | --- | --- | --- |
| Mettler-Toledo | Quantos (QB1/QB6) | Balance readable to 0.001 mg | Quote | [\[72\]](../references.md#ref-72) |
| Chemspeed | SWILE / GDU-P | ±10 µg resolution | Quote | [\[71\]](../references.md#ref-71) |
| Coperion K-Tron | MT12 Twin-Screw Micro-Feeder | SFT weighing resolution 1:4,000,000 | ~$9,800 (secondary market) | [\[70\]](../references.md#ref-70) |
| 3P Innovation | VF1 Vibratory Feeder | ±1 mg | Quote | [\[73\]](../references.md#ref-73) |
| Eriez | Hi-Vi Volumatic Feeder | – | Quote | [\[74\]](../references.md#ref-74) |

### Solid Handling (Robotics)

| Company | Product | Class | Repeatability | Price | Ref |
| --- | --- | --- | --- | --- | --- |
| Universal Robots | UR3e | 6-DOF arm | ±0.03 mm | ~$30,000 | [\[51\]](../references.md#ref-51) |
| UFACTORY | xArm 6 / Lite 6 | 6-DOF arm | ±0.1 / ±0.5 mm | $9,500 / ~$4,200 | [\[52\]](../references.md#ref-52), [\[53\]](../references.md#ref-53) |
| Franka Robotics | Franka Research 3 | 7-DOF cobot | <±0.1 mm | ~$30,000 | [\[54\]](../references.md#ref-54) |
| Kinova | Gen3 | 7-DOF cobot | ~±0.1 mm | ~$35,000 | [\[55\]](../references.md#ref-55) |
| Precise Automation | PreciseFlex PF400 | SCARA | ±0.09 mm | Quote | [\[49\]](../references.md#ref-49) |
| KUKA | KMR iiwa | Mobile manipulator | ±0.1 mm arm; ~±5 mm base | ~$42,000 (reseller) | [\[3\]](../references.md#ref-3), [\[58\]](../references.md#ref-58) |

---

## Sensing & Control Components

### Sensors for Feedback

- **Load cell / weighing scale:** 0.1 mg – 100 kg range, $100–$5000
- **Force/torque sensor:** ±500 N, ±50 N·m, $2k–$10k
- **Pressure transducer:** 0–10 bar, ±0.5% accuracy, $100–$500
- **Flow meter:** 0.001–10 L/min, $200–$2000
- **Camera / vision system:** 640×480 to 4K, $200–$5000
- **Rheometer (lab):** Anton Paar MCR 302, TA Instruments, $50k–$100k

### Control Platforms

- **PLC:** Siemens S7-1200, $500–$2000
- **Industrial PC:** National Instruments, $2k–$5k
- **Robot control stack:** ROS (open-source), Gazebo simulator (free)
- **LabVIEW:** National Instruments, $1k–$5k per seat
- **Python + real-time OS:** Real-time Linux, open-source

---

## Strategy-Equipment Mapping

| Strategy | Recommended Equipment | Vendors |
| --- | --- | --- |
| **Characterize** | Rheometer, viscometer, analyzer | Anton Paar, TA Instruments, Brookfield |
| **Iterate** | Gravimetric scale, manual dispenser | Mettler-Toledo, OHAUS |
| **Real-time correct** | F/T sensor, pressure transducer, fast feedback | ATI, JR3, Transducers Techniques |
| **Feedforward predict** | Fast analyzer (rheometer, spectroscopy) | Anton Paar, PerkinElmer |
| **Simulate** | Rheometry data, simulator (COMSOL, OpenFOAM) | Professional licenses, open-source |
| **Physical reinvent** | Custom fabrication (machine shop, 3D printing) | Local contractors, custom shops |
| **Tactile retrieval** | F/T sensor, gripper, force-feedback control | ATI, Schunk, OnRobot |

---

## Cost Breakdown for a Typical Setup

### Entry-Level (< $50k)

- Collaborative robot (UR3e or similar): ~$30k [\[51\]](../references.md#ref-51)
- Parallel gripper: $3k
- Sensors (scale, pressure): $2k
- Control software: Free (ROS)
- **Total: ~$35k**
- **Use case:** Basic bin picking, simple powder dispensing

### Mid-Level ($50k–$200k)

- Collaborative robot: $40k
- Precision gripper + force/torque sensor: $12k
- Scales (gravimetric): $8k
- Vision system: $5k
- Control software & integration: $10k
- **Total: ~$75k–$100k**
- **Use case:** Pharmaceutical dispensing, precision assembly

### Production-Grade ($200k–$1M)

- Industrial robot (6-axis, high-speed): $80k
- Precision liquid handling (Hamilton, Tecan): $100k
- Gravimetric + pneumatic dispensers: $50k
- Vision + force feedback: $20k
- Custom end-effectors & tooling: $30k
- System integration & validation: $50k
- **Total: ~$330k–$400k+**
- **Use case:** Large-scale pharmaceutical manufacturing, complex automation

---

## Next Steps

- Explore [Hardware by Material Type](by-material.md) for detailed technology options
- Review [Cost vs. Accuracy](cost-accuracy.md) for performance benchmarks and selection criteria
- Check [AI Infrastructure](../ai/index.md) for sensing and control strategies to pair with hardware

## References

- Rastegardoost, M. M.; Bao, Z.; Sadr, S.; Abdollahi, N.; Darvish, K.; Clasky, A.; Ohsaka, H.; Le Devedec, F. *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents.* Manuscript in preparation, 2026.
- Key references from the review: [\[15\]](../references.md#ref-15), [\[16\]](../references.md#ref-16), [\[46\]](../references.md#ref-46), [\[51\]](../references.md#ref-51), [\[59\]](../references.md#ref-59), [\[71\]](../references.md#ref-71), [\[72\]](../references.md#ref-72), [\[77\]](../references.md#ref-77). Full list on the [References](../references.md) page.
