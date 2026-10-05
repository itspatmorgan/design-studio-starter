---
name: setup-design-system
description: "Import, replace, or adapt a studio design system and migrate its dependencies. Use document-component for one component."
---

## Scope and input

Read the [systems rule](../../rules/systems.md), [system contract](../../../../modules/systems/reference.md), and [module rule](../../rules/modules.md).

Inspect installed systems, configuration, `components.json`, packages, and all content using the current system. Include disabled module content.

Collect missing system ID, component source or package, tokens, and usage guidance. If only design files exist, inspect available material and report gaps.

Use supplied decisions. Do not present the placeholder's styles as the person's product system.

## Establish the kit

1. Adapt Product in place if the person chooses its components. Otherwise, preview `pnpm studio create-system` and apply authorized creation.
2. Import components or connect the package. Avoid unnecessary copies of package code.
3. Adapt aliases, dependencies, themes, and portals to the system contract. Place fonts, logos, and imagery using the [static asset convention](../../../../platform/core/assets.md).
4. Follow [document-component](../document-component/SKILL.md) for component pages and examples.
5. Create or reuse one representative prototype in the person's folder. Verify the kit there and on its Systems pages.

Add shadcn components only for demonstrated gaps. Verify the configured destination before running its CLI.

## Change the default and retire placeholders

Run `pnpm build` before switching the default. Preview `pnpm studio configure --system <id>`, then apply confirmed choices with `--yes`.

The command preserves existing system choices. Migrate retained prototypes by updating imports and metadata together.

If cleanup is authorized, inspect all Product dependencies before retirement. Include sample content and disabled modules.

Preserve recoverable copies when replacing content. Update shadcn destinations before removing Product. Preview removal and resolve dependencies instead of using `--force`.

Do not remove another person's work merely because a contributor joined. Explain proposed starter cleanup and obtain unresolved choices.

## Completion

Register the system in `studio.config.ts.systems`. Explicitly declare its role, styling contract, supported `colorModes`, documentation policy, and origin in `system.ts`; omitted choices fail validation. Declare the system's chosen theme token inventory, including choices matching upstream defaults. Omitted tokens and families stay unavailable; do not fill the upstream catalog. Adjust components and examples to the selected inventory, and check their utility use. Custom systems use their own scoped CSS vocabulary. Query names and thresholds must be declared; shared names currently require matching thresholds, while unique names or scoped CSS queries support system-specific thresholds.

Declare `['light']` or `['dark']` explicitly for a single-mode system. Scope dark tokens to `.<theme-class>[data-color-mode="dark"]`, and keep pop-ups within the system boundary. Verify that a single-mode system keeps its mode when Studio toggles.

Run `pnpm build` after migration. Review representative components, pop-ups, and supported color modes in the local app.

Report source provenance, adaptations, the default system, verified prototype URL, and missing input. Return that prototype to initialization for reuse.
