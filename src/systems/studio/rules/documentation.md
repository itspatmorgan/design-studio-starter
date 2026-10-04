# Documentation

Documentation offers a curated Guide for people and full Reference from platform contracts. The Guide describes capabilities, defaults, and boundaries. Keep agent requirements in Rules and task procedures in Skills.

Follow the [documentation standard](documentation-standards.md) and [Maintain documentation skill](../skills/maintain-documentation/SKILL.md).

- Keep Reference content beside the platform code it describes. The shared reader discovers core contracts and enabled modules’ top-level Markdown.
- Put platform-wide chapters in `src/modules/documentation/pages/`.
- Organize the Guide around setup, the main app surfaces, and collaboration. Keep it concise for people working with agents.
- Put a main surface's human chapter in its module README, so removal also removes the chapter. Supporting artifact types can remain in Reference and be introduced together in Prototypes.
- For module implementation details, use the README's `## For developers` section or directly linked module references.
- Use frontmatter with `title`, `description`, `order`, and `section`. Set `toc: true` when useful.
- Use `slug` to preserve a README chapter's address when its module ID differs.
- Write plain Markdown with short sentences. Explain unfamiliar terms on first use.
- Describe the environment without prescribing a team's design process.
- Use visual aids only when they explain a relationship or action more clearly.
- Validate chapter links and anchors after changes. Consider optional-module availability.
- Apply the [contributor scope rule](contributor-scope.md). Documentation changes are shared.

The sidebar and previous/next links follow enabled chapters automatically. The Documentation module's [README](../../../modules/documentation/README.md) explains source editing and discovery.
