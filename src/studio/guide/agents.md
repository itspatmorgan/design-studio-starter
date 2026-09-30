---
title: "Agents"
description: "How the kit teaches any coding agent to work within it."
section: "Core concepts"
order: 13
toc: true
---

The kit works with any coding agent. Everything the agent needs to know lives once, in `src/handbook/`, and `AGENTS.md` points to it.

## AGENTS.md

`AGENTS.md` is the file most coding agents read first. It's short on purpose: who you are, the two scopes, and which rules to read.

## Rules

Rules in `src/handbook/rules/` are standing knowledge the agent reads every session:

- `systems.md`: the two systems, icons, and theme colors
- `prototype-workflow.md`: what a prototype is, and how to build one
- `contributor-scope.md`: working out who you are, and staying in your folder

Keep them short. A rule that says too much gets followed into situations it wasn't written for.

## Skills

Skills are step-by-step instructions for a specific task, used only when the task comes up. The kit ships one, `setup-contributor`, which handles onboarding: confirming your details with you, then running `pnpm join`.

Skills live in `src/handbook/skills/`. Different agents look for skills in different places, so `.agents/skills` and `.claude/skills` are links to the same folder.

## Rules for judgment, scripts for repetition

When something needs to happen the same way every time, like creating a prototype, it's a script, and the rule just says to run it. Rules and skills are for the parts that need judgment.
