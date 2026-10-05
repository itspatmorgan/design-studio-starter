---
referenceSection: understand
title: Agent context routing
description: File-based instruction routing, system resolution, and validation boundaries.
referenceOrder: 6
toc: true
---

Design Studio routes coding agents through repository files. It does not assemble or inject a context bundle into an agent conversation. The coding agent's host controls automatic instruction discovery; the agent follows linked instructions by reading files.

The [Platform and system responsibilities](contracts-and-instructions.md) page explains which files own technical requirements, operating policy, intent, and procedures. This contract owns how those files are routed to a task. When the Guide is enabled, its [Agent context chapter](/documentation/guide/agent-context) diagrams the reading flow.

## Entry and platform baseline

The repository's `AGENTS.md` is the entry point. It routes every session to the Studio system's prototype workflow and contributor scope rules. These operating rules apply to platform and prototype work.

Task conditions route to additional rules and skills. Working on Studio also requires its system entry point, Principles, and Personas. Product instructions do not replace platform operating rules.

The Studio entry point owns the routes to Principles and Personas. Root instructions link to that entry point without repeating those context routes. The repository's [operating instructions](../../../AGENTS.md) also define reuse of available instruction text and handling of verbose check logs. These are agent practices; Studio does not cache conversation context or truncate tool output itself.

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

## Inspect the diagnostic map

Run `pnpm dev` to regenerate the local manifest, then inspect `public/prototypes/manifest.json`. Its `systemContentMaps` object contains one entry per registered system. This is a generated diagnostic file; do not edit it.

- `always`: declared rules for every session.
- `onDemand`: rules and their task conditions.
- `via`: rules reached through another rule.
- `unrouted`: rules with no discovered route.
- `skills`: skill descriptions and declared conditions.
- `missing`: unresolved local instruction targets, including context and skill supporting files.

Compare the target prototype’s resolved system with the entry for that system. The Studio entry also includes repository-level routes. Context files are listed separately under `systemContent`. For a specific task, ask the agent which files it actually read; the map cannot supply that answer.

## Validation boundaries

The manifest build creates each system's diagnostic instruction map. For the declared application system, it combines root and local entry points. Other systems use only their own entry point. Links are resolved relative to the file that owns them before entry points are combined.

The map inventories declared routes. It is not an instruction executor, conversation bundle, or record of actual reads.

The manifest also follows local links reachable from the entry points within that system. It checks context, rules, skills, and their linked supporting files for missing targets, with cycle protection. Strict builds fail on missing targets. Unlinked material is not proved reachable by this check. Code examples, URL links, anchors, and contracts outside the selected system need their own documentation checks.

Build validation separately enforces system registration and runtime dependency boundaries. It cannot prove that an agent selected or read the right instructions, understood them, or followed them. Verify those decisions through task walkthroughs and, when needed, authorized live agent testing.
