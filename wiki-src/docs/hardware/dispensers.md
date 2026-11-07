# Commercial Dispensers by Material Class

!!! abstract "Step 3 · Buy: What can be bought?"

    This page summarizes Section 4 and Table 3 of the review. **All accuracy and price figures come from the V3 manuscript and its cited sources.** Prices come from list prices, distributor listings, secondary-market sales or itemized quotes, and are marked as such. Older illustrative estimates are kept on [By Yield Stress & Cost](cost-accuracy.md).

Knowing how each ingredient should be dispensed and moved only helps if hardware can do it. That raises a question that applies to all three material classes: which commercial option gives acceptable accuracy for a given material, and at what cost?

The market is uneven on both counts:

- **Accuracy.** Liquid-handling vendors almost always publish quantified accuracy and precision, often per ISO 8655. Powder and paste dispensing vendors often describe their systems only qualitatively.
- **Price.** Prices are rarely public. Apart from Opentrons, none of the integrated platforms in the review publishes a list price.

The market is therefore **least transparent where formulation handling is hardest**, and quote-only pricing is itself a barrier for SDL groups trying to budget a hardware stack.

## Liquids

Liquids have the most mature and transparent market:

- **Air-displacement pipettes** range from the Rainin E4 XLS+ (±0.8%, $191–350) to the Eppendorf Xplorer (~±0.6%, ~$1,300). Paying more buys throughput and integration more than accuracy.
- **Positive-displacement pipettes** accept a wider accuracy band (Gilson MICROMAN E, ±3–8%) in exchange for a low price (~$525).
- **Syringe pumps:** Hamilton's PSD/4 gets back to ±1% at a low OEM price.
- **Precision peristaltic pumps** (Watson-Marlow Qdos 20, ±1%; Masterflex L/S) cost $4,000–9,000.

## Semi-solids

Semi-solid dispensing splits into two segments:

- **Bioprinting:** list prices but unquantified accuracy. CELLINK printheads cost $2,500–3,190. The Allevi 2 costs $15,000 and reports only motion-stage precision.
- **Industrial:** tight accuracy but quote-only pricing. The ViscoTec preeflow eco-PEN300 is rated ±1%.

Integrated formulation workstations such as the Chemspeed FLEX FORMAX combine liquid, viscous-liquid and powder dosing in one enclosure, but are also sold only by quote [\[152\]](../references.md#ref-152).

## Powders

Powders reverse the liquid market. Reported resolution is excellent: ±10 µg for the Chemspeed SWILE and 0.001 mg readability for the Quantos. But Coperion K-Tron, Chemspeed SWILE/GDU and Mettler-Toledo Quantos systems are all sold only by quote. Secondary-market components, such as $9,800 for a bare Coperion micro-feeder, are the only price signal.

!!! tip "Key finding"

    Across all three material classes, **price follows mechanism class and ecosystem rather than accuracy**.

## Table 3: Commercial dispensers by material class and mechanism

| Material | Mechanism | Brand | Model | Accuracy | Price | Ref |
| --- | --- | --- | --- | --- | --- | --- |
| Liquids | Air-displacement | Rainin | E4 XLS+ | ±0.8% accuracy; ≤0.15% CV | $191–350 | [\[59\]](../references.md#ref-59) |
|  |  | Eppendorf | Xplorer | ~±0.6% accuracy | $1,300 | [\[60\]](../references.md#ref-60) |
|  | Positive-displacement | Gilson | MICROMAN E, M1000E | ±3–8% accuracy; ≤0.5–4% imprecision | $524–527 | [\[61\]](../references.md#ref-61) |
|  |  | Hamilton | PSD/4 syringe pump | ±1% accuracy; ≤0.05% repeatability | $400–500 | [\[62\]](../references.md#ref-62) |
|  | Peristaltic pumping | Watson-Marlow | Qdos 20 | ±1% dosing accuracy; ±0.5% repeatability | $4,248 | [\[63\]](../references.md#ref-63) |
|  |  | Cole-Parmer / Avantor | Masterflex L/S Digital | ±0.1–0.25% speed-control accuracy | $9,000 | [\[64\]](../references.md#ref-64) |
| Semi-solids (gels, pastes) | Syringe-based extrusion | CELLINK | Syringe Pump Printhead | - | $3,190 | [\[65\]](../references.md#ref-65) |
|  | Air pressure-driven extrusion | Allevi (3D Systems) | Allevi 2 | 5 µm XY / 1 µm Z motion precision | $15,000 | [\[66\]](../references.md#ref-66) |
|  |  | Nordson EFD | Ultimus V | - | ~$6,750 | [\[17\]](../references.md#ref-17) |
|  |  | CELLINK | BIO X Pneumatic Printhead | ±0.5 °C temperature precision | $2,500 | [\[67\]](../references.md#ref-67) |
|  | Screw-based (auger) extrusion | ViscoTec | preeflow eco-PEN300 | ±1% dosing accuracy; process capability cP = 4.26 | Quote | [\[68\]](../references.md#ref-68) |
|  |  | Fisnar | PDV-1000 | min size 0.508 mm | Quote | [\[69\]](../references.md#ref-69) |
| Powder / granular solids | Auger/screw feeding | Coperion K-Tron | MT12 Twin-Screw Micro-Feeder | SFT weighing resolution 1:4,000,000 in 80 ms | ~$9,800 | [\[70\]](../references.md#ref-70) |
|  |  | Chemspeed | SWILE / GDU-P | ±10 µg resolution | Quote | [\[71\]](../references.md#ref-71) |
|  | Gravimetric dosing head | Mettler-Toledo | Quantos (QB1/QB6) | Balance readable to 0.001 mg | Quote | [\[72\]](../references.md#ref-72) |
|  | Vibratory, gravity-fed hopper dosing | 3P Innovation | VF1 Vibratory Feeder | ±1 mg dose accuracy | Quote | [\[73\]](../references.md#ref-73) |
|  |  | Eriez | Hi-Vi Volumatic Feeder | - | Quote | [\[74\]](../references.md#ref-74) |

"Quote" means no public price was found. "–" means no quantified accuracy is published.

!!! note "Figure 5 not reproduced"

    The review's Figure 5 plots these products on one price axis and gives qualitative profiles of four platforms. It contains vendor product photographs and is not shown here. See [Integrated Platforms](platforms.md) for a text summary.

**See also:** [Integrated Platforms](platforms.md) · [Retrofits Beyond Factory Spec](retrofits.md) · [Hardware by Material Type](by-material.md)
