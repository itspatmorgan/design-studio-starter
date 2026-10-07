# Set up Design Studio

Choose one of four paths: Codex plugin, Claude Code plugin, Cursor plugin, or direct from the source repository. Use the desktop app and a local session so the agent can create files and run Studio on your computer.

The first release is planned around local and repository plugin installation. You do not need to wait for a listing in a reviewed public directory. The package is currently experimental; direct-source setup and the newly packaged starter still need native journey verification. Organization policies may limit plugin installation. If your tool cannot load a plugin, use the direct-source path below.

## 1. Codex plugin

Open a local chat in the Codex desktop app and give it this request:

> Install the Design Studio plugin locally for Codex from https://github.com/itspatmorgan/design-studio-starter. Read SETUP.md and follow the Codex plugin installation instructions. Handle the technical steps and preserve my other plugins. Tell me if I need to restart the app or enable the plugin.

After installation, restart the app if needed and start a new local chat. Confirm Design Studio is available in the plugin controls, then ask: **“Create my Design Studio.”**

## 2. Claude Code plugin

Use **Code** in the Claude desktop app with **Local** selected. Open **Customize → Plugins → Add plugin → Add marketplace** and add `itspatmorgan/design-studio-starter`. Install Design Studio from that repository's catalog. This is a repository install, not a reviewed public-directory listing.

For a local checkout instead, ask your local Claude Code agent:

> Install the Design Studio plugin locally for Claude Code from https://github.com/itspatmorgan/design-studio-starter. Read SETUP.md and follow the Claude Code local plugin instructions. Preserve my other plugins and show me how to continue in Claude Desktop's local Code view.

Start a new local Code session and confirm `/design-studio:create-studio` appears. **No folder** can be used for initial setup when available. Ask **“Create my Design Studio”**, or invoke that command.

## 3. Cursor plugin

Open a local Agent chat in Cursor and give it this request:

> Install the Design Studio plugin locally for Cursor from https://github.com/itspatmorgan/design-studio-starter. Read SETUP.md and follow the Cursor local plugin instructions. Preserve my other plugins. Handle copying the package, then tell me when to reload the window and how to verify its skills.

Reload Cursor when the agent is ready. Open **Customize** and confirm Design Studio's skills are available. In a fresh local Agent chat, ask **“Create my Design Studio.”** Local imports must be allowed by your account or organization; if they are unavailable, use direct-source setup.

## 4. Direct from the source repository

No plugin is required. In any supported local desktop coding agent, give it this request:

> Help me install Design Studio from https://github.com/itspatmorgan/design-studio-starter. Read its SETUP.md and follow the linked create-studio instructions. Handle downloading, setup, and opening it for me. Save my studio in my user Developer folder. Preserve anything already there. Show me the running studio and help me continue working in its folder.

If you prefer manual setup, create your own repository with **Use this template** on GitHub, or download or clone the source. Open that folder in your coding app and ask the agent to follow the repository's setup instructions there. Manual terminal commands are in the [README](README.md#get-started).

All four agent-assisted paths create the same working-studio package. Plugin publishing files remain in the setup tooling. Manual template copies or clones include the complete maintainer repository.

## What happens after setup

Your agent may need permission to download tools or create the folder. It handles the technical steps and tells you when it needs help.

Your studio and all its source files live locally on your computer. The default folder is `~/Developer/Design Studio`; additional installs use `Design Studio 2`, `Design Studio 3`, and so on. Developer is an ordinary folder in your home folder for organizing these files. Your agent shows the actual absolute path and local preview URL. Continue working in that studio folder, not in the plugin's files. A GitHub account is optional for personal use.

Product and Marketing are example systems. Feedback Inbox and Design Studio Marketing are example prototypes for learning. Explore them, then ask your agent to customize, replace, or remove them for your own needs. Keep Studio, the application's system.

New studios start in Personal mode. When you are ready to collaborate, switch to Team in Studio settings. This enables Contributors & Permissions so you can assign Admins and system access.

To return later, open the same studio folder and ask **“Open my Design Studio.”** Plugin updates do not automatically upgrade an existing studio.

## For the agent installing a plugin

Obtain a checkout of the requested source with your supported tools and read its plugin package. Record its commit and package version. Keep setup tooling separate from the person's studio. Preserve occupied folders and existing plugin registrations. Handle missing tools through supported host mechanisms; the person should not need to enter terminal commands.

### Codex local plugin instructions

Use the installed Codex CLI's current help to verify its plugin commands. The tested registration flow is:

```sh
codex plugin marketplace add /absolute/path/to/the/source-checkout
codex plugin add design-studio@design-studio-experiment
```

The repository's `.agents/plugins/marketplace.json` is a catalog for this package; it does not require public-directory review. Check the installed version and ask the person to restart the desktop app if required, then verify the plugin in a new local chat. Do not claim an offered instruction or successful CLI install proves desktop activation.

### Claude Code local plugin instructions

The tested local registration flow is:

```sh
claude plugin marketplace add /absolute/path/to/the/source-checkout
claude plugin install design-studio@design-studio-experiment --scope user
```

Verify current command help before execution. The catalog is `.claude-plugin/marketplace.json`. Keep the local checkout available when the installation reads from it. Verify the three plugin commands in Claude Desktop's local Code view. The CLI is an agent-managed installation tool; continued user work is in the desktop app. Do not substitute a terminal session for a desktop test.

### Cursor local plugin instructions

Copy the contents of `plugins/design-studio` into an ordinary directory at `~/.cursor/plugins/local/design-studio`. Include the manifests, skills, scripts, and assets. Preserve any existing installation; inspect it and use the tool's supported update workflow rather than overwriting custom files.

Do not symlink this plugin directory to a checkout elsewhere: Cursor skips local-plugin links whose targets are outside `~/.cursor/plugins/local`. This restriction is separate from the studio's generated project skill adapters. Ask the person to restart Cursor or use **Developer: Reload Window**, then verify components in **Customize**. A marketplace plugin with the same name takes precedence over the local copy. Respect organization restrictions on local imports and offer direct-source setup when blocked.

Official references: [OpenAI local plugin packaging](https://developers.openai.com/plugins/build/plugins), [Claude plugins](https://code.claude.com/docs/en/plugins), [Claude Desktop](https://code.claude.com/docs/en/desktop), [Cursor local plugins](https://cursor.com/docs/plugins#test-plugins-locally).

## For the agent carrying out studio setup

Use the existing [create-studio skill](plugins/design-studio/skills/create-studio/SKILL.md). That procedure and its [host handoff](plugins/design-studio/skills/create-studio/references/host-handoff.md) are the authoritative setup instructions for every supported host.

Without an installed plugin, download a temporary shallow checkout of this public repository through your supported tools. Record its full commit SHA and read the skill, helper, and references from that same checkout. This is setup tooling, not the person's studio. Inspect `plugins/design-studio/scripts/bootstrap.mjs` before execution; it pins the starter revision independently. Run the helper from that checkout and create the owned studio in the destination specified by the skill. Do not use the temporary checkout as the person's workspace. No repository duplication or remote is needed.

Use the person's requested folder when supplied. Handle missing tools through supported host mechanisms and their official sources. Honor permission prompts; report an unavailable local execution capability. Preserve existing studios and use open-studio for them. Complete the preview and workspace handoff before declaring setup finished.
