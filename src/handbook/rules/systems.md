# Systems

There are two kinds of design system, each in its own scope.

- **Studio system**: `src/studio/components/` and `src/studio/styles/`. The app's own system, the wrapper that makes the sandbox work (nav rail, index, prototype navigation, command palette, Systems pages, Guide, the error message shown when a view fails). Maintained with the platform. Prototypes never import it.
- **Prototype systems**: what prototypes build with, listed in `src/systems/index.ts`. The kit ships one, `product` (`src/systems/product/`), a placeholder a team replaces with their real product design system. A team can add others, like a `brand` system for marketing work. Each prototype uses one: `"system"` in its `meta.json`, or the first one listed.

## What makes a prototype system

Every prototype system has the same parts. Keep them true when replacing one, and follow them when adding one:

1. **A folder**: `src/systems/<system>/`, with `components/` and `styles/theme.css`. Prototypes import from `@/systems/<system>/...`.
2. **A scoped theme**: every variable in `theme.css` is set under `.<system>-theme`, with a `.dark .<system>-theme` block for dark mode. Nothing is global, so systems can't leak into each other or into the app UI. The build fails on any rule in a system's `theme.css` that isn't under its class, like `:root` or `body`, which themes pasted from a theme builder often include.
3. **Portals**: components that render a pop-up pass `usePortalContainer()` from `@/lib/portal` as the Base UI Portal's `container` (`<DialogPrimitive.Portal container={usePortalContainer()} />`), so pop-ups stay inside the system's theme and the prototype frame.
4. **An entry in `src/systems/index.ts`** (label, folder, theme class), and **a spec** for its Systems pages, like `src/studio/app/pages/systems/productSystem.tsx`, added to `PROTOTYPE_SPECS` in `SystemsPage.tsx`. Import its `theme.css` in `src/studio/styles/index.css`, next to the product one.

Adding or replacing a system is a platform change: describe it and confirm with the person first. To add one, copy `src/systems/product/` as the starting point.

## Components

All systems use shadcn/ui components on [Base UI](https://base-ui.com/react/overview/quick-start) (`components.json` style `base-nova`), not Radix. To make a trigger render as another element, use the `render` prop, not `asChild`:

```tsx
<DialogTrigger render={<Button variant="outline" />}>Open</DialogTrigger>
```

See [shadcn/ui](https://ui.shadcn.com/docs) (Base UI pages) and [Base UI composition](https://base-ui.com/react/handbook/composition).

`npx shadcn add <name>` adds a shadcn/ui component to `src/systems/product/components/` (set in `components.json`). For another system, pass `--path src/systems/<system>/components`. If a new component renders a pop-up, wire it to `usePortalContainer()` as above. After adding or bringing in a component, give it its page (below).

## Component pages

A prototype system's component pages come from its files, not from a spec. Files that share a name make one component, flat or in a folder of their own:

- `button.tsx` is the component. Alone, it is listed with its props table, read from the code.
- `button.examples.tsx` adds live examples. Each export named with a capital is one example, shown with its code.
- `button.md` adds the page's text. Its frontmatter has a `title` and a `description`, and it has a `## When to use` section. Everything else in it is the team's to write.

After adding or bringing in a component, run `pnpm component-docs <system> <component>` (or without the component, for every one that lacks its files). It writes the missing files from a template and never touches one that exists. Then fill in the description, the "When to use" section, and the examples. To do all of it, follow the `document-component` skill. While the app runs, the person can do the same in it: each page has an Edit button for its files, and the sidebar's + adds a component. Nothing else about a component (rename, move, delete) is offered there; do those in the files.

The build warns about a component without its examples or page, and about a page missing its title, description, or "When to use". A system with `docs: 'strict'` in `src/systems/index.ts` fails the build instead. The studio system lists its components in its spec (`studioSystem.tsx`) instead.

## Icons

- App UI (`src/studio/`) uses HugeIcons (`@hugeicons/react` with `@hugeicons/core-free-icons`).
- Prototype systems and prototypes use `lucide-react`, the icon set shadcn/ui brings in, unless the system brings its own.

## Dark mode

The app puts `.dark` on `<html>`, and each system's `theme.css` sets dark values under `.dark .<system>-theme`, so prototypes follow the app's color mode. Use the theme's variables through Tailwind classes (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`), not hard-coded colors like `bg-white` or `#333`, or the view breaks in one of the modes.

To see what a system offers, look in its `components/` folder or open its pages in the app (`/systems/product`, one page per component).
