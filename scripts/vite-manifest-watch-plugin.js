// Keeps the manifest live during `pnpm dev`, without reloading the page.
//
// Vite already watches every file. When something under src/prototypes/, src/handbook/, or src/studio/guide/
// changes (from the app, an agent, or your editor), this rebuilds the manifest in-process
// and pushes it to the app over Vite's dev connection. The app swaps it in and refreshes
// only the routes that use it (see router.tsx), so the open view and scroll position stay.
// Bursts of changes, like moving a folder, are batched into one update.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildManifest } from './build-manifest.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROTOS = path.join(ROOT, 'src', 'prototypes');
const HANDBOOK = path.join(ROOT, 'src', 'handbook');
const GUIDE = path.join(ROOT, 'src', 'studio', 'guide');
const CONTRIBUTORS = path.join(ROOT, 'contributors.json');
// The Handbook's map reads it (src/studio/handbookMap.ts).
const AGENTS = path.join(ROOT, 'AGENTS.md');
const BATCH_MS = 50;

// The last manifest sent to the app. The files plugin publishes right after its own changes
// (with the tab that made them), so the watcher skips the same manifest a moment later.
let last = '';
export function publishManifest(server, manifest, origin) {
  last = JSON.stringify(manifest);
  server.ws.send({ type: 'custom', event: 'studio:manifest', data: { manifest, origin } });
}

const inside = (dir, file) => file === dir || file.startsWith(dir + path.sep);

// Adding or removing anything can change the list of views; editing a file only matters
// for meta.json, Guide frontmatter, and contributor names. Edits to a view's code are
// left to Vite's hot reload.
function relevant(file, kind) {
  if (file === CONTRIBUTORS || file === AGENTS) return true;
  if (inside(GUIDE, file)) return file.endsWith('.md');
  if (inside(HANDBOOK, file)) return kind !== 'change';
  if (!inside(PROTOS, file)) return false;
  return kind !== 'change' || path.basename(file) === 'meta.json';
}

export default function manifestWatch() {
  return {
    name: 'prototype-manifest-watch',
    apply: 'serve',
    configureServer(server) {
      server.watcher.add([PROTOS, HANDBOOK, GUIDE, CONTRIBUTORS, AGENTS]);
      let timer = null;
      const flush = () => {
        timer = null;
        const { manifest } = buildManifest();
        if (JSON.stringify(manifest) !== last) publishManifest(server, manifest);
      };
      const onEvent = (kind) => (file) => {
        if (!relevant(file, kind)) return;
        clearTimeout(timer);
        timer = setTimeout(flush, BATCH_MS);
      };
      for (const kind of ['add', 'unlink', 'addDir', 'unlinkDir', 'change']) server.watcher.on(kind, onEvent(kind));
    },
  };
}
