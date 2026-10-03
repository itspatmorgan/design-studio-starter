import type { SystemSpec } from '../../platform/modules/systems/spec.ts';

// __LABEL__: a design system prototypes can build with. A prototype picks it with "system": "__ID__" in its meta.json.
export default {
  label: '__LABEL__',
  themeClass: '__ID__-theme',
  colorModes: ['light'],
  docs: 'warn',
} satisfies SystemSpec;
