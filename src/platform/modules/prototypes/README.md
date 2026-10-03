---
title: "Build a prototype"
description: "Use a design-system toolkit, a blank view, or both."
section: "Create"
order: 10
toc: true
slug: "prototypes"
---

# Prototypes

A prototype is an independent workspace for artifacts: views, documents, diagrams, and canvases. Each artifact is backed by a file. It lives in `src/prototypes/<contributor>/<prototype>/`. The app finds it automatically.

Ask your agent to create a prototype, or select **New prototype** on the Prototypes page. The agent uses `pnpm new "Prototype Name"`.

## A toolkit with room to explore

Your assigned design system provides components and tokens. It does not limit what you can create.

Use those components, build local alternatives, or start with a blank view. Local helpers belong in the prototype, for example in `_components/`. You can explore without changing the shared system first.

Dependency and style boundaries contain the experiment so it does not affect other prototypes or the platform. See [Prototype files and boundaries](/documentation/guide/prototype-reference).

## Artifacts and navigation

| Artifact | Purpose |
| --- | --- |
| View (`.tsx` or `.jsx`) | Interactive code-based screen or state. |
| Document (`.md`, optional) | Written context. |
| Diagram (`.mermaid` or `.mmd`, optional) | Mermaid source rendered as a standalone diagram. |
| Canvas (`.excalidraw`, optional) | Views, cards, and notes arranged together. |

Folders organize artifacts at any depth; they are not artifacts themselves. Helper code, assets, and metadata support the work but stay out of normal artifact navigation.

Views and text-file support are required. Documents, Canvases, and Diagrams are optional modules.

Names starting with `_` identify helpers, which are not screens. Select **Show all files** in the prototype's **…** menu to see helpers and assets locally.

## Local editing controls

These controls are available in your own prototypes:

| Action | Control |
| --- | --- |
| Add an artifact or folder | **New** (+) in the Artifacts row. |
| Rename or delete | Artifact's right-click menu. F2 also renames. |
| Move | Drag onto a folder or below the list for the top level. |
| Reorder | Drag between rows, or Option+Up/Down (Alt+Up/Down). |
| Choose the opening artifact | Move it to the top of the navigation. |
| Edit source | **Edit source** in the artifact's menu. |

To edit source:

1. Select **Edit source** in the artifact's right-click menu.
2. Edit the text.
3. Save with Command+S on macOS or Ctrl+S on other systems.
4. Select **Done** to return to the artifact.

Conflicting external changes prompt you to choose how to proceed. Another contributor's source opens read-only.

When creating an artifact, enter its name without a file extension. The selected artifact type adds the correct extension automatically.

Without a custom order, files appear before folders, alphabetically. The prototype opens on the first available artifact in navigation order, including artifacts inside folders.

## Appearance and prototype details

**Make lofi** draws a view in grayscale with handwritten type. **Make hi-fi** restores its normal appearance. Components and behavior stay the same. The mode is stored as `/** @lofi */` in that view. A folder named `lofi` has no special behavior.

Select **Edit** in the prototype's **…** menu to change its title. Changing the title also renames the folder and changes its URL. Contributor and creation date are read-only details in this dialog. Use document artifacts for project context.

## Archive and delete

**Archive** keeps the prototype available locally and excludes it from the published site. **Unarchive** includes it in the next build.

**Delete** moves the folder to the system Trash or the repository's `.trash/` fallback. Ask your agent to restore it if needed.

Published prototypes support viewing and interaction, without repository editing. A view that fails to render shows an error and a **Copy** button. Give that error to your agent.

## For developers

Read the [module contract](reference.md) for file structure and implementation details.

The Prototypes module: the gallery at `/prototypes`, and the viewer every prototype, module artifact and Handbook section opens in. Required. The prototypes themselves are in `src/prototypes/<person>/<id>/`, which are your content.

- `module.ts`, `app.tsx`: who it is, its rail button, the `/prototypes` route, its front-page block, and its palette entries. A prototype opens through the platform's artifact routes (`src/platform/app/router.tsx`).
- `gallery/`: the gallery, a prototype's card, and the New prototype dialog (browser).
- `viewer/`: a prototype's layout, navigation and file tree, its menus and dialogs, and the Source view's editor (browser).
- `node/create.js`: `pnpm new`, and what the New prototype button runs (Node).

Agent contract: `src/handbook/rules/prototype-workflow.md`.
