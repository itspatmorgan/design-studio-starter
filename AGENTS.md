# Design Studio Starter

For a new studio or first-time kit configuration, follow [src/handbook/skills/initialize-studio/SKILL.md](src/handbook/skills/initialize-studio/SKILL.md). For someone joining an existing studio, follow [src/handbook/skills/setup-contributor/SKILL.md](src/handbook/skills/setup-contributor/SKILL.md). Missing dependencies alone do not mean the studio needs initialization.
When setting up or replacing the prototype design system, follow [src/handbook/skills/setup-design-system/SKILL.md](src/handbook/skills/setup-design-system/SKILL.md).

At the start of every session, read:

- [src/handbook/docs/principles.md](src/handbook/docs/principles.md)
- [src/handbook/docs/personas.md](src/handbook/docs/personas.md)
- [src/handbook/rules/systems.md](src/handbook/rules/systems.md)
- [src/handbook/rules/prototype-workflow.md](src/handbook/rules/prototype-workflow.md)
- [src/handbook/rules/contributor-scope.md](src/handbook/rules/contributor-scope.md)

When the person wants to set a prototype or view aside, or keep it out of the deployed site, read [src/handbook/rules/archiving.md](src/handbook/rules/archiving.md).
When the person asks to add or change a team doc, rule, or skill (the Handbook), read [src/handbook/rules/handbook.md](src/handbook/rules/handbook.md).
When the person wants to turn off, add, remove, or build a module or a design system, read [src/handbook/rules/modules.md](src/handbook/rules/modules.md).
<!-- studio:modules -->
When the person asks for a canvas (a page of views, documents, and notes arranged together), read [src/handbook/rules/canvases.md](src/handbook/rules/canvases.md).
When the person asks for a document (written context in a prototype), read [src/handbook/rules/documents.md](src/handbook/rules/documents.md).
When the person asks to add or change a Guide page, read [src/handbook/rules/guide.md](src/handbook/rules/guide.md).
<!-- /studio:modules -->

Find out who you're working with by running `node scripts/cli/resolve-contributor.js`.
Create prototypes with `pnpm new "Prototype Name"`.
You can change only your own folder in src/prototypes/.
A prototype can depend only on its own folder, its design system (src/systems/product/ by default; `defaultSystem` in studio.config.ts changes that), and src/lib/.
Write views as `.tsx` (plain `.jsx` works too). `pnpm build` runs the type check (`pnpm typecheck`).
The human docs are the Guide, in `src/platform/modules/guide/pages/` (open it at `/guide`). Point people there rather than repeating it.
The app routes with TanStack Router (code-based routes in [src/platform/app/router.tsx](src/platform/app/router.tsx)). For routing questions, use TanStack Router's docs: https://tanstack.com/router/latest/docs/framework/react/overview
