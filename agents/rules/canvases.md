# Canvases

A canvas is a page to arrange things on: live views and documents from any prototype, beside sticky notes, text, and arrows. It's for overview, handoff, critique, and comparing screens side by side. Read this when the person asks for one, or asks you to put something on one. Human docs: the Guide's Canvases page (`src/studio/guide/canvases.mdx`).

- A canvas is any `.excalidraw` file in the prototype, at any depth, outside `components/`. Its URL is its path without the extension, and its name in the navigation comes from the file name (`onboarding-flow.excalidraw` is "Onboarding Flow"). There's no title field.
- The file is an Excalidraw scene (JSON). The app draws it with Excalidraw, edits it while `pnpm dev` runs, and saves it back in a small, stable form. The deployed site shows it read-only.
- A canvas points at things; it doesn't hold them. Each view or document on it is an `embeddable` element whose `link` is the item's address in the app: `/<contributor>/<prototype>/<path without extension>`, for example `/patrick/checkout/lofi/step-1`. It can be in any prototype. A view renders live, other types (documents, other canvases) as a small card, and a link to nothing as a "Not found" card.
- **No images.** Excalidraw stores an image's bytes inside the file, which bloats the repo. The image tool is off, the app never saves one, and `pnpm build` fails on one. Put the real view on the canvas instead of a screenshot of it.
- No external links or embeds. Only addresses of items in this app become embeds.

## Edit the file

Write the file and the app shows it. If it's open, it updates as you edit, and your changes merge with anything the person has changed since. Keep edits small, and don't rearrange what the person placed.

A new, empty canvas:

```json
{ "type": "excalidraw", "version": 2, "studioVersion": 1, "elements": [], "appState": { "viewBackgroundColor": "#ffffff" }, "files": {} }
```

Every element needs a unique `id` (never reuse one, even after deleting it), a `version`, and a `versionNonce`. Leave out `index`: elements stack in the order they're listed. When you change an element that's already there, raise its `version` and change its `versionNonce`, or an open canvas may keep its own copy. Other fields can be left out; Excalidraw fills in defaults.

**A view or document.** A view is 480 × 338 (a 1440 × 900 screen at one third); a card is 480 × 88. Space things 80 px apart. Keep `customData` and `strokeColor` exactly as shown:

```json
{ "id": "view-1", "type": "embeddable", "x": 0, "y": 0, "width": 480, "height": 338, "version": 1, "versionNonce": 1, "seed": 1,
  "link": "/patrick/hello-world/lofi/main", "strokeColor": "transparent", "customData": { "frame": true, "hideLinkIcon": true } }
```

**A sticky note** is a square with text bound to it: two elements. Breaking long text with `\n` keeps it inside the square (about 16 characters per line at this size).

```json
{ "id": "note-1", "type": "rectangle", "x": 0, "y": 398, "width": 200, "height": 200, "version": 1, "versionNonce": 2, "seed": 2,
  "backgroundColor": "#ffec99", "strokeColor": "#ecd67a", "strokeWidth": 1, "roughness": 0, "fillStyle": "solid",
  "boundElements": [{ "id": "note-1-text", "type": "text" }] },
{ "id": "note-1-text", "type": "text", "x": 10, "y": 408, "width": 180, "height": 25, "version": 1, "versionNonce": 3, "seed": 3,
  "text": "Empty state is\nmissing here", "originalText": "Empty state is\nmissing here", "fontSize": 20, "fontFamily": 6,
  "textAlign": "left", "verticalAlign": "top", "containerId": "note-1", "lineHeight": 1.25 }
```

Note colors: `#ffec99` (yellow, edge `#ecd67a`), `#ffc9c9` (pink, `#eeaeae`), `#a5d8ff` (blue, `#87c0ec`), `#b2f2bb` (green, `#94dc9f`).

**A heading or label** is a plain `text` element (`fontSize` 28 for a heading, 20 for a label, `fontFamily` 6), without `containerId`.

Arrows are easier drawn in the app than written by hand; leave them to the person, or skip them.

## Layout

Lay out in rows and columns: views in a row 80 px apart, a sticky note under each view that needs one, a heading above each group. Group related views close together and leave more space between groups. Explain what to look at in the notes, not in a paragraph.

## Don't

- Don't write raw Excalidraw elements you haven't seen above, or change the file format.
- Don't put a screenshot or an image on a canvas.
- Don't edit `.excalidraw` files someone else owns; a canvas in another person's prototype is theirs.
