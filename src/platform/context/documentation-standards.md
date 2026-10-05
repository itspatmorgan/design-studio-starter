---
title: Documentation standards
description: Where platform context belongs, how to write it, and when to verify and update it.
toc: true
---

Documentation is part of the platform. Keep it accurate as behavior changes. This standard applies to the Guide, module documentation, system content, and agent instructions.

## Choose the authoritative location

| Location | Purpose |
| --- | --- |
| Guide | Explain capabilities, defaults, boundaries, and setup choices to people. |
| Owner README | Introduce the owner and index its context and skills; a module README holds its main technical contract. |
| Context | Preserve knowledge, intent, and standing requirements under its platform, module, or system owner. |
| Skills | Describe a task-specific procedure and when it applies. |
| `AGENTS.md` | Provide essential project instructions and route agents to relevant context. |

Documentation has two reading choices: Guide provides a curated introduction, and Context and Skills displays original platform and module files. Systems exposes system context and skills alongside its toolkit. Human chapters live only in `src/modules/documentation/pages/`. Platform, module, and system context preserve knowledge under their respective owners. Context and Skills access remains available when the optional Documentation module is disabled.

The [Responsibilities](technical/contracts-and-instructions.md) foundation defines the system of record: context includes technical contracts, knowledge, and standing requirements; skills own procedures.

Give each contract one authoritative location. Other documents can summarize its purpose, then link to it. Do not copy requirements, schemas, or procedures into multiple locations.

Organize the Guide around the main app surfaces. Introduce essential concepts and everyday capabilities for people working with agents. Keep detailed commands, file contracts, and troubleshooting in technical context. A supporting module does not need a separate Guide chapter.

Code defines implemented behavior. Documentation explains that behavior and the intended constraints. If they disagree, identify whether the implementation or the documentation needs correction.

Keep technical contracts with their module. Associate its Guide chapter through `module: <id>` so disabling or removal hides the human chapter without relocating its source. Keep shared standards in platform context.

File-backed navigation follows the [shared source workflow](technical/source.md). Expose source editing through navigation and the common keyboard toggle. Keep source-file mappings explicit for generated pages or pages backed by several files.

## Write clearly

Use ASD-STE100-inspired language with flexibility for our [personas](personas.md). This is a writing approach, not a claim of formal compliance.

- Use familiar words and active voice. Address the reader directly when giving instructions.
- Keep one main idea in each sentence. Aim for 20 words in instructions and 25 words in descriptions; split longer sentences when useful.
- Use one term for one concept. Match labels, commands, paths, and configuration keys exactly.
- State a condition before its action: “If Canvases is disabled, skip canvas verification.”
- Use numbered steps when order matters. Use bullets for independent requirements or options.
- Distinguish requirements from recommendations, defaults, and examples. Use “must” only for a requirement.
- Define unfamiliar terms on first use. Include technical details only when the audience needs them.
- Describe what the environment provides. Leave each team free to choose its design process.
- State assumptions, limitations, and missing input. Do not present planned capabilities as available features.

Agent instructions should be direct and task-specific. Keep skill descriptions precise enough to select the right task. Put substantial conditional details in linked references.

## Use visual aids deliberately

Use a table for comparisons or mappings. Use a diagram when relationships or sequence are difficult to explain in text.

Use fenced `mermaid` blocks for diagrams in platform Markdown. The shared reader renders them in the Guide, system context, owner overviews, and prototype Documents. Include `accTitle` and `accDescr` for accessible descriptions. Keep the text in the document so people and agents can review and revise it.

Use screenshots only when the interface itself matters and the document location supports them. Include useful text descriptions and keep visuals current.

Follow the [maintain-context skill](../skills/maintain-context/SKILL.md) for its image convention. A visual aid should clarify the content, not repeat it.

## Update with the platform

Review affected documentation when changing a capability, default, command, configuration field, file format, scope boundary, or setup procedure.

Update its authoritative source and affected summaries in the same change. Check incoming links and agent routing when moving or removing a document.

For an optional module, check guidance with the module enabled, disabled, and removed. Avoid unconditional instructions for optional capabilities.

Before a release, audit the complete documentation set. After a reported misunderstanding or failed agent task, review the relevant guidance.

Fix the demonstrated problem. Do not turn every past failure into a universal rule or add a second source to patch a stale one.

## Verify the result

Use the [Maintain documentation skill](../skills/maintain-documentation/SKILL.md) for the review procedure.

Verify behavior against implementation and current command help. For upstream facts, use current official documentation rather than copied manuals.

Check links, anchors, metadata, and rendered content. For skills, review requests that should activate them and similar requests that should not. Check that standing context routes apply to the intended scope.

Build checks validate structure, types, and selected contracts. They do not prove factual accuracy, readable prose, or correct agent decisions.

Report automated checks, manual review, and live behavior testing separately. Keep unresolved questions visible.
