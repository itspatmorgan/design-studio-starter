---
name: setup-design-system
description: "Curate a studio design system for a prototype, or assess and import an existing React system with its theme and assets. Use document-component for one component."
---

## Scope and input

Read the [system authoring context](../../context/authoring.md), [system contract](../../README.md), and [manage-modules skill](../../../../platform/skills/manage-modules/SKILL.md).

Inspect installed systems, configuration, `components.json`, packages, and all content using the current system. Include disabled module content.

Establish whether the person wants to curate a toolkit or bring an existing React system. For curation, start with what they want to prototype. A designer may name components and visual choices. For a product manager, decompose the intended flow into screens, states, and the smallest supporting kit. For an existing system, start with its source, inventory, and dependencies. Do not require a prototype idea to audit it and propose an import plan. Ask only for decisions needed for the next step.

Collect missing system ID, component source or package, tokens, assets, and usage guidance. If only design files exist, inspect available material and report gaps.

Use supplied decisions. Do not present the placeholder's styles as the person's product system.

## Choose the path

- Keep the starter while exploring, adapt it, or create a separate system according to the person's choice. Sample removal is a separate decision.
- For a curated library kit, follow [Curate from libraries](references/curated-libraries.md). Use shadcn as the primary starting point and Untitled UI when it fits the intended work.
- For existing React code, follow [Assess an existing system](references/existing-react-system.md) before importing. An assessment request alone does not authorize migration.

Describe the proposed components, theme, assets, dependencies, and known gaps in plain language. Apply already-authorized choices. Ask about unresolved scope or fidelity compromises before dependent work.

Context and skills are separate curation decisions. Save supplied product knowledge; do not invent personas or product context to fill folders. Add a skill only for a demonstrated recurring task. Do not install a skills catalog during setup.

For an assessment-only request, finish with the evidence, import plan, adaptations, and unresolved questions. The plan can cover the whole reusable system in stages. Continue into implementation only when authorized. An assessment does not need a new system or prototype to be complete.

## Establish the kit

1. Adapt the chosen installed system in place if requested. Otherwise, preview `pnpm studio create-system` and apply authorized creation.
2. Import components or connect the package. Avoid unnecessary copies of package code.
3. Adapt aliases, dependencies, themes, and portals to the system contract. Place fonts, logos, and imagery using the [static asset convention](../../../../platform/context/assets.md).
4. Follow [document-component](../document-component/SKILL.md) for component pages and examples.
5. Create or reuse one representative prototype in the person's folder. Verify the kit there and on its Systems pages.

Add shadcn components only for demonstrated gaps. Verify the configured destination before running its CLI.

## Change the default and retire placeholders

Run `pnpm build` before switching the default. Preview `pnpm studio configure --system <id>`, then apply confirmed choices with `--yes`.

The command preserves existing system choices. Migrate retained prototypes by updating imports and metadata together.

If cleanup is authorized, inspect all dependencies of each system being retired, including Product or Marketing. Include sample content and disabled modules.

Preserve recoverable copies when replacing content. Use the [system lifecycle](../../README.md#system-lifecycle) to archive or permanently delete a retired system. Update shadcn destinations before deleting Product. Preview changes and resolve dependencies instead of using `--force`.

Do not remove another person's work merely because a contributor joined. Explain proposed starter cleanup and obtain unresolved choices.

## Completion

Register the system in `studio.config.ts.systems`. Explicitly declare its status, role, styling contract, supported `colorModes`, documentation policy, and origin in `system.ts`; omitted choices fail validation. Declare the system's chosen theme token inventory, including choices matching upstream defaults. Omitted tokens and families stay unavailable; do not fill the upstream catalog. Adjust components and examples to the selected inventory, and check their utility use. Custom systems use their own scoped CSS vocabulary. Query names and thresholds must be declared; shared names currently require matching thresholds, while unique names or scoped CSS queries support system-specific thresholds.

Declare `['light']` or `['dark']` explicitly for a single-mode system. Scope dark tokens to `.<theme-class>[data-color-mode="dark"]`, and keep pop-ups within the system boundary. Verify that a single-mode system keeps its mode when Studio toggles.

Run `pnpm build` after migration. Review representative components, pop-ups, and supported color modes in the local app.

Report source provenance, adaptations, the default system, verified prototype URL, and missing input. Return that prototype to initialization for reuse.

For imported product code, distinguish verified API, theme, and behavior fidelity from unresolved differences. A passing build alone does not establish equivalence with production.
