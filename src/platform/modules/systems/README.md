---
title: "Manage design systems"
description: "Maintain components, documentation, and system choices."
section: "Maintain"
order: 21
toc: true
slug: "systems"
---

# Systems

**Systems** lists the available systems, their foundations, and their components. For initial import, see [Set up your design system](/guide/setup-design-system).

| System | Used by |
| --- | --- |
| Platform | Studio navigation, menus, editors, and documentation pages. |
| Assigned prototype system | A prototype's views and live previews. |

Prototypes cannot import platform UI. Each prototype has one assigned system, but can also build local components and styles.

## Foundations and component pages

Foundation pages read tokens from the system's theme: colors, typography, radius, shadows, spacing, and other values. Typography includes Tailwind defaults where the theme does not override them.

Component pages can include descriptions, generated props tables, and live examples with source code. Props tables come from TypeScript. Upstream documentation links depend on the library used by that system.

## Maintain the kit

Ask your agent to add or update components and their documentation. The `document-component` skill provides the component-page procedure.

Locally, **Edit** on a component page opens tabs for its Markdown, examples, and component code. Missing page and example files can be created from templates. Published pages are read-only.

Missing documentation normally produces build warnings. A system can require complete documentation with `docs: 'strict'`.

System files are shared platform content. Changes require maintainer authorization.

## Add, replace, or remove a system

Ask your agent to preview the change. Another system can support a different product or type of work. Adding it preserves the current default.

Changing the default through the configuration command preserves existing prototypes' system choices. Migrating a prototype requires changing its imports and assigned system together.

Keep a system until retained prototypes no longer depend on it. Removal checks identify dependencies that must change first.

## Theme boundaries

Each system has a unique theme class. Theme rules must target that class or its descendants, and pop-ups must stay inside its themed container.

These boundaries keep the system separate from other prototypes and the platform. Imported systems can use their own token conventions and component APIs.

## For developers

Read the [module contract](reference.md) for file structure and implementation details.

The design systems pages, at `/systems`: what each system has, its tokens, and a page per component. Required. The systems themselves are
folders in `src/systems/<id>/`, which are your content.

- `module.ts`, `app.tsx`: who it is, its rail button and routes.
- `spec.ts`: what a `system.ts` declares (`SystemSpec`) and the check for it.
- `sources.ts`, `docs.ts`, `scaffold.ts`, `themeTokens.ts`: where a component came from, how its docs and props are read, the starter docs a new component gets, and the theme's tokens.
- `pages/`, `data/`: the Systems pages and the loaders behind them (browser).
- `node/`: finding systems, building their docs and props, and `pnpm component-docs` (Node).
