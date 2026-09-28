# Systems

There are two component systems.

- **Studio system** — `src/studio/components/` and `src/studio/styles/`. For the app UI only (index, systems page, navigation). Prototypes never import it.
- **Product system** — `src/product/components/` and `src/product/styles/theme.css`. What prototypes build with. Its look applies inside the `.product-theme` wrapper. Components that render a portal pass `usePortalContainer()` from `src/product/components/portal.jsx` so pop-ups stay themed.
