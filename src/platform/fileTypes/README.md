# File types

A file type is a kind of file a prototype can hold and the app can open. A file's type comes
from its extension, so `.tsx` files are views and `.md` files are documents, at any depth.

Each type is a self-contained folder here, and the platform runs with any of them removed.

```
src/platform/fileTypes/
├── index.ts        what every type shares (FileTypeSpec, itemSlug)
├── view/           .tsx, .jsx: React components, opened as pages
├── document/       .md: Markdown pages
├── canvas/         .excalidraw: pages to arrange views, documents, and notes on
└── text/           the Handbook's fallback: any other text file (a skill's script), opened read-only
```

## What's in a type's folder

| File | Used by | Holds |
|------|---------|-------|
| `type.ts` | the build and the app | `label`, `extensions`, an optional `template` (what "New" writes into a new file), an optional `check` (problems to report, like a missing default export), and an optional `language` (`tsx`, `markdown`, or `json`), and `preview` (true if it shows itself live when another item, like a canvas, includes it), which gives the type a source button in the navigation. Two flags are for the Handbook (`src/handbook/`, which the app shows read-only): `inHandbook` (the type opens there, as documents do) and `fallback` (the one type that opens every other text file there, with no extensions of its own). It imports only `../index.ts`, because Node loads it directly. |
| `module.tsx` | the app | `icon` (in the navigation), `load` (loads the file before its page renders), `Page` (the page itself), and optionally `Embed` (how the type looks when another item, like a canvas, includes it live; without one it shows as a card) |
| `loader.ts` | the type's own `module.tsx` | a Vite glob of the type's files, written `import.meta.glob(studioGlobs())`: the build fills in the patterns from the type's extensions and the modules' folders (`src/platform/core/modules/globs.ts`). It's a separate file because Vite needs the pattern written out, and the file must call `import.meta.hot.accept()` itself. |

The build (`scripts/lib/file-types.js`) and the app (`src/platform/app/data/fileTypes.ts`) find the
folders on their own. Nothing else lists them: the navigation, the **+** menu, routes, the
manifest, and the file layer all read the types they find. The dev server looks for types when it starts, so
restart `pnpm dev` after adding or removing a folder.

## Remove a type

1. Delete its folder, for example `src/platform/fileTypes/document/`. Its files become plain files, which the
   navigation hides unless you choose Show all files in the prototype's … menu.
2. Delete its Guide page (`src/platform/modules/guide/pages/documents.md`, and the links to it in `src/platform/modules/guide/pages/prototypes.md`) and its
   agent rule (`src/handbook/rules/documents.md`, and its line in `AGENTS.md`).

`pnpm build` runs `scripts/check/check-file-types.js`, which fails if core code imports a type's folder or
one type imports another, so a folder that passes stays removable.

## Add a type

1. Make `src/platform/fileTypes/<name>/` with a `type.ts`, `module.tsx`, and `loader.ts`. Copy `document/`
   as a starting point: it's the smaller one.
2. Two types can't share an extension; the build says so if they do.
3. Types don't import each other. To show another item, a type asks the registry: `src/platform/app/items/itemLinks.ts` turns a link into an item, and the item's type provides its `Embed`.
4. If the type needs something the app can't do yet, that belongs in the type's folder, not in core.
