---
title: "Handbook"
description: "Give your team and agent shared context."
section: "Studio"
order: 13
toc: true
slug: "handbook"
---

# Handbook

The Handbook holds shared context for your team and instructions for your agent. Use it for knowledge that should carry across prototypes.

| Part | What belongs there |
| --- | --- |
| Context | Personas, principles, research, and other shared knowledge. |
| Rules | Standing constraints the agent should follow. |
| Skills | Procedures the agent can use for specific tasks. |

The starter's Personas and Principles describe Design Studio. Adapt or replace them with your own product context. Keep goals and decisions for one exploration inside its prototype.

## Give your agent useful context

Ask your agent to add or update Handbook content from material you supply. You can also use **+** in navigation and the [shared source workflow](/documentation/guide/home#working-with-files).

A file being visible in the Handbook does not guarantee that the agent reads it. Ask the agent to connect relevant context, rules, and skills to the repository's instructions in `AGENTS.md`.

You do not need to author everything up front. Add context when it helps the agent understand your product or improves recurring work.

## Keep shared knowledge clear

Handbook changes affect the team, so follow your maintainer's review process. Local edits reach other contributors when shared through Git.

For documentation supplied by the platform itself, open [Documentation](/documentation/guide/documentation). The Handbook is where your team's context belongs.

## For developers

Repository links to module READMEs and contracts use `/documentation/reference/<source-path>`. References open in Documentation, preserving heading links. It retains developer sections and resolves relative links back to Handbook content. Only core references and enabled modules' Markdown are bundled. This reader does not depend on the Guide or prototype Documents.

The Handbook: the docs, rules and skills in `src/handbook/` that people and agents read, at `/handbook`. Required.

- `module.ts`, `app.tsx`: who it is, its rail button and routes.
- `map.ts`: how an agent reads the Handbook, worked out from the files.
- `type.ts`, `open.tsx`, `loader.ts`: the Handbook's Markdown file type. It uses the shared platform reader and does not depend on prototype Documents.
- `rules.ts`: what may change in the Handbook (its fixed shape), checked on every change.
- `skills.ts`: how a skill's folder and SKILL.md are read and written.
- `pages/`: the Handbook header and dialogs for new files (browser).
- `node/handbook-check.js`: the shape check the build runs (Node).
