// The file layer behind the prototype navigation's file tree, during `pnpm dev` only.
// (The deployed site is static, so this doesn't exist there.)
//
//   GET  /__studio/me                                       your contributors.json key
//   GET  /__studio/files?contributor=<key>&prototype=<id>   the prototype's files and folders
//   POST /__studio/reveal   { contributor, prototype, path }  show a file in Finder
//   POST /__studio/op       { contributor, prototype, op, ... }  change files, in your folder only:
//        create   { path: folder, name, dir? }   a new file (a view if it's .tsx/.jsx) or folder
//        rename   { path, name }
//        move     { path, to: folder }           "" is the prototype's top level
//        delete   { path }                        to the Trash (or .trash/ at the repo root)
//        meta     { title?, description?, start? }  edit meta.json (start "" opens the first item)
//   POST /__studio/prototype { title, description }   a new prototype in your folder, like pnpm new
//   POST /__studio/prototype-delete { contributor, prototype }   move a prototype you own to the Trash
//     It replies with the new path and the updated manifest, so the app can follow a renamed view.
//
// Opening a file in your editor uses Vite's built-in /__open-in-editor.
// When anything under src/prototypes/ is added or removed, it sends "studio:files" with the
// prototypes that changed, so an open file tree refreshes itself.
//
// Requests must come from the app's own page, and every path is checked to stay inside
// the prototype's folder.
import fs from 'node:fs';
import path from 'node:path';
import { execFile, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildManifest } from './build-manifest.js';
import { createPrototype } from './create-prototype.js';
import { publishManifest } from './vite-manifest-watch-plugin.js';
import { resolveContributor } from './resolve-contributor.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROTOS = path.join(ROOT, 'src', 'prototypes');
const NAME = /^[a-z0-9][a-z0-9._-]*$/i;
const TRASH = path.join(ROOT, '.trash');
const BATCH_MS = 50;

// A prototype's folder, or null if the contributor or prototype name isn't valid.
function prototypeDir(contributor, prototype) {
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

// Files and folders, files first, then folders, each alphabetical. Hidden files are skipped.
function readTree(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => !e.name.startsWith('.'));
  const byName = (a, b) => a.name.localeCompare(b.name);
  const files = entries.filter((e) => e.isFile()).sort(byName)
    .map((e) => ({ name: e.name, path: base + e.name, dir: false }));
  const dirs = entries.filter((e) => e.isDirectory()).sort(byName)
    .map((e) => ({ name: e.name, path: base + e.name, dir: true, children: readTree(path.join(dir, e.name), `${base}${e.name}/`) }));
  return [...files, ...dirs];
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
  for await (const chunk of req) raw += chunk;
  try { return JSON.parse(raw || '{}'); } catch { return {}; }
}

// A file or folder name you can create or rename to: no slashes, not hidden, not "." or "..".
const validName = (name) => typeof name === 'string' && /^[^/\\\0]+$/.test(name) && !name.startsWith('.') && name.trim() === name;

// An item's name in meta.json "start" and URLs: its path without the extension ("lofi/main").
const viewKey = (rel) => rel.replace(/\.[^./]+$/, '');

// A new view: a component named after the file ("user-settings.tsx" → UserSettings).
function viewTemplate(name) {
  const base = name.replace(/\.[jt]sx$/, '');
  const component = base.split(/[^a-z0-9]+/i).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('') || 'View';
  const safe = /^[A-Z]/.test(component) ? component : `View${component}`;
  // It starts as a placeholder (src/lib/placeholder.tsx) until something is built in it.
  return `import { Placeholder } from '@/lib/placeholder';\n\nexport default function ${safe}() {\n  return <Placeholder file={import.meta.url} />;\n}\n`;
}

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

// Keeps meta.json "start" pointing at a real view when that view moves or is deleted.
function fixStart(dir, fromRel, toRel) {
  const metaFile = path.join(dir, 'meta.json');
  let meta;
  try { meta = JSON.parse(fs.readFileSync(metaFile, 'utf8')); } catch { return; }
  if (typeof meta.start !== 'string') return;
  const from = viewKey(fromRel);
  // A moved folder takes the views inside it along.
  let next;
  if (meta.start === from) next = toRel ? viewKey(toRel) : undefined;
  else if (meta.start.startsWith(`${from}/`)) next = toRel ? `${toRel}${meta.start.slice(from.length)}` : undefined;
  else return;
  if (next === undefined) delete meta.start; else meta.start = next;
  fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n');
}

// One file operation. Returns { path } (the new path, for create, rename, and move) or throws a message.
function runOp(dir, { op, path: rel = '', name, dir: isDir, to, title, description, start }) {
  const inside = (r) => resolveInside(dir, r);
  const relOf = (abs) => path.relative(fs.realpathSync(dir), abs).split(path.sep).join('/');
  if (op === 'create') {
    const parent = inside(rel);
    if (!parent || !fs.statSync(parent).isDirectory()) throw new Error('That folder doesn\'t exist.');
    if (!validName(name)) throw new Error('Use a name without slashes that doesn\'t start with a dot.');
    const target = path.join(parent, name);
    if (fs.existsSync(target)) throw new Error(`There's already something called ${name} here.`);
    if (isDir) fs.mkdirSync(target);
    else fs.writeFileSync(target, /\.[jt]sx$/.test(name) ? viewTemplate(name) : '');
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
    // start: an item's path without its extension, or "" to open on the first item.
    if (start === '') delete meta.start;
    else if (start !== undefined) {
      const items = buildManifest().manifest.prototypes.find((p) => path.join(PROTOS, p.contributorKey, p.id) === dir)?.items ?? [];
      if (!items.some((i) => viewKey(i.path) === start)) throw new Error(`"${start}" isn't an item in this prototype.`);
      meta.start = start;
    }
    fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n');
    return {};
  }
  const source = inside(rel);
  if (!source || source === fs.realpathSync(dir)) throw new Error('That file doesn\'t exist.');
  if (rel === 'meta.json') throw new Error('meta.json describes the prototype, so it can\'t be renamed, moved, or deleted. Edit it instead.');
  if (op === 'rename' || op === 'move') {
    let target;
    if (op === 'rename') {
      if (!validName(name)) throw new Error('Use a name without slashes that doesn\'t start with a dot.');
      target = path.join(path.dirname(source), name);
    } else {
      const folder = inside(to ?? '');
      if (!folder || !fs.statSync(folder).isDirectory()) throw new Error('That folder doesn\'t exist.');
      if (folder === source || folder.startsWith(source + path.sep)) throw new Error('A folder can\'t move into itself.');
      target = path.join(folder, path.basename(source));
    }
    if (target === source) return { path: rel };
    if (fs.existsSync(target)) throw new Error(`There's already something called ${path.basename(target)} there.`);
    fs.renameSync(source, target);
    const next = relOf(target);
    fixStart(dir, rel, next);
    return { path: next };
  }
  if (op === 'delete') {
    const where = trash(source);
    fixStart(dir, rel, null);
    return { trashedTo: where };
  }
  throw new Error(`Unknown operation: ${op}`);
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
    // manifest and the view list (loadView.ts) already handle these, so drop Vite's copy of
    // the file itself and let its importers, like the view list, update as usual. Edits to a
    // file are left to Vite's normal hot reload.
    hotUpdate({ type, file, modules }) {
      if (type === 'update' || !file.startsWith(PROTOS + path.sep)) return;
      for (const m of modules) if (m.file === file) this.environment.moduleGraph.invalidateModule(m);
      return modules.filter((m) => m.file !== file);
    },
    configureServer(server) {
      // Who you are, worked out once (it can call the GitHub CLI), and again if contributors.json changes.
      let key;
      const me = () => (key === undefined ? (key = resolveContributor()) : key);
      server.watcher.on('change', (f) => { if (path.basename(f) === 'contributors.json') key = undefined; });

      server.middlewares.use('/__studio', async (req, res, next) => {
        if (!sameOrigin(req)) return send(res, 403, { error: 'Only the app can use this.' });
        const url = new URL(req.url ?? '/', 'http://localhost');
        if (req.method === 'GET' && url.pathname === '/files') {
          const dir = prototypeDir(url.searchParams.get('contributor'), url.searchParams.get('prototype'));
          if (!dir) return send(res, 404, { error: 'No such prototype.' });
          return send(res, 200, { files: readTree(dir) });
        }
        if (req.method === 'GET' && url.pathname === '/me') return send(res, 200, { key: me() });
        if (req.method === 'POST' && url.pathname === '/op') {
          const body = await readJson(req);
          const dir = prototypeDir(body.contributor, body.prototype);
          if (!dir) return send(res, 404, { error: 'No such prototype.' });
          // Contributor scope: you can change only your own folder.
          if (body.contributor !== me()) return send(res, 403, { error: `You can change only your own prototypes (you're ${me() ?? 'not in contributors.json'}).` });
          try {
            const result = runOp(dir, body);
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
        if (req.method === 'POST' && url.pathname === '/prototype-delete') {
          const { contributor, prototype } = await readJson(req);
          const dir = prototypeDir(contributor, prototype);
          if (!dir) return send(res, 404, { error: 'No such prototype.' });
          if (contributor !== me()) return send(res, 403, { error: `You can delete only your own prototypes (you're ${me() ?? 'not in contributors.json'}).` });
          const trashedTo = trash(dir);
          const { manifest } = buildManifest();
          publishManifest(server, manifest, req.headers['x-studio-tab']);
          return send(res, 200, { trashedTo, manifest });
        }
        if (req.method === 'POST' && url.pathname === '/reveal') {
          const { contributor, prototype, path: rel } = await readJson(req);
          const dir = prototypeDir(contributor, prototype);
          const file = dir && resolveInside(dir, rel ?? '');
          if (!file) return send(res, 404, { error: 'No such file.' });
          reveal(file);
          return send(res, 200, { ok: true });
        }
        next();
      });

      // Tell the app which prototypes' files changed, batched.
      let timer = null;
      const changed = new Set();
      const onEvent = (file) => {
        const [contributor, prototype] = path.relative(PROTOS, file).split(path.sep);
        if (!contributor || contributor.startsWith('..') || !prototype) return;
        changed.add(`${contributor}/${prototype}`);
        clearTimeout(timer);
        timer = setTimeout(() => {
          server.ws.send({ type: 'custom', event: 'studio:files', data: [...changed] });
          changed.clear();
        }, BATCH_MS);
      };
      for (const kind of ['add', 'unlink', 'addDir', 'unlinkDir']) server.watcher.on(kind, onEvent);
    },
  };
}
