// The design systems prototypes build with. The studio system (src/studio/) is the app's
// own UI and isn't listed here: prototypes never use it.
//
// Each system has a folder in src/systems/ (components/ and styles/theme.css), a theme scoped under
// its class, and a spec for its Systems page (src/studio/app/pages/systems/). A prototype
// picks one with "system" in its meta.json; without it, it uses the first one listed.
// "docs" is how the build treats a component without examples or a description (see
// src/studio/systemDocs.ts): 'warn' says so, 'strict' fails the build.
// To add a system, see src/handbook/rules/systems.md.
export const PROTOTYPE_SYSTEMS = {
  product: { label: 'Product', dir: 'src/systems/product/', themeClass: 'product-theme', docs: 'warn' },
} as const;

export type PrototypeSystemId = keyof typeof PROTOTYPE_SYSTEMS;
export const DEFAULT_SYSTEM = Object.keys(PROTOTYPE_SYSTEMS)[0] as PrototypeSystemId;
