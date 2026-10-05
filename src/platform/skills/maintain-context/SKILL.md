---
name: maintain-context
description: Add or revise shared context and skills for the Design Studio platform, a module, or an assigned design system.
---

Read [documentation standards](../../context/documentation-standards.md) and [agent context routing](../../core/agent-context.md).

Choose the owner before writing:
- Platform knowledge and cross-module operating tasks belong in `src/platform/context/` and `skills/`.
- Capability knowledge and procedures belong in `src/modules/<id>/context/` and `skills/`. Its README owns technical requirements.
- Product, brand, component usage, and editorial guidance belong in `src/systems/<id>/context/` and `skills/`. Resolve the assigned system for prototype work.

Context includes descriptive knowledge and standing requirements. Identify requirements clearly without inventing facts or personas. Skills describe recognizable tasks, their triggers, needed input, workflow, and verification. A short convention can stay in context; do not create a skill for every principle.

Give context Markdown a frontmatter title. Each skill is `skills/<name>/SKILL.md` with matching lowercase, hyphenated folder and frontmatter name, and a discriminating description. Preserve supporting references, scripts, and assets inside the skill folder. Link shared authoritative material instead of copying it.

Update the owner's entry point and affected callers. Module `instructions` paths are relative to the module. Run `pnpm studio sync` to refresh project exposure after changing skills or availability. Inspect warnings; never overwrite user-authored adapter entries.

Verify links, activation conditions, correct owner and system, and unavailable-module behavior. Follow [maintain-documentation](../maintain-documentation/SKILL.md) for documentation verification. Preserve supplied platform principles and personas; keep team product context in its own system.
