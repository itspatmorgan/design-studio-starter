---
title: Handbook
description: Your team's context and instructions, for the people and the agents who work here.
---

The Handbook is where this environment's context and instructions live. It's a folder of Markdown files (and the occasional script) in `src/handbook/`, shown here as a tree, like a prototype's files.

Organize it the way that suits your team. To start, it has three folders:

- **docs/** is context for people and agents: what good design means here (principles), who you design for (personas), and anything else worth writing down once.
- **rules/** is what your agent knows and follows every session. `AGENTS.md` at the top of the repo points to these.
- **skills/** is procedures your agent follows when you ask, one folder each, with a `SKILL.md` that says when to use it. A skill can hold scripts and reference files beside it.

These are platform files: whoever maintains this environment owns them, and changes are reviewed like code. You can read them here, but the app won't edit them. To change one, ask your agent to edit the file in `src/handbook/`, or open it in your editor from the file's right-click menu.
