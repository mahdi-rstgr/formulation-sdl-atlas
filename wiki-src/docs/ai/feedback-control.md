# Feedback Control

!!! info "Updated to manuscript V3"

    In the review, closed-loop correction appears in gravimetric Bayesian-optimized pipetting [\[11\]](../references.md#ref-11), vision-corrected extrusion bioprinting (~10 s response) [\[33\]](../references.md#ref-33) and vision-guided powder scooping [\[12\]](../references.md#ref-12). The review distinguishes **process data**, which control must act on within seconds, from property data learned by the planner between experiments ([Data & Decision Models](data-and-decisions.md)).

## Overview

Feedback control uses sensor measurements to adjust equipment parameters in real-time, keeping the process on target despite disturbances and uncertainties.

---

## The Control Loop

```
Desired Target
       ↓
   [Compare Error]
       ↓ error = target - measured
  [Control Algorithm]  ← compute control action
       ↓
  [Actuate Equipment]  ← adjust pump speed, force, etc.
       ↓
  [Measure State]  ← load cell, F/T sensor, camera
       ↓
   [Feedback] ──→ back to Compare Error
```

**Loop rate:** Typically 100 Hz – 1 kHz (update every 10 ms – 1 ms)

---

## PID Control (Most Common)

Proportional-Integral-Derivative control is the industry standard.

### Mathematical Form

$$
u(t) = K_p e(t) + K_i \int_0^t e(\tau) d\tau + K_d \frac{de}{dt}
$$

Where:
- \(u(t)\) = control signal (pump speed, force, pressure)
- \(e(t)\) = error = target − measured
- \(K_p\) = proportional gain
- \(K_i\) = integral gain
- \(K_d\) = derivative gain

### What Each Term Does

#### Proportional (P)

\(u = K_p \cdot e\)

- Responds immediately to error
- If error is 10% too high, increase speed by \(K_p \times 10\%\)
- Fast, but can overshoot
- Too high → oscillation; too low → slow response

#### Integral (I)

\(u_i = K_i \int e \, dt\)

- Accumulates error over time
- Corrects steady-state bias
- Example: If you're consistently 5% short, I term learns this and adds constant offset
- Too high → slow, oscillatory; too low → residual error

#### Derivative (D)

\(u_d = K_d \frac{de}{dt}\)

- Responds to rate of change
- Dampens overshoot
- Reduces oscillation when P term is aggressive
- Sensitive to sensor noise; usually needs low-pass filter

### Tuning Gains

#### Method 1: Ziegler-Nichols (Classic)

1. Set \(K_i = K_d = 0\) (P-only mode)
2. Increase \(K_p\) slowly until system oscillates steadily
3. Note the critical gain \(K_p^c\) and oscillation period \(T_u\)
4. Set final gains:

$$
K_p = 0.6 \, K_p^c
$$

$$
K_i = 1.2 \, K_p^c / T_u
$$

$$
K_d = 0.075 \, K_p^c \, T_u
$$

#### Method 2: Empirical (Trial & Error)

1. Start with conservative \(K_p = 1\)
2. Run a test, observe response (slow? oscillating?)
3. Adjust:
4. If slow: increase \(K_p\) (try 2, 5, 10)
5. If oscillating: decrease \(K_p\) or increase \(K_d\)
6. Once P is tuned, add small \(K_i\) (start at \(K_p / 10\))
7. Refine \(K_d\) to reduce overshoot

#### Method 3: Pole Placement (Advanced)

If you have a model of your system (e.g., transfer function), compute gains to place closed-loop poles at desired locations.

**Tools:** MATLAB Control System Toolbox, Python `control` library

---

## Real-Time Correction in Powder Dispensing

### Example: Auger Feeder with Weight Feedback

```
# Pseudo-code for PID loop
Kp = 5   # rpm per gram error
Ki = 1   # integral term
Kd = 0.5 # derivative dampening

target_mass = 5.0  # grams
error_integral = 0
error_prev = 0

for t in range(0, 30_seconds, dt=10ms):
    measured_mass = load_cell.read()
    error = target_mass - measured_mass

    # Compute PID
    P = Kp * error
    I = Ki * error_integral
    D = Kd * (error - error_prev) / dt

    speed = 30 + P + I + D  # 30 rpm is nominal
    speed = max(10, min(50, speed))  # Constrain to [10, 50] rpm

    auger.set_speed(speed)

    # Update state
    error_integral += error * dt
    error_prev = error

    if abs(error) < 0.05:  # Within 0.05 g tolerance
        break  # Dosing complete
```

### Typical Response

```
Time  Target  Measured  Error  Speed(rpm)  Action
---   ---     ---       ---    ---         ---
0 s   5.0g    0.0g      5.0g   40          Start, increase
2 s   5.0g    1.5g      3.5g   40          Continuing
4 s   5.0g    3.2g      1.8g   35          Slow down (error decreasing)
6 s   5.0g    4.5g      0.5g   30          Almost there
7 s   5.0g    4.95g     0.05g  28          ✓ Within tolerance
7.1 s 5.0g    5.02g    -0.02g  27          ✓ Still good, stop
```

---

## Force Control (Gripping)

For robots holding fragile objects, maintain constant grip force (not position).

### Example: Holding a Tissue Sample

```
Kp_force = 2  # Increase opening by 0.1 mm per 0.5 N excess force
target_force = 2.0  # Newtons (gentle grip)

for t in range(0, hold_duration, dt=50ms):
    measured_force = wrist_sensor.force_z()
    error_force = target_force - measured_force

    finger_position += Kp_force * error_force

    gripper.set_position(finger_position)

    if measured_force > 5.0:  # Overload!
        print("WARNING: Force exceeds 5 N, object may be damaged")
        gripper.open()  # Emergency release
```

**Outcome:** Tissue is gripped at constant 2 N, preventing bruise damage from excessive pressure.

---

## Adaptive Control

Parameters change as the system/material changes.

### Example: High-Viscosity Liquid Extrusion

```
# Model: Extrusion rate depends on applied pressure and material viscosity
# Q = (P - τ_y) / (η × L)  [Hagen-Poiseuille + yield stress]

def adaptive_pressure_control(target_flow_rate):
    # Measure viscosity every 10 seconds (rheometer on sample)
    if t % 10 == 0:
        eta = rheometer.measure_viscosity()

    # Adaptive model: compute pressure needed for target flow
    required_pressure = target_flow_rate * (eta + yield_stress / flow_constant)

    # Apply with feedback correction
    measured_flow = flowmeter.read()
    error = target_flow_rate - measured_flow

    pressure = required_pressure + Kp * error
    pump.set_pressure(pressure)
```

**Benefit:** As viscosity changes (temperature drift, solvent evaporation), control automatically adjusts pressure.

---

## Common Control Challenges

### Problem 1: Sensor Noise → Noisy Control Signal

**Symptom:** Load cell reads 4.98, 5.02, 4.99, 5.01 g; control signal oscillates wildly

**Solution:** Add low-pass filter before PID:

```
filtered_error = 0.8 * filtered_error + 0.2 * raw_error  # Exponential moving average
```

### Problem 2: Saturation (Actuator Limits)

**Symptom:** PID computes speed = 200 rpm, but pump max is 100 rpm; system clips and behaves weirdly

**Solution:** Anti-windup (constrain integrator when saturated):

```
if speed > MAX_SPEED:
    speed = MAX_SPEED
    error_integral = error_integral - Ki * error  # Unwind integrator
```

### Problem 3: Time Delay / Lag

**Symptom:** 500 ms delay between setting pump speed and seeing mass change; control oscillates

**Solution:** Predict future state (model-based control):

```
# Predict state 500 ms into future
predicted_mass = current_mass + flowrate * 0.5
error = target - predicted_mass
control = Kp * error + Ki * integral
```

---

## Cascade Control (Nested Loops)

When you have two control objectives (e.g., dispense amount AND dispense speed):

```
Outer loop: maintains total dispensed mass
  ↓
Inner loop: maintains instantaneous flow rate

Example:
  Target: dispense 10 g total at 0.5 g/s

  Outer: If we've dispensed 8 g and need 2 more, maintain speed = 0.5 g/s
  Inner: If current speed is 0.4 g/s, increase pump pressure to reach 0.5 g/s
```

---

## State Machine Control (Discrete Logic)

For processes with distinct phases, use state machines rather than continuous PID:

```
State 0: Startup
  └─ Set pump to nominal speed
  └─ Wait for flow to stabilize (2 seconds)
  └─ Transition to State 1

State 1: Controlled Dosing
  └─ PID loop maintains weight
  └─ If error < 0.1%, go to State 2

State 2: Stopping
  └─ Ramp down speed to zero (no jerk)
  └─ Wait 1 second for settling
  └─ Done
```

---

## Simulation & Validation

Before deploying control on real hardware:

1. **Simulate** your system's response (use model, or just guess)
2. **Tune** gains in simulation
3. **Test** on real hardware with conservative gains
4. **Observe** real response, compare to simulation
5. **Refine** gains if needed

```
# Simulation
class PowderFeeder:
    def __init__(self):
        self.mass = 0

    def step(self, speed_rpm, dt):
        flow_rate = 0.1 * speed_rpm  # Simplified: 0.1 g/sec per rpm
        self.mass += flow_rate * dt

# Test control tuning offline
feeder = PowderFeeder()
for t in range(100):
    error = 5.0 - feeder.mass
    speed = 30 + 5 * error  # Kp = 5
    feeder.step(speed, dt=0.1)
    print(f"t={t} mass={feeder.mass:.2f} speed={speed:.0f}")
```

---

## Implementation Checklist

- [ ] Define control objective (what are you controlling? weight? force? position?)
- [ ] Select sensor(s) with appropriate bandwidth and accuracy
- [ ] Choose control algorithm (PID? State machine? Adaptive?)
- [ ] Simulate control loop offline
- [ ] Tune gains (Ziegler-Nichols or empirically)
- [ ] Implement in software (ROS, LabVIEW, Python)
- [ ] Test on real hardware at low intensity (conservative gains)
- [ ] Observe response, refine gains
- [ ] Validate on 5–10 representative materials
- [ ] Document gains and assumptions for future reference

---

## References

- Rastegardoost, M. M.; Bao, Z.; Sadr, S.; Abdollahi, N.; Darvish, K.; Clasky, A.; Ohsaka, H.; Le Devedec, F. *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents.* Manuscript in preparation, 2026.
- Key references from the review: [\[11\]](../references.md#ref-11), [\[12\]](../references.md#ref-12), [\[33\]](../references.md#ref-33). Full list on the [References](../references.md) page.

### Further reading (from the earlier wiki)

- Åström, K. J., & Murray, R. M. (2010). *Feedback Systems: An Introduction for Scientists and Engineers*. Princeton University Press.
- Ogata, K. (2010). *Modern Control Engineering* (5th ed.). Prentice Hall.
- Franklin, G. F., Powell, J. D., & Workman, M. A. (1998). *Digital Control of Dynamic Systems* (3rd ed.). Addison Wesley.
