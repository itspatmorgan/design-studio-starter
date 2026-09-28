import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROTOS = path.join(ROOT, 'src', 'prototypes');

function relevant(file) {
  const rel = path.relative(PROTOS, file);
  if (rel.startsWith('..')) return false;
  const parts = rel.split(path.sep);
  if (parts.some((p) => p.startsWith('_')) || parts.includes('components')) return false;
  return /\.[jt]sx$/.test(rel) || path.basename(rel) === 'meta.json';
}

export default function manifestWatch() {
  return {
    name: 'prototype-manifest-watch',
    apply: 'serve',
    configureServer(server) {
      server.watcher.add(PROTOS);
      const rebuild = (file, kind) => {
        if (!relevant(file)) return;
        if (kind === 'change' && path.basename(file) !== 'meta.json') return;
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
