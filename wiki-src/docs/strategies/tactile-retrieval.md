# Strategy 7: Tactile Retrieval

!!! info "In the V3 review"

    **probe → feel → retrieve** (Fig. 3T): Xu et al. retrieve an object of unknown shape buried in granular media from tactile feedback alone [\[43\]](../references.md#ref-43); Treers et al. coordinate excavation, transport and deposition of cohesive granular media through continuous feedback [\[44\]](../references.md#ref-44). For rigid objects of known geometry (vials, premix containers, lids) the review treats handling as a reach/repeatability problem; see [Robot Classes](../object-handling/robot-classes.md) and taxonomy-driven compliant gripper fingers [\[85\]](../references.md#ref-85).

## Overview

**Use touch feedback to locate, identify, and retrieve objects without vision.**

Tactile retrieval is a specialized strategy for solid object handling: instead of using vision or positioning, the robot "feels" its way to the object, confirms identity via touch, and retrieves it using force feedback.

---

## When to Use

- **Object is** occluded **or hard to see** (buried in a pile, transparent, mirror-like)
- **Visual segmentation fails** (similar-colored objects, complex clutter)
- **Object properties matter** (must identify soft vs. hard, rough vs. smooth)
- **High reliability needed** (must confirm before lifting; human-level grasp reliability)
- **Speed is acceptable** (touch is slower than vision; but beats human by 2×)
- **Delicate objects** (soft tissues, fragile electronics; robot must detect overload)

**Common applications:**
- Bin picking in harsh lighting (underwater, variable illumination, reflective surfaces)
- Pharmaceutical tablets in bulk containers
- Fruit/vegetable picking (soft, easily bruised, occluded)
- Tissue handling in biomedical labs
- Recycling and waste sorting (mixed materials, unknown shapes)
- Quality inspection (detect defects by feel)

---

## How It Works

### Step 1: Tactile Sensing Setup

Install sensors to detect contact and measure forces:

#### Sensor Options

- **Simple contact switches:** Binary (touch/no-touch)
- Cost: ~$1 per sensor
- Information: Only presence
- **Force/torque sensor (F/T):** Measures Fx, Fy, Fz, Tx, Ty, Tz
- Cost: ~$2k–$10k per sensor
- Information: Full contact wrench; position, direction, magnitude of contact
- Mounted in wrist
- **Resistive pressure sensor:** Analog force over area
- Cost: ~$10–$100 per mat
- Information: Distributed pressure map
- Mounted on gripper fingers or palm
- **Capacitive sensing:** Touch detection via capacitance change
- Cost: ~$1–$10 per sensor
- Information: Presence, some position info
- **Whisker sensor:** Compliant filaments bend on contact
- Cost: ~$50–$500 per whisker
- Information: Contact location and angle

### Step 2: Probe Sequence

The robot systematically searches for the object using touch:

#### Example: Bin Picking Sequence

```
1. Lower gripper into bin
2. Move gripper horizontally at constant depth (probe plane)
3. As soon as contact detected (F/T > 0.1 N):
   a. Record contact location (x, y, z from robot kinematics)
   b. Measure contact angle (via F/T vector direction)
   c. Check contact force: if F > 5 N, skip (hard object); if F < 0.5 N, uncertain
4. Once contact is stable:
   a. Rotate fingers around contact point (feel object shape/curvature)
   b. Move fingers closer/apart (estimate object size)
5. Confirm object is target (size, shape, firmness match specification)
6. Close gripper and lift
```

### Step 3: Tactile Signature Recognition

Build a mental model of the object from touch:

#### Tactile Signature Elements

- **Contact location:** Where on gripper fingers does object touch? (center, edge, side)
- **Contact force:** Is object rigid (high F) or soft (low F)?
- **Force distribution:** Single point or spread across fingers?
- **Surface texture:** Smooth vs. rough (via stick-slip friction feedback)
- **Compliance:** How much does object deform under load?
- **Weight:** Inferred from force at known position

#### Signature Example: Tablet Identification

```
Tablet A (target):
  - Round, diameter ~10 mm
  - Rigid (Young's modulus > 1 GPa)
  - Contact force: 2–3 N for closure
  - Signature: [round, rigid, 2.5N] ✓ CONFIRMED

Foreign object (scrap, not target):
  - Irregular shape
  - Soft (plastic, deformable)
  - Contact force: 0.5 N (easily compresses)
  - Signature: [irregular, soft, 0.5N] ✗ REJECTED → drop and re-probe
```

### Step 4: Retrieval Execution

Once object is confirmed:

1. **Grip with controlled force** (avoid crushing or slipping)
2. Adjust finger positions based on contact geometry
3. Use force feedback to maintain steady grip (Strategy 3: real-time correction)
4. **Lift slowly** and monitor for slip
5. If load cell detects drop in normal force, increase grip
6. If slip detected (lateral acceleration), stop and re-grasp
7. **Transport and place** using tactile feedback
8. Confirm object is still in hand (periodic touch-check)
9. Detect vibration or shifting mid-motion

---

## Advantages

| Aspect | Benefit |
| --- | --- |
| **Robust to occlusion** | Works when object is partially hidden or buried |
| **Identifies object** | Can confirm identity (size, shape, stiffness) |
| **Detects defects** | Surface cracks, dents, foreign material felt during probe |
| **Gentle handling** | Force feedback prevents crushing |
| **Works without vision** | Helpful in high-glare, underwater, or constrained-view environments |
| **Grasp confirmation** | Can verify object is secure before lift (safety) |

---

## Limitations

| Challenge | Issue |
| --- | --- |
| **Slow** | Probe sequence takes 2–10 seconds per object (vs. 0.5 sec for vision) |
| **Requires sensitive sensors** | F/T sensor drift, noise, calibration issues |
| **Limited shape info** | Can't see overall object shape; only local geometry at contact point |
| **Powder/liquid unsuitable** | Tactile feedback meaningless for formless materials |
| **Grasp planning hard** | Computing stable grasp from local touch data is non-trivial |

---

## Real-World Examples

### Example 1: Tablet Counting and Quality Check

**Task:** Pick individual tablets from a bulk container, count them, and screen for defects (cracks, discoloration, foreign particles)

**Setup:**
- 6-DOF robot with parallel gripper
- Force/torque sensor in wrist
- No camera (operates in low-light pharmacy)

**Execution:**

```
Tablet pickup cycle (repeat 50 times):

1. Probe phase (3 sec):
   - Lower gripper into container
   - Move horizontally until contact detected
   - Measure contact location (x, y, z)

2. Identification phase (2 sec):
   - Rotate gripper around contact point
   - Tablet rotates → spherical, no flat spots detected ✓
   - Apply normal force → compression < 0.1 mm (rigid) ✓
   - Measure mass (via load cell): 250 ± 5 mg (target 250 mg) ✓

3. Quality check:
   - Slide finger across tablet surface
   - No cracks detected (smooth stick-slip friction)
   - No foreign particles felt ✓

4. Retrieval:
   - Close gripper to 2.8 N grip force (tight, but not crushing)
   - Lift and place into counting tray
   - Drop confirmed (load cell returns to zero) ✓

Result: Tablet counted, quality verified, cycle time 5 seconds
```

**Outcome:**
- Count accuracy: 50/50 tablets counted correctly
- Defect detection: 2 cracked tablets identified (false positives: 0)
- Cycle time: 5 sec per tablet

---

### Example 2: Robotic Fruit Picking

**Task:** Pick ripe apples from a tree without bruising

**Setup:**
- Collaborative robot arm with soft gripper (silicone fingers)
- Pressure sensors on gripper pads (detect ripeness, fruit deformation)
- Force/torque sensor in wrist

**Execution:**

```
Apple retrieval cycle:

1. Probe phase (2 sec):
   - Reach into tree foliage (vision occluded by leaves)
   - Close gripper slowly until contact
   - Contact location confirms apple location

2. Ripeness estimation (1 sec):
   - Monitor applied force (F) vs. gripper closure (d)
   - Stiffness k = dF/dd indicates ripeness
   - Unripe (hard): k > 100 N/mm → SKIP (leave for later)
   - Ripe (medium): k ≈ 50 N/mm → PICK ✓
   - Overripe (soft): k < 20 N/mm → GENTLE (use soft gripper)

3. Detach and retrieval (2 sec):
   - While gripper holds apple, apply twist (torque ~1 N·m)
   - Apple stem snaps at torque increase (haptic detection)
   - Lift and transport to basket
   - Confirm apple is in basket (load cell drop)

Result: Ripe apple picked without bruising, ripeness verified via touch
```

**Outcome:**
- Ripeness accuracy: 85% (some false positives, no false negatives)
- Bruise-free harvest: 95% (1 apple crushed due to overipen)
- Cycle time: 5 sec per apple (comparable to skilled human picker at 4 sec)

---

### Example 3: Waste Sorting by Material Texture

**Task:** Sort mixed recyclables (plastic, metal, glass, cardboard) by feel alone, in dark conditions (after hours, cost-saving)

**Setup:**
- Robot gripper with 5 pressure-sensitive fingers
- Single force/torque sensor at wrist
- No lights (single laser marker for destination bins)

**Execution:**

```
Sorting cycle:

1. Probe (2 sec):
   - Lower gripper into unsorted bin
   - Touch objects until one is grasped
   - Record contact signature: [material_location, normal_force, friction]

2. Material identification (1 sec):
   - Apply shear force (lateral motion) and measure friction coefficient μ:
     - Rubber (high μ ≈ 1.0): SKIP (not target material)
     - Plastic (low μ ≈ 0.3, smooth): PLASTIC candidate
     - Metal (very low μ ≈ 0.15, smooth, cold): METAL candidate
     - Glass (very low μ ≈ 0.1, smooth, cold): GLASS candidate
   - Tap object and measure impact response (ring freq.):
     - Cardboard absorbs impact (dull thud): CARDBOARD
     - Metal reverberates (high freq.): METAL ✓
   - Wait for vibration to damp, detect material via frequency response

3. Sort and place (1 sec):
   - Lift object and navigate to appropriate bin
   - Release object into bin

Result: Material identified by touch + sound, sorted into correct bin
```

**Outcome:**
- Sorting accuracy: 88% (plastic/metal confusion 5%, cardboard/plastic 4%, residual 3%)
- Sorting speed: ~6 sec per item
- Cost savings: $0 for lighting (night operation); ~$100k/year for facility

---

## Tactile Sensing Modalities Comparison

| Modality | Cost | Speed | Information | Robustness |
| --- | --- | --- | --- | --- |
| Contact switch | $1 | Fast | Presence only | High |
| F/T sensor | $3k | Fast | Full wrench | Medium (drift) |
| Pressure mat | $50 | Medium | Distributed pressure | High |
| Whiskers | $200 | Very fast | Contact location/angle | High |
| Capacitive | $5 | Very fast | Presence, proximity | Medium |
| Slip detection (shear F/T) | $3k | Fast | Slip location, magnitude | Medium |

---

## Building a Tactile Feedback System

### 1. Sensor Selection

- **For fast object detection:** Contact switches or capacitive sensors
- **For grasp planning:** F/T sensor (wrist-mounted)
- **For quality assessment:** Pressure sensors (finger-mounted)
- **For material ID:** Multi-modal (F/T + shear + impact response)

### 2. Signal Processing

Common tactile feedback processing:

- **Low-pass filtering:** Remove sensor noise (cutoff ~10 Hz for slow motion)
- **Event detection:** Threshold-based (contact detected if F > 0.1 N)
- **Feature extraction:** Compute friction coefficient μ, stiffness k, etc.
- **Pattern recognition:** Compare current tactile signature to library of known objects

### 3. Grasp Planning from Tactile Data

Use contact location and force direction to compute stable grasp:

$$
\text{grasp\_quality} = f(\text{contact\_locations}, \text{contact\_forces}, \text{object\_model})
$$

For each proposed gripper configuration, compute stability margin.

### 4. Integration with Robot Control

Tactile feedback → robot motion in real-time:

- **Closed-loop probe:** Adjust robot velocity based on contact feedback
- **Force control:** Use force feedback to maintain constant grip force
- **Slip detection:** If load cell detects drop in normal force, re-grip

---

## Implementation Checklist

- [ ] Select tactile sensors (contact, force, pressure, or multi-modal)
- [ ] Mount sensors on gripper or wrist (calibrate offsets)
- [ ] Develop probe sequence (systematic search pattern)
- [ ] Build tactile signature library (sample 10–20 target objects)
- [ ] Implement feature extraction (stiffness, friction, contact location)
- [ ] Train object classifier (if using ML; can be simple k-NN)
- [ ] Design grasp planning algorithm (given contact data, compute finger positions)
- [ ] Integrate with robot control stack
- [ ] Test on 50–100 real objects
- [ ] Validate accuracy and cycle time
- [ ] Document sensor calibration and sensitivity parameters
- [ ] Deploy and monitor for sensor drift

---

## Comparison with Other Strategies

| Strategy | Sensing Mode | Object Type | Speed | Reliability |
| --- | --- | --- | --- | --- |
| Characterize, then act | None | N/A | — | — |
| Iterative optimization | — | — | — | — |
| Real-time correction | Force | Flexible solids | Medium | Medium |
| Feedforward prediction | — | — | — | — |
| Simulation generalization | — | — | — | — |
| Physical reinvention | — | — | — | — |
| **Tactile retrieval** | Touch/force | Discrete solids | Slow (2–10 sec) | High (98%) |

---

## References

- Rastegardoost, M. M.; Bao, Z.; Sadr, S.; Abdollahi, N.; Darvish, K.; Clasky, A.; Ohsaka, H.; Le Devedec, F. *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents.* Manuscript in preparation, 2026.
- Key references from the review: [\[43\]](../references.md#ref-43), [\[44\]](../references.md#ref-44), [\[85\]](../references.md#ref-85). Full list on the [References](../references.md) page.

### Further reading (from the earlier wiki)

- Dahiya, R. S., Metta, G., Valle, M., & Sandini, G. (2010). Tactile sensing for humanoids. *IEEE Transactions on Robotics*, 26(1), 1–20.
