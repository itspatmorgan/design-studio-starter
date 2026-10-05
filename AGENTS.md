# Design Studio Starter

For a new studio or first-time kit configuration, follow [src/systems/studio/skills/initialize-studio/SKILL.md](src/systems/studio/skills/initialize-studio/SKILL.md). For someone joining an existing studio, follow [src/systems/studio/skills/setup-contributor/SKILL.md](src/systems/studio/skills/setup-contributor/SKILL.md). Missing dependencies alone do not mean the studio needs initialization.
When setting up or replacing the prototype design system, follow [src/systems/studio/skills/setup-design-system/SKILL.md](src/systems/studio/skills/setup-design-system/SKILL.md).

When working on Design Studio itself, read [Studio system instructions](src/systems/studio/AGENTS.md). That entry point requires the platform's Principles and Personas and selects further Studio instructions.

At the start of every session, read:
- [src/systems/studio/rules/prototype-workflow.md](src/systems/studio/rules/prototype-workflow.md)
- [src/systems/studio/rules/contributor-scope.md](src/systems/studio/rules/contributor-scope.md)

Within a conversation, reuse instructions already read while their contents remain available and unchanged. Retrieve missing or stale instructions after compaction or file changes, and follow additional routes when the task scope changes. Keep all required reads and re-read source files before editing them.

Use targeted searches and bounded source reads for discovery. Read applicable rules and skill procedures in full; follow their required references. Save verbose check output to a local temporary log. Wait for the command's final exit status, inspect failure diagnostics and warnings, and report a concise result with the relevant details and log path. Run all required checks.

When the person wants to set a prototype or view aside, or keep it out of the deployed site, read [src/systems/studio/rules/archiving.md](src/systems/studio/rules/archiving.md).
When the person asks to add or change system context, rules, or skills, read [src/systems/studio/rules/system-content.md](src/systems/studio/rules/system-content.md).
For documentation creation, revision, or audits, follow [src/systems/studio/skills/maintain-documentation/SKILL.md](src/systems/studio/skills/maintain-documentation/SKILL.md). When platform behavior changes, update affected guidance in the same change.
When the person wants to turn off, add, remove, or build a module or a design system, read [src/systems/studio/rules/modules.md](src/systems/studio/rules/modules.md).
Before editing a prototype, resolve its assigned system from its metadata and the studio configuration. An explicit `system: null` means custom styling with no assigned system; do not substitute the default. For an assigned system, read its `src/systems/<id>/AGENTS.md` when present, then the relevant context, rules, and skills it references. Inspect skill names and descriptions before reading applicable `SKILL.md` procedures and their supporting files. Read only the applicable system's product instructions. Platform operating rules continue to apply.

<!-- studio:modules -->
When the person asks for a canvas (a page of views, documents, and notes arranged together), read [src/systems/studio/rules/canvases.md](src/systems/studio/rules/canvases.md).
When the person asks to add or change a standalone diagram in a prototype, read [src/systems/studio/rules/diagrams.md](src/systems/studio/rules/diagrams.md).
When the person asks for a document (written context in a prototype), read [src/systems/studio/rules/documents.md](src/systems/studio/rules/documents.md).
When the person asks to add or change platform documentation, read [src/systems/studio/rules/documentation.md](src/systems/studio/rules/documentation.md).
<!-- /studio:modules -->

Use pnpm for project commands. Resolve the contributor before editing prototypes. Follow the scope and prototype rules above.
The human documentation is the Guide at `/documentation/guide`. Human chapters live in `src/modules/documentation/pages/`. Module documents own technical contracts.
For component, theme, or pop-up changes, read [src/systems/studio/rules/systems.md](src/systems/studio/rules/systems.md).
The app uses TanStack Router. For routing work, use its [official documentation](https://tanstack.com/router/latest/docs/framework/react/overview).
