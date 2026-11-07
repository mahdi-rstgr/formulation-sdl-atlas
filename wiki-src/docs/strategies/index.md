# Recurring Strategies in Material Handling

!!! info "Updated to manuscript V3"

    The seven strategies below are this wiki's way of grouping the review's **20 literature scenarios** (Fig. 3), each titled by its sense–act sequence. See [Literature Scenarios](../materials/literature-scenarios.md#mapping-scenarios-to-the-recurring-strategies) for which study illustrates which strategy, and the [seven-step map](../steps.md) for how dosing fits into the whole formulation SDL.

## Navigating the Strategies

These questions highlight factors that are relevant when evaluating which strategies may apply to your situation. Multiple strategies often coexist in a single workflow.

??? question "Do you know your material's properties before the handling step?"

    - **Yes** — [Characterize, Then Act](characterize-act.md) and [Feedforward Prediction](feedforward-prediction.md) use upfront knowledge to set parameters before acting.
    - **No / Variable** — [Iterative Optimization](iterative-optimization.md) and [Real-Time Correction](real-time-correction.md) build in measurement during or between attempts.

??? question "Can you measure the outcome mid-process (not just at the end)?"

    - **Yes** — [Real-Time Correction](real-time-correction.md) uses in-process sensing to adjust on-the-fly.
    - **Only between attempts** — [Iterative Optimization](iterative-optimization.md) adjusts parameters across repeated trials.
    - **Only after the fact** — [Characterize, Then Act](characterize-act.md) or [Feedforward Prediction](feedforward-prediction.md) may be more appropriate.

??? question "Do you have prior data or models for similar materials?"

    - **Yes** — [Feedforward Prediction](feedforward-prediction.md) and [Simulation-Based Generalization](simulation-generalization.md) can transfer that knowledge to new materials.
    - **No** — [Characterize, Then Act](characterize-act.md) or [Iterative Optimization](iterative-optimization.md) build understanding from scratch.

??? question "Is the material a discrete solid (tablets, pellets, shaped objects)?"

    - **Yes** — [Tactile Retrieval](tactile-retrieval.md) addresses object manipulation where vision alone is insufficient.
    - **No** — The remaining strategies apply primarily to flowable or semi-flowable materials.

??? question "Does your material resist handling with standard equipment?"

    - **Yes** — [Physical Reinvention](physical-reinvention.md) addresses cases where hardware redesign is more effective than software tuning.
    - **No** — Software-based strategies (sensing, optimization, prediction) are typically explored first.

---

## Strategy Comparison

| Strategy | Suited for | Key enabler | Notable trade-off |
| --- | --- | --- | --- |
| [Characterize, Then Act](characterize-act.md) | Any material, first-time or batch-variable | Offline measurement capability | Accuracy depends on model quality |
| [Iterative Optimization](iterative-optimization.md) | High-variability materials, strict accuracy | Repeatable measurement between trials | Requires multiple dispense cycles |
| [Real-Time Correction](real-time-correction.md) | Unpredictable or fast-drifting materials | In-situ sensor + fast control loop | Higher hardware and tuning complexity |
| [Feedforward Prediction](feedforward-prediction.md) | Time-critical or high-value dosing | Pre-trained model + small sample | Depends on training data quality |
| [Simulation-Based Generalization](simulation-generalization.md) | Many untrained material types | Simulator or large training dataset | Sim-to-real gap must be managed |
| [Physical Reinvention](physical-reinvention.md) | Materials that resist standard handling | Engineering capacity to redesign | Slower iteration; higher upfront cost |
| [Tactile Retrieval](tactile-retrieval.md) | Solids in occluded or cluttered scenes | Force/torque sensors on end-effector | Slower than vision; narrow applicability |

---

## The Seven Strategies

Across all materials—liquids, gels, powders, and solids—**seven core strategies** emerge for automated handling and dosing. These strategies often combine, but each represents a distinct control philosophy:

---

## Strategy 1: Characterize, Then Act

**Core idea:** Measure material properties upfront, then compute the optimal parameters.

**When to use:** First time working with a material, or material varies between batches.

**Implementation:**
- Measure viscosity (or flowability, or particle size)
- Estimate transfer function based on past data or first-principles models
- Compute pump speed, pressure, or gripper force
- Execute without further sensing

**Example:** Measure solution viscosity, then set pipette speed accordingly before dispensing.

**Materials:** Liquids, moderately viscous semi-solids

**Pros:** Fast, requires minimal sensors during the main task

**Cons:** Assumes model accuracy; sensitive to unmeasured variations (temperature, air bubbles)

---

## Strategy 2: Iterative Optimization

**Core idea:** Dispense, measure the outcome, adjust parameters, repeat.

**When to use:** Material variability is high, or accuracy requirements are strict.

**Implementation:**
- Dispense a volume at nominal settings
- Weigh the result (gravimetric feedback)
- Compare to target
- Adjust pump speed or duration
- Repeat until on target

**Example:** Dispense → weigh → learn linear calibration model → dispense final dose.

**Materials:** Powders (gravimetric feedback), semi-solids (pressure feedback)

**Pros:** Model-free; automatically corrects for drift, temperature, wear

**Cons:** Slower (requires multiple dispense-measure cycles); cumulative error if each cycle is imperfect

---

## Strategy 3: Real-Time Correction

**Core idea:** Sense the process mid-execution and adjust on-the-fly.

**When to use:** Material is unpredictable, or errors compound quickly.

**Implementation:**
- Start dispensing at nominal speed
- Continuously monitor fill height, weight, or pressure
- If trajectory diverges from target, adjust pump speed or force in real time
- Stop when target is reached

**Example:** Press with robot gripper, feel force in real time, adjust compression depth.

**Materials:** Yield-stress semi-solids, cohesive powders, soft solids requiring gentle handling

**Pros:** Responds to surprises mid-action; compensates for drift or unexpected material properties

**Cons:** Requires fast sensors and control loops; harder to tune

---

## Strategy 4: Feedforward Prediction

**Core idea:** Use a fast sensor on a sub-sample to predict the result for the full batch.

**When to use:** Expensive dosing, or time is critical.

**Implementation:**
- Draw a tiny sample
- Characterize it rapidly (e.g., viscosity, flowability index)
- Use a pre-trained model to predict parameters
- Dispense the full dose at those parameters without further feedback

**Example:** Rheometer measures viscosity of 1 mL of solution in 30 seconds; model predicts optimal air-gap for 100 mL dose.

**Materials:** High-value liquids, expensive powders, time-critical synthesis

**Pros:** Combines speed (no repeated cycles) with accuracy (data-driven)

**Cons:** Depends on model quality and sample representativeness

---

## Strategy 5: Simulation-Based Generalization

**Core idea:** Train a model in simulation, then apply it to unseen materials in the real world.

**When to use:** Many untrained materials, or physics is too complex for first-principles models.

**Implementation:**
- Collect data on N representative materials (or in simulation)
- Train a machine learning model (neural network, Gaussian process) to map material properties → optimal parameters
- Apply trained model to new materials with minimal characterization
- Deploy on robot without re-tuning per material

**Example:** Train deep neural network on 50 powder types in simulation; use it to dose any powder, even powders unseen during training.

**Materials:** Powders (most common), semi-solids, materials with complex non-Newtonian behavior

**Pros:** Generalizes across material variations; minimizes online tuning; scales to many materials

**Cons:** Requires simulator or large training dataset; harder to debug if real world differs from training domain

---

## Strategy 6: Physical Reinvention

**Core idea:** If the material is too difficult to handle with standard equipment, change the equipment.

**When to use:** Existing strategy cannot achieve accuracy or speed requirements.

**Implementation:**
- Analyze failure modes (bridging, stringing, vibration fatigue)
- Redesign hardware (change screw pitch, valve geometry, gripper compliance, etc.)
- Re-test

**Example:** Standard screw auger fails due to powder cohesion → switch to fluidized-bed dosing.

**Materials:** Problematic powders, sticky semi-solids, fragile solids

**Pros:** Can solve problems that no software tuning can fix

**Cons:** Expensive; slow (requires prototyping and validation); may sacrifice accuracy elsewhere

---

## Strategy 7: Tactile Retrieval

**Core idea:** Use touch feedback to locate, lift, or retrieve objects.

**When to use:** Object detection is hard (occluded, transparent, similar-colored), or robot must work in dynamic environments.

**Implementation:**
- Lower probe (finger, gripper) until contact
- Measure contact force and position
- Use touch signature to identify object
- Execute grasp or retrieval based on feel
- Lift, rotate, or position based on tactile feedback

**Example:** Robot hand feels shape of tablet in a pile, confirms it's the right tablet, then picks it up.

**Materials:** Solids (tablets, pellets, irregularly shaped items), soft objects (tissue, foam)

**Pros:** Robust to visual occlusion; detects object properties (hardness, shape, size)

**Cons:** Slow (touch is slower than vision); requires sensitive force/torque sensors; not applicable to powder/liquid

---

## Table: Strategy Selection by Material and Constraint

| Material | Real-Time Correction | Iterative Optimization | Feedforward | Simulation | Characterize | Physical Reinvention | Tactile Retrieval |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Low-viscosity liquid | ✓ | — | ✓ | — | ✓ | — | — |
| High-viscosity liquid | ✓✓ | ✓ | ✓ | — | ✓ | ✓ | — |
| Yield-stress gel | ✓✓ | ✓✓ | ✓ | ✓ | ✓ | ✓ | — |
| Free-flowing powder | ✓ | ✓✓ | — | ✓✓ | — | ✓ | — |
| Cohesive powder | ✓✓ | ✓✓ | — | ✓✓ | — | ✓ | ✓ |
| Tablet/pellet | — | — | — | — | — | ✓ | ✓✓ |

**Legend:** ✓✓ = highly recommended, ✓ = applicable, — = rarely used

---

## Integration: Multi-Strategy Workflows

Most real autonomous labs employ a **hybrid workflow**:

1. **Startup:** Characterize the material (Strategy 1)
2. **Training:** Run 3–5 iterations, optimize parameters (Strategy 2)
3. **Deployment:** Use feedforward model to predict parameters for new batches (Strategy 4)
4. **Robustness:** If variability appears, switch to real-time correction (Strategy 3)
5. **Scale-up:** If accuracy plateaus, simulate generalization across material space (Strategy 5)
6. **Troubleshoot:** If all strategies fail, redesign hardware (Strategy 6)

---

## Further Reading

Each strategy is explored in depth in a dedicated page. Scroll the navigation to learn more.

- [Characterize, Then Act](characterize-act.md)
- [Iterative Optimization](iterative-optimization.md)
- [Real-Time Correction](real-time-correction.md)
- [Feedforward Prediction](feedforward-prediction.md)
- [Simulation-Based Generalization](simulation-generalization.md)
- [Physical Reinvention](physical-reinvention.md)
- [Tactile Retrieval](tactile-retrieval.md)
