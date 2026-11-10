# Changelog

## 2026-11-08: assemblab Learn

The wiki is now **assemblab Learn**, the knowledge base of [assemblab](https://mahdi-rstgr.github.io/formulation-sdl-atlas/), a platform for designing self-driving labs from every maker's parts.

- The header links back to the platform: home, parts library, self-driving layer, atlas and the design tool.
- The interactive atlas moved to [`/atlas/`](https://mahdi-rstgr.github.io/formulation-sdl-atlas/atlas/) and the Lab Builder to [`/new-design/`](https://mahdi-rstgr.github.io/formulation-sdl-atlas/new-design/). Old `/builder/` links redirect.
- Colours follow the platform: a black header and beet accents (deep beetroot in light mode, vibrant beet in dark mode).
- The content is unchanged.

## 2026-11-07 (second update): All figures and a new interface

### Figures

- **All ten figures are now shown,** each with its full V3 caption (citations linked):
    - **Figure 2** on [Material Properties](materials/properties.md) and [Dispensing by Material Class](materials/dispensing.md);
    - **Figure 5** on [Commercial Dispensers](hardware/dispensers.md), [Integrated Platforms](hardware/platforms.md) and [By Yield Stress & Cost](hardware/cost-accuracy.md);
    - **Figure 6** on [Simulation & Digital Twins](simulation/index.md#the-fidelity-hierarchy).
- The notes saying Figures 2, 5 and 6 were omitted have been removed. Their captions credit the third-party photographs, screenshots and logos they contain.
- New **[Figures](figures.md)** gallery listing all ten figures, with captions and links to the pages that discuss each.
- Click any figure to enlarge it (glightbox).

### Interface

- The visual identity now matches the [interactive atlas](https://mahdi-rstgr.github.io/formulation-sdl-atlas/):
    - fonts: Bricolage Grotesque (headings), IBM Plex Sans (body) and IBM Plex Mono (code);
    - colours: an ink-navy header and an accent blue that lightens in dark mode;
    - material-class badges for <span class="mc mc-liquid">liquid</span> <span class="mc mc-semi-solid">semi-solid</span> <span class="mc mc-powder">powder</span> <span class="mc mc-object">object</span>.
- Top tabs follow the seven steps, plus Outlook and Reference tabs, with instant page loading.
- A "Back to atlas" button sits in the header. The footer carries the citation and a repository link.
- New landing page: a hero section with buttons, the graphical abstract, cards for the seven steps, and the citation.
- Tables have sticky headers, zebra rows, horizontal scrolling and tabular numbers.
- Figures are shown as cards. Admonitions use the site palette.

## 2026-11-07: Rebuilt and updated to manuscript V3

The wiki was rebuilt as part of the [formulation-sdl-atlas](https://github.com/mahdi-rstgr/formulation-sdl-atlas) repository. It was updated to the final V3 manuscript, *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents* (Rastegardoost, Bao, Sadr, Abdollahi, Darvish, Clasky, Ohsaka, Le Devedec; manuscript in preparation, 2026).

The earlier wiki was published at <https://accelerationconsortium.github.io/material-handling/> and was written from an older draft. Its pages were reconstructed from the published site and kept in the same navigation groups.

### Added

- **[Seven-step map](steps.md):** the review's organizing frame (Dose, Move, Buy, Extend, Rehearse, Orchestrate, Decide), with Figure 1.
- **[Dispensing by Material Class](materials/dispensing.md):** Section 2 and Table 1.
- **[Literature Scenarios](materials/literature-scenarios.md):** the 20 sense–act scenarios of Figure 3, mapped to the recurring strategies.
- **[Robot Classes for Object Handling](object-handling/robot-classes.md):** Section 3, Table 2 and Figure 4.
- **[Commercial Dispensers](hardware/dispensers.md):** Section 4.1 and Table 3.
- **[Integrated Platforms](hardware/platforms.md):** Section 4.2 and Table 4.
- **[Retrofits Beyond Factory Spec](hardware/retrofits.md):** Section 5 and Table 5.
- **[Simulation & Digital Twins](simulation/index.md):** Section 6, the fidelity hierarchy and Figure 7.
- **[Simulation Tools](simulation/tools.md):** Table 6.
- **[System Architecture & Orchestration](orchestration/index.md):** Sections 7.1 and 7.3, and Figure 8.
- **[Open-Source Orchestration Software](orchestration/open-source.md):** Section 7.2 and Supplementary Table S1.
- **[Data & Decision Models](ai/data-and-decisions.md):** Sections 8.1–8.2 and Figure 9.
- **[LLMs & AI Agents](ai/agents.md):** Section 8.3 and Table 7.
- **This changelog.**

### Updated

- **[Home](index.md):**
    - new title and full 8-author citation (manuscript in preparation, 2026), replacing the earlier placeholder citation;
    - seven-step map;
    - graphical abstract;
    - link to the <a href="../../atlas/">interactive atlas</a>.
- **[References](references.md):** rebuilt with all 178 references of the review, each with an anchor (`#ref-1` … `#ref-178`). Citations of the form [n] across the wiki link to them.
- **Material Properties, Material Spectrum, the seven strategy pages, the AI Infrastructure pages, and Safety and Future Directions:**
    - added a box summarizing the corresponding V3 content, with citations;
    - replaced the placeholder self-citations ("Rastegardoost et al. (2026)" with assumed journals) with the review citation and key reference numbers.
- **Commercial Hardware ([overview](hardware/index.md), [by material](hardware/by-material.md), [cost vs. accuracy](hardware/cost-accuracy.md)):**
    - vendor tables and named-product accuracy and price figures replaced by the review's sourced values (Tables 2–4);
    - the remaining estimates are marked as illustrative.
- **[Future Directions](outlook/future-directions.md):** added the review's three lessons and four directions.
- **[Glossary](glossary.md):** added terms for formulation SDLs, simulation, orchestration and AI agents.
- **[Contributing](contributing.md):** updated repository links, local build instructions and citation conventions.

### Removed or corrected

- Four "further reading" entries that could not be verified were removed. Two entries with wrong bibliographic details were corrected: Silver et al. 2016 and Jumper et al. 2021.
- Figures were not copied from the earlier site. Figures 2, 5 and 6 of the review are not reproduced because they contain third-party product photographs or logos.
