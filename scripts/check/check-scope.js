// Usage:
//   node scripts/check/check-scope.js --staged           (pre-commit, never blocks)
//   node scripts/check/check-scope.js --push             (pre-push, never blocks)
//   node scripts/check/check-scope.js --ci <before> <after>   (CI, fails if out of scope)
import { changedFiles, git } from './changed-files.js';
import { resolveContributor, keyForGithub } from '../cli/resolve-contributor.js';
import { studioRole, sameSystemIdentity, parseMaintainers } from '../../src/platform/core/permissions.ts';
import { readDeclaration } from '../../src/platform/core/modules/pack.ts';
import { MODULES } from '../lib/modules.js';

const [mode, before, after, policy] = process.argv.slice(2);
const review = mode === '--ci' && policy === '--review';
const platformMaintainer = mode === '--ci' && ['admin', 'maintain'].includes(process.env.STUDIO_PLATFORM_ROLE);
let changed;
try { changed = changedFiles(mode, before, after); } catch (e) { console.error(e.message); process.exit(2); }
if (!changed) { console.error('Usage: check-scope.js --staged | --push | --ci <before> <after>'); process.exit(2); }
const { files, baseRef } = changed;
const actor = process.env.STUDIO_SCOPE_ACTOR ?? process.env.GITHUB_ACTOR;
// CI identity comes from the before-side profiles. Proposed profile edits cannot impersonate a privileged contributor.
const baseProfiles = {};
try {
  for (const file of git('ls-tree', '-r', '--name-only', baseRef ?? 'HEAD', '--', 'contributors').split('\n')) {
    const match = /^contributors\/([a-z0-9][a-z0-9-]*)\.json$/.exec(file);
    if (match) baseProfiles[match[1]] = JSON.parse(git('show', `${baseRef ?? 'HEAD'}:${file}`));
  }
} catch { /* Missing base identity is unregistered, never privileged. */ }
const key = mode === '--ci' ? keyForGithub(actor, baseProfiles) : resolveContributor();
const prefix = key ? `src/prototypes/${key}/` : null;

// An item in a section whose policy is "maintainers" (a section item, src/examples/<id>/) is changed by the people
// listed in its meta.json. The list that counts is the one before the change, so a change can't make its
// author a maintainer of someone else's. An item that is new in the change (a prototype just published)
// has no earlier list, so its own is used.
const MAINTAINED = Object.values(MODULES).filter((m) => m?.section?.policy === 'maintainers' && m.section.items === 'prototypes' && m.section.folder).map((m) => m.section.folder);
function toolMeta(ref, folder, id) {
  const file = `${folder}/${id}/meta.json`;
  try {
    const text = ref === null && mode === '--staged' ? git('show', `:${file}`) : git('show', `${ref ?? (mode === '--ci' ? after : 'HEAD')}:${file}`);
    return parseMaintainers(JSON.parse(text).maintainers);
  } catch { return null; }
}
const maintained = new Map();
function maintains(folder, id) {
  if (!key) return false;
  const name = `${folder}/${id}`;
  if (!maintained.has(name)) maintained.set(name, (((baseRef && toolMeta(baseRef, folder, id)) || toolMeta(null, folder, id)) ?? []).includes(key));
  return maintained.get(name);
}
// The maintained section and item a file is in, like ["src/examples", "sample"], or null.
function maintainedItem(f) {
  for (const folder of MAINTAINED) {
    const [id, ...rest] = f.startsWith(`${folder}/`) ? f.slice(folder.length + 1).split('/') : [];
    if (id && rest.length) return [folder, id];
  }
  return null;
}

const baseConfig = (() => { try { const result = readDeclaration(git('show', `${baseRef ?? 'HEAD'}:studio.config.ts`)); return 'error' in result ? {} : result.value; } catch { return {}; } })();
const studioAdmin = studioRole(baseConfig, key, Object.keys(baseProfiles)) === 'admin';
const systemScope = f => {
  const match = /^src\/systems\/([^/]+)\//.exec(f);
  if (!match || !key || !baseConfig.systems?.includes(match[1]) || !baseConfig.systemMaintainers?.[match[1]]?.includes(key)) return false;
  try {
    const declarationFile = 'src/systems/' + match[1] + '/system.ts';
    const spec = readDeclaration(git('show', `${baseRef ?? 'HEAD'}:${declarationFile}`));
    if ('error' in spec || spec.value.role !== 'prototype' || spec.value.status !== 'active') return false;
    if (f === declarationFile) {
      const next = readDeclaration(mode === '--staged' ? git('show', ':' + f) : git('show', `${after ?? 'HEAD'}:${f}`));
      return !('error' in next) && sameSystemIdentity(spec.value, next.value);
    }
    return true;
  } catch { return false; }
};
const isInScope = (f) => studioAdmin || systemScope(f) || (prefix && f.startsWith(prefix)) || (key && f === `contributors/${key}.json`) || ((m) => Boolean(m) && maintains(...m))(maintainedItem(f));
const inScope = files.filter(isInScope);
const platform = files.filter((f) => !isInScope(f));

const who = key ?? (mode === '--ci' ? `unknown actor "${actor ?? ''}"` : 'unknown contributor');
console.log(`Scope check (${who}): ${inScope.length} in scope, ${platform.length} outside assigned scope.`);
if (!key) console.log('  Not registered in contributors/, so every file counts as out of scope.');
for (const f of platform) console.log(`  ${f.startsWith('src/systems/') ? 'system' : f.startsWith('src/modules/') ? 'module' : f.startsWith('src/prototypes/') ? 'prototype' : 'platform'}: ${f}`);

if (platform.length && review) console.log('  Platform changes require maintainer review before merging. Configure required reviews on main.');
if (platform.length && platformMaintainer) console.log('  Platform changes accepted from a repository admin or maintainer.');
if (mode === '--ci' && platform.length && !review && !platformMaintainer) process.exit(1);
process.exit(0);
