# Systems

There are two component systems.

- **Studio system**: `src/studio/components/` and `src/studio/styles/`. For the app UI only (index, systems page, navigation, the error message shown when a view fails). Prototypes never import it.
- **Product system**: `src/product/components/` and `src/product/styles/theme.css`. What prototypes build with. Its look applies inside the `.product-theme` wrapper the viewer puts around every view.

## Icons

- App UI (`src/studio/`) uses HugeIcons (`@hugeicons/react` with `@hugeicons/core-free-icons`).
- Product components and prototypes use `lucide-react`, the icon set shadcn/ui brings in.

## Portals

Dialogs, dropdown menus, popovers, selects, sheets, and tooltips render into a portal. In the product system, each one passes `usePortalContainer()` from `src/product/components/portal.jsx` as the portal's `container`, so pop-ups stay inside `.product-theme` and keep the product look. When you add a product component that renders a portal, do the same.

## Dark mode

The app puts `.dark` on `<html>`, and `theme.css` sets dark values under `.dark .product-theme`, so prototypes follow the app's color mode. Use the theme's variables through Tailwind classes (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`), not hard-coded colors like `bg-white` or `#333`, or the view breaks in one of the modes.

To see what the product system offers, look in `src/product/components/` or open the Systems page (`?page=systems`).
