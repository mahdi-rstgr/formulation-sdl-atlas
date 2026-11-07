# Sensing & Characterization

!!! info "Updated to manuscript V3"

    The review emphasizes **in-situ** sensing that replaces separate characterization: viscosity from pipetting mass flow [\[22\]](../references.md#ref-22) or dispense time [\[23\]](../references.md#ref-23), from stirring forces [\[31\]](../references.md#ref-31) or filmed flow [\[28\]](../references.md#ref-28); extrusion monitored by computer vision [\[33\]](../references.md#ref-33); powder volume verified by vision during scooping [\[12\]](../references.md#ref-12). A formulation experiment also records time series (balance, pressure, torque, self-powered sensor signals [\[131\]](../references.md#ref-131)) and spectra such as the acoustic-to-electrical response of energy-harvesting composites [\[132\]](../references.md#ref-132); see [Data & Decision Models](data-and-decisions.md).

## Overview

Before any control strategy can work, you must measure **what you're trying to control**. This page covers sensors and characterization techniques for material properties and process state.

---

## Sensor Categories

### 1. Material Property Sensors (Offline)

Used to characterize materials **before** the main task. Typically take 30 seconds to 5 minutes per measurement.

#### Viscosity/Rheology

- **Rotational rheometer** (Anton Paar, TA Instruments, Brookfield)
- Cost: $50k–$150k
- Measurement time: 2–10 minutes
- Accuracy: ±1–2%
- Output: viscosity vs. shear rate curve (full flow behavior)
- **Vibrational viscometer** (falling ball, tuning fork)
- Cost: $5k–$20k
- Measurement time: 30 seconds
- Accuracy: ±2–5%
- Output: single viscosity value at defined shear rate

#### Particle Size & Flowability

- **Laser diffraction** (Malvern Mastersizer)
- Cost: $30k–$80k
- Measurement time: 2 minutes
- Accuracy: ±2–5%
- Output: particle size distribution (PSD)
- **Powder rheometer** (FT4 Freeman Technology)
- Cost: $60k–$100k
- Measurement time: 5 minutes
- Accuracy: Empirical (not absolute)
- Output: flowability indices (BFE, SI, HR)
- **Sieve analysis** (manual)
- Cost: $500
- Measurement time: 30 minutes
- Accuracy: ±5%
- Output: cumulative PSD at discrete size bins

#### Moisture Content

- **Moisture analyzer** (Karl Fischer, loss-on-drying)
- Cost: $5k–$20k
- Measurement time: 5 minutes
- Accuracy: ±0.01%
- Output: water content (%w/w)

#### Spectroscopy

- **UV-Vis spectrometer** (PerkinElmer, Shimadzu)
- Cost: $10k–$50k
- Measurement time: 1 minute
- Accuracy: ±1%
- Output: absorbance at wavelengths (→ concentration via Beer-Lambert)
- **FTIR** (Fourier Transform Infrared)
- Cost: $20k–$80k
- Measurement time: 2 minutes
- Accuracy: Qualitative or semi-quantitative
- Output: chemical composition fingerprint

---

### 2. Process State Sensors (Online)

Used **during** the main task to monitor progress and enable feedback control. Typical sampling rates 100 Hz – 1 kHz.

#### Gravimetric (Weight)

- **Precision balance** (Mettler-Toledo XPE)
- Cost: $3k–$10k
- Range: 0–610 g
- Accuracy: ±0.001 g (1 mg)
- Bandwidth: 10 Hz (slow for real-time, but typical)
- Use: Powder dosing feedback
- **Load cell** (compression or tension)
- Cost: $100–$1k
- Range: 1 kg – 500 kg
- Accuracy: ±0.1% of range
- Bandwidth: 100–500 Hz (fast)
- Use: Real-time weight measurement, gripper force detection

#### Force & Torque

- **6-axis F/T sensor** (ATI, Schunk, JR3)
- Cost: $2k–$10k
- Range: ±500 N, ±50 N·m (various models)
- Accuracy: ±1% of full scale
- Bandwidth: 500 Hz – 2 kHz
- Use: Extrusion pressure feedback, gripper force control, contact detection

#### Pressure

- **Pressure transducer** (Honeywell, Hydac)
- Cost: $200–$500
- Range: 0–10 bar (typical)
- Accuracy: ±0.5% FS
- Bandwidth: 100–500 Hz
- Use: Syringe pressure, pump outlet pressure, pneumatic feedback

#### Flow Rate

- **Coriolis flowmeter** (Micro Motion)
- Cost: $5k–$15k
- Range: 0.001–50 kg/min
- Accuracy: ±0.5%
- Bandwidth: 50 Hz
- Use: Extrusion rate monitoring
- **Turbine flowmeter**
- Cost: $500–$2k
- Range: Tunable per design
- Accuracy: ±1–2%
- Bandwidth: 100–500 Hz
- Use: Liquid pumping feedback

#### Displacement & Position

- **Linear encoder / LVDT** (Linear Variable Differential Transformer)
- Cost: $300–$1k
- Range: Typically 0–100 mm
- Accuracy: ±0.1 mm
- Bandwidth: 100 Hz – 10 kHz
- Use: Syringe plunger position, gripper finger displacement
- **Potentiometer** (rotary or linear)
- Cost: $50–$200
- Accuracy: ±2–5%
- Bandwidth: Very high (> 10 kHz)
- Use: Budget feedback, less critical measurements

---

### 3. Vision Sensors

#### Standard Camera

- **USB camera** (generic)
- Cost: $50–$500
- Resolution: 640×480 – 4K
- Frame rate: 30–120 fps
- Latency: 50–100 ms
- Use: Object detection, fill level monitoring
- **Industrial camera** (Basler, FLIR)
- Cost: $1k–$5k
- Resolution: 1K – 4K
- Frame rate: 60–500 fps (high-speed options)
- Latency: 10–20 ms
- Use: High-speed process monitoring, real-time feedback

#### Depth Camera

- **RealSense / Kinect** (structured light)
- Cost: $100–$500
- Depth range: 0.1–10 m
- Accuracy: ±2–5 mm
- Frame rate: 30–90 fps
- Use: 3D object detection, bin picking
- **LiDAR** (time-of-flight)
- Cost: $500–$5k
- Depth range: 0.1–100 m
- Accuracy: ±5–50 mm (depends on model)
- Frame rate: 10–20 Hz
- Use: 3D scene reconstruction, large-scale mapping

---

### 4. Environmental Sensors

#### Temperature

- **Thermistor / RTD** (Resistance Temperature Detector)
- Cost: $10–$100
- Accuracy: ±0.1–1°C
- Bandwidth: 10 Hz
- Use: Viscosity correction (viscosity drops ~2% per °C)

#### Humidity

- **Capacitive humidity sensor**
- Cost: $20–$100
- Accuracy: ±2–5% RH
- Bandwidth: 10 Hz
- Use: Moisture-sensitive powder properties

---

## Sensor Accuracy Requirements

**Key rule:** Sensor accuracy should be **5–10× better** than your control tolerance.

**Example:**
- Target dosing accuracy: ±1%
- Required sensor accuracy: ±0.1–0.2%
- Implication: A 5 g target requires ±5–10 mg sensor accuracy
- Load cell with ±1% accuracy (typically ±50 mg at 5 kg range) is marginal
- Better: Use a precision scale with ±1 mg accuracy

---

## Sensor Fusion

Combining multiple sensors improves reliability:

### Example: Powder Dispensing

**Approach 1: Weight only**
- Use load cell
- Update frequency: 100 Hz
- Latency: 10 ms
- Robustness: Fails if scale drifts

**Approach 2: Weight + vision (fill level)**
- Load cell provides primary feedback
- Camera measures fill height as secondary check
- If weight and fill level don't match, flag error
- Robustness: Redundancy catches scale drift

**Approach 3: Weight + flow meter**
- Load cell measures total accumulated mass
- Flow meter measures instantaneous flow rate
- Fuse both: if flow meter says "too slow" but weight is on target, feeder may be slowing down
- Robustness: Predictive error detection

---

## Calibration and Maintenance

### Load Cell Calibration

1. **Zero calibration:** With no load, set reading to 0
2. **Span calibration:** With known weight (e.g., 5 kg), set reading to 5 kg
3. **Linearity check:** Test at 25%, 50%, 75%, 100% of range
4. **Frequency:** Weekly for production equipment, monthly for lab

### Vision System Calibration

1. **Camera intrinsics:** Focal length, principal point, distortion (one-time, or if lens changes)
2. **Camera extrinsics:** Position and orientation relative to robot base (one-time or weekly)
3. **Lighting:** Consistent illumination (check if shadows change with time of day)

### Rheometer Calibration

1. **Geometry calibration:** Empty spindle, verify torque = 0
2. **Temperature control:** Peltier element stabilized to ±0.1°C
3. **Standard material:** Test on reference fluid (e.g., silicone oil, known viscosity)

---

## Sensor Selection Checklist

For your material handling task, answer:

- [ ] What variable am I trying to control? (weight, force, fill level, etc.)
- [ ] What is my target accuracy? (±0.1%, ±1%, ±5%, etc.)
- [ ] What is my process duration? (seconds vs. minutes)
- [ ] What sensor bandwidth do I need? (10 Hz, 100 Hz, 1 kHz?)
- [ ] What is my budget per sensor? ($100, $1k, $10k?)
- [ ] Do I need multiple sensors (redundancy/fusion)?
- [ ] What is my calibration maintenance plan? (weekly, monthly, quarterly)

---

## References

- Rastegardoost, M. M.; Bao, Z.; Sadr, S.; Abdollahi, N.; Darvish, K.; Clasky, A.; Ohsaka, H.; Le Devedec, F. *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents.* Manuscript in preparation, 2026.
- Key references from the review: [\[12\]](../references.md#ref-12), [\[22\]](../references.md#ref-22), [\[23\]](../references.md#ref-23), [\[28\]](../references.md#ref-28), [\[31\]](../references.md#ref-31), [\[33\]](../references.md#ref-33), [\[131\]](../references.md#ref-131), [\[132\]](../references.md#ref-132). Full list on the [References](../references.md) page.

### Further reading (from the earlier wiki)

- ISO 13320: Particle size analysis – Laser diffraction method
- ISO 6440: Vegetable fats and oils – Determination of viscosity
- NIST Traceability Certificate (for calibration standards)
