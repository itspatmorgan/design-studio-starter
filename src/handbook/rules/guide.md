# Guide

The Guide describes capabilities, defaults, and boundaries for people. Keep agent requirements in Rules and task procedures in Skills.

Follow the [documentation standard](../docs/documentation-standards.md) and [Maintain documentation skill](../skills/maintain-documentation/SKILL.md).

- Put platform-wide chapters in `src/platform/modules/guide/pages/`.
- Put a module's human chapter in its README, so removal also removes the chapter.
- For module implementation details, use the README's `## For developers` section or directly linked module references.
- Use frontmatter with `title`, `description`, `order`, and `section`. Set `toc: true` when useful.
- Use `slug` to preserve a README chapter's address when its module ID differs.
- Write plain Markdown with short sentences. Explain unfamiliar terms on first use.
- Describe the environment without prescribing a team's design process.
- Use visual aids only when they explain a relationship or action more clearly.
- Validate chapter links and anchors after changes. Consider optional-module availability.
- Apply the [contributor scope rule](contributor-scope.md). Guide changes are shared.

The sidebar and previous/next links follow enabled chapters automatically. The Guide module's [README](../../platform/modules/guide/README.md) explains source editing and discovery.
