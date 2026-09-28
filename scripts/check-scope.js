// Usage:
//   node scripts/check-scope.js --staged           (pre-commit, never blocks)
//   node scripts/check-scope.js --push             (pre-push, never blocks)
//   node scripts/check-scope.js --ci <before> <after>   (CI, fails if out of scope)
import { execFileSync } from 'node:child_process';
import { resolveContributor, keyForGithub } from './resolve-contributor.js';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const lines = (s) => s.split('\n').filter(Boolean);
const [mode, before, after] = process.argv.slice(2);
const ZERO = /^0+$/;

function changedFiles() {
  if (mode === '--staged') return lines(git('diff', '--cached', '--name-only'));
  if (mode === '--push') {
    let range;
    try { range = `${git('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}')}..HEAD`; }
    catch { range = null; }
    // No upstream yet: everything not on any remote.
    return range
      ? lines(git('diff', '--name-only', range))
      : lines(git('log', '--name-only', '--pretty=format:', 'HEAD', '--not', '--remotes'));
  }
  if (mode === '--ci') {
    if (!after) { console.error('--ci needs <before> <after>'); process.exit(2); }
    if (!before || ZERO.test(before)) {
      // First push of a branch: check only the latest commit.
      return lines(git('diff-tree', '--no-commit-id', '--name-only', '-r', '--root', after));
    }
    return lines(git('diff', '--name-only', `${before}..${after}`));
  }
  console.error('Usage: check-scope.js --staged | --push | --ci <before> <after>');
  process.exit(2);
}

const files = [...new Set(changedFiles())];
const key = mode === '--ci' ? keyForGithub(process.env.GITHUB_ACTOR) : resolveContributor();
const prefix = key ? `src/prototypes/${key}/` : null;
const inScope = files.filter((f) => prefix && f.startsWith(prefix));
const platform = files.filter((f) => !(prefix && f.startsWith(prefix)));

const who = key ?? (mode === '--ci' ? `unknown actor "${process.env.GITHUB_ACTOR ?? ''}"` : 'unknown contributor');
console.log(`Scope check (${who}): ${inScope.length} in scope, ${platform.length} platform.`);
if (!key) console.log('  Not in contributors.json, so every file counts as out of scope.');
for (const f of platform) console.log(`  platform: ${f}`);

if (mode === '--ci' && platform.length) process.exit(1);
process.exit(0);
