---
title: "Prototypes"
description: "Explore ideas with artifacts that work together."
section: "Studio"
order: 11
toc: true
slug: "prototypes"
---

# Prototypes

A prototype is a workspace for an idea. It brings interactive screens and supporting context together, without affecting other prototypes.

Ask your agent to create one, or select **New prototype**. Give it a goal, then iterate with your agent as you review the result.

The creation dialog asks for a title and system. Choose an installed system for its components, styles, and guidance. Choose **No system — custom styling** to build with your own components and CSS instead.

The sidebar shows the prototype's assigned system beneath its title. Select the system name to browse its components and guidance. A custom-styled prototype shows **None · custom styling**.

## Artifacts work together

A prototype's pieces of work are **artifacts**. Each artifact is backed by a file.

| Artifact | Use it for |
| --- | --- |
| View | An interactive screen or state. |
| Document | Goals, decisions, research, or a handoff. |
| Diagram | A portable, text-based model of a flow or system. |
| Canvas | Views, diagrams, and notes arranged together. |

Documents can embed views, diagrams, and canvas previews. Canvases can embed views and diagrams, and link to documents. Use these together to explain both an idea and how it works.

Views are always available. Documents, diagrams, and canvases are optional capabilities included in the starter.

## Organize the exploration

Add artifacts with **+** in navigation. Enter a name; Studio supplies the file extension. Use folders to group work, and drag items to move or reorder them. The first artifact in navigation is where the prototype opens.

The Feedback Inbox sample demonstrates an introduction, early exploration, app screens, and individual states. Your prototype can use whatever organization suits the work.

Right-click a view and choose **Make lofi** to explore in grayscale with handwritten type. **Make hi-fi** restores its normal appearance.

## Make changes safely

Your assigned design system supplies components and styles. You can also explore local alternatives inside the prototype. Those experiments stay separate from the shared system.

Edit your own artifacts with your agent or the [shared source workflow](/documentation/guide/home#working-with-files). Other contributors' source opens read-only.

Use the prototype's **…** menu to change its title or archive it. Archiving keeps it locally and excludes it from the published site. Put project context in a document artifact.

## For developers

Read the [module contract](reference.md) for file structure and implementation details.

The Prototypes module: the gallery at `/prototypes`, and the viewer every prototype, module artifact and system context section opens in. Required. The prototypes themselves are in `src/prototypes/<person>/<id>/`, which are your content.

- `module.ts`, `app.tsx`: who it is, its rail button, the `/prototypes` route, its front-page block, and its palette entries. A prototype opens through the platform's artifact routes (`src/platform/app/router.tsx`).
- `gallery/`: the gallery, a prototype's card, and the New prototype dialog (browser).
- `viewer/`: a prototype's layout, navigation and file tree, its menus and dialogs (browser). Source editing uses the [shared platform editor](../../platform/core/source.md).
- `src/platform/app/source/ArtifactSource.tsx`: adapts prototype and system context access to the shared editor.
- `node/create.js`: `pnpm new`, and what the New prototype button runs (Node).

Agent contract: `src/systems/studio/rules/prototype-workflow.md`.
