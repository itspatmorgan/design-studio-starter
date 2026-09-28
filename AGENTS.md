# Prototype Sandbox

If `node_modules/` doesn't exist, or the person is new, follow agents/skills/setup-contributor/SKILL.md first.

At the start of every session, read:
- agents/rules/systems.md
- agents/rules/prototype-workflow.md
- agents/rules/contributor-scope.md

Find out who you're working with by running `node scripts/resolve-contributor.js`.
Create prototypes with `pnpm new "Prototype Name"`.
You can change only your own folder in src/prototypes/.
A prototype can depend only on its own folder, src/product/, and src/lib/.
Write views as `.tsx` (plain `.jsx` works too). `pnpm build` runs the type check (`pnpm typecheck`).
The app routes with TanStack Router (code-based routes in src/studio/app/router.tsx). For routing questions, use TanStack Router's docs: https://tanstack.com/router/latest/docs/framework/react/overview
