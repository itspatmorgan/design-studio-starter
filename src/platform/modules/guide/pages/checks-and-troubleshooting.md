---
title: "Checks and troubleshooting"
description: "Understand Git warnings, failed checks, and repository protection."
section: "Reference"
order: 44
toc: true
---

Checks help keep the shared studio consistent. Give your agent the warning or error so it can identify the cause.

## Where checks run

| Stage | Checks and effect |
| --- | --- |
| Before commit | Staged asset sizes and module checks can block the commit. Scope and Git identity checks report warnings. |
| Before push | Scope summary. It does not run the full build or block platform changes. |
| `pnpm build` | Manifest validation, module checks, tests, type checking, and the production bundle. |
| GitHub pull request | Scope review, asset sizes, and full build. Platform proposals are flagged for review. |
| Push to `main` | Scope authorization, asset sizes, and full build. Platform changes require an admin or maintainer role. |

See [Ownership and permissions](/guide/ownership-and-permissions) for how these checks fit the workflow. Configure branch protection and required checks to enforce the team's merge policy.

## Respond to a check

| Message | Next step |
| --- | --- |
| Platform files changed | Confirm authorization and use the maintainer's review process. |
| Git identity differs | Ask your agent to compare Git settings with your contributor registration. |
| Import crosses a boundary | Ask your agent to use a permitted dependency. |
| Styles escape their scope | Ask your agent to contain the selector or use a CSS Module. |
| File exceeds the size limit | Reduce the asset before committing. |
| Type check fails | Give your agent the error and ask it to correct the code. |

See [Ownership and permissions](/guide/ownership-and-permissions) for review paths and [Prototype files and boundaries](/guide/prototype-reference#dependency-boundaries) for permitted dependencies.

## Keep files small

The file size check blocks new or changed files over 750 KB, unless they have an explicit exception. It runs before commit and in CI.

Use WebP or compressed JPEG for images. Export them at the size needed. Ask your agent to reduce an oversized asset.

Git history retains committed file versions. Removing an oversized file later does not remove its earlier versions from history.

## Protect the shared repository

This setup is the studio maintainer's responsibility.

Pull requests run checks and flag platform changes for review. On pushes to `main`, platform changes require the pushing account's `admin` or `maintain` role.

These checks do not prevent an unauthorized Git push by themselves. Configure GitHub branch protection, required checks, and the team's review process.
