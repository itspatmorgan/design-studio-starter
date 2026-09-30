// `virtual:system-props`: the props of every component in every prototype system, read from their
// TypeScript (scripts/lib/extract-props.js), keyed "<system>/<file>" ("product/button.tsx").
// The built site imports it; while the app runs, the same props are served at /__studio/system-props
// instead (a module can't be re-imported after an edit). Either way they're worked out when a
// component page first asks, and again after a component file is added, removed or edited.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROTOTYPE_SYSTEMS } from '../src/systems/index.ts';
import { systemDocs } from './lib/system-docs.js';
import { extractProps } from './lib/extract-props.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SYSTEMS = path.join(ROOT, 'src', 'systems') + path.sep;
const ID = 'virtual:system-props';
const RESOLVED = '\0' + ID;

function compute() {
  const keyed = [];
  for (const [id, sys] of Object.entries(PROTOTYPE_SYSTEMS)) {
    const dir = path.join(ROOT, sys.dir, 'components');
    for (const c of systemDocs(dir).components) if (c.files.source) keyed.push([`${id}/${c.files.source}`, path.join(dir, c.files.source)]);
  }
  const byFile = extractProps(keyed.map(([, file]) => file), ROOT);
  return Object.fromEntries(keyed.map(([key, file]) => [key, byFile[file] ?? []]));
}

export default function systemProps() {
  let cache = null;
  return {
    name: 'system-props',
    resolveId: (id) => (id === ID ? RESOLVED : undefined),
    load(id) {
      if (id !== RESOLVED) return undefined;
      try { cache ??= compute(); } catch (e) { this.warn(`Could not read component props: ${e.message}`); cache = {}; }
      return `export default ${JSON.stringify(cache)}`;
    },
    configureServer(server) {
      // While the app runs it asks here, so the props are always the code's current ones.
      server.middlewares.use('/__studio/system-props', (req, res) => {
        if (req.headers['sec-fetch-site'] !== 'same-origin') { res.statusCode = 403; return res.end(); }
        res.setHeader('Content-Type', 'application/json');
        try { cache ??= compute(); res.end(JSON.stringify(cache)); } catch (e) { res.statusCode = 500; res.end(JSON.stringify({ error: e.message })); }
      });
      const stale = (file) => {
        if (!file.startsWith(SYSTEMS) || !/\.[jt]sx$/.test(file)) return;
        cache = null;
        const mod = server.moduleGraph.getModuleById(RESOLVED);
        if (mod) server.moduleGraph.invalidateModule(mod);
      };
      for (const kind of ['add', 'unlink', 'change']) server.watcher.on(kind, stale);
    },
  };
}
