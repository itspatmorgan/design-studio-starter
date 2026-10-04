import type { ModuleSpec } from '../../core/modules/index.ts';

// Systems: the design systems prototypes are built with (/systems), in src/systems/.
export default {
  optional: false,
  lib: false,
  id: 'systems',
  label: 'Systems',
  version: '0.1.0',
  description: 'Foundations, components, context, rules, and skills for prototypes.',
  section: { key: 'systems', folder: 'src/systems', policy: 'open' },
} satisfies ModuleSpec;
