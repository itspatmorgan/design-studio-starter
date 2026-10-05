---
name: write-guide
description: "Create or revise human Guide chapters for Design Studio. Use only when Documentation is enabled; technical contracts stay with their owners."
---

# Documentation

Documentation offers a curated Guide for people; the shared Context and Skills browser displays owner files. The Guide describes capabilities, defaults, and boundaries. Keep agent requirements in owning context and task procedures in skills.

Follow the [documentation standard](../../../../platform/context/documentation-standards.md) and [Maintain documentation skill](../../../../platform/skills/maintain-documentation/SKILL.md).

- Keep technical context with its owner. Shared platform contracts live in platform/context/technical; module READMEs hold capability contracts. The browser displays original files.
- Put all human chapters in `src/modules/documentation/pages/`.
- Organize the Guide around setup, the main app surfaces, and collaboration. Keep it concise for people working with agents.
- Keep human workflows in the Guide. A capability chapter declares `module: <id>` so discovery hides it when the module is disabled or removed.
- Keep one technical contract with each module. Use its README.md for requirements and implementation details; do not expose a second document that repeats the Guide.
- Use frontmatter with `title`, `description`, `order`, and `section`. Set `toc: true` when useful.
- A Guide chapter’s filename supplies its URL slug. Keep established chapter filenames when moving content.
- Write plain Markdown with short sentences. Explain unfamiliar terms on first use.
- Describe the environment without prescribing a team's design process.
- Use visual aids only when they explain a relationship or action more clearly.
- Validate chapter links and anchors after changes. Consider optional-module availability.
- Apply the [contributor scope](../../../../platform/context/contributor-scope.md). Documentation changes are shared.

The sidebar and previous/next links follow enabled chapters automatically. The Documentation module's [README](../../README.md) explains source editing and discovery.
