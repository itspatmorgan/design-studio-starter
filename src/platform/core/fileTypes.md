# File-type contract

A file type is a module capability declared by `type.ts`. Enabled types determine how items are discovered, created, opened, and embedded.

## Scopes

| Module | Scope |
| --- | --- |
| Views | Required prototype `.tsx` and `.jsx` views. |
| Diagrams | Optional prototype `.mermaid` and `.mmd` diagrams. |
| Documents | Optional prototype `.md` pages. |
| Handbook | Required Handbook `.md` pages. |
| Canvases | Optional prototype `.excalidraw` scenes. |
| Text files | Required fallback for other Handbook text files. |

Extension ownership is unique within each scope. Documents and Handbook can both claim `.md` because their scopes differ.

Other prototype files remain plain files. Underscore helpers are excluded from normal item discovery.

## Files and fields

`src/platform/core/fileTypes.ts` defines `FileTypeSpec`, `defineFileType`, and item slug handling.

| File | Contract |
| --- | --- |
| `module.ts` | Standard module identity and optional status. |
| `type.ts` | Extensions, label, language, template, validation, preview, and scope flags. |
| `open.tsx` | Icon, loader, page, and optional live `Embed`. |
| `loader.ts` | Production file globs and its own HMR acceptance. |

`type.ts` imports only `../../core/fileTypes.ts`, because Node loads it directly.

`inPrototype` defaults to true. `inHandbook` enables Handbook use. A `fallback` type opens other Handbook text files without claiming extensions.

Supported editor languages are `tsx`, `markdown`, `json`, and `text`. The template supplies new-file content. The check reports invalid content.

An `Embed` in `open.tsx` supplies a read-only preview for documents and canvases. Core resolves references and uses this contract without importing individual modules. `embedSurfaces` can restrict the preview to `document` or `canvas`; omitting it enables both. Types without a preview on that surface appear as cards. Canvas restricts its preview to documents, keeping canvas nesting bounded.

Prototype documents use `![Description](relative/file.ext)` on its own line. The shared Markdown reader resolves the exact file within the same prototype, renders the registered preview or card, and provides an Open link. Inline references stay links. Missing or disabled types show an unavailable message. Ordinary image formats retain Markdown image behavior.

A loader uses `import.meta.glob(['/__studio_globs__/*'])`. Vite replaces the placeholder with extensions and content roots, excluding archived prototypes in production.

## Lifecycle

Follow the [module contract](../modules/README.md) for installation, disabling, removal, and dependency boundaries.

Disabling a prototype file type preserves its files as plain files. Normal navigation hides them unless Show all files is selected.

If `meta.json.start` names an unavailable item, update it to a supported item. Invalid start metadata skips the prototype and fails a strict build.

Required types cannot be disabled or removed with studio commands. Required types may be imported by the platform and other modules.

Restart the dev server after capability changes. Ordinary content edits are reflected during development.

## Add a type

1. Create a module declaration with the appropriate optional status and Handbook routing.
2. Add `type.ts` and `open.tsx`. Use Documents as a small reference implementation.
3. Add `loader.ts` if published content needs bundled file loading.
4. Use the item registry to resolve other items rather than importing optional file types.
5. Run module checks and a build. Verify disabling and removal for optional types.
