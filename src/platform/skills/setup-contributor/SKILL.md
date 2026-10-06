---
name: setup-contributor
description: "Register someone joining an existing studio and verify local access. Use configure-studio for a new studio."
---

## Scope and input

Read the [contributor scope](../../context/contributor-scope.md). Inspect configuration, contributors, and Git identity before changing registration.

Preserve shared configuration, systems, samples, and system content. Install missing pinned tools and dependencies as needed.

If configure-studio calls this skill, use **registration-only mode**. Do not configure the studio, create a prototype, or commit partway through initialization.

## Register

1. Inspect repository Git name and email. Resolve uncertain identity with the person. Set confirmed values locally when authorized.
2. For GitHub sharing, determine the person's username. Let the person complete interactive authentication if needed.
3. Preview `pnpm join`. Supply explicit `--key`, `--name`, `--email`, and optional `--github` flags when detection is unsuitable.
4. Apply confirmed registration with `--yes`. Do not overwrite another entry to resolve a collision.
5. Run `node scripts/cli/resolve-contributor.js`. Verify the expected key. New registration must explicitly write `welcomeDismissed: false`; preserve an existing contributor’s declared progress. When Onboarding is enabled, report a missing declaration and correct it through a reviewable profile edit rather than assuming a default.

Personal local use accepts a personal email and needs no GitHub account. GitHub CI needs the contributor's username before sharing there.

The command owns registration files and collision handling. Inspect its help instead of recreating that logic manually.

## Registration-only completion

Return the contributor key and unresolved identity or access issues to configure-studio. The caller owns final build, prototype verification, and commit.

## Standalone completion

Offer a first prototype. If requested, create it with `pnpm new` using the existing default system.

Run `pnpm build`, start the local app, and inspect the contributor's work area. If a prototype was created, inspect its URL.

Commit only completed onboarding work. Leave the app available. Report local readiness separately from missing GitHub access. Do not push until asked.
