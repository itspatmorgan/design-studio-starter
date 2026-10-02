---
title: "Agents"
description: "Give your agent the context and instructions it needs."
section: "Working in the studio"
order: 16
toc: true
---

Your agent builds and changes the studio from instructions in the repository. Supported tools and integrations depend on the agent you use.

## Direct the work

Tell the agent the outcome you want. Include the users, the problem, and any constraints you already know.

For example: "Build a feedback inbox for a product manager. Include an empty state and a form to add feedback."

The agent should ask for missing decisions, do the work it can perform, and verify the result. Review its work and direct changes.

## Give it lasting context

Save reusable product context in the [Handbook](/guide/handbook). Keep prototype-specific decisions beside that prototype.

The Handbook has three parts:

| Part | Purpose |
| --- | --- |
| Docs | Product context, such as principles and intended users. |
| Rules | Instructions that apply across tasks. |
| Skills | Procedures for a specific task. |

`AGENTS.md` tells the agent which files to read. It points to the Handbook rather than repeating its content.

Some rules apply every session. Others apply only to a particular task, such as editing a canvas or adding a module.

## Included skills

| Skill | Task |
| --- | --- |
| `initialize-studio` | Set up a new personal or team studio. |
| `setup-contributor` | Join an existing studio. |
| `setup-design-system` | Add or replace a prototype design system. |
| `document-component` | Document a component with examples and a props table. |

Skills live in `src/handbook/skills/`. Links in `.agents/skills` and `.claude/skills` expose the same files to compatible agents.

An agent that does not read these locations needs another way to load the instructions. Ask it to read `AGENTS.md` first.

## Repeatable tasks

Scripts handle tasks that need a consistent result, such as creating a prototype. Rules and skills tell the agent when to use them.

You direct the work. The agent runs the scripts and explains any input or decision it needs from you.
