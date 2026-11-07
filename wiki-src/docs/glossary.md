# Glossary

A reference guide for key terms and concepts in autonomous material handling.

## Material Properties

**Yield Stress**
: The minimum stress required to initiate flow in a material. Materials with high yield stress (like pastes and slurries) require more force to move.

**Rheology**
: The science of material deformation and flow. Describes how materials respond to applied forces and stresses.

**Viscosity**
: A measure of a fluid's resistance to flow. High viscosity materials (like honey) flow slowly; low viscosity materials (like water) flow easily.

**Flowability**
: The ease with which a material can be moved, poured, or dispensed. Depends on particle size, shape, moisture content, and cohesion.

**Non-Newtonian Fluid**
: A fluid whose viscosity changes with the applied shear rate. Examples: ketchup, blood, paint (shear-thinning), or Oobleck (shear-thickening).

**Cohesion**
: The attractive forces between particles in a powder or semi-solid, affecting how they stick together and flow.

**Particle Size Distribution (PSD)**
: The range and relative proportions of particle sizes in a powder. Affects flowability and packing density.

## Handling Strategies

**Characterize, Then Act**
: A strategy of measuring material properties first, then executing a pre-planned handling procedure based on those measurements.

**Iterative Optimization**
: A strategy involving repeated cycles of dispense → measure → adjust to optimize process outcomes.

**Real-Time Correction**
: A strategy that uses in-situ sensors to detect deviations during a process and corrects them on-the-fly.

**Feedforward Prediction**
: A strategy that predicts the optimal process parameters before execution using prior knowledge or models.

**Simulation-Based Generalization**
: A strategy of training models in simulation, then deploying them to handle real materials with different properties.

**Physical Reinvention**
: A strategy of solving handling challenges by redesigning hardware (nozzles, feeders, grippers, etc.).

**Tactile Retrieval**
: A strategy using touch-based sensing (force, texture, compliance) to manipulate objects without vision.

## Hardware & Equipment

**Peristaltic Pump**
: A pump that moves fluid by compressing and releasing a flexible tube in sequence. Good for viscous or particulate fluids.

**Syringe Pump**
: A pump that dispenses fluid by pushing a plunger through a syringe. Precise but limited volume.

**Auger / Screw Feeder**
: A rotating screw mechanism for handling powders and granules, providing controlled dispensing rates.

**Gripper**
: A mechanical or pneumatic device for grasping and manipulating solid objects or partially formed items.

**Powder Hopper**
: A container that feeds powder into a dispenser or processing unit, often with vibration or agitation.

**Rheometer**
: An instrument that measures the flow and deformation properties of materials under controlled conditions.

## AI & Control Concepts

**Feedback Control**
: A control system that measures output and adjusts input to maintain desired performance (e.g., PID control).

**Feedforward Control**
: A control system that predicts required adjustments based on known inputs, without measuring output.

**Cascade Control**
: A hierarchical control structure where an outer controller sets targets for inner controllers.

**PID Control (Proportional-Integral-Derivative)**
: A standard feedback control algorithm that adjusts output based on error (proportional), accumulated error (integral), and error rate (derivative).

**Machine Learning (ML)**
: Algorithms that learn patterns from data to make predictions or decisions without being explicitly programmed.

**Regression**
: An ML task that predicts continuous numerical values (e.g., predicting dispense volume from parameters).

**Classification**
: An ML task that predicts categorical outcomes (e.g., predicting material type from sensor data).

**Digital Twin**
: A virtual model of a physical system that simulates its behavior, used for testing and prediction.

**Discrete Element Method (DEM)**
: A simulation technique for modeling particle interactions in powders and granular materials.

**Finite Element Method (FEM)**
: A simulation technique for modeling continuous deformation in solids and semi-solids.

## Process Metrics

**Precision**
: The consistency or repeatability of a process. Low variance in repeated measurements or operations.

**Accuracy**
: How close a measurement or result is to the true value or target.

**Throughput**
: The volume or mass of material processed per unit time.

**Yield**
: The percentage of material successfully processed or dispensed without waste or defects.

**Process Window**
: The range of operating conditions (e.g., temperature, speed, parameters) within which a process works acceptably.

## Cross-Cutting Terms

**Autonomous Formulation**
: The automated design and synthesis of materials or products with minimal human intervention, often using feedback loops and optimization.

**Closed-Loop System**
: A system with sensors that measure outcomes and adjust inputs to maintain control (feedback).

**Open-Loop System**
: A system that executes pre-planned instructions without measuring or adjusting based on outcomes.

**Sensor Fusion**
: Combining data from multiple sensors to improve understanding or control of a process.

**Payload**
: The material being handled or dispensed in a robotic or automated system.

**Robustness**
: The ability of a system to maintain performance despite variations in materials, conditions, or disturbances.

**Scalability**
: The ease with which a process or strategy can be adapted to handle different material types, scales, or production rates.

## Formulation SDL Terms (added with the V3 update)

**Self-Driving Laboratory (SDL)**
: A laboratory that closes the loop between experiment design, robotic execution and data analysis, using results to select subsequent experiments with little human intervention [\[1\]](references.md#ref-1).

**Premix container**
: The vessel into which ingredients are dosed before it is carried to a mixer, processed and characterized. See [Robot Classes](object-handling/robot-classes.md).

**Object handling**
: Moving the vessels and tools that hold or dispense materials (carrying containers, opening lids, capping, loading instruments), as opposed to material handling, which moves the matter itself.

**Hausner ratio**
: Ratio of tapped to bulk density of a powder; ~1.00–1.11 indicates free-flowing and >1.4 very cohesive powder (Table 1 of the review).

**Sense–act sequence**
: The three-verb title of each literature scenario (e.g. *dispense → weigh → optimize*) describing how a study senses a material and acts on it. See [Literature Scenarios](materials/literature-scenarios.md).

**Retrofit**
: A modification of a purchased platform's end-effector, sensing or control software that unlocks a capability its manufacturer never sold. See [Retrofits](hardware/retrofits.md).

**Digital twin**
: A persistent virtual counterpart of a specific system that shares its geometry, kinematics and device logic and is kept consistent with its measured state [\[89\]](references.md#ref-89), [\[90\]](references.md#ref-90).

**Fidelity level**
: The amount of physics a simulation resolves: (1) workflow, (2) kinematics, (3) contact dynamics, (4) material physics. See [Simulation & Digital Twins](simulation/index.md).

**DEM / MPM / SPH / CFD**
: Discrete element method (powders), material point method (pastes and gels), smoothed-particle hydrodynamics and computational fluid dynamics (liquids).

**Sim-to-real gap**
: The performance drop when a model or policy developed in simulation is deployed on hardware; for liquids, gels and powders it is set by the material model [\[128\]](references.md#ref-128).

**ROS 2**
: Robot Operating System 2, the middleware through which most research robots, simulators and planners exchange data [\[96\]](references.md#ref-96).

**SiLA 2**
: A laboratory standard defining typed device features with discovery, progress notifications and status subscriptions [\[167\]](references.md#ref-167).

**OPC UA LADS**
: Information models for laboratory and analytical devices built on industrial OPC UA [\[168\]](references.md#ref-168).

**Orchestration software**
: Software that runs dispensers, robots, instruments and twin as one system, ordering device operations and tracking resources and locations. See [Orchestration](orchestration/index.md).

**Functional layers (L1–L4)**
: Device control (L1), device integration (L2), workflow orchestration (L3) and decision making (L4).

**Model Context Protocol (MCP)**
: A protocol through which AI agents call tools; increasingly used to expose orchestration functions to agents [\[171\]](references.md#ref-171).

**Surrogate model**
: A model mapping composition and process parameters to measured properties, used in place of a lookup table.

**Acquisition function**
: A rule that ranks candidate experiments using a surrogate's predictions and uncertainty, as in active learning and Bayesian optimization [\[134\]](references.md#ref-134), [\[135\]](references.md#ref-135).

**FAIR data**
: Data that are findable, accessible, interoperable and reusable [\[133\]](references.md#ref-133).

**Agentic system**
: An LLM wrapped in a loop that plans, calls tools, observes results and revises its plan, as in Coscientist and ChemCrow [\[125\]](references.md#ref-125), [\[127\]](references.md#ref-127). See [LLMs & AI Agents](ai/agents.md).
