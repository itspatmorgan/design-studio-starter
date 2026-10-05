---
title: Agent context routing
description: Canonical guidance, project skill exposure, system resolution, and validation boundaries.
toc: true
---

Design Studio maintains file-based context and skills. The host discovers skill metadata; the agent reads the selected procedure and its references. Studio does not inject a full context bundle or record conversation reads.

## Find the owner

Every owner starts with its README, followed by Context and Skills. The [platform README](../../README.md) indexes shared knowledge. Its detailed technical documents live in `context/technical/`, while `core/` and `app/` contain implementation. Modules and systems keep their own README, context, and relevant skills. A skill is optional when no distinct task procedure is needed.

The Documentation surface offers Guide and Context and Skills. The latter reads original owner files at `/documentation/context/<owner>`. Systems pages link to that same reader; they do not maintain a second context tree. Legacy Reference, Knowledge, and system-content URLs redirect while preserving source mode and anchors.

## Entry and platform baseline

Root `AGENTS.md` routes to [working context](../working-in-studio.md). Essential requirements cover preservation, contributor scope, assignment, enabled capabilities, and verification. Full [Principles](../principles.md) and [Personas](../personas.md) apply to platform product and architecture decisions. Studio interface work follows its system entry point and writing context.

[Responsibilities](contracts-and-instructions.md) defines canonical ownership. Enabled modules declare optional task routes through module-relative `instructions: [{ path, when }]`. `pnpm studio sync` refreshes the root `studio:modules` block and native project skill exposure. Adding, removing, and configuring capabilities invokes synchronization; development startup also synchronizes. A build validates sources without rewriting adapters.

## Resolve a prototype's system

| Metadata | Resolved system |
| --- | --- |
| `system: "<id>"` | The registered prototype system. |
| `system: null` | No system; use local components and styling. |
| Assignment omitted | The configured default. |

Read the assigned system's entry point and relevant context and skills. A duplicate with pending `rebuild` also needs its target system's guidance. Preserve the original and migrate implementation and assignment together. The current assignment remains the runtime boundary until migration completes.

The browser's selected system does not change prototype assignment or conversation context. Exposing a system skill does not make it applicable to every prototype.

## Native project skills

Canonical sources remain under platform, module, and system `skills/` folders. Synchronization inventories platform skills, enabled module skills, and registered system skills, validates metadata, and emits uniquely named project entry points.

- Codex and Cursor discover generated entries under `.agents/skills/`.
- Claude Code discovers `.claude/skills/` links to those same entries. A newly created `CLAUDE.md` routes to root instructions; existing user files are preserved.
- Each entry links to its canonical procedure, which owns supporting resources. System entries require correct assignment or explicit system maintenance; module entries require enabled capabilities.

The generated receipt `.agents/studio-skills.json` tracks exact managed contents. Sync preserves unrelated and modified entries and reports collisions. Obsolete unmodified entries are removed when capabilities disappear. Do not edit generated entries; edit their canonical skill and synchronize. Cursor can also discover Claude-compatible directories; its actual selector behavior must be checked in the installed host.

Local project exposure does not require a global plugin. The Design Studio plugin supplies create, open, and use entry points; operation uses the target repository's current procedures. Plugin installation and host permissions remain separate from project skill discovery.

Host conventions: [Codex skills](https://learn.chatgpt.com/docs/build-skills), [Claude Code skills](https://code.claude.com/docs/en/skills), [Cursor skills](https://cursor.com/docs/skills).

## Inspect and validate

The generated manifest's `systemContent` includes Context and Skills for platform, enabled modules, and registered systems, with explicit owner metadata. `skillCatalog` lists canonical sources, descriptions, and exposed names. `systemContentMaps` inventories context routes and skills for each owner. These are diagnostics, not evidence of actual agent reads or native registration success.

Build checks validate metadata, reachable local links, source structures, registration, and runtime boundaries. Missing targets fail strict builds. Test real requests and resulting artifacts to verify activation, system selection, disabled capabilities, and outcomes. Saved links to moved Studio guidance and renamed module contracts redirect to their canonical readers. A routing walkthrough or automated adapter test does not establish live behavior in every harness.
