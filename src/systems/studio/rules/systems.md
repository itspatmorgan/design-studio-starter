# Systems

Read the [system contract](../../../modules/systems/reference.md) when adding or changing a system, theme, component, or component page.

- Keep the Studio system separate from prototype systems. Prototypes cannot import platform UI.
- Use the prototype's assigned system. Do not import another system or its documentation adapters into runtime code.
- Place fonts, logos, and imagery according to the [static asset convention](../../../platform/core/assets.md).
- Runtime system code may use its own system, shared utilities, packages, and enabled public module libraries.
- Register every installed system in `studio.config.ts.systems`. Declare its role, styling contract (`tailwind` or `custom`), documentation policy, and origin (`null` when no upstream documentation integration applies).
- Declare supported `colorModes` in `system.ts`. Omission fails validation; scaffolds explicitly declare both modes. Declare `['light']` or `['dark']` explicitly for a single-mode system. Use the local `data-color-mode` boundary for mode-specific system CSS, not Studio's ancestor `.dark`.
- Scope theme selectors to the system's unique theme class or its descendants. Imported stylesheets follow the same constraint.
- Prefix keyframe names with the theme class and a dash. Font-face registration is permitted.
- Keep pop-ups inside the prototype's themed container. For starter Base UI portals, pass `usePortalContainer()` as `container`.
- Declare only the foundations the system provides, even when matching upstream defaults. Omission intentionally excludes a token or family. Keep the inventory on the system's unconditional theme boundary, and reference only declared tokens. Studio and prototype systems follow the same convention. Custom systems own their scoped CSS vocabulary.
- Declare finite spacing steps instead of an unrestricted multiplier when the system has a curated scale. Add tokens intentionally rather than filling the entire upstream catalog.
- Declare query variants explicitly. Systems sharing breakpoint/container names must currently agree on compiled thresholds; use unique names or scoped CSS queries for different thresholds. Runtime variables cannot change compiled query conditions.
- Use the system's tokens and component APIs. Review affected behavior in both supported color modes.
- Obtain shared-change authorization through the [contributor scope rule](contributor-scope.md).

For system import or replacement, follow [setup-design-system](../skills/setup-design-system/SKILL.md).

For component import and documentation, follow [document-component](../skills/document-component/SKILL.md).
