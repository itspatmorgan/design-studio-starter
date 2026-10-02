---
title: "Agents"
description: "How the kit teaches any coding agent to work within it."
section: "Core concepts"
order: 13
toc: true
---

The kit works with any coding agent. Everything the agent needs to know lives once, in `src/handbook/`, and `AGENTS.md` points to it.

## AGENTS.md

`AGENTS.md` is the file most coding agents read first. It's short on purpose: it only routes, to the rules to read and the skill to follow. Everything it points to is in the [Handbook](/guide/handbook).

## Rules

Rules in `src/handbook/rules/` are standing knowledge the agent reads every session:

- `systems.md`: the two systems, icons, and theme colors
- `prototype-workflow.md`: what a prototype is, and how to build one
- `contributor-scope.md`: working out who you are, and staying in your folder

Others are read when the task comes up: `documents.md`, `canvases.md`, and `handbook.md`.

Keep them short. A rule that says too much gets followed into situations it wasn't written for.

## Skills

Skills are step-by-step instructions for a specific task, used only when the task comes up. The kit ships four: `initialize-studio` configures a new personal or shared studio; `setup-contributor` onboards someone into an existing studio; `setup-design-system` establishes or replaces its product kit; `document-component` adds a component page and live examples. Agents perform the work, ask for missing context, and verify the result.

Skills live in `src/handbook/skills/`. Different agents look for skills in different places, so `.agents/skills` and `.claude/skills` are links to the same folder.

## Rules for judgment, scripts for repetition

When something needs to happen the same way every time, like creating a prototype, it's a script, and the rule just says to run it. Rules and skills are for the parts that need judgment.
