// The design systems installed in src/systems/ (one folder each, with a system.ts), for the build and the dev
// server. Delete a folder and its system is gone from here too. The app finds the same folders with a glob
// (src/studio/modules/systems/data/systems.ts). The app's own system (Studio) is added to SYSTEM_SOURCES, since the Systems
// pages document it too.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import CONFIG from '../../../../../studio.config.ts';
import { STUDIO_ID, STUDIO_SOURCE, sourceOf } from '../sources.ts';
import { systemProblems } from '../spec.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..');
const DIR = path.join(ROOT, 'src', 'systems');

const ids = fs.existsSync(DIR)
  ? fs.readdirSync(DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(DIR, d.name, 'system.ts')))
    .map((d) => d.name)
    .sort()
  : [];

// Every prototype system, by id: its system.ts and its folder. Problems with a declaration are reported by
// scripts/check/check-modules.js.
export const PROTOTYPE_SYSTEMS = Object.fromEntries(await Promise.all(
  ids.map(async (id) => {
    const spec = (await import(pathToFileURL(path.join(DIR, id, 'system.ts')).href)).default;
    return [id, { ...spec, dir: `src/systems/${id}/` }];
  }),
));

// The system a prototype uses when its meta.json doesn't say: studio.config.ts defaultSystem, else the first by name.
export const DEFAULT_SYSTEM = CONFIG.defaultSystem in PROTOTYPE_SYSTEMS ? CONFIG.defaultSystem : ids[0];

export const SYSTEM_SOURCES = {
  ...Object.fromEntries(ids.map((id) => [id, sourceOf(id, PROTOTYPE_SYSTEMS[id])])),
  [STUDIO_ID]: STUDIO_SOURCE,
};

export const systemDeclarationProblems = () => ids.flatMap((id) => systemProblems(PROTOTYPE_SYSTEMS[id], id));
export const SYSTEM_IDS = ids;
