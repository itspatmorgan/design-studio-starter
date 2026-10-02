import type { ModuleSpec } from '../../core/modules/index.ts';

// The view file type: a .tsx or .jsx file is a React page in a prototype (src/platform/core/fileTypes.md).
export default {
  id: 'view',
  label: 'Views',
  version: '0.1.0',
  description: 'A .tsx or .jsx file in a prototype opens as a page.',
  optional: true,
} satisfies ModuleSpec;
