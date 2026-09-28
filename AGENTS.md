# Prototype Sandbox

If `node_modules/` doesn't exist, or the person is new, follow agent/skills/setup-contributor/SKILL.md first.

At the start of every session, read:
- agent/rules/systems.md
- agent/rules/prototype-workflow.md
- agent/rules/contributor-scope.md

Find out who you're working with by running `node scripts/resolve-contributor.js`.
If they're new, or ask to get set up, follow agent/skills/setup-contributor/SKILL.md.
Create prototypes with `pnpm new "Prototype Name"`.
You can change only your own folder in src/prototypes/.
A prototype can depend only on its own folder, src/product/, and src/lib/.
Write views as `.tsx` (plain `.jsx` works too). `pnpm build` runs the type check (`pnpm typecheck`).
The app routes with TanStack Router (code-based routes in src/studio/app/router.tsx). For routing questions, use TanStack Router's docs: https://tanstack.com/router/latest/docs/framework/react/overview
