---
referenceSection: operate
referenceOrder: 20
---

# Studio configuration

`studio.config.ts` holds a small set of shared choices. Other customization happens in code, which you also own.

## Change configuration

Open **Studio settings** from the gear icon or search while running Studio locally. Contributors can inspect settings. Admins can edit basic configuration, optional module states, and Admin assignments. Contributor profiles are read-only in this page.

Saving writes repository files, synchronizes module-owned agent instructions, and restarts the development server. Stale configuration or contributor snapshots are rejected. Reload settings before retrying a conflicting save. Settings and its editing API are excluded from the published viewing site.

You can also ask your agent to configure the studio. The configuration command previews changes before applying them. The CLI and settings API share validation, source editing, assignment preservation, and module instruction synchronization.

Use `pnpm studio configure --system <id>` to preview a default-system change. Apply with `--yes` after reviewing the preview. For prototypes without an explicit system choice, the command records their current system before changing the default. Existing prototypes retain their systems.

Directly editing `defaultSystem` does not perform that preservation step. Prototypes without an explicit choice then follow the new default. Migrating component imports remains a separate task.

For manually edited module configuration, run `pnpm studio sync` to refresh agent task routes. Restart the dev server after CLI configuration changes. Coordinate shared configuration changes with your Admin.

## Local roles and contributors

Studio has two local roles: Contributor and Admin. Registered people are Contributors by default. In team use, `admins` must contain at least one registered contributor key; several Admins are supported. In personal use, the resolved local contributor is automatically an Admin. Unregistered identities cannot save settings.

The settings server checks the current role before applying each save. Only existing Admins can change team Admin assignments through the UI. Saving cannot remove the last team Admin. These roles guide local behavior. They do not authenticate people, grant GitHub permissions, or override prototype ownership. Existing section-specific artifact policies remain separate.

Use `pnpm studio configure --admins sam,alex --yes` to assign team Admins. This repository command also supports initial setup and recovery when no local Admin can use the UI. CLI commands and direct file edits remain available to people and agents with repository access. GitHub review and CI permission rules remain separate.

Keep shared choices in `studio.config.ts`. Contributor profiles live in `contributors/<key>.json`; `pnpm join` creates these files. Existing `contributors.json` entries are still supported. Both sources form one roster, but a key must appear in only one source. Profiles do not declare Admin authority.

## Configuration fields

| Setting | Declaration |
| --- | --- |
| `name` | Required studio name, used by the app. |
| `usage` | Required `personal` or `team`. Guides onboarding, without changing contributor ownership. |
| `admins` | Unique registered contributor keys. Required and nonempty in team use; personal use derives Admin access from local identity. |
| `tagline` | Optional line on the published front page, up to 140 characters. |
| `modules` | Installed module IDs set to `true` or `false`. Every installed module needs an explicit entry; omission is invalid and never enables it. Required modules cannot be disabled. |
| `systems` | Required list of every installed system ID, including the required Studio system (`studio` in the starter). Discovery does not register a system. |
| `defaultSystem` | System for prototypes without an explicit system choice. Required registered prototype-system ID; no alphabetical fallback. |

## Inspect setup

The agent can run `pnpm studio status --json` to inspect configuration and setup state. This report does not replace a build and review of a working prototype.

For capabilities and removal behavior, see [Module contract](/documentation/reference/modules/README.md).
