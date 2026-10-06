import fs from 'node:fs';
import path from 'node:path';
import { readSettings } from '../../../../scripts/lib/studio-settings.js';
import { applySetupChanges, editStudioConfig } from '../../../../scripts/lib/studio-setup.js';

// Local, studio-wide first-display state. No request can select a filesystem path.
export function claimWelcome(root) {
  const file = path.join(root, 'studio.config.ts');
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Studio configuration must be an ordinary file.');
  const { source, config } = readSettings(root, {});
  if (!config || typeof config !== 'object' || Array.isArray(config) || (config.welcomeDismissed !== undefined && typeof config.welcomeDismissed !== 'boolean')) throw new Error('welcomeDismissed must be true or false.');

  // Migrate only the empty marker written by the previous implementation.
  const marker = path.join(root, '.design-studio-welcome-dismissed');
  let legacy = false;
  try {
    const old = fs.lstatSync(marker);
    if (!old.isFile() || old.isSymbolicLink() || old.size !== 0) throw new Error('The old Welcome marker is not an empty ordinary file.');
    legacy = true;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const show = config.welcomeDismissed !== true && !legacy;
  if (config.welcomeDismissed !== true) {
    applySetupChanges([{ file, before: source, after: editStudioConfig(source, { welcomeDismissed: true }) }]);
  }
  if (legacy) fs.unlinkSync(marker);
  return show;
}
