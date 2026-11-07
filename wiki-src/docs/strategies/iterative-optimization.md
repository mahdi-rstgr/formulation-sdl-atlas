# Strategy 2: Iterative Optimization

!!! info "In the V3 review"

    Literature scenarios that **tune parameters across trials** (Fig. 3):

    - **dispense → weigh → optimize**: Bayesian optimization of aspirate/dispense parameters under gravimetric feedback, <5% error at 1275 cP on an Opentrons OT-2 [\[11\]](../references.md#ref-11).
    - **draw → tune → dose**: vacuum flow and orifice size tuned for ≤0.1% RSD milligram powder transfers (one powder, offline) [\[37\]](../references.md#ref-37).
    - **pour → mix → assess**: Bayesian optimization with computer-vision foam assessment to reconstitute a powdered beverage [\[42\]](../references.md#ref-42).

    Bayesian optimization [\[135\]](../references.md#ref-135) and libraries such as BoTorch [\[136\]](../references.md#ref-136) make this routine; see [Data & Decision Models](../ai/data-and-decisions.md).

## Overview

**Dispense, measure, adjust, repeat until target is met.**

This strategy treats material handling as an optimization problem: perform a trial dispensing, measure the outcome, adjust parameters based on the measurement, and repeat until accuracy requirements are met.

---

## When to Use

- **High accuracy required** (±0.5% or better)
- **Model is uncertain** (don't trust first-principles calculations)
- **Material variation is high** between batches or within a batch
- **Feedback sensors available** (balance, fill-height camera, pressure transducer)
- **Computational resources** are modest (linear model, not deep learning)
- **Time budget** allows for multiple dispense cycles (3–10 iterations typical)

---

## How It Works

### Step 1: Initial Guess

Start with a nominal parameter set:
- From a prior model (Strategy 1)
- From literature or manufacturer data
- From past similar material

**Example:** Dispense first 5 g of powder at speed = 50 rpm (nominal).

### Step 2: Measure Outcome

After each dispensing, measure what was actually delivered:

- **Gravimetric:** Place collection vessel on balance, measure mass
- **Volumetric:** Use graduated cylinder or measure volume change
- **Fill height:** Use camera to estimate volume from fill height in container
- **Pressure/flow:** Monitor pressure drop or flow rate during extrusion

**Accuracy:** Measurement must be at least 5× more accurate than your final tolerance. (For ±1% target, measure to ±0.2%.)

### Step 3: Compute New Parameters

Use the error to estimate a better parameter set:

#### Linear Model (Most Common)

If outcome is linear in the parameter:

$$
\text{outcome} = \text{baseline} + \text{sensitivity} \times (\text{parameter} - \text{nominal})
$$

**Example:**

- Trial 1: dispense at speed S₁ = 50 rpm → measure M₁ = 4.8 g
- Target: 5.0 g
- Error: ΔM = 5.0 − 4.8 = 0.2 g (too low)
- Sensitivity: Assume ΔM / ΔS ≈ 0.1 g/rpm
- New speed: S₂ = S₁ + ΔM / sensitivity = 50 + 0.2 / 0.1 = 52 rpm

#### Quadratic or Non-Linear Model

For non-linear systems, use:
- **Polynomial fit** if you have 3+ data points
- **Gaussian process regression** if you have time and want confidence intervals
- **Neural network** if you have 20+ historical examples

### Step 4: Repeat Until Converged

Dispense again at S₂, measure M₂, adjust to S₃, etc.

**Convergence criterion:** When |M_{n+1} − target| < tolerance, stop.

**Typical trajectory:**

```
Trial 1: M = 4.8 g (1.8 mg short)    → update model
Trial 2: M = 5.05 g (0.5 mg over)    → refine
Trial 3: M = 4.99 g (0.1 mg short)   → PASS
```

---

## Advantages

| Aspect | Benefit |
| --- | --- |
| **Accuracy** | Can achieve ±0.5–1% accuracy even with unknown material |
| **Robustness** | Automatically corrects for drift, temperature, batch variation |
| **Model-free** | No need to measure physical properties or fit a complex model |
| **Adaptive** | Learns the relationship on the fly for each material |
| **Failure recovery** | If first trial is wrong, subsequent trials correct it |

---

## Limitations

| Challenge | Issue |
| --- | --- |
| **Time** | Takes 3–10 dispense-measure cycles (10–30 minutes typical) |
| **Waste** | Each trial uses material; can add up for expensive substances |
| **Non-linearity** | If relationship is highly non-linear, may not converge or overshoot |
| **Measurement noise** | If balance is noisy (±0.05 g), errors propagate |
| **Parameter constraints** | May try to set pump speed or pressure outside hardware limits |

---

## Real-World Examples

### Example 1: Powder Dispensing by Weight

**Task:** Dispense 1.0 g of API (Active Pharmaceutical Ingredient) powder, 20 times

**Procedure:**

1. Set auger feeder to nominal 30 rpm
2. Dispense trial 1 → weigh → 0.95 g (50 mg short)
3. Model: ΔM = 1.7 mg/rpm
4. Update: speed₂ = 30 + 50/1.7 ≈ 30 rpm (negligible change, but be patient)
5. Dispense trial 2 → 1.01 g (PASS)
6. Dispense 20 final doses at 30 rpm
7. Each dose: 1.0 ± 0.02 g

**Time:** ~5 minutes for calibration + 5 minutes for 20 doses.

**Alternative (faster):** Dispense 3–5 trials to map the sensitivity curve, then all 20 final doses at optimized speed.

---

### Example 2: Liquid Volume in Syringe Extrusion

**Task:** Extrude 1.0 mL of silicone polymer ink onto a 3D printing substrate

**Procedure:**

1. Set motor speed to 10 mm/s plunger speed
2. Dispense trial 1 → measure bead volume (via image analysis) → 0.92 mL (80 µL short)
3. Sensitivity: 8 µL/mm/s
4. Speed₂ = 10 + 80/8 = 20 mm/s (Too aggressive? Try 15 mm/s for safety)
5. Dispense trial 2 at 15 mm/s → 1.03 mL (PASS, or close)
6. Adjust to 14.5 mm/s if needed
7. Dispense 5 final beads at 14.5 mm/s
8. Each bead: 1.0 ± 0.05 mL

**Measurement:** Use calibrated syringe or optical measurement.

---

### Example 3: Paste Extrusion with Pressure Control

**Task:** Extrude 2 mL of ink at consistent flow rate

**Procedure:**

1. Air-pressure syringe set to 200 kPa nominal
2. Trigger extrusion, measure extrusion time for 2 mL → 4.5 seconds (faster than expected)
3. Flow rate: 2 mL / 4.5 s = 0.44 mL/s
4. Target flow rate: 0.4 mL/s (slower, for precision)
5. Pressure sensitivity: 0.05 mL/s per 10 kPa
6. Required pressure: 200 − 10×0.04/0.05 ≈ 192 kPa
7. Adjust to 190 kPa and retry
8. Measure extrusion time → 5.0 seconds (0.40 mL/s) ✓ PASS

---

## Linear Calibration Model (Most Practical)

For most dosing tasks, a **linear 1-parameter model** suffices:

$$
\text{dose} = \alpha + \beta \times \text{control\_parameter}
$$

### Calibration Procedure

1. **Collect 3 data points** at different settings:
2. Setting A: dose_A
3. Setting B: dose_B
4. Setting C: dose_C
5. **Fit the line:**
   $$
   \beta = \frac{(\text{dose}_B - \text{dose}_A)}{(\text{setting}_B - \text{setting}_A)}
   $$
   $$
   \alpha = \text{dose}_A - \beta \times \text{setting}_A
   $$
6. **Predict setting for target dose:**
   $$
   \text{setting} = \frac{\text{target_dose} - \alpha}{\beta}
   $$
7. **Execute at predicted setting.**
8. **(Optional) Fine-tune:** If measured dose differs from target by > 2%, adjust once more.

### Example Calibration Table for Powder Auger

| Auger Speed (rpm) | Measured Dose (g) |
| --- | --- |
| 40 | 0.90 |
| 50 | 1.10 |
| 60 | 1.30 |

**Fit:** slope β = (1.30 − 0.90) / (60 − 40) = 0.02 g/rpm, intercept α = 0.90 − 0.02×40 = 0.10 g

**Target:** 1.00 g → setting = (1.00 − 0.10) / 0.02 = 45 rpm

**Verify:** At 45 rpm, expect (0.10 + 0.02×45) = 1.00 g ✓

---

## Implementation Checklist

- [ ] Define target dose and tolerance (e.g., 5.0 ± 0.1 g)
- [ ] Choose measurement device (balance, camera, flow meter) and verify accuracy
- [ ] Start with nominal parameter (literature, prior data, or guess)
- [ ] Dispense trial 1, measure outcome
- [ ] If within tolerance, proceed to main task; if not, continue
- [ ] Fit linear model (or use proportional control if only one trial)
- [ ] Predict next parameter value
- [ ] Dispense trial 2, measure
- [ ] Repeat until within tolerance (typically 2–4 iterations)
- [ ] Document calibration for future reference
- [ ] Dispense all final doses at optimized parameter
- [ ] Verify final doses meet specification

---

## Comparison with Other Strategies

| Strategy | Time to Deploy | Accuracy | Robustness | Sensor Requirement |
| --- | --- | --- | --- | --- |
| Characterize, then act | Very fast (1 min) | ±5% | Low | Minimal |
| **Iterative optimization** | Medium (10–20 min) | ±1% | High | Balance, scale |
| Real-time correction | Medium (5–10 min) | ±1–2% | Very high | Fast sensor |
| Feedforward prediction | Very fast (1 min) | ±2% | Medium | Rheometer, model |

---

## References

- Rastegardoost, M. M.; Bao, Z.; Sadr, S.; Abdollahi, N.; Darvish, K.; Clasky, A.; Ohsaka, H.; Le Devedec, F. *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents.* Manuscript in preparation, 2026.
- Key references from the review: [\[11\]](../references.md#ref-11), [\[37\]](../references.md#ref-37), [\[42\]](../references.md#ref-42), [\[135\]](../references.md#ref-135), [\[136\]](../references.md#ref-136). Full list on the [References](../references.md) page.

### Further reading (from the earlier wiki)

- Hastie, T., Tibshirani, R., & Friedman, J. (2009). *The Elements of Statistical Learning*. Springer.
- Box, G. E., Hunter, W. G., & Hunter, J. S. (1978). *Statistics for Experimenters*. Wiley.
