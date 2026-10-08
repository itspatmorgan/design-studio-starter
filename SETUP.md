# Set up Design Studio

Choose one of four paths: Codex plugin, Claude Code plugin, Cursor plugin, or direct from the source repository. Use the desktop app and a local session so the agent can create files and run Studio on your computer. Each plugin prompt requests installation and studio creation together. If ChatGPT Sites is available, use the [setup-and-publish prompt](#set-up-and-publish-with-chatgpt-sites) instead.

The first release is planned around local and repository plugin installation. You do not need to wait for a listing in a reviewed public directory. The package is currently experimental; direct-source setup and the newly packaged starter still need native journey verification. Organization policies may limit plugin installation. If your tool cannot load a plugin, use the direct-source path below.

## 1. Codex plugin

Open a local chat in the Codex desktop app and give it this request:

> Install the Design Studio plugin locally for Codex from https://github.com/itspatmorgan/design-studio-starter. Read SETUP.md and follow its Codex plugin installation and linked create-studio instructions. Handle the technical steps, preserve my other plugins and existing files, and create my Design Studio on this computer. Open its local preview and help me continue working in its folder. Guide me through any restart, plugin activation, or new chat needed.

Your agent guides you through any restart, plugin activation, or new chat needed to complete setup.

## 2. Claude Code plugin

Open the Claude desktop app, choose **Code**, then select **Local**. Use **No folder** for initial setup when available. Copy this prompt to install the plugin and create your studio:

> Install the Design Studio plugin locally for Claude Code from https://github.com/itspatmorgan/design-studio-starter. Read SETUP.md and follow its Claude Code local plugin installation and linked create-studio instructions. Handle the technical steps, preserve my other plugins and existing files, and create my Design Studio on this computer. Open its local preview and help me continue working in its folder in Claude Desktop’s local Code view. Guide me through any restart, plugin activation, or new session needed.

Your agent guides you into your studio folder and through any restart, plugin activation, or new session needed.

You can also install from the repository catalog through **Customize → Plugins → Add plugin → Add marketplace**. Add `itspatmorgan/design-studio-starter`, install Design Studio, then ask **“Create my Design Studio.”** This is a repository install, not a reviewed public-directory listing.

## 3. Cursor plugin

Open a local Agent chat in Cursor and give it this request:

> Install the Design Studio plugin locally for Cursor from https://github.com/itspatmorgan/design-studio-starter. Read SETUP.md and follow its Cursor local plugin installation and linked create-studio instructions. Handle the technical steps, preserve my other plugins and existing files, and create my Design Studio on this computer. Open its local preview and help me continue working in its folder. Guide me through any window reload, plugin activation, or new Agent chat needed.

Your agent guides you through any window reload, plugin activation, or new Agent chat needed. Local imports must be allowed by your account or organization; if they are unavailable, use direct-source setup.

## 4. Direct from the source repository

No plugin is required. In any supported local desktop coding agent, give it this request:

> Help me install Design Studio from https://github.com/itspatmorgan/design-studio-starter. Read its SETUP.md and follow the linked create-studio instructions. Handle downloading, setup, and opening it for me. Save my Design Studio in my user Developer folder. Preserve anything already there. Show me the running Design Studio and help me continue working in its folder.

If you prefer manual setup, create your own repository with **Use this template** on GitHub, or download or clone the source. Open that folder in your coding app and ask the agent to follow the repository's setup instructions there. Manual terminal commands are in the [README](README.md#get-started).

All four agent-assisted paths create the same working-studio package. Plugin publishing files remain in the setup tooling. Manual template copies or clones include the complete maintainer repository.

## Set up and publish with ChatGPT Sites

Use this alternative prompt in a local Codex chat only if ChatGPT Sites is enabled and available. It requests plugin installation, studio creation, and publication together:

> Install the Design Studio plugin locally for Codex from https://github.com/itspatmorgan/design-studio-starter. Read SETUP.md and follow its Codex plugin installation, linked create-studio, and ChatGPT Sites publishing instructions. Handle the technical steps and preserve my other plugins and existing files. Create my Design Studio on this computer, verify its local preview, and publish a public review link with ChatGPT Sites. Keep authoring local, show me the published link, and help me continue working in my Design Studio folder. Guide me through any restart, plugin activation, or new chat needed. If ChatGPT Sites is unavailable, complete local setup and tell me what is needed to publish.

This beta workflow publishes a public review link. Anyone with the link can explore your built work; source files and editing stay local. Ask for a private site if you prefer.

After local changes, ask **“Publish my Studio”** to update the same Site with its existing audience. Local edits do not publish automatically. If publishing is unavailable or fails, you can continue working locally.

## What happens after setup

Your agent may need permission to download tools or create the folder. It handles the technical steps and tells you when it needs help.

Your studio and all its source files live locally on your computer. The default folder is `~/Developer/design-studio`; additional installs use `design-studio-2`, `design-studio-3`, and so on. Developer is an ordinary folder in your home folder for organizing these files. Your agent shows the actual absolute path and local preview URL. Continue working in that studio folder, not in the plugin's files. A GitHub account is optional for personal use.

Product and Marketing are example systems. Feedback Inbox and Design Studio Marketing are example prototypes for learning. Explore them, then ask your agent to customize, replace, or remove them for your own needs. Keep Studio, the application's system.

New studios start in Personal mode. When you are ready to collaborate, switch to Team in Studio settings. This enables Contributors & Permissions so you can assign Admins and system access.

To return later, open the same studio folder and ask **“Open my Design Studio.”** Plugin updates do not automatically upgrade an existing studio.

## For the agent installing a plugin

Obtain a checkout of the requested source with your supported tools and read its plugin package. Record its commit and package version. Keep setup tooling separate from the person's studio. Preserve occupied folders and existing plugin registrations. Handle missing tools through supported host mechanisms; the person should not need to enter terminal commands.

When the request includes studio creation, continue with [studio setup](#for-the-agent-carrying-out-studio-setup) after installation. Plugin registration alone does not complete that request. If a restart or new chat is required, provide a continuation handoff with the source checkout, installation status, chosen studio folder, and remaining steps. Include any requested Sites publication and audience. Resume the same request and destination after activation.

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

For requested ChatGPT Sites publication, continue with the [publish-studio skill](plugins/design-studio/skills/publish-studio/SKILL.md). It owns capability checks, Site identity, audience, deployment, and verification. If Sites is unavailable, complete local setup and explain the missing capability.

## Timed setup experiments

For a requested benchmark, capture the request start before obtaining the repository. Follow [benchmark boundaries](plugins/design-studio/experiments/benchmarking.md) after the checkout is available, backfilling only the captured timestamp. Report setup from the uninstalled state, publication from a prepared studio, and the full user wait through final handoff. Command durations are diagnostic details, never a substitute for the end-to-end time. Include restart or new-chat time when required.
