---
title: "Handbook"
description: "Keep product context and agent instructions in the studio."
section: "Working in the studio"
order: 15
toc: true
slug: "handbook"
---

# Handbook

The Handbook holds shared context for people and agents. Its files live in `src/handbook/` and appear under **Handbook** in the app.

## Choose the right part

| Part | What belongs here | Example |
| --- | --- | --- |
| Docs | Product context. | Principles, intended users, or research summaries. |
| Rules | Standing instructions. | Contributor boundaries or component conventions. |
| Skills | Procedures for specific tasks. | Setting up a contributor. |

The starter's Principles and Personas describe Design Studio. They demonstrate useful context; adapt or replace them for your product.

Keep prototype-specific decisions in that prototype. Use the Handbook for context that applies across work.

## Add context

Ask your agent to add or update a document. Supply the facts, decisions, or source material it needs.

You can also create content locally:

1. Open **Handbook**.
2. Select **Docs**, **Rules**, or **Skills**.
3. Select **New** (+) in the Files row, or **New skill** in Skills.
4. Enter the requested details.

Docs and Rules support documents and folders. Skills requires a skill folder with a `SKILL.md` file.

A skill's name and description appear above its content. Supporting files can live beside `SKILL.md` inside its folder.

To edit text, right-click the file and select **Edit source**. Save your changes, then select **Done**.

## Make context available to agents

`AGENTS.md` points to rules and skills. Ask your agent to update the routing when a new rule needs to apply to future work.

A document's presence does not guarantee an agent reads it. Relevant session and task instructions must point to the context it needs.

See [Agents](/guide/agents) for the included skills and how agents use these files.

## Review shared changes

The Handbook is shared platform content. In a team studio, propose changes on a branch and use the maintainer's review process.

Local editing changes your copy. It does not update another contributor's copy until those changes are shared through Git.

The deployed Handbook is read-only. Build checks validate its structure and linked agent instructions.

## For developers

The Handbook: the docs, rules and skills in `src/handbook/` that people and agents read, at `/handbook`. Required.

- `module.ts`, `app.tsx`: who it is, its rail button and routes.
- `map.ts`: how an agent reads the Handbook, worked out from the files.
- `rules.ts`: what may change in the Handbook (its fixed shape), checked on every change.
- `skills.ts`: how a skill's folder and SKILL.md are read and written.
- `pages/`: the Handbook header and the dialogs for new files (browser).
- `node/handbook-check.js`: the shape check the build runs (Node).
