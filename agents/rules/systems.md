# Systems

There are two kinds of design system, each in its own scope.

- **Studio system**: `src/studio/components/` and `src/studio/styles/`. The app's own system, the wrapper that makes the sandbox work (nav rail, index, prototype navigation, command palette, Systems pages, Guide, the error message shown when a view fails). Maintained with the platform. Prototypes never import it.
- **Prototype systems**: what prototypes build with, listed in `src/systems.ts`. The kit ships one, `product` (`src/product/`), a placeholder a team replaces with their real product design system. A team can add others, like a `brand` system for marketing work. Each prototype uses one: `"system"` in its `meta.json`, or the first one listed.

## What makes a prototype system

Every prototype system has the same parts. Keep them true when replacing one, and follow them when adding one:

1. **A folder**: `src/<system>/`, with `components/` and `styles/theme.css`. Prototypes import from `@/<system>/...`.
2. **A scoped theme**: every variable in `theme.css` is set under `.<system>-theme`, with a `.dark .<system>-theme` block for dark mode. Nothing is global, so systems can't leak into each other or into the app UI.
3. **Portals**: components that render a pop-up pass `usePortalContainer()` from `@/lib/portal` as the Base UI Portal's `container` (`<DialogPrimitive.Portal container={usePortalContainer()} />`), so pop-ups stay inside the system's theme and the prototype frame.
4. **An entry in `src/systems.ts`** (label, folder, theme class), and **a spec** for its Systems pages, like `src/studio/app/pages/systems/productSystem.tsx`, added to `PROTOTYPE_SPECS` in `SystemsPage.tsx`. Import its `theme.css` in `src/studio/styles/index.css`, next to the product one.

Adding or replacing a system is a platform change: describe it and confirm with the person first. To add one, copy `src/product/` as the starting point.

## Components

All systems use shadcn/ui components on [Base UI](https://base-ui.com/react/overview/quick-start) (`components.json` style `base-nova`), not Radix. To make a trigger render as another element, use the `render` prop, not `asChild`:

```tsx
<DialogTrigger render={<Button variant="outline" />}>Open</DialogTrigger>
```

See [shadcn/ui](https://ui.shadcn.com/docs) (Base UI pages) and [Base UI composition](https://base-ui.com/react/handbook/composition).

`npx shadcn add <name>` adds a shadcn/ui component to `src/product/components/` (set in `components.json`). For another system, pass `--path src/<system>/components`. If a new component renders a pop-up, wire it to `usePortalContainer()` as above.

## Icons

- App UI (`src/studio/`) uses HugeIcons (`@hugeicons/react` with `@hugeicons/core-free-icons`).
- Prototype systems and prototypes use `lucide-react`, the icon set shadcn/ui brings in, unless the system brings its own.

## Dark mode

The app puts `.dark` on `<html>`, and each system's `theme.css` sets dark values under `.dark .<system>-theme`, so prototypes follow the app's color mode. Use the theme's variables through Tailwind classes (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`), not hard-coded colors like `bg-white` or `#333`, or the view breaks in one of the modes.

To see what a system offers, look in its `components/` folder or open its pages in the app (`/systems/product`, one page per component).
