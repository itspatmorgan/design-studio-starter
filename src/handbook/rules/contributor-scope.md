# Contributor scope

You can change anything in your folder, but only your own folder. Everything else is the platform.

- First, work out who you're working with: run `node scripts/cli/resolve-contributor.js`. It prints their key; their folder is `src/prototypes/<key>/`.
- If they aren't in `contributors.json` or `contributors/<key>.json`, set them up with `pnpm join` (see src/handbook/skills/setup-contributor/SKILL.md). Don't edit `contributors.json` by hand. Adding or editing your own entry counts as in scope; changing anyone else's is a platform change.
- Edit only files in that contributor's folder, and in tools they maintain: `src/tools/<id>/` is changed by the keys in its `meta.json` "maintainers" (see tools.md), whoever started it.
- `systems`, `guide`, `tools`, and `handbook` can't be contributor keys: they're app pages (`/systems`, `/guide`, `/tools`, `/handbook`). `pnpm join` rejects them.
- For anything in the platform (everything else, including `src/platform/`, `src/systems/product/`, `scripts/`, and the Handbook in `src/handbook/`: these rules, the skills, and the docs), describe the change and get authorization when the current task does not already cover it. Existing authorization applies to the necessary implementation; do not repeatedly ask for the same scope.
- The pre-commit and pre-push hooks print a scope summary. If they report platform files, tell the user. Pull requests flag platform changes for maintainer review; on push to main, platform changes require the pushing account to have the repository admin or maintain role.
- Before each commit, `check-identity.js` warns if the person's Git name or email doesn't match their `contributors.json` entry. It never blocks. If it warns, tell the person and offer to fix their Git config.
