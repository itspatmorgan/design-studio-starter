import type { ModuleSpec } from '../../platform/core/api.ts';

// Documentation: Guide chapters about Design Studio (/documentation/guide), pages in src/modules/documentation/pages/.
export default {
  lib: false,
  id: 'documentation',
  label: 'Documentation',
  version: '0.1.0',
  description: 'Documentation: a curated Guide and complete platform Reference.',
  optional: true,
  instructions: [{ path: 'skills/write-guide/', when: 'asks to add or change the human Guide' }],
  section: { key: 'documentation', folder: 'src/modules/documentation/pages' },
} satisfies ModuleSpec;
