# Handbook

The Handbook (`src/handbook/`) is the team's context and instructions: docs, rules, and skills. The app shows it under Handbook. Read this before adding or changing anything in it. Human docs: the Guide's Handbook page (`src/studio/guide/handbook.md`).

- **It's platform.** Describe the change and ask the person before making it. Anyone can make it on a branch and open a pull request; the maintainer decides what merges.
- **Its shape is fixed; what's inside is open.** Only `docs/`, `rules/`, and `skills/` sit at the top. `pnpm dev` warns, and `pnpm build` fails, on a file or folder out of place.
- **`docs/`** is Markdown pages for people and agents: principles, personas, research notes. Folders are fine. Give each page a `title` in its frontmatter.
- **`rules/`** is Markdown files of standing instructions, each short and about one thing. If a rule should be read every session, or when a certain task comes up, add one line to `AGENTS.md` saying so. `AGENTS.md` only routes: keep the detail in the rule.
- **`skills/<name>/SKILL.md`** is one folder per skill, in the [Agent Skills format](https://agentskills.io/specification). The frontmatter has two required fields:
  - `name`: the same as the folder's name. Lowercase letters, numbers, and single hyphens, up to 64 characters.
  - `description`: what the skill does and when to use it, up to 1024 characters. Agents read only this to decide whether to use the skill, so include the words a person would use to ask for it.
- **Inside a skill** the structure is free. Put steps in `SKILL.md` (under about 500 lines) and the detail in files beside it, like `scripts/`, `references/`, and `assets/`, linked with relative paths from `SKILL.md`. Nothing sits loose in `skills/`.
- **Renaming a skill** means renaming its folder and its `name` together. The app does both when you rename the folder there.
- **Links** between Handbook pages are relative: `[the scope rule](contributor-scope.md)`.
- **No images.** Describe them, or link to the live view.
