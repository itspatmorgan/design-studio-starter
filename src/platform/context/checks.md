---
title: "Checks and fixes"
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

See [Collaborate](/documentation/guide/collaborate) for how these checks fit the workflow. Configure branch protection and required checks to enforce the team's merge policy.

## Respond to a check

| Message | Next step |
| --- | --- |
| Platform files changed | Confirm authorization and use the maintainer's review process. |
| Git identity differs | Ask your agent to compare Git settings with your contributor registration. |
| Import crosses a boundary | Ask your agent to use a permitted dependency. |
| Styles escape their scope | Ask your agent to contain the selector or use a CSS Module. |
| File exceeds the size limit | Reduce the asset before committing. |
| Type check fails | Give your agent the error and ask it to correct the code. |

See [Collaborate](/documentation/guide/collaborate) for review paths and [Prototype files and boundaries](/documentation/context/module.prototypes#dependency-boundaries) for permitted dependencies.

## Keep files small

The [Asset Guard](assets.md#asset-guard) blocks oversized files before commit and in CI. Its convention defines the size limit and exception handling.

Follow the guard’s linked guidance to reduce a flagged asset before committing.

## Protect the shared repository

This setup is the studio maintainer's responsibility.

Personal studios skip team ownership checks, using the before-side configuration. Declaration, dependency, and asset checks still run. A proposed switch from team to personal cannot bypass team review.

Pull requests in team studios run checks and flag changes outside the contributor’s assigned scope for review. Direct pushes accept prototype ownership, assigned active system work, and studio Admin authority from the before-side configuration and profiles. Proposed identity or grant changes cannot authorize themselves. Repository `admin` and `maintain` accounts can also make shared changes.

These checks do not prevent an unauthorized Git push by themselves. Configure GitHub branch protection, required checks, and the team's review process.
