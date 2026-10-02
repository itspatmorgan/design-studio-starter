---
title: "Canvases"
description: "A page to arrange views, documents, and notes on, to compare and explain."
section: "Core concepts"
order: 15
toc: true
slug: "canvases"
---

# Canvases

A canvas is a page you arrange things on. Put your prototype's views side by side, add a document card, a sticky note under a screen, some text, an arrow. It's for the moments a list of pages isn't enough: showing a whole flow at once, comparing two directions, or handing someone the map before the details.

A canvas is an `.excalidraw` file, anywhere in your prototype, and it's drawn with [Excalidraw](https://excalidraw.com).

```text
src/prototypes/patrick/hello-world/
├── prototype.tsx
├── onboarding-flow.excalidraw   # a canvas
└── lofi/
    └── main.tsx
```

Like every file type, there's nothing to register. It appears in the prototype's navigation with a canvas icon, named from the file (`onboarding-flow.excalidraw` is "Onboarding Flow"), and opens at its path without the extension.

## Make one

Choose **+ → New canvas** next to the prototype's title, or ask your agent to make one and say what to put on it. A new canvas is empty, with a hint on how to fill it.

## What goes on it

- **Views.** Copy a view's link (right-click it in the navigation and choose **Copy link**, or copy the address from the browser), then paste it with the pointer over the canvas. It becomes a live preview of that page. Click its title bar to open it.
- **Documents and other canvases.** Paste their links too. They appear as small cards with an **Open** link.
- **Only this prototype's.** A canvas shows items from its own prototype, so a prototype stays self-contained. To show a view from another prototype, copy it into this one and link the copy. Linking to another prototype's view shows a card that says so, and the build fails until the link is fixed.
- **Notes and text.** Press **N** for a sticky note, or open the library on the right for the other colors. Double-click a note to write on it. The **A** tool adds text; the arrow tool joins things.

A canvas doesn't own what's on it, it points at it. If a file is moved or deleted, its spot shows a "Not found" card, and your agent can fix the link.

The tools in the toolbar are Excalidraw's. Its menu (the button at the bottom left, or the top left on a wide screen) has undo, redo, grid, snapping, and the background color. **⌘.** hides all the controls, for a clean view.

## With your agent

A canvas is a good place to work with your agent: to ask it to lay out a flow, put the screens of two directions side by side, or annotate what you're looking at. Your agent can see what you've selected and what's on your screen, so "this one" and "here" mean what you'd expect. It adds things while you watch, points at what it's talking about, and uses the whole of Excalidraw (boxes, arrows, colors, notes), not only screens. Each thing it does is one step you can undo with ⌘Z.

Ask for what you want in your own words. For example: "Put the checkout screens on a canvas in order, with arrows, and a note under any that has an open question."

Your agent works on the canvas whether or not you have a browser open: with the canvas open it changes it live, and without, it edits the file. You'll see changes as they're made if you have it open. Its tools are listed in `src/handbook/rules/canvases.md`.

## Saving

While the app is running locally, a canvas saves itself a moment after you stop editing, into the file, and your agent can edit the same file: changes show up on the open canvas as they're made, and merge with yours. On the deployed site, a canvas is read-only.

You can edit only your own prototypes' canvases. Others' open in a view you can look around, but not change.

## No images

A canvas can't hold images: Excalidraw would store their bytes inside the file, and a few screenshots would swell the repository. Put the real view on the canvas instead of a picture of it.

## Not using them?

Canvases are optional for a prototype, and for the platform. Ask your agent to remove them, and the app runs without them (and without Excalidraw). This page goes with them.

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
