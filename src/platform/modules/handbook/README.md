---
title: "Build your Handbook"
description: "Curate shared context and agent instructions."
section: "Maintain"
order: 20
toc: true
slug: "handbook"
---

# Handbook

The Handbook holds shared content in `src/handbook/`. It appears under **Handbook** in the app.

| Part | Intended use |
| --- | --- |
| Docs | Context and guidance for people, agents, or both. |
| Rules | Standing instructions for agents. |
| Skills | Procedures for agents to perform specific tasks. |

Docs do not need to be written for agents. If a doc also provides useful agent context, reference it in `AGENTS.md`. Rules and Skills are specifically for agents.

The starter's Principles and Personas describe Design Studio. They are examples to adapt or replace with your own product context. Keep prototype-specific material in the prototype.

## Add and edit content

Ask your agent to add or update content from the material you supply. Locally, you can also open **Docs**, **Rules**, or **Skills** and select **New** (+) or **New skill**.

Docs and Rules support Markdown files and folders. Each skill needs its own folder and a `SKILL.md`. Supporting files can live beside it.

To edit text:

1. Select **Edit source** in the file's right-click menu.
2. Edit the text.
3. Save with Command+S on macOS or Ctrl+S on other systems.
4. Select **Done** to return to the page.

Published Handbook pages are read-only.

## Connect content to agents

`AGENTS.md` can point to any Handbook document. References can apply every session or only to relevant tasks. Presence in the Handbook does not guarantee that an agent reads the file.

Ask your agent to add the appropriate reference when context should guide future work. See [Work with your agent](/guide/agents) for how instructions and skills are used.

## Edit the Guide

The Guide is shared platform documentation. Its pages can be edited locally:

1. Open the Guide chapter and select **Edit**.
2. Edit its Markdown.
3. Save with Command+S on macOS or Ctrl+S on other systems.
4. Select **Done** to return to the chapter.

A module chapter opens its full README, including the developer section hidden in the Guide. The editor prompts you if external changes conflict with unsaved edits. Published Guide pages are read-only.

## Shared scope

The Handbook is shared platform content. Changes follow the maintainer's review process. Local edits reach other contributors when shared through Git.

Build checks validate the Handbook's structure and linked agent instructions. They do not assess the accuracy of your content.

## For developers

Repository links to module READMEs and contracts open the platform's read-only reference reader at `/reference/<source-path>`. It retains developer sections and resolves relative links back to Handbook content. Only core references and enabled modules' Markdown are bundled. This reader does not depend on the Guide or prototype Documents.

The Handbook: the docs, rules and skills in `src/handbook/` that people and agents read, at `/handbook`. Required.

- `module.ts`, `app.tsx`: who it is, its rail button and routes.
- `map.ts`: how an agent reads the Handbook, worked out from the files.
- `type.ts`, `open.tsx`, `loader.ts`: the Handbook's Markdown file type. It uses the shared platform reader and does not depend on prototype Documents.
- `rules.ts`: what may change in the Handbook (its fixed shape), checked on every change.
- `skills.ts`: how a skill's folder and SKILL.md are read and written.
- `pages/`: the Handbook header and the dialogs for new files (browser).
- `node/handbook-check.js`: the shape check the build runs (Node).
