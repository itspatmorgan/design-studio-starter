---
referenceSection: operate
referenceOrder: 20
---

# Studio configuration

`studio.config.ts` holds a small set of shared choices. Other customization happens in code, which you also own.

## Change configuration

Ask your agent to configure the studio. The configuration command previews changes before applying them.

Use `pnpm studio configure --system <id>` to preview a default-system change. Apply with `--yes` after reviewing the preview. For prototypes without an explicit system choice, the command records their current system before changing the default. Existing prototypes retain their systems.

Directly editing `defaultSystem` does not perform that preservation step. Prototypes without an explicit choice then follow the new default. Migrating component imports remains a separate task.

For manually edited module configuration, run `pnpm studio sync` to refresh agent task routes. Restart the dev server after configuration changes. Coordinate shared configuration changes with your maintainer.

## Configuration fields

| Setting | Declaration |
| --- | --- |
| `name` | Required studio name, used by the app. |
| `usage` | Required `personal` or `team`. Guides onboarding, without changing contributor ownership. |
| `tagline` | Optional line on the published front page, up to 140 characters. |
| `modules` | Installed module IDs set to `true` or `false`. Every installed module needs an explicit entry; omission is invalid and never enables it. Required modules cannot be disabled. |
| `systems` | Required list of every installed system ID, including the required Studio system (`studio` in the starter). Discovery does not register a system. |
| `defaultSystem` | System for prototypes without an explicit system choice. Required registered prototype-system ID; no alphabetical fallback. |

## Inspect setup

The agent can run `pnpm studio status --json` to inspect configuration and setup state. This report does not replace a build and review of a working prototype.

For capabilities and removal behavior, see [Module contract](/documentation/reference/modules/README.md).
