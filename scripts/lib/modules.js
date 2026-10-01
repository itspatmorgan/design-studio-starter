// The modules installed in src/studio/modules/ (one folder each, with a module.ts), for the build and
// the dev server. Delete a folder and its module is gone from here too. The app finds the same
// folders with a glob (src/studio/app/data/modules.ts).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { moduleProblems, sectionKeys } from '../../src/studio/modules/index.ts';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/studio/modules');

const ids = fs.readdirSync(DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(DIR, d.name, 'module.ts')))
  .map((d) => d.name)
  .sort();

// Every module, by id. Problems with a declaration are reported by scripts/check-modules.js.
export const MODULES = Object.fromEntries(await Promise.all(
  ids.map(async (id) => [id, (await import(pathToFileURL(path.join(DIR, id, 'module.ts')).href)).default]),
));

export const declarationProblems = () => ids.flatMap((id) => moduleProblems(MODULES[id], id));

// App page addresses (/tools, /guide, ...), so they can't be a contributor's folder.
export const SECTION_KEYS = new Set(sectionKeys(Object.values(MODULES).filter(Boolean)));
