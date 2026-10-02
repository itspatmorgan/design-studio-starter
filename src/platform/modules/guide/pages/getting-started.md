---
title: "Set up or join a studio"
description: "Let your agent prepare a local environment for you."
section: "Begin"
order: 2
toc: true
---

Your coding agent handles installation, configuration, and verification. You provide the identity, choices, and source material it needs.

## Start or resume setup

Open the repository with your agent and use the request that fits your situation:

| Situation | Ask your agent |
| --- | --- |
| New copy of the starter | “Set up my studio.” |
| Joining an existing studio | “Get me set up as a contributor.” |
| Setup stopped partway through | “Resume my studio setup.” |

The studio uses Git and mise. Mise supplies the pinned Node and pnpm versions. The agent can help install these tools and the project dependencies.

Personal and team studios use the same contributor system. Personal local use does not require GitHub or hosting. To join through GitHub, provide the repository address and an account with access.

## What the agent sets up

For a new studio, the agent helps configure its name, personal or team use, and optional modules. It registers the first contributor and helps establish the design system and Handbook context.

When you join an existing studio, it creates or reuses your contributor registration. It preserves the studio's shared configuration and content.

Provide your name and Git commit email when asked. Provide your GitHub username if you will share through GitHub. Use the same email in Git and your contributor entry.

## What should be ready

Setup should leave you with a running local studio, your contributor registration, and a working first prototype. The agent verifies the build and reports missing materials or unfinished setup.

The starter includes a Feedback Inbox sample owned by `patrick`. You can inspect it or ask the agent to copy useful parts into your own prototype. Removing the shared sample is a maintainer change.

Next, [set up your design system](/guide/setup-design-system), or keep the example system while trying the studio.
