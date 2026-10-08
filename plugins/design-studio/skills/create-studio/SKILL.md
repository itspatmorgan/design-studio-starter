---
name: create-studio
description: Install and open a new Design Studio on the user's computer, with complete code in a visible folder. Use for first-time setup; use open-studio for an existing studio.
---

Create a working studio in the person's intended location. Handle technical steps yourself and preserve existing work. Their studio remains usable without this plugin.

## Create and open

1. Follow [Environment audit and installation location](references/local-setup.md) after plugin activation or obtaining direct-source tooling. It owns the audit, folder recommendation, user confirmation, setup commands, and recovery.
2. Read the created repository's `AGENTS.md` and required context. Register the person using its setup-contributor procedure in **registration-only mode**: follow the registration steps and return here for launch and final verification, including with an older starter. Reuse confirmed identity; ask only for missing information. Do not fabricate identity or require GitHub for personal use.
3. Start the server with the host's persistent preview tools or `start --destination <folder>`. Read the actual loopback URL, open it, and inspect Studio. Use `exec --destination <folder> -- <command> [args...]` for follow-up commands so the helper retains verified Git and pinned tools.
4. Follow [Host handoff](references/host-handoff.md) to continue in the owned studio folder. A preview or launch request does not prove the editor opened that workspace.
5. If publication was requested, continue with [publish-studio](../publish-studio/SKILL.md). Reuse the same studio and preserve local readiness if publication fails.

Keep Personal mode, the starter toolkit, and the existing tagline unless customization was requested. Inspect the installed studio before identifying its learning examples; retain them for exploration.

In older pinned starters, `pnpm join --help` can perform registration. Inspect the registration CLI source for options instead of invoking that flag.

For a requested timed journey, use [benchmark boundaries](../../experiments/benchmarking.md).

## Finish

Report the verified source folder, where that filesystem lives, the preview link, and how to continue working there. Describe an offered workspace link as ready to open until opening is verified. Files remain after plugin removal.

Label any included systems and prototypes as learning examples that can be customized, replaced, or removed. Keep Studio as the application system. Invite the person to explore or ask their agent to make something. Configuration and a custom system can follow later.

Finish after the requested setup and handoff are verified. Continue with [use-studio](../use-studio/SKILL.md) for later work.
