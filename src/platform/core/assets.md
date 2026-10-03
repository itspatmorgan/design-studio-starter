# Static asset convention

Keep fonts, logos, images, and other static files with the scope that owns them. Asset folders are ordinary directories; they need no registration.

## Locations

| Owner or purpose | Location |
| --- | --- |
| Shared Studio UI assets | `src/platform/assets/` |
| A design system's brand assets and fonts | `src/systems/<id>/assets/` |
| Assets intentionally shared across prototypes and systems | `src/lib/assets/` |
| Assets used by one prototype | `src/prototypes/<contributor>/<prototype>/assets/` |
| Files that need a fixed public URL or unchanged filename | `public/` |

Create a directory when it is needed. Module-specific platform assets can live in that module's `assets/` folder, so they leave with the module.

A team logo or font used by its product views usually belongs to the assigned design system. Studio's logo and fonts belong to the platform. Use `src/lib/assets/` only when reuse is independent of a particular system.

## Imports and URLs

Prefer source imports for assets used by React code. CSS can reference local files with relative `url()` paths. Vite resolves these references and generates production asset URLs.

For example, a Product view can import `@/systems/product/assets/logo.svg`. A font referenced from `src/systems/product/styles/theme.css` can use `url("../assets/fonts/brand.woff2")`.

The repository's Vite configuration serves `public/` from the site root and copies its contents unchanged into the build. Reference `public/favicon.svg` as `/favicon.svg`, without `public` in the URL. Public files are site-wide URL resources, rather than scoped source imports.

See [Vite's static asset documentation](https://vite.dev/guide/assets.html) for import and public-directory behavior.

## Scope and fonts

Asset imports follow the same boundaries as code: a prototype can import its own assets, its assigned system's assets, and shared `src/lib/` assets. It cannot import private platform assets, another prototype's assets, or another system's assets. Shared assets cannot depend on those scopes.

Define system font usage in its scoped theme or components. When systems ship different fonts, use distinct font-family names; font-face registration is global even when the theme's use of it is scoped.

Assets support artifacts; they do not become navigable artifacts themselves. Follow the repository's [prototype workflow](../../handbook/rules/prototype-workflow.md) for asset-size checks and the [system contract](../modules/systems/reference.md) for theme scoping.
