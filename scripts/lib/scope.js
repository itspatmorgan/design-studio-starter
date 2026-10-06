import fs from 'node:fs';
import path from 'node:path';
import { inside, realFile } from './imports.js';

export const systemDocumentation = (file, dir) => file === path.join(dir, 'system.ts') || /^intro\.[jt]sx?$/.test(path.relative(dir, file)) || /\.(?:examples\.[jt]sx?|md)$/.test(file);

export function scopePolicy({ root, systems, defaultSystem, modules, prototypeDirs = [] }) {
  root = realFile(root);
  const src = path.join(root, 'src');
  const protos = path.join(src, 'prototypes');
  const shared = path.join(src, 'lib');
  const entries = Object.entries(systems).map(([id, spec]) => ({ id, dir: path.resolve(root, spec.dir) }));
  const libraries = modules.filter((m) => m.lib).map((m) => ({ ...m, dir: path.join(src, 'modules', m.id, 'lib') }));
  const prototypeRoot = (file) => {
    for (const dir of [protos, ...prototypeDirs.map(realFile)]) {
      if (!inside(file, dir)) continue;
      const parts = path.relative(dir, file).split(path.sep);
      const depth = dir === protos ? 2 : 1;
      if (parts.length <= depth || parts.slice(0, depth).some((p) => !/^[a-z0-9][a-z0-9._-]*$/i.test(p))) return null;
      return path.join(dir, ...parts.slice(0, depth));
    }
    return null;
  };
  const runtimeSystem = (file) => entries.find((s) => inside(file, s.dir) && !systemDocumentation(file, s.dir));
  const publicLibrary = (source, target) => libraries.find((m) => source === `@module/${m.id}` && /^index\.(?:[cm]?[jt]sx?)$/.test(path.relative(m.dir, target)));
  const scopeOf = (file) => {
    const proto = prototypeRoot(file);
    if (proto) {
      let system = defaultSystem; let missing = false;
      try { const meta = JSON.parse(fs.readFileSync(path.join(proto, 'meta.json'), 'utf8')); system = meta.system === undefined ? defaultSystem : meta.system; missing = meta.systemMissing?.id === system && typeof meta.systemMissing?.label === 'string' && !Object.hasOwn(systems, system); } catch { /* manifest reports invalid metadata */ }
      return { kind: 'Prototype', dir: proto, system, missing };
    }
    const system = runtimeSystem(file);
    if (system) return { kind: 'Design system', ...system };
    if (inside(file, shared)) return { kind: 'Shared utility', dir: shared };
    const lib = libraries.find((m) => inside(file, m.dir));
    return lib ? { kind: 'Module library', ...lib } : null;
  };
  return {
    scopeOf,
    problem(source, importer, target) {
      importer = realFile(importer); target = realFile(target);
      const scope = scopeOf(importer);
      if (!scope) return null;
      if (target.split(path.sep).includes('node_modules')) return null;
      const system = runtimeSystem(target);
      const lib = publicLibrary(source, target);
      const own = inside(target, scope.dir) && (scope.kind !== 'Design system' || !systemDocumentation(target, scope.dir));
      const allowed = own || (scope.kind !== 'Shared utility' && inside(target, shared)) ||
        (scope.kind === 'Prototype' && system?.id === scope.system) ||
        (lib && (scope.kind === 'Prototype' || scope.kind === 'Design system' || (scope.kind === 'Module library' && !lib.optional)));
      return allowed ? null : `${scope.kind} scope: ${path.relative(src, importer)} imports ${path.relative(src, target)} outside its runtime boundary. Use its own files, permitted shared utilities, assigned system components, or an enabled module's public @module/<id> entry.`;
    },
  };
}
