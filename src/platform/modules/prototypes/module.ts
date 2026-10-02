import type { ModuleSpec } from '../../core/modules/index.ts';

// Prototypes: the team's work, in src/prototypes/<person>/<id>/, at /prototypes. A prototype is a folder of files
// (views, documents, canvases, text) that opens in the viewer; each belongs to the person whose folder it is in.
// Required: the viewer here is also how a tool or a Handbook section opens.
export default {
  id: 'prototypes',
  label: 'Prototypes',
  version: '0.1.0',
  description: 'What your team is designing, one folder each: screens, notes and canvases.',
  section: { key: 'prototypes', folder: 'src/prototypes', items: 'prototypes', byPerson: true },
} satisfies ModuleSpec;
