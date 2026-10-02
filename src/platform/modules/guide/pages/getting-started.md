---
title: "Getting started"
description: "Set up or join a studio, then create your first prototype."
order: 2
toc: true
---

Your agent handles installation, configuration, and verification. You provide the identity, goals, and source material it needs.

## Choose your setup

| Your situation | Ask your agent |
| --- | --- |
| You have a new copy of the starter. | "Set up my studio." |
| You are joining a studio that already exists. | "Get me set up as a contributor." |
| You stopped partway through setup. | "Resume my studio setup." |

Personal and team studios use the same contributor system. Personal local use does not require GitHub or a hosted site.

## Before you start

Open the studio repository with your coding agent. A repository is the folder that Git uses to store and track your work.

The studio uses Git and [mise](https://mise.jdx.dev). Mise provides the pinned Node and pnpm versions. Your agent can help install these tools.

To collaborate through GitHub, you also need an account and access to the studio's repository.

## Set up a new studio

Ask: "Set up my studio."

The agent helps you choose the studio name, personal or team use, and enabled modules. It registers you as the first contributor.

Provide these details when the agent asks:

- Your name and the email you use for Git commits.
- Your GitHub username, if you will share changes through GitHub.
- Your product's components, design tokens, or other design guidance.
- Context for the Handbook, such as your product principles and intended users.

The agent verifies the build and a working prototype. If materials are missing, it explains what remains to do.

## Join an existing studio

Ask your agent to clone the team's repository and set you up as a contributor. Provide the repository address and your contributor details.

The agent installs dependencies and creates or reuses your registration. It preserves the studio's configuration, design systems, and Handbook.

Use the same email for Git and your contributor entry. For a team studio, use the identity your team expects.

## Use your product's design system

The starter includes **Product**, an example design system. You can try the studio with it before replacing it.

Give your agent your component code or package, design tokens, and supporting guidance. Ask it to set up your design system.

Review the result on the **Systems** pages. Keep Product until the replacement works and retained prototypes no longer need it.

Changing the default system does not migrate existing prototypes. Ask your agent to update their component imports and system choice together.

## Try the sample

Open **Feedback Inbox** from the **Prototypes** page. Read **Start Here** for a tour of screens, states, documents, and canvases.

The sample belongs to `patrick`. Ask your agent to copy useful parts into a prototype in your own folder. The studio maintainer can remove the shared sample.

## Create your first prototype

1. Ask: "Make a prototype called Hello World."
2. Describe the screen or flow you want to try.
3. Review the result in the app.
4. Ask for changes to the layout, content, or behavior.

Your agent creates the prototype in your folder. You can also select **New prototype** on the Prototypes page while running locally.

## Save and share

| Action | Result |
| --- | --- |
| Save a file | Updates your local copy. |
| Commit | Records a version in Git. |
| Push | Sends commits to the shared repository. |
| Publish a site | Makes a built version available through a configured host. |

Ask your agent to commit completed work. When you want to share the commits, ask it to push through your team's review process.

A push to `main` runs checks and creates a site artifact. It publishes a site only after the maintainer connects a host.

See [Scopes](/guide/scopes) for contributor permissions and [Modules](/guide/modules) for studio configuration.
