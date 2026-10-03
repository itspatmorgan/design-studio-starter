# Handbook

Read the [Handbook README](../../platform/modules/handbook/README.md) for the human-facing content model.

- Keep shared knowledge in Docs, standing agent requirements in Rules, and task-specific procedures in Skills.
- Give each contract one authoritative location. Link to it instead of maintaining a second procedure or requirement.
- Keep module implementation contracts with their modules.
- Apply the [contributor scope rule](contributor-scope.md). Handbook content is shared.
- Keep only `docs/`, `rules/`, and `skills/` at the Handbook root.
- Give Docs a frontmatter title. Docs and Rules may contain folders.
- Keep each skill in `skills/<name>/SKILL.md`. Supporting files stay inside that skill's folder.
- Use lowercase letters, digits, and single hyphens in skill names, up to 64 characters. Match the folder name.
- Include `name` and `description` in skill frontmatter. Describe the capability and its trigger concisely.
- Keep skill instructions focused. Link directly to substantial references needed for the task.
- Use short sentences, consistent terms, conditions first, and numbered steps when order matters.
- Add appropriate `AGENTS.md` routing for context the agent needs. Retain essential project instructions there without repeating detailed rules.
- Use relative Markdown links between Handbook files. Do not add images under the starter Handbook convention.

The build validates structure and agent links. It does not assess factual accuracy or skill behavior.
