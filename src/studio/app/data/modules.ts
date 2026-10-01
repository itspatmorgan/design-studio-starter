// The modules installed in src/studio/modules/: one folder each, found with a glob, so the app runs
// with any of them removed. (scripts/lib/modules.js finds the same folders for the build.)
import type { ModuleSpec } from '@/studio/modules';
import { setSections } from '@/studio/roots';

const specs = import.meta.glob<ModuleSpec>('/studio/modules/*/module.ts', { eager: true, import: 'default' });

export const MODULES: ModuleSpec[] = Object.values(specs);
export const moduleById = (id: string) => MODULES.find((m) => m.id === id);

// rootOf (src/studio/roots.ts) needs the sections of prototype-shaped folders; this runs before anything asks.
setSections(MODULES.filter((m) => m.section?.items === 'prototypes').map((m) => m.section!.key));
// Whether a section's items open on their own, filling the window, on the deployed site (a published tool).
export const isStandalone = (key: string) => MODULES.some((m) => m.section?.key === key && m.section.standalone);
