---
title: Agent context contract
description: File-based instruction routing, system resolution, and validation boundaries.
toc: true
---

Design Studio routes coding agents through repository files. It does not assemble or inject a context bundle into an agent conversation. The coding agent's host controls automatic instruction discovery; the agent follows linked instructions by reading files.

## Entry and platform baseline

The repository's `AGENTS.md` is the entry point. It routes every session to the Studio system's prototype workflow and contributor scope rules. These operating rules apply to platform and prototype work.

Task conditions route to additional rules and skills. Working on Studio also requires its system entry point, Principles, and Personas. Product instructions do not replace platform operating rules.

Enabled module declarations supply conditional instructions through their `instructions` entries. `agentsBlock` in `modules/pack.ts` generates the root `studio:modules` block. The Studio CLI synchronizes that block when it changes module registration or availability. After manually editing module configuration, run `pnpm studio sync`. A build does not synchronize this block.

Module instructions are routes with task conditions. They do not load every enabled module's instructions into every conversation.

## Resolve a prototype's system

Resolve the target prototype from its metadata and studio configuration before editing it:

| Metadata | Resolved system |
| --- | --- |
| `system: "<id>"` | That registered prototype system. |
| `system: null` | No assigned system. Do not substitute the default. |
| `system` omitted | `studio.config.ts`'s `defaultSystem`. |

For a named system, read `src/systems/<id>/AGENTS.md` when present. Read the relevant context, rules, and skills it references. Inspect skill names and descriptions before reading applicable `SKILL.md` procedures and supporting files. Keep unrelated systems' product instructions out of the task.

For no assigned system, use prototype-local components and styling under the prototype contract. Platform operating instructions still apply. Local intent and user-supplied requirements remain relevant in either case.

A duplicate with a pending `rebuild` request also requires the target system instructions. Its current assignment remains authoritative for runtime boundaries until implementation and metadata are migrated together. Follow the [prototype workflow](../../systems/studio/rules/prototype-workflow.md) for that transition.

An explicit assignment is stable when the default changes. An omitted assignment follows the current default. The Systems selector changes the browser's selected system; it does not change a prototype assignment or an agent's conversation context.

## Author system instructions

Use the system entry point to link essential context and explain when rules and skills apply. A file's presence in the navigation tree does not establish that an agent read it. A skill's frontmatter describes its selection conditions; system skills are not automatically registered with every coding agent host.

Follow the [system content rule](../../systems/studio/rules/system-content.md) for layout and authoring. Skills preserve their specified filesystem structure, including references, scripts, and assets. Read supporting material as the applicable procedure requires it.

## Diagnostic map and validation

The manifest build creates each system's diagnostic instruction map. For the declared application system, it combines root and local entry points. Other systems use only their own entry point. Links are resolved relative to the file that owns them before entry points are combined.

The map reports declared rule routes, transitive rule links, unrouted rules, and skill descriptions and direct selection conditions. It is an inventory, not an instruction executor, conversation bundle, or record of actual reads. Context is available in the system inventory; the rule/skill routing map does not list every context read.

The manifest also follows local links reachable from the entry points within that system. It checks context, rules, skills, and their linked supporting files for missing targets, with cycle protection. Strict builds fail on missing targets. Unlinked material is not proved reachable by this check. Code examples, URL links, anchors, and contracts outside the selected system need their own documentation checks.

Build validation separately enforces system registration and runtime dependency boundaries. It cannot prove that an agent selected or read the right instructions, understood them, or followed them. Verify those decisions through task walkthroughs and, when needed, authorized live agent testing.
