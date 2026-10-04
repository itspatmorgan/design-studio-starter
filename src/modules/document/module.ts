import type { ModuleSpec } from '../../platform/core/api.ts';

// The document file type: a .md file is a written page in a prototype (src/platform/core/fileTypes.md).
export default {
  lib: false,
  id: 'document',
  label: 'Documents',
  version: '0.1.0',
  description: 'A .md file in a prototype opens as a written page.',
  optional: true,
  instructions: [{ path: 'rules/documents.md', when: 'asks for a document (written context in a prototype)' }],
} satisfies ModuleSpec;
