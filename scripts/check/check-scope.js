// Usage:
//   node scripts/check/check-scope.js --staged           (pre-commit, never blocks)
//   node scripts/check/check-scope.js --push             (pre-push, never blocks)
//   node scripts/check/check-scope.js --ci <before> <after>   (CI, fails if out of scope)
import path from 'node:path';
import { changedFiles, git } from './changed-files.js';
import { resolveContributor, keyForGithub } from '../cli/resolve-contributor.js';
import { parseMaintainers } from '../../src/platform/core/permissions.ts';
import { MODULES } from '../lib/modules.js';

const [mode, before, after, policy] = process.argv.slice(2);
const review = mode === '--ci' && policy === '--review';
const platformMaintainer = mode === '--ci' && ['admin', 'maintain'].includes(process.env.STUDIO_PLATFORM_ROLE);
let changed;
try { changed = changedFiles(mode, before, after); } catch (e) { console.error(e.message); process.exit(2); }
if (!changed) { console.error('Usage: check-scope.js --staged | --push | --ci <before> <after>'); process.exit(2); }
const { files, baseRef } = changed;
const actor = process.env.STUDIO_SCOPE_ACTOR ?? process.env.GITHUB_ACTOR;
const key = mode === '--ci' ? keyForGithub(actor) : resolveContributor();
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

const isInScope = (f) => (prefix && f.startsWith(prefix)) || (key && f === `contributors/${key}.json`) || ((m) => Boolean(m) && maintains(...m))(maintainedItem(f));
const inScope = files.filter(isInScope);
const platform = files.filter((f) => !isInScope(f));

const who = key ?? (mode === '--ci' ? `unknown actor "${actor ?? ''}"` : 'unknown contributor');
console.log(`Scope check (${who}): ${inScope.length} in scope, ${platform.length} platform.`);
if (!key) console.log('  Not registered in contributors/, so every file counts as out of scope.');
for (const f of platform) console.log(`  platform: ${f}`);

if (platform.length && review) console.log('  Platform changes require maintainer review before merging. Configure required reviews on main.');
if (platform.length && platformMaintainer) console.log('  Platform changes accepted from a repository admin or maintainer.');
if (mode === '--ci' && platform.length && !review && !platformMaintainer) process.exit(1);
process.exit(0);
