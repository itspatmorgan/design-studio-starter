---
title: "Understand Design Studio"
description: "Your own environment for design work with an agent."
section: "Begin"
order: 1
toc: true
---

Design Studio is a workspace for designers and product managers who build with coding agents. Use it on your own or with a team.

You direct the work. Your agent builds interactive prototypes, helps organize context, and checks the result. You review, edit, and refine it.

Design Studio Starter is the open source kit for this workspace. You own its code, the context you bring to it, and the designs you create.

## Understand the parts

![A studio contains shared design systems and Handbook context, alongside each contributor's independent prototypes.](/guide/studio-parts.svg)

A **prototype** holds an idea and the files that explain or demonstrate it. Code-based **views** are its core. Optional **documents** add written context. Optional **canvases** arrange screens, notes, and arrows together.

A **design system** supplies components and tokens for views that match your product. You can also build local components and explore new ideas within a prototype.

The **Handbook** holds context and instructions that apply across your work. Each contributor has a folder for their own prototypes. Shared platform changes follow the studio maintainer's review process.

## Work locally, share deliberately

The local app reads repository files. You and your agent can change those files while the studio runs. Git records versions and lets contributors share changes.

A published studio is a built site for viewing the work. Local setup does not require hosting. Sharing repository changes and publishing a site are separate steps.

## Read this Guide

The chapters follow a path from setup to creation, collaboration, and maintenance. Use **Next** to follow that path, or choose a chapter from the sidebar.

**Begin** explains setup and the agent's role. **Create** shows how views, components, text, and canvases support one idea. **Collaborate** covers shared context, review, and handoff. **Maintain** is for the person who configures and publishes the studio.

The **Reference** pages supply file conventions and detailed checks. **Releases** records changes to the starter.

Throughout the Guide, a feedback inbox provides a simple example: build an interactive flow, record its decisions, and prepare it for review. The starter includes a Feedback Inbox sample you can inspect.

## Edit the Guide

While running locally, select **Edit source** on a Guide page. Edit the Markdown, then save with Command+S on macOS or Ctrl+S on other systems. Select **Done** to return to the chapter.

The editor shows the source file path. A module chapter opens its full README, including the developer section that the Guide does not display. Guide changes are shared platform changes; use the maintainer's review process when sharing them.

If the agent changes the same file while you have unsaved edits, the editor asks which version to keep. Published Guide pages are read-only.
