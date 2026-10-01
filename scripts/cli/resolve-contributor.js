import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { loadContributors } from '../lib/contributors.js';

export { loadContributors };

function run(cmd, args) {
  try { return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return ''; }
}

/** Key for a GitHub username (used by CI with GITHUB_ACTOR). */
export function keyForGithub(login, contributors = loadContributors()) {
  if (!login) return null;
  const l = login.toLowerCase();
  return Object.keys(contributors).find((k) => contributors[k].github?.toLowerCase() === l) ?? null;
}

/** Current contributor's key: GitHub username via gh, then Git name. */
export function resolveContributor() {
  const contributors = loadContributors();
  const byGh = keyForGithub(run('gh', ['api', 'user', '--jq', '.login']), contributors);
  if (byGh) return byGh;
  const name = run('git', ['config', 'user.name']).toLowerCase();
  if (!name) return null;
  return Object.keys(contributors).find((k) => contributors[k].name?.toLowerCase() === name) ?? null;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const key = resolveContributor();
  if (!key) {
    console.error('Not a contributor yet. Run `pnpm join` to add yourself.');
    process.exit(1);
  }
  console.log(key);
}
