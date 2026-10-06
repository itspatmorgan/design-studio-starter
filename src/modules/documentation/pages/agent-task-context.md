---
title: Task context
description: How the agent chooses platform, module, and assigned-system guidance.
section: Agents
order: 7
toc: true
---

For prototype work, the prototype's assignment selects product guidance. The browser's selected system does not set the assignment or load context into the conversation.

```mermaid
flowchart TD
  accTitle: Selecting guidance for a prototype task
  accDescr: A prototype task uses repository working requirements, contributor and assignment resolution, a relevant enabled module skill, and the assigned system's guidance before implementation and verification.
  request[Request: build a checkout prototype] --> baseline[Repository instructions and working requirements]
  baseline --> resolve[Resolve contributor and prototype assignment]
  resolve --> capability[Relevant enabled module skill: Build Prototype]
  resolve --> domain[Assigned system entry point and relevant context]
  capability --> work[Implement and verify the requested prototype]
  domain --> work
```

## Assignment selects the system

| Prototype assignment | Product guidance |
| --- | --- |
| An explicit system ID | That registered system. |
| Explicit None (`system: null`) | Local components and styling; no assigned system. |
| Assignment omitted | The configured default system. |

For example, a Marketing prototype uses the Prototypes module's skill alongside Marketing context. Product system guidance does not apply merely because it exists in the repository. A pending rebuild also needs the target system's guidance while preserving the original exploration.

## Other tasks

Other tasks select different sources. Changing Studio's interface uses platform guidance and the Studio system. Adding a brand-writing skill belongs to that brand's system. Platform principles and personas apply to platform product and architecture decisions, not as substitutes for your product's audience.
