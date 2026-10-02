---
title: "Getting started"
description: "Get set up and make your first prototype, with your agent doing the typing."
order: 2
toc: true
---

Ask your coding agent to set you up. It performs installation, configuration and checks, and asks you for identity, design decisions or source material it cannot determine. You can use Design Studio personally or with a team; both use the same prototype and contributor system.

## Before you start

You need Git, [mise](https://mise.jdx.dev) for the pinned Node and pnpm versions, and a coding agent. The agent can install and configure the local tools. A shared GitHub repository and your own GitHub account are needed when collaborating through GitHub, but personal local use needs neither a remote nor hosting.

## Initialize a studio

For a new copy of the starter, ask: "Initialize my studio." The agent follows `initialize-studio`, establishes personal or team use, configures the studio's name and active modules, registers you, and helps set up your design system and Handbook. Tools is disabled in the beta starter; its code stays available to enable later.

`studio.config.ts` holds the lasting choices. Under the hood, `pnpm studio configure` previews changes to name, tagline, usage and default system; `--yes` applies them. `pnpm -s studio status --json` reports current configuration, contributor identity, modules, systems and remaining Handbook placeholders. It does not declare setup complete: the agent verifies the build and a first working prototype.

## Join an existing studio

Clone your team's repository and ask: "Get me set up as a contributor." The agent follows `setup-contributor`, installs dependencies, checks your Git identity, and registers your own `contributors/<key>.json` and prototype folder. It preserves the shared studio configuration and design system. Matching existing registrations are reused, so interrupted onboarding can resume.

Use the same email in your Git identity and contributor entry. A personal studio accepts a personal email. For a shared studio, use the identity your team expects and register your GitHub username before sharing changes through GitHub. Your agent checks any uncertain details with you.

## Bring your design system

Product is the placeholder kit. Supply your agent with existing component code or a package, tokens, design files or written guidance. It follows `setup-design-system`, imports and documents the kit, verifies its theme and representative components, then makes it the default. You can review the result on the Systems pages. Keep Product until the replacement works; the agent checks retained prototypes and disabled sample content before retiring it. Missing materials remain explicit next steps.

Changing the default with `pnpm studio configure --system <key>` keeps existing prototypes on their previous system, including content in disabled modules. New prototypes use the new default. To move an existing prototype to the replacement kit, ask your agent to update its component imports and system choice together.

## Take the tour

The kit comes with a sample prototype, **Feedback Inbox**: a small working app with three screens, a canvas, and two documents. Open it from the Prototypes page and read its **Start here** page. It walks through how a prototype is put together, with the real files to click through. It belongs to the sample contributor, `patrick`. To experiment, ask your agent to create a prototype in your own folder and bring over the parts you want. Only the studio maintainer should remove the shared sample.

## Make your first prototype

Ask your agent for one, like "Make a prototype called Hello World." It runs `pnpm new "Hello World"`, which creates the folder, fills in `meta.json`, and prints the URL. It shows up on the Prototypes page right away. You can also use **New prototype** on that page yourself.

From there, describe what you want to see. The agent builds it with the product components, so it looks like your product and not like this app.

## Save and share

Ask your agent to commit when a piece of work feels done. When you're ready for your team to see it, ask it to push. Pushing to main runs the checks described in [Scopes](/guide/scopes) and produces a site artifact. Your studio maintainer must connect the deployment workflow to your host before that push also publishes the site.
