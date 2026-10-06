---
title: "Set up"
description: "Ask your coding agent to open your studio, then make it your own."
section: "Begin"
order: 2
toc: true
---

Your coding agent can handle downloading and opening Design Studio for you. The bundled systems and prototypes are examples for learning. Explore them first, then customize, replace, or remove them to fit your needs.

## Ask your agent to set it up

Open a local coding tool such as ChatGPT/Codex, Claude Code, or Cursor. Copy the request from [Set up with your agent](https://github.com/itspatmorgan/design-studio-starter/blob/main/SETUP.md) into its chat.

The agent prepares a studio in your user Developer folder and opens a preview. It may ask for permission to create the folder or install a missing tool. When it finishes, continue working in the studio folder it shows you.

Native Design Studio plugins are being tested. If you already have the experimental plugin, ask: “Create my Design Studio.” Public directory installation will be available after release.

If you already have a studio, ask your agent to open it. If you are joining a team, ask it to help you join the team's existing studio.

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

The examples demonstrate what Studio can do. They are meant to be customized, replaced, or removed as you make the studio your own. Ask your agent to help with this checklist:

- **Set your studio identity.** Choose your name, tagline, personal or team use, contributors, and Admins in [studio configuration](/documentation/guide/customize#configure-the-studio).
- **Delete the example prototypes.** Remove Feedback Inbox and Design Studio Marketing, both owned by `patrick`, and their unused demo assets.
- **Replace the starter systems.** Adapt or replace Product and Marketing, or remove either system you do not need. Bring your own components, styles, and product context. Keep Studio and one default prototype system; see [Systems](/documentation/guide/systems#bring-your-own-system).
- **Choose your modules.** Turn off optional capabilities you do not need in Studio settings.
- **Configure your repository and deployment.** Review `.github/workflows/scope-check.yml`, branch rules, and repository permissions. Configure publishing for your host; template copies run checks but do not deploy automatically.
- **Verify before publishing.** Run `pnpm build`, deploy `dist/`, and test a direct prototype link and reload. [Publishing](/documentation/reference/platform/context/publishing.md) covers base paths, routing, and access settings.

Starter cleanup is a maintainer change for a new studio. If you are joining an existing studio, preserve its shared setup and other contributors' work.
