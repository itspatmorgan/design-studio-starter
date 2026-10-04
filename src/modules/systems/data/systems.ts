// The prototype design systems installed in src/systems/: one folder each, found with a glob, so the app runs with
// any of them removed. (src/modules/systems/node/systems.js finds the same folders for the build.)
import { platformSystemId, type SystemSpec } from '@/modules/systems/spec';
import { platformSourceOf } from '../sources';
import { CONFIG } from '@/platform/app/data/config';

const specs = import.meta.glob<SystemSpec>('/systems/*/system.ts', { eager: true, import: 'default' });
const idOf = (path: string) => path.split('/').at(-2)!;

export const SYSTEM_SPECS: Record<string, SystemSpec & { dir: string }> = Object.fromEntries(
  Object.entries(specs).filter(([path]) => CONFIG.systems.includes(idOf(path))).map(([path, spec]) => [idOf(path), { ...spec, dir: `src/systems/${idOf(path)}/` }]).sort(([a], [b]) => (a as string).localeCompare(b as string)),
);

export const PLATFORM_ID = platformSystemId(SYSTEM_SPECS);
export const PLATFORM_SOURCE = platformSourceOf(PLATFORM_ID, SYSTEM_SPECS[PLATFORM_ID]);

export const PROTOTYPE_SYSTEMS = Object.fromEntries(Object.entries(SYSTEM_SPECS).filter(([, spec]) => spec.role === 'prototype'));

// The system a prototype uses when its meta.json doesn't say: the explicitly configured studio.config.ts defaultSystem.
export const DEFAULT_SYSTEM: string = CONFIG.defaultSystem;
