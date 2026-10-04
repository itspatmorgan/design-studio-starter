// The design systems installed in src/systems/ (one folder each, with a system.ts), for the build and the dev
// server. Delete a folder and its system is gone from here too. The app finds the same folders with a glob
// (src/modules/systems/data/systems.ts). The app's own system (Studio) is added to SYSTEM_SOURCES, since the Systems
// pages document it too.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import CONFIG from '../../../../studio.config.ts';
import { platformSourceOf, sourceOf } from '../sources.ts';
import { platformSystemId, systemProblems, themeClassProblems } from '../spec.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const DIR = path.join(ROOT, 'src', 'systems');

const ids = fs.existsSync(DIR)
  ? fs.readdirSync(DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(DIR, d.name, 'system.ts')))
    .map((d) => d.name)
    .sort()
  : [];

// Every prototype system, by id: its system.ts and its folder. Problems with a declaration are reported by
// scripts/check/check-modules.js.
export const SYSTEM_SPECS = Object.fromEntries(await Promise.all(
  ids.map(async (id) => {
    const spec = (await import(pathToFileURL(path.join(DIR, id, 'system.ts')).href)).default;
    return [id, { ...spec, dir: `src/systems/${id}/` }];
  }),
));

export const PLATFORM_ID = platformSystemId(SYSTEM_SPECS);
export const PLATFORM_SOURCE = platformSourceOf(PLATFORM_ID, SYSTEM_SPECS[PLATFORM_ID]);

export const PROTOTYPE_SYSTEMS = Object.fromEntries(Object.entries(SYSTEM_SPECS).filter(([id, spec]) => CONFIG.systems?.includes(id) && id !== PLATFORM_ID && spec.role === 'prototype'));
const prototypeIds = ids.filter((id) => SYSTEM_SPECS[id].role === 'prototype');

// The system a prototype uses when its meta.json doesn't say: the explicitly configured studio.config.ts defaultSystem.
export const DEFAULT_SYSTEM = CONFIG.defaultSystem;

export const SYSTEM_SOURCES = {
  ...Object.fromEntries(ids.filter((id) => CONFIG.systems?.includes(id)).map((id) => [id, sourceOf(id, SYSTEM_SPECS[id])])),
  [PLATFORM_ID]: PLATFORM_SOURCE,
};

export const systemDeclarationProblems = () => [...ids.flatMap((id) => systemProblems(SYSTEM_SPECS[id], id)), ...themeClassProblems(SYSTEM_SPECS)];
export const SYSTEM_IDS = prototypeIds;
