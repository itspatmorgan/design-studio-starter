import type { ModuleSpec } from '../index.ts';

// The Guide: how to use Design Studio itself (/guide), pages in src/studio/modules/guide/pages/.
export default {
  id: 'guide',
  label: 'Guide',
  version: '0.1.0',
  description: 'The Guide: how to use Design Studio, for the people who use it.',
  optional: true,
  handbook: [{ path: 'rules/guide.md', when: 'asks to add or change a Guide page' }],
  section: { key: 'guide', folder: 'src/studio/modules/guide/pages' },
} satisfies ModuleSpec;
