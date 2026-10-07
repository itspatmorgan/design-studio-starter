// Start personal. Switch to team use in Studio settings when you are ready to collaborate.
// Installed capabilities and system registration are explicit. Run `pnpm check` to validate them.
import type { StudioConfig } from './src/platform/core/config.ts';

export default {
  name: 'Design Studio',
  usage: 'personal',
  tagline: 'Your ideas, made tangible.',
  modules: {
    canvas: true,
    diagrams: true,
    document: true,
    documentation: true,
    prototypes: true,
    systems: true,
    text: true,
    view: true,
    onboarding: true,
    contributors: false,
  },
  systems: ['studio', 'product', 'marketing'],
  systemMaintainers: { product: [], marketing: [] },
  defaultSystem: 'product',   // the design system a prototype uses when its meta.json doesn't name one
  admins: ["patrick"],
} satisfies StudioConfig;
