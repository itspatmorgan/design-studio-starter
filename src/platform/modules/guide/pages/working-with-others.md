---
title: "Review and share work"
description: "Save progress, collaborate through Git, and prepare a useful handoff."
section: "Collaborate"
order: 21
toc: true
---

A working prototype gives people something tangible to discuss. Before sharing the feedback inbox, check the flow and record what it demonstrates.

## Prepare the review

State the question you want reviewers to answer. Include important states, sample data, and known gaps. If Documents is enabled, keep this context beside the views. A canvas can help explain a flow when Canvases is enabled.

Copy an item's URL or select **Copy link** in its file menu. A local URL works only where that local server is accessible. Other contributors can run the repository locally; a configured published site supplies a shared viewing URL.

## Save, commit, and push

![Local files are saved and committed, then pushed to GitHub. A checked build can be published through a configured host.](/guide/save-and-share.svg)

| Action | Result |
| --- | --- |
| Save | Changes a file in your local copy. |
| Commit | Records a version in Git. |
| Push | Sends commits to the shared repository. |
| Publish | Makes a built site available through a configured host. |

Ask the agent to commit completed work. When you want to share the commits, ask it to push through your team's Git workflow. Contributors receive repository changes by pulling them into their own copies.

### What happens at a Git hook

A Git hook is a script that runs during a Git operation. Installing the project's dependencies normally sets up these hooks through Husky.

Before a commit, the hooks check staged file sizes and the module configuration and dependencies. These checks can block the commit. Scope and identity checks also report which files changed and whether your Git identity matches your contributor entry; those reports do not block the operation.

Before a push, a hook reports the scope of the outgoing changes. This local hook does not run the full build. The agent should run `pnpm build` before committing completed work.

GitHub checks pull requests and pushes to `main`. See [Checks and troubleshooting](/guide/checks-and-troubleshooting) when a check fails.

## Choose the review path

Your folder, `src/prototypes/<your-key>/`, is your space to explore. You can create, change, delete, and push your prototypes without platform approval, while following your team's Git workflow.

| Change | Review path |
| --- | --- |
| Your prototypes | Work freely and share through your team's Git workflow. |
| Your contributor registration | Use onboarding to add or update your own entry. |
| Shared platform files | Obtain maintainer authorization. |
| Another person's prototypes | Prepare a proposal for the owner to review and merge. |

The app, design systems, shared utilities, Handbook, and Guide are shared platform files. Your agent should change them only when the task has maintainer authorization. Otherwise, it should explain the proposed change and seek approval.

Ask the agent to prepare changes to another person's prototype on a separate branch for owner review. A proposal does not authorize changes directly to their working branch. The owner decides whether to merge it.

In a personal studio, you can also act as the maintainer. The same boundaries help you understand the effects of a change.

## Prepare an engineering handoff

Give the engineer and their agent the prototype files and the context needed to understand them:

- The intended flow and the states it demonstrates.
- The design-system components it uses and any local experiments.
- Sample data, simulated behavior, and missing integrations.
- Decisions, assumptions, and unresolved questions.

For the feedback inbox, explain whether submitting feedback only changes local state or represents a proposed production service. Prototype code informs implementation; it still needs production engineering decisions and validation.
