import type { SystemSpec } from '../../studio/systems.ts';

// __LABEL__: a design system prototypes can build with. A prototype picks it with "system": "__ID__" in its meta.json.
export default {
  label: '__LABEL__',
  themeClass: '__ID__-theme',
  docs: 'warn',
} satisfies SystemSpec;
