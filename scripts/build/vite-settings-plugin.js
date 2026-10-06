import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MODULES } from '../lib/modules.js';
import { PLATFORM_ID, SYSTEM_IDS, SYSTEM_SPECS } from '../../src/modules/systems/node/systems.js';
import { loadContributors } from '../lib/contributors.js';
import { resolveContributor } from '../cli/resolve-contributor.js';
import { compatible } from '../../src/platform/core/modules/index.ts';
import { studioRole } from '../../src/platform/core/config.ts';
import { readSettings, saveSettings } from '../lib/studio-settings.js';
import { readJson, sameOrigin, send } from './files/http.js';
import { readDeclaration } from '../../src/platform/core/modules/pack.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// Never hide changes to other settings or an invalid declaration.
export function welcomeOnlyChange(before, after) {
  const previous = readDeclaration(before), next = readDeclaration(after);
  if ('error' in previous || 'error' in next) return false;
  if (!previous.value || !next.value || typeof previous.value !== 'object' || typeof next.value !== 'object' || Array.isArray(previous.value) || Array.isArray(next.value)) return false;
  const { welcomeDismissed: oldFlag, ...oldSettings } = previous.value;
  const { welcomeDismissed: newFlag, ...newSettings } = next.value;
  if ([oldFlag, newFlag].some(flag => flag !== undefined && typeof flag !== 'boolean')) return false;
  return JSON.stringify(oldSettings) === JSON.stringify(newSettings);
}

export default function settings() {
  const configFile = path.join(ROOT, 'studio.config.ts');
  let previousSource;
  return {
    name: 'studio-settings',
    apply: 'serve',
    async hotUpdate({ file, read, server }) {
      if (file !== configFile) return;
      const next = await read();
      const quiet = welcomeOnlyChange(previousSource, next);
      previousSource = next;
      if (!quiet) await server.restart();
      return [];
    },
    configureServer(server) {
      // Own this one dependency's updates so recording first display doesn't interrupt Welcome.
      server.config.configFileDependencies = server.config.configFileDependencies.filter(file => file !== configFile);
      server.watcher.add(configFile);
      previousSource = fs.readFileSync(configFile, 'utf8');
      server.middlewares.use('/__studio/settings', async (req, res) => {
        if (!sameOrigin(req)) return send(res, 403, { error: 'Only the app can use this.' });
        try {
          const contributors = loadContributors();
          const actor = resolveContributor();
          const options = { root: ROOT, contributors, modules: Object.values(MODULES), systems: SYSTEM_IDS, platformId: PLATFORM_ID };
          if (req.method === 'GET') {
            const { config, version } = readSettings(ROOT, contributors);
            return send(res, 200, {
              config, version, actor, role: studioRole(config, actor, Object.keys(contributors)),
              contributors: Object.entries(contributors).map(([key, person]) => ({ key, name: person.name, github: person.github ?? '' })),
              modules: options.modules.map((m) => ({ id: m.id, label: m.label, description: m.description, optional: m.optional, compatible: compatible(m) })),
              systems: SYSTEM_IDS.map((id) => ({ id, label: SYSTEM_SPECS[id].label })),
            });
          }
          if (req.method === 'POST') {
            const { changes, base } = await readJson(req);
            const plan = saveSettings({ ...options, actor, changes, base });
            // The config hotUpdate hook restarts for settings changes. Welcome progress alone
            // stays in place; explicitly restarting here would race that hook.
            send(res, 200, { saved: true, restarting: plan.edits.some((edit) => edit.file === path.join(ROOT, 'studio.config.ts')) });
            return;
          }
          return send(res, 405, { error: 'Use GET or POST for studio settings.' });
        } catch (error) {
          return send(res, error.status ?? 500, { error: error.message });
        }
      });
    },
  };
}
