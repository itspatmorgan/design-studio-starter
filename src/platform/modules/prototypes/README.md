---
title: "Prototypes"
description: "Create screens and context, then review and refine them."
section: "Working in the studio"
order: 10
toc: true
slug: "prototypes"
---

# Prototypes

A prototype contains screens and supporting context for an idea. Its files live together in `src/prototypes/<contributor>/<prototype>/`.

The app finds prototypes automatically. Your agent creates them with `pnpm new "Prototype Name"`.

## Create a prototype

Ask your agent for a prototype and describe the outcome you want. You can also select **New prototype** on the Prototypes page.

The agent builds with the prototype's assigned design system. Ask it to include the states and questions you need to review.

## Find your files

The navigation lists supported items and folders. Enabled file-type modules determine which items you can open.

| Item | Purpose |
| --- | --- |
| View (`.tsx` or `.jsx`) | An interactive screen or state. |
| Document (`.md`) | Written context and decisions. |
| Canvas (`.excalidraw`) | Screens and notes arranged together. |
| Folder | Organization at any depth. |

Select **Show all files** in the prototype's **…** menu to list helpers and assets while running locally.

A name that starts with `_` marks a helper, such as `_components/`. Helpers do not appear as screens.

## Add and organize items

These actions are available in your own prototypes while the studio runs locally.

| Task | Action |
| --- | --- |
| Create an item | Select **New** (+) in the Files row, then select a file type or folder. |
| Rename | Right-click the item and select **Rename**, or focus its row and press F2. |
| Move | Drag onto a folder, or into the space below the list for the top level. |
| Reorder | Drag between rows, or use Option+Up/Down (Alt+Up/Down). |
| Choose the opening item | Right-click an item and select **Set as start**. |
| Delete | Right-click the item and select **Delete**. |

The default order is files first, then folders, each alphabetical. Custom order is saved in `meta.json` for other contributors to see.

The prototype opens on its chosen start item. Otherwise, it opens on the first item in the navigation.

## Edit source text

1. Right-click a view, document, or canvas.
2. Select **Edit source**.
3. Edit the text.
4. Save with Command+S on macOS or Ctrl+S on other systems.
5. Select **Done** to return to the rendered item.

For another contributor's prototype, **View source** opens read-only text. Source editing is unavailable on the deployed site.

If an external change conflicts with unsaved edits, the editor asks you how to proceed.

## Use lofi mode

Lofi mode draws a view in grayscale with handwritten type. Use it to review layout before visual polish.

Right-click the view and select **Make lofi**. Select **Make hi-fi** to restore its normal appearance.

The view keeps the same components and behavior. Its file stores the mode with `/** @lofi */`. A folder named `lofi` has no special behavior.

## Change prototype details

Select **Edit** in the prototype's **…** menu to change its title or description. You can also double-click your prototype's title.

Changing the title renames the folder and changes the URL. Previously shared links stop working. A conflicting folder name prevents the rename.

Changing only the description preserves the URL. Check links after renaming or moving files.

## Archive or delete

| Action | Local studio | Built site |
| --- | --- | --- |
| Archive | Remains available in the Archived section. | Excluded from the build. |
| Unarchive | Returns to the active list. | Included in the next build. |
| Delete | Moves the folder to the Trash or repository `.trash/` fallback. | Removed from the next build. |

Use **Archive** or **Unarchive** in the prototype's **…** menu. To restore deleted files, use the system Trash or ask your agent about `.trash/`.

## Share a review

Copy the item's URL, or select **Copy link** in its file menu. A local URL works only where that local server is accessible.

Ask your agent to commit and share the work through your team's Git workflow. Pushes do not publish a site without a configured host.

## When an item fails

A view rendering error shows a message and a **Copy** button. Give the error to your agent.

For file layout, metadata, and URLs, see [Prototype reference](/guide/prototype-reference).

## For developers

The Prototypes module: the gallery at `/prototypes`, and the viewer every prototype, module item and Handbook section opens in. Required. The prototypes themselves are in `src/prototypes/<person>/<id>/`, which are your content.

- `module.ts`, `app.tsx`: who it is, its rail button, the `/prototypes` route, its front-page block, and its palette entries. A prototype opens through the platform's item routes (`src/platform/app/router.tsx`).
- `gallery/`: the gallery, a prototype's card, and the New prototype dialog (browser).
- `viewer/`: a prototype's layout, navigation and file tree, its menus and dialogs, and the Source view's editor (browser).
- `node/create.js`: `pnpm new`, and what the New prototype button runs (Node).

Agent contract: `src/handbook/rules/prototype-workflow.md`.
