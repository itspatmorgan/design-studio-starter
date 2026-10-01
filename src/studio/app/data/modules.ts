// The modules installed in src/studio/modules/: one folder each, found with a glob, so the app runs
// with any of them removed. (scripts/lib/modules.js finds the same folders for the build.)
import type { ModuleSpec } from '@/studio/modules';

const specs = import.meta.glob<ModuleSpec>('/studio/modules/*/module.ts', { eager: true, import: 'default' });

export const MODULES: ModuleSpec[] = Object.values(specs);
export const moduleById = (id: string) => MODULES.find((m) => m.id === id);
