import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROTOTYPE_SYSTEMS, DEFAULT_SYSTEM } from '../../src/platform/modules/systems/node/systems.js';
import { ENABLED_MODULES, PROTOTYPE_DIRS } from '../lib/modules.js';
import { scopePolicy } from '../lib/scope.js';
import { importsOf } from '../lib/imports.js';
import { cssProblems } from '../lib/css-scope.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export default function importGuard() {
  const policy = scopePolicy({ root: ROOT, systems: PROTOTYPE_SYSTEMS, defaultSystem: DEFAULT_SYSTEM, modules: ENABLED_MODULES, prototypeDirs: PROTOTYPE_DIRS });
  return {
    name: 'prototype-import-guard',
    enforce: 'pre',
    configResolved() {},
    async resolveId(source, importer, options) {
      if (!importer || importer.includes('\0')) return null;
      const file = importer.split('?')[0];
      // Theme imports are recursively validated by the CSS plugin before loading.
      if (/\.css$/.test(file) && !/\.module\.css$/.test(file)) return null;
      const scope = policy.scopeOf(file);
      if (!scope) return null;
      if (/\.css($|\?)/.test(source) && !/\.module\.css($|\?)/.test(source)) this.error(`${scope.kind} scope: ${file} imports global CSS. Use CSS Modules for runtime styles; design-system themes are loaded by the platform.`);
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (!resolved || resolved.external || !path.isAbsolute(resolved.id)) return resolved;
      const problem = policy.problem(source, file, resolved.id.split('?')[0]);
      if (problem) this.error(problem);
      return resolved;
    },
    transform(code, id) {
      const file = id.split('?')[0];
      const scope = policy.scopeOf(file);
      if (!scope) return null;
      if (/\.module\.css$/.test(file)) {
        const problems = cssProblems(code, { file, mode: 'module' });
        if (problems.length) this.error(problems.join('\n'));
      } else if (/\.[cm]?[jt]sx?$/.test(file) && importsOf(code, file).some((i) => !i.typeOnly && i.source === null)) {
        this.error(`${scope.kind} scope: computed imports in ${file} cannot be checked. Use literal import paths.`);
      }
      return null;
    },
  };
}
