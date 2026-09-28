// The file layer behind the prototype navigation's file tree, during `pnpm dev` only.
// (The deployed site is static, so this doesn't exist there.)
//
//   GET  /__studio/files?contributor=<key>&prototype=<id>   the prototype's files and folders
//   POST /__studio/reveal   { contributor, prototype, path }  show a file in Finder
//
// Opening a file in your editor uses Vite's built-in /__open-in-editor.
// When anything under src/prototypes/ is added or removed, it sends "studio:files" with the
// prototypes that changed, so an open file tree refreshes itself.
//
// Requests must come from the app's own page, and every path is checked to stay inside
// the prototype's folder.
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROTOS = path.join(ROOT, 'src', 'prototypes');
const NAME = /^[a-z0-9][a-z0-9._-]*$/i;
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
    configureServer(server) {
      server.middlewares.use('/__studio', async (req, res, next) => {
        if (!sameOrigin(req)) return send(res, 403, { error: 'Only the app can use this.' });
        const url = new URL(req.url ?? '/', 'http://localhost');
        if (req.method === 'GET' && url.pathname === '/files') {
          const dir = prototypeDir(url.searchParams.get('contributor'), url.searchParams.get('prototype'));
          if (!dir) return send(res, 404, { error: 'No such prototype.' });
          return send(res, 200, { files: readTree(dir) });
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
