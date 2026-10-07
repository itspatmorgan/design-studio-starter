---
name: write-guide
description: "Create or revise human Guide chapters for Design Studio. Use only when Documentation is enabled; technical contracts stay with their owners."
---

# Write Guide

Documentation offers a curated Guide for people; the shared Context and Skills browser displays owner files. The Guide describes capabilities, defaults, and boundaries. Keep agent requirements in owning context and task procedures in skills.

Follow the [documentation standard](../../../../platform/context/documentation-standards.md) and the [Guide chapter contract](../../README.md#guide-chapters).

- Put all human chapters in `src/modules/documentation/pages/`.
- Organize the Guide around setup, the main app surfaces, and collaboration. Keep it concise for people working with agents.
- Keep human workflows in the Guide. A capability chapter declares `module: <id>` so discovery hides it when the module is disabled or removed.
- Use the chapter contract's metadata; add a description, section, and contents navigation when useful.
- A Guide chapter’s filename supplies its URL slug. Keep established chapter filenames when moving content.
- Describe the environment without prescribing a team's design process.
- Validate chapter links and anchors after changes. Consider optional-module availability.

The sidebar and previous/next links follow enabled chapters automatically. The Documentation module's [README](../../README.md) explains source editing and discovery.

Inspect the rendered chapter and follow [working context](../../../../platform/context/working-in-studio.md) for shared scope, checks, and saving.
