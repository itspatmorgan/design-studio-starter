---
title: "Arrange work on a canvas"
description: "Connect prototype items on an optional visual surface."
section: "Create"
order: 12
toc: true
slug: "canvases"
---

# Canvases

Canvases adds an Excalidraw surface inside a prototype. Each canvas is an `.excalidraw` file with shapes, text, notes, arrows, and linked items.

The module is optional. Disabling it preserves canvas files and hides them from normal navigation.

## Create and add items

Ask your agent to create a canvas, or select **New** (+), then **New canvas**, in the Files row.

Drag an item from the prototype's navigation onto the canvas. You can also select **Copy link** in the item's menu, place the pointer over the canvas, and paste.

| Linked item | Display |
| --- | --- |
| View | Live-rendered preview. Open the view to interact with it. |
| Document or canvas | Card with an Open link. |
| Missing item | Placeholder. |

A canvas embeds only items from its own prototype. An embed from another prototype shows a scope message and fails the build. Copy the item into this prototype to reuse it.

The canvas cannot store images. View previews provide a connection to the working code.

## Local controls and saving

Use the toolbar for shapes, text, and arrows. Press **N** for a sticky note. The canvas menu includes undo, redo, grid, snapping, and background color. Command+. or Ctrl+. hides or shows controls.

Changes save automatically while the studio runs locally. External file changes appear in the open canvas. You can edit only canvases in your own prototypes; other contributors' and published canvases are read-only.

## Agent access

The agent can edit the saved canvas file. Agents with browser access can also use the live canvas tools, which can report selection and viewport information.

Live tool operations support undo. External file edits are not necessarily separate undo steps. Available live integrations depend on your agent.

## For developers

A page to arrange things on: live views and cards for documents from its own prototype, beside sticky
notes, text, and arrows. It's [Excalidraw](https://github.com/excalidraw/excalidraw) with the app's
look, and its design comes from Design Studio's canvas. Agent contract: `src/handbook/rules/canvases.md`.
Human docs: the Guide's Canvases page.

**This folder is a self-contained file type.** Core never imports it (`scripts/check/check-modules.js`),
so the app runs with or without it. Canvas doesn't import another file type either: it asks the
registry (`src/platform/app/data/fileTypes.ts`) how to show an item.

### The model

- **One file per canvas:** `<name>.excalidraw`, anywhere in a prototype. An Excalidraw scene as JSON.
  The name in the navigation comes from the file name.
- **Items are embeds.** A view or document on a canvas is an Excalidraw `embeddable` element whose
  `link` is the item's address in the app (`/prototypes/patrick/hello-world/lofi/main`; one saved in the older form, without `/prototypes`, still resolves and is written back in the new form when the canvas is saved). The link resolves through
  the manifest (`src/platform/app/items/itemLinks.ts`) to a prototype and an item, and the item's file type
  decides how it looks: a type with an `Embed` in its `open.tsx` (views) shows live, any other
  type shows a card (`src/platform/app/items/ItemCard.tsx`), and a link to nothing shows "Not found".
- **Views are pictures.** A view is laid out at 1440 px wide and scaled down to the element's width,
  cropped at the bottom. Resizing the element changes the crop. Nothing in it takes clicks.
- **Agents** use the tools in tools.ts, live in the open canvas or on the file (src/handbook/rules/canvases.md).
- **Dev:** edits save to the file through the same file layer as the Source view, and changes made to the
  file from outside (an agent) are taken in live. **Deployed:** the committed file, read-only.

### Where things are

| File | What it does |
| --- | --- |
| `type.ts` | The spec the build reads: extension, template (an empty scene), and `check` (valid JSON, no images) |
| `open.tsx` | Icon, and `load`: the file's text (from the file layer in dev, bundled in production). Loads `Canvas` lazily, so Excalidraw isn't in the main bundle |
| `loader.ts` | The glob of canvas files for the deployed site |
| `Canvas.tsx` | Wires the pieces into `<Excalidraw>` |
| `canvas.css` | The app's theme for Excalidraw's UI, from the app's tokens, and how its top row compacts when the canvas is narrow |
| `format.ts` | The file format: slim and stable so canvases diff cleanly. No deleted elements, no images, defaults dropped, numbers rounded, keys sorted, links stored as app paths |
| `useCanvasFile.ts` | Saving and taking in changes: debounce, one save at a time, base version and conflict merge, retry with backoff, flush on leaving |
| `mergeRemote.ts` | Merging a changed file into unsaved edits |
| `embeds.tsx` | How an item renders on a canvas; sizing rules for new ones; culling off-screen ones |
| `liveViews.ts` | Which previews stay mounted (30 at most; one new every 150 ms) |
| `camera.ts` | Where a canvas opens: where you left it, or fitted to its content |
| `tools.ts` | The agent tools, defined once: what each does and takes (`help`), and running them on a list of elements. Pure |
| `elements.ts`, `slim.ts` | Building blocks for the tools (colors, text sizes, arrows), and the small stable stored form. Pure, shared with the command line |
| `agent.ts` | The tools in the open canvas: `window.__studioCanvas`, dev only |
| `cli.ts` | The same tools on the file, for agents with no browser: `pnpm canvas` |
| `menu.tsx`, `shortcuts.ts`, `stickyNotes.ts`, `ControlTooltip.tsx`, `helpDialog.ts` | The trimmed Excalidraw UI: menu, ⌘. and N, sticky notes, fast tooltips, Help dialog |

Excalidraw is patched (the link icon on embeds, and always using its desktop layout, since the app is often narrow beside other panels): `patches/README.md`. Its fonts load from
Excalidraw's CDN.

### Remove it

Turn it off with `modules: { canvas: false }` in `studio.config.ts`, or run `pnpm studio remove canvas` to delete this folder and its agent
rule (`src/handbook/rules/canvases.md`; then `pnpm studio sync` for `AGENTS.md`). Canvas files become plain files, and the navigation hides
them unless you choose Show all files. Then remove what only canvas used: `@excalidraw/excalidraw` and the `canvas` script from `package.json`,
`src/platform/modules/canvas/cli.ts` from `tsconfig.node.json` and `tsconfig.app.json`, `patches/`, `pnpm-workspace.yaml`, and the links to its
Guide page (this README is that page, so it goes with the folder).
