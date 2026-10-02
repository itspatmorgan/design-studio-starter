---
title: "Checks and troubleshooting"
description: "Understand Git warnings, failed checks, and repository protection."
section: "Reference"
order: 43
toc: true
---

Checks help keep the shared studio consistent. Give your agent the warning or error so it can identify the cause.

## Before commit and push

The scope check reports which changed files are yours and which are platform files. This summary does not block the operation.

Before commit, an identity check warns if your Git name or email differs from your contributor registration.

Other checks can block a commit or fail a build. These include file size, module dependencies, and type checks.

## Respond to a check

| Message | Next step |
| --- | --- |
| Platform files changed | Confirm authorization and use the maintainer's review process. |
| Git identity differs | Ask your agent to compare Git settings with your contributor registration. |
| Import crosses a boundary | Ask your agent to use a permitted dependency. |
| Styles escape their scope | Ask your agent to contain the selector or use a CSS Module. |
| File exceeds the size limit | Reduce the asset before committing. |
| Type check fails | Give your agent the error and ask it to correct the code. |

See [Working with others](/guide/working-with-others) for review paths and [Prototype boundaries](/guide/prototype-boundaries) for permitted dependencies.

## Keep files small

The file size check blocks new or changed files over 750 KB, unless they have an explicit exception. It runs before commit and in CI.

Use WebP or compressed JPEG for images. Export them at the size needed. Ask your agent to reduce an oversized asset.

Git history retains committed file versions. Removing an oversized file later does not remove its earlier versions from history.

## Protect the shared repository

This setup is the studio maintainer's responsibility.

Pull requests run checks and flag platform changes for review. On pushes to `main`, platform changes require the pushing account's `admin` or `maintain` role.

These checks do not prevent an unauthorized Git push by themselves. Configure GitHub branch protection, required checks, and the team's review process.
