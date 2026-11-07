# Retrofits Beyond Factory Specification

!!! abstract "Step 4 · Extend: How to go beyond the catalog?"

    Summarizes Section 5 (*Customizing Platforms Beyond Their Factory Specification*) and Table 5 of the review.

The optional gripper arms on the Opentrons Flex and the Hamilton Microlab STAR are the manufacturer-approved route to generalization. A larger body of work gets there without the vendor. Researchers keep a platform's gantry, deck and control loop, then swap its end-effector, add a sensor or replace its control software to unlock a capability the manufacturer never sold.

The [literature scenarios](../materials/literature-scenarios.md) ask how a material should be handled. This work asks a different question: which layer of a platform you already own should you modify (mechanical, sensing or software) so that one machine can cover more steps of a formulation workflow? Table 5 groups ten studies by that layer. Three of them also appear among the liquid-handling scenarios; seven are new here.

## Table 5: Retrofits that extend platforms beyond their factory specification

| Layer modified | Base platform | Novel idea | New capability unlocked | Ref |
| --- | --- | --- | --- | --- |
| Control parameters (unmodified hardware) | Opentrons OT-2 | Bayesian-optimize aspirate/dispense speed against gravimetric feedback instead of a fixed viscosity lookup table | <5% error dispensing liquids up to 1275 cP on a robot rated for water-like liquids | [\[11\]](../references.md#ref-11) |
|  | Opentrons OT-2 | Treat the pipetting robot’s own dispense-time/mass data as a viscosity-proxy signal | Turns a liquid handler into a high-throughput viscometer with no dedicated rheometer | [\[23\]](../references.md#ref-23), [\[81\]](../references.md#ref-81) |
| End-effector replacement | Generic robot arm | Replace the pipette tip with a vibrating acoustofluidic coupler | Mixes liquids ~10⁶× more viscous than water without a pump | [\[25\]](../references.md#ref-25) |
|  | Opentrons OT-1 | 3D-printed adapter turns the robot’s own stepper motor into an infuse/withdraw syringe pump | Extends a microliter-rated robot to 15–50 nL transfers for under $6,000 total system cost | [\[82\]](../references.md#ref-82) |
|  | Councill’s modified Opentrons OT-1 | Add two-position/selector valves to the same syringe-pump retrofit | Same platform doubles as an autosampler feeding an LC-MS instrument | [\[83\]](../references.md#ref-83) |
|  | Generic robot arms | Sub-$200, three-part 3D-printed pipette end-effector | Lets arms that cannot grip a pipette at all reach commercial-liquid-handler accuracy | [\[84\]](../references.md#ref-84) |
|  | Generic tool-exchange gripper | Container-shape taxonomy drives dual-material compliant gripper-finger design | One gripper reliably grasps vessel shapes a stock gripper’s fingers cannot | [\[85\]](../references.md#ref-85) |
| Sensing add-on via tool-changing | Opentrons OT-2 | Adapter with two mounting bores lets the existing tool-change slot carry a pipette or a camera | Same robot alternates dispensing and in-situ imaging without a separate imaging station | [\[86\]](../references.md#ref-86) |
|  | Opentrons OT-2 | Mount a camera + transilluminator, pair with a Detectron2 vision model | Liquid handler gains automated colony picking (~240/h) at a fraction of a dedicated picker’s cost | [\[87\]](../references.md#ref-87) |
| Software/control layer | Opentrons, Hamilton, Tecan | Hardware-agnostic Python driver replaces vendor firmware | Exposes physically possible moves vendor software never programmed, e.g., dual-plate pipetting | [\[88\]](../references.md#ref-88) |

## Three families of retrofit

### 1. Replace the end-effector

The most direct retrofit keeps the motion system and replaces the end-effector (Table 5, rows 3–7). There are two threads.

**Reuse the robot's own actuator.** Councill et al. turn the stepper motor of the now-discontinued Opentrons OT-1 into a nanoliter syringe pump [\[82\]](../references.md#ref-82). Axtell et al. show that the same retrofit, with valves added, also works as an LC-MS autosampler [\[83\]](../references.md#ref-83).

**Platform-agnostic tools.** Yoshikawa et al.'s open-hardware digital pipette [\[84\]](../references.md#ref-84) and Zwirnmann et al.'s gripper fingers, designed from a container-shape taxonomy [\[85\]](../references.md#ref-85), fit any compatible arm. They give up deep integration in exchange for reuse across a fleet.

### 2. Use the tool changer as a sensor mount

A second family uses the tool-change mechanism, built for pipette tips, to mount a different tool. Nazeri et al. [\[86\]](../references.md#ref-86) and del Olmo Lianes et al. [\[87\]](../references.md#ref-87) both mount a camera on an Opentrons OT-2: the first to monitor dispensing, the second to pick colonies. What is new is not the commodity camera but the idea of treating a consumables interface as a general-purpose mount.

### 3. Replace the control software

A third family works at the software layer. Wierenga et al.'s PyLabRobot [\[88\]](../references.md#ref-88) replaces proprietary control software with one hardware-agnostic Python interface for Opentrons, Hamilton and Tecan platforms. It exposes moves that are physically possible but that vendor firmware never programmed, such as an 8-channel head servicing two microplates in one motion.

Layers like this underpin every other customization. A robot cannot act on a new sensor through firmware that refuses non-standard commands, and a formulation workflow cannot be orchestrated across instruments that refuse a common interface. See also [Orchestration](../orchestration/index.md).

## Why it matters

Together, these retrofits can turn a **$15,000–30,000 liquid handler** into a nanoliter dispenser, an autosampler, a colony picker or an imaging station. The cost is a few hundred dollars in printed parts plus a workaround in the control layer. They are a lower-cost counterpart to the new-hardware scenarios E–H in Figure 3, and they turn single-purpose robots into the multi-function platforms formulation SDLs need.

!!! warning "Every new capability is a new failure mode"

    Proving a retrofit on the physical cell is slow and risky, which is the motivation for rehearsing it first in [simulation and digital twins](../simulation/index.md).

**See also:** [Physical Reinvention](../strategies/physical-reinvention.md) · [Integrated Platforms](platforms.md)
