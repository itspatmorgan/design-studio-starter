// Usage:
//   node scripts/check-scope.js --staged           (pre-commit, never blocks)
//   node scripts/check-scope.js --push             (pre-push, never blocks)
//   node scripts/check-scope.js --ci <before> <after>   (CI, fails if out of scope)
import { changedFiles, git } from './changed-files.js';
import { resolveContributor, keyForGithub } from './resolve-contributor.js';
import { parseMaintainers } from '../src/studio/permissions.ts';
import { MODULES } from './lib/modules.js';

const [mode, before, after] = process.argv.slice(2);
let changed;
try { changed = changedFiles(mode, before, after); } catch (e) { console.error(e.message); process.exit(2); }
if (!changed) { console.error('Usage: check-scope.js --staged | --push | --ci <before> <after>'); process.exit(2); }
// baseRef is the "before" side of the change, so contributors.json can be compared.
const { files, baseRef } = changed;
const key = mode === '--ci' ? keyForGithub(process.env.GITHUB_ACTOR) : resolveContributor();
const prefix = key ? `src/prototypes/${key}/` : null;
// contributors.json at a ref (null means the working version being checked).
function contributorsAt(ref) {
  try {
    if (ref === null && mode === '--staged') return JSON.parse(git('show', ':contributors.json'));
    if (ref === null) return JSON.parse(git('show', `${mode === '--ci' ? after : 'HEAD'}:contributors.json`));
    return JSON.parse(git('show', `${ref}:contributors.json`));
  } catch { return {}; }
}

// Adding or editing only your own entry in contributors.json counts as in scope,
// so joining (pnpm join) doesn't get flagged as a platform change.
function onlyOwnEntryChanged() {
  if (!key || !baseRef) return false;
  const before = contributorsAt(baseRef);
  const now = contributorsAt(null);
  const others = (o) => JSON.stringify(Object.entries(o).filter(([k]) => k !== key).sort());
  return others(before) === others(now);
}

// An item in a section whose policy is "maintainers" (a tool, src/tools/<id>/) is changed by the people
// listed in its meta.json. The list that counts is the one before the change, so a change can't make its
// author a maintainer of someone else's. An item that is new in the change (a prototype just published)
// has no earlier list, so its own is used.
const MAINTAINED = Object.values(MODULES).filter((m) => m?.section?.policy === 'maintainers' && m.section.items === 'prototypes').map((m) => m.section.folder);
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
// The maintained section and item a file is in, like ["src/tools", "quote-card"], or null.
function maintainedItem(f) {
  for (const folder of MAINTAINED) {
    const [id, ...rest] = f.startsWith(`${folder}/`) ? f.slice(folder.length + 1).split('/') : [];
    if (id && rest.length) return [folder, id];
  }
  return null;
}

const isInScope = (f) => (prefix && f.startsWith(prefix)) || ((m) => Boolean(m) && maintains(...m))(maintainedItem(f)) || (f === 'contributors.json' && onlyOwnEntryChanged());
const inScope = files.filter(isInScope);
const platform = files.filter((f) => !isInScope(f));

const who = key ?? (mode === '--ci' ? `unknown actor "${process.env.GITHUB_ACTOR ?? ''}"` : 'unknown contributor');
console.log(`Scope check (${who}): ${inScope.length} in scope, ${platform.length} platform.`);
if (!key) console.log('  Not in contributors.json, so every file counts as out of scope.');
for (const f of platform) console.log(`  platform: ${f}`);

if (mode === '--ci' && platform.length) process.exit(1);
process.exit(0);
