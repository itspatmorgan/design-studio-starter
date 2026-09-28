# Prototype workflow

A prototype can depend only on its own folder, the product system, and shared utilities.

- **Prototype**: a folder at `src/prototypes/<contributor>/<prototype>/` with a `meta.json` (only `title` required).
- **View**: a `.jsx` file at the prototype's top level that default-exports a React component.
- **Group**: a subfolder (not `components/`) whose `.jsx` files are views listed under the group's name.

Rules:
- Always create prototypes with `pnpm new "Prototype Name"`. Never copy folders by hand.
- Put helper components in the prototype's `components/` folder; they are not views.
- Import only from the prototype's own folder, `@/product/`, and `@/lib/` (plus installed packages). The import guard fails the build otherwise.
- Style with Tailwind classes. For custom CSS, use CSS Modules (`*.module.css`). Never a plain `.css` file or global rules like `body { … }`.
