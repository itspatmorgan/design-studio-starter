---
referenceSection: understand
title: Responsibilities
description: Ownership of platform, module, and system context and skills.
referenceOrder: 5
toc: true
---

Design Studio has two kinds of agent guidance: context and skills. Both belong to the capability or domain they describe.

## Choose the system of record

| Owner | Context | Skills |
| --- | --- | --- |
| Platform | Design Studio principles, personas, shared working requirements, and core technical documents. | Cross-module tasks such as configuring a studio, contributor setup, module management, and documentation maintenance. |
| Module | Capability knowledge and the module README's authoritative technical requirements. | Tasks using or maintaining that capability. |
| System | Product, brand, audience, design, component usage, and writing conventions. | Domain-specific tasks for that system. |

Context can describe facts, rationale, or standing requirements. Label requirements clearly; a context document is not necessarily optional advice. Skills define task triggers, required input, procedures, supporting resources, and completion criteria. Keep short relevant constraints in the skill when they do not need an independent shared document.

Root `AGENTS.md` supplies essential operating requirements and routes. System entry points select relevant product guidance. The Guide explains the environment to people; Reference presents technical documents from their original files. Neither surface creates another authoritative copy.

## Technical requirements

Each module has one canonical `README.md`. Core documents stay beside `src/platform/core/`. These documents are technical context, including valid structures, supported interfaces, and compatibility requirements. Split a substantial specialized subject only when it needs its own maintained source and link it from the README.

Skills consult these documents without copying schemas or dependency matrices. Code and checks implement and enforce selected requirements; successful checks cannot prove that an agent read or understood guidance.

## Change the owner, then its consumers

Update implementation, authoritative technical context, affected skills, and Guide explanations together. A product convention cannot relax runtime, scope, or source-access boundaries.

Platform guidance lives in `src/platform/context/` and `skills/`. Module guidance lives beside its implementation. Studio's own system retains application design guidance and its interface toolkit; it does not own platform operating procedures.

Run `pnpm studio sync` after changing skill metadata or capability availability. It refreshes task routes and generated project skill adapters. Follow [agent context routing](agent-context.md) for discovery and system resolution, and [maintain-documentation](../skills/maintain-documentation/SKILL.md) for verification.
