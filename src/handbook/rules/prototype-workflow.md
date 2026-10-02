# Prototype workflow

A prototype can depend only on its own folder, its design system, and shared utilities.

## Shape

A file's type comes from its extension (`src/platform/core/fileTypes.md`: `.tsx` and `.jsx` are views, `.md` are documents), and folders are only for organizing, at any depth. Organize by topic, however the person likes.

```
src/prototypes/<contributor>/<prototype>/
├── meta.json
├── prototype.tsx          # a view
├── lofi/
│   └── main.tsx           # a view, in a folder
├── checkout/
│   ├── steps/
│   │   └── done.tsx       # a view, two folders deep
│   └── _components/       # helpers, not views (any name starting with _, at any depth)
├── problem-framing.md     # a document (see documents.md)
└── hero.webp              # a plain file
```

- **View**: any `.tsx` file (or plain `.jsx`) that default-exports a React component, at any depth, except a helper (see Folders). Write new views as `.tsx`. The build fails on a view without a default export (put helpers in `_components/`), or on two files that would share a URL, like `main.tsx` and `main.jsx` (or `main.md`) in one folder.
- **Document**: any `.md` file, at any depth, except a helper. See [documents.md](documents.md).
- **Folders**: any folder, at any depth, just for organizing. A folder's name never changes what's in it. The one exception is a file or folder whose name starts with an underscore (`_components/`, `_data.ts`), at any depth: it and anything inside it is a helper, never listed or opened as a view. Put shared pieces a view imports there.
- **Opens on**: the prototype opens on its `start` item (see meta.json), or else the first item in its navigation. To choose a different one, set `start`; don't rename files to change the order.
- **Lofi**: a mode on a view, not a folder. Put `/** @lofi */` as a comment at the very top of a view file (above any code) and the app draws it in grayscale with handwritten type (Comic Neue), over the same components and the same design system. Remove the comment to go back; the person can also right-click the view and choose **Make lofi** or **Make hi-fi**, which edits that line. It applies to one view at a time, never a whole prototype. When the person says "lofi" about a screen that uses the system's components, set the marker; don't change the components or invent a different look. Sketching with plain boxes, dashed outlines, and gray bars, with no design system, is also fine for an idea that isn't ready for components, but that is a sketch, not lofi mode. A folder called `lofi/` is only a name.
- **URLs**: `/prototypes/<person>/<prototype>` opens the start item; `/prototypes/<person>/<prototype>/<path>` opens an item by its path without the extension, at any depth (`/prototypes/patrick/hello-world/lofi/main`, `/prototypes/patrick/hello-world/checkout/steps/done`). The older form without `/prototypes` still opens, and is sent to the new one. To link between views, use TanStack Router's `Link` (https://tanstack.com/router/latest/docs/framework/react/guide/navigation).
- **Renaming**: changing a prototype's `title` in the app also renames its folder to the title's slug ("Checkout Flow" → `checkout-flow`). When you rename a prototype for the person, do the same: change `title` in `meta.json` and rename the folder to match, unless they say otherwise. Links to it, like a shared URL, change; relative links inside its documents don't. The app rewrites canonical and legacy links to its own address inside its Markdown and canvas files. When renaming files directly, update those internal links too; report links from other prototypes for their owners to fix.
- **meta.json**: `title` is required. `description`, `created` (`YYYY-MM-DD`, set by `pnpm new`), `system`, `start`, `status`, and `order` are optional (and `maintainers`, for a published tool: see [tools.md](tools.md)). `system` is the design system it builds with, the name of a folder in `src/systems/`; leave it out to use the default (`defaultSystem` in `studio.config.ts`, else the first by name). `start` is the item the prototype opens on, as its path without the extension: `"lofi/main"`. Moving or renaming the start item (or its folder) must update `start`; the app does this for its own changes. `order` is how the navigation is arranged: a list of paths (files and folders, relative to the prototype) that go first, in that sequence, within their folder: `["start-here.md", "app", "states"]`. Anything not listed follows, files before folders, alphabetical. Without `order` the navigation is just that default. When asked to reorder, edit `order`; never rename files for it. Moving, renaming, or deleting a file must update its entry (the app does this for its own changes). Don't add other fields. The contributor's name comes from `contributors.json`. If it's missing, isn't valid JSON, has no title, names a `system` that isn't installed, has a `start` that isn't an item, or has an `order` that isn't a list of paths, the prototype is skipped with a warning naming the file in dev, and `pnpm build` fails.

## Rules

- Always create prototypes with `pnpm new "Prototype Name"`. Never copy folders by hand.
- Import only from the prototype's own folder, its design system (`@/systems/product/` by default), and `@/lib/` (plus installed packages). The import guard warns in `pnpm dev` and fails `pnpm build` otherwise, including for imports from a different prototype system than the one in `meta.json`.
- Style with Tailwind classes. For custom CSS, use CSS Modules (`*.module.css`). Never a plain `.css` file or global rules like `body { … }`; they leak into the whole app. The import guard fails the build on a plain `.css` import from a prototype.
- Use lucide-react for icons, and theme variables for color (see systems.md).
- If a view throws, the viewer shows "This page couldn't load." with the error and a Copy button. Read the error before guessing.
- If its design system doesn't have a component you need, build it in the prototype's `_components/` folder, using [Base UI](https://base-ui.com/react/overview/quick-start) primitives (`@base-ui/react`) and theme classes; compose with the `render` prop, not `asChild`. Adding it to the system is a platform change: suggest it, and only do it if the person agrees.
- Type props in `.tsx` views; keep types light. `.jsx` views aren't type-checked.
- Check your work with `pnpm build` before you commit. It type-checks (`pnpm typecheck`, which is `tsc -b`), then writes `dist/`, which is disposable and ignored by Git. Fix type errors rather than silencing them.

- Keep every committed file under 750 KB. Export images as WebP or compressed JPEG, at the size they're shown. The pre-commit hook blocks larger files, and CI fails on them; when it does, make the file smaller rather than working around the check.

- New views and prototypes start as `export default emptyView` (`src/lib/emptyView.ts`): the platform shows its own "This view is empty" page, with a prompt for the person to hand you. When you build the view, replace that export with your component and remove the import.
- The person may also edit a view or document's text in the app (the source button in the Files row, saved with ⌘S). If you change a file they have open, the editor updates or asks them; they don't need to reload.
- The person may also create, rename, move, and delete files from the app's file tree while `pnpm dev` runs. Those are ordinary file changes: re-read the folder rather than assuming it's as you left it. The tree hides `meta.json`, `components/`, and files that aren't views or documents by default, so the person may not see a helper or asset you mention; point them to it by path, or to Show all files in the … menu.

## Saving and sharing

- Commit when a piece of work is done, with a short message like "Add Settings Page" or "Settings Page: add save state".
- Don't push until the person asks to share. Pushing to main checks scope and builds a site artifact. It publishes for the team once the studio maintainer connects the deployment workflow to a host.
