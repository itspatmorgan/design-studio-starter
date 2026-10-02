import { canonicalDirectory } from '../../lib/safe-paths.js';
// Where a prototype's files are, and reading them: the folders, the file tree, one item's file.
// Part of the dev server's file layer (scripts/build/vite-files-plugin.js).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FILE_TYPES, fileTypeOf, handbookTypeOf, isTextFile } from '../../lib/file-types.js';
import { isHelper } from '../../../src/platform/core/fileTypes.ts';
import { byOrder, parseOrder } from '../../../src/platform/core/order.ts';
import { HANDBOOK_KEY, SYSTEMS_KEY, isHandbookSection } from '../../../src/platform/core/roots.ts';
import { PROTOTYPE_SECTIONS } from '../../lib/modules.js';
import { SYSTEM_SOURCES } from '../../../src/platform/modules/systems/node/systems.js';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const PROTOS = path.join(ROOT, 'src', 'prototypes');
export const HANDBOOK = path.join(ROOT, 'src', 'handbook');
// Each system's components folder, to tell which system a file belongs to.
export const COMPONENT_DIRS = Object.entries(SYSTEM_SOURCES).map(([id, s]) => [id, path.join(ROOT, s.components) + path.sep]);
export const systemOf = (file) => COMPONENT_DIRS.find(([, dir]) => file.startsWith(dir));
export const NAME = /^[a-z0-9][a-z0-9._-]*$/i;
export const TRASH = path.join(ROOT, '.trash');
export const BATCH_MS = 50;
export const MAX_SOURCE_BYTES = 750 * 1024; // the same limit as any committed file (check-asset-size.js)

// A prototype's folder, or null if the contributor or prototype name isn't valid. The Handbook
// sections (src/handbook/docs, rules, skills) are found here too, by their fixed names, to read.
export const safeScope = (dir) => {
  if (!dir || !canonicalDirectory(dir, ROOT)) return null;
  const meta = path.join(dir, 'meta.json');
  try {
    const stat = fs.lstatSync(meta);
    if (stat.isSymbolicLink() || !stat.isFile()) return null;
  } catch (error) { if (error.code !== 'ENOENT') return null; }
  return dir;
};

export function prototypeDir(contributor, prototype) {
  // A system's components (its own list, systemSources.ts): only the systems listed there.
  if (contributor === SYSTEMS_KEY) {
    const dir = typeof prototype === 'string' && Object.hasOwn(SYSTEM_SOURCES, prototype) ? path.join(ROOT, SYSTEM_SOURCES[prototype].components) : null;
    return safeScope(dir);
  }
  // An item of a module's section of prototype-shaped folders (a section item, src/examples/<id>/): found by its folder name.
  const section = PROTOTYPE_SECTIONS.find((s) => s.key === contributor);
  if (section) {
    if (!NAME.test(prototype ?? '')) return null;
    const dir = path.join(section.dir, prototype);
    return safeScope(dir);
  }
  if (contributor === HANDBOOK_KEY) return isHandbookSection(prototype) ? safeScope(path.join(HANDBOOK, prototype)) : null;
  if (!NAME.test(contributor ?? '') || !NAME.test(prototype ?? '')) return null;
  const dir = path.join(PROTOS, contributor, prototype);
  return safeScope(dir);
}

// A path inside a prototype's folder, resolved for real (so links can't point outside), or null.
export function resolveInside(dir, rel) {
  if (!safeScope(dir) || typeof rel !== 'string' || rel.includes('\0')) return null;
  const target = path.resolve(dir, rel);
  if (target !== dir && !target.startsWith(dir + path.sep)) return null;
  try {
    const real = fs.realpathSync(target);
    const realDir = fs.realpathSync(dir);
    return real === realDir || real.startsWith(realDir + path.sep) ? real : null;
  } catch { return null; }
}

// A prototype's meta.json "order" (src/platform/core/order.ts), or none. The Handbook and system folders have no meta.json.
export function readOrder(dir) {
  try { return parseOrder(JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')).order) ?? []; } catch { return []; }
}

// Files and folders in the prototype's order: files first, then folders, each alphabetical, unless
// meta.json says otherwise. Hidden files are skipped.
export function readTree(dir, base = '', order = readOrder(dir)) {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => !e.name.startsWith('.'));
  return byOrder(entries.filter((e) => e.isFile() || e.isDirectory()).map((e) => ({ name: e.name, path: base + e.name, dir: e.isDirectory() })), order)
    .map((e) => (e.dir ? { ...e, children: readTree(path.join(dir, e.name), `${e.path}/`, order) } : e));
}


// A file or folder name you can create or rename to: no slashes, not hidden, not "." or "..".
export const validName = (name) => typeof name === 'string' && /^[^/\\\0]+$/.test(name) && !name.startsWith('.') && name.trim() === name;

// An item's name in meta.json "start" and URLs: its path without the extension ("lofi/main").
export const viewKey = (rel) => rel.replace(/\.[^./]+$/, '');

// An existing item file (a view or document, not a helper: a name starting with an underscore) in the prototype,
// as its real path, or null. The Source view reads and saves only these: never meta.json,
// hidden files, or anything outside the prototype. In the Handbook, a file is an item if it opens
// as a document or as text, and its folders can be named anything but hidden.
export function itemFile(dir, rel, contributor) {
  const handbook = contributor === HANDBOOK_KEY || contributor === SYSTEMS_KEY; // both open documents and text files
  const typeOf = handbook ? handbookTypeOf : fileTypeOf;
  if (typeof rel !== 'string' || !typeOf(rel) || rel.split('/').some((part) => (!handbook && isHelper(part)) || part.startsWith('.'))) return null;
  const file = resolveInside(dir, rel);
  if (!file || !fs.statSync(file).isFile()) return null;
  // Text only: the Handbook's plain-text fallback mustn't hand out binary files.
  return handbook && FILE_TYPES[typeOf(rel)].fallback && !isTextFile(file) ? null : file;
}

// A file's version is a hash of its text, so the Source view can tell when it changed on disk.
export const versionOf = (text) => crypto.createHash('sha1').update(text).digest('hex').slice(0, 16);
