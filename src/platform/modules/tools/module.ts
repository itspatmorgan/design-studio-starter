import type { ModuleSpec } from '../../core/modules/index.ts';

// Tools: prototypes the team has published (/tools), in src/tools/. Who may change one is its
// meta.json "maintainers" (src/platform/core/permissions.ts).
export default {
  id: 'tools',
  label: 'Tools',
  version: '0.1.0',
  description: 'Prototypes the team has published as small apps, kept by their maintainers.',
  optional: true,
  handbook: [{ path: 'rules/tools.md', when: 'wants to build a tool (a prototype the team uses as an app), or publish a prototype as one' }],
  section: { key: 'tools', folder: 'src/tools', items: 'prototypes', policy: 'maintainers', standalone: true },
} satisfies ModuleSpec;
