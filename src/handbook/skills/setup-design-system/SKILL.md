---
name: setup-design-system
description: "Establish or replace a studio's prototype design system with the user's components and tokens, set its default, document it and retire placeholder dependencies. Use during studio initialization or when importing/replacing a kit; use document-component for an individual component page."
---

Read [systems.md](../../rules/systems.md) and [modules.md](../../rules/modules.md). Inspect installed systems, `studio.config.ts`, `components.json`, package dependencies, and content using the current system, including disabled module folders. The agent performs imports, adaptation, documentation and checks; the person provides source material and design decisions.

Ask only for missing essentials: system name/id, component source or package, tokens/theme assets, and the first prototype's needed components. If the user has only a Figma file or written design guidance, use available tools to inspect it and explain any gaps. Do not present the placeholder's styles as their product design. If they want to start with the kit's components, adapt Product in place rather than requiring a second system.

For a separate system, preview `pnpm studio create-system <id> --label "…"`, then apply with `--yes` within existing authorization. Import the user's kit into its folder, adapt aliases and required dependencies, scope the theme, and check light/dark mode and portals. Package-backed systems are supported; document their public components without copying the package unnecessarily. Add ShadCN components only for demonstrated gaps with the person's chosen system/library conventions; the ShadCN CLI's default target is Product, so verify `components.json` and the destination before running it.

Use [document-component](../document-component/SKILL.md) for component pages and live examples. Inspect `/systems/<id>` with the person when that helps them verify the results. Create a representative prototype in their own folder and verify its components, theme and pop-ups. Run `pnpm build` before switching the default with `pnpm studio configure --system <id> --yes`.

Switching the default changes prototypes whose metadata omits `system`; pin retained prototypes to their prior system before switching if they should keep it. Keep explicit-system prototypes intact. Identify imports and metadata referring to Product across all source content, including disabled Tools. With authorized cleanup, migrate or remove starter examples and update `components.json` aliases/theme destination before retiring Product. Use `pnpm studio remove product` to inspect dependencies; do not use `--force` to hide unresolved ones. Disabled code must remain usable if re-enabled later.

Run module checks, type checks and the full build after migration. Reopen the first prototype and system pages. Report which components/tokens came from the user, any adaptations, and any unresolved inputs. Missing brand/context material is a pending task, not a reason to fabricate a finished kit.
