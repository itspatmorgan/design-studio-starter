---
title: "Handbook"
description: "The team's context and instructions, for the people and the agents who work here."
section: "Core concepts"
order: 16
toc: true
slug: "handbook"
---

# Handbook

The Handbook is where your team writes down how it works, so that people and agents can follow it. It's a set of Markdown files, shown in the app under **Handbook** and kept in `src/handbook/`.

It has three parts, and the shape is fixed so that nothing gets lost:

- **Docs** are context: what good design means here, who you design for, and anything worth writing down once. The kit starts with placeholders for design principles and personas. Replace them with yours.
- **Rules** are what your agent knows and follows, every session or when a task comes up. `AGENTS.md` points to them.
- **Skills** are procedures your agent follows when you ask, like setting up a contributor. Each is a folder with a `SKILL.md` that says what it does and when to use it, and any scripts or references beside it.

## Adding to it

In the Handbook navigation, the **+** at the end of the Files row makes what the open tab holds: a document or a folder in Docs and Rules, and a skill in Skills. **New skill** asks for a name (lowercase words joined by hyphens) and a description, and follows the [Agent Skills format](https://agentskills.io/specification), so any agent that reads skills can use it. The skill's name is its page title and the description sits under it, so its text needs no heading of its own. Inside a skill you can add any files or folders.

Your agent can do the same. Ask it to add a doc, a rule, or a skill, and it follows `src/handbook/rules/handbook.md`. The build checks the shape, and says what to fix if a file or folder is out of place.

## Who can change it

The Handbook is part of the platform, so it isn't yours alone. You can edit it on your own branch, and the change goes through a pull request. The maintainer decides what goes in. While you run the app locally you can edit it in the app. On the deployed site it's read-only.

## For developers

The Handbook: the docs, rules and skills in `src/handbook/` that people and agents read, at `/handbook`. Required.

- `module.ts`, `app.tsx`: who it is, its rail button and routes.
- `map.ts`: how an agent reads the Handbook, worked out from the files.
- `rules.ts`: what may change in the Handbook (its fixed shape), checked on every change.
- `skills.ts`: how a skill's folder and SKILL.md are read and written.
- `pages/`: the Handbook header and the dialogs for new files (browser).
- `node/handbook-check.js`: the shape check the build runs (Node).
