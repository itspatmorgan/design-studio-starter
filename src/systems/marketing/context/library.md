---
title: Marketing library
description: The selected Untitled UI subset and its integration with Studio.
---

Marketing is a small, independent system for public-facing Design Studio pages. It uses Untitled UI React on React Aria and Tailwind. Product remains the default for product prototypes.

## Included

- Untitled UI Button: small and large sizes; primary, secondary, and two link variants.
- Untitled UI Tooltip and TooltipTrigger: supplemental information, including a scoped popup.
- Inter typography, violet brand colors, neutral surfaces, selected spacing, four display sizes for larger headings, and small rounded controls.
- Light and dark modes. Both are defined in `styles/theme.css`.

The theme file is the inventory. Omitted foundations and unimported Untitled UI components are outside this system. Add them deliberately when needed. Landing-page sections are local prototype composition, not imports of paid marketing templates.

## Source and adaptations

Components and utility helpers are adapted from the [public Untitled UI repository](https://github.com/untitleduico/react), revision `4702dc0ea8d140c3491a85670c7b4fab47b722da`. The original MIT notice is retained in `src/systems/marketing/LICENSE`.

The Button and Tooltip come from `components/base/buttons/button.tsx` and `components/base/tooltip/tooltip.tsx`. Class merging and component detection come from `utils/cx.ts` and `utils/is-react-component.ts`.

Imports point into this system. The Button variant catalog is narrowed. Upstream background/text/border color aliases use native Tailwind names (`bg-bg-primary`, `text-text-primary`, `ring-border-primary`) so no global library theme overrides Studio or Product. Typography values use finite tokens instead of upstream's spacing multiplier. Tooltip portals use `usePortalContainer()`; unused animation variants are removed.

Dependencies are limited to `react-aria-components`, `tailwind-merge`, and `@untitledui/icons`. The full upstream theme, application kit, Next.js integration, and global CSS are not imported.
