import type { ModuleSpec } from '../../core/modules/index.ts';

// Documentation: Guide chapters about Design Studio (/documentation/guide), pages in src/platform/modules/documentation/pages/ and in the READMEs of modules and file types.
export default {
  lib: false,
  id: 'documentation',
  label: 'Documentation',
  version: '0.1.0',
  description: 'Documentation: a curated Guide and complete platform Reference.',
  optional: true,
  instructions: [{ path: 'rules/documentation.md', when: 'asks to add or change platform documentation' }],
  section: { key: 'documentation', folder: 'src/platform/modules/documentation/pages' },
} satisfies ModuleSpec;
