# Systems

Read the [system contract](../../platform/modules/systems/reference.md) when adding or changing a system, theme, component, or component page.

- Keep the platform system separate from prototype systems. Prototypes cannot import platform UI.
- Use the prototype's assigned system. Do not import another system or its documentation adapters into runtime code.
- Runtime system code may use its own system, shared utilities, packages, and enabled public module libraries.
- Declare supported `colorModes` in `system.ts`. Omission supports both modes. Declare `['light']` or `['dark']` explicitly for a single-mode system. Use the local `data-color-mode` boundary for mode-specific system CSS, not Studio's ancestor `.dark`.
- Scope theme selectors to the system's unique theme class or its descendants. Imported stylesheets follow the same constraint.
- Prefix keyframe names with the theme class and a dash. Font-face registration is permitted.
- Keep pop-ups inside the prototype's themed container. For starter Base UI portals, pass `usePortalContainer()` as `container`.
- Use the system's tokens and component APIs. Review affected behavior in both supported color modes.
- Obtain shared-change authorization through the [contributor scope rule](contributor-scope.md).

For system import or replacement, follow [setup-design-system](../skills/setup-design-system/SKILL.md).

For component import and documentation, follow [document-component](../skills/document-component/SKILL.md).
