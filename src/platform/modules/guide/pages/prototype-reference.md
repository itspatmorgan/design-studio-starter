---
title: "Prototype reference"
description: "File layout, metadata, and URLs for people who inspect prototype files."
section: "Reference"
order: 42
toc: true
---

Use [Prototypes](/guide/prototypes) for everyday tasks. This page describes the files your agent creates and maintains.

## File layout

```text
src/prototypes/<contributor>/hello-world/
├── meta.json
├── prototype.tsx
├── notes.md
├── flow.excalidraw
└── _components/
    └── header.tsx
```

A view is a `.tsx` or `.jsx` file that default-exports a React component. Use `.tsx` for new views.

Helpers start with `_` and do not become navigable items. A helper folder hides its contents from normal item navigation.

File-type modules determine which extensions become items. Two files cannot produce the same item URL.

## Metadata

```json
{
  "title": "Hello World",
  "description": "A first prototype.",
  "created": "2026-09-28",
  "system": "product",
  "start": "prototype",
  "order": ["prototype.tsx", "notes.md", "flow.excalidraw"]
}
```

| Field | Meaning |
| --- | --- |
| `title` | Required prototype title. |
| `description` | Optional description. |
| `created` | Date filled by the creation command. |
| `system` | Assigned prototype system. If omitted, uses the studio default. |
| `start` | Opening item path without its extension. If omitted, uses the first item. |
| `order` | File and folder paths to place first, in sequence. |
| `status` | `archived` excludes the prototype from the built site. Omit it or use `active` for active work. |

Contributor details come from `contributors.json` or `contributors/<key>.json`.

Missing or invalid metadata causes a local warning and fails the build. Ask the agent to repair it.

## Item URLs

| URL | Opens |
| --- | --- |
| `/prototypes/<contributor>/hello-world` | The start item, or first item. |
| `/prototypes/<contributor>/hello-world/prototype` | The prototype view. |
| `/prototypes/<contributor>/hello-world/notes` | The document. |
| `/prototypes/<contributor>/hello-world/flow` | The canvas. |

Nested folders become URL segments. Renaming a prototype folder or item changes its URL.

## Default system changes

Use `pnpm studio configure --system <key>` to preview a default-system change. Apply it with `--yes` after review.

The command records existing implicit system choices before changing the default, including prototypes in disabled content modules.

New prototypes use the new default. Existing prototypes need an explicit migration of both imports and system choice.
