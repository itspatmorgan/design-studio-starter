---
title: "Set up"
description: "Ask your coding agent to open your studio, then make it your own."
section: "Begin"
order: 2
toc: true
---

Your coding agent can handle downloading and opening Design Studio for you. The bundled systems and prototypes are examples for learning. Explore them first, then customize, replace, or remove them to fit your needs.

## Choose your setup method

Use a desktop coding app with local access. Choose the matching path in the [setup instructions](https://github.com/itspatmorgan/design-studio-starter/blob/main/SETUP.md):

| Method | Where to start |
| --- | --- |
| [1. Codex plugin](https://github.com/itspatmorgan/design-studio-starter/blob/main/SETUP.md#1-codex-plugin) | Ask a local Codex desktop chat to install the plugin, then create your studio. |
| [2. Claude Code plugin](https://github.com/itspatmorgan/design-studio-starter/blob/main/SETUP.md#2-claude-code-plugin) | Install through Claude Desktop’s plugin controls, or let a local agent register it. Continue in Code with Local selected. |
| [3. Cursor plugin](https://github.com/itspatmorgan/design-studio-starter/blob/main/SETUP.md#3-cursor-plugin) | Let Cursor’s local agent install the plugin, reload, and verify its skills in Customize. |
| [4. Direct from source](https://github.com/itspatmorgan/design-studio-starter/blob/main/SETUP.md#4-direct-from-the-source-repository) | Give your local agent the setup request. No plugin is needed. |

The first release is planned around local and repository installs, without waiting for reviewed public-directory listings. Plugins are currently experimental. Cursor and direct-source journeys still need live verification. If your organization restricts plugin installs, use the direct-source path.

Your agent handles downloading, missing dependencies, and opening the preview. It may ask for permission to create files or install tools. All studio files live locally on your computer. The default is `~/Developer/Design Studio`; additional installs add a number. Developer is an ordinary folder in your home folder for keeping your studios together.

After setup, continue in the actual studio folder the agent shows you. A preview alone does not select that folder in your coding app. To return later, open that same folder and ask “Open my Design Studio.” If you are joining a team, ask the agent to help you join its existing studio.

## Run the starter

For people who prefer terminal setup: create a repository from this GitHub template, clone your copy, then move into its directory. Install [mise](https://mise.jdx.dev/installing-mise.html) if needed. From the repository directory, run:

```sh
mise install
mise exec -- pnpm install
mise exec -- pnpm dev
```

`mise install` installs the Node.js and pnpm versions listed in `mise.toml`. `mise exec --` runs pnpm with those versions even when your shell is not configured to activate mise. Open the local URL printed by Vite.

## Explore, then configure

The starter is ready to explore as soon as it runs. Product and Marketing are example systems. Feedback Inbox and Design Studio Marketing are example prototypes that show how those systems work. Try their screens and artifacts, then browse the Guide at `/documentation/guide`. You do not need to choose a studio name, personal or team use, or a design system before your first run.

When you want to adapt the environment, open the repository with your coding agent and ask it to configure your studio. It can help with the studio name, personal or team use, contributor identity, optional modules, design system, and system context. Bring your own system source and product context when you have them; you can also keep the starter system while exploring.

After contributor setup, open **Studio settings** from the local gear icon or search. Admins can change the studio's identity, default design system, and enabled optional modules there. Team setup assigns at least one Admin. In personal use, your local contributor is automatically an Admin. See [Configure the studio](/documentation/guide/customize#configure-the-studio) for the settings workflow.

If you are joining an existing studio, ask your agent to set you up as a contributor. It should preserve the studio's shared configuration and content.

Configuration can continue after first run. Personal local use does not require GitHub or hosting. For collaboration through GitHub, use an account with access to the repository.

## Make it your own

The examples demonstrate what Studio can do. Keep them while exploring, then choose what fits your work. Ask your agent to help with the next step you need:

- **Set your studio identity.** Choose your name, tagline, personal or team use, contributors, and Admins in [studio configuration](/documentation/guide/customize#configure-the-studio).
- **Make your first prototype.** Describe what you want to make. Your agent can use an existing system to give you a working example of your own.
- **Choose your system.** Keep or adapt Product and Marketing, curate a small kit for your first prototype, or assess your existing React components and theme. See [Systems](/documentation/guide/systems#bring-your-own-system). Add your team's context when you have it.
- **Decide what examples to keep.** Keep, customize, or remove Feedback Inbox and Design Studio Marketing. Remove unused sample systems only after checking which prototypes use them. Keep Studio and one default prototype system.
- **Choose your modules.** Turn off optional capabilities you do not need in Studio settings.

When you are ready to collaborate through a shared repository, review branch rules and repository permissions with your maintainer. Full template copies include `.github/workflows/scope-check.yml`; agent-created working studios omit publishing workflows.

When you want a shared viewing URL, ask your agent to help with publishing. Run `pnpm build`, deploy `dist/`, and test a direct prototype link and reload. [Publishing](/documentation/reference/platform/context/publishing.md) covers base paths, routing, and access settings.

Starter cleanup is a maintainer change for a new studio. If you are joining an existing studio, preserve its shared setup and other contributors' work.
