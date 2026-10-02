---
title: "Scopes"
description: "Understand which files you can change and which dependencies a prototype can use."
section: "Working in the studio"
order: 17
toc: true
---

Scopes are boundaries around work and dependencies. They help contributors change prototypes without coupling them to other prototypes or shared app code.

## Contributor scope

Your work belongs in `src/prototypes/<your-key>/`. Your contributor key identifies your folder and registration.

The studio app, design systems, shared utilities, Handbook, and Guide are platform files. Changes there affect the shared environment.

| Change | Who reviews it |
| --- | --- |
| Your prototypes | Follow your team's normal review process. |
| Your contributor registration | Follow the team's onboarding process. |
| Shared platform files | A studio maintainer. |
| Another person's prototypes | Coordinate with their owner; do not edit them as your own work. |

For a shared change, ask your agent to create a branch and open a pull request. A maintainer decides whether to merge it.

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
