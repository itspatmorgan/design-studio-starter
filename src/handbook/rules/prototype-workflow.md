# Prototype workflow

Read the [prototype contract](../../platform/modules/prototypes/reference.md) when creating or reorganizing prototype files, metadata, or links.

## Create and edit

- Create prototypes with `pnpm new "Prototype Name"`. Do not copy a whole prototype folder as a substitute for this command.
- Write new views as `.tsx` with a default-exported React component. Keep helper files under underscore names, such as `_components/`.
- Replace the `emptyView` export when implementing an empty view.
- Use the assigned design system as a toolkit. Build local components when the experiment needs them.
- Follow that system's component APIs, token conventions, and icon library. For starter components, use Base UI's `render` prop instead of `asChild`.
- Read the [systems rule](systems.md) when working with components, themes, or pop-ups.
- Re-read files before changing them. The person can edit and reorganize content in the running app.
- When changing files directly, update metadata and internal links using the prototype contract. Report incoming links for other owners to update.

## Dependencies and styles

A prototype may use its own files, its assigned system, shared utilities, installed packages, and enabled public module libraries.

Access a public module library through `@module/<id>` only. Do not import private platform files, another prototype, or another system.

These boundaries also apply to indirect and type-only dependencies. Use literal paths for dynamic imports.

Use Tailwind classes or CSS Modules with local selectors. Do not import plain CSS, use `:global`, or add CSS `@import` in prototypes.

Keep shared utilities independent of prototypes, systems, and platform code. Keep experiments local until an authorized shared change moves them into the system.

## Verify and save

- Read rendering errors before changing code. Fix type and boundary errors rather than suppressing them.
- Run `pnpm build` before committing completed work. Inspect the rendered result when changing views.
- Keep committed files within the 750 KB limit. Compress oversized assets instead of bypassing the check.
- Commit finished work with a concise message. Push only when the person asks to share.

A push runs repository checks. It does not publish a site.
