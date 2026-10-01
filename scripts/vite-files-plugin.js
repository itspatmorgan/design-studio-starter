// The file layer behind the prototype navigation's file tree, during `pnpm dev` only.
// (The deployed site is static, so this doesn't exist there.)
//
//   GET  /__studio/me                                       your contributors.json key
//   GET  /__studio/files?contributor=<key>&prototype=<id>   the prototype's files and folders
//        (contributor "handbook" reads a Handbook section, src/handbook/<id>/, which is read-only)
//   GET  /__studio/file?contributor=<key>&prototype=<id>&path=<file>   an item's text and its version
//   POST /__studio/write   { contributor, prototype, path, content, base }  save an item you own, or a Handbook file (Source view)
//   POST /__studio/reveal   { contributor, prototype, path }  show a file in Finder
//   POST /__studio/op       { contributor, prototype, op, ... }  change files, in your folder only:
//        create   { path: folder, name, dir? }   a new file (from its type's template, by extension) or folder
//        rename   { path, name }
//        move     { path, to: folder }           "" is the prototype's top level
//        delete   { path }                        to the Trash (or .trash/ at the repo root)
//        reorder  { path, to?, before? }         put a file or folder before another in its folder ("before" empty: last), moving it to folder "to" first if given; saved in meta.json "order"
//        meta     { title?, description?, start?, status? }  edit meta.json (start "" opens the first item; status is "active" or "archived")
//        create-skill { name, description }       Handbook skills only: skills/<name>/SKILL.md, in the Agent Skills format
//      (In the Handbook, anyone can change files, but only in its fixed shape: src/studio/handbookRules.ts.)
//      (contributor "systems" opens a prototype system's components, src/systems/<id>/components/. Anyone can
//      read and save its text files, and it has one operation of its own:
//        add-docs { component }                    the examples and page a component is missing)
//   POST /__studio/prototype { title, description }   a new prototype in your folder, like pnpm new
//   POST /__studio/prototype-rename { contributor, prototype, title, description? }   retitle a prototype you own; a new title renames its folder too
//   POST /__studio/prototype-delete { contributor, prototype }   move a prototype you own to the Trash
//     It replies with the new path and the updated manifest, so the app can follow a renamed view.
//
// Opening a file in your editor uses Vite's built-in /__open-in-editor.
// When anything under src/prototypes/ is added or removed, it sends "studio:files" with the
// prototypes that changed, so an open file tree refreshes itself.
//
// Requests must come from the app's own page, and every path is checked to stay inside
// the prototype's folder.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFile, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildManifest } from './build-manifest.js';
import { createPrototype, renamePrototype } from './create-prototype.js';
import { publishManifest } from './vite-manifest-watch-plugin.js';
import { resolveContributor } from './resolve-contributor.js';
import { FILE_TYPES, fileTypeOf, handbookTypeOf, isTextFile } from './lib/file-types.js';
import { isHelper } from '../src/studio/fileTypes/index.ts';
import { STATUSES, parseStatus } from '../src/studio/archive.ts';
import { afterChange, byOrder, parentOf, parseOrder, place, withFolderOrder } from '../src/studio/order.ts';
import { HANDBOOK_KEY, SYSTEMS_KEY, isHandbookSection, rootOf } from '../src/studio/roots.ts';
import { canChange as mayChange, canOwn, parseMaintainers, policyFor, whyNot } from '../src/studio/permissions.ts';
import { MODULES, PROTOTYPE_SECTIONS, SERVER_FILES } from './lib/modules.js';
import { SYSTEM_SOURCES } from './lib/systems.js';
import { scaffold } from './scaffold-component-docs.js';
import { opProblem } from '../src/studio/handbookRules.ts';
import { SKILL_FILE, descriptionProblem, nameProblem, skillProblems } from '../src/studio/skills.ts';
import { frontmatter } from './lib/frontmatter.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROTOS = path.join(ROOT, 'src', 'prototypes');
const HANDBOOK = path.join(ROOT, 'src', 'handbook');
// Each system's components folder, to tell which system a file belongs to.
const COMPONENT_DIRS = Object.entries(SYSTEM_SOURCES).map(([id, s]) => [id, path.join(ROOT, s.components) + path.sep]);
const systemOf = (file) => COMPONENT_DIRS.find(([, dir]) => file.startsWith(dir));
const NAME = /^[a-z0-9][a-z0-9._-]*$/i;
const TRASH = path.join(ROOT, '.trash');
const BATCH_MS = 50;
const MAX_SOURCE_BYTES = 750 * 1024; // the same limit as any committed file (check-asset-size.js)

// A prototype's folder, or null if the contributor or prototype name isn't valid. The Handbook
// sections (src/handbook/docs, rules, skills) are found here too, by their fixed names, to read.
function prototypeDir(contributor, prototype) {
  // A system's components (its own list, systemSources.ts): only the systems listed there.
  if (contributor === SYSTEMS_KEY) {
    const dir = typeof prototype === 'string' && Object.hasOwn(SYSTEM_SOURCES, prototype) ? path.join(ROOT, SYSTEM_SOURCES[prototype].components) : null;
    return dir && fs.existsSync(dir) ? dir : null;
  }
  // An item of a module's section of prototype-shaped folders (a tool, src/tools/<id>/): found by its folder name.
  const section = PROTOTYPE_SECTIONS.find((s) => s.key === contributor);
  if (section) {
    if (!NAME.test(prototype ?? '')) return null;
    const dir = path.join(section.dir, prototype);
    return fs.existsSync(dir) ? dir : null;
  }
  if (contributor === HANDBOOK_KEY) return isHandbookSection(prototype) && fs.existsSync(path.join(HANDBOOK, prototype)) ? path.join(HANDBOOK, prototype) : null;
  if (!NAME.test(contributor ?? '') || !NAME.test(prototype ?? '')) return null;
  const dir = path.join(PROTOS, contributor, prototype);
  return fs.existsSync(path.join(dir)) ? dir : null;
}

// A path inside a prototype's folder, resolved for real (so links can't point outside), or null.
export function resolveInside(dir, rel) {
  if (typeof rel !== 'string' || rel.includes('\0')) return null;
  const target = path.resolve(dir, rel);
  if (target !== dir && !target.startsWith(dir + path.sep)) return null;
  try {
    const real = fs.realpathSync(target);
    const realDir = fs.realpathSync(dir);
    return real === realDir || real.startsWith(realDir + path.sep) ? real : null;
  } catch { return null; }
}

// A prototype's meta.json "order" (src/studio/order.ts), or none. The Handbook and system folders have no meta.json.
function readOrder(dir) {
  try { return parseOrder(JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')).order) ?? []; } catch { return []; }
}

// Files and folders in the prototype's order: files first, then folders, each alphabetical, unless
// meta.json says otherwise. Hidden files are skipped.
function readTree(dir, base = '', order = readOrder(dir)) {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => !e.name.startsWith('.'));
  return byOrder(entries.filter((e) => e.isFile() || e.isDirectory()).map((e) => ({ name: e.name, path: base + e.name, dir: e.isDirectory() })), order)
    .map((e) => (e.dir ? { ...e, children: readTree(path.join(dir, e.name), `${e.path}/`, order) } : e));
}

// Only the app's own page may call these: browsers mark same-origin requests.
const sameOrigin = (req) => req.headers['sec-fetch-site'] === 'same-origin';

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 2 * MAX_SOURCE_BYTES) return {}; // far more than any file we save
  }
  try { return JSON.parse(raw || '{}'); } catch { return {}; }
}

// A file or folder name you can create or rename to: no slashes, not hidden, not "." or "..".
const validName = (name) => typeof name === 'string' && /^[^/\\\0]+$/.test(name) && !name.startsWith('.') && name.trim() === name;

// An item's name in meta.json "start" and URLs: its path without the extension ("lofi/main").
const viewKey = (rel) => rel.replace(/\.[^./]+$/, '');

// An existing item file (a view or document, not a helper: a name starting with an underscore) in the prototype,
// as its real path, or null. The Source view reads and saves only these: never meta.json,
// hidden files, or anything outside the prototype. In the Handbook, a file is an item if it opens
// as a document or as text, and its folders can be named anything but hidden.
function itemFile(dir, rel, contributor) {
  const handbook = contributor === HANDBOOK_KEY || contributor === SYSTEMS_KEY; // both open documents and text files
  const typeOf = handbook ? handbookTypeOf : fileTypeOf;
  if (typeof rel !== 'string' || !typeOf(rel) || rel.split('/').some((part) => (!handbook && isHelper(part)) || part.startsWith('.'))) return null;
  const file = resolveInside(dir, rel);
  if (!file || !fs.statSync(file).isFile()) return null;
  // Text only: the Handbook's plain-text fallback mustn't hand out binary files.
  return handbook && FILE_TYPES[typeOf(rel)].fallback && !isTextFile(file) ? null : file;
}

// A file's version is a hash of its text, so the Source view can tell when it changed on disk.
const versionOf = (text) => crypto.createHash('sha1').update(text).digest('hex').slice(0, 16);

// The contents of a new file: its file type's template, by extension (src/studio/fileTypes/<type>/type.ts).
// Files of no type start empty.
const templateFor = (name) => FILE_TYPES[fileTypeOf(name)]?.template?.(name) ?? '';

// The Handbook's files are platform files: anyone can change their copy here, and the changes go
// through review before they reach everyone. So it's open to whoever runs the app; what it does
// enforce is the Handbook's shape (src/studio/handbookRules.ts).
const HANDBOOK_NOTE = 'The Handbook\'s sections (Docs, Rules, Skills) can\'t be renamed or deleted.';

// Who can change a prototype's files is the policy of its section (src/studio/permissions.ts): your own
// prototypes; a tool, if you maintain it (its meta.json); the platform's (the Handbook's, and the
// prototype systems' components), which go through review like any change to it.
const maintainersOf = (dir) => {
  try { return parseMaintainers(JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')).maintainers) ?? []; } catch { return []; }
};
const policyOf = (contributor) => policyFor(contributor, Object.values(MODULES));
const subjectOf = (contributor, me, dir) => ({ me, key: contributor, maintainers: policyOf(contributor) === 'maintainers' ? maintainersOf(dir) : undefined });
const owns = (contributor, me, dir) => canOwn(policyOf(contributor), subjectOf(contributor, me, dir));
const canChange = (contributor, me, dir) => mayChange(policyOf(contributor), subjectOf(contributor, me, dir));

// "code-review" → "Code review"
const titleOf = (name) => { const t = name.replace(/-/g, ' '); return t.charAt(0).toUpperCase() + t.slice(1); };

// A skill's new SKILL.md: the frontmatter the Agent Skills format needs, and a start for the body.
// A description that isn't plain text goes in a block, which any YAML reader takes literally.
function skillTemplate(name, description) {
  const plain = /^[A-Za-z0-9][^:#"'\\\n]*$/.test(description) && !/\s$/.test(description);
  const line = plain ? `description: ${description}` : `description: >\n  ${description.replace(/\s+/g, ' ').trim()}`;
  return `---\nname: ${name}\n${line}\n---\n\nSay what to do, step by step, and when it applies.\n`;
}

// A new rule's start.
const ruleTemplate = (name) => `# ${titleOf(name.replace(/\.md$/, ''))}\n\nWhat your agent should know or do, and when.\n`;

// Why you can't change a prototype: it's someone else's, you aren't a maintainer, or you aren't set up yet.
const ownerError = (contributor, me) => whyNot(policyOf(contributor), me);

// Moves a file or folder to the Trash with macOS's built-in trash command, or, where
// there isn't one, into .trash/ at the repo root (ignored by Git).
function trash(file) {
  if (fs.existsSync('/usr/bin/trash')) {
    try { execFileSync('/usr/bin/trash', [file]); return 'the Trash'; } catch { /* fall back */ }
  }
  fs.mkdirSync(TRASH, { recursive: true });
  fs.renameSync(file, path.join(TRASH, `${Date.now()}-${path.basename(file)}`));
  return '.trash/';
}

// Keeps meta.json "start" pointing at a real item when that item moves or is deleted.
function fixStart(dir, fromRel, toRel) {
  const metaFile = path.join(dir, 'meta.json');
  let meta;
  try { meta = JSON.parse(fs.readFileSync(metaFile, 'utf8')); } catch { return; }
  if (typeof meta.start !== 'string') return;
  const from = viewKey(fromRel);
  // A moved folder takes the items inside it along.
  let next;
  if (meta.start === from) next = toRel ? viewKey(toRel) : undefined;
  else if (meta.start.startsWith(`${from}/`)) next = toRel ? `${toRel}${meta.start.slice(from.length)}` : undefined;
  else return;
  if (next === undefined) delete meta.start; else meta.start = next;
  fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n');
}

// Keeps meta.json "order" in step when a file or folder is renamed (toRel is its new path), or moves
// or is deleted (toRel is null: a moved file lands after the arranged ones in its new folder).
function fixOrder(dir, fromRel, toRel) {
  const metaFile = path.join(dir, 'meta.json');
  let meta;
  try { meta = JSON.parse(fs.readFileSync(metaFile, 'utf8')); } catch { return; }
  const order = parseOrder(meta.order);
  if (!order) return;
  const next = afterChange(order, fromRel, toRel);
  if (next.length === order.length && next.every((p, i) => p === order[i])) return;
  if (next.length) meta.order = next; else delete meta.order;
  fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n');
}

// Sets `name:` in a SKILL.md's frontmatter (adding it if it's missing), leaving the rest as it is.
function renameSkillInFile(file, name) {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8');
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return;
  const lines = block[1].split(/\r?\n/);
  const at = lines.findIndex((l) => /^name:/.test(l));
  if (at >= 0) lines[at] = `name: ${name}`; else lines.unshift(`name: ${name}`);
  fs.writeFileSync(file, text.replace(block[1], lines.join('\n')));
}

// One file operation. Returns { path } (the new path, for create, rename, and move) or throws a message.
// `section` is the Handbook section the folder is (docs, rules, skills), or null for a prototype.
function runOp(dir, { op, path: rel = '', name, dir: isDir, to, before, title, description, start, status }, section = null) {
  const inside = (r) => resolveInside(dir, r);
  const relOf = (abs) => path.relative(fs.realpathSync(dir), abs).split(path.sep).join('/');
  // The Handbook has a fixed shape: check the change against it first (src/studio/handbookRules.ts).
  if (section) {
    if (op === 'create-skill') {
      if (section !== 'skills') throw new Error('Skills are made in the Skills tab.');
      const bad = nameProblem(name) ? `A skill's name ${nameProblem(name)}` : descriptionProblem(description) ? `The description ${descriptionProblem(description)}` : null;
      if (bad) throw new Error(bad);
      if (/[\r\n]/.test(name)) throw new Error('A skill\'s name is one word or several joined by hyphens.');
      const folder = path.join(dir, name);
      if (fs.existsSync(folder)) throw new Error(`A skill named “${name}” already exists.`);
      fs.mkdirSync(folder);
      fs.writeFileSync(path.join(folder, SKILL_FILE), skillTemplate(name, description));
      return { path: `${name}/${SKILL_FILE}` };
    }
    const target = op === 'create' ? null : inside(rel);
    // A Markdown file keeps its .md: rename to "notes" and it's "notes.md", like a new file.
    if (op === 'rename' && (section === 'docs' || section === 'rules') && target && fs.statSync(target).isFile() && typeof name === 'string' && !name.endsWith('.md')) name += '.md';
    const problem = opProblem(section, { op, path: rel, name, to, dir: isDir }, Boolean(target && fs.statSync(target).isDirectory()));
    if (problem) throw new Error(problem);
  }
  if (op === 'create') {
    const parent = inside(rel);
    if (!parent || !fs.statSync(parent).isDirectory()) throw new Error('That folder was moved or deleted.');
    if (!validName(name)) throw new Error('Names can\'t contain slashes or start with a dot.');
    const target = path.join(parent, name);
    if (fs.existsSync(target)) throw new Error(`Something named “${name}” already exists here.`);
    if (isDir) fs.mkdirSync(target);
    else fs.writeFileSync(target, section === 'rules' ? ruleTemplate(name) : templateFor(name));
    return { path: relOf(target) };
  }
  if (op === 'meta') {
    // Only the fields given change; others in meta.json (created, system) are kept.
    const metaFile = path.join(dir, 'meta.json');
    const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) throw new Error('The prototype needs a title.');
      meta.title = title.trim();
    }
    if (typeof description === 'string') meta.description = description.trim();
    // status: active (the default, so it's not written) or archived.
    if (status !== undefined) {
      const next = parseStatus(status);
      if (!next) throw new Error(`A status is one of: ${STATUSES.join(', ')}.`);
      if (next === 'active') delete meta.status; else meta.status = next;
    }
    // start: an item's path without its extension, or "" to open on the first item.
    if (start === '') delete meta.start;
    else if (start !== undefined) {
      const made = buildManifest().manifest;
      const items = [...made.prototypes, ...Object.values(made.sections).flat()].find((p) => path.join(ROOT, 'src', rootOf(p.contributorKey, p.id)) === dir)?.items ?? [];
      if (!items.some((i) => viewKey(i.path) === start)) throw new Error(`“${start}” isn't a view in this prototype.`);
      meta.start = start;
    }
    fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n');
    return {};
  }
  if (op === 'reorder') {
    // Arranging is for prototypes: the Handbook has a fixed shape (src/studio/handbookRules.ts).
    if (section) throw new Error('The Handbook keeps its own order.');
    const from = inside(rel);
    if (!from || from === fs.realpathSync(dir) || rel === 'meta.json') throw new Error('That file was moved or deleted.');
    let current = rel;
    if (typeof to === 'string' && to !== parentOf(rel)) current = runOp(dir, { op: 'move', path: rel, to }).path;
    const folder = parentOf(current);
    const where = inside(folder);
    if (!where || !fs.statSync(where).isDirectory()) throw new Error('That folder was moved or deleted.');
    const siblings = readTree(where, folder ? `${folder}/` : '', readOrder(dir)).map((n) => n.path);
    if (!siblings.includes(current)) throw new Error('That file was moved or deleted.');
    if (before && !siblings.includes(before)) throw new Error('That place was moved or deleted.');
    const metaFile = path.join(dir, 'meta.json');
    const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    meta.order = withFolderOrder(parseOrder(meta.order) ?? [], folder, place(siblings, current, before ?? ''));
    fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n');
    return { path: current };
  }
  const source = inside(rel);
  if (!source || source === fs.realpathSync(dir)) throw new Error('That file was moved or deleted.');
  if (rel === 'meta.json') throw new Error('meta.json holds the prototype\'s info, so it stays put. To change the title or description, choose Edit.');
  if (op === 'rename' || op === 'move') {
    let target;
    if (op === 'rename') {
      if (!validName(name)) throw new Error('Names can\'t contain slashes or start with a dot.');
      target = path.join(path.dirname(source), name);
    } else {
      const folder = inside(to ?? '');
      if (!folder || !fs.statSync(folder).isDirectory()) throw new Error('That folder was moved or deleted.');
      if (folder === source || folder.startsWith(source + path.sep)) throw new Error('A folder can\'t move inside itself.');
      target = path.join(folder, path.basename(source));
    }
    if (target === source) return { path: rel };
    if (fs.existsSync(target)) throw new Error(`Something named “${path.basename(target)}” already exists there.`);
    fs.renameSync(source, target);
    const next = relOf(target);
    // A skill's name is its folder's name: keep the two together.
    if (section === 'skills' && op === 'rename' && !rel.includes('/')) renameSkillInFile(path.join(target, SKILL_FILE), path.basename(target));
    fixStart(dir, rel, next);
    fixOrder(dir, rel, op === 'rename' ? next : null);
    return { path: next };
  }
  if (op === 'delete') {
    const where = trash(source);
    fixStart(dir, rel, null);
    fixOrder(dir, rel, null);
    return { trashedTo: where };
  }
  throw new Error(`Unknown operation: ${op}`);
}

// The one operation a prototype system's components have (see the header). Anything else, like
// adding, renaming, or deleting a component, is done in the files: it would break the prototypes using it.
function runSystemOp(system, { op, component }) {
  if (op === 'add-docs') {
    if (typeof component !== 'string') throw new Error('Say which component.');
    scaffold(system, component);
    return {};
  }
  throw new Error('Components are added and changed in their files: edit them in the Source view, or ask your agent.');
}

// Show a file in the system file browser.
function reveal(file) {
  if (process.platform === 'darwin') execFile('open', ['-R', file]);
  else if (process.platform === 'win32') execFile('explorer', [`/select,${file}`]);
  else execFile('xdg-open', [path.dirname(file)]);
}

export default function filesPlugin() {
  return {
    name: 'studio-files',
    apply: 'serve',
    // When a prototype file is moved, created, or deleted, Vite would try to hot-reload it
    // (at its old path, or at a path the page loaded before), fail, and reload the page. The
    // manifest and the item lists (src/studio/fileTypes/<type>/loader.ts) already handle these, so drop Vite's copy of
    // the file itself and let its importers, like those lists, update as usual. Edits to a
    // file are left to Vite's normal hot reload.
    hotUpdate({ type, file, modules }) {
      if (type === 'update' || !(file.startsWith(PROTOS + path.sep) || PROTOTYPE_SECTIONS.some((s) => file.startsWith(s.dir + path.sep)) || file.startsWith(HANDBOOK + path.sep) || systemOf(file))) return;
      for (const m of modules) if (m.file === file) this.environment.moduleGraph.invalidateModule(m);
      return modules.filter((m) => m.file !== file);
    },
    async configureServer(server) {
      // The routes the modules add (a server.ts in a module's folder), by module id.
      const moduleServers = Object.fromEntries(await Promise.all(SERVER_FILES.map(async ([id, file]) => [id, (await import(pathToFileURL(file).href)).default])));
      // Who you are, worked out once (it can call the GitHub CLI), and again if contributors.json changes.
      let key;
      const me = () => (key === undefined ? (key = resolveContributor()) : key);
      server.watcher.on('change', (f) => { if (path.basename(f) === 'contributors.json') key = undefined; });

      server.middlewares.use('/__studio', async (req, res, next) => {
        if (!sameOrigin(req)) return send(res, 403, { error: 'Only the app can use this.' });
        const url = new URL(req.url ?? '/', 'http://localhost');
        if (req.method === 'GET' && url.pathname === '/files') {
          const dir = prototypeDir(url.searchParams.get('contributor'), url.searchParams.get('prototype'));
          if (!dir) return send(res, 404, { error: 'This prototype no longer exists.' });
          return send(res, 200, { files: readTree(dir) });
        }
        if (req.method === 'GET' && url.pathname === '/me') return send(res, 200, { key: me() });
        if (req.method === 'GET' && url.pathname === '/file') {
          const dir = prototypeDir(url.searchParams.get('contributor'), url.searchParams.get('prototype'));
          const file = dir && itemFile(dir, url.searchParams.get('path'), url.searchParams.get('contributor'));
          if (!file) return send(res, 404, { error: 'This file no longer exists.' });
          if (fs.statSync(file).size > MAX_SOURCE_BYTES) return send(res, 413, { error: 'This file is too large to show here. Open it in your editor.' });
          const content = fs.readFileSync(file, 'utf8');
          return send(res, 200, { content, version: versionOf(content) });
        }
        if (req.method === 'POST' && url.pathname === '/write') {
          const { contributor, prototype, path: rel, content, base } = await readJson(req);
          const dir = prototypeDir(contributor, prototype);
          const file = dir && itemFile(dir, rel, contributor);
          if (!file) return send(res, 404, { error: 'This file no longer exists.' });
          // Contributor scope: you can change only your own folder (and the Handbook's, for review).
          if (!canChange(contributor, me(), dir)) return send(res, 403, { error: ownerError(contributor, me()) });
          if (typeof content !== 'string' || Buffer.byteLength(content) > MAX_SOURCE_BYTES) return send(res, 413, { error: 'This file is too large to save here. Keep files under 750 KB.' });
          // Never overwrite a version you haven't seen: if it changed on disk since you opened it, say so.
          if (versionOf(fs.readFileSync(file, 'utf8')) !== base) return send(res, 409, { error: 'This file changed on disk since you opened it.', code: 'changed' });
          fs.writeFileSync(file, content);
          // Saving is never blocked, but a skill that's out of the format is said so now, not at the next build.
          const skill = contributor === HANDBOOK_KEY && prototype === 'skills' && rel.split('/').length === 2 && rel.endsWith(`/${SKILL_FILE}`);
          const warnings = skill ? skillProblems(rel.split('/')[0], frontmatter(content)) : [];
          return send(res, 200, { version: versionOf(content), warnings });
        }
        if (req.method === 'POST' && url.pathname === '/op') {
          const body = await readJson(req);
          const dir = prototypeDir(body.contributor, body.prototype);
          if (!dir) return send(res, 404, { error: 'This prototype no longer exists.' });
          // Contributor scope: you can change only your own folder (and the Handbook's, for review).
          if (!canChange(body.contributor, me(), dir)) return send(res, 403, { error: ownerError(body.contributor, me()) });
          try {
            const result = body.contributor === SYSTEMS_KEY ? runSystemOp(body.prototype, body) : runOp(dir, body, body.contributor === HANDBOOK_KEY ? body.prototype : null);
            const { manifest } = buildManifest();
            // Other tabs update now; the tab that asked (X-Studio-Tab) handles it from the reply.
            publishManifest(server, manifest, req.headers['x-studio-tab']);
            return send(res, 200, { ...result, manifest });
          } catch (e) {
            return send(res, 400, { error: e.message });
          }
        }
        if (req.method === 'POST' && url.pathname === '/prototype') {
          const { title, description } = await readJson(req);
          try {
            const { slug, manifest } = createPrototype({ title, description, key: me() });
            publishManifest(server, manifest, req.headers['x-studio-tab']);
            return send(res, 200, { contributor: me(), prototype: slug, manifest });
          } catch (e) {
            return send(res, 400, { error: e.message });
          }
        }
        // A route a module adds (its server.ts): POST /__studio/<module>/<route>, for modules that are on.
        const added = req.method === 'POST' ? /^\/([a-z][a-z0-9-]*)\/([a-z][a-z0-9-]*)$/.exec(url.pathname) : null;
        if (added && Object.hasOwn(moduleServers, added[1]) && Object.hasOwn(moduleServers[added[1]], added[2])) {
          const body = await readJson(req);
          try {
            const result = await moduleServers[added[1]][added[2]]({ me: me(), body });
            if (result.manifest) publishManifest(server, result.manifest, req.headers['x-studio-tab']);
            return send(res, result.status ?? 200, result.body);
          } catch (e) {
            return send(res, 400, { error: e.message });
          }
        }
        if (req.method === 'POST' && url.pathname === '/prototype-rename') {
          const { contributor, prototype, title, description } = await readJson(req);
          const dir = prototypeDir(contributor, prototype);
          if (!dir) return send(res, 404, { error: 'This prototype no longer exists.' });
          if (contributor === HANDBOOK_KEY) return send(res, 403, { error: HANDBOOK_NOTE });
          if (!owns(contributor, me(), dir)) return send(res, 403, { error: ownerError(contributor, me()) });
          try {
            const { id, manifest } = renamePrototype({ key: contributor, id: prototype, title, description });
            publishManifest(server, manifest, req.headers['x-studio-tab']);
            return send(res, 200, { prototype: id, manifest });
          } catch (e) {
            return send(res, 400, { error: e.message });
          }
        }
        if (req.method === 'POST' && url.pathname === '/prototype-delete') {
          const { contributor, prototype } = await readJson(req);
          const dir = prototypeDir(contributor, prototype);
          if (!dir) return send(res, 404, { error: 'This prototype no longer exists.' });
          if (contributor === HANDBOOK_KEY) return send(res, 403, { error: HANDBOOK_NOTE });
          if (!owns(contributor, me(), dir)) return send(res, 403, { error: ownerError(contributor, me()) });
          const trashedTo = trash(dir);
          const { manifest } = buildManifest();
          publishManifest(server, manifest, req.headers['x-studio-tab']);
          return send(res, 200, { trashedTo, manifest });
        }
        if (req.method === 'POST' && url.pathname === '/reveal') {
          const { contributor, prototype, path: rel } = await readJson(req);
          const dir = prototypeDir(contributor, prototype);
          const file = dir && resolveInside(dir, rel ?? '');
          if (!file) return send(res, 404, { error: 'This file no longer exists.' });
          reveal(file);
          return send(res, 200, { ok: true });
        }
        next();
      });

      // Tell the app which prototypes' (or the Handbook's) files changed, batched.
      let timer = null;
      const changed = new Set();
      // A file's contributor, prototype, and path in it: a prototype's, the Handbook's, or a system's components.
      const locate = (file) => {
        if (file.startsWith(HANDBOOK + path.sep)) {
          const [section, ...rest] = path.relative(HANDBOOK, file).split(path.sep);
          return rest.length ? { contributor: HANDBOOK_KEY, prototype: section, rel: rest.join('/') } : null;
        }
        const system = systemOf(file);
        if (system) return { contributor: SYSTEMS_KEY, prototype: system[0], rel: path.relative(system[1], file).split(path.sep).join('/') };
        const section = PROTOTYPE_SECTIONS.find((s) => file.startsWith(s.dir + path.sep));
        if (section) {
          const [id, ...rest] = path.relative(section.dir, file).split(path.sep);
          return rest.length ? { contributor: section.key, prototype: id, rel: rest.join('/') } : null;
        }
        const [contributor, prototype, ...rest] = path.relative(PROTOS, file).split(path.sep);
        return contributor && !contributor.startsWith('..') && prototype ? { contributor, prototype, rel: rest.join('/') } : null;
      };
      const onEvent = (file) => {
        const at = locate(file);
        if (!at) return;
        const { contributor, prototype } = at;
        changed.add(`${contributor}/${prototype}`);
        clearTimeout(timer);
        timer = setTimeout(() => {
          server.ws.send({ type: 'custom', event: 'studio:files', data: [...changed] });
          changed.clear();
        }, BATCH_MS);
      };
      for (const kind of ['add', 'unlink', 'addDir', 'unlinkDir']) server.watcher.on(kind, onEvent);

      // An item file's text changed on disk (an agent, an editor, or a save from the Source view):
      // an open Source view for it reloads or asks. Not batched: it is one file at a time.
      server.watcher.on('change', (file) => {
        const at = locate(file);
        if (!at || !(at.contributor === HANDBOOK_KEY || at.contributor === SYSTEMS_KEY ? handbookTypeOf : fileTypeOf)(at.rel)) return;
        const { contributor, prototype, rel } = at;
        server.ws.send({ type: 'custom', event: 'studio:file', data: { contributor, prototype, path: rel } });
      });
    },
  };
}
