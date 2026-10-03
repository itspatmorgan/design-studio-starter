import { defineFileType } from '../../core/fileTypes.ts';

export default defineFileType({
  label: 'Diagram',
  extensions: ['.mermaid', '.mmd'],
  language: 'text',
  preview: true,
  template: () => `flowchart LR
  accTitle: A new diagram
  accDescr: A starting point connects an idea to its next step.
  idea[Idea] --> next[Next step]
`,
});
