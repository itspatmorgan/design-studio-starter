# Set up Design Studio

Choose one of four paths: Codex plugin, Claude Code plugin, Cursor plugin, or direct from the source repository. Use the desktop app and a local session so the agent can create files and run Studio on your computer. Each plugin prompt requests installation and studio creation together. After setup, use [DEPLOY.md](DEPLOY.md) when you want a viewing link to share.

If your account or organization cannot load a plugin, use the direct-source path below.

After the plugin is ready, your agent audits the environment and recommends a folder for Studio. It explains where files will be saved and asks you to confirm or change the location before creating Studio. Recommendations use the observed OS, home folder, and permissions, including on work-managed computers.

## 1. Codex plugin

Open a local chat in the Codex desktop app and give it this request:

> Install the Design Studio plugin locally for Codex from https://github.com/itspatmorgan/design-studio-starter. Read SETUP.md and follow its Codex plugin installation and linked create-studio instructions. Handle the technical steps, preserve my other plugins and existing files, and create my Design Studio on this computer. Open its local preview and help me continue working in its folder. Guide me through any restart, plugin activation, or new chat needed.

Your agent guides you through any restart, plugin activation, or new chat needed to complete setup.

## 2. Claude Code plugin

Open the Claude desktop app, choose **Code**, then select **Local**. Use **No folder** for initial setup when available. Copy this prompt to install the plugin and create your studio:

> Install the Design Studio plugin locally for Claude Code from https://github.com/itspatmorgan/design-studio-starter. Read SETUP.md and follow its Claude Code local plugin installation and linked create-studio instructions. Handle the technical steps, preserve my other plugins and existing files, and create my Design Studio on this computer. Open its local preview and help me continue working in its folder in Claude Desktop’s local Code view. Guide me through any restart, plugin activation, or new session needed.

Your agent guides you into your studio folder and through any restart, plugin activation, or new session needed.

You can also install from the repository catalog through **Customize → Plugins → Add plugin → Add marketplace**. Add `itspatmorgan/design-studio-starter`, install Design Studio, then ask **“Create my Design Studio.”**

## 3. Cursor plugin

Open a local Agent chat in Cursor and give it this request:

> Install the Design Studio plugin locally for Cursor from https://github.com/itspatmorgan/design-studio-starter. Read SETUP.md and follow its Cursor local plugin installation and linked create-studio instructions. Handle the technical steps, preserve my other plugins and existing files, and create my Design Studio on this computer. Open its local preview and help me continue working in its folder. Guide me through any window reload, plugin activation, or new Agent chat needed.

Your agent guides you through any window reload, plugin activation, or new Agent chat needed. Local imports must be allowed by your account or organization; if they are unavailable, use direct-source setup.

## 4. Direct from the source repository

No plugin is required. In any supported local desktop coding agent, give it this request:

> Help me install Design Studio from https://github.com/itspatmorgan/design-studio-starter. Read its SETUP.md and follow the linked create-studio instructions. Handle downloading, setup, and opening it for me. Verify that setup will save files on my computer and help me choose the local folder. Preserve anything already there. Show me the running Design Studio and help me continue working in its folder.

If you prefer to run setup yourself, follow [manual installation](#manual-installation) below.

All four agent-assisted paths create the same working-studio package. Plugin publishing files remain in the setup tooling. Manual template copies or clones include the complete maintainer repository.

## Manual installation

1. Select **Use this template** on GitHub to create your own repository, then clone it locally. You can also download or clone the source directly.
2. Install [mise](https://mise.jdx.dev/installing-mise.html) if you do not already have it.
3. From the repository directory, run:

   ```sh
   mise install
   mise exec -- pnpm install
   mise exec -- pnpm dev
   ```

Open the local URL printed by Vite. You can explore the starter before configuring anything or opening it in a coding agent. See the [Manual](src/modules/documentation/pages/index.md) for what to do next. To work with your agent, open this folder in your coding app.

## Set up and publish with ChatGPT Sites

Publishing instructions now live in [DEPLOY.md](DEPLOY.md#chatgpt-sites). Complete one setup path above, then open your Studio folder and use that guide's ChatGPT Sites prompt. It also covers GitHub Pages, Netlify, and Vercel.

If you explicitly request setup and publication together, the agent completes local setup first, then follows DEPLOY.md for your chosen provider and audience. If publishing is unavailable or fails, you can continue working locally.

## What happens after setup

Your agent may need permission to download tools or create the folder. It handles the technical steps and tells you when it needs help.

Your studio and all its source files live in the folder you confirm. The suggestions are `~/Developer/design-studio` on macOS and a Projects folder under your home on Windows/Linux. These are ordinary folders for organizing your files. Additional installs use numbered folders; your chosen location takes precedence. Your agent explains the execution environment, shows the actual absolute path, and reports any remote filesystem before you decide. Continue working in that studio folder, not in the plugin's files. A GitHub account is optional for personal use.

Product and Marketing are example systems. Feedback Inbox and Design Studio Marketing are example prototypes for learning. Explore them, then ask your agent to customize, replace, or remove them for your own needs. Keep Studio, the application's system.

New studios start in Personal mode. When you are ready to collaborate, switch to Team in Studio settings. This enables Contributors & Permissions so you can assign Admins and system access.

To return later, open the same studio folder and ask **“Open my Design Studio.”** Plugin updates do not automatically upgrade an existing studio.

## For the agent installing a plugin

Obtain a checkout of the requested source with your supported tools and read its plugin package. Record its commit and package version. Keep setup tooling separate from the person's studio. Preserve occupied folders and existing plugin registrations. Handle missing tools through supported host mechanisms; the person should not need to enter terminal commands.

Use the host's supported plugin installation flow and inspect where plugin files will be registered. Respect organization permissions. Once the plugin is ready, continue with [Create Studio](plugins/design-studio/skills/create-studio/SKILL.md); it routes to the shared environment and destination procedure.

When the request includes studio creation, continue with [studio setup](#for-the-agent-carrying-out-studio-setup) after installation. Plugin registration alone does not complete that request. If a restart or new chat is required, provide a continuation handoff with the source checkout, installation status, audit findings, confirmed folder and user response if available, setup-plan path if available, and remaining steps. Include any requested Sites publication and audience. Audit the new session before continuing; retain the confirmed destination unless the user changes it.

### Update an existing plugin installation

Compare the installed plugin and marketplace identity with this checkout. If the installation uses `design-studio-experiment`, moving to `design-studio` requires a registration change. Read the current package version from [plugin.json](plugins/design-studio/plugin.json).

Use the host's supported update controls when the marketplace identity matches. If it differs, disable or uninstall only the old Design Studio plugin, preserving its persistent data. For that registration change, register this repository as `design-studio` and install `design-studio@design-studio` using the host instructions below. Remove the old marketplace registration only if it is no longer needed. Keep unrelated plugins and custom files intact; do not manually delete shared caches.

Claude can retain the old marketplace identity when the same checkout path is registered again. If the marketplace identity differs, use a separate fresh checkout and verify that registration reports `design-studio`. Keep the old checkout and registration while other plugins still depend on them. If uninstalling with Claude's CLI, use `--keep-data`.

For Cursor's local directory installation, inspect the installed version and use the supported replacement procedure, preserving custom files. Marketplace identity checks apply to catalog registrations.

Restart or reload as required, then verify one active Design Studio plugin, its current version, and its commands or skills in a fresh session. Open an existing studio with **“Open my Design Studio”** to verify preservation; do not recreate it. Plugin migration does not move or upgrade studio folders.

### Codex local plugin instructions

Use the installed Codex CLI's current help to verify its plugin commands. The registration flow is:

```sh
codex plugin marketplace add /absolute/path/to/the/source-checkout
codex plugin add design-studio@design-studio
```

The repository's `.agents/plugins/marketplace.json` is the catalog for this package. Check the installed version and ask the person to restart the desktop app if required, then verify the plugin in a new local chat. Do not claim an offered instruction or successful CLI install proves desktop activation.

### Claude Code local plugin instructions

The local registration flow is:

```sh
claude plugin marketplace add /absolute/path/to/the/source-checkout
claude plugin install design-studio@design-studio --scope user
```

Verify current command help before execution. The catalog is `.claude-plugin/marketplace.json`. Keep the local checkout available when the installation reads from it. Verify the plugin commands in Claude Desktop's local Code view. The CLI is an agent-managed installation tool; continued user work is in the desktop app. Do not substitute a terminal session for a desktop test.

### Cursor local plugin instructions

Copy the contents of `plugins/design-studio` into an ordinary directory at `~/.cursor/plugins/local/design-studio`. Include the manifests, skills, scripts, and assets. Preserve any existing installation; inspect it and use the tool's supported update workflow rather than overwriting custom files.

Do not symlink this plugin directory to a checkout elsewhere: Cursor skips local-plugin links whose targets are outside `~/.cursor/plugins/local`. This restriction is separate from the studio's generated project skill adapters. Ask the person to restart Cursor or use **Developer: Reload Window**, then verify components in **Customize**. A marketplace plugin with the same name takes precedence over the local copy. Respect organization restrictions on local imports and offer direct-source setup when blocked.

Official references: [OpenAI local plugin packaging](https://developers.openai.com/plugins/build/plugins), [Claude plugins](https://code.claude.com/docs/en/plugins), [Claude Desktop](https://code.claude.com/docs/en/desktop), [Cursor local plugins](https://cursor.com/docs/plugins#test-plugins-locally).

## For the agent carrying out studio setup

Use the existing [create-studio skill](plugins/design-studio/skills/create-studio/SKILL.md). That procedure and its [host handoff](plugins/design-studio/skills/create-studio/references/host-handoff.md) are the authoritative setup instructions for every supported host.

Without an installed plugin, download a temporary shallow checkout of this public repository through your supported tools. Record its full commit SHA and read the skill, helper, and references from that same checkout. This is setup tooling, not the person's studio. Inspect `plugins/design-studio/scripts/bootstrap.mjs` before execution; it pins the starter revision independently. Run the helper from that checkout and create the owned studio in the destination specified by the skill. Do not use the temporary checkout as the person's workspace. No repository duplication or remote is needed.

Follow that procedure through verified preview and workspace handoff. Preserve existing studios and use open-studio for them; a missing receipt does not authorize initialization.

When publication is explicitly requested, continue with [DEPLOY.md](DEPLOY.md) after local setup. Its ChatGPT Sites path routes to the publish-studio skill; its other paths use the selected provider's tools. Setup alone does not request publication. Carry any chosen provider and audience through a restart handoff. If publishing is unavailable, complete local setup and explain the missing capability.
