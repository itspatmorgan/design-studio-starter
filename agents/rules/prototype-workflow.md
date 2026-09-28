# Prototype workflow

A prototype can depend only on its own folder, its design system, and shared utilities.

## Shape

```
src/prototypes/<contributor>/<prototype>/
├── meta.json
├── prototype.tsx   # a view (opens first)
├── lofi/           # a group
│   └── main.tsx    # a view in that group
└── components/     # helpers, not views
```

- **View**: a `.tsx` file (or plain `.jsx`) at the prototype's top level that default-exports a React component. Write new views as `.tsx`. The prototype opens on its `start` view (see meta.json), then `prototype.tsx` (or `.jsx`), then its first view.
- **Group**: a subfolder (not `components/`) whose `.tsx`/`.jsx` files are views listed under the group's name. Groups are one level deep.
- **Lofi**: a rough, grayscale sketch of an idea, usually in a `lofi/` group. Use theme colors only (`bg-muted`, `border-border`, `text-muted-foreground`), dashed outlines for placeholders, and gray bars for text. Skip polish.
- **URLs**: `/<contributor>/<prototype>` opens the default view; `/<contributor>/<prototype>/<view>` and `/<contributor>/<prototype>/<group>/<view>` open a view, named without its extension (`/patrick/hello-world/lofi/main`). To link between views, use TanStack Router's `Link` (https://tanstack.com/router/latest/docs/framework/react/guide/navigation).
- **components/**: helper components, never listed as views.
- **documents/**: reserved for a future prototype documents feature. Don't use it for views; it isn't listed.
- **meta.json**: `title` is required. `description`, `created` (`YYYY-MM-DD`, set by `pnpm new`), `system`, and `start` are optional. `system` is the design system it builds with, from `src/systems.ts`; leave it out to use the first one. `start` is the view the prototype opens on, written like its URL: `"main"` or `"lofi/main"`. When the person wants a different view to open first, change `start`; don't rename files. Don't add other fields. The contributor's name comes from `contributors.json`. If it's missing, isn't valid JSON, has no title, names a `system` that isn't listed, or has a `start` that isn't a view, the prototype is skipped with a warning naming the file in dev, and `pnpm build` fails.

## Rules

- Always create prototypes with `pnpm new "Prototype Name"`. Never copy folders by hand.
- Import only from the prototype's own folder, its design system (`@/product/` by default), and `@/lib/` (plus installed packages). The import guard warns in `pnpm dev` and fails `pnpm build` otherwise, including for imports from a different prototype system than the one in `meta.json`.
- Style with Tailwind classes. For custom CSS, use CSS Modules (`*.module.css`). Never a plain `.css` file or global rules like `body { … }`; they leak into the whole app.
- Use lucide-react for icons, and theme variables for color (see systems.md).
- If a view throws, the viewer shows "This view failed to load." with the error and a Copy button. Read the error before guessing.
- If its design system doesn't have a component you need, build it in the prototype's `components/` folder, using [Base UI](https://base-ui.com/react/overview/quick-start) primitives (`@base-ui/react`) and theme classes; compose with the `render` prop, not `asChild`. Adding it to the system is a platform change: suggest it, and only do it if the person agrees.
- Type props in `.tsx` views; keep types light. `.jsx` views aren't type-checked.
- Check your work with `pnpm build` before you commit. It type-checks (`pnpm typecheck`, which is `tsc -b`), then writes `dist/`, which is disposable and ignored by Git. Fix type errors rather than silencing them.

- Keep every committed file under 750 KB. Export images as WebP or compressed JPEG, at the size they're shown. The pre-commit hook blocks larger files, and CI fails on them; when it does, make the file smaller rather than working around the check.

## Saving and sharing

- Commit when a piece of work is done, with a short message like "Add Settings Page" or "Settings Page: add save state".
- Don't push until the person asks to share. Pushing to main publishes it for the team, and CI checks scope and builds the site.
