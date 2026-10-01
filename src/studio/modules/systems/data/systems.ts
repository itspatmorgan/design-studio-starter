// The prototype design systems installed in src/systems/: one folder each, found with a glob, so the app runs with
// any of them removed. (src/studio/modules/systems/node/systems.js finds the same folders for the build.)
import type { SystemSpec } from '@/studio/modules/systems/spec';
import { CONFIG } from '@/studio/app/data/config';

const specs = import.meta.glob<SystemSpec>('/systems/*/system.ts', { eager: true, import: 'default' });
const idOf = (path: string) => path.split('/').at(-2)!;

export const PROTOTYPE_SYSTEMS: Record<string, SystemSpec & { dir: string }> = Object.fromEntries(
  Object.entries(specs).map(([path, spec]) => [idOf(path), { ...spec, dir: `src/systems/${idOf(path)}/` }]).sort(([a], [b]) => (a as string).localeCompare(b as string)),
);

// The system a prototype uses when its meta.json doesn't say: studio.config.ts defaultSystem, else the first by name.
export const DEFAULT_SYSTEM: string = CONFIG.defaultSystem && CONFIG.defaultSystem in PROTOTYPE_SYSTEMS ? CONFIG.defaultSystem : Object.keys(PROTOTYPE_SYSTEMS)[0];
