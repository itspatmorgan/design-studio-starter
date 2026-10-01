import type { ModuleSpec } from '../index.ts';

// Systems: the design systems prototypes are built with (/systems), in src/systems/.
export default {
  id: 'systems',
  label: 'Systems',
  version: '0.1.0',
  description: 'The design systems prototypes build with.',
  section: { key: 'systems', folder: 'src/systems', policy: 'open' },
} satisfies ModuleSpec;
