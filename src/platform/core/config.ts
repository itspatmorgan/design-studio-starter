// studio.config.ts: the few things nearly every team changes, and nothing else. Everything else is code,
// because a team owns the whole repo. A module's own defaults apply to anything left out, so a fresh
// config is nearly empty. Has no imports, so Node scripts and the app can both load it.

export type StudioConfig = {
  // What the app calls itself: the rail's tooltip and every page's title.
  name: string;
  // Onboarding guidance only; contributor ownership is identical in both modes. Left out, team.
  usage?: 'personal' | 'team';
  // One line on the front page of the deployed site, under the name, that tells a visitor what this is: "Our team's
  // prototypes, tools and design systems." Left out, there's no line.
  tagline?: string;
  // Modules to turn off, by id: { guide: false }. A module left out is on. Turning one off keeps its
  // files, so turning it on again is one line; to remove it for good, delete its folder.
  modules?: Record<string, boolean>;
  // The design system a prototype uses when its meta.json doesn't name one: an id from src/systems/. Left out,
  // it's the first by name.
  defaultSystem?: string;
};

// What is wrong with a config, each as a sentence that says what to fix. `modules` is the installed
// modules and whether each can be turned off, and `systems` the installed design systems' ids.
export function configProblems(config: unknown, modules: readonly { id: string; optional?: boolean }[], systems?: readonly string[]): string[] {
  const where = 'studio.config.ts';
  if (!config || typeof config !== 'object') return [`${where} must export a config as its default.`];
  const c = config as Partial<StudioConfig>;
  const problems: string[] = [];
  if (typeof c.name !== 'string' || !c.name.trim()) problems.push(`${where}: add a name, what the app calls itself.`);
  if (c.usage !== undefined && !['personal', 'team'].includes(c.usage)) problems.push(`${where}: usage should be personal or team.`);
  if (c.tagline !== undefined && (typeof c.tagline !== 'string' || c.tagline.length > 140)) problems.push(`${where}: tagline should be one short line of text, under 140 characters.`);
  if (c.defaultSystem !== undefined && systems && !systems.includes(c.defaultSystem)) {
    problems.push(`${where}: defaultSystem is "${c.defaultSystem}", but no system has that id. Installed: ${systems.join(', ') || 'none'}.`);
  }
  if (c.modules !== undefined) {
    if (!c.modules || typeof c.modules !== 'object' || Array.isArray(c.modules)) {
      problems.push(`${where}: modules should list module ids with true or false, like { guide: false }.`);
    } else {
      for (const [id, on] of Object.entries(c.modules)) {
        const installed = modules.find((m) => m.id === id);
        if (!installed) problems.push(`${where}: modules lists "${id}", but no module has that id. Installed: ${modules.map((m) => m.id).join(', ') || 'none'}.`);
        else if (typeof on !== 'boolean') problems.push(`${where}: modules.${id} should be true or false.`);
        else if (!on && !installed.optional) problems.push(`${where}: the ${id} module can't be turned off yet; other parts of the app still use it.`);
      }
    }
  }
  return problems;
}

// Whether a module is on: every module is, unless the config turns it off.
export const isEnabled = (config: StudioConfig, id: string) => config.modules?.[id] !== false;
