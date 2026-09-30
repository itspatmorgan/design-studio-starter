// Where an item's files live on disk, relative to src/. A prototype is src/prototypes/<contributor>/<id>/.
// The Handbook (src/handbook/) is shown like prototypes, one per section, under the reserved key
// "handbook": /handbook/docs is src/handbook/docs/. Nobody is the "handbook" contributor, so the app
// never offers to change anything there: those are platform files, maintained in the repo.
// This file has no imports, so Node scripts can load it directly.

export const HANDBOOK_KEY = 'handbook';

// The Handbook's sections: the folders in src/handbook/.
export const HANDBOOK_SECTIONS = {
  docs: { title: 'Docs', description: "Your team's context: what good design means here, and who it's for." },
  rules: { title: 'Rules', description: 'What your agent knows and follows every session.' },
  skills: { title: 'Skills', description: 'Procedures your agent follows when you ask.' },
} as const;

export const isHandbookSection = (id: string): id is keyof typeof HANDBOOK_SECTIONS =>
  Object.prototype.hasOwnProperty.call(HANDBOOK_SECTIONS, id);

export const rootOf = (contributor: string, id: string) =>
  contributor === HANDBOOK_KEY ? `${HANDBOOK_KEY}/${id}` : `prototypes/${contributor}/${id}`;
