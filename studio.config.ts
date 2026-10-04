// What nearly every team changes. Everything else is code: you own the whole repo.
// Installed capabilities and system registration are explicit. Run `pnpm check` to validate them.
import type { StudioConfig } from './src/platform/core/config.ts';

export default {
  name: 'Design Studio',
  usage: 'team',
  tagline: 'Prototypes and design systems for our team.',
  modules: {
    canvas: true,
    diagrams: true,
    document: true,
    documentation: true,
    prototypes: true,
    systems: true,
    text: true,
    view: true,
  },
  systems: ['studio', 'product', 'marketing'],
  defaultSystem: 'product',   // the design system a prototype uses when its meta.json doesn't name one
} satisfies StudioConfig;
