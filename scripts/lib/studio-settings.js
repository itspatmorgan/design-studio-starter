import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { configProblems, studioRole } from '../../src/platform/core/config.ts';
import { compatible } from '../../src/platform/core/modules/index.ts';
import { agentsBlock, applyAgentsBlock, readDeclaration } from '../../src/platform/core/modules/pack.ts';
import { applySetupChanges, editStudioConfig, pinImplicitSystems } from './studio-setup.js';

export class SettingsError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

// Read current configuration on each request; imported config can be stale until Vite restarts.
export function readSettings(root, contributors) {
  const file = path.join(root, 'studio.config.ts');
  const source = fs.readFileSync(file, 'utf8');
  const declaration = readDeclaration(source);
  if ('error' in declaration) throw new SettingsError(`Open studio.config.ts in your editor: ${declaration.error}`);
  const config = declaration.value;
  const version = createHash('sha256').update(source).update(JSON.stringify(contributors)).digest('hex');
  return { config, version, source, file };
}

// One plan for the CLI and browser: validate, preserve implicit assignments, and sync agent routes.
export function planSettings({ root, modules, systems, platformId, contributors, changes, base, actor, requireAdmin = false }) {
  const current = readSettings(root, contributors);
  if (requireAdmin && studioRole(current.config, actor, Object.keys(contributors)) !== 'admin') {
    throw new SettingsError('Only an Admin can change studio settings.', 403);
  }
  if (base !== undefined && base !== current.version) throw new SettingsError('Settings or contributors changed. Reload settings before saving.', 409);
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) throw new SettingsError('Settings changes must be an object.');
  const allowed = ['name', 'tagline', 'usage', 'defaultSystem', 'admins', 'modules'];
  if (Object.keys(changes).some((key) => !allowed.includes(key))) throw new SettingsError('Only basic settings, module states, and Admin assignments can be changed here.');
  const next = { ...current.config, ...changes };
  if (Object.hasOwn(changes, 'modules')) {
    if (!changes.modules || typeof changes.modules !== 'object' || Array.isArray(changes.modules)) throw new SettingsError('Module states must be an object.');
    next.modules = { ...current.config.modules, ...changes.modules };
  }
  const problems = configProblems(next, modules, systems, platformId, Object.keys(contributors));
  for (const module of modules) {
    if (next.modules?.[module.id] === true && current.config.modules?.[module.id] !== true && !compatible(module)) problems.push(`${module.label} is incompatible with this platform version.`);
  }
  if (problems.length) throw new SettingsError(problems.join('\n'));
  const changed = Object.fromEntries(Object.entries(changes).filter(([key]) => key !== 'modules' && JSON.stringify(next[key]) !== JSON.stringify(current.config[key])));
  const moduleChanges = Object.fromEntries(Object.entries(changes.modules ?? {}).filter(([id, on]) => current.config.modules?.[id] !== on));
  if (Object.keys(moduleChanges).length) changed.modules = moduleChanges;
  const source = Object.keys(changed).length ? editStudioConfig(current.source, changed) : current.source;
  const pins = next.defaultSystem !== current.config.defaultSystem
    ? pinImplicitSystems(root, current.config.defaultSystem, modules) : [];
  const edits = [...pins, { file: current.file, before: current.source, after: source }];
  const agents = path.join(root, 'AGENTS.md');
  if (fs.existsSync(agents)) {
    const before = fs.readFileSync(agents, 'utf8');
    edits.push({ file: agents, before, after: applyAgentsBlock(before, agentsBlock(modules.filter((m) => next.modules[m.id] === true && compatible(m)), platformId)) });
  }
  return { config: next, edits: edits.filter((edit) => edit.before !== edit.after), pins };
}

export function saveSettings(options) {
  if (typeof options.base !== 'string') throw new SettingsError('Reload settings before saving.', 409);
  const plan = planSettings({ ...options, requireAdmin: true });
  applySetupChanges(plan.edits);
  return plan;
}
