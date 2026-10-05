# Systems

Read the [system contract](../README.md) before adding or changing a system, theme, component, or component page. It owns declarations, runtime boundaries, theme inventories, color modes, and documentation adapters.

- Resolve the prototype's assigned system before changing its implementation. Follow the contract's [runtime boundaries](../README.md#runtime-boundaries).
- Use **Theme** for the system’s visual styling section and **theme tokens** for its inventory. Match this terminology in UI copy, documentation, and agent instructions.
- Use the system's declared tokens and component APIs. Add theme tokens intentionally for the work rather than filling the upstream catalog. Follow the [theme contract](../README.md#theme).
- Review components, pop-ups, and scoped styles in every supported color mode. Keep themed pop-ups inside their container as the contract requires.
- Place fonts, logos, and imagery according to the [static asset convention](../../../platform/core/assets.md).
- Use supported studio commands for system registration and configuration. Follow the [modules rule](../../../platform/skills/manage-modules/SKILL.md).
- Obtain shared-change authorization through the [contributor scope](../../../platform/context/contributor-scope.md).

For system import or replacement, follow [setup-design-system](../skills/setup-design-system/SKILL.md).

For component import and documentation, follow [document-component](../skills/document-component/SKILL.md).
