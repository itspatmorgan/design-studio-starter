// Explicit studio identity, installed module states, system registration, and the default system.
// Node scripts and the app read the same declaration.

export type StudioConfig = {
  // What the app calls itself: the rail's tooltip and every page's title.
  name: string;
  // Explicit onboarding mode; contributor ownership is identical in both modes.
  usage: 'personal' | 'team';
  // Local settings administrators. Team studios require at least one registered key.
  admins?: readonly string[];
  // One line on the front page of the deployed site, under the name, that tells a visitor what this is: "Our team's
  // prototypes and design systems." Left out, there's no line.
  tagline?: string;
  // Every installed module is declared true or false. Disabling retains its files.
  modules: Record<string, boolean>;
  // Every installed system, including Studio. A folder alone does not register a system.
  systems: readonly string[];
  // Required registered prototype system used when a prototype has no local system choice.
  defaultSystem: string;
};

// What is wrong with a config, each as a sentence that says what to fix. `modules` is the installed
// modules and whether each can be turned off, and `systems` the installed design systems' ids.
export function configProblems(config: unknown, modules: readonly { id: string; optional?: boolean }[], systems?: readonly string[], platformId: string = 'studio', contributors?: readonly string[]): string[] {
  const where = 'studio.config.ts';
  if (!config || typeof config !== 'object') return [`${where} must export a config as its default.`];
  const c = config as Partial<StudioConfig>;
  const problems: string[] = [];
  if (typeof c.name !== 'string' || !c.name.trim()) problems.push(`${where}: add a name, what the app calls itself.`);
  if (!c.usage || !['personal', 'team'].includes(c.usage)) problems.push(`${where}: usage should be personal or team.`);
  problems.push(...adminProblems(c, contributors));
  if (c.tagline !== undefined && (typeof c.tagline !== 'string' || c.tagline.length > 140)) problems.push(`${where}: tagline should be one short line of text, under 140 characters.`);
  if (typeof c.defaultSystem !== 'string' || !c.defaultSystem) problems.push(`${where}: declare defaultSystem explicitly.`);
  else if (systems && !systems.includes(c.defaultSystem)) {
    problems.push(`${where}: defaultSystem is "${c.defaultSystem}", but no system has that id. Installed: ${systems.join(', ') || 'none'}.`);
  }
  if (c.modules === undefined) problems.push(`${where}: declare every installed module as true or false in modules.`);
  else {
    if (!c.modules || typeof c.modules !== 'object' || Array.isArray(c.modules)) {
      problems.push(`${where}: modules should list module ids with true or false, like { documentation: false }.`);
    } else {
      for (const [id, on] of Object.entries(c.modules)) {
        const installed = modules.find((m) => m.id === id);
        if (!installed) problems.push(`${where}: modules lists "${id}", but no module has that id. Installed: ${modules.map((m) => m.id).join(', ') || 'none'}.`);
        else if (typeof on !== 'boolean') problems.push(`${where}: modules.${id} should be true or false.`);
        else if (!on && !installed.optional) problems.push(`${where}: the ${id} module can't be turned off yet; other parts of the app still use it.`);
      }
      for (const module of modules) if (!Object.hasOwn(c.modules, module.id)) problems.push(`${where}: declare modules.${module.id} as true or false.`);
    }
  }
  if (!Array.isArray(c.systems) || !c.systems.length || c.systems.some((id) => typeof id !== 'string') || new Set(c.systems).size !== c.systems.length) problems.push(`${where}: systems must explicitly list unique installed system ids, including the application system.`);
  else {
    if (!c.systems.includes(platformId)) problems.push(`${where}: systems must include ${platformId}.`);
    if (systems) {
      const installed = [platformId, ...systems];
      for (const id of installed) if (!c.systems.includes(id)) problems.push(`${where}: register installed system "${id}" in systems.`);
      for (const id of c.systems) if (!installed.includes(id)) problems.push(`${where}: systems lists "${id}", but it is not installed.`);
    }
    if (c.defaultSystem && !c.systems.includes(c.defaultSystem)) problems.push(`${where}: defaultSystem must be registered in systems.`);
  }
  return problems;
}

// Activation requires an explicit true; omission cannot grant a capability.
export const isEnabled = (config: Partial<StudioConfig>, id: string) => config.modules?.[id] === true;

export function adminProblems(config: Partial<StudioConfig>, contributors?: readonly string[]): string[] {
  const { admins } = config;
  if (admins === undefined && config.usage !== 'team') return [];
  if (!Array.isArray(admins) || (config.usage === 'team' && !admins.length) ||
    admins.some((key) => typeof key !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(key)) || new Set(admins).size !== admins.length) {
    return ['studio.config.ts: admins must list unique contributor keys; team use requires at least one Admin.'];
  }
  return contributors ? admins.filter((key) => !contributors.includes(key)).map((key) => `studio.config.ts: Admin "${key}" is not a registered contributor.`) : [];
}

// Local workflow roles only. This does not grant repository access or override artifact ownership.
export function studioRole(config: Partial<StudioConfig>, key: string | null, contributors: readonly string[]): 'admin' | 'contributor' | null {
  if (!key || !contributors.includes(key)) return null;
  return config.usage === 'personal' || config.admins?.includes(key) ? 'admin' : 'contributor';
}
