# Systems

There are two component systems.

- **Studio system**: `src/studio/components/` and `src/studio/styles/`. The app's own system, the wrapper that makes the sandbox work (nav rail, index, prototype navigation, command palette, systems page, the error message shown when a view fails). Maintained with the platform. Prototypes never import it.
- **Product system**: `src/product/components/` and `src/product/styles/theme.css`. What prototypes build with. It is a placeholder: teams are expected to replace all of it with their real product design system, ideally the components and tokens their production app uses. Its look applies inside the `.product-theme` wrapper the viewer puts around every view.

When the product system is replaced, keep these true: it lives in `src/product/`, prototypes import from `@/product/...`, styles stay scoped under `.product-theme` (with a `.dark .product-theme` block if the product has dark mode), and pop-ups render into the portal container (see Portals).

## Components

Both systems are shadcn/ui components on [Base UI](https://base-ui.com/react/overview/quick-start) (`components.json` style `base-nova`), not Radix. To make a trigger render as another element, use the `render` prop, not `asChild`:

```tsx
<DialogTrigger render={<Button variant="outline" />}>Open</DialogTrigger>
```

See [shadcn/ui](https://ui.shadcn.com/docs) (Base UI pages) and [Base UI composition](https://base-ui.com/react/handbook/composition).

## Icons

- App UI (`src/studio/`) uses HugeIcons (`@hugeicons/react` with `@hugeicons/core-free-icons`).
- Product components and prototypes use `lucide-react`, the icon set shadcn/ui brings in.

## Portals

Pop-ups such as dialogs render into a portal. In the product system, each one passes `usePortalContainer()` from `src/product/components/portal.tsx` as the Base UI Portal's `container` prop (`<DialogPrimitive.Portal container={usePortalContainer()} />`), so pop-ups stay inside `.product-theme` and keep the product look. When you add a product component that renders a portal, do the same.

## Dark mode

The app puts `.dark` on `<html>`, and `theme.css` sets dark values under `.dark .product-theme`, so prototypes follow the app's color mode. Use the theme's variables through Tailwind classes (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`), not hard-coded colors like `bg-white` or `#333`, or the view breaks in one of the modes.

Until it is replaced, the product system is a small placeholder set (button, dialog, input) on shadcn/ui's indigo preset. `npx shadcn add <name>` adds more shadcn/ui components to `src/product/components/`; if one renders a portal, wire it to `usePortalContainer()` as above.

To see what the product system offers, look in `src/product/components/` or open the Systems page (`/systems`).
