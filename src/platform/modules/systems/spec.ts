// A design system prototypes build with is a folder in src/systems/<id>/ with a system.ts that says what it is,
// next to its components/ and styles/theme.css. The build, the dev server and the app all find the systems by
// their folders; studio.config.ts explicitly registers each installed system.
// The Platform system lives in src/systems/platform/ and declares role: 'platform'; prototypes
// never use it (src/platform/modules/systems/sources.ts). This file has no imports, so Node scripts and the app can load it.

export type ColorMode = 'light' | 'dark';

// Resolve global mode against the system's explicitly declared supported modes.
export function systemColorMode(supported: readonly ColorMode[], global: ColorMode): ColorMode {
  const modes = supported;
  if (!modes.length) throw new Error('A system must declare at least one color mode.');
  return modes.includes(global) ? global : modes[0];
}

// How the build treats a component without examples or a description (systemDocs.ts): 'warn' says
// so, 'strict' fails the build, and 'off' says nothing.
export type DocsMode = 'warn' | 'strict' | 'off';

export type SystemSpec = {
  role: 'platform' | 'prototype';
  label: string;               // "Product"
  // The class its theme is set under, like "product-theme". Its styles/theme.css may set values only under
  // this class, so it can't leak into the app UI or another system.
  themeClass: string;
  colorModes: readonly ColorMode[];
  docs: DocsMode;
  // Where its components come from. 'shadcn' gives each component page a link to that component's
  // shadcn/ui docs; a page can set its own link with `docs:` in its frontmatter. Use null for a
  // system that isn't shadcn/ui; declare null instead.
  origin: 'shadcn' | null;
};

const ID = /^[a-z][a-z0-9-]*$/;
const CLASS = /^[a-z][a-z0-9-]*$/;

// What is wrong with a system's system.ts, each as a sentence that says what to fix. `folder` is the folder it
// was found in, which is also its id.
export function systemProblems(spec: unknown, folder: string): string[] {
  const where = `src/systems/${folder}/system.ts`;
  if (!ID.test(folder)) return [`src/systems/${folder}/: a system's folder should be lowercase letters, numbers, and dashes, starting with a letter.`];
  if (!spec || typeof spec !== 'object') return [`${where} must export a system as its default.`];
  const s = spec as Partial<SystemSpec>;
  const problems: string[] = [];
  if (folder === 'platform' && s.role !== 'platform') problems.push(where + ": platform is the app's own system and must declare role: 'platform'.");
  if (!s.role || !['platform', 'prototype'].includes(s.role)) problems.push(where + ": role must be 'platform' or 'prototype'.");
  if (folder !== 'platform' && s.role === 'platform') problems.push(where + ": only the built-in platform system may declare role: 'platform'.");
  if (typeof s.label !== 'string' || !s.label.trim()) problems.push(`${where}: add a label, the name people see.`);
  if (typeof s.themeClass !== 'string' || !CLASS.test(s.themeClass)) problems.push(`${where}: themeClass should be a CSS class name like "${folder}-theme".`);
  if (!Array.isArray(s.colorModes) || !s.colorModes.length || s.colorModes.some((mode) => !['light', 'dark'].includes(mode)) || new Set(s.colorModes).size !== s.colorModes.length) problems.push(`${where}: colorModes must be a nonempty list of unique 'light' or 'dark' modes.`);
  if (!s.docs || !['warn', 'strict', 'off'].includes(s.docs)) problems.push(`${where}: docs should be 'warn', 'strict', or 'off'.`);
  if (s.origin !== null && s.origin !== 'shadcn') problems.push(`${where}: origin should be 'shadcn', or explicitly null.`);
  return problems;
}

// A theme scope is shared by every mounted instance of one system, never by different systems.
export function themeClassProblems(systems: Record<string, Partial<SystemSpec>>): string[] {
  const seen = new Map<string, string>();
  const problems: string[] = [];
  for (const [id, spec] of Object.entries(systems)) {
    if (!spec.themeClass) continue;
    if (['dark', 'light'].includes(spec.themeClass) || spec.themeClass === 'platform-theme' && id !== 'platform') problems.push(`${id}: themeClass ${spec.themeClass} is reserved by the platform.`);
    if (seen.has(spec.themeClass)) problems.push(`${id} and ${seen.get(spec.themeClass)} use the same themeClass ${spec.themeClass}. Give each system its own scope.`);
    seen.set(spec.themeClass, id);
  }
  return problems;
}
