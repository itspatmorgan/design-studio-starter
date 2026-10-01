// Modules: the parts of Design Studio you can add or remove. A module is a folder in
// src/studio/modules/<id>/ with a module.ts that says what it is and what it adds, so the build,
// the dev server and the app all read one list instead of each knowing about every module.
// File types (src/studio/fileTypes/) are modules of their own kind and keep their own folders for now.
// This file has no imports, so Node scripts can load it directly.

export type ModuleSpec = {
  id: string;        // the folder's name
  label: string;     // "Tools"
  version: string;   // this module's own version, like "0.1.0"
  // The top-level area the module adds: its address in the app (/tools) and the folder its files live
  // in, relative to the repo root. The key can't also be a contributor's folder, since both are addresses.
  // `items` says the folder holds files the app opens as items, so each file type lists them (globs.ts):
  // "prototypes" for a folder of prototype-shaped folders, one per id (src/tools/<id>/), and "handbook"
  // for the Handbook's fixed shape. Leave it out when the module reads its own files.
  // `policy` says who may change the section's files from the app (src/studio/permissions.ts): "maintainers"
  // (the people listed in an item's meta.json) or "open" (anyone running the app; a pull request reviews
  // it). Without one, nobody can: the module's files are changed in the repo.
  section?: { key: string; folder: string; items?: 'prototypes' | 'handbook'; policy?: 'maintainers' | 'open' };
};

const ID = /^[a-z][a-z0-9-]*$/;
const VERSION = /^\d+\.\d+\.\d+$/;
const KEY = /^[a-z0-9][a-z0-9-]*$/;

// What is wrong with a module's declaration, each as a sentence that says what to fix. `folder` is the
// name of the folder it was found in.
export function moduleProblems(spec: unknown, folder: string): string[] {
  const where = `src/studio/modules/${folder}/module.ts`;
  if (!spec || typeof spec !== 'object') return [`${where} must export a module as its default.`];
  const m = spec as Partial<ModuleSpec>;
  const problems: string[] = [];
  if (m.id !== folder) problems.push(`${where}: id is "${m.id}", but it must match the folder name, "${folder}".`);
  else if (!ID.test(folder)) problems.push(`${where}: the id should be lowercase letters, numbers, and dashes, starting with a letter.`);
  if (typeof m.label !== 'string' || !m.label.trim()) problems.push(`${where}: add a label, the name people see.`);
  if (typeof m.version !== 'string' || !VERSION.test(m.version)) problems.push(`${where}: version should look like 0.1.0.`);
  if (m.section !== undefined) {
    const { key, folder: dir } = m.section as Partial<NonNullable<ModuleSpec['section']>>;
    if (typeof key !== 'string' || !KEY.test(key)) problems.push(`${where}: section.key should be lowercase letters, numbers, and dashes.`);
    if (typeof dir !== 'string' || !dir || dir.startsWith('/') || dir.split('/').includes('..')) problems.push(`${where}: section.folder should be a folder inside the repo, like src/tools.`);
    const policy = (m.section as { policy?: unknown }).policy;
    if (policy !== undefined && policy !== 'maintainers' && policy !== 'open') problems.push(`${where}: section.policy should be "maintainers" or "open", or left out.`);
    const items = (m.section as { items?: unknown }).items;
    if (items !== undefined && items !== 'prototypes' && items !== 'handbook') problems.push(`${where}: section.items should be "prototypes" or "handbook".`);
    else if (items !== undefined && !(typeof dir === 'string' && /^src\/[a-z0-9][a-z0-9-]*$/.test(dir))) problems.push(`${where}: a section with items keeps them in a folder directly under src/, like src/tools.`);
  }
  return problems;
}

// Problems across the whole list: two modules claiming the same section key or folder.
export function listProblems(specs: readonly ModuleSpec[]): string[] {
  const problems: string[] = [];
  const keys = new Map<string, string>();
  const dirs = new Map<string, string>();
  for (const m of specs) {
    if (!m.section) continue;
    const byKey = keys.get(m.section.key);
    if (byKey) problems.push(`The ${byKey} and ${m.id} modules both use the section key "${m.section.key}". Give one of them another.`);
    else keys.set(m.section.key, m.id);
    const byDir = dirs.get(m.section.folder);
    if (byDir) problems.push(`The ${byDir} and ${m.id} modules both keep their files in ${m.section.folder}. Give one of them another folder.`);
    else dirs.set(m.section.folder, m.id);
  }
  return problems;
}

// The section keys of a list of modules: addresses that no contributor's folder can use.
export const sectionKeys = (specs: readonly ModuleSpec[]): string[] =>
  specs.flatMap((m) => (m.section ? [m.section.key] : []));

// The folders (relative to the repo) of the modules whose sections hold items of this kind.
export const itemFolders = (specs: readonly ModuleSpec[], items: 'prototypes' | 'handbook'): string[] =>
  specs.flatMap((m) => (m.section?.items === items ? [m.section.folder] : []));
