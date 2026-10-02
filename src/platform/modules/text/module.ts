import type { ModuleSpec } from '../../core/modules/index.ts';

// The text file type: the Handbook's fallback, any other text file opens read-only (src/platform/core/fileTypes.md).
export default {
  id: 'text',
  label: 'Text files',
  version: '0.1.0',
  description: 'Any other text file in the Handbook opens read-only as its text.',
  optional: true,
} satisfies ModuleSpec;
