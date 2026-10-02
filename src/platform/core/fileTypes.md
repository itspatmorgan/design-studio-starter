# File types

A file type is a kind of file a prototype can hold and the app can open. A file's type comes
from its extension, so `.tsx` files are views and `.md` files are documents, at any depth.

A file type is a module: a folder in `src/platform/modules/` with a `module.ts` like any other, and a `type.ts`
and an `open.tsx` that say what it opens. An optional type is self-contained; the platform runs with it removed.

```
src/platform/core/fileTypes.ts   what every type shares (FileTypeSpec, defineFileType, itemSlug)
src/platform/modules/
├── view/        .tsx, .jsx: React components, opened as pages
├── document/    .md: optional prototype Markdown pages
├── handbook/    .md: required Handbook Markdown pages
├── canvas/      .excalidraw: pages to arrange views, documents, and notes on
└── text/        the Handbook's fallback: any other text file (a skill's script), opened read-only
```

## What's in a type's folder

| File | Used by | Holds |
|------|---------|-------|
| `module.ts` | the build and the app | what any module declares: its id, label, version, and that it is optional. A module with a `type.ts` is a file type. |
| `type.ts` | the build and the app | `label`, `extensions`, an optional `template` (what "New" writes into a new file), an optional `check` (problems to report, like a missing default export), and an optional `language` (`tsx`, `markdown`, or `json`), and `preview` (true if it shows itself live when another item, like a canvas, includes it), which gives the type a source button in the navigation. The `inPrototype` flag defaults to true; set it to false for a type that only opens files in a shared section. Extension ownership is unique within each scope. Two flags are for the Handbook (`src/handbook/`, which the app shows read-only): `inHandbook` (the type opens there; the required Handbook module owns its Markdown type) and `fallback` (the one type that opens every other text file there, with no extensions of its own). It imports only `../../core/fileTypes.ts`, because Node loads it directly. |
| `open.tsx` | the app | `icon` (in the navigation), `load` (loads the file before its page renders), `Page` (the page itself), and optionally `Embed` (how the type looks when another item, like a canvas, includes it live; without one it shows as a card) |
| `loader.ts` | the type's own `open.tsx` | a Vite glob of the type's files, written `import.meta.glob(['/__studio_globs__/*'])`: the build fills in the patterns from the type's extensions and the modules' folders (`src/platform/core/modules/globs.ts`). It's a separate file because Vite needs the pattern written out, and the file must call `import.meta.hot.accept()` itself. |

The build (`scripts/lib/file-types.js`) and the app (`src/platform/app/data/fileTypes.ts`) find the
folders on their own. Nothing else lists them: the navigation, the **+** menu, routes, the
manifest, and the file layer all read the types they find. The dev server looks for types when it starts, so
restart `pnpm dev` after adding or removing a folder.

## Turn off or remove a type

A file type belongs to a module. Views, Text files, and Handbook Markdown are required. Prototype Documents and Canvases are optional and work like other optional modules (`src/platform/modules/README.md`):

- **Turn it off** with `modules: { canvas: false }` in `studio.config.ts`. Its folder stays. Its files become plain files, which the
  navigation hides unless you choose Show all files in the prototype's … menu, and its Guide page goes. Its implementation is left out of the build.
- **Remove it** with `pnpm studio remove canvas`. That deletes the folder and the agent rule the module lists (`rules/canvases.md`),
  and says which npm packages it leaves installed. Run `pnpm studio sync` afterwards so `AGENTS.md` stops routing to the rule.
  Then delete the links to its Guide page from other Guide pages (the page itself was the type's README).

A prototype whose `start` names a file of a type you turned off or removed (the sample's `start-here.md`, a document) is skipped by
the manifest until its `meta.json` names a file that still opens.

`pnpm check` (and `pnpm build`) runs `scripts/check/check-modules.js`, which fails if core code imports a type's folder or
one type imports another, so a folder that passes stays removable.

## Add a type

1. Make `src/platform/modules/<name>/` with a `module.ts` (`optional: true`; list its agent rule in `handbook`), `type.ts`, `open.tsx`, and `loader.ts`. Copy `document/`
   as a starting point: it's the smaller one.
2. Two types can't share an extension; the build says so if they do.
3. Types don't import each other. To show another item, a type asks the registry: `src/platform/app/items/itemLinks.ts` turns a link into an item, and the item's type provides its `Embed`.
4. If the type needs something the app can't do yet, that belongs in the type's folder, not in core.
