import type { ModuleSpec } from '../index.ts';

// Tools: prototypes the team has published (/tools), in src/tools/. Who may change one is its
// meta.json "maintainers" (src/studio/tools.ts).
export default {
  id: 'tools',
  label: 'Tools',
  version: '0.1.0',
  section: { key: 'tools', folder: 'src/tools' },
} satisfies ModuleSpec;
