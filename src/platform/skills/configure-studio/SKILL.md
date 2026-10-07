---
name: configure-studio
description: "Configure studio identity, register its first contributor, and establish design-system and product-system context after the starter is running. For first-run installation, use the Guide; for someone joining an existing studio, use setup-contributor."
---

## Scope and input

Use this skill when someone is ready to configure a running studio. The first-run install and launch steps are in the Guide's [getting started page](../../../modules/documentation/pages/getting-started.md); do not make configuration a prerequisite for launching the starter. Preserve existing work and confirmed choices.

Read the [contributor scope](../../context/contributor-scope.md), [manage-modules skill](../manage-modules/SKILL.md), and current studio configuration.

Inspect contributors, Git identity and remotes, installed systems, and system context. Missing dependencies or a stock name do not establish initialization intent.

Collect unresolved studio name, personal or team use, contributor identity, design-system materials, and product context. Explain missing input without inventing decisions.

## Prepare and configure

1. Inspect the contributor, current studio configuration, systems, prototypes, and system context. Resume from actual state rather than restarting completed setup.
2. Follow [setup-contributor](../setup-contributor/SKILL.md) in **registration-only mode**. Return here after identity and registration verification.
3. Preview studio choices with `pnpm studio configure`. Team use requires Contributors & Permissions installed and enabled, and at least one registered Admin key through `--admins key,key`. Enable the installed module while still in personal use before switching to team use. Assign the first studio owner during new-team setup. Preserve existing Admins when resuming. Personal use derives Admin access from local contributor identity and can disable team management. For initial setup without an existing local Admin, use the explicit `--recovery` flag. Use recovery only for authorized setup or permission recovery. Apply confirmed choices with `--yes` and restart the server when needed. The [configuration contract](../../context/config.md) owns role behavior.
4. If the person wants to curate or import a kit now, follow [setup-design-system](../../../modules/systems/skills/setup-design-system/SKILL.md). Reuse its representative prototype for final verification. If they choose to explore with an installed starter, preserve that choice and continue without requiring a replacement system.
5. Use the [maintain-context skill](../maintain-context/SKILL.md) to curate supplied context in the selected product system. Preserve the platform personas, principles, and skills. Keep unresolved materials explicit.

The setup-design-system skill owns system migration and starter cleanup. Do not perform a second cleanup here.

Do not create a remote, push, or configure hosting without a request. Personal local use needs no GitHub account.

## Verify completion

Create a first prototype only if one was not already created for setup. Use `pnpm new` in the person's folder.

Inspect a view with the chosen system. If Documents is enabled, exercise a document using the [write-document skill](../../../modules/document/skills/write-document/SKILL.md).

If Canvases is enabled, exercise a canvas using the [use-canvas skill](../../../modules/canvas/skills/use-canvas/SKILL.md). Skip disabled capabilities.

Run `pnpm build`. Inspect the local prototype and Systems pages. Check identity, URLs, and enabled navigation.

Use the UI for review when helpful. Save any context collected there in repository files.

Report completed choices, verified local links, and unresolved input. Leave the local app available. Missing materials block only the import or task that needs them. A usable studio with a chosen starter can complete initial configuration. Product context is curated when supplied; empty context and skills folders do not make setup incomplete.
