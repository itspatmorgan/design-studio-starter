import type { SystemSpec } from '../../platform/modules/systems/spec.ts';

// The placeholder design system the kit ships with. Replace it with your product's, or add yours next to it
// (pnpm studio create-system). A prototype picks one with "system" in its meta.json; without it, the one named by
// defaultSystem in studio.config.ts, else the first by name.
export default {
  label: 'Product',
  themeClass: 'product-theme',
  colorModes: ['light', 'dark'],
  docs: 'warn',
  origin: 'shadcn',
} satisfies SystemSpec;
