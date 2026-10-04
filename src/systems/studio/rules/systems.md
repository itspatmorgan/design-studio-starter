# Systems

Read the [system contract](../../../modules/systems/reference.md) before adding or changing a system, theme, component, or component page. It owns declarations, runtime boundaries, theme inventories, color modes, and documentation adapters.

- Resolve the prototype's assigned system before changing its implementation. Follow the contract's [runtime boundaries](../../../modules/systems/reference.md#runtime-boundaries).
- Use the system's declared tokens and component APIs. Add foundations intentionally for the work rather than filling the upstream catalog. Follow the [foundations contract](../../../modules/systems/reference.md#foundations).
- Review components, pop-ups, and scoped styles in every supported color mode. Keep themed pop-ups inside their container as the contract requires.
- Place fonts, logos, and imagery according to the [static asset convention](../../../platform/core/assets.md).
- Use supported studio commands for system registration and configuration. Follow the [modules rule](modules.md).
- Obtain shared-change authorization through the [contributor scope rule](contributor-scope.md).

For system import or replacement, follow [setup-design-system](../skills/setup-design-system/SKILL.md).

For component import and documentation, follow [document-component](../skills/document-component/SKILL.md).
