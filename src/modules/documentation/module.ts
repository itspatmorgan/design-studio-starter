import type { ModuleSpec } from '../../platform/core/api.ts';

// Documentation: Manual chapters about Design Studio (/documentation/manual), pages in src/modules/documentation/pages/.
export default {
  lib: false,
  id: 'documentation',
  label: 'Documentation',
  version: '0.1.0',
  description: 'Documentation: a human Manual alongside the shared Context and Skills browser.',
  optional: true,
  instructions: [{ path: 'skills/write-manual/', when: 'asks to add or change the human Manual' }],
  section: { key: 'documentation', folder: 'src/modules/documentation/pages' },
} satisfies ModuleSpec;
