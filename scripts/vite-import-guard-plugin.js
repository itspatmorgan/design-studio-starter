import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');
const PROTOS = path.join(SRC, 'prototypes');

function prototypeRoot(file) {
  const rel = path.relative(PROTOS, file);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  const [contributor, prototype] = rel.split(path.sep);
  if (!contributor || !prototype || prototype.includes('.')) return null;
  return path.join(PROTOS, contributor, prototype);
}

export default function importGuard() {
  let isBuild = false;
  return {
    name: 'prototype-import-guard',
    enforce: 'pre',
    configResolved(c) { isBuild = c.command === 'build'; },
    async resolveId(source, importer, options) {
      if (!importer || importer.includes('\0')) return null;
      const importerPath = importer.split('?')[0];
      const root = prototypeRoot(importerPath);
      if (!root) return null;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (!resolved || resolved.external) return resolved;
      const target = resolved.id.split('?')[0];
      if (!path.isAbsolute(target) || target.includes('node_modules')) return resolved;
      const inOwn = target === root || target.startsWith(root + path.sep);
      const inStudio = target.startsWith(path.join(SRC, 'studio') + path.sep);
      const inOtherProto = target.startsWith(PROTOS + path.sep) && !inOwn;
      if (inStudio || inOtherProto) {
        const msg = `Prototype scope: ${path.relative(SRC, importerPath)} imports ${path.relative(SRC, target)}. A prototype can depend only on its own folder, src/product/, and src/lib/.`;
        if (isBuild) this.error(msg); else this.warn(msg);
      }
      return resolved;
    },
  };
}
