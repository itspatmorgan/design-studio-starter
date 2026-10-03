---
title: "Prototype files and boundaries"
description: "File layout, metadata, and URLs for people who inspect prototype files."
section: "Learn more"
order: 42
toc: true
---

Use [Build a prototype](/documentation/guide/prototypes) for everyday tasks. This page describes the files your agent creates and maintains.

## File layout

```text
src/prototypes/<contributor>/hello-world/
├── meta.json
├── prototype.tsx
├── notes.md
├── feedback-flow.mermaid
├── flow.excalidraw
└── _components/
    └── header.tsx
```

A view is a `.tsx` or `.jsx` file that default-exports a React component. Use `.tsx` for new views.

Helpers start with `_` and do not become navigable artifacts. A helper folder hides its contents from normal artifact navigation.

File-type modules determine which extensions become artifacts. Two files cannot produce the same artifact URL.

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
| `start` | Opening artifact path without its extension. If omitted, uses the first artifact. |
| `order` | File and folder paths to place first, in sequence. |
| `status` | `archived` excludes the prototype from the published site. Omit it or use `active` for active work. |

Contributor details come from `contributors.json` or `contributors/<key>.json`.

Missing or invalid metadata causes a local warning and fails the build. Ask the agent to repair it.

## Artifact URLs

| URL | Opens |
| --- | --- |
| `/prototypes/<contributor>/hello-world` | The start artifact, or first artifact. |
| `/prototypes/<contributor>/hello-world/prototype` | The prototype view. |
| `/prototypes/<contributor>/hello-world/notes` | The document. |
| `/prototypes/<contributor>/hello-world/flow` | The canvas. |

Nested folders become URL segments. Renaming a prototype folder or artifact changes its URL.

## Default system changes

Changing the default through the configuration command preserves existing prototypes' systems. Migrating a prototype requires changing its imports and assigned system together.

See [Studio config](/documentation/guide/studio-config#change-configuration) for the command and the effect of direct configuration edits.

## Dependency boundaries

A prototype can use these sources:

| Source | Example |
| --- | --- |
| Its own files | `./_components/header` |
| Its assigned design system | `@/systems/product/components/button` |
| Shared utilities | `@/lib/portal` |
| An enabled module's public library entry | `@module/<id>` |
| Installed packages | `react` |

It cannot import another prototype, another design system, or private platform files. A module's public library entry is the explicit platform exception.

These boundaries also apply to indirect and type-only dependencies. Shared utilities cannot depend on prototypes, design systems, or platform code.

Invalid dependencies produce errors during local development and fail the build. Ask your agent to correct the dependency rather than bypass the check.

## Reuse without coupling

To reuse another prototype's code, copy it into your folder. Changes to the copy will not affect the original.

A reusable component can also belong in the design system. Moving it there is a shared change that needs maintainer approval.

A canvas embeds only artifacts from its own prototype. Copy another prototype's artifact before adding it to your canvas.

## Contain styles

Use Tailwind classes or CSS Modules (`*.module.css`) for prototype styles. CSS Modules must use local class selectors and cannot use global selectors.

Plain CSS imports from runtime components fail. Design-system themes load through the platform and must target their unique theme class or its descendants.


For review paths, see [Ownership and permissions](/documentation/guide/ownership-and-permissions).
