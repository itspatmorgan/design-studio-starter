---
name: check-system-adherence
description: "Audit a Design Studio surface for adherence to its applicable design system: Studio UI, prototype views, or system components and previews. Use for an explicit system-adherence review, not general UX critique or system installation."
---

# Check System Adherence

Review the requested surface against its actual system, combining source checks with rendered evidence. Default to reporting findings. Change implementation only when fixes are requested or already authorized.

## Resolve the surface

Start with the supplied URL, screenshot, file, module, or prototype. Trace it to its implementation. If the target cannot be identified from the request and current context, ask for the surface to review.

Read the [system contract](../../../modules/systems/README.md) and [authoring context](../../../modules/systems/context/authoring.md). Resolve registration and declarations from `studio.config.ts` and each relevant `system.ts`; do not assume the platform system's folder is named `studio`.

| Surface | Applicable system |
| --- | --- |
| Application shell, module interface, navigation, source editors, and shared knowledge readers | The registered system declaring `role: 'platform'`. |
| Prototype views, including views embedded in documents or canvases | The prototype's resolved assignment. Explicit `system: null` means no system; only omission uses `defaultSystem`. |
| System runtime components, live examples, and Theme or Component previews | The owning or previewed system. Surrounding application navigation and shared readers retain the platform system. |
| Documents, diagrams, and canvas controls | Studio's application presentation, as defined by the owning module; embedded views keep their own assignment. |

Map separately themed regions on a mixed surface. A selected system in the browser does not reassign a prototype. Pending `rebuild` identifies a migration target, not the current runtime assignment; report migration gaps separately.

For an explicit no-system prototype, review local styling and platform boundaries without imposing a registered system. For missing or invalid assignments, report the resolution failure rather than guessing. For an unavailable module, review its source only if requested and label it unavailable in the running app.

## Read the applicable guidance

Read the resolved system's `README.md`, `AGENTS.md`, theme, relevant component APIs, and context covering the reviewed work. Read the owning module's README for presentation or embedding behavior. For platform conventions such as icons, consult [Technology stack](../../context/stack.md).

Use the resolved system's guidance rather than applying starter conventions to every system. Distinguish explicit requirements, supplied defaults, and recommendations. If guidance and implementation disagree, report the conflict and identify the authoritative source.

## Inspect source and run checks

- Check component imports, supported props and variants, composition, and local replacements that duplicate an available component without a task-specific reason.
- Check colors, typography, spacing, radii, shadows, icons, and assets against the system's declared choices. Inspect inline styles, SVGs, local CSS, and dynamically constructed classes as well as literal utilities.
- Check theme boundaries, mode resolution, and portal containers. Look for global selectors or inherited styles that can leak between systems.
- Review relevant copy and interaction conventions. Keep general UX suggestions separate from demonstrated system violations.

Run `pnpm check` from the target checkout and save output to a temporary log. It checks registered systems, recognized literal theme utilities, CSS constraints, and runtime dependency boundaries. Attribute diagnostics to the requested surface; distinguish unrelated repository failures.

Do not claim this command proves visual adherence. Dynamic classes, arbitrary values, inline SVG styles, component choice, icons, and writing still need review. An arbitrary value or custom illustration is not automatically a violation: assess its purpose and the system's guidance. Systems declaring custom styling need their own conventions, not Tailwind token requirements.

Reuse existing validators rather than creating a second token inventory or a blanket ban on custom components. Do not add tokens, switch assignments, replace a toolkit, or weaken checks merely to make an audit pass.

## Inspect the rendered result

When a runnable surface and browser tools are available, capture its initial state before assessing visual adherence. Compare the result with the actual system components and theme, not memory of an upstream library.

Exercise relevant controls, focus states, and pop-ups. Review every declared color mode and relevant responsive layouts when available and within authorized testing scope. Pay particular attention to nested system boundaries and pop-ups that can lose their theme. Follow platform working context for any edits and their required checks.

If a state, mode, or viewport cannot be tested, name it as unverified. Source inspection is useful evidence, but does not establish rendered contrast, layout, keyboard behavior, or native host behavior. Do not silently alter the person's saved preferences to complete testing.

## Report and finish

Explain the result in plain language. Include:

- Reviewed surface and resolved system for each region, with the assignment or declaration used.
- Concrete findings ordered by impact, each with a file or rendered-state location, the relevant convention, and a recommended correction.
- Automated results and log location, visual states inspected, and unverified coverage.

Separate confirmed violations from consistency suggestions and missing system guidance. A clean result means no deviations found within the stated coverage, not certification of the entire studio. If fixes were authorized, preserve existing work, verify the corrected result, and follow [Working in Studio](../../context/working-in-studio.md) before committing.
