---
name: create-studio
description: Install and open a new Design Studio on the user's computer, with complete code in a visible folder. Use for first-time setup; use open-studio for an existing studio.
---

Create a working local studio for a designer or product manager. Handle technical steps yourself. Their repository is their source of truth and remains usable without this plugin.

## First run

1. Confirm the host can execute local commands and write a user-facing folder. Cloud-only execution cannot satisfy this workflow. Never create the studio in the plugin cache, a worktree, or a temporary directory.
2. Use the supplied name and location. Otherwise offer **My Design Studio**, saved in `~/Design Studios/My Design Studio`. Explain the full location before creating it. Do not require GitHub, a design system, or product context to launch. Use the host's folder-permission flow when required.
3. Locate the installed [bootstrap helper](../../scripts/bootstrap.mjs). Inspect available Git, Node, and mise. Install missing tools from their official sources through supported host tools when authorized. Do not ask the person to run terminal commands. If local execution is unavailable, explain the desktop/local requirement.
4. Run `create --destination <absolute-folder> --name <studio-name>`. It downloads a pinned starter into an ordinary local Git repository with no remote. Existing plugin-created studios are preserved; unrelated folders are refused. For an existing studio without a receipt, use open-studio.
5. Run `prepare --destination <folder>`. Save detailed output in a local log. Describe progress as **Getting your studio**, **Preparing your studio**, and **Opening your studio**. On failure, preserve the folder and resolve the reported cause; never delete user work to retry.
6. Read the new repository's `AGENTS.md` and required instructions. Personal use and the starter kit are defaults for first-run exploration. Follow its setup-contributor procedure for registration. Use confirmed identity from this session or local configuration; ask in ordinary language if it is missing. Never fabricate names or email addresses. Keep samples available to explore.
7. Run `start --destination <folder>` in a persistent local terminal. Read Vite's actual loopback URL, since another studio may occupy the usual port. Open it with the host's supported browser/preview capability and inspect the result.
8. Attach this real folder as the local project's primary folder through a supported host capability when available. Do not invent a project API or edit the host's internal database. If attachment is unavailable, report the one remaining UI step in plain language. Opening a preview does not prove project attachment.

Invoke the helper as `node <installed-plugin>/scripts/bootstrap.mjs <command> ...`. Pass arguments individually through a command API, or quote shell arguments safely. `start` also accepts `--port`; do not expose the server beyond loopback.

## Finish

Report the full folder path, verified preview URL, and whether project attachment succeeded. All files belong to the person, can open in other editors, and remain if the plugin is uninstalled. Exploration is ready when the app works; contributor registration is required before creating their own prototype. Configure product context and a custom kit later through the repository's initialize-studio skill.

For prototype work, follow the selected repository's current instructions, resolve the contributor and assigned system, and use its existing commands. GitHub sharing and publishing are separate requests.
