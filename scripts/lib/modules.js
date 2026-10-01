// The modules installed in src/studio/modules/ (one folder each, with a module.ts), for the build and
// the dev server. Delete a folder and its module is gone from here too. The app finds the same
// folders with a glob (src/studio/app/data/modules.ts).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import CONFIG from '../../studio.config.ts';
import { isEnabled } from '../../src/studio/core/config.ts';
import { compatible, itemFolders, moduleProblems, sectionKeys } from '../../src/studio/core/modules/index.ts';
import { setSections } from '../../src/studio/core/roots.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIR = path.join(ROOT, 'src', 'studio', 'modules');

const ids = fs.readdirSync(DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(DIR, d.name, 'module.ts')))
  .map((d) => d.name)
  .sort();

// Every module, by id. Problems with a declaration are reported by scripts/check/check-modules.js.
export const MODULES = Object.fromEntries(await Promise.all(
  ids.map(async (id) => [id, (await import(pathToFileURL(path.join(DIR, id, 'module.ts')).href)).default]),
));

export const declarationProblems = () => ids.flatMap((id) => moduleProblems(MODULES[id], id));

// The modules studio.config.ts leaves on and that work with this platform (`requires`). A module that is off keeps its files but is skipped everywhere.
export const ENABLED_MODULES = Object.values(MODULES).filter((m) => m && isEnabled(CONFIG, m.id) && compatible(m));
export { CONFIG, isEnabled };

// App page addresses (/tools, /guide, ...), so they can't be a contributor's folder.
export const SECTION_KEYS = new Set(sectionKeys(Object.values(MODULES).filter(Boolean)));

// Absolute folders of the modules that hold prototype-shaped folders, one per id (src/tools/), and the
// Handbook's. src/prototypes/ is the platform's own and isn't listed.
export const PROTOTYPE_DIRS = itemFolders(ENABLED_MODULES, 'prototypes').map((folder) => path.join(ROOT, folder));
export const HANDBOOK_DIRS = itemFolders(ENABLED_MODULES, 'handbook').map((folder) => path.join(ROOT, folder));

// Sections of prototype-shaped folders (tools), registered so rootOf can find their folders. Installed ones
// count even when off, so their files are still found.
setSections(Object.values(MODULES).filter((m) => m?.section?.items === 'prototypes').map((m) => m.section.key));
// Their keys and folders, for the code that scans or watches them.
export const PROTOTYPE_SECTIONS = ENABLED_MODULES.filter((m) => m.section?.items === 'prototypes').map((m) => ({ key: m.section.key, dir: path.join(ROOT, m.section.folder), policy: m.section.policy, standalone: m.section.standalone === true }));

// The server.ts files of the enabled modules (routes they add to the dev server), as [id, file]. The dev
// server loads them itself, since they use the build scripts that use this file.
export const SERVER_FILES = ENABLED_MODULES
  .filter((m) => fs.existsSync(path.join(DIR, m.id, 'server.ts')))
  .map((m) => [m.id, path.join(DIR, m.id, 'server.ts')]);
