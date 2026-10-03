---
title: Documentation standards
description: Where platform context belongs, how to write it, and when to verify and update it.
toc: true
---

Documentation is part of the platform. Keep it accurate as behavior changes. This standard applies to the Guide, module documentation, Handbook content, and agent instructions.

## Choose the authoritative location

| Location | Purpose |
| --- | --- |
| Guide | Explain capabilities, defaults, boundaries, and setup choices to people. |
| Module README | Own the module's Guide chapter and developer orientation. |
| Module reference | Define detailed file, API, configuration, and lifecycle contracts. |
| Handbook Docs | Preserve curated knowledge for people, agents, or both. |
| Handbook Rules | State standing requirements for agent behavior. |
| Handbook Skills | Describe a task-specific procedure and when it applies. |
| `AGENTS.md` | Provide essential project instructions and route agents to relevant context. |

Give each contract one authoritative location. Other documents can summarize its purpose, then link to it. Do not copy requirements, schemas, or procedures into multiple locations.

Code defines implemented behavior. Documentation explains that behavior and the intended constraints. If they disagree, identify whether the implementation or the documentation needs correction.

Keep module details with their module. This lets removal also remove the related documentation. Keep shared standards in the Handbook.

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

Use screenshots only when the interface itself matters and the document location supports them. Include useful text descriptions and keep visuals current.

Follow the [Handbook rule](../rules/handbook.md) for its image convention. A visual aid should clarify the content, not repeat it.

## Update with the platform

Review affected documentation when changing a capability, default, command, configuration field, file format, scope boundary, or setup procedure.

Update its authoritative source and affected summaries in the same change. Check incoming links and agent routing when moving or removing a document.

For an optional module, check guidance with the module enabled, disabled, and removed. Avoid unconditional instructions for optional capabilities.

Before a release, audit the complete documentation set. After a reported misunderstanding or failed agent task, review the relevant guidance.

Fix the demonstrated problem. Do not turn every past failure into a universal rule or add a second source to patch a stale one.

## Verify the result

Use the [Maintain documentation skill](../skills/maintain-documentation/SKILL.md) for the review procedure.

Verify behavior against implementation and current command help. For upstream facts, use current official documentation rather than copied manuals.

Check links, anchors, metadata, and rendered content. For rules and skills, review both requests that should activate them and similar requests that should not.

Build checks validate structure, types, and selected contracts. They do not prove factual accuracy, readable prose, or correct agent decisions.

Report automated checks, manual review, and live behavior testing separately. Keep unresolved questions visible.
