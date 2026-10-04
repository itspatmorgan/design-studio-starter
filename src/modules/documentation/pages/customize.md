---
title: "Customize your studio"
description: "Start with your work, then extend the studio through systems and modules."
section: "Begin"
order: 3
toc: true
---

You own this studio and can change any part of it. Start with your prototypes, systems, and configuration. Add modules when you need a new capability. Changes to supplied code need more care when accepting upstream updates.

## Choose where to work

| Scope | Purpose | Update responsibility |
| --- | --- | --- |
| `src/prototypes/<contributor>/` | Your views, documents, diagrams, and canvases. | Maintain your work within the prototype contract. |
| `studio.config.ts` | Studio identity, enabled modules, registered systems, and the default system. | Use supported choices and review configuration migrations. |
| `src/systems/<id>/` | Your components, foundations, context, rules, and skills. | Maintain your system and its dependencies. |
| `src/modules/<id>/` | A capability such as a new artifact type or studio section. | Maintain your module against the supported extension contracts. |
| `src/systems/studio/` | The supplied components and guidance used by Design Studio itself. | Reconcile local changes with Studio releases. |
| `src/platform/` and `scripts/` | Application infrastructure, extension contracts, build tools, and commands. | Maintain local changes and verify them against upstream updates. |

Supplied and custom modules share the same structure. Their location describes their purpose, not who maintains them.

## Start with your work

Create prototypes and use the assigned system's components. Keep experimental helpers in the prototype until you need to share them. The [Prototypes chapter](/documentation/guide/prototypes) explains the workflow.

## Configure the studio

Choose your studio identity, default system, and enabled optional modules through studio commands. Configuration changes do not require edits to the application shell. See [Studio configuration](/documentation/reference/platform/core/config.md).

## Add a system

A system supplies components, foundations, and guidance for your product. Ask your agent to add or adapt one. You can have several systems and assign a different one to each prototype.

Studio is the required system used by the application itself. It is maintained with platform releases and stays separate from prototype systems. See [Systems](/documentation/guide/systems).

## Build a module

Modules add capabilities to your studio. Use `pnpm studio create-module <id>` to preview a scaffold, then apply it with `--yes`. The scaffold adds a page and navigation entry without editing the platform shell.

For example, `pnpm studio create-module research --label "Research"` previews a Research module. Applying it creates `src/modules/research/`, registers it, and installs its declared agent rule. Restart the development server, then edit its `app.tsx` to build the page.

Module declarations and shared services have explicit extension contracts. Checks report imports into private platform implementation. See the [Module contract](/documentation/reference/modules/README.md) for file types, local handlers, libraries, installation, and removal.

Modules run as trusted repository code. Supported boundaries reduce accidental coupling; they do not isolate faulty code or guarantee compatibility with every future release.

## Adapt supplied code

You can edit supplied modules, the Studio system, and platform infrastructure. Keep those changes focused and record why you made them. A change to a supported contract also requires checking its consumers.

When adopting a release, review upstream changes alongside your local changes. Resolve conflicts and run the checks before accepting the update. Keep platform changes separate from product work where practical so they are easier to review.

## Accept upstream updates

The starter is source code in your repository. It does not automatically merge future platform releases. Use a branch to review and merge changes from the upstream release you choose, then run `pnpm build` and inspect the application.

`studio.lock.json` records sources, versions or revisions, and file hashes for capabilities installed through `pnpm studio add`. Checks report differences from those installed files. The lock does not list supplied starter code or automatically upgrade it. Locally authored capabilities are maintained by your team.

A successful merge does not prove behavioral compatibility. Review the release guidance and verify your systems, modules, and important prototypes.
