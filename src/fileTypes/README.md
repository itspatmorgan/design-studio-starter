# File types

A file type is a kind of file a prototype can hold and the app can open. A file's type comes
from its extension, so `.tsx` files are views and `.mdx` files are documents, at any depth.

Each type is a self-contained folder here, and the platform runs with any of them removed.

```
src/fileTypes/
├── index.ts        what every type shares (FileTypeSpec, itemSlug)
├── view/           .tsx, .jsx: React components, opened as pages
└── document/       .mdx: Markdown pages
```

## What's in a type's folder

| File | Used by | Holds |
|------|---------|-------|
| `type.ts` | the build and the app | `label`, `extensions`, an optional `template` (what "New" writes into a new file), an optional `check` (problems to report, like a missing default export), and an optional `language` (`tsx` or `markdown`), which gives the type a source button in the navigation. It imports only `../index.ts`, because Node loads it directly. |
| `module.tsx` | the app | `icon` (in the navigation), `load` (loads the file before its page renders), and `Page` (the page itself) |
| `loader.ts` | the type's own `module.tsx` | a Vite glob of the type's files. It's a separate file because Vite needs the pattern written out, and the file must call `import.meta.hot.accept()` itself. |

The build (`scripts/lib/file-types.js`) and the app (`src/studio/app/data/fileTypes.ts`) find the
folders on their own. Nothing else lists them: the navigation, the **+** menu, routes, the
manifest, and the file layer all read the types they find.

## Remove a type

1. Delete its folder, for example `src/fileTypes/document/`. Its files become plain files, which the
   navigation hides unless you choose Show all files in the prototype's … menu.
2. Delete its Guide page (`src/guide/documents.mdx`, and the links to it in `src/guide/prototypes.mdx`) and its
   agent rule (`agents/rules/documents.md`, and its line in `AGENTS.md`).

`pnpm build` runs `scripts/check-file-types.js`, which fails if core code imports a type's folder or
one type imports another, so a folder that passes stays removable.

## Add a type

1. Make `src/fileTypes/<name>/` with a `type.ts`, `module.tsx`, and `loader.ts`. Copy `document/`
   as a starting point: it's the smaller one.
2. Two types can't share an extension; the build says so if they do.
3. If the type needs something the app can't do yet, that belongs in the type's folder, not in core.
