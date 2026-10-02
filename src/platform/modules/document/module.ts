import type { ModuleSpec } from '../../core/modules/index.ts';

// The document file type: a .md file is a written page in a prototype (src/platform/core/fileTypes.md).
export default {
  id: 'document',
  label: 'Documents',
  version: '0.1.0',
  description: 'A .md file in a prototype opens as a written page.',
  optional: true,
} satisfies ModuleSpec;
