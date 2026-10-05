---
title: "File-type contract"
---

# File-type contract

An artifact is a navigable piece of prototype work backed by a file, such as a view, document, diagram, or canvas. Folders organize artifacts; helpers, metadata, and other assets remain supporting files.

A file type is the module capability declared by `type.ts` that recognizes and renders those files. Enabled types determine how artifacts are discovered, created, opened, and embedded.

## Scopes

| Module | Scope |
| --- | --- |
| Views | Required prototype `.tsx` and `.jsx` views. |
| Diagrams | Optional prototype `.mermaid` and `.mmd` diagrams. |
| Documents | Optional prototype `.md` pages. |
| Systems | Required system context `.md` pages. |
| Canvases | Optional prototype `.excalidraw` scenes. |
| Text files | Required fallback for other system context text files. |

Extension ownership is unique within each scope. Documents and system context can both claim `.md` because their scopes differ.

Other prototype files remain plain files. Underscore helpers are excluded from normal artifact discovery.

## Files and fields

`src/platform/core/fileTypes.ts` defines `FileTypeSpec`, `defineFileType`, and artifact slug handling.

| File | Contract |
| --- | --- |
| `module.ts` | Standard module identity and optional status. |
| `type.ts` | Extensions, label, language, template, validation, preview, and scope flags. |
| `open.tsx` | Icon, loader, page, and optional live `Embed`. |
| `loader.ts` | Production file globs and its own HMR acceptance. |

`type.ts` imports only `../../core/fileTypes.ts`, because Node loads it directly.

`preview`, `inPrototype`, `inSystemContent`, and `fallback` are required booleans. `inPrototype: true` permits prototype artifacts; `inSystemContent: true` permits system knowledge files. Omission fails validation. A `fallback` type opens other system context text files without claiming extensions.

Supported editor languages are `tsx`, `markdown`, `json`, `mermaid`, and `text`. The template supplies new-file content. The check reports invalid content.

The app record is `Artifact`, and a loaded `Prototype` holds an `artifacts` collection. Manifest lookup and navigation use `findArtifact`, `firstArtifact`, `artifactLink`, and `artifactSlug`. Shared readers such as the system context reuse the same record and file-type machinery while keeping their own user-facing document terms.

An `Embed` in `open.tsx` supplies a read-only preview for documents and canvases. Core resolves references and uses this contract without importing individual modules. The required `embedSurfaces` array explicitly permits `document`, `canvas`, both, or neither (`[]`). Omission never enables a surface. Types without a preview on that surface appear as cards. Canvas restricts its preview to documents, keeping canvas nesting bounded.

Prototype documents use `![Description](../../core/relative/file.ext)` on its own line. The shared Markdown reader resolves the exact file within the same prototype, renders the registered preview or card, and provides an Open link. Inline references stay links. Missing or disabled types show an unavailable message. Ordinary image formats retain Markdown image behavior.

Preview surfaces use the shared `EmbedFrame`: rounded corners and a full-width gray header link that darkens and reveals Open on hover or keyboard focus. Header text is never underlined. Preview contents are inert; interaction happens after opening the file.

A loader uses `import.meta.glob(['/__studio_globs__/*'])`. Vite replaces the placeholder with extensions and content roots, excluding archived prototypes in production.

## Lifecycle

Follow the [module contract](modules.md) for installation, disabling, removal, and dependency boundaries.

Disabling a prototype file type preserves its files as plain files. Normal navigation hides them unless Show all files is selected.

The first available artifact in navigation order opens by default. Disabling a file type removes its artifacts from that order.

Required types cannot be disabled or removed with studio commands. Required types may be imported by the platform and other modules.

Restart the dev server after capability changes. Ordinary content edits are reflected during development.

## Add a type

1. Create a module declaration with the appropriate optional status and system context routing.
2. Add `type.ts` and `open.tsx`. Use Documents as a small reference implementation.
3. Add `loader.ts` if published content needs bundled file loading.
4. Use the artifact registry to resolve other artifacts rather than importing optional file types.
5. Run module checks and a build. Verify disabling and removal for optional types.
