---
title: "Set up"
description: "Run the starter locally, then configure it when you are ready."
section: "Begin"
order: 2
toc: true
---

Start the template from your terminal. You can explore the working starter before you configure it or ask an agent to change anything.

## Run the starter

Create a repository from this GitHub template, clone your copy, then move into its directory. Install [mise](https://mise.jdx.dev/installing-mise.html) if needed. From the repository directory, run:

```sh
mise install
mise exec -- pnpm install
mise exec -- pnpm dev
```

`mise install` installs the Node.js and pnpm versions listed in `mise.toml`. `mise exec --` runs pnpm with those versions even when your shell is not configured to activate mise. Open the local URL printed by Vite.

## Explore, then configure

The starter is ready to explore as soon as it runs. Try the Feedback Inbox sample and browse the Guide at `/documentation/guide`. You do not need to choose a studio name, personal or team use, or a design system before your first run.

When you want to adapt the environment, open the repository with your coding agent and ask it to configure your studio. It can help with the studio name, personal or team use, contributor identity, optional modules, design system, and system context. Bring your own system source and product context when you have them; you can also keep the starter system while exploring.

After contributor setup, open **Studio settings** from the local gear icon or search. Admins can change the studio's identity, default design system, and enabled optional modules there. Team setup assigns at least one Admin. In personal use, your local contributor is automatically an Admin. See [Configure the studio](/documentation/guide/customize#configure-the-studio) for the settings workflow.

If you are joining an existing studio, ask your agent to set you up as a contributor. It should preserve the studio's shared configuration and content.

Configuration can continue after first run. Personal local use does not require GitHub or hosting. For collaboration through GitHub, use an account with access to the repository.

The starter includes a Feedback Inbox sample owned by `patrick`. You can inspect it or ask an agent to help create your own prototype. Removing the sample is a maintainer change.
