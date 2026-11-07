# Simulation Tools for SDL Material Handling

!!! abstract "Step 5 · Rehearse"

    Table 6 of the review compares simulation tools by fidelity level (see the [fidelity hierarchy](index.md#the-fidelity-hierarchy)), ROS 2 integration and best use in an SDL.

## Table 6: Simulation tools for SDL material handling

| Tool or class | Level | What it resolves | ROS 2 link | Best SDL use | Main constraint |
| --- | --- | --- | --- | --- | --- |
| Discrete-event simulation (e.g. SimPy) | 1 | Queues, resources, timing | Indirect | Throughput, scheduling, bottleneck analysis | No geometry or physics |
| Device emulators, SiLA 2 mocks | 1 | Command protocols, device states | Via drivers | Testing orchestration before hardware arrives | Fidelity limited to the protocol |
| Lightweight kinematic twins | 1–2 | Geometry, FK/IK, clearance | Shares URDF | Reachability, layout, verified offline programs, shareable visualization | No forces or material behavior |
| MoveIt 2 with RViz | 2 | Motion planning, collision checking | Native | Collision-free planning for ROS-based cells | Planning, not physics |
| Vendor offline programming (URSim, RoboDK) | 2 | Robot kinematics, native program code | Limited | Fast commissioning of a single arm | Few instrument or material models; brand lock-in |
| Gazebo | 3 | Rigid-body dynamics, sensors | Native bridge | Mobile manipulators and multi-station cells | Limited fluids and granular media |
| MuJoCo | 3 | Fast, robust contact dynamics | Community bridges | Grasping, insertion, learning-based control | Simplified deformables and fluids |
| PyBullet | 3 | Rigid-body dynamics | Community bridges | Scripted experiments, rapid prototyping | Aging ecosystem, basic rendering |
| NVIDIA Isaac Sim | 3 (+4) | GPU physics, particle fluids, deformables, ray-traced sensors | Native bridge | Synthetic images of glassware and liquids, digital twins of whole cells | RTX GPU required, steep learning curve |
| Isaac Lab | 3 | Massively parallel environments | Via Isaac Sim | Reinforcement and imitation learning of handling skills | Sim-to-real gap for materials |
| Chemistry twins (Chemistry3D, MATTERIX) | 3–4 | Robot, devices, liquids, powders, simple chemistry | Via Isaac Sim | Rehearsing complete chemistry workflows | Early-stage, validation ongoing |
| CFD (VOF) and SPH solvers | 4 | Free-surface liquid flow | None | Dispensing, pouring, mixing accuracy | Hours per case; little robot coupling |
| DEM solvers | 4 | Particle-scale granular flow | None | Powder dosing, hopper and feeder design | Contact parameters need calibration |
| MPM and differentiable simulators (e.g. Taichi, FluidLab) | 4 | Elasto-viscoplastic and multi-material flow | None | Pastes and gels; gradient-based optimization of handling | Research code; constitutive parameters needed |

## How to read the table

- **Start cheap.** Use Levels 1–2 (discrete-event simulation, device emulators, kinematic twins, MoveIt 2) to check throughput, orchestration logic, reachability and collision-free paths for every action.
- **Add contact physics where grasping matters.** Gazebo, MuJoCo, PyBullet and Isaac Sim / Isaac Lab cover contact-rich steps such as inserting a premix container or uncapping, and support learned handling skills [\[102\]](../references.md#ref-102), [\[103\]](../references.md#ref-103), [\[104\]](../references.md#ref-104), [\[107\]](../references.md#ref-107), [\[108\]](../references.md#ref-108), [\[109\]](../references.md#ref-109).
- **Use material solvers selectively.** CFD/SPH, DEM and MPM solvers should be called only where material flow decides the outcome, for example dispensed mass or powder flow from a hopper [\[112\]](../references.md#ref-112), [\[113\]](../references.md#ref-113), [\[121\]](../references.md#ref-121), [\[116\]](../references.md#ref-116). Their constitutive and contact parameters have to be calibrated for each new material [\[122\]](../references.md#ref-122).
- **Watch for chemistry twins.** Chemistry3D [\[110\]](../references.md#ref-110) and MATTERIX [\[111\]](../references.md#ref-111) are early-stage, but they are the first tools to rehearse complete chemistry workflows with liquids and powders.

**See also:** [Simulation & Digital Twins](index.md) · [Simulation-Based Generalization](../strategies/simulation-generalization.md) · [Digital Twins & LLMs](../ai/digital-twins.md)
