import { defineFileType } from '../../platform/core/fileTypes.ts';

export default defineFileType({
  preview: true,
  inPrototype: true,
  inSystemContent: false,
  fallback: false,
  label: 'Diagram',
  extensions: ['.mermaid', '.mmd'],
  language: 'mermaid',
  template: () => `flowchart LR
  accTitle: A new diagram
  accDescr: A starting point connects an idea to its next step.
  idea[Idea] --> next[Next step]
`,
});
