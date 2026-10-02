---
title: "Use your design system"
description: "Use your product's components and keep them separate from the studio UI."
section: "Create"
order: 11
toc: true
slug: "systems"
---

# Systems

A design system provides components and design tokens. Tokens are named values for colors, typography, spacing, and other design choices.

Browse available systems on the **Systems** pages.

Before building the feedback inbox, review the system's form, button, and list components. Tell the agent which patterns to reuse and where you want to explore an alternative.

## Platform and prototype systems

| System | Used by |
| --- | --- |
| Platform | Studio navigation, menus, editors, and documentation pages. |
| A prototype's assigned system | Its views and live view previews. |

Prototypes cannot import the platform UI. Each prototype has one assigned system, with separate runtime components and a scoped theme.

The system is a toolkit, not a requirement to use its components everywhere. Prototypes can build local alternatives or combine them with system components.

The starter includes **Product**, an example prototype system. Replace it with your product's components and tokens when they are available.

## Review foundations

Foundation pages show tokens read from each system's theme:

- Colors.
- Typography.
- Radius.
- Shadows.
- Spacing.
- Other tokens.

A page appears when the theme defines relevant values. Typography also includes the Tailwind defaults where the theme does not override them.

Switch the studio's color mode to review light and dark values.

## Review components

A component page can include a description, a generated props table, and live examples. Props are inputs that configure a component.

Use the examples to review behavior and appearance. Open their code when you need an implementation example.

Props tables are read from TypeScript. They summarize supported component inputs; they do not replace the component's full API documentation.

A component can link to upstream documentation. Follow the library used by that system rather than assuming every system uses shadcn/ui.

## Edit component documentation

Component files are shared platform files. Make changes as part of an authorized maintainer task.

While running locally, select **Edit** on a component page. The editor provides tabs for the page, examples, and component code.

Missing page or example files can be created from a template. Ask your agent to complete the text and examples. Deployed pages are read-only.

The build normally warns about missing component documentation. A system can require complete documentation with `docs: 'strict'`.

## Replace Product or add another system

Give your agent the component source, dependencies, tokens, and usage guidance. Ask it to set up the system.

The `setup-design-system` skill guides imports, documentation, theme checks, and review of representative components.

Review the replacement before making it the default. Keep Product until retained prototypes no longer depend on it.

A second system can support another product or a marketing site. Adding one preserves the current default; changing the default does not migrate existing prototypes.

Ask the agent to migrate a prototype's imports and system choice together.

## Theme boundaries

Each prototype system has a unique theme class. Theme rules must target that class or its descendants. Pop-ups must remain inside the system's themed container.

The starter uses variables such as `--background` through Tailwind classes such as `bg-background`. Imported systems can use their own token conventions.

Use your assigned system's tokens and component APIs. Review the prototype in both color modes.

## For developers

The design systems pages, at `/systems`: what each system has, its tokens, and a page per component. Required. The systems themselves are
folders in `src/systems/<id>/`, which are your content.

- `module.ts`, `app.tsx`: who it is, its rail button and routes.
- `spec.ts`: what a `system.ts` declares (`SystemSpec`) and the check for it.
- `sources.ts`, `docs.ts`, `scaffold.ts`, `themeTokens.ts`: where a component came from, how its docs and props are read, the starter docs a new component gets, and the theme's tokens.
- `pages/`, `data/`: the Systems pages and the loaders behind them (browser).
- `node/`: finding systems, building their docs and props, and `pnpm component-docs` (Node).
