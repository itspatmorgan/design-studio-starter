---
title: "Work with your agent"
description: "Describe the outcome, supply context, and direct the result."
section: "Begin"
order: 3
toc: true
---

Once your studio is available locally, use your coding agent to turn an idea into work you can review. The agent works with the repository; Design Studio does not supply a separate hosted agent service.

## Start with an outcome

Describe the people, problem, and constraints. Supply references or examples when they help explain the result you want.

For example: "Build a feedback inbox for a product manager. Use our components. Include an empty state, a list, and a form to add feedback. Use sample data."

The agent should ask for unresolved decisions that affect the result. It should carry out the work it can perform and make the result available for review.

![The human provides direction; the agent reads context, builds, and checks; the human reviews and directs the next change.](/guide/agent-cycle.svg)

Review behavior as well as appearance. Try the empty state, submit the form, and inspect the result. Ask for a specific refinement, such as: "Keep the form open after an error and explain how to correct it."

You can also edit files and use the studio UI directly. Give the agent new context when your edits change the direction of the work.

## How repository instructions guide the work

`AGENTS.md` is the starting point. It tells compatible agents what to read at the start of a session and which instructions apply to particular tasks.

| Source | How it helps |
| --- | --- |
| Handbook Docs | Product facts, principles, research, and guidance for people, agents, or both. |
| Handbook Rules | Standing instructions for agents, such as where to put prototype code. |
| Handbook Skills | Procedures for tasks such as setting up a contributor or importing a design system. |
| Repository scripts | Repeatable operations, such as creating a prototype or checking a build. |

A rule can tell the agent to run a script. A skill can combine scripts, human input, and review into a procedure. Not every task needs a skill.

For a new prototype, the repository instructions tell the agent to identify your contributor folder and run `pnpm new "Prototype Name"`. It then builds the views, keeps dependencies within their boundaries, and runs `pnpm build` before committing completed work. It should push only when you ask to share.

These instructions guide the agent. Git hooks and build checks provide separate checks on the resulting files; they do not enforce every instruction or design decision.

## Make context available

An agent does not necessarily read every file in the repository. Ask it to read `AGENTS.md` first if your agent does not load it automatically.

`AGENTS.md` can reference Docs, Rules, or Skills. References may apply every session or only when a relevant task occurs. Ask the agent to add a reference when shared context should guide future work.

Skills live in `src/handbook/skills/`. Links in `.agents/skills` and `.claude/skills` expose the same files to compatible agents. Discovery and available tools depend on the agent you use.

Keep decisions about the feedback inbox in its prototype. Put product-wide guidance in the Handbook, then ensure the agent knows when to read it.

## Included procedures

| Ask your agent | Procedure |
| --- | --- |
| "Set up my studio." | `initialize-studio` |
| "Get me set up as a contributor." | `setup-contributor` |
| "Set up our design system." | `setup-design-system` |
| "Document this component." | `document-component` |

Provide source material when the agent needs it. Review assumptions and incomplete work before treating the result as ready.
