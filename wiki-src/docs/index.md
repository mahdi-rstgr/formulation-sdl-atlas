---
title: Home
hide:
  - navigation
  - toc
---

<div class="hero" markdown>

<p class="hero__eyebrow">Companion wiki · Manuscript V3</p>

# Self-Driving Laboratories for Formulation { .hero__title }

<p class="hero__pitch">How a self-driving lab doses liquids, pastes and powders, moves the containers that hold them, rehearses each step in a digital twin, and decides what to make next.</p>

<div class="hero__actions" markdown>
<a class="md-button md-button--primary" href="../">Open the atlas</a>
[Seven-step map](steps.md){ .md-button }
[Figures](figures.md){ .md-button }
</div>

</div>

<div class="home-split" markdown>

<div markdown>

This wiki is a browsable, living companion to the review *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents*. It follows the review's seven steps and includes its tables, all ten figures and 178 linked references.

Formulation means combining ingredients into products whose properties depend on both composition and process. An autonomous formulation experiment is a physical choreography:

1. ingredients with very different rheology are dosed into one premix container;
2. the container is carried to a mixer;
3. the mix is processed and characterized, often with materials the robot has never handled.

Landmark SDLs show that this physical layer can limit autonomy as much as the planning algorithm does [\[3\]](references.md#ref-3), [\[4\]](references.md#ref-4). The guiding question at every step is **how should this material, in this container, be handled next?**

<span class="mc mc-liquid">Liquids</span> <span class="mc mc-semi-solid">Semi-solids</span> <span class="mc mc-powder">Powders</span> <span class="mc mc-object">Objects</span>

</div>

<figure class="fig" markdown>
![Graphical abstract of the review](assets/graphical_abstract.jpg){ loading=lazy }
<figcaption markdown="span">Graphical abstract.</figcaption>
</figure>

</div>

## The seven steps

<div class="step-cards" markdown>

<a class="step-card" href="materials/dispensing/">
<span class="step-card__num">1</span>
<span class="step-card__name">Dose</span>
<span class="step-card__q">How is each ingredient dosed?</span>
<span class="step-card__more">Materials, dispensing, 20 scenarios, strategies</span>
</a>

<a class="step-card" href="object-handling/robot-classes/">
<span class="step-card__num">2</span>
<span class="step-card__name">Move</span>
<span class="step-card__q">How do containers move?</span>
<span class="step-card__more">Gantries, SCARA, arms, cobots, mobile manipulators</span>
</a>

<a class="step-card" href="hardware/dispensers/">
<span class="step-card__num">3</span>
<span class="step-card__name">Buy</span>
<span class="step-card__q">What can be bought?</span>
<span class="step-card__more">Dispensers and integrated platforms by accuracy and price</span>
</a>

<a class="step-card" href="hardware/retrofits/">
<span class="step-card__num">4</span>
<span class="step-card__name">Extend</span>
<span class="step-card__q">How to go beyond the catalog?</span>
<span class="step-card__more">Retrofits: end-effectors, sensors, control software</span>
</a>

<a class="step-card" href="simulation/">
<span class="step-card__num">5</span>
<span class="step-card__name">Rehearse</span>
<span class="step-card__q">Will the plan work?</span>
<span class="step-card__more">Fidelity hierarchy, simulators, digital twins</span>
</a>

<a class="step-card" href="orchestration/">
<span class="step-card__num">6</span>
<span class="step-card__name">Orchestrate</span>
<span class="step-card__q">How do devices run as one?</span>
<span class="step-card__more">Layers L1–L4, interfaces, eight open-source systems</span>
</a>

<a class="step-card" href="ai/data-and-decisions/">
<span class="step-card__num">7</span>
<span class="step-card__name">Decide</span>
<span class="step-card__q">What to make next?</span>
<span class="step-card__more">Data, surrogates, Bayesian optimization, AI agents</span>
</a>

</div>

## Where to start

| I want to... | Go to |
| --- | --- |
| Understand liquids, gels and powders | [Material Properties](materials/properties.md) · [Material Spectrum](materials/spectrum.md) |
| See which strategy suits my material | [Recurring Strategies](strategies/index.md) · [Literature Scenarios](materials/literature-scenarios.md) |
| Compare commercial dispensers by accuracy and price | [Commercial Dispensers](hardware/dispensers.md) · [Integrated Platforms](hardware/platforms.md) |
| Choose a robot to move premix containers | [Robot Classes](object-handling/robot-classes.md) |
| Extend a liquid handler past its factory spec | [Retrofits](hardware/retrofits.md) |
| Rehearse a workflow before committing material | [Simulation & Digital Twins](simulation/index.md) |
| Pick orchestration software | [Open-Source Orchestration Software](orchestration/open-source.md) |
| Use ML and AI agents safely | [Data & Decision Models](ai/data-and-decisions.md) · [LLMs & AI Agents](ai/agents.md) |
| Understand safety and the outlook | [Safety](outlook/safety.md) · [Future Directions](outlook/future-directions.md) |

## Citation

> **Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents**  
> Mohammad M. Rastegardoost<sup>a,\*</sup>, Zeqing Bao<sup>a</sup>, Sara Sadr<sup>a</sup>, Nasim Abdollahi<sup>a</sup>, Kourosh Darvish<sup>a</sup>, Aaron Clasky<sup>a</sup>, Hiroki Ohsaka<sup>b</sup>, Frantz Le Devedec<sup>a</sup>  
> <sup>a</sup> Acceleration Consortium, University of Toronto, Toronto, ON, Canada · <sup>b</sup> SEKISUI Chemical Co., Ltd., Osaka, Japan  
> <sup>\*</sup> Corresponding author: m.rastegardoost@utoronto.ca  
> Manuscript in preparation, 2026.

```bibtex
@unpublished{rastegardoost2026formulation,
  title  = {Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents},
  author = {Rastegardoost, Mohammad M. and Bao, Zeqing and Sadr, Sara and Abdollahi, Nasim and Darvish, Kourosh and Clasky, Aaron and Ohsaka, Hiroki and Le Devedec, Frantz},
  note   = {Manuscript in preparation},
  year   = {2026}
}
```

This is a living, open-source wiki. See [Contributing](contributing.md) to add case studies, strategies or products, and the [Changelog](changelog.md) for what has changed.
