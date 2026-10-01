# Design Studio Starter

If `node_modules/` doesn't exist, or the person is new, follow [src/handbook/skills/setup-contributor/SKILL.md](src/handbook/skills/setup-contributor/SKILL.md) first.

At the start of every session, read:
- [src/handbook/rules/systems.md](src/handbook/rules/systems.md)
- [src/handbook/rules/prototype-workflow.md](src/handbook/rules/prototype-workflow.md)
- [src/handbook/rules/contributor-scope.md](src/handbook/rules/contributor-scope.md)

When the person asks for a document (written context in a prototype), read [src/handbook/rules/documents.md](src/handbook/rules/documents.md).
When the person asks for a canvas (a page of views, documents, and notes arranged together), read [src/handbook/rules/canvases.md](src/handbook/rules/canvases.md).
When the person wants to build a tool (a prototype the team uses as an app), or publish a prototype as one, read [src/handbook/rules/tools.md](src/handbook/rules/tools.md).
When the person wants to set a prototype or view aside, or keep it out of the deployed site, read [src/handbook/rules/archiving.md](src/handbook/rules/archiving.md).
When the person asks to add or change a team doc, rule, or skill (the Handbook), read [src/handbook/rules/handbook.md](src/handbook/rules/handbook.md).

Find out who you're working with by running `node scripts/resolve-contributor.js`.
Create prototypes with `pnpm new "Prototype Name"`.
You can change only your own folder in src/prototypes/, and the tools in src/tools/ that you maintain.
A prototype can depend only on its own folder, its design system (src/systems/product/ by default; `defaultSystem` in studio.config.ts changes that), and src/lib/.
Write views as `.tsx` (plain `.jsx` works too). `pnpm build` runs the type check (`pnpm typecheck`).
The human docs are the Guide, in `src/studio/guide/` (open it at `/guide`). Point people there rather than repeating it.
The app routes with TanStack Router (code-based routes in [src/studio/app/router.tsx](src/studio/app/router.tsx)). For routing questions, use TanStack Router's docs: https://tanstack.com/router/latest/docs/framework/react/overview
