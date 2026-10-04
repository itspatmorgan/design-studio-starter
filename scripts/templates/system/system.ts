import type { SystemSpec } from '../../modules/systems/spec.ts';

// __LABEL__: a design system prototypes can build with. A prototype picks it with "system": "__ID__" in its meta.json.
export default {
  role: 'prototype',
  label: '__LABEL__',
  themeClass: '__ID__-theme',
  styling: 'tailwind',
  colorModes: ['light', 'dark'],
  docs: 'warn',
  origin: null,
} satisfies SystemSpec;
