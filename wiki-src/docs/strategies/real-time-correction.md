# Strategy 3: Real-Time Correction

!!! info "In the V3 review"

    Literature scenarios that **sense and correct mid-process** (Fig. 3):

    - **watch → detect → correct**: computer vision corrects over- and under-extrusion in bioprinting within ~10 s [\[33\]](../references.md#ref-33).
    - **scoop → verify → pour**: vision-guided deep-RL powder scooping with real-time volume correction, ~1.93 mg error across seven powders [\[12\]](../references.md#ref-12).

    See [Literature Scenarios](../materials/literature-scenarios.md).

## Overview

**Sense the process as it happens, adjust parameters mid-execution to keep outcome on target.**

Real-time correction monitors a fast process (extrusion, compression, filling) and adjusts the control input (pressure, force, speed) continuously to maintain the desired trajectory.

---

## When to Use

- **Process is unpredictable** (yield-stress material, variable cohesion, unclear flow initiation)
- **Fast feedback available** (pressure transducer, load cell, camera at 30+ fps)
- **Errors compound quickly** (if you miss target early, can't recover by end)
- **Material changes mid-process** (e.g., powder bridge breaks partway through filling)
- **Safety-critical or value-critical** (soft tissues, expensive reagents)
- **Time budget** is moderate (process takes 5–30 seconds)

**Common applications:**
- Bio-printing (soft inks that yield and strain)
- Fragile object handling (tissue, foam, delicate electronics)
- High-accuracy powder dosing with live weight feedback
- Robot compliance control (feel-based grip adjustment)

---

## How It Works

### Step 1: Define the Desired Trajectory

Specify **what you want to measure over time**. Examples:

- **Fill height** (camera): target trajectory is linear: h(t) = h_target × (t / t_total)
- **Weight** (balance): target is linear: W(t) = W_target × (t / t_total)
- **Pressure** (transducer): target is constant: P(t) = P_setpoint
- **Force** (load cell): target is constant, or follows a ramp: F(t) = F_target

### Step 2: Set Up Fast Feedback Loop

Sensor bandwidth must be **at least 10× faster** than process dynamics.

- **Extrusion process:** 5–30 second duration → sensor sampling ≥ 100 Hz
- **Grip and retrieval:** 0.5 second duration → sensor sampling ≥ 200 Hz
- **Soft material compression:** 1–5 seconds → sensor sampling ≥ 100 Hz

### Step 3: Implement Proportional or PID Control

At each sensor sample time (every 10–100 ms), compute:

$$
\text{error} = \text{target}(t) - \text{measured}(t)
$$

Adjust the control parameter (pump speed, pressure, force) proportionally:

$$
\text{control}(t+\delta t) = \text{control}(t) + K_p \times \text{error}(t)
$$

Where \(K_p\) (proportional gain) is tuned to avoid oscillation and overshoot.

#### PID (More Sophisticated)

For better stability, use Proportional-Integral-Derivative:

$$
\text{control}(t) = K_p \times e(t) + K_i \times \int_0^t e(\tau) \, d\tau + K_d \times \frac{de}{dt}
$$

- \(K_p\) (proportional): Respond to current error
- \(K_i\) (integral): Correct steady-state drift
- \(K_d\) (derivative): Dampen overshoot

### Step 4: Monitor for Completion

Stop dispensing/handling when:
- **Measured outcome ≈ target**
- **Time limit exceeded** (safety failsafe)
- **Sensor reading saturates or fails** (fault detection)

---

## Advantages

| Aspect | Benefit |
| --- | --- |
| **Robustness** | Adapts to surprises mid-action; compensates for unmeasured drift |
| **Speed** | No iterative cycles; completes in one pass (5–30 seconds) |
| **Handling difficult materials** | Works with yield-stress, non-Newtonian, unpredictable materials |
| **Safety** | Can detect overload or unexpected force and stop immediately |
| **Accuracy** | Can achieve ±2–5% accuracy in real time |

---

## Limitations

| Challenge | Issue |
| --- | --- |
| **Sensor latency** | If sensor delay > 500 ms, feedback control becomes unstable (oscillates) |
| **Tuning complexity** | PID gain tuning is an art; too high causes ringing, too low is sluggish |
| **Computational overhead** | Requires fast loop rate (100+ Hz) and fast computer |
| **Sensor noise** | Noisy measurement causes noisy corrections; needs filtering |
| **Non-linear systems** | Linear PID may not work for highly non-linear processes |

---

## Real-World Examples

### Example 1: Powder Filling with Live Weight Feedback

**Task:** Fill a small vial with exactly 2.0 g of powder

**Setup:**
- Auger feeder on robot arm
- Vial sits on a precision load cell (0.1 g resolution)
- Dispense at speed 20 rpm (nominal)
- Control loop runs at 10 Hz (read weight every 100 ms)

**Execution:**

```
Time (s)  |  Weight (g)  |  Error (g)  |  Speed (rpm)  |  Action
0.0       |  0.000       |  +2.000     |  20           |  start
0.5       |  0.200       |  +1.800     |  20           |  continue
1.0       |  0.500       |  +1.500     |  20           |  continue
2.0       |  1.200       |  +0.800     |  20           |  continue
3.0       |  1.850       |  +0.150     |  20           |  continue
3.5       |  1.980       |  +0.020     |  18           |  slow down
4.0       |  2.005       |  −0.005     |  15           |  nearly done
4.1       |  2.008       |  −0.008     |  stop         |  STOP (within tolerance)
```

**Proportional gain:** K_p = 5 rpm/g (for every 0.1 g excess, reduce speed by 0.5 rpm)

**Outcome:** Filled in 4.1 seconds, final weight 2.008 ± 0.005 g. ✓

---

### Example 2: Bio-Printing with Pressure Control

**Task:** Extrude 10 µL of a delicate cell suspension from a syringe.

**Setup:**
- Air-pressure syringe: nominal 80 kPa
- Pressure transducer on syringe barrel (±1 kPa accuracy)
- Extrusion nozzle sits 5 mm above substrate
- Camera monitors extrusion rate in real time

**Execution:**

The material is shear-sensitive. If pressure is too high, cells are damaged. If too low, flow stops.

```
Time (s)  |  Pressure (kPa)  |  Flow Rate (µL/s)  |  Target Flow  |  Action
0.0       |  80              |  0 (blocked)       |  10/5=2       |  pressure too high for this batch!
0.5       |  70              |  1.2               |  2.0          |  below target
1.0       |  60              |  0.9               |  2.0          |  still below
1.5       |  75              |  1.8               |  2.0          |  close
2.0       |  78              |  2.1               |  2.0          |  close
3.0       |  76              |  2.0               |  2.0          |  ✓ stable
5.0       |  76              |  2.0 (5 µL)        |  10 µL total  |  half done
...
```

**Control law:** If flow_rate > target, reduce pressure by 2 kPa; if below, increase by 1 kPa

**Outcome:** Extrusion completed at 5 seconds, 10 ± 0.5 µL (cells survive) ✓

---

### Example 3: Robotic Grip Adjustment for Delicate Solid

**Task:** Grip and lift a soft foam block without crushing it

**Setup:**
- 6-DOF robot with 2-finger gripper
- Force/torque sensor in wrist
- Gripper finger displacement measured via encoder

**Execution:**

```
Time (ms)  |  Grip Force (N)  |  Displacement (mm)  |  Target Force  |  Action
0          |  0               |  0                  |  5 N           |  start closing
200        |  1               |  2                  |  5 N           |  continue
400        |  3               |  4                  |  5 N           |  continue
600        |  5               |  5.5                |  5 N           |  ✓ on target
800        |  5.2             |  5.6                |  5 N           |  force stabilized
1000       |  5               |  5.7                |  5 N           |  ✓ hold and lift
2000       |  5               |  5.7                |  5 N           |  moving to drop location
```

**Control:** For every 0.5 N excess force, open gripper 0.1 mm

**Outcome:** Foam gripped and lifted without crush damage ✓

---

## Practical Implementation: PID Tuning

### Gain Selection

1. **Start with P only** (I = D = 0):
2. Set K_p = 1 (conservative)
3. Run a trial
4. If response is slow, increase K_p to 2, 5, 10, etc.
5. If response oscillates, decrease K_p
6. **Add I term** if there's steady-state error:
7. Set K_i = K_p / 10 (rule of thumb)
8. Reduces long-term drift
9. **Add D term** if oscillation persists:
10. Set K_d = K_p / 100
11. Dampens overshoot

### Ziegler-Nichols Method (Classic)

1. Set K_i = K_d = 0
2. Increase K_p until system oscillates at steady amplitude and frequency
3. Note the critical K_p value and oscillation period T_osc
4. Set:
5. K_p_final = 0.6 × K_p_critical
6. K_i = K_p_final / T_osc
7. K_d = K_p_final × T_osc / 8

### Practical Tuning Tips

- **Noisy sensor?** Add a low-pass filter (e.g., exponential moving average)
- **Oscillating?** Reduce K_p or increase K_d
- **Slow to reach target?** Increase K_p (carefully)
- **Overshoots?** Reduce K_p or increase K_d

---

## Implementation Checklist

- [ ] Identify the quantity to control (weight, height, force, pressure)
- [ ] Select a sensor with adequate accuracy and speed
- [ ] Verify sensor latency is < 100 ms for a 5–30 second process
- [ ] Design a target trajectory (constant, linear, or time-varying)
- [ ] Implement PID loop in control software
- [ ] Perform initial tuning on 3 test materials
- [ ] Set safety limits (max/min control signal, timeout)
- [ ] Test on production material
- [ ] Document K_p, K_i, K_d gains for reference
- [ ] Monitor system performance over time (drift, wear)

---

## Comparison with Other Strategies

| Strategy | Reaction Time | Accuracy | Material Robustness | Complexity |
| --- | --- | --- | --- | --- |
| Characterize, then act | Slow | ±5% | Low | Low |
| Iterative optimization | Slow (offline) | ±1% | Medium | Medium |
| **Real-time correction** | Very fast | ±2% | Very high | High |
| Feedforward prediction | Fast | ±2% | Medium | High |
| Simulation generalization | Fast | ±5% | High | Very high |

---

## References

- Rastegardoost, M. M.; Bao, Z.; Sadr, S.; Abdollahi, N.; Darvish, K.; Clasky, A.; Ohsaka, H.; Le Devedec, F. *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents.* Manuscript in preparation, 2026.
- Key references from the review: [\[12\]](../references.md#ref-12), [\[33\]](../references.md#ref-33). Full list on the [References](../references.md) page.

### Further reading (from the earlier wiki)

- Åström, K. J., & Murray, R. M. (2010). *Feedback Systems: An Introduction for Scientists and Engineers*. Princeton University Press.
- Ogata, K. (2010). *Modern Control Engineering* (5th ed.). Prentice Hall.
