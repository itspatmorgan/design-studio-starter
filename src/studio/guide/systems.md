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

## Adding another system

A prototype system can be anything your team designs with. If you also design your marketing site, you might add a `brand` system beside `product`, so those prototypes use the brand's type and colors instead.

Every prototype system has the same parts:

1. **A folder**, like `src/brand/`, with its components and a `theme.css`.
2. **A scoped theme.** Its variables are set under one class, like `.brand-theme`, and nowhere else, so it can't leak into the app or another system.
3. **Pop-ups that stay in scope.** Dialogs and menus render inside the prototype's frame, so they keep the system's look.
4. **An entry in `src/systems/index.ts`**, plus a short spec for its Systems pages.

Adding one is a platform change, so it's a job for whoever maintains the kit. Ask your agent to add a system, and it follows the steps in `src/handbook/rules/systems.md`, starting from a copy of `src/systems/product/`.

A prototype picks its system in `meta.json`, with `"system": "brand"`. Without it, a prototype uses the first system listed, so nothing changes for anyone until you add a second one.

## Themes and color mode

Every theme uses the same CSS variable names, like `--background` and `--primary`, through Tailwind classes like `bg-background`. Prototypes should use those instead of hard-coded colors, so they work with any system and in both light and dark mode. Prototypes follow the app's color mode.
