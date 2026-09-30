# Prototype workflow

A prototype can depend only on its own folder, its design system, and shared utilities.

## Shape

A file's type comes from its extension (`src/studio/fileTypes/`: `.tsx` and `.jsx` are views, `.md` are documents), and folders are only for organizing, at any depth. Organize by topic, however the person likes.

```
src/prototypes/<contributor>/<prototype>/
├── meta.json
├── prototype.tsx          # a view
├── lofi/
│   └── main.tsx           # a view, in a folder
├── checkout/
│   ├── steps/
│   │   └── done.tsx       # a view, two folders deep
│   └── components/        # helpers, not views (at any depth)
├── problem-framing.md     # a document (see documents.md)
└── hero.webp              # a plain file
```

- **View**: any `.tsx` file (or plain `.jsx`) that default-exports a React component, at any depth, except inside a `components/` folder. Write new views as `.tsx`. The build fails on a view without a default export (put helpers in `components/`), or on two files that would share a URL, like `main.tsx` and `main.jsx` (or `main.md`) in one folder.
- **Document**: any `.md` file, at any depth, except inside `components/`. See [documents.md](documents.md).
- **Folders**: any folder, at any depth, just for organizing. A folder's name never changes what's in it. The one exception is `components/`, at any depth: its files are helpers, never listed.
- **Opens on**: the prototype opens on its `start` item (see meta.json), or else the first item in its navigation (files before folders, alphabetical at each level). To choose a different one, set `start`; don't rename files to change the order.
- **Lofi**: a rough, grayscale sketch of an idea, often in a `lofi/` folder. Use theme colors only (`bg-muted`, `border-border`, `text-muted-foreground`), dashed outlines for placeholders, and gray bars for text. Skip polish.
- **URLs**: `/<contributor>/<prototype>` opens the start item; `/<contributor>/<prototype>/<path>` opens an item by its path without the extension, at any depth (`/patrick/hello-world/lofi/main`, `/patrick/hello-world/checkout/steps/done`). To link between views, use TanStack Router's `Link` (https://tanstack.com/router/latest/docs/framework/react/guide/navigation).
- **Renaming**: changing a prototype's `title` in the app also renames its folder to the title's slug ("Checkout Flow" → `checkout-flow`). When you rename a prototype for the person, do the same: change `title` in `meta.json` and rename the folder to match, unless they say otherwise. Links to it, like a shared URL, change; relative links inside its documents don't.
- **meta.json**: `title` is required. `description`, `created` (`YYYY-MM-DD`, set by `pnpm new`), `system`, and `start` are optional. `system` is the design system it builds with, from `src/systems/index.ts`; leave it out to use the first one. `start` is the item the prototype opens on, as its path without the extension: `"lofi/main"`. Moving or renaming the start item (or its folder) must update `start`; the app does this for its own changes. Don't add other fields. The contributor's name comes from `contributors.json`. If it's missing, isn't valid JSON, has no title, names a `system` that isn't listed, or has a `start` that isn't an item, the prototype is skipped with a warning naming the file in dev, and `pnpm build` fails.

## Rules

- Always create prototypes with `pnpm new "Prototype Name"`. Never copy folders by hand.
- Import only from the prototype's own folder, its design system (`@/systems/product/` by default), and `@/lib/` (plus installed packages). The import guard warns in `pnpm dev` and fails `pnpm build` otherwise, including for imports from a different prototype system than the one in `meta.json`.
- Style with Tailwind classes. For custom CSS, use CSS Modules (`*.module.css`). Never a plain `.css` file or global rules like `body { … }`; they leak into the whole app. The import guard fails the build on a plain `.css` import from a prototype.
- Use lucide-react for icons, and theme variables for color (see systems.md).
- If a view throws, the viewer shows "This page couldn't load." with the error and a Copy button. Read the error before guessing.
- If its design system doesn't have a component you need, build it in the prototype's `components/` folder, using [Base UI](https://base-ui.com/react/overview/quick-start) primitives (`@base-ui/react`) and theme classes; compose with the `render` prop, not `asChild`. Adding it to the system is a platform change: suggest it, and only do it if the person agrees.
- Type props in `.tsx` views; keep types light. `.jsx` views aren't type-checked.
- Check your work with `pnpm build` before you commit. It type-checks (`pnpm typecheck`, which is `tsc -b`), then writes `dist/`, which is disposable and ignored by Git. Fix type errors rather than silencing them.

- Keep every committed file under 750 KB. Export images as WebP or compressed JPEG, at the size they're shown. The pre-commit hook blocks larger files, and CI fails on them; when it does, make the file smaller rather than working around the check.

- New views and prototypes start as `<Placeholder file={import.meta.url} />` (`src/lib/placeholder.tsx`), an empty state that asks the person to describe what to build. When you build the view, replace the placeholder and remove its import.
- The person may also edit a view or document's text in the app (the source button in the Files row, saved with ⌘S). If you change a file they have open, the editor updates or asks them; they don't need to reload.
- The person may also create, rename, move, and delete files from the app's file tree while `pnpm dev` runs. Those are ordinary file changes: re-read the folder rather than assuming it's as you left it. The tree hides `meta.json`, `components/`, and files that aren't views or documents by default, so the person may not see a helper or asset you mention; point them to it by path, or to Show all files in the … menu.

## Saving and sharing

- Commit when a piece of work is done, with a short message like "Add Settings Page" or "Settings Page: add save state".
- Don't push until the person asks to share. Pushing to main publishes it for the team, and CI checks scope and builds the site.
