# System content

Read the [Systems contract](../../../modules/systems/reference.md) and follow the [documentation standard](documentation-standards.md).

- Keep platform context, rules, and skills in `src/systems/studio/context/`, `rules/`, and `skills/`.
- Keep product-system content in `src/systems/<id>/context/`, `rules/`, and `skills/`. Use the prototype's assigned system; do not assume the current default applies to existing work.
- Preserve the supplied Design Studio principles and personas as platform context. Put the team's product principles and personas in its own system.
- Context stores shared knowledge. Rules state standing constraints. Skills describe procedures and their task triggers.
- Give each contract one authoritative location. Keep implementation contracts beside their modules and link to them.
- Give Context Markdown a frontmatter title. Context and Rules may contain folders.
- Keep each skill in `skills/<name>/SKILL.md`, with supporting files inside its folder. Use lowercase letters, digits, and single hyphens, up to 64 characters; match the folder and frontmatter name.
- Include `name` and `description` in skill frontmatter. Keep procedures focused and link to substantial references.
- Route the agent through the owning system's `AGENTS.md`. The repository instructions route platform tasks and require resolving the assigned system for prototype work. Visibility in Systems is not evidence that an agent read a file.
- Product rules add conventions; they cannot relax platform scope, dependency, or file-access boundaries.
- System content is shared. Apply the [contributor scope rule](contributor-scope.md).
- Update affected guidance when platform behavior changes. Verify links and instruction routing after moving files.
