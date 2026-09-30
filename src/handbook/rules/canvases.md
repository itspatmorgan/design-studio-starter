# Canvases

A canvas is a surface to think and communicate on: live views and documents from its own prototype, beside sticky notes, text, shapes, and arrows. Use it to lay out a flow, compare directions side by side, annotate a screen, ask a question where the person will see it, or hand someone the map. Read this when the person asks for a canvas, or asks you to put something on one. Human docs: the Guide's Canvases page (`src/studio/guide/canvases.md`).

- A canvas is any `.excalidraw` file in a prototype, outside `components/`. It's an Excalidraw scene, so everything Excalidraw draws is fair game. Its URL is its path without the extension, and its name in the navigation comes from the file name.
- It points at things instead of holding them: an **item** on a canvas shows a view live, or a document as a card, from the canvas's own prototype. A canvas never links to another prototype's items: if the person wants one, copy the view into this prototype first, then link the copy. If the file moves, the spot says "Not found".
- **No images.** Their bytes would be stored inside the file. Put the real view on the canvas instead of a screenshot of it.
- You can change only canvases in the person's own prototypes.

## The tools

The same tools work two ways, with the same arguments. Run `help` for the full list with examples, and `help("create")` for every element type.

| Tool | What it does |
|------|--------------|
| `context` | What the person has selected and is looking at. Start here: "this one" and "here" mean their selection and screen. (Live only.) |
| `describe` | Read the canvas: every element, with kind, position, size, text, colors, how it's drawn (dashed, rounded, opacity), and items named by title. `scope: "selection"` or `"view"` narrows it. |
| `items` | The views and documents you can put on the canvas, by name. |
| `create` | Make things: `note`, `text`, `rectangle`, `ellipse`, `diamond`, `arrow`, `line`, `item`, `section`. Style with `color`, `stroke`, `background`, `strokeStyle`, `rounded`. Place with `x`/`y`, or `below`, `rightOf`, `section`; `align` ("start" or "center") lines it up with what it is beside. `ref` names a result for later elements in the call. The result carries `warnings` if something landed on something else. |
| `update` | Change any of that on something that's there: text, color, size, position, an arrow's ends. |
| `move`, `delete` | Move (a section takes its contents; arrows follow) or remove (labels and attached arrows go too). |
| `point` | Select and scroll to something, so the person sees which one you mean. (Live only.) |
| `screenshot`, `persist` | A picture of the canvas; write the file now. (Live only.) |

**With a browser** (the app is running and the canvas is open, visible in a tab): call them on `window.__studioCanvas`, for example `__studioCanvas.create({ elements: [...] })`. Each change appears as you make it, and each call is one undo step for the person.

**Without one:** `pnpm -s canvas <file.excalidraw> <tool> '<json>'` (`-s` keeps pnpm's own output out of the result), for example `pnpm -s canvas src/prototypes/patrick/checkout/flow.excalidraw create '{"type":"note","text":"Retry keeps the draft"}'`. It reads and writes the file, and prints the result. If the person has the canvas open, they see the change as it's written. Text sizes are estimated until the canvas is opened.

Ids come from `describe` or `create`. Make a new empty canvas by choosing + → New canvas in the app, or by writing `{ "type": "excalidraw", "version": 2, "studioVersion": 1, "elements": [], "appState": { "viewBackgroundColor": "#ffffff" }, "files": {} }` to a `.excalidraw` file.

## Working with the person

- **Look first.** `describe` (and `context`, if you can) before you change things, and again after. The person may have moved or added things since you last looked.
- **Add, don't rearrange.** What the person placed is theirs. Put new things in clear space or beside what they refer to; move their things only when asked.
- **Say what you mean, on the canvas.** A heading over each group, a sticky note under a screen saying what to look at, a question note where the decision is. Keep notes short; break long thoughts into several.
- **Point.** When you refer to a specific thing, `point` at it.
- **Small steps.** One idea per call, so a single ⌘Z undoes it. Don't hide a whole redesign in one call.
- **Use the shapes.** Boxes and arrows for a flow, a dashed outline for "not built yet", color to group or flag, a section to frame a set. It's a sketchpad, not only a gallery of screens.

## Sizes and layout

A view is 480 × 338 (a 1440 × 900 screen at a third); a document card is 480 × 88; a note is 200 × 200. Space things 80 apart in a row, 24 under a view for its note, 120 between groups. `create` places things for you (below everything, or beside another element) when you don't give coordinates. Beside something (`rightOf`) it centers by default, so an arrow between a tall view and a short card runs straight; use `align: "start"` to line tops up instead. Notes under a view line up with its left edge; `align: "center"` centers them. Moving something doesn't move the notes beneath it: move them too, or put them together in a section.

## Reading the file

A canvas is JSON: a list of `elements`. An item is `{ "type": "embeddable", "link": "/patrick/hello-world/lofi/main" }`, a note is a rectangle with a text element bound to it (`containerId`), an arrow's `startBinding`/`endBinding` name what it joins. Prefer the tools to editing this by hand: they keep both sides of every binding and raise each element's `version`, which is how an open canvas knows to take your change.
