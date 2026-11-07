# LLMs & AI Agents

!!! abstract "Step 7 · Decide"

    This page summarizes Section 8.3 and Table 7 of the review. It supersedes the agent discussion on the earlier [Digital Twins & LLMs](digital-twins.md) page where the two differ.

## From models to agents

Large language models (LLMs) extend decision making from numbers to text and code. Through application programming interfaces (APIs), models such as GPT-4 [\[138\]](../references.md#ref-138) and Claude [\[139\]](../references.md#ref-139) can:

- draft hypotheses from the literature and from a laboratory's own results;
- organize scattered information into structured records;
- turn a formulation goal into a sequence of operations;
- support multi-step planning across instruments, databases and calculation tools.

Such agents have planned and run chemical experiments on robots [\[125\]](../references.md#ref-125), [\[127\]](../references.md#ref-127), been assessed for chemistry robotics [\[126\]](../references.md#ref-126) and coordinated multiple robots and instruments [\[140\]](../references.md#ref-140), [\[141\]](../references.md#ref-141), [\[142\]](../references.md#ref-142).

On its own, an LLM produces text. An **agentic system** wraps the LLM in a loop:

1. plan;
2. call tools such as instrument APIs, databases and simulators;
3. observe the results;
4. revise the plan.

Coscientist [\[125\]](../references.md#ref-125) and ChemCrow [\[127\]](../references.md#ref-127) work this way. For formulation, the most immediate value is in **bridging a scientist's intent and an executable protocol**, and in explaining what was done and why. Agent outputs still have to be checked before they reach hardware [\[129\]](../references.md#ref-129), [\[130\]](../references.md#ref-130), which is the job the [digital twin](../simulation/index.md#a-layered-architecture-and-the-verification-gate) already does.

## Agents built for SDLs

| Agent | What it does |
| --- | --- |
| **ORGANA** | Works with chemists to derive experiment goals, resolves ambiguities and keeps experiment logs while planning and running robotic chemistry with visual feedback [\[172\]](../references.md#ref-172). |
| **ChemAgents** | Coordinates role-specific agents for literature reading, experiment design, computation and robot operation around a robotic AI chemist [\[175\]](../references.md#ref-175). |
| **LLM-RDF** | Assigns specialized agents to literature search, experiment design, hardware execution, spectrum analysis and result interpretation, for end-to-end synthesis development [\[176\]](../references.md#ref-176). |
| **AILA** | Automates atomic force microscopy. It comes with a benchmark of the whole workflow, from experimental design to analysis, that shows where current models still fail [\[177\]](../references.md#ref-177). |
| **CRESt** | Couples multimodal models and natural-language interaction with robotic synthesis and characterization to discover multi-element electrocatalysts [\[178\]](../references.md#ref-178). |
| **El Agente** | Generates and runs quantum-chemistry workflows from natural-language requests (computational) [\[173\]](../references.md#ref-173). |
| **La Agente Óptima** | Builds and supervises Bayesian optimization campaigns, keeping LLM reasoning separate from the loop that actually runs. In a closed-loop contact-angle campaign it caught and corrected a mid-run measurement failure. It also concluded that the target could not be reached with the available reagents and recommended a change of formulation [\[174\]](../references.md#ref-174). This is the closest example to formulation. |

## Agent roles in a formulation SDL

Inside a formulation SDL, agents are most useful as **assistants** to the people and deterministic components that already own each decision:

- **Campaign designer.** Turns a scientist's goal into a draft campaign (ingredients, bounds, objectives and budget). It runs a dry run of the process plan to check that each seed formulation can be made on the cell before a person approves it.
- **Laboratory copilot.** Explains what the cell is doing, why a formulation was rejected or why a motion failed validation.
- **Recovery advisor.** After a fault, gathers device states, action logs and events and ranks recovery options for the operator.
- **Results analyst.** Explains why the optimizer chose each candidate and drafts reports.
- **Knowledge assistant.** Answers questions from standard operating procedures, device manuals and safety data sheets, with citations.

Each agent acts only through tools that the [orchestration layer](../orchestration/index.md) exposes, for example as MCP servers [\[171\]](../references.md#ref-171), and only with the permissions of the person it serves.

### Table 7: Agent roles in a formulation SDL

| Agent | Assists | Example tasks | Autonomy | Human checkpoint | SDL examples |
| --- | --- | --- | --- | --- | --- |
| Campaign designer | Scientist | Goal to draft campaign; dry-run checks of seed formulations | Draft; submit only in approved campaigns | Scientist approves campaign and runs | La Agente Óptima [\[174\]](../references.md#ref-174); ChemAgents [\[175\]](../references.md#ref-175) |
| Laboratory copilot | Scientist, operator | Explains status, rejections and validation verdicts | Inform | None (read-only) | ORGANA [\[172\]](../references.md#ref-172); CRESt [\[178\]](../references.md#ref-178) |
| Recovery advisor | Operator | Gathers fault context; ranks recovery options | Draft | Operator decides the recovery | La Agente Óptima [\[174\]](../references.md#ref-174) |
| Results analyst | Scientist, engineer | Explains proposals; sandboxed analysis; report drafts | Act digitally | Author reviews reports | LLM-RDF [\[176\]](../references.md#ref-176); AILA [\[177\]](../references.md#ref-177) |
| Knowledge assistant | Everyone | Cited answers from SOPs, manuals and safety data sheets | Inform | None (read-only) | Coscientist [\[125\]](../references.md#ref-125); ChemCrow [\[127\]](../references.md#ref-127) |

## Levels of autonomy and safeguards

Autonomy is best granted in levels:

1. **Informing:** read and explain.
2. **Drafting:** make proposals that a person must accept.
3. **Acting digitally:** dry runs, simulation and sandboxed analysis.
4. **Submitting experiments,** at most, and only inside a campaign a scientist has approved.

Even at the top level, submissions remain subject to the twin's rehearsal and the execution checks of the orchestration software.

!!! warning "Safety by construction, not by instruction"

    If no tool exists for device commands, arming the cell, editing safety configuration or approving runs, then a prompt injection or a model error can at worst produce a draft, which a person and the deterministic checks will reject.

Two further safeguards matter for formulation data:

- **Route model calls by data class.** Confidential formulations and results should only reach self-hosted or institutionally approved models.
- **Evaluate every change.** Any change to a prompt, tool or model should pass fixed evaluation suites before deployment: campaign design, tool use, grounded answers, fault recovery and red-team tests. Each agent run should be recorded alongside the experiments it touched.

See also [Safety in Autonomous Material Handling](../outlook/safety.md).
