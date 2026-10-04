# Design Studio Starter

For a new studio or first-time kit configuration, follow [src/systems/studio/skills/initialize-studio/SKILL.md](src/systems/studio/skills/initialize-studio/SKILL.md). For someone joining an existing studio, follow [src/systems/studio/skills/setup-contributor/SKILL.md](src/systems/studio/skills/setup-contributor/SKILL.md). Missing dependencies alone do not mean the studio needs initialization.
When setting up or replacing the prototype design system, follow [src/systems/studio/skills/setup-design-system/SKILL.md](src/systems/studio/skills/setup-design-system/SKILL.md).

When working on Design Studio itself, read [Studio system instructions](src/systems/studio/AGENTS.md), then [Principles](src/systems/studio/context/principles.md) and [Personas](src/systems/studio/context/personas.md). These describe the platform, not the product being prototyped.

At the start of every session, read:
- [src/systems/studio/rules/prototype-workflow.md](src/systems/studio/rules/prototype-workflow.md)
- [src/systems/studio/rules/contributor-scope.md](src/systems/studio/rules/contributor-scope.md)

When the person wants to set a prototype or view aside, or keep it out of the deployed site, read [src/systems/studio/rules/archiving.md](src/systems/studio/rules/archiving.md).
When the person asks to add or change system context, rules, or skills, read [src/systems/studio/rules/system-content.md](src/systems/studio/rules/system-content.md).
For documentation creation, revision, or audits, follow [src/systems/studio/skills/maintain-documentation/SKILL.md](src/systems/studio/skills/maintain-documentation/SKILL.md). When platform behavior changes, update affected guidance in the same change.
When the person wants to turn off, add, remove, or build a module or a design system, read [src/systems/studio/rules/modules.md](src/systems/studio/rules/modules.md).
Before editing a prototype, resolve its assigned system from its metadata and the studio configuration. Read that system's `src/systems/<id>/AGENTS.md` when present, then the relevant context, rules, and skills it references. Read only the applicable system's product instructions. Platform operating rules continue to apply.

<!-- studio:modules -->
When the person asks for a canvas (a page of views, documents, and notes arranged together), read [src/systems/studio/rules/canvases.md](src/systems/studio/rules/canvases.md).
When the person asks to add or change a standalone diagram in a prototype, read [src/systems/studio/rules/diagrams.md](src/systems/studio/rules/diagrams.md).
When the person asks for a document (written context in a prototype), read [src/systems/studio/rules/documents.md](src/systems/studio/rules/documents.md).
When the person asks to add or change platform documentation, read [src/systems/studio/rules/documentation.md](src/systems/studio/rules/documentation.md).
<!-- /studio:modules -->

Use pnpm for project commands. Resolve the contributor before editing prototypes. Follow the scope and prototype rules above.
The human documentation is the Guide at `/documentation/guide`. Module chapters live in module READMEs.
For component, theme, or pop-up changes, read [src/systems/studio/rules/systems.md](src/systems/studio/rules/systems.md).
The app uses TanStack Router. For routing work, use its [official documentation](https://tanstack.com/router/latest/docs/framework/react/overview).
