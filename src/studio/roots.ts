// Where an item's files live. A prototype is src/prototypes/<contributor>/<id>/, at
// /<contributor>/<id>. The Handbook (src/handbook/) is shown the same way, one section at a time,
// under the reserved key "handbook": /handbook/docs is src/handbook/docs/. Nobody is the
// "handbook" contributor, so the app never offers to change a section as if it were someone's
// prototype: these are platform files, changed in the repo and reviewed.
// This file has no imports, so Node scripts can load it directly.

export const HANDBOOK_KEY = 'handbook';

// A prototype system's components (src/systems/<id>/components/) are opened for editing the same
// way: under the reserved key "systems" (already an app page URL, so nobody's folder), with the
// system's id as the prototype ("studio" is the app's own, in src/studio/components/). Platform
// files too: changed in the repo and reviewed.
export const SYSTEMS_KEY = 'systems';

// A module can hold prototype-shaped folders of its own, one per id (a tool is src/tools/<id>/): its section
// key stands where a contributor's would, so a tool opens at /tools/<id>. The app and the build register the
// keys from the module list at startup (src/studio/modules/index.ts), and rootOf reads them.
let sectionKeys: ReadonlySet<string> = new Set();
export const setSections = (keys: Iterable<string>) => { sectionKeys = new Set(keys); };

// The Handbook's sections: the folders in src/handbook/, in the order they're shown. The shape of
// each is checked by scripts/lib/handbook-check.js.
export const HANDBOOK_SECTIONS = {
  docs: { title: 'Docs', description: 'Context for people and agents: principles, personas, and anything worth writing down once.' },
  rules: { title: 'Rules', description: 'What your agent knows and follows every session. AGENTS.md points here.' },
  skills: { title: 'Skills', description: 'Procedures your agent follows when you ask, one folder each, in the Agent Skills format.' },
} as const;

export const isHandbookSection = (id: string): id is keyof typeof HANDBOOK_SECTIONS =>
  Object.prototype.hasOwnProperty.call(HANDBOOK_SECTIONS, id);

// The folder holding an item's files, relative to src/.
export const rootOf = (contributor: string, id: string) =>
  contributor === HANDBOOK_KEY ? `${HANDBOOK_KEY}/${id}`
    : sectionKeys.has(contributor) ? `${contributor}/${id}`
    : contributor === SYSTEMS_KEY ? (id === 'studio' ? 'studio/components' : `${SYSTEMS_KEY}/${id}/components`)
    : `prototypes/${contributor}/${id}`;
