import fs from 'node:fs';
import path from 'node:path';
import { readContributors } from './contributors.js';
import { canonicalDirectory } from './safe-paths.js';
import { readDeclaration } from '../../src/platform/core/declarations.ts';
import { resourceDirectory } from '../../src/platform/core/resourceReferences.ts';
import { jsonIdentity } from '../../src/platform/core/resourceIdentity.ts';

// Refresh from ordinary source files rather than cached module imports. CI builds
// the same directory from its before-side declarations without reading this path.
export function readResourceDirectory(root) {
  const { contributors, problems } = readContributors(root);
  if (problems.length) throw new Error(problems.join('\n'));
  // JSON.parse alone accepts duplicate keys. Identity declarations must have a
  // single unambiguous studioId, including escaped spellings of that key.
  for (const key of Object.keys(contributors)) jsonIdentity(fs.readFileSync(path.join(root, 'contributors', `${key}.json`), 'utf8'));
  const folder = path.join(root, 'src/systems');
  const systems = Object.create(null);
  if (fs.existsSync(folder)) {
    if (!canonicalDirectory(folder, root)) throw new Error('System identities require an ordinary source directory.');
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      if (entry.isSymbolicLink()) throw new Error(`System identity ${entry.name} cannot use a symbolic directory.`);
      if (!entry.isDirectory()) continue;
      const file = path.join(folder, entry.name, 'system.ts');
      if (!canonicalDirectory(path.dirname(file), root) || !fs.existsSync(file) || fs.lstatSync(file).isSymbolicLink() || !fs.lstatSync(file).isFile()) throw new Error(`${file}: system identity requires an ordinary declaration.`);
      const declaration = readDeclaration(fs.readFileSync(file, 'utf8'));
      if ('error' in declaration) throw new Error(`${file}: ${declaration.error}`);
      systems[entry.name] = declaration.value;
    }
  }
  return resourceDirectory(contributors, systems);
}
