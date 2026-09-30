---
title: "Systems"
description: "Design systems each live in their own scope: one for the app, and one or more for prototypes."
section: "Core concepts"
order: 11
toc: true
---

A design system here is a set of components plus a theme. The kit keeps each one in its own scope, so changing one never changes another. You can browse them all on the [Systems pages](/systems).

## Two kinds of system

- **The studio system** is the app's own UI: the navigation, the Prototypes page, the command palette, and this Guide. It lives in `src/studio/`, uses shadcn/ui's default neutral theme, and belongs to the platform. Prototypes never use it, and the build fails if one tries. That way, changing the app's look never changes anyone's prototype.
- **Prototype systems** are what prototypes build with. Each one is listed in `src/systems/index.ts`, and each prototype uses one.

## The product system

The kit ships one prototype system, `product`, in `src/systems/product/`. It's a placeholder: a few shadcn/ui components on one of shadcn/ui's preset themes, so you can see it's separate from the app. Replace it with your real product's components and theme, so prototypes look like what ships.

## Foundations

The Systems pages also show what the theme is made of, read straight from the system's `theme.css`: **Colors**, **Typography**, **Radius**, **Shadows**, **Spacing**, and **Other tokens**. You don't write anything for these. A page appears when the theme defines that kind of value, so a theme with only colors and a radius gets two pages, and one with its own fonts, shadows, and spacing scale gets them all. Each token is drawn with its real value and follows light and dark mode, and edit `theme.css` and the pages update.

Colors are grouped by what they are: shadcn/ui's names (surfaces, actions, charts, sidebar) keep their usual groups, and a ramp like `--blue-100` to `--blue-900` becomes a "Blue" group.

## Component pages

Each component gets a page on the [Systems pages](/systems), built from files that sit next to the component, all named after it:

- **The component itself**, like `button.tsx`. This alone gives it a page listing its props, read straight from the code, so the table can't drift.
- **Examples**, like `button.examples.tsx`. Each example is shown live in the system's theme, with its code one click away.
- **A page**, like `button.md`. It holds the title, a short description, and a "When to use" section. Add anything else your team wants to say: usage guidelines, accessibility notes, links to Figma. It's plain Markdown you can edit freely.

While the app runs on your computer, each component's page has an **Edit** button that opens its files in the editor, one tab each for the page, the examples, and the component itself, and the page updates as you save. If a component is missing its page or examples, the tab offers to create them from a template. Like the Handbook, these are platform files, so a change goes through review before it reaches everyone. On the deployed site the pages are read-only.

Ask your agent to add or document a component and it creates the missing files from a template for you to fill in. A component with only some of them still gets a page, and the build only warns about what's missing. If you want the missing pieces to fail the build instead, ask your agent to turn on strict docs for the system.

## Adding another system

A prototype system can be anything your team designs with. If you also design your marketing site, you might add a `brand` system beside `product`, so those prototypes use the brand's type and colors instead.

Every prototype system has the same parts:

1. **A folder**, like `src/brand/`, with its components and a `theme.css`.
2. **A scoped theme.** Its variables are set under one class, like `.brand-theme`, and nowhere else, so it can't leak into the app or another system.
3. **Pop-ups that stay in scope.** Dialogs and menus render inside the prototype's frame, so they keep the system's look.
4. **An entry in `src/systems/index.ts`**, plus a short spec for its introduction and theme page.

Adding one is a platform change, so it's a job for whoever maintains the kit. Ask your agent to add a system, and it follows the steps in `src/handbook/rules/systems.md`, starting from a copy of `src/systems/product/`.

A prototype picks its system in `meta.json`, with `"system": "brand"`. Without it, a prototype uses the first system listed, so nothing changes for anyone until you add a second one.

## Themes and color mode

Every theme uses the same CSS variable names, like `--background` and `--primary`, through Tailwind classes like `bg-background`. Prototypes should use those instead of hard-coded colors, so they work with any system and in both light and dark mode. Prototypes follow the app's color mode.
