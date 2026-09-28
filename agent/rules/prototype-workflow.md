# Prototype workflow

A prototype can depend only on its own folder, the product system, and shared utilities.

## Shape

```
src/prototypes/<contributor>/<prototype>/
├── meta.json
├── prototype.jsx   # a view (opens first)
├── lofi/           # a group
│   └── main.jsx    # a view in that group
└── components/     # helpers, not views
```

- **View**: a `.jsx` or `.tsx` file at the prototype's top level that default-exports a React component. The prototype opens on `prototype.jsx` (or `.tsx`), or its first view.
- **Group**: a subfolder (not `components/`) whose `.jsx`/`.tsx` files are views listed under the group's name. Groups are one level deep.
- **components/**: helper components, never listed as views.
- **meta.json**: `title` is required. `description`, `contributor` (display name), `created`, and `updated` (`YYYY-MM-DD`) are optional. If it's missing, isn't valid JSON, or has no title, the prototype is skipped with a warning naming the file in dev, and `pnpm build` fails.

## Rules

- Always create prototypes with `pnpm new "Prototype Name"`. Never copy folders by hand.
- Import only from the prototype's own folder, `@/product/`, and `@/lib/` (plus installed packages). The import guard warns in `pnpm dev` and fails `pnpm build` otherwise.
- Style with Tailwind classes. For custom CSS, use CSS Modules (`*.module.css`). Never a plain `.css` file or global rules like `body { … }`; they leak into the whole app.
- Use lucide-react for icons, and theme variables for color (see systems.md).
- If a view throws, the viewer shows "This view failed to load." with the error and a Copy button. Read the error before guessing.
- If the product system doesn't have a component you need, build it in the prototype's `components/` folder, using `radix-ui` primitives and theme classes. Adding it to `src/product/` is a platform change: suggest it, and only do it if the person agrees.
- Check your work with `pnpm build` before you commit. It writes `dist/`, which is disposable and ignored by Git.

## Saving and sharing

- Commit when a piece of work is done, with a short message like "Add Settings Page" or "Settings Page: add save state".
- Don't push until the person asks to share. Pushing to main publishes it for the team, and CI checks scope and builds the site.
