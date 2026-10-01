import type { ModuleSpec } from '../../core/modules/index.ts';

// __LABEL__. This file says what the module is, and what it adds. See src/studio/modules/README.md for everything
// it can say: a section (an address and a folder), a lib prototypes can import, handbook files, npm dependencies.
export default {
  id: '__ID__',
  label: '__LABEL__',
  version: '0.1.0',
  description: 'Say what __LABEL__ adds, in one sentence.',
  optional: true,
  section: { key: '__ID__' },
  handbook: [{ path: 'rules/__ID__.md', when: 'asks about __LABEL__' }],
} satisfies ModuleSpec;
