import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROTOTYPE_SYSTEMS, DEFAULT_SYSTEM } from '../../src/studio/modules/systems/node/systems.js';
import { ENABLED_MODULES, PROTOTYPE_DIRS } from '../lib/modules.js';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src');
const PROTOS = path.join(SRC, 'prototypes');
const ROOT = path.dirname(SRC);
// The one door into a module a prototype may use: its lib/ folder, for a module that says `lib: true`.
const LIB_DIRS = ENABLED_MODULES.filter((m) => m.lib).map((m) => path.join(SRC, 'studio', 'modules', m.id, 'lib') + path.sep);
const systemDir = (id) => path.join(ROOT, PROTOTYPE_SYSTEMS[id].dir);

// The design system a prototype uses: "system" in its meta.json, or the default.
// build-manifest.js reports a missing or invalid meta.json, so this just falls back.
function systemOf(root) {
  try {
    const system = JSON.parse(fs.readFileSync(path.join(root, 'meta.json'), 'utf8')).system ?? DEFAULT_SYSTEM;
    return system in PROTOTYPE_SYSTEMS ? system : DEFAULT_SYSTEM;
  } catch { return DEFAULT_SYSTEM; }
}

// A prototype's folder (src/prototypes/<contributor>/<id>) or a tool's (src/tools/<id>, in the folder of a
// module that holds prototype-shaped folders) that holds `file`, or null.
function prototypeRoot(file) {
  for (const dir of PROTOTYPE_DIRS) {
    const inner = path.relative(dir, file);
    if (inner.startsWith('..') || path.isAbsolute(inner)) continue;
    const [id] = inner.split(path.sep);
    return id && !id.includes('.') && inner !== id ? path.join(dir, id) : null;
  }
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
      // Plain CSS is global: it restyles the whole app and stays after you navigate away.
      // Only CSS Modules (*.module.css), which Vite scopes to the file, are allowed.
      if (/\.css($|\?)/.test(source) && !/\.module\.css($|\?)/.test(source)) {
        const msg = `Prototype scope: ${path.relative(SRC, importerPath)} imports ${source}, a global stylesheet that would restyle the whole app. Style with Tailwind classes, or rename it to *.module.css (a CSS Module) for custom CSS.`;
        if (isBuild) this.error(msg); else this.warn(msg);
      }
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (!resolved || resolved.external) return resolved;
      const target = resolved.id.split('?')[0];
      if (!path.isAbsolute(target) || target.includes('node_modules')) return resolved;
      const inOwn = target === root || target.startsWith(root + path.sep);
      const inStudio = target.startsWith(path.join(SRC, 'studio') + path.sep) && !LIB_DIRS.some((dir) => target.startsWith(dir));
      const inOtherProto = [PROTOS, ...PROTOTYPE_DIRS].some((dir) => target.startsWith(dir + path.sep)) && !inOwn;
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
