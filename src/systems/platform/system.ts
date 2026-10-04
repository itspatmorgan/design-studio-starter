import type { SystemSpec } from '../../platform/modules/systems/spec.ts';

// Studio's supplied toolkit and operating guidance. Prototype systems remain independent.
export default {
  label: 'Platform',
  role: 'platform',
  themeClass: 'platform-theme',
  colorModes: ['light', 'dark'],
  docs: 'off',
  origin: 'shadcn',
} satisfies SystemSpec;
