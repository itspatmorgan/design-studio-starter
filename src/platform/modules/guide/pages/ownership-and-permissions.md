---
title: "Ownership and permissions"
description: "Work freely in your prototypes and review changes to shared areas."
section: "Collaborate"
order: 30
toc: true
---

Each contributor has a folder at `src/prototypes/<key>/`. This is your space to explore, create, change, delete, and share prototypes through your studio's Git workflow.

The agent identifies your contributor registration before working. In a personal studio, you can also act as the maintainer.

## Who approves a change

| Area | Default approach |
| --- | --- |
| Your prototypes | Work freely within prototype boundaries. |
| Your contributor registration | Add or update your entry through onboarding. |
| Another contributor's prototypes | Prepare a proposal for the owner to review and merge. |
| Shared platform | Obtain maintainer authorization. |

Shared platform files include the app, design systems, shared utilities, configuration, Handbook, and Guide.

The agent should not directly change another owner's working branch by default. It can prepare proposed changes on a separate branch for that owner to review and merge.

For shared changes, the agent should explain the proposal and seek authorization when the task does not already provide it. Existing authorization covers the necessary implementation.

## What enforces these boundaries

The local UI limits prototype editing to your contributor identity. That identity is a local convenience, not account authentication.

Agent rules guide editing scope. Git hooks report scope and identity. Build checks enforce dependency and style boundaries. GitHub checks flag platform proposals and check the pushing account's role for platform changes on `main`.

The maintainer must configure branch protection and required reviews to enforce the team's merge policy. These mechanisms serve different purposes; no single check enforces every ownership rule.

See [Checks and troubleshooting](/guide/checks-and-troubleshooting) for the checks and failure messages.
