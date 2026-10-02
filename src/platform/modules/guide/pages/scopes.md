---
title: "Scopes"
description: "Understand which files you can change and which dependencies a prototype can use."
section: "Working in the studio"
order: 17
toc: true
---

Scopes are boundaries around work and dependencies. They help contributors change prototypes without coupling them to other prototypes or shared app code.

## Contributor scope

Your folder is your space to explore and create. You can make, change, delete, and push your prototypes without platform approval.

Your work lives in `src/prototypes/<your-key>/`. Your contributor key identifies your folder and registration.

The goal is to keep your creative work moving. Your agent can act within your folder while following prototype boundaries and build checks.

Changes outside your folder need a different path:

| Change | Review path |
| --- | --- |
| Your prototypes | Work freely and share through your team's Git workflow. |
| Your contributor registration | Use the onboarding process to add or update your own entry. |
| Shared platform files | Obtain maintainer approval. |
| Another person's prototypes | Propose a change for the prototype owner to review and merge. |

The studio app, design systems, shared utilities, Handbook, and Guide are platform files. Changes there affect the shared environment.

Your agent should not make platform changes unless the task already has maintainer authorization. Otherwise, it should explain the proposed change and seek approval.

Another contributor's folder is also outside your agent's default scope. You can suggest an improvement without taking control of their work.

Ask the agent to prepare a proposal on a separate branch for owner review. The owner decides whether to merge it into their prototype.

Platform proposals follow the maintainer's review process, usually through a branch and pull request. Approval for one task does not authorize unrelated shared changes.

A personal studio uses the same boundaries. You can also act as its maintainer.

## Checks and repository protection

Before commit and push, the scope check reports which files are yours and which are platform files. This scope summary does not block the operation.

Other checks can block a commit or fail a build. These include file size, module dependencies, and type checks.

Pull requests run checks and flag platform changes for review. On pushes to `main`, platform changes require the pushing account's `admin` or `maintain` role.

These checks do not prevent an unauthorized Git push by themselves. The maintainer must configure GitHub branch protection and required reviews.

Before commit, an identity check warns if your Git name or email differs from your contributor registration.

## Prototype dependencies

A prototype can use these sources:

| Source | Example |
| --- | --- |
| Its own files | `./_components/header` |
| Its assigned design system | `@/systems/product/components/button` |
| Shared utilities | `@/lib/portal` |
| An enabled module's public library entry | `@module/<id>` |
| Installed packages | `react` |

It cannot import another prototype, another design system, or private platform files. A module's public library entry is the explicit platform exception.

These boundaries also apply to indirect and type-only dependencies. Shared utilities cannot depend on prototypes, design systems, or platform code.

Invalid dependencies produce errors during local development and fail the build. To reuse another prototype's code, copy it or move a suitable component into the design system.

## Contain styles

Use Tailwind classes or CSS Modules (`*.module.css`) for prototype styles. CSS Modules must use local class selectors and cannot use global selectors.

Plain CSS imports from runtime components fail. Design-system themes load through the platform and must target their unique theme class or its descendants.

## Keep files small

The file size check blocks new or changed files over 750 KB, unless they have an explicit exception. It runs before commit and in CI.

Use WebP or compressed JPEG for images. Export them at the size needed. Ask your agent to reduce an oversized asset.

Git history retains committed file versions. Removing an oversized file later does not remove its earlier versions from history.
