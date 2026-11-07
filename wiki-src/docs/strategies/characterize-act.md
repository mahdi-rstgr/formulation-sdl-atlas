# Strategy 1: Characterize, Then Act

!!! info "In the V3 review"

    Literature scenarios that **measure first and then act** (Fig. 3):

    - **flow → measure → infer**: mass-flow viscometry up to 5000 cP [\[22\]](../references.md#ref-22).
    - **dispense → measure → generalize**: proxy viscometry on a standard Opentrons platform, 20–20,000 cP [\[23\]](../references.md#ref-23).
    - **sense → estimate → act**: viscosity estimated from stirring forces before planning a pour, calibrated to one batter [\[31\]](../references.md#ref-31).
    - **measure → calibrate → dispense**: a powder simulator calibrated from measured flowability, generalizing to unseen cohesive powders [\[39\]](../references.md#ref-39).

    The vendor baseline is itself a characterize-then-act lookup table: Opentrons' documented settings reach ~1,000–1,400 cP for a few named liquids [\[21\]](../references.md#ref-21). See [Literature Scenarios](../materials/literature-scenarios.md).

## Overview

**Measure material properties once, compute optimal handling parameters, execute.**

This is the simplest strategy: take time upfront to understand the material, then dispense or handle it with confidence using calculated parameters.

---

## When to Use

- **First-time use** of a new material or formulation
- **Material properties are documented** or can be quickly measured
- **High confidence** in physical model (e.g., Newtonian flow model for a simple liquid)
- **Time budget** allows for characterization phase before main task
- **Variability is low** between batches or runs

---

## How It Works

### Step 1: Measure Material Properties

Choose a property that governs handling. Examples:

- **Viscosity** (for liquids): Use an Anton Paar, TA Instruments, or Brookfield rheometer
- **Yield stress** (for pastes): Rheometer in controlled stress or controlled rate mode
- **Particle size** (for powders): Laser diffraction (Malvern Mastersizer) or sieve analysis
- **Flowability** (for powders): Angle of repose, Hausner ratio, powder rheometer

**Time typically required:** 30 seconds – 5 minutes per material

### Step 2: Build a Model

Use the measured property to estimate handling parameters:

#### Example: Viscosity Model for Pipetting

```
Given: target volume V_target, measured viscosity η
Model: air-gap time Δt = f(V_target, η, pump_model)

For air-displacement pipettes, experimental data show:
Δt (seconds) ≈ 0.1 + 0.5 × (η / 1 cP)  [for 1 mL, typical aspirate speed]
```

Measure the viscosity, look it up in a calibration table, set the air-gap time accordingly.

#### Example: Yield Stress Model for Syringe Extrusion

```
Given: measured yield stress τ_y, syringe barrel diameter d
Model: required extrusion pressure P = τ_y × (d/2) × safety_factor
```

The robot applies that force and confirms extrusion starts.

### Step 3: Execute

Use the calculated parameters for the main task:
- Set pump speed, pressure, or gripper force
- Execute without further feedback
- Record the result

---

## Advantages

| Aspect | Benefit |
| --- | --- |
| **Speed** | No iterative cycles; main task completes in one pass |
| **Simplicity** | No feedback loops, fewer sensors required |
| **Predictability** | Deterministic outcome (if model is accurate) |
| **Cost** | Works with basic sensors (rheometer, balance, etc.) |

---

## Limitations

| Challenge | Example |
| --- | --- |
| **Model accuracy** | Non-Newtonian fluids may not follow simple V∝Δt model |
| **Hidden variables** | Temperature, humidity, batch variation not captured |
| **Air bubbles** | A bubble in a syringe invalidates volume prediction |
| **Drift over time** | Viscosity changes as solvent evaporates |
| **One-shot recovery** | If first execution is wrong, material is already dispensed |

---

## Real-World Examples

### Example 1: Liquid Handling

**Task:** Dispense 10 mL of a chemical solution to a reaction vessel

**Procedure:**

1. Measure viscosity with a rheometer: η = 2.3 cP
2. Look up in calibration table: air-gap time = 0.12 seconds for 10 mL
3. Program syringe pump to 10 mL at 0.12 s aspirate, standard dispense
4. Execute

**Outcome:** Liquid dispensed. If bubble-free and material stable, volume is accurate (±2%).

---

### Example 2: Gel Extrusion

**Task:** Extrude 0.1 mL of a polymer gel onto a substrate

**Procedure:**

1. Measure yield stress with rheometer: τ_y = 50 Pa
2. Syringe diameter d = 3 mm
3. Required pressure P = 50 Pa × (3/2) mm × 1.5 (safety) ≈ 450 kPa
4. Program air-pressure syringe system to 450 kPa
5. Trigger extrusion

**Outcome:** Gel extrudes and deposits a bead. Volume is consistent if temperature is stable.

---

### Example 3: Powder Feeding

**Task:** Dispense 5 g of a powder

**Procedure:**

1. Measure Hausner ratio H: if H < 1.25, powder is "free-flowing"
2. Use auger feeder at standard speed for free-flowing powders
3. Dispense 5 g

**Outcome:** Powder is dispensed. If measured by weight, accuracy depends on flow consistency (±2–5% typical).

---

## Common Pitfalls

### 1. Trusting a Single Measurement

**Problem:** Measured η = 5 cP, but batch-to-batch variation is ±10%.

**Solution:** Measure multiple batches, or use a looser tolerance on flow time.

### 2. Forgetting Temperature Dependence

**Problem:** Viscosity of honey changes by 10% per °C.

**Outcome:** Morning dispense is accurate, afternoon dispense drifts.

**Solution:** Either measure at target temperature, or switch to real-time correction (Strategy 3) if temperature fluctuates.

### 3. Assuming Model Transfer

**Problem:** Model trained on water (density 1.0 g/mL) applied to mercury (density 13.6 g/mL).

**Outcome:** Pressure/force predictions are off by 10×.

**Solution:** Re-calibrate model per material class.

### 4. Ignoring Air Bubbles

**Problem:** Viscosity is correct, but a 0.5 mL air bubble entered the syringe.

**Outcome:** Aspirated 10.5 mL (air + liquid), dispensed 10 mL, but only 9.5 mL is liquid.

**Solution:** Always aspirate with a bubble-free technique; use deaeration if needed.

---

## Implementation Checklist

- [ ] Select property to measure (viscosity, yield stress, flowability)
- [ ] Build or select a model relating property to handling parameters
- [ ] Validate model on 3–5 materials
- [ ] Measure target material property
- [ ] Calculate handling parameters
- [ ] Execute without feedback
- [ ] Verify outcome (weigh, measure, image)
- [ ] If accuracy insufficient, escalate to Strategy 2 (Iterative Optimization) or Strategy 3 (Real-Time Correction)

---

## Comparison with Other Strategies

| Strategy | Speed | Accuracy | Sensor Cost | Complexity |
| --- | --- | --- | --- | --- |
| **Characterize, then act** | Very fast | Moderate (±5%) | Low | Low |
| Iterative optimization | Slower | High (±1%) | Medium | Medium |
| Real-time correction | Medium | High (±2%) | Medium | High |
| Feedforward prediction | Very fast | High (±2%) | Medium | High |
| Simulation generalization | Fast | Medium–High | Medium | Very high |

---

## References

- Rastegardoost, M. M.; Bao, Z.; Sadr, S.; Abdollahi, N.; Darvish, K.; Clasky, A.; Ohsaka, H.; Le Devedec, F. *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents.* Manuscript in preparation, 2026.
- Key references from the review: [\[21\]](../references.md#ref-21), [\[22\]](../references.md#ref-22), [\[23\]](../references.md#ref-23), [\[31\]](../references.md#ref-31), [\[39\]](../references.md#ref-39). Full list on the [References](../references.md) page.

### Further reading (from the earlier wiki)

- Mezger, T. G. (2020). *The Rheology Handbook* (5th ed.). Vincentz Network.
