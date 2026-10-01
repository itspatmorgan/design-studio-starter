// Where an item's files live, and where it opens. A prototype is src/prototypes/<contributor>/<id>/, at
// /prototypes/<contributor>/<id>. The Handbook (src/handbook/) is shown the same way, one section at a time,
// under the reserved key "handbook": /handbook/docs is src/handbook/docs/. Nobody is the
// "handbook" contributor, so the app never offers to change a section as if it were someone's
// prototype: these are platform files, changed in the repo and reviewed.
// This file has no imports, so Node scripts can load it directly.

export const HANDBOOK_KEY = 'handbook';

// A prototype system's components (src/systems/<id>/components/) are opened for editing the same
// way: under the reserved key "systems" (already an app page URL, so nobody's folder), with the
// system's id as the prototype ("studio" is the app's own, in src/platform/components/). Platform
// files too: changed in the repo and reviewed.
export const SYSTEMS_KEY = 'systems';

// A module can hold prototype-shaped folders of its own, one per id (a tool is src/tools/<id>/): its section
// key stands where a contributor's would, so a tool opens at /tools/<id>. The app and the build register the
// keys from the module list at startup (src/platform/core/modules/index.ts), and rootOf reads them.
let sectionKeys: ReadonlySet<string> = new Set();
export const setSections = (keys: Iterable<string>) => { sectionKeys = new Set(keys); };

// The Handbook's sections: the folders in src/handbook/, in the order they're shown. The shape of
// each is checked by src/platform/modules/handbook/node/handbook-check.js.
export const HANDBOOK_SECTIONS = {
  docs: { title: 'Docs', description: 'Context for people and agents: principles, personas, and anything worth writing down once.' },
  rules: { title: 'Rules', description: 'What your agent knows and follows every session. AGENTS.md points here.' },
  skills: { title: 'Skills', description: 'Procedures your agent follows when you ask, one folder each, in the Agent Skills format.' },
} as const;

export const isHandbookSection = (id: string): id is keyof typeof HANDBOOK_SECTIONS =>
  Object.prototype.hasOwnProperty.call(HANDBOOK_SECTIONS, id);

// The key of the section that holds everyone's prototypes (the Prototypes module): /prototypes.
export const PROTOTYPES_KEY = 'prototypes';

// Whether a key names a section (tools, handbook, systems) rather than a person. The first part of an item's
// address is a section's key, or, for a prototype, "prototypes" and then the person's.
export const isSectionKey = (key: string) => key === HANDBOOK_KEY || key === SYSTEMS_KEY || sectionKeys.has(key);

// An item's address in the app, up to its id and without a base path: "/prototypes/patrick/hello-world"
// for a prototype, "/tools/quote-card" for a tool.
export const addressOf = (contributor: string, id: string) =>
  isSectionKey(contributor) ? `/${contributor}/${id}` : `/${PROTOTYPES_KEY}/${contributor}/${id}`;

// Reads an item's address back: who or what holds it, its id, and the path after it. It also reads the
// older form of a prototype's address, "/patrick/hello-world/…", so links saved before prototypes moved
// under /prototypes still open. Null if there isn't an id.
export function parseAddress(path: string): { contributor: string; id: string; rest: string[] } | null {
  const parts = path.split('/').filter(Boolean);
  const body = parts[0] === PROTOTYPES_KEY ? parts.slice(1) : parts;
  return body.length >= 2 ? { contributor: body[0], id: body[1], rest: body.slice(2) } : null;
}

// An item path in today's form: the older "/patrick/hello-world/lofi/main" becomes "/prototypes/patrick/hello-world/lofi/main".
// Paths already in today's form, and anything that isn't an item's address, come back unchanged.
export function canonicalPath(path: string): string {
  const address = parseAddress(path);
  return address ? [addressOf(address.contributor, address.id), ...address.rest].join('/') : path;
}

// The folder holding an item's files, relative to src/.
export const rootOf = (contributor: string, id: string) =>
  contributor === HANDBOOK_KEY ? `${HANDBOOK_KEY}/${id}`
    : sectionKeys.has(contributor) ? `${contributor}/${id}`
    : contributor === SYSTEMS_KEY ? (id === 'studio' ? 'platform/components' : `${SYSTEMS_KEY}/${id}/components`)
    : `prototypes/${contributor}/${id}`;
