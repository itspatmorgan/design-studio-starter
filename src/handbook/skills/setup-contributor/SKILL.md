---
name: setup-contributor
description: "Set up someone joining an existing personal or shared Design Studio: local tools, Git identity, their contributor entry and first prototype. Use for onboarding a contributor; use initialize-studio for configuring a new studio."
---

Read `studio.config.ts` and the existing contributor registry before changing anything. Joining preserves the studio's configuration, modules, Handbook, and design system. If this is a new studio instead, follow [initialize-studio](../initialize-studio/SKILL.md).

1. Install missing tools and dependencies: `mise trust`, `mise install`, `pnpm install`. Check Node matches `mise.toml`; use `mise exec --` when mise is not activated. Perform these steps yourself; explain a blocker only when human action is required.
2. Inspect `git config user.name` and `git config user.email`. Confirm uncertain identity with the person, then set the correct values in this repository when authorized. Personal use accepts a personal email and does not require GitHub. For a shared GitHub studio, inspect `gh` availability/sign-in and ask for the person's GitHub username when it cannot be determined; have the person complete interactive authentication when needed. Never reuse the sample author's or another person's account.
3. Run `pnpm join` to inspect the proposal. If detected identity is wrong, use explicit `--key`, `--name`, `--email`, and (for GitHub collaboration) `--github` flags. Show unresolved or newly inferred values clearly; confirmed values do not require repeated approval. A missing GitHub username does not prevent local work, but shared-repository CI needs it before pushing.
4. Apply the confirmed proposal with `pnpm join --key <key> --name "…" --email "…" --github <username> --yes` (omit GitHub for personal use). It writes `contributors/<key>.json` and `src/prototypes/<key>/`; starter entries remain in `contributors.json`. Existing matching entries are reused. Never delete another entry to overcome a collision; resolve identity with the person.
5. Run `node scripts/cli/resolve-contributor.js` and verify the expected key. Git email is the first identity signal; ambiguous matches require correction. Run `pnpm build`. Commit only the onboarding files when complete, keeping existing work out of the commit.
6. Offer a first prototype; create it with `pnpm new "…"` using the studio's default system. Start `pnpm dev`, inspect its URL `/prototypes/<key>/<prototype>`, and leave the local app available. Guide the person to `/guide`. Do not alter the shared samples or initialize the studio again, and do not push until asked.

Ask focused questions only where input improves correctness. Use the running UI for reviewing the first prototype or available system components when helpful; text remains sufficient for onboarding. Report what succeeded and anything still needed for local use or later sharing separately.
