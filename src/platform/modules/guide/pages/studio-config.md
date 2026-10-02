---
title: "Studio config"
description: "The shared settings and defaults in studio.config.ts."
section: "Reference"
order: 41
toc: true
---

`studio.config.ts` holds a small set of shared choices. Other customization happens in code, which you also own.

| Setting | Purpose and default |
| --- | --- |
| `name` | Required studio name, used by the app. |
| `usage` | `personal` or `team`; defaults to `team`. Guides onboarding, without changing contributor ownership. |
| `tagline` | Optional line on the published front page, up to 140 characters. |
| `modules` | Installed module IDs set to `true` or `false`. Omitted modules are enabled. Required modules cannot be disabled. |
| `defaultSystem` | System for prototypes without an explicit system choice. Defaults to the first installed system by name. |

## Change configuration

Ask your agent to configure the studio. The configuration command previews changes before applying them.

Use `pnpm studio configure --system <id>` to preview a default-system change. Apply with `--yes` after reviewing the preview. The command records existing implicit system choices before changing the default, so existing prototypes retain their systems.

Directly editing `defaultSystem` does not perform that preservation step. Prototypes without an explicit choice then follow the new default. Migrating component imports remains a separate task.

Restart the dev server after module changes. Shared configuration changes require maintainer authorization.

## Inspect setup

The agent can run `pnpm -s studio status --json` to inspect configuration and setup state. This report does not replace a build and review of a working prototype.

For capabilities and removal behavior, see [Extend your Studio](/guide/modules).
