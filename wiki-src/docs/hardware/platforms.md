# Integrated Platforms

!!! abstract "Step 3 · Buy: What can be bought?"

    This page summarizes Section 4.2 and Table 4 of the review.

An SDL usually buys an integrated platform rather than a bare mechanism. The eight platforms in Table 4 vary in price by more than an order of magnitude, without a comparable spread in accuracy.

- **Opentrons OT-2/Flex.** The open-source option, and the only one with a list price ($15,950–26,400). Its accuracy is unusually well documented and depends strongly on volume: ±15% at 1 µL, ±0.6% at 300 µL.
- **Hamilton Microlab STAR, Eppendorf epMotion 5075, Tecan Fluent, Beckman Coulter Biomek i7 and Agilent Bravo.** Where they publish accuracy, it is broadly comparable and below 5%. Their price differences come from throughput, deck configuration and software ecosystem.
- **Two non-contact platforms for very-low-volume screening.** The pressure-driven Dispendix I.DOT handles 8 nL–30 µL, with <5% error above 100 nL. The acoustic Beckman Coulter Echo 525 handles 25 nL–5 µL, with <10% accuracy and <8% precision. Neither has a public price.

## Table 4: Mechanism, pipetting accuracy and price

| Platform | Mechanism | Accuracy / precision | Price | Ref |
| --- | --- | --- | --- | --- |
| Opentrons OT-2 / Flex | Gantry-mounted air-displacement pipetting | ±15% systematic error / ±5% CV at 1 µL; ±0.6% / ±0.3% CV at 300 µL (strongly volume-dependent) | OT-2 from $15,950; Flex from $26,400 | [\[15\]](../references.md#ref-15) |
| Hamilton Microlab STAR | Deck-based, up to 8-channel air/positive-displacement pipetting | Trueness ≤0.75–1%; precision CV ≤1.5–2% (low- and high-volume channels) | €104,500 | [\[16\]](../references.md#ref-16) |
| Eppendorf epMotion 5075 | Benchtop 1-/8-channel air-cushion pipetting | Systematic error ±0.6–0.7% at full-scale volume (TS1000 tool) | ~$8,000–20,000 | [\[75\]](../references.md#ref-75) |
| Dispendix I.DOT | Non-contact, pressure-driven drop-on-demand dispensing | <5% accuracy/CV for 100 nL–10 µL; <8% below 100 nL; range 8 nL–30 µL | - | [\[76\]](../references.md#ref-76) |
| Tecan Fluent (successor to Freedom EVO, sales of which ended Dec. 2025) | Deck-based robotic arm, disposable-tip pipetting (Liquid FCA head) | CV ≤3% at 10 µL, ≤0.5% at 100 µL (standard head); CV ≤8% at 1 µL, ≤1.5% at 10 µL (low-volume head) | Freedom EVO $20,000–24,000; Fluent 1080 $32,995–75,000 | [\[77\]](../references.md#ref-77) |
| Beckman Coulter Biomek i7 | Dual-arm workstation, 96/384-channel head + 8-tip Span-8 syringe pipetting | Not published as a numeric accuracy/CV spec by Beckman; only volume ranges are given on official pages | $34,995–38,995 | [\[78\]](../references.md#ref-78) |
| Agilent Bravo | 96/384/1536-channel pipette head robot, fixed or disposable tips | 96-channel 50 µL fixed-tip head: ±4.4% accuracy / 3.9% CV at 0.1 µL; ±2.1% / 2.1% CV at 1.0 µL | $37,995–63,195 | [\[79\]](../references.md#ref-79) |
| Labcyte/Beckman Coulter Echo 525 | Non-contact, focused acoustic droplet ejection | <10% transfer accuracy; <8% transfer precision (CV); range 25 nL–5 µL | - | [\[80\]](../references.md#ref-80) |

Gantry accuracy is rarely published.

## Generalist versus specialist

Placed on one price axis, the products fall into three patterns:

- List-priced products cluster in liquid handling.
- Most paste and powder dispensers are sold only by quote.
- Each product serves one material class through one mechanism.

The **Opentrons Flex** and the **Hamilton Microlab STAR** go furthest beyond a single class. Each is sold with an optional gripper arm that moves labware as well as liquid. Even as an add-on, this generalist capability shows commercially that the direction argued in the review is feasible: platforms that recognize which part of the material spectrum they are working in and switch tools to match.

The review rates four platforms on nine criteria to make the generalist-versus-specialist trade-off explicit:

- accuracy
- price
- liquid versatility
- solid handling (labware transfer)
- powder handling
- throughput
- programming simplicity
- deck capacity and footprint
- maintenance cost

Where the catalog ends, researchers take over: see [Retrofits Beyond Factory Spec](retrofits.md).

**See also:** [Commercial Dispensers](dispensers.md) · [Robot Classes](../object-handling/robot-classes.md)
