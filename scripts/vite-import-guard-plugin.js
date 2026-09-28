import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROTOTYPE_SYSTEMS, DEFAULT_SYSTEM } from '../src/systems.ts';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');
const PROTOS = path.join(SRC, 'prototypes');
const ROOT = path.dirname(SRC);
const systemDir = (id) => path.join(ROOT, PROTOTYPE_SYSTEMS[id].dir);

// The design system a prototype uses: "system" in its meta.json, or the default.
// build-manifest.js reports a missing or invalid meta.json, so this just falls back.
function systemOf(root) {
  try {
    const system = JSON.parse(fs.readFileSync(path.join(root, 'meta.json'), 'utf8')).system ?? DEFAULT_SYSTEM;
    return system in PROTOTYPE_SYSTEMS ? system : DEFAULT_SYSTEM;
  } catch { return DEFAULT_SYSTEM; }
}

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
      // Another prototype system than the one in the prototype's meta.json.
      const system = systemOf(root);
      const otherSystem = Object.keys(PROTOTYPE_SYSTEMS).find((id) => id !== system && target.startsWith(systemDir(id)));
      if (otherSystem) {
        const msg = `Prototype scope: ${path.relative(SRC, importerPath)} imports ${path.relative(SRC, target)}, from the ${otherSystem} system, but the prototype uses the ${system} system. A prototype can depend only on its own folder, its design system, and src/lib/. To build it with ${otherSystem}, set "system": "${otherSystem}" in its meta.json.`;
        if (isBuild) this.error(msg); else this.warn(msg);
      }
      if (inStudio || inOtherProto) {
        const msg = `Prototype scope: ${path.relative(SRC, importerPath)} imports ${path.relative(SRC, target)}. A prototype can depend only on its own folder, its design system, and src/lib/.`;
        if (isBuild) this.error(msg); else this.warn(msg);
      }
      return resolved;
    },
  };
}
