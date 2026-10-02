---
title: "Systems"
description: "Design systems each live in their own scope: one for the app, and one or more for prototypes."
section: "Core concepts"
order: 11
toc: true
slug: "systems"
---

# Systems

A design system here is a set of components plus a theme. The kit keeps each one in its own scope, so changing one never changes another. You can browse them all on the [Systems pages](/systems).

## Two kinds of system

- **The platform system** is the app's own UI: the navigation, the Prototypes page, the command palette, and this Guide. It lives in `src/platform/`, is made of stock shadcn/ui components vendored into the repo (so you can read and change them), uses shadcn/ui's default neutral theme, and belongs to the platform. Prototypes never use it, and the build fails if one tries. That way, changing the app's look never changes anyone's prototype.
- **Prototype systems** are what prototypes build with. Each one is a folder in `src/systems/`, and each prototype uses one.

## The product system

The kit ships one prototype system, `product`, in `src/systems/product/`. It's a placeholder: a few shadcn/ui components on one of shadcn/ui's preset themes, so you can see it's separate from the app. Replace it with your real product's components and theme, so prototypes look like what ships.

## Foundations

The Systems pages also show what the theme is made of, read straight from the system's `theme.css`: **Colors**, **Typography**, **Radius**, **Shadows**, **Spacing**, and **Other tokens**. You don't write anything for these. A page appears when the theme defines that kind of value, so a theme with only colors and a radius gets those two, and one with its own shadows and spacing scale gets them too. **Typography** is always there: it shows the theme's fonts, and the sizes and weights, which are Tailwind's own scale unless the theme sets its own. Each token is drawn with its real value and follows light and dark mode, and edit `theme.css` and the pages update.

Colors are grouped by what they are: shadcn/ui's names (surfaces, actions, charts, sidebar) keep their usual groups, and a ramp like `--blue-100` to `--blue-900` becomes a "Blue" group.

## Component pages

Each component gets a page on the [Systems pages](/systems), built from the files in the component's folder (`button/`), all named after it:

- **The component itself**, like `button/button.tsx`. This alone gives it a page listing its props, read straight from the code, so the table can't drift.
- **Examples**, like `button/button.examples.tsx`. Each example is shown live in the system's theme, with its code one click away.
- **A page**, like `button/button.md`. An `index.ts` beside them re-exports the component, so it's imported as `components/button`. It holds the title, a short description, and a "When to use" section. Add anything else your team wants to say: usage guidelines, accessibility notes, links to Figma. It's plain Markdown you can edit freely.

While the app runs on your computer, each component's page has an **Edit** button that opens its files in the editor, one tab each for the page, the examples, and the component itself, and the page updates as you save. If a component is missing its page or examples, the tab offers to create them from a template. Like the Handbook, these are platform files, so a change goes through review before it reaches everyone. On the deployed site the pages are read-only.

Both systems get the same pages, the platform system included. Where a system's components come from shadcn/ui, each page links to that component's shadcn/ui docs, so you can see where it came from. A page can point somewhere else with a `docs:` link in its frontmatter, and a system whose components aren't shadcn/ui just doesn't set `origin` in its `system.ts`.

Ask your agent to add or document a component and it creates the missing files from a template for you to fill in. A component with only some of them still gets a page, and the build only warns about what's missing. If you want the missing pieces to fail the build instead, ask your agent to turn on strict docs for the system.

## Adding another system

A prototype system can be anything your team designs with. If you also design your marketing site, you might add a `brand` system beside `product`, so those prototypes use the brand's type and colors instead.

Every prototype system has the same parts:

1. **A folder**, like `src/systems/brand/`, with `components/` and `styles/theme.css`.
2. **A scoped theme.** Its variables are set under one class, like `.brand-theme`, and nowhere else, so it can't leak into the app or another system.
3. **Pop-ups that stay in scope.** Dialogs and menus render inside the prototype's frame, so they keep the system's look.
4. **A `system.ts`** that names it and its theme class, and optionally an `intro.tsx` for its page on this site. The app finds it by its folder, so there's no list to edit.

Adding one is a platform change, so it's a job for whoever maintains the kit. Ask your agent to add a system, and it follows the steps in `src/handbook/rules/systems.md`, starting from a new system folder (`pnpm studio create-system brand`).

A prototype picks its system in `meta.json`, with `"system": "brand"`. Without it, a prototype uses the default system (`defaultSystem` in `studio.config.ts`, else the first by name), so nothing changes for anyone until you add a second one.

## Themes and color mode

Every theme uses the same CSS variable names, like `--background` and `--primary`, through Tailwind classes like `bg-background`. Prototypes should use those instead of hard-coded colors, so they work with any system and in both light and dark mode. Prototypes follow the app's color mode.

## For developers

The design systems pages, at `/systems`: what each system has, its tokens, and a page per component. Required. The systems themselves are
folders in `src/systems/<id>/`, which are your content.

- `module.ts`, `app.tsx`: who it is, its rail button and routes.
- `spec.ts`: what a `system.ts` declares (`SystemSpec`) and the check for it.
- `sources.ts`, `docs.ts`, `scaffold.ts`, `themeTokens.ts`: where a component came from, how its docs and props are read, the starter docs a new component gets, and the theme's tokens.
- `pages/`, `data/`: the Systems pages and the loaders behind them (browser).
- `node/`: finding systems, building their docs and props, and `pnpm component-docs` (Node).
