---
title: "Model a prototype with diagrams"
description: "Keep Mermaid diagrams as editable files beside views and documents."
section: "Create"
order: 13
toc: true
slug: "diagram-files"
---

# Diagrams

Diagrams adds standalone Mermaid files to prototypes. Use them to explain a flow, responsibility, dependency, or other relationship that helps someone understand the prototype. Each diagram has its own navigation entry and can appear as a live preview on a canvas. Standalone diagrams fill the prototype viewer and scale to fit its available space while preserving their proportions.

## Create and edit

Ask your agent to create a diagram, or select **New** (+), then **New diagram**, in the prototype’s Artifacts row. New diagrams use `.mermaid`. The module also opens `.mmd` files.

A file contains one diagram in plain Mermaid syntax, without Markdown fences:

```text
flowchart LR
  accTitle: Review feedback
  accDescr: Feedback is reviewed, then addressed or kept for later.
  feedback[Feedback] --> review{Review}
  review -->|Act| task[Create a task]
  review -->|Later| backlog[Keep for review]
```

Include an accessible title and description where the selected diagram type supports them. Use the diagram type that communicates the relationship clearly. All diagram types supported by the installed Mermaid renderer are available.

Right-click the file and select **Edit source** to edit it. Save with Command+S on macOS or Ctrl+S elsewhere, then select **Done**. Edits made by your agent or external editor also update the open diagram locally. Invalid syntax displays an error. Use the file menu’s **Edit source** action to inspect and repair it. Standalone diagrams have no separate source toggle.

Published diagrams and other contributors’ files are read-only. Source access on local files uses the file menu.

## Share the same visual language

Standalone diagrams and Mermaid fences in Markdown share the same renderer, accessibility behavior, and platform theme. They use platform neutrals and Flexoki accents rather than the prototype design-system theme. See [Diagrams and code](/documentation/guide/diagrams) for examples and customization.

Use a document fence when a diagram belongs inside written context. Use a standalone diagram when it should be independently navigable or arranged on a canvas. Link to it from documents with a relative path, such as `[Feedback flow](feedback-flow.mermaid)`. To render the same source inside a prototype document, place `![Feedback flow](feedback-flow.mermaid)` on its own line. The embed uses the canvas preview and provides an **Open diagram** link; changes to the source update both presentations. File embeds stay within the current prototype.

Excalidraw’s Mermaid import can turn copied source into editable canvas shapes. That creates a separate artifact; changes do not synchronize between Mermaid source and the imported shapes.

## Optional capability

Disabling or removing Diagrams preserves prototype source files as plain files and hides them from normal artifact navigation. Canvas links become unavailable until the module is enabled again. The prototype opens on the next available artifact in navigation order.

Mermaid fences in the Handbook, Documentation, and prototype Documents keep working without Diagrams. Documents and Canvases are separate optional modules.

## For developers

- `module.ts`: optional module identity and agent routing.
- `type.ts`: `.mermaid` and `.mmd` extensions, plain text editing, new-file template, and canvas preview capability.
- `loader.ts`: raw source globs supplied by the shared file-type build layer; published archives are excluded.
- `load.ts`: local file reads and published source loading.
- `open.tsx`, `Diagram.tsx`, `DiagramEmbed.tsx`: page presentation, live local updates, and compact canvas previews.
- `src/platform/app/diagrams/`: shared Mermaid renderer and theme, independent of this optional module. Markdown maps its Mermaid fences to the same component.

The module adds a prototype file type rather than a separate rail destination. It does not add dependencies or a second renderer. Source syntax is validated when rendered, so malformed diagrams can still be opened and edited. Shared source editing supplies file permissions and conflict protection.
