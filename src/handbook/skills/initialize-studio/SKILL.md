---
name: initialize-studio
description: "Set up or resume a new personal or team studio. For someone joining an existing studio, use setup-contributor."
---

## Scope and input

Use this skill for studio initialization, not routine dependency installation. Preserve existing work and confirmed choices.

Read the [scope rule](../../rules/contributor-scope.md), [module rule](../../rules/modules.md), and current studio configuration.

Inspect contributors, Git identity and remotes, installed systems, and Handbook context. Missing dependencies or a stock name do not establish initialization intent.

Collect unresolved studio name, personal or team use, contributor identity, design-system materials, and product context. Explain missing input without inventing decisions.

## Prepare and configure

1. Install missing pinned tools and dependencies with mise and pnpm. Use `mise exec --` when shell activation is missing.
2. Inspect `pnpm -s studio status --json`. Resume from actual state rather than restarting completed setup.
3. Preview studio choices with `pnpm studio configure`. Apply confirmed choices with `--yes` and restart the server when needed.
4. Follow [setup-contributor](../setup-contributor/SKILL.md) in **registration-only mode**. Return here after identity and registration verification.
5. Follow [setup-design-system](../setup-design-system/SKILL.md) for the chosen kit. Reuse its representative prototype for final verification.
6. Use the [Handbook rule](../../rules/handbook.md) to curate supplied context. Keep unresolved materials explicit.

The setup-design-system skill owns system migration and starter cleanup. Do not perform a second cleanup here.

Do not create a remote, push, or configure hosting without a request. Personal local use needs no GitHub account.

## Verify completion

Create a first prototype only if one was not already created for setup. Use `pnpm new` in the person's folder.

Inspect a view with the chosen system. If Documents is enabled, exercise a document using the [Documents rule](../../rules/documents.md).

If Canvases is enabled, exercise a canvas using the [Canvases rule](../../rules/canvases.md). Skip disabled capabilities.

Run `pnpm build`. Inspect the local prototype and Systems pages. Check identity, URLs, and enabled navigation.

Use the UI for review when helpful. Save any context collected there in repository files.

Report completed choices, verified local links, and unresolved input. Leave the local app available. Missing required context or system materials mean setup remains incomplete.
