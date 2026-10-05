import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MODULES } from '../lib/modules.js';
import { PLATFORM_ID, SYSTEM_IDS, SYSTEM_SPECS } from '../../src/modules/systems/node/systems.js';
import { loadContributors } from '../lib/contributors.js';
import { resolveContributor } from '../cli/resolve-contributor.js';
import { compatible } from '../../src/platform/core/modules/index.ts';
import { studioRole } from '../../src/platform/core/config.ts';
import { readSettings, saveSettings } from '../lib/studio-settings.js';
import { readJson, sameOrigin, send } from './files/http.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export default function settings() {
  return {
    name: 'studio-settings',
    apply: 'serve',
    configureServer(server) {
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
            // studio.config.ts is a dependency of vite.config.ts. Vite watches and restarts it;
            // explicitly restarting here would race that restart and reload the browser twice.
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
