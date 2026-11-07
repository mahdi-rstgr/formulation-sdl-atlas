# Digital Twins & LLMs for Material Handling

!!! info "Updated to manuscript V3"

    This page is the earlier wiki's hands-on view. The review's account is on [Simulation & Digital Twins](../simulation/index.md) (four-level fidelity hierarchy, ROS 2/MoveIt 2, Isaac Sim, Chemistry3D [\[110\]](../references.md#ref-110), MATTERIX [\[111\]](../references.md#ref-111), and the twin as a verification gate) and [LLMs & AI Agents](agents.md) (agent roles, autonomy levels, MCP tool exposure [\[171\]](../references.md#ref-171), safety by construction). Where the two differ, the V3 pages take precedence.

## Overview

**Digital twins** are high-fidelity simulations of physical systems used for training, validation, and debugging.

**Large language models (LLMs)** are AI agents that can reason about complex tasks, select strategies, and adapt plans.

Together, they enable autonomous systems to learn and reason in a symbiotic way: simulation provides safe training data; LLM provides high-level reasoning.

---

## Digital Twins

### Definition

A digital twin is a virtual replica of a physical system that responds to inputs in a way that mimics real-world behavior.

**In material handling:**
- Input: equipment parameters (pump speed, pressure, grip force)
- Physics: material properties + equipment mechanics
- Output: outcome (mass dispensed, force applied, grasp success)

### Purposes

1. **Offline training** — Train ML models on 10,000 simulated materials without touching real hardware
2. **Debugging** — Reproduce failures in a controlled, repeatable environment
3. **Design exploration** — Test new hardware designs before machining
4. **Risk-free learning** — Trial-and-error with virtual materials (no waste)

---

## Simulator Technologies

### Discrete Element Method (DEM) for Powders

Simulates individual particles, their interactions (friction, collision, cohesion).

**Physics:**

```
For each particle:
  F = gravity + friction_with_walls + friction_with_neighbors + van_der_Waals
  x, v = integrate(F) using Euler or Verlet
```

**Tools:**
- LIGGGHTS (open-source, integrated with ParaView visualization)
- EDEM (commercial, Altair)
- Bullet Physics (robotics-friendly)

**Effort to build:** 2–4 weeks (if you know DEM); integrating with your control software adds another 2–4 weeks

**Validation:** Compare simulated vs. real powder flow rate; accuracy ±5–10% with good tuning

**Example:**

```
# Pseudocode: simulate auger feeder
particles = initialize_particles(N=10000, size_range=[10, 100], density=1.5)

for timestep in range(100_000):  # ~10 seconds of simulation
    for p in particles:
        # Gravity
        f = p.mass * [0, -9.81]

        # Friction with walls
        if p.touching_hopper_wall:
            f += friction_coeff * normal_force

        # Van der Waals (cohesion)
        for neighbor in p.nearby_particles:
            f += adhesion_energy / distance^2

        # Update position
        p.acceleration = f / p.mass
        p.velocity += p.acceleration * dt
        p.position += p.velocity * dt

    # Rotate auger
    auger.rotate(speed_rpm * dt)
    particles_in_auger.set_velocity(auger.velocity)

    # Count particles exiting
    exiting_particles = [p for p in particles if p.z < exit_height]
    mass_flow = len(exiting_particles) * p.mass
```

### Finite Element Method (FEM) for Liquids & Semi-Solids

Solves Navier-Stokes equations on a mesh to compute velocity, pressure, stress.

**Tools:**
- COMSOL Multiphysics (commercial, user-friendly)
- OpenFOAM (open-source, powerful, steep learning curve)
- Ansys Fluent (commercial, industry standard)

**Effort:** 4–12 weeks (depending on geometry complexity and desired accuracy)

**Example setup:**

```
Domain: 3D syringe barrel + nozzle
Boundary conditions:
  - Inlet: plunger moving at velocity V
  - Outlet: free surface (dynamic)
  - Walls: no-slip
Material model: Herschel-Bulkley (yield-stress + shear-thinning)
  η(γ̇) = τ_y / γ̇ + k * γ̇^(n-1)
Solver: Finite Volume Method, transient, 10,000 mesh elements
Output: velocity field, pressure drop, flow rate Q(t)
```

### Rigid Body Dynamics for Solid Handling

Simulates motion, contact, and forces for solid objects and grippers.

**Tools:**
- PyBullet (Python-friendly, real-time)
- Isaac Sim (NVIDIA, vision-integrated, photorealistic)
- Gazebo (ROS ecosystem, open-source)
- Mujoco (DeepMind, differentiable physics)

**Effort:** 1–2 weeks for basic simulation; weeks–months for accurate friction/contact models

**Example:**

```
import pybullet as p
import pybullet_data

client = p.connect(p.GUI)
p.setAdditionalSearchPath(pybullet_data.getDataPath())
p.loadURDF("plane.urdf")

# Create tablet and gripper
tablet = p.loadURDF("tablet.urdf", [0, 0, 0.1])
gripper = p.loadRobot("gripper.urdf", [0, 0, 0.2])

# Simulate
for t in range(1000):
    # Close gripper
    p.setJointMotorControl2(gripper, finger_joint, 
                           p.POSITION_CONTROL, 
                           targetPosition=0.02 + 0.03 * (t / 100))

    # Measure contact force
    contacts = p.getContactPoints(gripper, tablet)
    if contacts:
        force = sum([c[9] for c in contacts])
        print(f"Grip force: {force:.2f} N")

    p.stepSimulation()
    time.sleep(0.01)
```

---

## Training ML Models in Simulation

### Step 1: Parametrize Material Space

Define input features that vary across the population:

```
Powder: [particle_size, density, moisture, friction, cohesion]
Liquid: [viscosity, yield_stress, surface_tension, temperature]
Solid: [shape, mass, surface_friction, elasticity]
```

### Step 2: Generate Synthetic Data

```
N_materials = 1000
materials = []
for i in range(N_materials):
    material = {
        'size': np.random.uniform(10, 500),  # µm
        'density': np.random.uniform(0.8, 2.5),  # g/cm³
        'moisture': np.random.normal(0.03, 0.01),  # %
        'friction': np.random.uniform(0.2, 0.8),
        'cohesion': np.random.exponential(50)  # Pa
    }

    # Run simulator
    result = simulate_auger(material, speed=30_rpm)
    optimal_speed = find_optimal_speed(material, target_mass=5.0)

    materials.append({
        'features': [size, density, moisture, friction, cohesion],
        'target': optimal_speed
    })

# Train ML model on these 1000 examples
X = [m['features'] for m in materials]
y = [m['target'] for m in materials]

model = RandomForestRegressor()
model.fit(X, y)
```

### Step 3: Validation on Real Materials

```
# Test on 5–10 real powders
real_powders = [real_api_1, real_api_2, ..., real_api_5]

for powder in real_powders:
    # Measure properties
    props = measure_properties(powder)

    # Predict
    pred_speed = model.predict([props])

    # Execute
    actual_result = dispense_on_hardware(speed=pred_speed)

    # Compare
    error = abs(actual_result - 5.0)
    print(f"Powder: {error:.2f}g error")
```

If errors are consistently < 2%, simulator is validated ✓

---

## LLM Agents for Material Handling

### Overview

Large language models (GPT-4, Claude) can reason about high-level tasks, select strategies, and adapt plans.

**Use cases:**
1. **Task decomposition:** "Dispense 10 different APIs" → break into sub-tasks
2. **Strategy selection:** Given material properties, suggest appropriate control strategy
3. **Adaptation:** "Powder is cohesive; Strategy 2 (iterate) is failing → switch to Strategy 3 (real-time correction)"
4. **Explanation:** Justify why a particular dispense failed

### Agent Architecture

```
User Goal
  ↓
LLM Agent (GPT-4 / Claude)
  ├─ Task decomposition
  ├─ Consult knowledge base (strategies, hardware specs)
  ├─ Reason about material properties
  ├─ Select best strategy
  ├─ Plan execution steps
  └─ Output: [step 1, step 2, step 3, ...]
    ↓
Execution Layer (ROS, robots, pumps)
  ├─ Execute each step
  ├─ Measure outcomes
  └─ Report back to agent
    ↓
LLM (continued)
  ├─ Assess results
  ├─ If success: done
  ├─ If failure: reason about why, adapt plan
  ├─ Switch strategies if needed
  └─ Retry or escalate
```

### Example 1: Dispensing a Novel Powder

```
User: "I have a new pharmaceutical powder. Dispense 1.0 g accurately."

LLM Agent reasoning:
  1. Task: dispense novel powder
  2. Unknown properties → need characterization first
  3. Available strategies:
     - Strategy 1 (Characterize): measure powder, predict speed
     - Strategy 2 (Iterate): dispense, measure, adjust
     - Strategy 5 (Simulate): use ML model trained on 100 powders
  4. Recommend: 
     - Try Strategy 1 first (fast, if model is available)
     - Fall back to Strategy 2 if accuracy insufficient
     - Use Strategy 3 (real-time correction) if powder is cohesive

Agent output plan:
  Step 1: Measure powder properties (PSD, Hausner ratio, moisture)
  Step 2: Apply trained ML model → predict speed = 35 rpm
  Step 3: Set auger to 35 rpm, dispense, measure
  Step 4: If ±1%, done. Else, switch to iterative feedback control
  Step 5: Log results for model retraining
```

### Example 2: Handling Unexpected Failure

```
LLM observes:
  - Material: API powder
  - Strategy 2 (Iterate) was used
  - After 5 optimization cycles, still ±3% (target ±1%)
  - Pattern: each cycle, mass overshoots then undershoots → system oscillating

LLM reasoning:
  - Iterative optimization hit its limit → material is too cohesive
  - Real-time correction (Strategy 3) may help (faster loop, detect mid-process)
  - Or: Physical reinvention (Strategy 6) needed (switch to vacuum feeder)

LLM decision:
  - Try real-time correction first (10 min, low cost)
  - If still fails: escalate to human (recommend vacuum feeder)

Plan:
  Step 1: Switch control strategy to real-time correction
  Step 2: Set PID gains conservatively
  Step 3: Dispense with live weight feedback
  Step 4: If success, done. Else: inform user, recommend new hardware.
```

### Implementing LLM Agents

```
from openai import OpenAI
import json

client = OpenAI(api_key="sk-...")

def dispense_with_llm_guidance(powder_properties, target_mass=1.0):
    # Step 1: Ask LLM to recommend strategy
    prompt = f"""
    I need to dispense pharmaceutical powder.

    Properties measured:
    - Particle size: {powder_properties['size']} µm
    - Density: {powder_properties['density']} g/cm³
    - Moisture: {powder_properties['moisture']}%
    - Hausner ratio: {powder_properties['hausner']}

    Available strategies:
    1. Characterize: measure then act (5 min, ±5% accuracy)
    2. Iterative: dispense-measure-adjust (15 min, ±1% accuracy)
    3. Real-time: live feedback control (5 min, ±2% accuracy)
    4. Simulation: ML model (1 min, ±3% accuracy)

    Recommend the best strategy and explain why.
    """

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5
    )

    recommendation = response.choices[0].message.content
    print(f"LLM recommends:\n{recommendation}")

    # Step 2: Execute recommended strategy
    if "Characterize" in recommendation:
        strategy = "characterize"
    elif "Iterative" in recommendation:
        strategy = "iterate"
    elif "Real-time" in recommendation:
        strategy = "real-time"
    else:
        strategy = "simulate"

    result = execute_strategy(strategy, target_mass)

    # Step 3: Report result back to LLM
    if result['accuracy'] > 0.05:  # > ±5% error
        followup = f"""
        Dispensing with strategy '{strategy}' achieved {result['accuracy']:.2%} error.
        This is insufficient. What should I do next?
        - Retry with same strategy?
        - Switch to a different strategy?
        - Modify hardware?
        - Consult human expert?
        """

        followup_response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": followup}],
            temperature=0.5
        )

        next_action = followup_response.choices[0].message.content
        print(f"LLM suggests:\n{next_action}")
    else:
        print(f"Success! Accuracy {result['accuracy']:.2%}")

    return result
```

---

## Digital Twin + LLM Synergy

**Scenario:** New formulation, no historical data, high accuracy required

```
Step 1: LLM decides to use simulation-based generalization
         ├─ Train ML model on 500 simulated materials
         ├─ No real-world waste
         └─ Generate training data overnight

Step 2: Validate on real materials
         ├─ LLM selects 3 representative real materials
         ├─ Dispense with predicted parameters
         └─ Compare simulation vs. reality

Step 3: Adapt model
         ├─ LLM detects systematic bias (simulator predicts high)
         ├─ Requests recalibration of simulator's friction model
         ├─ Retrain on new simulated data
         └─ Validate again

Step 4: Deploy
         ├─ LLM confident in model ✓
         ├─ Dispense 1000 batches with ML model
         └─ Monitor accuracy over time
```

**Benefits:**
- No human guesswork; reasoning is explicit
- Leverages simulation for safe training
- Adapts when real world differs from simulation
- Can explain its decisions

---

## Practical Implementation

### Minimal Viable Setup

```
# 1. ROS-based control system (existing)
# 2. LLM API access (OpenAI, Anthropic)
# 3. Simple strategy dispatcher

strategies = {
    'characterize': CharacterizeStrategy(),
    'iterate': IterativeStrategy(),
    'real-time': RealTimeStrategy(),
    'simulate': SimulationStrategy()
}

def autonomous_dispense(material_properties, target):
    # Consult LLM
    recommended_strategy = query_llm(material_properties)

    # Execute
    strategy_obj = strategies[recommended_strategy]
    result = strategy_obj.execute(material_properties, target)

    # Feedback to LLM
    if result.error > tolerance:
        new_strategy = query_llm(result, material_properties)
        result = strategies[new_strategy].execute(material_properties, target)

    return result
```

---

## References

- Rastegardoost, M. M.; Bao, Z.; Sadr, S.; Abdollahi, N.; Darvish, K.; Clasky, A.; Ohsaka, H.; Le Devedec, F. *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents.* Manuscript in preparation, 2026.
- Key references from the review: [\[89\]](../references.md#ref-89), [\[90\]](../references.md#ref-90), [\[107\]](../references.md#ref-107), [\[110\]](../references.md#ref-110), [\[111\]](../references.md#ref-111), [\[125\]](../references.md#ref-125), [\[127\]](../references.md#ref-127), [\[129\]](../references.md#ref-129), [\[130\]](../references.md#ref-130), [\[171\]](../references.md#ref-171), [\[174\]](../references.md#ref-174). Full list on the [References](../references.md) page.

### Further reading (from the earlier wiki)

- OpenAI GPT-4 API: https://platform.openai.com/docs/
- Anthropic Claude API: https://docs.anthropic.com/
- PyBullet documentation: https://pybullet.org/
- LIGGGHTS documentation: https://www.cfdem.com/
