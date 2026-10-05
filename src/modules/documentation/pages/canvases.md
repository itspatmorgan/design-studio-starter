---
title: "Canvases"
description: "Arrange artifacts and notes on a canvas."
section: "Artifacts"
order: 22
module: canvas
toc: true
---

Canvases adds an Excalidraw surface inside a prototype. Each canvas is an `.excalidraw` file with shapes, text, notes, arrows, and linked artifacts.

The module is optional. Disabling it preserves canvas files and hides them from normal navigation.

The canvas grid shortcut is **⌘⇧'** on Mac or **Ctrl+Shift+'** on Windows/Linux. **⌘' / Ctrl+'** is reserved for switching the artifact between rendered view and source locally.

## Create and add artifacts

Ask your agent to create a canvas, or select **New** (+), then **New canvas**, in the Artifacts row.

Drag an artifact from the prototype's navigation onto the canvas. You can also select **Copy link** in the artifact's menu, place the pointer over the canvas, and paste.

| Linked artifact | Display |
| --- | --- |
| View | Live-rendered preview. Open the view to interact with it. |
| Diagram | Live preview of the Mermaid source, with an Open link. Requires the Diagrams module. |
| Document or canvas | Card with an Open link. |
| Missing artifact | Placeholder. |

A canvas embeds only artifacts from its own prototype. An embed from another prototype shows a scope message and fails the build. Copy the artifact into this prototype to reuse it.

The canvas cannot store images. View and diagram previews provide a connection to their source files.

To explore a Mermaid flowchart as editable shapes, open **More tools → Mermaid to Excalidraw**, paste its source, and select **Insert**. The converted shapes are an independent sketch; editing them does not update the Mermaid file. The sample prototype's Breadboard canvas demonstrates both approaches.

## Embed a canvas in a document

Use `![Exploration](./breadboard.excalidraw)` on its own line in a document from the same prototype. The preview fits the canvas contents and updates when the source changes locally. Open the canvas to edit or explore it. Views and diagrams inside it remain previews; documents and other canvases remain cards.

## Local controls and saving

Use the toolbar for shapes, text, and arrows. Press **N** for a sticky note. The canvas menu includes undo, redo, grid, snapping, and background color. Command+. or Ctrl+. hides or shows controls.

Changes save automatically while the studio runs locally. External file changes appear in the open canvas. You can edit only canvases in your own prototypes. Other contributors' and published canvases are read-only.

## Agent access

The agent can edit the saved canvas file. Agents with browser access can also use the live canvas tools, which can report selection and viewport information.

Live tool operations support undo. External file edits are not necessarily separate undo steps. Available live integrations depend on your agent.

The agent tool `artifacts` lists the prototype's available artifacts. To embed one, use `create` with `{ "type": "artifact", "artifact": "explore/feedback-flow" }`. Tool help describes current arguments.
