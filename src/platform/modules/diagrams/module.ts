import type { ModuleSpec } from '../../core/modules/index.ts';

export default {
  lib: false,
  id: 'diagrams',
  label: 'Diagrams',
  version: '0.1.0',
  description: 'Mermaid source files open as diagrams alongside prototype views and documents.',
  optional: true,
  instructions: [{ path: 'rules/diagrams.md', when: 'asks to add or change a standalone diagram in a prototype' }],
} satisfies ModuleSpec;
