# Strategy 4: Feedforward Prediction

!!! info "In the V3 review"

    Literature scenarios that **predict parameters before acting** (Fig. 3):

    - **measure → predict → print**: droplet size and volume predicted from bio-ink viscosity and print parameters before printing [\[34\]](../references.md#ref-34).
    - **perturb → watch → infer**: a robot infers viscosity from video of its own induced flow with a CNN, 88% versus 32% for human estimation [\[28\]](../references.md#ref-28).

    See [Literature Scenarios](../materials/literature-scenarios.md).

## Overview

**Use a fast probe on a small sample to predict the parameters for the full batch.**

Feedforward prediction combines speed and accuracy: take a quick measurement on a tiny sample, use a pre-trained model to predict the optimal parameters, then execute the main task at high speed without further iteration.

---

## When to Use

- **Speed is critical** (fast throughput required)
- **Accuracy is high** (±1–2% target)
- **Value is high** (expensive reagents; want to minimize waste)
- **Fast characterization tool available** (rheometer, spectrophotometer, analyzer)
- **Model is well-validated** (trained on many materials; generalizes well)
- **Material varies batch-to-batch** (but predictably, based on easy-to-measure properties)

**Common applications:**
- Pharmaceutical formulation (dose 10 mg of API quickly and accurately)
- High-value chemical synthesis (use 1 mL to predict parameters for 100 mL)
- Cosmetic/food manufacturing (characterize ingredients, predict mixing times)
- Bioprocessing (measure cell culture viscosity in a 2 mL sample, predict fermentation parameters)

---

## How It Works

### Step 1: Probe the Sample

Take a small, representative sample (~1–10 mL for liquids/semi-solids; ~1–10 g for powders).

**Measurements (30 seconds – 5 minutes per sample):**

- **Rheometer:** Measure viscosity, yield stress, shear-thinning index
- **Particle analyzer:** Measure size distribution, density
- **Spectroscopy:** Measure concentration, purity
- **Moisture analyzer:** Measure water content
- **Flowability meter:** Measure Hausner ratio, angle of repose

### Step 2: Apply a Predictive Model

Use the sample measurements as inputs to a model that predicts the main-task parameters:

$$
\text{parameters} = f(\text{sample\_measurements})
$$

**Model types:**

- **Linear regression:** `flow_time = 0.5 + 0.1 × viscosity`
- **Polynomial:** `pressure = 100 + 2 × τ_y + 0.05 × τ_y^2`
- **Machine learning:** Random forest, neural network trained on 20–50 past materials
- **Physics-based:** Navier-Stokes solver for particle-size-dependent powder flow

### Step 3: Execute at Predicted Parameters

Program the robot/pump with the predicted parameters and execute the main task (dispense, extrude, fill, handle) **in one pass, no feedback loops**.

**Duration:** 5–60 seconds (material-dependent)

### Step 4: (Optional) Verify & Update

After main execution, measure the outcome:
- If within tolerance: store as validation data
- If outside tolerance: retrain model or escalate to real-time correction

---

## Advantages

| Aspect | Benefit |
| --- | --- |
| **Speed** | Probing takes 1–5 min, but main task is one pass (~30 sec). Fast for batches. |
| **Accuracy** | Combines measurement (±1%) with predictive model → ±1–2% overall |
| **Robustness** | Model learned from diverse materials; generalizes to new ones |
| **Minimal waste** | Small probe sample (1–10 mL) vs. iterative trials (50+ mL) |
| **Value preservation** | Best for expensive reagents or fragile cell cultures |

---

## Limitations

| Challenge | Issue |
| --- | --- |
| **Model dependence** | If model is wrong or trained on different domain, predictions fail |
| **Probe representativeness** | Tiny sample may not represent batch (stratification, settling) |
| **Equipment cost** | Rheometer, analyzer, etc. are expensive (€10k–€100k) |
| **Validation overhead** | Model must be trained and validated on many materials upfront |
| **Generalization gap** | Model trained on water-based liquids may fail on organic solvents |

---

## Real-World Examples

### Example 1: Viscosity-Dependent Liquid Dispensing

**Task:** Dispense 10 mL of various solvent mixtures to a reaction vessel, 50 times per day

**Probe Protocol (2 minutes):**
1. Withdraw 2 mL of the reaction mixture
2. Insert into Anton Paar MCR 302 rheometer
3. Measure viscosity at 25°C, shear rate 100 s⁻¹
4. Read result: η = 3.2 cP

**Model:**

```
Trained on 30 different solvent mixtures
Linear fit: aspirate_time (s) = 0.05 + 0.012 × viscosity (cP)
Predicted aspirate_time = 0.05 + 0.012 × 3.2 = 0.088 s ✓
```

**Execution:**

```
Set syringe pump: aspirate 10 mL at 0.088 s air-gap time
Dispense → bottle is filled
Time: 30 seconds, accuracy ±1.5%, waste: 2 mL (probe only)
```

**Daily workflow:**
- 9:00 AM: probe viscosity (2 min) + dispense 50 batches (25 min) = 27 min total
- Alternative (iterative optimization): 30 min probe + calibration + 50 batches = 90 min
- **Time saved: 63 minutes per day**

---

### Example 2: Powder Flowability-Dependent Dosing

**Task:** Dispense 5.0 g of pharmaceutical powders from 10 different suppliers, each uniquely

**Probe Protocol (3 minutes per powder):**
1. Measure 10 g of powder
2. Use powder rheometer (FT4 Freeman Technology) to measure:
- Basic Flowability Energy (BFE)
- Stability Index (SI)
- Hausner Ratio
3. Results: BFE = 250 mJ, SI = 120 mJ, HR = 1.18

**Model (trained on 20 pharmaceutical powders):**

```
Decision tree / random forest:
IF BFE < 300 and HR < 1.15:
  → Use auger speed 35 rpm, high confidence ✓
ELSE IF BFE 300–500 and HR 1.15–1.25:
  → Use auger speed 28 rpm with real-time weight feedback
ELSE IF BFE > 500 or HR > 1.3:
  → Use fluidized-bed feeder, model unreliable; fall back to iterative optimization
```

**Prediction:** Supplier A powder → use auger at 35 rpm

**Execution:** Dispense 5.0 g → actual weight 4.98 g ✓

**Time savings:**
- Probe: 3 min per powder type (once)
- Per-batch dispensing: 30 seconds (one-pass)
- Alternative (iterative): 15–20 min per batch
- For 100 batches: 1 probe (3 min) + 50 min total vs. 25 hours total

---

### Example 3: Machine Learning Model for Extrusion

**Task:** 3D print with various bio-inks (cells + matrix), each with different viscosity and yield stress

**Probe Protocol (4 minutes):**
1. Rheometer sweep on 0.1 mL sample:
- Viscosity at γ̇ = 1 s⁻¹: η₁ = 2.5 Pa·s
- Viscosity at γ̇ = 100 s⁻¹: η₁₀₀ = 0.8 Pa·s
- Yield stress (oscillation): τ_y = 15 Pa
- Temperature drift (repeat at 30 min): Δη = 0.1 Pa·s

1. Feature vector: `[2.5, 0.8, 15, 0.1]`

**Neural Network Model:**

```
Input: [η₁, η₁₀₀, τ_y, ΔT]
Hidden layers: [64, 32, 16]
Output: [extrusion_pressure_kPa, print_speed_mm/s, nozzle_temp_°C]

Trained on 50 bio-inks with known optimal parameters
Validation accuracy: ±2.5% on test set of 5 held-out inks
```

**Prediction:**

```
Input: [2.5, 0.8, 15, 0.1]
Output: [250 kPa, 5 mm/s, 37 °C]
```

**Execution:** 3D print 10 mL scaffold at 250 kPa, 5 mm/s → completes in 20 minutes, cell viability ±2% vs. manual optimization

**Time savings:** 4 min probe + 20 min print vs. 90 min manual tuning + print

---

## Model Training Workflow

### Offline (One-Time)

1. **Collect training data** (weeks of lab work):
2. Test 20–50 representative materials
3. For each, measure properties (viscosity, size, etc.)
4. Measure optimal handling parameters (via iterative optimization)
5. Record failures and edge cases
6. **Build dataset:**
   

```
Material | Viscosity | Yield Stress | Optimal Speed | Optimal Pressure
---------|-----------|--------------|---------------|------------------
A        | 1.2 cP    | 0 Pa         | 8 mm/s        | N/A
B        | 50 cP     | 10 Pa        | 4 mm/s        | N/A
C        | 500 cP    | 50 Pa        | 2 mm/s        | 150 kPa
...      | ...       | ...          | ...           | ...
```

7. **Train model:**
8. Linear regression (if clear trends): `speed = f(viscosity, τ_y)`
9. Neural network (if complex): train on 80%, validate on 20%
10. Random forest (if non-linear): good generalization
11. **Validate on held-out materials:**
12. Test model on 3–5 materials not in training set
13. Verify accuracy is within specification (e.g., ±3%)

### Online (Per-Use)

1. Probe sample (2–5 min)
2. Predict parameters using trained model (< 1 sec)
3. Execute (30 sec – 10 min)
4. (Optional) Log outcome for future model retraining

---

## Model Maintenance

- **Seasonal retraining:** Every 3 months, retrain on new data collected since last training
- **Domain shift detection:** If new materials are outside training domain, trigger human review
- **Degradation monitoring:** Track prediction errors over time; if trend is upward, retrain

---

## Implementation Checklist

- [ ] Identify which material property to measure (viscosity, particle size, flow energy, etc.)
- [ ] Select a probe device (rheometer, analyzer, scale)
- [ ] Collect training data: 20–50 materials, properties + optimal parameters
- [ ] Split data: 80% training, 20% validation
- [ ] Train model (linear, polynomial, tree-based, or neural network)
- [ ] Validate on held-out test set
- [ ] Implement prediction model in robot control software
- [ ] Test on 5–10 production materials
- [ ] Document model inputs, outputs, and expected accuracy range
- [ ] Set up retraining schedule (quarterly or as-needed)
- [ ] Create fallback logic (if prediction confidence is low, use real-time correction instead)

---

## Comparison with Other Strategies

| Strategy | Probe Time | Main Task Time | Total Time | Accuracy | Model Requirement |
| --- | --- | --- | --- | --- | --- |
| Characterize, then act | 2–5 min | 30 sec | 2.5 min | ±5% | First-principles |
| Iterative optimization | — | 15–30 min | 15–30 min | ±1% | Trial-and-error |
| Real-time correction | — | 5–30 sec | 5–30 sec | ±2% | Sensor + control |
| **Feedforward prediction** | 2–5 min | 30 sec – 10 min | 2.5–15 min | ±2% | ML model |
| Simulation generalization | — | 30 sec | 30 sec | ±5% | Simulator + ML |

---

## References

- Rastegardoost, M. M.; Bao, Z.; Sadr, S.; Abdollahi, N.; Darvish, K.; Clasky, A.; Ohsaka, H.; Le Devedec, F. *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents.* Manuscript in preparation, 2026.
- Key references from the review: [\[28\]](../references.md#ref-28), [\[34\]](../references.md#ref-34). Full list on the [References](../references.md) page.

### Further reading (from the earlier wiki)

- Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer.
- Hastie, T., Tibshirani, R., & Friedman, J. (2009). *The Elements of Statistical Learning* (2nd ed.). Springer.
- Anton Paar. *Application Report: Rheology in Liquid Dispensing*. (Free online resource)
