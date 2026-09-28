# Contributor scope

You can change anything in your folder, but only your own folder. Everything else is the platform.

- First, work out who you're working with: run `node scripts/resolve-contributor.js`. It prints their key; their folder is `src/prototypes/<key>/`.
- If they aren't in `contributors.json`, set them up with `pnpm join` (see agents/skills/setup-contributor/SKILL.md). Don't edit `contributors.json` by hand. Adding or editing your own entry counts as in scope; changing anyone else's is a platform change.
- Edit only files in that contributor's folder.
- `systems` and `guide` can't be contributor keys: they're app pages (`/systems`, `/guide`). `pnpm join` rejects them.
- For anything in the platform (everything else, including `src/studio/`, `src/product/`, `scripts/`, and these rules), describe the change and ask the user if they're sure before making it. Don't make it blindly.
- The pre-commit and pre-push hooks print a scope summary. If they report platform files, tell the user. On push to main, CI fails and opens an issue for out-of-scope changes.
- Before each commit, `check-identity.js` warns if the person's Git name or email doesn't match their `contributors.json` entry. It never blocks. If it warns, tell the person and offer to fix their Git config.
