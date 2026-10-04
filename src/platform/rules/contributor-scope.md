# Contributor scope

Resolve the contributor with `node scripts/cli/resolve-contributor.js` before editing prototype content.

- Work freely in `src/prototypes/<key>/` for that contributor.
- For missing registration, follow [setup-contributor](../skills/setup-contributor/SKILL.md).
- Add or update the person's registration through `pnpm join`. Do not overwrite another contributor's entry.
- For shared files, obtain maintainer authorization when the request does not already cover the change. Existing authorization covers necessary implementation.
- Shared files include platform code, design systems, utilities, configuration, scripts, system content, and the Guide.
- For another owner's prototypes, prepare an isolated branch proposal for that owner to review and merge. Do not change their working branch by default.
- Do not treat local contributor identity as authentication or repository access control.

Local hooks report scope and identity. Pull requests flag shared changes for review. Main-branch checks require an admin or maintainer for platform changes.

Report scope or identity warnings. Correct identity with the person when needed. Repository protection and required reviews remain the maintainer's responsibility.
