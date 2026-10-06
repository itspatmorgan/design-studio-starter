import fs from 'node:fs';
import path from 'node:path';
import { KEY } from '../../../../scripts/lib/contributors.js';
import { applySetupChanges } from '../../../../scripts/lib/studio-setup.js';

// The server supplies the resolved contributor; requests cannot select a profile.
export function claimWelcome(root, contributor) {
  if (contributor === null) return null; // Exploration before registration uses browser state.
  if (typeof contributor !== 'string' || !KEY.test(contributor)) throw new Error('Invalid contributor key.');
  const profiles = path.join(root, 'contributors');
  if (fs.existsSync(profiles) && (!fs.lstatSync(profiles).isDirectory() || fs.lstatSync(profiles).isSymbolicLink())) throw new Error('Contributor profiles must use an ordinary directory.');
  const profile = path.join(profiles, `${contributor}.json`);
  const registry = path.join(root, 'contributors.json');
  const read = file => {
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Contributor profile must be an ordinary file.');
    const source = fs.readFileSync(file, 'utf8');
    const value = JSON.parse(source);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Contributor profile must be an object.');
    return { source, value };
  };
  const roster = fs.existsSync(registry) ? read(registry) : null;
  const individual = fs.existsSync(profile) ? read(profile) : null;
  const inRoster = roster && Object.hasOwn(roster.value, contributor);
  if (individual && inRoster) throw new Error('Contributor is registered in two files. Keep one.');
  const entry = individual?.value ?? (inRoster ? roster.value[contributor] : null);
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('Contributor is not registered.');
  if (entry.welcomeDismissed !== undefined && typeof entry.welcomeDismissed !== 'boolean') throw new Error('Contributor welcomeDismissed must be true or false.');
  if (entry.welcomeDismissed === true) return false;
  const file = individual ? profile : registry;
  const { source, value } = individual ?? roster;
  const next = { ...entry, welcomeDismissed: true };
  const after = JSON.stringify(individual ? next : { ...value, [contributor]: next }, null, 2) + '\n';
  applySetupChanges([{ file, before: source, after }]);
  return true;
}
