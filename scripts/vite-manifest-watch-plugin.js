import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROTOS = path.join(ROOT, 'src', 'prototypes');
const GUIDE = path.join(ROOT, 'src', 'guide');

function relevant(file) {
  if (path.dirname(file) === GUIDE) return file.endsWith('.mdx');
  const rel = path.relative(PROTOS, file);
  if (rel.startsWith('..')) return false;
  const parts = rel.split(path.sep);
  if (parts.includes('components')) return false;
  return /\.[jt]sx$/.test(rel) || path.basename(rel) === 'meta.json';
}

export default function manifestWatch() {
  return {
    name: 'prototype-manifest-watch',
    apply: 'serve',
    configureServer(server) {
      server.watcher.add([PROTOS, GUIDE]);
      const rebuild = (file, kind) => {
        if (!relevant(file)) return;
        // Edits to a view need no rebuild; edits to meta.json or a Guide page's frontmatter might.
        if (kind === 'change' && path.basename(file) !== 'meta.json' && !file.endsWith('.mdx')) return;
        try {
          execFileSync(process.execPath, [path.join(ROOT, 'scripts/build-manifest.js')], { stdio: 'inherit' });
        } catch { return; }
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', (f) => rebuild(f, 'add'));
      server.watcher.on('unlink', (f) => rebuild(f, 'unlink'));
      server.watcher.on('change', (f) => rebuild(f, 'change'));
    },
  };
}
