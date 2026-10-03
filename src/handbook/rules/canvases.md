# Canvases

This rule applies when Canvases is enabled. The [module README](../../platform/modules/canvas/README.md) describes rendering and storage.

- Keep embedded items within the canvas's own prototype. Copy another prototype's item before embedding it.
- Do not store images in a canvas. Embed the working view instead.
- Apply the [contributor scope rule](contributor-scope.md) before editing.
- Inspect the current scene before changing it. Inspect the result afterward.
- Preserve the person's arrangements. Move existing content only when the request requires it.
- Keep changes small enough to review and undo. Live tool operations support undo. External file edits may not be separate undo steps.

## Discover and use tools

Read current tool help instead of assuming argument names or defaults:

```sh
pnpm -s canvas help
pnpm -s canvas help create
```

For file operations, run `pnpm -s canvas <file.excalidraw> <tool> '<json>'`.

For an open local canvas, compatible browser tools can use `window.__studioCanvas`. Read its `help()` before use.

Use `describe` before and after changes. For live tools, use `context` when the request refers to the current selection or viewport.

Prefer tools over manual JSON edits. They maintain element bindings and versions. Use `point` to identify an item when live access supports it.

Create a canvas through the file menu or write this empty scene:

```json
{"type":"excalidraw","version":2,"studioVersion":1,"elements":[],"appState":{"viewBackgroundColor":"#ffffff"},"files":{}}
```
