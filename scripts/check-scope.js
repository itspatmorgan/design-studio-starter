// Usage:
//   node scripts/check-scope.js --staged           (pre-commit, never blocks)
//   node scripts/check-scope.js --push             (pre-push, never blocks)
//   node scripts/check-scope.js --ci <before> <after>   (CI, fails if out of scope)
import { changedFiles, git } from './changed-files.js';
import { resolveContributor, keyForGithub } from './resolve-contributor.js';
import { parseMaintainers } from '../src/studio/tools.ts';

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

// A tool (src/tools/<id>/) is changed by its maintainers, listed in its meta.json. The list that
// counts is the one before the change, so a change can't make its author a maintainer of someone
// else's tool. A tool that is new in the change (a prototype just published) has no earlier list,
// so its own is used.
function toolMeta(ref, id) {
  const file = `src/tools/${id}/meta.json`;
  try {
    const text = ref === null && mode === '--staged' ? git('show', `:${file}`) : git('show', `${ref ?? (mode === '--ci' ? after : 'HEAD')}:${file}`);
    return parseMaintainers(JSON.parse(text).maintainers);
  } catch { return null; }
}
const maintained = new Map();
function maintains(id) {
  if (!key) return false;
  if (!maintained.has(id)) maintained.set(id, (((baseRef && toolMeta(baseRef, id)) || toolMeta(null, id)) ?? []).includes(key));
  return maintained.get(id);
}
const toolOf = (f) => f.match(/^src\/tools\/([^/]+)\//)?.[1];

const isInScope = (f) => (prefix && f.startsWith(prefix)) || (toolOf(f) && maintains(toolOf(f))) || (f === 'contributors.json' && onlyOwnEntryChanged());
const inScope = files.filter(isInScope);
const platform = files.filter((f) => !isInScope(f));

const who = key ?? (mode === '--ci' ? `unknown actor "${process.env.GITHUB_ACTOR ?? ''}"` : 'unknown contributor');
console.log(`Scope check (${who}): ${inScope.length} in scope, ${platform.length} platform.`);
if (!key) console.log('  Not in contributors.json, so every file counts as out of scope.');
for (const f of platform) console.log(`  platform: ${f}`);

if (mode === '--ci' && platform.length) process.exit(1);
process.exit(0);
