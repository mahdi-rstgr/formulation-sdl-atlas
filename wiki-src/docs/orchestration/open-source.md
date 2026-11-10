# Open-Source Orchestration Software

!!! abstract "Step 6 · Orchestrate"

    This page summarizes Section 7.2 of the review and reproduces Supplementary Table S1, which details Figure 8C. The layer terms (L1–L4) are defined in [System Architecture & Orchestration](index.md).

## Scope and selection

Software for integrating laboratory devices is being developed worldwide, but not all of it orchestrates physical experiments:

- FireWorks and AiiDA manage computational workflows and provenance [\[153\]](../references.md#ref-153), [\[154\]](../references.md#ref-154).
- XDL describes chemical procedures [\[155\]](../references.md#ref-155).
- FINALES brokers requests between laboratories [\[156\]](../references.md#ref-156).
- Bluesky coordinates measurement sequences at large facilities [\[157\]](../references.md#ref-157).

The review compared systems that meet five criteria:

1. They integrate and control physical devices.
2. They are intended for general use.
3. They have an open-source core.
4. They were updated within the 12 months before November 2026.
5. They are documented in a publication or official documentation.

Eight systems qualified: **MADSci** [\[158\]](../references.md#ref-158), **AlabOS** [\[159\]](../references.md#ref-159), **EOS** [\[160\]](../references.md#ref-160), **HELAO-async** [\[161\]](../references.md#ref-161), **IvoryOS** [\[162\]](../references.md#ref-162), **UniLabOS** [\[163\]](../references.md#ref-163), **NIMO** [\[164\]](../references.md#ref-164) and **ARES OS** [\[165\]](../references.md#ref-165).

Two notable systems were excluded:

- **A lab orchestration OS** [\[143\]](../references.md#ref-143) pioneered orchestration for SDLs, but its successor [\[144\]](../references.md#ref-144) is a configuration that accompanies a publication rather than a general package.
- **OCTOPUS** [\[166\]](../references.md#ref-166) publishes no license.

Each function was rated as provided through standard mechanisms (configuration files and documented formats and APIs), partially provided, or not provided. Ratings are based on the code and documentation of the repository versions listed below.

## What they share and where they differ

All eight systems accept execution requests, manage step order, register and issue device operations and return their results. All record runs and results and expose external APIs. They differ in four respects:

1. **Branching and scheduling.**
    - Result-dependent branching is standard in AlabOS, EOS, HELAO-async, IvoryOS and ARES OS.
    - Choosing an executable step among concurrent workflows is standard in MADSci, AlabOS, EOS and UniLabOS. NIMO and ARES OS run one procedure at a time.
2. **Built-in planning.** EOS, IvoryOS and NIMO offer built-in selection of the next conditions.
3. **Resource modeling, the sharpest divide.**
    - Only MADSci and UniLabOS track tool mounting and container locations as parent–child relations, and remaining material as quantities.
    - AlabOS and EOS reserve devices and locations across steps.
4. **Alerts.** Only MADSci, AlabOS and HELAO-async alert people through external channels such as email.

!!! tip "Choosing a system"

    No system provides every function. Choosing one means working out which functions your workflows need as standard and which can be added through extension points. In formulation, tool, container and material states change at every step, so **built-in resource and location management reduces custom state-tracking code**. The review did not compare implementation effort or run-time performance.

## Supplementary Table S1: Orchestration functions of eight open-source systems

● provided through standard mechanisms; ◐ partial, with the missing capability stated; ○ not provided in the inspected public version. Configuration files and documented formats and APIs count as standard mechanisms. Modifying the orchestration engine, or standalone demonstration code, does not. Each system's own terms are kept.

| **Function** | **MADSci** | **AlabOS** | **EOS** | **HELAO-async** | **IvoryOS** | **UniLabOS** | **NIMO** | **ARES OS** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **L4: Decision making** |  |  |  |  |  |  |  |  |
| Select the next experimental conditions | **○** | **○** | **●** Bayesian optimization | **○** | **●** Ax, BayBE, etc. | **○** | **●** PHYSBO and other methods | **◐** lacks bundled optimizers |
| Accept execution requests from L4 | **●** Workflow execution | **●** Experiment submission | **●** Protocol submission | **●** Sequence submission | **●** Run/repeat procedures | **●** Workflow execution | **●** Workflow execution | **●** Campaign execution |
| **L3: Workflow orchestration** |  |  |  |  |  |  |  |  |
| Manage step order and dependencies | **●** Defined Step order | **●** Task dependencies | **●** Task dependencies | **●** Order/start conditions | **●** Execute in written order | **●** Step dependencies | **●** Written block order | **●** Written Step order |
| Switch subsequent steps based on results | **◐** lacks result branching | **●** Branch within Task | **●** Conditional branch/merge | **●** Add steps based on result | **●** if/while blocks | **◐** lacks runtime path choice | **○** | **●** Branch within Command |
| Issue Device operations in the specified order | **●** Send Step to Node | **●** Launch/track Task | **●** Run/track Task | **●** Send/track Action | **●** Run Python operations | **●** Send Action to Device | **●** Sequential MCP calls | **●** Send Command to Device |
| Select an executable step from multiple candidates | **●** FIFO next-Step selection | **●** Dependencies/reservations | **●** Dynamic allocation/optim. | **◐** lacks out-of-order choice | **◐** lacks availability-based choice | **●** Dependency/lock checks | **○** | **○** |
| **L2: Device integration** |  |  |  |  |  |  |  |  |
| Register and invoke Device operations | **●** REST Node / SiLA 2 | **●** Python Device | **●** Device / SiLA 2 | **●** Action Server | **●** Expose Python operations | **●** HostLink / ROS 2 | **●** MCP server | **●** Device / SiLA 2 |
| Return Device operation status, results, errors | **●** Node/Action responses | **●** Device responses | **●** Task status/output | **●** Action status/data | **●** Return values/run errors | **●** Action status/results | **●** MCP responses/Task status | **●** Command status/results |
| **Resource and location** |  |  |  |  |  |  |  |  |
| Prevent reassignment of Devices/locations in use | **◐** lacks location reservation | **●** Reserve devices and sample positions | **●** Exclusive Device/location | **◐** lacks location exclusion | **◐** lacks location exclusion | **◐** lacks location reservation | **◐** lacks location exclusion | **◐** lacks location exclusion |
| Retain shared resources across steps | **◐** lacks interstep retention | **●** Reserve jointly in Task | **●** Hold within same Run | **○** | **◐** lacks named-resource hold | **◐** lacks Device retention | **◐** lacks named-resource hold | **◐** lacks named-resource hold |
| Update location/mounting as parent–child relations | **●** Update storage/mounts | **◐** lacks general containment/mounting model | **◐** lacks parent–child update | **◐** lacks common parent links | **○** | **●** Update locations/mounts | **○** | **○** |
| Update remaining material using a quantity model | **●** Quantity increase/decrease | **◐** lacks quantity model | **◐** lacks quantity model | **◐** lacks common qty. mgmt. | **○** | **●** Contents and stock-lot quantities | **○** | **○** |
| **Data and traceability** |  |  |  |  |  |  |  |  |
| Link runs, steps, samples and results | **●** User sample IDs in logged I/O | **●** Standard sample fields | **●** User sample IDs in logged outputs | **●** Standard sample fields | **●** User sample IDs in logged I/O | **●** User sample IDs in logged I/O | **●** User sample IDs in logged I/O | **●** User sample IDs in logged I/O |
| **Error handling** |  |  |  |  |  |  |  |  |
| Pause at step boundaries and retry failed steps | **●** Pause/retry Step | **●** Device pause / in-Task retry | **◐** lacks pause | **●** Stop/requeue failed Action | **●** Pause/retry | **●** Stop/retry decisions | **○** | **●** Pause/retry |
| Detect faults and alert people via external channels | **●** Email alerts | **●** Email / Slack | **◐** lacks external alerts | **●** Email / webhook | **◐** lacks alert delivery | **◐** lacks external alerts | **◐** lacks external alerts | **◐** lacks external alerts |
| **Human-in-the-loop** |  |  |  |  |  |  |  |  |
| Include human checks and manual steps | **◐** lacks confirmation step | **●** Request user input | **◐** lacks confirmation step | **●** Pause for manual work | **●** Request input | **●** Human confirmation node | **◐** lacks in-procedure checks | **●** Wait for confirmation |
| **External integration** |  |  |  |  |  |  |  |  |
| Run and query from external programs | **●** REST / Python | **●** HTTP submission/queries | **●** REST / MCP | **●** HTTP / WebSocket | **●** HTTP (JSON) | **●** HTTP / local MCP | **●** HTTP / SSE | **●** gRPC |

### Repository versions inspected

Repositories were inspected in November 2026. NIMO was assessed with nimo-controller, and ARES OS with PyAres and ARES-datamodel. \*UniLabOS bundled device drivers are licensed for academic use only.

| **System** | **Repository** | **Commit** | **Date** | **Developer** | **License** |
| --- | --- | --- | --- | --- | --- |
| **MADSci** | AD-SDL/MADSci | bbfcba5 | 2026-10-29 | Argonne National Laboratory (US) | MIT |
| **AlabOS** | CederGroupHub/alabos | a81d607 | 2026-08-14 | Lawrence Berkeley National Laboratory and UC Berkeley (US) | MIT |
| **EOS** | UNC-Robotics/eos | 1209636 | 2026-10-07 | University of North Carolina at Chapel Hill (US) | BSD-3 |
| **HELAO-async** | High-Throughput-Experimentation/helao-async | ba910c4 | 2026-10-19 | California Institute of Technology (US) | MIT |
| **IvoryOS** | ivoryos-ai/IvoryOS | 1d0f044 | 2026-10-28 | University of British Columbia (Canada) | MIT |
| **UniLabOS** | deepmodeling/Uni-Lab-OS | 265719e | 2026-09-16 | DP Technology and DeepModeling community (China) | GPL-3.0* |
| **NIMO** | NIMS-DA/nimo | 072da95 | 2026-10-24 | National Institute for Materials Science (Japan) | MIT |
|  | NIMS-DA/nimo-controller | aa89979 | 2026-11-03 |  |  |
| **ARES OS** | AFRL-ARES/ARES | 510d896 | 2026-10-25 | Air Force Research Laboratory (US) | MIT |
|  | AFRL-ARES/PyAres | 2954570 | 2026-10-22 |  |  |
|  | AFRL-ARES/ARES-datamodel | 7a6101a | 2026-10-28 |  |  |
